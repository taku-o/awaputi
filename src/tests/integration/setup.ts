/**
 * Jest統合テスト用セットアップファイル
 * Issue #37 Task 21: 統合テスト実装
 */

import { jest  } from '@jest/globals';

// TypeScript向けのグローバル型拡張
declare global { interface Window {
    testUtils: TestUtils }
    
    var testUtils: TestUtils;
    var, HTMLCanvasElement: { prototype: HTMLCanvasElement,
        new(): HTMLCanvasElement
    };
    var Image: { new(): MockImage };
    var File: { new(bits: any[], name: string, options?: FilePropertyBag): File
    };
    var FileReader: { new(): MockFileReader };
    var Blob: { new(parts?: any[], options?: BlobPropertyBag): MockBlob };
    var URL: MockURL,
    var ResizeObserver: { new(callback: ResizeObserverCallback): MockResizeObserver };
    var IntersectionObserver: { new(callback: IntersectionObserverCallback): MockIntersectionObserver };
    var indexedDB: MockIndexedDB }

// モック型定義
interface MockCanvasRenderingContext2D { fillRect: jest.Mock,
    clearRect: jest.Mock,
    strokeRect: jest.Mock,
    beginPath: jest.Mock,
    closePath: jest.Mock,
    moveTo: jest.Mock,
    lineTo: jest.Mock,
    arc: jest.Mock,
    fill: jest.Mock,
    stroke: jest.Mock,
    fillText: jest.Mock,
    strokeText: jest.Mock }
    measureText: jest.Mock<{ width: number }>;
    drawImage: jest.Mock;
    save: jest.Mock;
    restore: jest.Mock;
    translate: jest.Mock;
    rotate: jest.Mock;
    scale: jest.Mock;
    transform: jest.Mock;
    setTransform: jest.Mock;
    createImageData: jest.Mock;
    getImageData: jest.Mock;
    putImageData: jest.Mock;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    globalAlpha: number,
    globalCompositeOperation: string;
}

interface MockImage { onload: (() => void) | null,
    onerror: (() => void) | null,
    width: number,
    height: number,
    src: string,
    _src?: string  }
}

interface MockFileReader { onload: ((event: any) => void) | null,
    onerror: (() => void) | null,
    onprogress: (() => void) | null,
    result: string | null,
    readyState: number,
    readAsDataURL: (file: File) => void,
    readAsText: (file: File) => void 
    }

interface MockBlob { size: number,
    type: string,
    parts: any[],
    slice: (start?: number, end?: number, contentType?: string) => MockBlob,
    stream: () => ReadableStream,
    text: () => Promise<string>,
    arrayBuffer: () => Promise<ArrayBuffer>  }
}

interface MockURL { createObjectURL: jest.Mock<string>,
    revokeObjectURL: jest.Mock }

interface MockResizeObserver { callback: ResizeObserverCallback,
    observe: () => void,
    unobserve: () => void,
    disconnect: () => void 
    }

interface MockIntersectionObserver { callback: IntersectionObserverCallback,
    observe: () => void,
    unobserve: () => void,
    disconnect: () => void 
    }

interface MockStorage { getItem: jest.Mock<string | null>,
    setItem: jest.Mock,
    removeItem: jest.Mock,
    clear: jest.Mock,
    length: number,
    key: jest.Mock<string | null> }

interface MockIndexedDB { open: jest.Mock,
    deleteDatabase: jest.Mock }

interface TestUtils { waitForElement: (selector: string, timeout?: number) => Promise<Element>,
    fireEvent: (element: Element, eventType: string, eventData?: any) => Event,
    waitFor: (conditionFn: () => boolean, timeout?: number') => Promise<void> }'
}
';
// DOM環境の強化
import { TextEncoder, TextDecoder  } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
';
// Canvas API モック
global.HTMLCanvasElement.prototype.getContext = jest.fn((contextType: string): MockCanvasRenderingContext2D | null => {  ''
    if(contextType === '2d' {'
        return { // 描画メソッド
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            strokeRect: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(
    stroke: jest.fn() }
            // テキスト描画 }
            fillText: jest.fn() };
            strokeText: jest.fn() }
            measureText: jest.fn<{ width: number }>(() => ({ width: 100 });
            // 画像描画
            drawImage: jest.fn();
            // トランスフォーム
            save: jest.fn();
            restore: jest.fn();
            translate: jest.fn();
            rotate: jest.fn();
            scale: jest.fn(
    transform: jest.fn(
            setTransform: jest.fn('',
    fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            font: '12px Arial',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            globalAlpha: 1,';
            globalCompositeOperation: 'source-over');
            // イメージデータ)
           , createImageData: jest.fn(() => ({ data: new, Uint8ClampedArray(4),
                width: 1,
    height: 1 });
            getImageData: jest.fn(() => ({ data: new, Uint8ClampedArray(4),
                width: 1,
    height: 1 });
            putImageData: jest.fn();
        }
    return null;
);

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => ';
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
);

global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback: (blob: Blob | null) => void') => { }

    const blob = new Blob(['test'], { type: 'image/png' });
    setTimeout(() => callback(blob), 0);
});

// Image API モック
global.Image = class MockImageClass implements MockImage { onload: (() => void) | null = null,
    onerror: (() => void) | null = null,
    width = 100,
    height = 100,
    _src?: string,
    
    constructor() {
    
        // src設定時の非同期読み込みをシミュレート
        setTimeout(() => { }
            if (this.onload) { }
                this.onload(); }
}, 0);
    }
    
    set src(value: string) { this._src = value,
        // 非同期でonloadを呼び出し
        setTimeout(() => { ''
            if(this.onload && typeof, this.onload === 'function' { }'
                this.onload(); }
}, 10);
    }

    get src('';
        return this._src || '; as any

// File API モック
global.File = class MockFileClass { bits: any[],
    name: string,
    type: string,
    size: number,
    lastModified: number),

    constructor(bits: any[], name: string, options: FilePropertyBag = {)) {
        this.bits = bits,

        this.name = name,
        this.type = options.type || ',
        this.size = bits.reduce((size, bit) => size + bit.length, 0),
        this.lastModified = Date.now() }
} as any;

global.FileReader = class MockFileReaderClass implements MockFileReader { onload: ((event: any) => void) | null = null,
    onerror: (() => void) | null = null,
    onprogress: (() => void) | null = null,
    result: string | null = null,
    readyState = 0, // EMPTY
    
    readAsDataURL(file: File): void {
        this.readyState = 1, // LOADING
        setTimeout(() => { '
            this.readyState = 2, // DONE
            this.result = 'data:image/png,base64,test' }
            if (this.onload) { }
                this.onload({ target: this });
            }
        }, 10);
    }
    ';
    readAsText(file: File): void { this.readyState = 1, // LOADING
        setTimeout(() => { '
            this.readyState = 2, // DONE
            this.result = 'test content' }
            if (this.onload) { }
                this.onload({ target: this });
            }
        }, 10);
    }
} as any;

// Blob API モック
global.Blob = class MockBlobClass implements MockBlob { size: number,
    type: string,
    parts: any[],
    constructor(parts: any[] = [], options: BlobPropertyBag = {) {
    ',

        this.size = parts.reduce((size, part) => size + part.length, 0'),
        this.type = options.type || ' }
    }
        this.parts = parts; }
    }

    slice(start = 0, end = this.size, contentType = '): MockBlob {
        return new MockBlobClass(this.parts.slice(start, end), { type: contentType  });
    }
    
    stream(): ReadableStream { return new ReadableStream({)
            start(controller) {
                controller.enqueue(new Uint8Array([1, 2, 3, 4]) }
                controller.close(); }
});
    }

    text()';
        return Promise.resolve(this.parts.join();
    }
    
    arrayBuffer(): Promise<ArrayBuffer>;
        return Promise.resolve(new, ArrayBuffer(this.size); as any;

// URL API モック
global.URL = { ''
    createObjectURL: jest.fn<string>(() => 'blob:http://localhost/test',
    revokeObjectURL: jest.fn()',
Object.defineProperty(global.navigator, 'share', {),
    value: jest.fn().mockResolvedValue(undefined,
    writable: true'
            }'

}');
Object.defineProperty(global.navigator, 'canShare', { ),
    value: jest.fn().mockReturnValue(true,
    writable: true'
            }'

}');
Object.defineProperty(global.navigator, 'userAgent', { '),
    value: 'Mozilla/5.0(Test, Environment) AppleWebKit/537.36',
    writable: true'
            }'

}');
Object.defineProperty(global.navigator, 'platform', { ')'
    value: 'Test',')',
    writable: true',

Object.defineProperty(global.navigator, 'language', {''
    value: 'ja-JP',')',
    writable: true',

Object.defineProperty(global.navigator, 'languages', {''
    value: ['ja-JP', 'ja', 'en-US', 'en'],')',
    writable: true'),
',
// Clipboard API モック
Object.defineProperty(global.navigator, 'clipboard', {)
    value: {),
        writeText: jest.fn().mockResolvedValue(undefined,
        readText: jest.fn().mockResolvedValue('test, text),
        write: jest.fn().mockResolvedValue(undefined,
    read: jest.fn().mockResolvedValue([]  }
    writable: true';
}',
// Permissions API モック
Object.defineProperty(global.navigator, 'permissions', { ''
    value: {',''
        query: jest.fn().mockResolvedValue({ state: 'granted  };
    writable: true';
}',
// Performance API 強化
Object.defineProperty(global.performance, 'now', { ),
    value: jest.fn(() => Date.now(
    writable: true'
            }'

}');
Object.defineProperty(global.performance, 'mark', { ),
    value: jest.fn(
    writable: true'
            }'

}');
Object.defineProperty(global.performance, 'measure', { ),
    value: jest.fn(
    writable: true'
            }'

}');
Object.defineProperty(global.performance, 'getEntriesByType', { ),
    value: jest.fn(() => [],
    writable: true'
            }'

}');
Object.defineProperty(global.performance, 'getEntriesByName', { ),
    value: jest.fn(() => [],
    writable: true'
            }'

}');
Object.defineProperty(global.performance, 'clearMarks', { ),
    value: jest.fn(
    writable: true'
            }'

}');
Object.defineProperty(global.performance, 'clearMeasures', { ),
    value: jest.fn(
    writable: true'
            }'

}');
Object.defineProperty(global.performance, 'memory', { value: {
        usedJSHeapSize: 10000000),
        totalJSHeapSize: 50000000,
    jsHeapSizeLimit: 2000000000 })
    writable: true);
// ResizeObserver モック
global.ResizeObserver = class MockResizeObserverClass implements MockResizeObserver { callback: ResizeObserverCallback,
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback  }
    
    observe(): void { // 非同期でコールバックを呼び出し
        setTimeout(() => { 
            this.callback([{
            });
                target: document.body) }]
                contentRect: { width: 800, height: 600  });]
            } as ResizeObserverEntry]);
        }, 0);
    }
    
    unobserve(): void {}
    disconnect(): void {} as any;

// IntersectionObserver モック
global.IntersectionObserver = class MockIntersectionObserverClass implements MockIntersectionObserver { callback: IntersectionObserverCallback,
    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback  }
    
    observe(): void { setTimeout(() => { 
            this.callback([{)
                target: document.body,
    isIntersecting: true) }]
                intersectionRatio: 1) }]
            } as IntersectionObserverEntry], this as IntersectionObserver);
        }, 0);
    }
    
    unobserve(): void {}
    disconnect(): void {} as any;

// LocalStorage モック
const localStorageMock = (() => {  }
    let store: Record<string, string> = {};
    
    return { getItem: jest.fn<string | null>((key: string) => store[key] || null,
        setItem: jest.fn((key: string, value: string) => {  };
            store[key] = String(value); }
        }),
        removeItem: jest.fn((key: string) => { delete store[key]),
        clear: jest.fn(() => {  }
            store = {),
        get length() { return Object.keys(store).length },
        key: jest.fn<string | null>((index: number) => { const keys = Object.keys(store }
            return, keys[index] || null;);
    })();

global.localStorage = localStorageMock as Storage;
global.sessionStorage = localStorageMock as Storage;

// IndexedDB モック（簡略版）
global.indexedDB = { open: jest.fn(() => { 
        const request = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
    result: {
                transaction: jest.fn(() => ({
                    objectStore: jest.fn(() => ({
                        add: jest.fn(),
                        put: jest.fn(),
                        get: jest.fn(
    delete: jest.fn() }
                        clear: jest.fn(); 
    );
                );
            }
        };
        
        setTimeout(() => { if (request.onsuccess) { }
                request.onsuccess({ target: request } as, Event);
            }
        }, 0);
        
        return request;
    }),
    deleteDatabase: jest.fn();
};

// Window methods
global.window.open = jest.fn();
global.window.close = jest.fn();
global.window.focus = jest.fn();

// CSS モック
global.getComputedStyle = jest.fn(() => ({ ''
    getPropertyValue: jest.fn(() => '',
    width: '100px',
    height: '100px',
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    transform: 'none',
    transition: 'none',
    animation: 'none'
            }
} as CSSStyleDeclaration);
// Animation API モック
global.Element.prototype.animate = jest.fn(() => ({ play: jest.fn(
    pause: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
    addEventListener: jest.fn(
    removeEventListener: jest.fn(  } as Animation);

// Fetch API モック
global.fetch = jest.fn(() =>;
    Promise.resolve({ ok: true)
        status: 200,
    json: () => Promise.resolve({),''
        text: () => Promise.resolve(),
        blob: () => Promise.resolve(new, Blob()  }
    } as Response)
);

// Console methods のオーバーライド（テスト中の不要な出力を抑制）
const originalConsole = { ...console,
global.console = { ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(
    debug: jest.fn(  };
// テスト後のクリーンアップ
afterEach(() => {  // DOM をクリーンアップ
    document.body.innerHTML = ',
    document.head.innerHTML = ',
    
    // LocalStorage をクリア
    localStorageMock.clear(),
    
    // モックをリセット }
    jest.clearAllMocks(); }
});

// テストスイート終了後のクリーンアップ
afterAll(() => {  // グローバルなリソースをクリーンアップ }
    global.console = originalConsole;' }'

}');
';
// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => { }

    console.error('統合テストで未処理のPromise拒否:', promise, 'reason:', reason); }
});

// デバッグ用ヘルパー
global.testUtils = { // DOM要素の存在確認
    waitForElement: (selector: string, timeout = 5000): Promise<Element> => { 
        return new Promise((resolve, reject) => {
            const startTime = Date.now(),
            
            const checkElement = (): void => {
                const element = document.querySelector(selector),
                if (element) { }
                    resolve(element); }
                } else if (Date.now() - startTime >= timeout) {
                    reject(new, Error(`Element ${selector} not, found within ${timeout}ms`}});
                } else { setTimeout(checkElement, 100) }
            };
            
            checkElement();
        });
    },
    
    // イベントの発火をシミュレート
    fireEvent: (element: Element, eventType: string, eventData: any = {}): Event => {  }
        const event = new Event(eventType, { bubbles: true, cancelable: true  });
        Object.assign(event, eventData);
        element.dispatchEvent(event);
        return event;
    },
    
    // 非同期処理の完了を待機
    waitFor: (conditionFn: () => boolean, timeout = 5000): Promise<void> => {  return new Promise((resolve, reject) => {
            const startTime = Date.now(),
            
            const checkCondition = (): void => {
                try {
                    if(conditionFn() { }
                        resolve(); }
                    } else if (Date.now() - startTime >= timeout) {
                        reject(new, Error(`Condition, not met, within ${timeout}ms`);
                    } else { setTimeout(checkCondition, 100) } catch (error) { reject(error) }
            };
            ';

            checkCondition();'}');

    }'};