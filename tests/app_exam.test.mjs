// The mock exam: field sizes, no repeats, and the pass rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAM, buildExam, judgeExam, examSize, passLine } from '../app/js/exam.js';
import { makeRng } from '../app/js/problems.js';
import { POOLS } from '../app/js/bank.js';

test('both exams have 30 questions split 8/4/5/6/7, with a pass line of 18', () => {
  for (const kind of Object.keys(EXAM)) {
    assert.deepEqual(EXAM[kind].fields.map((f) => f.n), [8, 4, 5, 6, 7]);
    assert.equal(examSize(kind), 30);
    assert.equal(passLine(kind), 18);
    for (const f of EXAM[kind].fields) {
      assert.ok(f.pools.length > 0, `${kind}: ${f.label} has no pools`);
      const n = new Set(f.pools.flatMap((p) => POOLS[p].map((it) => it.q))).size;
      assert.ok(n >= f.n * 3, `${kind}: ${f.label} has only ${n} questions`);
    }
  }
});

test('a built exam follows the field order, never repeats, and keys the right answer', () => {
  for (const kind of Object.keys(EXAM)) for (let s = 1; s <= 20; s++) {
    const ps = buildExam(kind, makeRng(s));
    assert.equal(ps.length, 30);
    assert.equal(new Set(ps.map((p) => p.text)).size, 30);
    const fields = ps.map((p) => p.examField);
    assert.deepEqual(fields, fields.slice().sort((a, b) => a - b));
    for (const p of ps) {
      const n = Number(p.steps[0].digit);
      const item = POOLS[p.pool].find((it) => it.q === p.text);
      assert.equal(p.choices[n - 1], item.c[item.a ?? 0]);
    }
  }
});

test('the cargo exam asks no bus/taxi labour rules, the bus exam no truck-only ones', () => {
  const lb = (kind) => EXAM[kind].fields[3].pools;
  assert.ok(!lb('cargo').includes('lb_bus') && !lb('cargo').includes('lb_taxi'));
  assert.ok(!lb('bus').includes('lb_truck'));
  assert.ok(EXAM.cargo.fields[0].pools.every((p) => p.startsWith('cg_')));
  assert.ok(EXAM.bus.fields[0].pools.every((p) => p.startsWith('ps_')));
});

test('pass needs 18 overall, 1 in fields 1-4 and 2 in field 5', () => {
  const log = (counts) => counts.flatMap((ok, field) => Array.from({ length: [8, 4, 5, 6, 7][field] }, (_, i) => ({ field, ok: i < ok })));
  assert.equal(judgeExam('cargo', log([8, 4, 5, 6, 7])).pass, true);
  assert.equal(judgeExam('cargo', log([5, 2, 3, 4, 4])).pass, true); // exactly 18
  assert.equal(judgeExam('cargo', log([5, 2, 3, 3, 4])).pass, false); // 17
  assert.equal(judgeExam('cargo', log([8, 0, 5, 6, 7])).pass, false); // a field with none
  const r = judgeExam('bus', log([8, 4, 5, 6, 1]));
  assert.equal(r.total, 24);
  assert.equal(r.pass, false); // field 5 needs 2
  assert.equal(r.fields[4].pass, false);
});
