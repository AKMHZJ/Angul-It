import { Challenge, ChallengeType, ImageTile } from './challenge.model';

type Rng = () => number;

const CATEGORIES: Record<string, { label: string; emojis: string[] }> = {
  cats: { label: 'cat', emojis: ['🐱', '🐈', '😺', '🐈‍⬛'] },
  dogs: { label: 'dog', emojis: ['🐶', '🐕', '🦮', '🐩'] },
  cars: { label: 'car', emojis: ['🚗', '🚙', '🏎️', '🚕'] },
  fruits: { label: 'fruit', emojis: ['🍎', '🍌', '🍇', '🍓'] },
};

const TEXT_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

const randInt = (min: number, max: number, rng: Rng) => Math.floor(rng() * (max - min + 1)) + min;
const pick = <T>(list: T[], rng: Rng): T => list[Math.floor(rng() * list.length)];

export function shuffle<T>(list: T[], rng: Rng = Math.random): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createImageChallenge(rng: Rng = Math.random): Challenge {
  const keys = Object.keys(CATEGORIES);
  const targetKey = pick(keys, rng);
  const target = CATEGORIES[targetKey];
  const targetCount = randInt(2, 4, rng);

  const tiles: ImageTile[] = [];
  for (let i = 0; i < targetCount; i++) {
    tiles.push({ emoji: pick(target.emojis, rng), label: target.label, isTarget: true });
  }
  const others = keys.filter((k) => k !== targetKey);
  while (tiles.length < 9) {
    const cat = CATEGORIES[pick(others, rng)];
    tiles.push({ emoji: pick(cat.emojis, rng), label: cat.label, isTarget: false });
  }
  return { type: 'image', prompt: `Select all images with a ${target.label}`, tiles: shuffle(tiles, rng) };
}

export function createMathChallenge(rng: Rng = Math.random): Challenge {
  const a = randInt(2, 12, rng);
  const b = randInt(2, 12, rng);
  switch (pick(['+', '-', '×'], rng)) {
    case '+':
      return { type: 'math', question: `${a} + ${b}`, answer: a + b };
    case '-':
      return { type: 'math', question: `${Math.max(a, b)} − ${Math.min(a, b)}`, answer: Math.abs(a - b) };
    default:
      return { type: 'math', question: `${a} × ${b}`, answer: a * b };
  }
}

export function createTextChallenge(rng: Rng = Math.random): Challenge {
  let code = '';
  for (let i = 0; i < 5; i++) code += pick(TEXT_CHARS.split(''), rng);
  return { type: 'text', code };
}

export function createChallenge(type: ChallengeType, rng: Rng = Math.random): Challenge {
  switch (type) {
    case 'image':
      return createImageChallenge(rng);
    case 'math':
      return createMathChallenge(rng);
    case 'text':
      return createTextChallenge(rng);
  }
}

/**
 * Builds a random session: every challenge type appears at least once,
 * plus one extra random stage, in shuffled order.
 */
export function createSession(rng: Rng = Math.random): Challenge[] {
  const types: ChallengeType[] = ['image', 'math', 'text'];
  const all = shuffle([...types, pick(types, rng)], rng);
  return all.map((t) => createChallenge(t, rng));
}

/** Checks whether an answer solves a challenge. */
export function isCorrect(challenge: Challenge, answer: unknown): boolean {
  switch (challenge.type) {
    case 'image': {
      if (!Array.isArray(answer)) return false;
      const expected = challenge.tiles.map((t, i) => (t.isTarget ? i : -1)).filter((i) => i >= 0);
      const given = [...new Set(answer as number[])].sort((x, y) => x - y);
      return given.length === expected.length && given.every((v, i) => v === expected[i]);
    }
    case 'math':
      return String(answer ?? '').trim() !== '' && Number(answer) === challenge.answer;
    case 'text':
      return String(answer ?? '').trim().toLowerCase() === challenge.code.toLowerCase();
  }
}
