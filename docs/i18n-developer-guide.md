# 多言語対応システム開発者ガイド

## 概要

BubblePop Web Gameの多言語対応システム（国際化・ローカライゼーション）の開発者向け包括的ガイドです。このドキュメントでは、システムの使用方法、新言語の追加手順、翻訳管理ガイドライン、トラブルシューティング方法について説明します。

## システムアーキテクチャ

### コアコンポーネント

#### 1. LocalizationManager
中央翻訳管理システム（`src/core/LocalizationManager.js`）

```javascript
// 基本的な使用方法
import { LocalizationManager } from './core/LocalizationManager.js';

const localizationManager = new LocalizationManager();

// 翻訳の取得
const text = localizationManager.t('menu.start'); // "ゲーム開始"

// パラメータ付き翻訳
const welcomeText = localizationManager.t('common.welcome', { name: 'ユーザー名' });

// 言語切り替え
await localizationManager.setLanguage('en');
```

#### 2. 翻訳ファイル構造
```
src/locales/
├── ja/              # 日本語（完了）
├── en/              # 英語（完了）
├── zh-CN/           # 中国語簡体字
├── zh-TW/           # 中国語繁体字
├── ko/              # 韓国語
└── config/          # 設定ファイル
    ├── languages.json    # 言語設定
    ├── regions.json      # 地域設定
    └── formats.json      # 数値・日付フォーマット
```

### 最適化コンポーネント

#### TranslationLoader & OptimizedTranslationLoader
- **TranslationLoader**: 基本的な翻訳ファイル読み込み
- **OptimizedTranslationLoader**: 遅延読み込み、メモリ最適化、プリロード機能

#### パフォーマンス監視
- **I18nPerformanceMonitor**: 翻訳処理の性能監視
- **I18nRenderOptimizer**: レンダリング最適化

#### セキュリティ
- **I18nSecurityManager**: XSS防止、翻訳データ検証
- **I18nSecurityTester**: セキュリティテスト実行

## 基本的な使用方法

### 1. 翻訳キーの作成

翻訳キーは階層構造で整理されています：

```javascript
// カテゴリ別翻訳キーの例
'common.buttons.ok'          // 共通ボタン
'menu.mainMenu.start'        // メニュー項目
'game.messages.timeUp'       // ゲーム内メッセージ
'settings.language.select'   // 設定項目
'errors.network.timeout'     // エラーメッセージ
'achievements.unlock.first'  // 実績システム
'help.tutorial.step1'        # ヘルプ・チュートリアル
```

### 2. GameEngineでの統合

```javascript
// GameEngine.js での使用例
export class GameEngine {
    constructor(canvas) {
        this.localizationManager = new LocalizationManager();
        
        // 言語変更イベントリスナー
        this.localizationManager.addLanguageChangeListener((newLang, oldLang) => {
            this.onLanguageChanged(newLang, oldLang);
        });
    }
    
    onLanguageChanged(newLanguage, oldLanguage) {
        // 全シーンの再描画
        this.sceneManager.refreshAllScenes();
        console.log(`言語が ${oldLanguage} から ${newLanguage} に変更されました`);
    }
}
```

### 3. シーンでの翻訳使用

```javascript
// MainMenuScene.js での使用例
export class MainMenuScene {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.lm = gameEngine.localizationManager;
    }
    
    updateMenuLabels() {
        // 動的ラベル更新
        this.startButton.text = this.lm.t('menu.start');
        this.settingsButton.text = this.lm.t('menu.settings');
        this.exitButton.text = this.lm.t('menu.exit');
    }
    
    render(ctx) {
        // レンダリング時に翻訳を適用
        ctx.fillText(this.lm.t('menu.title'), 100, 50);
        this.updateMenuLabels();
    }
}
```

## 新言語追加手順

### ステップ1: 翻訳ファイルの準備

1. **言語ディレクトリの作成**
```bash
mkdir src/locales/[language-code]/
```

2. **翻訳ファイルの作成**
各カテゴリのファイルを作成：
```bash
touch src/locales/[language-code]/common.json
touch src/locales/[language-code]/menu.json
touch src/locales/[language-code]/game.json
touch src/locales/[language-code]/settings.json
touch src/locales/[language-code]/errors.json
touch src/locales/[language-code]/achievements.json
touch src/locales/[language-code]/help.json
```

### ステップ2: 翻訳ファイル形式

```json
// src/locales/[language-code]/common.json
{
  "meta": {
    "language": "en",
    "region": "US",
    "version": "1.0.0",
    "lastUpdated": "2025-01-28T00:00:00Z",
    "completeness": 100,
    "quality": 95,
    "contributors": ["Translator Name"]
  },
  "translations": {
    "buttons": {
      "ok": "OK",
      "cancel": "Cancel",
      "confirm": "Confirm",
      "back": "Back"
    },
    "messages": {
      "loading": "Loading...",
      "saving": "Saving...",
      "error": "An error occurred"
    }
  }
}
```

### ステップ3: 言語設定の追加

`src/locales/config/languages.json` に新言語を追加：

```json
{
  "fr": {
    "name": "French",
    "nativeName": "Français",
    "code": "fr",
    "region": "FR",
    "direction": "ltr",
    "pluralRules": "french",
    "dateFormat": "DD/MM/YYYY",
    "numberFormat": {
      "decimal": ",",
      "thousands": " ",
      "currency": "€"
    },
    "fonts": ["Arial", "Helvetica", "sans-serif"],
    "fallbacks": ["en", "ja"]
  }
}
```

### ステップ4: 翻訳内容の追加

既存の日本語または英語ファイルを参考に翻訳内容を記入：

```json
// 例: menu.json
{
  "meta": {
    "language": "fr",
    "region": "FR",
    "version": "1.0.0",
    "lastUpdated": "2025-01-28T00:00:00Z",
    "completeness": 100,
    "quality": 95
  },
  "translations": {
    "title": "BubblePop",
    "start": "Commencer le jeu",
    "settings": "Paramètres",
    "userInfo": "Informations utilisateur",
    "shop": "Boutique",
    "exit": "Quitter"
  }
}
```

### ステップ5: テスト

1. **翻訳ファイルの検証**
```javascript
// コンソールでテスト
const lm = new LocalizationManager();
await lm.setLanguage('fr');
console.log(lm.t('menu.start')); // "Commencer le jeu"
```

2. **UI表示テスト**
- `test-i18n.html` を使用してブラウザでテスト
- 各画面での表示確認
- 文字長によるレイアウト崩れの確認

## 翻訳管理ガイドライン

### 1. 翻訳キーの命名規則

```javascript
// 良い例
'common.buttons.save'           // 分類が明確
'game.bubbles.normal.description' // 階層が論理的
'errors.network.connectionFailed' // 具体的

// 悪い例
'save'                         // 分類が不明確
'normalBubbleDescription'      // フラット構造
'err1'                        // 意味が不明
```

### 2. 翻訳品質管理

#### パラメータ使用の統一
```json
// 良い例
{
  "welcome": "こんにちは、{{userName}}さん！",
  "itemCount": "{{count}}個のアイテム"
}

// 悪い例
{
  "welcome": "こんにちは、%sさん！",  // 異なる形式
  "itemCount": "アイテム: {count}"   // 異なる形式
}
```

#### 文脈の提供
```json
{
  "buttons": {
    "save": "保存",           // ボタンとして使用
    "save_progress": "進捗を保存"  // 具体的な文脈を提供
  }
}
```

### 3. 翻訳品質チェック

LocalizationManagerに組み込まれた品質チェック機能を使用：

```javascript
// 品質チェックの実行
const qualityChecker = localizationManager.qualityChecker;
const result = qualityChecker.checkTranslation(
  'common.welcome',
  'こんにちは、{{userName}}さん！',
  'ja'
);

console.log('品質スコア:', result.score);
console.log('問題:', result.issues);
```

### 4. 自動化ツール

#### 未翻訳項目の検出
```javascript
// 未翻訳項目検出ツール
import { TranslationKeyManager } from './core/i18n/TranslationKeyManager.js';

const keyManager = new TranslationKeyManager();
const untranslated = keyManager.findUntranslatedKeys('fr');
console.log('未翻訳項目:', untranslated);
```

#### 進捗追跡
```javascript
// 進捗追跡ツール
import { ProgressTracker } from './core/i18n/ProgressTracker.js';

const tracker = new ProgressTracker();
const progress = tracker.trackProgress('fr');
console.log(`完成度: ${progress.completeness}%`);
```

## トラブルシューティング

### 1. 翻訳が表示されない

**症状**: 翻訳キーがそのまま表示される

**解決方法**:
1. 翻訳ファイルが正しく配置されているか確認
2. 翻訳キーが正しいか確認
3. ファイルの JSON 形式が正しいか確認

```javascript
// デバッグ用コード
console.log('現在の言語:', localizationManager.getCurrentLanguage());
console.log('読み込み済み言語:', localizationManager.getLoadedLanguages());
console.log('翻訳データ:', localizationManager.getTranslations('ja'));
```

### 2. 言語切り替えが動作しない

**症状**: setLanguage() を呼んでも言語が変わらない

**解決方法**:
1. 非同期処理の確認
```javascript
// 正しい方法
await localizationManager.setLanguage('en');

// 間違った方法
localizationManager.setLanguage('en'); // awaitなし
```

2. 言語変更イベントリスナーが設定されているか確認
```javascript
localizationManager.addLanguageChangeListener((newLang, oldLang) => {
  // UI更新処理
  this.updateUI();
});
```

### 3. パフォーマンス問題

**症状**: 言語切り替えが遅い、メモリ使用量が多い

**解決方法**:
1. OptimizedTranslationLoader の使用確認
2. プリロード機能の活用
```javascript
// プリロードで改善
await localizationManager.optimizedLoader.preloadLanguages(['ja', 'en', 'fr']);
```

3. パフォーマンス監視の確認
```javascript
// パフォーマンス測定
const monitor = localizationManager.performanceMonitor;
console.log('パフォーマンス統計:', monitor.getStatistics());
```

### 4. セキュリティ警告

**症状**: コンソールにセキュリティ警告が表示される

**解決方法**:
1. 翻訳データの検証
```javascript
// セキュリティチェック
const securityManager = localizationManager.securityManager;
const isSecure = securityManager.validateTranslationData(translationData);
```

2. パラメータのサニタイゼーション確認
```javascript
// 安全なパラメータ使用
const safeText = localizationManager.t('welcome', {
  userName: securityManager.sanitizeParameter(userName)
});
```

## 高度な機能

### 1. 条件付き翻訳

```javascript
// 複数形対応
const itemText = localizationManager.tPlural('items.count', itemCount, { count: itemCount });

// 条件付き翻訳
const statusText = localizationManager.tConditional(
  isOnline,
  'status.online',
  'status.offline'
);
```

### 2. 文化的適応

```javascript
// RTL言語の検出
if (localizationManager.isRTLLanguage('ar')) {
  document.dir = 'rtl';
}

// 色の意味の取得
const colorMeaning = localizationManager.getColorMeaning('red', 'ja');
// 'danger'

// 地域別数値フォーマット
const formattedNumber = localizationManager.formatNumber(1234.56, 'en-US');
// "1,234.56"
```

### 3. アクセシビリティ対応

```javascript
// アクセシビリティ専用翻訳
const ariaLabel = localizationManager.tAccessibility('button.save.aria');

// スクリーンリーダー対応
const screenReaderText = localizationManager.tScreenReader('game.score.announce', {
  score: 1000
});
```

## 開発ワークフロー

### 1. 新機能開発時

1. **翻訳キーの設計**
   - 機能に応じた適切なカテゴリの選択
   - 階層構造の設計
   - パラメータの設計

2. **翻訳データの追加**
   - 日本語翻訳の追加
   - 英語翻訳の追加
   - 品質チェックの実行

3. **コードでの使用**
   - LocalizationManager.t() の使用
   - パラメータの適切な使用
   - エラーハンドリングの実装

### 2. 翻訳更新時

1. **変更の追跡**
   - Git で翻訳ファイルの変更を管理
   - メタデータの lastUpdated を更新
   - バージョン番号の更新

2. **品質チェック**
   - 自動品質チェックの実行
   - 翻訳一貫性の確認
   - UI表示の確認

### 3. リリース前

1. **完成度チェック**
   - 全言語の完成度確認
   - 未翻訳項目の確認
   - 品質スコアの確認

2. **テスト実行**
   - 全言語でのUI表示テスト
   - パフォーマンステスト
   - セキュリティテスト

## ベストプラクティス

### 1. 翻訳キー設計

- **明確で具体的な名前を使用**
- **階層構造を適切に設計**
- **将来の拡張を考慮**
- **一貫した命名規則の使用**

### 2. パフォーマンス

- **OptimizedTranslationLoader の使用**
- **必要な言語のみプリロード**
- **パフォーマンス監視の活用**
- **メモリ使用量の監視**

### 3. セキュリティ

- **ユーザーパラメータのサニタイゼーション**
- **翻訳データの検証**
- **XSS攻撃の防止**
- **定期的なセキュリティテスト**

### 4. 保守性

- **翻訳ファイルの適切な構造化**
- **メタデータの活用**
- **品質管理の徹底**
- **ドキュメントの更新**

## サポートとリソース

### ドキュメント
- [多言語対応システム API リファレンス](./i18n-system-api.md)
- [翻訳管理ツールガイド](./i18n-translation-tools.md)
- [トラブルシューティングガイド](./troubleshooting-guide.md)

### ツール
- 翻訳品質チェッカー: `QualityChecker`
- 進捗追跡: `ProgressTracker`
- セキュリティテスト: `I18nSecurityTester`
- パフォーマンス監視: `I18nPerformanceMonitor`

### テストファイル
- 翻訳テストページ: `test-i18n.html`
- システム統合テスト: `test-system-integration.html`
- セキュリティテスト: `test-security-integration.html`

---

このガイドは、BubblePop Web Game の多言語対応システムを効果的に活用するための包括的な情報を提供しています。質問や問題がある場合は、プロジェクトのトラブルシューティングガイドを参照するか、開発チームにお問い合わせください。