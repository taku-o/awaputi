# SceneManager

## 概要

ファイル: `core/SceneManager.js`  
最終更新: 2025/7/19 12:35:18

## 目次

## クラス
- [SceneManager](#scenemanager)
## 定数
- [scene](#scene)

---

## SceneManager

### コンストラクタ

```javascript
new SceneManager(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `scenes` | 説明なし |
| `currentScene` | 説明なし |
| `nextScene` | 説明なし |
| `currentScene` | 新しいシーンを開始 |

### メソッド

#### addScene

**シグネチャ**:
```javascript
 addScene(name, scene)
```

**パラメーター**:
- `name`
- `scene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addScene(name, scene);

// addSceneの実用的な使用例
const result = instance.addScene(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switchScene

**シグネチャ**:
```javascript
 switchScene(name)
```

**パラメーター**:
- `name`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switchScene(name);

// switchSceneの実用的な使用例
const result = instance.switchScene(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!scene)
```

**パラメーター**:
- `!scene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!scene);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

現在のシーンを終了

**シグネチャ**:
```javascript
 if (this.currentScene)
```

**パラメーター**:
- `this.currentScene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentScene);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentScene

**シグネチャ**:
```javascript
 getCurrentScene()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentScene();

// getCurrentSceneの実用的な使用例
const result = instance.getCurrentScene(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(deltaTime);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentScene)
```

**パラメーター**:
- `this.currentScene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentScene);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(context)
```

**パラメーター**:
- `context`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentScene)
```

**パラメーター**:
- `this.currentScene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentScene);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (this.currentScene)
```

**パラメーター**:
- `this.currentScene`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentScene);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `scene` | 説明なし |

---

