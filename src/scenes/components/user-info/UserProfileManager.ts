/**
 * UserProfileManager.ts
 * ユーザープロフィール管理コンポーネント
 * UserInfoSceneから分離されたプロフィール関連機能を提供
 */

// ユーザーデータのインターフェース
interface UserData {
    username: string;
    totalAP: number;
    currentAP: number;
    gamesPlayed: number;
    totalPlayTime: number;
    highestScore: number;
    level: number;
    totalScore?: number;
    gamesWon?: number;
}

// プロフィール統計のインターフェース
interface ProfileStatistics {
    username: string;
    level: number;
    totalAP: number;
    currentAP: number;
    gamesPlayed: number;
    totalPlayTime: number;
    highestScore: number;
    averageScore: number;
    winRate: number;
}

// プレイヤーデータのインターフェース
interface PlayerData {
    username?: string;
    totalAP?: number;
    currentAP?: number;
    gamesPlayed?: number;
    totalPlayTime?: number;
    highestScore?: number;
    level?: number;
    setUsername(username: string): void;
}

// ゲームエンジンのインターフェース
interface GameEngine {
    playerData?: PlayerData;
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

export class UserProfileManager {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private sceneState: SceneState;
    // プロフィール関連の状態
    private userData: UserData | null = null;
    private lastDataUpdate: number = 0;

    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーをセットアップ
     */
    private setupEventListeners(): void {
        if (this.eventBus) {
            this.eventBus.on('usernameChanged', (newUsername: string) => {
                this.handleUsernameChange(newUsername);
            });

            this.eventBus.on('userDataReload', () => {
                this.loadUserData();
            });
        }
    }
    
    /**
     * ユーザーデータの読み込み
     */
    public loadUserData(): void {
        try {
            this.userData = {
                username: this.gameEngine.playerData?.username || '未設定',
                totalAP: this.gameEngine.playerData?.totalAP || 0,
                currentAP: this.gameEngine.playerData?.currentAP || 0,
                gamesPlayed: this.gameEngine.playerData?.gamesPlayed || 0,
                totalPlayTime: this.gameEngine.playerData?.totalPlayTime || 0,
                highestScore: this.gameEngine.playerData?.highestScore || 0,
                level: this.gameEngine.playerData?.level || 1
            };
            this.lastDataUpdate = Date.now();
            
            // イベントバスに通知
            if (this.eventBus) {
                this.eventBus.emit('profileDataLoaded', this.userData);
            }
        } catch (error) {
            console.error('UserProfileManager loadUserData error:', error);
            throw error;
        }
    }
    
    /**
     * 現在のユーザー情報を描画
     */
    public renderCurrentUserInfo(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number
    ): number {
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width, 80);
        
        // セクション枠線
        context.strokeStyle = '#4a4a6a';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 80);
        
        // セクション見出し
        context.fillStyle = '#ffffff';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('現在のユーザー情報', x + 15, y + 25);
        
        // ユーザー名表示
        context.font = '16px Arial';
        const currentUsername = this.userData?.username || this.gameEngine.playerData?.username || '未設定';
        context.fillText(`ユーザー名: ${currentUsername}`, x + 15, y + 50);
        
        // 追加情報（レベル、AP）
        if (this.userData) {
            const level = this.userData.level;
            const totalAP = this.userData.totalAP;
            
            context.fillText(`レベル: ${level}`, x + 250, y + 50);
            context.fillText(`総AP: ${totalAP}`, x + 350, y + 50);
        }
        
        return y + 80;
    }
    
    /**
     * ユーザー名変更ボタンを描画
     */
    public renderUsernameChangeButton(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        focusedElement: number,
        tabsLength: number
    ): number {
        const buttonWidth = 200;
        const buttonHeight = 40;
        const isFocused = focusedElement === tabsLength + 1;
        
        // ボタン背景
        context.fillStyle = isFocused ? '#4a4a6a' : '#2a2a4a';
        context.fillRect(x, y, buttonWidth, buttonHeight);
        
        // ボタン枠線
        context.strokeStyle = isFocused ? '#6a6a8a' : '#4a4a6a';
        context.lineWidth = 2;
        context.strokeRect(x, y, buttonWidth, buttonHeight);
        
        // ボタンテキスト
        context.fillStyle = '#ffffff';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('ユーザー名変更', x + buttonWidth / 2, y + buttonHeight / 2 + 6);
        
        return y + buttonHeight + 10;
    }
    
    /**
     * ユーザー名ダイアログを描画
     */
    public renderUsernameDialog(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        // タイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.fillText('ユーザー名変更', x + width / 2, y + 30);
        
        // 現在のユーザー名
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.fillText('現在のユーザー名:', x + 20, y + 70);

        const currentUsername = this.userData?.username || this.gameEngine.playerData?.username || '未設定';
        context.fillStyle = '#88ccff';
        context.fillText(currentUsername, x + 20, y + 95);
        
        // 新しいユーザー名入力
        context.fillStyle = '#ffffff';
        context.fillText('新しいユーザー名:', x + 20, y + 130);
        
        // 入力フィールド（仮想的な表現）
        context.fillStyle = '#333333';
        context.fillRect(x + 20, y + 140, width - 40, 30);
        context.strokeStyle = '#666666';
        context.lineWidth = 1;
        context.strokeRect(x + 20, y + 140, width - 40, 30);
        
        // プレースホルダーテキスト
        context.fillStyle = '#888888';
        context.font = '14px Arial';
        context.fillText('新しいユーザー名を入力してください', x + 25, y + 158);
    }
    
    /**
     * ユーザー名変更処理
     */
    private handleUsernameChange(newUsername: string): void {
        try {
            if (!newUsername || newUsername.trim() === '') {
                throw new Error('ユーザー名が入力されていません');
            }
            
            // ユーザー名の検証
            if (newUsername.length > 20) {
                throw new Error('ユーザー名は20文字以内で入力してください');
            }
            
            // 特殊文字のチェック
            if (!/^[a-zA-Z0-9あ-んア-ヶー\s]+$/.test(newUsername)) {
                throw new Error('使用できない文字が含まれています');
            }
            
            // プレイヤーデータを更新
            if (this.gameEngine.playerData) {
                this.gameEngine.playerData.setUsername(newUsername.trim());
                
                // ローカルデータも更新
                if (this.userData) {
                    this.userData.username = newUsername.trim();
                }
                
                // イベントバスに通知
                if (this.eventBus) {
                    this.eventBus.emit('usernameUpdated', newUsername.trim());
                }

                console.log('Username changed to:', newUsername.trim());
            }
        } catch (error) {
            console.error('UserProfileManager handleUsernameChange error:', error);
            
            // エラーをイベントバスに通知
            if (this.eventBus) {
                this.eventBus.emit('profileError', (error as Error).message);
            }
            
            throw error;
        }
    }
    
    /**
     * ユーザー名変更ボタンのクリック処理
     */
    public handleUsernameButtonClick(): void {
        if (this.eventBus) {
            this.eventBus.emit('openDialog', 'username');
        }
    }
    
    /**
     * プロフィール統計の取得
     */
    public getProfileStatistics(): ProfileStatistics {
        if (!this.userData) {
            this.loadUserData();
        }
        
        return {
            username: this.userData?.username || '未設定',
            level: this.userData?.level || 1,
            totalAP: this.userData?.totalAP || 0,
            currentAP: this.userData?.currentAP || 0,
            gamesPlayed: this.userData?.gamesPlayed || 0,
            totalPlayTime: this.userData?.totalPlayTime || 0,
            highestScore: this.userData?.highestScore || 0,
            averageScore: this.userData?.gamesPlayed && this.userData.gamesPlayed > 0 ?
                Math.round((this.userData?.totalScore || 0) / this.userData.gamesPlayed) : 0,
            winRate: this.userData?.gamesPlayed && this.userData.gamesPlayed > 0 ?
                Math.round(((this.userData?.gamesWon || 0) / this.userData.gamesPlayed) * 100) : 0
        };
    }
    
    /**
     * データの更新が必要かチェック
     */
    public needsDataUpdate(): boolean {
        const now = Date.now();
        return (now - this.lastDataUpdate) > 5000; // 5秒以上経過
    }
    
    /**
     * コンポーネントの初期化
     */
    public initialize(): void {
        this.loadUserData();
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    public cleanup(): void {
        if (this.eventBus) {
            this.eventBus.off('usernameChanged');
            this.eventBus.off('userDataReload');
        }
    }
}