/**
 * UIPositionCalculator - 一貫したUI要素配置計算クラス
 * ScaledCoordinateManagerと統合してデバイス適応的なUI配置を提供
 */

// 型定義
interface Position { x: number,
    y: number ,}

interface Margins { top: number;
    right: number;
    bottom: number;
    left: number }

interface Breakpoints { mobile: number;
    tablet: number;
    desktop: number }

interface CanvasInfo { baseWidth: number;
    baseHeight: number;
    displayWidth: number;
    displayHeight: number }

interface ScaledCoordinateManager { getCanvasInfo(): CanvasInfo;
    }

interface UIElement { type: string,
    name: string;
    offset?: Position
    ,}

interface Container { x?: number;
    y?: number;
    width?: number;
    height?: number; }

interface LayoutResult { element: UIElement,
    position: Position
    ,}

type DeviceType = 'mobile' | 'tablet' | 'desktop';''
type StatusElement = 'score' | 'time' | 'hp';''
type Edge = 'top' | 'right' | 'bottom' | 'left';

export class UIPositionCalculator {
    private scaledCoordinateManager: ScaledCoordinateManager;
    private defaultMargins: Margins;
    private breakpoints: Breakpoints;
    private statusVerticalSpacing: number';

    constructor(scaledCoordinateManager: ScaledCoordinateManager) {
        this.scaledCoordinateManager = scaledCoordinateManager;
        
        // デフォルトマージン（ベース座標系）
        this.defaultMargins = {
            top: 5,  // ボタンを上端により近く;
            right: 5, // ボタンを右端により近く;
            bottom: 20;
    ,}
            left: 20 }
        };
        // ブレークポイント設定
        this.breakpoints = { mobile: 480,
            tablet: 768;
            desktop: 1024 ,};
        // ステータス要素の垂直間隔
        this.statusVerticalSpacing = 40;
    }
    
    /**
     * ステータス要素の位置を取得''
     * @param element - 要素名 ('score', 'time', 'hp')
     * @returns ベース座標系の位置
     */
    getStatusPosition(element: StatusElement): Position { try {
            const margins = this.getResponsiveMargins();
            let baseY = margins.top;
            ';
            // 要素タイプに応じてY座標を調整
            switch(element) {'

                case 'score':;
                    baseY = margins.top;

                    break;''
                case 'time':;
                    baseY = margins.top + this.statusVerticalSpacing;

                    break;''
                case 'hp':'';
                    baseY = margins.top + (this.statusVerticalSpacing * 2');
                    break;
            }

                default:' }'

                    console.warn(`UIPositionCalculator: Unknown status element '${element}', using default position`});
                    baseY = margins.top;
            }
            
            // ベース座標をそのまま返す（他のメソッドとの一貫性のため）
            return { x: margins.left, y: baseY ,}''
        } catch (error) { console.warn('UIPositionCalculator: Status position calculation failed, using fallback', error }
            return { x: 20, y: 20 ,}
    }
    
    /**'
     * ボタンの位置を取得''
     * @param buttonType - ボタンタイプ ('giveup', 'restart', etc.)
     * @param index - ボタンのインデックス
     * @returns ベース座標系の位置
     */
    getButtonPosition(buttonType: string, index: number = 0): Position { try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            const margins = this.getResponsiveMargins();
            
            // 右上配置（ベース座標系）
            const baseX = canvasInfo.baseWidth - margins.right - 100; // ボタン幅100pxを考慮
            const baseY = margins.top + (index * 42); // ボタン間隔も縮小（36px + 6px余白）
            
            // ベース座標をそのまま返す（GameControlButtonsがスケーリングを行うため）
             }
            return { x: baseX, y: baseY ,}''
        } catch (error) { console.warn('UIPositionCalculator: Button position calculation failed, using fallback', error }
            return { x: 600, y: 20 + (index * 50 ,}
    }
    
    /**
     * ダイアログの位置を取得
     * @param dialogType - ダイアログタイプ
     * @returns ベース座標系の位置（中央配置）
     */
    getDialogPosition(dialogType: string): Position { try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            
            // 中央配置（ベース座標系）
            const baseX = canvasInfo.baseWidth / 2;
            const baseY = canvasInfo.baseHeight / 2;
            
            // ベース座標をそのまま返す（他のメソッドとの一貫性のため） }
            return { x: baseX, y: baseY ,}''
        } catch (error) { console.warn('UIPositionCalculator: Dialog position calculation failed, using fallback', error }
            return { x: 400, y: 300 ,}
    }
    
    /**
     * レスポンシブマージンを取得
     * @returns デバイスに適応したマージン値
     */
    getResponsiveMargins(): Margins { try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            const deviceType = this.getDeviceType(canvasInfo.displayWidth);

            switch(deviceType) {'

                case 'mobile':;
                    return { top: 5,   // すべてのデバイスで右上端配置
                        right: 5;
            ,}
                        bottom: 15, };
                        left: 15 }
                    };''
                case 'tablet':;
                    return { top: 5,   // すべてのデバイスで右上端配置
                        right: 5;
                        bottom: 18, };
                        left: 18 }
                    };''
                case 'desktop':';
                default: return this.defaultMargins,
            } catch (error) {
            console.warn('UIPositionCalculator: Responsive margins calculation failed, using defaults', error);
            return this.defaultMargins;
    
    /**
     * 複数要素のレイアウトを計算
     * @param elements - 要素配列
     * @param containerBounds - コンテナの境界
     * @returns 計算された位置の配列
     */
    calculateLayout(elements: UIElement[], containerBounds: Container): LayoutResult[] { try {
            const positions: LayoutResult[] = [],
            const margins = this.getResponsiveMargins();

            elements.forEach((element, index) => { 
                let position: Position,

                if(element.type === 'status) {' }

                    position = this.getStatusPosition(element.name, as StatusElement);' }'

                } else if(element.type === 'button) { ''
                    position = this.getButtonPosition(element.name, index);' }'

                } else if(element.type === 'dialog) { position = this.getDialogPosition(element.name); } else {  // カスタム配置ロジック（ベース座標）'
                    const baseX = margins.left + (element.offset? .x || 0); }
                    const baseY = margins.top + (element.offset?.y || 0); : undefined 
                    position = { x: baseX, y: baseY ,}
                
                positions.push({ element: element)
                    position: position });
            ';

            return positions;''
        } catch (error) {
            console.warn('UIPositionCalculator: Layout calculation failed', error);
            return [];
    
    /**
     * 要素を端に配置'
     * @param element - 要素情報''
     * @param edge - 端の位置 ('top', 'right', 'bottom', 'left')
     * @param margin - マージン値
     * @returns ベース座標系の位置
     */
    alignToEdge(element: UIElement, edge: Edge, margin: number = 20): Position { try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            let baseX: number, baseY: number,

            switch(edge) {'

                case 'top':;
                    baseX = canvasInfo.baseWidth / 2;
                    baseY = margin;

                    break;''
                case 'right':;
                    baseX = canvasInfo.baseWidth - margin;
                    baseY = canvasInfo.baseHeight / 2;

                    break;''
                case 'bottom':;
                    baseX = canvasInfo.baseWidth / 2;
                    baseY = canvasInfo.baseHeight - margin;

                    break;''
                case 'left':;
                    baseX = margin;
                    baseY = canvasInfo.baseHeight / 2;
                    break;
            }

                default:' }'

                    console.warn(`UIPositionCalculator: Unknown edge '${edge}', using center`});
                    baseX = canvasInfo.baseWidth / 2;
                    baseY = canvasInfo.baseHeight / 2;
            }
            
            // ベース座標をそのまま返す（一貫性のため）
            return { x: baseX, y: baseY ,}''
        } catch (error) {
            console.warn('UIPositionCalculator: Edge alignment failed, using center', error);
            // フォールバック: ベース座標 }
            return { x: 400, y: 300 ,}
    }
    
    /**
     * 要素を中央に配置
     * @param element - 要素情報
     * @param container - コンテナ情報
     * @returns ベース座標系の位置
     */
    centerElement(element: UIElement, container: Container | null = null): Position { try {
            const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
            
            // コンテナが指定されていない場合はキャンバス全体を使用
            const containerWidth = container? .width || canvasInfo.baseWidth;
            const containerHeight = container?.height || canvasInfo.baseHeight;
            const containerX = container?.x || 0;
            const containerY = container?.y || 0;
            
            const baseX = containerX + (containerWidth / 2);
            const baseY = containerY + (containerHeight / 2);
            
            // ベース座標をそのまま返す（一貫性のため） : undefined 
            return { x: baseX, y: baseY ,}''
        } catch (error) {
            console.warn('UIPositionCalculator: Center alignment failed, using default center', error);
            // フォールバック: ベース座標 }
            return { x: 400, y: 300 ,}
    }
    
    /**
     * デバイスタイプを判定
     * @param width - 表示幅''
     * @returns デバイスタイプ ('mobile', 'tablet', 'desktop')
     */'
    getDeviceType(width: number): DeviceType { ''
        if(width < this.breakpoints.mobile) {'
            ';

        }

            return 'mobile';' }

        } else if(width < this.breakpoints.tablet) { ''
            return 'tablet'; else {  ' }

            return 'desktop';''
}