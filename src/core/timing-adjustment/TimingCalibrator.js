/**
 * TimingCalibrator
 * タイミングキャリブレーション、データ収集、精度測定
 */
export class TimingCalibrator {
    constructor(timingAdjustmentManager) {
        this.manager = timingAdjustmentManager;
        this.gameEngine = timingAdjustmentManager.gameEngine;
        this.config = timingAdjustmentManager.config;
        this.state = timingAdjustmentManager.state;
        this.adaptiveLearning = timingAdjustmentManager.adaptiveLearning;
        
        console.log('[TimingCalibrator] Component initialized');
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
            this.manager.suggestAdaptation(recommendedAdjustment, averageRecent);
        }
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
     * アクセシビリティ設定変更を処理
     */
    handleAccessibilitySettingsChange(settings) {
        const recommendedProfile = this.getRecommendedProfile(settings);
        
        if (recommendedProfile !== this.state.currentProfile) {
            // 自動適用するかユーザーに確認
            if (this.config.autoAdjustment) {
                this.manager.applyProfile(recommendedProfile);
            } else {
                this.manager.suggestProfileChange(recommendedProfile);
            }
        }
    }
    
    /**
     * 動作軽減への対応
     */
    adjustForReducedMotion() {
        // アニメーション時間を延長
        const currentProfile = this.manager.getCurrentProfile();
        currentProfile.customTimeouts.animation = 2.0;
        currentProfile.customTimeouts.transition = 1.5;
        
        console.log('TimingCalibrator: 動作軽減に対応したタイミング調整を適用');
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
            this.manager.suggestProfileChange(recommendedProfile);
        }
    }
    
    /**
     * キャリブレーションデータの検証
     */
    validateCalibrationData() {
        const data = this.adaptiveLearning.data;
        const issues = [];
        
        // データの整合性チェック
        if (data.userResponseTimes.length === 0) {
            issues.push('No response time data available');
        }
        
        if (data.extensionRequests < 0) {
            issues.push('Invalid extension request count');
        }
        
        if (data.pauseFrequency < 0) {
            issues.push('Invalid pause frequency');
        }
        
        // レスポンス時間の異常値チェック
        const recentResponses = this.state.userInteractionData.recentResponses;
        if (recentResponses.length > 0) {
            const times = recentResponses.map(r => r.time);
            const average = times.reduce((a, b) => a + b, 0) / times.length;
            const outliers = times.filter(time => Math.abs(time - average) > average * 2);
            
            if (outliers.length > times.length * 0.3) {
                issues.push('High number of response time outliers detected');
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            dataQuality: this.calculateDataQuality()
        };
    }
    
    /**
     * データ品質を計算
     */
    calculateDataQuality() {
        const recentResponses = this.state.userInteractionData.recentResponses;
        
        if (recentResponses.length === 0) {
            return { score: 0, description: 'No data available' };
        }
        
        const dataSize = recentResponses.length;
        const maxSize = 50;
        const sizeScore = Math.min(dataSize / maxSize, 1.0);
        
        // 時間の一貫性をチェック
        const times = recentResponses.map(r => r.time);
        const average = times.reduce((a, b) => a + b, 0) / times.length;
        const variance = times.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 1 - (stdDev / average));
        
        // 総合スコア
        const overallScore = (sizeScore * 0.3 + consistencyScore * 0.7);
        
        let description;
        if (overallScore >= 0.8) {
            description = 'Excellent';
        } else if (overallScore >= 0.6) {
            description = 'Good';
        } else if (overallScore >= 0.4) {
            description = 'Fair';
        } else {
            description = 'Poor';
        }
        
        return {
            score: overallScore,
            description,
            details: {
                dataSize: dataSize,
                sizeScore,
                consistencyScore,
                standardDeviation: stdDev
            }
        };
    }
    
    /**
     * キャリブレーション統計を取得
     */
    getCalibrationStatistics() {
        const validation = this.validateCalibrationData();
        const recentResponses = this.state.userInteractionData.recentResponses;
        
        let stats = {
            validation,
            totalInteractions: recentResponses.length,
            averageResponseTime: this.state.userInteractionData.averageResponseTime,
            adaptationHistory: this.adaptiveLearning.data.userResponseTimes.slice(-20),
            currentThresholds: { ...this.adaptiveLearning.thresholds }
        };
        
        if (recentResponses.length > 0) {
            const times = recentResponses.map(r => r.time);
            stats.responseTimeRange = {
                min: Math.min(...times),
                max: Math.max(...times),
                median: this.calculateMedian(times)
            };
        }
        
        return stats;
    }
    
    /**
     * 中央値を計算
     */
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        } else {
            return sorted[middle];
        }
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        console.log('[TimingCalibrator] Component destroyed');
    }
}