// 法令確認日・誤りの報告・利用状況の計測。画面の文言と設定が食い違わないようにする。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LAW_CHECKED, lawCheckedLabel, reportHref } from '../app/js/trust.js';
import { ANALYTICS_TOKEN, loadAnalytics } from '../app/js/analytics.js';
import { POOLS } from '../app/js/bank.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('the law-checked date is shown the same way everywhere', () => {
  assert.match(LAW_CHECKED, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(lawCheckedLabel('2026-10-24'), '2026年10月24日');
  assert.equal(lawCheckedLabel('bad'), '');
  const label = lawCheckedLabel();
  for (const f of ['app/index.html', 'app/about.html', 'app/help.html']) assert.ok(read(f).includes(label), `${f} should show ${label}`);
});

test('the question count written on the pages matches the bank', () => {
  const n = Object.values(POOLS).flat().length;
  assert.match(read('app/index.html'), new RegExp(`${n}問と本番`));
  assert.match(read('app/about.html'), new RegExp(`4択問題${n}問`));
  assert.match(read('README.md'), new RegExp(`4択問題 ${n}問`));
});

test('every question names its source and has an explanation', () => {
  for (const [id, list] of Object.entries(POOLS)) list.forEach((it, i) => {
    assert.ok(it.s && it.s.trim(), `${id}[${i}] has no source`);
    assert.ok(it.e && it.e.trim(), `${id}[${i}] has no explanation`);
  });
});

test('the error report is a mail draft that carries the question', () => {
  const p = { text: '運行記録計の記録の保存期間は？', source: '貨物自動車運送事業輸送安全規則 第9条', answer: '① 1年間' };
  const href = reportHref(p);
  assert.ok(href.startsWith('mailto:'));
  const url = new URL(href);
  assert.ok(url.pathname.includes('@'));
  assert.ok(url.searchParams.get('subject').includes('誤り'));
  const body = url.searchParams.get('body');
  assert.ok(body.includes(p.text) && body.includes(p.source) && body.includes(p.answer));
  assert.ok(body.includes(lawCheckedLabel()));
  assert.doesNotMatch(read('app/index.html') + read('app/js/trust.js'), /sotaexportjp@/); // not spelled out in one piece
  assert.ok(reportHref({ text: 'あ'.repeat(5000), source: 'い'.repeat(500), answer: 'う'.repeat(500) }).length < 3000); // long questions are cut so the link stays usable
});

test('analytics stays off without a token, and respects Do Not Track', () => {
  const made = [];
  const doc = { createElement: () => { const el = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }; return el; }, head: { appendChild: (el) => made.push(el) } };
  const token = 'a'.repeat(32);
  assert.equal(loadAnalytics(doc, {}, ''), false);
  assert.equal(loadAnalytics(doc, {}, 'not-a-token'), false);
  assert.equal(loadAnalytics(doc, { doNotTrack: '1' }, token), false);
  assert.equal(loadAnalytics(doc, { globalPrivacyControl: true }, token), false);
  assert.equal(made.length, 0);
  assert.equal(loadAnalytics(doc, {}, token), true);
  assert.equal(made.length, 1);
  assert.equal(made[0].src, 'https://static.cloudflareinsights.com/beacon.min.js');
  assert.deepEqual(JSON.parse(made[0].attrs['data-cf-beacon']), { token });
  assert.equal(loadAnalytics(null, {}, token), false);
});

test('the privacy policy matches whether analytics is on', () => {
  const about = read('app/about.html');
  const readme = read('README.md');
  if (ANALYTICS_TOKEN) {
    assert.ok(about.includes('Cloudflare Web Analytics'), 'about.html must name the analytics tool');
    assert.ok(!about.includes('アクセス解析ツールや広告配信のためのCookieを使っていません'), 'about.html still says no analytics');
    assert.ok(readme.includes('Cloudflare Web Analytics'), 'README must mention the analytics');
  } else {
    assert.ok(!about.includes('Cloudflare Web Analytics'), 'about.html mentions analytics that is not on');
  }
});
