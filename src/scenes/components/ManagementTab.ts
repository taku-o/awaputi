/**
 * ユーザー管理タブコンポーネント
 * UserInfoSceneのユーザー管理・データ管理機能を担当
 */
import { TabComponent } from './TabComponent.js';

interface UserData {
    username: string;
    ap: number;
    tap: number;
    highScore: number;
    unlockedStages: any[];
    ownedItems: any[];
    registrationDate: Date;
    lastPlayDate: Date;
    totalPlayTime: number;
    gamesPlayed: number;
}

interface GameEngine {
    playerData?: {
        getUsername(): string;
        getAP(): number;
        getTotalAP(): number;
        getHighScore(): number;
        getUnlockedStages(): any[];
        getOwnedItems(): any[];
        getRegistrationDate(): Date;
        getLastPlayDate(): Date;
        getTotalPlayTime(): number;
        getGamesPlayed(): number;
        resetAll(): void;
    };
    statisticsManager?: {
        reset(): void;
    };
    achievementManager?: {
        reset(): void;
    };
}

interface EventBus {
    on(event: string, callback: Function): void;
    off(event: string): void;
    emit(event: string, data?: any): void;
}

interface AccessibilitySettings {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
}

interface TabState {
    accessibilitySettings: AccessibilitySettings;
}

export class ManagementTab extends TabComponent {
    // サブコンポーネント
    private userInfoRenderer: UserInfoRenderer | null = null;
    private dataManagementRenderer: DataManagementRenderer | null = null;
    
    // UI状態
    private scrollPosition: number = 0;
    private maxScrollPosition: number = 0;
    
    // レイアウト設定
    private sectionSpacing: number = 40;
    private contentPadding: number = 20;
    private buttonHeight: number = 40;
    private buttonSpacing: number = 15;
    
    // データ
    private userData: UserData | null = null;
    private lastDataUpdate: number = 0;

    constructor(gameEngine: GameEngine, eventBus: EventBus, state: TabState) {
        super(gameEngine, eventBus, state);
    }
    
    /**
     * コンポーネントの初期化
     */
    initialize(): void {
        super.initialize();
        
        // サブコンポーネントを初期化
        this.userInfoRenderer = new UserInfoRenderer(this.gameEngine, this.eventBus, this.state);
        this.dataManagementRenderer = new DataManagementRenderer(this.gameEngine, this.eventBus, this.state);
        
        this.userInfoRenderer.initialize();
        this.dataManagementRenderer.initialize();
        
        // ユーザーデータを読み込み
        this.loadUserData();
    }
    
    /**
     * ユーザーデータを読み込み
     */
    private loadUserData(): void {
        try {
            const playerData = this.gameEngine.playerData;
            if (playerData) {
                this.userData = {
                    username: playerData.getUsername(),
                    ap: playerData.getAP(),
                    tap: playerData.getTotalAP(),
                    highScore: playerData.getHighScore(),
                    unlockedStages: playerData.getUnlockedStages(),
                    ownedItems: playerData.getOwnedItems(),
                    registrationDate: playerData.getRegistrationDate(),
                    lastPlayDate: playerData.getLastPlayDate(),
                    totalPlayTime: playerData.getTotalPlayTime(),
                    gamesPlayed: playerData.getGamesPlayed()
                };
            }
            
            this.lastDataUpdate = Date.now();
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.userData = null;
        }
    }
    
    /**
     * レンダリング処理
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        try {
            if (!this.isActive) return;
            
            // 背景を描画
            this.renderBackground(context, x, y, width, height);
            
            // データを定期更新
            this.updateDataIfNeeded();
            
            let currentY = y + this.contentPadding - this.scrollPosition;
            
            // ユーザー情報セクション
            const userInfoHeight = this.userInfoRenderer!.render(context, x, currentY, width, this.userData);
            currentY += userInfoHeight + this.sectionSpacing;
            
            // データ管理セクション
            const dataManagementHeight = this.dataManagementRenderer!.render(context, x, currentY, width);
            currentY += dataManagementHeight + this.sectionSpacing;
            
            // スクロール制限を更新
            this.updateScrollLimits(currentY + this.scrollPosition, y + height);
            
            // スクロールバーを描画
            this.renderScrollbar(context, x + width - 16, y + this.contentPadding, 16, height - this.contentPadding * 2);
        } catch (error) {
            this.renderErrorFallback(context, x, y, width, height, error as Error);
        }
    }
    
    /**
     * 背景を描画
     */
    private renderBackground(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#F8F9FA';
        context.fillRect(x, y, width, height);
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#000000' : '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }
    
    /**
     * データの定期更新
     */
    private updateDataIfNeeded(): void {
        const now = Date.now();
        if (now - this.lastDataUpdate > 5000) {
            // 5秒間隔で更新
            this.loadUserData();
        }
    }
    
    /**
     * スクロール制限を更新
     */
    private updateScrollLimits(contentHeight: number, viewHeight: number): void {
        this.maxScrollPosition = Math.max(0, contentHeight - viewHeight + this.contentPadding);
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition));
    }
    
    /**
     * スクロールバーを描画
     */
    private renderScrollbar(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        if (this.maxScrollPosition <= 0) return;
        
        // スクロールバー背景
        context.fillStyle = '#E9ECEF';
        context.fillRect(x, y, width, height);
        
        // スクロールバートラック
        const trackHeight = height * (height / (height + this.maxScrollPosition));
        const trackY = y + (this.scrollPosition / this.maxScrollPosition) * (height - trackHeight);

        context.fillStyle = '#6C757D';
        context.fillRect(x + 2, trackY, width - 4, trackHeight);
        
        // スクロールバー枠線
        context.strokeStyle = '#CED4DA';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }
    
    /**
     * クリック処理
     */
    handleClick(x: number, y: number): boolean {
        if (!this.isActive) return false;
        
        // データ管理レンダラーのクリック処理
        if (this.dataManagementRenderer) {
            if (this.dataManagementRenderer.handleClick(x, y)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 入力処理
     */
    handleInput(event: Event): boolean {
        if (!this.isActive) return false;

        if (event.type === 'keydown') {
            const keyEvent = event as KeyboardEvent;
            switch (keyEvent.key) {
                case 'ArrowUp':
                    keyEvent.preventDefault();
                    this.scroll(-30);
                    return true;

                case 'ArrowDown':
                    keyEvent.preventDefault();
                    this.scroll(30);
                    return true;

                case 'PageUp':
                    keyEvent.preventDefault();
                    this.scroll(-200);
                    return true;

                case 'PageDown':
                    keyEvent.preventDefault();
                    this.scroll(200);
                    return true;

                case 'Home':
                    keyEvent.preventDefault();
                    this.scrollPosition = 0;
                    return true;

                case 'End':
                    keyEvent.preventDefault();
                    this.scrollPosition = this.maxScrollPosition;
                    return true;
            }
        } else if (event.type === 'wheel') {
            const wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            this.scroll(wheelEvent.deltaY);
            return true;
        }
        
        return false;
    }
    
    /**
     * スクロール処理
     */
    private scroll(delta: number): void {
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition + delta));
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.isActive) {
            // サブコンポーネントの更新
            if (this.userInfoRenderer) {
                this.userInfoRenderer.update(deltaTime);
            }
            
            if (this.dataManagementRenderer) {
                this.dataManagementRenderer.update(deltaTime);
            }
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        super.cleanup();
        if (this.userInfoRenderer) {
            this.userInfoRenderer.cleanup();
        }
        
        if (this.dataManagementRenderer) {
            this.dataManagementRenderer.cleanup();
        }
    }
}

/**
 * ユーザー情報レンダラーコンポーネント
 * ユーザー基本情報の描画を担当
 */
class UserInfoRenderer {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private state: TabState;
    private isInitialized: boolean = false;
    
    // レイアウト設定
    private readonly sectionPadding: number = 15;
    private readonly lineHeight: number = 25;
    
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: TabState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        this.isInitialized = true;
    }
    
    /**
     * ユーザー情報を描画
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, userData: UserData | null): number {
        if (!userData) {
            return this.renderNoDataMessage(context, x, y, width);
        }
        
        let currentY = y;
        const contentX = x + this.sectionPadding;
        const contentWidth = width - this.sectionPadding * 2;
        
        // セクションタイトル
        context.fillStyle = this.state.accessibilitySettings.highContrast ? '#000000' : '#007BFF';
        context.font = this.state.accessibilitySettings.largeText ? '20px bold sans-serif' : '18px bold sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('ユーザー情報', contentX, currentY);
        currentY += this.lineHeight + 10;
        
        // ユーザー情報を描画
        context.font = this.state.accessibilitySettings.largeText ? '16px sans-serif' : '14px sans-serif';
        context.fillStyle = this.state.accessibilitySettings.highContrast ? '#000000' : '#495057';
        
        const infoItems = [
            { label: 'ユーザー名', value: userData.username },
            { label: 'AP', value: `${userData.ap.toLocaleString()} AP` },
            { label: '累計AP', value: `${userData.tap.toLocaleString()} AP` },
            { label: 'ハイスコア', value: userData.highScore.toLocaleString() },
            { label: '解除ステージ数', value: `${userData.unlockedStages.length} ステージ` },
            { label: '所持アイテム数', value: `${userData.ownedItems.length} アイテム` },
            { label: '登録日', value: this.formatDate(userData.registrationDate) },
            { label: '最終プレイ', value: this.formatDate(userData.lastPlayDate) },
            { label: '累計プレイ時間', value: this.formatPlayTime(userData.totalPlayTime) },
            { label: 'プレイ回数', value: `${userData.gamesPlayed.toLocaleString()} 回` }
        ];
        
        for (const item of infoItems) {
            // ラベル
            context.textAlign = 'left';
            context.fillText(item.label + ':', contentX, currentY);
            
            // 値
            context.textAlign = 'right';
            const truncatedValue = this.truncateText(context, item.value, contentWidth / 2);
            context.fillText(truncatedValue, contentX + contentWidth, currentY);
            
            currentY += this.lineHeight;
        }
        
        return currentY - y + 10;
    }
    
    /**
     * データなしメッセージを描画
     */
    private renderNoDataMessage(context: CanvasRenderingContext2D, x: number, y: number, width: number): number {
        context.fillStyle = this.state.accessibilitySettings.highContrast ? '#000000' : '#6C757D';
        context.font = this.state.accessibilitySettings.largeText ? '18px sans-serif' : '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        const message = 'ユーザーデータを読み込めませんでした';
        context.fillText(message, x + width / 2, y + 50);
        
        return 100;
    }
    
    /**
     * 日付をフォーマット
     */
    private formatDate(date: Date): string {
        if (!date || !(date instanceof Date)) return '不明';
        
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    /**
     * プレイ時間をフォーマット
     */
    private formatPlayTime(milliseconds: number): string {
        if (!milliseconds || milliseconds <= 0) return '0分';
        
        const minutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}日 ${hours % 24}時間`;
        } else if (hours > 0) {
            return `${hours}時間 ${minutes % 60}分`;
        } else {
            return `${minutes}分`;
        }
    }
    
    /**
     * テキストを切り詰め
     */
    private truncateText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
        const textWidth = context.measureText(text).width;
        if (textWidth <= maxWidth) {
            return text;
        }
        
        let truncated = text;
        while (context.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + '...';
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void {
        // 現在は特に処理なし
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.isInitialized = false;
    }
}

/**
 * データ管理レンダラーコンポーネント
 * データのエクスポート・インポート・リセット機能を担当
 */
class DataManagementRenderer {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private state: TabState;
    private isInitialized: boolean = false;
    
    // レイアウト設定
    private readonly sectionPadding: number = 15;
    private readonly buttonHeight: number = 40;
    private readonly buttonSpacing: number = 15;
    private readonly lineHeight: number = 25;
    
    // ボタン座標（クリック判定用）
    private buttonCoordinates: { [key: string]: { x: number; y: number; width: number; height: number } } = {};
    
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: TabState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        this.isInitialized = true;
    }
    
    /**
     * データ管理セクションを描画
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number): number {
        let currentY = y;
        const contentX = x + this.sectionPadding;
        const contentWidth = width - this.sectionPadding * 2;
        
        // セクションタイトル
        context.fillStyle = this.state.accessibilitySettings.highContrast ? '#000000' : '#007BFF';
        context.font = this.state.accessibilitySettings.largeText ? '20px bold sans-serif' : '18px bold sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('データ管理', contentX, currentY);
        currentY += this.lineHeight + 10;
        
        // 説明文
        context.font = this.state.accessibilitySettings.largeText ? '16px sans-serif' : '14px sans-serif';
        context.fillStyle = this.state.accessibilitySettings.highContrast ? '#000000' : '#6C757D';
        context.fillText('ゲームデータのバックアップと復元を行います。', contentX, currentY);
        currentY += this.lineHeight + 20;
        
        // ボタン群を描画
        const buttonWidth = (contentWidth - this.buttonSpacing * 2) / 3;
        
        // エクスポートボタン
        const exportButton = this.renderButton(
            context,
            contentX,
            currentY,
            buttonWidth,
            this.buttonHeight,
            'データエクスポート',
            '#28A745',
            '#FFFFFF'
        );
        this.buttonCoordinates['export'] = exportButton;
        
        // インポートボタン
        const importButton = this.renderButton(
            context,
            contentX + buttonWidth + this.buttonSpacing,
            currentY,
            buttonWidth,
            this.buttonHeight,
            'データインポート',
            '#17A2B8',
            '#FFFFFF'
        );
        this.buttonCoordinates['import'] = importButton;
        
        // リセットボタン
        const resetButton = this.renderButton(
            context,
            contentX + (buttonWidth + this.buttonSpacing) * 2,
            currentY,
            buttonWidth,
            this.buttonHeight,
            'データリセット',
            '#DC3545',
            '#FFFFFF'
        );
        this.buttonCoordinates['reset'] = resetButton;
        
        currentY += this.buttonHeight + 20;
        
        // 注意事項
        context.font = this.state.accessibilitySettings.largeText ? '14px sans-serif' : '12px sans-serif';
        context.fillStyle = this.state.accessibilitySettings.highContrast ? '#000000' : '#FD7E14';
        context.fillText('注意: データリセットは元に戻せません。バックアップを推奨します。', contentX, currentY);
        currentY += this.lineHeight + 10;
        
        return currentY - y;
    }
    
    /**
     * ボタンを描画
     */
    private renderButton(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        bgColor: string,
        textColor: string
    ): { x: number; y: number; width: number; height: number } {
        // 背景
        context.fillStyle = bgColor;
        context.fillRect(x, y, width, height);
        
        // 枠線
        context.strokeStyle = this.state.accessibilitySettings.highContrast ? '#000000' : bgColor;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
        
        // テキスト
        context.fillStyle = this.state.accessibilitySettings.highContrast ? '#000000' : textColor;
        context.font = this.state.accessibilitySettings.largeText ? '16px bold sans-serif' : '14px bold sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, x + width / 2, y + height / 2);
        
        return { x, y, width, height };
    }
    
    /**
     * クリック処理
     */
    handleClick(x: number, y: number): boolean {
        for (const [action, coords] of Object.entries(this.buttonCoordinates)) {
            if (x >= coords.x && x <= coords.x + coords.width &&
                y >= coords.y && y <= coords.y + coords.height) {
                
                this.executeAction(action);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * アクションを実行
     */
    private executeAction(action: string): void {
        switch (action) {
            case 'export':
                this.handleDataExport();
                break;
            case 'import':
                this.handleDataImport();
                break;
            case 'reset':
                this.handleDataReset();
                break;
        }
    }
    
    /**
     * データエクスポート処理
     */
    private handleDataExport(): void {
        try {
            if (this.gameEngine.playerData) {
                // エクスポート処理をイベントバスで通知
                this.eventBus.emit('dataExportRequested');
                console.log('Data export requested');
            }
        } catch (error) {
            console.error('Data export failed:', error);
        }
    }
    
    /**
     * データインポート処理
     */
    private handleDataImport(): void {
        try {
            // インポート処理をイベントバスで通知
            this.eventBus.emit('dataImportRequested');
            console.log('Data import requested');
        } catch (error) {
            console.error('Data import failed:', error);
        }
    }
    
    /**
     * データリセット処理
     */
    private handleDataReset(): void {
        if (confirm('本当にすべてのデータをリセットしますか？この操作は元に戻せません。')) {
            try {
                if (this.gameEngine.playerData) {
                    this.gameEngine.playerData.resetAll();
                }
                
                if (this.gameEngine.statisticsManager) {
                    this.gameEngine.statisticsManager.reset();
                }
                
                if (this.gameEngine.achievementManager) {
                    this.gameEngine.achievementManager.reset();
                }
                
                // リセット完了をイベントバスで通知
                this.eventBus.emit('dataResetCompleted');
                console.log('Data reset completed');
                
                alert('データをリセットしました。ページをリロードしてください。');
            } catch (error) {
                console.error('Data reset failed:', error);
                alert('データリセットに失敗しました。');
            }
        }
    }
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void {
        // 現在は特に処理なし
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.buttonCoordinates = {};
        this.isInitialized = false;
    }
}