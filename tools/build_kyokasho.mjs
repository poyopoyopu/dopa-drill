// 教科書(app/kyokasho/*.html)を tools/kyokasho/<スキルID>.html から生成する。
// 使い方: node tools/build_kyokasho.mjs   (本文を書き換えたら実行して、生成物もコミットする)
//
// 本文ファイルの書き方:
//   先頭に <!-- title: 章の題名 / src: 出典 --> の形でメタ情報を書き、あとは <section class="card"> を並べる。
//   <h2>見出し</h2> には番号が自動で付く。番号を付けたくない見出しは <h2 class="plain">。
//   図の部品は app/kyokasho/kyokasho.css を参照。
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SKILLS, LANES } from '../app/js/skills.js';
import { NOTES } from './notes/index.mjs';
import { GROUPS } from './build_text.mjs';
import { insertWbr } from './budoux/phrase.mjs';
import { BOOKS, booksFor } from '../app/js/affiliate.js';

const SRC_DIR = fileURLToPath(new URL('./kyokasho/', import.meta.url));
const OUT_DIR = fileURLToPath(new URL('../app/kyokasho/', import.meta.url));
const SITE = 'https://unko-drill.pages.dev';
const UPDATED = '2026年10月';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const groupOf = (id) => id.split('-')[0];
const groupMeta = (id) => GROUPS.find((g) => g.key === groupOf(id));

// 並び順：分野(試験の科目順) → ステージ
export const ORDER = GROUPS.flatMap((g) => SKILLS.filter((s) => groupOf(s.id) === g.key).sort((a, b) => a.grade - b.grade));

export function readChapter(id) {
  const file = `${SRC_DIR}${id}.html`;
  if (!existsSync(file)) return null;
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^\s*<!--([\s\S]*?)-->/);
  if (!m) throw new Error(`${id}: メタ情報のコメントがありません`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/);
    if (mm) meta[mm[1]] = mm[2];
  }
  if (!meta.title || !meta.src) throw new Error(`${id}: title / src がありません`);
  let n = 0;
  // 文節の区切りに <wbr> を入れてから見出しに番号を付ける(番号と見出しの文がつながらないように)
  const body = insertWbr(raw.slice(m[0].length).trim())
    .replace(/<h2>/g, () => `<h2><span class="no">${++n}</span>`);
  return { id, title: meta.title, src: meta.src, body };
}

export function chapters() {
  return ORDER.map((s) => ({ skill: s, ch: readChapter(s.id) })).filter((x) => x.ch);
}

// 章末の「PR」(問題集の紹介)。リンクを押すまで外部とは通信しない(画像なし)。
// 貨物の章は貨物編、旅客の章は旅客編、共通の章は両方を出す。
const KIND_LABEL = { cargo: '貨物編', bus: '旅客編' };
export function renderBooks(id) {
  const link = (url, ok, label) => (url && ok.test(url) ? `<a class="buy" href="${esc(url)}" target="_blank" rel="nofollow sponsored noopener">${label}</a>` : '');
  const items = booksFor(id).map((kind) => {
    const b = BOOKS[kind];
    if (!b) return null;
    const rakuten = link(b.url, /^https:\/\/hb\.afl\.rakuten\.co\.jp\//, '楽天ブックスで見る');
    const amazon = link(b.amazon, /^https:\/\/www\.amazon\.co\.jp\//, 'Amazonで見る');
        const kino = link(b.kinokuniya, /^https:\/\/ck\.jp\.ap\.valuecommerce\.com\//, '紀伊國屋で探す');
    const honto = link(b.honto, /^https:\/\/ck\.jp\.ap\.valuecommerce\.com\//, 'hontoで探す');
    if (!rakuten && !amazon && !kino && !honto) return null;
    return { amazon: !!amazon, html: `<li><span class="kind">${KIND_LABEL[kind]}</span><span class="ttl">${esc(b.title)}</span><span class="links">${rakuten}${amazon}${kino}${honto}</span></li>` };
  }).filter(Boolean);
  if (!items.length) return '';
  return `<aside class="book" aria-label="問題集の紹介(広告)">
    <p class="head"><span class="pr">PR</span>もっと問題を解きたい人へ</p>
    <ul>${items.map((x) => x.html).join('')}</ul>${items.some((x) => x.amazon) ? '\n    <p class="note">Amazonのアソシエイトとして、運行管理ドリルは適格販売により収入を得ています。</p>' : ''}
  </aside>
  `;
}

const head = ({ title, desc, path, type = 'article' }) => `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#2552c9">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${SITE}/${path}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="運行管理ドリル">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${SITE}/${path}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../icon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="kyokasho.css">
</head>
<body>
<main class="wrap">`;

export function renderChapter(id) {
  const list = chapters();
  const i = list.findIndex((x) => x.skill.id === id);
  const { skill, ch } = list[i];
  const g = groupMeta(id);
  const prev = list[i - 1];
  const next = list[i + 1];
  const desc = `運行管理者試験の教科書「${ch.title}」。${NOTES[id].lead}`;
  const pager = (x, cls, label) => (x ? `<a class="${cls}" href="${x.skill.id}.html"><small>${label}</small>${insertWbr(esc(x.ch.title))}</a>` : '');
  return `${head({ title: `${ch.title}｜教科書｜運行管理ドリル`, desc, path: `kyokasho/${id}.html` })}
  <nav class="topnav" aria-label="ページ移動"><a href="./">← 教科書のもくじ</a><a href="../">ドリル</a></nav>
  <div class="plate"><p>${esc(g.title)} ・ ステージ${skill.grade}</p><h1>${insertWbr(esc(ch.title))}</h1></div>

${ch.body}

  <a class="cta" href="../">ドリルで確かめる(${esc(skill.name)})</a>
  <p class="src" style="text-align:center;margin:0"><a href="../text.html#${id}">要点ノートで見直す</a></p>
  ${renderBooks(id)}<nav class="pager" aria-label="前後の章">${pager(prev, 'prev', '← まえの章')}${pager(next, 'next', 'つぎの章 →')}</nav>
  <p class="src">出典：${esc(ch.src)}。${UPDATED}時点の内容です。法令や告示は改正されることがあるので、試験の前には最新の公式資料で確認してください。</p>
</main>
</body>
</html>
`;
}

export function renderIndex() {
  const list = chapters();
  const groups = GROUPS.map((g) => {
    const items = list.filter((x) => groupOf(x.skill.id) === g.key);
    if (!items.length) return '';
    return `
  <section class="card toc-group" id="g-${g.key}">
    <h2 class="plain">${esc(g.title)} <small>${esc(g.sub)}</small></h2>
    <ul class="toc-list">
${items.map((x) => `      <li><a href="${x.skill.id}.html"><span class="st">${x.skill.grade}</span><span>${insertWbr(esc(x.ch.title))}<small>スキル「${esc(x.skill.name)}」・${esc(LANES[x.skill.lane])}</small></span></a></li>`).join('\n')}
    </ul>
  </section>`;
  }).join('');
  const desc = '運行管理者試験(貨物・旅客)の無料の教科書。図と例題で、改善基準告示・貨物自動車運送事業法・道路運送法・道路運送車両法・道路交通法・実務上の知識をわかりやすく解説。';
  return `${head({ title: '教科書(運行管理者試験)｜運行管理ドリル', desc, path: 'kyokasho/', type: 'website' })}
  <nav class="topnav" aria-label="ページ移動"><a href="../">← ドリルにもどる</a><a href="../text.html">要点ノート</a></nav>
  <div class="plate"><p>運行管理者試験</p><h1>教科書</h1></div>
  <section class="card">
    <p style="margin:0">ドリルの48スキルを、1スキル1章で学ぶ教科書です。問題を解く前に読んでおくと、ぐっと解きやすくなります。「なぜそう決まっているのか」から入って、図で見て、例題で確かめます。</p>
    <ul class="goal">
      <li><b>教科書で理解</b>(このページ)</li>
      <li><b>ドリルで復習</b>(4択の問題をくり返す)</li>
      <li><b>模擬試験で本番練習</b>(30問・90分)</li>
    </ul>
    <p class="src">数字だけ見直したいときは<a href="../text.html">要点ノート</a>が便利です。${UPDATED}時点の内容です。</p>
  </section>${groups}
  <a class="cta" href="../">ドリルで問題を解く</a>
  <footer><a href="../about.html">このサイトについて・プライバシーポリシー</a></footer>
</main>
</body>
</html>
`;
}

// サイトマップ(app/sitemap.xml)も、教科書の章に合わせて作り直す
const SITEMAP = fileURLToPath(new URL('../app/sitemap.xml', import.meta.url));
export function renderSitemap() {
  const paths = ['', 'kyokasho/', ...chapters().map((x) => `kyokasho/${x.skill.id}.html`), 'text.html', 'help.html', 'about.html', 'exam.html'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE}/${p}</loc></url>`).join('\n')}
</urlset>
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(OUT_DIR, { recursive: true });
  const list = chapters();
  const keep = new Set(['kyokasho.css', 'index.html', ...list.map((x) => `${x.skill.id}.html`)]);
  for (const f of readdirSync(OUT_DIR)) if (f.endsWith('.html') && !keep.has(f)) unlinkSync(OUT_DIR + f);
  for (const x of list) writeFileSync(`${OUT_DIR}${x.skill.id}.html`, renderChapter(x.skill.id));
  writeFileSync(`${OUT_DIR}index.html`, renderIndex());
  writeFileSync(SITEMAP, renderSitemap());
  console.log(`wrote ${list.length} chapters + index`);
}
