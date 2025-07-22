# 座標系の基準仕様

## 概要
BubblePopゲームでは、レスポンシブ対応と座標計算の一貫性を保つため、統一された座標系を使用します。

## 基準座標系

### ベース座標系
- **幅**: 800px
- **高さ**: 600px
- **アスペクト比**: 4:3

### 設計思想
1. **統一性**: すべてのシーンとUI要素で同じ基準座標系を使用
2. **レスポンシブ対応**: ResponsiveCanvasManagerが自動的にデバイスサイズに調整
3. **開発効率**: 固定座標で設計可能、レスポンシブ処理は自動化

## 実装ガイドライン

### 描画処理
```javascript
// ✅ 正しい実装
renderElement(context) {
    // ベース座標系を使用
    const baseWidth = 800;
    const baseHeight = 600;
    
    // 中央配置の例
    const elementX = (baseWidth - elementWidth) / 2;
    const elementY = (baseHeight - elementHeight) / 2;
    
    context.fillRect(elementX, elementY, elementWidth, elementHeight);
}

// ❌ 避けるべき実装
renderElement(context) {
    const canvas = this.gameEngine.canvas;
    // 実際のcanvasサイズを直接使用（レスポンシブで不整合が発生）
    const elementX = (canvas.width - elementWidth) / 2;
}
```

### クリック判定処理
```javascript
// ✅ 正しい実装
handleClick(event) {
    // ResponsiveCanvasManagerの座標変換を使用
    let coords;
    if (this.gameEngine.responsiveCanvasManager) {
        coords = this.gameEngine.responsiveCanvasManager.screenToCanvas(event.clientX, event.clientY);
    } else {
        // フォールバック処理
        const rect = canvas.getBoundingClientRect();
        coords = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    // ベース座標系で判定
    const baseWidth = 800;
    const buttonX = (baseWidth - buttonWidth) / 2;
    
    if (coords.x >= buttonX && coords.x <= buttonX + buttonWidth) {
        // クリック処理
    }
}
```

## ResponsiveCanvasManagerとの連携

### 自動スケーリング
ResponsiveCanvasManagerが以下を自動処理：
- デバイスサイズに応じたCanvasの表示サイズ調整
- 高DPI対応
- 座標変換（画面座標 ↔ Canvas座標）

### 座標変換メソッド
```javascript
// 画面座標をCanvas座標に変換
const canvasCoords = responsiveCanvasManager.screenToCanvas(screenX, screenY);

// Canvas座標を画面座標に変換
const screenCoords = responsiveCanvasManager.canvasToScreen(canvasX, canvasY);
```

## 適用範囲

### 対象コンポーネント
- MainMenuScene ✅ (修正済み)
- StageSelectScene
- GameScene
- ShopScene
- UserInfoScene
- 各種UI要素

### 修正対象
1. **描画処理**: `canvas.width`, `canvas.height` → `baseWidth`, `baseHeight`
2. **クリック判定**: ResponsiveCanvasManagerの座標変換使用
3. **位置計算**: ベース座標系での計算

## 注意事項

### デバッグ時
- コンソールで`gameEngine.responsiveCanvasManager.getCanvasInfo()`で現在のサイズ情報を確認可能
- `baseWidth: 800, baseHeight: 600`が基準値

### パフォーマンス
- 座標変換はリアルタイムで実行されるため、頻繁な呼び出しは避ける
- 必要に応じて計算結果をキャッシュ

## 履歴
- 2025-07-22: Issue #3修正に伴い座標系基準を統一
- 背景: 入力フォーム位置ずれ問題の根本解決