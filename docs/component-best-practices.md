# Component-Based Development Best Practices
## Guidelines Established from UserInfoScene Refactoring

### Overview

This document captures the best practices and conventions established during the UserInfoScene component refactoring (Issue #52). These practices ensure maintainable, AI-tool-friendly, and performant component architectures.

### Core Principles

#### 1. Single Responsibility Principle
Each component should have one clear, well-defined purpose.

```javascript
// ✅ Good: Single responsibility
export class StatisticsFilterUI extends BaseComponent {
    // Only handles filter UI and user interactions
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        this.filters = ['all', 'today', 'week', 'month'];
        this.currentFilter = 'all';
    }
    
    render(ctx, x, y, width, height) {
        this.renderFilterButtons(ctx, x, y, width, height);
    }
    
    handleClick(x, y) {
        return this.handleFilterButtonClick(x, y);
    }
}

// ❌ Bad: Multiple responsibilities
export class StatisticsEverything extends BaseComponent {
    // Handles filtering, rendering, data loading, export, etc.
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        // Too many concerns mixed together
    }
}
```

#### 2. Optimal File Size for AI Tools
Keep components within AI tool token limits for optimal development experience.

**Target Sizes**:
- **Infrastructure components**: 300-1,000 words
- **UI components**: 800-2,000 words
- **Complex components**: 1,500-2,500 words
- **Maximum acceptable**: 3,000 words

```bash
# Check component size before committing
wc -w src/scenes/components/YourComponent.js

# If over 2,500 words, consider splitting:
# - Extract sub-components
# - Separate UI from logic
# - Split by functional areas
```

#### 3. Event-Driven Communication
Components communicate through events, not direct method calls.

```javascript
// ✅ Good: Event-driven communication
export class StatisticsTab extends TabComponent {
    handleFilterChange(filterData) {
        // Update local state
        this.currentFilter = filterData.period;
        
        // Emit event for other components
        this.eventBus.emit('statistics-filter-changed', {
            period: filterData.period,
            component: 'StatisticsTab',
            timestamp: Date.now()
        });
    }
}

export class StatisticsRenderer extends BaseComponent {
    setupEventListeners() {
        // Listen for filter changes
        this.eventBus.on('statistics-filter-changed', this.handleFilterUpdate.bind(this));
    }
    
    handleFilterUpdate(eventData) {
        // React to filter changes without direct coupling
        this.refreshDisplay(eventData.period);
    }
}

// ❌ Bad: Direct coupling
export class StatisticsTab extends TabComponent {
    handleFilterChange(filterData) {
        // Direct method call creates tight coupling
        this.statisticsRenderer.updateFilter(filterData.period);
        this.dashboardRenderer.refreshCharts(filterData.period);
    }
}
```

### Component Architecture Patterns

#### 1. Base Component Extension
All components should extend appropriate base classes.

```javascript
// For tab-level components
export class NewTab extends TabComponent {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        // Tab-specific initialization
    }
}

// For sub-components
export class NewSubComponent extends BaseComponent {
    constructor(parentSystem, eventBus, componentState) {
        super(parentSystem, eventBus, componentState);
        // Sub-component initialization
    }
}

// For dialog components  
export class NewDialog extends BaseDialog {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        // Dialog-specific initialization
    }
}
```

#### 2. Lifecycle Management Pattern
Implement all lifecycle methods consistently.

```javascript
export class ExampleComponent extends TabComponent {
    // 1. Constructor: Dependency injection and initial state
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        
        // Initialize state
        this.data = null;
        this.isLoading = false;
        this.error = null;
        
        // Sub-component references
        this.subComponents = {};
        
        // Event listener references for cleanup
        this.boundEventHandlers = new Map();
    }
    
    // 2. Initialize: Setup component and sub-components
    initialize() {
        super.initialize();
        
        // Create sub-components
        this.initializeSubComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data if needed
        this.loadInitialData();
    }
    
    // 3. Activate: Component becomes active
    activate() {
        super.activate();
        
        // Start active behavior
        this.refreshData();
        this.startPeriodicUpdates();
        
        // Activate sub-components
        Object.values(this.subComponents).forEach(component => {
            if (component.activate) {
                component.activate();
            }
        });
    }
    
    // 4. Deactivate: Component becomes inactive
    deactivate() {
        super.deactivate();
        
        // Stop active behavior
        this.stopPeriodicUpdates();
        
        // Deactivate sub-components
        Object.values(this.subComponents).forEach(component => {
            if (component.deactivate) {
                component.deactivate();
            }
        });
    }
    
    // 5. Cleanup: Resource cleanup and memory management
    cleanup() {
        // Clean up event listeners
        this.boundEventHandlers.forEach((handler, eventName) => {
            this.eventBus.off(eventName, handler);
        });
        this.boundEventHandlers.clear();
        
        // Clean up sub-components
        Object.values(this.subComponents).forEach(component => {
            if (component.cleanup) {
                component.cleanup();
            }
        });
        this.subComponents = {};
        
        // Clear data references
        this.data = null;
        this.error = null;
        
        super.cleanup();
    }
    
    // Helper methods for lifecycle management
    setupEventListeners() {
        const handlers = [
            ['data-updated', this.handleDataUpdate.bind(this)],
            ['settings-changed', this.handleSettingsChange.bind(this)],
        ];
        
        handlers.forEach(([eventName, handler]) => {
            this.eventBus.on(eventName, handler);
            this.boundEventHandlers.set(eventName, handler);
        });
    }
    
    initializeSubComponents() {
        // Create sub-components with error handling
        try {
            this.subComponents.ui = new ComponentUI(this.gameEngine, this.eventBus, this.sceneState);
            this.subComponents.renderer = new ComponentRenderer(this.gameEngine, this.eventBus, this.sceneState);
            
            // Initialize sub-components
            Object.values(this.subComponents).forEach(component => {
                if (component.initialize) {
                    component.initialize();
                }
            });
        } catch (error) {
            console.error('Failed to initialize sub-components:', error);
            this.setError('コンポーネントの初期化に失敗しました');
        }
    }
}
```

#### 3. Error Handling Pattern
Implement comprehensive error handling throughout components.

```javascript
export class RobustComponent extends TabComponent {
    async loadData() {
        try {
            // Set loading state
            this.setLoadingState(true);
            this.clearError();
            
            // Load data with timeout
            const dataPromise = this.gameEngine.dataManager.loadData();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Data loading timeout')), 10000);
            });
            
            const data = await Promise.race([dataPromise, timeoutPromise]);
            
            // Validate data
            if (!this.validateData(data)) {
                throw new Error('Invalid data received');
            }
            
            // Update state
            this.data = data;
            this.sceneState.updateSharedData('componentData', data);
            
            // Emit success event
            this.eventBus.emit('data-loaded-successfully', {
                component: this.constructor.name,
                dataSize: data ? Object.keys(data).length : 0
            });
            
        } catch (error) {
            // Handle different error types
            this.handleDataLoadError(error);
        } finally {
            // Always clear loading state
            this.setLoadingState(false);
        }
    }
    
    handleDataLoadError(error) {
        // Log for debugging
        console.error(`Data loading failed in ${this.constructor.name}:`, error);
        
        // Set user-friendly error message
        let userMessage = 'データの読み込みに失敗しました';
        
        if (error.message.includes('timeout')) {
            userMessage = 'データの読み込みがタイムアウトしました';
        } else if (error.message.includes('network')) {
            userMessage = 'ネットワークエラーが発生しました';
        }
        
        this.setError(userMessage);
        
        // Emit error event
        this.eventBus.emit('error-occurred', {
            component: this.constructor.name,
            error: error.message,
            userMessage: userMessage,
            recoverable: true
        });
        
        // Attempt recovery
        this.attemptDataRecovery();
    }
    
    attemptDataRecovery() {
        // Try cached data first
        const cachedData = this.getCachedData();
        if (cachedData) {
            this.data = cachedData;
            this.setError('キャッシュされたデータを表示しています');
            return true;
        }
        
        // Try fallback data source
        this.loadFallbackData();
        return false;
    }
    
    validateData(data) {
        // Implement data validation logic
        return data && typeof data === 'object' && !Array.isArray(data);
    }
    
    setError(message) {
        this.error = message;
        this.eventBus.emit('component-error-set', {
            component: this.constructor.name,
            message: message
        });
    }
    
    clearError() {
        this.error = null;
        this.eventBus.emit('component-error-cleared', {
            component: this.constructor.name
        });
    }
}
```

### Event System Best Practices

#### 1. Event Naming Conventions
Use consistent, descriptive event names.

```javascript
// Pattern: [domain]-[action]-[detail]
// Good event names:
'statistics-data-updated'
'statistics-filter-changed'  
'achievement-unlocked'
'dialog-requested'
'error-occurred'
'component-activated'
'user-settings-changed'

// Event data structure
this.eventBus.emit('statistics-data-updated', {
    // Core data
    data: newStatisticsData,
    
    // Context information
    component: 'StatisticsTab',
    timestamp: Date.now(),
    
    // Action details
    trigger: 'user-filter-change',
    filter: 'last30days',
    
    // Metadata
    dataSize: Object.keys(newStatisticsData).length,
    loadTime: Date.now() - startTime
});
```

#### 2. Event Handler Organization
Organize event handlers consistently within components.

```javascript
export class OrganizedComponent extends TabComponent {
    setupEventListeners() {
        // Group related events together
        this.setupDataEvents();
        this.setupUIEvents();
        this.setupSystemEvents();
    }
    
    setupDataEvents() {
        const dataEvents = [
            ['statistics-data-updated', this.handleStatisticsUpdate],
            ['user-data-updated', this.handleUserUpdate],
            ['achievements-data-updated', this.handleAchievementsUpdate]
        ];
        
        dataEvents.forEach(([eventName, handler]) => {
            const boundHandler = handler.bind(this);
            this.eventBus.on(eventName, boundHandler);
            this.boundEventHandlers.set(eventName, boundHandler);
        });
    }
    
    setupUIEvents() {
        const uiEvents = [
            ['filter-changed', this.handleFilterChange],
            ['view-mode-changed', this.handleViewModeChange],
            ['dialog-requested', this.handleDialogRequest]
        ];
        
        uiEvents.forEach(([eventName, handler]) => {
            const boundHandler = handler.bind(this);
            this.eventBus.on(eventName, boundHandler);
            this.boundEventHandlers.set(eventName, boundHandler);
        });
    }
    
    setupSystemEvents() {
        const systemEvents = [
            ['error-occurred', this.handleError],
            ['accessibility-changed', this.handleAccessibilityChange]
        ];
        
        systemEvents.forEach(([eventName, handler]) => {
            const boundHandler = handler.bind(this);
            this.eventBus.on(eventName, boundHandler);
            this.boundEventHandlers.set(eventName, boundHandler);
        });
    }
}
```

#### 3. Event Handler Error Safety
Make event handlers resilient to errors.

```javascript
export class SafeEventComponent extends TabComponent {
    handleDataUpdate(eventData) {
        try {
            // Validate event data
            if (!this.validateEventData(eventData)) {
                console.warn('Invalid event data received:', eventData);
                return;
            }
            
            // Process update
            this.processDataUpdate(eventData);
            
        } catch (error) {
            // Log error without breaking other event handlers
            console.error(`Error handling data update in ${this.constructor.name}:`, error);
            
            // Optionally emit error event
            this.eventBus.emit('event-handler-error', {
                component: this.constructor.name,
                handler: 'handleDataUpdate',
                error: error.message,
                eventData: eventData
            });
        }
    }
    
    validateEventData(eventData) {
        return eventData && 
               typeof eventData === 'object' &&
               eventData.data !== undefined;
    }
}
```

### Performance Best Practices

#### 1. Lazy Loading Implementation
Implement lazy loading for optimal performance.

```javascript
export class LazyLoadingCoordinator extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // Component cache with metadata
        this.components = new Map();
        this.componentFactories = new Map();
        
        // Performance tracking
        this.loadTimes = new Map();
        this.accessCounts = new Map();
    }
    
    getComponent(componentName) {
        // Track access for analytics
        this.accessCounts.set(componentName, 
            (this.accessCounts.get(componentName) || 0) + 1
        );
        
        // Return cached component if available
        if (this.components.has(componentName)) {
            const componentData = this.components.get(componentName);
            componentData.lastAccessTime = Date.now();
            return componentData.instance;
        }
        
        // Create component on demand
        return this.createAndCacheComponent(componentName);
    }
    
    createAndCacheComponent(componentName) {
        const startTime = Date.now();
        
        try {
            // Create component using factory
            const factory = this.componentFactories.get(componentName);
            if (!factory) {
                console.warn(`No factory found for component: ${componentName}`);
                return null;
            }
            
            const component = factory();
            if (!component) {
                console.error(`Factory returned null for component: ${componentName}`);
                return null;
            }
            
            // Initialize component
            component.initialize();
            
            // Cache with metadata
            const componentData = {
                instance: component,
                createdAt: Date.now(),
                lastAccessTime: Date.now(),
                loadTime: Date.now() - startTime
            };
            
            this.components.set(componentName, componentData);
            this.loadTimes.set(componentName, componentData.loadTime);
            
            console.log(`Lazy loaded component ${componentName} in ${componentData.loadTime}ms`);
            
            return component;
            
        } catch (error) {
            console.error(`Failed to create component ${componentName}:`, error);
            return null;
        }
    }
    
    // Register component factories
    registerComponentFactory(componentName, factory) {
        this.componentFactories.set(componentName, factory);
    }
    
    // Performance monitoring
    getPerformanceMetrics() {
        return {
            totalComponents: this.components.size,
            averageLoadTime: this.calculateAverageLoadTime(),
            mostAccessedComponent: this.getMostAccessedComponent(),
            memoryUsage: this.estimateMemoryUsage()
        };
    }
}
```

#### 2. Memory Management Pattern
Implement proper memory cleanup to prevent leaks.

```javascript
export class MemoryManagedComponent extends TabComponent {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        
        // Track all resources that need cleanup
        this.managedResources = {
            eventListeners: new Map(),
            timers: new Set(),
            subComponents: new Map(),
            dataReferences: new Set(),
            caches: new Map()
        };
    }
    
    // Override event listener registration to track them
    addEventListener(eventName, handler) {
        const boundHandler = handler.bind(this);
        this.eventBus.on(eventName, boundHandler);
        
        // Track for cleanup
        this.managedResources.eventListeners.set(eventName, boundHandler);
        
        return boundHandler;
    }
    
    // Create managed timers
    createManagedTimer(callback, interval, immediate = false) {
        const timer = immediate ? 
            setInterval(callback, interval) : 
            setTimeout(callback, interval);
            
        this.managedResources.timers.add(timer);
        return timer;
    }
    
    // Create managed sub-components
    createSubComponent(componentName, ComponentClass, ...args) {
        const component = new ComponentClass(...args);
        component.initialize();
        
        this.managedResources.subComponents.set(componentName, component);
        return component;
    }
    
    // Track data references
    setManagedData(key, data) {
        this[key] = data;
        this.managedResources.dataReferences.add(key);
    }
    
    // Create managed caches
    createManagedCache(cacheName) {
        const cache = new Map();
        this.managedResources.caches.set(cacheName, cache);
        return cache;
    }
    
    cleanup() {
        // Clean up event listeners
        this.managedResources.eventListeners.forEach((handler, eventName) => {
            this.eventBus.off(eventName, handler);
        });
        this.managedResources.eventListeners.clear();
        
        // Clear timers
        this.managedResources.timers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.managedResources.timers.clear();
        
        // Clean up sub-components
        this.managedResources.subComponents.forEach((component, name) => {
            if (component.cleanup) {
                component.cleanup();
            }
        });
        this.managedResources.subComponents.clear();
        
        // Clear data references
        this.managedResources.dataReferences.forEach(key => {
            this[key] = null;
        });
        this.managedResources.dataReferences.clear();
        
        // Clear caches
        this.managedResources.caches.forEach(cache => {
            cache.clear();
        });
        this.managedResources.caches.clear();
        
        super.cleanup();
    }
}
```

### Testing Best Practices

#### 1. Component Testing Structure
Organize tests for comprehensive coverage.

```javascript
// tests/components/ExampleComponent.test.js
describe('ExampleComponent', () => {
    let gameEngine, eventBus, sceneState, component;
    
    beforeEach(() => {
        // Setup test environment
        gameEngine = new MockGameEngine();
        eventBus = new ComponentEventBus();
        sceneState = new SceneState(gameEngine);
        component = new ExampleComponent(gameEngine, eventBus, sceneState);
    });
    
    afterEach(() => {
        // Clean up after each test
        if (component && component.cleanup) {
            component.cleanup();
        }
    });
    
    describe('Lifecycle Management', () => {
        test('should initialize without errors', () => {
            expect(() => {
                component.initialize();
            }).not.toThrow();
        });
        
        test('should activate and deactivate correctly', () => {
            component.initialize();
            
            component.activate();
            expect(component.isActive).toBe(true);
            
            component.deactivate();
            expect(component.isActive).toBe(false);
        });
        
        test('should clean up resources properly', () => {
            component.initialize();
            component.activate();
            
            // Track resource creation
            const initialListeners = eventBus.listeners.size;
            
            component.cleanup();
            
            // Verify cleanup
            expect(component.isCleanedUp).toBe(true);
            expect(eventBus.listeners.size).toBeLessThanOrEqual(initialListeners);
        });
    });
    
    describe('Event Handling', () => {
        test('should handle events correctly', () => {
            component.initialize();
            
            const testData = { value: 'test' };
            eventBus.emit('test-event', testData);
            
            // Verify event was handled
            // Add specific assertions based on component behavior
        });
        
        test('should emit events correctly', () => {
            component.initialize();
            
            const eventSpy = jest.fn();
            eventBus.on('component-event', eventSpy);
            
            component.triggerEvent();
            
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    component: 'ExampleComponent'
                })
            );
        });
    });
    
    describe('Error Handling', () => {
        test('should handle initialization errors gracefully', () => {
            // Mock error condition
            gameEngine.mockError = true;
            
            expect(() => {
                component.initialize();
            }).not.toThrow();
            
            expect(component.error).toBeTruthy();
        });
        
        test('should recover from data loading errors', async () => {
            component.initialize();
            
            // Mock data loading error
            gameEngine.dataManager.loadData = jest.fn().mockRejectedValue(
                new Error('Network error')
            );
            
            await component.loadData();
            
            // Should attempt recovery
            expect(component.error).toContain('読み込みに失敗');
        });
    });
    
    describe('Performance', () => {
        test('should not leak memory', () => {
            component.initialize();
            component.activate();
            
            // Create some resources
            component.loadData();
            component.createSubComponents();
            
            const initialMemory = process.memoryUsage().heapUsed;
            
            component.cleanup();
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            
            // Memory should not increase significantly
            expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // 1MB threshold
        });
    });
});
```

#### 2. Integration Testing Pattern
Test component interactions and coordination.

```javascript
// tests/integration/ComponentIntegration.test.js
describe('Component Integration', () => {
    let coordinator, componentA, componentB, eventBus, sceneState;
    
    beforeEach(() => {
        coordinator = new ComponentCoordinator();
        eventBus = coordinator.eventBus;
        sceneState = coordinator.sceneState;
        
        componentA = coordinator.getComponent('componentA');
        componentB = coordinator.getComponent('componentB');
    });
    
    test('should coordinate data flow between components', async () => {
        // Initialize components
        componentA.initialize();
        componentB.initialize();
        
        // Activate components
        componentA.activate();
        componentB.activate();
        
        // Trigger data update in component A
        await componentA.updateData({ value: 'test-data' });
        
        // Wait for event propagation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify component B received the update
        expect(componentB.receivedData).toEqual({ value: 'test-data' });
    });
    
    test('should handle component lifecycle coordination', () => {
        // Test lazy loading
        expect(coordinator.components.size).toBe(0);
        
        const component = coordinator.getComponent('testComponent');
        
        expect(coordinator.components.size).toBe(1);
        expect(component).toBeDefined();
        expect(component.isInitialized).toBe(true);
    });
});
```

### Documentation Best Practices

#### 1. Component Documentation Template
Document each component consistently.

```javascript
/**
 * StatisticsTab Component
 * 
 * Coordinates statistics display and manages related sub-components.
 * Handles user interactions for filtering and view mode changes.
 * 
 * @extends TabComponent
 * 
 * ## Responsibilities
 * - Coordinate statistics data loading and display
 * - Manage filter UI and statistics rendering sub-components  
 * - Handle period filtering and view mode switching
 * - Emit events for statistics data updates
 * 
 * ## Sub-components
 * - StatisticsFilterUI: Filter controls and view mode selector
 * - StatisticsRenderer: Detailed statistics display
 * - StatisticsDashboardRenderer: Dashboard view with charts
 * 
 * ## Events Emitted
 * - 'statistics-data-updated': When statistics data is loaded/refreshed
 * - 'statistics-filter-changed': When user changes period filter
 * - 'statistics-view-mode-changed': When user changes view mode
 * 
 * ## Events Listened
 * - 'user-data-updated': Updates display when user data changes
 * - 'accessibility-settings-changed': Adjusts display for accessibility
 * 
 * ## Usage Example
 * ```javascript
 * const statsTab = new StatisticsTab(gameEngine, eventBus, sceneState);
 * statsTab.initialize();
 * statsTab.activate();
 * 
 * // Listen for statistics updates
 * eventBus.on('statistics-data-updated', (data) => {
 *     console.log('Statistics updated:', data);
 * });
 * ```
 * 
 * ## File Size: 901 words (AI-tool friendly)
 * ## Dependencies: gameEngine.statisticsManager, accessibility settings
 * ## Performance: Lazy loads sub-components, caches filter results
 */
export class StatisticsTab extends TabComponent {
    /**
     * Creates a new StatisticsTab instance
     * @param {GameEngine} gameEngine - Main game engine instance
     * @param {ComponentEventBus} eventBus - Event bus for component communication
     * @param {SceneState} sceneState - Shared scene state management
     */
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        
        // ... implementation
    }
    
    /**
     * Load statistics data for specified period
     * @param {string} period - Period filter ('all', 'today', 'week', 'month')
     * @returns {Promise<void>}
     */
    async loadStatisticsData(period = 'all') {
        // ... implementation
    }
}
```

#### 2. Architecture Decision Records
Document important architectural decisions.

```markdown
# ADR-001: Component-Based Architecture for UserInfoScene

## Status
Accepted

## Context
The UserInfoScene.js file had grown to 3,734 lines, making it difficult to maintain and impossible to analyze with AI development tools due to token limits.

## Decision
Refactor UserInfoScene into a component-based architecture with:
- Lazy-loaded tab components
- Event-driven communication
- Shared state management
- Automatic memory cleanup

## Consequences
**Positive:**
- 58% reduction in main file size
- All components within AI tool limits (<2,500 words)
- Parallel development enabled
- Improved maintainability and testability

**Negative:**
- Increased complexity in component coordination
- Additional abstraction layer
- Learning curve for new patterns

## Implementation
- 16 focused components created
- EventBus for inter-component communication
- SceneState for shared data management
- Comprehensive test suite for backward compatibility
```

### Code Review Guidelines

#### 1. Component Review Checklist
Use this checklist when reviewing component code:

**Architecture & Design**
- [ ] Component has single, clear responsibility
- [ ] File size within AI tool limits (<2,500 words)
- [ ] Extends appropriate base class
- [ ] Uses event bus for communication (no direct component coupling)

**Lifecycle Management**
- [ ] Implements all required lifecycle methods
- [ ] Proper initialization of sub-components
- [ ] Event listeners registered and tracked for cleanup
- [ ] Resources properly cleaned up in cleanup() method

**Error Handling**
- [ ] Async operations wrapped in try-catch blocks
- [ ] User-friendly error messages
- [ ] Error recovery mechanisms implemented
- [ ] Errors logged with sufficient context

**Performance**
- [ ] Lazy loading implemented where appropriate
- [ ] No memory leaks (verified with tests)
- [ ] Efficient event handling (specific event names)
- [ ] Reasonable caching strategies

**Testing**
- [ ] Unit tests for component functionality
- [ ] Integration tests for component interactions
- [ ] Error handling tests
- [ ] Memory leak tests

**Documentation**
- [ ] Component purpose clearly documented
- [ ] Public interface documented with JSDoc
- [ ] Events emitted/listened documented
- [ ] Usage examples provided

### Conclusion

These best practices, established through the UserInfoScene refactoring, provide a foundation for building maintainable, performant, and AI-tool-friendly component architectures. By following these guidelines, developers can:

1. **Create focused components** with single responsibilities
2. **Maintain optimal file sizes** for AI development tools
3. **Implement robust error handling** and recovery mechanisms
4. **Use efficient event-driven communication** patterns
5. **Ensure proper resource management** and memory cleanup
6. **Write comprehensive tests** for reliability
7. **Document components effectively** for future maintenance

These practices should be applied consistently across all component development in the project to maintain architectural coherence and development efficiency.