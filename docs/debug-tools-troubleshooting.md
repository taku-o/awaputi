# Enhanced Debug Tools - Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Debug Interface Problems](#debug-interface-problems)
3. [Performance Issues](#performance-issues)
4. [Panel Loading Problems](#panel-loading-problems)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Testing and Validation](#testing-and-validation)
7. [Memory Issues](#memory-issues)
8. [Browser Compatibility](#browser-compatibility)
9. [Console Errors](#console-errors)
10. [Recovery Procedures](#recovery-procedures)

## Common Issues

### Debug Interface Not Showing

**Problem:** Debug interface doesn't appear when activated.

**Symptoms:**
- Pressing Ctrl+Shift+D does nothing
- `debugInterface.show()` has no effect
- No debug panel visible on screen

**Solutions:**

1. **Check Initialization**
```javascript
// Verify debug interface is initialized
if (!gameEngine.enhancedDebugInterface) {
    console.error('Enhanced debug interface not initialized');
    // Force initialization
    gameEngine.initializeDebugSystems();
}
```

2. **Check DOM Element**
```javascript
// Check if debug panel exists in DOM
const debugPanel = document.getElementById('enhanced-debug-panel');
if (!debugPanel) {
    console.error('Debug panel DOM element not found');
    // Recreate the interface
    gameEngine.enhancedDebugInterface.setupEnhancedUI();
}
```

3. **Check CSS Display**
```javascript
// Verify panel is not hidden by CSS
const panel = debugInterface.debugPanel;
if (panel && panel.style.display === 'none') {
    panel.style.display = 'block';
}
```

4. **Check Z-Index Issues**
```javascript
// Ensure debug panel has high z-index
debugInterface.debugPanel.style.zIndex = '10000';
```

### Settings Not Persisting

**Problem:** Debug interface settings reset on page reload.

**Solutions:**

1. **Check localStorage Access**
```javascript
// Test localStorage functionality
try {
    localStorage.setItem('test', 'value');
    localStorage.removeItem('test');
    console.log('localStorage is working');
} catch (error) {
    console.error('localStorage not available:', error);
}
```

2. **Force Settings Save**
```javascript
// Manually save settings
debugInterface.saveSettings();

// Verify settings are saved
const saved = localStorage.getItem('debug-interface-settings');
console.log('Saved settings:', saved);
```

### Components Not Loading

**Problem:** Debug components fail to load or initialize.

**Solutions:**

1. **Check Network Issues**
```javascript
// Verify all script files are loaded
console.log('Debug components loaded:', {
    panelManager: !!debugInterface.panelManager,
    keyboardManager: !!debugInterface.keyboardShortcutManager,
    themeManager: !!debugInterface.themeManager,
    performanceMonitor: !!debugInterface.performanceMonitor
});
```

2. **Reinitialize Components**
```javascript
// Reinitialize failed components
debugInterface.initializeEnhancedFeatures();
```

## Debug Interface Problems

### Interface Appears But Is Non-Functional

**Problem:** Debug interface shows but panels don't respond or switch.

**Diagnostic Steps:**

1. **Check Event Listeners**
```javascript
// Verify panel tabs have event listeners
const tabs = document.querySelectorAll('.debug-tab');
tabs.forEach(tab => {
    console.log('Tab listeners:', tab.getEventListeners?.() || 'Cannot check');
});
```

2. **Check Panel Manager**
```javascript
// Verify panel manager is working
const panelManager = debugInterface.panelManager;
console.log('Registered panels:', panelManager.getRegisteredPanels?.() || 'Method not available');
```

3. **Manual Panel Switch Test**
```javascript
// Test panel switching manually
try {
    debugInterface.switchPanel('overview');
    console.log('Panel switch successful');
} catch (error) {
    console.error('Panel switch failed:', error);
}
```

### Interface Position Problems

**Problem:** Debug interface appears in wrong position or is not draggable.

**Solutions:**

1. **Reset Position**
```javascript
// Reset to default position
debugInterface.position = { x: 10, y: 10 };
debugInterface.debugPanel.style.top = '10px';
debugInterface.debugPanel.style.right = '10px';
debugInterface.debugPanel.style.left = 'auto';
```

2. **Fix Dragging**
```javascript
// Re-enable dragging
const header = debugInterface.debugPanel.querySelector('.debug-header');
if (header) {
    debugInterface.makeDraggable(header);
}
```

## Performance Issues

### High Performance Impact

**Problem:** Debug tools are causing significant performance impact (>5%).

**Diagnostic:**

```javascript
// Measure debug interface performance impact
const impact = debugInterface.performanceMonitor.getDebugImpact();
console.log('Debug performance impact:', impact.percentage, '%');

if (impact.percentage > 5) {
    console.warn('Debug tools performance impact too high');
}
```

**Solutions:**

1. **Reduce Update Frequency**
```javascript
// Reduce performance monitor update frequency
debugInterface.performanceMonitor.setUpdateInterval(500); // Increase from 100ms to 500ms
```

2. **Disable Heavy Features**
```javascript
// Disable performance-intensive features
debugInterface.settings.autoUpdate = false;
debugInterface.performanceMonitor.reduceUpdateFrequency();
```

3. **Optimize Memory Usage**
```javascript
// Trigger memory optimization
debugInterface.lazyLoadManager.optimizeMemoryUsage();
```

### Slow Panel Switching

**Problem:** Panel switching is slow or causes frame drops.

**Solutions:**

1. **Enable Lazy Loading**
```javascript
// Ensure lazy loading is enabled
debugInterface.lazyLoadManager.enableLazyLoading();
```

2. **Preload Critical Panels**
```javascript
// Preload frequently used panels
debugInterface.lazyLoadManager.preloadComponent('overview');
debugInterface.lazyLoadManager.preloadComponent('performance');
```

## Panel Loading Problems

### Panel Shows Blank Content

**Problem:** Panel loads but displays no content.

**Diagnostic:**

```javascript
// Check panel initialization
const panel = debugInterface.panels.get('performance');
console.log('Panel state:', {
    created: !!panel,
    element: !!panel?.element,
    visible: panel?.element?.style.display !== 'none'
});
```

**Solutions:**

1. **Force Panel Recreation**
```javascript
// Recreate the problematic panel
debugInterface.panelManager.recreatePanel('performance');
```

2. **Check Panel Data**
```javascript
// Verify panel has data to display
const performancePanel = debugInterface.panels.get('performance');
if (performancePanel && performancePanel.updateDisplay) {
    performancePanel.updateDisplay();
}
```

### Console Panel Not Responding

**Problem:** Console panel doesn't execute commands.

**Solutions:**

1. **Reinitialize Console**
```javascript
// Reinitialize console panel
const consolePanel = debugInterface.panels.get('console');
if (consolePanel && consolePanel.initialize) {
    consolePanel.initialize();
}
```

2. **Check Command Registry**
```javascript
// Verify commands are registered
const commands = consolePanel.getRegisteredCommands?.();
console.log('Available commands:', commands);
```

## Keyboard Shortcuts

### Shortcuts Not Working

**Problem:** Keyboard shortcuts don't trigger debug functions.

**Diagnostic:**

```javascript
// Check shortcut registration
const shortcuts = debugInterface.keyboardShortcutManager.getRegisteredShortcuts();
console.log('Registered shortcuts:', shortcuts);

// Check if shortcuts are enabled
console.log('Shortcuts enabled:', debugInterface.keyboardShortcutManager.enabled);
```

**Solutions:**

1. **Re-enable Shortcuts**
```javascript
debugInterface.keyboardShortcutManager.enableShortcuts();
```

2. **Check for Conflicts**
```javascript
// Check for shortcut conflicts
const conflicts = debugInterface.keyboardShortcutManager.checkForConflicts?.();
if (conflicts && conflicts.length > 0) {
    console.warn('Shortcut conflicts detected:', conflicts);
}
```

3. **Re-register Shortcuts**
```javascript
// Re-register default shortcuts
debugInterface.setupDefaultShortcuts();
```

### Shortcuts Conflict with Game

**Problem:** Debug shortcuts interfere with game controls.

**Solutions:**

1. **Change Shortcut Keys**
```javascript
// Unregister conflicting shortcut
debugInterface.keyboardShortcutManager.unregisterShortcut('ctrl+shift+d');

// Register with different key combination
debugInterface.keyboardShortcutManager.registerShortcut('alt+f12', () => {
    debugInterface.toggle();
});
```

2. **Context-Sensitive Shortcuts**
```javascript
// Register shortcuts only in debug context
debugInterface.keyboardShortcutManager.registerShortcut('d', () => {
    debugInterface.switchPanel('performance');
}, 'debug-only');
```

## Testing and Validation

### Integration Tests Failing

**Problem:** Integration tests consistently fail.

**Diagnostic:**

```javascript
// Check test suite initialization
const testSuite = debugInterface.integrationTestSuite;
console.log('Test suite initialized:', !!testSuite);

// Check individual test categories
if (testSuite) {
    console.log('Test categories:', testSuite.testCategories);
}
```

**Solutions:**

1. **Run Individual Test Categories**
```javascript
// Test categories individually to identify issues
const categories = ['gameSystemIntegration', 'existingSystemCompatibility', 'crossBrowserCompatibility'];

for (const category of categories) {
    try {
        const results = await debugInterface.runCategoryIntegrationTests(category);
        console.log(`${category} results:`, results);
    } catch (error) {
        console.error(`${category} failed:`, error);
    }
}
```

2. **Check Test Environment**
```javascript
// Verify test environment is suitable
const environment = {
    gameEngine: !!gameEngine,
    debugInterface: !!gameEngine.enhancedDebugInterface,
    performanceAPI: !!window.performance,
    localStorage: !!window.localStorage
};
console.log('Test environment:', environment);
```

### Requirements Validation Errors

**Problem:** Requirements validation reports failures.

**Solutions:**

1. **Check Specific Requirements**
```javascript
// Run validation and examine specific failures
const results = await debugInterface.runRequirementsValidation();
const failures = results.results.filter(r => r.status === 'failed');
console.log('Failed requirements:', failures);
```

2. **Reinitialize Components**
```javascript
// Reinitialize components for failed requirements
debugInterface.initializeEnhancedFeatures();
```

## Memory Issues

### Memory Leaks

**Problem:** Debug interface causes memory usage to continuously increase.

**Diagnostic:**

```javascript
// Monitor memory usage
if (performance.memory) {
    const memoryUsage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
    };
    console.log('Memory usage:', memoryUsage);
}
```

**Solutions:**

1. **Force Garbage Collection**
```javascript
// Force garbage collection (if available)
if (window.gc) {
    window.gc();
}
```

2. **Optimize Memory Usage**
```javascript
// Trigger memory optimization
debugInterface.lazyLoadManager.optimizeMemoryUsage();

// Clear performance history
debugInterface.performanceMonitor.clearHistory();
```

3. **Check Event Listeners**
```javascript
// Remove unnecessary event listeners
debugInterface.cleanupEventListeners?.();
```

### Out of Memory Errors

**Problem:** Browser crashes or shows out of memory errors.

**Solutions:**

1. **Reduce Data Retention**
```javascript
// Reduce data retention periods
debugInterface.settings.maxHistorySize = 100; // Reduce from default 1000
debugInterface.performanceMonitor.setMaxHistorySize(50);
```

2. **Disable Heavy Features**
```javascript
// Disable memory-intensive features
debugInterface.settings.enablePerformanceCharts = false;
debugInterface.settings.enableDetailedLogging = false;
```

## Browser Compatibility

### Features Not Working in Specific Browsers

**Problem:** Some debug features don't work in certain browsers.

**Diagnostic:**

```javascript
// Check browser feature support
const browserSupport = {
    performance: !!window.performance,
    localStorage: !!window.localStorage,
    requestAnimationFrame: !!window.requestAnimationFrame,
    ResizeObserver: !!window.ResizeObserver,
    IntersectionObserver: !!window.IntersectionObserver,
    cssSupports: !!window.CSS && !!window.CSS.supports
};
console.log('Browser support:', browserSupport);
```

**Solutions:**

1. **Enable Polyfills**
```javascript
// Add polyfills for missing features
if (!window.ResizeObserver) {
    // Load ResizeObserver polyfill
    debugInterface.loadPolyfill('resize-observer');
}
```

2. **Graceful Degradation**
```javascript
// Disable features that aren't supported
if (!window.performance) {
    debugInterface.settings.enablePerformanceMonitoring = false;
}
```

### Safari Specific Issues

**Problem:** Debug interface behaves differently in Safari.

**Solutions:**

1. **Safari Compatibility Mode**
```javascript
// Enable Safari compatibility
if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
    debugInterface.settings.safariCompatibility = true;
    debugInterface.settings.reducedAnimations = true;
}
```

## Console Errors

### Script Loading Errors

**Problem:** Console shows errors about missing debug scripts.

**Solutions:**

1. **Check File Paths**
```javascript
// Verify all debug script files are accessible
const scriptPaths = [
    'src/debug/EnhancedDebugInterface.js',
    'src/debug/PanelManager.js',
    'src/debug/KeyboardShortcutManager.js'
    // Add other script paths
];

scriptPaths.forEach(path => {
    fetch(path)
        .then(response => console.log(`${path}: ${response.status}`))
        .catch(error => console.error(`${path}: ${error.message}`));
});
```

2. **Reload Debug System**
```javascript
// Reload debug system components
try {
    gameEngine.reloadDebugSystem?.();
} catch (error) {
    console.error('Failed to reload debug system:', error);
}
```

### JavaScript Errors in Debug Code

**Problem:** Debug interface causes JavaScript errors.

**Solutions:**

1. **Enable Debug Logging**
```javascript
// Enable detailed debug logging
debugInterface.settings.debugLogging = true;
debugInterface.setLogLevel('debug');
```

2. **Error Isolation**
```javascript
// Wrap debug operations in try-catch
try {
    debugInterface.show();
} catch (error) {
    console.error('Debug interface error:', error);
    // Continue with basic debugging
    gameEngine.basicDebugMode = true;
}
```

## Recovery Procedures

### Complete Reset

**Problem:** Debug interface is completely broken and needs reset.

**Procedure:**

1. **Clear Stored Settings**
```javascript
// Clear all debug interface settings
localStorage.removeItem('debug-interface-settings');
localStorage.removeItem('debug-interface-session');
```

2. **Reinitialize Everything**
```javascript
// Complete reinitialization
if (gameEngine.enhancedDebugInterface) {
    gameEngine.enhancedDebugInterface.destroy?.();
    gameEngine.enhancedDebugInterface = null;
}
gameEngine.initializeEnhancedDebugInterface();
```

3. **Verify Recovery**
```javascript
// Verify everything is working
const debugInterface = gameEngine.enhancedDebugInterface;
console.log('Recovery status:', {
    initialized: !!debugInterface,
    panels: debugInterface ? debugInterface.panels.size : 0,
    shortcuts: debugInterface ? !!debugInterface.keyboardShortcutManager : false
});
```

### Fallback Mode

**Problem:** Enhanced debug interface won't work, need basic debugging.

**Procedure:**

1. **Enable Basic Debug Mode**
```javascript
// Fall back to basic debugging
gameEngine.basicDebugMode = true;
gameEngine.showBasicDebugInfo = true;
```

2. **Manual Debug Panel**
```javascript
// Create minimal debug panel
const basicPanel = document.createElement('div');
basicPanel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: black;
    color: white;
    padding: 10px;
    z-index: 9999;
    font-family: monospace;
`;
basicPanel.innerHTML = `
    <h3>Basic Debug Info</h3>
    <div id="basic-fps">FPS: --</div>
    <div id="basic-memory">Memory: --</div>
    <button onclick="this.parentNode.style.display='none'">Close</button>
`;
document.body.appendChild(basicPanel);
```

### Emergency Disable

**Problem:** Debug interface is causing critical issues and must be disabled immediately.

**Procedure:**

```javascript
// Emergency disable
window.DISABLE_DEBUG_INTERFACE = true;
if (gameEngine.enhancedDebugInterface) {
    gameEngine.enhancedDebugInterface.hide();
    gameEngine.enhancedDebugInterface.enabled = false;
}

// Remove from DOM
const debugPanels = document.querySelectorAll('[id*="debug"]');
debugPanels.forEach(panel => panel.remove());

// Clear intervals and event listeners
if (gameEngine.debugUpdateInterval) {
    clearInterval(gameEngine.debugUpdateInterval);
}
```

## Getting Help

If these troubleshooting steps don't resolve your issue:

1. **Check Browser Console**: Look for error messages and warnings
2. **Export Debug State**: Use `debugInterface.getDebugInfo()` to export current state
3. **Create Minimal Reproduction**: Isolate the issue in a minimal test case
4. **Document the Issue**: Include browser version, error messages, and steps to reproduce
5. **Contact Development Team**: Report the issue with all relevant information

## Preventive Measures

To avoid common issues:

1. **Regular Updates**: Keep debug tools updated with the latest version
2. **Browser Testing**: Test in multiple browsers during development
3. **Performance Monitoring**: Regularly check debug tools performance impact
4. **Memory Monitoring**: Monitor memory usage during extended debug sessions
5. **Settings Backup**: Export debug settings before making major changes

```javascript
// Export settings for backup
const settings = JSON.stringify(debugInterface.settings);
localStorage.setItem('debug-settings-backup', settings);

// Import settings from backup
const backup = localStorage.getItem('debug-settings-backup');
if (backup) {
    debugInterface.settings = JSON.parse(backup);
    debugInterface.saveSettings();
}
```