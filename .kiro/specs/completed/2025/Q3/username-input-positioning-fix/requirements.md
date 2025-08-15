# Requirements Document

## Introduction

ゲーム開始時に表示されるユーザー名入力フォームが画面の右下に表示されてしまい、本来の中央位置に配置されていない問題を修正する。この問題は、ResponsiveCanvasManagerの座標変換システムとUsernameInputManagerの座標計算の不整合が原因と考えられる。

## Requirements

### Requirement 1

**User Story:** As a player, I want the username input form to be displayed in the center of the screen, so that I can easily see and interact with it when starting the game.

#### Acceptance Criteria

1. WHEN the game starts and no username is set THEN the username input form SHALL be displayed in the center of the screen
2. WHEN the screen is resized THEN the username input form SHALL remain centered
3. WHEN the game is played on different devices (desktop, mobile, tablet) THEN the username input form SHALL be properly centered on all devices
4. WHEN the browser window aspect ratio changes THEN the username input form SHALL maintain its centered position

### Requirement 2

**User Story:** As a developer, I want the username input positioning to use the ResponsiveCanvasManager coordinate system, so that it is consistent with other UI elements in the game.

#### Acceptance Criteria

1. WHEN rendering the username input form THEN the system SHALL use ResponsiveCanvasManager's coordinate transformation methods
2. WHEN ResponsiveCanvasManager provides canvas info THEN the username input SHALL use the provided scale and pixelRatio values
3. WHEN ResponsiveCanvasManager is not available THEN the system SHALL fall back to direct scale calculation with proper error handling
4. WHEN high DPI displays are used THEN the username input form SHALL render correctly with proper scaling

### Requirement 3

**User Story:** As a player, I want the username input form to be visually consistent and properly sized, so that it provides a good user experience across different screen sizes.

#### Acceptance Criteria

1. WHEN the username input form is displayed THEN all elements (title, input box, buttons, help text) SHALL be properly positioned relative to each other
2. WHEN the screen size changes THEN the font sizes and element sizes SHALL scale appropriately
3. WHEN the form is displayed on small screens THEN all elements SHALL remain visible and usable
4. WHEN the form is displayed on large screens THEN the elements SHALL not become disproportionately large

### Requirement 4

**User Story:** As a developer, I want the coordinate transformation logic to be maintainable and debuggable, so that future positioning issues can be easily identified and fixed.

#### Acceptance Criteria

1. WHEN coordinate transformations are performed THEN the system SHALL log relevant debugging information in debug mode
2. WHEN coordinate calculations fail THEN the system SHALL provide clear error messages with context
3. WHEN fallback coordinate calculation is used THEN the system SHALL log this information for debugging
4. WHEN ResponsiveCanvasManager integration is tested THEN the system SHALL provide methods to verify coordinate accuracy