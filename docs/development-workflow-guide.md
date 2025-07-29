# Development Workflow Guide
## Component-Based Architecture for UserInfoScene and Beyond

### Overview

This guide outlines the new development workflow established by the UserInfoScene component refactoring (Issue #52). It provides practical guidelines for working with the new component-based architecture and maintaining separation of concerns across the codebase.

### New File Organization

#### Before Refactoring
```
src/scenes/
├── UserInfoScene.js          (3,734 lines - monolithic)
├── GameScene.js
├── MainMenuScene.js
├── ShopScene.js
└── StageSelectScene.js
```

#### After Refactoring
```
src/scenes/
├── UserInfoScene.js          (coordinator - 3,840 lines, optimized structure)
├── components/               (new component architecture)
│   ├── infrastructure/       (core system components)
│   │   ├── TabComponent.js          (343 words - base class)
│   │   ├── ComponentEventBus.js     (693 words - communication)
│   │   └── SceneState.js            (957 words - state management)
│   ├── tabs/                 (tab-specific components)
│   │   ├── StatisticsTab.js         (901 words - coordinator)
│   │   ├── AchievementsTab.js       (2,419 words - display logic)
│   │   ├── ManagementTab.js         (2,309 words - user management)
│   │   └── HelpTab.js               (1,562 words - help system)
│   ├── statistics/           (statistics sub-components)
│   │   ├── StatisticsFilterUI.js    (1,065 words - filters)
│   │   ├── StatisticsRenderer.js    (1,860 words - detailed view)
│   │   └── StatisticsDashboardRenderer.js (1,331 words - dashboard)
│   └── dialogs/              (dialog system components)
│       ├── DialogManager.js         (1,338 words - dialog coordinator)
│       ├── BaseDialog.js            (1,466 words - base dialog class)
│       ├── UsernameDialog.js        (1,216 words - username changes)
│       ├── ExportDialog.js          (1,727 words - data export)
│       └── ImportDialog.js          (2,536 words - data import)
├── GameScene.js
├── MainMenuScene.js
├── ShopScene.js
└── StageSelectScene.js
```

### Component Development Workflow

#### 1. Working with Existing Components

##### Modifying Tab Components
```bash
# Navigate to specific component
cd src/scenes/components

# For statistics-related changes
vim StatisticsTab.js              # Main coordinator (901 words)
vim StatisticsFilterUI.js         # Filter controls (1,065 words)  
vim StatisticsRenderer.js         # Display logic (1,860 words)
vim StatisticsDashboardRenderer.js # Dashboard view (1,331 words)

# Each file is AI-tool friendly and focused on single responsibility
```

**Best Practices for Component Modification**:
1. **Single File Focus**: Work on one component at a time
2. **Test Isolation**: Test component independently before integration
3. **Event Consistency**: Maintain existing event interfaces
4. **Backward Compatibility**: Preserve public method signatures

##### Working with Dialog System
```bash
# For dialog-related changes
vim components/DialogManager.js    # Central dialog coordination
vim components/BaseDialog.js       # Common dialog functionality
vim components/UsernameDialog.js   # Specific dialog implementation

# Dialog development pattern:
# 1. Extend BaseDialog for new dialog types
# 2. Register with DialogManager
# 3. Emit events for dialog requests
# 4. Handle completion/cancellation events
```

#### 2. Creating New Components

##### Step-by-Step Component Creation Process

**Step 1: Create Component File**
```bash
# Create new component file (keep under 2,500 words)
touch src/scenes/components/NewFeatureTab.js

# Use consistent naming convention:
# - [Feature]Tab.js for main tab components
# - [Feature][Aspect].js for sub-components
# - [Feature]Dialog.js for dialog components
```

**Step 2: Implement Component Class**
```javascript
// src/scenes/components/NewFeatureTab.js
import { TabComponent } from './TabComponent.js';

export class NewFeatureTab extends TabComponent {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        
        // Component-specific state
        this.featureData = null;
        this.isLoading = false;
        this.error = null;
        
        // Sub-components (if needed)
        this.featureUI = null;
        this.featureRenderer = null;
    }
    
    initialize() {
        super.initialize();
        
        // Setup component
        this.initializeSubComponents();
        this.setupEventListeners();
        this.loadInitialData();
    }
    
    activate() {
        super.activate();
        
        // Component becomes active
        this.refreshData();
        this.startPeriodicUpdates();
    }
    
    deactivate() {
        super.deactivate();
        
        // Component becomes inactive
        this.stopPeriodicUpdates();
    }
    
    cleanup() {
        // Clean up event listeners
        this.eventBus.off('feature-data-updated', this.handleDataUpdate);
        
        // Clean up sub-components
        this.featureUI?.cleanup();
        this.featureRenderer?.cleanup();
        
        // Clear references
        this.featureUI = null;
        this.featureRenderer = null;
        
        super.cleanup();
    }
    
    // Component-specific methods
    setupEventListeners() {
        this.eventBus.on('feature-data-updated', this.handleDataUpdate.bind(this));
    }
    
    render(ctx, x, y, width, height) {
        if (!this.isActive) return;
        
        // Delegate rendering to sub-components
        this.featureUI?.render(ctx, x, y, width, 100);
        this.featureRenderer?.render(ctx, x, y + 110, width, height - 110);
    }
    
    handleClick(x, y) {
        if (!this.isActive) return false;
        
        // Delegate clicks to sub-components
        return this.featureUI?.handleClick(x, y) || 
               this.featureRenderer?.handleClick(x, y) || 
               false;
    }
}
```

**Step 3: Register Component with Coordinator**
```javascript
// In UserInfoScene.js (or appropriate coordinator)
import { NewFeatureTab } from './components/NewFeatureTab.js';

createTabComponent(tabName) {
    switch (tabName) {
        case 'statistics':
            return new StatisticsTab(this.gameEngine, this.eventBus, this.componentState);
        case 'achievements':
            return new AchievementsTab(this.gameEngine, this.eventBus, this.componentState);
        case 'management':
            return new ManagementTab(this.gameEngine, this.eventBus, this.componentState);
        case 'help':
            return new HelpTab(this.gameEngine, this.eventBus, this.componentState);
        case 'newfeature':  // Add new component
            return new NewFeatureTab(this.gameEngine, this.eventBus, this.componentState);
        default:
            return null;
    }
}

// Update tab list
constructor(gameEngine) {
    super(gameEngine);
    this.tabs = ['statistics', 'achievements', 'management', 'help', 'newfeature'];
    // ... rest of constructor
}
```

**Step 4: Write Component Tests**
```javascript
// tests/integration/NewFeatureTabComponent.test.js
describe('NewFeatureTab Component', () => {
    let gameEngine, eventBus, sceneState, newFeatureTab;
    
    beforeEach(() => {
        // Setup test environment
        gameEngine = new MockGameEngine();
        eventBus = new ComponentEventBus();
        sceneState = new SceneState(gameEngine);
        newFeatureTab = new NewFeatureTab(gameEngine, eventBus, sceneState);
    });
    
    test('should initialize without errors', () => {
        expect(() => {
            newFeatureTab.initialize();
        }).not.toThrow();
    });
    
    test('should handle activation and deactivation', () => {
        newFeatureTab.initialize();
        
        newFeatureTab.activate();
        expect(newFeatureTab.isActive).toBe(true);
        
        newFeatureTab.deactivate();
        expect(newFeatureTab.isActive).toBe(false);
    });
    
    // Add more specific tests
});
```

#### 3. Testing Strategy

##### Component-Level Testing
```bash
# Run tests for specific component
npm test -- --testPathPattern=NewFeatureTab

# Run integration tests for component interactions
npm test -- --testPathPattern=UserInfoSceneComponents

# Run backward compatibility tests
npm test -- --testPathPattern=UserInfoSceneBackwardCompatibility
```

##### Testing Checklist for New Components
- [ ] **Unit Tests**: Component initializes and functions independently
- [ ] **Integration Tests**: Component works with event bus and shared state
- [ ] **Lifecycle Tests**: Initialize, activate, deactivate, cleanup work correctly
- [ ] **Event Tests**: Component emits and responds to events properly
- [ ] **Error Handling Tests**: Component handles errors gracefully
- [ ] **Memory Tests**: Component cleans up resources properly

#### 4. Best Practices for Component Development

##### Component Size Guidelines
```bash
# Check component size before committing
wc -w src/scenes/components/NewComponent.js

# Target sizes:
# - Infrastructure components: <1,000 words
# - UI components: <2,000 words  
# - Complex components: <2,500 words
# - Maximum acceptable: 3,000 words
```

##### Code Organization Within Components
```javascript
export class ExampleComponent extends TabComponent {
    // 1. Constructor (dependency injection, state initialization)
    constructor(gameEngine, eventBus, sceneState) { }
    
    // 2. Lifecycle methods (in order of execution)
    initialize() { }
    activate() { }
    deactivate() { }
    cleanup() { }
    
    // 3. Event handling
    setupEventListeners() { }
    handleSpecificEvent(data) { }
    
    // 4. Public interface methods
    publicMethod1() { }
    publicMethod2() { }
    
    // 5. Rendering methods
    render(ctx, x, y, width, height) { }
    renderSubSection(ctx, x, y, width, height) { }
    
    // 6. Interaction handling
    handleClick(x, y) { }
    handleKeyPress(event) { }
    
    // 7. Data management
    loadData() { }
    refreshData() { }
    
    // 8. Private/utility methods (last)
    privateUtilityMethod() { }
    calculateLayout(width, height) { }
}
```

##### Event Naming Conventions
```javascript
// Event naming pattern: [domain]-[action][-detail]
this.eventBus.emit('statistics-data-updated', data);
this.eventBus.emit('statistics-filter-changed', filter);
this.eventBus.emit('achievement-unlocked', achievement);
this.eventBus.emit('dialog-requested', dialogInfo);
this.eventBus.emit('error-occurred', errorInfo);

// Listen for events with consistent naming
this.eventBus.on('statistics-data-updated', this.handleDataUpdate);
this.eventBus.on('user-settings-changed', this.handleSettingsChange);
```

### AI Tool Integration Workflow

#### 1. AI-Assisted Component Development
With the new component structure, AI tools can now effectively assist with:

```bash
# Each component is within AI tool token limits
# Statistics tab development workflow:

# 1. Work on main coordinator (901 words - optimal for AI)
code src/scenes/components/StatisticsTab.js

# 2. Work on specific UI elements (1,065 words - optimal for AI)  
code src/scenes/components/StatisticsFilterUI.js

# 3. Work on rendering logic (1,860 words - good for AI)
code src/scenes/components/StatisticsRenderer.js

# 4. Work on dashboard features (1,331 words - optimal for AI)
code src/scenes/components/StatisticsDashboardRenderer.js
```

**AI Tool Workflow Benefits**:
- **Single Component Focus**: Each file is fully analyzable by AI tools
- **Context Preservation**: AI can understand entire component in one session
- **Code Completion**: Enhanced code completion within component boundaries
- **Refactoring Assistance**: AI can suggest improvements for individual components

#### 2. Component Analysis Workflow
```bash
# Analyze specific component performance
# (all components now within AI token limits)

# Get component metrics
wc -l src/scenes/components/StatisticsTab.js
wc -w src/scenes/components/StatisticsTab.js

# Analyze dependencies
grep -n "import" src/scenes/components/StatisticsTab.js

# Review component interface
grep -n "export\|class\|constructor\|initialize\|cleanup" src/scenes/components/StatisticsTab.js
```

### Maintenance Guidelines

#### 1. Component Separation Maintenance

##### Adding New Functionality
```javascript
// ❌ Bad: Adding unrelated functionality to existing component
class StatisticsTab extends TabComponent {
    // ... existing statistics code ...
    
    // DON'T: Add achievement functionality here
    showAchievementPopup() { }
    updateAchievementProgress() { }
}

// ✅ Good: Create new component or use event communication
class StatisticsTab extends TabComponent {
    // ... existing statistics code ...
    
    handleAchievementUpdate(data) {
        // Use event bus to notify achievement component
        this.eventBus.emit('achievement-progress-updated', data);
    }
}

class AchievementsTab extends TabComponent {
    setupEventListeners() {
        // Listen for achievement updates
        this.eventBus.on('achievement-progress-updated', this.handleProgressUpdate);
    }
}
```

##### Refactoring Large Components
```javascript
// If a component grows beyond 2,500 words, split it:

// Before: Large component (3,000+ words)
class LargeStatisticsTab extends TabComponent {
    // 100+ methods handling statistics, rendering, filtering, etc.
}

// After: Split into focused components
class StatisticsTab extends TabComponent {        // Coordinator (900 words)
    // Component coordination and lifecycle
}

class StatisticsFilterUI extends BaseComponent { // Filter UI (1,000 words)
    // Filter interface and logic
}

class StatisticsRenderer extends BaseComponent { // Rendering (1,800 words)
    // Statistics display logic
}
```

#### 2. Dependency Management

##### Component Dependencies
```javascript
// Components should only depend on:
// 1. Base classes (TabComponent, BaseComponent)
// 2. Infrastructure (EventBus, SceneState)
// 3. Game engine interfaces
// 4. Specific domain services

// ✅ Good dependency pattern
import { TabComponent } from './TabComponent.js';

export class StatisticsTab extends TabComponent {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        // Use injected dependencies only
    }
}

// ❌ Bad: Direct component-to-component dependencies
import { AchievementsTab } from './AchievementsTab.js';

export class StatisticsTab extends TabComponent {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        this.achievementsTab = new AchievementsTab(); // Don't do this
    }
}
```

##### Managing Component Interactions
```javascript
// Use event bus for component communication
// Component A (emitter)
class StatisticsTab extends TabComponent {
    updateStatistics(newData) {
        this.statisticsData = newData;
        
        // Notify other components via event bus
        this.eventBus.emit('statistics-updated', {
            data: newData,
            timestamp: Date.now(),
            source: 'StatisticsTab'
        });
    }
}

// Component B (listener)
class AchievementsTab extends TabComponent {
    setupEventListeners() {
        // Listen for statistics updates
        this.eventBus.on('statistics-updated', this.handleStatisticsUpdate.bind(this));
    }
    
    handleStatisticsUpdate(eventData) {
        // React to statistics changes
        this.updateAchievementProgress(eventData.data);
    }
    
    cleanup() {
        // Always clean up listeners
        this.eventBus.off('statistics-updated', this.handleStatisticsUpdate);
        super.cleanup();
    }
}
```

### Performance Best Practices

#### 1. Component Loading Optimization

##### Lazy Loading Implementation
```javascript
// Coordinator managing lazy loading
class UserInfoScene extends Scene {
    getTabComponent(tabName) {
        // Check cache first
        if (this.tabComponents.has(tabName)) {
            const componentData = this.tabComponents.get(tabName);
            componentData.lastAccessTime = Date.now();
            return componentData.instance;
        }
        
        // Create component on demand
        const component = this.createTabComponent(tabName);
        if (component) {
            // Cache with metadata
            this.tabComponents.set(tabName, {
                instance: component,
                lastAccessTime: Date.now(),
                loadTime: Date.now()
            });
            
            // Initialize after caching
            component.initialize();
        }
        
        return component;
    }
    
    // Automatic cleanup of unused components
    cleanupUnusedComponents() {
        const TIMEOUT = 60000; // 60 seconds
        const now = Date.now();
        
        for (const [tabName, data] of this.tabComponents.entries()) {
            if (tabName !== this.currentTab && 
                now - data.lastAccessTime > TIMEOUT) {
                
                // Clean up component
                data.instance.cleanup();
                this.tabComponents.delete(tabName);
                
                console.log(`Cleaned up unused component: ${tabName}`);
            }
        }
    }
}
```

#### 2. Event Bus Optimization

##### Efficient Event Handling
```javascript
// Use specific event names to avoid unnecessary processing
class ComponentEventBus {
    emit(eventName, data) {
        // Only notify relevant listeners
        const listeners = this.listeners.get(eventName);
        if (!listeners || listeners.length === 0) {
            return; // No listeners, skip processing
        }
        
        // Process listeners with error handling
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
                // Consider removing problematic listeners
            }
        });
    }
    
    // Batch event emissions for related updates
    emitBatch(events) {
        events.forEach(({ eventName, data }) => {
            this.emit(eventName, data);
        });
    }
}
```

#### 3. Memory Management Best Practices

##### Component Memory Lifecycle
```javascript
class TabComponent {
    cleanup() {
        // 1. Remove event listeners
        this.removeAllEventListeners();
        
        // 2. Clear data references
        this.clearDataReferences();
        
        // 3. Clean up sub-components
        this.cleanupSubComponents();
        
        // 4. Clear DOM-like references
        this.clearRenderReferences();
        
        // 5. Mark as cleaned up
        this.isCleanedUp = true;
    }
    
    removeAllEventListeners() {
        // Remove all registered event listeners
        this.registeredEvents.forEach(({ eventName, callback }) => {
            this.eventBus.off(eventName, callback);
        });
        this.registeredEvents.clear();
    }
    
    clearDataReferences() {
        // Clear large data objects
        this.statisticsData = null;
        this.cachedData = null;
        this.renderCache = null;
    }
    
    cleanupSubComponents() {
        // Recursively clean up sub-components
        Object.values(this.subComponents).forEach(component => {
            if (component && component.cleanup) {
                component.cleanup();
            }
        });
        this.subComponents = {};
    }
}
```

### Migration Path for Other Large Files

#### Applying This Workflow to Other Files

Based on the UserInfoScene refactoring success, these files are candidates for similar optimization:

1. **MobilePerformanceOptimizer.js** (~2,000+ lines)
   - Split into device-specific optimizers
   - Extract performance monitoring components
   - Separate battery and memory management

2. **StatisticsManager.js** (~1,500+ lines)  
   - Split into collection, analysis, and storage components
   - Extract specific statistic calculators
   - Separate export/import functionality

3. **AchievementManager.js** (~1,200+ lines)
   - Split into tracking, validation, and notification components
   - Extract achievement definition management
   - Separate progress tracking logic

#### Migration Workflow Template

```bash
# 1. Analysis phase
./scripts/analyze-large-file.sh src/path/to/LargeFile.js

# 2. Create component structure
mkdir -p src/path/to/components
mkdir -p src/path/to/components/infrastructure
mkdir -p src/path/to/components/specific-domain

# 3. Extract components iteratively
# - Start with most isolated functionality
# - Extract one component at a time
# - Test after each extraction
# - Maintain backward compatibility

# 4. Validation
npm test -- --testPathPattern="LargeFile"
./scripts/validate-ai-compatibility.sh src/path/to/components/

# 5. Documentation update
# Update relevant documentation files
```

### Conclusion

This development workflow guide establishes a sustainable, AI-tool-friendly approach to component-based development. The patterns established through the UserInfoScene refactoring provide a foundation for:

1. **Maintainable Code**: Components with single responsibilities
2. **AI Tool Integration**: Files within optimal token limits  
3. **Parallel Development**: Independent component development
4. **Performance Optimization**: Lazy loading and efficient resource management
5. **Scalable Architecture**: Reusable patterns for other large files

By following these guidelines, developers can maintain the benefits achieved in the UserInfoScene optimization while extending the same patterns throughout the codebase.