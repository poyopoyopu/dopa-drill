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

// 解説テキスト(tools/kaisetsu → app/kaisetsu)
import { readdirSync } from 'node:fs';
import { chapters, renderChapter, renderIndex, renderSitemap } from '../tools/build_kaisetsu.mjs';

test('every skill has a kaisetsu chapter and the generated pages are up to date (run node tools/build_kaisetsu.mjs)', () => {
  const list = chapters();
  assert.deepEqual(list.map((x) => x.skill.id).sort(), SKILLS.map((s) => s.id).sort());
  for (const { skill } of list) {
    const file = readFileSync(new URL(`../app/kaisetsu/${skill.id}.html`, import.meta.url), 'utf8');
    assert.equal(file, renderChapter(skill.id), skill.id);
  }
  assert.equal(readFileSync(new URL('../app/kaisetsu/index.html', import.meta.url), 'utf8'), renderIndex());
  assert.equal(readFileSync(new URL('../app/sitemap.xml', import.meta.url), 'utf8'), renderSitemap());
});

test('kaisetsu chapters only link to pages that exist', () => {
  const pages = new Set(readdirSync(new URL('../app/kaisetsu/', import.meta.url)));
  for (const { skill, ch } of chapters()) {
    for (const m of ch.body.matchAll(/href="([^"#]+)(#[^"]*)?"/g)) {
      const href = m[1];
      if (href.startsWith('../') || href === './') continue;
      assert.ok(pages.has(href), `${skill.id}: broken link ${href}`);
    }
  }
});
