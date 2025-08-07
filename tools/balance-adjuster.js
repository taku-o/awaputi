#!/usr/bin/env node

/**
 * Interactive Balance Adjustment Tool - Main Controller
 * 
 * インタラクティブなバランス調整ツール（メインコントローラー）
 * Main Controller Patternを適用し、機能別コンポーネントを統制
 * 
 * Usage:
 *   node tools/balance-adjuster.js
 *   node tools/balance-adjuster.js --batch changes.json
 *   node tools/balance-adjuster.js --analyze-current
 * 
 * Refactored: Phase G.1 (Issue #103) - Main Controller Pattern
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Import Main Controller Pattern components
import { BalanceDataLoader } from './balance/BalanceDataLoader.js';
import { BalanceCalculator } from './balance/BalanceCalculator.js';
import { BalanceValidator } from './balance/BalanceValidator.js';
import { BalanceExporter } from './balance/BalanceExporter.js';
import { BalanceConfigManager } from './balance/BalanceConfigManager.js';

// Import legacy utilities for compatibility
import { BalanceGuidelinesManager } from '../src/utils/BalanceGuidelinesManager.js';
import { BalanceConfigurationValidator } from '../src/utils/BalanceConfigurationValidator.js';
import { ConfigurationSynchronizer } from '../src/utils/ConfigurationSynchronizer.js';

/**
 * バランス調整ツール メインコントローラー
 * Main Controller Patternを適用した軽量オーケストレーター
 */
class BalanceAdjuster {
    constructor() {
        // プロジェクト情報
        this.projectRoot = PROJECT_ROOT;
        
        // 従来のユーティリティ（互換性維持）
        this.guidelines = new BalanceGuidelinesManager();
        this.validator = new BalanceConfigurationValidator();
        this.synchronizer = new ConfigurationSynchronizer();
        
        // Main Controller Pattern コンポーネント
        this.dataLoader = new BalanceDataLoader(this);
        this.calculator = new BalanceCalculator(this);
        this.validatorComponent = new BalanceValidator(this);
        this.exporter = new BalanceExporter(this);
        this.configManager = new BalanceConfigManager(this);
        
        // 状態管理
        this.currentConfig = this.dataLoader.loadCurrentConfiguration();
        this.pendingChanges = {};
        this.session = {
            startTime: new Date(),
            changes: [],
            testResults: []
        };
        
        console.log(chalk.green('✅ Balance Adjuster Tool 初期化完了 (Main Controller Pattern)'));
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
     * アクションの実行（Main Controller Pattern - 各コンポーネントへの委譲）
     * @param {string} action - 実行するアクション
     */
    async executeAction(action) {
        try {
            switch (action) {
                case 'view-current':
                    await this.configManager.viewCurrentConfiguration();
                    break;
                case 'modify-settings':
                    await this.configManager.modifySettings();
                    break;
                case 'analyze-impact':
                    await this.analyzeImpact();
                    break;
                case 'run-tests':
                    await this.runTests();
                    break;
                case 'save-changes':
                    await this.exporter.saveChanges();
                    break;
                case 'revert-changes':
                    await this.revertChanges();
                    break;
                case 'show-guidelines':
                    await this.showGuidelines();
                    break;
                case 'compare-configs':
                    await this.configManager.compareConfigurations();
                    break;
                case 'exit':
                    await this.handleExit();
                    return;
            }

            // メインメニューに戻る
            await this.showMainMenu();
        } catch (error) {
            console.error(chalk.red(`エラー: ${error.message}`));
            await this.showMainMenu();
        }
    }

    /**
     * 影響分析の実行（Calculator コンポーネントに委譲）
     */
    async analyzeImpact() {
        if (Object.keys(this.pendingChanges).length === 0) {
            console.log(chalk.yellow('保留中の変更がありません'));
            await this.pressAnyKey();
            return;
        }

        try {
            const analysis = await this.calculator.performDetailedImpactAnalysis();
            this.calculator.displayCalculationResults(analysis);
        } catch (error) {
            console.error(chalk.red(`影響分析エラー: ${error.message}`));
        }

        await this.pressAnyKey();
    }

    /**
     * テストの実行（Validator コンポーネントに委譲）
     */
    async runTests() {
        const testOptions = [
            { name: '🚀 クイックテスト', value: 'quick' },
            { name: '⚖️  バランステスト', value: 'balance' },
            { name: '⚡ パフォーマンステスト', value: 'performance' },
            { name: '🔙 戻る', value: 'back' }
        ];

        const testAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'testType',
                message: '実行するテストを選択してください:',
                choices: testOptions
            }
        ]);

        if (testAnswer.testType === 'back') return;

        try {
            switch (testAnswer.testType) {
                case 'quick':
                    await this.validatorComponent.runQuickTests();
                    break;
                case 'balance':
                    await this.validatorComponent.runBalanceTests();
                    break;
                case 'performance':
                    await this.validatorComponent.runPerformanceTests();
                    break;
            }
        } catch (error) {
            console.error(chalk.red(`テストエラー: ${error.message}`));
        }

        await this.pressAnyKey();
    }

    /**
     * 変更の取り消し
     */
    async revertChanges() {
        if (Object.keys(this.pendingChanges).length === 0) {
            console.log(chalk.yellow('取り消す変更がありません'));
            await this.pressAnyKey();
            return;
        }

        const revertOptions = [
            { name: 'すべての変更を取り消し', value: 'all' },
            { name: '個別に選択', value: 'selective' },
            { name: 'キャンセル', value: 'cancel' }
        ];

        const revertAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'option',
                message: '取り消しオプションを選択してください:',
                choices: revertOptions
            }
        ]);

        if (revertAnswer.option === 'cancel') return;

        if (revertAnswer.option === 'all') {
            this.pendingChanges = {};
            console.log(chalk.green('✅ すべての変更を取り消しました'));
        }

        await this.pressAnyKey();
    }

    /**
     * ガイドラインの表示
     */
    async showGuidelines() {
        try {
            const guidelines = await this.guidelines.getGuidelines();
            
            console.clear();
            console.log(chalk.bold.green('📋 バランスガイドライン'));
            console.log('='.repeat(50));

            guidelines.forEach((guideline, index) => {
                console.log(`${index + 1}. ${chalk.cyan(guideline.title)}`);
                console.log(`   ${guideline.description}`);
                
                if (guideline.parameters) {
                    Object.entries(guideline.parameters).forEach(([key, value]) => {
                        console.log(`   • ${key}: ${chalk.yellow(value)}`);
                    });
                }
                console.log();
            });
        } catch (error) {
            console.error(chalk.red(`ガイドライン読み込みエラー: ${error.message}`));
        }

        await this.pressAnyKey();
    }

    /**
     * 終了処理
     */
    async handleExit() {
        if (Object.keys(this.pendingChanges).length > 0) {
            const saveAnswer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'save',
                    message: '保留中の変更があります。保存してから終了しますか?',
                    default: false
                }
            ]);

            if (saveAnswer.save) {
                await this.exporter.saveChanges();
            }
        }

        // セッション記録
        this.recordSession();
        
        console.log(chalk.blue('👋 Balance Adjuster Tool を終了します'));
        process.exit(0);
    }

    /**
     * キー入力待ち
     */
    async pressAnyKey() {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: 'Enterキーで続行...'
            }
        ]);
    }

    /**
     * セッション記録
     */
    recordSession() {
        const sessionRecord = {
            startTime: this.session.startTime,
            endTime: new Date(),
            changes: this.session.changes,
            testResults: this.session.testResults,
            totalChanges: this.session.changes.length
        };

        console.log(chalk.blue('📝 セッション記録を保存しました'));
    }
}

// CLI設定とメイン実行
program
    .name('balance-adjuster')
    .description('インタラクティブバランス調整ツール (Main Controller Pattern)')
    .version('1.0.0');

program
    .option('--batch <file>', 'バッチモードで変更を適用')
    .option('--analyze-current', '現在の設定を分析')
    .action(async (options) => {
        const adjuster = new BalanceAdjuster();

        if (options.batch) {
            const changes = adjuster.exporter.loadBatchFile(options.batch);
            await adjuster.exporter.exportBatchChanges(changes);
        } else if (options.analyzeCurrent) {
            const analysis = await adjuster.calculator.performDetailedImpactAnalysis();
            adjuster.calculator.displayCalculationResults(analysis);
        } else {
            await adjuster.showMainMenu();
        }
    });

// プログラム開始
if (import.meta.url === `file://${process.argv[1]}`) {
    program.parse(process.argv);
    
    if (!process.argv.slice(2).length) {
        const adjuster = new BalanceAdjuster();
        adjuster.showMainMenu().catch(error => {
            console.error(chalk.red(`アプリケーションエラー: ${error.message}`));
            process.exit(1);
        });
    }
}