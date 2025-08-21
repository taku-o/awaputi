/**
 * ChallengeDetailModal.ts
 * チャレンジ詳細モーダル - 基本実装
 * チャレンジの詳細情報を表示するモーダルダイアログ
 */

/**
 * Challenge reward interface
 */
interface ChallengeReward {
    type: string;
    amount: number;
    description: string;
}

/**
 * Challenge data interface
 */
interface ChallengeData {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'special' | 'event';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    progress: number;
    target: number;
    reward: ChallengeReward;
    deadline?: Date;
    priority?: number;
}

/**
 * Challenge system interface
 */
interface ChallengeSystem {
    getChallengeById?: (challengeId: string) => Promise<ChallengeData | null>;
}

/**
 * Localization manager interface
 */
interface LocalizationManager {
    translate(key: string): string | null;
}

/**
 * Bound event handlers
 */
interface BoundHandlers {
    close: () => void;
    backdropClick: (event: Event) => void;
    keyDown: (event: KeyboardEvent) => void;
}

export class ChallengeDetailModal {
    private challengeSystem: ChallengeSystem;
    private localizationManager: LocalizationManager;
    // 状態管理
    private isVisible: boolean = false;
    private currentChallengeId: string | null = null;
    private challengeData: ChallengeData | null = null;
    private isLoading: boolean = false;
    private error: string | null = null;
    // DOM要素
    private container: HTMLDivElement | null = null;
    private backdrop: HTMLDivElement | null = null;
    private modal: HTMLDivElement | null = null;
    private closeButton: HTMLButtonElement | null = null;
    private contentArea: HTMLDivElement | null = null;
    // イベントハンドラー
    private boundHandlers: BoundHandlers;
    
    constructor(challengeSystem: ChallengeSystem, localizationManager: LocalizationManager) {
        this.challengeSystem = challengeSystem;
        this.localizationManager = localizationManager;
        
        // イベントハンドラー
        this.boundHandlers = {
            close: this.close.bind(this),
            backdropClick: this.onBackdropClick.bind(this),
            keyDown: this.onKeyDown.bind(this)
        };

        console.log('[ChallengeDetailModal] インスタンス作成');
        this.createModalStructure();
    }
    
    /**
     * モーダル構造の作成
     */
    createModalStructure(): void {
        try {
            this.container = document.createElement('div');
            this.container.className = 'challenge-detail-modal-container';
            this.container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            // 背景（バックドロップ）
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'challenge-detail-modal-backdrop';
            this.backdrop.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                cursor: pointer;
            `;
            this.backdrop.addEventListener('click', this.boundHandlers.backdropClick);
            
            // モーダル本体
            this.modal = document.createElement('div');
            this.modal.className = 'challenge-detail-modal';
            this.modal.style.cssText = `
                position: relative;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            `;
            
            // ヘッダー
            const header = document.createElement('div');
            header.className = 'challenge-detail-modal-header';
            header.style.cssText = `
                padding: 20px 24px 16px;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
            `;

            const title = document.createElement('h2');
            title.className = 'challenge-detail-modal-title';
            title.style.cssText = `
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
            `;
            title.textContent = this.localizationManager.translate('challenge.detail.title') || 'チャレンジ詳細';
            
            // 閉じるボタン
            this.closeButton = document.createElement('button');
            this.closeButton.className = 'challenge-detail-modal-close';
            this.closeButton.style.cssText = `
                background: none;
                border: none;
                font-size: 28px;
                color: #7f8c8d;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            `;
            this.closeButton.innerHTML = '×';
            this.closeButton.setAttribute('aria-label', this.localizationManager.translate('common.close') || '閉じる');
            this.closeButton.addEventListener('click', this.boundHandlers.close);
            this.closeButton.addEventListener('mouseover', () => {
                this.closeButton!.style.backgroundColor = '#ecf0f1';
                this.closeButton!.style.color = '#2c3e50';
            });
            this.closeButton.addEventListener('mouseout', () => {
                this.closeButton!.style.backgroundColor = 'transparent';
                this.closeButton!.style.color = '#7f8c8d';
            });

            header.appendChild(title);
            header.appendChild(this.closeButton);
            
            // コンテンツエリア
            this.contentArea = document.createElement('div');
            this.contentArea.className = 'challenge-detail-modal-content';
            this.contentArea.style.cssText = `
                padding: 24px;
                overflow-y: auto;
                flex: 1;
                min-height: 200px;
            `;
            
            // 要素の組み立て
            this.modal.appendChild(header);
            this.modal.appendChild(this.contentArea);
            this.container.appendChild(this.backdrop);
            this.container.appendChild(this.modal);
            
            // アクセシビリティ属性
            this.modal.setAttribute('role', 'dialog');
            this.modal.setAttribute('aria-modal', 'true');
            this.modal.setAttribute('aria-labelledby', 'challenge-detail-title');
            title.id = 'challenge-detail-title';

            console.log('[ChallengeDetailModal] モーダル構造作成完了');

        } catch (error) {
            console.error('[ChallengeDetailModal] モーダル構造作成エラー:', error);
            this.error = (error as Error).message;
        }
    }
    
    /**
     * チャレンジ詳細表示
     */
    async show(challengeId: string): Promise<void> {
        if (this.isVisible || !challengeId) return;
        
        try {
            this.currentChallengeId = challengeId;
            this.isLoading = true;
            this.error = null;
            
            // モーダルを表示
            this.isVisible = true;
            if (this.container) {
                this.container.style.display = 'flex';
            }
            
            // ドキュメントに追加（まだ追加されていない場合）
            if (this.container && !this.container.parentNode) {
                document.body.appendChild(this.container);
            }
            
            // キーボードイベント設定
            document.addEventListener('keydown', this.boundHandlers.keyDown);
            
            // フォーカス管理
            this.closeButton?.focus();
            
            // チャレンジデータ読み込み
            await this.loadChallengeData(challengeId);

            console.log('[ChallengeDetailModal] モーダル表示:', challengeId);

        } catch (error) {
            console.error('[ChallengeDetailModal] 表示エラー:', error);
            this.error = (error as Error).message;
            this.renderError();
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * モーダルを閉じる
     */
    close(): void {
        if (!this.isVisible) return;
        
        try {
            this.isVisible = false;
            if (this.container) {
                this.container.style.display = 'none';
            }
            
            // キーボードイベント削除
            document.removeEventListener('keydown', this.boundHandlers.keyDown);
            
            // 状態リセット
            this.currentChallengeId = null;
            this.challengeData = null;
            this.error = null;
            this.isLoading = false;

            console.log('[ChallengeDetailModal] モーダル閉じる');

        } catch (error) {
            console.error('[ChallengeDetailModal] 閉じるエラー:', error);
        }
    }
    
    /**
     * チャレンジデータ読み込み
     */
    private async loadChallengeData(challengeId: string): Promise<void> {
        try {
            this.renderLoading();
            
            // チャレンジシステムからデータ取得
            if (this.challengeSystem && this.challengeSystem.getChallengeById) {
                this.challengeData = await this.challengeSystem.getChallengeById(challengeId);
            } else {
                // フォールバック：モックデータ
                this.challengeData = this.createMockChallengeData(challengeId);
            }
            
            if (this.challengeData) {
                this.renderChallengeDetails();
            } else {
                throw new Error('チャレンジデータが見つかりません');
            }
        } catch (error) {
            console.error('[ChallengeDetailModal] データ読み込みエラー:', error);
            this.error = (error as Error).message;
            this.renderError();
        }
    }
    
    /**
     * モックチャレンジデータ作成
     */
    private createMockChallengeData(challengeId: string): ChallengeData {
        return {
            id: challengeId,
            title: `チャレンジ ${challengeId}`,
            description: 'このチャレンジの詳細説明です。目標を達成して報酬を獲得しましょう。',
            type: 'daily',
            difficulty: 'medium',
            progress: 50,
            target: 100,
            reward: {
                type: 'ap',
                amount: 100,
                description: '100 AP'
            },
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間後
            priority: 5
        };
    }
    
    /**
     * ローディング状態の描画
     */
    private renderLoading(): void {
        if (!this.contentArea) return;
        
        this.contentArea.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <div style="font-size: 18px; margin-bottom: 16px;">読み込み中...</div>
                <div style="width: 40px; height: 40px; border: 4px solid #ecf0f1; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    /**
     * チャレンジ詳細の描画
     */
    private renderChallengeDetails(): void {
        if (!this.challengeData || !this.contentArea) return;
        
        const challenge = this.challengeData;
        const progressPercentage = Math.round((challenge.progress / challenge.target) * 100);
        
        this.contentArea.innerHTML = `
            <div class="challenge-detail-content">
                <div style="margin-bottom: 24px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #2c3e50;">${challenge.title}</h3>
                    <p style="margin: 0; color: #7f8c8d; line-height: 1.5;">${challenge.description}</p>
                </div>

                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #2c3e50;">進捗状況</h4>
                    <div style="background: #ecf0f1; border-radius: 12px; height: 24px; position: relative; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #3498db, #2ecc71); height: 100%; width: ${progressPercentage}%; border-radius: 12px; transition: width 0.3s ease;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #2c3e50; font-weight: bold; font-size: 14px;">
                            ${challenge.progress} / ${challenge.target} (${progressPercentage}%)
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div>
                        <h4 style="margin: 0 0 8px 0; color: #2c3e50;">タイプ</h4>
                        <div style="padding: 8px 12px; background: #e8f4f8; border-radius: 6px; color: #2c3e50;">
                            ${this.getTypeDisplayName(challenge.type)}
                        </div>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 8px 0; color: #2c3e50;">難易度</h4>
                        <div style="padding: 8px 12px; background: ${this.getDifficultyColor(challenge.difficulty)}; border-radius: 6px; color: #2c3e50;">
                            ${this.getDifficultyDisplayName(challenge.difficulty)}
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #2c3e50;">報酬</h4>
                    <div style="padding: 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
                        <div style="font-weight: bold; color: #f39c12; margin-bottom: 4px;">
                            ${challenge.reward.description}
                        </div>
                        <div style="color: #7f8c8d; font-size: 14px;">
                            チャレンジ完了時に獲得
                        </div>
                    </div>
                </div>
                
                ${challenge.deadline ? `
                    <div style="margin-bottom: 24px;">
                        <h4 style="margin: 0 0 8px 0; color: #2c3e50;">期限</h4>
                        <div style="color: #e74c3c; font-weight: bold;">
                            ${this.formatDeadline(challenge.deadline)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * エラー状態の描画
     */
    private renderError(): void {
        if (!this.contentArea) return;
        
        this.contentArea.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <div style="font-size: 18px; margin-bottom: 16px;">エラーが発生しました</div>
                <div style="color: #7f8c8d; margin-bottom: 24px;">${this.error || '不明なエラー'}</div>
                <button onclick="this.closest('.challenge-detail-modal-container').querySelector('.challenge-detail-modal-close').click()"
                        style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    閉じる
                </button>
            </div>
        `;
    }
    
    /**
     * バックドロップクリック処理
     */
    private onBackdropClick(event: Event): void {
        if (event.target === this.backdrop) {
            this.close();
        }
    }
    
    /**
     * キーボード処理
     */
    private onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.close();
        }
    }
    
    /**
     * ユーティリティメソッド
     */
    private getTypeDisplayName(type: string): string {
        const types: Record<string, string> = {
            daily: 'デイリー',
            weekly: 'ウィークリー',
            special: 'スペシャル',
            event: 'イベント'
        };
        return types[type] || type;
    }

    private getDifficultyDisplayName(difficulty: string): string {
        const difficulties: Record<string, string> = {
            easy: '易しい',
            medium: '普通',
            hard: '難しい',
            expert: 'エキスパート'
        };
        return difficulties[difficulty] || difficulty;
    }

    private getDifficultyColor(difficulty: string): string {
        const colors: Record<string, string> = {
            easy: '#d5f4e6',
            medium: '#fff3cd',
            hard: '#f8d7da',
            expert: '#d1ecf1'
        };
        return colors[difficulty] || '#f8f9fa';
    }
    
    private formatDeadline(deadline: Date): string {
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        if (diff <= 0) {
            return '期限切れ';
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}日後`;
        } else if (hours > 0) {
            return `${hours}時間後`;
        } else {
            return `${minutes}分後`;
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        try {
            document.removeEventListener('keydown', this.boundHandlers.keyDown);

            if (this.backdrop) {
                this.backdrop.removeEventListener('click', this.boundHandlers.backdropClick);
            }

            if (this.closeButton) {
                this.closeButton.removeEventListener('click', this.boundHandlers.close);
            }
            
            // DOM要素削除
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            
            // 参照クリア
            this.container = null;
            this.backdrop = null;
            this.modal = null;
            this.closeButton = null;
            this.contentArea = null;
            this.challengeData = null;

            console.log('[ChallengeDetailModal] クリーンアップ完了');

        } catch (error) {
            console.error('[ChallengeDetailModal] クリーンアップエラー:', error);
        }
    }
}