import { Scene } from '../core/Scene';
import { EventStageDataManager } from './stage-select/EventStageDataManager';
import { StageSelectDataManager } from './stage-select/StageSelectDataManager';

/**
 * ステージ選択シーン（Main Controller）
 * プレイヤーがステージを選択してゲームを開始できる画面
 */
export class StageSelectScene extends Scene {
    private eventStageDataManager!: EventStageDataManager;
    private stageSelectDataManager!: StageSelectDataManager;
    
    constructor(gameEngine: any) {
        super(gameEngine);
        
        // サブコンポーネントの初期化
        this.eventStageDataManager = new EventStageDataManager(this);
        this.stageSelectDataManager = new StageSelectDataManager(this);
        
        console.log('[StageSelectScene] Main Controller initialized');
    }
    
    /**
     * シーン開始時の処理
     */
    enter(): void {
        // サブコンポーネントの初期化
        this.stageSelectDataManager.initialize();
        this.eventStageDataManager.initialize();
    }

    /**
     * シーン終了時の処理
     */
    exit(): void {
        this.eventStageDataManager.cleanup();
    }
    
    /**
     * 更新処理
     */
    update(_deltaTime: number): void {
        // 特に更新処理は不要
    }
    
    /**
     * 描画処理
     */
    render(context: CanvasRenderingContext2D): void {
        const canvas = this.gameEngine.canvas;
        
        // 背景
        context.fillStyle = '#001122';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.save();
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('ステージ選択', canvas.width / 2, 20);
        context.restore();
        
        // プレイヤー情報（ステージ選択データマネージャーに委譲）
        this.stageSelectDataManager.renderPlayerInfo(context);
        
        // イベントセクション（イベントステージデータマネージャーに委譲）
        this.eventStageDataManager.renderEventSection(context);
        
        // イベント通知バッジ（イベントステージデータマネージャーに委譲）
        this.eventStageDataManager.renderEventNotificationBadge(context);
        
        // 通常ステージリスト（ステージ選択データマネージャーに委譲）
        this.stageSelectDataManager.renderStageList(context);
        
        
        // 操作説明（ステージ選択データマネージャーに委譲）
        this.stageSelectDataManager.renderControls(context);
    }
    
    /**
     * 入力処理
     */
    handleInput(event: Event): void {
        if (event.type === 'keydown') {
            const keyEvent = event as KeyboardEvent;
            // ステージ関連のキー入力を処理
            if (this.stageSelectDataManager.handleStageKeyInput(keyEvent)) {
                return;
            }
            
            // その他のキー入力
            switch (keyEvent.code) {
                case 'KeyH':
                    this.gameEngine.sceneManager.switchScene('help');
                    break;
                case 'Escape':
                    this.sceneManager.switchScene('menu');
                    break;
            }
        } else if (event.type === 'click') {
            this.handleClick(event as MouseEvent);
        }
    }
    
    /**
     * クリック処理
     */
    handleClick(event: MouseEvent): void {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // イベント通知バッジのクリック判定
        if (this.eventStageDataManager.handleEventNotificationClick(x, y)) {
            return;
        }
        
        
        // イベントステージのクリック判定
        const eventSectionY = 120;
        const eventSectionHeight = 200;
        if (y >= eventSectionY && y <= eventSectionY + eventSectionHeight) {
            this.eventStageDataManager.handleEventStageClick(x, y);
            return;
        }
        
        // 通常ステージのクリック判定
        const stageStartY = 340;
        if (y >= stageStartY) {
            this.stageSelectDataManager.handleStageClick(x, y);
            return;
        }
    }

    /**
     * ステージデータの更新（外部からの呼び出し用）
     */
    updateStageList(): void {
        this.stageSelectDataManager.updateStageList();
    }

    /**
     * イベントデータの更新（外部からの呼び出し用）
     */
    updateEventList(): void {
        this.eventStageDataManager.updateEventList();
    }

    /**
     * ステージ状態の取得
     */
    getStageData(): any {
        return this.stageSelectDataManager.getStageData();
    }

    /**
     * イベント状態の取得
     */
    getEventData(): any {
        return this.eventStageDataManager.getEventData();
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo(): any {
        return {
            stage: this.stageSelectDataManager.getDebugInfo(),
            event: this.eventStageDataManager.getEventData()
        };
    }

    /**
     * 状態のリセット
     */
    resetState(): void {
        this.stageSelectDataManager.resetStageSelection();
        this.eventStageDataManager.setEventState({
            selectedEventIndex: -1,
            showingEvents: false,
            eventScrollOffset: 0
        });
    }
}