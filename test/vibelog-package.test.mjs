import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const npmRunVibeLogHelp = process.platform === "win32"
  ? { file: "cmd.exe", args: ["/d", "/s", "/c", "npm", "run", "vibelog", "--", "--help"] }
  : { file: "npm", args: ["run", "vibelog", "--", "--help"] };

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("package metadata exposes the VibeLog project CLI as a private local bin", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));

  assert.equal(pkg.private, true);
  assert.equal(pkg.type, "module");
  assert.equal(pkg.bin["vibelog-project"], "./scripts/vibelog-project.mjs");
  assert.equal(pkg.scripts.test, "node --test");
  assert.equal(pkg.scripts.vibelog, "node scripts/vibelog-project.mjs");
  assert.equal(await exists("scripts/vibelog-project.mjs"), true);

  const cli = await readFile("scripts/vibelog-project.mjs", "utf8");
  assert.match(cli.split(/\r?\n/u)[0], /^#!.*node/);
});

test("vibelog-project help works through direct node and npm script entrypoints", async () => {
  const direct = await execFileAsync(process.execPath, ["scripts/vibelog-project.mjs", "--help"], {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  assert.match(direct.stdout, /vibelog-project/);
  assert.match(direct.stdout, /init/);
  assert.match(direct.stdout, /enable-hooks/);
  assert.match(direct.stdout, /project-local/);

  const npm = await execFileAsync(npmRunVibeLogHelp.file, npmRunVibeLogHelp.args, {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  assert.match(npm.stdout, /vibelog-project/);
  assert.match(npm.stdout, /disable-hooks/);
});
