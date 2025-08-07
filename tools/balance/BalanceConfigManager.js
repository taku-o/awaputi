/**
 * Balance Config Manager
 * 
 * 設定管理UI機能を独立したクラスとして実装
 * 設定表示、比較、選択機能を提供
 * 
 * @module BalanceConfigManager
 * Created: Phase G.1 (Issue #103)
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * バランス設定管理UI
 */
export class BalanceConfigManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.dataLoader = mainController.dataLoader;
    }

    /**
     * 現在の設定を表示
     */
    async viewCurrentConfiguration() {
        console.clear();
        console.log(chalk.bold.blue('📊 現在の設定'));
        console.log('='.repeat(50));

        const categories = Object.keys(this.mainController.currentConfig);
        
        if (categories.length === 0) {
            console.log(chalk.yellow('設定が読み込まれていません'));
            await this.mainController.pressAnyKey();
            return;
        }

        // カテゴリ選択
        const categoryAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'category',
                message: '表示するカテゴリを選択してください:',
                choices: [
                    ...categories.map(cat => ({ name: `📁 ${cat}`, value: cat })),
                    { name: '🔙 戻る', value: 'back' }
                ]
            }
        ]);

        if (categoryAnswer.category === 'back') {
            return;
        }

        this.displayConfigurationCategory(categoryAnswer.category);
        await this.mainController.pressAnyKey();
    }

    /**
     * 設定カテゴリの表示
     * @param {string} category - 表示するカテゴリ
     */
    displayConfigurationCategory(category) {
        const config = this.mainController.currentConfig[category];
        if (!config) {
            console.log(chalk.yellow(`カテゴリ '${category}' が見つかりません`));
            return;
        }

        console.log(`\n${chalk.bold.cyan(`📋 ${category} 設定`)}`);
        
        const table = new Table({
            head: ['設定項目', '現在の値', '変更予定', '状態'],
            colWidths: [30, 15, 15, 10]
        });

        this.addConfigToTable(table, config, category);
        console.log('\n' + table.toString());

        const pendingInCategory = Object.keys(this.mainController.pendingChanges)
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
                const pendingChange = this.mainController.pendingChanges[fullKey];
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
     * 設定値の変更
     */
    async modifySettings() {
        console.clear();
        console.log(chalk.bold.yellow('⚙️ 設定値変更'));
        console.log('='.repeat(50));

        const key = await this.selectConfigurationKey();
        if (!key) return;

        const currentValue = this.dataLoader.getConfigValue(key, this.mainController.currentConfig);
        
        console.log(`\n現在の値: ${chalk.cyan(currentValue)}`);
        console.log(`型: ${chalk.gray(typeof currentValue)}`);

        const inputAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'newValue',
                message: '新しい値を入力してください:',
                default: String(currentValue)
            }
        ]);

        // 入力検証
        const validation = this.dataLoader.validateInput(key, inputAnswer.newValue, this.mainController.currentConfig);
        if (!validation.valid) {
            console.log(chalk.red(`❌ ${validation.error}`));
            await this.mainController.pressAnyKey();
            return;
        }

        // 影響プレビューの表示
        const impact = await this.mainController.calculator.previewBalanceImpact(key, currentValue, validation.value);
        this.displayImpactPreview(impact);

        // 確認
        const confirmAnswer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'この変更を適用しますか?',
                default: false
            }
        ]);

        if (confirmAnswer.confirm) {
            this.mainController.pendingChanges[key] = {
                oldValue: currentValue,
                newValue: validation.value,
                timestamp: new Date().toISOString()
            };

            console.log(chalk.green('✅ 変更が保留リストに追加されました'));
        } else {
            console.log(chalk.gray('変更がキャンセルされました'));
        }

        await this.mainController.pressAnyKey();
    }

    /**
     * 設定キーの選択
     * @returns {Promise<string|null>} 選択された設定キー
     */
    async selectConfigurationKey() {
        const availableKeys = this.getAllConfigurationKeys();
        
        if (availableKeys.length === 0) {
            console.log(chalk.yellow('利用可能な設定項目がありません'));
            return null;
        }

        const choices = [
            ...availableKeys.map(key => ({ 
                name: `🔧 ${key}`, 
                value: key 
            })),
            { name: '📝 カスタムキーを入力', value: 'custom' },
            { name: '🔙 戻る', value: 'back' }
        ];

        const selectionAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'setting',
                message: '変更する設定を選択してください:',
                choices: choices,
                pageSize: 15
            }
        ]);

        if (selectionAnswer.setting === 'back') {
            return null;
        }

        if (selectionAnswer.setting === 'custom') {
            const customAnswer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'customKey',
                    message: 'カスタムキーを入力してください (例: bubbles.normalBubble.hp):',
                    validate: (input) => {
                        if (!input.trim()) return '空のキーは無効です';
                        if (!this.dataLoader.configKeyExists(input, this.mainController.currentConfig)) {
                            return 'このキーは存在しません';
                        }
                        return true;
                    }
                }
            ]);
            
            return customAnswer.customKey;
        }

        return selectionAnswer.setting;
    }

    /**
     * 設定比較の実行
     */
    async compareConfigurations() {
        console.clear();
        console.log(chalk.bold.purple('📊 設定比較'));
        console.log('='.repeat(50));

        const compareOptions = [
            { name: '現在 vs 変更後', value: 'current-vs-pending' },
            { name: '外部ファイルと比較', value: 'external-file' },
            { name: '過去のバックアップと比較', value: 'backup-compare' },
            { name: '🔙 戻る', value: 'back' }
        ];

        const compareAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'option',
                message: '比較オプションを選択してください:',
                choices: compareOptions
            }
        ]);

        switch (compareAnswer.option) {
            case 'current-vs-pending':
                await this.compareCurrentVsPending();
                break;
            case 'external-file':
                await this.compareWithExternalFile();
                break;
            case 'backup-compare':
                await this.compareWithBackup();
                break;
            case 'back':
                return;
        }

        await this.mainController.pressAnyKey();
    }

    /**
     * 現在 vs 変更後の比較
     */
    async compareCurrentVsPending() {
        if (Object.keys(this.mainController.pendingChanges).length === 0) {
            console.log(chalk.yellow('比較する変更がありません'));
            return;
        }

        console.log('\n' + chalk.bold('現在の設定 vs 変更後の設定'));
        
        const comparisonTable = new Table({
            head: ['設定項目', '現在', '変更後', '差分'],
            colWidths: [30, 15, 15, 15]
        });

        for (const [key, change] of Object.entries(this.mainController.pendingChanges)) {
            const difference = this.calculateDifference(change.oldValue, change.newValue);
            comparisonTable.push([
                key,
                String(change.oldValue).substring(0, 12),
                String(change.newValue).substring(0, 12),
                this.formatDifference(difference)
            ]);
        }

        console.log(comparisonTable.toString());
    }

    /**
     * 外部ファイルとの比較
     */
    async compareWithExternalFile() {
        const fileAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'filePath',
                message: '比較するJSONファイルのパスを入力してください:',
                validate: (input) => {
                    if (!existsSync(input)) return 'ファイルが見つかりません';
                    return true;
                }
            }
        ]);

        try {
            const externalConfig = JSON.parse(readFileSync(fileAnswer.filePath, 'utf8'));
            this.performConfigComparison(this.mainController.currentConfig, externalConfig, 'current', 'external');
        } catch (error) {
            console.log(chalk.red(`ファイル読み込みエラー: ${error.message}`));
        }
    }

    /**
     * バックアップとの比較
     */
    async compareWithBackup() {
        const backupDir = join(this.mainController.projectRoot, 'backups', 'balance');
        
        if (!existsSync(backupDir)) {
            console.log(chalk.yellow('バックアップディレクトリが見つかりません'));
            return;
        }

        try {
            const backupFiles = require('fs').readdirSync(backupDir)
                .filter(file => file.endsWith('.json'))
                .sort()
                .reverse()
                .slice(0, 10);

            if (backupFiles.length === 0) {
                console.log(chalk.yellow('利用可能なバックアップがありません'));
                return;
            }

            const backupAnswer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'backup',
                    message: '比較するバックアップを選択してください:',
                    choices: backupFiles.map(file => ({ 
                        name: file, 
                        value: join(backupDir, file)
                    }))
                }
            ]);

            const backupData = JSON.parse(readFileSync(backupAnswer.backup, 'utf8'));
            const backupConfig = backupData.configuration || backupData;
            
            this.performConfigComparison(this.mainController.currentConfig, backupConfig, 'current', 'backup');
        } catch (error) {
            console.log(chalk.red(`バックアップ比較エラー: ${error.message}`));
        }
    }

    /**
     * 設定比較の実行
     * @param {Object} config1 - 比較元設定
     * @param {Object} config2 - 比較先設定
     * @param {string} label1 - 比較元ラベル
     * @param {string} label2 - 比較先ラベル
     */
    performConfigComparison(config1, config2, label1, label2) {
        console.log(`\n${chalk.bold(`${label1} vs ${label2} 比較結果`)}`);
        
        const comparisonTable = new Table({
            head: ['設定項目', label1, label2, '状態'],
            colWidths: [30, 15, 15, 10]
        });

        const allKeys = new Set([
            ...this.getAllKeysFromObject(config1),
            ...this.getAllKeysFromObject(config2)
        ]);

        for (const key of allKeys) {
            const value1 = this.dataLoader.getConfigValue(key, config1);
            const value2 = this.dataLoader.getConfigValue(key, config2);
            
            let status = '=';
            if (value1 === undefined) status = '+';
            else if (value2 === undefined) status = '-';
            else if (value1 !== value2) status = '≠';

            comparisonTable.push([
                key,
                String(value1 || 'N/A').substring(0, 12),
                String(value2 || 'N/A').substring(0, 12),
                this.getStatusIcon(status)
            ]);
        }

        console.log(comparisonTable.toString());
    }

    /**
     * 全ての設定キーを取得
     * @returns {Array<string>} 設定キーの配列
     */
    getAllConfigurationKeys() {
        return this.getAllKeysFromObject(this.mainController.currentConfig);
    }

    /**
     * オブジェクトから全キーを取得
     * @param {Object} obj - 対象オブジェクト
     * @param {string} prefix - キープレフィックス
     * @returns {Array<string>} キーの配列
     */
    getAllKeysFromObject(obj, prefix = '') {
        const keys = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                keys.push(...this.getAllKeysFromObject(value, fullKey));
            } else {
                keys.push(fullKey);
            }
        }
        
        return keys;
    }

    /**
     * 値の差分計算
     * @param {*} oldValue - 古い値
     * @param {*} newValue - 新しい値
     * @returns {Object} 差分情報
     */
    calculateDifference(oldValue, newValue) {
        if (typeof oldValue === 'number' && typeof newValue === 'number') {
            const absolute = newValue - oldValue;
            const percentage = oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
            
            return {
                type: 'numeric',
                absolute: absolute,
                percentage: Math.round(percentage * 100) / 100,
                direction: absolute > 0 ? 'increase' : absolute < 0 ? 'decrease' : 'no_change'
            };
        }
        
        return {
            type: 'non_numeric',
            changed: oldValue !== newValue,
            from: oldValue,
            to: newValue
        };
    }

    /**
     * 差分のフォーマット
     * @param {Object} difference - 差分情報
     * @returns {string} フォーマット済み差分
     */
    formatDifference(difference) {
        if (difference.type === 'numeric') {
            const sign = difference.direction === 'increase' ? '+' : difference.direction === 'decrease' ? '-' : '';
            const color = difference.direction === 'increase' ? chalk.green : 
                         difference.direction === 'decrease' ? chalk.red : chalk.gray;
            return color(`${sign}${Math.abs(difference.percentage).toFixed(1)}%`);
        }
        
        return difference.changed ? chalk.yellow('変更') : chalk.gray('同じ');
    }

    /**
     * ステータスアイコンの取得
     * @param {string} status - ステータス
     * @returns {string} アイコン
     */
    getStatusIcon(status) {
        switch (status) {
            case '=': return chalk.gray('=');
            case '+': return chalk.green('+');
            case '-': return chalk.red('-');
            case '≠': return chalk.yellow('≠');
            default: return status;
        }
    }

    /**
     * 影響プレビューの表示
     * @param {Object} impact - 影響オブジェクト
     */
    displayImpactPreview(impact) {
        console.log('\n' + chalk.bold('🔍 影響プレビュー'));
        console.log(`リスク: ${this.getRiskColor(impact.risk)(impact.risk)}`);
        console.log(`影響: ${impact.description}`);
        
        if (impact.recommendation) {
            console.log(`推奨: ${chalk.blue(impact.recommendation)}`);
        }
    }

    /**
     * リスクレベルの色付け
     * @param {string} risk - リスクレベル
     * @returns {Function} 色付け関数
     */
    getRiskColor(risk) {
        switch (risk) {
            case 'HIGH': return chalk.red;
            case 'MEDIUM': return chalk.yellow;
            case 'LOW': return chalk.green;
            default: return chalk.gray;
        }
    }
}