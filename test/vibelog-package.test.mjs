import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const npmRunVibeLogHelp = process.platform === "win32"
  ? { file: "cmd.exe", args: ["/d", "/s", "/c", "npm", "run", "vibelog", "--", "--help"] }
  : { file: "npm", args: ["run", "vibelog", "--", "--help"] };
const npmRunVibeLogInstallHelp = process.platform === "win32"
  ? { file: "cmd.exe", args: ["/d", "/s", "/c", "npm", "run", "vibelog:install", "--", "--help"] }
  : { file: "npm", args: ["run", "vibelog:install", "--", "--help"] };
const npmRunVibeLogRollbackHelp = process.platform === "win32"
  ? { file: "cmd.exe", args: ["/d", "/s", "/c", "npm", "run", "vibelog:verify-installer-rollback", "--", "--help"] }
  : { file: "npm", args: ["run", "vibelog:verify-installer-rollback", "--", "--help"] };

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
  assert.equal(pkg.bin["vibelog-install"], "./scripts/vibelog-install.mjs");
  assert.equal(pkg.bin["vibelog-project"], "./scripts/vibelog-project.mjs");
  assert.equal(pkg.bin["vibelog-verify-installer-rollback"], "./scripts/verify-installer-rollback.mjs");
  assert.equal(pkg.scripts.test, "node --test");
  assert.equal(pkg.scripts.vibelog, "node scripts/vibelog-project.mjs");
  assert.equal(pkg.scripts["vibelog:install"], "node scripts/vibelog-install.mjs");
  assert.equal(pkg.scripts["vibelog:verify-installer-rollback"], "node scripts/verify-installer-rollback.mjs");
  assert.equal(await exists("scripts/vibelog-install.mjs"), true);
  assert.equal(await exists("scripts/vibelog-project.mjs"), true);
  assert.equal(await exists("scripts/verify-installer-rollback.mjs"), true);

  const installer = await readFile("scripts/vibelog-install.mjs", "utf8");
  const cli = await readFile("scripts/vibelog-project.mjs", "utf8");
  const rollbackVerifier = await readFile("scripts/verify-installer-rollback.mjs", "utf8");
  assert.match(installer.split(/\r?\n/u)[0], /^#!.*node/);
  assert.match(cli.split(/\r?\n/u)[0], /^#!.*node/);
  assert.match(rollbackVerifier.split(/\r?\n/u)[0], /^#!.*node/);
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

  const install = await execFileAsync(process.execPath, ["scripts/vibelog-install.mjs", "--help"], {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  assert.match(install.stdout, /vibelog-install/);
  assert.match(install.stdout, /dry-run/i);

  const npmInstall = await execFileAsync(npmRunVibeLogInstallHelp.file, npmRunVibeLogInstallHelp.args, {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  assert.match(npmInstall.stdout, /vibelog-install/);
  assert.match(npmInstall.stdout, /--target/);

  const rollback = await execFileAsync(process.execPath, ["scripts/verify-installer-rollback.mjs", "--help"], {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  assert.match(rollback.stdout, /verify-installer-rollback/);
  assert.match(rollback.stdout, /scratch-only/i);

  const npmRollback = await execFileAsync(npmRunVibeLogRollbackHelp.file, npmRunVibeLogRollbackHelp.args, {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  assert.match(npmRollback.stdout, /verify-installer-rollback/);
  assert.match(npmRollback.stdout, /--scratch-root/);
});
