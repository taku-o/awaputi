# UsernameDialog

## 概要

ファイル: `scenes/components/UsernameDialog.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [UsernameDialog](#usernamedialog)
## 定数
- [playerData](#playerdata)
- [contentY](#contenty)
- [inputWidth](#inputwidth)
- [inputHeight](#inputheight)
- [inputX](#inputx)
- [displayText](#displaytext)
- [textX](#textx)
- [textY](#texty)
- [beforeCursor](#beforecursor)
- [cursorX](#cursorx)
- [currentLength](#currentlength)
- [counterText](#countertext)
- [validationRules](#validationrules)
- [contentY](#contenty)
- [inputY](#inputy)
- [inputX](#inputx)
- [inputWidth](#inputwidth)
- [inputHeight](#inputheight)
- [maxPos](#maxpos)
- [canvas](#canvas)
- [context](#context)
- [textWidth](#textwidth)
- [distance](#distance)
- [beforeCursor](#beforecursor)
- [afterCursor](#aftercursor)
- [beforeCursor](#beforecursor)
- [afterCursor](#aftercursor)
- [currentText](#currenttext)
- [beforeCursor](#beforecursor)
- [afterCursor](#aftercursor)
- [newUsername](#newusername)
- [playerData](#playerdata)
- [lowerUsername](#lowerusername)
- [username](#username)

---

## UsernameDialog

**継承元**: `BaseDialog`

### コンストラクタ

```javascript
new UsernameDialog(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `title` | 説明なし |
| `maxUsernameLength` | 説明なし |
| `inputActive` | 説明なし |
| `cursorPosition` | 説明なし |
| `cursorBlinkTimer` | 説明なし |
| `showCursor` | 説明なし |
| `validation` | 入力検証設定 |
| `cursorPosition` | 説明なし |
| `inputActive` | 説明なし |
| `buttons` | 説明なし |
| `inputActive` | 説明なし |
| `inputActive` | 説明なし |
| `cursorPosition` | 説明なし |
| `cursorPosition` | 説明なし |
| `cursorPosition` | 説明なし |
| `cursorPosition` | 説明なし |
| `cursorPosition` | 説明なし |
| `cursorPosition` | 説明なし |
| `showCursor` | 説明なし |
| `cursorBlinkTimer` | 説明なし |
| `inputActive` | 説明なし |
| `cursorPosition` | 説明なし |
| `cursorBlinkTimer` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize(options = {});

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### setupButtons

**シグネチャ**:
```javascript
 setupButtons()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupButtons();

// setupButtonsの実用的な使用例
const result = instance.setupButtons(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disabled

**シグネチャ**:
```javascript
 disabled()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disabled();

// disabledの実用的な使用例
const result = instance.disabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderContent

**シグネチャ**:
```javascript
 renderContent(context, layout)
```

**パラメーター**:
- `context`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderContent(context, layout);

// renderContentの実用的な使用例
const result = instance.renderContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderUsernameInput

**シグネチャ**:
```javascript
 renderUsernameInput(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderUsernameInput(context, layout, y);

// renderUsernameInputの実用的な使用例
const result = instance.renderUsernameInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (displayText)
```

**パラメーター**:
- `displayText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(displayText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カーソルを描画

**シグネチャ**:
```javascript
 if (this.inputActive && this.showCursor && displayText)
```

**パラメーター**:
- `this.inputActive && this.showCursor && displayText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.inputActive && this.showCursor && displayText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCursor

**シグネチャ**:
```javascript
 renderCursor(context, textX, textY, text)
```

**パラメーター**:
- `context`
- `textX`
- `textY`
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCursor(context, textX, textY, text);

// renderCursorの実用的な使用例
const result = instance.renderCursor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCharacterCounter

**シグネチャ**:
```javascript
 renderCharacterCounter(context, x, y)
```

**パラメーター**:
- `context`
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCharacterCounter(context, x, y);

// renderCharacterCounterの実用的な使用例
const result = instance.renderCharacterCounter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderValidationInfo

**シグネチャ**:
```javascript
 renderValidationInfo(context, layout, y)
```

**パラメーター**:
- `context`
- `layout`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderValidationInfo(context, layout, y);

// renderValidationInfoの実用的な使用例
const result = instance.renderValidationInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < validationRules.length; i++)
```

**パラメーター**:
- `let i = 0; i < validationRules.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < validationRules.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleContentClick

**シグネチャ**:
```javascript
 handleContentClick(x, y, layout)
```

**パラメーター**:
- `x`
- `y`
- `layout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleContentClick(x, y, layout);

// handleContentClickの実用的な使用例
const result = instance.handleContentClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

入力欄のクリック判定

**シグネチャ**:
```javascript
 if (x >= inputX && x <= inputX + inputWidth && 
            y >= inputY && y <= inputY + inputHeight)
```

**パラメーター**:
- `x >= inputX && x <= inputX + inputWidth && 
            y >= inputY && y <= inputY + inputHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= inputX && x <= inputX + inputWidth && 
            y >= inputY && y <= inputY + inputHeight);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleContentKeyboard

**シグネチャ**:
```javascript
 handleContentKeyboard(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleContentKeyboard(event);

// handleContentKeyboardの実用的な使用例
const result = instance.handleContentKeyboard(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.inputActive)
```

**パラメーター**:
- `!this.inputActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.inputActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.key)
```

**パラメーター**:
- `event.key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.key);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.key.length === 1)
```

**パラメーター**:
- `event.key.length === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.key.length === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateCursorPosition

**シグネチャ**:
```javascript
 calculateCursorPosition(clickX)
```

**パラメーター**:
- `clickX`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateCursorPosition(clickX);

// calculateCursorPositionの実用的な使用例
const result = instance.calculateCursorPosition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.data.newUsername)
```

**パラメーター**:
- `!this.data.newUsername`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.data.newUsername);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= this.data.newUsername.length; i++)
```

**パラメーター**:
- `let i = 0; i <= this.data.newUsername.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= this.data.newUsername.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < minDistance)
```

**パラメーター**:
- `distance < minDistance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < minDistance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBackspace

**シグネチャ**:
```javascript
 handleBackspace()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBackspace();

// handleBackspaceの実用的な使用例
const result = instance.handleBackspace(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.cursorPosition > 0 && this.data.newUsername)
```

**パラメーター**:
- `this.cursorPosition > 0 && this.data.newUsername`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.cursorPosition > 0 && this.data.newUsername);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleDelete

**シグネチャ**:
```javascript
 handleDelete()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleDelete();

// handleDeleteの実用的な使用例
const result = instance.handleDelete(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.data.newUsername && this.cursorPosition < this.data.newUsername.length)
```

**パラメーター**:
- `this.data.newUsername && this.cursorPosition < this.data.newUsername.length`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.newUsername && this.cursorPosition < this.data.newUsername.length);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleCharacterInput

**シグネチャ**:
```javascript
 handleCharacterInput(char)
```

**パラメーター**:
- `char`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleCharacterInput(char);

// handleCharacterInputの実用的な使用例
const result = instance.handleCharacterInput(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

文字数制限チェック

**シグネチャ**:
```javascript
 if (currentText.length >= this.maxUsernameLength)
```

**パラメーター**:
- `currentText.length >= this.maxUsernameLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentText.length >= this.maxUsernameLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleUsernameChange

**シグネチャ**:
```javascript
 handleUsernameChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleUsernameChange();

// handleUsernameChangeの実用的な使用例
const result = instance.handleUsernameChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

成功結果を返す

**シグネチャ**:
```javascript
 if (this.onResult)
```

**パラメーター**:
- `this.onResult`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.onResult);

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

#### validateUsername

**シグネチャ**:
```javascript
 validateUsername(username)
```

**パラメーター**:
- `username`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateUsername(username);

// validateUsernameの実用的な使用例
const result = instance.validateUsername(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!username)
```

**パラメーター**:
- `!username`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!username);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (username.length < this.validation.minLength)
```

**パラメーター**:
- `username.length < this.validation.minLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(username.length < this.validation.minLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (username.length > this.maxUsernameLength)
```

**パラメーター**:
- `username.length > this.maxUsernameLength`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(username.length > this.maxUsernameLength);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const prohibitedWord of this.validation.prohibitedWords)
```

**パラメーター**:
- `const prohibitedWord of this.validation.prohibitedWords`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const prohibitedWord of this.validation.prohibitedWords);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isValidUsername

**シグネチャ**:
```javascript
 isValidUsername()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isValidUsername();

// isValidUsernameの実用的な使用例
const result = instance.isValidUsername(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setError

**シグネチャ**:
```javascript
 setError(message)
```

**パラメーター**:
- `message`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setError(message);

// setErrorの実用的な使用例
const result = instance.setError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearError

**シグネチャ**:
```javascript
 clearError()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearError();

// clearErrorの実用的な使用例
const result = instance.clearError(/* 適切なパラメータ */);
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
 if (this.cursorBlinkTimer >= 500)
```

**パラメーター**:
- `this.cursorBlinkTimer >= 500`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.cursorBlinkTimer >= 500);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

## 定数

| 定数名 | 説明 |
|--------|------|
| `playerData` | 説明なし |
| `contentY` | 説明なし |
| `inputWidth` | 説明なし |
| `inputHeight` | 説明なし |
| `inputX` | 説明なし |
| `displayText` | 説明なし |
| `textX` | 説明なし |
| `textY` | 説明なし |
| `beforeCursor` | 説明なし |
| `cursorX` | 説明なし |
| `currentLength` | 説明なし |
| `counterText` | 説明なし |
| `validationRules` | 説明なし |
| `contentY` | 説明なし |
| `inputY` | 説明なし |
| `inputX` | 説明なし |
| `inputWidth` | 説明なし |
| `inputHeight` | 説明なし |
| `maxPos` | 説明なし |
| `canvas` | 説明なし |
| `context` | 説明なし |
| `textWidth` | 説明なし |
| `distance` | 説明なし |
| `beforeCursor` | 説明なし |
| `afterCursor` | 説明なし |
| `beforeCursor` | 説明なし |
| `afterCursor` | 説明なし |
| `currentText` | 説明なし |
| `beforeCursor` | 説明なし |
| `afterCursor` | 説明なし |
| `newUsername` | 説明なし |
| `playerData` | 説明なし |
| `lowerUsername` | 説明なし |
| `username` | 説明なし |

---

