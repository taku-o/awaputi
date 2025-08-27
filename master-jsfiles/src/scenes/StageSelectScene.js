import { Scene } from '../core/Scene.js';
import { EventStageDataManager } from './stage-select/EventStageDataManager.js';
import { StageSelectDataManager } from './stage-select/StageSelectDataManager.js';

/**
 * ステージ選択シーン（Main Controller）
 * プレイヤーがステージを選択してゲームを開始できる画面
 */
export class StageSelectScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // サブコンポーネントの初期化
        this.eventStageDataManager = new EventStageDataManager(this);
        this.stageSelectDataManager = new StageSelectDataManager(this);
        
        console.log('[StageSelectScene] Main Controller initialized');
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        // サブコンポーネントの初期化
        this.stageSelectDataManager.initialize();
        this.eventStageDataManager.initialize();
    }

    /**
     * シーン終了時の処理
     */
    exit() {
        this.eventStageDataManager.cleanup();
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 特に更新処理は不要
    }
    
    /**
     * 描画処理
     */
    render(context) {
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
    handleInput(event) {
        if (event.type === 'keydown') {
            // ステージ関連のキー入力を処理
            if (this.stageSelectDataManager.handleStageKeyInput(event)) {
                return;
            }
            
            // その他のキー入力
            switch (event.code) {
                case 'KeyH':
                    this.gameEngine.sceneManager.switchScene('help');
                    break;
                case 'Escape':
                    this.sceneManager.switchScene('menu');
                    break;
            }
        } else if (event.type === 'click') {
            this.handleClick(event);
        }
    }
    
    /**
     * クリック処理
     */
    handleClick(event) {
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
    updateStageList() {
        this.stageSelectDataManager.updateStageList();
    }

    /**
     * イベントデータの更新（外部からの呼び出し用）
     */
    updateEventList() {
        this.eventStageDataManager.updateEventList();
    }

    /**
     * ステージ状態の取得
     */
    getStageData() {
        return this.stageSelectDataManager.getStageData();
    }

    /**
     * イベント状態の取得
     */
    getEventData() {
        return this.eventStageDataManager.getEventData();
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            stage: this.stageSelectDataManager.getDebugInfo(),
            event: this.eventStageDataManager.getEventData()
        };
    }

    /**
     * 状態のリセット
     */
    resetState() {
        this.stageSelectDataManager.resetStageSelection();
        this.eventStageDataManager.setEventState({
            selectedEventIndex: -1,
            showingEvents: false,
            eventScrollOffset: 0
        });
    }
}