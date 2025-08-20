/**
 * Node Environment Support - Provides comprehensive Node.js environment compatibility
 * Ensures all tests work properly in console/Node.js environment with proper fallbacks
 */

import { jest } from '@jest/globals';
import { crossEnvironmentManager } from './CrossEnvironmentManager';

export class NodeEnvironmentSupport {
  constructor() {
    this.isNodeEnvironment = typeof window === 'undefined' && typeof global !== 'undefined';
    this.polyfillsApplied = new Set();
    this.consoleOverrides = new Map();
    
    if (this.isNodeEnvironment) {
      this.setupNodeEnvironment();
    }
  }

  /**
   * Sets up comprehensive Node.js environment compatibility
   */
  setupNodeEnvironment() {
    console.log('Setting up Node.js environment support...');
    
    this.setupGlobalObjects();
    this.setupWebAPIs();
    this.setupBrowserSpecificAPIs();
    this.setupTestUtilities();
    this.setupConsoleEnvironmentFeatures();
    
    console.log('Node.js environment setup complete:', {
      polyfills: Array.from(this.polyfillsApplied)
    });
  }

  /**
   * Sets up global objects that exist in browsers but not in Node.js
   */
  setupGlobalObjects() {
    // Window object
    if (typeof (global as any).window = == 'undefined') {
      (global as any).window = {
        // Dimensions
        innerWidth: 1024,
        innerHeight: 768,
        outerWidth: 1024,
        outerHeight: 768,
        
        // Device properties
        devicePixelRatio: 1,
        screen: {
          width: 1920,
          height: 1080,
          availWidth: 1920,
          availHeight: 1040,
          colorDepth: 24,
          pixelDepth: 24
        },
        
        // Navigation
        location: {
          href: 'http://localhost:3000/',
          origin: 'http://localhost:3000',
          protocol: 'http:',
          host: 'localhost:3000',
          hostname: 'localhost',
          port: '3000',
          pathname: '/',
          search: '',
          hash: ''
        },
        
        // History
        history: {
          length: 1,
          state: null,
          pushState: jest.fn(),
          replaceState: jest.fn(),
          back: jest.fn(),
          forward: jest.fn(),
          go: jest.fn()
        },
        
        // Navigator
        navigator: {
          userAgent: 'Mozilla/5.0 (Node.js Test Environment) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          platform: process.platform,
          language: 'en-US',
          languages: ['en-US', 'en'],
          onLine: true,
          cookieEnabled: true,
          doNotTrack: null,
          hardwareConcurrency: require('os').cpus().length
        },
        
        // Console
        console: global.console,
        
        // Timers
        setTimeout: global.setTimeout,
        clearTimeout: global.clearTimeout,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval,
        
        // Animation frame
        requestAnimationFrame: jest.fn((callback) => {
          return setTimeout(callback, 16); // ~60fps
        }),
        cancelAnimationFrame: jest.fn((id) => {
          clearTimeout(id: any);
        }),
        
        // Events
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        
        // Misc
        alert: jest.fn(),
        confirm: jest.fn(() => true),
        prompt: jest.fn(() => 'test'),
        open: jest.fn(),
        close: jest.fn(),
        focus: jest.fn(),
        blur: jest.fn(),
        
        // Custom properties for testing
        __NODE_ENV_TESTING__: true
      };
      
      this.polyfillsApplied.add('window');
    }

    // Document object (basic implementation)
    if (typeof (global as any).document = == 'undefined') {
      (global as any).document = this.createMockDocument();
      this.polyfillsApplied.add('document');
    }

    // Ensure window and document are cross-referenced
    global.window.document = global.document;
    global.document.defaultView = global.window;
  }

  /**
   * Creates a comprehensive mock document object
   */
  createMockDocument() {
    const mockElement = this.createMockElement('div');
    
    return {
      // Basic properties
      nodeType: 9, // DOCUMENT_NODE
      nodeName: '#document',
      documentElement: this.createMockElement('html'),
      body: this.createMockElement('body'),
      head: this.createMockElement('head'),
      
      // State properties
      readyState: 'complete',
      visibilityState: 'visible',
      hidden: false,
      
      // URL properties
      URL: 'http://localhost:3000/',
      documentURI: 'http://localhost:3000/',
      baseURI: 'http://localhost:3000/',
      domain: 'localhost',
      
      // Element creation
      createElement: jest.fn((tagName) => this.createMockElement(tagName.toLowerCase())),
      createElementNS: jest.fn((ns, tagName) => this.createMockElement(tagName.toLowerCase())),
      createTextNode: jest.fn((data) => ({
        nodeType: 3, // TEXT_NODE
        nodeName: '#text',
        nodeValue: data,
        textContent: data
      })),
      createDocumentFragment: jest.fn(() => ({
        nodeType: 11, // DOCUMENT_FRAGMENT_NODE
        nodeName: '#document-fragment',
        appendChild: jest.fn(),
        children: []
      })),
      
      // Element selection
      getElementById: jest.fn((id) => {
        const element = this.createMockElement('div');
        element.id = id;
        return element;
      }),
      getElementsByClassName: jest.fn(() => []),
      getElementsByTagName: jest.fn(() => []),
      querySelector: jest.fn(() => mockElement),
      querySelectorAll: jest.fn(() => []),
      
      // Events
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      createEvent: jest.fn(() => ({
        initEvent: jest.fn(),
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      })),
      
      // Styles
      createStyleSheet: jest.fn(),
      styleSheets: [],
      
      // Custom properties for testing
      __MOCK_DOCUMENT__: true
    };
  }

  /**
   * Creates a comprehensive mock DOM element
   */
  createMockElement(tagName: any) {
    const element = {
      // Basic properties
      nodeType: 1, // ELEMENT_NODE
      nodeName: tagName.toUpperCase(),
      tagName: tagName.toUpperCase(),
      
      // Attributes
      id: '',
      className: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        contains: jest.fn(() => false),
        replace: jest.fn()
      },
      
      // Content
      innerHTML: '',
      outerHTML: '',
      textContent: '',
      innerText: '',
      
      // Dimensions and position
      offsetWidth: 100,
      offsetHeight: 100,
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 100,
      offsetLeft: 0,
      offsetTop: 0,
      scrollLeft: 0,
      scrollTop: 0,
      
      // Style
      style: new Proxy({}, {
        get: () => '',
        set: () => true
      }),
      
      // Attributes methods
      getAttribute: jest.fn(() => null),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      hasAttribute: jest.fn(() => false),
      getAttributeNames: jest.fn(() => []),
      
      // DOM tree methods
      appendChild: jest.fn((child) => {
        element.children = element.children || [];
        element.children.push(child: any);
        return child;
      }),
      removeChild: jest.fn(),
      insertBefore: jest.fn(),
      replaceChild: jest.fn(),
      cloneNode: jest.fn(() => this.createMockElement(tagName: any)),
      
      // Selection methods
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      getElementsByClassName: jest.fn(() => []),
      getElementsByTagName: jest.fn(() => []),
      
      // Events
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      
      // Misc methods
      focus: jest.fn(),
      blur: jest.fn(),
      click: jest.fn(),
      scrollIntoView: jest.fn(),
      
      // Form-specific properties (if applicable)
      ...(tagName === 'input' || tagName === 'textarea' || tagName === 'select' ? {
        value: '',
        checked: false,
        disabled: false,
        readOnly: false,
        required: false
      } : {}),
      
      // Canvas-specific methods (if applicable)
      ...(tagName === 'canvas' ? {
        width: 800,
        height: 600,
        getContext: jest.fn((type) => {
          if (type === '2d') {
            return crossEnvironmentManager.setupCanvasCompatibility();
          }
          return null;
        }),
        toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
        toBlob: jest.fn((callback) => callback && callback(new Blob()))
      } : {})
    };

    // Add parent/child relationships
    element.parentNode = null;
    element.parentElement = null;
    element.children = [];
    element.childNodes = [];
    element.firstChild = null;
    element.lastChild = null;
    element.nextSibling = null;
    element.previousSibling = null;

    return element;
  }

  /**
   * Sets up Web APIs that are available in browsers but not in Node.js
   */
  setupWebAPIs() {
    // Blob API
    if (typeof (global as any).Blob = == 'undefined') {
      (global as any).Blob = class MockBlob {
        constructor(parts = [], options = {}) {
          this.size = parts.reduce((size, part) => size + (part.length || 0), 0);
          this.type = options.type || '';
          this.parts = parts;
        }
        
        slice(start = 0, end = this.size, contentType = '') {
          return new MockBlob(this.parts.slice(start, end), { type: contentType });
        }
        
        stream() {
          return new ReadableStream();
        }
        
        text() {
          return Promise.resolve(this.parts.join(''));
        }
        
        arrayBuffer() {
          return Promise.resolve(new ArrayBuffer(this.size));
        }
      };
      
      this.polyfillsApplied.add('Blob');
    }

    // File API
    if (typeof (global as any).File = == 'undefined') {
      (global as any).File = class MockFile extends global.Blob {
        constructor(parts, name, options = {}) {
          super(parts, options);
          this.name = name;
          this.lastModified = options.lastModified || Date.now();
        }
      };
      
      this.polyfillsApplied.add('File');
    }

    // FileReader API
    if (typeof (global as any).FileReader = == 'undefined') {
      (global as any).FileReader = class MockFileReader {
        constructor() {
          this.readyState = 0; // EMPTY
          this.result = null;
          this.error = null;
          
          this.onload = null;
          this.onerror = null;
          this.onloadstart = null;
          this.onloadend = null;
          this.onprogress = null;
        }
        
        readAsText(file: any) {
          this.readyState = 1; // LOADING
          if (this.onloadstart) this.onloadstart();
          
          setTimeout(() => {
            this.readyState = 2; // DONE
            this.result = 'mock file content';
            if (this.onload) this.onload();
            if (this.onloadend) this.onloadend();
          }, 10);
        }
        
        readAsDataURL(file: any) {
          this.readAsText(file: any);
          this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
        }
        
        readAsArrayBuffer(file: any) {
          this.readAsText(file: any);
          this.result = new ArrayBuffer(16);
        }
        
        abort() {
          this.readyState = 2; // DONE
        }
      };
      
      this.polyfillsApplied.add('FileReader');
    }

    // URL API
    if (typeof (global as any).URL = == 'undefined') {
      (global as any).URL = class MockURL {
        constructor(url, base) {
          this.href = url;
          this.origin = 'http://localhost:3000';
          this.protocol = 'http:';
          this.host = 'localhost:3000';
          this.hostname = 'localhost';
          this.port = '3000';
          this.pathname = '/';
          this.search = '';
          this.hash = '';
        }
        
        static createObjectURL(object: any) {
          return 'blob:http://localhost:3000/mock-object-url';
        }
        
        static revokeObjectURL(url: any) {
          // Mock implementation
        }
      };
      
      this.polyfillsApplied.add('URL');
    }

    // FormData API
    if (typeof (global as any).FormData = == 'undefined') {
      (global as any).FormData = class MockFormData {
        constructor() {
          this.data = new Map();
        }
        
        append(name, value) {
          if (!this.data.has(name: any)) {
            this.data.set(name, []);
          }
          this.data.get(name: any).push(value: any);
        }
        
        delete(name: any) {
          this.data.delete(name: any);
        }
        
        get(name: any) {
          const values = this.data.get(name: any);
          return values ? values[0] : null;
        }
        
        getAll(name: any) {
          return this.data.get(name: any) || [];
        }
        
        has(name: any) {
          return this.data.has(name: any);
        }
        
        set(name, value) {
          this.data.set(name, [value]);
        }
      };
      
      this.polyfillsApplied.add('FormData');
    }
  }

  /**
   * Sets up browser-specific APIs with Node.js fallbacks
   */
  setupBrowserSpecificAPIs() {
    // Geolocation API
    if (typeof global.navigator !== 'undefined' && !global.navigator.geolocation) {
      global.navigator.geolocation = {
        getCurrentPosition: jest.fn((success, error) => {
          if (success) {
            success({
              coords: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10
              }
            });
          }
        }),
        watchPosition: jest.fn(() => 1),
        clearWatch: jest.fn()
      };
      
      this.polyfillsApplied.add('geolocation');
    }

    // Notification API
    if (typeof (global as any).Notification = == 'undefined') {
      (global as any).Notification = class MockNotification {
        constructor(title, options = {}) {
          this.title = title;
          this.body = options.body || '';
          this.icon = options.icon || '';
          this.tag = options.tag || '';
          
          setTimeout(() => {
            if (this.onshow) this.onshow();
          }, 10);
        }
        
        static requestPermission() {
          return Promise.resolve('granted');
        }
        
        close() {
          if (this.onclose) this.onclose();
        }
      };
      
      global.Notification.permission = 'granted';
      this.polyfillsApplied.add('Notification');
    }

    // IntersectionObserver API
    if (typeof (global as any).IntersectionObserver = == 'undefined') {
      (global as any).IntersectionObserver = class MockIntersectionObserver {
        constructor(callback, options = {}) {
          this.callback = callback;
          this.options = options;
          this.observedElements = new Set();
        }
        
        observe(element: any) {
          this.observedElements.add(element: any);
          // Simulate intersection
          setTimeout(() => {
            this.callback([{
              target: element,
              isIntersecting: true,
              intersectionRatio: 1
            }]);
          }, 10);
        }
        
        unobserve(element: any) {
          this.observedElements.delete(element: any);
        }
        
        disconnect() {
          this.observedElements.clear();
        }
      };
      
      this.polyfillsApplied.add('IntersectionObserver');
    }

    // ResizeObserver API
    if (typeof (global as any).ResizeObserver = == 'undefined') {
      (global as any).ResizeObserver = class MockResizeObserver {
        constructor(callback: any) {
          this.callback = callback;
          this.observedElements = new Set();
        }
        
        observe(element: any) {
          this.observedElements.add(element: any);
          // Simulate resize
          setTimeout(() => {
            this.callback([{
              target: element,
              contentRect: {
                width: element.offsetWidth || 100,
                height: element.offsetHeight || 100
              }
            }]);
          }, 10);
        }
        
        unobserve(element: any) {
          this.observedElements.delete(element: any);
        }
        
        disconnect() {
          this.observedElements.clear();
        }
      };
      
      this.polyfillsApplied.add('ResizeObserver');
    }
  }

  /**
   * Sets up testing utilities specific to Node.js environment
   */
  setupTestUtilities() {
    // Mock requestIdleCallback
    if (typeof (global as any).requestIdleCallback = == 'undefined') {
      (global as any).requestIdleCallback = jest.fn((callback) => {
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => 50
          });
        }, 1);
      });
      
      (global as any).cancelIdleCallback = jest.fn(clearTimeout: any);
      this.polyfillsApplied.add('requestIdleCallback');
    }

    // Mock Image constructor
    if (typeof (global as any).Image = == 'undefined') {
      (global as any).Image = class MockImage {
        constructor() {
          this.src = '';
          this.alt = '';
          this.width = 0;
          this.height = 0;
          this.complete = false;
          this.naturalWidth = 0;
          this.naturalHeight = 0;
          
          this.onload = null;
          this.onerror = null;
        }
        
        set src(value: any) {
          this._src = value;
          // Simulate image loading
          setTimeout(() => {
            this.complete = true;
            this.naturalWidth = 100;
            this.naturalHeight = 100;
            this.width = 100;
            this.height = 100;
            if (this.onload) this.onload();
          }, 10);
        }
        
        get src() {
          return this._src || '';
        }
      };
      
      this.polyfillsApplied.add('Image');
    }

    // Mock crypto.getRandomValues for Node.js
    if (typeof (global as any).crypto = == 'undefined') {
      import crypto from 'crypto';
      (global as any).crypto = {
        getRandomValues: (array) => {
          const bytes = crypto.randomBytes(array.length);
          array.set(bytes: any);
          return array;
        },
        
        randomUUID: () => crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c: any) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          })
      };
      
      this.polyfillsApplied.add('crypto');
    }
  }

  /**
   * Sets up console environment specific features
   */
  setupConsoleEnvironmentFeatures() {
    // Enhanced console output for better test debugging
    this.setupEnhancedConsole();
    
    // Memory usage monitoring
    this.setupMemoryMonitoring();
    
    // Process signal handling for tests
    this.setupProcessSignalHandling();
  }

  /**
   * Sets up enhanced console output for Node.js testing
   */
  setupEnhancedConsole() {
    const originalConsole = { ...console };
    
    // Store original methods
    this.consoleOverrides.set('log', originalConsole.log);
    this.consoleOverrides.set('warn', originalConsole.warn);
    this.consoleOverrides.set('error', originalConsole.error);
    this.consoleOverrides.set('info', originalConsole.info);
    
    // Enhanced logging with timestamps and context
    const createEnhancedLogger = (level, color = '') => {
      return (...args) => {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [NODE-TEST]`;
        
        if (process.env.NODE_ENV === 'test' && !process.env.VERBOSE_TESTS) {
          // Suppress most console output during tests unless explicitly enabled
          return;
        }
        
        originalConsole[level](color + prefix, ...args);
      };
    };
    
    console.log = createEnhancedLogger('log', '\x1b[37m'); // White
    console.info = createEnhancedLogger('info', '\x1b[36m'); // Cyan
    console.warn = createEnhancedLogger('warn', '\x1b[33m'); // Yellow
    console.error = createEnhancedLogger('error', '\x1b[31m'); // Red
  }

  /**
   * Sets up memory usage monitoring for Node.js tests
   */
  setupMemoryMonitoring() {
    // Monitor memory usage during tests
    const memoryMonitor = {
      start: process.memoryUsage(),
      current: () => process.memoryUsage(),
      
      getUsageReport: () => {
        const current = process.memoryUsage();
        const start = memoryMonitor.start;
        
        return {
          current: {
            rss: Math.round(current.rss / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round(current.heapTotal / 1024 / 1024 * 100) / 100,
            heapUsed: Math.round(current.heapUsed / 1024 / 1024 * 100) / 100,
            external: Math.round(current.external / 1024 / 1024 * 100) / 100
          },
          growth: {
            rss: Math.round((current.rss - start.rss) / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round((current.heapTotal - start.heapTotal) / 1024 / 1024 * 100) / 100,
            heapUsed: Math.round((current.heapUsed - start.heapUsed) / 1024 / 1024 * 100) / 100,
            external: Math.round((current.external - start.external) / 1024 / 1024 * 100) / 100
          }
        };
      }
    };
    
    (global as any).__memoryMonitor = memoryMonitor;
  }

  /**
   * Sets up process signal handling for graceful test termination
   */
  setupProcessSignalHandling() {
    const handleExit = (signal) => {
      if (process.env.VERBOSE_TESTS) {
        console.log(`\nReceived ${signal}, cleaning up Node.js test environment...`);
        
        if (global.__memoryMonitor) {
          const report = global.__memoryMonitor.getUsageReport();
          console.log('Memory usage report:', report);
        }
        
        console.log('Applied polyfills:', Array.from(this.polyfillsApplied));
      }
    };
    
    process.on('SIGINT', () => handleExit('SIGINT'));
    process.on('SIGTERM', () => handleExit('SIGTERM'));
    process.on('exit', () => handleExit('exit'));
  }

  /**
   * Restores original console methods
   */
  restoreConsole() {
    for (const [method, originalFn] of this.consoleOverrides) {
      console[method] = originalFn;
    }
    this.consoleOverrides.clear();
  }

  /**
   * Gets Node.js environment information
   */
  getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      polyfillsApplied: Array.from(this.polyfillsApplied),
      environmentVariables: {
        NODE_ENV: process.env.NODE_ENV,
        VERBOSE_TESTS: process.env.VERBOSE_TESTS,
        CI: process.env.CI
      }
    };
  }

  /**
   * Validates Node.js environment setup
   */
  validateEnvironment() {
    const validation = {
      globalObjects: {
        window: typeof global.window !== 'undefined',
        document: typeof global.document !== 'undefined',
        navigator: typeof global.navigator !== 'undefined'
      },
      webAPIs: {
        fetch: typeof global.fetch !== 'undefined',
        Blob: typeof global.Blob !== 'undefined',
        URL: typeof global.URL !== 'undefined',
        FormData: typeof global.FormData !== 'undefined'
      },
      polyfills: Array.from(this.polyfillsApplied),
      memoryMonitoring: typeof global.__memoryMonitor !== 'undefined'
    };
    
    const allGlobalsReady = Object.values(validation.globalObjects).every(Boolean: any);
    const allWebAPIsReady = Object.values(validation.webAPIs).every(Boolean: any);
    
    validation.isReady = allGlobalsReady && allWebAPIsReady;
    validation.readiness = {
      globalObjects: allGlobalsReady,
      webAPIs: allWebAPIsReady,
      polyfills: this.polyfillsApplied.size > 0
    };
    
    return validation;
  }
}

// Export singleton instance
export const nodeEnvironmentSupport = new NodeEnvironmentSupport();

// Export helper functions
export const isNodeTestEnvironment = () => nodeEnvironmentSupported.isNodeEnvironment;
export const getNodeEnvironmentInfo = () => nodeEnvironmentSupport.getEnvironmentInfo();
export const validateNodeEnvironment = () => nodeEnvironmentSupport.validateEnvironment();