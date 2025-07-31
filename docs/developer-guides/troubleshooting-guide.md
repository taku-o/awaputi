# トラブルシューティングガイド

## 概要

このガイドでは、BubblePop (awaputi) の開発中に遭遇する可能性のある一般的な問題と、その解決方法について説明します。問題を迅速に解決し、開発効率を向上させるための包括的なリファレンスとしてご活用ください。

## 目次

1. [開発環境の問題](#開発環境の問題)
2. [ゲーム実行時の問題](#ゲーム実行時の問題)
3. [テスト関連の問題](#テスト関連の問題)
4. [パフォーマンスの問題](#パフォーマンスの問題)
5. [設定管理の問題](#設定管理の問題)
6. [Git・バージョン管理の問題](#gitバージョン管理の問題)
7. [ブラウザ固有の問題](#ブラウザ固有の問題)
8. [デプロイ・本番環境の問題](#デプロイ本番環境の問題)

## 開発環境の問題

### 1. ローカルサーバーが起動しない

#### 症状
```bash
python -m http.server 8000
# エラー: Address already in use :::8000
```

#### 原因と解決方法

**原因1: ポートが使用中**
```bash
# 使用中のプロセスを確認
lsof -ti:8000

# プロセスを終了
lsofoutput=$(lsof -ti:8000)
if [ ! -z "$lsofoutput" ]; then
    kill -9 $lsofoutput
fi

# または別のポートを使用
python -m http.server 8001
```

**原因2: Python がインストールされていない**
```bash
# Python のバージョン確認
python --version
python3 --version

# Python がない場合の代替方法
npx serve . -p 8000
# または
npm install -g http-server
http-server -p 8000
```

**原因3: ファイアウォール・セキュリティソフト**
```bash
# Windows の場合
# Windows Defender ファイアウォールで Python を許可

# macOS の場合
# システム環境設定 > セキュリティとプライバシー > ファイアウォール
```

### 2. npm install エラー

#### 症状
```bash
npm install
# npm ERR! network timeout
# npm ERR! peer dep missing: react@">=16.8.0"
```

#### 解決方法

**ネットワーク関連エラー**
```bash
# npm キャッシュクリア
npm cache clean --force

# npm レジストリ確認・変更
npm config get registry
npm config set registry https://registry.npmjs.org/

# プロキシ設定（企業環境）
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

**依存関係エラー**
```bash
# package-lock.json を削除して再インストール
rm -rf node_modules package-lock.json
npm install

# 特定のパッケージバージョン問題
npm install --legacy-peer-deps

# Node.js バージョン確認
node --version  # v16.0.0+ が必要
```

**権限エラー (macOS/Linux)**
```bash
# npm グローバル設定変更
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# または sudo 使用（非推奨）
sudo npm install
```

### 3. ES6 モジュールエラー

#### 症状
```javascript
// Uncaught SyntaxError: Cannot use import statement outside a module
import { GameEngine } from './core/GameEngine.js';
```

#### 解決方法

**HTML でのモジュール読み込み**
```html
<!-- 正しい方法 -->
<script type="module" src="src/main.js"></script>

<!-- 間違った方法 -->
<script src="src/main.js"></script>
```

**拡張子の明記**
```javascript
// 正しい - .js 拡張子必須
import { GameEngine } from './core/GameEngine.js';

// 間違い - 拡張子なし
import { GameEngine } from './core/GameEngine';
```

**相対パス/絶対パスの確認**
```javascript
// 相対パス（推奨）
import { GameEngine } from './core/GameEngine.js';
import { Bubble } from '../bubbles/Bubble.js';

// ルートからの絶対パス
import { GameEngine } from '/src/core/GameEngine.js';
```

## ゲーム実行時の問題

### 1. 画面が真っ白になる

#### 症状
- ブラウザでアクセスしても何も表示されない
- コンソールにエラーが表示される

#### 診断手順

**1. ブラウザ開発者ツールの確認**
```javascript
// F12 または右クリック > 検証
// Console タブでエラーメッセージを確認

// よくあるエラー例:
// "Failed to load resource: net::ERR_FILE_NOT_FOUND"
// "Uncaught TypeError: Cannot read property 'getContext' of null"
// "Uncaught ReferenceError: GameEngine is not defined"
```

**2. HTML 構造の確認**
```html
<!-- 必須要素が存在するか確認 -->
<canvas id="gameCanvas" width="800" height="600"></canvas>
<script type="module" src="src/main.js"></script>
```

**3. JavaScript 初期化の確認**
```javascript
// main.js での初期化確認
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    try {
        const gameEngine = new GameEngine(canvas);
        gameEngine.start();
    } catch (error) {
        console.error('GameEngine initialization failed:', error);
    }
});
```

#### 解決方法

**Canvas 要素の問題**
```javascript
// Canvas が見つからない場合
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    // 動的に Canvas を作成
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
}
```

**モジュール読み込みエラー**
```javascript
// エラーハンドリング付きの初期化
async function initializeGame() {
    try {
        const { GameEngine } = await import('./src/core/GameEngine.js');
        const canvas = document.getElementById('gameCanvas');
        
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        const gameEngine = new GameEngine(canvas);
        await gameEngine.initialize();
        gameEngine.start();
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Game initialization failed:', error);
        
        // エラー表示
        document.body.innerHTML = `
            <div style="color: red; padding: 20px;">
                <h2>ゲーム初期化エラー</h2>
                <p>${error.message}</p>
                <p>ブラウザの開発者ツールで詳細を確認してください。</p>
            </div>
        `;
    }
}

// DOM 読み込み完了後に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
```

### 2. バブルが表示されない

#### 症状
- ゲーム画面は表示されるがバブルが生成されない
- バブル関連のエラーがコンソールに表示される

#### 診断手順

**1. BubbleManager の初期化確認**
```javascript
// GameScene での BubbleManager 確認
console.log('BubbleManager:', this.bubbleManager);
console.log('Bubbles count:', this.bubbleManager?.bubbles?.length);
```

**2. 設定値の確認**
```javascript
// バブル生成設定の確認
const configManager = getConfigurationManager();
const maxBubbles = configManager.get('performance', 'optimization.maxBubbles');
const spawnRate = configManager.get('game', 'difficulty.normal.spawnRate');

console.log('Max bubbles:', maxBubbles);
console.log('Spawn rate:', spawnRate);
```

**3. Canvas 描画領域の確認**
```javascript
// Canvas サイズとバブル位置の確認
console.log('Canvas size:', canvas.width, canvas.height);
console.log('Bubble positions:', bubbles.map(b => b.position));
```

#### 解決方法

**設定値の修正**
```javascript
// 最大バブル数が0になっている場合
const configManager = getConfigurationManager();
configManager.set('performance', 'optimization.maxBubbles', 20);
configManager.set('game', 'difficulty.normal.spawnRate', 1.5);
```

**BubbleManager の手動初期化**
```javascript
// GameScene.js
initialize() {
    if (!this.bubbleManager) {
        this.bubbleManager = new BubbleManager(this.gameEngine);
        console.log('BubbleManager manually initialized');
    }
    
    // バブル生成開始
    this.bubbleManager.startSpawning();
}
```

**デバッグ用のバブル強制生成**
```javascript
// 開発者コンソールでの手動バブル生成
if (window.gameEngine && window.gameEngine.sceneManager.currentScene.bubbleManager) {
    const bm = window.gameEngine.sceneManager.currentScene.bubbleManager;
    bm.spawnBubble('normal', { x: 400, y: 300 });
    console.log('Debug bubble spawned');
}
```

### 3. スコアが更新されない

#### 症状
- バブルをクリックしてもスコアが増加しない
- スコア表示が0のまま

#### 診断手順

**1. スコア計算の確認**
```javascript
// ScoreManager の状態確認
console.log('ScoreManager:', scoreManager);
console.log('Current score:', scoreManager.getScore());

// スコア計算テスト
const testScore = scoreManager.calculateScore('normal', 0.8, 1);
console.log('Test score calculation:', testScore);
```

**2. イベント処理の確認**
```javascript
// バブルクリックイベントの確認
document.addEventListener('click', (e) => {
    console.log('Click detected:', e.target);
    console.log('Click position:', e.clientX, e.clientY);
});
```

#### 解決方法

**ScoreManager の初期化**
```javascript
// GameScene での ScoreManager 確保
initialize() {
    if (!this.scoreManager) {
        this.scoreManager = new ScoreManager(this.gameEngine);
    }
    
    // UI との連携
    this.scoreManager.on('scoreChanged', (newScore) => {
        this.updateScoreDisplay(newScore);
    });
}
```

**UI 更新の修正**
```javascript
// スコア表示の更新確認
updateScoreDisplay(score) {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
        scoreElement.textContent = score.toString();
    } else {
        console.warn('Score display element not found');
    }
}
```

## テスト関連の問題

### 1. Jest テストが実行されない

#### 症状
```bash
npm test
# No tests found, exiting with code 1
```

#### 解決方法

**テストファイルの命名確認**
```bash
# Jest が認識するファイル名パターン
# *.test.js
# *.spec.js
# __tests__/ ディレクトリ内の .js ファイル

# 例:
src/core/GameEngine.test.js
src/managers/BubbleManager.spec.js
__tests__/integration/game-flow.test.js
```

**package.json の設定確認**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/test/setup.js"],
    "moduleNameMapping": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

**Jest 設定ファイル (jest.config.js)**
```javascript
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    testMatch: [
        '<rootDir>/src/**/*.test.js',
        '<rootDir>/test/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/main.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html']
};
```

### 2. モック関連のエラー

#### 症状
```javascript
// TypeError: jest.fn() is not a function
// ReferenceError: jest is not defined
```

#### 解決方法

**setup.js ファイルの作成**
```javascript
// test/setup.js
import 'jest-environment-jsdom';

// Canvas API のモック
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillText: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn()
}));

// LocalStorage のモック
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    writable: true
});

// Performance API のモック
Object.defineProperty(window, 'performance', {
    value: {
        now: jest.fn(() => Date.now())
    },
    writable: true
});
```

**個別テストでのモック**
```javascript
// BubbleManager.test.js
describe('BubbleManager', () => {
    let bubbleManager;
    let mockGameEngine;
    
    beforeEach(() => {
        // GameEngine のモック
        mockGameEngine = {
            canvas: { width: 800, height: 600 },
            audioManager: {
                playSound: jest.fn()
            },
            performanceOptimizer: {
                monitor: jest.fn()
            }
        };
        
        bubbleManager = new BubbleManager(mockGameEngine);
    });
    
    test('バブル生成が正常に動作する', () => {
        const bubble = bubbleManager.spawnBubble('normal', { x: 100, y: 100 });
        
        expect(bubble).toBeDefined();
        expect(bubble.type).toBe('normal');
        expect(mockGameEngine.audioManager.playSound).toHaveBeenCalledWith('bubble_spawn');
    });
});
```

### 3. Playwright E2E テストの問題

#### 症状
```bash
npx playwright test
# Error: browserType.launch: Executable doesn't exist
```

#### 解決方法

**ブラウザのインストール**
```bash
# ブラウザインストール
npx playwright install

# 依存関係も含めてインストール
npx playwright install --with-deps

# 特定のブラウザのみ
npx playwright install chromium
```

**Playwright 設定 (playwright.config.js)**
```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './test/e2e',
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    use: {
        baseURL: 'http://localhost:8000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        }
    ],
    webServer: {
        command: 'python -m http.server 8000',
        port: 8000,
        reuseExistingServer: !process.env.CI
    }
});
```

## パフォーマンスの問題

### 1. フレームレートが低い

#### 症状
- ゲームが重く、スムーズに動作しない
- FPS が 30 未満

#### 診断手順

**パフォーマンス測定**
```javascript
// FPS 測定
class FPSCounter {
    constructor() {
        this.frames = 0;
        this.lastTime = performance.now();
        this.fps = 0;
    }
    
    update() {
        this.frames++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            this.frames = 0;
            this.lastTime = currentTime;
            
            console.log(`FPS: ${this.fps}`);
        }
    }
}

// GameEngine に組み込み
const fpsCounter = new FPSCounter();
// gameLoop 内で fpsCounter.update() を呼び出し
```

**プロファイリング**
```javascript
// Chrome DevTools Performance タブを使用
// または、コード内での測定
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name}: ${end - start}ms`);
    return result;
}

// 使用例
measurePerformance('Bubble Update', () => {
    bubbleManager.update(deltaTime);
});
```

#### 解決方法

**描画最適化**
```javascript
// オフスクリーンキャンバスの使用
class OptimizedRenderer {
    constructor() {
        this.offscreenCanvas = new OffscreenCanvas(800, 600);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.imageCache = new Map();
    }
    
    render(ctx) {
        // オフスクリーンで描画
        this.offscreenCtx.clearRect(0, 0, 800, 600);
        this.renderGameObjects(this.offscreenCtx);
        
        // メインキャンバスに転送
        ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
}
```

**バブル数の制限**
```javascript
// 動的バブル数調整
class AdaptivePerformanceManager {
    constructor() {
        this.targetFPS = 60;
        this.currentFPS = 60;
        this.maxBubbles = 20;
    }
    
    adjustPerformance(fps) {
        this.currentFPS = fps;
        
        if (fps < this.targetFPS * 0.8) {
            // パフォーマンス低下時の対策
            this.maxBubbles = Math.max(5, this.maxBubbles - 2);
            this.reduceEffects();
        } else if (fps > this.targetFPS * 0.95) {
            // パフォーマンス良好時の最適化
            this.maxBubbles = Math.min(30, this.maxBubbles + 1);
        }
    }
    
    reduceEffects() {
        const effectsConfig = getEffectsConfig();
        effectsConfig.setParticleQuality(0.5);
        effectsConfig.setMaxParticleCount(200);
    }
}
```

### 2. メモリリーク

#### 症状
- 長時間プレイ後にゲームが重くなる
- ブラウザのメモリ使用量が増加し続ける

#### 診断手順

**メモリ使用量の監視**
```javascript
// メモリ使用量の測定
class MemoryMonitor {
    monitor() {
        if ('memory' in performance) {
            const memory = performance.memory;
            console.log({
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            });
        }
    }
}

// 定期的に監視
setInterval(() => {
    memoryMonitor.monitor();
}, 5000);
```

**リーク源の特定**
```javascript
// オブジェクト数の追跡
class ObjectTracker {
    constructor() {
        this.counts = new Map();
    }
    
    track(type) {
        const count = this.counts.get(type) || 0;
        this.counts.set(type, count + 1);
    }
    
    untrack(type) {
        const count = this.counts.get(type) || 0;
        this.counts.set(type, Math.max(0, count - 1));
    }
    
    report() {
        console.log('Object counts:', Object.fromEntries(this.counts));
    }
}
```

#### 解決方法

**イベントリスナーの適切な管理**
```javascript
class ComponentWithCleanup {
    constructor() {
        this.eventListeners = [];
        this.timers = [];
    }
    
    addEventListeners() {
        const handler = this.handleClick.bind(this);
        document.addEventListener('click', handler);
        
        // クリーンアップ用に記録
        this.eventListeners.push({
            element: document,
            event: 'click',
            handler: handler
        });
    }
    
    cleanup() {
        // イベントリスナー削除
        for (const listener of this.eventListeners) {
            listener.element.removeEventListener(listener.event, listener.handler);
        }
        this.eventListeners = [];
        
        // タイマー削除
        for (const timer of this.timers) {
            clearInterval(timer);
            clearTimeout(timer);
        }
        this.timers = [];
    }
}
```

**オブジェクトプールの活用**
```javascript
// バブルオブジェクトプール
class BubblePool {
    constructor(size = 50) {
        this.pool = [];
        this.used = new Set();
        
        // 初期バブル生成
        for (let i = 0; i < size; i++) {
            this.pool.push(new Bubble());
        }
    }
    
    acquire() {
        if (this.pool.length > 0) {
            const bubble = this.pool.pop();
            this.used.add(bubble);
            return bubble;
        }
        return new Bubble(); // プールが空の場合は新規作成
    }
    
    release(bubble) {
        if (this.used.has(bubble)) {
            this.used.delete(bubble);
            bubble.reset(); // 状態リセット
            this.pool.push(bubble);
        }
    }
}
```

## 設定管理の問題

### 1. 設定値が反映されない

#### 症状
- 設定画面で変更しても実際のゲームに反映されない
- 設定値が初期値に戻ってしまう

#### 診断手順

**設定値の確認**
```javascript
// ConfigurationManager の状態確認
const configManager = getConfigurationManager();

// 設定値の取得テスト
console.log('Master volume:', configManager.get('audio', 'volumes.master'));
console.log('Max bubbles:', configManager.get('performance', 'optimization.maxBubbles'));

// キャッシュ状態の確認
console.log('Cache stats:', configManager.getCacheStats());
```

**ウォッチャーの確認**
```javascript
// 設定監視のテスト
const watchId = configManager.watch('audio', 'volumes.master', (newValue, oldValue) => {
    console.log(`Volume changed: ${oldValue} -> ${newValue}`);
});

// 設定変更テスト
configManager.set('audio', 'volumes.master', 0.5);
```

#### 解決方法

**キャッシュクリア**
```javascript
// キャッシュが古い場合
const configManager = getConfigurationManager();
configManager.clearCache();

// 特定カテゴリのキャッシュクリア
configManager.clearCache('audio');
```

**設定の手動適用**
```javascript
// AudioManager への設定適用確認
const audioConfig = getAudioConfig();
const audioManager = gameEngine.audioManager;

// 設定値を強制適用
audioConfig.applyToAudioManager(audioManager);
```

### 2. 設定ファイルの破損

#### 症状
```javascript
// SyntaxError: Unexpected token in JSON
// TypeError: Cannot read property of undefined
```

#### 解決方法

**設定検証とリセット**
```javascript
// 設定の検証
class ConfigValidator {
    static validateGameConfig(config) {
        const required = ['scoring', 'stages', 'items', 'bubbles'];
        
        for (const field of required) {
            if (!(field in config)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // 数値フィールドの検証
        if (typeof config.scoring.baseScores.normal !== 'number') {
            throw new Error('Invalid base score for normal bubble');
        }
        
        return true;
    }
    
    static repairConfig(config, defaultConfig) {
        const repaired = { ...defaultConfig };
        
        // 有効な値のみマージ
        Object.keys(config).forEach(key => {
            if (config[key] != null && typeof config[key] === typeof defaultConfig[key]) {
                repaired[key] = config[key];
            }
        });
        
        return repaired;
    }
}
```

**自動復旧システム**
```javascript
// ConfigurationManager での自動復旧
class ConfigurationManager {
    getConfig(category) {
        try {
            let config = this.configs.get(category);
            
            if (!config) {
                config = this.loadConfig(category);
                this.configs.set(category, config);
            }
            
            // 設定検証
            this.validateConfig(category, config);
            return config;
            
        } catch (error) {
            console.warn(`Config validation failed for ${category}, using defaults:`, error);
            
            // デフォルト設定で復旧
            const defaultConfig = this.createDefaultConfig(category);
            this.configs.set(category, defaultConfig);
            
            return defaultConfig;
        }
    }
}
```

## Git・バージョン管理の問題

### 1. マージコンフリクト

#### 症状
```bash
git merge master
# Auto-merging src/config/GameConfig.js
# CONFLICT (content): Merge conflict in src/config/GameConfig.js
```

#### 解決方法

**マージコンフリクトの解決**
```bash
# 1. コンフリクトファイルの確認
git status

# 2. 手動でコンフリクト解決
# ファイルエディタでコンフリクトマーカーを編集
# <<<<<<< HEAD
# =======
# >>>>>>> master

# 3. 解決後にマーク
git add src/config/GameConfig.js

# 4. マージコミット作成
git commit -m "resolve merge conflict in GameConfig.js"
```

**マージツールの使用**
```bash
# VS Code をマージツールとして使用
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# マージツール起動
git mergetool
```

### 2. コミット取り消し

#### 症状
- 間違った内容をコミットしてしまった
- コミットメッセージが間違っている

#### 解決方法

**直前のコミット修正**
```bash
# コミットメッセージの修正
git commit --amend -m "正しいコミットメッセージ"

# ファイル追加してコミット修正
git add forgotten-file.js
git commit --amend --no-edit
```

**コミット取り消し**
```bash
# 作業内容を保持してコミット取り消し
git reset --soft HEAD~1

# 作業内容も含めて完全に取り消し（注意）
git reset --hard HEAD~1

# 特定のファイルのみ取り消し
git reset HEAD~1 -- src/config/GameConfig.js
```

**プッシュ済みコミットの修正**
```bash
# リバートコミット作成（推奨）
git revert HEAD

# 強制プッシュ（注意：他の開発者に影響）
git reset --hard HEAD~1
git push --force-with-lease origin feature-branch
```

## ブラウザ固有の問題

### 1. Safari での問題

#### 症状
- Safari でゲームが動作しない
- オーディオが再生されない

#### 解決方法

**オーディオの問題**
```javascript
// Safari のオーディオポリシー対応
class SafariAudioManager extends AudioManager {
    constructor() {
        super();
        this.audioContext = null;
        this.unlocked = false;
    }
    
    async initialize() {
        // ユーザーインタラクション後にオーディオを有効化
        document.addEventListener('touchend', this.unlock.bind(this), { once: true });
        document.addEventListener('click', this.unlock.bind(this), { once: true });
    }
    
    async unlock() {
        if (this.unlocked) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 無音を再生してオーディオを有効化
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            
            this.unlocked = true;
            console.log('Audio unlocked for Safari');
        } catch (error) {
            console.warn('Failed to unlock audio:', error);
        }
    }
}
```

**Canvas のちらつき対応**
```javascript
// Safari でのスムーズなアニメーション
class SafariOptimizedRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Safari 最適化
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    render() {
        // Safari でのクリア最適化
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        // 描画処理
        this.renderGameObjects();
    }
}
```

### 2. Firefox での問題

#### 症状
- Firefox でパフォーマンスが低い
- 一部の CSS が効かない

#### 解決方法

**Firefox 最適化**
```javascript
// Firefox 検出と最適化
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

if (isFirefox) {
    // Firefox 向け最適化
    const performanceConfig = getPerformanceConfig();
    performanceConfig.setPerformanceLevel('medium');
    
    // パーティクル数を制限
    const effectsConfig = getEffectsConfig();
    effectsConfig.setMaxParticleCount(300);
}
```

**CSS の互換性対応**
```css
/* Firefox 向けプレフィックス */
.game-canvas {
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
}

/* Firefox でのスクロールバー非表示 */
.scrollable-content {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.scrollable-content::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}
```

## デプロイ・本番環境の問題

### 1. 本番環境でリソースが読み込めない

#### 症状
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```

#### 解決方法

**相対パスの確認**
```javascript
// 本番環境用のパス設定
const getAssetPath = (path) => {
    const basePath = process.env.NODE_ENV === 'production' ? '/awaputi' : '';
    return `${basePath}/${path}`;
};

// 使用例
const imagePath = getAssetPath('assets/images/bubble.png');
```

**HTTPS 対応**
```javascript
// 混在コンテンツエラーの回避
const getSecureUrl = (url) => {
    if (location.protocol === 'https:' && url.startsWith('http:')) {
        return url.replace('http:', 'https:');
    }
    return url;
};
```

### 2. キャッシュ問題

#### 症状
- 更新した内容が反映されない
- 古いバージョンのファイルが使用される

#### 解決方法

**バージョン管理**
```javascript
// バージョン番号をファイル名に含める
const VERSION = '1.2.0';
const getVersionedPath = (path) => {
    return `${path}?v=${VERSION}`;
};

// HTML での使用
// <script src="src/main.js?v=1.2.0"></script>
```

**キャッシュ戦略の実装**
```javascript
// Service Worker でのキャッシュ管理
const CACHE_NAME = 'awaputi-v1.2.0';
const urlsToCache = [
    '/',
    '/src/main.js',
    '/src/core/GameEngine.js',
    '/assets/images/',
    '/assets/audio/'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュがあれば返す
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
```

## 緊急時対応

### システム全体のリカバリー

```javascript
// 緊急時のセーフモード
class EmergencyRecovery {
    static enterSafeMode() {
        console.warn('Entering safe mode due to critical errors');
        
        // 1. すべてのアニメーションを停止
        if (window.gameEngine) {
            window.gameEngine.stop();
        }
        
        // 2. エラー情報を収集
        const errorInfo = this.collectErrorInfo();
        
        // 3. ローカルストレージをクリア
        this.clearLocalStorage();
        
        // 4. ユーザーに通知
        this.showRecoveryMessage(errorInfo);
        
        // 5. 自動リロード（オプション）
        setTimeout(() => {
            if (confirm('ページを再読み込みしますか？')) {
                location.reload();
            }
        }, 5000);
    }
    
    static collectErrorInfo() {
        return {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: location.href,
            errors: JSON.parse(localStorage.getItem('errorLogs') || '[]').slice(-5),
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
            } : null
        };
    }
    
    static clearLocalStorage() {
        const keysToKeep = ['playerName', 'highScores'];
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!keysToKeep.includes(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    static showRecoveryMessage(errorInfo) {
        const message = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); color: white; padding: 20px; 
                        font-family: Arial, sans-serif; z-index: 10000;">
                <h2>🚨 緊急モード</h2>
                <p>ゲームでエラーが発生しました。データをリセットして復旧を試みています。</p>
                <details>
                    <summary>エラー詳細</summary>
                    <pre>${JSON.stringify(errorInfo, null, 2)}</pre>
                </details>
                <button onclick="location.reload()">ページを再読み込み</button>
                <button onclick="this.parentElement.remove()">継続（非推奨）</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', message);
    }
}

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // 致命的なエラーの場合はセーフモード
    if (event.error.name === 'TypeError' && event.error.message.includes('Cannot read property')) {
        EmergencyRecovery.enterSafeMode();
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Promise rejection もログに記録
    const errorLog = {
        type: 'unhandledrejection',
        reason: event.reason.toString(),
        timestamp: new Date().toISOString()
    };
    
    const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    logs.push(errorLog);
    localStorage.setItem('errorLogs', JSON.stringify(logs.slice(-20)));
});
```

## さらなるサポート

### 1. デバッグツールの活用

```javascript
// 開発者向けデバッグコンソール
class DebugConsole {
    static showGameState() {
        if (!window.gameEngine) return;
        
        const state = {
            scene: window.gameEngine.sceneManager.currentScene.constructor.name,
            bubbles: window.gameEngine.sceneManager.currentScene.bubbleManager?.bubbles.length || 0,
            score: window.gameEngine.sceneManager.currentScene.scoreManager?.getScore() || 0,
            performance: window.gameEngine.performanceOptimizer?.getStats() || {},
            config: {
                maxBubbles: getConfigurationManager().get('performance', 'optimization.maxBubbles'),
                masterVolume: getConfigurationManager().get('audio', 'volumes.master')
            }
        };
        
        console.table(state);
    }
    
    static spawnTestBubbles(count = 5) {
        const bubbleManager = window.gameEngine?.sceneManager?.currentScene?.bubbleManager;
        if (!bubbleManager) return;
        
        for (let i = 0; i < count; i++) {
            bubbleManager.spawnBubble('normal', {
                x: Math.random() * 800,
                y: Math.random() * 600
            });
        }
        
        console.log(`${count} test bubbles spawned`);
    }
    
    static resetGame() {
        if (window.gameEngine) {
            window.gameEngine.sceneManager.switchTo('mainMenu');
            console.log('Game reset to main menu');
        }
    }
}

// ブラウザコンソールでグローバルに利用可能にする
window.debug = DebugConsole;

// 使用例:
// debug.showGameState()
// debug.spawnTestBubbles(10)
// debug.resetGame()
```

### 2. 問題報告テンプレート

```markdown
## バグ報告テンプレート

### 環境情報
- OS: [Windows 10 / macOS 12.0 / Ubuntu 20.04]
- ブラウザ: [Chrome 95 / Firefox 91 / Safari 15]
- ゲームバージョン: [v1.2.0]

### 問題の詳細
**症状:**
[問題の簡潔な説明]

**再現手順:**
1. [手順1]
2. [手順2]
3. [手順3]

**期待される動作:**
[本来どうなるべきか]

**実際の動作:**
[実際に何が起こったか]

### コンソールエラー
```javascript
[ブラウザの開発者ツールのコンソールエラーをここに貼り付け]
```

### スクリーンショット
[可能であれば問題を示すスクリーンショットを添付]

### 追加情報
[その他の関連情報]
```

---

このトラブルシューティングガイドを参考に、問題を迅速に解決してください。解決できない問題がある場合は、GitHub Issues で報告するか、より詳細な調査を行ってください。