/**
 * SimplificationManager - UI複雑さ軽減管理システム
 * 
 * 認知負荷を軽減するためのUI簡素化機能を提供します。
 * WCAG 2.1 AAガイドラインに準拠した認知アクセシビリティ機能を実装します。
 */

export class SimplificationManager {
    /**
     * SimplificationManagerを初期化
     * @param {Object} gameEngine - ゲームエンジンインスタンス
     */
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isInitialized = false;
        
        // 設定とモード
        this.config = {
            // 基本設定
            enabled: true,
            defaultMode: 'standard',
            autoSimplification: false,
            adaptiveComplexity: true,
            
            // 簡素化レベル
            simplificationLevels: {
                none: {
                    name: '標準',
                    description: '通常の複雑さ',
                    complexity: 1.0,
                    features: {
                        allControls: true,
                        animations: true,
                        effects: true,
                        detailedInfo: true,
                        advancedOptions: true
                    }
                },
                minimal: {
                    name: '軽微簡素化',
                    description: '装飾的要素を軽減',
                    complexity: 0.8,
                    features: {
                        allControls: true,
                        animations: 'reduced',
                        effects: 'reduced',
                        detailedInfo: true,
                        advancedOptions: true
                    }
                },
                moderate: {
                    name: '中程度簡素化',
                    description: '重要な機能に集中',
                    complexity: 0.6,
                    features: {
                        allControls: 'essential',
                        animations: 'minimal',
                        effects: 'minimal',
                        detailedInfo: 'simplified',
                        advancedOptions: false
                    }
                },
                significant: {
                    name: '大幅簡素化',
                    description: '最小限のインターフェース',
                    complexity: 0.4,
                    features: {
                        allControls: 'basic',
                        animations: false,
                        effects: false,
                        detailedInfo: 'basic',
                        advancedOptions: false
                    }
                },
                extreme: {
                    name: '極限簡素化',
                    description: '必要最小限の要素のみ',
                    complexity: 0.2,
                    features: {
                        allControls: 'minimal',
                        animations: false,
                        effects: false,
                        detailedInfo: false,
                        advancedOptions: false
                    }
                }
            },
            
            // 簡素化モード
            modes: {
                // 標準モード
                standard: {
                    name: '標準',
                    description: '通常のインターフェース',
                    level: 'none',
                    settings: {
                        progressiveDisclosure: false,
                        clutterReduction: false,
                        visualHierarchy: 'normal',
                        informationDensity: 'normal',
                        navigationComplexity: 'full'
                    }
                },
                
                // 認知機能配慮モード
                cognitive: {
                    name: '認知機能配慮',
                    description: '認知負荷を軽減したインターフェース',
                    level: 'moderate',
                    settings: {
                        progressiveDisclosure: true,
                        clutterReduction: true,
                        visualHierarchy: 'enhanced',
                        informationDensity: 'low',
                        navigationComplexity: 'simplified',
                        focusAssistance: true,
                        chunking: true
                    }
                },
                
                // 初心者向けモード
                beginner: {
                    name: '初心者向け',
                    description: '学習しやすいシンプルなインターフェース',
                    level: 'minimal',
                    settings: {
                        progressiveDisclosure: true,
                        clutterReduction: true,
                        visualHierarchy: 'clear',
                        informationDensity: 'low',
                        navigationComplexity: 'guided',
                        tooltips: 'extensive',
                        stepByStep: true
                    }
                },
                
                // 集中モード
                focus: {
                    name: '集中モード',
                    description: '注意散漫を防ぐミニマルインターフェース',
                    level: 'significant',
                    settings: {
                        progressiveDisclosure: true,
                        clutterReduction: true,
                        visualHierarchy: 'minimal',
                        informationDensity: 'minimal',
                        navigationComplexity: 'hidden',
                        distractionRemoval: true,
                        singleTask: true
                    }
                },
                
                // アクセシビリティ最適化モード
                accessibility: {
                    name: 'アクセシビリティ最適化',
                    description: 'スクリーンリーダーに最適化',
                    level: 'moderate',
                    settings: {
                        progressiveDisclosure: true,
                        clutterReduction: true,
                        visualHierarchy: 'semantic',
                        informationDensity: 'structured',
                        navigationComplexity: 'linear',
                        screenReaderOptimized: true,
                        keyboardNavigation: 'enhanced'
                    }
                }
            }
        };
        
        // 状態管理
        this.state = {
            currentMode: 'standard',
            currentLevel: 'none',
            hiddenElements: new Set(),
            simplifiedElements: new Map(),
            progressiveSteps: new Map(),
            userPreferences: {
                preferredComplexity: 1.0,
                cognitiveLoad: 'normal',
                experienceLevel: 'intermediate',
                attentionSpan: 'normal'
            },
            adaptiveData: {
                interactionErrors: 0,
                timeSpentOnTasks: [],
                helpRequestFrequency: 0,
                navigationPatterns: []
            }
        };
        
        // UI要素の分類
        this.elementCategories = {
            essential: new Set([
                '.game-area',
                '.play-button',
                '.pause-button',
                '.score-display',
                '.main-menu-btn'
            ]),
            important: new Set([
                '.settings-btn',
                '.help-btn',
                '.volume-control',
                '.timer-display',
                '.level-indicator'
            ]),
            secondary: new Set([
                '.statistics-panel',
                '.achievement-notifications',
                '.detailed-score-breakdown',
                '.advanced-settings'
            ]),
            decorative: new Set([
                '.particle-effects',
                '.background-animations',
                '.decorative-borders',
                '.gradient-overlays',
                '.fancy-transitions'
            ]),
            advanced: new Set([
                '.debug-panel',
                '.performance-metrics',
                '.developer-options',
                '.experimental-features'
            ])
        };
        
        // プログレッシブディスクロージャー設定
        this.progressiveDisclosure = {
            enabled: false,
            currentStep: 0,
            totalSteps: 0,
            steps: [],
            completedSteps: new Set(),
            availableSteps: new Set()
        };
        
        // 視覚的階層の管理
        this.visualHierarchy = {
            levels: {
                primary: { size: '1.5em', weight: 'bold', color: '#000' },
                secondary: { size: '1.2em', weight: '600', color: '#333' },
                tertiary: { size: '1em', weight: 'normal', color: '#666' },
                quaternary: { size: '0.9em', weight: 'normal', color: '#999' }
            },
            spacing: {
                sections: '2rem',
                groups: '1.5rem',
                items: '1rem',
                related: '0.5rem'
            }
        };
        
        // イベントリスナー
        this.boundHandlers = {
            click: this.handleElementClick.bind(this),
            error: this.handleInteractionError.bind(this),
            helpRequest: this.handleHelpRequest.bind(this),
            taskComplete: this.handleTaskComplete.bind(this)
        };
        
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    async initialize() {
        try {
            console.log('SimplificationManager: 初期化開始');
            
            // 設定の読み込み
            await this.loadConfiguration();
            
            // UI要素の分析
            this.analyzeUIElements();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 初期モードの適用
            this.applyMode(this.config.defaultMode);
            
            // アクセシビリティマネージャーとの統合
            if (this.gameEngine.accessibilityManager) {
                this.integrateWithAccessibilityManager();
            }
            
            this.isInitialized = true;
            console.log('SimplificationManager: 初期化完了');
            
        } catch (error) {
            console.error('SimplificationManager: 初期化エラー:', error);
            throw error;
        }
    }
    
    /**
     * 設定を読み込み
     */
    async loadConfiguration() {
        try {
            // LocalStorageから設定を読み込み
            const savedConfig = localStorage.getItem('simplificationConfig');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.mergeConfig(parsed);
            }
            
            // ユーザープリファレンスの読み込み
            const savedPreferences = localStorage.getItem('simplificationPreferences');
            if (savedPreferences) {
                this.state.userPreferences = { ...this.state.userPreferences, ...JSON.parse(savedPreferences) };
            }
            
            // 適応データの読み込み
            const savedAdaptiveData = localStorage.getItem('simplificationAdaptiveData');
            if (savedAdaptiveData) {
                this.state.adaptiveData = { ...this.state.adaptiveData, ...JSON.parse(savedAdaptiveData) };
            }
            
        } catch (error) {
            console.warn('SimplificationManager: 設定読み込みエラー:', error);
        }
    }
    
    /**
     * UI要素を分析
     */
    analyzeUIElements() {
        // DOM内のすべての要素を分析してカテゴリーに分類
        const allElements = document.querySelectorAll('*');
        
        for (const element of allElements) {
            // 要素の重要度を判定
            const importance = this.determineElementImportance(element);
            
            // 認知負荷の計算
            const cognitiveLoad = this.calculateCognitiveLoad(element);
            
            // 要素の情報を保存
            if (!element.dataset.simplificationData) {
                element.dataset.simplificationData = JSON.stringify({
                    importance,
                    cognitiveLoad,
                    category: this.getElementCategory(element),
                    originalVisibility: element.style.display || 'block',
                    originalOpacity: element.style.opacity || '1'
                });
            }
        }
        
        console.log('SimplificationManager: UI要素の分析完了');
    }
    
    /**
     * 要素の重要度を判定
     */
    determineElementImportance(element) {
        let score = 0;
        
        // セマンティック要素の評価
        const semanticTags = ['main', 'nav', 'section', 'article', 'header', 'footer'];
        if (semanticTags.includes(element.tagName.toLowerCase())) {
            score += 3;
        }
        
        // ARIA属性の評価
        if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
            score += 2;
        }
        
        // インタラクティブ要素の評価
        const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'];
        if (interactiveTags.includes(element.tagName.toLowerCase())) {
            score += 2;
        }
        
        // クラス名による評価
        const importantClasses = ['primary', 'main', 'essential', 'critical'];
        const classList = Array.from(element.classList);
        if (classList.some(cls => importantClasses.some(important => cls.includes(important)))) {
            score += 2;
        }
        
        // 位置による評価（上部・中央は重要）
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.3) {
            score += 1;
        }
        
        return Math.min(score, 10); // 最大10点
    }
    
    /**
     * 認知負荷を計算
     */
    calculateCognitiveLoad(element) {
        let load = 0;
        
        // テキスト量の評価
        const textLength = element.textContent?.length || 0;
        load += Math.min(textLength / 100, 3); // 最大3点
        
        // 子要素数の評価
        const childCount = element.children.length;
        load += Math.min(childCount / 10, 2); // 最大2点
        
        // スタイルの複雑さ
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.animation !== 'none') load += 1;
        if (computedStyle.transform !== 'none') load += 1;
        if (computedStyle.boxShadow !== 'none') load += 0.5;
        if (computedStyle.borderRadius !== '0px') load += 0.5;
        
        // 色の複雑さ
        const hasGradient = computedStyle.background.includes('gradient');
        if (hasGradient) load += 1;
        
        return Math.min(load, 10); // 最大10点
    }
    
    /**
     * 要素のカテゴリーを取得
     */
    getElementCategory(element) {
        // セレクターベースでカテゴリーを判定
        for (const [category, selectors] of Object.entries(this.elementCategories)) {
            for (const selector of selectors) {
                if (element.matches(selector)) {
                    return category;
                }
            }
        }
        
        // フォールバック判定
        const importance = this.determineElementImportance(element);
        if (importance >= 7) return 'essential';
        if (importance >= 5) return 'important';
        if (importance >= 3) return 'secondary';
        if (importance >= 1) return 'decorative';
        return 'advanced';
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // UI要素のクリック追跡
        document.addEventListener('click', this.boundHandlers.click);
        
        // エラー追跡
        window.addEventListener('error', this.boundHandlers.error);
        
        // ゲームエンジンイベント
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.on('helpRequested', this.boundHandlers.helpRequest);
            this.gameEngine.eventEmitter.on('taskCompleted', this.boundHandlers.taskComplete);
            this.gameEngine.eventEmitter.on('userFrustration', this.handleUserFrustration.bind(this));
        }
        
        // キーボードショートカット
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+S で簡素化設定を開く
            if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
                event.preventDefault();
                this.openSimplificationSettings();
            }
            
            // F2 で次の簡素化レベルに切り替え
            if (event.code === 'F2') {
                event.preventDefault();
                this.cycleSimplificationLevel();
            }
        });
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
        
        // 推奨モードの取得
        const recommendedMode = this.getRecommendedMode(accessibilityManager.getCurrentSettings());
        if (recommendedMode !== this.state.currentMode) {
            this.suggestModeChange(recommendedMode);
        }
    }
    
    /**
     * 要素クリックを処理
     */
    handleElementClick(event) {
        const element = event.target;
        const data = this.getElementData(element);
        
        // インタラクション分析
        this.analyzeInteraction(element, data);
        
        // 適応学習
        if (this.config.adaptiveComplexity) {
            this.updateAdaptiveData('click', element, data);
        }
    }
    
    /**
     * インタラクションエラーを処理
     */
    handleInteractionError(error) {
        this.state.adaptiveData.interactionErrors++;
        
        // エラー頻度が高い場合、簡素化を提案
        if (this.state.adaptiveData.interactionErrors > 5) {
            this.suggestSimplification('error');
        }
    }
    
    /**
     * ヘルプリクエストを処理
     */
    handleHelpRequest(request) {
        this.state.adaptiveData.helpRequestFrequency++;
        
        // ヘルプリクエストが多い場合、UI簡素化を提案
        if (this.state.adaptiveData.helpRequestFrequency > 3) {
            this.suggestSimplification('help');
        }
    }
    
    /**
     * タスク完了を処理
     */
    handleTaskComplete(task) {
        const completionTime = task.completionTime || Date.now() - task.startTime;
        this.state.adaptiveData.timeSpentOnTasks.push(completionTime);
        
        // 完了時間が長い場合、簡素化を検討
        const averageTime = this.state.adaptiveData.timeSpentOnTasks.reduce((a, b) => a + b, 0) / 
                           this.state.adaptiveData.timeSpentOnTasks.length;
        
        if (averageTime > 30000) { // 30秒以上
            this.suggestSimplification('slow');
        }
    }
    
    /**
     * ユーザーのフラストレーションを処理
     */
    handleUserFrustration(frustrationData) {
        // フラストレーション要因を分析
        const causes = frustrationData.causes || [];
        
        if (causes.includes('complexity') || causes.includes('confusion')) {
            this.suggestSimplification('frustration');
        }
    }
    
    /**
     * モードを適用
     */
    applyMode(modeName) {
        if (!this.config.modes[modeName]) {
            console.warn(`SimplificationManager: 不明なモード: ${modeName}`);
            return false;
        }
        
        const mode = this.config.modes[modeName];
        this.state.currentMode = modeName;
        this.state.currentLevel = mode.level;
        
        // モード設定を適用
        this.applyModeSettings(mode.settings);
        
        // レベル設定を適用
        this.applySimplificationLevel(mode.level);
        
        // 設定を保存
        localStorage.setItem('simplificationMode', modeName);
        
        // イベントを発火
        this.emitEvent('modeChanged', { mode: modeName, settings: mode });
        
        console.log(`SimplificationManager: モード "${mode.name}" を適用`);
        return true;
    }
    
    /**
     * モード設定を適用
     */
    applyModeSettings(settings) {
        // プログレッシブディスクロージャー
        if (settings.progressiveDisclosure) {
            this.enableProgressiveDisclosure();
        } else {
            this.disableProgressiveDisclosure();
        }
        
        // クラッター削減
        if (settings.clutterReduction) {
            this.reduceClutter();
        } else {
            this.restoreClutter();
        }
        
        // 視覚的階層の調整
        this.adjustVisualHierarchy(settings.visualHierarchy || 'normal');
        
        // 情報密度の調整
        this.adjustInformationDensity(settings.informationDensity || 'normal');
        
        // ナビゲーション複雑さの調整
        this.adjustNavigationComplexity(settings.navigationComplexity || 'full');
        
        // 特別な設定
        if (settings.focusAssistance) {
            this.enableFocusAssistance();
        }
        
        if (settings.chunking) {
            this.enableInformationChunking();
        }
        
        if (settings.distractionRemoval) {
            this.removeDistractions();
        }
        
        if (settings.singleTask) {
            this.enableSingleTaskMode();
        }
    }
    
    /**
     * 簡素化レベルを適用
     */
    applySimplificationLevel(levelName) {
        const level = this.config.simplificationLevels[levelName];
        if (!level) return;
        
        const features = level.features;
        
        // コントロールの簡素化
        this.simplifyControls(features.allControls);
        
        // アニメーションの調整
        this.adjustAnimations(features.animations);
        
        // エフェクトの調整
        this.adjustEffects(features.effects);
        
        // 詳細情報の調整
        this.adjustDetailedInfo(features.detailedInfo);
        
        // 高度なオプションの表示/非表示
        this.toggleAdvancedOptions(features.advancedOptions);
    }
    
    /**
     * プログレッシブディスクロージャーを有効化
     */
    enableProgressiveDisclosure() {
        this.progressiveDisclosure.enabled = true;
        
        // UI要素をステップに分類
        this.createProgressiveSteps();
        
        // 最初のステップのみ表示
        this.showProgressiveStep(0);
        
        console.log('SimplificationManager: プログレッシブディスクロージャーを有効化');
    }
    
    /**
     * プログレッシブステップを作成
     */
    createProgressiveSteps() {
        const steps = [
            {
                name: 'ゲーム開始',
                description: 'ゲームを始めるために必要な基本操作',
                elements: ['.game-area', '.play-button', '.pause-button'],
                completed: false
            },
            {
                name: '基本情報',
                description: 'スコアやタイマーなどの基本情報',
                elements: ['.score-display', '.timer-display'],
                completed: false
            },
            {
                name: 'ゲーム設定',
                description: '音量やその他の設定',
                elements: ['.settings-btn', '.volume-control'],
                completed: false
            },
            {
                name: 'アドバンス機能',
                description: '統計や実績などの高度な機能',
                elements: ['.statistics-panel', '.achievement-notifications'],
                completed: false
            }
        ];
        
        this.progressiveDisclosure.steps = steps;
        this.progressiveDisclosure.totalSteps = steps.length;
        this.progressiveDisclosure.currentStep = 0;
    }
    
    /**
     * プログレッシブステップを表示
     */
    showProgressiveStep(stepIndex) {
        if (stepIndex >= this.progressiveDisclosure.steps.length) return;
        
        const step = this.progressiveDisclosure.steps[stepIndex];
        
        // このステップの要素を表示
        step.elements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = '';
                element.style.opacity = '1';
                this.state.hiddenElements.delete(selector);
            });
        });
        
        // 進捗インジケーターを更新
        this.updateProgressIndicator(stepIndex);
        
        // 次のステップボタンを表示（最後のステップでない場合）
        if (stepIndex < this.progressiveDisclosure.steps.length - 1) {
            this.showNextStepButton(stepIndex);
        }
        
        this.progressiveDisclosure.currentStep = stepIndex;
        this.progressiveDisclosure.availableSteps.add(stepIndex);
    }
    
    /**
     * 次のステップボタンを表示
     */
    showNextStepButton(currentStep) {
        // 既存のボタンを削除
        const existingButton = document.querySelector('.next-step-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        const button = document.createElement('button');
        button.className = 'next-step-button';
        button.innerHTML = `
            <div class="button-content">
                <span class="button-text">次の機能を表示</span>
                <span class="button-hint">${this.progressiveDisclosure.steps[currentStep + 1]?.name}</span>
            </div>
        `;
        
        // スタイルを適用
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            padding: 15px 25px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-family: inherit;
            transition: all 0.3s ease;
            animation: pulseGlow 2s ease-in-out infinite;
        `;
        
        // クリックイベント
        button.addEventListener('click', () => {
            this.showProgressiveStep(currentStep + 1);
            button.remove();
        });
        
        document.body.appendChild(button);
        
        // アニメーションスタイルを追加
        if (!document.getElementById('progressive-disclosure-styles')) {
            const styles = document.createElement('style');
            styles.id = 'progressive-disclosure-styles';
            styles.textContent = `
                @keyframes pulseGlow {
                    0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
                    50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
                }
                
                .next-step-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                }
                
                .button-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .button-text {
                    font-size: 14px;
                    font-weight: 600;
                }
                
                .button-hint {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 2px;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    /**
     * 進捗インジケーターを更新
     */
    updateProgressIndicator(currentStep) {
        // 既存のインジケーターを削除
        const existingIndicator = document.querySelector('.progress-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'progress-indicator';
        
        const progress = ((currentStep + 1) / this.progressiveDisclosure.totalSteps) * 100;
        
        indicator.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    ステップ ${currentStep + 1} / ${this.progressiveDisclosure.totalSteps}: 
                    ${this.progressiveDisclosure.steps[currentStep].name}
                </div>
            </div>
        `;
        
        // スタイルを適用
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 10px 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: inherit;
        `;
        
        document.body.appendChild(indicator);
        
        // プログレスバーのスタイル
        if (!document.getElementById('progress-indicator-styles')) {
            const styles = document.createElement('style');
            styles.id = 'progress-indicator-styles';
            styles.textContent = `
                .progress-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                
                .progress-bar {
                    width: 200px;
                    height: 6px;
                    background: #f0f0f0;
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 0.5s ease;
                }
                
                .progress-text {
                    font-size: 12px;
                    color: #666;
                    text-align: center;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    /**
     * プログレッシブディスクロージャーを無効化
     */
    disableProgressiveDisclosure() {
        this.progressiveDisclosure.enabled = false;
        
        // すべての要素を表示
        document.querySelectorAll('*').forEach(element => {
            if (this.state.hiddenElements.has(element)) {
                element.style.display = '';
                element.style.opacity = '1';
            }
        });
        
        this.state.hiddenElements.clear();
        
        // UI要素を削除
        const nextStepButton = document.querySelector('.next-step-button');
        if (nextStepButton) nextStepButton.remove();
        
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) progressIndicator.remove();
        
        console.log('SimplificationManager: プログレッシブディスクロージャーを無効化');
    }
    
    /**
     * クラッターを削減
     */
    reduceClutter() {
        // 装飾的要素を非表示
        this.elementCategories.decorative.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
                this.state.hiddenElements.add(selector);
            });
        });
        
        // 二次的要素を薄く表示
        this.elementCategories.secondary.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '0.6';
                this.state.simplifiedElements.set(selector, { opacity: '0.6' });
            });
        });
        
        console.log('SimplificationManager: クラッター削減を適用');
    }
    
    /**
     * クラッターを復元
     */
    restoreClutter() {
        // 非表示要素を復元
        this.state.hiddenElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const data = this.getElementData(element);
                element.style.display = data.originalVisibility || '';
            });
        });
        
        // 簡素化要素を復元
        this.state.simplifiedElements.forEach((styles, selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const data = this.getElementData(element);
                element.style.opacity = data.originalOpacity || '1';
            });
        });
        
        this.state.hiddenElements.clear();
        this.state.simplifiedElements.clear();
        
        console.log('SimplificationManager: クラッター復元を適用');
    }
    
    /**
     * 視覚的階層を調整
     */
    adjustVisualHierarchy(level) {
        const hierarchyStyles = document.getElementById('visual-hierarchy-styles') || 
                               document.createElement('style');
        hierarchyStyles.id = 'visual-hierarchy-styles';
        
        let css = '';
        
        switch (level) {
            case 'enhanced':
                css = `
                    h1, .primary-heading { font-size: 2em !important; font-weight: bold !important; color: #000 !important; margin-bottom: 1.5rem !important; }
                    h2, .secondary-heading { font-size: 1.5em !important; font-weight: 600 !important; color: #333 !important; margin-bottom: 1.2rem !important; }
                    h3, .tertiary-heading { font-size: 1.2em !important; font-weight: 500 !important; color: #555 !important; margin-bottom: 1rem !important; }
                    .content-section { margin-bottom: 2.5rem !important; padding: 1.5rem !important; border: 2px solid #eee !important; border-radius: 8px !important; }
                `;
                break;
                
            case 'clear':
                css = `
                    h1, .primary-heading { font-size: 1.8em !important; font-weight: bold !important; color: #000 !important; margin-bottom: 1.2rem !important; }
                    h2, .secondary-heading { font-size: 1.4em !important; font-weight: 600 !important; color: #333 !important; margin-bottom: 1rem !important; }
                    .content-section { margin-bottom: 2rem !important; padding: 1.2rem !important; border: 1px solid #ddd !important; }
                `;
                break;
                
            case 'minimal':
                css = `
                    h1, h2, h3, .heading { font-size: 1.2em !important; font-weight: 600 !important; color: #333 !important; margin-bottom: 0.8rem !important; }
                    .content-section { margin-bottom: 1.5rem !important; }
                `;
                break;
                
            case 'semantic':
                css = `
                    [role="heading"][aria-level="1"], h1 { font-size: 1.8em !important; font-weight: bold !important; }
                    [role="heading"][aria-level="2"], h2 { font-size: 1.5em !important; font-weight: 600 !important; }
                    [role="heading"][aria-level="3"], h3 { font-size: 1.2em !important; font-weight: 500 !important; }
                    [role="main"], main { padding: 2rem !important; }
                    [role="navigation"], nav { margin-bottom: 2rem !important; }
                `;
                break;
        }
        
        hierarchyStyles.textContent = css;
        document.head.appendChild(hierarchyStyles);
        
        console.log(`SimplificationManager: 視覚的階層を "${level}" に調整`);
    }
    
    /**
     * 情報密度を調整
     */
    adjustInformationDensity(level) {
        const densityStyles = document.getElementById('information-density-styles') || 
                             document.createElement('style');
        densityStyles.id = 'information-density-styles';
        
        let css = '';
        
        switch (level) {
            case 'low':
                css = `
                    * { line-height: 1.8 !important; }
                    p, .text-content { margin-bottom: 1.5rem !important; font-size: 1.1em !important; }
                    .content-container { padding: 2rem !important; }
                    .grid, .flex-container { gap: 2rem !important; }
                    button, .btn { padding: 1rem 2rem !important; margin: 0.5rem !important; }
                `;
                break;
                
            case 'minimal':
                css = `
                    * { line-height: 2 !important; }
                    p, .text-content { margin-bottom: 2rem !important; font-size: 1.2em !important; }
                    .content-container { padding: 3rem !important; }
                    .grid, .flex-container { gap: 3rem !important; }
                    button, .btn { padding: 1.5rem 2.5rem !important; margin: 1rem !important; font-size: 1.1em !important; }
                `;
                break;
                
            case 'structured':
                css = `
                    .info-group { margin-bottom: 2rem !important; padding: 1.5rem !important; border: 1px solid #ddd !important; }
                    .info-label { font-weight: 600 !important; margin-bottom: 0.5rem !important; }
                    .info-value { margin-bottom: 1rem !important; }
                `;
                break;
        }
        
        densityStyles.textContent = css;
        document.head.appendChild(densityStyles);
        
        console.log(`SimplificationManager: 情報密度を "${level}" に調整`);
    }
    
    /**
     * ナビゲーション複雑さを調整
     */
    adjustNavigationComplexity(level) {
        const navElements = document.querySelectorAll('nav, .navigation, .menu');
        
        switch (level) {
            case 'simplified':
                navElements.forEach(nav => {
                    // 副次的なナビゲーション項目を非表示
                    const secondaryItems = nav.querySelectorAll('.secondary, .submenu, .dropdown');
                    secondaryItems.forEach(item => {
                        item.style.display = 'none';
                        this.state.hiddenElements.add(item);
                    });
                });
                break;
                
            case 'guided':
                navElements.forEach(nav => {
                    // ガイド的なナビゲーションを追加
                    const guide = document.createElement('div');
                    guide.className = 'navigation-guide';
                    guide.innerHTML = `
                        <div class="guide-content">
                            <h3>ナビゲーションガイド</h3>
                            <p>以下の項目から選択してください：</p>
                        </div>
                    `;
                    nav.insertBefore(guide, nav.firstChild);
                });
                break;
                
            case 'linear':
                // リニアナビゲーションを強制
                navElements.forEach(nav => {
                    nav.style.display = 'flex';
                    nav.style.flexDirection = 'column';
                    nav.style.gap = '1rem';
                });
                break;
                
            case 'hidden':
                navElements.forEach(nav => {
                    if (!nav.classList.contains('primary-nav')) {
                        nav.style.display = 'none';
                        this.state.hiddenElements.add(nav);
                    }
                });
                break;
        }
        
        console.log(`SimplificationManager: ナビゲーション複雑さを "${level}" に調整`);
    }
    
    /**
     * コントロールを簡素化
     */
    simplifyControls(level) {
        const controls = document.querySelectorAll('button, input, select, .control');
        
        switch (level) {
            case 'essential':
                controls.forEach(control => {
                    const importance = this.determineElementImportance(control);
                    if (importance < 7) {
                        control.style.display = 'none';
                        this.state.hiddenElements.add(control);
                    }
                });
                break;
                
            case 'basic':
                controls.forEach(control => {
                    const importance = this.determineElementImportance(control);
                    if (importance < 5) {
                        control.style.display = 'none';
                        this.state.hiddenElements.add(control);
                    }
                });
                break;
                
            case 'minimal':
                controls.forEach(control => {
                    const importance = this.determineElementImportance(control);
                    if (importance < 3) {
                        control.style.display = 'none';
                        this.state.hiddenElements.add(control);
                    }
                });
                break;
        }
        
        console.log(`SimplificationManager: コントロールを "${level}" に簡素化`);
    }
    
    /**
     * アニメーションを調整
     */
    adjustAnimations(level) {
        const animationStyles = document.getElementById('animation-adjustment-styles') || 
                               document.createElement('style');
        animationStyles.id = 'animation-adjustment-styles';
        
        let css = '';
        
        switch (level) {
            case 'reduced':
                css = `
                    * { 
                        animation-duration: 0.5s !important; 
                        transition-duration: 0.3s !important; 
                    }
                    .fancy-animation, .complex-transition { 
                        animation: none !important; 
                        transition: opacity 0.3s ease !important; 
                    }
                `;
                break;
                
            case 'minimal':
                css = `
                    * { 
                        animation-duration: 0.2s !important; 
                        transition-duration: 0.1s !important; 
                    }
                    .decorative-animation { 
                        animation: none !important; 
                    }
                `;
                break;
                
            case false:
                css = `
                    *, *::before, *::after { 
                        animation: none !important; 
                        transition: none !important; 
                    }
                `;
                break;
        }
        
        animationStyles.textContent = css;
        document.head.appendChild(animationStyles);
        
        console.log(`SimplificationManager: アニメーションを "${level}" に調整`);
    }
    
    /**
     * エフェクトを調整
     */
    adjustEffects(level) {
        const effectElements = document.querySelectorAll('.particle-effect, .visual-effect, .glow, .shadow');
        
        switch (level) {
            case 'reduced':
                effectElements.forEach(element => {
                    element.style.opacity = '0.5';
                    this.state.simplifiedElements.set(element, { opacity: '0.5' });
                });
                break;
                
            case 'minimal':
                effectElements.forEach(element => {
                    element.style.opacity = '0.2';
                    this.state.simplifiedElements.set(element, { opacity: '0.2' });
                });
                break;
                
            case false:
                effectElements.forEach(element => {
                    element.style.display = 'none';
                    this.state.hiddenElements.add(element);
                });
                break;
        }
        
        console.log(`SimplificationManager: エフェクトを "${level}" に調整`);
    }
    
    /**
     * 詳細情報を調整
     */
    adjustDetailedInfo(level) {
        const detailElements = document.querySelectorAll('.detailed-info, .statistics, .advanced-info');
        
        switch (level) {
            case 'simplified':
                detailElements.forEach(element => {
                    // 重要な情報のみ表示
                    const importantInfo = element.querySelectorAll('.important, .critical');
                    const otherInfo = element.querySelectorAll(':not(.important):not(.critical)');
                    
                    otherInfo.forEach(info => {
                        info.style.display = 'none';
                        this.state.hiddenElements.add(info);
                    });
                });
                break;
                
            case 'basic':
                detailElements.forEach(element => {
                    element.style.opacity = '0.7';
                    this.state.simplifiedElements.set(element, { opacity: '0.7' });
                });
                break;
                
            case false:
                detailElements.forEach(element => {
                    element.style.display = 'none';
                    this.state.hiddenElements.add(element);
                });
                break;
        }
        
        console.log(`SimplificationManager: 詳細情報を "${level}" に調整`);
    }
    
    /**
     * 高度なオプションの表示を切り替え
     */
    toggleAdvancedOptions(show) {
        const advancedElements = document.querySelectorAll('.advanced-options, .expert-mode, .developer-tools');
        
        advancedElements.forEach(element => {
            if (show) {
                element.style.display = '';
                this.state.hiddenElements.delete(element);
            } else {
                element.style.display = 'none';
                this.state.hiddenElements.add(element);
            }
        });
        
        console.log(`SimplificationManager: 高度なオプションを ${show ? '表示' : '非表示'}`);
    }
    
    /**
     * フォーカス支援を有効化
     */
    enableFocusAssistance() {
        const focusStyles = document.getElementById('focus-assistance-styles') || 
                           document.createElement('style');
        focusStyles.id = 'focus-assistance-styles';
        
        focusStyles.textContent = `
            :focus, .focused {
                outline: 3px solid #007acc !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 5px rgba(0, 122, 204, 0.3) !important;
                z-index: 1000 !important;
                position: relative !important;
            }
            
            .focus-helper {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 122, 204, 0.9);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                z-index: 10001;
                pointer-events: none;
            }
        `;
        
        document.head.appendChild(focusStyles);
        
        // フォーカス追跡
        document.addEventListener('focusin', (event) => {
            this.showFocusHelper(event.target);
        });
        
        document.addEventListener('focusout', () => {
            this.hideFocusHelper();
        });
        
        console.log('SimplificationManager: フォーカス支援を有効化');
    }
    
    /**
     * フォーカスヘルパーを表示
     */
    showFocusHelper(element) {
        let helper = document.querySelector('.focus-helper');
        if (!helper) {
            helper = document.createElement('div');
            helper.className = 'focus-helper';
            document.body.appendChild(helper);
        }
        
        const text = element.getAttribute('aria-label') || 
                    element.getAttribute('title') || 
                    element.textContent?.slice(0, 30) || 
                    element.tagName.toLowerCase();
        
        helper.textContent = `フォーカス中: ${text}`;
        helper.style.display = 'block';
    }
    
    /**
     * フォーカスヘルパーを非表示
     */
    hideFocusHelper() {
        const helper = document.querySelector('.focus-helper');
        if (helper) {
            helper.style.display = 'none';
        }
    }
    
    /**
     * 情報チャンキングを有効化
     */
    enableInformationChunking() {
        const textElements = document.querySelectorAll('p, div, span');
        
        textElements.forEach(element => {
            const text = element.textContent;
            if (text && text.length > 100) {
                // 長いテキストを段落に分割
                const chunks = text.match(/.{1,80}(?:\s|$)/g) || [text];
                
                if (chunks.length > 1) {
                    element.innerHTML = chunks.map(chunk => 
                        `<span class="text-chunk">${chunk.trim()}</span>`
                    ).join('<br><br>');
                }
            }
        });
        
        const chunkingStyles = document.getElementById('chunking-styles') || 
                              document.createElement('style');
        chunkingStyles.id = 'chunking-styles';
        
        chunkingStyles.textContent = `
            .text-chunk {
                display: inline-block;
                margin-bottom: 0.5rem;
                line-height: 1.6;
            }
        `;
        
        document.head.appendChild(chunkingStyles);
        
        console.log('SimplificationManager: 情報チャンキングを有効化');
    }
    
    /**
     * 注意散漫要素を削除
     */
    removeDistractions() {
        const distractingElements = document.querySelectorAll(
            '.notification, .popup, .banner, .advertisement, .sidebar'
        );
        
        distractingElements.forEach(element => {
            element.style.display = 'none';
            this.state.hiddenElements.add(element);
        });
        
        // 点滅や動きのある要素を停止
        const movingElements = document.querySelectorAll('[class*="blink"], [class*="flash"], [class*="bounce"]');
        movingElements.forEach(element => {
            element.style.animation = 'none';
        });
        
        console.log('SimplificationManager: 注意散漫要素を削除');
    }
    
    /**
     * シングルタスクモードを有効化
     */
    enableSingleTaskMode() {
        // 現在のフォーカス要素以外をモーダル風に覆う
        const overlay = document.createElement('div');
        overlay.className = 'single-task-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        
        // フォーカス要素のハイライト
        document.addEventListener('focusin', (event) => {
            const focusedElement = event.target;
            focusedElement.style.zIndex = '10000';
            focusedElement.style.position = 'relative';
            focusedElement.style.background = 'white';
            focusedElement.style.padding = '1rem';
            focusedElement.style.borderRadius = '8px';
            focusedElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        });
        
        console.log('SimplificationManager: シングルタスクモードを有効化');
    }
    
    /**
     * 要素データを取得
     */
    getElementData(element) {
        try {
            return JSON.parse(element.dataset.simplificationData || '{}');
        } catch {
            return {};
        }
    }
    
    /**
     * インタラクションを分析
     */
    analyzeInteraction(element, data) {
        // インタラクション時間を測定
        const startTime = Date.now();
        
        // エラー検出
        if (data.cognitiveLoad > 7) {
            console.log('SimplificationManager: 高い認知負荷を検出:', element);
        }
        
        // ナビゲーションパターンを記録
        this.state.adaptiveData.navigationPatterns.push({
            element: element.tagName,
            class: element.className,
            timestamp: startTime,
            cognitiveLoad: data.cognitiveLoad
        });
    }
    
    /**
     * 適応データを更新
     */
    updateAdaptiveData(action, element, data) {
        // 複雑さに基づく適応
        if (data.cognitiveLoad > 8) {
            this.state.userPreferences.preferredComplexity -= 0.1;
        } else if (data.cognitiveLoad < 3) {
            this.state.userPreferences.preferredComplexity += 0.05;
        }
        
        // 好ましい複雑さの範囲を制限
        this.state.userPreferences.preferredComplexity = Math.max(0.2, Math.min(1.0, 
            this.state.userPreferences.preferredComplexity));
        
        // 設定を保存
        this.saveConfiguration();
    }
    
    /**
     * 簡素化を提案
     */
    suggestSimplification(reason) {
        const currentLevel = this.state.currentLevel;
        const levels = Object.keys(this.config.simplificationLevels);
        const currentIndex = levels.indexOf(currentLevel);
        
        if (currentIndex < levels.length - 1) {
            const suggestedLevel = levels[currentIndex + 1];
            this.showSimplificationSuggestion(suggestedLevel, reason);
        }
    }
    
    /**
     * 簡素化提案を表示
     */
    showSimplificationSuggestion(suggestedLevel, reason) {
        const level = this.config.simplificationLevels[suggestedLevel];
        const reasonText = {
            error: 'エラーが多く発生しています',
            help: 'ヘルプリクエストが多くなっています',
            slow: '操作に時間がかかっています',
            frustration: 'フラストレーションが検出されました'
        };
        
        const suggestion = document.createElement('div');
        suggestion.className = 'simplification-suggestion';
        suggestion.innerHTML = `
            <div class="suggestion-content">
                <div class="suggestion-icon">💡</div>
                <div class="suggestion-text">
                    <h3>UI簡素化の提案</h3>
                    <p>${reasonText[reason]}。</p>
                    <p>「${level.name}」モードに切り替えることをお勧めします。</p>
                </div>
                <div class="suggestion-actions">
                    <button class="accept-simplification-btn">適用する</button>
                    <button class="dismiss-simplification-btn">今回は見送る</button>
                </div>
            </div>
        `;
        
        // スタイルを適用
        suggestion.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: white;
            border: 2px solid #f39c12;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 350px;
            animation: slideInLeft 0.3s ease-out;
        `;
        
        // ボタンイベント
        const acceptBtn = suggestion.querySelector('.accept-simplification-btn');
        const dismissBtn = suggestion.querySelector('.dismiss-simplification-btn');
        
        acceptBtn.addEventListener('click', () => {
            this.applySimplificationLevel(suggestedLevel);
            suggestion.remove();
        });
        
        dismissBtn.addEventListener('click', () => {
            suggestion.remove();
        });
        
        document.body.appendChild(suggestion);
        
        // 自動削除
        setTimeout(() => {
            if (suggestion.parentNode) {
                suggestion.remove();
            }
        }, 15000);
    }
    
    /**
     * 簡素化レベルを循環
     */
    cycleSimplificationLevel() {
        const levels = Object.keys(this.config.simplificationLevels);
        const currentIndex = levels.indexOf(this.state.currentLevel);
        const nextIndex = (currentIndex + 1) % levels.length;
        const nextLevel = levels[nextIndex];
        
        this.applySimplificationLevel(nextLevel);
        
        // フィードバックを表示
        this.showLevelChangeFeedback(nextLevel);
    }
    
    /**
     * レベル変更フィードバックを表示
     */
    showLevelChangeFeedback(level) {
        const levelConfig = this.config.simplificationLevels[level];
        
        const feedback = document.createElement('div');
        feedback.className = 'level-change-feedback';
        feedback.innerHTML = `
            <div class="feedback-content">
                <div class="feedback-icon">🎯</div>
                <div class="feedback-text">${levelConfig.name}に変更しました</div>
            </div>
        `;
        
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(52, 73, 94, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 25px;
            z-index: 10001;
            font-size: 16px;
            animation: fadeInScale 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'fadeOutScale 0.3s ease-in';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
    
    /**
     * 簡素化設定を開く
     */
    openSimplificationSettings() {
        // 設定パネルのイベントを発火
        this.emitEvent('openSimplificationSettings', {
            currentMode: this.state.currentMode,
            currentLevel: this.state.currentLevel,
            availableModes: Object.keys(this.config.modes),
            availableLevels: Object.keys(this.config.simplificationLevels)
        });
    }
    
    /**
     * 推奨モードを取得
     */
    getRecommendedMode(accessibilitySettings) {
        if (accessibilitySettings.cognitiveImpairment) {
            return 'cognitive';
        }
        
        if (accessibilitySettings.beginnerMode) {
            return 'beginner';
        }
        
        if (accessibilitySettings.screenReaderUser) {
            return 'accessibility';
        }
        
        if (accessibilitySettings.attentionDeficit) {
            return 'focus';
        }
        
        return 'standard';
    }
    
    /**
     * モード変更を提案
     */
    suggestModeChange(recommendedMode) {
        const mode = this.config.modes[recommendedMode];
        
        console.log(`SimplificationManager: 「${mode.name}」モードを推奨します`);
        
        this.emitEvent('modeRecommendation', {
            recommended: recommendedMode,
            current: this.state.currentMode
        });
    }
    
    /**
     * アクセシビリティ設定変更を処理
     */
    handleAccessibilitySettingsChange(settings) {
        const recommendedMode = this.getRecommendedMode(settings);
        
        if (recommendedMode !== this.state.currentMode) {
            if (this.config.autoSimplification) {
                this.applyMode(recommendedMode);
            } else {
                this.suggestModeChange(recommendedMode);
            }
        }
    }
    
    /**
     * 設定をマージ
     */
    mergeConfig(newConfig) {
        this.config = this.deepMerge(this.config, newConfig);
    }
    
    /**
     * 設定を保存
     */
    saveConfiguration() {
        try {
            localStorage.setItem('simplificationConfig', JSON.stringify(this.config));
            localStorage.setItem('simplificationPreferences', JSON.stringify(this.state.userPreferences));
            localStorage.setItem('simplificationAdaptiveData', JSON.stringify(this.state.adaptiveData));
        } catch (error) {
            console.warn('SimplificationManager: 設定保存エラー:', error);
        }
    }
    
    /**
     * イベントを発火
     */
    emitEvent(eventName, data) {
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.emit(`simplification:${eventName}`, data);
        }
        
        const customEvent = new CustomEvent(`simplification:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(customEvent);
    }
    
    /**
     * 深い結合を実行
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    /**
     * パブリックAPI: 現在の状態を取得
     */
    getCurrentState() {
        return {
            mode: this.state.currentMode,
            level: this.state.currentLevel,
            hiddenElementsCount: this.state.hiddenElements.size,
            simplifiedElementsCount: this.state.simplifiedElements.size,
            progressiveDisclosureEnabled: this.progressiveDisclosure.enabled,
            currentStep: this.progressiveDisclosure.currentStep,
            userPreferences: { ...this.state.userPreferences }
        };
    }
    
    /**
     * パブリックAPI: 利用可能なモードを取得
     */
    getAvailableModes() {
        return Object.keys(this.config.modes).map(key => ({
            id: key,
            name: this.config.modes[key].name,
            description: this.config.modes[key].description,
            current: key === this.state.currentMode
        }));
    }
    
    /**
     * パブリックAPI: 統計を取得
     */
    getStatistics() {
        return {
            currentComplexity: this.state.userPreferences.preferredComplexity,
            interactionErrors: this.state.adaptiveData.interactionErrors,
            helpRequestFrequency: this.state.adaptiveData.helpRequestFrequency,
            averageTaskTime: this.state.adaptiveData.timeSpentOnTasks.length > 0 ?
                this.state.adaptiveData.timeSpentOnTasks.reduce((a, b) => a + b, 0) / 
                this.state.adaptiveData.timeSpentOnTasks.length : 0,
            navigationPatternsCount: this.state.adaptiveData.navigationPatterns.length
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // イベントリスナーを削除
        document.removeEventListener('click', this.boundHandlers.click);
        window.removeEventListener('error', this.boundHandlers.error);
        
        // UI要素を復元
        this.restoreClutter();
        this.disableProgressiveDisclosure();
        
        // 追加したスタイルを削除
        const stylesToRemove = [
            'visual-hierarchy-styles',
            'information-density-styles',
            'animation-adjustment-styles',
            'focus-assistance-styles',
            'chunking-styles',
            'progressive-disclosure-styles',
            'progress-indicator-styles'
        ];
        
        stylesToRemove.forEach(id => {
            const style = document.getElementById(id);
            if (style) style.remove();
        });
        
        // 設定を保存
        this.saveConfiguration();
        
        console.log('SimplificationManager: クリーンアップ完了');
    }
}