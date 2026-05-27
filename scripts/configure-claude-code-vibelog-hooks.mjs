import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOOK_EVENTS = ["UserPromptSubmit", "PostToolUse", "Stop"];

export async function configureClaudeCodeVibeLogHooks({
  projectPath = process.cwd(),
  adapterPath = resolve("scripts/claude-code-hook-adapter.mjs"),
  write = false,
  allowMissingLog = false,
  eventMode = "direct"
} = {}) {
  const generated = await buildHookSettings({ projectPath, adapterPath, eventMode });
  const existingSettings = await readExistingSettings(generated.settingsPath);
  const mergedSettings = mergeHookSettings(existingSettings, generated.generatedSettings);
  const warnings = [];
  const vibeLogExists = await exists(generated.vibeLogPath);

  if (!vibeLogExists) {
    warnings.push(`Missing vibe-log.md at ${generated.vibeLogPath}`);
  }

  if (write && !vibeLogExists && !allowMissingLog) {
    throw new Error(`Cannot write Claude Code VibeLog hooks because vibe-log.md is missing: ${generated.vibeLogPath}`);
  }

  let wrote = false;
  if (write) {
    await mkdir(dirname(generated.settingsPath), { recursive: true });
    await writeFile(generated.settingsPath, `${JSON.stringify(mergedSettings, null, 2)}\n`, "utf8");
    wrote = true;
  }

  return {
    projectPath: generated.projectPath,
    settingsPath: generated.settingsPath,
    vibeLogPath: generated.vibeLogPath,
    adapterPath: generated.adapterPath,
    dryRun: !write,
    wrote,
    ready: vibeLogExists || allowMissingLog,
    warnings,
    generatedSettings: generated.generatedSettings,
    mergedSettings,
    eventMode: generated.eventMode
  };
}

export async function buildHookSettings({
  projectPath = process.cwd(),
  adapterPath = resolve("scripts/claude-code-hook-adapter.mjs"),
  eventMode = "direct"
} = {}) {
  const resolvedProject = resolve(projectPath);
  rejectGlobalClaudePath(resolvedProject);
  const normalizedEventMode = normalizeEventMode(eventMode);

  const resolvedAdapter = resolve(adapterPath);
  const settingsPath = join(resolvedProject, ".claude", "settings.json");
  const projectVar = process.platform === "win32" ? "$env:CLAUDE_PROJECT_DIR" : "$CLAUDE_PROJECT_DIR";
  const command = buildAdapterCommand({
    adapterPath: resolvedAdapter,
    projectVar,
    eventMode: normalizedEventMode
  });

  const hook = {
    type: "command",
    ...(process.platform === "win32" ? { shell: "powershell" } : {}),
    command
  };

  const hooks = {};
  for (const eventName of HOOK_EVENTS) {
    hooks[eventName] = [{ matcher: "", hooks: [hook] }];
  }

  return {
    projectPath: resolvedProject,
    adapterPath: resolvedAdapter,
    eventMode: normalizedEventMode,
    settingsPath,
    vibeLogPath: join(resolvedProject, "vibe-log.md"),
    generatedSettings: { hooks }
  };
}

export function parseArgs(argv) {
  const options = {
    projectPath: process.cwd(),
    adapterPath: resolve("scripts/claude-code-hook-adapter.mjs"),
    write: false,
    allowMissingLog: false,
    eventMode: "direct"
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--project") {
      options.projectPath = args.shift() ?? "";
    } else if (arg === "--adapter") {
      options.adapterPath = args.shift() ?? "";
    } else if (arg === "--write") {
      options.write = true;
    } else if (arg === "--dry-run") {
      options.write = false;
    } else if (arg === "--allow-missing-log") {
      options.allowMissingLog = true;
    } else if (arg === "--event-mode") {
      options.eventMode = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.projectPath) throw new Error("--project requires a path");
  if (!options.adapterPath) throw new Error("--adapter requires a path");
  if (!options.eventMode) throw new Error("--event-mode requires a value");
  options.eventMode = normalizeEventMode(options.eventMode);
  return options;
}

function buildAdapterCommand({ adapterPath, projectVar, eventMode }) {
  const args = ["node", quotePath(adapterPath)];

  if (eventMode === "stream") {
    args.push("--event-stream", quotePath(`${projectVar}/.vibelog-events/session.jsonl`));
    return args.join(" ");
  }

  args.push(
    "--log",
    quotePath(`${projectVar}/vibe-log.md`),
    "--json",
    quotePath(`${projectVar}/vibe-log.json`),
    "--event-dir",
    quotePath(`${projectVar}/.vibelog-events`)
  );
  return args.join(" ");
}

function normalizeEventMode(eventMode) {
  if (eventMode === "direct" || eventMode === "stream") return eventMode;
  throw new Error(`Unsupported Claude Code VibeLog hook event mode: ${eventMode}`);
}

function mergeHookSettings(existingSettings, generatedSettings) {
  const merged = structuredClone(existingSettings ?? {});
  const existingHooks = isPlainObject(merged.hooks) ? merged.hooks : {};
  merged.hooks = existingHooks;

  for (const eventName of HOOK_EVENTS) {
    const existingGroups = Array.isArray(existingHooks[eventName]) ? existingHooks[eventName] : [];
    const generatedGroups = generatedSettings.hooks[eventName];
    const existingCommands = new Set(
      existingGroups.flatMap((group) => Array.isArray(group?.hooks) ? group.hooks : [])
        .map((hook) => hook?.command)
        .filter(Boolean)
    );

    const groupsToAdd = [];
    for (const group of generatedGroups) {
      const hooksToAdd = group.hooks.filter((hook) => !existingCommands.has(hook.command));
      if (hooksToAdd.length > 0) {
        groupsToAdd.push({ matcher: group.matcher, hooks: hooksToAdd });
        for (const hook of hooksToAdd) existingCommands.add(hook.command);
      }
    }

    merged.hooks[eventName] = [...existingGroups, ...groupsToAdd];
  }

  return merged;
}

async function readExistingSettings(settingsPath) {
  if (!(await exists(settingsPath))) return {};

  try {
    return JSON.parse(await readFile(settingsPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not parse existing Claude settings JSON at ${settingsPath}: ${error.message}`);
  }
}

function rejectGlobalClaudePath(projectPath) {
  const globalClaude = resolve(homedir(), ".claude").toLowerCase();
  const normalized = resolve(projectPath).toLowerCase();
  if (normalized === globalClaude || normalized.startsWith(`${globalClaude.toLowerCase()}\\`) || normalized.startsWith(`${globalClaude.toLowerCase()}/`)) {
    throw new Error(`Refusing to configure global Claude settings path: ${projectPath}`);
  }
}

function quotePath(path) {
  const normalized = String(path);
  return /\s/u.test(normalized) ? `"${normalized.replace(/"/gu, '\\"')}"` : normalized;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await configureClaudeCodeVibeLogHooks(options);
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === pathToFileURL(fileURLToPath(import.meta.url)).href) {
  const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
  if (import.meta.url === invokedPath) {
    main().catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}
