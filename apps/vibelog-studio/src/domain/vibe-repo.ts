import { z } from "zod";

export const createVibeRepoInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  oneLineVibe: z.string().trim().min(1, "One-line vibe is required."),
  currentIdea: z.string().trim().min(1, "Current idea is required.")
});

export type CreateVibeRepoInput = z.infer<typeof createVibeRepoInputSchema>;

export type Stage = "idea" | "brief" | "prototype" | "mvp" | "beta" | "shipped" | "paused" | "abandoned";
export type Visibility = "private" | "public_idea" | "public_progress" | "public_product";
export type PromptVisibility = "hidden" | "summary" | "full";
export type ProcessLevel = "minimal" | "core" | "full";
export type CreationMode =
  | "human_led_ai_assisted"
  | "human_ai_co_created"
  | "agent_led_human_approved"
  | "fully_agent_built"
  | "multi_human_multi_agent"
  | "unknown";

export interface IdeaEvolutionEntry {
  id: string;
  timestamp: string;
  type: "initial" | "expansion" | "pivot" | "refinement" | "removal" | "scope_change";
  before: string;
  after: string;
  reason: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

export interface ImplementationStatus {
  currentState: string;
  completed: string[];
  inProgress: string[];
  pending: string[];
  blocked: string[];
  nextActions: string[];
  importantContextForNextAgent: string[];
}

export interface ValidationDesign {
  successCriteria: string[];
  coreUserPaths: string[];
  manualTestSteps: string[];
  automatedTestStrategy: string;
  edgeCases: string[];
  regressionPoints: string[];
  risksSafetyPrivacy: string[];
  owner: string;
}

export interface HandoffState {
  currentState: string;
  completed: string[];
  inProgress: string[];
  pending: string[];
  blockers: string[];
  nextActions: string[];
  contextForNextAgent: string[];
}

export interface VibeProgressEntry {
  id: string;
  timestamp: string;
  stage: Stage;
  whatHappened: string;
  toolsUsed: string[];
  problems: string[];
  next: string[];
  source: string;
  confidence: "high" | "medium" | "low";
}

export interface VibeRepo {
  id: string;
  schema: "vibelog@0.2-draft";
  title: string;
  oneLineVibe: string;
  currentIdea: string;
  stage: Stage;
  visibility: Visibility;
  codeVisibility: "hidden" | "open_source" | "team_only" | "not_applicable";
  promptVisibility: PromptVisibility;
  collaborationStatus:
    | "closed"
    | "open_to_feedback"
    | "looking_for_builder"
    | "looking_for_designer"
    | "looking_for_partner"
    | "looking_for_users"
    | "looking_for_investment";
  creationMode: CreationMode;
  processLevel: ProcessLevel;
  tools: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  ideaEvolution: IdeaEvolutionEntry[];
  implementationStatus: ImplementationStatus;
  validationDesign: ValidationDesign;
  handoffState: HandoffState;
  vibeProgress: VibeProgressEntry[];
  publicSummary: string;
}

export interface AppendVibeUpdateInput {
  summary: string;
  currentIdea?: string;
  nextAction?: string;
}

export function createVibeRepo(input: CreateVibeRepoInput): VibeRepo {
  const parsed = createVibeRepoInputSchema.parse(input);
  const now = new Date().toISOString();
  const id = createId();
  const nextAction = "Define the next useful step.";

  return {
    id,
    schema: "vibelog@0.2-draft",
    title: parsed.title.trim(),
    oneLineVibe: parsed.oneLineVibe.trim(),
    currentIdea: parsed.currentIdea.trim(),
    stage: "idea",
    visibility: "private",
    codeVisibility: "hidden",
    promptVisibility: "summary",
    collaborationStatus: "closed",
    creationMode: "human_ai_co_created",
    processLevel: "core",
    tools: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
    ideaEvolution: [
      {
        id: createId(),
        timestamp: now,
        type: "initial",
        before: "none",
        after: parsed.currentIdea.trim(),
        reason: "Initial Vibe Repo creation.",
        source: "user",
        confidence: "high"
      }
    ],
    implementationStatus: {
      currentState: "Created, not yet implemented.",
      completed: [],
      inProgress: [],
      pending: [],
      blocked: [],
      nextActions: [nextAction],
      importantContextForNextAgent: []
    },
    validationDesign: {
      successCriteria: [],
      coreUserPaths: [],
      manualTestSteps: [],
      automatedTestStrategy: "",
      edgeCases: [],
      regressionPoints: [],
      risksSafetyPrivacy: [],
      owner: "human + agent"
    },
    handoffState: {
      currentState: "Created, not yet implemented.",
      completed: [],
      inProgress: [],
      pending: [],
      blockers: [],
      nextActions: [nextAction],
      contextForNextAgent: []
    },
    vibeProgress: [],
    publicSummary: parsed.oneLineVibe.trim()
  };
}

export function appendVibeUpdate(repo: VibeRepo, input: AppendVibeUpdateInput): VibeRepo {
  const summary = input.summary.trim();
  if (!summary) {
    throw new Error("Update summary is required.");
  }

  const now = new Date().toISOString();
  const next = input.nextAction?.trim() ? [input.nextAction.trim()] : [];
  const nextIdea = input.currentIdea?.trim();
  const ideaChanged = Boolean(nextIdea && nextIdea !== repo.currentIdea);

  return {
    ...repo,
    currentIdea: ideaChanged ? nextIdea! : repo.currentIdea,
    updatedAt: now,
    ideaEvolution: ideaChanged
      ? [
          ...repo.ideaEvolution,
          {
            id: createId(),
            timestamp: now,
            type: "refinement",
            before: repo.currentIdea,
            after: nextIdea!,
            reason: summary,
            source: "user",
            confidence: "high"
          }
        ]
      : repo.ideaEvolution,
    implementationStatus: {
      ...repo.implementationStatus,
      nextActions: next.length ? next : repo.implementationStatus.nextActions
    },
    handoffState: {
      ...repo.handoffState,
      nextActions: next.length ? next : repo.handoffState.nextActions
    },
    vibeProgress: [
      ...repo.vibeProgress,
      {
        id: createId(),
        timestamp: now,
        stage: repo.stage,
        whatHappened: summary,
        toolsUsed: [],
        problems: [],
        next,
        source: "user",
        confidence: "high"
      }
    ]
  };
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `id_${Math.random().toString(36).slice(2)}`;
}
