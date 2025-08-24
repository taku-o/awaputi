/**
 * Cross Environment Manager - Ensures test compatibility across browser/console environments
 * Provides environment detection, API validation, and fallback implementations
 */

import { jest } from '@jest/globals';

export class CrossEnvironmentManager {
  private environmentType: string;
  private capabilities: any;
  private apiCompatibility: Map<string, any>;
  private polyfills: Map<string, any>;
  private fallbacks: Map<string, any>;

  constructor() {
    this.environmentType = this.detectEnvironment();
    this.capabilities = this.detectCapabilities();
    this.apiCompatibility = new Map();
    this.polyfills = new Map();
    this.fallbacks = new Map();
    
    this.initializeCrossEnvironmentSetup();
  }

  /**
   * Detects the current test environment type
   * @returns {string} Environment type: 'jsdom', 'node', 'browser'
   */
  detectEnvironment(): string {
    // Check for JSDOM environment
    if (typeof window !== 'undefined' && (window.constructor as any)?.name === 'Window' && 
        typeof window.navigator !== 'undefined' && 
        window.navigator.userAgent?.includes('jsdom')) {
      return 'jsdom';
    }
    
    // Check for browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && 
        typeof navigator !== 'undefined') {
      return 'browser';
    }
    
    // Default to Node.js console environment
    return 'node';
  }

  /**
   * Detects available capabilities in the current environment
   * @returns {Object} Capabilities object
   */
  detectCapabilities(): any {
    return {
      // DOM capabilities
      dom: typeof document !== 'undefined' && document.createElement,
      canvas: typeof HTMLCanvasElement !== 'undefined',
      webgl: this.checkWebGLSupport(),
      
      // Audio capabilities
      audioContext: typeof AudioContext !== 'undefined' || typeof (window as any)?.webkitAudioContext !== 'undefined',
      audioElement: typeof Audio !== 'undefined',
      
      // Storage capabilities
      localStorage: this.checkLocalStorageSupport(),
      sessionStorage: this.checkSessionStorageSupport(),
      indexedDB: typeof indexedDB !== 'undefined',
      
      // Event capabilities
      events: typeof EventTarget !== 'undefined',
      customEvents: typeof CustomEvent !== 'undefined',
      
      // Performance capabilities
      performance: typeof performance !== 'undefined',
      performanceObserver: typeof PerformanceObserver !== 'undefined',
      
      // Network capabilities
      fetch: typeof fetch !== 'undefined',
      xmlHttpRequest: typeof XMLHttpRequest !== 'undefined',
      
      // Worker capabilities
      webWorkers: typeof Worker !== 'undefined',
      serviceWorkers: typeof ServiceWorker !== 'undefined',
      
      // Modern JavaScript capabilities
      modules: this.checkModuleSupport(),
      async: true, // ES2017+ support assumed
      
      // Test environment specific
      jest: typeof jest !== 'undefined',
      mocking: typeof jest !== 'undefined' && typeof jest.fn === 'function'
    };
  }

  /**
   * Initialize cross-environment setup
   */
  initializeCrossEnvironmentSetup(): void {
    this.setupDOMCompatibility();
    this.setupCanvasCompatibility();
    this.setupAudioCompatibility();
    this.setupStorageCompatibility();
    this.setupPerformanceCompatibility();
    this.setupEventCompatibility();
    this.setupNetworkCompatibility();
    // Record environment info for debugging
    console.log(`CrossEnvironmentManager initialized: ${this.environmentType}`, {
      capabilities: Object.keys(this.capabilities).filter(key => this.capabilities[key])
    });
  }

  /**
   * Sets up DOM compatibility across environments
   */
  setupDOMCompatibility(): void {
    if (!this.capabilities.dom) {
      // Provide minimal DOM polyfills for Node.js environment
      (global as any).document = {
        createElement: jest.fn(() => ({
          getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            drawImage: jest.fn(),
            getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
            putImageData: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn()
          })),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          style: {},
          width: 800,
          height: 600
        })),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
          style: {}
        },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };

      (global as any).window = (global as any).window || {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        innerWidth: 1024,
        innerHeight: 768,
        devicePixelRatio: 1,
        requestAnimationFrame: jest.fn(cb => setTimeout(cb, 16)),
        cancelAnimationFrame: jest.fn(clearTimeout)
      };
    }

    // Ensure consistent DOM API behavior
    this.validateDOMAPIs();
  }

  /**
   * Sets up Canvas compatibility across environments
   */
  setupCanvasCompatibility(): void {
    if (!this.capabilities.canvas) {
      // Provide Canvas polyfill for environments without HTMLCanvasElement
      (global as any).HTMLCanvasElement = class MockCanvas {
        width: number;
        height: number;
        style: any;

        constructor() {
          this.width = 800;
          this.height = 600;
          this.style = {};
        }

        getContext(type: string): any {
          return this.createMockContext(type);
        }

        createMockContext(type: string): any {
          const mockContext = {
            canvas: this,
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
            measureText: jest.fn((text: string) => ({ width: text.length * 6 })),
            
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
            getImageData: jest.fn((x: number, y: number, w: number, h: number) => ({
              data: new Uint8ClampedArray(w * h * 4),
              width: w,
              height: h
            })),
            putImageData: jest.fn(),
            createImageData: jest.fn((w: number, h: number) => ({
              data: new Uint8ClampedArray(w * h * 4),
              width: w,
              height: h
            }))
          };

          if (type === 'webgl' || type === 'experimental-webgl') {
            return this.createMockWebGLContext();
          }

          return mockContext;
        }

        createMockWebGLContext(): any {
          return {
            canvas: this,
            drawingBufferWidth: this.width,
            drawingBufferHeight: this.height,
            
            // WebGL constants
            COLOR_BUFFER_BIT: 0x00004000,
            DEPTH_BUFFER_BIT: 0x00000100,
            TRIANGLES: 0x0004,
            
            // WebGL methods
            clear: jest.fn(),
            clearColor: jest.fn(),
            viewport: jest.fn(),
            useProgram: jest.fn(),
            drawArrays: jest.fn(),
            drawElements: jest.fn(),
            
            // Shader methods
            createShader: jest.fn(() => ({})),
            shaderSource: jest.fn(),
            compileShader: jest.fn(),
            createProgram: jest.fn(() => ({})),
            attachShader: jest.fn(),
            linkProgram: jest.fn(),
            
            // Buffer methods
            createBuffer: jest.fn(() => ({})),
            bindBuffer: jest.fn(),
            bufferData: jest.fn(),
            
            // Attribute methods
            getAttribLocation: jest.fn(() => 0),
            enableVertexAttribArray: jest.fn(),
            vertexAttribPointer: jest.fn(),
            
            // Uniform methods
            getUniformLocation: jest.fn(() => ({})),
            uniform1f: jest.fn(),
            uniform2f: jest.fn(),
            uniform3f: jest.fn(),
            uniform4f: jest.fn(),
            uniformMatrix4fv: jest.fn()
          };
        }

        toDataURL(): string {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        }

        toBlob(callback: (blob: Blob | null) => void): void {
          if (callback) {
            callback(new Blob(['fake-image-data'], { type: 'image/png' }));
          }
        }
      };

      // Add to document.createElement for consistency
      const originalCreateElement = (global as any).document?.createElement;
      if ((global as any).document && originalCreateElement) {
        (global as any).document.createElement = jest.fn((tagName: string) => {
          if (tagName.toLowerCase() === 'canvas') {
            return new (global as any).HTMLCanvasElement();
          }
          return originalCreateElement.call((global as any).document, tagName);
        });
      }
    }

    this.apiCompatibility.set('canvas', this.capabilities.canvas);
  }

  /**
   * Sets up Audio compatibility across environments
   */
  setupAudioCompatibility(): void {
    if (!this.capabilities.audioContext) {
      // Provide AudioContext polyfill
      (global as any).AudioContext = class MockAudioContext {
        state: string;
        sampleRate: number;
        currentTime: number;
        destination: any;

        constructor() {
          this.state = 'running';
          this.sampleRate = 44100;
          this.currentTime = 0;
          this.destination = { connect: jest.fn() };
        }

        createGain(): any {
          return {
            gain: { value: 1, setValueAtTime: jest.fn() },
            connect: jest.fn(),
            disconnect: jest.fn()
          };
        }

        createOscillator(): any {
          return {
            frequency: { value: 440, setValueAtTime: jest.fn() },
            type: 'sine',
            connect: jest.fn(),
            disconnect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
          };
        }

        createBufferSource(): any {
          return {
            buffer: null,
            connect: jest.fn(),
            disconnect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
          };
        }

        createBuffer(channels: number, length: number, sampleRate: number): any {
          return {
            numberOfChannels: channels,
            length,
            sampleRate,
            getChannelData: jest.fn(() => new Float32Array(length))
          };
        }

        decodeAudioData(audioData: ArrayBuffer): Promise<any> {
          return Promise.resolve(this.createBuffer(2, 44100, 44100));
        }

        resume(): Promise<void> {
          return Promise.resolve();
        }

        suspend(): Promise<void> {
          return Promise.resolve();
        }

        close(): Promise<void> {
          return Promise.resolve();
        }
      };

      (global as any).webkitAudioContext = (global as any).AudioContext;
    }

    if (!this.capabilities.audioElement) {
      (global as any).Audio = class MockAudio {
        src: string;
        volume: number;
        currentTime: number;
        duration: number;
        paused: boolean;
        ended: boolean;
        loop: boolean;
        muted: boolean;
        readyState: number;
        onload: (() => void) | null;
        onloadstart: (() => void) | null;
        onloadeddata: (() => void) | null;
        oncanplay: (() => void) | null;
        oncanplaythrough: (() => void) | null;
        onplay: (() => void) | null;
        onpause: (() => void) | null;
        onended: (() => void) | null;
        onerror: (() => void) | null;

        constructor(src?: string) {
          this.src = src || '';
          this.volume = 1;
          this.currentTime = 0;
          this.duration = 0;
          this.paused = true;
          this.ended = false;
          this.loop = false;
          this.muted = false;
          this.readyState = 4; // HAVE_ENOUGH_DATA
          
          // Event handlers
          this.onload = null;
          this.onloadstart = null;
          this.onloadeddata = null;
          this.oncanplay = null;
          this.oncanplaythrough = null;
          this.onplay = null;
          this.onpause = null;
          this.onended = null;
          this.onerror = null;
        }

        play(): Promise<void> {
          this.paused = false;
          if (this.onplay) this.onplay();
          return Promise.resolve();
        }

        pause(): void {
          this.paused = true;
          if (this.onpause) this.onpause();
        }

        load(): void {
          if (this.onloadstart) this.onloadstart();
          if (this.oncanplay) this.oncanplay();
        }

        addEventListener(event: string, handler: EventListener): void {
          (this as any)[`on${event}`] = handler;
        }

        removeEventListener(event: string, handler: EventListener): void {
          if ((this as any)[`on${event}`] === handler) {
            (this as any)[`on${event}`] = null;
          }
        }
      };
    }

    this.apiCompatibility.set('audio', this.capabilities.audioContext || this.capabilities.audioElement);
  }

  /**
   * Sets up Storage compatibility across environments
   */
  setupStorageCompatibility(): void {
    if (!this.capabilities.localStorage) {
      const createMockStorage = () => {
        const storage = new Map();
        return {
          getItem: jest.fn((key: string) => storage.get(key) || null),
          setItem: jest.fn((key: string, value: string) => storage.set(key, String(value))),
          removeItem: jest.fn((key: string) => storage.delete(key)),
          clear: jest.fn(() => storage.clear()),
          key: jest.fn((index: number) => Array.from(storage.keys())[index] || null),
          get length() { return storage.size; }
        };
      };

      (global as any).localStorage = createMockStorage();
      (global as any).sessionStorage = createMockStorage();
    }

    this.apiCompatibility.set('storage', this.capabilities.localStorage);
  }

  /**
   * Sets up Performance compatibility across environments
   */
  setupPerformanceCompatibility(): void {
    if (!this.capabilities.performance) {
      (global as any).performance = {
        now: jest.fn(() => Date.now()),
        mark: jest.fn(),
        measure: jest.fn(),
        getEntriesByType: jest.fn(() => []),
        getEntriesByName: jest.fn(() => []),
        clearMarks: jest.fn(),
        clearMeasures: jest.fn(),
        
        // Mock memory information
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
        },
        
        // Mock timing information
        timing: {
          navigationStart: Date.now() - 5000,
          loadEventEnd: Date.now() - 1000
        }
      };
    }

    // Ensure consistent performance.now() behavior
    const originalNow = performance.now.bind(performance);
    performance.now = jest.fn(() => {
      const time = originalNow();
      return time;
    });

    this.apiCompatibility.set('performance', this.capabilities.performance);
  }

  /**
   * Sets up Event compatibility across environments
   */
  setupEventCompatibility(): void {
    if (!this.capabilities.events) {
      (global as any).EventTarget = class MockEventTarget {
        listeners: Map<string, Set<EventListener>>;

        constructor() {
          this.listeners = new Map();
        }

        addEventListener(type: string, listener: EventListener): void {
          if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
          }
          this.listeners.get(type)!.add(listener);
        }

        removeEventListener(type: string, listener: EventListener): void {
          if (this.listeners.has(type)) {
            this.listeners.get(type)!.delete(listener);
          }
        }

        dispatchEvent(event: Event): boolean {
          if (this.listeners.has(event.type)) {
            this.listeners.get(event.type)!.forEach(listener => {
              if (typeof listener === 'function') {
                listener(event);
              } else if ((listener as any).handleEvent) {
                (listener as any).handleEvent(event);
              }
            });
          }
          return true;
        }
      };
    }

    if (!this.capabilities.customEvents) {
      (global as any).CustomEvent = class MockCustomEvent {
        type: string;
        detail: any;
        bubbles: boolean;
        cancelable: boolean;
        defaultPrevented: boolean;

        constructor(type: string, options: CustomEventInit = {}) {
          this.type = type;
          this.detail = options.detail;
          this.bubbles = options.bubbles || false;
          this.cancelable = options.cancelable || false;
          this.defaultPrevented = false;
        }

        preventDefault(): void {
          this.defaultPrevented = true;
        }

        stopPropagation(): void {
          // Mock implementation
        }
      };

      (global as any).Event = (global as any).Event || class MockEvent {
        type: string;
        bubbles: boolean;
        cancelable: boolean;
        defaultPrevented: boolean;

        constructor(type: string, options: EventInit = {}) {
          this.type = type;
          this.bubbles = options.bubbles || false;
          this.cancelable = options.cancelable || false;
          this.defaultPrevented = false;
        }

        preventDefault(): void {
          this.defaultPrevented = true;
        }

        stopPropagation(): void {
          // Mock implementation
        }
      };
    }

    this.apiCompatibility.set('events', this.capabilities.events);
  }

  /**
   * Sets up Network compatibility across environments
   */
  setupNetworkCompatibility(): void {
    if (!this.capabilities.fetch) {
      (global as any).fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(''),
          blob: () => Promise.resolve(new Blob()),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        })
      );
    }

    if (!this.capabilities.xmlHttpRequest) {
      (global as any).XMLHttpRequest = class MockXMLHttpRequest {
        readyState: number;
        status: number;
        responseText: string;
        response: any;
        onreadystatechange: (() => void) | null;

        constructor() {
          this.readyState = 0;
          this.status = 0;
          this.responseText = '';
          this.response = null;
          this.onreadystatechange = null;
        }

        open(method: string, url: string): void {
          this.readyState = 1;
        }

        send(data?: any): void {
          this.readyState = 4;
          this.status = 200;
          if (this.onreadystatechange) {
            this.onreadystatechange();
          }
        }

        setRequestHeader(): void {}
        getAllResponseHeaders(): string { return ''; }
        getResponseHeader(): string | null { return null; }
      };
    }

    this.apiCompatibility.set('network', this.capabilities.fetch || this.capabilities.xmlHttpRequest);
  }

  /**
   * Helper methods for capability detection
   */
  checkWebGLSupport(): boolean {
    try {
      const canvas = (document as any)?.createElement('canvas');
      return !!(canvas?.getContext('webgl') || canvas?.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  checkLocalStorageSupport(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkSessionStorageSupport(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkModuleSupport(): boolean {
    try {
      return typeof module !== 'undefined' && module.exports;
    } catch (e) {
      return false;
    }
  }

  /**
   * Validates that DOM APIs behave consistently across environments
   */
  validateDOMAPIs(): any {
    const validationResults = {
      createElement: typeof (document as any)?.createElement === 'function',
      querySelector: typeof (document as any)?.querySelector === 'function',
      getElementById: typeof (document as any)?.getElementById === 'function',
      addEventListener: typeof (document as any)?.addEventListener === 'function'
    };

    this.apiCompatibility.set('dom_apis', validationResults);
    return validationResults;
  }

  /**
   * Gets environment-specific configuration for tests
   * @returns {Object} Environment configuration
   */
  getEnvironmentConfig(): any {
    return {
      type: this.environmentType,
      capabilities: this.capabilities,
      compatibility: Object.fromEntries(this.apiCompatibility),
      
      // Test configuration recommendations
      testConfig: {
        timeout: this.environmentType === 'node' ? 5000 : 10000,
        retries: this.environmentType === 'jsdom' ? 1 : 2,
        parallel: this.environmentType !== 'browser',
        mockLevel: this.environmentType === 'node' ? 'full' : 'partial'
      },
      
      // Performance expectations
      performance: {
        expectRealTiming: this.environmentType === 'browser',
        expectRealMemory: this.environmentType === 'browser',
        expectRealNetwork: this.environmentType === 'browser'
      }
    };
  }

  /**
   * Provides fallback implementation for missing APIs
   * @param {string} apiName - Name of the API
   * @param {Object} fallbackImpl - Fallback implementation
   */
  provideFallback(apiName: string, fallbackImpl: any): void {
    this.fallbacks.set(apiName, fallbackImpl);
    // Apply fallback if API is not available
    if (!this.capabilities[apiName]) {
      Object.assign(global, fallbackImpl);
    }
  }

  /**
   * Checks if a specific API is available and compatible
   * @param {string} apiName - Name of the API to check
   * @returns {boolean} Whether the API is available
   */
  isAPIAvailable(apiName: string): boolean {
    return this.apiCompatibility.get(apiName) || false;
  }

  /**
   * Gets a comprehensive environment report
   * @returns {Object} Environment report
   */
  getEnvironmentReport(): any {
    return {
      environment: this.environmentType,
      timestamp: new Date().toISOString(),
      capabilities: this.capabilities,
      compatibility: Object.fromEntries(this.apiCompatibility),
      polyfills: Array.from(this.polyfills.keys()),
      fallbacks: Array.from(this.fallbacks.keys()),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generates recommendations based on environment analysis
   * @returns {Array<string>} Recommendations
   */
  generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.environmentType === 'node') {
      recommendations.push('Consider using jsdom for better DOM compatibility');
      recommendations.push('Mock implementations are being used for browser APIs');
    }

    if (!this.capabilities.canvas) {
      recommendations.push('Canvas tests will use mock implementations');
    }

    if (!this.capabilities.audioContext) {
      recommendations.push('Audio tests will use mock implementations');
    }

    if (!this.capabilities.performance) {
      recommendations.push('Performance measurements will be simulated');
    }

    return recommendations;
  }
}

// Export singleton instance
export const crossEnvironmentManager = new CrossEnvironmentManager();

// Export helper functions
export const isJSDOMEnvironment = () => crossEnvironmentManager.environmentType === 'jsdom';
export const isBrowserEnvironment = () => crossEnvironmentManager.environmentType === 'browser';
export const isNodeEnvironment = () => crossEnvironmentManager.environmentType === 'node';
export const getEnvironmentCapabilities = () => crossEnvironmentManager.capabilities;
export const getEnvironmentConfig = () => crossEnvironmentManager.getEnvironmentConfig();