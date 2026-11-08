// 公開除外リスト: ここに載せた問題は出題プールから外れ、どこにも出ない。
//
// 指定は「バンク名 + バンク内の通し番号(1始まり)」。バンクは問題ファイル
// (bank_*.js)単位で、その中のプールの並び順に通し番号を数える。
// 実行時は divoverrides.js と同型の「プール名 -> プール内番号(0始まり)」に
// 直して保持し、problems.js の poolOf と exam.js の模試生成で読み飛ばす。
// 問題データ(bank_*.js 自体)は編集しない。外したくなったら番号を消すだけ。
import { POOLS } from './bank.js';

// バンクごとのプールの並び(ファイル内の出現順)。
const BANK_POOLS = {
  labor: ['lb_words', 'lb_truck', 'lb_drive', 'lb_bus', 'lb_law32', 'lb_pay', 'lb_36', 'lb_special', 'lb_taxi', 'lb_contract', 'lb_protect'],
  vehicle: ['vh_basic', 'vh_check', 'vh_shaken', 'vh_standard'],
  traffic: ['tr_basic', 'tr_stop', 'tr_alcohol', 'tr_speed', 'tr_lane', 'tr_highway', 'tr_driver', 'tr_license', 'tr_signal'],
  cargo: ['cg_basic', 'cg_manager', 'cg_tenko', 'cg_record', 'cg_guide', 'cg_permit', 'cg_care', 'cg_load', 'cg_crew'],
  bus: ['ps_basic', 'ps_tenko', 'ps_care', 'ps_duty', 'ps_relief', 'ps_crew'],
  practice: ['pr_body', 'pr_physics', 'pr_health', 'pr_accident', 'pr_prevent', 'pr_calc', 'pr_plan', 'pr_hazard'],
};

// 公開から外す問題(バンク名: バンク内の通し番号)。
// 2026-11-08 初回: 検品で未確定・条件付きのまま残った17問。
const EXCLUDED_BY_BANK = {
  cargo: [59, 60],
  bus: [82, 117],
  labor: [43, 99, 101, 105, 107],
  practice: [127],
  vehicle: [48, 51, 53, 54, 62],
  traffic: [35, 124],
};

// プール名 -> 除外するプール内番号(0始まり)の集合。
export const EXCLUDED = {};
for (const [bank, nums] of Object.entries(EXCLUDED_BY_BANK)) {
  const pools = BANK_POOLS[bank] || [];
  for (const n of nums) {
    let acc = 0;
    for (const p of pools) {
      const len = (POOLS[p] || []).length;
      if (n > acc && n <= acc + len) {
        if (!EXCLUDED[p]) EXCLUDED[p] = new Set();
        EXCLUDED[p].add(n - acc - 1);
        break;
      }
      acc += len;
    }
  }
}

export const isExcluded = (pool, idx) => !!(EXCLUDED[pool] && EXCLUDED[pool].has(idx));

// 除外分を差し引いた、そのプールの出題対象の数。
export const availableCount = (pool) => (POOLS[pool] || []).length - (EXCLUDED[pool] ? EXCLUDED[pool].size : 0);
