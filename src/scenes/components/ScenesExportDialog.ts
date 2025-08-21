/**
 * データエクスポートダイアログ
 */
import { ScenesBaseDialog, DialogButton, GameEngine, EventBus, GameState  } from './ScenesBaseDialog.js';

// Type definitions for export dialog
export interface ExportOptions { playerData: {
        usernam,e: boolean,
        scores: boolean,
        achievements: boolean,
        settings: boolean,
    statistics: boolean 
};
    gameSettings: { graphics: boolean,
        audio: boolean,
        gameplay: boolean,
    accessibility: boolean 
};
    achievements: { unlocked: boolean,
        progress: boolean,
    timestamps: boolean }

export interface PlayerData { username?: string,
    highScores?: Record<string, number>,
    unlockedStages?: string[],
    ap?: number,
    tap?: number,
    ownedItems?: string[],
    gamesPlayed?: number,
    totalPlayTime?: number,
    bubblesPopped?: number }
export interface GameSettings { graphics?: Record<string, unknown>,
    audio?: Record<string, unknown>,
    gameplay?: Record<string, unknown>,
    accessibility?: Record<string, unknown> }
export interface Achievement { id: string,
    name: string,
    description: string,
    progress?: number,
    requirement?: number,
    unlockedAt?: string,  }
';

export interface AchievementManager {;
    getUnlockedAchievements: () => Achievement[] }
export interface ExportData { metadata?: {
        exportedA,t: string,
        exportType: string,
        format: string,
    version: string  };
    playerData?: PlayerData;
    gameSettings?: GameSettings;
    achievements?: { achievements: Achievement[] }

export type ExportType = 'playerData' | 'gameSettings' | 'achievements' | 'all';
export type ExportFormat = 'json' | 'csv' | 'txt';

/**
 * シーン用エクスポートダイアログ
 * ゲーム内でのデータエクスポート機能を提供
 * @extends ScenesBaseDialog
 */
export class ScenesExportDialog extends ScenesBaseDialog { private exportType: ExportType
    private exportFormat: ExportFormat,
    private includeMetadata: boolean,
    // エクスポート対象の設定
    private exportOptions: ExportOptions,
    // プレビューデータ
    private previewData: ExportData | null,
    private, showPreview: boolean,
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: GameState) {
',

        super(gameEngine, eventBus, state),
        ',
        // エクスポート設定
        this.exportType = 'playerData',
        this.exportFormat = 'json',
        this.includeMetadata = true,
        
        // エクスポート対象の設定
        this.exportOptions = {
            playerData: {
                username: true,
                scores: true,
                achievements: true,
    settings: true
 }
                statistics: true ;
    },
            gameSettings: { graphics: true,
                audio: true,
                gameplay: true,
    accessibility: true 
};
            achievements: { unlocked: true,
                progress: true,
    timestamps: true 
    },
        
        // プレビューデータ
        this.previewData = null;
        this.showPreview = false;
        // ボタン設定
        this.setupButtons([)';
            { text: 'プレビュー', callback: () => this.generatePreview()'
            { text: 'エクスポート', callback: () => this.executeExport()  }]'
            { text: 'キャンセル', callback: () => this.handleCancel()  }]
        ]);
        
        // レイアウト調整
        this.layout.width = 550;
        this.layout.height = 450;
        
        // 初期プレビュー生成
        this.generatePreview();
    }
    
    /**
     * ダイアログコンテンツをレンダリング
     * @param context - Canvas描画コンテキスト
     */
    protected renderContent(context: CanvasRenderingContext2D): void { const contentX = this.layout.x + this.layout.padding,
        const contentY = this.layout.y + this.layout.titleHeight + this.layout.padding,
        const contentWidth = this.layout.width - (this.layout.padding * 2),
        let currentY = contentY,
        
        // エクスポートタイプ選択
        this.renderExportTypeSelection(context, contentX, currentY, contentWidth),
        currentY += 90,
        
        // エクスポート形式選択
        this.renderFormatSelection(context, contentX, currentY, contentWidth),
        currentY += 60,
        
        // エクスポートオプション
        this.renderExportOptions(context, contentX, currentY, contentWidth),
        currentY += 100,
        
        // プレビュー表示
        if(this.showPreview && this.previewData) {
    
}
            this.renderDataPreview(context, contentX, currentY, contentWidth); }
    }
    
    /**
     * エクスポートタイプ選択をレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     */''
    private renderExportTypeSelection(context: CanvasRenderingContext2D, x: number, y: number, width: number): void { ''
        context.fillStyle = '#333333',
        context.font = 'bold 14px Arial, sans-serif',
        context.textAlign = 'left',
        context.textBaseline = 'top',
        context.fillText('エクスポート対象:', x, y' }

        const types: Array<{ key: ExportType,, label: string }> = [''
            { key: 'playerData', label: 'プレイヤーデータ'
            },''
            { key: 'gameSettings', label: 'ゲーム設定'
            },''
            { key: 'achievements', label: '実績データ'
            },]'
            { key: 'all', label: '全データ'
            }]
        ];
        ';

        types.forEach((type, index) => {  ''
            const typeY = y + 25 + (index * 20'),
            const isSelected = this.exportType === type.key,
            ',
            // ラジオボタン
            context.fillStyle = isSelected ? '#4CAF50' : '#CCCCCC',
            context.fillRect(x + 10, typeY, 12, 12),
            ',
            // ラベル
            context.fillStyle = '#333333',
            context.font = '14px Arial, sans-serif' }
            context.fillText(type.label, x + 30, typeY); }
        }
    
    /**
     * エクスポート形式選択をレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅'
     */''
    private renderFormatSelection(context: CanvasRenderingContext2D, x: number, y: number, width: number): void { ''
        context.fillStyle = '#333333',
        context.font = 'bold 14px Arial, sans-serif',
        context.textAlign = 'left',
        context.textBaseline = 'top',
        context.fillText('出力形式:', x, y' }

        const formats: Array<{ key: ExportFormat,, label: string }> = [''
            { key: 'json', label: 'JSON形式'
            },''
            { key: 'csv', label: 'CSV形式'
            },]'
            { key: 'txt', label: 'テキスト形式'
            }]
        ];
        ';

        formats.forEach((format, index) => {  ''
            const formatX = x + 10 + (index * 120'),
            const isSelected = this.exportFormat === format.key,
            ',
            // ラジオボタン
            context.fillStyle = isSelected ? '#4CAF50' : '#CCCCCC',
            context.fillRect(formatX, y + 25, 12, 12),
            ',
            // ラベル
            context.fillStyle = '#333333',
            context.font = '14px Arial, sans-serif' }
            context.fillText(format.label, formatX + 20, y + 25); }
        }
    
    /**
     * エクスポートオプションをレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅'
     */''
    private renderExportOptions(context: CanvasRenderingContext2D, x: number, y: number, width: number): void { ''
        context.fillStyle = '#333333',
        context.font = 'bold 14px Arial, sans-serif',
        context.textAlign = 'left',
        context.textBaseline = 'top',
        context.fillText('エクスポートオプション:', x, y',
        
        // メタデータ含有チェックボックス
        const metadataY = y + 25,
        context.fillStyle = this.includeMetadata ? '#4CAF50' : '#CCCCCC',
        context.fillRect(x + 10, metadataY, 12, 12),

        context.fillStyle = '#333333',
        context.font = '14px Arial, sans-serif',
        context.fillText('メタデータを含む', x + 30, metadataY',
        ',
        // タイプ別詳細オプション
        if(this.exportType !== 'all' { }
            this.renderTypeSpecificOptions(context, x, y + 50, width); }
    }
    
    /**
     * タイプ別詳細オプションをレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     */
    private renderTypeSpecificOptions(context: CanvasRenderingContext2D, x: number, y: number, width: number): void { const options = this.exportOptions[this.exportType as keyof ExportOptions],
        if (!options) return,
        
        let optionIndex = 0,
        Object.entries(options).forEach(([key, enabled]) => { '
            const optionX = x + 20 + (optionIndex % 2) * 200,
            const optionY = y + Math.floor(optionIndex / 2) * 20,
            ',
            // チェックボックス
            context.fillStyle = enabled ? '#4CAF50' : '#CCCCCC',
            context.fillRect(optionX, optionY, 10, 10),
            ',
            // ラベル
            context.fillStyle = '#666666',
            context.font = '12px Arial, sans-serif',
            context.fillText(this.getOptionLabel(key), optionX + 18, optionY) }
            optionIndex++; }
        }
    
    /**
     * データプレビューをレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅'
     */''
    private renderDataPreview(context: CanvasRenderingContext2D, x: number, y: number, width: number): void { ''
        context.fillStyle = '#333333',
        context.font = 'bold 14px Arial, sans-serif',
        context.textAlign = 'left',
        context.textBaseline = 'top',
        context.fillText('プレビュー:', x, y',
        ',
        // プレビュー背景
        context.fillStyle = '#F5F5F5',
        context.fillRect(x, y + 20, width, 80),
        context.strokeStyle = '#CCCCCC',
        context.strokeRect(x, y + 20, width, 80),

        if(this.previewData) {

            context.fillStyle = '#666666',
            context.font = '11px monospace',

            const preview = this.formatPreviewData(this.previewData),
            const lines = preview.split('\n).slice(0, 5), // 最初の5行のみ表示'
            
        }
            lines.forEach((line, index) => {  }
                context.fillText(line, x + 5, y + 35 + (index * 12);' }'

            }');

            if(preview.split('\n'.length > 5') { ''
                context.fillText('...', x + 5, y + 35 + (5 * 12) }
        }
    /**
     * オプションラベルを取得
     * @param key - オプションキー
     * @returns ラベル'
     */''
    private getOptionLabel(key: string): string { const labels: Record<string, string> = {''
            username: 'ユーザー名',
            scores: 'スコア',
            achievements: '実績',
            settings: '設定',
            statistics: '統計',
            graphics: 'グラフィック',
            audio: 'オーディオ',
            gameplay: 'ゲームプレイ',
            accessibility: 'アクセシビリティ',
            unlocked: '解除済み',
            progress: '進行状況',
            timestamps: 'タイムスタンプ'
            };
        return labels[key] || key;
    }
    
    /**
     * プレビューデータをフォーマット
     * @param data - プレビューデータ
     * @returns フォーマット済みテキスト
     */'
    private formatPreviewData(data: ExportData): string { ''
        switch(this.exportFormat) {

            case 'json':',
                return JSON.stringify(data, null, 2),
            case 'csv':',
                return this.formatAsCSV(data),
            case 'txt':,
                return this.formatAsText(data),
            default:,
         }
                return JSON.stringify(data, null, 2);
    
    /**
     * CSV形式でフォーマット
     * @param data - データ
     * @returns CSV形式の文字列
     */
    private formatAsCSV(data: ExportData): string { const lines: string[] = [],

        if(data.playerData) {

            lines.push('Type,Key,Value'),
            lines.push(`Player,Username,${data.playerData.username || '}`}
            lines.push(`Player,AP,${data.playerData.ap || 0}`}
            lines.push(`Player,TAP,${data.playerData.tap || 0}`});
        }
        ';

        if (data.playerData?.highScores) { Object.entries(data.playerData.highScores).forEach(([stage, score]) => { }'

                lines.push(`HighScore,${stage},${score}`);
            }

        return lines.join('\n';
    }
    
    /**
     * テキスト形式でフォーマット
     * @param data - データ
     * @returns テキスト形式の文字列
     */ : undefined'
    private formatAsText(data: ExportData): string { const lines: string[] = [],', '
        lines.push(`BubblePop, Export - ${new, Date(}.toISOString(})`);
        lines.push('================================);

        if(data.playerData) {

            lines.push('プレイヤーデータ:'),
            lines.push(`  ユーザー名: ${data.playerData.username || '未設定)`,

            lines.push(`  AP: ${data.playerData.ap || 0 }`} }

            lines.push(`  TAP: ${data.playerData.tap || 0}`},' }

            lines.push('});
        }

        if (data.playerData?.highScores && Object.keys(data.playerData.highScores).length > 0') { : undefined''
            lines.push('ハイスコア:),

            Object.entries(data.playerData.highScores).forEach(([stage, score]) => { }'

                lines.push(`  ${stage}: ${score}`);
            }

        return lines.join('\n);
    }
    
    /**
     * プレビューを生成
     */
    private generatePreview(): void { this.previewData = this.collectExportData(),
        this.showPreview = true }
    /**
     * エクスポートデータを収集
     * @returns エクスポートデータ
     */
    private collectExportData(): ExportData {
        const exportData: ExportData = {}
        if(this.includeMetadata) {
            exportData.metadata = {''
                exportedAt: new Date().toISOString('}

                version: '1.0.0' })'
        }

        ')';
        switch(this.exportType) {

            case 'playerData':',
                exportData.playerData = this.collectPlayerData('''
            case 'gameSettings': ',
                exportData.gameSettings = this.collectGameSettings('',
            case 'achievements':',
                exportData.achievements = this.collectAchievements()',
            case 'all':),
                exportData.playerData = this.collectPlayerData(),
                exportData.gameSettings = this.collectGameSettings(),
                exportData.achievements = this.collectAchievements() }
                break; }
        return exportData;
    }
    
    /**
     * プレイヤーデータを収集
     * @returns プレイヤーデータ
     */
    private collectPlayerData(): PlayerData {
        const playerData = (this.gameEngine.playerData, as PlayerData) || {};
        const options = this.exportOptions.playerData;

        const result: PlayerData = {}''
        if(options.username) result.username = playerData.username || ';
        if (options.scores) result.highScores = playerData.highScores || {};
        if (options.achievements) result.unlockedStages = playerData.unlockedStages || [];
        if(options.settings) {
            result.ap = playerData.ap || 0,
            result.tap = playerData.tap || 0 }
            result.ownedItems = playerData.ownedItems || []; }
        if(options.statistics) {
            result.gamesPlayed = playerData.gamesPlayed || 0,
            result.totalPlayTime = playerData.totalPlayTime || 0 }
            result.bubblesPopped = playerData.bubblesPopped || 0; }
        return result;
    }
    
    /**
     * ゲーム設定を収集
     * @returns ゲーム設定
     */
    private collectGameSettings(): GameSettings {
        const gameSettings = (this.gameEngine.gameSettings, as GameSettings) || {};
        const options = this.exportOptions.gameSettings;
        const result: GameSettings = {}
        if(options.graphics && gameSettings.graphics) {
    
}
            result.graphics = { ...gameSettings.graphics }
        if(options.audio && gameSettings.audio) {
    
}
            result.audio = { ...gameSettings.audio }
        if(options.gameplay && gameSettings.gameplay) {
    
}
            result.gameplay = { ...gameSettings.gameplay }
        if(options.accessibility && gameSettings.accessibility) {
    
}
            result.accessibility = { ...gameSettings.accessibility }
        
        return result;
    }
    
    /**
     * 実績データを収集
     * @returns 実績データ
     */
    private collectAchievements(): { achievements: Achievement[] } { const achievements: Achievement[] = [],
        const options = this.exportOptions.achievements,
        
        if(this.gameEngine.achievementManager) {
        
            const manager = this.gameEngine.achievementManager as AchievementManager,
            const unlockedAchievements = manager.getUnlockedAchievements(),
            
            unlockedAchievements.forEach(achievement => { 
                const, achievementData: Achievement = {)
                    id: achievement.id,
    name: achievement.name),
                    description: achievement.description),
                if (options.unlocked) {
                    achievementData.id = achievement.id
        
         }
                    achievementData.name = achievement.name; }
                    achievementData.description = achievement.description; }
                if(options.progress) {
                    achievementData.progress = achievement.progress || 0 }
                    achievementData.requirement = achievement.requirement || 0; }
                if (options.timestamps) { achievementData.unlockedAt = achievement.unlockedAt }
                achievements.push(achievementData);
            }
        
        return { achievements }
    
    /**
     * エクスポートを実行
     */
    private async executeExport(): Promise<void> { try {
            const exportData = this.collectExportData(),
            const content = this.formatPreviewData(exportData),
            const filename = this.generateFilename(),
            
            await this.downloadFile(content, filename),

            if(this.onResult) {
                this.onResult({''
                    action: 'export',
    data: {
                        type: this.exportType,
    format: this.exportFormat),
                        filename,
             }
                        size: content.length) ;
    }

                ';} catch (error) {
            console.error('Export error:', error',
            alert('エクスポートに失敗しました: ' + (error, as Error).message) }
    }
    
    /**
     * ファイル名を生成
     * @returns ファイル名'
     */'
    private generateFilename(): string { ''
        const date = new Date().toISOString().slice(0, 10),
        const extension = this.exportFormat === 'json' ? 'json' : ',
                         this.exportFormat === 'csv' ? 'csv' : 'txt' }
        return `bubblepop_${this.exportType}_${date}.${extension}`;
    }
    
    /**
     * ファイルをダウンロード
     * @param content - ファイル内容
     * @param filename - ファイル名'
     */''
    private async downloadFile(content: string, filename: string): Promise<void> { ''
        if(typeof, document !== 'undefined') {
            const blob = new Blob([content], { ''
                type: this.exportFormat === 'json' ? 'application/json' : 'text/plain ',
            ',
            const url = URL.createObjectURL(blob),

            const a = document.createElement('a'),
            a.href = url,

            a.download = filename,
            a.style.display = 'none',
            document.body.appendChild(a),
            a.click(),
            document.body.removeChild(a),
         }
            URL.revokeObjectURL(url); }
    }
    
    /**
     * クリーンアップ
     */'
    cleanup(): void { ''
        super.cleanup(' }'