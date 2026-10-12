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
  { id: 'lb-words', name: '拘束と休息', grade: 1, lane: 1, req: [], gen: q('lb_words') },
  { id: 'vh-basic', name: '車両法のきほん', grade: 1, lane: 2, req: [], gen: q('vh_basic') },
  { id: 'tr-basic', name: '道交法のきほん', grade: 1, lane: 2, side: 1, req: [], gen: q('tr_basic') },
  { id: 'cg-basic', name: '貨物事業のきほん', grade: 1, lane: 0, req: [], gen: q('cg_basic') },
  { id: 'ps-basic', name: '旅客事業のきほん', grade: 1, lane: 0, side: 1, req: [], gen: q('ps_basic') },
  { id: 'pr-body', name: '人と体の話', grade: 1, lane: 3, req: [], gen: q('pr_body') },

  // ---------------------------------------------------------------- stage 2
  { id: 'lb-truck', name: 'トラックの拘束', grade: 2, lane: 1, req: ['lb-words'], gen: q('lb_truck') },
  { id: 'lb-law32', name: '労働時間と休日', grade: 2, lane: 1, side: 1, req: ['lb-words'], gen: q('lb_law32') },
  { id: 'vh-check', name: '点検と整備', grade: 2, lane: 2, req: ['vh-basic'], gen: q('vh_check') },
  { id: 'tr-stop', name: '駐停車と追越し', grade: 2, lane: 2, side: 1, req: ['tr-basic'], gen: q('tr_stop') },
  { id: 'tr-alcohol', name: '酒気と免許', grade: 2, lane: 2, side: 1, req: ['tr-basic'], gen: q('tr_alcohol') },
  { id: 'cg-manager', name: '運行管理者', grade: 2, lane: 0, req: ['cg-basic'], gen: q('cg_manager') },
  { id: 'pr-physics', name: '速度とカガク', grade: 2, lane: 3, req: ['pr-body'], gen: q('pr_physics') },

  // ---------------------------------------------------------------- stage 3
  { id: 'lb-drive', name: '運転時間', grade: 3, lane: 1, req: ['lb-truck'], gen: q('lb_drive') },
  { id: 'lb-bus', name: 'バスの基準', grade: 3, lane: 1, side: 1, req: ['lb-truck'], gen: q('lb_bus') },
  { id: 'lb-pay', name: '割増賃金と年休', grade: 3, lane: 1, side: 1, req: ['lb-law32'], gen: q('lb_pay') },
  { id: 'vh-shaken', name: '車検と検査証', grade: 3, lane: 2, req: ['vh-check'], gen: q('vh_shaken') },
  { id: 'tr-speed', name: '速度と積載', grade: 3, lane: 2, side: 1, req: ['tr-stop'], gen: q('tr_speed') },
  { id: 'cg-tenko', name: '貨物の点呼', grade: 3, lane: 0, req: ['cg-manager'], gen: q('cg_tenko') },
  { id: 'ps-tenko', name: '旅客の点呼', grade: 3, lane: 0, side: 1, req: ['ps-basic'], gen: q('ps_tenko') },
  { id: 'ps-care', name: '旅客の過労防止', grade: 3, lane: 0, side: 1, req: ['ps-basic'], gen: q('ps_care') },
  { id: 'pr-health', name: '健康と運転', grade: 3, lane: 3, req: ['pr-body'], gen: q('pr_health') },
  { id: 'pr-accident', name: '事故と対応', grade: 3, lane: 3, side: 1, req: ['pr-physics'], gen: q('pr_accident') },

  // ---------------------------------------------------------------- stage 4
  { id: 'lb-36', name: '36協定と上限', grade: 4, lane: 1, side: 1, req: ['lb-pay', 'lb-truck'], gen: q('lb_36') },
  { id: 'cg-record', name: '記録と保存', grade: 4, lane: 0, req: ['cg-tenko'], gen: q('cg_record') },
  { id: 'pr-prevent', name: '事故をふせぐ', grade: 4, lane: 3, req: ['pr-accident', 'pr-health'], gen: q('pr_prevent') },

  // ---------------------------------------------------------------- stage 5
  { id: 'cg-guide', name: '指導と健康管理', grade: 5, lane: 0, req: ['cg-record'], gen: q('cg_guide') },

  // ---------------------------------------------------------------- stage 6
  { id: 'mix-final', name: '総まとめ', grade: 6, lane: 3, req: ['cg-guide', 'lb-36', 'lb-bus', 'lb-drive', 'vh-shaken', 'tr-speed', 'tr-alcohol', 'ps-tenko', 'ps-care', 'pr-prevent'], gen: ['quiz', { all: true }] },
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
