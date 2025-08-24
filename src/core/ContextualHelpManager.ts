/**
 * コンテクストヘルプ管理クラス
 * 状況に応じたヘルプ情報の表示と管理を行う
 */

import { getErrorHandler } from '../utils/ErrorHandler';

export interface HelpContext {
    scene: string;
    component: string;
    action?: string;
    element?: HTMLElement;
}

export interface HelpContent {
    title: string;
    description: string;
    tips?: string[];
    links?: Array<{ text: string; url: string; }>;
}

export interface HelpManagerConfig {
    enabled: boolean;
    showTips: boolean;
    autoShow: boolean;
    delay: number;
    position: 'top' | 'bottom' | 'left' | 'right';
}

export class ContextualHelpManager {
    private config: HelpManagerConfig;
    private currentContext: HelpContext | null = null;
    private helpContent: Map<string, HelpContent> = new Map();
    private helpElement: HTMLElement | null = null;
    private showTimer: NodeJS.Timeout | null = null;
    private errorHandler: any;

    constructor(config: Partial<HelpManagerConfig> = {}) {
        this.config = {
            enabled: true,
            showTips: true,
            autoShow: false,
            delay: 1000,
            position: 'bottom',
            ...config
        };

        // エラーハンドラを取得
        try {
            this.errorHandler = getErrorHandler();
        } catch (error) {
            console.warn('[ContextualHelpManager] ErrorHandler not available:', error);
        }

        this.initialize();
    }

    private initialize(): void {
        this.loadHelpContent();
        this.setupEventListeners();
        console.log('[ContextualHelpManager] initialized');
    }

    private loadHelpContent(): void {
        // ゲーム関連のヘルプコンテンツ
        this.helpContent.set('game.bubble', {
            title: 'バブル操作',
            description: 'バブルをクリックして割ります',
            tips: [
                '同じ色のバブルを連続で割るとボーナス',
                'スペシャルバブルは特別な効果があります'
            ]
        });

        this.helpContent.set('game.settings', {
            title: '設定画面',
            description: 'ゲームの設定を変更できます',
            tips: [
                '音量や画質を調整できます',
                'アクセシビリティ設定も利用可能'
            ]
        });

        // UI関連のヘルプコンテンツ
        this.helpContent.set('ui.score', {
            title: 'スコア表示',
            description: '現在のスコアが表示されます',
            tips: [
                'コンボを繋げるとスコアが倍増します',
                'ボーナスバブルは高得点です'
            ]
        });

        this.helpContent.set('ui.timer', {
            title: 'タイマー',
            description: '残り時間を表示します',
            tips: [
                '時間切れになるとゲーム終了',
                'タイムボーナスで時間延長可能'
            ]
        });

        // コントロール関連のヘルプコンテンツ
        this.helpContent.set('controls.mouse', {
            title: 'マウス操作',
            description: 'マウスでバブルをクリックして割ります',
            tips: [
                '左クリックでバブルを割る',
                '右クリックでメニューを開く'
            ]
        });

        this.helpContent.set('controls.keyboard', {
            title: 'キーボード操作',
            description: 'キーボードでもゲームを操作できます',
            tips: [
                'スペースキーでポーズ',
                'ESCキーでメニューに戻る'
            ]
        });
    }

    private setupEventListeners(): void {
        if (typeof window !== 'undefined') {
            document.addEventListener('mouseover', this.handleMouseOver.bind(this));
            document.addEventListener('mouseout', this.handleMouseOut.bind(this));
        }
    }

    private handleMouseOver(event: MouseEvent): void {
        if (!this.config.enabled || !this.config.autoShow) return;

        const target = event.target as HTMLElement;
        const helpKey = target.getAttribute('data-help');
        
        if (helpKey) {
            // 既存のタイマーをクリア
            if (this.showTimer) {
                clearTimeout(this.showTimer);
            }

            this.showTimer = setTimeout(() => {
                this.showHelp(helpKey, target);
            }, this.config.delay);
        }
    }

    private handleMouseOut(event: MouseEvent): void {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        
        this.hideHelp();
    }

    /**
     * ヘルプを表示
     */
    showHelp(contentKey: string, element?: HTMLElement): void {
        try {
            const content = this.helpContent.get(contentKey);
            if (!content) return;

            this.hideHelp();

            this.helpElement = document.createElement('div');
            this.helpElement.className = 'contextual-help-tooltip';

            let tipsHtml = '';
            if (content.tips && content.tips.length > 0) {
                const tipItems = content.tips.map(tip => `<li>${tip}</li>`).join('');
                tipsHtml = `<ul class="help-tips">${tipItems}</ul>`;
            }

            let linksHtml = '';
            if (content.links && content.links.length > 0) {
                const linkItems = content.links.map(link => 
                    `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`
                ).join(' ');
                linksHtml = `<div class="help-links">${linkItems}</div>`;
            }

            this.helpElement.innerHTML = `
                <div class="help-title">${content.title}</div>
                <div class="help-description">${content.description}</div>
                ${tipsHtml}
                ${linksHtml}
                <button class="help-close" aria-label="ヘルプを閉じる">×</button>
            `;

            // 閉じるボタンのイベントリスナー
            const closeButton = this.helpElement.querySelector('.help-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.hideHelp());
            }

            document.body.appendChild(this.helpElement);

            if (element) {
                this.positionHelp(element);
            }

        } catch (error) {
            this.handleError('showHelp', error, { contentKey, element });
        }
    }

    /**
     * ヘルプの位置を調整
     */
    private positionHelp(targetElement: HTMLElement): void {
        if (!this.helpElement) return;

        try {
            const rect = targetElement.getBoundingClientRect();
            const helpRect = this.helpElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let top = 0;
            let left = 0;

            switch (this.config.position) {
                case 'top':
                    top = rect.top - helpRect.height - 10;
                    left = rect.left + (rect.width - helpRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 10;
                    left = rect.left + (rect.width - helpRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - helpRect.height) / 2;
                    left = rect.left - helpRect.width - 10;
                    break;
                case 'right':
                    top = rect.top + (rect.height - helpRect.height) / 2;
                    left = rect.right + 10;
                    break;
                default:
                    top = rect.bottom + 10;
                    left = rect.left + (rect.width - helpRect.width) / 2;
                    break;
            }

            // ビューポートの境界を考慮した位置調整
            if (left < 0) {
                left = 10;
            } else if (left + helpRect.width > viewportWidth) {
                left = viewportWidth - helpRect.width - 10;
            }

            if (top < 0) {
                top = rect.bottom + 10;
            } else if (top + helpRect.height > viewportHeight) {
                top = rect.top - helpRect.height - 10;
            }

            this.helpElement.style.position = 'fixed';
            this.helpElement.style.top = `${top}px`;
            this.helpElement.style.left = `${left}px`;
            this.helpElement.style.zIndex = '10000';
            this.helpElement.style.maxWidth = '300px';
            this.helpElement.style.padding = '10px';
            this.helpElement.style.backgroundColor = '#fff';
            this.helpElement.style.border = '1px solid #ccc';
            this.helpElement.style.borderRadius = '5px';
            this.helpElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

        } catch (error) {
            this.handleError('positionHelp', error, { targetElement });
        }
    }

    /**
     * ヘルプを隠す
     */
    hideHelp(): void {
        if (this.helpElement) {
            try {
                this.helpElement.remove();
                this.helpElement = null;
            } catch (error) {
                this.handleError('hideHelp', error);
            }
        }
    }

    /**
     * コンテキストを設定
     */
    setContext(context: HelpContext): void {
        this.currentContext = context;
    }

    /**
     * 現在のコンテキストを取得
     */
    getCurrentContext(): HelpContext | null {
        return this.currentContext;
    }

    /**
     * ヘルプコンテンツを追加
     */
    addHelpContent(key: string, content: HelpContent): void {
        this.helpContent.set(key, content);
    }

    /**
     * ヘルプコンテンツを取得
     */
    getHelpContent(key: string): HelpContent | undefined {
        return this.helpContent.get(key);
    }

    /**
     * 全ヘルプコンテンツキーを取得
     */
    getAllHelpKeys(): string[] {
        return Array.from(this.helpContent.keys());
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<HelpManagerConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * 設定を取得
     */
    getConfig(): HelpManagerConfig {
        return { ...this.config };
    }

    /**
     * ヘルプが表示中かチェック
     */
    isVisible(): boolean {
        return this.helpElement !== null;
    }

    /**
     * 有効/無効状態を切り替え
     */
    toggle(enabled?: boolean): void {
        if (enabled !== undefined) {
            this.config.enabled = enabled;
        } else {
            this.config.enabled = !this.config.enabled;
        }

        if (!this.config.enabled) {
            this.hideHelp();
        }
    }

    /**
     * エラーハンドリング
     */
    private handleError(operation: string, error: any, context?: any): void {
        if (this.errorHandler && this.errorHandler.handleError) {
            this.errorHandler.handleError(error, {
                context: 'ContextualHelpManager',
                operation,
                ...context
            });
        } else {
            console.error(`[ContextualHelpManager] Error in ${operation}:`, error, context);
        }
    }

    /**
     * 破棄処理
     */
    destroy(): void {
        try {
            this.hideHelp();
            
            if (this.showTimer) {
                clearTimeout(this.showTimer);
                this.showTimer = null;
            }

            if (typeof window !== 'undefined') {
                document.removeEventListener('mouseover', this.handleMouseOver.bind(this));
                document.removeEventListener('mouseout', this.handleMouseOut.bind(this));
            }

            this.helpContent.clear();
            this.currentContext = null;

            console.log('[ContextualHelpManager] destroyed');

        } catch (error) {
            this.handleError('destroy', error);
        }
    }
}

// シングルトンインスタンス
let instance: ContextualHelpManager | null = null;

/**
 * シングルトンインスタンスを取得
 */
export function getContextualHelpManager(config?: Partial<HelpManagerConfig>): ContextualHelpManager {
    if (!instance) {
        instance = new ContextualHelpManager(config);
    }
    return instance;
}

/**
 * シングルトンインスタンスをリセット（主にテスト用）
 */
export function resetContextualHelpManager(): void {
    if (instance) {
        instance.destroy();
        instance = null;
    }
}