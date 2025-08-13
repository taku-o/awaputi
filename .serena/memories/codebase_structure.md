# コードベース構造

## ルートディレクトリ
```
awaputi/
├── src/                    # ソースコード
├── docs/                   # ドキュメント
├── tests/                  # テストコード
├── tools/                  # 開発ツール
├── scripts/                # ビルド・デプロイスクリプト
├── assets/                 # 静的アセット（画像、i18nファイル等）
├── help/                   # ヘルプコンテンツ
├── index.html              # エントリーポイント
├── sw.js                   # Service Worker
├── manifest.json           # PWAマニフェスト
└── package.json            # プロジェクト設定
```

## src/ディレクトリ構造
```
src/
├── main.js                 # アプリケーションエントリーポイント
├── core/                   # コアゲームエンジン
│   ├── GameEngine.js       # メインゲームエンジン
│   ├── visual/             # 視覚管理システム
│   ├── audio/              # 音響システム
│   └── help/               # ヘルプシステム
├── scenes/                 # ゲームシーン
│   ├── MenuScene.js        # メインメニュー
│   ├── GameScene.js        # ゲームプレイ
│   ├── SettingsScene.js    # 設定画面
│   └── HelpScene.js        # ヘルプ画面
├── bubbles/                # バブル関連クラス
│   ├── Bubble.js           # 基底クラス
│   └── [各種バブルタイプ]
├── managers/               # 各種マネージャー
│   ├── ConfigurationManager.js
│   ├── SceneManager.js
│   └── [その他マネージャー]
├── utils/                  # ユーティリティ
├── locales/                # 翻訳ファイル（ソース）
├── config/                 # 設定ファイル
├── ui/                     # UIコンポーネント
├── effects/                # エフェクト関連
├── audio/                  # 音声関連
├── seo/                    # SEO関連
├── accessibility/          # アクセシビリティ
├── analytics/              # 分析機能
└── debug/                  # デバッグツール
```

## 重要なファイル
- `src/main.js`: アプリケーション初期化
- `src/core/GameEngine.js`: メインゲームループ
- `src/managers/SceneManager.js`: シーン管理
- `src/managers/ConfigurationManager.js`: 設定管理
- `src/scenes/*`: 各画面の実装
- `src/bubbles/*`: バブルの種類と動作

## アセット構造
```
assets/
├── i18n/                   # 本番用翻訳ファイル
│   ├── ja/                 # 日本語
│   ├── en/                 # 英語
│   ├── ko/                 # 韓国語
│   ├── zh-CN/              # 中国語簡体字
│   └── zh-TW/              # 中国語繁体字
├── images/                 # 画像ファイル
├── sounds/                 # 音声ファイル
└── fonts/                  # フォントファイル
```

## テスト構造
```
tests/
├── unit/                   # ユニットテスト
├── integration/            # 統合テスト
├── performance/            # パフォーマンステスト
├── e2e/                    # E2Eテスト
└── quality/                # 品質テスト
```

## 特徴
- モジュラー設計（ES6 modules）
- シーンベースのゲーム構造
- 多言語対応（i18n）
- PWA対応
- アクセシビリティ重視