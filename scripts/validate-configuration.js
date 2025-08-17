#!/usr/bin/env node

/**
 * Configuration Validation Build Script
 * 
 * ビルド時に設定の整合性をチェックし、重要な不整合が
 * 検出された場合はビルドを失敗させるスクリプト。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Environment check
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isVerbose = process.argv.includes('--verbose') || process.env.VERBOSE === 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート設定
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// 設定ファイルパス
const CONFIG_FILES = {
    gameBalance: path.join(SRC_DIR, 'config', 'GameBalance.js'),
    gameConfig: path.join(SRC_DIR, 'config', 'GameConfig.js'),
    bubbleClass: path.join(SRC_DIR, 'bubbles', 'Bubble.ts'),
    testFiles: [
        path.join(PROJECT_ROOT, 'tests', 'unit', 'Bubble.test.js'),
        path.join(PROJECT_ROOT, 'tests', 'unit', 'GameBalance.test.js'),
        path.join(PROJECT_ROOT, 'tests', 'unit', 'BubbleManager.test.js')
    ]
};

// ファイル存在確認
function checkRequiredFiles() {
    const requiredFiles = [
        CONFIG_FILES.gameBalance,
        CONFIG_FILES.gameConfig,
        CONFIG_FILES.bubbleClass
    ];
    
    const missingFiles = [];
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
        }
    }
    
    if (missingFiles.length > 0) {
        Logger.error('必須ファイルが見つかりません:');
        missingFiles.forEach(file => Logger.error(`  - ${file}`));
        throw new Error('Required configuration files are missing');
    }
    
    if (isVerbose) {
        Logger.info('すべての必須ファイルが確認されました');
    }
}

// ログ出力用ヘルパー
const Logger = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    success: (msg) => console.log(`[SUCCESS] ${msg}`),
    section: (msg) => {
        console.log('\n' + '='.repeat(60));
        console.log(`  ${msg}`);
        console.log('='.repeat(60));
    }
};

// 設定抽出用ヘルパー
class ConfigurationExtractor {
    /**
     * GameBalance.jsから設定を抽出
     */
    static extractGameBalanceConfig() {
        try {
            const filePath = CONFIG_FILES.gameBalance;
            if (!fs.existsSync(filePath)) {
                throw new Error(`GameBalance.js not found: ${filePath}`);
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            
            // バブル設定の抽出（正規表現を使用）
            const bubbleConfigs = {};
            
            // baseScores の抽出
            const baseScoresMatch = content.match(/baseScores:\s*\{([^}]+)\}/s);
            if (baseScoresMatch) {
                const scoresContent = baseScoresMatch[1];
                const scoreMatches = scoresContent.matchAll(/(\w+):\s*(\d+)/g);
                
                for (const match of scoreMatches) {
                    const [, bubbleType, score] = match;
                    if (!bubbleConfigs[bubbleType]) bubbleConfigs[bubbleType] = {};
                    bubbleConfigs[bubbleType].score = parseInt(score);
                }
            }
            
            // bubbles 設定の抽出
            const bubblesMatch = content.match(/bubbles:\s*\{([\s\S]*?)\n\s*\}/);
            if (bubblesMatch) {
                const bubblesContent = bubblesMatch[1];
                
                // 各バブルタイプの設定を抽出
                const bubbleTypeMatches = bubblesContent.matchAll(/(\w+):\s*\{([^}]*)\}/g);
                
                for (const match of bubbleTypeMatches) {
                    const [, bubbleType, configContent] = match;
                    if (!bubbleConfigs[bubbleType]) bubbleConfigs[bubbleType] = {};
                    
                    // health の抽出
                    const healthMatch = configContent.match(/health:\s*(\d+)/);
                    if (healthMatch) {
                        bubbleConfigs[bubbleType].health = parseInt(healthMatch[1]);
                    }
                    
                    // size の抽出
                    const sizeMatch = configContent.match(/size:\s*(\d+)/);
                    if (sizeMatch) {
                        bubbleConfigs[bubbleType].size = parseInt(sizeMatch[1]);
                    }
                    
                    // maxAge の抽出
                    const maxAgeMatch = configContent.match(/maxAge:\s*(\d+)/);
                    if (maxAgeMatch) {
                        bubbleConfigs[bubbleType].maxAge = parseInt(maxAgeMatch[1]);
                    }
                    
                    // 特殊効果の抽出
                    const effectsMatch = configContent.match(/effects:\s*\{([^}]*)\}/);
                    if (effectsMatch) {
                        const effectsContent = effectsMatch[1];
                        bubbleConfigs[bubbleType].effects = {};
                        
                        const intensityMatch = effectsContent.match(/intensity:\s*(\d+)/);
                        if (intensityMatch) {
                            bubbleConfigs[bubbleType].effects.intensity = parseInt(intensityMatch[1]);
                        }
                        
                        const durationMatch = effectsContent.match(/duration:\s*(\d+)/);
                        if (durationMatch) {
                            bubbleConfigs[bubbleType].effects.duration = parseInt(durationMatch[1]);
                        }
                    }
                }
            }
            
            Logger.info(`GameBalance.jsから${Object.keys(bubbleConfigs).length}個のバブル設定を抽出しました`);
            if (isVerbose) {
                Logger.info('GameBalance.js抽出結果:', JSON.stringify(bubbleConfigs, null, 2));
            }
            return bubbleConfigs;
            
        } catch (error) {
            Logger.error(`GameBalance.js設定抽出エラー: ${error.message}`);
            return {};
        }
    }
    
    /**
     * Bubble.jsからハードコード設定を抽出
     */
    static extractBubbleHardcodedConfig() {
        try {
            const filePath = CONFIG_FILES.bubbleClass;
            if (!fs.existsSync(filePath)) {
                throw new Error(`Bubble.js not found: ${filePath}`);
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const bubbleConfigs = {};
            
            // _getHardcodedConfig メソッドから設定を抽出
            const hardcodedConfigMatch = content.match(/_getHardcodedConfig\(\)\s*\{([\s\S]*?)return configs\[this\.type\]/);
            if (hardcodedConfigMatch) {
                const configContent = hardcodedConfigMatch[1];
                
                // configs オブジェクトの設定を抽出
                const configsMatch = configContent.match(/const configs = \{([\s\S]*?)\};/);
                if (configsMatch) {
                    const configsContent = configsMatch[1];
                    
                    // 各バブルタイプの設定を抽出
                    const bubbleTypeMatches = configsContent.matchAll(/(\w+):\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g);
                    
                    for (const match of bubbleTypeMatches) {
                        const [, bubbleType, configStr] = match;
                        bubbleConfigs[bubbleType] = {};
                        
                        // 各プロパティを抽出
                        const healthMatch = configStr.match(/health:\s*(\d+)/);
                        if (healthMatch) {
                            bubbleConfigs[bubbleType].health = parseInt(healthMatch[1]);
                        }
                        
                        const scoreMatch = configStr.match(/score:\s*(\d+)/);
                        if (scoreMatch) {
                            bubbleConfigs[bubbleType].score = parseInt(scoreMatch[1]);
                        }
                        
                        const sizeMatch = configStr.match(/size:\s*(\d+)/);
                        if (sizeMatch) {
                            bubbleConfigs[bubbleType].size = parseInt(sizeMatch[1]);
                        }
                        
                        const maxAgeMatch = configStr.match(/maxAge:\s*(\d+)/);
                        if (maxAgeMatch) {
                            bubbleConfigs[bubbleType].maxAge = parseInt(maxAgeMatch[1]);
                        }
                    }
                }
            }
            
            Logger.info(`Bubble.jsから${Object.keys(bubbleConfigs).length}個のハードコード設定を抽出しました`);
            if (isVerbose) {
                Logger.info('Bubble.js抽出結果:', JSON.stringify(bubbleConfigs, null, 2));
            }
            return bubbleConfigs;
            
        } catch (error) {
            Logger.error(`Bubble.jsハードコード設定抽出エラー: ${error.message}`);
            return {};
        }
    }
    
    /**
     * テストファイルから期待値を抽出
     */
    static extractTestExpectations() {
        const testExpectations = {};
        
        for (const testFile of CONFIG_FILES.testFiles) {
            if (!fs.existsSync(testFile)) {
                Logger.warn(`テストファイルが見つかりません: ${testFile}`);
                continue;
            }
            
            try {
                const content = fs.readFileSync(testFile, 'utf8');
                const fileName = path.basename(testFile);
                
                // expect文から値を抽出
                const expectMatches = content.matchAll(/expect\([^)]+\)\.toBe\((\d+)\)/g);
                const toEqualMatches = content.matchAll(/expect\([^)]+\)\.toEqual\((\d+)\)/g);
                
                const expectations = [];
                
                for (const match of expectMatches) {
                    expectations.push(parseInt(match[1]));
                }
                
                for (const match of toEqualMatches) {
                    expectations.push(parseInt(match[1]));
                }
                
                if (expectations.length > 0) {
                    testExpectations[fileName] = expectations;
                    Logger.info(`${fileName}から${expectations.length}個の期待値を抽出しました`);
                }
                
            } catch (error) {
                Logger.error(`テストファイル抽出エラー (${testFile}): ${error.message}`);
            }
        }
        
        return testExpectations;
    }
}

// 検証ルール
class ValidationRules {
    /**
     * 設定値の整合性をチェック
     */
    static validateConsistency(gameBalanceConfig, bubbleConfig, testExpectations) {
        const issues = [];
        const warnings = [];
        
        // 各バブルタイプの設定をチェック
        const allBubbleTypes = new Set([
            ...Object.keys(gameBalanceConfig),
            ...Object.keys(bubbleConfig)
        ]);
        
        for (const bubbleType of allBubbleTypes) {
            const gbConfig = gameBalanceConfig[bubbleType] || {};
            const bubbleHardcoded = bubbleConfig[bubbleType] || {};
            
            // health値の一致チェック
            if (gbConfig.health && bubbleHardcoded.health && gbConfig.health !== bubbleHardcoded.health) {
                issues.push({
                    type: 'HEALTH_MISMATCH',
                    severity: 'HIGH',
                    bubbleType,
                    gameBalance: gbConfig.health,
                    bubbleClass: bubbleHardcoded.health,
                    message: `${bubbleType} bubble health値不一致: GameBalance=${gbConfig.health}, Bubble=${bubbleHardcoded.health}`
                });
            }
            
            // score値の一致チェック
            if (gbConfig.score && bubbleHardcoded.score && gbConfig.score !== bubbleHardcoded.score) {
                issues.push({
                    type: 'SCORE_MISMATCH',
                    severity: 'HIGH',
                    bubbleType,
                    gameBalance: gbConfig.score,
                    bubbleClass: bubbleHardcoded.score,
                    message: `${bubbleType} bubble score値不一致: GameBalance=${gbConfig.score}, Bubble=${bubbleHardcoded.score}`
                });
            }
            
            // size値の一致チェック
            if (gbConfig.size && bubbleHardcoded.size && gbConfig.size !== bubbleHardcoded.size) {
                issues.push({
                    type: 'SIZE_MISMATCH',
                    severity: 'MEDIUM',
                    bubbleType,
                    gameBalance: gbConfig.size,
                    bubbleClass: bubbleHardcoded.size,
                    message: `${bubbleType} bubble size値不一致: GameBalance=${gbConfig.size}, Bubble=${bubbleHardcoded.size}`
                });
            }
            
            // maxAge値の一致チェック
            if (gbConfig.maxAge && bubbleHardcoded.maxAge && gbConfig.maxAge !== bubbleHardcoded.maxAge) {
                warnings.push({
                    type: 'MAXAGE_MISMATCH',
                    severity: 'LOW',
                    bubbleType,
                    gameBalance: gbConfig.maxAge,
                    bubbleClass: bubbleHardcoded.maxAge,
                    message: `${bubbleType} bubble maxAge値不一致: GameBalance=${gbConfig.maxAge}, Bubble=${bubbleHardcoded.maxAge}`
                });
            }
        }
        
        return { issues, warnings };
    }
    
    /**
     * 設定値の論理的整合性をチェック
     */
    static validateLogicalConsistency(gameBalanceConfig) {
        const issues = [];
        const warnings = [];
        
        // Boss バブルが他より強力かチェック
        const normalHealth = gameBalanceConfig.normal?.health || 1;
        const bossHealth = gameBalanceConfig.boss?.health || 1;
        
        if (bossHealth <= normalHealth * 2) {
            warnings.push({
                type: 'BOSS_WEAK',
                severity: 'MEDIUM',
                message: `Boss bubble が弱すぎる可能性: Boss=${bossHealth}, Normal=${normalHealth}`
            });
        }
        
        // スコア値の論理性チェック
        const normalScore = gameBalanceConfig.normal?.score || 10;
        const bossScore = gameBalanceConfig.boss?.score || 10;
        
        if (bossScore <= normalScore) {
            warnings.push({
                type: 'BOSS_SCORE_LOW',
                severity: 'MEDIUM',
                message: `Boss bubble のスコアが低すぎる: Boss=${bossScore}, Normal=${normalScore}`
            });
        }
        
        // サイズの論理性チェック
        for (const [bubbleType, config] of Object.entries(gameBalanceConfig)) {
            if (config.size) {
                if (config.size <= 0) {
                    issues.push({
                        type: 'INVALID_SIZE',
                        severity: 'HIGH',
                        bubbleType,
                        value: config.size,
                        message: `${bubbleType} bubble の無効なサイズ: ${config.size}`
                    });
                }
                
                if (config.size > 200) {
                    warnings.push({
                        type: 'LARGE_SIZE',
                        severity: 'LOW',
                        bubbleType,
                        value: config.size,
                        message: `${bubbleType} bubble のサイズが大きすぎる可能性: ${config.size}`
                    });
                }
            }
            
            // 体力値チェック
            if (config.health) {
                if (config.health <= 0) {
                    issues.push({
                        type: 'INVALID_HEALTH',
                        severity: 'HIGH',
                        bubbleType,
                        value: config.health,
                        message: `${bubbleType} bubble の無効な体力値: ${config.health}`
                    });
                }
                
                if (config.health > 50) {
                    warnings.push({
                        type: 'HIGH_HEALTH',
                        severity: 'LOW',
                        bubbleType,
                        value: config.health,
                        message: `${bubbleType} bubble の体力が高すぎる可能性: ${config.health}`
                    });
                }
            }
        }
        
        return { issues, warnings };
    }
    
    /**
     * パフォーマンス影響をチェック
     */
    static validatePerformanceImpact(gameBalanceConfig) {
        const warnings = [];
        
        for (const [bubbleType, config] of Object.entries(gameBalanceConfig)) {
            // maxAge が短すぎる場合（頻繁なスポーンによるパフォーマンス影響）
            if (config.maxAge && config.maxAge < 1000) {
                warnings.push({
                    type: 'SHORT_LIFESPAN',
                    severity: 'MEDIUM',
                    bubbleType,
                    value: config.maxAge,
                    message: `${bubbleType} bubble の寿命が短すぎる（パフォーマンス影響の可能性）: ${config.maxAge}ms`
                });
            }
            
            // エフェクト強度が高すぎる場合
            if (config.effects?.intensity && config.effects.intensity > 30) {
                warnings.push({
                    type: 'HIGH_EFFECT_INTENSITY',
                    severity: 'MEDIUM',
                    bubbleType,
                    value: config.effects.intensity,
                    message: `${bubbleType} bubble のエフェクト強度が高すぎる（パフォーマンス影響の可能性）: ${config.effects.intensity}`
                });
            }
        }
        
        return { warnings };
    }
}

// レポート生成
class ReportGenerator {
    /**
     * 検証結果のレポートを生成
     */
    static generateReport(gameBalanceConfig, bubbleConfig, testExpectations, validationResults) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalBubbleTypes: Object.keys(gameBalanceConfig).length,
                totalIssues: 0,
                totalWarnings: 0,
                criticalIssues: 0,
                buildShouldFail: false
            },
            details: {
                consistency: validationResults.consistency || { issues: [], warnings: [] },
                logical: validationResults.logical || { issues: [], warnings: [] },
                performance: validationResults.performance || { warnings: [] }
            },
            configurations: {
                gameBalance: gameBalanceConfig,
                bubbleHardcoded: bubbleConfig,
                testExpectations
            }
        };
        
        // 統計計算
        const allIssues = [
            ...report.details.consistency.issues,
            ...report.details.logical.issues
        ];
        
        const allWarnings = [
            ...report.details.consistency.warnings,
            ...report.details.logical.warnings,
            ...report.details.performance.warnings
        ];
        
        report.summary.totalIssues = allIssues.length;
        report.summary.totalWarnings = allWarnings.length;
        report.summary.criticalIssues = allIssues.filter(issue => issue.severity === 'HIGH').length;
        report.summary.buildShouldFail = report.summary.criticalIssues > 0;
        
        return report;
    }
    
    /**
     * コンソール用のレポートを出力
     */
    static printConsoleReport(report) {
        Logger.section('設定検証結果レポート');
        
        // 概要
        console.log(`検証日時: ${report.timestamp}`);
        console.log(`バブルタイプ数: ${report.summary.totalBubbleTypes}`);
        console.log(`重要な問題: ${report.summary.criticalIssues}`);
        console.log(`問題合計: ${report.summary.totalIssues}`);
        console.log(`警告合計: ${report.summary.totalWarnings}`);
        console.log(`ビルド結果: ${report.summary.buildShouldFail ? '失敗' : '成功'}`);
        
        // 重要な問題
        if (report.summary.criticalIssues > 0) {
            Logger.section('❌ 重要な問題（ビルド失敗要因）');
            
            const criticalIssues = [
                ...report.details.consistency.issues.filter(i => i.severity === 'HIGH'),
                ...report.details.logical.issues.filter(i => i.severity === 'HIGH')
            ];
            
            criticalIssues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.type}] ${issue.message}`);
                if (issue.bubbleType) {
                    console.log(`   バブルタイプ: ${issue.bubbleType}`);
                }
                if (issue.gameBalance !== undefined && issue.bubbleClass !== undefined) {
                    console.log(`   GameBalance: ${issue.gameBalance}, Bubble: ${issue.bubbleClass}`);
                }
            });
        }
        
        // その他の問題
        const nonCriticalIssues = [
            ...report.details.consistency.issues.filter(i => i.severity !== 'HIGH'),
            ...report.details.logical.issues.filter(i => i.severity !== 'HIGH')
        ];
        
        if (nonCriticalIssues.length > 0) {
            Logger.section('⚠️  その他の問題');
            
            nonCriticalIssues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.type}] ${issue.message}`);
                if (issue.bubbleType) {
                    console.log(`   バブルタイプ: ${issue.bubbleType}`);
                }
            });
        }
        
        // 警告
        const allWarnings = [
            ...report.details.consistency.warnings,
            ...report.details.logical.warnings,
            ...report.details.performance.warnings
        ];
        
        if (allWarnings.length > 0) {
            Logger.section('ℹ️  警告');
            
            allWarnings.forEach((warning, index) => {
                console.log(`${index + 1}. [${warning.type}] ${warning.message}`);
                if (warning.bubbleType) {
                    console.log(`   バブルタイプ: ${warning.bubbleType}`);
                }
            });
        }
        
        // 成功メッセージ
        if (report.summary.totalIssues === 0 && report.summary.totalWarnings === 0) {
            Logger.success('✅ すべての設定検証が正常に完了しました！');
        }
    }
    
    /**
     * JSON形式のレポートファイルを保存
     */
    static saveJsonReport(report, outputPath) {
        try {
            const jsonReport = JSON.stringify(report, null, 2);
            fs.writeFileSync(outputPath, jsonReport);
            Logger.info(`JSONレポートを保存しました: ${outputPath}`);
        } catch (error) {
            Logger.error(`JSONレポート保存エラー: ${error.message}`);
        }
    }
}

// メイン実行関数
async function main() {
    try {
        // ファイル存在確認
        checkRequiredFiles();
        
        Logger.section('ゲームバランス設定検証を開始');
        
        if (isCI) {
            Logger.info('CI環境で実行中...');
        }
        
        // 設定抽出
        Logger.info('設定ファイルから値を抽出中...');
        const gameBalanceConfig = ConfigurationExtractor.extractGameBalanceConfig();
        const bubbleConfig = ConfigurationExtractor.extractBubbleHardcodedConfig();
        const testExpectations = ConfigurationExtractor.extractTestExpectations();
        
        // 検証実行
        Logger.info('設定の整合性を検証中...');
        const consistencyResults = ValidationRules.validateConsistency(
            gameBalanceConfig, 
            bubbleConfig, 
            testExpectations
        );
        
        Logger.info('論理的整合性を検証中...');
        const logicalResults = ValidationRules.validateLogicalConsistency(gameBalanceConfig);
        
        Logger.info('パフォーマンス影響を検証中...');
        const performanceResults = ValidationRules.validatePerformanceImpact(gameBalanceConfig);
        
        // レポート生成
        const validationResults = {
            consistency: consistencyResults,
            logical: logicalResults,
            performance: performanceResults
        };
        
        const report = ReportGenerator.generateReport(
            gameBalanceConfig,
            bubbleConfig,
            testExpectations,
            validationResults
        );
        
        // レポート出力
        ReportGenerator.printConsoleReport(report);
        
        // JSONレポート保存
        const reportsDir = path.join(PROJECT_ROOT, 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const jsonReportPath = path.join(reportsDir, `configuration-validation-${timestamp}.json`);
        ReportGenerator.saveJsonReport(report, jsonReportPath);
        
        // 終了コード決定
        if (report.summary.buildShouldFail) {
            Logger.error('❌ 重要な設定不整合によりビルドを失敗させます');
            process.exit(1);
        } else {
            Logger.success('✅ 設定検証が正常に完了しました');
            process.exit(0);
        }
        
    } catch (error) {
        Logger.error(`検証スクリプト実行エラー: ${error.message}`);
        
        if (isVerbose || isCI) {
            console.error('Stack trace:', error.stack);
        }
        
        // CI環境では詳細なエラー情報を出力
        if (isCI) {
            console.error('Environment info:');
            console.error(`  Node.js version: ${process.version}`);
            console.error(`  Platform: ${process.platform}`);
            console.error(`  Architecture: ${process.arch}`);
            console.error(`  Working directory: ${process.cwd()}`);
            console.error(`  Script directory: ${__dirname}`);
            console.error(`  Project root: ${PROJECT_ROOT}`);
        }
        
        process.exit(1);
    }
}

// コマンドライン引数処理
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node validate-configuration.js [options]

Options:
  --help, -h     このヘルプを表示
  --verbose, -v  詳細ログを出力
  --json-only    JSONレポートのみ出力（コンソール出力なし）

Examples:
  node validate-configuration.js
  node validate-configuration.js --verbose
  npm run validate:config
        `);
        process.exit(0);
    }
    
    if (args.includes('--verbose') || args.includes('-v')) {
        // 詳細ログモード（将来の実装用）
        Logger.info('詳細ログモードで実行中...');
    }
    
    main();
}

export {
    ConfigurationExtractor,
    ValidationRules,
    ReportGenerator
};