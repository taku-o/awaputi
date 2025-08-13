# キーボードショートカット実装の分析とマッピング

## 分析概要
Issue #163のタスク6として、既存のキーボードショートカット実装を包括的に分析し、統合のためのマッピングを作成。

## 発見されたキーボードショートカット実装

### 1. LanguageSpecificAccessibility.js

#### 実装場所
`src/accessibility/LanguageSpecificAccessibility.js`

#### 言語別キーボードレイアウト定義
各言語で以下のショートカットが定義されている：

**共通ショートカット構造:**
- `help`: 'KeyH' - ヘルプ画面を開く
- `settings`: 'KeyS' - 設定画面を開く  
- `pause`: 'KeyP' - ポーズ機能
- `menu`: 'KeyM' - メニュー画面
- `fullscreen`: 'F11' - フルスクリーン切り替え

**言語固有のバリエーション:**
- **ドイツ語 (de)**: `hilfe: 'KeyH'`, `einstellungen: 'KeyE'`
- **フランス語 (fr)**: `aide: 'KeyA'`, `parametres: 'KeyP'`
- **日本語 (ja)**: `ヘルプ: 'KeyH'`, `設定: 'KeyS'`
- **アラビア語 (ar)**: RTL対応の特別なマッピング
- **ヘブライ語 (he)**: RTL対応の特別なマッピング

#### ナビゲーションキー
**標準ナビゲーション:**
- `up`: 'ArrowUp'
- `down`: 'ArrowDown'  
- `left`: 'ArrowLeft'
- `right`: 'ArrowRight'
- `select`: 'Enter'
- `back`: 'Escape'

**RTL言語での方向キー調整:**
- `ArrowLeft` → 'right' (RTLでは左キーが右方向)
- `ArrowRight` → 'left' (RTLでは右キーが左方向)

### 2. ContextualHelpSystem.js

#### 実装場所
`src/debug/ContextualHelpSystem.js`

#### キーボードショートカット処理
```javascript
document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
        e.preventDefault();
        this.showContextualHelp();
    }
    
    if (e.ctrlKey && e.key === '?') {
        e.preventDefault();
        this.showQuickHelp();
    }
});
```

#### 定義されたショートカット
- **F1キー**: `showContextualHelp()` - コンテキスト依存ヘルプ
- **Ctrl+?**: `showQuickHelp()` - クイックヘルプ
- その他のデバッグショートカット（実装されていない可能性）：
  - Ctrl+Shift+D - デバッグパネルを開く
  - Ctrl+Shift+C - コンソールを開く

### 3. 推定される他のショートカット実装

#### ゲームエンジン内のショートカット
- **Ctrl+Shift+D**: デバッグモード切り替え (URLパラメータで確認済み)
- **F11**: フルスクリーン切り替え (LanguageSpecificAccessibilityで定義)

## キーボードショートカットマッピング統合計画

### 統一ショートカット定義

#### 1. ヘルプ関連ショートカット
| キー | 動作 | 実装元 | 統合方針 |
|------|------|---------|----------|
| H | ヘルプ画面を開く | LanguageSpecificAccessibility | **統一実装** - KeyboardShortcutRouterで統合 |
| F1 | コンテキストヘルプ | ContextualHelpSystem | **統合** - ヘルプ画面内でコンテキスト表示 |
| Ctrl+H | ドキュメントヘルプ | (KeyboardShortcutRouterで定義済み) | **新規実装** |
| Ctrl+? | クイックヘルプ | ContextualHelpSystem | **統合** - ヘルプ画面内で実装 |

#### 2. 設定関連ショートカット
| キー | 動作 | 実装元 | 統合方針 |
|------|------|---------|----------|
| S | 設定画面を開く | LanguageSpecificAccessibility | **統一実装** - KeyboardShortcutRouterで統合 |
| Escape | 戻る/閉じる | LanguageSpecificAccessibility | **統一実装** - NavigationContextManagerと連携 |

#### 3. システム関連ショートカット
| キー | 動作 | 実装元 | 統合方針 |
|------|------|---------|----------|
| F11 | フルスクリーン切り替え | LanguageSpecificAccessibility | **統一実装** - KeyboardShortcutRouterで統合 |
| P | ポーズ | LanguageSpecificAccessibility | **既存維持** - ゲーム固有機能 |
| M | メニュー | LanguageSpecificAccessibility | **既存維持** - ゲーム固有機能 |

### 統合アーキテクチャ

#### キーボードショートカット処理フロー
```
1. KeyboardShortcutRouter (統合ポイント)
   ├─ 基本ショートカット (H, S, F1, Escape, F11)
   ├─ 修飾キーショートカット (Ctrl+H, Ctrl+?)
   └─ NavigationContextManager連携
       └─ 適切な戻り先決定

2. LanguageSpecificAccessibility (言語固有処理)
   ├─ 言語別キーマッピング維持
   ├─ RTL対応の方向キー調整
   └─ キーボードレイアウト対応

3. ContextualHelpSystem (コンテキスト依存処理)
   ├─ 統合後はHelpScene内で動作
   ├─ F1とCtrl+?の処理を移譲
   └─ 既存のヘルプトリガー機能維持
```

## 重複実装の整理

### 重複するショートカット処理
1. **ヘルプ表示 (Hキー)**
   - LanguageSpecificAccessibility: 言語別定義
   - KeyboardShortcutRouter: 統一処理実装済み
   - **統合方針**: KeyboardShortcutRouterを優先、言語別設定は保持

2. **設定表示 (Sキー)**
   - LanguageSpecificAccessibility: 言語別定義  
   - KeyboardShortcutRouter: 統一処理実装済み
   - **統合方針**: KeyboardShortcutRouterを優先、言語別設定は保持

3. **ESCキー処理**
   - LanguageSpecificAccessibility: 'back'として定義
   - KeyboardShortcutRouter: NavigationContextManagerと連携
   - **統合方針**: KeyboardShortcutRouterの実装を使用

### 固有機能の保持

#### LanguageSpecificAccessibilityの独自機能
- **言語別キーマッピング**: 保持必須
- **RTL対応**: 保持必須（アラビア語、ヘブライ語対応）
- **文化的メタファー対応**: 保持必須

#### ContextualHelpSystemの独自機能
- **コンテキスト依存トリガー**: 保持してHelpScene内で活用
- **インタラクティブガイド**: 保持してHelpScene内で活用
- **ツールチップシステム**: 保持して全体で活用

## 実装戦略

### Phase 1: 基本統合
1. **KeyboardShortcutRouterの拡張**
   - LanguageSpecificAccessibilityとの連携API追加
   - 言語別キーマッピングの動的取得機能

2. **LanguageSpecificAccessibilityの更新**
   - KeyboardShortcutRouterとの連携メソッド追加
   - updateKeyboardShortcuts()の実装見直し

### Phase 2: コンテキストヘルプの統合
1. **HelpSceneの拡張**
   - ContextualHelpSystemの機能を統合
   - F1キーとCtrl+?の処理を追加

2. **ContextualHelpSystemのリファクタリング**
   - HelpScene内で動作するように調整
   - 独立実行からコンポーネント化

### Phase 3: 言語対応の強化
1. **多言語ショートカット対応**
   - 現在の言語に応じた動的キーマッピング
   - RTL言語での適切なナビゲーション

2. **文化的配慮の実装**
   - 言語固有のヘルプ表示方法
   - 適切なUI方向とナビゲーション

## 期待される効果

### 1. ユーザビリティ向上
- 一貫したキーボードショートカット体験
- 言語・文化に配慮したアクセシビリティ
- 直感的なナビゲーション

### 2. 開発効率向上
- 統一されたショートカット管理
- 重複実装の排除
- メンテナンス性の向上

### 3. アーキテクチャ改善
- 責任分離の明確化
- モジュラー設計の実現
- 拡張性の確保

## 次のステップ
1. **タスク7**: HelpSceneのコンテキスト依存ナビゲーション対応
2. **タスク8**: SettingsSceneのコンテキスト依存ナビゲーション対応  
3. **タスク9**: ContextualHelpSystemの機能をHelpSceneに統合
4. **タスク11**: KeyboardShortcutRouterとの統合実装