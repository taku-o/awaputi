# TranslationKeyManager

## 概要

ファイル: `core/i18n/management/TranslationKeyManager.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [TranslationKeyManager](#translationkeymanager)
## 関数
- [getTranslationKeyManager()](#gettranslationkeymanager)
## 定数
- [keyMetadata](#keymetadata)
- [results](#results)
- [extractedKeys](#extractedkeys)
- [extractRecursive](#extractrecursive)
- [fullKey](#fullkey)
- [fullPath](#fullpath)
- [metadata](#metadata)
- [now](#now)
- [unusedKeys](#unusedkeys)
- [cutoffDate](#cutoffdate)
- [usage](#usage)
- [keyUsageArray](#keyusagearray)
- [cutoffDate](#cutoffdate)
- [recentKeys](#recentkeys)
- [searchQuery](#searchquery)
- [results](#results)
- [usage](#usage)
- [categoryStats](#categorystats)
- [category](#category)
- [stats](#stats)
- [usage](#usage)
- [reportData](#reportdata)
- [usage](#usage)
- [keyInfo](#keyinfo)
- [keyOccurrences](#keyoccurrences)
- [duplicates](#duplicates)
- [flatKeys](#flatkeys)
- [referenceKeys](#referencekeys)
- [targetKeys](#targetkeys)
- [missingInTarget](#missingintarget)
- [extraInTarget](#extraintarget)
- [reservedWords](#reservedwords)
- [parameters](#parameters)
- [patterns](#patterns)
- [keys](#keys)
- [fullKey](#fullkey)
- [now](#now)
- [recentThreshold](#recentthreshold)
- [catCompare](#catcompare)
- [headers](#headers)
- [rows](#rows)
- [row](#row)
- [metadata](#metadata)
- [usage](#usage)

---

## TranslationKeyManager

### コンストラクタ

```javascript
new TranslationKeyManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `registeredKeys` | 説明なし |
| `keyUsage` | 説明なし |
| `keyCategories` | 説明なし |
| `keyMetadata` | 説明なし |
| `usageTracking` | 説明なし |
| `categoryPatterns` | キー分類用の正規表現パターン |
| `usageStats` | キー使用統計 |

### メソッド

#### registerKey

**シグネチャ**:
```javascript
 registerKey(key, metadata = {})
```

**パラメーター**:
- `key`
- `metadata = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerKey(key, metadata = {});

// registerKeyの実用的な使用例
const result = instance.registerKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!key || typeof key !== 'string')
```

**パラメーター**:
- `!key || typeof key !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!key || typeof key !== 'string');

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

#### registerKeys

**シグネチャ**:
```javascript
 registerKeys(keys)
```

**パラメーター**:
- `keys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerKeys(keys);

// registerKeysの実用的な使用例
const result = instance.registerKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### extractAndRegisterKeys

**シグネチャ**:
```javascript
 extractAndRegisterKeys(translationData, language = 'ja', basePath = '')
```

**パラメーター**:
- `translationData`
- `language = 'ja'`
- `basePath = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.extractAndRegisterKeys(translationData, language = 'ja', basePath = '');

// extractAndRegisterKeysの実用的な使用例
const result = instance.extractAndRegisterKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof value === 'string')
```

**パラメーター**:
- `typeof value === 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordKeyUsage

**シグネチャ**:
```javascript
 recordKeyUsage(key, context = '', location = '')
```

**パラメーター**:
- `key`
- `context = ''`
- `location = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordKeyUsage(key, context = '', location = '');

// recordKeyUsageの実用的な使用例
const result = instance.recordKeyUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!usage)
```

**パラメーター**:
- `!usage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!usage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!usage.firstUsed)
```

**パラメーター**:
- `!usage.firstUsed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!usage.firstUsed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(context);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (location)
```

**パラメーター**:
- `location`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(location);

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

#### recordBatchUsage

**シグネチャ**:
```javascript
 recordBatchUsage(usageRecords)
```

**パラメーター**:
- `usageRecords`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordBatchUsage(usageRecords);

// recordBatchUsageの実用的な使用例
const result = instance.recordBatchUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getUnusedKeys

**シグネチャ**:
```javascript
 getUnusedKeys(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getUnusedKeys(options = {});

// getUnusedKeysの実用的な使用例
const result = instance.getUnusedKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [key, metadata] of this.registeredKeys)
```

**パラメーター**:
- `const [key`
- `metadata] of this.registeredKeys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, metadata] of this.registeredKeys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

非推奨キー除外チェック

**シグネチャ**:
```javascript
 if (excludeDeprecated && metadata.deprecated)
```

**パラメーター**:
- `excludeDeprecated && metadata.deprecated`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(excludeDeprecated && metadata.deprecated);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!usage || usage.count === 0)
```

**パラメーター**:
- `!usage || usage.count === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!usage || usage.count === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFrequentlyUsedKeys

**シグネチャ**:
```javascript
 getFrequentlyUsedKeys(limit = 50)
```

**パラメーター**:
- `limit = 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFrequentlyUsedKeys(limit = 50);

// getFrequentlyUsedKeysの実用的な使用例
const result = instance.getFrequentlyUsedKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRecentlyUsedKeys

**シグネチャ**:
```javascript
 getRecentlyUsedKeys(days = 7, limit = 100)
```

**パラメーター**:
- `days = 7`
- `limit = 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRecentlyUsedKeys(days = 7, limit = 100);

// getRecentlyUsedKeysの実用的な使用例
const result = instance.getRecentlyUsedKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### searchKeys

**シグネチャ**:
```javascript
 searchKeys(query, options = {})
```

**パラメーター**:
- `query`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.searchKeys(query, options = {});

// searchKeysの実用的な使用例
const result = instance.searchKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [key, metadata] of this.registeredKeys)
```

**パラメーター**:
- `const [key`
- `metadata] of this.registeredKeys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, metadata] of this.registeredKeys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

非推奨キー除外

**シグネチャ**:
```javascript
 if (!includeDeprecated && metadata.deprecated)
```

**パラメーター**:
- `!includeDeprecated && metadata.deprecated`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!includeDeprecated && metadata.deprecated);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カテゴリフィルター

**シグネチャ**:
```javascript
 if (category && metadata.category !== category)
```

**パラメーター**:
- `category && metadata.category !== category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category && metadata.category !== category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const field of searchIn)
```

**パラメーター**:
- `const field of searchIn`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const field of searchIn);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (field)
```

**パラメーター**:
- `field`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(field);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!caseSensitive)
```

**パラメーター**:
- `!caseSensitive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!caseSensitive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (matched)
```

**パラメーター**:
- `matched`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(matched);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCategoryStatistics

**シグネチャ**:
```javascript
 getCategoryStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCategoryStatistics();

// getCategoryStatisticsの実用的な使用例
const result = instance.getCategoryStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

統計を計算

**シグネチャ**:
```javascript
 for (const [key, metadata] of this.registeredKeys)
```

**パラメーター**:
- `const [key`
- `metadata] of this.registeredKeys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, metadata] of this.registeredKeys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stats)
```

**パラメーター**:
- `stats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (metadata.deprecated)
```

**パラメーター**:
- `metadata.deprecated`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(metadata.deprecated);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (usage && usage.count > 0)
```

**パラメーター**:
- `usage && usage.count > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(usage && usage.count > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateUsageReport

**シグネチャ**:
```javascript
 generateUsageReport(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateUsageReport(options = {});

// generateUsageReportの実用的な使用例
const result = instance.generateUsageReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

キー情報を収集

**シグネチャ**:
```javascript
 for (const [key, metadata] of this.registeredKeys)
```

**パラメーター**:
- `const [key`
- `metadata] of this.registeredKeys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, metadata] of this.registeredKeys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!includeDeprecated && metadata.deprecated)
```

**パラメーター**:
- `!includeDeprecated && metadata.deprecated`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!includeDeprecated && metadata.deprecated);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!includeUnused && !keyInfo.usage.isUsed)
```

**パラメーター**:
- `!includeUnused && !keyInfo.usage.isUsed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!includeUnused && !keyInfo.usage.isUsed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectDuplicateKeys

**シグネチャ**:
```javascript
 detectDuplicateKeys(translationSets)
```

**パラメーター**:
- `translationSets`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectDuplicateKeys(translationSets);

// detectDuplicateKeysの実用的な使用例
const result = instance.detectDuplicateKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key of flatKeys)
```

**パラメーター**:
- `const key of flatKeys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key of flatKeys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

重複を特定

**シグネチャ**:
```javascript
 for (const [key, occurrences] of keyOccurrences)
```

**パラメーター**:
- `const [key`
- `occurrences] of keyOccurrences`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, occurrences] of keyOccurrences);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (occurrences.length > 1)
```

**パラメーター**:
- `occurrences.length > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(occurrences.length > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectMissingKeys

**シグネチャ**:
```javascript
 detectMissingKeys(referenceTranslations, targetTranslations)
```

**パラメーター**:
- `referenceTranslations`
- `targetTranslations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectMissingKeys(referenceTranslations, targetTranslations);

// detectMissingKeysの実用的な使用例
const result = instance.detectMissingKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validateKeyFormat

**シグネチャ**:
```javascript
 validateKeyFormat(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateKeyFormat(key);

// validateKeyFormatの実用的な使用例
const result = instance.validateKeyFormat(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

長さチェック

**シグネチャ**:
```javascript
 if (key.length > 100)
```

**パラメーター**:
- `key.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(key.length > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### categorizeKey

**シグネチャ**:
```javascript
 categorizeKey(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.categorizeKey(key);

// categorizeKeyの実用的な使用例
const result = instance.categorizeKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [category, pattern] of this.categoryPatterns)
```

**パラメーター**:
- `const [category`
- `pattern] of this.categoryPatterns`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [category, pattern] of this.categoryPatterns);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### extractParameters

**シグネチャ**:
```javascript
 extractParameters(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.extractParameters(text);

// extractParametersの実用的な使用例
const result = instance.extractParameters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getTranslationKeyManager

**シグネチャ**:
```javascript
getTranslationKeyManager()
```

**使用例**:
```javascript
const result = getTranslationKeyManager();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `keyMetadata` | 説明なし |
| `results` | 説明なし |
| `extractedKeys` | 説明なし |
| `extractRecursive` | 説明なし |
| `fullKey` | 説明なし |
| `fullPath` | 説明なし |
| `metadata` | 説明なし |
| `now` | 説明なし |
| `unusedKeys` | 説明なし |
| `cutoffDate` | 説明なし |
| `usage` | 説明なし |
| `keyUsageArray` | 説明なし |
| `cutoffDate` | 説明なし |
| `recentKeys` | 説明なし |
| `searchQuery` | 説明なし |
| `results` | 説明なし |
| `usage` | 説明なし |
| `categoryStats` | 説明なし |
| `category` | 説明なし |
| `stats` | 説明なし |
| `usage` | 説明なし |
| `reportData` | 説明なし |
| `usage` | 説明なし |
| `keyInfo` | 説明なし |
| `keyOccurrences` | 説明なし |
| `duplicates` | 説明なし |
| `flatKeys` | 説明なし |
| `referenceKeys` | 説明なし |
| `targetKeys` | 説明なし |
| `missingInTarget` | 説明なし |
| `extraInTarget` | 説明なし |
| `reservedWords` | 説明なし |
| `parameters` | 説明なし |
| `patterns` | 説明なし |
| `keys` | 説明なし |
| `fullKey` | 説明なし |
| `now` | 説明なし |
| `recentThreshold` | 説明なし |
| `catCompare` | 説明なし |
| `headers` | 説明なし |
| `rows` | 説明なし |
| `row` | 説明なし |
| `metadata` | 説明なし |
| `usage` | 説明なし |

---

