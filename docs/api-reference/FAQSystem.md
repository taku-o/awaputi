# FAQSystem

## 概要

ファイル: `core/help/FAQSystem.js`  
最終更新: 2025/7/31 8:26:54

## 目次

## クラス
- [FAQSystem](#faqsystem)
## 関数
- [getFAQSystem()](#getfaqsystem)
- [reinitializeFAQSystem()](#reinitializefaqsystem)
## 定数
- [category](#category)
- [faqContent](#faqcontent)
- [category](#category)
- [searchableText](#searchabletext)
- [words](#words)
- [searchTerms](#searchterms)
- [matchingFAQs](#matchingfaqs)
- [faqIds](#faqids)
- [currentScore](#currentscore)
- [questionLower](#questionlower)
- [answerLower](#answerlower)
- [currentScore](#currentscore)
- [sortedResults](#sortedresults)
- [allFAQs](#allfaqs)
- [categoryFAQs](#categoryfaqs)
- [page](#page)
- [itemsPerPage](#itemsperpage)
- [startIndex](#startindex)
- [endIndex](#endindex)
- [faq](#faq)
- [category](#category)
- [faq](#faq)
- [feedbackId](#feedbackid)
- [statsKey](#statskey)
- [currentStats](#currentstats)
- [savedStats](#savedstats)
- [parsedStats](#parsedstats)
- [statsData](#statsdata)
- [targetFAQ](#targetfaq)
- [relatedFAQs](#relatedfaqs)
- [commonTags](#commontags)
- [queryLower](#querylower)
- [suggestions](#suggestions)
- [question](#question)

---

## FAQSystem

### コンストラクタ

```javascript
new FAQSystem(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `loggingSystem` | 説明なし |
| `faqDatabase` | FAQ データ管理 |
| `categories` | 説明なし |
| `searchIndex` | 説明なし |
| `feedbackData` | ユーザーフィードバック |
| `usageStatistics` | 説明なし |
| `userPreferences` | 説明なし |
| `searchEngine` | 検索・フィルタリング |
| `activeFilters` | 説明なし |
| `sortOrder` | 説明なし |
| `displayConfig` | 表示設定 |
| `defaultCategories` | FAQカテゴリ定義 |
| `defaultFAQs` | デフォルトFAQデータ |
| `usageStatistics` | 説明なし |
| `userPreferences` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
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

#### initializeCategories

**シグネチャ**:
```javascript
 initializeCategories()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeCategories();

// initializeCategoriesの実用的な使用例
const result = instance.initializeCategories(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeFAQData

**シグネチャ**:
```javascript
async initializeFAQData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeFAQData();

// initializeFAQDataの実用的な使用例
const result = instance.initializeFAQData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadExternalFAQData

**シグネチャ**:
```javascript
async loadExternalFAQData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadExternalFAQData();

// loadExternalFAQDataの実用的な使用例
const result = instance.loadExternalFAQData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine.helpManager && this.gameEngine.helpManager.contentLoader)
```

**パラメーター**:
- `this.gameEngine.helpManager && this.gameEngine.helpManager.contentLoader`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.helpManager && this.gameEngine.helpManager.contentLoader);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category);

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

#### buildSearchIndex

**シグネチャ**:
```javascript
 buildSearchIndex()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.buildSearchIndex();

// buildSearchIndexの実用的な使用例
const result = instance.buildSearchIndex(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [faqId, faq] of this.faqDatabase)
```

**パラメーター**:
- `const [faqId`
- `faq] of this.faqDatabase`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [faqId, faq] of this.faqDatabase);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(word => {
                if (word.length >= 2)
```

**パラメーター**:
- `word => {
                if (word.length >= 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(word => {
                if (word.length >= 2);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### searchFAQs

**シグネチャ**:
```javascript
 searchFAQs(query, options = {})
```

**パラメーター**:
- `query`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.searchFAQs(query, options = {});

// searchFAQsの実用的な使用例
const result = instance.searchFAQs(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const faqId of faqIds)
```

**パラメーター**:
- `const faqId of faqIds`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const faqId of faqIds);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

完全一致・部分一致のボーナススコア

**シグネチャ**:
```javascript
 for (const [faqId, faq] of this.faqDatabase)
```

**パラメーター**:
- `const [faqId`
- `faq] of this.faqDatabase`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [faqId, faq] of this.faqDatabase);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タグでの一致

**シグネチャ**:
```javascript
 if (faq.tags)
```

**パラメーター**:
- `faq.tags`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(faq.tags);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const tag of faq.tags)
```

**パラメーター**:
- `const tag of faq.tags`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const tag of faq.tags);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bonusScore > 0)
```

**パラメーター**:
- `bonusScore > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bonusScore > 0);

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

#### getAllFAQs

**シグネチャ**:
```javascript
 getAllFAQs(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllFAQs(options = {});

// getAllFAQsの実用的な使用例
const result = instance.getAllFAQs(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFAQsByCategory

**シグネチャ**:
```javascript
 getFAQsByCategory(categoryId, options = {})
```

**パラメーター**:
- `categoryId`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFAQsByCategory(categoryId, options = {});

// getFAQsByCategoryの実用的な使用例
const result = instance.getFAQsByCategory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyFiltersAndPagination

**シグネチャ**:
```javascript
 applyFiltersAndPagination(faqs, options)
```

**パラメーター**:
- `faqs`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyFiltersAndPagination(faqs, options);

// applyFiltersAndPaginationの実用的な使用例
const result = instance.applyFiltersAndPagination(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

難易度フィルター

**シグネチャ**:
```javascript
 if (options.difficulty)
```

**パラメーター**:
- `options.difficulty`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(options.difficulty);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タグフィルター

**シグネチャ**:
```javascript
 if (options.tags && options.tags.length > 0)
```

**パラメーター**:
- `options.tags && options.tags.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(options.tags && options.tags.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### sortFAQs

**シグネチャ**:
```javascript
 sortFAQs(faqs, sortBy)
```

**パラメーター**:
- `faqs`
- `sortBy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.sortFAQs(faqs, sortBy);

// sortFAQsの実用的な使用例
const result = instance.sortFAQs(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (sortBy)
```

**パラメーター**:
- `sortBy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(sortBy);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFAQ

**シグネチャ**:
```javascript
 getFAQ(faqId)
```

**パラメーター**:
- `faqId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFAQ(faqId);

// getFAQの実用的な使用例
const result = instance.getFAQ(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (faq)
```

**パラメーター**:
- `faq`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(faq);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordFeedback

**シグネチャ**:
```javascript
 recordFeedback(faqId, feedbackType, comment = '')
```

**パラメーター**:
- `faqId`
- `feedbackType`
- `comment = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordFeedback(faqId, feedbackType, comment = '');

// recordFeedbackの実用的な使用例
const result = instance.recordFeedback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

FAQのフィードバック統計を更新

**シグネチャ**:
```javascript
 switch (feedbackType)
```

**パラメーター**:
- `feedbackType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(feedbackType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### updateUsageStatistics

**シグネチャ**:
```javascript
 updateUsageStatistics(faqId, action, details = '')
```

**パラメーター**:
- `faqId`
- `action`
- `details = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateUsageStatistics(faqId, action, details = '');

// updateUsageStatisticsの実用的な使用例
const result = instance.updateUsageStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (details)
```

**パラメーター**:
- `details`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(details);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

詳細は最新10件のみ保持

**シグネチャ**:
```javascript
 if (currentStats.details.length > 10)
```

**パラメーター**:
- `currentStats.details.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentStats.details.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadUserStatistics

**シグネチャ**:
```javascript
 loadUserStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadUserStatistics();

// loadUserStatisticsの実用的な使用例
const result = instance.loadUserStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedStats)
```

**パラメーター**:
- `savedStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedStats);

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

#### saveUserStatistics

**シグネチャ**:
```javascript
 saveUserStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveUserStatistics();

// saveUserStatisticsの実用的な使用例
const result = instance.saveUserStatistics(/* 適切なパラメータ */);
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

#### getCategories

**シグネチャ**:
```javascript
 getCategories()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCategories();

// getCategoriesの実用的な使用例
const result = instance.getCategories(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPopularFAQs

**シグネチャ**:
```javascript
 getPopularFAQs(limit = 5)
```

**パラメーター**:
- `limit = 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPopularFAQs(limit = 5);

// getPopularFAQsの実用的な使用例
const result = instance.getPopularFAQs(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRecentFAQs

**シグネチャ**:
```javascript
 getRecentFAQs(limit = 5)
```

**パラメーター**:
- `limit = 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRecentFAQs(limit = 5);

// getRecentFAQsの実用的な使用例
const result = instance.getRecentFAQs(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRelatedFAQs

**シグネチャ**:
```javascript
 getRelatedFAQs(faqId, limit = 3)
```

**パラメーター**:
- `faqId`
- `limit = 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRelatedFAQs(faqId, limit = 3);

// getRelatedFAQsの実用的な使用例
const result = instance.getRelatedFAQs(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### map

**シグネチャ**:
```javascript
 map(faq => {
                let score = 0;
                
                // 同じカテゴリ
                if (faq.category === targetFAQ.category)
```

**パラメーター**:
- `faq => {
                let score = 0;
                
                // 同じカテゴリ
                if (faq.category === targetFAQ.category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.map(faq => {
                let score = 0;
                
                // 同じカテゴリ
                if (faq.category === targetFAQ.category);

// mapの実用的な使用例
const result = instance.map(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

共通タグ

**シグネチャ**:
```javascript
 if (targetFAQ.tags && faq.tags)
```

**パラメーター**:
- `targetFAQ.tags && faq.tags`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(targetFAQ.tags && faq.tags);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

同じ難易度

**シグネチャ**:
```javascript
 if (faq.difficulty === targetFAQ.difficulty)
```

**パラメーター**:
- `faq.difficulty === targetFAQ.difficulty`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(faq.difficulty === targetFAQ.difficulty);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getSearchSuggestions

**シグネチャ**:
```javascript
 getSearchSuggestions(query, limit = 5)
```

**パラメーター**:
- `query`
- `limit = 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSearchSuggestions(query, limit = 5);

// getSearchSuggestionsの実用的な使用例
const result = instance.getSearchSuggestions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タグからの抽出

**シグネチャ**:
```javascript
 if (faq.tags)
```

**パラメーター**:
- `faq.tags`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(faq.tags);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const tag of faq.tags)
```

**パラメーター**:
- `const tag of faq.tags`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const tag of faq.tags);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getSystemStats

**シグネチャ**:
```javascript
 getSystemStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSystemStats();

// getSystemStatsの実用的な使用例
const result = instance.getSystemStats(/* 適切なパラメータ */);
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


---

## getFAQSystem

**シグネチャ**:
```javascript
getFAQSystem(gameEngine)
```

**パラメーター**:
- `gameEngine`

**使用例**:
```javascript
const result = getFAQSystem(gameEngine);
```

---

## reinitializeFAQSystem

**シグネチャ**:
```javascript
reinitializeFAQSystem(gameEngine)
```

**パラメーター**:
- `gameEngine`

**使用例**:
```javascript
const result = reinitializeFAQSystem(gameEngine);
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `category` | 説明なし |
| `faqContent` | 説明なし |
| `category` | 説明なし |
| `searchableText` | 説明なし |
| `words` | 説明なし |
| `searchTerms` | 説明なし |
| `matchingFAQs` | 説明なし |
| `faqIds` | 説明なし |
| `currentScore` | 説明なし |
| `questionLower` | 説明なし |
| `answerLower` | 説明なし |
| `currentScore` | 説明なし |
| `sortedResults` | 説明なし |
| `allFAQs` | 説明なし |
| `categoryFAQs` | 説明なし |
| `page` | 説明なし |
| `itemsPerPage` | 説明なし |
| `startIndex` | 説明なし |
| `endIndex` | 説明なし |
| `faq` | 説明なし |
| `category` | 説明なし |
| `faq` | 説明なし |
| `feedbackId` | 説明なし |
| `statsKey` | 説明なし |
| `currentStats` | 説明なし |
| `savedStats` | 説明なし |
| `parsedStats` | 説明なし |
| `statsData` | 説明なし |
| `targetFAQ` | 説明なし |
| `relatedFAQs` | 説明なし |
| `commonTags` | 説明なし |
| `queryLower` | 説明なし |
| `suggestions` | 説明なし |
| `question` | 説明なし |

---

