// 内容の信頼性に関する設定。法令・告示の「確認日」と、問題の誤りの報告先。
//
// LAW_CHECKED は、全問を条文や公開資料と照らして点検した日(確かめきれなかった項目は
// docs/ の確認記録に残す)。次に点検したら、この日付と about.html・help.html・index.html の
// 表示を同じ日に書きかえる(tests/app_trust.test.mjs が食い違いを見つける)。
export const LAW_CHECKED = '2026-10-24';

// 報告先のメールアドレス(about.html と同じもの)。ページのソースに「そのままの形」で
// 載せないよう、前半と後半に分けておく。変えるときは about.html の連絡先も同じに。
const CONTACT = ['sotaexportjp', 'gmail.com'];

export function lawCheckedLabel(date = LAW_CHECKED) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return '';
  return `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日`;
}

const cut = (t, n) => { const s = String(t || '').replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n)}…` : s; };

// 「この問題の誤りを報告」を押したときに開く、問題の内容入りのメール。
// 端末のメールアプリが開くだけで、送るかどうかは本人が決める(こちらからは何も送らない)。
export function reportHref(p) {
  const lines = [
    '運行管理ドリルの次の問題に、誤りがあるかもしれません。',
    '',
    `問題：${cut(p && p.text, 110)}`,
    p && p.source ? `出典：${cut(p.source, 50)}` : '',
    `正解として表示された選択肢：${cut(p && p.answer, 50)}`,
    `法令の確認日（画面の表示）：${lawCheckedLabel()}`,
    '',
    '気づいた点（どこが、どう違うか。根拠の条文や資料があれば）：',
    '',
  ].filter((x, i, a) => x !== '' || a[i - 1] !== '');
  return `mailto:${CONTACT.join(String.fromCharCode(64))}?subject=${encodeURIComponent('運行管理ドリル 問題の誤りの報告')}&body=${encodeURIComponent(lines.join('\n'))}`;
}
