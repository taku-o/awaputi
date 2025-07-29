# AchievementManager.js Structure Analysis
## Task 10.3: Component Extraction Plan

### Overview

This document analyzes the structure of `AchievementManager.js` and provides a component extraction plan following the patterns established in the UserInfoScene refactoring (Issue #52).

### Current File Metrics

- **File Size**: 2,230 lines, 5,137 words
- **Status**: EXCEEDS AI tool limits (target: <2,500 words)
- **Location**: `src/core/AchievementManager.js`
- **Complexity**: High - comprehensive achievement system with progress tracking, notifications, and analytics

### File Structure Analysis

#### Identified Functional Areas

Based on code analysis, the file contains the following major functional areas:

1. **Achievement Definition & Management** (~900 words)
   - Achievement initialization and configuration
   - Achievement metadata and conditions
   - Achievement categorization and organization
   - Basic achievement data structure management

2. **Progress Tracking & Evaluation** (~1,200 words)
   - Real-time progress tracking during gameplay
   - Achievement condition evaluation
   - Complex condition processing with engine integration
   - Time-based condition tracking and reset

3. **Notification System** (~600 words)
   - Achievement unlock notifications
   - Progress milestone notifications
   - Notification queue management
   - Duplicate notification prevention

4. **Data Persistence & Storage** (~1,000 words)
   - Save/load operations with validation
   - Data integrity checks and recovery
   - Backup creation and restoration
   - Storage quota management

5. **Performance Optimization** (~800 words)
   - Caching and throttling mechanisms
   - Batch processing for updates
   - Performance statistics tracking
   - Optimization configuration management

6. **Analytics & Statistics** (~600 words)
   - Achievement completion analytics
   - Progress statistics and insights
   - Reward calculation and tracking
   - Performance monitoring

### Component Extraction Plan

#### Proposed Component Architecture

```
AchievementManager.js (Coordinator - ~1,000 words)
├── AchievementDefinitionManager.js (~900 words)
│   ├── AchievementRegistry.js (~400 words)
│   ├── AchievementValidator.js (~300 words)
│   └── AchievementCategorizer.js (~200 words)
├── AchievementProgressTracker.js (~1,200 words)
│   ├── ProgressEvaluator.js (~400 words)
│   ├── ConditionProcessor.js (~400 words)
│   └── TimeBasedTracker.js (~400 words)
├── AchievementNotificationSystem.js (~600 words)
│   ├── NotificationQueue.js (~300 words)
│   └── NotificationRenderer.js (~300 words)
├── AchievementStorage.js (~1,000 words)
│   ├── DataValidator.js (~300 words)
│   ├── BackupManager.js (~350 words)
│   └── StorageManager.js (~350 words)
├── AchievementPerformanceOptimizer.js (~800 words)
│   ├── CacheManager.js (~400 words)
│   └── BatchProcessor.js (~400 words)
└── AchievementAnalytics.js (~600 words)
    ├── StatisticsCalculator.js (~300 words)
    └── InsightGenerator.js (~300 words)
```

#### Phase-by-Phase Extraction Strategy

##### Phase 1: Infrastructure Setup
1. **Create Component Base Classes**
   ```javascript
   // src/core/components/AchievementComponent.js
   export class AchievementComponent {
       constructor(achievementManager, eventBus, sharedState) {
           this.achievementManager = achievementManager;
           this.eventBus = eventBus;
           this.sharedState = sharedState;
       }
       
       initialize() { /* Override in subclasses */ }
       activate() { /* Override in subclasses */ }
       deactivate() { /* Override in subclasses */ }
       cleanup() { /* Override in subclasses */ }
   }
   ```

2. **Create Achievement Event Bus and Shared State**
   ```javascript
   // src/core/components/AchievementEventBus.js
   // src/core/components/AchievementState.js
   ```

##### Phase 2: Achievement Definition System (Lines 1-500)
Extract achievement definition and management into focused components:

```javascript
// src/core/components/AchievementDefinitionManager.js
export class AchievementDefinitionManager extends AchievementComponent {
    constructor(achievementManager, eventBus, sharedState) {
        super(achievementManager, eventBus, sharedState);
        
        // Sub-components
        this.registry = null;
        this.validator = null;
        this.categorizer = null;
    }
    
    initializeAchievements() {
        // Coordinate achievement initialization
        const achievements = this.registry.loadAchievementDefinitions();
        const validatedAchievements = this.validator.validateAchievements(achievements);
        const categorizedAchievements = this.categorizer.categorize(validatedAchievements);
        
        this.sharedState.achievements = categorizedAchievements;
        this.eventBus.emit('achievements-initialized', { 
            count: Object.keys(categorizedAchievements).length 
        });
    }
    
    getAchievementsByCategory(category) {
        return this.categorizer.getByCategory(category);
    }
}

// src/core/components/AchievementRegistry.js
export class AchievementRegistry extends AchievementComponent {
    loadAchievementDefinitions() {
        // Extract achievement definitions (lines 44-474)
        return {
            // Basic achievements
            firstBubble: this.createBasicAchievement('firstBubble', {
                name: '初めての泡',
                description: '初めて泡を割る',
                condition: { type: 'bubblesPopped', value: 1 },
                reward: { ap: 10 }
            }),
            
            // Score achievements
            firstThousand: this.createScoreAchievement('firstThousand', {
                name: '千点突破',
                description: '1回のゲームで1000点を獲得',
                condition: { type: 'singleGameScore', value: 1000 },
                reward: { ap: 25 }
            }),
            
            // ... other achievement definitions
        };
    }
    
    createBasicAchievement(id, config) {
        return {
            id,
            icon: '🎈',
            type: 'single',
            category: 'basic',
            ...config
        };
    }
}

// src/core/components/AchievementValidator.js
export class AchievementValidator extends AchievementComponent {
    validateAchievements(achievements) {
        const validatedAchievements = {};
        
        Object.entries(achievements).forEach(([id, achievement]) => {
            if (this.isValidAchievement(achievement)) {
                validatedAchievements[id] = achievement;
            } else {
                console.warn(`Invalid achievement definition: ${id}`);
            }
        });
        
        return validatedAchievements;
    }
    
    isValidAchievement(achievement) {
        return achievement.id &&
               achievement.name &&
               achievement.description &&
               achievement.condition &&
               achievement.reward;
    }
}
```

##### Phase 3: Progress Tracking System (Lines 500-1200)
```javascript
// src/core/components/AchievementProgressTracker.js
export class AchievementProgressTracker extends AchievementComponent {
    constructor(achievementManager, eventBus, sharedState) {
        super(achievementManager, eventBus, sharedState);
        
        // Sub-components
        this.progressEvaluator = null;
        this.conditionProcessor = null;
        this.timeBasedTracker = null;
        
        // Progress tracking state
        this.progressData = {};
        this.updateQueue = [];
    }
    
    updateProgress(eventType, data) {
        // Extract progress update logic (lines 475-524)
        this.updateQueue.push({ eventType, data, timestamp: Date.now() });
        
        // Process updates in batches for performance
        this.scheduleProgressProcessing();
        
        this.eventBus.emit('progress-update-queued', { 
            eventType, 
            queueSize: this.updateQueue.length 
        });
    }
    
    processBatchUpdates() {
        // Extract batch processing logic (lines 493-523)
        const batch = this.updateQueue.splice(0, this.performanceConfig.batchSize);
        
        batch.forEach(update => {
            this.processUpdateEvent(update.eventType, update.data);
        });
        
        // Continue processing if more updates are queued
        if (this.updateQueue.length > 0) {
            setTimeout(() => this.processBatchUpdates(), 0);
        }
    }
    
    getProgress(achievementId) {
        return this.progressEvaluator.getProgress(achievementId);
    }
}

// src/core/components/ProgressEvaluator.js
export class ProgressEvaluator extends AchievementComponent {
    evaluateProgress(achievement, eventType, data) {
        // Determine if achievement is affected by this event
        if (!this.isRelevantEvent(achievement, eventType)) {
            return null;
        }
        
        // Calculate current progress
        const currentProgress = this.calculateProgress(achievement, data);
        
        // Check if achievement is complete
        const isComplete = this.checkCompletion(achievement, currentProgress);
        
        return {
            current: currentProgress.current,
            target: currentProgress.target,
            percentage: (currentProgress.current / currentProgress.target) * 100,
            isComplete
        };
    }
    
    calculateProgress(achievement, data) {
        // Extract progress calculation logic (lines 1470-1526)
        const condition = achievement.condition;
        
        switch (condition.type) {
            case 'bubblesPopped':
                return {
                    current: this.sharedState.progressData.totalBubblesPopped || 0,
                    target: condition.value
                };
            
            case 'singleGameScore':
                return {
                    current: data.score || 0,
                    target: condition.value
                };
            
            // ... other condition types
            
            default:
                return { current: 0, target: 1 };
        }
    }
}

// src/core/components/ConditionProcessor.js
export class ConditionProcessor extends AchievementComponent {
    checkAchievementCondition(achievement, eventType, data) {
        // Extract condition checking logic
        const condition = achievement.condition;
        
        if (condition.complex) {
            return this.evaluateComplexConditions(achievement, data);
        }
        
        return this.evaluateSimpleCondition(condition, eventType, data);
    }
    
    evaluateComplexConditions(achievement, gameData) {
        // Extract complex condition logic (lines 1002-1014)
        try {
            if (!achievement.condition || !achievement.condition.complex) {
                return false;
            }
            
            return this.progressEngine.evaluateComplexConditions(gameData, achievement.condition);
            
        } catch (error) {
            console.error(`Error evaluating complex conditions for ${achievement.id}:`, error);
            return false;
        }
    }
}

// src/core/components/TimeBasedTracker.js
export class TimeBasedTracker extends AchievementComponent {
    trackTimeBasedConditions() {
        // Extract time-based tracking logic (lines 1019-1051)
        const timeBasedAchievements = this.getTimeBasedAchievements();
        
        timeBasedAchievements.forEach(achievement => {
            this.checkTimeWindow(achievement);
        });
    }
    
    checkTimeWindow(achievement) {
        const progress = this.sharedState.progressData[achievement.id];
        if (!progress || !progress.lastUpdated) {
            return;
        }
        
        const timeCondition = {
            type: 'time_window',
            windowMs: achievement.condition.timeWindow
        };
        
        const isWithinTimeWindow = this.evaluateTimeCondition(
            progress.lastUpdated,
            timeCondition
        );
        
        if (!isWithinTimeWindow) {
            this.resetAchievementProgress(achievement.id);
            this.eventBus.emit('achievement-progress-reset', { 
                achievementId: achievement.id,
                reason: 'time_window_expired'
            });
        }
    }
}
```

##### Phase 4: Notification System (Lines 1200-1500)
```javascript
// src/core/components/AchievementNotificationSystem.js
export class AchievementNotificationSystem extends AchievementComponent {
    constructor(achievementManager, eventBus, sharedState) {
        super(achievementManager, eventBus, sharedState);
        
        // Sub-components
        this.notificationQueue = null;
        this.notificationRenderer = null;
        
        // Notification state
        this.notifications = [];
        this.maxNotifications = 5;
    }
    
    showAchievementUnlocked(achievement) {
        // Create achievement unlock notification
        const notification = {
            id: `achievement_${achievement.id}`,
            type: 'achievement_unlocked',
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            reward: achievement.reward,
            timestamp: Date.now()
        };
        
        this.addNotification(notification);
        this.eventBus.emit('achievement-unlocked', { achievement, notification });
    }
    
    addNotification(notification) {
        // Extract notification addition logic (lines 2075-2091)
        if (this.notifications.length >= this.maxNotifications) {
            this.notifications.shift(); // Remove oldest notification
        }
        
        // Prevent duplicate notifications
        const isDuplicate = this.notifications.some(n => 
            n.id === notification.id && 
            (Date.now() - n.timestamp) < 1000
        );
        
        if (!isDuplicate) {
            this.notifications.push(notification);
            this.notificationRenderer.render(notification);
        }
    }
}

// src/core/components/NotificationQueue.js
export class NotificationQueue extends AchievementComponent {
    constructor(achievementManager, eventBus, sharedState) {
        super(achievementManager, eventBus, sharedState);
        
        this.queue = [];
        this.processing = false;
        this.processingDelay = 1000; // 1 second between notifications
    }
    
    enqueue(notification) {
        this.queue.push(notification);
        
        if (!this.processing) {
            this.processQueue();
        }
    }
    
    async processQueue() {
        this.processing = true;
        
        while (this.queue.length > 0) {
            const notification = this.queue.shift();
            
            // Show notification
            this.eventBus.emit('show-notification', notification);
            
            // Wait before showing next notification
            await this.delay(this.processingDelay);
        }
        
        this.processing = false;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

##### Phase 5: Data Persistence System (Lines 1500-2000)
```javascript
// src/core/components/AchievementStorage.js
export class AchievementStorage extends AchievementComponent {
    constructor(achievementManager, eventBus, sharedState) {
        super(achievementManager, eventBus, sharedState);
        
        // Sub-components
        this.dataValidator = null;
        this.backupManager = null;
        this.storageManager = null;
    }
    
    save() {
        // Extract save logic (lines 1560-1582)
        try {
            const dataToSave = this.prepareDataForSave();
            
            // Validate data before saving
            if (!this.dataValidator.validate(dataToSave)) {
                throw new Error('Invalid data format for save');
            }
            
            // Create backup
            this.backupManager.createBackup(dataToSave);
            
            // Save main data
            this.storageManager.save('bubblePop_achievements', dataToSave);
            
            this.eventBus.emit('achievements-saved', { 
                timestamp: Date.now(),
                dataSize: JSON.stringify(dataToSave).length
            });
            
        } catch (error) {
            console.error('Failed to save achievement data:', error);
            this.handleSaveError(error);
        }
    }
    
    async load() {
        // Extract load logic
        try {
            const data = this.storageManager.load('bubblePop_achievements');
            
            if (data && this.dataValidator.validate(data)) {
                this.applyLoadedData(data);
                this.eventBus.emit('achievements-loaded', { 
                    unlockedCount: this.sharedState.unlockedAchievements.size 
                });
            } else {
                await this.attemptDataRecovery();
            }
            
        } catch (error) {
            console.error('Failed to load achievement data:', error);
            await this.attemptDataRecovery();
        }
    }
}

// src/core/components/BackupManager.js
export class BackupManager extends AchievementComponent {
    createBackup(data) {
        // Extract backup creation logic (lines 1608-1625)
        try {
            const backupData = {
                ...data,
                backupTimestamp: Date.now(),
                version: '1.0'
            };
            
            // Rotate backups
            this.rotateBackups();
            
            // Save new backup
            this.storageManager.save('bubblePop_achievements_backup', backupData);
            
            console.log('Achievement backup created successfully');
            
        } catch (error) {
            console.error('Failed to create achievement backup:', error);
        }
    }
    
    rotateBackups() {
        // Move current backup to old backup slot
        try {
            const currentBackup = this.storageManager.load('bubblePop_achievements_backup');
            if (currentBackup) {
                this.storageManager.save('bubblePop_achievements_backup_old', currentBackup);
            }
        } catch (error) {
            console.warn('Failed to rotate backups:', error);
        }
    }
}
```

##### Phase 6: Performance Optimization System (Lines 2000-2230)
```javascript
// src/core/components/AchievementPerformanceOptimizer.js
export class AchievementPerformanceOptimizer extends AchievementComponent {
    constructor(achievementManager, eventBus, sharedState) {
        super(achievementManager, eventBus, sharedState);
        
        // Sub-components
        this.cacheManager = null;
        this.batchProcessor = null;
        
        // Performance configuration
        this.performanceConfig = {
            batchSize: 10,
            throttleDelay: 100,
            cacheTimeout: 5000,
            maxNotifications: 5
        };
        
        // Performance statistics
        this.performanceStats = {
            updateCount: 0,
            averageUpdateTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            batchProcessingCount: 0
        };
    }
    
    getRelevantAchievements(eventType) {
        // Extract relevance checking with caching (lines 1079-1105)
        const cacheKey = `relevant_${eventType}`;
        
        // Check cache first
        const cached = this.cacheManager.get(cacheKey);
        if (cached) {
            this.performanceStats.cacheHits++;
            return cached;
        }
        
        this.performanceStats.cacheMisses++;
        
        // Calculate relevant achievements
        const relevantAchievements = this.calculateRelevantAchievements(eventType);
        
        // Cache results
        this.cacheManager.set(cacheKey, relevantAchievements, this.performanceConfig.cacheTimeout);
        
        return relevantAchievements;
    }
    
    getPerformanceStats() {
        // Extract performance statistics (lines 2096-2130)
        const now = Date.now();
        
        return {
            ...this.performanceStats,
            cacheSize: this.cacheManager.size(),
            queueSize: this.batchProcessor.getQueueSize(),
            lastUpdateTime: this.lastUpdateTime,
            uptime: now - this.startTime
        };
    }
}

// src/core/components/CacheManager.js
export class CacheManager extends AchievementComponent {
    constructor(achievementManager, eventBus, sharedState) {
        super(achievementManager, eventBus, sharedState);
        
        this.cache = new Map();
        this.timeouts = new Map();
    }
    
    set(key, value, timeout = 5000) {
        // Set cache value with timeout
        this.cache.set(key, value);
        
        // Clear existing timeout
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
        }
        
        // Set new timeout
        const timeoutId = setTimeout(() => {
            this.cache.delete(key);
            this.timeouts.delete(key);
        }, timeout);
        
        this.timeouts.set(key, timeoutId);
    }
    
    get(key) {
        return this.cache.get(key);
    }
    
    size() {
        return this.cache.size;
    }
    
    clear() {
        // Clear all timeouts
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        
        // Clear caches
        this.cache.clear();
        this.timeouts.clear();
    }
}
```

### Coordinator Refactoring

The main `AchievementManager.js` becomes a lightweight coordinator:

```javascript
// src/core/AchievementManager.js (Refactored)
export class AchievementManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initializeComponentSystem();
        
        // Component management
        this.components = new Map();
        this.activeComponents = new Set();
        
        // Legacy state for backward compatibility
        this.achievements = {};
        this.unlockedAchievements = new Set();
        this.progressData = {};
        this.notifications = [];
    }
    
    initializeComponentSystem() {
        this.eventBus = new AchievementEventBus();
        this.sharedState = new AchievementState(this);
        this.setupCoordinatorEvents();
    }
    
    // Lazy loading pattern from UserInfoScene
    getComponent(componentName) {
        if (!this.components.has(componentName)) {
            const component = this.createComponent(componentName);
            if (component) {
                this.components.set(componentName, {
                    instance: component,
                    lastAccessTime: Date.now()
                });
                component.initialize();
            }
        }
        
        const componentData = this.components.get(componentName);
        if (componentData) {
            componentData.lastAccessTime = Date.now();
            return componentData.instance;
        }
        
        return null;
    }
    
    createComponent(componentName) {
        switch (componentName) {
            case 'definitions':
                return new AchievementDefinitionManager(this, this.eventBus, this.sharedState);
            case 'progressTracker':
                return new AchievementProgressTracker(this, this.eventBus, this.sharedState);
            case 'notifications':
                return new AchievementNotificationSystem(this, this.eventBus, this.sharedState);
            case 'storage':
                return new AchievementStorage(this, this.eventBus, this.sharedState);
            case 'performance':
                return new AchievementPerformanceOptimizer(this, this.eventBus, this.sharedState);
            case 'analytics':
                return new AchievementAnalytics(this, this.eventBus, this.sharedState);
            default:
                return null;
        }
    }
    
    // Maintain backward compatibility
    updateProgress(eventType, data) {
        return this.getComponent('progressTracker').updateProgress(eventType, data);
    }
    
    getAchievements() {
        // Ensure achievements are initialized
        if (Object.keys(this.achievements).length === 0) {
            this.getComponent('definitions').initializeAchievements();
        }
        return this.achievements;
    }
    
    save() {
        return this.getComponent('storage').save();
    }
    
    load() {
        return this.getComponent('storage').load();
    }
    
    getStatistics() {
        return this.getComponent('analytics').getStatistics();
    }
    
    // ... other legacy method delegations
}
```

### Benefits of Component Extraction

#### File Size Optimization
- **Main coordinator**: ~1,000 words (AI-tool friendly)
- **All components**: <1,200 words each (optimal for AI tools)
- **Total reduction**: ~80% reduction in largest file size
- **AI tool compatibility**: All files within token limits

#### Development Workflow Improvements
1. **Focused Development**: Work on specific achievement areas independently
2. **Parallel Development**: Multiple developers can work on different achievement systems
3. **Easier Testing**: Unit test individual achievement components
4. **Better Maintenance**: Changes to progress tracking don't affect notifications
5. **Enhanced Reusability**: Components can be reused in other achievement systems

#### Architecture Benefits
1. **Separation of Concerns**: Each component handles one aspect of achievements
2. **Event-Driven**: Loose coupling between achievement systems
3. **Lazy Loading**: Load achievement components only when needed
4. **Memory Management**: Automatic cleanup of unused achievement components
5. **Performance Optimization**: Focused optimization per component

### Implementation Timeline

#### Week 1-2: Infrastructure and Achievement Definitions
- Set up component infrastructure (EventBus, State, Base classes)
- Extract AchievementDefinitionManager and registry components
- Create comprehensive tests for achievement definitions

#### Week 3-4: Progress Tracking System
- Extract AchievementProgressTracker and evaluation components
- Implement progress calculation and condition processing
- Add progress tracking testing and validation

#### Week 5-6: Notification and Storage Systems
- Extract AchievementNotificationSystem and storage components
- Implement notification queue and persistence functionality
- Test notification delivery and data integrity

#### Week 7-8: Performance Optimization and Analytics
- Extract AchievementPerformanceOptimizer and analytics components
- Implement caching, batching, and statistics functionality
- Add performance testing and optimization validation

#### Week 9-10: Integration and Validation
- Integrate all components with main coordinator
- Validate backward compatibility
- Performance testing and optimization
- Documentation updates

### Testing Strategy

#### Component Testing
```javascript
// tests/core/components/AchievementProgressTracker.test.js
describe('AchievementProgressTracker', () => {
    test('should track achievement progress correctly', () => {
        // Test progress tracking logic
    });
    
    test('should handle batch updates efficiently', () => {
        // Test batch processing
    });
});
```

#### Integration Testing
```javascript
// tests/integration/AchievementManager.test.js
describe('AchievementManager Integration', () => {
    test('should coordinate achievement tracking and notifications', () => {
        // Test full achievement workflow
    });
});
```

#### Performance Testing
- Benchmark progress update performance
- Test caching effectiveness
- Verify notification system performance

### Migration Risks and Mitigation

#### Risks
1. **Progress Data Integrity**: Achievement progress is critical for user engagement
2. **Performance Regression**: Achievement updates occur frequently during gameplay
3. **Notification Reliability**: Achievement unlocks must be reliably delivered

#### Mitigation Strategies
1. **Incremental Migration**: Extract one component at a time with comprehensive testing
2. **Data Validation**: Implement robust validation at all component boundaries
3. **Performance Monitoring**: Track achievement update performance throughout migration
4. **Backward Compatibility**: Maintain all existing methods and notification behavior

### Success Metrics

#### File Size Reduction
- **Target**: 80%+ reduction in main file size
- **Method**: Word count comparison before/after
- **Validation**: All components <1,200 words

#### AI Tool Compatibility
- **Target**: All components within AI token limits
- **Method**: Component size analysis
- **Validation**: Successful AI-assisted development on individual components

#### Performance Maintenance
- **Target**: No performance regression on achievement updates
- **Method**: Performance benchmarking
- **Validation**: Achievement processing performance maintained or improved

#### Data Integrity
- **Target**: 100% achievement progress integrity
- **Method**: Progress data validation before/after migration
- **Validation**: No achievement progress loss during refactoring

### Conclusion

The AchievementManager.js refactoring will transform a monolithic 5,137-word file into a maintainable, AI-tool-friendly component architecture. Following the established UserInfoScene patterns, this refactoring will enable:

1. **Enhanced Maintainability** through clear separation of achievement concerns
2. **AI-Assisted Development** with all files within token limits
3. **Parallel Development** across achievement tracking, notifications, and analytics
4. **Better Testing** with focused component tests
5. **Improved Performance** with optimized caching and batch processing

The proposed component structure maintains full backward compatibility while providing a foundation for continued achievement system development and new feature additions.