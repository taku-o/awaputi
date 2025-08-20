import { getErrorHandler } from '../utils/ErrorHandler.js';''
import { getLocalizationManager } from '../core/LocalizationManager.js';

interface AccessibilityProfile { id: string,
    name: string,
    nameEn: string,
    description: string,
    descriptionEn: string,
    icon: string,
    settings: {
        [key: string]: boolean, }
    };
}

interface GameEngine { sceneManager?: {
        currentScene?: {
            accessibilitySettingsManager?: AccessibilitySettingsManager;
    }
        };
    };
    settingsManager?: SettingsManager;
    emit?: (event: string, data: any) => void;
}

interface AccessibilitySettingsManager { currentProfile?: string;
    applyProfile?: (profileId: string, settings: any) => Promise<void>;
    notifySettingsChanged?: () => void; }
}

interface SettingsManager { get: (key: string) => any,
    set: (key: string, value: any) => void,
    save: () => void }
}
';'
interface ErrorHandler { ''
    handleError: (error: Error, code: string, context?: any') => void }
}

interface LocalizationManager { // Define methods as needed }
}
'';
type StatusType = 'info' | 'success' | 'error';

interface ProfileInfo { id: string,
    name: string,
    description: string,
    icon: string }
}

/**
 * AccessibilityProfileComponent
 * 
 * アクセシビリティプロファイルの切り替えUIコンポーネント
 * Requirements 5.4, 5.7を満たすプロファイル切り替え機能を提供
 * 
 * Features:
 * - 3つのプロファイル (Default, High Contrast, Motor Accessibility)
 * - プロファイル切り替えの即座の反映
 * - 現在のアクティブプロファイルの明確な表示
 * - エラーハンドリングと視覚的フィードバック
 * 
 * @version 1.0.0
 * @since Issue #170 - Task 1.2: Create AccessibilityProfileComponent
 */
export class AccessibilityProfileComponent {
    private gameEngine: GameEngine;
    private errorHandler: ErrorHandler;
    private localizationManager: LocalizationManager;
    private profiles: AccessibilityProfile[];
    private currentProfile: string;
    // DOM要素
    private container: HTMLElement | null;
    private profileDropdown: HTMLButtonElement | null;
    private profileDescription: HTMLElement | null;
    private applyButton: HTMLButtonElement | null;
    private statusIndicator: HTMLElement | null;
    // 状態管理
    private isInitialized: boolean;
    private isApplying: boolean;
    private isDropdownOpen: boolean;
    // AccessibilitySettingsManagerの参照
    private accessibilityManager: AccessibilitySettingsManager | undefined;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();''
        this.localizationManager = getLocalizationManager(''';
                id: 'default','';
                name: 'デフォルト','';
                nameEn: 'Default','';
                description: '標準設定','';
                descriptionEn: 'Standard settings','';
                icon: '🎮',';
                settings: {''
                    'accessibility.highContrast': false,'';
                    'accessibility.reducedMotion': false,'';
                    'accessibility.largeText': false,'';
                    'accessibility.screenReader': false,';
    }
    }'
                    'accessibility.colorBlindSupport': false }
                }
            },'
            { ''
                id: 'highContrast','';
                name: 'ハイコントラスト','';
                nameEn: 'High Contrast','';
                description: '見やすい高コントラスト表示','';
                descriptionEn: 'Enhanced visibility with high contrast','';
                icon: '🔆',';
                settings: {''
                    'accessibility.highContrast': true,'';
                    'accessibility.reducedMotion': false,'';
                    'accessibility.largeText': true,'';
                    'accessibility.screenReader': true,'';
                    'accessibility.colorBlindSupport': true }
                }
            },'
            { ''
                id: 'motorAccessibility','';
                name: 'モビリティ対応','';
                nameEn: 'Motor Accessibility','';
                description: 'モーション削減とナビゲーション支援','';
                descriptionEn: 'Reduced motion and navigation assistance',')';
                icon: '♿')';
                settings: {''
                    'accessibility.highContrast': false,'';
                    'accessibility.reducedMotion': true,'';
                    'accessibility.largeText': true,'';
                    'accessibility.screenReader': false,'';
                    'accessibility.colorBlindSupport': false }
                }
            }
        ];
        ';
        // 現在のプロファイル
        this.currentProfile = 'default';
        
        // DOM要素
        this.container = null;
        this.profileDropdown = null;
        this.profileDescription = null;
        this.applyButton = null;
        this.statusIndicator = null;
        
        // 状態管理
        this.isInitialized = false;
        this.isApplying = false;
        this.isDropdownOpen = false;
        
        // AccessibilitySettingsManagerの参照を取得
        this.accessibilityManager = this.gameEngine.sceneManager? .currentScene?.accessibilitySettingsManager;
        
        // 現在のプロファイルを読み込み
        this.initializeCurrentProfile();
    }
    
    /**
     * 現在のプロファイルを初期化
     */ : undefined
    private initializeCurrentProfile(): void { try {'
            if(this.accessibilityManager') {'
                // AccessibilitySettingsManagerから現在のプロファイルを取得
            }'
                this.currentProfile = this.accessibilityManager.currentProfile || 'default';' }'
            } else if (this.gameEngine.settingsManager') { // SettingsManagerから現在のプロファイルを取得
                this.currentProfile = this.gameEngine.settingsManager.get('accessibility.profile'') || 'default'; }
            }'
            '';
            console.log('[AccessibilityProfileComponent] Initialized with profile:', this.currentProfile);''
        } catch (error) { ''
            this.errorHandler.handleError(error as Error, 'ACCESSIBILITY_PROFILE_INIT_ERROR', {')'
                operation: 'initializeCurrentProfile'),' }'
            }');''
            this.currentProfile = 'default';
        }
    }
    
    /**
     * コンポーネントを初期化
     * @param parentElement - 親要素
     * @returns 作成されたコンテナ要素
     */'
    initialize(parentElement?: HTMLElement): HTMLElement | null { try {'
            if(this.isInitialized') {'
                '';
                console.warn('[AccessibilityProfileComponent] Already initialized');
            }
                return this.container; }
            }
            
            this.createElements();
            this.setupEventListeners();
            this.updateUI();
            
            if(parentElement && this.container) {
            ';'
                ';'
            }'
                parentElement.appendChild(this.container'); }
            }
            ';'
            this.isInitialized = true;''
            console.log('[AccessibilityProfileComponent] Component initialized');
            ';'
            return this.container;''
        } catch (error) { ''
            this.errorHandler.handleError(error as Error, 'ACCESSIBILITY_PROFILE_INIT_ERROR', {')'
                operation: 'initialize') }
            });
            return null;
        }
    }
    
    /**
     * DOM要素を作成'
     */''
    private createElements()';
        this.container = document.createElement('div'');''
        this.container.className = 'accessibility-profile-component';''
        this.container.setAttribute('role', 'group'');''
        this.container.setAttribute('aria-label', 'アクセシビリティプロファイル選択'');
        ';
        // タイトル
        const title = document.createElement('h3'');''
        title.textContent = 'アクセシビリティプロファイル';''
        title.className = 'profile-title';''
        this.container.appendChild(title');
        ';
        // プロファイル選択エリア
        const selectionArea = document.createElement('div'');''
        selectionArea.className = 'profile-selection-area';
        ';
        // ドロップダウンボタン
        this.profileDropdown = document.createElement('button'');''
        this.profileDropdown.className = 'profile-dropdown-button';''
        this.profileDropdown.setAttribute('type', 'button'');''
        this.profileDropdown.setAttribute('aria-haspopup', 'listbox'');''
        this.profileDropdown.setAttribute('aria-expanded', 'false'');''
        this.profileDropdown.setAttribute('aria-label', 'プロファイルを選択'');
        ';
        // ドロップダウンの内容
        const dropdownContent = document.createElement('div'');''
        dropdownContent.className = 'dropdown-content';'
        '';
        const currentProfileIcon = document.createElement('span'');''
        currentProfileIcon.className = 'profile-icon';''
        dropdownContent.appendChild(currentProfileIcon');'
        '';
        const currentProfileName = document.createElement('span'');''
        currentProfileName.className = 'profile-name';''
        dropdownContent.appendChild(currentProfileName');'
        '';
        const dropdownArrow = document.createElement('span'');''
        dropdownArrow.className = 'dropdown-arrow';''
        dropdownArrow.textContent = '▼';
        dropdownContent.appendChild(dropdownArrow);'
        '';
        this.profileDropdown.appendChild(dropdownContent');
        ';
        // ドロップダウンオプション
        const dropdownOptions = document.createElement('div'');''
        dropdownOptions.className = 'dropdown-options';''
        dropdownOptions.setAttribute('role', 'listbox'');''
        dropdownOptions.style.display = 'none';
        ';
        // 各プロファイルオプションを作成
        this.profiles.forEach((profile, index') => {  ''
            const option = document.createElement('div'');''
            option.className = 'dropdown-option';''
            option.setAttribute('role', 'option'');''
            option.setAttribute('data-profile-id', profile.id');' }'
            option.setAttribute('tabindex', '0'');' }'
            option.setAttribute('aria-label', `${profile.name} - ${ profile.description)`');'
            '';
            const optionIcon = document.createElement('span'');''
            optionIcon.className = 'option-icon';
            optionIcon.textContent = profile.icon;'
            '';
            const optionContent = document.createElement('div'');''
            optionContent.className = 'option-content';'
            '';
            const optionName = document.createElement('div'');''
            optionName.className = 'option-name';
            optionName.textContent = profile.name;'
            '';
            const optionDescription = document.createElement('div'');''
            optionDescription.className = 'option-description';
            optionDescription.textContent = profile.description;
            
            optionContent.appendChild(optionName);
            optionContent.appendChild(optionDescription);
            
            option.appendChild(optionIcon);
            option.appendChild(optionContent);
             }
            dropdownOptions.appendChild(option});
        });
        
        selectionArea.appendChild(this.profileDropdown);'
        selectionArea.appendChild(dropdownOptions);''
        this.container.appendChild(selectionArea');
        ';
        // プロファイル説明
        this.profileDescription = document.createElement('div'');''
        this.profileDescription.className = 'profile-description';''
        this.profileDescription.setAttribute('aria-live', 'polite');''
        this.container.appendChild(this.profileDescription');
        ';
        // 適用ボタン
        this.applyButton = document.createElement('button'');''
        this.applyButton.className = 'profile-apply-button';''
        this.applyButton.textContent = 'プロファイルを適用';''
        this.applyButton.setAttribute('type', 'button');'
        this.applyButton.disabled = true; // 初期状態では無効
        this.container.appendChild(this.applyButton);
        ';
        // ステータスインジケーター
        this.statusIndicator = document.createElement('div'');''
        this.statusIndicator.className = 'profile-status-indicator';''
        this.statusIndicator.setAttribute('aria-live', 'polite'');''
        this.statusIndicator.setAttribute('aria-atomic', 'true');
        this.container.appendChild(this.statusIndicator);
        
        // CSS スタイル
        this.addStyles();
    }
    
    /**
     * CSSスタイルを追加
     */''
    private addStyles()';
        if (document.getElementById('accessibility-profile-component-styles')') { return; // 既に追加済み }
        }
        '';
        const style = document.createElement('style'');''
        style.id = 'accessibility-profile-component-styles';
        style.textContent = `';
            .accessibility-profile-component { ''
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #ffffff,
                border: 2px solid #e0e0e0,
                border-radius: 8px,
                padding: 16px,
                margin: 8px 0,
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) }
            }
            
            .profile-title { margin: 0 0 12px 0,
                font-size: 16px,
                font-weight: 600,
                color: #333 }
            }
            
            .profile-selection-area { position: relative,
                margin-bottom: 12px, }
            }
            
            .profile-dropdown-button { width: 100%,
                padding: 12px 16px,
                border: 2px solid #ccc,
                border-radius: 6px,
                background: #fff,
                cursor: pointer,
                font-size: 14px,
                transition: all 0.2s ease }
            }
            
            .profile-dropdown-button:hover { border-color: #007bff,
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) }
            }
            
            .profile-dropdown-button:focus { outline: none,'
                border-color: #007bff,'';
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25') }
            }
            
            .dropdown-content { display: flex,
                align-items: center,
                justify-content: space-between, }
            }
            
            .profile-icon { font-size: 18px,
                margin-right: 8px, }
            }
            
            .profile-name { flex: 1,
                text-align: left, }
            }
            
            .dropdown-arrow { font-size: 12px,
                color: #666,
                transition: transform 0.2s ease }
            }'
            '';
            .profile-dropdown-button[aria-expanded="true"] .dropdown-arrow { transform: rotate(180deg) }
            }
            
            .dropdown-options { position: absolute,
                top: 100%,
                left: 0,
                right: 0,
                background: #fff,
                border: 2px solid #007bff,";
                border-radius: 6px,"";
                box-shadow: 0 4px 8px rgba(0,0,0,0.15");
                z-index: 1000,
                max-height: 200px,
                overflow-y: auto, }
            }
            
            .dropdown-option { display: flex,
                align-items: center,
                padding: 12px 16px,
                cursor: pointer,
                border-bottom: 1px solid #f0f0f0,
                transition: background-color 0.2s ease }
            }
            
            .dropdown-option:last-child { border-bottom: none, }
            }
            
            .dropdown-option:hover,
            .dropdown-option:focus { background: #f8f9fa,
                outline: none }
            }"
            "";
            .dropdown-option[aria-selected="true"] { background: #e3f2fd,
                border-left: 4px solid #007bff, }
            }
            
            .option-icon { font-size: 16px,
                margin-right: 12px,
                min-width: 20px, }
            }
            
            .option-content { flex: 1 }
            }
            
            .option-name { font-weight: 500,
                color: #333,
                margin-bottom: 2px, }
            }
            
            .option-description { font-size: 12px,
                color: #666 }
            }
            
            .profile-description { background: #f8f9fa,
                border: 1px solid #e9ecef,
                border-radius: 4px,
                padding: 12px,
                margin-bottom: 12px,
                font-size: 14px,
                color: #495057 }
            }
            
            .profile-apply-button { width: 100%,
                padding: 12px 16px,
                background: #28a745,
                color: #fff,
                border: none,
                border-radius: 6px,
                font-size: 14px,
                font-weight: 500,
                cursor: pointer,
                transition: all 0.2s ease }
            }
            
            .profile-apply-button:hover:not(:disabled) { background: #218838,
                transform: translateY(-1px),
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) }
            }
            
            .profile-apply-button:focus { outline: none,
                box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.25) }
            }
            
            .profile-apply-button:disabled { background: #6c757d,
                cursor: not-allowed,
                opacity: 0.6 }
            }
            
            .profile-status-indicator { margin-top: 8px,
                padding: 8px 12px,
                border-radius: 4px,
                font-size: 13px,
                text-align: center,
                transition: all 0.3s ease }
            }
            
            .profile-status-indicator.success { background: #d4edda,
                color: #155724,
                border: 1px solid #c3e6cb }
            }
            
            .profile-status-indicator.error { background: #f8d7da,
                color: #721c24,
                border: 1px solid #f5c6cb }
            }
            
            .profile-status-indicator.info { background: #d1ecf1,
                color: #0c5460,
                border: 1px solid #bee5eb }
            }
            
            /* アクセシビリティ向上 */
            @media (prefers-reduced-motion: reduce) { .accessibility-profile-component *,
                .accessibility-profile-component *::before,
                .accessibility-profile-component *::after {
                    animation-duration: 0.01ms !important,
                    animation-iteration-count: 1 !important,
                    transition-duration: 0.01ms !important, }
                }
            }
            
            /* ハイコントラストモード */
            @media (prefers-contrast: high) { .accessibility-profile-component {
                    border-color: #000,
                    background: #fff }
                }
                
                .profile-dropdown-button { border-color: #000, }
                }
                
                .dropdown-options { border-color: #000, }
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * イベントリスナーを設定
     */"
    private setupEventListeners(): void { ""
        if (!this.container || !this.profileDropdown || !this.applyButton") return;
";
        // ドロップダウンボタンのクリック""
        this.profileDropdown.addEventListener('click', this.handleDropdownToggle.bind(this)');
        ';
        // ドロップダウンオプションのクリック
        const dropdownOptions = this.container.querySelector('.dropdown-options');''
        if(dropdownOptions') {'
            ';'
        }'
            dropdownOptions.addEventListener('click', this.handleProfileSelect.bind(this)'); }
        }
        ';
        // 適用ボタンのクリック
        this.applyButton.addEventListener('click', this.handleApplyProfile.bind(this)');
        ';
        // キーボードナビゲーション
        this.container.addEventListener('keydown', this.handleKeydown.bind(this)');
        ';
        // ドロップダウン外クリックで閉じる
        document.addEventListener('click', this.handleDropdownClose.bind(this);
    }
    
    /**
     * ドロップダウンの開閉を処理
     */'
    private handleDropdownToggle(): void { ''
        if (!this.container || !this.profileDropdown') return;
';'
        this.isDropdownOpen = !this.isDropdownOpen;''
        const dropdownOptions = this.container.querySelector('.dropdown-options') as HTMLElement;'
        '';
        if(this.isDropdownOpen && dropdownOptions') {'
            '';
            dropdownOptions.style.display = 'block';''
            this.profileDropdown.setAttribute('aria-expanded', 'true'');
            ';
            // 現在のプロファイルにフォーカス
            const currentOption = dropdownOptions.querySelector(`[data-profile-id="${this.currentProfile")"]`) as HTMLElement;
        }
            if (currentOption) { }
                currentOption.focus(});"
            }""
        } else if (dropdownOptions") { ""
            dropdownOptions.style.display = 'none';''
            this.profileDropdown.setAttribute('aria-expanded', 'false'); }
        }
    }
    
    /**
     * ドロップダウン外クリックで閉じる
     */
    private handleDropdownClose(event: Event): void { const target = event.target as Node;
        if (this.container && !this.container.contains(target) && this.isDropdownOpen) {
            this.handleDropdownToggle(); }
        }
    }
    
    /**
     * プロファイル選択を処理'
     */''
    private handleProfileSelect(event: Event'): void { const target = event.target as HTMLElement;''
        const option = target.closest('.dropdown-option') as HTMLElement;''
        if (!option') return;'
        '';
        const profileId = option.getAttribute('data-profile-id');
        if(profileId && profileId !== this.currentProfile) {
            
        }
            this.selectProfile(profileId); }
        }
        
        this.handleDropdownToggle(); // ドロップダウンを閉じる
    }
    
    /**
     * プロファイルを選択
     */
    private selectProfile(profileId: string): void { const profile = this.profiles.find(p => p.id === profileId);''
        if(!profile') {'
            '';
            this.showStatus('プロファイルが見つかりません', 'error');
        }
            return; }
        }
        
        this.currentProfile = profileId;
        this.updateUI();
        if (this.applyButton) { this.applyButton.disabled = false; }
        }
        ';
        // ステータス表示
        this.showStatus(`${ profile.name')を選択しました。適用ボタンを押してください。`, 'info'');'
        ' }'
        console.log('[AccessibilityProfileComponent] Profile selected:', profileId});
    }
    
    /**
     * プロファイルを適用
     */'
    private async handleApplyProfile(): Promise<void> { ''
        if (this.isApplying || !this.applyButton') return;
        
        try {
            this.isApplying = true;'
            this.applyButton.disabled = true;''
            this.showStatus('プロファイルを適用中...', 'info');
            ';'
            const profile = this.profiles.find(p => p.id === this.currentProfile);''
            if(!profile') {'
                ';'
            }'
                throw new Error('選択されたプロファイルが見つかりません'); }
            }
            
            // プロファイル設定を適用
            await this.applyProfileSettings(profile);
            ;
            // 成功メッセージ
            this.showStatus(`${ profile.name')が正常に適用されました`, 'success'');'
            ' }'
            console.log('[AccessibilityProfileComponent] Profile applied successfully:', this.currentProfile});'
            '';
        } catch (error) { ''
            this.errorHandler.handleError(error as Error, 'ACCESSIBILITY_PROFILE_APPLY_ERROR', {)'
                profileId: this.currentProfile),' }'
            }');''
            this.showStatus('プロファイルの適用に失敗しました', 'error');
            if (this.applyButton) { this.applyButton.disabled = false; }
            }
        } finally { this.isApplying = false;
            
            // 3秒後に適用ボタンを再度有効化
            setTimeout(() => { 
                if (!this.isApplying && this.applyButton) { }
                    this.applyButton.disabled = false; }
                }
            }, 3000);
        }
    }
    
    /**
     * プロファイル設定を適用
     */
    private async applyProfileSettings(profile: AccessibilityProfile): Promise<void> { try {
            // AccessibilitySettingsManagerを通じて設定を適用
            if(this.accessibilityManager && this.accessibilityManager.applyProfile) {
                
            }
                await this.accessibilityManager.applyProfile(profile.id, profile.settings); }
            }
            ;
            // SettingsManagerに保存
            if(this.gameEngine.settingsManager') {'
                '';
                this.gameEngine.settingsManager.set('accessibility.profile', profile.id);
                
                // 各設定項目を個別に保存
                for(const [key, value] of Object.entries(profile.settings) {
            }
                    this.gameEngine.settingsManager.set(key, value); }
                }
                
                this.gameEngine.settingsManager.save();
            }
            
            // 即座にUIに反映
            this.triggerSettingsUpdate();
            '';
        } catch (error) { ''
            console.error('[AccessibilityProfileComponent] Error applying profile settings:', error);
            throw error; }
        }
    }
    
    /**
     * 設定更新をトリガー
     */
    private triggerSettingsUpdate(): void { try {
            // AccessibilityManagerがある場合は更新を通知
            if(this.accessibilityManager && this.accessibilityManager.notifySettingsChanged) {
                
            }
                this.accessibilityManager.notifySettingsChanged(); }
            }
            ;
            // ゲームエンジンにカスタムイベントを送信
            if(this.gameEngine.emit') {'
                '';
                this.gameEngine.emit('accessibilitySettingsChanged', {)'
                    profile: this.currentProfile,')
            }'
                    source: 'AccessibilityProfileComponent'); }
            }
            ';
            // DOMカスタムイベントを発火
            if(this.container') {'
                '';
                const event = new CustomEvent('accessibilityProfileChanged', {
                    detail: {)
                        profileId: this.currentProfile)
            }
                        timestamp: Date.now(); }
                    },
                    bubbles: true;
                }),'
                this.container.dispatchEvent(event);''
            } catch (error) { ''
            console.warn('[AccessibilityProfileComponent] Error triggering settings update:', error) }
        }
    }
    
    /**
     * UIを更新
     */
    private updateUI(): void { try {
            const profile = this.profiles.find(p => p.id === this.currentProfile);''
            if (!profile || !this.container || !this.profileDropdown') return;
            ';
            // ドロップダウンボタンの更新
            const profileIcon = this.profileDropdown.querySelector('.profile-icon'');''
            const profileName = this.profileDropdown.querySelector('.profile-name');
            
            if (profileIcon) profileIcon.textContent = profile.icon;
            if (profileName) profileName.textContent = profile.name;
            ';
            // 説明の更新
            if(this.profileDescription') {
                
            }
                this.profileDescription.textContent = profile.description; }
            }
            ';
            // ドロップダウンオプションの選択状態更新
            const options = this.container.querySelectorAll('.dropdown-option');''
            options.forEach(option => {  ');''
                const profileId = option.getAttribute('data-profile-id');''
                if (profileId === this.currentProfile') {' }'
                    option.setAttribute('aria-selected', 'true''); }'
                } else {  ' }'
                    option.removeAttribute('aria-selected'); }
                }
            });'
            '';
        } catch (error) { ''
            console.error('[AccessibilityProfileComponent] Error updating UI:', error') }
        }
    }
    
    /**
     * ステータスメッセージを表示'
     */''
    private showStatus(message: string, type: StatusType = 'info'): void { if (!this.statusIndicator) return;
        
        this.statusIndicator.textContent = message; }
        this.statusIndicator.className = `profile-status-indicator ${type}`;
        
        // 5秒後にクリア
        setTimeout(() => {  ''
            if(this.statusIndicator') {'
                ';'
            }'
                this.statusIndicator.textContent = '';' }'
                this.statusIndicator.className = 'profile-status-indicator'; }
            }
        }, 5000);
    }
    
    /**
     * キーボードナビゲーションを処理
     */
    private handleKeydown(event: KeyboardEvent): void { if (!this.container) return;'
'';
        if(!this.isDropdownOpen') {'
            // ドロップダウンが閉じている場合
            if (event.key === 'Enter' || event.key === ' ') {
                if (event.target === this.profileDropdown) {
                    event.preventDefault();
        }'
                    this.handleDropdownToggle(); }'
                } else if (event.target === this.applyButton) { event.preventDefault();''
                    this.handleApplyProfile()';
        const options = Array.from(this.container.querySelectorAll('.dropdown-option') as HTMLElement[];
        const currentIndex = options.findIndex(option => option === document.activeElement);'
        '';
        switch(event.key') {'
            '';
            case 'ArrowDown':;
                event.preventDefault();'
                const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;''
                options[nextIndex].focus()';
            case 'ArrowUp':);
                event.preventDefault();'
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;''
                options[prevIndex].focus(''';
            case 'Enter':')';
            case ' ':)';
                event.preventDefault();''
                if (currentIndex >= 0') {''
                    const profileId = options[currentIndex].getAttribute('data-profile-id');
                    if (profileId) {'
                        this.selectProfile(profileId);''
                        this.handleDropdownToggle()';
            case 'Escape':);
                event.preventDefault();
                this.handleDropdownToggle();
                this.profileDropdown? .focus();
        }
                break; }
        }
    }
    
    /**
     * 現在のプロファイルを取得
     */ : undefined
    getCurrentProfile(): string { return this.currentProfile; }
    }
    
    /**
     * プロファイルをプログラムで設定
     */
    setProfile(profileId: string): boolean { const profile = this.profiles.find(p => p.id === profileId);
        if(profile) {
            this.selectProfile(profileId);
        }
            return true; }
        }
        return false;
    }
    
    /**
     * 利用可能なプロファイル一覧を取得
     */
    getAvailableProfiles(): ProfileInfo[] { return this.profiles.map(profile => ({
            id: profile.id);
            name: profile.name);
            description: profile.description,);
            icon: profile.icon))) }
    }
    
    /**
     * コンポーネントを破棄'
     */''
    destroy()';
            document.removeEventListener('click', this.handleDropdownClose.bind(this);
            
            // DOM要素の削除
            if(this.container && this.container.parentNode) {
                ';'
            }'
                this.container.parentNode.removeChild(this.container'); }
            }
            
            // 参照のクリア
            this.container = null;
            this.profileDropdown = null;
            this.profileDescription = null;
            this.applyButton = null;
            this.statusIndicator = null;
            
            this.isInitialized = false;
            '';
            console.log('[AccessibilityProfileComponent] Component destroyed');''
        } catch (error) { ''
            this.errorHandler.handleError(error as Error, 'ACCESSIBILITY_PROFILE_DESTROY_ERROR', {')'
                operation: 'destroy'),' }'
            }');
        }'
    }''
}