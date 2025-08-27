import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getLocalizationManager } from '../../core/LocalizationManager.js';

/**
 * Audio Settings UI Component Factory
 * オーディオ設定UIコンポーネントファクトリー - UI要素作成、イベント処理
 */
export class AudioSettingsUIComponentFactory {
    constructor(audioManager, configManager) {
        this.audioManager = audioManager;
        this.configManager = configManager;
        this.localizationManager = getLocalizationManager();
        this.errorHandler = getErrorHandler();
        
        // スライダー管理
        this.sliders = new Map();
        
        // プレビュー音源
        this.previewTimeouts = new Map();
        
        // 設定値保存コールバック
        this.onSettingsChange = null;
    }
    
    /**
     * 設定変更コールバックを設定
     */
    setSettingsChangeCallback(callback) {
        this.onSettingsChange = callback;
    }
    
    /**
     * 音量スライダーを作成
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
            this._showSaveStatus();
            
            // プレビュー音を予約
            this._schedulePreview(options);
        });
        
        previewButton.addEventListener('click', () => {
            this._playPreviewSound(options);
            
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
        const switchContainer = this._createToggleSwitch(options);
        
        toggleGroup.addEventListener('mouseenter', () => {
            toggleGroup.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        toggleGroup.addEventListener('mouseleave', () => {
            toggleGroup.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        });
        
        toggleGroup.appendChild(label);
        toggleGroup.appendChild(switchContainer);
        
        container.appendChild(toggleGroup);
    }
    
    /**
     * ラジオグループを作成
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
            const optionLabel = this._createRadioOption(option, options);
            optionsContainer.appendChild(optionLabel);
        });
        
        radioGroup.appendChild(optionsContainer);
        container.appendChild(radioGroup);
    }
    
    /**
     * ドロップダウンを作成
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
        const select = this._createSelectElement(options);
        
        dropdownGroup.appendChild(select);
        container.appendChild(dropdownGroup);
    }
    
    /**
     * 垂直スライダーを作成（イコライザー用）
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
        const slider = this._createVerticalSliderElement(options, valueDisplay);
        
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
     * 音量スライダーを更新
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
     * トグルスイッチを作成
     * @private
     */
    _createToggleSwitch(options) {
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
            this._showSaveStatus();
        });
        
        switchContainer.appendChild(checkbox);
        switchContainer.appendChild(switchLabel);
        
        return switchContainer;
    }
    
    /**
     * ラジオオプションを作成
     * @private
     */
    _createRadioOption(option, parentOptions) {
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
        radio.name = parentOptions.id;
        radio.value = option.value;
        radio.checked = option.value === parentOptions.defaultValue;
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
            if (e.target.checked && parentOptions.onChange) {
                parentOptions.onChange(e.target.value);
                this.audioManager.playUISound('select', { volume: 0.3 });
                this._showSaveStatus();
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
        
        return optionLabel;
    }
    
    /**
     * セレクト要素を作成
     * @private
     */
    _createSelectElement(options) {
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
                this._showSaveStatus();
            }
        });
        
        select.addEventListener('focus', () => {
            select.style.borderColor = '#00ffff';
        });
        
        select.addEventListener('blur', () => {
            select.style.borderColor = '#333333';
        });
        
        return select;
    }
    
    /**
     * 垂直スライダー要素を作成
     * @private
     */
    _createVerticalSliderElement(options, valueDisplay) {
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
        
        // スライダースタイル追加
        this._addVerticalSliderStyles(options.id);
        
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
        
        return slider;
    }
    
    /**
     * 垂直スライダースタイルを追加
     * @private
     */
    _addVerticalSliderStyles(sliderId) {
        const style = document.createElement('style');
        style.textContent = `
            #${sliderId}::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: #00ffff;
                cursor: pointer;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
            #${sliderId}::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #00ffff;
                cursor: pointer;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * プレビュー音を予約
     * @private
     */
    _schedulePreview(options) {
        // 既存のタイムアウトをクリア
        if (this.previewTimeouts.has(options.id)) {
            clearTimeout(this.previewTimeouts.get(options.id));
        }
        
        // 新しいタイムアウトを設定
        const timeout = setTimeout(() => {
            this._playPreviewSound(options);
            this.previewTimeouts.delete(options.id);
        }, 500);
        
        this.previewTimeouts.set(options.id, timeout);
    }
    
    /**
     * プレビュー音を再生
     * @private
     */
    _playPreviewSound(options) {
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
    _showSaveStatus() {
        if (this.onSettingsChange) {
            this.onSettingsChange();
        }
    }
    
    /**
     * クリーンアップ
     */
    dispose() {
        // タイムアウトをクリア
        this.previewTimeouts.forEach(timeout => clearTimeout(timeout));
        this.previewTimeouts.clear();
        
        // スライダー管理をクリア
        this.sliders.clear();
    }
}