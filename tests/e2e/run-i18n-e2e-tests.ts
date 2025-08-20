import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
#!/usr/bin/env node

/**
 * 国際化E2Eテスト実行スクリプト
 * 
 * 国際化関連のE2Eテストを順序立てて実行し、
 * 包括的なレポートを生成する
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// テスト設定
const E2E_TESTS = [
    {
        name: 'Language Switching',
        file: 'language-switching-e2e.spec.js',
        description: '動的言語切り替え機能のテスト'
    },
    {
        name: 'Regional Features',
        file: 'regional-features-e2e.spec.js',
        description: '地域化機能（数値、日付、通貨フォーマット）のテスト'
    },
    {
        name: 'Multilingual Gameplay',
        file: 'multilingual-gameplay-e2e.spec.js',
        description: 'ゲームプレイ中の多言語対応機能のテスト'
    },
    {
        name: 'Browser Compatibility',
        file: 'browser-compatibility-i18n-e2e.spec.js',
        description: 'ブラウザ互換性とi18n機能のテスト'
    }
];

const BROWSERS = ['chromium', 'firefox', 'webkit'];
const OUTPUT_DIR = 'test-results/i18n-e2e';

// ユーティリティ関数
function createOutputDirectory() {
    if (!existsSync(OUTPUT_DIR: any)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }
}

function runCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    try {
        const output = execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        console.log(`✅ ${description} completed`);
        return { success: true, output };
    } catch (error) {
        console.error(`❌ ${description} failed:`);
        console.error(error.stdout);
        console.error(error.stderr);
        return { success: false, error: error.message, output: error.stdout };
    }
}

function runSingleTest(testFile, browser = 'chromium') {
    const command = `npx playwright test tests/e2e/${testFile} --project=${browser} --reporter=json`;
    return runCommand(command, `Running ${testFile} on ${browser}`);
}

function runAllTests() {
    const command = `npx playwright test tests/e2e/language-switching-e2e.spec.js tests/e2e/regional-features-e2e.spec.js tests/e2e/multilingual-gameplay-e2e.spec.js tests/e2e/browser-compatibility-i18n-e2e.spec.js --reporter=html`;
    return runCommand(command, 'Running all i18n E2E tests');
}

function generateTestReport(results: any) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalTests: results.length,
            passed: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            browsers: BROWSERS
        },
        details: results,
        recommendations: []
    };

    // 推奨事項の生成
    const failedTests = results.filter(r => !r.success);
    if (failedTests.length > 0) {
        report.recommendations.push({
            type: 'critical',
            message: `${failedTests.length} tests failed. Review error logs and fix issues before deployment.`
        });

        failedTests.forEach(test => {
            if (test.error.includes('timeout')) {
                report.recommendations.push({
                    type: 'performance',
                    message: `${test.name} timed out. Consider optimizing language switching performance.`
                });
            }
            
            if (test.error.includes('translation')) {
                report.recommendations.push({
                    type: 'translation',
                    message: `Translation issues detected in ${test.name}. Verify translation completeness.`
                });
            }
        });
    }

    if (report.summary.passed === report.summary.totalTests) {
        report.recommendations.push({
            type: 'success',
            message: 'All i18n E2E tests passed successfully! The internationalization system is ready for deployment.'
        });
    }

    return report;
}

function saveReport(report: any) {
    const reportPath = path.join(OUTPUT_DIR, 'i18n-e2e-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // HTML レポートも生成
    const htmlReport = generateHTMLReport(report: any);
    const htmlPath = path.join(OUTPUT_DIR, 'i18n-e2e-report.html');
    writeFileSync(htmlPath, htmlReport);
    
    console.log(`\n📊 Test report saved to:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
}

function generateHTMLReport(report: any) {
    const passedTests = report.details.filter(r => r.success);
    const failedTests = report.details.filter(r => !r.success);
    
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>国際化E2Eテストレポート</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-results { margin-bottom: 30px; }
        .test-item { background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-name { font-size: 1.1em; font-weight: bold; margin-bottom: 5px; }
        .test-description { color: #666; margin-bottom: 10px; }
        .test-status { padding: 4px 12px; border-radius: 4px; font-size: 0.9em; font-weight: bold; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .error-details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 0.9em; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; }
        .recommendation { margin-bottom: 10px; padding: 10px; border-left: 4px solid #ffc107; background: white; }
        .recommendation.critical { border-left-color: #dc3545; }
        .recommendation.success { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 国際化E2Eテストレポート</h1>
        <p>実行日時: ${new Date(report.timestamp).toLocaleString('ja-JP')}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.summary.totalTests}</div>
            <div class="metric-label">総テスト数</div>
        </div>
        <div class="metric">
            <div class="metric-value passed">${report.summary.passed}</div>
            <div class="metric-label">成功</div>
        </div>
        <div class="metric">
            <div class="metric-value failed">${report.summary.failed}</div>
            <div class="metric-label">失敗</div>
        </div>
        <div class="metric">
            <div class="metric-value">${Math.round((report.summary.passed / report.summary.totalTests) * 100)}%</div>
            <div class="metric-label">成功率</div>
        </div>
    </div>

    <div class="test-results">
        <h2>テスト結果</h2>
        ${report.details.map(test => `
            <div class="test-item">
                <div class="test-name">${test.name}</div>
                <div class="test-description">${test.description || ''}</div>
                <div class="test-status ${test.success ? 'status-passed' : 'status-failed'}">
                    ${test.success ? '✅ 成功' : '❌ 失敗'}
                </div>
                ${test.error ? `<div class="error-details">${test.error}</div>` : ''}
            </div>
        `).join('')}
    </div>

    ${report.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>推奨事項</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation ${rec.type}">
                <strong>${rec.type.toUpperCase()}:</strong> ${rec.message}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; text-align: center;">
        Generated by BubblePop I18n E2E Test Runner
    </div>
</body>
</html>`;
}

// メイン実行関数
async function main() {
    console.log('🌐 国際化E2Eテスト実行開始');
    console.log('=' .repeat(50));

    // 出力ディレクトリを作成
    createOutputDirectory();

    // サーバーが起動しているかチェック
    console.log('\n🔍 開発サーバーの確認...');
    const serverCheck = runCommand('curl -f http://localhost:8000 > /dev/null 2>&1 || echo "Server not running"', 'Server check');
    if (!serverCheck.success || serverCheck.output.includes('Server not running')) {
        console.log('⚠️  開発サーバーが起動していません。以下のコマンドでサーバーを起動してください:');
        console.log('   python -m http.server 8000');
        console.log('   または');
        console.log('   npx serve .');
        process.exit(1);
    }

    // テスト結果を格納する配列
    const results: any[] = [];

    // 個別テストの実行
    console.log('\n📝 個別テストの実行...');
    for (const test of E2E_TESTS) {
        console.log(`\n--- ${test.name} ---`);
        console.log(`説明: ${test.description}`);
        
        // Chromium での実行（主要ブラウザ）
        const result = runSingleTest(test.file, 'chromium');
        results.push({
            name: test.name,
            file: test.file,
            description: test.description,
            browser: 'chromium',
            success: result.success,
            error: result.error,
            output: result.output
        });

        // Firefox での実行（クロスブラウザ確認）
        if (result.success) {
            console.log('  🦊 Firefox でのクロスブラウザテスト...');
            const firefoxResult = runSingleTest(test.file, 'firefox');
            results.push({
                name: `${test.name} (Firefox)`,
                file: test.file,
                description: `${test.description} - Firefox互換性`,
                browser: 'firefox',
                success: firefoxResult.success,
                error: firefoxResult.error,
                output: firefoxResult.output
            });
        }
    }

    // 統合テストの実行
    console.log('\n🔄 統合テストの実行...');
    const integrationResult = runAllTests();
    results.push({
        name: 'Integration Test',
        file: 'all-i18n-tests',
        description: '全i18nテストの統合実行',
        browser: 'all',
        success: integrationResult.success,
        error: integrationResult.error,
        output: integrationResult.output
    });

    // レポート生成
    console.log('\n📊 テストレポート生成...');
    const report = generateTestReport(results: any);
    saveReport(report: any);

    // 結果サマリー表示
    console.log('\n' + '='.repeat(50));
    console.log('📊 テスト実行結果サマリー');
    console.log('='.repeat(50));
    console.log(`総テスト数: ${report.summary.totalTests}`);
    console.log(`成功: ${report.summary.passed} ✅`);
    console.log(`失敗: ${report.summary.failed} ❌`);
    console.log(`成功率: ${Math.round((report.summary.passed / report.summary.totalTests) * 100)}%`);

    if (report.summary.failed > 0) {
        console.log('\n❌ 失敗したテスト:');
        results.filter(r => !r.success).forEach(test => {
            console.log(`  - ${test.name}`);
        });
        console.log('\n詳細はレポートファイルを確認してください。');
        process.exit(1);
    } else {
        console.log('\n🎉 すべてのテストが成功しました！');
        console.log('国際化システムはデプロイ準備完了です。');
        process.exit(0);
    }
}

// スクリプトが直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ テスト実行中にエラーが発生しました:', error);
        process.exit(1);
    });
}

export { main, E2E_TESTS, runSingleTest, generateTestReport };