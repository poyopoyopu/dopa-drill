// 公開ガード: 下書きファイル（未検品の問題）が本番で配信されないこと。
// app/ 配下は Cloudflare Pages がそのまま配信するため、ページから読み込まれない
// 下書きでも URL を直接指定すれば誰でも取得できてしまう（2026-11-16 に発覚）。
// 下書き本体は 2026-11-20 に app/js から drafts/（app/ の外）へ移設した。
// _worker.js のガードは二重防御として残し、旧パス（/js/）と移設先パス（/drafts/）の
// どちらへの直接アクセスにも 404 を返すことを、実物の worker で検証する。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import worker from '../app/_worker.js';

const HOST = 'https://unkou.shikaku-drill.net';
const fakeEnv = { ASSETS: { fetch: async () => new Response('ASSET', { status: 200 }) } };
const get = (path) => worker.fetch(new Request(HOST + path), fakeEnv);

// 2026-11-16 に露出が確認された2ファイル。原典は drafts/ に残す（消さない）ことも含めて確認する。
const KNOWN_DRAFTS = ['bank_draft_labor_law.js', 'bank_draft_traffic.js'];

test('下書きは drafts/ にあり、/drafts/ でも旧パス /js/ でも 404 になる', async () => {
  const drafts = readdirSync(new URL('../drafts/', import.meta.url))
    .filter((name) => name.includes('draft'));
  assert.ok(drafts.length > 0, '下書きファイルが1つも見つからない（走査パスの間違いの可能性）');
  for (const name of KNOWN_DRAFTS) assert.ok(drafts.includes(name), `${name} が drafts/ に無い（原典は drafts/ に残す決まり）`);
  for (const name of drafts) {
    const res = await get(`/drafts/${name}`);
    assert.equal(res.status, 404, `${name} が配信されてしまう`);
  }
  for (const name of drafts) {
    const res = await get(`/js/${name}`);
    assert.equal(res.status, 404, `旧パス /js/${name} が配信されてしまう`);
  }
});

test('app/js に下書きファイルが残っていない', async () => {
  const appDrafts = readdirSync(new URL('../app/js/', import.meta.url))
    .filter((name) => name.includes('draft'));
  assert.deepEqual(appDrafts, [], `app/js に下書きが残っている: ${appDrafts.join(', ')}`);
});

test('本番ファイルは通常どおり配信される', async () => {
  for (const path of ['/js/bank_cargo.js', '/js/skills.js', '/js/main.js', '/js/affiliate.js', '/index.html', '/style.css']) {
    const res = await get(path);
    assert.equal(res.status, 200, `${path} がブロックされている`);
    assert.equal(await res.text(), 'ASSET');
  }
});
