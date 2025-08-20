import { getErrorHandler } from '../utils/ErrorHandler.js';

// 型定義
interface AudioAccessibilityManager { accessibilityManager?: AccessibilityManager;
    }
}

interface AccessibilityManager { gameEngine?: GameEngine;
    }
}

interface GameEngine { audioManager?: AudioManager;
    addEventListener?: (event: string, handler: (event: any) => void) => void }
}

interface AudioManager { playSound?: (soundId: string, options?: PlaySoundOptions) => any;
    playMusic?: (musicId: string, options?: PlayMusicOptions) => any }
}

interface PlaySoundOptions { volume?: number;
    category?: string; }
}

interface PlayMusicOptions { volume?: number;
    loop?: boolean; }
}

interface CaptionConfig { enabled: boolean,
    realTimeCaption: boolean,
    soundEffectDescriptions: boolean,
    musicDescriptions: boolean,
    ambientSoundDescriptions: boolean,
    captionDelay: number,
    maxCaptionLines: number,
    captionDuration: {
        short: number,
        medium: number,
        long: number,
        persistent: number }
    },
    positioning: { default: string,
        alternatives: string[] }
    },
    styling: { fontSize: string,
        fontFamily: string,
        fontWeight: string,
        textColor: string,
        backgroundColor: string,
        borderColor: string,
        borderWidth: string,
        borderRadius: string,
        padding: string,
        margin: string,
        textShadow: string,
        lineHeight: string,
        letterSpacing: string }
    },
    animation: { fadeIn: number,
        fadeOut: number,
        slideIn: boolean,
        bounce: boolean }
    };
}

interface SoundDescription { text: string,
    category: string,
    duration: string }
}

interface MusicDescription { text: string,
    mood: string,
    tempo: string }
}

interface CaptionStats { captionsDisplayed: number,
    captionsByCategory: Map<string, number>;
    averageDisplayTime: number,
    totalDisplayTime: number,
    userInteractions: number,
    sessionStart: number }
}

interface UserPreferences { enabled: boolean,
    position: string,
    fontSize: number,
    fontFamily: string,
    textColor: string,
    backgroundColor: string,
    showSoundEffects: boolean,
    showMusic: boolean,
    showAmbientSounds: boolean,
    autoHide: boolean,
    hideDelay: number,
    customDescriptions: Map<string, string>;
    languagePreference: string,
    verbosityLevel: string }
}

interface LanguageConfig { soundPrefix: string,
    musicPrefix: string,
    categories: {
        game: string,
        ui: string,
        special: string,
        ambient: string }
    };
}

interface CaptionData { element: HTMLElement,
    startTime: number,
    duration: number,
    description: SoundDescription,
    options: any }
}

interface AudioEvent { soundId: string,
    category: string,
    volume: number,
    duration: number }
}

interface GameEvent { bubble?: any;
    count?: number;
    type?: string;
    level?: number;
    score?: number;
    message?: string; }
}

interface AccessibilityEvent extends Event { detail: {
        component: string,
        config: any }
    };
}

interface ManualCaptionOptions { category?: string;
    duration?: string; }
}

interface CaptionReport { timestamp: string,
    configuration: {
        enabled: boolean,
        position: string,
        verbosityLevel: string,
        language: string }
    },
    statistics: CaptionStats & { sessionDuration: number,
        captionsPerMinute: number,
        activeCaptions: number,
        customDescriptions: number }
    },
    userPreferences: UserPreferences,
    performance: { averageDisplayTime: number,
        maxConcurrentCaptions: number }
    };
}

/**
 * キャプション管理クラス
 * 音声コンテンツのリアルタイム字幕表示とカスタマイズ可能なスタイリング
 */
export class CaptionManager {
    private audioAccessibilityManager: AudioAccessibilityManager;
    private accessibilityManager?: AccessibilityManager;
    private gameEngine?: GameEngine;
    private config: CaptionConfig;
    private soundDescriptions: Map<string, SoundDescription>;
    private musicDescriptions: Map<string, MusicDescription>;
    private activeCaptions: Map<number, CaptionData>;
    private captionQueue: any[];
    private captionContainer: HTMLElement | null;
    private maxCaptionId: number;
    private dynamicStyleSheet: HTMLStyleElement | null;
    private currentStyle: string;
    private stats: CaptionStats;
    private userPreferences: UserPreferences;
    private languageSupport: Map<string, LanguageConfig>;
    '';
    constructor(audioAccessibilityManager: AudioAccessibilityManager') {
        this.audioAccessibilityManager = audioAccessibilityManager;
        this.accessibilityManager = audioAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager? .gameEngine;
        
        // キャプション設定
        this.config = { : undefined
            enabled: false,
            realTimeCaption: true,
            soundEffectDescriptions: true,
            musicDescriptions: true,
            ambientSoundDescriptions: false,
            captionDelay: 0, // ミリ秒;
            maxCaptionLines: 3,
            captionDuration: {
                short: 2000,   // 短い音響効果;
                medium: 4000,  // 中程度の音;
                long: 6000,    // 長い音楽やナレーション
    }
    }
                persistent: -1 // 手動で消去するまで表示 }
            },
            positioning: { ''
                default: 'bottom-center','';
                alternatives: ['top-center', 'bottom-left', 'bottom-right', 'center'] }
            },'
            styling: { ''
                fontSize: '16px','';
                fontFamily: 'Arial, sans-serif','';
                fontWeight: 'bold','';
                textColor: '#ffffff','';
                backgroundColor: 'rgba(0, 0, 0, 0.8')','';
                borderColor: '#ffffff','';
                borderWidth: '2px','';
                borderRadius: '8px','';
                padding: '12px 16px','';
                margin: '10px','';
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8')','';
                lineHeight: '1.4','';
                letterSpacing: '0.5px' }
            },
            animation: { fadeIn: 300,
                fadeOut: 300,
                slideIn: true,
                bounce: false }
            }
        },
        
        // 音響効果の説明マッピング
        this.soundDescriptions = new Map<string, SoundDescription>([;
            // ゲーム音響効果']'
            ['bubblePop', { text: '泡がポップする音', category: 'game', duration: 'short' }],''
            ['bubbleBurst', { text: '泡が破裂する音', category: 'game', duration: 'short' }],''
            ['combo', { text: 'コンボ達成音', category: 'game', duration: 'medium' }],''
            ['bonus', { text: 'ボーナス獲得音', category: 'game', duration: 'medium' }],''
            ['powerUp', { text: 'パワーアップ音', category: 'game', duration: 'medium' }],''
            ['levelUp', { text: 'レベルアップ音', category: 'game', duration: 'long' }],''
            ['gameOver', { text: 'ゲームオーバー音', category: 'game', duration: 'long' }],''
            ['victory', { text: '勝利音', category: 'game', duration: 'long' }],
            ';
            // UI音響効果
            ['click', { text: 'クリック音', category: 'ui', duration: 'short' }],''
            ['hover', { text: 'ホバー音', category: 'ui', duration: 'short' }],''
            ['menuOpen', { text: 'メニューオープン音', category: 'ui', duration: 'short' }],''
            ['menuClose', { text: 'メニュークローズ音', category: 'ui', duration: 'short' }],''
            ['notification', { text: '通知音', category: 'ui', duration: 'medium' }],''
            ['warning', { text: '警告音', category: 'ui', duration: 'medium' }],''
            ['error', { text: 'エラー音', category: 'ui', duration: 'medium' }],
            ';
            // 特殊効果音
            ['electric', { text: '電気的な音', category: 'special', duration: 'medium' }],''
            ['explosion', { text: '爆発音', category: 'special', duration: 'medium' }],''
            ['freeze', { text: '凍結音', category: 'special', duration: 'medium' }],''
            ['magnetic', { text: '磁力音', category: 'special', duration: 'medium' }],''
            ['teleport', { text: 'テレポート音', category: 'special', duration: 'medium' }])'
            // 環境音
            ['backgroundMusic', { text: 'BGM再生中', category: 'ambient', duration: 'persistent' }],''
            ['ambientSound', { text: '環境音', category: 'ambient', duration: 'persistent' }],''
            ['wind', { text: '風の音', category: 'ambient', duration: 'long' }],''
            ['water', { text: '水の音', category: 'ambient', duration: 'long' }]''
        ]');
        
        // 音楽説明マッピング
        this.musicDescriptions = new Map<string, MusicDescription>([']';
            ['menuTheme', { text: '♪ メニューテーマ', mood: 'calm', tempo: 'moderate' }],''
            ['gameTheme', { text: '♪ ゲームテーマ', mood: 'energetic', tempo: 'fast' }],''
            ['bossTheme', { text: '♪ ボステーマ', mood: 'tense', tempo: 'fast' }],''
            ['victoryTheme', { text: '♪ 勝利テーマ', mood: 'triumphant', tempo: 'moderate' }],''
            ['gameOverTheme', { text: '♪ ゲームオーバーテーマ', mood: 'sad', tempo: 'slow' }]
        ]);
        ';
        // キャプション表示管理
        this.activeCaptions = new Map(''';
        this.currentStyle = 'default';
        
        // 統計情報)
        this.stats = { captionsDisplayed: 0)
            captionsByCategory: new Map(),
            averageDisplayTime: 0,
            totalDisplayTime: 0,
            userInteractions: 0,'';
            sessionStart: Date.now()';
            position: 'bottom-center')';
            fontSize: 16,'';
            fontFamily: 'Arial','';
            textColor: '#ffffff',')';
            backgroundColor: 'rgba(0, 0, 0, 0.8')',
            showSoundEffects: true,
            showMusic: true,
            showAmbientSounds: false,
            autoHide: true,';
            hideDelay: 4000,'';
            customDescriptions: new Map(''';
            languagePreference: 'ja','';
            verbosityLevel: 'normal' // 'minimal', 'normal', 'detailed' }
        };
        
        // 言語サポート
        this.languageSupport = new Map<string, LanguageConfig>(['';
            ['ja', { ''
                soundPrefix: '♪ ','';
                musicPrefix: '♫ ',';
                categories: {''
                    game: 'ゲーム音','';
                    ui: 'UI音','';
                    special: '特殊効果音','';
                    ambient: '環境音' }]
                }]'
            }],''
            ['en', { ''
                soundPrefix: '♪ ',')';
                musicPrefix: '♫ ')';
                categories: {''
                    game: 'Game Sound','';
                    ui: 'UI Sound','';
                    special: 'Special Effect','';
                    ambient: 'Ambient Sound' }]
                }]'
            }]''
        ]'),';
        '';
        console.log('CaptionManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void { try {
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // キャプションコンテナの作成
            this.createCaptionContainer();
            
            // 動的スタイルシートの作成
            this.createDynamicStyleSheet();
            ;
            // イベントリスナーの設定
            this.setupEventListeners()';
            console.log('CaptionManager initialized successfully'); }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'CAPTION_MANAGER_ERROR', {')'
                operation: 'initialize') }
            });
        }
    }
    
    /**
     * ユーザー設定の読み込み'
     */''
    private loadUserPreferences()';
            const saved = localStorage.getItem('captionManager_preferences');
            if(saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // Map の復元
                if (preferences.customDescriptions) {
            }
                    this.userPreferences.customDescriptions = new Map(preferences.customDescriptions); }
                }
                
                // 設定を適用
                this.config.enabled = this.userPreferences.enabled;
                this.updateStyleFromPreferences();''
            } catch (error) { ''
            console.warn('Failed to load caption manager preferences:', error) }
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    private saveUserPreferences(): void { try {
            const preferences = {'
                ...this.userPreferences,'';
                customDescriptions: Array.from(this.userPreferences.customDescriptions.entries()') }
            };'
            '';
            localStorage.setItem('captionManager_preferences');'
                JSON.stringify(preferences);''
        } catch (error) { ''
            console.warn('Failed to save caption manager preferences:', error) }
        }
    }
    
    /**
     * キャプションコンテナの作成'
     */''
    private createCaptionContainer()';
        this.captionContainer = document.createElement('div'');''
        this.captionContainer.id = 'caption-container';''
        this.captionContainer.className = 'caption-container';''
        this.captionContainer.setAttribute('role', 'region'');''
        this.captionContainer.setAttribute('aria-label', 'Audio captions'');''
        this.captionContainer.setAttribute('aria-live', 'polite');
        
        // 初期位置の設定
        this.updateContainerPosition();
        
        document.body.appendChild(this.captionContainer);
    }
    
    /**
     * コンテナ位置の更新
     */
    private updateContainerPosition(): void { ''
        if (!this.captionContainer') return;
        
        const position = this.userPreferences.position;'
        let positionStyles: Partial<CSSStyleDeclaration> = {''
            position: 'fixed','';
            zIndex: '10000','';
            pointerEvents: 'none','';
            maxWidth: '80vw','';
            minWidth: '200px' }
        },'
        '';
        switch(position') {'
            '';
            case 'top-center':;
                positionStyles = {'
                    ...positionStyles,'';
                    top: '20px','';
                    left: '50%','
        }'
                    transform: 'translateX(-50%')' }
                },'
                break;''
            case 'bottom-left':';
                positionStyles = { ...positionStyles,''
                    bottom: '20px','';
                    left: '20px' }
                },'
                break;''
            case 'bottom-right':';
                positionStyles = { ...positionStyles,''
                    bottom: '20px','';
                    right: '20px' }
                },'
                break;''
            case 'center':';
                positionStyles = { ...positionStyles,''
                    top: '50%','';
                    left: '50%','';
                    transform: 'translate(-50%, -50%')' }
                };'
                break;''
            case 'bottom-center':;
            default:';
                positionStyles = { ...positionStyles,''
                    bottom: '20px','';
                    left: '50%','';
                    transform: 'translateX(-50%')' }
                },
                break;
        }
        
        Object.assign(this.captionContainer.style, positionStyles);
    }
    
    /**
     * 動的スタイルシートの作成'
     */''
    private createDynamicStyleSheet()';
        this.dynamicStyleSheet = document.createElement('style'');''
        this.dynamicStyleSheet.id = 'caption-manager-styles';
        this.updateStyleSheet();
        document.head.appendChild(this.dynamicStyleSheet);
    }
    
    /**
     * スタイルシートの更新
     */
    private updateStyleSheet(): void { if (!this.dynamicStyleSheet) return;
        
        const prefs = this.userPreferences;
        
        this.dynamicStyleSheet.textContent = `;
            /* キャプションコンテナの基本スタイル */
            .caption-container { }
                font-family: ${prefs.fontFamily}, sans-serif;
                font-size: ${prefs.fontSize}px;
                color: ${prefs.textColor},
                display: flex,
                flex-direction: column,
                gap: 8px,
                max-height: 300px,
                overflow-y: auto,
            }
            
            /* 個別キャプションのスタイル */
            .caption-item {
                background: ${prefs.backgroundColor},
                border: 2px solid ${prefs.textColor}
                border-radius: 8px,
                padding: 12px 16px,
                margin: 4px 0,
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                line-height: 1.4,
                letter-spacing: 0.5px,
                word-wrap: break-word,
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                opacity: 0,
                transform: translateY(20px})
                transition: all 0.3s ease);
            .caption-item.visible { opacity: 1,
                transform: translateY(0) }
            }
            
            .caption-item.fade-out { opacity: 0,
                transform: translateY(-20px) }
            }
            
            /* カテゴリ別スタイル */
            .caption-game { border-left: 4px solid #4ecdc4, }
            }
            
            .caption-ui { border-left: 4px solid #45b7d1, }
            }
            
            .caption-special { border-left: 4px solid #f39c12, }
            }
            
            .caption-ambient { border-left: 4px solid #95a5a6,
                opacity: 0.8 }
            }
            
            .caption-music { border-left: 4px solid #9b59b6, }
                background: linear-gradient(135deg, ${prefs.backgroundColor), rgba(155, 89, 182, 0.1)}),
            }
            
            /* 冗長性レベル別スタイル */
            .caption-minimal { padding: 8px 12px, }
                font-size: calc(${prefs.fontSize)px * 0.9});
            }
            
            .caption-detailed { padding: 16px 20px, }
                font-size: calc(${prefs.fontSize)px * 1.1});
                line-height: 1.6,
            }
            
            /* アニメーション */
            @keyframes slideInFromBottom { from {
                    opacity: 0,
                    transform: translateY(100%) }
                }
                to { opacity: 1,
                    transform: translateY(0) }
                }
            }
            
            @keyframes fadeInBounce { 0% {
                    opacity: 0,
                    transform: scale(0.3) translateY(20px) }
                }
                50% { transform: scale(1.05) translateY(-5px) }
                }
                100% { opacity: 1,
                    transform: scale(1) translateY(0) }
                }
            }
            
            .caption-item.slide-in { animation: slideInFromBottom 0.3s ease-out }
            }
            
            .caption-item.bounce-in { animation: fadeInBounce 0.5s ease-out }
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) { .caption-container {
                    max-width: 95vw, }
                    font-size: calc(${prefs.fontSize)px * 0.9});
                }
                
                .caption-item { padding: 10px 14px,
                    margin: 3px 0 }
                }
            }
            
            @media (max-width: 480px) { .caption-container {
                    max-width: 98vw, }
                    font-size: calc(${prefs.fontSize)px * 0.8});
                }
                
                .caption-item { padding: 8px 12px,
                    margin: 2px 0 }
                }
            }
            
            /* 高コントラストモードとの統合 */
            .high-contrast .caption-item { background: #000000,
                color: #ffffff,
                border: 3px solid #ffffff,
                text-shadow: none, }
            }
            
            /* アクセシビリティ強化 */
            .caption-item:focus { outline: 3px solid #ffffff,
                outline-offset: 2px, }
            }
            
            .reduced-motion .caption-item { transition: opacity 0.1s ease,
                animation: none !important }
            }
            
            .reduced-motion .caption-item.visible { transform: none }
            }
        `;
    }
    
    /**
     * 設定からスタイルを更新
     */
    private updateStyleFromPreferences(): void { if (this.dynamicStyleSheet) {
            this.updateStyleSheet(); }
        }
        if (this.captionContainer) { this.updateContainerPosition(); }
        }
    }
    
    /**
     * イベントリスナーの設定
     */'
    private setupEventListeners(): void { // ゲームオーディオイベントの監視
        if(this.gameEngine') {'
            // 音響効果イベント
        }'
            this.gameEngine.addEventListener?.('audioPlayed', (event: AudioEvent) => {  }'
                this.handleAudioEvent(event);' }'
            }');
            ';
            // 特定のゲームイベント
            this.gameEngine.addEventListener?.('bubblePopped', (event: GameEvent') => { ' }'
                this.displayCaption('bubblePop', { bubble: event.bubble });''
            }');'
            '';
            this.gameEngine.addEventListener?.('comboAchieved', (event: GameEvent') => { ' }'
                this.displayCaption('combo', { count: event.count });''
            }');'
            '';
            this.gameEngine.addEventListener?.('bonusTriggered', (event: GameEvent') => { ' }'
                this.displayCaption('bonus', { type: event.type });''
            }');'
            '';
            this.gameEngine.addEventListener?.('powerUpCollected', (event: GameEvent') => { ' }'
                this.displayCaption('powerUp', { type: event.type });''
            }');'
            '';
            this.gameEngine.addEventListener?.('levelUp', (event: GameEvent') => { ' }'
                this.displayCaption('levelUp', { level: event.level });''
            }');'
            '';
            this.gameEngine.addEventListener?.('gameOver', (event: GameEvent') => { ' }'
                this.displayCaption('gameOver', { score: event.score });''
            }');'
            '';
            this.gameEngine.addEventListener?.('warning', (event: GameEvent') => { ' }'
                this.displayCaption('warning', { message: event.message });
            });
        }
        
        // AudioManager との連携
        if(this.gameEngine? .audioManager) {
            '';
            this.setupAudioManagerIntegration()';
        document.addEventListener('keydown', (event: KeyboardEvent) => { '
            if (event.ctrlKey && event.shiftKey) {''
                switch (event.key') {''
                    case 'C':';
                        event.preventDefault();''
                        this.toggle()';
                    case 'X':);
                        event.preventDefault();
        }
                        this.clearAllCaptions(); }
                        break; }
                }'
            }''
        }');
        ';
        // 設定変更の監視
        document.addEventListener('accessibilitySettingsChanged', (event: AccessibilityEvent') => {  ''
            if (event.detail.component === 'captions') { }
                this.applyConfig(event.detail.config); }
            }
        });
    }
    
    /**
     * AudioManager 統合の設定
     */
    private setupAudioManagerIntegration(): void { const audioManager = this.gameEngine!.audioManager!;
        
        // オリジナルの play メソッドをラップ
        if(audioManager.playSound) {
            
        }
            const originalPlaySound = audioManager.playSound.bind(audioManager); }
            audioManager.playSound = (soundId: string, options: PlaySoundOptions = {}) => {  const result = originalPlaySound(soundId, options);
                ;
                // キャプション表示
                if(this.config.enabled') {
                    this.displayCaption(soundId, {
                })'
                        volume: options.volume || 1.0,') }'
                        category: options.category || 'game'); }
                    });
                }
                
                return result;
            };
        }
        
        // BGM 再生の監視
        if (audioManager.playMusic) { const originalPlayMusic = audioManager.playMusic.bind(audioManager); }
            audioManager.playMusic = (musicId: string, options: PlayMusicOptions = {}) => {  const result = originalPlayMusic(musicId, options);
                
                if (this.config.enabled && this.userPreferences.showMusic) { }
                    this.displayMusicCaption(musicId, options); }
                }
                
                return result;
            };
        }
    }
    
    /**
     * オーディオイベントの処理
     */
    private handleAudioEvent(event: AudioEvent): void { if (!this.config.enabled) return;
         }
        const { soundId, category, volume, duration } = event;
        
        // カテゴリフィルタリング
        if(!this.shouldShowCaption(category) { return; }
        }
        
        this.displayCaption(soundId, { category)
            volume,);
            duration);
            timestamp: Date.now() }
        });
    }
    
    /**
     * キャプション表示判定
     */
    private shouldShowCaption(category: string): boolean { ''
        switch(category') {'
            '';
            case 'game':'';
            case 'ui':'';
            case 'special':';
                return this.userPreferences.showSoundEffects;''
            case 'music':';
                return this.userPreferences.showMusic;''
            case 'ambient':;
                return this.userPreferences.showAmbientSounds;
        }
            default: return true; }
        }
    }
    
    /**
     * キャプションの表示
     */
    displayCaption(soundId: string, options: any = { ): void {
        if (!this.config.enabled) return;
        
        // 音響効果の説明を取得
        let description = this.getAudioDescription(soundId, options);
        if (!description) return;
        
        // カスタム説明の確認
        const customDescription = this.userPreferences.customDescriptions.get(soundId);
        if (customDescription) { }
            description = { ...description, text: customDescription }
        }
        
        // 冗長性レベル適用
        description = this.applyVerbosityLevel(description, options);
        
        const captionId = this.generateCaptionId();
        const duration = this.getDurationForSound(soundId, description.category);
        
        this.createCaptionElement(captionId, description, duration, options);
        
        // 統計更新
        this.updateCaptionStats(description.category);
    }
    
    /**
     * 音楽キャプションの表示
     */
    private displayMusicCaption(musicId: string, options: any = { ): void {
        const musicDescription = this.musicDescriptions.get(musicId);
        if (!musicDescription) return;
        '';
        const language = this.languageSupport.get(this.userPreferences.languagePreference')!; }
        const text = `${language.musicPrefix}${musicDescription.text}`;
        ';'
        const description: SoundDescription = { text,''
            category: 'music',
            duration: musicDescription.tempo }
        },
        
        const captionId = this.generateCaptionId();
        const duration = this.config.captionDuration.persistent;'
        '';
        this.createCaptionElement(captionId, description, duration, options');'
        '';
        this.updateCaptionStats('music');
    }
    
    /**
     * 音響効果説明の取得
     */'
    private getAudioDescription(soundId: string, options: any): SoundDescription | null { const description = this.soundDescriptions.get(soundId);''
        if(!description') {
            // デフォルト説明の生成
        }
            return { }
                text: `音: ${soundId}`,''
                category: options.category || 'game','';
                duration: 'short';
            },
        }
        
        return description;
    }
    
    /**
     * 冗長性レベルの適用
     */
    private applyVerbosityLevel(description: SoundDescription, options: any): SoundDescription { const level = this.userPreferences.verbosityLevel;
        let text = description.text;'
        '';
        switch(level') {'
            '';
            case 'minimal':';
                // 最小限の情報のみ
                text = text.split('（'')[0]; // 括弧内の詳細を削除
                break;
                '';
            case 'detailed':';
                // 詳細な情報を追加
                if (options.volume && options.volume !== 1.0') {'
        }'
                    const volumeDesc = options.volume > 1.0 ? '大音量で' : '小音量で'; }
                    text = `${volumeDesc}${text}`;
                }'
                '';
                if(description.category && description.category !== 'game') {'
                    '';
                    const language = this.languageSupport.get(this.userPreferences.languagePreference')!;
                }
                    const categoryDesc = language.categories[description.category as keyof typeof language.categories]; }
                    text = `[${categoryDesc}] ${text}`;
                }
                break;'
                '';
            case 'normal':;
            default:;
                // 通常レベル（変更なし）
                break,
        }
        
        return { ...description, text };
    }
    
    /**
     * キャプション継続時間の取得
     */
    private getDurationForSound(soundId: string, category: string): number { const description = this.soundDescriptions.get(soundId);
        if(description && description.duration) {
            return this.config.captionDuration[description.duration as keyof typeof this.config.captionDuration] || ;
        }
                   this.config.captionDuration.medium; }
        }
        ;
        // カテゴリベースのデフォルト
        switch(category') {'
            '';
            case 'ui':';
                return this.config.captionDuration.short;''
            case 'music':'';
            case 'ambient':;
                return this.config.captionDuration.persistent;
        }
            default: return this.config.captionDuration.medium; }
        }
    }
    
    /**
     * キャプション要素の作成
     */'
    private createCaptionElement(captionId: number, description: SoundDescription, duration: number, options: any): void { ''
        if (!this.captionContainer') return;'
        '';
        const captionElement = document.createElement('div''); }
        captionElement.id = `caption-${captionId}`;
        captionElement.className = `caption-item caption-${description.category}`;'
        captionElement.textContent = description.text;''
        captionElement.setAttribute('role', 'status'');''
        captionElement.setAttribute('aria-label', `Audio caption: ${ description.text)`'),
        ';
        // 冗長性レベルクラスの追加
        if (this.userPreferences.verbosityLevel !== 'normal') { }
            captionElement.classList.add(`caption-${this.userPreferences.verbosityLevel)`});
        }
        ';
        // アニメーション設定
        if(this.config.animation.slideIn') {'
            ';'
        }'
            captionElement.classList.add('slide-in'); }'
        }''
        if(this.config.animation.bounce') {'
            ';'
        }'
            captionElement.classList.add('bounce-in'); }
        }
        
        // キャプションコンテナに追加
        this.captionContainer.appendChild(captionElement);
        ;
        // 表示アニメーション
        setTimeout((') => {  ' }'
            captionElement.classList.add('visible'); }
        }, 50);
        
        // アクティブキャプションに登録
        const captionData: CaptionData = { element: captionElement,
            startTime: Date.now(),
            duration,
            description,
            options }
        };
        
        this.activeCaptions.set(captionId, captionData);
        
        // 自動非表示の設定
        if (duration > 0 && this.userPreferences.autoHide) { setTimeout(() => {  }
                this.hideCaption(captionId); }
            }, duration);
        }
        
        // 最大表示数の制限
        this.enforceMaxCaptions();
        
        console.log(`Caption displayed: ${description.text}`);
    }
    
    /**
     * 最大キャプション数の制限
     */
    private enforceMaxCaptions(): void { const maxCaptions = this.config.maxCaptionLines;
        if (this.activeCaptions.size <= maxCaptions) return;
        
        // 最も古いキャプションを削除
        const sortedCaptions = Array.from(this.activeCaptions.entries();
            .sort(([, a], [, b]) => a.startTime - b.startTime);
        
        const toRemove = sortedCaptions.slice(0, this.activeCaptions.size - maxCaptions);
        toRemove.forEach(([captionId]) => {  }
            this.hideCaption(captionId); }
        });
    }
    
    /**
     * キャプションの非表示
     */
    private hideCaption(captionId: number): void { const captionData = this.activeCaptions.get(captionId);''
        if (!captionData') return;
        ';'
        const element = captionData.element;''
        element.classList.add('fade-out');
        
        setTimeout(() => { 
            if (element.parentNode) { }
                element.parentNode.removeChild(element); }
            }
            this.activeCaptions.delete(captionId);
        }, this.config.animation.fadeOut);
        
        // 統計更新
        const displayTime = Date.now() - captionData.startTime;
        this.updateDisplayTimeStats(displayTime);
    }
    
    /**
     * キャプションIDの生成
     */
    private generateCaptionId(): number { return ++this.maxCaptionId; }
    }
    
    /**
     * 統計更新
     */
    private updateCaptionStats(category: string): void { this.stats.captionsDisplayed++;
        
        const count = this.stats.captionsByCategory.get(category) || 0;
        this.stats.captionsByCategory.set(category, count + 1); }
    }
    
    private updateDisplayTimeStats(displayTime: number): void { const currentTotal = this.stats.totalDisplayTime;
        const currentAverage = this.stats.averageDisplayTime;
        const displayCount = this.stats.captionsDisplayed;
        
        this.stats.totalDisplayTime = currentTotal + displayTime;
        this.stats.averageDisplayTime = ;
            (currentAverage * (displayCount - 1) + displayTime) / displayCount; }
    }
    
    // パブリックAPI
    
    /**
     * キャプションマネージャーの有効化
     */
    enable(): void { this.config.enabled = true;
        this.userPreferences.enabled = true;
        '';
        if(this.captionContainer') {'
            ';'
        }'
            this.captionContainer.style.display = 'flex'; }
        }'
        '';
        this.saveUserPreferences()';
        console.log('Caption manager enabled');
    }
    
    /**
     * キャプションマネージャーの無効化
     */
    disable(): void { this.config.enabled = false;
        this.userPreferences.enabled = false;
        
        // すべてのアクティブキャプションをクリア
        this.clearAllCaptions();
        '';
        if(this.captionContainer') {'
            ';'
        }'
            this.captionContainer.style.display = 'none'; }
        }'
        '';
        this.saveUserPreferences()';
        console.log('Caption manager disabled');
    }
    
    /**
     * 有効/無効の切り替え
     */
    toggle(): void { if (this.config.enabled) {
            this.disable(); }
        } else { this.enable(); }
        }
    }
    
    /**
     * すべてのキャプションをクリア
     */'
    clearAllCaptions(): void { for(const captionId of this.activeCaptions.keys() {''
            this.hideCaption(captionId'); }'
        }''
        console.log('All captions cleared');
    }
    
    /**
     * カスタム説明の追加
     */
    addCustomDescription(soundId: string, description: string): void { this.userPreferences.customDescriptions.set(soundId, description);
        this.saveUserPreferences();
         }
        console.log(`Custom description added for ${soundId}: ${description)`});
    }
    
    /**
     * 位置の設定
     */
    setPosition(position: string): void { if(!this.config.positioning.alternatives.includes(position) { }
            console.warn(`Invalid position: ${position)`});
            return;
        }
        
        this.userPreferences.position = position;
        this.updateContainerPosition();
        this.saveUserPreferences();
        
        console.log(`Caption position changed to: ${position)`});
    }
    
    /**
     * フォントサイズの設定
     */
    setFontSize(fontSize: number): void { const size = Math.max(12, Math.min(32, fontSize);
        this.userPreferences.fontSize = size;
        
        this.updateStyleFromPreferences();
        this.saveUserPreferences();
         }
        console.log(`Caption font size changed to: ${size)px`});
    }
    
    /**
     * 色の設定
     */
    setColors(textColor: string, backgroundColor: string): void { this.userPreferences.textColor = textColor;
        this.userPreferences.backgroundColor = backgroundColor;
        
        this.updateStyleFromPreferences();
        this.saveUserPreferences();
         }
        console.log(`Caption colors changed - text: ${textColor}, background: ${backgroundColor)`});
    }
    
    /**
     * 冗長性レベルの設定'
     */''
    setVerbosityLevel(level: string'): void { ''
        const validLevels = ['minimal', 'normal', 'detailed'];
        if(!validLevels.includes(level) { }
            console.warn(`Invalid verbosity level: ${level)`});
            return;
        }
        
        this.userPreferences.verbosityLevel = level;
        this.saveUserPreferences();
        
        console.log(`Caption verbosity level changed to: ${level)`});
    }
    
    /**
     * 言語設定
     */
    setLanguage(language: string): void { if(!this.languageSupport.has(language) { }
            console.warn(`Unsupported language: ${language)`});
            return;
        }
        
        this.userPreferences.languagePreference = language;
        this.saveUserPreferences();
        
        console.log(`Caption language changed to: ${language)`});
    }
    
    /**
     * 手動キャプション表示'
     */''
    showManualCaption(text: string, options: ManualCaptionOptions = { )'): number {
        const description: SoundDescription = {'
            text,'';
            category: options.category || 'ui','';
            duration: options.duration || 'medium' }
        },
        
        const captionId = this.generateCaptionId();
        const duration = this.config.captionDuration[description.duration as keyof typeof this.config.captionDuration] || ;
                        this.config.captionDuration.medium;
        
        this.createCaptionElement(captionId, description, duration, options);
        
        return captionId;
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config: any): void { if (config.audio? .captions) {'
            Object.assign(this.config, config.audio.captions);''
            this.updateStyleFromPreferences()';
        console.log('CaptionManager configuration applied'); }
    }
    
    /**
     * レポートの生成
     */ : undefined
    generateReport(): CaptionReport { const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return { timestamp: new Date().toISOString(),
            configuration: {
                enabled: this.config.enabled,
                position: this.userPreferences.position,
                verbosityLevel: this.userPreferences.verbosityLevel, };
                language: this.userPreferences.languagePreference }
            },
            statistics: { ...this.stats,
                sessionDuration,
                captionsPerMinute: this.stats.captionsDisplayed / (sessionDuration / 60000),
                activeCaptions: this.activeCaptions.size,
                customDescriptions: this.userPreferences.customDescriptions.size }
            },
            userPreferences: this.userPreferences,
            performance: { averageDisplayTime: this.stats.averageDisplayTime,
                maxConcurrentCaptions: Math.max(...Array.from(this.stats.captionsByCategory.values()) }
            }
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void { if (enabled) {
            this.enable(); }'
        } else {  ' }'
            this.disable() }'
        console.log(`CaptionManager ${enabled ? 'enabled' : 'disabled')`});
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';
        console.log('Destroying CaptionManager...');
        
        // キャプションマネージャーを無効化
        this.disable();
        
        // キャプションコンテナの削除
        if (this.captionContainer && this.captionContainer.parentNode) { this.captionContainer.parentNode.removeChild(this.captionContainer); }
        }
        
        // スタイルシートの削除
        if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode) { this.dynamicStyleSheet.parentNode.removeChild(this.dynamicStyleSheet); }
        }
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.activeCaptions.clear();
        this.captionQueue.length = 0;
        this.soundDescriptions.clear();
        this.musicDescriptions.clear();''
        this.languageSupport.clear()';
        console.log('CaptionManager destroyed'');'
    }''
}