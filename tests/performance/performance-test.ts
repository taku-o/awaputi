/**
 * Performance tests for BubblePop game
 * TypeScript移行 - Task 26対応
 */

import { performance  } from 'perf_hooks';
// @ts-ignore 将来のパフォーマンス測定で使用予定
import { createCanvas, Canvas  } from 'canvas';
// @ts-ignore 将来のゲームエンジンテストで使用予定
import { GameEngine  } from '../../src/core/GameEngine.js';
import { Bubble  } from '../../src/bubbles/Bubble.js';
import { Position, BubbleType  } from '../../src/types/bubble.js';

interface MockDocument {
  createElement: (ta;g: string) => any;
  getElementById: () => null;
  addEventListener: () => void;
  body: { appendChil;d: () => void };
}

interface MockWindow {
  innerWidth: number,
  innerHeight: number,
  devicePixelRatio: number,
  addEventListener: () => void;
  requestAnimationFrame: (callbac;k: () => void) => number,
  performance: typeof performance,
}

interface MockLocalStorage {
  getItem: () => null;
  setItem: () => void;
  removeItem: () => void;
  clear: (') => void;
}

interface MockNavigator {
  userAgent: string,
}

interface PerformanceResult {
  name: string,
  iterations: number,
  avgTime: number,
  minTime: number,
  maxTime: number,
  medianTime: number,
  opsPerSecond: number,
  memoryDiff: {
    heapUse;d: number,
    heapTotal: number,
    external: number,
  };
}

interface PerformanceReport {
  timestamp: string,
  nodeVersion: string,
  platform: string,
  arch: string,
  results: PerformanceResult[],
}

interface RegressionResult {
  test: string,
  type: 'time' | 'memory',
  regression: number,
  current: number,
  baseline: number,
}

interface SaveData {
  username: string,
  currentScore: number,
  ap: number,
  tap: number,
  highScores: Record<string, number>;
  unlockedStages: string[],
  ownedItems: Array<{ i;d: string;, level: number }>;
}

// Mock DOM environment for Node.js
(global as any).document = {
  createElement: (tag: string') => {
    if (tag === 'canvas') {
      return createCanvas(800, 600);
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
  getItem: () => null;
  setItem: () => {};
  removeItem: () => {};
  clear: () => {}
} as MockLocalStorage;

(global as any').navigator = {
  userAgent: 'Node.js Performance Test'
} as MockNavigator;

class PerformanceTest {
  private results: PerformanceResult[] = [],

  async runTest(
    name: string, 
    testFunction: () => Promise<any> | any, 
    iterations: number = 1000
  ): Promise<PerformanceResult> {
    console.log(`\n🧪 Running ${name)...`);
    
    const, times: number[] = [],
    let, memoryBefore: NodeJS.MemoryUsage, memoryAfter: NodeJS.MemoryUsage,
    
    // Warm, up
    for (let, i = 0; i < 10; i++) {
      await, testFunction(});
    }
    
    // Measure memory before
    if ((global as any).gc) {
      (global as any).gc();
    }
    memoryBefore = process.memoryUsage();
    
    // Run actual test
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await testFunction();
      const end = performance.now();
      times.push(end - start);
    }
    
    // Measure memory after
    memoryAfter = process.memoryUsage();
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const medianTime = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
    
    const memoryDiff = {
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
      external: memoryAfter.external - memoryBefore.external
    };
    
    const result: PerformanceResult = {
      name,
      iterations,
      avgTime: Math.round(avgTime * 1000) / 1000, // Round to 3 decimal places
      minTime: Math.round(minTime * 1000) / 1000,
      maxTime: Math.round(maxTime * 1000) / 1000,
      medianTime: Math.round(medianTime * 1000) / 1000,
      opsPerSecond: Math.round(1000 / avgTime),
      memoryDiff
    };
    
    this.results.push(result);
    
    console.log(`   ⏱️  Average: ${result.avgTime)ms`),
    console.log(`   📊 Ops/sec: ${result.opsPerSecond)`),
    console.log(`   💾 Memory: ${Math.round(memoryDiff.heapUsed / 1024})}KB`);
    
    return result;
  }

  printSummary('): void {
    console.log('\n📋 Performance Test Summary'');
    console.log('=' .repeat(60);
    
    this.results.forEach(result => {);
      console.log(`\n${result.name):`});
      console.log(`  Average Time: ${result.avgTime}ms`);
      console.log(`  Min/Max: ${result.minTime}ms / ${result.maxTime}ms`);
      console.log(`  Median: ${result.medianTime}ms`);
      console.log(`  Operations/sec: ${result.opsPerSecond)`),
      console.log(`  Memory, Impact: ${Math.round(result.memoryDiff.heapUsed / 1024})}KB`);
    }');
    
    // Performance thresholds
    console.log('\n🎯 Performance Analysis: '),
    this.results.forEach(result => {
      const warnings: string[] = [],
      );
      if (result.avgTime > 16') { // 60fps = 16.67ms per frame
        warnings.push('⚠️  Average time exceeds 60fps budget (16.67ms')');
      }
      
      if (result.maxTime > 33') { // 30fps = 33.33ms per frame
        warnings.push('⚠️  Max time exceeds 30fps budget (33.33ms')');
      }
      
      if (result.memoryDiff.heapUsed > 1024 * 1024') { // 1MB
        warnings.push('⚠️  High memory usage (>1MB')');
      }
      
      if (warnings.length > 0) {
        console.log(`\n${result.name}:`);
        warnings.forEach(warning => console.log(`  ${warning)`)});
      } else {
        console.log(`\n✅ ${result.name): Performance, OK`});
      }
    });
  }

  getResults(): PerformanceResult[] {
    return [...this.results];
  }
}

async function runPerformanceTests(): Promise<PerformanceReport> {
  const tester = new PerformanceTest(');
  
  console.log('🚀 Starting BubblePop Performance Tests'');
  
  // Test 1: Bubble Creation Performance
  await tester.runTest('Bubble Creation', (') => {
    const position: Position = { x: 100, y: 100 };
    const bubble = new Bubble('normal', position);
    return bubble;
  }, 10000);
  
  // Test 2: Bubble Update Performance
  const, testBubbles: Bubble[] = [],
  for (let i = 0; i < 100; i++) {
    const position: Position = { 
      x: Math.random() * 800, 
      y: Math.random(') * 600 
    };
    testBubbles.push(new Bubble('normal', position)');
  }
  
  await tester.runTest('Bubble Update (100 bubbles')', () => {
    testBubbles.forEach(bubble => bubble.update(16);
  }, 1000');
  
  // Test 3: Bubble Collision Detection
  const, testBubblePosition: Position = { x: 400, y: 300 };
  const testBubble = new Bubble('normal', testBubblePosition');
  await tester.runTest('Bubble Collision Detection', () => {
    for (let i = 0; i < 100; i++) {
      testBubble.containsPoint();
        Math.random() * 800,
        Math.random() * 600
      );
    }
  }, 1000');
  
  // Test 4: Special Bubble Effects
  await tester.runTest('Special Bubble Effects', (') => {
    const specialBubbles = [
      new Bubble('rainbow', { x: 100, y: 100 }'),
      new Bubble('electric', { x: 200, y: 200 }'),
      new Bubble('spiky', { x: 300, y: 300 })
    ];
    
    specialBubbles.forEach(bubble => {);
      bubble.destroy();
      bubble.getAndClearEffects();
    });
  }, 1000');
  
  // Test 5: Boundary Collision Performance
  const, movingBubblePosition: Position = { x: 10, y: 10 };
  const movingBubble = new Bubble('normal', movingBubblePosition');
  movingBubble.velocity = { x: -50, y: -50 };
  
  await tester.runTest('Boundary Collision', () => {
    movingBubble.handleBoundaryCollision();
  }, 5000');
  
  // Test 6: Escaping Bubble Behavior
  const, escapingBubblePosition: Position = { x: 400, y: 300 };
  const escapingBubble = new Bubble('escaping', escapingBubblePosition');
  await tester.runTest('Escaping Bubble AI', () => {
    escapingBubble.update(16, { x: 450, y: 350 });
  }, 2000);
  
  // Test 7: Canvas Rendering (Mock);
  const mockCanvas = createCanvas(800, 600');
  const mockContext = mockCanvas.getContext('2d');
  const renderBubbles: Bubble[] = [],
  for (let i = 0; i < 50; i++) {
    const position: Position = {
      x: Math.random() * 800,
      y: Math.random(') * 600
    };
    renderBubbles.push(new Bubble('normal', position)');
  }
  
  await tester.runTest('Canvas Rendering (50 bubbles')', () => {
    mockContext.clearRect(0, 0, 800, 600);
    renderBubbles.forEach(bubble => {
      // Simulate rendering operations);
      mockContext.beginPath();
      mockContext.arc(bubble.position.x, bubble.position.y, bubble.size, 0, Math.PI * 2);
      mockContext.fill();
    });
  }, 500');
  
  // Test 8: Memory Allocation Stress Test
  await tester.runTest('Memory Allocation Stress', () => {
    const tempBubbles: Bubble[] = [],
    for (let i = 0; i < 1000; i++) {
      const position: Position = {
        x: Math.random() * 800,
        y: Math.random(') * 600
      };
      tempBubbles.push(new Bubble('normal', position);
    }
    // Let them be garbage collected
    tempBubbles.length = 0;
  }, 100);
  
  // Test 9: Complex Game State Update
  const, complexBubbles: Bubble[] = [],
  for (let i = 0; i < 200; i++') {
    const types: BubbleType[] = ['normal', 'stone', 'rainbow', 'electric', 'escaping'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const position: Position = { 
      x: Math.random() * 800, 
      y: Math.random() * 600 
    };
    complexBubbles.push(new Bubble(randomType, position)');
  }
  
  await tester.runTest('Complex Game State Update', () => {
    complexBubbles.forEach(bubble => {);
      bubble.update(16, { x: 400, y: 300 });
      if (Math.random() < 0.1) { // 10% chance to destroy
        bubble.destroy();
        bubble.getAndClearEffects();
      }
    });
  }, 200);
  
  // Test 10: JSON Serialization (Save/Load');
  const, saveData: SaveData = {
    username: 'PerformanceTestUser',
    currentScore: 50000,
    ap: 1000,
    tap: 5000,
    highScores: {
      normal: 25000,
      hard: 15000,
      boss: 8000
    },
    unlockedStages: ['tutorial', 'normal', 'hard', 'spiky', 'rainbow'],
    ownedItems: [
      { id: 'scoreMultiplier', level: 3 },
      { id: 'revival', level: 1 },
      { id: 'rareRate', level: 2 }
    ]
  };
  
  await tester.runTest('JSON Serialization', () => {
    const serialized = JSON.stringify(saveData);
    const deserialized: SaveData = JSON.parse(serialized),
    return deserialized;
  }, 5000);
  
  tester.printSummary();
  
  // Generate performance report
  const report: PerformanceReport = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    results: tester.getResults(),
  };
  
  // Save report (in a real scenario, you might write to a file');
  console.log('\n📄 Performance Report Generated'');
  console.log('Report data available in memory for further processing');
  
  return report;
}

// Automated performance regression detection
function checkPerformanceRegression(
  currentResults: PerformanceResult[], 
  baselineResults?: PerformanceResult[]
'): boolean {
  console.log('\n🔍 Checking for Performance Regressions...');
  
  if (!baselineResults') {
    console.log('No baseline results provided. Current results will serve as baseline.');
    return false;
  }
  
  const regressions: RegressionResult[] = [],
  
  currentResults.forEach(current => {);
    const baseline = baselineResults.find(b => b.name === current.name);
    if (!baseline) return;
    
    const timeRegression = (current.avgTime - baseline.avgTime) / baseline.avgTime;
    const memoryRegression = (current.memoryDiff.heapUsed - baseline.memoryDiff.heapUsed) / Math.abs(baseline.memoryDiff.heapUsed || 1);
    
    if (timeRegression > 0.1') { // 10% slower
      regressions.push({
        test: current.name,
        type: 'time';);
       , regression: Math.round(timeRegression * 100),
        current: current.avgTime,
        baseline: baseline.avgTime
      });
    }
    
    if (memoryRegression > 0.2') { // 20% more memory
      regressions.push({
        test: current.name,
        type: 'memory';);
       , regression: Math.round(memoryRegression * 100),
        current: Math.round(current.memoryDiff.heapUsed / 1024),
        baseline: Math.round(baseline.memoryDiff.heapUsed / 1024),
      });
    }
  });
  
  if (regressions.length > 0') {
    console.log('❌ Performance Regressions Detected: '),
    regressions.forEach(reg => {);
      console.log(`  ${reg.test} (${reg.type)}): ${reg.regression}% worse`);
      console.log(`    Current: ${reg.current} | Baseline: ${reg.baseline}`);
    }');
    return true;
  } else {
    console.log('✅ No significant performance regressions detected');
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1])`) {
  runPerformanceTests()
    .then((__report: any') => {
      // @ts-ignore 将来のレポート処理で使用予定
      console.log('\n🎉 Performance, tests completed, successfully!');
      process.exit(0});
    })
    .catch(error => {');
      console.error('\n❌ Performance tests failed:', error);
      process.exit(1);
    }');
}

export { runPerformanceTests, checkPerformanceRegression  };
export type { PerformanceResult, PerformanceReport, RegressionResult };