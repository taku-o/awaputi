/**
 * Audio Cue Manager Component
 * 
 * 音響キューの生成・パターン認識を担当
 * AudioAccessibilitySupport のサブコンポーネント
 */

export class AudioCueManager {
    constructor(mainController) {
        this.mainController = mainController;
        
        // 音響キュー設定
        this.cueSettings = {
            enabled: false,
            spatialAudio: false,
            frequencyMapping: true,
            intensityMapping: true,
            rhythmMapping: false
        };
        
        // パターン認識設定
        this.patternRecognition = {
            enabled: false,
            patterns: new Map(),
            currentPattern: null,
            patternTimeout: null,
            learningMode: false
        };
        
        // 音響から触覚へマッピング
        this.audioToTactileMapping = {
            bubblePop: {
                frequency: 100,
                duration: 150,
                intensity: 0.6,
                pattern: 'short'
            },
            comboAchieved: {
                frequency: 200,
                duration: 300,
                intensity: 0.8,
                pattern: 'double'
            },
            achievementUnlocked: {
                frequency: 50,
                duration: 500,
                intensity: 1.0,
                pattern: 'celebration'
            },
            gameStateChange: {
                gameOver: {
                    frequency: 30,
                    duration: 1000,
                    intensity: 0.9,
                    pattern: 'fade'
                },
                levelUp: {
                    frequency: 300,
                    duration: 400,
                    intensity: 0.9,
                    pattern: 'ascending'
                },
                warning: {
                    frequency: 400,
                    duration: 200,
                    intensity: 0.7,
                    pattern: 'urgent'
                }
            },
            backgroundMusic: {
                frequency: 40,
                duration: 'continuous',
                intensity: 0.3,
                pattern: 'heartbeat'
            },
            specialEffects: {
                electric: {
                    frequency: 250,
                    duration: 100,
                    intensity: 0.8,
                    pattern: 'rapid'
                },
                explosion: {
                    frequency: 80,
                    duration: 600,
                    intensity: 1.0,
                    pattern: 'explosion'
                },
                freeze: {
                    frequency: 150,
                    duration: 200,
                    intensity: 0.4,
                    pattern: 'freeze'
                }
            }
        };
        
        // キューキャッシュ
        this.cueCache = new Map();
        this.maxCacheSize = 50;
        
        // パターン履歴
        this.patternHistory = [];
        this.maxPatternHistory = 20;
        
        this.initializePatterns();
    }

    /**
     * パターンの初期化
     */
    initializePatterns() {
        // 一般的なゲームパターンを事前定義
        this.patternRecognition.patterns.set('combo_buildup', {
            sequence: ['bubblePop', 'bubblePop', 'bubblePop'],
            timeWindow: 2000,
            description: 'コンボ構築中',
            response: 'increasing_intensity'
        });
        
        this.patternRecognition.patterns.set('rapid_fire', {
            sequence: ['bubblePop', 'bubblePop', 'bubblePop', 'bubblePop'],
            timeWindow: 1000,
            description: 'ラピッドファイア',
            response: 'rapid_vibration'
        });
        
        this.patternRecognition.patterns.set('special_sequence', {
            sequence: ['specialEffects.electric', 'bubblePop', 'comboAchieved'],
            timeWindow: 3000,
            description: '特殊効果シーケンス',
            response: 'special_pattern'
        });
    }

    /**
     * 音響イベントを処理してキューに変換
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     * @param {Object} audioData - 音響データ
     */
    processAudioEvent(eventType, eventData = {}, audioData = {}) {
        if (!this.cueSettings.enabled) {
            return;
        }

        // 音響データを解析
        const analysisResult = this.analyzeAudioData(audioData);
        
        // キューの生成
        const cue = this.generateCue(eventType, eventData, analysisResult);
        
        // パターン認識の実行
        if (this.patternRecognition.enabled) {
            this.processPatternRecognition(eventType, eventData);
        }
        
        // キューを適用
        this.applyCue(cue);
        
        // キャッシュに保存
        this.cacheCue(eventType, cue);
    }

    /**
     * 音響データの解析
     * @param {Object} audioData - 音響データ
     * @returns {Object} 解析結果
     */
    analyzeAudioData(audioData) {
        const analysis = {
            frequency: 0,
            amplitude: 0,
            duration: 0,
            spatialPosition: { x: 0, y: 0 },
            characteristics: []
        };

        if (audioData.frequency) {
            analysis.frequency = audioData.frequency;
            
            // 周波数特性の分析
            if (audioData.frequency < 100) {
                analysis.characteristics.push('low_frequency');
            } else if (audioData.frequency > 1000) {
                analysis.characteristics.push('high_frequency');
            } else {
                analysis.characteristics.push('mid_frequency');
            }
        }

        if (audioData.amplitude) {
            analysis.amplitude = audioData.amplitude;
            
            // 音量レベルの分類
            if (audioData.amplitude > 0.8) {
                analysis.characteristics.push('loud');
            } else if (audioData.amplitude < 0.3) {
                analysis.characteristics.push('quiet');
            } else {
                analysis.characteristics.push('normal');
            }
        }

        if (audioData.duration) {
            analysis.duration = audioData.duration;
        }

        if (audioData.position) {
            analysis.spatialPosition = audioData.position;
        }

        return analysis;
    }

    /**
     * キューの生成
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     * @param {Object} analysis - 音響解析結果
     * @returns {Object} 生成されたキュー
     */
    generateCue(eventType, eventData, analysis) {
        // キャッシュから既存のキューを検索
        const cacheKey = `${eventType}_${JSON.stringify(eventData)}`;
        const cachedCue = this.cueCache.get(cacheKey);
        
        if (cachedCue) {
            return this.adaptCueToAnalysis(cachedCue, analysis);
        }

        // 基本マッピングから取得
        const baseMapping = this.getBaseMappingForEvent(eventType);
        if (!baseMapping) {
            return this.generateDefaultCue(eventType, analysis);
        }

        // 解析結果を適用してキューを調整
        const adaptedCue = this.adaptCueToAnalysis(baseMapping, analysis);
        
        return {
            id: this.generateCueId(),
            eventType: eventType,
            timestamp: Date.now(),
            ...adaptedCue,
            metadata: {
                originalEvent: eventData,
                analysis: analysis
            }
        };
    }

    /**
     * イベントタイプの基本マッピング取得
     * @param {string} eventType - イベントタイプ
     * @returns {Object|null} 基本マッピング
     */
    getBaseMappingForEvent(eventType) {
        // ネストされたオブジェクトへのパスを処理
        const parts = eventType.split('.');
        let mapping = this.audioToTactileMapping;
        
        for (const part of parts) {
            if (mapping && typeof mapping === 'object' && mapping[part]) {
                mapping = mapping[part];
            } else {
                return null;
            }
        }
        
        return mapping;
    }

    /**
     * 解析結果に基づくキュー調整
     * @param {Object} baseCue - 基本キュー
     * @param {Object} analysis - 解析結果
     * @returns {Object} 調整されたキュー
     */
    adaptCueToAnalysis(baseCue, analysis) {
        const adaptedCue = { ...baseCue };

        // 周波数マッピング
        if (this.cueSettings.frequencyMapping && analysis.frequency > 0) {
            adaptedCue.frequency = Math.max(
                adaptedCue.frequency * (analysis.frequency / 440), // A4を基準に調整
                20 // 最小周波数
            );
        }

        // 強度マッピング
        if (this.cueSettings.intensityMapping && analysis.amplitude > 0) {
            adaptedCue.intensity = Math.min(
                adaptedCue.intensity * analysis.amplitude,
                1.0 // 最大強度
            );
        }

        // 空間位置の適用
        if (this.cueSettings.spatialAudio && analysis.spatialPosition) {
            adaptedCue.spatialPosition = analysis.spatialPosition;
        }

        return adaptedCue;
    }

    /**
     * デフォルトキューの生成
     * @param {string} eventType - イベントタイプ
     * @param {Object} analysis - 解析結果
     * @returns {Object} デフォルトキュー
     */
    generateDefaultCue(eventType, analysis) {
        return {
            frequency: analysis.frequency || 100,
            duration: analysis.duration || 200,
            intensity: analysis.amplitude || 0.5,
            pattern: 'default'
        };
    }

    /**
     * キューの適用
     * @param {Object} cue - 適用するキュー
     */
    applyCue(cue) {
        // メインコントローラーのフィードバックマネージャーに委譲
        if (this.mainController.feedbackManager) {
            this.mainController.feedbackManager.applyTactileFeedback(cue);
        }
        
        // 直接実装の場合のフォールバック
        this.applyDirectCue(cue);
    }

    /**
     * 直接キュー適用（フォールバック）
     * @param {Object} cue - キュー
     */
    applyDirectCue(cue) {
        // Vibration API を使用した触覚フィードバック
        if ('vibrate' in navigator && cue.pattern !== 'continuous') {
            const vibrationPattern = this.convertToVibrationPattern(cue);
            navigator.vibrate(vibrationPattern);
        }
    }

    /**
     * 振動パターンへの変換
     * @param {Object} cue - キュー
     * @returns {Array} 振動パターン
     */
    convertToVibrationPattern(cue) {
        const baseIntensity = Math.round(cue.intensity * 255);
        const duration = cue.duration;

        switch (cue.pattern) {
            case 'short':
                return [duration];
            case 'double':
                return [duration / 2, 100, duration / 2];
            case 'rapid':
                return [50, 50, 50, 50, 50, 50];
            case 'celebration':
                return [100, 50, 150, 50, 100, 50, 200];
            case 'urgent':
                return [200, 100, 200, 100, 200];
            default:
                return [duration];
        }
    }

    /**
     * パターン認識の処理
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    processPatternRecognition(eventType, eventData) {
        // 履歴に追加
        this.patternHistory.push({
            eventType: eventType,
            timestamp: Date.now(),
            data: eventData
        });

        // 履歴サイズの制限
        if (this.patternHistory.length > this.maxPatternHistory) {
            this.patternHistory.shift();
        }

        // パターンマッチング
        this.checkPatternMatches();
    }

    /**
     * パターンマッチングの確認
     */
    checkPatternMatches() {
        const currentTime = Date.now();

        for (const [patternName, pattern] of this.patternRecognition.patterns.entries()) {
            if (this.matchesPattern(pattern, currentTime)) {
                this.handlePatternMatch(patternName, pattern);
            }
        }
    }

    /**
     * キューのキャッシュ
     * @param {string} eventType - イベントタイプ
     * @param {Object} cue - キュー
     */
    cacheCue(eventType, cue) {
        const cacheKey = `${eventType}_${Date.now()}`;
        
        // キャッシュサイズの制限
        if (this.cueCache.size >= this.maxCacheSize) {
            const firstKey = this.cueCache.keys().next().value;
            this.cueCache.delete(firstKey);
        }
        
        this.cueCache.set(cacheKey, cue);
    }

    /**
     * 設定の更新
     * @param {Object} newSettings - 新しい設定
     */
    updateSettings(newSettings) {
        Object.assign(this.cueSettings, newSettings);
        
        if (newSettings.patternRecognition !== undefined) {
            this.patternRecognition.enabled = newSettings.patternRecognition;
        }
    }

    /**
     * 状態の取得
     * @returns {Object} 現在の状態
     */
    getStatus() {
        return {
            enabled: this.cueSettings.enabled,
            patternRecognitionEnabled: this.patternRecognition.enabled,
            cacheSize: this.cueCache.size,
            patternHistorySize: this.patternHistory.length,
            currentPattern: this.patternRecognition.currentPattern,
            settings: { ...this.cueSettings }
        };
    }

    /**
     * キューIDの生成
     * @returns {string} ユニークなID
     */
    generateCueId() {
        return `cue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * パターンマッチングの判定
     * @param {Object} pattern - パターン定義
     * @param {number} currentTime - 現在時刻
     * @returns {boolean} マッチするかどうか
     */
    matchesPattern(pattern, currentTime) {
        const sequence = pattern.sequence;
        const timeWindow = pattern.timeWindow;
        
        if (this.patternHistory.length < sequence.length) {
            return false;
        }
        
        // 時間窓内の最新のイベントを確認
        const recentEvents = this.patternHistory.filter(event => 
            currentTime - event.timestamp <= timeWindow
        );
        
        if (recentEvents.length < sequence.length) {
            return false;
        }
        
        // シーケンスマッチング
        const lastEvents = recentEvents.slice(-sequence.length);
        
        for (let i = 0; i < sequence.length; i++) {
            if (lastEvents[i].eventType !== sequence[i]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * パターンマッチ時の処理
     * @param {string} patternName - パターン名
     * @param {Object} pattern - パターン定義
     */
    handlePatternMatch(patternName, pattern) {
        console.log(`Pattern matched: ${patternName}`);
        
        // パターン応答の実行
        if (pattern.response) {
            this.executePatternResponse(pattern.response, patternName);
        }
        
        // 現在のパターンを更新
        this.patternRecognition.currentPattern = patternName;
        
        // タイムアウト設定
        if (this.patternRecognition.patternTimeout) {
            clearTimeout(this.patternRecognition.patternTimeout);
        }
        
        this.patternRecognition.patternTimeout = setTimeout(() => {
            this.patternRecognition.currentPattern = null;
        }, 5000);
    }

    /**
     * パターン応答の実行
     * @param {string} responseType - 応答タイプ
     * @param {string} patternName - パターン名
     */
    executePatternResponse(responseType, patternName) {
        // 応答タイプに基づく処理の実装
        switch (responseType) {
            case 'increasing_intensity':
                // 段階的に強度を上げる振動
                navigator.vibrate([100, 50, 150, 50, 200]);
                break;
            case 'rapid_vibration':
                // 高速振動
                navigator.vibrate([50, 25, 50, 25, 50, 25, 50, 25]);
                break;
            case 'special_pattern':
                // 特殊パターン
                navigator.vibrate([200, 100, 100, 100, 300]);
                break;
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.cueCache.clear();
        this.patternHistory = [];
        
        if (this.patternRecognition.patternTimeout) {
            clearTimeout(this.patternRecognition.patternTimeout);
        }
    }
}