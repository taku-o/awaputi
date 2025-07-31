# KoreanInputHandler

## 概要

ファイル: `core/i18n/KoreanInputHandler.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [KoreanInputHandler](#koreaninputhandler)
## 関数
- [getKoreanInputHandler()](#getkoreaninputhandler)
## 定数
- [languages](#languages)
- [handlers](#handlers)
- [handlers](#handlers)
- [analyzed](#analyzed)
- [analysis](#analysis)
- [suggestions](#suggestions)
- [text](#text)
- [fixed](#fixed)
- [spaced](#spaced)
- [hangulRegex](#hangulregex)
- [results](#results)
- [code](#code)
- [offset](#offset)
- [chosungIndex](#chosungindex)
- [jungsungIndex](#jungsungindex)
- [jongsungIndex](#jongsungindex)
- [simplePatterns](#simplepatterns)
- [input](#input)
- [text](#text)
- [cursorPos](#cursorpos)
- [particles](#particles)
- [pattern](#pattern)
- [particles](#particles)
- [regex](#regex)
- [analysis](#analysis)
- [code](#code)
- [commonWords](#commonwords)
- [firstChar](#firstchar)
- [chosungIndex](#chosungindex)
- [jungsungIndex](#jungsungindex)
- [jongsungIndex](#jongsungindex)
- [code](#code)
- [code](#code)
- [offset](#offset)
- [chosungIndex](#chosungindex)
- [jungsungIndex](#jungsungindex)
- [jongsungIndex](#jongsungindex)

---

## KoreanInputHandler

### コンストラクタ

```javascript
new KoreanInputHandler()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `chosung` | ハングル文字の構成要素 |
| `jungsung` | 説明なし |
| `jongsung` | 説明なし |
| `HANGUL_START` | ハングル文字コード範囲 |
| `HANGUL_END` | 가 |
| `isComposing` | IME状態管理 |
| `compositionText` | 説明なし |
| `optimizationSettings` | 입력 최적화 설정 |
| `inputListeners` | 이벤트 리스너 |
| `isComposing` | 説明なし |
| `compositionText` | 説明なし |
| `compositionText` | 説明なし |
| `isComposing` | 説明なし |
| `compositionText` | 説明なし |

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

#### detectKoreanIME

**シグネチャ**:
```javascript
 detectKoreanIME()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectKoreanIME();

// detectKoreanIMEの実用的な使用例
const result = instance.detectKoreanIME(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### attachToInput

**シグネチャ**:
```javascript
 attachToInput(inputElement)
```

**パラメーター**:
- `inputElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.attachToInput(inputElement);

// attachToInputの実用的な使用例
const result = instance.attachToInput(/* 適切なパラメータ */);
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

#### detachFromInput

**シグネチャ**:
```javascript
 detachFromInput(inputElement)
```

**パラメーター**:
- `inputElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detachFromInput(inputElement);

// detachFromInputの実用的な使用例
const result = instance.detachFromInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!handlers)
```

**パラメーター**:
- `!handlers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!handlers);

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

#### applyKoreanInputAttributes

**シグネチャ**:
```javascript
 applyKoreanInputAttributes(inputElement)
```

**パラメーター**:
- `inputElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyKoreanInputAttributes(inputElement);

// applyKoreanInputAttributesの実用的な使用例
const result = instance.applyKoreanInputAttributes(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

자동 완성 설정

**シグネチャ**:
```javascript
 if (this.optimizationSettings.autoComplete)
```

**パラメーター**:
- `this.optimizationSettings.autoComplete`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimizationSettings.autoComplete);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleCompositionStart

**シグネチャ**:
```javascript
 handleCompositionStart(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleCompositionStart(event);

// handleCompositionStartの実用的な使用例
const result = instance.handleCompositionStart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleCompositionUpdate

**シグネチャ**:
```javascript
 handleCompositionUpdate(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleCompositionUpdate(event);

// handleCompositionUpdateの実用的な使用例
const result = instance.handleCompositionUpdate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleCompositionEnd

**シグネチャ**:
```javascript
 handleCompositionEnd(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleCompositionEnd(event);

// handleCompositionEndの実用的な使用例
const result = instance.handleCompositionEnd(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleInput

**シグネチャ**:
```javascript
 handleInput(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleInput(event);

// handleInputの実用的な使用例
const result = instance.handleInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Composition 중이 아닐 때만 처리

**シグネチャ**:
```javascript
 if (!this.isComposing && event.target.value)
```

**パラメーター**:
- `!this.isComposing && event.target.value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.isComposing && event.target.value);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleKeyDown

**シグネチャ**:
```javascript
 handleKeyDown(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleKeyDown(event);

// handleKeyDownの実用的な使用例
const result = instance.handleKeyDown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

한국어 입력 중 특수 키 처리

**シグネチャ**:
```javascript
 if (this.isComposing)
```

**パラメーター**:
- `this.isComposing`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isComposing);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Space 키로 조합 완료

**シグネチャ**:
```javascript
 if (event.key === ' ' && this.optimizationSettings.smartSpacing)
```

**パラメーター**:
- `event.key === ' ' && this.optimizationSettings.smartSpacing`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.key === ' ' && this.optimizationSettings.smartSpacing);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processKoreanInput

**シグネチャ**:
```javascript
 processKoreanInput(text, inputElement)
```

**パラメーター**:
- `text`
- `inputElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processKoreanInput(text, inputElement);

// processKoreanInputの実用的な使用例
const result = instance.processKoreanInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

최적화 적용

**シグネチャ**:
```javascript
 if (this.optimizationSettings.autoComplete)
```

**パラメーター**:
- `this.optimizationSettings.autoComplete`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimizationSettings.autoComplete);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (suggestions.length > 0)
```

**パラメーター**:
- `suggestions.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(suggestions.length > 0);

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

#### optimizeKoreanText

**シグネチャ**:
```javascript
 optimizeKoreanText(inputElement)
```

**パラメーター**:
- `inputElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeKoreanText(inputElement);

// optimizeKoreanTextの実用的な使用例
const result = instance.optimizeKoreanText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fixed !== text)
```

**パラメーター**:
- `fixed !== text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fixed !== text);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

띄어쓰기 최적화

**シグネチャ**:
```javascript
 if (this.optimizationSettings.smartSpacing)
```

**パラメーター**:
- `this.optimizationSettings.smartSpacing`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimizationSettings.smartSpacing);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (spaced !== inputElement.value)
```

**パラメーター**:
- `spaced !== inputElement.value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(spaced !== inputElement.value);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isHangul

**シグネチャ**:
```javascript
 isHangul(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isHangul(text);

// isHangulの実用的な使用例
const result = instance.isHangul(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeHangul

**シグネチャ**:
```javascript
 analyzeHangul(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeHangul(text);

// analyzeHangulの実用的な使用例
const result = instance.analyzeHangul(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const char of text)
```

**パラメーター**:
- `const char of text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const char of text);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (code >= this.HANGUL_START && code <= this.HANGUL_END)
```

**パラメーター**:
- `code >= this.HANGUL_START && code <= this.HANGUL_END`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(code >= this.HANGUL_START && code <= this.HANGUL_END);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getJamoType

**シグネチャ**:
```javascript
 getJamoType(char)
```

**パラメーター**:
- `char`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getJamoType(char);

// getJamoTypeの実用的な使用例
const result = instance.getJamoType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### fixSeparatedJamo

**シグネチャ**:
```javascript
 fixSeparatedJamo(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.fixSeparatedJamo(text);

// fixSeparatedJamoの実用的な使用例
const result = instance.fixSeparatedJamo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleSmartSpacing

**シグネチャ**:
```javascript
 handleSmartSpacing(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleSmartSpacing(event);

// handleSmartSpacingの実用的な使用例
const result = instance.handleSmartSpacing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeSpacing

**シグネチャ**:
```javascript
 optimizeSpacing(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeSpacing(text);

// optimizeSpacingの実用的な使用例
const result = instance.optimizeSpacing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeKoreanText

**シグネチャ**:
```javascript
 analyzeKoreanText(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeKoreanText(text);

// analyzeKoreanTextの実用的な使用例
const result = instance.analyzeKoreanText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

음절 수 계산

**シグネチャ**:
```javascript
 for (const char of text)
```

**パラメーター**:
- `const char of text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const char of text);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (code >= this.HANGUL_START && code <= this.HANGUL_END)
```

**パラメーター**:
- `code >= this.HANGUL_START && code <= this.HANGUL_END`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(code >= this.HANGUL_START && code <= this.HANGUL_END);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isJamo

**シグネチャ**:
```javascript
 isJamo(char)
```

**パラメーター**:
- `char`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isJamo(char);

// isJamoの実用的な使用例
const result = instance.isJamo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAutoCompleteSuggestions

**シグネチャ**:
```javascript
 getAutoCompleteSuggestions(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAutoCompleteSuggestions(text);

// getAutoCompleteSuggestionsの実用的な使用例
const result = instance.getAutoCompleteSuggestions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectInputStatistics

**シグネチャ**:
```javascript
 collectInputStatistics(analysis)
```

**パラメーター**:
- `analysis`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectInputStatistics(analysis);

// collectInputStatisticsの実用的な使用例
const result = instance.collectInputStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### composeHangul

**シグネチャ**:
```javascript
 composeHangul(chosung, jungsung, jongsung = '')
```

**パラメーター**:
- `chosung`
- `jungsung`
- `jongsung = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.composeHangul(chosung, jungsung, jongsung = '');

// composeHangulの実用的な使用例
const result = instance.composeHangul(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (chosungIndex === -1 || jungsungIndex === -1 || jongsungIndex === -1)
```

**パラメーター**:
- `chosungIndex === -1 || jungsungIndex === -1 || jongsungIndex === -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(chosungIndex === -1 || jungsungIndex === -1 || jongsungIndex === -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### decomposeHangul

**シグネチャ**:
```javascript
 decomposeHangul(syllable)
```

**パラメーター**:
- `syllable`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.decomposeHangul(syllable);

// decomposeHangulの実用的な使用例
const result = instance.decomposeHangul(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (code < this.HANGUL_START || code > this.HANGUL_END)
```

**パラメーター**:
- `code < this.HANGUL_START || code > this.HANGUL_END`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(code < this.HANGUL_START || code > this.HANGUL_END);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSettings

**シグネチャ**:
```javascript
 updateSettings(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSettings(settings);

// updateSettingsの実用的な使用例
const result = instance.updateSettings(/* 適切なパラメータ */);
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

## getKoreanInputHandler

**シグネチャ**:
```javascript
getKoreanInputHandler()
```

**使用例**:
```javascript
const result = getKoreanInputHandler();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `languages` | 説明なし |
| `handlers` | 説明なし |
| `handlers` | 説明なし |
| `analyzed` | 説明なし |
| `analysis` | 説明なし |
| `suggestions` | 説明なし |
| `text` | 説明なし |
| `fixed` | 説明なし |
| `spaced` | 説明なし |
| `hangulRegex` | 説明なし |
| `results` | 説明なし |
| `code` | 説明なし |
| `offset` | 説明なし |
| `chosungIndex` | 説明なし |
| `jungsungIndex` | 説明なし |
| `jongsungIndex` | 説明なし |
| `simplePatterns` | 説明なし |
| `input` | 説明なし |
| `text` | 説明なし |
| `cursorPos` | 説明なし |
| `particles` | 説明なし |
| `pattern` | 説明なし |
| `particles` | 説明なし |
| `regex` | 説明なし |
| `analysis` | 説明なし |
| `code` | 説明なし |
| `commonWords` | 説明なし |
| `firstChar` | 説明なし |
| `chosungIndex` | 説明なし |
| `jungsungIndex` | 説明なし |
| `jongsungIndex` | 説明なし |
| `code` | 説明なし |
| `code` | 説明なし |
| `offset` | 説明なし |
| `chosungIndex` | 説明なし |
| `jungsungIndex` | 説明なし |
| `jongsungIndex` | 説明なし |

---

