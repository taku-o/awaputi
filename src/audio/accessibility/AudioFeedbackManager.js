/**
 * Audio Feedback Manager
 * 
 * 視覚通知・ユーザーフィードバック機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Color-coded audio level indicators
 * - Haptic feedback integration (vibration patterns)
 * - VibrationManager integration and coordination
 * - Audio level monitoring and visualization
 * 
 * @module AudioFeedbackManager
 * Created: Phase G.2 (Issue #103)
 */

export class AudioFeedbackManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // VibrationManagerとの連携
        this.vibrationManager = null;
        
        // 音響強度の色彩表現
        this.colorIndicator = null;
        this.colorMappings = {
            low: { color: '#00ff00', label: '低音量' },
            medium: { color: '#ffff00', label: '中音量' },
            high: { color: '#ff8000', label: '高音量' },
            critical: { color: '#ff0000', label: '最大音量' }
        };
        
        // 触覚フィードバック設定
        this.hapticSettings = {
            enabled: false,
            vibrationIntensity: 0.8,
            audioToVibrationMapping: {
                bubblePop: 'bubblePop',
                comboAchieved: 'combo',
                achievementUnlocked: 'bonus',
                gameStateChange: {
                    gameOver: 'gameOver',
                    levelUp: 'levelUp',
                    warning: 'warning'
                },
                backgroundMusic: 'heartbeat', // BGMのリズムに合わせた振動
                specialEffects: {
                    electric: 'electric',
                    explosion: 'explosion',
                    freeze: 'freeze',
                    magnetic: 'magnetic'
                }
            }
        };
    }

    /**
     * 色彩インジケーターを作成
     */
    createColorIndicator() {
        this.colorIndicator = document.createElement('div');
        this.colorIndicator.className = 'audio-accessibility-color-indicator';
        this.colorIndicator.style.cssText = `
            position: fixed;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            width: 30px;
            height: 200px;
            background: linear-gradient(to top, #00ff00, #ffff00, #ff8000, #ff0000);
            border: 2px solid #ffffff;
            border-radius: 15px;
            z-index: 10000;
            display: none;
            transition: all 0.3s ease;
        `;
        this.colorIndicator.setAttribute('role', 'progressbar');
        this.colorIndicator.setAttribute('aria-label', '音響レベルインジケーター');
        
        // インジケーター内にレベル表示を追加
        const levelIndicator = document.createElement('div');
        levelIndicator.className = 'level-marker';
        levelIndicator.style.cssText = `
            position: absolute;
            left: -5px;
            width: 40px;
            height: 4px;
            background-color: #ffffff;
            border-radius: 2px;
            transition: bottom 0.1s ease;
            bottom: 0px;
        `;
        this.colorIndicator.appendChild(levelIndicator);
        
        document.body.appendChild(this.colorIndicator);
    }

    /**
     * 色彩インジケーターを更新
     * @param {number} level - 音響レベル (0-1)
     */
    updateColorIndicator(level) {
        if (!this.colorIndicator || !this.mainController.settings.colorIndication) return;
        
        const levelMarker = this.colorIndicator.querySelector('.level-marker');
        if (levelMarker) {
            const position = level * 196; // 200px - 4px (marker height)
            levelMarker.style.bottom = `${position}px`;
        }
        
        // アクセシビリティ属性を更新
        this.colorIndicator.setAttribute('aria-valuenow', Math.round(level * 100));
        this.colorIndicator.setAttribute('aria-valuetext', `音響レベル ${Math.round(level * 100)}%`);
    }

    /**
     * VibrationManagerを初期化
     */
    initializeVibrationManager() {
        // VibrationManagerのインスタンスを遅延初期化
        if (this.mainController.audioManager?.accessibilityManager?.vibrationManager) {
            this.vibrationManager = this.mainController.audioManager.accessibilityManager.vibrationManager;
        } else {
            // AudioManagerまたはAccessibilityManagerが存在しない場合は動的にインポート
            this.loadVibrationManager();
        }
    }

    /**
     * VibrationManagerを動的に読み込み
     * @private
     */
    async loadVibrationManager() {
        try {
            const { VibrationManager } = await import('../../core/VibrationManager.js');
            this.vibrationManager = new VibrationManager(this);
            this.updateVibrationManagerSettings();
            console.log('VibrationManager loaded dynamically');
        } catch (error) {
            console.warn('Failed to load VibrationManager:', error);
            this.mainController.settings.hapticFeedback = false; // フォールバック
        }
    }

    /**
     * VibrationManagerの設定を更新
     */
    updateVibrationManagerSettings() {
        if (!this.vibrationManager) return;
        
        this.vibrationManager.setEnabled(this.hapticSettings.enabled);
        this.vibrationManager.setGlobalIntensity(this.hapticSettings.vibrationIntensity);
        
        // アクセシビリティモードを有効化
        if (this.vibrationManager.userPreferences) {
            this.vibrationManager.userPreferences.accessibilityEnhanced = true;
        }
    }

    /**
     * 触覚フィードバックをトリガー
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    triggerHapticFeedback(eventType, eventData) {
        if (!this.vibrationManager || !this.hapticSettings.enabled) {
            return;
        }
        
        try {
            const mapping = this.hapticSettings.audioToVibrationMapping[eventType];
            
            if (typeof mapping === 'string') {
                // 直接マッピング
                this.vibrationManager.triggerVibration(mapping, {
                    intensity: this.hapticSettings.vibrationIntensity,
                    category: 'accessibility',
                    eventData: eventData
                });
            } else if (typeof mapping === 'object' && eventData.state) {
                // 状態ベースマッピング（gameStateChangeなど）
                const stateMapping = mapping[eventData.state];
                if (stateMapping) {
                    this.vibrationManager.triggerVibration(stateMapping, {
                        intensity: this.hapticSettings.vibrationIntensity,
                        category: 'accessibility',
                        eventData: eventData
                    });
                }
            }
            
            console.log(`Haptic feedback triggered for: ${eventType}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'ACCESSIBILITY_ERROR', {
                component: 'AudioFeedbackManager',
                operation: 'triggerHapticFeedback',
                eventType: eventType
            });
        }
    }

    /**
     * 音響レベルに基づく触覚フィードバック
     * @param {number} audioLevel - 音響レベル (0-1)
     * @param {string} audioType - 音響タイプ
     */
    triggerAudioLevelVibration(audioLevel, audioType = 'general') {
        if (!this.vibrationManager || !this.hapticSettings.enabled) {
            return;
        }
        
        // 音響レベルが一定以上の場合のみ振動
        if (audioLevel < 0.3) return;
        
        try {
            // 音響レベルに応じた振動パターンを生成
            let vibrationPattern;
            
            if (audioLevel < 0.5) {
                vibrationPattern = 'pulse'; // 弱いパルス
            } else if (audioLevel < 0.8) {
                vibrationPattern = 'heartbeat'; // 心拍パターン
            } else {
                vibrationPattern = 'wave'; // 波パターン
            }
            
            this.vibrationManager.triggerVibration(vibrationPattern, {
                intensity: audioLevel * this.hapticSettings.vibrationIntensity,
                category: 'accessibility',
                eventData: { audioLevel, audioType }
            });
        } catch (error) {
            console.warn('Failed to trigger audio level vibration:', error);
        }
    }

    /**
     * BGMのリズムに合わせた振動
     * @param {Object} rhythmData - リズムデータ
     */
    synchronizeWithBGMRhythm(rhythmData) {
        if (!this.vibrationManager || !this.hapticSettings.enabled) {
            return;
        }

        try {
            // BGMのBPM（Beats Per Minute）に基づいて振動パターンを生成
            const { bpm, intensity, beat } = rhythmData;
            
            if (bpm && beat) {
                const vibrationDuration = Math.max(50, Math.min(200, (60000 / bpm) * 0.1)); // BPMベースの長さ
                
                this.vibrationManager.triggerVibration('heartbeat', {
                    intensity: intensity * this.hapticSettings.vibrationIntensity,
                    duration: vibrationDuration,
                    category: 'accessibility',
                    eventData: rhythmData
                });
            }
        } catch (error) {
            console.warn('Failed to synchronize with BGM rhythm:', error);
        }
    }

    /**
     * 特殊効果の振動をトリガー
     * @param {string} effectType - 効果タイプ
     * @param {Object} effectData - 効果データ
     */
    triggerSpecialEffectVibration(effectType, effectData) {
        if (!this.vibrationManager || !this.hapticSettings.enabled) {
            return;
        }

        try {
            const specialEffectMapping = this.hapticSettings.audioToVibrationMapping.specialEffects[effectType];
            
            if (specialEffectMapping) {
                this.vibrationManager.triggerVibration(specialEffectMapping, {
                    intensity: this.hapticSettings.vibrationIntensity,
                    category: 'accessibility',
                    eventData: effectData
                });
                
                console.log(`Special effect vibration triggered for: ${effectType}`);
            }
        } catch (error) {
            console.warn('Failed to trigger special effect vibration:', error);
        }
    }

    /**
     * 触覚フィードバック設定を更新
     * @param {Object} settings - 新しい設定
     */
    updateHapticSettings(settings) {
        Object.assign(this.hapticSettings, settings);
        this.updateVibrationManagerSettings();
        
        console.log('Haptic settings updated:', this.hapticSettings);
    }

    /**
     * 色彩インジケーターの表示状態を更新
     * @param {boolean} show - 表示するかどうか
     */
    updateColorIndicatorVisibility(show) {
        if (!this.colorIndicator) return;
        
        this.colorIndicator.style.display = show ? 'block' : 'none';
    }

    /**
     * リソースの解放
     */
    dispose() {
        // DOM要素を削除
        if (this.colorIndicator && this.colorIndicator.parentNode) {
            this.colorIndicator.parentNode.removeChild(this.colorIndicator);
        }
        
        // VibrationManagerの解放
        if (this.vibrationManager && typeof this.vibrationManager.destroy === 'function') {
            this.vibrationManager.destroy();
        }
        
        this.vibrationManager = null;
    }
}