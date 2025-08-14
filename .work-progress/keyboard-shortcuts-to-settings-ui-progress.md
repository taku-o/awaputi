# キーボードショートカット設定UI移行プロジェクト - 作業記録

## プロジェクト概要
- **Issue**: #170（GitHub Issue #164のsub issue）
- **目標**: 不要なキーボードショートカットを削除し、機能を設定画面UIに移行
- **開始日**: 2025-01-14

## 現状調査結果（完了）

### 削除対象キーボードショートカット
KeyboardShortcutManager.js の initializeDefaultShortcuts() から削除予定：

#### 基本ゲーム操作
- `F` キー: フルスクリーントグル (`handleFullscreen()`)
- `M` キー: 音声ミュートトグル (`handleMute()`)

#### 音量調整
- `Ctrl+↑`: 音量アップ (`handleVolumeUp()`)
- `Ctrl+↓`: 音量ダウン (`handleVolumeDown()`)

#### アクセシビリティ機能
- `Ctrl+Alt+H`: ハイコントラストトグル (`handleHighContrast()`)
- `Ctrl+Alt+T`: 大きなテキストトグル (`handleLargeText()`)
- `Ctrl+Alt+M`: モーション削減トグル (`handleReducedMotion()`)

#### 設定管理
- `Ctrl+P`: プロファイル切り替え
- `Ctrl+E`: 設定エクスポート
- `Ctrl+I`: 設定インポート

### 移行先UI設計

#### 一般設定カテゴリに追加
- フルスクリーントグルボタン
- 音声ミュートトグルボタン  
- 音量調整ボタン（アップ/ダウン）

#### アクセシビリティ設定カテゴリに追加
- アクセシビリティトグルボタン（既存の場合は確認）
- プロファイル切り替えコントロール
- 設定エクスポートボタン
- 設定インポートボタン

## 次のステップ
tasks.mdの実装計画に従って順次実装作業を開始