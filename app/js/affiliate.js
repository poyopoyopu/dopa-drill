// おすすめの問題集(楽天アフィリエイト・Amazonアソシエイト)。模擬試験の結果画面の下に「PR」付きで出す。
// 画像は読み込まない(タップするまで外部への通信はしない)。
// 新しい版が出たら url(楽天)・amazon・title を差し替える。null の種類には何も出さない。
export const AMAZON_TAG = 'unkokanri-22';
const amazonDp = (asin) => `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_TAG}`;
const amazonSearch = (isbn) => `https://www.amazon.co.jp/s?k=${isbn}&tag=${AMAZON_TAG}`;
export const BOOKS = {
  cargo: {
    title: '運行管理者試験問題と解説 貨物編 令和9年3月CBT試験受験版(公論出版)',
    url: 'https://hb.afl.rakuten.co.jp/ichiba/58b5583c.cfb6b9a5.58b5583d.74fb07b4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbook%2F18853014%2F&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ%3D%3D',
    amazon: amazonSearch('9784862753939'),
    kinokuniya: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3785895&pid=892734529',
    honto: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3785895&pid=892734530',
    sevennet: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3785895&pid=892738475',
  },
  bus: {
    title: '運行管理者試験問題と解説 旅客編 令和8年8月CBT試験受験版(公論出版)',
    url: 'https://hb.afl.rakuten.co.jp/ichiba/58b5583c.cfb6b9a5.58b5583d.74fb07b4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbook%2F18624912%2F&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ%3D%3D',
    amazon: amazonDp('4862753779'),
    kinokuniya: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3785895&pid=892734529',
    honto: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3785895&pid=892734530',
    sevennet: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3785895&pid=892738475',
  },
};

// 教科書の章末に出す本。章の分野に合う種類だけを出す:
// 貨物の章とトラックの章は貨物編、旅客の章とバス・タクシーの章は旅客編、共通の章は両方。
export function booksFor(skillId) {
  const g = String(skillId).split('-')[0];
  if (g === 'cg' || skillId === 'lb-truck') return ['cargo'];
  if (g === 'ps' || skillId === 'lb-bus' || skillId === 'lb-taxi') return ['bus'];
  return ['cargo', 'bus'];
}
