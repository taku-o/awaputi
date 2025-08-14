# Design Document

## Overview

この設計では、ステージ選択画面のSキーショートカットを削除し、メインメニューにショップボタンを追加することで、より直感的なユーザーインターフェースを実現します。既存のアーキテクチャを活用しながら、最小限の変更で要件を満たす設計を採用します。

## Architecture

### 影響を受けるコンポーネント

1. **MainMenuScene** (`src/scenes/MainMenuScene.js`)
   - メニュー項目配列にショップ項目を追加
   - ショップ選択時のナビゲーション処理を追加

2. **StageSelectDataManager** (`src/scenes/stage-select/StageSelectDataManager.js`)
   - Sキーのキーボードハンドリングを削除
   - ショップボタンの描画とクリック処理を削除（UI簡素化）

3. **Documentation Files**
   - `docs/keyboard-shortcuts.md`
   - `docs/keyboard-shortcuts.en.md`

### アーキテクチャ原則

- **最小変更原則**: 既存のコードベースへの影響を最小限に抑制
- **一貫性維持**: 既存のメニューシステムのパターンに従う
- **後方互換性**: 既存のショップ機能は変更しない

## Components and Interfaces

### MainMenuScene の拡張

#### 新しいメニュー項目構造
```javascript
this.menuItems = [
    { id: 'start', key: 'menu.start', action: () => this.startGame() },
    { id: 'shop', key: 'menu.shop', action: () => this.openShop() },      // 新規追加
    { id: 'settings', key: 'menu.settings', action: () => this.openSettings() },
    { id: 'userInfo', key: 'menu.userInfo', action: () => this.openUserInfo() },
    { id: 'help', key: 'menu.help', action: () => this.openHelp() }
];
```

#### 新しいメソッド
```javascript
/**
 * ショップ画面を開く
 */
openShop() {
    this.gameEngine.sceneManager.switchScene('shop');
}
```

### StageSelectDataManager の修正

#### 削除する機能
1. `handleStageKeyInput`メソッドからSキーのcase文を削除
2. `renderShopButton`メソッドを削除（オプション）
3. `handleShopButtonClick`メソッドを削除（オプション）
4. `renderControls`メソッドからSキーの説明を削除

#### 修正後のキーハンドリング
```javascript
handleStageKeyInput(event) {
    switch (event.code) {
        case 'ArrowUp':
            this.moveSelection(-1);
            return true;
        case 'ArrowDown':
            this.moveSelection(1);
            return true;
        case 'Enter':
            this.selectStage();
            return true;
        // case 'KeyS': を削除
        default:
            return false;
    }
}
```

### 国際化対応

#### 新しい翻訳キー
- `menu.shop` (日本語: "ショップ", 英語: "Shop")

#### 既存の翻訳ファイルへの追加
- `src/locales/ja.json`
- `src/locales/en.json`
- その他の言語ファイル

## Data Models

### メニュー項目データ構造

```javascript
// 既存の構造を維持、ショップ項目を追加
{
    id: 'shop',           // 識別子
    key: 'menu.shop',     // 国際化キー
    action: Function,     // 実行する関数
    label: String         // 表示ラベル（実行時に設定）
}
```

### 状態管理

既存の`selectedMenuIndex`システムを使用し、新しいメニュー項目に対応:
- インデックス0: ゲーム開始
- インデックス1: ショップ（新規）
- インデックス2: 設定
- インデックス3: ユーザー情報
- インデックス4: ヘルプ

## Error Handling

### エラーケース

1. **ショップシーンが存在しない場合**
   ```javascript
   openShop() {
       try {
           const success = this.gameEngine.sceneManager.switchScene('shop');
           if (!success) {
               console.error('[MainMenuScene] Failed to switch to shop scene');
               // フォールバック: エラーメッセージ表示
           }
       } catch (error) {
           this.errorHandler.handleError(error, {
               context: 'MainMenuScene.openShop'
           });
       }
   }
   ```

2. **翻訳キーが見つからない場合**
   - 既存のエラーハンドリングシステムを使用
   - フォールバック文字列として"Shop"を使用

3. **メニューインデックスの範囲外アクセス**
   - 既存の`moveSelection`メソッドが適切に処理

## Testing Strategy

### 単体テスト

1. **MainMenuScene テスト**
   - ショップメニュー項目の存在確認
   - ショップ選択時のシーン遷移確認
   - メニューナビゲーションの正常動作確認

2. **StageSelectDataManager テスト**
   - Sキー押下時にショップに遷移しないことを確認
   - 他のキーボードショートカットが正常動作することを確認

### 統合テスト

1. **メインメニューからショップへの遷移テスト**
   - キーボードナビゲーション経由
   - マウスクリック経由

2. **ステージ選択画面でのキーボード操作テスト**
   - Sキーが無効化されていることを確認
   - 他のキーが正常動作することを確認

### E2Eテスト（Playwright）

```javascript
// メインメニューでのショップアクセステスト
test('should access shop from main menu', async ({ page }) => {
    await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');
    await page.getByRole('button', { name: 'ゲームを開始する' }).click();
    await page.waitForTimeout(3000);
    
    // ショップメニュー項目の存在確認
    // キーボードナビゲーションでショップを選択
    await page.keyboard.press('ArrowDown'); // ショップに移動
    await page.keyboard.press('Enter');     // ショップを選択
    
    // ショップ画面に遷移したことを確認
    // （具体的な確認方法はショップ画面の実装に依存）
});

// ステージ選択画面でのSキー無効化テスト
test('should not navigate to shop with S key in stage select', async ({ page }) => {
    // ステージ選択画面に移動
    // Sキーを押下
    await page.keyboard.press('KeyS');
    
    // ショップ画面に遷移していないことを確認
});
```

## Implementation Phases

### Phase 1: メインメニューへのショップボタン追加
1. 翻訳ファイルにショップキーを追加
2. MainMenuSceneのmenuItems配列にショップ項目を追加
3. openShopメソッドを実装
4. 単体テストを作成・実行

### Phase 2: ステージ選択画面からのSキーショートカット削除
1. StageSelectDataManagerからSキー処理を削除
2. UI表示からSキーの説明を削除
3. 単体テストを更新・実行

### Phase 3: ドキュメント更新
1. keyboard-shortcuts.mdからSキーの記述を削除
2. keyboard-shortcuts.en.mdからSキーの記述を削除
3. メインメニューの説明を更新（必要に応じて）

### Phase 4: テストと検証
1. 統合テストの実行
2. E2Eテストの実行
3. 手動テストによる最終確認

## Performance Considerations

### 影響評価
- **メモリ使用量**: メニュー項目が1つ増加するが、影響は微小
- **レンダリング性能**: メニュー項目の描画が1つ増加するが、影響は微小
- **ナビゲーション性能**: シーン遷移の処理は既存と同等

### 最適化
- 既存のメニューレンダリングシステムを活用するため、追加の最適化は不要
- ショップシーンの遅延読み込みは既存の実装に依存

## Security Considerations

- ユーザー入力の検証は既存のキーボードハンドリングシステムを使用
- シーン遷移の権限チェックは既存のSceneManagerに依存
- 新しいセキュリティリスクは導入されない

## Deployment Strategy

### 段階的デプロイメント
1. **開発環境**: 全ての変更を適用してテスト
2. **ステージング環境**: 統合テストとE2Eテストを実行
3. **本番環境**: 段階的にリリース

### ロールバック計画
- 変更が最小限のため、Git revertで簡単にロールバック可能
- 既存機能への影響が少ないため、リスクは低い

### 監視項目
- メインメニューの表示エラー
- ショップシーンへの遷移エラー
- キーボードナビゲーションの問題