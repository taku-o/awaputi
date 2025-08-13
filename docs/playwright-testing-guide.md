# Playwright を使用した BubblePop ゲーム操作ガイド

## 概要
このドキュメントでは、Playwrightを使用してBubblePopゲームを自動操作・テストする際の手順を説明します。

**🎯 2025年1月更新**: ゲームエンジン統合システム（NavigationContextManager、統合HelpScene/SettingsScene）の適切なテスト手法を追加しました。

## 前提条件

### 1. ローカルストレージのクリア
ゲーム操作前に、キャッシュされたデータをクリアする必要があります。

```javascript
// LocalStorageをクリア
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});

// または特定のキーのみクリア
await page.evaluate(() => {
    localStorage.removeItem('bubblePopPlayerData');
    localStorage.removeItem('bubblePopSettings');
});
```

### 2. 開発サーバーの起動
```bash
python3 -m http.server 8001
```

## 操作手順

### 【推奨】簡単アクセス方法
URLパラメータを使用してメインメニューに直接アクセス：

```javascript
// メインメニューに直接アクセス
await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');

// LocalStorageをクリア（必要な場合のみ）
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});

// ページを再読み込み
await page.reload();

// 「ゲームを開始する」ボタンをクリック
await page.getByRole('button', { name: 'ゲームを開始する' }).click();

// 「始める」ボタンをクリック  
await page.getByRole('button', { name: '始める' }).click();

// メインメニュー表示を待機
await page.waitForTimeout(2000);
```

### 【従来方式】段階的アクセス方法

### Step 1: エントリーページ - 「ゲームスタート」
**画面状態**: 初期エントリーページ

```javascript
// ページにアクセス
await page.goto('http://localhost:8001');

// LocalStorageをクリア
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});

// 「ゲームを開始する」ボタンをクリック
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
```

### Step 2: PWAウェルカム画面 - 「始める」
**画面状態**: PWAインストールウェルカメッセージ

```javascript
// 「始める」ボタンをクリック
await page.getByRole('button', { name: '始める' }).click();

// ゲーム初期化の完了を待機
await page.waitForTimeout(2000);
```

### Step 3: メインメニュー直接アクセス（推奨方法）
**新しい方法**: URLパラメータによるユーザー名入力スキップ

```javascript
// URLパラメータでユーザー名入力をスキップしてメインメニューに直接アクセス
await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');

// 「ゲームを開始する」ボタンをクリック
await page.getByRole('button', { name: 'ゲームを開始する' }).click();

// 「始める」ボタンをクリック
await page.getByRole('button', { name: '始める' }).click();

// ゲーム初期化とメインメニュー表示を待機
await page.waitForTimeout(2000);
```

**この方法の利点**:
- ✅ **シンプル**: URLパラメータだけで完結
- ✅ **確実**: Canvas入力の問題を回避
- ✅ **高速**: 余計な操作が不要
- ✅ **安定**: JavaScript直接操作によるエラーなし

### Step 3 (旧方式): ユーザー名入力画面での操作
**画面状態**: Canvasベースのユーザー名登録フォーム（URLパラメータを使わない場合のみ表示）

```javascript
// ⚠️ 非推奨: この方法は不安定です
// Canvasがアクティブになるまで待機
const canvas = page.getByRole('img', { name: 'ゲーム画面' });
await canvas.click();

// JavaScriptによる直接操作（不安定）
await page.evaluate(() => {
    const scene = window.gameEngine.sceneManager.currentSceneInstance;
    scene.usernameInputManager.usernameInput = 'TestUser';
    scene.confirmUsername();
    window.gameEngine.render();
});

await page.waitForTimeout(1000);
```

### Step 4: メインメニュー画面到達
**画面状態**: ゲームのメインメニュー
- タイトル: "BubblePop" (中央配置)
- サブタイトル: "泡割りゲーム"
- メニューボタン: "ゲーム開始", "設定", "ヘルプ" など
- プレイヤー情報: 設定したユーザー名が表示

```javascript
// メインメニューの表示確認
await page.waitForSelector('canvas');

// スクリーンショット撮影（検証用）
await canvas.screenshot({ path: 'main-menu.png' });

// メニュー操作例
await page.keyboard.press('ArrowDown'); // メニュー選択移動
await page.keyboard.press('Enter');     // メニュー決定
```

## 完全な操作フロー例

### 【推奨】URLパラメータ方式

```javascript
import { chromium } from 'playwright';

async function testBubblePopGame() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // URLパラメータでユーザー名入力をスキップしてメインメニューに直接アクセス
        await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');
        
        // LocalStorageをクリア（必要に応じて）
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // ページ再読み込み
        await page.reload();
        
        // エントリーページの「ゲームを開始する」ボタンをクリック
        await page.getByRole('button', { name: 'ゲームを開始する' }).click();
        
        // PWAウェルカム画面の「始める」ボタンをクリック
        await page.getByRole('button', { name: '始める' }).click();
        
        // メインメニュー表示を待機
        await page.waitForTimeout(2000);
        
        // メインメニューのスクリーンショット撮影
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await canvas.screenshot({ path: 'main-menu-final.png' });
        
        console.log('✅ ゲーム操作完了: メインメニューに到達（URLパラメータ方式）');
        
    } catch (error) {
        console.error('❌ エラー:', error);
    } finally {
        await browser.close();
    }
}

testBubblePopGame();
```

### 【従来方式】段階的操作方式

```javascript
import { chromium } from 'playwright';

async function testBubblePopGameLegacy() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // LocalStorageクリア
        await page.goto('http://localhost:8001');
        await page.evaluate(() => localStorage.clear());
        
        // ページ再読み込み
        await page.reload();
        
        // エントリーページ
        await page.getByRole('button', { name: 'ゲームを開始する' }).click();
        
        // PWAウェルカム画面
        await page.getByRole('button', { name: '始める' }).click();
        await page.waitForTimeout(2000);
        
        // ⚠️ ユーザー名入力（非推奨・不安定）
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await canvas.click();
        
        // JavaScript経由で直接操作（不安定）
        await page.evaluate(() => {
            const scene = window.gameEngine.sceneManager.currentSceneInstance;
            scene.usernameInputManager.usernameInput = 'TestUser';
            scene.confirmUsername();
            window.gameEngine.render();
        });
        await page.waitForTimeout(1000);
        
        // メインメニュー確認
        await canvas.screenshot({ path: 'final-main-menu-legacy.png' });
        
        console.log('✅ ゲーム操作完了: メインメニューに到達（従来方式）');
        
    } catch (error) {
        console.error('❌ エラー:', error);
    } finally {
        await browser.close();
    }
}

// testBubblePopGameLegacy(); // 非推奨
```
```

## トラブルシューティング

### 1. Canvas入力が反応しない → 裏道手法を使用

#### 方法A: ESCキー + LocalStorage強制設定（最も確実）
```javascript
// ゲーム初期化後にESCキーでユーザー名入力をスキップし、LocalStorageを直接設定
await page.goto('http://localhost:8001');
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(2000); // ゲーム初期化を待機

// ESCキーでユーザー名入力をスキップ + LocalStorage直接設定
await page.evaluate(() => {
    // ユーザーデータを直接設定
    window.localStorage.setItem('bubblePopPlayerData', JSON.stringify({
        username: 'TestUser',
        level: 1,
        experience: 0,
        totalScore: 0
    }));
    
    // プレイヤーデータを強制読み込み
    if (window.gameEngine && window.gameEngine.playerData) {
        window.gameEngine.playerData.username = 'TestUser';
        window.gameEngine.playerData.hasValidData = true;
    }
});
await page.keyboard.press('Escape'); // ユーザー名入力をスキップ
await page.waitForTimeout(1000);
```

#### 方法B: LocalStorage事前設定 + 再読み込み
```javascript
// 事前にLocalStorageを設定してからゲーム開始
await page.goto('http://localhost:8001');
await page.evaluate(() => {
    localStorage.setItem('bubblePopPlayerData', JSON.stringify({
        username: 'TestUser',
        level: 1,
        experience: 0,
        totalScore: 0,
        hasValidData: true
    }));
});
await page.reload();
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(3000);
```

#### 方法C: デバッグモード強制スキップ
```javascript
// デバッグモードでシーン状態を強制変更
await page.goto('http://localhost:8001?debug=true');
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(2000);

await page.evaluate(() => {
    // デバッグモードでシーン状態を直接制御
    if (window.gameEngine && window.gameEngine.sceneManager) {
        const scene = window.gameEngine.sceneManager.scenes.get('menu');
        if (scene) {
            // プレイヤーデータ設定
            window.gameEngine.playerData.username = 'TestUser';
            window.gameEngine.playerData.hasValidData = true;
            
            // メインメニューに強制遷移
            window.gameEngine.sceneManager.switchScene('menu');
            scene.state = 'mainMenu'; // ユーザー名入力状態をスキップ
        }
    }
});
await page.waitForTimeout(1000);
```

### 2. URLパラメータが効かない場合
```javascript
// ページを完全に再読み込み
await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});
await page.reload();

// コンソールでパラメータ確認
await page.evaluate(() => {
    console.log('Test username:', localStorage.getItem('testUsername'));
    console.log('Skip flag:', localStorage.getItem('skipUsernameInput'));
});
```

### 3. シーン遷移がうまく行かない
```javascript
// より長い待機時間を設定
await page.waitForTimeout(3000);

// メインメニューの確認（複数の条件で確認）
await page.waitForFunction(() => {
    return window.gameEngine && 
           window.gameEngine.sceneManager && 
           (window.gameEngine.sceneManager.currentScene === 'menu' ||
            window.gameEngine.sceneManager.currentScene === 'MainMenuScene') &&
           window.gameEngine.playerData &&
           window.gameEngine.playerData.username;
}, { timeout: 10000 });
```

### 4. 【最終手段】シーン状態を安全に強制変更
```javascript
// 全ての手法が失敗した場合の最終手段（安全版）
await page.evaluate(() => {
    if (window.gameEngine && window.gameEngine.sceneManager) {
        // プレイヤーデータを完全設定
        window.gameEngine.playerData = {
            username: 'TestUser',
            level: 1,
            experience: 0,
            totalScore: 0,
            hasValidData: true,
            save: function() { return true; },
            load: function() { return true; }
        };
        
        // 現在のシーンインスタンスの状態のみ変更（安全）
        const currentScene = window.gameEngine.sceneManager.currentSceneInstance;
        if (currentScene && currentScene.state) {
            currentScene.state = 'mainMenu';
            console.log('Changed current scene state to mainMenu');
            return 'Success: Scene state changed';
        }
        
        // 代替案：switchSceneメソッドを使用
        if (window.gameEngine.sceneManager.switchScene) {
            try {
                window.gameEngine.sceneManager.switchScene('menu');
                return 'Success: Switched to menu scene';
            } catch (e) {
                console.error('switchScene failed:', e);
            }
        }
        
        return 'Warning: Could not change scene state safely';
    }
    return 'Error: Game engine not available';
});
```

### 5. 【緊急時】ブラウザリフレッシュ + 事前設定
```javascript
// エラーが発生した場合の回復手順
await page.evaluate(() => {
    // LocalStorageに事前設定
    localStorage.setItem('bubblePopPlayerData', JSON.stringify({
        username: 'TestUser',
        level: 1,
        experience: 0,
        totalScore: 0,
        hasValidData: true
    }));
    localStorage.setItem('forceMainMenu', 'true');
});

// ページをリフレッシュしてクリーンな状態から開始
await page.reload();
await page.waitForTimeout(2000);

// ゲーム開始
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(3000);

// 事前設定されたデータでメインメニューに直接遷移することを期待
```

### 4. スクリーンショット撮影
各ステップでの状態確認用：
```javascript
// 全画面スクリーンショット
await page.screenshot({ path: `step-${stepNumber}.png`, fullPage: true });

// Canvas部分のみ（推奨）
const canvas = page.getByRole('img', { name: 'ゲーム画面' });
await canvas.screenshot({ path: `canvas-step-${stepNumber}.png` });
```

## キーボードショートカット

メインメニュー到達後に使用可能：
- `↑↓`: メニュー選択移動
- `Enter`: 決定
- `ESC`: キャンセル/戻る
- ⚠️ **注意**: `S`キーは設定画面に遷移するため、ユーザー名入力時は避ける
- `H` or `F1`: ヘルプ
- `Ctrl+Shift+D`: デバッグモード切り替え

### 回避すべきキーボードショートカット
ユーザー名入力画面では以下のキーは避ける：
- `S`: 設定画面が開く（ユーザー名入力中に'TestUser'の's'を入力すると設定画面に遷移）
- `H`: ヘルプ画面が開く
- `F1`: ヘルプ画面が開く

## 🎯 ゲームエンジン統合システムのキーボードショートカットテスト

### ✅ 確立された適切なテスト手法（2025年1月確立）

ゲームエンジンの統合システム（NavigationContextManager、統合されたHelpScene/SettingsScene）をテストするための確実な手法：

#### 1. 正しい初期化待機プロセス

**重要**: ゲームエンジンの完全な初期化を待たずにテストすると統合システムが未完成状態でテストされ、誤った結果になる。

```javascript
async function initializeGameEngineForTesting(page) {
    // ステップ1: ゲーム開始ボタンをクリック
    await page.getByRole('button', { name: 'ゲームを開始する' }).click();
    
    // ステップ2: 適切な初期化待機（3秒推奨）
    await page.waitForTimeout(3000);
    
    // ステップ3: 初期化完了ログの確認（オプション）
    const initComplete = await page.evaluate(() => {
        // コンソールログから初期化完了を確認
        return document.title.includes('BubblePop') && 
               window.gameEngine && 
               window.gameEngine.sceneManager &&
               window.gameEngine.sceneManager.currentScene;
    });
    
    if (!initComplete) {
        throw new Error('Game engine initialization not complete');
    }
    
    console.log('✅ Game engine fully initialized');
}
```

#### 2. 統合システム状態の正確な確認

```javascript
async function verifyIntegratedSystemStatus(page) {
    const systemStatus = await page.evaluate(() => {
        const gameEngine = window.gameEngine;
        return {
            hasGameEngine: !!gameEngine,
            hasSceneManager: !!(gameEngine && gameEngine.sceneManager),
            currentScene: gameEngine?.sceneManager?.currentScene?.constructor?.name,
            hasKeyboardShortcutManager: !!(gameEngine && gameEngine.keyboardShortcutManager),
            // NavigationContextManagerは個別のシーンに統合されている
            sceneHasNavigationManager: gameEngine?.sceneManager?.currentScene?.navigationContextManager ? true : false
        };
    });
    
    console.log('Game Engine Status:', systemStatus);
    return systemStatus;
}
```

#### 3. キーボードショートカットの統合システムテスト

**✅ 確実に動作する手法**:

```javascript
async function testIntegratedKeyboardShortcuts(page) {
    // 前提: ゲームエンジンが完全に初期化済み
    await initializeGameEngineForTesting(page);
    
    // Hキーテスト: ヘルプ画面アクセス
    console.log('🧪 Testing H key (Help access)...');
    await page.keyboard.press('KeyH');
    await page.waitForTimeout(500);
    
    // ログでシーン遷移確認
    const helpSceneActive = await page.evaluate(() => {
        return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'HelpScene';
    });
    
    if (helpSceneActive) {
        console.log('✅ H key: Help screen access successful');
        
        // ESCキーテスト: 戻り機能
        console.log('🧪 Testing ESC key (Back navigation)...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const backToMenu = await page.evaluate(() => {
            return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'MainMenuScene';
        });
        
        if (backToMenu) {
            console.log('✅ ESC key: Back navigation successful');
        } else {
            throw new Error('❌ ESC key: Back navigation failed');
        }
    } else {
        throw new Error('❌ H key: Help screen access failed');
    }
    
    // Sキーテスト: 設定画面アクセス
    console.log('🧪 Testing S key (Settings access)...');
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(500);
    
    const settingsSceneActive = await page.evaluate(() => {
        return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'SettingsScene';
    });
    
    if (settingsSceneActive) {
        console.log('✅ S key: Settings screen access successful');
        
        // ESCキーで設定から戻る
        console.log('🧪 Testing ESC key from Settings...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const backToMenuFromSettings = await page.evaluate(() => {
            return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'MainMenuScene';
        });
        
        if (backToMenuFromSettings) {
            console.log('✅ ESC key from Settings: Back navigation successful');
        } else {
            throw new Error('❌ ESC key from Settings: Back navigation failed');
        }
    } else {
        throw new Error('❌ S key: Settings screen access failed');
    }
    
    console.log('🎉 All integrated keyboard shortcuts working correctly!');
}
```

#### 4. コンソールログによる動作確認

統合システムの動作確認に使用すべきログメッセージ：

```javascript
// 期待されるログパターン
const expectedLogs = [
    // 初期化完了
    '[LOG] [DEBUG] 🎉 ゲーム初期化完了',
    '[INFO] NavigationContextManager Navigation context manager initial...',
    '[INFO] AccessibilitySettingsManager Accessibility settings manager...',
    
    // キーボードショートカット動作
    '[LOG] Switched to scene: help',           // H key success
    '[LOG] Switched to scene: menu',           // ESC key success  
    '[LOG] Switched to scene: settings',       // S key success
    '[INFO] HelpScene Standard help mode activated',
    '[INFO] HelpScene Navigated back to: menu, success: true',
    '[INFO] SettingsScene Navigated back to: menu, success: true'
];

// ログ確認機能
async function verifyExpectedLogs(page) {
    const consoleLogs = await page.evaluate(() => {
        return window.consoleHistory || []; // 必要に応じてログ履歴を保存
    });
    
    // 期待されるログが含まれているか確認
    expectedLogs.forEach(expectedLog => {
        const found = consoleLogs.some(log => log.includes(expectedLog));
        if (found) {
            console.log(`✅ Found expected log: ${expectedLog}`);
        } else {
            console.warn(`⚠️ Missing expected log: ${expectedLog}`);
        }
    });
}
```

#### 5. 完全な統合システムテスト例

```javascript
async function fullIntegratedSystemTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // 標準的な初期化プロセス
        await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload();
        
        // ゲームエンジン完全初期化
        await initializeGameEngineForTesting(page);
        
        // 統合システム状態確認
        await verifyIntegratedSystemStatus(page);
        
        // 統合キーボードショートカットテスト
        await testIntegratedKeyboardShortcuts(page);
        
        console.log('🎉 Integrated system test completed successfully!');
        
    } catch (error) {
        console.error('❌ Integrated system test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
```

### ⚠️ よくある間違いと回避方法

#### 間違い1: 初期化待機不足
```javascript
// ❌ 悪い例: 初期化完了前にテスト実行
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.keyboard.press('KeyH'); // 統合システム未完成でテスト

// ✅ 良い例: 適切な初期化待機
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(3000); // 統合システム完成まで待機
await page.keyboard.press('KeyH'); // 正常動作
```

#### 間違い2: 表面的な状態確認
```javascript
// ❌ 悪い例: GameEngineの有無のみ確認
const hasGameEngine = await page.evaluate(() => !!window.gameEngine);

// ✅ 良い例: 統合システムの詳細確認  
const systemComplete = await page.evaluate(() => {
    return window.gameEngine?.sceneManager?.currentScene && 
           window.gameEngine.keyboardShortcutManager;
});
```

### 🎯 このテスト手法の利点

1. **✅ 確実性**: ゲームエンジン完全初期化後のテストで統合システムの真の動作状況を確認
2. **✅ 再現性**: 段階的プロセスにより毎回同じ結果を獲得
3. **✅ デバッグ性**: ログメッセージによる動作状況の詳細確認が可能  
4. **✅ 保守性**: 統合システム変更時も同じ手法で検証継続可能

### 📅 更新履歴

- **2025-01-15**: Issue #163対応でゲームエンジン統合システムの適切なPlaywrightテスト手法を確立
- 従来のCanvas操作に加えて、統合システム特有の初期化プロセスとキーボードショートカット検証手法を追加

## 注意事項

1. **非同期処理**: ゲーム初期化は非同期のため、適切な待機時間が必要
2. **Canvas操作**: 通常のHTML要素とは異なる操作方法
3. **状態管理**: LocalStorageにゲーム状態が保存されるため、テスト前のクリアが重要
4. **エラーハンドリング**: ネットワークエラーやタイムアウトに対する適切な処理
5. **✅ URLパラメータ方式を推奨**: `?username=TestUser&skipUsernameInput=true`で確実にメインメニューへアクセス
6. **❌ JavaScript直接操作は非推奨**: Canvas内でのkeyboard.type()やJavaScript操作は不安定
7. **🎯 統合システムテスト重要事項**（2025年1月追加）:
   - **必須**: ゲームエンジン完全初期化（3秒待機）後にキーボードショートカットテストを実行
   - **必須**: ログメッセージ（`[LOG] Switched to scene:`）による動作確認を実施
   - **推奨**: 統合システム状態確認（NavigationContextManager、統合HelpScene/SettingsScene）
   - **注意**: 初期化待機なしでテストすると統合システム未完成状態で誤った結果を得る

## URLパラメータ一覧

### テスト用パラメータ
- `username=ユーザー名`: 自動設定するユーザー名
- `skipUsernameInput=true`: ユーザー名入力画面をスキップ

### デバッグ用パラメータ  
- `debug=true`: デバッグモードを有効化

### 使用例
```
http://localhost:8001?username=TestUser&skipUsernameInput=true&debug=true
```

このガイドに従うことで、Playwrightを使用したBubblePopゲームの確実で安定した自動操作・テストが可能になります。