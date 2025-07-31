# ExecutionContext

## 概要

ファイル: `debug/ExecutionContext.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [ExecutionContext](#executioncontext)
## 定数
- [normalizedName](#normalizedname)
- [oldValue](#oldvalue)
- [normalizedName](#normalizedname)
- [normalizedName](#normalizedname)
- [oldValue](#oldvalue)
- [deleted](#deleted)
- [result](#result)
- [count](#count)
- [validPermissions](#validpermissions)
- [oldPermissions](#oldpermissions)
- [permissionLevels](#permissionlevels)
- [currentLevel](#currentlevel)
- [requiredLevel](#requiredlevel)
- [safeContext](#safecontext)
- [func](#func)
- [result](#result)
- [startIndex](#startindex)
- [count](#count)

---

## ExecutionContext

### コンストラクタ

```javascript
new ExecutionContext(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `variables` | 説明なし |
| `history` | 説明なし |
| `startTime` | 説明なし |
| `permissions` | 説明なし |
| `game` | ゲームエンジンへの便利なアクセス |
| `scene` | 説明なし |
| `bubbleManager` | 説明なし |
| `scoreManager` | 説明なし |
| `playerData` | 説明なし |
| `scene` | 説明なし |
| `playerData` | 説明なし |
| `bubbleManager` | 説明なし |
| `scoreManager` | 説明なし |
| `permissions` | 説明なし |
| `history` | 説明なし |
| `permissions` | 説明なし |
| `startTime` | 説明なし |
| `gameEngine` | 説明なし |
| `scene` | 説明なし |
| `bubbleManager` | 説明なし |
| `scoreManager` | 説明なし |
| `playerData` | 説明なし |

### メソッド

#### updateContextReferences

**シグネチャ**:
```javascript
 updateContextReferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateContextReferences();

// updateContextReferencesの実用的な使用例
const result = instance.updateContextReferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.gameEngine)
```

**パラメーター**:
- `this.gameEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.scene)
```

**パラメーター**:
- `this.scene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.scene);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setVariable

**シグネチャ**:
```javascript
 setVariable(name, value)
```

**パラメーター**:
- `name`
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setVariable(name, value);

// setVariableの実用的な使用例
const result = instance.setVariable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getVariable

**シグネチャ**:
```javascript
 getVariable(name)
```

**パラメーター**:
- `name`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getVariable(name);

// getVariableの実用的な使用例
const result = instance.getVariable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof name !== 'string')
```

**パラメーター**:
- `typeof name !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof name !== 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### deleteVariable

**シグネチャ**:
```javascript
 deleteVariable(name)
```

**パラメーター**:
- `name`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deleteVariable(name);

// deleteVariableの実用的な使用例
const result = instance.deleteVariable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof name !== 'string')
```

**パラメーター**:
- `typeof name !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof name !== 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (deleted)
```

**パラメーター**:
- `deleted`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deleted);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAllVariables

**シグネチャ**:
```javascript
 getAllVariables()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllVariables();

// getAllVariablesの実用的な使用例
const result = instance.getAllVariables(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [name, value] of this.variables)
```

**パラメーター**:
- `const [name`
- `value] of this.variables`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [name, value] of this.variables);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearVariables

**シグネチャ**:
```javascript
 clearVariables()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearVariables();

// clearVariablesの実用的な使用例
const result = instance.clearVariables(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setPermissions

**シグネチャ**:
```javascript
 setPermissions(permissions)
```

**パラメーター**:
- `permissions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setPermissions(permissions);

// setPermissionsの実用的な使用例
const result = instance.setPermissions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hasPermission

**シグネチャ**:
```javascript
 hasPermission(requiredPermission)
```

**パラメーター**:
- `requiredPermission`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hasPermission(requiredPermission);

// hasPermissionの実用的な使用例
const result = instance.hasPermission(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeJS

**シグネチャ**:
```javascript
 executeJS(code)
```

**パラメーター**:
- `code`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeJS(code);

// executeJSの実用的な使用例
const result = instance.executeJS(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof code !== 'string')
```

**パラメーター**:
- `typeof code !== 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof code !== 'string');

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

#### getInfo

**シグネチャ**:
```javascript
 getInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getInfo();

// getInfoの実用的な使用例
const result = instance.getInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getHistory

**シグネチャ**:
```javascript
 getHistory(limit = 50)
```

**パラメーター**:
- `limit = 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getHistory(limit = 50);

// getHistoryの実用的な使用例
const result = instance.getHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearHistory

**シグネチャ**:
```javascript
 clearHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearHistory();

// clearHistoryの実用的な使用例
const result = instance.clearHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### reset

**シグネチャ**:
```javascript
 reset()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.reset();

// resetの実用的な使用例
const result = instance.reset(/* 適切なパラメータ */);
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
| `normalizedName` | 説明なし |
| `oldValue` | 説明なし |
| `normalizedName` | 説明なし |
| `normalizedName` | 説明なし |
| `oldValue` | 説明なし |
| `deleted` | 説明なし |
| `result` | 説明なし |
| `count` | 説明なし |
| `validPermissions` | 説明なし |
| `oldPermissions` | 説明なし |
| `permissionLevels` | 説明なし |
| `currentLevel` | 説明なし |
| `requiredLevel` | 説明なし |
| `safeContext` | 説明なし |
| `func` | 説明なし |
| `result` | 説明なし |
| `startIndex` | 説明なし |
| `count` | 説明なし |

---

