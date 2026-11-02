// pages.dev でアクセスされた場合は独自ドメインへ 301 転送する。
// それ以外は通常どおり静的アセットを返す（_headers の内容もここで再適用する）。
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.endsWith('.pages.dev')) {
      url.hostname = 'unkou.shikaku-drill.net';
      return Response.redirect(url.toString(), 301);
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    if (!out.headers.has('Cache-Control')) out.headers.set('Cache-Control', 'public, max-age=0, must-revalidate, no-transform');
    if (!out.headers.has('X-Content-Type-Options')) out.headers.set('X-Content-Type-Options', 'nosniff');
    return out;
  },
};
