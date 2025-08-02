/**
 * データエクスポートダイアログ
 */
import { BaseDialog } from './BaseDialog.js';

export class ExportDialog extends BaseDialog {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        this.title = 'データエクスポート';
        this.exportFormats = [
            { id: 'json', name: 'JSON形式', extension: 'json' },
            { id: 'txt', name: 'テキスト形式', extension: 'txt' }
        ];
        this.selectedFormat = 'json';
        this.exportInProgress = false;
    }
    
    /**
     * ダイアログの初期化
     * @param {Object} options - 初期化オプション
     */
    async initialize(options = {}) {
        await super.initialize(options);
        
        this.data.exportData = null;
        this.data.error = null;
        this.data.exportType = options.exportType || 'playerData'; // 'playerData' or 'statistics'
        this.selectedFormat = options.format || 'json';
        
        // エクスポートオプション
        this.data.options = {
            includeMetadata: true,
            includeStatistics: this.data.exportType === 'playerData',
            includeAchievements: this.data.exportType === 'playerData',
            anonymizeData: false,
            compressData: false
        };
        
        // エクスポート実行
        await this.performExport();
    }
    
    /**
     * ボタンの設定
     */
    setupButtons() {
        this.buttons = [
            {
                text: 'ダウンロード',
                color: '#28A745',
                action: () => this.handleDownload(),
                get disabled() {
                    return !this.data.exportData || this.exportInProgress;
                }
            },
            {
                text: 'コピー',
                color: '#17A2B8',
                action: () => this.handleCopy(),
                get disabled() {
                    return !this.data.exportData || this.exportInProgress;
                }
            },
            {
                text: '閉じる',
                color: '#6C757D',
                action: () => this.handleCancel()
            }
        ];
    }
    
    /**
     * コンテンツを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderContent(context, layout) {
        const contentY = layout.contentY + 50;
        
        if (this.exportInProgress) {
            this.renderProgress(context, layout, contentY);
        } else if (this.data.exportData) {
            this.renderExportResult(context, layout, contentY);
        } else {
            this.renderExportOptions(context, layout, contentY);
        }
    }
    
    /**
     * エクスポート進行状況を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderProgress(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        context.fillText('データをエクスポート中...', layout.x + layout.width / 2, y);
        
        // プログレスバー
        const barWidth = layout.contentWidth * 0.8;
        const barHeight = 20;
        const barX = layout.x + (layout.width - barWidth) / 2;
        const barY = y + 40;
        
        // プログレスバー背景
        context.fillStyle = '#E9ECEF';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // プログレスバー進行
        context.fillStyle = '#007BFF';
        const progress = this.data.exportProgress || 0;
        context.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // プログレスバー枠線
        context.strokeStyle = '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    /**
     * エクスポート結果を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderExportResult(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        // エクスポート成功メッセージ
        context.fillText('データのエクスポートが完了しました。', layout.contentX, y);
        
        // エクスポート情報
        const exportInfo = this.getExportInfo();
        let infoY = y + 30;
        
        for (const info of exportInfo) {
            context.fillText(`• ${info}`, layout.contentX + 10, infoY);
            infoY += 20;
        }
        
        // データプレビュー
        this.renderDataPreview(context, layout, infoY + 10);
    }
    
    /**
     * エクスポートオプションを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderExportOptions(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        context.fillText('エクスポート設定:', layout.contentX, y);
        
        // フォーマット選択
        this.renderFormatSelection(context, layout, y + 30);
        
        // オプション選択
        this.renderOptionCheckboxes(context, layout, y + 80);
    }
    
    /**
     * フォーマット選択を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderFormatSelection(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        context.fillText('ファイル形式:', layout.contentX, y);
        
        for (let i = 0; i < this.exportFormats.length; i++) {
            const format = this.exportFormats[i];
            const radioX = layout.contentX + 20;
            const radioY = y + 25 + i * 25;
            const isSelected = this.selectedFormat === format.id;
            
            // ラジオボタン
            this.renderRadioButton(context, radioX, radioY, isSelected);
            
            // ラベル
            context.fillText(format.name, radioX + 25, radioY - 5);
        }
    }
    
    /**
     * オプションチェックボックスを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderOptionCheckboxes(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        context.fillText('エクスポートオプション:', layout.contentX, y);
        
        const options = [
            { key: 'includeMetadata', label: 'メタデータを含める' },
            { key: 'includeStatistics', label: '統計データを含める' },
            { key: 'includeAchievements', label: '実績データを含める' },
            { key: 'anonymizeData', label: 'データを匿名化' },
            { key: 'compressData', label: 'データを圧縮' }
        ];
        
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const checkX = layout.contentX + 20;
            const checkY = y + 25 + i * 25;
            const isChecked = this.data.options[option.key];
            
            // チェックボックス
            this.renderCheckbox(context, checkX, checkY, isChecked);
            
            // ラベル
            context.fillText(option.label, checkX + 25, checkY - 5);
        }
    }
    
    /**
     * データプレビューを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderDataPreview(context, layout, y) {
        if (!this.data.exportData) return;
        
        const previewHeight = Math.min(100, layout.buttonY - y - 20);
        if (previewHeight <= 0) return;
        
        context.font = '12px monospace';
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        // プレビューエリアの背景
        context.fillStyle = '#F8F9FA';
        context.fillRect(layout.contentX, y, layout.contentWidth, previewHeight);
        
        context.strokeStyle = '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(layout.contentX, y, layout.contentWidth, previewHeight);
        
        // データの最初の数行を表示
        context.fillStyle = '#495057';
        const lines = this.data.exportData.split('\n').slice(0, Math.floor(previewHeight / 15));
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const truncatedLine = line.length > 60 ? line.substring(0, 60) + '...' : line;
            context.fillText(truncatedLine, layout.contentX + 5, y + 5 + i * 15);
        }
    }
    
    /**
     * ラジオボタンを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {boolean} selected - 選択状態
     */
    renderRadioButton(context, x, y, selected) {
        const radius = 8;
        
        // 外円
        context.strokeStyle = '#6C757D';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.stroke();
        
        // 内円（選択時）
        if (selected) {
            context.fillStyle = '#007BFF';
            context.beginPath();
            context.arc(x, y, radius - 3, 0, 2 * Math.PI);
            context.fill();
        }
    }
    
    /**
     * チェックボックスを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {boolean} checked - チェック状態
     */
    renderCheckbox(context, x, y, checked) {
        const size = 16;
        
        // ボックス
        context.fillStyle = checked ? '#007BFF' : '#FFFFFF';
        context.fillRect(x - size/2, y - size/2, size, size);
        
        context.strokeStyle = '#6C757D';
        context.lineWidth = 1;
        context.strokeRect(x - size/2, y - size/2, size, size);
        
        // チェックマーク
        if (checked) {
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(x - 4, y);
            context.lineTo(x - 1, y + 3);
            context.lineTo(x + 4, y - 2);
            context.stroke();
        }
    }
    
    /**
     * エクスポート処理を実行
     */
    async performExport() {
        try {
            this.exportInProgress = true;
            this.data.exportProgress = 0;
            
            // データを取得
            let exportData;
            if (this.data.exportType === 'statistics') {
                exportData = await this.exportStatisticsData();
            } else {
                exportData = await this.exportPlayerData();
            }
            
            this.data.exportProgress = 0.5;
            
            // フォーマットに応じて変換
            this.data.exportData = this.formatExportData(exportData);
            
            this.data.exportProgress = 1.0;
            this.exportInProgress = false;
            
        } catch (error) {
            this.data.error = 'エクスポートに失敗しました';
            this.exportInProgress = false;
            console.error('Export error:', error);
        }
    }
    
    /**
     * プレイヤーデータをエクスポート
     * @returns {Object} - エクスポートデータ
     */
    async exportPlayerData() {
        const playerData = this.gameEngine.playerData;
        const data = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            playerData: {
                username: this.data.options.anonymizeData ? '匿名ユーザー' : playerData.getUsername(),
                ap: playerData.getAP(),
                tap: playerData.getTotalAP(),
                highScore: playerData.getHighScore(),
                unlockedStages: playerData.getUnlockedStages(),
                ownedItems: playerData.getOwnedItems()
            }
        };
        
        if (this.data.options.includeStatistics && this.gameEngine.statisticsManager) {
            data.statistics = this.gameEngine.statisticsManager.getAllStatistics();
        }
        
        if (this.data.options.includeAchievements && this.gameEngine.achievementManager) {
            data.achievements = this.gameEngine.achievementManager.getAchievements();
        }
        
        if (this.data.options.includeMetadata) {
            data.metadata = {
                gameVersion: this.gameEngine.version || '1.0.0',
                exportType: 'playerData',
                dataCount: Object.keys(data.playerData).length
            };
        }
        
        return data;
    }
    
    /**
     * 統計データをエクスポート
     * @returns {Object} - エクスポートデータ
     */
    async exportStatisticsData() {
        const statisticsManager = this.gameEngine.statisticsManager;
        if (!statisticsManager) {
            throw new Error('Statistics manager not available');
        }
        
        const data = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            statistics: statisticsManager.getAllStatistics()
        };
        
        if (this.data.options.includeMetadata) {
            data.metadata = {
                gameVersion: this.gameEngine.version || '1.0.0',
                exportType: 'statistics',
                statisticsCount: Object.keys(data.statistics).length
            };
        }
        
        return data;
    }
    
    /**
     * エクスポートデータをフォーマット
     * @param {Object} data - エクスポートデータ
     * @returns {string} - フォーマットされたデータ
     */
    formatExportData(data) {
        switch (this.selectedFormat) {
            case 'json':
                return this.data.options.compressData 
                    ? JSON.stringify(data)
                    : JSON.stringify(data, null, 2);
                    
            case 'txt':
                return this.convertToTextFormat(data);
                
            default:
                return JSON.stringify(data, null, 2);
        }
    }
    
    /**
     * データをテキスト形式に変換
     * @param {Object} data - 変換するデータ
     * @returns {string} - テキスト形式のデータ
     */
    convertToTextFormat(data) {
        let text = '=== Awaputi Game Data Export ===\n\n';
        text += `Export Date: ${data.exportDate}\n`;
        text += `Version: ${data.version}\n\n`;
        
        if (data.playerData) {
            text += '--- Player Data ---\n';
            text += `Username: ${data.playerData.username}\n`;
            text += `AP: ${data.playerData.ap}\n`;
            text += `Total AP: ${data.playerData.tap}\n`;
            text += `High Score: ${data.playerData.highScore}\n`;
            text += `Unlocked Stages: ${data.playerData.unlockedStages?.join(', ') || 'None'}\n`;
            text += `Owned Items: ${data.playerData.ownedItems?.join(', ') || 'None'}\n\n`;
        }
        
        if (data.statistics) {
            text += '--- Statistics ---\n';
            for (const [key, value] of Object.entries(data.statistics)) {
                text += `${key}: ${value}\n`;
            }
            text += '\n';
        }
        
        if (data.achievements) {
            text += '--- Achievements ---\n';
            for (const [id, achievement] of Object.entries(data.achievements)) {
                text += `${achievement.name}: ${achievement.unlocked ? 'Unlocked' : 'Locked'}\n`;
            }
        }
        
        return text;
    }
    
    /**
     * エクスポート情報を取得
     * @returns {Array<string>} - エクスポート情報の配列
     */
    getExportInfo() {
        const info = [];
        
        info.push(`形式: ${this.exportFormats.find(f => f.id === this.selectedFormat)?.name || 'Unknown'}`);
        
        if (this.data.exportData) {
            const sizeKB = Math.round(this.data.exportData.length / 1024 * 100) / 100;
            info.push(`サイズ: ${sizeKB} KB`);
        }
        
        const optionCount = Object.values(this.data.options).filter(Boolean).length;
        info.push(`オプション: ${optionCount}個有効`);
        
        return info;
    }
    
    /**
     * ダウンロード処理
     * @returns {boolean} - 処理成功の場合true
     */
    handleDownload() {
        if (!this.data.exportData) {
            this.data.error = 'エクスポートデータがありません';
            return false;
        }
        
        try {
            const format = this.exportFormats.find(f => f.id === this.selectedFormat);
            const filename = `awaputi_${this.data.exportType}_${new Date().toISOString().split('T')[0]}.${format.extension}`;
            
            // ダウンロード用のBlobを作成
            const blob = new Blob([this.data.exportData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            // 仮想的なダウンロードリンクを作成
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (this.onResult) {
                this.onResult({
                    action: 'download',
                    data: { filename, format: this.selectedFormat }
                });
            }
            
            return true;
        } catch (error) {
            this.data.error = 'ダウンロードに失敗しました';
            console.error('Download error:', error);
            return false;
        }
    }
    
    /**
     * クリップボードコピー処理
     * @returns {boolean} - 処理成功の場合true
     */
    async handleCopy() {
        if (!this.data.exportData) {
            this.data.error = 'エクスポートデータがありません';
            return false;
        }
        
        try {
            await navigator.clipboard.writeText(this.data.exportData);
            
            if (this.onResult) {
                this.onResult({
                    action: 'copy',
                    data: { format: this.selectedFormat }
                });
            }
            
            return true;
        } catch (error) {
            this.data.error = 'クリップボードへのコピーに失敗しました';
            console.error('Copy error:', error);
            return false;
        }
    }
    
    /**
     * コンテンツエリアクリック処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentClick(x, y, layout) {
        if (this.exportInProgress || this.data.exportData) {
            return false;
        }
        
        const contentY = layout.contentY + 50;
        
        // フォーマット選択のクリック判定
        const formatY = contentY + 55;
        for (let i = 0; i < this.exportFormats.length; i++) {
            const radioY = formatY + i * 25;
            if (y >= radioY - 10 && y <= radioY + 10) {
                this.selectedFormat = this.exportFormats[i].id;
                return true;
            }
        }
        
        // オプションのクリック判定
        const optionY = contentY + 105;
        const options = ['includeMetadata', 'includeStatistics', 'includeAchievements', 'anonymizeData', 'compressData'];
        for (let i = 0; i < options.length; i++) {
            const checkY = optionY + i * 25;
            if (y >= checkY - 10 && y <= checkY + 10) {
                this.data.options[options[i]] = !this.data.options[options[i]];
                return true;
            }
        }
        
        return false;
    }
}