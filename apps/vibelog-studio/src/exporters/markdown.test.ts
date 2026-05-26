import { describe, expect, it } from "vitest";
import { createVibeRepo } from "../domain/vibe-repo";
import { exportVibeLogMarkdown } from "./markdown";

describe("exportVibeLogMarkdown", () => {
  it("exports a Vibe Repo with the core human-readable sections", () => {
    const repo = createVibeRepo({
      title: "Demo",
      oneLineVibe: "A tiny vibe repo",
      currentIdea: "Create and export a VibeLog."
    });

    const markdown = exportVibeLogMarkdown(repo);

    expect(markdown).toContain("schema: vibelog@0.2-draft");
    expect(markdown).toContain('title: "Demo"');
    expect(markdown).toContain("# VibeLog");
    expect(markdown).toContain("## One-Line Vibe");
    expect(markdown).toContain("A tiny vibe repo");
    expect(markdown).toContain("## Current Idea");
    expect(markdown).toContain("Create and export a VibeLog.");
    expect(markdown).toContain("## Idea Evolution");
    expect(markdown).toContain("## Implementation Status");
    expect(markdown).toContain("## Validation Design");
    expect(markdown).toContain("## Handoff State");
    expect(markdown).toContain("## Public Summary");
  });
});
