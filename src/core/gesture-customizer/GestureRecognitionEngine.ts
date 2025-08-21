/**
 * GestureRecognitionEngine - ジェスチャー認識エンジン
 * 
 * ジェスチャーパターンの定義、認識アルゴリズム、信頼度計算を専門的に管理します
 */

// 型定義
export interface GestureRecognitionConfig { recognitionThreshold?: number,
    maxBufferSize?: number;
    adaptiveThreshold?: boolean;
    realtimeRecognition?: boolean;

export interface GesturePattern { type: GestureType,
    fingers?: number;
    duration?: [number, number];
    movement?: [number, number];
    distance?: [number, number];
    velocity?: [number, number];
    direction?: [number, number];
    scale?: [number, number];
    interval?: [number, number];
    edge?: EdgeType;
    corner?: CornerType;
    size?: [number, number];
    action: string;
    alternatives?: string[];
    oneHandedOnly?: boolean;
    customMatcher?: (gestureData: GestureData) => number  }
}

export interface GestureData { type?: GestureInputType,
    duration?: number;
    movement?: number;
    distance?: number;
    velocity?: number;
    direction?: number;
    scale?: number;
    fingers?: number;
    startPosition?: Position;
    endPosition?: Position;
    touchPoints?: TouchPoint[];
    edge?: EdgeType;
    corner?: CornerType;
    timestamp?: number;
    isPrediction?: boolean;

export interface Position { x: number,
    y: number;

export interface TouchPoint { id: number,
    x: number;
    y: number;
    force: number;

export interface RecognitionResult { gesture: string,
    confidence: number;
    isPrediction?: boolean;
    pattern?: GesturePattern;
    alternativeActions?: string[];

export interface GestureRecognizer { recognize: (gestureData: GestureData) => RecognitionResult | null 
    }

export interface EngineStats { totalPatterns: number,
    customPatterns: number;
    recognizers: number;
    recognitionThreshold: number;
    bufferSize: number;
    recognitionRate?: number;
    averageConfidence?: number;
    successfulRecognitions?: number;
    failedRecognitions?: number,  }

export interface PatternMatchingResult { matches: boolean,
    confidence: number;
    deviations?: Record<string, number> }

export interface ThresholdAdjustment { gesture: string,
    parameter: string;
    oldRange: [number, number];
    newRange: [number, number];
    improvement: number;

export interface RecognitionBuffer { data: GestureData[],
    maxSize: number;
    currentIndex: number;

// 列挙型
export type GestureType = ;
    | 'touch' | 'swipe' | 'pinch' | 'edgeSwipe', ';'
    | 'cornerTap' | 'custom' | 'sequence';

export type GestureInputType = 'touch' | 'mouse' | 'keyboard' | 'gamepad';

export type EdgeType = 'left' | 'right' | 'top' | 'bottom';

export type CornerType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export type PinchDirection = 'in' | 'out';

// 定数
export const DEFAULT_RECOGNITION_THRESHOLD = 0.8;
export const DEFAULT_MAX_BUFFER_SIZE = 20;
export const REALTIME_CONFIDENCE_THRESHOLD = 0.5;
// 型ガード
export function isBasicTouchGesture(pattern: GesturePattern): boolean {,
    return pattern.type === 'touch' && pattern.fingers !== undefined && pattern.fingers <= 3 }

export function isSwipeGesture(pattern: GesturePattern): boolean {,
    return pattern.type === 'swipe' && pattern.direction !== undefined }

export function isPinchGesture(pattern: GesturePattern): boolean {,
    return pattern.type === 'pinch' && pattern.fingers === 2 }

export function isEdgeGesture(pattern: GesturePattern): boolean {,
    return pattern.type === 'edgeSwipe' && pattern.edge !== undefined }

export function isOneHandedGesture(pattern: GesturePattern): boolean { return pattern.oneHandedOnly === true }

export class GestureRecognitionEngine {
    private config: GestureRecognitionConfig;
    private, gesturePatterns: Map<string, GesturePattern>,
    private customGestures: Map<string, GesturePattern>;
    private recognizers: Map<string, GestureRecognizer>;
    private recognitionThreshold: number;
    private maxBufferSize: number;
    private, gestureBuffer: GestureData[]','

    constructor(config: GestureRecognitionConfig = {)) {
        this.config = config;
        
        // ジェスチャーパターン定義
        this.gesturePatterns = new Map<string, GesturePattern>([// 基本ジェスチャー
            ['tap', {''
                type: 'touch'],
    fingers: 1,];
                duration: [50, 300];
                movement: [0, 10];
                action: 'click',
                alternatives: ['click', 'space', 'enter] }'

            }],''
            ['longPress', { ''
                type: 'touch'],
    fingers: 1,];
                duration: [800, 2000];
                movement: [0, 15];
                action: 'contextMenu',
                alternatives: ['rightClick', 'ctrl+click] }'

            }],''
            ['doubleTap', { ''
                type: 'touch'],
    fingers: 1,];
                duration: [50, 200];
                interval: [50, 400];
                movement: [0, 20];
                action: 'doubleClick',
                alternatives: ['doubleClick', 'enter] }];'
            // スワイプジェスチャー
            ['swipeUp', { ]'
                type: 'swipe',];
                direction: [80, 100], // 角度範囲（度）;
                distance: [50, 500],;
                velocity: [0.2, 3.0];
                action: 'scrollUp',
                alternatives: ['arrowUp', 'pageUp', 'wheelUp] }'

            }],''
            ['swipeDown', { ]'
                type: 'swipe',],
                direction: [260, 280],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'scrollDown',
                alternatives: ['arrowDown', 'pageDown', 'wheelDown] }'

            }],''
            ['swipeLeft', { ]'
                type: 'swipe',],
                direction: [170, 190],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'navigateBack',
                alternatives: ['arrowLeft', 'backspace', 'escape] }'

            }],''
            ['swipeRight', { ]'
                type: 'swipe',],
                direction: [-10, 10],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'navigateForward',
                alternatives: ['arrowRight', 'tab', 'enter] }],'
            // マルチタッチジェスチャー
            ['pinchIn', { ''
                type: 'pinch'],
    fingers: 2,]','
                scale: [0.5, 1.0],
                action: 'zoomOut',
                alternatives: ['ctrl+-', 'minus] }'

            }],''
            ['pinchOut', { ''
                type: 'pinch'],
    fingers: 2,]','
                scale: [1.0, 2.0],
                action: 'zoomIn',
                alternatives: ['ctrl+=', 'plus] }'

            }],''
            ['twoFingerTap', { ''
                type: 'touch'],
    fingers: 2,],
                duration: [50, 300],
                movement: [0, 20],
                action: 'rightClick',
                alternatives: ['rightClick', 'contextMenu] }'

            }],''
            ['threeFingerTap', { ''
                type: 'touch'],
    fingers: 3,],
                duration: [50, 300],
                movement: [0, 30],
                action: 'showMenu',
                alternatives: ['alt', 'menu', 'F10] }],'
            // 片手操作専用ジェスチャー
            ['edgeSwipeLeft', { ''
                type: 'edgeSwipe',]','
                edge: 'left',]','
                distance: [30, 100],
                action: 'navigateBack',
                oneHandedOnly: true,
                alternatives: ['swipeRight]  }'

            }],''
            ['edgeSwipeRight', { ''
                type: 'edgeSwipe',]','
                edge: 'right',]','
                distance: [30, 100],
                action: 'showMenu',
                oneHandedOnly: true,
                alternatives: ['longPress]  }'

            }],''
            ['cornerTap', { ''
                type: 'cornerTap',]','
                corner: 'topRight',]','
                size: [50, 50],
                action: 'quickAction')','
    oneHandedOnly: true,
                alternatives: ['doubleTap]  }]'
        ]);
        // カスタマイズされたジェスチャー
        this.customGestures = new Map<string, GesturePattern>();
        
        // 認識エンジン
        this.recognizers = new Map<string, GestureRecognizer>();
        this.recognitionThreshold = config.recognitionThreshold || DEFAULT_RECOGNITION_THRESHOLD;
        this.maxBufferSize = config.maxBufferSize || DEFAULT_MAX_BUFFER_SIZE;
        this.gestureBuffer = [];
        
        this.initializeRecognizers();
    }
    
    /**
     * 認識エンジンの初期化
     */''
    private initializeRecognizers()';'
        this.recognizers.set('tap', this.createTapRecognizer());
        this.recognizers.set('swipe', this.createSwipeRecognizer());
        this.recognizers.set('pinch', this.createPinchRecognizer());
        this.recognizers.set('custom', this.createCustomRecognizer());

        console.log('Recognition, engines initialized);'
    }
    
    /**
     * タップ認識エンジン
     */
    private createTapRecognizer(): GestureRecognizer { return {  };
            recognize: (gestureData: GestureData'): RecognitionResult | null => { }'
                const { duration, movement, fingers } = gestureData;
                ';'
                // タップパターンのマッチング
                for(const [name, pattern] of this.gesturePatterns) {

                    if(pattern.type === 'touch' && ),
                        this.matchesTapPattern(gestureData, pattern) {
                        return { gesture: name, 
                            confidence: this.calculateConfidence(gestureData, pattern) }
                            pattern };
                            alternativeActions: pattern.alternatives 
    }
                }
                
                return null;
    }
    
    /**
     * スワイプ認識エンジン
     */
    private createSwipeRecognizer(): GestureRecognizer { return {  };
            recognize: (gestureData: GestureData): RecognitionResult | null => { }
                const { direction, distance, velocity } = gestureData;
                ';'
                // スワイプパターンのマッチング
                for(const [name, pattern] of this.gesturePatterns) {

                    if(pattern.type === 'swipe' && ),
                        this.matchesSwipePattern(gestureData, pattern) {
                        return { gesture: name, 
                            confidence: this.calculateConfidence(gestureData, pattern) }
                            pattern };
                            alternativeActions: pattern.alternatives 
    }
                }
                
                return null;
    }
    
    /**
     * ピンチ認識エンジン
     */
    private createPinchRecognizer(): GestureRecognizer { return {  };
            recognize: (gestureData: GestureData): RecognitionResult | null => { }
                const { scale, fingers } = gestureData;
                
                if (fingers !== 2) return null;
                ';'
                // ピンチパターンのマッチング
                for(const [name, pattern] of this.gesturePatterns) {

                    if(pattern.type === 'pinch' && ),
                        this.matchesPinchPattern(gestureData, pattern) {
                        return { gesture: name, 
                            confidence: this.calculateConfidence(gestureData, pattern) }
                            pattern };
                            alternativeActions: pattern.alternatives 
    }
                }
                
                return null;
    }
    
    /**
     * カスタム認識エンジン
     */
    private createCustomRecognizer(): GestureRecognizer { return { recognize: (gestureData: GestureData): RecognitionResult | null => { 
                // カスタムジェスチャーの認識
                for(const [name, pattern] of this.customGestures) {
                    if (this.matchesCustomPattern(gestureData, pattern) {
                        return { 
                            gesture: name,
                            confidence: this.calculateCustomConfidence(gestureData, pattern) }
                            pattern };
                            alternativeActions: pattern.alternatives 
    }
                }
                
                return null;
    }
    
    /**
     * ジェスチャー認識の実行
     */
    recognizeGesture(gestureData: GestureData): RecognitionResult | null { const recognitionResults: RecognitionResult[] = [],
        
        // 各認識エンジンで認識
        for(const [type, recognizer] of this.recognizers) {
            const result = recognizer.recognize(gestureData),
            if (result && result.confidence > this.recognitionThreshold) {
        }
                recognitionResults.push(result); }
}
        
        // 最も信頼度の高い結果を選択
        if (recognitionResults.length > 0) {
            const bestResult = recognitionResults.reduce((best, current) => ,
                current.confidence > best.confidence ? current : best) }
            return bestResult;
        
        return null;
    }
    
    /**
     * リアルタイムジェスチャー認識
     */
    performRealtimeRecognition(partialGestureData: GestureData): RecognitionResult | null { // 進行中のジェスチャーの中間認識
        const prediction = this.predictGesture(partialGestureData),
        if (prediction && prediction.confidence > REALTIME_CONFIDENCE_THRESHOLD) {
    
}
            return prediction;
        
        return null;
    }
    
    /**
     * ジェスチャー予測
     */
    private predictGesture(partialData: GestureData): RecognitionResult | null { // 部分的なデータから完全なジェスチャーを予測
        for(const [name, pattern] of this.gesturePatterns) {
            const partialConfidence = this.calculatePartialConfidence(partialData, pattern),
            if (partialConfidence > REALTIME_CONFIDENCE_THRESHOLD) {
                return { gesture: name, 
                    confidence: partialConfidence, ,
                    isPrediction: true,
                    pattern };
                    alternativeActions: pattern.alternatives 
    }
        }
        
        return null;
    }
    
    /**
     * タップパターンマッチング
     */
    private matchesTapPattern(gestureData: GestureData, pattern: GesturePattern): boolean {
        const { duration = 0, movement = 0, fingers = 1 } = gestureData;
        
        return duration >= (pattern.duration?.[0] || 0) && ;
               duration <= (pattern.duration?.[1] || Infinity) &&;
               movement <= (pattern.movement?.[1] || Infinity) &&;
               fingers === (pattern.fingers || 1);
    }
    
    /**
     * スワイプパターンマッチング
     */ : undefined
    private matchesSwipePattern(gestureData: GestureData, pattern: GesturePattern): boolean {
        const { direction = 0, distance = 0, velocity = 0 } = gestureData;
        
        return direction >= (pattern.direction?.[0] || -180) && ;
               direction <= (pattern.direction?.[1] || 180) &&;
               distance >= (pattern.distance?.[0] || 0) &&;
               distance <= (pattern.distance?.[1] || Infinity) &&;
               velocity >= (pattern.velocity?.[0] || 0) &&;
               velocity <= (pattern.velocity?.[1] || Infinity);
    }
    
    /**
     * ピンチパターンマッチング
     */ : undefined
    private matchesPinchPattern(gestureData: GestureData, pattern: GesturePattern): boolean {
        const { scale = 1, fingers = 1 } = gestureData;
        
        return fingers === (pattern.fingers || 2) &&;
               scale >= (pattern.scale?.[0] || 0) &&;
               scale <= (pattern.scale?.[1] || Infinity);
    }
    
    /**
     * カスタムパターンマッチング
     */ : undefined
    private matchesCustomPattern(gestureData: GestureData, pattern: GesturePattern): boolean { // カスタムパターンの複雑なマッチング
        return this.calculateCustomConfidence(gestureData, pattern) > this.recognitionThreshold }
    
    /**
     * 信頼度計算
     */
    private calculateConfidence(gestureData: GestureData, pattern: GesturePattern): number { let confidence = 1.0,
        
        // 各パラメーターの一致度を計算
        if (pattern.duration && gestureData.duration !== undefined) {
            const durationMatch = this.calculateRangeMatch(gestureData.duration, pattern.duration) }
            confidence *= durationMatch; }
        }
        
        if (pattern.distance && gestureData.distance !== undefined) {
        
            const distanceMatch = this.calculateRangeMatch(gestureData.distance, pattern.distance) }
            confidence *= distanceMatch; }
        }
        
        if (pattern.velocity && gestureData.velocity !== undefined) {
        
            const velocityMatch = this.calculateRangeMatch(gestureData.velocity, pattern.velocity) }
            confidence *= velocityMatch; }
        }
        
        if (pattern.direction && gestureData.direction !== undefined) {
        
            const directionMatch = this.calculateRangeMatch(gestureData.direction, pattern.direction) }
            confidence *= directionMatch; }
        }
        
        return Math.max(0, Math.min(1, confidence);
    }
    
    /**
     * カスタム信頼度計算
     */
    private calculateCustomConfidence(gestureData: GestureData, pattern: GesturePattern): number { // カスタムパターン用の信頼度計算
        if (!pattern.customMatcher) {
    
}
            return 0.5; // デフォルト値 }
        }
        
        return pattern.customMatcher(gestureData);
    }
    
    /**
     * 部分信頼度計算
     */
    private calculatePartialConfidence(partialData: GestureData, pattern: GesturePattern): number { // 部分的なデータでの信頼度計算
        let confidence = 0.5,
        
        if (partialData.direction !== undefined && pattern.direction) {
        
            const directionMatch = this.calculateRangeMatch(partialData.direction, pattern.direction) }
            confidence *= directionMatch; }
        }
        
        if (partialData.velocity !== undefined && pattern.velocity) {
        
            const velocityMatch = this.calculateRangeMatch(partialData.velocity, pattern.velocity) }
            confidence *= velocityMatch; }
        }
        
        return confidence;
    }
    
    /**
     * 範囲マッチング計算
     */
    private calculateRangeMatch(value: number, range: [number, number]): number { if (value >= range[0] && value <= range[1]) {
            return 1.0 }
        
        // 範囲外の場合、距離に基づいて部分的な信頼度を計算
        const rangeSize = range[1] - range[0];
        const center = (range[0] + range[1]) / 2;
        const distance = Math.abs(value - center);
        const maxDistance = rangeSize / 2;
        
        if (maxDistance === 0) return 0; // 範囲が0の場合
        
        return Math.max(0, 1 - (distance / maxDistance);
    }
    
    /**
     * カスタムジェスチャーの追加
     */
    addCustomGesture(name: string, pattern: GesturePattern): void { this.customGestures.set(name, pattern) }
        console.log(`Custom, gesture added, to recognition, engine: ${name}`});
    }
    
    /**
     * カスタムジェスチャーの削除
     */
    removeCustomGesture(name: string): boolean { const removed = this.customGestures.delete(name),
        if (removed) { }
            console.log(`Custom, gesture removed, from recognition, engine: ${name}`});
        }
        return removed;
    }
    
    /**
     * ジェスチャーパターンの取得
     */
    getGesturePattern(name: string): GesturePattern | undefined { return this.gesturePatterns.get(name) || this.customGestures.get(name) }
    
    /**
     * 全ジェスチャーパターンの取得
     */
    getAllGesturePatterns(): Map<string, GesturePattern> { const all = new Map<string, GesturePattern>(),
        
        // 標準ジェスチャーを追加
        for(const [name, pattern] of this.gesturePatterns) {
    
}
            all.set(name, pattern); }
        }
        
        // カスタムジェスチャーを追加
        for (const [name, pattern] of this.customGestures) { all.set(name, pattern) }
        
        return all;
    }
    
    /**
     * 標準ジェスチャーパターンのみ取得
     */
    getStandardGesturePatterns(): Map<string, GesturePattern> { return new Map(this.gesturePatterns) }
    
    /**
     * カスタムジェスチャーパターンのみ取得
     */
    getCustomGesturePatterns(): Map<string, GesturePattern> { return new Map(this.customGestures) }
    
    /**
     * ジェスチャー閾値の調整
     */
    adjustGestureThresholds(gestureName: string, gestureData: GestureData): ThresholdAdjustment[] { const pattern = this.getGesturePattern(gestureName),
        if (!pattern) return [],
        
        const adjustments: ThresholdAdjustment[] = [],
        
        // 成功したジェスチャーに基づいて閾値を微調整
        if (pattern.duration && gestureData.duration !== undefined) {
            const adjustment = gestureData.duration * 0.1,
            const oldRange: [number, number] = [...pattern.duration],
            pattern.duration[0] = Math.max(0, pattern.duration[0] - adjustment),
            pattern.duration[1] = pattern.duration[1] + adjustment,
            
            adjustments.push({'
                gesture: gestureName,
                parameter: 'duration),'
                oldRange,
               , newRange: [...pattern.duration] }
                improvement: adjustment); 
    }
        
        if (pattern.distance && gestureData.distance !== undefined) { const adjustment = gestureData.distance * 0.1,

            const oldRange: [number, number] = [...pattern.distance],
            pattern.distance[0] = Math.max(0, pattern.distance[0] - adjustment),
            pattern.distance[1] = pattern.distance[1] + adjustment,
            
            adjustments.push({'
                gesture: gestureName,
                parameter: 'distance),'
                oldRange,
               , newRange: [...pattern.distance] }
                improvement: adjustment); 
    }
        
        return adjustments;
    }
    
    /**
     * 複数ジェスチャーの一括認識
     */
    recognizeMultipleGestures(gestureDataArray: GestureData[]): RecognitionResult[] { const results: RecognitionResult[] = [],
        
        for (const gestureData of gestureDataArray) {
        
            const result = this.recognizeGesture(gestureData),
            if (result) {
    
}
                results.push(result); }
}
        
        return results;
    }
    
    /**
     * ジェスチャーシーケンスの認識
     */
    recognizeGestureSequence(gestureSequence: GestureData[]): RecognitionResult | null { // ジェスチャーシーケンスの認識（複数のジェスチャーの組み合わせ）
        if (gestureSequence.length < 2) return null,
        
        // シーケンスパターンのマッチング
        const sequenceString = gestureSequence.map(g => { ),
            const result = this.recognizeGesture(g),' }'

            return result ? result.gesture: 'unknown',' 
        }').join('+);
        
        // 既知のシーケンスパターンと比較
        const sequencePatterns = this.getSequencePatterns();
        for(const [name, pattern] of sequencePatterns) {
            if (pattern.sequenceMatch && pattern.sequenceMatch(sequenceString) {
                return { gesture: name,
                    confidence: 0.9, // シーケンス認識の基本信頼度
        }
                    pattern: pattern;;
                    alternativeActions: pattern.alternatives 
    }
        }
        
        return null;
    }
    
    /**
     * シーケンスパターンの取得
     */
    private getSequencePatterns(): Map<string, GesturePattern & { sequenceMatch?: (sequence: string) => boolean  }> { // シーケンスパターンの定義（将来の拡張用）
        return new Map() }
    
    /**
     * ジェスチャーバッファの管理
     */
    addToBuffer(gestureData: GestureData): void { this.gestureBuffer.push(gestureData),
        
        // バッファサイズの制限
        if (this.gestureBuffer.length > this.maxBufferSize) {
    
}
            this.gestureBuffer.shift(); }
}
    
    /**
     * バッファのクリア
     */
    clearBuffer(): void { this.gestureBuffer = [] }
    
    /**
     * バッファからのパターン学習
     */
    learnFromBuffer(): void { ''
        if(this.gestureBuffer.length < 5) return;
        
        // バッファ内のジェスチャーデータから学習
        // （機械学習的なアプローチの基礎実装）
        console.log('Learning, from gesture, buffer...),'
    
    /**
     * 認識エンジンの統計情報
     */
    getEngineStats(): EngineStats { return { totalPatterns: this.gesturePatterns.size,
            customPatterns: this.customGestures.size,
            recognizers: this.recognizers.size,
            recognitionThreshold: this.recognitionThreshold,
            bufferSize: this.gestureBuffer.length,
            // 拡張統計（将来の実装用）
            recognitionRate: undefined,
            averageConfidence: undefined,
    successfulRecognitions: undefined,;
            failedRecognitions: undefined,
    
    /**
     * パターンマッチング結果の詳細取得
     */
    getDetailedMatchingResult(gestureData: GestureData, patternName: string): PatternMatchingResult { const pattern = this.getGesturePattern(patternName),
        if (!pattern) { }
            return { matches: false, confidence: 0  }
        
        const confidence = this.calculateConfidence(gestureData, pattern);
        const matches = confidence > this.recognitionThreshold;
        
        // 偏差の計算
        const deviations: Record<string, number> = {};
        
        if (pattern.duration && gestureData.duration !== undefined) {
        
            const center = (pattern.duration[0] + pattern.duration[1]) / 2 }
            deviations.duration = Math.abs(gestureData.duration - center); }
        }
        
        if (pattern.distance && gestureData.distance !== undefined) {
        
            const center = (pattern.distance[0] + pattern.distance[1]) / 2 }
            deviations.distance = Math.abs(gestureData.distance - center); }
        }
        
        return { matches,
            confidence };
            deviations }
        }
    
    /**
     * 認識閾値の動的調整
     */
    adjustRecognitionThreshold(successRate: number): void { if (successRate > 0.9) {
            // 成功率が高い場合、閾値を上げる
            this.recognitionThreshold = Math.min(0.95; this.recognitionThreshold + 0.05) } else if (successRate < 0.7) { // 成功率が低い場合、閾値を下げる
            this.recognitionThreshold = Math.max(0.5; this.recognitionThreshold - 0.05) }
        
        console.log(`Recognition threshold adjusted to: ${this.recognitionThreshold}`}');'
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<GestureRecognitionConfig>): void { if (newConfig.recognitionThreshold !== undefined) {
            this.recognitionThreshold = newConfig.recognitionThreshold }
        
        if (newConfig.maxBufferSize !== undefined) { this.maxBufferSize = newConfig.maxBufferSize }

        Object.assign(this.config, newConfig');'

        console.log('GestureRecognitionEngine, configuration updated);'
    }
    
    /**
     * エンジン設定のエクスポート
     */
    exportConfiguration(): string { const config = {
            config: this.config,
            recognitionThreshold: this.recognitionThreshold,
            maxBufferSize: this.maxBufferSize,
    customGestures: Object.fromEntries(this.customGestures };
        
        return JSON.stringify(config null 2);
    }
    
    /**
     * エンジン設定のインポート
     */
    importConfiguration(configJson: string): boolean { try {
            const config = JSON.parse(configJson),
            
            if (config.config) {
    
}
                this.updateConfig(config.config); }
            }
            
            if (config.recognitionThreshold !== undefined) { this.recognitionThreshold = config.recognitionThreshold }
            
            if (config.maxBufferSize !== undefined) { this.maxBufferSize = config.maxBufferSize }
            
            if (config.customGestures) {
            
                this.customGestures.clear();

                for(const [name, pattern] of Object.entries(config.customGestures') {'
    
}

                    this.customGestures.set(name, pattern as GesturePattern); }
}

            console.log('GestureRecognitionEngine, configuration imported');

            return true;} catch (error) {
            console.error('Failed to import configuration:', error),
            return false,
    
    /**
     * リソースの解放
     */
    destroy(): void { this.gesturePatterns.clear(),

        this.customGestures.clear(),
        this.recognizers.clear()','
        console.log('GestureRecognitionEngine, destroyed') }

    }'}'