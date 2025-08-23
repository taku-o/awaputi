/**
 * StageSelectDataManager
 * ステージ選択関連のデータ管理と描画調整を担当
 */

import type { StageSelectScene } from '../StageSelectScene';
import type { StageManager, UnlockedStageInfo, LockedStageInfo } from '../../types/game';
import type { SceneManager } from '../../core/SceneManager';
import type { AchievementNotificationSystem } from '../../core/achievements/AchievementNotificationSystem';

// Interfaces for Stage Data
export interface StageInfo {
    id: string;
    name: string;
    description: string;
    duration?: number;
    unlockMessage?: string;
}

export interface StageSelectionState {
    selectedStageIndex: number;
    scrollOffset: number;
}

export interface StageUpdateResult {
    unlockedChanged: boolean;
    lockedChanged: boolean;
    unlockedCount: number;
    lockedCount: number;
}

export interface DebugInfo {
    selectedStageIndex: number;
    totalUnlockedStages: number;
    totalLockedStages: number;
    scrollOffset: number;
    maxVisibleStages: number;
    visibleRange: {
        start: number;
        end: number;
    };
}

// Extended interfaces for game engine components
interface ExtendedGameEngine {
    stageManager: StageManager;
    bubbleManager?: any;
    canvas: HTMLCanvasElement;
    playerData?: {
        username?: string;
        ap?: number;
        tap?: number;
    };
    achievementNotificationSystem?: AchievementNotificationSystem & {
        queueNotification(notification: {
            type: string;
            title: string;
            message: string;
            icon: string;
            duration: number;
        }): void;
    };
}

interface ExtendedStageSelectScene extends StageSelectScene {
    sceneManager: SceneManager;
}

export class StageSelectDataManager {
    private readonly stageSelectScene: ExtendedStageSelectScene;
    private readonly gameEngine: ExtendedGameEngine;
    
    // Stage data arrays
    private unlockedStages: UnlockedStageInfo[] = [];
    private lockedStages: LockedStageInfo[] = [];
    
    // UI state
    private selectedStageIndex: number = 0;
    private scrollOffset: number = 0;
    private readonly maxVisibleStages: number = 8;
    private lastDataUpdateTime: number = 0;
    private readonly DATA_UPDATE_INTERVAL = 1000; // 1秒

    constructor(stageSelectScene: StageSelectScene) {
        this.stageSelectScene = stageSelectScene as ExtendedStageSelectScene;
        this.gameEngine = stageSelectScene.gameEngine as ExtendedGameEngine;
    }

    /**
     * データ管理の初期化
     */
    public initialize(): void {
        this.updateStageData();
        this.selectedStageIndex = 0;
        this.scrollOffset = 0;
        this.lastDataUpdateTime = Date.now();
    }

    /**
     * データ管理のクリーンアップ
     */
    public cleanup(): void {
        this.unlockedStages = [];
        this.lockedStages = [];
        this.selectedStageIndex = 0;
        this.scrollOffset = 0;
    }

    /**
     * ステージデータの更新
     */
    public updateStageData(): StageUpdateResult {
        const previousUnlockedCount = this.unlockedStages.length;
        const previousLockedCount = this.lockedStages.length;

        // ステージマネージャーからデータを取得
        const stageManager = this.gameEngine.stageManager;
        if (!stageManager) {
            console.warn('StageManager not available');
            return {
                unlockedChanged: false,
                lockedChanged: false,
                unlockedCount: 0,
                lockedCount: 0
            };
        }

        // ステージデータを更新
        this.unlockedStages = stageManager.getUnlockedStages() || [];
        this.lockedStages = stageManager.getLockedStages() || [];

        // 選択インデックスの調整
        this.adjustSelectedIndex();

        // 変更チェック
        const unlockedChanged = this.unlockedStages.length !== previousUnlockedCount;
        const lockedChanged = this.lockedStages.length !== previousLockedCount;

        // 新しいステージが解放された場合の通知
        if (unlockedChanged && this.unlockedStages.length > previousUnlockedCount) {
            this.notifyNewStageUnlocked();
        }

        this.lastDataUpdateTime = Date.now();

        return {
            unlockedChanged,
            lockedChanged,
            unlockedCount: this.unlockedStages.length,
            lockedCount: this.lockedStages.length
        };
    }

    /**
     * データの自動更新（必要に応じて）
     */
    public updateDataIfNeeded(): void {
        const now = Date.now();
        if (now - this.lastDataUpdateTime > this.DATA_UPDATE_INTERVAL) {
            this.updateStageData();
        }
    }

    /**
     * ステージ選択の処理
     */
    public selectStage(index: number): boolean {
        const totalStages = this.unlockedStages.length;
        
        if (index < 0 || index >= totalStages) {
            return false;
        }

        this.selectedStageIndex = index;
        this.adjustScrollOffset();
        return true;
    }

    /**
     * 選択されたステージでゲームを開始
     */
    public startSelectedStage(): boolean {
        const selectedStage = this.getSelectedStage();
        if (!selectedStage) {
            return false;
        }

        try {
            // ステージ開始の通知
            this.notifyStageStart(selectedStage);

            // ゲームシーンに遷移
            this.stageSelectScene.sceneManager.switchScene('game', {
                stageId: selectedStage.id,
                stageConfig: selectedStage
            });

            return true;
        } catch (error) {
            console.error('Failed to start stage:', error);
            this.notifyStageStartError();
            return false;
        }
    }

    /**
     * ステージ選択の移動（相対的）
     */
    public moveSelection(direction: number): boolean {
        const newIndex = this.selectedStageIndex + direction;
        return this.selectStage(newIndex);
    }

    /**
     * スクロール処理
     */
    public scroll(delta: number): void {
        const oldOffset = this.scrollOffset;
        this.scrollOffset = Math.max(0, Math.min(
            Math.max(0, this.unlockedStages.length - this.maxVisibleStages),
            this.scrollOffset + delta
        ));

        // スクロールが変更された場合、選択インデックスも調整
        if (oldOffset !== this.scrollOffset) {
            this.adjustSelectedIndex();
        }
    }

    /**
     * ステージクリック処理
     */
    public handleStageClick(clickY: number, stageListStartY: number): boolean {
        const stageHeight = 60;
        const stageSpacing = 5;
        
        // クリックされたステージのインデックスを計算
        const relativeY = clickY - stageListStartY;
        const clickedIndex = Math.floor(relativeY / (stageHeight + stageSpacing));
        
        // 表示範囲内かチェック
        if (clickedIndex < 0 || clickedIndex >= this.maxVisibleStages) {
            return false;
        }
        
        // 実際のステージインデックス
        const actualIndex = this.scrollOffset + clickedIndex;
        
        // 有効なステージかチェック
        if (actualIndex >= this.unlockedStages.length) {
            return false;
        }

        // ステージを選択
        this.selectStage(actualIndex);
        return true;
    }

    /**
     * 現在選択されているステージの取得
     */
    public getSelectedStage(): UnlockedStageInfo | null {
        if (this.selectedStageIndex < 0 || this.selectedStageIndex >= this.unlockedStages.length) {
            return null;
        }
        return this.unlockedStages[this.selectedStageIndex];
    }

    /**
     * 表示可能なステージリストの取得
     */
    public getVisibleStages(): UnlockedStageInfo[] {
        const startIndex = this.scrollOffset;
        const endIndex = Math.min(startIndex + this.maxVisibleStages, this.unlockedStages.length);
        return this.unlockedStages.slice(startIndex, endIndex);
    }

    /**
     * ステージ選択状態の取得
     */
    public getSelectionState(): StageSelectionState {
        return {
            selectedStageIndex: this.selectedStageIndex,
            scrollOffset: this.scrollOffset
        };
    }

    /**
     * ステージ選択状態の設定
     */
    public setSelectionState(state: Partial<StageSelectionState>): void {
        if (state.selectedStageIndex !== undefined) {
            this.selectStage(state.selectedStageIndex);
        }
        if (state.scrollOffset !== undefined) {
            this.scrollOffset = state.scrollOffset;
            this.adjustSelectedIndex();
        }
    }

    /**
     * デバッグ情報の取得
     */
    public getDebugInfo(): DebugInfo {
        return {
            selectedStageIndex: this.selectedStageIndex,
            totalUnlockedStages: this.unlockedStages.length,
            totalLockedStages: this.lockedStages.length,
            scrollOffset: this.scrollOffset,
            maxVisibleStages: this.maxVisibleStages,
            visibleRange: {
                start: this.scrollOffset,
                end: Math.min(this.scrollOffset + this.maxVisibleStages, this.unlockedStages.length)
            }
        };
    }

    /**
     * 全ステージデータの取得
     */
    public getAllStageData(): { unlocked: UnlockedStageInfo[]; locked: LockedStageInfo[]; } {
        return {
            unlocked: [...this.unlockedStages],
            locked: [...this.lockedStages]
        };
    }

    /**
     * ステージ統計の取得
     */
    public getStageStats(): { total: number; unlocked: number; locked: number; completion: number; } {
        const total = this.unlockedStages.length + this.lockedStages.length;
        const unlocked = this.unlockedStages.length;
        const locked = this.lockedStages.length;
        const completion = total > 0 ? (unlocked / total) * 100 : 0;

        return { total, unlocked, locked, completion };
    }

    /**
     * 選択インデックスの調整（範囲チェック）
     */
    private adjustSelectedIndex(): void {
        if (this.unlockedStages.length === 0) {
            this.selectedStageIndex = 0;
            return;
        }

        // 範囲内に調整
        this.selectedStageIndex = Math.max(0, Math.min(
            this.selectedStageIndex,
            this.unlockedStages.length - 1
        ));
    }

    /**
     * スクロールオフセットの調整（選択に基づく）
     */
    private adjustScrollOffset(): void {
        // 選択されたステージが表示範囲内にない場合、スクロールを調整
        if (this.selectedStageIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedStageIndex;
        } else if (this.selectedStageIndex >= this.scrollOffset + this.maxVisibleStages) {
            this.scrollOffset = Math.max(0, this.selectedStageIndex - this.maxVisibleStages + 1);
        }
    }

    /**
     * 新ステージ解放の通知
     */
    private notifyNewStageUnlocked(): void {
        const latestStage = this.unlockedStages[this.unlockedStages.length - 1];
        if (latestStage && this.gameEngine.achievementNotificationSystem) {
            this.gameEngine.achievementNotificationSystem.queueNotification({
                type: 'success',
                title: '新ステージ解放！',
                message: `「${latestStage.name}」が利用可能になりました`,
                icon: '🔓',
                duration: 4000
            });
        }
    }

    /**
     * ステージ開始の通知
     */
    private notifyStageStart(stage: UnlockedStageInfo): void {
        if (this.gameEngine.achievementNotificationSystem) {
            this.gameEngine.achievementNotificationSystem.queueNotification({
                type: 'info',
                title: 'ステージ開始',
                message: `「${stage.name}」を開始します`,
                icon: '🎮',
                duration: 2000
            });
        }
    }

    /**
     * ステージ開始エラーの通知
     */
    private notifyStageStartError(): void {
        if (this.gameEngine.achievementNotificationSystem) {
            this.gameEngine.achievementNotificationSystem.queueNotification({
                type: 'error',
                title: 'エラー',
                message: 'ステージの開始に失敗しました',
                icon: '❌',
                duration: 3000
            });
        }
    }
}