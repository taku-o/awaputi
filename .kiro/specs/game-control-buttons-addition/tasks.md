# Implementation Plan

- [ ] 1. Create GameControlButtons component infrastructure
  - Create new file `src/scenes/game-scene/GameControlButtons.js`
  - Implement basic class structure with constructor, render, and event handling methods
  - Define button configuration constants for positioning, sizing, and styling
  - _Requirements: 1.1, 2.1, 4.1, 4.2, 4.3, 4.4_

- [ ] 2. Implement button rendering system
  - Add button drawing methods using Canvas 2D API
  - Implement hover state visual feedback
  - Add proper text rendering with Japanese font support
  - Create responsive positioning logic based on canvas dimensions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3. Create click detection and event handling
  - Implement precise click detection using button boundaries
  - Add mouse and touch event support for cross-platform compatibility
  - Create event delegation system for button interactions
  - Add hover state management for desktop users
  - _Requirements: 1.1, 2.1, 6.2, 6.1_

- [ ] 4. Build ConfirmationDialog component
  - Create new file `src/scenes/game-scene/ConfirmationDialog.js`
  - Implement modal dialog rendering with overlay background
  - Add dialog positioning and sizing logic
  - Create dialog button rendering (Yes/No buttons)
  - _Requirements: 1.2, 1.4, 2.2, 2.4_

- [ ] 5. Implement dialog interaction system
  - Add click detection for dialog buttons
  - Implement callback system for confirm/cancel actions
  - Add keyboard support (Enter/Escape) for dialog navigation
  - Create dialog state management (show/hide/cleanup)
  - _Requirements: 1.2, 1.3, 1.4, 2.2, 2.3, 2.4, 6.5_

- [ ] 6. Integrate components with GameUIManager
  - Modify `src/scenes/game-scene/GameUIManager.js` to include new components
  - Add initialization methods for buttons and dialog systems
  - Integrate button rendering into existing UI render pipeline
  - Add event handling delegation from GameUIManager to button components
  - _Requirements: 1.1, 2.1, 4.5_

- [ ] 7. Connect Give Up button functionality
  - Implement give up confirmation dialog trigger
  - Connect dialog confirmation to existing game state management
  - Add proper game termination logic that returns to main menu
  - Ensure give up works in all game states (playing, paused)
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 8. Connect Restart button functionality
  - Implement restart confirmation dialog trigger
  - Connect dialog confirmation to game state reset logic
  - Add proper game restart functionality that resets all game variables
  - Ensure restart works in all game states (playing, paused, game over)
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 9. Remove keyboard shortcuts from KeyboardShortcutManager
  - Modify `src/core/KeyboardShortcutManager.js` to remove G and R key registrations
  - Remove `handleGiveUp()` and `handleRestart()` method calls from key handlers
  - Remove shortcut definitions from `initializeDefaultShortcuts()` method
  - Verify no residual keyboard shortcut functionality remains
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 10. Add input event handling to GameScene
  - Modify `src/scenes/GameScene.js` to handle mouse/touch events for buttons
  - Add event listener setup and cleanup in enter/exit methods
  - Implement coordinate transformation for canvas-relative positioning
  - Add proper event propagation to prevent conflicts with game interactions
  - _Requirements: 1.1, 2.1, 6.1, 6.2_

- [ ] 11. Implement accessibility features
  - Add ARIA labels and roles for screen reader support
  - Implement keyboard navigation support (Tab, Enter, Escape)
  - Add focus indicators for keyboard users
  - Ensure proper color contrast for button text and backgrounds
  - _Requirements: 6.3, 6.5_

- [ ] 12. Add mobile device optimizations
  - Implement touch-friendly button sizes (minimum 44px targets)
  - Add touch event handling with proper preventDefault calls
  - Optimize button positioning for different screen orientations
  - Add visual feedback for touch interactions
  - _Requirements: 6.1, 4.4_

- [ ] 13. Create unit tests for GameControlButtons
  - Write tests for button rendering at correct positions
  - Test click detection accuracy with various coordinates
  - Verify button state changes (enabled/disabled, hover effects)
  - Test responsive positioning logic with different canvas sizes
  - _Requirements: All button-related requirements_

- [ ] 14. Create unit tests for ConfirmationDialog
  - Write tests for dialog show/hide functionality
  - Test callback execution on user actions (confirm/cancel)
  - Verify modal overlay rendering and positioning
  - Test dialog state management and cleanup
  - _Requirements: 1.2, 1.3, 1.4, 2.2, 2.3, 2.4_

- [ ] 15. Create integration tests for complete workflows
  - Test complete give up workflow from button click to menu return
  - Test complete restart workflow from button click to game reset
  - Verify keyboard shortcuts are completely disabled
  - Test UI updates and state consistency throughout workflows
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.3, 3.4_

- [ ] 16. Update keyboard shortcuts documentation
  - Modify `docs/keyboard-shortcuts.md` to remove G and R key references
  - Update `docs/keyboard-shortcuts.en.md` with same changes
  - Add note about UI button availability for game controls
  - Remove give up and restart entries from shortcut tables
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 17. Update help system content
  - Modify in-game help content to reflect new button controls
  - Remove references to removed keyboard shortcuts
  - Add instructions for using the new UI buttons
  - Ensure consistency between Japanese and English help content
  - _Requirements: 5.4, 5.3_

- [ ] 18. Perform cross-browser compatibility testing
  - Test button functionality in Chrome, Firefox, Safari, and Edge
  - Verify touch events work properly on mobile browsers
  - Test canvas rendering consistency across different browsers
  - Validate text rendering and font support
  - _Requirements: 6.1, 6.2, 4.2_

- [ ] 19. Conduct accessibility validation testing
  - Test screen reader compatibility with button labels
  - Verify keyboard navigation works properly
  - Validate color contrast ratios meet WCAG guidelines
  - Test with various accessibility tools and browser extensions
  - _Requirements: 6.3, 6.5_

- [ ] 20. Perform final integration and user acceptance testing
  - Test complete user workflows in realistic game scenarios
  - Verify no regressions in existing game functionality
  - Validate performance impact is minimal
  - Conduct final visual and functional verification
  - _Requirements: All requirements_