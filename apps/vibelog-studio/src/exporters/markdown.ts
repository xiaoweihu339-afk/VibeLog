import type { ImplementationStatus, ValidationDesign, VibeRepo } from "../domain/vibe-repo";

export function exportVibeLogMarkdown(repo: VibeRepo): string {
  return `---
schema: ${repo.schema}
title: "${escapeYaml(repo.title)}"
one_line_vibe: "${escapeYaml(repo.oneLineVibe)}"
stage: ${repo.stage}
visibility: ${repo.visibility}
code_visibility: ${repo.codeVisibility}
prompt_visibility: ${repo.promptVisibility}
collaboration_status: ${repo.collaborationStatus}
creation_mode: ${repo.creationMode}
process_level: ${repo.processLevel}
tools: ${JSON.stringify(repo.tools)}
tags: ${JSON.stringify(repo.tags)}
created_at: "${repo.createdAt}"
updated_at: "${repo.updatedAt}"
---

# VibeLog

## One-Line Vibe

${repo.oneLineVibe}

## Creation Mode

**Mode:** ${repo.creationMode}

## Current Idea

${repo.currentIdea}

## Idea Evolution

${repo.ideaEvolution.map((entry) => `### ${entry.timestamp}

**Type:** ${entry.type}

**Before:** ${entry.before}

**After:** ${entry.after}

**Reason:** ${entry.reason}

**Source:** ${entry.source}

**Confidence:** ${entry.confidence}`).join("\n\n")}

## Implementation Status

${formatImplementationStatus(repo.implementationStatus)}

## Validation Design

${formatValidationDesign(repo.validationDesign)}

## Handoff State

### Current State

${repo.handoffState.currentState}

### Next Actions

${formatList(repo.handoffState.nextActions)}

## Vibe Progress

${repo.vibeProgress.length ? repo.vibeProgress.map((entry) => `### ${entry.timestamp}

**Stage:** ${entry.stage}

**What Happened:** ${entry.whatHappened}

**Next:** ${entry.next.join(", ") || "none"}`).join("\n\n") : "No progress entries yet."}

## Public Summary

${repo.publicSummary}
`;
}

function formatImplementationStatus(status: ImplementationStatus): string {
  return `### Current State

${status.currentState}

### Completed

${formatList(status.completed)}

### In Progress

${formatList(status.inProgress)}

### Pending

${formatList(status.pending)}

### Blocked

${formatList(status.blocked)}

### Next Actions

${formatList(status.nextActions)}`;
}

function formatValidationDesign(validation: ValidationDesign): string {
  return `### Success Criteria

${formatList(validation.successCriteria)}

### Core User Paths

${formatList(validation.coreUserPaths)}

### Manual Test Steps

${formatList(validation.manualTestSteps)}

### Automated Test Strategy

${validation.automatedTestStrategy || "Not defined yet."}

### Edge Cases

${formatList(validation.edgeCases)}

### Regression Points

${formatList(validation.regressionPoints)}`;
}

function formatList(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function escapeYaml(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
