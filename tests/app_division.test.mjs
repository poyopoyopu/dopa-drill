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
