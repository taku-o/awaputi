# AchievementNotificationSystem

## 概要

ファイル: `core/AchievementNotificationSystem.js`  
最終更新: 2025/7/28 13:03:17

## 目次

## クラス
- [AchievementNotificationSystem](#achievementnotificationsystem)
## 定数
- [newNotifications](#newnotifications)
- [notification](#notification)
- [notification](#notification)
- [index](#index)
- [rarity](#rarity)
- [ap](#ap)
- [notification](#notification)
- [animSpeed](#animspeed)
- [enterProgress](#enterprogress)
- [exitProgress](#exitprogress)
- [c1](#c1)
- [c3](#c3)
- [ctx](#ctx)
- [centerX](#centerx)
- [centerY](#centery)
- [rarity](#rarity)
- [iconSize](#iconsize)
- [iconX](#iconx)
- [iconY](#icony)
- [textX](#textx)
- [textY](#texty)
- [textWidth](#textwidth)
- [titleText](#titletext)
- [descText](#desctext)
- [rewardX](#rewardx)
- [rewardY](#rewardy)

---

## AchievementNotificationSystem

### コンストラクタ

```javascript
new AchievementNotificationSystem(gameEngine)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `canvas` | 説明なし |
| `context` | 説明なし |
| `notifications` | 通知管理 |
| `notificationQueue` | 説明なし |
| `maxDisplayedNotifications` | 説明なし |
| `notificationDuration` | 説明なし |
| `animationDuration` | アニメーション設定 |
| `slideDistance` | フェード/スライドアニメーション |
| `notificationWidth` | 表示位置設定 |
| `notificationHeight` | 説明なし |
| `notificationMargin` | 説明なし |
| `notificationPadding` | 説明なし |
| `soundEnabled` | 音響効果 |
| `checkInterval` | 実績マネージャーから通知を定期的にチェック |
| `notificationQueue` | 説明なし |
| `soundEnabled` | 説明なし |
| `notifications` | 説明なし |
| `notificationQueue` | 説明なし |

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

#### checkForNewNotifications

**シグネチャ**:
```javascript
 checkForNewNotifications()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkForNewNotifications();

// checkForNewNotificationsの実用的な使用例
const result = instance.checkForNewNotifications(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### queueNotification

**シグネチャ**:
```javascript
 queueNotification(achievementData)
```

**パラメーター**:
- `achievementData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.queueNotification(achievementData);

// queueNotificationの実用的な使用例
const result = instance.queueNotification(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createNotification

**シグネチャ**:
```javascript
 createNotification(achievementData)
```

**パラメーター**:
- `achievementData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createNotification(achievementData);

// createNotificationの実用的な使用例
const result = instance.createNotification(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processNotificationQueue

**シグネチャ**:
```javascript
 processNotificationQueue()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processNotificationQueue();

// processNotificationQueueの実用的な使用例
const result = instance.processNotificationQueue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

表示中の通知数が上限未満の場合、新しい通知を表示開始

**シグネチャ**:
```javascript
 while (this.notifications.length < this.maxDisplayedNotifications && 
               this.notificationQueue.length > 0)
```

**パラメーター**:
- `this.notifications.length < this.maxDisplayedNotifications && 
               this.notificationQueue.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.notifications.length < this.maxDisplayedNotifications && 
               this.notificationQueue.length > 0);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### showNotification

**シグネチャ**:
```javascript
 showNotification(notification)
```

**パラメーター**:
- `notification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.showNotification(notification);

// showNotificationの実用的な使用例
const result = instance.showNotification(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### playUnlockSound

**シグネチャ**:
```javascript
 playUnlockSound(achievement)
```

**パラメーター**:
- `achievement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.playUnlockSound(achievement);

// playUnlockSoundの実用的な使用例
const result = instance.playUnlockSound(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (rarity)
```

**パラメーター**:
- `rarity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(rarity);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### getAchievementRarity

**シグネチャ**:
```javascript
 getAchievementRarity(achievement)
```

**パラメーター**:
- `achievement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAchievementRarity(achievement);

// getAchievementRarityの実用的な使用例
const result = instance.getAchievementRarity(/* 適切なパラメータ */);
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

#### for

表示中の通知を更新

**シグネチャ**:
```javascript
 for (let i = this.notifications.length - 1; i >= 0; i--)
```

**パラメーター**:
- `let i = this.notifications.length - 1; i >= 0; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = this.notifications.length - 1; i >= 0; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

削除フラグが立った通知を削除

**シグネチャ**:
```javascript
 if (notification.shouldRemove)
```

**パラメーター**:
- `notification.shouldRemove`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(notification.shouldRemove);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キューにある通知があれば処理

**シグネチャ**:
```javascript
 if (this.notificationQueue.length > 0)
```

**パラメーター**:
- `this.notificationQueue.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.notificationQueue.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateNotification

**シグネチャ**:
```javascript
 updateNotification(notification, deltaTime)
```

**パラメーター**:
- `notification`
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateNotification(notification, deltaTime);

// updateNotificationの実用的な使用例
const result = instance.updateNotification(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

アニメーション速度

**シグネチャ**:
```javascript
 switch (notification.animationState)
```

**パラメーター**:
- `notification.animationState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(notification.animationState);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (notification.animationProgress >= 1.0)
```

**パラメーター**:
- `notification.animationProgress >= 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(notification.animationProgress >= 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (notification.displayTime >= this.notificationDuration)
```

**パラメーター**:
- `notification.displayTime >= this.notificationDuration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(notification.displayTime >= this.notificationDuration);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (notification.animationProgress >= 1.0)
```

**パラメーター**:
- `notification.animationProgress >= 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(notification.animationProgress >= 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### repositionNotifications

**シグネチャ**:
```javascript
 repositionNotifications()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.repositionNotifications();

// repositionNotificationsの実用的な使用例
const result = instance.repositionNotifications(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### easeOutBack

**シグネチャ**:
```javascript
 easeOutBack(t)
```

**パラメーター**:
- `t`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.easeOutBack(t);

// easeOutBackの実用的な使用例
const result = instance.easeOutBack(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render();

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### renderNotificationPopup

**シグネチャ**:
```javascript
 renderNotificationPopup(notification)
```

**パラメーター**:
- `notification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderNotificationPopup(notification);

// renderNotificationPopupの実用的な使用例
const result = instance.renderNotificationPopup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderNotificationBackground

**シグネチャ**:
```javascript
 renderNotificationBackground(ctx, notification)
```

**パラメーター**:
- `ctx`
- `notification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderNotificationBackground(ctx, notification);

// renderNotificationBackgroundの実用的な使用例
const result = instance.renderNotificationBackground(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (rarity)
```

**パラメーター**:
- `rarity`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(rarity);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

光る効果

**シグネチャ**:
```javascript
 if (notification.animationState === 'entering')
```

**パラメーター**:
- `notification.animationState === 'entering'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(notification.animationState === 'entering');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderNotificationContent

**シグネチャ**:
```javascript
 renderNotificationContent(ctx, notification)
```

**パラメーター**:
- `ctx`
- `notification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderNotificationContent(ctx, notification);

// renderNotificationContentの実用的な使用例
const result = instance.renderNotificationContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderNotificationIcon

**シグネチャ**:
```javascript
 renderNotificationIcon(ctx, notification)
```

**パラメーター**:
- `ctx`
- `notification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderNotificationIcon(ctx, notification);

// renderNotificationIconの実用的な使用例
const result = instance.renderNotificationIcon(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderNotificationText

**シグネチャ**:
```javascript
 renderNotificationText(ctx, notification)
```

**パラメーター**:
- `ctx`
- `notification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderNotificationText(ctx, notification);

// renderNotificationTextの実用的な使用例
const result = instance.renderNotificationText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderNotificationReward

**シグネチャ**:
```javascript
 renderNotificationReward(ctx, notification)
```

**パラメーター**:
- `ctx`
- `notification`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderNotificationReward(ctx, notification);

// renderNotificationRewardの実用的な使用例
const result = instance.renderNotificationReward(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### truncateText

**シグネチャ**:
```javascript
 truncateText(ctx, text, maxWidth)
```

**パラメーター**:
- `ctx`
- `text`
- `maxWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.truncateText(ctx, text, maxWidth);

// truncateTextの実用的な使用例
const result = instance.truncateText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearAllNotifications

**シグネチャ**:
```javascript
 clearAllNotifications()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearAllNotifications();

// clearAllNotificationsの実用的な使用例
const result = instance.clearAllNotifications(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSoundEnabled

**シグネチャ**:
```javascript
 setSoundEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSoundEnabled(enabled);

// setSoundEnabledの実用的な使用例
const result = instance.setSoundEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### dispose

**シグネチャ**:
```javascript
 dispose()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.dispose();

// disposeの実用的な使用例
const result = instance.dispose(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.checkInterval)
```

**パラメーター**:
- `this.checkInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.checkInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `newNotifications` | 説明なし |
| `notification` | 説明なし |
| `notification` | 説明なし |
| `index` | 説明なし |
| `rarity` | 説明なし |
| `ap` | 説明なし |
| `notification` | 説明なし |
| `animSpeed` | 説明なし |
| `enterProgress` | 説明なし |
| `exitProgress` | 説明なし |
| `c1` | 説明なし |
| `c3` | 説明なし |
| `ctx` | 説明なし |
| `centerX` | 説明なし |
| `centerY` | 説明なし |
| `rarity` | 説明なし |
| `iconSize` | 説明なし |
| `iconX` | 説明なし |
| `iconY` | 説明なし |
| `textX` | 説明なし |
| `textY` | 説明なし |
| `textWidth` | 説明なし |
| `titleText` | 説明なし |
| `descText` | 説明なし |
| `rewardX` | 説明なし |
| `rewardY` | 説明なし |

---

