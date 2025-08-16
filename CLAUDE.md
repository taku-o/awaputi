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

#### TypeScript移行プロジェクト（Issue #183対応）🔄
**目標**: 未定義の関数呼び出しエラーを防止するためにBubblePopゲームプロジェクトにTypeScriptを導入

**問題の概要**: 
- プロジェクト全体で多数の「未定義の関数呼び出し」エラーが発生
- 型安全性の欠如によるランタイムエラーの発生
- 771個のソースファイル（src/**/*.js）とテストファイルの型チェックが必要

**解決アプローチ**:
- 段階的TypeScript移行（9フェーズ、40タスク）
- 厳密な型チェック設定でany型の使用を最小化
- 未実装機能の発見時はその場で実装
- 全テストとE2Eテストでの継続的検証
- **未実装機能の継続記録**: TypeScript移行中に「将来実装する」「現時点では未実装」のコード箇所を発見した場合、`.kiro/specs/typescript-migration/unimplemented-features.md`に記録する

**仕様書**: `.kiro/specs/typescript-migration/`
- requirements.md: 8つの要件定義（環境構築、ソース変換、テスト変換、型定義、設定除外、段階移行、未実装実装、継続性）
- design.md: 詳細なアーキテクチャ設計（設定、型定義、移行戦略、エラーハンドリング、テスト戦略）
- tasks.md: 9フェーズ40タスクの詳細実装計画（環境→コア→管理→UI→エフェクト→テスト→修正→検証→ドキュメント）
- unimplemented-features.md: TypeScript移行中に発見した未実装機能一覧

**作業記録ファイル**: `.kiro/specs/typescript-migration/work-progress.md`

**現在進捗**: 29/40 タスク完了（72.5%）
- ✅ Phase 1-6完了: 環境構築、コア移行、管理システム、UI・シーン、エフェクト・オーディオ、テスト移行
- 🔄 Phase 7進行中（2/3タスク完了）: 未実装機能実装・型エラー修正
  - ✅ Task 28: 未定義関数の実装完了
  - ✅ Task 29: 未定義変数の初期化完了  
  - 🔄 Task 30: 型エラーの修正（残存426個エラー、743→426個に42.6%削減済み）
- 🔄 Phase 8待機: 最終検証とテスト（6タスク）
- 🔄 Phase 9待機: ドキュメント更新・クリーンアップ（2タスク）

### 重要度: 高

#### Canvas Scale UI Positioning修正プロジェクト（Issue #177対応）🔄
**目標**: UIエレメントがキャンバススケーリングを適切に考慮せず、正しくない位置に表示される問題を修正

**問題の概要**: 
- GameUIManagerの全UIエレメント（スコア、HP、時間、コンボ）が固定座標でハードコード
- ResponsiveCanvasManagerによるスケーリングが考慮されていない
- 異なるスクリーンサイズやデバイスピクセル比でUI要素が見えない・クリックできない問題
- インタラクティブ要素（ボタン、バブル）の座標変換が不正確

**解決アプローチ**:
- ScaledCoordinateManagerによる統合座標管理システムの実装
- UIPositionCalculatorによる一貫したUI要素配置計算
- ScaledRenderingContextによる自動スケーリング描画ラッパー
- InputCoordinateConverterによる入力座標変換システム
- ResponsiveCanvasManagerとの完全統合

**仕様書**: `.kiro/specs/completed/2025/Q3/canvas-scale-ui-positioning-fix/`
- requirements.md: 6つの要件定義（UIスケーリング、ゲーム情報表示、コントロールボタン、インタラクティブ要素、座標システム、デバイス対応）
- design.md: 詳細なアーキテクチャ設計（5コンポーネント、データモデル、エラーハンドリング、テスト戦略）
- tasks.md: 12段階65サブタスクの実装計画（インフラ→レンダリング→入力処理→統合→テスト→最適化）

**作業記録ファイル**: `.kiro/specs/completed/2025/Q3/canvas-scale-ui-positioning-fix/work-progress.md`

**現状**: 実装開始、問題調査完了、tasks.mdのタスクリストに従って順次作業中

#### キーボードショートカット設定UI移行プロジェクト（Issue #170対応）🔄
**目標**: 不要なキーボードショートカットを削除し、機能を設定画面UIに移行してカジュアルゲームユーザーの利便性を向上

**問題の概要**: 
- Issue #164のsub issue、キーボードショートカット再編成の一環
- フルスクリーン（Fキー）、音声ミュート（Mキー）、音量調整（Ctrl+↑/↓）が設定UIから操作困難
- アクセシビリティ機能（Ctrl+Alt+H/T/M）、設定管理（Ctrl+P/E/I）のキーボード依存
- カジュアルゲームとして明確なUIボタンによる操作性の向上が必要

**解決アプローチ**:
- 設定画面の一般カテゴリにフルスクリーン、音声ミュート、音量調整ボタンを追加
- アクセシビリティカテゴリにプロファイル切り替え、設定エクスポート/インポートボタンを追加
- KeyboardShortcutManagerから対象ショートカットの削除
- 既存機能の保持と設定永続化の確保

**仕様書**: `.kiro/specs/completed/2025/Q3/keyboard-shortcuts-to-settings-ui/`
- requirements.md: 7つの要件定義（ショートカット削除、UI追加、設定永続化、ドキュメント更新）
- design.md: アーキテクチャ設計（UI統合、カスタムコンポーネント、エラーハンドリング、テスト戦略）
- tasks.md: 9段階73サブタスクの詳細実装計画（UIコンポーネント→機能移行→ショートカット削除→テスト→品質保証）

**作業記録ファイル**: `/Users/taku-o/.work-progress/keyboard-shortcuts-to-settings-ui-progress.md`

**現状**: 実装開始、現状調査完了、tasks.mdのタスクリストに従って順次作業中

#### ヘルプシステム機能修正プロジェクト（Issue #182対応）🔄
**目標**: ヘルプシステムの検索機能とアナリティクス機能を修正し、エラーのない動作を実現

**問題の概要**: 
- 検索バーが表示されず、テキスト入力ができない
- HelpAnalyticsクラスのrecordCategorySelectionメソッドが未実装
- HelpFeedbackSystemクラスのrecordTopicExitメソッドが未実装
- カテゴリ・トピック選択時にJavaScriptエラーが発生

**解決アプローチ**:
- HelpAnalyticsクラスに不足しているメソッドを追加
- HelpFeedbackSystemクラスに不足しているメソッドを追加
- 検索バー機能の修復と入力処理の実装
- 堅牢なエラーハンドリングとフォールバック機能の追加

**仕様書**: `.kiro/specs/completed/2025/Q3/help-system-functionality-fix/`
- requirements.md: 6つの要件定義（ショートカットアクセス、検索機能、ナビゲーション、アナリティクス、表示機能、コンテクスト機能）
- design.md: アーキテクチャ設計（不足メソッド実装、検索機能復旧、エラーハンドリング、テスト戦略）
- tasks.md: 18段階の詳細実装計画（メソッド修正→検索復旧→ナビゲーション→テスト→最適化）

**現状**: ✅ **完了** - 全18タスク完了、ヘルプシステム完全修正済み、品質向上・テスト・フォールバック機能全て実装完了

#### ゲームコントロールボタン追加プロジェクト（Issue #172対応）🔄
**目標**: ゲーム画面にGive Up（ギブアップ）とRestart（ゲーム再開始）ボタンを追加し、キーボードショートカット（G、Rキー）を削除してアクセシビリティを向上

**問題の概要**: 
- Issue #164のsub issue、キーボードショートカット再編成の一環
- Give Up（Gキー）とRestart（Rキー）がキーボードのみでアクセス困難
- カジュアルゲームとして明確なUIボタンによる操作性の向上が必要
- 確認ダイアログ付きの安全な操作実装

**解決アプローチ**:
- GameControlButtonsコンポーネント作成（Give Up、Restartボタン）
- ConfirmationDialogコンポーネント作成（確認ダイアログ）
- GameUIManagerとの統合によるシームレスなUI実装
- KeyboardShortcutManagerからG、Rキーの削除
- アクセシビリティとレスポンシブ対応

**仕様書**: `.kiro/specs/completed/2025/Q3/game-control-buttons-addition/`
- requirements.md: 6つの要件定義（Give Upボタン、Restartボタン、キーボードショートカット削除、UI設計、ドキュメント更新、アクセシビリティ）
- design.md: アーキテクチャ設計（コンポーネント統合、確認ダイアログ、エラーハンドリング、テスト戦略）
- tasks.md: 20段階の実装タスク（コンポーネント作成→統合→機能実装→ショートカット削除→テスト→ドキュメント更新）

**作業記録ファイル**: `/Users/taku-o/Documents/workspaces/awaputi/.work-progress/game-control-buttons-addition-progress.md`

**現状**: 実装開始、tasks.mdのタスクリストに従って順次作業中

#### キーボードショートカット削除プロジェクト（Issue #169対応）🔄
**目標**: 不要なキーボードショートカット（I、S、Hキー）を削除し、カジュアルゲームに適したUIを実現

**問題の概要**: 
- バブルポップゲームはカジュアルゲームであり、多くのキーボードショートカットは不要
- I キー（ユーザー情報画面）、S キー（設定画面）、H キー（ヘルプ画面）を削除
- 機能自体は残し、UIボタンからのアクセスのみに限定

**解決アプローチ**:
- KeyboardShortcutManagerから該当するショートカット登録を削除
- handleSettings()、handleHelp()、handleUserInfo()メソッドを削除
- ドキュメント（日本語・英語）から削除されたショートカットの記述を除去
- 包括的なテストで削除後の動作確認

**仕様書**: `.kiro/specs/completed/2025/Q3/keyboard-shortcut-removal/`
- requirements.md: 5つの要件定義（ショートカット削除、コード整合性、ドキュメント更新、機能維持、テスト）
- design.md: アーキテクチャ設計（削除対象、実装アプローチ、テスト戦略）
- tasks.md: 12段階の実装タスク（コード削除→ドキュメント更新→テスト→検証）

**現状**: 実装開始、tasks.mdのタスクリストに従って順次作業中

#### ヘルプ・設定画面ナビゲーション修正プロジェクト（Issue #166対応）🔄
**目標**: ヘルプ画面と設定画面でESCキーを押した際にメインメニューに正常に戻れない問題を修正

**問題の概要**: 
- 設定画面でESCキーを押すと「Scene mainMenu not found」エラーが発生
- ヘルプ画面でESCキーを押すと「Cannot read properties of undefined (reading 'mainMenu')」エラーが発生
- 不正なシーン名参照（'mainMenu'）と不適切なシーンアクセス方法が原因

**解決アプローチ**:
- SettingsSceneのgoBack()メソッドでシーン名を'mainMenu'から'menu'に修正
- HelpSceneで直接シーンアクセスを廃止し、SceneManager.switchScene()を使用
- 一貫したシーンナビゲーションパターンの実装
- 適切なエラーハンドリングの追加

**仕様書**: `.kiro/specs/completed/2025/Q3/help-settings-navigation-fix/`
- requirements.md: 4つの要件定義（設定画面修正、ヘルプ画面修正、一貫性、信頼性）
- design.md: シーン名標準化とナビゲーション方法の一貫性確保
- tasks.md: 10段階の実装タスク（修正→エラーハンドリング→テスト→検証）

**現状**: 実装開始、tasks.mdのタスクリストに従って順次作業中

#### ヘルプ・設定画面重複実装統合プロジェクト（Issue #163対応）🔄
**目標**: 重複しているヘルプ画面と設定画面の実装を統合し、一貫したユーザー体験を提供

**問題の概要**: 
- ヘルプ画面: メインメニューからの遷移とHキーショートカットからの遷移で異なる実装の可能性
- 設定画面: メインメニューからの遷移とヘルプ画面からESCキーでの遷移で異なる実装の可能性
- 重複実装による不整合なユーザー体験、メンテナンス負荷の増大

**解決アプローチ**:
- 既存実装の包括的な機能監査と比較
- NavigationContextManagerによるコンテキスト管理
- KeyboardShortcutRouterによる統一的なショートカット処理
- 重複実装の削除と単一実装への統合

**仕様書**: `.kiro/specs/completed/2025/Q3/duplicate-help-settings-screen-consolidation/`
- requirements.md: 7つの要件定義（ヘルプ統合、設定統合、重複削除、ショートカット、機能保持、ナビゲーション、調査）
- design.md: アーキテクチャ設計（統合戦略、コンポーネント設計、エラー処理、テスト戦略）
- tasks.md: 24タスクの詳細実装計画（機能監査→アーキテクチャ→統合→テスト→検証）

**現状**: ✅ **大幅進展** - タスク17-19完了、統合テスト・E2Eテスト実装完了、次はフィーチャーパリティ検証(タスク20)

#### フォント読み込みエラー修正プロジェクト（Issue #145対応）🔄
**目標**: フォント読み込み時のエラーハンドリングを改善し、デバッグ作業の邪魔にならないよう適切なフォールバック機能を実装

**問題の概要**: 
- I18nRenderOptimizerでのフォント読み込みタイムアウト
- Google Fontsからの読み込み失敗
- ローカルフォントファイル（.woff2）の404エラー
- ErrorLoggerでの大量のエラーログ出力

**解決アプローチ**:
- FontLoadingManagerによる統合的なフォント管理
- 適切なエラー分類とログ抑制機能
- 言語別フォールバックチェーンの実装
- 設定可能な読み込み制御システム

**仕様書**: `.kiro/specs/completed/2025/Q3/font-loading-error-fix/`
- requirements.md: 4つの要件定義（エラー処理、フォールバック、ログ改善、設定制御）
- design.md: 5段階のアーキテクチャ設計（エラーハンドリング→フォールバック→ソース管理→統合→設定）
- tasks.md: 12メインタスクの詳細実装計画（コンポーネント作成→統合→テスト）

**現状**: 実装開始、タスクリストに従って順次作業中

#### ショップボタンメインメニュー追加プロジェクト（Issue #171対応）🔄
**目標**: ステージ選択画面のSキーショートカット（ショップ画面へ）を削除し、代わりにメインメニューにショップボタンを追加

**問題の概要**: 
- ステージ選択画面でのSキーショートカット（ショップ画面へ）が存在
- より直感的なアクセス方法としてメインメニューからのアクセスを提供
- キーボードショートカットに依存しない操作の実現

**解決アプローチ**:
- MainMenuSceneのmenuItems配列にショップ項目を追加（インデックス1に挿入）
- StageSelectDataManagerからSキーショートカット処理を削除
- 翻訳ファイルに`menu.shop`キーを追加
- ドキュメントの更新（keyboard-shortcuts.md）

**仕様書**: `.kiro/specs/completed/2025/Q3/shop-button-main-menu-addition/`
- requirements.md: 5つの要件定義（Sキー削除、ショップボタン追加、メニュー順序、ドキュメント更新、既存機能保持）
- design.md: アーキテクチャ設計と実装フェーズ
- tasks.md: 12段階の実装タスク（翻訳→メニュー追加→ショートカット削除→ドキュメント→テスト）

**現状**: 実装開始、tasks.mdのタスクリストに従って順次作業中

#### シンプルエントリーページ導入プロジェクト（Issue #134対応）🔄
**目標**: ユーザーアクティベーション要件を満たすシンプルなエントリーページを実装し、音声・動画再生の制限を解決

**機能概要**: 
- 最小限のHTMLエントリーページを表示
- ユーザークリック後にメインゲーム初期化を実行
- 既存コードの変更なし、追加のみの実装
- レスポンシブ対応とアクセシビリティ確保

**仕様書**: `.kiro/specs/completed/2025/Q3/minimal-entry-page/`
- requirements.md: 5つの要件定義
- design.md: シンプルアプローチの設計
- tasks.md: 12段階の実装タスク

**現状**: 実装開始、タスクリストに従って順次作業中

#### ServiceWorker HEAD Request修正プロジェクト（Issue #149対応）✅
**目標**: ServiceWorkerでHEADリクエストがCache APIでサポートされていない問題を解決し、ゲーム再アクセス時のコンソールエラーを除去

**問題の概要**: 
- HelpManagerがファイル存在確認に使用するHEADリクエストがServiceWorkerでキャッシュできない
- Cache API の `put()` メソッドがHEADリクエストを拒否してエラーが発生
- ゲーム再アクセス時に "Failed to execute 'put' on 'Cache': Request method 'HEAD' is unsupported" エラー

**解決アプローチ**:
- ServiceWorkerレベルでHEADリクエストを検出し、キャッシュを試行せずにネットワークに直接パススルー
- HEADリクエスト専用ハンドラーの実装
- 適切なエラーハンドリングとグレースフルデグラデーション

**仕様書**: `.kiro/specs/completed/2025/Q3/serviceworker-head-request-fix/`
- requirements.md: 4つの要件定義（エラー解消、適切な処理、効率的動作、オフラインアクセス）
- design.md: アーキテクチャ設計とHEADリクエスト処理フロー
- tasks.md: 12段階の実装タスク（検出→ハンドラー→分岐→除外→テスト→監視）

**現状**: ✅ **完了** - PR #150マージ完了、全12タスク完了、Issue #149完全解決

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

**仕様書**: `.kiro/specs/completed/2025/Q3/javascript-class-name-deduplication/`
- requirements.md: 6つの要件定義（ユニーク性、命名戦略、自動更新、検証、文書化）
- design.md: 7段階のアーキテクチャ設計（分析→戦略→リネーム→検証→レポート）
- tasks.md: 17メインタスク、62サブタスクの詳細実装計画

**現状**: 仕様書作成完了、実装開始段階

#### メインメニューレイアウト修正プロジェクト（Issue #155対応）🔄
**目標**: メインメニュー画面でタイトル「BubblePop」が右側で切れ、メニューボタンが右寄りに表示される問題を修正

**問題の概要**: 
- タイトル「BubblePop」が右側で切れて「Bubbl」のみ表示される
- メニューボタンが画面中央ではなく右寄りに配置される
- MainMenuRendererでの座標計算に不整合がある
- Canvas座標系とベース座標系の変換が一貫していない

**解決アプローチ**:
- CoordinateCalculatorクラスによる統一的な座標計算
- ResponsiveCanvasManagerの座標システムとの統合
- 一貫性のある座標変換の実装
- 包括的なテストカバレッジの追加

**仕様書**: `.kiro/specs/completed/2025/Q3/main-menu-layout-fix/`
- requirements.md: 5つの要件定義（レイアウト修正、座標計算統一、レスポンシブ対応、品質保証、保守性）
- design.md: 詳細なアーキテクチャ設計と座標変換システム
- tasks.md: 11段階の実装タスク（座標計算→統合→テスト→最適化）

**現状**: 実装開始、タスクリストに従って順次作業中

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

**仕様書**: `.kiro/specs/completed/2025/Q3/username-input-positioning-fix/`
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

**仕様書**: `.kiro/specs/completed/2025/Q3/i18n-build-timestamp-removal/`
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

**仕様書**: `.kiro/specs/completed/2025/Q3/help-documentation-multilingual-support/`
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