/**
 * UserDataExporter.js
 * ユーザーデータエクスポート/インポートコンポーネント
 * UserInfoSceneから分離されたデータ管理機能を提供
 */

import { StatisticsExporter } from '../../../core/StatisticsExporter.js';

export class UserDataExporter {
    constructor(gameEngine, eventBus, sceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // データエクスポート/インポート状態
        this.isExporting = false;
        this.isImporting = false;
        this.lastExportData = null;
        this.lastImportData = null;
        
        // エクスポート/インポート設定
        this.exportSettings = {
            format: 'json',
            includeStatistics: true,
            includeAchievements: true,
            includeSettings: true,
            anonymize: false,
            compress: false
        };
        
        this.importSettings = {
            mergeStrategy: 'replace', // 'replace', 'merge', 'append'
            backupBeforeImport: true,
            validateData: true,
            preserveUserSettings: false
        };
        
        // 統計エクスポーター
        this.statisticsExporter = null;
        
        // レイアウト設定
        this.contentPadding = 20;
        
        this.initialize();
        this.setupEventListeners();
    }
    
    /**
     * コンポーネントの初期化
     */
    initialize() {
        this.initializeStatisticsExporter();
    }
    
    /**
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        if (this.eventBus) {
            this.eventBus.on('exportDataRequested', (options) => {
                this.exportData(options);
            });
            
            this.eventBus.on('importDataRequested', (data, options) => {
                this.importData(data, options);
            });
            
            this.eventBus.on('exportSettingsChanged', (settings) => {
                this.updateExportSettings(settings);
            });
            
            this.eventBus.on('importSettingsChanged', (settings) => {
                this.updateImportSettings(settings);
            });
        }
    }
    
    /**
     * 統計エクスポーターの初期化
     */
    initializeStatisticsExporter() {
        try {
            if (this.gameEngine.statisticsManager) {
                this.statisticsExporter = new StatisticsExporter(this.gameEngine.statisticsManager);
            }
        } catch (error) {
            console.error('Failed to initialize statistics exporter:', error);
        }
    }
    
    /**
     * データ管理セクションの描画
     */
    renderDataManagementSection(context, x, y, width) {
        // セクション背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(x, y, width, 160);
        
        // セクション枠線
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 160);
        
        // セクションタイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('データ管理', x + 15, y + 25);
        
        // プレイヤーデータエクスポートボタン
        const exportButtonWidth = 150;
        const exportButtonHeight = 35;
        const exportButtonX = x + 15;
        const exportButtonY = y + 50;
        
        const isExportFocused = this.sceneState.get('focusedElement') === this.getTotalTabCount() + 2;
        
        context.fillStyle = isExportFocused ? '#6bb0ff' : '#4a90e2';
        context.fillRect(exportButtonX, exportButtonY, exportButtonWidth, exportButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(exportButtonX, exportButtonY, exportButtonWidth, exportButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('プレイヤーデータ', exportButtonX + exportButtonWidth / 2, exportButtonY + 12);
        context.fillText('エクスポート', exportButtonX + exportButtonWidth / 2, exportButtonY + 26);
        
        // プレイヤーデータインポートボタン
        const importButtonWidth = 150;
        const importButtonHeight = 35;
        const importButtonX = x + 15 + exportButtonWidth + 20;
        const importButtonY = y + 50;
        
        const isImportFocused = this.sceneState.get('focusedElement') === this.getTotalTabCount() + 3;
        
        context.fillStyle = isImportFocused ? '#6bb0ff' : '#4a90e2';
        context.fillRect(importButtonX, importButtonY, importButtonWidth, importButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(importButtonX, importButtonY, importButtonWidth, importButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('プレイヤーデータ', importButtonX + importButtonWidth / 2, importButtonY + 12);
        context.fillText('インポート', importButtonX + importButtonWidth / 2, importButtonY + 26);
        
        // 統計データエクスポートボタン
        const statsExportButtonX = x + 15;
        const statsExportButtonY = y + 85;
        const isStatsExportFocused = this.sceneState.get('focusedElement') === this.getTotalTabCount() + 4;
        
        context.fillStyle = isStatsExportFocused ? '#10B981' : '#059669';
        context.fillRect(statsExportButtonX, statsExportButtonY, exportButtonWidth, exportButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(statsExportButtonX, statsExportButtonY, exportButtonWidth, exportButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('統計データ', statsExportButtonX + exportButtonWidth / 2, statsExportButtonY + 12);
        context.fillText('エクスポート', statsExportButtonX + exportButtonWidth / 2, statsExportButtonY + 26);
        
        // 統計データインポートボタン
        const statsImportButtonX = x + 15 + exportButtonWidth + 20;
        const statsImportButtonY = y + 85;
        const isStatsImportFocused = this.sceneState.get('focusedElement') === this.getTotalTabCount() + 5;
        
        context.fillStyle = isStatsImportFocused ? '#10B981' : '#059669';
        context.fillRect(statsImportButtonX, statsImportButtonY, importButtonWidth, importButtonHeight);
        
        context.strokeStyle = '#333';
        context.lineWidth = 1;
        context.strokeRect(statsImportButtonX, statsImportButtonY, importButtonWidth, importButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('統計データ', statsImportButtonX + importButtonWidth / 2, statsImportButtonY + 12);
        context.fillText('インポート', statsImportButtonX + importButtonWidth / 2, statsImportButtonY + 26);
        
        // エクスポート形式選択（統計データ用）
        context.fillStyle = '#cccccc';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillText('形式: JSON, CSV, TXT', x + 15, y + 135);
        
        // 統計エクスポート状態表示
        if (this.isExporting) {
            context.fillStyle = '#F59E0B';
            context.fillText('エクスポート中...', x + 15, y + 150);
        } else if (this.isImporting) {
            context.fillStyle = '#3B82F6';
            context.fillText('インポート中...', x + 15, y + 150);
        }
    }
    
    /**
     * データエクスポートボタンのクリック処理
     */
    handleDataManagementClick(x, y) {
        const dataManagementY = 200; // 概算のY位置
        const exportButtonY = dataManagementY + 50;
        
        // プレイヤーデータエクスポートボタン
        if (x >= this.contentPadding + 15 && x <= this.contentPadding + 15 + 150 && 
            y >= exportButtonY && y <= exportButtonY + 35) {
            this.showPlayerDataExportDialog();
            return true;
        }
        
        // プレイヤーデータインポートボタン
        const importButtonX = this.contentPadding + 15 + 150 + 20;
        if (x >= importButtonX && x <= importButtonX + 150 && 
            y >= exportButtonY && y <= exportButtonY + 35) {
            this.showPlayerDataImportDialog();
            return true;
        }
        
        // 統計データエクスポートボタン
        const statsExportButtonY = dataManagementY + 85;
        if (x >= this.contentPadding + 15 && x <= this.contentPadding + 15 + 150 && 
            y >= statsExportButtonY && y <= statsExportButtonY + 35) {
            this.showStatisticsExportDialog();
            return true;
        }
        
        // 統計データインポートボタン
        if (x >= importButtonX && x <= importButtonX + 150 && 
            y >= statsExportButtonY && y <= statsExportButtonY + 35) {
            this.showStatisticsImportDialog();
            return true;
        }
        
        return false;
    }
    
    /**
     * プレイヤーデータエクスポートダイアログを表示
     */
    async showPlayerDataExportDialog() {
        try {
            if (this.eventBus) {
                this.eventBus.emit('openDialog', 'export', {
                    exportType: 'playerData',
                    format: this.exportSettings.format
                });
            }
        } catch (error) {
            console.error('Player data export dialog error:', error);
            this.showError('エクスポートダイアログでエラーが発生しました');
        }
    }
    
    /**
     * プレイヤーデータインポートダイアログを表示
     */
    async showPlayerDataImportDialog() {
        try {
            if (this.eventBus) {
                this.eventBus.emit('openDialog', 'import', {
                    importType: 'playerData'
                });
            }
        } catch (error) {
            console.error('Player data import dialog error:', error);
            this.showError('インポートダイアログでエラーが発生しました');
        }
    }
    
    /**
     * 統計データエクスポートダイアログを表示
     */
    showStatisticsExportDialog() {
        if (this.eventBus) {
            this.eventBus.emit('showStatisticsExportDialog', {
                selectedFormat: 'json',
                includeMetadata: true,
                includeTimeSeriesData: true,
                anonymizeData: false
            });
        }
    }
    
    /**
     * 統計データインポートダイアログを表示
     */
    showStatisticsImportDialog() {
        if (this.eventBus) {
            this.eventBus.emit('showStatisticsImportDialog', {
                selectedFile: null,
                mergeStrategy: 'append',
                backupBeforeImport: true,
                validateData: true
            });
        }
    }
    
    /**
     * データのエクスポート
     */
    async exportData(options = {}) {
        if (this.isExporting) {
            console.warn('Export already in progress');
            return null;
        }
        
        this.isExporting = true;
        
        try {
            const mergedOptions = { ...this.exportSettings, ...options };
            
            // エクスポートデータを準備
            const exportData = await this.prepareExportData(mergedOptions);
            
            // フォーマットに応じて処理
            let processedData;
            switch (mergedOptions.format) {
                case 'json':
                    processedData = this.exportToJSON(exportData, mergedOptions);
                    break;
                case 'csv':
                    processedData = this.exportToCSV(exportData, mergedOptions);
                    break;
                case 'txt':
                    processedData = this.exportToText(exportData, mergedOptions);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${mergedOptions.format}`);
            }
            
            this.lastExportData = processedData;
            
            // イベントバスに通知
            if (this.eventBus) {
                this.eventBus.emit('dataExported', {
                    data: processedData,
                    format: mergedOptions.format,
                    options: mergedOptions
                });
            }
            
            return processedData;
            
        } catch (error) {
            console.error('Export error:', error);
            
            if (this.eventBus) {
                this.eventBus.emit('exportError', error.message);
            }
            
            throw error;
        } finally {
            this.isExporting = false;
        }
    }
    
    /**
     * データのインポート
     */
    async importData(data, options = {}) {
        if (this.isImporting) {
            console.warn('Import already in progress');
            return false;
        }
        
        this.isImporting = true;
        
        try {
            const mergedOptions = { ...this.importSettings, ...options };
            
            // データを検証
            const validationResult = await this.validateImportData(data, mergedOptions);
            if (!validationResult.isValid) {
                throw new Error(`Invalid import data: ${validationResult.error}`);
            }
            
            // バックアップを作成（必要な場合）
            if (mergedOptions.backupBeforeImport) {
                await this.createBackup();
            }
            
            // データをインポート
            const importResult = await this.processImportData(validationResult.data, mergedOptions);
            
            this.lastImportData = {
                originalData: data,
                processedData: validationResult.data,
                result: importResult,
                options: mergedOptions,
                timestamp: Date.now()
            };
            
            // イベントバスに通知
            if (this.eventBus) {
                this.eventBus.emit('dataImported', {
                    result: importResult,
                    options: mergedOptions
                });
            }
            
            return importResult;
            
        } catch (error) {
            console.error('Import error:', error);
            
            if (this.eventBus) {
                this.eventBus.emit('importError', error.message);
            }
            
            throw error;
        } finally {
            this.isImporting = false;
        }
    }
    
    /**
     * エクスポートデータの準備
     */
    async prepareExportData(options) {
        const exportData = {
            metadata: {
                exportVersion: '1.0',
                timestamp: new Date().toISOString(),
                gameVersion: this.gameEngine.version || '1.0.0',
                format: options.format
            }
        };
        
        // プレイヤーデータ
        if (this.gameEngine.playerData) {
            exportData.playerData = {
                username: this.gameEngine.playerData.username || '',
                ap: this.gameEngine.playerData.ap || 0,
                tap: this.gameEngine.playerData.tap || 0,
                level: this.gameEngine.playerData.level || 1,
                experience: this.gameEngine.playerData.experience || 0,
                highScores: this.gameEngine.playerData.highScores || {},
                unlockedStages: this.gameEngine.playerData.unlockedStages || [],
                ownedItems: this.gameEngine.playerData.ownedItems || [],
                settings: this.gameEngine.playerData.settings || {}
            };
        }
        
        // 統計データ（オプション）
        if (options.includeStatistics && this.gameEngine.statisticsManager) {
            exportData.statistics = this.gameEngine.statisticsManager.getDetailedStatistics();
        }
        
        // 実績データ（オプション）
        if (options.includeAchievements && this.gameEngine.achievementManager) {
            exportData.achievements = this.gameEngine.achievementManager.getAchievements();
        }
        
        // 設定データ（オプション）
        if (options.includeSettings && this.gameEngine.settingsManager) {
            exportData.settings = this.gameEngine.settingsManager.getAllSettings();
        }
        
        // データの匿名化（オプション）
        if (options.anonymize) {
            this.anonymizeData(exportData);
        }
        
        return exportData;
    }
    
    /**
     * JSON形式でのエクスポート
     */
    exportToJSON(data, options) {
        const jsonData = JSON.stringify(data, null, options.compress ? 0 : 2);
        
        return {
            data: jsonData,
            filename: `player_data_${this.getTimestamp()}.json`,
            mimeType: 'application/json'
        };
    }
    
    /**
     * CSV形式でのエクスポート
     */
    exportToCSV(data, options) {
        // プレイヤーデータをCSV形式に変換
        const csvLines = [];
        
        // ヘッダー
        csvLines.push('Category,Key,Value');
        
        // プレイヤーデータ
        if (data.playerData) {
            for (const [key, value] of Object.entries(data.playerData)) {
                if (typeof value === 'object') {
                    csvLines.push(`PlayerData,${key},"${JSON.stringify(value)}"`);
                } else {
                    csvLines.push(`PlayerData,${key},${value}`);
                }
            }
        }
        
        // 統計データ（簡略化）
        if (data.statistics) {
            for (const [key, value] of Object.entries(data.statistics)) {
                if (typeof value === 'number') {
                    csvLines.push(`Statistics,${key},${value}`);
                }
            }
        }
        
        const csvData = csvLines.join('\n');
        
        return {
            data: csvData,
            filename: `player_data_${this.getTimestamp()}.csv`,
            mimeType: 'text/csv'
        };
    }
    
    /**
     * テキスト形式でのエクスポート
     */
    exportToText(data, options) {
        const textLines = [];
        
        textLines.push('=== プレイヤーデータエクスポート ===');
        textLines.push(`エクスポート日時: ${new Date().toLocaleString('ja-JP')}`);
        textLines.push('');
        
        // プレイヤーデータ
        if (data.playerData) {
            textLines.push('--- プレイヤー情報 ---');
            textLines.push(`ユーザー名: ${data.playerData.username || '未設定'}`);
            textLines.push(`レベル: ${data.playerData.level || 1}`);
            textLines.push(`AP: ${data.playerData.ap || 0}`);
            textLines.push(`総AP: ${data.playerData.tap || 0}`);
            textLines.push('');
        }
        
        // 統計データ（概要）
        if (data.statistics) {
            textLines.push('--- 統計情報 ---');
            textLines.push(`総プレイ時間: ${this.formatPlayTime(data.statistics.totalPlayTime || 0)}`);
            textLines.push(`ゲーム回数: ${data.statistics.gamesPlayed || 0}`);
            textLines.push(`最高スコア: ${data.statistics.highestScore || 0}`);
            textLines.push('');
        }
        
        // 実績データ（概要）
        if (data.achievements) {
            const unlockedCount = data.achievements.filter(a => a.unlocked).length;
            textLines.push('--- 実績情報 ---');
            textLines.push(`解除済み実績: ${unlockedCount} / ${data.achievements.length}`);
            textLines.push('');
        }
        
        const textData = textLines.join('\n');
        
        return {
            data: textData,
            filename: `player_data_${this.getTimestamp()}.txt`,
            mimeType: 'text/plain'
        };
    }
    
    /**
     * インポートデータの検証
     */
    async validateImportData(data, options) {
        try {
            let parsedData;
            
            // データの形式を判定してパース
            if (typeof data === 'string') {
                try {
                    parsedData = JSON.parse(data.trim());
                } catch (parseError) {
                    return { 
                        isValid: false, 
                        error: 'JSONデータの形式が正しくありません' 
                    };
                }
            } else if (typeof data === 'object') {
                parsedData = data;
            } else {
                return { 
                    isValid: false, 
                    error: 'サポートされていないデータ形式です' 
                };
            }
            
            // 基本構造の検証
            if (!parsedData || typeof parsedData !== 'object') {
                return { 
                    isValid: false, 
                    error: 'データの基本構造が不正です' 
                };
            }
            
            // メタデータの検証
            if (parsedData.metadata) {
                if (!parsedData.metadata.exportVersion) {
                    console.warn('Export version not found in metadata');
                }
                
                if (!parsedData.metadata.timestamp) {
                    console.warn('Timestamp not found in metadata');
                }
            }
            
            // プレイヤーデータの検証
            if (parsedData.playerData) {
                const playerData = parsedData.playerData;
                
                // 必須フィールドの確認
                if (typeof playerData.username !== 'string' && playerData.username !== undefined) {
                    return { 
                        isValid: false, 
                        error: 'ユーザー名のデータ形式が不正です' 
                    };
                }
                
                if (typeof playerData.ap !== 'number' && playerData.ap !== undefined) {
                    return { 
                        isValid: false, 
                        error: 'APのデータ形式が不正です' 
                    };
                }
            }
            
            return {
                isValid: true,
                data: parsedData
            };
            
        } catch (error) {
            return {
                isValid: false,
                error: `データ検証エラー: ${error.message}`
            };
        }
    }
    
    /**
     * インポートデータの処理
     */
    async processImportData(data, options) {
        const result = {
            success: false,
            restored: {
                playerData: false,
                statistics: false,
                achievements: false,
                settings: false
            },
            errors: []
        };
        
        try {
            // プレイヤーデータの復元
            if (data.playerData) {
                try {
                    await this.restorePlayerData(data.playerData, options);
                    result.restored.playerData = true;
                } catch (error) {
                    result.errors.push(`プレイヤーデータ復元エラー: ${error.message}`);
                }
            }
            
            // 統計データの復元
            if (data.statistics && options.includeStatistics !== false) {
                try {
                    await this.restoreStatisticsData(data.statistics, options);
                    result.restored.statistics = true;
                } catch (error) {
                    result.errors.push(`統計データ復元エラー: ${error.message}`);
                }
            }
            
            // 実績データの復元
            if (data.achievements && options.includeAchievements !== false) {
                try {
                    await this.restoreAchievementsData(data.achievements, options);
                    result.restored.achievements = true;
                } catch (error) {
                    result.errors.push(`実績データ復元エラー: ${error.message}`);
                }
            }
            
            // 設定データの復元
            if (data.settings && options.includeSettings !== false && !options.preserveUserSettings) {
                try {
                    await this.restoreSettingsData(data.settings, options);
                    result.restored.settings = true;
                } catch (error) {
                    result.errors.push(`設定データ復元エラー: ${error.message}`);
                }
            }
            
            // データの保存
            await this.saveRestoredData();
            
            result.success = result.errors.length === 0;
            
        } catch (error) {
            result.errors.push(`インポート処理エラー: ${error.message}`);
            result.success = false;
        }
        
        return result;
    }
    
    /**
     * プレイヤーデータの復元
     */
    async restorePlayerData(playerData, options) {
        if (!this.gameEngine.playerData) {
            throw new Error('PlayerData manager not available');
        }
        
        const currentData = this.gameEngine.playerData;
        
        // マージ戦略に応じて処理
        switch (options.mergeStrategy) {
            case 'replace':
                // 完全置換
                if (playerData.username !== undefined) currentData.setUsername(playerData.username);
                if (playerData.ap !== undefined) currentData.setAP(playerData.ap);
                if (playerData.tap !== undefined) currentData.setTotalAP(playerData.tap);
                if (playerData.level !== undefined) currentData.setLevel(playerData.level);
                if (playerData.experience !== undefined) currentData.setExperience(playerData.experience);
                if (playerData.highScores) currentData.setHighScores(playerData.highScores);
                if (playerData.unlockedStages) currentData.setUnlockedStages(playerData.unlockedStages);
                if (playerData.ownedItems) currentData.setOwnedItems(playerData.ownedItems);
                break;
                
            case 'merge':
                // データをマージ
                if (playerData.username !== undefined && playerData.username !== '') {
                    currentData.setUsername(playerData.username);
                }
                if (playerData.ap !== undefined) currentData.addAP(playerData.ap);
                if (playerData.tap !== undefined) currentData.addTotalAP(playerData.tap);
                // 他のマージロジック...
                break;
                
            case 'append':
                // 追加のみ
                if (playerData.ap !== undefined) currentData.addAP(playerData.ap);
                if (playerData.tap !== undefined) currentData.addTotalAP(playerData.tap);
                // 他の追加ロジック...
                break;
        }
    }
    
    /**
     * 統計データの復元
     */
    async restoreStatisticsData(statisticsData, options) {
        if (!this.gameEngine.statisticsManager) {
            throw new Error('StatisticsManager not available');
        }
        
        // 統計データの復元ロジック
        this.gameEngine.statisticsManager.importStatistics(statisticsData, options.mergeStrategy);
    }
    
    /**
     * 実績データの復元
     */
    async restoreAchievementsData(achievementsData, options) {
        if (!this.gameEngine.achievementManager) {
            throw new Error('AchievementManager not available');
        }
        
        // 実績データの復元ロジック
        this.gameEngine.achievementManager.importAchievements(achievementsData, options.mergeStrategy);
    }
    
    /**
     * 設定データの復元
     */
    async restoreSettingsData(settingsData, options) {
        if (!this.gameEngine.settingsManager) {
            throw new Error('SettingsManager not available');
        }
        
        // 設定データの復元ロジック
        this.gameEngine.settingsManager.importSettings(settingsData, options.mergeStrategy);
    }
    
    /**
     * 復元されたデータの保存
     */
    async saveRestoredData() {
        // 各マネージャーにデータ保存を要求
        if (this.gameEngine.playerData) {
            this.gameEngine.playerData.save();
        }
        
        if (this.gameEngine.statisticsManager) {
            this.gameEngine.statisticsManager.save();
        }
        
        if (this.gameEngine.achievementManager) {
            this.gameEngine.achievementManager.save();
        }
        
        if (this.gameEngine.settingsManager) {
            this.gameEngine.settingsManager.save();
        }
    }
    
    /**
     * バックアップの作成
     */
    async createBackup() {
        const backupData = await this.prepareExportData({
            includeStatistics: true,
            includeAchievements: true,
            includeSettings: true,
            anonymize: false,
            compress: true
        });
        
        // ローカルストレージにバックアップを保存
        const backupKey = `backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        
        // 古いバックアップを削除（最新5個まで保持）
        this.cleanupOldBackups();
        
        return backupKey;
    }
    
    /**
     * 古いバックアップのクリーンアップ
     */
    cleanupOldBackups() {
        const backupKeys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('backup_')) {
                backupKeys.push(key);
            }
        }
        
        // タイムスタンプ順でソート
        backupKeys.sort((a, b) => {
            const timestampA = parseInt(a.split('_')[1]);
            const timestampB = parseInt(b.split('_')[1]);
            return timestampB - timestampA;
        });
        
        // 最新5個以外を削除
        for (let i = 5; i < backupKeys.length; i++) {
            localStorage.removeItem(backupKeys[i]);
        }
    }
    
    /**
     * データの匿名化
     */
    anonymizeData(data) {
        if (data.playerData) {
            data.playerData.username = 'Anonymous';
        }
        
        // その他の個人識別可能な情報を匿名化
        if (data.metadata) {
            delete data.metadata.deviceId;
            delete data.metadata.userId;
        }
    }
    
    /**
     * 統計エクスポートの実行
     */
    async performStatisticsExport(options) {
        if (!this.statisticsExporter) {
            throw new Error('統計エクスポート機能が利用できません');
        }
        
        try {
            let exportResult;
            
            switch (options.selectedFormat) {
                case 'json':
                    exportResult = await this.statisticsExporter.exportToJSON(options);
                    break;
                case 'csv':
                    exportResult = await this.statisticsExporter.exportToCSV(options);
                    break;
                case 'txt':
                    exportResult = await this.statisticsExporter.exportToText(options);
                    break;
                default:
                    throw new Error(`未対応のフォーマット: ${options.selectedFormat}`);
            }
            
            return exportResult;
            
        } catch (error) {
            console.error('Statistics export error:', error);
            throw error;
        }
    }
    
    /**
     * ファイルダウンロード
     */
    downloadFile(data, filename, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * ユーティリティ関数
     */
    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    }
    
    getTotalTabCount() {
        return this.sceneState.get('tabs')?.length || 5;
    }
    
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}時間${minutes}分`;
        } else if (minutes > 0) {
            return `${minutes}分${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    }
    
    getContentType(format) {
        const mimeTypes = {
            json: 'application/json',
            csv: 'text/csv',
            txt: 'text/plain'
        };
        return mimeTypes[format] || 'application/octet-stream';
    }
    
    showError(message) {
        if (this.eventBus) {
            this.eventBus.emit('showError', message);
        }
    }
    
    /**
     * エクスポート設定の更新
     */
    updateExportSettings(settings) {
        this.exportSettings = { ...this.exportSettings, ...settings };
    }
    
    /**
     * インポート設定の更新
     */
    updateImportSettings(settings) {
        this.importSettings = { ...this.importSettings, ...settings };
    }
    
    /**
     * エクスポート状態の取得
     */
    getExportState() {
        return {
            isExporting: this.isExporting,
            isImporting: this.isImporting,
            lastExportData: this.lastExportData,
            lastImportData: this.lastImportData
        };
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    cleanup() {
        if (this.eventBus) {
            this.eventBus.off('exportDataRequested');
            this.eventBus.off('importDataRequested');
            this.eventBus.off('exportSettingsChanged');
            this.eventBus.off('importSettingsChanged');
        }
        
        // リソースのクリーンアップ
        this.lastExportData = null;
        this.lastImportData = null;
        this.statisticsExporter = null;
    }
}