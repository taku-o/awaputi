/**
 * GestureRecognitionEngine - ジェスチャー認識エンジン
 * 
 * ジェスチャーパターンの定義、認識アルゴリズム、信頼度計算を専門的に管理します
 */
export class GestureRecognitionEngine {
    constructor(config) {
        this.config = config;
        
        // ジェスチャーパターン定義
        this.gesturePatterns = new Map([
            // 基本ジェスチャー
            ['tap', {
                type: 'touch',
                fingers: 1,
                duration: [50, 300],
                movement: [0, 10],
                action: 'click',
                alternatives: ['click', 'space', 'enter']
            }],
            ['longPress', {
                type: 'touch',
                fingers: 1,
                duration: [800, 2000],
                movement: [0, 15],
                action: 'contextMenu',
                alternatives: ['rightClick', 'ctrl+click']
            }],
            ['doubleTap', {
                type: 'touch',
                fingers: 1,
                duration: [50, 200],
                interval: [50, 400],
                movement: [0, 20],
                action: 'doubleClick',
                alternatives: ['doubleClick', 'enter']
            }],
            
            // スワイプジェスチャー
            ['swipeUp', {
                type: 'swipe',
                direction: [80, 100], // 角度範囲（度）
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'scrollUp',
                alternatives: ['arrowUp', 'pageUp', 'wheelUp']
            }],
            ['swipeDown', {
                type: 'swipe',
                direction: [260, 280],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'scrollDown',
                alternatives: ['arrowDown', 'pageDown', 'wheelDown']
            }],
            ['swipeLeft', {
                type: 'swipe',
                direction: [170, 190],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'navigateBack',
                alternatives: ['arrowLeft', 'backspace', 'escape']
            }],
            ['swipeRight', {
                type: 'swipe',
                direction: [-10, 10],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'navigateForward',
                alternatives: ['arrowRight', 'tab', 'enter']
            }],
            
            // マルチタッチジェスチャー
            ['pinchIn', {
                type: 'pinch',
                fingers: 2,
                direction: 'in',
                scale: [0.5, 1.0],
                action: 'zoomOut',
                alternatives: ['ctrl+-', 'minus']
            }],
            ['pinchOut', {
                type: 'pinch',
                fingers: 2,
                direction: 'out',
                scale: [1.0, 2.0],
                action: 'zoomIn',
                alternatives: ['ctrl+=', 'plus']
            }],
            ['twoFingerTap', {
                type: 'touch',
                fingers: 2,
                duration: [50, 300],
                movement: [0, 20],
                action: 'rightClick',
                alternatives: ['rightClick', 'contextMenu']
            }],
            ['threeFingerTap', {
                type: 'touch',
                fingers: 3,
                duration: [50, 300],
                movement: [0, 30],
                action: 'showMenu',
                alternatives: ['alt', 'menu', 'F10']
            }],
            
            // 片手操作専用ジェスチャー
            ['edgeSwipeLeft', {
                type: 'edgeSwipe',
                edge: 'left',
                distance: [30, 100],
                action: 'navigateBack',
                oneHandedOnly: true,
                alternatives: ['swipeRight']
            }],
            ['edgeSwipeRight', {
                type: 'edgeSwipe',
                edge: 'right',
                distance: [30, 100],
                action: 'showMenu',
                oneHandedOnly: true,
                alternatives: ['longPress']
            }],
            ['cornerTap', {
                type: 'cornerTap',
                corner: 'topRight',
                size: [50, 50],
                action: 'quickAction',
                oneHandedOnly: true,
                alternatives: ['doubleTap']
            }]
        ]);
        
        // カスタマイズされたジェスチャー
        this.customGestures = new Map();
        
        // 認識エンジン
        this.recognizers = new Map();
        this.recognitionThreshold = 0.8;
        this.maxBufferSize = 20;
        this.gestureBuffer = [];
        
        this.initializeRecognizers();
    }
    
    /**
     * 認識エンジンの初期化
     */
    initializeRecognizers() {
        this.recognizers.set('tap', this.createTapRecognizer());
        this.recognizers.set('swipe', this.createSwipeRecognizer());
        this.recognizers.set('pinch', this.createPinchRecognizer());
        this.recognizers.set('custom', this.createCustomRecognizer());
        
        console.log('Recognition engines initialized');
    }
    
    /**
     * タップ認識エンジン
     */
    createTapRecognizer() {
        return {
            recognize: (gestureData) => {
                const { duration, movement, fingers } = gestureData;
                
                // タップパターンのマッチング
                for (const [name, pattern] of this.gesturePatterns) {
                    if (pattern.type === 'touch' && 
                        this.matchesTapPattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
    }
    
    /**
     * スワイプ認識エンジン
     */
    createSwipeRecognizer() {
        return {
            recognize: (gestureData) => {
                const { direction, distance, velocity } = gestureData;
                
                // スワイプパターンのマッチング
                for (const [name, pattern] of this.gesturePatterns) {
                    if (pattern.type === 'swipe' && 
                        this.matchesSwipePattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
    }
    
    /**
     * ピンチ認識エンジン
     */
    createPinchRecognizer() {
        return {
            recognize: (gestureData) => {
                const { scale, fingers } = gestureData;
                
                if (fingers !== 2) return null;
                
                // ピンチパターンのマッチング
                for (const [name, pattern] of this.gesturePatterns) {
                    if (pattern.type === 'pinch' && 
                        this.matchesPinchPattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
    }
    
    /**
     * カスタム認識エンジン
     */
    createCustomRecognizer() {
        return {
            recognize: (gestureData) => {
                // カスタムジェスチャーの認識
                for (const [name, pattern] of this.customGestures) {
                    if (this.matchesCustomPattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateCustomConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
    }
    
    /**
     * ジェスチャー認識の実行
     */
    recognizeGesture(gestureData) {
        const recognitionResults = [];
        
        // 各認識エンジンで認識
        for (const [type, recognizer] of this.recognizers) {
            const result = recognizer.recognize(gestureData);
            if (result && result.confidence > this.recognitionThreshold) {
                recognitionResults.push(result);
            }
        }
        
        // 最も信頼度の高い結果を選択
        if (recognitionResults.length > 0) {
            const bestResult = recognitionResults.reduce((best, current) => 
                current.confidence > best.confidence ? current : best
            );
            
            return bestResult;
        }
        
        return null;
    }
    
    /**
     * リアルタイムジェスチャー認識
     */
    performRealtimeRecognition(partialGestureData) {
        // 進行中のジェスチャーの中間認識
        const prediction = this.predictGesture(partialGestureData);
        if (prediction && prediction.confidence > 0.5) {
            return prediction;
        }
        
        return null;
    }
    
    /**
     * ジェスチャー予測
     */
    predictGesture(partialData) {
        // 部分的なデータから完全なジェスチャーを予測
        for (const [name, pattern] of this.gesturePatterns) {
            const partialConfidence = this.calculatePartialConfidence(partialData, pattern);
            if (partialConfidence > 0.5) {
                return { gesture: name, confidence: partialConfidence, isPrediction: true };
            }
        }
        
        return null;
    }
    
    /**
     * タップパターンマッチング
     */
    matchesTapPattern(gestureData, pattern) {
        const { duration, movement, fingers } = gestureData;
        
        return duration >= pattern.duration[0] && 
               duration <= pattern.duration[1] &&
               movement <= pattern.movement[1] &&
               fingers === pattern.fingers;
    }
    
    /**
     * スワイプパターンマッチング
     */
    matchesSwipePattern(gestureData, pattern) {
        const { direction, distance, velocity } = gestureData;
        
        return direction >= pattern.direction[0] && 
               direction <= pattern.direction[1] &&
               distance >= pattern.distance[0] &&
               distance <= pattern.distance[1] &&
               velocity >= pattern.velocity[0] &&
               velocity <= pattern.velocity[1];
    }
    
    /**
     * ピンチパターンマッチング
     */
    matchesPinchPattern(gestureData, pattern) {
        const { scale, fingers } = gestureData;
        
        return fingers === pattern.fingers &&
               scale >= pattern.scale[0] &&
               scale <= pattern.scale[1];
    }
    
    /**
     * カスタムパターンマッチング
     */
    matchesCustomPattern(gestureData, pattern) {
        // カスタムパターンの複雑なマッチング
        return this.calculateCustomConfidence(gestureData, pattern) > 0.8;
    }
    
    /**
     * 信頼度計算
     */
    calculateConfidence(gestureData, pattern) {
        let confidence = 1.0;
        
        // 各パラメーターの一致度を計算
        if (pattern.duration) {
            const durationMatch = this.calculateRangeMatch(gestureData.duration, pattern.duration);
            confidence *= durationMatch;
        }
        
        if (pattern.distance) {
            const distanceMatch = this.calculateRangeMatch(gestureData.distance, pattern.distance);
            confidence *= distanceMatch;
        }
        
        if (pattern.velocity) {
            const velocityMatch = this.calculateRangeMatch(gestureData.velocity, pattern.velocity);
            confidence *= velocityMatch;
        }
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    /**
     * カスタム信頼度計算
     */
    calculateCustomConfidence(gestureData, pattern) {
        // カスタムパターン用の信頼度計算
        if (!pattern.customMatcher) {
            return 0.5; // デフォルト値
        }
        
        return pattern.customMatcher(gestureData);
    }
    
    /**
     * 部分信頼度計算
     */
    calculatePartialConfidence(partialData, pattern) {
        // 部分的なデータでの信頼度計算
        let confidence = 0.5;
        
        if (partialData.direction !== undefined && pattern.direction) {
            const directionMatch = this.calculateRangeMatch(partialData.direction, pattern.direction);
            confidence *= directionMatch;
        }
        
        return confidence;
    }
    
    /**
     * 範囲マッチング計算
     */
    calculateRangeMatch(value, range) {
        if (value >= range[0] && value <= range[1]) {
            return 1.0;
        }
        
        // 範囲外の場合、距離に基づいて部分的な信頼度を計算
        const rangeSize = range[1] - range[0];
        const center = (range[0] + range[1]) / 2;
        const distance = Math.abs(value - center);
        const maxDistance = rangeSize / 2;
        
        return Math.max(0, 1 - (distance / maxDistance));
    }
    
    /**
     * カスタムジェスチャーの追加
     */
    addCustomGesture(name, pattern) {
        this.customGestures.set(name, pattern);
        console.log(`Custom gesture added to recognition engine: ${name}`);
    }
    
    /**
     * ジェスチャーパターンの取得
     */
    getGesturePattern(name) {
        return this.gesturePatterns.get(name) || this.customGestures.get(name);
    }
    
    /**
     * 全ジェスチャーパターンの取得
     */
    getAllGesturePatterns() {
        const all = new Map();
        
        // 標準ジェスチャーを追加
        for (const [name, pattern] of this.gesturePatterns) {
            all.set(name, pattern);
        }
        
        // カスタムジェスチャーを追加
        for (const [name, pattern] of this.customGestures) {
            all.set(name, pattern);
        }
        
        return all;
    }
    
    /**
     * ジェスチャー閾値の調整
     */
    adjustGestureThresholds(gestureName, gestureData) {
        const pattern = this.getGesturePattern(gestureName);
        if (!pattern) return;
        
        // 成功したジェスチャーに基づいて閾値を微調整
        if (pattern.duration && gestureData.duration) {
            const adjustment = gestureData.duration * 0.1;
            pattern.duration[0] = Math.max(0, pattern.duration[0] - adjustment);
            pattern.duration[1] = pattern.duration[1] + adjustment;
        }
        
        if (pattern.distance && gestureData.distance) {
            const adjustment = gestureData.distance * 0.1;
            pattern.distance[0] = Math.max(0, pattern.distance[0] - adjustment);
            pattern.distance[1] = pattern.distance[1] + adjustment;
        }
    }
    
    /**
     * 認識エンジンの統計情報
     */
    getEngineStats() {
        return {
            totalPatterns: this.gesturePatterns.size,
            customPatterns: this.customGestures.size,
            recognizers: this.recognizers.size,
            recognitionThreshold: this.recognitionThreshold,
            bufferSize: this.gestureBuffer.length
        };
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        if (newConfig.recognitionThreshold) {
            this.recognitionThreshold = newConfig.recognitionThreshold;
        }
        
        if (newConfig.maxBufferSize) {
            this.maxBufferSize = newConfig.maxBufferSize;
        }
        
        console.log('GestureRecognitionEngine configuration updated');
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.gesturePatterns.clear();
        this.customGestures.clear();
        this.recognizers.clear();
        this.gestureBuffer = [];
        
        console.log('GestureRecognitionEngine destroyed');
    }
}