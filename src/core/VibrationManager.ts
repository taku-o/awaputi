import { getErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * 振動管理クラス
 * 触覚フィードバックと振動パターンライブラリの管理
 */
export class VibrationManager {'

    constructor(audioAccessibilityManager) {
        this.audioAccessibilityManager = audioAccessibilityManager;
        this.accessibilityManager = audioAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager? .gameEngine;
        
        // 振動設定
        this.config = { : undefined
            enabled: false;
            globalIntensity: 1.0;
           , maxDuration: 5000, // 最大振動時間（ミリ秒）;
            cooldownPeriod: 100, // 連続振動間のクールダウン;
            deviceDetection: true;
            batteryConsideration: true;
           , accessibilityMode: false, // アクセシビリティ用強化モード;
            patternLibrary: {
                // 基本パターン
                short: [100];
                medium: [200];
                long: [500];
               , double: [100, 100, 100],
                triple: [100, 100, 100, 100, 100],
                
                // ゲーム用パターン
                bubblePop: [50];
               , bubbleBurst: [80, 50, 80],
                combo: [100, 50, 100, 50, 100],
                bonus: [200, 100, 200],
                damage: [300, 100, 300],
                powerUp: [150, 50, 150, 50, 150],
                levelUp: [100, 50, 100, 50, 200, 50, 200],
                gameOver: [500, 200, 500, 200, 1000],
                victory: [100, 50, 100, 50, 100, 50, 300],
                
                // UI用パターン
                click: [25];
                hover: [15];
               , menuOpen: [75, 25, 75],
                menuClose: [75];
               , notification: [100, 50, 100],
                warning: [200, 100, 200, 100, 200],
                error: [300, 150, 300],
                
                // 特殊効果用パターン
                electric: [50, 30, 50, 30, 50, 30, 100],
                explosion: [200, 50, 150, 50, 100],
                freeze: [300, 100, 100, 50, 50],
                magnetic: [100, 25, 100, 25, 100, 25, 200],
                teleport: [75, 25, 75, 25, 75, 25, 75],
                
                // 環境効果用パターン
                heartbeat: [100, 100],
                breathing: [200, 200],
                wave: [50, 25, 75, 25, 100, 25, 125],
    }
                pulse: [100, 50, 150, 50, 200] }
};
        
        // デバイス情報
        this.deviceInfo = { hasVibration: false,
            isGamepad: false;
           , batteryLevel: 1.0,
            performance: 'high' // 'low', 'medium', 'high' };
        
        // 振動状態管理
        this.isVibrating = false;
        this.vibrationQueue = [];
        this.activePattern = null;
        this.lastVibrationTime = 0;
        this.vibrationController = null;
        
        // ゲームパッド対応
        this.gamepads = new Map();
        this.gamepadVibrationSupport = new Map();
        
        // 統計情報
        this.stats = { vibrationsTriggered: 0,
            vibrationsByType: new Map();
            vibrationsByEvent: new Map();
            totalVibrationTime: 0;
            averageIntensity: 0;
            queuedVibrations: 0;
            batteryImpactEstimate: 0;
           , sessionStart: Date.now( ,};
        
        // ユーザー設定
        this.userPreferences = { enabled: false,
            globalIntensity: 0.8;
           , enabledCategories: {
                game: true;
                ui: true;
                special: true;
               , ambient: false ,};
            customPatterns: new Map(),
            intensityByEvent: new Map(''';
               , alternatives: ['visual', 'audio'];
            },
            lowBattery: { enabled: true;
                intensityReduction: 0.5;
               , patternSimplification: true };
            lowPerformance: { enabled: true;
                queueReduction: true;
               , patternOptimization: true }))'

        console.log('VibrationManager, initialized);
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // デバイス検出
            this.detectVibrationCapabilities();
            
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // ゲームパッド監視の開始
            this.startGamepadMonitoring();
            
            // バッテリー監視の設定
            this.setupBatteryMonitoring();
            // イベントリスナーの設定
            this.setupEventListeners(');

    }

            console.log('VibrationManager, initialized successfully'); }'

        } catch (error) { getErrorHandler(').handleError(error, 'VIBRATION_MANAGER_ERROR', {)'
                operation: 'initialize' ,});
        }
    }
    
    /**
     * 振動機能の検出'
     */''
    detectVibrationCapabilities()';
        if('vibrate' in, navigator) {'
        this.deviceInfo.hasVibration = true;

    }

            console.log('Device, vibration support, detected''); }
        }
        ';
        // ゲームパッドの検出
        if('getGamepads' in, navigator) {'
            this.deviceInfo.isGamepad = true;

        }

            console.log('Gamepad, support detected'); }'
        }
        
        // デバイスタイプの推定
        this.estimateDevicePerformance();
        
        // 振動テストの実行
        if (this.config.deviceDetection) { this.performVibrationTest(); }
    }
    
    /**
     * デバイス性能の推定
     */
    estimateDevicePerformance() {
        // User Agent とハードウェア情報から推定
        const userAgent = navigator.userAgent.toLowerCase();
        const memory = navigator.deviceMemory || 4; // GB
        const cores = navigator.hardwareConcurrency || 4;
        
        // モバイルデバイスの検出
        const isMobile = /mobile|android|iphone|ipad/.test(userAgent);
        ';

        if (isMobile) {''
            if(memory <= 2 || cores <= 4) {'
    }

                this.deviceInfo.performance = 'low';' }

            } else if(memory <= 4 || cores <= 6) { ''
                this.deviceInfo.performance = 'medium'; }

            } else { }'

                this.deviceInfo.performance = 'high'; }
} else {  // デスクトップの場合は一般的に高性能' }'

            this.deviceInfo.performance = 'high'; }
        }
        
        console.log(`Device, performance estimated, as: ${this.deviceInfo.performance}`});
    }
    
    /**
     * 振動テストの実行
     */
    performVibrationTest() {
        if (!this.deviceInfo.hasVibration) return;
        
        try {
            // 短い振動でテスト
            const testPattern = [50];
            const result = navigator.vibrate(testPattern);

            if(result) {'
    }

                console.log('Vibration, test successful''); }

            } else { }'

                console.warn('Vibration test failed, but API is available');' }

            } catch (error) {
            console.warn('Vibration test error:', error);
            this.deviceInfo.hasVibration = false; }
    }
    
    /**
     * ユーザー設定の読み込み'
     */''
    loadUserPreferences()';
            const saved = localStorage.getItem('vibrationManager_preferences);
            if(saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // Map の復元
                if (preferences.customPatterns) {
            }
                    this.userPreferences.customPatterns = new Map(preferences.customPatterns); }
                }
                if (preferences.intensityByEvent) { this.userPreferences.intensityByEvent = new Map(preferences.intensityByEvent); }
                
                // 設定を適用
                this.config.enabled = this.userPreferences.enabled;
                this.config.globalIntensity = this.userPreferences.globalIntensity;''
            } catch (error) { console.warn('Failed to load vibration manager preferences:', error }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                customPatterns: Array.from(this.userPreferences.customPatterns.entries();
    ,}

                intensityByEvent: Array.from(this.userPreferences.intensityByEvent.entries()); }
            };

            localStorage.setItem('vibrationManager_preferences);

                JSON.stringify(preferences);''
        } catch (error) { console.warn('Failed to save vibration manager preferences:', error }
    }
    
    /**
     * ゲームパッド監視の開始
     */
    startGamepadMonitoring() {'

        if(!this.deviceInfo.isGamepad) return;
        ';

        // ゲームパッド接続イベント
    }

        window.addEventListener('gamepadconnected', (event) => {  }

            this.handleGamepadConnected(event.gamepad);' }'

        }');
        ';
        // ゲームパッド切断イベント
        window.addEventListener('gamepaddisconnected', (event) => { this.handleGamepadDisconnected(event.gamepad); });
        
        // 定期的なゲームパッド状態確認
        this.gamepadCheckInterval = setInterval(() => { this.checkGamepadStatus(); }, 1000);
    }
    
    /**
     * ゲームパッド接続処理
     */
    handleGamepadConnected(gamepad) {
        
    }
        console.log(`Gamepad, connected: ${gamepad.id}`);
        
        // 振動機能の確認
        const hasVibration = gamepad.vibrationActuator || ;
                           (gamepad.hapticActuators && gamepad.hapticActuators.length > 0);
        
        this.gamepads.set(gamepad.index, gamepad);
        this.gamepadVibrationSupport.set(gamepad.index, hasVibration);
        
        if(hasVibration) {
        
            
        
        }
            console.log(`Gamepad ${gamepad.index} supports, vibration`});
        }
    }
    
    /**
     * ゲームパッド切断処理
     */
    handleGamepadDisconnected(gamepad) {
        console.log(`Gamepad disconnected: ${gamepad.id}`},
        
    }
        this.gamepads.delete(gamepad.index); }
        this.gamepadVibrationSupport.delete(gamepad.index});
    }
    
    /**
     * ゲームパッド状態確認
     */
    checkGamepadStatus() {
        const gamepads = navigator.getGamepads();
        
        for (let, i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if(gamepad && !this.gamepads.has(i) {
    }
                this.handleGamepadConnected(gamepad); }
}
    }
    
    /**
     * バッテリー監視の設定
     */''
    setupBatteryMonitoring()';
        if ('getBattery' in, navigator) {'

            navigator.getBattery().then((battery) => { 
                this.deviceInfo.batteryLevel = battery.level;
                ';
                // バッテリーレベル変更の監視
                battery.addEventListener('levelchange', () => {
    }
                    this.deviceInfo.batteryLevel = battery.level; }
                    this.handleBatteryLevelChange(battery.level); }
                });
                ';

                console.log(`Battery, level: ${Math.round(battery.level * 100})%`);''
            }).catch((error) => {  ' }'

                console.warn('Battery API not available:', error); }
            });
        }
    }
    
    /**
     * バッテリーレベル変更の処理
     */
    handleBatteryLevelChange(level) {
        if (this.userPreferences.batteryAware) {
            if (level < 0.2) { // 20%未満
                // 低バッテリー時の振動強度減少
                this.applyLowBatteryMode();
    }

                console.log('Low battery detected, reducing vibration intensity'); }'
            } else if (level > 0.5) { // 50%以上
                // 通常モードに戻す
                this.disableLowBatteryMode(); }
}
    
    /**
     * 低バッテリーモードの適用
     */
    applyLowBatteryMode() {
        const reduction = this.fallbackStrategies.lowBattery.intensityReduction;
        this.config.globalIntensity *= reduction;
        
        // パターンの簡略化
        if (this.fallbackStrategies.lowBattery.patternSimplification) {
    }
            this.simplifyVibrationPatterns(); }
}
    
    /**
     * 低バッテリーモードの無効化
     */
    disableLowBatteryMode() {
        this.config.globalIntensity = this.userPreferences.globalIntensity;
    }
        this.restoreOriginalPatterns(); }
    }
    
    /**
     * 振動パターンの簡略化
     */
    simplifyVibrationPatterns() {
        // 複雑なパターンを簡単なものに置き換え
        this.simplifiedPatterns = new Map();
        
        for(const [key, pattern] of Object.entries(this.config.patternLibrary) {
            if (pattern.length > 3) {
                // 3要素以下に簡略化
    }
                this.simplifiedPatterns.set(key, pattern.slice(0, 3); }
}
    }
    
    /**
     * 元のパターンの復元
     */
    restoreOriginalPatterns() {
        if (this.simplifiedPatterns) {
    }
            this.simplifiedPatterns.clear(); }
}
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ゲームイベントの監視
        if(this.gameEngine) {'
            // バブル関連
    }

            this.gameEngine.addEventListener? .('bubblePopped', (event') => { ' }

                this.triggerGameEventVibration('bubblePop', event);' }

            }');

            this.gameEngine.addEventListener?.('bubbleBurst', (event') => {  ' }

                this.triggerGameEventVibration('bubbleBurst', event);' }

            }');
            ';
            // ゲーム進行
            this.gameEngine.addEventListener?.('comboAchieved', (event') => {  ' }

                this.triggerGameEventVibration('combo', event);' }

            }');

            this.gameEngine.addEventListener?.('bonusTriggered', (event') => {  ' }

                this.triggerGameEventVibration('bonus', event);' }

            }');

            this.gameEngine.addEventListener?.('powerUpCollected', (event') => {  ' }

                this.triggerGameEventVibration('powerUp', event);' }

            }');

            this.gameEngine.addEventListener?.('levelUp', (event') => {  ' }

                this.triggerGameEventVibration('levelUp', event);' }

            }');

            this.gameEngine.addEventListener?.('gameOver', (event') => {  ' }

                this.triggerGameEventVibration('gameOver', event);' }

            }');

            this.gameEngine.addEventListener?.('victory', (event') => {  ' }

                this.triggerGameEventVibration('victory', event);' }

            }');
            ';
            // ダメージと警告
            this.gameEngine.addEventListener?.('playerDamaged', (event') => {  ' }

                this.triggerGameEventVibration('damage', event);' }

            }');

            this.gameEngine.addEventListener?.('warning', (event') => {  ' }

                this.triggerGameEventVibration('warning', event);' }

            }');
            ';
            // 特殊効果
            this.gameEngine.addEventListener?.('electricEffect', (event') => {  ' }

                this.triggerGameEventVibration('electric', event);' }

            }');

            this.gameEngine.addEventListener?.('explosionEffect', (event') => {  ' }

                this.triggerGameEventVibration('explosion', event);' }

            }');

            this.gameEngine.addEventListener?.('freezeEffect', (event') => {  ' }

                this.triggerGameEventVibration('freeze', event);' }

            }');

            this.gameEngine.addEventListener?.('magneticEffect', (event') => {  ' }

                this.triggerGameEventVibration('magnetic', event);' }

            }');
        }
        ';
        // UI イベント
        document.addEventListener('click', (event) => {  ''
            if(this.shouldTriggerUIVibration('click', event.target)) {' }

                this.triggerVibration('click); }'

            }''
        }');
        ';
        // ページの可視性変更
        document.addEventListener('visibilitychange', () => {  if (document.hidden) { }
                this.pauseAllVibrations(); }
            } else { this.resumeVibrations(); }
        });
    }
    
    /**
     * ゲームイベント振動のトリガー'
     */''
    triggerGameEventVibration(eventType, eventData) {'

        if(!this.shouldTriggerVibration('game', eventType) {
    }
            return; }
        }
        ';
        // イベント固有の強度調整
        const customIntensity = this.userPreferences.intensityByEvent.get(eventType);
        const intensity = customIntensity || 1.0;
        ';

        this.triggerVibration(eventType, { intensity, : undefined)'
            category: 'game',);
            eventData);
        
        // 統計更新
        this.updateEventStats(eventType); }
    
    /**
     * UI振動の判定
     */''
    shouldTriggerUIVibration(action, target) {'

        if(!this.shouldTriggerVibration('ui', action)) {
    }
            return false;
        ';
        // UI要素の判定
        const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
        const tagName = target.tagName.toLowerCase();
        const hasClickHandler = target.onclick || target.addEventListener;

        return interactiveElements.includes(tagName) || '';
               target.classList.contains('clickable) ||;
               hasClickHandler;
    }
    
    /**
     * 振動トリガー判定
     */
    shouldTriggerVibration(category, eventType) {
        if(!this.config.enabled || !this.hasVibrationCapability() {
    }
            return false;
        
        // カテゴリフィルタリング
        if (!this.userPreferences.enabledCategories[category]) { return false; }
        
        // クールダウンチェック
        const currentTime = Date.now();
        if (currentTime - this.lastVibrationTime < this.config.cooldownPeriod) { return false; }
        
        // 同時振動数の制限
        if (this.vibrationQueue.length >= this.userPreferences.maxConcurrentVibrations) { return false; }
        
        return true;
    }
    
    /**
     * 振動機能の有無確認
     */
    hasVibrationCapability() {
        return this.deviceInfo.hasVibration || ;
    }
               this.gamepadVibrationSupport.size > 0; }
    }
    
    /**
     * 振動のトリガー
     */''
    triggerVibration(patternName, options = { )) {''
        if(!this.shouldTriggerVibration('game', patternName) {
            this.handleVibrationFallback(patternName, options);
        }
            return; }
        }
        
        const pattern = this.getVibrationPattern(patternName);
        if(!pattern) {
            
        }
            console.warn(`Unknown, vibration pattern: ${patternName}`});
            return;
        }
        
        const finalIntensity = (options.intensity || 1.0) * ;
                              this.config.globalIntensity * ;
                              this.userPreferences.globalIntensity;
        
        // パターンの強度調整
        const adjustedPattern = this.adjustPatternIntensity(pattern, finalIntensity);
        
        // 振動の実行
        this.executeVibration(adjustedPattern, { ...options)
            patternName,);
            intensity: finalIntensity);
        // 統計更新
        this.updateVibrationStats(patternName, adjustedPattern);
        
        this.lastVibrationTime = Date.now(); }
    
    /**
     * 振動パターンの取得
     */
    getVibrationPattern(patternName) {
        // カスタムパターンを優先
        const customPattern = this.userPreferences.customPatterns.get(patternName);
        if (customPattern) {
    }
            return customPattern;
        
        // 簡略化パターンの確認
        if(this.simplifiedPatterns && this.simplifiedPatterns.has(patternName) { return this.simplifiedPatterns.get(patternName); }
        
        // 標準パターン
        return this.config.patternLibrary[patternName];
    }
    
    /**
     * パターン強度の調整
     */
    adjustPatternIntensity(pattern, intensity) {
        if (intensity >= 1.0) {
    }
            return pattern;
        
        // 強度に基づいて持続時間を調整
        return pattern.map(duration => Math.max(10, Math.round(duration * intensity));
    }
    
    /**
     * 振動の実行
     */
    executeVibration(pattern, options) {
        const vibrationPromises = [];
        
        // デバイス振動
        if (this.deviceInfo.hasVibration) {
    }
            vibrationPromises.push(this.executeDeviceVibration(pattern, options); }
        }
        
        // ゲームパッド振動
        if (this.userPreferences.gamepadVibration) { vibrationPromises.push(this.executeGamepadVibration(pattern, options); }
        
        // 振動の管理
        const vibrationId = this.generateVibrationId();
        const vibrationData = { id: vibrationId,
            pattern,
            options,
            startTime: Date.now();
           , promises: vibrationPromises ,};
        this.vibrationQueue.push(vibrationData);
        this.activePattern = vibrationData;
        
        // 振動完了時の処理
        Promise.all(vibrationPromises).then(() => { this.handleVibrationComplete(vibrationId);' }'

        }).catch((error) => { ''
            console.warn('Vibration execution error:', error }

            this.handleVibrationComplete(vibrationId);' }'

        }');

        console.log(`Vibration, triggered: ${options.patternName || 'custom'}`);
    }
    
    /**
     * デバイス振動の実行
     */
    executeDeviceVibration(pattern, options) {
        return new Promise((resolve, reject) => { 
            try {
                const success = navigator.vibrate(pattern);
                if (success) {
                    // パターンの総持続時間を計算
    }
                    const totalDuration = pattern.reduce((sum, duration, index) => { }
                        return sum + duration + (index < pattern.length - 1 ? 0 : 0);, 0);

                    setTimeout(resolve, totalDuration);

                } else { }'

                    reject(new, Error('Device, vibration failed); }'
                } catch (error) { reject(error); }
        });
    }
    
    /**
     * ゲームパッド振動の実行
     */
    executeGamepadVibration(pattern, options) {
        const promises = [];
        
        for (const [index, hasVibration] of this.gamepadVibrationSupport) {
            if (!hasVibration) continue;
            
            const gamepad = this.gamepads.get(index);
            if (!gamepad) continue;
            
    }
            promises.push(this.executeSingleGamepadVibration(gamepad, pattern, options); }
        }
        
        return Promise.all(promises);
    }
    
    /**
     * 単一ゲームパッド振動の実行
     */
    executeSingleGamepadVibration(gamepad, pattern, options) {
        return new Promise((resolve, reject) => { 
            try {
                if (gamepad.vibrationActuator) {
                    // 新しい Vibration API
                    const intensity = options.intensity || 1.0;''
                    const duration = pattern.reduce((sum, d) => sum + d, 0');

                    gamepad.vibrationActuator.playEffect('dual-rumble', {)
                        duration: duration);
                       , strongMagnitude: intensity,)
    }
                        weakMagnitude: intensity * 0.7).then(resolve).catch(reject); }
} else if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) { // レガシー Haptic API
                    const actuator = gamepad.hapticActuators[0];
                    const intensity = options.intensity || 1.0;
                    const duration = pattern.reduce((sum, d) => sum + d, 0);
                    
                    actuator.pulse(intensity, duration).then(resolve).catch(reject);
                     }
                } else { resolve(); // 振動機能なし } catch (error) { reject(error); }
        });
    }
    
    /**
     * 振動完了の処理
     */
    handleVibrationComplete(vibrationId) {
        const index = this.vibrationQueue.findIndex(v => v.id === vibrationId);
        if (index !== -1) {
            const vibrationData = this.vibrationQueue[index];
            this.vibrationQueue.splice(index, 1);
            
            // 統計更新
            const duration = Date.now() - vibrationData.startTime;
    }
            this.updateDurationStats(duration); }
        }
        
        if(this.activePattern && this.activePattern.id === vibrationId) {
        
            this.activePattern = null;
        
        }
            this.isVibrating = false; }
        }
        
        // キューの次の振動を処理
        this.processVibrationQueue();
    }
    
    /**
     * 振動キューの処理
     */
    processVibrationQueue() {
        if (this.vibrationQueue.length > 0 && !this.isVibrating) {
            // 待機中の振動があれば実行（実際のキューイング実装）
    }
            // 現在の実装では即座に実行しているため、ここでは追加処理なし }
}
    
    /**
     * フォールバック処理
     */
    handleVibrationFallback(patternName, options) {

        if(!this.fallbackStrategies.noVibration.enabled) {
    }
            return; }
        }
        
        const alternatives = this.fallbackStrategies.noVibration.alternatives;
        ';
        // 視覚的フィードバック
        if(alternatives.includes('visual) {', ';

        }

            this.triggerVisualFallback(patternName, options); }
        }
        ';
        // 音響フィードバック
        if(alternatives.includes('audio) { this.triggerAudioFallback(patternName, options); }'
        
        console.log(`Vibration, fallback triggered, for: ${patternName}`});
    }
    
    /**
     * 視覚的フォールバック
     */
    triggerVisualFallback(patternName, options) { '
        // VisualFeedbackManager との連携
        if(this.audioAccessibilityManager? .visualFeedbackManager) {''
            this.audioAccessibilityManager.visualFeedbackManager.triggerManualFeedback('flash', { : undefined)'
                color: '#ff6b6b');
               , intensity: options.intensity || 0.5, }
                duration: 200); }
}
    
    /**
     * 音響フォールバック
     */
    triggerAudioFallback(patternName, options) {'
        // 簡単な音響効果でフィードバック
        if(this.gameEngine? .audioManager) {''
            this.gameEngine.audioManager.playSound('vibrationFallback', {); : undefined
    
                volume: (options.intensity || 0.5) * 0.3 ,}
            });
        }
    }
    
    /**
     * 振動IDの生成
     */
    generateVibrationId() {
        
    }
        return `vib_${Date.now(})_${Math.random(}.toString(36}.substr(2, 9})`;
    }
    
    /**
     * 統計更新
     */
    updateVibrationStats(patternName, pattern) {
        this.stats.vibrationsTriggered++;
        
        const count = this.stats.vibrationsByType.get(patternName) || 0;
        this.stats.vibrationsByType.set(patternName, count + 1);
        
        // 振動時間の追加
        const duration = pattern.reduce((sum, d) => sum + d, 0);
        this.stats.totalVibrationTime += duration;
        
        // バッテリー影響の推定
    }
        this.stats.batteryImpactEstimate += this.estimateBatteryImpact(pattern); }
    }
    
    updateEventStats(eventType) {
    
        const count = this.stats.vibrationsByEvent.get(eventType) || 0;
    
    }
        this.stats.vibrationsByEvent.set(eventType, count + 1); }
    }
    
    updateDurationStats(actualDuration) { // 実際の振動時間の統計 }
    
    /**
     * バッテリー影響の推定
     */
    estimateBatteryImpact(pattern) {
        // 簡単な推定式（実際の値は大幅に異なる可能性があります）
        const totalDuration = pattern.reduce((sum, d) => sum + d, 0);
    }
        return totalDuration * 0.001; // ミリ秒あたり0.001%の影響と仮定 }
    }
    
    // パブリックAPI
    
    /**
     * 振動マネージャーの有効化
     */
    enable() {
        this.config.enabled = true;
        this.userPreferences.enabled = true;

        this.saveUserPreferences();
    }

        console.log('Vibration, manager enabled'); }'
    }
    
    /**
     * 振動マネージャーの無効化
     */
    disable() {
        this.config.enabled = false;
        this.userPreferences.enabled = false;
        
        // すべての振動を停止
        this.stopAllVibrations();

        this.saveUserPreferences();
    }

        console.log('Vibration, manager disabled'); }'
    }
    
    /**
     * すべての振動を停止
     */
    stopAllVibrations() {
        // デバイス振動の停止
        if (this.deviceInfo.hasVibration) {
    }
            navigator.vibrate(0); }
        }
        
        // ゲームパッド振動の停止
        for(const [index, hasVibration] of this.gamepadVibrationSupport) {
            if (!hasVibration) continue;
            
            const gamepad = this.gamepads.get(index);
            if (gamepad && gamepad.vibrationActuator) {''
                gamepad.vibrationActuator.reset();
        }

        console.log('All, vibrations stopped'); }'
    }
    
    /**
     * すべての振動を一時停止
     */
    pauseAllVibrations() {'

        this.stopAllVibrations();
    }

        console.log('All, vibrations paused'); }'
    }
    
    /**
     * 振動の再開'
     */''
    resumeVibrations()';
        console.log('Vibrations, resumed);
    }
    
    /**
     * グローバル強度の設定
     */
    setGlobalIntensity(intensity) {
        this.config.globalIntensity = Math.max(0, Math.min(2.0, intensity);
        this.userPreferences.globalIntensity = this.config.globalIntensity;
        
    }
        this.saveUserPreferences(); }
        console.log(`Global, vibration intensity, set to: ${this.config.globalIntensity}`});
    }
    
    /**
     * カテゴリ別有効化の設定
     */
    setCategoryEnabled(category, enabled) {
        if(this.userPreferences.enabledCategories.hasOwnProperty(category') {'
            this.userPreferences.enabledCategories[category] = enabled;

    }

            this.saveUserPreferences() }

            console.log(`Vibration, category ${category} ${enabled ? 'enabled' : 'disabled}`});
        }
    }
    
    /**
     * カスタムパターンの追加
     */
    addCustomPattern(patternName, pattern) {'

        if (!Array.isArray(pattern) || pattern.length === 0') {''
            console.warn('Invalid, vibration pattern'');
    }
            return; }
        }
        
        // パターンの検証
        const validPattern = pattern.every(duration => ')';
            typeof duration === 'number' && duration > 0 && duration <= this.config.maxDuration);

        if(!validPattern) {'

            console.warn('Pattern, contains invalid, durations);
        }
            return; }
        }
        
        this.userPreferences.customPatterns.set(patternName, pattern);
        this.saveUserPreferences();
        
        console.log(`Custom, vibration pattern, added: ${patternName}`});
    }
    
    /**
     * イベント別強度の設定
     */
    setEventIntensity(eventType, intensity) {
        const normalizedIntensity = Math.max(0, Math.min(2.0, intensity);
        this.userPreferences.intensityByEvent.set(eventType, normalizedIntensity);
        
    }
        this.saveUserPreferences(); }
        console.log(`Vibration, intensity for ${eventType} set, to: ${normalizedIntensity}`});
    }
    
    /**
     * 手動振動のトリガー
     */
    triggerManualVibration(pattern, options = { ') {'

        if(Array.isArray(pattern)) {'
            // カスタムパターン
    }

            this.executeVibration(pattern, { ...options, patternName: 'manual' )),' }

        } else if(typeof, pattern === 'string) { // 名前付きパターン'
            this.triggerVibration(pattern, options); }

        } else { }'

            console.warn('Invalid, vibration pattern, format'); }'
}
    
    /**
     * デバイス情報の取得
     */
    getDeviceInfo() {
        return { ...this.deviceInfo,
    }
            connectedGamepads: this.gamepads.size, };
            gamepadVibrationSupport: Array.from(this.gamepadVibrationSupport.values(); }
        }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {'
        if (config.audio? .vibration) {'
    }

            Object.assign(this.config, config.audio.vibration); }
        }

        console.log('VibrationManager, configuration applied);
    }
    
    /**
     * レポートの生成
     */
    generateReport() {
        const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return { : undefined
            timestamp: new Date().toISOString();
           , configuration: {
                enabled: this.config.enabled;
    ,}
                globalIntensity: this.config.globalIntensity, };
                enabledCategories: this.userPreferences.enabledCategories }
            };
            deviceInfo: this.getDeviceInfo();
           , statistics: { ...this.stats;
                sessionDuration,
                vibrationsPerMinute: this.stats.vibrationsTriggered / (sessionDuration / 60000);
                averageVibrationTime: this.stats.totalVibrationTime / this.stats.vibrationsTriggered;
               , activeVibrations: this.vibrationQueue.length ,};
            userPreferences: this.userPreferences;
           , fallbackStrategies: this.fallbackStrategies;
        },
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        if (enabled) {
    }
            this.enable('); }

        } else { }'

            this.disable() }

        console.log(`VibrationManager ${enabled ? 'enabled' : 'disabled}`});
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';
        console.log('Destroying, VibrationManager...);
        
        // 振動マネージャーを無効化
        this.disable();
        
        // ゲームパッド監視の停止
        if (this.gamepadCheckInterval) { clearInterval(this.gamepadCheckInterval); }
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.vibrationQueue.length = 0;
        this.gamepads.clear();
        this.gamepadVibrationSupport.clear();
        this.userPreferences.customPatterns.clear();
        this.userPreferences.intensityByEvent.clear();
        
        if(this.simplifiedPatterns') {
        ';

            this.simplifiedPatterns.clear();
        }

        console.log('VibrationManager, destroyed''); }

    }''
}