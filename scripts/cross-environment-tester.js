#!/usr/bin/env node

/**
 * Cross-Environment Tester
 * Tests across browser/console environments and validates stability
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const reportDir = join(projectRoot, 'test-reports');

class CrossEnvironmentTester {
    constructor() {
        this.environments = {
            node: {
                name: 'Node.js Console',
                testCommand: ['npm', 'test'],
                config: 'jest.config.js',
                description: 'Node.js環境での標準テスト'
            },
            unit: {
                name: 'Unit Tests (jsdom)',
                testCommand: ['npm', 'run', 'test:unit'],
                config: 'jest.unit.config.js',
                description: 'jsdom環境でのユニットテスト'
            },
            performance: {
                name: 'Performance Tests',
                testCommand: ['npm', 'run', 'test:performance'],
                config: 'jest.performance.config.js',
                description: 'パフォーマンステスト環境'
            }
        };

        this.results = {};
        this.stabilityThreshold = 0.1; // 10% variation threshold
        this.ensureReportDirectory();
    }

    ensureReportDirectory() {
        if (!existsSync(reportDir)) {
            mkdirSync(reportDir, { recursive: true });
        }
    }

    async runTestInEnvironment(envKey, retries = 3) {
        const env = this.environments[envKey];
        console.log(`🧪 ${env.name} でテスト実行中...`);

        const results = [];
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            console.log(`  試行 ${attempt}/${retries}...`);
            
            try {
                const result = await this.executeTest(env.testCommand, envKey);
                result.attempt = attempt;
                result.environment = envKey;
                result.environmentName = env.name;
                results.push(result);

                // If test succeeded, we might still want to retry for stability
                if (result.success) {
                    console.log(`  ✅ 試行 ${attempt} 成功 (成功率: ${(result.successRate * 100).toFixed(1)}%)`);
                } else {
                    console.log(`  ❌ 試行 ${attempt} 失敗 (成功率: ${(result.successRate * 100).toFixed(1)}%)`);
                }

            } catch (error) {
                console.log(`  ❌ 試行 ${attempt} エラー: ${error.message}`);
                results.push({
                    attempt,
                    environment: envKey,
                    environmentName: env.name,
                    success: false,
                    error: error.message,
                    successRate: 0,
                    duration: 0
                });
            }

            // Small delay between attempts
            if (attempt < retries) {
                await this.delay(2000);
            }
        }

        return results;
    }

    async executeTest(command, environment) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let output = '';
            let errorOutput = '';

            // Set environment-specific variables
            const env = {
                ...process.env,
                NODE_ENV: 'test',
                TEST_ENVIRONMENT: environment
            };

            const testProcess = spawn(command[0], command.slice(1), {
                cwd: projectRoot,
                stdio: ['ignore', 'pipe', 'pipe'],
                env
            });

            testProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            testProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            testProcess.on('close', (code) => {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                const result = this.parseTestOutput(output + errorOutput);
                result.exitCode = code;
                result.duration = duration;
                result.timestamp = new Date().toISOString();
                result.success = code === 0 && result.successRate > 0.5;
                result.rawOutput = output;
                result.errorOutput = errorOutput;

                resolve(result);
            });

            testProcess.on('error', (error) => {
                reject(error);
            });

            // Set timeout to prevent hanging
            setTimeout(() => {
                testProcess.kill('SIGTERM');
                reject(new Error(`テストタイムアウト (${environment})`));
            }, 5 * 60 * 1000); // 5 minutes timeout
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

        // Alternative parsing
        if (result.totalTests === 0) {
            const altMatch = output.match(/(\d+)\s*passed,\s*(\d+)\s*total/);
            if (altMatch) {
                result.passedTests = parseInt(altMatch[1]) || 0;
                result.totalTests = parseInt(altMatch[2]) || 0;
                result.failedTests = result.totalTests - result.passedTests;
            }
        }

        // Calculate success rate
        if (result.totalTests > 0) {
            result.successRate = result.passedTests / result.totalTests;
        }

        // Extract common errors
        const errorPatterns = [
            /FAIL.*\.test\.js/g,
            /Error:.*$/gm,
            /TypeError:.*$/gm,
            /ReferenceError:.*$/gm
        ];

        for (const pattern of errorPatterns) {
            const matches = output.match(pattern);
            if (matches) {
                result.errors.push(...matches.slice(0, 5)); // Limit to 5 per pattern
            }
        }

        return result;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    analyzeStability(results) {
        if (results.length < 2) {
            return { stable: true, variation: 0, message: '安定性分析には複数回の実行が必要' };
        }

        const successRates = results.map(r => r.successRate);
        const durations = results.map(r => r.duration);

        // Calculate coefficient of variation for success rates
        const avgSuccessRate = successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;
        const successRateVariance = successRates.reduce((sum, rate) => sum + Math.pow(rate - avgSuccessRate, 2), 0) / successRates.length;
        const successRateCV = avgSuccessRate > 0 ? Math.sqrt(successRateVariance) / avgSuccessRate : 0;

        // Calculate coefficient of variation for durations
        const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
        const durationVariance = durations.reduce((sum, dur) => sum + Math.pow(dur - avgDuration, 2), 0) / durations.length;
        const durationCV = avgDuration > 0 ? Math.sqrt(durationVariance) / avgDuration : 0;

        const isStable = successRateCV < this.stabilityThreshold && durationCV < 0.3; // 30% duration variation allowed

        return {
            stable: isStable,
            successRateVariation: successRateCV,
            durationVariation: durationCV,
            avgSuccessRate,
            avgDuration,
            message: isStable ? '安定' : '不安定 - 結果にばらつきがあります'
        };
    }

    compareEnvironments() {
        const envKeys = Object.keys(this.results);
        const comparisons = [];

        for (let i = 0; i < envKeys.length; i++) {
            for (let j = i + 1; j < envKeys.length; j++) {
                const env1 = envKeys[i];
                const env2 = envKeys[j];
                
                const results1 = this.results[env1];
                const results2 = this.results[env2];

                if (results1.length === 0 || results2.length === 0) continue;

                const avg1 = results1.reduce((sum, r) => sum + r.successRate, 0) / results1.length;
                const avg2 = results2.reduce((sum, r) => sum + r.successRate, 0) / results2.length;
                
                const difference = Math.abs(avg1 - avg2);
                const significant = difference > 0.05; // 5% difference threshold

                comparisons.push({
                    env1,
                    env2,
                    env1Name: this.environments[env1].name,
                    env2Name: this.environments[env2].name,
                    avg1,
                    avg2,
                    difference,
                    significant,
                    better: avg1 > avg2 ? env1 : env2
                });
            }
        }

        return comparisons;
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🌐 クロス環境テスト結果レポート');
        console.log('='.repeat(60));

        for (const [envKey, results] of Object.entries(this.results)) {
            if (results.length === 0) continue;

            const env = this.environments[envKey];
            const stability = this.analyzeStability(results);
            const avgSuccess = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;
            const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

            console.log(`\n📱 ${env.name}`);
            console.log(`   平均成功率: ${(avgSuccess * 100).toFixed(1)}%`);
            console.log(`   平均実行時間: ${(avgDuration / 1000).toFixed(1)}秒`);
            console.log(`   安定性: ${stability.stable ? '✅' : '❌'} ${stability.message}`);
            
            if (!stability.stable) {
                console.log(`   成功率変動: ${(stability.successRateVariation * 100).toFixed(1)}%`);
                console.log(`   実行時間変動: ${(stability.durationVariation * 100).toFixed(1)}%`);
            }

            // Show individual run results
            console.log(`   実行結果:`);
            results.forEach((result, index) => {
                const status = result.success ? '✅' : '❌';
                console.log(`     ${status} 試行${index + 1}: ${(result.successRate * 100).toFixed(1)}% (${(result.duration / 1000).toFixed(1)}s)`);
            });
        }

        // Environment comparisons
        const comparisons = this.compareEnvironments();
        if (comparisons.length > 0) {
            console.log('\n🔄 環境間比較:');
            comparisons.forEach(comp => {
                const significantFlag = comp.significant ? '⚠️' : '✅';
                console.log(`   ${significantFlag} ${comp.env1Name} vs ${comp.env2Name}`);
                console.log(`      ${comp.env1}: ${(comp.avg1 * 100).toFixed(1)}%`);
                console.log(`      ${comp.env2}: ${(comp.avg2 * 100).toFixed(1)}%`);
                console.log(`      差異: ${(comp.difference * 100).toFixed(1)}% ${comp.significant ? '(有意差あり)' : '(許容範囲)'}`);
                
                if (comp.significant) {
                    console.log(`      優秀: ${this.environments[comp.better].name}`);
                }
            });
        }

        // Recommendations
        console.log('\n💡 推奨アクション:');
        const unstableEnvs = Object.entries(this.results)
            .filter(([key, results]) => !this.analyzeStability(results).stable)
            .map(([key]) => key);

        if (unstableEnvs.length > 0) {
            console.log(`   🔧 不安定な環境の調査: ${unstableEnvs.map(env => this.environments[env].name).join(', ')}`);
        }

        const significantDiffs = comparisons.filter(c => c.significant);
        if (significantDiffs.length > 0) {
            console.log(`   ⚖️  環境間の差異を調査してください`);
            significantDiffs.forEach(diff => {
                console.log(`      - ${diff.env1Name} と ${diff.env2Name} の成功率差: ${(diff.difference * 100).toFixed(1)}%`);
            });
        }

        if (unstableEnvs.length === 0 && significantDiffs.length === 0) {
            console.log(`   ✅ 全環境で安定したテスト結果が得られています`);
        }
    }

    saveReport() {
        const reportPath = join(reportDir, 'cross-environment-report.json');
        const reportData = {
            timestamp: new Date().toISOString(),
            environments: Object.keys(this.environments),
            results: this.results,
            stability: {},
            comparisons: this.compareEnvironments()
        };

        // Add stability analysis for each environment
        for (const [envKey, results] of Object.entries(this.results)) {
            reportData.stability[envKey] = this.analyzeStability(results);
        }

        try {
            writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`💾 レポートを保存しました: cross-environment-report.json`);
        } catch (error) {
            console.error('❌ レポート保存エラー:', error.message);
        }
    }

    async runCrossEnvironmentTests() {
        console.log('🚀 クロス環境テストを開始します...\n');

        try {
            for (const envKey of Object.keys(this.environments)) {
                console.log(`\n🌍 環境: ${this.environments[envKey].name}`);
                const results = await this.runTestInEnvironment(envKey, 2); // 2 retries for stability
                this.results[envKey] = results;
            }

            this.generateReport();
            this.saveReport();

            // Check if all environments are stable and successful
            const allStable = Object.values(this.results).every(results => 
                this.analyzeStability(results).stable
            );
            
            const allSuccessful = Object.values(this.results).every(results => 
                results.every(r => r.success)
            );

            console.log(allStable && allSuccessful ? '\n✅ 全環境テスト成功' : '\n⚠️ 一部環境で問題が発見されました');
            return allStable && allSuccessful;

        } catch (error) {
            console.error('❌ クロス環境テスト中にエラーが発生:', error.message);
            return false;
        }
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const selectedEnv = args[0];

    const tester = new CrossEnvironmentTester();

    if (selectedEnv && tester.environments[selectedEnv]) {
        console.log(`🎯 特定環境テスト: ${tester.environments[selectedEnv].name}`);
        const results = await tester.runTestInEnvironment(selectedEnv, 3);
        tester.results[selectedEnv] = results;
        tester.generateReport();
        tester.saveReport();
    } else {
        await tester.runCrossEnvironmentTests();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { CrossEnvironmentTester };