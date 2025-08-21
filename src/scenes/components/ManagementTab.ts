/**
 * ユーザー管理タブコンポーネント
 * UserInfoSceneのユーザー管理・データ管理機能を担当
 */
import { TabComponent  } from './TabComponent.js';

interface UserData { username: string,
    ap: number;
    tap: number;
    highScore: number;
    unlockedStages: any[];
    ownedItems: any[];
    registrationDate: Date;
    lastPlayDate: Date;
    totalPlayTime: number;
    gamesPlayed: number;
interface GameEngine { playerData?: {
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
        resetAll(): void;;
    statisticsManager?: { reset(): void;;
    achievementManager?: { reset(): void;

interface EventBus { on(event: string, callback: Function): void,
    off(event: string): void;
    emit(event: string, data?: any): void;
interface AccessibilitySettings { highContrast: boolean,
    largeText: boolean;
    reducedMotion: boolean;
interface TabState {
    accessibilitySettings: AccessibilitySettings;
export class ManagementTab extends TabComponent { // サブコンポーネント
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
    private, lastDataUpdate: number = 0,
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: TabState) {
    
}
        super(gameEngine, eventBus, state); }
    /**
     * コンポーネントの初期化
     */
    initialize(): void { super.initialize(),
        
        // サブコンポーネントを初期化
        this.userInfoRenderer = new UserInfoRenderer(this.gameEngine; this.eventBus, this.state),
        this.dataManagementRenderer = new DataManagementRenderer(this.gameEngine; this.eventBus, this.state),
        
        this.userInfoRenderer.initialize(),
        this.dataManagementRenderer.initialize(),
        
        // ユーザーデータを読み込み
        this.loadUserData() }
    /**
     * ユーザーデータを読み込み
     */
    private loadUserData(): void { try {
            const playerData = this.gameEngine.playerData,
            if (playerData) {
                this.userData = {
                    username: playerData.getUsername(),
                    ap: playerData.getAP(),
                    tap: playerData.getTotalAP(),
                    highScore: playerData.getHighScore(),
                    unlockedStages: playerData.getUnlockedStages(),
                    ownedItems: playerData.getOwnedItems(),
                    registrationDate: playerData.getRegistrationDate(),
                    lastPlayDate: playerData.getLastPlayDate(
    totalPlayTime: playerData.getTotalPlayTime( }
                    gamesPlayed: playerData.getGamesPlayed(); 
    }
            ';'

            this.lastDataUpdate = Date.now();'} catch (error) {'
            console.error('Failed to load user data:', error),
            this.userData = null }
    }
    
    /**
     * レンダリング処理
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { try {
            if (!this.isActive) return,
            
            // 背景を描画
            this.renderBackground(context, x, y, width, height),
            
            // データを定期更新
            this.updateDataIfNeeded(),
            
            let currentY = y + this.contentPadding - this.scrollPosition,
            
            // ユーザー情報セクション
            const userInfoHeight = this.userInfoRenderer!.render(
                context, ,
                x + this.contentPadding ),
                currentY,
                width - this.contentPadding * 2),
                this.userData),
            currentY += userInfoHeight + this.sectionSpacing,
            
            // データ管理セクション
            const dataManagementHeight = this.dataManagementRenderer!.render(
                context,
                x + this.contentPadding),
                currentY),
                width - this.contentPadding * 2),
            currentY += dataManagementHeight,
            
            // スクロールバーを描画
            this.updateScrollLimits(currentY + this.scrollPosition, y + height),
            this.renderScrollbar(context, x + width - 16, y, 16, height) } catch (error) { this.renderErrorFallback(context, x, y, width, height, error) }
    }
    
    /**
     * 背景を描画
     */''
    private renderBackground(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { ''
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#F8F9FA',
        context.fillRect(x, y, width, height),

        context.strokeStyle = this.accessibilitySettings.highContrast ? '#000000' : '#DEE2E6',
        context.lineWidth = 1,
        context.strokeRect(x, y, width, height) }
    /**
     * データの定期更新
     */
    private updateDataIfNeeded(): void { const now = Date.now(),
        if (now - this.lastDataUpdate > 5000) {
            // 5秒間隔
        }
            this.loadUserData(); }
    }
    
    /**
     * スクロール制限を更新
     */
    private updateScrollLimits(contentHeight: number, viewHeight: number): void { this.maxScrollPosition = Math.max(0, contentHeight - viewHeight + this.contentPadding),
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition) }
    /**
     * スクロールバーを描画
     */
    private renderScrollbar(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { ''
        if(this.maxScrollPosition <= 0) return,
        ','
        // スクロールバー背景
        context.fillStyle = '#E9ECEF',
        context.fillRect(x, y, width, height),
        
        // スクロールバートラック
        const trackHeight = height * (height / (height + this.maxScrollPosition)),
        const trackY = y + (this.scrollPosition / this.maxScrollPosition) * (height - trackHeight'),'

        context.fillStyle = '#6C757D',
        context.fillRect(x + 2, trackY, width - 4, trackHeight),
        ','
        // スクロールバー枠線
        context.strokeStyle = '#CED4DA',
        context.lineWidth = 1,
        context.strokeRect(x, y, width, height) }
    /**
     * クリック処理
     */
    handleClick(x: number, y: number): boolean { if (!this.isActive) return false,
        
        // データ管理セクションのクリック処理
        const relativeY = y + this.scrollPosition,
        
        // ユーザー情報セクションの高さを計算
        const userInfoHeight = this.estimateUserInfoHeight(),
        const dataManagementY = userInfoHeight + this.sectionSpacing + this.contentPadding,
        
        if (relativeY >= dataManagementY) {
        
            const dataY = relativeY - dataManagementY }
            return this.dataManagementRenderer!.handleClick(x, dataY);
        return false;
    }
    
    /**
     * 入力処理
     */
    handleInput(event: KeyboardEvent | WheelEvent): boolean { ''
        if(!this.isActive) return false,

        if (event.type === 'keydown''
            const keyEvent = event as KeyboardEvent,
            switch(keyEvent.key) {''
                case 'ArrowUp':','
                    event.preventDefault(),
                    this.scroll(-30),
                    return true,

                case 'ArrowDown':','
                    event.preventDefault(),
                    this.scroll(30),
                    return true,

                case 'PageUp':','
                    event.preventDefault(),
                    this.scroll(-200),
                    return true,

                case 'PageDown':','
                    event.preventDefault(),
                    this.scroll(200),
                    return true,

                case 'Home':','
                    event.preventDefault('''
                case 'End': ' }''
                    event.preventDefault() }

        } else if (event.type === 'wheel) { const wheelEvent = event as WheelEvent,'
            event.preventDefault(),
            this.scroll(wheelEvent.deltaY),
            return true }
        return false;
    }
    
    /**
     * スクロール処理
     */
    private scroll(delta: number): void { this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition + delta) }
    /**
     * ユーザー情報セクションの高さを推定
     */
    private estimateUserInfoHeight(): number { // 基本的な高さ + データ行数 * 行高
        return 120 + (this.userData ? Object.keys(this.userData).length * 25 : 0) }
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void { super.update(deltaTime),
        
        if (this.isActive) {
        
            // サブコンポーネントの更新
            if (this.userInfoRenderer) {
    
}
                this.userInfoRenderer.update(deltaTime); }
            if (this.dataManagementRenderer) { this.dataManagementRenderer.update(deltaTime) }
        }
    /**
     * クリーンアップ
     */
    cleanup(): void { super.cleanup(),
        
        if (this.userInfoRenderer) {
    
}
            this.userInfoRenderer.cleanup(); }
        if (this.dataManagementRenderer) { this.dataManagementRenderer.cleanup() }
        this.userData = null;
        this.scrollPosition = 0;
        this.maxScrollPosition = 0;
    }
/**
 * ユーザー情報レンダラー
 * 現在のユーザー情報を表示
 */
class UserInfoRenderer { private gameEngine: GameEngine
    private eventBus: EventBus;
    private state: TabState;
    private, textSettings: {
        titleFont: string,
        labelFont: string,
        valueFont: string,
        titleColor: string,
        labelColor: string,
    valueColor: string,;
    
    private isInitialized: boolean = false,

    constructor(gameEngine: GameEngine, eventBus: EventBus, state: TabState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        ','

        this.textSettings = {''
            titleFont: '18px bold sans-serif';
            labelFont: '14px sans-serif',
            valueFont: '14px bold sans-serif',
            titleColor: '#212529',
            labelColor: '#6C757D' }

            valueColor: '#495057' ;
    } }
    
    /**
     * 初期化
     */
    initialize(): void { this.applyAccessibilitySettings(),
        this.isInitialized = true }
    /**
     * アクセシビリティ設定を適用
     */
    private applyAccessibilitySettings(): void {
        const settings = this.state.accessibilitySettings || {};

        if (settings.largeText) {

            this.textSettings.titleFont = '22px bold sans-serif',
            this.textSettings.labelFont = '16px sans-serif' }

            this.textSettings.valueFont = '16px bold sans-serif'; }
        }

        if (settings.highContrast) {

            this.textSettings.titleColor = '#000000',
            this.textSettings.labelColor = '#000000' }

            this.textSettings.valueColor = '#000000'; }
    }
    
    /**
     * ユーザー情報を描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param userData - ユーザーデータ
     * @returns 描画した高さ'
     */''
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, userData: UserData | null): number { let currentY = y,
        
        // セクションタイトル
        context.font = this.textSettings.titleFont,
        context.fillStyle = this.textSettings.titleColor,
        context.textAlign = 'left',
        context.textBaseline = 'top',
        context.fillText('現在のユーザー情報', x, currentY),
        currentY += 35,

        if (!userData) {
            // データがない場合
            context.font = this.textSettings.labelFont,
            context.fillStyle = this.textSettings.labelColor,
            context.fillText('ユーザーデータを読み込み中...', x + 10, currentY' }'
            return currentY - y + 25;
        // ユーザー情報項目
        const infoItems = [';'
            { label: 'ユーザー名', value: userData.username || '(未設定')', key: 'username'
            },''
            { label: 'AP(Awaputi, Points)', value: userData.ap?.toLocaleString() || '0', key: 'ap'
            },''
            { label: 'TAP(Total, AP)', value: userData.tap?.toLocaleString() || '0', key: 'tap'
            },''
            { label: 'ハイスコア', value: userData.highScore?.toLocaleString() || '0', key: 'highScore'
            },''
            { label: 'アンロック済みステージ', value: userData.unlockedStages?.length || '0', key: 'stages'
            },''
            { label: '所有アイテム数', value: userData.ownedItems?.length || '0', key: 'items'
            },''
            { label: '総プレイ時間', value: this.formatPlayTime(userData.totalPlayTime), key: 'playTime'
            },]'
            { label: 'プレイ回数', value: userData.gamesPlayed?.toLocaleString() || '0', key: 'gamesPlayed'
            }]
        ];
        
        const itemHeight = 25;
        const maxWidth = width - 20;

        for (const item of infoItems) {
            // ラベル
            context.font = this.textSettings.labelFont,
            context.fillStyle = this.textSettings.labelColor,
            context.textAlign = 'left',
            context.fillText(item.label + ':', x + 10, currentY','
            
            // 値
            context.font = this.textSettings.valueFont,
            context.fillStyle = this.textSettings.valueColor,
            context.textAlign = 'right',

            const valueText = this.truncateText(context, item.value, maxWidth / 2),
            context.fillText(valueText, x + width - 10, currentY) }
            currentY += itemHeight; }
        // 境界線
        currentY += 10;
        context.strokeStyle = this.state.accessibilitySettings.highContrast ? '#000000' : '#DEE2E6';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x + 10, currentY);
        context.lineTo(x + width - 10, currentY);
        context.stroke();
        
        return currentY - y + 10;
    }
    
    /**
     * プレイ時間をフォーマット
     * @param milliseconds - ミリ秒
     * @returns フォーマットされた時間
     */'
    private formatPlayTime(milliseconds: number): string { ''
        if(!milliseconds || milliseconds <= 0) return '0分',
        
        const minutes = Math.floor(milliseconds / 60000),
        const hours = Math.floor(minutes / 60),
        const days = Math.floor(hours / 24),
        
        if (days > 0) { }
            return `${days}日 ${hours % 24}時間`;
        } else if (hours > 0) {
            return `${hours}時間 ${minutes % 60}分`;
        } else {  }
            return `${minutes}分`;
    /**
     * テキストを切り詰め
     * @param context - Canvas描画コンテキスト
     * @param text - テキスト
     * @param maxWidth - 最大幅
     * @returns 切り詰められたテキスト
     */'
    private truncateText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string { const textWidth = context.measureText(text).width,
        if (textWidth <= maxWidth) {
    
}
            return text;
        ';'

        let truncated = text;
        while(context.measureText(truncated + '...).width > maxWidth && truncated.length > 0' { ''
            truncated = truncated.slice(0, -1) }

        return truncated + '...';
    
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void { // 現在は特に処理なし }
    /**
     * クリーンアップ
     */
    cleanup(): void { this.isInitialized = false }

/**
 * データ管理レンダラー
 * データのエクスポート・インポート・管理機能
 */
interface Button { id: string,
    label: string;
    color: string;
    description: string;
class DataManagementRenderer { private gameEngine: GameEngine
    private eventBus: EventBus;
    private state: TabState;
    private, textSettings: {
        titleFont: string,
        labelFont: string,
        buttonFont: string,
        titleColor: string,
        labelColor: string,
    buttonTextColor: string,;
    
    // ボタン設定
    private buttons: Button[],
    private buttonHeight: number = 40,
    private buttonSpacing: number = 15,
    private hoveredButton: number = -1,
    private, isInitialized: boolean = false,

    constructor(gameEngine: GameEngine, eventBus: EventBus, state: TabState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        ','

        this.textSettings = {''
            titleFont: '18px bold sans-serif';
            labelFont: '14px sans-serif',
            buttonFont: '14px bold sans-serif',
            titleColor: '#212529',
            labelColor: '#6C757D' }

            buttonTextColor: '#FFFFFF' ;
    },
        
        // ボタン設定
        this.buttons = [{;
                id: 'username';
                label: 'ユーザー名変更';
                color: '#007BFF';
                description: 'ユーザー名を変更します'
            };
            { ''
                id: 'export',
                label: 'データエクスポート',
                color: '#28A745',
                description: 'ゲームデータをエクスポートします'
            };
            { ''
                id: 'import',
                label: 'データインポート',
                color: '#FD7E14',
                description: 'ゲームデータをインポートします'
            };
            { ''
                id: 'statsExport',
                label: '統計エクスポート',
                color: '#6F42C1',
                description: '統計データをエクスポートします'
            };
            { ''
                id: 'reset',
                label: 'データリセット',
                color: '#DC3545',
                description: '全データをリセットします（要注意）'
            }]
            }]
        ];
    }
    
    /**
     * 初期化
     */
    initialize(): void { this.applyAccessibilitySettings(),
        this.isInitialized = true }
    /**
     * アクセシビリティ設定を適用
     */
    private applyAccessibilitySettings(): void {
        const settings = this.state.accessibilitySettings || {};

        if (settings.largeText) {

            this.textSettings.titleFont = '22px bold sans-serif',
            this.textSettings.labelFont = '16px sans-serif' }

            this.textSettings.buttonFont = '16px bold sans-serif'; }
        }

        if (settings.highContrast) {

            this.textSettings.titleColor = '#000000',
            this.textSettings.labelColor = '#000000' }

            this.textSettings.buttonTextColor = '#FFFFFF'; }
    }
    
    /**
     * データ管理セクションを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @returns 描画した高さ'
     */''
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number): number { let currentY = y,
        
        // セクションタイトル
        context.font = this.textSettings.titleFont,
        context.fillStyle = this.textSettings.titleColor,
        context.textAlign = 'left',
        context.textBaseline = 'top',
        context.fillText('データ管理', x, currentY','
        currentY += 35,
        
        // 説明テキスト
        context.font = this.textSettings.labelFont,
        context.fillStyle = this.textSettings.labelColor,
        context.fillText('ゲームデータの管理と設定を行えます。', x + 10, currentY),
        currentY += 30,
        
        // ボタンを描画
        const buttonWidth = Math.min(200, width - 40),
        
        for(let, i = 0, i < this.buttons.length, i++) {
        
            const button = this.buttons[i],
            const buttonX = x + 20,
            const buttonY = currentY,
            
            this.renderButton(context, buttonX, buttonY, buttonWidth, this.buttonHeight, button, i) }
            currentY += this.buttonHeight + this.buttonSpacing; }
        return currentY - y;
    }
    
    /**
     * ボタンを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     * @param button - ボタン情報
     * @param index - ボタンインデックス
     */
    private renderButton(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, button: Button, index: number): void { const isHovered = this.hoveredButton === index;
        const cornerRadius = 6,
        
        // ボタン背景色を決定
        let backgroundColor = button.color,
        if (isHovered) {
    
}
            backgroundColor = this.lightenColor(button.color, 0.1); }
        ;
        // 高コントラストモードの調整
        if (this.state.accessibilitySettings.highContrast) {', ' }

            backgroundColor = '#000000'; }
        // ボタン背景を描画
        context.fillStyle = backgroundColor;
        this.roundRect(context, x, y, width, height, cornerRadius);
        context.fill();
        
        // ボタン枠線を描画
        context.strokeStyle = this.darkenColor(button.color, 0.2);
        context.lineWidth = 1;
        this.roundRect(context, x, y, width, height, cornerRadius);
        context.stroke();
        
        // ホバー時の効果
        if (isHovered) {
            context.strokeStyle = this.darkenColor(button.color, 0.3),
            context.lineWidth = 2,
            this.roundRect(context, x, y, width, height, cornerRadius),
            context.stroke('',
        context.textAlign = 'center',
        context.textBaseline = 'middle')
        context.fillText(button.label, x + width / 2, y + height / 2),
        ','
        // 説明テキストを描画
        if (button.description) {
            context.fillStyle = this.textSettings.labelColor,
            context.font = '12px sans-serif',
            context.textAlign = 'left',
            context.textBaseline = 'top' }
            context.fillText(button.description, x + width + 15, y + height / 2 - 6); }
    }
    
    /**
     * クリック処理
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @returns クリックが処理された場合true
     */
    handleClick(x: number, y: number): boolean { const buttonWidth = 200,
        const buttonX = 20,
        let buttonY = 65, // タイトル + 説明文の高さ
        
        for(let, i = 0, i < this.buttons.length, i++) {
        
            const button = this.buttons[i],
            
            if (x >= buttonX && x <= buttonX + buttonWidth && ,
                y >= buttonY && y <= buttonY + this.buttonHeight) {
                
                this.handleButtonClick(button.id) }
                return true;
            buttonY += this.buttonHeight + this.buttonSpacing;
        }
        
        return false;
    }
    
    /**
     * ボタンクリック処理
     * @param buttonId - ボタンID
     */
    private async handleButtonClick(buttonId: string): Promise<void> { try {'
            switch(buttonId) {

                case 'username':','
                    await (this.gameEngine, as any).userInfoScene?.showUsernameChangeDialog()','
                case 'export':')',
                    await (this.gameEngine, as any).userInfoScene?.showDataExportDialog()','
                case 'import':')',
                    await (this.gameEngine, as any).userInfoScene?.showDataImportDialog()','
                case 'statsExport':')',
                    await (this.gameEngine, as any).userInfoScene?.showStatisticsExportDialog('',
                case 'reset':','
                    await this.handleDataReset() }

                    console.warn('Unknown button clicked:', buttonId'; }'

            } catch (error) {
            console.error('Button click error:', error','
            this.eventBus.emit('component-error', {''
                component: 'DataManagementRenderer',','
                operation: 'handleButtonClick'),
                error }';'
        }
    /**
     * データリセット処理'
     */''
    private async handleDataReset()';'
        const confirmed = confirm('本当に全データをリセットしますか？この操作は元に戻せません。);'
        
        if (confirmed) {
        
            try {
                if (this.gameEngine.playerData) {
    
}
                    this.gameEngine.playerData.resetAll(); }
                if (this.gameEngine.statisticsManager) { this.gameEngine.statisticsManager.reset() }
                if (this.gameEngine.achievementManager) {
                ','

                    ' }'

                    this.gameEngine.achievementManager.reset() }

                this.eventBus.emit('data-reset', { timestamp: Date.now( });

                alert('データがリセットされました。';} catch (error) {
                console.error('Data reset error:', error','
                alert('データリセット中にエラーが発生しました。) }'
        }
    /**
     * ホバー処理
     * @param x - マウスX座標
     * @param y - マウスY座標
     */
    handleHover(x: number, y: number): void { const buttonWidth = 200,
        const buttonX = 20,
        let buttonY = 65,
        
        this.hoveredButton = -1;
        
        for(let, i = 0, i < this.buttons.length, i++) {
        
            if (x >= buttonX && x <= buttonX + buttonWidth && ,
                y >= buttonY && y <= buttonY + this.buttonHeight) {
                this.hoveredButton = i }
                break; }
            buttonY += this.buttonHeight + this.buttonSpacing;
        }
    /**
     * 色を明るくする
     * @param color - 元の色
     * @param amount - 明るくする量(0-1)
     * @returns 明るくした色'
     */''
    private lightenColor(color: string, amount: number): string { ''
        const usePound = color[0] === '#',
        const col = usePound ? color.slice(1) : color,
        const num = parseInt(col, 16),
        let r = (num >> 16) + amount * 255,

        let g = (num >> 8 & 0x00FF) + amount * 255,
        let b = (num & 0x0000FF') + amount * 255,'
        
        r = r > 255 ? 255 : r,
        g = g > 255 ? 255 : g,
        b = b > 255 ? 255 : b,

        return (usePound ? '#' : ') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0) }
    /**
     * 色を暗くする
     * @param color - 元の色
     * @param amount - 暗くする量(0-1)
     * @returns 暗くした色'
     */''
    private darkenColor(color: string, amount: number): string { ''
        const usePound = color[0] === '#',
        const col = usePound ? color.slice(1) : color,
        const num = parseInt(col, 16),
        let r = (num >> 16) * (1 - amount),

        let g = (num >> 8 & 0x00FF) * (1 - amount),
        let b = (num & 0x0000FF) * (1 - amount'),'

        return (usePound ? '#' : ') + (Math.round(r) << 16 | Math.round(g) << 8 | Math.round(b).toString(16).padStart(6, '0) }
    /**
     * 角丸矩形を描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     * @param radius - 角の半径
     */
    private roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void { context.beginPath(),
        context.moveTo(x + radius, y),
        context.lineTo(x + width - radius, y),
        context.quadraticCurveTo(x + width, y, x + width, y + radius),
        context.lineTo(x + width, y + height - radius),
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height),
        context.lineTo(x + radius, y + height),
        context.quadraticCurveTo(x, y + height, x, y + height - radius),
        context.lineTo(x, y + radius),
        context.quadraticCurveTo(x, y, x + radius, y),
        context.closePath() }
    /**
     * フレーム更新処理
     */
    update(deltaTime: number): void { // 現在は特に処理なし }
    /**
     * クリーンアップ
     */''
    cleanup();