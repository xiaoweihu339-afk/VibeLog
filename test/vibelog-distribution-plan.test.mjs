import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const planPath = "docs/distribution/vibelog-distribution-plan.json";
const englishGuidePath = "docs/guides/vibelog-installer-package-manager-plan.md";
const chineseGuidePath = "docs/guides/vibelog-installer-package-manager-plan.zh.md";

test("distribution plan keeps clone-local active and public package channels gated", async () => {
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const pkg = JSON.parse(await readFile("package.json", "utf8"));

  assert.equal(plan.schema, "vibelog-distribution-plan@0.1");
  assert.equal(plan.current_channel, "clone_local");
  assert.equal(pkg.private, true);

  const activeChannels = plan.channels.filter((channel) => channel.state === "active").map((channel) => channel.id);
  assert.deepEqual(activeChannels, ["clone_local"]);

  const npmChannel = plan.channels.find((channel) => channel.id === "npm_package");
  assert.equal(npmChannel.state, "deferred");
  assert.equal(npmChannel.human_approval_required, true);
  assert.ok(npmChannel.required_gates.includes("license_selected"));
  assert.ok(npmChannel.required_gates.includes("strong_schema_validation"));
  assert.ok(npmChannel.required_gates.includes("publish_dry_run_verified"));
  assert.ok(npmChannel.required_gates.includes("explicit_publish_approval"));

  const installerChannel = plan.channels.find((channel) => channel.id === "local_installer_scripts");
  assert.equal(installerChannel.state, "prototype_dry_run");
  assert.ok(installerChannel.required_gates.includes("dry_run_only"));
  assert.ok(installerChannel.required_gates.includes("uninstall_or_rollback_verified"));
  assert.ok(installerChannel.verified_by.includes("test/vibelog-installer-dry-run.test.mjs"));
  assert.ok(installerChannel.forbidden_actions.some((action) => action.includes("--write")));

  for (const gateId of [
    "no_push_without_explicit_approval",
    "no_publish_without_explicit_approval",
    "no_public_package_without_license",
    "no_public_package_without_schema_validation",
    "project_local_hooks_only",
    "dry_run_only"
  ]) {
    assert.ok(plan.safety_gates.some((gate) => gate.id === gateId), `Missing safety gate: ${gateId}`);
  }
});

test("installer package manager docs describe a roadmap without claiming publication", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  assert.match(english, /Clone-local/);
  assert.match(english, /Release Bundle/i);
  assert.match(english, /Local Installer Scripts/i);
  assert.match(english, /Package-manager Distribution/i);
  assert.match(english, /not published/);
  assert.match(chinese, /Clone-local/);
  assert.match(chinese, /Release Bundle/i);
  assert.match(chinese, /Local Installer Scripts/i);
  assert.match(chinese, /Package-manager Distribution/i);
  assert.match(chinese, /尚未发布/);
  assert.doesNotMatch(english, /is published to npm/i);
  assert.doesNotMatch(chinese, /已经发布到 npm/);
});
