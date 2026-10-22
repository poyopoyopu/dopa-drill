// Trophies (id036): many small achievements, like the ones in mobile games.
// Each series is one measure with rising steps; every step is a trophy.
// Days and streaks get dense steps; volume series get wide ones so long
// sessions are not pushed too hard (docs/SPEC.md 14.7). Nothing is
// random, conditions are always shown (except a few secrets), and a trophy,
// once earned, is kept.
import { SKILLS, LANES } from './skills.js';
import { isUnlocked, isMastered, starsOf } from './session.js';

export const CATS = ['継続', '回数', 'スキル', '成長', 'エクストラ', 'コンボ', '正確さ', 'スコア', '復習', 'ステージ', 'コレクション', '秘密'];

const fmt = (n) => (n >= 10000 && n % 10000 === 0 ? `${n / 10000}万` : n.toLocaleString('ja-JP'));
const DOPA_LABEL = { 2: '100', 3: '1000', 4: '1万', 5: '10万', 6: '100万', 7: '1000万', 8: '1億', 9: '10億' };
const RANKS = ['bronze', 'silver', 'gold', 'rainbow'];
export const RANK_NAME = { bronze: '銅', silver: '銀', gold: '金', rainbow: '虹', secret: '秘密' };

// Rank by position in its series: first ~30% bronze, then silver, gold, and the last step rainbow.
function rankAt(i, n) {
  if (n === 1) return 'gold';
  if (i === n - 1) return 'rainbow';
  return RANKS[Math.min(2, Math.floor((i / (n - 1)) * 3.3))];
}

// A series: { key, cat, title, metric, steps, name(v), desc(v) } or explicit items.
const SERIES_DEFS = [
  { key: 'streak', cat: '継続', title: '連続で学習', metric: 'bestStreak', steps: [3, 5, 7, 10, 14, 21, 30, 50, 75, 100, 150, 200, 365], name: (v) => `${v}日連続`, desc: (v) => `${v}日続けて学習する` },
  { key: 'days', cat: '継続', title: '学習した日', metric: 'days', steps: [1, 3, 5, 7, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 365, 500, 730, 1000], name: (v) => `学習した日 ${fmt(v)}日`, desc: (v) => `学習した日が合計${fmt(v)}日になる` },
  { key: 'stickers', cat: '継続', title: 'ログインシール', metric: 'stickers', steps: [1, 7, 14, 30, 50, 100, 200, 365], name: (v) => `シール${v}枚`, desc: (v) => `ログインボーナスのシールを${v}枚集める` },
  { key: 'crowns', cat: '継続', title: '王冠シール', metric: 'crowns', steps: [1, 3, 5, 10, 20, 52], name: (v) => `王冠${v}個`, desc: (v) => `7日目の王冠シールを${v}枚集める` },
  { key: 'problems', cat: '回数', title: '解いた問題', metric: 'problems', steps: [10, 30, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 20000, 30000, 50000, 100000], name: (v) => `${fmt(v)}問解く`, desc: (v) => `問題を合計${fmt(v)}問解く` },
  { key: 'cells', cat: '回数', title: '入力した答え', metric: 'cells', steps: [100, 500, 1000, 3000, 5000, 10000, 30000, 50000, 100000, 300000], name: (v) => `正解入力${fmt(v)}回`, desc: (v) => `正しい答えを合計${fmt(v)}回入力する` },
  { key: 'plays', cat: '回数', title: '学習した回数', metric: 'plays', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000], name: (v) => `${fmt(v)}回学習`, desc: (v) => `ドリルを合計${fmt(v)}回最後まで解く` },
  { key: 'minutes', cat: '回数', title: '学習した時間', metric: 'minutes', steps: [10, 30, 60, 120, 300, 600, 1200, 3000], name: (v) => (v >= 60 ? `合計${v / 60}時間` : `合計${v}分`), desc: (v) => `学習した時間が合計${v >= 60 ? `${v / 60}時間` : `${v}分`}になる` },
  { key: 'unlocked', cat: 'スキル', title: 'スキル解放', metric: 'unlocked', steps: [3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 58], name: (v) => `解放${v}個`, desc: (v) => `スキルを${v}個解放する` },
  { key: 'mastered', cat: 'スキル', title: 'スキルマスター', metric: 'mastered', steps: [1, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 58], name: (v) => `マスター${v}個`, desc: (v) => `スキルを${v}個マスターする` },
  { key: 'gradeDone', cat: 'スキル', title: 'ステージ全マスター', items: [1, 2, 3, 4, 5, 6].map((g) => ({ id: `gradeDone-${g}`, metric: `gradeDone${g}`, need: 1, name: `ステージ${g}全マスター`, desc: `ステージ${g}のスキルをすべてマスターする` })) },
  { key: 'laneDone', cat: 'スキル', title: '分野全マスター', items: LANES.map((l, i) => ({ id: `laneDone-${i}`, metric: `laneDone${i}`, need: 1, name: `${l}マスター`, desc: `「${l}」のスキルをすべてマスターする` })) },
  { key: 'extras', cat: 'エクストラ', title: 'エクストラ到達', metric: 'extras', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300], name: (v) => `エクストラ${v}回`, desc: (v) => `エクストラに${v}回進む` },
  { key: 'extraBest', cat: 'エクストラ', title: 'エクストラ1回の最高', metric: 'extraBest', steps: [3, 5, 7, 10, 12, 15, 18, 20, 23, 25, 30], name: (v) => `1回で${v}問`, desc: (v) => `1回のエクストラで${v}問解く` },
  { key: 'extraSolved', cat: 'エクストラ', title: 'エクストラで解いた問題', metric: 'extraSolved', steps: [10, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000], name: (v) => `エクストラ${fmt(v)}問`, desc: (v) => `エクストラで合計${fmt(v)}問解く` },
  { key: 'combo', cat: 'コンボ', title: 'コンボ', metric: 'maxCombo', steps: [5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300], name: (v) => `${v}コンボ`, desc: (v) => `${v}コンボを出す` },
  { key: 'perfects', cat: '正確さ', title: 'ノーミスで完走', metric: 'perfects', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300], name: (v) => `ノーミス${v}回`, desc: (v) => `初回正解率100%で${v}回最後まで解く` },
  { key: 'firstTry', cat: '正確さ', title: '初回正解', metric: 'firstTry', steps: [10, 50, 100, 300, 500, 1000, 3000, 5000, 10000, 30000], name: (v) => `初回正解${fmt(v)}問`, desc: (v) => `1回目で正解した問題が${fmt(v)}問になる` },
  { key: 'dopa', cat: 'スコア', title: 'スコア', metric: 'bestDopaL', steps: [2, 3, 4, 5, 6, 7, 8, 9], name: (v) => `${DOPA_LABEL[v]}スコア`, desc: (v) => `1回のプレイでスコア${DOPA_LABEL[v]}を超える` },
  { key: 'review', cat: '復習', title: '復習', metric: 'reviewSolved', steps: [1, 5, 10, 30, 50, 100, 200, 300], name: (v) => `復習${v}問`, desc: (v) => `間違えた問題を${v}問やり直す` },
  ...[1, 2, 3, 4, 5, 6].map((g) => ({ key: `grade${g}`, cat: 'ステージ', title: `ステージ${g}で学習`, metric: `gradePlays${g}`, steps: [1, 10, 30], name: (v) => `ステージ${g}を${v}回`, desc: (v) => `「ステージ${g}」で${v}回学習する` })),
  { key: 'secret', cat: '秘密', title: '秘密', items: [
    { id: 'secret-perfect14', metric: 'flag:perfect14', need: 1, name: '14問パーフェクト', desc: '14問をミスなしで解く', secret: true },
    { id: 'secret-extraClean', metric: 'flag:extraClean', need: 1, name: 'エクストラノーミス', desc: 'エクストラで5問以上、ミスなし', secret: true },
    { id: 'secret-sunday', metric: 'flag:sunday', need: 1, name: '日曜日の勉強', desc: '日曜日に学習する', secret: true },
    { id: 'secret-newyear', metric: 'flag:newyear', need: 1, name: 'お正月ドリル', desc: '1月1日に学習する', secret: true },
    { id: 'secret-comeback', metric: 'flag:comeback', need: 1, name: 'おかえり！', desc: '1週間以上あいてから、また学習する', secret: true },
    { id: 'secret-allmodes', metric: 'allModes', need: 1, name: 'すべてのモード', desc: '自分のレベル・ステージ別・練習・復習をすべて遊ぶ', secret: true },
  ] },
];

// Other features add their own series (id045). Keep this list append-only.
export const SERIES = [];
export const TROPHIES = [];
export const TROPHY = {};
export function addSeries(def) {
  const items = def.items
    ? def.items.map((it, i, a) => ({ rank: it.secret ? 'secret' : rankAt(i, a.length), ...it }))
    : def.steps.map((v, i, a) => ({ id: `${def.key}-${v}`, metric: def.metric, need: v, name: def.name(v), desc: def.desc(v), rank: rankAt(i, a.length) }));
  const series = { key: def.key, cat: def.cat, title: def.title, items: items.map((it) => ({ ...it, series: def.key, cat: def.cat, reward: it.reward || null })) };
  SERIES.push(series);
  for (const it of series.items) { TROPHIES.push(it); TROPHY[it.id] = it; }
  return series;
}
SERIES_DEFS.forEach(addSeries);

// id045: the features added after id036 (stars, quests, hammer, rust,
// time capsule, "のびたよ", collection).
[
  { key: 'questDays', cat: '継続', title: 'クエストコンプリート', metric: 'questDays', steps: [1, 3, 7, 14, 30, 50, 100, 200, 365], name: (v) => `コンプリート${v}日`, desc: (v) => `今日のクエストをすべてクリアした日が${v}日になる` },
  { key: 'questRun', cat: '継続', title: 'クエスト連続', metric: 'questRun', steps: [2, 3, 5, 7, 14, 30], name: (v) => `クエスト${v}日連続`, desc: (v) => `${v}日続けてクエストをすべてクリアする` },
  { key: 'hammer', cat: '継続', title: 'ノーカンハンマー', metric: 'hammerUsed', steps: [1, 3, 10], name: (v) => (v === 1 ? '初めてのノーカン' : `ノーカン${v}回`), desc: (v) => `ノーカンハンマーを${v}回使う` },
  { key: 'starsTotal', cat: 'スキル', title: '星の数', metric: 'starsTotal', steps: [5, 10, 25, 50, 75, 100, 150, 200, 250, 290], name: (v) => `星${v}個`, desc: (v) => `スキルの星を合計${v}個集める` },
  { key: 'star5', cat: 'スキル', title: '☆5のスキル', metric: 'star5', steps: [1, 3, 5, 10, 20, 30, 58], name: (v) => `☆5を${v}個`, desc: (v) => `☆5のスキルを${v}個にする` },
  { key: 'gradeStar3', cat: 'スキル', title: 'ステージ全☆3', items: [1, 2, 3, 4, 5, 6].map((g) => ({ id: `gradeStar3-${g}`, metric: `gradeStar3${g}`, need: 1, name: `ステージ${g}全☆3`, desc: `ステージ${g}のスキルをすべて☆3以上にする` })) },
  { key: 'polished', cat: '成長', title: 'さびを磨く', metric: 'polished', steps: [1, 3, 5, 10, 30, 50], name: (v) => `ピカピカ${v}回`, desc: (v) => `さびたスキルを${v}回磨く` },
  { key: 'capsules', cat: '成長', title: 'タイムカプセル', metric: 'capsules', steps: [1, 3, 5, 10, 30], name: (v) => `カプセル${v}個`, desc: (v) => `タイムカプセルを${v}個開ける` },
  { key: 'capsuleFaster', cat: '成長', title: 'あの日より速い', metric: 'capsuleFaster', steps: [1, 5, 10], name: (v) => `あの日より速く${v}回`, desc: (v) => `タイムカプセルで、あの日より速く解く（${v}回）` },
  { key: 'grew', cat: '成長', title: '伸びた！', metric: 'grew', steps: [1, 5, 10, 30, 50, 100], name: (v) => `伸びた${v}回`, desc: (v) => `結果で「伸びた！」が${v}回出る` },
  { key: 'items', cat: 'コレクション', title: 'コレクション', metric: 'itemsOwned', steps: [10, 20, 30, 40, 47], name: (v) => `コレクション${v}個`, desc: (v) => `コレクションを${v}個集める` },
  { key: 'catComplete', cat: 'コレクション', title: '全種そろえた', metric: 'catComplete', steps: [1, 3, 5, 8], name: (v) => `${v}種類コンプリート`, desc: (v) => `コレクションの${v}種類をすべてそろえる` },
].forEach(addSeries);

// Numbers every trophy is measured against, from the saved state.
// snap: { stats, prog, bestStreak, stickers, crowns, ...extra metrics }
export function trophyMetrics(snap) {
  const s = snap.stats || {};
  const prog = snap.prog || { skills: {} };
  const m = {
    bestStreak: snap.bestStreak || 0, days: s.days || 0, stickers: snap.stickers || 0, crowns: snap.crowns || 0,
    problems: s.problems || 0, cells: s.cells || 0, plays: s.plays || 0, minutes: Math.floor((s.playMs || 0) / 60000),
    unlocked: SKILLS.filter((x) => isUnlocked(prog, x.id)).length, mastered: SKILLS.filter((x) => isMastered(prog, x.id)).length,
    extras: s.extras || 0, extraBest: s.extraBest || 0, extraSolved: s.extraSolved || 0, maxCombo: s.maxCombo || 0,
    perfects: s.perfects || 0, firstTry: s.firstTry || 0, bestDopaL: Math.floor((s.bestDopaL || 0) + 1e-9), reviewSolved: s.reviewSolved || 0,
  };
  const stars = Object.fromEntries(SKILLS.map((x) => [x.id, starsOf(prog, x.id)]));
  m.starsTotal = Object.values(stars).reduce((a, b) => a + b, 0);
  m.star5 = Object.values(stars).filter((n) => n >= 5).length;
  m.polished = s.polished || 0; m.capsules = s.capsules || 0; m.capsuleFaster = s.capsuleFaster || 0; m.grew = s.grew || 0;
  for (let g = 1; g <= 6; g++) {
    m[`gradeStar3${g}`] = SKILLS.filter((x) => x.grade === g).every((x) => stars[x.id] >= 3) ? 1 : 0;
    m[`gradeDone${g}`] = SKILLS.filter((x) => x.grade === g).every((x) => isMastered(prog, x.id)) ? 1 : 0;
    m[`gradePlays${g}`] = (s.grades || {})[g] || 0;
  }
  LANES.forEach((_, i) => { m[`laneDone${i}`] = SKILLS.filter((x) => x.lane === i).every((x) => isMastered(prog, x.id)) ? 1 : 0; });
  for (const [k, v] of Object.entries(s.flags || {})) if (v) m[`flag:${k}`] = 1;
  const modes = s.modes || {};
  m.allModes = ['level', 'grade', 'practice', 'review'].every((k) => modes[k]) ? 1 : 0;
  Object.assign(m, snap.extra || {});
  return m;
}
export const valueOf = (m, metric) => m[metric] || 0;

// Earn every trophy whose condition is met. Returns the new ones (in list order).
// `state` is the saved { got: { id: time } }; the first call earns what the
// existing records already reach and marks them as a batch.
export function evaluate(state, metrics, at = Date.now()) {
  state.got = state.got || {};
  const fresh = [];
  for (const t of TROPHIES) {
    if (state.got[t.id]) continue;
    if (valueOf(metrics, t.metric) >= t.need) { state.got[t.id] = at; fresh.push(t); }
  }
  if (!state.init) { state.init = true; state.batch = fresh.map((t) => t.id); return []; }
  return fresh;
}

export const earnedCount = (state) => TROPHIES.filter((t) => state.got && state.got[t.id]).length;

// Progress of one series for the list screen.
export function seriesView(series, state, metrics) {
  const got = series.items.filter((t) => state.got && state.got[t.id]);
  const next = series.items.find((t) => !(state.got && state.got[t.id]));
  const top = got[got.length - 1] || null;
  return { series, got, next, top, value: next ? valueOf(metrics, next.metric) : null };
}
