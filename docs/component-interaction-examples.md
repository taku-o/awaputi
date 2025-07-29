# Component Interaction Examples
## UserInfoScene Component System Patterns

### Overview

This document provides practical examples of how components interact within the UserInfoScene refactored architecture. These patterns can be applied to other component-based systems in the project.

### Basic Component Interaction Patterns

#### 1. Component Registration and Initialization

```javascript
// UserInfoScene.js - Component coordinator
class UserInfoScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.initializeComponentSystem();
    }
    
    initializeComponentSystem() {
        // Create shared infrastructure
        this.eventBus = new ComponentEventBus();
        this.componentState = new ComponentState(this);
        
        // Component storage with lazy loading
        this.tabComponents = new Map();
        this.dialogManager = new DialogManager(
            this.gameEngine, 
            this.eventBus, 
            this.componentState
        );
        
        // Setup coordinator event listeners
        this.setupCoordinatorEvents();
    }
    
    setupCoordinatorEvents() {
        // Listen for component-level events
        this.eventBus.on('tab-switch-requested', (data) => {
            this.switchTab(data.targetTab);
        });
        
        this.eventBus.on('dialog-requested', (data) => {
            this.dialogManager.openDialog(data.type, data.data);
        });
        
        this.eventBus.on('error-occurred', (data) => {
            this.setErrorMessage(data.message);
        });
    }
}
```

#### 2. Lazy Component Loading with Caching

```javascript
// Lazy loading pattern with automatic cleanup
getTabComponent(tabName) {
    // Check if component already exists
    if (!this.tabComponents.has(tabName)) {
        const component = this.createTabComponent(tabName);
        if (component) {
            // Store with metadata
            this.tabComponents.set(tabName, {
                instance: component,
                lastAccessTime: Date.now(),
                createdAt: Date.now()
            });
            
            // Initialize component
            component.initialize();
        }
    }
    
    // Update access time for cleanup management
    const componentData = this.tabComponents.get(tabName);
    if (componentData) {
        componentData.lastAccessTime = Date.now();
        return componentData.instance;
    }
    
    return null;
}

createTabComponent(tabName) {
    // Factory pattern for component creation
    switch (tabName) {
        case 'statistics':
            return new StatisticsTab(this.gameEngine, this.eventBus, this.componentState);
        case 'achievements':
            return new AchievementsTab(this.gameEngine, this.eventBus, this.componentState);
        case 'management':
            return new ManagementTab(this.gameEngine, this.eventBus, this.componentState);
        case 'help':
            return new HelpTab(this.gameEngine, this.eventBus, this.componentState);
        default:
            console.warn(`Unknown tab component: ${tabName}`);
            return null;
    }
}
```

#### 3. Event-Driven Component Communication

```javascript
// Statistics component emitting data update event
class StatisticsTab extends TabComponent {
    async loadStatisticsData(period = 'all') {
        try {
            const statisticsData = await this.gameEngine.statisticsManager
                .getDetailedStatistics(period);
            
            // Update local state
            this.statisticsData = statisticsData;
            
            // Update shared state
            this.sceneState.updateSharedData('statistics', statisticsData);
            
            // Emit event for other components
            this.eventBus.emit('statistics-data-updated', {
                period: period,
                data: statisticsData,
                timestamp: Date.now()
            });
            
        } catch (error) {
            // Emit error event
            this.eventBus.emit('error-occurred', {
                component: 'StatisticsTab',
                method: 'loadStatisticsData',
                error: error.message
            });
        }
    }
    
    handleFilterChange(filterData) {
        // React to filter changes from UI component
        this.currentPeriodFilter = filterData.period;
        this.loadStatisticsData(filterData.period);
        
        // Emit filter change event
        this.eventBus.emit('statistics-filter-applied', {
            filter: filterData,
            component: 'StatisticsTab'
        });
    }
}

// Other components listening for statistics updates
class AchievementsTab extends TabComponent {
    initialize() {
        super.initialize();
        
        // Listen for statistics updates to update achievement progress
        this.eventBus.on('statistics-data-updated', this.handleStatisticsUpdate.bind(this));
    }
    
    handleStatisticsUpdate(eventData) {
        // Update achievement progress based on new statistics
        if (this.achievementsData) {
            this.updateAchievementProgress(eventData.data);
            this.refreshDisplay();
        }
    }
    
    cleanup() {
        // Clean up event listeners
        this.eventBus.off('statistics-data-updated', this.handleStatisticsUpdate);
        super.cleanup();
    }
}
```

### Advanced Interaction Patterns

#### 4. Shared State Management

```javascript
// SceneState - Central state management
class SceneState {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // Shared application state
        this.currentTab = 'statistics';
        this.userData = null;
        this.statisticsData = null;
        this.achievementsData = null;
        this.accessibilitySettings = null;
        
        // Component-specific state storage
        this.componentState = new Map();
        
        // State change listeners
        this.stateListeners = new Map();
    }
    
    // Component state isolation
    getComponentState(componentName) {
        if (!this.componentState.has(componentName)) {
            this.componentState.set(componentName, {
                initialized: false,
                settings: {},
                cache: new Map(),
                lastUpdate: null
            });
        }
        return this.componentState.get(componentName);
    }
    
    // Shared state updates with change notification
    updateSharedData(dataType, data, emitEvent = true) {
        const oldData = this[`${dataType}Data`];
        this[`${dataType}Data`] = data;
        
        // Notify listeners of state changes
        if (emitEvent && this.stateListeners.has(dataType)) {
            this.stateListeners.get(dataType).forEach(callback => {
                try {
                    callback(data, oldData);
                } catch (error) {
                    console.error(`Error in state listener for ${dataType}:`, error);
                }
            });
        }
    }
    
    // State change subscription
    onStateChange(dataType, callback) {
        if (!this.stateListeners.has(dataType)) {
            this.stateListeners.set(dataType, []);
        }
        this.stateListeners.get(dataType).push(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.stateListeners.get(dataType);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
}

// Component using shared state
class StatisticsTab extends TabComponent {
    initialize() {
        super.initialize();
        
        // Subscribe to shared state changes
        this.unsubscribeUserData = this.sceneState.onStateChange('user', (userData) => {
            this.handleUserDataChange(userData);
        });
        
        this.unsubscribeSettings = this.sceneState.onStateChange('accessibility', (settings) => {
            this.handleAccessibilityChange(settings);
        });
        
        // Get component-specific state
        this.componentState = this.sceneState.getComponentState('StatisticsTab');
        this.componentState.initialized = true;
    }
    
    cleanup() {
        // Unsubscribe from state changes
        if (this.unsubscribeUserData) {
            this.unsubscribeUserData();
        }
        if (this.unsubscribeSettings) {
            this.unsubscribeSettings();
        }
        
        super.cleanup();
    }
}
```

#### 5. Dialog System Integration

```javascript
// Dialog interaction pattern
class ManagementTab extends TabComponent {
    render(ctx, x, y, width, height) {
        // Render management interface
        this.renderUserInfo(ctx, x, y, width, height);
        this.renderActionButtons(ctx, x, y, width, height);
    }
    
    handleClick(x, y) {
        // Check for export button click
        if (this.isInExportButtonArea(x, y)) {
            this.requestExportDialog();
            return true;
        }
        
        // Check for import button click
        if (this.isInImportButtonArea(x, y)) {
            this.requestImportDialog();
            return true;
        }
        
        // Check for username change button click
        if (this.isInUsernameButtonArea(x, y)) {
            this.requestUsernameDialog();
            return true;
        }
        
        return false;
    }
    
    requestExportDialog() {
        // Request dialog through event system
        this.eventBus.emit('dialog-requested', {
            type: 'export',
            data: {
                currentUser: this.sceneState.userData,
                availableFormats: ['json', 'csv', 'txt']
            }
        });
    }
    
    requestImportDialog() {
        this.eventBus.emit('dialog-requested', {
            type: 'import',
            data: {
                currentUser: this.sceneState.userData,
                allowedFormats: ['json']
            }
        });
    }
    
    requestUsernameDialog() {
        this.eventBus.emit('dialog-requested', {
            type: 'username',
            data: {
                currentUsername: this.sceneState.userData?.username || ''
            }
        });
    }
}

// Dialog manager handling requests
class DialogManager {
    constructor(gameEngine, eventBus, sceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        this.currentDialog = null;
        this.dialogData = null;
        this.dialogs = new Map();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for dialog requests
        this.eventBus.on('dialog-requested', this.handleDialogRequest.bind(this));
        
        // Listen for dialog completion events
        this.eventBus.on('dialog-completed', this.handleDialogCompleted.bind(this));
        this.eventBus.on('dialog-cancelled', this.handleDialogCancelled.bind(this));
    }
    
    handleDialogRequest(requestData) {
        this.openDialog(requestData.type, requestData.data);
    }
    
    openDialog(dialogType, data = null) {
        // Close current dialog if open
        if (this.currentDialog) {
            this.closeDialog();
        }
        
        // Create or get dialog instance
        const dialog = this.getOrCreateDialog(dialogType);
        if (!dialog) {
            console.error(`Unknown dialog type: ${dialogType}`);
            return;
        }
        
        // Open new dialog
        this.currentDialog = dialogType;
        this.dialogData = data;
        dialog.open(data);
        
        // Notify components
        this.eventBus.emit('dialog-opened', { 
            type: dialogType, 
            data: data 
        });
    }
}
```

#### 6. Sub-Component Management Pattern

```javascript
// Parent component managing sub-components
class StatisticsTab extends TabComponent {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        
        // Sub-component references
        this.filterUI = null;
        this.statisticsRenderer = null;
        this.dashboardRenderer = null;
        
        // State for coordination
        this.currentPeriodFilter = 'all';
        this.statisticsViewMode = 'details';
        this.statisticsData = null;
    }
    
    initialize() {
        super.initialize();
        this.initializeSubComponents();
        this.setupSubComponentEvents();
    }
    
    initializeSubComponents() {
        // Create sub-components
        this.filterUI = new StatisticsFilterUI(
            this.gameEngine, 
            this.eventBus, 
            this.sceneState
        );
        
        this.statisticsRenderer = new StatisticsRenderer(
            this.gameEngine, 
            this.eventBus, 
            this.sceneState
        );
        
        this.dashboardRenderer = new StatisticsDashboardRenderer(
            this.gameEngine, 
            this.eventBus, 
            this.sceneState
        );
        
        // Initialize sub-components
        this.filterUI.initialize();
        this.statisticsRenderer.initialize();
        this.dashboardRenderer.initialize();
    }
    
    setupSubComponentEvents() {
        // Listen for sub-component events
        this.eventBus.on('statistics-filter-changed', this.handleFilterChange.bind(this));
        this.eventBus.on('statistics-view-mode-changed', this.handleViewModeChange.bind(this));
    }
    
    activate() {
        super.activate();
        
        // Activate sub-components
        this.filterUI?.activate();
        
        // Activate renderer based on current mode
        if (this.statisticsViewMode === 'details') {
            this.statisticsRenderer?.activate();
            this.dashboardRenderer?.deactivate();
        } else {
            this.dashboardRenderer?.activate();
            this.statisticsRenderer?.deactivate();
        }
        
        // Load initial data
        this.loadStatisticsData();
    }
    
    deactivate() {
        super.deactivate();
        
        // Deactivate all sub-components
        this.filterUI?.deactivate();
        this.statisticsRenderer?.deactivate();
        this.dashboardRenderer?.deactivate();
    }
    
    cleanup() {
        // Clean up sub-components
        this.filterUI?.cleanup();
        this.statisticsRenderer?.cleanup();
        this.dashboardRenderer?.cleanup();
        
        // Remove event listeners
        this.eventBus.off('statistics-filter-changed', this.handleFilterChange);
        this.eventBus.off('statistics-view-mode-changed', this.handleViewModeChange);
        
        // Clear references
        this.filterUI = null;
        this.statisticsRenderer = null;
        this.dashboardRenderer = null;
        
        super.cleanup();
    }
    
    render(ctx, x, y, width, height) {
        if (!this.isActive) return;
        
        // Render filter UI at top
        const filterHeight = 50;
        this.filterUI?.render(ctx, x, y, width, filterHeight);
        
        // Render content based on view mode
        const contentY = y + filterHeight + 10;
        const contentHeight = height - filterHeight - 10;
        
        if (this.statisticsViewMode === 'details') {
            this.statisticsRenderer?.render(ctx, x, contentY, width, contentHeight);
        } else {
            this.dashboardRenderer?.render(ctx, x, contentY, width, contentHeight);
        }
    }
    
    handleClick(x, y) {
        if (!this.isActive) return false;
        
        // Delegate clicks to appropriate sub-components
        if (this.filterUI?.handleClick(x, y)) {
            return true;
        }
        
        if (this.statisticsViewMode === 'details') {
            return this.statisticsRenderer?.handleClick(x, y) || false;
        } else {
            return this.dashboardRenderer?.handleClick(x, y) || false;
        }
    }
}
```

### Memory Management Patterns

#### 7. Automatic Component Cleanup

```javascript
// Coordinator managing component lifecycle
class UserInfoScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // Component management
        this.tabComponents = new Map();
        this.lastCleanupTime = Date.now();
        this.CLEANUP_INTERVAL = 30000; // 30 seconds
        this.COMPONENT_TIMEOUT = 60000; // 60 seconds
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update active component
        this.updateComponentCoordination(deltaTime);
        
        // Periodic cleanup
        const now = Date.now();
        if (now - this.lastCleanupTime > this.CLEANUP_INTERVAL) {
            this.cleanupUnusedComponents();
            this.lastCleanupTime = now;
        }
    }
    
    cleanupUnusedComponents() {
        const now = Date.now();
        const componentsToRemove = [];
        
        for (const [tabName, componentData] of this.tabComponents.entries()) {
            // Skip current tab (always keep active)
            if (tabName === this.currentTab) {
                continue;
            }
            
            // Skip recently accessed components
            if (now - componentData.lastAccessTime < this.COMPONENT_TIMEOUT) {
                continue;
            }
            
            // Mark for cleanup
            componentsToRemove.push(tabName);
        }
        
        // Cleanup marked components
        componentsToRemove.forEach(tabName => {
            const componentData = this.tabComponents.get(tabName);
            if (componentData && componentData.instance) {
                // Proper cleanup
                if (componentData.instance.cleanup) {
                    componentData.instance.cleanup();
                }
                
                // Remove from map
                this.tabComponents.delete(tabName);
                
                console.log(`Cleaned up unused component: ${tabName}`);
            }
        });
    }
    
    // Force cleanup when scene exits
    exit() {
        // Clean up all components
        for (const [tabName, componentData] of this.tabComponents.entries()) {
            if (componentData.instance && componentData.instance.cleanup) {
                componentData.instance.cleanup();
            }
        }
        
        this.tabComponents.clear();
        
        // Clean up dialog manager
        if (this.dialogManager && this.dialogManager.cleanup) {
            this.dialogManager.cleanup();
        }
        
        super.exit();
    }
}
```

#### 8. Error Handling Patterns

```javascript
// Component with comprehensive error handling
class StatisticsTab extends TabComponent {
    async loadStatisticsData(period = 'all') {
        try {
            // Show loading state
            this.setLoadingState(true);
            
            // Load data with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Data loading timeout')), 10000);
            });
            
            const dataPromise = this.gameEngine.statisticsManager
                .getDetailedStatistics(period);
            
            const statisticsData = await Promise.race([dataPromise, timeoutPromise]);
            
            // Validate data
            if (!this.validateStatisticsData(statisticsData)) {
                throw new Error('Invalid statistics data received');
            }
            
            // Update state
            this.statisticsData = statisticsData;
            this.sceneState.updateSharedData('statistics', statisticsData);
            
            // Emit success event
            this.eventBus.emit('statistics-data-updated', {
                period: period,
                data: statisticsData,
                timestamp: Date.now()
            });
            
            // Clear any previous error
            this.clearError();
            
        } catch (error) {
            // Handle different error types
            this.handleDataLoadError(error, period);
        } finally {
            // Always clear loading state
            this.setLoadingState(false);
        }
    }
    
    handleDataLoadError(error, period) {
        const errorContext = {
            component: 'StatisticsTab',
            method: 'loadStatisticsData',
            period: period,
            timestamp: Date.now()
        };
        
        // Log error for debugging
        console.error('Statistics data loading failed:', error, errorContext);
        
        // Use error handler for user notification
        this.gameEngine.errorHandler.handleError(error, errorContext);
        
        // Emit error event for other components
        this.eventBus.emit('error-occurred', {
            ...errorContext,
            error: error.message,
            recoverable: true
        });
        
        // Set local error state
        this.setError(`統計データの読み込みに失敗しました: ${error.message}`);
        
        // Attempt recovery
        this.attemptDataRecovery(period);
    }
    
    attemptDataRecovery(period) {
        // Try to recover with cached data
        const cachedData = this.getCachedStatistics(period);
        if (cachedData) {
            console.log('Using cached statistics data for recovery');
            this.statisticsData = cachedData;
            this.setError('キャッシュされたデータを表示しています');
            return true;
        }
        
        // Fall back to basic data
        if (period !== 'all') {
            console.log('Falling back to all-time statistics');
            setTimeout(() => this.loadStatisticsData('all'), 2000);
            return true;
        }
        
        return false;
    }
    
    validateStatisticsData(data) {
        return data && 
               typeof data === 'object' &&
               data.basic &&
               data.bubbles &&
               data.combos &&
               data.stages;
    }
}
```

### Performance Optimization Patterns

#### 9. Efficient Rendering with Dirty Flags

```javascript
// Component with optimized rendering
class StatisticsRenderer extends BaseComponent {
    constructor(gameEngine, eventBus, sceneState) {
        super(gameEngine, eventBus, sceneState);
        
        // Dirty flags for selective rendering
        this.renderFlags = {
            basic: true,
            bubbles: true,
            combos: true,
            stages: true,
            layout: true
        };
        
        // Cached render data
        this.cachedRenderData = {
            basic: null,
            bubbles: null,
            combos: null,
            stages: null
        };
    }
    
    handleStatisticsUpdate(eventData) {
        // Mark sections as dirty based on what changed
        const oldData = this.statisticsData;
        this.statisticsData = eventData.data;
        
        if (!oldData || oldData.basic !== eventData.data.basic) {
            this.renderFlags.basic = true;
        }
        if (!oldData || oldData.bubbles !== eventData.data.bubbles) {
            this.renderFlags.bubbles = true;
        }
        if (!oldData || oldData.combos !== eventData.data.combos) {
            this.renderFlags.combos = true;
        }
        if (!oldData || oldData.stages !== eventData.data.stages) {
            this.renderFlags.stages = true;
        }
    }
    
    render(ctx, x, y, width, height) {
        if (!this.isActive || !this.statisticsData) return;
        
        // Only render sections that are dirty
        let currentY = y;
        
        if (this.renderFlags.basic) {
            currentY = this.renderBasicStats(ctx, x, currentY, width);
            this.renderFlags.basic = false;
        }
        
        if (this.renderFlags.bubbles) {
            currentY = this.renderBubbleStats(ctx, x, currentY, width);
            this.renderFlags.bubbles = false;
        }
        
        if (this.renderFlags.combos) {
            currentY = this.renderComboStats(ctx, x, currentY, width);
            this.renderFlags.combos = false;
        }
        
        if (this.renderFlags.stages) {
            currentY = this.renderStageStats(ctx, x, currentY, width);
            this.renderFlags.stages = false;
        }
        
        // Clear layout flag
        this.renderFlags.layout = false;
    }
    
    // Force full re-render (for accessibility or theme changes)
    invalidateAll() {
        Object.keys(this.renderFlags).forEach(flag => {
            this.renderFlags[flag] = true;
        });
        
        // Clear cached data
        Object.keys(this.cachedRenderData).forEach(key => {
            this.cachedRenderData[key] = null;
        });
    }
}
```

These examples demonstrate the comprehensive patterns established in the UserInfoScene refactoring. They show how to build maintainable, performant, and AI-tool-friendly component architectures that can be applied throughout the project.