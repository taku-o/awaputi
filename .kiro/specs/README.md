# Specs Management

## Active Specs
現在進行中のspecsです。

## Completed Specs
完了したspecsは `completed/` フォルダに移動されます。

### 2025年Q3にアーカイブされたspecs
- `accessibility-enhancement` - アクセシビリティ強化
- `accessibility-file-splitting-phase-e3` - アクセシビリティファイル分割フェーズE3
- `achievement-system-implementation` - 実績システム実装
- `audio-system-enhancement-issue-23` - 音響システム強化 (Issue #23)
- `backup-file-cleanup-issue-104` - バックアップファイルクリーンアップ (Issue #104)
- `backup-tool-file-optimization` - バックアップツールファイル最適化
- `bubble-pop-web-game` - バブルポップWebゲーム
- `challenge-ui-import-fix` - チャレンジUIインポート修正
- `cleanup-old-files` - 古いファイルクリーンアップ
- `comprehensive-test-suite-fix` - 包括的テストスイート修正
- `configuration-refactoring` - 設定システムリファクタリング
- `core-file-splitting-phase-e1` - コアファイル分割フェーズE1
- `core-file-splitting-phase-f1` - コアファイル分割フェーズF1
- `data-management-enhancement-issue-29` - データ管理強化 (Issue #29)
- `debug-test-file-splitting-phase-f2` - デバッグテストファイル分割フェーズF2
- `debug-tools-enhancement-issue-30` - デバッグツール強化 (Issue #30)
- `documentation-enhancement-issue-31` - ドキュメント強化 (Issue #31)
- `event-stage-system-issue-28` - イベントステージシステム (Issue #28)
- `game-analytics-issue-35` - ゲーム分析機能 (Issue #35)
- `game-balance-test-sync` - ゲームバランステスト同期
- `internationalization-issue-27` - 国際化対応 (Issue #27)
- `jest-configuration-fix` - Jest設定修正
- `large-file-optimization-issue-52` - 大型ファイル最適化 (Issue #52)
- `large-file-splitting` - 大型ファイル分割
- `local-file-execution-cors-issue-63` - ローカルファイル実行CORS問題 (Issue #63)
- `mcp-token-limit-fix` - MCPトークン制限修正
- `mobile-enhancement-issue-26` - モバイル強化 (Issue #26)
- `performance-debug-splitting-phase-e2` - パフォーマンスデバッグ分割フェーズE2
- `performance-optimization-stability` - パフォーマンス最適化・安定性
- `performance-utility-splitting-phase-f3` - パフォーマンスユーティリティ分割フェーズF3
- `peripheral-file-splitting-phase-f4` - 周辺ファイル分割フェーズF4
- `phase-g-final-file-splitting` - フェーズG最終ファイル分割
- `pwa-implementation-issue-33` - PWA実装 (Issue #33)
- `seo-optimization-issue-34` - SEO最適化 (Issue #34)
- `serviceworker-postmessage-fix-issue-58` - ServiceWorker postMessage修正 (Issue #58)
- `social-sharing-system` - ソーシャル共有システム
- `statistics-system-enhancement` - 統計システム強化
- `test-fixes` - テスト修正
- `test-suite-repair-issue-106` - テストスイート修復 (Issue #106)
- `tutorial-system` - チュートリアルシステム
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