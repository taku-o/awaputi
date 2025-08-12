# Playwright Testing Guide for BubblePop Game

## Overview
This document provides comprehensive guidance for automating and testing the BubblePop game using Playwright. This steering guide ensures consistent and reliable test automation practices.

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