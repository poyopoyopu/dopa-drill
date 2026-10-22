// Unlockable show (id041): backgrounds, correct marks, particles, music,
// Dopakichi's costume and colour, the crowd and the finale. Each item is the
// reward of one trophy (never random), so what is unlocked follows from the
// trophies earned; only the player's choice per category is saved.
import { TROPHY } from './trophies.js';

export const CATS = [
  { key: 'bg', name: '背景' },
  { key: 'mark', name: '正解の印' },
  { key: 'particle', name: '紙吹雪' },
  { key: 'music', name: '音楽' },
  { key: 'costume', name: '着せ替え' },
  { key: 'color', name: 'ドパキチの色' },
  { key: 'crowd', name: 'お客さん' },
  { key: 'finale', name: 'フィナーレ' },
];

// base: available from the start. trophy: the trophy whose reward it is.
export const ITEMS = [];
export const ITEM = {};
export function addItems(list) {
  for (const it of list) {
    ITEMS.push(it); ITEM[it.id] = it;
    if (it.trophy && TROPHY[it.trophy]) TROPHY[it.trophy].reward = it.id;
  }
}
addItems([
  { id: 'bg:classic', cat: 'bg', name: '放射線', base: true },
  { id: 'mark:hanamaru', cat: 'mark', name: '花丸', base: true },
  { id: 'particle:classic', cat: 'particle', name: '紙吹雪', base: true },
  { id: 'music:classic', cat: 'music', name: 'マリンバマーチ', base: true },
  { id: 'costume:none', cat: 'costume', name: 'なし', base: true },
  { id: 'color:pink', cat: 'color', name: 'ピンク', base: true },
  { id: 'crowd:classic', cat: 'crowd', name: '色違い', base: true },
  { id: 'finale:classic', cat: 'finale', name: '標準', base: true },
]);
// id041: one sample per category, to prove the pipeline end to end.
// Rewards follow effort and coming back (plays, days, streaks, stars earned by
// practice), not the placement check, which can master many skills at once.
addItems([
  { id: 'costume:cap', cat: 'costume', name: '帽子', trophy: 'days-1' },
  { id: 'particle:note', cat: 'particle', name: '音符', trophy: 'days-3' },
  { id: 'mark:stamp', cat: 'mark', name: '正解スタンプ', trophy: 'plays-3' },
  { id: 'bg:night', cat: 'bg', name: '夜空', trophy: 'streak-3' },
  { id: 'color:blue', cat: 'color', name: '青', trophy: 'plays-5' },
  { id: 'finale:fireworks', cat: 'finale', name: '花火大会', trophy: 'extras-5' },
  { id: 'music:chip', cat: 'music', name: '8ビット', trophy: 'plays-10' },
  { id: 'crowd:costume', cat: 'crowd', name: '着せ替えお客さん', trophy: 'firstTry-50' },
]);
// id042: backgrounds, correct marks and particles.
addItems([
  { id: 'bg:sea', cat: 'bg', name: '海と泡', trophy: 'problems-100' },
  { id: 'bg:festival', cat: 'bg', name: 'お祭り', trophy: 'days-15' },
  { id: 'bg:paper', cat: 'bg', name: '紙の工作', trophy: 'problems-200' },
  { id: 'bg:space', cat: 'bg', name: '宇宙', trophy: 'extras-10' },
  { id: 'mark:medal', cat: 'mark', name: 'メダル', trophy: 'streak-7' },
  { id: 'mark:crown', cat: 'mark', name: '王冠', trophy: 'perfects-3' },
  { id: 'mark:ring', cat: 'mark', name: '花火の輪', trophy: 'combo-30' },
  { id: 'particle:petal', cat: 'particle', name: '花びら', trophy: 'stickers-7' },
  { id: 'particle:digit', cat: 'particle', name: '数字', trophy: 'cells-1000' },
  { id: 'particle:bubble', cat: 'particle', name: '泡', trophy: 'review-10' },
  { id: 'particle:candy', cat: 'particle', name: 'お菓子', trophy: 'extraBest-10' },
]);
// id043: songs (8ビット is the id041 sample).
addItems([
  { id: 'music:matsuri', cat: 'music', name: '祭りばやし', trophy: 'streak-5' },
  { id: 'music:brass', cat: 'music', name: 'ブラスバンド', trophy: 'days-5' },
  { id: 'music:electro', cat: 'music', name: 'エレクトロ', trophy: 'extras-3' },
]);
// id044: costumes, colours, crowd and finales (id045 moved three rewards to the new series).
addItems([
  { id: 'costume:hachimaki', cat: 'costume', name: '鉢巻', trophy: 'problems-50' },
  { id: 'costume:cape', cat: 'costume', name: 'マント', trophy: 'combo-20' },
  { id: 'costume:glasses', cat: 'costume', name: '丸眼鏡', trophy: 'firstTry-100' },
  { id: 'costume:ribbon', cat: 'costume', name: 'リボン', trophy: 'stickers-14' },
  { id: 'costume:crown', cat: 'costume', name: '王冠', trophy: 'streak-14' },
  { id: 'costume:wizard', cat: 'costume', name: '魔法の帽子', trophy: 'star5-1' },
  { id: 'costume:headphones', cat: 'costume', name: 'ヘッドホン', trophy: 'capsules-1' },
  { id: 'color:mint', cat: 'color', name: '緑', trophy: 'days-7' },
  { id: 'color:snow', cat: 'color', name: '雪色', trophy: 'questDays-7' },
  { id: 'color:yellow', cat: 'color', name: '黄色', trophy: 'problems-300' },
  { id: 'color:violet', cat: 'color', name: '紫', trophy: 'extraSolved-100' },
  { id: 'color:gold', cat: 'color', name: '金色', trophy: 'streak-30' },
  { id: 'color:rainbow', cat: 'color', name: '虹色', trophy: 'days-100' },
  { id: 'crowd:rainbow', cat: 'crowd', name: '虹色お客さん', trophy: 'days-30' },
  { id: 'crowd:twins', cat: 'crowd', name: 'おそろいお客さん', trophy: 'starsTotal-100' },
  { id: 'finale:parade', cat: 'finale', name: 'パレード', trophy: 'streak-10' },
  { id: 'finale:rocket', cat: 'finale', name: 'ロケット', trophy: 'extras-20' },
]);

export const isUnlocked = (it, got = {}) => !!(it && (it.base || (it.trophy && got[it.trophy])));
export const unlockedIn = (cat, got) => ITEMS.filter((it) => it.cat === cat && isUnlocked(it, got));
export const defaultEquip = () => Object.fromEntries(CATS.map((c) => [c.key, 'auto']));

// The look for one play: fixed choices stay; "auto" picks among the unlocked
// ones so every play can look and sound a little different.
export function pickLook(equip = {}, got = {}, rng = Math.random) {
  const look = {};
  for (const { key } of CATS) {
    const want = equip[key];
    const own = unlockedIn(key, got);
    if (want && want !== 'auto' && own.some((it) => it.id === want)) look[key] = want;
    else look[key] = own[Math.floor(rng() * own.length)].id;
  }
  return look;
}
// The part after "cat:" (what the show modules switch on).
export const variant = (id) => (id ? id.split(':')[1] : 'classic');
