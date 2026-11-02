// Per-question division overrides (貨物=cargo / 旅客=bus).
//
// A question's division normally follows its pool (see divOfPool in
// skills.js). The pools below are shared ("common") pools that still hold
// questions written for one division only; this table overrides just those
// questions, by their index inside the pool array. The bank files themselves
// are never edited for this. Questions not listed keep their pool division.
//
// How each entry was decided (full list with reasons is in PR #12):
// the question text / choices / explanation target trucks, freight or
// loading only -> 'cargo'; buses, passengers or second-class licences only
// -> 'bus'; rules that formally cover both stay 'common'.
export const DIV_OVERRIDES = {
  // 運転時間: トラック運転者の基準 (2週平均44時間・月290時間の考え方など)
  lb_drive: { 0: 'cargo', 1: 'cargo', 4: 'cargo', 5: 'cargo', 6: 'cargo', 7: 'cargo', 8: 'cargo', 9: 'cargo', 10: 'cargo', 11: 'cargo', 13: 'cargo', 14: 'cargo', 15: 'cargo', 16: 'cargo', 17: 'cargo' },
  // 拘束と休息: (トラック) の手待ち時間の定義だけ
  lb_words: { 12: 'cargo' },
  // 車両のきほん: セミトレーラの長さの上限だけ
  vh_basic: { 12: 'cargo' },
  // 点検のきまり: 自家用貨物の周期・レンタカーのトラックは貨物、
  // 事業用バスの整備管理者選任は旅客
  vh_check: { 5: 'cargo', 13: 'bus', 18: 'cargo' },
  // 検査と登録: 旅客運送事業用の有効期間は旅客、貨物(8トン基準)は貨物
  vh_shaken: { 0: 'bus', 1: 'cargo', 2: 'cargo', 7: 'cargo', 16: 'cargo', 17: 'cargo' },
  // 保安基準: 貨物運送用に限る装置・基準は貨物、定員11人以上の消火器は旅客
  vh_standard: { 0: 'cargo', 2: 'cargo', 3: 'cargo', 5: 'cargo', 7: 'cargo', 24: 'cargo', 25: 'cargo', 26: 'cargo', 29: 'cargo', 31: 'cargo', 46: 'cargo', 53: 'bus' },
  // 免許と飲酒: 事業用トラックの免許は貨物、旅客の二種は旅客
  tr_alcohol: { 3: 'cargo', 4: 'bus' },
  // 標識と通行: 大型貨物自動車等通行止めだけ
  tr_basic: { 34: 'cargo' },
  // 免許の区分: 第二種免許の問題は旅客、牽引免許は貨物
  tr_license: { 9: 'bus', 10: 'bus', 11: 'bus', 12: 'cargo' },
  // 速度と積載: 積載物の制限は貨物、大型バスの高速速度は旅客
  tr_speed: { 1: 'cargo', 2: 'cargo', 3: 'bus', 4: 'cargo', 5: 'cargo', 6: 'cargo', 7: 'cargo', 8: 'cargo', 10: 'cargo', 11: 'cargo', 12: 'cargo' },
  // 事故と対応: 貨物事業者の転覆は貨物、旅客の死者・転覆の速報は旅客
  pr_accident: { 12: 'cargo', 13: 'bus', 17: 'bus' },
  // 運行計画の検証: 月の拘束時間(290時間)と2週平均44時間は貨物
  pr_plan: { 4: 'cargo', 13: 'cargo', 14: 'cargo' },
  // 事故をふせぐ: 貨物の積載・荷崩れと事業用トラックの事故傾向は貨物
  pr_prevent: { 1: 'cargo', 2: 'cargo', 9: 'cargo' },
};
