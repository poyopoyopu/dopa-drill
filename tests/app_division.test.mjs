// Division filter (貨物/旅客/共通): classification and planner behaviour.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, SKILL, divOfSkill, divOfPool } from '../app/js/skills.js';
import { gradePlan, levelPlan, placementPlan, emptyProgress } from '../app/js/session.js';
import { makeProblem, makeRng } from '../app/js/problems.js';
import * as store from '../app/js/store.js';

const byDiv = (d) => SKILLS.filter((s) => divOfSkill(s) === d);

test('division counts: cargo 11, bus 8, common 29', () => {
  assert.equal(byDiv('cargo').length, 11);
  assert.equal(byDiv('bus').length, 8);
  assert.equal(byDiv('common').length, 29);
});

test('skill division matches its question pool division', () => {
  for (const s of SKILLS) {
    const g = s.gen[1];
    if (g.all) { assert.equal(divOfSkill(s), 'common', s.id); continue; }
    const pools = g.pools || [g.pool];
    for (const p of pools) assert.equal(divOfSkill(s), divOfPool(p), `${s.id} / ${p}`);
  }
});

test('pool division follows the exam fields', () => {
  assert.equal(divOfPool('cg_basic'), 'cargo');
  assert.equal(divOfPool('ps_basic'), 'bus');
  assert.equal(divOfPool('lb_bus'), 'bus');
  assert.equal(divOfPool('lb_taxi'), 'bus');
  assert.equal(divOfPool('lb_truck'), 'cargo');
  assert.equal(divOfPool('lb_special'), 'cargo');
  assert.equal(divOfPool('vh_basic'), 'common');
  assert.equal(divOfPool('pr_body'), 'common');
});

const onlyBus = (id) => { const d = divOfSkill(SKILL[id]); return d === 'bus' || d === 'common'; };
const onlyCargo = (id) => { const d = divOfSkill(SKILL[id]); return d === 'cargo' || d === 'common'; };

test('gradePlan with a division filter never picks the other division', () => {
  for (let g = 1; g <= 6; g++) {
    const plan = gradePlan(g, 10, makeRng(g), onlyBus);
    for (const id of plan.basic) assert.ok(onlyBus(id), `grade ${g}: ${id}`);
    for (let k = 0; k < 8; k++) assert.ok(onlyBus(plan.extra(k)), `grade ${g} extra: ${plan.extra(k)}`);
  }
});

test('levelPlan and placementPlan honour the division filter', () => {
  const prog = emptyProgress();
  const plan = levelPlan(prog, 10, makeRng(3), Date.now(), onlyCargo);
  for (const id of plan.basic) if (id) assert.ok(onlyCargo(id), `level: ${id}`);
  const fresh = { placed: false, skills: {}, review: [] };
  const walk = placementPlan(fresh, 10, onlyBus);
  for (let i = 0; i < 12; i++) { const id = walk.pick(); assert.ok(onlyBus(id), `placement: ${id}`); walk.answer(i % 2 === 0); }
});

test('mix-final problems follow the selected division', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 40; i++) {
    const p = makeProblem('mix-final', rng, null, 'bus');
    assert.notEqual(divOfPool(p.pool), 'cargo', p.pool);
  }
  for (let i = 0; i < 40; i++) {
    const p = makeProblem('mix-final', rng, null, 'cargo');
    assert.notEqual(divOfPool(p.pool), 'bus', p.pool);
  }
});

test('store settings carry a null division by default', () => {
  const m = new Map();
  const mem = { get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  assert.equal(store.load(mem).settings.division, null);
});

// --- Per-question overrides (divoverrides.js) ---
import { POOLS } from '../app/js/bank.js';
import { DIV_OVERRIDES } from '../app/js/divoverrides.js';
import { divOfEntry, divisionOfSig, _internal } from '../app/js/problems.js';

test('override targets still point at the intended questions', () => {
  // Fingerprints: if the bank is ever reordered, these fail before the
  // overrides silently land on the wrong questions.
  assert.ok(POOLS.lb_drive[0].q.startsWith('トラック運転者'));
  assert.ok(POOLS.lb_drive[1].q.includes('2週間'));
  assert.ok(POOLS.lb_words[12].q.includes('手待ち時間'));
  assert.ok(POOLS.vh_shaken[0].q.includes('旅客運送事業用'));
  assert.ok(POOLS.vh_shaken[1].q.includes('8トン以上の貨物'));
  assert.ok(POOLS.tr_speed[3].q.includes('大型バス'));
  assert.ok(POOLS.tr_speed[4].q.includes('積載'));
  assert.ok(POOLS.pr_plan[13].q.includes('290時間'));
  assert.ok(POOLS.pr_accident[13].q.includes('一般乗合旅客'));
  assert.ok(POOLS.pr_prevent[9].q.includes('事業用トラック'));
  for (const [pool, m] of Object.entries(DIV_OVERRIDES))
    for (const idx of Object.keys(m)) assert.ok(POOLS[pool][+idx], `${pool}#${idx} exists`);
});

test('divOfEntry: override wins over the pool division', () => {
  assert.equal(divOfEntry({ pool: 'lb_drive', idx: 0 }), 'cargo');
  assert.equal(divOfEntry({ pool: 'lb_drive', idx: 2 }), 'common'); // 連続運転4時間
  assert.equal(divOfEntry({ pool: 'tr_speed', idx: 3 }), 'bus');
  assert.equal(divOfEntry({ pool: 'tr_speed', idx: 0 }), 'common');
  assert.equal(divOfEntry({ pool: 'cg_basic', idx: 0 }), 'cargo'); // pool division untouched
});

test('makeProblem honours per-question overrides (lb-drive)', () => {
  const cargoTexts = new Set(Object.keys(DIV_OVERRIDES.lb_drive).map((i) => POOLS.lb_drive[+i].q));
  for (let seed = 1; seed <= 60; seed++) {
    const p = makeProblem('lb-drive', makeRng(seed), null, 'bus');
    assert.notEqual(p.div, 'cargo');
    assert.ok(!cargoTexts.has(p.text), `bus session drew a cargo question: ${p.text}`);
  }
  for (let seed = 1; seed <= 60; seed++) {
    const p = makeProblem('lb-drive', makeRng(seed), null, 'cargo');
    assert.notEqual(p.div, 'bus');
  }
});

test('mix-final pool is filtered per question, not per pool', () => {
  const busOnlyQ = POOLS.tr_speed[3].q; // 大型バスの最高速度 (bus override in a common pool)
  const busPool = _internal.poolOf(SKILL['mix-final'], 'bus');
  assert.ok(busPool.some((e) => e.item.q === busOnlyQ), 'bus-only question in a common pool stays drawable under bus');
  assert.ok(busPool.every((e) => divOfEntry(e) !== 'cargo'), 'no cargo entries in the bus mix pool');
  for (let seed = 1; seed <= 400; seed++) {
    const p = makeProblem('mix-final', makeRng(seed), null, 'bus');
    assert.notEqual(p.div, 'cargo', `bus mix drew cargo: ${p.text}`);
  }
  for (let seed = 1; seed <= 400; seed++) {
    const p = makeProblem('mix-final', makeRng(seed), null, 'cargo');
    assert.notEqual(p.div, 'bus', `cargo mix drew bus: ${p.text}`);
    assert.notEqual(p.text, busOnlyQ);
  }
});

test('divisionOfSig resolves saved review questions per question', () => {
  assert.equal(divisionOfSig(`lb-drive|${POOLS.lb_drive[0].q}`), 'cargo');
  assert.equal(divisionOfSig(`lb-drive|${POOLS.lb_drive[2].q}`), 'common');
  assert.equal(divisionOfSig(`tr-speed|${POOLS.tr_speed[3].q}`), 'bus');
  assert.equal(divisionOfSig(`tr-speed|${POOLS.tr_speed[4].q}`), 'cargo');
  assert.equal(divisionOfSig('no-such-skill|x'), 'common');
});
