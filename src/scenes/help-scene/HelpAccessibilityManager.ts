/**
 * Help Accessibility Manager
 * ヘルプシーンアクセシビリティ管理 - アクセシビリティ機能の統合管理
 */

import { GameEngine } from '../../core/GameEngine';''
import { LocalizationManager } from '../../i18n/LocalizationManager';''
import { AccessibilityManager } from '../../accessibility/AccessibilityManager';

// フォーカス可能要素インターフェース
interface FocusableElement { id: string,''
    type: 'input' | 'list' | 'region' | 'button';
    label: string ,}

// ARIAラベル情報インターフェース
interface AriaLabelInfo { label: string;
    role: string;
    description: string }

// アクセシビリティ状態インターフェース
interface AccessibilityState { screenReaderMode: boolean;
    highContrastMode: boolean;
    largeTextMode: boolean;
    currentFocusIndex: number;
    announcementQueueLength: number }

// アナウンスメント情報インターフェース
interface Announcement { message: string,''
    priority: 'polite' | 'assertive';
    timestamp: number ,}

/**
 * Help Accessibility Manager
 * アクセシビリティ機能統合管理器 - スクリーンリーダー、キーボードナビゲーション、UI配慮
 */
export class HelpAccessibilityManager {
    private gameEngine: GameEngine;
    private accessibilityManager: AccessibilityManager | undefined;
    // アクセシビリティ状態
    private currentFocusIndex: number;
    private focusableElements: FocusableElement[];
    private announcementQueue: Announcement[];
    private ariaLabels: Map<string, AriaLabelInfo>;
    private screenReaderMode: boolean;
    private highContrastMode: boolean;
    private largeTextMode: boolean;
    // 音声フィードバック
    private audioFeedbackEnabled: boolean;
    private announceNavigation: boolean;
    // IME対応
    private isComposing: boolean = false;
    // 詳細設定
    private enableDetailedDescriptions: boolean = false;
    private enableNavigationAnnouncements: boolean = false;
    private enableProgressAnnouncements: boolean = false;
    constructor(gameEngine: GameEngine, accessibilityManager?: AccessibilityManager) {
    
        this.gameEngine = gameEngine;
        this.accessibilityManager = accessibilityManager;
        
        // アクセシビリティ状態
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.announcementQueue = [];
        this.ariaLabels = new Map();
        this.screenReaderMode = false;
        this.highContrastMode = false;
        this.largeTextMode = false;
        
        // 音声フィードバック
        this.audioFeedbackEnabled = true;
        this.announceNavigation = true;
        
    
    }
        this.initialize(); }
    }

    private async initialize(''';
                { id: 'searchBar', type: 'input', label: 'help.searchBar.label' ,},''
                { id: 'categoryList', type: 'list', label: 'help.categoryList.label' ,},''
                { id: 'topicList', type: 'list', label: 'help.topicList.label' ,},''
                { id: 'contentArea', type: 'region', label: 'help.contentArea.label' ,},''
                { id: 'backButton', type: 'button', label: 'help.backButton.label' ,}
            ];
            
            // ARIAラベルの設定)
            this.setupAriaLabels();
            // スクリーンリーダー対応の準備
            this.prepareScreenReaderSupport()';
            console.log('HelpAccessibilityManager, initialized);

        } catch (error') { console.error('Failed to initialize HelpAccessibilityManager:', error }
    }

    /**
     * ARIAラベルの設定
     */'
    private setupAriaLabels(): void { ''
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);

        this.ariaLabels.set('searchBar', {);''
            label: t('help.accessibility.searchBar', 'ヘルプを検索するための入力フィールド''),
            role: 'searchbox',
            description: t('help.accessibility.searchBarDesc', 'キーワードを入力してヘルプコンテンツを検索できます);' }

        }');

        this.ariaLabels.set('categoryList', { ');''
            label: t('help.accessibility.categoryList', 'ヘルプカテゴリ一覧''),
            role: 'listbox',
            description: t('help.accessibility.categoryListDesc', '矢印キーで移動、Enterで選択);' }

        }');

        this.ariaLabels.set('topicList', { ');''
            label: t('help.accessibility.topicList', 'トピック一覧''),
            role: 'listbox',
            description: t('help.accessibility.topicListDesc', '選択されたカテゴリのトピック一覧);' }

        }');

        this.ariaLabels.set('contentArea', { ');''
            label: t('help.accessibility.contentArea', 'ヘルプコンテンツ表示エリア''),
            role: 'region',
            description: t('help.accessibility.contentAreaDesc', '選択されたトピックの詳細情報);' }

        }');

        this.ariaLabels.set('backButton', { ');''
            label: t('help.accessibility.backButton', '戻るボタン''),
            role: 'button',
            description: t('help.accessibility.backButtonDesc', 'メインメニューに戻ります });
    }

    /**
     * スクリーンリーダー対応の準備
     */
    private prepareScreenReaderSupport(): void { // スクリーンリーダーの検出
        this.detectScreenReader();
        
        // 自動アナウンス設定
        this.setupAutoAnnouncements(); }
;
    private detectScreenReader(): void { // スクリーンリーダーの検出（簡易版）
        const userAgent = navigator.userAgent.toLowerCase()';
        this.screenReaderMode = userAgent.includes('nvda'') || '';
                               userAgent.includes('jaws'') || '';
                               userAgent.includes('voiceover) ||;
                               window.speechSynthesis !== undefined; }

    private setupAutoAnnouncements(): void { // 自動アナウンス機能の設定
        this.announceNavigation = true;
        this.enableDetailedDescriptions = true;
        this.enableNavigationAnnouncements = true;
        this.enableProgressAnnouncements = true; }

    public enableScreenReaderMode()';
        this.announceToScreenReader('help.accessibility.screenReaderEnabled', 'assertive);
        
        // スクリーンリーダー向けの追加設定
        this.enableDetailedDescriptions = true;
        this.enableNavigationAnnouncements = true;
        this.enableProgressAnnouncements = true;
        
        // UI調整
        this.enableHighContrastMode();''
        this.enableLargeTextMode()';
    public announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite): void { ''
        if(this.screenReaderMode && this.accessibilityManager) {'
            ';

        }

            this.safeCall(this.accessibilityManager, 'announce', message, priority); }
            this.announcementQueue.push({ message, priority, timestamp: Date.now( ,});
        }
    }

    /**
     * Safe method call - prevents errors from undefined methods'
     */''
    private safeCall(obj: any, methodName: string, ...args: any[]): any { try {'
            if(obj && typeof, obj[methodName] === 'function) {'
                
            }
                return obj[methodName](...args);
            } else {  }
                console.warn(`HelpAccessibilityManager: Method ${methodName} does not exist on accessibility manager, skipping call`);
                return undefined;
            } catch (error) {
            console.warn(`HelpAccessibilityManager: Error calling ${methodName}:`, error);
            return undefined;

    /**
     * アクセシビリティキーの処理'
     */''
    public handleAccessibilityKeys(event: KeyboardEvent): boolean { // F1: アクセシビリティヘルプ
        if(event.key === 'F1) {'
            event.preventDefault();''
            this.showAccessibilityHelp()';
        if(event.altKey && event.key === 'h) {'
            event.preventDefault();''
            this.announceKeyboardShortcuts()';
        if (event.ctrlKey && event.shiftKey && event.key === '? ') {
            event.preventDefault();
            this.toggleAccessibilityFeatures();
        }
            return true;

        return false;
    }

    /**
     * ナビゲーション変更のアナウンス
     */
    public announceNavigationChange( : undefined
        key: string, ;
        categories: any[], ;
        selectedCategory: string, ;
        selectedTopicIndex: number );
        isSearching: boolean);

        searchResults: any[]';
    ): void { ''
        if(!this.announceNavigation) return,

        let message = '';

        switch(key) {'

        case 'ArrowUp':'';
        case 'ArrowDown':;
            if (categories && selectedCategory) {'
                const category = categories.find(c => c.id === selectedCategory);

        }

                if(category && category.topics[selectedTopicIndex]) { }
                    message = `${category.topics[selectedTopicIndex].title}が選択されました`;
                }
            }

            break;''
        case 'ArrowLeft':'';
        case 'ArrowRight':';
            const selectedCat = categories.find(c => c.id === selectedCategory);''
            if(selectedCat) {
                
            }
                message = `カテゴリ：${selectedCat.key}が選択されました`;
            }

            break;''
        case 'Enter':;
            if (isSearching) { message = `検索結果から選択されました`; } else { message = `トピックが選択されました`; }
            break;
        }
        
        if (message) { this.announceToScreenReader(message); }
    }

    private showAccessibilityHelp()';
        this.announceToScreenReader(helpMessage, 'assertive);
    }

    public announceCurrentElementDetails(): void { const currentElement = this.focusableElements[this.currentFocusIndex];
        if(currentElement && this.ariaLabels.has(currentElement.id) {
            
        }

            const ariaInfo = this.ariaLabels.get(currentElement.id)!;' }'

            this.announceToScreenReader(`${ariaInfo.label}。${ariaInfo.description}`, 'polite'});
        }
    }

    private announceKeyboardShortcuts(''';
            '矢印キー：ナビゲーション',
            'Enter：選択',
            'Escape：戻る',
            'Tab：フォーカス移動',
            '/：検索',
            'F1：ヘルプ'')';
        ].join('、);

        this.announceToScreenReader(`キーボードショートカット：${shortcuts}`, 'polite'});
    }
';

    public enableAccessibilityFeatures(): void { this.screenReaderMode = true;''
        if(this.accessibilityManager) {'
            // Safe call mechanism - call methods only if they exist
            this.safeCall(this.accessibilityManager, 'enableHighContrast'');''
            this.safeCall(this.accessibilityManager, 'enableLargeText'');''
            this.safeCall(this.accessibilityManager, 'enableAudioCues'');''
            this.safeCall(this.accessibilityManager, 'enableKeyboardNavigation'');

        }

            this.safeCall(this.accessibilityManager, 'enableScreenReaderSupport); }'
        }
        ';

        this.enableHighContrastMode();''
        this.enableLargeTextMode()';
        this.announceToScreenReader('アクセシビリティ機能が有効になりました', 'assertive);
    }

    public disableAccessibilityFeatures(): void { this.screenReaderMode = false;

        if(this.accessibilityManager) {'
            // Safe call mechanism - call methods only if they exist
            this.safeCall(this.accessibilityManager, 'disableHighContrast'');''
            this.safeCall(this.accessibilityManager, 'disableLargeText'');

        }

            this.safeCall(this.accessibilityManager, 'disableAudioCues); }'
        }
        
        this.disableHighContrastMode();
        this.disableLargeTextMode();
    }

    public toggleAccessibilityFeatures(): void { if (this.screenReaderMode) {
            this.disableAccessibilityFeatures(); } else { this.enableAccessibilityFeatures(); }
    }

    public enableHighContrastMode()';
        document.body.classList.add('high-contrast-help);
    }

    public disableHighContrastMode()';
        document.body.classList.remove('high-contrast-help);
    }

    public enableLargeTextMode()';
        document.body.classList.add('large-text-help);
    }

    public disableLargeTextMode()';
        document.body.classList.remove('large-text-help);
    }

    /**
     * タブナビゲーション処理
     */
    public handleTabNavigation(event: KeyboardEvent): void { event.preventDefault();
        
        if(event.shiftKey) {
        
            
        
        }
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length; }
        } else { this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length; }
        
        this.announceCurrentElementDetails();
    }

    /**
     * フォーカス管理
     */
    public setFocusIndex(index: number): void { if (index >= 0 && index < this.focusableElements.length) {
            this.currentFocusIndex = index;
            this.announceCurrentElementDetails(); }
    }

    public getCurrentFocusIndex(): number { return this.currentFocusIndex; }

    public getFocusableElements(): FocusableElement[] { return [...this.focusableElements];

    public getAriaLabel(elementId: string): AriaLabelInfo | undefined { return this.ariaLabels.get(elementId); }

    // 状態取得
    public getAccessibilityState(): AccessibilityState { return { screenReaderMode: this.screenReaderMode,
            highContrastMode: this.highContrastMode;
            largeTextMode: this.largeTextMode;
            currentFocusIndex: this.currentFocusIndex, };
            announcementQueueLength: this.announcementQueue.length }
        }

    // クリーンアップ
    public destroy(): void { this.disableAccessibilityFeatures();
        this.announcementQueue.length = 0;
        this.ariaLabels.clear();
        this.focusableElements.length = 0; }
}

/**
 * Help Accessibility Renderer
 * アクセシビリティレンダラー - アクセシビリティ向けUI描画補助
 */
export class HelpAccessibilityRenderer {
    private accessibilityManager: HelpAccessibilityManager;
    constructor(accessibilityManager: HelpAccessibilityManager) {
        this.accessibilityManager = accessibilityManager }

    /**
     * フォーカスインジケーターの描画
     */
    public renderFocusIndicator(;
        ctx: CanvasRenderingContext2D);
        rect: { x: number; y: number; width: number; height: number ), 
        focused: boolean = false;
    ): void {
        const state = this.accessibilityManager.getAccessibilityState(),
        if (!focused || !state.screenReaderMode) return;

        ctx.save(''';
        ctx.strokeStyle = state.highContrastMode ? '#FFFF00' : '#4A90E2';)
        ctx.lineWidth = 3;)
        ctx.setLineDash([5, 5]);

        ctx.strokeRect(rect.x - 2, rect.y - 2, rect.width + 4, rect.height + 4);''
        ctx.restore()';
    public getAccessibleColor(baseColor: string, type: 'text' | 'background' | 'selected' | 'border' = 'text): string {
        const state = this.accessibilityManager.getAccessibilityState();
        if(!state.highContrastMode) {
            
        ,}
            return baseColor;

        switch(type) {'

        case 'text':'';
            return '#FFFFFF';''
        case 'background':'';
            return '#000000';''
        case 'selected':'';
            return '#FFFF00';''
        case 'border':'';
            return '#FFFFFF';
        }
        default: return baseColor;

    /**
     * 大きなテキスト対応フォントサイズ
     */
    public getAccessibleFontSize(baseFontSize: number): number { const state = this.accessibilityManager.getAccessibilityState();
        if(state.largeTextMode) {
            
        }
            return Math.floor(baseFontSize * 1.5);
        return baseFontSize;
    }

    /**
     * アクセシブルなテキスト描画
     */
    public renderAccessibleText(;
        ctx: CanvasRenderingContext2D;
        text: string, ;
        x: number, ;
        y: number );
        options: { fontSize?: number)
            color?: string;
            bold?: boolean;
            align?: CanvasTextAlign;
            baseline?: CanvasTextBaseline;
            outline?: boolean; }

        } = { ): void {''
        const fontSize = this.getAccessibleFontSize(options.fontSize || 16);''
        const color = this.getAccessibleColor(options.color || '#FFFFFF', 'text);

        ctx.save('' }

        ctx.font = `${options.bold ? 'bold ' : ''}${fontSize}px Arial, sans-serif`;

        ctx.fillStyle = color;''
        ctx.textAlign = options.align || 'left';''
        ctx.textBaseline = options.baseline || 'top';
        );
        // 高コントラストモードでの縁取り)
        const state = this.accessibilityManager.getAccessibilityState();''
        if(state.highContrastMode && options.outline) {'

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
        }
            ctx.strokeText(text, x, y); }
        }
        ';

        ctx.fillText(text, x, y);''
        ctx.restore(');