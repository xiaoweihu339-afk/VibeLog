import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const defaultSchema = JSON.parse(
  readFileSync(new URL("../skills/vibelog/assets/vibe-log.schema.json", import.meta.url), "utf8")
);

const requiredStringFields = [
  "schema",
  "title",
  "one_line_vibe",
  "stage",
  "current_idea"
];

const knownSchemas = new Set(["vibelog@0.1", "vibelog@0.2-draft"]);
const knownStages = new Set([
  "idea",
  "brief",
  "prototype",
  "mvp",
  "beta",
  "shipped",
  "paused",
  "abandoned"
]);
const knownRecordingModes = new Set(["exact", "redacted", "reconstructed", "summary_only"]);

const arrayFields = [
  "idea_evolution",
  "human_in_the_loop",
  "execution_prompts",
  "development_log",
  "verification_evidence"
];

export function validateVibeLog(data, options = {}) {
  const errors = [];

  if (!isPlainObject(data)) {
    return {
      valid: false,
      errors: ["VibeLog root must be an object"]
    };
  }

  validateSchemaValue(data, options.schema ?? defaultSchema, "", errors);

  for (const field of requiredStringFields) {
    if (!hasNonEmptyString(data[field])) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (hasNonEmptyString(data.schema) && !knownSchemas.has(data.schema)) {
    errors.push(`Invalid schema: expected ${[...knownSchemas].join(" or ")}`);
  }

  if (hasNonEmptyString(data.stage) && !knownStages.has(data.stage)) {
    errors.push(`Invalid stage: ${data.stage}`);
  }

  for (const field of arrayFields) {
    if (data[field] === undefined) continue;
    if (!Array.isArray(data[field])) {
      errors.push(`Invalid ${field}: expected array`);
      continue;
    }

    data[field].forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        errors.push(`Invalid ${field}[${index}]: expected object`);
      }
    });
  }

  validateExecutionPrompts(data.execution_prompts, errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateSchemaValue(value, schema, path = "", errors = []) {
  if (!schema || typeof schema !== "object") return errors;

  const expectedTypes = normalizeTypes(schema.type);
  if (expectedTypes.length > 0 && !expectedTypes.some((type) => matchesType(value, type))) {
    errors.push(`Invalid ${formatPath(path)}: expected ${expectedTypes.join(" or ")}`);
    return errors;
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((allowed) => allowed === value)) {
    errors.push(`Invalid ${formatPath(path)}: expected one of ${formatEnum(schema.enum)}`);
    return errors;
  }

  if (isPlainObject(value)) {
    validateObjectSchema(value, schema, path, errors);
  } else if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => {
      validateSchemaValue(item, schema.items, `${path}[${index}]`, errors);
    });
  }

  return errors;
}

function validateObjectSchema(value, schema, path, errors) {
  const properties = schema.properties ?? {};

  for (const field of schema.required ?? []) {
    if (value[field] === undefined) {
      errors.push(`Missing required field: ${joinPath(path, field)}`);
    }
  }

  if (schema.additionalProperties === false) {
    for (const field of Object.keys(value)) {
      if (properties[field] === undefined) {
        errors.push(`Unexpected field: ${joinPath(path, field)}`);
      }
    }
  }

  for (const [field, fieldSchema] of Object.entries(properties)) {
    if (value[field] !== undefined) {
      validateSchemaValue(value[field], fieldSchema, joinPath(path, field), errors);
    }
  }
}

function validateExecutionPrompts(prompts, errors) {
  if (!Array.isArray(prompts)) return;

  prompts.forEach((prompt, index) => {
    if (!isPlainObject(prompt)) return;

    if (
      prompt.recording_mode !== undefined &&
      !knownRecordingModes.has(prompt.recording_mode)
    ) {
      errors.push(
        `Invalid execution_prompts[${index}].recording_mode: expected exact, redacted, reconstructed, or summary_only`
      );
    }

    for (const field of ["prompt_summary", "prompt_text"]) {
      if (prompt[field] !== undefined && !hasNonEmptyString(prompt[field])) {
        errors.push(`Invalid execution_prompts[${index}].${field}: expected non-empty string`);
      }
    }
  });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeTypes(type) {
  if (Array.isArray(type)) return type;
  if (typeof type === "string") return [type];
  return [];
}

function matchesType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "object") return isPlainObject(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "null") return value === null;
  return typeof value === type;
}

function formatPath(path) {
  return path || "VibeLog root";
}

function joinPath(path, field) {
  return path ? `${path}.${field}` : field;
}

function formatEnum(values) {
  return values.map((value) => JSON.stringify(value)).join(", ");
}

async function main() {
  const inputPath = process.argv[2] ?? "vibe-log.json";
  const resolvedInput = resolve(inputPath);
  const data = JSON.parse(await readFile(resolvedInput, "utf8"));
  const result = validateVibeLog(data);

  if (!result.valid) {
    console.error(`VibeLog validation failed: ${inputPath}`);
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`VibeLog validation passed: ${inputPath}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
