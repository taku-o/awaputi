/**
 * AutoSaveSystem - 自動保存システム
 * 
 * 定期的な状態保存、緊急復元、保存点管理を専門的に管理します
 */
export class AutoSaveSystem {
    constructor(config, gameEngine) {
        this.config = config;
        this.gameEngine = gameEngine;
        
        // 自動保存設定
        this.settings = {
            enabled: config.recovery?.autoSave || true,
            interval: config.recovery?.saveInterval || 30000, // 30秒
            maxSavePoints: config.recovery?.maxSavePoints || 5,
            gracePeriod: config.recovery?.gracePeriod || 5000, // 5秒
            emergencyRestore: config.recovery?.emergencyRestore || true
        };
        
        // 保存データ
        this.savePoints = [];
        this.currentSaveIndex = 0;
        this.timer = null;
        
        // 状態管理
        this.state = {
            isRunning: false,
            lastSaveTime: 0,
            saveCount: 0,
            restoreCount: 0,
            emergencyRestores: 0,
            saveErrors: 0
        };
        
        // 保存キー
        this.storageKeys = {
            saveStates: 'errorRecoverySaveStates',
            metadata: 'errorRecoverySaveMetadata',
            emergency: 'errorRecoveryEmergencySave'
        };
        
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    initialize() {
        this.loadSavePoints();
        this.setupEventListeners();
        
        if (this.settings.enabled) {
            this.start();
        }
        
        console.log('AutoSaveSystem initialized');
    }
    
    /**
     * 保存点を読み込み
     */
    loadSavePoints() {
        try {
            const savedStates = localStorage.getItem(this.storageKeys.saveStates);
            const savedMetadata = localStorage.getItem(this.storageKeys.metadata);
            
            if (savedStates) {
                this.savePoints = JSON.parse(savedStates);
                console.log(`AutoSaveSystem: ${this.savePoints.length}個の保存点を読み込み`);
            }
            
            if (savedMetadata) {
                const metadata = JSON.parse(savedMetadata);
                this.state = { ...this.state, ...metadata };
            }
            
        } catch (error) {
            console.warn('AutoSaveSystem: 保存点読み込みエラー:', error);
            this.savePoints = [];
        }
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // ゲームエンジンイベント
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.on('gameStart', this.handleGameStart.bind(this));
            this.gameEngine.eventEmitter.on('gameEnd', this.handleGameEnd.bind(this));
            this.gameEngine.eventEmitter.on('gameError', this.handleGameError.bind(this));
            this.gameEngine.eventEmitter.on('criticalAction', this.handleCriticalAction.bind(this));
        }
        
        // ページ離脱前の緊急保存
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // フォーカス変更時の保存
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
    }
    
    /**
     * 自動保存を開始
     */
    start() {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        
        // 初回保存
        this.performSave('initial');
        
        // 定期保存を開始
        this.timer = setInterval(() => {
            this.performSave('periodic');
        }, this.settings.interval);
        
        console.log(`AutoSaveSystem: 自動保存開始 (${this.settings.interval}ms間隔)`);
    }
    
    /**
     * 自動保存を停止
     */
    stop() {
        if (!this.state.isRunning) return;
        
        this.state.isRunning = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 最終保存
        this.performSave('final');
        
        console.log('AutoSaveSystem: 自動保存停止');
    }
    
    /**
     * 保存を実行
     * @param {string} saveType - 保存タイプ
     * @returns {boolean} - 成功フラグ
     */
    performSave(saveType = 'manual') {
        try {
            const gameState = this.captureGameState();
            
            if (!this.isValidGameState(gameState)) {
                console.log('AutoSaveSystem: 無効な状態のため保存をスキップ');
                return false;
            }
            
            const savePoint = {
                id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                type: saveType,
                state: gameState,
                metadata: {
                    version: '1.0',
                    gameVersion: this.gameEngine.version || '1.0',
                    saveIndex: this.currentSaveIndex++,
                    size: JSON.stringify(gameState).length
                }
            };
            
            // 保存点を追加
            this.savePoints.push(savePoint);
            
            // 最大保存数を超えた場合、古いものを削除
            if (this.savePoints.length > this.settings.maxSavePoints) {
                const removed = this.savePoints.shift();
                console.log(`AutoSaveSystem: 古い保存点を削除 (${removed.id})`);
            }
            
            // ストレージに保存
            this.saveSavePoints();
            
            // 統計更新
            this.state.saveCount++;
            this.state.lastSaveTime = Date.now();
            
            console.log(`AutoSaveSystem: 保存完了 (${saveType}) - ${savePoint.id}`);
            return true;
            
        } catch (error) {
            console.error('AutoSaveSystem: 保存エラー:', error);
            this.state.saveErrors++;
            return false;
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
                gameState.game = { ...this.gameEngine.gameState };
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
            
            // 設定
            if (this.gameEngine.settingsManager) {
                gameState.settings = this.gameEngine.settingsManager.getAllSettings();
            }
            
            // バブル状態（ゲーム中の場合）
            if (this.gameEngine.bubbleManager && this.gameEngine.gameState?.playing) {
                gameState.bubbles = this.gameEngine.bubbleManager.exportState();
            }
            
            // スコア状態
            if (this.gameEngine.scoreManager) {
                gameState.score = this.gameEngine.scoreManager.getState();
            }
            
            // タイムスタンプ
            gameState.timestamp = Date.now();
            gameState.sessionId = this.gameEngine.sessionId || 'unknown';
            
        } catch (error) {
            console.warn('AutoSaveSystem: 状態キャプチャエラー:', error);
        }
        
        return gameState;
    }
    
    /**
     * ゲーム状態が有効かチェック
     * @param {Object} gameState - ゲーム状態
     * @returns {boolean} - 有効フラグ
     */
    isValidGameState(gameState) {
        // 基本的な必須フィールドをチェック
        if (!gameState || typeof gameState !== 'object') return false;
        if (!gameState.timestamp) return false;
        
        // ゲーム状態があり、意味のあるデータが含まれているかチェック
        if (gameState.game && Object.keys(gameState.game).length === 0) return false;
        if (gameState.player && Object.keys(gameState.player).length === 0) return false;
        
        return true;
    }
    
    /**
     * 保存点をLocalStorageに保存
     */
    saveSavePoints() {
        try {
            // 保存点データ
            localStorage.setItem(this.storageKeys.saveStates, JSON.stringify(this.savePoints));
            
            // メタデータ
            const metadata = {
                saveCount: this.state.saveCount,
                lastSaveTime: this.state.lastSaveTime,
                restoreCount: this.state.restoreCount,
                emergencyRestores: this.state.emergencyRestores,
                saveErrors: this.state.saveErrors
            };
            localStorage.setItem(this.storageKeys.metadata, JSON.stringify(metadata));
            
        } catch (error) {
            console.warn('AutoSaveSystem: 保存点保存エラー:', error);
            
            // ストレージ容量エラーの場合、古いデータを削除
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }
        }
    }
    
    /**
     * ストレージ容量超過を処理
     */
    handleStorageQuotaExceeded() {
        console.warn('AutoSaveSystem: ストレージ容量超過、古いデータを削除');
        
        // 保存点の半分を削除
        const keepCount = Math.floor(this.settings.maxSavePoints / 2);
        this.savePoints = this.savePoints.slice(-keepCount);
        
        try {
            this.saveSavePoints();
        } catch (error) {
            console.error('AutoSaveSystem: 容量削減後も保存エラー:', error);
        }
    }
    
    /**
     * 状態を復元
     * @param {string} savePointId - 保存点ID
     * @returns {boolean} - 成功フラグ
     */
    restoreFromSavePoint(savePointId) {
        const savePoint = this.savePoints.find(sp => sp.id === savePointId);
        
        if (!savePoint) {
            console.error('AutoSaveSystem: 保存点が見つかりません:', savePointId);
            return false;
        }
        
        try {
            this.restoreGameState(savePoint.state);
            this.state.restoreCount++;
            
            console.log(`AutoSaveSystem: 復元完了 - ${savePointId}`);
            return true;
            
        } catch (error) {
            console.error('AutoSaveSystem: 復元エラー:', error);
            return false;
        }
    }
    
    /**
     * 最新の保存点から復元
     * @returns {boolean} - 成功フラグ
     */
    restoreLatest() {
        if (this.savePoints.length === 0) {
            console.warn('AutoSaveSystem: 復元可能な保存点がありません');
            return false;
        }
        
        const latestSavePoint = this.savePoints[this.savePoints.length - 1];
        return this.restoreFromSavePoint(latestSavePoint.id);
    }
    
    /**
     * 緊急復元を実行
     * @returns {boolean} - 成功フラグ
     */
    performEmergencyRestore() {
        if (!this.settings.emergencyRestore) return false;
        
        try {
            // 緊急保存データを確認
            const emergencyData = localStorage.getItem(this.storageKeys.emergency);
            
            if (emergencyData) {
                const emergencyState = JSON.parse(emergencyData);
                this.restoreGameState(emergencyState);
                this.state.emergencyRestores++;
                
                console.log('AutoSaveSystem: 緊急復元完了');
                return true;
            }
            
            // 緊急保存がない場合、最新の保存点から復元
            return this.restoreLatest();
            
        } catch (error) {
            console.error('AutoSaveSystem: 緊急復元エラー:', error);
            return false;
        }
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
            
            // 設定の復元
            if (state.settings && this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.restoreSettings(state.settings);
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
            console.error('AutoSaveSystem: 状態復元エラー:', error);
            throw error;
        }
    }
    
    /**
     * イベントハンドラー
     */
    
    handleGameStart() {
        this.performSave('gameStart');
    }
    
    handleGameEnd() {
        this.performSave('gameEnd');
    }
    
    handleGameError(error) {
        // エラー時の緊急保存
        this.performSave('emergency');
        
        // 緊急保存データを別途保存
        try {
            const emergencyState = this.captureGameState();
            localStorage.setItem(this.storageKeys.emergency, JSON.stringify(emergencyState));
        } catch (saveError) {
            console.error('AutoSaveSystem: 緊急保存エラー:', saveError);
        }
    }
    
    handleCriticalAction(action) {
        // 重要なアクション前の保存
        this.performSave('beforeCritical');
    }
    
    handleBeforeUnload(event) {
        // ページ離脱前の最終保存
        this.performSave('beforeUnload');
    }
    
    handleWindowBlur() {
        // ウィンドウがフォーカスを失った時の保存
        this.performSave('windowBlur');
    }
    
    handleWindowFocus() {
        // ウィンドウがフォーカスを得た時の保存（戻ってきた時）
        setTimeout(() => {
            this.performSave('windowFocus');
        }, 1000);
    }
    
    /**
     * 保存点一覧を取得
     * @returns {Array} - 保存点リスト
     */
    getSavePoints() {
        return this.savePoints.map(sp => ({
            id: sp.id,
            timestamp: sp.timestamp,
            type: sp.type,
            metadata: sp.metadata
        }));
    }
    
    /**
     * 保存点を削除
     * @param {string} savePointId - 保存点ID
     * @returns {boolean} - 成功フラグ
     */
    deleteSavePoint(savePointId) {
        const index = this.savePoints.findIndex(sp => sp.id === savePointId);
        
        if (index === -1) return false;
        
        this.savePoints.splice(index, 1);
        this.saveSavePoints();
        
        console.log(`AutoSaveSystem: 保存点削除 - ${savePointId}`);
        return true;
    }
    
    /**
     * 全保存点をクリア
     */
    clearAllSavePoints() {
        this.savePoints = [];
        this.saveSavePoints();
        
        // 緊急保存データもクリア
        localStorage.removeItem(this.storageKeys.emergency);
        
        console.log('AutoSaveSystem: 全保存点クリア');
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} - 統計情報
     */
    getStatistics() {
        return {
            enabled: this.settings.enabled,
            isRunning: this.state.isRunning,
            saveInterval: this.settings.interval,
            savePointCount: this.savePoints.length,
            maxSavePoints: this.settings.maxSavePoints,
            totalSaves: this.state.saveCount,
            totalRestores: this.state.restoreCount,
            emergencyRestores: this.state.emergencyRestores,
            saveErrors: this.state.saveErrors,
            lastSaveTime: this.state.lastSaveTime,
            oldestSaveTime: this.savePoints.length > 0 ? this.savePoints[0].timestamp : null,
            newestSaveTime: this.savePoints.length > 0 ? this.savePoints[this.savePoints.length - 1].timestamp : null
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newSettings - 新しい設定
     */
    updateSettings(newSettings) {
        const wasRunning = this.state.isRunning;
        
        if (wasRunning) {
            this.stop();
        }
        
        this.settings = { ...this.settings, ...newSettings };
        
        if (wasRunning && this.settings.enabled) {
            this.start();
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.stop();
        
        // イベントリスナーを削除
        window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.removeEventListener('blur', this.handleWindowBlur.bind(this));
        window.removeEventListener('focus', this.handleWindowFocus.bind(this));
        
        // 最終保存
        this.performSave('destroy');
        
        console.log('AutoSaveSystem destroyed');
    }
}