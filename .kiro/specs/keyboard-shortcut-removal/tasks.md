# Implementation Plan

- [x] 1. Remove keyboard shortcut registrations from KeyboardShortcutManager
  - Remove the three shortcut registrations (S, H, I keys) from initializeDefaultShortcuts() method
  - Clean up any related initialization code
  - _Requirements: 2.1, 2.2_

- [x] 2. Remove handler methods from KeyboardShortcutManager
  - [x] 2.1 Remove handleSettings() method completely
    - Delete the entire handleSettings() method implementation
    - Remove any related helper code or comments
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Remove handleHelp() method completely  
    - Delete the entire handleHelp() method implementation
    - Remove any related helper code or comments
    - _Requirements: 2.1, 2.2_

  - [x] 2.3 Remove handleUserInfo() method completely
    - Delete the entire handleUserInfo() method implementation  
    - Remove any related helper code or comments
    - _Requirements: 2.1, 2.2_

- [x] 3. Clean up help text generation and references
  - Update generateHelpText() method to exclude removed shortcuts
  - Remove any references to removed shortcuts in method documentation
  - Clean up any console log messages that reference removed shortcuts
  - _Requirements: 2.3, 3.3_

- [x] 4. Update Japanese keyboard shortcuts documentation
  - [x] 4.1 Remove S key entry from docs/keyboard-shortcuts.md
    - Remove S key entry from "ヘルプ・設定アクセス" section
    - Update any statistics or counts if mentioned
    - _Requirements: 3.1, 3.3_

  - [x] 4.2 Remove H key entry from docs/keyboard-shortcuts.md
    - Remove H key entry from "ヘルプ・設定アクセス" section  
    - Update any related examples or usage notes
    - _Requirements: 3.1, 3.3_

  - [x] 4.3 Remove I key entry from docs/keyboard-shortcuts.md
    - Remove I key entry from "UI・メニュー操作" section
    - Clean up any orphaned table rows or formatting
    - _Requirements: 3.1, 3.3_

- [x] 5. Update English keyboard shortcuts documentation
  - [x] 5.1 Remove S key entry from docs/keyboard-shortcuts.en.md
    - Remove S key entry from "Help & Settings Access" section
    - Update any statistics or counts if mentioned
    - _Requirements: 3.2, 3.3_

  - [x] 5.2 Remove H key entry from docs/keyboard-shortcuts.en.md
    - Remove H key entry from "Help & Settings Access" section
    - Update any related examples or usage notes  
    - _Requirements: 3.2, 3.3_

  - [x] 5.3 Remove I key entry from docs/keyboard-shortcuts.en.md
    - Remove I key entry from "UI & Menu Navigation" section
    - Clean up any orphaned table rows or formatting
    - _Requirements: 3.2, 3.3_

- [ ] 6. Create unit tests for removed shortcuts verification
  - [ ] 6.1 Create test for S key non-functionality
    - Write test to verify S key press has no effect
    - Test that handleSettings method no longer exists
    - _Requirements: 5.1, 5.2_

  - [ ] 6.2 Create test for H key non-functionality
    - Write test to verify H key press has no effect
    - Test that handleHelp method no longer exists
    - _Requirements: 5.1, 5.2_

  - [ ] 6.3 Create test for I key non-functionality
    - Write test to verify I key press has no effect
    - Test that handleUserInfo method no longer exists
    - _Requirements: 5.1, 5.2_

- [ ] 7. Create unit tests for remaining shortcuts functionality
  - [ ] 7.1 Test Space key (pause) still works
    - Verify Space key continues to trigger pause functionality
    - Test handlePause method still exists and functions
    - _Requirements: 4.2, 5.2_

  - [ ] 7.2 Test Escape key (menu) still works
    - Verify Escape key continues to trigger menu functionality
    - Test handleMenu method still exists and functions
    - _Requirements: 4.2, 5.2_

  - [ ] 7.3 Test F key (fullscreen) still works
    - Verify F key continues to trigger fullscreen functionality
    - Test handleFullscreen method still exists and functions
    - _Requirements: 4.2, 5.2_

- [ ] 8. Create integration tests for KeyboardShortcutManager initialization
  - Test that KeyboardShortcutManager initializes without errors after shortcut removal
  - Verify no console errors are generated during initialization
  - Test that shortcut registration process works correctly for remaining shortcuts
  - _Requirements: 4.3, 5.3_

- [ ] 9. Create browser tests using Playwright
  - [ ] 9.1 Create test for removed shortcuts in game context
    - Test S, H, I keys have no effect during gameplay
    - Verify no error messages or console errors occur
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 9.2 Create test for remaining shortcuts in game context
    - Test Space, Escape, F keys still work during gameplay
    - Verify expected functionality is triggered
    - _Requirements: 4.2, 5.2_

  - [ ] 9.3 Create test for game loading without errors
    - Test that game loads successfully with updated keyboard shortcuts
    - Verify no JavaScript errors during game initialization
    - _Requirements: 4.3, 5.3_

- [ ] 10. Validate documentation accuracy
  - [ ] 10.1 Cross-reference documentation with actual implementation
    - Verify all shortcuts listed in documentation actually work
    - Confirm removed shortcuts are not mentioned anywhere
    - _Requirements: 3.3, 5.4_

  - [ ] 10.2 Test help text generation accuracy
    - Verify generateHelpText() method produces accurate output
    - Test that no removed shortcuts appear in generated help
    - _Requirements: 3.3, 5.4_

- [ ] 11. Perform manual regression testing
  - [ ] 11.1 Test all remaining keyboard shortcuts manually
    - Manually verify each remaining shortcut works as expected
    - Test shortcuts in different game contexts (menu, gameplay, etc.)
    - _Requirements: 4.1, 4.2_

  - [ ] 11.2 Test removed shortcuts have no effect
    - Manually verify S, H, I keys do nothing when pressed
    - Test in different game contexts to ensure consistency
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 11.3 Test game functionality is not impacted
    - Play through game to ensure core functionality works
    - Verify settings, help, and user info are still accessible via UI
    - _Requirements: 4.1, 4.2_

- [ ] 12. Final code cleanup and validation
  - [ ] 12.1 Remove any remaining dead code or comments
    - Search codebase for any remaining references to removed shortcuts
    - Clean up any orphaned comments or documentation
    - _Requirements: 2.3, 2.4_

  - [ ] 12.2 Run linting and code quality checks
    - Execute all linting tools to ensure code quality
    - Fix any issues identified by static analysis
    - _Requirements: 2.4_

  - [ ] 12.3 Update any inline documentation or JSDoc comments
    - Review and update method documentation as needed
    - Ensure JSDoc comments accurately reflect current functionality
    - _Requirements: 2.4, 3.3_