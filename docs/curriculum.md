# スキルツリー（運行管理者試験版）

問題は4択で、答えは「正しい選択肢の番号（1〜4）」を1つ入力します。1問が1ステップなので、コンボ・ドパ・習熟判定・復習などの仕組みは元のゲームと同じです。

- 習熟：直近6回のうち5回が初回正解
- ステージ（内部名 `grade`）：1〜6。前提スキルは同じか前のステージにあります
- レーン：貨物・旅客 / 労働時間 / 車両・道交 / 実務（ツリー上は4列、各レーン2サブ列）
- 最初の実力チェック（プレイスメント）は使いません。4択では当てずっぽうで通ってしまうためです

| ステージ | レーン | スキル | 問題群 | 前提 |
| --- | --- | --- | --- | --- |
| 1 | 労働時間 | 拘束と休息 (`lb-words`) | `lb_words` | — |
| 1 | 車両・道交 | 車両法のきほん (`vh-basic`) | `vh_basic` | — |
| 1 | 車両・道交 | 道交法のきほん (`tr-basic`) | `tr_basic` | — |
| 1 | 貨物・旅客 | 貨物事業のきほん (`cg-basic`) | `cg_basic` | — |
| 1 | 貨物・旅客 | 旅客事業のきほん (`ps-basic`) | `ps_basic` | — |
| 1 | 実務 | 人と体の話 (`pr-body`) | `pr_body` | — |
| 2 | 労働時間 | トラックの拘束 (`lb-truck`) | `lb_truck` | lb-words |
| 2 | 労働時間 | 労働時間と休日 (`lb-law32`) | `lb_law32` | lb-words |
| 2 | 車両・道交 | 点検と整備 (`vh-check`) | `vh_check` | vh-basic |
| 2 | 車両・道交 | 通行区分と進入禁止 (`tr-lane`) | `tr_lane` | tr-basic |
| 2 | 車両・道交 | 駐停車と追越し (`tr-stop`) | `tr_stop` | tr-basic |
| 2 | 車両・道交 | 酒気と免許 (`tr-alcohol`) | `tr_alcohol` | tr-basic |
| 2 | 貨物・旅客 | 運行管理者 (`cg-manager`) | `cg_manager` | cg-basic |
| 2 | 貨物・旅客 | 貨物の許可と手続き (`cg-permit`) | `cg_permit` | cg-basic |
| 2 | 貨物・旅客 | 旅客の運行管理者 (`ps-duty`) | `ps_duty` | ps-basic |
| 2 | 実務 | 速度とカガク (`pr-physics`) | `pr_physics` | pr-body |
| 3 | 労働時間 | 運転時間 (`lb-drive`) | `lb_drive` | lb-truck |
| 3 | 労働時間 | バスの基準 (`lb-bus`) | `lb_bus` | lb-truck |
| 3 | 労働時間 | タクシーの基準 (`lb-taxi`) | `lb_taxi` | lb-truck |
| 3 | 労働時間 | 割増賃金と年休 (`lb-pay`) | `lb_pay` | lb-law32 |
| 3 | 労働時間 | 労働契約と賃金 (`lb-contract`) | `lb_contract` | lb-law32 |
| 3 | 車両・道交 | 車検と検査証 (`vh-shaken`) | `vh_shaken` | vh-check |
| 3 | 車両・道交 | 保安基準 (`vh-standard`) | `vh_standard` | vh-check |
| 3 | 車両・道交 | 運転者の心得 (`tr-driver`) | `tr_driver` | tr-alcohol |
| 3 | 車両・道交 | 免許の区分 (`tr-license`) | `tr_license` | tr-alcohol |
| 3 | 車両・道交 | 合図のきまり (`tr-signal`) | `tr_signal` | tr-lane |
| 3 | 車両・道交 | 速度と積載 (`tr-speed`) | `tr_speed` | tr-stop |
| 3 | 貨物・旅客 | 貨物の点呼 (`cg-tenko`) | `cg_tenko` | cg-manager |
| 3 | 貨物・旅客 | 貨物の過労防止 (`cg-care`) | `cg_care` | cg-manager |
| 3 | 貨物・旅客 | 積載と点検整備 (`cg-load`) | `cg_load` | cg-manager |
| 3 | 貨物・旅客 | 旅客の点呼 (`ps-tenko`) | `ps_tenko` | ps-basic |
| 3 | 貨物・旅客 | 旅客の過労防止 (`ps-care`) | `ps_care` | ps-basic |
| 3 | 実務 | 距離と時間の計算 (`pr-calc`) | `pr_calc` | pr-physics |
| 3 | 実務 | 健康と運転 (`pr-health`) | `pr_health` | pr-body |
| 3 | 実務 | 事故と対応 (`pr-accident`) | `pr_accident` | pr-physics |
| 4 | 労働時間 | 36協定と上限 (`lb-36`) | `lb_36` | lb-pay, lb-truck |
| 4 | 労働時間 | 特例のきまり (`lb-special`) | `lb_special` | lb-drive |
| 4 | 労働時間 | 年少者と女性 (`lb-protect`) | `lb_protect` | lb-contract |
| 4 | 貨物・旅客 | 記録と保存 (`cg-record`) | `cg_record` | cg-tenko |
| 4 | 車両・道交 | 高速道路のきまり (`tr-highway`) | `tr_highway` | tr-speed |
| 4 | 貨物・旅客 | 貸切バスの交替運転者 (`ps-relief`) | `ps_relief` | ps-care |
| 4 | 実務 | 事故をふせぐ (`pr-prevent`) | `pr_prevent` | pr-accident, pr-health |
| 4 | 実務 | 運行計画の検証 (`pr-plan`) | `pr_plan` | pr-calc |
| 5 | 貨物・旅客 | 指導と健康管理 (`cg-guide`) | `cg_guide` | cg-record |
| 5 | 貨物・旅客 | 事故時と乗務員 (`ps-crew`) | `ps_crew` | ps-tenko, ps-care |
| 5 | 実務 | 危険予知と指差呼称 (`pr-hazard`) | `pr_hazard` | pr-prevent |
| 6 | 実務 | 総まとめ (`mix-final`) | 全分野 | cg-guide, lb-36, lb-bus, lb-drive, vh-shaken, tr-speed, tr-alcohol, ps-tenko, ps-care, pr-prevent |

問題群の中身は `app/js/bank_*.js`、スキルとの対応は `app/js/skills.js` の `gen: ['quiz', { pool }]` です。

## 模擬試験

タイトル画面の「模擬試験 貨物／旅客」は、スキルツリーとは別に、本試験と同じ配分で30問を出します（`app/js/exam.js`）。

| 分野 | 貨物 | 旅客 | 使う問題群 |
|---|---|---|---|
| (1) 事業法 | 貨物自動車運送事業法 8問 | 道路運送法 8問 | `cg_*` ／ `ps_*` |
| (2) 道路運送車両法 | 4問 | 4問 | `vh_*` |
| (3) 道路交通法 | 5問 | 5問 | `tr_*` |
| (4) 労働基準法 | 6問 | 6問 | `lb_*`（貨物は `lb_bus`・`lb_taxi` を除く、旅客は `lb_truck`・`lb_special` を除く） |
| (5) 実務上の知識及び能力 | 7問 | 7問 | `pr_*` |

合格判定は、総得点が満点の60%（18問）以上で、(1)〜(4)が各1問以上、(5)が2問以上（運行管理者試験センター「新規受験概要」による）。初回に正解した問題だけを得点にし、模擬試験の結果はスキルの習熟には数えません（まちがえた問題は復習に入ります）。

制限時間は本試験と同じ90分で、画面上ではのこり時間を数えます（解説を読んでいる時間も含みます）。時間切れになると、その時点で終了し、答えていない問題は不正解として判定します。

結果は端末内の記録（`history`）に、点数・合否・分野ごとの正解数と一緒に保存します。結果画面には、同じ種類（貨物／旅客）の最近10回の点数の推移と合格ラインを棒グラフで出し、タイトル画面のボタンには前回の点数を出します。

結果画面の「ここを練習」は、いちばん弱い分野（基準に届かなかった分野を優先し、次に正解率の低い分野）の中で、まちがえた問題がいちばん多い問題群のスキルの「れんしゅう」をすぐ始めます（`weakSpot`）。
