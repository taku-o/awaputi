# 技術スタック

## コア技術
- **JavaScript**: ES6+ (Vanilla JavaScript、ライブラリ依存なし)
- **HTML5**: Canvas 2D API、Web APIs
- **CSS3**: Flexbox、Grid、カスタムプロパティ
- **PWA**: Service Worker、App Manifest、オフライン機能

## 開発ツール
- **テストフレームワーク**: Jest (単体・統合テスト)
- **E2Eテスト**: Playwright
- **ビルドツール**: Vite (開発・テスト環境用)
- **バンドル分析**: vite-bundle-analyzer
- **パフォーマンス監視**: Lighthouse
- **型チェック**: JSDoc comments（TypeScriptなし）

## アーキテクチャパターン
- **モジュールシステム**: ES6 modules
- **コンポーネント設計**: 責任分離、依存注入
- **イベント駆動**: addEventListener パターン
- **設定管理**: ConfigurationManager（中央集権型）
- **計算エンジン**: CalculationEngine（高性能計算）
- **キャッシュシステム**: LRU cache、メモリ最適化

## デプロイメント
- **ホスティング**: Netlify、Vercel、GitHub Pages対応
- **CDN**: 静的アセット配信最適化
- **PWA**: インストール可能、オフライン動作
- **モバイル最適化**: レスポンシブ、タッチ操作対応