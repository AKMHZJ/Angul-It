import { createImageChallenge, createMathChallenge, createSession, createTextChallenge, isCorrect } from './challenge.generator';

describe('challenge generator', () => {
  it('creates a session containing every challenge type', () => {
    const types = createSession().map((c) => c.type);
    expect(types.length).toBe(4);
    expect(types).toEqual(expect.arrayContaining(['image', 'math', 'text']));
  });

  it('validates image selections exactly', () => {
    const c = createImageChallenge();
    if (c.type !== 'image') throw new Error('wrong type');
    const targets = c.tiles.map((t, i) => (t.isTarget ? i : -1)).filter((i) => i >= 0);
    const wrong = c.tiles.findIndex((t) => !t.isTarget);
    expect(c.tiles.length).toBe(9);
    expect(isCorrect(c, [...targets].reverse())).toBe(true);
    expect(isCorrect(c, targets.slice(1))).toBe(false);
    expect(isCorrect(c, [...targets, wrong])).toBe(false);
    expect(isCorrect(c, 'nope')).toBe(false);
  });

  it('validates math answers', () => {
    const c = createMathChallenge();
    if (c.type !== 'math') throw new Error('wrong type');
    expect(isCorrect(c, String(c.answer))).toBe(true);
    expect(isCorrect(c, c.answer)).toBe(true);
    expect(isCorrect(c, String(c.answer + 1))).toBe(false);
    expect(isCorrect(c, '')).toBe(false);
  });

  it('validates text codes case-insensitively', () => {
    const c = createTextChallenge();
    if (c.type !== 'text') throw new Error('wrong type');
    expect(c.code.length).toBe(5);
    expect(isCorrect(c, ` ${c.code.toUpperCase()} `)).toBe(true);
    expect(isCorrect(c, c.code + 'x')).toBe(false);
  });
});
