/**
 * AccessibilityUserTesting - アクセシビリティユーザーテスト・フィードバック収集システム
 * アクセシビリティコミュニティとのテストセッション・フィードバック分析・改善ロードマップ生成
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class AccessibilityUserTesting {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // ユーザーテスト設定
        this.config = {
            enabled: true,
            autoCollectFeedback: true,
            anonymousMode: true,
            dataRetention: 90, // 90日間
            minSessionDuration: 300, // 5分
            maxFeedbackLength: 1000,
            enableScreenRecording: false,
            enableUsageAnalytics: true
        };
        
        // テストユーザーカテゴリ
        this.userCategories = {
            visualImpairment: {
                name: '視覚障害ユーザー',
                description: 'スクリーンリーダー、拡大鏡、点字ディスプレイ使用者',
                testScenarios: [
                    'screenReaderNavigation',
                    'keyboardOnlyGameplay',
                    'highContrastVisibility',
                    'audioFeedbackQuality'
                ],
                requiredFeatures: ['screenReader', 'keyboardNavigation', 'audioFeedback']
            },
            
            hearingImpairment: {
                name: '聴覚障害ユーザー',
                description: '聴覚障害、難聴の方',
                testScenarios: [
                    'visualAudioFeedback',
                    'captionAccuracy',
                    'vibrationFeedback',
                    'flashingAlerts'
                ],
                requiredFeatures: ['captions', 'visualFeedback', 'vibration']
            },
            
            motorImpairment: {
                name: '運動機能障害ユーザー',
                description: '手足の運動機能に制限のある方',
                testScenarios: [
                    'alternativeInputMethods',
                    'timingAdjustments',
                    'oneHandedGameplay',
                    'gestureSimplification'
                ],
                requiredFeatures: ['alternativeInput', 'timing', 'gestures']
            },
            
            cognitiveImpairment: {
                name: '認知障害ユーザー',
                description: '認知機能のサポートが必要な方',
                testScenarios: [
                    'uiSimplification',
                    'contextualHelp',
                    'errorRecovery',
                    'memorySupport'
                ],
                requiredFeatures: ['simplification', 'help', 'errorRecovery']
            },
            
            elderlyUsers: {
                name: '高齢者ユーザー',
                description: '高齢者の方',
                testScenarios: [
                    'largeTextReadability',
                    'slowAnimationPreference',
                    'simpleNavigation',
                    'clearInstructions'
                ],
                requiredFeatures: ['textScaling', 'motionReduction', 'simplification']
            },
            
            assistiveTechUsers: {
                name: '支援技術ユーザー',
                description: '各種支援技術使用者',
                testScenarios: [
                    'switchInputCompatibility',
                    'eyeTrackingSupport',
                    'voiceControlAccuracy',
                    'customControllerSupport'
                ],
                requiredFeatures: ['alternativeInput', 'voiceControl', 'customization']
            }
        };
        
        // テストセッション管理
        this.testSessions = new Map();
        this.sessionCounter = 0;
        
        // フィードバック収集
        this.feedbackData = {
            sessions: [],
            ratings: new Map(),
            comments: [],
            usabilityIssues: [],
            featureRequests: [],
            bugReports: []
        };
        
        // 分析結果
        this.analysisResults = {
            overallSatisfaction: 0,
            featureEffectiveness: new Map(),
            commonIssues: [],
            priorityImprovements: [],
            successMetrics: {},
            userJourneyAnalysis: {}
        };
        
        // テストシナリオ定義
        this.testScenarios = {
            screenReaderNavigation: {
                name: 'スクリーンリーダーナビゲーション',
                description: 'スクリーンリーダーでのゲーム操作テスト',
                steps: [
                    'ゲーム開始画面へのアクセス',
                    'メニューナビゲーション',
                    'ゲームプレイ中の状況把握',
                    '設定画面でのオプション変更',
                    'ゲーム終了までの流れ'
                ],
                expectedDuration: 15,
                successCriteria: [
                    '全ての操作がキーボードで可能',
                    '画面の状況が正確に読み上げられる',
                    '重要な情報が適切にアナウンスされる'
                ]
            },
            
            visualAudioFeedback: {
                name: '視覚的音声フィードバック',
                description: '音声情報の視覚的表現テスト',
                steps: [
                    '効果音の視覚化確認',
                    'BGMの視覚表現確認',
                    '音声アラートの視覚代替確認',
                    'ゲーム音の識別可能性確認'
                ],
                expectedDuration: 10,
                successCriteria: [
                    '重要な音声が視覚的に表現される',
                    '音の種類が区別できる',
                    'ゲームプレイに支障がない'
                ]
            },
            
            alternativeInputMethods: {
                name: '代替入力方法',
                description: '標準的なマウス・キーボード以外の入力テスト',
                steps: [
                    'スイッチ入力での操作',
                    '視線追跡での制御',
                    '音声コマンドでの操作',
                    'カスタムコントローラーでの操作'
                ],
                expectedDuration: 20,
                successCriteria: [
                    '代替入力で全機能にアクセス可能',
                    '入力の遅延や誤認識が少ない',
                    'カスタマイズが容易'
                ]
            }
        };\n        \n        // フィードバック収集UI\n        this.feedbackUI = null;\n        this.isCollecting = false;\n        \n        console.log('AccessibilityUserTesting initialized');\n        this.initialize();\n    }\n    \n    /**\n     * 初期化\n     */\n    initialize() {\n        try {\n            this.loadPreviousFeedback();\n            this.setupFeedbackCollection();\n            this.initializeAnalytics();\n            \n            console.log('AccessibilityUserTesting initialized successfully');\n        } catch (error) {\n            getErrorHandler().handleError(error, 'USER_TESTING_ERROR', {\n                operation: 'initialize'\n            });\n        }\n    }\n    \n    /**\n     * テストセッションの開始\n     */\n    startTestSession(userCategory, testScenarios = []) {\n        const sessionId = `session_${++this.sessionCounter}_${Date.now()}`;\n        \n        const session = {\n            id: sessionId,\n            userCategory,\n            testScenarios: testScenarios.length > 0 ? testScenarios : \n                          this.userCategories[userCategory]?.testScenarios || [],\n            startTime: Date.now(),\n            endTime: null,\n            duration: 0,\n            currentScenario: 0,\n            completedScenarios: [],\n            interactions: [],\n            feedback: {\n                ratings: {},\n                comments: [],\n                issues: [],\n                suggestions: []\n            },\n            metrics: {\n                taskCompletionRate: 0,\n                averageTaskTime: 0,\n                errorCount: 0,\n                helpRequestCount: 0,\n                satisfactionScore: 0\n            },\n            technicalData: {\n                userAgent: navigator.userAgent,\n                screen: {\n                    width: screen.width,\n                    height: screen.height\n                },\n                assistiveTech: this.detectAssistiveTechnology(),\n                customSettings: this.getCurrentAccessibilitySettings()\n            }\n        };\n        \n        this.testSessions.set(sessionId, session);\n        this.isCollecting = true;\n        \n        // テストセッション開始の通知\n        this.notifyTestStart(session);\n        \n        // 使用状況の追跡開始\n        this.startUsageTracking(sessionId);\n        \n        console.log(`Test session started: ${sessionId} for ${userCategory}`);\n        return sessionId;\n    }\n    \n    /**\n     * テストシナリオの実行\n     */\n    async executeTestScenario(sessionId, scenarioName) {\n        const session = this.testSessions.get(sessionId);\n        if (!session) {\n            console.warn(`Test session not found: ${sessionId}`);\n            return false;\n        }\n        \n        const scenario = this.testScenarios[scenarioName];\n        if (!scenario) {\n            console.warn(`Test scenario not found: ${scenarioName}`);\n            return false;\n        }\n        \n        const scenarioExecution = {\n            name: scenarioName,\n            startTime: Date.now(),\n            endTime: null,\n            completed: false,\n            steps: scenario.steps.map(step => ({\n                description: step,\n                completed: false,\n                duration: 0,\n                issues: []\n            })),\n            feedback: {\n                difficulty: 0, // 1-5スケール\n                clarity: 0,    // 1-5スケール\n                satisfaction: 0, // 1-5スケール\n                comments: ''\n            }\n        };\n        \n        // シナリオ実行の開始\n        session.interactions.push({\n            type: 'scenarioStart',\n            scenario: scenarioName,\n            timestamp: Date.now()\n        });\n        \n        // シナリオガイダンスの表示\n        this.showScenarioGuidance(scenario);\n        \n        return scenarioExecution;\n    }\n    \n    /**\n     * インタラクションの記録\n     */\n    recordInteraction(sessionId, interactionData) {\n        const session = this.testSessions.get(sessionId);\n        if (!session || !this.isCollecting) return;\n        \n        const interaction = {\n            timestamp: Date.now(),\n            sessionTime: Date.now() - session.startTime,\n            ...interactionData\n        };\n        \n        session.interactions.push(interaction);\n        \n        // リアルタイム分析\n        this.analyzeInteractionRealtime(session, interaction);\n    }\n    \n    /**\n     * フィードバックの収集\n     */\n    collectFeedback(sessionId, feedbackData) {\n        const session = this.testSessions.get(sessionId);\n        if (!session) return false;\n        \n        // 評価の記録\n        if (feedbackData.ratings) {\n            Object.assign(session.feedback.ratings, feedbackData.ratings);\n        }\n        \n        // コメントの追加\n        if (feedbackData.comment) {\n            session.feedback.comments.push({\n                text: feedbackData.comment,\n                timestamp: Date.now(),\n                category: feedbackData.category || 'general'\n            });\n        }\n        \n        // 問題の報告\n        if (feedbackData.issue) {\n            session.feedback.issues.push({\n                description: feedbackData.issue,\n                severity: feedbackData.severity || 'medium',\n                component: feedbackData.component || 'unknown',\n                timestamp: Date.now()\n            });\n        }\n        \n        // 改善提案\n        if (feedbackData.suggestion) {\n            session.feedback.suggestions.push({\n                text: feedbackData.suggestion,\n                priority: feedbackData.priority || 'medium',\n                timestamp: Date.now()\n            });\n        }\n        \n        console.log(`Feedback collected for session ${sessionId}`);\n        return true;\n    }\n    \n    /**\n     * テストセッションの終了\n     */\n    endTestSession(sessionId) {\n        const session = this.testSessions.get(sessionId);\n        if (!session) return null;\n        \n        session.endTime = Date.now();\n        session.duration = session.endTime - session.startTime;\n        \n        // 最終メトリクスの計算\n        this.calculateSessionMetrics(session);\n        \n        // セッションデータの保存\n        this.feedbackData.sessions.push(session);\n        this.saveFeedbackData();\n        \n        // 使用状況追跡の停止\n        this.stopUsageTracking(sessionId);\n        \n        // セッション完了の通知\n        this.notifyTestCompletion(session);\n        \n        console.log(`Test session completed: ${sessionId}, duration: ${session.duration}ms`);\n        \n        return session;\n    }\n    \n    /**\n     * セッションメトリクスの計算\n     */\n    calculateSessionMetrics(session) {\n        const interactions = session.interactions;\n        const scenarios = session.completedScenarios;\n        \n        // タスク完了率\n        session.metrics.taskCompletionRate = scenarios.length / session.testScenarios.length;\n        \n        // 平均タスク時間\n        if (scenarios.length > 0) {\n            const totalTime = scenarios.reduce((sum, scenario) => sum + (scenario.duration || 0), 0);\n            session.metrics.averageTaskTime = totalTime / scenarios.length;\n        }\n        \n        // エラー数\n        session.metrics.errorCount = interactions.filter(i => i.type === 'error').length;\n        \n        // ヘルプ要求数\n        session.metrics.helpRequestCount = interactions.filter(i => i.type === 'helpRequest').length;\n        \n        // 満足度スコア（評価の平均）\n        const ratings = Object.values(session.feedback.ratings);\n        if (ratings.length > 0) {\n            session.metrics.satisfactionScore = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;\n        }\n    }\n    \n    /**\n     * フィードバックデータの分析\n     */\n    analyzeFeedbackData() {\n        const sessions = this.feedbackData.sessions;\n        if (sessions.length === 0) {\n            console.log('No feedback data to analyze');\n            return null;\n        }\n        \n        // 全体満足度の計算\n        const satisfactionScores = sessions.map(s => s.metrics.satisfactionScore).filter(s => s > 0);\n        this.analysisResults.overallSatisfaction = satisfactionScores.length > 0 ?\n            satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length : 0;\n        \n        // 機能別効果分析\n        this.analyzeFeatureEffectiveness(sessions);\n        \n        // 共通問題の特定\n        this.identifyCommonIssues(sessions);\n        \n        // 優先改善項目の決定\n        this.determinePriorityImprovements();\n        \n        // 成功メトリクスの計算\n        this.calculateSuccessMetrics(sessions);\n        \n        // ユーザージャーニー分析\n        this.analyzeUserJourneys(sessions);\n        \n        console.log('Feedback analysis completed', this.analysisResults);\n        return this.analysisResults;\n    }\n    \n    /**\n     * 機能別効果分析\n     */\n    analyzeFeatureEffectiveness(sessions) {\n        const featureUsage = new Map();\n        const featureRatings = new Map();\n        \n        sessions.forEach(session => {\n            // 使用された機能の記録\n            session.interactions.forEach(interaction => {\n                if (interaction.feature) {\n                    featureUsage.set(interaction.feature, \n                        (featureUsage.get(interaction.feature) || 0) + 1);\n                }\n            });\n            \n            // 機能別評価の記録\n            Object.entries(session.feedback.ratings).forEach(([feature, rating]) => {\n                if (!featureRatings.has(feature)) {\n                    featureRatings.set(feature, []);\n                }\n                featureRatings.get(feature).push(rating);\n            });\n        });\n        \n        // 効果スコアの計算\n        for (const [feature, ratings] of featureRatings) {\n            const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;\n            const usageCount = featureUsage.get(feature) || 0;\n            \n            this.analysisResults.featureEffectiveness.set(feature, {\n                averageRating,\n                usageCount,\n                effectivenessScore: (averageRating * usageCount) / sessions.length\n            });\n        }\n    }\n    \n    /**\n     * 共通問題の特定\n     */\n    identifyCommonIssues(sessions) {\n        const issueFrequency = new Map();\n        \n        sessions.forEach(session => {\n            session.feedback.issues.forEach(issue => {\n                const key = `${issue.component}:${issue.description}`;\n                issueFrequency.set(key, (issueFrequency.get(key) || 0) + 1);\n            });\n        });\n        \n        // 頻度の高い問題を抽出（2回以上報告された問題）\n        this.analysisResults.commonIssues = Array.from(issueFrequency.entries())\n            .filter(([, frequency]) => frequency >= 2)\n            .map(([issueKey, frequency]) => {\n                const [component, description] = issueKey.split(':');\n                return {\n                    component,\n                    description,\n                    frequency,\n                    severity: this.calculateIssueSeverity(component, description, frequency)\n                };\n            })\n            .sort((a, b) => b.frequency - a.frequency);\n    }\n    \n    /**\n     * 問題の深刻度計算\n     */\n    calculateIssueSeverity(component, description, frequency) {\n        let severity = 'low';\n        \n        // 頻度による判定\n        if (frequency >= 5) {\n            severity = 'high';\n        } else if (frequency >= 3) {\n            severity = 'medium';\n        }\n        \n        // コンポーネントによる調整\n        const criticalComponents = ['KeyboardAccessibilityManager', 'ScreenReaderSupport', 'ARIAManager'];\n        if (criticalComponents.includes(component)) {\n            if (severity === 'low') severity = 'medium';\n            if (severity === 'medium') severity = 'high';\n        }\n        \n        return severity;\n    }\n    \n    /**\n     * 優先改善項目の決定\n     */\n    determinePriorityImprovements() {\n        const improvements = [];\n        \n        // 共通問題からの改善項目\n        this.analysisResults.commonIssues.forEach(issue => {\n            if (issue.severity === 'high') {\n                improvements.push({\n                    type: 'bugfix',\n                    priority: 'high',\n                    component: issue.component,\n                    description: `Fix: ${issue.description}`,\n                    impact: 'critical',\n                    effort: 'medium'\n                });\n            }\n        });\n        \n        // 低評価機能の改善\n        for (const [feature, data] of this.analysisResults.featureEffectiveness) {\n            if (data.averageRating < 3.0 && data.usageCount > 1) {\n                improvements.push({\n                    type: 'enhancement',\n                    priority: 'medium',\n                    component: feature,\n                    description: `Improve ${feature} usability`,\n                    impact: 'high',\n                    effort: 'high'\n                });\n            }\n        }\n        \n        // 優先度順にソート\n        this.analysisResults.priorityImprovements = improvements\n            .sort((a, b) => {\n                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };\n                return priorityOrder[b.priority] - priorityOrder[a.priority];\n            });\n    }\n    \n    /**\n     * 改善ロードマップの生成\n     */\n    generateImprovementRoadmap() {\n        const roadmap = {\n            shortTerm: [], // 1-2週間\n            mediumTerm: [], // 1-2ヶ月\n            longTerm: []   // 3-6ヶ月\n        };\n        \n        this.analysisResults.priorityImprovements.forEach(improvement => {\n            if (improvement.priority === 'high' && improvement.effort !== 'high') {\n                roadmap.shortTerm.push(improvement);\n            } else if (improvement.priority === 'medium' || \n                      (improvement.priority === 'high' && improvement.effort === 'high')) {\n                roadmap.mediumTerm.push(improvement);\n            } else {\n                roadmap.longTerm.push(improvement);\n            }\n        });\n        \n        return roadmap;\n    }\n    \n    /**\n     * フィードバック収集UIの設定\n     */\n    setupFeedbackCollection() {\n        if (!this.config.autoCollectFeedback) return;\n        \n        // フィードバックボタンの作成\n        this.createFeedbackButton();\n        \n        // 自動フィードバック収集の設定\n        this.setupAutomaticFeedbackCollection();\n    }\n    \n    /**\n     * フィードバックボタンの作成\n     */\n    createFeedbackButton() {\n        const button = document.createElement('button');\n        button.id = 'accessibility-feedback-button';\n        button.textContent = 'フィードバック';\n        button.setAttribute('aria-label', 'アクセシビリティフィードバックを送信');\n        button.style.cssText = `\n            position: fixed;\n            bottom: 20px;\n            right: 20px;\n            z-index: 10000;\n            background: #2196F3;\n            color: white;\n            border: none;\n            padding: 12px 20px;\n            border-radius: 25px;\n            cursor: pointer;\n            font-size: 14px;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n            transition: all 0.3s ease;\n        `;\n        \n        button.addEventListener('click', () => {\n            this.showFeedbackModal();\n        });\n        \n        document.body.appendChild(button);\n    }\n    \n    /**\n     * フィードバックモーダルの表示\n     */\n    showFeedbackModal() {\n        const modal = document.createElement('div');\n        modal.id = 'accessibility-feedback-modal';\n        modal.style.cssText = `\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100vw;\n            height: 100vh;\n            background: rgba(0,0,0,0.5);\n            z-index: 10001;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n        `;\n        \n        const modalContent = document.createElement('div');\n        modalContent.style.cssText = `\n            background: white;\n            padding: 2rem;\n            border-radius: 8px;\n            max-width: 500px;\n            width: 90%;\n            max-height: 80vh;\n            overflow-y: auto;\n        `;\n        \n        modalContent.innerHTML = `\n            <h2>アクセシビリティフィードバック</h2>\n            <form id=\"accessibility-feedback-form\">\n                <div style=\"margin-bottom: 1rem;\">\n                    <label for=\"user-category\">ユーザータイプ:</label>\n                    <select id=\"user-category\" required>\n                        <option value=\"\">選択してください</option>\n                        <option value=\"visualImpairment\">視覚障害</option>\n                        <option value=\"hearingImpairment\">聴覚障害</option>\n                        <option value=\"motorImpairment\">運動機能障害</option>\n                        <option value=\"cognitiveImpairment\">認知障害</option>\n                        <option value=\"elderlyUsers\">高齢者</option>\n                        <option value=\"assistiveTechUsers\">支援技術利用者</option>\n                        <option value=\"other\">その他</option>\n                    </select>\n                </div>\n                \n                <div style=\"margin-bottom: 1rem;\">\n                    <label for=\"overall-rating\">総合評価 (1-5):</label>\n                    <input type=\"range\" id=\"overall-rating\" min=\"1\" max=\"5\" value=\"3\">\n                    <span id=\"rating-display\">3</span>\n                </div>\n                \n                <div style=\"margin-bottom: 1rem;\">\n                    <label for=\"feedback-comment\">コメント・提案:</label>\n                    <textarea id=\"feedback-comment\" rows=\"4\" style=\"width: 100%;\"></textarea>\n                </div>\n                \n                <div style=\"margin-bottom: 1rem;\">\n                    <label for=\"issue-report\">問題の報告:</label>\n                    <textarea id=\"issue-report\" rows=\"3\" style=\"width: 100%;\"></textarea>\n                </div>\n                \n                <div style=\"display: flex; gap: 1rem; justify-content: flex-end;\">\n                    <button type=\"button\" onclick=\"this.closest('#accessibility-feedback-modal').remove()\">\n                        キャンセル\n                    </button>\n                    <button type=\"submit\" style=\"background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px;\">\n                        送信\n                    </button>\n                </div>\n            </form>\n        `;\n        \n        // 評価スライダーの更新\n        const ratingSlider = modalContent.querySelector('#overall-rating');\n        const ratingDisplay = modalContent.querySelector('#rating-display');\n        ratingSlider.addEventListener('input', () => {\n            ratingDisplay.textContent = ratingSlider.value;\n        });\n        \n        // フォーム送信処理\n        const form = modalContent.querySelector('#accessibility-feedback-form');\n        form.addEventListener('submit', (e) => {\n            e.preventDefault();\n            this.submitFeedback(form, modal);\n        });\n        \n        modal.appendChild(modalContent);\n        document.body.appendChild(modal);\n        \n        // フォーカス管理\n        modalContent.querySelector('#user-category').focus();\n    }\n    \n    /**\n     * フィードバックの送信\n     */\n    submitFeedback(form, modal) {\n        const formData = new FormData(form);\n        const feedback = {\n            userCategory: form.querySelector('#user-category').value,\n            overallRating: parseInt(form.querySelector('#overall-rating').value),\n            comment: form.querySelector('#feedback-comment').value,\n            issue: form.querySelector('#issue-report').value,\n            timestamp: Date.now(),\n            sessionInfo: this.getCurrentSessionInfo()\n        };\n        \n        // フィードバックデータの保存\n        this.feedbackData.comments.push({\n            text: feedback.comment,\n            category: feedback.userCategory,\n            rating: feedback.overallRating,\n            timestamp: feedback.timestamp\n        });\n        \n        if (feedback.issue) {\n            this.feedbackData.bugReports.push({\n                description: feedback.issue,\n                category: feedback.userCategory,\n                timestamp: feedback.timestamp\n            });\n        }\n        \n        this.saveFeedbackData();\n        \n        // 成功メッセージの表示\n        modal.innerHTML = `\n            <div style=\"background: white; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center;\">\n                <h2>ありがとうございます！</h2>\n                <p>フィードバックが送信されました。</p>\n                <button onclick=\"this.closest('#accessibility-feedback-modal').remove()\" \n                        style=\"background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-top: 1rem;\">\n                    閉じる\n                </button>\n            </div>\n        `;\n        \n        // 3秒後に自動クローズ\n        setTimeout(() => {\n            if (modal.parentElement) {\n                modal.parentElement.removeChild(modal);\n            }\n        }, 3000);\n        \n        console.log('Feedback submitted:', feedback);\n    }\n    \n    // ユーティリティメソッド\n    \n    /**\n     * 支援技術の検出\n     */\n    detectAssistiveTechnology() {\n        const detectedTech = [];\n        \n        // スクリーンリーダーの検出（簡易）\n        if (window.speechSynthesis) {\n            detectedTech.push('speechSynthesis');\n        }\n        \n        // 音声認識の検出\n        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {\n            detectedTech.push('speechRecognition');\n        }\n        \n        // ゲームパッドの検出\n        if (navigator.getGamepads && navigator.getGamepads().some(gp => gp)) {\n            detectedTech.push('gamepad');\n        }\n        \n        return detectedTech;\n    }\n    \n    /**\n     * 現在のアクセシビリティ設定取得\n     */\n    getCurrentAccessibilitySettings() {\n        if (!this.accessibilityManager) return {};\n        \n        return {\n            enabled: this.accessibilityManager.config?.enabled || false,\n            activeProfile: this.accessibilityManager.getActiveProfile?.() || null,\n            keyboardNavigation: this.accessibilityManager.keyboardAccessibilityManager?.config?.enabled || false,\n            screenReader: this.accessibilityManager.screenReaderSupport?.config?.enabled || false,\n            highContrast: this.accessibilityManager.contrastManager?.config?.enabled || false\n        };\n    }\n    \n    /**\n     * 現在のセッション情報取得\n     */\n    getCurrentSessionInfo() {\n        return {\n            userAgent: navigator.userAgent,\n            screen: {\n                width: screen.width,\n                height: screen.height\n            },\n            timestamp: Date.now(),\n            gameState: this.gameEngine?.getCurrentState?.() || null\n        };\n    }\n    \n    /**\n     * フィードバックデータの保存\n     */\n    saveFeedbackData() {\n        try {\n            const dataToSave = {\n                ...this.feedbackData,\n                lastUpdated: Date.now()\n            };\n            \n            localStorage.setItem('accessibilityFeedbackData', JSON.stringify(dataToSave));\n        } catch (error) {\n            console.warn('Failed to save feedback data:', error);\n        }\n    }\n    \n    /**\n     * 以前のフィードバックデータの読み込み\n     */\n    loadPreviousFeedback() {\n        try {\n            const saved = localStorage.getItem('accessibilityFeedbackData');\n            if (saved) {\n                const data = JSON.parse(saved);\n                Object.assign(this.feedbackData, data);\n                console.log('Previous feedback data loaded');\n            }\n        } catch (error) {\n            console.warn('Failed to load previous feedback data:', error);\n        }\n    }\n    \n    // パブリックAPI\n    \n    /**\n     * フィードバック統計の取得\n     */\n    getFeedbackStats() {\n        return {\n            totalSessions: this.feedbackData.sessions.length,\n            totalComments: this.feedbackData.comments.length,\n            totalIssues: this.feedbackData.usabilityIssues.length + this.feedbackData.bugReports.length,\n            averageRating: this.analysisResults.overallSatisfaction,\n            userCategoryBreakdown: this.getUserCategoryBreakdown(),\n            commonIssues: this.analysisResults.commonIssues.slice(0, 5)\n        };\n    }\n    \n    /**\n     * ユーザーカテゴリ別統計\n     */\n    getUserCategoryBreakdown() {\n        const breakdown = {};\n        \n        this.feedbackData.sessions.forEach(session => {\n            const category = session.userCategory || 'unknown';\n            breakdown[category] = (breakdown[category] || 0) + 1;\n        });\n        \n        return breakdown;\n    }\n    \n    /**\n     * テストレポートの生成\n     */\n    generateTestReport() {\n        const analysis = this.analyzeFeedbackData();\n        const roadmap = this.generateImprovementRoadmap();\n        \n        return {\n            summary: {\n                totalParticipants: this.feedbackData.sessions.length,\n                overallSatisfaction: analysis.overallSatisfaction,\n                reportGeneratedAt: new Date().toISOString()\n            },\n            userCategories: Object.keys(this.userCategories),\n            feedbackStats: this.getFeedbackStats(),\n            analysisResults: analysis,\n            improvementRoadmap: roadmap,\n            recommendations: this.generateRecommendations(analysis)\n        };\n    }\n    \n    /**\n     * 推奨事項の生成\n     */\n    generateRecommendations(analysis) {\n        const recommendations = [];\n        \n        if (analysis.overallSatisfaction < 3.5) {\n            recommendations.push({\n                priority: 'high',\n                category: 'usability',\n                message: 'Overall satisfaction is below acceptable level. Focus on addressing common issues.'\n            });\n        }\n        \n        if (analysis.commonIssues.length > 5) {\n            recommendations.push({\n                priority: 'high',\n                category: 'quality',\n                message: 'Multiple common issues detected. Consider comprehensive usability testing.'\n            });\n        }\n        \n        return recommendations;\n    }\n    \n    /**\n     * 設定の適用\n     */\n    applyConfig(config) {\n        if (config.userTesting) {\n            Object.assign(this.config, config.userTesting);\n        }\n        \n        console.log('AccessibilityUserTesting configuration applied');\n    }\n    \n    /**\n     * 有効状態の設定\n     */\n    setEnabled(enabled) {\n        this.config.enabled = enabled;\n        \n        if (enabled) {\n            this.setupFeedbackCollection();\n        } else {\n            const button = document.getElementById('accessibility-feedback-button');\n            if (button) button.remove();\n        }\n        \n        console.log(`AccessibilityUserTesting ${enabled ? 'enabled' : 'disabled'}`);\n    }\n    \n    /**\n     * クリーンアップ\n     */\n    destroy() {\n        console.log('Destroying AccessibilityUserTesting...');\n        \n        // UI要素の削除\n        const button = document.getElementById('accessibility-feedback-button');\n        if (button) button.remove();\n        \n        const modal = document.getElementById('accessibility-feedback-modal');\n        if (modal) modal.remove();\n        \n        // データの最終保存\n        this.saveFeedbackData();\n        \n        console.log('AccessibilityUserTesting destroyed');\n    }\n}