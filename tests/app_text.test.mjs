// 要点ノート(tools/notes)と生成ページ(app/text.html)の確認。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS } from '../app/js/skills.js';
import { NOTES } from '../tools/notes/index.mjs';
import { renderText, GROUPS } from '../tools/build_text.mjs';

test('every skill has a note with a lead, points and a source', () => {
  for (const s of SKILLS) {
    const n = NOTES[s.id];
    assert.ok(n, `no note for ${s.id}`);
    assert.ok(n.lead && n.src, `${s.id}: lead/src missing`);
    assert.ok(Array.isArray(n.points) && n.points.length >= 3, `${s.id}: too few points`);
  }
  assert.deepEqual(Object.keys(NOTES).sort(), SKILLS.map((s) => s.id).sort());
});

test('every skill belongs to a group on the page', () => {
  const keys = new Set(GROUPS.map((g) => g.key));
  for (const s of SKILLS) assert.ok(keys.has(s.id.split('-')[0]), s.id);
});

test('app/text.html is up to date (run node tools/build_text.mjs)', () => {
  const file = readFileSync(new URL('../app/text.html', import.meta.url), 'utf8');
  assert.equal(file, renderText());
  for (const s of SKILLS) assert.ok(file.includes(`id="${s.id}"`), s.id);
});
