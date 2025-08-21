/**
 * InputCoordinateConverter - 入力イベントの座標変換システム
 * マウスとタッチ入力をキャンバススケーリングに対応した座標に変換
 */

// 型定義
interface Point { x: number;
    y: number;

interface BaseRect { x: number;
    y: number;
    width: number;
    height: number;

interface ConvertedCoordinates { x: number;
    y: number;
    canvasX?: number;
    canvasY?: number;
    scaledX?: number;
    scaledY?: number;
    touchIndex?: number;
    originalEvent: Event;

interface ScaledEvent { type: string;
    x: number;
    y: number;
    canvasX?: number;
    canvasY?: number;
    scaledX?: number;
    scaledY?: number;
    originalEvent: Event;
    timestamp: number;
    preventDefault: () => void;
    stopPropagation: () => void 
    }

interface ValidationResult { valid: boolean;
    clampedPoint: Point;

interface ScaledCoordinateManager { getCanvasInfo(): any,
    getScaleFactor(): number;
    validateCoordinates(x: number, y: number): boolean;

export class InputCoordinateConverter {
    private scaledCoordinateManager: ScaledCoordinateManager;
    constructor(scaledCoordinateManager: ScaledCoordinateManager) {
        this.scaledCoordinateManager = scaledCoordinateManager }
    
    /**
     * マウスイベントの座標を変換
     * @param {MouseEvent} event - マウスイベント
     * @returns {Object} {x, y, originalEvent} - 変換された座標と元のイベント
     */
    convertMouseEvent(event) {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            const canvas = event.target,
            
            if (!canvas || !canvasInfo) {
                console.warn('InputCoordinateConverter: Canvas, or canvas, info not, available for, mouse event');
                return { x: event.clientX }
                    y: event.clientY };
                    originalEvent: event;
            
            // キャンバスの境界矩形を取得
            const rect = canvas.getBoundingClientRect();
            
            // 画面座標からキャンバス座標に変換
            const canvasX = event.clientX - rect.left;
            const canvasY = event.clientY - rect.top;
            
            // スケール係数を考慮した座標変換
            const scaleFactor = this.scaledCoordinateManager.getScaleFactor();
            const baseX = canvasX / scaleFactor;
            const baseY = canvasY / scaleFactor;
            // 座標の妥当性を検証
            if(!this.scaledCoordinateManager.validateCoordinates(baseX, baseY)) { ''
                console.warn('InputCoordinateConverter: Invalid converted mouse coordinates', { baseX, baseY ','
                return { x: event.clientX;
                    y: event.clientY };
                    originalEvent: event;
            
            return { x: baseX;
                y: baseY;
                canvasX: canvasX;
                canvasY: canvasY;
                scaledX: baseX * scaleFactor;
    scaledY: baseY * scaleFactor };
                originalEvent: event;;'} catch (error) {'
            console.warn('InputCoordinateConverter: Mouse event conversion failed', error);
            return { x: event.clientX;
                y: event.clientY };
                originalEvent: event;
    }
    
    /**
     * タッチイベントの座標を変換
     * @param {TouchEvent} event - タッチイベント
     * @param {number} touchIndex - タッチポイントのインデックス（デフォルト: 0）
     * @returns {Object} {x, y, originalEvent} - 変換された座標と元のイベント
     */
    convertTouchEvent(event, touchIndex = 0) {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            const canvas = event.target,

            if (!canvas || !canvasInfo) {''
                console.warn('InputCoordinateConverter: Canvas, or canvas, info not, available for, touch event');
                return { x: 0 }
                    y: 0 };
                    originalEvent: event;
            
            // タッチポイントを取得
            const touches = event.touches || event.changedTouches;
            if (!touches || touchIndex >= touches.length) {

                console.warn('InputCoordinateConverter: Touch point not available', { touchIndex, touchesLength: touches?.length ;
                return { : undefined
                    x: 0 }
                    y: 0 };
                    originalEvent: event;
            
            const touch = touches[touchIndex];
            const rect = canvas.getBoundingClientRect();
            
            // 画面座標からキャンバス座標に変換
            const canvasX = touch.clientX - rect.left;
            const canvasY = touch.clientY - rect.top;
            
            // スケール係数を考慮した座標変換
            const scaleFactor = this.scaledCoordinateManager.getScaleFactor();
            const baseX = canvasX / scaleFactor;
            const baseY = canvasY / scaleFactor;
            // 座標の妥当性を検証
            if(!this.scaledCoordinateManager.validateCoordinates(baseX, baseY)) { ''
                console.warn('InputCoordinateConverter: Invalid converted touch coordinates', { baseX, baseY ','
                return { x: 0;
                    y: 0 };
                    originalEvent: event;
            
            return { x: baseX;
                y: baseY;
                canvasX: canvasX;
                canvasY: canvasY;
                scaledX: baseX * scaleFactor;
                scaledY: baseY * scaleFactor;
    touchIndex: touchIndex;
                originalEvent: event;;'} catch (error) {'
            console.warn('InputCoordinateConverter: Touch event conversion failed', error);
            return { x: 0;
                y: 0 };
                originalEvent: event;
    }
    
    /**
     * 矩形内の点判定（スケーリング対応）
     * @param {Object} point - 点の座標 {x, y}
     * @param {Object} baseRect - ベース座標系での矩形 {x, y, width, height}
     * @returns {boolean} 点が矩形内にあるかどうか
     */
    isPointInScaledRect(point, baseRect) {
        try {
            if (!point || !baseRect) {
    }
                return false;
            
            return point.x >= baseRect.x &&;
                   point.x <= baseRect.x + baseRect.width &&;
                   point.y >= baseRect.y &&';'
                   point.y <= baseRect.y + baseRect.height;'} catch (error) {'
            console.warn('InputCoordinateConverter: Rectangle hit test failed', error);
            return false,
    
    /**
     * 円内の点判定（スケーリング対応）
     * @param {Object} point - 点の座標 {x, y}
     * @param {Object} baseCenter - ベース座標系での中心 {x, y}
     * @param {number} baseRadius - ベース座標系での半径
     * @returns {boolean} 点が円内にあるかどうか
     */
    isPointInScaledCircle(point, baseCenter, baseRadius) {
        try {
            if (!point || !baseCenter || baseRadius <= 0) {
    }
                return false;
            
            const dx = point.x - baseCenter.x;
            const dy = point.y - baseCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            ';'

            return distance <= baseRadius;} catch (error) {
            console.warn('InputCoordinateConverter: Circle hit test failed', error);
            return false,
    
    /**
     * スケーリング対応イベントオブジェクトを作成
     * @param {Event} originalEvent - 元のイベント
     * @param {Object} convertedCoordinates - 変換された座標
     * @returns {Object} スケーリング対応イベント
     */
    createScaledEvent(originalEvent, convertedCoordinates = null) {
        try {
            const coords = convertedCoordinates || this.convertMouseEvent(originalEvent);
            return { type: originalEvent.type;
                x: coords.x;
                y: coords.y;
                canvasX: coords.canvasX;
                canvasY: coords.canvasY;
                scaledX: coords.scaledX;
                scaledY: coords.scaledY;
                originalEvent: originalEvent;
    timestamp: Date.now() }
                preventDefault: () => originalEvent.preventDefault() };
                stopPropagation: () => originalEvent.stopPropagation(); 
    };'} catch (error) {'
            console.warn('InputCoordinateConverter: Scaled event creation failed', error);
            return { type: originalEvent.type;
                x: 0;
                y: 0;
                originalEvent: originalEvent;
                timestamp: Date.now(
    preventDefault: () => originalEvent.preventDefault() };
                stopPropagation: () => originalEvent.stopPropagation(); 
    }
    }
    
    /**
     * 座標境界検証
     * @param {Object} point - 検証する点 {x, y}
     * @returns {Object} {valid, clampedPoint} - 検証結果とクランプされた座標
     */
    validateAndClampCoordinates(point) {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            const clampedX = Math.max(0, Math.min(canvasInfo.baseWidth, point.x);
            const clampedY = Math.max(0, Math.min(canvasInfo.baseHeight, point.y);
            const valid = (point.x === clampedX && point.y === clampedY) }
            return {  };
                valid: valid;
                clampedPoint: { x: clampedX, y: clampedY;

            };'} catch (error) {'
            console.warn('InputCoordinateConverter: Coordinate validation failed', error);
            return {  };
                valid: false;
                clampedPoint: { x: 0, y: 0  }
    }
    
    /**
     * 複数タッチポイントの処理
     * @param {TouchEvent} event - タッチイベント
     * @returns {Array} 変換されたタッチポイントの配列
     */
    convertMultiTouchEvent(event) {
        try {
            const touches = event.touches || event.changedTouches,
            if (!touches) {
    }
                return [];
            
            const convertedTouches = [];
            for(let, i = 0; i < touches.length; i++) {
                const convertedTouch = this.convertTouchEvent(event, i) }
                convertedTouches.push(convertedTouch); }
            }
            ';'

            return convertedTouches;} catch (error) {
            console.warn('InputCoordinateConverter: Multi-touch conversion failed', error);
            return [],
    
    /**
     * デバッグ用の座標情報を取得
     * @param {Event} event - 入力イベント
     * @returns {Object} デバッグ情報
     */
    getDebugInfo(event) {
        const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
        const scaleFactor = this.scaledCoordinateManager.getScaleFactor()','
        if(event.type.includes('touch' { }
            convertedCoords = this.convertTouchEvent(event); }
        } else { convertedCoords = this.convertMouseEvent(event) }
        
        return { eventType: event.type;
            canvasInfo: canvasInfo;
            scaleFactor: scaleFactor;
    originalCoords: {
                clientX: event.clientX };
                clientY: event.clientY 
    };
            convertedCoords: convertedCoords;
            timestamp: Date.now();