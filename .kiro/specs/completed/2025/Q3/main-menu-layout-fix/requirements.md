# Requirements Document

## Introduction

メインメニュー画面のレイアウト問題を修正する機能です。現在、タイトル「BubblePop」の表示が不完全（右側が切れて「Bubbl」のみ表示）で、メニューボタンが画面中央ではなく右寄りに配置されている問題があります。この問題により、ユーザーエクスペリエンスが損なわれているため、適切な中央配置とレスポンシブ対応を実装します。

## Requirements

### Requirement 1

**User Story:** As a player, I want the game title "BubblePop" to be displayed completely and centered on the main menu screen, so that I can clearly see the game name.

#### Acceptance Criteria

1. WHEN the main menu screen is displayed THEN the title "BubblePop" SHALL be completely visible without any text truncation
2. WHEN the main menu screen is displayed THEN the title SHALL be horizontally centered on the screen
3. WHEN the screen is resized THEN the title SHALL remain centered and fully visible
4. WHEN different screen resolutions are used THEN the title SHALL scale appropriately while maintaining readability

### Requirement 2

**User Story:** As a player, I want the menu buttons (ゲーム開始, 設定, ユーザー情報) to be properly centered on the screen, so that the interface looks balanced and professional.

#### Acceptance Criteria

1. WHEN the main menu screen is displayed THEN all menu buttons SHALL be horizontally centered on the screen
2. WHEN the main menu screen is displayed THEN menu buttons SHALL be vertically aligned with consistent spacing
3. WHEN the screen is resized THEN the menu buttons SHALL remain centered
4. WHEN different screen resolutions are used THEN the menu buttons SHALL maintain their relative positioning

### Requirement 3

**User Story:** As a player, I want the subtitle "泡割りゲーム" to be properly positioned and visible, so that I understand what type of game this is.

#### Acceptance Criteria

1. WHEN the main menu screen is displayed THEN the subtitle "泡割りゲーム" SHALL be completely visible
2. WHEN the main menu screen is displayed THEN the subtitle SHALL be centered below the main title
3. WHEN the screen is resized THEN the subtitle SHALL remain properly positioned relative to the main title
4. WHEN different screen resolutions are used THEN the subtitle SHALL scale appropriately

### Requirement 4

**User Story:** As a player, I want the player information display to be properly positioned, so that I can see my username clearly when it's set.

#### Acceptance Criteria

1. WHEN a username is set THEN the player information SHALL be displayed centered below the subtitle
2. WHEN no username is set THEN no player information SHALL be displayed
3. WHEN the screen is resized THEN the player information SHALL remain properly positioned
4. WHEN different screen resolutions are used THEN the player information SHALL scale appropriately

### Requirement 5

**User Story:** As a player, I want the control instructions to remain properly positioned at the bottom of the screen, so that I can always see how to navigate the menu.

#### Acceptance Criteria

1. WHEN the main menu screen is displayed THEN the control instructions SHALL be positioned at the bottom of the screen
2. WHEN the main menu screen is displayed THEN the control instructions SHALL be horizontally centered
3. WHEN the screen is resized THEN the control instructions SHALL remain at the bottom and centered
4. WHEN different screen resolutions are used THEN the control instructions SHALL remain readable and properly positioned

### Requirement 6

**User Story:** As a developer, I want the coordinate calculation system to be robust and maintainable, so that layout issues don't occur in the future.

#### Acceptance Criteria

1. WHEN coordinate calculations are performed THEN they SHALL use consistent scaling methods
2. WHEN the canvas size changes THEN all elements SHALL recalculate their positions correctly
3. WHEN debugging layout issues THEN the coordinate system SHALL be easily understandable
4. WHEN adding new menu elements THEN the positioning system SHALL be easily extensible