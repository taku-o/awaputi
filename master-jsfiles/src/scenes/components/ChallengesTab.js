import { ChallengeUI } from '../../core/ChallengeUI.js';
import { ChallengeDetailModal } from '../../ui/components/ChallengeDetailModal.js';

/**
 * チャレンジタブコンポーネント
 * UserInfoSceneでのチャレンジ表示・管理を担当
 */
export class ChallengesTab {
    constructor(gameEngine, eventBus, sceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // UI コンポーネント
        this.challengeUI = null;
        this.detailModal = null;
        
        // 状態管理
        this.isInitialized = false;
        this.isVisible = false;
        this.currentChallengeId = null;
        
        // 設定
        this.config = {
            refreshInterval: 30000, // 30秒
            animationEnabled: true
        };
        
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
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // チャレンジシステムの確認
            if (!this.gameEngine.challengeSystem) {
                console.warn('[ChallengesTab] ChallengeSystem が見つかりません');
                return;
            }
            
            // チャレンジUIコンポーネントを作成
            this.challengeUI = new ChallengeUI(
                this.gameEngine.challengeSystem,
                this.gameEngine.localizationManager || this.createMockLocalizationManager()
            );
            
            // 詳細モーダルを作成
            this.detailModal = new ChallengeDetailModal(
                this.gameEngine.challengeSystem,
                this.gameEngine.localizationManager || this.createMockLocalizationManager()
            );
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[ChallengesTab] 初期化完了');
            
        } catch (error) {
            console.error('[ChallengesTab] 初期化エラー:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * モック多言語管理オブジェクト作成（LocalizationManagerが未実装の場合用）
     */
    createMockLocalizationManager() {
        return {
            translate: (key) => {
                const translations = {
                    'challenge.ui.title': 'チャレンジ',
                    'challenge.ui.refresh': '更新',
                    'challenge.ui.noChallenges': 'チャレンジがありません',
                    'challenge.filter.active': 'アクティブ',
                    'challenge.filter.completed': '完了済み',
                    'challenge.filter.all': 'すべて',
                    'challenge.stats.active': 'アクティブ',
                    'challenge.stats.completed': '完了済み',
                    'challenge.stats.today': '今日',
                    'challenge.type.daily': 'デイリー',
                    'challenge.type.weekly': 'ウィークリー',
                    'challenge.type.event': 'イベント',
                    'challenge.reward.label': '報酬:',
                    'challenge.reward.claim': '受け取り',
                    'challenge.reward.claimed': '受け取り済み',
                    'challenge.reward.locked': 'ロック中',
                    'challenge.timeRemaining': '残り時間:',
                    'time.hours': '時間',
                    'time.minutes': '分',
                    'time.days': '日',
                    'common.close': '閉じる',
                    'challenge.difficulty': '難易度',
                    'challenge.category': 'カテゴリ',
                    'challenge.progress.title': '進捗',
                    'challenge.progress.current': '現在',
                    'challenge.progress.target': '目標',
                    'challenge.progress.remaining': '残り',
                    'challenge.reward.title': '報酬',
                    'challenge.reward.description.ap': 'ゲーム内通貨',
                    'challenge.reward.description.item': 'ゲーム内アイテム',
                    'challenge.reward.description.title': '称号',
                    'challenge.reward.description.theme': 'テーマ',
                    'challenge.tips.title': 'ヒント',
                    'challenge.tips.score': 'より高いスコアを目指しましょう',
                    'challenge.tips.combo': 'コンボを繋げることが重要です',
                    'challenge.tips.bubblePop': 'より多くの泡を割りましょう',
                    'challenge.tips.timePlayed': '継続してプレイしましょう',
                    'challenge.tips.daily': '毎日ログインしてチャレンジしましょう',
                    'challenge.tips.weekly': '週間目標に向けて計画的に進めましょう',
                    'challenge.expired': '期限切れ'
                };
                return translations[key] || key;
            }
        };
    }
    
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // チャレンジシステムのイベント
        if (this.gameEngine.challengeSystem && this.gameEngine.challengeSystem.gameEngine) {
            this.gameEngine.challengeSystem.gameEngine.on('challengeCompleted', this.boundHandlers.challengeCompleted);
            this.gameEngine.challengeSystem.gameEngine.on('challengeProgress', this.boundHandlers.challengeProgress);
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
    onChallengeClick(data) {
        if (data && data.challengeId) {
            this.showChallengeDetail(data.challengeId);
        }
    }
    
    /**
     * チャレンジ完了時の処理
     */
    onChallengeCompleted(data) {
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
    onChallengeProgress(data) {
        if (this.challengeUI && this.isVisible) {
            // リアルタイム進捗更新は ChallengeUI が自動的に処理
        }
    }
    
    /**
     * チャレンジ詳細表示
     */
    showChallengeDetail(challengeId) {
        if (this.detailModal) {
            this.currentChallengeId = challengeId;
            this.detailModal.show(challengeId);
        }
    }
    
    /**
     * 完了通知表示
     */
    showCompletionNotification(data) {
        // 簡単な完了メッセージ表示
        console.log(`[ChallengesTab] チャレンジ完了: ${data.challenge?.title || data.challengeId}`);
        
        // 実際のゲームでは、よりリッチな通知システムを使用する
        if (this.gameEngine.floatingTextManager) {
            this.gameEngine.floatingTextManager.show(
                'チャレンジ完了!',
                { x: 400, y: 200 },
                { color: '#2ecc71', fontSize: 24, duration: 3000 }
            );
        }
    }
    
    /**
     * データ更新
     */
    refreshData() {
        if (this.challengeUI && this.isVisible) {
            this.challengeUI.refresh();
        }
    }
    
    /**
     * タブ表示時の処理
     */
    onShow() {
        this.isVisible = true;
        if (this.challengeUI) {
            this.challengeUI.show();
        }
    }
    
    /**
     * タブ非表示時の処理
     */
    onHide() {
        this.isVisible = false;
        if (this.challengeUI) {
            this.challengeUI.hide();
        }
        
        // 詳細モーダルも閉じる
        if (this.detailModal && this.detailModal.isVisible) {
            this.detailModal.close();
        }
    }
    
    /**
     * コンテンツレンダリング
     */
    render(ctx, x, y, width, height) {
        if (!this.isInitialized || !this.challengeUI) {
            this.renderLoadingState(ctx, x, y, width, height);
            return;
        }
        
        try {
            // Canvas上での描画は、実際のDOM要素として表示される ChallengeUI に委譲
            // ここでは、ChallengeUI の DOM 要素を Canvas に統合するための情報を描画
            
            ctx.save();
            
            // 背景描画
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(x, y, width, height);
            
            // タイトル描画
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 24px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('チャレンジ', x + 20, y + 40);
            
            // チャレンジUI領域の描画
            const contentY = y + 60;
            const contentHeight = height - 60;
            
            // ChallengeUI のDOM要素の位置を調整
            if (this.challengeUI && this.challengeUI.container) {
                const container = this.challengeUI.container;
                container.style.position = 'absolute';
                container.style.left = `${x + 10}px`;
                container.style.top = `${contentY}px`;
                container.style.width = `${width - 20}px`;
                container.style.height = `${contentHeight}px`;
                container.style.zIndex = '1000';
                
                // コンテナがページに追加されていない場合は追加
                if (!container.parentNode) {
                    document.body.appendChild(container);
                }
            }
            
            ctx.restore();
            
        } catch (error) {
            console.error('[ChallengesTab] レンダリングエラー:', error);
            this.renderErrorState(ctx, x, y, width, height, error);
        }
    }
    
    /**
     * ローディング状態の描画
     */
    renderLoadingState(ctx, x, y, width, height) {
        ctx.save();
        
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(x, y, width, height);
        
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('チャレンジを読み込み中...', x + width / 2, y + height / 2);
        
        ctx.restore();
    }
    
    /**
     * エラー状態の描画
     */
    renderErrorState(ctx, x, y, width, height, error) {
        ctx.save();
        
        ctx.fillStyle = '#ffebee';
        ctx.fillRect(x, y, width, height);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = '18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('チャレンジの読み込みに失敗しました', x + width / 2, y + height / 2 - 20);
        
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText('ページを更新してもう一度お試しください', x + width / 2, y + height / 2 + 10);
        
        ctx.restore();
    }
    
    /**
     * 初期化エラーの処理
     */
    handleInitializationError(error) {
        console.error('[ChallengesTab] 初期化に失敗しました:', error);
        
        // エラー状態をシーンステートに設定
        if (this.sceneState) {
            this.sceneState.setError('チャレンジタブの初期化に失敗しました: ' + error.message);
        }
    }
    
    /**
     * クリック処理
     */
    handleClick(x, y, canvasX, canvasY, width, height) {
        // DOM要素のクリックは直接処理されるため、特別な処理は不要
        // 必要に応じて、Canvas上のクリック領域の処理をここに追加
        return false; // イベントを他のハンドラーに委譲
    }
    
    /**
     * キーボード処理
     */
    handleKeyboard(event) {
        if (!this.isVisible) return false;
        
        // チャレンジ関連のキーボードショートカット
        switch (event.key) {
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.refreshData();
                    return true;
                }
                break;
                
            case 'Escape':
                if (this.detailModal && this.detailModal.isVisible) {
                    event.preventDefault();
                    this.detailModal.close();
                    return true;
                }
                break;
        }
        
        return false;
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 必要に応じて定期的な更新処理をここに追加
        // 現在は ChallengeUI が自動更新を管理している
    }
    
    /**
     * リサイズ処理
     */
    onResize(width, height) {
        if (this.challengeUI && this.challengeUI.container) {
            // コンテナサイズを調整
            const container = this.challengeUI.container;
            container.style.width = `${width - 20}px`;
            container.style.height = `${height - 80}px`;
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // イベントリスナー削除
        if (this.gameEngine.challengeSystem && this.gameEngine.challengeSystem.gameEngine) {
            this.gameEngine.challengeSystem.gameEngine.off('challengeCompleted', this.boundHandlers.challengeCompleted);
            this.gameEngine.challengeSystem.gameEngine.off('challengeProgress', this.boundHandlers.challengeProgress);
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
        this.isVisible = false;
        
        console.log('[ChallengesTab] クリーンアップ完了');
    }
}