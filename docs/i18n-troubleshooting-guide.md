# 多言語対応システム トラブルシューティングガイド

## 概要

BubblePop Web Game の多言語対応システムで発生する可能性のある問題と、その解決方法を包括的にまとめたガイドです。開発者、翻訳者、QAエンジニア向けの実践的なトラブルシューティングリソースです。

## 目次

1. [一般的な問題](#一般的な問題)
2. [翻訳表示の問題](#翻訳表示の問題)
3. [言語切り替えの問題](#言語切り替えの問題)
4. [パフォーマンスの問題](#パフォーマンスの問題)
5. [セキュリティの問題](#セキュリティの問題)
6. [フォントと文字化けの問題](#フォントと文字化けの問題)
7. [レイアウトの問題](#レイアウトの問題)
8. [開発環境の問題](#開発環境の問題)
9. [デバッグツールの使用方法](#デバッグツールの使用方法)

---

## 一般的な問題

### 問題1: LocalizationManager が初期化されない

**症状:**
```javascript
Uncaught ReferenceError: LocalizationManager is not defined
```

**原因:**
- モジュールのインポートが正しくない
- ファイルパスが間違っている
- ES6モジュールの設定問題

**解決方法:**

1. **インポート文の確認**
```javascript
// 正しい例
import { LocalizationManager } from './core/LocalizationManager.js';

// 間違った例
import { LocalizationManager } from './core/LocalizationManager'; // .js拡張子がない
```

2. **相対パスの確認**
```javascript
// ファイル構造を確認
// src/scenes/MainMenuScene.js から core/LocalizationManager.js を参照する場合
import { LocalizationManager } from '../core/LocalizationManager.js';
```

3. **HTML設定の確認**
```html
<!-- script タグに type="module" が必要 -->
<script type="module" src="src/core/GameEngine.js"></script>
```

### 問題2: 翻訳ファイルが見つからない

**症状:**
```
Failed to load translation file: 404 Not Found
```

**原因:**
- ファイルパスが間違っている
- ファイルが存在しない
- サーバー設定の問題

**解決方法:**

1. **ファイル存在確認**
```bash
# ファイル構造を確認
ls -la src/locales/en/
# 必要なファイルが存在するか確認:
# common.json, menu.json, game.json, settings.json, errors.json, achievements.json, help.json
```

2. **パスの確認**
```javascript
// TranslationLoader.js でのパス確認
const response = await fetch(`/src/locales/${language}/${file}.json`);
```

3. **サーバー設定の確認**
```javascript
// ローカルサーバーの起動確認
// python -m http.server 8000
// または
// npx serve .
```

### 問題3: JSON構文エラー

**症状:**
```
SyntaxError: Unexpected token in JSON at position 123
```

**原因:**
- JSON構文が不正
- BOM（Byte Order Mark）の存在
- 文字エンコーディングの問題

**解決方法:**

1. **JSON構文の検証**
```bash
# JSON構文チェック
cat src/locales/en/common.json | jq .
```

2. **オンラインJSON検証ツールの使用**
   - [JSONLint](https://jsonlint.com/)
   - [JSON Formatter](https://jsonformatter.curiousconcept.com/)

3. **よくある構文エラー**
```json
// 悪い例: 最後にカンマがある
{
  "button": "OK",
  "cancel": "Cancel", // ← この余計なカンマが原因
}

// 良い例:
{
  "button": "OK",
  "cancel": "Cancel"
}
```

---

## 翻訳表示の問題

### 問題1: 翻訳キーがそのまま表示される

**症状:**
UI に "menu.start" のような翻訳キーがそのまま表示される

**原因:**
- 翻訳データが読み込まれていない
- 翻訳キーが存在しない
- 言語切り替えが完了していない

**解決方法:**

1. **翻訳データの確認**
```javascript
// デバッグコンソールで確認
console.log('現在の言語:', localizationManager.getCurrentLanguage());
console.log('読み込み済み言語:', localizationManager.getLoadedLanguages());
console.log('翻訳データ:', localizationManager.getTranslations('en'));
```

2. **翻訳キーの存在確認**
```javascript
// 特定のキーが存在するかチェック
const translation = localizationManager.getTranslation('menu.start', {}, 'en');
if (translation === 'menu.start') {
  console.error('翻訳キーが見つかりません: menu.start');
}
```

3. **フォールバック動作の確認**
```javascript
// フォールバック言語の確認
console.log('フォールバック言語:', localizationManager.fallbackLanguage);

// フォールバック処理のテスト
const result = localizationManager.t('nonexistent.key');
console.log('フォールバック結果:', result);
```

### 問題2: パラメータが置換されない

**症状:**
"Hello, {{userName}}!" のようにパラメータがそのまま表示される

**原因:**
- パラメータ名の不一致
- パラメータオブジェクトが渡されていない
- フォーマット処理のエラー

**解決方法:**

1. **パラメータ名の確認**
```javascript
// 翻訳ファイルでのパラメータ名
"welcome": "こんにちは、{{userName}}さん！"

// 呼び出し時のパラメータ名
const text = lm.t('welcome', { userName: 'タロウ' }); // 正しい
const text = lm.t('welcome', { name: 'タロウ' });     // 間違い: パラメータ名が不一致
```

2. **パラメータオブジェクトの確認**
```javascript
// パラメータが正しく渡されているかチェック
function debugParameterReplacement(key, params) {
  console.log('翻訳キー:', key);
  console.log('パラメータ:', params);
  
  const rawTranslation = lm.getRawTranslation(key);
  console.log('生翻訳:', rawTranslation);
  
  const result = lm.t(key, params);
  console.log('処理結果:', result);
}

debugParameterReplacement('welcome', { userName: 'テスト' });
```

3. **パラメータ形式の統一**
```javascript
// 正しいパラメータ形式の例
const validParams = {
  userName: 'タロウ',
  score: 1000,
  level: 5
};

// 避けるべき形式
const invalidParams = {
  'user-name': 'タロウ',  // ハイフンは避ける
  'user name': 'タロウ',  // スペースは避ける
  123: 'value'           // 数値キーは避ける
};
```

### 問題3: 翻訳内容が古い

**症状:**
翻訳ファイルを更新したが、古い翻訳が表示され続ける

**原因:**
- ブラウザキャッシュ
- 翻訳キャッシュ
- ファイルの更新が反映されていない

**解決方法:**

1. **ブラウザキャッシュのクリア**
```javascript
// ハードリロード: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

// プログラムでキャッシュクリア
if ('caches' in window) {
  caches.names().then(names => {
    names.forEach(name => caches.delete(name));
  });
}
```

2. **翻訳キャッシュのクリア**
```javascript
// LocalizationManager のキャッシュクリア
localizationManager.clearCache();

// 特定言語のキャッシュクリア
localizationManager.clearLanguageCache('en');

// 翻訳データの再読み込み
await localizationManager.reloadLanguage('en');
```

3. **ファイル更新の確認**
```bash
# ファイルの更新日時確認
ls -la src/locales/en/common.json

# ファイル内容の確認
cat src/locales/en/common.json | grep -A 5 -B 5 "問題のキー"
```

---

## 言語切り替えの問題

### 問題1: 言語切り替えが動作しない

**症状:**
`setLanguage()` を呼んでも言語が変わらない

**原因:**
- 非同期処理の問題
- エラーが発生している
- イベントリスナーが設定されていない

**解決方法:**

1. **非同期処理の確認**
```javascript
// 間違った例: awaitなし
localizationManager.setLanguage('en');
console.log(localizationManager.getCurrentLanguage()); // まだ古い言語

// 正しい例: awaitあり
await localizationManager.setLanguage('en');
console.log(localizationManager.getCurrentLanguage()); // 新しい言語
```

2. **エラーハンドリングの追加**
```javascript
try {
  await localizationManager.setLanguage('en');
  console.log('言語切り替え成功');
} catch (error) {
  console.error('言語切り替えエラー:', error);
  
  // エラーの種類に応じた処理
  if (error.code === 'LANGUAGE_NOT_SUPPORTED') {
    console.warn('サポートされていない言語です');
    // フォールバック処理
    await localizationManager.setLanguage('ja');
  }
}
```

3. **イベントリスナーの設定**
```javascript
// 言語変更イベントリスナーの追加
localizationManager.addLanguageChangeListener((newLang, oldLang) => {
  console.log(`言語変更: ${oldLang} → ${newLang}`);
  
  // UI更新処理
  updateAllUIElements();
});

// イベントリスナーが正しく設定されているか確認
console.log('言語変更リスナー数:', localizationManager.languageChangeListeners.size);
```

### 問題2: 一部のUI要素だけ言語が変わらない

**症状:**
言語切り替え後、一部のUI要素が古い言語のまま残る

**原因:**
- UI更新処理の漏れ
- 静的テキストの使用
- イベント伝播の問題

**解決方法:**

1. **UI更新処理の網羅的実装**
```javascript
// 全UI要素を更新する関数
function updateAllUIElements() {
  // 全シーンの更新
  if (gameEngine.sceneManager) {
    gameEngine.sceneManager.refreshAllScenes();
  }
  
  // 動的要素の更新
  updateDynamicElements();
  
  // メニューラベルの更新
  updateMenuLabels();
  
  // ボタンテキストの更新
  updateButtonTexts();
}

// 言語変更時に自動実行
localizationManager.addLanguageChangeListener(() => {
  updateAllUIElements();
});
```

2. **静的テキストの動的化**
```javascript
// 悪い例: 静的テキスト
button.textContent = "Start Game";

// 良い例: 動的テキスト
function updateButtonText() {
  button.textContent = localizationManager.t('menu.start');
}

// 言語変更時に更新されるように
localizationManager.addLanguageChangeListener(updateButtonText);
```

3. **UI要素の追跡**
```javascript
// UI要素を追跡するシステム
class UIElementTracker {
  constructor() {
    this.elements = new Map();
  }
  
  register(element, translationKey, params = {}) {
    this.elements.set(element, { key: translationKey, params });
  }
  
  updateAll() {
    this.elements.forEach((data, element) => {
      element.textContent = localizationManager.t(data.key, data.params);
    });
  }
}

const uiTracker = new UIElementTracker();

// 使用例
uiTracker.register(startButton, 'menu.start');
uiTracker.register(scoreLabel, 'game.ui.score');

// 言語変更時に一括更新
localizationManager.addLanguageChangeListener(() => {
  uiTracker.updateAll();
});
```

---

## パフォーマンスの問題

### 問題1: 言語切り替えが遅い

**症状:**
言語切り替えに3秒以上かかる

**原因:**
- 翻訳ファイルが大きすぎる
- ネットワークが遅い
- 最適化されていない読み込み処理

**解決方法:**

1. **OptimizedTranslationLoader の使用**
```javascript
// 最適化されたローダーを使用
const optimizedLoader = new OptimizedTranslationLoader({
  enableLazyLoading: true,
  enableMemoryOptimization: true,
  chunkSize: 1024 * 1024,
  maxCacheSize: 50 * 1024 * 1024
});

localizationManager.translationLoader = optimizedLoader;
```

2. **プリロードの活用**
```javascript
// 頻繁に使用される言語を事前読み込み
await localizationManager.preloadLanguages(['ja', 'en']);

// 使用統計に基づくプリロード
const popularLanguages = analyticsManager.getPopularLanguages();
await localizationManager.preloadLanguages(popularLanguages);
```

3. **翻訳ファイルの分割**
```javascript
// 大きなファイルを分割
// 悪い例: すべてを1つのファイルに
// common.json (500KB)

// 良い例: カテゴリ別に分割
// common-buttons.json (50KB)
// common-messages.json (30KB)
// common-forms.json (40KB)
```

### 問題2: メモリ使用量が多い

**症状:**
翻訳データで100MB以上のメモリを使用している

**原因:**
- 不要な翻訳データがメモリに残っている
- キャッシュサイズが大きすぎる
- メモリリークが発生している

**解決方法:**

1. **メモリ使用量の監視**
```javascript
// メモリ使用量の定期監視
setInterval(() => {
  const memoryUsage = localizationManager.getMemoryUsage();
  console.log('翻訳システムメモリ使用量:', memoryUsage);
  
  if (memoryUsage.total > 50 * 1024 * 1024) { // 50MB
    console.warn('メモリ使用量が多すぎます');
    // メモリクリーンアップ
    localizationManager.cleanupMemory();
  }
}, 60000); // 1分ごと
```

2. **不要なデータのクリーンアップ**
```javascript
// 使用されていない言語データの削除
const unusedLanguages = localizationManager.getUnusedLanguages();
unusedLanguages.forEach(lang => {
  localizationManager.unloadLanguage(lang);
});

// 古いキャッシュデータの削除
localizationManager.cleanupOldCache();
```

3. **キャッシュサイズの調整**
```javascript
// キャッシュサイズを調整
localizationManager.setCacheConfig({
  maxSize: 1000,           // キャッシュエントリ数を制限
  maxMemory: 10 * 1024 * 1024, // 10MBに制限
  ttl: 30 * 60 * 1000      // 30分でキャッシュ無効化
});
```

---

## セキュリティの問題

### 問題1: XSS攻撃の可能性

**症状:**
コンソールにセキュリティ警告が表示される

**原因:**
- 翻訳データに HTML タグが含まれている
- ユーザー入力がサニタイズされていない
- CSP 設定が不適切

**解決方法:**

1. **翻訳データの検証**
```javascript
// セキュリティチェックの実行
const securityManager = localizationManager.securityManager;
const isSecure = securityManager.validateTranslationData(translationData);

if (!isSecure) {
  console.error('セキュリティ問題が検出されました');
  
  // 問題のある翻訳を特定
  const issues = securityManager.getSecurityIssues(translationData);
  issues.forEach(issue => {
    console.error(`セキュリティ問題: ${issue.key} - ${issue.message}`);
  });
}
```

2. **パラメータのサニタイゼーション**
```javascript
// ユーザー入力のサニタイズ
function safeTranslate(key, params = {}) {
  const sanitizedParams = {};
  
  Object.entries(params).forEach(([key, value]) => {
    sanitizedParams[key] = securityManager.sanitizeParameter(String(value));
  });
  
  return localizationManager.t(key, sanitizedParams);
}

// 使用例
const userInput = '<script>alert("XSS")</script>';
const safeText = safeTranslate('welcome', { userName: userInput });
// 結果: "こんにちは、&lt;script&gt;alert("XSS")&lt;/script&gt;さん！"
```

3. **CSP設定の強化**
```javascript
// セキュアなCSPヘッダーの設定
securityManager.setupCSPHeaders({
  allowInlineStyles: false,
  allowInlineScripts: false,
  fontSources: ['self', 'fonts.googleapis.com'],
  scriptSources: ['self'],
  styleSources: ['self', 'fonts.googleapis.com']
});
```

### 問題2: 翻訳データの改ざん

**症状:**
翻訳内容が予期しない内容に変更されている

**原因:**
- 翻訳ファイルの整合性チェックがない
- 不正な翻訳データの注入
- ファイルの権限設定問題

**解決方法:**

1. **整合性チェックの実装**
```javascript
// 翻訳ファイルのハッシュ値をチェック
const expectedHashes = {
  'en/common.json': 'sha256:abc123...',
  'ja/common.json': 'sha256:def456...'
};

async function verifyTranslationIntegrity(language, category) {
  const filePath = `${language}/${category}.json`;
  const content = await fetch(`/src/locales/${filePath}`).then(r => r.text());
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  const hashHex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  
  const expected = expectedHashes[filePath];
  if (expected && !expected.endsWith(hashHex)) {
    throw new Error(`翻訳ファイルの整合性チェックに失敗: ${filePath}`);
  }
}
```

2. **翻訳データの検証**
```javascript
// 翻訳データの構造チェック
function validateTranslationStructure(data, language) {
  const requiredFields = ['meta', 'translations'];
  const requiredMeta = ['language', 'version', 'lastUpdated'];
  
  // 必須フィールドの確認
  requiredFields.forEach(field => {
    if (!data[field]) {
      throw new Error(`必須フィールドが不足: ${field}`);
    }
  });
  
  // メタデータの確認
  requiredMeta.forEach(field => {
    if (!data.meta[field]) {
      throw new Error(`必須メタデータが不足: ${field}`);
    }
  });
  
  // 言語コードの確認
  if (data.meta.language !== language) {
    throw new Error(`言語コードが不一致: 期待値=${language}, 実際値=${data.meta.language}`);
  }
}
```

---

## フォントと文字化けの問題

### 問題1: 特定の文字が表示されない

**症状:**
日本語の一部の文字や、中国語・韓国語の文字が □ や ? で表示される

**原因:**
- フォントに該当する文字が含まれていない
- フォントの読み込みが完了していない
- フォントフォールバックが機能していない

**解決方法:**

1. **フォントの確認**
```javascript
// 現在使用されているフォントの確認
function getCurrentFont(element) {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.fontFamily;
}

// フォントサポートの確認
function checkFontSupport(character, fontFamily) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  ctx.font = `16px ${fontFamily}`;
  const width1 = ctx.measureText(character).width;
  
  ctx.font = '16px monospace';
  const width2 = ctx.measureText(character).width;
  
  return width1 !== width2;
}

// 使用例
console.log('「漢」のフォントサポート:', checkFontSupport('漢', 'Noto Sans JP'));
```

2. **フォントの事前読み込み**
```javascript
// Font Loading API を使用
async function preloadFont(fontFamily, fontUrl) {
  if (!document.fonts) {
    console.warn('Font Loading API is not supported');
    return;
  }
  
  const font = new FontFace(fontFamily, `url(${fontUrl})`);
  
  try {
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
    console.log(`フォント読み込み完了: ${fontFamily}`);
  } catch (error) {
    console.error(`フォント読み込み失敗: ${fontFamily}`, error);
  }
}

// 言語固有フォントの事前読み込み
await preloadFont('Noto Sans JP', 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP');
```

3. **フォントフォールバックの設定**
```css
/* CSS でのフォントフォールバック */
.japanese-text {
  font-family: 
    'Noto Sans JP',           /* 優先フォント */
    'Hiragino Sans',          /* macOS用 */
    'Yu Gothic',              /* Windows用 */
    'Meiryo',                 /* Windows用フォールバック */
    'MS Gothic',              /* 最終フォールバック */
    sans-serif;               /* システムフォント */
}

.chinese-text {
  font-family:
    'Noto Sans SC',           /* 簡体字中国語 */
    'Source Han Sans SC',     /* Adobe フォント */
    'PingFang SC',            /* macOS用 */
    'Microsoft YaHei',        /* Windows用 */
    sans-serif;
}
```

### 問題2: フォント読み込みが遅い

**症状:**
ページ読み込み時に一瞬英数字フォントで表示され、その後正しいフォントに変わる（FOIT/FOUT）

**原因:**
- フォントファイルが大きい
- フォントの事前読み込みがされていない
- font-display 設定が適切でない

**解決方法:**

1. **font-display の設定**
```css
@font-face {
  font-family: 'Noto Sans JP';
  src: url('fonts/NotoSansJP-Regular.woff2') format('woff2');
  font-display: swap; /* フォント読み込み中も文字を表示 */
}

/* または */
@font-face {
  font-family: 'Noto Sans JP';
  src: url('fonts/NotoSansJP-Regular.woff2') format('woff2');
  font-display: fallback; /* 短時間フォールバック後に置換 */
}
```

2. **フォントプリロード**
```html
<!-- HTML head でフォントをプリロード -->
<link rel="preload" href="fonts/NotoSansJP-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

3. **フォント読み込み状態の管理**
```javascript
// フォント読み込み状態の監視
document.fonts.ready.then(() => {
  console.log('全フォントの読み込み完了');
  
  // フォント読み込み完了後にUI更新
  updateUIWithFonts();
});

// 特定フォントの読み込み監視
document.fonts.load('16px Noto Sans JP').then(() => {
  console.log('Noto Sans JP の読み込み完了');
});
```

---

## レイアウトの問題

### 問題1: 翻訳後にレイアウトが崩れる

**症状:**
英語から日本語に切り替えると、ボタンやテキストエリアからテキストがはみ出る

**原因:**
- 翻訳テキストが長すぎる
- CSS の固定サイズ設定
- レスポンシブ対応の不備

**解決方法:**

1. **翻訳長の事前チェック**
```javascript
// 翻訳長チェック関数
function checkTranslationLength(key, language, maxLength) {
  const translation = localizationManager.t(key, {}, { language });
  
  if (translation.length > maxLength) {
    console.warn(`翻訳が長すぎます: ${key} (${language})`);
    console.warn(`長さ: ${translation.length}/${maxLength}`);
    console.warn(`内容: ${translation}`);
    
    return false;
  }
  
  return true;
}

// UI制約の定義
const uiConstraints = {
  'menu.start': { maxLength: 12, element: 'button' },
  'game.ui.score': { maxLength: 8, element: 'label' },
  'settings.title': { maxLength: 20, element: 'heading' }
};

// 全翻訳の長さチェック
Object.entries(uiConstraints).forEach(([key, constraint]) => {
  ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'].forEach(language => {
    checkTranslationLength(key, language, constraint.maxLength);
  });
});
```

2. **動的サイズ調整**
```css
/* 固定サイズではなく、柔軟なサイズ設定 */
.menu-button {
  /* 悪い例: 固定サイズ */
  /* width: 120px; */
  
  /* 良い例: 最小・最大サイズを設定 */
  min-width: 100px;
  max-width: 200px;
  width: fit-content;
  padding: 8px 16px;
  
  /* テキストオーバーフローの処理 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* レスポンシブ対応 */
@media (max-width: 480px) {
  .menu-button {
    max-width: 150px;
    font-size: 14px;
  }
}
```

3. **文字サイズの自動調整**
```javascript
// 文字サイズ自動調整関数
function adjustFontSize(element, text, maxWidth) {
  element.textContent = text;
  
  let fontSize = 16; // 初期フォントサイズ
  element.style.fontSize = fontSize + 'px';
  
  // テキストが収まるまでフォントサイズを調整
  while (element.scrollWidth > maxWidth && fontSize > 10) {
    fontSize--;
    element.style.fontSize = fontSize + 'px';
  }
  
  if (fontSize === 10) {
    console.warn('フォントサイズが最小値に達しました:', text);
  }
}

// 使用例
const button = document.querySelector('.menu-button');
const buttonText = localizationManager.t('menu.start');
adjustFontSize(button, buttonText, 120);
```

### 問題2: RTL言語での表示問題

**症状:**
アラビア語やヘブライ語で、テキストや UI要素の配置が正しくない

**原因:**
- RTL（右から左）言語への対応不足
- CSS の direction プロパティ未設定
- UI要素の配置がLTR前提

**解決方法:**

1. **RTL言語の検出と設定**
```javascript
// RTL言語の検出
function isRTLLanguage(language) {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
}

// RTL設定の適用
function applyRTLSettings(language) {
  const isRTL = isRTLLanguage(language);
  
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  
  // CSS クラスの追加
  document.body.classList.toggle('rtl', isRTL);
  document.body.classList.toggle('ltr', !isRTL);
}

// 言語変更時に自動適用
localizationManager.addLanguageChangeListener((newLanguage) => {
  applyRTLSettings(newLanguage);
});
```

2. **RTL対応CSS**
```css
/* RTL/LTR 両対応のCSS */
.menu-item {
  margin-inline-start: 16px;  /* margin-left の代わり */
  margin-inline-end: 8px;     /* margin-right の代わり */
  padding-inline: 12px;       /* 左右パディングを一括指定 */
}

/* RTL固有のスタイル */
.rtl .arrow-icon {
  transform: scaleX(-1);      /* 矢印を反転 */
}

.rtl .text-align-start {
  text-align: right;          /* RTLでは右寄せ */
}

.ltr .text-align-start {
  text-align: left;           /* LTRでは左寄せ */
}

/* 論理プロパティの使用 */
.card {
  border-inline-start: 2px solid #007bff;  /* 読み始め側にボーダー */
  padding-block: 16px;                      /* 上下パディング */
  padding-inline: 20px;                     /* 左右パディング */
}
```

---

## 開発環境の問題

### 問題1: 開発サーバーで翻訳ファイルが読み込めない

**症状:**
ローカル開発サーバーで 404 エラーが発生する

**原因:**
- CORS 設定の問題
- サーバーの設定問題
- ファイルパスの問題

**解決方法:**

1. **適切な開発サーバーの使用**
```bash
# Python の場合
python -m http.server 8000

# Node.js の場合
npx serve . -p 8000

# または
npx http-server -p 8000 -c-1
```

2. **CORS 問題の解決**
```bash
# CORS を許可する開発サーバー
npx http-server -p 8000 --cors
```

3. **相対パスの確認**
```javascript
// 開発環境での相対パス確認
console.log('現在のURL:', window.location.href);
console.log('ベースURL:', window.location.origin);

// 翻訳ファイルURLの構築
function buildTranslationURL(language, category) {
  const baseURL = window.location.origin;
  return `${baseURL}/src/locales/${language}/${category}.json`;
}
```

### 問題2: ビルド後に翻訳が読み込めない

**症状:**
開発環境では正常だが、ビルド後に翻訳ファイルが見つからない

**原因:**
- ビルド設定で翻訳ファイルが除外されている
- パスの変更
- アセット処理の問題

**解決方法:**

1. **ビルド設定の確認**
```javascript
// webpack.config.js の例
module.exports = {
  // ... 他の設定
  
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/locales', to: 'locales' }
      ]
    })
  ]
};
```

2. **動的パス解決**
```javascript
// 環境に応じたパス解決
function getTranslationPath(language, category) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return `/src/locales/${language}/${category}.json`;
  } else {
    return `/locales/${language}/${category}.json`;
  }
}
```

---

## デバッグツールの使用方法

### LocalizationManager デバッグ

```javascript
// 包括的なデバッグ情報を取得
function debugLocalizationManager() {
  const lm = localizationManager;
  
  console.group('LocalizationManager Debug Info');
  
  // 基本情報
  console.log('現在の言語:', lm.getCurrentLanguage());
  console.log('フォールバック言語:', lm.fallbackLanguage);
  console.log('読み込み済み言語:', Array.from(lm.loadedLanguages));
  console.log('利用可能言語:', lm.getAvailableLanguages());
  
  // キャッシュ情報
  const cacheStats = lm.getCacheStatistics();
  console.log('キャッシュ統計:', cacheStats);
  
  // パフォーマンス情報
  const perfStats = lm.performanceMonitor?.getStatistics();
  if (perfStats) {
    console.log('パフォーマンス統計:', perfStats);
  }
  
  // メモリ使用量
  const memoryUsage = lm.getMemoryUsage();
  console.log('メモリ使用量:', memoryUsage);
  
  console.groupEnd();
}

// 使用例
debugLocalizationManager();
```

### 翻訳テストツール

```javascript
// 翻訳内容の一括テスト
function testAllTranslations(language) {
  const translations = localizationManager.getAllTranslations(language);
  const issues = [];
  
  function testTranslationObject(obj, keyPrefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        testTranslationObject(value, fullKey);
      } else if (typeof value === 'string') {
        // パラメータ構文のテスト
        const paramRegex = /\{\{(\w+)\}\}/g;
        const matches = value.match(paramRegex);
        
        if (matches) {
          console.log(`${fullKey}: パラメータ付き翻訳 - ${matches.join(', ')}`);
        }
        
        // 長さテスト
        if (value.length > 100) {
          issues.push({
            key: fullKey,
            issue: 'long_text',
            length: value.length,
            text: value.substring(0, 50) + '...'
          });
        }
        
        // 空文字テスト
        if (value.trim() === '') {
          issues.push({
            key: fullKey,
            issue: 'empty_text'
          });
        }
      }
    });
  }
  
  testTranslationObject(translations);
  
  if (issues.length > 0) {
    console.warn(`${language} の翻訳に問題があります:`, issues);
  } else {
    console.log(`${language} の翻訳テスト完了: 問題なし`);
  }
  
  return issues;
}

// 使用例
testAllTranslations('ja');
testAllTranslations('en');
```

### パフォーマンス監視ツール

```javascript
// パフォーマンス監視の開始
function startPerformanceMonitoring() {
  const monitor = localizationManager.performanceMonitor;
  
  // 定期的なパフォーマンスレポート
  setInterval(() => {
    const stats = monitor.getStatistics();
    
    console.group('翻訳システム パフォーマンスレポート');
    console.log('平均翻訳時間:', stats.averageTranslationTime, 'ms');
    console.log('キャッシュヒット率:', (stats.cacheHitRate * 100).toFixed(1), '%');
    console.log('メモリ効率:', (stats.memoryEfficiency * 100).toFixed(1), '%');
    console.log('読み込みパフォーマンス:', stats.loadingPerformance);
    console.groupEnd();
    
    // 警告しきい値のチェック
    if (stats.averageTranslationTime > 5) {
      console.warn('翻訳処理が遅くなっています');
    }
    
    if (stats.cacheHitRate < 0.8) {
      console.warn('キャッシュヒット率が低下しています');
    }
    
  }, 60000); // 1分ごと
}

// 監視開始
startPerformanceMonitoring();
```

## 緊急時の対応

### 翻訳システム全体のリセット

```javascript
// 緊急時のシステムリセット
async function emergencyReset() {
  console.warn('緊急リセットを実行します...');
  
  try {
    // キャッシュクリア
    localizationManager.clearCache();
    
    // 全翻訳データクリア
    localizationManager.clearAllTranslations();
    
    // デフォルト言語に戻す
    await localizationManager.setLanguage('ja');
    
    // 基本翻訳データの再読み込み
    await localizationManager.loadLanguage('ja');
    await localizationManager.loadLanguage('en');
    
    console.log('緊急リセット完了');
    
  } catch (error) {
    console.error('緊急リセット失敗:', error);
    
    // 最終手段: ページリロード
    if (confirm('システムリセットに失敗しました。ページを再読み込みしますか？')) {
      window.location.reload();
    }
  }
}

// デバッグ用グローバル関数として設定
window.emergencyReset = emergencyReset;
```

### フォールバック翻訳システム

```javascript
// 緊急時のフォールバック翻訳
const emergencyTranslations = {
  'ja': {
    'menu.start': 'ゲーム開始',
    'menu.settings': '設定',
    'common.buttons.ok': 'OK',
    'common.buttons.cancel': 'キャンセル',
    'errors.general': 'エラーが発生しました'
  },
  'en': {
    'menu.start': 'Start Game',
    'menu.settings': 'Settings', 
    'common.buttons.ok': 'OK',
    'common.buttons.cancel': 'Cancel',
    'errors.general': 'An error occurred'
  }
};

// フォールバック翻訳の適用
function applyEmergencyTranslations() {
  const currentLang = localizationManager.getCurrentLanguage();
  const fallbackData = emergencyTranslations[currentLang] || emergencyTranslations['en'];
  
  localizationManager.setEmergencyTranslations(fallbackData);
  console.log('緊急フォールバック翻訳を適用しました');
}
```

このトラブルシューティングガイドを参考に、多言語対応システムの問題を体系的に解決してください。問題が解決しない場合は、デバッグ情報を収集してから開発チームに相談することをお勧めします。