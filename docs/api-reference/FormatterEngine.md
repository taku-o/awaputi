# FormatterEngine

## 概要

ファイル: `core/i18n/FormatterEngine.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [FormatterEngine](#formatterengine)
- [NumberFormatter](#numberformatter)
- [DateFormatter](#dateformatter)
- [CurrencyFormatter](#currencyformatter)
- [RelativeTimeFormatter](#relativetimeformatter)
- [ListFormatter](#listformatter)
- [PluralFormatter](#pluralformatter)
## 定数
- [value](#value)
- [value](#value)
- [value](#value)
- [value](#value)
- [value](#value)
- [count](#count)
- [baseText](#basetext)
- [settings](#settings)
- [value](#value)
- [value](#value)
- [value](#value)
- [value](#value)
- [regionalStats](#regionalstats)
- [number](#number)
- [locale](#locale)
- [number](#number)
- [decimalSeparator](#decimalseparator)
- [thousandsSeparator](#thousandsseparator)
- [parts](#parts)
- [localeMap](#localemap)
- [date](#date)
- [locale](#locale)
- [formatOptions](#formatoptions)
- [date](#date)
- [formatPattern](#formatpattern)
- [year](#year)
- [month](#month)
- [day](#day)
- [weekday](#weekday)
- [monthNames](#monthnames)
- [monthName](#monthname)
- [date](#date)
- [formatPattern](#formatpattern)
- [hours24](#hours24)
- [hours12](#hours12)
- [minutes](#minutes)
- [seconds](#seconds)
- [ampm](#ampm)
- [localeMap](#localemap)
- [number](#number)
- [locale](#locale)
- [currencyCode](#currencycode)
- [currencyCode](#currencycode)
- [localeMap](#localemap)
- [number](#number)
- [symbol](#symbol)
- [code](#code)
- [position](#position)
- [space](#space)
- [formattedNumber](#formattednumber)
- [sign](#sign)
- [code](#code)
- [currencyMap](#currencymap)
- [key](#key)
- [date](#date)
- [now](#now)
- [diffMs](#diffms)
- [locale](#locale)
- [rtf](#rtf)
- [absDiff](#absdiff)
- [seconds](#seconds)
- [minutes](#minutes)
- [hours](#hours)
- [days](#days)
- [localeMap](#localemap)
- [locale](#locale)
- [formatOptions](#formatoptions)
- [localeMap](#localemap)
- [number](#number)
- [rules](#rules)
- [rule](#rule)

---

## FormatterEngine

### コンストラクタ

```javascript
new FormatterEngine()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `formatters` | 説明なし |
| `regionalSettingsManager` | 地域設定マネージャーの参照 |

### メソッド

#### format

**シグネチャ**:
```javascript
 format(text, params, language, region = null)
```

**パラメーター**:
- `text`
- `params`
- `language`
- `region = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.format(text, params, language, region = null);

// formatの実用的な使用例
const result = instance.format(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof text !== 'string')
```

**パラメーター**:
- `typeof text !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof text !== 'string');

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

#### replaceParameters

**シグネチャ**:
```javascript
 replaceParameters(text, params)
```

**パラメーター**:
- `text`
- `params`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.replaceParameters(text, params);

// replaceParametersの実用的な使用例
const result = instance.replaceParameters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyRegionalFormatting

**シグネチャ**:
```javascript
 applyRegionalFormatting(text, params, language, region)
```

**パラメーター**:
- `text`
- `params`
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyRegionalFormatting(text, params, language, region);

// applyRegionalFormattingの実用的な使用例
const result = instance.applyRegionalFormatting(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processSpecialFormats

**シグネチャ**:
```javascript
 processSpecialFormats(text, params, language)
```

**パラメーター**:
- `text`
- `params`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processSpecialFormats(text, params, language);

// processSpecialFormatsの実用的な使用例
const result = instance.processSpecialFormats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (count !== undefined && baseText !== undefined)
```

**パラメーター**:
- `count !== undefined && baseText !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(count !== undefined && baseText !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addFormatter

**シグネチャ**:
```javascript
 addFormatter(name, formatter)
```

**パラメーター**:
- `name`
- `formatter`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addFormatter(name, formatter);

// addFormatterの実用的な使用例
const result = instance.addFormatter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof formatter.format !== 'function')
```

**パラメーター**:
- `typeof formatter.format !== 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof formatter.format !== 'function');

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

#### removeFormatter

**シグネチャ**:
```javascript
 removeFormatter(name)
```

**パラメーター**:
- `name`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeFormatter(name);

// removeFormatterの実用的な使用例
const result = instance.removeFormatter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailableFormatters

**シグネチャ**:
```javascript
 getAvailableFormatters()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableFormatters();

// getAvailableFormattersの実用的な使用例
const result = instance.getAvailableFormatters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatWithRegionalSettings

**シグネチャ**:
```javascript
 formatWithRegionalSettings(text, params, language, region = null)
```

**パラメーター**:
- `text`
- `params`
- `language`
- `region = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatWithRegionalSettings(text, params, language, region = null);

// formatWithRegionalSettingsの実用的な使用例
const result = instance.formatWithRegionalSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof text !== 'string')
```

**パラメーター**:
- `typeof text !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof text !== 'string');

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

#### applyAdvancedRegionalFormatting

**シグネチャ**:
```javascript
 applyAdvancedRegionalFormatting(text, params, settings)
```

**パラメーター**:
- `text`
- `params`
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyAdvancedRegionalFormatting(text, params, settings);

// applyAdvancedRegionalFormattingの実用的な使用例
const result = instance.applyAdvancedRegionalFormatting(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRegionalSettings

**シグネチャ**:
```javascript
 getRegionalSettings(language, region = null)
```

**パラメーター**:
- `language`
- `region = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRegionalSettings(language, region = null);

// getRegionalSettingsの実用的な使用例
const result = instance.getRegionalSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFormatterStats

**シグネチャ**:
```javascript
 getFormatterStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFormatterStats();

// getFormatterStatsの実用的な使用例
const result = instance.getFormatterStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## NumberFormatter

### メソッド

#### format

**シグネチャ**:
```javascript
 format(value, language, region)
```

**パラメーター**:
- `value`
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.format(value, language, region);

// formatの実用的な使用例
const result = instance.format(/* 適切なパラメータ */);
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

#### formatWithSettings

**シグネチャ**:
```javascript
 formatWithSettings(value, numberFormatSettings, format = 'default')
```

**パラメーター**:
- `value`
- `numberFormatSettings`
- `format = 'default'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatWithSettings(value, numberFormatSettings, format = 'default');

// formatWithSettingsの実用的な使用例
const result = instance.formatWithSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

小数点記号の置換

**シグネチャ**:
```javascript
 if (parts.length > 1)
```

**パラメーター**:
- `parts.length > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(parts.length > 1);

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

#### getLocale

**シグネチャ**:
```javascript
 getLocale(language, region)
```

**パラメーター**:
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLocale(language, region);

// getLocaleの実用的な使用例
const result = instance.getLocale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (region)
```

**パラメーター**:
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(region);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## DateFormatter

### メソッド

#### format

**シグネチャ**:
```javascript
 format(value, language, region, options = {})
```

**パラメーター**:
- `value`
- `language`
- `region`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.format(value, language, region, options = {});

// formatの実用的な使用例
const result = instance.format(/* 適切なパラメータ */);
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

#### formatWithSettings

**シグネチャ**:
```javascript
 formatWithSettings(value, dateFormatSettings, format = 'medium', regionInfo = {})
```

**パラメーター**:
- `value`
- `dateFormatSettings`
- `format = 'medium'`
- `regionInfo = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatWithSettings(value, dateFormatSettings, format = 'medium', regionInfo = {});

// formatWithSettingsの実用的な使用例
const result = instance.formatWithSettings(/* 適切なパラメータ */);
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

#### formatTimeWithSettings

**シグネチャ**:
```javascript
 formatTimeWithSettings(value, timeFormatSettings, format = 'medium', regionInfo = {})
```

**パラメーター**:
- `value`
- `timeFormatSettings`
- `format = 'medium'`
- `regionInfo = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatTimeWithSettings(value, timeFormatSettings, format = 'medium', regionInfo = {});

// formatTimeWithSettingsの実用的な使用例
const result = instance.formatTimeWithSettings(/* 適切なパラメータ */);
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

#### getMonthNames

**シグネチャ**:
```javascript
 getMonthNames(regionInfo)
```

**パラメーター**:
- `regionInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMonthNames(regionInfo);

// getMonthNamesの実用的な使用例
const result = instance.getMonthNames(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getLocale

**シグネチャ**:
```javascript
 getLocale(language, region)
```

**パラメーター**:
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLocale(language, region);

// getLocaleの実用的な使用例
const result = instance.getLocale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (region)
```

**パラメーター**:
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(region);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## CurrencyFormatter

### メソッド

#### format

**シグネチャ**:
```javascript
 format(value, language, region, currency = null)
```

**パラメーター**:
- `value`
- `language`
- `region`
- `currency = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.format(value, language, region, currency = null);

// formatの実用的な使用例
const result = instance.format(/* 適切なパラメータ */);
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

#### getLocale

**シグネチャ**:
```javascript
 getLocale(language, region)
```

**パラメーター**:
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLocale(language, region);

// getLocaleの実用的な使用例
const result = instance.getLocale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (region)
```

**パラメーター**:
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(region);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatWithSettings

**シグネチャ**:
```javascript
 formatWithSettings(value, currencyFormatSettings, format = 'default')
```

**パラメーター**:
- `value`
- `currencyFormatSettings`
- `format = 'default'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatWithSettings(value, currencyFormatSettings, format = 'default');

// formatWithSettingsの実用的な使用例
const result = instance.formatWithSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (position === 'before')
```

**パラメーター**:
- `position === 'before'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(position === 'before');

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

#### getCurrencyCode

**シグネチャ**:
```javascript
 getCurrencyCode(language, region)
```

**パラメーター**:
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrencyCode(language, region);

// getCurrencyCodeの実用的な使用例
const result = instance.getCurrencyCode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## RelativeTimeFormatter

### メソッド

#### format

**シグネチャ**:
```javascript
 format(value, language, region)
```

**パラメーター**:
- `value`
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.format(value, language, region);

// formatの実用的な使用例
const result = instance.format(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absDiff < 60000)
```

**パラメーター**:
- `absDiff < 60000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absDiff < 60000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absDiff < 3600000)
```

**パラメーター**:
- `absDiff < 3600000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absDiff < 3600000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (absDiff < 86400000)
```

**パラメーター**:
- `absDiff < 86400000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(absDiff < 86400000);

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

#### getLocale

**シグネチャ**:
```javascript
 getLocale(language, region)
```

**パラメーター**:
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLocale(language, region);

// getLocaleの実用的な使用例
const result = instance.getLocale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (region)
```

**パラメーター**:
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(region);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## ListFormatter

### メソッド

#### format

**シグネチャ**:
```javascript
 format(value, language, region, options = {})
```

**パラメーター**:
- `value`
- `language`
- `region`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.format(value, language, region, options = {});

// formatの実用的な使用例
const result = instance.format(/* 適切なパラメータ */);
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

#### getLocale

**シグネチャ**:
```javascript
 getLocale(language, region)
```

**パラメーター**:
- `language`
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLocale(language, region);

// getLocaleの実用的な使用例
const result = instance.getLocale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (region)
```

**パラメーター**:
- `region`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(region);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## PluralFormatter

### メソッド

#### format

**シグネチャ**:
```javascript
 format(text, count, language)
```

**パラメーター**:
- `text`
- `count`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.format(text, count, language);

// formatの実用的な使用例
const result = instance.format(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

テキストが複数形ルールを含む場合

**シグネチャ**:
```javascript
 if (typeof text === 'object' && text !== null)
```

**パラメーター**:
- `typeof text === 'object' && text !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof text === 'object' && text !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

シンプル複数形ルール（英語）

**シグネチャ**:
```javascript
 if (language === 'en')
```

**パラメーター**:
- `language === 'en'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(language === 'en');

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

#### getPluralRules

**シグネチャ**:
```javascript
 getPluralRules(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPluralRules(language);

// getPluralRulesの実用的な使用例
const result = instance.getPluralRules(/* 適切なパラメータ */);
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

#### makeEnglishPlural

**シグネチャ**:
```javascript
 makeEnglishPlural(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.makeEnglishPlural(text);

// makeEnglishPluralの実用的な使用例
const result = instance.makeEnglishPlural(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `value` | 説明なし |
| `value` | 説明なし |
| `value` | 説明なし |
| `value` | 説明なし |
| `value` | 説明なし |
| `count` | 説明なし |
| `baseText` | 説明なし |
| `settings` | 説明なし |
| `value` | 説明なし |
| `value` | 説明なし |
| `value` | 説明なし |
| `value` | 説明なし |
| `regionalStats` | 説明なし |
| `number` | 説明なし |
| `locale` | 説明なし |
| `number` | 説明なし |
| `decimalSeparator` | 説明なし |
| `thousandsSeparator` | 説明なし |
| `parts` | 説明なし |
| `localeMap` | 説明なし |
| `date` | 説明なし |
| `locale` | 説明なし |
| `formatOptions` | 説明なし |
| `date` | 説明なし |
| `formatPattern` | 説明なし |
| `year` | 説明なし |
| `month` | 説明なし |
| `day` | 説明なし |
| `weekday` | 説明なし |
| `monthNames` | 説明なし |
| `monthName` | 説明なし |
| `date` | 説明なし |
| `formatPattern` | 説明なし |
| `hours24` | 説明なし |
| `hours12` | 説明なし |
| `minutes` | 説明なし |
| `seconds` | 説明なし |
| `ampm` | 説明なし |
| `localeMap` | 説明なし |
| `number` | 説明なし |
| `locale` | 説明なし |
| `currencyCode` | 説明なし |
| `currencyCode` | 説明なし |
| `localeMap` | 説明なし |
| `number` | 説明なし |
| `symbol` | 説明なし |
| `code` | 説明なし |
| `position` | 説明なし |
| `space` | 説明なし |
| `formattedNumber` | 説明なし |
| `sign` | 説明なし |
| `code` | 説明なし |
| `currencyMap` | 説明なし |
| `key` | 説明なし |
| `date` | 説明なし |
| `now` | 説明なし |
| `diffMs` | 説明なし |
| `locale` | 説明なし |
| `rtf` | 説明なし |
| `absDiff` | 説明なし |
| `seconds` | 説明なし |
| `minutes` | 説明なし |
| `hours` | 説明なし |
| `days` | 説明なし |
| `localeMap` | 説明なし |
| `locale` | 説明なし |
| `formatOptions` | 説明なし |
| `localeMap` | 説明なし |
| `number` | 説明なし |
| `rules` | 説明なし |
| `rule` | 説明なし |

---

