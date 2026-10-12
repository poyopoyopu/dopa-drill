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
| 3 | 車両・道交 | 車検と検査証 (`vh-shaken`) | `vh_shaken` | vh-check |
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
| 4 | 貨物・旅客 | 記録と保存 (`cg-record`) | `cg_record` | cg-tenko |
| 4 | 貨物・旅客 | 貸切バスの交替運転者 (`ps-relief`) | `ps_relief` | ps-care |
| 4 | 実務 | 事故をふせぐ (`pr-prevent`) | `pr_prevent` | pr-accident, pr-health |
| 5 | 貨物・旅客 | 指導と健康管理 (`cg-guide`) | `cg_guide` | cg-record |
| 6 | 実務 | 総まとめ (`mix-final`) | 全分野 | cg-guide, lb-36, lb-bus, lb-drive, vh-shaken, tr-speed, tr-alcohol, ps-tenko, ps-care, pr-prevent |

問題群の中身は `app/js/bank_*.js`、スキルとの対応は `app/js/skills.js` の `gen: ['quiz', { pool }]` です。
