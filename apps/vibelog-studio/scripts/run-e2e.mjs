import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npm = isWindows ? "npm.cmd" : "npm";
const useShell = isWindows;
const port = 3100;
const baseUrl = `http://127.0.0.1:${port}`;

await killPort(port);

const server = spawn(npm, ["run", "start:e2e"], {
  stdio: "inherit",
  shell: useShell,
  detached: !isWindows
});

try {
  await waitForHttp(baseUrl, 120000);
  const status = await run(npm, ["exec", "playwright", "test"]);
  process.exitCode = status;
} finally {
  await killProcessTree(server.pid);
  await killPort(port);
}

async function waitForHttp(url, timeoutMs) {
  const startedAt = Date.now();
  let lastError = "";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError}`);
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: useShell
    });

    child.on("exit", (code) => resolve(code ?? 1));
  });
}

function runQuiet(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "ignore",
      shell: false
    });

    child.on("error", () => resolve(1));
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function killPort(targetPort) {
  if (isWindows) {
    const command = [
      "$owners = Get-NetTCPConnection",
      "-LocalAddress 127.0.0.1",
      `-LocalPort ${targetPort}`,
      "-ErrorAction SilentlyContinue",
      "| Where-Object { $_.OwningProcess -ne 0 }",
      "| Select-Object -ExpandProperty OwningProcess -Unique;",
      "foreach ($owner in $owners) {",
      "Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue",
      "}"
    ].join(" ");

    await runQuiet("powershell.exe", ["-NoProfile", "-Command", command]);
    return;
  }

  await runQuiet("sh", [
    "-c",
    `lsof -ti tcp:${targetPort} | xargs -r kill -TERM`
  ]);
}

async function killProcessTree(pid) {
  if (!pid) {
    return;
  }

  if (isWindows) {
    await runQuiet("taskkill.exe", ["/PID", String(pid), "/T", "/F"]);
    return;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    await runQuiet("kill", ["-TERM", String(pid)]);
  }
}
