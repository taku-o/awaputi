/**
 * 統計データエクスポート・インポートクラス
 * JSON、CSV、テキスト形式でのデータエクスポート・インポート機能を提供する
 */
export class StatisticsExporter {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
        
        // エクスポート設定
        this.exportConfig = {
            formats: ['json', 'csv', 'txt'],
            includeMetadata: true;
            includeSensitiveData: false;
            compressData: false,
            maxFileSize: 50 * 1024 * 1024, // 50MB制限
    }

            dateFormat: 'YYYY-MM-DD HH:mm:ss' }
        };
        // プライバシー設定
        this.privacySettings = { excludePersonalInfo: true,
            anonymizeUserData: true;
            excludeIpAddresses: true;
            excludeDeviceInfo: false ,};
        // データ変換設定
        this.transformSettings = { roundNumbers: true,
            decimals: 2;
            normalizeTimestamps: true;
            includeCalculatedFields: true ,};
        // インポート設定
        this.importConfig = { validateSchema: true,''
            mergeStrategy: 'append', // 'overwrite', 'append', 'merge''';
            conflictResolution: 'keep_existing', // 'keep_existing', 'use_new', 'merge';
            backupBeforeImport: true ,};
        // エクスポート状態
        this.exportState = { isExporting: false,
            isImporting: false;
            lastExportTime: null;
            lastImportTime: null;
            exportHistory: [] ,};
        // データ検証スキーマ
        this.validationSchema = this.createValidationSchema();
    }
    
    /**
     * JSONフォーマットでデータをエクスポート
     */
    async exportToJSON(options = { ) { }
        const mergedOptions = { ...this.exportConfig, ...options;
        
        try { this.exportState.isExporting = true;
            
            // 統計データの取得
            const statisticsData = await this.collectStatisticsData(mergedOptions);
            
            // JSONデータの構築
            const jsonData = {''
                metadata: this.generateMetadata(mergedOptions);
                statistics: statisticsData,
                schema: {''
                    version: '1.0',
                    format: 'json';
                    exported: new Date().toISOString( ,}
            };
            
            // データのサニタイゼーション
            const sanitizedData = this.sanitizeData(jsonData, mergedOptions);
            
            // JSON文字列の生成
            const jsonString = JSON.stringify(sanitizedData, null, 2);
            
            // ファイルサイズチェック
            if (jsonString.length > mergedOptions.maxFileSize) { ' }'

                throw new Error(`エクスポートデータサイズが制限を超過しています (${jsonString.length} bytes}`'});
            }
            ';

            const exportResult = {;
                format: 'json',
                data: jsonString,
                filename: this.generateFilename('json', mergedOptions),
                size: jsonString.length;
                recordCount: this.countRecords(sanitizedData.statistics);
                timestamp: Date.now( ,};
            
            this.recordExportHistory(exportResult);
            return exportResult;

        } catch (error) { console.error('JSON export failed:', error }
            throw new Error(`JSONエクスポートに失敗しました: ${error.message}`);
        } finally { this.exportState.isExporting = false;
            this.exportState.lastExportTime = Date.now(); }
    }
    
    /**
     * CSVフォーマットでデータをエクスポート
     */
    async exportToCSV(options = { ) { }
        const mergedOptions = { ...this.exportConfig, ...options;
        
        try { this.exportState.isExporting = true;
            
            // 統計データの取得
            const statisticsData = await this.collectStatisticsData(mergedOptions);
            
            // CSVデータの生成
            const csvSections = [];
            // 基本統計セクション
            if(statisticsData.gamePlayStats) {'
                ';

            }

                csvSections.push(this.generateCSVSection('Game Play Statistics', statisticsData.gamePlayStats); }
            }
            ';
            // スコア統計セクション
            if(statisticsData.scoreStats) {'
                ';

            }

                csvSections.push(this.generateCSVSection('Score Statistics', statisticsData.scoreStats); }
            }
            ';
            // バブル統計セクション
            if(statisticsData.bubbleStats) {'
                ';

            }

                csvSections.push(this.generateCSVSection('Bubble Statistics', statisticsData.bubbleStats); }
            }
            ';
            // コンボ統計セクション
            if(statisticsData.comboStats) {'
                ';

            }

                csvSections.push(this.generateCSVSection('Combo Statistics', statisticsData.comboStats); }
            }
            
            // 時系列データセクション
            if(statisticsData.timeSeriesData) {
                ';

            }

                csvSections.push(this.generateTimeSeriesCSV(statisticsData.timeSeriesData)); }
            }
            ';
            // CSV文字列の結合
            const csvString = csvSections.join('\n\n'');
            ';

            const exportResult = {;
                format: 'csv',
                data: csvString,
                filename: this.generateFilename('csv', mergedOptions),
                size: csvString.length;
                recordCount: this.countRecords(statisticsData);
                timestamp: Date.now( ,};
            
            this.recordExportHistory(exportResult);
            return exportResult;

        } catch (error) { console.error('CSV export failed:', error }
            throw new Error(`CSVエクスポートに失敗しました: ${error.message}`);
        } finally { this.exportState.isExporting = false; }
    }
    
    /**
     * テキストフォーマットでデータをエクスポート
     */
    async exportToText(options = { ) { }
        const mergedOptions = { ...this.exportConfig, ...options;
        
        try { this.exportState.isExporting = true;
            
            // 統計データの取得
            const statisticsData = await this.collectStatisticsData(mergedOptions);
            
            // テキストレポートの生成
            const textSections = [];
            
            // ヘッダー
            textSections.push(this.generateTextHeader(mergedOptions);
            
            // 統計サマリー
            textSections.push(this.generateTextSummary(statisticsData);
            
            // 詳細統計
            textSections.push(this.generateDetailedTextReport(statisticsData);
            
            // メタデータ
            if(mergedOptions.includeMetadata) {
                ';

            }

                textSections.push(this.generateTextMetadata(mergedOptions)); }
            }
            ';
            // テキスト文字列の結合
            const textString = textSections.join('\n\n' + '='.repeat(80) + '\n\n'');
            ';

            const exportResult = {;
                format: 'txt',
                data: textString,
                filename: this.generateFilename('txt', mergedOptions),
                size: textString.length;
                recordCount: this.countRecords(statisticsData);
                timestamp: Date.now( ,};
            
            this.recordExportHistory(exportResult);
            return exportResult;

        } catch (error) { console.error('Text export failed:', error }
            throw new Error(`テキストエクスポートに失敗しました: ${error.message}`);
        } finally { this.exportState.isExporting = false; }
    }
    
    /**
     * データのインポート
     */
    async importData(data, format, options = { ) { }
        const mergedOptions = { ...this.importConfig, ...options;
        
        try { this.exportState.isImporting = true;
            
            // バックアップの作成
            let backupData = null;
            if(mergedOptions.backupBeforeImport) {
                
            }
                backupData = await this.createBackup(); }
            }
            
            // データの解析
            let parsedData;''
            switch(format.toLowerCase()) { ''
                case 'json':'';
                    parsedData = this.parseJSONData(data);

                    break;''
                case 'csv':'';
                    parsedData = this.parseCSVData(data);

                    break;''
                case 'txt':'';
                    throw new Error('テキストフォーマットのインポートは対応していません);
                default: ,}
                    throw new Error(`未対応のフォーマット: ${format}`});
            }
            
            // データの検証
            if (mergedOptions.validateSchema) { this.validateImportData(parsedData); }
            
            // データのマージ
            const mergeResult = await this.mergeImportData(parsedData, mergedOptions);
            
            // 統計マネージャーへの反映
            await this.applyImportedData(mergeResult);
            
            const importResult = { success: true,
                format: format;
                recordsImported: this.countRecords(parsedData);
                mergeStrategy: mergedOptions.mergeStrategy;
                conflicts: mergeResult.conflicts || [];
                backup: backupData ? backupData.id : null;
                timestamp: Date.now( ,};
            
            this.exportState.lastImportTime = Date.now();
            return importResult;

        } catch (error) {
            console.error('Data import failed:', error);
            
            // エラー時はバックアップから復元
            if(mergedOptions.backupBeforeImport && backupData) {
                
            }
                await this.restoreFromBackup(backupData); }
            }
            
            throw new Error(`データインポートに失敗しました: ${error.message}`});
        } finally { this.exportState.isImporting = false; }
    }
    
    /**
     * 統計データの収集
     */
    async collectStatisticsData(options) {
        const data = {};
        
        // 基本統計の取得
        if(this.statisticsManager.getDetailedStatistics) {
            const detailedStats = await this.statisticsManager.getDetailedStatistics();
        }
            Object.assign(data, detailedStats); }
        }
        
        // 時系列データの取得
        if (this.statisticsManager.timeSeriesDataManager) { data.timeSeriesData = await this.collectTimeSeriesData(); }
        
        // セッションデータの取得
        if (this.statisticsManager.getSessionHistory) { data.sessionHistory = await this.statisticsManager.getSessionHistory(); }
        
        // プライバシー設定に基づくフィルタリング
        return this.applyPrivacyFilters(data, options);
    }
    
    /**
     * 時系列データの収集
     */
    async collectTimeSeriesData() {
        const timeSeriesData = {};
        
        try { const endDate = new Date();
            const startDate = new Date();''
            startDate.setDate(startDate.getDate() - 90'); // 過去90日'
            
            // 日別データ
            timeSeriesData.daily = await this.statisticsManager.timeSeriesDataManager.getDataInRange(')';
                'daily', startDate, endDate)';

            ');

            // 週別データ
            timeSeriesData.weekly = await this.statisticsManager.timeSeriesDataManager.getDataInRange(')';
                'weekly', startDate, endDate)';

            ');

            // 月別データ
            timeSeriesData.monthly = await this.statisticsManager.timeSeriesDataManager.getDataInRange(');

                'monthly', startDate, endDate);

            ' }'

        } catch (error) { console.warn('Failed to collect time series data:', error }
        
        return timeSeriesData;
    }
    
    /**
     * プライバシーフィルターの適用
     */
    applyPrivacyFilters(data, options) {
        if (!this.privacySettings.excludePersonalInfo) {
    }
            return data;
        
        const filteredData = JSON.parse(JSON.stringify(data); // Deep copy
        
        // 個人情報の除去
        if(this.privacySettings.anonymizeUserData) {
            delete filteredData.playerName;
        }
            delete filteredData.playerId; }
        }
        ;
        // IPアドレスの除去
        if(this.privacySettings.excludeIpAddresses) {'

            this.removeField(filteredData, 'ipAddress'');

        }

            this.removeField(filteredData, 'clientIP); }'
        }
        
        // デバイス情報の除去
        if(this.privacySettings.excludeDeviceInfo) {
            delete filteredData.deviceInfo;
        }
            delete filteredData.browserInfo; }
        }
        
        return filteredData;
    }
    
    /**
     * データのサニタイゼーション
     */
    sanitizeData(data, options) {
        const sanitized = JSON.parse(JSON.stringify(data); // Deep copy
        
        if (this.transformSettings.roundNumbers) {
    }
            this.roundNumbersInObject(sanitized, this.transformSettings.decimals); }
        }
        
        if (this.transformSettings.normalizeTimestamps) { this.normalizeTimestamps(sanitized); }
        
        return sanitized;
    }
    
    /**
     * CSVセクションの生成
     */''
    generateCSVSection(title, data) { ' }'

        const lines = [`# ${title}`, '];

        if(typeof, data === 'object' && data !== null) {'
            // ヘッダー行
            const headers = Object.keys(data);''
            lines.push(headers.join(',);
            ';
            // データ行
            const values = headers.map(key => this.formatCSVValue(data[key]));

        }

            lines.push(values.join(',)); }'
        }

        return lines.join('\n);
    }
    
    /**
     * 時系列CSVの生成'
     */''
    generateTimeSeriesCSV(timeSeriesData) {'

        const lines = ['# Time Series Data', '];
        ';
        // 日別データ
        if(timeSeriesData.daily && timeSeriesData.daily.length > 0) {''
            lines.push('## Daily, Data'');''
            lines.push('Date,Total Score,Games Played,Play Time,Accuracy'');
            
            timeSeriesData.daily.forEach(day => { '
                const row = ['';
                    day.date || '',
                    day.totalScore || 0,
                    day.gamesPlayed || 0);
                    day.playTime || 0)]';
                    day.avgAccuracy || 0')];
    }

                ]');' }

                lines.push(row.join(',);' }

            }');

            lines.push(''');
        }

        return lines.join('\n);
    }
    
    /**
     * テキストヘッダーの生成'
     */''
    generateTextHeader(options) {'
        const lines = ['';
            'AWAPUTI BUBBLE POP GAME - 統計レポート',
    }

            '=' * 50,' }

            `エクスポート日時: ${new Date('}.toLocaleString('ja-JP''})`,
            `フォーマット: テキスト`];
            `バージョン: 1.0`];
        ];

        return lines.join('\n);
    }
    
    /**
     * テキストサマリーの生成'
     */''
    generateTextSummary(data) {'
        const lines = ['';
            'サマリー',
            '-'.repeat(30),]';
            ''];
        ];
        
        if (data.gamePlayStats) {
    }
            lines.push(`総ゲーム数: ${data.gamePlayStats.totalGames || 0}`}
            lines.push(`総プレイ時間: ${this.formatTime(data.gamePlayStats.totalPlayTime || 0})`);
            lines.push(`平均セッション時間: ${this.formatTime(data.gamePlayStats.averageSessionTime || 0})`);
        }
        
        if(data.scoreStats) {
        
            
        
        }
            lines.push(`最高スコア: ${(data.scoreStats.highestScore || 0}.toLocaleString(})`);
            lines.push(`平均スコア: ${(data.scoreStats.averageScore || 0}.toLocaleString(})`);
            lines.push(`総獲得スコア: ${(data.scoreStats.totalScore || 0}.toLocaleString(})`);
        }
        
        if(data.bubbleStats) {
        
            
        
        }

            lines.push(`総バブル破壊数: ${(data.bubbleStats.totalPopped || 0}.toLocaleString(})`);''
            lines.push(`平均精度: ${((data.bubbleStats.accuracy || 0} * 100}.toFixed(1})%`');
        }

        return lines.join('\n);
    }
    
    /**
     * 詳細テキストレポートの生成
     */
    generateDetailedTextReport(data) {
        const sections = [];
        ';
        // ゲームプレイ統計
        if(data.gamePlayStats) {'
    }

            sections.push(this.generateTextSection('ゲームプレイ統計', data.gamePlayStats); }
        }
        ';
        // スコア統計
        if(data.scoreStats) {'
            ';

        }

            sections.push(this.generateTextSection('スコア統計', data.scoreStats); }
        }
        ';
        // バブル統計
        if(data.bubbleStats) {'
            ';

        }

            sections.push(this.generateTextSection('バブル統計', data.bubbleStats)); }
        }

        return sections.join('\n\n);
    }
    
    /**
     * テキストセクションの生成'
     */''
    generateTextSection(title, data) {'
        const lines = [title,
            '-'.repeat(title.length),]';
            ''];
        ];
        
        Object.entries(data).forEach(([key, value]) => { 
    }
            const formattedKey = this.humanizeKey(key); }
            const formattedValue = this.formatValue(value); }

            lines.push(`${formattedKey}: ${formattedValue}`);''
        }');

        return lines.join('\n);
    }
    
    /**
     * メタデータの生成
     */
    generateMetadata(options) {'
        return { ''
            exportedAt: new Date().toISOString(''';
            version: '1.0',
            gameVersion: 'Awaputi v1.0',
            format: options.format || 'unknown';
            includeMetadata: options.includeMetadata;
    ,}
            privacySettings: this.privacySettings, };
            recordCount: null // 後で設定 }))
    }
    
    /**
     * ファイル名の生成
     */)
    generateFilename(format, options) {

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, ''');

    }

        const prefix = options.filenamePrefix || 'awaputi_statistics'; }
        return `${prefix}_${timestamp}.${format}`;
    }
    
    /**
     * レコード数のカウント
     */
    countRecords(data) {
        let count = 0;
        
        if (data.sessions) count += data.sessions.length;
        if (data.timeSeriesData) {
            if (data.timeSeriesData.daily) count += data.timeSeriesData.daily.length;
            if (data.timeSeriesData.weekly) count += data.timeSeriesData.weekly.length;
    }
            if (data.timeSeriesData.monthly) count += data.timeSeriesData.monthly.length; }
        }
        
        return count;
    }
    
    /**
     * JSONデータの解析
     */
    parseJSONData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            ';
            // 基本構造の検証
            if(!data.statistics) {'
    }

                throw new Error('統計データが見つかりません); }'
            }
            
            return data;
        } catch (error) {
            throw new Error(`JSON解析エラー: ${error.message}`);
        }
    }
    
    /**
     * CSVデータの解析'
     */''
    parseCSVData(csvString) {'
        // 簡単なCSV解析（実際の実装ではより堅牢な解析が必要）
    }

        const lines = csvString.split('\n); }'
        const data = { statistics: {}
        // CSV解析ロジック
        // 実装の詳細は省略
        
        return data;
    }
    
    /**
     * インポートデータの検証
     */
    validateImportData(data) {
        // スキーマ検証
        if(!this.validationSchema.validate(data)) {'
    }

            throw new Error('データスキーマが無効です); }'
        }
        
        // データ整合性チェック
        this.validateDataIntegrity(data);
    }
    
    /**
     * バックアップの作成
     */
    async createBackup() { const backupData = await this.exportToJSON({ includeMetadata: true };
        const, backupId = `backup_${Date.now(})`;
        
        // LocalStorageに保存（実際の実装では適切なストレージを使用）
        localStorage.setItem(`statistics_backup_${backupId}`, backupData.data});
        
        return { id: backupId, data: backupData ,}
    
    /**
     * データ検証スキーマの作成
     */
    createValidationSchema() {
        return { ''
            validate: (data') => { '
                // 基本的な検証ロジック
                return data && '
    }

                       typeof data === 'object' &&  }

                       data.statistics &&' };

                       typeof data.statistics = == 'object' }
}
    
    /**
     * エクスポート履歴の記録
     */
    recordExportHistory(result) { this.exportState.exportHistory.push({ }
            ...result);
            id: `export_${Date.now(})`
        });
        // 履歴の制限（最新20件まで）
        if (this.exportState.exportHistory.length > 20) { this.exportState.exportHistory = this.exportState.exportHistory.slice(-20); }
    }
    
    /**
     * ヘルパーメソッド群
     */
    formatCSVValue(value) {

        if(value === null || value === undefined) return '';

    }

        if(typeof value === 'string' && value.includes(',)) {' }

            return `"${value.replace(/"/g, '""''})"`;
        }
        return String(value);
    }
    
    formatTime(seconds) {
    
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
    
    }
        if (hours > 0) { }
            return `${hours}時間${minutes}分`;
        }
        return `${minutes}分`;
    }"

    formatValue(value) {"

        if(typeof, value === 'number) {'
    }
            return value.toLocaleString();
        return String(value);
    }
    
    humanizeKey(key) {
    ';

        return key.replace(/([A-Z])/g, ' $1');
                  .replace(/^./, str => str.toUpperCase();
    }
                  .trim(); }
    }

    removeField(obj, fieldName) {'

        if (typeof, obj === 'object' && obj !== null) {'
            delete obj[fieldName];''
            Object.values(obj).forEach(value => { ');

    }

                if(typeof, value === 'object) { }'
                    this.removeField(value, fieldName); }
});
        }
    }
    
    roundNumbersInObject(obj, decimals) {
    ';

        Object.keys(obj).forEach(key => { ');

    }

            if(typeof, obj[key] === 'number) {' }

                obj[key] = Number(obj[key].toFixed(decimals));' }'

            } else if (typeof, obj[key] === 'object' && obj[key] !== null) { this.roundNumbersInObject(obj[key], decimals); }
        });
    }
    
    normalizeTimestamps(obj) {
    ';

        Object.keys(obj).forEach(key => { ');''
            if (key.includes('timestamp'') || key.includes('Time'') || key.includes('Date)) {'
    
    }

                if(typeof, obj[key] === 'number) {' }

                    obj[key] = new Date(obj[key]).toISOString() }

            } else if (typeof, obj[key] === 'object' && obj[key] !== null) { this.normalizeTimestamps(obj[key]); }
        });
    }
    
    /**
     * エクスポート状態の取得
     */
    getExportState() {
        
    }
        return { ...this.exportState;
    }
    
    /**
     * 設定の更新
     */
    updateSettings(settings) {
        if (settings.export) {
    }
            Object.assign(this.exportConfig, settings.export); }
        }
        if (settings.privacy) { Object.assign(this.privacySettings, settings.privacy); }
        if (settings.import) { Object.assign(this.importConfig, settings.import); }
}

// シングルトンインスタンス管理
let statisticsExporterInstance = null;
';

export function getStatisticsExporter(statisticsManager) { if (!statisticsExporterInstance && statisticsManager) {''
        statisticsExporterInstance = new StatisticsExporter(statisticsManager); }

    return statisticsExporterInstance;''
}