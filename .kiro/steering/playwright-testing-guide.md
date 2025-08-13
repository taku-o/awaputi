# Playwright Testing Guide for BubblePop Game

## Overview
This document provides comprehensive guidance for automating and testing the BubblePop game using Playwright. This steering guide ensures consistent and reliable test automation practices.

**🎯 January 2025 Update**: Added proper testing methodology for Game Engine Integrated Systems (NavigationContextManager, integrated HelpScene/SettingsScene).

## Prerequisites

### 1. LocalStorage Cleanup
Clear cached data before game operations:

```javascript
// Clear LocalStorage
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});

// Or clear specific keys only
await page.evaluate(() => {
    localStorage.removeItem('bubblePopPlayerData');
    localStorage.removeItem('bubblePopSettings');
});
```

### 2. Development Server
```bash
python3 -m http.server 8001
```

## Recommended Access Method

### Direct Main Menu Access via URL Parameters
Use URL parameters to skip username input and access main menu directly:

```javascript
// Direct access to main menu
await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');

// Clear LocalStorage if needed
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});

// Reload page
await page.reload();

// Click "ゲームを開始する" button
await page.getByRole('button', { name: 'ゲームを開始する' }).click();

// Click "始める" button  
await page.getByRole('button', { name: '始める' }).click();

// Wait for main menu display
await page.waitForTimeout(2000);
```

**Benefits of this approach**:
- ✅ **Simple**: Complete with URL parameters only
- ✅ **Reliable**: Avoids Canvas input issues
- ✅ **Fast**: No unnecessary operations
- ✅ **Stable**: No JavaScript direct manipulation errors

## Complete Operation Flow

### Recommended URL Parameter Method

```javascript
import { chromium } from 'playwright';

async function testBubblePopGame() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Direct access to main menu with URL parameters
        await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');
        
        // Clear LocalStorage if needed
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // Reload page
        await page.reload();
        
        // Click entry page "ゲームを開始する" button
        await page.getByRole('button', { name: 'ゲームを開始する' }).click();
        
        // Click PWA welcome screen "始める" button
        await page.getByRole('button', { name: '始める' }).click();
        
        // Wait for main menu display
        await page.waitForTimeout(2000);
        
        // Take main menu screenshot
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await canvas.screenshot({ path: 'main-menu-final.png' });
        
        console.log('✅ Game operation complete: Reached main menu (URL parameter method)');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
}

testBubblePopGame();
```

## Troubleshooting

### 1. Canvas Input Not Responding → Use Workaround Methods

#### Method A: ESC Key + LocalStorage Force Setting (Most Reliable)
```javascript
// Skip username input with ESC key after game initialization and set LocalStorage directly
await page.goto('http://localhost:8001');
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(2000); // Wait for game initialization

// Skip username input with ESC key + direct LocalStorage setting
await page.evaluate(() => {
    // Set user data directly
    window.localStorage.setItem('bubblePopPlayerData', JSON.stringify({
        username: 'TestUser',
        level: 1,
        experience: 0,
        totalScore: 0
    }));
    
    // Force load player data
    if (window.gameEngine && window.gameEngine.playerData) {
        window.gameEngine.playerData.username = 'TestUser';
        window.gameEngine.playerData.hasValidData = true;
    }
});
await page.keyboard.press('Escape'); // Skip username input
await page.waitForTimeout(1000);
```

#### Method B: Pre-set LocalStorage + Reload
```javascript
// Set LocalStorage before starting game
await page.goto('http://localhost:8001');
await page.evaluate(() => {
    localStorage.setItem('bubblePopPlayerData', JSON.stringify({
        username: 'TestUser',
        level: 1,
        experience: 0,
        totalScore: 0,
        hasValidData: true
    }));
});
await page.reload();
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(3000);
```

### 2. URL Parameters Not Working
```javascript
// Complete page reload
await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');
await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
});
await page.reload();

// Check parameters in console
await page.evaluate(() => {
    console.log('Test username:', localStorage.getItem('testUsername'));
    console.log('Skip flag:', localStorage.getItem('skipUsernameInput'));
});
```

### 3. Scene Transition Issues
```javascript
// Set longer wait time
await page.waitForTimeout(3000);

// Verify main menu with multiple conditions
await page.waitForFunction(() => {
    return window.gameEngine && 
           window.gameEngine.sceneManager && 
           (window.gameEngine.sceneManager.currentScene === 'menu' ||
            window.gameEngine.sceneManager.currentScene === 'MainMenuScene') &&
           window.gameEngine.playerData &&
           window.gameEngine.playerData.username;
}, { timeout: 10000 });
```

## Keyboard Shortcuts

Available after reaching main menu:
- `↑↓`: Menu selection movement
- `Enter`: Confirm
- `ESC`: Cancel/Back
- ⚠️ **Warning**: `S` key transitions to settings screen, avoid during username input
- `H` or `F1`: Help
- `Ctrl+Shift+D`: Toggle debug mode

### Keyboard Shortcuts to Avoid
Avoid these keys during username input screen:
- `S`: Opens settings screen (typing 's' in 'TestUser' triggers settings)
- `H`: Opens help screen
- `F1`: Opens help screen

## 🎯 Game Engine Integrated System Keyboard Shortcut Testing

### ✅ Established Proper Testing Methodology (January 2025)

Proven methodology for testing Game Engine integrated systems (NavigationContextManager, integrated HelpScene/SettingsScene):

#### 1. Correct Initialization Wait Process

**Critical**: Testing without waiting for complete Game Engine initialization will test the integrated system in an incomplete state, leading to incorrect results.

```javascript
async function initializeGameEngineForTesting(page) {
    // Step 1: Click game start button
    await page.getByRole('button', { name: 'ゲームを開始する' }).click();
    
    // Step 2: Proper initialization wait (3 seconds recommended)
    await page.waitForTimeout(3000);
    
    // Step 3: Verify initialization completion (optional)
    const initComplete = await page.evaluate(() => {
        // Verify initialization completion via console logs
        return document.title.includes('BubblePop') && 
               window.gameEngine && 
               window.gameEngine.sceneManager &&
               window.gameEngine.sceneManager.currentScene;
    });
    
    if (!initComplete) {
        throw new Error('Game engine initialization not complete');
    }
    
    console.log('✅ Game engine fully initialized');
}
```

#### 2. Accurate Verification of Integrated System Status

```javascript
async function verifyIntegratedSystemStatus(page) {
    const systemStatus = await page.evaluate(() => {
        const gameEngine = window.gameEngine;
        return {
            hasGameEngine: !!gameEngine,
            hasSceneManager: !!(gameEngine && gameEngine.sceneManager),
            currentScene: gameEngine?.sceneManager?.currentScene?.constructor?.name,
            hasKeyboardShortcutManager: !!(gameEngine && gameEngine.keyboardShortcutManager),
            // NavigationContextManager is integrated into individual scenes
            sceneHasNavigationManager: gameEngine?.sceneManager?.currentScene?.navigationContextManager ? true : false
        };
    });
    
    console.log('Game Engine Status:', systemStatus);
    return systemStatus;
}
```

#### 3. Integrated System Keyboard Shortcut Testing

**✅ Proven working methodology**:

```javascript
async function testIntegratedKeyboardShortcuts(page) {
    // Prerequisite: Game engine fully initialized
    await initializeGameEngineForTesting(page);
    
    // H key test: Help screen access
    console.log('🧪 Testing H key (Help access)...');
    await page.keyboard.press('KeyH');
    await page.waitForTimeout(500);
    
    // Verify scene transition via logs
    const helpSceneActive = await page.evaluate(() => {
        return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'HelpScene';
    });
    
    if (helpSceneActive) {
        console.log('✅ H key: Help screen access successful');
        
        // ESC key test: Back navigation
        console.log('🧪 Testing ESC key (Back navigation)...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const backToMenu = await page.evaluate(() => {
            return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'MainMenuScene';
        });
        
        if (backToMenu) {
            console.log('✅ ESC key: Back navigation successful');
        } else {
            throw new Error('❌ ESC key: Back navigation failed');
        }
    } else {
        throw new Error('❌ H key: Help screen access failed');
    }
    
    // S key test: Settings screen access
    console.log('🧪 Testing S key (Settings access)...');
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(500);
    
    const settingsSceneActive = await page.evaluate(() => {
        return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'SettingsScene';
    });
    
    if (settingsSceneActive) {
        console.log('✅ S key: Settings screen access successful');
        
        // ESC key from settings back navigation
        console.log('🧪 Testing ESC key from Settings...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const backToMenuFromSettings = await page.evaluate(() => {
            return window.gameEngine?.sceneManager?.currentScene?.constructor?.name === 'MainMenuScene';
        });
        
        if (backToMenuFromSettings) {
            console.log('✅ ESC key from Settings: Back navigation successful');
        } else {
            throw new Error('❌ ESC key from Settings: Back navigation failed');
        }
    } else {
        throw new Error('❌ S key: Settings screen access failed');
    }
    
    console.log('🎉 All integrated keyboard shortcuts working correctly!');
}
```

#### 4. Console Log Verification for Operation Confirmation

Log messages to use for integrated system operation verification:

```javascript
// Expected log patterns
const expectedLogs = [
    // Initialization completion
    '[LOG] [DEBUG] 🎉 ゲーム初期化完了',
    '[INFO] NavigationContextManager Navigation context manager initial...',
    '[INFO] AccessibilitySettingsManager Accessibility settings manager...',
    
    // Keyboard shortcut operations
    '[LOG] Switched to scene: help',           // H key success
    '[LOG] Switched to scene: menu',           // ESC key success  
    '[LOG] Switched to scene: settings',       // S key success
    '[INFO] HelpScene Standard help mode activated',
    '[INFO] HelpScene Navigated back to: menu, success: true',
    '[INFO] SettingsScene Navigated back to: menu, success: true'
];

// Log verification function
async function verifyExpectedLogs(page) {
    const consoleLogs = await page.evaluate(() => {
        return window.consoleHistory || []; // Save log history as needed
    });
    
    // Check if expected logs are included
    expectedLogs.forEach(expectedLog => {
        const found = consoleLogs.some(log => log.includes(expectedLog));
        if (found) {
            console.log(`✅ Found expected log: ${expectedLog}`);
        } else {
            console.warn(`⚠️ Missing expected log: ${expectedLog}`);
        }
    });
}
```

#### 5. Complete Integrated System Test Example

```javascript
async function fullIntegratedSystemTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Standard initialization process
        await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload();
        
        // Complete game engine initialization
        await initializeGameEngineForTesting(page);
        
        // Verify integrated system status
        await verifyIntegratedSystemStatus(page);
        
        // Test integrated keyboard shortcuts
        await testIntegratedKeyboardShortcuts(page);
        
        console.log('🎉 Integrated system test completed successfully!');
        
    } catch (error) {
        console.error('❌ Integrated system test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
```

### ⚠️ Common Mistakes and Avoidance Methods

#### Mistake 1: Insufficient Initialization Wait
```javascript
// ❌ Bad example: Test execution before initialization completion
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.keyboard.press('KeyH'); // Testing with incomplete integrated system

// ✅ Good example: Proper initialization wait
await page.getByRole('button', { name: 'ゲームを開始する' }).click();
await page.waitForTimeout(3000); // Wait for integrated system completion
await page.keyboard.press('KeyH'); // Normal operation
```

#### Mistake 2: Superficial Status Verification
```javascript
// ❌ Bad example: Only check GameEngine existence
const hasGameEngine = await page.evaluate(() => !!window.gameEngine);

// ✅ Good example: Detailed integrated system verification  
const systemComplete = await page.evaluate(() => {
    return window.gameEngine?.sceneManager?.currentScene && 
           window.gameEngine.keyboardShortcutManager;
});
```

### 🎯 Benefits of This Testing Methodology

1. **✅ Reliability**: Verify true operation status of integrated systems after complete game engine initialization
2. **✅ Reproducibility**: Achieve consistent results through systematic processes
3. **✅ Debuggability**: Detailed operation status verification possible through log messages  
4. **✅ Maintainability**: Continue verification with same methodology when integrated systems change

### 📅 Update History

- **January 15, 2025**: Established proper Playwright testing methodology for Game Engine integrated systems in response to Issue #163
- Added integration system-specific initialization processes and keyboard shortcut verification methodology alongside traditional Canvas operations

## URL Parameters

### Test Parameters
- `username=ユーザー名`: Auto-set username
- `skipUsernameInput=true`: Skip username input screen

### Debug Parameters  
- `debug=true`: Enable debug mode

### Usage Example
```
http://localhost:8001?username=TestUser&skipUsernameInput=true&debug=true
```

## Best Practices

1. **Async Processing**: Game initialization is async, proper wait times are essential
2. **Canvas Operations**: Different operation methods from regular HTML elements
3. **State Management**: Game state is saved in LocalStorage, clearing before tests is important
4. **Error Handling**: Proper handling for network errors and timeouts
5. **✅ Recommend URL Parameter Method**: Use `?username=TestUser&skipUsernameInput=true` for reliable main menu access
6. **❌ Avoid Direct JavaScript Manipulation**: Canvas keyboard.type() and JavaScript operations are unstable
7. **🎯 Integrated System Testing Critical Requirements** (Added January 2025):
   - **Required**: Execute keyboard shortcut tests after complete Game Engine initialization (3-second wait)
   - **Required**: Perform operation verification using log messages (`[LOG] Switched to scene:`)
   - **Recommended**: Verify integrated system status (NavigationContextManager, integrated HelpScene/SettingsScene)
   - **Warning**: Testing without initialization wait will produce incorrect results due to incomplete integrated system state

## Screenshot Capture

For state verification at each step:
```javascript
// Full page screenshot
await page.screenshot({ path: `step-${stepNumber}.png`, fullPage: true });

// Canvas only (recommended)
const canvas = page.getByRole('img', { name: 'ゲーム画面' });
await canvas.screenshot({ path: `canvas-step-${stepNumber}.png` });
```

## Integration with Kiro

When using this guide with Kiro:
- Always use the URL parameter method for reliable access
- Include proper error handling and timeouts
- Take screenshots for verification
- Clear LocalStorage before tests
- Use the recommended flow for consistent results

This guide ensures reliable and stable automated testing of the BubblePop game using Playwright.