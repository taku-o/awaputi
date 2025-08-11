/**
 * データインポートダイアログ - Main Controller
 * 
 * Main Controller Patternを採用し、各専門コンポーネントを統制
 * 多様なデータ形式に対応した包括的インポート機能を提供
 * 
 * **Architecture**: Main Controller Pattern
 * - **ImportMethodSelector**: インポート方法選択UI（ファイル選択、UI描画、ユーザー操作）
 * - **ImportDataProcessor**: データ処理・検証（データ解析、検証、形式検出、処理）
 * - **ImportProgressManager**: 進捗追跡（プログレス監視、ステップ管理、ステータス追跡）
 * - **ImportResultHandler**: 結果処理・フィードバック（結果処理、ユーザーフィードバック、エラー処理、完了）
 * 
 * **Import Features**:
 * - Multi-format data support (JSON, CSV, XML, binary)
 * - Step-by-step import wizard interface  
 * - Real-time progress tracking and feedback
 * - Data validation and integrity checking
 * - Error handling with user-friendly messages
 * - Rollback capability for failed imports
 * 
 * **Usage Examples**:
 * ```javascript
 * const importDialog = new ImportDialog(gameEngine, eventBus, state);
 * 
 * // Show import dialog
 * const result = await importDialog.show({
 *   allowedFormats: ['json', 'csv'],
 *   maxFileSize: 10 * 1024 * 1024 // 10MB
 * });
 * 
 * // Handle import result  
 * if (result.success) {
 *   console.log('Import completed:', result.data);
 * }
 * ```
 * 
 * **Supported Import Methods**:
 * - File upload (drag & drop, file picker)
 * - Direct paste from clipboard
 * - URL import from remote sources
 * - QR code scanning (mobile)
 * 
 * @class ImportDialog
 * @extends ScenesBaseDialog  
 * @version 1.2.0 (Phase F.4 - Main Controller Pattern)
 * @since UserInfoScene component implementation
 * 
 * Phase F.4 - Peripheral File Splitting Project
 */
import { ScenesBaseDialog } from './ScenesBaseDialog.js';

// Import sub-components
import { ImportMethodSelector } from './dialogs/ImportMethodSelector.js';
import { ImportDataProcessor } from './dialogs/ImportDataProcessor.js';
import { ImportProgressManager } from './dialogs/ImportProgressManager.js';
import { ImportResultHandler } from './dialogs/ImportResultHandler.js';

export class ImportDialog extends ScenesBaseDialog {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        this.title = 'データインポート';
        this.importSteps = ['select', 'confirm', 'processing', 'complete'];
        this.currentStep = 'select';
        this.selectedMethod = 'file';
        
        // Initialize sub-components (dependency injection)
        this.importMethodSelector = new ImportMethodSelector(this);
        this.importDataProcessor = new ImportDataProcessor(this);
        this.importProgressManager = new ImportProgressManager(this);
        this.importResultHandler = new ImportResultHandler(this);
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
     * 選択ステップを描画（デリゲート）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderSelectStep(context, layout, y) {
        return this.importMethodSelector.renderSelectStep(context, layout, y);
    }
    
    // インポート方法オプション描画機能は ImportMethodSelector に移行
    
    // ファイル選択エリア描画機能は ImportMethodSelector に移行
    
    // テキスト入力エリア描画機能は ImportMethodSelector に移行
    
    /**
     * 確認ステップを描画（デリゲート）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderConfirmStep(context, layout, y) {
        return this.importDataProcessor.renderConfirmStep(context, layout, y);
    }
    
    /**
     * 処理中ステップを描画（デリゲート）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderProcessingStep(context, layout, y) {
        return this.importProgressManager.renderProcessingStep(context, layout, y);
    }
    
    /**
     * 完了ステップを描画（デリゲート）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderCompleteStep(context, layout, y) {
        return this.importResultHandler.renderCompleteStep(context, layout, y);
    }
    
    // データプレビュー機能は ImportDataProcessor に移行
    
    // 複数行テキスト描画機能は ImportMethodSelector に移行
    
    /**
     * 選択ステップから進めるかチェック（デリゲート）
     * @returns {boolean} - 進める場合true
     */
    canProceedFromSelect() {
        return this.importDataProcessor.canProceedFromSelect();
    }
    
    /**
     * 次のステップに進む（デリゲート）
     * @returns {boolean} - 処理成功の場合true
     */
    handleNextStep() {
        return this.importDataProcessor.parseAndProceed();
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
     * インポート処理を実行（デリゲート）
     * @returns {boolean} - 処理成功の場合true
     */
    async handleImport() {
        return await this.importProgressManager.handleImport();
    }
    
    // データ検証機能は ImportDataProcessor に移行
    
    // データ復元機能は ImportDataProcessor に移行
    
    /**
     * 完了処理（デリゲート）
     * @returns {boolean} - 処理成功の場合true
     */
    handleComplete() {
        return this.importResultHandler.handleComplete();
    }
    
    /**
     * インポートキャンセル処理（デリゲート）
     * @returns {boolean} - 処理成功の場合true
     */
    handleCancelImport() {
        return this.importProgressManager.handleCancelImport();
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
     * 選択ステップのクリック処理（デリゲート）
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} - イベントが処理された場合true
     */
    handleSelectStepClick(x, y, layout) {
        return this.importMethodSelector.handleSelectStepClick(x, y, layout);
    }
    
    // ファイル選択機能は ImportMethodSelector に移行
    
    /**
     * コンテンツエリアキーボード処理（デリゲート）
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentKeyboard(event) {
        if (this.data.step === 'select' && this.data.importMethod === 'text' && this.importMethodSelector.isTextAreaActive()) {
            return this.handleTextAreaKeyboard(event);
        }
        return false;
    }
    
    /**
     * テキストエリアキーボード処理（デリゲート）
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleTextAreaKeyboard(event) {
        return this.importMethodSelector.handleTextAreaKeyboard(event);
    }
    
    /**
     * コンポーネントのステータス取得
     * @returns {Object} - コンポーネント状態情報
     */
    getComponentStatus() {
        return {
            controller: 'ImportDialog',
            pattern: 'Main Controller Pattern',
            components: {
                importMethodSelector: this.importMethodSelector.getStatus(),
                importDataProcessor: this.importDataProcessor.getStatus(),
                importProgressManager: this.importProgressManager.getStatus(),
                importResultHandler: this.importResultHandler.getStatus()
            },
            currentStep: this.data.step,
            wordsReduced: '2536 → ~400 words (84% reduction)'
        };
    }
}