import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const textSections = new Map([
  ["One-Line Vibe", "one_line_vibe"],
  ["Current Idea", "current_idea"],
  ["Public Summary", "public_summary"]
]);

const entrySections = new Map([
  ["Idea Evolution", "idea_evolution"],
  ["Decisions", "decisions"],
  ["Human-in-the-Loop", "human_in_the_loop"],
  ["Verification Evidence", "verification_evidence"],
  ["Artifact Index", "artifact_index"],
  ["Execution Prompts", "execution_prompts"],
  ["Development Log", "development_log"],
  ["Bugfix / Incident Log", "bugfix_incident_log"],
  ["Vibe Progress", "vibe_progress"]
]);

const objectSections = new Map([
  ["Implementation Status", "implementation_status"],
  ["Validation Design", "validation_design"],
  ["Project Context", "project_context"],
  ["Handoff State", "handoff_state"]
]);

const bulletObjectSections = new Map([
  ["Vibe Intake", "vibe_intake"],
  ["Idea Expansion", "idea_expansion"],
  ["Public / Private Projection", "public_private_projection"],
  ["Branch / Remix Readiness", "branch_remix_readiness"]
]);

const arrayFields = new Set([
  "files_changed",
  "artifacts_changed",
  "follow_up",
  "tools_used",
  "completed",
  "in_progress",
  "pending",
  "blocked",
  "blockers",
  "next_actions",
  "context_for_next_agent",
  "important_files",
  "run_test_commands",
  "known_issues",
  "do_not_change",
  "success_criteria",
  "core_user_paths",
  "manual_test_steps",
  "edge_cases",
  "regression_points",
  "risks_safety_privacy"
]);

export function parseVibeLogMarkdown(markdown) {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const sections = splitTopLevelSections(body);
  const data = { ...frontmatter };

  for (const [sectionName, fieldName] of textSections) {
    const content = sections.get(sectionName);
    if (content !== undefined) data[fieldName] = cleanText(content);
  }

  for (const [sectionName, fieldName] of entrySections) {
    const content = sections.get(sectionName);
    if (content !== undefined) {
      data[fieldName] = parseEntrySection(content, sectionName);
    }
  }

  for (const [sectionName, fieldName] of objectSections) {
    const content = sections.get(sectionName);
    if (content !== undefined) data[fieldName] = parseSubheadingObject(content);
  }

  for (const [sectionName, fieldName] of bulletObjectSections) {
    const content = sections.get(sectionName);
    if (content !== undefined) data[fieldName] = parseBulletObject(content);
  }

  if (!Array.isArray(data.open_questions)) {
    data.open_questions = parseBulletList(sections.get("Open Questions") ?? "");
  }

  if (!Array.isArray(data.code_repositories)) {
    data.code_repositories = parseCodeRepositories(sections.get("Code Repositories") ?? "");
  }

  return data;
}

export async function exportVibeLogFile(inputPath = "vibe-log.md", outputPath = "vibe-log.json") {
  const markdown = await readFile(inputPath, "utf8");
  const data = parseVibeLogMarkdown(markdown);
  const json = stableJson(data);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, json, "utf8");
  return data;
}

export async function isSameJsonFile(inputPath = "vibe-log.md", outputPath = "vibe-log.json") {
  const markdown = await readFile(inputPath, "utf8");
  const generated = stableJson(parseVibeLogMarkdown(markdown));

  let existing;
  try {
    existing = stableJson(JSON.parse(await readFile(outputPath, "utf8")));
  } catch {
    return false;
  }

  return generated === existing;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error("Missing VibeLog frontmatter");
  }

  return {
    frontmatter: parseFrontmatterBlock(match[1]),
    body: markdown.slice(match[0].length)
  };
}

function parseFrontmatterBlock(block) {
  const result = {};
  let currentArrayKey = null;

  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const arrayItem = line.match(/^-\s+(.*)$/);
    if (arrayItem && currentArrayKey) {
      result[currentArrayKey].push(stripQuotes(arrayItem[1]));
      continue;
    }

    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;

    const key = snakeCase(match[1]);
    const value = match[2];

    if (value.trim() === "") {
      result[key] = [];
      currentArrayKey = key;
      continue;
    }

    result[key] = parseScalar(value);
    currentArrayKey = null;
  }

  return result;
}

function parseScalar(value) {
  const trimmed = value.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];

    return splitInlineArray(inner).map(stripQuotes);
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  return stripQuotes(trimmed);
}

function splitInlineArray(value) {
  const parts = [];
  let current = "";
  let quote = null;

  for (const char of value) {
    if ((char === "\"" || char === "'") && quote === null) {
      quote = char;
      current += char;
      continue;
    }

    if (char === quote) {
      quote = null;
      current += char;
      continue;
    }

    if (char === "," && quote === null) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function splitTopLevelSections(body) {
  const sections = new Map();
  const lines = body.split(/\r?\n/);
  let current = null;
  let buffer = [];

  for (const line of lines) {
    const match = line.match(/^## (.+?)\s*$/);
    if (match) {
      if (current) sections.set(current, buffer.join("\n").trim());
      current = match[1].trim();
      buffer = [];
      continue;
    }

    if (current) buffer.push(line);
  }

  if (current) sections.set(current, buffer.join("\n").trim());
  return sections;
}

function parseEntrySection(content, sectionName) {
  const chunks = splitThirdLevelEntries(content);
  return chunks.map(({ heading, content: entryContent }) => {
    const fields = parseBoldFields(entryContent);
    const entry = { ...fields };

    if (sectionName === "Artifact Index") {
      entry.name = heading;
    } else if (/^\d{4}-\d{2}-\d{2}/.test(heading)) {
      entry.timestamp = heading;
    } else {
      entry.heading = heading;
    }

    return normalizeEntry(entry);
  });
}

function splitThirdLevelEntries(content) {
  const lines = content.split(/\r?\n/);
  const entries = [];
  let heading = null;
  let buffer = [];

  for (const line of lines) {
    const match = line.match(/^### (.+?)\s*$/);
    if (match) {
      if (heading) entries.push({ heading, content: buffer.join("\n").trim() });
      heading = match[1].trim();
      buffer = [];
      continue;
    }

    if (heading) buffer.push(line);
  }

  if (heading) entries.push({ heading, content: buffer.join("\n").trim() });
  return entries;
}

function parseBoldFields(content) {
  const fields = {};
  const lines = content.split(/\r?\n/);
  let currentKey = null;
  let currentValue = [];

  const flush = () => {
    if (!currentKey) return;
    fields[currentKey] = coerceFieldValue(currentKey, currentValue.join("\n"));
  };

  for (const line of lines) {
    const match = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (match) {
      flush();
      currentKey = snakeCase(match[1]);
      currentValue = [match[2]];
      continue;
    }

    if (currentKey) currentValue.push(line);
  }

  flush();
  return fields;
}

function normalizeEntry(entry) {
  if (entry.agent_tool !== undefined) {
    entry.agent_or_tool = entry.agent_tool;
    delete entry.agent_tool;
  }

  if (entry.why_it_mattered !== undefined) {
    entry.why_it_mattered = entry.why_it_mattered;
  }

  return entry;
}

function parseSubheadingObject(content) {
  const chunks = splitThirdLevelEntries(content);
  const result = {};

  for (const { heading, content: chunkContent } of chunks) {
    const key = snakeCase(heading);
    result[key] = parseSubheadingValue(key, chunkContent);
  }

  return result;
}

function parseSubheadingValue(key, content) {
  const bullets = parseBulletList(content);
  const text = cleanText(content);

  if (arrayFields.has(key)) return bullets.length > 0 ? bullets : [];
  if (bullets.length > 0 && bullets.join("\n") === text.replace(/^- /gm, "").trim()) {
    return bullets;
  }

  return text;
}

function parseBulletObject(content) {
  const result = {};

  for (const item of parseBulletList(content)) {
    const match = item.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    result[snakeCase(match[1])] = coerceInlineList(match[2]);
  }

  return result;
}

function parseCodeRepositories(content) {
  const chunks = splitThirdLevelEntries(content);
  return chunks.map(({ heading, content: chunkContent }) => ({
    name: heading,
    ...parseBulletObject(chunkContent)
  }));
}

function parseBulletList(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function coerceFieldValue(key, value) {
  const cleaned = cleanText(value);

  if (arrayFields.has(key)) {
    const bullets = parseBulletList(value);
    if (bullets.length > 0) return bullets;

    const backtickValues = [...cleaned.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    if (backtickValues.length > 0) return backtickValues;

    if (cleaned.includes(",")) return cleaned.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return cleaned;
}

function coerceInlineList(value) {
  const cleaned = value.trim();
  if (!cleaned.includes(",")) return cleaned;
  return cleaned.split(",").map((item) => item.trim()).filter(Boolean);
}

function cleanText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function snakeCase(value) {
  return value
    .trim()
    .replace(/\s*\/\s*/g, " ")
    .replace(/-/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function stableJson(data) {
  return `${JSON.stringify(sortObject(data), null, 2)}\n`;
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, sortObject(child)])
  );
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    inputPath: "vibe-log.md",
    outputPath: "vibe-log.json",
    check: false
  };

  if (args[0] && !args[0].startsWith("--")) {
    options.inputPath = args.shift();
  }

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--out") {
      options.outputPath = args.shift() ?? "";
    } else if (arg === "--check") {
      options.check = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.outputPath) throw new Error("--out requires a path");
  return options;
}

async function main() {
  const { inputPath, outputPath, check } = parseArgs(process.argv.slice(2));
  const resolvedInput = resolve(inputPath);
  const resolvedOutput = resolve(outputPath);

  if (check) {
    const same = await isSameJsonFile(resolvedInput, resolvedOutput);
    if (!same) {
      console.error(`VibeLog JSON drift detected: ${outputPath}`);
      process.exitCode = 1;
      return;
    }

    console.log(`VibeLog JSON is up to date: ${outputPath}`);
    return;
  }

  await exportVibeLogFile(resolvedInput, resolvedOutput);
  console.log(`Wrote ${outputPath}`);
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
