# 開発者ガイド

## 概要

BubblePop (awaputi) プロジェクトの開発者向けドキュメント集です。新しい開発者がプロジェクトに参加しやすくし、既存の開発者が効率的に作業を進められるよう、包括的なガイドとリファレンスを提供します。

## ガイド一覧

### 🚀 スタートアップガイド

#### [セットアップガイド](./setup-guide.md)
- 開発環境の構築手順
- 必要なツールのインストール
- 初回実行とテスト方法
- トラブルシューティング

#### [コントリビューションガイド](./contribution-guide.md)
- プロジェクトへの貢献方法
- 開発ワークフローとプロセス
- コミット規約とレビュープロセス
- コミュニティガイドライン

### 🏗️ 技術ドキュメント

#### [アーキテクチャガイド](./architecture-guide.md)
- システム全体のアーキテクチャ
- 設計パターンとベストプラクティス
- コンポーネント設計とデータフロー
- パフォーマンス最適化手法

#### [トラブルシューティングガイド](./troubleshooting-guide.md)
- よくある問題と解決方法
- エラーパターンと対処法
- デバッグ手法とツール
- 緊急時対応手順

### 📚 参考資料

#### [API ドキュメント](../api-reference/README.md)
- 自動生成された包括的なAPI仕様
- 使用例とコードサンプル
- バージョン履歴と変更追跡

#### [設定システム API](../configuration-system-api.md)
- ConfigurationManager の詳細仕様
- 設定管理システムの使用方法
- 計算エンジンとキャッシュシステム

## クイックスタート

### 1. 初めての開発者
```bash
# 1. リポジトリクローン
git clone https://github.com/taku-o/awaputi.git
cd awaputi

# 2. 依存関係インストール
npm install

# 3. 開発サーバー起動
python -m http.server 8000

# 4. ブラウザでアクセス
open http://localhost:8000
```

**次に読むべきドキュメント:**
1. [セットアップガイド](./setup-guide.md) - 詳細な環境構築
2. [アーキテクチャガイド](./architecture-guide.md) - システム理解
3. [コントリビューションガイド](./contribution-guide.md) - 開発参加方法

### 2. バグ修正・機能追加
```bash
# 1. Issue を確認・選択
# GitHub Issues から作業する Issue を選択

# 2. ブランチ作成
git checkout -b fix/issue-description

# 3. 開発・テスト
npm test
npm run test:e2e

# 4. コミット・プッシュ
git commit -m "🐛 fix: バグの修正"
git push origin fix/issue-description

# 5. プルリクエスト作成
gh pr create --title "バグ修正: 説明" --body "詳細"
```

**参考ドキュメント:**
- [コントリビューションガイド](./contribution-guide.md) - 開発ワークフロー
- [トラブルシューティングガイド](./troubleshooting-guide.md) - 問題解決
- [API ドキュメント](../api-reference/README.md) - 技術仕様

### 3. プロジェクト理解を深める
```bash
# コードベース探索
ls src/core/      # コアシステム
ls src/scenes/    # ゲームシーン
ls src/config/    # 設定管理
ls test/         # テストスイート

# ドキュメント確認
open docs/api-reference/README.md
open CLAUDE.md   # プロジェクト全体仕様
```

**学習パス:**
1. [CLAUDE.md](../../CLAUDE.md) - プロジェクト概要
2. [アーキテクチャガイド](./architecture-guide.md) - 技術詳細
3. [API ドキュメント](../api-reference/README.md) - コード仕様

## 開発タスク別ガイド

### 🐛 バグ修正

#### 一般的な手順
1. **問題の再現**: [トラブルシューティングガイド](./troubleshooting-guide.md) を参照
2. **原因の特定**: ブラウザ開発者ツール、コンソールログを活用
3. **修正の実装**: [アーキテクチャガイド](./architecture-guide.md) の設計原則に従う
4. **テストの追加**: 回帰を防ぐためのテストケース作成
5. **レビュー依頼**: [コントリビューションガイド](./contribution-guide.md) のプロセスに従う

#### よくあるバグパターン
- **Canvas 描画問題**: レンダリングループの確認
- **設定値が反映されない**: ConfigurationManager のキャッシュ確認
- **メモリリーク**: イベントリスナーとタイマーのクリーンアップ
- **パフォーマンス低下**: オブジェクトプールとレンダリング最適化

### ✨ 新機能開発

#### 設計フェーズ
1. **要件定義**: GitHub Issue または Discussion での議論
2. **アーキテクチャ検討**: [アーキテクチャガイド](./architecture-guide.md) の設計パターン適用
3. **API 設計**: 既存の [API ドキュメント](../api-reference/README.md) との整合性確保
4. **テスト計画**: ユニット・統合・E2E テストの策定

#### 実装フェーズ
1. **コンポーネント作成**: モジュラー設計の原則に従う
2. **設定統合**: ConfigurationManager での設定管理
3. **テスト実装**: 包括的なテストカバレッジ
4. **ドキュメント更新**: API ドキュメント、ユーザーガイドの更新

#### よくある新機能パターン
- **新しいバブルタイプ**: Bubble.js、BubbleManager.js、GameBalance.js の拡張
- **新しいシーン**: BaseScene を継承、SceneManager への登録
- **新しい効果**: ParticleManager、EffectManager の拡張
- **新しい設定項目**: ConfigurationManager への追加

### 🧪 テスト強化

#### テスト戦略
1. **ユニットテスト**: 個別コンポーネントの動作検証
2. **統合テスト**: コンポーネント間の連携確認
3. **E2E テスト**: ユーザーシナリオの完全検証
4. **パフォーマンステスト**: 性能要件の確認

#### テスト作成ガイドライン
```javascript
// ユニットテストの例
describe('BubbleManager', () => {
    let bubbleManager;
    
    beforeEach(() => {
        bubbleManager = new BubbleManager(mockGameEngine);
    });
    
    test('バブル生成が正常に動作する', () => {
        const bubble = bubbleManager.spawnBubble('normal', { x: 100, y: 100 });
        expect(bubble).toBeDefined();
        expect(bubble.type).toBe('normal');
    });
});
```

### 📚 ドキュメント改善

#### ドキュメント種類
1. **API ドキュメント**: コメントから自動生成
2. **ユーザーガイド**: 機能説明と使用方法
3. **開発者ガイド**: 技術仕様と実装詳細
4. **チュートリアル**: 段階的な学習コンテンツ

#### ドキュメント更新手順
1. **内容の確認**: 既存ドキュメントとの整合性
2. **構造の検討**: 読みやすい構成と階層
3. **実例の追加**: 実用的なコードサンプル
4. **多言語対応**: 国際化への配慮

## 品質管理

### コード品質基準

#### 必須要件
- **ESLint**: エラー・警告ゼロ
- **テストカバレッジ**: 80% 以上
- **パフォーマンス**: 60FPS 維持
- **ブラウザ互換性**: Chrome, Firefox, Safari, Edge 対応

#### 推奨事項
- **可読性**: 意図が明確なコード
- **再利用性**: 汎用的なコンポーネント設計
- **拡張性**: 新機能追加が容易
- **保守性**: 影響範囲が限定的な変更

### レビュープロセス

#### レビュー観点
1. **機能性**: 要件を正確に実装しているか
2. **コード品質**: 可読性、保守性、パフォーマンス
3. **テスト**: 適切なテストカバレッジと品質
4. **ドキュメント**: 必要な文書が更新されているか
5. **互換性**: 既存機能への影響がないか

#### レビューチェックリスト
- [ ] 全自動テストが通過している
- [ ] ESLint エラーが修正済み
- [ ] 関連ドキュメントが更新されている
- [ ] パフォーマンスへの悪影響がない
- [ ] セキュリティ問題がない
- [ ] アクセシビリティが確保されている

## ツールとリソース

### 開発ツール

#### 必須ツール
- **Node.js**: v16.0.0+ (開発環境)
- **Python**: v3.7+ (ローカルサーバー)
- **Git**: v2.20.0+ (バージョン管理)
- **モダンブラウザ**: Chrome, Firefox, Safari, Edge

#### 推奨ツール
- **VS Code**: 統合開発環境
- **GitHub CLI**: GitHub 操作の効率化
- **Jest**: ユニット・統合テスト
- **Playwright**: E2E テスト

#### VS Code 拡張機能
```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.live-server",
    "ms-vscode.js-debug-nightly"
  ]
}
```

### 参考リソース

#### プロジェクト内リソース
- [プロジェクト仕様 (CLAUDE.md)](../../CLAUDE.md)
- [API リファレンス](../api-reference/README.md)
- [設定システム API](../configuration-system-api.md)
- [移行ガイド](../migration-guide.md)
- [システム設計書](../system-design-detailed.md)

#### 外部リソース
- [MDN Web Docs](https://developer.mozilla.org/) - Web 技術リファレンス
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Canvas 描画
- [Jest Documentation](https://jestjs.io/) - テストフレームワーク
- [Playwright Documentation](https://playwright.dev/) - E2E テスト

## コミュニティ・サポート

### 質問・議論
- **GitHub Issues**: バグ報告・機能要望
- **GitHub Discussions**: 質問・アイデア・議論
- **Pull Request**: コードレビューと議論

### コントリビューション認識
- **README.md**: Contributors セクション
- **CHANGELOG.md**: リリースノート
- **GitHub**: Contributors ページ

### サポートレベル
- 🥉 **Bronze**: 1-5 PR (バグ修正・ドキュメント改善)
- 🥈 **Silver**: 6-15 PR (新機能・大幅改善)
- 🥇 **Gold**: 16+ PR (アーキテクチャレベル貢献)
- 💎 **Core**: 継続的な貢献とメンテナンス

## 次のステップ

### 新しい開発者向け
1. [セットアップガイド](./setup-guide.md) で開発環境を構築
2. [アーキテクチャガイド](./architecture-guide.md) でシステムを理解
3. [Good First Issue](https://github.com/taku-o/awaputi/labels/good%20first%20issue) から貢献開始

### 既存開発者向け
1. [トラブルシューティングガイド](./troubleshooting-guide.md) で問題解決効率化
2. [API ドキュメント](../api-reference/README.md) で最新仕様確認
3. [コントリビューションガイド](./contribution-guide.md) でプロセス最適化

### プロジェクトリーダー向け
1. 新機能の要件定義とアーキテクチャ設計
2. コードレビューとメンタリング
3. ドキュメント整備とプロセス改善

---

**開発者の皆様の貢献をお待ちしています！** 

質問や提案がございましたら、遠慮なく [GitHub Issues](https://github.com/taku-o/awaputi/issues) または [Discussions](https://github.com/taku-o/awaputi/discussions) でお知らせください。

良い開発体験と、素晴らしいゲーム作りを楽しんでください！ 🎮✨