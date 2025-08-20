/**
 * コンテクストヘルプ管理クラス
 * 状況に応じたヘルプ情報の表示と管理を行う
 */

import { getErrorHandler } from '../utils/ErrorHandler';

export interface HelpContext { scene: string,
    component: string,
    action?: string;
    element?: HTMLElement;
    }
}

export interface HelpContent { title: string,
    description: string,
    tips?: string[]; }
    links?: Array<{ text: string; url: string }>;
}

export interface HelpManagerConfig { enabled: boolean,
    showTips: boolean,
    autoShow: boolean,';
    delay: number,'';
    position: 'top' | 'bottom' | 'left' | 'right'; }
}

export class ContextualHelpManager {
    private config: HelpManagerConfig;
    private currentContext: HelpContext | null = null;
    private helpContent: Map<string, HelpContent> = new Map();
    private helpElement: HTMLElement | null = null;
    private showTimer: NodeJS.Timeout | null = null';
'';
    constructor(config: Partial<HelpManagerConfig> = {)') {
        this.config = {
            enabled: true,
            showTips: true,
            autoShow: false,';
            delay: 1000,'';
            position: 'bottom',
            ...config }
        };

        this.initialize();
    }
';
    private initialize(): void { this.loadHelpContent();''
        this.setupEventListeners('')';
        console.log('ContextualHelpManager initialized'); }
    }'
'';
    private loadHelpContent(''';
        this.helpContent.set('game.bubble', { ''
            title: 'バブル操作',')';
            description: 'バブルをクリックして割ります',')';
            tips: ['同じ色のバブルを連続で割るとボーナス', 'スペシャルバブルは特別な効果があります'])');'
'';
        this.helpContent.set('game.settings', {''
            title: '設定画面',')';
            description: 'ゲームの設定を変更できます',')';
            tips: ['音量や画質を調整できます', 'アクセシビリティ設定も利用可能']); }
    }'
'';
    private setupEventListeners('')';
        if(typeof window !== 'undefined'') {'
            '';
            document.addEventListener('mouseover', this.handleMouseOver.bind(this)');'
        }'
            document.addEventListener('mouseout', this.handleMouseOut.bind(this); }
        }
    }
';
    private handleMouseOver(event: MouseEvent): void { ''
        if (!this.config.enabled || !this.config.autoShow') return;
';
        const target = event.target as HTMLElement;''
        const helpKey = target.getAttribute('data-help');
        
        if(helpKey) {
        
            
        
        }
            this.showTimer = setTimeout(() => {  }
                this.showHelp(helpKey, target); }
            }, this.config.delay);
        }
    }

    private handleMouseOut(event: MouseEvent): void { if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null; }
        }
        
        this.hideHelp();
    }

    showHelp(contentKey: string, element?: HTMLElement): void { const content = this.helpContent.get(contentKey);
        if (!content) return;'
'';
        this.hideHelp('')';
        this.helpElement = document.createElement('div'');''
        this.helpElement.className = 'contextual-help-tooltip';'
        this.helpElement.innerHTML = `' }'
            <div class="help-title">${content.title}</div>""
            <div class="help-description">${content.description}</div>"
            ${ content.tips ? `""
                <ul class="help-tips">" }"
                    ${content.tips.map(tip => `<li>${tip)</li>`").join('''})}'
                </ul> : undefined'';
            ` : ''}
        `;

        document.body.appendChild(this.helpElement);

        if (element) { this.positionHelp(element); }
        }
    }

    private positionHelp(targetElement: HTMLElement): void { if (!this.helpElement) return;

        const rect = targetElement.getBoundingClientRect();
        const helpRect = this.helpElement.getBoundingClientRect();

        let top = 0;
        let left = 0;'
'';
        switch(this.config.position') {'
            '';
            case 'top':';
                top = rect.top - helpRect.height - 10;''
                left = rect.left + (rect.width - helpRect.width') / 2;'
                break;''
            case 'bottom':';
                top = rect.bottom + 10;''
                left = rect.left + (rect.width - helpRect.width') / 2;'
                break;''
            case 'left':'';
                top = rect.top + (rect.height - helpRect.height') / 2;
                left = rect.left - helpRect.width - 10;'
                break;''
            case 'right':'';
                top = rect.top + (rect.height - helpRect.height') / 2;
                left = rect.right + 10;
        }
                break; }
        }'
'';
        this.helpElement.style.position = 'absolute';
        this.helpElement.style.top = `${top}px`;'
        this.helpElement.style.left = `${left}px`;''
        this.helpElement.style.zIndex = '10000';
    }

    hideHelp(): void { if (this.helpElement) {
            this.helpElement.remove();
            this.helpElement = null; }
        }
    }

    setContext(context: HelpContext): void { this.currentContext = context; }
    }

    addHelpContent(key: string, content: HelpContent): void { this.helpContent.set(key, content); }
    }

    updateConfig(newConfig: Partial<HelpManagerConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    destroy(): void { this.hideHelp();
        if(this.showTimer) {'
            ';
        }'
            clearTimeout(this.showTimer'); }
        }'
        '';
        if(typeof window !== 'undefined'') {'
            '';
            document.removeEventListener('mouseover', this.handleMouseOver.bind(this)');'
        }'
            document.removeEventListener('mouseout', this.handleMouseOut.bind(this); }
        }
    }
}

// シングルトンインスタンス
let instance: ContextualHelpManager | null = null,
';
export function getContextualHelpManager(): ContextualHelpManager { if (!instance) {''
        instance = new ContextualHelpManager(' })