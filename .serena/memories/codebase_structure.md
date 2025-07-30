# コードベース構造

## ディレクトリ構成
```
awaputi/
├── src/                    # メインソースコード
│   ├── core/              # コアシステム（50+ファイル）
│   │   ├── GameEngine.js      # メインゲームループ
│   │   ├── ConfigurationManager.js # 統一設定管理
│   │   ├── CalculationEngine.js # 高性能計算エンジン
│   │   ├── SceneManager.js    # シーン管理
│   │   ├── InputManager.js    # 入力処理
│   │   ├── PlayerData.js      # プレイヤーデータ
│   │   └── i18n/             # 国際化システム
│   ├── scenes/            # ゲームシーン
│   │   ├── MainMenuScene.js   # メインメニュー
│   │   ├── GameScene.js       # ゲームプレイ
│   │   ├── StageSelectScene.js # ステージ選択
│   │   ├── ShopScene.js       # アイテムショップ
│   │   └── UserInfoScene.js   # ユーザー情報
│   ├── config/            # 設定ファイル
│   │   ├── GameConfig.js      # ゲーム全般設定
│   │   ├── GameBalance.js     # バランス調整
│   │   ├── AudioConfig.js     # 音響設定
│   │   ├── EffectsConfig.js   # エフェクト設定
│   │   └── PerformanceConfig.js # パフォーマンス設定
│   ├── managers/          # 各種マネージャー
│   ├── bubbles/           # バブル関連
│   ├── utils/             # ユーティリティ
│   ├── locales/           # 多言語翻訳ファイル
│   └── main.js            # エントリーポイント
├── tests/                 # テストスイート
│   ├── setup.js           # Jestセットアップ
│   ├── unit/              # ユニットテスト
│   ├── integration/       # 統合テスト
│   ├── e2e/               # E2Eテスト
│   └── performance/       # パフォーマンステスト
├── docs/                  # ドキュメント
├── tools/                 # 開発ツール
└── scripts/               # ビルド・デプロイスクリプト
```

## 主要コンポーネント
- **GameEngine**: 中央制御、全システム統合
- **ConfigurationManager**: 設定の中央管理
- **BubbleManager**: バブル生成・管理・衝突検出
- **ScoreManager**: スコアリング・コンボシステム
- **StatisticsManager**: 統計収集・分析
- **AchievementManager**: 実績システム
- **LocalizationManager**: 多言語対応