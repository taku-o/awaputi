# Design Document

## Overview

This design document outlines the approach for removing specific keyboard shortcuts (S, H, I keys) from the BubblePop game as specified in GitHub issue #169. The removal will be implemented in a clean, systematic way that maintains code quality and ensures no functionality is broken.

## Architecture

### Current Keyboard Shortcut System

The current system is implemented in `src/core/KeyboardShortcutManager.js` with the following architecture:

- **CoreKeyboardShortcutManager**: Main class that manages all keyboard shortcuts
- **Shortcut Registration**: Uses `addShortcut()` method to register key combinations with callbacks
- **Event Handling**: Listens for keydown/keyup events and matches them against registered shortcuts
- **Context Awareness**: Shortcuts can be context-specific (global, game, menu, settings)

### Shortcuts to Remove

Based on issue #169, the following shortcuts will be removed:

1. **S key** - Settings screen access (`handleSettings()`)
2. **H key** - Standard help access (`handleHelp()`) 
3. **I key** - User info screen access (`handleUserInfo()`)

## Components and Interfaces

### Modified Components

#### 1. CoreKeyboardShortcutManager (`src/core/KeyboardShortcutManager.js`)

**Changes Required:**
- Remove shortcut registrations in `initializeDefaultShortcuts()`
- Remove handler methods: `handleSettings()`, `handleHelp()`, `handleUserInfo()`
- Update help text generation to exclude removed shortcuts
- Clean up any references to removed shortcuts

**Methods to Remove:**
```javascript
// These methods will be completely removed
handleSettings()
handleHelp() 
handleUserInfo()
```

**Shortcut Registrations to Remove:**
```javascript
// These registrations will be removed from initializeDefaultShortcuts()
this.addShortcut('settings', ['KeyS'], () => this.handleSettings());
this.addShortcut('help', ['KeyH'], () => this.handleHelp());
this.addShortcut('userInfo', ['KeyI'], () => this.handleUserInfo());
```

#### 2. Documentation Files

**Files to Update:**
- `docs/keyboard-shortcuts.md` - Japanese documentation
- `docs/keyboard-shortcuts.en.md` - English documentation

**Changes Required:**
- Remove entries for S, H, I keys from all relevant tables
- Update table of contents if necessary
- Remove any references to removed shortcuts in usage examples
- Update statistics/counts if mentioned

### Interfaces

#### KeyboardShortcutManager Interface

**Before (methods to be removed):**
```javascript
handleSettings(): void
handleHelp(): void  
handleUserInfo(): void
```

**After:**
These methods will no longer exist in the interface.

**Unchanged Methods:**
- `handlePause()`, `handleMenu()`, `handleFullscreen()`, etc. will remain
- Core functionality like `addShortcut()`, `removeShortcut()` will remain
- Event handling methods will remain

## Data Models

### Shortcut Configuration

**Current Model:**
```javascript
shortcuts: Map<string, {
  keys: string[],
  callback: function,
  description: string,
  context: string,
  enabled: boolean,
  preventDefault: boolean,
  stopPropagation: boolean
}>
```

**After Removal:**
The data model structure remains the same, but the following entries will be removed:
- `'settings'` entry
- `'help'` entry  
- `'userInfo'` entry

### Documentation Model

**Current Structure:**
```markdown
## UI・メニュー操作
| キー | 機能 | 説明 |
| I | ユーザー情報画面を開く | プレイヤーの統計情報を表示します |

## ヘルプ・設定アクセス  
| キー | 機能 | 説明 |
| S | 設定画面を開く | 統一された設定画面を表示 |
| H | 標準ヘルプを開く | 一般的な操作説明とヘルプを表示 |
```

**After Removal:**
These entries will be completely removed from the documentation tables.

## Error Handling

### Graceful Degradation

**Approach:**
- Remove shortcuts cleanly without leaving any dead code
- Ensure no console errors are generated from missing handlers
- Maintain existing error handling for remaining shortcuts

**Error Prevention:**
- Validate that all references to removed shortcuts are cleaned up
- Ensure no orphaned event listeners remain
- Test that removed key presses have no effect

### Fallback Mechanisms

**No Fallbacks Needed:**
Since these shortcuts are being completely removed (not replaced), no fallback mechanisms are required. The functionality they provided should be accessible through UI elements instead.

## Testing Strategy

### Unit Tests

**Test Categories:**

1. **Shortcut Removal Verification**
   - Test that S, H, I keys no longer trigger any actions
   - Verify removed methods no longer exist
   - Confirm shortcut registrations are removed

2. **Remaining Functionality Tests**
   - Test that other shortcuts (Space, Escape, F, etc.) still work
   - Verify keyboard event handling still functions properly
   - Test context-aware shortcuts still work correctly

3. **Error Prevention Tests**
   - Verify no console errors when removed keys are pressed
   - Test that KeyboardShortcutManager initializes without errors
   - Confirm help text generation works without removed shortcuts

### Integration Tests

**Test Scenarios:**

1. **Game Loading Tests**
   - Verify game loads successfully with updated KeyboardShortcutManager
   - Test that no JavaScript errors occur during initialization
   - Confirm all remaining shortcuts work in game context

2. **Documentation Accuracy Tests**
   - Verify documentation matches actual available shortcuts
   - Test that help text generation reflects current shortcuts
   - Confirm no references to removed shortcuts in UI

### Browser Testing

**Playwright Tests:**

1. **Key Press Tests**
   - Test S, H, I keys have no effect when pressed
   - Verify remaining shortcuts (Space, Escape, F) still work
   - Test in different game states (menu, gameplay, etc.)

2. **UI Verification Tests**
   - Confirm settings/help/user info are still accessible via UI buttons
   - Test that game functionality is not impacted
   - Verify no error messages appear when removed keys are pressed

### Test Implementation Strategy

**Test Structure:**
```javascript
// Example test structure
describe('Keyboard Shortcut Removal', () => {
  describe('Removed Shortcuts', () => {
    it('should not respond to S key press', () => {
      // Test S key has no effect
    });
    
    it('should not respond to H key press', () => {
      // Test H key has no effect  
    });
    
    it('should not respond to I key press', () => {
      // Test I key has no effect
    });
  });
  
  describe('Remaining Shortcuts', () => {
    it('should still respond to Space key for pause', () => {
      // Test Space key still works
    });
    
    it('should still respond to Escape key for menu', () => {
      // Test Escape key still works
    });
  });
});
```

## Implementation Approach

### Phase 1: Code Removal
1. Remove shortcut registrations from `initializeDefaultShortcuts()`
2. Remove handler methods (`handleSettings`, `handleHelp`, `handleUserInfo`)
3. Clean up any references in help text generation
4. Update method documentation/comments

### Phase 2: Documentation Update
1. Update `docs/keyboard-shortcuts.md` 
2. Update `docs/keyboard-shortcuts.en.md`
3. Remove references from any other documentation files
4. Update inline help text if applicable

### Phase 3: Testing & Validation
1. Create unit tests for removed shortcuts
2. Create integration tests for remaining functionality  
3. Add browser tests using Playwright
4. Validate documentation accuracy

### Phase 4: Quality Assurance
1. Manual testing of all remaining shortcuts
2. Verification that removed shortcuts have no effect
3. Game functionality regression testing
4. Documentation review and validation

## Risk Mitigation

### Potential Risks

1. **Breaking Existing Functionality**
   - Risk: Removing shortcuts might break other parts of the system
   - Mitigation: Comprehensive testing of remaining functionality

2. **Documentation Inconsistency**
   - Risk: Missing references to removed shortcuts in documentation
   - Mitigation: Systematic review of all documentation files

3. **User Confusion**
   - Risk: Users might expect removed shortcuts to work
   - Mitigation: Clear documentation of available shortcuts

### Rollback Plan

If issues are discovered after implementation:
1. Revert changes to KeyboardShortcutManager
2. Restore original documentation
3. Re-run full test suite
4. Deploy rollback version

## Success Criteria

1. **Functional Success:**
   - S, H, I keys have no effect when pressed
   - All other shortcuts continue to work normally
   - Game loads and runs without errors

2. **Code Quality Success:**
   - No dead code remains in codebase
   - All references to removed shortcuts are cleaned up
   - Code passes all linting and quality checks

3. **Documentation Success:**
   - Documentation accurately reflects available shortcuts
   - No references to removed shortcuts in any documentation
   - Help text generation works correctly

4. **Testing Success:**
   - All tests pass
   - Test coverage maintained or improved
   - No regression in existing functionality