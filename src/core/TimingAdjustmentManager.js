/**
 * TimingAdjustmentManager - 時間的配慮管理システム
 * 
 * 運動能力や認知能力に配慮した時間的調整機能を提供します。
 * WCAG 2.1 AAガイドラインに準拠した時間制限の拡張と制御機能を実装します。
 */

export class TimingAdjustmentManager {
    /**
     * TimingAdjustmentManagerを初期化
     * @param {Object} gameEngine - ゲームエンジンインスタンス
     */
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isInitialized = false;
        
        // 設定とプロファイル
        this.config = {
            // 基本設定
            enabled: true,
            defaultProfile: 'standard',
            autoAdjustment: true,
            adaptiveLearning: true,
            
            // 時間調整レベル
            adjustmentLevels: {
                none: { multiplier: 1.0, name: '標準', description: '時間調整なし' },
                minimal: { multiplier: 1.5, name: '軽微', description: '1.5倍の時間' },
                moderate: { multiplier: 2.0, name: '中程度', description: '2倍の時間' },
                significant: { multiplier: 3.0, name: '大幅', description: '3倍の時間' },
                unlimited: { multiplier: Infinity, name: '無制限', description: '時間制限なし' }
            },
            
            // プロファイル別設定
            profiles: {
                // 標準プロファイル
                standard: {
                    name: '標準',
                    description: '一般的な使用',
                    adjustmentLevel: 'none',
                    timeoutExtensions: false,
                    pauseEnabled: true,
                    customTimeouts: {},
                    preferences: {
                        showTimeWarnings: true,
                        autoExtend: false,
                        gracePeriod: 5000
                    }
                },
                
                // 運動機能制限プロファイル
                motor: {
                    name: '運動機能配慮',
                    description: '運動機能に制限がある方向け',
                    adjustmentLevel: 'moderate',
                    timeoutExtensions: true,
                    pauseEnabled: true,
                    customTimeouts: {
                        bubbleLifetime: 2.0,
                        inputDelay: 1.5,
                        menuNavigation: 2.0
                    },
                    preferences: {
                        showTimeWarnings: true,
                        autoExtend: true,
                        gracePeriod: 10000,
                        confirmExtensions: false
                    }
                },
                
                // 認知機能配慮プロファイル
                cognitive: {
                    name: '認知機能配慮',
                    description: '認知機能に配慮が必要な方向け',
                    adjustmentLevel: 'significant',
                    timeoutExtensions: true,
                    pauseEnabled: true,
                    customTimeouts: {
                        bubbleLifetime: 3.0,
                        inputDelay: 2.0,
                        menuNavigation: 3.0,
                        decisionTime: 2.5
                    },
                    preferences: {
                        showTimeWarnings: true,
                        autoExtend: true,
                        gracePeriod: 15000,
                        confirmExtensions: false,
                        showProgress: true
                    }
                },
                
                // 高齢者向けプロファイル
                senior: {
                    name: '高齢者向け',
                    description: '高齢者の方に配慮したタイミング',
                    adjustmentLevel: 'moderate',
                    timeoutExtensions: true,
                    pauseEnabled: true,
                    customTimeouts: {
                        bubbleLifetime: 2.5,
                        inputDelay: 1.8,
                        menuNavigation: 2.5,
                        readingTime: 2.0
                    },
                    preferences: {
                        showTimeWarnings: true,
                        autoExtend: true,
                        gracePeriod: 12000,
                        confirmExtensions: true,
                        largeTimers: true
                    }
                },
                
                // カスタムプロファイル
                custom: {
                    name: 'カスタム',
                    description: 'ユーザー定義設定',
                    adjustmentLevel: 'moderate',
                    timeoutExtensions: true,
                    pauseEnabled: true,
                    customTimeouts: {},
                    preferences: {
                        showTimeWarnings: true,
                        autoExtend: false,
                        gracePeriod: 8000
                    }
                }
            }
        };
        
        // 状態管理
        this.state = {
            currentProfile: 'standard',
            isGlobalPaused: false,
            activeTimers: new Map(),
            pendingExtensions: new Map(),
            userInteractionData: {
                averageResponseTime: 1000,
                recentResponses: [],
                adaptationNeeded: false
            },
            warningStates: new Map()
        };
        
        // タイマー管理
        this.timers = {
            active: new Map(),
            paused: new Map(),
            extensions: new Map(),
            warnings: new Map()
        };
        
        // 適応学習データ
        this.adaptiveLearning = {
            enabled: true,
            data: {
                userResponseTimes: [],
                difficultyLevels: [],
                errorRates: [],
                extensionRequests: 0,
                pauseFrequency: 0
            },
            thresholds: {
                slowResponse: 2000,
                fastResponse: 500,
                adaptationTrigger: 5,
                confidenceLevel: 0.8
            }
        };
        
        // イベントリスナー
        this.boundHandlers = {
            keydown: this.handleKeydown.bind(this),
            visibilitychange: this.handleVisibilityChange.bind(this),
            focus: this.handleFocusChange.bind(this),
            blur: this.handleFocusChange.bind(this)
        };
        
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    async initialize() {
        try {
            console.log('TimingAdjustmentManager: 初期化開始');
            
            // 設定の読み込み
            await this.loadConfiguration();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // システム設定の検出
            this.detectSystemPreferences();
            
            // 初期プロファイルの適用
            this.applyProfile(this.config.defaultProfile);
            
            // アクセシビリティマネージャーとの統合
            if (this.gameEngine.accessibilityManager) {
                this.integrateWithAccessibilityManager();
            }
            
            this.isInitialized = true;
            console.log('TimingAdjustmentManager: 初期化完了');
            
        } catch (error) {
            console.error('TimingAdjustmentManager: 初期化エラー:', error);
            throw error;
        }
    }
    
    /**
     * 設定を読み込み
     */
    async loadConfiguration() {
        try {
            // LocalStorageから設定を読み込み
            const savedConfig = localStorage.getItem('timingAdjustmentConfig');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.mergeConfig(parsed);
            }
            
            // ユーザープロファイルの読み込み
            const savedProfile = localStorage.getItem('timingAdjustmentProfile');
            if (savedProfile) {
                this.state.currentProfile = savedProfile;
            }
            
            // 適応学習データの読み込み
            const savedLearningData = localStorage.getItem('timingAdaptiveLearning');
            if (savedLearningData) {
                this.adaptiveLearning.data = { ...this.adaptiveLearning.data, ...JSON.parse(savedLearningData) };
            }
            
        } catch (error) {
            console.warn('TimingAdjustmentManager: 設定読み込みエラー:', error);
        }
    }
    
    /**
     * 設定をマージ
     */
    mergeConfig(newConfig) {
        // 深い結合を実行
        this.config = this.deepMerge(this.config, newConfig);
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // グローバルキーボードイベント
        document.addEventListener('keydown', this.boundHandlers.keydown);
        
        // ページ可視性変更
        document.addEventListener('visibilitychange', this.boundHandlers.visibilitychange);
        
        // フォーカス変更
        window.addEventListener('focus', this.boundHandlers.focus);
        window.addEventListener('blur', this.boundHandlers.blur);
        
        // ゲームエンジンイベント
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.on('gameStateChange', this.handleGameStateChange.bind(this));
            this.gameEngine.eventEmitter.on('userInteraction', this.trackUserInteraction.bind(this));
            this.gameEngine.eventEmitter.on('bubbleCreated', this.handleBubbleCreated.bind(this));
        }
    }
    
    /**
     * システム設定を検出
     */
    detectSystemPreferences() {
        // プリファレンス設定のメディアクエリ
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersReducedMotion.matches) {
            // 動作軽減が設定されている場合、より長いタイミングを提供
            this.config.profiles.standard.adjustmentLevel = 'minimal';
        }
        
        if (prefersHighContrast.matches) {
            // 高コントラストが設定されている場合、視覚的警告を強化
            this.config.profiles.standard.preferences.showTimeWarnings = true;
        }
        
        // メディアクエリの変更を監視
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                this.adjustForReducedMotion();
            }
        });
    }
    
    /**
     * アクセシビリティマネージャーとの統合
     */
    integrateWithAccessibilityManager() {
        const accessibilityManager = this.gameEngine.accessibilityManager;
        
        // 設定の同期
        accessibilityManager.on('settingsChanged', (settings) => {
            this.handleAccessibilitySettingsChange(settings);
        });
        
        // プロファイルの推奨
        const recommendedProfile = this.getRecommendedProfile(accessibilityManager.getCurrentSettings());
        if (recommendedProfile !== this.state.currentProfile) {
            this.suggestProfileChange(recommendedProfile);
        }
    }
    
    /**
     * キーボードイベントを処理
     */
    handleKeydown(event) {
        // スペースキーまたはPキーでゲーム一時停止
        if ((event.code === 'Space' || event.code === 'KeyP') && !event.repeat) {
            if (this.getCurrentProfile().pauseEnabled) {
                event.preventDefault();
                this.toggleGlobalPause();
            }
        }
        
        // Tキーで時間延長リクエスト
        if (event.code === 'KeyT' && !event.repeat) {
            if (this.getCurrentProfile().timeoutExtensions) {
                event.preventDefault();
                this.requestTimeExtension();
            }
        }
        
        // Escキーで時間調整設定を開く
        if (event.code === 'Escape' && event.ctrlKey) {
            event.preventDefault();
            this.openTimingSettings();
        }
    }
    
    /**
     * ページ可視性の変更を処理
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // ページが隠れた場合、自動的に一時停止
            if (this.config.autoAdjustment) {
                this.pauseAllTimers('visibility');
            }
        } else {
            // ページが表示された場合、タイマーを再開
            this.resumeAllTimers('visibility');
        }
    }
    
    /**
     * フォーカス変更を処理
     */
    handleFocusChange(event) {
        if (event.type === 'blur' && this.config.autoAdjustment) {
            // フォーカスが外れた場合、タイマーを一時停止
            this.pauseAllTimers('focus');
        } else if (event.type === 'focus') {
            // フォーカスが戻った場合、タイマーを再開
            this.resumeAllTimers('focus');
        }
    }
    
    /**
     * ゲーム状態変更を処理
     */
    handleGameStateChange(state) {
        if (state.paused) {
            this.pauseAllTimers('game');
        } else if (state.resumed) {
            this.resumeAllTimers('game');
        }
    }
    
    /**
     * ユーザーインタラクションを追跡
     */
    trackUserInteraction(interaction) {
        const responseTime = interaction.responseTime || Date.now() - interaction.startTime;
        
        // レスポンス時間をデータに追加
        this.state.userInteractionData.recentResponses.push({
            time: responseTime,
            timestamp: Date.now(),
            type: interaction.type
        });
        
        // 最新50件のみ保持
        if (this.state.userInteractionData.recentResponses.length > 50) {
            this.state.userInteractionData.recentResponses.shift();
        }
        
        // 平均レスポンス時間を更新
        this.updateAverageResponseTime();
        
        // 適応学習の実行
        if (this.adaptiveLearning.enabled) {
            this.performAdaptiveLearning();
        }
    }
    
    /**
     * バブル作成時の処理
     */
    handleBubbleCreated(bubble) {
        // バブルの寿命を調整
        const profile = this.getCurrentProfile();
        const adjustment = profile.customTimeouts.bubbleLifetime || this.getAdjustmentMultiplier();
        
        if (adjustment !== 1.0) {
            const originalLifetime = bubble.maxAge;
            bubble.maxAge = originalLifetime * adjustment;
            
            // タイマーを登録
            this.registerTimer(`bubble_${bubble.id}`, {
                originalDuration: originalLifetime,
                adjustedDuration: bubble.maxAge,
                startTime: Date.now(),
                type: 'bubble',
                entity: bubble
            });
        }
    }
    
    /**
     * プロファイルを適用
     */
    applyProfile(profileName) {
        if (!this.config.profiles[profileName]) {
            console.warn(`TimingAdjustmentManager: 不明なプロファイル: ${profileName}`);
            return false;
        }
        
        this.state.currentProfile = profileName;
        const profile = this.config.profiles[profileName];
        
        // 現在のタイマーに調整を適用
        this.applyAdjustmentsToActiveTimers();
        
        // 設定を保存
        localStorage.setItem('timingAdjustmentProfile', profileName);
        
        // イベントを発火
        this.emitEvent('profileChanged', { 
            profile: profileName, 
            settings: profile 
        });
        
        console.log(`TimingAdjustmentManager: プロファイル "${profile.name}" を適用`);
        return true;
    }
    
    /**
     * 現在のプロファイルを取得
     */
    getCurrentProfile() {
        return this.config.profiles[this.state.currentProfile];
    }
    
    /**
     * 調整倍率を取得
     */
    getAdjustmentMultiplier() {
        const profile = this.getCurrentProfile();
        return this.config.adjustmentLevels[profile.adjustmentLevel].multiplier;
    }
    
    /**
     * タイマーを登録
     */
    registerTimer(timerId, config) {
        this.timers.active.set(timerId, {
            ...config,
            id: timerId,
            registeredAt: Date.now(),
            pausedTime: 0,
            extensionCount: 0
        });
        
        // 警告タイマーの設定
        this.setupWarningTimer(timerId, config);
    }
    
    /**
     * タイマーを削除
     */
    unregisterTimer(timerId) {
        this.timers.active.delete(timerId);
        this.timers.paused.delete(timerId);
        this.timers.extensions.delete(timerId);
        this.timers.warnings.delete(timerId);
        this.state.warningStates.delete(timerId);
    }
    
    /**
     * 警告タイマーを設定
     */
    setupWarningTimer(timerId, config) {
        const profile = this.getCurrentProfile();
        if (!profile.preferences.showTimeWarnings) return;
        
        const warningThreshold = config.adjustedDuration * 0.8; // 80%で警告
        
        setTimeout(() => {
            if (this.timers.active.has(timerId)) {
                this.showTimeWarning(timerId);
            }
        }, warningThreshold);
    }
    
    /**
     * 時間警告を表示
     */
    showTimeWarning(timerId) {
        const timer = this.timers.active.get(timerId);
        if (!timer) return;
        
        const profile = this.getCurrentProfile();
        const remainingTime = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime);
        
        // 警告状態を設定
        this.state.warningStates.set(timerId, {
            shown: true,
            remainingTime: remainingTime,
            timestamp: Date.now()
        });
        
        // 視覚的警告
        this.showVisualWarning(timerId, remainingTime);
        
        // 音響警告（オプション）
        if (this.gameEngine.audioManager) {
            this.gameEngine.audioManager.playSound('timeWarning', { volume: 0.3 });
        }
        
        // 自動延長の確認
        if (profile.preferences.autoExtend) {
            this.scheduleAutoExtension(timerId);
        }
    }
    
    /**
     * 視覚的警告を表示
     */
    showVisualWarning(timerId, remainingTime) {
        const timer = this.timers.active.get(timerId);
        const profile = this.getCurrentProfile();
        
        // 警告UI要素を作成
        const warningElement = document.createElement('div');
        warningElement.className = 'timing-warning';
        warningElement.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⏰</div>
                <div class="warning-text">
                    <h3>時間制限の警告</h3>
                    <p>残り時間: ${Math.ceil(remainingTime / 1000)}秒</p>
                    ${profile.timeoutExtensions ? '<p>Tキーで時間を延長できます</p>' : ''}
                </div>
                <div class="warning-actions">
                    ${profile.timeoutExtensions ? '<button class="extend-time-btn">時間延長</button>' : ''}
                    <button class="dismiss-warning-btn">閉じる</button>
                </div>
            </div>
        `;
        
        // スタイルを適用
        this.applyWarningStyles(warningElement, profile);
        
        // ボタンイベントを設定
        this.setupWarningButtons(warningElement, timerId);
        
        // 画面に表示
        document.body.appendChild(warningElement);
        
        // 自動削除
        setTimeout(() => {
            if (warningElement.parentNode) {
                warningElement.parentNode.removeChild(warningElement);
            }
        }, profile.preferences.gracePeriod);
    }
    
    /**
     * 警告スタイルを適用
     */
    applyWarningStyles(element, profile) {
        const styles = `
            .timing-warning {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                border: 3px solid #ff6b35;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 400px;
                animation: warningPulse 1s ease-in-out infinite alternate;
            }
            
            .warning-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .warning-icon {
                font-size: ${profile.preferences.largeTimers ? '48px' : '32px'};
                margin-bottom: 10px;
            }
            
            .warning-text h3 {
                color: #d63031;
                margin: 0 0 10px 0;
                font-size: ${profile.preferences.largeTimers ? '20px' : '16px'};
            }
            
            .warning-text p {
                color: #2d3436;
                margin: 5px 0;
                font-size: ${profile.preferences.largeTimers ? '16px' : '14px'};
            }
            
            .warning-actions {
                margin-top: 15px;
                display: flex;
                gap: 10px;
            }
            
            .warning-actions button {
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            
            .extend-time-btn {
                background: #00b894;
                color: white;
            }
            
            .extend-time-btn:hover {
                background: #00a085;
            }
            
            .dismiss-warning-btn {
                background: #636e72;
                color: white;
            }
            
            .dismiss-warning-btn:hover {
                background: #2d3436;
            }
            
            @keyframes warningPulse {
                from { transform: translate(-50%, -50%) scale(1); }
                to { transform: translate(-50%, -50%) scale(1.02); }
            }
        `;
        
        // スタイルシートを追加
        if (!document.getElementById('timing-warning-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'timing-warning-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }
    
    /**
     * 警告ボタンを設定
     */
    setupWarningButtons(element, timerId) {
        const extendBtn = element.querySelector('.extend-time-btn');
        const dismissBtn = element.querySelector('.dismiss-warning-btn');
        
        if (extendBtn) {
            extendBtn.addEventListener('click', () => {
                this.extendTimer(timerId);
                element.remove();
            });
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                element.remove();
            });
        }
    }
    
    /**
     * タイマーを延長
     */
    extendTimer(timerId) {
        const timer = this.timers.active.get(timerId);
        if (!timer) return false;
        
        const profile = this.getCurrentProfile();
        const extensionAmount = timer.originalDuration * 0.5; // 50%延長
        
        // 延長を適用
        timer.adjustedDuration += extensionAmount;
        timer.extensionCount++;
        
        // 延長記録を保存
        this.timers.extensions.set(timerId, {
            count: timer.extensionCount,
            totalExtension: timer.extensionCount * extensionAmount,
            lastExtension: Date.now()
        });
        
        // 統計を更新
        this.adaptiveLearning.data.extensionRequests++;
        
        // イベントを発火
        this.emitEvent('timerExtended', {
            timerId,
            extensionAmount,
            newDuration: timer.adjustedDuration
        });
        
        console.log(`TimingAdjustmentManager: タイマー ${timerId} を ${extensionAmount}ms 延長`);
        return true;
    }
    
    /**
     * 時間延長をリクエスト
     */
    requestTimeExtension() {
        // 現在アクティブなタイマーから最も緊急なものを選択
        let mostUrgentTimer = null;
        let shortestRemaining = Infinity;
        
        for (const [timerId, timer] of this.timers.active) {
            const remaining = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime);
            if (remaining < shortestRemaining && remaining > 0) {
                shortestRemaining = remaining;
                mostUrgentTimer = timerId;
            }
        }
        
        if (mostUrgentTimer) {
            this.extendTimer(mostUrgentTimer);
            
            // フィードバックを表示
            this.showExtensionFeedback(mostUrgentTimer, shortestRemaining);
        }
    }
    
    /**
     * 延長フィードバックを表示
     */
    showExtensionFeedback(timerId, remainingTime) {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'extension-feedback';
        feedbackElement.innerHTML = `
            <div class="feedback-content">
                <div class="feedback-icon">✓</div>
                <div class="feedback-text">時間を延長しました</div>
            </div>
        `;
        
        feedbackElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00b894;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(feedbackElement);
        
        setTimeout(() => {
            feedbackElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => feedbackElement.remove(), 300);
        }, 2000);
    }
    
    /**
     * グローバル一時停止を切り替え
     */
    toggleGlobalPause() {
        if (this.state.isGlobalPaused) {
            this.resumeAllTimers('user');
        } else {
            this.pauseAllTimers('user');
        }
        
        this.state.isGlobalPaused = !this.state.isGlobalPaused;
        
        // UI更新イベントを発火
        this.emitEvent('globalPauseToggled', {
            paused: this.state.isGlobalPaused
        });
    }
    
    /**
     * すべてのタイマーを一時停止
     */
    pauseAllTimers(reason = 'manual') {
        const pauseTime = Date.now();
        
        for (const [timerId, timer] of this.timers.active) {
            if (!this.timers.paused.has(timerId)) {
                this.timers.paused.set(timerId, {
                    pausedAt: pauseTime,
                    reason: reason
                });
            }
        }
        
        // 統計を更新
        this.adaptiveLearning.data.pauseFrequency++;
        
        console.log(`TimingAdjustmentManager: すべてのタイマーを一時停止 (理由: ${reason})`);
    }
    
    /**
     * すべてのタイマーを再開
     */
    resumeAllTimers(reason = 'manual') {
        const resumeTime = Date.now();
        
        for (const [timerId, pauseInfo] of this.timers.paused) {
            if (pauseInfo.reason === reason || reason === 'user') {
                const timer = this.timers.active.get(timerId);
                if (timer) {
                    timer.pausedTime += resumeTime - pauseInfo.pausedAt;
                }
                this.timers.paused.delete(timerId);
            }
        }
        
        console.log(`TimingAdjustmentManager: タイマーを再開 (理由: ${reason})`);
    }
    
    /**
     * アクティブなタイマーに調整を適用
     */
    applyAdjustmentsToActiveTimers() {
        const multiplier = this.getAdjustmentMultiplier();
        const profile = this.getCurrentProfile();
        
        for (const [timerId, timer] of this.timers.active) {
            // 基本調整の適用
            const baseAdjustment = multiplier !== 1.0 ? multiplier : 1.0;
            
            // カスタム調整の適用
            let customAdjustment = 1.0;
            if (profile.customTimeouts[timer.type]) {
                customAdjustment = profile.customTimeouts[timer.type];
            }
            
            // 最終調整値を計算
            const finalAdjustment = baseAdjustment * customAdjustment;
            
            if (finalAdjustment !== 1.0) {
                const elapsed = Date.now() - timer.startTime - timer.pausedTime;
                const remaining = timer.adjustedDuration - elapsed;
                
                if (remaining > 0) {
                    timer.adjustedDuration = elapsed + (remaining * finalAdjustment);
                }
            }
        }
    }
    
    /**
     * 平均レスポンス時間を更新
     */
    updateAverageResponseTime() {
        const recentResponses = this.state.userInteractionData.recentResponses;
        if (recentResponses.length > 0) {
            const total = recentResponses.reduce((sum, response) => sum + response.time, 0);
            this.state.userInteractionData.averageResponseTime = total / recentResponses.length;
        }
    }
    
    /**
     * 適応学習を実行
     */
    performAdaptiveLearning() {
        const data = this.adaptiveLearning.data;
        const thresholds = this.adaptiveLearning.thresholds;
        const recentResponses = this.state.userInteractionData.recentResponses;
        
        if (recentResponses.length < thresholds.adaptationTrigger) {
            return; // データが不十分
        }
        
        // 最新のレスポンス時間を分析
        const recentTimes = recentResponses.slice(-thresholds.adaptationTrigger)
                                         .map(r => r.time);
        const averageRecent = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
        
        // 適応の判定
        let adaptationNeeded = false;
        let recommendedAdjustment = null;
        
        if (averageRecent > thresholds.slowResponse) {
            // レスポンスが遅い - より多くの時間が必要
            adaptationNeeded = true;
            recommendedAdjustment = 'increase';
        } else if (averageRecent < thresholds.fastResponse && 
                  data.extensionRequests === 0 && 
                  data.pauseFrequency === 0) {
            // レスポンスが速く、延長やポーズが不要 - 時間を短縮可能
            adaptationNeeded = true;
            recommendedAdjustment = 'decrease';
        }
        
        if (adaptationNeeded) {
            this.suggestAdaptation(recommendedAdjustment, averageRecent);
        }
    }
    
    /**
     * 適応提案を表示
     */
    suggestAdaptation(type, averageResponseTime) {
        const currentProfile = this.getCurrentProfile();
        let suggestedProfile = null;
        
        if (type === 'increase') {
            // より時間を必要とする場合
            if (this.state.currentProfile === 'standard') {
                suggestedProfile = 'motor';
            } else if (this.state.currentProfile === 'motor') {
                suggestedProfile = 'cognitive';
            }
        } else if (type === 'decrease') {
            // 時間を短縮できる場合
            if (this.state.currentProfile === 'cognitive') {
                suggestedProfile = 'motor';
            } else if (this.state.currentProfile === 'motor') {
                suggestedProfile = 'standard';
            }
        }
        
        if (suggestedProfile && suggestedProfile !== this.state.currentProfile) {
            this.showAdaptationSuggestion(suggestedProfile, averageResponseTime);
        }
    }
    
    /**
     * 適応提案UIを表示
     */
    showAdaptationSuggestion(suggestedProfile, averageResponseTime) {
        const profile = this.config.profiles[suggestedProfile];
        
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'adaptation-suggestion';
        suggestionElement.innerHTML = `
            <div class="suggestion-content">
                <div class="suggestion-icon">🎯</div>
                <div class="suggestion-text">
                    <h3>タイミング調整の提案</h3>
                    <p>あなたの操作パターンに基づいて、「${profile.name}」プロファイルをお勧めします。</p>
                    <p><small>平均レスポンス時間: ${Math.round(averageResponseTime)}ms</small></p>
                </div>
                <div class="suggestion-actions">
                    <button class="accept-suggestion-btn">適用する</button>
                    <button class="dismiss-suggestion-btn">今回は見送る</button>
                </div>
            </div>
        `;
        
        // スタイルを適用
        suggestionElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 2px solid #0984e3;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 350px;
            animation: slideInUp 0.3s ease-out;
        `;
        
        // ボタンイベントを設定
        const acceptBtn = suggestionElement.querySelector('.accept-suggestion-btn');
        const dismissBtn = suggestionElement.querySelector('.dismiss-suggestion-btn');
        
        acceptBtn.addEventListener('click', () => {
            this.applyProfile(suggestedProfile);
            suggestionElement.remove();
        });
        
        dismissBtn.addEventListener('click', () => {
            suggestionElement.remove();
        });
        
        document.body.appendChild(suggestionElement);
        
        // 自動削除
        setTimeout(() => {
            if (suggestionElement.parentNode) {
                suggestionElement.remove();
            }
        }, 10000);
    }
    
    /**
     * 推奨プロファイルを取得
     */
    getRecommendedProfile(accessibilitySettings) {
        // アクセシビリティ設定に基づいてプロファイルを推奨
        if (accessibilitySettings.motorImpairment || accessibilitySettings.reducedDexterity) {
            return 'motor';
        }
        
        if (accessibilitySettings.cognitiveImpairment || accessibilitySettings.memoryIssues) {
            return 'cognitive';
        }
        
        if (accessibilitySettings.seniorFriendly) {
            return 'senior';
        }
        
        return 'standard';
    }
    
    /**
     * プロファイル変更を提案
     */
    suggestProfileChange(recommendedProfile) {
        const profile = this.config.profiles[recommendedProfile];
        
        // 非侵入的な提案を表示
        console.log(`TimingAdjustmentManager: 「${profile.name}」プロファイルを推奨します`);
        
        // 設定画面で推奨マークを表示するためのイベント
        this.emitEvent('profileRecommendation', {
            recommended: recommendedProfile,
            current: this.state.currentProfile
        });
    }
    
    /**
     * アクセシビリティ設定変更を処理
     */
    handleAccessibilitySettingsChange(settings) {
        const recommendedProfile = this.getRecommendedProfile(settings);
        
        if (recommendedProfile !== this.state.currentProfile) {
            // 自動適用するかユーザーに確認
            if (this.config.autoAdjustment) {
                this.applyProfile(recommendedProfile);
            } else {
                this.suggestProfileChange(recommendedProfile);
            }
        }
    }
    
    /**
     * 動作軽減への対応
     */
    adjustForReducedMotion() {
        // アニメーション時間を延長
        const currentProfile = this.getCurrentProfile();
        currentProfile.customTimeouts.animation = 2.0;
        currentProfile.customTimeouts.transition = 1.5;
        
        console.log('TimingAdjustmentManager: 動作軽減に対応したタイミング調整を適用');
    }
    
    /**
     * 時間調整設定を開く
     */
    openTimingSettings() {
        // 設定UI表示のイベントを発火
        this.emitEvent('openTimingSettings', {
            currentProfile: this.state.currentProfile,
            availableProfiles: Object.keys(this.config.profiles)
        });
    }
    
    /**
     * 自動延長をスケジュール
     */
    scheduleAutoExtension(timerId) {
        const timer = this.timers.active.get(timerId);
        const profile = this.getCurrentProfile();
        
        if (!timer || !profile.preferences.autoExtend) return;
        
        const gracePeriod = profile.preferences.gracePeriod;
        const remaining = timer.adjustedDuration - (Date.now() - timer.startTime - timer.pausedTime);
        
        if (remaining <= gracePeriod) {
            // グレース期間内の場合、自動延長を実行
            setTimeout(() => {
                if (this.timers.active.has(timerId)) {
                    this.extendTimer(timerId);
                }
            }, Math.max(0, remaining - 1000)); // 1秒前に延長
        }
    }
    
    /**
     * 設定を保存
     */
    saveConfiguration() {
        try {
            localStorage.setItem('timingAdjustmentConfig', JSON.stringify(this.config));
            localStorage.setItem('timingAdjustmentProfile', this.state.currentProfile);
            localStorage.setItem('timingAdaptiveLearning', JSON.stringify(this.adaptiveLearning.data));
        } catch (error) {
            console.warn('TimingAdjustmentManager: 設定保存エラー:', error);
        }
    }
    
    /**
     * イベントを発火
     */
    emitEvent(eventName, data) {
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.emit(`timingAdjustment:${eventName}`, data);
        }
        
        // カスタムイベントも発火
        const customEvent = new CustomEvent(`timingAdjustment:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(customEvent);
    }
    
    /**
     * 深い結合を実行
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    /**
     * パブリックAPI: 現在の統計を取得
     */
    getStatistics() {
        return {
            currentProfile: this.state.currentProfile,
            activeTimers: this.timers.active.size,
            pausedTimers: this.timers.paused.size,
            totalExtensions: this.adaptiveLearning.data.extensionRequests,
            pauseFrequency: this.adaptiveLearning.data.pauseFrequency,
            averageResponseTime: this.state.userInteractionData.averageResponseTime,
            adaptationData: { ...this.adaptiveLearning.data }
        };
    }
    
    /**
     * パブリックAPI: プロファイル一覧を取得
     */
    getAvailableProfiles() {
        return Object.keys(this.config.profiles).map(key => ({
            id: key,
            name: this.config.profiles[key].name,
            description: this.config.profiles[key].description,
            current: key === this.state.currentProfile
        }));
    }
    
    /**
     * パブリックAPI: カスタムタイマーを作成
     */
    createCustomTimer(id, duration, options = {}) {
        const adjustedDuration = duration * this.getAdjustmentMultiplier();
        
        this.registerTimer(id, {
            originalDuration: duration,
            adjustedDuration: adjustedDuration,
            startTime: Date.now(),
            type: options.type || 'custom',
            ...options
        });
        
        return {
            id,
            originalDuration: duration,
            adjustedDuration: adjustedDuration
        };
    }
    
    /**
     * パブリックAPI: タイマーの残り時間を取得
     */
    getRemainingTime(timerId) {
        const timer = this.timers.active.get(timerId);
        if (!timer) return null;
        
        const elapsed = Date.now() - timer.startTime - timer.pausedTime;
        const remaining = Math.max(0, timer.adjustedDuration - elapsed);
        
        return {
            remaining,
            total: timer.adjustedDuration,
            percentage: (elapsed / timer.adjustedDuration) * 100
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // イベントリスナーを削除
        document.removeEventListener('keydown', this.boundHandlers.keydown);
        document.removeEventListener('visibilitychange', this.boundHandlers.visibilitychange);
        window.removeEventListener('focus', this.boundHandlers.focus);
        window.removeEventListener('blur', this.boundHandlers.blur);
        
        // タイマーをクリア
        this.timers.active.clear();
        this.timers.paused.clear();
        this.timers.extensions.clear();
        this.timers.warnings.clear();
        
        // 設定を保存
        this.saveConfiguration();
        
        console.log('TimingAdjustmentManager: クリーンアップ完了');
    }
}