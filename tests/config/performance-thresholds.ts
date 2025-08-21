/**
 * Performance Test Thresholds Configuration
 * Environment-specific performance expectations and limits
 */

/**
 * Base performance thresholds by environment
 */
export const PERFORMANCE_THRESHOLDS = {
  // Continuous Integration Environment
  ci: {
    frameRate: {
      min: 25,           // Minimum acceptable FPS
      target: 30,        // Target FPS
      max: 45,          // Maximum expected FPS
      variance: 5        // Acceptable variance in FPS
    },
    renderTime: {
      max: 50,          // Maximum render time in ms
      average: 35,      // Target average render time
      target: 25,       // Optimal render time
      variance: 10      // Acceptable variance in ms
    },
    memoryUsage: {
      max: 100 * 1024 * 1024,          // 100MB maximum memory usage
      growth: 10 * 1024 * 1024,        // 10MB acceptable growth per operation
      leak: 5 * 1024 * 1024,           // 5MB acceptable memory leak per test
      baseline: 20 * 1024 * 1024       // 20MB baseline memory usage
    },
    loadTime: {
      max: 5000,        // 5 seconds maximum load time
      target: 3000,     // 3 seconds target load time
      component: 1000,  // 1 second per component load
      asset: 500        // 500ms per asset load
    },
    network: {
      timeout: 10000,   // 10 seconds network timeout
      retries: 3,       // Maximum network retries
      delay: 1000       // Delay between retries
    }
  },

  // Local Development Environment
  local: {
    frameRate: {
      min: 35,
      target: 45,
      max: 60,
      variance: 8
    },
    renderTime: {
      max: 35,
      average: 25,
      target: 16,
      variance: 8
    },
    memoryUsage: {
      max: 150 * 1024 * 1024,          // 150MB maximum
      growth: 15 * 1024 * 1024,        // 15MB acceptable growth
      leak: 8 * 1024 * 1024,           // 8MB acceptable leak
      baseline: 30 * 1024 * 1024       // 30MB baseline
    },
    loadTime: {
      max: 3000,
      target: 2000,
      component: 500,
      asset: 200
    },
    network: {
      timeout: 5000,
      retries: 2,
      delay: 500
    }
  },

  // Production Environment
  production: {
    frameRate: {
      min: 45,
      target: 55,
      max: 60,
      variance: 5
    },
    renderTime: {
      max: 25,
      average: 18,
      target: 16,
      variance: 5
    },
    memoryUsage: {
      max: 200 * 1024 * 1024,          // 200MB maximum
      growth: 20 * 1024 * 1024,        // 20MB acceptable growth
      leak: 10 * 1024 * 1024,          // 10MB acceptable leak
      baseline: 40 * 1024 * 1024       // 40MB baseline
    },
    loadTime: {
      max: 2000,
      target: 1500,
      component: 300,
      asset: 150
    },
    network: {
      timeout: 3000,
      retries: 1,
      delay: 200
    }
  }
};

/**
 * Component-specific performance thresholds
 */
export const COMPONENT_THRESHOLDS = {
  // Game Engine Components
  gameEngine: {
    initTime: { ci: 2000, local: 1500, production: 1000 },
    updateTime: { ci: 20, local: 15, production: 10 },
    renderTime: { ci: 35, local: 25, production: 16 }
  },

  // Bubble Manager
  bubbleManager: {
    createBubble: { ci: 5, local: 3, production: 2 },
    updateBubbles: { ci: 15, local: 10, production: 8 },
    renderBubbles: { ci: 25, local: 18, production: 12 }
  },

  // Particle System
  particleSystem: {
    createParticles: { ci: 8, local: 5, production: 3 },
    updateParticles: { ci: 20, local: 15, production: 10 },
    renderParticles: { ci: 30, local: 20, production: 15 }
  },

  // Audio Manager
  audioManager: {
    initTime: { ci: 1500, local: 1000, production: 800 },
    playSound: { ci: 10, local: 8, production: 5 },
    loadAudio: { ci: 500, local: 300, production: 200 }
  },

  // Scene Manager
  sceneManager: {
    sceneTransition: { ci: 1000, local: 800, production: 600 },
    sceneRender: { ci: 30, local: 20, production: 16 },
    sceneUpdate: { ci: 15, local: 10, production: 8 }
  },

  // UI Components
  uiComponents: {
    render: { ci: 20, local: 15, production: 10 },
    update: { ci: 10, local: 8, production: 5 },
    interaction: { ci: 50, local: 30, production: 20 }
  }
};

/**
 * Test-specific configurations
 */
export const TEST_CONFIGURATIONS = {
  // Standard performance test configuration
  standard: {
    retries: { ci: 3, local: 2, production: 1 },
    timeout: { ci: 15000, local: 10000, production: 8000 },
    warmupIterations: { ci: 2, local: 3, production: 5 },
    measurementIterations: { ci: 5, local: 10, production: 15 },
    stabilizationDelay: { ci: 2000, local: 1000, production: 500 }
  },

  // Quick performance test for rapid feedback
  quick: {
    retries: { ci: 2, local: 1, production: 1 },
    timeout: { ci: 8000, local: 5000, production: 3000 },
    warmupIterations: { ci: 1, local: 1, production: 2 },
    measurementIterations: { ci: 3, local: 5, production: 8 },
    stabilizationDelay: { ci: 1000, local: 500, production: 200 }
  },

  // Comprehensive performance test for detailed analysis
  comprehensive: {
    retries: { ci: 5, local: 3, production: 2 },
    timeout: { ci: 30000, local: 20000, production: 15000 },
    warmupIterations: { ci: 5, local: 8, production: 10 },
    measurementIterations: { ci: 10, local: 20, production: 30 },
    stabilizationDelay: { ci: 3000, local: 2000, production: 1000 }
  }
};

/**
 * Device-specific adjustments for mobile/desktop
 */
export const DEVICE_ADJUSTMENTS = {
  mobile: {
    frameRateMultiplier: 0.8,     // 80% of desktop expectations
    renderTimeMultiplier: 1.5,    // 50% more render time allowed
    memoryMultiplier: 0.6,        // 60% of desktop memory limits
    loadTimeMultiplier: 2.0       // Double the load time allowance
  },
  
  desktop: {
    frameRateMultiplier: 1.0,
    renderTimeMultiplier: 1.0,
    memoryMultiplier: 1.0,
    loadTimeMultiplier: 1.0
  },

  tablet: {
    frameRateMultiplier: 0.9,
    renderTimeMultiplier: 1.2,
    memoryMultiplier: 0.8,
    loadTimeMultiplier: 1.5
  }
};

/**
 * Gets performance thresholds for specific environment and device
 * @param {string} environment - Environment type (ci, local, production)
 * @param {string} device - Device type (mobile, desktop, tablet)
 * @param {string} component - Component name (optional)
 * @returns {Object} Adjusted performance thresholds
 */
export function getPerformanceThresholds(environment = 'local', device = 'desktop', component = null) {
  const baseThresholds = PERFORMANCE_THRESHOLDS[environment] || PERFORMANCE_THRESHOLDS.local,
  const deviceAdjustments = DEVICE_ADJUSTMENTS[device] || DEVICE_ADJUSTMENTS.desktop,
  
  // Apply device-specific adjustments
  const adjustedThresholds = JSON.parse(JSON.stringify(baseThresholds);
  // Adjust frame rate
  adjustedThresholds.frameRate.min *= deviceAdjustments.frameRateMultiplier,
  adjustedThresholds.frameRate.target *= deviceAdjustments.frameRateMultiplier,
  adjustedThresholds.frameRate.max *= deviceAdjustments.frameRateMultiplier,
  
  // Adjust render time
  adjustedThresholds.renderTime.max *= deviceAdjustments.renderTimeMultiplier,
  adjustedThresholds.renderTime.average *= deviceAdjustments.renderTimeMultiplier,
  adjustedThresholds.renderTime.target *= deviceAdjustments.renderTimeMultiplier,
  
  // Adjust memory usage
  adjustedThresholds.memoryUsage.max *= deviceAdjustments.memoryMultiplier,
  adjustedThresholds.memoryUsage.growth *= deviceAdjustments.memoryMultiplier,
  adjustedThresholds.memoryUsage.leak *= deviceAdjustments.memoryMultiplier,
  
  // Adjust load time
  adjustedThresholds.loadTime.max *= deviceAdjustments.loadTimeMultiplier,
  adjustedThresholds.loadTime.target *= deviceAdjustments.loadTimeMultiplier,
  adjustedThresholds.loadTime.component *= deviceAdjustments.loadTimeMultiplier,
  
  // Add component-specific thresholds if requested
  if (component && COMPONENT_THRESHOLDS[component]) {
    adjustedThresholds.component = {};
    const componentThresholds = COMPONENT_THRESHOLDS[component];
    
    for (const [metric, values] of Object.entries(componentThresholds) {
      adjustedThresholds.component[metric] = values[environment] || values.local }
  }
  
  return adjustedThresholds;
}

/**
 * Gets test configuration for specific environment and test type
 * @param {string} environment - Environment type
 * @param {string} testType - Test type (standard, quick, comprehensive')'
 * @returns {Object} Test configuration
 */
export function getTestConfiguration(environment = 'local', testType = 'standard') {
  const config = TEST_CONFIGURATIONS[testType] || TEST_CONFIGURATIONS.standard,
  
  return {
    retries: config.retries[environment] || config.retries.local,
    timeout: config.timeout[environment] || config.timeout.local,
    warmupIterations: config.warmupIterations[environment] || config.warmupIterations.local,
    measurementIterations: config.measurementIterations[environment] || config.measurementIterations.local,
    stabilizationDelay: config.stabilizationDelay[environment] || config.stabilizationDelay.local
  };
}

/**
 * Validates if a performance result meets the thresholds
 * @param {Object} result - Performance test result
 * @param {Object} thresholds - Performance thresholds
 * @param {string} metric - Specific metric to validate
 * @returns {Object} Validation result
 */
export function validatePerformanceResult(result, thresholds, metric') {'
  const validation = {
    passed: false,
    metric,
    result,
    threshold: thresholds[metric],
    message: ','
    severity: 'info'
  };

  if (!thresholds[metric]') {'
    validation.message = `No threshold defined for metric: ${metric}`,
    validation.severity = 'warning';
    return validation;
  }

  switch (metric') {'
    case 'frameRate':
      validation.passed = result.fps >= thresholds.frameRate.min,
      validation.message = validation.passed 
        ? `Frame rate ${result.fps.toFixed(2}} FPS meets minimum ${thresholds.frameRate.min} FPS`
        : `Frame rate ${result.fps.toFixed(2'}} FPS below minimum ${thresholds.frameRate.min} FPS`;'
      validation.severity = validation.passed ? 'info' : 'error';
      break;

    case 'renderTime':
      validation.passed = result.averageTime <= thresholds.renderTime.max;
      validation.message = validation.passed
        ? `Render time ${result.averageTime.toFixed(2}}ms within limit ${thresholds.renderTime.max}ms`
        : `Render time ${result.averageTime.toFixed(2'}}ms exceeds limit ${thresholds.renderTime.max}ms`;'
      validation.severity = validation.passed ? 'info' : 'error';
      break;

    case 'memoryUsage':
      validation.passed = result.totalGrowth <= thresholds.memoryUsage.growth;
      validation.message = validation.passed
        ? `Memory growth ${(result.totalGrowth / 1024 / 1024).toFixed(2}}MB within limit ${(thresholds.memoryUsage.growth / 1024 / 1024).toFixed(2}}MB`
        : `Memory growth ${(result.totalGrowth / 1024 / 1024).toFixed(2}}MB exceeds limit ${(thresholds.memoryUsage.growth / 1024 / 1024).toFixed(2'}}MB`;'
      validation.severity = validation.passed ? 'info' : 'error';
      break;

    case 'loadTime':
      validation.passed = result.loadTime <= thresholds.loadTime.max;
      validation.message = validation.passed
        ? `Load time ${result.loadTime}ms within limit ${thresholds.loadTime.max}ms`
        : `Load time ${result.loadTime}ms exceeds limit ${thresholds.loadTime.max}ms`;
      validation.severity = validation.passed ? 'info' : 'error';
      break;

    default:
      validation.message = `Unknown, metric: ${metric}`,
      validation.severity = 'warning';
  }

  return validation;
}

/**
 * Creates a performance test suite configuration
 * @param {Object} options - Configuration options
 * @returns {Object} Complete test suite configuration
 */
export function createPerformanceTestSuite(options = {}') {'
  const {
    environment = 'local',
    device = 'desktop',
    testType = 'standard',
    components = [],
    customThresholds = {}
  } = options;

  const baseThresholds = getPerformanceThresholds(environment, device);
  const testConfig = getTestConfiguration(environment, testType);
  
  // Merge custom thresholds
  const finalThresholds = { ...baseThresholds, ...customThresholds };
  
  return {
    environment,
    device,
    testType,
    thresholds: finalThresholds,
    config: testConfig,
    components: components.map(component => ({
      name: component),
     , thresholds: getPerformanceThresholds(environment, device, component) },
    metadata: {
      created: new Date().toISOString(','
      version: '1.0.0',
      generator: 'performance-thresholds.js'
    }
  };
}