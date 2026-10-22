// Problem generation. Every problem is a four-choice question whose answer is
// typed as one digit: the number (1-4) of the correct choice. That keeps the
// step / digit machinery of the game (combo, dopa, mastery, review) unchanged.
//
// A bank entry (see bank.js) is { q, c, a, e, s, fix? }:
//   q question, c choices, a index of the correct choice in c,
//   e short explanation, s source, fix: keep the listed order (for "ア・イ・ウ"
//   style choices); otherwise the choices are shuffled for every problem.
import { SKILL } from './skills.js';
import { POOLS } from './bank.js';

export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CHOICE_MARK = ['①', '②', '③', '④'];

function shuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// One bank entry -> one problem. `title` is the chip over the card.
export function buildQuiz(item, rng, title = '') {
  const order = item.fix ? item.c.map((_, i) => i) : shuffle(item.c.map((_, i) => i), rng);
  const choices = order.map((i) => item.c[i]);
  const right = order.indexOf(item.a ?? 0) + 1; // entries list the correct choice first unless `a` says otherwise
  return {
    kind: 'quiz', title, text: item.q, choices, explain: item.e || '', source: item.s || '',
    rows: 1, cols: 1, lines: [], bracket: null,
    cells: [{ id: 'x0', r: 0, c: 0, text: '', kind: 'input' }],
    steps: [{ cell: 'x0', digit: String(right), label: '正しいものを選んでください', after: [], help: { ids: [`ch${right}`], text: item.e || '' } }],
    answer: `${CHOICE_MARK[right - 1]} ${choices[right - 1]}`,
    answerText: `正解 ${CHOICE_MARK[right - 1]}`,
  };
}

// Signature used to avoid repeats (per skill, so a mixed skill and a plain one
// do not hide each other's questions).
export const signature = (p) => `${p.skill || p.title}|${p.text}`;

// Field label shown on the chip over the card, from the pool id prefix.
export const FIELD = { lb: '労働', vh: '車両法', tr: '道交法', cg: '貨物', ps: '旅客', pr: '実務' };

// Every question a skill can ask, as { item, pool }.
const poolOf = (sk) => {
  const g = sk.gen[1];
  const names = g.all ? Object.keys(POOLS) : (g.pools || [g.pool]);
  return names.flatMap((n) => (POOLS[n] || []).map((item) => ({ item, pool: n })));
};

// Make one problem for a skill, avoiding signatures in `recent` when possible.
export function makeProblem(skillId, rng, recent = null) {
  const sk = SKILL[skillId];
  if (!sk) throw new Error(`unknown skill ${skillId}`);
  const pool = poolOf(sk);
  if (!pool.length) throw new Error(`empty pool for ${skillId}`);
  // Prefer a question not asked lately; when every one has been, take the one
  // asked longest ago (`recent` keeps its insertion order, oldest first).
  const age = new Map();
  if (recent) [...recent].forEach((s, i) => age.set(s, i));
  const rank = (e) => { const k = `${sk.id}|${e.item.q}`; return age.has(k) ? age.get(k) : -1; };
  const fresh = pool.filter((e) => rank(e) < 0);
  let pick;
  if (fresh.length) pick = fresh[Math.floor(rng() * fresh.length)];
  else pick = pool.reduce((best, e) => (rank(e) < rank(best) ? e : best), pool[0]);
  const multi = pool.some((e) => e.pool !== pool[0].pool);
  const p = buildQuiz(pick.item, rng, multi ? FIELD[pick.pool.slice(0, 2)] || sk.name : sk.name);
  p.skill = skillId;
  p.pool = pick.pool;
  return p;
}

export const _internal = { poolOf, shuffle };
