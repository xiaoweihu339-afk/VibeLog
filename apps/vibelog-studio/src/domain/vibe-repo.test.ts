import { describe, expect, it } from "vitest";
import { appendVibeUpdate, createVibeRepo } from "./vibe-repo";

describe("createVibeRepo", () => {
  it("creates a private core Vibe Repo with initial process sections", () => {
    const repo = createVibeRepo({
      title: "Demo",
      oneLineVibe: "A tiny vibe repo",
      currentIdea: "Create and export a VibeLog."
    });

    expect(repo.title).toBe("Demo");
    expect(repo.oneLineVibe).toBe("A tiny vibe repo");
    expect(repo.currentIdea).toBe("Create and export a VibeLog.");
    expect(repo.stage).toBe("idea");
    expect(repo.visibility).toBe("private");
    expect(repo.promptVisibility).toBe("summary");
    expect(repo.processLevel).toBe("core");
    expect(repo.ideaEvolution).toHaveLength(1);
    expect(repo.ideaEvolution[0]).toMatchObject({
      type: "initial",
      before: "none",
      after: "Create and export a VibeLog.",
      source: "user"
    });
    expect(repo.implementationStatus.nextActions).toEqual(["Define the next useful step."]);
    expect(repo.validationDesign.successCriteria).toEqual([]);
    expect(repo.handoffState.nextActions).toEqual(["Define the next useful step."]);
  });

  it("rejects an empty title or one-line vibe", () => {
    expect(() =>
      createVibeRepo({
        title: "",
        oneLineVibe: "A tiny vibe repo",
        currentIdea: "Create and export a VibeLog."
      })
    ).toThrow(/title/i);

    expect(() =>
      createVibeRepo({
        title: "Demo",
        oneLineVibe: "",
        currentIdea: "Create and export a VibeLog."
      })
    ).toThrow(/one-line vibe/i);
  });
});

describe("appendVibeUpdate", () => {
  it("appends a progress update without losing idea history", () => {
    const repo = createVibeRepo({
      title: "Demo",
      oneLineVibe: "A tiny vibe repo",
      currentIdea: "Create and export a VibeLog."
    });

    const updated = appendVibeUpdate(repo, {
      summary: "Added export design.",
      currentIdea: "Create, update, and export a VibeLog.",
      nextAction: "Implement exporters."
    });

    expect(updated.currentIdea).toBe("Create, update, and export a VibeLog.");
    expect(updated.ideaEvolution).toHaveLength(2);
    expect(updated.ideaEvolution[1]).toMatchObject({
      type: "refinement",
      before: "Create and export a VibeLog.",
      after: "Create, update, and export a VibeLog."
    });
    expect(updated.vibeProgress.at(-1)).toMatchObject({
      whatHappened: "Added export design.",
      next: ["Implement exporters."]
    });
    expect(repo.currentIdea).toBe("Create and export a VibeLog.");
  });
});
