# ヘルプ実装の包括的機能監査

## 1. HelpScene.js - メインヘルプシーン実装

### 場所
- `src/scenes/HelpScene.js`
- シーン名: 'help'として登録

### 主要機能
1. **サブコンポーネント構成**
   - HelpContentManager: ヘルプコンテンツ管理
   - HelpAccessibilityManager: アクセシビリティ管理
   - HelpAnimationManager: アニメーション管理
   - HelpRenderer: レンダリング
   - HelpEventManager: イベント管理

2. **ナビゲーション機能**
   - `setupEventCallbacks()`: 戻るボタンの実装
   - 現在は'menu'シーンに固定で戻る実装
   - ESCキーでメインメニューに戻る

3. **独自機能**
   - フィードバックダイアログ表示
   - 効果レポート表示
   - 検索機能（フォーカス時の処理）

### アクセス方法
- メインメニューから'help'選択
- SceneManager.switchScene('help')を呼び出し

## 2. キーボードショートカットヘルプ（Hキー）

### 場所
- `src/accessibility/LanguageSpecificAccessibility.js`

### 主要機能
1. **言語別キーボードレイアウト**
   - 各言語（ja, en, de, fr, ar, he）でのショートカット定義
   - 'help': 'KeyH'として定義
   - RTL言語のサポート

2. **ショートカット定義**
   ```javascript
   shortcuts: {
       'help': 'KeyH',
       'settings': 'KeyS',
       'fullscreen': 'F11'
   }
   ```

### 実装の詳細
- キーボードショートカットの更新は`updateKeyboardShortcuts()`で行われる
- 実際のHキー押下時の処理は別の場所で実装されている可能性

## 3. ContextualHelpSystem - F1キー/Ctrl+Hヘルプ

### 場所
- `src/debug/ContextualHelpSystem.js`

### 主要機能
1. **複数のヘルプアクセス方法**
   - F1キー: `showContextualHelp()`
   - Ctrl+?: `showQuickHelp()`
   - 自動トリガー: コンテキストに基づいたヘルプ表示

2. **独自機能**
   - コンテキスト依存のヘルプトリガー
   - インタラクティブガイド機能
   - ツールチップ表示
   - ヘルプ通知のポップアップ
   - ヘルプダイアログ（モーダル）
   - アクション実行機能
   - 関連ドキュメントへのリンク

3. **ヘルプコンテンツの構造**
   ```javascript
   {
       title: 'タイトル',
       quick: '簡易説明',
       detailed: '詳細説明',
       actions: [{label: 'ラベル', action: 'アクション名'}],
       relatedDocs: ['doc1', 'doc2']
   }
   ```

### 表示形式
- 通知形式（右下のポップアップ）
- モーダルダイアログ形式
- ツールチップ形式
- インタラクティブガイドバブル

## 機能比較マトリックス

| 機能 | HelpScene | Hキーショートカット | ContextualHelpSystem |
|------|-----------|-------------------|---------------------|
| アクセス方法 | メニューから | Hキー | F1/Ctrl+H/自動 |
| 戻るナビゲーション | あり（メニューへ） | 不明 | なし（閉じるのみ） |
| 検索機能 | あり | なし | なし |
| アクセシビリティ | 専用マネージャー | 言語別対応 | なし |
| アニメーション | 専用マネージャー | なし | CSS アニメーション |
| コンテンツ管理 | 専用マネージャー | なし | 内部実装 |
| フィードバック | あり | なし | なし |
| コンテキスト依存 | なし | なし | あり |
| インタラクティブガイド | なし | なし | あり |
| ツールチップ | なし | なし | あり |

## 統合に向けた考察

1. **HelpSceneを主要実装として使用**
   - 最も完全な実装
   - 適切なコンポーネント分離
   - アクセシビリティサポート

2. **ContextualHelpSystemの独自機能を統合**
   - コンテキスト依存ヘルプ
   - インタラクティブガイド
   - ツールチップ機能

3. **キーボードショートカットの統一**
   - HキーでHelpSceneを開く
   - F1でコンテキストヘルプを表示（HelpScene内で）