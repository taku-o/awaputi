# BubblePop (awaputi) プロジェクト概要

## プロジェクトの目的
**BubblePop (awaputi)** は、HTML5 Canvas を使用したWebベースのバブルポップゲームです。画面に浮かび上がる様々な種類の泡をクリック・タップして割り、スコアを稼ぐアクションゲームです。

### 主な特徴
- 18種類以上の個性豊かな泡（通常、石、ダイヤモンド、レインボー、エレクトリック、ボス泡など）
- 戦略的なゲームプレイ（時間管理とHP管理）
- 10種類の多様なステージ
- APとTAPを貯めて購入する進歩システム
- WCAG 2.1 AA準拠のアクセシビリティ
- 5言語対応（日本語、英語、中国語簡体字・繁体字、韓国語）
- 60FPS維持を目指す高度なパフォーマンス最適化
- 詳細なプレイ統計と30+種類の実績システム

## 技術スタック
- **フロントエンド**: Vanilla JavaScript (ES6+), HTML5 Canvas, Web APIs
- **アーキテクチャ**: コンポーネントベースのモジュラー設計
- **言語**: 日本語（UI、ドキュメント、コメント）
- **ビルドツール**: Vite
- **テスト**: Jest (ユニットテスト), Playwright (E2Eテスト)
- **PWA**: Service Worker, manifest.json
- **モジュールシステム**: ES Modules (`"type": "module"`)

## コーディングスタイル・規約
### ネーミング規約
- **クラス名**: PascalCase (例: `BubbleManager`, `GameEngine`)
- **メソッド名**: camelCase (例: `updateBubbles`, `handleClick`)
- **定数**: UPPER_SNAKE_CASE (例: `MAX_BUBBLES`, `DEFAULT_SPEED`)
- **ファイル名**: PascalCase.js (例: `GameEngine.js`, `BubbleManager.js`)

### コードスタイル
- インデント: スペース4つ
- 行末セミコロン: 必須
- 文字列: シングルクォート優先
- ES6+機能の積極的利用（アロー関数、クラス、async/await等）
- JSDoc形式のコメント（日本語）

### 設計パターン
- **Main Controller Pattern**: 大きなファイル（2,500語超）は軽量コントローラー＋サブコンポーネントに分割
- **依存性注入**: サブコンポーネントはコンストラクタで注入
- **シングルトン**: GameEngine、ConfigurationManager等の中央管理システム
- **イベント駆動**: カスタムイベントシステムによる疎結合

## システム固有のコマンド
**プラットフォーム**: Darwin (macOS)

### 基本コマンド
- `ls`: ファイル一覧表示
- `cd`: ディレクトリ移動
- `pwd`: 現在のディレクトリ表示
- `grep`: テキスト検索（macOSでは `rg` (ripgrep) も利用可能）
- `find`: ファイル検索

### Git コマンド
- `git status`: 変更状況確認
- `git diff`: 差分確認
- `git add`: ステージング
- `git commit`: コミット作成
- `git push`: リモートへプッシュ
- `git checkout`: ブランチ切り替え
- `git log`: コミット履歴確認

### macOS特有のコマンド
- `open`: ファイルやディレクトリをデフォルトアプリで開く
- `pbcopy`: クリップボードにコピー
- `pbpaste`: クリップボードから貼り付け

## ディレクトリ構造
```
awaputi/
├── src/                    # ソースコード
│   ├── core/              # コアゲームエンジン
│   ├── scenes/            # ゲームシーン
│   ├── bubbles/           # 泡の種類定義
│   ├── managers/          # ゲームマネージャー
│   ├── effects/           # エフェクトシステム
│   ├── ui/                # UIコンポーネント
│   ├── utils/             # ユーティリティ関数
│   ├── locales/           # 多言語対応ファイル
│   └── tests/             # 統合テスト
├── tests/                 # ユニットテスト
├── docs/                  # ドキュメント
│   └── projects/          # プロジェクト管理ドキュメント
├── assets/                # 画像・音声アセット
├── dist/                  # ビルド出力
└── tools/                 # 開発ツール
```