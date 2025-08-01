# Design Document

## Overview

UserInfoSceneは、プレイヤーの統計情報、実績、設定を一元的に表示・管理する画面です。現在のプレースホルダー実装を、既存のプロジェクトアーキテクチャに統合された完全な機能に拡張します。Canvas 2D APIを使用した描画システムと、既存のStatisticsManager、AchievementManager、PlayerDataクラスとの統合を行います。

## Architecture

### Component Structure

```
UserInfoScene
├── StatisticsDisplayComponent
│   ├── BasicStatsSection
│   ├── BubbleStatsSection
│   ├── ComboStatsSection
│   └── StageStatsSection
├── AchievementDisplayComponent
│   ├── UnlockedAchievementsSection
│   └── ProgressAchievementsSection
├── UserManagementComponent
│   ├── UsernameChangeDialog
│   ├── DataExportDialog
│   └── DataImportDialog
└── NavigationComponent
    ├── TabNavigation
    └── BackButton
```

### Integration Points

- **StatisticsManager**: 統計データの取得と表示
- **AchievementManager**: 実績データの取得と進捗表示
- **PlayerData**: ユーザー情報の管理と更新
- **SettingsManager**: データエクスポート/インポート機能
- **ResponsiveCanvasManager**: レスポンシブレイアウト対応
- **LocalizationManager**: 多言語対応
- **ErrorHandler**: エラーハンドリング

## Components and Interfaces

### UserInfoScene Class

```javascript
class UserInfoScene extends Scene {
    constructor(gameEngine)
    enter()
    exit()
    update(deltaTime)
    render(context)
    handleInput(event)
    
    // Private methods
    renderTabs(context)
    renderStatistics(context)
    renderAchievements(context)
    renderUserManagement(context)
    handleTabNavigation(event)
    handleUsernameChange(event)
    handleDataExport()
    handleDataImport(data)
}
```

### StatisticsDisplayComponent

統計情報の表示を担当するコンポーネント

```javascript
class StatisticsDisplayComponent {
    constructor(statisticsManager, playerData)
    render(context, x, y, width, height)
    renderBasicStats(context, x, y, width)
    renderBubbleStats(context, x, y, width)
    renderComboStats(context, x, y, width)
    renderStageStats(context, x, y, width)
}
```

### AchievementDisplayComponent

実績情報の表示を担当するコンポーネント

```javascript
class AchievementDisplayComponent {
    constructor(achievementManager)
    render(context, x, y, width, height)
    renderUnlockedAchievements(context, x, y, width)
    renderProgressAchievements(context, x, y, width)
    renderProgressBar(context, x, y, width, progress, total)
}
```

### UserManagementComponent

ユーザー管理機能を担当するコンポーネント

```javascript
class UserManagementComponent {
    constructor(playerData, settingsManager)
    render(context, x, y, width, height)
    showUsernameChangeDialog()
    showDataExportDialog()
    showDataImportDialog()
    exportUserData()
    importUserData(jsonData)
}
```

## Data Models

### UserInfoState

```javascript
const UserInfoState = {
    currentTab: 'statistics', // 'statistics', 'achievements', 'management'
    showingDialog: null, // null, 'username', 'export', 'import'
    dialogData: {},
    scrollPosition: 0,
    selectedItem: -1
}
```

### StatisticsData

```javascript
const StatisticsData = {
    basic: {
        totalGamesPlayed: number,
        totalPlayTime: string,
        totalScore: number,
        highestScore: number,
        averageScore: number,
        completionRate: number
    },
    bubbles: {
        totalPopped: number,
        totalMissed: number,
        accuracy: string,
        typeBreakdown: object,
        favoriteType: object,
        averageReactionTime: string
    },
    combos: {
        highestCombo: number,
        averageCombo: string,
        totalCombos: number,
        comboBreaks: number,
        comboSuccessRate: string
    },
    stages: {
        completed: number,
        failed: number,
        stageBreakdown: object,
        favoriteStage: object
    }
}
```

### AchievementData

```javascript
const AchievementData = {
    id: string,
    name: string,
    description: string,
    icon: string,
    unlocked: boolean,
    progress: {
        current: number,
        target: number
    },
    reward: {
        ap: number
    }
}
```

## Error Handling

### Error Categories

1. **DATA_LOAD_ERROR**: 統計データや実績データの読み込みエラー
2. **VALIDATION_ERROR**: ユーザー名やインポートデータの検証エラー
3. **EXPORT_ERROR**: データエクスポート時のエラー
4. **IMPORT_ERROR**: データインポート時のエラー
5. **RENDER_ERROR**: 描画処理でのエラー

### Error Recovery Strategies

- データ読み込みエラー: デフォルト値を表示し、エラーメッセージを表示
- 検証エラー: ユーザーにフィードバックを提供し、再入力を促す
- エクスポートエラー: 代替手段（クリップボードコピー）を提供
- インポートエラー: 詳細なエラーメッセージと修正方法を表示
- 描画エラー: 基本的なレイアウトにフォールバック

## Testing Strategy

### Unit Tests

1. **UserInfoScene**: シーンの基本機能（enter, exit, update, render）
2. **StatisticsDisplayComponent**: 統計データの正確な表示
3. **AchievementDisplayComponent**: 実績データの正確な表示
4. **UserManagementComponent**: ユーザー名変更、データエクスポート/インポート
5. **Data Validation**: ユーザー名とインポートデータの検証ロジック

### Integration Tests

1. **StatisticsManager Integration**: 統計データの取得と表示の統合
2. **AchievementManager Integration**: 実績データの取得と表示の統合
3. **PlayerData Integration**: ユーザーデータの更新と保存の統合
4. **SettingsManager Integration**: データエクスポート/インポートの統合
5. **Scene Navigation**: MainMenuSceneとの遷移テスト

### E2E Tests

1. **Complete User Flow**: メニューからUserInfoSceneへの遷移と戻り
2. **Username Change Flow**: ユーザー名変更の完全なフロー
3. **Data Export/Import Flow**: データのエクスポートとインポートの完全なフロー
4. **Responsive Behavior**: 異なる画面サイズでの動作確認
5. **Accessibility Features**: キーボードナビゲーションとアクセシビリティ機能

### Performance Tests

1. **Rendering Performance**: 大量の統計データや実績データの描画性能
2. **Memory Usage**: 長時間の使用でのメモリリーク確認
3. **Data Processing**: 大きなデータセットのエクスポート/インポート性能

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        ユーザー情報                          │
├─────────────────────────────────────────────────────────────┤
│  [統計]  [実績]  [管理]                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   基本統計      │  │   泡統計        │                   │
│  │                 │  │                 │                   │
│  │ 総プレイ時間    │  │ 総破壊数        │                   │
│  │ 最高スコア      │  │ 精度            │                   │
│  │ 平均スコア      │  │ お気に入り泡    │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   コンボ統計    │  │   ステージ統計  │                   │
│  │                 │  │                 │                   │
│  │ 最高コンボ      │  │ クリア数        │                   │
│  │ 平均コンボ      │  │ お気に入り      │                   │
│  │ 成功率          │  │ ステージ        │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        [戻る]                               │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme

- **Background**: `#001122` (ダークブルー)
- **Panel Background**: `#1a1a2e` (ダークグレー)
- **Text Primary**: `#ffffff` (白)
- **Text Secondary**: `#cccccc` (ライトグレー)
- **Accent**: `#4a90e2` (ブルー)
- **Success**: `#00aa00` (グリーン)
- **Warning**: `#cc6600` (オレンジ)
- **Error**: `#cc0000` (レッド)

### Typography

- **Title**: `bold 32px Arial`
- **Section Header**: `bold 20px Arial`
- **Body Text**: `16px Arial`
- **Small Text**: `14px Arial`
- **Caption**: `12px Arial`

### Responsive Breakpoints

- **Large Screen** (>800px): 4列レイアウト
- **Medium Screen** (600-800px): 2列レイアウト
- **Small Screen** (<600px): 1列レイアウト、縦スクロール

### Accessibility Features

- **High Contrast Mode**: 背景と文字のコントラスト比を4.5:1以上に設定
- **Large Text Mode**: フォントサイズを1.5倍に拡大
- **Keyboard Navigation**: Tab、Enter、Escapeキーでの操作
- **Screen Reader Support**: 適切なARIAラベルとセマンティック構造

## Implementation Phases

### Phase 1: Core Structure
- UserInfoSceneの基本構造実装
- タブナビゲーション機能
- 基本的な統計表示

### Phase 2: Statistics Display
- StatisticsDisplayComponentの実装
- 詳細な統計データの表示
- レスポンシブレイアウト対応

### Phase 3: Achievement Display
- AchievementDisplayComponentの実装
- 実績の表示と進捗バー
- アイコンとアニメーション

### Phase 4: User Management
- ユーザー名変更機能
- データエクスポート/インポート機能
- 確認ダイアログの実装

### Phase 5: Polish & Testing
- アクセシビリティ機能の実装
- パフォーマンス最適化
- 包括的なテスト実装