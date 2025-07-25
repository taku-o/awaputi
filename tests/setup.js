/**
 * Jest setup file for BubblePop game tests
 */

import 'jest-canvas-mock';

// Import jest globals for ES modules
import { jest } from '@jest/globals';

// Make jest available globally
global.jest = jest;

global.webkitAudioContext = global.AudioContext;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16); // ~60fps
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  timing: {
    navigationStart: Date.now() - 1000,
    loadEventEnd: Date.now()
  },
  memory: {
    usedJSHeapSize: 1024 * 1024 * 50, // 50MB
    totalJSHeapSize: 1024 * 1024 * 100, // 100MB
    jsHeapSizeLimit: 1024 * 1024 * 200 // 200MB
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

// Mock Canvas API methods
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({ data: new Array(4) })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      canvas: {
        width: 800,
        height: 600
      }
    };
  }
  return null;
});

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
  jest.advanceTimersByTime(ms);
};

// Setup fake timers by default
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});