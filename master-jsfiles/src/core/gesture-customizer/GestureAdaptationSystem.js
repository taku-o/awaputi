/**
 * GestureAdaptationSystem - 適応学習システム
 * 
 * ユーザープロファイル、適応学習、片手操作、フィードバックを専門的に管理します
 */
export class GestureAdaptationSystem {
    constructor(config, gameEngine) {
        this.config = config;
        this.gameEngine = gameEngine;
        
        // 入力適応システム
        this.adaptationSystem = {
            learningEnabled: true,
            userProfile: {
                dominantHand: 'right', // 'left', 'right', 'both'
                reachability: 'normal', // 'limited', 'normal', 'extended'
                precision: 'normal',    // 'low', 'normal', 'high'
                speed: 'normal',        // 'slow', 'normal', 'fast'
                endurance: 'normal'     // 'low', 'normal', 'high'
            },
            adaptiveThresholds: {
                errorRate: 0.1,
                successRate: 0.9,
                responseTime: 1000,
                gestureCompletion: 0.8
            },
            suggestions: []
        };
        
        // ユーザー設定
        this.userPreferences = {
            oneHandedMode: false,
            preferredHand: 'right',
            gestureComplexity: 'normal', // 'simple', 'normal', 'advanced'
            touchSensitivity: 1.0,
            gestureTimeout: 1000,
            visualFeedback: true,
            audioFeedback: true,
            hapticFeedback: true,
            customGestures: new Map(),
            disabledGestures: new Set(),
            alternativeBindings: new Map()
        };
        
        // 統計情報
        this.stats = {
            gesturesRecognized: 0,
            gesturesByType: new Map(),
            successfulGestures: 0,
            failedGestures: 0,
            averageGestureTime: 0,
            customizationChanges: 0,
            adaptationTriggers: 0,
            sessionStart: Date.now()
        };
        
        // フィードバック関連
        this.feedbackElements = new Set();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        // ユーザー設定の読み込み
        this.loadUserPreferences();
        
        // ユーザープロファイルの初期化
        this.initializeUserProfile();
        
        console.log('GestureAdaptationSystem initialized');
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('gestureCustomizer_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // Map/Set の復元
                if (preferences.customGestures) {
                    this.userPreferences.customGestures = new Map(preferences.customGestures);
                }
                if (preferences.disabledGestures) {
                    this.userPreferences.disabledGestures = new Set(preferences.disabledGestures);
                }
                if (preferences.alternativeBindings) {
                    this.userPreferences.alternativeBindings = new Map(preferences.alternativeBindings);
                }
                
                // 設定を適用
                this.applyUserPreferences();
            }
        } catch (error) {
            console.warn('Failed to load gesture customizer preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                customGestures: Array.from(this.userPreferences.customGestures.entries()),
                disabledGestures: Array.from(this.userPreferences.disabledGestures),
                alternativeBindings: Array.from(this.userPreferences.alternativeBindings.entries())
            };
            
            localStorage.setItem('gestureCustomizer_preferences', 
                JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save gesture customizer preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の適用
     */
    applyUserPreferences() {
        // 基本設定
        this.config.oneHandedMode = this.userPreferences.oneHandedMode;
        this.config.touchSensitivity = this.userPreferences.touchSensitivity;
        
        // 片手モードの適応
        if (this.userPreferences.oneHandedMode) {
            this.enableOneHandedMode(this.userPreferences.preferredHand);
        }
        
        // ジェスチャー複雑度の適応
        this.adaptGestureComplexity(this.userPreferences.gestureComplexity);
    }
    
    /**
     * ユーザープロファイルの初期化
     */
    initializeUserProfile() {
        // 既存の統計から推測
        this.analyzeUserBehavior();
        
        // 適応的閾値の設定
        this.setAdaptiveThresholds();
        
        console.log('User profile initialized:', this.adaptationSystem.userProfile);
    }
    
    /**
     * ユーザー行動の分析
     */
    analyzeUserBehavior() {
        // 統計データから利き手を推測
        // 画面上の操作位置分析
        // ジェスチャーの成功率分析
        // 反応時間の分析
        
        console.log('Analyzing user behavior patterns...');
    }
    
    /**
     * 適応的閾値の設定
     */
    setAdaptiveThresholds() {
        const profile = this.adaptationSystem.userProfile;
        
        // 精度に基づく閾値調整
        if (profile.precision === 'low') {
            this.adaptationSystem.adaptiveThresholds.errorRate = 0.2;
            this.adaptationSystem.adaptiveThresholds.gestureCompletion = 0.6;
        } else if (profile.precision === 'high') {
            this.adaptationSystem.adaptiveThresholds.errorRate = 0.05;
            this.adaptationSystem.adaptiveThresholds.gestureCompletion = 0.95;
        }
        
        // 速度に基づく閾値調整
        if (profile.speed === 'slow') {
            this.adaptationSystem.adaptiveThresholds.responseTime = 2000;
        } else if (profile.speed === 'fast') {
            this.adaptationSystem.adaptiveThresholds.responseTime = 500;
        }
    }
    
    /**
     * 適応学習の更新
     */
    updateAdaptiveLearning(gestureName, gestureData, success) {
        if (!this.adaptationSystem.learningEnabled) return;
        
        // 成功/失敗パターンの学習
        this.learnGesturePattern(gestureName, gestureData, success);
        
        // ユーザープロファイルの更新
        this.updateUserProfile(gestureData, success);
        
        // 適応的閾値の調整
        this.adjustAdaptiveThresholds(success);
        
        // 改善提案の生成
        this.generateImprovementSuggestions();
        
        // 統計更新
        this.updateGestureStats(gestureName, success);
    }
    
    /**
     * ジェスチャーパターンの学習
     */
    learnGesturePattern(gestureName, gestureData, success) {
        // 成功したパターンを記録
        if (success) {
            // 閾値の微調整は上位で実行
            console.log(`Learning successful pattern for: ${gestureName}`);
        }
    }
    
    /**
     * ユーザープロファイルの更新
     */
    updateUserProfile(gestureData, success) {
        const profile = this.adaptationSystem.userProfile;
        
        // 精度の更新
        if (gestureData.distance < 10) {
            profile.precision = 'high';
        } else if (gestureData.distance > 50) {
            profile.precision = 'low';
        }
        
        // 速度の更新
        if (gestureData.duration < 200) {
            profile.speed = 'fast';
        } else if (gestureData.duration > 1000) {
            profile.speed = 'slow';
        }
        
        // 利き手の推測（タッチ位置から）
        if (gestureData.startPosition) {
            const screenWidth = window.innerWidth;
            if (gestureData.startPosition.x > screenWidth * 0.6) {
                profile.dominantHand = 'right';
            } else if (gestureData.startPosition.x < screenWidth * 0.4) {
                profile.dominantHand = 'left';
            }
        }
    }
    
    /**
     * 適応的閾値の調整
     */
    adjustAdaptiveThresholds(success) {
        const thresholds = this.adaptationSystem.adaptiveThresholds;
        
        if (success) {
            // 成功率が高い場合、より厳しい基準に
            thresholds.successRate = Math.min(0.95, thresholds.successRate + 0.01);
        } else {
            // 失敗が続く場合、基準を緩和
            thresholds.errorRate = Math.min(0.3, thresholds.errorRate + 0.01);
        }
    }
    
    /**
     * 改善提案の生成
     */
    generateImprovementSuggestions() {
        const suggestions = [];
        const profile = this.adaptationSystem.userProfile;
        
        // 精度が低い場合の提案
        if (profile.precision === 'low') {
            suggestions.push({
                type: 'precision',
                message: 'ジェスチャーをよりゆっくりと正確に行うことをお勧めします',
                action: 'adjustSensitivity'
            });
        }
        
        // 速度が遅い場合の提案
        if (profile.speed === 'slow') {
            suggestions.push({
                type: 'speed',
                message: '簡単なジェスチャーモードに切り替えることをお勧めします',
                action: 'enableSimpleMode'
            });
        }
        
        // 片手操作の提案
        if (profile.reachability === 'limited') {
            suggestions.push({
                type: 'accessibility',
                message: '片手操作モードを有効にすることをお勧めします',
                action: 'enableOneHanded'
            });
        }
        
        this.adaptationSystem.suggestions = suggestions;
    }
    
    /**
     * ジェスチャー複雑度の適応
     */
    adaptGestureComplexity(complexity) {
        switch (complexity) {
            case 'simple':
                this.enableSimpleGestures();
                break;
            case 'advanced':
                this.enableAdvancedGestures();
                break;
            case 'normal':
            default:
                this.enableNormalGestures();
                break;
        }
    }
    
    /**
     * 簡単なジェスチャーの有効化
     */
    enableSimpleGestures() {
        // 複雑なマルチタッチを無効化
        this.config.alternativeGestures.singleFingerOnly = true;
        
        // 滞留アクティベーションを有効化
        this.config.alternativeGestures.dwellActivation = true;
        
        console.log('Simple gesture mode enabled');
    }
    
    /**
     * 通常ジェスチャーの有効化
     */
    enableNormalGestures() {
        // バランスの取れた設定
        this.config.alternativeGestures.singleFingerOnly = false;
        this.config.alternativeGestures.dwellActivation = false;
        
        console.log('Normal gesture mode enabled');
    }
    
    /**
     * 高度なジェスチャーの有効化
     */
    enableAdvancedGestures() {
        // すべてのジェスチャーを有効化
        this.config.alternativeGestures.singleFingerOnly = false;
        this.config.alternativeGestures.simplifiedMode = false;
        
        // カスタムジェスチャーの推奨
        this.suggestAdvancedGestures();
        
        console.log('Advanced gesture mode enabled');
    }
    
    /**
     * 高度なジェスチャーの提案
     */
    suggestAdvancedGestures() {
        console.log('Suggesting advanced gesture options...');
    }
    
    /**
     * 片手操作モードの有効化
     */
    enableOneHandedMode(preferredHand = 'right') {
        this.config.oneHandedMode = true;
        this.userPreferences.oneHandedMode = true;
        this.userPreferences.preferredHand = preferredHand;
        
        // UIの調整
        this.adjustUIForOneHanded(preferredHand);
        
        console.log(`One-handed mode enabled for ${preferredHand} hand`);
    }
    
    /**
     * 片手操作モードの無効化
     */
    disableOneHandedMode() {
        this.config.oneHandedMode = false;
        this.userPreferences.oneHandedMode = false;
        
        // UIを元に戻す
        this.resetUILayout();
        
        console.log('One-handed mode disabled');
    }
    
    /**
     * UIの片手操作調整
     */
    adjustUIForOneHanded(preferredHand) {
        // UI要素を操作しやすい位置に移動
        const uiElements = document.querySelectorAll('[data-ui-adjustable]');
        
        uiElements.forEach(element => {
            if (preferredHand === 'right') {
                element.style.transform = 'translateX(-20%)';
            } else {
                element.style.transform = 'translateX(20%)';
            }
            element.classList.add('one-handed-adjusted');
        });
    }
    
    /**
     * UIレイアウトのリセット
     */
    resetUILayout() {
        const uiElements = document.querySelectorAll('[data-ui-adjustable]');
        
        uiElements.forEach(element => {
            element.style.transform = '';
            element.classList.remove('one-handed-adjusted');
        });
    }
    
    /**
     * ジェスチャーフィードバックの提供
     */
    provideGestureFeedback(gestureName, gestureData) {
        // 視覚フィードバック
        if (this.userPreferences.visualFeedback) {
            this.showVisualFeedback(gestureName, gestureData);
        }
        
        // 音声フィードバック
        if (this.userPreferences.audioFeedback) {
            this.playGestureFeedbackSound(gestureName);
        }
        
        // 触覚フィードバック
        if (this.userPreferences.hapticFeedback) {
            this.triggerHapticFeedback(gestureName);
        }
    }
    
    /**
     * 視覚フィードバックの表示
     */
    showVisualFeedback(gestureName, gestureData) {
        // 一時的な視覚効果
        const feedback = document.createElement('div');
        feedback.className = 'gesture-feedback';
        feedback.textContent = gestureName;
        feedback.style.cssText = `
            position: fixed;
            left: ${gestureData.endPosition.x}px;
            top: ${gestureData.endPosition.y}px;
            background: rgba(0, 255, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            animation: fadeOut 1s ease-out forwards;
        `;
        
        document.body.appendChild(feedback);
        this.feedbackElements.add(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
                this.feedbackElements.delete(feedback);
            }
        }, 1000);
    }
    
    /**
     * 予測フィードバックの提供
     */
    providePredictiveFeedback(prediction) {
        if (!this.userPreferences.visualFeedback) return;
        
        const feedback = document.createElement('div');
        feedback.className = 'gesture-prediction';
        feedback.textContent = `${prediction.gesture}?`;
        feedback.style.cssText = `
            position: fixed;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            background: rgba(255, 165, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(feedback);
        this.feedbackElements.add(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
                this.feedbackElements.delete(feedback);
            }
        }, 500);
    }
    
    /**
     * 未認識ジェスチャーのフィードバック
     */
    provideUnrecognizedGestureFeedback() {
        if (!this.userPreferences.visualFeedback) return;
        
        const feedback = document.createElement('div');
        feedback.className = 'gesture-unrecognized';
        feedback.textContent = 'ジェスチャーを認識できませんでした';
        feedback.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(feedback);
        this.feedbackElements.add(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
                this.feedbackElements.delete(feedback);
            }
        }, 2000);
    }
    
    /**
     * ジェスチャー音声フィードバック
     */
    playGestureFeedbackSound(gestureName) {
        if (this.gameEngine?.audioManager) {
            const soundMap = {
                'tap': 'gesture_tap',
                'swipe': 'gesture_swipe',
                'pinch': 'gesture_pinch',
                'longPress': 'gesture_long'
            };
            
            const soundId = soundMap[gestureName] || 'gesture_generic';
            this.gameEngine.audioManager.playSound(soundId, { volume: 0.3 });
        }
    }
    
    /**
     * 触覚フィードバック
     */
    triggerHapticFeedback(gestureName) {
        if (navigator.vibrate) {
            const vibrationPatterns = {
                'tap': [50],
                'longPress': [100, 50, 100],
                'swipe': [30, 10, 30],
                'pinch': [80]
            };
            
            const pattern = vibrationPatterns[gestureName] || [50];
            navigator.vibrate(pattern);
        }
    }
    
    /**
     * 未認識ジェスチャーの記録
     */
    recordUnrecognizedGesture(gestureData) {
        // 学習データとして保存
        const unrecognizedData = {
            timestamp: Date.now(),
            gestureData: gestureData,
            userProfile: { ...this.adaptationSystem.userProfile }
        };
        
        // LocalStorageに保存（簡略化）
        const saved = JSON.parse(localStorage.getItem('unrecognized_gestures') || '[]');
        saved.push(unrecognizedData);
        
        // 最大100件まで保持
        if (saved.length > 100) {
            saved.splice(0, saved.length - 100);
        }
        
        localStorage.setItem('unrecognized_gestures', JSON.stringify(saved));
    }
    
    /**
     * ジェスチャー代替案の提案
     */
    suggestGestureAlternatives(gestureData) {
        console.log('Suggesting gesture alternatives based on:', gestureData);
        
        // 類似パターンの提案
        if (gestureData.type === 'touch' && gestureData.duration > 500) {
            console.log('Consider using a long press gesture');
        }
        
        if (gestureData.distance > 100) {
            console.log('Consider using a swipe gesture');
        }
    }
    
    /**
     * ジェスチャー統計の更新
     */
    updateGestureStats(gestureName, success) {
        this.stats.gesturesRecognized++;
        
        if (success) {
            this.stats.successfulGestures++;
        } else {
            this.stats.failedGestures++;
        }
        
        const count = this.stats.gesturesByType.get(gestureName) || 0;
        this.stats.gesturesByType.set(gestureName, count + 1);
    }
    
    /**
     * 設定の更新
     */
    updateUserPreferences(newPreferences) {
        Object.assign(this.userPreferences, newPreferences);
        this.saveUserPreferences();
        this.applyUserPreferences();
        
        console.log('User preferences updated');
    }
    
    /**
     * ユーザープロファイルの取得
     */
    getUserProfile() {
        return this.adaptationSystem.userProfile;
    }
    
    /**
     * ユーザー設定の取得
     */
    getUserPreferences() {
        return this.userPreferences;
    }
    
    /**
     * 統計情報の取得
     */
    getStats() {
        return this.stats;
    }
    
    /**
     * 適応システムの状態取得
     */
    getAdaptationStatus() {
        return {
            learningEnabled: this.adaptationSystem.learningEnabled,
            userProfile: this.adaptationSystem.userProfile,
            adaptiveThresholds: this.adaptationSystem.adaptiveThresholds,
            suggestions: this.adaptationSystem.suggestions,
            oneHandedMode: this.userPreferences.oneHandedMode,
            gestureComplexity: this.userPreferences.gestureComplexity
        };
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // UI調整のリセット
        this.resetUILayout();
        
        // フィードバック要素の削除
        this.feedbackElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.feedbackElements.clear();
        
        // データのクリア
        this.userPreferences.customGestures.clear();
        this.userPreferences.disabledGestures.clear();
        this.userPreferences.alternativeBindings.clear();
        this.stats.gesturesByType.clear();
        
        console.log('GestureAdaptationSystem destroyed');
    }
}