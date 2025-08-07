/**
 * Jest setup file for BubblePop game tests
 */

// Use jest-canvas-mock for ES Modules compatibility
import 'jest-canvas-mock';

// Import standardized MockFactory for consistent mocking
import { MockFactory } from './mocks/MockFactory.js';

// Set up global environment variables
global.__PROD__ = false;
global.__ANALYTICS_ID__ = null;

global.webkitAudioContext = global.AudioContext;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16); // ~60fps
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Use MockFactory for enhanced performance and storage mocking
// (MockFactory.setupGlobalMocks() is called automatically on import)
// Performance API is now environment-aware (CI vs local development)
// localStorage mock is now fully functional with jest.fn() methods

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: () => {},
  warn: () => {},
  error: () => {},
  info: () => {}
};

// Canvas mocking is handled by jest-canvas-mock

// Mock touch events
global.TouchEvent = class TouchEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.touches = options.touches || [];
    this.targetTouches = options.targetTouches || [];
    this.changedTouches = options.changedTouches || [];
  }
};

// Mock pointer events
global.PointerEvent = class PointerEvent extends Event {
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
global.screen = {
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

// Mock IndexedDB
const mockIDBDatabase = {
  createObjectStore: jest.fn(() => ({
    add: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve(undefined)),
    put: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    count: jest.fn(() => Promise.resolve(0)),
    openCursor: jest.fn(() => Promise.resolve(null))
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

global.indexedDB = {
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

global.IDBDatabase = function() { return mockIDBDatabase; };
global.IDBTransaction = function() {};
global.IDBRequest = function() { return mockIDBRequest; };
global.IDBObjectStore = function() { return mockIDBDatabase.createObjectStore(); };
global.IDBCursor = function() {};
global.IDBKeyRange = {
  bound: jest.fn(),
  lowerBound: jest.fn(),
  upperBound: jest.fn(),
  only: jest.fn()
};

// Helper function to create mock canvas element
global.createMockCanvas = (width = 800, height = 600) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Helper function to create mock mouse event
global.createMockMouseEvent = (type, x = 0, y = 0, options = {}) => {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Helper function to create mock touch event
global.createMockTouchEvent = (type, touches = [], options = {}) => {
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
global.advanceTime = (ms) => {
  // Timer advancement will be handled by individual test files
};

// Setup completed - beforeEach/afterEach should be used in individual test files