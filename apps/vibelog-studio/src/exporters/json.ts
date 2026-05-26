import type { VibeRepo } from "../domain/vibe-repo";

export function exportVibeLogJson(repo: VibeRepo): string {
  return `${JSON.stringify(toVibeLogJson(repo), null, 2)}\n`;
}

export function toVibeLogJson(repo: VibeRepo) {
  return {
    id: repo.id,
    schema: repo.schema,
    title: repo.title,
    one_line_vibe: repo.oneLineVibe,
    stage: repo.stage,
    visibility: repo.visibility,
    code_visibility: repo.codeVisibility,
    prompt_visibility: repo.promptVisibility,
    collaboration_status: repo.collaborationStatus,
    creation_mode: repo.creationMode,
    process_level: repo.processLevel,
    tools: repo.tools,
    tags: repo.tags,
    created_at: repo.createdAt,
    updated_at: repo.updatedAt,
    current_idea: repo.currentIdea,
    idea_evolution: repo.ideaEvolution.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      type: entry.type,
      before: entry.before,
      after: entry.after,
      reason: entry.reason,
      source: entry.source,
      confidence: entry.confidence
    })),
    implementation_status: {
      current_state: repo.implementationStatus.currentState,
      completed: repo.implementationStatus.completed,
      in_progress: repo.implementationStatus.inProgress,
      pending: repo.implementationStatus.pending,
      blocked: repo.implementationStatus.blocked,
      next_actions: repo.implementationStatus.nextActions,
      important_context_for_next_agent: repo.implementationStatus.importantContextForNextAgent
    },
    validation_design: {
      success_criteria: repo.validationDesign.successCriteria,
      core_user_paths: repo.validationDesign.coreUserPaths,
      manual_test_steps: repo.validationDesign.manualTestSteps,
      automated_test_strategy: repo.validationDesign.automatedTestStrategy,
      edge_cases: repo.validationDesign.edgeCases,
      regression_points: repo.validationDesign.regressionPoints,
      risks_safety_privacy: repo.validationDesign.risksSafetyPrivacy,
      owner: repo.validationDesign.owner
    },
    handoff_state: {
      current_state: repo.handoffState.currentState,
      completed: repo.handoffState.completed,
      in_progress: repo.handoffState.inProgress,
      pending: repo.handoffState.pending,
      blockers: repo.handoffState.blockers,
      next_actions: repo.handoffState.nextActions,
      context_for_next_agent: repo.handoffState.contextForNextAgent
    },
    vibe_progress: repo.vibeProgress.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      stage: entry.stage,
      what_happened: entry.whatHappened,
      tools_used: entry.toolsUsed,
      problems: entry.problems,
      next: entry.next,
      source: entry.source,
      confidence: entry.confidence
    })),
    public_summary: repo.publicSummary
  };
}
