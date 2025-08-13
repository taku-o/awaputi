# Design Document

## Overview

This design addresses the navigation bug in HelpScene and SettingsScene where ESC key presses fail to return users to the main menu. The root cause is inconsistent scene name references and improper navigation method usage. The solution involves standardizing scene navigation patterns and correcting scene name references.

## Architecture

### Current Issues Analysis

1. **SettingsScene Navigation Issue**:
   - Line 744: `this.sceneManager.switchScene('mainMenu')` 
   - Problem: Scene is registered as 'menu', not 'mainMenu'
   - Error: "Scene mainMenu not found"

2. **HelpScene Navigation Issue**:
   - Line 112: `this.gameEngine.scenes.mainMenu.enter()`
   - Problem: Direct scene access bypasses SceneManager
   - Error: "Cannot read properties of undefined (reading 'mainMenu')"

3. **Scene Registration**:
   - MainMenuScene is registered as 'menu' in GameEngineInitializer.js
   - Both scenes reference it incorrectly as 'mainMenu'

### Solution Architecture

The fix involves three main components:

1. **Scene Name Standardization**: Ensure all references use the correct registered scene name 'menu'
2. **Navigation Method Consistency**: Use SceneManager.switchScene() for all scene transitions
3. **Error Handling Enhancement**: Add proper error handling for navigation failures

## Components and Interfaces

### SettingsScene Navigation Fix

**Current Implementation:**
```javascript
goBack() {
    // ... other logic
    this.sceneManager.switchScene('mainMenu'); // INCORRECT
}
```

**Fixed Implementation:**
```javascript
goBack() {
    // ... other logic
    this.gameEngine.sceneManager.switchScene('menu'); // CORRECT
}
```

### HelpScene Navigation Fix

**Current Implementation:**
```javascript
setupEventCallbacks() {
    this.helpEventManager.setCallback('onGoBack', () => {
        this.gameEngine.scenes.mainMenu.enter(); // INCORRECT
    });
}
```

**Fixed Implementation:**
```javascript
setupEventCallbacks() {
    this.helpEventManager.setCallback('onGoBack', () => {
        this.gameEngine.sceneManager.switchScene('menu'); // CORRECT
    });
}
```

### Scene Manager Interface

The SceneManager provides the following interface for scene navigation:

```javascript
class SceneManager {
    switchScene(name) {
        // Handles proper scene transition with cleanup
        // Returns boolean indicating success/failure
    }
    
    getCurrentScene() {
        // Returns current active scene
    }
}
```

## Data Models

### Scene Registration Model

```javascript
// In GameEngineInitializer.js
sceneManager.addScene('menu', mainMenuScene);        // Main menu
sceneManager.addScene('stageSelect', stageSelectScene); // Stage selection
sceneManager.addScene('game', gameScene);            // Game play
sceneManager.addScene('settings', settingsScene);   // Settings (if registered)
sceneManager.addScene('help', helpScene);           // Help (if registered)
```

### Navigation State Model

```javascript
{
    currentScene: 'help' | 'settings' | 'menu' | 'game' | 'stageSelect',
    previousScene: string | null,
    navigationInProgress: boolean
}
```

## Error Handling

### Navigation Error Recovery

1. **Scene Not Found Handling**:
   ```javascript
   goBack() {
       const success = this.gameEngine.sceneManager.switchScene('menu');
       if (!success) {
           console.error('Failed to navigate to main menu, attempting fallback');
           // Fallback logic or user notification
       }
   }
   ```

2. **SceneManager Availability Check**:
   ```javascript
   goBack() {
       if (!this.gameEngine.sceneManager) {
           console.error('SceneManager not available');
           return;
       }
       this.gameEngine.sceneManager.switchScene('menu');
   }
   ```

3. **Graceful Degradation**:
   - If navigation fails, log error and maintain current scene
   - Provide user feedback about navigation failure
   - Ensure scene remains in usable state

## Testing Strategy

### Unit Tests

1. **SettingsScene Navigation Test**:
   - Mock SceneManager
   - Verify correct scene name is used
   - Test ESC key handling

2. **HelpScene Navigation Test**:
   - Mock SceneManager and callback system
   - Verify proper callback setup
   - Test navigation flow

### Integration Tests

1. **End-to-End Navigation Test**:
   - Navigate from main menu to settings
   - Press ESC and verify return to main menu
   - Navigate from main menu to help
   - Press ESC and verify return to main menu

2. **Error Scenario Tests**:
   - Test behavior when SceneManager is unavailable
   - Test behavior when target scene doesn't exist
   - Verify error handling and fallback behavior

### Browser Testing

1. **Playwright E2E Tests**:
   - Use URL parameters to access main menu directly
   - Navigate to settings and help screens
   - Test ESC key functionality
   - Verify no JavaScript errors in console

## Implementation Approach

### Phase 1: Core Navigation Fixes
1. Fix SettingsScene.goBack() method
2. Fix HelpScene callback setup
3. Add basic error handling

### Phase 2: Enhanced Error Handling
1. Add comprehensive error checking
2. Implement fallback navigation
3. Add user feedback for navigation failures

### Phase 3: Testing and Validation
1. Create unit tests for navigation methods
2. Create integration tests for scene transitions
3. Create Playwright tests for user workflows

## Compatibility Considerations

- **Backward Compatibility**: Changes maintain existing API contracts
- **Scene Registration**: No changes to scene registration process
- **Event Handling**: Maintains existing event handling patterns
- **Performance**: Minimal performance impact from error checking

## Security Considerations

- **Input Validation**: ESC key handling remains secure
- **Scene Access**: Proper encapsulation through SceneManager
- **Error Information**: Error messages don't expose sensitive data