// The four-choice question bank and the problems built from it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, makeProblem, buildQuiz, signature, _internal } from '../app/js/problems.js';
import { POOLS, validatePools } from '../app/js/bank.js';
import { SKILLS, SKILL } from '../app/js/skills.js';

test('every bank entry is well formed', () => {
  assert.deepEqual(validatePools(), []);
});

test('no question is asked twice across the bank', () => {
  const seen = new Map();
  for (const [id, list] of Object.entries(POOLS)) for (const it of list) {
    assert.ok(!seen.has(it.q), `"${it.q}" is in ${id} and ${seen.get(it.q)}`);
    seen.set(it.q, id);
  }
});

test('every skill has a pool, every pool belongs to a skill, and pools are deep enough', () => {
  const used = new Set();
  for (const sk of SKILLS) {
    const g = sk.gen[1];
    assert.equal(sk.gen[0], 'quiz', sk.id);
    if (g.all) { Object.keys(POOLS).forEach((n) => used.add(n)); continue; }
    for (const n of g.pools || [g.pool]) { assert.ok(POOLS[n], `${sk.id}: no pool ${n}`); assert.ok(POOLS[n].length >= 8, `${n} has ${POOLS[n].length}`); used.add(n); }
  }
  for (const n of Object.keys(POOLS)) assert.ok(used.has(n), `pool ${n} is not used`);
  assert.ok(Object.values(POOLS).flat().length >= 200);
});

test('a problem is one step whose digit is the number of the correct choice', () => {
  const rng = makeRng(7);
  for (const sk of SKILLS) {
    for (let i = 0; i < 40; i++) {
      const p = makeProblem(sk.id, rng);
      assert.equal(p.kind, 'quiz');
      assert.equal(p.steps.length, 1);
      const n = Number(p.steps[0].digit);
      assert.ok(n >= 1 && n <= p.choices.length, `${sk.id}: digit ${n}`);
      const item = _internal.poolOf(SKILL[sk.id]).find((e) => e.item.q === p.text).item;
      assert.equal(p.choices[n - 1], item.c[item.a ?? 0], `${sk.id}: ${p.text}`);
      assert.deepEqual([...p.choices].sort(), [...item.c].sort());
      assert.ok(p.explain, `${sk.id}: no explanation`);
      assert.ok(p.cells.some((c) => c.id === p.steps[0].cell && c.kind === 'input'));
    }
  }
});

test('the correct answer lands on every number over many draws', () => {
  const rng = makeRng(11);
  const count = [0, 0, 0, 0];
  for (let i = 0; i < 400; i++) count[Number(makeProblem('lb-truck', rng).steps[0].digit) - 1] += 1;
  for (const c of count) assert.ok(c > 50, count.join());
});

test('"fix" keeps the written order of the choices', () => {
  const p = buildQuiz({ q: 'x', c: ['ア', 'イ', 'ウ', 'エ'], a: 2, e: 'e', fix: true }, makeRng(1), 't');
  assert.deepEqual(p.choices, ['ア', 'イ', 'ウ', 'エ']);
  assert.equal(p.steps[0].digit, '3');
});

test('recent questions are avoided until the pool is used up, then the oldest returns', () => {
  const rng = makeRng(5);
  const size = POOLS.vh_shaken.length;
  const recent = new Set();
  const seen = [];
  for (let i = 0; i < size; i++) { const p = makeProblem('vh-shaken', rng, recent); seen.push(p.text); recent.add(signature(p)); }
  assert.equal(new Set(seen).size, size);
  const again = makeProblem('vh-shaken', rng, recent);
  assert.equal(again.text, seen[0]); // asked longest ago
});

test('the final mix draws from every field', () => {
  const rng = makeRng(3);
  const titles = new Set();
  for (let i = 0; i < 300; i++) titles.add(makeProblem('mix-final', rng).title);
  assert.deepEqual([...titles].sort(), ['実務', '旅客', '労働', '貨物', '車両法', '道交法'].sort());
});

test('the correct choice is not given away by its length', () => {
  // The correct answer used to be the longest choice in ~58% of the bank (chance is 25%),
  // so length alone told the player which one to pick. Keep it near chance in both directions.
  const len = (s) => [...s].length;
  let total = 0, longest = 0, shortest = 0;
  for (const list of Object.values(POOLS)) for (const it of list) {
    const l = it.c.map(len);
    const rest = l.slice(1);
    total++;
    if (l[0] > Math.max(...rest)) longest++;
    if (l[0] < Math.min(...rest)) shortest++;
  }
  assert.ok(longest / total < 0.30, `correct is strictly the longest in ${(longest / total * 100).toFixed(1)}% of questions`);
  assert.ok(shortest / total < 0.30, `correct is strictly the shortest in ${(shortest / total * 100).toFixed(1)}% of questions`);
});
