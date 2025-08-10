# Design Document

## Overview

最小限エントリーページ機能は、既存のindex.htmlに最小限の変更を加えて、シンプルなエントリーページを実装します。複雑なコンポーネントアーキテクチャは使用せず、単純なHTML/CSS/JavaScriptのみを使用して、既存システムへの影響を最小限に抑えます。

この設計では、既存のコードを一切変更せず、新しいコードのみを追加することで機能を実現します。

## Architecture

### Simple Approach

```
index.html
├── Entry Page HTML (新規追加)
├── Existing Game HTML (既存のまま)
└── Simple JavaScript (新規追加)
    ├── showEntryPage()
    ├── hideEntryPage()
    └── startGame()
```

### No Complex Components

- **No Manager Classes**: 複雑なマネージャークラスは作成しない
- **No BaseComponent**: 既存のコンポーネントアーキテクチャは使用しない
- **No Separate Files**: 全てindex.html内で完結
- **No Framework Dependencies**: 純粋なHTML/CSS/JavaScriptのみ

## Components and Interfaces

### Entry Page HTML Structure

```html
<!-- 新規追加: エントリーページ -->
<div id="entryPage" class="entry-page">
    <div class="entry-content">
        <h1 class="entry-title">BubblePop</h1>
        <p class="entry-description">泡を割って高スコアを目指そう！</p>
        <button id="startGameButton" class="start-button">ゲームスタート</button>
    </div>
</div>

<!-- 既存: ゲームコンテンツ（変更なし） -->
<div id="gameContainer" style="display: none;">
    <!-- 既存のゲームHTML（そのまま） -->
</div>
```

### Simple JavaScript Functions

```javascript
// 新規追加: シンプルな関数のみ
function showEntryPage() {
    document.getElementById('entryPage').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
}

function hideEntryPage() {
    document.getElementById('entryPage').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
}

function startGame() {
    hideEntryPage();
    // 既存のinitApp()を呼び出し（変更なし）
    initApp();
}
```

### CSS Styling

```css
/* 新規追加: エントリーページ専用CSS */
.entry-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 10000;
}

.entry-content {
    text-align: center;
    color: white;
}

.start-button {
    font-size: 24px;
    padding: 15px 30px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
}
```

## Data Models

### No Complex State Management

```javascript
// シンプルな状態管理のみ
let gameStarted = false;
```

### No Configuration Objects

設定オブジェクトは作成せず、HTML/CSS内で直接値を指定します。

## Error Handling

### Minimal Error Handling

```javascript
function startGame() {
    try {
        hideEntryPage();
        initApp();
        gameStarted = true;
    } catch (error) {
        console.error('Game start failed:', error);
        // 既存のエラーハンドリングに委ねる
    }
}
```

### No Custom Error Classes

既存のエラーハンドリングシステムをそのまま使用し、新しいエラークラスは作成しません。

## Testing Strategy

### Simple Testing Approach

1. **Manual Testing**: 基本的な動作確認
   - エントリーページの表示
   - ボタンクリックでゲーム開始
   - キーボードナビゲーション

2. **Existing Tests**: 既存のテストはそのまま維持
   - ゲーム初期化のテスト
   - PWA機能のテスト
   - アクセシビリティのテスト

### No New Test Files

新しいテストファイルは作成せず、既存のテスト構造を維持します。

## Implementation Strategy

### Single File Approach

全ての変更をindex.html内で完結させ、新しいファイルは作成しません。

### Additive Changes Only

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <!-- 既存のhead内容（変更なし） -->
    
    <!-- 新規追加: エントリーページCSS -->
    <style>
        /* エントリーページスタイル */
    </style>
</head>
<body>
    <!-- 新規追加: エントリーページ -->
    <div id="entryPage">
        <!-- エントリーページHTML -->
    </div>
    
    <!-- 既存のbody内容（変更なし） -->
    
    <!-- 新規追加: エントリーページJavaScript -->
    <script>
        // エントリーページ制御関数
        
        // 既存のスクリプト読み込みを条件付きに変更
        let gameInitialized = false;
        
        function initializeGameAfterUserAction() {
            if (!gameInitialized) {
                gameInitialized = true;
                // 既存のスクリプト読み込み
            }
        }
    </script>
    
    <!-- 既存のスクリプト（条件付き読み込みに変更） -->
</body>
</html>
```

### Preservation of Existing Systems

- **PWA Meta Tags**: 全て保持
- **SEO Functionality**: 全て保持  
- **Accessibility CSS**: 全て保持
- **Existing Scripts**: 読み込みタイミングのみ変更

## Risk Mitigation

### Minimal Change Strategy

1. **No Function Modifications**: 既存関数は一切変更しない
2. **No File Structure Changes**: 新しいファイルは作成しない
3. **No Dependency Changes**: 新しい依存関係は追加しない
4. **No Architecture Changes**: 既存のアーキテクチャは維持

### Fallback Strategy

```javascript
// フォールバック: エントリーページが失敗した場合
if (typeof showEntryPage === 'undefined') {
    // 直接ゲームを開始（既存の動作）
    initApp();
}
```

## Performance Considerations

### Instant Loading

- **No Resource Loading**: エントリーページでは一切のリソースを読み込まない
- **Minimal CSS**: 必要最小限のスタイルのみ
- **No JavaScript Execution**: ボタンクリックまでJavaScript処理なし

### Memory Efficiency

- **No Object Creation**: 複雑なオブジェクトは作成しない
- **No Event Listeners**: 必要最小限のイベントリスナーのみ
- **No DOM Manipulation**: 表示/非表示の切り替えのみ