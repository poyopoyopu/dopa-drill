// 利用状況の計測(Cloudflare Web Analytics)。トークンが空のあいだは何もしない。
//
// 使い方は docs/analytics.md。トークンを入れたら、about.html のプライバシーポリシーと
// README の記述も同時に直す(tests/app_trust.test.mjs が食い違いを見つける)。
// Cookie は使わず、個人を特定する情報も集めない。ブラウザの「トラッキング拒否」がオンなら読み込まない。
export const ANALYTICS_TOKEN = '';

const BEACON = 'https://static.cloudflareinsights.com/beacon.min.js';

export function loadAnalytics(doc = globalThis.document, nav = globalThis.navigator, token = ANALYTICS_TOKEN) {
  if (!doc || !/^[0-9a-f]{32}$/.test(token)) return false;
  if (nav && (nav.doNotTrack === '1' || nav.globalPrivacyControl === true)) return false;
  const s = doc.createElement('script');
  s.defer = true;
  s.src = BEACON;
  s.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  doc.head.appendChild(s);
  return true;
}
