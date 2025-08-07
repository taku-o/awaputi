# Design Document

## Overview

This design document outlines the approach for splitting 7 core JavaScript files that exceed the 2,500-word limit for MCP tool compatibility. The design follows the Main Controller Pattern established in previous phases, ensuring that each split component has a clear, focused purpose while maintaining the existing public APIs for backward compatibility.

The target files are:
1. **LeaderboardManager.js** (3,489 words) - Leaderboard management system
2. **PWAManager.js** (2,968 words) - Progressive Web App functionality
3. **SettingsManager.js** (2,798 words) - Settings management system
4. **ParticleManager.js** (2,728 words) - Particle effects management
5. **StatisticsDashboard.js** (2,596 words) - Statistics display system
6. **DataManager.js** (2,578 words) - Data management operations
7. **StageSelectScene.js** (2,573 words) - Stage selection UI

## Architecture

### Main Controller Pattern

The splitting strategy employs the **Main Controller Pattern** where large classes are broken down into specialized sub-components:

1. **Main Controller**: The original class becomes a lightweight orchestrator (< 2,500 words)
2. **Functional Sub-Components**: Related methods are grouped into specialized classes (< 2,500 words each)
3. **Dependency Injection**: Sub-components are injected into the main controller
4. **API Preservation**: Public interfaces remain unchanged for backward compatibility

### Component Hierarchy Structure

```
Original Large File (> 2,500 words)
├── MainController (< 2,500 words) - Public API & orchestration
├── SubComponent1 (< 2,500 words) - Specific functionality group
├── SubComponent2 (< 2,500 words) - Another functionality group
└── SubComponent3 (< 2,500 words) - Additional functionality group
```

## Components and Interfaces

### 1. LeaderboardManager.js Split Design

**Current Analysis:**
- Main class: LeaderboardManager (3,489 words)
- Key responsibilities: Score recording, ranking management, period-based leaderboards, data validation, caching

**Proposed Split:**

#### 1.1 LeaderboardManager.js (Main Controller)
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Public API maintenance (`recordScore`, `getLeaderboard`, `addScore`)
  - Component orchestration and initialization
  - Configuration management
  - Main leaderboard operations coordination
- **Key Methods**: `initialize()`, `recordScore()`, `getLeaderboard()`, `addScore()`

#### 1.2 LeaderboardDataProcessor.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Score data validation and processing
  - Data integrity checks
  - Score entry creation and formatting
  - Player score history management
- **Key Methods**: `validateScoreData()`, `processScoreEntry()`, `performIntegrityCheck()`

#### 1.3 LeaderboardRankingManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Ranking calculations and updates
  - Period-based ranking management (daily, weekly, monthly)
  - Leaderboard sorting and filtering
  - Ranking statistics generation
- **Key Methods**: `updateLeaderboards()`, `updatePeriodLeaderboards()`, `getPeriodRanking()`

#### 1.4 LeaderboardStorageManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Data persistence and loading
  - Cache management
  - Cleanup operations
  - Backup and recovery
- **Key Methods**: `load()`, `save()`, `cleanupExpiredPeriodEntries()`, cache operations

### 2. PWAManager.js Split Design

**Current Analysis:**
- Main class: PWAManager (2,968 words)
- Key responsibilities: Service Worker management, offline functionality, installation prompts, manifest management

**Proposed Split:**

#### 2.1 PWAManager.js (Main Controller)
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Public API maintenance
  - Component orchestration
  - PWA lifecycle management
  - Configuration management
- **Key Methods**: `initialize()`, `enable()`, `disable()`, main PWA operations

#### 2.2 PWAServiceWorkerManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Service Worker registration and updates
  - SW lifecycle management
  - Cache strategy implementation
  - SW communication
- **Key Methods**: Service Worker registration, update handling, cache management

#### 2.3 PWAInstallationManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Installation prompt management
  - App installation detection
  - Installation UI handling
  - Installation analytics
- **Key Methods**: Installation prompt handling, installation state management

### 3. SettingsManager.js Split Design

**Current Analysis:**
- Main class: SettingsManager (2,798 words)
- Key responsibilities: Settings storage, validation, UI integration, synchronization

**Proposed Split:**

#### 3.1 SettingsManager.js (Main Controller)
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Public API maintenance
  - Settings orchestration
  - Main settings operations
  - Configuration management
- **Key Methods**: `get()`, `set()`, `initialize()`, main settings operations

#### 3.2 SettingsValidator.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Settings validation logic
  - Data type checking
  - Range validation
  - Constraint enforcement
- **Key Methods**: Validation functions, constraint checking

#### 3.3 SettingsStorageManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Settings persistence
  - Storage operations
  - Synchronization
  - Backup and recovery
- **Key Methods**: Storage operations, sync management

### 4. ParticleManager.js Split Design

**Current Analysis:**
- Main class: ParticleManager (2,728 words)
- Key responsibilities: Particle creation, animation, rendering, cleanup

**Proposed Split:**

#### 4.1 ParticleManager.js (Main Controller)
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Public API maintenance
  - Particle system orchestration
  - Main particle operations
  - Configuration management
- **Key Methods**: `createParticle()`, `update()`, `render()`, main operations

#### 4.2 ParticleRenderer.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Particle rendering logic
  - Visual effects processing
  - Animation calculations
  - Rendering optimization
- **Key Methods**: Rendering functions, animation processing

#### 4.3 ParticleLifecycleManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Particle lifecycle management
  - Creation and destruction
  - Memory management
  - Cleanup operations
- **Key Methods**: Lifecycle management, cleanup operations

### 5. StatisticsDashboard.js Split Design

**Current Analysis:**
- Main class: StatisticsDashboard (2,596 words)
- Key responsibilities: Statistics display, chart generation, data visualization

**Proposed Split:**

#### 5.1 StatisticsDashboard.js (Main Controller)
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Public API maintenance
  - Dashboard orchestration
  - Main display operations
  - Configuration management
- **Key Methods**: `render()`, `update()`, main dashboard operations

#### 5.2 StatisticsChartRenderer.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Chart generation and rendering
  - Data visualization
  - Chart type management
  - Visual formatting
- **Key Methods**: Chart rendering functions, visualization logic

### 6. DataManager.js Split Design

**Current Analysis:**
- Main class: DataManager (2,578 words)
- Key responsibilities: Data storage, validation, synchronization, backup

**Proposed Split:**

#### 6.1 DataManager.js (Main Controller)
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Public API maintenance
  - Data operations orchestration
  - Main data management
  - Configuration management
- **Key Methods**: `save()`, `load()`, `validate()`, main operations

#### 6.2 DataStorageManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Data persistence operations
  - Storage management
  - Backup and recovery
  - Data migration
- **Key Methods**: Storage operations, backup management

### 7. StageSelectScene.js Split Design

**Current Analysis:**
- Main class: StageSelectScene (2,573 words)
- Key responsibilities: Stage selection UI, stage data management, user interaction

**Proposed Split:**

#### 7.1 StageSelectScene.js (Main Controller)
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Public API maintenance
  - Scene orchestration
  - Main UI operations
  - Configuration management
- **Key Methods**: `render()`, `update()`, `handleInput()`, main scene operations

#### 7.2 StageDataManager.js
- **Size Target**: < 2,500 words
- **Responsibilities**:
  - Stage data management
  - Stage information processing
  - Data validation
  - Stage metadata handling
- **Key Methods**: Stage data operations, validation functions

## Data Models

### Shared Interfaces and Data Flow

Each split component will maintain consistent data flow patterns:

#### LeaderboardManager Data Flow
```javascript
scoreData -> LeaderboardManager.recordScore()
  -> LeaderboardDataProcessor.validateScoreData()
  -> LeaderboardDataProcessor.processScoreEntry()
  -> LeaderboardRankingManager.updateLeaderboards()
  -> LeaderboardStorageManager.save()
```

#### PWAManager Data Flow
```javascript
pwaRequest -> PWAManager.initialize()
  -> PWAServiceWorkerManager.register()
  -> PWAInstallationManager.setupPrompts()
  -> Combined PWA functionality
```

### Configuration Management

All split components will maintain their existing configuration patterns:
- Centralized configuration objects
- Environment-specific settings
- Runtime configuration updates
- Configuration validation

### State Management

Each sub-component will manage its own internal state while sharing necessary data through:
- Constructor injection of shared state objects
- Method parameters for transient data
- Event-based communication where appropriate
- Centralized state coordination through main controllers

## Error Handling

### Error Propagation Strategy

1. **Sub-component Errors**: Caught and handled gracefully by main controller
2. **Fallback Behavior**: Main controller provides fallback implementations
3. **Error Logging**: Centralized error logging through existing ErrorHandler
4. **Recovery Mechanisms**: Automatic recovery where possible

### Error Handling Patterns

```javascript
// Main controller error handling pattern
try {
    const result = await this.subComponent.performOperation(data);
    return result;
} catch (error) {
    this.errorHandler.handleError(error, 'SUBCOMPONENT_ERROR', {
        component: 'SubComponentName',
        operation: 'performOperation',
        data
    });
    return this.getFallbackResult(data);
}
```

## Testing Strategy

### Unit Testing Approach

1. **Individual Component Tests**: Each split component gets comprehensive unit tests
2. **Integration Tests**: Test interaction between main controller and sub-components
3. **API Compatibility Tests**: Ensure public API remains unchanged
4. **Performance Tests**: Verify no performance degradation

### Test Structure

```
tests/
├── unit/
│   ├── core/
│   │   ├── LeaderboardManager.test.js (main controller)
│   │   ├── LeaderboardDataProcessor.test.js
│   │   ├── LeaderboardRankingManager.test.js
│   │   ├── LeaderboardStorageManager.test.js
│   │   ├── PWAManager.test.js (main controller)
│   │   ├── PWAServiceWorkerManager.test.js
│   │   ├── PWAInstallationManager.test.js
│   │   └── [other split components]
└── integration/
    ├── LeaderboardManagerIntegration.test.js
    ├── PWAManagerIntegration.test.js
    └── [other integration tests]
```

## File Organization

### Directory Structure

```
src/
├── core/
│   ├── LeaderboardManager.js (main controller)
│   ├── leaderboard/
│   │   ├── LeaderboardDataProcessor.js
│   │   ├── LeaderboardRankingManager.js
│   │   └── LeaderboardStorageManager.js
│   ├── PWAManager.js (main controller)
│   ├── pwa/
│   │   ├── PWAServiceWorkerManager.js
│   │   └── PWAInstallationManager.js
│   ├── SettingsManager.js (main controller)
│   ├── settings/
│   │   ├── SettingsValidator.js
│   │   └── SettingsStorageManager.js
│   ├── DataManager.js (main controller)
│   ├── data/
│   │   └── DataStorageManager.js
│   ├── StatisticsDashboard.js (main controller)
│   └── statistics/
│       └── StatisticsChartRenderer.js
├── effects/
│   ├── ParticleManager.js (main controller)
│   └── particles/
│       ├── ParticleRenderer.js
│       └── ParticleLifecycleManager.js
└── scenes/
    ├── StageSelectScene.js (main controller)
    └── stage-select/
        └── StageDataManager.js
```

### Import/Export Patterns

#### Main Controllers
```javascript
// LeaderboardManager.js
import { LeaderboardDataProcessor } from './leaderboard/LeaderboardDataProcessor.js';
import { LeaderboardRankingManager } from './leaderboard/LeaderboardRankingManager.js';
import { LeaderboardStorageManager } from './leaderboard/LeaderboardStorageManager.js';

export class LeaderboardManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.dataProcessor = new LeaderboardDataProcessor(this);
        this.rankingManager = new LeaderboardRankingManager(this);
        this.storageManager = new LeaderboardStorageManager(this);
    }
}
```

#### Sub-Components
```javascript
// LeaderboardDataProcessor.js
export class LeaderboardDataProcessor {
    constructor(leaderboardManager) {
        this.leaderboardManager = leaderboardManager;
    }
    
    validateScoreData(scoreData) {
        // Implementation
    }
}
```

## Migration Strategy

### Phase 1: Preparation
1. Create new directory structures for each component
2. Set up empty component files with basic structure
3. Update build configuration if needed
4. Prepare test file structures

### Phase 2: Component Extraction
1. Extract methods from main files to sub-components
2. Implement proper imports/exports
3. Maintain temporary backward compatibility
4. Create unit tests for each sub-component

### Phase 3: Integration
1. Update main controllers to use sub-components
2. Test integration thoroughly
3. Remove temporary compatibility code
4. Update existing tests

### Phase 4: Validation
1. Run full test suite
2. Verify file sizes are under 2,500 words
3. Test MCP tool functionality
4. Performance validation
5. API compatibility verification

## Quality Assurance

### File Size Monitoring
- Automated checks during build process
- Pre-commit hooks to prevent size violations
- Regular monitoring of all JavaScript files
- Size reduction tracking and reporting

### Code Quality Standards
- ESLint configuration compliance
- Consistent naming conventions following project standards
- Proper error handling patterns
- Comprehensive documentation
- Single responsibility principle adherence

### Performance Validation
- No degradation in runtime performance
- Memory usage remains stable
- Build time impact minimized
- Bundle size impact assessed
- MCP tool performance improvement verification

### Backward Compatibility
- All existing public APIs must remain unchanged
- Existing test suites must pass without modification
- No breaking changes to external dependencies
- Singleton patterns and configuration systems preserved

This design ensures that the core file splitting maintains system stability, preserves existing functionality, and improves code maintainability while solving the MCP token limit issue for the most critical files in the project.