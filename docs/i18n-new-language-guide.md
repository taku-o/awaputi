# 新言語追加手順書

## 概要

BubblePop Web Game に新しい言語サポートを追加するための包括的なガイドです。このドキュメントでは、翻訳ファイルの作成から品質チェック、テスト、デプロイまでの完全なワークフローを説明します。

## 前提条件

- Node.js と npm がインストールされていること
- プロジェクトの多言語対応システムについて基本的な理解があること
- 対象言語の翻訳者またはネイティブスピーカーへのアクセス

## ステップ1: 準備作業

### 1.1 言語コードの決定

ISO 639-1 および ISO 3166-1 標準に従って言語コードを決定します。

**例:**
- フランス語: `fr`
- ドイツ語: `de`
- スペイン語: `es`
- イタリア語: `it`
- ポルトガル語: `pt`
- ロシア語: `ru`
- アラビア語: `ar`

**地域バリアントが必要な場合:**
- ブラジルポルトガル語: `pt-BR`
- アルゼンチンスペイン語: `es-AR`
- カナダフランス語: `fr-CA`

### 1.2 必要な情報の収集

新言語について以下の情報を収集します：

1. **基本情報**
   - 言語名（英語）
   - 言語名（その言語での表記）
   - 言語コード
   - 使用地域

2. **フォーマット情報**
   - 数値フォーマット（小数点、桁区切り）
   - 日付フォーマット
   - 通貨記号
   - 文字方向（LTR/RTL）

3. **文化的情報**
   - 色の意味
   - ジェスチャーの意味
   - タブー表現
   - 敬語の使用

## ステップ2: 翻訳ファイル構造の作成

### 2.1 ディレクトリ作成

```bash
# 言語ディレクトリを作成
mkdir src/locales/[language-code]

# 例: フランス語の場合
mkdir src/locales/fr
```

### 2.2 翻訳ファイルの作成

各カテゴリの翻訳ファイルを作成します：

```bash
# 基本ファイル構造を作成
touch src/locales/fr/common.json
touch src/locales/fr/menu.json
touch src/locales/fr/game.json
touch src/locales/fr/settings.json
touch src/locales/fr/errors.json
touch src/locales/fr/achievements.json
touch src/locales/fr/help.json
```

### 2.3 ファイルテンプレートの生成

自動化ツールを使用してテンプレートを生成します：

```javascript
// TranslationFileGenerator を使用
import { TranslationFileGenerator } from './src/core/i18n/TranslationFileGenerator.js';

const generator = new TranslationFileGenerator();

// テンプレート生成
await generator.generateLanguageFiles('fr', {
  baseLanguage: 'en',        // ベース言語
  includeMetadata: true,     // メタデータを含める
  createDirectories: true,   // ディレクトリを自動作成
  includeComments: true      // 翻訳ヒントを含める
});
```

## ステップ3: 翻訳ファイルの作成

### 3.1 メタデータの設定

各翻訳ファイルにメタデータを設定します：

```json
// src/locales/fr/common.json
{
  "meta": {
    "language": "fr",
    "region": "FR",
    "version": "1.0.0",
    "lastUpdated": "2025-01-28T00:00:00Z",
    "completeness": 0,
    "quality": 0,
    "contributors": ["翻訳者名"],
    "notes": "Initial French translation"
  },
  "translations": {
    // 翻訳内容
  }
}
```

### 3.2 カテゴリ別翻訳の作成

#### common.json - 共通翻訳

```json
{
  "meta": {
    "language": "fr",
    "region": "FR",
    "version": "1.0.0",
    "lastUpdated": "2025-01-28T00:00:00Z",
    "completeness": 100,
    "quality": 95,
    "contributors": ["Native French Speaker"]
  },
  "translations": {
    "buttons": {
      "ok": "OK",
      "cancel": "Annuler",
      "confirm": "Confirmer",
      "back": "Retour",
      "next": "Suivant",
      "previous": "Précédent",
      "save": "Enregistrer",
      "load": "Charger",
      "delete": "Supprimer",
      "edit": "Modifier",
      "close": "Fermer",
      "open": "Ouvrir"
    },
    "messages": {
      "loading": "Chargement...",
      "saving": "Enregistrement...",
      "saved": "Enregistré",
      "error": "Une erreur s'est produite",
      "success": "Succès",
      "warning": "Attention",
      "info": "Information"
    },
    "time": {
      "second": "seconde",
      "seconds": "secondes",
      "minute": "minute",
      "minutes": "minutes",
      "hour": "heure",
      "hours": "heures",
      "day": "jour",
      "days": "jours",
      "week": "semaine",
      "weeks": "semaines",
      "month": "mois",
      "year": "année",
      "years": "années"
    }
  }
}
```

#### menu.json - メニュー翻訳

```json
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
    "exit": "Quitter",
    "continue": "Continuer",
    "newGame": "Nouveau jeu",
    "highScores": "Meilleurs scores",
    "achievements": "Réalisations",
    "help": "Aide",
    "about": "À propos"
  }
}
```

#### game.json - ゲーム内翻訳

```json
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
    "ui": {
      "score": "Score",
      "level": "Niveau",
      "time": "Temps",
      "lives": "Vies",
      "combo": "Combo",
      "pause": "Pause",
      "resume": "Reprendre",
      "restart": "Recommencer",
      "quit": "Quitter"
    },
    "bubbles": {
      "normal": {
        "name": "Bulle normale",
        "description": "Une bulle standard qui disparaît en un clic"
      },
      "stone": {
        "name": "Bulle de pierre",
        "description": "Une bulle résistante qui nécessite plusieurs clics"
      },
      "rainbow": {
        "name": "Bulle arc-en-ciel",
        "description": "Déclenche le mode bonus quand elle éclate"
      }
    },
    "messages": {
      "gameStart": "Jeu commencé !",
      "gameOver": "Jeu terminé",
      "levelComplete": "Niveau terminé !",
      "newHighScore": "Nouveau record !",
      "timeUp": "Temps écoulé !",
      "wellDone": "Bien joué !",
      "tryAgain": "Réessayez !"
    }
  }
}
```

### 3.3 完全な翻訳セットの作成

以下の翻訳ファイルを全て作成する必要があります：

1. **common.json** - 共通UI要素
2. **menu.json** - メニューシステム
3. **game.json** - ゲーム内テキスト
4. **settings.json** - 設定画面
5. **errors.json** - エラーメッセージ
6. **achievements.json** - 実績システム
7. **help.json** - ヘルプ・チュートリアル

## ステップ4: 言語設定の追加

### 4.1 languages.json の更新

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
    "timeFormat": "HH:mm",
    "numberFormat": {
      "decimal": ",",
      "thousands": " ",
      "currency": "€"
    },
    "fonts": [
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif"
    ],
    "fallbacks": ["en", "ja"],
    "culturalNotes": {
      "formalityLevel": "moderate",
      "colorMeanings": {
        "red": "danger",
        "green": "success", 
        "blue": "information",
        "yellow": "warning"
      },
      "datePreferences": {
        "firstDayOfWeek": 1,
        "weekendDays": [6, 0]
      }
    }
  }
}
```

### 4.2 regions.json の更新

```json
{
  "FR": {
    "currency": "EUR",
    "timezone": "Europe/Paris",
    "firstDayOfWeek": 1,
    "weekendDays": [6, 0],
    "numberFormat": {
      "groupSize": 3,
      "groupSeparator": " ",
      "decimalSeparator": ","
    },
    "dateFormat": {
      "short": "DD/MM/YYYY",
      "long": "D MMMM YYYY",
      "time": "HH:mm"
    }
  }
}
```

### 4.3 formats.json の更新

```json
{
  "fr": {
    "number": {
      "decimal": ",",
      "thousands": " ",
      "percent": "%",
      "currency": "€"
    },
    "date": {
      "short": "DD/MM/YYYY",
      "medium": "D MMM YYYY",
      "long": "D MMMM YYYY",
      "full": "dddd D MMMM YYYY"
    },
    "time": {
      "short": "HH:mm",
      "medium": "HH:mm:ss",
      "long": "HH:mm:ss z"
    },
    "relativeTime": {
      "past": "il y a {{time}}",
      "future": "dans {{time}}",
      "now": "maintenant"
    }
  }
}
```

## ステップ5: 翻訳品質の管理

### 5.1 翻訳品質チェック

```javascript
// 品質チェックの実行
import { QualityChecker } from './src/core/i18n/QualityChecker.js';

const qualityChecker = new QualityChecker();

// フランス語翻訳の品質チェック
const result = qualityChecker.checkLanguageCompleteness('fr');
console.log('完成度:', result.completeness, '%');
console.log('品質スコア:', result.quality || 'N/A');
console.log('未翻訳項目:', result.missing.length);
```

### 5.2 一貫性チェック

```javascript
// パラメータ一貫性チェック
const translations = [
  { key: 'welcome', fr: 'Bienvenue, {{userName}} !', en: 'Welcome, {{userName}}!' },
  { key: 'score', fr: 'Score: {{points}}', en: 'Score: {{points}}' }
];

translations.forEach(item => {
  const result = qualityChecker.checkTranslation(
    item.key, 
    item.fr, 
    'fr',
    { baseTranslation: item.en }
  );
  
  if (!result.isValid) {
    console.log(`問題発見 ${item.key}:`, result.issues);
  }
});
```

### 5.3 長さチェック

```javascript
// UI制約チェック
const uiConstraints = {
  'menu.start': { maxLength: 15, type: 'button' },
  'game.ui.score': { maxLength: 10, type: 'label' },
  'settings.language.select': { maxLength: 20, type: 'dropdown' }
};

Object.entries(uiConstraints).forEach(([key, constraint]) => {
  const translation = lm.t(key, {}, { language: 'fr' });
  
  if (translation.length > constraint.maxLength) {
    console.warn(`警告: ${key} の翻訳が長すぎます (${translation.length}/${constraint.maxLength})`);
  }
});
```

## ステップ6: テストとデバッグ

### 6.1 翻訳テストページでのテスト

1. **基本表示テスト**
```html
<!-- test-i18n.html を開く -->
<script>
// フランス語に切り替え
await localizationManager.setLanguage('fr');

// 各翻訳キーをテスト
const testKeys = [
  'menu.start',
  'game.ui.score',
  'common.buttons.ok',
  'settings.language.select'
];

testKeys.forEach(key => {
  const translation = localizationManager.t(key);
  console.log(`${key}: ${translation}`);
});
</script>
```

2. **パラメータテスト**
```javascript
// パラメータ付き翻訳のテスト
const testCases = [
  { key: 'common.welcome', params: { userName: 'Pierre' } },
  { key: 'game.score.display', params: { score: 12345 } },
  { key: 'achievements.unlock', params: { achievement: 'First Win' } }
];

testCases.forEach(test => {
  const result = localizationManager.t(test.key, test.params, { language: 'fr' });
  console.log(`${test.key}:`, result);
});
```

### 6.2 UI表示テスト

1. **レイアウトテスト**
   - 各シーンでフランス語表示を確認
   - 文字が枠からはみ出していないかチェック
   - ボタンサイズの調整が必要かチェック

2. **フォントテスト**
   - フランス語特有の文字（é, à, ç等）が正しく表示されるかチェック
   - フォントファミリーが適切に適用されているかチェック

### 6.3 自動テストの実行

```javascript
// 自動テストスイートの実行
import { runTranslationTests } from './tests/i18n/translation-tests.js';

const testResults = await runTranslationTests('fr');
console.log('テスト結果:', testResults);

// {
//   passed: 245,
//   failed: 3,
//   warnings: 12,
//   coverage: 98.5,
//   issues: [
//     { key: 'error.network.timeout', issue: 'Translation too long' }
//   ]
// }
```

## ステップ7: 文化的適応の実装

### 7.1 数値フォーマットの確認

```javascript
// フランス語での数値表示テスト
const numbers = [1234.56, 1000000, 0.123];

await localizationManager.setLanguage('fr');

numbers.forEach(num => {
  const formatted = localizationManager.formatNumber(num, 'fr', 'FR');
  console.log(`${num} → ${formatted}`);
});

// 期待される出力:
// 1234.56 → 1 234,56
// 1000000 → 1 000 000
// 0.123 → 0,123
```

### 7.2 日付フォーマットの確認

```javascript
// フランス語での日付表示テスト
const dates = [
  new Date('2025-01-28'),
  new Date('2025-12-25'),
  new Date()
];

dates.forEach(date => {
  const formatted = localizationManager.formatDate(date, 'fr');
  console.log(`${date.toISOString()} → ${formatted}`);
});

// 期待される出力:
// 2025-01-28 → 28/01/2025
// 2025-12-25 → 25/12/2025
```

### 7.3 文化的タブーの回避

```javascript
// フランス語版で避けるべき表現のチェック
const culturalChecks = {
  inappropriate: [
    // ゲームでは使用を避ける表現
    'mourir', 'mort', 'tuer'
  ],
  preferred: [
    // 代替表現
    'éliminer', 'fin de partie', 'recommencer'
  ]
};

// 翻訳内容のチェック
const allTranslations = localizationManager.getAllTranslations('fr');
culturalChecks.inappropriate.forEach(word => {
  Object.entries(allTranslations).forEach(([key, translation]) => {
    if (typeof translation === 'string' && translation.toLowerCase().includes(word)) {
      console.warn(`文化的配慮が必要: ${key} に "${word}" が含まれています`);
    }
  });
});
```

## ステップ8: 統合とデプロイ

### 8.1 言語選択UIへの統合

```javascript
// 言語選択リストに新言語を追加
const availableLanguages = localizationManager.getAvailableLanguages();
console.log('利用可能言語:', availableLanguages);
// ['ja', 'en', 'zh-CN', 'zh-TW', 'ko', 'fr']

// 言語名の表示確認
const languageConfig = localizationManager.getLanguageConfig('fr');
console.log('言語表示名:', languageConfig.nativeName); // "Français"
```

### 8.2 自動言語検出の確認

```javascript
// ブラウザ言語がフランス語の場合の自動検出テスト
Object.defineProperty(navigator, 'language', {
  value: 'fr-FR',
  configurable: true
});

const detectedLanguage = localizationManager.languageDetector.detect();
console.log('検出された言語:', detectedLanguage); // 'fr'
```

### 8.3 パフォーマンステスト

```javascript
// フランス語読み込みパフォーマンステスト
const startTime = performance.now();

await localizationManager.setLanguage('fr');

const loadTime = performance.now() - startTime;
console.log(`フランス語読み込み時間: ${loadTime}ms`);

// 目標: 500ms以下
if (loadTime > 500) {
  console.warn('読み込み時間が目標を超えています');
}
```

## ステップ9: ドキュメントの更新

### 9.1 サポート言語リストの更新

```markdown
<!-- README.md の更新 -->
## Supported Languages

- 🇯🇵 日本語 (Japanese)
- 🇺🇸 English
- 🇫🇷 Français (French) - New!
- 🇨🇳 中文简体 (Chinese Simplified)
- 🇹🇼 中文繁體 (Chinese Traditional)
- 🇰🇷 한국어 (Korean)
```

### 9.2 翻訳貢献者の記録

```json
// src/locales/fr/contributors.json
{
  "contributors": [
    {
      "name": "翻訳者名",
      "role": "Lead Translator",
      "email": "translator@example.com",
      "contribution": "Complete French translation",
      "date": "2025-01-28"
    },
    {
      "name": "レビュー者名",
      "role": "Reviewer",
      "contribution": "Quality review and cultural adaptation",
      "date": "2025-01-29"
    }
  ]
}
```

## ステップ10: 継続的な保守

### 10.1 翻訳更新の追跡

```javascript
// 翻訳更新通知システム
class TranslationUpdateTracker {
  constructor() {
    this.updateQueue = [];
  }
  
  trackUpdate(language, key, oldValue, newValue) {
    this.updateQueue.push({
      language,
      key,
      oldValue,
      newValue,
      timestamp: new Date(),
      status: 'pending'
    });
  }
  
  getUpdateReport(language) {
    return this.updateQueue.filter(update => 
      update.language === language && update.status === 'pending'
    );
  }
}

const updateTracker = new TranslationUpdateTracker();

// 使用例
localizationManager.addEventListener('translationUpdate', (event) => {
  updateTracker.trackUpdate(
    event.language,
    event.key,
    event.oldValue,
    event.newValue
  );
});
```

### 10.2 品質監視

```javascript
// 定期的な品質チェック
setInterval(async () => {
  const qualityChecker = new QualityChecker();
  const result = qualityChecker.checkLanguageCompleteness('fr');
  
  if (result.completeness < 95) {
    console.warn(`フランス語翻訳完成度低下: ${result.completeness}%`);
    // アラート送信などの処理
  }
  
  if (result.quality && result.quality < 90) {
    console.warn(`フランス語翻訳品質低下: ${result.quality}%`);
  }
}, 24 * 60 * 60 * 1000); // 24時間ごと
```

## トラブルシューティング

### よくある問題と解決方法

1. **翻訳が表示されない**
   - ファイルパスの確認
   - JSON構文の確認
   - ネットワークエラーの確認

2. **文字化け**
   - ファイルのエンコーディング確認（UTF-8）
   - フォント設定の確認
   - ブラウザ設定の確認

3. **レイアウト崩れ**
   - 翻訳文字数の確認
   - CSS設定の調整
   - レスポンシブ対応の確認

4. **パフォーマンス問題**
   - 翻訳ファイルサイズの確認
   - キャッシュ設定の確認
   - 不要な翻訳データの削除

### デバッグツール

```javascript
// デバッグ用ヘルパー関数
function debugTranslation(language) {
  const lm = localizationManager;
  
  console.group(`Translation Debug: ${language}`);
  console.log('現在の言語:', lm.getCurrentLanguage());
  console.log('読み込み済み言語:', Array.from(lm.loadedLanguages));
  console.log('翻訳データ:', lm.translations.get(language));
  console.log('言語設定:', lm.getLanguageConfig(language));
  console.groupEnd();
}

// 使用例
debugTranslation('fr');
```

## まとめ

新言語の追加は複数のステップを要する作業ですが、このガイドに従うことで体系的かつ品質の高い翻訳を実装できます。

**重要なポイント:**
- 翻訳品質の継続的な監視
- 文化的適応の考慮
- ユーザビリティテストの実施
- 適切なドキュメンテーション
- コミュニティとの連携

新言語の追加が完了したら、必ず包括的なテストを実施し、品質基準を満たすことを確認してください。また、翻訳の継続的な改善とコミュニティからのフィードバックの収集も重要です。