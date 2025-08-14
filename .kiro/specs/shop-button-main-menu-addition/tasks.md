# Implementation Plan

- [ ] 1. 翻訳ファイルにショップメニューキーを追加
  - 日本語と英語の翻訳ファイルにmenu.shopキーを追加
  - 他の言語ファイルにも対応する翻訳を追加
  - _Requirements: 2.1, 4.2_

- [ ] 2. MainMenuSceneにショップメニュー項目を追加
  - menuItems配列にショップ項目を適切な位置（インデックス1）に挿入
  - メニュー項目の順序を要件通りに調整
  - _Requirements: 2.1, 3.1_

- [ ] 3. MainMenuSceneにopenShopメソッドを実装
  - ショップシーンへの遷移処理を実装
  - エラーハンドリングを含む適切な実装
  - _Requirements: 2.2, 2.4, 5.1_

- [ ] 4. MainMenuSceneの単体テストを作成
  - ショップメニュー項目の存在確認テスト
  - ショップ選択時のシーン遷移テスト
  - メニューナビゲーションの正常動作テスト
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5. StageSelectDataManagerからSキーショートカットを削除
  - handleStageKeyInputメソッドからKeyS caseを削除
  - Sキー処理の完全な除去
  - _Requirements: 1.1_

- [ ] 6. StageSelectDataManagerのUI表示からSキー説明を削除
  - renderControlsメソッドからSキーの説明文を削除
  - ショップボタンの描画処理を削除（オプション）
  - _Requirements: 1.2_

- [ ] 7. StageSelectDataManagerの単体テストを更新
  - Sキー押下時にショップに遷移しないことを確認するテスト
  - 他のキーボードショートカットが正常動作することを確認するテスト
  - _Requirements: 1.1, 5.2, 5.3_

- [ ] 8. キーボードショートカットドキュメントを更新（日本語版）
  - docs/keyboard-shortcuts.mdからSキーショートカットの記述を削除
  - ステージ選択画面セクションの更新
  - _Requirements: 1.3, 4.1, 4.3_

- [ ] 9. キーボードショートカットドキュメントを更新（英語版）
  - docs/keyboard-shortcuts.en.mdからSキーショートカットの記述を削除
  - ステージ選択画面セクションの更新
  - _Requirements: 1.3, 4.1, 4.3_

- [ ] 10. 統合テストを実装
  - メインメニューからショップへの遷移テスト（キーボード・マウス両方）
  - ステージ選択画面でのキーボード操作テスト
  - _Requirements: 2.2, 2.3, 2.4, 1.1, 5.2_

- [ ] 11. E2Eテスト（Playwright）を実装
  - メインメニューでのショップアクセステスト
  - ステージ選択画面でのSキー無効化テスト
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 1.1_

- [ ] 12. 手動テストによる最終検証
  - 全ての要件が満たされていることを確認
  - 既存機能が正常に動作することを確認
  - ユーザビリティの確認
  - _Requirements: 5.1, 5.2, 5.3, 5.4_