# TranslationLoader

## 概要

ファイル: `core/i18n/TranslationLoader.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [TranslationLoader](#translationloader)
## 定数
- [promise](#promise)
- [translations](#translations)
- [promises](#promises)
- [results](#results)
- [loaded](#loaded)
- [failed](#failed)
- [translations](#translations)
- [loadPromises](#loadpromises)
- [promise](#promise)
- [url](#url)
- [cacheKey](#cachekey)
- [cached](#cached)
- [response](#response)
- [data](#data)
- [flattened](#flattened)
- [data](#data)
- [removed](#removed)
- [cacheKeysToDelete](#cachekeystodelete)
- [index](#index)
- [cacheStats](#cachestats)
- [language](#language)
- [url](#url)
- [response](#response)
- [available](#available)
- [checkPromises](#checkpromises)
- [exists](#exists)

---

## TranslationLoader

### コンストラクタ

```javascript
new TranslationLoader()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `loadedTranslations` | 説明なし |
| `loadingPromises` | 説明なし |
| `cache` | 説明なし |
| `baseURL` | 説明なし |
| `translationFiles` | ロード対象ファイル |
| `baseURL` | 説明なし |
| `translationFiles` | 説明なし |

### メソッド

#### loadLanguage

**シグネチャ**:
```javascript
async loadLanguage(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadLanguage(language);

// loadLanguageの実用的な使用例
const result = instance.loadLanguage(/* 適切なパラメータ */);
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

#### preloadLanguages

**シグネチャ**:
```javascript
async preloadLanguages(languages)
```

**パラメーター**:
- `languages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preloadLanguages(languages);

// preloadLanguagesの実用的な使用例
const result = instance.preloadLanguages(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result.status === 'fulfilled')
```

**パラメーター**:
- `result.status === 'fulfilled'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result.status === 'fulfilled');

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

#### for

**シグネチャ**:
```javascript
 for (const file of this.translationFiles)
```

**パラメーター**:
- `const file of this.translationFiles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const file of this.translationFiles);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### then

**シグネチャ**:
```javascript
 then(data => {
                    if (data)
```

**パラメーター**:
- `data => {
                    if (data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.then(data => {
                    if (data);

// thenの実用的な使用例
const result = instance.then(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!response.ok)
```

**パラメーター**:
- `!response.ok`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!response.ok);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (response.status === 404)
```

**パラメーター**:
- `response.status === 404`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(response.status === 404);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メタデータの検証

**シグネチャ**:
```javascript
 if (data.meta)
```

**パラメーター**:
- `data.meta`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.meta);

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

#### if

**シグネチャ**:
```javascript
 if (meta.language !== language)
```

**パラメーター**:
- `meta.language !== language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(meta.language !== language);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (meta.version)
```

**パラメーター**:
- `meta.version`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(meta.version);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (meta.completeness !== undefined && meta.completeness < 90)
```

**パラメーター**:
- `meta.completeness !== undefined && meta.completeness < 90`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(meta.completeness !== undefined && meta.completeness < 90);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (translations && typeof translations === 'object')
```

**パラメーター**:
- `translations && typeof translations === 'object'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(translations && typeof translations === 'object');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadCategory

**シグネチャ**:
```javascript
async loadCategory(language, category)
```

**パラメーター**:
- `language`
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadCategory(language, category);

// loadCategoryの実用的な使用例
const result = instance.loadCategory(/* 適切なパラメータ */);
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

#### getLoadedLanguages

**シグネチャ**:
```javascript
 getLoadedLanguages()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLoadedLanguages();

// getLoadedLanguagesの実用的な使用例
const result = instance.getLoadedLanguages(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTranslations

**シグネチャ**:
```javascript
 getTranslations(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTranslations(language);

// getTranslationsの実用的な使用例
const result = instance.getTranslations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isLanguageLoaded

**シグネチャ**:
```javascript
 isLanguageLoaded(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isLanguageLoaded(language);

// isLanguageLoadedの実用的な使用例
const result = instance.isLanguageLoaded(/* 適切なパラメータ */);
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

#### unloadLanguage

**シグネチャ**:
```javascript
 unloadLanguage(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.unloadLanguage(language);

// unloadLanguageの実用的な使用例
const result = instance.unloadLanguage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (removed)
```

**パラメーター**:
- `removed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(removed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setBaseURL

**シグネチャ**:
```javascript
 setBaseURL(url)
```

**パラメーター**:
- `url`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setBaseURL(url);

// setBaseURLの実用的な使用例
const result = instance.setBaseURL(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setTranslationFiles

**シグネチャ**:
```javascript
 setTranslationFiles(files)
```

**パラメーター**:
- `files`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setTranslationFiles(files);

// setTranslationFilesの実用的な使用例
const result = instance.setTranslationFiles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addTranslationFile

**シグネチャ**:
```javascript
 addTranslationFile(filename)
```

**パラメーター**:
- `filename`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addTranslationFile(filename);

// addTranslationFileの実用的な使用例
const result = instance.addTranslationFile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeTranslationFile

**シグネチャ**:
```javascript
 removeTranslationFile(filename)
```

**パラメーター**:
- `filename`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeTranslationFile(filename);

// removeTranslationFileの実用的な使用例
const result = instance.removeTranslationFile(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index !== -1)
```

**パラメーター**:
- `index !== -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index !== -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### checkFileExists

**シグネチャ**:
```javascript
async checkFileExists(language, filename)
```

**パラメーター**:
- `language`
- `filename`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkFileExists(language, filename);

// checkFileExistsの実用的な使用例
const result = instance.checkFileExists(/* 適切なパラメータ */);
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

#### getAvailableFiles

**シグネチャ**:
```javascript
async getAvailableFiles(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableFiles(language);

// getAvailableFilesの実用的な使用例
const result = instance.getAvailableFiles(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (exists)
```

**パラメーター**:
- `exists`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(exists);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanup

**シグネチャ**:
```javascript
 cleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanup();

// cleanupの実用的な使用例
const result = instance.cleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `promise` | 説明なし |
| `translations` | 説明なし |
| `promises` | 説明なし |
| `results` | 説明なし |
| `loaded` | 説明なし |
| `failed` | 説明なし |
| `translations` | 説明なし |
| `loadPromises` | 説明なし |
| `promise` | 説明なし |
| `url` | 説明なし |
| `cacheKey` | 説明なし |
| `cached` | 説明なし |
| `response` | 説明なし |
| `data` | 説明なし |
| `flattened` | 説明なし |
| `data` | 説明なし |
| `removed` | 説明なし |
| `cacheKeysToDelete` | 説明なし |
| `index` | 説明なし |
| `cacheStats` | 説明なし |
| `language` | 説明なし |
| `url` | 説明なし |
| `response` | 説明なし |
| `available` | 説明なし |
| `checkPromises` | 説明なし |
| `exists` | 説明なし |

---

