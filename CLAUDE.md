# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**BubblePop (awaputi)** - HTML5 Canvas を使用したバブルポップゲーム
- **技術スタック**: Vanilla JavaScript (ES6+), HTML5 Canvas, Web APIs
- **アーキテクチャ**: コンポーネントベースのモジュラー設計
- **言語**: 日本語（UI、ドキュメント、コメント）

## 開発環境

### プロジェクト起動
```bash
# ローカル開発サーバー起動（推奨）
python -m http.server 8000
# または
npx serve .

# メインゲームアクセス
# http://localhost:8000

# テスト環境アクセス
# http://localhost:8000/test.html

# デバッグモード
# http://localhost:8000?debug=true
# キーボードショートカット: Ctrl+Shift+D
```

### テスト実行
```bash
# ユニット・統合テスト
npm test

# E2Eテスト
npm run test:e2e

# パフォーマンステスト
npm run test:performance

# 全テストスイート
npm run test:all
```

## アクティブなプロジェクト

### 重要度: 高

#### シンプルエントリーページ導入プロジェクト（Issue #134対応）🔄
**目標**: ユーザーアクティベーション要件を満たすシンプルなエントリーページを実装し、音声・動画再生の制限を解決

**機能概要**: 
- 最小限のHTMLエントリーページを表示
- ユーザークリック後にメインゲーム初期化を実行
- 既存コードの変更なし、追加のみの実装
- レスポンシブ対応とアクセシビリティ確保

**仕様書**: `.kiro/specs/minimal-entry-page/`
- requirements.md: 5つの要件定義
- design.md: シンプルアプローチの設計
- tasks.md: 12段階の実装タスク

**現状**: 実装開始、タスクリストに従って順次作業中

#### Debug Game Startup Issue修正プロジェクト（Issue #113対応）🔄
**目標**: ゲーム起動時の複数のJavaScriptエラーとログ無限ループを修正

**問題の概要**: 
- targetFPS undefined エラー
- title undefined エラー  
- quality level null エラー
- load null エラー
- socialSharingManager.initialize エラー

**現状**: 技術的修正完了（PR #114）、最終検証待ち

#### テストスイート修復プロジェクト（Issue #106対応）🔄
**目標**: Phase G完了後のテスト失敗（15/114ファイル失敗、13%失敗率）を修正し、95%以上の成功率を実現

**進捗**: 
- ✅ API Method Consistency Resolution完了
- ✅ Missing Dependencies Resolution完了
- ✅ Jest Environment Stability完了
- 🔄 残存タスクの実施中

### 重要度: 中

#### ローカルファイル実行CORS問題修正（Issue #63対応）🔄
**目標**: ローカル環境でindex.htmlを直接ブラウザで開いた際に発生するCORSエラーとリソース読み込み問題を解決

**問題**: ES6モジュールのCORSエラー、X-Frame-Optionsメタタグエラー、ファビコン不足

#### MCPトークン制限問題修正（Issue #70対応）🔄
**目標**: MCPツール（find_symbol）のトークン制限超過問題を解決

**実装状況**: 主要な大容量ファイルの分割完了、残作業は統合テストとドキュメント更新

## プロジェクト管理

### プロジェクト情報の参照先
- **完了済みプロジェクト**: [CLAUDE-ARCHIVE.md](CLAUDE-ARCHIVE.md)、[docs/projects/completed-projects.md](docs/projects/completed-projects.md)
- **進行中プロジェクト**: [docs/projects/active-projects.md](docs/projects/active-projects.md)
- **アーキテクチャ設計**: [docs/architecture.md](docs/architecture.md)
- **開発ガイドライン**: [docs/development-guide.md](docs/development-guide.md)

### ファイルサイズ制限ルール（MCPツール対応）
- **制限値**: 1ファイル2,500語以下を推奨
- **監視**: pre-commitフックとCIで自動チェック
- **分割基準**: 単一責任の原則に従ったコンポーネント分離

## その他の進行中プロジェクト

### 長期プロジェクト
- 多言語対応強化（Issue #27）🔄
- イベントステージシステム（Issue #28）🔄
- PWA実装（Issue #33）🔄
- チュートリアルシステム（Issue #36）🔄
- ソーシャル機能強化（Issue #37）🔄
- 視覚効果強化プロジェクト（Issue #24）🔄
- パフォーマンス最適化・安定性向上（Issue #20）🔄

詳細な情報は各参照先ドキュメントをご確認ください。