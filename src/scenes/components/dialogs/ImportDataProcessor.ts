/**
 * Import Data Processor Component
 * 
 * データ処理と検証機能を担当
 * Main Controller Patternの一部として設計
 */

export interface ValidationRule { required: boolean,
    type: string,
    min?: number,
    max?: number,  }

export interface ValidationRules { [key: string]: ValidationRule }

export interface ValidationResult { valid: boolean,
    error?: string }

export interface DataIntegrityResult { valid: boolean,
    issues: string[] }

export interface VersionCompatibilityResult { compatible: boolean,
    error?: string }

export interface PlayerData { username?: string | null,
    ap: number,
    tap: number,
    highScore: number,
    unlockedStages: string[],
    ownedItems: string[]  }

export interface StatisticsData { totalPlayTime?: number,
    bubblesPopped?: number,
    gamesPlayed?: number,
    [key: string]: number | undefined }

export interface AchievementData { id: string,
    unlocked: boolean,
    unlockedAt?: string  }

export interface ImportData { version: string,
    playerData: PlayerData,
    statistics?: StatisticsData,
    achievements?: AchievementData[],
    timestamp?: string,
    settings?: Record<string, any> }

export interface DataSizeValidationResult { valid: boolean,
    error?: string,
    size?: number }

export interface Layout { contentX: number,
    contentY: number,
    contentWidth: number,
    buttonY: number,
    x: number,
    width: number  }

export interface MainController { data: {
        parsedDat,a?: ImportData,
        error?: string,
        importData: string,
        importMethod: string,
    step: string,
        importProgress?: number,
        processingText?: string,
        success?: boolean };
    textSettings: { contentFont: string,
        contentColor: string,
    errorColor: string };
    gameEngine: { playerData: any,
        statisticsManager?: any,
        achievementManager?: any };
    setupButtons(): void;
    roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void }

export interface PlayerDataInterface { setUsername(username: string): void,
    getAP(): number,
    addAP(amount: number): void,
    getTotalAP(): number,
    addTotalAP(amount: number): void,
    setHighScore(score: number): void,
    unlockStage(stage: string): void,
    addItem(item: string): void }

export class ImportDataProcessor {
    private mainController: MainController,
    private, validationRules: ValidationRules,
    constructor(mainController: MainController) {

        this.mainController = mainController

    }
        this.validationRules = { }
            version: { required: true, type: 'string'
            },''
            playerData: { required: true, type: 'object'
            },', 'playerData.username': { required: false, type: 'string|null'
            },', 'playerData.ap': { required: true, type: 'number', min: 0  },', 'playerData.tap': { required: true, type: 'number', min: 0  },', 'playerData.highScore': { required: true, type: 'number', min: 0  },', 'playerData.unlockedStages': { required: true, type: 'array'
            },', 'playerData.ownedItems': { required: true, type: 'array'
            }

    /**
     * 確認ステップを描画'
     */''
    renderConfirmStep(context: CanvasRenderingContext2D, layout: Layout, y: number): void { context.font = this.mainController.textSettings.contentFont,

        context.fillStyle = this.mainController.textSettings.contentColor,
        context.textAlign = 'left',
        context.textBaseline = 'top',

        if(this.mainController.data.parsedData) {

            context.fillText('インポートするデータの確認:', layout.contentX, y) }

            this.renderDataPreview(context, layout, y + 30); }

        } else {  context.fillStyle = this.mainController.textSettings.errorColor,
            context.fillText('データの解析に失敗しました。', layout.contentX, y),

            if(this.mainController.data.error) { }'

                context.font = '12px sans-serif'; }
                context.fillText(`エラー: ${this.mainController.data.error}`, layout.contentX, y + 30});
            }
}

    /**
     * データプレビューを描画
     */
    renderDataPreview(context: CanvasRenderingContext2D, layout: Layout, y: number): void { if (!this.mainController.data.parsedData) return,
        
        const preview = this.mainController.data.parsedData,
        const previewHeight = Math.min(120, layout.buttonY - y - 20),

        if(previewHeight <= 0) return,

        context.font = '12px sans-serif',

        context.fillStyle = this.mainController.textSettings.contentColor,
        context.textAlign = 'left',
        context.textBaseline = 'top',
        
        let currentY = y,

        if(preview.playerData) {

            context.fillText('プレイヤーデータ:', layout.contentX, currentY',
            currentY += 20,

            context.font = '11px sans-serif' }

            context.fillStyle = '#6C757D'; }

            context.fillText(`• ユーザー名: ${preview.playerData.username || '(未設定'}'}`, layout.contentX + 10, currentY);
            currentY += 15;
            context.fillText(`• AP: ${ preview.playerData.ap || 0}`, layout.contentX + 10, currentY};
            currentY += 15; }
            context.fillText(`• ハイスコア: ${preview.playerData.highScore || 0}`, layout.contentX + 10, currentY});
            currentY += 20;
        }

        if(preview.statistics && currentY < y + previewHeight) {

            context.font = '12px sans-serif',

            context.fillStyle = this.mainController.textSettings.contentColor,
            context.fillText('統計データ:', layout.contentX, currentY),
            currentY += 20,

            const statsCount = Object.keys(preview.statistics).length,
            context.font = '11px sans-serif' }

            context.fillStyle = '#6C757D'; }
            context.fillText(`• ${statsCount}項目の統計データ`, layout.contentX + 10, currentY});
        }
    }

    /**
     * データをパースして次のステップに進む
     */'
    parseAndProceed(): boolean { ''
        if(!this.canProceedFromSelect()) {''
            this.mainController.data.error = 'インポートするデータを選択してください',
            return false }
        
        // データを解析
        try {'
            const parsedData = JSON.parse(this.mainController.data.importData) as ImportData,

            this.mainController.data.parsedData = parsedData,
            this.mainController.data.step = 'confirm',
            this.mainController.data.error = undefined,
            this.mainController.setupButtons(),

            return true,' }'

        } catch (error) {
            this.mainController.data.error = 'JSONデータの形式が正しくありません',
            return false,

    /**
     * インポートデータを検証'
     */''
    async validateImportData(data: any): Promise<ValidationResult> { // 基本構造チェック
        if (!data || typeof, data !== 'object') { }

            return { valid: false, error: 'データが正しい形式ではありません'
            }
        ';
        // バージョンチェック
        if(!data.version) { }'

            return { valid: false, error: 'バージョン情報が見つかりません'
            }
        
        // プレイヤーデータのチェック
        if(data.playerData) {
            const validation = this.validatePlayerData(data.playerData),
            if(!validation.valid) {
        }
                return validation; else { }'

            return { valid: false, error: 'プレイヤーデータが見つかりません'
            }
        
        // 統計データのチェック（オプション）
        if(data.statistics) {
            const validation = this.validateStatisticsData(data.statistics),
            if (!validation.valid) {
        }
                return validation;
        
        // 実績データのチェック（オプション）
        if(data.achievements) {
            const validation = this.validateAchievementsData(data.achievements),
            if (!validation.valid) {
        }
                return validation;
        
        return { valid: true }

    /**
     * プレイヤーデータの検証
     */''
    validatePlayerData(playerData: any): ValidationResult { ''
        if(typeof, playerData.username !== 'string' && playerData.username !== null' { }

            return { valid: false, error: 'ユーザー名のデータ型が正しくありません'
            }

        if (typeof, playerData.ap !== 'number') { }

            return { valid: false, error: 'APのデータ型が正しくありません'
            }

        if(playerData.ap < 0) { }'

            return { valid: false, error: 'APは0以上である必要があります'
            }

        if (typeof, playerData.tap !== 'number') { }

            return { valid: false, error: 'TAPのデータ型が正しくありません'
            }

        if(playerData.tap < 0) { }'

            return { valid: false, error: 'TAPは0以上である必要があります'
            }

        if (typeof, playerData.highScore !== 'number') { }

            return { valid: false, error: 'ハイスコアのデータ型が正しくありません'
            }

        if(playerData.highScore < 0) { }'

            return { valid: false, error: 'ハイスコアは0以上である必要があります'
            }

        if(!Array.isArray(playerData.unlockedStages)) { }'

            return { valid: false, error: 'アンロックステージのデータ型が正しくありません'
            }

        if(!Array.isArray(playerData.ownedItems)) { }'

            return { valid: false, error: '所有アイテムのデータ型が正しくありません'
            }
        ';
        // ユーザー名の長さチェック
        if(playerData.username && playerData.username.length > 20) { }'

            return { valid: false, error: 'ユーザー名は20文字以下である必要があります'
            }
        ';
        // APとTAPの関係チェック
        if(playerData.ap > playerData.tap) { }'

            return { valid: false, error: 'APは総獲得AP以下である必要があります'
            }
        
        return { valid: true }

    /**
     * 統計データの検証'
     */''
    validateStatisticsData(statistics: any): ValidationResult { ''
        if(typeof, statistics !== 'object' || statistics === null' { }

            return { valid: false, error: '統計データが正しい形式ではありません'
            }
        ';
        // 基本的な統計項目のチェック
        const requiredStats = ['totalPlayTime', 'bubblesPopped', 'gamesPlayed'];
        for (const stat of requiredStats) {', ' }

            if(statistics.hasOwnProperty(stat) && typeof statistics[stat] !== 'number') { }
                return { valid: false, error: `統計データ「${stat }」の型が正しくありません` }
}
        
        return { valid: true }

    /**
     * 実績データの検証
     */'
    validateAchievementsData(achievements: any): ValidationResult { ''
        if(!Array.isArray(achievements)) { }'

            return { valid: false, error: '実績データが正しい形式ではありません'
            }
        ';
        // 各実績の構造をチェック
        for(let, i = 0; i < achievements.length; i++) {
            const achievement = achievements[i] }

            if(typeof, achievement !== 'object' || achievement === null' { }
                return { valid: false, error: `実績データ[${i }]が正しい形式ではありません` }
            }

            if(typeof, achievement.id !== 'string') {
    
}
                return { valid: false, error: `実績データ[${i }]のIDが正しくありません` }
            }

            if(typeof, achievement.unlocked !== 'boolean' { }
                return { valid: false, error: `実績データ[${i }]のunlocked状態が正しくありません` }
            }
            
            if(achievement.unlocked && !achievement.unlockedAt) {
    
}
                return { valid: false, error: `実績データ[${i }]の解除日時が設定されていません` }
}
        
        return { valid: true }

    /**
     * データを復元
     */
    async restoreData(importData: ImportData): Promise<void> { const playerData = this.mainController.gameEngine.playerData,
        
        if(importData.playerData) {
    
}
            await this.restorePlayerData(playerData, importData.playerData); }
        }
        
        // 統計データの復元
        if (importData.statistics && this.mainController.gameEngine.statisticsManager) { this.mainController.gameEngine.statisticsManager.importStatistics(importData.statistics) }
        
        // 実績データの復元
        if (importData.achievements && this.mainController.gameEngine.achievementManager) { this.mainController.gameEngine.achievementManager.importAchievements(importData.achievements) }
    }

    /**
     * プレイヤーデータの復元
     */
    async restorePlayerData(playerData: PlayerDataInterface, importedData: PlayerData): Promise<void> { if (importedData.username) {''
            playerData.setUsername(importedData.username) }

        if(typeof, importedData.ap === 'number' {'
            const currentAP = playerData.getAP(),
            const difference = importedData.ap - currentAP,

            if (difference !== 0) {
        }

                playerData.addAP(difference); }
}

        if(typeof, importedData.tap === 'number' {'
            const currentTAP = playerData.getTotalAP(),
            const difference = importedData.tap - currentTAP,

            if (difference !== 0) {
        }

                playerData.addTotalAP(difference); }
}

        if(typeof, importedData.highScore === 'number) { playerData.setHighScore(importedData.highScore) }'
        
        if(Array.isArray(importedData.unlockedStages) {
        
            for (const stage of importedData.unlockedStages) {
    
}
                playerData.unlockStage(stage); }
}
        
        if(Array.isArray(importedData.ownedItems) {
        
            for (const item of importedData.ownedItems) {
    
}
                playerData.addItem(item); }
}
    }

    /**
     * JSON形式の検証
     */
    isValidJSON(str: string): boolean { try {
            JSON.parse(str),
            return true } catch (e) { return false,

    /**
     * データサイズの検証
     */
    validateDataSize(data: any): DataSizeValidationResult { const maxSize = 1024 * 1024, // 1MB
        const dataString = JSON.stringify(data),
        const sizeInBytes = new Blob([dataString]).size,
        
        if(sizeInBytes > maxSize) {
    
}
            return {  };
                valid: false,' }'

                error: `データサイズが大きすぎます（${Math.round(sizeInBytes / 1024'}'KB > ${maxSize / 1024}KB）`}
        
        return { valid: true, size: sizeInBytes  }

    /**
     * バージョン互換性の確認'
     */''
    checkVersionCompatibility(dataVersion: string, currentVersion: string = '1.0.0': VersionCompatibilityResult { // 簡易バージョン比較'
        const parseVersion = (version: string'): number[] => { }

            return version.split('.).map(num => parseInt(num, 10);
        
        try { const data = parseVersion(dataVersion),
            const current = parseVersion(currentVersion),
            
            // メジャーバージョンが異なる場合は互換性なし
            if(data[0] !== current[0]) {
    
}
                return {  };
                    compatible: false }
                    error: `互換性のないバージョンです（データ: v${dataVersion}, 現在: v${currentVersion}）`
                }
            ';

            return { compatible: true }'} catch (error) { return { compatible: false,' };

                error: 'バージョン形式が正しくありません' 
    }
    }

    /**
     * 選択ステップから進めるかチェック'
     */''
    canProceedFromSelect()';
        if(this.mainController.data.importMethod === 'file' && this.mainController.data.importData' { return true,
        if (this.mainController.data.importMethod === 'text' && this.mainController.data.importData.trim().length > 0) { return true }
        return false;
    }

    /**
     * データの完全性チェック
     */
    checkDataIntegrity(data: ImportData): DataIntegrityResult { const issues: string[] = [],
        // 必須フィールドの存在確認
        if(!data.version) issues.push('バージョン情報が不足',
        if(!data.playerData) issues.push('プレイヤーデータが不足',
        if(!data.timestamp) issues.push('タイムスタンプが不足),
        
        // データの一貫性チェック
        if(data.playerData) {

            if(data.playerData.ap > data.playerData.tap) {
        }

                issues.push('APが総獲得APを上回っています'; }'
            }

            if(data.playerData.highScore < 0) {', ' }

                issues.push('ハイスコアが負の値です'; }'
}
        
        return { valid: issues.length = == 0 };
            issues: issues 
    }

    /**
     * ステータス取得'
     */''
    getStatus('''
            componentType: 'ImportDataProcessor',';
            validationRules: Object.keys(this.validationRules,
            supportedFormats: ['json'],
    maxDataSize: 1024 * 1024 // 1MB;
        } }'}