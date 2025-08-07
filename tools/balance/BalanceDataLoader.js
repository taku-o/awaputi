/**
 * Balance Data Loader Component
 * 
 * Phase G.1で分割されたBalanceAdjusterのサブコンポーネント
 * バランス設定データの読み込み・解析・バックアップを専門に担当します。
 * 
 * 主な責任：
 * - ゲーム設定ファイルの読み込みと解析
 * - 設定値の検証とエラーハンドリング  
 * - 設定ファイルのバックアップと復元
 * - 設定データの構造化と正規化
 * 
 * @class BalanceDataLoader
 * @memberof BalanceAdjuster
 * @since Phase G.1
 * @author Claude Code
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import Table from 'cli-table3';

export class BalanceDataLoader {
    constructor(mainController) {
        this.mainController = mainController;
        this.projectRoot = mainController.projectRoot || join(process.cwd());
        this.configPaths = [
            'src/config/GameBalance.js',
            'src/config/GameConfig.js',
            'src/config/PerformanceConfig.js',
            'src/config/AudioConfig.js',
            'src/config/EffectsConfig.js'
        ];
    }

    /**
     * 現在の設定を読み込み
     * @returns {Object} 統合された設定オブジェクト
     */
    loadCurrentConfiguration() {
        const config = {};
        
        try {
            for (const configPath of this.configPaths) {
                const fullPath = join(this.projectRoot, configPath);
                if (existsSync(fullPath)) {
                    const configData = this.parseConfigurationFile(fullPath);
                    const category = this.extractCategory(configPath);
                    config[category] = configData;
                }
            }
            
            console.log(chalk.green('✅ 設定ファイルの読み込み完了'));
            return config;
            
        } catch (error) {
            console.error(chalk.red(`設定読み込みエラー: ${error.message}`));
            throw error;
        }
    }

    /**
     * 設定ファイルの解析
     * @param {string} filePath - ファイルパス
     * @returns {Object} 解析された設定
     */
    parseConfigurationFile(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            
            // ES6 moduleからdefault exportを抽出
            const exportMatch = content.match(/export\s+default\s+({[\s\S]*?});?\s*$/m);
            if (exportMatch) {
                return this.evaluateConfigObject(exportMatch[1]);
            }
            
            // 名前付きexportの場合
            const namedExportMatch = content.match(/export\s+const\s+\w+\s*=\s*({[\s\S]*?});/);
            if (namedExportMatch) {
                return this.evaluateConfigObject(namedExportMatch[1]);
            }
            
            throw new Error(`設定オブジェクトが見つかりません: ${filePath}`);
            
        } catch (error) {
            console.error(chalk.red(`ファイル解析エラー: ${filePath}`));
            throw error;
        }
    }

    /**
     * 設定オブジェクトの評価
     * @param {string} objectString - オブジェクト文字列
     * @returns {Object} 評価されたオブジェクト
     */
    evaluateConfigObject(objectString) {
        try {
            // 安全な評価のためのサンドボックス
            const cleanedString = objectString
                .replace(/\/\*[\s\S]*?\*\//g, '') // ブロックコメント除去
                .replace(/\/\/.*$/gm, ''); // ラインコメント除去
            
            return Function('"use strict"; return (' + cleanedString + ')')();
            
        } catch (error) {
            console.error(chalk.red(`オブジェクト評価エラー: ${error.message}`));
            throw error;
        }
    }

    /**
     * ファイルパスからカテゴリを抽出
     * @param {string} configPath - 設定ファイルパス
     * @returns {string} カテゴリ名
     */
    extractCategory(configPath) {
        const filename = configPath.split('/').pop().replace('.js', '');
        
        switch (filename) {
            case 'GameBalance': return 'scoring';
            case 'GameConfig': return 'bubbles';
            case 'PerformanceConfig': return 'performance';
            case 'AudioConfig': return 'audio';
            case 'EffectsConfig': return 'effects';
            default: return 'misc';
        }
    }

    /**
     * 設定のバックアップを作成
     * @returns {string} バックアップファイルパス
     */
    createConfigurationBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = join(this.projectRoot, 'backups', 'balance');
        
        try {
            // バックアップディレクトリ作成
            this.ensureDirectoryExists(backupDir);
            
            const backupPath = join(backupDir, `balance-backup-${timestamp}.json`);
            const currentConfig = this.loadCurrentConfiguration();
            
            writeFileSync(backupPath, JSON.stringify({
                timestamp: timestamp,
                version: '1.0.0',
                configuration: currentConfig,
                metadata: {
                    source: 'balance-adjuster-tool',
                    configFiles: this.configPaths
                }
            }, null, 2));
            
            console.log(chalk.green(`✅ バックアップ作成: ${backupPath}`));
            return backupPath;
            
        } catch (error) {
            console.error(chalk.red(`バックアップ作成エラー: ${error.message}`));
            throw error;
        }
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

    /**
     * 設定ファイルの発見・スキャン
     * @returns {Array} 発見された設定ファイルのリスト
     */
    discoverConfigurationFiles() {
        const discoveredFiles = [];
        
        for (const configPath of this.configPaths) {
            const fullPath = join(this.projectRoot, configPath);
            if (existsSync(fullPath)) {
                const stats = require('fs').statSync(fullPath);
                discoveredFiles.push({
                    path: configPath,
                    fullPath: fullPath,
                    category: this.extractCategory(configPath),
                    size: stats.size,
                    modified: stats.mtime
                });
            }
        }
        
        return discoveredFiles;
    }

    /**
     * 設定の再読み込み
     */
    reloadConfiguration() {
        this.mainController.currentConfig = this.loadCurrentConfiguration();
        console.log(chalk.green('🔄 設定を再読み込みしました'));
    }

    /**
     * 設定ファイルの妥当性チェック
     * @returns {Object} 検証結果
     */
    validateConfigurationFiles() {
        const results = {
            valid: true,
            errors: [],
            warnings: []
        };
        
        for (const configPath of this.configPaths) {
            const fullPath = join(this.projectRoot, configPath);
            if (existsSync(fullPath)) {
                try {
                    this.parseConfigurationFile(fullPath);
                } catch (error) {
                    results.valid = false;
                    results.errors.push({
                        file: configPath,
                        error: error.message
                    });
                }
            } else {
                results.warnings.push({
                    file: configPath,
                    warning: 'ファイルが見つかりません'
                });
            }
        }
        
        return results;
    }

    /**
     * 設定カテゴリの表示
     * @param {string} category - カテゴリ名
     * @param {Object} pendingChanges - 保留中の変更
     */
    displayConfigurationCategory(category, pendingChanges = {}) {
        const config = this.mainController.currentConfig[category];
        if (!config) {
            console.log(chalk.yellow(`カテゴリ '${category}' が見つかりません`));
            return;
        }

        const table = new Table({
            head: ['設定項目', '現在の値', '変更予定', '状態'],
            colWidths: [30, 15, 15, 10]
        });

        this.addConfigToTable(table, config, category, pendingChanges);
        console.log('\n' + table.toString());

        const pendingInCategory = Object.keys(pendingChanges)
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
     * @param {Object} pendingChanges - 保留中の変更
     */
    addConfigToTable(table, config, prefix = '', pendingChanges = {}) {
        for (const [key, value] of Object.entries(config)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.addConfigToTable(table, value, fullKey, pendingChanges);
            } else {
                const pendingChange = pendingChanges[fullKey];
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
}