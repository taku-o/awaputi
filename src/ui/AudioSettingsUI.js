import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getLocalizationManager } from '../core/LocalizationManager.js';
import { AudioTestPanel } from './AudioTestPanel.js';

/**
 * 音響設定UIクラス
 */
export class AudioSettingsUI {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.configManager = getConfigurationManager();
        this.localizationManager = getLocalizationManager();
        this.errorHandler = getErrorHandler();
        
        // UI要素
        this.container = null;
        this.isOpen = false;
        
        // タブ管理
        this.tabs = {
            volume: { label: 'audio.settings.tabs.volume', icon: '🔊' },
            quality: { label: 'audio.settings.tabs.quality', icon: '🎚️' },
            effects: { label: 'audio.settings.tabs.effects', icon: '🎛️' },
            accessibility: { label: 'audio.settings.tabs.accessibility', icon: '♿' },
            test: { label: 'audio.settings.tabs.test', icon: '🔧' }
        };
        this.activeTab = 'volume';
        
        // スライダー管理
        this.sliders = new Map();
        
        // プレビュー音源
        this.previewTimeouts = new Map();
        
        // イベントリスナー
        this.eventListeners = new Map();
        
        // 設定変更の監視
        this.configWatchers = new Set();
        
        // 音響テストパネル
        this.audioTestPanel = new AudioTestPanel(audioManager);
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // コンテナ作成
            this.createContainer();
            
            // 設定変更の監視を設定
            this.setupConfigWatchers();
            
            console.log('AudioSettingsUI initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsUI',
                operation: 'initialize'
            });
        }
    }
    
    /**
     * UIコンテナを作成
     * @private
     */
    createContainer() {
        // メインコンテナ
        this.container = document.createElement('div');
        this.container.className = 'audio-settings-ui';
        this.container.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-width: 90vw;
            max-height: 80vh;
            background-color: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ffff;
            border-radius: 15px;
            padding: 20px;
            z-index: 10000;
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #ffffff;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        `;
        
        // ヘッダー
        const header = this.createHeader();
        this.container.appendChild(header);
        
        // タブナビゲーション
        const tabNav = this.createTabNavigation();
        this.container.appendChild(tabNav);
        
        // コンテンツエリア
        const content = document.createElement('div');
        content.className = 'audio-settings-content';
        content.style.cssText = `
            margin-top: 20px;
            max-height: calc(80vh - 180px);
            overflow-y: auto;
            padding-right: 10px;
        `;
        content.id = 'audio-settings-content';
        this.container.appendChild(content);
        
        // フッター
        const footer = this.createFooter();
        this.container.appendChild(footer);
        
        // ドキュメントに追加
        document.body.appendChild(this.container);
        
        // 初期タブを表示
        this.showTab(this.activeTab);
    }
    
    /**
     * ヘッダーを作成
     * @private
     * @returns {HTMLElement} ヘッダー要素
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'audio-settings-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #00ffff;
        `;
        
        // タイトル
        const title = document.createElement('h2');
        title.textContent = this.localizationManager.getText('audio.settings.title');
        title.style.cssText = `
            margin: 0;
            font-size: 24px;
            color: #00ffff;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        `;
        header.appendChild(title);
        
        // 閉じるボタン
        const closeButton = document.createElement('button');
        closeButton.className = 'audio-settings-close';
        closeButton.textContent = '✖';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
            padding: 5px 10px;
            transition: all 0.3s ease;
        `;
        closeButton.addEventListener('click', () => this.close());
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = '#ff0000';
            closeButton.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = '#ffffff';
            closeButton.style.textShadow = 'none';
        });
        header.appendChild(closeButton);
        
        return header;
    }
    
    /**
     * タブナビゲーションを作成
     * @private
     * @returns {HTMLElement} タブナビゲーション要素
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
     * フッターを作成
     * @private
     * @returns {HTMLElement} フッター要素
     */
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'audio-settings-footer';
        footer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #333333;
        `;
        
        // リセットボタン
        const resetButton = document.createElement('button');
        resetButton.className = 'audio-settings-reset';
        resetButton.textContent = this.localizationManager.getText('audio.settings.reset');
        resetButton.style.cssText = `
            background-color: rgba(255, 0, 0, 0.2);
            border: 2px solid #ff0000;
            color: #ff0000;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        `;
        resetButton.addEventListener('click', () => this.resetSettings());
        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            resetButton.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        });
        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
            resetButton.style.boxShadow = 'none';
        });
        footer.appendChild(resetButton);
        
        // 中央ボタングループ
        const middleGroup = document.createElement('div');
        middleGroup.style.cssText = `
            display: flex;
            gap: 10px;
        `;
        
        // インポートボタン
        const importButton = document.createElement('button');
        importButton.className = 'audio-settings-import';
        importButton.textContent = '📁 ' + this.localizationManager.getText('audio.settings.import');
        importButton.style.cssText = `
            background-color: rgba(0, 255, 0, 0.2);
            border: 2px solid #00ff00;
            color: #00ff00;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        importButton.addEventListener('click', () => this.importSettings());
        importButton.addEventListener('mouseenter', () => {
            importButton.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            importButton.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
        });
        importButton.addEventListener('mouseleave', () => {
            importButton.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
            importButton.style.boxShadow = 'none';
        });
        middleGroup.appendChild(importButton);
        
        // エクスポートボタン
        const exportButton = document.createElement('button');
        exportButton.className = 'audio-settings-export';
        exportButton.textContent = '💾 ' + this.localizationManager.getText('audio.settings.export');
        exportButton.style.cssText = `
            background-color: rgba(0, 255, 255, 0.2);
            border: 2px solid #00ffff;
            color: #00ffff;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        exportButton.addEventListener('click', () => this.exportSettings());
        exportButton.addEventListener('mouseenter', () => {
            exportButton.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
            exportButton.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
        });
        exportButton.addEventListener('mouseleave', () => {
            exportButton.style.backgroundColor = 'rgba(0, 255, 255, 0.2)';
            exportButton.style.boxShadow = 'none';
        });
        middleGroup.appendChild(exportButton);
        
        footer.appendChild(middleGroup);
        
        // 保存状態表示
        const saveStatus = document.createElement('span');
        saveStatus.className = 'audio-settings-save-status';
        saveStatus.textContent = this.localizationManager.getText('audio.settings.saved');
        saveStatus.style.cssText = `
            color: #00ff00;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        saveStatus.id = 'audio-settings-save-status';
        footer.appendChild(saveStatus);
        
        return footer;
    }
    
    /**
     * タブを表示
     * @param {string} tabKey - タブキー
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
            if (content) {
                content.innerHTML = '';
                
                switch (tabKey) {
                    case 'volume':
                        this.renderVolumeTab(content);
                        break;
                    case 'quality':
                        this.renderQualityTab(content);
                        break;
                    case 'effects':
                        this.renderEffectsTab(content);
                        break;
                    case 'accessibility':
                        this.renderAccessibilityTab(content);
                        break;
                    case 'test':
                        this.renderTestTab(content);
                        break;
                }
            }
            
            // UIサウンドを再生
            if (this.audioManager) {
                this.audioManager.playUISound('tab_switch', { volume: 0.3 });
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsUI',
                operation: 'showTab',
                tabKey: tabKey
            });
        }
    }
    
    /**
     * 音量タブを描画
     * @private
     * @param {HTMLElement} container - コンテナ要素
     */
    renderVolumeTab(container) {
        // 音量設定セクション
        const volumeSection = document.createElement('div');
        volumeSection.className = 'settings-section';
        volumeSection.style.marginBottom = '30px';
        
        // マスター音量
        this.createVolumeSlider(volumeSection, {
            id: 'master-volume',
            label: 'audio.settings.volume.master',
            icon: '🎵',
            category: 'master',
            defaultValue: this.audioManager.getVolume('master'),
            previewSound: 'success'
        });
        
        // BGM音量
        this.createVolumeSlider(volumeSection, {
            id: 'bgm-volume',
            label: 'audio.settings.volume.bgm',
            icon: '🎼',
            category: 'bgm',
            defaultValue: this.audioManager.getVolume('bgm'),
            previewSound: null // BGMプレビューは特別処理
        });
        
        // 効果音音量
        this.createVolumeSlider(volumeSection, {
            id: 'sfx-volume',
            label: 'audio.settings.volume.sfx',
            icon: '🔔',
            category: 'sfx',
            defaultValue: this.audioManager.getVolume('sfx'),
            previewSound: 'pop'
        });
        
        container.appendChild(volumeSection);
        
        // ミュート設定
        const muteSection = document.createElement('div');
        muteSection.className = 'settings-section';
        muteSection.style.marginTop = '30px';
        
        this.createToggleOption(muteSection, {
            id: 'mute-all',
            label: 'audio.settings.volume.muteAll',
            icon: '🔇',
            defaultValue: this.audioManager.isMuted,
            onChange: (value) => {
                this.audioManager.setMuted(value);
                this.updateVolumeSliders(!value);
            }
        });
        
        container.appendChild(muteSection);
    }
    
    /**
     * 品質タブを描画
     * @private
     * @param {HTMLElement} container - コンテナ要素
     */
    renderQualityTab(container) {
        const qualitySection = document.createElement('div');
        qualitySection.className = 'settings-section';
        
        // 音質プリセット
        const presets = [
            { value: 'low', label: 'audio.settings.quality.low' },
            { value: 'medium', label: 'audio.settings.quality.medium' },
            { value: 'high', label: 'audio.settings.quality.high' },
            { value: 'ultra', label: 'audio.settings.quality.ultra' }
        ];
        
        this.createRadioGroup(qualitySection, {
            id: 'quality-preset',
            label: 'audio.settings.quality.preset',
            icon: '🎚️',
            options: presets,
            defaultValue: 'high',
            onChange: (value) => {
                this.applyQualityPreset(value);
            }
        });
        
        // 詳細設定
        const advancedSection = document.createElement('div');
        advancedSection.className = 'settings-subsection';
        advancedSection.style.marginTop = '30px';
        
        const advancedTitle = document.createElement('h3');
        advancedTitle.textContent = this.localizationManager.getText('audio.settings.quality.advanced');
        advancedTitle.style.cssText = `
            color: #00ffff;
            font-size: 18px;
            margin-bottom: 15px;
        `;
        advancedSection.appendChild(advancedTitle);
        
        // サンプルレート
        this.createDropdown(advancedSection, {
            id: 'sample-rate',
            label: 'audio.settings.quality.sampleRate',
            icon: '📊',
            options: [
                { value: 22050, label: '22.05 kHz' },
                { value: 44100, label: '44.1 kHz' },
                { value: 48000, label: '48 kHz' }
            ],
            defaultValue: 44100,
            onChange: (value) => {
                this.audioManager.updateQualitySettings({ sampleRate: parseInt(value) });
            }
        });
        
        // バッファサイズ
        this.createDropdown(advancedSection, {
            id: 'buffer-size',
            label: 'audio.settings.quality.bufferSize',
            icon: '💾',
            options: [
                { value: 256, label: '256 (低遅延)' },
                { value: 512, label: '512 (バランス)' },
                { value: 1024, label: '1024 (高品質)' },
                { value: 2048, label: '2048 (最高品質)' }
            ],
            defaultValue: 512,
            onChange: (value) => {
                this.audioManager.updateQualitySettings({ bufferSize: parseInt(value) });
            }
        });
        
        qualitySection.appendChild(advancedSection);
        container.appendChild(qualitySection);
    }
    
    /**
     * エフェクトタブを描画
     * @private
     * @param {HTMLElement} container - コンテナ要素
     */
    renderEffectsTab(container) {
        const effectsSection = document.createElement('div');
        effectsSection.className = 'settings-section';
        
        // リバーブ効果
        this.createToggleOption(effectsSection, {
            id: 'reverb-enabled',
            label: 'audio.settings.effects.reverb',
            icon: '🌊',
            defaultValue: this.configManager.get('audio.effects.reverb'),
            onChange: (value) => {
                this.audioManager.setAudioEffect('reverb', value);
            }
        });
        
        // コンプレッサー
        this.createToggleOption(effectsSection, {
            id: 'compression-enabled',
            label: 'audio.settings.effects.compression',
            icon: '🎛️',
            defaultValue: this.configManager.get('audio.effects.compression'),
            onChange: (value) => {
                this.audioManager.setAudioEffect('compression', value);
            }
        });
        
        // イコライザー
        if (this.audioManager.audioController && this.audioManager.audioController.equalizer) {
            const eqSection = document.createElement('div');
            eqSection.className = 'settings-subsection';
            eqSection.style.marginTop = '30px';
            
            const eqTitle = document.createElement('h3');
            eqTitle.textContent = this.localizationManager.getText('audio.settings.effects.equalizer');
            eqTitle.style.cssText = `
                color: #00ffff;
                font-size: 18px;
                margin-bottom: 15px;
            `;
            eqSection.appendChild(eqTitle);
            
            // イコライザーバンド
            const bands = [
                { id: 'eq-low', label: '低音', frequency: 80, icon: '🔊' },
                { id: 'eq-low-mid', label: '中低音', frequency: 250, icon: '🔉' },
                { id: 'eq-mid', label: '中音', frequency: 1000, icon: '🔈' },
                { id: 'eq-high-mid', label: '中高音', frequency: 4000, icon: '🔉' },
                { id: 'eq-high', label: '高音', frequency: 12000, icon: '🔊' }
            ];
            
            bands.forEach(band => {
                this.createVerticalSlider(eqSection, {
                    id: band.id,
                    label: band.label,
                    icon: band.icon,
                    min: -12,
                    max: 12,
                    defaultValue: 0,
                    unit: 'dB',
                    onChange: (value) => {
                        if (this.audioManager.audioController) {
                            this.audioManager.audioController.setEqualizerBand(band.frequency, value);
                        }
                    }
                });
            });
            
            effectsSection.appendChild(eqSection);
        }
        
        // 環境音
        this.createToggleOption(effectsSection, {
            id: 'environmental-audio',
            label: 'audio.settings.effects.environmental',
            icon: '🌿',
            defaultValue: this.configManager.get('audio.effects.environmentalAudio'),
            onChange: (value) => {
                if (this.audioManager.audioController) {
                    this.audioManager.audioController.enableEnvironmentalAudio(value);
                }
            }
        });
        
        container.appendChild(effectsSection);
    }
    
    /**
     * アクセシビリティタブを描画
     * @private
     * @param {HTMLElement} container - コンテナ要素
     */
    renderAccessibilityTab(container) {
        const accessibilitySection = document.createElement('div');
        accessibilitySection.className = 'settings-section';
        
        // 視覚的フィードバック
        this.createToggleOption(accessibilitySection, {
            id: 'visual-feedback',
            label: 'audio.settings.accessibility.visualFeedback',
            icon: '👁️',
            defaultValue: this.configManager.get('audio.accessibility.visualFeedback'),
            onChange: (value) => {
                this.configManager.set('audio.accessibility.visualFeedback', value);
            }
        });
        
        // 触覚フィードバック
        this.createToggleOption(accessibilitySection, {
            id: 'haptic-feedback',
            label: 'audio.settings.accessibility.hapticFeedback',
            icon: '📳',
            defaultValue: this.configManager.get('audio.accessibility.hapticFeedback'),
            onChange: (value) => {
                this.configManager.set('audio.accessibility.hapticFeedback', value);
            }
        });
        
        // 字幕
        this.createToggleOption(accessibilitySection, {
            id: 'captioning',
            label: 'audio.settings.accessibility.captioning',
            icon: '📝',
            defaultValue: this.configManager.get('audio.accessibility.captioning'),
            onChange: (value) => {
                this.configManager.set('audio.accessibility.captioning', value);
            }
        });
        
        // 音響説明
        this.createToggleOption(accessibilitySection, {
            id: 'audio-descriptions',
            label: 'audio.settings.accessibility.audioDescriptions',
            icon: '🗣️',
            defaultValue: this.configManager.get('audio.accessibility.audioDescriptions'),
            onChange: (value) => {
                this.configManager.set('audio.accessibility.audioDescriptions', value);
            }
        });
        
        container.appendChild(accessibilitySection);
    }
    
    /**
     * テストタブを描画
     * @private
     * @param {HTMLElement} container - コンテナ要素
     */
    renderTestTab(container) {
        // テストパネルを表示
        this.audioTestPanel.open(container);
        
        // テスト説明
        const description = document.createElement('div');
        description.className = 'test-description';
        description.style.cssText = `
            background-color: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #00ffff;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
        `;
        
        const descTitle = document.createElement('h4');
        descTitle.textContent = this.localizationManager.getText('audio.test.description.title');
        descTitle.style.cssText = `
            color: #00ffff;
            font-size: 16px;
            margin-bottom: 10px;
        `;
        description.appendChild(descTitle);
        
        const descText = document.createElement('p');
        descText.textContent = this.localizationManager.getText('audio.test.description.text');
        descText.style.cssText = `
            color: #cccccc;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
        `;
        description.appendChild(descText);
        
        // テストパネルの前に説明を挿入
        container.insertBefore(description, container.firstChild);
    }
    
    /**
     * 音量スライダーを作成
     * @private
     * @param {HTMLElement} container - コンテナ要素
     * @param {Object} options - オプション
     */
    createVolumeSlider(container, options) {
        const sliderGroup = document.createElement('div');
        sliderGroup.className = 'slider-group';
        sliderGroup.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        `;
        
        // ラベル
        const labelContainer = document.createElement('div');
        labelContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        `;
        
        const label = document.createElement('label');
        label.htmlFor = options.id;
        label.innerHTML = `${options.icon} ${this.localizationManager.getText(options.label)}`;
        label.style.cssText = `
            color: #ffffff;
            font-size: 16px;
        `;
        labelContainer.appendChild(label);
        
        // 値表示
        const valueDisplay = document.createElement('span');
        valueDisplay.id = `${options.id}-value`;
        valueDisplay.textContent = `${Math.round(options.defaultValue * 100)}%`;
        valueDisplay.style.cssText = `
            color: #00ffff;
            font-size: 16px;
            font-weight: bold;
        `;
        labelContainer.appendChild(valueDisplay);
        
        sliderGroup.appendChild(labelContainer);
        
        // スライダーコンテナ
        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        
        // スライダー
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = options.id;
        slider.min = '0';
        slider.max = '100';
        slider.value = Math.round(options.defaultValue * 100);
        slider.style.cssText = `
            flex: 1;
            height: 8px;
            -webkit-appearance: none;
            background: linear-gradient(to right, #00ffff 0%, #00ffff ${slider.value}%, #333333 ${slider.value}%, #333333 100%);
            border-radius: 4px;
            outline: none;
            cursor: pointer;
        `;
        
        // プレビューボタン
        const previewButton = document.createElement('button');
        previewButton.className = 'preview-button';
        previewButton.innerHTML = '🔊';
        previewButton.style.cssText = `
            background-color: rgba(0, 255, 255, 0.2);
            border: 2px solid #00ffff;
            color: #00ffff;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s ease;
        `;
        
        // イベントハンドラー
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) / 100;
            valueDisplay.textContent = `${e.target.value}%`;
            slider.style.background = `linear-gradient(to right, #00ffff 0%, #00ffff ${e.target.value}%, #333333 ${e.target.value}%, #333333 100%)`;
            
            // 音量を設定
            this.audioManager.setVolume(options.category, value);
            
            // 保存状態を表示
            this.showSaveStatus();
            
            // プレビュー音を予約
            this.schedulePreview(options);
        });
        
        previewButton.addEventListener('click', () => {
            this.playPreviewSound(options);
            
            // ボタンアニメーション
            previewButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                previewButton.style.transform = 'scale(1)';
            }, 100);
        });
        
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(previewButton);
        sliderGroup.appendChild(sliderContainer);
        
        container.appendChild(sliderGroup);
        
        // スライダーを保存
        this.sliders.set(options.id, slider);
    }
    
    /**
     * トグルオプションを作成
     * @private
     * @param {HTMLElement} container - コンテナ要素
     * @param {Object} options - オプション
     */
    createToggleOption(container, options) {
        const toggleGroup = document.createElement('div');
        toggleGroup.className = 'toggle-group';
        toggleGroup.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        // ラベル
        const label = document.createElement('label');
        label.htmlFor = options.id;
        label.innerHTML = `${options.icon} ${this.localizationManager.getText(options.label)}`;
        label.style.cssText = `
            color: #ffffff;
            font-size: 16px;
            cursor: pointer;
        `;
        
        // トグルスイッチ
        const switchContainer = document.createElement('div');
        switchContainer.style.cssText = `
            position: relative;
            width: 60px;
            height: 30px;
        `;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = options.id;
        checkbox.checked = options.defaultValue;
        checkbox.style.cssText = `
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
        `;
        
        const switchLabel = document.createElement('label');
        switchLabel.htmlFor = options.id;
        switchLabel.style.cssText = `
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${checkbox.checked ? '#00ffff' : '#333333'};
            transition: all 0.3s ease;
            border-radius: 30px;
        `;
        
        const switchKnob = document.createElement('span');
        switchKnob.style.cssText = `
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: ${checkbox.checked ? '34px' : '4px'};
            bottom: 4px;
            background-color: white;
            transition: all 0.3s ease;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        `;
        switchLabel.appendChild(switchKnob);
        
        // イベントハンドラー
        checkbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            switchLabel.style.backgroundColor = isChecked ? '#00ffff' : '#333333';
            switchKnob.style.left = isChecked ? '34px' : '4px';
            
            if (options.onChange) {
                options.onChange(isChecked);
            }
            
            // UIサウンド
            this.audioManager.playUISound('toggle', { volume: 0.3 });
            
            // 保存状態を表示
            this.showSaveStatus();
        });
        
        toggleGroup.addEventListener('mouseenter', () => {
            toggleGroup.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        toggleGroup.addEventListener('mouseleave', () => {
            toggleGroup.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        });
        
        toggleGroup.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        
        switchContainer.appendChild(checkbox);
        switchContainer.appendChild(switchLabel);
        toggleGroup.appendChild(label);
        toggleGroup.appendChild(switchContainer);
        
        container.appendChild(toggleGroup);
    }
    
    /**
     * ラジオグループを作成
     * @private
     * @param {HTMLElement} container - コンテナ要素
     * @param {Object} options - オプション
     */
    createRadioGroup(container, options) {
        const radioGroup = document.createElement('div');
        radioGroup.className = 'radio-group';
        radioGroup.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        `;
        
        // ラベル
        const groupLabel = document.createElement('h3');
        groupLabel.innerHTML = `${options.icon} ${this.localizationManager.getText(options.label)}`;
        groupLabel.style.cssText = `
            color: #00ffff;
            font-size: 18px;
            margin-bottom: 15px;
        `;
        radioGroup.appendChild(groupLabel);
        
        // オプション
        const optionsContainer = document.createElement('div');
        optionsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
        `;
        
        options.options.forEach(option => {
            const optionLabel = document.createElement('label');
            optionLabel.style.cssText = `
                display: flex;
                align-items: center;
                padding: 10px;
                background-color: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = options.id;
            radio.value = option.value;
            radio.checked = option.value === options.defaultValue;
            radio.style.cssText = `
                margin-right: 8px;
                cursor: pointer;
            `;
            
            const text = document.createElement('span');
            text.textContent = this.localizationManager.getText(option.label);
            text.style.cssText = `
                color: #ffffff;
                font-size: 14px;
            `;
            
            radio.addEventListener('change', (e) => {
                if (e.target.checked && options.onChange) {
                    options.onChange(e.target.value);
                    this.audioManager.playUISound('select', { volume: 0.3 });
                    this.showSaveStatus();
                }
            });
            
            optionLabel.addEventListener('mouseenter', () => {
                optionLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            optionLabel.addEventListener('mouseleave', () => {
                optionLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            });
            
            optionLabel.appendChild(radio);
            optionLabel.appendChild(text);
            optionsContainer.appendChild(optionLabel);
        });
        
        radioGroup.appendChild(optionsContainer);
        container.appendChild(radioGroup);
    }
    
    /**
     * ドロップダウンを作成
     * @private
     * @param {HTMLElement} container - コンテナ要素
     * @param {Object} options - オプション
     */
    createDropdown(container, options) {
        const dropdownGroup = document.createElement('div');
        dropdownGroup.className = 'dropdown-group';
        dropdownGroup.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        `;
        
        // ラベル
        const label = document.createElement('label');
        label.htmlFor = options.id;
        label.innerHTML = `${options.icon} ${this.localizationManager.getText(options.label)}`;
        label.style.cssText = `
            display: block;
            color: #ffffff;
            font-size: 16px;
            margin-bottom: 10px;
        `;
        dropdownGroup.appendChild(label);
        
        // セレクト
        const select = document.createElement('select');
        select.id = options.id;
        select.style.cssText = `
            width: 100%;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            border: 2px solid #333333;
            border-radius: 8px;
            color: #ffffff;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        options.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            optionElement.selected = option.value === options.defaultValue;
            select.appendChild(optionElement);
        });
        
        select.addEventListener('change', (e) => {
            if (options.onChange) {
                options.onChange(e.target.value);
                this.audioManager.playUISound('select', { volume: 0.3 });
                this.showSaveStatus();
            }
        });
        
        select.addEventListener('focus', () => {
            select.style.borderColor = '#00ffff';
        });
        
        select.addEventListener('blur', () => {
            select.style.borderColor = '#333333';
        });
        
        dropdownGroup.appendChild(select);
        container.appendChild(dropdownGroup);
    }
    
    /**
     * 垂直スライダーを作成（イコライザー用）
     * @private
     * @param {HTMLElement} container - コンテナ要素
     * @param {Object} options - オプション
     */
    createVerticalSlider(container, options) {
        const sliderGroup = document.createElement('div');
        sliderGroup.className = 'vertical-slider-group';
        sliderGroup.style.cssText = `
            display: inline-block;
            text-align: center;
            margin: 0 15px;
            vertical-align: top;
        `;
        
        // 値表示
        const valueDisplay = document.createElement('div');
        valueDisplay.id = `${options.id}-value`;
        valueDisplay.textContent = `${options.defaultValue >= 0 ? '+' : ''}${options.defaultValue}${options.unit}`;
        valueDisplay.style.cssText = `
            color: #00ffff;
            font-size: 14px;
            margin-bottom: 10px;
        `;
        sliderGroup.appendChild(valueDisplay);
        
        // スライダーコンテナ
        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            position: relative;
            width: 40px;
            height: 150px;
            margin: 0 auto;
        `;
        
        // スライダー（垂直）
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = options.id;
        slider.min = options.min;
        slider.max = options.max;
        slider.value = options.defaultValue;
        slider.style.cssText = `
            position: absolute;
            width: 150px;
            height: 40px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) rotate(-90deg);
            -webkit-appearance: none;
            background: linear-gradient(to right, #333333 0%, #333333 50%, #00ffff 50%, #00ffff 100%);
            border-radius: 4px;
            outline: none;
            cursor: pointer;
        `;
        
        // スライダースタイル（Webkit）
        const style = document.createElement('style');
        style.textContent = `
            #${options.id}::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: #00ffff;
                cursor: pointer;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
            #${options.id}::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #00ffff;
                cursor: pointer;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueDisplay.textContent = `${value >= 0 ? '+' : ''}${value}${options.unit}`;
            
            // グラデーションを更新
            const percentage = ((value - options.min) / (options.max - options.min)) * 100;
            slider.style.background = `linear-gradient(to right, #333333 0%, #333333 ${percentage}%, #00ffff ${percentage}%, #00ffff 100%)`;
            
            if (options.onChange) {
                options.onChange(value);
            }
        });
        
        sliderContainer.appendChild(slider);
        sliderGroup.appendChild(sliderContainer);
        
        // ラベル
        const label = document.createElement('div');
        label.innerHTML = `${options.icon}<br>${options.label}`;
        label.style.cssText = `
            color: #ffffff;
            font-size: 12px;
            margin-top: 10px;
        `;
        sliderGroup.appendChild(label);
        
        container.appendChild(sliderGroup);
    }
    
    /**
     * プレビュー音を予約
     * @private
     * @param {Object} options - オプション
     */
    schedulePreview(options) {
        // 既存のタイムアウトをクリア
        if (this.previewTimeouts.has(options.id)) {
            clearTimeout(this.previewTimeouts.get(options.id));
        }
        
        // 新しいタイムアウトを設定
        const timeout = setTimeout(() => {
            this.playPreviewSound(options);
            this.previewTimeouts.delete(options.id);
        }, 500); // 0.5秒後に再生
        
        this.previewTimeouts.set(options.id, timeout);
    }
    
    /**
     * プレビュー音を再生
     * @private
     * @param {Object} options - オプション
     */
    playPreviewSound(options) {
        if (!options.previewSound || !this.audioManager) return;
        
        if (options.category === 'bgm') {
            // BGMプレビュー（短いフレーズを再生）
            const currentBGM = this.audioManager.getCurrentBGMInfo();
            if (currentBGM && currentBGM.isPlaying) {
                // 一時的に音量を上げる
                const originalVolume = this.audioManager.getVolume('bgm');
                this.audioManager.setBGMVolume(1.0, 0.2);
                setTimeout(() => {
                    this.audioManager.setBGMVolume(originalVolume, 0.2);
                }, 1000);
            } else {
                // BGMが再生されていない場合は短いメロディを生成
                this.audioManager.playSound('success', { volume: 0.5 });
            }
        } else {
            // 通常の効果音
            this.audioManager.playSound(options.previewSound, { 
                volume: options.category === 'master' ? 0.5 : 1.0 
            });
        }
    }
    
    /**
     * 保存状態を表示
     * @private
     */
    showSaveStatus() {
        const status = document.getElementById('audio-settings-save-status');
        if (status) {
            status.style.opacity = '1';
            setTimeout(() => {
                status.style.opacity = '0';
            }, 2000);
        }
    }
    
    /**
     * 音量スライダーを更新
     * @private
     * @param {boolean} enabled - 有効状態
     */
    updateVolumeSliders(enabled) {
        this.sliders.forEach((slider, id) => {
            if (id !== 'mute-all') {
                slider.disabled = !enabled;
                slider.style.opacity = enabled ? '1' : '0.5';
            }
        });
    }
    
    /**
     * 品質プリセットを適用
     * @private
     * @param {string} preset - プリセット名
     */
    applyQualityPreset(preset) {
        const presets = {
            low: { sampleRate: 22050, bufferSize: 1024 },
            medium: { sampleRate: 44100, bufferSize: 512 },
            high: { sampleRate: 44100, bufferSize: 256 },
            ultra: { sampleRate: 48000, bufferSize: 256 }
        };
        
        const settings = presets[preset];
        if (settings) {
            this.audioManager.updateQualitySettings(settings);
            
            // UIを更新
            const sampleRateSelect = document.getElementById('sample-rate');
            const bufferSizeSelect = document.getElementById('buffer-size');
            if (sampleRateSelect) sampleRateSelect.value = settings.sampleRate;
            if (bufferSizeSelect) bufferSizeSelect.value = settings.bufferSize;
        }
    }
    
    /**
     * 設定をエクスポート
     */
    async exportSettings() {
        try {
            // 現在の音響設定を収集
            const settings = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                volumes: {
                    master: this.audioManager.getVolume('master'),
                    bgm: this.audioManager.getVolume('bgm'),
                    sfx: this.audioManager.getVolume('sfx'),
                    muted: this.configManager.get('audio.volumes.muted')
                },
                quality: {
                    sampleRate: this.configManager.get('audio.quality.sampleRate'),
                    bufferSize: this.configManager.get('audio.quality.bufferSize'),
                    compression: this.configManager.get('audio.effects.compression')
                },
                effects: {
                    reverb: this.configManager.get('audio.effects.reverb'),
                    compression: this.configManager.get('audio.effects.compression'),
                    environmentalAudio: this.configManager.get('audio.effects.environmentalAudio')
                },
                equalizer: this.audioManager.audioController ? 
                    this.audioManager.audioController.getEqualizerSettings() : null,
                accessibility: {
                    visualFeedback: this.configManager.get('audio.accessibility.visualFeedback'),
                    hapticFeedback: this.configManager.get('audio.accessibility.hapticFeedback'),
                    captioning: this.configManager.get('audio.accessibility.captioning'),
                    audioDescriptions: this.configManager.get('audio.accessibility.audioDescriptions')
                }
            };
            
            // JSONファイルとしてダウンロード
            const json = JSON.stringify(settings, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `awaputi-audio-settings-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            // 成功音を再生
            this.audioManager.playSound('success', { volume: 0.5 });
            
            // 成功メッセージを表示
            this.showNotification(
                this.localizationManager.getText('audio.settings.export.success'),
                'success'
            );
            
            console.log('Audio settings exported successfully');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsUI',
                operation: 'exportSettings'
            });
            
            this.audioManager.playSound('error', { volume: 0.5 });
            this.showNotification(
                this.localizationManager.getText('audio.settings.export.error'),
                'error'
            );
        }
    }
    
    /**
     * 設定をインポート
     */
    async importSettings() {
        try {
            // ファイル選択ダイアログを作成
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const settings = JSON.parse(text);
                    
                    // 設定ファイルを検証
                    if (!this.validateSettingsFile(settings)) {
                        throw new Error('Invalid settings file format');
                    }
                    
                    // 確認ダイアログ
                    const confirm = window.confirm(
                        this.localizationManager.getText('audio.settings.import.confirm')
                    );
                    if (!confirm) return;
                    
                    // 設定を適用
                    await this.applyImportedSettings(settings);
                    
                    // UIを更新
                    this.showTab(this.activeTab);
                    
                    // 成功音を再生
                    this.audioManager.playSound('success', { volume: 0.5 });
                    
                    // 成功メッセージを表示
                    this.showNotification(
                        this.localizationManager.getText('audio.settings.import.success'),
                        'success'
                    );
                    
                    console.log('Audio settings imported successfully');
                    
                } catch (parseError) {
                    this.errorHandler.handleError(parseError, 'UI_ERROR', {
                        component: 'AudioSettingsUI',
                        operation: 'importSettings',
                        phase: 'parsing'
                    });
                    
                    this.audioManager.playSound('error', { volume: 0.5 });
                    this.showNotification(
                        this.localizationManager.getText('audio.settings.import.parseError'),
                        'error'
                    );
                }
                
                // 入力要素を削除
                document.body.removeChild(input);
            });
            
            document.body.appendChild(input);
            input.click();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsUI',
                operation: 'importSettings'
            });
        }
    }
    
    /**
     * 設定ファイルを検証
     * @private
     * @param {Object} settings - 設定オブジェクト
     * @returns {boolean} 有効性
     */
    validateSettingsFile(settings) {
        try {
            // 基本構造をチェック
            if (!settings || typeof settings !== 'object') {
                return false;
            }
            
            // 必須フィールドをチェック
            const requiredFields = ['version', 'volumes'];
            for (const field of requiredFields) {
                if (!(field in settings)) {
                    return false;
                }
            }
            
            // 音量設定をチェック
            const volumes = settings.volumes;
            if (!volumes || typeof volumes !== 'object') {
                return false;
            }
            
            const volumeFields = ['master', 'bgm', 'sfx'];
            for (const field of volumeFields) {
                if (!(field in volumes) || 
                    typeof volumes[field] !== 'number' || 
                    volumes[field] < 0 || 
                    volumes[field] > 1) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * インポートした設定を適用
     * @private
     * @param {Object} settings - 設定オブジェクト
     */
    async applyImportedSettings(settings) {
        try {
            // 音量設定を適用
            if (settings.volumes) {
                await this.configManager.set('audio.volumes.master', settings.volumes.master);
                await this.configManager.set('audio.volumes.bgm', settings.volumes.bgm);
                await this.configManager.set('audio.volumes.sfx', settings.volumes.sfx);
                if ('muted' in settings.volumes) {
                    await this.configManager.set('audio.volumes.muted', settings.volumes.muted);
                }
            }
            
            // 品質設定を適用
            if (settings.quality) {
                if (settings.quality.sampleRate) {
                    await this.configManager.set('audio.quality.sampleRate', settings.quality.sampleRate);
                }
                if (settings.quality.bufferSize) {
                    await this.configManager.set('audio.quality.bufferSize', settings.quality.bufferSize);
                }
            }
            
            // エフェクト設定を適用
            if (settings.effects) {
                if ('reverb' in settings.effects) {
                    await this.configManager.set('audio.effects.reverb', settings.effects.reverb);
                }
                if ('compression' in settings.effects) {
                    await this.configManager.set('audio.effects.compression', settings.effects.compression);
                }
                if ('environmentalAudio' in settings.effects) {
                    await this.configManager.set('audio.effects.environmentalAudio', settings.effects.environmentalAudio);
                }
            }
            
            // イコライザー設定を適用
            if (settings.equalizer && this.audioManager.audioController) {
                this.audioManager.audioController.setEqualizerSettings(settings.equalizer);
            }
            
            // アクセシビリティ設定を適用
            if (settings.accessibility) {
                const accessibilitySettings = settings.accessibility;
                Object.keys(accessibilitySettings).forEach(async (key) => {
                    await this.configManager.set(`audio.accessibility.${key}`, accessibilitySettings[key]);
                });
            }
            
            // AudioManagerの設定を同期
            this.audioManager.syncWithConfig();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsUI',
                operation: 'applyImportedSettings'
            });
            throw error;
        }
    }
    
    /**
     * 通知を表示
     * @private
     * @param {string} message - メッセージ
     * @param {string} type - タイプ ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        // 既存の通知があれば削除
        const existingNotification = document.querySelector('.audio-settings-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'audio-settings-notification';
        notification.textContent = message;
        
        const colors = {
            success: { bg: 'rgba(0, 255, 0, 0.2)', border: '#00ff00', text: '#00ff00' },
            error: { bg: 'rgba(255, 0, 0, 0.2)', border: '#ff0000', text: '#ff0000' },
            info: { bg: 'rgba(0, 255, 255, 0.2)', border: '#00ffff', text: '#00ffff' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${color.bg};
            border: 2px solid ${color.border};
            color: ${color.text};
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10001;
            font-size: 14px;
            box-shadow: 0 0 20px ${color.bg};
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        // アニメーション定義
        if (!document.querySelector('#audio-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'audio-notification-styles';
            style.textContent = `
                @keyframes slideInFromRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutToRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 3秒後に自動削除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutToRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    /**
     * 設定をリセット
     */
    async resetSettings() {
        try {
            const confirm = window.confirm(this.localizationManager.getText('audio.settings.confirmReset'));
            if (!confirm) return;
            
            // デフォルト値に戻す
            await this.configManager.set('audio.volumes.master', 1.0);
            await this.configManager.set('audio.volumes.bgm', 0.7);
            await this.configManager.set('audio.volumes.sfx', 0.8);
            await this.configManager.set('audio.volumes.muted', false);
            await this.configManager.set('audio.effects.reverb', true);
            await this.configManager.set('audio.effects.compression', true);
            
            // AudioManagerの設定を同期
            this.audioManager.syncWithConfig();
            
            // UIを再描画
            this.showTab(this.activeTab);
            
            // 成功音を再生
            this.audioManager.playSound('success', { volume: 0.5 });
            
            console.log('Audio settings reset to defaults');
        } catch (error) {
            this.errorHandler.handleError(error, 'UI_ERROR', {
                component: 'AudioSettingsUI',
                operation: 'resetSettings'
            });
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    setupConfigWatchers() {
        // 音量変更の監視
        const volumeWatchers = ['master', 'bgm', 'sfx'].map(type => {
            return this.configManager.watch('audio', `volumes.${type}`, (newValue) => {
                const slider = this.sliders.get(`${type}-volume`);
                if (slider && slider.value !== Math.round(newValue * 100)) {
                    slider.value = Math.round(newValue * 100);
                    slider.dispatchEvent(new Event('input'));
                }
            });
        });
        volumeWatchers.forEach(w => w && this.configWatchers.add(w));
        
        // ミュート状態の監視
        const muteWatcher = this.configManager.watch('audio', 'volumes.muted', (newValue) => {
            const muteCheckbox = document.getElementById('mute-all');
            if (muteCheckbox && muteCheckbox.checked !== newValue) {
                muteCheckbox.checked = newValue;
                muteCheckbox.dispatchEvent(new Event('change'));
            }
        });
        if (muteWatcher) this.configWatchers.add(muteWatcher);
    }
    
    /**
     * 音響設定UIを開く
     */
    open() {
        if (this.isOpen) return;
        
        this.container.style.display = 'block';
        this.isOpen = true;
        
        // 開くアニメーション
        this.container.style.opacity = '0';
        this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        requestAnimationFrame(() => {
            this.container.style.transition = 'all 0.3s ease';
            this.container.style.opacity = '1';
            this.container.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // UIサウンド
        this.audioManager.playUISound('open', { volume: 0.3 });
        
        // エスケープキーで閉じる
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }
    
    /**
     * 音響設定UIを閉じる
     */
    close() {
        if (!this.isOpen) return;
        
        // 閉じるアニメーション
        this.container.style.opacity = '0';
        this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        setTimeout(() => {
            this.container.style.display = 'none';
            this.isOpen = false;
        }, 300);
        
        // UIサウンド
        this.audioManager.playUISound('close', { volume: 0.3 });
        
        // イベントリスナーを削除
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }
    
    /**
     * 音響設定UIの表示を切り替え
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        // タイムアウトをクリア
        this.previewTimeouts.forEach(timeout => clearTimeout(timeout));
        this.previewTimeouts.clear();
        
        // 設定監視を解除
        this.configWatchers.forEach(watchId => {
            this.configManager.unwatch(watchId);
        });
        this.configWatchers.clear();
        
        // イベントリスナーを削除
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
        
        // DOM要素を削除
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // 音響テストパネルを破棄
        if (this.audioTestPanel) {
            this.audioTestPanel.dispose();
            this.audioTestPanel = null;
        }
        
        this.container = null;
        this.sliders.clear();
        this.eventListeners.clear();
    }
}