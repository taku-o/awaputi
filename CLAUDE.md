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

#### JavaScript クラス名重複解決プロジェクト（Issue #131対応）🔄
**目標**: JavaScriptファイルとクラス名の重複問題を解決し、コードベースの整理と保守性の向上を実現

**問題の概要**: 
- 31個の重複ファイル名と63個の重複クラス名を検出
- 開発時の混乱やメンテナンス性低下の原因
- テストファイル、設定ファイル、コアシステム等で広範囲に重複発生

**仕様書**: `.kiro/specs/javascript-class-name-deduplication/`
- requirements.md: 6つの要件定義（ユニーク性、命名戦略、自動更新、検証、文書化）
- design.md: 7段階のアーキテクチャ設計（分析→戦略→リネーム→検証→レポート）
- tasks.md: 17メインタスク、62サブタスクの詳細実装計画

**現状**: 仕様書作成完了、実装開始段階

#### Username Input Positioning修正プロジェクト（Issue #143対応）🔄
**目標**: ゲーム開始時のユーザー名入力フォームが画面右下に表示される問題を修正し、中央位置に正しく配置する

**問題の概要**: 
- UsernameInputManagerの座標変換とResponsiveCanvasManagerの座標システムの不整合
- 高DPI対応でpixelRatio変換が考慮されていない
- Canvas座標系（内部解像度 vs 表示サイズ）の混乱

**解決アプローチ**:
- ResponsiveCanvasManagerの座標システムを使用
- 座標変換ユーティリティの実装
- フォールバック機能付きの堅牢な実装

**仕様書**: `.kiro/specs/username-input-positioning-fix/`
- requirements.md: 4つの要件定義（中央配置、座標システム統合、視覚一貫性、保守性）
- design.md: 詳細なアーキテクチャ設計と座標変換システム
- tasks.md: 18段階の実装タスク（座標変換→統合→テスト→最適化）

**現状**: 作業開始、タスクリストに従って順次実装中

#### テストスイート修復プロジェクト（Issue #106対応）🔄
**目標**: Phase G完了後のテスト失敗（15/114ファイル失敗、13%失敗率）を修正し、95%以上の成功率を実現

**進捗**: 
- ✅ API Method Consistency Resolution完了
- ✅ Missing Dependencies Resolution完了
- ✅ Jest Environment Stability完了
- 🔄 残存タスクの実施中

#### i18n ビルドタイムスタンプ削除プロジェクト（Issue #75対応）🔄
**目標**: `npm run build`実行時に翻訳ファイルが更新される問題を解決し、クリーンなバージョン管理履歴を維持

**問題の概要**: 
- `npm run build`実行時に35個の翻訳ファイル（5言語×7カテゴリ）が変更状態になる
- i18n:setupスクリプトがoptimizedAtタイムスタンプを毎回更新
- 開発・バージョン管理上の問題となっている

**解決アプローチ**:
- i18n-deployment-setup.jsからoptimizedAtタイムスタンプ更新処理を削除
- ビルドプロセスをidempotent（冪等）に変更
- 必要な場合は静的な場所で最適化情報を管理
- 既存のi18n機能との後方互換性を保持

**仕様書**: `.kiro/specs/i18n-build-timestamp-removal/`
- requirements.md: 5つの要件定義（ファイル変更防止、メタデータ保持、最適化情報管理、idempotency、後方互換性）
- design.md: アーキテクチャ設計と翻訳ファイル構造変更
- tasks.md: 11段階の実装タスク（スクリプト修正→テスト→文書更新）

**現状**: ✅ **完了** - 全11タスク完了、Issue #75完全解決

#### 多言語ヘルプドキュメントサポートプロジェクト（Issue #112対応）🔄
**目標**: 日本語ヘルプコンテンツファイル不足による404エラーを解決し、完全な多言語ヘルプシステムを実装

**問題の概要**: 
- 日本語ヘルプコンテンツファイル5件が404エラー（troubleshooting.json, settings.json, scoring.json, controls.json, bubbles.json）
- エラーログ生成によるデバッグ時のノイズ
- ユーザーがゲーム操作方法やトラブルシューティング情報を日本語で確認できない

**解決アプローチ**:
- 既存英語コンテンツの高品質日本語翻訳
- 韓国語・中国語（簡体字・繁体字）コンテンツ作成
- 強化されたエラーハンドリングとフォールバック機能
- コンテンツ検証とモニタリングシステム

**仕様書**: `.kiro/specs/help-documentation-multilingual-support/`
- requirements.md: 6つの要件定義（コンテンツ作成、エラー処理、拡張性、品質保証、パフォーマンス、保守性）
- design.md: 5段階のアーキテクチャ設計（コンテンツ→エラー処理→検証→テスト→運用）
- tasks.md: 8メインタスク、37サブタスクの詳細実装計画（日本語→韓国語→中国語→システム強化）

**現状**: 実装開始、タスクリストに従って順次作業中

### 重要度: 中

#### ローカルファイル実行CORS問題修正（Issue #63対応）✅
**目標**: ローカル環境でindex.htmlを直接ブラウザで開いた際に発生するCORSエラーとリソース読み込み問題を解決

**問題**: ES6モジュールのCORSエラー、X-Frame-Optionsメタタグエラー、ファビコン不足
**状況**: 完了済み（`.kiro/specs/completed/2025/Q3/local-file-execution-cors-issue-63/`）

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
- チュートリアルシステム（Issue #36）🔄
- ソーシャル機能強化（Issue #37）🔄

### 完了済み長期プロジェクト
- ✅ 多言語対応強化（Issue #27）
- ✅ イベントステージシステム（Issue #28）
- ✅ PWA実装（Issue #33）
- ✅ 視覚効果強化プロジェクト（Issue #24）

詳細な情報は各参照先ドキュメントをご確認ください。