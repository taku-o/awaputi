/**
 * Performance tests for BubblePop game
 * TypeScript移行 - Task 26対応
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
import { performance } from 'perf_hooks';

interface MockDocument {
  createElement: (tag: string) => any;
  getElementById: () => null;
  addEventListener: () => void;
  body: { appendChild: () => void };
}

interface MockWindow {
  innerWidth: number;
  innerHeight: number;
  devicePixelRatio: number;
  addEventListener: () => void;
  requestAnimationFrame: (callback: () => void) => number;
  performance: typeof performance;
}

interface MockLocalStorage {
  getItem: () => null;
  setItem: () => void;
  removeItem: () => void;
  clear: () => void;
}

interface MockNavigator {
  userAgent: string;
}

interface PerformanceResult {
  name: string;
  iterations: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  medianTime: number;
  opsPerSecond: number;
  memoryDiff: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

interface PerformanceReport {
  timestamp: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  results: PerformanceResult[];
}

interface RegressionResult {
  test: string;
  type: 'time' | 'memory';
  regression: number;
  current: number;
  baseline: number;
}

interface SaveData {
  username: string;
  currentScore: number;
  ap: number;
  tap: number;
  highScores: Record<string, number>;
  unlockedStages: string[];
  ownedItems: Array<{ id: string; level: number }>;
}

// Mock DOM environment for Node.js
(global as any).document = {
  createElement: (tag: string) => {
    if (tag === 'canvas') {
      return {
        getContext: () => ({
          clearRect: () => {},
          fillRect: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          scale: () => {},
          translate: () => {},
          rotate: () => {},
          fillText: () => {},
          measureText: () => ({ width: 100 }),
          createLinearGradient: () => ({
            addColorStop: () => {}
          }),
          canvas: { width: 800, height: 600 }
        }),
        width: 800,
        height: 600
      };
    }
    return {};
  },
  getElementById: () => null,
  addEventListener: () => {},
  body: { appendChild: () => {} }
} as MockDocument;

(global as any).window = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: () => {},
  requestAnimationFrame: (callback: () => void) => setTimeout(callback, 16) as any,
  performance: performance
} as MockWindow;

(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
} as MockLocalStorage;

(global as any).navigator = {
  userAgent: 'Mozilla/5.0 (Node.js) Performance Test Environment'
} as MockNavigator;

// Performance testing utilities
class PerformanceTester {
  private results: PerformanceResult[] = [];

  async measurePerformance(
    name: string,
    testFunction: () => void | Promise<void>,
    iterations: number = 100
  ): Promise<PerformanceResult> {
    const times: number[] = [];
    const memoryBefore = process.memoryUsage();
    
    // Warm-up runs
    for (let i = 0; i < Math.min(10, iterations); i++) {
      await testFunction();
    }
    
    // Actual measurements
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await testFunction();
      const end = performance.now();
      times.push(end - start);
    }
    
    const memoryAfter = process.memoryUsage();
    
    // Calculate statistics
    times.sort((a, b) => a - b);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = times[0];
    const maxTime = times[times.length - 1];
    const medianTime = times[Math.floor(times.length / 2)];
    const opsPerSecond = 1000 / avgTime;
    
    const result: PerformanceResult = {
      name,
      iterations,
      avgTime,
      minTime,
      maxTime,
      medianTime,
      opsPerSecond,
      memoryDiff: {
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        external: memoryAfter.external - memoryBefore.external
      }
    };
    
    this.results.push(result);
    return result;
  }

  getResults(): PerformanceResult[] {
    return [...this.results];
  }

  generateReport(): PerformanceReport {
    return {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      results: this.getResults()
    };
  }

  clear(): void {
    this.results = [];
  }
}

describe('BubblePop Performance Tests', () => {
  let tester: PerformanceTester;

  beforeEach(() => {
    tester = new PerformanceTester();
  });

  afterEach(() => {
    tester.clear();
  });

  test('Basic function call performance', async () => {
    const result = await tester.measurePerformance(
      'Basic math operations',
      () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += Math.sqrt(i) * Math.sin(i);
        }
        return sum;
      },
      100
    );

    console.log(`Basic math operations: ${result.avgTime.toFixed(3)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/sec`);
    
    expect(result.avgTime).toBeLessThan(10); // Should complete in less than 10ms
    expect(result.opsPerSecond).toBeGreaterThan(100); // Should handle at least 100 ops/sec
  });

  test('Array manipulation performance', async () => {
    const result = await tester.measurePerformance(
      'Array operations',
      () => {
        const arr = Array.from({ length: 1000 }, (_, i) => i);
        arr.sort((a, b) => b - a);
        arr.filter(x => x % 2 === 0);
        arr.map(x => x * 2);
        arr.reduce((sum, x) => sum + x, 0);
      },
      50
    );

    console.log(`Array operations: ${result.avgTime.toFixed(3)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/sec`);
    
    expect(result.avgTime).toBeLessThan(5); // Should complete in less than 5ms
    expect(result.memoryDiff.heapUsed).toBeLessThan(1024 * 1024); // Should use less than 1MB
  });

  test('Object creation and manipulation', async () => {
    const result = await tester.measurePerformance(
      'Object operations',
      () => {
        const objects = [];
        for (let i = 0; i < 100; i++) {
          objects.push({
            id: `bubble-${i}`,
            x: Math.random() * 800,
            y: Math.random() * 600,
            radius: 10 + Math.random() * 20,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            velocity: { x: Math.random() - 0.5, y: Math.random() - 0.5 }
          });
        }
        
        // Simulate game loop operations
        objects.forEach(obj => {
          obj.x += obj.velocity.x;
          obj.y += obj.velocity.y;
          if (obj.x < 0 || obj.x > 800) obj.velocity.x *= -1;
          if (obj.y < 0 || obj.y > 600) obj.velocity.y *= -1;
        });
        
        return objects.length;
      },
      200
    );

    console.log(`Object operations: ${result.avgTime.toFixed(3)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/sec`);
    
    expect(result.avgTime).toBeLessThan(2); // Should complete in less than 2ms
    expect(result.opsPerSecond).toBeGreaterThan(500); // Should handle at least 500 ops/sec
  });

  test('Canvas context operations simulation', async () => {
    const result = await tester.measurePerformance(
      'Canvas operations',
      () => {
        const canvas = document.createElement('canvas') as any;
        const ctx = canvas.getContext('2d');
        
        // Simulate drawing operations
        for (let i = 0; i < 50; i++) {
          ctx.save();
          ctx.translate(Math.random() * 800, Math.random() * 600);
          ctx.scale(0.5 + Math.random(), 0.5 + Math.random());
          ctx.rotate(Math.random() * Math.PI * 2);
          
          // Simulate drawing a bubble
          ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
          ctx.fillRect(-10, -10, 20, 20);
          
          ctx.restore();
        }
      },
      100
    );

    console.log(`Canvas operations: ${result.avgTime.toFixed(3)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/sec`);
    
    expect(result.avgTime).toBeLessThan(1); // Should complete in less than 1ms (mock operations)
    expect(result.opsPerSecond).toBeGreaterThan(1000); // Should handle at least 1000 ops/sec
  });

  test('JSON serialization performance', async () => {
    const largeObject: SaveData = {
      username: 'TestUser',
      currentScore: 150000,
      ap: 2500,
      tap: 15000,
      highScores: {},
      unlockedStages: [],
      ownedItems: []
    };

    // Fill with test data
    for (let i = 0; i < 100; i++) {
      largeObject.highScores[`stage-${i}`] = Math.floor(Math.random() * 100000);
      largeObject.unlockedStages.push(`stage-${i}`);
      largeObject.ownedItems.push({ id: `item-${i}`, level: Math.floor(Math.random() * 10) });
    }

    const result = await tester.measurePerformance(
      'JSON serialization',
      () => {
        const serialized = JSON.stringify(largeObject);
        const deserialized = JSON.parse(serialized);
        return deserialized;
      },
      200
    );

    console.log(`JSON operations: ${result.avgTime.toFixed(3)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/sec`);
    
    expect(result.avgTime).toBeLessThan(5); // Should complete in less than 5ms
    expect(result.opsPerSecond).toBeGreaterThan(200); // Should handle at least 200 ops/sec
  });

  test('Performance regression detection', async () => {
    // Simulate baseline performance
    const baseline = await tester.measurePerformance(
      'Regression test baseline',
      () => {
        let result = 0;
        for (let i = 0; i < 10000; i++) {
          result += Math.sqrt(i);
        }
        return result;
      },
      100
    );

    // Simulate current performance (should be similar)
    const current = await tester.measurePerformance(
      'Regression test current',
      () => {
        let result = 0;
        for (let i = 0; i < 10000; i++) {
          result += Math.sqrt(i);
        }
        return result;
      },
      100
    );

    const timeDifference = ((current.avgTime - baseline.avgTime) / baseline.avgTime) * 100;
    
    console.log(`Regression test - Baseline: ${baseline.avgTime.toFixed(3)}ms, Current: ${current.avgTime.toFixed(3)}ms`);
    console.log(`Performance difference: ${timeDifference.toFixed(2)}%`);
    
    // Allow for some variance in performance measurements
    expect(Math.abs(timeDifference)).toBeLessThan(50); // Less than 50% difference
  });

  test('Generate performance report', () => {
    const report = tester.generateReport();
    
    expect(report.timestamp).toBeDefined();
    expect(report.nodeVersion).toBeDefined();
    expect(report.platform).toBeDefined();
    expect(report.arch).toBeDefined();
    expect(Array.isArray(report.results)).toBe(true);
    
    console.log('Performance Report Generated:');
    console.log(`- Timestamp: ${report.timestamp}`);
    console.log(`- Node Version: ${report.nodeVersion}`);
    console.log(`- Platform: ${report.platform} ${report.arch}`);
    console.log(`- Total Tests: ${report.results.length}`);
    
    if (report.results.length > 0) {
      const avgOpsPerSec = report.results.reduce((sum, r) => sum + r.opsPerSecond, 0) / report.results.length;
      console.log(`- Average Ops/Sec: ${avgOpsPerSec.toFixed(0)}`);
    }
  });
});