# Implementation Plan

- [x] 1. Create UI components for settings screen functionality
  - Create reusable UI components to replace keyboard shortcut functionality
  - Implement proper error handling and user feedback
  - _Requirements: 1.2, 2.2, 3.3, 4.4, 4.5, 4.6, 5.4, 5.5, 5.6_

- [x] 1.1 Create VolumeControlComponent for audio volume management
  - Implement volume up/down buttons with proper state management
  - Add visual feedback for current volume level and button states
  - Handle edge cases (min/max volume) with appropriate button disabling
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 1.2 Create AccessibilityProfileComponent for profile switching
  - Implement profile selection UI (dropdown or button set)
  - Display current active profile clearly
  - Handle profile switching with immediate visual feedback
  - _Requirements: 5.4, 5.7_

- [x] 1.3 Create SettingsImportExportComponent for settings management
  - Implement export settings button with file download functionality
  - Implement import settings button with file selection and validation
  - Add proper error handling for file operations
  - _Requirements: 5.5, 5.6, 5.8, 5.9_

- [x] 2. Add new setting items to SettingsScene configuration
  - Extend settingItems configuration to include new UI controls
  - Organize controls in appropriate categories (general, accessibility)
  - Ensure proper labeling and descriptions in Japanese
  - _Requirements: 1.2, 2.2, 4.4, 4.5, 4.6, 5.4, 5.5, 5.6_

- [x] 2.1 Add fullscreen toggle to general settings category
  - Add fullscreen toggle setting item with proper configuration
  - Implement toggle functionality that calls ResponsiveCanvasManager
  - Add visual state indication for current fullscreen status
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 2.2 Add audio mute toggle to general settings category
  - Add audio mute toggle setting item with proper configuration
  - Implement toggle functionality that calls AudioManager
  - Add visual state indication for current mute status
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 2.3 Add volume control buttons to general settings category
  - Add custom volume control setting item
  - Integrate VolumeControlComponent into settings rendering
  - Ensure proper positioning and sizing within settings layout
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 2.4 Add accessibility controls to accessibility settings category
  - Add high contrast, large text, and reduced motion toggles if not present
  - Integrate AccessibilityProfileComponent for profile switching
  - Integrate SettingsImportExportComponent for settings management
  - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 3. Implement custom rendering methods in SettingsScene
  - Add custom rendering support for new UI components
  - Ensure components integrate properly with existing settings UI
  - Handle mouse/touch interactions for custom components
  - _Requirements: 1.3, 2.3, 3.4, 3.5, 4.7, 5.7, 5.8, 5.9_

- [x] 3.1 Implement renderVolumeControls method
  - Create custom rendering method for volume control buttons
  - Handle button positioning, sizing, and visual states
  - Implement click detection and volume adjustment logic
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3.2 Implement renderAccessibilityProfiles method
  - Create custom rendering method for profile switching UI
  - Display available profiles and highlight current selection
  - Handle profile switching interactions and state updates
  - _Requirements: 5.4, 5.7_

- [x] 3.3 Implement renderSettingsImportExport method
  - Create custom rendering method for import/export buttons
  - Handle file operations and provide user feedback
  - Implement proper error handling and success notifications
  - _Requirements: 5.5, 5.6, 5.8, 5.9_

- [x] 4. Migrate functionality from KeyboardShortcutManager to SettingsScene
  - Move keyboard shortcut logic to appropriate UI handlers
  - Preserve existing functionality while removing keyboard triggers
  - Ensure proper error handling and state management
  - _Requirements: 1.3, 2.3, 3.4, 3.5, 4.7, 5.7, 5.8, 5.9_

- [x] 4.1 Migrate fullscreen toggle functionality
  - Move handleFullscreen logic to SettingsScene.handleFullscreenToggle
  - Ensure ResponsiveCanvasManager integration works correctly
  - Add proper error handling for fullscreen API failures
  - _Requirements: 1.3, 1.4_

- [x] 4.2 Migrate audio mute toggle functionality
  - Move handleMute logic to SettingsScene.handleMuteToggle
  - Ensure AudioManager integration and settings persistence
  - Add proper error handling for audio system failures
  - _Requirements: 2.3, 2.4_

- [x] 4.3 Migrate volume control functionality
  - Move handleVolumeUp and handleVolumeDown logic to SettingsScene
  - Implement proper volume bounds checking and button state management
  - Ensure settings persistence and immediate audio feedback
  - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [x] 4.4 Migrate accessibility toggle functionality
  - Move handleHighContrast, handleLargeText, handleReducedMotion logic
  - Ensure AccessibilitySettingsManager integration works correctly
  - Add immediate visual feedback for accessibility changes
  - _Requirements: 4.7, 4.8_

- [x] 4.5 Migrate settings management functionality
  - Move profile switching, export, and import logic to SettingsScene
  - Ensure proper file handling and data validation
  - Add comprehensive error handling and user feedback
  - _Requirements: 5.7, 5.8, 5.9_

- [x] 5. Remove keyboard shortcuts from KeyboardShortcutManager
  - Remove shortcut registrations and handler methods
  - Clean up any references to removed shortcuts
  - Update help text generation to exclude removed shortcuts
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

- [x] 5.1 Remove fullscreen and audio keyboard shortcuts
  - Remove 'fullscreen' and 'mute' shortcut registrations from initializeDefaultShortcuts
  - Delete handleFullscreen and handleMute methods completely
  - Clean up any references in help text or documentation
  - _Requirements: 1.1, 2.1_

- [x] 5.2 Remove volume control keyboard shortcuts
  - Remove 'volumeUp' and 'volumeDown' shortcut registrations
  - Delete handleVolumeUp and handleVolumeDown methods completely
  - Update help text generation to exclude volume shortcuts
  - _Requirements: 3.1, 3.2_

- [x] 5.3 Remove accessibility keyboard shortcuts
  - Remove 'highContrast', 'largeText', 'reducedMotion' shortcut registrations
  - Delete corresponding handler methods completely
  - Clean up any accessibility shortcut references
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5.4 Remove settings management keyboard shortcuts
  - Remove any Ctrl+P, Ctrl+E, Ctrl+I shortcut registrations if present
  - Delete corresponding handler methods from SettingsScene
  - Clean up any settings management shortcut references
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Update documentation to reflect changes
  - Remove references to deleted keyboard shortcuts
  - Update both Japanese and English documentation
  - Maintain references to remaining valid shortcuts
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 6.1 Update Japanese keyboard shortcuts documentation
  - Remove F key fullscreen shortcut from docs/keyboard-shortcuts.md
  - Remove M key mute shortcut from basic game operations section
  - Remove Ctrl+↑/↓ volume shortcuts from volume control section
  - Remove accessibility shortcuts (Ctrl+Alt+H/T/M) from accessibility section
  - Remove settings management shortcuts (Ctrl+P/E/I) from settings section
  - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.7_

- [x] 6.2 Update English keyboard shortcuts documentation
  - Remove F key fullscreen shortcut from docs/keyboard-shortcuts.en.md
  - Remove M key mute shortcut from basic game operations section
  - Remove Ctrl+↑/↓ volume shortcuts from volume control section
  - Remove accessibility shortcuts (Ctrl+Alt+H/T/M) from accessibility section
  - Remove settings management shortcuts (Ctrl+P/E/I) from settings section
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.7_

- [x] 6.3 Update documentation to reference settings UI
  - Add notes about accessing functionality through settings screen
  - Update any usage examples to reference UI controls instead of shortcuts
  - Ensure documentation accurately reflects current available shortcuts
  - _Requirements: 6.6, 6.7_

- [ ] 7. Create comprehensive test suite
  - Create unit tests for new UI components and functionality
  - Create integration tests for settings screen interactions
  - Create browser tests for end-to-end functionality validation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.1 Create unit tests for UI components
  - Test VolumeControlComponent functionality and state management
  - Test AccessibilityProfileComponent profile switching
  - Test SettingsImportExportComponent file operations
  - Verify proper error handling in all components
  - _Requirements: 7.1, 7.2_

- [ ] 7.2 Create unit tests for keyboard shortcut removal
  - Test that F, M keys no longer trigger any functionality
  - Test that Ctrl+↑/↓ keys no longer affect volume
  - Test that accessibility shortcuts (Ctrl+Alt+H/T/M) have no effect
  - Test that settings management shortcuts (Ctrl+P/E/I) have no effect
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

- [ ] 7.3 Create integration tests for settings screen
  - Test that all new UI controls appear in correct categories
  - Test that settings persistence works with new UI controls
  - Test that UI state updates correctly when settings change
  - Verify proper integration with existing settings functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.4 Create browser tests for end-to-end functionality
  - Test fullscreen toggle through settings UI
  - Test audio mute toggle through settings UI
  - Test volume control buttons through settings UI
  - Test accessibility toggles through settings UI
  - Test settings export/import through settings UI
  - _Requirements: 1.2, 1.3, 1.4, 2.2, 2.3, 2.4, 3.3, 3.4, 3.5, 4.4, 4.5, 4.6, 4.7, 4.8, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [ ] 7.5 Create tests for settings persistence
  - Test that UI-changed settings are saved to localStorage
  - Test that settings are restored correctly on game restart
  - Test that export includes all relevant settings
  - Test that import applies settings correctly
  - Test fallback to defaults when settings fail to load
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Perform manual testing and validation
  - Manually test all new UI functionality
  - Verify removed shortcuts have no effect
  - Test settings persistence across game sessions
  - Validate user experience and accessibility
  - _Requirements: All requirements validation_

- [ ] 8.1 Manual test new settings UI functionality
  - Test fullscreen toggle button in settings screen
  - Test audio mute toggle button in settings screen
  - Test volume up/down buttons in settings screen
  - Test accessibility toggle buttons in settings screen
  - Test profile switching, export, and import functionality
  - _Requirements: 1.2, 1.3, 1.4, 2.2, 2.3, 2.4, 3.3, 3.4, 3.5, 4.4, 4.5, 4.6, 4.7, 4.8, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [ ] 8.2 Manual test keyboard shortcut removal
  - Verify F key no longer toggles fullscreen
  - Verify M key no longer toggles mute
  - Verify Ctrl+↑/↓ keys no longer affect volume
  - Verify accessibility shortcuts (Ctrl+Alt+H/T/M) have no effect
  - Verify settings management shortcuts (Ctrl+P/E/I) have no effect
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

- [ ] 8.3 Manual test settings persistence
  - Change settings through new UI controls and restart game
  - Export settings and verify file contents
  - Import settings and verify they are applied correctly
  - Test error handling when settings fail to load
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Final cleanup and code quality assurance
  - Remove any dead code or unused references
  - Run linting and code quality checks
  - Update inline documentation and comments
  - Perform final validation of all requirements
  - _Requirements: All requirements final validation_

- [ ] 9.1 Clean up dead code and references
  - Search codebase for any remaining references to removed shortcuts
  - Remove any orphaned comments or documentation
  - Clean up any unused imports or dependencies
  - Verify no console errors or warnings are generated
  - _Requirements: Code quality maintenance_

- [ ] 9.2 Update inline documentation and JSDoc comments
  - Update method documentation to reflect new functionality
  - Add JSDoc comments for new UI components and methods
  - Ensure all public methods have proper documentation
  - Update any code comments that reference removed shortcuts
  - _Requirements: Documentation accuracy_

- [ ] 9.3 Run comprehensive code quality checks
  - Execute all linting tools and fix any issues
  - Run static analysis tools and address findings
  - Verify code follows project conventions and patterns
  - Ensure test coverage meets project standards
  - _Requirements: Code quality assurance_