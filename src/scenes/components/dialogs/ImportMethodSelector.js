/**
 * Import Method Selector Component
 * 
 * インポート方法選択機能を担当
 * Main Controller Patternの一部として設計
 */

export class ImportMethodSelector {
    constructor(mainController) {
        this.mainController = mainController;
        this.importMethods = [
            { id: 'file', name: 'ファイルから読み込み', icon: '📁' },
            { id: 'text', name: 'テキストから貼り付け', icon: '📝' }
        ];
        this.textAreaActive = false;
        this.cursorPosition = 0;
    }

    /**
     * 選択ステップを描画
     */
    renderSelectStep(context, layout, y) {
        context.font = this.mainController.textSettings.contentFont;
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        context.fillText('インポート方法を選択してください:', layout.contentX, y);
        
        // インポート方法の選択肢
        for (let i = 0; i < this.importMethods.length; i++) {
            const method = this.importMethods[i];
            const methodY = y + 40 + i * 80;
            const isSelected = this.mainController.data.importMethod === method.id;
            
            this.renderMethodOption(context, layout, methodY, method, isSelected);
        }
        
        // ファイル選択またはテキスト入力エリア
        if (this.mainController.data.importMethod === 'file') {
            this.renderFileSelection(context, layout, y + 200);
        } else if (this.mainController.data.importMethod === 'text') {
            this.renderTextInput(context, layout, y + 200);
        }
    }

    /**
     * インポート方法オプションを描画
     */
    renderMethodOption(context, layout, y, method, selected) {
        const optionHeight = 60;
        const optionWidth = layout.contentWidth;
        
        // 背景
        context.fillStyle = selected ? '#E3F2FD' : '#F8F9FA';
        this.mainController.roundRect(context, layout.contentX, y, optionWidth, optionHeight, 4);
        context.fill();
        
        // 枠線
        context.strokeStyle = selected ? '#2196F3' : '#DEE2E6';
        context.lineWidth = selected ? 2 : 1;
        this.mainController.roundRect(context, layout.contentX, y, optionWidth, optionHeight, 4);
        context.stroke();
        
        // アイコン
        context.font = '24px sans-serif';
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(method.icon, layout.contentX + 15, y + optionHeight / 2);
        
        // テキスト
        context.font = this.mainController.textSettings.contentFont;
        context.fillText(method.name, layout.contentX + 55, y + optionHeight / 2);
        
        // ラジオボタン
        const radioX = layout.contentX + optionWidth - 30;
        const radioY = y + optionHeight / 2;
        this.renderRadioButton(context, radioX, radioY, selected);
    }

    /**
     * ファイル選択エリアを描画
     */
    renderFileSelection(context, layout, y) {
        const fileAreaHeight = 80;
        
        context.font = this.mainController.textSettings.contentFont;
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('ファイルを選択:', layout.contentX, y);
        
        // ファイルドロップエリア
        const dropY = y + 25;
        context.fillStyle = this.mainController.data.importData ? '#E8F5E8' : '#F8F9FA';
        this.mainController.roundRect(context, layout.contentX, dropY, layout.contentWidth, fileAreaHeight, 4);
        context.fill();
        
        context.strokeStyle = this.mainController.data.importData ? '#28A745' : '#6C757D';
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        this.mainController.roundRect(context, layout.contentX, dropY, layout.contentWidth, fileAreaHeight, 4);
        context.stroke();
        context.setLineDash([]);
        
        // ドロップエリアテキスト
        context.fillStyle = this.mainController.data.importData ? '#28A745' : '#6C757D';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        if (this.mainController.data.importData) {
            context.fillText('✓ ファイルが選択されました', layout.x + layout.width / 2, dropY + fileAreaHeight / 2 - 10);
            context.font = '12px sans-serif';
            context.fillText('クリックして別のファイルを選択', layout.x + layout.width / 2, dropY + fileAreaHeight / 2 + 10);
        } else {
            context.fillText('📁 ファイルをドロップまたはクリックして選択', layout.x + layout.width / 2, dropY + fileAreaHeight / 2);
        }
    }

    /**
     * テキスト入力エリアを描画
     */
    renderTextInput(context, layout, y) {
        const textAreaHeight = 100;
        
        context.font = this.mainController.textSettings.contentFont;
        context.fillStyle = this.mainController.textSettings.contentColor;
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
        const displayText = this.mainController.data.importData || 'JSONデータを貼り付けてください...';
        context.fillStyle = this.mainController.data.importData ? this.mainController.textSettings.contentColor : '#999999';
        context.font = '12px monospace';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        // テキストを複数行で描画
        this.renderMultilineText(context, displayText, layout.contentX + 5, textAreaY + 5, layout.contentWidth - 10, textAreaHeight - 10);
    }

    /**
     * 複数行テキストを描画
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
     * ラジオボタンを描画
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
     * 選択ステップのクリック処理
     */
    handleSelectStepClick(x, y, layout) {
        const contentY = layout.contentY + 50;
        
        // インポート方法の選択
        for (let i = 0; i < this.importMethods.length; i++) {
            const methodY = contentY + 40 + i * 80;
            if (y >= methodY && y <= methodY + 60) {
                this.mainController.data.importMethod = this.importMethods[i].id;
                this.mainController.selectedMethod = this.importMethods[i].id;
                this.mainController.data.importData = '';
                this.mainController.data.error = null;
                return true;
            }
        }
        
        // ファイル選択エリア
        if (this.mainController.data.importMethod === 'file') {
            const fileAreaY = contentY + 225;
            if (y >= fileAreaY && y <= fileAreaY + 80) {
                this.handleFileSelection();
                return true;
            }
        }
        
        // テキストエリア
        if (this.mainController.data.importMethod === 'text') {
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
                    this.mainController.data.importData = e.target.result;
                    this.mainController.data.error = null;
                };
                reader.onerror = () => {
                    this.mainController.data.error = 'ファイルの読み込みに失敗しました';
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    /**
     * テキストエリアキーボード処理
     */
    handleTextAreaKeyboard(event) {
        const currentText = this.mainController.data.importData || '';
        
        switch (event.key) {
            case 'Backspace':
                event.preventDefault();
                this.mainController.data.importData = currentText.slice(0, -1);
                this.mainController.data.error = null;
                return true;
                
            case 'Enter':
                event.preventDefault();
                this.mainController.data.importData = currentText + '\n';
                return true;
                
            default:
                if (event.key.length === 1) {
                    event.preventDefault();
                    this.mainController.data.importData = currentText + event.key;
                    this.mainController.data.error = null;
                    return true;
                }
        }
        
        return false;
    }

    /**
     * 選択ステップから進めるかチェック
     */
    canProceedFromSelect() {
        if (this.mainController.data.importMethod === 'file' && this.mainController.data.importData) {
            return true;
        }
        if (this.mainController.data.importMethod === 'text' && this.mainController.data.importData.trim().length > 0) {
            return true;
        }
        return false;
    }

    /**
     * インポート方法の取得
     */
    getImportMethods() {
        return this.importMethods;
    }

    /**
     * テキストエリアの状態管理
     */
    setTextAreaActive(active) {
        this.textAreaActive = active;
    }

    /**
     * テキストエリアがアクティブかチェック
     */
    isTextAreaActive() {
        return this.textAreaActive;
    }

    /**
     * カーソル位置の設定
     */
    setCursorPosition(position) {
        this.cursorPosition = position;
    }

    /**
     * カーソル位置の取得
     */
    getCursorPosition() {
        return this.cursorPosition;
    }

    /**
     * ファイル拡張子の検証
     */
    validateFileExtension(filename) {
        const allowedExtensions = ['.json', '.txt'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return allowedExtensions.includes(extension);
    }

    /**
     * ドラッグ&ドロップサポートの確認
     */
    supportsDragAndDrop() {
        return 'FileReader' in window && 'File' in window && 'FileList' in window;
    }

    /**
     * ステータス取得
     */
    getStatus() {
        return {
            componentType: 'ImportMethodSelector',
            supportedMethods: this.importMethods.map(method => method.id),
            textAreaActive: this.textAreaActive,
            dragDropSupport: this.supportsDragAndDrop()
        };
    }
}