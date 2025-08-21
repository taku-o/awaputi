import { getLocalizationManager } from '../../core/LocalizationManager.js';''
import { getErrorHandler } from '../../utils/ErrorHandler.js';''
import type { AudioManager } from '../../audio/AudioManager.js';''
import type { ConfigurationManager } from '../../core/ConfigurationManager.js';''
import type { LocalizationManager } from '../../core/LocalizationManager.js';''
import type { ErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * UI Component Factory interface
 */
interface UIComponentFactory { createVolumeSlider(container: HTMLElement, options: VolumeSliderOptions): void,
    createToggleOption(container: HTMLElement, options: ToggleOptionOptions): void,
    createRadioGroup(container: HTMLElement, options: RadioGroupOptions): void,
    createDropdown(container: HTMLElement, options: DropdownOptions): void,
    createVerticalSlider(container: HTMLElement, options: VerticalSliderOptions): void,
    updateVolumeSliders(enabled: boolean): void, }

/**
 * Audio Test Panel interface
 */'
interface AudioTestPanel { ''
    open(container: HTMLElement): void, }

/**
 * Volume Slider Options
 */
interface VolumeSliderOptions { id: string,
    label: string,
    icon: string,
    category: 'master' | 'bgm' | 'sfx';
    defaultValue: number;
    previewSound: string | null ,}

/**
 * Toggle Option Options
 */
interface ToggleOptionOptions { id: string;
    label: string;
    icon: string;
    defaultValue: boolean;
    onChange: (value: boolean) => void }
}

/**
 * Radio Group Options
 */
interface RadioGroupOptions { id: string;
    label: string;
    icon: string, }
    options: Array<{ value: string; label: string }>,
    defaultValue: string;
    onChange: (value: string) => void;
}

/**
 * Dropdown Options
 */
interface DropdownOptions { id: string,
    label: string;
    icon: string, }
    options: Array<{ value: number | string; label: string }>,
    defaultValue: number | string;
    onChange: (value: string) => void;
}

/**
 * Vertical Slider Options
 */
interface VerticalSliderOptions { id: string,
    label: string;
    icon: string;
    min: number;
    max: number;
    defaultValue: number,
    unit: string,
    onChange: (value: number') => void ,}'
}

/**
 * Quality preset type'
 */''
type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Audio Settings Tab Renderers
 * オーディオ設定タブ描画器 - 各タブのコンテンツ描画処理
 */
export class AudioSettingsTabRenderers {
    private audioManager: AudioManager;
    private configManager: ConfigurationManager;
    private uiComponentFactory: UIComponentFactory;
    private audioTestPanel: AudioTestPanel;
    private localizationManager: LocalizationManager;
    private errorHandler: ErrorHandler;
    constructor(audioManager: AudioManager, configManager: ConfigurationManager, uiComponentFactory: UIComponentFactory, audioTestPanel: AudioTestPanel) {

        this.audioManager = audioManager;
        this.configManager = configManager;
        this.uiComponentFactory = uiComponentFactory;
        this.audioTestPanel = audioTestPanel;
        this.localizationManager = getLocalizationManager();

    ,}
        this.errorHandler = getErrorHandler(); }
    }
    
    /**
     * 音量タブを描画'
     */''
    renderVolumeTab(container: HTMLElement): void { // 音量設定セクション
        const volumeSection = document.createElement('div'');''
        volumeSection.className = 'settings-section';''
        volumeSection.style.marginBottom = '30px';
        
        // マスター音量
        this.uiComponentFactory.createVolumeSlider(volumeSection, {''
            id: 'master-volume',
            label: 'audio.settings.volume.master',)';
            icon: '🎵',')';
            category: 'master''),
            defaultValue: this.audioManager.getVolume('master''),
            previewSound: 'success'' ,}

        }');
        // BGM音量
        this.uiComponentFactory.createVolumeSlider(volumeSection, { ''
            id: 'bgm-volume',
            label: 'audio.settings.volume.bgm',)';
            icon: '🎼',')';
            category: 'bgm''),
            defaultValue: this.audioManager.getVolume('bgm),
            previewSound: null' ,}'

        }');
        // 効果音音量
        this.uiComponentFactory.createVolumeSlider(volumeSection, { ''
            id: 'sfx-volume',
            label: 'audio.settings.volume.sfx',)';
            icon: '🔔',')';
            category: 'sfx''),
            defaultValue: this.audioManager.getVolume('sfx''),
            previewSound: 'pop' ,});
        container.appendChild(volumeSection);
        ';
        // ミュート設定
        const muteSection = document.createElement('div'');''
        muteSection.className = 'settings-section';''
        muteSection.style.marginTop = '30px';
        ';

        this.uiComponentFactory.createToggleOption(muteSection, { ''
            id: 'mute-all',)';
            label: 'audio.settings.volume.muteAll',')';
            icon: '🔇');
            defaultValue: (this.audioManager, as any).isMuted || false;
            onChange: (value) => { 
                (this.audioManager, as any).setMuted? .(value), }
                this.uiComponentFactory.updateVolumeSliders(!value); }
});
        
        container.appendChild(muteSection);
    }
    
    /**
     * 品質タブを描画'
     */ : undefined''
    renderQualityTab(container: HTMLElement): void { ''
        const qualitySection = document.createElement('div'');''
        qualitySection.className = 'settings-section';
        
        // 音質プリセット
        const presets = [' }'

            { value: 'low', label: 'audio.settings.quality.low' ,},''
            { value: 'medium', label: 'audio.settings.quality.medium' ,},''
            { value: 'high', label: 'audio.settings.quality.high' ,},]'
            { value: 'ultra', label: 'audio.settings.quality.ultra' ,}]
        ];
        ';

        this.uiComponentFactory.createRadioGroup(qualitySection, { ''
            id: 'quality-preset',
            label: 'audio.settings.quality.preset',)';
            icon: '🎚️')';
            options: presets,')';
            defaultValue: 'high');
            onChange: (value) => {  ,}
                this._applyQualityPreset(value), }

            }''
        }');
        ';
        // 詳細設定
        const advancedSection = document.createElement('div'');''
        advancedSection.className = 'settings-subsection';''
        advancedSection.style.marginTop = '30px';

        const advancedTitle = document.createElement('h3'');''
        advancedTitle.textContent = this.localizationManager.getText('audio.settings.quality.advanced);
        advancedTitle.style.cssText = `;
            color: #00ffff;
            font-size: 18px,
            margin-bottom: 15px,
        `;''
        advancedSection.appendChild(advancedTitle);
        
        // サンプルレート
        this.uiComponentFactory.createDropdown(advancedSection, { ''
            id: 'sample-rate',
            label: 'audio.settings.quality.sampleRate',)';
            icon: '📊')';
            options: [' ,}'

                { value: 22050, label: '22.05 kHz' ,},')'
                { value: 44100, label: '44.1 kHz' ,}')]'
                { value: 48000, label: '48 kHz' )]
            ],
            defaultValue: 44100;
            onChange: (value) => { ,}
                (this.audioManager, as any).updateQualitySettings?.({ sampleRate: parseInt(value });
            }''
        }');
        
        // バッファサイズ
        this.uiComponentFactory.createDropdown(advancedSection, { ''
            id: 'buffer-size',
            label: 'audio.settings.quality.bufferSize',)';
            icon: '💾',')';
            options: [')' ,}

                { value: 256, label: '256(低遅延)' ,},''
                { value: 512, label: '512(バランス)' ,},''
                { value: 1024, label: '1024(高品質)' ,},]'
                { value: 2048, label: '2048(最高品質)' ,}]
            ],
            defaultValue: 512;
            onChange: (value) => {  }
                (this.audioManager, as any).updateQualitySettings?.({ bufferSize: parseInt(value });
            }
        });
        
        qualitySection.appendChild(advancedSection);
        container.appendChild(qualitySection);
    }
    
    /**
     * エフェクトタブを描画'
     */''
    renderEffectsTab(container: HTMLElement): void { ''
        const effectsSection = document.createElement('div'');''
        effectsSection.className = 'settings-section';
        
        // リバーブ効果
        this.uiComponentFactory.createToggleOption(effectsSection, {''
            id: 'reverb-enabled',)';
            label: 'audio.settings.effects.reverb',')';
            icon: '🌊''),
            defaultValue: this.configManager.get('audio.effects.reverb) as boolean,
            onChange: (value) => { ' ,}'

                (this.audioManager, as any').setAudioEffect? .('reverb', value); }

            }''
        }');
        
        // コンプレッサー
        this.uiComponentFactory.createToggleOption(effectsSection, { : undefined''
            id: 'compression-enabled',)';
            label: 'audio.settings.effects.compression',')';
            icon: '🎛️''),
            defaultValue: this.configManager.get('audio.effects.compression) as boolean,
            onChange: (value) => { ' ,}'

                (this.audioManager, as any').setAudioEffect? .('compression', value); }
});
        
        // イコライザー
        if ((this.audioManager, as any).audioController?.equalizer) { const eqSection = this._createEqualizerSection();''
            effectsSection.appendChild(eqSection); }
        
        // 環境音
        this.uiComponentFactory.createToggleOption(effectsSection, { : undefined''
            id: 'environmental-audio',)';
            label: 'audio.settings.effects.environmental',')';
            icon: '🌿''),
            defaultValue: this.configManager.get('audio.effects.environmentalAudio) as boolean;
            onChange: (value) => { 
                if ((this.audioManager, as any).audioController) { ,}
                    (this.audioManager, as any).audioController.enableEnvironmentalAudio? .(value), }
}
        });
        
        container.appendChild(effectsSection);
    }
    
    /**
     * アクセシビリティタブを描画'
     */ : undefined''
    renderAccessibilityTab(container: HTMLElement): void { ''
        const accessibilitySection = document.createElement('div'');''
        accessibilitySection.className = 'settings-section';
        
        // 視覚的フィードバック
        this.uiComponentFactory.createToggleOption(accessibilitySection, {''
            id: 'visual-feedback',)';
            label: 'audio.settings.accessibility.visualFeedback',')';
            icon: '👁️''),
            defaultValue: this.configManager.get('audio.accessibility.visualFeedback) as boolean,
            onChange: (value') => { ' ,}

                this.configManager.set('audio.accessibility.visualFeedback', value); }

            }''
        }');
        
        // 触覚フィードバック
        this.uiComponentFactory.createToggleOption(accessibilitySection, { ''
            id: 'haptic-feedback',)';
            label: 'audio.settings.accessibility.hapticFeedback',')';
            icon: '📳''),
            defaultValue: this.configManager.get('audio.accessibility.hapticFeedback) as boolean,
            onChange: (value') => { ' ,}

                this.configManager.set('audio.accessibility.hapticFeedback', value); }

            }''
        }');
        
        // 字幕
        this.uiComponentFactory.createToggleOption(accessibilitySection, { ''
            id: 'captioning',)';
            label: 'audio.settings.accessibility.captioning',')';
            icon: '📝''),
            defaultValue: this.configManager.get('audio.accessibility.captioning) as boolean,
            onChange: (value') => { ' ,}

                this.configManager.set('audio.accessibility.captioning', value); }

            }''
        }');
        
        // 音響説明
        this.uiComponentFactory.createToggleOption(accessibilitySection, { ''
            id: 'audio-descriptions',)';
            label: 'audio.settings.accessibility.audioDescriptions',')';
            icon: '🗣️''),
            defaultValue: this.configManager.get('audio.accessibility.audioDescriptions) as boolean,
            onChange: (value') => { ' ,}

                this.configManager.set('audio.accessibility.audioDescriptions', value); }
});
        
        container.appendChild(accessibilitySection);
    }
    
    /**
     * テストタブを描画
     */'
    renderTestTab(container: HTMLElement): void { // テストパネルを表示
        this.audioTestPanel.open(container);
        ';
        // テスト説明
        const description = document.createElement('div'');''
        description.className = 'test-description';

        description.style.cssText = `'';
            background-color: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #00ffff,
            padding: 15px;
            margin-bottom: 20px,
            border-radius: 8px,
        `;

        const descTitle = document.createElement('h4'');''
        descTitle.textContent = this.localizationManager.getText('audio.test.description.title);
        descTitle.style.cssText = `;
            color: #00ffff;
            font-size: 16px,
            margin-bottom: 10px,
        `;''
        description.appendChild(descTitle);

        const descText = document.createElement('p'');''
        descText.textContent = this.localizationManager.getText('audio.test.description.text);
        descText.style.cssText = `;
            color: #cccccc;
            font-size: 14px,
            line-height: 1.4,
            margin: 0;
        `;
        description.appendChild(descText);
        
        // テストパネルの前に説明を挿入
        container.insertBefore(description, container.firstChild); }
    
    /**
     * イコライザーセクションを作成
     * @private
     */''
    private _createEqualizerSection()';
        const eqSection = document.createElement('div'');''
        eqSection.className = 'settings-subsection';''
        eqSection.style.marginTop = '30px';

        const eqTitle = document.createElement('h3'');''
        eqTitle.textContent = this.localizationManager.getText('audio.settings.effects.equalizer);
        eqTitle.style.cssText = `;
            color: #00ffff;
            font-size: 18px,
            margin-bottom: 15px,
        `;''
        eqSection.appendChild(eqTitle);
        
        // イコライザーバンド
        const bands = ['';
            { id: 'eq-low', label: '低音', frequency: 80, icon: '🔊' ,},''
            { id: 'eq-low-mid', label: '中低音', frequency: 250, icon: '🔉' ,},''
            { id: 'eq-mid', label: '中音', frequency: 1000, icon: '🔈' ,},''
            { id: 'eq-high-mid', label: '中高音', frequency: 4000, icon: '🔉' ,},]'
            { id: 'eq-high', label: '高音', frequency: 12000, icon: '🔊' ,}]
        ];
        
        bands.forEach(band => {  this.uiComponentFactory.createVerticalSlider(eqSection, {
                id: band.id;
                label: band.label;
                icon: band.icon;
                min: -12);
                max: 12)';
                defaultValue: 0,')';
                unit: 'dB');
                onChange: (value) => {
                    if ((this.audioManager, as any).audioController) { ,}
                        (this.audioManager, as any).audioController.setEqualizerBand? .(band.frequency, value); }
}
            });
        });
        
        return eqSection;
    }
    
    /**
     * 品質プリセットを適用
     * @private
     */ : undefined
    private _applyQualityPreset(preset: QualityPreset): void {
        const presets: Record<QualityPreset, { sampleRate: number; bufferSize: number ,}> = {
            low: { sampleRate: 22050, bufferSize: 1024 ,},
            medium: { sampleRate: 44100, bufferSize: 512 ,},
            high: { sampleRate: 44100, bufferSize: 256 ,},
            ultra: { sampleRate: 48000, bufferSize: 256 ,};
        
        const settings = presets[preset];
        if(settings) {'

            (this.audioManager, as any).updateQualitySettings? .(settings');
            ';
            // UIを更新
            const sampleRateSelect = document.getElementById('sample-rate'') as HTMLSelectElement | null;''
            const bufferSizeSelect = document.getElementById('buffer-size) as HTMLSelectElement | null;

            if (sampleRateSelect) sampleRateSelect.value = settings.sampleRate.toString();

        }

            if (bufferSizeSelect) bufferSizeSelect.value = settings.bufferSize.toString(') }'