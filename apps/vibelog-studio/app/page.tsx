"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { appendVibeUpdate, createVibeRepo, type VibeRepo } from "@/domain/vibe-repo";
import { exportVibeLogJson } from "@/exporters/json";
import { exportVibeLogMarkdown } from "@/exporters/markdown";
import { LocalStorageVibeRepository } from "@/repository/vibe-repository";

const repository = typeof window === "undefined" ? null : new LocalStorageVibeRepository();

export default function HomePage() {
  const [repos, setRepos] = useState<VibeRepo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [oneLineVibe, setOneLineVibe] = useState("");
  const [currentIdea, setCurrentIdea] = useState("");
  const [updateSummary, setUpdateSummary] = useState("");
  const [updatedIdea, setUpdatedIdea] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [exportMode, setExportMode] = useState<"markdown" | "json">("markdown");
  const [error, setError] = useState("");

  useEffect(() => {
    void refreshRepos();
  }, []);

  const selectedRepo = useMemo(
    () => repos.find((repo) => repo.id === selectedId) ?? repos[0] ?? null,
    [repos, selectedId]
  );

  const exportPreview = selectedRepo
    ? exportMode === "markdown"
      ? exportVibeLogMarkdown(selectedRepo)
      : exportVibeLogJson(selectedRepo)
    : "";

  async function refreshRepos(nextSelectedId?: string) {
    if (!repository) return;

    const loaded = await repository.list();
    setRepos(loaded);
    if (nextSelectedId) {
      setSelectedId(nextSelectedId);
    } else if (!selectedId && loaded[0]) {
      setSelectedId(loaded[0].id);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const repo = createVibeRepo({ title, oneLineVibe, currentIdea });
      await repository?.save(repo);
      setTitle("");
      setOneLineVibe("");
      setCurrentIdea("");
      await refreshRepos(repo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create Vibe Repo.");
    }
  }

  async function handleAppendUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRepo) return;

    setError("");

    try {
      const updated = appendVibeUpdate(selectedRepo, {
        summary: updateSummary,
        currentIdea: updatedIdea,
        nextAction
      });
      await repository?.save(updated);
      setUpdateSummary("");
      setUpdatedIdea("");
      setNextAction("");
      await refreshRepos(updated.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not append update.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Local-first</p>
          <h1>VibeLog Studio</h1>
        </div>
        <p className="topbar-copy">Create, update, and export local Vibe Repos.</p>
      </header>

      {error ? <p className="error" role="alert">{error}</p> : null}

      <section className="workspace" aria-label="VibeLog Studio workspace">
        <aside className="sidebar" aria-label="Vibe Repo dashboard">
          <form className="form-stack" onSubmit={handleCreate}>
            <h2>New Vibe Repo</h2>
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              One-line vibe
              <input value={oneLineVibe} onChange={(event) => setOneLineVibe(event.target.value)} />
            </label>
            <label>
              Current idea
              <textarea value={currentIdea} onChange={(event) => setCurrentIdea(event.target.value)} rows={4} />
            </label>
            <button type="submit">Create Vibe Repo</button>
          </form>

          <div className="repo-list">
            <h2>Repos</h2>
            {repos.length ? (
              repos.map((repo) => (
                <button
                  className={repo.id === selectedRepo?.id ? "repo-item active" : "repo-item"}
                  key={repo.id}
                  type="button"
                  onClick={() => setSelectedId(repo.id)}
                >
                  <strong>{repo.title}</strong>
                  <span>{repo.oneLineVibe}</span>
                </button>
              ))
            ) : (
              <p className="muted">No Vibe Repos yet.</p>
            )}
          </div>
        </aside>

        <section className="detail" aria-label="Vibe Repo detail">
          {selectedRepo ? (
            <>
              <div className="detail-header">
                <p className="eyebrow">{selectedRepo.stage}</p>
                <h2>{selectedRepo.title}</h2>
                <p>{selectedRepo.currentIdea}</p>
              </div>

              <dl className="status-grid">
                <div>
                  <dt>Visibility</dt>
                  <dd>{selectedRepo.visibility}</dd>
                </div>
                <div>
                  <dt>Prompt Visibility</dt>
                  <dd>{selectedRepo.promptVisibility}</dd>
                </div>
                <div>
                  <dt>Next Action</dt>
                  <dd>{selectedRepo.handoffState.nextActions[0] ?? "none"}</dd>
                </div>
              </dl>

              <form className="form-stack update-form" onSubmit={handleAppendUpdate}>
                <h3>Append Update</h3>
                <label>
                  Update summary
                  <input value={updateSummary} onChange={(event) => setUpdateSummary(event.target.value)} />
                </label>
                <label>
                  Updated idea
                  <textarea value={updatedIdea} onChange={(event) => setUpdatedIdea(event.target.value)} rows={3} />
                </label>
                <label>
                  Next action
                  <input value={nextAction} onChange={(event) => setNextAction(event.target.value)} />
                </label>
                <button type="submit">Append Update</button>
              </form>

              <section className="timeline" aria-label="Vibe progress">
                <h3>Vibe Progress</h3>
                {selectedRepo.vibeProgress.length ? (
                  selectedRepo.vibeProgress.map((entry) => (
                    <article key={entry.id}>
                      <strong>{entry.whatHappened}</strong>
                      <p>{entry.next.join(", ") || "No next action recorded."}</p>
                    </article>
                  ))
                ) : (
                  <p className="muted">No progress updates yet.</p>
                )}
              </section>

              <section className="export-panel" aria-label="Export preview">
                <div className="segmented" role="group" aria-label="Export format">
                  <button type="button" className={exportMode === "markdown" ? "selected" : ""} onClick={() => setExportMode("markdown")}>
                    Markdown
                  </button>
                  <button type="button" className={exportMode === "json" ? "selected" : ""} onClick={() => setExportMode("json")}>
                    JSON
                  </button>
                </div>
                <pre data-testid="export-preview">{exportPreview}</pre>
              </section>
            </>
          ) : (
            <div className="empty-state">
              <h2>Create a Vibe Repo</h2>
              <p>Start with a title, one-line vibe, and current idea.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
