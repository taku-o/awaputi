/**
 * Centralized Mock Factory for consistent mock creation across all tests
 * Provides standardized mocks for Canvas, Audio, Performance, and Analytics APIs
 */

import { jest } from '@jest/globals';

export class MockFactory {
  /**
   * Creates a standardized Canvas mock with all required methods
   */
  static createCanvasMock() {
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: jest.fn(() => ({
        // Basic drawing methods
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        strokeRect: jest.fn(),
        
        // Path methods
        beginPath: jest.fn(),
        closePath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arc: jest.fn(),
        arcTo: jest.fn(),
        
        // Fill and stroke
        fill: jest.fn(),
        stroke: jest.fn(),
        
        // Transformations
        scale: jest.fn(),
        rotate: jest.fn(),
        translate: jest.fn(),
        transform: jest.fn(),
        setTransform: jest.fn(),
        resetTransform: jest.fn(),
        
        // Styles
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
        globalAlpha: 1.0,
        font: '10px sans-serif',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        
        // Text methods
        fillText: jest.fn(),
        strokeText: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        
        // Image methods
        drawImage: jest.fn(),
        createImageData: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        
        // State methods
        save: jest.fn(),
        restore: jest.fn(),
        
        // Gradient methods
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        })),
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        })),
        
        // Pattern methods
        createPattern: jest.fn(),
        
        // Compositing
        globalCompositeOperation: 'source-over'
      })),
      
      // Canvas element properties
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600
      }))
    };
    
    return mockCanvas;
  }

  /**
   * Creates a complete AudioManager mock with all expected methods
   */
  static createAudioManagerMock() {
    return {
      // Audio playback methods
      playSound: jest.fn(),
      playSoundEffect: jest.fn(),
      playBackgroundMusic: jest.fn(),
      stopSound: jest.fn(),
      stopAllSounds: jest.fn(),
      
      // Volume control
      setVolume: jest.fn(),
      setMasterVolume: jest.fn(),
      setSoundEffectVolume: jest.fn(),
      setBackgroundMusicVolume: jest.fn(),
      getVolume: jest.fn(() => 0.8),
      getMasterVolume: jest.fn(() => 0.8),
      
      // Status and state management
      getStatus: jest.fn(() => ({
        isEnabled: true,
        masterVolume: 0.8,
        soundEffectVolume: 0.8,
        backgroundMusicVolume: 0.6,
        activeSounds: 0,
        isLoading: false
      })),
      
      isEnabled: jest.fn(() => true),
      enable: jest.fn(),
      disable: jest.fn(),
      
      // Audio loading and management
      loadAudio: jest.fn(() => Promise.resolve()),
      preloadSounds: jest.fn(() => Promise.resolve()),
      unloadSounds: jest.fn(),
      
      // Configuration
      configure: jest.fn(),
      reset: jest.fn(),
      
      // Event handling
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      
      // Properties
      audioContext: null,
      sounds: new Map(),
      isInitialized: true
    };
  }

  /**
   * Creates a complete AnalyticsAPI mock with all expected methods
   */
  static createAnalyticsAPIMock() {
    return {
      // Core analytics methods
      track: jest.fn(),
      trackEvent: jest.fn(),
      trackPage: jest.fn(),
      trackError: jest.fn(),
      
      // Data collection
      collect: jest.fn(),
      collectMetrics: jest.fn(),
      collectUserData: jest.fn(),
      
      // Configuration and management
      configure: jest.fn(),
      initialize: jest.fn(() => Promise.resolve()),
      reset: jest.fn(),
      
      // Missing method that tests expect
      evaluateCondition: jest.fn(() => true),
      
      // Rate limiting and endpoints
      endpoints: new Map([
        ['events', '/api/events'],
        ['metrics', '/api/metrics'],
        ['errors', '/api/errors']
      ]),
      
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        timeWindow: 60000,
        currentRequests: 0
      },
      
      // Status and state
      isEnabled: jest.fn(() => true),
      getStatus: jest.fn(() => ({
        initialized: true,
        enabled: true,
        pendingEvents: 0,
        errors: []
      })),
      
      // Privacy and consent
      setConsent: jest.fn(),
      hasConsent: jest.fn(() => true),
      
      // Event queuing
      queue: [],
      flush: jest.fn(() => Promise.resolve()),
      
      // Properties
      apiKey: 'test-api-key',
      userId: 'test-user-id',
      sessionId: 'test-session-id'
    };
  }

  /**
   * Creates an environment-aware performance mock
   */
  static createPerformanceMock() {
    const isCI = process.env.CI;
    const performanceFactor = isCI ? 0.7 : 1.0; // Simulate CI performance impact
    
    return {
      // Performance timing
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
      
      // Memory information (if available)
      memory: {
        usedJSHeapSize: Math.floor(10 * 1024 * 1024 * performanceFactor), // 10MB baseline
        totalJSHeapSize: Math.floor(50 * 1024 * 1024 * performanceFactor), // 50MB baseline
        jsHeapSizeLimit: Math.floor(2 * 1024 * 1024 * 1024 * performanceFactor) // 2GB baseline
      },
      
      // Navigation timing
      timing: {
        navigationStart: Date.now() - 5000,
        loadEventEnd: Date.now() - 1000,
        domContentLoadedEventEnd: Date.now() - 2000
      },
      
      // Performance observers
      PerformanceObserver: jest.fn(() => ({
        observe: jest.fn(),
        disconnect: jest.fn()
      })),
      
      // Custom performance methods for testing
      getFrameRate: jest.fn(() => isCI ? 45 : 60),
      getRenderTime: jest.fn(() => isCI ? 25 : 16),
      getMemoryUsage: jest.fn(() => ({
        used: Math.floor(10 * 1024 * 1024 * performanceFactor),
        total: Math.floor(50 * 1024 * 1024 * performanceFactor)
      }))
    };
  }

  /**
   * Creates localStorage mock for testing
   */
  static createLocalStorageMock() {
    const store = new Map();
    
    return {
      getItem: jest.fn((key) => store.get(key: any7121 || null),
      setItem: jest.fn((key, value) => store.set(key, String(value: any7204)),
      removeItem: jest.fn((key) => store.delete(key: any7269),
      clear: jest.fn(() => store.clear()),
      key: jest.fn((index) => Array.from(store.keys())[index] || null),
      get length() {
        return store.size;
      }
    };
  }

  /**
   * Creates a comprehensive DOM mock for jsdom enhancement
   */
  static createDOMMock() {
    return {
      createElement: jest.fn((tagName) => ({
        tagName: tagName.toUpperCase(),
        style: {},
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(() => false),
          toggle: jest.fn()
        },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
        getBoundingClientRect: jest.fn(() => ({
          left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50
        }))
      })),
      
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        style: {}
      }
    };
  }

  /**
   * Sets up comprehensive global mocks for test environment
   */
  static setupGlobalMocks() {
    // Canvas API mock
    (global as any).HTMLCanvasElement = jest.fn(() => MockFactory.createCanvasMock());
    (global as any).CanvasRenderingContext2D = jest.fn() as jest.Mock;
    
    // Performance API mock
    (global as any).performance = MockFactory.createPerformanceMock();
    
    // Storage API mock
    (global as any).localStorage = MockFactory.createLocalStorageMock();
    (global as any).sessionStorage = MockFactory.createLocalStorageMock();
    
    // Request Animation Frame mock
    (global as any).requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
    (global as any).cancelAnimationFrame = jest.fn((id) => clearTimeout(id: any9224);
    
    // Image mock
    (global as any).Image = jest.fn(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      width: 100,
      height: 100,
      onload: null,
      onerror: null,
      src: ''
    }));
    
    // Audio mock
    (global as any).Audio = jest.fn(() => ({
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      volume: 1.0,
      currentTime: 0,
      duration: 0,
      paused: true,
      ended: false
    }));
    
    // URL mock
    (global as any).URL = {
      createObjectURL: jest.fn(() => 'blob:mock-url'),
      revokeObjectURL: jest.fn()
    };
    
    // Console methods (preserve existing, add missing)
    if (!global.console.warn) global.console.warn = jest.fn() as jest.Mock;
    if (!global.console.error) global.console.error = jest.fn() as jest.Mock;
    if (!global.console.debug) global.console.debug = jest.fn() as jest.Mock;
  }
}

// Auto-setup global mocks when this module is imported
MockFactory.setupGlobalMocks();