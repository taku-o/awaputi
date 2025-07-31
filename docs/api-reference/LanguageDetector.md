# LanguageDetector

## 概要

ファイル: `core/i18n/LanguageDetector.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [LanguageDetector](#languagedetector)
## 定数
- [language](#language)
- [params](#params)
- [langParam](#langparam)
- [normalized](#normalized)
- [storedLang](#storedlang)
- [normalized](#normalized)
- [primaryLang](#primarylang)
- [normalized](#normalized)
- [normalized](#normalized)
- [userLanguage](#userlanguage)
- [normalized](#normalized)
- [normalized](#normalized)
- [mapping](#mapping)
- [baseLang](#baselang)
- [normalized](#normalized)
- [normalized](#normalized)
- [normalized](#normalized)
- [stats](#stats)

---

## LanguageDetector

### コンストラクタ

```javascript
new LanguageDetector(localizationManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `localizationManager` | 説明なし |
| `detectionMethods` | 検出メソッドの優先順位（上から順に試行） |
| `supportedLanguages` | サポート言語リスト |

### メソッド

#### detect

**シグネチャ**:
```javascript
 detect()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detect();

// detectの実用的な使用例
const result = instance.detect(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const method of this.detectionMethods)
```

**パラメーター**:
- `const method of this.detectionMethods`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const method of this.detectionMethods);

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

#### detectFromURL

**シグネチャ**:
```javascript
 detectFromURL()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectFromURL();

// detectFromURLの実用的な使用例
const result = instance.detectFromURL(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (langParam)
```

**パラメーター**:
- `langParam`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(langParam);

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

#### detectFromStorage

**シグネチャ**:
```javascript
 detectFromStorage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectFromStorage();

// detectFromStorageの実用的な使用例
const result = instance.detectFromStorage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (storedLang)
```

**パラメーター**:
- `storedLang`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(storedLang);

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

#### detectFromBrowser

**シグネチャ**:
```javascript
 detectFromBrowser()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectFromBrowser();

// detectFromBrowserの実用的な使用例
const result = instance.detectFromBrowser(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (primaryLang)
```

**パラメーター**:
- `primaryLang`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(primaryLang);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

navigator.languagesもチェック

**シグネチャ**:
```javascript
 if (navigator.languages && navigator.languages.length > 0)
```

**パラメーター**:
- `navigator.languages && navigator.languages.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(navigator.languages && navigator.languages.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const lang of navigator.languages)
```

**パラメーター**:
- `const lang of navigator.languages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const lang of navigator.languages);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (userLanguage)
```

**パラメーター**:
- `userLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(userLanguage);

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

#### detectFromDefault

**シグネチャ**:
```javascript
 detectFromDefault()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectFromDefault();

// detectFromDefaultの実用的な使用例
const result = instance.detectFromDefault(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### normalizeLanguageCode

**シグネチャ**:
```javascript
 normalizeLanguageCode(langCode)
```

**パラメーター**:
- `langCode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.normalizeLanguageCode(langCode);

// normalizeLanguageCodeの実用的な使用例
const result = instance.normalizeLanguageCode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!langCode || typeof langCode !== 'string')
```

**パラメーター**:
- `!langCode || typeof langCode !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!langCode || typeof langCode !== 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isSupported

**シグネチャ**:
```javascript
 isSupported(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isSupported(language);

// isSupportedの実用的な使用例
const result = instance.isSupported(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addSupportedLanguage

**シグネチャ**:
```javascript
 addSupportedLanguage(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addSupportedLanguage(language);

// addSupportedLanguageの実用的な使用例
const result = instance.addSupportedLanguage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (normalized)
```

**パラメーター**:
- `normalized`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(normalized);

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

#### removeSupportedLanguage

**シグネチャ**:
```javascript
 removeSupportedLanguage(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeSupportedLanguage(language);

// removeSupportedLanguageの実用的な使用例
const result = instance.removeSupportedLanguage(/* 適切なパラメータ */);
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

#### getSupportedLanguages

**シグネチャ**:
```javascript
 getSupportedLanguages()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSupportedLanguages();

// getSupportedLanguagesの実用的な使用例
const result = instance.getSupportedLanguages(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveLanguagePreference

**シグネチャ**:
```javascript
 saveLanguagePreference(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveLanguagePreference(language);

// saveLanguagePreferenceの実用的な使用例
const result = instance.saveLanguagePreference(/* 適切なパラメータ */);
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

#### getDetectionStats

**シグネチャ**:
```javascript
 getDetectionStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDetectionStats();

// getDetectionStatsの実用的な使用例
const result = instance.getDetectionStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### debug

**シグネチャ**:
```javascript
 debug()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.debug();

// debugの実用的な使用例
const result = instance.debug(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `language` | 説明なし |
| `params` | 説明なし |
| `langParam` | 説明なし |
| `normalized` | 説明なし |
| `storedLang` | 説明なし |
| `normalized` | 説明なし |
| `primaryLang` | 説明なし |
| `normalized` | 説明なし |
| `normalized` | 説明なし |
| `userLanguage` | 説明なし |
| `normalized` | 説明なし |
| `normalized` | 説明なし |
| `mapping` | 説明なし |
| `baseLang` | 説明なし |
| `normalized` | 説明なし |
| `normalized` | 説明なし |
| `normalized` | 説明なし |
| `stats` | 説明なし |

---

