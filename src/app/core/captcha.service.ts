import { Injectable, computed, signal } from '@angular/core';
import { Answer, SessionState } from './challenge.model';
import { createChallenge, createSession, isCorrect } from './challenge.generator';

export const STORAGE_KEY = 'angul-it.session';

@Injectable({ providedIn: 'root' })
export class CaptchaService {
  private readonly state = signal<SessionState | null>(this.load());

  readonly session = this.state.asReadonly();
  readonly hasSession = computed(() => this.state() !== null);
  readonly currentIndex = computed(() => this.state()?.current ?? 0);
  readonly currentStage = computed(() => {
    const s = this.state();
    return s ? s.stages[s.current] : null;
  });
  readonly total = computed(() => this.state()?.stages.length ?? 0);
  readonly solvedCount = computed(() => this.state()?.stages.filter((s) => s.solved).length ?? 0);
  readonly isComplete = computed(() => {
    const s = this.state();
    return !!s && s.stages.every((st) => st.solved);
  });

  /** Starts a brand-new session with a random set of challenges. */
  start(): void {
    const stages = createSession().map((challenge) => ({ challenge, answer: null, solved: false, attempts: 0 }));
    this.set({ stages, current: 0, startedAt: Date.now(), finishedAt: null });
  }

  /** Validates the answer for the current stage. Returns true when correct. */
  submit(answer: Answer): boolean {
    const s = this.state();
    if (!s) return false;
    const stages = [...s.stages];
    const stage = { ...stages[s.current] };
    const correct = isCorrect(stage.challenge, answer);

    stage.attempts++;
    stage.answer = answer;
    stage.solved = correct;
    stages[s.current] = stage;

    const done = stages.every((st) => st.solved);
    this.set({ ...s, stages, finishedAt: done ? (s.finishedAt ?? Date.now()) : null });
    return correct;
  }

  /** Moves to another stage. Users can never skip past the first unsolved stage. */
  goTo(index: number): boolean {
    const s = this.state();
    if (!s || index < 0 || index >= s.stages.length) return false;
    const firstUnsolved = s.stages.findIndex((st) => !st.solved);
    const maxAllowed = firstUnsolved === -1 ? s.stages.length - 1 : firstUnsolved;
    if (index > maxAllowed) return false;
    this.set({ ...s, current: index });
    return true;
  }

  /** Replaces the current (unsolved) challenge with a fresh one of the same type. */
  refreshCurrent(): void {
    const s = this.state();
    if (!s) return;
    const stages = [...s.stages];
    const stage = stages[s.current];
    if (stage.solved) return;
    stages[s.current] = { ...stage, challenge: createChallenge(stage.challenge.type), answer: null };
    this.set({ ...s, stages });
  }

  reset(): void {
    this.state.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  private set(next: SessionState): void {
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in-memory state */
    }
  }

  private load(): SessionState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SessionState;
      if (!Array.isArray(parsed?.stages) || parsed.stages.length === 0 || typeof parsed.current !== 'number') {
        return null;
      }
      parsed.current = Math.min(Math.max(0, parsed.current), parsed.stages.length - 1);
      return parsed;
    } catch {
      return null;
    }
  }
}
