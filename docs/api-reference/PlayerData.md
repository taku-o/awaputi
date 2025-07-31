# PlayerData

## 概要

ファイル: `core/PlayerData.js`  
最終更新: 2025/7/19 13:07:43

## 目次

## クラス
- [PlayerData](#playerdata)
## 定数
- [validation](#validation)
- [validation](#validation)
- [validation](#validation)
- [scoreElement](#scoreelement)
- [hpElement](#hpelement)
- [validation](#validation)
- [data](#data)
- [usernameValidation](#usernamevalidation)
- [apValidation](#apvalidation)
- [tapValidation](#tapvalidation)
- [highScoresValidation](#highscoresvalidation)
- [stagesValidation](#stagesvalidation)
- [itemsValidation](#itemsvalidation)

---

## PlayerData

### コンストラクタ

```javascript
new PlayerData(gameEngine = null)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `username` | 説明なし |
| `currentHP` | 説明なし |
| `maxHP` | 説明なし |
| `currentScore` | 説明なし |
| `ap` | 説明なし |
| `tap` | 説明なし |
| `combo` | 説明なし |
| `highScores` | 説明なし |
| `unlockedStages` | 説明なし |
| `ownedItems` | 説明なし |
| `currentHP` | 説明なし |
| `currentHP` | 説明なし |
| `currentHP` | 説明なし |
| `currentScore` | 説明なし |
| `combo` | 説明なし |
| `username` | サニタイズされた値を使用 |
| `username` | 説明なし |
| `ap` | 説明なし |
| `tap` | 説明なし |
| `highScores` | 説明なし |
| `unlockedStages` | 説明なし |
| `ownedItems` | 説明なし |
| `username` | 説明なし |
| `ap` | 説明なし |
| `tap` | 説明なし |
| `highScores` | 説明なし |
| `unlockedStages` | 説明なし |
| `ownedItems` | 説明なし |

### メソッド

#### addScore

**シグネチャ**:
```javascript
 addScore(points)
```

**パラメーター**:
- `points`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScore(points);

// addScoreの実用的な使用例
const result = instance.addScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

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

#### takeDamage

**シグネチャ**:
```javascript
 takeDamage(amount)
```

**パラメーター**:
- `amount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.takeDamage(amount);

// takeDamageの実用的な使用例
const result = instance.takeDamage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentHP <= 0)
```

**パラメーター**:
- `this.currentHP <= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentHP <= 0);

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

#### heal

**シグネチャ**:
```javascript
 heal(amount)
```

**パラメーター**:
- `amount`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.heal(amount);

// healの実用的な使用例
const result = instance.heal(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

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

#### updateUI

**シグネチャ**:
```javascript
 updateUI()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateUI();

// updateUIの実用的な使用例
const result = instance.updateUI(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scoreElement)
```

**パラメーター**:
- `scoreElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scoreElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hpElement)
```

**パラメーター**:
- `hpElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hpElement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### save

**シグネチャ**:
```javascript
 save()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.save();

// saveの実用的な使用例
const result = instance.save(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validation.isValid)
```

**パラメーター**:
- `!validation.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validation.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (storageError)
```

**パラメーター**:
- `storageError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(storageError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

LocalStorageが利用できない場合はフォールバックストレージを使用

**シグネチャ**:
```javascript
 if (window.fallbackStorage)
```

**パラメーター**:
- `window.fallbackStorage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.fallbackStorage);

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

#### load

**シグネチャ**:
```javascript
 load()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.load();

// loadの実用的な使用例
const result = instance.load(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (storageError)
```

**パラメーター**:
- `storageError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(storageError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

LocalStorageが利用できない場合はフォールバックストレージを使用

**シグネチャ**:
```javascript
 if (window.fallbackStorage)
```

**パラメーター**:
- `window.fallbackStorage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(window.fallbackStorage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedData)
```

**パラメーター**:
- `savedData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### loadValidatedData

**シグネチャ**:
```javascript
 loadValidatedData(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadValidatedData(data);

// loadValidatedDataの実用的な使用例
const result = instance.loadValidatedData(/* 適切なパラメータ */);
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

#### resetToDefaults

**シグネチャ**:
```javascript
 resetToDefaults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetToDefaults();

// resetToDefaultsの実用的な使用例
const result = instance.resetToDefaults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `validation` | 説明なし |
| `validation` | 説明なし |
| `validation` | 説明なし |
| `scoreElement` | 説明なし |
| `hpElement` | 説明なし |
| `validation` | 説明なし |
| `data` | 説明なし |
| `usernameValidation` | 説明なし |
| `apValidation` | 説明なし |
| `tapValidation` | 説明なし |
| `highScoresValidation` | 説明なし |
| `stagesValidation` | 説明なし |
| `itemsValidation` | 説明なし |

---

