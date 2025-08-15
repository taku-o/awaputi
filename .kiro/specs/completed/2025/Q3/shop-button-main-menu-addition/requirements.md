# Requirements Document

## Introduction

Issue #171に対応し、ステージ選択画面でのSキーショートカット（ショップ画面へ）を削除し、代わりにメインメニューにショップボタンを追加する機能を実装します。これにより、ユーザーはより直感的にショップにアクセスできるようになり、キーボードショートカットに依存しない操作が可能になります。

## Requirements

### Requirement 1: Sキーショートカットの削除

**User Story:** As a user, I want keyboard shortcuts to be simplified so that I can use the game without memorizing complex key combinations.

#### Acceptance Criteria

1. WHEN user presses S key in stage selection screen THEN system SHALL NOT navigate to shop screen
2. WHEN user views stage selection screen THEN system SHALL NOT display S key shortcut instruction
3. WHEN user checks keyboard shortcut documentation THEN system SHALL NOT find S key shortcut for shop navigation

### Requirement 2: メインメニューへのショップボタン追加

**User Story:** As a user, I want to access the shop from the main menu so that I can easily purchase items without navigating through multiple screens.

#### Acceptance Criteria

1. WHEN user views main menu THEN system SHALL display shop button as menu item
2. WHEN user clicks shop button THEN system SHALL navigate to shop screen
3. WHEN user uses keyboard navigation in main menu THEN system SHALL allow selection of shop button with arrow keys
4. WHEN user presses Enter on selected shop button THEN system SHALL navigate to shop screen

### Requirement 3: メニュー項目の順序と配置

**User Story:** As a user, I want the menu items to be logically ordered so that I can easily find the functionality I need.

#### Acceptance Criteria

1. WHEN user views main menu THEN system SHALL display menu items in logical order: ゲーム開始, ショップ, 設定, ユーザー情報, ヘルプ
2. WHEN user navigates with keyboard THEN system SHALL maintain proper selection index for all menu items including shop
3. WHEN user views menu THEN system SHALL display shop button with appropriate visual styling consistent with other menu items

### Requirement 4: ドキュメント更新

**User Story:** As a user, I want accurate documentation so that I can understand the current keyboard shortcuts and menu options.

#### Acceptance Criteria

1. WHEN user reads keyboard shortcuts documentation THEN system SHALL NOT include S key shortcut for shop navigation
2. WHEN user reads documentation THEN system SHALL reflect current menu structure including shop button
3. WHEN user views both Japanese and English documentation THEN system SHALL have consistent information across languages

### Requirement 5: 既存機能の保持

**User Story:** As a user, I want existing functionality to continue working so that my game experience is not disrupted.

#### Acceptance Criteria

1. WHEN user accesses shop from main menu THEN system SHALL provide same shop functionality as before
2. WHEN user navigates in stage selection screen THEN system SHALL maintain all existing navigation except S key shortcut
3. WHEN user uses other keyboard shortcuts THEN system SHALL continue to work as before
4. WHEN user clicks existing UI elements THEN system SHALL maintain current click functionality