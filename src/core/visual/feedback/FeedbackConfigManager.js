import { getErrorHandler } from '../../../utils/ErrorHandler.js';

/**
 * フィードバック設定管理クラス
 * 視覚フィードバックシステムの設定・初期化・データ管理を担当
 * Main Controller Pattern: VisualFeedbackManagerから設定管理機能を分離
 */
export class FeedbackConfigManager {
    /**
     * コンストラクター
     * @param {VisualFeedbackManager} mainController - メインコントローラー参照
     */
    constructor(mainController) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.userPreferences = mainController.userPreferences;
        this.feedbackElements = mainController.feedbackElements;
        this.gameEngine = mainController.gameEngine;
        this.audioAccessibilityManager = mainController.audioAccessibilityManager;
        
        console.log('FeedbackConfigManager initialized');
    }
    
    /**
     * ユーザー設定の読み込み
     * ローカルストレージから保存された設定を復元
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('visualFeedback_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // Map の復元
                if (preferences.colorPreferences) {
                    this.userPreferences.colorPreferences = new Map(preferences.colorPreferences);
                }
                if (preferences.customMappings) {
                    this.userPreferences.customMappings = new Map(preferences.customMappings);
                }
                
                // 設定を適用
                this.config.enabled = this.userPreferences.enabled;
                this.config.globalIntensity = this.userPreferences.globalIntensity;
                
                console.log('Visual feedback preferences loaded successfully');
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'CONFIG_LOAD_ERROR', {
                operation: 'loadUserPreferences',
                component: 'FeedbackConfigManager'
            });
            console.warn('Failed to load visual feedback preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     * 現在の設定をローカルストレージに保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                colorPreferences: Array.from(this.userPreferences.colorPreferences.entries()),
                customMappings: Array.from(this.userPreferences.customMappings.entries())
            };
            
            localStorage.setItem('visualFeedback_preferences', 
                JSON.stringify(preferences));
                
            console.log('Visual feedback preferences saved successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'CONFIG_SAVE_ERROR', {
                operation: 'saveUserPreferences',
                component: 'FeedbackConfigManager'
            });
            console.warn('Failed to save visual feedback preferences:', error);
        }
    }
    
    /**
     * フィードバック要素の作成
     * DOM要素の生成と初期設定
     */
    createFeedbackElements() {
        try {
            // メインフィードバックコンテナ
            this.feedbackContainer = document.createElement('div');
            this.feedbackContainer.id = 'visual-feedback-container';
            this.feedbackContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 9999;
                overflow: hidden;
            `;
            document.body.appendChild(this.feedbackContainer);
            
            // メインコントローラーに参照を設定
            this.mainController.feedbackContainer = this.feedbackContainer;
            
            // 画面端フィードバック要素
            if (this.config.positioning.screenEdges) {
                this.createEdgeFeedbackElements();
            }
            
            // ゲームエリアフィードバック
            if (this.config.positioning.gameArea) {
                this.createGameAreaFeedback();
            }
            
            // オーディオ視覚化キャンバス
            if (this.userPreferences.audioVisualization) {
                this.createVisualizationCanvas();
            }
            
            console.log('Feedback elements created successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ELEMENT_CREATION_ERROR', {
                operation: 'createFeedbackElements',
                component: 'FeedbackConfigManager'
            });
            console.error('Failed to create feedback elements:', error);
        }
    }
    
    /**
     * 画面端フィードバック要素の作成
     */
    createEdgeFeedbackElements() {
        const edges = ['top', 'bottom', 'left', 'right'];
        
        edges.forEach(edge => {
            const element = document.createElement('div');
            element.className = `feedback-edge feedback-edge-${edge}`;
            element.style.cssText = this.getEdgeStyles(edge);
            
            this.feedbackContainer.appendChild(element);
            this.feedbackElements.set(`edge-${edge}`, element);
        });
    }
    
    /**
     * エッジスタイルの取得
     */
    getEdgeStyles(edge) {
        const baseStyles = `
            position: absolute;
            background: transparent;
            opacity: 0;
            transition: opacity 0.1s ease;
        `;
        
        switch (edge) {
            case 'top':
                return baseStyles + `
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                `;
            case 'bottom':
                return baseStyles + `
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                `;
            case 'left':
                return baseStyles + `
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 5px;
                `;
            case 'right':
                return baseStyles + `
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 5px;
                `;
            default:
                return baseStyles;
        }
    }
    
    /**
     * ゲームエリアフィードバックの作成
     */
    createGameAreaFeedback() {
        const gameCanvas = document.querySelector('#game-canvas, canvas.game-canvas');
        if (!gameCanvas) {
            console.warn('Game canvas not found for area feedback');
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'feedback-game-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            opacity: 0;
            border-radius: 8px;
            transition: all 0.2s ease;
        `;
        
        // ゲームキャンバスの親要素に追加
        const gameContainer = gameCanvas.parentElement;
        if (gameContainer && gameContainer.style.position !== 'relative') {
            gameContainer.style.position = 'relative';
        }
        
        if (gameContainer) {
            gameContainer.appendChild(overlay);
            this.feedbackElements.set('game-area', overlay);
        }
    }
    
    /**
     * 視覚化キャンバスの作成
     */
    createVisualizationCanvas() {
        this.visualCanvas = document.createElement('canvas');
        this.visualCanvas.id = 'audio-visualization-canvas';
        this.visualCanvas.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 100px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            opacity: 0.8;
            z-index: 10000;
        `;
        
        this.visualCanvas.width = 200;
        this.visualCanvas.height = 100;
        this.canvasContext = this.visualCanvas.getContext('2d');
        
        // メインコントローラーに参照を設定
        this.mainController.visualCanvas = this.visualCanvas;
        this.mainController.canvasContext = this.canvasContext;
        
        document.body.appendChild(this.visualCanvas);
    }
    
    /**
     * オーディオ分析の設定
     * Web Audio API の初期化とゲームオーディオとの接続
     */
    setupAudioAnalysis() {
        try {
            // Web Audio API の初期化
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            
            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // メインコントローラーに参照を設定
            this.mainController.audioContext = this.audioContext;
            this.mainController.analyser = this.analyser;
            this.mainController.dataArray = this.dataArray;
            
            // ゲームオーディオとの接続
            this.connectToGameAudio();
            
            console.log('Audio analysis setup completed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_SETUP_ERROR', {
                operation: 'setupAudioAnalysis',
                component: 'FeedbackConfigManager'
            });
            console.warn('Audio analysis setup failed:', error);
        }
    }
    
    /**
     * ゲームオーディオとの接続
     */
    connectToGameAudio() {
        try {
            // AudioManager が存在する場合は接続
            if (this.gameEngine?.audioManager) {
                const audioManager = this.gameEngine.audioManager;
                
                // AudioManager からオーディオソースを取得
                if (audioManager.audioContext) {
                    // 既存のオーディオノードに接続
                    if (audioManager.audioContext.destination?.connect) {
                        audioManager.audioContext.destination.connect(this.analyser);
                        this.analyser.connect(this.audioContext.destination);
                        console.log('Connected to game audio successfully');
                    }
                }
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CONNECTION_ERROR', {
                operation: 'connectToGameAudio',
                component: 'FeedbackConfigManager'
            });
            console.warn('Failed to connect to game audio:', error);
        }
    }
    
    /**
     * 設定の更新
     * @param {Object} newConfig - 新しい設定オブジェクト
     */
    updateConfig(newConfig) {
        try {
            if (newConfig) {
                Object.assign(this.config, newConfig);
                this.saveUserPreferences();
                console.log('Configuration updated successfully');
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'CONFIG_UPDATE_ERROR', {
                operation: 'updateConfig',
                component: 'FeedbackConfigManager'
            });
            console.error('Failed to update configuration:', error);
        }
    }
    
    /**
     * グローバル強度の設定
     * @param {number} intensity - 強度値（0-2.0）
     */
    setGlobalIntensity(intensity) {
        const clampedIntensity = Math.max(0, Math.min(2.0, intensity));
        this.config.globalIntensity = clampedIntensity;
        this.userPreferences.globalIntensity = clampedIntensity;
        
        this.saveUserPreferences();
        console.log(`Global intensity set to: ${clampedIntensity}`);
    }
    
    /**
     * カスタムイベントマッピングの追加
     * @param {string} eventType - イベントタイプ
     * @param {Object} mapping - マッピング設定
     */
    addCustomEventMapping(eventType, mapping) {
        if (eventType && mapping) {
            this.userPreferences.customMappings.set(eventType, mapping);
            this.saveUserPreferences();
            console.log(`Custom mapping added for ${eventType}:`, mapping);
        }
    }
    
    /**
     * 設定のリセット
     */
    resetToDefaults() {
        try {
            // デフォルト設定の復元
            Object.assign(this.userPreferences, {
                enabled: false,
                globalIntensity: 0.8,
                preferredPatterns: ['flash', 'glow', 'pulse'],
                colorPreferences: new Map(),
                reducedMotion: false,
                audioVisualization: true,
                gameEventFeedback: true,
                customMappings: new Map()
            });
            
            this.config.enabled = false;
            this.config.globalIntensity = 0.8;
            
            this.saveUserPreferences();
            console.log('Configuration reset to defaults');
        } catch (error) {
            getErrorHandler().handleError(error, 'CONFIG_RESET_ERROR', {
                operation: 'resetToDefaults',
                component: 'FeedbackConfigManager'
            });
            console.error('Failed to reset configuration:', error);
        }
    }
    
    /**
     * 現在の設定状態の取得
     * @returns {Object} 設定状態オブジェクト
     */
    getConfigurationState() {
        return {
            config: { ...this.config },
            userPreferences: {
                ...this.userPreferences,
                colorPreferences: Array.from(this.userPreferences.colorPreferences.entries()),
                customMappings: Array.from(this.userPreferences.customMappings.entries())
            },
            elements: {
                containerCreated: !!this.feedbackContainer,
                visualizationCanvasCreated: !!this.visualCanvas,
                edgeElementsCount: Array.from(this.feedbackElements.keys())
                    .filter(key => key.startsWith('edge-')).length
            },
            audio: {
                contextInitialized: !!this.audioContext,
                analyserCreated: !!this.analyser
            }
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying FeedbackConfigManager...');
        
        // オーディオコンテキストのクリーンアップ
        if (this.audioContext) {
            this.audioContext.close?.();
        }
        
        // 最終設定保存
        this.saveUserPreferences();
        
        // 参照のクリア
        this.mainController = null;
        this.config = null;
        this.userPreferences = null;
        this.feedbackElements = null;
        this.gameEngine = null;
        this.audioAccessibilityManager = null;
        this.feedbackContainer = null;
        this.visualCanvas = null;
        this.canvasContext = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        console.log('FeedbackConfigManager destroyed');
    }
}