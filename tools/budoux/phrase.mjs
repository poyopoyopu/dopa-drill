/**
 * 日本語の文を「文節」で区切り、区切り目に <wbr> を入れる(ビルド時に使う)。
 * CSS の word-break:keep-all と組み合わせると、見出しや表の文字が
 * 「前/日とも」のように単語の途中で折り返さなくなる。
 *
 * 文節の判定は BudouX (https://github.com/google/budoux) の日本語モデルを使う。
 * ja.json と下の parseBoundaries は BudouX v0.6.4 からの移植。
 *
 * @license
 * Copyright 2021 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { readFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('./ja.json', import.meta.url), 'utf8'));
const MODEL = new Map(Object.entries(raw).map(([k, v]) => [k, new Map(Object.entries(v))]));
const BASE = -0.5 * [...MODEL.values()].flatMap((g) => [...g.values()]).reduce((a, b) => a + b, 0);
const FEATURES = [
  ['UW1', -3, -2], ['UW2', -2, -1], ['UW3', -1, 0], ['UW4', 0, 1], ['UW5', 1, 2], ['UW6', 2, 3],
  ['BW1', -2, 0], ['BW2', -1, 1], ['BW3', 0, 2],
  ['TW1', -3, 0], ['TW2', -2, 1], ['TW3', -1, 2], ['TW4', 0, 3],
];

/** 区切ってよい位置(文字の添字)の一覧 */
export function parseBoundaries(s) {
  const out = [];
  for (let i = 1; i < s.length; i++) {
    let score = BASE;
    for (const [k, a, b] of FEATURES) {
      score += MODEL.get(k)?.get(s.substring(i + a, i + b)) || 0; // 範囲外は substring が切り詰める(BudouX と同じ)
    }
    if (score > 0) out.push(i);
  }
  return out;
}

const NO_BEFORE = /[\s、。，．,.)）」』】〕〉》?？!！:：;；・ー～〜%％]/u;
const NO_AFTER = /[\s(（「『【〔〈《0-9０-９.．]/u; // 数字の直後(「9|時間」)でも区切らない

// ブロックの区切りになるタグ(この前後で文はつながらない)
const BLOCK = new Set(['p', 'li', 'ul', 'ol', 'div', 'section', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'h4',
  'dl', 'dt', 'dd', 'details', 'summary', 'br', 'figure', 'figcaption', 'nav', 'main', 'aside', 'header', 'footer', 'blockquote']);
// 中身に手を付けないタグ
const SKIP = new Set(['svg', 'script', 'style', 'title', 'textarea', 'code', 'pre']);

/**
 * HTML 文字列の本文テキストに <wbr> を入れて返す。
 * <b>9時間</b>以内 のようにタグをまたぐ文も、まとめて文節を判定する。
 */
export function insertWbr(html) {
  const tokens = html.split(/(<!--[\s\S]*?-->|<[^>]+>)/);
  let skipDepth = 0;
  let skipTag = '';
  let run = []; // { i: tokens の添字, text }
  const flush = () => {
    if (!run.length) return;
    // 文字実体参照(&amp; など)は1文字として扱う
    const units = [];
    run.forEach((r, ri) => {
      for (const m of r.text.matchAll(/&[#\w]+;|[\s\S]/gu)) units.push({ ri, s: m[0] });
    });
    const plain = units.map((u) => (u.s.length > 1 && u.s[0] === '&' ? '' : u.s)).join('');
    // 1文字だけの切れはし(「な|ぜ」「3分の|1」)ができる区切りは使わない
    const raw = parseBoundaries(plain);
    const cut = new Set();
    let last = 0;
    raw.forEach((c, k) => {
      const next = raw[k + 1] ?? plain.length;
      if (c - last >= 2 && next - c >= 2) { cut.add(c); last = c; }
    });
    const parts = run.map(() => '');
    // plain の添字と units の添字はサロゲートペアがない限り一致する(本文に絵文字は使わない前提で、念のため照合)
    let pos = 0;
    units.forEach((u, ui) => {
      const len = u.s.length > 1 && u.s[0] === '&' ? 1 : u.s.length;
      // 閉じかっこ・句読点の前、開きかっこの後では区切らない(行頭・行末の禁則)
      if (ui > 0 && cut.has(pos) && !NO_BEFORE.test(plain[pos] || '') && !NO_AFTER.test(plain[pos - 1] || '')) parts[u.ri] += '<wbr>';
      parts[u.ri] += u.s;
      pos += len;
    });
    run.forEach((r, ri) => { tokens[r.i] = parts[ri]; });
    run = [];
  };
  tokens.forEach((t, i) => {
    if (!t) return;
    if (t.startsWith('<')) {
      const m = t.match(/^<\/?\s*([a-zA-Z0-9]+)/);
      if (!m) return; // コメントなど
      const name = m[1].toLowerCase();
      const closing = t.startsWith('</');
      if (skipDepth) {
        if (name === skipTag) skipDepth += closing ? -1 : t.endsWith('/>') ? 0 : 1;
        return;
      }
      if (SKIP.has(name) && !closing) { flush(); skipTag = name; skipDepth = t.endsWith('/>') ? 0 : 1; return; }
      if (BLOCK.has(name)) flush();
      return;
    }
    if (skipDepth) return;
    run.push({ i, text: t });
  });
  flush();
  // 折り返さない前提の部品(目盛り・判子・nw)の中には入れない(<wbr> は nowrap より強いことがある)
  return tokens.join('')
    .replace(/<div class="ticks[^"]*">[\s\S]*?<\/div>/g, (m) => m.replace(/<wbr>/g, ''))
    .replace(/<(span|td|b)[^>]*class="[^"]*\b(stamp|nw)\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g, (m) => m.replace(/<wbr>/g, ''));
}
