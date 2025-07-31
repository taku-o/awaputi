# RTLLanguageDetector

## 概要

ファイル: `core/i18n/rtl/RTLLanguageDetector.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [RTLLanguageDetector](#rtllanguagedetector)
## 関数
- [getRTLLanguageDetector()](#getrtllanguagedetector)
## 定数
- [primaryLanguage](#primarylanguage)
- [charCode](#charcode)
- [charCode](#charcode)
- [totalDirectionalChars](#totaldirectionalchars)
- [rtlRatio](#rtlratio)
- [confidence](#confidence)
- [segmentDirection](#segmentdirection)
- [settings](#settings)
- [css](#css)
- [rtlCSS](#rtlcss)
- [handleInput](#handleinput)
- [text](#text)
- [direction](#direction)
- [info](#info)
- [primaryLanguage](#primarylanguage)
- [primaryLanguage](#primarylanguage)

---

## RTLLanguageDetector

### コンストラクタ

```javascript
new RTLLanguageDetector()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `rtlLanguages` | RTL言語の定義 |
| `rtlCharacterRanges` | RTL文字の Unicode 範囲 |
| `bidiControlChars` | 双方向テキスト制御文字 |
| `rtlSettings` | RTL言語特有の設定 |

### メソッド

#### isRTLLanguage

**シグネチャ**:
```javascript
 isRTLLanguage(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isRTLLanguage(language);

// isRTLLanguageの実用的な使用例
const result = instance.isRTLLanguage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### containsRTLCharacters

**シグネチャ**:
```javascript
 containsRTLCharacters(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.containsRTLCharacters(text);

// containsRTLCharactersの実用的な使用例
const result = instance.containsRTLCharacters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < text.length; i++)
```

**パラメーター**:
- `let i = 0; i < text.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < text.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [start, end] of this.rtlCharacterRanges)
```

**パラメーター**:
- `const [start`
- `end] of this.rtlCharacterRanges`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [start, end] of this.rtlCharacterRanges);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (charCode >= start && charCode <= end)
```

**パラメーター**:
- `charCode >= start && charCode <= end`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(charCode >= start && charCode <= end);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectTextDirection

**シグネチャ**:
```javascript
 detectTextDirection(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectTextDirection(text);

// detectTextDirectionの実用的な使用例
const result = instance.detectTextDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!text || typeof text !== 'string')
```

**パラメーター**:
- `!text || typeof text !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!text || typeof text !== 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < text.length; i++)
```

**パラメーター**:
- `let i = 0; i < text.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < text.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (totalDirectionalChars === 0)
```

**パラメーター**:
- `totalDirectionalChars === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(totalDirectionalChars === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateBidiText

**シグネチャ**:
```javascript
 generateBidiText(segments)
```

**パラメーター**:
- `segments`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateBidiText(segments);

// generateBidiTextの実用的な使用例
const result = instance.generateBidiText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const segment of segments)
```

**パラメーター**:
- `const segment of segments`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const segment of segments);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (segmentDirection === 'rtl')
```

**パラメーター**:
- `segmentDirection === 'rtl'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(segmentDirection === 'rtl');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRTLCSS

**シグネチャ**:
```javascript
 generateRTLCSS(language, options = {})
```

**パラメーター**:
- `language`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRTLCSS(language, options = {});

// generateRTLCSSの実用的な使用例
const result = instance.generateRTLCSS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本方向設定

**シグネチャ**:
```javascript
 if (includeLayout)
```

**パラメーター**:
- `includeLayout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(includeLayout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タイポグラフィ設定

**シグネチャ**:
```javascript
 if (includeTypography && settings)
```

**パラメーター**:
- `includeTypography && settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(includeTypography && settings);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.wordSpacing !== 'normal')
```

**パラメーター**:
- `settings.wordSpacing !== 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.wordSpacing !== 'normal');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.letterSpacing !== 'normal')
```

**パラメーター**:
- `settings.letterSpacing !== 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.letterSpacing !== 'normal');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

間隔設定

**シグネチャ**:
```javascript
 if (includeSpacing)
```

**パラメーター**:
- `includeSpacing`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(includeSpacing);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyRTLToElement

**シグネチャ**:
```javascript
 applyRTLToElement(element, language, options = {})
```

**パラメーター**:
- `element`
- `language`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyRTLToElement(element, language, options = {});

// applyRTLToElementの実用的な使用例
const result = instance.applyRTLToElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

追加のスタイル適用

**シグネチャ**:
```javascript
 if (rtlCSS.settings)
```

**パラメーター**:
- `rtlCSS.settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rtlCSS.settings);

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

#### handleRTLInput

**シグネチャ**:
```javascript
 handleRTLInput(inputElement, language)
```

**パラメーター**:
- `inputElement`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleRTLInput(inputElement, language);

// handleRTLInputの実用的な使用例
const result = instance.handleRTLInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

動的方向調整

**シグネチャ**:
```javascript
 if (direction.confidence > 0.7)
```

**パラメーター**:
- `direction.confidence > 0.7`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(direction.confidence > 0.7);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isRTLCharacter

**シグネチャ**:
```javascript
 isRTLCharacter(charCode)
```

**パラメーター**:
- `charCode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isRTLCharacter(charCode);

// isRTLCharacterの実用的な使用例
const result = instance.isRTLCharacter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [start, end] of this.rtlCharacterRanges)
```

**パラメーター**:
- `const [start`
- `end] of this.rtlCharacterRanges`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [start, end] of this.rtlCharacterRanges);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (charCode >= start && charCode <= end)
```

**パラメーター**:
- `charCode >= start && charCode <= end`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(charCode >= start && charCode <= end);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isLTRCharacter

**シグネチャ**:
```javascript
 isLTRCharacter(charCode)
```

**パラメーター**:
- `charCode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isLTRCharacter(charCode);

// isLTRCharacterの実用的な使用例
const result = instance.isLTRCharacter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRTLLanguageInfo

**シグネチャ**:
```javascript
 getRTLLanguageInfo(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRTLLanguageInfo(language);

// getRTLLanguageInfoの実用的な使用例
const result = instance.getRTLLanguageInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getSupportedRTLLanguages

**シグネチャ**:
```javascript
 getSupportedRTLLanguages()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getSupportedRTLLanguages();

// getSupportedRTLLanguagesの実用的な使用例
const result = instance.getSupportedRTLLanguages(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBidiControlCharacters

**シグネチャ**:
```javascript
 getBidiControlCharacters()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBidiControlCharacters();

// getBidiControlCharactersの実用的な使用例
const result = instance.getBidiControlCharacters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRTLSettings

**シグネチャ**:
```javascript
 getRTLSettings(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRTLSettings(language);

// getRTLSettingsの実用的な使用例
const result = instance.getRTLSettings(/* 適切なパラメータ */);
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


---

## getRTLLanguageDetector

**シグネチャ**:
```javascript
getRTLLanguageDetector()
```

**使用例**:
```javascript
const result = getRTLLanguageDetector();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `primaryLanguage` | 説明なし |
| `charCode` | 説明なし |
| `charCode` | 説明なし |
| `totalDirectionalChars` | 説明なし |
| `rtlRatio` | 説明なし |
| `confidence` | 説明なし |
| `segmentDirection` | 説明なし |
| `settings` | 説明なし |
| `css` | 説明なし |
| `rtlCSS` | 説明なし |
| `handleInput` | 説明なし |
| `text` | 説明なし |
| `direction` | 説明なし |
| `info` | 説明なし |
| `primaryLanguage` | 説明なし |
| `primaryLanguage` | 説明なし |

---

