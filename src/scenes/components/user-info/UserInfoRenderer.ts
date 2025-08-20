/**
 * UserInfoRenderer.ts
 * ユーザー情報シーンのレンダリングコンポーネント
 * UserInfoSceneから分離されたレンダリング機能を提供
 */

// レイアウト情報のインターフェース
interface Layout { isMobile: boolean,
    contentPadding: number,
    tabHeight: number,
    headerHeight: number,
    fontSize: {
        title: number,
        tab: number,
        content: number; }
    };
}

// タブ情報のインターフェース
interface Tab { id: string,
    name: string,
    icon?: string; }
}

// ヒット領域のインターフェース
interface HitAreas { tabs: TabArea[],
    backButton: ButtonInfo | null; }
}

// タブ領域のインターフェース
interface TabArea { id: string,
    x: number,
    y: number,
    width: number,
    height: number; }
}

// ボタン情報のインターフェース
interface ButtonInfo { x: number,
    y: number,
    width: number,
    height: number; }
}

// ゲームエンジンのインターフェース
interface GameEngine { canvas: HTMLCanvasElement;
    }
}

// イベントバスのインターフェース
interface EventBus { on(event: string, callback: (data?: any) => void): void;
    off(event: string, callback?: (data?: any) => void): void;
    emit(event: string, data?: any): void; }
}

// シーン状態のインターフェース
interface SceneState { get(key: string): any,
    set(key: string, value: any): void; }
}

// タブマネージャーのインターフェース
interface TabManager { renderTabHeaders(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void,
    renderTabContent(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void,
    getTabs(): Tab[];
    }
}

// プロフィールマネージャーのインターフェース
interface ProfileManager { // プロフィール関連のメソッド }
}

// ヘルプシステムのインターフェース
interface HelpSystem { render(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void; }
}

// ダイアログマネージャーのインターフェース
interface DialogManager { render(context: CanvasRenderingContext2D): void, }
}

export class UserInfoRenderer {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private sceneState: SceneState;
    // レンダリング設定
    private tabHeight: number = 60;
    private headerHeight: number = 120;
    private contentPadding: number = 20;
    // キャッシュ
    private cachedElements: Map<string, any> = new Map();
    private lastRenderHash: string | null = null;
    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {

        this.gameEngine = gameEngine;
        this.eventBus = eventBus;

    }
    }
        this.sceneState = sceneState; }
    }
    
    /**
     * メインレンダリング処理
     */
    public render(;
        context: CanvasRenderingContext2D,
        tabManager: TabManager,
        profileManager: ProfileManager,
    );
        helpSystem: HelpSystem);
        dialogManager: DialogManager;
    ): void { try {
            const canvas = context.canvas,
            
            // 背景をクリア
            this.renderBackground(context, canvas);
            
            // タイトルをレンダリング
            this.renderTitle(context, canvas);
            
            // タブヘッダーをレンダリング
            if(tabManager) {
                
            }
                this.renderTabs(context, canvas, tabManager); }
            }
            
            // メインコンテンツをレンダリング
            if (tabManager) { this.renderContent(context, canvas, tabManager); }
            }
            
            // エラーメッセージがある場合は表示
            if(this.sceneState.get('errorMessage') { this.renderErrorMessage(context, canvas); }
            }
            
            // 戻るボタンをレンダリング
            this.renderBackButton(context, canvas);
            
            // ヘルプシステムをレンダリング
            if (helpSystem) { helpSystem.render(context, canvas); }
            }
            
            // ダイアログをレンダリング'
            if (dialogManager) { dialogManager.render(context);' }'
            } catch (error') { ''
            console.error('UserInfoRenderer render error:', error);
            this.renderErrorState(context); }
        }
    }
    
    /**
     * 背景をレンダリング
     */'
    private renderBackground(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void { // グラデーション背景''
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height');''
        gradient.addColorStop(0, '#1a1a2e'');''
        gradient.addColorStop(1, '#16213e');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height); }
    }
    
    /**
     * タイトルをレンダリング'
     */''
    private renderTitle(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement'): void { const titleY = 30;'
        '';
        context.fillStyle = '#FFFFFF';''
        context.font = 'bold 32px Arial';''
        context.textAlign = 'center';''
        context.textBaseline = 'top';''
        context.fillText('ユーザー情報', canvas.width / 2, titleY');
        
        // タイトル下のライン'
        const lineY = titleY + 50;''
        context.strokeStyle = '#4A90E2';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(canvas.width * 0.2, lineY);
        context.lineTo(canvas.width * 0.8, lineY);
        context.stroke(); }
    }
    
    /**
     * タブヘッダーをレンダリング
     */
    private renderTabs(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tabManager: TabManager): void { const headerX = this.contentPadding;
        const headerY = this.headerHeight;
        const headerWidth = canvas.width - (this.contentPadding * 2);
        const headerHeight = this.tabHeight;
        
        tabManager.renderTabHeaders(context, headerX, headerY, headerWidth, headerHeight); }
    }
    
    /**
     * メインコンテンツをレンダリング
     */
    private renderContent(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tabManager: TabManager): void { const contentX = this.contentPadding;'
        const contentY = this.headerHeight + this.tabHeight;''
        const contentWidth = canvas.width - (this.contentPadding * 2');
        const contentHeight = canvas.height - contentY - 80; // 戻るボタンのスペースを考慮
        ';
        // コンテンツ背景''
        context.fillStyle = '#2A2A2A';''
        context.fillRect(contentX, contentY, contentWidth, contentHeight');
        ';
        // コンテンツ境界線''
        context.strokeStyle = '#444444';
        context.lineWidth = 1;
        context.strokeRect(contentX, contentY, contentWidth, contentHeight);
        
        // タブコンテンツをレンダリング
        tabManager.renderTabContent(context, contentX + 10, contentY + 10, contentWidth - 20, contentHeight - 20); }
    }
    
    /**
     * 戻るボタンをレンダリング'
     */''
    private renderBackButton(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement'): void { const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonX = this.contentPadding;
        const buttonY = canvas.height - 60;
        ';
        // ボタン背景''
        context.fillStyle = '#4A90E2';''
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight');
        ';
        // ボタン境界線''
        context.strokeStyle = '#66A3E8';'
        context.lineWidth = 2;''
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight');
        ';
        // ボタンテキスト''
        context.fillStyle = '#FFFFFF';''
        context.font = '16px Arial';''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';''
        context.fillText('戻る', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2');
        ';
        // 戻るボタンの座標を保存''
        this.sceneState.set('backButton', {
            x: buttonX,);
            y: buttonY);
            width: buttonWidth,);
            height: buttonHeight); }
    }
    
    /**
     * エラーメッセージをレンダリング'
     */''
    private renderErrorMessage(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement'): void { ''
        const errorMessage = this.sceneState.get('errorMessage');
        if (!errorMessage) return;
        
        const messageX = canvas.width / 2;
        const messageY = canvas.height - 120;
        
        // エラー背景'
        const padding = 20;''
        const textWidth = Math.min(400, canvas.width - 40');
        const textHeight = 60;'
        '';
        context.fillStyle = 'rgba(255, 0, 0, 0.8')';'
        context.fillRect(messageX - textWidth / 2 - padding, messageY - textHeight / 2 - padding / 2);''
                        textWidth + padding * 2, textHeight + padding');
        ';
        // エラーテキスト''
        context.fillStyle = '#FFFFFF';''
        context.font = '16px Arial';''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';
        context.fillText(errorMessage, messageX, messageY); }
    }
    
    /**
     * エラー状態をレンダリング'
     */''
    private renderErrorState(context: CanvasRenderingContext2D'): void { const canvas = context.canvas;
        ';
        // 背景''
        context.fillStyle = '#1a1a2e';''
        context.fillRect(0, 0, canvas.width, canvas.height');
        ';
        // エラーメッセージ''
        context.fillStyle = '#FF6B6B';''
        context.font = '24px Arial';''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';''
        context.fillText('レンダリングエラーが発生しました', canvas.width / 2, canvas.height / 2');
        ';
        // サブメッセージ''
        context.fillStyle = '#CCCCCC';''
        context.font = '16px Arial';''
        context.fillText('ページを再読み込みしてください', canvas.width / 2, canvas.height / 2 + 40); }
    }
    
    /**
     * レスポンシブレイアウトの計算
     */
    public calculateLayout(canvas: HTMLCanvasElement): Layout { const width = canvas.width;
        const height = canvas.height;
        
        // モバイル判定
        const isMobile = width < 768;
        
        return { isMobile,
            contentPadding: isMobile ? 10 : this.contentPadding,
            tabHeight: isMobile ? 50 : this.tabHeight,
            headerHeight: isMobile ? 100 : this.headerHeight,
            fontSize: {
                title: isMobile ? 24 : 32,
                tab: isMobile ? 14 : 16, };
                content: isMobile ? 12 : 14 }
            }
        },
    }
    
    /**
     * ヒット領域の計算
     */'
    public calculateHitAreas(canvas: HTMLCanvasElement, tabManager: TabManager): HitAreas { ''
        const layout = this.calculateLayout(canvas');
        const hitAreas: HitAreas = {'
            tabs: [],'';
            backButton: this.sceneState.get('backButton') || null }
        },
        
        // タブのヒット領域
        const tabs = tabManager.getTabs();
        const headerX = layout.contentPadding;
        const headerY = layout.headerHeight;
        const headerWidth = canvas.width - (layout.contentPadding * 2);
        const tabWidth = headerWidth / tabs.length;
        
        tabs.forEach((tab, index) => {  hitAreas.tabs.push({
                id: tab.id,
                x: headerX + index * tabWidth,);
                y: headerY);
                width: tabWidth,) }
                height: layout.tabHeight); }
            };
        };
        
        return hitAreas;
    }
    
    /**
     * レンダリングキャッシュのクリア
     */
    public clearCache(): void { this.cachedElements.clear();
        this.lastRenderHash = null; }
    }
    
    /**
     * リソースのクリーンアップ
     */'
    public dispose(): void { ''
        this.clearCache('')';
        console.log('UserInfoRenderer disposed''); }'
    }''
}