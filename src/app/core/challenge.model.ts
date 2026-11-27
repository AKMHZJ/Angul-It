export interface ImageTile {
  emoji: string;
  label: string;
  isTarget: boolean;
}

export type Challenge =
  | { type: 'image'; prompt: string; tiles: ImageTile[] }
  | { type: 'math'; question: string; answer: number }
  | { type: 'text'; code: string };

export type ChallengeType = Challenge['type'];

/** Answer given by the user: selected tile indexes (image) or a string (math / text). */
export type Answer = number[] | string;

export interface StageState {
  challenge: Challenge;
  answer: Answer | null;
  solved: boolean;
  attempts: number;
}

export interface SessionState {
  stages: StageState[];
  current: number;
  startedAt: number;
  finishedAt: number | null;
}
