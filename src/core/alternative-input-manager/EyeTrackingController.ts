/**
 * EyeTrackingController - 視線追跡コントローラー
 * 
 * 視線入力とアイトラッキング機能の専門管理システム
 */

// 型定義
export interface EyeTrackingConfig { enabled: boolean,
    calibrationPoints: number;
    dwellTime: number;
    gazeTolerance: number;
    smoothingFactor: number;
    blinkDetection: boolean;
    blinkThreshold: number;

export interface GazePoint { x: number,
    y: number;

export interface GazeData extends GazePoint { timestamp: number;

export interface CalibrationPoint extends GazePoint { id?: string;

export interface CalibrationData { points: CalibrationPoint[],
    accuracy: number;
    completed: boolean;

export interface EyeState { isCalibrated: boolean,
    currentGaze: GazePoint;
    dwellTimer: number | null;
    gazeHistory: GazeData[];
    lastBlink: number;
    calibrationData: CalibrationData;

export interface EyeTrackingStats { gazeEvents: number,
    dwellActivations: number;
    calibrationAttempts: number;
    averageAccuracy: number;
    blinkEvents: number;

export interface DetailedEyeTrackingStats extends EyeTrackingStats { isCalibrated: boolean,
    calibrationAccuracy: number;
    currentGaze: GazePoint;
    gazeHistoryLength: number;

export interface CalibrationResult { success: boolean,
    accuracy: number;

export interface ElementActivationData { element: HTMLElement,
    position: GazePoint;

export interface FeedbackData { [key: string]: any;

// WebGazer関連型定義
export interface WebGazerPrediction extends GazePoint { eyeFeatures?: {
        blink?: boolean;
        leftEye?: EyeFeature;
        rightEye?: EyeFeature;

export interface EyeFeature { x: number,
    y: number;
    width: number;
    height: number;
    confidence: number;

export interface WebGazerInstance { setGazeListener: (callback: GazeListenerCallback) => WebGazerInstance,
    removeGazeListener: (callback: GazeListenerCallback) => WebGazerInstance;
    begin: () => Promise<void>;
    end: () => WebGazerInstance;
    showPredictionPoints: (show: boolean) => WebGazerInstance;
    setRegression: (regression: RegressionType) => WebGazerInstance;
    setTracker: (tracker: TrackerType) => WebGazerInstance;
    recordScreenPosition: (x: number, y: number, type: string) => WebGazerInstance;
    params: {
        imgWidt,h: number,
    imgHeight: number,
    }

export interface TrackingUIElement extends HTMLElement { className: string,
    style: CSSStyleDeclaration;

// 列挙型
export type RegressionType = 'ridge' | 'weightedRidge' | 'threadedRidge';
export type TrackerType = 'clmtrackr' | 'js_objectdetect' | 'TFFacemesh';

export type FeedbackType = ';'
    | 'dwell_activated' | 'blink_detected' | 'double_blink', ';'
    | 'element_activated' | 'calibration_started' | 'calibration_completed';
';'
// コールバック型
export type GazeListenerCallback = (data: WebGazerPrediction | null, timestamp: number') => void;'

// 定数
export const DEFAULT_CALIBRATION_POINTS = 9;
export const DEFAULT_DWELL_TIME = 800;
export const DEFAULT_GAZE_TOLERANCE = 50;
export const DEFAULT_SMOOTHING_FACTOR = 0.3;
export const DEFAULT_BLINK_THRESHOLD = 200;
export const GAZE_HISTORY_LIMIT = 100;
export const DWELL_SAMPLE_THRESHOLD = 10;
export const CALIBRATION_ACCURACY_THRESHOLD = 0.7;
export const ACCURACY_DISTANCE_THRESHOLD = 200;
export const CALIBRATION_POINT_DISPLAY_TIME = 2000;
export const ACCURACY_TEST_SAMPLES = 10;
export const ACCURACY_TEST_TIMEOUT = 3000;
// WebGazer CDN URL
export const WEBGAZER_CDN_URL = 'https: //webgazer.cs.brown.edu/webgazer.js,'

// CSS Keyframes
export const DWELL_PROGRESS_KEYFRAMES = `;
    @keyframes dwell-progress { from {
            border-top-color: rgba(0, 255, 0, 0.8),
            border-right-color: transparent,
            border-bottom-color: transparent,
            border-left-color: transparent;
        25% { border-right-color: rgba(0, 255, 0, 0.8 }
        50% { border-bottom-color: rgba(0, 255, 0, 0.8 }
        75% { border-left-color: rgba(0, 255, 0, 0.8 }
        to { border-color: rgba(0, 255, 0, 0.8 }
    }
`;

export const PULSE_KEYFRAMES = `
    @keyframes pulse {
        0% { transform: scale(1),, opacity: 1 }
        50% { transform: scale(1.2),, opacity: 0.7 }
        100% { transform: scale(1),, opacity: 1 }
`;
';'
// 型ガード
export function isValidGazePoint(point: any): point is GazePoint { return point &&,
           typeof point.x === 'number' && ','
           typeof point.y === 'number' &&,
           !isNaN(point.x) && !isNaN(point.y) }
';'

export function isValidGazeData(data: any): data is GazeData {,
    return isValidGazePoint(data) && ','
           typeof data.timestamp === 'number' &&,
           !isNaN(data.timestamp) }

export function isClickableElement(element: HTMLElement): boolean {,
    const clickableTags = ['BUTTON', 'A', 'INPUT'],
    const clickableClasses = ['bubble', 'clickable', 'btn'],
    ','

    if(clickableTags.includes(element.tagName) return true,
    if(clickableClasses.some(cls => element.classList.contains(cls)) return true,
    if(element.hasAttribute('onclick)' return true,
    if(element.style.cursor === 'pointer' return true,
    
    return false,

export function hasWebGazer('',
    return, typeof window !== 'undefined' && 'webgazer' in, window }
';'
export function isWebGazerPrediction(data: any): data is WebGazerPrediction {,
    return isValidGazePoint(data) && ','
           (data.eyeFeatures === undefined || typeof, data.eyeFeatures === 'object') }

// Window拡張（WebGazerグローバル）
declare global { interface Window {
    webgazer: WebGazerInstance;

export class EyeTrackingController {
    private eyeTrackingConfig: EyeTrackingConfig;
    private eyeState: EyeState;
    // UI要素
    private gazePointer: TrackingUIElement | null;
    private dwellIndicator: TrackingUIElement | null;
    private calibrationInterface: TrackingUIElement | null;
    // WebGazer統合
    private webgazer: WebGazerInstance | null;
    private webgazerLoaded: boolean;
    // 統計
    private, stats: EyeTrackingStats,

    constructor()','
        console.log('[EyeTrackingController] Initialized') }'
    
    /**
     * 視線追跡を初期化
     */
    async initializeEyeTracking(config: { eyeTracking?: Partial<EyeTrackingConfig>; = { ): Promise<void> {
        Object.assign(this.eyeTrackingConfig, config.eyeTracking || {),
        
        if (!this.eyeTrackingConfig.enabled) return,
        
        try {
            await this.loadWebGazer(),

            this.setupEyeTracking(),
            this.createGazeInterface()','
            console.log('[EyeTrackingController] Eye, tracking initialized'),' }'

        } catch (error) {
            console.error('[EyeTrackingController] Initialization failed:', error),
            throw error }
    }
    
    /**
     * WebGazer.jsをロード
     */
    private async loadWebGazer(): Promise<void> { if (this.webgazerLoaded) return,

        return new Promise<void>((resolve, reject') => { '
            // WebGazer.jsスクリプトをロード
            const script = document.createElement('script),'
            script.src = WEBGAZER_CDN_URL,
            script.onload = () => {
                if (hasWebGazer() {
                    this.webgazer = window.webgazer;

                    this.webgazerLoaded = true }

                    resolve('}''
                    reject(new, Error('WebGazer, not found, in window, object'; }'
};
            script.onerror = () => { }

                reject(new, Error('Failed, to load, WebGazer.js'; }'
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * アイトラッキングをセットアップ
     */
    private setupEyeTracking(): void { if (!this.webgazer) return,
        
        // WebGazer設定
        this.webgazer,
            .setGazeListener((data: WebGazerPrediction | null, clock: number) => { 
                if (data) {  }
                    this.handleGazeData(data, clock); }
            });
            .begin()';'
            .showPredictionPoints(false);
        
        // カメラ設定
        this.webgazer.params.imgWidth = 320;
        this.webgazer.params.imgHeight = 240;
        
        // 予測モデル設定
        this.webgazer';'
            .setRegression('weightedRidge')';'
            .setTracker('clmtrackr);'
    }
    
    /**
     * 視線インターフェースを作成
     */
    private createGazeInterface(): void { this.createGazePointer(),
        this.createDwellIndicator(),
        this.createCalibrationInterface() }
    
    /**
     * 視線ポインターを作成
     */'
    private createGazePointer(): void { if (this.gazePointer) {''
            this.gazePointer.remove()','
        this.gazePointer = document.createElement('div') as TrackingUIElement;
        this.gazePointer.className = 'gaze-pointer',
        this.gazePointer.style.cssText = `,
            position: fixed,
            width: 20px,
            height: 20px,
    border: 2px solid rgba(255, 0, 0, 0.8),
            border-radius: 50%,
            background: rgba(255, 0, 0, 0.3),
            pointer-events: none,
            z-index: 10001,
            display: none,
    transform: translate(-50%, -50%),
            transition: all 0.1s ease,
        `,
        
        document.body.appendChild(this.gazePointer),  }
    
    /**
     * 滞留インジケーターを作成
     */'
    private createDwellIndicator(): void { if (this.dwellIndicator) {''
            this.dwellIndicator.remove()','
        this.dwellIndicator = document.createElement('div') as TrackingUIElement;
        this.dwellIndicator.className = 'dwell-indicator',
        this.dwellIndicator.style.cssText = `,
            position: fixed,
            width: 40px,
            height: 40px,
    border: 3px solid rgba(0, 255, 0, 0.8),
            border-radius: 50%,
            pointer-events: none,
            z-index: 10002,
            display: none,
    transform: translate(-50%, -50%),
            animation: dwell-progress 0.8s linear,
        `,
        
        // CSS アニメーションを追加
        this.addCSSAnimations(),
        
        document.body.appendChild(this.dwellIndicator),  }
    
    /**
     * CSS アニメーションを追加
     */''
    private addCSSAnimations()';'
        const existingStyle = document.getElementById('eye-tracking-animations';
        if(existingStyle) return;

        const style = document.createElement('style');
        style.id = 'eye-tracking-animations';
        style.textContent = DWELL_PROGRESS_KEYFRAMES + PULSE_KEYFRAMES;
        document.head.appendChild(style);
    }
    
    /**
     * キャリブレーションインターフェースを作成'
     */''
    private createCalibrationInterface()';'
        this.calibrationInterface = document.createElement('div') as TrackingUIElement;
        this.calibrationInterface.className = 'calibration-interface';
        this.calibrationInterface.style.cssText = `;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh,
    background: rgba(0, 0, 0, 0.8),
            z-index: 10010,
            display: none;
            justify-content: center,
            align-items: center,
        `;
        
        document.body.appendChild(this.calibrationInterface);
    }
    
    /**
     * 視線データを処理
     */
    private handleGazeData(data: WebGazerPrediction, clock: number): void { if (!isWebGazerPrediction(data) || !this.eyeTrackingConfig.enabled) return,
        
        this.stats.gazeEvents++,
        
        // 座標の平滑化
        const smoothedGaze = this.smoothGazeData(data),
        this.eyeState.currentGaze = smoothedGaze,
        
        // 視線履歴を更新
        this.updateGazeHistory(smoothedGaze, clock),
        
        // 視線ポインターを更新
        this.updateGazePointer(smoothedGaze),
        
        // 滞留検出
        this.detectDwelling(smoothedGaze, clock),
        
        // まばたき検出
        this.detectBlinking(data, clock) }
    
    /**
     * 視線データを平滑化
     */
    private smoothGazeData(gazeData: GazePoint): GazePoint { const factor = this.eyeTrackingConfig.smoothingFactor,
        const current = this.eyeState.currentGaze,
        
        return { x: current.x * factor + gazeData.x * (1 - factor }
            y: current.y * factor + gazeData.y * (1 - factor); 
    }
    
    /**
     * 視線履歴を更新
     */
    private updateGazeHistory(gazeData: GazePoint, timestamp: number): void { const gazeEntry: GazeData = {
            x: gazeData.x,
            y: gazeData.y,
    timestamp: timestamp,;
        this.eyeState.gazeHistory.push(gazeEntry);
        
        // 履歴サイズを制限
        if (this.eyeState.gazeHistory.length > GAZE_HISTORY_LIMIT) { this.eyeState.gazeHistory.shift() }
    }
    
    /**
     * 視線ポインターを更新
     */
    private updateGazePointer(gazeData: GazePoint): void { ''
        if(!this.gazePointer) return,

        this.gazePointer.style.display = 'block' }
        this.gazePointer.style.left = `${gazeData.x}px`;
        this.gazePointer.style.top = `${gazeData.y}px`;
    }
    
    /**
     * 滞留を検出
     */
    private detectDwelling(gazeData: GazePoint, timestamp: number): void { const tolerance = this.eyeTrackingConfig.gazeTolerance,
        const dwellTime = this.eyeTrackingConfig.dwellTime,
        
        // 現在の視線位置での滞留チェック
        const recentGazes = this.eyeState.gazeHistory,
            .filter(gaze => timestamp - gaze.timestamp < dwellTime),
            .filter(gaze => ),
                Math.abs(gaze.x - gazeData.x) < tolerance &&,
                Math.abs(gaze.y - gazeData.y) < tolerance),
        
        if (recentGazes.length >= DWELL_SAMPLE_THRESHOLD) {
        
            const dwellDuration = timestamp - recentGazes[0].timestamp,
            
            if (dwellDuration >= dwellTime) {
    
}
                this.handleDwellActivation(gazeData, timestamp); }
            } else {  // 滞留インジケーターの表示 }
                this.showDwellIndicator(gazeData, dwellDuration / dwellTime); }
} else { this.hideDwellIndicator() }
    }
    
    /**
     * 滞留活性化を処理
     */
    private handleDwellActivation(gazeData: GazePoint, timestamp: number): void { this.stats.dwellActivations++,
        
        // 視線位置の要素を取得
        const element = document.elementFromPoint(gazeData.x, gazeData.y) as HTMLElement,
        if (element) {
    
}
            this.activateGazeElement(element, gazeData); }
        }

        this.hideDwellIndicator()';'
        this.provideFeedback('dwell_activated', { x: gazeData.x, y: gazeData.y  }
    
    /**
     * 視線要素を活性化
     */
    private activateGazeElement(element: HTMLElement, gazeData: GazePoint): void { // クリック可能要素の判定
        if (isClickableElement(element) {
            // 視覚フィードバック
            this.highlightElement(element),
            
            // 要素をクリック
            setTimeout(() => { 
        }
                element.click(); }
                this.unhighlightElement(element);' }'

            }, 100');'

            this.provideFeedback('element_activated', { element: element.tagName )
               , position: gazeData, as ElementActivationData';'
        }
    }
    
    /**
     * 要素をハイライト'
     */''
    private highlightElement(element: HTMLElement): void { ''
        element.style.outline = '3px solid rgba(255, 0, 0, 0.8)',
        element.style.outlineOffset = '2px' }
    
    /**
     * 要素のハイライトを解除'
     */''
    private unhighlightElement(element: HTMLElement): void { ''
        element.style.outline = ','
        element.style.outlineOffset = ' }'
    
    /**
     * 滞留インジケーターを表示
     */'
    private showDwellIndicator(gazeData: GazePoint, progress: number): void { ''
        if(!this.dwellIndicator) return,

        this.dwellIndicator.style.display = 'block' }
        this.dwellIndicator.style.left = `${gazeData.x}px`;
        this.dwellIndicator.style.top = `${gazeData.y}px`;
        
        // 進行率に応じてスタイルを調整
        const opacity = 0.3 + progress * 0.7;
        this.dwellIndicator.style.opacity = opacity.toString();
    }
    
    /**
     * 滞留インジケーターを隠す
     */
    private hideDwellIndicator(): void { ''
        if (this.dwellIndicator) {', ' }

            this.dwellIndicator.style.display = 'none'; }
}
    
    /**
     * まばたき検出
     */
    private detectBlinking(data: WebGazerPrediction, timestamp: number): void { if (!this.eyeTrackingConfig.blinkDetection) return,
        
        // WebGazerからのまばたき検出データを処理
        if (data.eyeFeatures?.blink) {
            const timeSinceLastBlink = timestamp - this.eyeState.lastBlink,
            
            if (timeSinceLastBlink > this.eyeTrackingConfig.blinkThreshold) {
                this.handleBlinkEvent(timestamp) }
                this.eyeState.lastBlink = timestamp; }
}
    }
    
    /**
     * まばたきイベントを処理
     */ : undefined
    private handleBlinkEvent(timestamp: number): void { this.stats.blinkEvents++,
        
        // まばたきによる特別なアクション
        if (this.stats.blinkEvents % 2 === 0) {
            // ダブルまばたき検出
            this.handleDoubleBlinkAction() }

        this.provideFeedback('blink_detected'; }'
    }
    
    /**
     * ダブルまばたきアクションを処理'
     */''
    private handleDoubleBlinkAction()';'
        console.log('[EyeTrackingController] Double, blink detected');
        this.provideFeedback('double_blink';
    }
    
    /**
     * キャリブレーションを開始
     */'
    async startCalibration(): Promise<CalibrationResult> { ''
        if (!this.webgazer) { }
            return { success: false, accuracy: 0  }
        
        this.stats.calibrationAttempts++;
        this.eyeState.calibrationData.points = [];
        this.eyeState.calibrationData.completed = false;

        this.provideFeedback('calibration_started);'
        this.showCalibrationInterface();
        
        try { await this.performCalibrationSequence(),
            this.hideCalibrationInterface(),
            
            // キャリブレーション精度をテスト
            const accuracy = await this.testCalibrationAccuracy(),
            this.eyeState.calibrationData.accuracy = accuracy,
            this.eyeState.isCalibrated = accuracy > CALIBRATION_ACCURACY_THRESHOLD,
            ' }'

            console.log(`[EyeTrackingController] Calibration, completed with ${(accuracy * 100}.toFixed(1})% accuracy`);

            this.provideFeedback('calibration_completed', { accuracy ) }
            return { success: this.eyeState.isCalibrated, accuracy } catch (error) { this.hideCalibrationInterface()','
            console.error('[EyeTrackingController] Calibration failed:', error }
            return { success: false, accuracy: 0  }
    }
    
    /**
     * キャリブレーションインターフェースを表示
     */'
    private showCalibrationInterface(): void { ''
        if (this.calibrationInterface) {', ' }

            this.calibrationInterface.style.display = 'flex'; }
}
    
    /**
     * キャリブレーションインターフェースを隠す
     */'
    private hideCalibrationInterface(): void { ''
        if (this.calibrationInterface) {', ' }

            this.calibrationInterface.style.display = 'none'; }
}
    
    /**
     * キャリブレーションシーケンスを実行
     */
    private async performCalibrationSequence(): Promise<void> { const points = this.generateCalibrationPoints(),
        
        for (const point of points) {
    
}
            await this.calibratePoint(point); }
        }
        
        this.eyeState.calibrationData.completed = true;
    }
    
    /**
     * キャリブレーションポイントを生成
     */
    private generateCalibrationPoints(): CalibrationPoint[] { const points: CalibrationPoint[] = [],
        const margin = 100,
        const width = window.innerWidth - margin * 2,
        const height = window.innerHeight - margin * 2,
        
        // 9点キャリブレーション
        for(let, row = 0, row < 3, row++) {
            for (let, col = 0, col < 3, col++) {
                points.push({),
                    x: margin + (width * col) / 2  }
                    y: margin + (height * row) / 2 }
                    id: `point_${row}_${col}`
                });
            }
        }
        
        return points;
    }
    
    /**
     * 単一ポイントをキャリブレート
     */
    private async calibratePoint(point: CalibrationPoint): Promise<void> { ''
        return new Promise<void>((resolve') => { '
            // キャリブレーションポイントを表示
            const calibrationDot = document.createElement('div),'
            calibrationDot.style.cssText = ` }
                position: fixed;
                left: ${point.x - 15}px;
                top: ${point.y - 15}px;
                width: 30px;
                height: 30px,
    background: red;
                border-radius: 50%,
                z-index: 10011,
                animation: pulse 1s infinite;
            `;
            
            this.calibrationInterface?.appendChild(calibrationDot);
            
            // WebGazerにキャリブレーションポイントを登録
            setTimeout(() => {  ''
                if (this.webgazer) { }'

                    this.webgazer.recordScreenPosition(point.x, point.y, 'click'; }'
                }
                
                this.eyeState.calibrationData.points.push(point);
                calibrationDot.remove();
                resolve();
            }, CALIBRATION_POINT_DISPLAY_TIME);
        });
    }
    
    /**
     * キャリブレーション精度をテスト
     */ : undefined
    private async testCalibrationAccuracy(): Promise<number> { if (!this.webgazer) return 0,
        
        const testPoints = this.generateCalibrationPoints(),
        const accuracyResults: number[] = [],
        
        for (const point of testPoints) {
        
            const prediction = await this.testSinglePoint(point),
            if (prediction) {
                const distance = Math.sqrt(),
                    Math.pow(prediction.x - point.x, 2) + ,
                    Math.pow(prediction.y - point.y, 2),
                const accuracy = Math.max(0, 1 - distance / ACCURACY_DISTANCE_THRESHOLD) }
                accuracyResults.push(accuracy); }
}
        
        return accuracyResults.length > 0 ? undefined : undefined
            accuracyResults.reduce((sum, acc) => sum + acc, 0) / accuracyResults.length: 0,
    
    /**
     * 単一ポイントの精度をテスト
     */
    private async testSinglePoint(point: CalibrationPoint): Promise<GazePoint | null> { return new Promise<GazePoint | null>((resolve) => { 
            // テスト用の視線予測を取得
            const predictions: GazePoint[] = [],
            let sampleCount = 0,
            
            const gazeListener: GazeListenerCallback = (data: WebGazerPrediction | null) => {  }
                if (data && isValidGazePoint(data) && sampleCount < ACCURACY_TEST_SAMPLES) { }
                    predictions.push({ x: data.x, y: data.y  });
                    sampleCount++;
                    
                    if (sampleCount >= ACCURACY_TEST_SAMPLES) {
                    
                        this.webgazer?.removeGazeListener(gazeListener),
                        
                        // 平均を計算 : undefined
                        const avgPrediction: GazePoint = {
                            x: predictions.reduce((sum, p) => sum + p.x, 0) / predictions.length,
                    
                    
                            y: predictions.reduce((sum, p) => sum + p.y, 0) / predictions.length }
                        };
                        
                        resolve(avgPrediction);
                    }
};
            
            this.webgazer?.setGazeListener(gazeListener);
            
            // タイムアウト
            setTimeout(() => {  this.webgazer?.removeGazeListener(gazeListener) }
                resolve(null); }
            }, ACCURACY_TEST_TIMEOUT);
        });
    }
    
    /**
     * フィードバックを提供
     */ : undefined
    private provideFeedback(type: FeedbackType, data: FeedbackData = {}): void { // 視覚・音響・ハプティックフィードバック（省略） }
        console.log(`[EyeTrackingController] Feedback: ${type}`, data});
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): DetailedEyeTrackingStats { return { ...this.stats,
            isCalibrated: this.eyeState.isCalibrated };
            calibrationAccuracy: this.eyeState.calibrationData.accuracy }
            currentGaze: { ...this.eyeState.currentGaze,
            gazeHistoryLength: this.eyeState.gazeHistory.length } }
    
    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<EyeTrackingConfig>): void { ''
        Object.assign(this.eyeTrackingConfig, newConfig),
        console.log('[EyeTrackingController] Configuration, updated') }'
    
    /**
     * 視線追跡設定の取得
     */
    getConfig(): EyeTrackingConfig {
        return { ...this.eyeTrackingConfig }
    
    /**
     * 現在の視線状態を取得
     */
    getEyeState(): Readonly<EyeState> { return {  };
            ...this.eyeState }
            currentGaze: { ...this.eyeState.currentGaze,
            gazeHistory: [...this.eyeState.gazeHistory],
    calibrationData: { ...this.eyeState.calibrationData,
                points: [...this.eyeState.calibrationData.points]
        }
    
    /**
     * 視線ポインターの表示切り替え
     */'
    toggleGazePointer(show: boolean): void { ''
        if (this.gazePointer) {', ' }

            this.gazePointer.style.display = show ? 'block' : 'none'; 
    }
    
    /**
     * 滞留インジケーターの表示切り替え
     */'
    toggleDwellIndicator(show: boolean): void { ''
        if (this.dwellIndicator) {', ' }

            this.dwellIndicator.style.display = show ? 'block' : 'none'; 
    }
    
    /**
     * WebGazer予測点の表示切り替え
     */
    togglePredictionPoints(show: boolean): void { if (this.webgazer) {
            this.webgazer.showPredictionPoints(show) }
    }
    
    /**
     * キャリブレーション状態をリセット'
     */''
    resetCalibration()';'
        console.log('[EyeTrackingController] Calibration, reset');
    }
    
    /**
     * 視線履歴をクリア'
     */''
    clearGazeHistory()';'
        console.log('[EyeTrackingController] Gaze, history cleared);'
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup(): void { if (this.webgazer) {
            this.webgazer.end() }
        
        // UI要素を削除
        [this.gazePointer this.dwellIndicator this.calibrationInterface].forEach(element => {  '),'
            if (element) { }
                element.remove(); }
            }'}');
        ';'
        // CSS スタイルを削除
        const animationStyle = document.getElementById('eye-tracking-animations);'
        if (animationStyle) {

            animationStyle.remove() }

        console.log('[EyeTrackingController] Cleaned, up'); }

    }'}'