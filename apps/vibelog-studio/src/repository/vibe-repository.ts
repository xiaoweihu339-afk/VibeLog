import type { VibeRepo } from "../domain/vibe-repo";

export interface VibeRepository {
  list(): Promise<VibeRepo[]>;
  get(id: string): Promise<VibeRepo | null>;
  save(repo: VibeRepo): Promise<void>;
  delete(id: string): Promise<void>;
}

export class MemoryVibeRepository implements VibeRepository {
  private repos = new Map<string, VibeRepo>();

  async list(): Promise<VibeRepo[]> {
    return [...this.repos.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<VibeRepo | null> {
    return this.repos.get(id) ?? null;
  }

  async save(repo: VibeRepo): Promise<void> {
    this.repos.set(repo.id, repo);
  }

  async delete(id: string): Promise<void> {
    this.repos.delete(id);
  }
}

export class LocalStorageVibeRepository implements VibeRepository {
  constructor(private readonly key = "vibelog-studio:vibe-repos") {}

  async list(): Promise<VibeRepo[]> {
    return this.readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<VibeRepo | null> {
    return this.readAll().find((repo) => repo.id === id) ?? null;
  }

  async save(repo: VibeRepo): Promise<void> {
    const repos = this.readAll();
    const next = [repo, ...repos.filter((existing) => existing.id !== repo.id)];
    this.writeAll(next);
  }

  async delete(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((repo) => repo.id !== id));
  }

  private readAll(): VibeRepo[] {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as VibeRepo[];
  }

  private writeAll(repos: VibeRepo[]): void {
    localStorage.setItem(this.key, JSON.stringify(repos));
  }
}
