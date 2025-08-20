/**
 * Jest setup file for BubblePop game tests
 * Enhanced with Environment Manager for Issue #106 stability fixes
 */

// Import environment stabilization (Issue #106 Task 4)
import { EnvironmentManager } from './utils/EnvironmentManager';
import { ModuleLoadingOptimizer } from './utils/ModuleLoadingOptimizer';

// Use jest-canvas-mock for ES Modules compatibility
import 'jest-canvas-mock';

// Import standardized MockFactory for consistent mocking
import { MockFactory } from './mocks/MockFactory';

// Initialize environment manager for test stability
try {
    EnvironmentManager.setupTestEnvironment();
    ModuleLoadingOptimizer.optimizeESModuleLoading();
    console.debug('[Setup] Environment stabilization initialized');
} catch (error) {
    console.error('[Setup] Environment stabilization failed:', error);
}

// Set up global environment variables
(global as any).__PROD__ = false;
(global as any).__ANALYTICS_ID__ = null;

(global as any).webkitAudioContext = global.AudioContext;

// Mock requestAnimationFrame
(global as any).requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16); // ~60fps
};

(global as any).cancelAnimationFrame = (id) => {
  clearTimeout(id;
};

// Use MockFactory for enhanced performance and storage mocking
// (MockFactory.setupGlobalMocks() is called automatically on import)
// Performance API is now environment-aware (CI vs local development)
// localStorage mock is now fully functional with jest.fn() methods

// Mock console methods for cleaner test output
(global as any).console = {
  ...console,
  log: () => {},
  warn: () => {},
  error: () => {},
  info: () => {}
};

// Canvas mocking is handled by jest-canvas-mock

// Mock touch events
(global as any).TouchEvent = class TouchEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.touches = options.touches || [];
    this.targetTouches = options.targetTouches || [];
    this.changedTouches = options.changedTouches || [];
  }
};

// Mock pointer events
(global as any).PointerEvent = class PointerEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.pointerId = options.pointerId || 1;
    this.pointerType = options.pointerType || 'mouse';
    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
  }
};

// Mock navigator
Object.defineProperty(global.navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  writable: true
});

// Mock window dimensions
Object.defineProperty(global.window, 'innerWidth', {
  value: 1024,
  writable: true
});

Object.defineProperty(global.window, 'innerHeight', {
  value: 768,
  writable: true
});

// Mock screen
(global as any).screen = {
  width: 1920,
  height: 1080,
  availWidth: 1920,
  availHeight: 1040
};

// Mock devicePixelRatio
Object.defineProperty(global.window, 'devicePixelRatio', {
  value: 1,
  writable: true
});

// Mock Notification API
(global as any).Notification = class Notification {
  static permission = 'granted';
  static requestPermission = jest.fn(() => Promise.resolve('granted'));
  
  constructor(title, options = {}) {
    this.title = title;
    this.body = options.body || '';
    this.icon = options.icon || '';
    this.badge = options.badge || '';
    this.onclick = null;
    this.onclose = null;
    this.onerror = null;
    this.onshow = null;
  }
  
  close() {
    if (this.onclose) this.onclose();
  }
};

// Mock IndexedDB
const mockIDBDatabase = {
  createObjectStore: jest.fn(() => ({
    add: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve(undefined),
    put: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    count: jest.fn(() => Promise.resolve(0)),
    openCursor: jest.fn(() => Promise.resolve(null)
  })),
  transaction: jest.fn(() => ({
    objectStore: jest.fn(() => mockIDBDatabase.createObjectStore()),
    oncomplete: null,
    onerror: null,
    onabort: null
  })),
  close: jest.fn(),
  version: 1,
  name: 'test'
};

const mockIDBRequest = {
  result: mockIDBDatabase,
  error: null,
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null
};

(global as any).indexedDB = {
  open: jest.fn(() => {
    const request = { ...mockIDBRequest };
    // Simulate async behavior
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess({ target: request });
      if (request.onupgradeneeded) request.onupgradeneeded({ target: request });
    }, 0);
    return request;
  }),
  deleteDatabase: jest.fn(() => mockIDBRequest),
  cmp: jest.fn()
};

(global as any).IDBDatabase = function() { return mockIDBDatabase; };
(global as any).IDBTransaction = function() {};
(global as any).IDBRequest = function() { return mockIDBRequest; };
(global as any).IDBObjectStore = function() { return mockIDBDatabase.createObjectStore(); };
(global as any).IDBCursor = function() {};
(global as any).IDBKeyRange = {
  bound: jest.fn(),
  lowerBound: jest.fn(),
  upperBound: jest.fn(),
  only: jest.fn()
};

// Helper function to create mock canvas element
(global as any).createMockCanvas = (width = 800, height = 600) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Helper function to create mock mouse event
(global as any).createMockMouseEvent = (type, x = 0, y = 0, options = {}) => {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Helper function to create mock touch event
(global as any).createMockTouchEvent = (type, touches = [], options = {}) => {
  return new TouchEvent(type, {
    touches,
    targetTouches: touches,
    changedTouches: touches,
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Helper function to advance time in tests
(global as any).advanceTime = (ms) => {
  // Timer advancement will be handled by individual test files
};

// Setup completed - beforeEach/afterEach should be used in individual test files

// Environment cleanup registration (Issue #106 Task 4)
if (typeof afterAll !== 'undefined') {
    afterAll(async () => {
        try {
            await EnvironmentManager.handleAsyncOperationCleanup();
            EnvironmentManager.cleanupTestEnvironment();
            EnvironmentManager.preventMemoryLeaks();
            
            await ModuleLoadingOptimizer.handleAsyncModuleCleanup();
            ModuleLoadingOptimizer.cleanup();
            
            console.debug('[Setup] Global cleanup completed');
        } catch (error) {
            console.error('[Setup] Global cleanup failed:', error);
        }
    });
}

// Per-test cleanup (Issue #106 Task 4)
if (typeof afterEach !== 'undefined') {
    afterEach(async () => {
        try {
            ModuleLoadingOptimizer.preventModuleCacheLeaks();
        } catch (error) {
            console.warn('[Setup] Per-test cleanup failed:', error);
        }
    });
}