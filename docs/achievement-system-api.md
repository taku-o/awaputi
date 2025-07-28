# Achievement System API Documentation

## 概要

BubblePop ゲームの実績システムは、プレイヤーの行動や達成を追跡し、報酬を提供する包括的なシステムです。このドキュメントでは、開発者向けのAPI仕様と使用方法について説明します。

## システム構成

### 主要コンポーネント

1. **AchievementManager** - 実績管理の中核
2. **AchievementEventIntegrator** - ゲームシステムとの統合
3. **AchievementNotificationSystem** - 通知表示システム
4. **AchievementStatsUI** - 統計表示UI
5. **AchievementHelpSystem** - ヘルプ・チュートリアルシステム

### アーキテクチャ図

```
┌─────────────────────┐    ┌──────────────────────┐
│   GameEngine        │    │  AchievementManager  │
│                     │◄──►│                      │
│ - BubbleManager     │    │ - 実績定義           │
│ - ScoreManager      │    │ - 進捗追跡           │
│ - GameScene         │    │ - データ永続化       │
└─────────────────────┘    └──────────────────────┘
           ▲                           ▲
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│ EventIntegrator     │    │ NotificationSystem   │
│                     │    │                      │
│ - イベント統合      │    │ - 通知表示           │
│ - セッション追跡    │    │ - キュー管理         │
│ - 進捗更新          │    │ - アニメーション     │
└─────────────────────┘    └──────────────────────┘
```

## AchievementManager API

### コンストラクタ

```javascript
const achievementManager = new AchievementManager(playerData);
```

**パラメータ:**
- `playerData`: PlayerData インスタンス

### 主要メソッド

#### getAchievements()

```javascript
const achievements = achievementManager.getAchievements();
```

**戻り値:** `Array<Achievement>`
- 全実績の配列を返します

**Achievement オブジェクト構造:**
```javascript
{
    id: string,              // 実績ID
    name: string,            // 実績名
    description: string,     // 実績説明
    icon: string,           // アイコン絵文字
    category: string,       // カテゴリ
    rarity: string,         // レアリティ
    unlocked: boolean,      // 解除状態
    unlockedDate: string,   // 解除日時
    progress: {
        current: number,    // 現在値
        target: number      // 目標値
    },
    reward: {
        ap: number          // 報酬AP
    }
}
```

#### getAchievement(id)

```javascript
const achievement = achievementManager.getAchievement('first_score');
```

**パラメータ:**
- `id`: 実績ID

**戻り値:** `Achievement | null`

#### updateProgress(achievementId, value)

```javascript
achievementManager.updateProgress('first_score', 100);
```

**パラメータ:**
- `achievementId`: 実績ID
- `value`: 更新値

**戻り値:** `boolean` - 更新成功の可否

#### checkAndUnlockAchievement(achievementId)

```javascript
const unlocked = achievementManager.checkAndUnlockAchievement('first_score');
```

**パラメータ:**
- `achievementId`: 実績ID

**戻り値:** `boolean` - 解除されたかどうか

#### batchUpdateProgress(updates)

```javascript
const updates = [
    { achievementId: 'first_score', value: 100 },
    { achievementId: 'first_pop', value: 1 }
];
const processed = achievementManager.batchUpdateProgress(updates);
```

**パラメータ:**
- `updates`: 更新データの配列

**戻り値:** `number` - 処理された更新数

#### getAchievementsByCategory()

```javascript
const categorized = achievementManager.getAchievementsByCategory();
```

**戻り値:** `Object` - カテゴリ別実績オブジェクト

```javascript
{
    score: {
        name: 'スコア系',
        achievements: [...]
    },
    play: {
        name: 'プレイ系',
        achievements: [...]
    },
    // ...
}
```

#### calculateTotalRewards()

```javascript
const rewards = achievementManager.calculateTotalRewards();
```

**戻り値:** `Object`

```javascript
{
    ap: number  // 獲得済み総AP
}
```

### イベント

#### achievementUnlocked

```javascript
achievementManager.on('achievementUnlocked', (achievement) => {
    console.log('実績解除:', achievement.name);
});
```

**パラメータ:**
- `achievement`: 解除された実績オブジェクト

#### progressUpdated

```javascript
achievementManager.on('progressUpdated', (achievementId, oldValue, newValue) => {
    console.log(`進捗更新: ${achievementId} ${oldValue} → ${newValue}`);
});
```

## AchievementEventIntegrator API

### コンストラクタ

```javascript
const integrator = new AchievementEventIntegrator(achievementManager, playerData);
```

### システム統合メソッド

#### integrateBubbleManager(bubbleManager)

```javascript
integrator.integrateBubbleManager(gameEngine.bubbleManager);
```

バブル管理システムとの統合を行います。

#### integrateScoreManager(scoreManager)

```javascript
integrator.integrateScoreManager(gameEngine.scoreManager);
```

スコア管理システムとの統合を行います。

#### integrateGameScene(gameScene)

```javascript
integrator.integrateGameScene(gameEngine.currentScene);
```

ゲームシーンとの統合を行います。

### イベントハンドラー

#### handleBubblePopped(bubbleType, bubbleData)

```javascript
integrator.handleBubblePopped('normal', { x: 100, y: 100 });
```

バブルポップイベントを処理します。

#### handleScoreAdded(score, multiplier)

```javascript
integrator.handleScoreAdded(100, 2);
```

スコア追加イベントを処理します。

#### handleGameOver(reason)

```javascript
integrator.handleGameOver('cleared');
```

ゲーム終了イベントを処理します。

### セッション管理

#### resetSessionTracking()

```javascript
integrator.resetSessionTracking();
```

セッション追跡データをリセットします。

#### getSessionTime()

```javascript
const sessionTime = integrator.getSessionTime();
```

**戻り値:** `number` - セッション時間（ミリ秒）

## AchievementNotificationSystem API

### コンストラクタ

```javascript
const notificationSystem = new AchievementNotificationSystem(audioManager);
```

### 通知表示

#### showUnlockNotification(achievement)

```javascript
notificationSystem.showUnlockNotification(achievement);
```

実績解除通知を表示します。

#### clearNotifications()

```javascript
notificationSystem.clearNotifications();
```

全ての通知をクリアします。

### 設定

#### updateSettings(settings)

```javascript
notificationSystem.updateSettings({
    displayDuration: 5000,
    animationDuration: 800,
    maxVisibleNotifications: 3
});
```

### レンダリング

#### render(context, canvas)

```javascript
notificationSystem.render(context, canvas);
```

通知を画面に描画します。

#### update(deltaTime)

```javascript
notificationSystem.update(16);
```

通知の状態を更新します。

## AchievementStatsUI API

### コンストラクタ

```javascript
const statsUI = new AchievementStatsUI(achievementManager);
```

### 統計取得

#### getStatistics()

```javascript
const stats = statsUI.getStatistics();
```

**戻り値:** 統計データオブジェクト

```javascript
{
    overall: {
        total: number,
        unlocked: number,
        locked: number,
        completionRate: number,
        totalRewards: number
    },
    categories: {
        score: {
            name: string,
            total: number,
            unlocked: number,
            completionRate: number,
            rewards: number
        },
        // ...
    },
    recent: Array<Achievement>,
    progress: {
        progressRanges: {
            high: number,
            medium: number,
            low: number
        },
        averageProgress: number
    },
    rewards: {
        earnedAP: number,
        potentialAP: number,
        totalAP: number,
        earnedPercentage: number
    }
}
```

### UI描画

#### renderOverallStats(context, x, y, width, height)

全体統計を描画します。

#### renderCategoryStats(context, x, y, width, height)

カテゴリ別統計を描画します。

#### renderRecentUnlocks(context, x, y, width, height)

最近の解除実績を描画します。

#### renderProgressChart(context, x, y, width, height)

進捗チャートを描画します。

### キャッシュ管理

#### clearCache()

```javascript
statsUI.clearCache();
```

統計キャッシュをクリアします。

## AchievementHelpSystem API

### コンストラクタ

```javascript
const helpSystem = new AchievementHelpSystem(achievementManager);
```

### ヘルプ表示

#### showHelp(section)

```javascript
helpSystem.showHelp('overview');
```

**利用可能なセクション:**
- `'overview'` - 概要
- `'categories'` - カテゴリ詳細
- `'progress'` - 進捗と解除条件
- `'rewards'` - 報酬とAP活用
- `'tips'` - 攻略のコツ
- `'faq'` - よくある質問

#### hideHelp()

```javascript
helpSystem.hideHelp();
```

#### showContextHelp(achievementId)

```javascript
helpSystem.showContextHelp('first_score');
```

特定の実績に関連するヘルプを表示します。

### チュートリアル

#### startTutorial()

```javascript
helpSystem.startTutorial();
```

#### nextTutorialStep()

```javascript
helpSystem.nextTutorialStep();
```

#### completeTutorial()

```javascript
helpSystem.completeTutorial();
```

### イベント処理

#### handleClick(x, y, canvas)

```javascript
const handled = helpSystem.handleClick(x, y, canvas);
```

**戻り値:** `boolean` - クリックが処理されたかどうか

## 実績定義の追加

### 新しい実績の定義

```javascript
const newAchievement = {
    id: 'custom_achievement',
    name: 'カスタム実績',
    description: '特別な条件をクリア',
    icon: '🌟',
    category: 'special',
    rarity: 'epic',
    unlocked: false,
    unlockedDate: null,
    progress: {
        current: 0,
        target: 100
    },
    reward: {
        ap: 150
    },
    // カスタム条件評価関数
    checkCondition: (playerData, sessionData) => {
        return playerData.get('customMetric') >= 100;
    }
};
```

### 実績の登録

```javascript
// AchievementManager の achievements 配列に追加
achievementManager.achievements.push(newAchievement);
```

## パフォーマンス最適化

### バッチ処理の活用

```javascript
// 単発更新（非推奨：高頻度の場合）
achievementManager.updateProgress('achievement1', 1);
achievementManager.updateProgress('achievement2', 2);

// バッチ更新（推奨）
achievementManager.batchUpdateProgress([
    { achievementId: 'achievement1', value: 1 },
    { achievementId: 'achievement2', value: 2 }
]);
```

### キャッシュの活用

```javascript
// 関連実績のキャッシュ利用
const relevantAchievements = achievementManager.getRelevantAchievements('score');
```

### スロットリングの設定

```javascript
// 高頻度更新のスロットリング有効化
achievementManager.enableThrottling = true;
```

## エラーハンドリング

### データ検証

```javascript
const isValid = achievementManager.validateSaveData(saveData);
if (!isValid) {
    console.warn('Invalid achievement data detected');
}
```

### データ復旧

```javascript
const recovered = achievementManager.attemptDataRecovery();
if (recovered) {
    console.log('Achievement data recovered successfully');
}
```

### エラーイベント

```javascript
achievementManager.on('error', (error) => {
    console.error('Achievement system error:', error);
});
```

## 拡張とカスタマイズ

### カスタム実績カテゴリ

```javascript
// 新しいカテゴリの追加
const customCategory = {
    key: 'custom',
    name: 'カスタム',
    description: 'カスタム実績'
};
```

### カスタム通知スタイル

```javascript
// 通知システムのカスタマイズ
notificationSystem.customStyles = {
    legendary: {
        backgroundColor: '#FFD700',
        borderColor: '#FF8C00',
        animation: 'sparkle'
    }
};
```

### カスタムヘルプコンテンツ

```javascript
// ヘルプシステムへのコンテンツ追加
helpSystem.helpContent.custom = {
    title: 'カスタムヘルプ',
    icon: '🔧',
    content: ['カスタム説明...']
};
```

## 統合例

### 完全な統合例

```javascript
// 初期化
const achievementManager = new AchievementManager(playerData);
const eventIntegrator = new AchievementEventIntegrator(achievementManager, playerData);
const notificationSystem = new AchievementNotificationSystem(audioManager);
const statsUI = new AchievementStatsUI(achievementManager);
const helpSystem = new AchievementHelpSystem(achievementManager);

// ゲームシステムとの統合
eventIntegrator.integrateBubbleManager(gameEngine.bubbleManager);
eventIntegrator.integrateScoreManager(gameEngine.scoreManager);
eventIntegrator.integrateGameScene(gameEngine.gameScene);

// イベントリスナー設定
achievementManager.on('achievementUnlocked', (achievement) => {
    notificationSystem.showUnlockNotification(achievement);
    audioManager.playSound('achievement_unlock');
});

// ゲームループでの更新
function gameLoop(deltaTime) {
    notificationSystem.update(deltaTime);
    
    // 描画
    notificationSystem.render(context, canvas);
    helpSystem.render(context, canvas);
}

// ユーザーインタラクション
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    helpSystem.handleClick(x, y, canvas);
});
```

## ベストプラクティス

### 1. 効率的な実績更新

```javascript
// Good: バッチ処理で複数更新
const updates = collectAchievementUpdates(gameState);
achievementManager.batchUpdateProgress(updates);

// Bad: 個別に更新
gameEvents.forEach(event => {
    achievementManager.updateProgress(event.achievementId, event.value);
});
```

### 2. 適切なエラーハンドリング

```javascript
try {
    achievementManager.updateProgress(achievementId, value);
} catch (error) {
    console.error('Achievement update failed:', error);
    // Graceful degradation
    fallbackUpdateMethod(achievementId, value);
}
```

### 3. メモリ効率の最適化

```javascript
// 定期的なキャッシュクリア
setInterval(() => {
    if (achievementManager.getCacheSize() > MAX_CACHE_SIZE) {
        achievementManager.clearPerformanceCache();
    }
}, 300000); // 5分間隔
```

### 4. ユーザビリティの向上

```javascript
// 初回ユーザー向けチュートリアル
if (playerData.get('isFirstTime')) {
    helpSystem.startTutorial();
    playerData.set('isFirstTime', false);
}
```

## トラブルシューティング

### よくある問題と解決策

#### 1. 実績が解除されない

**原因:** 進捗値が正しく更新されていない
**解決策:** 
```javascript
// デバッグ情報を確認
console.log('Current progress:', achievement.progress.current);
console.log('Target:', achievement.progress.target);
```

#### 2. 通知が表示されない

**原因:** AudioManager が初期化されていない
**解決策:**
```javascript
// AudioManager の初期化確認
if (!audioManager) {
    notificationSystem.enableAudio = false;
}
```

#### 3. パフォーマンスの低下

**原因:** 高頻度の個別更新
**解決策:**
```javascript
// バッチ処理とスロットリングの活用
achievementManager.enableThrottling = true;
```

#### 4. データが保存されない

**原因:** LocalStorage の容量制限
**解決策:**
```javascript
// データ圧縮と分割保存
achievementManager.enableDataCompression = true;
```

このAPIドキュメントを参照して、実績システムを効果的に活用してください。