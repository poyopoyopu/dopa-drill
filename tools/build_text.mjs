// app/text.html(要点ノート)を tools/notes/*.mjs から生成する。
// 使い方: node tools/build_text.mjs   (ノートを書き換えたら実行して、生成物もコミットする)
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SKILLS, LANES } from '../app/js/skills.js';
import { NOTES } from './notes/index.mjs';

const OUT = fileURLToPath(new URL('../app/text.html', import.meta.url));
const UPDATED = '2026年10月';

// 分野ごとにまとめる(スキルIDの先頭で分ける)。並びは試験の科目順。
export const GROUPS = [
  { key: 'cg', title: '貨物自動車運送事業法', sub: '貨物の試験' },
  { key: 'ps', title: '道路運送法', sub: '旅客の試験' },
  { key: 'vh', title: '道路運送車両法', sub: '貨物・旅客 共通' },
  { key: 'tr', title: '道路交通法', sub: '貨物・旅客 共通' },
  { key: 'lb', title: '労働基準法・改善基準告示', sub: 'トラック・バス・タクシー' },
  { key: 'pr', title: '実務上の知識及び能力', sub: '貨物・旅客 共通' },
  { key: 'mix', title: '総まとめ', sub: '試験のしくみ' },
];

// 教科書(tools/kyokasho/<id>.html)がある章には、くわしい解説へのリンクを付ける
const hasKyokasho = (id) => existsSync(fileURLToPath(new URL(`./kyokasho/${id}.html`, import.meta.url)));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const groupOf = (id) => id.split('-')[0];
const skillsIn = (key) => SKILLS.filter((s) => groupOf(s.id) === key).sort((a, b) => a.grade - b.grade);

export function renderText() {
  const toc = GROUPS.map((g) => `
      <div class="toc-group">
        <a class="toc-head" href="#g-${g.key}">${esc(g.title)}<small>${esc(g.sub)}</small></a>
        <ul>${skillsIn(g.key).map((s) => `<li><a href="#${s.id}"><span class="st">${s.grade}</span>${esc(s.name)}</a></li>`).join('')}</ul>
      </div>`).join('');

  const body = GROUPS.map((g) => `
    <h2 class="group" id="g-${g.key}">${esc(g.title)}<small>${esc(g.sub)}</small></h2>
${skillsIn(g.key).map((s) => {
    const n = NOTES[s.id];
    return `    <section class="note" id="${s.id}" aria-labelledby="h-${s.id}">
      <p class="meta"><span class="stage">ステージ${s.grade}</span>${esc(LANES[s.lane])}</p>
      <h3 id="h-${s.id}">${esc(s.name)}</h3>
      <p class="lead">${esc(n.lead)}</p>
      <ul>
${n.points.map((p) => `        <li>${esc(p)}</li>`).join('\n')}
      </ul>
      <p class="src">出典の目安：${esc(n.src)}</p>${hasKyokasho(s.id) ? `
      <a class="kai" href="kyokasho/${s.id}.html">教科書で図と例題を見る →</a>` : ''}
      <a class="up" href="#toc">もくじへ</a>
    </section>`;
  }).join('\n')}`).join('\n');

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#2552c9">
  <title>要点ノート(運行管理者試験のテキスト)｜運行管理ドリル</title>
  <meta name="description" content="運行管理者試験(貨物・旅客)の要点を、48のスキルごとにまとめた無料のテキスト。貨物自動車運送事業法・道路運送法、道路運送車両法、道路交通法、労働基準法(改善基準告示)、実務上の知識の覚えるポイント。">
  <link rel="canonical" href="https://unko-drill.pages.dev/text.html">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="運行管理ドリル">
  <meta property="og:title" content="要点ノート(運行管理者試験のテキスト)｜運行管理ドリル">
  <meta property="og:description" content="運行管理者試験の覚えるポイントを、48スキルごとにまとめた無料のテキスト。">
  <meta property="og:url" content="https://unko-drill.pages.dev/text.html">
  <meta property="og:image" content="https://unko-drill.pages.dev/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" href="/apple-touch-icon.png">
  <link rel="icon" href="icon.svg" type="image/svg+xml">
  <style>
    @font-face { font-family: "Dela Gothic One"; src: url(fonts/dela-gothic-one.woff2) format("woff2"); font-display: swap; }
    @font-face { font-family: "Zen Maru Gothic"; src: url(fonts/zen-maru-gothic-black.woff2) format("woff2"); font-weight: 900; font-display: swap; }
    :root { --ink: #1b1d4d; --paper: #fff8ec; --card: #fff; --sign: #2552c9; --pink: #e8558f; --muted: #5b5f8f; --line: #d9daf0; --soft: #eef1ff;
      --text: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif;
      --round: "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", "Yu Gothic", sans-serif;
      --chunky: "Dela Gothic One", "Zen Maru Gothic", "Hiragino Sans", sans-serif; color-scheme: light; }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
    @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--text); font-size: 16px; line-height: 1.85;
      background-image: linear-gradient(rgba(59,107,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,107,255,.07) 1px, transparent 1px); background-size: 28px 28px; }
    .wrap { max-width: 760px; margin: 0 auto; padding-block: calc(24px + env(safe-area-inset-top, 0px)) calc(48px + env(safe-area-inset-bottom, 0px));
      padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 18px; }
    .back { justify-self: start; color: var(--ink); font-family: var(--round); font-weight: 900; text-decoration: none; padding: 6px 14px; border: 3px solid var(--ink); border-radius: 14px; background: var(--card); box-shadow: 0 4px 0 var(--ink); }
    .plate { justify-self: start; background: var(--sign); color: #fff; border: 4px solid var(--ink); border-radius: 12px; box-shadow: 0 6px 0 var(--ink); padding: 4px; }
    .plate h1 { margin: 0; padding: 8px 18px 10px; border: 3px solid #fff; border-radius: 8px; font-family: var(--chunky); font-weight: 400; font-size: clamp(26px, 8vw, 38px); line-height: 1.25; }
    .card { background: var(--card); border: 3px solid var(--ink); border-radius: 18px; padding: 16px 18px; box-shadow: 0 5px 0 var(--ink); }
    .card p { margin: 0; }
    .card p + p { margin-top: 8px; }
    .note-small { color: var(--muted); font-size: 14px; }
    .toc { display: grid; gap: 14px; }
    .toc h2 { margin: 0; font-family: var(--chunky); font-weight: 400; font-size: 22px; }
    .toc-group ul { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
    .toc-head { display: inline-flex; align-items: baseline; gap: 8px; color: var(--ink); text-decoration: none; font-family: var(--round); font-weight: 900; font-size: 17px; }
    .toc-head small, .group small { font-family: var(--text); font-weight: 400; font-size: 12px; color: var(--muted); }
    .toc-group li a { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px 3px 4px; border: 2px solid var(--ink); border-radius: 999px; background: var(--soft); color: var(--ink); text-decoration: none; font-size: 14px; line-height: 1.5; }
    .st { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--sign); color: #fff; font-size: 11px; font-weight: 700; }
    .group { margin: 18px 0 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; font-family: var(--chunky); font-weight: 400; font-size: 24px; line-height: 1.35; scroll-margin-top: 16px; }
    .note { background: var(--card); border: 3px solid var(--ink); border-radius: 18px; padding: 16px 18px 14px; box-shadow: 0 5px 0 var(--ink); scroll-margin-top: 16px; display: grid; }
    .note .meta { margin: 0; font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
    .stage { padding: 0 8px; border-radius: 6px; background: var(--sign); color: #fff; font-size: 12px; line-height: 1.7; }
    .note h3 { margin: 2px 0 0; font-family: var(--round); font-weight: 900; font-size: 21px; line-height: 1.4; }
    .lead { margin: 6px 0 0; padding: 8px 12px; border-radius: 10px; background: var(--soft); font-size: 15px; }
    .note ul { margin: 10px 0 0; padding-left: 1.25em; }
    .note li + li { margin-top: 6px; }
    .note li::marker { color: var(--pink); }
    .src { margin: 10px 0 0; color: var(--muted); font-size: 13px; }
    .kai { justify-self: start; margin-top: 10px; padding: 4px 12px; border: 2px solid var(--ink); border-radius: 12px; background: var(--soft); color: var(--ink); font-weight: 700; font-size: 14px; text-decoration: none; }
    .up { justify-self: end; margin-top: 4px; font-size: 13px; color: var(--sign); }
    a { color: var(--sign); }
    a:focus-visible { outline: 3px solid var(--pink); outline-offset: 2px; }
    .cta { justify-self: center; display: inline-flex; padding: 10px 22px; border-radius: 16px; background: var(--pink); color: #fff; text-decoration: none; font-family: var(--round); font-weight: 900; border: 3px solid var(--ink); box-shadow: 0 5px 0 var(--ink); }
    footer { text-align: center; color: var(--muted); font-size: 13px; }
  </style>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-MX8CVM9VX3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-MX8CVM9VX3');
  </script>
</head>
<body>
  <main class="wrap">
    <a class="back" href="./">← ドリルにもどる</a>
    <div class="plate"><h1>要点ノート</h1></div>

    <div class="card">
      <p>運行管理者試験(貨物・旅客)の覚えるポイントを、ドリルの48スキルごとにまとめたテキストです。問題を解く前の予習や、まちがえたあとの見直しに使ってください。</p>
      <p>図と例題で「なぜそうなるか」から読みたいときは<a href="kyokasho/">教科書</a>へ。</p>
      <p class="note-small">ドリルの問題の解説と出典(条文・告示・国土交通省の資料など)をもとにまとめています(${UPDATED}時点)。法令や告示は改正されることがあるので、試験の前には必ず最新の公式資料で確認してください。</p>
    </div>

    <nav class="card toc" id="toc" aria-labelledby="toc-title">
      <h2 id="toc-title">もくじ</h2>${toc}
    </nav>
${body}

    <a class="cta" href="./">ドリルで問題を解く</a>
    <footer><a href="about.html">このサイトについて・プライバシーポリシー</a></footer>
  </main>
</body>
</html>
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(OUT, renderText());
  console.log(`wrote ${OUT}`);
}
