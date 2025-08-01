# Design Document

## Overview

イベントステージシステムは、既存のEventStageManagerクラスを拡張し、季節イベント、特別イベント、チャレンジステージの完全実装を行う。システムは期間限定コンテンツの管理、特別ルールの適用、報酬システム、通知機能を統合し、長期的なユーザー維持を実現する。

現在のEventStageManagerは基本構造を持つが、以下の機能が不完全または未実装：
- 季節イベントの自動スケジューリング
- StageSelectSceneとの統合
- イベント通知システム
- 詳細な統計収集
- 管理者向けイベント制御機能

## Architecture

### System Integration

```
GameEngine
├── EventStageManager (拡張)
├── StageManager (統合強化)
├── AchievementNotificationSystem (活用)
├── StatisticsManager (連携)
└── SceneManager
    └── StageSelectScene (イベント表示機能追加)
```

### Event Flow

```
1. Event Scheduling → 2. Event Activation → 3. Player Notification → 4. Stage Selection → 5. Event Execution → 6. Reward Distribution → 7. Statistics Recording
```

## Components and Interfaces

### 1. Enhanced EventStageManager

**拡張機能:**
- 季節イベントの自動スケジューリング
- イベント通知システムとの統合
- 管理者向けイベント制御API
- 詳細統計収集

**新規メソッド:**
```javascript
// 季節イベント管理
scheduleSeasonalEvents()
checkSeasonalEventActivation(currentDate)
getSeasonalEventConfig(season)

// 通知システム統合
sendEventNotification(eventId, notificationType)
checkEventNotifications()

// 管理者機能
adminActivateEvent(eventId, duration, options)
adminDeactivateEvent(eventId)
getEventManagementStatus()

// 統計機能
recordEventParticipation(eventId, playerId)
getDetailedEventStatistics()
exportEventData()
```

### 2. Event Notification System

既存のAchievementNotificationSystemを拡張してイベント通知に対応：

**通知タイプ:**
- `EVENT_STARTED`: 新しいイベント開始
- `EVENT_ENDING`: イベント終了警告
- `EVENT_ELIGIBLE`: 参加条件達成
- `EVENT_REMINDER`: 参加リマインダー

**通知データ構造:**
```javascript
{
  type: 'event',
  subType: 'EVENT_STARTED',
  eventId: 'spring-cherry-blossom',
  title: '桜イベント開始！',
  message: '春の桜ステージが利用可能になりました',
  icon: '🌸',
  duration: 4000,
  actions: ['参加する', '後で']
}
```

### 3. Enhanced StageSelectScene

**追加機能:**
- イベントステージ専用セクション
- イベント残り時間表示
- イベント通知表示
- イベントフィルタリング

**新規UI要素:**
```javascript
// イベントセクション
renderEventSection(context)
renderEventStageItem(context, event, x, y, width, height)
renderEventTimer(context, timeRemaining)
renderEventNotificationBadge(context)

// イベントフィルタ
toggleEventFilter()
filterEventsByType(type)
sortEventsByPriority()
```

### 4. Seasonal Event Scheduler

**季節判定ロジック:**
```javascript
const SEASONAL_PERIODS = {
  spring: { months: [3, 4, 5], events: ['cherry-blossom', 'spring-festival'] },
  summer: { months: [6, 7, 8], events: ['fireworks', 'summer-festival'] },
  autumn: { months: [9, 10, 11], events: ['autumn-leaves', 'harvest-festival'] },
  winter: { months: [12, 1, 2], events: ['snow-stage', 'new-year'] }
};
```

**自動スケジューリング:**
- 日付ベースの自動有効化/無効化
- 地域設定対応（将来拡張）
- カスタムスケジュール設定

### 5. Event Statistics Collector

**収集データ:**
```javascript
{
  eventId: 'golden-rush',
  participations: [
    {
      playerId: 'player1',
      startTime: timestamp,
      endTime: timestamp,
      completed: true,
      score: 15000,
      specialAchievements: ['high-score', 'chain-master']
    }
  ],
  aggregateStats: {
    totalParticipations: 150,
    completionRate: 0.85,
    averageScore: 12500,
    popularityRank: 2
  }
}
```

## Data Models

### Event Configuration Model

```javascript
{
  id: 'spring-cherry-blossom',
  name: '桜の舞うステージ',
  description: '美しい桜が舞い散る春限定ステージ',
  type: 'seasonal',
  season: 'spring',
  
  // スケジュール設定
  schedule: {
    type: 'seasonal', // 'seasonal', 'fixed', 'recurring', 'manual'
    startCondition: { season: 'spring' },
    endCondition: { season: 'spring', offset: -7 }, // 春終了7日前
    duration: null, // 季節全体
    recurring: false
  },
  
  // ゲームプレイ設定
  gameplay: {
    duration: 300000,
    bubbleTypes: ['normal', 'cherry', 'pink', 'rainbow'],
    spawnRate: 1.8,
    maxBubbles: 25,
    specialRules: {
      cherryBlossomEffect: true,
      windEffect: true,
      scoreMultiplier: 1.5
    }
  },
  
  // 報酬設定
  rewards: {
    participation: { ap: 100, items: ['cherry-badge'] },
    completion: { ap: 200, items: ['spring-crown'] },
    highScore: { threshold: 20000, ap: 300, items: ['sakura-master'] }
  },
  
  // 通知設定
  notifications: {
    onStart: true,
    onEnd: true,
    reminderInterval: 86400000, // 24時間
    endWarning: 604800000 // 7日前
  }
}
```

### Event Participation Record

```javascript
{
  id: 'participation-uuid',
  eventId: 'spring-cherry-blossom',
  playerId: 'player-uuid',
  startTime: timestamp,
  endTime: timestamp,
  completed: boolean,
  score: number,
  stats: {
    bubblesPopped: number,
    specialBubblesPopped: number,
    maxChain: number,
    timeRemaining: number,
    specialAchievements: string[]
  },
  rewards: {
    ap: number,
    items: string[],
    specialRewards: object[]
  }
}
```

## Error Handling

### Event Scheduling Errors

```javascript
try {
  this.scheduleSeasonalEvents();
} catch (error) {
  console.error('Event scheduling failed:', error);
  // フォールバック: 手動イベントのみ有効
  this.enableManualEventsOnly();
}
```

### Event Execution Errors

```javascript
startEventStage(eventId) {
  try {
    const event = this.validateEvent(eventId);
    this.applyEventSettings(event);
    return this.executeEventStart(event);
  } catch (error) {
    this.handleEventError(error, eventId);
    return false;
  }
}
```

### Notification System Errors

```javascript
sendEventNotification(eventId, type) {
  try {
    const notification = this.createEventNotification(eventId, type);
    this.gameEngine.achievementNotificationSystem.queueNotification(notification);
  } catch (error) {
    console.warn('Event notification failed:', error);
    // 通知失敗は致命的ではないため、ゲーム続行
  }
}
```

## Testing Strategy

### Unit Tests

**EventStageManager Tests:**
```javascript
describe('EventStageManager', () => {
  test('seasonal event activation', () => {
    // 季節イベントの自動有効化テスト
  });
  
  test('event notification sending', () => {
    // イベント通知送信テスト
  });
  
  test('event statistics collection', () => {
    // 統計収集テスト
  });
});
```

**StageSelectScene Tests:**
```javascript
describe('StageSelectScene Event Integration', () => {
  test('event stage display', () => {
    // イベントステージ表示テスト
  });
  
  test('event timer display', () => {
    // イベントタイマー表示テスト
  });
});
```

### Integration Tests

**Event Flow Tests:**
```javascript
describe('Event System Integration', () => {
  test('complete event lifecycle', () => {
    // イベント開始→通知→参加→完了→報酬の全フロー
  });
  
  test('multiple concurrent events', () => {
    // 複数イベント同時実行テスト
  });
});
```

### Performance Tests

**Event System Performance:**
- イベント数増加時のパフォーマンス影響
- 通知システムのメモリ使用量
- 統計収集のオーバーヘッド

### User Experience Tests

**Event Discovery:**
- プレイヤーがイベントを発見できるか
- 通知が適切なタイミングで表示されるか
- イベント情報が分かりやすく表示されるか

**Event Participation:**
- イベントステージへのアクセスが簡単か
- 特別ルールが明確に伝わるか
- 報酬が適切に付与されるか