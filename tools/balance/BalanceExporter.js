/**
 * Balance Exporter Component
 * 
 * バランス設定のエクスポート・保存・適用を担当
 * Main Controller Patternの一部として設計
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

export class BalanceExporter {
    constructor(mainController) {
        this.mainController = mainController;
        this.projectRoot = mainController.projectRoot || join(process.cwd());
        this.backupDirectory = join(this.projectRoot, 'backups', 'balance');
    }

    /**
     * 変更の保存
     * @param {Object} changes - 保存する変更内容
     * @param {Object} options - 保存オプション
     * @returns {Object} 保存結果
     */
    async saveChanges(changes = null, options = {}) {
        const spinner = ora('変更を保存中...').start();
        
        try {
            const changesToSave = changes || this.mainController.pendingChanges;
            
            if (Object.keys(changesToSave).length === 0) {
                spinner.warn('保存する変更がありません');
                return { success: false, message: '変更がありません' };
            }

            const saveResult = {
                success: true,
                savedFiles: [],
                backupPath: null,
                appliedChanges: [],
                errors: [],
                timestamp: new Date()
            };

            // バックアップの作成
            if (options.createBackup !== false) {
                saveResult.backupPath = await this.createPreSaveBackup();
            }

            // 設定ファイルへの変更適用
            await this.applyChangesToConfigurationFiles(changesToSave, saveResult);

            // 変更ログの保存
            if (options.saveLog !== false) {
                await this.saveChangeLog(changesToSave, saveResult);
            }

            // 保留中の変更をクリア
            this.mainController.pendingChanges = {};

            spinner.succeed(`変更を保存しました (${saveResult.savedFiles.length}ファイル)`);
            this.displaySaveResults(saveResult);
            
            return saveResult;

        } catch (error) {
            spinner.fail(`保存エラー: ${error.message}`);
            throw error;
        }
    }

    /**
     * 設定ファイルに変更を適用
     * @param {Object} changes - 変更内容
     * @param {Object} saveResult - 保存結果オブジェクト
     */
    async applyChangesToConfigurationFiles(changes, saveResult) {
        const fileChanges = this.groupChangesByFile(changes);

        for (const [filePath, fileSpecificChanges] of Object.entries(fileChanges)) {
            try {
                await this.applyChangesToSingleFile(filePath, fileSpecificChanges, saveResult);
                saveResult.savedFiles.push(filePath);
                saveResult.appliedChanges.push(...Object.keys(fileSpecificChanges));
                
            } catch (error) {
                saveResult.errors.push({
                    file: filePath,
                    error: error.message,
                    changes: Object.keys(fileSpecificChanges)
                });
            }
        }
    }

    /**
     * 単一ファイルに変更を適用
     * @param {string} filePath - ファイルパス
     * @param {Object} changes - ファイル固有の変更
     * @param {Object} saveResult - 保存結果
     */
    async applyChangesToSingleFile(filePath, changes, saveResult) {
        const fullPath = join(this.projectRoot, filePath);
        
        if (!existsSync(fullPath)) {
            throw new Error(`設定ファイルが見つかりません: ${filePath}`);
        }

        const originalContent = readFileSync(fullPath, 'utf8');
        let modifiedContent = originalContent;

        // 各変更を適用
        for (const [key, change] of Object.entries(changes)) {
            modifiedContent = this.applyChangeToContent(modifiedContent, key, change);
        }

        // ファイルの検証
        this.validateModifiedContent(modifiedContent, filePath);

        // ファイルに書き込み
        writeFileSync(fullPath, modifiedContent, 'utf8');
        
        console.log(chalk.green(`✅ ${filePath} を更新しました`));
    }

    /**
     * コンテンツに変更を適用
     * @param {string} content - 元のコンテンツ
     * @param {string} key - 変更するキー
     * @param {Object} change - 変更内容
     * @returns {string} 変更後のコンテンツ
     */
    applyChangeToContent(content, key, change) {
        const keyParts = key.split('.');
        const propertyName = keyParts[keyParts.length - 1];

        // プロパティの正規表現パターン
        const patterns = [
            new RegExp(`(${propertyName}\\s*:\\s*)([^,\\}\\n]+)`, 'g'),
            new RegExp(`(${propertyName}\\s*=\\s*)([^,\\;\\n]+)`, 'g'),
            new RegExp(`(['"]${propertyName}['"]\\s*:\\s*)([^,\\}\\n]+)`, 'g')
        ];

        let modifiedContent = content;
        let replaced = false;

        for (const pattern of patterns) {
            const newContent = modifiedContent.replace(pattern, (match, prefix, oldValue) => {
                replaced = true;
                const newValue = this.formatValueForJS(change.newValue);
                return prefix + newValue;
            });

            if (replaced) {
                modifiedContent = newContent;
                break;
            }
        }

        if (!replaced) {
            console.warn(chalk.yellow(`警告: ${key} の自動更新ができませんでした`));
        }

        return modifiedContent;
    }

    /**
     * 値をJavaScript形式にフォーマット
     * @param {*} value - フォーマットする値
     * @returns {string} フォーマット済み値
     */
    formatValueForJS(value) {
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "\\'")}'`;
        } else if (typeof value === 'number') {
            return value.toString();
        } else if (typeof value === 'boolean') {
            return value.toString();
        } else if (Array.isArray(value)) {
            return JSON.stringify(value);
        } else if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    }

    /**
     * 変更をファイル別にグループ化
     * @param {Object} changes - 変更内容
     * @returns {Object} ファイル別変更
     */
    groupChangesByFile(changes) {
        const fileChanges = {};

        for (const [key, change] of Object.entries(changes)) {
            const filePath = this.determineFilePathForKey(key);
            
            if (!fileChanges[filePath]) {
                fileChanges[filePath] = {};
            }
            
            fileChanges[filePath][key] = change;
        }

        return fileChanges;
    }

    /**
     * キーに対応するファイルパスを決定
     * @param {string} key - 設定キー
     * @returns {string} ファイルパス
     */
    determineFilePathForKey(key) {
        const keyParts = key.split('.');
        const category = keyParts[0];

        switch (category) {
            case 'scoring':
                return 'src/config/GameBalance.js';
            case 'bubbles':
                return 'src/config/GameConfig.js';
            case 'performance':
                return 'src/config/PerformanceConfig.js';
            case 'audio':
                return 'src/config/AudioConfig.js';
            case 'effects':
                return 'src/config/EffectsConfig.js';
            default:
                return 'src/config/GameConfig.js';
        }
    }

    /**
     * 保存前バックアップの作成
     * @returns {string} バックアップファイルパス
     */
    async createPreSaveBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = join(this.backupDirectory, `pre-save-${timestamp}.json`);

        const backupData = {
            timestamp: timestamp,
            type: 'pre-save-backup',
            configuration: this.mainController.currentConfig,
            pendingChanges: this.mainController.pendingChanges,
            metadata: {
                tool: 'balance-adjuster',
                version: '1.0.0'
            }
        };

        this.ensureDirectoryExists(this.backupDirectory);
        writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        
        console.log(chalk.blue(`📦 バックアップ作成: ${backupPath}`));
        return backupPath;
    }

    /**
     * 変更ログの保存
     * @param {Object} changes - 変更内容
     * @param {Object} saveResult - 保存結果
     */
    async saveChangeLog(changes, saveResult) {
        const logPath = join(this.backupDirectory, 'change-log.json');
        let existingLog = [];

        if (existsSync(logPath)) {
            try {
                existingLog = JSON.parse(readFileSync(logPath, 'utf8'));
            } catch (error) {
                console.warn(chalk.yellow('既存ログの読み込みに失敗しました'));
            }
        }

        const logEntry = {
            timestamp: saveResult.timestamp,
            changes: Object.keys(changes),
            filesModified: saveResult.savedFiles,
            backupPath: saveResult.backupPath,
            session: {
                startTime: this.mainController.session.startTime,
                changeCount: Object.keys(changes).length
            }
        };

        existingLog.push(logEntry);

        // 最新100件のみ保持
        if (existingLog.length > 100) {
            existingLog = existingLog.slice(-100);
        }

        this.ensureDirectoryExists(this.backupDirectory);
        writeFileSync(logPath, JSON.stringify(existingLog, null, 2));
    }

    /**
     * バッチ処理によるエクスポート
     * @param {Array} batchChanges - バッチ変更リスト
     * @param {Object} options - エクスポートオプション
     * @returns {Object} エクスポート結果
     */
    async exportBatchChanges(batchChanges, options = {}) {
        const spinner = ora('バッチエクスポートを実行中...').start();
        
        try {
            const exportResult = {
                success: true,
                processedBatches: 0,
                totalChanges: 0,
                errors: [],
                exportPath: null,
                timestamp: new Date()
            };

            // エクスポートファイルの準備
            if (options.exportToFile) {
                exportResult.exportPath = this.prepareExportFile(options.exportPath);
            }

            // バッチ処理の実行
            for (const [index, batch] of batchChanges.entries()) {
                try {
                    await this.processSingleBatch(batch, index, exportResult);
                    exportResult.processedBatches++;
                    exportResult.totalChanges += Object.keys(batch).length;
                    
                } catch (error) {
                    exportResult.errors.push({
                        batch: index,
                        error: error.message,
                        changes: Object.keys(batch)
                    });
                }
            }

            // エクスポート結果の保存
            if (exportResult.exportPath) {
                await this.saveExportResults(exportResult);
            }

            spinner.succeed(`バッチエクスポート完了 (${exportResult.processedBatches}/${batchChanges.length})`);
            return exportResult;

        } catch (error) {
            spinner.fail(`バッチエクスポートエラー: ${error.message}`);
            throw error;
        }
    }

    /**
     * 変更内容の検証
     * @param {string} content - 変更後のコンテンツ
     * @param {string} filePath - ファイルパス
     */
    validateModifiedContent(content, filePath) {
        try {
            // 基本的な構文チェック
            if (content.includes('export default')) {
                // ES6 モジュールの基本的な検証
                const braceCount = (content.match(/{/g) || []).length - (content.match(/}/g) || []).length;
                if (braceCount !== 0) {
                    throw new Error('括弧の対応が正しくありません');
                }
            }
        } catch (error) {
            throw new Error(`ファイル検証エラー (${filePath}): ${error.message}`);
        }
    }

    /**
     * 保存結果の表示
     * @param {Object} saveResult - 保存結果
     */
    displaySaveResults(saveResult) {
        console.log('\n' + chalk.bold.green('💾 保存結果'));
        console.log('='.repeat(40));
        
        console.log(`${chalk.green('✅ 保存ファイル:')} ${saveResult.savedFiles.length}`);
        console.log(`${chalk.blue('📝 適用変更:')} ${saveResult.appliedChanges.length}`);
        
        if (saveResult.errors.length > 0) {
            console.log(`${chalk.red('❌ エラー:')} ${saveResult.errors.length}`);
        }
        
        if (saveResult.backupPath) {
            console.log(`${chalk.blue('📦 バックアップ:')} ${saveResult.backupPath}`);
        }

        console.log(`⏱️  保存時刻: ${saveResult.timestamp.toLocaleString()}\n`);
    }

    /**
     * ディレクトリ存在確認・作成
     * @param {string} dirPath - ディレクトリパス
     */
    ensureDirectoryExists(dirPath) {
        const { mkdirSync } = require('fs');
        try {
            mkdirSync(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    // 簡略化されたヘルパーメソッド群
    async processSingleBatch(batch, index, exportResult) {
        // バッチ処理の実装（簡略化）
        console.log(`Processing batch ${index + 1}`);
    }

    prepareExportFile(exportPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return exportPath || join(this.backupDirectory, `export-${timestamp}.json`);
    }

    async saveExportResults(exportResult) {
        writeFileSync(exportResult.exportPath, JSON.stringify(exportResult, null, 2));
    }
}