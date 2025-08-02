#!/usr/bin/env node

/**
 * 統合テスト - 分割されたコンポーネントの動作確認
 */

try {
  console.log('=== ComparisonEngine Functional Test ===');
  
  const ComparisonEngine = (await import('./src/core/ComparisonEngine.js')).default;
  const engine = new ComparisonEngine();
  
  // 基本的な比較テスト
  const dataset1 = [10, 12, 14, 16, 18];
  const dataset2 = [15, 17, 19, 21, 23];
  
  console.log('Testing compare() method...');
  const result = engine.compare(dataset1, dataset2);
  
  if (result.error) {
    console.error('❌ Comparison failed:', result.message);
    process.exit(1);
  }
  
  console.log('✓ Basic comparison successful');
  console.log('✓ Datasets info:', {
    dataset1Size: result.datasets.dataset1.size,
    dataset2Size: result.datasets.dataset2.size
  });
  console.log('✓ Analysis results:', {
    significant: result.analysis.significance.significant,
    effectSize: result.analysis.effectSize.interpretation,
    changeDirection: result.analysis.change.mean.direction
  });
  
  // ステージ比較テスト
  console.log('\nTesting compareStagePerformance() method...');
  const stageData = {
    stage1: [
      { score: 100, completionTime: 30, accuracy: 0.9 },
      { score: 110, completionTime: 28, accuracy: 0.92 }
    ],
    stage2: [
      { score: 120, completionTime: 25, accuracy: 0.95 },
      { score: 130, completionTime: 23, accuracy: 0.96 }
    ]
  };
  
  const stageResult = engine.compareStagePerformance(stageData);
  
  if (stageResult.error) {
    console.error('❌ Stage comparison failed:', stageResult.message);
    process.exit(1);
  }
  
  console.log('✓ Stage comparison successful');
  console.log('✓ Stage summary count:', Object.keys(stageResult.stageSummary).length);
  console.log('✓ Individual comparisons count:', Object.keys(stageResult.individualComparisons).length);
  
  // ベースライン比較テスト
  console.log('\nTesting compareAgainstBaseline() method...');
  const currentData = [20, 22, 24, 26, 28];
  const baselineData = [18, 20, 22, 24, 26];
  
  const baselineResult = engine.compareAgainstBaseline(currentData, baselineData);
  
  if (baselineResult.error) {
    console.error('❌ Baseline comparison failed:', baselineResult.message);
    process.exit(1);
  }
  
  console.log('✓ Baseline comparison successful');
  console.log('✓ Baseline analysis:', {
    alertLevel: baselineResult.baseline.alertLevel,
    performanceIndex: baselineResult.baseline.performanceIndex
  });
  
  // 診断情報テスト
  console.log('\nTesting diagnostics...');
  const diagnostics = engine.getDiagnostics();
  console.log('✓ Diagnostics available:', {
    version: diagnostics.version,
    health: diagnostics.health,
    componentsInitialized: diagnostics.components.initialized
  });
  
  console.log('\n=== All ComparisonEngine tests passed! ===');
  
} catch (error) {
  console.error('❌ Integration test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}