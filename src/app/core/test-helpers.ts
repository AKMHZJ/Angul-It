import { Answer, Challenge } from './challenge.model';

/** Returns the correct answer for a challenge (test use only). */
export function solve(c: Challenge): Answer {
  switch (c.type) {
    case 'image':
      return c.tiles.map((t, i) => (t.isTarget ? i : -1)).filter((i) => i >= 0);
    case 'math':
      return String(c.answer);
    case 'text':
      return c.code;
  }
}
