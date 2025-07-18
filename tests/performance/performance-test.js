/**
 * Performance tests for BubblePop game
 */

import { performance } from 'perf_hooks';
import { createCanvas } from 'canvas';
import { GameEngine } from '../../src/core/GameEngine.js';
import { Bubble } from '../../src/bubbles/Bubble.js';

// Mock DOM environment for Node.js
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return createCanvas(800, 600);
    }
    return {};
  },
  getElementById: () => null,
  addEventListener: () => {},
  body: { appendChild: () => {} }
};

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: () => {},
  requestAnimationFrame: (callback) => setTimeout(callback, 16),
  performance: performance
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

global.navigator = {
  userAgent: 'Node.js Performance Test'
};

class PerformanceTest {
  constructor() {
    this.results = [];
  }

  async runTest(name, testFunction, iterations = 1000) {
    console.log(`\n🧪 Running ${name}...`);
    
    const times = [];
    let memoryBefore, memoryAfter;
    
    // Warm up
    for (let i = 0; i < 10; i++) {
      await testFunction();
    }
    
    // Measure memory before
    if (global.gc) {
      global.gc();
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
    
    const result = {
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
    
    console.log(`   ⏱️  Average: ${result.avgTime}ms`);
    console.log(`   📊 Ops/sec: ${result.opsPerSecond}`);
    console.log(`   💾 Memory: ${Math.round(memoryDiff.heapUsed / 1024)}KB`);
    
    return result;
  }

  printSummary() {
    console.log('\n📋 Performance Test Summary');
    console.log('=' .repeat(60));
    
    this.results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  Average Time: ${result.avgTime}ms`);
      console.log(`  Min/Max: ${result.minTime}ms / ${result.maxTime}ms`);
      console.log(`  Median: ${result.medianTime}ms`);
      console.log(`  Operations/sec: ${result.opsPerSecond}`);
      console.log(`  Memory Impact: ${Math.round(result.memoryDiff.heapUsed / 1024)}KB`);
    });
    
    // Performance thresholds
    console.log('\n🎯 Performance Analysis:');
    this.results.forEach(result => {
      const warnings = [];
      
      if (result.avgTime > 16) { // 60fps = 16.67ms per frame
        warnings.push('⚠️  Average time exceeds 60fps budget (16.67ms)');
      }
      
      if (result.maxTime > 33) { // 30fps = 33.33ms per frame
        warnings.push('⚠️  Max time exceeds 30fps budget (33.33ms)');
      }
      
      if (result.memoryDiff.heapUsed > 1024 * 1024) { // 1MB
        warnings.push('⚠️  High memory usage (>1MB)');
      }
      
      if (warnings.length > 0) {
        console.log(`\n${result.name}:`);
        warnings.forEach(warning => console.log(`  ${warning}`));
      } else {
        console.log(`\n✅ ${result.name}: Performance OK`);
      }
    });
  }
}

async function runPerformanceTests() {
  const tester = new PerformanceTest();
  
  console.log('🚀 Starting BubblePop Performance Tests');
  
  // Test 1: Bubble Creation Performance
  await tester.runTest('Bubble Creation', () => {
    const bubble = new Bubble('normal', { x: 100, y: 100 });
    return bubble;
  }, 10000);
  
  // Test 2: Bubble Update Performance
  let testBubbles = [];
  for (let i = 0; i < 100; i++) {
    testBubbles.push(new Bubble('normal', { 
      x: Math.random() * 800, 
      y: Math.random() * 600 
    }));
  }
  
  await tester.runTest('Bubble Update (100 bubbles)', () => {
    testBubbles.forEach(bubble => bubble.update(16));
  }, 1000);
  
  // Test 3: Bubble Collision Detection
  const testBubble = new Bubble('normal', { x: 400, y: 300 });
  await tester.runTest('Bubble Collision Detection', () => {
    for (let i = 0; i < 100; i++) {
      testBubble.containsPoint(
        Math.random() * 800,
        Math.random() * 600
      );
    }
  }, 1000);
  
  // Test 4: Special Bubble Effects
  await tester.runTest('Special Bubble Effects', () => {
    const specialBubbles = [
      new Bubble('rainbow', { x: 100, y: 100 }),
      new Bubble('electric', { x: 200, y: 200 }),
      new Bubble('spiky', { x: 300, y: 300 })
    ];
    
    specialBubbles.forEach(bubble => {
      bubble.destroy();
      bubble.getAndClearEffects();
    });
  }, 1000);
  
  // Test 5: Boundary Collision Performance
  const movingBubble = new Bubble('normal', { x: 10, y: 10 });
  movingBubble.velocity = { x: -50, y: -50 };
  
  await tester.runTest('Boundary Collision', () => {
    movingBubble.handleBoundaryCollision();
  }, 5000);
  
  // Test 6: Escaping Bubble Behavior
  const escapingBubble = new Bubble('escaping', { x: 400, y: 300 });
  await tester.runTest('Escaping Bubble AI', () => {
    escapingBubble.update(16, { x: 450, y: 350 });
  }, 2000);
  
  // Test 7: Canvas Rendering (Mock)
  const mockCanvas = createCanvas(800, 600);
  const mockContext = mockCanvas.getContext('2d');
  const renderBubbles = [];
  for (let i = 0; i < 50; i++) {
    renderBubbles.push(new Bubble('normal', {
      x: Math.random() * 800,
      y: Math.random() * 600
    }));
  }
  
  await tester.runTest('Canvas Rendering (50 bubbles)', () => {
    mockContext.clearRect(0, 0, 800, 600);
    renderBubbles.forEach(bubble => {
      // Simulate rendering operations
      mockContext.beginPath();
      mockContext.arc(bubble.position.x, bubble.position.y, bubble.size, 0, Math.PI * 2);
      mockContext.fill();
    });
  }, 500);
  
  // Test 8: Memory Allocation Stress Test
  await tester.runTest('Memory Allocation Stress', () => {
    const tempBubbles = [];
    for (let i = 0; i < 1000; i++) {
      tempBubbles.push(new Bubble('normal', {
        x: Math.random() * 800,
        y: Math.random() * 600
      }));
    }
    // Let them be garbage collected
    tempBubbles.length = 0;
  }, 100);
  
  // Test 9: Complex Game State Update
  const complexBubbles = [];
  for (let i = 0; i < 200; i++) {
    const types = ['normal', 'stone', 'rainbow', 'electric', 'escaping'];
    complexBubbles.push(new Bubble(
      types[Math.floor(Math.random() * types.length)],
      { x: Math.random() * 800, y: Math.random() * 600 }
    ));
  }
  
  await tester.runTest('Complex Game State Update', () => {
    complexBubbles.forEach(bubble => {
      bubble.update(16, { x: 400, y: 300 });
      if (Math.random() < 0.1) { // 10% chance to destroy
        bubble.destroy();
        bubble.getAndClearEffects();
      }
    });
  }, 200);
  
  // Test 10: JSON Serialization (Save/Load)
  const saveData = {
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
    const deserialized = JSON.parse(serialized);
    return deserialized;
  }, 5000);
  
  tester.printSummary();
  
  // Generate performance report
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    results: tester.results
  };
  
  // Save report (in a real scenario, you might write to a file)
  console.log('\n📄 Performance Report Generated');
  console.log('Report data available in memory for further processing');
  
  return report;
}

// Automated performance regression detection
function checkPerformanceRegression(currentResults, baselineResults) {
  console.log('\n🔍 Checking for Performance Regressions...');
  
  if (!baselineResults) {
    console.log('No baseline results provided. Current results will serve as baseline.');
    return false;
  }
  
  let regressions = [];
  
  currentResults.forEach(current => {
    const baseline = baselineResults.find(b => b.name === current.name);
    if (!baseline) return;
    
    const timeRegression = (current.avgTime - baseline.avgTime) / baseline.avgTime;
    const memoryRegression = (current.memoryDiff.heapUsed - baseline.memoryDiff.heapUsed) / Math.abs(baseline.memoryDiff.heapUsed || 1);
    
    if (timeRegression > 0.1) { // 10% slower
      regressions.push({
        test: current.name,
        type: 'time',
        regression: Math.round(timeRegression * 100),
        current: current.avgTime,
        baseline: baseline.avgTime
      });
    }
    
    if (memoryRegression > 0.2) { // 20% more memory
      regressions.push({
        test: current.name,
        type: 'memory',
        regression: Math.round(memoryRegression * 100),
        current: Math.round(current.memoryDiff.heapUsed / 1024),
        baseline: Math.round(baseline.memoryDiff.heapUsed / 1024)
      });
    }
  });
  
  if (regressions.length > 0) {
    console.log('❌ Performance Regressions Detected:');
    regressions.forEach(reg => {
      console.log(`  ${reg.test} (${reg.type}): ${reg.regression}% worse`);
      console.log(`    Current: ${reg.current} | Baseline: ${reg.baseline}`);
    });
    return true;
  } else {
    console.log('✅ No significant performance regressions detected');
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests()
    .then(report => {
      console.log('\n🎉 Performance tests completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Performance tests failed:', error);
      process.exit(1);
    });
}

export { runPerformanceTests, checkPerformanceRegression };