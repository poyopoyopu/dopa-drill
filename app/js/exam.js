// Mock exam (模擬試験): 30 questions laid out like the real 運行管理者試験.
// Field sizes and the pass line follow 運行管理者試験センター「新規受験概要」:
//   cargo: 貨物自動車運送事業法 8 / 道路運送車両法 4 / 道路交通法 5 / 労働基準法 6 / 実務 7
//   bus:   道路運送法 8 / 道路運送車両法 4 / 道路交通法 5 / 労働基準法 6 / 実務 7
//   pass:  total >= 60% (18 of 30), fields (1)-(4) at least 1 correct, field (5) at least 2.
//   time:  90 minutes (CBT).
// A question counts as correct when it is answered right on the first try;
// a question left unanswered when time runs out counts as wrong.
import { POOLS } from './bank.js';
import { buildQuiz, FIELD } from './problems.js';
import { SKILLS } from './skills.js';

const pre = (p, drop = []) => Object.keys(POOLS).filter((n) => n.startsWith(p) && !drop.includes(n));
const VH = () => ({ label: '道路運送車両法関係', n: 4, need: 1, pools: pre('vh_') });
const TR = () => ({ label: '道路交通法関係', n: 5, need: 1, pools: pre('tr_') });
const PR = () => ({ label: '実務上の知識及び能力', n: 7, need: 2, pools: pre('pr_') });

export const EXAM = {
  cargo: {
    name: '貨物',
    fields: [
      { label: '貨物自動車運送事業法関係', n: 8, need: 1, pools: pre('cg_') },
      VH(), TR(),
      // バス・タクシーだけの基準は、貨物の試験には出さない
      { label: '労働基準法関係', n: 6, need: 1, pools: pre('lb_', ['lb_bus', 'lb_taxi']) },
      PR(),
    ],
  },
  bus: {
    name: '旅客',
    fields: [
      { label: '道路運送法関係', n: 8, need: 1, pools: pre('ps_') },
      VH(), TR(),
      // トラックだけの基準は、旅客の試験には出さない
      { label: '労働基準法関係', n: 6, need: 1, pools: pre('lb_', ['lb_truck', 'lb_special']) },
      PR(),
    ],
  },
};
export const PASS_RATE = 0.6;
export const EXAM_MS = 90 * 60 * 1000;
export const examSize = (kind) => EXAM[kind].fields.reduce((a, f) => a + f.n, 0);
export const passLine = (kind) => Math.ceil(examSize(kind) * PASS_RATE);

function shuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// The 30 problems, in field order (as on the real paper). Each problem carries
// examField (index into fields) so the result can be judged per field.
export function buildExam(kind, rng) {
  const exam = EXAM[kind];
  if (!exam) throw new Error(`unknown exam ${kind}`);
  const out = [];
  exam.fields.forEach((f, fi) => {
    const seen = new Set();
    const items = [];
    for (const pool of f.pools) for (const item of POOLS[pool]) if (!seen.has(item.q)) { seen.add(item.q); items.push({ item, pool }); }
    for (const { item, pool } of shuffle(items, rng).slice(0, f.n)) {
      const p = buildQuiz(item, rng, FIELD[pool.split('_')[0]] || '');
      p.examField = fi;
      p.pool = pool;
      out.push(p);
    }
  });
  return out;
}

// The skill whose pool is `pool` (every pool belongs to exactly one skill).
export const skillOfPool = (pool) => (SKILLS.find((s) => s.gen[1].pool === pool) || {}).id || null;

// log: [{ field, ok, pool }] for every answered problem.
export function judgeExam(kind, log) {
  const exam = EXAM[kind];
  const fields = exam.fields.map((f, i) => {
    const ok = log.filter((e) => e.field === i && e.ok).length;
    return { label: f.label, n: f.n, need: f.need, ok, pass: ok >= f.need };
  });
  const total = fields.reduce((a, f) => a + f.ok, 0);
  const max = examSize(kind);
  const line = passLine(kind);
  const answered = log.length;
  return { kind, name: exam.name, total, max, line, fields, answered, pass: total >= line && fields.every((f) => f.pass), weak: weakSpot(kind, log, fields) };
}

// The weakest field (a failed field first, then the lowest share correct;
// ties go to the larger field) and, inside it, the skill with the most misses.
// null when every question was right.
export function weakSpot(kind, log, fields = judgeExam(kind, log).fields) {
  const rank = fields.map((f, i) => ({ i, f, short: f.pass ? 0 : 1, rate: f.ok / f.n })).filter((x) => x.f.ok < x.f.n);
  if (!rank.length) return null;
  rank.sort((a, b) => b.short - a.short || a.rate - b.rate || b.f.n - a.f.n || a.i - b.i);
  const { i, f } = rank[0];
  const miss = {};
  for (const e of log) if (e.field === i && !e.ok && e.pool) miss[e.pool] = (miss[e.pool] || 0) + 1;
  // No answered misses (time ran out): fall back to the field's biggest pool.
  const pools = EXAM[kind].fields[i].pools;
  const pool = Object.keys(miss).sort((a, b) => miss[b] - miss[a] || pools.indexOf(a) - pools.indexOf(b))[0]
    || pools.slice().sort((a, b) => POOLS[b].length - POOLS[a].length)[0];
  return { field: i, label: f.label, ok: f.ok, n: f.n, pool, skill: skillOfPool(pool), misses: miss[pool] || 0 };
}

// What is kept in the play history for one mock exam.
export const examRecord = (r) => ({ exam: r.kind, total: r.total, max: r.max, pass: r.pass, fields: r.fields.map((f) => f.ok), answered: r.answered });

// The last `n` mock exams of one kind from the play history, oldest first.
export const examTrend = (history, kind, n = 10) => history.filter((h) => h.mode === 'exam' && h.exam === kind && Number.isFinite(h.total)).slice(-n);
