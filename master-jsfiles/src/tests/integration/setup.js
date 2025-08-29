/**
 * Jest統合テスト用セットアップファイル
 * Issue #37 Task 21: 統合テスト実装
 */

import { jest } from '@jest/globals';

// DOM環境の強化
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Canvas API モック
global.HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
    if (contextType === '2d') {
        return {
            // 描画メソッド
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            strokeRect: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            
            // テキスト描画
            fillText: jest.fn(),
            strokeText: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            
            // 画像描画
            drawImage: jest.fn(),
            
            // トランスフォーム
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            transform: jest.fn(),
            setTransform: jest.fn(),
            
            // プロパティ
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            font: '12px Arial',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            
            // イメージデータ
            createImageData: jest.fn(() => ({
                data: new Uint8ClampedArray(4),
                width: 1,
                height: 1
            })),
            getImageData: jest.fn(() => ({
                data: new Uint8ClampedArray(4),
                width: 1,
                height: 1
            })),
            putImageData: jest.fn()
        };
    }
    return null;
});

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
);

global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
    const blob = new Blob(['test'], { type: 'image/png' });
    setTimeout(() => callback(blob), 0);
});

// Image API モック
global.Image = class {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this.width = 100;
        this.height = 100;
        
        // src設定時の非同期読み込みをシミュレート
        setTimeout(() => {
            if (this.onload) {
                this.onload();
            }
        }, 0);
    }
    
    set src(value) {
        this._src = value;
        // 非同期でonloadを呼び出し
        setTimeout(() => {
            if (this.onload && typeof this.onload === 'function') {
                this.onload();
            }
        }, 10);
    }
    
    get src() {
        return this._src;
    }
};

// File API モック
global.File = class {
    constructor(bits, name, options = {}) {
        this.bits = bits;
        this.name = name;
        this.type = options.type || '';
        this.size = bits.reduce((size, bit) => size + bit.length, 0);
        this.lastModified = Date.now();
    }
};

global.FileReader = class {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this.onprogress = null;
        this.result = null;
        this.readyState = 0; // EMPTY
    }
    
    readAsDataURL(file) {
        this.readyState = 1; // LOADING
        setTimeout(() => {
            this.readyState = 2; // DONE
            this.result = 'data:image/png;base64,test';
            if (this.onload) {
                this.onload({ target: this });
            }
        }, 10);
    }
    
    readAsText(file) {
        this.readyState = 1; // LOADING
        setTimeout(() => {
            this.readyState = 2; // DONE
            this.result = 'test content';
            if (this.onload) {
                this.onload({ target: this });
            }
        }, 10);
    }
};

// Blob API モック
global.Blob = class {
    constructor(parts = [], options = {}) {
        this.size = parts.reduce((size, part) => size + part.length, 0);
        this.type = options.type || '';
        this.parts = parts;
    }
    
    slice(start = 0, end = this.size, contentType = '') {
        return new Blob(this.parts.slice(start, end), { type: contentType });
    }
    
    stream() {
        return new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array([1, 2, 3, 4]));
                controller.close();
            }
        });
    }
    
    text() {
        return Promise.resolve(this.parts.join(''));
    }
    
    arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(this.size));
    }
};

// URL API モック
global.URL = {
    createObjectURL: jest.fn(() => 'blob:http://localhost/test'),
    revokeObjectURL: jest.fn()
};

// Web Share API モック
global.navigator = {
    ...global.navigator,
    share: jest.fn().mockResolvedValue(undefined),
    canShare: jest.fn().mockReturnValue(true),
    userAgent: 'Mozilla/5.0 (Test Environment) AppleWebKit/537.36',
    platform: 'Test',
    language: 'ja-JP',
    languages: ['ja-JP', 'ja', 'en-US', 'en']
};

// Clipboard API モック
global.navigator.clipboard = {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('test text'),
    write: jest.fn().mockResolvedValue(undefined),
    read: jest.fn().mockResolvedValue([])
};

// Permissions API モック
global.navigator.permissions = {
    query: jest.fn().mockResolvedValue({ state: 'granted' })
};

// Performance API 強化
global.performance = {
    ...global.performance,
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    memory: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 50000000,
        jsHeapSizeLimit: 2000000000
    }
};

// ResizeObserver モック
global.ResizeObserver = class {
    constructor(callback) {
        this.callback = callback;
    }
    
    observe() {
        // 非同期でコールバックを呼び出し
        setTimeout(() => {
            this.callback([{
                target: document.body,
                contentRect: { width: 800, height: 600 }
            }]);
        }, 0);
    }
    
    unobserve() {}
    disconnect() {}
};

// IntersectionObserver モック
global.IntersectionObserver = class {
    constructor(callback) {
        this.callback = callback;
    }
    
    observe() {
        setTimeout(() => {
            this.callback([{
                target: document.body,
                isIntersecting: true,
                intersectionRatio: 1
            }]);
        }, 0);
    }
    
    unobserve() {}
    disconnect() {}
};

// LocalStorage モック
const localStorageMock = (() => {
    let store = {};
    
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = String(value);
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: jest.fn((index) => {
            const keys = Object.keys(store);
            return keys[index] || null;
        })
    };
})();

global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

// IndexedDB モック（簡略版）
global.indexedDB = {
    open: jest.fn(() => {
        const request = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: {
                transaction: jest.fn(() => ({
                    objectStore: jest.fn(() => ({
                        add: jest.fn(),
                        put: jest.fn(),
                        get: jest.fn(),
                        delete: jest.fn(),
                        clear: jest.fn()
                    }))
                }))
            }
        };
        
        setTimeout(() => {
            if (request.onsuccess) {
                request.onsuccess({ target: request });
            }
        }, 0);
        
        return request;
    }),
    deleteDatabase: jest.fn()
};

// Window methods
global.window.open = jest.fn();
global.window.close = jest.fn();
global.window.focus = jest.fn();

// CSS モック
global.getComputedStyle = jest.fn(() => ({
    getPropertyValue: jest.fn(() => ''),
    width: '100px',
    height: '100px',
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    transform: 'none',
    transition: 'none',
    animation: 'none'
}));

// Animation API モック
global.Element.prototype.animate = jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
}));

// Fetch API モック
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob())
    })
);

// Console methods のオーバーライド（テスト中の不要な出力を抑制）
const originalConsole = { ...console };
global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// テスト後のクリーンアップ
afterEach(() => {
    // DOM をクリーンアップ
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // LocalStorage をクリア
    localStorageMock.clear();
    
    // モックをリセット
    jest.clearAllMocks();
});

// テストスイート終了後のクリーンアップ
afterAll(() => {
    // グローバルなリソースをクリーンアップ
    global.console = originalConsole;
});

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
    console.error('統合テストで未処理のPromise拒否:', promise, 'reason:', reason);
});

// デバッグ用ヘルパー
global.testUtils = {
    // DOM要素の存在確認
    waitForElement: (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime >= timeout) {
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            
            checkElement();
        });
    },
    
    // イベントの発火をシミュレート
    fireEvent: (element, eventType, eventData = {}) => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        Object.assign(event, eventData);
        element.dispatchEvent(event);
        return event;
    },
    
    // 非同期処理の完了を待機
    waitFor: (conditionFn, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkCondition = () => {
                try {
                    if (conditionFn()) {
                        resolve();
                    } else if (Date.now() - startTime >= timeout) {
                        reject(new Error(`Condition not met within ${timeout}ms`));
                    } else {
                        setTimeout(checkCondition, 100);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            checkCondition();
        });
    }
};