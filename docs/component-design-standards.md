# コンポーネント設計標準（MCPトークン制限対応）

## 概要

MCPツール（find_symbol）のトークン制限（25,000トークン）を回避し、プロジェクトの保守性を向上させるためのコンポーネント設計標準。

## ファイルサイズ制限

### 制限値
- **推奨制限**: 1ファイル2,500語以下
- **最大制限**: 3,000語（緊急時のみ）

### 計測方法
```bash
# ファイルサイズチェック
node scripts/check-file-sizes.js

# 特定ファイルのチェック
wc -w src/path/to/file.js
```

## 分割基準

### 単一責任の原則
各コンポーネントは単一の責任を持つ：

```javascript
// 悪い例：複数の責任を持つ
class UserInfoScene {
    renderUserProfile() { /* プロフィール表示 */ }
    exportData() { /* データエクスポート */ }
    manageAchievements() { /* 実績管理 */ }
    handleDialogs() { /* ダイアログ管理 */ }
}

// 良い例：責任を分離
class UserInfoScene {
    constructor() {
        this.profileManager = new UserProfileManager();
        this.dataExporter = new UserDataExporter();
        this.achievementDisplay = new UserAchievementDisplay();
        this.dialogManager = new DialogManager();
    }
}
```

### 分割パターン

#### 1. 機能別分割
```
OriginalComponent.js (8,000語)
├── OriginalComponent.js (< 2,500語) - メインコントローラー
├── ComponentRenderer.js - レンダリング機能
├── ComponentEventHandler.js - イベント処理
└── ComponentDataManager.js - データ管理
```

#### 2. UI/ロジック分割
```
GameScene.js (6,000語)
├── GameScene.js - メインゲームロジック
├── GameUI.js - UI表示
├── GameEventHandler.js - イベント処理
└── GameStateManager.js - ステート管理
```

#### 3. サブシステム分割
```
StatisticsManager.js (5,000語)
├── StatisticsManager.js - メイン管理
├── StatisticsCalculator.js - 計算処理
├── StatisticsExporter.js - エクスポート
└── StatisticsVisualizer.js - 可視化
```

## ファイル構造規約

### ディレクトリ構造
```
src/
├── scenes/
│   ├── GameScene.js
│   └── components/
│       ├── game-scene/
│       │   ├── GameUI.js
│       │   ├── GameEventHandler.js
│       │   └── GameStateManager.js
│       └── user-info/
│           ├── UserProfileManager.js
│           ├── UserStatisticsRenderer.js
│           └── UserDataExporter.js
```

### 命名規約
- **メインファイル**: 元のファイル名を維持
- **サブコンポーネント**: `{Main}{Function}.js`
- **ディレクトリ**: kebab-case

例：
```
UserInfoScene.js → UserInfoScene.js + components/user-info/
├── UserProfileManager.js
├── UserStatisticsRenderer.js
├── UserAchievementDisplay.js
└── UserDataExporter.js
```

## インポート/エクスポート規約

### エクスポートパターン
```javascript
// メインクラス
export class ComponentName {
    // implementation
}

// シングルトンパターン（必要に応じて）
let componentInstance = null;

export function getComponentName(dependencies) {
    if (!componentInstance && dependencies) {
        componentInstance = new ComponentName(dependencies);
    }
    return componentInstance;
}
```

### インポートパターン
```javascript
// メインファイル
import { SubComponent1 } from './components/main-component/SubComponent1.js';
import { SubComponent2 } from './components/main-component/SubComponent2.js';

export class MainComponent {
    constructor() {
        this.subComponent1 = new SubComponent1();
        this.subComponent2 = new SubComponent2();
    }
}
```

## 依存関係管理

### 循環参照の回避
```javascript
// 悪い例：循環参照
// A.js
import { B } from './B.js';

// B.js  
import { A } from './A.js'; // 循環参照

// 良い例：共通の依存関係を使用
// A.js
import { EventBus } from './EventBus.js';

// B.js
import { EventBus } from './EventBus.js';
```

### インターフェース分離
```javascript
// 良い例：必要最小限の依存関係
class UserProfileManager {
    constructor(playerData, renderer) {
        this.playerData = playerData; // データアクセスのみ
        this.renderer = renderer; // レンダリングのみ
    }
}
```

## 分割作業フロー

### 1. 分析フェーズ
```bash
# ファイルサイズ確認
wc -w src/path/to/large-file.js

# 責任分析
# - どんな機能があるか
# - どのように分割できるか
# - 依存関係はどうなっているか
```

### 2. 設計フェーズ
```markdown
分割計画：
- メイン: OriginalComponent.js (制御、調整)
- サブ1: ComponentRenderer.js (表示)
- サブ2: ComponentEventHandler.js (イベント)
- サブ3: ComponentDataManager.js (データ)
```

### 3. 実装フェーズ
1. サブコンポーネントを作成
2. メインファイルからコードを移動
3. インポート/エクスポートを設定
4. 動作確認

### 4. 検証フェーズ
```bash
# ビルド確認
npm run build

# テスト実行
npm test

# ファイルサイズ再確認
node scripts/check-file-sizes.js
```

## 品質保証

### 必須チェック項目
- [ ] 全ファイルが2,500語以下
- [ ] 循環参照がない
- [ ] ビルドが成功する
- [ ] 既存テストが通る
- [ ] MCPツールが正常動作する

### 推奨チェック項目
- [ ] 各コンポーネントが単一責任
- [ ] 適切な命名規約を使用
- [ ] 必要最小限の依存関係
- [ ] 適切なディレクトリ構造

## 自動化ツール

### ファイルサイズ監視
```javascript
// .git/hooks/pre-commit
#!/bin/sh
node scripts/check-file-sizes.js
if [ $? -ne 0 ]; then
    echo "ファイルサイズ制限を超過しています"
    exit 1
fi
```

### CI/CD統合
```yaml
# .github/workflows/file-size-check.yml
name: File Size Check
on: [push, pull_request]
jobs:
  check-file-sizes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check file sizes
        run: node scripts/check-file-sizes.js
```

## 例外ケース

### 一時的な制限超過
- 緊急修正時は3,000語まで許可
- 1週間以内に分割作業を実施
- Issue作成と分割計画の文書化が必要

### 分割困難なファイル
- 外部ライブラリとの密結合
- 複雑な状態管理
- レガシーコードとの互換性

これらの場合は、代替案（部分的な最適化、コメント削除など）を検討。

## 成功事例

### UserInfoScene.js分割
- **分割前**: 11,260語
- **分割後**: 8つのコンポーネント、各2,500語以下
- **効果**: MCPツール正常動作、保守性向上

### EventStageManager.js分割  
- **分割前**: 9,914語
- **分割後**: 933語（メイン）+ 4つのサブコンポーネント
- **効果**: 機能の独立性向上、テスタビリティ向上

## まとめ

この設計標準に従うことで：
1. **MCPツール問題の解決**: トークン制限内での動作
2. **保守性の向上**: 単一責任による明確な構造
3. **チーム開発効率**: 一貫した設計パターン
4. **将来の問題予防**: 継続的なサイズ監視

新規開発・既存コード修正時は、この標準を必ず適用してください。