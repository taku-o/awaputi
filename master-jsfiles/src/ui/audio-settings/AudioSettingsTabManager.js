import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getLocalizationManager } from '../../core/LocalizationManager.js';

/**
 * Audio Settings Tab Manager
 * オーディオ設定タブ管理 - タブナビゲーション、タブ描画処理
 */
export class AudioSettingsTabManager {
    constructor(audioManager, configManager) {
        this.audioManager = audioManager;
        this.configManager = configManager;
        this.localizationManager = getLocalizationManager();
        this.errorHandler = getErrorHandler();
        
        // タブ定義
        this.tabs = {
            volume: { label: 'audio.settings.tabs.volume', icon: '🔊' },
            quality: { label: 'audio.settings.tabs.quality', icon: '🎚️' },
            effects: { label: 'audio.settings.tabs.effects', icon: '🎛️' },
            accessibility: { label: 'audio.settings.tabs.accessibility', icon: '♿' },
            test: { label: 'audio.settings.tabs.test', icon: '🔧' }
        };
        
        this.activeTab = 'volume';
        this.container = null;
        this.tabRenderers = null;
    }
    
    /**
     * タブレンダラーを設定
     */
    setTabRenderers(tabRenderers) {
        this.tabRenderers = tabRenderers;
    }
    
    /**
     * タブナビゲーションを作成
     */
    createTabNavigation() {
        const nav = document.createElement('div');
        nav.className = 'audio-settings-tabs';
        nav.style.cssText = `
            display: flex;
            gap: 10px;
            border-bottom: 2px solid #333333;
            padding-bottom: 10px;
        `;
        
        Object.entries(this.tabs).forEach(([key, tab]) => {
            const button = document.createElement('button');
            button.className = `audio-settings-tab ${key === this.activeTab ? 'active' : ''}`;
            button.innerHTML = `${tab.icon} ${this.localizationManager.getText(tab.label)}`;
            button.style.cssText = `
                background: ${key === this.activeTab ? 'rgba(0, 255, 255, 0.2)' : 'none'};
                border: 2px solid ${key === this.activeTab ? '#00ffff' : '#333333'};
                color: ${key === this.activeTab ? '#00ffff' : '#999999'};
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
            `;
            
            button.addEventListener('click', () => this.showTab(key));
            button.addEventListener('mouseenter', () => {
                if (key !== this.activeTab) {
                    button.style.borderColor = '#666666';
                    button.style.color = '#cccccc';
                }
            });
            button.addEventListener('mouseleave', () => {
                if (key !== this.activeTab) {
                    button.style.borderColor = '#333333';
                    button.style.color = '#999999';
                }
            });
            
            nav.appendChild(button);
        });
        
        return nav;
    }
    
    /**
     * タブを表示
     */
    showTab(tabKey) {
        try {
            // 現在のタブを非アクティブ化
            const tabs = this.container.querySelectorAll('.audio-settings-tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
                tab.style.background = 'none';
                tab.style.borderColor = '#333333';
                tab.style.color = '#999999';
            });
            
            // 新しいタブをアクティブ化
            const activeTabButton = Array.from(tabs).find(tab => 
                tab.textContent.includes(this.tabs[tabKey].icon)
            );
            if (activeTabButton) {
                activeTabButton.classList.add('active');
                activeTabButton.style.background = 'rgba(0, 255, 255, 0.2)';
                activeTabButton.style.borderColor = '#00ffff';
                activeTabButton.style.color = '#00ffff';
            }
            
            this.activeTab = tabKey;
            
            // コンテンツを更新
            const content = document.getElementById('audio-settings-content');
            if (content && this.tabRenderers) {
                content.innerHTML = '';
                
                switch (tabKey) {
                    case 'volume':
                        this.tabRenderers.renderVolumeTab(content);
                        break;
                    case 'quality':
                        this.tabRenderers.renderQualityTab(content);
                        break;
                    case 'effects':
                        this.tabRenderers.renderEffectsTab(content);
                        break;
                    case 'accessibility':
                        this.tabRenderers.renderAccessibilityTab(content);
                        break;
                    case 'test':
                        this.tabRenderers.renderTestTab(content);
                        break;
                }
            }
            
            // UIサウンドを再生
            if (this.audioManager) {
                this.audioManager.playUISound('tab_switch', { volume: 0.3 });
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsTabManager',
                operation: 'showTab',
                tabKey: tabKey
            });
        }
    }
    
    /**
     * コンテナを設定
     */
    setContainer(container) {
        this.container = container;
    }
    
    /**
     * アクティブタブを取得
     */
    getActiveTab() {
        return this.activeTab;
    }
    
    /**
     * タブ定義を取得
     */
    getTabs() {
        return this.tabs;
    }
}