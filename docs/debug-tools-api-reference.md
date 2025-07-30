# Enhanced Debug Tools - API Reference

## Table of Contents

1. [EnhancedDebugInterface](#enhanceddebuginterface)
2. [PanelManager](#panelmanager)
3. [KeyboardShortcutManager](#keyboardshortcutmanager)
4. [ResponsiveDebugLayout](#responsivedebughyout)
5. [ThemeManager](#thememanager)
6. [AccessibilityManager](#accessibilitymanager)
7. [DebugPerformanceMonitor](#debugperformancemonitor)
8. [LazyLoadManager](#lazyloadmanager)
9. [IntegrationTestSuite](#integrationtestsuite)
10. [RequirementsValidationSuite](#requirementsvalidationsuite)
11. [Debug Panels](#debug-panels)
12. [Data Types](#data-types)

## EnhancedDebugInterface

Main debug interface class that extends EffectDebugInterface.

### Constructor

```javascript
new EnhancedDebugInterface(gameEngine)
```

**Parameters:**
- `gameEngine` (GameEngine): The main game engine instance

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `gameEngine` | GameEngine | Reference to the main game engine |
| `panelManager` | PanelManager | Panel management system |
| `panels` | Map<string, Panel> | Collection of registered panels |
| `activePanel` | string | Currently active panel name |
| `keyboardShortcutManager` | KeyboardShortcutManager | Keyboard shortcut system |
| `responsiveLayout` | ResponsiveDebugLayout | Responsive layout manager |
| `themeManager` | ThemeManager | Theme management system |
| `accessibilityManager` | AccessibilityManager | Accessibility features |
| `performanceMonitor` | DebugPerformanceMonitor | Performance monitoring |
| `lazyLoadManager` | LazyLoadManager | Lazy loading system |
| `integrationTestSuite` | IntegrationTestSuite | Integration testing |
| `requirementsValidationSuite` | RequirementsValidationSuite | Requirements validation |
| `settings` | object | Debug interface settings |
| `sessionId` | string | Unique session identifier |

### Methods

#### Core Methods

##### `show()`
Shows the debug interface.

```javascript
debugInterface.show();
```

##### `hide()`
Hides the debug interface.

```javascript
debugInterface.hide();
```

##### `toggle()`
Toggles the debug interface visibility.

```javascript
debugInterface.toggle();
```

##### `switchPanel(panelName)`
Switches to the specified panel.

```javascript
debugInterface.switchPanel('performance');
```

**Parameters:**
- `panelName` (string): Name of the panel to switch to

#### Settings Management

##### `loadSettings()`
Loads debug interface settings from localStorage.

```javascript
debugInterface.loadSettings();
```

##### `saveSettings()`
Saves current settings to localStorage.

```javascript
debugInterface.saveSettings();
```

##### `createSettingsModal()`
Opens the settings configuration modal.

```javascript
debugInterface.createSettingsModal();
```

##### `closeSettingsModal()`
Closes the settings modal.

```javascript
debugInterface.closeSettingsModal();
```

#### Testing Methods

##### `runIntegrationTests()`
Runs all integration tests.

```javascript
const results = await debugInterface.runIntegrationTests();
```

**Returns:** `Promise<TestResults>` - Integration test results

##### `runCategoryIntegrationTests(category)`
Runs integration tests for a specific category.

```javascript
const results = await debugInterface.runCategoryIntegrationTests('gameSystemIntegration');
```

**Parameters:**
- `category` (string): Test category name

**Returns:** `Promise<TestResults>` - Category test results

##### `runRequirementsValidation()`
Runs requirements validation tests.

```javascript
const results = await debugInterface.runRequirementsValidation();
```

**Returns:** `Promise<ValidationResults>` - Validation results

#### Export Methods

##### `exportIntegrationTestResults()`
Exports integration test results to file.

```javascript
const results = debugInterface.exportIntegrationTestResults();
```

**Returns:** `TestResults` - Exported test results

##### `exportRequirementsValidationResults()`
Exports requirements validation results to file.

```javascript
const results = debugInterface.exportRequirementsValidationResults();
```

**Returns:** `ValidationResults` - Exported validation results

#### Utility Methods

##### `generateSessionId()`
Generates a unique session identifier.

```javascript
const sessionId = debugInterface.generateSessionId();
```

**Returns:** `string` - Unique session ID

##### `getDebugInfo()`
Returns comprehensive debug information.

```javascript
const info = debugInterface.getDebugInfo();
```

**Returns:** `object` - Debug information object

## PanelManager

Manages debug panel registration, creation, and lifecycle.

### Constructor

```javascript
new PanelManager(debugInterface)
```

**Parameters:**
- `debugInterface` (EnhancedDebugInterface): Parent debug interface

### Methods

##### `registerPanel(name, panelClass)`
Registers a new panel class.

```javascript
panelManager.registerPanel('myPanel', MyPanelClass);
```

**Parameters:**
- `name` (string): Panel name
- `panelClass` (class): Panel class constructor

##### `createPanel(name)`
Creates and returns a panel instance.

```javascript
const panel = panelManager.createPanel('overview');
```

**Parameters:**
- `name` (string): Panel name

**Returns:** `Panel` - Panel instance

##### `switchToPanel(name)`
Switches to the specified panel.

```javascript
panelManager.switchToPanel('performance');
```

**Parameters:**
- `name` (string): Panel name

##### `hideAllPanels()`
Hides all panels.

```javascript
panelManager.hideAllPanels();
```

##### `getPanelInstance(name)`
Returns an existing panel instance.

```javascript
const panel = panelManager.getPanelInstance('console');
```

**Parameters:**
- `name` (string): Panel name

**Returns:** `Panel|null` - Panel instance or null

## KeyboardShortcutManager

Manages keyboard shortcuts for debug interface.

### Constructor

```javascript
new KeyboardShortcutManager(debugInterface)
```

### Methods

##### `registerShortcut(key, handler, context)`
Registers a new keyboard shortcut.

```javascript
keyboardManager.registerShortcut('ctrl+shift+p', () => {
    debugInterface.switchPanel('performance');
}, 'debug');
```

**Parameters:**
- `key` (string): Key combination (e.g., 'ctrl+shift+p')
- `handler` (function): Shortcut handler function
- `context` (string, optional): Context for the shortcut

##### `unregisterShortcut(key, context)`
Unregisters a keyboard shortcut.

```javascript
keyboardManager.unregisterShortcut('ctrl+shift+p', 'debug');
```

**Parameters:**
- `key` (string): Key combination
- `context` (string, optional): Shortcut context

##### `enableShortcuts()`
Enables keyboard shortcuts.

```javascript
keyboardManager.enableShortcuts();
```

##### `disableShortcuts()`
Disables keyboard shortcuts.

```javascript
keyboardManager.disableShortcuts();
```

##### `getRegisteredShortcuts()`
Returns all registered shortcuts.

```javascript
const shortcuts = keyboardManager.getRegisteredShortcuts();
```

**Returns:** `Array<Shortcut>` - Array of shortcut objects

## ResponsiveDebugLayout

Manages responsive layout behavior for debug interface.

### Constructor

```javascript
new ResponsiveDebugLayout(debugInterface)
```

### Methods

##### `handleResize()`
Handles window resize events.

```javascript
responsiveLayout.handleResize();
```

##### `updateLayout()`
Updates the layout based on current screen size.

```javascript
responsiveLayout.updateLayout();
```

##### `setBreakpoint(name, width)`
Sets a responsive breakpoint.

```javascript
responsiveLayout.setBreakpoint('mobile', 768);
```

**Parameters:**
- `name` (string): Breakpoint name
- `width` (number): Breakpoint width in pixels

## ThemeManager

Manages debug interface themes and styling.

### Constructor

```javascript
new ThemeManager(debugInterface)
```

### Methods

##### `setTheme(themeName)`
Sets the active theme.

```javascript
themeManager.setTheme('dark');
```

**Parameters:**
- `themeName` (string): Theme name ('dark', 'light', 'high-contrast')

**Returns:** `boolean` - Success status

##### `getAvailableThemes()`
Returns available themes.

```javascript
const themes = themeManager.getAvailableThemes();
```

**Returns:** `Array<string>` - Array of theme names

##### `getCurrentTheme()`
Returns the current theme name.

```javascript
const currentTheme = themeManager.getCurrentTheme();
```

**Returns:** `string` - Current theme name

## AccessibilityManager

Manages accessibility features for debug interface.

### Constructor

```javascript
new AccessibilityManager(debugInterface)
```

### Methods

##### `setKeyboardNavigationEnabled(enabled)`
Enables or disables keyboard navigation.

```javascript
accessibilityManager.setKeyboardNavigationEnabled(true);
```

**Parameters:**
- `enabled` (boolean): Enable keyboard navigation

##### `setHighContrastMode(enabled)`
Enables or disables high contrast mode.

```javascript
accessibilityManager.setHighContrastMode(true);
```

**Parameters:**
- `enabled` (boolean): Enable high contrast mode

##### `setScreenReaderSupport(enabled)`
Enables or disables screen reader support.

```javascript
accessibilityManager.setScreenReaderSupport(true);
```

**Parameters:**
- `enabled` (boolean): Enable screen reader support

## DebugPerformanceMonitor

Monitors debug interface performance and system metrics.

### Constructor

```javascript
new DebugPerformanceMonitor(debugInterface)
```

### Methods

##### `startMonitoring()`
Starts performance monitoring.

```javascript
performanceMonitor.startMonitoring();
```

##### `stopMonitoring()`
Stops performance monitoring.

```javascript
performanceMonitor.stopMonitoring();
```

##### `getPerformanceStats()`
Returns current performance statistics.

```javascript
const stats = performanceMonitor.getPerformanceStats();
```

**Returns:** `PerformanceStats` - Performance statistics object

##### `getPerformanceHistory()`
Returns historical performance data.

```javascript
const history = performanceMonitor.getPerformanceHistory();
```

**Returns:** `Array<PerformanceSnapshot>` - Performance history array

##### `setFPSThreshold(threshold)`
Sets FPS warning threshold.

```javascript
performanceMonitor.setFPSThreshold(30);
```

**Parameters:**
- `threshold` (number): FPS threshold value

##### `setMemoryThreshold(threshold)`
Sets memory usage warning threshold.

```javascript
performanceMonitor.setMemoryThreshold(100);
```

**Parameters:**
- `threshold` (number): Memory threshold in MB

## LazyLoadManager

Manages lazy loading of debug components for performance optimization.

### Constructor

```javascript
new LazyLoadManager(debugInterface)
```

### Methods

##### `loadComponent(componentName)`
Loads a component on demand.

```javascript
const component = await lazyLoadManager.loadComponent('performanceChart');
```

**Parameters:**
- `componentName` (string): Component name

**Returns:** `Promise<Component>` - Loaded component

##### `unloadComponent(componentName)`
Unloads a component to free memory.

```javascript
lazyLoadManager.unloadComponent('performanceChart');
```

**Parameters:**
- `componentName` (string): Component name

##### `optimizeMemoryUsage()`
Optimizes memory usage by unloading unused components.

```javascript
lazyLoadManager.optimizeMemoryUsage();
```

## IntegrationTestSuite

Provides comprehensive integration testing functionality.

### Constructor

```javascript
new IntegrationTestSuite(gameEngine)
```

### Methods

##### `runAllTests()`
Runs all integration tests.

```javascript
const results = await integrationTestSuite.runAllTests();
```

**Returns:** `Promise<TestResults>` - Complete test results

##### `runCategoryTests(category)`
Runs tests for a specific category.

```javascript
const results = await integrationTestSuite.runCategoryTests('gameSystemIntegration');
```

**Parameters:**
- `category` (string): Test category name

**Returns:** `Promise<TestResults>` - Category test results

##### `exportResults()`
Exports test results to file.

```javascript
const results = integrationTestSuite.exportResults();
```

**Returns:** `TestResults` - Exported results

## RequirementsValidationSuite

Validates that all requirements are properly implemented.

### Constructor

```javascript
new RequirementsValidationSuite(gameEngine)
```

### Methods

##### `runAllValidations()`
Runs all requirement validations.

```javascript
const results = await validationSuite.runAllValidations();
```

**Returns:** `Promise<ValidationResults>` - Validation results

##### `exportValidationResults()`
Exports validation results to file.

```javascript
const results = validationSuite.exportValidationResults();
```

**Returns:** `ValidationResults` - Exported results

## Debug Panels

### OverviewPanel

Displays general game state information.

#### Methods

##### `updateDisplay()`
Updates the overview display.

```javascript
overviewPanel.updateDisplay();
```

### PerformancePanel

Shows real-time performance metrics and charts.

#### Methods

##### `updateCharts()`
Updates performance charts.

```javascript
performancePanel.updateCharts();
```

##### `setUpdateInterval(interval)`
Sets chart update interval.

```javascript
performancePanel.setUpdateInterval(200);
```

### ConsolePanel

Interactive command-line interface.

#### Methods

##### `executeCommand(command)`
Executes a console command.

```javascript
const result = consolePanel.executeCommand('game.pause()');
```

**Parameters:**
- `command` (string): Command to execute

**Returns:** `string` - Command result

##### `registerCommand(name, handler)`
Registers a new command.

```javascript
consolePanel.registerCommand('custom.test', () => 'Test result');
```

### ErrorPanel

Displays error collection and analysis.

#### Methods

##### `refreshErrorList()`
Refreshes the error display.

```javascript
errorPanel.refreshErrorList();
```

##### `clearErrors()`
Clears all displayed errors.

```javascript
errorPanel.clearErrors();
```

### TestPanel

Test execution and benchmarking interface.

#### Methods

##### `runTests(type)`
Runs tests of specified type.

```javascript
testPanel.runTests('integration');
```

**Parameters:**
- `type` (string): Test type

##### `displayResults(results)`
Displays test results.

```javascript
testPanel.displayResults(testResults);
```

## Data Types

### TestResults

```typescript
interface TestResults {
    summary: {
        total: number;
        passed: number;
        failed: number;
        successRate: number;
        duration: number;
    };
    categoryStats: {
        [category: string]: {
            total: number;
            passed: number;
            failed: number;
        };
    };
    results: Array<TestResult>;
    timestamp: string;
}
```

### TestResult

```typescript
interface TestResult {
    category: string;
    name: string;
    status: 'passed' | 'failed';
    message: string;
    duration: number;
    timestamp: string;
    error?: Error;
}
```

### ValidationResults

```typescript
interface ValidationResults {
    summary: {
        total: number;
        passed: number;
        failed: number;
        successRate: number;
        duration: number;
    };
    categoryStats: {
        [category: string]: {
            total: number;
            passed: number;
            failed: number;
        };
    };
    results: Array<ValidationResult>;
    timestamp: string;
}
```

### ValidationResult

```typescript
interface ValidationResult {
    category: string;
    id: string;
    name: string;
    description: string;
    status: 'passed' | 'failed';
    message: string;
    duration: number;
    timestamp: string;
    error?: Error;
}
```

### PerformanceStats

```typescript
interface PerformanceStats {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    updateTime: number;
    totalTime: number;
    timestamp: number;
}
```

### PerformanceSnapshot

```typescript
interface PerformanceSnapshot {
    timestamp: number;
    fps: number;
    memory: {
        used: number;
        total: number;
        limit: number;
    };
    timing: {
        render: number;
        update: number;
        total: number;
    };
}
```

### Shortcut

```typescript
interface Shortcut {
    key: string;
    handler: function;
    context?: string;
    description?: string;
    enabled: boolean;
}
```

## Events

The debug interface emits various events that can be listened to:

### Panel Events

```javascript
// Panel switched
debugInterface.addEventListener('panelSwitched', (event) => {
    console.log('Switched to panel:', event.panelName);
});

// Panel created
debugInterface.addEventListener('panelCreated', (event) => {
    console.log('Panel created:', event.panelName);
});
```

### Performance Events

```javascript
// Threshold exceeded
debugInterface.addEventListener('thresholdExceeded', (event) => {
    console.warn('Performance threshold exceeded:', event.metric, event.value);
});

// Performance warning
debugInterface.addEventListener('performanceWarning', (event) => {
    console.warn('Performance warning:', event.message);
});
```

### Test Events

```javascript
// Test completed
debugInterface.addEventListener('testCompleted', (event) => {
    console.log('Test completed:', event.results);
});

// Validation completed
debugInterface.addEventListener('validationCompleted', (event) => {
    console.log('Validation completed:', event.results);
});
```

## Error Handling

All API methods include proper error handling. Errors are thrown as standard JavaScript Error objects with descriptive messages:

```javascript
try {
    await debugInterface.runIntegrationTests();
} catch (error) {
    console.error('Integration tests failed:', error.message);
    // Handle error appropriately
}
```

## Backward Compatibility

The Enhanced Debug Interface maintains backward compatibility with the original EffectDebugInterface:

```javascript
// Original methods still work
debugInterface.show();
debugInterface.hide();

// New methods are additive
debugInterface.runIntegrationTests();
debugInterface.switchPanel('performance');
```