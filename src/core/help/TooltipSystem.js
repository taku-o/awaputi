/**
 * TooltipSystem.js
 * 動的ツールチップ表示システム
 * コンテキスト対応ヘルプの提供
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * ツールチップシステムクラス
 */
export class TooltipSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // ツールチップ管理
        this.activeTooltips = new Map();
        this.tooltipQueue = [];
        this.hoveredElements = new Set();
        
        // ツールチップ設定
        this.config = {
            showDelay: 800,        // 表示遅延（ms）
            hideDelay: 200,        // 非表示遅延（ms）
            maxWidth: 300,         // 最大幅
            padding: 12,           // パディング
            fontSize: 12,          // フォントサイズ
            lineHeight: 16,        // 行の高さ
            fadeInDuration: 200,   // フェードイン時間
            fadeOutDuration: 150,  // フェードアウト時間
            zIndex: 10000          // Z-index
        };
        
        // ツールチップスタイル
        this.styles = {
            background: 'rgba(33, 33, 33, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            font: `${this.config.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        };
        
        // アニメーション状態
        this.animations = new Map();
        
        // ツールチップ位置計算
        this.positionStrategies = {
            'top': (rect, tooltipSize) => ({
                x: rect.left + rect.width / 2 - tooltipSize.width / 2,
                y: rect.top - tooltipSize.height - 8
            }),
            'bottom': (rect, tooltipSize) => ({
                x: rect.left + rect.width / 2 - tooltipSize.width / 2,
                y: rect.bottom + 8
            }),
            'left': (rect, tooltipSize) => ({
                x: rect.left - tooltipSize.width - 8,
                y: rect.top + rect.height / 2 - tooltipSize.height / 2
            }),
            'right': (rect, tooltipSize) => ({
                x: rect.right + 8,
                y: rect.top + rect.height / 2 - tooltipSize.height / 2
            })
        };
        
        this.initialize();
    }
    
    /**
     * システムの初期化
     */
    initialize() {
        try {
            // Canvas要素の取得
            this.canvas = this.gameEngine.canvas;
            this.ctx = this.canvas.getContext('2d');
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 既存のUI要素のツールチップ設定
            this.setupDefaultTooltips();
            
            this.loggingSystem.info('TooltipSystem', 'Tooltip system initialized');
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', 'Failed to initialize tooltip system', error);
            ErrorHandler.handle(error, 'TooltipSystem.initialize');
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // マウスイベント
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('click', () => this.hideAllTooltips());
        
        // キーボードイベント（ESCキーでツールチップを隠す）
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideAllTooltips();
            }
        });
        
        // ウィンドウリサイズ
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * デフォルトツールチップの設定
     */
    setupDefaultTooltips() {
        // ゲーム要素のツールチップ設定
        this.registerTooltipArea({
            id: 'score_display',
            bounds: { x: 10, y: 10, width: 150, height: 30 },
            content: {
                title: 'スコア',
                description: '現在のスコアを表示します。泡を割ったりコンボを決めると増加します。'
            },
            position: 'bottom'
        });
        
        this.registerTooltipArea({
            id: 'hp_display',
            bounds: { x: 10, y: 50, width: 200, height: 20 },
            content: {
                title: 'HP（体力）',
                description: '残りHPを表示します。泡が破裂するとダメージを受けます。0になるとゲームオーバーです。'
            },
            position: 'bottom'
        });
        
        this.registerTooltipArea({
            id: 'combo_display',
            bounds: { x: 10, y: 80, width: 120, height: 25 },
            content: {
                title: 'コンボ',
                description: '連続で泡を割った回数です。高いコンボほど獲得スコアが増加します。'
            },
            position: 'right'
        });
    }
    
    /**
     * ツールチップエリアの登録
     * @param {Object} config - ツールチップ設定
     */
    registerTooltipArea(config) {
        try {
            const tooltipInfo = {
                id: config.id,
                bounds: config.bounds,
                content: config.content,
                position: config.position || 'top',
                showDelay: config.showDelay || this.config.showDelay,
                enabled: config.enabled !== false,
                conditions: config.conditions || null,
                priority: config.priority || 0
            };
            
            this.activeTooltips.set(config.id, tooltipInfo);
            this.loggingSystem.debug('TooltipSystem', `Tooltip area registered: ${config.id}`);
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', `Failed to register tooltip area: ${config.id}`, error);
        }
    }
    
    /**
     * ツールチップエリアの削除
     * @param {string} id - ツールチップID
     */
    unregisterTooltipArea(id) {
        try {
            if (this.activeTooltips.has(id)) {
                this.activeTooltips.delete(id);
                this.hideTooltip(id);
                this.loggingSystem.debug('TooltipSystem', `Tooltip area unregistered: ${id}`);
            }
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', `Failed to unregister tooltip area: ${id}`, error);
        }
    }
    
    /**
     * マウス移動処理
     * @param {MouseEvent} event - マウスイベント 
     */
    handleMouseMove(event) {
        try {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // 現在ホバー中の要素をチェック
            const hoveredTooltips = [];
            
            for (const [id, tooltip] of this.activeTooltips) {
                if (!tooltip.enabled) continue;
                
                if (this.isPointInBounds(x, y, tooltip.bounds)) {
                    // 条件チェック
                    if (tooltip.conditions && !this.checkConditions(tooltip.conditions)) {
                        continue;
                    }
                    
                    hoveredTooltips.push(tooltip);
                }
            }
            
            // 優先度順にソート
            hoveredTooltips.sort((a, b) => b.priority - a.priority);
            
            // 最高優先度のツールチップを表示
            if (hoveredTooltips.length > 0) {
                const tooltip = hoveredTooltips[0];
                if (!this.hoveredElements.has(tooltip.id)) {
                    this.showTooltip(tooltip, x, y);
                    this.hoveredElements.add(tooltip.id);
                }
            }
            
            // ホバーが終了した要素のツールチップを隠す
            for (const hoveredId of this.hoveredElements) {
                const isStillHovered = hoveredTooltips.some(t => t.id === hoveredId);
                if (!isStillHovered) {
                    this.hideTooltip(hoveredId);
                    this.hoveredElements.delete(hoveredId);
                }
            }
            
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', 'Mouse move handling error', error);
        }
    }
    
    /**
     * マウス退出処理
     */
    handleMouseLeave() {
        this.hideAllTooltips();
        this.hoveredElements.clear();
    }
    
    /**
     * ウィンドウリサイズ処理
     */
    handleResize() {
        // ツールチップ位置の再計算
        for (const animation of this.animations.values()) {
            if (animation.element && animation.element.parentNode) {
                this.updateTooltipPosition(animation.element, animation.tooltip);
            }
        }
    }
    
    /**
     * ツールチップ表示
     * @param {Object} tooltip - ツールチップ情報
     * @param {number} mouseX - マウスX座標
     * @param {number} mouseY - マウスY座標
     */
    showTooltip(tooltip, mouseX, mouseY) {
        try {
            // 既存のツールチップが表示中の場合は処理をスキップ
            if (this.animations.has(tooltip.id)) {
                return;
            }
            
            // 遅延表示の設定
            const showTimer = setTimeout(() => {
                this.createTooltipElement(tooltip, mouseX, mouseY);
            }, tooltip.showDelay);
            
            // アニメーション情報を保存
            this.animations.set(tooltip.id, {
                tooltip: tooltip,
                showTimer: showTimer,
                element: null,
                fadeAnimation: null
            });
            
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', `Failed to show tooltip: ${tooltip.id}`, error);
        }
    }
    
    /**
     * ツールチップ要素の作成
     * @param {Object} tooltip - ツールチップ情報
     * @param {number} mouseX - マウスX座標
     * @param {number} mouseY - マウスY座標
     */
    createTooltipElement(tooltip, mouseX, mouseY) {
        try {
            // DOM要素の作成
            const element = document.createElement('div');
            element.id = `tooltip-${tooltip.id}`;
            element.style.cssText = this.buildTooltipCSS();
            
            // コンテンツの設定
            element.innerHTML = this.buildTooltipHTML(tooltip.content);
            
            // DOM に追加
            document.body.appendChild(element);
            
            // 位置の計算と設定
            this.updateTooltipPosition(element, tooltip);
            
            // フェードインアニメーション
            this.animateTooltipIn(element, tooltip.id);
            
            // アニメーション情報を更新
            const animation = this.animations.get(tooltip.id);
            if (animation) {
                animation.element = element;
            }
            
            this.loggingSystem.debug('TooltipSystem', `Tooltip shown: ${tooltip.id}`);
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', `Failed to create tooltip element: ${tooltip.id}`, error);
        }
    }
    
    /**
     * ツールチップのCSS構築
     * @returns {string} CSS文字列
     */
    buildTooltipCSS() {
        return `
            position: fixed;
            background: ${this.styles.background};
            color: ${this.styles.color};
            border: ${this.styles.border};
            border-radius: ${this.styles.borderRadius};
            box-shadow: ${this.styles.boxShadow};
            font: ${this.styles.font};
            line-height: ${this.config.lineHeight}px;
            padding: ${this.config.padding}px;
            max-width: ${this.config.maxWidth}px;
            z-index: ${this.config.zIndex};
            opacity: 0;
            pointer-events: none;
            word-wrap: break-word;
            white-space: pre-wrap;
        `;
    }
    
    /**
     * ツールチップのHTML構築
     * @param {Object} content - コンテンツ情報
     * @returns {string} HTML文字列
     */
    buildTooltipHTML(content) {
        let html = '';
        
        if (content.title) {
            html += `<div style="font-weight: bold; margin-bottom: 4px; font-size: ${this.config.fontSize + 1}px;">${this.escapeHTML(content.title)}</div>`;
        }
        
        if (content.description) {
            html += `<div style="font-size: ${this.config.fontSize}px;">${this.escapeHTML(content.description)}</div>`;
        }
        
        if (content.shortcut) {
            html += `<div style="margin-top: 6px; opacity: 0.8; font-size: ${this.config.fontSize - 1}px;">ショートカット: <kbd style="background: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 3px;">${this.escapeHTML(content.shortcut)}</kbd></div>`;
        }
        
        return html || content.toString();
    }
    
    /**
     * ツールチップ位置の更新
     * @param {HTMLElement} element - ツールチップ要素
     * @param {Object} tooltip - ツールチップ情報
     */
    updateTooltipPosition(element, tooltip) {
        try {
            const canvasRect = this.canvas.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            // 基準位置の計算
            const targetRect = {
                left: canvasRect.left + tooltip.bounds.x,
                top: canvasRect.top + tooltip.bounds.y,
                right: canvasRect.left + tooltip.bounds.x + tooltip.bounds.width,
                bottom: canvasRect.top + tooltip.bounds.y + tooltip.bounds.height,
                width: tooltip.bounds.width,
                height: tooltip.bounds.height
            };
            
            const tooltipSize = {
                width: elementRect.width,
                height: elementRect.height
            };
            
            // 位置戦略の適用
            let position = this.positionStrategies[tooltip.position](targetRect, tooltipSize);
            
            // 画面端への調整
            position = this.adjustPositionForViewport(position, tooltipSize);
            
            // 位置の適用
            element.style.left = `${Math.round(position.x)}px`;
            element.style.top = `${Math.round(position.y)}px`;
            
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', 'Failed to update tooltip position', error);
        }
    }
    
    /**
     * ビューポートに合わせた位置調整
     * @param {Object} position - 位置情報
     * @param {Object} tooltipSize - ツールチップサイズ
     * @returns {Object} 調整された位置
     */
    adjustPositionForViewport(position, tooltipSize) {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        const margin = 8;
        
        // 左右の調整
        if (position.x < margin) {
            position.x = margin;
        } else if (position.x + tooltipSize.width > viewport.width - margin) {
            position.x = viewport.width - tooltipSize.width - margin;
        }
        
        // 上下の調整
        if (position.y < margin) {
            position.y = margin;
        } else if (position.y + tooltipSize.height > viewport.height - margin) {
            position.y = viewport.height - tooltipSize.height - margin;
        }
        
        return position;
    }
    
    /**
     * ツールチップフェードインアニメーション
     * @param {HTMLElement} element - ツールチップ要素
     * @param {string} tooltipId - ツールチップID
     */
    animateTooltipIn(element, tooltipId) {
        const startTime = performance.now();
        const duration = this.config.fadeInDuration;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // イージング関数（ease-out）
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.style.opacity = easeOut;
            element.style.transform = `translateY(${(1 - easeOut) * -10}px)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // アニメーション完了
                const animation = this.animations.get(tooltipId);
                if (animation) {
                    animation.fadeAnimation = null;
                }
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * ツールチップ非表示
     * @param {string} tooltipId - ツールチップID
     */
    hideTooltip(tooltipId) {
        try {
            const animation = this.animations.get(tooltipId);
            if (!animation) return;
            
            // 表示タイマーのクリア
            if (animation.showTimer) {
                clearTimeout(animation.showTimer);
            }
            
            // 要素が存在する場合はフェードアウト
            if (animation.element) {
                this.animateTooltipOut(animation.element, tooltipId);
            } else {
                // 要素がない場合は直接削除
                this.animations.delete(tooltipId);
            }
            
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', `Failed to hide tooltip: ${tooltipId}`, error);
        }
    }
    
    /**
     * ツールチップフェードアウトアニメーション
     * @param {HTMLElement} element - ツールチップ要素
     * @param {string} tooltipId - ツールチップID
     */
    animateTooltipOut(element, tooltipId) {
        const startTime = performance.now();
        const duration = this.config.fadeOutDuration;
        const startOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress >= 1) {
                // アニメーション完了 - 要素を削除
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                this.animations.delete(tooltipId);
                this.loggingSystem.debug('TooltipSystem', `Tooltip hidden: ${tooltipId}`);
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * 全ツールチップ非表示
     */
    hideAllTooltips() {
        try {
            for (const tooltipId of this.animations.keys()) {
                this.hideTooltip(tooltipId);
            }
            this.hoveredElements.clear();
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', 'Failed to hide all tooltips', error);
        }
    }
    
    /**
     * 点が境界内にあるかチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} bounds - 境界情報
     * @returns {boolean} 境界内にある場合true
     */
    isPointInBounds(x, y, bounds) {
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    /**
     * 条件チェック
     * @param {Object} conditions - 条件情報
     * @returns {boolean} 条件を満たす場合true
     */
    checkConditions(conditions) {
        try {
            if (conditions.scene && this.gameEngine.currentScene) {
                const currentSceneName = this.gameEngine.currentScene.constructor.name;
                if (conditions.scene !== currentSceneName) {
                    return false;
                }
            }
            
            if (conditions.gameState && this.gameEngine.gameState) {
                if (conditions.gameState !== this.gameEngine.gameState) {
                    return false;
                }
            }
            
            if (conditions.minScore && this.gameEngine.scoreManager) {
                const currentScore = this.gameEngine.scoreManager.getCurrentScore();
                if (currentScore < conditions.minScore) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', 'Condition check error', error);
            return true; // エラー時はツールチップを表示
        }
    }
    
    /**
     * HTMLエスケープ
     * @param {string} text - エスケープするテキスト
     * @returns {string} エスケープされたテキスト
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * ツールチップの有効/無効切り替え
     * @param {string} tooltipId - ツールチップID
     * @param {boolean} enabled - 有効状態
     */
    setTooltipEnabled(tooltipId, enabled) {
        const tooltip = this.activeTooltips.get(tooltipId);
        if (tooltip) {
            tooltip.enabled = enabled;
            if (!enabled) {
                this.hideTooltip(tooltipId);
            }
        }
    }
    
    /**
     * ツールチップ内容の更新
     * @param {string} tooltipId - ツールチップID
     * @param {Object} newContent - 新しいコンテンツ
     */
    updateTooltipContent(tooltipId, newContent) {
        const tooltip = this.activeTooltips.get(tooltipId);
        if (tooltip) {
            tooltip.content = { ...tooltip.content, ...newContent };
            
            // 現在表示中の場合は再描画
            const animation = this.animations.get(tooltipId);
            if (animation && animation.element) {
                animation.element.innerHTML = this.buildTooltipHTML(tooltip.content);
                this.updateTooltipPosition(animation.element, tooltip);
            }
        }
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        try {
            // 全ツールチップの非表示
            this.hideAllTooltips();
            
            // イベントリスナーの削除
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
            this.canvas.removeEventListener('click', this.hideAllTooltips);
            
            // データのクリア
            this.activeTooltips.clear();
            this.hoveredElements.clear();
            this.animations.clear();
            
            this.loggingSystem.info('TooltipSystem', 'Tooltip system cleaned up');
        } catch (error) {
            this.loggingSystem.error('TooltipSystem', 'Failed to cleanup tooltip system', error);
        }
    }
}

// シングルトンインスタンス管理
let tooltipSystemInstance = null;

/**
 * TooltipSystemのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {TooltipSystem} TooltipSystemインスタンス
 */
export function getTooltipSystem(gameEngine) {
    if (!tooltipSystemInstance) {
        tooltipSystemInstance = new TooltipSystem(gameEngine);
    }
    return tooltipSystemInstance;
}

/**
 * TooltipSystemインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {TooltipSystem} 新しいTooltipSystemインスタンス
 */
export function reinitializeTooltipSystem(gameEngine) {
    if (tooltipSystemInstance) {
        tooltipSystemInstance.cleanup();
    }
    tooltipSystemInstance = new TooltipSystem(gameEngine);
    return tooltipSystemInstance;
}