# 多言語対応システム 翻訳管理ツールガイド

## 概要

BubblePop Web Game の多言語対応システムには、翻訳作業を効率化し品質を向上させるための包括的なツールセットが組み込まれています。このドキュメントでは、各ツールの使用方法と活用方法について説明します。

## ツール一覧

### 1. 翻訳品質管理ツール
- **QualityChecker**: 翻訳品質の自動チェック
- **ValidationRules**: 品質検証ルール
- **QualityReporter**: 品質レポート生成

### 2. 翻訳進捗管理ツール
- **ProgressTracker**: 翻訳進捗の追跡
- **TranslationKeyManager**: 翻訳キーの管理
- **CompletenessAnalyzer**: 完成度分析

### 3. 自動化ツール
- **TranslationFileGenerator**: 翻訳ファイル生成
- **ImportExportManager**: データのインポート/エクスポート
- **AutomationScripts**: 各種自動化スクリプト

### 4. セキュリティツール
- **I18nSecurityManager**: セキュリティ管理
- **I18nSecurityTester**: セキュリティテスト
- **ContentValidator**: コンテンツ検証

## 1. 翻訳品質管理ツール

### QualityChecker

翻訳品質を自動的にチェックし、問題を特定します。

#### 基本使用方法

```javascript
import { QualityChecker } from './core/i18n/QualityChecker.js';

const qualityChecker = new QualityChecker();

// 単一翻訳のチェック
const result = qualityChecker.checkTranslation(
  'common.welcome',                    // 翻訳キー
  'こんにちは、{{userName}}さん！',      // 翻訳内容
  'ja',                               // 言語
  { maxLength: 50, hasParameters: true }  // コンテキスト
);

console.log('品質チェック結果:', result);
// {
//   isValid: true,
//   issues: [],
//   score: 95
// }
```

#### 言語全体のチェック

```javascript
// 言語全体の完成度チェック
const completenessResult = qualityChecker.checkLanguageCompleteness('en');

console.log('完成度:', completenessResult.completeness, '%');
console.log('未翻訳項目:', completenessResult.missing);
console.log('余分な項目:', completenessResult.extra);
```

#### 品質ルールの設定

```javascript
// カスタム品質ルールの追加
const customRule = {
  name: 'CustomLengthRule',
  validate: (key, translation, language, context) => {
    const maxLength = context.maxLength || 100;
    if (translation.length > maxLength) {
      return {
        isValid: false,
        issues: [{
          type: 'length_exceeded',
          message: `翻訳が最大長 ${maxLength} を超えています`,
          severity: 'warning'
        }]
      };
    }
    return { isValid: true, issues: [] };
  }
};

qualityChecker.addRule(customRule);
```

### ValidationRules

組み込まれている検証ルール：

#### 1. ParameterConsistencyRule
パラメータの整合性をチェック

```javascript
// 良い例: パラメータが一致
const baseText = "Hello, {{userName}}!";
const translation = "こんにちは、{{userName}}さん！";
// ✓ パラメータが一致

// 悪い例: パラメータが不一致
const baseText = "Hello, {{userName}}!";
const translation = "こんにちは、{{name}}さん！";
// ✗ パラメータ名が異なる
```

#### 2. LengthValidationRule
翻訳長の妥当性をチェック

```javascript
// UI制限を考慮した長さチェック
const context = {
  uiConstraints: {
    maxLength: 20,        // 最大文字数
    type: 'button'        // UI要素タイプ
  }
};
```

#### 3. FormatValidationRule
フォーマットの正確性をチェック

```javascript
// 特殊フォーマットのチェック
// 日付フォーマット: {{date:createdAt}}
// 数値フォーマット: {{number:score}}
// 通貨フォーマット: {{currency:price}}
```

#### 4. CulturalAppropriatenessRule
文化的適切性をチェック

```javascript
// 文化的に不適切な表現の検出
const culturalChecks = {
  'ja': {
    inappropriate: ['失敗', '死ぬ'],  // ゲームでは避けるべき表現
    preferred: ['リスタート', 'ゲームオーバー']
  }
};
```

## 2. 翻訳進捗管理ツール

### ProgressTracker

翻訳作業の進捗を追跡し、レポートを生成します。

#### 基本使用方法

```javascript
import { ProgressTracker } from './core/i18n/ProgressTracker.js';

const tracker = new ProgressTracker();

// 言語の進捗を追跡
const progress = tracker.trackProgress('en');
console.log('英語翻訳の進捗:', progress);
// {
//   completeness: 85,
//   quality: 90,
//   lastUpdated: Date,
//   issues: [...]
// }
```

#### 詳細な進捗レポート

```javascript
// 全言語の進捗レポート生成
const report = tracker.generateProgressReport();

console.log('全体進捗:', report);
// {
//   languages: {
//     'ja': { completeness: 100, quality: 95 },
//     'en': { completeness: 85, quality: 90 },
//     'zh-CN': { completeness: 60, quality: 80 }
//   },
//   overall: {
//     averageCompleteness: 81.7,
//     averageQuality: 88.3,
//     totalIssues: 12
//   }
// }
```

#### 進捗の可視化

```javascript
// 進捗データをチャート用に整形
const chartData = tracker.getProgressChartData();
// [
//   { language: 'ja', completeness: 100, quality: 95 },
//   { language: 'en', completeness: 85, quality: 90 },
//   ...
// ]
```

### TranslationKeyManager

翻訳キーの管理と使用状況の追跡を行います。

#### 基本機能

```javascript
import { TranslationKeyManager } from './core/i18n/TranslationKeyManager.js';

const keyManager = new TranslationKeyManager();

// 新しい翻訳キーの登録
keyManager.registerKey('game.newFeature.title', {
  category: 'game',
  description: '新機能のタイトル',
  context: 'ゲーム内新機能紹介画面',
  maxLength: 30
});

// キー使用状況の追跡
keyManager.trackUsage('game.newFeature.title');
```

#### 未使用キーの検出

```javascript
// 未使用キーの検出
const unusedKeys = keyManager.findUnusedKeys();
console.log('未使用の翻訳キー:', unusedKeys);

// 使用頻度の分析
const report = keyManager.generateKeyReport();
console.log('キー使用レポート:', report);
// {
//   totalKeys: 1250,
//   usedKeys: 1180,
//   unusedKeys: ['old.feature.title', ...],
//   mostUsed: [
//     { key: 'common.buttons.ok', count: 150 },
//     ...
//   ]
// }
```

#### キーの一括管理

```javascript
// 新しいカテゴリのキーを一括登録
const newGameKeys = {
  'game.powerups.speed.name': '速度アップ',
  'game.powerups.speed.description': '移動速度を2倍にします',
  'game.powerups.shield.name': 'シールド',
  'game.powerups.shield.description': '一時的にダメージを無効化します'
};

keyManager.registerKeysBatch(newGameKeys, {
  category: 'game',
  subcategory: 'powerups'
});
```

## 3. 自動化ツール

### TranslationFileGenerator

新しい言語用の翻訳ファイルを自動生成します。

#### 基本使用方法

```javascript
import { TranslationFileGenerator } from './core/i18n/TranslationFileGenerator.js';

const generator = new TranslationFileGenerator();

// 新言語用ファイル生成
await generator.generateLanguageFiles('fr', {
  baseLanguage: 'en',        // ベース言語
  includeMetadata: true,     // メタデータを含める
  createDirectories: true    // ディレクトリを自動作成
});
```

#### テンプレート生成

```javascript
// 翻訳テンプレートの生成
const template = await generator.generateTranslationTemplate('de', {
  categories: ['common', 'menu', 'game'],
  includeComments: true,     // 翻訳ヒントコメントを含める
  markUntranslated: true     // 未翻訳項目をマーク
});

// 生成されたテンプレート例
// {
//   "common": {
//     "buttons": {
//       "ok": "OK",  // ※翻訳してください: German translation needed
//       "cancel": "[UNTRANSLATED]Cancel"
//     }
//   }
// }
```

#### 段階的ファイル生成

```javascript
// 優先度別にファイルを生成
await generator.generatePriorityFiles('es', {
  priority: 'high',         // 高優先度キーのみ
  categories: ['common', 'menu']
});
```

### ImportExportManager

翻訳データのインポート/エクスポートを管理します。

#### CSV エクスポート机

```javascript
import { ImportExportManager } from './core/i18n/ImportExportManager.js';

const importExport = new ImportExportManager();

// CSV形式でエクスポート
const csvData = await importExport.exportToCSV('en', {
  format: 'standard',       // standard | google-translate | excel
  includeMetadata: true,    // メタデータを含める
  separateByCategory: true  // カテゴリ別に分離
});

// ファイルに保存
await importExport.saveToFile(csvData, 'translations_en.csv');
```

#### Excel エクスポート

```javascript
// Excel形式でエクスポート（複数言語対応）
const excelData = await importExport.exportToExcel(['ja', 'en', 'fr'], {
  includeProgress: true,    // 進捗情報を含める
  includeQuality: true,     // 品質スコアを含める
  groupByCategory: true     // カテゴリごとにワークシート分割
});
```

#### インポート機能

```javascript
// 翻訳済みファイルのインポート
const importResult = await importExport.importFromCSV('translations_fr.csv', {
  language: 'fr',
  validateFormat: true,     // フォーマット検証
  checkQuality: true,       // 品質チェック
  backup: true             // インポート前バックアップ
});

console.log('インポート結果:', importResult);
// {
//   imported: 245,
//   skipped: 12,
//   errors: 3,
//   warnings: ['Parameter mismatch in key: common.welcome']
// }
```

## 4. セキュリティツール

### I18nSecurityManager

翻訳データのセキュリティを管理します。

#### 基本セキュリティチェック

```javascript
import { I18nSecurityManager } from './core/i18n/I18nSecurityManager.js';

const securityManager = new I18nSecurityManager();

// 翻訳データの検証
const isSecure = securityManager.validateTranslationData({
  'welcome': 'こんにちは、{{userName}}さん！',
  'malicious': '<script>alert("XSS")</script>'  // 危険なコンテンツ
});

console.log('セキュリティチェック:', isSecure);
// false - 危険なコンテンツが検出されました
```

#### パラメータサニタイゼーション

```javascript
// ユーザー入力のサニタイゼーション
const unsafeUserName = '<script>alert("hack")</script>';
const safeUserName = securityManager.sanitizeParameter(unsafeUserName);
// '&lt;script&gt;alert("hack")&lt;/script&gt;'

// 安全な翻訳の生成
const safeText = securityManager.generateSecureTranslation(
  'welcome',
  { userName: safeUserName }
);
```

#### CSP（コンテンツセキュリティポリシー）設定

```javascript
// CSPヘッダーの自動設定
securityManager.setupCSPHeaders({
  allowInlineStyles: false,    // インラインスタイルを禁止
  allowInlineScripts: false,   // インラインスクリプトを禁止
  fontSources: ['self', 'fonts.googleapis.com']  // フォントソース制限
});
```

### I18nSecurityTester

セキュリティテストを自動実行します。

#### 脆弱性テスト

```javascript
import { I18nSecurityTester } from './core/i18n/I18nSecurityTester.js';

const securityTester = new I18nSecurityTester();

// XSS脆弱性テスト
const xssResults = await securityTester.testXSSVulnerabilities('en');

// テンプレートインジェクションテスト
const injectionResults = await securityTester.testTemplateInjection('ja');

// 包括的セキュリティ監査
const auditResults = await securityTester.performSecurityAudit(['ja', 'en']);

console.log('セキュリティ監査結果:', auditResults);
```

## ツールの統合使用

### 翻訳ワークフローの自動化

```javascript
// 包括的な翻訳品質チェックワークフロー
async function performTranslationQualityCheck(language) {
  const qualityChecker = new QualityChecker();
  const progressTracker = new ProgressTracker();
  const securityTester = new I18nSecurityTester();
  
  // 1. 進捗追跡
  const progress = progressTracker.trackProgress(language);
  console.log(`${language} 進捗: ${progress.completeness}%`);
  
  // 2. 品質チェック
  const completeness = qualityChecker.checkLanguageCompleteness(language);
  console.log(`品質スコア: ${completeness.quality || 'N/A'}`);
  
  // 3. セキュリティテスト
  const securityResults = await securityTester.testLanguageSecurity(language);
  console.log(`セキュリティ: ${securityResults.passed ? 'OK' : 'NG'}`);
  
  // 4. 包括的レポート生成
  return {
    language,
    progress,
    completeness,
    security: securityResults,
    timestamp: new Date()
  };
}

// 使用例
const report = await performTranslationQualityCheck('en');
```

### CI/CD パイプライン統合

```javascript
// CI/CD用の自動チェックスクリプト
async function runCITranslationChecks() {
  const supportedLanguages = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
  const results = [];
  
  for (const lang of supportedLanguages) {
    const result = await performTranslationQualityCheck(lang);
    results.push(result);
    
    // 品質基準を満たさない場合はビルド失敗
    if (result.completeness.completeness < 90) {
      throw new Error(`${lang}: 翻訳完成度が基準を下回っています`);
    }
    
    if (!result.security.passed) {
      throw new Error(`${lang}: セキュリティテストに失敗しました`);
    }
  }
  
  console.log('全言語の翻訳チェックが完了しました');
  return results;
}
```

## 設定とカスタマイズ

### ツール設定ファイル

`src/locales/config/tools.json` でツールの動作を設定：

```json
{
  "qualityChecker": {
    "rules": {
      "maxLength": true,
      "parameterConsistency": true,
      "culturalAppropriateness": true
    },
    "thresholds": {
      "minQualityScore": 80,
      "maxWarnings": 5
    }
  },
  "progressTracker": {
    "updateInterval": 3600000,
    "reportFormat": "detailed",
    "includeHistory": true
  },
  "security": {
    "strictMode": true,
    "allowedTags": [],
    "allowedAttributes": [],
    "cspEnabled": true
  }
}
```

### カスタムルールの追加

```javascript
// プロジェクト固有の品質ルール
const gameSpecificRule = {
  name: 'GameTerminologyRule',
  validate: (key, translation, language) => {
    const gameTerms = {
      'bubble': 'バブル',    // 「泡」ではなく「バブル」を使用
      'score': 'スコア',     // 「得点」ではなく「スコア」を使用
      'level': 'レベル'      // 「段階」ではなく「レベル」を使用
    };
    
    const issues = [];
    
    // ゲーム用語の一貫性チェック
    for (const [english, japanese] of Object.entries(gameTerms)) {
      if (key.includes(english) && language === 'ja') {
        if (!translation.includes(japanese)) {
          issues.push({
            type: 'terminology_inconsistency',
            message: `「${english}」は「${japanese}」と翻訳してください`,
            severity: 'warning'
          });
        }
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
};
```

## ベストプラクティス

### 1. 定期的な品質チェック

```javascript
// 毎日実行される品質チェック
setInterval(async () => {
  const languages = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
  
  for (const lang of languages) {
    const result = await performTranslationQualityCheck(lang);
    
    if (result.completeness.completeness < 95) {
      // アラート送信
      console.warn(`${lang}: 翻訳完成度が95%を下回りました`);
    }
  }
}, 24 * 60 * 60 * 1000); // 24時間ごと
```

### 2. 翻訳者向けツール

```javascript
// 翻訳者用のヘルパー関数
function getTranslationContext(key) {
  const keyManager = new TranslationKeyManager();
  const context = keyManager.getKeyContext(key);
  
  return {
    description: context.description,
    maxLength: context.maxLength,
    examples: context.examples,
    notes: context.notes
  };
}

// 翻訳進捗の確認
function getMyProgress(translator) {
  const tracker = new ProgressTracker();
  return tracker.getTranslatorProgress(translator);
}
```

### 3. 自動化レポート

```javascript
// 週次レポート生成
async function generateWeeklyReport() {
  const tracker = new ProgressTracker();
  const qualityChecker = new QualityChecker();
  
  const report = {
    week: new Date().toISOString().split('T')[0],
    languages: {},
    summary: {}
  };
  
  const languages = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
  
  for (const lang of languages) {
    const progress = tracker.trackProgress(lang);
    const completeness = qualityChecker.checkLanguageCompleteness(lang);
    
    report.languages[lang] = {
      progress: progress.completeness,
      quality: progress.quality,
      issues: completeness.missing.length,
      lastUpdated: progress.lastUpdated
    };
  }
  
  // 週次サマリー
  const avgProgress = Object.values(report.languages)
    .reduce((sum, lang) => sum + lang.progress, 0) / languages.length;
  
  report.summary = {
    averageProgress: Math.round(avgProgress),
    totalIssues: Object.values(report.languages)
      .reduce((sum, lang) => sum + lang.issues, 0),
    recommendation: avgProgress > 90 ? 'Good' : 'Needs attention'
  };
  
  return report;
}
```

## まとめ

これらのツールを活用することで、翻訳作業の効率化、品質向上、セキュリティ確保を実現できます。定期的な品質チェックと進捗追跡により、高品質な多言語対応システムを維持することができます。

各ツールは独立して使用できますが、組み合わせることでより強力な翻訳管理システムとして機能します。プロジェクトの要件に応じて、適切なツールを選択し、カスタマイズして使用してください。