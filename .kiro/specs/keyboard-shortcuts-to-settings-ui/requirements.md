# Requirements Document

## Introduction

This feature addresses GitHub issue #170, which is a sub-issue of #164. The goal is to simplify the user experience by removing unnecessary keyboard shortcuts and moving their functionality to the settings screen UI. This change will make the game more accessible to casual users who prefer clear, visible UI controls over keyboard shortcuts.

## Requirements

### Requirement 1: Remove Fullscreen Keyboard Shortcut

**User Story:** As a casual game player, I want to access fullscreen mode through a clear UI button in the settings screen, so that I don't need to remember keyboard shortcuts.

#### Acceptance Criteria

1. WHEN the user presses the F key THEN the system SHALL NOT toggle fullscreen mode
2. WHEN the user opens the settings screen THEN the system SHALL display a fullscreen toggle button in the general settings category
3. WHEN the user clicks the fullscreen toggle button THEN the system SHALL toggle fullscreen mode
4. WHEN fullscreen mode is active THEN the toggle button SHALL show the current state clearly

### Requirement 2: Remove Audio Mute Keyboard Shortcut

**User Story:** As a casual game player, I want to control audio muting through a clear UI button in the settings screen, so that I can easily find and use this common feature.

#### Acceptance Criteria

1. WHEN the user presses the M key THEN the system SHALL NOT toggle audio mute
2. WHEN the user opens the settings screen THEN the system SHALL display an audio mute toggle button in the general settings category
3. WHEN the user clicks the audio mute toggle button THEN the system SHALL toggle audio mute state
4. WHEN audio is muted THEN the toggle button SHALL show the current mute state clearly

### Requirement 3: Remove Volume Control Keyboard Shortcuts

**User Story:** As a casual game player, I want to adjust volume through intuitive UI controls in the settings screen, so that I can easily control audio levels without memorizing key combinations.

#### Acceptance Criteria

1. WHEN the user presses Ctrl+↑ THEN the system SHALL NOT increase volume
2. WHEN the user presses Ctrl+↓ THEN the system SHALL NOT decrease volume
3. WHEN the user opens the settings screen THEN the system SHALL display volume up and volume down buttons in the general settings category
4. WHEN the user clicks volume up button THEN the system SHALL increase master volume by 10%
5. WHEN the user clicks volume down button THEN the system SHALL decrease master volume by 10%
6. WHEN volume reaches maximum (100%) THEN the volume up button SHALL be disabled
7. WHEN volume reaches minimum (0%) THEN the volume down button SHALL be disabled

### Requirement 4: Remove Accessibility Keyboard Shortcuts

**User Story:** As a user with accessibility needs, I want to access accessibility features through a dedicated settings section, so that I can easily find and configure all accessibility options in one place.

#### Acceptance Criteria

1. WHEN the user presses Ctrl+Alt+H THEN the system SHALL NOT toggle high contrast mode
2. WHEN the user presses Ctrl+Alt+T THEN the system SHALL NOT toggle large text mode
3. WHEN the user presses Ctrl+Alt+M THEN the system SHALL NOT toggle reduced motion mode
4. WHEN the user opens the settings screen and navigates to accessibility category THEN the system SHALL display high contrast toggle button
5. WHEN the user opens the settings screen and navigates to accessibility category THEN the system SHALL display large text toggle button
6. WHEN the user opens the settings screen and navigates to accessibility category THEN the system SHALL display reduced motion toggle button
7. WHEN the user clicks any accessibility toggle button THEN the system SHALL apply the setting immediately
8. WHEN accessibility settings are changed THEN the toggle buttons SHALL show the current state clearly

### Requirement 5: Remove Settings Management Keyboard Shortcuts

**User Story:** As a user who wants to manage my settings, I want to access profile switching, export, and import functions through clear UI buttons, so that I can easily manage my configuration without keyboard shortcuts.

#### Acceptance Criteria

1. WHEN the user presses Ctrl+P THEN the system SHALL NOT switch accessibility profiles
2. WHEN the user presses Ctrl+E THEN the system SHALL NOT export settings
3. WHEN the user presses Ctrl+I THEN the system SHALL NOT import settings
4. WHEN the user opens the settings screen and navigates to accessibility category THEN the system SHALL display a profile switching dropdown or button set
5. WHEN the user opens the settings screen and navigates to accessibility category THEN the system SHALL display an export settings button
6. WHEN the user opens the settings screen and navigates to accessibility category THEN the system SHALL display an import settings button
7. WHEN the user clicks profile switching control THEN the system SHALL allow switching between Default, High Contrast, and Motor Accessibility profiles
8. WHEN the user clicks export settings button THEN the system SHALL export accessibility settings in JSON format
9. WHEN the user clicks import settings button THEN the system SHALL allow importing previously exported settings

### Requirement 6: Update Documentation

**User Story:** As a user reading the game documentation, I want the keyboard shortcut documentation to reflect the current available shortcuts, so that I have accurate information about game controls.

#### Acceptance Criteria

1. WHEN the documentation is updated THEN the system SHALL remove references to F key fullscreen shortcut
2. WHEN the documentation is updated THEN the system SHALL remove references to M key mute shortcut
3. WHEN the documentation is updated THEN the system SHALL remove references to Ctrl+↑/↓ volume shortcuts
4. WHEN the documentation is updated THEN the system SHALL remove references to Ctrl+Alt+H/T/M accessibility shortcuts
5. WHEN the documentation is updated THEN the system SHALL remove references to Ctrl+P/E/I settings management shortcuts
6. WHEN the documentation is updated THEN the system SHALL update both Japanese and English versions
7. WHEN the documentation is updated THEN the system SHALL maintain references to remaining valid shortcuts (Space, Escape, F1, Ctrl+H, etc.)

### Requirement 7: Maintain Settings Persistence

**User Story:** As a user who configures settings through the new UI controls, I want my settings to be saved and restored properly, so that my preferences are maintained across game sessions.

#### Acceptance Criteria

1. WHEN the user changes any setting through the new UI controls THEN the system SHALL save the setting to localStorage
2. WHEN the user restarts the game THEN the system SHALL restore all settings from localStorage
3. WHEN settings are exported through the new UI THEN the system SHALL include all relevant settings in the export file
4. WHEN settings are imported through the new UI THEN the system SHALL apply all settings from the import file
5. WHEN settings fail to load THEN the system SHALL use default values and notify the user appropriately