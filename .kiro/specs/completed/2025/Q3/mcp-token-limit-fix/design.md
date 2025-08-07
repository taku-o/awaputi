# MCPトークン制限問題修正 - 設計書

## 概要

MCPツールのトークン制限超過問題を解決するため、大きなファイルの分割とプロジェクト構造の最適化を行う。

## アーキテクチャ

### 現在の問題構造
```
src/
├── scenes/UserInfoScene.js (11,260語) ← 最優先分割対象
├── core/EventStageManager.js (9,914語) ← 高優先度
├── utils/MobilePerformanceOptimizer.js (8,405語) ← 高優先度
├── audio/SoundEffectSystem.js (7,349語) ← 高優先度
└── core/help/TutorialOverlay.js (6,627語) ← 高優先度
```

### 目標構造
```
src/
├── scenes/
│   ├── UserInfoScene.js (< 2,500語)
│   └── components/
│       ├── user-info/
│       │   ├── UserProfileManager.js
│       │   ├── UserStatisticsRenderer.js
│       │   └── UserDataExporter.js
├── core/
│   ├── EventStageManager.js (< 2,500語)
│   └── events/
│       ├── SeasonalEventManager.js
│       ├── EventRankingSystem.js
│       └── EventNotificationSystem.js
└── utils/
    ├── MobilePerformanceOptimizer.js (< 2,500語)
    └── mobile/
        ├── MobileResourceManager.js
        ├── MobileRenderOptimizer.js
        └── MobileBatteryOptimizer.js
```

## コンポーネントと責任分離

### 1. UserInfoScene分割設計

**現在の責任:**
- ユーザー情報表示
- 統計データ管理
- 実績システム
- ヘルプシステム
- エクスポート/インポート機能
- タブ管理
- ダイアログ管理

**分割後の構造:**
```
UserInfoScene.js (メインコントローラー)
├── components/user-info/
│   ├── UserProfileManager.js (プロフィール管理)
│   ├── UserStatisticsRenderer.js (統計表示)
│   ├── UserAchievementDisplay.js (実績表示)
│   ├── UserDataExporter.js (データエクスポート)
│   └── UserHelpIntegration.js (ヘルプ統合)
```

### 2. EventStageManager分割設計

**現在の責任:**
- イベントステージ管理
- 季節イベント処理
- ランキングシステム
- 通知システム
- イベント履歴管理

**分割後の構造:**
```
EventStageManager.js (メインマネージャー)
├── events/
│   ├── SeasonalEventManager.js (季節イベント)
│   ├── EventRankingSystem.js (ランキング)
│   ├── EventNotificationSystem.js (通知)
│   └── EventHistoryManager.js (履歴管理)
```

### 3. MobilePerformanceOptimizer分割設計

**現在の責任:**
- モバイル最適化
- リソース管理
- レンダリング最適化
- バッテリー最適化
- メモリ管理

**分割後の構造:**
```
MobilePerformanceOptimizer.js (メインオプティマイザー)
├── mobile/
│   ├── MobileResourceManager.js (リソース管理)
│   ├── MobileRenderOptimizer.js (レンダリング)
│   ├── MobileBatteryOptimizer.js (バッテリー)
│   └── MobileMemoryManager.js (メモリ)
```

## データモデル

### ファイルサイズ監視データ
```javascript
{
  filePath: string,
  wordCount: number,
  limit: number,
  status: 'ok' | 'warning' | 'error',
  lastChecked: Date,
  suggestions: string[]
}
```

### 分割進捗データ
```javascript
{
  originalFile: string,
  targetFiles: string[],
  status: 'pending' | 'in_progress' | 'completed',
  wordCountBefore: number,
  wordCountAfter: number[],
  dependencies: string[]
}
```

## エラーハンドリング

### 分割エラー処理
1. **インポート依存関係エラー**: 分割時の循環参照検出
2. **機能破綻エラー**: 分割後の機能テスト失敗
3. **ファイルサイズエラー**: 分割後もサイズ制限超過

### 回復戦略
1. **段階的ロールバック**: 問題のある分割のみ元に戻す
2. **依存関係修復**: 自動的なインポート文の更新
3. **テスト駆動分割**: 各分割後に自動テスト実行

## テスト戦略

### 単体テスト
- 分割後の各コンポーネントの機能テスト
- インポート/エクスポートの整合性テスト
- ファイルサイズ制限の検証テスト

### 統合テスト
- 分割前後の機能同等性テスト
- シーン間の連携テスト
- MCPツールの動作確認テスト

### パフォーマンステスト
- 分割後のロード時間測定
- メモリ使用量の比較
- バンドルサイズの検証

## 監視システム設計

### ファイルサイズ監視
```javascript
class FileSizeMonitor {
  checkFileSize(filePath) {
    // ワード数カウント
    // 制限チェック
    // 警告生成
  }
  
  generateReport() {
    // 制限超過ファイル一覧
    // 分割提案
    // 優先度付け
  }
}
```

### 自動化スクリプト
- pre-commitフックでのサイズチェック
- CIでの継続的監視
- 開発時のリアルタイム警告

## MCPツール最適化

### 除外パターン設定
```json
{
  "exclude": [
    "dist/**",
    "node_modules/**",
    "**/*.log",
    "test-results/**",
    "playwright-report/**"
  ],
  "fileSizeLimit": 2500,
  "tokenLimit": 20000
}
```

### 検索最適化
- ファイルサイズによる優先度付け
- 頻繁に使用されるファイルの優先表示
- 分割されたファイルの関連性表示