# Specs Management

## Active Specs
現在進行中のspecsです。

## Completed Specs
完了したspecsは `completed/` フォルダに移動されます。

### 2025年Q3にアーカイブされたspecs
- `accessibility-enhancement` - アクセシビリティ強化
- `achievement-system-implementation` - 実績システム実装
- `audio-system-enhancement-issue-23` - 音響システム強化 (Issue #23)
- `bubble-pop-web-game` - バブルポップWebゲーム
- `configuration-refactoring` - 設定システムリファクタリング
- `data-management-enhancement-issue-29` - データ管理強化 (Issue #29)
- `debug-tools-enhancement-issue-30` - デバッグツール強化 (Issue #30)
- `documentation-enhancement-issue-31` - ドキュメント強化 (Issue #31)
- `event-stage-system-issue-28` - イベントステージシステム (Issue #28)
- `game-analytics-issue-35` - ゲーム分析機能 (Issue #35)
- `game-balance-test-sync` - ゲームバランステスト同期
- `internationalization-issue-27` - 国際化対応 (Issue #27)
- `large-file-optimization-issue-52` - 大型ファイル最適化 (Issue #52)
- `mobile-enhancement-issue-26` - モバイル強化 (Issue #26)
- `performance-optimization-stability` - パフォーマンス最適化・安定性
- `pwa-implementation-issue-33` - PWA実装 (Issue #33)
- `seo-optimization-issue-34` - SEO最適化 (Issue #34)
- `serviceworker-postmessage-fix-issue-58` - ServiceWorker postMessage修正 (Issue #58)
- `statistics-system-enhancement` - 統計システム強化
- `test-fixes` - テスト修正
- `user-info-scene-implementation` - ユーザー情報シーン実装
- `visual-effects-enhancement-issue-24` - 視覚効果強化 (Issue #24)

## Archive Structure
```
.kiro/specs/
├── README.md (this file)
├── completed/
│   ├── 2024/
│   │   ├── Q4/
│   │   └── ...
│   └── 2025/
│       ├── Q1/
│       └── ...
└── [active-specs]/
```

## Spec Status Guidelines
- **Active**: 現在作業中
- **Completed**: 実装完了、テスト済み
- **Archived**: 完了後にアーカイブ済み
- **Deprecated**: 廃止されたspec

## Moving Completed Specs
完了したspecsを移動する際は、以下の情報を保持してください：
- 完了日
- 関連するIssue番号
- 主要な成果物
- 学んだ教訓