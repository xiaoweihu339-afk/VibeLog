import { beforeEach, describe, expect, it } from "vitest";
import { createVibeRepo } from "../domain/vibe-repo";
import { LocalStorageVibeRepository, MemoryVibeRepository } from "./vibe-repository";

describe("MemoryVibeRepository", () => {
  it("saves, lists, gets, and deletes Vibe Repos", async () => {
    const repository = new MemoryVibeRepository();
    const repo = createVibeRepo({
      title: "Demo",
      oneLineVibe: "A tiny vibe repo",
      currentIdea: "Create and export a VibeLog."
    });

    await repository.save(repo);

    expect(await repository.list()).toHaveLength(1);
    expect(await repository.get(repo.id)).toMatchObject({ id: repo.id, title: "Demo" });

    await repository.delete(repo.id);

    expect(await repository.list()).toEqual([]);
    expect(await repository.get(repo.id)).toBeNull();
  });
});

describe("LocalStorageVibeRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists Vibe Repos across repository instances", async () => {
    const repo = createVibeRepo({
      title: "Demo",
      oneLineVibe: "A tiny vibe repo",
      currentIdea: "Create and export a VibeLog."
    });

    const first = new LocalStorageVibeRepository("test:vibe-repos");
    await first.save(repo);

    const second = new LocalStorageVibeRepository("test:vibe-repos");

    expect(await second.list()).toHaveLength(1);
    expect(await second.get(repo.id)).toMatchObject({ id: repo.id, title: "Demo" });
  });
});
