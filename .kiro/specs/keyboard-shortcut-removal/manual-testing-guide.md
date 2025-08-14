# Manual Regression Testing Guide

**Issue #169: Keyboard Shortcut Removal (S, H, I keys)**

## Testing Overview

This guide provides step-by-step instructions for manually testing the keyboard shortcut removal changes to ensure all requirements are met and no regression issues exist.

## Prerequisites

- Local development server running on `http://localhost:8000`
- Browser with developer tools enabled
- Access to game in different states (menu, gameplay, settings)

## Test Environment Setup

1. Start the local development server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

2. Open browser and navigate to `http://localhost:8000`
3. Open browser developer tools (F12)
4. Monitor console for any error messages during testing

## Test Scenarios

### 1. Removed Shortcuts Verification

#### 1.1 S Key (Settings) Removal Test
**Objective**: Verify S key no longer opens settings screen

**Steps**:
1. Navigate to main menu
2. Press 'S' key multiple times
3. Navigate to game scene (if available)
4. Press 'S' key multiple times
5. Monitor console for errors

**Expected Results**:
- ✅ Settings screen does NOT open when S is pressed
- ✅ No console errors related to settings
- ✅ No visual indication that S key was processed
- ✅ Game remains in current state

**Pass/Fail**: ______

#### 1.2 H Key (Help) Removal Test  
**Objective**: Verify H key no longer opens help screen

**Steps**:
1. Navigate to main menu
2. Press 'H' key multiple times
3. Navigate to game scene (if available)
4. Press 'H' key multiple times
5. Monitor console for errors

**Expected Results**:
- ✅ Help screen does NOT open when H is pressed
- ✅ No console errors related to help
- ✅ No visual indication that H key was processed
- ✅ Game remains in current state

**Pass/Fail**: ______

#### 1.3 I Key (User Info) Removal Test
**Objective**: Verify I key no longer opens user info screen

**Steps**:
1. Navigate to main menu
2. Press 'I' key multiple times
3. Navigate to game scene (if available)
4. Press 'I' key multiple times
5. Monitor console for errors

**Expected Results**:
- ✅ User info screen does NOT open when I is pressed
- ✅ No console errors related to user info
- ✅ No visual indication that I key was processed
- ✅ Game remains in current state

**Pass/Fail**: ______

### 2. Remaining Shortcuts Functionality

#### 2.1 Space Key (Pause) Test
**Objective**: Verify Space key still works for pause functionality

**Steps**:
1. Start a game or navigate to gameplay state
2. Press 'Space' key
3. Observe game state change
4. Press 'Space' key again to resume

**Expected Results**:
- ✅ Game pauses when Space is pressed (if in gameplay)
- ✅ Game resumes when Space is pressed again
- ✅ No console errors
- ✅ Pause functionality works as expected

**Pass/Fail**: ______

#### 2.2 Escape Key (Menu) Test
**Objective**: Verify Escape key still works for menu navigation

**Steps**:
1. Navigate to gameplay state (if available)
2. Press 'Escape' key
3. Observe navigation behavior
4. Try from different game states

**Expected Results**:
- ✅ Returns to menu when pressed during gameplay
- ✅ Closes dialog boxes or sub-screens appropriately
- ✅ No console errors
- ✅ Navigation works as expected

**Pass/Fail**: ______

#### 2.3 F Key (Fullscreen) Test
**Objective**: Verify F key still works for fullscreen toggle

**Steps**:
1. Ensure browser allows fullscreen (not in iframe)
2. Press 'F' key
3. Observe fullscreen behavior
4. Press 'F' key again to exit fullscreen

**Expected Results**:
- ✅ Toggles fullscreen mode when pressed
- ✅ No console errors
- ✅ Fullscreen functionality works as expected

**Pass/Fail**: ______

#### 2.4 M Key (Mute) Test
**Objective**: Verify M key still works for audio mute

**Steps**:
1. Ensure audio is enabled
2. Press 'M' key
3. Check audio status
4. Press 'M' key again

**Expected Results**:
- ✅ Toggles audio mute when pressed
- ✅ Audio settings are updated
- ✅ No console errors
- ✅ Mute functionality works as expected

**Pass/Fail**: ______

#### 2.5 F1 Key (Contextual Help) Test
**Objective**: Verify F1 key still works for contextual help

**Steps**:
1. Navigate to different game states
2. Press 'F1' key in each state
3. Observe help behavior
4. Monitor console

**Expected Results**:
- ✅ Opens contextual help when pressed
- ✅ Help content is relevant to current context
- ✅ No console errors
- ✅ Help navigation works properly

**Pass/Fail**: ______

#### 2.6 Ctrl+H Keys (Documentation Help) Test
**Objective**: Verify Ctrl+H still works for documentation help

**Steps**:
1. Navigate to different game states
2. Press 'Ctrl+H' key combination
3. Observe help behavior
4. Monitor console

**Expected Results**:
- ✅ Opens documentation help when pressed
- ✅ Documentation is comprehensive
- ✅ No console errors
- ✅ Help navigation works properly

**Pass/Fail**: ______

### 3. Game Loading and Stability

#### 3.1 Initial Game Loading Test
**Objective**: Verify game loads without keyboard shortcut related errors

**Steps**:
1. Clear browser cache
2. Reload the game page
3. Monitor console during loading
4. Wait for complete initialization

**Expected Results**:
- ✅ Game loads successfully
- ✅ No JavaScript errors in console
- ✅ No keyboard shortcut related errors
- ✅ All systems initialize properly

**Pass/Fail**: ______

#### 3.2 Mixed Key Interaction Test
**Objective**: Verify stability during rapid key interactions

**Steps**:
1. Navigate to game
2. Rapidly press removed keys (S, H, I) mixed with working keys (Space, Escape, F)
3. Continue for 30 seconds
4. Monitor console and game stability

**Expected Results**:
- ✅ Game remains stable
- ✅ No console errors
- ✅ Working shortcuts continue to function
- ✅ Removed shortcuts have no effect

**Pass/Fail**: ______

### 4. UI Accessibility Verification

#### 4.1 Settings Access via UI Test
**Objective**: Verify settings are still accessible through UI elements

**Steps**:
1. Look for settings button/menu item in UI
2. Click on settings access method
3. Verify settings screen opens
4. Test settings functionality

**Expected Results**:
- ✅ Settings screen is accessible via UI
- ✅ Settings functionality works properly
- ✅ No dependency on S key for access
- ✅ UI provides clear access path

**Pass/Fail**: ______

#### 4.2 Help Access via UI Test
**Objective**: Verify help is still accessible through UI elements

**Steps**:
1. Look for help button/menu item in UI
2. Click on help access method
3. Verify help screen opens
4. Test help functionality

**Expected Results**:
- ✅ Help screen is accessible via UI
- ✅ Help functionality works properly
- ✅ No dependency on H key for access
- ✅ UI provides clear access path

**Pass/Fail**: ______

### 5. Cross-Browser Testing

#### 5.1 Chrome/Chromium Test
**Browser**: Chrome/Chromium
**Version**: ________________

**Results**:
- Removed shortcuts (S, H, I): Pass/Fail ______
- Remaining shortcuts: Pass/Fail ______
- Game stability: Pass/Fail ______

#### 5.2 Firefox Test
**Browser**: Firefox
**Version**: ________________

**Results**:
- Removed shortcuts (S, H, I): Pass/Fail ______
- Remaining shortcuts: Pass/Fail ______
- Game stability: Pass/Fail ______

#### 5.3 Safari Test (if available)
**Browser**: Safari
**Version**: ________________

**Results**:
- Removed shortcuts (S, H, I): Pass/Fail ______
- Remaining shortcuts: Pass/Fail ______
- Game stability: Pass/Fail ______

## Documentation Verification

### 6.1 Japanese Documentation Check
**File**: `docs/keyboard-shortcuts.md`

**Steps**:
1. Open the Japanese documentation file
2. Search for references to S, H, I keys for removed functionality
3. Verify remaining shortcuts are documented
4. Check for consistency

**Expected Results**:
- ✅ No prominent references to S key for settings
- ✅ No prominent references to H key for help  
- ✅ No prominent references to I key for user info
- ✅ Remaining shortcuts are properly documented

**Pass/Fail**: ______

### 6.2 English Documentation Check
**File**: `docs/keyboard-shortcuts.en.md`

**Steps**:
1. Open the English documentation file
2. Search for references to S, H, I keys for removed functionality
3. Verify remaining shortcuts are documented
4. Check for consistency with Japanese version

**Expected Results**:
- ✅ No prominent references to S key for settings
- ✅ No prominent references to H key for help
- ✅ No prominent references to I key for user info
- ✅ Remaining shortcuts are properly documented

**Pass/Fail**: ______

## Performance and Regression Testing

### 7.1 Performance Impact Test
**Objective**: Verify no performance degradation from changes

**Steps**:
1. Open browser performance tools
2. Record performance while playing game
3. Use various shortcuts during recording
4. Analyze performance metrics

**Expected Results**:
- ✅ No performance degradation
- ✅ Keyboard event handling is efficient
- ✅ No memory leaks related to shortcuts

**Pass/Fail**: ______

### 7.2 Edge Case Testing
**Objective**: Test unusual scenarios

**Steps**:
1. Press removed keys while game is loading
2. Press removed keys during scene transitions
3. Press removed keys in quick succession with other keys
4. Test with modifier keys (Ctrl+S, Alt+H, Shift+I)

**Expected Results**:
- ✅ No unexpected behavior in any scenario
- ✅ No console errors
- ✅ Game remains stable

**Pass/Fail**: ______

## Test Summary

### Overall Test Results

**Total Test Cases**: 20
**Passed**: ______
**Failed**: ______
**Pass Rate**: ______%

### Critical Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Minor Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Recommendations
1. ________________________________
2. ________________________________
3. ________________________________

## Tester Information

**Tester Name**: ___________________
**Date**: ________________________
**Environment**: __________________
**Browser(s)**: ___________________
**OS**: _________________________

## Sign-off

**Tested by**: ____________________
**Date**: ________________________
**Status**: ☐ Approved ☐ Needs Revision

**Notes**: 
_________________________________
_________________________________
_________________________________