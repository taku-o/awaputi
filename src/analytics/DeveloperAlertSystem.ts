/**
 * 開発者向けアラートシステム
 * 異常なプレイパターンや開発上の問題を検出し、開発者に通知
 */

export class DeveloperAlertSystem {
    private _dataCollector: any;
    private _trendAnalyzer: any;
    private options: any;
    private alertHistory: any[];
    private alertCategories: Map<string, any>;
    private alertFilters: Map<string, any>;
    private alertCallbacks: Map<string, any>;
    private severityLevels: string[];
    private rateLimitCounter: Map<string, any>;

    constructor(dataCollector: any, trendAnalyzer: any, options: any = {}) {
        this._dataCollector = dataCollector;
        this._trendAnalyzer = trendAnalyzer;
        this.options = {
            enableDeveloperAlerts: true,
            enableConsoleLogging: true,
            enableEmailNotifications: false,
            enableWebhookNotifications: false,
            minSeverityLevel: 'warning', // info, warning, error, critical
            alertRetentionDays: 30,
            webhookUrl: null,
            emailEndpoint: null,
            maxAlertsPerHour: 10,
            ...options
        };

        this.alertHistory = [];
        this.alertCategories = new Map();
        this.alertFilters = new Map();
        this.alertCallbacks = new Map();
        this.severityLevels = ['info', 'warning', 'error', 'critical'];
        this.rateLimitCounter = new Map();

        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        this.setupAlertCategories();
        this.setupAlertFilters();
        this.setupEventListeners();
        this.scheduleCleanup();
    }

    /**
     * アラートカテゴリの設定
     */
    setupAlertCategories() {
        this.alertCategories.set('gameplay', {
            name: '異常なゲームプレイ',
            description: 'プレイヤーの異常なゲームプレイパターン',
            icon: '🎮',
            color: '#2196f3',
            defaultSeverity: 'warning',
            checks: [
                'unusualScoreProgression',
                'abnormalSessionLength',
                'repetitiveActions',
                'impossibleAchievements'
            ]
        });

        this.alertCategories.set('performance', {
            name: 'パフォーマンス問題',
            description: 'ゲームパフォーマンスの問題',
            icon: '⚡',
            color: '#ff9800',
            defaultSeverity: 'error',
            checks: [
                'lowFrameRate',
                'highMemoryUsage',
                'longLoadTimes',
                'frequentErrors'
            ]
        });

        this.alertCategories.set('security', {
            name: 'セキュリティ問題',
            description: 'セキュリティに関する問題',
            icon: '🛡️',
            color: '#f44336',
            defaultSeverity: 'critical',
            checks: [
                'suspiciousActivity',
                'dataManipulation',
                'unauthorizedAccess',
                'injectionAttempts'
            ]
        });

        this.alertCategories.set('data', {
            name: 'データ異常',
            description: 'データ収集・処理の異常',
            icon: '📊',
            color: '#9c27b0',
            defaultSeverity: 'warning',
            checks: [
                'dataInconsistency',
                'missingData',
                'corruptedData',
                'unexpectedDataPatterns'
            ]
        });

        this.alertCategories.set('business', {
            name: 'ビジネス指標',
            description: 'ビジネス上重要な指標の変化',
            icon: '💼',
            color: '#607d8b',
            defaultSeverity: 'info',
            checks: [
                'userEngagementDrop',
                'retentionRateChange',
                'conversionRateChange',
                'abnormalChurnRate'
            ]
        });
    }

    /**
     * アラートフィルターの設定
     */
    setupAlertFilters() {
        this.alertFilters.set('severity', (alert: any) => {
            const minLevel = this.severityLevels.indexOf(this.options.minSeverityLevel);
            const alertLevel = this.severityLevels.indexOf(alert.severity);
            return alertLevel >= minLevel;
        });

        // レート制限フィルター
        this.alertFilters.set('rateLimit', (alert: any) => {
            const now = Date.now();
            const hourStart = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000);
            const key = `${alert.category}_${hourStart}`;
            
            const count = this.rateLimitCounter.get(key) || 0;
            if (count >= this.options.maxAlertsPerHour) {
                return false;
            }
            
            this.rateLimitCounter.set(key, count + 1);
            return true;
        });

        // 重複アラートフィルター
        this.alertFilters.set('duplicate', (alert: any) => {
            const recentAlerts = this.alertHistory.filter(a => 
                a.category === alert.category &&
                a.checkType === alert.checkType &&
                (Date.now() - a.timestamp) < 60000 // 1分以内
            );
            return recentAlerts.length === 0;
        });
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        (window as any).addEventListener('analytics-data-updated', (event: CustomEvent) => {
            this.analyzeData(event.detail);
        });

        // パフォーマンス警告イベント
        (window as any).addEventListener('performance-warning', (event: CustomEvent) => {
            this.handlePerformanceWarning(event.detail);
        });

        // エラーイベント
        (window as any).addEventListener('error-notification-displayed', (event: CustomEvent) => {
            this.handleErrorEvent(event.detail);
        });
    }

    /**
     * データ分析とアラート生成
     */
    analyzeData(data: any) {
        if (!this.options.enableDeveloperAlerts) return;

        for (const [categoryName, category] of Array.from(this.alertCategories.entries())) {
            for (const checkType of category.checks) {
                const result = this.runCheck(categoryName, checkType, data);
                if (result.shouldAlert) {
                    this.generateAlert({
                        category: categoryName,
                        checkType: checkType,
                        severity: result.severity || category.defaultSeverity,
                        message: result.message,
                        data: result.alertData,
                        recommendations: result.recommendations || []
                    });
                }
            }
        }
    }

    /**
     * 個別チェックの実行
     */
    runCheck(category: any, checkType: any, data: any) {
        switch (`${category}.${checkType}`) {
            case 'gameplay.unusualScoreProgression':
                return this.checkUnusualScoreProgression(data);
            case 'gameplay.abnormalSessionLength':
                return this.checkAbnormalSessionLength(data);
            case 'gameplay.repetitiveActions':
                return this.checkRepetitiveActions(data);
            case 'gameplay.impossibleAchievements':
                return this.checkImpossibleAchievements(data);
            case 'performance.lowFrameRate':
                return this.checkLowFrameRate(data);
            case 'performance.highMemoryUsage':
                return this.checkHighMemoryUsage(data);
            case 'performance.longLoadTimes':
                return this.checkLongLoadTimes(data);
            case 'performance.frequentErrors':
                return this.checkFrequentErrors(data);
            case 'security.suspiciousActivity':
                return this.checkSuspiciousActivity(data);
            case 'security.dataManipulation':
                return this.checkDataManipulation(data);
            case 'data.dataInconsistency':
                return this.checkDataInconsistency(data);
            case 'data.missingData':
                return this.checkMissingData(data);
            case 'business.userEngagementDrop':
                return this.checkUserEngagementDrop(data);
            case 'business.retentionRateChange':
                return this.checkRetentionRateChange(data);
            default:
                return { shouldAlert: false };
        }
    }

    /**
     * 異常なスコア進行のチェック
     */
    checkUnusualScoreProgression(data: any) {
        if (!data.playerBehavior?.sessionData) return { shouldAlert: false };
        
        const sessions = data.playerBehavior.sessionData.slice(-10); // 最新10セッション
        if (sessions.length < 3) return { shouldAlert: false };
        
        const scoreProgression = sessions.map((s: any) => s.totalScore || 0);
        const avgIncrease = this.calculateAverageIncrease(scoreProgression);
        
        // 異常に急激なスコア上昇を検出
        if (avgIncrease > 10000) {
            // 通常の10倍以上のスコア上昇
            return {
                shouldAlert: true,
                severity: 'warning',
                message: `異常に急激なスコア上昇が検出されました (平均上昇: ${avgIncrease.toFixed(0)})`,
                alertData: {
                    avgIncrease,
                    recentScores: scoreProgression.slice(-5)
                },
                recommendations: [
                    'プレイヤーのゲームプレイログを確認してください',
                    'チート検出システムの見直しを検討してください',
                    'スコア計算ロジックに問題がないか確認してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 異常なセッション長のチェック
     */
    checkAbnormalSessionLength(data: any) {
        if (!data.playerBehavior?.sessionData) return { shouldAlert: false };
        
        const recentSessions = data.playerBehavior.sessionData.slice(-5);
        const avgDuration = recentSessions.reduce((sum: any, s: any) => sum + (s.duration || 0), 0) / recentSessions.length;
        
        // 24時間以上の連続プレイ
        if (avgDuration > 24 * 60 * 60 * 1000) {
            return {
                shouldAlert: true,
                severity: 'warning',
                message: `異常に長いセッション時間が検出されました (平均: ${(avgDuration / (60 * 60 * 1000)).toFixed(1)}時間)`,
                alertData: {
                    avgDuration,
                    sessionCount: recentSessions.length
                },
                recommendations: [
                    'プレイヤーの健康を考慮した休憩提案システムの実装を検討してください',
                    'セッション時間の制限機能の追加を検討してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 繰り返し動作のチェック
     */
    checkRepetitiveActions(data: any) {
        if (!data.gameBalance?.bubbleInteractions) return { shouldAlert: false };
        
        const interactions = data.gameBalance.bubbleInteractions;
        const actionPatterns = this.analyzeActionPatterns(interactions.slice(-100)); // 最新100アクション
        
        if (actionPatterns.repetitiveScore > 0.8) {
            // 80%以上が繰り返しパターン
            return {
                shouldAlert: true,
                severity: 'info',
                message: `繰り返し動作パターンが検出されました (スコア: ${actionPatterns.repetitiveScore.toFixed(2)})`,
                alertData: {
                    patterns: actionPatterns.patterns,
                    score: actionPatterns.repetitiveScore
                },
                recommendations: [
                    'ボット行動の可能性があります',
                    'ゲームプレイの多様性を高める施策を検討してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 不可能な実績のチェック
     */
    checkImpossibleAchievements(data: any) {
        if (!data.playerBehavior?.achievementData) return { shouldAlert: false };
        
        const achievements = data.playerBehavior.achievementData;
        const impossibleAchievements = this.detectImpossibleAchievements(achievements);
        
        if (impossibleAchievements.length > 0) {
            return {
                shouldAlert: true,
                severity: 'critical',
                message: `不可能な実績取得が検出されました (${impossibleAchievements.length}件)`,
                alertData: { impossibleAchievements },
                recommendations: [
                    '実績システムの検証ロジックを確認してください',
                    'データ整合性チェックを強化してください',
                    'チート対策の見直しが必要です'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 低フレームレートのチェック
     */
    checkLowFrameRate(data: any) {
        if (!data.performance?.frameRate) return { shouldAlert: false };
        
        const avgFPS = data.performance.frameRate.average;
        
        if (avgFPS < 20) {
            // 20FPS未満
            return {
                shouldAlert: true,
                severity: 'error',
                message: `深刻なパフォーマンス問題: 平均FPS ${avgFPS.toFixed(1)}`,
                alertData: {
                    avgFPS,
                    minFPS: data.performance.frameRate.min
                },
                recommendations: [
                    'パフォーマンス最適化が必要です',
                    'エフェクト品質の自動調整を検討してください',
                    'ハードウェア要件の見直しが必要かもしれません'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 高メモリ使用量のチェック
     */
    checkHighMemoryUsage(data: any) {
        if (!data.performance?.memoryUsage) return { shouldAlert: false };
        
        const memoryUsage = data.performance.memoryUsage.current;
        
        if (memoryUsage > 500 * 1024 * 1024) {
            // 500MB以上
            return {
                shouldAlert: true,
                severity: 'warning',
                message: `高メモリ使用量: ${(memoryUsage / (1024 * 1024)).toFixed(1)}MB`,
                alertData: {
                    memoryUsage,
                    trend: data.performance.memoryUsage.trend
                },
                recommendations: [
                    'メモリリークの可能性があります',
                    'オブジェクトプールの効率性を確認してください',
                    'ガベージコレクションの最適化を検討してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 長いロード時間のチェック
     */
    checkLongLoadTimes(data: any) {
        if (!data.performance?.loadTimes) return { shouldAlert: false };
        
        const avgLoadTime = data.performance.loadTimes.average;
        
        if (avgLoadTime > 5000) {
            // 5秒以上
            return {
                shouldAlert: true,
                severity: 'warning',
                message: `長いロード時間: ${(avgLoadTime / 1000).toFixed(1)}秒`,
                alertData: {
                    avgLoadTime,
                    maxLoadTime: data.performance.loadTimes.max
                },
                recommendations: [
                    'アセットの最適化が必要です',
                    '遅延読み込みの実装を検討してください',
                    'CDN使用の検討をしてください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 頻繁なエラーのチェック
     */
    checkFrequentErrors(data: any) {
        if (!data.errors?.errorRate) return { shouldAlert: false };
        
        const errorRate = data.errors.errorRate; // エラー/分
        
        if (errorRate > 1) {
            // 1分間に1エラー以上
            return {
                shouldAlert: true,
                severity: 'error',
                message: `高いエラー発生率: ${errorRate.toFixed(2)} エラー/分`,
                alertData: {
                    errorRate,
                    commonErrors: data.errors.mostCommon || []
                },
                recommendations: [
                    'エラーログの詳細調査が必要です',
                    'エラーハンドリングの改善を検討してください',
                    '品質保証プロセスの見直しが必要です'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * 疑わしい活動のチェック
     */
    checkSuspiciousActivity(data: any) {
        if (!data.security?.activityLog) return { shouldAlert: false };
        
        const suspiciousPatterns = this.analyzeSuspiciousPatterns(data.security.activityLog);
        
        if (suspiciousPatterns.riskScore > 0.7) {
            return {
                shouldAlert: true,
                severity: 'critical',
                message: `疑わしい活動が検出されました (リスクスコア: ${suspiciousPatterns.riskScore.toFixed(2)})`,
                alertData: {
                    patterns: suspiciousPatterns.patterns,
                    riskScore: suspiciousPatterns.riskScore
                },
                recommendations: [
                    'セキュリティチームに即座に報告してください',
                    'アクセスログの詳細調査が必要です',
                    'セキュリティ対策の強化を検討してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * データ操作のチェック
     */
    checkDataManipulation(data: any) {
        if (!data.security?.dataIntegrity) return { shouldAlert: false };
        
        const integrityIssues = data.security.dataIntegrity.issues || [];
        
        if (integrityIssues.length > 0) {
            return {
                shouldAlert: true,
                severity: 'critical',
                message: `データ整合性の問題が検出されました (${integrityIssues.length}件)`,
                alertData: { issues: integrityIssues },
                recommendations: [
                    'データベースの整合性チェックを実行してください',
                    'バックアップからの復旧を検討してください',
                    'セキュリティインシデントとして調査してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * データ不整合のチェック
     */
    checkDataInconsistency(data: any) {
        if (!data.validation?.inconsistencies) return { shouldAlert: false };
        
        const inconsistencies = data.validation.inconsistencies;
        
        if (inconsistencies.length > 5) {
            // 5つ以上の不整合
            return {
                shouldAlert: true,
                severity: 'warning',
                message: `データ不整合が多数検出されました (${inconsistencies.length}件)`,
                alertData: {
                    inconsistencies: inconsistencies.slice(0, 10) // 最初の10件のみ
                },
                recommendations: [
                    'データ検証ロジックの見直しが必要です',
                    'データクリーニング処理を実行してください',
                    'データ収集プロセスの改善を検討してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * データ欠損のチェック
     */
    checkMissingData(data: any) {
        const requiredFields = ['playerBehavior', 'gameBalance', 'performance'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            return {
                shouldAlert: true,
                severity: 'error',
                message: `必須データが欠損しています: ${missingFields.join(', ')}`,
                alertData: {
                    missingFields,
                    dataKeys: Object.keys(data)
                },
                recommendations: [
                    'データ収集システムの状態を確認してください',
                    'データパイプラインのエラーログを調査してください',
                    'バックアップデータからの復旧を検討してください'
                ]
            };
        }
        
        return { shouldAlert: false };
    }

    /**
     * ユーザーエンゲージメント低下のチェック
     */
    checkUserEngagementDrop(data: any) {
        if (!data.business?.engagement) return { shouldAlert: false };
        
        const currentEngagement = data.business.engagement.current;
        const previousEngagement = data.business.engagement.previous;
        
        if (previousEngagement > 0) {
            const changePercent = ((currentEngagement - previousEngagement) / previousEngagement) * 100;
            
            if (changePercent < -20) { // 20%以上の低下
                return {
                    shouldAlert: true,
                    severity: 'warning',
                    message: `ユーザーエンゲージメントが大幅に低下しました (${changePercent.toFixed(1)}%)`,
                    alertData: {
                        changePercent,
                        current: currentEngagement,
                        previous: previousEngagement
                    },
                    recommendations: [
                        'ユーザーフィードバックの分析が必要です',
                        '新機能の効果測定を行ってください',
                        'ユーザー体験の改善施策を検討してください'
                    ]
                };
            }
        }
        
        return { shouldAlert: false };
    }

    /**
     * リテンション率変化のチェック
     */
    checkRetentionRateChange(data: any) {
        if (!data.business?.retention) return { shouldAlert: false };
        
        const currentRetention = data.business.retention.current;
        const previousRetention = data.business.retention.previous;
        
        if (previousRetention > 0) {
            const changePercent = ((currentRetention - previousRetention) / previousRetention) * 100;
            
            if (changePercent < -15) { // 15%以上の低下
                return {
                    shouldAlert: true,
                    severity: 'error',
                    message: `ユーザーリテンション率が大幅に低下しました (${changePercent.toFixed(1)}%)`,
                    alertData: {
                        changePercent,
                        current: currentRetention,
                        previous: previousRetention
                    },
                    recommendations: [
                        'チャーン分析を実施してください',
                        'ユーザーオンボーディングプロセスの見直しが必要です',
                        'プロダクトマーケットフィットの再検証を検討してください'
                    ]
                };
            }
        }
        
        return { shouldAlert: false };
    }

    /**
     * アラートの生成
     */
    generateAlert(alertData: any) {
        const alert = {
            id: this.generateAlertId(),
            timestamp: Date.now(),
            status: 'new',
            acknowledged: false,
            ...alertData
        };
        
        // フィルターチェック
        if (!this.passesFilters(alert)) {
            return null;
        }
        
        // アラート履歴に追加
        this.alertHistory.unshift(alert);
        this.trimAlertHistory();
        
        // 通知送信
        this.sendAlert(alert);
        
        // コールバック実行
        this.executeCallbacks(alert);
        
        return alert;
    }

    /**
     * フィルターチェック
     */
    passesFilters(alert: any) {
        for (const [_name, filter] of Array.from(this.alertFilters.entries())) {
            if (!filter(alert)) {
                return false;
            }
        }
        return true;
    }

    /**
     * アラート送信
     */
    sendAlert(alert: any) {
        // コンソールログ
        if (this.options.enableConsoleLogging) {
            this.logToConsole(alert);
        }
        
        // ウェブフック通知
        if (this.options.enableWebhookNotifications && this.options.webhookUrl) {
            this.sendWebhookNotification(alert);
        }
        
        // メール通知
        if (this.options.enableEmailNotifications && this.options.emailEndpoint) {
            this.sendEmailNotification(alert);
        }
    }

    /**
     * コンソールログ出力
     */
    logToConsole(alert: any) {
        const category = this.alertCategories.get(alert.category);
        const emoji = category?.icon || '🔔';
        const color = this.getSeverityColor(alert.severity);
        
        console.group(`${emoji} [${alert.severity.toUpperCase()}] ${alert.message}`);
        console.log(`%cカテゴリ: ${category?.name || alert.category}`, `color: ${color}`);
        console.log(`%cチェック: ${alert.checkType}`, `color: ${color}`);
        console.log(`%c時刻: ${new Date(alert.timestamp).toLocaleString()}`, `color: ${color}`);
        
        if (alert.data) {
            console.log('データ:', alert.data);
        }
        
        if (alert.recommendations.length > 0) {
            console.log('推奨アクション:');
            alert.recommendations.forEach((rec: any, i: any) => {
                console.log(`  ${i + 1}. ${rec}`);
            });
        }
        
        console.groupEnd();
    }

    /**
     * ウェブフック通知送信
     */
    async sendWebhookNotification(alert: any) {
        try {
            await fetch(this.options.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    alert,
                    timestamp: Date.now(),
                    source: 'BubblePop Analytics'
                })
            });
        } catch (error) {
            console.warn('Failed to send webhook notification:', error);
        }
    }

    /**
     * メール通知送信
     */
    async sendEmailNotification(alert: any) {
        try {
            await fetch(this.options.emailEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: 'developer@example.com',
                    subject: `[${alert.severity.toUpperCase()}] ${alert.message}`,
                    body: this.formatEmailBody(alert)
                })
            });
        } catch (error) {
            console.warn('Failed to send email notification:', error);
        }
    }

    /**
     * メール本文のフォーマット
     */
    formatEmailBody(alert: any) {
        const category = this.alertCategories.get(alert.category);
        let body = `開発者アラート通知\n\n`;
        body += `カテゴリ: ${category?.name || alert.category}\n`;
        body += `重要度: ${alert.severity}\n`;
        body += `メッセージ: ${alert.message}\n`;
        body += `時刻: ${new Date(alert.timestamp).toLocaleString()}\n\n`;
        
        if (alert.data) {
            body += `詳細データ:\n${JSON.stringify(alert.data, null, 2)}\n\n`;
        }
        
        if (alert.recommendations.length > 0) {
            body += `推奨アクション:\n`;
            alert.recommendations.forEach((rec: any, i: any) => {
                body += `${i + 1}. ${rec}\n`;
            });
        }
        
        return body;
    }

    /**
     * コールバック実行
     */
    executeCallbacks(alert: any) {
        for (const [name, callback] of Array.from(this.alertCallbacks.entries())) {
            try {
                callback(alert);
            } catch (error) {
                console.warn(`Alert callback '${name}' failed:`, error);
            }
        }
    }

    /**
     * ヘルパーメソッド
     */
    calculateAverageIncrease(values: any) {
        if (values.length < 2) return 0;
        
        let totalIncrease = 0;
        for (let i = 1; i < values.length; i++) {
            totalIncrease += Math.max(0, values[i] - values[i - 1]);
        }
        
        return totalIncrease / (values.length - 1);
    }

    analyzeActionPatterns(actions: any) {
        const patterns = new Map();
        let repetitiveCount = 0;
        
        for (let i = 0; i < actions.length - 2; i++) {
            const pattern = `${actions[i]}_${actions[i + 1]}_${actions[i + 2]}`;
            patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
            
            if (patterns.get(pattern) > 5) { // 5回以上の繰り返し
                repetitiveCount++;
            }
        }
        
        return {
            patterns: Object.fromEntries(patterns),
            repetitiveScore: repetitiveCount / Math.max(1, actions.length - 2)
        };
    }

    detectImpossibleAchievements(achievements: any) {
        // 簡単な実装例 - 実際はより複雑なロジックが必要
        return achievements.filter((achievement: any) => {
            // 短時間での不可能な実績取得など
            return achievement.timeToAchieve < 1000; // 1秒未満での実績取得
        });
    }

    analyzeSuspiciousPatterns(activityLog: any) {
        let riskScore = 0;
        const patterns = [];
        
        // 短時間での大量アクション
        const recentActions = activityLog.filter((log: any) => 
            Date.now() - log.timestamp < 60000 // 1分以内
        );
        
        if (recentActions.length > 100) {
            riskScore += 0.5;
            patterns.push('high_frequency_actions');
        }
        
        // 非常に多数のアクション（150以上）
        if (recentActions.length > 150) {
            riskScore += 0.3;
            patterns.push('extremely_high_frequency');
        }
        
        return { riskScore, patterns };
    }

    getSeverityColor(severity: any) {
        const colors = {
            info: '#2196f3',
            warning: '#ff9800',
            error: '#f44336',
            critical: '#d32f2f'
        };
        return (colors as any)[severity] || '#666';
    }

    /**
     * パフォーマンス警告の処理
     */
    handlePerformanceWarning(warningData: any) {
        this.generateAlert({
            category: 'performance',
            checkType: 'performance_warning',
            severity: warningData.severity || 'warning',
            message: `パフォーマンス警告: ${warningData.message}`,
            data: warningData,
            recommendations: [
                'パフォーマンス最適化の実行を検討してください',
                'リソース使用量の監視を強化してください'
            ]
        });
    }

    /**
     * エラーイベントの処理
     */
    handleErrorEvent(errorData: any) {
        this.generateAlert({
            category: 'performance',
            checkType: 'error_event',
            severity: errorData.severity === 'critical' ? 'critical' : 'error',
            message: `エラー発生: ${errorData.message}`,
            data: errorData,
            recommendations: [
                'エラーログの詳細調査が必要です',
                'エラー原因の特定と修正を行ってください'
            ]
        });
    }

    /**
     * アラートコールバックの登録
     */
    registerCallback(name: any, callback: any) {
        this.alertCallbacks.set(name, callback);
    }

    /**
     * アラートコールバックの削除
     */
    unregisterCallback(name: string) {
        this.alertCallbacks.delete(name);
    }

    /**
     * カスタムフィルターの追加
     */
    addFilter(name: string, filterFunction: (alert: any) => boolean) {
        this.alertFilters.set(name, filterFunction);
    }

    /**
     * カスタムフィルターの削除
     */
    removeFilter(name: string) {
        this.alertFilters.delete(name);
    }

    /**
     * アラート履歴のトリミング
     */
    trimAlertHistory() {
        const retentionTime = this.options.alertRetentionDays * 24 * 60 * 60 * 1000;
        const cutoffTime = Date.now() - retentionTime;
        
        this.alertHistory = this.alertHistory.filter(alert => alert.timestamp > cutoffTime);
        
        // 最大10000件まで
        if (this.alertHistory.length > 10000) {
            this.alertHistory = this.alertHistory.slice(0, 10000);
        }
    }

    /**
     * クリーンアップのスケジュール
     */
    scheduleCleanup() {
        // 1時間ごとにクリーンアップ実行
        setInterval(() => {
            this.trimAlertHistory();
            this.cleanupRateLimitCounters();
        }, 60 * 60 * 1000);
    }

    /**
     * レート制限カウンターのクリーンアップ
     */
    cleanupRateLimitCounters() {
        const now = Date.now();
        const currentHour = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000);
        
        for (const [key] of Array.from(this.rateLimitCounter.entries())) {
            const keyHour = parseInt(key.split('_').pop() || '0');
            if (keyHour < currentHour - (60 * 60 * 1000)) { // 1時間以上古い
                this.rateLimitCounter.delete(key);
            }
        }
    }

    /**
     * アラートIDの生成
     */
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * アラート統計の取得
     */
    getAlertStatistics() {
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        const todayAlerts = this.alertHistory.filter(a => a.timestamp > oneDayAgo);
        const weekAlerts = this.alertHistory.filter(a => a.timestamp > oneWeekAgo);
        
        return {
            total: this.alertHistory.length,
            today: todayAlerts.length,
            thisWeek: weekAlerts.length,
            byCategory: this.groupBy(todayAlerts, 'category'),
            bySeverity: this.groupBy(todayAlerts, 'severity'),
            acknowledged: this.alertHistory.filter(a => a.acknowledged).length
        };
    }

    /**
     * 配列のグループ化
     */
    groupBy(array: any[], key: string) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }

    /**
     * 設定の更新
     */
    updateOptions(newOptions: any) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * リソースの解放
     */
    destroy() {
        window.removeEventListener('analytics-data-updated', this.analyzeData as any);
        window.removeEventListener('performance-warning', this.handlePerformanceWarning as any);
        window.removeEventListener('error-notification-displayed', this.handleErrorEvent as any);
        
        // データクリア
        this.alertHistory = [];
        this.alertCallbacks.clear();
        this.rateLimitCounter.clear();
        
        console.log('DeveloperAlertSystem destroyed');
    }
}