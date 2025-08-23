/**
 * チャレンジタブコンポーネント
 * UserInfoSceneでのチャレンジ表示・管理を担当
 */
import { ChallengeUI } from '../../core/ChallengeUI';
import { ChallengeDetailModal } from '../../ui/components/ChallengeDetailModal';
import { GameEngine } from '../../core/GameEngine';
import { ComponentEventBus } from './ComponentEventBus';
import { SceneState } from './SceneState';

interface LocalizationManager {
    translate(key: string): string;
}

interface ChallengeData {
    challengeId: string;
    challenge?: {
        title?: string;
    };
}

interface BoundHandlers {
    challengeClick: (data: any) => void;
    challengeCompleted: (data: ChallengeData) => void;
    challengeProgress: (data: any) => void;
    refreshData: () => void;
}

interface ChallengeConfig {
    refreshInterval: number;
    animationEnabled: boolean;
}

export class ChallengesTab {
    private gameEngine: GameEngine;
    private eventBus: ComponentEventBus;
    private sceneState: SceneState;
    
    // UI コンポーネント
    private challengeUI: ChallengeUI | null = null;
    private detailModal: ChallengeDetailModal | null = null;
    
    // 状態管理
    private isInitialized: boolean = false;
    private isVisible: boolean = false;
    private currentChallengeId: string | null = null;
    
    // 設定
    private config: ChallengeConfig = {
        refreshInterval: 30000, // 30秒
        animationEnabled: true
    };
    
    // イベントハンドラー
    private boundHandlers: BoundHandlers;

    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, sceneState: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // イベントハンドラー
        this.boundHandlers = {
            challengeClick: this.onChallengeClick.bind(this),
            challengeCompleted: this.onChallengeCompleted.bind(this),
            challengeProgress: this.onChallengeProgress.bind(this),
            refreshData: this.refreshData.bind(this)
        };

        console.log('[ChallengesTab] インスタンス作成');
    }
    
    /**
     * コンポーネント初期化
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        try {
            // チャレンジシステムの確認
            if (!(this.gameEngine as any).challengeSystem) {
                console.warn('[ChallengesTab] ChallengeSystem が見つかりません');
                return;
            }
            
            // チャレンジUIコンポーネントを作成
            this.challengeUI = new ChallengeUI(
                (this.gameEngine as any).challengeSystem,
                (this.gameEngine as any).localizationManager || this.createMockLocalizationManager()
            );
            
            // 詳細モーダルを作成
            this.detailModal = new ChallengeDetailModal(
                (this.gameEngine as any).challengeSystem,
                (this.gameEngine as any).localizationManager || this.createMockLocalizationManager()
            );
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[ChallengesTab] 初期化完了');

        } catch (error) {
            console.error('[ChallengesTab] 初期化エラー:', error);
            this.handleInitializationError(error as Error);
        }
    }
    
    /**
     * モック多言語管理オブジェクト作成（LocalizationManagerが未実装の場合用）
     */
    private createMockLocalizationManager(): LocalizationManager {
        return {
            translate: (key: string): string => {
                const translations: Record<string, string> = {
                    'challenge.ui.title': 'チャレンジ',
                    'challenge.ui.refresh': '更新',
                    'challenge.ui.noChallenges': 'チャレンジがありません'
                };
                return translations[key] || key;
            }
        };
    }
    
    /**
     * イベントリスナー設定
     */
    private setupEventListeners(): void {
        // チャレンジシステムのイベント
        const challengeSystem = (this.gameEngine as any).challengeSystem;
        if (challengeSystem && challengeSystem.gameEngine) {
            challengeSystem.gameEngine.on('challengeCompleted', this.boundHandlers.challengeCompleted);
            challengeSystem.gameEngine.on('challengeProgress', this.boundHandlers.challengeProgress);
        }
        
        // イベントバス経由のイベント
        if (this.eventBus) {
            this.eventBus.on('challenge:clicked', this.boundHandlers.challengeClick);
            this.eventBus.on('challenge:refresh', this.boundHandlers.refreshData);
        }
    }
    
    /**
     * チャレンジクリック処理
     */
    private onChallengeClick(data: { challengeId?: string }): void {
        if (data && data.challengeId) {
            this.showChallengeDetail(data.challengeId);
        }
    }
    
    /**
     * チャレンジ完了時の処理
     */
    private onChallengeCompleted(data: ChallengeData): void {
        if (this.challengeUI && this.isVisible) {
            // UI更新
            this.challengeUI.refresh();
            // 通知表示（簡単な実装）
            this.showCompletionNotification(data);
        }
    }
    
    /**
     * チャレンジ進捗更新時の処理
     */
    private onChallengeProgress(data: any): void {
        if (this.challengeUI && this.isVisible) {
            // リアルタイム進捗更新は ChallengeUI が自動的に処理
        }
    }
    
    /**
     * チャレンジ詳細表示
     */
    private showChallengeDetail(challengeId: string): void {
        if (this.detailModal) {
            this.currentChallengeId = challengeId;
            this.detailModal.show(challengeId);
        }
    }
    
    /**
     * 完了通知表示
     */
    private showCompletionNotification(data: ChallengeData): void {
        console.log(`[ChallengesTab] チャレンジ完了: ${data.challenge?.title || data.challengeId}`);
    }
    
    /**
     * データ更新
     */
    private refreshData(): void {
        if (this.challengeUI && this.isVisible) {
            this.challengeUI.refresh();
        }
    }
    
    /**
     * 初期化エラーの処理
     */
    private handleInitializationError(error: Error): void {
        console.error('[ChallengesTab] 初期化に失敗しました:', error);
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        // イベントリスナー削除
        const challengeSystem = (this.gameEngine as any).challengeSystem;
        if (challengeSystem && challengeSystem.gameEngine) {
            challengeSystem.gameEngine.off('challengeCompleted', this.boundHandlers.challengeCompleted);
            challengeSystem.gameEngine.off('challengeProgress', this.boundHandlers.challengeProgress);
        }

        if (this.eventBus) {
            this.eventBus.off('challenge:clicked', this.boundHandlers.challengeClick);
            this.eventBus.off('challenge:refresh', this.boundHandlers.refreshData);
        }
        
        // UIコンポーネントのクリーンアップ
        if (this.challengeUI) {
            this.challengeUI.cleanup();
            this.challengeUI = null;
        }
        
        if (this.detailModal) {
            this.detailModal.cleanup();
            this.detailModal = null;
        }

        this.isInitialized = false;
        console.log('[ChallengesTab] クリーンアップ完了');
    }
}