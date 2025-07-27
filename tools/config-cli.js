#!/usr/bin/env node

/**
 * Configuration Management CLI Tool
 * 
 * ゲームバランス設定の検証、同期、管理のためのコマンドラインツール
 * 
 * Usage:
 *   node tools/config-cli.js validate [--fix] [--verbose]
 *   node tools/config-cli.js sync [--dry-run] [--source=file]
 *   node tools/config-cli.js diff <file1> <file2> [--format=json|table]
 *   node tools/config-cli.js balance-preview <changes.json> [--export=report.json]
 *   node tools/config-cli.js merge <base> <source1> <source2> [--output=merged.json]
 * 
 * Created: 2025-07-27 (Task 8.2)
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { program } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Import configuration utilities
import { ConfigurationSynchronizer } from '../src/utils/ConfigurationSynchronizer.js';
import { BalanceConfigurationValidator } from '../src/utils/BalanceConfigurationValidator.js';
import { ConfigurationMigrationUtility } from '../src/utils/ConfigurationMigrationUtility.js';
import { BalanceGuidelinesManager } from '../src/utils/BalanceGuidelinesManager.js';

/**
 * CLIユーティリティクラス
 * コマンドライン操作の共通機能を提供
 */
class ConfigCLI {
    constructor() {
        this.synchronizer = new ConfigurationSynchronizer();
        this.validator = new BalanceConfigurationValidator();
        this.migrator = new ConfigurationMigrationUtility();
        this.guidelines = new BalanceGuidelinesManager();
        this.verbose = false;
    }

    /**
     * ログ出力
     * @param {string} message - メッセージ
     * @param {string} level - ログレベル (info, warn, error, success)
     */
    log(message, level = 'info') {
        const colors = {
            info: chalk.blue,
            warn: chalk.yellow,
            error: chalk.red,
            success: chalk.green,
            verbose: chalk.gray
        };

        if (level === 'verbose' && !this.verbose) return;

        const colorFn = colors[level] || chalk.white;
        const prefix = {
            info: '[INFO]',
            warn: '[WARN]',
            error: '[ERROR]',
            success: '[SUCCESS]',
            verbose: '[VERBOSE]'
        }[level] || '[LOG]';

        console.log(colorFn(`${prefix} ${message}`));
    }

    /**
     * 設定検証コマンド
     * @param {Object} options - コマンドオプション
     */
    async validateCommand(options) {
        this.verbose = options.verbose;
        this.log('設定検証を開始します...', 'info');

        try {
            // 設定ファイルの整合性チェック
            this.log('設定ファイルの整合性をチェック中...', 'verbose');
            const consistencyResult = await this.synchronizer.validateConsistency();
            
            // 各設定値の検証
            this.log('個別設定値の検証中...', 'verbose');
            const validationResult = this.validator.validateAllConfigurations();

            // 結果の集計
            const totalIssues = consistencyResult.issues.length + validationResult.issues.length;
            const totalWarnings = consistencyResult.warnings.length + validationResult.warnings.length;

            // 結果レポートの作成
            this.generateValidationReport(consistencyResult, validationResult);

            // 自動修正の実行
            if (options.fix && totalIssues > 0) {
                this.log('自動修正を実行中...', 'info');
                await this.performAutoFix(consistencyResult, validationResult);
            }

            // 終了状況の判定
            if (totalIssues === 0) {
                this.log(`検証完了: すべてのチェックがパスしました (警告: ${totalWarnings}件)`, 'success');
                process.exit(0);
            } else {
                this.log(`検証失敗: ${totalIssues}件の問題が検出されました`, 'error');
                process.exit(1);
            }

        } catch (error) {
            this.log(`検証エラー: ${error.message}`, 'error');
            if (this.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }

    /**
     * 設定同期コマンド
     * @param {Object} options - コマンドオプション
     */
    async syncCommand(options) {
        this.verbose = options.verbose;
        this.log('設定同期を開始します...', 'info');

        try {
            // 同期対象の特定
            const sourceFile = options.source || 'auto-detect';
            this.log(`同期ソース: ${sourceFile}`, 'verbose');

            // 不整合の検出
            const discrepancies = await this.synchronizer.identifyDiscrepancies();
            
            if (discrepancies.length === 0) {
                this.log('不整合は検出されませんでした', 'success');
                return;
            }

            this.log(`${discrepancies.length}件の不整合が検出されました`, 'warn');

            // 詳細表示
            if (this.verbose) {
                this.displayDiscrepancies(discrepancies);
            }

            // 同期実行
            if (!options.dryRun) {
                this.log('同期処理を実行中...', 'info');
                const syncResult = await this.synchronizer.synchronizeConfigurations();
                
                if (syncResult.success) {
                    this.log(`同期完了: ${syncResult.updated.length}件のファイルを更新しました`, 'success');
                    syncResult.updated.forEach(file => {
                        this.log(`  - ${file}`, 'verbose');
                    });
                } else {
                    this.log(`同期失敗: ${syncResult.error}`, 'error');
                    process.exit(1);
                }
            } else {
                this.log('ドライラン完了: 実際の変更は行われませんでした', 'info');
                this.log('同期を実行するには --dry-run オプションを除いて実行してください', 'info');
            }

        } catch (error) {
            this.log(`同期エラー: ${error.message}`, 'error');
            if (this.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }

    /**
     * 設定差分コマンド
     * @param {string} file1 - 比較ファイル1
     * @param {string} file2 - 比較ファイル2  
     * @param {Object} options - コマンドオプション
     */
    async diffCommand(file1, file2, options) {
        this.verbose = options.verbose;
        this.log(`設定差分を比較中: ${file1} vs ${file2}`, 'info');

        try {
            // ファイル存在確認
            if (!existsSync(file1)) {
                throw new Error(`ファイルが見つかりません: ${file1}`);
            }
            if (!existsSync(file2)) {
                throw new Error(`ファイルが見つかりません: ${file2}`);
            }

            // 設定ファイルの読み込み
            const config1 = this.loadConfigurationFile(file1);
            const config2 = this.loadConfigurationFile(file2);

            // 差分計算
            const differences = this.calculateConfigDifferences(config1, config2);

            // 出力形式の選択
            if (options.format === 'json') {
                console.log(JSON.stringify(differences, null, 2));
            } else {
                this.displayDifferencesTable(differences);
            }

            // 差分統計
            const stats = this.calculateDiffStats(differences);
            this.log(`差分統計: 追加 ${stats.added}, 削除 ${stats.removed}, 変更 ${stats.modified}`, 'info');

        } catch (error) {
            this.log(`差分比較エラー: ${error.message}`, 'error');
            process.exit(1);
        }
    }

    /**
     * バランス影響プレビューコマンド
     * @param {string} changesFile - 変更設定ファイル
     * @param {Object} options - コマンドオプション
     */
    async balancePreviewCommand(changesFile, options) {
        this.verbose = options.verbose;
        this.log(`バランス影響を分析中: ${changesFile}`, 'info');

        try {
            // 変更設定の読み込み
            if (!existsSync(changesFile)) {
                throw new Error(`変更ファイルが見つかりません: ${changesFile}`);
            }

            const changes = JSON.parse(readFileSync(changesFile, 'utf8'));
            this.log(`${Object.keys(changes).length}件の変更を検出`, 'verbose');

            // 影響分析の実行
            const impactAnalysis = await this.analyzeBalanceImpact(changes);

            // レポート生成
            const report = this.generateBalanceImpactReport(impactAnalysis);

            // 結果の表示
            this.displayBalanceImpactReport(report);

            // レポートのエクスポート
            if (options.export) {
                writeFileSync(options.export, JSON.stringify(report, null, 2));
                this.log(`レポートをエクスポートしました: ${options.export}`, 'success');
            }

        } catch (error) {
            this.log(`バランス分析エラー: ${error.message}`, 'error');
            if (this.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }

    /**
     * 設定マージコマンド
     * @param {string} base - ベース設定ファイル
     * @param {string} source1 - マージソース1
     * @param {string} source2 - マージソース2
     * @param {Object} options - コマンドオプション
     */
    async mergeCommand(base, source1, source2, options) {
        this.verbose = options.verbose;
        this.log(`設定マージを実行中: ${base} + ${source1} + ${source2}`, 'info');

        try {
            // ファイル存在確認
            [base, source1, source2].forEach(file => {
                if (!existsSync(file)) {
                    throw new Error(`ファイルが見つかりません: ${file}`);
                }
            });

            // 設定ファイルの読み込み
            const baseConfig = this.loadConfigurationFile(base);
            const source1Config = this.loadConfigurationFile(source1);
            const source2Config = this.loadConfigurationFile(source2);

            // マージ実行
            const mergedConfig = this.mergeConfigurations(baseConfig, source1Config, source2Config);

            // 競合検出
            const conflicts = this.detectMergeConflicts(source1Config, source2Config);
            if (conflicts.length > 0) {
                this.log(`${conflicts.length}件の競合が検出されました`, 'warn');
                this.displayMergeConflicts(conflicts);
            }

            // 結果の出力
            const outputFile = options.output || 'merged-config.json';
            writeFileSync(outputFile, JSON.stringify(mergedConfig, null, 2));
            this.log(`マージ結果を出力しました: ${outputFile}`, 'success');

            // マージ統計
            const stats = this.calculateMergeStats(baseConfig, mergedConfig);
            this.log(`マージ統計: ${stats.totalKeys}キー, ${stats.conflictsResolved}競合解決`, 'info');

        } catch (error) {
            this.log(`マージエラー: ${error.message}`, 'error');
            process.exit(1);
        }
    }

    /**
     * 検証レポートの生成
     * @param {Object} consistencyResult - 整合性チェック結果
     * @param {Object} validationResult - 検証結果
     */
    generateValidationReport(consistencyResult, validationResult) {
        console.log('\n' + chalk.bold('=== 設定検証レポート ==='));

        // 整合性チェック結果
        if (consistencyResult.issues.length > 0) {
            console.log(chalk.red.bold('\n整合性の問題:'));
            consistencyResult.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.message}`);
                if (issue.details) {
                    console.log(`   詳細: ${issue.details}`);
                }
            });
        }

        // 検証結果
        if (validationResult.issues.length > 0) {
            console.log(chalk.red.bold('\n検証エラー:'));
            validationResult.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.message}`);
                if (issue.field) {
                    console.log(`   フィールド: ${issue.field}`);
                }
                if (issue.currentValue) {
                    console.log(`   現在の値: ${issue.currentValue}`);
                }
            });
        }

        // 警告
        const allWarnings = [...consistencyResult.warnings, ...validationResult.warnings];
        if (allWarnings.length > 0) {
            console.log(chalk.yellow.bold('\n警告:'));
            allWarnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning.message}`);
            });
        }
    }

    /**
     * 不整合の表示
     * @param {Array} discrepancies - 不整合リスト
     */
    displayDiscrepancies(discrepancies) {
        const table = new Table({
            head: ['設定キー', 'ソース1', 'ソース2', '推奨アクション'],
            colWidths: [30, 15, 15, 25]
        });

        discrepancies.forEach(disc => {
            table.push([
                disc.key,
                disc.source1Value,
                disc.source2Value,
                disc.recommendedAction || '手動確認'
            ]);
        });

        console.log('\n' + table.toString());
    }

    /**
     * 差分テーブルの表示
     * @param {Object} differences - 差分オブジェクト
     */
    displayDifferencesTable(differences) {
        const table = new Table({
            head: ['キー', 'タイプ', 'ファイル1', 'ファイル2'],
            colWidths: [40, 10, 20, 20]
        });

        Object.entries(differences).forEach(([key, diff]) => {
            let type, value1, value2;
            
            if (diff.type === 'added') {
                type = chalk.green('追加');
                value1 = '-';
                value2 = diff.value;
            } else if (diff.type === 'removed') {
                type = chalk.red('削除');
                value1 = diff.value;
                value2 = '-';
            } else if (diff.type === 'modified') {
                type = chalk.yellow('変更');
                value1 = diff.oldValue;
                value2 = diff.newValue;
            }

            table.push([key, type, value1, value2]);
        });

        console.log('\n' + table.toString());
    }

    /**
     * バランス影響レポートの表示
     * @param {Object} report - 影響分析レポート
     */
    displayBalanceImpactReport(report) {
        console.log('\n' + chalk.bold('=== バランス影響分析レポート ==='));

        // サマリー
        console.log(chalk.blue.bold('\n概要:'));
        console.log(`影響度: ${report.summary.impactLevel}`);
        console.log(`変更数: ${report.summary.totalChanges}`);
        console.log(`高リスク変更: ${report.summary.highRiskChanges}`);

        // 詳細分析
        if (report.detailed.length > 0) {
            console.log(chalk.blue.bold('\n詳細分析:'));
            
            const table = new Table({
                head: ['設定', '旧値', '新値', '影響', 'リスク'],
                colWidths: [25, 10, 10, 30, 10]
            });

            report.detailed.forEach(analysis => {
                const riskColor = analysis.risk === 'HIGH' ? chalk.red : 
                                analysis.risk === 'MEDIUM' ? chalk.yellow : chalk.green;
                
                table.push([
                    analysis.setting,
                    analysis.oldValue,
                    analysis.newValue,
                    analysis.impact,
                    riskColor(analysis.risk)
                ]);
            });

            console.log(table.toString());
        }

        // 推奨事項
        if (report.recommendations.length > 0) {
            console.log(chalk.green.bold('\n推奨事項:'));
            report.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
        }
    }

    /**
     * マージ競合の表示
     * @param {Array} conflicts - 競合リスト
     */
    displayMergeConflicts(conflicts) {
        console.log(chalk.yellow.bold('\nマージ競合:'));
        
        const table = new Table({
            head: ['キー', 'ソース1', 'ソース2', '解決策'],
            colWidths: [30, 15, 15, 25]
        });

        conflicts.forEach(conflict => {
            table.push([
                conflict.key,
                conflict.source1Value,
                conflict.source2Value,
                conflict.resolution || '手動解決'
            ]);
        });

        console.log(table.toString());
    }

    /**
     * 設定ファイルの読み込み
     * @param {string} filePath - ファイルパス
     * @returns {Object} 設定オブジェクト
     */
    loadConfigurationFile(filePath) {
        const content = readFileSync(filePath, 'utf8');
        
        if (filePath.endsWith('.json')) {
            return JSON.parse(content);
        } else if (filePath.endsWith('.js')) {
            // 簡易的なJSファイル解析（実際の実装では更に堅牢にする）
            const configMatch = content.match(/export\s+const\s+\w+\s*=\s*({[\s\S]*?});/);
            if (configMatch) {
                return eval(`(${configMatch[1]})`);
            }
        }
        
        throw new Error(`サポートされていないファイル形式: ${filePath}`);
    }

    /**
     * 設定差分の計算
     * @param {Object} config1 - 設定1
     * @param {Object} config2 - 設定2  
     * @returns {Object} 差分オブジェクト
     */
    calculateConfigDifferences(config1, config2) {
        const differences = {};
        
        // 平坦化した設定オブジェクトで比較
        const flat1 = this.flattenConfig(config1);
        const flat2 = this.flattenConfig(config2);
        
        // すべてのキーを収集
        const allKeys = new Set([...Object.keys(flat1), ...Object.keys(flat2)]);
        
        for (const key of allKeys) {
            if (!(key in flat1)) {
                differences[key] = { type: 'added', value: flat2[key] };
            } else if (!(key in flat2)) {
                differences[key] = { type: 'removed', value: flat1[key] };
            } else if (flat1[key] !== flat2[key]) {
                differences[key] = { 
                    type: 'modified', 
                    oldValue: flat1[key], 
                    newValue: flat2[key] 
                };
            }
        }
        
        return differences;
    }

    /**
     * 設定オブジェクトの平坦化
     * @param {Object} obj - 設定オブジェクト
     * @param {string} prefix - キープレフィックス
     * @returns {Object} 平坦化されたオブジェクト
     */
    flattenConfig(obj, prefix = '') {
        const result = {};
        
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(result, this.flattenConfig(value, newKey));
            } else {
                result[newKey] = value;
            }
        }
        
        return result;
    }

    /**
     * バランス影響の分析
     * @param {Object} changes - 変更設定
     * @returns {Object} 影響分析結果
     */
    async analyzeBalanceImpact(changes) {
        const analysis = {
            changes: [],
            impactLevel: 'LOW',
            affectedSystems: [],
            risks: []
        };

        for (const [key, newValue] of Object.entries(changes)) {
            // 現在の値を取得
            const currentValue = this.getCurrentConfigValue(key);
            
            // 影響分析
            const impact = await this.guidelines.analyzeBalanceImpact({
                [key]: { old: currentValue, new: newValue }
            });
            
            analysis.changes.push({
                key,
                oldValue: currentValue,
                newValue,
                impact: impact[key]
            });

            // 全体影響レベルの更新
            if (impact[key]?.risk === 'HIGH') {
                analysis.impactLevel = 'HIGH';
            } else if (impact[key]?.risk === 'MEDIUM' && analysis.impactLevel !== 'HIGH') {
                analysis.impactLevel = 'MEDIUM';
            }
        }

        return analysis;
    }

    /**
     * 現在の設定値を取得
     * @param {string} key - 設定キー
     * @returns {*} 設定値
     */
    getCurrentConfigValue(key) {
        // 実装簡略化（実際の実装では ConfigurationManager を使用）
        const configPath = join(PROJECT_ROOT, 'src/config/GameBalance.js');
        try {
            const configContent = readFileSync(configPath, 'utf8');
            // 簡易的な値抽出（実際の実装では更に堅牢にする）
            const match = configContent.match(new RegExp(`${key}:\\s*([^,}]+)`));
            return match ? match[1].trim() : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * バランス影響レポートの生成
     * @param {Object} analysis - 分析結果
     * @returns {Object} レポート
     */
    generateBalanceImpactReport(analysis) {
        return {
            timestamp: new Date().toISOString(),
            summary: {
                impactLevel: analysis.impactLevel,
                totalChanges: analysis.changes.length,
                highRiskChanges: analysis.changes.filter(c => c.impact?.risk === 'HIGH').length
            },
            detailed: analysis.changes.map(change => ({
                setting: change.key,
                oldValue: change.oldValue,
                newValue: change.newValue,
                impact: change.impact?.description || '影響不明',
                risk: change.impact?.risk || 'UNKNOWN'
            })),
            recommendations: this.generateRecommendations(analysis)
        };
    }

    /**
     * 推奨事項の生成
     * @param {Object} analysis - 分析結果
     * @returns {Array} 推奨事項リスト
     */
    generateRecommendations(analysis) {
        const recommendations = [];
        
        const highRiskChanges = analysis.changes.filter(c => c.impact?.risk === 'HIGH');
        if (highRiskChanges.length > 0) {
            recommendations.push('高リスク変更が検出されました。十分なテストを実施してください。');
        }

        const balanceChanges = analysis.changes.filter(c => 
            c.key.includes('score') || c.key.includes('health')
        );
        if (balanceChanges.length > 0) {
            recommendations.push('バランス調整はプレイテストで検証することを強く推奨します。');
        }

        return recommendations;
    }

    /**
     * 設定のマージ
     * @param {Object} base - ベース設定
     * @param {Object} source1 - ソース1
     * @param {Object} source2 - ソース2
     * @returns {Object} マージ結果
     */
    mergeConfigurations(base, source1, source2) {
        // 深いマージ（簡易実装）
        const merged = JSON.parse(JSON.stringify(base));
        
        this.deepMerge(merged, source1);
        this.deepMerge(merged, source2);
        
        return merged;
    }

    /**
     * 深いマージ
     * @param {Object} target - マージ対象
     * @param {Object} source - マージソース
     */
    deepMerge(target, source) {
        for (const key in source) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                if (!(key in target)) {
                    target[key] = {};
                }
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    /**
     * マージ競合の検出
     * @param {Object} source1 - ソース1
     * @param {Object} source2 - ソース2
     * @returns {Array} 競合リスト
     */
    detectMergeConflicts(source1, source2) {
        const conflicts = [];
        const flat1 = this.flattenConfig(source1);
        const flat2 = this.flattenConfig(source2);
        
        for (const key in flat1) {
            if (key in flat2 && flat1[key] !== flat2[key]) {
                conflicts.push({
                    key,
                    source1Value: flat1[key],
                    source2Value: flat2[key],
                    resolution: 'ソース2の値を採用'
                });
            }
        }
        
        return conflicts;
    }

    /**
     * 差分統計の計算
     * @param {Object} differences - 差分オブジェクト
     * @returns {Object} 統計情報
     */
    calculateDiffStats(differences) {
        const stats = { added: 0, removed: 0, modified: 0 };
        
        Object.values(differences).forEach(diff => {
            stats[diff.type]++;
        });
        
        return stats;
    }

    /**
     * マージ統計の計算
     * @param {Object} base - ベース設定
     * @param {Object} merged - マージ結果
     * @returns {Object} 統計情報
     */
    calculateMergeStats(base, merged) {
        const baseFlat = this.flattenConfig(base);
        const mergedFlat = this.flattenConfig(merged);
        
        return {
            totalKeys: Object.keys(mergedFlat).length,
            addedKeys: Object.keys(mergedFlat).length - Object.keys(baseFlat).length,
            conflictsResolved: 0 // 簡略化
        };
    }

    /**
     * 自動修正の実行
     * @param {Object} consistencyResult - 整合性結果
     * @param {Object} validationResult - 検証結果
     */
    async performAutoFix(consistencyResult, validationResult) {
        this.log('自動修正可能な問題を修正中...', 'info');
        
        let fixedCount = 0;
        
        // 簡単な整合性問題の自動修正
        for (const issue of consistencyResult.issues) {
            if (issue.autoFixable) {
                try {
                    await this.synchronizer.autoFix(issue);
                    fixedCount++;
                    this.log(`修正完了: ${issue.message}`, 'verbose');
                } catch (error) {
                    this.log(`修正失敗: ${issue.message} - ${error.message}`, 'warn');
                }
            }
        }
        
        this.log(`${fixedCount}件の問題を自動修正しました`, 'success');
    }
}

// CLI設定
program
    .name('config-cli')
    .description('ゲームバランス設定管理ツール')
    .version('1.0.0');

program
    .command('validate')
    .description('設定ファイルの検証')
    .option('--fix', '自動修正可能な問題を修正')
    .option('--verbose', '詳細ログを表示')
    .action(async (options) => {
        const cli = new ConfigCLI();
        await cli.validateCommand(options);
    });

program
    .command('sync')
    .description('設定ファイルの同期')
    .option('--dry-run', '実際の変更は行わずプレビューのみ')
    .option('--source <file>', '同期ソースファイル')
    .option('--verbose', '詳細ログを表示')
    .action(async (options) => {
        const cli = new ConfigCLI();
        await cli.syncCommand(options);
    });

program
    .command('diff <file1> <file2>')
    .description('設定ファイルの差分比較')
    .option('--format <type>', '出力形式 (json|table)', 'table')
    .option('--verbose', '詳細ログを表示')
    .action(async (file1, file2, options) => {
        const cli = new ConfigCLI();
        await cli.diffCommand(file1, file2, options);
    });

program
    .command('balance-preview <changes>')
    .description('バランス変更の影響プレビュー')
    .option('--export <file>', 'レポートをファイルにエクスポート')
    .option('--verbose', '詳細ログを表示')
    .action(async (changes, options) => {
        const cli = new ConfigCLI();
        await cli.balancePreviewCommand(changes, options);
    });

program
    .command('merge <base> <source1> <source2>')
    .description('設定ファイルのマージ')
    .option('--output <file>', '出力ファイル名', 'merged-config.json')
    .option('--verbose', '詳細ログを表示')
    .action(async (base, source1, source2, options) => {
        const cli = new ConfigCLI();
        await cli.mergeCommand(base, source1, source2, options);
    });

// CLIエラーハンドリング
program.exitOverride();

try {
    program.parse(process.argv);
} catch (err) {
    console.error(chalk.red(`CLIエラー: ${err.message}`));
    process.exit(1);
}

// 引数が提供されていない場合のヘルプ表示
if (!process.argv.slice(2).length) {
    program.outputHelp();
}