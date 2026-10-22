// Mock exam (模擬試験): 30 questions laid out like the real 運行管理者試験.
// Field sizes and the pass line follow 運行管理者試験センター「新規受験概要」:
//   cargo: 貨物自動車運送事業法 8 / 道路運送車両法 4 / 道路交通法 5 / 労働基準法 6 / 実務 7
//   bus:   道路運送法 8 / 道路運送車両法 4 / 道路交通法 5 / 労働基準法 6 / 実務 7
//   pass:  total >= 60% (18 of 30), fields (1)-(4) at least 1 correct, field (5) at least 2.
// A question counts as correct when it is answered right on the first try.
import { POOLS } from './bank.js';
import { buildQuiz, FIELD } from './problems.js';

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

// log: [{ field, ok }] for every answered problem.
export function judgeExam(kind, log) {
  const exam = EXAM[kind];
  const fields = exam.fields.map((f, i) => {
    const ok = log.filter((e) => e.field === i && e.ok).length;
    return { label: f.label, n: f.n, need: f.need, ok, pass: ok >= f.need };
  });
  const total = fields.reduce((a, f) => a + f.ok, 0);
  const max = examSize(kind);
  const line = passLine(kind);
  return { name: exam.name, total, max, line, fields, pass: total >= line && fields.every((f) => f.pass) };
}
