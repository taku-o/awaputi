# ヘルプシステム メンテナンス手順書 (GitHub Issue #112対応)

## 概要

BubblePopゲームのヘルプシステムは、包括的な多言語対応ヘルプ機能を提供します。このドキュメントでは、ヘルプシステムの保守・更新・トラブルシューティング手順を説明します。

## システム構成

### 主要コンポーネント

- **HelpManager** (`src/core/help/HelpManager.js`) - 中央管理システム
- **TutorialManager** (`src/core/help/TutorialManager.js`) - チュートリアル制御
- **ContextManager** (`src/core/help/ContextManager.js`) - コンテキスト対応ヘルプ
- **HelpScene** (`src/scenes/HelpScene.js`) - ヘルプ表示画面
- **TutorialOverlay** (`src/core/help/TutorialOverlay.js`) - チュートリアルUI
- **TooltipSystem** (`src/core/help/TooltipSystem.js`) - ツールチップ管理

### ファイル構造

```
src/core/help/
├── HelpManager.js              # 中央管理
├── TutorialManager.js          # チュートリアル制御
├── ContextManager.js           # コンテキスト管理
├── TutorialOverlay.js          # チュートリアルUI
├── TooltipSystem.js           # ツールチップ
└── content/                   # ヘルプコンテンツ
    ├── help/                  # ヘルプファイル
    │   ├── ja/               # 日本語
    │   ├── en/               # 英語
    │   └── zh-CN/            # 中国語
    └── tutorials/            # チュートリアル
        ├── ja/
        ├── en/
        └── zh-CN/
```

## 定期メンテナンス

### 1. ヘルプコンテンツの更新

#### 手順
1. 対象言語のJSONファイルを編集
2. コンテンツのバリデーション実行
3. テスト環境での動作確認
4. 本番環境へのデプロイ

#### コンテンツ形式

```json
{
  "version": "1.0.0",
  "category": "gameplay",
  "sections": [
    {
      "id": "basics",
      "title": "基本操作",
      "content": "ゲームの基本的な操作方法を説明します...",
      "difficulty": "beginner",
      "tags": ["basic", "controls"],
      "searchKeywords": ["操作", "クリック", "マウス"]
    }
  ]
}
```

#### バリデーションチェック

```bash
# コンテンツ形式の検証
npm run validate:help-content

# 翻訳整合性チェック
npm run check:translations

# アクセシビリティ検証
npm run test:accessibility
```

### 2. 多言語サポートの追加

#### 新しい言語の追加手順

1. **言語ディレクトリの作成**
   ```bash
   mkdir -p src/core/help/content/help/[言語コード]
   mkdir -p src/core/help/content/tutorials/[言語コード]
   ```

2. **基本ヘルプファイルの作成**
   - `gameplay.json` - ゲームプレイヘルプ
   - `bubbles.json` - バブル種類説明
   - `controls.json` - 操作方法
   - `scoring.json` - スコアリング
   - `settings.json` - 設定項目
   - `troubleshooting.json` - トラブルシューティング

3. **チュートリアルファイルの作成**
   - `basic-tutorial.json` - 基本チュートリアル
   - `advanced-tutorial.json` - 高度な操作
   - `bubble-types-tutorial.json` - バブル種類

4. **言語設定の更新**
   ```javascript
   // LocalizationManager.js に言語を追加
   supportedLanguages: ['ja', 'en', 'zh-CN', 'ko', '[新言語コード]']
   ```

### 3. パフォーマンス監視

#### 重要メトリクス
- ヘルプコンテンツ読み込み時間: < 500ms
- 検索応答時間: < 200ms
- チュートリアル初期化時間: < 300ms
- メモリ使用量: 各セッション < 10MB

#### 監視コマンド
```bash
# パフォーマンステスト実行
npm run test:performance:help

# メモリ使用量チェック
npm run analyze:memory:help

# 検索パフォーマンス測定
npm run benchmark:search
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. ヘルプコンテンツが読み込めない

**症状**: ヘルプ画面が空白、エラーメッセージ表示

**原因と解決方法**:
- **JSONファイルの構文エラー**
  ```bash
  # JSONファイルの構文チェック
  npm run validate:json src/core/help/content/help/ja/
  ```

- **ファイルパスの問題**
  ```javascript
  // HelpManager.js の loadHelpContent メソッドを確認
  // 正しいパス: ./src/core/help/content/help/${language}/${category}.json
  ```

- **権限問題**
  ```bash
  # ファイル権限確認
  ls -la src/core/help/content/help/
  ```

#### 2. 検索機能が動作しない

**症状**: 検索結果が表示されない、検索エラー

**解決方法**:
```javascript
// HelpManager.js の searchContent メソッドをデバッグ
console.log('Search query:', query);
console.log('Help content:', this.helpContent);
console.log('Search results:', results);
```

**検索インデックスの再構築**:
```bash
# キャッシュクリア
localStorage.removeItem('awaputi_help_progress');
# ページリロード後、検索機能を再テスト
```

#### 3. チュートリアルが開始されない

**症状**: チュートリアルボタンが無反応、エラー表示

**デバッグ手順**:
1. **チュートリアルデータの確認**
   ```javascript
   // TutorialManager.js
   console.log('Tutorial data loaded:', this.tutorialData);
   ```

2. **DOM要素の存在確認**
   ```javascript
   // TutorialOverlay.js
   const targetElement = document.querySelector(step.targetElement);
   console.log('Target element found:', targetElement);
   ```

3. **権限・セキュリティ設定確認**
   - Content Security Policy (CSP) の確認
   - ローカルファイルアクセス権限の確認

#### 4. ツールチップが表示されない

**原因**:
- CSS スタイルの競合
- z-index の問題
- 位置計算エラー

**解決方法**:
```css
/* ツールチップ専用CSSクラス */
.awaputi-tooltip {
    position: absolute;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 14px;
    max-width: 300px;
    word-wrap: break-word;
}
```

#### 5. 多言語切り替えが失敗する

**症状**: 言語変更後もコンテンツが更新されない

**解決手順**:
1. **キャッシュクリア**
   ```javascript
   // HelpManager.js
   this.helpContent.clear();
   this.cacheSystem.clear();
   ```

2. **言語ファイルの存在確認**
   ```bash
   ls -la src/core/help/content/help/[言語コード]/
   ```

3. **フォールバック処理の確認**
   ```javascript
   // 日本語版にフォールバックしているか確認
   console.log('Fallback to Japanese triggered');
   ```

### エラーログの確認

#### ブラウザコンソール
```javascript
// エラー監視
window.addEventListener('error', (e) => {
    if (e.filename.includes('help')) {
        console.error('Help system error:', e);
    }
});
```

#### ログレベル設定
```javascript
// LoggingSystem.js で詳細ログを有効化
this.loggingSystem.setLevel('debug');
```

## テスト手順

### 1. ユニットテスト

```bash
# ヘルプシステム関連テスト実行
npm test -- --testPathPattern=help-system

# 特定コンポーネントのテスト
npm test tests/unit/help-system/HelpManager.test.js
npm test tests/unit/help-system/TutorialManager.test.js
npm test tests/unit/help-system/ContextManager.test.js
```

### 2. 統合テスト

```bash
# ヘルプシステム統合テスト
npm test tests/integration/help-system/help-system-integration.test.js

# シーン統合テスト  
npm test tests/integration/help-system/scene-integration.test.js
```

### 3. アクセシビリティテスト

```bash
# アクセシビリティ準拠テスト
npm test tests/accessibility/help-system-accessibility.test.js

# WCAG 2.1 AA準拠チェック
npm run test:accessibility:wcag
```

### 4. E2Eテスト

```bash
# Playwright E2Eテスト実行
npm run test:e2e:help

# 特定機能のE2Eテスト
npx playwright test tests/e2e/help-system-flow.spec.js
```

### 5. パフォーマンステスト

```bash
# ヘルプシステムパフォーマンステスト
npm run test:performance -- --testNamePattern="Help System"

# メモリリークテスト
npm run test:memory-leak:help
```

## 緊急時対応

### 1. ヘルプシステム無効化

重大な問題が発生した場合の緊急無効化手順:

```javascript
// GameEngine.js で一時的に無効化
const HELP_SYSTEM_ENABLED = false;

if (HELP_SYSTEM_ENABLED) {
    this.helpManager = new HelpManager(this);
} else {
    console.warn('Help system temporarily disabled');
    this.helpManager = { 
        // ダミー実装
        getContextualHelp: () => null,
        searchContent: () => [],
        showTooltip: () => {},
        hideTooltip: () => {}
    };
}
```

### 2. フォールバック処理

```javascript
// 最小限のヘルプ機能を提供
class EmergencyHelpManager {
    constructor() {
        this.basicHelp = {
            'bubble_click': 'バブルをクリックして破裂させてください',
            'combo': '連続してバブルを割るとコンボが発生します',
            'scoring': 'スコアは破裂させたバブルの種類によって決まります'
        };
    }
    
    getBasicHelp(context) {
        return this.basicHelp[context] || '操作方法はマニュアルをご確認ください';
    }
}
```

## 開発時の注意点

### 1. コンテンツ作成ガイドライン

- **簡潔性**: 1つのセクション = 500文字以内
- **階層化**: 初心者→中級者→上級者の順序
- **検索対応**: 適切なキーワードとタグの設定
- **アクセシビリティ**: スクリーンリーダー対応のテキスト

### 2. 翻訳品質管理

- **一貫性**: 専門用語の統一
- **文化的適応**: 地域特有の表現への配慮
- **校正**: ネイティブスピーカーによる確認

### 3. パフォーマンス配慮

- **遅延読み込み**: 必要時のみコンテンツ読み込み
- **キャッシュ**: 適切なキャッシュ戦略
- **圧縮**: JSON ファイルの最適化

## 更新履歴

| 日付 | バージョン | 変更内容 |
|------|------------|----------|
| 2025-07-31 | 1.0.0 | 初版作成 |

## 関連ドキュメント

- [ヘルプシステム要件定義](.kiro/specs/documentation-enhancement-issue-31/requirements.md)
- [ヘルプシステム設計書](.kiro/specs/documentation-enhancement-issue-31/design.md)
- [多言語対応ガイド](docs/internationalization-guide.md)
- [アクセシビリティガイド](docs/accessibility-guide.md)

## サポート

問題が解決しない場合は、以下の情報を含めて開発チームに連絡してください:

1. 発生している問題の詳細
2. 再現手順
3. ブラウザ・OS環境
4. コンソールエラーログ
5. 試行した解決方法