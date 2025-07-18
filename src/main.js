import { GameEngine } from './core/GameEngine.js';
import { browserCompatibility } from './utils/BrowserCompatibility.js';

/**
 * ローディング画面を管理
 */
class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingSteps = [
            'ブラウザ互換性チェック中...',
            'ゲームエンジン初期化中...',
            'リソース読み込み中...',
            'ゲーム開始準備中...'
        ];
        this.currentStep = 0;
    }
    
    updateLoadingText(text) {
        const loadingText = this.loadingScreen.querySelector('div > div:last-child');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }
    
    nextStep() {
        if (this.currentStep < this.loadingSteps.length) {
            this.updateLoadingText(this.loadingSteps[this.currentStep]);
            this.currentStep++;
        }
    }
    
    hide() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 300);
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>エラーが発生しました</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 10px;
                padding: 10px 20px;
                background: white;
                color: red;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">再読み込み</button>
        `;
        document.body.appendChild(errorDiv);
        this.hide();
    }
}

/**
 * ゲーム初期化（非同期版）
 */
async function initGame() {
    const loadingManager = new LoadingManager();
    
    try {
        // ステップ1: ブラウザ互換性チェック
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const compatibilityReport = browserCompatibility.generateCompatibilityReport();
        
        // 重要な機能が利用できない場合はエラー
        if (!compatibilityReport.features.canvas) {
            throw new Error('お使いのブラウザはCanvas APIに対応していません。モダンブラウザでお試しください。');
        }
        
        // Canvas要素を取得
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas要素が見つかりません。');
        }
        
        // ステップ2: ゲームエンジン初期化
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const gameEngine = new GameEngine(canvas);
        
        // ステップ3: リソース読み込み
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 音声リソースの初期化（非同期）
        if (compatibilityReport.features.webAudio) {
            try {
                await gameEngine.audioManager.initialize();
            } catch (error) {
                console.warn('Audio initialization failed:', error);
            }
        }
        
        // ステップ4: ゲーム開始準備
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // ゲーム開始
        gameEngine.start();
        
        // デバッグ用：グローバルに公開
        window.gameEngine = gameEngine;
        
        // ローディング画面を非表示
        loadingManager.hide();
        
        // 互換性情報をコンソールに出力
        if (localStorage.getItem('debug') === 'true') {
            browserCompatibility.logDebugInfo();
        }
        
        // 推奨事項があれば表示
        if (compatibilityReport.recommendations.length > 0) {
            console.info('推奨事項:', compatibilityReport.recommendations);
        }
        
        // 警告があれば表示
        if (compatibilityReport.warnings.length > 0) {
            console.warn('警告:', compatibilityReport.warnings);
        }
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        loadingManager.showError(error.message || 'ゲームの初期化に失敗しました。');
    }
}

/**
 * エラーハンドリング
 */
function setupErrorHandling() {
    // 未処理のエラーをキャッチ
    window.addEventListener('error', (event) => {
        console.error('Unhandled error:', event.error);
        
        // 重要なエラーの場合はユーザーに通知
        if (event.error && event.error.message) {
            const errorMessage = event.error.message;
            if (errorMessage.includes('Canvas') || 
                errorMessage.includes('WebGL') || 
                errorMessage.includes('AudioContext')) {
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `
                    <h3>技術的なエラーが発生しました</h3>
                    <p>${errorMessage}</p>
                    <p>ブラウザを更新するか、別のブラウザでお試しください。</p>
                    <button onclick="location.reload()" style="
                        margin-top: 10px;
                        padding: 10px 20px;
                        background: white;
                        color: red;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">再読み込み</button>
                `;
                document.body.appendChild(errorDiv);
            }
        }
    });
    
    // 未処理のPromise拒否をキャッチ
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });
}

/**
 * デバッグ機能の設定
 */
function setupDebugFeatures() {
    // URLパラメータでデバッグモードを有効化
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        localStorage.setItem('debug', 'true');
        console.log('Debug mode enabled');
    }
    
    // キーボードショートカットでデバッグ情報を表示
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
            event.preventDefault();
            const isDebug = localStorage.getItem('debug') === 'true';
            localStorage.setItem('debug', isDebug ? 'false' : 'true');
            console.log('Debug mode:', !isDebug ? 'enabled' : 'disabled');
            location.reload();
        }
    });
}

/**
 * パフォーマンス監視の設定
 */
function setupPerformanceMonitoring() {
    // ページ読み込み時間を測定
    window.addEventListener('load', () => {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        }
    });
    
    // メモリ使用量を定期的に監視（開発環境のみ）
    if (localStorage.getItem('debug') === 'true' && window.performance && window.performance.memory) {
        setInterval(() => {
            const memory = window.performance.memory;
            console.log('Memory usage:', {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            });
        }, 30000); // 30秒ごと
    }
}

/**
 * アプリケーション初期化
 */
function initApp() {
    setupErrorHandling();
    setupDebugFeatures();
    setupPerformanceMonitoring();
    
    // ゲーム初期化
    initGame();
}

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}