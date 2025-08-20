/**
 * Mock Error Handler - Handles mock creation errors and provides fallback implementations
 * Provides error recovery utilities for mock-related issues across different environments
 */

import { jest } from '@jest/globals';
import { crossEnvironmentManager } from './CrossEnvironmentManager';

export class MockErrorHandler {
  constructor() {
    this.errorLog = [];
    this.mockStrategies = new Map();
    this.fallbackMocks = new Map();
    this.compatibilityReports = new Map();
    
    this.initializeMockStrategies();
    this.setupFallbackMocks();
  }

  /**
   * Initialize mock creation strategies for different error types
   */
  initializeMockStrategies() {
    // Canvas mock creation errors
    this.mockStrategies.set('canvas_mock_error', {
      detect: (error) => error.message?.includes('HTMLCanvasElement') ||
                        error.message?.includes('getContext'),
      recover: (options) => this.handleCanvasMockError(options: any),
      description: 'Canvas API mocking failures'
    });

    // Audio mock creation errors
    this.mockStrategies.set('audio_mock_error', {
      detect: (error) => error.message?.includes('AudioContext') ||
                        error.message?.includes('Audio'),
      recover: (options) => this.handleAudioMockError(options: any),
      description: 'Audio API mocking failures'
    });

    // Storage mock creation errors
    this.mockStrategies.set('storage_mock_error', {
      detect: (error) => error.message?.includes('localStorage') ||
                        error.message?.includes('sessionStorage'),
      recover: (options) => this.handleStorageMockError(options: any),
      description: 'Storage API mocking failures'
    });

    // Performance mock creation errors
    this.mockStrategies.set('performance_mock_error', {
      detect: (error) => error.message?.includes('performance') ||
                        error.message?.includes('Performance'),
      recover: (options) => this.handlePerformanceMockError(options: any),
      description: 'Performance API mocking failures'
    });

    // DOM mock creation errors
    this.mockStrategies.set('dom_mock_error', {
      detect: (error) => error.message?.includes('document') ||
                        error.message?.includes('Element'),
      recover: (options) => this.handleDOMMockError(options: any),
      description: 'DOM API mocking failures'
    });

    // Jest function mock errors
    this.mockStrategies.set('jest_function_error', {
      detect: (error) => error.message?.includes('jest.fn') ||
                        error.message?.includes('mock.calls'),
      recover: (options) => this.handleJestFunctionError(options: any),
      description: 'Jest function mocking failures'
    });
  }

  /**
   * Setup fallback mock implementations
   */
  setupFallbackMocks() {
    // Canvas fallback mock
    this.fallbackMocks.set('canvas', () => ({
      getContext: jest.fn((type) => {
        if (type === '2d') {
          return {
            canvas: { width: 800, height: 600 },
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            font: '10px sans-serif',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            
            // Drawing methods
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            clearRect: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            measureText: jest.fn((text) => ({ width: text.length * 6 })),
            
            // Path methods
            beginPath: jest.fn(),
            closePath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arc: jest.fn(),
            rect: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            
            // Transform methods
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            transform: jest.fn(),
            setTransform: jest.fn(),
            
            // Image methods
            drawImage: jest.fn(),
            getImageData: jest.fn((x, y, w, h) => ({
              data: new Uint8ClampedArray(w * h * 4),
              width: w,
              height: h
            })),
            putImageData: jest.fn(),
            createImageData: jest.fn((w, h) => ({
              data: new Uint8ClampedArray(w * h * 4),
              width: w,
              height: h
            }))
          };
        }
        return null;
      }),
      width: 800,
      height: 600,
      style: {},
      toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
      toBlob: jest.fn((callback) => callback && callback(new Blob()))
    }));

    // Audio fallback mock
    this.fallbackMocks.set('audio', () => ({
      context: {
        state: 'running',
        sampleRate: 44100,
        currentTime: 0,
        destination: { connect: jest.fn() },
        createGain: jest.fn(() => ({
          gain: { value: 1, setValueAtTime: jest.fn() },
          connect: jest.fn(),
          disconnect: jest.fn()
        })),
        createOscillator: jest.fn(() => ({
          frequency: { value: 440, setValueAtTime: jest.fn() },
          type: 'sine',
          connect: jest.fn(),
          disconnect: jest.fn(),
          start: jest.fn(),
          stop: jest.fn()
        })),
        createBufferSource: jest.fn(() => ({
          buffer: null,
          connect: jest.fn(),
          disconnect: jest.fn(),
          start: jest.fn(),
          stop: jest.fn()
        }))
      },
      element: {
        src: '',
        volume: 1,
        currentTime: 0,
        duration: 0,
        paused: true,
        ended: false,
        loop: false,
        muted: false,
        play: jest.fn(() => Promise.resolve()),
        pause: jest.fn(),
        load: jest.fn()
      }
    }));

    // Storage fallback mock
    this.fallbackMocks.set('storage', () => {
      const storage = new Map();
      return {
        getItem: jest.fn((key) => storage.get(key: any) || null),
        setItem: jest.fn((key, value) => storage.set(key, String(value: any))),
        removeItem: jest.fn((key) => storage.delete(key: any)),
        clear: jest.fn(() => storage.clear()),
        key: jest.fn((index) => Array.from(storage.keys())[index] || null),
        get length() { return storage.size; }
      };
    });

    // Performance fallback mock
    this.fallbackMocks.set('performance', () => ({
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
      },
      timing: {
        navigationStart: Date.now() - 5000,
        loadEventEnd: Date.now() - 1000
      }
    }));

    // DOM fallback mock
    this.fallbackMocks.set('dom', () => ({
      document: {
        createElement: jest.fn((tagName) => ({
          tagName: tagName.toUpperCase(),
          style: {},
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
            toggle: jest.fn(),
            contains: jest.fn(() => false)
          },
          setAttribute: jest.fn(),
          getAttribute: jest.fn(() => null),
          appendChild: jest.fn(),
          removeChild: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        })),
        getElementById: jest.fn(() => null),
        querySelector: jest.fn(() => null),
        querySelectorAll: jest.fn(() => [])
      },
      window: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        innerWidth: 1024,
        innerHeight: 768,
        devicePixelRatio: 1
      }
    }));
  }

  /**
   * Handle Canvas mock creation errors
   * @param {Object} options - Recovery options
   * @returns {Object} Recovery result
   */
  handleCanvasMockError(options = {}) {
    console.log('MockErrorHandler: Handling canvas mock error...');

    try {
      const canvasMock = this.fallbackMocks.get('canvas')();
      
      // Apply canvas mock to appropriate scope
      if (options.global !== false) {
        if (typeof global !== 'undefined') {
          (global as any).HTMLCanvasElement = class MockCanvas {
            constructor() {
              Object.assign(this, canvasMock);
            }
          };
        }
        
        if (typeof window !== 'undefined') {
          window.HTMLCanvasElement = global.HTMLCanvasElement;
        }
      }

      return {
        success: true,
        message: 'Canvas mock fallback applied successfully',
        mockApplied: 'canvas',
        capabilities: {
          context2d: true,
          webgl: false,
          drawing: true,
          imageData: true
        },
        guidance: [
          'Canvas 2D context mock is now available',
          'Basic drawing operations are supported',
          'WebGL context is not fully mocked'
        ]
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply canvas mock fallback',
        error: error.message,
        guidance: [
          'Consider using jest-canvas-mock package',
          'Check environment compatibility',
          'Verify test setup configuration'
        ]
      };
    }
  }

  /**
   * Handle Audio mock creation errors
   * @param {Object} options - Recovery options
   * @returns {Object} Recovery result
   */
  handleAudioMockError(options = {}) {
    console.log('MockErrorHandler: Handling audio mock error...');

    try {
      const audioMock = this.fallbackMocks.get('audio')();
      
      if (options.global !== false) {
        if (typeof global !== 'undefined') {
          (global as any).AudioContext = class MockAudioContext {
            constructor() {
              Object.assign(this, audioMock.context);
            }
          };
          
          (global as any).Audio = class MockAudio {
            constructor(src: any) {
              Object.assign(this, audioMock.element);
              this.src = src || '';
            }
          };
        }
        
        if (typeof window !== 'undefined') {
          window.AudioContext = global.AudioContext;
          window.webkitAudioContext = global.AudioContext;
          window.Audio = global.Audio;
        }
      }

      return {
        success: true,
        message: 'Audio mock fallback applied successfully',
        mockApplied: 'audio',
        capabilities: {
          audioContext: true,
          audioElement: true,
          webAudio: true,
          playback: true
        },
        guidance: [
          'Audio context and element mocks are now available',
          'Basic audio operations are supported',
          'Real audio playback will not occur'
        ]
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply audio mock fallback',
        error: error.message,
        guidance: [
          'Check audio API usage in tests',
          'Verify environment setup',
          'Consider more specific audio mocking'
        ]
      };
    }
  }

  /**
   * Handle Storage mock creation errors
   * @param {Object} options - Recovery options
   * @returns {Object} Recovery result
   */
  handleStorageMockError(options = {}) {
    console.log('MockErrorHandler: Handling storage mock error...');

    try {
      const storageMock = this.fallbackMocks.get('storage')();
      
      if (options.global !== false) {
        if (typeof global !== 'undefined') {
          (global as any).localStorage = storageMock;
          (global as any).sessionStorage = this.fallbackMocks.get('storage')(); // Separate instance
        }
        
        if (typeof window !== 'undefined') {
          window.localStorage = global.localStorage;
          window.sessionStorage = global.sessionStorage;
        }
      }

      return {
        success: true,
        message: 'Storage mock fallback applied successfully',
        mockApplied: 'storage',
        capabilities: {
          localStorage: true,
          sessionStorage: true,
          persistence: false
        },
        guidance: [
          'Storage mocks are now available',
          'Data will not persist between test runs',
          'Use isolated storage instances for each test'
        ]
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply storage mock fallback',
        error: error.message,
        guidance: [
          'Check storage API usage',
          'Verify environment compatibility',
          'Consider manual storage mocking'
        ]
      };
    }
  }

  /**
   * Handle Performance mock creation errors
   * @param {Object} options - Recovery options
   * @returns {Object} Recovery result
   */
  handlePerformanceMockError(options = {}) {
    console.log('MockErrorHandler: Handling performance mock error...');

    try {
      const performanceMock = this.fallbackMocks.get('performance')();
      
      if (options.global !== false) {
        if (typeof global !== 'undefined') {
          (global as any).performance = performanceMock;
        }
        
        if (typeof window !== 'undefined') {
          window.performance = global.performance;
        }
      }

      return {
        success: true,
        message: 'Performance mock fallback applied successfully',
        mockApplied: 'performance',
        capabilities: {
          timing: true,
          memory: true,
          marks: true,
          measures: true
        },
        guidance: [
          'Performance API mock is now available',
          'Timing measurements will be simulated',
          'Memory information is mocked'
        ]
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply performance mock fallback',
        error: error.message,
        guidance: [
          'Check performance API usage',
          'Verify timing measurements',
          'Consider alternative performance testing'
        ]
      };
    }
  }

  /**
   * Handle DOM mock creation errors
   * @param {Object} options - Recovery options
   * @returns {Object} Recovery result
   */
  handleDOMMockError(options = {}) {
    console.log('MockErrorHandler: Handling DOM mock error...');

    try {
      const domMock = this.fallbackMocks.get('dom')();
      
      if (options.global !== false) {
        if (typeof global !== 'undefined') {
          (global as any).document = domMock.document;
          (global as any).window = { ...global.window, ...domMock.window };
        }
      }

      return {
        success: true,
        message: 'DOM mock fallback applied successfully',
        mockApplied: 'dom',
        capabilities: {
          document: true,
          createElement: true,
          querySelector: true,
          events: true
        },
        guidance: [
          'Basic DOM mock is now available',
          'Element creation and selection are supported',
          'Complex DOM interactions may not work'
        ]
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply DOM mock fallback',
        error: error.message,
        guidance: [
          'Consider using jsdom environment',
          'Check DOM API usage in tests',
          'Verify test environment setup'
        ]
      };
    }
  }

  /**
   * Handle Jest function mock errors
   * @param {Object} options - Recovery options
   * @returns {Object} Recovery result
   */
  handleJestFunctionError(options = {}) {
    console.log('MockErrorHandler: Handling Jest function mock error...');

    try {
      // Ensure jest.fn is available
      if (typeof jest !== 'undefined' && typeof jest.fn === 'function') {
        return {
          success: true,
          message: 'Jest functions are already available',
          mockApplied: 'none',
          guidance: ['Jest functions should work normally']
        };
      }

      // Apply fallback jest.fn if not available
      const fallbackFn = () => {
        const mockFn = (...args) => {
          mockFn.mock.calls.push(args: any);
          return mockFn.mock.returnValue;
        };
        
        mockFn.mock = {
          calls: [],
          instances: [],
          results: [],
          returnValue: undefined
        };
        
        mockFn.mockReturnValue = (value) => {
          mockFn.mock.returnValue = value;
          return mockFn;
        };
        
        mockFn.mockImplementation = (fn) => {
          mockFn.mock.implementation = fn;
          return mockFn;
        };
        
        return mockFn;
      };

      if (typeof (global as any).jest = == 'undefined') {
        (global as any).jest = {};
      }
      global.jest.fn = fallbackFn;

      return {
        success: true,
        message: 'Jest function fallback applied successfully',
        mockApplied: 'jest.fn',
        capabilities: {
          mockFunctions: true,
          mockCalls: true,
          returnValues: true
        },
        guidance: [
          'Jest.fn fallback is now available',
          'Basic mocking functionality should work',
          'Advanced Jest features may be limited'
        ]
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply Jest function fallback',
        error: error.message,
        guidance: [
          'Import jest from @jest/globals',
          'Check Jest configuration',
          'Verify test setup'
        ]
      };
    }
  }

  /**
   * Handle mock creation error with automatic strategy selection
   * @param {Error} error - The error to handle
   * @param {Object} options - Recovery options
   * @returns {Object} Recovery result
   */
  handleMockCreationError(error, options = {}) {
    console.log('MockErrorHandler: Handling mock creation error...', error.message);

    // Log the error
    this.errorLog.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      options: options,
      recoveryAttempted: false
    });

    // Find appropriate recovery strategy
    for (const [strategyName, strategy] of this.mockStrategies) {
      if (strategy.detect(error: any)) {
        console.log(`MockErrorHandler: Using strategy "${strategyName}"`);
        
        const result = strategy.recover(options: any);
        
        // Update error log
        this.errorLog[this.errorLog.length - 1].recoveryAttempted = true;
        this.errorLog[this.errorLog.length - 1].recoveryStrategy = strategyName;
        this.errorLog[this.errorLog.length - 1].recoveryResult = result;
        
        return {
          strategy: strategyName,
          description: strategy.description,
          result: result
        };
      }
    }

    // No specific strategy found
    const generalResult = {
      success: false,
      message: 'No specific recovery strategy available for this mock error',
      guidance: [
        'Check mock creation code',
        'Verify Jest imports',
        'Review environment setup',
        'Consider manual mock implementation'
      ]
    };

    this.errorLog[this.errorLog.length - 1].recoveryAttempted = true;
    this.errorLog[this.errorLog.length - 1].recoveryStrategy = 'general';
    this.errorLog[this.errorLog.length - 1].recoveryResult = generalResult;

    return {
      strategy: 'general',
      description: 'General mock error guidance',
      result: generalResult
    };
  }

  /**
   * Validate mock compatibility across environments
   * @param {string} mockType - Type of mock to validate
   * @returns {Object} Compatibility report
   */
  validateMockCompatibility(mockType = 'all') {
    const environment = crossEnvironmentManager.getEnvironmentConfig();
    const compatibility = {
      environment: environment.type,
      timestamp: new Date().toISOString(),
      mockType: mockType,
      compatible: true,
      issues: [],
      recommendations: []
    };

    if (mockType === 'all' || mockType === 'canvas') {
      if (!environment.capabilities.canvas) {
        compatibility.issues.push('Canvas API not available in current environment');
        compatibility.recommendations.push('Use Canvas mock fallback');
      }
    }

    if (mockType === 'all' || mockType === 'audio') {
      if (!environment.capabilities.audioContext) {
        compatibility.issues.push('Audio Context not available in current environment');
        compatibility.recommendations.push('Use Audio mock fallback');
      }
    }

    if (mockType === 'all' || mockType === 'storage') {
      if (!environment.capabilities.localStorage) {
        compatibility.issues.push('LocalStorage not available in current environment');
        compatibility.recommendations.push('Use Storage mock fallback');
      }
    }

    if (mockType === 'all' || mockType === 'performance') {
      if (!environment.capabilities.performance) {
        compatibility.issues.push('Performance API not available in current environment');
        compatibility.recommendations.push('Use Performance mock fallback');
      }
    }

    compatibility.compatible = compatibility.issues.length === 0;
    this.compatibilityReports.set(mockType, compatibility);

    return compatibility;
  }

  /**
   * Get detailed error reporting for mock failures
   * @returns {Object} Error report
   */
  getErrorReport() {
    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.errorLog.length,
      recoveryAttempts: this.errorLog.filter(log => log.recoveryAttempted).length,
      successfulRecoveries: this.errorLog.filter(log => 
        log.recoveryAttempted && log.recoveryResult?.success
      ).length,
      errors: this.errorLog,
      compatibilityReports: Object.fromEntries(this.compatibilityReports),
      availableStrategies: Array.from(this.mockStrategies.keys()),
      fallbackMocks: Array.from(this.fallbackMocks.keys()),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations based on error patterns
   * @returns {Array<string>} Recommendations
   */
  generateRecommendations() {
    const recommendations: any[] = [];
    
    const canvasErrors = this.errorLog.filter(log => 
      log.error.includes('Canvas') || log.error.includes('getContext')
    ).length;
    
    const audioErrors = this.errorLog.filter(log => 
      log.error.includes('Audio') || log.error.includes('AudioContext')
    ).length;
    
    const storageErrors = this.errorLog.filter(log => 
      log.error.includes('Storage') || log.error.includes('localStorage')
    ).length;

    if (canvasErrors > 0) {
      recommendations.push('Consider using jest-canvas-mock for consistent Canvas mocking');
      recommendations.push('Use CrossEnvironmentManager for Canvas compatibility');
    }

    if (audioErrors > 0) {
      recommendations.push('Use Audio mock fallbacks for consistent testing');
      recommendations.push('Consider environment-specific audio testing strategies');
    }

    if (storageErrors > 0) {
      recommendations.push('Use Storage mock fallbacks for testing');
      recommendations.push('Clear storage state between tests');
    }

    if (this.errorLog.length === 0) {
      recommendations.push('No mock errors detected - mock setup appears healthy');
    }

    return recommendations;
  }

  /**
   * Clear error log and reset handler state
   */
  reset() {
    this.errorLog = [];
    this.compatibilityReports.clear();
    console.log('MockErrorHandler: State reset completed');
  }
}

// Export singleton instance
export const mockErrorHandler = new MockErrorHandler();

// Export helper functions
export const handleMockCreationError = (error, options) => 
  mockErrorHandler.handleMockCreationError(error, options);
export const validateMockCompatibility = (mockType) => 
  mockErrorHandler.validateMockCompatibility(mockType: any);
export const getMockErrorReport = () => mockErrorHandler.getErrorReport();