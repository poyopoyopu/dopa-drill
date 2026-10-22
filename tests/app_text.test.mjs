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

// 教科書(tools/kyokasho → app/kyokasho)
import { readdirSync } from 'node:fs';
import { chapters, renderChapter, renderIndex, renderSitemap } from '../tools/build_kyokasho.mjs';

test('every skill has a kyokasho chapter and the generated pages are up to date (run node tools/build_kyokasho.mjs)', () => {
  const list = chapters();
  assert.deepEqual(list.map((x) => x.skill.id).sort(), SKILLS.map((s) => s.id).sort());
  for (const { skill } of list) {
    const file = readFileSync(new URL(`../app/kyokasho/${skill.id}.html`, import.meta.url), 'utf8');
    assert.equal(file, renderChapter(skill.id), skill.id);
  }
  assert.equal(readFileSync(new URL('../app/kyokasho/index.html', import.meta.url), 'utf8'), renderIndex());
  assert.equal(readFileSync(new URL('../app/sitemap.xml', import.meta.url), 'utf8'), renderSitemap());
});

test('kyokasho chapters only link to pages that exist', () => {
  const pages = new Set(readdirSync(new URL('../app/kyokasho/', import.meta.url)));
  for (const { skill, ch } of chapters()) {
    for (const m of ch.body.matchAll(/href="([^"#]+)(#[^"]*)?"/g)) {
      const href = m[1];
      if (href.startsWith('../') || href === './') continue;
      assert.ok(pages.has(href), `${skill.id}: broken link ${href}`);
    }
  }
});

// 教科書の文節区切り(tools/budoux)
import { insertWbr } from '../tools/budoux/phrase.mjs';

test('insertWbr only adds <wbr> between phrases and leaves text, tags and figures alone', () => {
  const html = '<h2>なぜ運転時間にも上限があるの?</h2><p>前日とも<b>翌日とも</b>超えたら違反</p><svg><text>平均9.5 超</text></svg><div class="ticks"><span>1か月の時間外</span></div>';
  const out = insertWbr(html);
  assert.ok(out.includes('<wbr>'));
  assert.equal(out.replace(/<wbr>/g, ''), html);
  assert.ok(out.includes('<svg><text>平均9.5 超</text></svg>'));
  assert.ok(!/<div class="ticks">[^]*?<wbr>[^]*?<\/div>/.test(out));
  // 1文字だけの切れはしは作らない
  for (const seg of out.replace(/<[^w][^>]*>|<\/[^>]+>/g, '|').split(/<wbr>|\|/)) assert.notEqual(seg.length, 1, seg);
});

test('kyokasho text is identical with or without the phrase breaks', () => {
  for (const { skill } of chapters()) {
    const raw = readFileSync(new URL(`../tools/kyokasho/${skill.id}.html`, import.meta.url), 'utf8');
    const strip = (s) => s.replace(/<span class="no">\d+<\/span>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    assert.ok(strip(renderChapter(skill.id)).includes(strip(raw.replace(/^\s*<!--[\s\S]*?-->/, ''))), skill.id);
  }
});
