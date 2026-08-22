# Hand Gesture Effects

Webカメラの映像から手のジェスチャーを認識し、ジェスチャーに応じて画面エフェクトを切り替えるブラウザアプリです。ビルド不要の静的ファイル（HTML / CSS / JS）のみで構成されており、CDN から [MediaPipe Hand Landmarker](https://developers.google.com/mediapipe) と [Three.js](https://threejs.org/) を読み込んで動作します。

## 使い方（他のPCでも共通）

1. このフォルダをそのまま任意のPCにコピー（またはgit clone）します。
2. **簡易HTTPサーバーで配信します。**`file://` で直接開くとカメラ利用がブロックされるため、必ずローカルサーバー経由で開いてください。
   ```bash
   # Python がある場合
   python3 -m http.server 8000

   # Node.js がある場合
   npx serve .
   ```
3. ブラウザで `http://localhost:8000` を開きます（Chrome / Edge 推奨）。
4. 画面中央の **「カメラを開始」ボタン**をクリックし、カメラ利用のブラウザ確認ダイアログで **許可**を選びます。
   - この2つの操作（ボタンクリックとカメラ許可）は毎回ユーザー操作が必要です（ブラウザの自動再生・権限ポリシーのため自動化できません）。
5. カメラにジェスチャーを映すと、認識結果とエフェクトが自動的に切り替わります。

### 動作要件・注意点

- **インターネット接続が必要です**（初回読み込み時）。MediaPipeのモデル・WASMとThree.jsをCDN (`jsdelivr.net` / `storage.googleapis.com`) から取得するためです。一度読み込むとブラウザキャッシュが効きますが、完全オフライン環境では動きません。社内ネットワーク等でこれらのドメインがブロックされている場合は、事前にこのCDNへのアクセス許可が必要です。
- **HTTPS または localhost が必須**（ブラウザの `getUserMedia` 制約）。他のPCで動かす際も、必ず `http://localhost:...` か `https://...` で開いてください。
- 対応ブラウザ: 最新の Chrome / Edge（WebGL2 と ES Modules が必要）。Safari / Firefox でも多くの場合動作しますが未検証です。
- 手の検出精度は照明条件・カメラの画角に左右されます。手全体（できれば手首まで）が画面内に映るようにしてください。

## ジェスチャーとエフェクト対応表

| # | ジェスチャー | 条件 | エフェクト |
|---|---|---|---|
| 1 | ハート | 両手の親指同士・人差し指同士を近づけてハート形を作る | 手の間から赤い3Dハートが出現し、ゆっくり上昇しながら広がる |
| 2 | ピース（片手） | 片手でピースサイン | 画面下からカラフルな風船が浮かび上がる |
| 3 | ピース（両手） | 両手でピースサイン | 画面上から紙吹雪が降る |
| 4 | グッド（片手） | 片手で親指を立てる | 「いいね」の吹き出しがふわっと浮かび上がる |
| 5 | グッド（両手） | 両手で親指を立てる | 背景が暗くなり、花火が次々に打ち上がる |
| 6 | バッド（片手） | 片手で親指を下に向ける | 「バッド」の吹き出しが浮かび上がる |
| 7 | バッド（両手） | 両手で親指を下に向ける | 背景が暗くなり、雲と大雨が降る |
| 8 | メロイックサイン | 人差し指と小指を立てる（中指・薬指は曲げる） | 背景にカラフルなレーザービームが広がる |

ジェスチャーは数フレーム連続で検出できた時点で確定し（誤検出防止のためのデバウンス）、ジェスチャーをやめると数フレーム後にエフェクトも終了します。

## ファイル構成

```
index.html              エントリーポイント（video / canvas レイヤー構成）
style.css                レイアウト・見た目
src/main.js               カメラ初期化・検出ループ・ジェスチャー安定化
src/handTracking.js       MediaPipeラッパーとジェスチャー分類ロジック
src/effects/effectManager.js  現在のジェスチャーに応じてエフェクトを統括
src/effects/heart.js          Three.js製 3Dハート
src/effects/balloons.js       風船
src/effects/confetti.js       紙吹雪
src/effects/fireworks.js      花火
src/effects/rain.js           雨
src/effects/lasers.js         レーザービーム
src/effects/bubble.js         グッド/バッド吹き出し
src/effects/utils.js          乱数などの共通ユーティリティ
```

## 別環境で動かす際に変更が必要になりうる点

基本的に**このフォルダをコピーするだけ**で動きます。以下は稀に調整が必要になるケースです。

- **社内プロキシ等でCDNがブロックされる場合**: `src/handTracking.js` と `src/effects/heart.js` 冒頭の `https://cdn.jsdelivr.net/...` / `https://storage.googleapis.com/...` の参照を、社内ミラーや `node_modules` からのローカル配信に差し替える必要があります。
- **カメラが複数ある/内蔵カメラを使いたくない場合**: `src/main.js` の `getUserMedia` の `facingMode: "user"` を `deviceId` 指定に変更してください。
- **GPUが無い/古い環境でWebGL初期化に失敗する場合**: `src/handTracking.js` の `delegate: "GPU"` を `"CPU"` に変更すると動きますが、検出は遅くなります。

上記以外は、対応ブラウザとローカルサーバーさえあれば無変更で動作します。
