# ConfigurationCommands

## 概要

ファイル: `debug/ConfigurationCommands.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [ConfigurationCommands](#configurationcommands)
## 定数
- [path](#path)
- [value](#value)
- [type](#type)
- [displayValue](#displayvalue)
- [path](#path)
- [valueStr](#valuestr)
- [originalValue](#originalvalue)
- [convertedValue](#convertedvalue)
- [path](#path)
- [defaultValue](#defaultvalue)
- [originalValue](#originalvalue)
- [prefix](#prefix)
- [allConfigs](#allconfigs)
- [filteredConfigs](#filteredconfigs)
- [path](#path)
- [path](#path)
- [json](#json)
- [jsonStr](#jsonstr)
- [importResults](#importresults)
- [errors](#errors)
- [count](#count)
- [recentChanges](#recentchanges)
- [change](#change)
- [time](#time)
- [errors](#errors)
- [path](#path)
- [current](#current)
- [defaults](#defaults)
- [differences](#differences)
- [templateName](#templatename)
- [templates](#templates)
- [template](#template)
- [applyResults](#applyresults)
- [errors](#errors)
- [originalValue](#originalvalue)
- [filtered](#filtered)
- [fullPath](#fullpath)
- [childResult](#childresult)
- [fullPath](#fullpath)
- [originalValue](#originalvalue)
- [differences](#differences)
- [allKeys](#allkeys)
- [currentValue](#currentvalue)
- [defaultValue](#defaultvalue)
- [fullPath](#fullpath)
- [childDiffs](#childdiffs)

---

## ConfigurationCommands

### コンストラクタ

```javascript
new ConfigurationCommands(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `configManager` | 説明なし |
| `originalValues` | 説明なし |
| `changeHistory` | 変更前の値を保存 |
| `changeHistory` | 履歴をクリア |
| `changeHistory` | 説明なし |

### メソッド

#### registerCommands

**シグネチャ**:
```javascript
 registerCommands(console)
```

**パラメーター**:
- `console`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerCommands(console);

// registerCommandsの実用的な使用例
const result = instance.registerCommands(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getConfig

**シグネチャ**:
```javascript
 getConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getConfig(args);

// getConfigの実用的な使用例
const result = instance.getConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value === undefined)
```

**パラメーター**:
- `value === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value === undefined);

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

#### setConfig

**シグネチャ**:
```javascript
 setConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setConfig(args);

// setConfigの実用的な使用例
const result = instance.setConfig(/* 適切なパラメータ */);
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

#### resetConfig

**シグネチャ**:
```javascript
 resetConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetConfig(args);

// resetConfigの実用的な使用例
const result = instance.resetConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (defaultValue === undefined)
```

**パラメーター**:
- `defaultValue === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(defaultValue === undefined);

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

#### listConfig

**シグネチャ**:
```javascript
 listConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.listConfig(args);

// listConfigの実用的な使用例
const result = instance.listConfig(/* 適切なパラメータ */);
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

#### validateConfig

**シグネチャ**:
```javascript
 validateConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateConfig(args);

// validateConfigの実用的な使用例
const result = instance.validateConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (path)
```

**パラメーター**:
- `path`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(path);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (validationResults.isValid)
```

**パラメーター**:
- `validationResults.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(validationResults.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const error of validationResults.errors)
```

**パラメーター**:
- `const error of validationResults.errors`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const error of validationResults.errors);

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

#### exportConfig

**シグネチャ**:
```javascript
 exportConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportConfig(args);

// exportConfigの実用的な使用例
const result = instance.exportConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (path)
```

**パラメーター**:
- `path`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(path);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

クリップボードにコピー（可能であれば）

**シグネチャ**:
```javascript
 if (navigator.clipboard)
```

**パラメーター**:
- `navigator.clipboard`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(navigator.clipboard);

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

#### importConfig

**シグネチャ**:
```javascript
 importConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.importConfig(args);

// importConfigの実用的な使用例
const result = instance.importConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (parseError)
```

**パラメーター**:
- `parseError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(parseError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (importResults.length > 0)
```

**パラメーター**:
- `importResults.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importResults.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const result of importResults)
```

**パラメーター**:
- `const result of importResults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const result of importResults);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (errors.length > 0)
```

**パラメーター**:
- `errors.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(errors.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const error of errors)
```

**パラメーター**:
- `const error of errors`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const error of errors);

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

#### showHistory

**シグネチャ**:
```javascript
 showHistory(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showHistory(args);

// showHistoryの実用的な使用例
const result = instance.showHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.changeHistory.length === 0)
```

**パラメーター**:
- `this.changeHistory.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.changeHistory.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < recentChanges.length; i++)
```

**パラメーター**:
- `let i = 0; i < recentChanges.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < recentChanges.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### revertChanges

**シグネチャ**:
```javascript
 revertChanges()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.revertChanges();

// revertChangesの実用的な使用例
const result = instance.revertChanges(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.originalValues.size === 0)
```

**パラメーター**:
- `this.originalValues.size === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.originalValues.size === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [path, originalValue] of this.originalValues)
```

**パラメーター**:
- `const [path`
- `originalValue] of this.originalValues`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [path, originalValue] of this.originalValues);

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

#### if

**シグネチャ**:
```javascript
 if (errors.length > 0)
```

**パラメーター**:
- `errors.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(errors.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const error of errors)
```

**パラメーター**:
- `const error of errors`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const error of errors);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### diffConfig

**シグネチャ**:
```javascript
 diffConfig(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.diffConfig(args);

// diffConfigの実用的な使用例
const result = instance.diffConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (differences.length === 0)
```

**パラメーター**:
- `differences.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(differences.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const diff of differences)
```

**パラメーター**:
- `const diff of differences`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const diff of differences);

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

#### applyTemplate

**シグネチャ**:
```javascript
 applyTemplate(args)
```

**パラメーター**:
- `args`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyTemplate(args);

// applyTemplateの実用的な使用例
const result = instance.applyTemplate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!template)
```

**パラメーター**:
- `!template`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!template);

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
 for (const result of applyResults)
```

**パラメーター**:
- `const result of applyResults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const result of applyResults);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (errors.length > 0)
```

**パラメーター**:
- `errors.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(errors.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const error of errors)
```

**パラメーター**:
- `const error of errors`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const error of errors);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### convertValue

**シグネチャ**:
```javascript
 convertValue(valueStr)
```

**パラメーター**:
- `valueStr`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.convertValue(valueStr);

// convertValueの実用的な使用例
const result = instance.convertValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filterConfigByPrefix

**シグネチャ**:
```javascript
 filterConfigByPrefix(config, prefix)
```

**パラメーター**:
- `config`
- `prefix`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filterConfigByPrefix(config, prefix);

// filterConfigByPrefixの実用的な使用例
const result = instance.filterConfigByPrefix(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filterConfigRecursive

**シグネチャ**:
```javascript
 filterConfigRecursive(obj, prefix, currentPath, result)
```

**パラメーター**:
- `obj`
- `prefix`
- `currentPath`
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filterConfigRecursive(obj, prefix, currentPath, result);

// filterConfigRecursiveの実用的な使用例
const result = instance.filterConfigRecursive(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof value === 'object' && value !== null)
```

**パラメーター**:
- `typeof value === 'object' && value !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'object' && value !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

子要素が条件を満たす可能性がある

**シグネチャ**:
```javascript
 if (typeof value === 'object' && value !== null)
```

**パラメーター**:
- `typeof value === 'object' && value !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'object' && value !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addConfigToOutput

**シグネチャ**:
```javascript
 addConfigToOutput(config, output, indent)
```

**パラメーター**:
- `config`
- `output`
- `indent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addConfigToOutput(config, output, indent);

// addConfigToOutputの実用的な使用例
const result = instance.addConfigToOutput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof value === 'object' && value !== null)
```

**パラメーター**:
- `typeof value === 'object' && value !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'object' && value !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### importConfigRecursive

**シグネチャ**:
```javascript
 importConfigRecursive(config, basePath, results, errors)
```

**パラメーター**:
- `config`
- `basePath`
- `results`
- `errors`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.importConfigRecursive(config, basePath, results, errors);

// importConfigRecursiveの実用的な使用例
const result = instance.importConfigRecursive(/* 適切なパラメータ */);
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

#### findDifferences

**シグネチャ**:
```javascript
 findDifferences(current, defaults, basePath)
```

**パラメーター**:
- `current`
- `defaults`
- `basePath`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.findDifferences(current, defaults, basePath);

// findDifferencesの実用的な使用例
const result = instance.findDifferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof current === 'object' && current !== null && 
            typeof defaults === 'object' && defaults !== null)
```

**パラメーター**:
- `typeof current === 'object' && current !== null && 
            typeof defaults === 'object' && defaults !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof current === 'object' && current !== null && 
            typeof defaults === 'object' && defaults !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key of allKeys)
```

**パラメーター**:
- `const key of allKeys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key of allKeys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (current !== defaults)
```

**パラメーター**:
- `current !== defaults`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(current !== defaults);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

**シグネチャ**:
```javascript
 destroy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroy();

// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `path` | 説明なし |
| `value` | 説明なし |
| `type` | 説明なし |
| `displayValue` | 説明なし |
| `path` | 説明なし |
| `valueStr` | 説明なし |
| `originalValue` | 説明なし |
| `convertedValue` | 説明なし |
| `path` | 説明なし |
| `defaultValue` | 説明なし |
| `originalValue` | 説明なし |
| `prefix` | 説明なし |
| `allConfigs` | 説明なし |
| `filteredConfigs` | 説明なし |
| `path` | 説明なし |
| `path` | 説明なし |
| `json` | 説明なし |
| `jsonStr` | 説明なし |
| `importResults` | 説明なし |
| `errors` | 説明なし |
| `count` | 説明なし |
| `recentChanges` | 説明なし |
| `change` | 説明なし |
| `time` | 説明なし |
| `errors` | 説明なし |
| `path` | 説明なし |
| `current` | 説明なし |
| `defaults` | 説明なし |
| `differences` | 説明なし |
| `templateName` | 説明なし |
| `templates` | 説明なし |
| `template` | 説明なし |
| `applyResults` | 説明なし |
| `errors` | 説明なし |
| `originalValue` | 説明なし |
| `filtered` | 説明なし |
| `fullPath` | 説明なし |
| `childResult` | 説明なし |
| `fullPath` | 説明なし |
| `originalValue` | 説明なし |
| `differences` | 説明なし |
| `allKeys` | 説明なし |
| `currentValue` | 説明なし |
| `defaultValue` | 説明なし |
| `fullPath` | 説明なし |
| `childDiffs` | 説明なし |

---

