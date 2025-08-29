/**
 * UIPositionCalculator - 一貫したUI要素配置計算クラス
 * ScaledCoordinateManagerと統合してデバイス適応的なUI配置を提供
 */

export class UIPositionCalculator {
    constructor(scaledCoordinateManager) {
        this.scaledCoordinateManager = scaledCoordinateManager;
        
        // デフォルトマージン（ベース座標系）
        this.defaultMargins = {
            top: 5,  // ボタンを上端により近く
            right: 5, // ボタンを右端により近く
            bottom: 20,
            left: 20
        };
        
        // ブレークポイント設定
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        };
        
        // ステータス要素の垂直間隔
        this.statusVerticalSpacing = 40;
    }
    
    /**
     * ステータス要素の位置を取得
     * @param {string} element - 要素名 ('score', 'time', 'hp')
     * @returns {Object} {x, y} - ベース座標系の位置
     */
    getStatusPosition(element) {
        try {
            const margins = this.getResponsiveMargins();
            let baseY = margins.top;
            
            // 要素タイプに応じてY座標を調整
            switch (element) {
                case 'score':
                    baseY = margins.top;
                    break;
                case 'time':
                    baseY = margins.top + this.statusVerticalSpacing;
                    break;
                case 'hp':
                    baseY = margins.top + (this.statusVerticalSpacing * 2);
                    break;
                default:
                    console.warn(`UIPositionCalculator: Unknown status element '${element}', using default position`);
                    baseY = margins.top;
            }
            
            // ベース座標をそのまま返す（他のメソッドとの一貫性のため）
            return { x: margins.left, y: baseY };
        } catch (error) {
            console.warn('UIPositionCalculator: Status position calculation failed, using fallback', error);
            return { x: 20, y: 20 };
        }
    }
    
    /**
     * ボタンの位置を取得
     * @param {string} buttonType - ボタンタイプ ('giveup', 'restart', etc.)
     * @param {number} index - ボタンのインデックス
     * @returns {Object} {x, y} - ベース座標系の位置
     */
    getButtonPosition(buttonType, index = 0) {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            const margins = this.getResponsiveMargins();
            
            // 右上配置（ベース座標系）
            const baseX = canvasInfo.baseWidth - margins.right - 100; // ボタン幅100pxを考慮
            const baseY = margins.top + (index * 42); // ボタン間隔も縮小（36px + 6px余白）
            
            // ベース座標をそのまま返す（GameControlButtonsがスケーリングを行うため）
            
            return { x: baseX, y: baseY };
        } catch (error) {
            console.warn('UIPositionCalculator: Button position calculation failed, using fallback', error);
            return { x: 600, y: 20 + (index * 50) };
        }
    }
    
    /**
     * ダイアログの位置を取得
     * @param {string} dialogType - ダイアログタイプ
     * @returns {Object} {x, y} - ベース座標系の位置（中央配置）
     */
    getDialogPosition(dialogType) {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            
            // 中央配置（ベース座標系）
            const baseX = canvasInfo.baseWidth / 2;
            const baseY = canvasInfo.baseHeight / 2;
            
            // ベース座標をそのまま返す（他のメソッドとの一貫性のため）
            return { x: baseX, y: baseY };
        } catch (error) {
            console.warn('UIPositionCalculator: Dialog position calculation failed, using fallback', error);
            return { x: 400, y: 300 };
        }
    }
    
    /**
     * レスポンシブマージンを取得
     * @returns {Object} デバイスに適応したマージン値
     */
    getResponsiveMargins() {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            const deviceType = this.getDeviceType(canvasInfo.displayWidth);
            
            switch (deviceType) {
                case 'mobile':
                    return {
                        top: 5,   // すべてのデバイスで右上端配置
                        right: 5,
                        bottom: 15,
                        left: 15
                    };
                case 'tablet':
                    return {
                        top: 5,   // すべてのデバイスで右上端配置
                        right: 5,
                        bottom: 18,
                        left: 18
                    };
                case 'desktop':
                default:
                    return this.defaultMargins;
            }
        } catch (error) {
            console.warn('UIPositionCalculator: Responsive margins calculation failed, using defaults', error);
            return this.defaultMargins;
        }
    }
    
    /**
     * 複数要素のレイアウトを計算
     * @param {Array} elements - 要素配列
     * @param {Object} containerBounds - コンテナの境界
     * @returns {Array} 計算された位置の配列
     */
    calculateLayout(elements, containerBounds) {
        try {
            const positions = [];
            const margins = this.getResponsiveMargins();
            
            elements.forEach((element, index) => {
                let position;
                
                if (element.type === 'status') {
                    position = this.getStatusPosition(element.name);
                } else if (element.type === 'button') {
                    position = this.getButtonPosition(element.name, index);
                } else if (element.type === 'dialog') {
                    position = this.getDialogPosition(element.name);
                } else {
                    // カスタム配置ロジック（ベース座標）
                    const baseX = margins.left + (element.offset?.x || 0);
                    const baseY = margins.top + (element.offset?.y || 0);
                    position = { x: baseX, y: baseY };
                }
                
                positions.push({
                    element: element,
                    position: position
                });
            });
            
            return positions;
        } catch (error) {
            console.warn('UIPositionCalculator: Layout calculation failed', error);
            return [];
        }
    }
    
    /**
     * 要素を端に配置
     * @param {Object} element - 要素情報
     * @param {string} edge - 端の位置 ('top', 'right', 'bottom', 'left')
     * @param {number} margin - マージン値
     * @returns {Object} {x, y} - ベース座標系の位置
     */
    alignToEdge(element, edge, margin = 20) {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            let baseX, baseY;
            
            switch (edge) {
                case 'top':
                    baseX = canvasInfo.baseWidth / 2;
                    baseY = margin;
                    break;
                case 'right':
                    baseX = canvasInfo.baseWidth - margin;
                    baseY = canvasInfo.baseHeight / 2;
                    break;
                case 'bottom':
                    baseX = canvasInfo.baseWidth / 2;
                    baseY = canvasInfo.baseHeight - margin;
                    break;
                case 'left':
                    baseX = margin;
                    baseY = canvasInfo.baseHeight / 2;
                    break;
                default:
                    console.warn(`UIPositionCalculator: Unknown edge '${edge}', using center`);
                    baseX = canvasInfo.baseWidth / 2;
                    baseY = canvasInfo.baseHeight / 2;
            }
            
            // ベース座標をそのまま返す（一貫性のため）
            return { x: baseX, y: baseY };
        } catch (error) {
            console.warn('UIPositionCalculator: Edge alignment failed, using center', error);
            // フォールバック: ベース座標
            return { x: 400, y: 300 };
        }
    }
    
    /**
     * 要素を中央に配置
     * @param {Object} element - 要素情報
     * @param {Object} container - コンテナ情報
     * @returns {Object} {x, y} - ベース座標系の位置
     */
    centerElement(element, container = null) {
        try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            
            // コンテナが指定されていない場合はキャンバス全体を使用
            const containerWidth = container?.width || canvasInfo.baseWidth;
            const containerHeight = container?.height || canvasInfo.baseHeight;
            const containerX = container?.x || 0;
            const containerY = container?.y || 0;
            
            const baseX = containerX + (containerWidth / 2);
            const baseY = containerY + (containerHeight / 2);
            
            // ベース座標をそのまま返す（一貫性のため）
            return { x: baseX, y: baseY };
        } catch (error) {
            console.warn('UIPositionCalculator: Center alignment failed, using default center', error);
            // フォールバック: ベース座標
            return { x: 400, y: 300 };
        }
    }
    
    /**
     * デバイスタイプを判定
     * @param {number} width - 表示幅
     * @returns {string} デバイスタイプ ('mobile', 'tablet', 'desktop')
     */
    getDeviceType(width) {
        if (width < this.breakpoints.mobile) {
            return 'mobile';
        } else if (width < this.breakpoints.tablet) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
}