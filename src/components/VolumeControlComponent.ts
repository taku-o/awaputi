import { getErrorHandler  } from '../utils/ErrorHandler.js';''
import { getLocalizationManager  } from '../core/LocalizationManager.js';

interface GameEngine { settingsManager?: SettingsManager;
    audioManager?: AudioManager;
    }

interface SettingsManager { get: (ke;y: string) => any,
    set: (ke;y: string, value: any) => void ,}
}

interface AudioManager {
    playUISound: (soundNam;e: string, options?: { volum;e?: number }) => void;
}

interface ErrorHandler { handleError: (erro;r: Error, code: string, context?: any) => void }
}
';

interface LocalizationManager { ''
    getText: (ke;y: string') => string }'
}

interface VolumeStats { isInitialized: boolean;
    currentVolume: number;
    currentVolumePercent: number;
    isAtMinVolume: boolean;
    isAtMaxVolume: boolean;
    isEnabled: boolean;
    hasContainer: boolean;
   , hasButtons: boolean }

type SoundType = 'volume-up' | 'volume-down' | 'volume-adjust' | 'volume-max' | 'volume-min';

/**
 * 音量制御コンポーネント
 * 音量アップ/ダウンボタンと現在音量レベルの視覚的フィードバックを提供
 */
export class VolumeControlComponent {
    private gameEngine: GameEngine;
    private errorHandler: ErrorHandler;
    private localizationManager: LocalizationManager;
    // 音量設定
    private readonly, VOLUME_STEP: number,
    private readonly MIN_VOLUME: number,
    private readonly MAX_VOLUME: number,
    
    // DOM要素
    private container: HTMLElement | null;
    private volumeDownButton: HTMLButtonElement | null;
    private volumeUpButton: HTMLButtonElement | null;
    private volumeDisplay: HTMLElement | null;
    private progressBar: HTMLElement | null;
    private progressFill: HTMLElement | null;
    // 状態管理
    private isInitialized: boolean;
    private, currentVolume: number;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.localizationManager = getLocalizationManager();
        
        // 音量設定
        this.VOLUME_STEP = 0.1; // 10%刻み
        this.MIN_VOLUME = 0; // 最小音量 0%
        this.MAX_VOLUME = 1; // 最大音量 100%
        
        // DOM要素
        this.container = null;
        this.volumeDownButton = null;
        this.volumeUpButton = null;
        this.volumeDisplay = null;
        this.progressBar = null;
        this.progressFill = null;
        
        // 状態管理
        this.isInitialized = false;
        this.currentVolume = 0.5; // デフォルト音量 50%
        
        // 設定マネージャーから現在の音量を取得

    ,}
        this.initializeCurrentVolume(); }
    }
    
    /**
     * 現在の音量を設定マネージャーから初期化
     */
    private initializeCurrentVolume(): void { try {'
            if(this.gameEngine.settingsManager) {', ';

            }

                this.currentVolume = this.gameEngine.settingsManager.get('masterVolume) || 0.5;' }

            } catch (error) { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'initializeCurrentVolume' ,});
            this.currentVolume = 0.5; // フォールバック値
        }
    }
    
    /**
     * コンポーネントを初期化してDOMに追加
     * @param parentContainer - 親コンテナ要素
     * @returns 初期化の成功/失敗
     */
    initialize(parentContainer: HTMLElement): boolean { try {'
            if(this.isInitialized) {'

                console.warn('[VolumeControlComponent] Already, initialized);
            }
                return true;

            if(!parentContainer || !(parentContainer, instanceof HTMLElement)') { ''
                throw new Error('Valid, parent container, is required); }'
            
            this.createVolumeControlUI(parentContainer);

            this.updateVolumeDisplay();''
            this.updateButtonStates()';
            console.log('[VolumeControlComponent] Initialized, successfully);
            return true;

        } catch (error') { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'initialize' ,});
            return false;
    
    /**
     * 音量制御UIを作成
     * @param parentContainer - 親コンテナ'
     */''
    private createVolumeControlUI(parentContainer: HTMLElement): void { // メインコンテナ
        this.container = document.createElement('div'');''
        this.container.className = 'volume-control-component';
        this.container.style.cssText = `;
            display: flex;
            align-items: center,
            gap: 15px,
            padding: 15px,
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px,
            margin-bottom: 15px,
            min-width: 300px,
        `;
        ';
        // ラベル
        const label = document.createElement('span'');''
        label.innerHTML = '🔊 ' + this.localizationManager.getText('settings.audio.masterVolume);
        label.style.cssText = `;
            color: #ffffff;
            font-size: 16px,
            min-width: 100px,
        `;''
        this.container.appendChild(label);
        ';
        // 音量ダウンボタン
        this.volumeDownButton = this.createVolumeButton('down', '🔉', this.handleVolumeDown.bind(this);
        this.container.appendChild(this.volumeDownButton);
        
        // 音量プログレスバー
        this.createVolumeProgressBar();''
        this.container.appendChild(this.progressBar!);
        ';
        // 音量アップボタン
        this.volumeUpButton = this.createVolumeButton('up', '🔊', this.handleVolumeUp.bind(this);''
        this.container.appendChild(this.volumeUpButton);
        ';
        // 音量表示
        this.volumeDisplay = document.createElement('span);
        this.volumeDisplay.style.cssText = `;
            color: #00ffff;
            font-size: 16px,
            font-weight: bold,
            min-width: 45px,
            text-align: center,
        `;
        this.container.appendChild(this.volumeDisplay);

        parentContainer.appendChild(this.container); }
    
    /**'
     * 音量ボタンを作成''
     * @param type - ボタンタイプ ('up' または 'down'')
     * @param icon - ボタンアイコン
     * @param clickHandler - クリックハンドラー
     * @returns 作成されたボタン要素'
     */''
    private createVolumeButton(type: 'up' | 'down', icon: string, clickHandler: () => void'): HTMLButtonElement { ''
        const button = document.createElement('button''); }
        button.className = `volume-${type}-button`;

        button.innerHTML = icon;''
        button.setAttribute('aria-label', ')';
            type === 'up' ? '); : undefined''
            this.localizationManager.getText('settings.audio.volumeUp'') :'';
            this.localizationManager.getText('settings.audio.volumeDown);

        button.style.cssText = `'';
            background-color: rgba(0, 255, 255, 0.2);
            border: 2px solid #00ffff;
            color: #00ffff;
           , padding: 10px 15px;
            border-radius: 8px,
            cursor: pointer;
            font-size: 18px,
            transition: all 0.3s ease;
            min-width: 50px,
            height: 45px;
           , display: flex;
            align-items: center,
            justify-content: center,
        `;
        ';
        // イベントリスナー
        button.addEventListener('click', clickHandler);''
        button.addEventListener('keydown', this.handleButtonKeydown.bind(this));
        ';
        // ホバー効果
        button.addEventListener('mouseenter', () => {  ''
            if(!button.disabled) {', ';

            }

                button.style.backgroundColor = 'rgba(0, 255, 255, 0.4)';' }

                button.style.transform = 'translateY(-1px)'; }

            }''
        }');

        button.addEventListener('mouseleave', () => {  ''
            if(!button.disabled) {', ';

            }

                button.style.backgroundColor = 'rgba(0, 255, 255, 0.2)';' }

                button.style.transform = 'translateY(0)'; }
});
        
        return button;
    }
    
    /**
     * 音量プログレスバーを作成'
     */''
    private createVolumeProgressBar()';
        this.progressBar = document.createElement('div'');''
        this.progressBar.className = 'volume-progress-bar';
        this.progressBar.style.cssText = `;
            flex: 1;
           , height: 8px;
            background-color: #333333,
            border-radius: 4px,
            position: relative;
           , cursor: pointer;
            min-width: 100px,
        `;

        this.progressFill = document.createElement('div'');''
        this.progressFill.className = 'volume-progress-fill';
        this.progressFill.style.cssText = `';
            height: 100%,
            background: linear-gradient(to right, #00ffff, #0099cc);
            border-radius: 4px,
            transition: width 0.3s ease;
           , position: relative;
        `;
        ';
        // プログレスバーのクリックで音量設定
        this.progressBar.addEventListener('click', (event) => { this.handleProgressBarClick(event); });
        
        this.progressBar.appendChild(this.progressFill);
    }
    
    /**
     * プログレスバークリック処理
     * @param event - クリックイベント
     */
    private handleProgressBarClick(event: MouseEvent): void { try {
            if (!this.progressBar) return;
            
            const rect = this.progressBar.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width);

            this.setVolume(percentage);
            ';
            // UI効果音を再生
            this.playUISound('volume-adjust);

            ' }'

        } catch (error) { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'handleProgressBarClick' ,});
        }
    }
    
    /**
     * キーボードイベントハンドラー
     * @param event - キーボードイベント'
     */''
    private handleButtonKeydown(event: KeyboardEvent): void { ''
        if(event.key === 'Enter' || event.key === ', ') {
            event.preventDefault();
        }
            (event.target, as HTMLElement).click(); }
}
    
    /**
     * 音量アップ処理（KeyboardShortcutManagerから移行）'
     */'
    private handleVolumeUp(): void { try {'
            if(this.currentVolume >= this.MAX_VOLUME) {'
                // 最大音量の場合はフィードバック音のみ
                this.playUISound('volume-max);
            }
                return; }
            }
            ';

            const newVolume = Math.min(this.MAX_VOLUME, this.currentVolume + this.VOLUME_STEP);''
            this.setVolume(newVolume);
            ';
            // UI効果音を再生
            this.playUISound('volume-up);
            
            console.log(`[VolumeControlComponent] Volume, up: ${Math.round(newVolume * 100})%`);

        } catch (error) { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'handleVolumeUp',);
                currentVolume: this.currentVolume ,});
        }
    }
    
    /**
     * 音量ダウン処理（KeyboardShortcutManagerから移行）
     */'
    private handleVolumeDown(): void { try {'
            if(this.currentVolume <= this.MIN_VOLUME) {'
                // 最小音量の場合はフィードバック音のみ
                this.playUISound('volume-min);
            }
                return; }
            }
            ';

            const newVolume = Math.max(this.MIN_VOLUME, this.currentVolume - this.VOLUME_STEP);''
            this.setVolume(newVolume);
            ';
            // UI効果音を再生
            this.playUISound('volume-down);
            
            console.log(`[VolumeControlComponent] Volume, down: ${Math.round(newVolume * 100})%`);

        } catch (error) { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'handleVolumeDown',);
                currentVolume: this.currentVolume ,});
        }
    }
    
    /**
     * 音量を設定
     * @param volume - 設定する音量 (0.0 - 1.0)
     */
    setVolume(volume: number): void { try {
            // 値の検証とクランプ
            const clampedVolume = Math.max(this.MIN_VOLUME, Math.min(this.MAX_VOLUME, volume);
            
            // 音量を10%刻みに丸める
            const roundedVolume = Math.round(clampedVolume / this.VOLUME_STEP) * this.VOLUME_STEP;
            
            // 状態を更新
            this.currentVolume = roundedVolume;
            // 設定マネージャーに保存
            if(this.gameEngine.settingsManager) {', ';

            }

                this.gameEngine.settingsManager.set('masterVolume', roundedVolume); }
            }
            
            // UIを更新
            this.updateVolumeDisplay();
            this.updateButtonStates();
            
            console.log(`[VolumeControlComponent] Volume, set to: ${Math.round(roundedVolume * 100})%`);

        } catch (error) { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'setVolume',);
                volume: volume ,});
        }
    }
    
    /**
     * 音量表示を更新
     */
    private updateVolumeDisplay(): void { if (this.volumeDisplay) { }
            this.volumeDisplay.textContent = `${Math.round(this.currentVolume * 100})%`;
        }
        
        if(this.progressFill) {
        
            
        
        }
            this.progressFill.style.width = `${this.currentVolume * 100}%`;
        }
    }
    
    /**
     * ボタンの状態を更新（エッジケース処理）
     */'
    private updateButtonStates(): void { // 音量ダウンボタンの状態
        if(this.volumeDownButton) {
            const isMinVolume = this.currentVolume <= this.MIN_VOLUME;

            this.volumeDownButton.disabled = isMinVolume;''
            this.volumeDownButton.style.opacity = isMinVolume ? '0.5' : '1';

        }

            this.volumeDownButton.style.cursor = isMinVolume ? 'not-allowed' : 'pointer'; }
        }
        ';
        // 音量アップボタンの状態
        if(this.volumeUpButton) {
            const isMaxVolume = this.currentVolume >= this.MAX_VOLUME;

            this.volumeUpButton.disabled = isMaxVolume;''
            this.volumeUpButton.style.opacity = isMaxVolume ? '0.5' : '1';

        }

            this.volumeUpButton.style.cursor = isMaxVolume ? 'not-allowed' : 'pointer'; }
}
    
    /**
     * UI効果音を再生
     * @param soundType - 音の種類
     */'
    private playUISound(soundType: SoundType): void { try {'
            if(this.gameEngine.audioManager) {'

                let soundName = '';
                let volume = 0.3;

                switch(soundType) {''
                    case 'volume-up':'';
                        soundName = 'button-click';

                        break;''
                    case 'volume-down':'';
                        soundName = 'button-click';

                        break;''
                    case 'volume-adjust':'';
                        soundName = 'slider-move';

                        break;''
                    case 'volume-max':'';
                        soundName = 'error';
                        volume = 0.2;

                        break;''
                    case 'volume-min':'';
                        soundName = 'error';
                        volume = 0.2;

                        break;

            }

                    default: soundName = 'button-click'; }
                }
                ';

                this.gameEngine.audioManager.playUISound(soundName, { volume );' }'

            } catch (error) { // UI効果音の失敗は重要ではないので、エラーログのみ
            console.warn('[VolumeControlComponent] Failed to play UI sound:', error }
    }
    
    /**
     * 現在の音量を取得
     * @returns 現在の音量 (0.0 - 1.0)
     */
    getCurrentVolume(): number { return this.currentVolume; }
    
    /**
     * 外部から音量変更を通知
     * @param volume - 新しい音量値
     */
    onVolumeChanged(volume: number): void { this.currentVolume = Math.max(this.MIN_VOLUME, Math.min(this.MAX_VOLUME, volume);
        this.updateVolumeDisplay();
        this.updateButtonStates(); }
    
    /**
     * コンポーネントが有効かどうかを確認
     * @returns 有効性
     */
    isEnabled(): boolean { return this.isInitialized && !!this.container && !!this.container.parentNode; }
    
    /**
     * コンポーネントを表示/非表示
     * @param visible - 表示状態
     */'
    setVisible(visible: boolean): void { ''
        if(this.container) {', ';

        }

            this.container.style.display = visible ? 'flex' : 'none'; }
}
    
    /**
     * アクセシビリティ属性を更新
     */'
    updateAccessibility(): void { try {'
            if(this.volumeUpButton) {', ';

            }

                this.volumeUpButton.setAttribute('aria-disabled', String(this.currentVolume >= this.MAX_VOLUME); }
            }

            if(this.volumeDownButton) {', ';

            }

                this.volumeDownButton.setAttribute('aria-disabled', String(this.currentVolume <= this.MIN_VOLUME); }
            }

            if(this.progressBar) {', ';

            }

                this.progressBar.setAttribute('aria-label'')' }

                    `${this.localizationManager.getText('settings.audio.masterVolume'}): ${Math.round(this.currentVolume * 100})%`'', ');''
                this.progressBar.setAttribute('role', 'slider'');''
                this.progressBar.setAttribute('aria-valuemin', '0'');''
                this.progressBar.setAttribute('aria-valuemax', '100'');''
                this.progressBar.setAttribute('aria-valuenow', String(Math.round(this.currentVolume * 100));''
            } catch (error) { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'updateAccessibility' ,});
        }
    }
    
    /**
     * コンポーネントをクリーンアップ
     */
    dispose(): void { try {
            // DOM要素を削除
            if(this.container && this.container.parentNode) {
                ';

            }

                this.container.parentNode.removeChild(this.container); }
            }
            
            // 参照をクリア
            this.container = null;
            this.volumeDownButton = null;
            this.volumeUpButton = null;
            this.volumeDisplay = null;
            this.progressBar = null;
            this.progressFill = null;
            
            this.isInitialized = false;

            console.log('[VolumeControlComponent] Disposed, successfully);

        } catch (error') { this.errorHandler.handleError(error as Error, 'VOLUME_CONTROL_ERROR', {)'
                operation: 'dispose' ,});
        }
    }
    
    /**
     * 統計情報を取得（デバッグ用）
     * @returns 統計情報
     */
    getStats(): VolumeStats { return { isInitialized: this.isInitialized,
            currentVolume: this.currentVolume;
            currentVolumePercent: Math.round(this.currentVolume * 100);
            isAtMinVolume: this.currentVolume <= this.MIN_VOLUME);
            isAtMaxVolume: this.currentVolume >= this.MAX_VOLUME,);
            isEnabled: this.isEnabled(),
            hasContainer: !!this.container,' };

            hasButtons: !!(this.volumeUpButton && this.volumeDownButton); }
        }''
}