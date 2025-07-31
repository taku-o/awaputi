/**
 * ContextManager.js
 * コンテキスト検出とツールチップ管理クラス
 * 現在の状況に応じた適切なヘルプコンテンツの提供を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * コンテキスト管理クラス
 */
export class ContextManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // コンテキスト検出
        this.currentContext = null;
        this.contextHistory = [];
        this.contextDetectors = new Map();
        
        // ツールチップ管理
        this.activeTooltips = new Map();
        this.tooltipRegistry = new Map();
        this.tooltipElements = new Map();
        this.currentTooltip = null;
        this.contextCache = new Map();
        this.tooltipConfig = {
            showDelay: 800,
            hideDelay: 300,
            maxWidth: 300,
            maxHeight: 200
        };
        
        // 動的ヘルプ
        this.helpProviders = new Map();
        this.userBehaviorTracker = {
            actions: [],
            patterns: new Map(),
            lastActivity: null
        };
        
        this.initialize();
    }

    /**
     * コンテキストマネージャーの初期化
     */
    initialize() {
        try {
            this.loggingSystem.info('ContextManager', 'Initializing context manager...');
            
            // デフォルトコンテキスト検出器の設定
            this.setupDefaultDetectors();
            
            // ツールチップ登録の設定
            this.setupTooltipRegistry();
            
            // ヘルププロバイダーの設定
            this.setupHelpProviders();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            this.loggingSystem.info('ContextManager', 'Context manager initialized successfully');
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to initialize context manager', error);
            ErrorHandler.handle(error, 'ContextManager.initialize');
        }
    }

    /**
     * 現在のコンテキストを検出
     * @returns {Object|null} 現在のコンテキスト情報
     */
    detectCurrentContext() {
        try {
            const context = {
                scene: this.getCurrentScene(),
                gameState: this.getGameState(),
                userInterface: this.getUIState(),
                userAction: this.getLastUserAction(),
                timestamp: Date.now()
            };

            // コンテキスト検出器を実行
            for (const [name, detector] of this.contextDetectors.entries()) {
                try {
                    const detected = detector(context);
                    if (detected) {
                        context[name] = detected;
                    }
                } catch (error) {
                    this.loggingSystem.error('ContextManager', `Detector error: ${name}`, error);
                }
            }

            // コンテキスト履歴に追加
            if (!this.isContextSimilar(context, this.currentContext)) {
                this.contextHistory.push(this.currentContext);
                if (this.contextHistory.length > 10) {
                    this.contextHistory.shift();
                }
                this.currentContext = context;
            }

            this.loggingSystem.debug('ContextManager', `Context detected: ${context.scene}`);
            return context;
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to detect current context', error);
            return null;
        }
    }

    /**
     * 関連するヘルプの取得
     * @param {Object} context - コンテキスト情報
     * @returns {Array} 関連ヘルプ一覧
     */
    getRelevantHelp(context) {
        try {
            const relevantHelp = [];
            
            // シーンベースのヘルプ
            const sceneHelp = this.getSceneHelp(context.scene);
            if (sceneHelp) {
                relevantHelp.push(...sceneHelp);
            }
            
            // アクションベースのヘルプ
            if (context.userAction) {
                const actionHelp = this.getActionHelp(context.userAction);
                if (actionHelp) {
                    relevantHelp.push(...actionHelp);
                }
            }
            
            // 状況ベースのヘルプ
            const situationalHelp = this.getSituationalHelp(context);
            if (situationalHelp) {
                relevantHelp.push(...situationalHelp);
            }
            
            // 重複排除とスコアリング
            const uniqueHelp = this.deduplicateAndScore(relevantHelp, context);
            
            this.loggingSystem.debug('ContextManager', `Found ${uniqueHelp.length} relevant help items`);
            return uniqueHelp;
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to get relevant help', error);
            return [];
        }
    }

    /**
     * ツールチップの登録
     * @param {HTMLElement|string} element - 対象要素またはセレクター
     * @param {string|Object} content - ツールチップ内容
     * @param {Object} options - オプション
     */
    registerTooltip(element, content, options = {}) {
        try {
            const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
            if (!targetElement) {
                this.loggingSystem.warn('ContextManager', `Tooltip target not found: ${element}`);
                return;
            }

            const tooltipId = this.generateTooltipId(targetElement);
            const tooltipData = {
                element: targetElement,
                content,
                options: { ...this.tooltipConfig, ...options },
                registered: Date.now()
            };

            this.tooltipRegistry.set(tooltipId, tooltipData);
            
            // イベントリスナーの追加
            this.attachTooltipListeners(targetElement, tooltipId);
            
            this.loggingSystem.debug('ContextManager', `Tooltip registered: ${tooltipId}`);
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to register tooltip', error);
        }
    }

    /**
     * コンテキスト対応ツールチップの表示
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string|Object} content - コンテンツ
     * @param {Object} options - 表示オプション
     */
    showContextualTooltip(x, y, content, options = {}) {
        try {
            const tooltipId = `contextual_${Date.now()}`;
            const tooltip = this.createTooltipElement(content, options);
            
            // 位置調整
            const position = this.calculateTooltipPosition(x, y, tooltip);
            tooltip.style.left = `${position.x}px`;
            tooltip.style.top = `${position.y}px`;
            
            // 表示アニメーション
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'scale(0.8)';
            document.body.appendChild(tooltip);
            
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'scale(1)';
            });
            
            // アクティブツールチップに追加
            this.activeTooltips.set(tooltipId, {
                element: tooltip,
                showTime: Date.now(),
                position: { x, y }
            });
            
            // 自動非表示タイマー
            setTimeout(() => this.hideTooltip(tooltipId), options.autoHide || 5000);
            
            this.loggingSystem.debug('ContextManager', `Contextual tooltip shown at (${x}, ${y})`);
            return tooltipId;
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to show contextual tooltip', error);
            return null;
        }
    }

    /**
     * 次のアクション提案
     * @param {Object} currentState - 現在の状態
     * @returns {Array} 提案アクション一覧
     */
    suggestNextActions(currentState) {
        try {
            const suggestions = [];
            
            // 状態ベースの提案
            const stateKey = this.getStateKey(currentState);
            const actionMap = {
                'MainMenuScene': [
                    { action: 'start_game', label: 'ゲームを開始', priority: 1 },
                    { action: 'view_tutorial', label: 'チュートリアルを見る', priority: 2 },
                    { action: 'open_settings', label: '設定を開く', priority: 3 }
                ],
                'GameScene.playing': [
                    { action: 'click_bubble', label: '泡をクリックしてください', priority: 1 },
                    { action: 'use_item', label: 'アイテムを使用', priority: 2 },
                    { action: 'pause_game', label: 'ゲームを一時停止', priority: 3 }
                ],
                'GameScene.paused': [
                    { action: 'resume_game', label: 'ゲームを再開', priority: 1 },
                    { action: 'return_menu', label: 'メニューに戻る', priority: 2 }
                ]
            };

            const mappedSuggestions = actionMap[stateKey] || [];
            suggestions.push(...mappedSuggestions);
            
            // ユーザー行動パターンベースの提案
            const behaviorSuggestions = this.getBehaviorBasedSuggestions(currentState);
            suggestions.push(...behaviorSuggestions);
            
            // プライオリティ順にソート
            suggestions.sort((a, b) => a.priority - b.priority);
            
            this.loggingSystem.debug('ContextManager', `Generated ${suggestions.length} action suggestions`);
            return suggestions.slice(0, 5); // 最大5個
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to suggest next actions', error);
            return [];
        }
    }

    /**
     * スマートヘルプの取得
     * @param {Object} userBehavior - ユーザー行動データ
     * @returns {Object|null} スマートヘルプ
     */
    getSmartHelp(userBehavior) {
        try {
            // 行動パターンの分析
            const patterns = this.analyzeUserBehavior(userBehavior);
            
            // 困っている兆候の検出
            const struggles = this.detectStruggles(patterns);
            
            if (struggles.length > 0) {
                const helpContent = this.generateHelpForStruggles(struggles);
                
                this.loggingSystem.info('ContextManager', `Smart help generated for ${struggles.length} struggles`);
                return {
                    type: 'smart_help',
                    struggles,
                    help: helpContent,
                    confidence: this.calculateHelpConfidence(patterns),
                    timestamp: Date.now()
                };
            }
            
            return null;
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to get smart help', error);
            return null;
        }
    }

    // ---- プライベートメソッド ----

    /**
     * デフォルトコンテキスト検出器の設定
     */
    setupDefaultDetectors() {
        // ゲーム状態検出器
        this.contextDetectors.set('gameState', (context) => {
            if (!this.gameEngine) return null;
            
            return {
                isPlaying: this.gameEngine.isRunning,
                isPaused: this.gameEngine.isPaused,
                score: this.gameEngine.score || 0,
                level: this.gameEngine.currentLevel || 1
            };
        });

        // UI状態検出器
        this.contextDetectors.set('uiState', (context) => {
            return {
                activeDialogs: document.querySelectorAll('.dialog:not(.hidden)').length,
                hoveredElements: document.querySelectorAll(':hover').length,
                focusedElement: document.activeElement?.tagName
            };
        });

        // ユーザー活動検出器
        this.contextDetectors.set('userActivity', (context) => {
            const lastAction = this.userBehaviorTracker.lastActivity;
            const timeSinceLastAction = lastAction ? Date.now() - lastAction : Infinity;
            
            return {
                isActive: timeSinceLastAction < 10000, // 10秒以内
                idleTime: timeSinceLastAction,
                recentActions: this.userBehaviorTracker.actions.slice(-5)
            };
        });
    }

    /**
     * ツールチップレジストリの設定
     */
    setupTooltipRegistry() {
        // 基本的なツールチップの登録
        const defaultTooltips = [
            { selector: '.start-button', content: 'ゲームを開始します' },
            { selector: '.pause-button', content: 'ゲームを一時停止します' },
            { selector: '.help-button', content: 'ヘルプを表示します' },
            { selector: '.settings-button', content: '設定画面を開きます' }
        ];

        defaultTooltips.forEach(tooltip => {
            const element = document.querySelector(tooltip.selector);
            if (element) {
                this.registerTooltip(element, tooltip.content);
            }
        });
    }

    /**
     * ヘルププロバイダーの設定
     */
    setupHelpProviders() {
        // シーン固有のヘルププロバイダー
        this.helpProviders.set('MainMenuScene', (context) => [
            { id: 'menu_navigation', title: 'メニューの使い方', priority: 1 },
            { id: 'game_start', title: 'ゲームの始め方', priority: 2 }
        ]);

        this.helpProviders.set('GameScene', (context) => [
            { id: 'bubble_basics', title: '泡の割り方', priority: 1 },
            { id: 'scoring_system', title: 'スコアシステム', priority: 2 },
            { id: 'special_bubbles', title: '特殊な泡について', priority: 3 }
        ]);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // マウス移動追跡
        document.addEventListener('mousemove', (event) => {
            this.trackUserAction('mouse_move', { x: event.clientX, y: event.clientY });
        });

        // クリック追跡
        document.addEventListener('click', (event) => {
            this.trackUserAction('click', { 
                x: event.clientX, 
                y: event.clientY, 
                target: event.target.tagName 
            });
        });

        // キーワード追跡
        document.addEventListener('keydown', (event) => {
            this.trackUserAction('keydown', { key: event.key });
        });
    }

    /**
     * 現在のシーンを取得
     * @returns {string} シーン名
     */
    getCurrentScene() {
        if (this.gameEngine && this.gameEngine.sceneManager) {
            return this.gameEngine.sceneManager.currentScene?.constructor.name || 'Unknown';
        }
        return 'Unknown';
    }

    /**
     * ゲーム状態を取得
     * @returns {Object} ゲーム状態
     */
    getGameState() {
        if (!this.gameEngine) return {};
        
        return {
            isRunning: this.gameEngine.isRunning || false,
            isPaused: this.gameEngine.isPaused || false,
            score: this.gameEngine.score || 0
        };
    }

    /**
     * UI状態を取得
     * @returns {Object} UI状態
     */
    getUIState() {
        return {
            activeDialogs: document.querySelectorAll('.dialog:not(.hidden)').length,
            visiblePanels: document.querySelectorAll('.panel:not(.hidden)').length
        };
    }

    /**
     * 最後のユーザーアクションを取得
     * @returns {Object|null} 最後のアクション
     */
    getLastUserAction() {
        const actions = this.userBehaviorTracker.actions;
        return actions.length > 0 ? actions[actions.length - 1] : null;
    }

    /**
     * ユーザーアクションの追跡
     * @param {string} type - アクションタイプ
     * @param {Object} data - アクションデータ
     */
    trackUserAction(type, data) {
        const action = {
            type,
            data,
            timestamp: Date.now()
        };

        this.userBehaviorTracker.actions.push(action);
        this.userBehaviorTracker.lastActivity = Date.now();

        // 最大100アクションを保持
        if (this.userBehaviorTracker.actions.length > 100) {
            this.userBehaviorTracker.actions.shift();
        }
    }

    /**
     * コンテキストの類似性チェック
     * @param {Object} context1 - コンテキスト1
     * @param {Object} context2 - コンテキスト2
     * @returns {boolean} 類似フラグ
     */
    isContextSimilar(context1, context2) {
        if (!context1 || !context2) return false;
        
        return context1.scene === context2.scene &&
               JSON.stringify(context1.gameState) === JSON.stringify(context2.gameState);
    }

    /**
     * シーンヘルプの取得
     * @param {string} sceneName - シーン名
     * @returns {Array} シーンヘルプ
     */
    getSceneHelp(sceneName) {
        const provider = this.helpProviders.get(sceneName);
        if (provider) {
            return provider(this.currentContext);
        }
        return [];
    }

    /**
     * アクションヘルプの取得
     * @param {Object} action - アクション
     * @returns {Array} アクションヘルプ
     */
    getActionHelp(action) {
        // アクションタイプベースのヘルプマッピング
        const actionHelpMap = {
            'click': [{ id: 'click_help', title: 'クリック操作について', priority: 1 }],
            'drag': [{ id: 'drag_help', title: 'ドラッグ操作について', priority: 1 }],
            'bubble_pop': [{ id: 'bubble_pop_help', title: '泡を割るコツ', priority: 1 }]
        };

        return actionHelpMap[action.type] || [];
    }

    /**
     * 状況ヘルプの取得
     * @param {Object} context - コンテキスト
     * @returns {Array} 状況ヘルプ
     */
    getSituationalHelp(context) {
        const help = [];
        
        // スコアが低い場合
        if (context.gameState && context.gameState.score < 100) {
            help.push({ id: 'low_score_help', title: 'スコアアップのコツ', priority: 2 });
        }
        
        // 長時間操作がない場合
        if (context.userActivity && context.userActivity.idleTime > 30000) {
            help.push({ id: 'idle_help', title: '操作方法について', priority: 1 });
        }
        
        return help;
    }

    /**
     * 重複排除とスコアリング
     * @param {Array} helpItems - ヘルプアイテム一覧
     * @param {Object} context - コンテキスト
     * @returns {Array} スコア付きヘルプアイテム
     */
    deduplicateAndScore(helpItems, context) {
        const unique = new Map();
        
        helpItems.forEach(item => {
            const existing = unique.get(item.id);
            if (!existing || existing.priority > item.priority) {
                unique.set(item.id, item);
            }
        });
        
        return Array.from(unique.values()).sort((a, b) => a.priority - b.priority);
    }

    /**
     * ツールチップID生成
     * @param {HTMLElement} element - 対象要素
     * @returns {string} ツールチップID
     */
    generateTooltipId(element) {
        return `tooltip_${element.id || element.className || Date.now()}`;
    }

    /**
     * ツールチップリスナーの追加
     * @param {HTMLElement} element - 対象要素
     * @param {string} tooltipId - ツールチップID
     */
    attachTooltipListeners(element, tooltipId) {
        let showTimer, hideTimer;

        element.addEventListener('mouseenter', () => {
            clearTimeout(hideTimer);
            showTimer = setTimeout(() => {
                this.showRegisteredTooltip(tooltipId);
            }, this.tooltipConfig.showDelay);
        });

        element.addEventListener('mouseleave', () => {
            clearTimeout(showTimer);
            hideTimer = setTimeout(() => {
                this.hideTooltip(tooltipId);
            }, this.tooltipConfig.hideDelay);
        });
    }

    /**
     * 登録済みツールチップの表示
     * @param {string} tooltipId - ツールチップID
     */
    showRegisteredTooltip(tooltipId) {
        const tooltipData = this.tooltipRegistry.get(tooltipId);
        if (!tooltipData) return;

        const rect = tooltipData.element.getBoundingClientRect();
        this.showContextualTooltip(
            rect.left + rect.width / 2,
            rect.top - 10,
            tooltipData.content,
            tooltipData.options
        );
    }

    /**
     * ツールチップ要素の作成
     * @param {string|Object} content - コンテンツ
     * @param {Object} options - オプション
     * @returns {HTMLElement} ツールチップ要素
     */
    createTooltipElement(content, options) {
        const tooltip = document.createElement('div');
        tooltip.className = 'context-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            max-width: ${options.maxWidth || this.tooltipConfig.maxWidth}px;
            z-index: 10000;
            pointer-events: none;
            transition: opacity 0.2s, transform 0.2s;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        if (typeof content === 'string') {
            tooltip.textContent = content;
        } else {
            tooltip.innerHTML = content.html || content.toString();
        }

        return tooltip;
    }

    /**
     * ツールチップ位置の計算
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {HTMLElement} tooltip - ツールチップ要素
     * @returns {Object} 調整後の位置
     */
    calculateTooltipPosition(x, y, tooltip) {
        const rect = tooltip.getBoundingClientRect();
        let adjustedX = x - rect.width / 2;
        let adjustedY = y - rect.height - 10;

        // 画面外への はみ出し調整
        if (adjustedX < 10) adjustedX = 10;
        if (adjustedX + rect.width > window.innerWidth - 10) {
            adjustedX = window.innerWidth - rect.width - 10;
        }
        if (adjustedY < 10) adjustedY = y + 10;

        return { x: adjustedX, y: adjustedY };
    }

    /**
     * ツールチップの非表示
     * @param {string} tooltipId - ツールチップID
     */
    hideTooltip(tooltipId) {
        const activeTooltip = this.activeTooltips.get(tooltipId);
        if (activeTooltip) {
            activeTooltip.element.style.opacity = '0';
            activeTooltip.element.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                if (activeTooltip.element.parentNode) {
                    activeTooltip.element.parentNode.removeChild(activeTooltip.element);
                }
            }, 200);
            
            this.activeTooltips.delete(tooltipId);
        }
    }

    /**
     * 状態キーの生成
     * @param {Object} state - 状態
     * @returns {string} 状態キー
     */
    getStateKey(state) {
        const scene = state.scene || 'Unknown';
        const gameState = state.gameState || {};
        
        if (scene === 'GameScene') {
            if (gameState.isPaused) return 'GameScene.paused';
            if (gameState.isRunning) return 'GameScene.playing';
        }
        
        return scene;
    }

    /**
     * 行動ベース提案の取得
     * @param {Object} currentState - 現在の状態
     * @returns {Array} 行動ベース提案
     */
    getBehaviorBasedSuggestions(currentState) {
        // ユーザーの行動パターンに基づく提案
        const suggestions = [];
        const recentActions = this.userBehaviorTracker.actions.slice(-10);
        
        // 繰り返し行動の検出
        const actionCounts = {};
        recentActions.forEach(action => {
            actionCounts[action.type] = (actionCounts[action.type] || 0) + 1;
        });
        
        // 提案生成
        if (actionCounts.click > 5) {
            suggestions.push({ 
                action: 'try_drag', 
                label: 'ドラッグ操作も試してみてください', 
                priority: 4 
            });
        }
        
        return suggestions;
    }

    /**
     * ユーザー行動の分析
     * @param {Object} userBehavior - ユーザー行動データ
     * @returns {Object} 分析結果
     */
    analyzeUserBehavior(userBehavior) {
        const patterns = {
            clickFrequency: 0,
            averageIdleTime: 0,
            commonTargets: [],
            strugglingAreas: []
        };

        const actions = this.userBehaviorTracker.actions;
        if (actions.length === 0) return patterns;

        // クリック頻度計算
        const clicks = actions.filter(a => a.type === 'click');
        patterns.clickFrequency = clicks.length / (actions.length || 1);

        // アイドル時間計算
        let totalIdleTime = 0;
        for (let i = 1; i < actions.length; i++) {
            totalIdleTime += actions[i].timestamp - actions[i-1].timestamp;
        }
        patterns.averageIdleTime = totalIdleTime / (actions.length - 1 || 1);

        return patterns;
    }

    /**
     * 困っている兆候の検出
     * @param {Object} patterns - 行動パターン
     * @returns {Array} 困っている兆候
     */
    detectStruggles(patterns) {
        const struggles = [];

        // 過度のクリック
        if (patterns.clickFrequency > 0.7) {
            struggles.push({
                type: 'excessive_clicking',
                severity: 'medium',
                description: 'クリックが多すぎる可能性があります'
            });
        }

        // 長いアイドル時間
        if (patterns.averageIdleTime > 10000) {
            struggles.push({
                type: 'long_idle',
                severity: 'low',
                description: '操作に迷っている可能性があります'
            });
        }

        return struggles;
    }

    /**
     * 困り事への対応ヘルプ生成
     * @param {Array} struggles - 困り事一覧
     * @returns {Object} ヘルプコンテンツ
     */
    generateHelpForStruggles(struggles) {
        const helpContent = {
            title: 'お困りではありませんか？',
            suggestions: []
        };

        struggles.forEach(struggle => {
            switch (struggle.type) {
                case 'excessive_clicking':
                    helpContent.suggestions.push({
                        text: 'ドラッグ操作も試してみてください',
                        action: 'show_drag_tutorial'
                    });
                    break;
                case 'long_idle':
                    helpContent.suggestions.push({
                        text: 'チュートリアルを見てみますか？',
                        action: 'show_tutorial'
                    });
                    break;
            }
        });

        return helpContent;
    }

    /**
     * ヘルプ信頼度の計算
     * @param {Object} patterns - 行動パターン
     * @returns {number} 信頼度（0-1）
     */
    calculateHelpConfidence(patterns) {
        let confidence = 0.5; // ベース信頼度

        // データ量による調整
        const actionCount = this.userBehaviorTracker.actions.length;
        if (actionCount > 20) confidence += 0.2;
        if (actionCount > 50) confidence += 0.2;

        // パターンの明確さによる調整
        if (patterns.clickFrequency > 0.8 || patterns.clickFrequency < 0.2) {
            confidence += 0.1;
        }

        return Math.min(confidence, 1.0);
    }

    /**
     * リソースのクリーンアップ
     */
    destroy() {
        try {
            // アクティブなツールチップを削除
            for (const [id, tooltip] of this.activeTooltips.entries()) {
                this.hideTooltip(id);
            }

            // イベントリスナーの削除
            // （実際の実装では、追加したリスナーを個別に削除）

            this.activeTooltips.clear();
            this.tooltipRegistry.clear();
            this.contextDetectors.clear();
            this.helpProviders.clear();

            this.loggingSystem.info('ContextManager', 'Context manager destroyed');
        } catch (error) {
            this.loggingSystem.error('ContextManager', 'Failed to destroy context manager', error);
        }
    }
}

// シングルトンインスタンス管理
let contextManagerInstance = null;

/**
 * ContextManagerのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {ContextManager} ContextManagerインスタンス
 */  
export function getContextManager(gameEngine) {
    if (!contextManagerInstance) {
        contextManagerInstance = new ContextManager(gameEngine);
    }
    return contextManagerInstance;
}

/**
 * ContextManagerインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {ContextManager} 新しいContextManagerインスタンス
 */
export function reinitializeContextManager(gameEngine) {
    if (contextManagerInstance) {
        contextManagerInstance.destroy();
    }
    contextManagerInstance = new ContextManager(gameEngine);
    return contextManagerInstance;
}