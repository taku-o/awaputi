# ValidationRules

## 概要

ファイル: `core/i18n/quality/ValidationRules.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [ParameterConsistencyRule](#parameterconsistencyrule)
- [LengthValidationRule](#lengthvalidationrule)
- [FormatValidationRule](#formatvalidationrule)
- [CulturalAppropriatenessRule](#culturalappropriatenessrule)
- [CompletenessValidationRule](#completenessvalidationrule)
- [ConsistencyValidationRule](#consistencyvalidationrule)
- [ValidationRuleFactory](#validationrulefactory)
## 定数
- [patterns](#patterns)
- [params](#params)
- [regex](#regex)
- [sourceParams](#sourceparams)
- [translationParams](#translationparams)
- [missingParams](#missingparams)
- [extraParams](#extraparams)
- [issues](#issues)
- [normalized](#normalized)
- [segmenter](#segmenter)
- [segments](#segments)
- [targetLanguage](#targetlanguage)
- [tolerance](#tolerance)
- [sourceLength](#sourcelength)
- [translationLength](#translationlength)
- [minLength](#minlength)
- [maxLength](#maxlength)
- [htmlTagPattern](#htmltagpattern)
- [matches](#matches)
- [normalized](#normalized)
- [patterns](#patterns)
- [elements](#elements)
- [matches](#matches)
- [specialChars](#specialchars)
- [issues](#issues)
- [sourceHtmlTags](#sourcehtmltags)
- [translationHtmlTags](#translationhtmltags)
- [missingTags](#missingtags)
- [extraTags](#extratags)
- [sourceMarkdown](#sourcemarkdown)
- [translationMarkdown](#translationmarkdown)
- [sourceMarkdownTypes](#sourcemarkdowntypes)
- [translationMarkdownTypes](#translationmarkdowntypes)
- [sourceSpecialChars](#sourcespecialchars)
- [translationSpecialChars](#translationspecialchars)
- [targetLanguage](#targetlanguage)
- [rules](#rules)
- [issues](#issues)
- [lowerTranslation](#lowertranslation)
- [inappropriateCount](#inappropriatecount)
- [sensitiveCount](#sensitivecount)
- [issues](#issues)
- [foundMarkers](#foundmarkers)
- [sourceWords](#sourcewords)
- [translationWords](#translationwords)
- [commonWords](#commonwords)
- [sentences](#sentences)
- [inconsistentSentences](#inconsistentsentences)
- [issues](#issues)
- [sourceEndsWithPeriod](#sourceendswithperiod)
- [translationEndsWithPeriod](#translationendswithperiod)
- [sourceQuestions](#sourcequestions)
- [translationQuestions](#translationquestions)
- [sourceExclamations](#sourceexclamations)
- [translationExclamations](#translationexclamations)
- [politeEndings](#politeendings)
- [casualEndings](#casualendings)
- [targetLanguage](#targetlanguage)
- [issues](#issues)
- [capitalizationResult](#capitalizationresult)
- [punctuationResult](#punctuationresult)
- [politenessResult](#politenessresult)
- [RuleClass](#ruleclass)
- [validationRuleFactory](#validationrulefactory)

---

## ParameterConsistencyRule

### コンストラクタ

```javascript
new ParameterConsistencyRule()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `name` | 説明なし |
| `description` | 説明なし |
| `severity` | 説明なし |

### メソッド

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

## LengthValidationRule

### コンストラクタ

```javascript
new LengthValidationRule()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `name` | 説明なし |
| `description` | 説明なし |
| `severity` | 説明なし |
| `lengthTolerances` | 言語別の長さ許容率 |

### メソッド

#### calculateTextLength

**シグネチャ**:
```javascript
 calculateTextLength(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTextLength(text);

// calculateTextLengthの実用的な使用例
const result = instance.calculateTextLength(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validate

**シグネチャ**:
```javascript
 validate(sourceText, translationText, context = {})
```

**パラメーター**:
- `sourceText`
- `translationText`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(sourceText, translationText, context = {});

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!sourceText || !translationText)
```

**パラメーター**:
- `!sourceText || !translationText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!sourceText || !translationText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

短すぎる場合

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

長すぎる場合

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


---

## FormatValidationRule

### コンストラクタ

```javascript
new FormatValidationRule()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `name` | 説明なし |
| `description` | 説明なし |
| `severity` | 説明なし |

### メソッド

#### extractHtmlTags

**シグネチャ**:
```javascript
 extractHtmlTags(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.extractHtmlTags(text);

// extractHtmlTagsの実用的な使用例
const result = instance.extractHtmlTags(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### extractMarkdownElements

**シグネチャ**:
```javascript
 extractMarkdownElements(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.extractMarkdownElements(text);

// extractMarkdownElementsの実用的な使用例
const result = instance.extractMarkdownElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### extractSpecialCharacters

**シグネチャ**:
```javascript
 extractSpecialCharacters(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.extractSpecialCharacters(text);

// extractSpecialCharactersの実用的な使用例
const result = instance.extractSpecialCharacters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validate

**シグネチャ**:
```javascript
 validate(sourceText, translationText, context = {})
```

**パラメーター**:
- `sourceText`
- `translationText`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(sourceText, translationText, context = {});

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!sourceText || !translationText)
```

**パラメーター**:
- `!sourceText || !translationText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!sourceText || !translationText);

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
 if (missingTags.length > 0 || extraTags.length > 0)
```

**パラメーター**:
- `missingTags.length > 0 || extraTags.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(missingTags.length > 0 || extraTags.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (issues.length > 0)
```

**パラメーター**:
- `issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## CulturalAppropriatenessRule

### コンストラクタ

```javascript
new CulturalAppropriatenessRule()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `name` | 説明なし |
| `description` | 説明なし |
| `severity` | 説明なし |
| `culturalRules` | 説明なし |

### メソッド

#### initializeCulturalRules

**シグネチャ**:
```javascript
 initializeCulturalRules()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeCulturalRules();

// initializeCulturalRulesの実用的な使用例
const result = instance.initializeCulturalRules(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validate

**シグネチャ**:
```javascript
 validate(sourceText, translationText, context = {})
```

**パラメーター**:
- `sourceText`
- `translationText`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(sourceText, translationText, context = {});

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!translationText)
```

**パラメーター**:
- `!translationText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!translationText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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
 if (issues.length > 0)
```

**パラメーター**:
- `issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (inappropriateCount > 0)
```

**パラメーター**:
- `inappropriateCount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(inappropriateCount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (sensitiveCount > 0)
```

**パラメーター**:
- `sensitiveCount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sensitiveCount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addCulturalRule

**シグネチャ**:
```javascript
 addCulturalRule(language, type, rule)
```

**パラメーター**:
- `language`
- `type`
- `rule`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addCulturalRule(language, type, rule);

// addCulturalRuleの実用的な使用例
const result = instance.addCulturalRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.culturalRules[language])
```

**パラメーター**:
- `!this.culturalRules[language]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.culturalRules[language]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.culturalRules[language][type])
```

**パラメーター**:
- `!this.culturalRules[language][type]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.culturalRules[language][type]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## CompletenessValidationRule

### コンストラクタ

```javascript
new CompletenessValidationRule()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `name` | 説明なし |
| `description` | 説明なし |
| `severity` | 説明なし |
| `untranslatedMarkers` | 説明なし |

### メソッド

#### validate

**シグネチャ**:
```javascript
 validate(sourceText, translationText, context = {})
```

**パラメーター**:
- `sourceText`
- `translationText`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(sourceText, translationText, context = {});

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (foundMarkers.length > 0)
```

**パラメーター**:
- `foundMarkers.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(foundMarkers.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

原文がそのまま含まれていないかチェック

**シグネチャ**:
```javascript
 if (sourceText && sourceText.length > 10)
```

**パラメーター**:
- `sourceText && sourceText.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceText && sourceText.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

極端に短い翻訳のチェック

**シグネチャ**:
```javascript
 if (sourceText && translationText.length < 3 && sourceText.length > 10)
```

**パラメーター**:
- `sourceText && translationText.length < 3 && sourceText.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceText && translationText.length < 3 && sourceText.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (issues.length > 0)
```

**パラメーター**:
- `issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addUntranslatedMarker

**シグネチャ**:
```javascript
 addUntranslatedMarker(marker)
```

**パラメーター**:
- `marker`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addUntranslatedMarker(marker);

// addUntranslatedMarkerの実用的な使用例
const result = instance.addUntranslatedMarker(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## ConsistencyValidationRule

### コンストラクタ

```javascript
new ConsistencyValidationRule()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `name` | 説明なし |
| `description` | 説明なし |
| `severity` | 説明なし |

### メソッド

#### checkCapitalizationConsistency

**シグネチャ**:
```javascript
 checkCapitalizationConsistency(text, language)
```

**パラメーター**:
- `text`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkCapitalizationConsistency(text, language);

// checkCapitalizationConsistencyの実用的な使用例
const result = instance.checkCapitalizationConsistency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (inconsistentSentences.length > 0)
```

**パラメーター**:
- `inconsistentSentences.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(inconsistentSentences.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkPunctuationConsistency

**シグネチャ**:
```javascript
 checkPunctuationConsistency(sourceText, translationText, language)
```

**パラメーター**:
- `sourceText`
- `translationText`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkPunctuationConsistency(sourceText, translationText, language);

// checkPunctuationConsistencyの実用的な使用例
const result = instance.checkPunctuationConsistency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (sourceEndsWithPeriod && !translationEndsWithPeriod)
```

**パラメーター**:
- `sourceEndsWithPeriod && !translationEndsWithPeriod`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceEndsWithPeriod && !translationEndsWithPeriod);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (sourceQuestions !== translationQuestions)
```

**パラメーター**:
- `sourceQuestions !== translationQuestions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceQuestions !== translationQuestions);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (sourceExclamations !== translationExclamations)
```

**パラメーター**:
- `sourceExclamations !== translationExclamations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sourceExclamations !== translationExclamations);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkPolitenessConsistency

**シグネチャ**:
```javascript
 checkPolitenessConsistency(text, language)
```

**パラメーター**:
- `text`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkPolitenessConsistency(text, language);

// checkPolitenessConsistencyの実用的な使用例
const result = instance.checkPolitenessConsistency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (language === 'ja')
```

**パラメーター**:
- `language === 'ja'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(language === 'ja');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (politeEndings.length > 0 && casualEndings.length > 0)
```

**パラメーター**:
- `politeEndings.length > 0 && casualEndings.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(politeEndings.length > 0 && casualEndings.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validate

**シグネチャ**:
```javascript
 validate(sourceText, translationText, context = {})
```

**パラメーター**:
- `sourceText`
- `translationText`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(sourceText, translationText, context = {});

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!translationText)
```

**パラメーター**:
- `!translationText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!translationText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!capitalizationResult.passed)
```

**パラメーター**:
- `!capitalizationResult.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!capitalizationResult.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!punctuationResult.passed)
```

**パラメーター**:
- `!punctuationResult.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!punctuationResult.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!politenessResult.passed)
```

**パラメーター**:
- `!politenessResult.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!politenessResult.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (issues.length > 0)
```

**パラメーター**:
- `issues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(issues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## ValidationRuleFactory

### コンストラクタ

```javascript
new ValidationRuleFactory()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `ruleClasses` | 説明なし |

### メソッド

#### createRule

**シグネチャ**:
```javascript
 createRule(ruleType)
```

**パラメーター**:
- `ruleType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createRule(ruleType);

// createRuleの実用的な使用例
const result = instance.createRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!RuleClass)
```

**パラメーター**:
- `!RuleClass`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!RuleClass);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableRuleTypes

**シグネチャ**:
```javascript
 getAvailableRuleTypes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableRuleTypes();

// getAvailableRuleTypesの実用的な使用例
const result = instance.getAvailableRuleTypes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerRule

**シグネチャ**:
```javascript
 registerRule(ruleType, RuleClass)
```

**パラメーター**:
- `ruleType`
- `RuleClass`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerRule(ruleType, RuleClass);

// registerRuleの実用的な使用例
const result = instance.registerRule(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `patterns` | 説明なし |
| `params` | 説明なし |
| `regex` | 説明なし |
| `sourceParams` | 説明なし |
| `translationParams` | 説明なし |
| `missingParams` | 説明なし |
| `extraParams` | 説明なし |
| `issues` | 説明なし |
| `normalized` | 説明なし |
| `segmenter` | 説明なし |
| `segments` | 説明なし |
| `targetLanguage` | 説明なし |
| `tolerance` | 説明なし |
| `sourceLength` | 説明なし |
| `translationLength` | 説明なし |
| `minLength` | 説明なし |
| `maxLength` | 説明なし |
| `htmlTagPattern` | 説明なし |
| `matches` | 説明なし |
| `normalized` | 説明なし |
| `patterns` | 説明なし |
| `elements` | 説明なし |
| `matches` | 説明なし |
| `specialChars` | 説明なし |
| `issues` | 説明なし |
| `sourceHtmlTags` | 説明なし |
| `translationHtmlTags` | 説明なし |
| `missingTags` | 説明なし |
| `extraTags` | 説明なし |
| `sourceMarkdown` | 説明なし |
| `translationMarkdown` | 説明なし |
| `sourceMarkdownTypes` | 説明なし |
| `translationMarkdownTypes` | 説明なし |
| `sourceSpecialChars` | 説明なし |
| `translationSpecialChars` | 説明なし |
| `targetLanguage` | 説明なし |
| `rules` | 説明なし |
| `issues` | 説明なし |
| `lowerTranslation` | 説明なし |
| `inappropriateCount` | 説明なし |
| `sensitiveCount` | 説明なし |
| `issues` | 説明なし |
| `foundMarkers` | 説明なし |
| `sourceWords` | 説明なし |
| `translationWords` | 説明なし |
| `commonWords` | 説明なし |
| `sentences` | 説明なし |
| `inconsistentSentences` | 説明なし |
| `issues` | 説明なし |
| `sourceEndsWithPeriod` | 説明なし |
| `translationEndsWithPeriod` | 説明なし |
| `sourceQuestions` | 説明なし |
| `translationQuestions` | 説明なし |
| `sourceExclamations` | 説明なし |
| `translationExclamations` | 説明なし |
| `politeEndings` | 説明なし |
| `casualEndings` | 説明なし |
| `targetLanguage` | 説明なし |
| `issues` | 説明なし |
| `capitalizationResult` | 説明なし |
| `punctuationResult` | 説明なし |
| `politenessResult` | 説明なし |
| `RuleClass` | 説明なし |
| `validationRuleFactory` | デフォルトファクトリーインスタンス |

---

