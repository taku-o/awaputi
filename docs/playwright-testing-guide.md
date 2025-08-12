# Playwright を使用した BubblePop ゲーム操作ガイド

## 概要
このドキュメントでは、Playwrightを使用してBubblePopゲームを自動操作・テストする際の手順を説明します。

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

### 1. Canvas入力が反応しない → URLパラメータ方式を使用
```javascript
// ✅ 推奨：URLパラメータ方式
await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');

// ❌ 非推奨：JavaScript直接操作（不安定）
// await page.evaluate(() => { ... });
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

// メインメニューの確認
await page.waitForFunction(() => {
    return window.gameEngine && 
           window.gameEngine.sceneManager && 
           window.gameEngine.sceneManager.currentScene === 'menu';
});
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

## 注意事項

1. **非同期処理**: ゲーム初期化は非同期のため、適切な待機時間が必要
2. **Canvas操作**: 通常のHTML要素とは異なる操作方法
3. **状態管理**: LocalStorageにゲーム状態が保存されるため、テスト前のクリアが重要
4. **エラーハンドリング**: ネットワークエラーやタイムアウトに対する適切な処理
5. **✅ URLパラメータ方式を推奨**: `?username=TestUser&skipUsernameInput=true`で確実にメインメニューへアクセス
6. **❌ JavaScript直接操作は非推奨**: Canvas内でのkeyboard.type()やJavaScript操作は不安定

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