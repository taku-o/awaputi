/**
 * UserHelpIntegration.ts
 * ユーザーヘルプ統合コンポーネント
 * UserInfoSceneから分離されたヘルプシステム統合機能を提供
 */

import { AchievementHelpSystem } from '../../../ui/AchievementHelpSystem.js';

// ヘルプセクションのインターフェース
interface HelpSection {
    id: string;
    name: string;
    icon: string;
}

// ヘルプコンテンツのインターフェース
interface HelpContent {
    title: string;
    content: string[] | string;
}

// ヘルプコンテンツマップのインターフェース
interface HelpContentMap {
    [sectionId: string]: HelpContent;
}

// ヘルプシステム状態のインターフェース
interface HelpSystemStatus {
    isActive: boolean;
    currentSection: string;
    hasContent: boolean;
    availableSections: number;
    systemType: string;
}

// ゲームエンジンのインターフェース
interface GameEngine {
    canvas: HTMLCanvasElement;
    achievementManager?: any;
}

// イベントバスのインターフェース
interface EventBus {
    on(event: string, callback: (data?: any) => void): void;
    off(event: string, callback?: (data?: any) => void): void;
    emit(event: string, data?: any): void;
}

// シーン状態のインターフェース
interface SceneState {
    get(key: string): any;
    set(key: string, value: any): void;
}

export class UserHelpIntegration {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private sceneState: SceneState;
    
    // ヘルプシステム
    private helpSystem: AchievementHelpSystem | null = null;
    private achievementHelpSystem: AchievementHelpSystem | null = null;
    
    // ヘルプ状態
    private currentHelpSection: string = 'overview';
    private helpContent: HelpContentMap | null = null;
    private isHelpSystemActive: boolean = false;
    
    // ヘルプセクション定義
    private helpSections: HelpSection[] = [
        { id: 'overview', name: '概要', icon: '📋' },
        { id: 'categories', name: 'カテゴリ', icon: '📁' },
        { id: 'progress', name: '進捗', icon: '📊' },
        { id: 'rewards', name: '報酬', icon: '🏆' },
        { id: 'tips', name: 'コツ', icon: '💡' },
        { id: 'faq', name: 'FAQ', icon: '❓' }
    ];
    
    // レイアウト設定
    private contentPadding: number = 20;

    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        this.initialize();
        this.setupEventListeners();
    }
    
    /**
     * コンポーネントの初期化
     */
    private initialize(): void {
        this.initializeHelpSystem();
        this.loadHelpContent();
    }
    
    /**
     * イベントリスナーをセットアップ
     */
    private setupEventListeners(): void {
        if (this.eventBus) {
            this.eventBus.on('helpSectionChanged', (section: string) => {
                this.changeHelpSection(section);
            });

            this.eventBus.on('helpSystemToggle', (active: boolean) => {
                this.isHelpSystemActive = active;
            });

            this.eventBus.on('helpContentReload', () => {
                this.loadHelpContent();
            });
        }
    }
    
    /**
     * ヘルプシステムの初期化
     */
    private initializeHelpSystem(): void {
        try {
            // 実績マネージャーが利用可能な場合のみヘルプシステムを初期化
            if (this.gameEngine.achievementManager) {
                this.achievementHelpSystem = new AchievementHelpSystem(this.gameEngine.achievementManager);
                this.helpSystem = this.achievementHelpSystem;
                this.isHelpSystemActive = true;
                
                console.log('Help system initialized successfully');
            } else {
                console.warn('Achievement manager not available, help system disabled');
                this.isHelpSystemActive = false;
            }
        } catch (error) {
            console.warn('Failed to initialize help system:', error);
            this.helpSystem = null;
            this.isHelpSystemActive = false;
        }
    }
    
    /**
     * ヘルプコンテンツの読み込み
     */
    private loadHelpContent(): void {
        try {
            if (this.helpSystem && (this.helpSystem as any).loadHelpContent) {
                this.helpContent = (this.helpSystem as any).loadHelpContent();
            } else {
                // フォールバック: 基本的なヘルプコンテンツを生成
                this.helpContent = this.generateBasicHelpContent();
            }
            
            // イベントバスに通知
            if (this.eventBus) {
                this.eventBus.emit('helpContentLoaded', this.helpContent);
            }
        } catch (error) {
            console.error('Failed to load help content:', error);
            this.helpContent = this.generateErrorHelpContent();
        }
    }
    
    /**
     * ヘルプコンポーネントでの描画
     */
    public renderHelpWithComponent(
        context: CanvasRenderingContext2D,
        y: number,
        height: number,
        helpTabComponent?: any
    ): void {
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        const contentX = this.contentPadding;
        
        if (helpTabComponent && helpTabComponent.isActive) {
            // 新しいHelpTabコンポーネントでレンダリング
            helpTabComponent.render(context, contentX, y, contentWidth, height);
        } else {
            // フォールバック: 直接描画
            this.renderHelp(context, y, height);
        }
    }
    
    /**
     * ヘルプの描画
     */
    public renderHelp(context: CanvasRenderingContext2D, y: number, height: number): void {
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        
        let currentY = y + this.contentPadding;
        
        // ヘルプシステムが利用可能かチェック
        if (!this.isHelpSystemActive || !this.helpContent) {
            context.fillStyle = '#cccccc';
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.fillText('ヘルプシステムが利用できません', canvas.width / 2, currentY + 50);
            return;
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
    private renderHelpSectionSelector(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number
    ): number {
        const buttonWidth = Math.min(100, width / this.helpSections.length - 10);
        const buttonHeight = 35;
        
        let currentX = x;

        for (let i = 0; i < this.helpSections.length; i++) {
            const section = this.helpSections[i];
            const isActive = this.currentHelpSection === section.id;
            
            // ボタン背景
            context.fillStyle = isActive ? '#4CAF50' : '#2196F3';
            context.fillRect(currentX, y, buttonWidth, buttonHeight);
            
            // ボタン枠線
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(currentX, y, buttonWidth, buttonHeight);
            
            // ボタンテキスト
            context.fillStyle = '#ffffff';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(section.icon, currentX + buttonWidth / 2, y + 12);
            context.fillText(section.name, currentX + buttonWidth / 2, y + 28);
            
            currentX += buttonWidth + 10;
            
            // 改行処理（必要に応じて）
            if (currentX + buttonWidth > x + width) {
                break; // 現在は1行のみ対応
            }
        }
        
        return y + buttonHeight;
    }
    
    /**
     * ヘルプコンテンツを描画
     */
    private renderHelpContent(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        if (!this.helpContent || !this.helpContent[this.currentHelpSection]) {
            // コンテンツがない場合の表示
            context.fillStyle = '#666666';
            context.font = '16px Arial';
            context.textAlign = 'center';
            context.fillText('コンテンツが見つかりません', x + width / 2, y + height / 2);
            return;
        }

        const sectionContent = this.helpContent[this.currentHelpSection];
        let currentY = y + 20;

        // タイトルを描画
        context.fillStyle = '#333333';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText(sectionContent.title, x, currentY);
        currentY += 40;

        // コンテンツを描画
        context.font = '14px Arial';
        context.fillStyle = '#555555';

        const content = Array.isArray(sectionContent.content) 
            ? sectionContent.content 
            : [sectionContent.content];

        const lineHeight = 20;
        for (let i = 0; i < content.length; i++) {
            if (currentY + lineHeight > y + height - 20) break; // 表示領域を超える場合は停止

            const line = content[i];
            
            // 長いテキストの折り返し処理
            const words = line.split(' ');
            let currentLine = '';
            
            for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const metrics = context.measureText(testLine);
                
                if (metrics.width > width - 40 && currentLine) {
                    context.fillText(currentLine, x + 10, currentY);
                    currentY += lineHeight;
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
                
                if (currentY + lineHeight > y + height - 20) break;
            }
            
            if (currentLine && currentY + lineHeight <= y + height - 20) {
                context.fillText(currentLine, x + 10, currentY);
                currentY += lineHeight;
            }
            
            currentY += 5; // 行間
        }
    }
    
    /**
     * ヘルプセクションの変更
     */
    public changeHelpSection(sectionId: string): void {
        if (this.helpSections.some(section => section.id === sectionId)) {
            const oldSection = this.currentHelpSection;
            this.currentHelpSection = sectionId;
            
            // イベント通知
            if (this.eventBus) {
                this.eventBus.emit('helpSectionChanged', {
                    oldSection,
                    newSection: sectionId
                });
            }
            
            // 状態を保存
            this.sceneState.set('currentHelpSection', sectionId);
        }
    }
    
    /**
     * クリック処理
     */
    public handleClick(x: number, y: number): boolean {
        if (!this.isHelpSystemActive) return false;
        
        // セクション選択ボタンのクリック判定
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        const buttonWidth = Math.min(100, contentWidth / this.helpSections.length - 10);
        const buttonHeight = 35;
        const selectorY = this.contentPadding;
        
        if (y >= selectorY && y <= selectorY + buttonHeight) {
            let currentX = this.contentPadding;
            
            for (const section of this.helpSections) {
                if (x >= currentX && x <= currentX + buttonWidth) {
                    this.changeHelpSection(section.id);
                    return true;
                }
                
                currentX += buttonWidth + 10;
                if (currentX + buttonWidth > this.contentPadding + contentWidth) {
                    break;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 基本的なヘルプコンテンツを生成
     */
    private generateBasicHelpContent(): HelpContentMap {
        return {
            overview: {
                title: '実績システム概要',
                content: [
                    'このゲームには豊富な実績システムが用意されています。',
                    '実績を解除することでAPポイントを獲得できます。',
                    '様々なカテゴリの実績にチャレンジしてみましょう。'
                ]
            },
            categories: {
                title: '実績カテゴリ',
                content: [
                    '実績は以下のカテゴリに分類されています：',
                    '• スコア系 - 高スコア達成で解除',
                    '• プレイ系 - ゲームプレイ回数で解除',
                    '• テクニック系 - 特定の技術で解除',
                    '• コレクション系 - アイテムコレクションで解除'
                ]
            },
            progress: {
                title: '進捗確認',
                content: [
                    '実績の進捗は実績タブで確認できます。',
                    '解除済みの実績は緑色で表示されます。',
                    'フィルター機能でカテゴリ別に表示可能です。'
                ]
            },
            rewards: {
                title: '報酬システム',
                content: [
                    '実績を解除すると様々な報酬が獲得できます：',
                    '• APポイント（ショップで使用可能）',
                    '• 特別なアイテム',
                    '• 称号やバッジ'
                ]
            },
            tips: {
                title: '攻略のコツ',
                content: [
                    '効率的に実績を獲得するコツ：',
                    '• 毎日少しずつプレイする',
                    '• 簡単な実績から順番にクリア',
                    '• 進捗を定期的にチェック'
                ]
            },
            faq: {
                title: 'よくある質問',
                content: [
                    'Q: 実績が解除されません',
                    'A: 条件を正確に満たしているか確認してください。',
                    '',
                    'Q: 進捗がリセットされました',
                    'A: データが破損している可能性があります。'
                ]
            }
        };
    }
    
    /**
     * エラー時のヘルプコンテンツを生成
     */
    private generateErrorHelpContent(): HelpContentMap {
        return {
            overview: {
                title: 'エラー',
                content: [
                    'ヘルプコンテンツの読み込みに失敗しました。',
                    'ページをリロードして再度お試しください。'
                ]
            }
        };
    }
    
    /**
     * ヘルプシステムの有効性をチェック
     */
    public isSystemAvailable(): boolean {
        return this.isHelpSystemActive && this.helpContent !== null;
    }
    
    /**
     * 現在のヘルプセクションを取得
     */
    public getCurrentSection(): string {
        return this.currentHelpSection;
    }
    
    /**
     * 利用可能なヘルプセクションを取得
     */
    public getAvailableSections(): HelpSection[] {
        return this.helpSections;
    }
    
    /**
     * ヘルプコンテンツを取得
     */
    public getHelpContent(sectionId?: string): HelpContent | HelpContentMap | null {
        if (!this.helpContent) return null;
        
        if (sectionId) {
            return this.helpContent[sectionId] || null;
        }
        
        return this.helpContent;
    }
    
    /**
     * ヘルプシステムの状態を取得
     */
    public getSystemStatus(): HelpSystemStatus {
        return {
            isActive: this.isHelpSystemActive,
            currentSection: this.currentHelpSection,
            hasContent: this.helpContent !== null,
            availableSections: this.helpSections.length,
            systemType: this.helpSystem ? 'achievement' : 'basic'
        };
    }
    
    /**
     * ヘルプシステムをリセット
     */
    public resetHelpSystem(): void {
        this.currentHelpSection = 'overview';
        this.helpContent = null;
        this.isHelpSystemActive = false;
        
        // システムを再初期化
        this.initialize();
        
        // イベント通知
        if (this.eventBus) {
            this.eventBus.emit('helpSystemReset');
        }
    }
    
    /**
     * クリーンアップ
     */
    public cleanup(): void {
        if (this.eventBus) {
            this.eventBus.off('helpSectionChanged');
            this.eventBus.off('helpSystemToggle');
            this.eventBus.off('helpContentReload');
        }
        
        if (this.helpSystem) {
            // ヘルプシステムのクリーンアップ（必要に応じて）
            this.helpSystem = null;
        }
        
        this.achievementHelpSystem = null;
        this.helpContent = null;
        this.isHelpSystemActive = false;
    }
}