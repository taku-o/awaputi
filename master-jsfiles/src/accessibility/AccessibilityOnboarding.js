/**
 * AccessibilityOnboarding - Main Controller for accessibility onboarding system
 * Orchestrates onboarding flow, tutorial delivery, and progress tracking
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { OnboardingFlowManager } from './onboarding/OnboardingFlowManager.js';
import { AccessibilityTutorial } from './onboarding/AccessibilityTutorial.js';
import { OnboardingProgressTracker } from './onboarding/OnboardingProgressTracker.js';

export class AccessibilityOnboarding {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // オンボーディング設定
        this.config = {
            enabled: true,
            autoStart: true,
            skipOnReturn: false,
            progressiveDisclosure: true,
            adaptiveContent: true,
            multiLanguage: true,
            analytics: true
        };

        // Initialize sub-components with onboarding step definitions
        this.flowManager = new OnboardingFlowManager(this.config);
        this.tutorial = new AccessibilityTutorial(this.config);
        this.progressTracker = new OnboardingProgressTracker(this.config);
        
        // Simplified step definitions (detailed steps moved to sub-components)
        this.onboardingSteps = this.getOnboardingStepsDefinition();
        
        // 現在の状態
        this.state = {
            isActive: false,
            currentStep: null,
            stepIndex: 0,
            progress: 0,
            userResponses: new Map(),
            assessmentResults: null,
            completedSteps: new Set(),
            skippedSteps: new Set()
        };
        
        // UI要素
        this.ui = {
            overlay: null,
            container: null,
            currentStepElement: null,
            progressBar: null,
            skipButton: null
        };
        
        // 発見システム
        this.discoverySystem = {
            enabled: true,
            discoveredFeatures: new Set(),
            contextualTips: new Map(),
            tipQueue: [],
            showInterval: 10000 // 10秒間隔
        };
        
        // 分析データ
        this.analytics = {
            sessionStart: null,
            stepTimings: new Map(),
            userInteractions: [],
            completionRate: 0,
            satisfactionScore: 0,
            featuresDiscovered: 0
        };
        
        console.log('AccessibilityOnboarding initialized');
        this.initialize();
    }

    /**
     * Get onboarding steps definition
     */
    getOnboardingStepsDefinition() {
        return {
            welcome: { id: 'welcome', title: 'アクセシビリティ機能へようこそ', type: 'introduction', actions: ['start', 'skip'] },
            assessment: { id: 'assessment', title: 'アクセシビリティニーズ評価', type: 'questionnaire', actions: ['next', 'previous', 'skip'] },
            profileSetup: { id: 'profile_setup', title: 'おすすめプロファイル設定', type: 'configuration', actions: ['apply', 'customize', 'skip'] },
            featureDiscovery: { id: 'feature_discovery', title: '機能の発見', type: 'tour', actions: ['next', 'previous', 'finish'], features: [
                { id: 'keyboard_navigation', name: 'キーボードナビゲーション', description: 'Tabキーでゲーム操作', tips: ['Tabキーでフォーカス移動'] },
                { id: 'screen_reader', name: 'スクリーンリーダー対応', description: '音声読み上げ機能', tips: ['音声説明機能'] }
            ]},
            practiceSession: { id: 'practice_session', title: '練習セッション', type: 'interactive', actions: ['try', 'next', 'skip'] },
            completion: { id: 'completion', title: 'セットアップ完了', type: 'summary', actions: ['finish', 'review'] }
        };
    }

    /**
     * Setup step content with sub-components
     */
    async setupStepContent(step) {
        switch (step.type) {
            case 'questionnaire':
                await this.setupQuestionnaire(step);
                break;
            case 'configuration':
                await this.setupConfiguration(step);
                break;
            case 'tour':
                await this.setupFeatureTour(step);
                break;
            case 'interactive':
                await this.setupPracticeSession(step);
                break;
        }
    }

    /**
     * Setup practice session (simplified)
     */
    async setupPracticeSession(step) {
        // Delegate practice session to tutorial component
        await this.tutorial.conductPracticeSession('accessibility_practice', [
            { name: 'キーボード操作練習', task: 'キーボードナビゲーション' },
            { name: '設定変更練習', task: '設定変更' }
        ]);
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // Initialize sub-components
            this.flowManager.initialize(this.getUserProfile());
            this.tutorial.initialize();
            this.progressTracker.initialize(null, { totalSteps: Object.keys(this.onboardingSteps).length });
            
            this.loadOnboardingProgress();
            this.setupDiscoverySystem();
            this.createUI();
            this.bindEvents();
            
            // 自動開始チェック
            if (this.config.autoStart && !this.hasCompletedOnboarding()) {
                setTimeout(() => this.start(), 2000);
            }
            
            console.log('AccessibilityOnboarding initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ONBOARDING_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * オンボーディング進行状況の読み込み
     */
    loadOnboardingProgress() {
        try {
            const saved = localStorage.getItem('accessibilityOnboardingProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.state.completedSteps = new Set(progress.completedSteps || []);
                this.state.skippedSteps = new Set(progress.skippedSteps || []);
                this.state.userResponses = new Map(progress.userResponses || []);
            }
        } catch (error) {
            console.warn('Failed to load onboarding progress:', error);
        }
    }
    
    /**
     * オンボーディング完了チェック
     */
    hasCompletedOnboarding() {
        return this.state.completedSteps.has('completion') || 
               localStorage.getItem('accessibilityOnboardingCompleted') === 'true';
    }
    
    /**
     * UI作成
     */
    createUI() {
        // オーバーレイの作成
        this.ui.overlay = document.createElement('div');
        this.ui.overlay.className = 'accessibility-onboarding-overlay';
        this.ui.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 20000;
            display: none;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        // メインコンテナ
        this.ui.container = document.createElement('div');
        this.ui.container.className = 'onboarding-container';
        this.ui.container.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // アニメーション用CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .onboarding-step-enter {
                animation: stepEnter 0.4s ease-out;
            }
            
            @keyframes stepEnter {
                from { transform: translateX(30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .progress-bar-fill {
                transition: width 0.3s ease-out;
            }
            
            .feature-highlight {
                animation: highlight 2s infinite;
            }
            
            @keyframes highlight {
                0%, 100% { box-shadow: 0 0 0 rgba(52, 152, 219, 0); }
                50% { box-shadow: 0 0 20px rgba(52, 152, 219, 0.5); }
            }
        `;
        document.head.appendChild(style);
        
        this.ui.overlay.appendChild(this.ui.container);
        document.body.appendChild(this.ui.overlay);
    }
    
    /**
     * オンボーディング開始
     */
    async start() {
        if (this.state.isActive) return;
        
        this.state.isActive = true;
        this.analytics.sessionStart = Date.now();
        
        // Start flow management with sub-components
        const flowResult = await this.flowManager.manageOnboardingFlow(0);
        
        if (flowResult.success) {
            const steps = Object.keys(this.onboardingSteps);
            this.state.currentStep = steps[0];
            this.state.stepIndex = 0;
            this.state.progress = 0;
            
            this.ui.overlay.style.display = 'flex';
            this.showStep(this.state.currentStep);
            
            // Track progress with sub-component
            await this.progressTracker.trackProgress({
                stepIndex: 0,
                stepId: this.state.currentStep,
                stepType: 'start',
                totalSteps: steps.length
            });
        }
        
        console.log('Accessibility onboarding started');
        
        // イベント発火
        this.accessibilityManager?.eventSystem?.emit('onboardingStarted', {
            timestamp: Date.now()
        });
    }
    
    /**
     * ステップ表示
     */
    async showStep(stepId) {
        const step = this.onboardingSteps[stepId];
        if (!step) return;
        
        const stepStartTime = Date.now();
        this.analytics.stepTimings.set(stepId, { startTime: stepStartTime });
        
        // Update progress with progress tracker
        await this.progressTracker.trackProgress({
            stepIndex: this.state.stepIndex,
            stepId,
            stepType: step.type,
            totalSteps: Object.keys(this.onboardingSteps).length
        });
        
        // プログレスバーの更新
        this.updateProgress();
        
        // ステップコンテンツの作成（UI関連のみここで処理）
        this.ui.container.innerHTML = this.createStepHTML(step);
        this.ui.container.classList.add('onboarding-step-enter');
        
        // ステップ固有の処理は最小限に
        await this.setupStepContent(step);
        
        // イベントバインディング
        this.bindStepEvents();
        
        // アクセシビリティフォーカス
        const firstFocusable = this.ui.container.querySelector('button, input, [tabindex="0"]');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }
    
    /**
     * ステップHTML作成
     */
    createStepHTML(step) {
        const steps = Object.keys(this.onboardingSteps);
        const currentIndex = steps.indexOf(step.id);
        const totalSteps = steps.length;
        
        return `
            <div class="onboarding-header">
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${(currentIndex / (totalSteps - 1)) * 100}%"></div>
                    </div>
                    <div class="progress-text">${currentIndex + 1} / ${totalSteps}</div>
                </div>
                <button class="skip-button" onclick="accessibilityOnboarding.skip()">スキップ</button>
            </div>
            
            <div class="onboarding-content">
                <div class="step-header">
                    <div class="step-icon">${step.icon}</div>
                    <h2 class="step-title">${step.title}</h2>
                    <p class="step-description">${step.description}</p>
                </div>
                
                <div class="step-body" id="step-body-${step.id}">
                    ${this.createStepBodyHTML(step)}
                </div>
                
                <div class="step-actions">
                    ${this.createStepActionsHTML(step)}
                </div>
            </div>
        `;
    }
    
    /**
     * ステップボディHTML作成
     */
    createStepBodyHTML(step) {
        switch (step.type) {
            case 'introduction':
                return `
                    <div class="intro-content">
                        <p>このゲームには、さまざまなアクセシビリティ機能が搭載されています。</p>
                        <ul>
                            <li>視覚的な調整（コントラスト、テキストサイズ）</li>
                            <li>キーボードナビゲーション</li>
                            <li>スクリーンリーダー対応</li>
                            <li>音声・視覚フィードバック</li>
                            <li>認知サポート機能</li>
                        </ul>
                        <p>あなたに最適な設定を見つけるお手伝いをさせてください。</p>
                    </div>
                `;
                
            case 'questionnaire':
                return this.createQuestionnaireHTML(step);
                
            case 'configuration':
                return `
                    <div class="config-content">
                        <div id="recommended-profile">
                            <!-- プロファイル推奨結果がここに表示される -->
                        </div>
                    </div>
                `;
                
            case 'tour':
                return `
                    <div class="tour-content">
                        <div id="feature-showcase">
                            <!-- 機能紹介がここに表示される -->
                        </div>
                    </div>
                `;
                
            case 'interactive':
                return `
                    <div class="practice-content">
                        <div id="exercise-area">
                            <!-- 練習セッションがここに表示される -->
                        </div>
                    </div>
                `;
                
            case 'summary':
                return this.createSummaryHTML();
                
            default:
                return '<p>コンテンツを読み込み中...</p>';
        }
    }
    
    /**
     * 質問票HTML作成 (delegate to tutorial component)
     */
    createQuestionnaireHTML(step) {
        // Simplified - let tutorial component handle complex questionnaire logic
        return '<div id="questionnaire-content">Loading questionnaire...</div>';
    }
    
    /**
     * サマリーHTML作成 (simplified)
     */
    createSummaryHTML() {
        // Simplified summary - detailed stats handled by progress tracker
        return `
            <div class="summary-content">
                <div class="completion-message">
                    <h3>アクセシビリティ設定が完了しました！</h3>
                    <p>設定メニューからいつでも変更できます。</p>
                </div>
                <div id="detailed-summary">Loading summary...</div>
            </div>
        `;
    }
    
    /**
     * ステップアクションHTML作成
     */
    createStepActionsHTML(step) {
        const actions = [];
        
        step.actions.forEach(action => {
            switch (action) {
                case 'start':
                    actions.push('<button class="btn-primary btn-large" onclick="accessibilityOnboarding.next()">はじめる</button>');
                    break;
                case 'next':
                    actions.push('<button class="btn-primary" onclick="accessibilityOnboarding.next()">次へ</button>');
                    break;
                case 'previous':
                    actions.push('<button class="btn-secondary" onclick="accessibilityOnboarding.previous()">戻る</button>');
                    break;
                case 'skip':
                    actions.push('<button class="btn-tertiary" onclick="accessibilityOnboarding.skip()">スキップ</button>');
                    break;
                case 'finish':
                    actions.push('<button class="btn-primary btn-large" onclick="accessibilityOnboarding.complete()">完了</button>');
                    break;
                case 'apply':
                    actions.push('<button class="btn-primary" onclick="accessibilityOnboarding.applyRecommendation()">この設定を適用</button>');
                    break;
                case 'customize':
                    actions.push('<button class="btn-secondary" onclick="accessibilityOnboarding.customizeSettings()">詳細設定</button>');
                    break;
            }
        });
        
        return actions.join(' ');
    }
    
    /**
     * 質問票の設定 (simplified)
     */
    async setupQuestionnaire(step) {
        // Delegate questionnaire setup to tutorial component
        this.currentQuestionIndex = 0;
        this.questionResponses = new Map();
        
        // Let tutorial component handle the complex questionnaire logic
        await this.tutorial.deliverTutorialContent('assessment', this.getUserProfile());
    }
    
    /**
     * 次の質問へ (delegate to tutorial)
     */
    nextQuestion() {
        // Delegate question navigation to tutorial component
        this.tutorial.skipCurrentStep();
    }
    
    /**
     * 前の質問へ (simplified)
     */
    previousQuestion() {
        // Simplified navigation - tutorial component handles complex logic
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
        }
    }
    
    /**
     * 評価結果の処理 (simplified)
     */
    processAssessmentResults() {
        // Simplified - let progress tracker handle detailed analysis
        const results = { visual: 1, motor: 1, audio: 0, cognitive: 0 }; // Default results
        this.state.assessmentResults = results;
        this.recommendedProfile = this.determineRecommendedProfile(results);
    }
    
    /**
     * 推奨プロファイルの決定 (simplified)
     */
    determineRecommendedProfile(results) {
        // Simplified profile determination logic
        const maxScore = Math.max(...Object.values(results));
        if (maxScore === 0) return 'minimum-compliance';
        if (results.visual === maxScore) return 'visual-impairment';
        if (results.motor === maxScore) return 'motor-impairment';
        return 'minimum-compliance';
    }
    
    /**
     * 設定の設定 (simplified)
     */
    async setupConfiguration(step) {
        // Delegate configuration setup to tutorial component
        await this.tutorial.deliverTutorialContent('profile_setup', this.getUserProfile());
    }
    
    /**
     * 機能ツアーの設定
     */
    async setupFeatureTour(step) {
        this.currentFeatureIndex = 0;
        
        // Use tutorial sub-component for feature demonstration
        const featureList = step.features.map(f => f.id);
        await this.tutorial.demonstrateFeatures(featureList, 'interactive');
        
        this.showFeature(step.features[0]);
    }
    
    /**
     * 機能表示 (simplified)
     */
    showFeature(feature) {
        // Simplified feature display - let tutorial handle details
        const showcase = this.ui.container.querySelector('#feature-showcase');
        showcase.innerHTML = `<div class="feature-info"><h3>${feature.name}</h3><p>${feature.description}</p></div>`;
        this.analytics.featuresDiscovered++;
    }
    
    /**
     * 機能のデモンストレーション (simplified)
     */
    demonstrateFeature(featureId) {
        // Delegate feature demonstration to tutorial component
        this.tutorial.demonstrateFeatures([featureId], 'interactive');
    }
    
    /**
     * 発見システムの設定 (simplified)
     */
    setupDiscoverySystem() {
        if (!this.discoverySystem.enabled) return;
        
        // Basic tip setup - complex logic handled by tutorial component
        this.discoverySystem.contextualTips.set('basic-tip', {
            message: 'Tab キーでナビゲーション、設定は歯車ボタンから',
            trigger: 'basic',
            shown: false
        });
    }
    
    /**
     * コンテキストヒントの表示 (simplified)
     */
    showContextualTip() {
        // Basic tip display - delegate complex tips to tutorial
        console.log('Contextual tip would be shown here');
    }
    
    /**
     * 次のステップへ
     */
    async next() {
        const steps = Object.keys(this.onboardingSteps);
        const currentIndex = steps.indexOf(this.state.currentStep);
        
        if (currentIndex < steps.length - 1) {
            // Use flow manager for navigation
            const navigationResult = await this.flowManager.navigateToNextStep();
            
            if (navigationResult.success) {
                // 現在のステップを完了としてマーク
                this.state.completedSteps.add(this.state.currentStep);
                
                // Update progress with progress tracker
                await this.progressTracker.updateCompletionStatus({
                    stepIndex: currentIndex,
                    status: 'completed'
                });
                
                // 次のステップへ
                this.state.stepIndex = currentIndex + 1;
                this.state.currentStep = steps[this.state.stepIndex];
                this.showStep(this.state.currentStep);
            }
            
            this.saveProgress();
        } else {
            this.complete();
        }
    }
    
    /**
     * 前のステップへ
     */
    async previous() {
        const steps = Object.keys(this.onboardingSteps);
        const currentIndex = steps.indexOf(this.state.currentStep);
        
        if (currentIndex > 0) {
            // Use flow manager for backward navigation
            const navigationResult = await this.flowManager.navigateToPreviousStep();
            
            if (navigationResult.success) {
                this.state.stepIndex = currentIndex - 1;
                this.state.currentStep = steps[this.state.stepIndex];
                this.showStep(this.state.currentStep);
            }
        }
    }
    
    /**
     * ステップのスキップ
     */
    async skip() {
        this.state.skippedSteps.add(this.state.currentStep);
        
        // Use flow manager for skipping
        const skipResult = await this.flowManager.skipCurrentStep();
        
        if (skipResult.success) {
            await this.next();
        }
    }
    
    /**
     * 推奨設定の適用
     */
    applyRecommendation() {
        if (this.recommendedProfile && this.accessibilityManager?.profileManager) {
            this.accessibilityManager.profileManager.activateProfile(this.recommendedProfile);
            alert('推奨設定を適用しました！');
        }
        this.next();
    }
    
    /**
     * カスタム設定
     */
    customizeSettings() {
        if (this.accessibilityManager?.settingsUI) {
            this.accessibilityManager.settingsUI.open();
        }
        this.complete();
    }
    
    /**
     * 満足度評価の設定
     */
    setRating(rating) {
        this.analytics.satisfactionScore = rating;
        
        // 評価ボタンの視覚的フィードバック
        this.ui.container.querySelectorAll('.rating-button').forEach(btn => {
            btn.style.opacity = '0.3';
        });
        
        const selectedButton = this.ui.container.querySelector(`[data-rating="${rating}"]`);
        if (selectedButton) {
            selectedButton.style.opacity = '1';
            selectedButton.style.transform = 'scale(1.1)';
        }
    }
    
    /**
     * オンボーディング完了
     */
    async complete() {
        this.state.completedSteps.add('completion');
        this.analytics.completionRate = (this.state.completedSteps.size / Object.keys(this.onboardingSteps).length) * 100;
        
        // Update completion status with progress tracker
        await this.progressTracker.updateCompletionStatus({
            stepIndex: this.state.stepIndex,
            status: 'completed',
            milestone: { id: 'onboarding_complete', name: 'Onboarding Complete' }
        });
        
        // Get comprehensive progress report
        const progressReport = this.progressTracker.getProgressReport();
        
        // 完了フラグの保存
        localStorage.setItem('accessibilityOnboardingCompleted', 'true');
        this.saveProgress();
        this.saveAnalytics();
        
        // UI を閉じる
        this.close();
        
        // 完了通知
        this.showCompletionNotification();
        
        console.log('Accessibility onboarding completed');
        console.log('Analytics:', this.analytics);
        console.log('Progress Report:', progressReport);
        
        // イベント発火
        this.accessibilityManager?.eventSystem?.emit('onboardingCompleted', {
            analytics: this.analytics,
            progressReport,
            timestamp: Date.now()
        });
    }
    
    /**
     * 完了通知の表示
     */
    showCompletionNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 25000;
            text-align: center;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 1rem;">🎉</div>
            <h2 style="margin: 0 0 1rem 0; color: #2c3e50;">セットアップ完了！</h2>
            <p style="margin: 0 0 1.5rem 0; color: #7f8c8d;">アクセシビリティ機能の設定が完了しました。いつでも設定メニューから変更できます。</p>
            <button onclick="this.parentElement.remove()" 
                    style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600;">
                ゲームを始める
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // 自動削除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    /**
     * オンボーディングを閉じる
     */
    close() {
        this.ui.overlay.style.display = 'none';
        this.state.isActive = false;
    }
    
    /**
     * 進行状況の保存
     */
    saveProgress() {
        const progress = {
            completedSteps: Array.from(this.state.completedSteps),
            skippedSteps: Array.from(this.state.skippedSteps),
            userResponses: Array.from(this.state.userResponses.entries()),
            assessmentResults: this.state.assessmentResults,
            lastUpdated: Date.now()
        };
        
        localStorage.setItem('accessibilityOnboardingProgress', JSON.stringify(progress));
    }
    
    /**
     * 分析データの保存
     */
    saveAnalytics() {
        localStorage.setItem('accessibilityOnboardingAnalytics', JSON.stringify(this.analytics));
    }
    
    /**
     * プログレス更新
     */
    updateProgress() {
        const steps = Object.keys(this.onboardingSteps);
        const currentIndex = steps.indexOf(this.state.currentStep);
        this.state.progress = (currentIndex / (steps.length - 1)) * 100;
    }
    
    /**
     * イベントバインディング
     */
    bindEvents() {
        // ESC キーでオンボーディングを終了
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.state.isActive) {
                if (confirm('オンボーディングを中止しますか？')) {
                    this.close();
                }
            }
        });
    }
    
    /**
     * ステップイベントのバインディング
     */
    bindStepEvents() {
        // 動的に追加されるボタンのイベントは onclick 属性で処理
    }
    
    // パブリックAPI
    
    /**
     * オンボーディングの再開始
     */
    async restart() {
        // 進行状況をリセット
        this.state.completedSteps.clear();
        this.state.skippedSteps.clear();
        this.state.userResponses.clear();
        this.state.assessmentResults = null;
        
        // Reset sub-components
        this.flowManager.resetFlow();
        this.progressTracker.resetProgress();
        
        localStorage.removeItem('accessibilityOnboardingCompleted');
        localStorage.removeItem('accessibilityOnboardingProgress');
        
        await this.start();
    }
    
    /**
     * 特定のステップから開始
     */
    async startFromStep(stepId) {
        if (this.onboardingSteps[stepId]) {
            this.state.currentStep = stepId;
            const steps = Object.keys(this.onboardingSteps);
            this.state.stepIndex = steps.indexOf(stepId);
            
            // Use flow manager to jump to specific step
            const jumpResult = await this.flowManager.jumpToStep(this.state.stepIndex);
            
            if (jumpResult.success) {
                await this.start();
            }
        }
    }
    
    /**
     * 分析データの取得
     */
    getAnalytics() {
        // Combine analytics from main controller and sub-components
        const progressReport = this.progressTracker.getProgressReport();
        const flowAnalytics = this.flowManager.getFlowAnalytics();
        const tutorialAnalytics = this.tutorial.getTutorialAnalytics();
        
        return { 
            ...this.analytics,
            progressReport,
            flowAnalytics,
            tutorialAnalytics
        };
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.onboarding) {
            Object.assign(this.config, config.onboarding);
        }
        
        console.log('AccessibilityOnboarding configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        console.log(`AccessibilityOnboarding ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying AccessibilityOnboarding...');
        
        // Destroy sub-components
        if (this.flowManager) {
            this.flowManager.destroy();
        }
        if (this.tutorial) {
            this.tutorial.destroy();
        }
        if (this.progressTracker) {
            this.progressTracker.destroy();
        }
        
        // UI 要素の削除
        if (this.ui.overlay && this.ui.overlay.parentElement) {
            this.ui.overlay.parentElement.removeChild(this.ui.overlay);
        }
        
        // 分析データの最終保存
        this.saveAnalytics();
        
        console.log('AccessibilityOnboarding destroyed');
    }

    /**
     * Get user profile for flow manager initialization
     */
    getUserProfile() {
        // Create user profile from current state and assessment results
        if (this.state.assessmentResults) {
            return {
                experience: 'intermediate',
                disabilities: this.determineDisabilities(this.state.assessmentResults),
                preferences: this.determinePreferences(this.state.assessmentResults),
                assistiveTechnology: this.determineAssistiveTechnology(this.state.assessmentResults)
            };
        }
        return null;
    }

    /**
     * Determine disabilities from assessment results
     */
    determineDisabilities(results) {
        const disabilities = [];
        if (results.visual > 1) disabilities.push('visual');
        if (results.motor > 1) disabilities.push('motor');
        if (results.audio > 1) disabilities.push('hearing');
        return disabilities;
    }

    /**
     * Determine preferences from assessment results
     */
    determinePreferences(results) {
        return {
            keyboardOnly: results.motor > 1,
            highContrast: results.visual > 1,
            largeText: results.visual > 0
        };
    }

    /**
     * Determine assistive technology from assessment results
     */
    determineAssistiveTechnology(results) {
        return {
            screenReader: results.visual > 1,
            magnifier: results.visual > 0,
            voiceControl: results.motor > 1
        };
    }
}

// グローバル参照（UI イベント用）
if (typeof window !== 'undefined') {
    window.accessibilityOnboarding = null;
}