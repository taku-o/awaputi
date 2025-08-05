# Design Document

## Overview

This document outlines the design for Phase F.4 of the large file splitting project, focusing on peripheral files and tools. The design follows the Main Controller Pattern established in previous phases, ensuring consistency with the existing codebase architecture while splitting large files into manageable, focused components.

The primary goal is to split 7 core files (balance-adjuster.js, AudioAccessibilitySupport.js, SEOTester.js, AudioCacheManager.js, dashboard.js, performance-impact-assessment.js, and ImportDialog.js) into smaller components while maintaining full backward compatibility and preserving all tool and accessibility functionality.

## Architecture

### Main Controller Pattern Implementation

Each large file will be refactored using the Main Controller Pattern:

1. **Main Controller**: The original class remains as a coordinator
2. **Sub-Components**: Specific functionality is extracted into focused modules
3. **Facade Pattern**: Public API remains unchanged for backward compatibility
4. **Dependency Injection**: Sub-components are injected into the main controller

### Directory Structure

```
tools/
├── balance/
│   ├── balance-adjuster.js                 # Main controller (< 500 words)
│   ├── BalanceDataLoader.js                # Configuration loading (< 2500 words)
│   ├── BalanceCalculator.js                # Impact analysis & calculations (< 2500 words)
│   ├── BalanceValidator.js                 # Validation & testing (< 2500 words)
│   └── BalanceExporter.js                  # Export & save functionality (< 2500 words)
├── dashboard/
│   ├── dashboard.js                        # Main controller (< 500 words)
│   ├── DashboardDataManager.js             # Data fetching & management (< 2500 words)
│   ├── DashboardVisualization.js           # Charts & visual components (< 2500 words)
│   ├── DashboardValidation.js              # Validation & analysis (< 2500 words)
│   └── DashboardReporting.js               # Report generation (< 2500 words)

scripts/
├── performance-assessment/
│   ├── performance-impact-assessment.js    # Main controller (< 500 words)
│   ├── ResponseTimeAnalyzer.js             # Response time analysis (< 2500 words)
│   ├── MemoryUsageAnalyzer.js              # Memory usage analysis (< 2500 words)
│   ├── CPUImpactAnalyzer.js                # CPU impact analysis (< 2500 words)
│   └── PerformanceReporter.js              # Report generation (< 2500 words)

src/audio/
├── accessibility/
│   ├── AudioAccessibilitySupport.js        # Main controller (< 500 words)
│   ├── AudioDescriptionManager.js          # Audio descriptions (< 2500 words)
│   ├── AudioCueManager.js                  # Audio cues & notifications (< 2500 words)
│   ├── AudioFeedbackManager.js             # User feedback systems (< 2500 words)
│   └── AudioSettingsManager.js             # Settings & configuration (< 2500 words)
├── cache/
│   ├── AudioCacheManager.js                # Main controller (< 500 words)
│   ├── LRUCacheImplementation.js           # LRU cache logic (< 2500 words)
│   ├── CacheMemoryManager.js               # Memory monitoring (< 2500 words)
│   ├── CacheDataLoader.js                  # Data loading & staging (< 2500 words)
│   └── CacheStatistics.js                  # Statistics & monitoring (< 2500 words)

src/seo/
├── testing/
│   ├── SEOTester.js                        # Main controller (< 500 words)
│   ├── MetaTagValidator.js                 # Meta tag validation (< 2500 words)
│   ├── StructuredDataValidator.js          # Structured data validation (< 2500 words)
│   ├── PerformanceValidator.js             # Performance validation (< 2500 words)
│   └── SEOReportGenerator.js               # Report generation (< 2500 words)

src/scenes/components/
├── dialogs/
│   ├── ImportDialog.js                     # Main controller (< 500 words)
│   ├── ImportMethodSelector.js             # Method selection UI (< 2500 words)
│   ├── ImportDataProcessor.js              # Data processing & validation (< 2500 words)
│   ├── ImportProgressManager.js            # Progress tracking (< 2500 words)
│   └── ImportResultHandler.js              # Result handling & feedback (< 2500 words)
```

## Components and Interfaces

### 1. Balance Adjuster Tool Split

#### Main Controller (balance-adjuster.js)
```javascript
class BalanceAdjuster {
    constructor() {
        this.dataLoader = new BalanceDataLoader(this);
        this.calculator = new BalanceCalculator(this);
        this.validator = new BalanceValidator(this);
        this.exporter = new BalanceExporter(this);
        
        // Maintain existing properties for compatibility
        this.currentConfig = this.dataLoader.loadCurrentConfiguration();
        this.pendingChanges = {};
        this.session = {
            startTime: new Date(),
            changes: [],
            testResults: []
        };
    }
    
    // Public API methods delegate to appropriate sub-components
    async showMainMenu() {
        // Coordinate UI display with data from sub-components
    }
    
    async modifySettings() {
        // Use calculator for impact analysis, validator for validation
    }
}
```

#### Sub-Components:

**BalanceDataLoader.js**
- Handles configuration file loading and parsing
- Manages current configuration state and backup creation
- Responsible for configuration file discovery and reading

**BalanceCalculator.js**
- Implements balance impact analysis and mathematical calculations
- Handles gameplay simulation and balance effect prediction
- Manages risk assessment and impact scoring

**BalanceValidator.js**
- Implements validation rules and constraint checking
- Handles test execution (quick tests, balance tests, performance tests)
- Manages validation result processing and reporting

**BalanceExporter.js**
- Handles configuration export and file writing
- Manages backup creation and change application
- Implements batch processing and configuration synchronization

### 2. Audio Accessibility Support Split

#### Main Controller (AudioAccessibilitySupport.js)
```javascript
export class AudioAccessibilitySupport {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.descriptionManager = new AudioDescriptionManager(this);
        this.cueManager = new AudioCueManager(this);
        this.feedbackManager = new AudioFeedbackManager(this);
        this.settingsManager = new AudioSettingsManager(this);
        
        // Maintain existing properties for compatibility
        this.vibrationManager = null;
        this.visualNotifications = [];
        this.eventHistory = [];
    }
    
    // Public API methods delegate to appropriate sub-components
    initialize() {
        return this.settingsManager.initialize();
    }
    
    showVisualNotification(message, type) {
        return this.feedbackManager.showVisualNotification(message, type);
    }
}
```

#### Sub-Components:

**AudioDescriptionManager.js**
- Handles audio description generation and management
- Manages descriptive audio content and narration
- Implements audio description timing and synchronization

**AudioCueManager.js**
- Manages audio cue generation and playback
- Handles sound effect replacement with visual/haptic cues
- Implements cue pattern recognition and management

**AudioFeedbackManager.js**
- Handles visual notifications and user feedback systems
- Manages vibration integration and haptic feedback
- Implements color indicators and visual feedback mechanisms

**AudioSettingsManager.js**
- Manages accessibility settings and user preferences
- Handles configuration persistence and loading
- Implements settings validation and application

### 3. SEO Tester Split

#### Main Controller (SEOTester.js)
```javascript
export class SEOTester {
    constructor() {
        this.baseUrl = getBaseUrl();
        this.metaValidator = new MetaTagValidator(this);
        this.structuredDataValidator = new StructuredDataValidator(this);
        this.performanceValidator = new PerformanceValidator(this);
        this.reportGenerator = new SEOReportGenerator(this);
        
        // Maintain existing properties
        this.testResults = new Map();
        this.validationRules = new Map();
        this.performanceMetrics = {
            testExecutionTime: 0,
            validationErrors: 0,
            validationWarnings: 0,
            totalTests: 0,
            passedTests: 0
        };
    }
    
    async runComprehensiveTest(options = {}) {
        // Coordinate all validators and generate comprehensive report
    }
}
```

#### Sub-Components:

**MetaTagValidator.js**
- Handles meta tag validation (title, description, keywords)
- Implements Open Graph and Twitter Card validation
- Manages social media optimization checks

**StructuredDataValidator.js**
- Handles structured data validation and schema.org compliance
- Implements JSON-LD validation and rich snippet testing
- Manages structured data extraction and analysis

**PerformanceValidator.js**
- Handles performance optimization validation
- Implements Core Web Vitals monitoring and Lighthouse integration
- Manages accessibility compliance checking

**SEOReportGenerator.js**
- Handles test result compilation and report generation
- Implements multiple output formats (JSON, HTML, CSV)
- Manages report styling and visualization

### 4. Audio Cache Manager Split

#### Main Controller (AudioCacheManager.js)
```javascript
export class AudioCacheManager {
    constructor() {
        this.lruCache = new LRUCacheImplementation(this);
        this.memoryManager = new CacheMemoryManager(this);
        this.dataLoader = new CacheDataLoader(this);
        this.statistics = new CacheStatistics(this);
        
        // Maintain existing properties
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
    }
}
```

#### Sub-Components:

**LRUCacheImplementation.js**
- Implements LRU cache algorithm and node management
- Handles cache operations (get, set, delete, clear)
- Manages cache size limits and eviction policies

**CacheMemoryManager.js**
- Handles memory usage monitoring and optimization
- Implements automatic cleanup and garbage collection
- Manages memory pressure detection and response

**CacheDataLoader.js**
- Handles audio data loading and preprocessing
- Implements progressive loading and streaming
- Manages data format conversion and optimization

**CacheStatistics.js**
- Handles cache performance metrics and statistics
- Implements hit/miss ratio tracking and reporting
- Manages cache efficiency analysis and optimization recommendations

### 5. Dashboard Split

#### Main Controller (dashboard.js)
```javascript
class ConfigurationDashboard {
    constructor() {
        this.dataManager = new DashboardDataManager(this);
        this.visualization = new DashboardVisualization(this);
        this.validation = new DashboardValidation(this);
        this.reporting = new DashboardReporting(this);
        
        // Maintain existing properties
        this.isInitialized = false;
        this.refreshInterval = null;
        this.currentTab = 'scoring';
    }
}
```

### 6. Performance Impact Assessment Split

#### Main Controller (performance-impact-assessment.js)
```javascript
class PerformanceImpactAssessment {
    constructor() {
        this.responseTimeAnalyzer = new ResponseTimeAnalyzer(this);
        this.memoryUsageAnalyzer = new MemoryUsageAnalyzer(this);
        this.cpuImpactAnalyzer = new CPUImpactAnalyzer(this);
        this.performanceReporter = new PerformanceReporter(this);
    }
}
```

### 7. Import Dialog Split

#### Main Controller (ImportDialog.js)
```javascript
export class ImportDialog extends BaseDialog {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        this.methodSelector = new ImportMethodSelector(this);
        this.dataProcessor = new ImportDataProcessor(this);
        this.progressManager = new ImportProgressManager(this);
        this.resultHandler = new ImportResultHandler(this);
    }
}
```

## Data Models

### Balance Configuration Model
```javascript
{
    key: string,
    value: any,
    type: string,
    category: string,
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    validation: ValidationResult
}
```

### Audio Accessibility Event Model
```javascript
{
    id: string,
    timestamp: number,
    type: 'visual' | 'haptic' | 'audio',
    message: string,
    intensity: number,
    duration: number,
    metadata: object
}
```

### SEO Test Result Model
```javascript
{
    testName: string,
    category: string,
    passed: boolean,
    score: number,
    message: string,
    recommendations: Array<string>,
    metadata: object
}
```

### Cache Entry Model
```javascript
{
    key: string,
    value: AudioBuffer,
    size: number,
    accessTime: number,
    hitCount: number,
    metadata: object
}
```

## Error Handling

### Component-Level Error Handling
Each sub-component implements its own error handling:
- Graceful degradation when sub-components fail
- Fallback to basic functionality if advanced features fail
- Error propagation to main controller for centralized handling

### Tool-Specific Error Handling
- **Balance Adjuster**: Ensure configuration integrity is never compromised
- **Audio Components**: Maintain accessibility features even if some components fail
- **SEO Tester**: Continue testing even if individual validators fail
- **Dashboard**: Maintain basic monitoring if advanced features fail

## Testing Strategy

### Unit Testing
- Each sub-component has dedicated unit tests
- Main controllers have integration tests
- Mock dependencies for isolated testing

### Tool Testing
- Command-line interface testing for balance adjuster
- Accessibility feature testing for audio components
- SEO validation accuracy testing
- Dashboard functionality testing

### Integration Testing
- Test component interactions
- Verify public API compatibility
- Test error propagation and recovery

### Performance Testing
- Verify no performance degradation after splitting
- Test memory usage of split components
- Benchmark critical paths, especially for audio components

## Migration Strategy

### Phase 1: Create Sub-Components
1. Extract functionality into new sub-component files
2. Implement sub-component classes with focused responsibilities
3. Add comprehensive unit tests for each sub-component

### Phase 2: Refactor Main Controllers
1. Modify main controller classes to use sub-components
2. Maintain all existing public methods as delegation points
3. Ensure backward compatibility is preserved

### Phase 3: Update Imports and Dependencies
1. Update internal imports to use new file structure
2. Verify all external imports continue to work
3. Update documentation and JSDoc comments

### Phase 4: Test and Validate
1. Run comprehensive test suite
2. Perform tool functionality testing
3. Validate file size requirements are met

## Dependency Management

### Import Strategy
- Main controllers export the same classes as before
- Sub-components are imported only by their main controllers
- External code continues to import from main controller files
- All imports use .js extensions as per project conventions

### Tool Dependencies
- Balance adjuster maintains CLI interface compatibility
- Dashboard maintains web interface compatibility
- Audio components maintain real-time performance requirements
- SEO tester maintains validation accuracy requirements

## Performance Considerations

### Memory Usage
- Sub-components share data through main controller
- Avoid data duplication between components
- Implement proper cleanup methods, especially for audio components

### Execution Performance
- Minimize delegation overhead
- Cache frequently accessed sub-component methods
- Optimize critical performance paths, especially for real-time audio processing

### Tool Performance
- Maintain CLI responsiveness for balance adjuster
- Preserve dashboard real-time update capabilities
- Ensure audio accessibility features maintain low latency
- Keep SEO testing execution time reasonable

### Bundle Size
- Each file remains under 2,500 words
- Total bundle size should not increase significantly
- Tree-shaking friendly exports
- Optimize for development tool usage patterns