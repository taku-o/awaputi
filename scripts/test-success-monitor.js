#!/usr/bin/env node

/**
 * Test Success Rate Monitor
 * Monitors test execution results and tracks improvement from 50% to 95%+ success rate
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const reportDir = join(projectRoot, 'test-reports');
const reportFile = join(reportDir, 'success-rate-history.json');

class TestSuccessMonitor {
    constructor() {
        this.ensureReportDirectory();
        this.history = this.loadHistory();
        this.targetSuccessRate = 0.95; // 95%
        this.initialSuccessRate = 0.50; // 50%
    }

    ensureReportDirectory() {
        if (!existsSync(reportDir)) {
            mkdirSync(reportDir, { recursive: true });
        }
    }

    loadHistory() {
        if (existsSync(reportFile)) {
            try {
                const data = readFileSync(reportFile, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                console.warn('警告: 履歴ファイルの読み込みに失敗:', error.message);
                return { runs: [] };
            }
        }
        return { runs: [] };
    }

    saveHistory() {
        try {
            writeFileSync(reportFile, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error('エラー: 履歴ファイルの保存に失敗:', error.message);
        }
    }

    async runTests(testType = 'all') {
        console.log(`🧪 テスト実行開始 (${testType})...`);
        
        const commands = {
            all: ['npm', ['test', '--', '--verbose', '--no-coverage']],
            unit: ['npm', ['run', 'test:unit', '--', '--verbose', '--no-coverage']],
            performance: ['npm', ['run', 'test:performance', '--', '--verbose', '--no-coverage']],
            integration: ['npm', ['run', 'test:integration', '--', '--verbose', '--no-coverage']]
        };

        const [command, args] = commands[testType] || commands.all;

        return new Promise((resolve) => {
            const startTime = Date.now();
            let output = '';
            let errorOutput = '';

            const testProcess = spawn(command, args, {
                cwd: projectRoot,
                stdio: ['inherit', 'pipe', 'pipe']
            });

            testProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                process.stdout.write(text);
            });

            testProcess.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                process.stderr.write(text);
            });

            testProcess.on('close', (code) => {
                const endTime = Date.now();
                const duration = endTime - startTime;

                const result = this.parseTestOutput(output + errorOutput);
                result.exitCode = code;
                result.duration = duration;
                result.timestamp = new Date().toISOString();
                result.testType = testType;

                resolve(result);
            });
        });
    }

    parseTestOutput(output) {
        const result = {
            totalSuites: 0,
            passedSuites: 0,
            failedSuites: 0,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            successRate: 0,
            errors: []
        };

        // Jest output parsing
        const suiteMatch = output.match(/Test Suites:\s*(\d+)\s*failed,\s*(\d+)\s*passed,\s*(\d+)\s*total/);
        if (suiteMatch) {
            result.failedSuites = parseInt(suiteMatch[1]) || 0;
            result.passedSuites = parseInt(suiteMatch[2]) || 0;
            result.totalSuites = parseInt(suiteMatch[3]) || 0;
        }

        const testMatch = output.match(/Tests:\s*(\d+)\s*failed,\s*(\d+)\s*passed,\s*(\d+)\s*total/);
        if (testMatch) {
            result.failedTests = parseInt(testMatch[1]) || 0;
            result.passedTests = parseInt(testMatch[2]) || 0;
            result.totalTests = parseInt(testMatch[3]) || 0;
        }

        // Alternative parsing for different Jest output formats
        if (result.totalTests === 0) {
            const altTestMatch = output.match(/(\d+)\s*passed,\s*(\d+)\s*total/);
            if (altTestMatch) {
                result.passedTests = parseInt(altTestMatch[1]) || 0;
                result.totalTests = parseInt(altTestMatch[2]) || 0;
                result.failedTests = result.totalTests - result.passedTests;
            }
        }

        // Calculate success rate
        if (result.totalTests > 0) {
            result.successRate = result.passedTests / result.totalTests;
        }

        // Extract error information
        const errorLines = output.split('\n').filter(line => 
            line.includes('FAIL') || 
            line.includes('TypeError') || 
            line.includes('ReferenceError') ||
            line.includes('Cannot find module')
        );
        result.errors = errorLines.slice(0, 10); // Keep first 10 errors

        return result;
    }

    recordResult(result) {
        this.history.runs.push(result);
        
        // Keep only last 50 runs to prevent file bloat
        if (this.history.runs.length > 50) {
            this.history.runs = this.history.runs.slice(-50);
        }

        this.saveHistory();
        console.log(`📊 テスト結果を記録しました (実行回数: ${this.history.runs.length})`);
    }

    generateReport() {
        if (this.history.runs.length === 0) {
            console.log('📝 テスト履歴がありません');
            return;
        }

        const latestRun = this.history.runs[this.history.runs.length - 1];
        const firstRun = this.history.runs[0];
        
        console.log('\n' + '='.repeat(60));
        console.log('📈 テスト成功率監視レポート');
        console.log('='.repeat(60));
        
        console.log(`📅 最新実行: ${new Date(latestRun.timestamp).toLocaleString('ja-JP')}`);
        console.log(`🎯 目標成功率: ${(this.targetSuccessRate * 100).toFixed(1)}%`);
        console.log(`📊 現在の成功率: ${(latestRun.successRate * 100).toFixed(1)}%`);
        
        if (this.history.runs.length > 1) {
            const improvement = latestRun.successRate - firstRun.successRate;
            const improvementPercent = improvement * 100;
            console.log(`📈 改善度: ${improvementPercent >= 0 ? '+' : ''}${improvementPercent.toFixed(1)}% (初回比較)`);
        }

        console.log('\n📋 最新テスト結果:');
        console.log(`  ✅ 成功テスト: ${latestRun.passedTests}/${latestRun.totalTests}`);
        console.log(`  ❌ 失敗テスト: ${latestRun.failedTests}/${latestRun.totalTests}`);
        console.log(`  📦 成功スイート: ${latestRun.passedSuites}/${latestRun.totalSuites}`);
        console.log(`  ⏱️  実行時間: ${(latestRun.duration / 1000).toFixed(1)}秒`);

        // Progress towards target
        const progressToTarget = (latestRun.successRate - this.initialSuccessRate) / 
                                (this.targetSuccessRate - this.initialSuccessRate);
        const progressPercent = Math.max(0, Math.min(100, progressToTarget * 100));
        
        console.log(`\n🎯 目標達成進捗: ${progressPercent.toFixed(1)}%`);
        console.log(`   ${this.createProgressBar(progressPercent)}`);

        // Trend analysis
        if (this.history.runs.length >= 3) {
            this.analyzeTrend();
        }

        // Error analysis
        if (latestRun.errors.length > 0) {
            console.log('\n🚨 主要エラー (最大10件):');
            latestRun.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.trim()}`);
            });
        }

        // Recommendations
        this.generateRecommendations(latestRun);
    }

    createProgressBar(percent, width = 30) {
        const filled = Math.round(width * percent / 100);
        const empty = width - filled;
        return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percent.toFixed(1)}%`;
    }

    analyzeTrend() {
        const recentRuns = this.history.runs.slice(-5); // Last 5 runs
        const rates = recentRuns.map(run => run.successRate);
        
        let trend = 'stable';
        if (rates.length >= 2) {
            const firstRate = rates[0];
            const lastRate = rates[rates.length - 1];
            const diff = lastRate - firstRate;
            
            if (diff > 0.05) trend = 'improving';
            else if (diff < -0.05) trend = 'declining';
        }

        const trendEmoji = {
            improving: '📈',
            declining: '📉',
            stable: '➡️'
        };

        console.log(`\n${trendEmoji[trend]} トレンド分析 (直近5回): ${trend === 'improving' ? '改善傾向' : trend === 'declining' ? '悪化傾向' : '安定'}`);
        
        if (trend === 'declining') {
            console.log('⚠️  注意: テスト成功率が低下しています。リグレッション調査が必要です。');
        }
    }

    generateRecommendations(latestRun) {
        console.log('\n💡 推奨アクション:');
        
        if (latestRun.successRate < 0.7) {
            console.log('  🔴 優先度高: 成功率が70%未満です');
            console.log('     - Jest設定とMockFactory使用状況を確認');
            console.log('     - 基本的なユニットテストの修正を優先');
        } else if (latestRun.successRate < 0.9) {
            console.log('  🟡 優先度中: 成功率90%未満です');
            console.log('     - 統合テストとパフォーマンステストを確認');
            console.log('     - 環境依存の問題を調査');
        } else if (latestRun.successRate >= this.targetSuccessRate) {
            console.log('  🟢 目標達成! 95%以上の成功率を維持');
            console.log('     - 継続的な監視を継続');
            console.log('     - リグレッション防止に注意');
        }

        if (latestRun.errors.length > 0) {
            console.log('  🔧 具体的な修正提案:');
            
            const commonErrors = this.analyzeCommonErrors(latestRun.errors);
            commonErrors.forEach(({ pattern, suggestion }) => {
                console.log(`     - ${pattern}: ${suggestion}`);
            });
        }
    }

    analyzeCommonErrors(errors) {
        const suggestions = [];
        const errorText = errors.join(' ');

        if (errorText.includes('jest is not defined')) {
            suggestions.push({
                pattern: 'jest is not defined',
                suggestion: 'Jest importを追加: import { jest } from \'@jest/globals\';'
            });
        }

        if (errorText.includes('Cannot find module')) {
            suggestions.push({
                pattern: 'Cannot find module',
                suggestion: 'モジュールパス確認、動的importの使用を検討'
            });
        }

        if (errorText.includes('is not a function')) {
            suggestions.push({
                pattern: 'is not a function',
                suggestion: 'MockFactory使用、メソッド実装確認'
            });
        }

        if (errorText.includes('timeout')) {
            suggestions.push({
                pattern: 'timeout',
                suggestion: 'PerformanceTestUtilsの環境対応閾値使用'
            });
        }

        return suggestions;
    }

    async runMonitoring(testType = 'all') {
        console.log('🚀 テスト成功率監視を開始します...\n');
        
        try {
            const result = await this.runTests(testType);
            this.recordResult(result);
            this.generateReport();

            // Regression detection
            this.detectRegression();

            console.log('\n✅ 監視完了');
            return result.successRate >= this.targetSuccessRate;

        } catch (error) {
            console.error('❌ 監視中にエラーが発生:', error.message);
            return false;
        }
    }

    detectRegression() {
        if (this.history.runs.length < 2) return;

        const current = this.history.runs[this.history.runs.length - 1];
        const previous = this.history.runs[this.history.runs.length - 2];
        
        const regressionThreshold = 0.05; // 5% drop threshold
        const drop = previous.successRate - current.successRate;

        if (drop > regressionThreshold) {
            console.log('\n🚨 リグレッション検出!');
            console.log(`   成功率が ${(drop * 100).toFixed(1)}% 低下しました`);
            console.log(`   前回: ${(previous.successRate * 100).toFixed(1)}% → 今回: ${(current.successRate * 100).toFixed(1)}%`);
            console.log('   原因調査と修正が必要です。');
        }
    }

    getHistorySummary() {
        if (this.history.runs.length === 0) {
            return { message: 'テスト履歴がありません' };
        }

        const rates = this.history.runs.map(run => run.successRate);
        const min = Math.min(...rates);
        const max = Math.max(...rates);
        const avg = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
        const latest = rates[rates.length - 1];

        return {
            totalRuns: this.history.runs.length,
            latestSuccessRate: latest,
            averageSuccessRate: avg,
            bestSuccessRate: max,
            worstSuccessRate: min,
            targetAchieved: latest >= this.targetSuccessRate
        };
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const testType = args[0] || 'all';
    const command = args[1] || 'run';

    const monitor = new TestSuccessMonitor();

    switch (command) {
        case 'run':
            await monitor.runMonitoring(testType);
            break;
        case 'report':
            monitor.generateReport();
            break;
        case 'summary':
            const summary = monitor.getHistorySummary();
            console.log('📊 履歴サマリー:', summary);
            break;
        default:
            console.log('使用法:');
            console.log('  node test-success-monitor.js [testType] [command]');
            console.log('  testType: all, unit, performance, integration');
            console.log('  command: run, report, summary');
            break;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { TestSuccessMonitor };