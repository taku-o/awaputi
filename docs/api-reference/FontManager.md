# FontManager

## 概要

ファイル: `core/i18n/FontManager.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [FontManager](#fontmanager)
## 関数
- [getFontManager()](#getfontmanager)
## 定数
- [fontKey](#fontkey)
- [fontConfig](#fontconfig)
- [font](#font)
- [loadPromise](#loadpromise)
- [result](#result)
- [fontFace](#fontface)
- [existingLink](#existinglink)
- [link](#link)
- [canvas](#canvas)
- [context](#context)
- [testText](#testtext)
- [defaultWidth](#defaultwidth)
- [fontWidth](#fontwidth)
- [loaded](#loaded)
- [fontConfig](#fontconfig)
- [font](#font)
- [fontStack](#fontstack)
- [fontStack](#fontstack)
- [css](#css)
- [primaryStack](#primarystack)
- [secondaryStack](#secondarystack)
- [langStyles](#langstyles)
- [styles](#styles)
- [loaded](#loaded)
- [result](#result)
- [results](#results)
- [primaryLoaded](#primaryloaded)

---

## FontManager

### コンストラクタ

```javascript
new FontManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `loadedFonts` | 説明なし |
| `fontConfigs` | 説明なし |
| `loadingPromises` | 説明なし |
| `fontLoadObserver` | フォント読み込み状態の監視 |

### メソッド

#### initialize

**シグネチャ**:
```javascript
 initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### if

Font Loading APIが利用可能か確認

**シグネチャ**:
```javascript
 if ('fonts' in document)
```

**パラメーター**:
- `'fonts' in document`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('fonts' in document);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeFontConfigs

**シグネチャ**:
```javascript
 initializeFontConfigs()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeFontConfigs();

// initializeFontConfigsの実用的な使用例
const result = instance.initializeFontConfigs(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadFontsForLanguage

**シグネチャ**:
```javascript
async loadFontsForLanguage(language, priority = 'primary')
```

**パラメーター**:
- `language`
- `priority = 'primary'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadFontsForLanguage(language, priority = 'primary');

// loadFontsForLanguageの実用的な使用例
const result = instance.loadFontsForLanguage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!fontConfig || !fontConfig[priority])
```

**パラメーター**:
- `!fontConfig || !fontConfig[priority]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!fontConfig || !fontConfig[priority]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadFont

**シグネチャ**:
```javascript
async loadFont(fontConfig, key)
```

**パラメーター**:
- `fontConfig`
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadFont(fontConfig, key);

// loadFontの実用的な使用例
const result = instance.loadFont(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Google Fontsなど外部URLからの読み込み

**シグネチャ**:
```javascript
 if (fontConfig.url)
```

**パラメーター**:
- `fontConfig.url`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fontConfig.url);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Font Loading APIを使用した確認

**シグネチャ**:
```javascript
 if ('fonts' in document)
```

**パラメーター**:
- `'fonts' in document`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('fonts' in document);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadWebFont

**シグネチャ**:
```javascript
async loadWebFont(fontConfig)
```

**パラメーター**:
- `fontConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadWebFont(fontConfig);

// loadWebFontの実用的な使用例
const result = instance.loadWebFont(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (existingLink)
```

**パラメーター**:
- `existingLink`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existingLink);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkFontLoadedFallback

**シグネチャ**:
```javascript
 checkFontLoadedFallback(fontConfig)
```

**パラメーター**:
- `fontConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkFontLoadedFallback(fontConfig);

// checkFontLoadedFallbackの実用的な使用例
const result = instance.checkFontLoadedFallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (loaded)
```

**パラメーター**:
- `loaded`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(loaded);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFontStack

**シグネチャ**:
```javascript
 getFontStack(language, priority = 'primary')
```

**パラメーター**:
- `language`
- `priority = 'primary'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFontStack(language, priority = 'primary');

// getFontStackの実用的な使用例
const result = instance.getFontStack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!fontConfig || !fontConfig[priority])
```

**パラメーター**:
- `!fontConfig || !fontConfig[priority]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!fontConfig || !fontConfig[priority]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDefaultFontStack

**シグネチャ**:
```javascript
 getDefaultFontStack()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDefaultFontStack();

// getDefaultFontStackの実用的な使用例
const result = instance.getDefaultFontStack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyFontToElement

**シグネチャ**:
```javascript
 applyFontToElement(element, language, priority = 'primary')
```

**パラメーター**:
- `element`
- `language`
- `priority = 'primary'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyFontToElement(element, language, priority = 'primary');

// applyFontToElementの実用的な使用例
const result = instance.applyFontToElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyLanguageSpecificStyles

**シグネチャ**:
```javascript
 applyLanguageSpecificStyles(element, language)
```

**パラメーター**:
- `element`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyLanguageSpecificStyles(element, language);

// applyLanguageSpecificStylesの実用的な使用例
const result = instance.applyLanguageSpecificStyles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(language);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateGlobalFontCSS

**シグネチャ**:
```javascript
 generateGlobalFontCSS(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateGlobalFontCSS(language);

// generateGlobalFontCSSの実用的な使用例
const result = instance.generateGlobalFontCSS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getLanguageSpecificCSS

**シグネチャ**:
```javascript
 getLanguageSpecificCSS(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLanguageSpecificCSS(language);

// getLanguageSpecificCSSの実用的な使用例
const result = instance.getLanguageSpecificCSS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getLoadedFonts

**シグネチャ**:
```javascript
 getLoadedFonts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLoadedFonts();

// getLoadedFontsの実用的な使用例
const result = instance.getLoadedFonts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [key, font] of this.loadedFonts)
```

**パラメーター**:
- `const [key`
- `font] of this.loadedFonts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, font] of this.loadedFonts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkFontStatus

**シグネチャ**:
```javascript
async checkFontStatus(fontFamily)
```

**パラメーター**:
- `fontFamily`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkFontStatus(fontFamily);

// checkFontStatusの実用的な使用例
const result = instance.checkFontStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if ('fonts' in document)
```

**パラメーター**:
- `'fonts' in document`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if('fonts' in document);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preloadFontsForLanguages

**シグネチャ**:
```javascript
async preloadFontsForLanguages(languages)
```

**パラメーター**:
- `languages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preloadFontsForLanguages(languages);

// preloadFontsForLanguagesの実用的な使用例
const result = instance.preloadFontsForLanguages(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const language of languages)
```

**パラメーター**:
- `const language of languages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const language of languages);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStats

**シグネチャ**:
```javascript
 getStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStats();

// getStatsの実用的な使用例
const result = instance.getStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearCache

**シグネチャ**:
```javascript
 clearCache()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearCache();

// clearCacheの実用的な使用例
const result = instance.clearCache(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getFontManager

**シグネチャ**:
```javascript
getFontManager()
```

**使用例**:
```javascript
const result = getFontManager();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `fontKey` | 説明なし |
| `fontConfig` | 説明なし |
| `font` | 説明なし |
| `loadPromise` | 説明なし |
| `result` | 説明なし |
| `fontFace` | 説明なし |
| `existingLink` | 説明なし |
| `link` | 説明なし |
| `canvas` | 説明なし |
| `context` | 説明なし |
| `testText` | 説明なし |
| `defaultWidth` | 説明なし |
| `fontWidth` | 説明なし |
| `loaded` | 説明なし |
| `fontConfig` | 説明なし |
| `font` | 説明なし |
| `fontStack` | 説明なし |
| `fontStack` | 説明なし |
| `css` | 説明なし |
| `primaryStack` | 説明なし |
| `secondaryStack` | 説明なし |
| `langStyles` | 説明なし |
| `styles` | 説明なし |
| `loaded` | 説明なし |
| `result` | 説明なし |
| `results` | 説明なし |
| `primaryLoaded` | 説明なし |

---

