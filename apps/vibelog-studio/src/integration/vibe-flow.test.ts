import { describe, expect, it } from "vitest";
import { appendVibeUpdate, createVibeRepo } from "../domain/vibe-repo";
import { exportVibeLogJson } from "../exporters/json";
import { exportVibeLogMarkdown } from "../exporters/markdown";
import { MemoryVibeRepository } from "../repository/vibe-repository";

describe("VibeLog Studio core flow", () => {
  it("creates, stores, updates, and exports a Vibe Repo", async () => {
    const repository = new MemoryVibeRepository();
    const repo = createVibeRepo({
      title: "Demo",
      oneLineVibe: "A tiny vibe repo",
      currentIdea: "Create and export a VibeLog."
    });

    await repository.save(repo);
    const stored = await repository.get(repo.id);
    expect(stored).not.toBeNull();

    const updated = appendVibeUpdate(stored!, {
      summary: "Added update flow.",
      currentIdea: "Create, update, and export a VibeLog.",
      nextAction: "Build the UI."
    });
    await repository.save(updated);

    const markdown = exportVibeLogMarkdown(updated);
    const json = exportVibeLogJson(updated);
    const parsed = JSON.parse(json);

    expect(markdown).toContain("Added update flow.");
    expect(markdown).toContain("Build the UI.");
    expect(parsed.current_idea).toBe("Create, update, and export a VibeLog.");
    expect(parsed.idea_evolution).toHaveLength(2);
    expect(parsed.vibe_progress).toHaveLength(1);
    expect((await repository.list())[0].id).toBe(repo.id);
  });
});
