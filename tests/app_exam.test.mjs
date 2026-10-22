// The mock exam: field sizes, no repeats, and the pass rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAM, EXAM_MS, buildExam, judgeExam, examSize, passLine, weakSpot, skillOfPool, examRecord, examTrend } from '../app/js/exam.js';
import { SKILL } from '../app/js/skills.js';
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

test('the exam lasts 90 minutes, and every exam pool belongs to a skill', () => {
  assert.equal(EXAM_MS, 90 * 60 * 1000);
  for (const kind of Object.keys(EXAM)) for (const f of EXAM[kind].fields) for (const p of f.pools) assert.ok(SKILL[skillOfPool(p)], `${p} has no skill`);
});

test('the weak spot is a failed field first, then the lowest share, and the skill missed most', () => {
  const sizes = [8, 4, 5, 6, 7];
  const all = () => sizes.flatMap((n, field) => Array.from({ length: n }, () => ({ field, ok: true, pool: EXAM.cargo.fields[field].pools[0] })));
  assert.equal(judgeExam('cargo', all()).weak, null);
  // field 1 (車両法) 2/4 with two vh_standard misses; field 4 (実務) 1/7 fails
  const log = all();
  log[8].ok = false; log[8].pool = 'vh_standard'; log[9].ok = false; log[9].pool = 'vh_standard';
  for (let i = 23; i < 29; i++) { log[i].ok = false; log[i].pool = i < 25 ? 'pr_body' : 'pr_calc'; }
  let w = weakSpot('cargo', log);
  assert.equal(w.field, 4);
  assert.equal(w.pool, 'pr_calc');
  assert.equal(w.skill, 'pr-calc');
  // with field 4 passing, the lowest share (2/4 = 50%) wins
  for (let i = 23; i < 29; i++) log[i].ok = i < 27;
  w = weakSpot('cargo', log);
  assert.equal(w.field, 1);
  assert.equal(w.skill, 'vh-standard');
  assert.equal(w.misses, 2);
});

test('time running out leaves questions unanswered and wrong', () => {
  const log = [{ field: 0, ok: true, pool: 'cg_basic' }];
  const r = judgeExam('cargo', log);
  assert.equal(r.answered, 1);
  assert.equal(r.total, 1);
  assert.equal(r.pass, false);
  assert.ok(SKILL[r.weak.skill]);
});

test('exam records keep the score per field, and the trend lists one kind, oldest first', () => {
  const r = judgeExam('bus', [{ field: 0, ok: true, pool: 'ps_basic' }, { field: 4, ok: true, pool: 'pr_body' }]);
  const rec = examRecord(r);
  assert.deepEqual(rec, { exam: 'bus', total: 2, max: 30, pass: false, fields: [1, 0, 0, 0, 1], answered: 2 });
  const hist = [
    { mode: 'exam', exam: 'cargo', total: 15, max: 30, at: 1 },
    { mode: 'level', at: 2 },
    { mode: 'exam', exam: 'bus', total: 20, max: 30, at: 3 },
    { mode: 'exam', exam: 'cargo', at: 4 }, // an exam from before records were kept
    { mode: 'exam', exam: 'cargo', total: 21, max: 30, at: 5 },
  ];
  assert.deepEqual(examTrend(hist, 'cargo').map((h) => h.total), [15, 21]);
  assert.deepEqual(examTrend(hist, 'cargo', 1).map((h) => h.total), [21]);
});
