import { getErrorHandler  } from '../../utils/ErrorHandler.js';
import { getLocalizationManager  } from '../../core/LocalizationManager.js';
import type { AudioManager } from '../../audio/AudioManager.js';
import type { ConfigurationManager } from '../../core/ConfigurationManager.js';
import type { ErrorHandler } from '../../utils/ErrorHandler.js';
import type { LocalizationManager } from '../../core/LocalizationManager.js';

/**
 * Tab definition interface
 */
interface TabDefinition { label: string;
    icon: string;

/**
 * Tab key type'
 */''
type TabKey = 'volume' | 'quality' | 'effects' | 'accessibility' | 'test';

/**
 * Tab renderers interface
 */
interface TabRenderers { renderVolumeTab(content: HTMLElement): void;
    renderQualityTab(content: HTMLElement): void;
    renderEffectsTab(content: HTMLElement): void;
    renderAccessibilityTab(content: HTMLElement): void;
    renderTestTab(content: HTMLElement): void;

/**
 * Audio Settings Tab Manager
 * オーディオ設定タブ管理 - タブナビゲーション、タブ描画処理
 */
export class AudioSettingsTabManager {
    private audioManager: AudioManager;
    private configManager: ConfigurationManager;
    private localizationManager: LocalizationManager;
    private errorHandler: ErrorHandler;
    // タブ定義
    private, tabs: Record<TabKey, TabDefinition> = { }'

        volume: { label: 'audio.settings.tabs.volume', icon: '🔊'
            },''
        quality: { label: 'audio.settings.tabs.quality', icon: '🎚️'
            },''
        effects: { label: 'audio.settings.tabs.effects', icon: '🎛️'
            },''
        accessibility: { label: 'audio.settings.tabs.accessibility', icon: '♿'
            },''
        test: { label: 'audio.settings.tabs.test', icon: '🔧'
            };

    private activeTab: TabKey = 'volume';
    private container: HTMLElement | null = null;
    private, tabRenderers: TabRenderers | null = null;
    constructor(audioManager: AudioManager, configManager: ConfigurationManager) {

        this.audioManager = audioManager;
        this.configManager = configManager;
        this.localizationManager = getLocalizationManager() }
        this.errorHandler = getErrorHandler(); }
    }
    
    /**
     * タブレンダラーを設定
     */
    setTabRenderers(tabRenderers: TabRenderers): void { this.tabRenderers = tabRenderers }
    
    /**
     * タブナビゲーションを作成'
     */''
    createTabNavigation()';'
        const nav = document.createElement('div');
        nav.className = 'audio-settings-tabs';
        nav.style.cssText = `;
            display: flex,
    gap: 10px,
            border-bottom: 2px solid #333333,
            padding-bottom: 10px,
        `;

        Object.entries(this.tabs).forEach(([key, tab]) => {  const tabKey = key as TabKey,' }'

            const button = document.createElement('button');' }'

            button.className = `audio-settings-tab ${tabKey === this.activeTab ? 'active' : '}`;'
            button.innerHTML = `${tab.icon} ${this.localizationManager.getText(tab.label'}'`;

            button.style.cssText = `';'
                background: ${tabKey === this.activeTab ? 'rgba(0, 255, 255, 0.2'}'' : 'none'},''
                border: 2px solid ${tabKey === this.activeTab ? '#00ffff' : '#333333'},''
                color: ${tabKey === this.activeTab ? '#00ffff' : '#999999'},
                padding: 10px 20px,
                border-radius: 8px,
                cursor: pointer,
                font-size: 16px,
                transition: all 0.3s ease,
            `;

            button.addEventListener('click', () => this.showTab(tabKey));
            button.addEventListener('mouseenter', () => {  ''
                if (tabKey !== this.activeTab) {', ' }

                    button.style.borderColor = '#666666'; }

                    button.style.color = '#cccccc'; }
};
            button.addEventListener('mouseleave', () => {  ''
                if (tabKey !== this.activeTab) {', ' }

                    button.style.borderColor = '#333333'; }

                    button.style.color = '#999999'; }
};
            
            nav.appendChild(button);
        };
        
        return nav;
    }
    
    /**
     * タブを表示'
     */''
    showTab(tabKey: TabKey): void { try {
            // 現在のタブを非アクティブ化
            const tabs = this.container.querySelectorAll('.audio-settings-tab',
            tabs.forEach(tab => { '),'
                tab.classList.remove('active');
                tab.style.background = 'none',
                tab.style.borderColor = '#333333',' }'

                tab.style.color = '#999999'; }
            };
            
            // 新しいタブをアクティブ化
            const activeTabButton = Array.from(tabs).find(tab => );
                tab.textContent?.includes(this.tabs[tabKey].icon) as HTMLElement | undefined;
            if (activeTabButton) {

                activeTabButton.classList.add('active');
                activeTabButton.style.background = 'rgba(0, 255, 255, 0.2)',
                activeTabButton.style.borderColor = '#00ffff' }

                activeTabButton.style.color = '#00ffff'; }
            }
            
            this.activeTab = tabKey;
            ';'
            // コンテンツを更新
            const content = document.getElementById('audio-settings-content';
            if (content && this.tabRenderers) {

                content.innerHTML = ','

                switch(tabKey) { : undefined''
                    case 'volume':','
                        this.tabRenderers.renderVolumeTab(content);
                        break,
                    case 'quality':','
                        this.tabRenderers.renderQualityTab(content);
                        break,
                    case 'effects':','
                        this.tabRenderers.renderEffectsTab(content);
                        break,
                    case 'accessibility':','
                        this.tabRenderers.renderAccessibilityTab(content);
                        break,
                    case 'test':,
                        this.tabRenderers.renderTestTab(content) }
                        break; }
}
            
            // UIサウンドを再生
            if (this.audioManager) { }'

                (this.audioManager, as any').playUISound?.('tab_switch', { volume: 0.3 };'} catch (error) { this.errorHandler.handleError(error, 'UI_ERROR', {''
                component: 'AudioSettingsTabManager',','
                operation: 'showTab');
                tabKey: tabKey,
    }
    
    /**
     * コンテナを設定
     */
    setContainer(container: HTMLElement): void { this.container = container }
    
    /**
     * アクティブタブを取得
     */
    getActiveTab(): TabKey { return this.activeTab }
    
    /**
     * タブ定義を取得'
     */''
    getTabs();