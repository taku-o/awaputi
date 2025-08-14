# Components

このディレクトリには、ゲーム設定UIで使用される再利用可能なコンポーネントが含まれています。

## コンポーネント一覧

### VolumeControlComponent

音量制御のためのUIコンポーネントです。音量アップ/ダウンボタンと現在音量レベルの視覚的フィードバックを提供します。

### AccessibilityProfileComponent

アクセシビリティプロファイル切り替えのためのUIコンポーネントです。プリセットされたアクセシビリティ設定を選択・適用できます。

---

## VolumeControlComponent

## 特徴

- **音量調整**: 10%刻みでの音量調整
- **視覚的フィードバック**: プログレスバーによる現在音量の表示
- **エッジケース処理**: 最大/最小値でのボタン無効化
- **アクセシビリティ対応**: キーボード操作、ARIA属性、スクリーンリーダー対応
- **エラーハンドリング**: 包括的なエラー処理とフォールバック機能

## 基本的な使用方法

```javascript
import { VolumeControlComponent } from './VolumeControlComponent.js';

// コンポーネントの作成
const volumeControl = new VolumeControlComponent(gameEngine);

// 初期化と表示
const container = document.getElementById('settings-container');
volumeControl.initialize(container);
```

## API リファレンス

### Constructor

```javascript
const volumeControl = new VolumeControlComponent(gameEngine);
```

- `gameEngine`: GameEngineインスタンス（settingsManager、audioManagerを含む）

### メソッド

#### initialize(parentContainer)
コンポーネントを初期化してDOMに追加します。

```javascript
const success = volumeControl.initialize(parentContainer);
```

- `parentContainer`: HTMLElement - 親コンテナ要素
- **返り値**: boolean - 初期化の成功/失敗

#### handleVolumeUp()
音量を10%増加させます（KeyboardShortcutManagerから移行）。

```javascript
volumeControl.handleVolumeUp();
```

#### handleVolumeDown()
音量を10%減少させます（KeyboardShortcutManagerから移行）。

```javascript
volumeControl.handleVolumeDown();
```

#### setVolume(volume)
指定した音量に設定します。

```javascript
volumeControl.setVolume(0.7); // 70%に設定
```

- `volume`: number - 音量値（0.0-1.0）

#### getCurrentVolume()
現在の音量を取得します。

```javascript
const currentVolume = volumeControl.getCurrentVolume(); // 0.0-1.0
```

#### onVolumeChanged(volume)
外部から音量変更を通知します。

```javascript
volumeControl.onVolumeChanged(0.8);
```

#### setVisible(visible)
コンポーネントの表示/非表示を切り替えます。

```javascript
volumeControl.setVisible(false); // 非表示
volumeControl.setVisible(true);  // 表示
```

#### isEnabled()
コンポーネントが有効かどうかを確認します。

```javascript
if (volumeControl.isEnabled()) {
    // コンポーネントが利用可能
}
```

#### updateAccessibility()
アクセシビリティ属性を更新します。

```javascript
volumeControl.updateAccessibility();
```

#### dispose()
コンポーネントをクリーンアップします。

```javascript
volumeControl.dispose();
```

#### getStats()
デバッグ用の統計情報を取得します。

```javascript
const stats = volumeControl.getStats();
console.log(stats);
```

## 設定統合

### SettingsSceneでの使用例

```javascript
import { VolumeControlComponent } from '../components/VolumeControlComponent.js';

export class SettingsScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.volumeControl = new VolumeControlComponent(gameEngine);
    }
    
    render(canvas, deltaTime) {
        // 設定画面のレンダリング...
        
        // 音量コントロールを表示
        if (!this.volumeControl.isEnabled()) {
            const audioSection = document.getElementById('audio-settings');
            this.volumeControl.initialize(audioSection);
        }
    }
    
    cleanup() {
        this.volumeControl.dispose();
        super.cleanup();
    }
}
```

### KeyboardShortcutManagerとの統合

```javascript
// KeyboardShortcutManager.js内での使用例
export class CoreKeyboardShortcutManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.volumeControl = new VolumeControlComponent(gameEngine);
        
        // ショートカットハンドラーを統合
        this.addShortcut('volumeUp', ['ArrowUp+ControlLeft'], 
            () => this.volumeControl.handleVolumeUp());
        this.addShortcut('volumeDown', ['ArrowDown+ControlLeft'], 
            () => this.volumeControl.handleVolumeDown());
    }
}
```

## スタイリング

コンポーネントは以下のCSSクラスを使用します：

- `.volume-control-component`: メインコンテナ
- `.volume-up-button`: 音量アップボタン
- `.volume-down-button`: 音量ダウンボタン
- `.volume-progress-bar`: プログレスバー
- `.volume-progress-fill`: プログレス表示

カスタムスタイルを適用する場合：

```css
.volume-control-component {
    /* カスタムスタイル */
}

.volume-up-button:hover {
    /* ホバー効果のカスタマイズ */
}
```

## アクセシビリティ

- **キーボード操作**: Tab、Enter、Spaceキーによる操作
- **ARIA属性**: role、aria-label、aria-disabled、aria-valuenowの設定
- **スクリーンリーダー**: 音量レベルの読み上げ対応
- **フォーカス管理**: 適切なフォーカス表示

## エラーハンドリング

- 設定マネージャーエラー時のフォールバック
- DOM操作エラーの安全な処理
- オーディオマネージャー不在時の対応
- 不正な音量値の自動修正

## パフォーマンス

- 軽量なDOM構造
- 効率的なイベントハンドリング
- メモリリークの防止
- 適切なクリーンアップ

## テスト

```bash
# テスト実行
npm test src/components/__tests__/VolumeControlComponent.test.js
```

テストカバレッジ：
- 基本機能のテスト
- エラーハンドリングのテスト
- アクセシビリティのテスト
- DOM操作のテスト
- API互換性のテスト

## 依存関係

- `../utils/ErrorHandler.js`: エラーハンドリング
- `../core/LocalizationManager.js`: 多言語対応
- `gameEngine.settingsManager`: 設定管理
- `gameEngine.audioManager`: 音声管理

## 変更履歴

### v1.0.0 (2025-01-28)
- 初期実装
- KeyboardShortcutManagerからの音量制御ロジック移行
- アクセシビリティ対応
- 包括的なテストスイート

---

## AccessibilityProfileComponent

アクセシビリティプロファイル切り替えのためのUIコンポーネントです。3つのプリセットプロファイル（Default, High Contrast, Motor Accessibility）から選択し、即座に設定を適用できます。

### 特徴

- **プリセットプロファイル**: 3つの事前定義されたアクセシビリティプロファイル
- **即座の反映**: プロファイル適用時の即座の視覚的フィードバック
- **ドロップダウンUI**: 直感的なプロファイル選択インターフェース
- **アクセシビリティ対応**: キーボード操作、ARIA属性、スクリーンリーダー対応
- **エラーハンドリング**: 包括的なエラー処理とユーザーフィードバック

### 基本的な使用方法

```javascript
import { AccessibilityProfileComponent } from './AccessibilityProfileComponent.js';

// コンポーネントの作成
const profileComponent = new AccessibilityProfileComponent(gameEngine);

// 初期化と表示
const container = document.getElementById('accessibility-settings');
profileComponent.initialize(container);
```

### API リファレンス

#### Constructor

```javascript
const profileComponent = new AccessibilityProfileComponent(gameEngine);
```

- `gameEngine`: GameEngineインスタンス（settingsManager、sceneManagerを含む）

#### メソッド

##### initialize(parentElement)
コンポーネントを初期化してDOMに追加します。

```javascript
const element = profileComponent.initialize(parentElement);
```

- `parentElement`: HTMLElement - 親コンテナ要素
- **返り値**: HTMLElement - 作成されたコンテナ要素

##### getCurrentProfile()
現在選択されているプロファイルIDを取得します。

```javascript
const profileId = profileComponent.getCurrentProfile(); // 'default', 'highContrast', 'motorAccessibility'
```

##### setProfile(profileId)
プログラムでプロファイルを設定します。

```javascript
const success = profileComponent.setProfile('highContrast');
```

- `profileId`: string - プロファイルID
- **返り値**: boolean - 設定の成功/失敗

##### getAvailableProfiles()
利用可能なプロファイル一覧を取得します。

```javascript
const profiles = profileComponent.getAvailableProfiles();
// [{ id: 'default', name: 'デフォルト', description: '標準設定', icon: '🎮' }, ...]
```

##### destroy()
コンポーネントをクリーンアップします。

```javascript
profileComponent.destroy();
```

### プロファイル一覧

#### Default（デフォルト）
- **アイコン**: 🎮
- **説明**: 標準設定
- **設定内容**: すべてのアクセシビリティ機能を無効

#### High Contrast（ハイコントラスト）
- **アイコン**: 🔆
- **説明**: 見やすい高コントラスト表示
- **設定内容**: ハイコントラスト、大きな文字、スクリーンリーダー、色覚サポート有効

#### Motor Accessibility（モビリティ対応）
- **アイコン**: ♿
- **説明**: モーション削減とナビゲーション支援
- **設定内容**: モーション削減、大きな文字有効

### SettingsSceneでの統合例

```javascript
import { AccessibilityProfileComponent } from '../components/AccessibilityProfileComponent.js';

export class SettingsScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.accessibilityProfileComponent = null;
    }
    
    initializeSettingItems() {
        return {
            accessibility: [
                // 既存の設定項目...
                { 
                    key: 'accessibility.profile', 
                    label: 'アクセシビリティプロファイル', 
                    type: 'custom',
                    component: 'AccessibilityProfileComponent',
                    description: 'プリセットされたアクセシビリティ設定を選択できます'
                }
            ]
        };
    }
    
    handleCustomComponent(settingItem, parentElement) {
        if (settingItem.component === 'AccessibilityProfileComponent') {
            if (!this.accessibilityProfileComponent) {
                this.accessibilityProfileComponent = new AccessibilityProfileComponent(this.gameEngine);
            }
            
            const element = this.accessibilityProfileComponent.initialize(parentElement);
            
            // プロファイル変更イベントのリスナーを設定
            element.addEventListener('accessibilityProfileChanged', (event) => {
                this.handleProfileChanged(event.detail);
            });
            
            return element;
        }
    }
    
    cleanup() {
        if (this.accessibilityProfileComponent) {
            this.accessibilityProfileComponent.destroy();
        }
        super.cleanup();
    }
}
```

### イベント

#### accessibilityProfileChanged
プロファイルが変更された時に発火されるカスタムイベントです。

```javascript
element.addEventListener('accessibilityProfileChanged', (event) => {
    console.log('Profile changed:', event.detail.profileId);
    console.log('Timestamp:', event.detail.timestamp);
});
```

### スタイリング

コンポーネントは以下のCSSクラスを使用します：

- `.accessibility-profile-component`: メインコンテナ
- `.profile-dropdown-button`: ドロップダウンボタン
- `.dropdown-options`: ドロップダウンオプション
- `.profile-apply-button`: 適用ボタン
- `.profile-status-indicator`: ステータス表示

### アクセシビリティ

- **キーボード操作**: Tab、Enter、矢印キー、Escapeによる操作
- **ARIA属性**: role、aria-label、aria-expanded、aria-selectedの設定
- **スクリーンリーダー**: プロファイル名と説明の読み上げ対応
- **フォーカス管理**: 適切なフォーカスの移動とトラップ

### エラーハンドリング

- AccessibilitySettingsManagerエラー時のフォールバック
- プロファイル適用失敗時のユーザー通知
- DOM操作エラーの安全な処理
- ネットワーク障害時の適切な対応

### Requirements満足

このコンポーネントは以下のRequirementsを満たしています：

- **Requirement 5.4**: プロファイル切り替えUIの実装
- **Requirement 5.7**: プロファイル切り替えの即座の反映

### 依存関係

- `../utils/ErrorHandler.js`: エラーハンドリング
- `../core/LocalizationManager.js`: 多言語対応
- `gameEngine.settingsManager`: 設定管理
- `gameEngine.sceneManager.currentScene.accessibilitySettingsManager`: アクセシビリティ設定管理

### 変更履歴

#### v1.0.0 (2025-01-14)
- 初期実装
- Issue #170 Task 1.2 対応
- 3つのプリセットプロファイル実装
- ドロップダウンUIとアクセシビリティ対応
- エラーハンドリングと視覚的フィードバック