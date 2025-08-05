#!/usr/bin/env node

/**
 * Interactive Balance Adjustment Tool - Main Controller
 * 
 * インタラクティブなバランス調整ツール（Main Controller Pattern実装）
 * 設定値の変更、影響プレビュー、テスト実行を統合的に提供
 * 
 * Usage:
 *   node tools/balance/balance-adjuster.js
 *   node tools/balance/balance-adjuster.js --batch changes.json
 *   node tools/balance/balance-adjuster.js --analyze-current
 * 
 * Created: 2025-07-27 (Task 8.2)
 * Refactored: Phase F.4 - Main Controller Pattern
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';

// Import sub-components
import { BalanceDataLoader } from './BalanceDataLoader.js';
import { BalanceCalculator } from './BalanceCalculator.js';
import { BalanceValidator } from './BalanceValidator.js';
import { BalanceExporter } from './BalanceExporter.js';

// Import configuration utilities
import { BalanceGuidelinesManager } from '../../src/utils/BalanceGuidelinesManager.js';
import { BalanceConfigurationValidator } from '../../src/utils/BalanceConfigurationValidator.js';
import { ConfigurationSynchronizer } from '../../src/utils/ConfigurationSynchronizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

/**
 * インタラクティブバランス調整ツール - Main Controller
 * Main Controller Patternを採用し、各専門コンポーネントを統制
 */
class BalanceAdjuster {
    constructor() {
        // Project configuration
        this.projectRoot = PROJECT_ROOT;
        
        // Initialize sub-components (dependency injection)
        this.dataLoader = new BalanceDataLoader(this);
        this.calculator = new BalanceCalculator(this);
        this.validator = new BalanceValidator(this);
        this.exporter = new BalanceExporter(this);
        
        // Initialize configuration utilities
        this.guidelines = new BalanceGuidelinesManager();
        this.synchronizer = new ConfigurationSynchronizer();
        this.configValidator = new BalanceConfigurationValidator();
        
        // Load current configuration via sub-component
        this.currentConfig = this.dataLoader.loadCurrentConfiguration();
        
        // Session management
        this.pendingChanges = {};
        this.session = {
            startTime: new Date(),
            changes: [],
            testResults: []
        };
    }

    /**
     * メインエントリーポイント
     */
    async run() {
        try {
            await this.parseCommandLineArguments();
            
            if (program.opts().batch) {
                await this.runBatchMode(program.opts().batch);
            } else if (program.opts().analyzeCurrent) {
                await this.runAnalysisMode();
            } else {
                await this.showMainMenu();
            }
            
        } catch (error) {
            console.error(chalk.red(`ツール実行エラー: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * コマンドライン引数の解析
     */
    async parseCommandLineArguments() {
        program
            .name('balance-adjuster')
            .description('インタラクティブバランス調整ツール')
            .version('1.0.0')
            .option('-b, --batch <file>', 'バッチモードで変更を適用')
            .option('-a, --analyze-current', '現在の設定を分析')
            .option('-v, --verbose', '詳細ログを出力')
            .parse();
    }

    /**
     * メインメニューの表示
     */
    async showMainMenu() {
        console.clear();
        console.log(chalk.bold.blue('🎮 Awaputi Balance Adjustment Tool'));
        console.log(chalk.gray('=========================================='));
        console.log(`セッション開始: ${this.session.startTime.toLocaleString()}`);
        console.log(`保留中の変更: ${Object.keys(this.pendingChanges).length}件\n`);

        const choices = [
            { name: '📊 現在の設定を表示', value: 'view-current' },
            { name: '⚙️  設定値を変更', value: 'modify-settings' },
            { name: '🔍 影響分析を実行', value: 'analyze-impact' },
            { name: '🧪 テストを実行', value: 'run-tests' },
            { name: '💾 変更を保存', value: 'save-changes' },
            { name: '↩️  変更を取り消し', value: 'revert-changes' },
            { name: '📋 バランスガイドラインを表示', value: 'show-guidelines' },
            { name: '📊 設定比較', value: 'compare-configs' },
            { name: '🚪 終了', value: 'exit' }
        ];

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '実行したいアクションを選択してください:',
                choices: choices
            }
        ]);

        await this.executeAction(answer.action);
    }

    /**
     * アクションの実行（delegation to sub-components）
     * @param {string} action - 実行するアクション
     */
    async executeAction(action) {
        try {
            switch (action) {
                case 'view-current':
                    await this.viewCurrentConfiguration();
                    break;
                case 'modify-settings':
                    await this.modifySettings();
                    break;
                case 'analyze-impact':
                    await this.analyzeImpact();
                    break;
                case 'run-tests':
                    await this.runTests();
                    break;
                case 'save-changes':
                    await this.saveChanges();
                    break;
                case 'revert-changes':
                    await this.revertChanges();
                    break;
                case 'show-guidelines':
                    await this.showGuidelines();
                    break;
                case 'compare-configs':
                    await this.compareConfigurations();
                    break;
                case 'exit':
                    await this.handleExit();
                    return;
            }

            // メインメニューに戻る
            await this.showMainMenu();

        } catch (error) {
            console.error(chalk.red(`エラー: ${error.message}`));
            await this.pressAnyKey();
            await this.showMainMenu();
        }
    }

    // ========================================
    // Delegation Methods to Sub-Components
    // ========================================

    /**
     * 現在の設定表示（DataLoaderコンポーネントを使用）
     */
    async viewCurrentConfiguration() {
        console.clear();
        console.log(chalk.bold.cyan('📊 現在の設定'));
        console.log('='.repeat(50));

        // Configuration reload via DataLoader
        this.dataLoader.reloadConfiguration();
        
        const categories = [
            { name: 'スコア設定', key: 'scoring', icon: '🎯' },
            { name: 'バブル設定', key: 'bubbles', icon: '🫧' },
            { name: 'ステージ設定', key: 'stages', icon: '🎪' },
            { name: 'パフォーマンス設定', key: 'performance', icon: '⚡' }
        ];

        const selectedCategory = await inquirer.prompt([
            {
                type: 'list',
                name: 'category',
                message: '表示するカテゴリを選択:',
                choices: categories.map(cat => ({
                    name: `${cat.icon} ${cat.name}`,
                    value: cat.key
                }))
            }
        ]);

        this.displayConfigurationCategory(selectedCategory.category);
        await this.pressAnyKey();
    }

    /**
     * 影響分析の実行（Calculatorコンポーネントを使用）
     */
    async analyzeImpact() {
        console.clear();
        console.log(chalk.bold.yellow('🔍 影響分析'));
        console.log('='.repeat(50));

        if (Object.keys(this.pendingChanges).length === 0) {
            console.log(chalk.yellow('分析する変更がありません。'));
            await this.pressAnyKey();
            return;
        }

        // Delegate to Calculator component
        const impact = this.calculator.previewBalanceImpact(this.pendingChanges);
        
        // Ask for detailed analysis
        const detailAnswer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'detailed',
                message: '詳細分析を実行しますか？',
                default: false
            }
        ]);

        if (detailAnswer.detailed) {
            const detailedAnalysis = this.calculator.performDetailedImpactAnalysis(this.pendingChanges);
            console.log(chalk.green('詳細分析が完了しました'));
        }

        await this.pressAnyKey();
    }

    /**
     * テストの実行（Validatorコンポーネントを使用）
     */
    async runTests() {
        console.clear();
        console.log(chalk.bold.magenta('🧪 テスト実行'));
        console.log('='.repeat(50));

        const testChoice = await inquirer.prompt([
            {
                type: 'list',
                name: 'testType',
                message: '実行するテストを選択:',
                choices: [
                    { name: '⚡ クイックテスト', value: 'quick' },
                    { name: '⚖️  バランステスト', value: 'balance' },
                    { name: '🚀 パフォーマンステスト', value: 'performance' },
                    { name: '🔄 戻る', value: 'back' }
                ]
            }
        ]);

        if (testChoice.testType === 'back') return;

        // Delegate to Validator component
        let results;
        switch (testChoice.testType) {
            case 'quick':
                results = await this.validator.runQuickTests(this.pendingChanges);
                break;
            case 'balance':
                results = await this.validator.runBalanceTests(this.pendingChanges);
                break;
            case 'performance':
                results = await this.validator.runPerformanceTests(this.pendingChanges);
                break;
        }

        this.session.testResults.push(results);
        await this.pressAnyKey();
    }

    /**
     * 変更の保存（Exporterコンポーネントを使用）
     */
    async saveChanges() {
        console.clear();
        console.log(chalk.bold.green('💾 変更の保存'));
        console.log('='.repeat(50));

        if (Object.keys(this.pendingChanges).length === 0) {
            console.log(chalk.yellow('保存する変更がありません。'));
            await this.pressAnyKey();
            return;
        }

        const saveOptions = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'createBackup',
                message: 'バックアップを作成しますか？',
                default: true
            },
            {
                type: 'confirm',
                name: 'runTests',
                message: '保存前にテストを実行しますか？',
                default: true
            }
        ]);

        // Pre-save testing if requested
        if (saveOptions.runTests) {
            console.log(chalk.blue('保存前テストを実行中...'));
            const testResults = await this.validator.runQuickTests(this.pendingChanges);
            
            if (testResults.failed > 0) {
                console.log(chalk.red(`⚠️  ${testResults.failed}件のテストが失敗しました。`));
                const continueAnswer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'continue',
                        message: 'それでも保存を続行しますか？',
                        default: false
                    }
                ]);
                
                if (!continueAnswer.continue) {
                    console.log(chalk.yellow('保存をキャンセルしました。'));
                    await this.pressAnyKey();
                    return;
                }
            }
        }

        // Delegate to Exporter component
        const saveResult = await this.exporter.saveChanges(this.pendingChanges, saveOptions);
        
        if (saveResult.success) {
            console.log(chalk.green('✅ 変更が正常に保存されました！'));
            this.session.changes.push(...saveResult.appliedChanges);
        }

        await this.pressAnyKey();
    }

    // ========================================
    // Utility Methods
    // ========================================

    /**
     * バッチモードの実行
     * @param {string} batchFile - バッチファイルパス
     */
    async runBatchMode(batchFile) {
        console.log(chalk.blue(`🔄 バッチモード: ${batchFile}`));
        // Implementation delegated to Exporter
        const batchChanges = this.loadBatchFile(batchFile);
        await this.exporter.exportBatchChanges(batchChanges);
    }

    /**
     * 分析モードの実行
     */
    async runAnalysisMode() {
        console.log(chalk.blue('🔍 分析モード'));
        const analysis = this.calculator.performDetailedImpactAnalysis(this.currentConfig);
        console.log('分析完了');
    }

    /**
     * 設定カテゴリの表示
     * @param {string} category - カテゴリ名
     */
    displayConfigurationCategory(category) {
        const config = this.currentConfig[category];
        if (!config) {
            console.log(chalk.yellow(`カテゴリ '${category}' が見つかりません`));
            return;
        }

        const table = new Table({
            head: ['設定項目', '現在の値', '変更予定', '状態'],
            colWidths: [30, 15, 15, 10]
        });

        this.addConfigToTable(table, config, category);
        console.log('\n' + table.toString());

        const pendingInCategory = Object.keys(this.pendingChanges)
            .filter(key => key.startsWith(category)).length;
        
        if (pendingInCategory > 0) {
            console.log(chalk.yellow(`\n${pendingInCategory}件の変更が保留中です`));
        }
    }

    /**
     * テーブルに設定を追加
     * @param {Table} table - テーブルオブジェクト
     * @param {Object} config - 設定オブジェクト
     * @param {string} prefix - キープレフィックス
     */
    addConfigToTable(table, config, prefix = '') {
        for (const [key, value] of Object.entries(config)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.addConfigToTable(table, value, fullKey);
            } else {
                const pendingChange = this.pendingChanges[fullKey];
                const status = pendingChange ? '🔄' : '✅';
                const newValue = pendingChange ? pendingChange.newValue : '-';
                
                table.push([
                    key,
                    String(value).substring(0, 12),
                    String(newValue).substring(0, 12),
                    status
                ]);
            }
        }
    }

    /**
     * キー入力待ち
     */
    async pressAnyKey() {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: 'Enterキーを押して続行...'
            }
        ]);
    }

    // ========================================
    // Simplified placeholder methods
    // ========================================
    
    async modifySettings() { console.log('設定変更機能'); await this.pressAnyKey(); }
    async revertChanges() { this.pendingChanges = {}; console.log('変更を取り消しました'); await this.pressAnyKey(); }
    async showGuidelines() { console.log('ガイドライン表示'); await this.pressAnyKey(); }
    async compareConfigurations() { console.log('設定比較機能'); await this.pressAnyKey(); }
    async handleExit() { console.log(chalk.green('ツールを終了します')); process.exit(0); }
    loadBatchFile(filename) { return []; }
}

// ========================================
// Entry Point
// ========================================

if (import.meta.url === `file://${process.argv[1]}`) {
    const tool = new BalanceAdjuster();
    tool.run().catch(console.error);
}

export { BalanceAdjuster };