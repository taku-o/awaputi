import { GameEngine } from './core/GameEngine.js';
import { getBrowserCompatibility } from './utils/BrowserCompatibility.js';
import { getErrorHandler } from './utils/ErrorHandler.js';
import './styles/accessibility.css';

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
 * デバッグログ機能
 */
function createDebugLogger() {
    const logs = [];
    
    return {
        log: (message, data = null) => {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = { timestamp, message, data };
            logs.push(logEntry);
            console.log(`[DEBUG ${timestamp}] ${message}`, data);
            
            // DOM にログを表示（デバッグ用）
            const logElement = document.getElementById('debug-log');
            if (logElement) {
                logElement.innerHTML += `<div>[${timestamp}] ${message}</div>`;
                logElement.scrollTop = logElement.scrollHeight;
            }
        },
        getLogs: () => logs,
        showLogs: () => {
            // デバッグモード時のみ表示
            if (localStorage.getItem('debug') !== 'true') return;
            
            // デバッグログを画面に表示する要素を作成
            let logElement = document.getElementById('debug-log');
            if (!logElement) {
                logElement = document.createElement('div');
                logElement.id = 'debug-log';
                logElement.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 400px;
                    height: 300px;
                    background: rgba(0,0,0,0.9);
                    color: #00ff00;
                    font-family: monospace;
                    font-size: 10px;
                    padding: 10px;
                    overflow-y: auto;
                    z-index: 10000;
                    border: 1px solid #00ff00;
                    border-radius: 5px;
                `;
                document.body.appendChild(logElement);
            }
            
            logElement.innerHTML = logs.map(log => 
                `<div>[${log.timestamp}] ${log.message}</div>`
            ).join('');
            logElement.scrollTop = logElement.scrollHeight;
        }
    };
}

const debugLogger = createDebugLogger();

/**
 * ゲーム初期化（非同期版）
 */
async function initGame() {
    const loadingManager = new LoadingManager();
    
    debugLogger.log('🚀 ゲーム初期化開始');
    debugLogger.showLogs();
    
    try {
        // ステップ1: ブラウザ互換性チェック
        debugLogger.log('📋 ステップ1: ブラウザ互換性チェック開始');
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        debugLogger.log('🔍 互換性レポート生成中...');
        const compatibilityReport = getBrowserCompatibility().generateCompatibilityReport();
        debugLogger.log('📊 互換性レポート', compatibilityReport);
        
        // 重要な機能が利用できない場合はエラー
        if (!compatibilityReport.features.canvas) {
            debugLogger.log('❌ Canvas APIサポートなし');
            const error = new Error('お使いのブラウザはCanvas APIに対応していません。モダンブラウザでお試しください。');
            getErrorHandler().handleError(error, 'CANVAS_ERROR', { feature: 'canvas', compatibility: compatibilityReport });
            throw error;
        }
        debugLogger.log('✅ Canvas API サポート確認');
        
        // Canvas要素を取得
        debugLogger.log('🎯 Canvas要素取得中...');
        const canvas = document.getElementById('gameCanvas');
        debugLogger.log('🎯 Canvas要素', canvas);
        
        if (!canvas) {
            debugLogger.log('❌ Canvas要素が見つかりません');
            const error = new Error('Canvas要素が見つかりません。');
            getErrorHandler().handleError(error, 'CANVAS_ERROR', { element: 'gameCanvas' });
            throw error;
        }
        debugLogger.log('✅ Canvas要素取得成功', { 
            width: canvas.width, 
            height: canvas.height,
            style: canvas.style.cssText 
        });
        
        // ステップ2: ゲームエンジン初期化
        debugLogger.log('⚙️ ステップ2: ゲームエンジン初期化開始');
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        debugLogger.log('🎮 GameEngine インスタンス作成中...');
        const gameEngine = new GameEngine(canvas);
        debugLogger.log('✅ GameEngine インスタンス作成成功', gameEngine);
        
        // ステップ3: リソース読み込み
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 音声リソースの初期化（非同期）
        if (compatibilityReport.features.webAudio) {
            try {
                await gameEngine.audioManager.initialize();
            } catch (error) {
                getErrorHandler().handleError(error, 'AUDIO_ERROR', { feature: 'webAudio' });
            }
        }
        
        // ステップ4: ゲーム開始準備
        debugLogger.log('🚀 ステップ4: ゲーム開始準備');
        loadingManager.nextStep();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // ゲーム開始
        debugLogger.log('🎮 ゲームエンジン開始中...');
        gameEngine.start();
        debugLogger.log('✅ ゲームエンジン開始成功');
        
        // デバッグ用：グローバルに公開
        window.gameEngine = gameEngine;
        debugLogger.log('🌍 グローバルに gameEngine を公開');
        
        // ローディング画面を非表示
        debugLogger.log('📱 ローディング画面非表示中...');
        loadingManager.hide();
        debugLogger.log('✅ ローディング画面非表示完了');
        
        // 互換性情報をコンソールに出力
        if (localStorage.getItem('debug') === 'true') {
            getBrowserCompatibility().logDebugInfo();
        }
        
        // 推奨事項があれば表示
        if (compatibilityReport.recommendations.length > 0) {
            console.info('推奨事項:', compatibilityReport.recommendations);
        }
        
        // 警告があれば表示
        if (compatibilityReport.warnings.length > 0) {
            console.warn('警告:', compatibilityReport.warnings);
        }
        
        debugLogger.log('🎉 ゲーム初期化完了');
        
    } catch (error) {
        debugLogger.log('💥 エラー発生', { 
            message: error.message, 
            stack: error.stack,
            name: error.name 
        });
        console.error('Game initialization failed:', error);
        loadingManager.showError(error.message || 'ゲームの初期化に失敗しました。');
    }
}

/**
 * エラーハンドリング
 */
function setupErrorHandling() {
    // ErrorHandlerは自動的にグローバルエラーハンドラーを設定するため、
    // ここでは追加の設定のみ行う
    
    // LoadingManagerのエラー表示を ErrorHandler と統合
    const originalShowError = LoadingManager.prototype.showError;
    LoadingManager.prototype.showError = function(message) {
        // ErrorHandlerにエラーを報告
        getErrorHandler().handleError(new Error(message), 'INITIALIZATION_ERROR', {
            context: 'LoadingManager',
            step: this.currentStep
        });
        
        // 元の処理を実行
        originalShowError.call(this, message);
    };
    
    console.log('Enhanced error handling setup completed');
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
    debugLogger.log('📱 アプリケーション初期化開始');
    
    debugLogger.log('🛡️ エラーハンドリング設定中...');
    setupErrorHandling();
    
    debugLogger.log('🔧 デバッグ機能設定中...');
    setupDebugFeatures();
    
    debugLogger.log('📊 パフォーマンス監視設定中...');
    setupPerformanceMonitoring();
    
    debugLogger.log('✅ アプリケーション設定完了');
    
    // ゲーム初期化
    initGame();
}

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}