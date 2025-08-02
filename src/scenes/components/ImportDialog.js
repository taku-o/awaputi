/**
 * データインポートダイアログ
 */
import { BaseDialog } from './BaseDialog.js';

export class ImportDialog extends BaseDialog {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        this.title = 'データインポート';
        this.importMethods = [
            { id: 'file', name: 'ファイルから読み込み', icon: '📁' },
            { id: 'text', name: 'テキストから貼り付け', icon: '📝' }
        ];
        this.importSteps = ['select', 'confirm', 'processing', 'complete'];
        this.currentStep = 'select';
        this.selectedMethod = 'file';
        this.textAreaActive = false;
        this.cursorPosition = 0;
    }
    
    /**
     * ダイアログの初期化
     * @param {Object} options - 初期化オプション
     */
    async initialize(options = {}) {
        await super.initialize(options);
        
        this.data.step = 'select';
        this.data.importMethod = 'file';
        this.data.importData = '';
        this.data.parsedData = null;
        this.data.error = null;
        this.data.success = false;
        this.data.validationResults = null;
        
        this.currentStep = 'select';
        this.selectedMethod = 'file';
    }
    
    /**
     * ボタンの設定
     */
    setupButtons() {
        switch (this.data.step) {
            case 'select':
                this.buttons = [
                    {
                        text: '次へ',
                        color: '#007BFF',
                        action: () => this.handleNextStep(),
                        get disabled() {
                            return !this.canProceedFromSelect();
                        }
                    },
                    {
                        text: 'キャンセル',
                        color: '#6C757D',
                        action: () => this.handleCancel()
                    }
                ];
                break;
                
            case 'confirm':
                this.buttons = [
                    {
                        text: 'インポート',
                        color: '#28A745',
                        action: () => this.handleImport()
                    },
                    {
                        text: '戻る',
                        color: '#6C757D',
                        action: () => this.handlePreviousStep()
                    },
                    {
                        text: 'キャンセル',
                        color: '#6C757D',
                        action: () => this.handleCancel()
                    }
                ];
                break;
                
            case 'processing':
                this.buttons = [
                    {
                        text: 'キャンセル',
                        color: '#DC3545',
                        action: () => this.handleCancelImport()
                    }
                ];
                break;
                
            case 'complete':
                this.buttons = [
                    {
                        text: '完了',
                        color: '#28A745',
                        action: () => this.handleComplete()
                    }
                ];
                break;
                
            default:
                super.setupButtons();
        }
    }
    
    /**
     * コンテンツを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderContent(context, layout) {
        const contentY = layout.contentY + 50;
        
        // ステップインジケーターを描画
        this.renderStepIndicator(context, layout, contentY - 30);
        
        switch (this.data.step) {
            case 'select':
                this.renderSelectStep(context, layout, contentY);
                break;
            case 'confirm':
                this.renderConfirmStep(context, layout, contentY);
                break;
            case 'processing':
                this.renderProcessingStep(context, layout, contentY);
                break;
            case 'complete':
                this.renderCompleteStep(context, layout, contentY);
                break;
        }
    }
    
    /**
     * ステップインジケーターを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderStepIndicator(context, layout, y) {
        const stepLabels = ['選択', '確認', '処理中', '完了'];
        const stepWidth = layout.contentWidth / stepLabels.length;
        const currentStepIndex = this.importSteps.indexOf(this.data.step);
        
        for (let i = 0; i < stepLabels.length; i++) {
            const stepX = layout.contentX + i * stepWidth + stepWidth / 2;
            const isActive = i === currentStepIndex;
            const isCompleted = i < currentStepIndex;
            
            // ステップ円
            context.fillStyle = isCompleted ? '#28A745' : (isActive ? '#007BFF' : '#DEE2E6');
            context.beginPath();
            context.arc(stepX, y, 12, 0, 2 * Math.PI);
            context.fill();
            
            // ステップ番号
            context.fillStyle = isCompleted || isActive ? '#FFFFFF' : '#6C757D';
            context.font = '12px sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText((i + 1).toString(), stepX, y);
            
            // ステップラベル
            context.fillStyle = this.textSettings.contentColor;
            context.font = '10px sans-serif';
            context.fillText(stepLabels[i], stepX, y + 20);
            
            // 接続線
            if (i < stepLabels.length - 1) {
                const lineStartX = stepX + 12;
                const lineEndX = layout.contentX + (i + 1) * stepWidth + stepWidth / 2 - 12;
                
                context.strokeStyle = isCompleted ? '#28A745' : '#DEE2E6';
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(lineStartX, y);
                context.lineTo(lineEndX, y);
                context.stroke();
            }
        }
    }
    
    /**
     * 選択ステップを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderSelectStep(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        context.fillText('インポート方法を選択してください:', layout.contentX, y);
        
        // インポート方法の選択肢
        for (let i = 0; i < this.importMethods.length; i++) {
            const method = this.importMethods[i];
            const methodY = y + 40 + i * 80;
            const isSelected = this.data.importMethod === method.id;
            
            this.renderMethodOption(context, layout, methodY, method, isSelected);
        }
        
        // ファイル選択またはテキスト入力エリア
        if (this.data.importMethod === 'file') {
            this.renderFileSelection(context, layout, y + 200);
        } else if (this.data.importMethod === 'text') {
            this.renderTextInput(context, layout, y + 200);
        }
    }
    
    /**
     * インポート方法オプションを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     * @param {Object} method - インポート方法
     * @param {boolean} selected - 選択状態
     */
    renderMethodOption(context, layout, y, method, selected) {
        const optionHeight = 60;
        const optionWidth = layout.contentWidth;
        
        // 背景
        context.fillStyle = selected ? '#E3F2FD' : '#F8F9FA';
        this.roundRect(context, layout.contentX, y, optionWidth, optionHeight, 4);
        context.fill();
        
        // 枠線
        context.strokeStyle = selected ? '#2196F3' : '#DEE2E6';
        context.lineWidth = selected ? 2 : 1;
        this.roundRect(context, layout.contentX, y, optionWidth, optionHeight, 4);
        context.stroke();
        
        // アイコン
        context.font = '24px sans-serif';
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(method.icon, layout.contentX + 15, y + optionHeight / 2);
        
        // テキスト
        context.font = this.textSettings.contentFont;
        context.fillText(method.name, layout.contentX + 55, y + optionHeight / 2);
        
        // ラジオボタン
        const radioX = layout.contentX + optionWidth - 30;
        const radioY = y + optionHeight / 2;
        this.renderRadioButton(context, radioX, radioY, selected);
    }
    
    /**
     * ファイル選択エリアを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderFileSelection(context, layout, y) {
        const fileAreaHeight = 80;
        
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('ファイルを選択:', layout.contentX, y);
        
        // ファイルドロップエリア
        const dropY = y + 25;
        context.fillStyle = this.data.importData ? '#E8F5E8' : '#F8F9FA';
        this.roundRect(context, layout.contentX, dropY, layout.contentWidth, fileAreaHeight, 4);
        context.fill();
        
        context.strokeStyle = this.data.importData ? '#28A745' : '#6C757D';
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        this.roundRect(context, layout.contentX, dropY, layout.contentWidth, fileAreaHeight, 4);
        context.stroke();
        context.setLineDash([]);
        
        // ドロップエリアテキスト
        context.fillStyle = this.data.importData ? '#28A745' : '#6C757D';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        if (this.data.importData) {
            context.fillText('✓ ファイルが選択されました', layout.x + layout.width / 2, dropY + fileAreaHeight / 2 - 10);
            context.font = '12px sans-serif';
            context.fillText('クリックして別のファイルを選択', layout.x + layout.width / 2, dropY + fileAreaHeight / 2 + 10);
        } else {
            context.fillText('📁 ファイルをドロップまたはクリックして選択', layout.x + layout.width / 2, dropY + fileAreaHeight / 2);
        }
    }
    
    /**
     * テキスト入力エリアを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderTextInput(context, layout, y) {
        const textAreaHeight = 100;
        
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('JSONデータを貼り付け:', layout.contentX, y);
        
        // テキストエリア
        const textAreaY = y + 25;
        context.fillStyle = this.textAreaActive ? '#FFFFFF' : '#F8F9FA';
        context.fillRect(layout.contentX, textAreaY, layout.contentWidth, textAreaHeight);
        
        context.strokeStyle = this.textAreaActive ? '#007BFF' : '#DEE2E6';
        context.lineWidth = this.textAreaActive ? 2 : 1;
        context.strokeRect(layout.contentX, textAreaY, layout.contentWidth, textAreaHeight);
        
        // テキスト内容
        const displayText = this.data.importData || 'JSONデータを貼り付けてください...';
        context.fillStyle = this.data.importData ? this.textSettings.contentColor : '#999999';
        context.font = '12px monospace';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        // テキストを複数行で描画
        this.renderMultilineText(context, displayText, layout.contentX + 5, textAreaY + 5, layout.contentWidth - 10, textAreaHeight - 10);
    }
    
    /**
     * 確認ステップを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderConfirmStep(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        if (this.data.parsedData) {
            context.fillText('インポートするデータの確認:', layout.contentX, y);
            this.renderDataPreview(context, layout, y + 30);
        } else {
            context.fillStyle = this.textSettings.errorColor;
            context.fillText('データの解析に失敗しました。', layout.contentX, y);
            
            if (this.data.error) {
                context.font = '12px sans-serif';
                context.fillText(`エラー: ${this.data.error}`, layout.contentX, y + 30);
            }
        }
    }
    
    /**
     * 処理中ステップを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderProcessingStep(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        context.fillText('データをインポート中...', layout.x + layout.width / 2, y);
        
        // プログレスバー
        const barWidth = layout.contentWidth * 0.8;
        const barHeight = 20;
        const barX = layout.x + (layout.width - barWidth) / 2;
        const barY = y + 40;
        
        context.fillStyle = '#E9ECEF';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        context.fillStyle = '#007BFF';
        const progress = this.data.importProgress || 0;
        context.fillRect(barX, barY, barWidth * progress, barHeight);
        
        context.strokeStyle = '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
        
        // 処理内容を表示
        const processingText = this.data.processingText || 'データを処理中...';
        context.font = '12px sans-serif';
        context.fillStyle = '#6C757D';
        context.fillText(processingText, layout.x + layout.width / 2, barY + 35);
    }
    
    /**
     * 完了ステップを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderCompleteStep(context, layout, y) {
        context.font = this.textSettings.contentFont;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        if (this.data.success) {
            context.fillStyle = '#28A745';
            context.fillText('✓ データのインポートが完了しました！', layout.x + layout.width / 2, y);
            
            context.fillStyle = this.textSettings.contentColor;
            context.font = '12px sans-serif';
            context.fillText('ゲームを再開してください。', layout.x + layout.width / 2, y + 30);
        } else {
            context.fillStyle = this.textSettings.errorColor;
            context.fillText('✗ インポートに失敗しました', layout.x + layout.width / 2, y);
            
            if (this.data.error) {
                context.font = '12px sans-serif';
                context.fillText(`エラー: ${this.data.error}`, layout.x + layout.width / 2, y + 30);
            }
        }
    }
    
    /**
     * データプレビューを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderDataPreview(context, layout, y) {
        if (!this.data.parsedData) return;
        
        const preview = this.data.parsedData;
        const previewHeight = Math.min(120, layout.buttonY - y - 20);
        
        if (previewHeight <= 0) return;
        
        context.font = '12px sans-serif';
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        let currentY = y;
        
        if (preview.playerData) {
            context.fillText('プレイヤーデータ:', layout.contentX, currentY);
            currentY += 20;
            
            context.font = '11px sans-serif';
            context.fillStyle = '#6C757D';
            context.fillText(`• ユーザー名: ${preview.playerData.username || '(未設定)'}`, layout.contentX + 10, currentY);
            currentY += 15;
            context.fillText(`• AP: ${preview.playerData.ap || 0}`, layout.contentX + 10, currentY);
            currentY += 15;
            context.fillText(`• ハイスコア: ${preview.playerData.highScore || 0}`, layout.contentX + 10, currentY);
            currentY += 20;
        }
        
        if (preview.statistics && currentY < y + previewHeight) {
            context.font = '12px sans-serif';
            context.fillStyle = this.textSettings.contentColor;
            context.fillText('統計データ:', layout.contentX, currentY);
            currentY += 20;
            
            const statsCount = Object.keys(preview.statistics).length;
            context.font = '11px sans-serif';
            context.fillStyle = '#6C757D';
            context.fillText(`• ${statsCount}項目の統計データ`, layout.contentX + 10, currentY);
        }
    }
    
    /**
     * 複数行テキストを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {string} text - 描画するテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} maxWidth - 最大幅
     * @param {number} maxHeight - 最大高さ
     */
    renderMultilineText(context, text, x, y, maxWidth, maxHeight) {
        const lines = text.split('\n');
        const lineHeight = 15;
        let currentY = y;
        
        for (let i = 0; i < lines.length && currentY < y + maxHeight; i++) {
            const line = lines[i];
            const truncatedLine = line.length > 50 ? line.substring(0, 50) + '...' : line;
            context.fillText(truncatedLine, x, currentY);
            currentY += lineHeight;
        }
    }
    
    /**
     * 選択ステップから進めるかチェック
     * @returns {boolean} - 進める場合true
     */
    canProceedFromSelect() {
        if (this.data.importMethod === 'file' && this.data.importData) {
            return true;
        }
        if (this.data.importMethod === 'text' && this.data.importData.trim().length > 0) {
            return true;
        }
        return false;
    }
    
    /**
     * 次のステップに進む
     * @returns {boolean} - 処理成功の場合true
     */
    handleNextStep() {
        if (!this.canProceedFromSelect()) {
            this.data.error = 'インポートするデータを選択してください';
            return false;
        }
        
        // データを解析
        try {
            const parsedData = JSON.parse(this.data.importData);
            this.data.parsedData = parsedData;
            this.data.step = 'confirm';
            this.data.error = null;
            this.setupButtons();
            return true;
        } catch (error) {
            this.data.error = 'JSONデータの形式が正しくありません';
            return false;
        }
    }
    
    /**
     * 前のステップに戻る
     * @returns {boolean} - 処理成功の場合true
     */
    handlePreviousStep() {
        this.data.step = 'select';
        this.data.error = null;
        this.setupButtons();
        return true;
    }
    
    /**
     * インポート処理を実行
     * @returns {boolean} - 処理成功の場合true
     */
    async handleImport() {
        this.data.step = 'processing';
        this.data.importProgress = 0;
        this.data.error = null;
        this.setupButtons();
        
        try {
            // データバリデーション
            this.data.processingText = 'データを検証中...';
            this.data.importProgress = 0.2;
            
            const validationResult = await this.validateImportData(this.data.parsedData);
            if (!validationResult.valid) {
                throw new Error(validationResult.error);
            }
            
            // データ復元
            this.data.processingText = 'データを復元中...';
            this.data.importProgress = 0.6;
            
            await this.restoreData(this.data.parsedData);
            
            this.data.processingText = '完了';
            this.data.importProgress = 1.0;
            this.data.success = true;
            this.data.step = 'complete';
            
        } catch (error) {
            this.data.error = error.message || 'データの復元中にエラーが発生しました';
            this.data.success = false;
            this.data.step = 'complete';
        }
        
        this.setupButtons();
        return true;
    }
    
    /**
     * インポートデータを検証
     * @param {Object} data - 検証するデータ
     * @returns {Object} - 検証結果
     */
    async validateImportData(data) {
        // 基本構造チェック
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'データが正しい形式ではありません' };
        }
        
        // バージョンチェック
        if (!data.version) {
            return { valid: false, error: 'バージョン情報が見つかりません' };
        }
        
        // プレイヤーデータのチェック
        if (data.playerData) {
            const playerData = data.playerData;
            
            if (typeof playerData.username !== 'string' && playerData.username !== null) {
                return { valid: false, error: 'ユーザー名のデータ型が正しくありません' };
            }
            
            if (typeof playerData.ap !== 'number') {
                return { valid: false, error: 'APのデータ型が正しくありません' };
            }
            
            if (typeof playerData.tap !== 'number') {
                return { valid: false, error: 'TAPのデータ型が正しくありません' };
            }
            
            if (typeof playerData.highScore !== 'number') {
                return { valid: false, error: 'ハイスコアのデータ型が正しくありません' };
            }
            
            if (!Array.isArray(playerData.unlockedStages)) {
                return { valid: false, error: 'アンロックステージのデータ型が正しくありません' };
            }
            
            if (!Array.isArray(playerData.ownedItems)) {
                return { valid: false, error: '所有アイテムのデータ型が正しくありません' };
            }
        } else {
            return { valid: false, error: 'プレイヤーデータが見つかりません' };
        }
        
        return { valid: true };
    }
    
    /**
     * データを復元
     * @param {Object} importData - インポートするデータ
     */
    async restoreData(importData) {
        const playerData = this.gameEngine.playerData;
        
        if (importData.playerData) {
            const data = importData.playerData;
            
            if (data.username) playerData.setUsername(data.username);
            if (typeof data.ap === 'number') playerData.addAP(data.ap - playerData.getAP());
            if (typeof data.tap === 'number') playerData.addTotalAP(data.tap - playerData.getTotalAP());
            if (typeof data.highScore === 'number') playerData.setHighScore(data.highScore);
            if (Array.isArray(data.unlockedStages)) {
                for (const stage of data.unlockedStages) {
                    playerData.unlockStage(stage);
                }
            }
            if (Array.isArray(data.ownedItems)) {
                for (const item of data.ownedItems) {
                    playerData.addItem(item);
                }
            }
        }
        
        // 統計データの復元
        if (importData.statistics && this.gameEngine.statisticsManager) {
            this.gameEngine.statisticsManager.importStatistics(importData.statistics);
        }
        
        // 実績データの復元
        if (importData.achievements && this.gameEngine.achievementManager) {
            this.gameEngine.achievementManager.importAchievements(importData.achievements);
        }
    }
    
    /**
     * 完了処理
     * @returns {boolean} - 処理成功の場合true
     */
    handleComplete() {
        if (this.onResult) {
            this.onResult({
                action: 'import',
                data: {
                    success: this.data.success,
                    method: this.data.importMethod,
                    error: this.data.error
                }
            });
        }
        return true;
    }
    
    /**
     * インポートキャンセル処理
     * @returns {boolean} - 処理成功の場合true
     */
    handleCancelImport() {
        this.data.step = 'select';
        this.data.error = null;
        this.data.importProgress = 0;
        this.setupButtons();
        return true;
    }
    
    /**
     * コンテンツエリアクリック処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentClick(x, y, layout) {
        if (this.data.step === 'select') {
            return this.handleSelectStepClick(x, y, layout);
        }
        return false;
    }
    
    /**
     * 選択ステップのクリック処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} - イベントが処理された場合true
     */
    handleSelectStepClick(x, y, layout) {
        const contentY = layout.contentY + 50;
        
        // インポート方法の選択
        for (let i = 0; i < this.importMethods.length; i++) {
            const methodY = contentY + 40 + i * 80;
            if (y >= methodY && y <= methodY + 60) {
                this.data.importMethod = this.importMethods[i].id;
                this.selectedMethod = this.importMethods[i].id;
                this.data.importData = '';
                this.data.error = null;
                return true;
            }
        }
        
        // ファイル選択エリア
        if (this.data.importMethod === 'file') {
            const fileAreaY = contentY + 225;
            if (y >= fileAreaY && y <= fileAreaY + 80) {
                this.handleFileSelection();
                return true;
            }
        }
        
        // テキストエリア
        if (this.data.importMethod === 'text') {
            const textAreaY = contentY + 225;
            if (y >= textAreaY && y <= textAreaY + 100) {
                this.textAreaActive = true;
                return true;
            }
        }
        
        this.textAreaActive = false;
        return false;
    }
    
    /**
     * ファイル選択処理
     */
    handleFileSelection() {
        // ファイル選択ダイアログを模擬
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.data.importData = e.target.result;
                    this.data.error = null;
                };
                reader.onerror = () => {
                    this.data.error = 'ファイルの読み込みに失敗しました';
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    /**
     * コンテンツエリアキーボード処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentKeyboard(event) {
        if (this.data.step === 'select' && this.data.importMethod === 'text' && this.textAreaActive) {
            return this.handleTextAreaKeyboard(event);
        }
        return false;
    }
    
    /**
     * テキストエリアキーボード処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleTextAreaKeyboard(event) {
        const currentText = this.data.importData || '';
        
        switch (event.key) {
            case 'Backspace':
                event.preventDefault();
                this.data.importData = currentText.slice(0, -1);
                this.data.error = null;
                return true;
                
            case 'Enter':
                event.preventDefault();
                this.data.importData = currentText + '\n';
                return true;
                
            default:
                if (event.key.length === 1) {
                    event.preventDefault();
                    this.data.importData = currentText + event.key;
                    this.data.error = null;
                    return true;
                }
        }
        
        return false;
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
}