/**
 * テストユーティリティ型定義
 * TypeScript移行 - Task 24対応
 */

// Jest拡張マッチャー
declare namespace jest { interface Matchers<R> {
        toBeWithinRange(floor: number, ceiling: number): R,
        toMatchSnapshot(propertyMatchers?: any, hint?: string): R;
        toMatchInlineSnapshot(propertyMatchers?: any, snapshot?: string): R;
    }
    }
    
    interface Expect { <T = any>(actual: T): Matchers<T>,
        any(classType: any): any,
        anything(): any;
        arrayContaining(array: any[]): any,
        assertions(numberOfAssertions: number): void,
        hasAssertions(): void;
        not: InverseAsymmetricMatchers,
        objectContaining(object: any): any,
        stringContaining(string: string): any,
        stringMatching(regexp: string | RegExp): any, }
    }
    
    interface InverseAsymmetricMatchers { arrayContaining(array: any[]): any,
        objectContaining(object: any): any,
        stringContaining(string: string): any,
        stringMatching(regexp: string | RegExp): any, }
    }
}

// モック関数の型
export interface MockedFunction<T extends (...args: any[]) => any> extends jest.MockedFunction<T> { mockName(name: string): this,
    getMockName(): string }
}

// テスト用のCanvasコンテキストモック
export interface MockCanvasRenderingContext2D extends CanvasRenderingContext2D { __getEvents(): string[];
    __getDrawCalls(): any[];
    __clear(): void; }
}

// テストヘルパー関数の型
export interface TestHelpers { createMockCanvas(width?: number, height?: number): HTMLCanvasElement;
    createMockContext(): MockCanvasRenderingContext2D;
    waitForAnimation(duration?: number): Promise<void>;
    mockLocalStorage(): Storage;
    mockSessionStorage(): Storage;
    createMockAudioContext(): AudioContext;
    createMockWebSocket(url: string): WebSocket,
    }
}

// テストフィクスチャの型
export interface TestFixture<T> { setup(): Promise<T> | T;
    teardown(): Promise<void> | void;
    reset(): Promise<void> | void; }
}

// 共通のテストデータ型
export interface TestData { validData: any,
    invalidData: any,
    edgeCases: any[],
    mockResponses: any[] }
}

// 非同期テストユーティリティ
export interface AsyncTestUtils { waitFor(condition: () => boolean, timeout?: number): Promise<void>;
    delay(ms: number): Promise<void>,
    timeout(promise: Promise<any>, ms: number): Promise<any>,
    retry<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>
    }
}

// パフォーマンステスト用の型
export interface PerformanceTestResult { name: string,
    duration: number,
    memoryUsage?: number;
    operations?: number;
    operationsPerSecond?: number; }
}

export interface PerformanceTestOptions { iterations?: number;
    warmupIterations?: number;
    timeout?: number;
    memoryCheck?: boolean; }
}

// スナップショットテスト用の型
export interface SnapshotTestOptions { name?: string;
    propertyMatchers?: any;
    hint?: string; }
}

// エラーテスト用の型
export interface ErrorTestCase { name: string,
    input: any,
    expectedError: string | RegExp | Error,
    expectedErrorType?: any }
}

// モックストレージ実装
export interface MockStorage extends Storage { __clear(): void; }
    __getStore(): { [key: string]: string }
    __setStore(store: { [key: string]: string ): void, }
}

// タイマーモック
export interface MockTimers { useFakeTimers(): void;
    useRealTimers(): void;
    runAllTimers(): void;
    runOnlyPendingTimers(): void;
    advanceTimersByTime(ms: number): void,
    clearAllTimers(): void }
}

// イベントテストユーティリティ
export interface EventTestUtils { simulateClick(element: Element, options?: MouseEventInit): void;
    simulateKeyPress(element: Element, key: string, options?: KeyboardEventInit): void;
    simulateInput(element: HTMLInputElement, value: string): void,
    simulateFocus(element: Element): void,
    simulateBlur(element: Element): void,
    simulateDrag(element: Element, startX: number, startY: number, endX: number, endY: number): void }
}

// デバッグユーティリティ
export interface DebugUtils { logTestState(state: any): void, }
    captureConsoleOutput(): { logs: string[]; errors: string[]; warnings: string[] }
    suppressConsoleOutput(): () => void;
    measureExecutionTime<T>(fn: () => T): { result: T; time: number }
}

// テストデータビルダー
export interface TestDataBuilder<T> { with(key: keyof T, value: any): this,
    withDefaults(): this;
    withInvalid(key: keyof T): this,
    build(): T;
    buildMany(count: number): T[],
    }
}

// アサーションヘルパー
export interface AssertionHelpers { assertDefined<T>(value: T | undefined | null, message?: string): asserts value is T;
    assertType<T>(value: any, type: string, message?: string): asserts value is T;
    assertRange(value: number, min: number, max: number, message?: string): void;
    assertArrayLength<T>(array: T[], length: number, message?: string): void }
}