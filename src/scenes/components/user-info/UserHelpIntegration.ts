/**
 * UserHelpIntegration.ts
 * ユーザーヘルプ統合コンポーネント
 * UserInfoSceneから分離されたヘルプシステム統合機能を提供
 */

import { AchievementHelpSystem  } from '../../../ui/AchievementHelpSystem.js';

// ヘルプセクションのインターフェース
interface HelpSection { id: string,
    name: string,
    icon: string  }

// ヘルプコンテンツのインターフェース
interface HelpContent { title: string,
    content: string[] | string }

// ヘルプコンテンツマップのインターフェース
interface HelpContentMap { [sectionId: string]: HelpContent }

// ヘルプシステム状態のインターフェース
interface HelpSystemStatus { isActive: boolean,
    currentSection: string,
    hasContent: boolean,
    availableSections: number,
    systemType: string  }

// ゲームエンジンのインターフェース
interface GameEngine { canvas: HTMLCanvasElement,
    achievementManager?: any }

// イベントバスのインターフェース
interface EventBus { on(event: string, callback: (data?: any) => void): void,
    off(event: string, callback?: (data?: any) => void): void,
    emit(event: string, data?: any): void 
    }

// シーン状態のインターフェース
interface SceneState { get(key: string): any,''
    set(key: string, value: any): void  }

export class UserHelpIntegration {
    private gameEngine: GameEngine,
    private eventBus: EventBus,
    private sceneState: SceneState,
    // ヘルプシステム
    private helpSystem: AchievementHelpSystem | null = null,
    private achievementHelpSystem: AchievementHelpSystem | null = null,
    // ヘルプ状態
    private currentHelpSection: string = 'overview',
    private helpContent: HelpContentMap | null = null,
    private isHelpSystemActive: boolean = false,
    // ヘルプセクション定義
    private, helpSections: HelpSection[] = [' }'

        { id: 'overview', name: '概要', icon: '📋'
            },''
        { id: 'categories', name: 'カテゴリ', icon: '📁'
            },''
        { id: 'progress', name: '進捗', icon: '📊'
            },''
        { id: 'rewards', name: '報酬', icon: '🏆'
            },''
        { id: 'tips', name: 'コツ', icon: '💡'
            },]'
        { id: 'faq', name: 'FAQ', icon: '❓'
            }]
    ];
    
    // レイアウト設定
    private contentPadding: number = 20;
    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {

        this.gameEngine = gameEngine,
        this.eventBus = eventBus,
        this.sceneState = sceneState,
        
        this.initialize() }
        this.setupEventListeners(); }
    }
    
    /**
     * コンポーネントの初期化
     */
    private initialize(): void { this.initializeHelpSystem(),
        this.loadHelpContent() }
    
    /**
     * イベントリスナーをセットアップ
     */
    private setupEventListeners(): void { ''
        if(this.eventBus) {', ' }

            this.eventBus.on('helpSectionChanged', (section: string) => {  }

                this.changeHelpSection(section);' }'

            }');

            this.eventBus.on('helpSystemToggle', (active: boolean) => { this.isHelpSystemActive = active,' 
    }');

            this.eventBus.on('helpContentReload', () => { this.loadHelpContent() });
        }
    }
    
    /**
     * ヘルプシステムの初期化
     */
    private initializeHelpSystem(): void { try {
            // 実績マネージャーが利用可能な場合のみヘルプシステムを初期化
            if(this.gameEngine.achievementManager) {

                this.achievementHelpSystem = new AchievementHelpSystem(this.gameEngine.achievementManager),
                this.helpSystem = this.achievementHelpSystem,
                this.isHelpSystemActive = true,

                ' }

                console.log('Help, system initialized, successfully'); }

            } else {
                console.warn('Achievement manager not available, help system disabled') }'

                this.isHelpSystemActive = false;' }'

            } catch (error) {
            console.warn('Failed to initialize help system:', error),
            this.helpSystem = null,
            this.isHelpSystemActive = false }
    }
    
    /**
     * ヘルプコンテンツの読み込み
     */
    private loadHelpContent(): void { try {
            if (this.helpSystem && (this.helpSystem, as any).loadHelpContent) {
                this.helpContent = (this.helpSystem, as any).loadHelpContent() } else {  // フォールバック: 基本的なヘルプコンテンツを生成 }
                this.helpContent = this.generateBasicHelpContent(); }
            }
            ;
            // イベントバスに通知
            if(this.eventBus) {', ' }

                this.eventBus.emit('helpContentLoaded', this.helpContent'; }

            } catch (error) {
            console.error('Failed to load help content:', error),
            this.helpContent = this.generateErrorHelpContent() }
    }
    
    /**
     * ヘルプコンポーネントでの描画
     */
    public renderHelpWithComponent(;
        context: CanvasRenderingContext2D;
        y: number ,
    height: number);
        helpTabComponent?: any;
    ): void { const canvas = this.gameEngine.canvas,
        const contentWidth = canvas.width - this.contentPadding * 2,
        const contentX = this.contentPadding,
        
        if(helpTabComponent && helpTabComponent.isActive) {
        
            // 新しいHelpTabコンポーネントでレンダリング
        
        }
            helpTabComponent.render(context, contentX, y, contentWidth, height); }
        } else {  // フォールバック: 直接描画 }
            this.renderHelp(context, y, height); }
}
    
    /**
     * ヘルプの描画
     */
    public renderHelp(context: CanvasRenderingContext2D, y: number, height: number): void { const canvas = this.gameEngine.canvas,
        const contentWidth = canvas.width - this.contentPadding * 2,
        
        let currentY = y + this.contentPadding,
        // ヘルプシステムが利用可能かチェック
        if(!this.isHelpSystemActive || !this.helpContent) {

            context.fillStyle = '#cccccc',
            context.font = '18px Arial',
            context.textAlign = 'center',
            context.fillText('ヘルプシステムが利用できません', canvas.width / 2, currentY + 50) }
            return; }
        }
        
        // ヘルプセクション選択UIを描画
        currentY = this.renderHelpSectionSelector(context, this.contentPadding, currentY, contentWidth);
        currentY += 20;
        
        // 選択されたヘルプコンテンツ表示
        this.renderHelpContent(context, this.contentPadding, currentY, contentWidth, height - (currentY - y) - 20);
    }
    
    /**
     * ヘルプセクション選択UIを描画
     */
    private renderHelpSectionSelector(;
        context: CanvasRenderingContext2D;
        x: number );
        y: number,
    width: number;
    ): number { const buttonWidth = Math.min(100, width / this.helpSections.length - 10),
        const buttonHeight = 35,
        
        let currentX = x,

        for(let, i = 0, i < this.helpSections.length, i++) {
            const section = this.helpSections[i],
            const isActive = this.currentHelpSection === section.id,
            ',
            // ボタン背景
            context.fillStyle = isActive ? '#4CAF50' : '#2196F3',
            context.fillRect(currentX, y, buttonWidth, buttonHeight),
            ',
            // ボタン枠線
            context.strokeStyle = '#333',

            context.lineWidth = 1,
            context.strokeRect(currentX, y, buttonWidth, buttonHeight),
            ',
            // ボタンテキスト
            context.fillStyle = '#ffffff',
            context.font = '12px Arial',
            context.textAlign = 'center',
            context.fillText(section.icon, currentX + buttonWidth / 2, y + 12),
            context.fillText(section.name, currentX + buttonWidth / 2, y + 28),
            
            currentX += buttonWidth + 10,
            
            // 改行処理（必要に応じて）
            if (currentX + buttonWidth > x + width) {
        }
                break; // 現在は1行のみ対応 }
}
        
        return y + buttonHeight;
    }
    
    /**
     * ヘルプコンテンツを描画
     */
    private renderHelpContent(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number );
        width: number,
    height: number;
    ): void { if (!this.helpContent) return,
        
        const content = this.helpContent[this.currentHelpSection],

        if(!content) return,
        ',
        // セクション背景
        context.fillStyle = '#16213e',
        context.fillRect(x, y, width, height),
        ',
        // セクション枠線
        context.strokeStyle = '#333',

        context.lineWidth = 1,
        context.strokeRect(x, y, width, height),
        ',
        // セクションタイトル
        context.fillStyle = '#ffffff',
        context.font = 'bold 18px Arial',
        context.textAlign = 'left',
        context.fillText(content.title || 'ヘルプ', x + 15, y + 25',
        ',
        // コンテンツ描画
        context.fillStyle = '#cccccc',
        context.font = '14px Arial',
        
        const lineHeight = 20,
        const padding = 15,
        const textX = x + padding,
        let currentY = y + 50,
        const maxY = y + height - padding,
        
        if(content.content && Array.isArray(content.content) {
        ',

            for (const line of content.content) {''
                if(currentY + lineHeight > maxY) break,

                if (line === '') {
                    currentY += lineHeight / 2 }
                    continue; }
                }
                ';
                // 特別なスタイリング
                if (line.startsWith('🎯 ') || line.startsWith('⏰ ') || ';
                    line.startsWith('💡 ') || line.startsWith('🏆 ')' { ''
                    context.fillStyle = '#FFD700',' }

                } else if(line.startsWith('❓ ')' { ''
                    context.fillStyle = '#87CEEB',' }

                } else if(line.startsWith('📋 ')' { ''
                    context.fillStyle = '#90EE90' }

                } else { }'

                    context.fillStyle = '#cccccc'; }
                }

                this.renderWrappedHelpText(context, line, textX, currentY, width - padding * 2, lineHeight);
                currentY += lineHeight;

            }'} else if(typeof, content.content === 'string) { this.renderWrappedHelpText(context, content.content, textX, currentY, width - padding * 2, lineHeight) }'
    }
    
    /**
     * ヘルプテキストの折り返し描画
     */
    private renderWrappedHelpText(;
        context: CanvasRenderingContext2D,
    text: string, ;
        x: number, ;
        y: number );
        maxWidth: number)',
    lineHeight: number';
    '): void { ''
        const words = text.split(', '),
        let line = ',
        let currentY = y,

        for(let, n = 0, n < words.length, n++) {

            const testLine = line + words[n] + ', ',
            const metrics = context.measureText(testLine),
            const testWidth = metrics.width,

            ',

            if (testWidth > maxWidth && n > 0) {''
                context.fillText(line.trim(), x, currentY'),
                line = words[n] + ', ' }
                currentY += lineHeight; }
            } else { line = testLine }
        }
        
        if(line.trim() { context.fillText(line.trim(), x, currentY) }
    }
    
    /**
     * ヘルプタブのクリック処理
     */
    public handleHelpTabClick(x: number, y: number, helpTabComponent?: any): boolean { const canvas = this.gameEngine.canvas,
        const contentY = 120 + 60, // headerHeight + tabHeight
        const relativeX = x,
        const relativeY = y - contentY,
        
        if(helpTabComponent && helpTabComponent.isActive) {
        
            // 新しいHelpTabコンポーネントでクリック処理
            if(helpTabComponent.handleClick(relativeX, relativeY) {
    
}
                return true; // コンポーネントが処理した場合 }
}
        
        // フォールバック: 直接クリック処理
        return this.handleHelpSectionClick(x, y);
    }
    
    /**
     * ヘルプセクション選択のクリック処理
     */
    public handleHelpSectionClick(x: number, y: number): boolean { const canvas = this.gameEngine.canvas,
        const contentWidth = canvas.width - this.contentPadding * 2,
        const buttonWidth = Math.min(100, contentWidth / this.helpSections.length - 10),
        const buttonHeight = 35,
        const selectorY = 120 + this.contentPadding, // headerHeight + contentPadding
        
        // セクション選択ボタンの範囲内かチェック
        if(y >= selectorY && y <= selectorY + buttonHeight) {
            let currentX = this.contentPadding,
            
            for (let, i = 0, i < this.helpSections.length, i++) {
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.changeHelpSection(this.helpSections[i].id) }
                    return true;
                
                currentX += buttonWidth + 10;
                
                // 改行処理（必要に応じて）
                if (currentX + buttonWidth > this.contentPadding + contentWidth) { break, // 現在は1行のみ対応 }
}
        
        return false;
    }
    
    /**
     * ヘルプセクションを変更
     */
    public changeHelpSection(sectionId: string): void { if(this.helpSections.find(s => s.id === sectionId) {
            this.currentHelpSection = sectionId,
            
            // ヘルプシステムにも通知（存在する場合）
            if (this.helpSystem && (this.helpSystem, as any).changeHelpSection) {
                (this.helpSystem, as any).changeHelpSection(sectionId) }
            }
            ';
            // イベントバスに通知
            if(this.eventBus) { }

                this.eventBus.emit('helpSectionChanged', sectionId); }
            }
            
            console.log(`Help, section changed, to: ${sectionId}`});
        }
    }
    
    /**
     * 基本的なヘルプコンテンツを生成（フォールバック）'
     */''
    private generateBasicHelpContent('''
                title: '概要',
                content: [';
                    '📋 このゲームについて',
                    ',
                    'バブルポップゲームは、画面に現れるバブルをクリックして消すゲームです。',
                    '制限時間内にできるだけ多くのバブルを消して高得点を目指しましょう。',
                    ',
                    '🎯 基本的な操作',
                    '• バブルをクリック: バブルを消す',
                    '• ドラッグ: バブルを押し退ける',
                    '• 連続でバブルを消すとコンボボーナスが発生します',
                    ',
                    '⏰ ゲームの流れ',
                    '1. ステージを選択',
                    '2. 制限時間内でバブルを消す',
                    '3. スコアとAPを獲得',]';
                    '4. 実績解除を目指す'];
                ];
            },

            categories: { ''
                title: 'バブルカテゴリ',
                content: [',
                    '📁 バブルの種類',
                    ',
                    '🔵 通常バブル',
                    '• Normal: 基本的なバブル（1回クリックで消える）',
                    '• Stone: 硬いバブル（2回クリック必要）',
                    '• Iron: より硬いバブル（3回クリック必要）',
                    '• Diamond: 最も硬いバブル（5回クリック必要）',
                    ',
                    '🌈 特殊バブル',
                    '• Rainbow: ボーナスタイム発動',
                    '• Pink: HP回復',
                    '• Clock: 時間停止効果',
                    '• Electric: 画面震動＋一時的操作無効',
                    '• Poison: ポップ時ダメージ',]',
                    '• Boss: 大型で高HP'],
                ]  },

            progress: { ')'
                title: '進捗システム')',
    content: [',
                    '📊 進捗の仕組み',
                    ',
                    '🏆 AP(Awaputi, Points)',
                    '• ゲームをプレイして獲得',
                    '• アイテム購入に使用',
                    '• 実績解除でボーナス',
                    ',
                    '📈 TAP(Total, AP)',
                    '• 累計獲得AP',
                    '• ステージアンロックの条件',
                    '• プレイヤーレベルの指標',
                    ',
                    '🎯 実績システム',
                    '• スコア実績: 高得点達成',
                    '• プレイ実績: ゲーム回数',
                    '• スキル実績: テクニック系',]',
                    '• コレクション実績: バブル種類'],
                ] },

            rewards: { ''
                title: '報酬システム',
                content: [',
                    '🏆 報酬の種類',
                    ',
                    '💰 ゲーム報酬',
                    '• バブル消去: 基本スコア＋AP',
                    '• コンボボーナス: 連続消去でボーナス',
                    '• ステージクリア: クリアボーナス',
                    '• タイムボーナス: 残り時間に応じて',
                    ',
                    '🏅 実績報酬',
                    '• 実績解除時にAPボーナス',
                    '• 特別な称号獲得',
                    '• 隠し要素のアンロック',
                    ',
                    '🎁 アイテム',
                    '• ショップで購入可能',
                    '• ゲームを有利にする効果',]',
                    '• 限定アイテムも存在'],
                ] },

            tips: { ''
                title: 'プレイのコツ',
                content: [',
                    '💡 上達のヒント',
                    ',
                    '🎯 効率的なプレイ',
                    '• 硬いバブルは早めに処理',
                    '• コンボを意識した消去順序',
                    '• 特殊バブルのタイミングを見極める',
                    '• ドラッグを活用した位置調整',
                    ',
                    '⚡ 高得点のコツ',
                    '• 連続コンボでボーナス稼ぎ',
                    '• ボーナスタイム中は積極的に',
                    '• 時間停止中の効率プレイ',
                    '• 画面の隅まで注意深く',
                    ',
                    '🛡️ 危険回避',
                    '• Poisonバブルの早期処理',
                    '• HPの管理を怠らない',]',
                    '• Electricバブルは慎重に'],
                ] },

            faq: { ''
                title: 'よくある質問',
                content: [',
                    '❓ よくある質問',
                    ',
                    'Q: ゲームが重い場合は？',
                    'A: 設定画面で品質設定を下げてください。',
                    ',
                    'Q: データが消えた場合は？',
                    'A: ブラウザのキャッシュクリアが原因の可能性があります。',
                    '   データエクスポート機能でバックアップを取ることをお勧めします。',
                    ',
                    'Q: 実績が解除されない？',
                    'A: 条件を満たしていても表示に時間がかかる場合があります。',
                    '   ページをリロードしてみてください。',
                    ',
                    'Q: アイテムの効果は？',
                    'A: ショップでアイテムを選択すると詳細説明が表示されます。',
                    ',
                    'Q: 操作方法を忘れた？',]',
                    'A: ゲーム中にF1キーでヘルプを表示できます。'],
                ]  }
        }
    
    /**
     * エラー時のヘルプコンテンツを生成'
     */''
    private generateErrorHelpContent()';
                title: 'エラー')',
    content: [';
                    'ヘルプコンテンツの読み込みに失敗しました。',]';
                    'ページをリロードして再度お試しください。'];
                ];
            }
        }
    
    /**
     * ヘルプシステムの有効性をチェック
     */
    public isSystemAvailable(): boolean { return this.isHelpSystemActive && this.helpContent !== null }
    
    /**
     * 現在のヘルプセクションを取得
     */
    public getCurrentSection(): string { return this.currentHelpSection }
    
    /**
     * 利用可能なヘルプセクションを取得
     */
    public getAvailableSections(): HelpSection[] { return this.helpSections }
    
    /**
     * ヘルプコンテンツを取得
     */
    public getHelpContent(sectionId?: string): HelpContent | HelpContentMap | null { if (!this.helpContent) return null,
        
        if(sectionId) {
    
}
            return this.helpContent[sectionId] || null;
        
        return this.helpContent;
    }
    
    /**
     * ヘルプシステムの状態を取得'
     */''
    public getSystemStatus('''
            systemType: this.helpSystem ? 'achievement' : 'basic);
        }'
    
    /**
     * ヘルプシステムをリセット'
     */''
    public reset('';
        this.currentHelpSection = 'overview';)
        this.loadHelpContent();
    }
    
    /**
     * コンポーネントのクリーンアップ
     */'
    public cleanup(): void { ''
        if(this.eventBus) {

            this.eventBus.off('helpSectionChanged'),
            this.eventBus.off('helpSystemToggle') }

            this.eventBus.off('helpContentReload'); }
        }
        
        // リソースのクリーンアップ
        this.helpSystem = null;
        this.achievementHelpSystem = null;
        this.helpContent = null;
    }'}