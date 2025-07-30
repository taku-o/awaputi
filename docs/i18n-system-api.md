# 多言語対応システム API リファレンス

## 概要

BubblePop Web Game の多言語対応システムの包括的な API リファレンスです。このドキュメントでは、LocalizationManager を中心とした全コンポーネントの API 仕様を詳細に説明します。

## 目次

1. [LocalizationManager](#localizationmanager)
2. [TranslationLoader](#translationloader)
3. [OptimizedTranslationLoader](#optimizedtranslationloader)
4. [LanguageDetector](#languagedetector)
5. [TranslationCache](#translationcache)
6. [QualityChecker](#qualitychecker)
7. [ProgressTracker](#progresstracker)
8. [SecurityManager](#securitymanager)
9. [FormatterEngine](#formatterengine)
10. [FontManager](#fontmanager)

---

## LocalizationManager

中央翻訳管理システムのメインクラス。

### コンストラクタ

```javascript
constructor()
```

### プロパティ

| プロパティ | 型 | 説明 |
|-----------|----|----|
| `currentLanguage` | `string` | 現在選択されている言語コード |
| `fallbackLanguage` | `string` | フォールバック言語コード（デフォルト: 'en'） |
| `translations` | `Map<string, Object>` | 読み込み済み翻訳データ |
| `loadedLanguages` | `Set<string>` | 読み込み済み言語のセット |

### メソッド

#### t(key, params, options)

翻訳テキストを取得します。

```javascript
t(key: string, params?: Object, options?: Object): string
```

**パラメータ:**
- `key` (string): 翻訳キー（例: 'menu.start'）
- `params` (Object, optional): 翻訳パラメータ
- `options` (Object, optional): オプション設定

**戻り値:**
- `string`: 翻訳されたテキスト

**例:**
```javascript
// 基本的な使用
const text = lm.t('menu.start'); // "ゲーム開始"

// パラメータ付き
const welcome = lm.t('common.welcome', { userName: 'タロウ' }); 
// "こんにちは、タロウさん！"

// オプション付き
const text = lm.t('menu.start', {}, { language: 'en' }); // "Start Game"
```

#### tMultiple(keys, params, options)

複数の翻訳を一括取得します。

```javascript
tMultiple(keys: string[], params?: Object, options?: Object): Object
```

**例:**
```javascript
const translations = lm.tMultiple(['menu.start', 'menu.settings', 'menu.exit']);
// {
//   'menu.start': 'ゲーム開始',
//   'menu.settings': '設定',
//   'menu.exit': '終了'
// }
```

#### tConditional(condition, trueKey, falseKey, params)

条件に応じて翻訳を選択します。

```javascript
tConditional(condition: boolean, trueKey: string, falseKey: string, params?: Object): string
```

**例:**
```javascript
const statusText = lm.tConditional(isOnline, 'status.online', 'status.offline');
```

#### tPlural(key, count, params)

複数形対応の翻訳を取得します。

```javascript
tPlural(key: string, count: number, params?: Object): string
```

**例:**
```javascript
const itemText = lm.tPlural('items.count', 5, { count: 5 });
// "5個のアイテム"
```

#### setLanguage(languageCode)

言語を変更します。

```javascript
async setLanguage(languageCode: string): Promise<void>
```

**例:**
```javascript
await lm.setLanguage('en');
console.log(lm.getCurrentLanguage()); // "en"
```

#### getCurrentLanguage()

現在の言語コードを取得します。

```javascript
getCurrentLanguage(): string
```

#### getAvailableLanguages()

利用可能な言語の一覧を取得します。

```javascript
getAvailableLanguages(): string[]
```

**戻り値:**
```javascript
['ja', 'en', 'zh-CN', 'zh-TW', 'ko']
```

#### addLanguageChangeListener(listener)

言語変更イベントリスナーを追加します。

```javascript
addLanguageChangeListener(listener: Function): void
```

**例:**
```javascript
lm.addLanguageChangeListener((newLang, oldLang) => {
  console.log(`言語が ${oldLang} から ${newLang} に変更されました`);
});
```

#### getLanguageConfig(languageCode)

言語設定を取得します。

```javascript
getLanguageConfig(languageCode: string): Object
```

**戻り値:**
```javascript
{
  name: "English",
  nativeName: "English",
  code: "en",
  region: "US",
  direction: "ltr",
  pluralRules: "english",
  dateFormat: "MM/DD/YYYY",
  numberFormat: { decimal: ".", thousands: ",", currency: "$" },
  fonts: ["Arial", "Helvetica", "sans-serif"],
  fallbacks: ["ja"]
}
```

---

## TranslationLoader

基本的な翻訳ファイル読み込み機能を提供します。

### コンストラクタ

```javascript
constructor()
```

### メソッド

#### loadLanguage(languageCode)

指定された言語の翻訳ファイルを読み込みます。

```javascript
async loadLanguage(languageCode: string): Promise<Object>
```

**戻り値:**
```javascript
{
  common: { buttons: { ok: "OK", cancel: "Cancel" } },
  menu: { start: "Start Game", settings: "Settings" },
  // ... 他のカテゴリ
}
```

#### preloadLanguages(languageCodes)

複数の言語を事前読み込みします。

```javascript
async preloadLanguages(languageCodes: string[]): Promise<void>
```

---

## OptimizedTranslationLoader

高性能な翻訳ファイル読み込み機能を提供します。

### コンストラクタ

```javascript
constructor(options?: Object)
```

**オプション:**
```javascript
{
  enableLazyLoading: true,      // 遅延読み込み
  enableMemoryOptimization: true, // メモリ最適化
  chunkSize: 1024 * 1024,       // チャンクサイズ
  maxCacheSize: 50 * 1024 * 1024, // 最大キャッシュサイズ
  enableNetworkAdaptation: true   // ネットワーク適応
}
```

### メソッド

#### loadLanguageOptimized(languageCode, options)

最適化された言語読み込み。

```javascript
async loadLanguageOptimized(languageCode: string, options?: Object): Promise<Object>
```

**オプション:**
```javascript
{
  priority: 'high',        // 優先度: 'high' | 'normal' | 'low'
  enableCompression: true, // 圧縮有効化
  timeout: 10000          // タイムアウト（ミリ秒）
}
```

#### getLoadingStatistics()

読み込み統計情報を取得します。

```javascript
getLoadingStatistics(): Object
```

**戻り値:**
```javascript
{
  totalRequests: 25,
  cacheHits: 18,
  cacheMisses: 7,
  averageLoadTime: 120,
  memoryUsage: 1024000,
  compressionRatio: 0.65
}
```

---

## LanguageDetector

言語自動検出機能を提供します。

### コンストラクタ

```javascript
constructor()
```

### メソッド

#### detect()

最適な言語を自動検出します。

```javascript
detect(): string
```

**検出順序:**
1. URL パラメータ（`?lang=en`）
2. ローカルストレージ
3. ブラウザ言語設定
4. デフォルト言語

#### detectFromBrowser()

ブラウザ設定から言語を検出します。

```javascript
detectFromBrowser(): string
```

#### detectFromStorage()

ローカルストレージから言語を検出します。

```javascript
detectFromStorage(): string | null
```

#### isSupported(languageCode)

言語がサポートされているかチェックします。

```javascript
isSupported(languageCode: string): boolean
```

---

## TranslationCache

翻訳データのキャッシュ機能を提供します。

### コンストラクタ

```javascript
constructor(maxSize?: number)
```

**パラメータ:**
- `maxSize` (number, optional): 最大キャッシュサイズ（デフォルト: 1000）

### メソッド

#### get(key)

キャッシュから値を取得します。

```javascript
get(key: string): any | null
```

#### set(key, value)

キャッシュに値を設定します。

```javascript
set(key: string, value: any): void
```

#### clear()

キャッシュをクリアします。

```javascript
clear(): void
```

#### getStatistics()

キャッシュ統計情報を取得します。

```javascript
getStatistics(): Object
```

**戻り値:**
```javascript
{
  size: 150,
  maxSize: 1000,
  hitRate: 0.85,
  missRate: 0.15,
  memoryUsage: 2048000
}
```

---

## QualityChecker

翻訳品質をチェックします。

### コンストラクタ

```javascript
constructor()
```

### メソッド

#### checkTranslation(key, translation, language, context)

単一翻訳の品質をチェックします。

```javascript
checkTranslation(key: string, translation: string, language: string, context?: Object): Object
```

**戻り値:**
```javascript
{
  isValid: true,
  issues: [],
  score: 95,
  suggestions: ["Consider using more natural phrasing"]
}
```

#### checkLanguageCompleteness(language)

言語全体の完成度をチェックします。

```javascript
checkLanguageCompleteness(language: string): Object
```

**戻り値:**
```javascript
{
  completeness: 85,
  missing: ['game.newFeature.title', 'settings.advanced.option'],
  extra: ['old.feature.removed'],
  total: 1250,
  translated: 1062
}
```

#### addRule(rule)

カスタム品質ルールを追加します。

```javascript
addRule(rule: Object): void
```

**ルール形式:**
```javascript
{
  name: 'CustomRule',
  validate: (key, translation, language, context) => ({
    isValid: boolean,
    issues: Array<Object>
  })
}
```

---

## ProgressTracker

翻訳進捗を追跡します。

### コンストラクタ

```javascript
constructor()
```

### メソッド

#### trackProgress(language)

言語の進捗を追跡します。

```javascript
trackProgress(language: string): Object
```

**戻り値:**
```javascript
{
  completeness: 85,
  quality: 90,
  lastUpdated: Date,
  issues: [
    { type: 'missing', key: 'game.feature.new' },
    { type: 'quality', key: 'menu.settings', score: 65 }
  ]
}
```

#### generateProgressReport()

全体の進捗レポートを生成します。

```javascript
generateProgressReport(): Object
```

**戻り値:**
```javascript
{
  languages: {
    'ja': { completeness: 100, quality: 95 },
    'en': { completeness: 85, quality: 90 }
  },
  overall: {
    averageCompleteness: 92.5,
    averageQuality: 92.5,
    totalIssues: 15
  }
}
```

---

## SecurityManager

翻訳データのセキュリティを管理します。

### コンストラクタ

```javascript
constructor()
```

### メソッド

#### validateTranslationData(data)

翻訳データのセキュリティを検証します。

```javascript
validateTranslationData(data: Object): boolean
```

#### sanitizeParameter(parameter)

パラメータをサニタイズします。

```javascript
sanitizeParameter(parameter: string): string
```

**例:**
```javascript
const unsafe = '<script>alert("xss")</script>';
const safe = securityManager.sanitizeParameter(unsafe);
// '&lt;script&gt;alert("xss")&lt;/script&gt;'
```

#### generateSecureTranslation(key, params)

セキュアな翻訳を生成します。

```javascript
generateSecureTranslation(key: string, params: Object): string
```

#### setupCSPHeaders(options)

CSP ヘッダーを設定します。

```javascript
setupCSPHeaders(options: Object): void
```

---

## FormatterEngine

地域化フォーマット機能を提供します。

### コンストラクタ

```javascript
constructor()
```

### メソッド

#### formatNumber(number, language, region)

数値をフォーマットします。

```javascript
formatNumber(number: number, language: string, region?: string): string
```

**例:**
```javascript
const formatted = formatter.formatNumber(1234.56, 'en-US');
// "1,234.56"

const formatted = formatter.formatNumber(1234.56, 'de-DE');
// "1.234,56"
```

#### formatDate(date, language, format)

日付をフォーマットします。

```javascript
formatDate(date: Date, language: string, format?: string): string
```

**例:**
```javascript
const date = new Date('2025-01-28');
const formatted = formatter.formatDate(date, 'ja');
// "2025年01月28日"
```

#### formatCurrency(amount, currency, language)

通貨をフォーマットします。

```javascript
formatCurrency(amount: number, currency: string, language: string): string
```

**例:**
```javascript
const formatted = formatter.formatCurrency(1234.56, 'USD', 'en-US');
// "$1,234.56"
```

#### formatRelativeTime(date, language)

相対時間をフォーマットします。

```javascript
formatRelativeTime(date: Date, language: string): string
```

**例:**
```javascript
const pastDate = new Date(Date.now() - 3600000); // 1時間前
const formatted = formatter.formatRelativeTime(pastDate, 'ja');
// "1時間前"
```

---

## FontManager

フォント管理機能を提供します。

### コンストラクタ

```javascript
constructor()
```

### メソッド

#### loadLanguageFont(language)

言語固有のフォントを読み込みます。

```javascript
async loadLanguageFont(language: string): Promise<void>
```

#### getFontFamily(language)

言語のフォントファミリーを取得します。

```javascript
getFontFamily(language: string): string[]
```

**戻り値:**
```javascript
// 日本語の場合
['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif']
```

#### isFontLoaded(fontFamily)

フォントが読み込み済みかチェックします。

```javascript
isFontLoaded(fontFamily: string): boolean
```

#### preloadFonts(languages)

複数言語のフォントを事前読み込みします。

```javascript
async preloadFonts(languages: string[]): Promise<void>
```

---

## イベントシステム

### 言語変更イベント

```javascript
// イベントリスナーの追加
lm.addLanguageChangeListener((newLanguage, oldLanguage) => {
  console.log(`言語変更: ${oldLanguage} → ${newLanguage}`);
});

// イベントリスナーの削除
lm.removeLanguageChangeListener(listener);
```

### 翻訳読み込みイベント

```javascript
// 翻訳読み込み開始
lm.addEventListener('loadingStart', (event) => {
  console.log(`翻訳読み込み開始: ${event.language}`);
});

// 翻訳読み込み完了
lm.addEventListener('loadingComplete', (event) => {
  console.log(`翻訳読み込み完了: ${event.language}`);
});

// 翻訳読み込みエラー
lm.addEventListener('loadingError', (event) => {
  console.error(`翻訳読み込みエラー: ${event.error}`);
});
```

---

## エラーハンドリング

### エラータイプ

| エラーコード | 説明 |
|------------|-----|
| `TRANSLATION_NOT_FOUND` | 翻訳キーが見つからない |
| `LANGUAGE_NOT_SUPPORTED` | サポートされていない言語 |
| `LOADING_FAILED` | 翻訳ファイルの読み込み失敗 |
| `FORMATTING_ERROR` | フォーマット処理エラー |
| `VALIDATION_ERROR` | 翻訳データの検証エラー |
| `SECURITY_ERROR` | セキュリティ検証エラー |

### エラーキャッチの例

```javascript
try {
  await lm.setLanguage('invalid-lang');
} catch (error) {
  if (error.code === 'LANGUAGE_NOT_SUPPORTED') {
    console.warn('サポートされていない言語です');
    // フォールバック処理
    await lm.setLanguage('en');
  }
}
```

---

## パフォーマンス最適化

### メモリ使用量の監視

```javascript
// メモリ使用量の取得
const memoryUsage = lm.getMemoryUsage();
console.log('メモリ使用量:', memoryUsage);
// {
//   translations: 2048000,
//   cache: 1024000,
//   total: 3072000
// }
```

### パフォーマンス統計

```javascript
// パフォーマンス統計の取得
const stats = lm.performanceMonitor.getStatistics();
console.log('パフォーマンス統計:', stats);
// {
//   averageTranslationTime: 2.5,
//   cacheHitRate: 0.85,
//   memoryEfficiency: 0.92,
//   loadingPerformance: {
//     average: 150,
//     min: 50,
//     max: 300
//   }
// }
```

---

## 設定とカウタマイゼーション

### グローバル設定

```javascript
// LocalizationManagerの設定
const config = {
  enableCache: true,
  cacheSize: 2000,
  enableOptimization: true,
  enableSecurity: true,
  fallbackLanguage: 'en',
  enablePerformanceMonitoring: true
};

const lm = new LocalizationManager(config);
```

### 言語別設定のオーバーライド

```javascript
// 特定言語の設定をオーバーライド
lm.setLanguageConfig('ja', {
  dateFormat: 'YYYY年MM月DD日(ddd)',
  numberFormat: {
    decimal: '.',
    thousands: ',',
    currency: '￥'
  }
});
```

---

このAPIリファレンスは、BubblePop Web Game の多言語対応システムの完全な機能セットを網羅しています。各APIの詳細な使用方法については、対応する開発者ガイドやサンプルコードを参照してください。