import { describe, expect, it } from "vitest";
import { createVibeRepo } from "../domain/vibe-repo";
import { exportVibeLogJson } from "./json";

describe("exportVibeLogJson", () => {
  it("exports parseable JSON with the same core repo identity", () => {
    const repo = createVibeRepo({
      title: "Demo",
      oneLineVibe: "A tiny vibe repo",
      currentIdea: "Create and export a VibeLog."
    });

    const json = exportVibeLogJson(repo);
    const parsed = JSON.parse(json);

    expect(parsed).toMatchObject({
      id: repo.id,
      schema: "vibelog@0.2-draft",
      title: "Demo",
      one_line_vibe: "A tiny vibe repo",
      current_idea: "Create and export a VibeLog."
    });
    expect(parsed.implementation_status.next_actions).toEqual(["Define the next useful step."]);
    expect(parsed.validation_design.success_criteria).toEqual([]);
    expect(parsed.handoff_state.next_actions).toEqual(["Define the next useful step."]);
  });
});
