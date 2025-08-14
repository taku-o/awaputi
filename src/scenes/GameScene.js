/**
 * GameScene - ゲームシーンメインコントローラー
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * ゲーム状態管理、UI管理、視覚化、パフォーマンス監視を統合して管理します。
 */

import { Scene } from '../core/Scene.js';
import { GameInputManager } from './GameInputManager.js';
import { FloatingTextManager } from '../ui/FloatingTextManager.js';
import { GameStateManager } from './game-scene/GameStateManager.js';
import { GameUIManager } from './game-scene/GameUIManager.js';
import { GameVisualizationManager } from './game-scene/GameVisualizationManager.js';
import { GamePerformanceMonitor } from './game-scene/GamePerformanceMonitor.js';

export class GameScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // 基本コンポーネント
        this.inputManager = new GameInputManager(gameEngine.canvas, this);
        this.floatingTextManager = new FloatingTextManager();
        
        // 専門化されたコンポーネントを初期化
        this.stateManager = new GameStateManager(gameEngine);
        this.uiManager = new GameUIManager(gameEngine, this.floatingTextManager);
        this.visualizationManager = new GameVisualizationManager(gameEngine);
        this.performanceMonitor = new GamePerformanceMonitor(gameEngine);
        
        // ポーズ状態の委譲
        this.isPaused = false;
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        // 各コンポーネントの初期化
        this.stateManager.startGame();
        this.uiManager.resetUIState();
        this.visualizationManager.resetDragVisualization();
        this.performanceMonitor.startMonitoring();
        
        // 同期状態の更新
        this.isPaused = this.stateManager.isPaused;
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // ゲーム開始メッセージ
        this.uiManager.showGameStartMessage();
        
        console.log('Game scene started');
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        // イベントリスナーの削除
        this.removeEventListeners();
        
        this.stateManager.endGame();
        this.uiManager.resetUIState();
        this.visualizationManager.resetDragVisualization();
        this.performanceMonitor.stopMonitoring();
        
        console.log('Game scene exited');
    }

    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        this.canvas = this.gameEngine.canvas;
        
        // マウスイベント
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        // タッチイベント
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // キーボードイベント
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // タッチキャンセルイベント
        this.handleTouchCancel = this.handleTouchCancel.bind(this);
        
        // イベントリスナーを追加
        this.canvas.addEventListener('click', this.handleMouseClick);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel);
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * イベントリスナーの削除
     */
    removeEventListeners() {
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleMouseClick);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('touchstart', this.handleTouchStart);
            this.canvas.removeEventListener('touchmove', this.handleTouchMove);
            this.canvas.removeEventListener('touchend', this.handleTouchEnd);
            this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);
        }
        document.removeEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * マウスクリック処理
     * @param {MouseEvent} event - マウスイベント
     */
    handleMouseClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // UIボタンのクリック処理
        if (this.uiManager.handleControlButtonClick(x, y)) {
            return; // ボタンがクリックされた場合は他の処理をしない
        }
        
        // 通常のゲームクリック処理（バブルクリックなど）
        // 既存のゲームロジック...
    }
    
    /**
     * マウス移動処理
     * @param {MouseEvent} event - マウスイベント
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // ボタンのホバー状態更新
        this.uiManager.updateMousePosition(x, y);
    }
    
    /**
     * タッチ開始処理
     * @param {TouchEvent} event - タッチイベント
     */
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // UIボタンのタッチ開始処理
        if (this.uiManager.handleTouchStart(x, y)) {
            return;
        }
        
        // 通常のゲームタッチ処理
        // 既存のゲームロジック...
    }
    
    /**
     * タッチ移動処理
     * @param {TouchEvent} event - タッチイベント
     */
    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // ボタンのホバー状態更新（タッチでは通常不要だが、一貫性のため）
        this.uiManager.updateMousePosition(x, y);
    }
    
    /**
     * タッチ終了処理
     * @param {TouchEvent} event - タッチイベント
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        // changedTouchesから座標を取得（touchesは空になることがある）
        const touch = event.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // UIボタンのタッチ終了処理
        if (this.uiManager.handleTouchEnd(x, y)) {
            return;
        }
        
        // 通常のゲームタッチ終了処理
        // 既存のゲームロジック...
    }
    
    /**
     * タッチキャンセル処理
     * @param {TouchEvent} event - タッチイベント
     */
    handleTouchCancel(event) {
        event.preventDefault();
        
        // UIマネージャーのタッチキャンセル処理
        this.uiManager.handleTouchCancel();
    }
    
    /**
     * キーボード処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyDown(event) {
        // UIManagerのキーボード処理に委譲
        if (this.uiManager.handleKeyboard(event)) {
            return; // UIで処理された場合は他の処理をしない
        }
        
        // 他のゲーム固有のキーボード処理があればここに追加
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // Debug logs throttled to prevent console flooding - only log occasionally
        if (!this.lastUpdateDebugTime || performance.now() - this.lastUpdateDebugTime > 5000) {
            console.log(`[DEBUG] GameScene.update working - paused: ${this.isPaused}, gameOver: ${this.gameEngine.isGameOver}`);
            this.lastUpdateDebugTime = performance.now();
        }
        
        // パフォーマンス測定
        this.performanceMonitor.updatePerformanceMetrics(deltaTime);
        
        // ポーズ状態の同期
        this.isPaused = this.stateManager.isPaused;
        
        if (this.isPaused || this.gameEngine.isGameOver) {
            // ポーズ中でもUI更新は継続
            this.uiManager.updateUIState(deltaTime);
            return;
        }
        
        // ゲーム状態の更新
        this.stateManager.updateGameState(deltaTime);
        
        // UI状態の更新
        this.uiManager.updateUIState(deltaTime);
        
        // 泡の更新
        if (this.gameEngine.bubbleManager && typeof this.gameEngine.bubbleManager.update === 'function') {
            this.gameEngine.bubbleManager.update(deltaTime);
        } else {
            // Only log this error occasionally
            if (!this.lastBubbleErrorTime || performance.now() - this.lastBubbleErrorTime > 5000) {
                console.error(`[DEBUG] bubbleManager.update is not available: manager=${!!this.gameEngine.bubbleManager}`);
                this.lastBubbleErrorTime = performance.now();
            }
        }
        
        // ドラッグビジュアライゼーションの更新
        this.visualizationManager.updateDragVisualization(deltaTime);
        
        // 画面エフェクトの更新
        this.visualizationManager.updateScreenEffects(deltaTime);
        
        // スコア変化の監視
        this.handleScoreChange();
        
        // 時間警告のチェック
        this.handleTimeWarnings();
    }
    
    /**
     * スコア変化の処理
     */
    handleScoreChange() {
        if (this.stateManager.checkScoreChange()) {
            const newScore = this.gameEngine.playerData.currentScore;
            this.uiManager.onScoreChanged(newScore);
        }
    }
    
    /**
     * 時間警告の処理
     */
    handleTimeWarnings() {
        const warnings = this.stateManager.checkTimeWarning();
        if (warnings.timeWarning || warnings.urgentWarning) {
            this.uiManager.showTimeWarnings(warnings);
        }
    }
    
    /**
     * 描画処理
     */
    render(context) {
        const renderStartTime = performance.now();
        
        // 背景描画
        this.visualizationManager.renderBackground(context);
        
        // 泡を描画
        this.gameEngine.bubbleManager.render(context);
        
        // ドラッグビジュアライゼーションを描画
        this.visualizationManager.renderDragVisualization(context);
        
        // フローティングテキストを描画
        this.uiManager.renderFloatingText(context);
        
        // UI を描画
        this.uiManager.renderEnhancedUI(context);
        
        // パフォーマンス情報（デバッグ用）
        this.performanceMonitor.renderPerformanceMetrics(context);
        
        // ゲームオーバー画面
        if (this.gameEngine.isGameOver) {
            this.visualizationManager.renderGameOver(context);
        }
        
        // ポーズ画面
        if (this.isPaused) {
            this.visualizationManager.renderPause(context);
        }
        
        // 描画時間の測定
        const renderEndTime = performance.now();
        this.performanceMonitor.updateAverageRenderTime(renderEndTime - renderStartTime);
    }
    
    // ===== デリゲートメソッド（外部インターフェース互換性） =====
    
    /**
     * ゲームオーバー処理
     */
    gameOver() {
        this.stateManager.triggerGameOver();
    }
    
    /**
     * ダメージ処理
     * @param {number} damage - ダメージ量
     */
    onPlayerDamaged(damage) {
        this.stateManager.onPlayerDamaged(damage);
        this.uiManager.onPlayerDamaged(damage);
    }
    
    /**
     * 回復処理
     * @param {number} heal - 回復量
     */
    onHealed(heal) {
        const actualHeal = this.stateManager.onPlayerHealed(heal);
        this.uiManager.onPlayerHealed(actualHeal);
        
        // 新しい回復エフェクト
        this.gameEngine.createHealEffect(actualHeal);
    }
    
    /**
     * 特殊効果発動時の処理
     * @param {string} effectType - エフェクトタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    onSpecialEffect(effectType, x, y) {
        this.stateManager.onSpecialEffect(effectType, x, y);
        this.uiManager.onSpecialEffect(effectType, x, y);
    }
    
    /**
     * ドラッグ開始
     * @param {number} x - 開始X座標
     * @param {number} y - 開始Y座標
     * @param {Object} targetBubble - 対象の泡
     */
    startDrag(x, y, targetBubble = null) {
        this.visualizationManager.startDrag(x, y, targetBubble);
    }
    
    /**
     * ドラッグ更新
     * @param {number} x - 現在のX座標
     * @param {number} y - 現在のY座標
     */
    updateDrag(x, y) {
        this.visualizationManager.updateDrag(x, y);
    }
    
    /**
     * ドラッグ終了
     */
    endDrag() {
        this.visualizationManager.endDrag();
    }
    
    /**
     * ドラッグパーティクルを生成
     * @param {number} x - X座標
     * @param {number} y - Y座標  
     * @param {number} intensity - パーティクルの強度（数）
     */
    createDragParticles(x, y, intensity = 10) {
        try {
            console.log(`[DEBUG] createDragParticles called: x=${x}, y=${y}, intensity=${intensity}`);
            
            // 基本パーティクルマネージャーでクリックエフェクトを作成
            if (this.gameEngine.particleManager && typeof this.gameEngine.particleManager.createComboEffect === 'function') {
                console.log('[DEBUG] Using particleManager.createComboEffect');
                this.gameEngine.particleManager.createComboEffect(x, y, 1); // コンボ1としてエフェクト生成
            } else {
                console.warn('[DEBUG] particleManager.createComboEffect not available');
            }
            
            // 拡張パーティクルマネージャーでパーティクルを個別生成
            if (this.gameEngine.enhancedParticleManager && typeof this.gameEngine.enhancedParticleManager.createParticle === 'function') {
                console.log('[DEBUG] Using enhancedParticleManager.createParticle');
                
                // 複数のパーティクルを放射状に生成
                for (let i = 0; i < Math.min(intensity, 15); i++) {
                    const angle = (i / intensity) * Math.PI * 2;
                    const speed = 50 + Math.random() * 30;
                    const vx = Math.cos(angle) * speed;
                    const vy = Math.sin(angle) * speed;
                    
                    this.gameEngine.enhancedParticleManager.createParticle(x, y, vx, vy, {
                        color: '#FFD700',
                        size: 3 + Math.random() * 2,
                        lifetime: 500 + Math.random() * 300,
                        fadeOut: true
                    });
                }
            } else {
                console.warn('[DEBUG] enhancedParticleManager.createParticle not available');
            }
            
            console.log('[DEBUG] createDragParticles completed');
            
        } catch (error) {
            console.error('[GameScene] Error creating drag particles:', error);
        }
    }
    
    /**
     * ポーズ状態の切り替え
     */
    togglePause() {
        this.stateManager.togglePause();
        this.isPaused = this.stateManager.isPaused;
    }
    
    /**
     * ポーズ設定
     * @param {boolean} paused - ポーズ状態
     */
    setPaused(paused) {
        this.stateManager.setPaused(paused);
        this.isPaused = this.stateManager.isPaused;
    }
    
    /**
     * 画面震動の開始
     * @param {number} duration - 持続時間
     * @param {number} intensity - 強度
     */
    startScreenShake(duration, intensity) {
        this.visualizationManager.startScreenShake(duration, intensity);
    }
    
    /**
     * パフォーマンス表示の切り替え
     */
    togglePerformanceDisplay() {
        this.performanceMonitor.toggleMetricsDisplay();
    }
    
    /**
     * 詳細情報表示の切り替え
     */
    toggleDetailedInfo() {
        this.uiManager.toggleDetailedInfo();
    }
    
    // ===== 統計・デバッグ情報 =====
    
    /**
     * ゲーム統計の取得
     * @returns {Object} 統計情報
     */
    getGameStats() {
        return {
            state: this.stateManager.getGameStats(),
            ui: this.uiManager.getUIState(),
            visualization: this.visualizationManager.getVisualizationStats(),
            performance: this.performanceMonitor.getPerformanceStats()
        };
    }
    
    /**
     * パフォーマンス推奨事項の取得
     * @returns {Array} 推奨事項配列
     */
    getPerformanceRecommendations() {
        return this.performanceMonitor.getPerformanceRecommendations();
    }
    
    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            scene: 'GameScene',
            isPaused: this.isPaused,
            isGameOver: this.gameEngine.isGameOver,
            components: {
                stateManager: this.stateManager.getDebugInfo(),
                uiManager: this.uiManager.getUIState(),
                visualizationManager: this.visualizationManager.getVisualizationStats(),
                performanceMonitor: this.performanceMonitor.getPerformanceStats()
            },
            gameStats: this.getGameStats()
        };
    }
    
    /**
     * 設定の更新
     * @param {Object} settings - 設定オブジェクト
     */
    updateSettings(settings) {
        if (settings.performance) {
            this.performanceMonitor.updateSettings(settings.performance);
        }
        
        console.log('[GameScene] Settings updated');
    }
    
    /**
     * コンポーネント状態の検証
     * @returns {boolean} 全コンポーネントが正常かどうか
     */
    validateComponents() {
        const validations = [
            this.stateManager.validateGameState(),
            !!this.uiManager,
            !!this.visualizationManager,
            !!this.performanceMonitor
        ];
        
        return validations.every(valid => valid);
    }
}