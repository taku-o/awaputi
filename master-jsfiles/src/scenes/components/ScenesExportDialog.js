/**
 * データエクスポートダイアログ
 */
import { ScenesBaseDialog } from './ScenesBaseDialog.js';

/**
 * シーン用エクスポートダイアログ
 * ゲーム内でのデータエクスポート機能を提供
 * @extends ScenesBaseDialog
 */
export class ScenesExportDialog extends ScenesBaseDialog {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        // エクスポート設定
        this.exportType = 'playerData'; // 'playerData', 'gameSettings', 'achievements', 'all'
        this.exportFormat = 'json'; // 'json', 'csv', 'txt'
        this.includeMetadata = true;
        
        // エクスポート対象の設定
        this.exportOptions = {
            playerData: {
                username: true,
                scores: true,
                achievements: true,
                settings: true,
                statistics: true
            },
            gameSettings: {
                graphics: true,
                audio: true,
                gameplay: true,
                accessibility: true
            },
            achievements: {
                unlocked: true,
                progress: true,
                timestamps: true
            }
        };
        
        // プレビューデータ
        this.previewData = null;
        this.showPreview = false;
        
        // ボタン設定
        this.setupButtons([
            { text: 'プレビュー', callback: () => this.generatePreview() },
            { text: 'エクスポート', callback: () => this.executeExport() },
            { text: 'キャンセル', callback: () => this.handleCancel() }
        ]);
        
        // レイアウト調整
        this.layout.width = 550;
        this.layout.height = 450;
        
        // 初期プレビュー生成
        this.generatePreview();
    }
    
    /**
     * ダイアログコンテンツをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderContent(context) {
        const contentX = this.layout.x + this.layout.padding;
        const contentY = this.layout.y + this.layout.titleHeight + this.layout.padding;
        const contentWidth = this.layout.width - (this.layout.padding * 2);
        let currentY = contentY;
        
        // エクスポートタイプ選択
        this.renderExportTypeSelection(context, contentX, currentY, contentWidth);
        currentY += 90;
        
        // エクスポート形式選択
        this.renderFormatSelection(context, contentX, currentY, contentWidth);
        currentY += 60;
        
        // エクスポートオプション
        this.renderExportOptions(context, contentX, currentY, contentWidth);
        currentY += 100;
        
        // プレビュー表示
        if (this.showPreview && this.previewData) {
            this.renderDataPreview(context, contentX, currentY, contentWidth);
        }
    }
    
    /**
     * エクスポートタイプ選択をレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     */
    renderExportTypeSelection(context, x, y, width) {
        context.fillStyle = '#333333';
        context.font = 'bold 14px Arial, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('エクスポート対象:', x, y);
        
        const types = [
            { key: 'playerData', label: 'プレイヤーデータ' },
            { key: 'gameSettings', label: 'ゲーム設定' },
            { key: 'achievements', label: '実績データ' },
            { key: 'all', label: '全データ' }
        ];
        
        types.forEach((type, index) => {
            const typeY = y + 25 + (index * 20);
            const isSelected = this.exportType === type.key;
            
            // ラジオボタン
            context.fillStyle = isSelected ? '#4CAF50' : '#CCCCCC';
            context.fillRect(x + 10, typeY, 12, 12);
            
            // ラベル
            context.fillStyle = '#333333';
            context.font = '14px Arial, sans-serif';
            context.fillText(type.label, x + 30, typeY);
        });
    }
    
    /**
     * エクスポート形式選択をレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     */
    renderFormatSelection(context, x, y, width) {
        context.fillStyle = '#333333';
        context.font = 'bold 14px Arial, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('出力形式:', x, y);
        
        const formats = [
            { key: 'json', label: 'JSON形式' },
            { key: 'csv', label: 'CSV形式' },
            { key: 'txt', label: 'テキスト形式' }
        ];
        
        formats.forEach((format, index) => {
            const formatX = x + 10 + (index * 120);
            const isSelected = this.exportFormat === format.key;
            
            // ラジオボタン
            context.fillStyle = isSelected ? '#4CAF50' : '#CCCCCC';
            context.fillRect(formatX, y + 25, 12, 12);
            
            // ラベル
            context.fillStyle = '#333333';
            context.font = '14px Arial, sans-serif';
            context.fillText(format.label, formatX + 20, y + 25);
        });
    }
    
    /**
     * エクスポートオプションをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     */
    renderExportOptions(context, x, y, width) {
        context.fillStyle = '#333333';
        context.font = 'bold 14px Arial, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('エクスポートオプション:', x, y);
        
        // メタデータ含有チェックボックス
        const metadataY = y + 25;
        context.fillStyle = this.includeMetadata ? '#4CAF50' : '#CCCCCC';
        context.fillRect(x + 10, metadataY, 12, 12);
        
        context.fillStyle = '#333333';
        context.font = '14px Arial, sans-serif';
        context.fillText('メタデータを含む', x + 30, metadataY);
        
        // タイプ別詳細オプション
        if (this.exportType !== 'all') {
            this.renderTypeSpecificOptions(context, x, y + 50, width);
        }
    }
    
    /**
     * タイプ別詳細オプションをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     */
    renderTypeSpecificOptions(context, x, y, width) {
        const options = this.exportOptions[this.exportType];
        if (!options) return;
        
        let optionIndex = 0;
        Object.entries(options).forEach(([key, enabled]) => {
            const optionX = x + 20 + (optionIndex % 2) * 200;
            const optionY = y + Math.floor(optionIndex / 2) * 20;
            
            // チェックボックス
            context.fillStyle = enabled ? '#4CAF50' : '#CCCCCC';
            context.fillRect(optionX, optionY, 10, 10);
            
            // ラベル
            context.fillStyle = '#666666';
            context.font = '12px Arial, sans-serif';
            context.fillText(this.getOptionLabel(key), optionX + 18, optionY);
            
            optionIndex++;
        });
    }
    
    /**
     * データプレビューをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     */
    renderDataPreview(context, x, y, width) {
        context.fillStyle = '#333333';
        context.font = 'bold 14px Arial, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('プレビュー:', x, y);
        
        // プレビュー背景
        context.fillStyle = '#F5F5F5';
        context.fillRect(x, y + 20, width, 80);
        context.strokeStyle = '#CCCCCC';
        context.strokeRect(x, y + 20, width, 80);
        
        if (this.previewData) {
            context.fillStyle = '#666666';
            context.font = '11px monospace';
            
            const preview = this.formatPreviewData(this.previewData);
            const lines = preview.split('\n').slice(0, 5); // 最初の5行のみ表示
            
            lines.forEach((line, index) => {
                context.fillText(line, x + 5, y + 35 + (index * 12));
            });
            
            if (preview.split('\n').length > 5) {
                context.fillText('...', x + 5, y + 35 + (5 * 12));
            }
        }
    }
    
    /**
     * オプションラベルを取得
     * @param {string} key - オプションキー
     * @returns {string} ラベル
     */
    getOptionLabel(key) {
        const labels = {
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
     * @param {Object} data - プレビューデータ
     * @returns {string} フォーマット済みテキスト
     */
    formatPreviewData(data) {
        switch (this.exportFormat) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.formatAsCSV(data);
            case 'txt':
                return this.formatAsText(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }
    
    /**
     * CSV形式でフォーマット
     * @param {Object} data - データ
     * @returns {string} CSV形式の文字列
     */
    formatAsCSV(data) {
        const lines = [];
        
        if (data.playerData) {
            lines.push('Type,Key,Value');
            lines.push(`Player,Username,${data.playerData.username || ''}`);
            lines.push(`Player,AP,${data.playerData.ap || 0}`);
            lines.push(`Player,TAP,${data.playerData.tap || 0}`);
        }
        
        if (data.highScores) {
            Object.entries(data.highScores).forEach(([stage, score]) => {
                lines.push(`HighScore,${stage},${score}`);
            });
        }
        
        return lines.join('\n');
    }
    
    /**
     * テキスト形式でフォーマット
     * @param {Object} data - データ
     * @returns {string} テキスト形式の文字列
     */
    formatAsText(data) {
        const lines = [];
        lines.push(`BubblePop Export - ${new Date().toISOString()}`);
        lines.push('================================');
        
        if (data.playerData) {
            lines.push('プレイヤーデータ:');
            lines.push(`  ユーザー名: ${data.playerData.username || '未設定'}`);
            lines.push(`  AP: ${data.playerData.ap || 0}`);
            lines.push(`  TAP: ${data.playerData.tap || 0}`);
            lines.push('');
        }
        
        if (data.highScores && Object.keys(data.highScores).length > 0) {
            lines.push('ハイスコア:');
            Object.entries(data.highScores).forEach(([stage, score]) => {
                lines.push(`  ${stage}: ${score}`);
            });
        }
        
        return lines.join('\n');
    }
    
    /**
     * プレビューを生成
     */
    generatePreview() {
        this.previewData = this.collectExportData();
        this.showPreview = true;
    }
    
    /**
     * エクスポートデータを収集
     * @returns {Object} エクスポートデータ
     */
    collectExportData() {
        const exportData = {};
        
        if (this.includeMetadata) {
            exportData.metadata = {
                exportedAt: new Date().toISOString(),
                exportType: this.exportType,
                format: this.exportFormat,
                version: '1.0.0'
            };
        }
        
        switch (this.exportType) {
            case 'playerData':
                exportData.playerData = this.collectPlayerData();
                break;
            case 'gameSettings':
                exportData.gameSettings = this.collectGameSettings();
                break;
            case 'achievements':
                exportData.achievements = this.collectAchievements();
                break;
            case 'all':
                exportData.playerData = this.collectPlayerData();
                exportData.gameSettings = this.collectGameSettings();
                exportData.achievements = this.collectAchievements();
                break;
        }
        
        return exportData;
    }
    
    /**
     * プレイヤーデータを収集
     * @returns {Object} プレイヤーデータ
     */
    collectPlayerData() {
        const playerData = this.gameEngine.playerData || {};
        const options = this.exportOptions.playerData;
        const result = {};
        
        if (options.username) result.username = playerData.username || '';
        if (options.scores) result.highScores = playerData.highScores || {};
        if (options.achievements) result.unlockedStages = playerData.unlockedStages || [];
        if (options.settings) {
            result.ap = playerData.ap || 0;
            result.tap = playerData.tap || 0;
            result.ownedItems = playerData.ownedItems || [];
        }
        if (options.statistics) {
            result.statistics = {
                gamesPlayed: playerData.gamesPlayed || 0,
                totalPlayTime: playerData.totalPlayTime || 0,
                bubblesPopped: playerData.bubblesPopped || 0
            };
        }
        
        return result;
    }
    
    /**
     * ゲーム設定を収集
     * @returns {Object} ゲーム設定
     */
    collectGameSettings() {
        const gameSettings = this.gameEngine.gameSettings || {};
        const options = this.exportOptions.gameSettings;
        const result = {};
        
        if (options.graphics && gameSettings.graphics) {
            result.graphics = { ...gameSettings.graphics };
        }
        if (options.audio && gameSettings.audio) {
            result.audio = { ...gameSettings.audio };
        }
        if (options.gameplay && gameSettings.gameplay) {
            result.gameplay = { ...gameSettings.gameplay };
        }
        if (options.accessibility && gameSettings.accessibility) {
            result.accessibility = { ...gameSettings.accessibility };
        }
        
        return result;
    }
    
    /**
     * 実績データを収集
     * @returns {Object} 実績データ
     */
    collectAchievements() {
        const achievements = [];
        const options = this.exportOptions.achievements;
        
        if (this.gameEngine.achievementManager) {
            const unlockedAchievements = this.gameEngine.achievementManager.getUnlockedAchievements();
            
            unlockedAchievements.forEach(achievement => {
                const achievementData = {};
                
                if (options.unlocked) {
                    achievementData.id = achievement.id;
                    achievementData.name = achievement.name;
                    achievementData.description = achievement.description;
                }
                if (options.progress) {
                    achievementData.progress = achievement.progress || 0;
                    achievementData.requirement = achievement.requirement || 0;
                }
                if (options.timestamps) {
                    achievementData.unlockedAt = achievement.unlockedAt;
                }
                
                achievements.push(achievementData);
            });
        }
        
        return { achievements };
    }
    
    /**
     * エクスポートを実行
     */
    async executeExport() {
        try {
            const exportData = this.collectExportData();
            const content = this.formatPreviewData(exportData);
            const filename = this.generateFilename();
            
            await this.downloadFile(content, filename);
            
            if (this.onResult) {
                this.onResult({
                    action: 'export',
                    data: {
                        type: this.exportType,
                        format: this.exportFormat,
                        filename,
                        size: content.length
                    }
                });
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('エクスポートに失敗しました: ' + error.message);
        }
    }
    
    /**
     * ファイル名を生成
     * @returns {string} ファイル名
     */
    generateFilename() {
        const date = new Date().toISOString().slice(0, 10);
        const extension = this.exportFormat === 'json' ? 'json' : 
                         this.exportFormat === 'csv' ? 'csv' : 'txt';
        
        return `bubblepop_${this.exportType}_${date}.${extension}`;
    }
    
    /**
     * ファイルをダウンロード
     * @param {string} content - ファイル内容
     * @param {string} filename - ファイル名
     */
    async downloadFile(content, filename) {
        if (typeof document !== 'undefined') {
            const blob = new Blob([content], { 
                type: this.exportFormat === 'json' ? 'application/json' : 'text/plain' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        super.cleanup();
        this.previewData = null;
        this.showPreview = false;
    }
}