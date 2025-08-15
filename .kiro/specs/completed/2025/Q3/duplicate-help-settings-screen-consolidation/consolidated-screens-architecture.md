# 統合画面アーキテクチャドキュメント

**作成日**: 2025-01-15  
**プロジェクト**: Issue #163 - 重複ヘルプ・設定画面統合  
**バージョン**: 1.0  
**対象**: 開発者・アーキテクト・メンテナー

---

## 目次

1. [概要](#概要)
2. [統合ヘルプシステム](#統合ヘルプシステム)
3. [統合設定システム](#統合設定システム)
4. [ナビゲーションコンテキスト管理](#ナビゲーションコンテキスト管理)
5. [キーボードショートカットルーティング](#キーボードショートカットルーティング)
6. [統合アーキテクチャ](#統合アーキテクチャ)
7. [実装ガイドライン](#実装ガイドライン)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### プロジェクト目標

BubblePop ゲームにおける重複したヘルプ・設定画面実装を統合し、一貫性のあるユーザー体験と保守可能なアーキテクチャを提供する。

### 解決した課題

1. **重複実装の排除**: 3つのヘルプ実装と3つの設定実装を統合
2. **ナビゲーション問題**: 固定された戻り先による不適切なユーザー体験を改善
3. **キーボードショートカット分散**: 各実装に分散していたショートカット処理を統一
4. **保守性向上**: 単一のソースオブトゥルースによる保守性向上

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                  統合画面アーキテクチャ                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │ HelpScene       │    │ SettingsScene              │  │
│  │ (統合ヘルプ)    │    │ (統合設定)                  │  │
│  └─────────────────┘    └─────────────────────────────┘  │
│           │                          │                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           KeyboardShortcutRouter                    │  │
│  │         (統一キーボード制御)                        │  │
│  └─────────────────────────────────────────────────────┘  │
│           │                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         NavigationContextManager                    │  │
│  │        (コンテキスト依存ナビゲーション)             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 主要コンポーネント

- **HelpScene**: 統一されたヘルプ表示・管理システム
- **SettingsScene**: 統一された設定管理・UI システム
- **NavigationContextManager**: コンテキスト依存のナビゲーション制御
- **KeyboardShortcutRouter**: 統一されたキーボードショートカット処理

---

## 統合ヘルプシステム

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    HelpScene                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ContextualHelp   │  │ HelpContentManager             │ │
│  │ Manager         │  │ (コンテンツ管理)                │ │
│  │ (コンテキスト   │  └─────────────────────────────────┘ │
│  │  依存ヘルプ)    │                                    │
│  └─────────────────┘  ┌─────────────────────────────────┐ │
│                       │ HelpAccessibilityManager       │ │
│  ┌─────────────────┐  │ (アクセシビリティ)               │ │
│  │ HelpAnimation   │  └─────────────────────────────────┘ │
│  │ Manager         │                                    │
│  │ (アニメーション)│  ┌─────────────────────────────────┐ │
│  └─────────────────┘  │ HelpRenderer                   │ │
│                       │ (レンダリング)                  │ │
│                       └─────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 統合された機能

#### 基本ヘルプ機能
- **ファイル**: `src/scenes/HelpScene.js`
- **サブコンポーネント**: 5つの専門コンポーネント
- **機能**:
  - 検索機能
  - フィードバックダイアログ
  - 効果レポート表示
  - 多言語対応

#### コンテキスト依存ヘルプ（ContextualHelpManager）
- **ファイル**: `src/scenes/help-scene/ContextualHelpManager.js`
- **統合機能**:
  - 5種類の動的ヘルプトリガー
  - 4種類のツールチップ
  - 2種類のインタラクティブガイド
  - シーン固有のヘルプコンテンツ

#### キーボードショートカット統合
- **Hキー**: 標準ヘルプアクセス
- **F1キー**: コンテキスト依存ヘルプ  
- **Ctrl+H**: ドキュメントヘルプ
- **Ctrl+?**: クイックリファレンス

### ヘルプアクセスモード

```javascript
// 標準ヘルプ (H キー)
{
  mode: 'standard',
  context: 'keyboard_h',
  features: ['full-help', 'search', 'feedback']
}

// コンテキスト依存 (F1 キー)  
{
  mode: 'contextual',
  context: 'keyboard_f1',
  features: ['context-specific', 'tooltips', 'guides']
}

// ドキュメントヘルプ (Ctrl+H)
{
  mode: 'documentation', 
  context: 'keyboard_ctrl_h',
  features: ['docs', 'api-reference', 'examples']
}

// クイックヘルプ (Ctrl+?)
{
  mode: 'quick',
  context: 'keyboard_ctrl_question',
  features: ['shortcuts', 'quick-tips', 'hotkeys']
}
```

### API リファレンス

```javascript
// HelpScene 初期化
const helpScene = new HelpScene();

// コンテキストデータ付きでヘルプを表示
helpScene.enter({
  mode: 'contextual',
  sourceScene: 'GameScene',
  helpType: 'controls',
  accessMethod: 'keyboard_f1'
});

// ContextualHelpManager 使用例
helpScene.contextualHelpManager.showTooltip({
  element: 'scoreDisplay',
  content: 'Current game score',
  position: 'top'
});
```

---

## 統合設定システム

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                  SettingsScene                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │AccessibilitySe  │  │ SettingsUI                     │ │
│  │ttingsManager    │  │ (基本UI)                       │ │
│  │ (高度A11y設定)  │  └─────────────────────────────────┘ │
│  └─────────────────┘                                    │
│           │          ┌─────────────────────────────────┐ │
│  ┌─────────────────┐ │ SettingsRenderer               │ │
│  │ SettingsData    │ │ (レンダリング)                  │ │
│  │ Manager         │ └─────────────────────────────────┘ │
│  │ (データ管理)    │                                    │
│  └─────────────────┘ ┌─────────────────────────────────┐ │
│                      │ SettingsEventManager           │ │
│                      │ (イベント処理)                  │ │
│                      └─────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 統合された機能

#### 基本設定機能
- **ファイル**: `src/scenes/SettingsScene.js`
- **カテゴリ**: 5つの主要カテゴリ
  - **general**: 一般設定
  - **social**: ソーシャル設定
  - **privacy**: プライバシー設定
  - **notifications**: 通知設定
  - **accessibility**: アクセシビリティ設定

#### アクセシビリティ設定強化（AccessibilitySettingsManager）
- **ファイル**: `src/scenes/settings-scene/AccessibilitySettingsManager.js`
- **統合機能**:
  - 設定プロファイル管理（3プロファイル）
  - エクスポート/インポート機能（JSON形式）
  - リアルタイムプレビュー機能
  - 設定検証とバリデーション
  - 統計・アナリティクス機能

#### UI要素
- トグルボタン
- スライダー  
- セレクトボックス
- テキスト入力フィールド
- 確認ダイアログ

### 設定アクセスモード

```javascript
// 標準設定アクセス (S キー)
{
  mode: 'standard',
  context: 'keyboard_s',
  category: 'general'
}

// ヘルプからの設定アクセス (ESC)
{
  mode: 'fromHelp',
  context: 'help_esc',
  category: 'accessibility'  
}

// クイック設定アクセス
{
  mode: 'quickAccess',
  context: 'menu_click',
  category: 'social',
  directSetting: 'enableSharing'
}

// アクセシビリティフォーカス
{
  mode: 'accessibilityFocus',
  context: 'accessibility_shortcut',
  category: 'accessibility',
  profile: 'highContrast'
}
```

### プロファイル管理

```javascript
// 利用可能なプロファイル
const profiles = {
  default: {
    name: 'デフォルト',
    settings: { /* 標準設定 */ }
  },
  highContrast: {
    name: '高コントラスト',
    settings: { /* 高コントラスト設定 */ }
  },
  motorAccessibility: {
    name: '運動機能配慮',
    settings: { /* 運動機能支援設定 */ }
  }
};

// プロファイル適用
settingsScene.accessibilitySettingsManager.applyProfile('highContrast');

// 設定のエクスポート
const exportedSettings = settingsScene.accessibilitySettingsManager.exportSettings();

// 設定のインポート
settingsScene.accessibilitySettingsManager.importSettings(exportedSettings);
```

### API リファレンス

```javascript
// SettingsScene 初期化
const settingsScene = new SettingsScene();

// コンテキストデータ付きで設定を表示
settingsScene.enter({
  mode: 'fromHelp',
  sourceScene: 'HelpScene',
  category: 'accessibility',
  directSetting: 'screenReaderSupport',
  accessMethod: 'help_esc'
});

// 特定設定への直接ナビゲーション
settingsScene.navigateToSetting('social', 'enableSharing');
```

---

## ナビゲーションコンテキスト管理

### アーキテクチャ

NavigationContextManager は、ユーザーのナビゲーション履歴を追跡し、適切な戻り先を動的に決定するシステムです。

```
┌─────────────────────────────────────────────────────────┐
│            NavigationContextManager                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Context Stack (最大10件)                              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [0] GameScene (keyboard_h)  - 2025-01-15 14:30:25  │ │
│  │ [1] MenuScene (menu_click)  - 2025-01-15 14:28:15  │ │
│  │ [2] ShopScene (shop_s)      - 2025-01-15 14:25:10  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  Circular Navigation Detection                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ MenuScene -> HelpScene -> SettingsScene -> X        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### コンテキスト情報

各ナビゲーションコンテキストには以下の情報が含まれます：

```javascript
{
  scene: 'GameScene',           // 元のシーン名
  method: 'keyboard_h',         // アクセス方法
  timestamp: 1705384225000,     // タイムスタンプ
  sessionId: 'session_uuid',    // セッション識別子
  metadata: {                   // 追加メタデータ
    gameLevel: 5,
    score: 1250,
    difficulty: 'normal'
  }
}
```

### アクセス方法の種類

| メソッド | 説明 | 使用場面 |
|---------|------|----------|
| `keyboard_h` | Hキーによるヘルプアクセス | ゲーム中のヘルプ |
| `keyboard_s` | Sキーによる設定アクセス | ゲーム中の設定変更 |
| `keyboard_f1` | F1キーによるコンテキストヘルプ | 場面依存ヘルプ |
| `menu_click` | メニューからのクリック | 標準ナビゲーション |
| `help_esc` | ヘルプからのESCキー | ヘルプ→設定遷移 |
| `accessibility_shortcut` | アクセシビリティショートカット | A11y機能アクセス |

### 戻り先決定ロジック

```javascript
class NavigationContextManager {
  getReturnDestination() {
    // 1. スタックが空の場合はメインメニューへ
    if (this.contextStack.length === 0) {
      return 'menu';
    }
    
    // 2. 最新のコンテキストから戻り先を取得
    const latestContext = this.contextStack[this.contextStack.length - 1];
    
    // 3. 循環ナビゲーション検出
    if (this.isCircularNavigation(latestContext.scene)) {
      return this.getFallbackDestination();
    }
    
    // 4. 通常の戻り先決定
    return latestContext.scene;
  }
}
```

### エラーハンドリング

```javascript
// 無効なシーン名への対応
if (!this.gameEngine.sceneManager.hasScene(destination)) {
  LoggingSystem.warn('NavigationContextManager', 
    `Invalid return destination: ${destination}, falling back to menu`);
  return 'menu';
}

// 循環ナビゲーション検出
if (this.detectCircularNavigation()) {
  LoggingSystem.info('NavigationContextManager', 
    'Circular navigation detected, using fallback');
  return this.getFallbackDestination();
}
```

### API リファレンス

```javascript
// NavigationContextManager インスタンス作成
const navigationContext = new NavigationContextManager({
  maxStackSize: 10,
  enableCircularDetection: true,
  sessionTimeout: 300000 // 5分
});

// コンテキストをプッシュ
navigationContext.pushContext('GameScene', 'keyboard_h', {
  gameLevel: 5,
  score: 1250
});

// 戻り先を取得
const destination = navigationContext.getReturnDestination();

// コンテキストをポップ
const context = navigationContext.popContext();

// スタック状態確認
const stackDepth = navigationContext.getStackDepth();
const debugInfo = navigationContext.getDebugInfo();
```

---

## キーボードショートカットルーティング

### アーキテクチャ

KeyboardShortcutRouter は、すべてのキーボードショートカットを統一的に処理し、適切なシーンにルーティングするシステムです。

```
┌─────────────────────────────────────────────────────────┐
│            KeyboardShortcutRouter                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Shortcut Mappings                                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ H    -> help (HelpScene)                           │ │
│  │ S    -> settings (SettingsScene)                   │ │
│  │ F1   -> contextualHelp (HelpScene)                 │ │
│  │ ESC  -> goBack (NavigationContextManager)          │ │
│  │ F11  -> fullscreen (Browser API)                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  Modifier Key Support                                   │  
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Ctrl+H -> documentationHelp                        │ │
│  │ Ctrl+? -> quickHelp                                │ │
│  │ Ctrl+P -> profileSettings                          │ │
│  │ Ctrl+E -> exportSettings                           │ │
│  │ Ctrl+I -> importSettings                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ショートカット処理フロー

```
User Input (Keyboard)
         │
         ▼
Key Event Capture
         │
         ▼
Key Combination Generation
    (Ctrl+H, Shift+F1, etc.)
         │
         ▼
Shortcut Lookup
         │
         ▼
Context Validation
    (current scene, state)
         │
         ▼
Navigation Context Push
         │
         ▼
Scene Switching
         │
         ▼
Action Execution
```

### デバウンス処理

```javascript
class KeyboardShortcutRouter {
  handleKeyDown(event) {
    const currentTime = Date.now();
    const lastTime = this.lastKeyPressTime.get(event.code) || 0;
    
    // デバウンス期間内の連続入力を無視
    if (currentTime - lastTime < this.config.debounceDelay) {
      return;
    }
    
    this.lastKeyPressTime.set(event.code, currentTime);
    this.processShortcut(event);
  }
}
```

### 多言語キーボードサポート

```javascript
// 言語別キーマッピング
const languageKeyMappings = {
  'ja': { 'KeyH': 'help', 'KeyS': 'settings' },
  'en': { 'KeyH': 'help', 'KeyS': 'settings' },
  'de': { 'KeyH': 'hilfe', 'KeyS': 'einstellungen' },
  'fr': { 'KeyH': 'aide', 'KeyS': 'parametres' },
  'ar': { 'KeyH': 'مساعدة', 'KeyS': 'إعدادات' },
  'he': { 'KeyH': 'עזרה', 'KeyS': 'הגדרות' }
};

// RTL言語サポート
if (isRTLLanguage(language)) {
  this.adjustKeyboardLayoutForRTL();
}
```

### シーン固有の動作

```javascript
// 現在のシーンに基づく動的な振る舞い
handleHelpShortcut(currentScene) {
  if (currentScene === 'HelpScene') {
    // 既にヘルプシーンにいる場合は戻る
    return this.handleGoBack();
  }
  
  // NavigationContextManagerにコンテキストをプッシュ
  this.navigationContext.pushContext(currentScene, 'keyboard_h');
  
  // ヘルプシーンに切り替え
  return this.gameEngine.sceneManager.switchScene('help');
}
```

### API リファレンス

```javascript
// KeyboardShortcutRouter 初期化
const shortcutRouter = new KeyboardShortcutRouter(gameEngine, {
  debounceDelay: 150,
  enableLogging: true,
  preventDefaultBehavior: true,
  enableGlobalShortcuts: true
});

// カスタムショートカット追加
shortcutRouter.addShortcut('KeyT', {
  action: 'tutorial',
  scene: 'tutorial', 
  description: 'Open tutorial'
});

// 修飾キー付きショートカット追加
shortcutRouter.addShortcut('Ctrl+KeyT', {
  action: 'advancedTutorial',
  scene: 'tutorial',
  description: 'Open advanced tutorial'
});

// ショートカット削除
shortcutRouter.removeShortcut('KeyT');

// アクティブ状態制御
shortcutRouter.setActive(false); // ショートカット無効化
shortcutRouter.setActive(true);  // ショートカット有効化

// 設定更新
shortcutRouter.updateConfig({
  debounceDelay: 200,
  enableLogging: false
});
```

---

## 統合アーキテクチャ

### システム全体の相互作用

```
┌─────────────────────────────────────────────────────────┐
│                    Game Engine                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    User Input (Keyboard)          │
│  │  SceneManager   │           │                        │
│  │                 │           ▼                        │
│  │ ┌─────────────┐ │  ┌─────────────────┐              │
│  │ │ HelpScene   │ │◄─│KeyboardShortcut │              │
│  │ │             │ │  │Router           │              │
│  │ │ContextHelp  │ │  │                 │              │
│  │ │ Manager     │ │  │ ┌─────────────┐ │              │
│  │ └─────────────┘ │  │ │Navigation   │ │              │
│  │                 │  │ │Context      │ │              │
│  │ ┌─────────────┐ │  │ │Manager      │ │              │
│  │ │SettingsScene│ │◄─│ └─────────────┘ │              │
│  │ │             │ │  └─────────────────┘              │
│  │ │Accessibility│ │           │                        │
│  │ │Settings     │ │           ▼                        │
│  │ │Manager      │ │    Scene Switching                 │
│  │ └─────────────┘ │    & Context Push                  │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### データフロー

```
1. User Input
   │
   ├─ H Key ────────────┐
   ├─ S Key ────────────┤
   ├─ F1 Key ───────────┤
   └─ ESC Key ──────────┤
                        │
2. KeyboardShortcutRouter
   │ ┌─────────────────┐
   ├─│ Event Capture   │
   ├─│ Key Combination │
   ├─│ Shortcut Lookup │
   └─│ Debounce Check  │
     └─────────────────┘
                        │
3. NavigationContextManager  
   │ ┌─────────────────┐
   ├─│ Push Context    │
   ├─│ Stack Management│
   └─│ Return Calc.    │
     └─────────────────┘
                        │
4. Scene Management
   │ ┌─────────────────┐
   ├─│ Scene Switch    │
   ├─│ Context Data    │
   └─│ Mode Setup      │
     └─────────────────┘
                        │
5. Scene Rendering
   ┌─────────────────┐
   │ HelpScene       │ ─── ContextualHelpManager
   │ - Content       │ ─── HelpContentManager  
   │ - Search        │ ─── HelpAccessibilityManager
   │ - Feedback      │ ─── HelpAnimationManager
   └─────────────────┘ ─── HelpRenderer
           │
   ┌─────────────────┐
   │ SettingsScene   │ ─── AccessibilitySettingsManager
   │ - Categories    │ ─── SettingsDataManager
   │ - UI Elements   │ ─── SettingsRenderer  
   │ - Validation    │ ─── SettingsEventManager
   └─────────────────┘
```

### 状態管理

```javascript
// システム全体の状態
const SystemState = {
  // キーボードルーター状態
  keyboard: {
    isActive: true,
    pressedKeys: new Set(),
    activeModifiers: new Set(),
    lastKeyPressTime: new Map()
  },
  
  // ナビゲーションコンテキスト状態
  navigation: {
    contextStack: [],
    currentContext: null,
    sessionId: 'session_uuid',
    stackSize: 0
  },
  
  // ヘルプシステム状態
  help: {
    currentMode: 'standard',
    activeTooltips: [],
    searchQuery: '',
    isContextualActive: false
  },
  
  // 設定システム状態
  settings: {
    currentCategory: 'general',
    pendingChanges: {},
    activeProfile: 'default',
    isPreviewMode: false
  }
};
```

### イベントフロー

```javascript
// イベント連鎖の例（Hキー押下）
1. window.addEventListener('keydown', event) 
   │
2. KeyboardShortcutRouter.handleKeyDown(event)
   │
3. KeyboardShortcutRouter.generateKeyCombo(event) → 'KeyH'
   │  
4. KeyboardShortcutRouter.processShortcut('KeyH')
   │
5. KeyboardShortcutRouter.handleHelpShortcut(currentScene)
   │
6. NavigationContextManager.pushContext(currentScene, 'keyboard_h')
   │
7. GameEngine.sceneManager.switchScene('help')
   │
8. HelpScene.enter({ mode: 'standard', context: 'keyboard_h' })
   │
9. HelpScene.render() → User sees help content
```

### エラーハンドリング戦略

```javascript
// 多層エラーハンドリング
try {
  // レベル1: キーボードルーターレベル
  KeyboardShortcutRouter.handleKeyDown(event);
} catch (keyboardError) {
  LoggingSystem.error('KeyboardError', keyboardError);
  
  try {
    // レベル2: ナビゲーションコンテキストレベル
    NavigationContextManager.handleError(keyboardError);
  } catch (navigationError) {
    LoggingSystem.error('NavigationError', navigationError);
    
    // レベル3: フォールバック
    GameEngine.sceneManager.switchScene('menu');
  }
}
```

---

## 実装ガイドライン

### 新しいシーンの統合

統合アーキテクチャに新しいシーンを追加する場合：

```javascript
// 1. NavigationContextManager 対応
class NewScene {
  constructor() {
    this.navigationContext = new NavigationContextManager();
  }
  
  enter(contextData = {}) {
    // コンテキストデータを処理
    this.processContextData(contextData);
  }
  
  setupEventCallbacks() {
    // 戻るボタンのコールバック設定
    this.onGoBack = () => {
      const destination = this.navigationContext.getReturnDestination();
      this.gameEngine.sceneManager.switchScene(destination);
    };
  }
}

// 2. KeyboardShortcutRouter にショートカット追加
shortcutRouter.addShortcut('KeyN', {
  action: 'newScene',
  scene: 'newScene',
  description: 'Open new scene'
});

// 3. MainMenuScene でナビゲーション追加
openNewScene() {
  this.navigationContext.pushContext('menu', 'menu_click');
  this.gameEngine.sceneManager.switchScene('newScene', {
    mode: 'standard',
    sourceScene: 'menu',
    accessMethod: 'menu_click'
  });
}
```

### キーボードショートカット追加

```javascript
// シンプルなショートカット
shortcutRouter.addShortcut('KeyI', {
  action: 'inventory',
  scene: 'inventory',
  description: 'Open inventory'
});

// 修飾キー付きショートカット
shortcutRouter.addShortcut('Ctrl+Shift+D', {
  action: 'debugMode',
  scene: null, // シーン変更なし
  callback: () => DebugManager.toggle(),
  description: 'Toggle debug mode'
});

// 条件付きショートカット
shortcutRouter.addShortcut('KeyP', {
  action: 'pause',
  scene: null,
  condition: () => GameState.isPlaying,
  callback: () => GameEngine.togglePause(),
  description: 'Pause/unpause game'
});
```

### アクセシビリティ対応

```javascript
// スクリーンリーダー対応
if (this.gameEngine.accessibilityManager.screenReaderMode) {
  this.announceNavigation(destination, context);
}

// 高コントラスト対応  
if (this.currentProfile === 'highContrast') {
  this.applyHighContrastTheme();
}

// キーボード専用ナビゲーション
this.setupKeyboardOnlyNavigation();
```

### パフォーマンス最適化

```javascript
// デバウンス設定
const shortcutRouter = new KeyboardShortcutRouter(gameEngine, {
  debounceDelay: 150, // 連続入力防止
});

// メモリ効率的なコンテキスト管理
const navigationContext = new NavigationContextManager({
  maxStackSize: 10,      // スタックサイズ制限
  sessionTimeout: 300000 // 5分でタイムアウト
});

// 遅延読み込み
const contextualHelpManager = lazy(() => 
  import('./ContextualHelpManager.js'));
```

---

## トラブルシューティング

### よくある問題と解決策

#### 1. キーボードショートカットが反応しない

**症状**: HキーやSキーを押してもヘルプ・設定画面が開かない

**原因と解決策**:
```javascript
// 1. KeyboardShortcutRouter が非アクティブ
if (!shortcutRouter.state.isActive) {
  shortcutRouter.setActive(true);
}

// 2. デバウンス期間内の連続入力
// → 少し間を空けて再度入力

// 3. 他のイベントリスナーが preventDefault
// → イベントバブリングを確認
event.stopImmediatePropagation();
```

#### 2. 戻り先が不正

**症状**: ESCキーで想定と異なるシーンに戻る

**原因と解決策**:
```javascript
// 1. NavigationContextManager の状態確認
const debugInfo = navigationContext.getDebugInfo();
console.log('Context stack:', debugInfo.contextStack);

// 2. 循環ナビゲーション検出
if (navigationContext.detectCircularNavigation()) {
  navigationContext.clear();
}

// 3. フォールバック先の設定
navigationContext.updateConfig({
  fallbackDestination: 'menu'
});
```

#### 3. メモリリーク

**症状**: ゲーム実行中にメモリ使用量が増加し続ける

**原因と解決策**:
```javascript  
// 1. イベントリスナーの適切なクリーンアップ
scene.destroy = function() {
  this.shortcutRouter.cleanup();
  this.navigationContext.clear();
  this.contextualHelpManager.destroy();
};

// 2. タイマーのクリア
clearInterval(this.contextCheckInterval);
clearTimeout(this.debounceTimeout);

// 3. WeakMap の使用
this.sceneReferences = new WeakMap();
```

#### 4. 多言語環境での問題

**症状**: 非英語キーボードでショートカットが動作しない

**原因と解決策**:
```javascript
// 1. KeyCode vs Code の使い分け
event.code // 物理キー位置（推奨）
event.key  // 論理キー文字

// 2. 言語別マッピング確認
const mapping = languageKeyMappings[currentLanguage];
if (!mapping || !mapping[event.code]) {
  // フォールバック処理
  useDefaultMapping(event.code);
}
```

### デバッグ支援

#### デバッグ情報の取得

```javascript
// システム全体のデバッグ情報
function getSystemDebugInfo() {
  return {
    keyboard: shortcutRouter.getDebugInfo(),
    navigation: navigationContext.getDebugInfo(),
    help: helpScene?.getDebugInfo(),
    settings: settingsScene?.getDebugInfo()
  };
}

// コンソールに出力
console.log('System Debug Info:', getSystemDebugInfo());
```

#### ログ設定

```javascript
// 詳細ログ有効化
LoggingSystem.setLevel('debug');
LoggingSystem.enableCategory('KeyboardShortcut');
LoggingSystem.enableCategory('NavigationContext');

// 特定機能のトレース
shortcutRouter.updateConfig({ enableLogging: true });
navigationContext.updateConfig({ enableLogging: true });
```

#### テスト実行

```javascript
// 単体テスト実行
npm test tests/core/navigation/KeyboardShortcutRouter.test.js
npm test tests/core/navigation/NavigationContextManager.test.js

// 統合テスト実行  
npm test tests/integration/unified-help-screen-access.test.js
npm test tests/integration/unified-settings-screen-access.test.js

// E2E テスト実行
npm run test:e2e tests/e2e/consolidated-screen-workflows-e2e.spec.js
```

---

## まとめ

### 統合アーキテクチャの利点

1. **一貫性**: 統一されたナビゲーション体験
2. **保守性**: 単一のソースオブトゥルース
3. **拡張性**: 新機能追加の容易さ
4. **信頼性**: 包括的なテストカバレッジ
5. **ユーザビリティ**: コンテキスト依存の適切な動作

### 今後の改善案

1. **ジェスチャーサポート**: タッチ・マウスジェスチャーの統合
2. **音声コントロール**: 音声コマンドによるナビゲーション
3. **AI支援**: コンテキスト予測による自動最適化
4. **分析機能**: ユーザー行動分析による UX 改善
5. **プラグインシステム**: サードパーティ拡張機能サポート

---

**文書バージョン**: 1.0  
**最終更新**: 2025-01-15  
**作成者**: Claude Code Assistant  
**レビュー**: 要予定