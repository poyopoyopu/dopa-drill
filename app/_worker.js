// pages.dev でアクセスされた場合は独自ドメインへ 301 転送する。
// それ以外は通常どおり静的アセットを返す（_headers の内容もここで再適用する）。
// 下書きファイル（未検品の問題）は公開しない。
// app/ 配下のファイルはすべてそのまま配信されるため、ページから読み込まれない
// 下書きでも URL を直接指定すれば取得できてしまう。ここで 404 を返して塞ぐ。
// 下書き本体は 2026-11-20 に drafts/（app/ の外）へ移設済みだが、旧パス（/js/）と
// 移設先パス（/drafts/）のどちらへの直接アクセスにも 404 を返す二重防御として残す。
// 対象パターンの網羅は tests/app_publish_guard.test.mjs が検証する。
const DRAFT_PATH = /^\/(?:js|drafts)\/(?:bank_draft_[^/]+|skills_[^/]+_draft)\.js$/;
// /books は現行サイトに存在しない旧パス。SPAフォールバックでトップが返り、
// Search Console で重複ページ扱いになるため、明示的に 404 を返す（2026-11-23 SEO監査）。
const GONE_PATH = /^\/books(?:\.html)?$/;
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (DRAFT_PATH.test(url.pathname) || GONE_PATH.test(url.pathname)) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate, no-transform',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    if (url.hostname.endsWith('.pages.dev')) {
      url.hostname = 'unkou.shikaku-drill.net';
      return Response.redirect(url.toString(), 301);
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    // JS/CSS/JSON はプラットフォーム既定の max-age=14400 を上書きし、毎回再確認させる（コード・問題データの修正を即時反映するため）
    if (/\.(?:js|css|json)$/.test(url.pathname)) out.headers.set('Cache-Control', 'public, max-age=0, must-revalidate, no-transform');
    if (!out.headers.has('Cache-Control')) out.headers.set('Cache-Control', 'public, max-age=0, must-revalidate, no-transform');
    if (!out.headers.has('X-Content-Type-Options')) out.headers.set('X-Content-Type-Options', 'nosniff');
    return out;
  },
};
