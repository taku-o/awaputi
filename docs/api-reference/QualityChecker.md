# QualityChecker

## 概要

ファイル: `core/i18n/quality/QualityChecker.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [QualityChecker](#qualitychecker)
## 関数
- [getQualityChecker()](#getqualitychecker)
## 定数
- [removed](#removed)
- [validationResults](#validationresults)
- [flatTranslations](#flattranslations)
- [itemResult](#itemresult)
- [result](#result)
- [ruleResult](#ruleresult)
- [issue](#issue)
- [sourceText](#sourcetext)
- [sourceParams](#sourceparams)
- [translationParams](#translationparams)
- [missingParams](#missingparams)
- [sourceText](#sourcetext)
- [sourceLength](#sourcelength)
- [translationLength](#translationlength)
- [lengthTolerances](#lengthtolerances)
- [tolerance](#tolerance)
- [minLength](#minlength)
- [maxLength](#maxlength)
- [sourceText](#sourcetext)
- [sourceHtmlTags](#sourcehtmltags)
- [translationHtmlTags](#translationhtmltags)
- [sourceMarkdown](#sourcemarkdown)
- [translationMarkdown](#translationmarkdown)
- [markdownMismatch](#markdownmismatch)
- [culturalRules](#culturalrules)
- [rules](#rules)
- [lowerTranslation](#lowertranslation)
- [foundInappropriate](#foundinappropriate)
- [untranslatedMarkers](#untranslatedmarkers)
- [hasUntranslatedMarker](#hasuntranslatedmarker)
- [sourceText](#sourcetext)
- [sentences](#sentences)
- [trimmed](#trimmed)
- [sourceText](#sourcetext)
- [sourcePunctuation](#sourcepunctuation)
- [translationPunctuation](#translationpunctuation)
- [flattened](#flattened)
- [fullKey](#fullkey)
- [patterns](#patterns)
- [params](#params)
- [htmlTagPattern](#htmltagpattern)
- [matches](#matches)
- [patterns](#patterns)
- [elements](#elements)
- [matches](#matches)
- [mockTranslations](#mocktranslations)
- [totalItems](#totalitems)
- [errorCount](#errorcount)
- [warningCount](#warningcount)
- [errorPenalty](#errorpenalty)
- [warningPenalty](#warningpenalty)
- [baseScore](#basescore)
- [finalScore](#finalscore)
- [report](#report)
- [recommendations](#recommendations)
- [rule](#rule)

---

## QualityChecker

### コンストラクタ

```javascript
new QualityChecker()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `validationRules` | 説明なし |
| `qualityThresholds` | 説明なし |
| `qualityStats` | 品質統計 |

### メソッド

#### initializeDefaultRules

**シグネチャ**:
```javascript
 initializeDefaultRules()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeDefaultRules();

// initializeDefaultRulesの実用的な使用例
const result = instance.initializeDefaultRules(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addValidationRule

**シグネチャ**:
```javascript
 addValidationRule(id, rule)
```

**パラメーター**:
- `id`
- `rule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addValidationRule(id, rule);

// addValidationRuleの実用的な使用例
const result = instance.addValidationRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!rule.name || !rule.check || typeof rule.check !== 'function')
```

**パラメーター**:
- `!rule.name || !rule.check || typeof rule.check !== 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!rule.name || !rule.check || typeof rule.check !== 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeValidationRule

**シグネチャ**:
```javascript
 removeValidationRule(id)
```

**パラメーター**:
- `id`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeValidationRule(id);

// removeValidationRuleの実用的な使用例
const result = instance.removeValidationRule(/* 適切なパラメータ */);
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

#### validateTranslations

**シグネチャ**:
```javascript
async validateTranslations(translations, sourceLanguage = 'ja', targetLanguage)
```

**パラメーター**:
- `translations`
- `sourceLanguage = 'ja'`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateTranslations(translations, sourceLanguage = 'ja', targetLanguage);

// validateTranslationsの実用的な使用例
const result = instance.validateTranslations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (itemResult.errors.length > 0)
```

**パラメーター**:
- `itemResult.errors.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemResult.errors.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (itemResult.warnings.length > 0)
```

**パラメーター**:
- `itemResult.warnings.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemResult.warnings.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (itemResult.passed.length > 0)
```

**パラメーター**:
- `itemResult.passed.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(itemResult.passed.length > 0);

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

#### validateTranslationItem

**シグネチャ**:
```javascript
async validateTranslationItem(key, translation, sourceLanguage, targetLanguage)
```

**パラメーター**:
- `key`
- `translation`
- `sourceLanguage`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateTranslationItem(key, translation, sourceLanguage, targetLanguage);

// validateTranslationItemの実用的な使用例
const result = instance.validateTranslationItem(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

有効な検証ルールを実行

**シグネチャ**:
```javascript
 for (const [ruleId, rule] of this.validationRules)
```

**パラメーター**:
- `const [ruleId`
- `rule] of this.validationRules`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [ruleId, rule] of this.validationRules);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (ruleResult.passed)
```

**パラメーター**:
- `ruleResult.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(ruleResult.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rule.severity === 'error')
```

**パラメーター**:
- `rule.severity === 'error'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rule.severity === 'error');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (ruleError)
```

**パラメーター**:
- `ruleError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(ruleError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
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

#### checkParameterConsistency

**シグネチャ**:
```javascript
 checkParameterConsistency(key, translation, sourceLanguage, targetLanguage)
```

**パラメーター**:
- `key`
- `translation`
- `sourceLanguage`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkParameterConsistency(key, translation, sourceLanguage, targetLanguage);

// checkParameterConsistencyの実用的な使用例
const result = instance.checkParameterConsistency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!sourceText)
```

**パラメーター**:
- `!sourceText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!sourceText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パラメータ数の比較

**シグネチャ**:
```javascript
 if (sourceParams.length !== translationParams.length)
```

**パラメーター**:
- `sourceParams.length !== translationParams.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceParams.length !== translationParams.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (missingParams.length > 0)
```

**パラメーター**:
- `missingParams.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(missingParams.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkLengthValidation

**シグネチャ**:
```javascript
 checkLengthValidation(key, translation, sourceLanguage, targetLanguage)
```

**パラメーター**:
- `key`
- `translation`
- `sourceLanguage`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkLengthValidation(key, translation, sourceLanguage, targetLanguage);

// checkLengthValidationの実用的な使用例
const result = instance.checkLengthValidation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!sourceText)
```

**パラメーター**:
- `!sourceText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!sourceText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (translationLength < minLength)
```

**パラメーター**:
- `translationLength < minLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(translationLength < minLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (translationLength > maxLength)
```

**パラメーター**:
- `translationLength > maxLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(translationLength > maxLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkFormatValidation

**シグネチャ**:
```javascript
 checkFormatValidation(key, translation, sourceLanguage, targetLanguage)
```

**パラメーター**:
- `key`
- `translation`
- `sourceLanguage`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkFormatValidation(key, translation, sourceLanguage, targetLanguage);

// checkFormatValidationの実用的な使用例
const result = instance.checkFormatValidation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!sourceText)
```

**パラメーター**:
- `!sourceText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!sourceText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (sourceHtmlTags.length !== translationHtmlTags.length)
```

**パラメーター**:
- `sourceHtmlTags.length !== translationHtmlTags.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceHtmlTags.length !== translationHtmlTags.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (markdownMismatch.length > 0)
```

**パラメーター**:
- `markdownMismatch.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(markdownMismatch.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkCulturalAppropriateness

**シグネチャ**:
```javascript
 checkCulturalAppropriateness(key, translation, sourceLanguage, targetLanguage)
```

**パラメーター**:
- `key`
- `translation`
- `sourceLanguage`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkCulturalAppropriateness(key, translation, sourceLanguage, targetLanguage);

// checkCulturalAppropriatenessの実用的な使用例
const result = instance.checkCulturalAppropriateness(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!rules)
```

**パラメーター**:
- `!rules`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!rules);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (foundInappropriate.length > 0)
```

**パラメーター**:
- `foundInappropriate.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(foundInappropriate.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkCompleteness

**シグネチャ**:
```javascript
 checkCompleteness(key, translation, sourceLanguage, targetLanguage)
```

**パラメーター**:
- `key`
- `translation`
- `sourceLanguage`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkCompleteness(key, translation, sourceLanguage, targetLanguage);

// checkCompletenessの実用的な使用例
const result = instance.checkCompleteness(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hasUntranslatedMarker)
```

**パラメーター**:
- `hasUntranslatedMarker`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hasUntranslatedMarker);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkConsistency

**シグネチャ**:
```javascript
 checkConsistency(key, translation, sourceLanguage, targetLanguage)
```

**パラメーター**:
- `key`
- `translation`
- `sourceLanguage`
- `targetLanguage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkConsistency(key, translation, sourceLanguage, targetLanguage);

// checkConsistencyの実用的な使用例
const result = instance.checkConsistency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

大文字小文字の一貫性（英語の場合）

**シグネチャ**:
```javascript
 if (targetLanguage === 'en')
```

**パラメーター**:
- `targetLanguage === 'en'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(targetLanguage === 'en');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (inconsistentCapitalization)
```

**パラメーター**:
- `inconsistentCapitalization`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(inconsistentCapitalization);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (sourceText)
```

**パラメーター**:
- `sourceText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### flattenTranslations

**シグネチャ**:
```javascript
 flattenTranslations(translations, prefix = '')
```

**パラメーター**:
- `translations`
- `prefix = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.flattenTranslations(translations, prefix = '');

// flattenTranslationsの実用的な使用例
const result = instance.flattenTranslations(/* 適切なパラメータ */);
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

## getQualityChecker

**シグネチャ**:
```javascript
getQualityChecker()
```

**使用例**:
```javascript
const result = getQualityChecker();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `removed` | 説明なし |
| `validationResults` | 説明なし |
| `flatTranslations` | 説明なし |
| `itemResult` | 説明なし |
| `result` | 説明なし |
| `ruleResult` | 説明なし |
| `issue` | 説明なし |
| `sourceText` | 説明なし |
| `sourceParams` | 説明なし |
| `translationParams` | 説明なし |
| `missingParams` | 説明なし |
| `sourceText` | 説明なし |
| `sourceLength` | 説明なし |
| `translationLength` | 説明なし |
| `lengthTolerances` | 説明なし |
| `tolerance` | 説明なし |
| `minLength` | 説明なし |
| `maxLength` | 説明なし |
| `sourceText` | 説明なし |
| `sourceHtmlTags` | 説明なし |
| `translationHtmlTags` | 説明なし |
| `sourceMarkdown` | 説明なし |
| `translationMarkdown` | 説明なし |
| `markdownMismatch` | 説明なし |
| `culturalRules` | 説明なし |
| `rules` | 説明なし |
| `lowerTranslation` | 説明なし |
| `foundInappropriate` | 説明なし |
| `untranslatedMarkers` | 説明なし |
| `hasUntranslatedMarker` | 説明なし |
| `sourceText` | 説明なし |
| `sentences` | 説明なし |
| `trimmed` | 説明なし |
| `sourceText` | 説明なし |
| `sourcePunctuation` | 説明なし |
| `translationPunctuation` | 説明なし |
| `flattened` | 説明なし |
| `fullKey` | 説明なし |
| `patterns` | 説明なし |
| `params` | 説明なし |
| `htmlTagPattern` | 説明なし |
| `matches` | 説明なし |
| `patterns` | 説明なし |
| `elements` | 説明なし |
| `matches` | 説明なし |
| `mockTranslations` | 説明なし |
| `totalItems` | 説明なし |
| `errorCount` | 説明なし |
| `warningCount` | 説明なし |
| `errorPenalty` | 説明なし |
| `warningPenalty` | 説明なし |
| `baseScore` | 説明なし |
| `finalScore` | 説明なし |
| `report` | 説明なし |
| `recommendations` | 説明なし |
| `rule` | 説明なし |

---

