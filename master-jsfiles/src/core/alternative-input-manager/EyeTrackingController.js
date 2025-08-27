/**
 * Eye Tracking Controller
 * 視線追跡制御 - 視線入力とアイトラッキング機能の専門管理
 */
export class EyeTrackingController {
    constructor() {
        // 視線追跡設定
        this.eyeTrackingConfig = {
            enabled: false,
            calibrationPoints: 9,
            dwellTime: 800,
            gazeTolerance: 50,
            smoothingFactor: 0.3,
            blinkDetection: true,
            blinkThreshold: 200
        };
        
        // 視線状態
        this.eyeState = {
            isCalibrated: false,
            currentGaze: { x: 0, y: 0 },
            dwellTimer: null,
            gazeHistory: [],
            lastBlink: 0,
            calibrationData: {
                points: [],
                accuracy: 0,
                completed: false
            }
        };
        
        // 視線ポインター
        this.gazePointer = null;
        this.dwellIndicator = null;
        this.calibrationInterface = null;
        
        // WebGazer.js統合
        this.webgazer = null;
        this.webgazerLoaded = false;
        
        // 統計
        this.stats = {
            gazeEvents: 0,
            dwellActivations: 0,
            calibrationAttempts: 0,
            averageAccuracy: 0,
            blinkEvents: 0
        };
        
        console.log('[EyeTrackingController] Initialized');
    }
    
    /**
     * 視線追跡を初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initializeEyeTracking(config = {}) {
        Object.assign(this.eyeTrackingConfig, config.eyeTracking || {});
        
        if (!this.eyeTrackingConfig.enabled) return;
        
        try {
            await this.loadWebGazer();
            this.setupEyeTracking();
            this.createGazeInterface();
            
            console.log('[EyeTrackingController] Eye tracking initialized');
        } catch (error) {
            console.error('[EyeTrackingController] Initialization failed:', error);
        }
    }
    
    /**
     * WebGazer.jsをロード
     */
    async loadWebGazer() {
        if (this.webgazerLoaded) return;
        
        return new Promise((resolve, reject) => {
            // WebGazer.jsスクリプトをロード
            const script = document.createElement('script');
            script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
            script.onload = () => {
                this.webgazer = window.webgazer;
                this.webgazerLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load WebGazer.js'));
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * アイトラッキングをセットアップ
     */
    setupEyeTracking() {
        if (!this.webgazer) return;
        
        // WebGazer設定
        this.webgazer
            .setGazeListener((data, clock) => {
                if (data) {
                    this.handleGazeData(data, clock);
                }
            })
            .begin()
            .showPredictionPoints(false);
        
        // カメラ設定
        this.webgazer
            .params.imgWidth = 320;
        this.webgazer
            .params.imgHeight = 240;
        
        // 予測モデル設定
        this.webgazer
            .setRegression('weightedRidge')
            .setTracker('clmtrackr');
    }
    
    /**
     * 視線インターフェースを作成
     */
    createGazeInterface() {
        this.createGazePointer();
        this.createDwellIndicator();
        this.createCalibrationInterface();
    }
    
    /**
     * 視線ポインターを作成
     */
    createGazePointer() {
        if (this.gazePointer) {
            this.gazePointer.remove();
        }
        
        this.gazePointer = document.createElement('div');
        this.gazePointer.className = 'gaze-pointer';
        this.gazePointer.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 0, 0, 0.8);
            border-radius: 50%;
            background: rgba(255, 0, 0, 0.3);
            pointer-events: none;
            z-index: 10001;
            display: none;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        `;
        
        document.body.appendChild(this.gazePointer);
    }
    
    /**
     * 滞留インジケーターを作成
     */
    createDwellIndicator() {
        if (this.dwellIndicator) {
            this.dwellIndicator.remove();
        }
        
        this.dwellIndicator = document.createElement('div');
        this.dwellIndicator.className = 'dwell-indicator';
        this.dwellIndicator.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0, 255, 0, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10002;
            display: none;
            transform: translate(-50%, -50%);
            animation: dwell-progress 0.8s linear;
        `;
        
        // CSS アニメーションを追加
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dwell-progress {
                from {
                    border-top-color: rgba(0, 255, 0, 0.8);
                    border-right-color: transparent;
                    border-bottom-color: transparent;
                    border-left-color: transparent;
                }
                25% {
                    border-right-color: rgba(0, 255, 0, 0.8);
                }
                50% {
                    border-bottom-color: rgba(0, 255, 0, 0.8);
                }
                75% {
                    border-left-color: rgba(0, 255, 0, 0.8);
                }
                to {
                    border-color: rgba(0, 255, 0, 0.8);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(this.dwellIndicator);
    }
    
    /**
     * キャリブレーションインターフェースを作成
     */
    createCalibrationInterface() {
        this.calibrationInterface = document.createElement('div');
        this.calibrationInterface.className = 'calibration-interface';
        this.calibrationInterface.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10010;
            display: none;
            justify-content: center;
            align-items: center;
        `;
        
        document.body.appendChild(this.calibrationInterface);
    }
    
    /**
     * 視線データを処理
     * @param {Object} data - 視線データ
     * @param {number} clock - タイムスタンプ
     */
    handleGazeData(data, clock) {
        if (!data || !this.eyeTrackingConfig.enabled) return;
        
        this.stats.gazeEvents++;
        
        // 座標の平滑化
        const smoothedGaze = this.smoothGazeData(data);
        this.eyeState.currentGaze = smoothedGaze;
        
        // 視線履歴を更新
        this.updateGazeHistory(smoothedGaze, clock);
        
        // 視線ポインターを更新
        this.updateGazePointer(smoothedGaze);
        
        // 滞留検出
        this.detectDwelling(smoothedGaze, clock);
        
        // まばたき検出
        this.detectBlinking(data, clock);
    }
    
    /**
     * 視線データを平滑化
     * @param {Object} gazeData - 生の視線データ
     * @returns {Object} 平滑化された視線データ
     */
    smoothGazeData(gazeData) {
        const factor = this.eyeTrackingConfig.smoothingFactor;
        const current = this.eyeState.currentGaze;
        
        return {
            x: current.x * factor + gazeData.x * (1 - factor),
            y: current.y * factor + gazeData.y * (1 - factor)
        };
    }
    
    /**
     * 視線履歴を更新
     * @param {Object} gazeData - 視線データ
     * @param {number} timestamp - タイムスタンプ
     */
    updateGazeHistory(gazeData, timestamp) {
        this.eyeState.gazeHistory.push({
            x: gazeData.x,
            y: gazeData.y,
            timestamp: timestamp
        });
        
        // 履歴サイズを制限
        if (this.eyeState.gazeHistory.length > 100) {
            this.eyeState.gazeHistory.shift();
        }
    }
    
    /**
     * 視線ポインターを更新
     * @param {Object} gazeData - 視線データ
     */
    updateGazePointer(gazeData) {
        if (!this.gazePointer) return;
        
        this.gazePointer.style.display = 'block';
        this.gazePointer.style.left = `${gazeData.x}px`;
        this.gazePointer.style.top = `${gazeData.y}px`;
    }
    
    /**
     * 滞留を検出
     * @param {Object} gazeData - 視線データ
     * @param {number} timestamp - タイムスタンプ
     */
    detectDwelling(gazeData, timestamp) {
        const tolerance = this.eyeTrackingConfig.gazeTolerance;
        const dwellTime = this.eyeTrackingConfig.dwellTime;
        
        // 現在の視線位置での滞留チェック
        const recentGazes = this.eyeState.gazeHistory
            .filter(gaze => timestamp - gaze.timestamp < dwellTime)
            .filter(gaze => 
                Math.abs(gaze.x - gazeData.x) < tolerance &&
                Math.abs(gaze.y - gazeData.y) < tolerance
            );
        
        if (recentGazes.length >= 10) { // 十分なサンプル数
            const dwellDuration = timestamp - recentGazes[0].timestamp;
            
            if (dwellDuration >= dwellTime) {
                this.handleDwellActivation(gazeData, timestamp);
            } else {
                // 滞留インジケーターの表示
                this.showDwellIndicator(gazeData, dwellDuration / dwellTime);
            }
        } else {
            this.hideDwellIndicator();
        }
    }
    
    /**
     * 滞留活性化を処理
     * @param {Object} gazeData - 視線データ
     * @param {number} timestamp - タイムスタンプ
     */
    handleDwellActivation(gazeData, timestamp) {
        this.stats.dwellActivations++;
        
        // 視線位置の要素を取得
        const element = document.elementFromPoint(gazeData.x, gazeData.y);
        if (element) {
            this.activateGazeElement(element, gazeData);
        }
        
        this.hideDwellIndicator();
        this.provideFeedback('dwell_activated', { x: gazeData.x, y: gazeData.y });
    }
    
    /**
     * 視線要素を活性化
     * @param {Element} element - 対象要素
     * @param {Object} gazeData - 視線データ
     */
    activateGazeElement(element, gazeData) {
        // クリック可能要素の判定
        if (this.isClickableElement(element)) {
            // 視覚フィードバック
            this.highlightElement(element);
            
            // 要素をクリック
            setTimeout(() => {
                element.click();
                this.unhighlightElement(element);
            }, 100);
        }
    }
    
    /**
     * クリック可能要素かどうか判定
     * @param {Element} element - 要素
     * @returns {boolean} クリック可能かどうか
     */
    isClickableElement(element) {
        const clickableTags = ['BUTTON', 'A', 'INPUT'];
        const clickableClasses = ['bubble', 'clickable', 'btn'];
        
        if (clickableTags.includes(element.tagName)) return true;
        if (clickableClasses.some(cls => element.classList.contains(cls))) return true;
        if (element.hasAttribute('onclick')) return true;
        if (element.style.cursor === 'pointer') return true;
        
        return false;
    }
    
    /**
     * 要素をハイライト
     * @param {Element} element - 要素
     */
    highlightElement(element) {
        element.style.outline = '3px solid rgba(255, 0, 0, 0.8)';
        element.style.outlineOffset = '2px';
    }
    
    /**
     * 要素のハイライトを解除
     * @param {Element} element - 要素
     */
    unhighlightElement(element) {
        element.style.outline = '';
        element.style.outlineOffset = '';
    }
    
    /**
     * 滞留インジケーターを表示
     * @param {Object} gazeData - 視線データ
     * @param {number} progress - 進行率 (0-1)
     */
    showDwellIndicator(gazeData, progress) {
        if (!this.dwellIndicator) return;
        
        this.dwellIndicator.style.display = 'block';
        this.dwellIndicator.style.left = `${gazeData.x}px`;
        this.dwellIndicator.style.top = `${gazeData.y}px`;
        
        // 進行率に応じてスタイルを調整
        const opacity = 0.3 + progress * 0.7;
        this.dwellIndicator.style.opacity = opacity.toString();
    }
    
    /**
     * 滞留インジケーターを隠す
     */
    hideDwellIndicator() {
        if (this.dwellIndicator) {
            this.dwellIndicator.style.display = 'none';
        }
    }
    
    /**
     * まばたき検出
     * @param {Object} data - 視線データ
     * @param {number} timestamp - タイムスタンプ
     */
    detectBlinking(data, timestamp) {
        if (!this.eyeTrackingConfig.blinkDetection) return;
        
        // WebGazerからのまばたき検出データを処理
        if (data.eyeFeatures && data.eyeFeatures.blink) {
            const timeSinceLastBlink = timestamp - this.eyeState.lastBlink;
            
            if (timeSinceLastBlink > this.eyeTrackingConfig.blinkThreshold) {
                this.handleBlinkEvent(timestamp);
                this.eyeState.lastBlink = timestamp;
            }
        }
    }
    
    /**
     * まばたきイベントを処理
     * @param {number} timestamp - タイムスタンプ
     */
    handleBlinkEvent(timestamp) {
        this.stats.blinkEvents++;
        
        // まばたきによる特別なアクション
        if (this.stats.blinkEvents % 2 === 0) {
            // ダブルまばたき検出
            this.handleDoubleBlinkAction();
        }
        
        this.provideFeedback('blink_detected');
    }
    
    /**
     * ダブルまばたきアクションを処理
     */
    handleDoubleBlinkAction() {
        // スクロール、ページ切り替えなどの特別なアクション
        console.log('[EyeTrackingController] Double blink detected');
        this.provideFeedback('double_blink');
    }
    
    /**
     * キャリブレーションを開始
     */
    async startCalibration() {
        if (!this.webgazer) return;
        
        this.stats.calibrationAttempts++;
        this.eyeState.calibrationData.points = [];
        this.eyeState.calibrationData.completed = false;
        
        this.showCalibrationInterface();
        await this.performCalibrationSequence();
        this.hideCalibrationInterface();
        
        // キャリブレーション精度をテスト
        const accuracy = await this.testCalibrationAccuracy();
        this.eyeState.calibrationData.accuracy = accuracy;
        this.eyeState.isCalibrated = accuracy > 0.7; // 70%以上で成功
        
        console.log(`[EyeTrackingController] Calibration completed with ${(accuracy * 100).toFixed(1)}% accuracy`);
        
        return {
            success: this.eyeState.isCalibrated,
            accuracy: accuracy
        };
    }
    
    /**
     * キャリブレーションインターフェースを表示
     */
    showCalibrationInterface() {
        if (this.calibrationInterface) {
            this.calibrationInterface.style.display = 'flex';
        }
    }
    
    /**
     * キャリブレーションインターフェースを隠す
     */
    hideCalibrationInterface() {
        if (this.calibrationInterface) {
            this.calibrationInterface.style.display = 'none';
        }
    }
    
    /**
     * キャリブレーションシーケンスを実行
     */
    async performCalibrationSequence() {
        const points = this.generateCalibrationPoints();
        
        for (const point of points) {
            await this.calibratePoint(point);
        }
        
        this.eyeState.calibrationData.completed = true;
    }
    
    /**
     * キャリブレーションポイントを生成
     * @returns {Array} キャリブレーションポイント配列
     */
    generateCalibrationPoints() {
        const points = [];
        const margin = 100;
        const width = window.innerWidth - margin * 2;
        const height = window.innerHeight - margin * 2;
        
        // 9点キャリブレーション
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                points.push({
                    x: margin + (width * col) / 2,
                    y: margin + (height * row) / 2
                });
            }
        }
        
        return points;
    }
    
    /**
     * 単一ポイントをキャリブレート
     * @param {Object} point - キャリブレーションポイント
     */
    async calibratePoint(point) {
        return new Promise((resolve) => {
            // キャリブレーションポイントを表示
            const calibrationDot = document.createElement('div');
            calibrationDot.style.cssText = `
                position: fixed;
                left: ${point.x - 15}px;
                top: ${point.y - 15}px;
                width: 30px;
                height: 30px;
                background: red;
                border-radius: 50%;
                z-index: 10011;
                animation: pulse 1s infinite;
            `;
            
            this.calibrationInterface.appendChild(calibrationDot);
            
            // WebGazerにキャリブレーションポイントを登録
            setTimeout(() => {
                if (this.webgazer) {
                    this.webgazer.recordScreenPosition(point.x, point.y, 'click');
                }
                
                this.eyeState.calibrationData.points.push(point);
                calibrationDot.remove();
                resolve();
            }, 2000); // 2秒間表示
        });
    }
    
    /**
     * キャリブレーション精度をテスト
     * @returns {Promise<number>} 精度 (0-1)
     */
    async testCalibrationAccuracy() {
        if (!this.webgazer) return 0;
        
        const testPoints = this.generateCalibrationPoints();
        const accuracyResults = [];
        
        for (const point of testPoints) {
            const prediction = await this.testSinglePoint(point);
            if (prediction) {
                const distance = Math.sqrt(
                    Math.pow(prediction.x - point.x, 2) + 
                    Math.pow(prediction.y - point.y, 2)
                );
                const accuracy = Math.max(0, 1 - distance / 200); // 200px以内で最大精度
                accuracyResults.push(accuracy);
            }
        }
        
        return accuracyResults.length > 0 ? 
            accuracyResults.reduce((sum, acc) => sum + acc, 0) / accuracyResults.length : 0;
    }
    
    /**
     * 単一ポイントの精度をテスト
     * @param {Object} point - テストポイント
     * @returns {Promise<Object>} 予測結果
     */
    async testSinglePoint(point) {
        return new Promise((resolve) => {
            // テスト用の視線予測を取得
            const predictions = [];
            let sampleCount = 0;
            const maxSamples = 10;
            
            const gazeListener = (data) => {
                if (data && sampleCount < maxSamples) {
                    predictions.push(data);
                    sampleCount++;
                    
                    if (sampleCount >= maxSamples) {
                        this.webgazer.removeGazeListener(gazeListener);
                        
                        // 平均を計算
                        const avgPrediction = {
                            x: predictions.reduce((sum, p) => sum + p.x, 0) / predictions.length,
                            y: predictions.reduce((sum, p) => sum + p.y, 0) / predictions.length
                        };
                        
                        resolve(avgPrediction);
                    }
                }
            };
            
            this.webgazer.setGazeListener(gazeListener);
            
            // タイムアウト
            setTimeout(() => {
                this.webgazer.removeGazeListener(gazeListener);
                resolve(null);
            }, 3000);
        });
    }
    
    /**
     * フィードバックを提供
     * @param {string} type - フィードバックタイプ
     * @param {Object} data - 追加データ
     */
    provideFeedback(type, data = {}) {
        // 視覚・音響・ハプティックフィードバック（省略）
        console.log(`[EyeTrackingController] Feedback: ${type}`, data);
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            isCalibrated: this.eyeState.isCalibrated,
            calibrationAccuracy: this.eyeState.calibrationData.accuracy,
            currentGaze: this.eyeState.currentGaze,
            gazeHistoryLength: this.eyeState.gazeHistory.length
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.eyeTrackingConfig, newConfig);
        console.log('[EyeTrackingController] Configuration updated');
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup() {
        if (this.webgazer) {
            this.webgazer.end();
        }
        
        [this.gazePointer, this.dwellIndicator, this.calibrationInterface].forEach(element => {
            if (element) {
                element.remove();
            }
        });
        
        this.gazePointer = null;
        this.dwellIndicator = null;
        this.calibrationInterface = null;
        
        console.log('[EyeTrackingController] Cleaned up');
    }
}