# CaptionManager

## 概要

ファイル: `core/CaptionManager.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [CaptionManager](#captionmanager)
## 定数
- [saved](#saved)
- [preferences](#preferences)
- [preferences](#preferences)
- [position](#position)
- [prefs](#prefs)
- [audioManager](#audiomanager)
- [originalPlaySound](#originalplaysound)
- [result](#result)
- [originalPlayMusic](#originalplaymusic)
- [result](#result)
- [customDescription](#customdescription)
- [captionId](#captionid)
- [duration](#duration)
- [musicDescription](#musicdescription)
- [language](#language)
- [text](#text)
- [description](#description)
- [captionId](#captionid)
- [duration](#duration)
- [description](#description)
- [level](#level)
- [volumeDesc](#volumedesc)
- [language](#language)
- [categoryDesc](#categorydesc)
- [description](#description)
- [captionElement](#captionelement)
- [captionData](#captiondata)
- [maxCaptions](#maxcaptions)
- [sortedCaptions](#sortedcaptions)
- [toRemove](#toremove)
- [captionData](#captiondata)
- [element](#element)
- [displayTime](#displaytime)
- [count](#count)
- [currentTotal](#currenttotal)
- [currentAverage](#currentaverage)
- [displayCount](#displaycount)
- [size](#size)
- [validLevels](#validlevels)
- [description](#description)
- [captionId](#captionid)
- [duration](#duration)
- [sessionDuration](#sessionduration)

---

## CaptionManager

### コンストラクタ

```javascript
new CaptionManager(audioAccessibilityManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `audioAccessibilityManager` | 説明なし |
| `accessibilityManager` | 説明なし |
| `gameEngine` | 説明なし |
| `config` | キャプション設定 |
| `soundDescriptions` | 音響効果の説明マッピング |
| `musicDescriptions` | 音楽説明マッピング |
| `activeCaptions` | キャプション表示管理 |
| `captionQueue` | 説明なし |
| `captionContainer` | 説明なし |
| `maxCaptionId` | 説明なし |
| `dynamicStyleSheet` | スタイル管理 |
| `currentStyle` | 説明なし |
| `stats` | 統計情報 |
| `userPreferences` | ユーザー設定 |
| `languageSupport` | 言語サポート |
| `captionContainer` | 説明なし |
| `dynamicStyleSheet` | 説明なし |

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

#### loadUserPreferences

**シグネチャ**:
```javascript
 loadUserPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadUserPreferences();

// loadUserPreferencesの実用的な使用例
const result = instance.loadUserPreferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (saved)
```

**パラメーター**:
- `saved`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(saved);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Map の復元

**シグネチャ**:
```javascript
 if (preferences.customDescriptions)
```

**パラメーター**:
- `preferences.customDescriptions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(preferences.customDescriptions);

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

#### saveUserPreferences

**シグネチャ**:
```javascript
 saveUserPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveUserPreferences();

// saveUserPreferencesの実用的な使用例
const result = instance.saveUserPreferences(/* 適切なパラメータ */);
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

#### createCaptionContainer

**シグネチャ**:
```javascript
 createCaptionContainer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createCaptionContainer();

// createCaptionContainerの実用的な使用例
const result = instance.createCaptionContainer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateContainerPosition

**シグネチャ**:
```javascript
 updateContainerPosition()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateContainerPosition();

// updateContainerPositionの実用的な使用例
const result = instance.updateContainerPosition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (position)
```

**パラメーター**:
- `position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(position);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createDynamicStyleSheet

**シグネチャ**:
```javascript
 createDynamicStyleSheet()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDynamicStyleSheet();

// createDynamicStyleSheetの実用的な使用例
const result = instance.createDynamicStyleSheet(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStyleSheet

**シグネチャ**:
```javascript
 updateStyleSheet()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStyleSheet();

// updateStyleSheetの実用的な使用例
const result = instance.updateStyleSheet(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### media

**シグネチャ**:
```javascript
 media (max-width: 768px)
```

**パラメーター**:
- `max-width: 768px`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.media(max-width: 768px);

// mediaの実用的な使用例
const result = instance.media(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### media

**シグネチャ**:
```javascript
 media (max-width: 480px)
```

**パラメーター**:
- `max-width: 480px`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.media(max-width: 480px);

// mediaの実用的な使用例
const result = instance.media(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStyleFromPreferences

**シグネチャ**:
```javascript
 updateStyleFromPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStyleFromPreferences();

// updateStyleFromPreferencesの実用的な使用例
const result = instance.updateStyleFromPreferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dynamicStyleSheet)
```

**パラメーター**:
- `this.dynamicStyleSheet`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dynamicStyleSheet);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.captionContainer)
```

**パラメーター**:
- `this.captionContainer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.captionContainer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupEventListeners

**シグネチャ**:
```javascript
 setupEventListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEventListeners();

// setupEventListenersの実用的な使用例
const result = instance.setupEventListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームオーディオイベントの監視

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

AudioManager との連携

**シグネチャ**:
```javascript
 if (this.gameEngine?.audioManager)
```

**パラメーター**:
- `this.gameEngine?.audioManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine?.audioManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event.ctrlKey && event.shiftKey)
```

**パラメーター**:
- `event.ctrlKey && event.shiftKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.ctrlKey && event.shiftKey);

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
 if (event.detail.component === 'captions')
```

**パラメーター**:
- `event.detail.component === 'captions'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.detail.component === 'captions');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupAudioManagerIntegration

**シグネチャ**:
```javascript
 setupAudioManagerIntegration()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupAudioManagerIntegration();

// setupAudioManagerIntegrationの実用的な使用例
const result = instance.setupAudioManagerIntegration(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

オリジナルの play メソッドをラップ

**シグネチャ**:
```javascript
 if (audioManager.playSound)
```

**パラメーター**:
- `audioManager.playSound`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(audioManager.playSound);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キャプション表示

**シグネチャ**:
```javascript
 if (this.config.enabled)
```

**パラメーター**:
- `this.config.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

BGM 再生の監視

**シグネチャ**:
```javascript
 if (audioManager.playMusic)
```

**パラメーター**:
- `audioManager.playMusic`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(audioManager.playMusic);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.enabled && this.userPreferences.showMusic)
```

**パラメーター**:
- `this.config.enabled && this.userPreferences.showMusic`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled && this.userPreferences.showMusic);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleAudioEvent

**シグネチャ**:
```javascript
 handleAudioEvent(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleAudioEvent(event);

// handleAudioEventの実用的な使用例
const result = instance.handleAudioEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### shouldShowCaption

**シグネチャ**:
```javascript
 shouldShowCaption(category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldShowCaption(category);

// shouldShowCaptionの実用的な使用例
const result = instance.shouldShowCaption(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(category);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### displayCaption

**シグネチャ**:
```javascript
 displayCaption(soundId, options = {})
```

**パラメーター**:
- `soundId`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.displayCaption(soundId, options = {});

// displayCaptionの実用的な使用例
const result = instance.displayCaption(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (customDescription)
```

**パラメーター**:
- `customDescription`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(customDescription);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### displayMusicCaption

**シグネチャ**:
```javascript
 displayMusicCaption(musicId, options = {})
```

**パラメーター**:
- `musicId`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.displayMusicCaption(musicId, options = {});

// displayMusicCaptionの実用的な使用例
const result = instance.displayMusicCaption(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAudioDescription

**シグネチャ**:
```javascript
 getAudioDescription(soundId, options)
```

**パラメーター**:
- `soundId`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAudioDescription(soundId, options);

// getAudioDescriptionの実用的な使用例
const result = instance.getAudioDescription(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!description)
```

**パラメーター**:
- `!description`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!description);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyVerbosityLevel

**シグネチャ**:
```javascript
 applyVerbosityLevel(description, options)
```

**パラメーター**:
- `description`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyVerbosityLevel(description, options);

// applyVerbosityLevelの実用的な使用例
const result = instance.applyVerbosityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(level);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

詳細な情報を追加

**シグネチャ**:
```javascript
 if (options.volume && options.volume !== 1.0)
```

**パラメーター**:
- `options.volume && options.volume !== 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(options.volume && options.volume !== 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (description.category && description.category !== 'game')
```

**パラメーター**:
- `description.category && description.category !== 'game'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(description.category && description.category !== 'game');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDurationForSound

**シグネチャ**:
```javascript
 getDurationForSound(soundId, category)
```

**パラメーター**:
- `soundId`
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDurationForSound(soundId, category);

// getDurationForSoundの実用的な使用例
const result = instance.getDurationForSound(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (description && description.duration)
```

**パラメーター**:
- `description && description.duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(description && description.duration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

カテゴリベースのデフォルト

**シグネチャ**:
```javascript
 switch (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(category);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createCaptionElement

**シグネチャ**:
```javascript
 createCaptionElement(captionId, description, duration, options)
```

**パラメーター**:
- `captionId`
- `description`
- `duration`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createCaptionElement(captionId, description, duration, options);

// createCaptionElementの実用的な使用例
const result = instance.createCaptionElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

冗長性レベルクラスの追加

**シグネチャ**:
```javascript
 if (this.userPreferences.verbosityLevel !== 'normal')
```

**パラメーター**:
- `this.userPreferences.verbosityLevel !== 'normal'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.userPreferences.verbosityLevel !== 'normal');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アニメーション設定

**シグネチャ**:
```javascript
 if (this.config.animation.slideIn)
```

**パラメーター**:
- `this.config.animation.slideIn`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.animation.slideIn);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.animation.bounce)
```

**パラメーター**:
- `this.config.animation.bounce`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.animation.bounce);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動非表示の設定

**シグネチャ**:
```javascript
 if (duration > 0 && this.userPreferences.autoHide)
```

**パラメーター**:
- `duration > 0 && this.userPreferences.autoHide`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(duration > 0 && this.userPreferences.autoHide);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enforceMaxCaptions

**シグネチャ**:
```javascript
 enforceMaxCaptions()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enforceMaxCaptions();

// enforceMaxCaptionsの実用的な使用例
const result = instance.enforceMaxCaptions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hideCaption

**シグネチャ**:
```javascript
 hideCaption(captionId)
```

**パラメーター**:
- `captionId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hideCaption(captionId);

// hideCaptionの実用的な使用例
const result = instance.hideCaption(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element.parentNode)
```

**パラメーター**:
- `element.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateCaptionId

**シグネチャ**:
```javascript
 generateCaptionId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCaptionId();

// generateCaptionIdの実用的な使用例
const result = instance.generateCaptionId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCaptionStats

**シグネチャ**:
```javascript
 updateCaptionStats(category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCaptionStats(category);

// updateCaptionStatsの実用的な使用例
const result = instance.updateCaptionStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateDisplayTimeStats

**シグネチャ**:
```javascript
 updateDisplayTimeStats(displayTime)
```

**パラメーター**:
- `displayTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateDisplayTimeStats(displayTime);

// updateDisplayTimeStatsの実用的な使用例
const result = instance.updateDisplayTimeStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enable

**シグネチャ**:
```javascript
 enable()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enable();

// enableの実用的な使用例
const result = instance.enable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.captionContainer)
```

**パラメーター**:
- `this.captionContainer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.captionContainer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disable

**シグネチャ**:
```javascript
 disable()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disable();

// disableの実用的な使用例
const result = instance.disable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.captionContainer)
```

**パラメーター**:
- `this.captionContainer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.captionContainer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggle

**シグネチャ**:
```javascript
 toggle()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggle();

// toggleの実用的な使用例
const result = instance.toggle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.enabled)
```

**パラメーター**:
- `this.config.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAllCaptions

**シグネチャ**:
```javascript
 clearAllCaptions()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAllCaptions();

// clearAllCaptionsの実用的な使用例
const result = instance.clearAllCaptions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addCustomDescription

**シグネチャ**:
```javascript
 addCustomDescription(soundId, description)
```

**パラメーター**:
- `soundId`
- `description`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addCustomDescription(soundId, description);

// addCustomDescriptionの実用的な使用例
const result = instance.addCustomDescription(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setPosition

**シグネチャ**:
```javascript
 setPosition(position)
```

**パラメーター**:
- `position`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setPosition(position);

// setPositionの実用的な使用例
const result = instance.setPosition(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setFontSize

**シグネチャ**:
```javascript
 setFontSize(fontSize)
```

**パラメーター**:
- `fontSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setFontSize(fontSize);

// setFontSizeの実用的な使用例
const result = instance.setFontSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setColors

**シグネチャ**:
```javascript
 setColors(textColor, backgroundColor)
```

**パラメーター**:
- `textColor`
- `backgroundColor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setColors(textColor, backgroundColor);

// setColorsの実用的な使用例
const result = instance.setColors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setVerbosityLevel

**シグネチャ**:
```javascript
 setVerbosityLevel(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setVerbosityLevel(level);

// setVerbosityLevelの実用的な使用例
const result = instance.setVerbosityLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setLanguage

**シグネチャ**:
```javascript
 setLanguage(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setLanguage(language);

// setLanguageの実用的な使用例
const result = instance.setLanguage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showManualCaption

**シグネチャ**:
```javascript
 showManualCaption(text, options = {})
```

**パラメーター**:
- `text`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showManualCaption(text, options = {});

// showManualCaptionの実用的な使用例
const result = instance.showManualCaption(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyConfig

**シグネチャ**:
```javascript
 applyConfig(config)
```

**パラメーター**:
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyConfig(config);

// applyConfigの実用的な使用例
const result = instance.applyConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.audio?.captions)
```

**パラメーター**:
- `config.audio?.captions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.audio?.captions);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateReport

**シグネチャ**:
```javascript
 generateReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateReport();

// generateReportの実用的な使用例
const result = instance.generateReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setEnabled

**シグネチャ**:
```javascript
 setEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setEnabled(enabled);

// setEnabledの実用的な使用例
const result = instance.setEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(enabled);

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

#### if

キャプションコンテナの削除

**シグネチャ**:
```javascript
 if (this.captionContainer && this.captionContainer.parentNode)
```

**パラメーター**:
- `this.captionContainer && this.captionContainer.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.captionContainer && this.captionContainer.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スタイルシートの削除

**シグネチャ**:
```javascript
 if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode)
```

**パラメーター**:
- `this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `saved` | 説明なし |
| `preferences` | 説明なし |
| `preferences` | 説明なし |
| `position` | 説明なし |
| `prefs` | 説明なし |
| `audioManager` | 説明なし |
| `originalPlaySound` | 説明なし |
| `result` | 説明なし |
| `originalPlayMusic` | 説明なし |
| `result` | 説明なし |
| `customDescription` | 説明なし |
| `captionId` | 説明なし |
| `duration` | 説明なし |
| `musicDescription` | 説明なし |
| `language` | 説明なし |
| `text` | 説明なし |
| `description` | 説明なし |
| `captionId` | 説明なし |
| `duration` | 説明なし |
| `description` | 説明なし |
| `level` | 説明なし |
| `volumeDesc` | 説明なし |
| `language` | 説明なし |
| `categoryDesc` | 説明なし |
| `description` | 説明なし |
| `captionElement` | 説明なし |
| `captionData` | 説明なし |
| `maxCaptions` | 説明なし |
| `sortedCaptions` | 説明なし |
| `toRemove` | 説明なし |
| `captionData` | 説明なし |
| `element` | 説明なし |
| `displayTime` | 説明なし |
| `count` | 説明なし |
| `currentTotal` | 説明なし |
| `currentAverage` | 説明なし |
| `displayCount` | 説明なし |
| `size` | 説明なし |
| `validLevels` | 説明なし |
| `description` | 説明なし |
| `captionId` | 説明なし |
| `duration` | 説明なし |
| `sessionDuration` | 説明なし |

---

