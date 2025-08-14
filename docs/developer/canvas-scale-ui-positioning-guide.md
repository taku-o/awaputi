# Canvas Scale UI Positioning Developer Guide

## 概要

このガイドでは、BubblePopゲームのCanvas Scale UI Positioning System（キャンバススケールUI配置システム）の使用方法について説明します。このシステムは、Issue #177で報告されたUIエレメントのスケーリング問題を解決するために開発されました。

## システムアーキテクチャ

### 主要コンポーネント

1. **ScaledCoordinateManager** - 中心的な座標管理システム
2. **UIPositionCalculator** - UI要素配置計算ユーティリティ  
3. **ScaledRenderingContext** - 自動スケーリング描画ラッパー
4. **InputCoordinateConverter** - 入力座標変換システム
5. **ResponsiveCanvasManager統合** - 既存システムとの統合

### コンポーネント関係図

```
ResponsiveCanvasManager
    ↓ (スケール情報提供)
ScaledCoordinateManager
    ↓ (座標変換)
UIPositionCalculator ← ScaledRenderingContext
    ↓ (位置計算)        ↓ (描画)
ゲームUIコンポーネント ← InputCoordinateConverter
    ↓ (イベント処理)
入力ハンドラー
```

## 基本的な使用方法

### 1. 座標変換システムの初期化

```javascript
import { ResponsiveCanvasManager } from './ui/managers/ResponsiveCanvasManager.js';

// ResponsiveCanvasManagerの初期化時にScaledCoordinateManagerが自動的に作成される
const responsiveCanvasManager = new ResponsiveCanvasManager(canvas);
responsiveCanvasManager.initialize();

// ScaledCoordinateManagerにアクセス
const scaledCoordinateManager = responsiveCanvasManager.scaledCoordinateManager;
```

### 2. 座標変換の基本操作

```javascript
// ベース座標（設計時座標）をスケーリングされた座標に変換
const scaledPosition = scaledCoordinateManager.getScaledPosition(100, 50);
console.log(`スケーリング後: (${scaledPosition.x}, ${scaledPosition.y})`);

// ベースサイズをスケーリングされたサイズに変換
const scaledSize = scaledCoordinateManager.getScaledSize(200, 100);
console.log(`スケーリング後サイズ: ${scaledSize.width} x ${scaledSize.height}`);

// スケーリングされた座標をベース座標に逆変換
const basePosition = scaledCoordinateManager.getBasePosition(scaledPosition.x, scaledPosition.y);
```

### 3. UI要素の配置計算

```javascript
import { UIPositionCalculator } from './utils/UIPositionCalculator.js';

const positionCalculator = new UIPositionCalculator(scaledCoordinateManager);

// ステータス要素の位置を計算
const scorePosition = positionCalculator.getStatusPosition('score');
const hpPosition = positionCalculator.getStatusPosition('hp');
const timePosition = positionCalculator.getStatusPosition('time');

// ボタンの位置を計算
const buttonPosition = positionCalculator.getButtonPosition('giveup', 0);

// レスポンシブマージンを取得
const margins = positionCalculator.getResponsiveMargins();
```

### 4. スケーリング対応描画

```javascript
import { ScaledRenderingContext } from './utils/ScaledRenderingContext.js';

const context = canvas.getContext('2d');
const scaledContext = new ScaledRenderingContext(context, scaledCoordinateManager);

// ベース座標を使って描画（自動的にスケーリングされる）
scaledContext.fillText('Score: 12345', 20, 30); // ベース座標で指定
scaledContext.fillRect(20, 60, 200, 20); // ベース座標とサイズで指定

// スケーリング対応フォント設定
scaledContext.setScaledFont(16, 'Arial'); // ベースフォントサイズで指定

// スケーリング対応線幅設定
scaledContext.setScaledLineWidth(2); // ベース線幅で指定
```

### 5. 入力処理の座標変換

```javascript
import { InputCoordinateConverter } from './utils/InputCoordinateConverter.js';

const inputConverter = new InputCoordinateConverter(scaledCoordinateManager);

// マウスイベントの座標変換
function handleMouseClick(event) {
    const convertedEvent = inputConverter.convertMouseEvent(event);
    
    console.log('原座標:', event.clientX, event.clientY);
    console.log('キャンバス座標:', convertedEvent.canvasX, convertedEvent.canvasY);
    console.log('ベース座標:', convertedEvent.baseX, convertedEvent.baseY);
    
    // ベース座標を使って処理を続行
    processGameInput(convertedEvent.baseX, convertedEvent.baseY);
}

// タッチイベントの座標変換
function handleTouchStart(event) {
    const convertedEvent = inputConverter.convertTouchEvent(event);
    // 変換された座標を使用
}

// ヒットテスト
function checkButtonClick(clickPoint) {
    const buttonBounds = { x: 100, y: 50, width: 120, height: 40 }; // ベース座標系
    const isHit = inputConverter.isPointInScaledRect(clickPoint, buttonBounds);
    return isHit;
}
```

## 高度な使用方法

### スケール変更イベントの処理

```javascript
// スケール変更時のコールバック登録
scaledCoordinateManager.onScaleChange((newScaleInfo) => {
    console.log('スケールが変更されました:', newScaleInfo);
    
    // UI要素の再配置などの処理
    updateUILayout();
});

// 手動でスケール更新をトリガー
scaledCoordinateManager.updateScale();
```

### デバッグ情報の取得

```javascript
// 現在のキャンバス情報を取得
const canvasInfo = scaledCoordinateManager.getCanvasInfo();
console.log('キャンバス情報:', canvasInfo);

// デバッグ情報を取得
const debugInfo = scaledCoordinateManager.getDebugInfo();
console.log('デバッグ情報:', debugInfo);

// スケールファクターのみを取得
const scaleFactor = scaledCoordinateManager.getScaleFactor();
console.log('現在のスケールファクター:', scaleFactor);
```

### デバッグツールの使用

```javascript
import { CoordinateSystemDebugger } from './utils/CoordinateSystemDebugger.js';

// デバッグツールの初期化
const debugger = new CoordinateSystemDebugger(scaledCoordinateManager, canvas);

// デバッグパネルを表示
debugger.showDebugPanel();

// ビジュアルオーバーレイを表示
debugger.showVisualOverlay();

// コンソールロギングを有効化
debugger.enableConsoleLogging(true);

// キーボードショートカットでトグル（Ctrl+Shift+C）
// または ?debug=true パラメータ、localStorage設定で有効化
```

## 実装パターン

### 新しいUI要素の追加

```javascript
class NewUIElement {
    constructor(responsiveCanvasManager) {
        this.scaledCoordinateManager = responsiveCanvasManager.scaledCoordinateManager;
        this.positionCalculator = new UIPositionCalculator(this.scaledCoordinateManager);
        this.scaledContext = null;
    }
    
    render(context) {
        // ScaledRenderingContextを作成
        if (!this.scaledContext) {
            this.scaledContext = new ScaledRenderingContext(context, this.scaledCoordinateManager);
        }
        
        // UI要素の位置を計算
        const position = this.positionCalculator.getStatusPosition('custom');
        
        // ベース座標を使って描画
        this.scaledContext.fillText('新しいUI要素', position.x, position.y);
        this.scaledContext.fillRect(position.x, position.y + 20, 150, 25);
    }
    
    handleClick(event) {
        // 入力座標変換
        const inputConverter = new InputCoordinateConverter(this.scaledCoordinateManager);
        const convertedEvent = inputConverter.convertMouseEvent(event);
        
        // ベース座標でのヒットテスト
        const elementBounds = { x: 20, y: 100, width: 150, height: 45 };
        const isClicked = inputConverter.isPointInScaledRect(
            { x: convertedEvent.baseX, y: convertedEvent.baseY },
            elementBounds
        );
        
        if (isClicked) {
            this.onElementClicked();
        }
    }
}
```

### レスポンシブレイアウトの実装

```javascript
class ResponsiveUILayout {
    constructor(scaledCoordinateManager) {
        this.positionCalculator = new UIPositionCalculator(scaledCoordinateManager);
        this.scaledCoordinateManager = scaledCoordinateManager;
        
        // スケール変更時の自動レイアウト更新
        scaledCoordinateManager.onScaleChange(() => {
            this.updateLayout();
        });
    }
    
    updateLayout() {
        // デバイスタイプに基づくレイアウト調整
        const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();
        const isMobile = canvasInfo.displayWidth < 768;
        const isTablet = canvasInfo.displayWidth >= 768 && canvasInfo.displayWidth < 1200;
        
        if (isMobile) {
            this.layoutForMobile();
        } else if (isTablet) {
            this.layoutForTablet();
        } else {
            this.layoutForDesktop();
        }
    }
    
    layoutForMobile() {
        // モバイル向けレイアウト
        const margins = this.positionCalculator.getResponsiveMargins();
        // より大きなマージンとフォントサイズを使用
    }
}
```

## ベストプラクティス

### 1. 常にベース座標系を使用

```javascript
// ❌ 避けるべき - ハードコードされたスケーリング座標
context.fillText('Score', canvas.width * 0.1, canvas.height * 0.1);

// ✅ 推奨 - ベース座標系とスケーリングシステム
const scaledContext = new ScaledRenderingContext(context, scaledCoordinateManager);
scaledContext.fillText('Score', 20, 30); // ベース座標
```

### 2. UIPositionCalculatorを活用

```javascript
// ❌ 避けるべき - 手動位置計算
const x = 20;
const y = isStatusBarVisible ? 80 : 50;

// ✅ 推奨 - UIPositionCalculatorを使用
const position = positionCalculator.getStatusPosition('score');
```

### 3. 入力処理での座標変換を忘れずに

```javascript
// ❌ 避けるべき - 生のイベント座標を直接使用
function handleClick(event) {
    processClick(event.clientX, event.clientY);
}

// ✅ 推奨 - InputCoordinateConverterで変換
function handleClick(event) {
    const convertedEvent = inputConverter.convertMouseEvent(event);
    processClick(convertedEvent.baseX, convertedEvent.baseY);
}
```

### 4. スケール変更イベントへの対応

```javascript
class UIComponent {
    constructor(scaledCoordinateManager) {
        this.scaledCoordinateManager = scaledCoordinateManager;
        
        // スケール変更時の自動更新
        scaledCoordinateManager.onScaleChange(() => {
            this.invalidateLayout();
        });
    }
}
```

### 5. デバッグ機能の活用

```javascript
// 開発中はデバッグ情報を活用
if (process.env.NODE_ENV === 'development') {
    const debugInfo = scaledCoordinateManager.getDebugInfo();
    console.log('座標系デバッグ情報:', debugInfo);
}
```

## トラブルシューティング

### 一般的な問題と解決策

#### 問題: UI要素が正しい位置に表示されない

**原因**: ハードコードされた座標を使用している

**解決策**:
```javascript
// ScaledRenderingContextを使用
const scaledContext = new ScaledRenderingContext(context, scaledCoordinateManager);
scaledContext.fillText('Text', baseX, baseY); // ベース座標を使用
```

#### 問題: ボタンクリックが正しく動作しない

**原因**: 入力座標の変換漏れ

**解決策**:
```javascript
const inputConverter = new InputCoordinateConverter(scaledCoordinateManager);
const convertedEvent = inputConverter.convertMouseEvent(event);
// convertedEvent.baseX, convertedEvent.baseY を使用
```

#### 問題: 異なる画面サイズで一貫性のないレイアウト

**原因**: UIPositionCalculatorを使用していない

**解決策**:
```javascript
const positionCalculator = new UIPositionCalculator(scaledCoordinateManager);
const position = positionCalculator.getStatusPosition('elementType');
```

### デバッグ手順

1. **デバッグツールを有効化**
   - URLに `?debug=true` を追加
   - または `Ctrl+Shift+C` でトグル

2. **コンソールで座標情報を確認**
   ```javascript
   console.log(scaledCoordinateManager.getCanvasInfo());
   console.log(scaledCoordinateManager.getDebugInfo());
   ```

3. **ビジュアルオーバーレイで位置確認**
   - UI要素の境界とクリック範囲を視覚的に確認

4. **パフォーマンス監視**
   - ブラウザのDevToolsでフレームレートを確認
   - 座標変換処理時間を測定

## パフォーマンス考慮事項

### 最適化のポイント

1. **座標変換のキャッシュ**
   - 同じ座標の変換は自動的にキャッシュされる
   - 明示的なキャッシュクリアは通常不要

2. **レンダリング最適化**
   - ScaledRenderingContextは効率的な描画を提供
   - 不必要な context.save()/restore() 呼び出しを避ける

3. **イベント処理最適化**
   - InputCoordinateConverter インスタンスを再利用
   - 頻繁な座標変換の結果をキャッシュ

## テスト

### ユニットテスト例

```javascript
import { ScaledCoordinateManager } from '../src/utils/ScaledCoordinateManager.js';

describe('ScaledCoordinateManager', () => {
    test('should convert coordinates correctly', () => {
        const manager = new ScaledCoordinateManager(mockResponsiveCanvasManager);
        const result = manager.getScaledPosition(100, 100);
        
        expect(result.x).toBeGreaterThan(0);
        expect(result.y).toBeGreaterThan(0);
    });
});
```

### 統合テスト

統合テスト用のファイルが提供されています：
- `test/integration/canvas-scale-ui-positioning-integration.test.js`
- `test/visual/canvas-scale-ui-positioning-visual.test.js`
- `test/performance/canvas-scale-ui-positioning-performance.test.js`

## 参考情報

### 関連ファイル

- `src/utils/ScaledCoordinateManager.js`
- `src/utils/UIPositionCalculator.js`
- `src/utils/ScaledRenderingContext.js`
- `src/utils/InputCoordinateConverter.js`
- `src/utils/CoordinateSystemDebugger.js`
- `src/ui/managers/ResponsiveCanvasManager.js`

### 設計座標系

システムは以下のベース座標系を使用します：
- **ベース幅**: 800px
- **ベース高**: 600px
- **座標原点**: 左上角 (0, 0)

### ブラウザサポート

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

このガイドにより、Canvas Scale UI Positioning Systemを効果的に活用し、すべてのデバイスで一貫したUIエクスペリエンスを提供できるようになります。