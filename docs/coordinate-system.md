# 座標システムドキュメント

## 概要

BubblePop Webゲームでは、統一的な座標計算システムを使用して、異なる画面サイズや解像度でも一貫したレイアウトを実現しています。

## CoordinateCalculatorクラス

### 目的
`CoordinateCalculator`クラスは、ベース座標系（1920x1080）から実際のCanvas座標系への変換を担当し、要素の中央配置、スケーリング、テキスト境界の検証などを提供します。

### 主な機能

#### 1. 座標変換
```javascript
// ベース座標系から実際のCanvas座標系への変換
const canvasCoords = calculator.toCanvasCoordinates(baseX, baseY);

// サイズの変換
const canvasSize = calculator.toCanvasSize(baseWidth, baseHeight);
```

#### 2. 中央配置
```javascript
// 要素を水平中央に配置
const centerX = calculator.getCenterX(elementWidth);

// 要素を垂直中央に配置
const centerY = calculator.getCenterY(elementHeight);

// テキストを水平中央に配置
const textCenterX = calculator.getTextCenterX(context, text);
```

#### 3. スケーリング
```javascript
// フォントサイズをスケーリング
const scaledFontSize = calculator.scaleFontSize(baseFontSize);

// uniformScaleは最小のスケール係数（アスペクト比を保持）
const scale = calculator.uniformScale;
```

#### 4. 検証機能
```javascript
// テキストの境界を検証
const isValid = calculator.validateTextBounds(context, text, x, y, maxWidth);

// 要素の境界を検証
const isInBounds = calculator.validateElementBounds(x, y, width, height);
```

#### 5. レイアウト補助
```javascript
// 安全な配置領域を取得
const safeArea = calculator.getSafeArea(margin);

// 複数要素を垂直方向に均等配置
const positions = calculator.distributeVertically(itemCount, itemHeight, startY, endY);
```

## MainMenuRendererでの使用例

### 初期化とリサイズ対応
```javascript
export class MainMenuRenderer {
    updateCoordinateCalculator() {
        const canvas = this.gameEngine.canvas;
        if (!this.coordinateCalculator) {
            this.coordinateCalculator = new CoordinateCalculator(canvas.width, canvas.height, 1920, 1080);
        } else {
            this.coordinateCalculator.updateCanvasDimensions(canvas.width, canvas.height);
        }
    }
    
    handleResize() {
        this.updateCoordinateCalculator();
    }
}
```

### タイトル描画の例
```javascript
// フォントサイズのスケーリング
const titleFontSize = calc.scaleFontSize(72);
context.font = `bold ${titleFontSize}px Arial`;

// Y座標の変換
const titleY = calc.toCanvasCoordinates(0, 150).y;

// テキストの中央配置
const titleX = calc.getTextCenterX(context, titleText);

// テキスト境界の検証
if (!calc.validateTextBounds(context, titleText, titleX, titleY)) {
    // テキストが切れる場合はフォントサイズを調整
    context.font = `bold ${titleFontSize * 0.8}px Arial`;
}
```

### メニュー項目の配置
```javascript
// ベース座標系での寸法定義
const baseItemWidth = 400;
const baseItemHeight = 60;

// Canvas座標系に変換
const itemSize = calc.toCanvasSize(baseItemWidth, baseItemHeight);
const itemX = calc.getCenterX(baseItemWidth);

// Y座標の計算
const baseY = baseStartY + index * (baseItemHeight + baseSpacing);
const canvasY = calc.toCanvasCoordinates(0, baseY).y;
```

## レスポンシブ対応

### リサイズイベントの処理
MainMenuSceneでは、ResponsiveCanvasManagerと連携してリサイズイベントを処理します：

```javascript
enter() {
    // リサイズハンドラーを登録
    if (this.gameEngine.responsiveCanvas) {
        this.resizeCallback = () => {
            if (this.renderer) {
                this.renderer.handleResize();
            }
        };
        this.gameEngine.responsiveCanvas.onResizeCallbacks.push(this.resizeCallback);
    }
}

exit() {
    // リサイズハンドラーを削除
    if (this.gameEngine.responsiveCanvas && this.resizeCallback) {
        const index = this.gameEngine.responsiveCanvas.onResizeCallbacks.indexOf(this.resizeCallback);
        if (index > -1) {
            this.gameEngine.responsiveCanvas.onResizeCallbacks.splice(index, 1);
        }
    }
}
```

## エラーハンドリング

### フォント読み込みのフォールバック
```javascript
const titleFonts = [
    `bold ${titleFontSize}px 'Noto Sans JP', Arial, sans-serif`,
    `bold ${titleFontSize}px Arial, sans-serif`,
    `bold ${titleFontSize}px sans-serif`
];

let fontSet = false;
for (const font of titleFonts) {
    try {
        context.font = font;
        fontSet = true;
        break;
    } catch (e) {
        // フォント設定エラーを無視して次のフォントを試す
    }
}
```

### Canvas状態の管理
```javascript
renderMainMenu(context, selectedMenuIndex, menuItems) {
    try {
        // Canvas状態の保存
        context.save();
        
        // 描画処理...
        
        // Canvas状態の復元
        context.restore();
    } catch (error) {
        // エラー発生時もCanvas状態を復元
        try {
            context.restore();
        } catch (restoreError) {
            // 復元エラーは無視
        }
    }
}
```

## ベストプラクティス

1. **ベース座標系の使用**: 常に1920x1080のベース座標系で設計し、実際の描画時に変換する
2. **統一的なスケーリング**: `uniformScale`を使用してアスペクト比を保持
3. **中央配置の活用**: `getCenterX`、`getCenterY`メソッドを使用して要素を中央に配置
4. **境界検証**: テキストや要素が画面内に収まることを確認
5. **エラーハンドリング**: フォント読み込みエラーやCanvas状態エラーに対応

## トラブルシューティング

### 問題: テキストが切れる
- `validateTextBounds`を使用してテキストの境界を確認
- フォントサイズを調整するか、最大幅を設定

### 問題: 要素が画面外に表示される
- `validateElementBounds`を使用して要素の境界を確認
- `getSafeArea`を使用して安全な配置領域内に配置

### 問題: リサイズ時にレイアウトが崩れる
- リサイズハンドラーが正しく登録されているか確認
- `updateCoordinateCalculator`が呼ばれているか確認