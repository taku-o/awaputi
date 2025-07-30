# Enhanced Debug Tools - Developer Guide

## Overview

The Enhanced Debug Tools system provides a comprehensive debugging environment for the Awaputi bubble pop game. This guide covers all aspects of using and extending the debug tools for development, testing, and maintenance purposes.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Components](#core-components)
3. [Debug Interface](#debug-interface)
4. [Performance Monitoring](#performance-monitoring)
5. [Developer Console](#developer-console)
6. [Error Reporting](#error-reporting)
7. [Test Support Tools](#test-support-tools)
8. [Integration Testing](#integration-testing)
9. [Requirements Validation](#requirements-validation)
10. [API Reference](#api-reference)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

## Getting Started

### Enabling Debug Tools

The Enhanced Debug Interface is automatically initialized when the game engine starts:

```javascript
// Debug tools are available through the GameEngine
const debugInterface = gameEngine.enhancedDebugInterface;

// Show the debug interface
debugInterface.show();

// Access via keyboard shortcut (default: Ctrl+Shift+D)
// Or through the URL parameter: ?debug=true
```

### Quick Access Methods

- **Keyboard Shortcut**: `Ctrl+Shift+D` (customizable)
- **URL Parameter**: Add `?debug=true` to the game URL
- **Console Command**: `window.showDebugInterface()` in browser console
- **Global Reference**: `window.EnhancedDebugInterface` for programmatic access

## Core Components

### Enhanced Debug Interface

The main debugging interface that extends the existing EffectDebugInterface:

```javascript
class EnhancedDebugInterface extends EffectDebugInterface {
    // Core functionality
    show()                    // Display debug interface
    hide()                    // Hide debug interface
    switchPanel(panelName)    // Switch to specific panel
    
    // Advanced features
    runIntegrationTests()     // Execute integration tests
    runRequirementsValidation() // Validate all requirements
    createSettingsModal()     // Open debug settings
}
```

### Panel Management

The system supports multiple debug panels:

- **Overview**: Game state overview and general information
- **Performance**: Real-time performance monitoring and charts
- **Console**: Interactive command-line interface
- **Errors**: Error collection, analysis, and reporting
- **Tests**: Test execution, benchmarking, and validation
- **Effects**: Visual effects debugging (from original system)

### Keyboard Shortcuts

Default shortcuts (customizable through settings):

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle debug interface |
| `Ctrl+Shift+C` | Open console panel |
| `Ctrl+Shift+P` | Open performance panel |
| `Ctrl+Shift+E` | Open errors panel |
| `Ctrl+Shift+T` | Open tests panel |
| `F1` | Show contextual help |

## Debug Interface

### Panel Navigation

Switch between panels programmatically:

```javascript
const debugInterface = gameEngine.enhancedDebugInterface;

// Switch to performance panel
debugInterface.switchPanel('performance');

// Switch to console panel
debugInterface.switchPanel('console');

// Get current active panel
const activePanel = debugInterface.activePanel;
```

### Layout Management

The interface supports multiple layout modes:

```javascript
// Layout modes: 'docked', 'floating', 'fullscreen'
debugInterface.layout = 'floating';

// Position and size control
debugInterface.position = { x: 100, y: 100 };
debugInterface.size = { width: 600, height: 800 };
```

### Theme Management

Multiple themes are available:

```javascript
// Available themes: 'dark', 'light', 'high-contrast'
debugInterface.themeManager.setTheme('dark');

// Custom theme settings
debugInterface.settings.theme = 'dark';
debugInterface.settings.fontSize = 14;
```

## Performance Monitoring

### Real-time Metrics

The performance monitor tracks comprehensive metrics:

```javascript
const perfMonitor = debugInterface.performanceMonitor;

// Get current performance stats
const stats = perfMonitor.getPerformanceStats();
console.log('FPS:', stats.fps);
console.log('Memory:', stats.memoryUsage);
console.log('Render Time:', stats.renderTime);

// Historical data access
const history = perfMonitor.getPerformanceHistory();
```

### Performance Thresholds

Configure automatic warnings:

```javascript
// Set FPS threshold (default: 30)
perfMonitor.setFPSThreshold(30);

// Set memory threshold (default: 100MB)
perfMonitor.setMemoryThreshold(100);

// Custom threshold handlers
perfMonitor.onThresholdExceeded((metric, value, threshold) => {
    console.warn(`${metric} exceeded threshold: ${value} > ${threshold}`);
});
```

### Performance Impact Monitoring

The debug tools monitor their own performance impact:

```javascript
// Get debug tools performance impact
const impact = perfMonitor.getDebugImpact();
console.log('Debug overhead:', impact.percentage, '%');

// Performance impact should be < 5%
if (impact.percentage > 5) {
    console.warn('Debug tools performance impact too high');
}
```

## Developer Console

### Basic Usage

The developer console provides an interactive command-line interface:

```javascript
// Access the console panel
debugInterface.switchPanel('console');

// Execute commands programmatically
const console = debugInterface.panels.get('console');
console.executeCommand('help');
```

### Built-in Commands

#### Game State Commands

```bash
# Game control
game.pause()                 # Pause the game
game.resume()               # Resume the game
game.reset()                # Reset game state

# Score manipulation
score.set(10000)            # Set score to specific value
score.add(500)              # Add to current score
score.reset()               # Reset score to 0

# Player data
player.setLevel(5)          # Set player level
player.addAP(1000)          # Add awaputi points
player.setHP(100)           # Set health points
```

#### Configuration Commands

```bash
# Configuration access
config.get("game.difficulty")      # Get configuration value
config.set("game.difficulty", 5)   # Set configuration value
config.list()                      # List all configuration keys
config.export()                    # Export configuration
config.import(data)                # Import configuration

# Performance settings
perf.setTargetFPS(60)              # Set target FPS
perf.enableVSync(true)             # Enable V-sync
perf.optimizeMemory()              # Trigger memory optimization
```

#### Test Data Generation

```bash
# Mock data generation
mock.bubbles(50)                   # Generate 50 test bubbles
mock.playerData("expert")          # Generate expert player data
mock.gameState("bonus")            # Set game to bonus state

# Stress testing
stress.bubbles(1000)               # Stress test with 1000 bubbles
stress.particles(500)              # Stress test particle system
stress.memory()                    # Memory stress test
```

### Command Extension

Add custom commands:

```javascript
const consolePanel = debugInterface.panels.get('console');

// Register custom command
consolePanel.registerCommand('custom.hello', {
    description: 'Say hello with custom message',
    parameters: ['message'],
    handler: (message = 'World') => {
        return `Hello, ${message}!`;
    }
});

// Use in console: custom.hello("Developer")
```

### Autocomplete and History

The console provides intelligent autocomplete:

```javascript
// Autocomplete engine configuration
const autocomplete = consolePanel.autocompleteEngine;

// Add custom completions
autocomplete.addCompletion('mycommand', {
    description: 'My custom command',
    parameters: ['param1', 'param2']
});

// Command history management
const history = consolePanel.commandHistory;
history.getRecent(10);  // Get last 10 commands
history.search('config'); // Search history for 'config'
```

## Error Reporting

### Error Collection

The error reporting system automatically collects comprehensive error data:

```javascript
const errorReporter = debugInterface.errorReporter;

// Get collected errors
const errors = errorReporter.getErrors();

// Error filtering
const criticalErrors = errorReporter.getErrors({
    severity: 'critical',
    timeRange: { start: Date.now() - 3600000 } // Last hour
});
```

### Error Analysis

Pattern detection and analysis:

```javascript
// Get error patterns
const patterns = errorReporter.analyzePatterns();

// Error frequency analysis
const frequency = errorReporter.getErrorFrequency();

// Error impact assessment
const impact = errorReporter.assessImpact();
```

### Custom Error Handling

Register custom error handlers:

```javascript
// Register error handler
errorReporter.registerHandler('CustomError', (error, context) => {
    console.log('Custom error handling:', error.message);
    // Custom recovery logic
});

// Trigger custom notifications
errorReporter.notify('critical', 'Custom critical error occurred');
```

## Test Support Tools

### Test Execution

Run various types of tests:

```javascript
const testSupport = debugInterface.testSupportTools;

// Run different test types
testSupport.runTests('unit');        // Unit tests
testSupport.runTests('integration'); // Integration tests
testSupport.runTests('performance'); // Performance tests
testSupport.runTests('all');         // All tests
```

### Mock Data Generation

Generate realistic test data:

```javascript
const mockGenerator = testSupport.mockDataGenerator;

// Generate different types of mock data
const mockBubbles = mockGenerator.generateBubbles(100);
const mockPlayer = mockGenerator.generatePlayerData('intermediate');
const mockConfig = mockGenerator.generateConfiguration('testing');
```

### Benchmark Suite

Performance benchmarking tools:

```javascript
const benchmarks = testSupport.benchmarkSuite;

// Run performance benchmarks
const results = await benchmarks.runBenchmark('rendering');
const allResults = await benchmarks.runAllBenchmarks();

// Custom benchmarks
benchmarks.addBenchmark('custom-test', async () => {
    // Custom benchmark code
    const startTime = performance.now();
    // ... test code ...
    return performance.now() - startTime;
});
```

## Integration Testing

### Running Integration Tests

Execute comprehensive integration tests:

```javascript
// Run all integration tests
const results = await debugInterface.runIntegrationTests();

// Run specific test categories
const gameTests = await debugInterface.runCategoryIntegrationTests('gameSystemIntegration');
const compatTests = await debugInterface.runCategoryIntegrationTests('crossBrowserCompatibility');

// Export test results
debugInterface.exportIntegrationTestResults();
```

### Test Categories

1. **Game System Integration**: Tests integration with core game systems
2. **Existing System Compatibility**: Validates compatibility with existing code
3. **Cross-Browser Compatibility**: Checks browser API compatibility
4. **Performance Integration**: Measures performance impact
5. **Error Handling**: Tests error handling and recovery
6. **Memory Management**: Validates memory cleanup

### Custom Integration Tests

Add custom integration tests:

```javascript
const testSuite = debugInterface.integrationTestSuite;

// Add custom test
testSuite.runTest('Custom Category', 'Custom Test', async () => {
    // Test implementation
    if (someCondition) {
        throw new Error('Test failed');
    }
    return 'Test passed';
});
```

## Requirements Validation

### Running Validation

Validate that all requirements are properly implemented:

```javascript
// Run all requirements validation
const results = await debugInterface.runRequirementsValidation();

// Check specific requirement categories
const coreResults = results.categoryStats['Core Infrastructure'];
const perfResults = results.categoryStats['Performance Monitoring'];

// Export validation results
debugInterface.exportRequirementsValidationResults();
```

### Requirement Categories

1. **Core Infrastructure**: Panel management, shortcuts, responsive layout
2. **Performance Monitoring**: Real-time metrics, visualization, thresholds
3. **Developer Console**: Command interface, game state manipulation
4. **Error Reporting**: Error collection, analysis, notifications
5. **Test Support**: Testing framework, mock data, benchmarks
6. **Documentation**: Help system, contextual assistance
7. **UI/UX Integration**: Unified interface, accessibility, mobile support

## API Reference

### EnhancedDebugInterface

Main debug interface class:

```javascript
class EnhancedDebugInterface extends EffectDebugInterface {
    // Core methods
    show(): void
    hide(): void
    toggle(): void
    switchPanel(panelName: string): void
    
    // Settings management
    loadSettings(): void
    saveSettings(): void
    createSettingsModal(): void
    closeSettingsModal(): void
    
    // Testing methods
    runIntegrationTests(): Promise<TestResults>
    runCategoryIntegrationTests(category: string): Promise<TestResults>
    runRequirementsValidation(): Promise<ValidationResults>
    
    // Export methods
    exportIntegrationTestResults(): TestResults
    exportRequirementsValidationResults(): ValidationResults
    
    // Utility methods
    generateSessionId(): string
    getDebugInfo(): object
}
```

### PanelManager

Panel management system:

```javascript
class PanelManager {
    registerPanel(name: string, panelClass: class): void
    createPanel(name: string): Panel
    switchToPanel(name: string): void
    hideAllPanels(): void
    getPanelInstance(name: string): Panel
}
```

### KeyboardShortcutManager

Keyboard shortcut management:

```javascript
class KeyboardShortcutManager {
    registerShortcut(key: string, handler: function, context?: string): void
    unregisterShortcut(key: string, context?: string): void
    enableShortcuts(): void
    disableShortcuts(): void
    getRegisteredShortcuts(): Array<Shortcut>
}
```

### DebugPerformanceMonitor

Performance monitoring system:

```javascript
class DebugPerformanceMonitor {
    startMonitoring(): void
    stopMonitoring(): void
    getPerformanceStats(): PerformanceStats
    getPerformanceHistory(): Array<PerformanceSnapshot>
    setFPSThreshold(threshold: number): void
    setMemoryThreshold(threshold: number): void
}
```

## Troubleshooting

### Common Issues

#### Debug Interface Not Showing

```javascript
// Check if debug interface is initialized
if (!gameEngine.enhancedDebugInterface) {
    console.error('Enhanced debug interface not initialized');
}

// Force initialization
gameEngine.initializeDebugSystems();

// Check for errors in console
console.log('Debug interface status:', gameEngine.enhancedDebugInterface.isInitialized);
```

#### Performance Issues

```javascript
// Check debug tools performance impact
const impact = debugInterface.performanceMonitor.getDebugImpact();
if (impact.percentage > 5) {
    // Disable non-essential features
    debugInterface.lazyLoadManager.optimizeMemoryUsage();
    debugInterface.performanceMonitor.reduceUpdateFrequency();
}
```

#### Panel Loading Failures

```javascript
// Check panel registration
const panelManager = debugInterface.panelManager;
const registeredPanels = panelManager.getRegisteredPanels();
console.log('Registered panels:', registeredPanels);

// Re-register panels if needed
panelManager.registerDefaultPanels();
```

#### Keyboard Shortcuts Not Working

```javascript
// Check shortcut registration
const shortcuts = debugInterface.keyboardShortcutManager;
console.log('Registered shortcuts:', shortcuts.getRegisteredShortcuts());

// Re-enable shortcuts
shortcuts.enableShortcuts();

// Check for conflicts
const conflicts = shortcuts.checkForConflicts();
if (conflicts.length > 0) {
    console.warn('Shortcut conflicts:', conflicts);
}
```

### Debug Logging

Enable detailed debug logging:

```javascript
// Enable debug logging
debugInterface.settings.debugLogging = true;

// Set log level
debugInterface.setLogLevel('debug'); // 'error', 'warn', 'info', 'debug'

// View debug logs
const logs = debugInterface.getDebugLogs();
```

### Memory Issues

Monitor and optimize memory usage:

```javascript
// Check memory usage
const memoryStats = debugInterface.performanceMonitor.getMemoryStats();
console.log('Memory usage:', memoryStats);

// Trigger garbage collection
if (window.gc) {
    window.gc();
}

// Optimize memory
debugInterface.lazyLoadManager.optimizeMemoryUsage();
```

## Best Practices

### Performance Optimization

1. **Minimize Debug Impact**: Keep debug tools performance impact under 5%
2. **Lazy Loading**: Use lazy loading for heavy debug components
3. **Efficient Updates**: Update debug displays at reasonable intervals (100-200ms)
4. **Memory Management**: Clean up debug resources when not needed

```javascript
// Good practice: Conditional debug initialization
if (DEVELOPMENT_MODE || window.location.search.includes('debug=true')) {
    gameEngine.initializeEnhancedDebugInterface();
}

// Good practice: Throttled updates
const throttledUpdate = throttle(() => {
    debugInterface.updatePerformanceDisplay();
}, 100);
```

### Error Handling

1. **Graceful Degradation**: Debug tools should not break the main game
2. **Error Isolation**: Isolate debug errors from game errors
3. **Recovery Mechanisms**: Implement automatic recovery from debug failures

```javascript
// Good practice: Error isolation
try {
    debugInterface.show();
} catch (error) {
    console.warn('Debug interface failed to show:', error);
    // Game continues normally
}
```

### Testing Integration

1. **Comprehensive Coverage**: Test debug tools themselves
2. **Integration Validation**: Validate integration with all game systems
3. **Performance Testing**: Verify minimal performance impact

```javascript
// Good practice: Debug tools testing
describe('EnhancedDebugInterface', () => {
    it('should have minimal performance impact', async () => {
        const impact = await measurePerformanceImpact();
        expect(impact.percentage).toBeLessThan(5);
    });
});
```

### Documentation

1. **Keep Updated**: Maintain documentation alongside code changes
2. **Examples**: Provide clear usage examples
3. **Troubleshooting**: Document common issues and solutions

### Security Considerations

1. **Production Safety**: Ensure debug tools are disabled in production
2. **Access Control**: Implement appropriate access controls for sensitive debug features
3. **Data Protection**: Avoid logging sensitive user data

```javascript
// Good practice: Production check
if (process.env.NODE_ENV === 'production') {
    // Disable or limit debug features
    debugInterface.settings.enabled = false;
}
```

## Conclusion

The Enhanced Debug Tools provide a powerful and comprehensive debugging environment for the Awaputi game. By following this guide and the best practices outlined, developers can effectively debug, test, and optimize the game while maintaining excellent performance and user experience.

For additional support or to report issues with the debug tools, please refer to the project's issue tracker or contact the development team.