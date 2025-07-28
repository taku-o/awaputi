/**
 * AccessibilityOnboarding - アクセシビリティオンボーディング・発見システム
 * 機能発見フロー・ガイド付きセットアップ・ベストプラクティス教育
 * 段階的学習とパーソナライズされたアクセシビリティ体験
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

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
        
        // オンボーディングステップ定義
        this.onboardingSteps = {
            welcome: {
                id: 'welcome',
                title: 'アクセシビリティ機能へようこそ',
                description: 'あなたに最適なアクセシビリティ設定を見つけましょう',
                icon: '👋',
                type: 'introduction',
                duration: 'short',
                actions: ['start', 'skip'],
                importance: 'high'
            },
            
            assessment: {
                id: 'assessment',
                title: 'アクセシビリティニーズ評価',
                description: 'あなたのニーズを理解するためのいくつかの質問にお答えください',
                icon: '📋',
                type: 'questionnaire',
                duration: 'medium',
                actions: ['next', 'previous', 'skip'],
                importance: 'high',
                questions: [
                    {
                        id: 'visual_needs',
                        type: 'multiple',
                        question: '視覚的なサポートが必要な項目はありますか？',
                        options: [
                            { id: 'none', text: '特にない', weight: 0 },
                            { id: 'contrast', text: '文字や背景のコントラストを高くしたい', weight: 1 },
                            { id: 'size', text: '文字を大きくしたい', weight: 1 },
                            { id: 'screen_reader', text: 'スクリーンリーダーを使用している', weight: 2 },
                            { id: 'magnifier', text: '画面の拡大機能を使用している', weight: 2 }
                        ]
                    },
                    {
                        id: 'motor_needs',
                        type: 'multiple',
                        question: '操作に関するサポートが必要な項目はありますか？',
                        options: [
                            { id: 'none', text: '特にない', weight: 0 },
                            { id: 'keyboard_only', text: 'キーボードのみで操作したい', weight: 2 },
                            { id: 'slow_input', text: 'ゆっくりとした操作を希望する', weight: 1 },
                            { id: 'alternative_input', text: '代替入力デバイスを使用している', weight: 2 },
                            { id: 'one_handed', text: '片手での操作を希望する', weight: 1 }
                        ]
                    },
                    {
                        id: 'audio_needs',
                        type: 'multiple',
                        question: '音声に関するサポートが必要な項目はありますか？',
                        options: [
                            { id: 'none', text: '特にない', weight: 0 },
                            { id: 'captions', text: '音声の字幕が必要', weight: 2 },
                            { id: 'visual_alerts', text: '音の代わりに視覚的な通知が欲しい', weight: 1 },
                            { id: 'volume_control', text: '細かい音量調整が必要', weight: 1 },
                            { id: 'no_audio', text: '音声を使用しない', weight: 2 }
                        ]
                    },
                    {
                        id: 'cognitive_needs',
                        type: 'multiple',
                        question: '理解しやすさに関するサポートが必要な項目はありますか？',
                        options: [
                            { id: 'none', text: '特にない', weight: 0 },
                            { id: 'simple_ui', text: 'シンプルなインターフェースを希望する', weight: 1 },
                            { id: 'help_system', text: '詳しいヘルプやガイドが欲しい', weight: 1 },
                            { id: 'error_help', text: 'エラー時のサポートが欲しい', weight: 1 },
                            { id: 'memory_aids', text: '記憶を助ける機能が欲しい', weight: 1 }
                        ]
                    }
                ]
            },
            
            profileSetup: {
                id: 'profile_setup',
                title: 'おすすめプロファイル設定',
                description: '評価結果に基づいて、最適なプロファイルを設定します',
                icon: '⚙️',
                type: 'configuration',
                duration: 'medium',
                actions: ['apply', 'customize', 'skip'],
                importance: 'high'
            },
            
            featureDiscovery: {
                id: 'feature_discovery',
                title: '機能の発見',
                description: '利用可能なアクセシビリティ機能をご紹介します',
                icon: '🔍',
                type: 'tour',
                duration: 'long',
                actions: ['next', 'previous', 'finish'],
                importance: 'medium',
                features: [
                    {
                        id: 'keyboard_navigation',
                        name: 'キーボードナビゲーション',
                        description: 'Tabキーやショートカットキーでゲームを操作できます',
                        demoElement: '.game-area',
                        tips: ['Tabキーでフォーカス移動', 'Enterキーで決定', 'Escキーでキャンセル']
                    },
                    {
                        id: 'screen_reader',
                        name: 'スクリーンリーダー対応',
                        description: 'ゲーム内容が音声で読み上げられます',
                        demoElement: '.game-info',
                        tips: ['ゲーム状況の音声説明', 'ボタンや要素の読み上げ', 'エラーメッセージの通知']
                    },
                    {
                        id: 'visual_customization',
                        name: '視覚カスタマイズ',
                        description: '色やコントラスト、テキストサイズを調整できます',
                        demoElement: '.settings-panel',
                        tips: ['高コントラストモード', 'テキストサイズ調整', '色覚サポート']
                    }
                ]
            },
            
            practiceSession: {
                id: 'practice_session',
                title: '練習セッション',
                description: 'アクセシビリティ機能を実際に試してみましょう',
                icon: '🎯',
                type: 'interactive',
                duration: 'long',
                actions: ['try', 'next', 'skip'],
                importance: 'medium',
                exercises: [
                    {
                        id: 'keyboard_exercise',
                        name: 'キーボード操作練習',
                        description: 'キーボードでゲーム要素を操作してみましょう',
                        task: 'Tabキーを使って3つのボタンを順番に選択してください',
                        success_criteria: 'all_buttons_focused'
                    },
                    {
                        id: 'settings_exercise',
                        name: '設定変更練習',
                        description: 'アクセシビリティ設定を変更してみましょう',
                        task: 'テキストサイズを変更して、効果を確認してください',
                        success_criteria: 'setting_changed'
                    }
                ]
            },
            
            completion: {
                id: 'completion',
                title: 'セットアップ完了',
                description: 'アクセシビリティセットアップが完了しました！',
                icon: '🎉',
                type: 'summary',
                duration: 'short',
                actions: ['finish', 'review'],
                importance: 'low'
            }
        };
        
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
     * 初期化
     */
    initialize() {
        try {
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
    start() {
        if (this.state.isActive) return;
        
        this.state.isActive = true;
        this.analytics.sessionStart = Date.now();
        
        const steps = Object.keys(this.onboardingSteps);
        this.state.currentStep = steps[0];
        this.state.stepIndex = 0;
        this.state.progress = 0;
        
        this.ui.overlay.style.display = 'flex';
        this.showStep(this.state.currentStep);
        
        console.log('Accessibility onboarding started');
        
        // イベント発火
        this.accessibilityManager?.eventSystem?.emit('onboardingStarted', {
            timestamp: Date.now()
        });
    }
    
    /**
     * ステップ表示
     */
    showStep(stepId) {
        const step = this.onboardingSteps[stepId];
        if (!step) return;
        
        const stepStartTime = Date.now();
        this.analytics.stepTimings.set(stepId, { startTime: stepStartTime });
        
        // プログレスバーの更新
        this.updateProgress();
        
        // ステップコンテンツの作成
        this.ui.container.innerHTML = this.createStepHTML(step);
        this.ui.container.classList.add('onboarding-step-enter');
        
        // ステップ固有の処理
        switch (step.type) {
            case 'questionnaire':
                this.setupQuestionnaire(step);
                break;
            case 'configuration':
                this.setupConfiguration(step);
                break;
            case 'tour':
                this.setupFeatureTour(step);
                break;
            case 'interactive':
                this.setupPracticeSession(step);
                break;
        }
        
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
     * 質問票HTML作成
     */
    createQuestionnaireHTML(step) {
        if (!step.questions) return '';
        
        return step.questions.map((question, index) => `
            <div class="question-item ${index === 0 ? 'active' : 'hidden'}" data-question="${question.id}">
                <h3 class="question-title">${question.question}</h3>
                <div class="question-options">
                    ${question.options.map(option => `
                        <label class="option-label">
                            <input type="checkbox" name="${question.id}" value="${option.id}" data-weight="${option.weight}">
                            <span class="option-text">${option.text}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="question-navigation">
                    ${index > 0 ? '<button class="btn-secondary" onclick="accessibilityOnboarding.previousQuestion()">戻る</button>' : ''}
                    <button class="btn-primary" onclick="accessibilityOnboarding.nextQuestion()">
                        ${index < step.questions.length - 1 ? '次へ' : '完了'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * サマリーHTML作成
     */
    createSummaryHTML() {
        const featuresCount = this.analytics.featuresDiscovered;
        const completionTime = this.analytics.sessionStart ? 
            Math.round((Date.now() - this.analytics.sessionStart) / 1000) : 0;
        
        return `
            <div class="summary-content">
                <div class="completion-stats">
                    <div class="stat-item">
                        <div class="stat-number">${featuresCount}</div>
                        <div class="stat-label">機能を発見</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${Math.floor(completionTime / 60)}</div>
                        <div class="stat-label">分で完了</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.state.completedSteps.size}</div>
                        <div class="stat-label">ステップ完了</div>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>次にできること</h3>
                    <ul>
                        <li>設定メニューからいつでもアクセシビリティ設定を変更できます</li>
                        <li>「?」ボタンでヘルプとヒントを確認できます</li>
                        <li>プロファイルを切り替えて、異なる設定を試すことができます</li>
                    </ul>
                </div>
                
                <div class="feedback-section">
                    <h4>この体験はいかがでしたか？</h4>
                    <div class="satisfaction-rating">
                        ${[1,2,3,4,5].map(rating => `
                            <button class="rating-button" data-rating="${rating}" onclick="accessibilityOnboarding.setRating(${rating})">
                                ${'⭐'.repeat(rating)}
                            </button>
                        `).join('')}
                    </div>
                </div>
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
     * 質問票の設定
     */
    setupQuestionnaire(step) {
        this.currentQuestionIndex = 0;
        this.questionResponses = new Map();
        
        // CSSスタイルの追加
        const style = document.createElement('style');
        style.textContent = `
            .question-item {
                transition: all 0.3s ease-out;
            }
            
            .question-item.hidden {
                display: none;
            }
            
            .question-item.active {
                display: block;
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .option-label {
                display: block;
                padding: 12px 16px;
                margin: 8px 0;
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .option-label:hover {
                background: #e3f2fd;
                border-color: #2196f3;
            }
            
            .option-label input:checked + .option-text {
                font-weight: 600;
                color: #1976d2;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 次の質問へ
     */
    nextQuestion() {
        const step = this.onboardingSteps[this.state.currentStep];
        const currentQuestion = step.questions[this.currentQuestionIndex];
        
        // 現在の質問の回答を保存
        const selectedOptions = Array.from(
            this.ui.container.querySelectorAll(`input[name="${currentQuestion.id}"]:checked`)
        ).map(input => ({
            id: input.value,
            weight: parseInt(input.dataset.weight)
        }));
        
        this.questionResponses.set(currentQuestion.id, selectedOptions);
        this.state.userResponses.set(currentQuestion.id, selectedOptions);
        
        // 次の質問または完了
        if (this.currentQuestionIndex < step.questions.length - 1) {
            // 現在の質問を非表示
            const currentQuestionElement = this.ui.container.querySelector('.question-item.active');
            currentQuestionElement.classList.remove('active');
            currentQuestionElement.classList.add('hidden');
            
            // 次の質問を表示
            this.currentQuestionIndex++;
            const nextQuestionElement = this.ui.container.querySelector(
                `[data-question="${step.questions[this.currentQuestionIndex].id}"]`
            );
            nextQuestionElement.classList.remove('hidden');
            nextQuestionElement.classList.add('active');
        } else {
            // 質問票完了 - 評価結果を計算
            this.processAssessmentResults();
            this.next();
        }
    }
    
    /**
     * 前の質問へ
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            // 現在の質問を非表示
            const currentQuestionElement = this.ui.container.querySelector('.question-item.active');
            currentQuestionElement.classList.remove('active');
            currentQuestionElement.classList.add('hidden');
            
            // 前の質問を表示
            this.currentQuestionIndex--;
            const prevQuestionElement = this.ui.container.querySelector(
                `[data-question="${this.onboardingSteps[this.state.currentStep].questions[this.currentQuestionIndex].id}"]`
            );
            prevQuestionElement.classList.remove('hidden');
            prevQuestionElement.classList.add('active');
        }
    }
    
    /**
     * 評価結果の処理
     */
    processAssessmentResults() {
        const results = {
            visual: 0,
            motor: 0,
            audio: 0,
            cognitive: 0
        };
        
        // 回答からスコアを計算
        this.questionResponses.forEach((responses, questionId) => {
            responses.forEach(response => {
                switch (questionId) {
                    case 'visual_needs':
                        results.visual += response.weight;
                        break;
                    case 'motor_needs':
                        results.motor += response.weight;
                        break;
                    case 'audio_needs':
                        results.audio += response.weight;
                        break;
                    case 'cognitive_needs':
                        results.cognitive += response.weight;
                        break;
                }
            });
        });
        
        // 最適なプロファイルを推奨
        this.state.assessmentResults = results;
        this.recommendedProfile = this.determineRecommendedProfile(results);
        
        console.log('Assessment results:', results);
        console.log('Recommended profile:', this.recommendedProfile);
    }
    
    /**
     * 推奨プロファイルの決定
     */
    determineRecommendedProfile(results) {
        const maxScore = Math.max(...Object.values(results));
        
        if (maxScore === 0) {
            return 'minimum-compliance';
        }
        
        // 最高スコアのカテゴリに基づいて推奨
        if (results.visual === maxScore) {
            return 'visual-impairment';
        } else if (results.motor === maxScore) {
            return 'motor-impairment';
        } else if (results.audio === maxScore) {
            return 'hearing-impairment';
        } else if (results.cognitive === maxScore) {
            return 'cognitive-support';
        }
        
        // 複数カテゴリで同点の場合
        if (results.visual >= 2 && results.motor >= 2) {
            return 'visual-impairment'; // 視覚を優先
        }
        
        return 'minimum-compliance';
    }
    
    /**
     * 設定の設定
     */
    setupConfiguration(step) {
        const profileContainer = this.ui.container.querySelector('#recommended-profile');
        
        if (this.recommendedProfile && this.accessibilityManager?.profileManager) {
            const profile = this.accessibilityManager.profileManager.getProfile(this.recommendedProfile);
            
            if (profile) {
                profileContainer.innerHTML = `
                    <div class="recommended-profile">
                        <div class="profile-header">
                            <div class="profile-icon">${profile.icon}</div>
                            <div class="profile-info">
                                <h3 class="profile-name">${profile.name}</h3>
                                <p class="profile-description">${profile.description}</p>
                            </div>
                        </div>
                        
                        <div class="profile-features">
                            <h4>このプロファイルで有効になる機能：</h4>
                            <ul>
                                ${this.getProfileFeaturesList(profile)}
                            </ul>
                        </div>
                        
                        <div class="assessment-summary">
                            <h4>あなたの評価結果：</h4>
                            ${this.getAssessmentSummary()}
                        </div>
                    </div>
                `;
            }
        }
    }
    
    /**
     * プロファイル機能リストの取得
     */
    getProfileFeaturesList(profile) {
        const features = [];
        
        if (profile.settings.textScaling > 1.0) {
            features.push('テキストサイズの拡大');
        }
        if (profile.settings.colorContrast !== 'normal') {
            features.push('高コントラスト表示');
        }
        if (profile.settings.keyboardNavigation) {
            features.push('キーボードナビゲーション');
        }
        if (profile.settings.screenReaderSupport) {
            features.push('スクリーンリーダー対応');
        }
        if (profile.settings.showCaptions) {
            features.push('字幕表示');
        }
        if (profile.settings.alternativeInput) {
            features.push('代替入力方法');
        }
        if (profile.settings.uiSimplification !== 'none') {
            features.push('UI簡素化');
        }
        
        return features.map(feature => `<li>${feature}</li>`).join('');
    }
    
    /**
     * 評価サマリーの取得
     */
    getAssessmentSummary() {
        if (!this.state.assessmentResults) return '';
        
        const results = this.state.assessmentResults;
        const items = [];
        
        if (results.visual > 0) items.push(`視覚サポート: ${results.visual}点`);
        if (results.motor > 0) items.push(`操作サポート: ${results.motor}点`);
        if (results.audio > 0) items.push(`音声サポート: ${results.audio}点`);
        if (results.cognitive > 0) items.push(`認知サポート: ${results.cognitive}点`);
        
        return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
    
    /**
     * 機能ツアーの設定
     */
    setupFeatureTour(step) {
        this.currentFeatureIndex = 0;
        this.showFeature(step.features[0]);
    }
    
    /**
     * 機能表示
     */
    showFeature(feature) {
        const showcase = this.ui.container.querySelector('#feature-showcase');
        
        showcase.innerHTML = `
            <div class="feature-showcase">
                <div class="feature-info">
                    <h3>${feature.name}</h3>
                    <p>${feature.description}</p>
                    
                    <div class="feature-tips">
                        <h4>使い方のヒント：</h4>
                        <ul>
                            ${feature.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="feature-demo">
                    <button class="demo-button" onclick="accessibilityOnboarding.demonstrateFeature('${feature.id}')">
                        この機能を試してみる
                    </button>
                </div>
            </div>
        `;
        
        // 対象要素のハイライト
        if (feature.demoElement) {
            const targetElement = document.querySelector(feature.demoElement);
            if (targetElement) {
                targetElement.classList.add('feature-highlight');
                setTimeout(() => {
                    targetElement.classList.remove('feature-highlight');
                }, 3000);
            }
        }
        
        this.analytics.featuresDiscovered++;
    }
    
    /**
     * 機能のデモンストレーション
     */
    demonstrateFeature(featureId) {
        switch (featureId) {
            case 'keyboard_navigation':
                this.demoKeyboardNavigation();
                break;
            case 'screen_reader':
                this.demoScreenReader();
                break;
            case 'visual_customization':
                this.demoVisualCustomization();
                break;
        }
    }
    
    /**
     * キーボードナビゲーションのデモ
     */
    demoKeyboardNavigation() {
        alert('Tab キーを押してゲーム内の要素を順番に選択してみてください。Enter キーで選択、Escape キーでキャンセルできます。');
        
        // デモ用の一時的なフォーカス表示強化
        const style = document.createElement('style');
        style.id = 'demo-focus-style';
        style.textContent = `
            *:focus {
                outline: 3px solid #ff6b6b !important;
                outline-offset: 2px !important;
                animation: focusDemo 1s infinite;
            }
            
            @keyframes focusDemo {
                0%, 100% { outline-color: #ff6b6b; }
                50% { outline-color: #4ecdc4; }
            }
        `;
        document.head.appendChild(style);
        
        // 5秒後にスタイルを削除
        setTimeout(() => {
            const demoStyle = document.getElementById('demo-focus-style');
            if (demoStyle) demoStyle.remove();
        }, 5000);
    }
    
    /**
     * 発見システムの設定
     */
    setupDiscoverySystem() {
        if (!this.discoverySystem.enabled) return;
        
        // コンテキストヒントの設定
        this.discoverySystem.contextualTips.set('game-start', {
            message: 'キーボードの Tab キーでゲーム要素を選択できます',
            trigger: 'gameStart',
            shown: false
        });
        
        this.discoverySystem.contextualTips.set('settings-available', {
            message: 'アクセシビリティ設定はメニューから変更できます',
            trigger: 'menuOpen',
            shown: false
        });
        
        // 定期的なヒント表示
        if (this.discoverySystem.showInterval > 0) {
            setInterval(() => {
                this.showContextualTip();
            }, this.discoverySystem.showInterval);
        }
    }
    
    /**
     * コンテキストヒントの表示
     */
    showContextualTip() {
        const availableTips = Array.from(this.discoverySystem.contextualTips.values())
            .filter(tip => !tip.shown);
        
        if (availableTips.length === 0) return;
        
        const tip = availableTips[Math.floor(Math.random() * availableTips.length)];
        this.displayTip(tip);
        tip.shown = true;
    }
    
    /**
     * ヒントの表示
     */
    displayTip(tip) {
        const tipElement = document.createElement('div');
        tipElement.className = 'accessibility-tip';
        tipElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2196f3;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            max-width: 300px;
            z-index: 15000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: tipSlideIn 0.3s ease-out;
        `;
        
        tipElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">💡 ヒント</div>
                    <div style="font-size: 14px;">${tip.message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 8px;">×</button>
            </div>
        `;
        
        document.body.appendChild(tipElement);
        
        // 8秒後に自動削除
        setTimeout(() => {
            if (tipElement.parentElement) {
                tipElement.style.animation = 'tipSlideOut 0.3s ease-out';
                setTimeout(() => {
                    if (tipElement.parentElement) {
                        tipElement.parentElement.removeChild(tipElement);
                    }
                }, 300);
            }
        }, 8000);
        
        // アニメーション用CSS
        if (!document.getElementById('tip-animations')) {
            const style = document.createElement('style');
            style.id = 'tip-animations';
            style.textContent = `
                @keyframes tipSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes tipSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 次のステップへ
     */
    next() {
        const steps = Object.keys(this.onboardingSteps);
        const currentIndex = steps.indexOf(this.state.currentStep);
        
        if (currentIndex < steps.length - 1) {
            // 現在のステップを完了としてマーク
            this.state.completedSteps.add(this.state.currentStep);
            
            // 次のステップへ
            this.state.stepIndex = currentIndex + 1;
            this.state.currentStep = steps[this.state.stepIndex];
            this.showStep(this.state.currentStep);
            
            this.saveProgress();
        } else {
            this.complete();
        }
    }
    
    /**
     * 前のステップへ
     */
    previous() {
        const steps = Object.keys(this.onboardingSteps);
        const currentIndex = steps.indexOf(this.state.currentStep);
        
        if (currentIndex > 0) {
            this.state.stepIndex = currentIndex - 1;
            this.state.currentStep = steps[this.state.stepIndex];
            this.showStep(this.state.currentStep);
        }
    }
    
    /**
     * ステップのスキップ
     */
    skip() {
        this.state.skippedSteps.add(this.state.currentStep);
        this.next();
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
    complete() {
        this.state.completedSteps.add('completion');
        this.analytics.completionRate = (this.state.completedSteps.size / Object.keys(this.onboardingSteps).length) * 100;
        
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
        
        // イベント発火
        this.accessibilityManager?.eventSystem?.emit('onboardingCompleted', {
            analytics: this.analytics,
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
    restart() {
        // 進行状況をリセット
        this.state.completedSteps.clear();
        this.state.skippedSteps.clear();
        this.state.userResponses.clear();
        this.state.assessmentResults = null;
        
        localStorage.removeItem('accessibilityOnboardingCompleted');
        localStorage.removeItem('accessibilityOnboardingProgress');
        
        this.start();
    }
    
    /**
     * 特定のステップから開始
     */
    startFromStep(stepId) {
        if (this.onboardingSteps[stepId]) {
            this.state.currentStep = stepId;
            const steps = Object.keys(this.onboardingSteps);
            this.state.stepIndex = steps.indexOf(stepId);
            this.start();
        }
    }
    
    /**
     * 分析データの取得
     */
    getAnalytics() {
        return { ...this.analytics };
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
        
        // UI 要素の削除
        if (this.ui.overlay && this.ui.overlay.parentElement) {
            this.ui.overlay.parentElement.removeChild(this.ui.overlay);
        }
        
        // 分析データの最終保存
        this.saveAnalytics();
        
        console.log('AccessibilityOnboarding destroyed');
    }
}

// グローバル参照（UI イベント用）
if (typeof window !== 'undefined') {
    window.accessibilityOnboarding = null;
}