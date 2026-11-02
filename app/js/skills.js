// Skill tree for the 運行管理者試験 drill. Every skill is a pool of four-choice
// questions (bank.js). "grade" is the stage 1-6 (difficulty): a skill's
// prerequisites never come from a later stage.
// Each skill: id, name (shown on screen), grade (= stage), lane (tree column),
// side (preferred sub-column inside its lane, 0 left / 1 right),
// req (all must be mastered to unlock), gen (['quiz', { pool | pools | all }]).

export const LANES = ['貨物・旅客', '労働時間', '車両・道交', '実務'];

// Mastery / unlock rule (provisional): 5 first-try clears in the last 6 attempts.
export const MASTERY = { window: 6, need: 5 };

const q = (pool) => ['quiz', { pool }];

export const SKILLS = [
  // ---------------------------------------------------------------- stage 1
  { id: 'lb-words', div: 'common', name: '拘束と休息', grade: 1, lane: 1, req: [], gen: q('lb_words') },
  { id: 'vh-basic', div: 'common', name: '車両法のきほん', grade: 1, lane: 2, req: [], gen: q('vh_basic') },
  { id: 'tr-basic', div: 'common', name: '道交法のきほん', grade: 1, lane: 2, side: 1, req: [], gen: q('tr_basic') },
  { id: 'cg-basic', div: 'cargo', name: '貨物事業のきほん', grade: 1, lane: 0, req: [], gen: q('cg_basic') },
  { id: 'ps-basic', div: 'bus', name: '旅客事業のきほん', grade: 1, lane: 0, side: 1, req: [], gen: q('ps_basic') },
  { id: 'pr-body', div: 'common', name: '人と体の話', grade: 1, lane: 3, req: [], gen: q('pr_body') },

  // ---------------------------------------------------------------- stage 2
  { id: 'lb-truck', div: 'cargo', name: 'トラックの拘束', grade: 2, lane: 1, req: ['lb-words'], gen: q('lb_truck') },
  { id: 'lb-law32', div: 'common', name: '労働時間と休日', grade: 2, lane: 1, side: 1, req: ['lb-words'], gen: q('lb_law32') },
  { id: 'vh-check', div: 'common', name: '点検と整備', grade: 2, lane: 2, req: ['vh-basic'], gen: q('vh_check') },
  { id: 'tr-lane', div: 'common', name: '通行区分と進入禁止', grade: 2, lane: 2, side: 1, req: ['tr-basic'], gen: q('tr_lane') },
  { id: 'tr-stop', div: 'common', name: '駐停車と追越し', grade: 2, lane: 2, side: 1, req: ['tr-basic'], gen: q('tr_stop') },
  { id: 'tr-alcohol', div: 'common', name: '酒気と免許', grade: 2, lane: 2, side: 1, req: ['tr-basic'], gen: q('tr_alcohol') },
  { id: 'cg-manager', div: 'cargo', name: '運行管理者', grade: 2, lane: 0, req: ['cg-basic'], gen: q('cg_manager') },
  { id: 'cg-permit', div: 'cargo', name: '貨物の許可と手続き', grade: 2, lane: 0, side: 1, req: ['cg-basic'], gen: q('cg_permit') },
  { id: 'ps-duty', div: 'bus', name: '旅客の運行管理者', grade: 2, lane: 0, side: 1, req: ['ps-basic'], gen: q('ps_duty') },
  { id: 'pr-physics', div: 'common', name: '速度とカガク', grade: 2, lane: 3, req: ['pr-body'], gen: q('pr_physics') },

  // ---------------------------------------------------------------- stage 3
  { id: 'lb-drive', div: 'common', name: '運転時間', grade: 3, lane: 1, req: ['lb-truck'], gen: q('lb_drive') },
  { id: 'lb-bus', div: 'bus', name: 'バスの基準', grade: 3, lane: 1, side: 1, req: ['lb-truck'], gen: q('lb_bus') },
  { id: 'lb-taxi', div: 'bus', name: 'タクシーの基準', grade: 3, lane: 1, side: 1, req: ['lb-truck'], gen: q('lb_taxi') },
  { id: 'lb-pay', div: 'common', name: '割増賃金と年休', grade: 3, lane: 1, side: 1, req: ['lb-law32'], gen: q('lb_pay') },
  { id: 'lb-contract', div: 'common', name: '労働契約と賃金', grade: 3, lane: 1, side: 1, req: ['lb-law32'], gen: q('lb_contract') },
  { id: 'vh-shaken', div: 'common', name: '車検と検査証', grade: 3, lane: 2, req: ['vh-check'], gen: q('vh_shaken') },
  { id: 'vh-standard', div: 'common', name: '保安基準', grade: 3, lane: 2, req: ['vh-check'], gen: q('vh_standard') },
  { id: 'tr-driver', div: 'common', name: '運転者の心得', grade: 3, lane: 2, side: 1, req: ['tr-alcohol'], gen: q('tr_driver') },
  { id: 'tr-license', div: 'common', name: '免許の区分', grade: 3, lane: 2, side: 1, req: ['tr-alcohol'], gen: q('tr_license') },
  { id: 'tr-signal', div: 'common', name: '合図のきまり', grade: 3, lane: 2, side: 1, req: ['tr-lane'], gen: q('tr_signal') },
  { id: 'tr-speed', div: 'common', name: '速度と積載', grade: 3, lane: 2, side: 1, req: ['tr-stop'], gen: q('tr_speed') },
  { id: 'cg-tenko', div: 'cargo', name: '貨物の点呼', grade: 3, lane: 0, req: ['cg-manager'], gen: q('cg_tenko') },
  { id: 'cg-care', div: 'cargo', name: '貨物の過労防止', grade: 3, lane: 0, req: ['cg-manager'], gen: q('cg_care') },
  { id: 'cg-load', div: 'cargo', name: '積載と点検整備', grade: 3, lane: 0, req: ['cg-manager'], gen: q('cg_load') },
  { id: 'ps-tenko', div: 'bus', name: '旅客の点呼', grade: 3, lane: 0, side: 1, req: ['ps-basic'], gen: q('ps_tenko') },
  { id: 'ps-care', div: 'bus', name: '旅客の過労防止', grade: 3, lane: 0, side: 1, req: ['ps-basic'], gen: q('ps_care') },
  { id: 'pr-calc', div: 'common', name: '距離と時間の計算', grade: 3, lane: 3, side: 1, req: ['pr-physics'], gen: q('pr_calc') },
  { id: 'pr-health', div: 'common', name: '健康と運転', grade: 3, lane: 3, req: ['pr-body'], gen: q('pr_health') },
  { id: 'pr-accident', div: 'common', name: '事故と対応', grade: 3, lane: 3, side: 1, req: ['pr-physics'], gen: q('pr_accident') },

  // ---------------------------------------------------------------- stage 4
  { id: 'lb-36', div: 'common', name: '36協定と上限', grade: 4, lane: 1, side: 1, req: ['lb-pay', 'lb-truck'], gen: q('lb_36') },
  { id: 'lb-special', div: 'cargo', name: '特例のきまり', grade: 4, lane: 1, req: ['lb-drive'], gen: q('lb_special') },
  { id: 'lb-protect', div: 'common', name: '年少者と女性', grade: 4, lane: 1, side: 1, req: ['lb-contract'], gen: q('lb_protect') },
  { id: 'tr-highway', div: 'common', name: '高速道路のきまり', grade: 4, lane: 2, side: 1, req: ['tr-speed'], gen: q('tr_highway') },
  { id: 'ps-relief', div: 'bus', name: '貸切バスの交替運転者', grade: 4, lane: 0, side: 1, req: ['ps-care'], gen: q('ps_relief') },
  { id: 'cg-record', div: 'cargo', name: '記録と保存', grade: 4, lane: 0, req: ['cg-tenko'], gen: q('cg_record') },
  { id: 'pr-prevent', div: 'common', name: '事故をふせぐ', grade: 4, lane: 3, req: ['pr-accident', 'pr-health'], gen: q('pr_prevent') },
  { id: 'pr-plan', div: 'common', name: '運行計画の検証', grade: 4, lane: 3, side: 1, req: ['pr-calc'], gen: q('pr_plan') },

  // ---------------------------------------------------------------- stage 5
  { id: 'cg-guide', div: 'cargo', name: '指導と健康管理', grade: 5, lane: 0, req: ['cg-record'], gen: q('cg_guide') },
  { id: 'cg-crew', div: 'cargo', name: '事故時と運転者のきまり', grade: 5, lane: 0, req: ['cg-tenko', 'cg-care'], gen: q('cg_crew') },
  { id: 'ps-crew', div: 'bus', name: '事故時と車内のきまり', grade: 5, lane: 0, side: 1, req: ['ps-tenko', 'ps-care'], gen: q('ps_crew') },
  { id: 'pr-hazard', div: 'common', name: '危険予知と指差呼称', grade: 5, lane: 3, req: ['pr-prevent'], gen: q('pr_hazard') },

  // ---------------------------------------------------------------- stage 6
  { id: 'mix-final', div: 'common', name: '総まとめ', grade: 6, lane: 3, req: ['cg-guide', 'cg-crew', 'lb-36', 'lb-bus', 'lb-drive', 'vh-shaken', 'tr-speed', 'tr-alcohol', 'ps-tenko', 'ps-care', 'ps-crew', 'pr-prevent'], gen: ['quiz', { all: true }] },
];

export const SKILL = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// Depth in the tree = longest prerequisite chain (roots are 0).
export const DEPTH = (() => {
  const memo = {};
  const d = (id) => memo[id] ?? (memo[id] = SKILL[id].req.length ? 1 + Math.max(...SKILL[id].req.map(d)) : 0);
  for (const s of SKILLS) d(s.id);
  return memo;
})();

export const skillsOfGrade = (g) => SKILLS.filter((s) => s.grade === g);

// Division of each skill: 'cargo' （貨物のみ) / 'bus' （旅客のみ) / 'common' （共通）.
// Follows the mock exam's own field rules: cg_* pools are the 貨物 law,
// ps_* pools are the 旅客 law, and among the labor standards lb_truck and
// lb_special are cargo-side while lb_bus and lb_taxi are passenger-side
// (see EXAM in exam.js, which excludes them per division the same way).
export const DIVISIONS = { cargo: '貨物', bus: '旅客', common: '共通' };
export const divOfSkill = (sk) => (sk && sk.div) || 'common';
export function divOfPool(pool) {
  if (!pool) return 'common';
  if (pool.startsWith('cg_')) return 'cargo';
  if (pool.startsWith('ps_')) return 'bus';
  if (pool === 'lb_bus' || pool === 'lb_taxi') return 'bus';
  if (pool === 'lb_truck' || pool === 'lb_special') return 'cargo';
  return 'common';
}
