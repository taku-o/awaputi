/**
 * TimingFeedbackSystem
 * ユーザーフィードバック収集、パフォーマンス監視、フィードバック分析、ユーザーガイダンス
 */
export class TimingFeedbackSystem {
    constructor(timingAdjustmentManager) {
        this.manager = timingAdjustmentManager;
        this.gameEngine = timingAdjustmentManager.gameEngine;
        this.config = timingAdjustmentManager.config;
        this.state = timingAdjustmentManager.state;
        this.timers = timingAdjustmentManager.timers;
        this.adaptiveLearning = timingAdjustmentManager.adaptiveLearning;
        
        console.log('[TimingFeedbackSystem] Component initialized');
    }
    
    /**
     * 時間警告を表示
     */
    showTimeWarning(timerId) {
        const timer = this.timers.active.get(timerId);
        if (!timer) return;
        
        const profile = this.manager.getCurrentProfile();
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
            this.manager.algorithms.scheduleAutoExtension(timerId);
        }
    }
    
    /**
     * 視覚的警告を表示
     */
    showVisualWarning(timerId, remainingTime) {
        const timer = this.timers.active.get(timerId);
        const profile = this.manager.getCurrentProfile();
        
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
                this.manager.algorithms.extendTimer(timerId);
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
     * 適応提案を表示
     */
    suggestAdaptation(type, averageResponseTime) {
        const currentProfile = this.manager.getCurrentProfile();
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
            this.manager.algorithms.applyProfile(suggestedProfile);
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
     * プロファイル変更を提案
     */
    suggestProfileChange(recommendedProfile) {
        const profile = this.config.profiles[recommendedProfile];
        
        // 非侵入的な提案を表示
        console.log(`TimingFeedbackSystem: 「${profile.name}」プロファイルを推奨します`);
        
        // 設定画面で推奨マークを表示するためのイベント
        this.manager.emitEvent('profileRecommendation', {
            recommended: recommendedProfile,
            current: this.state.currentProfile
        });
    }
    
    /**
     * 時間調整設定を開く
     */
    openTimingSettings() {
        // 設定UI表示のイベントを発火
        this.manager.emitEvent('openTimingSettings', {
            currentProfile: this.state.currentProfile,
            availableProfiles: Object.keys(this.config.profiles)
        });
    }
    
    /**
     * フィードバック収集
     */
    collectUserFeedback(feedbackType, data) {
        const feedbackEntry = {
            type: feedbackType,
            timestamp: Date.now(),
            currentProfile: this.state.currentProfile,
            data: data
        };
        
        // フィードバックデータを保存
        const existingFeedback = JSON.parse(localStorage.getItem('timingAdjustmentFeedback') || '[]');
        existingFeedback.push(feedbackEntry);
        
        // 最新100件のみ保持
        if (existingFeedback.length > 100) {
            existingFeedback.splice(0, existingFeedback.length - 100);
        }
        
        localStorage.setItem('timingAdjustmentFeedback', JSON.stringify(existingFeedback));
        
        console.log(`TimingFeedbackSystem: フィードバック収集 - ${feedbackType}`);
        return feedbackEntry;
    }
    
    /**
     * フィードバック分析
     */
    analyzeFeedback() {
        const feedbackData = JSON.parse(localStorage.getItem('timingAdjustmentFeedback') || '[]');
        
        if (feedbackData.length === 0) {
            return {
                totalFeedback: 0,
                summary: 'No feedback data available'
            };
        }
        
        // フィードバックタイプ別の分析
        const typeAnalysis = {};
        feedbackData.forEach(feedback => {
            typeAnalysis[feedback.type] = (typeAnalysis[feedback.type] || 0) + 1;
        });
        
        // 最近のフィードバック（過去7日間）
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentFeedback = feedbackData.filter(f => f.timestamp >= sevenDaysAgo);
        
        // プロファイル別の分析
        const profileAnalysis = {};
        feedbackData.forEach(feedback => {
            profileAnalysis[feedback.currentProfile] = (profileAnalysis[feedback.currentProfile] || 0) + 1;
        });
        
        return {
            totalFeedback: feedbackData.length,
            recentFeedback: recentFeedback.length,
            typeAnalysis,
            profileAnalysis,
            mostCommonType: Object.keys(typeAnalysis).reduce((a, b) => typeAnalysis[a] > typeAnalysis[b] ? a : b),
            trends: this.identifyFeedbackTrends(feedbackData)
        };
    }
    
    /**
     * フィードバックトレンドを特定
     */
    identifyFeedbackTrends(feedbackData) {
        const trends = {
            increasing: [],
            decreasing: [],
            stable: []
        };
        
        // 週単位でのトレンド分析
        const weeklyData = {};
        feedbackData.forEach(feedback => {
            const week = Math.floor(feedback.timestamp / (7 * 24 * 60 * 60 * 1000));
            weeklyData[week] = (weeklyData[week] || 0) + 1;
        });
        
        const weeks = Object.keys(weeklyData).map(Number).sort((a, b) => a - b);
        if (weeks.length >= 3) {
            const recent = weeklyData[weeks[weeks.length - 1]];
            const previous = weeklyData[weeks[weeks.length - 2]];
            const beforePrevious = weeklyData[weeks[weeks.length - 3]];
            
            if (recent > previous && previous > beforePrevious) {
                trends.increasing.push('overall_feedback');
            } else if (recent < previous && previous < beforePrevious) {
                trends.decreasing.push('overall_feedback');
            } else {
                trends.stable.push('overall_feedback');
            }
        }
        
        return trends;
    }
    
    /**
     * パフォーマンス監視メトリクスを取得
     */
    getPerformanceMetrics() {
        return {
            warningCount: this.state.warningStates.size,
            extensionRequests: this.adaptiveLearning.data.extensionRequests,
            pauseFrequency: this.adaptiveLearning.data.pauseFrequency,
            averageResponseTime: this.state.userInteractionData.averageResponseTime,
            feedbackAnalysis: this.analyzeFeedback(),
            systemLoad: this.calculateSystemLoad()
        };
    }
    
    /**
     * システム負荷を計算
     */
    calculateSystemLoad() {
        const activeTimers = this.timers.active.size;
        const pausedTimers = this.timers.paused.size;
        const totalTimers = activeTimers + pausedTimers;
        
        // 簡単な負荷指標（0-1）
        const timerLoad = Math.min(totalTimers / 50, 1.0); // 50タイマーで100%
        const warningLoad = Math.min(this.state.warningStates.size / 10, 1.0); // 10警告で100%
        
        return {
            overall: (timerLoad + warningLoad) / 2,
            timers: timerLoad,
            warnings: warningLoad,
            status: this.getLoadStatus((timerLoad + warningLoad) / 2)
        };
    }
    
    /**
     * 負荷状態を取得
     */
    getLoadStatus(load) {
        if (load <= 0.3) return 'low';
        if (load <= 0.6) return 'medium';
        if (load <= 0.8) return 'high';
        return 'critical';
    }
    
    /**
     * ユーザーガイダンスを生成
     */
    generateUserGuidance() {
        const metrics = this.getPerformanceMetrics();
        const guidance = [];
        
        // 高い延長要求率への対応
        if (metrics.extensionRequests > 5) {
            guidance.push({
                type: 'profile_recommendation',
                message: 'より長いタイミング設定のプロファイルをお勧めします',
                action: 'consider_motor_or_cognitive_profile'
            });
        }
        
        // 高い一時停止頻度への対応
        if (metrics.pauseFrequency > 10) {
            guidance.push({
                type: 'usage_pattern',
                message: '頻繁な一時停止が検出されました。自動一時停止設定を確認してください',
                action: 'check_auto_pause_settings'
            });
        }
        
        // レスポンス時間の問題
        if (metrics.averageResponseTime > 3000) {
            guidance.push({
                type: 'performance_concern',
                message: 'レスポンス時間が長くなっています。システム負荷を確認してください',
                action: 'optimize_system_performance'
            });
        }
        
        // システム負荷の警告
        if (metrics.systemLoad.overall > 0.8) {
            guidance.push({
                type: 'system_load',
                message: 'システム負荷が高くなっています。不要なタイマーを削除することをお勧めします',
                action: 'cleanup_timers'
            });
        }
        
        return guidance;
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        // UI要素のクリーンアップ
        const warningElements = document.querySelectorAll('.timing-warning, .extension-feedback, .adaptation-suggestion');
        warningElements.forEach(element => element.remove());
        
        // スタイルシートの削除
        const styleSheet = document.getElementById('timing-warning-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
        
        console.log('[TimingFeedbackSystem] Component destroyed');
    }
}