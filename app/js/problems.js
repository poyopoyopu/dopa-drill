// Problem generation. Every problem is a four-choice question whose answer is
// typed as one digit: the number (1-4) of the correct choice. That keeps the
// step / digit machinery of the game (combo, dopa, mastery, review) unchanged.
//
// A bank entry (see bank.js) is { q, c, a, e, s, fix? }:
//   q question, c choices, a index of the correct choice in c,
//   e short explanation, s source, fix: keep the listed order (for "ア・イ・ウ"
//   style choices); otherwise the choices are shuffled for every problem.
import { SKILL , divOfPool, divOfSkill } from './skills.js';
import { POOLS } from './bank.js';
import { DIV_OVERRIDES } from './divoverrides.js';
import { isExcluded } from './exclusions.js';

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

// Division of one bank entry: a per-question override (divoverrides.js)
// wins over the pool's own division.
export const divOfEntry = (e) => (DIV_OVERRIDES[e.pool] && DIV_OVERRIDES[e.pool][e.idx]) || divOfPool(e.pool);

// Division of a saved question, given its signature (`skillId|question`).
// Used for the review list, whose saved records carry no division of their
// own. Falls back to the skill's division when the question is not found.
export function divisionOfSig(sig) {
  const i = String(sig).indexOf('|');
  if (i < 0) return 'common';
  const sk = SKILL[String(sig).slice(0, i)];
  if (!sk) return 'common';
  const q = String(sig).slice(i + 1);
  for (const e of poolOf(sk)) if (e.item.q === q) return divOfEntry(e);
  return divOfSkill(sk);
}

// Every question a skill can ask, as { item, pool, idx }.
const poolOf = (sk, div = null) => {
  const g = sk.gen[1];
  const names = g.all ? Object.keys(POOLS) : (g.pools || [g.pool]);
  const all = names.flatMap((n) => (POOLS[n] || []).map((item, idx) => ({ item, pool: n, idx })))
    .filter((e) => !isExcluded(e.pool, e.idx)); // 公開除外リスト(exclusions.js)は出題しない
  if (!div || div === 'all') return all;
  const filtered = all.filter((e) => { const d = divOfEntry(e); return d === 'common' || d === div; });
  return filtered.length ? filtered : all;
};

// Make one problem for a skill, avoiding signatures in `recent` when possible.
// With `ordered` (textbook entry), the fresh questions come in pool order --
// the bank lists each pool in teaching order, so a run started from a
// textbook chapter walks the chapter instead of jumping around.
export function makeProblem(skillId, rng, recent = null, div = null, ordered = false) {
  const sk = SKILL[skillId];
  if (!sk) throw new Error(`unknown skill ${skillId}`);
  const pool = poolOf(sk, div);
  if (!pool.length) throw new Error(`empty pool for ${skillId}`);
  // Prefer a question not asked lately; when every one has been, take the one
  // asked longest ago (`recent` keeps its insertion order, oldest first).
  const age = new Map();
  if (recent) [...recent].forEach((s, i) => age.set(s, i));
  const rank = (e) => { const k = `${sk.id}|${e.item.q}`; return age.has(k) ? age.get(k) : -1; };
  const fresh = pool.filter((e) => rank(e) < 0);
  let pick;
  if (fresh.length) pick = ordered ? fresh[0] : fresh[Math.floor(rng() * fresh.length)];
  else pick = pool.reduce((best, e) => (rank(e) < rank(best) ? e : best), pool[0]);
  const multi = pool.some((e) => e.pool !== pool[0].pool);
  const p = buildQuiz(pick.item, rng, multi ? FIELD[pick.pool.slice(0, 2)] || sk.name : sk.name);
  p.skill = skillId;
  p.pool = pick.pool;
  p.div = divOfEntry(pick);
  return p;
}

export const _internal = { poolOf, shuffle };
