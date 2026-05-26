# VibeLog Studio Slice 2 Design

## Goal

Slice 2 turns VibeLog Studio from a localStorage prototype into a portable Vibe Repo workbench.

The theme is:

```txt
File round-trip + schema validation + Git Link Lite
```

This slice should make one Vibe Repo easy to export as real files, import from structured JSON, validate against the VibeLog shape, edit core status fields, and connect to a Git repository reference. It should not build cloud sync, public community, or built-in Git hosting.

## Product Principle

VibeHub should follow the GitHub-style growth pattern:

```txt
GitHub did not reinvent Git first.
It made Git repositories easier to host, share, review, and collaborate around.

VibeHub should not reinvent Git first.
It should make VibeLog + Git-backed vibe projects easier to record, preserve, show, and co-create.
```

Slice 2 therefore treats Git as the code layer and VibeLog as the process memory layer.

## Scope

### In Scope

- Download the selected Vibe Repo as `vibe-log.md`.
- Download the selected Vibe Repo as `vibe-log.json`.
- Import a Vibe Repo from `vibe-log.json`.
- Validate imported JSON before saving it.
- Show human-readable validation errors.
- Edit core Vibe Repo fields:
  - one-line vibe
  - current idea
  - stage
  - visibility
  - completed items
  - pending items
  - next actions
- Add Git Link Lite fields:
  - provider
  - repo URL
  - remote name
  - default branch
  - current branch
  - latest commit SHA
  - sync status
  - code visibility
  - demo URL
- Include Git link data in JSON and Markdown exports.
- Keep localStorage persistence from Slice 1.
- Update the dogfood VibeLog after implementation.

### Out Of Scope

- Markdown import or Markdown parsing.
- Git command execution.
- GitHub API integration.
- One-click git commit or push.
- VibeHub cloud upload.
- Accounts, auth, permissions, or billing.
- Public gallery or community features.
- Built-in Git remote hosting.
- Full UI redesign.

## Key Decisions

### JSON Import First

Slice 2 imports only JSON. Markdown remains the human source format and downloadable artifact, but Markdown-to-structured parsing is deliberately delayed.

Reason: JSON gives agents and VibeHub a stable machine-readable path. Markdown parsing can become ambiguous and would slow down the core portability loop.

### Git Link Lite First

Slice 2 records Git repository metadata but does not run Git commands.

Reason: this creates the VibeLog-to-code bridge without taking on authentication, shell safety, merge conflicts, remote errors, or provider API behavior.

### Schema Validation In The App

The app should validate imported data before saving it. Validation should reject malformed JSON, missing required fields, invalid enum values, and unsupported shapes.

Reason: if VibeLog is the future upload format, local validation is part of the product foundation.

## Data Model Changes

Add optional `code_repositories` to VibeLog and Vibe Repo data:

```ts
type CodeRepository = {
  provider: "github" | "gitlab" | "bitbucket" | "local" | "vibehub_future" | "other";
  url?: string;
  remoteName?: string;
  defaultBranch?: string;
  currentBranch?: string;
  latestCommitSha?: string;
  syncStatus?: "unlinked" | "local_only" | "linked" | "pushed" | "mirrored" | "hosted";
  codeVisibility?: "hidden" | "open_source" | "team_only" | "not_applicable";
  demoUrl?: string;
  artifactUrls?: string[];
  linkedCommits?: Array<{
    sha: string;
    branch?: string;
    message?: string;
    timestamp?: string;
    summary?: string;
    vibelogEntryRef?: string;
  }>;
  notes?: string;
};
```

The schema file `skills/vibelog/assets/vibe-log.schema.json` already prepares the JSON field as `code_repositories`.

## UI Design

Keep the current utilitarian shell. Improve only where needed to make Slice 2 usable.

Suggested layout additions:

- Add an `Import` control near the repo list.
- Add `Download Markdown` and `Download JSON` buttons near export preview.
- Add a compact `Core Fields` edit section in the detail view.
- Add a compact `Git Link` section below status or export.
- Add validation result messages:
  - success: imported repo title and key counts
  - failure: clear explanation and no save

The UI does not need final visual polish in this slice.

## Data Flow

### Download Markdown

```txt
selected repo -> exportVibeLogMarkdown(repo) -> Blob -> browser download vibe-log.md
```

### Download JSON

```txt
selected repo -> exportVibeLogJson(repo) -> Blob -> browser download vibe-log.json
```

### Import JSON

```txt
file input -> read text -> JSON.parse -> validate -> normalize -> save repository -> select imported repo
```

If import fails, do not mutate localStorage.

### Edit Core Fields

```txt
form submit -> validate input -> update VibeRepo -> save repository -> refresh selected repo
```

### Edit Git Link

```txt
form submit -> validate Git metadata -> update code_repositories[0] -> save repository -> export includes Git data
```

## Error Handling

- Invalid JSON: show "The file is not valid JSON."
- Missing required VibeLog fields: show the first few missing fields.
- Invalid enum: show the field name and accepted values when practical.
- Unsupported file: do not save anything.
- Empty download selection: disable download buttons or show a gentle message.
- Invalid Git URL: allow empty local values, but reject obviously malformed HTTP URLs.

## Testing Design

The user's two-layer completion rule still applies.

### Single Tests

- JSON import parser accepts valid exported JSON.
- JSON import parser rejects malformed JSON.
- JSON import parser rejects missing required fields.
- Download helpers produce correct filenames and MIME types.
- Domain update helpers edit core fields without losing idea history.
- Git link helper stores provider, URL, branches, commit SHA, and demo URL.

### Integration Tests

- Create repo -> edit core fields -> export JSON -> import JSON -> verify same core fields.
- Create repo -> add Git link -> export Markdown/JSON -> verify Git data appears.
- Failed import -> existing repo list remains unchanged.

### Browser E2E

- Create repo.
- Edit core fields.
- Add Git link.
- Download JSON.
- Import the downloaded JSON.
- Confirm imported repo appears and can export Markdown.

## Acceptance Criteria

- A selected repo can download `vibe-log.md`.
- A selected repo can download `vibe-log.json`.
- A valid exported JSON file can be imported as a repo.
- Invalid JSON import does not corrupt local data.
- Core fields can be edited after creation.
- Git Link Lite fields can be saved.
- Exported JSON contains `code_repositories`.
- Exported Markdown contains a readable code repository section.
- Unit, integration, and browser E2E tests pass.
- Dogfood VibeLog records the work, verification, and handoff.

## Preparation Status

- Slice 1 is committed and pushed as `5111e72 Add VibeLog Studio slice 1`.
- `code_repositories` has been added to the VibeLog JSON schema.
- JSON import is the confirmed first import target.
- This document is the Slice 2 design basis.

## Open Questions For Implementation

- Should imported repos keep their original `id`, or receive a new local id to avoid overwriting existing data?
- Should the app support multiple Git links per Vibe Repo in the UI now, or keep UI to one primary link while the data model supports an array?
- Should downloads use the repo title as filename prefix, or always use `vibe-log.md` and `vibe-log.json`?

## Recommendation

For Slice 2 implementation:

- Keep imported repo ids if there is no collision.
- If there is an id collision, create a new id and record the import in progress history.
- Show one primary Git link in the UI.
- Use fixed filenames `vibe-log.md` and `vibe-log.json` for now.

This keeps the slice focused while still preparing the long-term VibeHub model.
