/**
 * TimingAdjustmentManager (Main Controller)
 * 時間的配慮管理システムの軽量オーケストレーター
 * Main Controller Patternによる軽量化実装
 */

import { TimingCalibrator } from './timing-adjustment/TimingCalibrator.js';''
import { TimingAdjustmentAlgorithms } from './timing-adjustment/TimingAdjustmentAlgorithms.js';''
import { TimingFeedbackSystem } from './timing-adjustment/TimingFeedbackSystem.js';

export class TimingAdjustmentManager {'
    '';
    constructor(gameEngine') {
        this.gameEngine = gameEngine;
        this.isInitialized = false;
        
        // 設定とプロファイル
        this.config = {
            // 基本設定
            enabled: true,'';
            defaultProfile: 'standard',
            autoAdjustment: true,
            adaptiveLearning: true,
            
            // 時間調整レベル
    }
    }
            adjustmentLevels: {' }'
                none: { multiplier: 1.0, name: '標準', description: '時間調整なし' },''
                minimal: { multiplier: 1.5, name: '軽微', description: '1.5倍の時間' },''
                moderate: { multiplier: 2.0, name: '中程度', description: '2倍の時間' },''
                significant: { multiplier: 3.0, name: '大幅', description: '3倍の時間' },''
                unlimited: { multiplier: Infinity, name: '無制限', description: '時間制限なし' }
            },
            
            // プロファイル別設定
            profiles: { standard: {''
                    name: '標準','';
                    description: '一般的な使用','';
                    adjustmentLevel: 'none',
                    timeoutExtensions: false,
                    pauseEnabled: true, }
                    customTimeouts: {},
                    preferences: { showTimeWarnings: true,
                        autoExtend: false,
                        gracePeriod: 5000 }
                    }
                },'
                motor: { ''
                    name: '運動機能配慮','';
                    description: '運動機能に制限がある方向け','';
                    adjustmentLevel: 'moderate',
                    timeoutExtensions: true,
                    pauseEnabled: true,
                    customTimeouts: {
                        bubbleLifetime: 2.0,
                        inputDelay: 1.5,
                        menuNavigation: 2.0 }
                    },
                    preferences: { showTimeWarnings: true,
                        autoExtend: true,
                        gracePeriod: 10000,
                        confirmExtensions: false }
                    }
                },'
                cognitive: { ''
                    name: '認知機能配慮','';
                    description: '認知機能に配慮が必要な方向け','';
                    adjustmentLevel: 'significant',
                    timeoutExtensions: true,
                    pauseEnabled: true,
                    customTimeouts: {
                        bubbleLifetime: 3.0,
                        inputDelay: 2.0,
                        menuNavigation: 3.0,
                        decisionTime: 2.5 }
                    },
                    preferences: { showTimeWarnings: true,
                        autoExtend: true,
                        gracePeriod: 15000,
                        confirmExtensions: false,
                        showProgress: true }
                    }
                },'
                senior: { ''
                    name: '高齢者向け','';
                    description: '高齢者の方に配慮したタイミング','';
                    adjustmentLevel: 'moderate',
                    timeoutExtensions: true,
                    pauseEnabled: true,
                    customTimeouts: {
                        bubbleLifetime: 2.5,
                        inputDelay: 1.8,
                        menuNavigation: 2.5,
                        readingTime: 2.0 }
                    },
                    preferences: { showTimeWarnings: true,
                        autoExtend: true,
                        gracePeriod: 12000,
                        confirmExtensions: true,
                        largeTimers: true }
                    }
                },'
                custom: { ''
                    name: 'カスタム','';
                    description: 'ユーザー定義設定','';
                    adjustmentLevel: 'moderate',
                    timeoutExtensions: true,
                    pauseEnabled: true, }
                    customTimeouts: {},
                    preferences: { showTimeWarnings: true,
                        autoExtend: false,
                        gracePeriod: 8000 }
                    }
                }
            }
        },
        
        // 状態管理
        this.state = { ''
            currentProfile: 'standard',
            isGlobalPaused: false,
            activeTimers: new Map(),
            pendingExtensions: new Map(),
            userInteractionData: {
                averageResponseTime: 1000,
                recentResponses: [],
                adaptationNeeded: false }
            },
            warningStates: new Map(),
        };
        
        // タイマー管理
        this.timers = { active: new Map(),
            paused: new Map(),
            extensions: new Map(),
            warnings: new Map() }
        };
        
        // 適応学習データ
        this.adaptiveLearning = { enabled: true,
            data: {
                userResponseTimes: [],
                difficultyLevels: [],
                errorRates: [],
                extensionRequests: 0,
                pauseFrequency: 0 }
            },
            thresholds: { slowResponse: 2000,
                fastResponse: 500,
                adaptationTrigger: 5,
                confidenceLevel: 0.8 }
            }
        },
        
        // イベントリスナー
        this.boundHandlers = { keydown: this.handleKeydown.bind(this),
            visibilitychange: this.handleVisibilityChange.bind(this),
            focus: this.handleFocusChange.bind(this),
            blur: this.handleFocusChange.bind(this) }
        };
        
        // サブコンポーネントの初期化（依存注入）
        this.calibrator = new TimingCalibrator(this);
        this.algorithms = new TimingAdjustmentAlgorithms(this);''
        this.feedback = new TimingFeedbackSystem(this');'
        '';
        console.log('[TimingAdjustmentManager] Main Controller initialized with sub-components');
        this.initialize();
    }
    
    /**
     * システムを初期化'
     */''
    async initialize()';
            console.log('TimingAdjustmentManager: 初期化開始'),
            
            // 設定の読み込み
            await this.loadConfiguration();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // システム設定の検出（キャリブレーターに委譲）
            this.calibrator.detectSystemPreferences();
            
            // 初期プロファイルの適用（アルゴリズムに委譲）
            this.algorithms.applyProfile(this.config.defaultProfile);
            
            // アクセシビリティマネージャーとの統合（キャリブレーターに委譲）
            if(this.gameEngine.accessibilityManager) {
                '';
                this.calibrator.integrateWithAccessibilityManager()';
            console.log('TimingAdjustmentManager: 初期化完了'),
            }'
            ' }'
        } catch (error) { ''
            console.error('TimingAdjustmentManager: 初期化エラー:', error);
            throw error; }
        }
    }
    
    /**
     * 設定を読み込み'
     */''
    async loadConfiguration()';
            const savedConfig = localStorage.getItem('timingAdjustmentConfig');
            if(savedConfig) {'
                const parsed = JSON.parse(savedConfig);'
            }'
                this.mergeConfig(parsed'); }
            }
            ';
            // ユーザープロファイルの読み込み
            const savedProfile = localStorage.getItem('timingAdjustmentProfile');''
            if (savedProfile') { this.state.currentProfile = savedProfile; }
            }
            ';
            // 適応学習データの読み込み
            const savedLearningData = localStorage.getItem('timingAdaptiveLearning');
            if(savedLearningData) {
                
            }'
                this.adaptiveLearning.data = { ...this.adaptiveLearning.data, ...JSON.parse(savedLearningData) };''
            } catch (error) { ''
            console.warn('TimingAdjustmentManager: 設定読み込みエラー:', error) }
        }
    }
    
    /**
     * 設定をマージ
     */
    mergeConfig(newConfig) {
        // 深い結合を実行
    }
        this.config = this.deepMerge(this.config, newConfig); }
    }
    
    /**
     * イベントリスナーを設定
     */''
    setupEventListeners()';
        document.addEventListener('keydown', this.boundHandlers.keydown');
        ';
        // ページ可視性変更
        document.addEventListener('visibilitychange', this.boundHandlers.visibilitychange');
        ';
        // フォーカス変更
        window.addEventListener('focus', this.boundHandlers.focus');''
        window.addEventListener('blur', this.boundHandlers.blur);
        ';
        // ゲームエンジンイベント
        if(this.gameEngine.eventEmitter') {'
            '';
            this.gameEngine.eventEmitter.on('gameStateChange', this.handleGameStateChange.bind(this)');''
            this.gameEngine.eventEmitter.on('userInteraction', this.trackUserInteraction.bind(this)');'
        }'
            this.gameEngine.eventEmitter.on('bubbleCreated', this.handleBubbleCreated.bind(this); }
        }
    }
    
    // ========== 公開API（サブコンポーネントに委譲） ==========
    
    /**
     * プロファイルを適用（アルゴリズムに委譲）
     */
    applyProfile(profileName) { return this.algorithms.applyProfile(profileName); }
    }
    
    /**
     * 現在のプロファイルを取得（アルゴリズムに委譲）
     */
    getCurrentProfile() { return this.algorithms.getCurrentProfile(); }
    }
    
    /**
     * 調整倍率を取得（アルゴリズムに委譲）
     */
    getAdjustmentMultiplier() { return this.algorithms.getAdjustmentMultiplier(); }
    }
    
    /**
     * タイマーを登録（アルゴリズムに委譲）
     */
    registerTimer(timerId, config) { return this.algorithms.registerTimer(timerId, config); }
    }
    
    /**
     * タイマーを削除（アルゴリズムに委譲）
     */
    unregisterTimer(timerId) { return this.algorithms.unregisterTimer(timerId); }
    }
    
    /**
     * タイマーを延長（アルゴリズムに委譲）
     */
    extendTimer(timerId) { return this.algorithms.extendTimer(timerId); }
    }
    
    /**
     * 時間延長をリクエスト（アルゴリズムに委譲）
     */
    requestTimeExtension() { return this.algorithms.requestTimeExtension(); }
    }
    
    /**
     * 時間警告を表示（フィードバックシステムに委譲）
     */
    showTimeWarning(timerId) { return this.feedback.showTimeWarning(timerId); }
    }
    
    /**
     * 延長フィードバックを表示（フィードバックシステムに委譲）
     */
    showExtensionFeedback(timerId, remainingTime) { return this.feedback.showExtensionFeedback(timerId, remainingTime); }
    }
    
    /**
     * 適応提案を表示（フィードバックシステムに委譲）
     */
    suggestAdaptation(type, averageResponseTime) { return this.feedback.suggestAdaptation(type, averageResponseTime); }
    }
    
    /**
     * プロファイル変更を提案（フィードバックシステムに委譲）
     */
    suggestProfileChange(recommendedProfile) { return this.feedback.suggestProfileChange(recommendedProfile); }
    }
    
    /**
     * カスタムタイマーを作成（アルゴリズムに委譲）
     */
    createCustomTimer(id, duration, options = { ) {
        
    }
        return this.algorithms.createCustomTimer(id, duration, options); }
    }
    
    /**
     * タイマーの残り時間を取得（アルゴリズムに委譲）
     */
    getRemainingTime(timerId) { return this.algorithms.getRemainingTime(timerId); }
    }
    
    // ========== イベントハンドラー ==========
    
    /**
     * キーボードイベントを処理
     */''
    handleKeydown(event') {'
        // スペースキーまたはPキーでゲーム一時停止
        if ((event.code === 'Space' || event.code === 'KeyP') && !event.repeat) {
            if (this.getCurrentProfile().pauseEnabled) {'
                event.preventDefault();''
                this.toggleGlobalPause()';
        if (event.code === 'KeyT' && !event.repeat) {
            if (this.getCurrentProfile().timeoutExtensions) {'
                event.preventDefault();''
                this.requestTimeExtension()';
        if (event.code === 'Escape' && event.ctrlKey) {
            event.preventDefault();
    }
            this.feedback.openTimingSettings(); }
        }
    }
    
    /**
     * ページ可視性の変更を処理
     */
    handleVisibilityChange() {
        if (document.hidden) {'
            // ページが隠れた場合、自動的に一時停止
            if (this.config.autoAdjustment') {'
    }'
                this.algorithms.pauseAllTimers('visibility''); }
            }'
        } else {  // ページが表示された場合、タイマーを再開' }'
            this.algorithms.resumeAllTimers('visibility'); }
        }
    }
    
    /**
     * フォーカス変更を処理'
     */''
    handleFocusChange(event') {'
        '';
        if (event.type === 'blur' && this.config.autoAdjustment') {'
            // フォーカスが外れた場合、タイマーを一時停止
    }'
            this.algorithms.pauseAllTimers('focus'');' }'
        } else if (event.type === 'focus'') { // フォーカスが戻った場合、タイマーを再開
            this.algorithms.resumeAllTimers('focus'); }
        }
    }
    
    /**
     * ゲーム状態変更を処理
     */
    handleGameStateChange(state) {'
        '';
        if (state.paused') {'
    }'
            this.algorithms.pauseAllTimers('game');' }'
        } else if (state.resumed') { ''
            this.algorithms.resumeAllTimers('game'); }
        }
    }
    
    /**
     * ユーザーインタラクションを追跡（キャリブレーターに委譲）
     */
    trackUserInteraction(interaction) { return this.calibrator.trackUserInteraction(interaction); }
    }
    
    /**
     * バブル作成時の処理（アルゴリズムに委譲）
     */
    handleBubbleCreated(bubble) { return this.algorithms.handleBubbleCreated(bubble); }
    }
    
    /**
     * グローバル一時停止を切り替え
     */
    toggleGlobalPause() {'
        '';
        if (this.state.isGlobalPaused') {'
    }'
            this.algorithms.resumeAllTimers('user''); }'
        } else {  ' }'
            this.algorithms.pauseAllTimers('user''); }
        }
        
        this.state.isGlobalPaused = !this.state.isGlobalPaused;
        ';
        // UI更新イベントを発火
        this.emitEvent('globalPauseToggled', { )
            paused: this.state.isGlobalPaused) }
    }
    
    // ========== パブリックAPI ==========
    
    /**
     * 現在の統計を取得
     */
    getStatistics() {
        return { currentProfile: this.state.currentProfile,
            activeTimers: this.timers.active.size,
            pausedTimers: this.timers.paused.size,
            totalExtensions: this.adaptiveLearning.data.extensionRequests,
    }
            pauseFrequency: this.adaptiveLearning.data.pauseFrequency, };
            averageResponseTime: this.state.userInteractionData.averageResponseTime, }
            adaptationData: { ...this.adaptiveLearning.data }
        },
    }
    
    /**
     * プロファイル一覧を取得
     */
    getAvailableProfiles() {
        return Object.keys(this.config.profiles).map(key => ({
            id: key);
            name: this.config.profiles[key].name);
            description: this.config.profiles[key].description,)
    }
            current: key === this.state.currentProfile))); }
    }
    
    // ========== ユーティリティ ==========
    
    /**
     * イベントを発火
     */
    emitEvent(eventName, data) { if (this.gameEngine.eventEmitter) { }
            this.gameEngine.eventEmitter.emit(`timingAdjustment:${eventName)`, data});
        }
        
        // カスタムイベントも発火
        const customEvent = new CustomEvent(`timingAdjustment:${eventName}`, { detail: data)
        ),
        document.dispatchEvent(customEvent) }
    }
    
    /**
     * 深い結合を実行
     */
    deepMerge(target, source) {
        
    }
        const result = { ...target };
        '';
        for(const key in source') {'
            '';
            if(source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) {
        }
                result[key] = this.deepMerge(target[key] || {), source[key]); }
            } else { result[key] = source[key]; }
            }
        }
        
        return result;
    }
    
    /**
     * 設定を保存'
     */''
    saveConfiguration()';
            localStorage.setItem('timingAdjustmentConfig', JSON.stringify(this.config)');''
            localStorage.setItem('timingAdjustmentProfile', this.state.currentProfile');''
            localStorage.setItem('timingAdaptiveLearning', JSON.stringify(this.adaptiveLearning.data);''
        } catch (error) { ''
            console.warn('TimingAdjustmentManager: 設定保存エラー:', error) }
        }
    }
    
    // ========== クリーンアップ ==========
    
    /**
     * クリーンアップ
     */
    destroy() {
        // サブコンポーネントのクリーンアップ
        if (this.calibrator) {
    }
            this.calibrator.destroy(); }
        }
        
        if (this.algorithms) { this.algorithms.destroy(); }
        }
        
        if(this.feedback) {
        ';'
            '';
            this.feedback.destroy()';
        document.removeEventListener('keydown', this.boundHandlers.keydown');''
        document.removeEventListener('visibilitychange', this.boundHandlers.visibilitychange');''
        window.removeEventListener('focus', this.boundHandlers.focus');''
        window.removeEventListener('blur', this.boundHandlers.blur);
        ';
        // 設定を保存
        this.saveConfiguration();
        }'
        console.log('[TimingAdjustmentManager] Main Controller cleaned up successfully''); }'
    }''
}