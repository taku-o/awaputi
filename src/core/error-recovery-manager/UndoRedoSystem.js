/**
 * UndoRedoSystem - Undo/Redo機能システム
 * 
 * ゲームアクションの記録と復元、状態管理、UI統合を専門的に管理します
 */
export class UndoRedoSystem {
    constructor(config, gameEngine) {
        this.config = config;
        this.gameEngine = gameEngine;
        
        // Undo/Redo設定
        this.settings = {
            enabled: config.undoRedoEnabled || true,
            maxHistory: config.recovery?.maxUndoSteps || 10,
            maxRedoSteps: config.recovery?.maxRedoSteps || 10,
            ignoredActions: new Set(['move', 'hover', 'focus', 'scroll']),
            criticalActions: new Set(['reset', 'newGame', 'delete', 'clear'])
        };
        
        // アクション履歴
        this.actionHistory = [];
        this.currentIndex = -1;
        
        // 状態管理
        this.state = {
            isRecording: true,
            lastAction: null,
            actionCount: 0,
            undoCount: 0,
            redoCount: 0
        };
        
        // UI要素
        this.ui = {
            undoButton: null,
            redoButton: null
        };
        
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    initialize() {
        this.createUndoRedoButtons();
        this.setupEventListeners();
        
        console.log('UndoRedoSystem initialized');
    }
    
    /**
     * Undo/Redoボタンを作成
     */
    createUndoRedoButtons() {
        // Undoボタン
        const undoBtn = document.createElement('button');
        undoBtn.id = 'undo-btn';
        undoBtn.className = 'undo-redo-btn undo-btn';
        undoBtn.innerHTML = '↶';
        undoBtn.title = '元に戻す (Ctrl+Z)';
        undoBtn.setAttribute('aria-label', '元に戻す');
        undoBtn.disabled = true;
        
        // Redoボタン
        const redoBtn = document.createElement('button');
        redoBtn.id = 'redo-btn';
        redoBtn.className = 'undo-redo-btn redo-btn';
        redoBtn.innerHTML = '↷';
        redoBtn.title = 'やり直し (Ctrl+Y)';
        redoBtn.setAttribute('aria-label', 'やり直し');
        redoBtn.disabled = true;
        
        // スタイルを適用
        this.applyUndoRedoStyles();
        
        // イベントリスナー
        undoBtn.addEventListener('click', () => this.undo());
        redoBtn.addEventListener('click', () => this.redo());
        
        document.body.appendChild(undoBtn);
        document.body.appendChild(redoBtn);
        
        this.ui.undoButton = undoBtn;
        this.ui.redoButton = redoBtn;
    }
    
    /**
     * Undo/Redoボタンのスタイルを適用
     */
    applyUndoRedoStyles() {
        if (document.getElementById('undo-redo-styles')) return;
        
        const styles = `
            .undo-redo-btn {
                position: fixed;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid #6c757d;
                background: white;
                color: #6c757d;
                font-size: 20px;
                cursor: pointer;
                z-index: 9997;
                transition: all 0.2s;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                font-family: inherit;
            }
            
            .undo-btn {
                bottom: 80px;
                right: 20px;
            }
            
            .redo-btn {
                bottom: 135px;
                right: 20px;
            }
            
            .undo-redo-btn:not(:disabled):hover {
                background: #6c757d;
                color: white;
                transform: scale(1.1);
            }
            
            .undo-redo-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            
            .undo-redo-btn:focus {
                outline: 2px solid #007bff;
                outline-offset: 2px;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'undo-redo-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // キーボードショートカット
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // ゲームエンジンイベント
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.on('gameAction', this.handleGameAction.bind(this));
            this.gameEngine.eventEmitter.on('stateChange', this.handleStateChange.bind(this));
        }
    }
    
    /**
     * キーボードイベントを処理
     * @param {KeyboardEvent} event - キーイベント
     */
    handleKeydown(event) {
        // Ctrl+Z で Undo
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            this.undo();
        }
        
        // Ctrl+Y または Ctrl+Shift+Z で Redo
        else if ((event.ctrlKey && event.key === 'y') || 
                 (event.ctrlKey && event.shiftKey && event.key === 'z')) {
            event.preventDefault();
            this.redo();
        }
    }
    
    /**
     * ゲームアクションを処理
     * @param {Object} action - アクション情報
     */
    handleGameAction(action) {
        if (!this.settings.enabled || !this.state.isRecording) return;
        
        // 無視すべきアクション
        if (this.settings.ignoredActions.has(action.type)) return;
        
        // アクションを記録
        this.recordAction(action);
    }
    
    /**
     * 状態変更を処理
     * @param {Object} stateChange - 状態変更情報
     */
    handleStateChange(stateChange) {
        // 状態変更に基づくアクション記録
        if (stateChange.significant && this.state.isRecording) {
            this.recordAction({
                type: 'stateChange',
                subtype: stateChange.type,
                data: stateChange,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * アクションを記録
     * @param {Object} action - アクション情報
     */
    recordAction(action) {
        try {
            // 現在位置以降の履歴を削除（新しいブランチの開始）
            if (this.currentIndex < this.actionHistory.length - 1) {
                this.actionHistory = this.actionHistory.slice(0, this.currentIndex + 1);
            }
            
            // アクション前の状態をキャプチャ
            const stateBefore = this.captureGameState();
            
            // アクションオブジェクトを作成
            const actionRecord = {
                id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: action.type,
                subtype: action.subtype || 'default',
                timestamp: Date.now(),
                stateBefore: stateBefore,
                stateAfter: null, // 後で設定
                data: { ...action.data },
                metadata: {
                    isCritical: this.settings.criticalActions.has(action.type),
                    canUndo: action.canUndo !== false,
                    description: action.description || `${action.type} action`
                }
            };
            
            // 履歴に追加
            this.actionHistory.push(actionRecord);
            this.currentIndex++;
            
            // 最大履歴数を制限
            if (this.actionHistory.length > this.settings.maxHistory) {
                this.actionHistory.shift();
                this.currentIndex--;
            }
            
            // 少し後にアクション後の状態をキャプチャ
            setTimeout(() => {
                if (this.actionHistory[this.currentIndex]) {
                    this.actionHistory[this.currentIndex].stateAfter = this.captureGameState();
                }
            }, 100);
            
            // 統計更新
            this.state.actionCount++;
            this.state.lastAction = actionRecord;
            
            // UI更新
            this.updateButtons();
            
            console.log('UndoRedoSystem: アクション記録完了', actionRecord.id);
            
        } catch (error) {
            console.error('UndoRedoSystem: アクション記録エラー:', error);
        }
    }
    
    /**
     * ゲーム状態をキャプチャ
     * @returns {Object} - ゲーム状態
     */
    captureGameState() {
        const gameState = {};
        
        try {
            // ゲームエンジンから状態を取得
            if (this.gameEngine.gameState) {
                gameState.game = this.deepClone(this.gameEngine.gameState);
            }
            
            // プレイヤーデータ
            if (this.gameEngine.playerData) {
                gameState.player = this.gameEngine.playerData.exportData();
            }
            
            // シーン状態
            if (this.gameEngine.sceneManager) {
                gameState.scene = {
                    current: this.gameEngine.sceneManager.getCurrentScene(),
                    data: this.gameEngine.sceneManager.getSceneData()
                };
            }
            
            // バブル状態
            if (this.gameEngine.bubbleManager) {
                gameState.bubbles = this.gameEngine.bubbleManager.exportState();
            }
            
            // スコア状態
            if (this.gameEngine.scoreManager) {
                gameState.score = this.gameEngine.scoreManager.getState();
            }
            
            gameState.timestamp = Date.now();
            
        } catch (error) {
            console.warn('UndoRedoSystem: 状態キャプチャエラー:', error);
        }
        
        return gameState;
    }
    
    /**
     * オブジェクトのディープクローン
     * @param {Object} obj - クローン対象
     * @returns {Object} - クローンされたオブジェクト
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    /**
     * Undo操作
     * @returns {boolean} - 成功フラグ
     */
    undo() {
        if (!this.canUndo()) {
            this.showUndoFeedback('元に戻せません');
            return false;
        }
        
        try {
            const action = this.actionHistory[this.currentIndex];
            
            // 記録停止
            this.state.isRecording = false;
            
            // 状態を復元
            this.restoreGameState(action.stateBefore);
            
            this.currentIndex--;
            this.state.undoCount++;
            
            // UI更新
            this.updateButtons();
            
            // 記録再開
            this.state.isRecording = true;
            
            // イベントを発火
            this.emitEvent('actionUndone', action);
            
            this.showUndoFeedback('元に戻しました');
            
            console.log('UndoRedoSystem: Undo実行完了', action.id);
            return true;
            
        } catch (error) {
            console.error('UndoRedoSystem: Undo エラー:', error);
            this.state.isRecording = true;
            this.showUndoFeedback('Undo操作に失敗しました');
            return false;
        }
    }
    
    /**
     * Redo操作
     * @returns {boolean} - 成功フラグ
     */
    redo() {
        if (!this.canRedo()) {
            this.showUndoFeedback('やり直せません');
            return false;
        }
        
        try {
            this.currentIndex++;
            const action = this.actionHistory[this.currentIndex];
            
            // 記録停止
            this.state.isRecording = false;
            
            // 状態を復元
            this.restoreGameState(action.stateAfter);
            
            this.state.redoCount++;
            
            // UI更新
            this.updateButtons();
            
            // 記録再開
            this.state.isRecording = true;
            
            // イベントを発火
            this.emitEvent('actionRedone', action);
            
            this.showUndoFeedback('やり直しました');
            
            console.log('UndoRedoSystem: Redo実行完了', action.id);
            return true;
            
        } catch (error) {
            console.error('UndoRedoSystem: Redo エラー:', error);
            this.state.isRecording = true;
            this.showUndoFeedback('Redo操作に失敗しました');
            return false;
        }
    }
    
    /**
     * Undoが可能かチェック
     * @returns {boolean} - 可能フラグ
     */
    canUndo() {
        return this.settings.enabled && 
               this.currentIndex >= 0 &&
               this.actionHistory.length > 0 &&
               this.actionHistory[this.currentIndex]?.metadata?.canUndo !== false;
    }
    
    /**
     * Redoが可能かチェック
     * @returns {boolean} - 可能フラグ
     */
    canRedo() {
        return this.settings.enabled && 
               this.currentIndex < this.actionHistory.length - 1 &&
               this.actionHistory[this.currentIndex + 1]?.stateAfter;
    }
    
    /**
     * ゲーム状態を復元
     * @param {Object} state - 復元する状態
     */
    restoreGameState(state) {
        if (!state) throw new Error('復元する状態がありません');
        
        try {
            // ゲーム状態の復元
            if (state.game && this.gameEngine.gameState) {
                Object.assign(this.gameEngine.gameState, state.game);
            }
            
            // プレイヤーデータの復元
            if (state.player && this.gameEngine.playerData) {
                this.gameEngine.playerData.importData(state.player);
            }
            
            // シーン状態の復元
            if (state.scene && this.gameEngine.sceneManager) {
                this.gameEngine.sceneManager.restoreScene(state.scene);
            }
            
            // バブル状態の復元
            if (state.bubbles && this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.importState(state.bubbles);
            }
            
            // スコア状態の復元
            if (state.score && this.gameEngine.scoreManager) {
                this.gameEngine.scoreManager.setState(state.score);
            }
            
            // UIを更新
            if (this.gameEngine.render) {
                this.gameEngine.render();
            }
            
        } catch (error) {
            console.error('UndoRedoSystem: 状態復元エラー:', error);
            throw error;
        }
    }
    
    /**
     * ボタンの状態を更新
     */
    updateButtons() {
        if (this.ui.undoButton) {
            this.ui.undoButton.disabled = !this.canUndo();
        }
        
        if (this.ui.redoButton) {
            this.ui.redoButton.disabled = !this.canRedo();
        }
    }
    
    /**
     * フィードバック表示
     * @param {string} message - メッセージ
     */
    showUndoFeedback(message) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10003;
            font-size: 14px;
            font-family: inherit;
            pointer-events: none;
        `;
        
        document.body.appendChild(feedback);
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
    
    /**
     * イベントを発火
     * @param {string} eventName - イベント名
     * @param {Object} data - データ
     */
    emitEvent(eventName, data) {
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.emit(`undoRedo:${eventName}`, data);
        }
    }
    
    /**
     * 履歴をクリア
     */
    clearHistory() {
        this.actionHistory = [];
        this.currentIndex = -1;
        this.updateButtons();
        
        console.log('UndoRedoSystem: 履歴クリア完了');
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} - 統計情報
     */
    getStatistics() {
        return {
            enabled: this.settings.enabled,
            totalActions: this.state.actionCount,
            undoCount: this.state.undoCount,
            redoCount: this.state.redoCount,
            historyLength: this.actionHistory.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            lastAction: this.state.lastAction?.type || null
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newSettings - 新しい設定
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.updateButtons();
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        // UI要素を削除
        if (this.ui.undoButton && this.ui.undoButton.parentNode) {
            this.ui.undoButton.parentNode.removeChild(this.ui.undoButton);
        }
        
        if (this.ui.redoButton && this.ui.redoButton.parentNode) {
            this.ui.redoButton.parentNode.removeChild(this.ui.redoButton);
        }
        
        // 履歴をクリア
        this.clearHistory();
        
        // イベントリスナーを削除
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
        
        console.log('UndoRedoSystem destroyed');
    }
}