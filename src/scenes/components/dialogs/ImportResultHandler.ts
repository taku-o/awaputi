/**
 * Import Result Handler Component
 * 
 * インポート結果処理とフィードバック機能を担当
 * Main Controller Patternの一部として設計
 */

export interface ResultType {
    SUCCESS: 'success';
    ERROR: 'error';
    CANCELLED: 'cancelled';
    WARNING: 'warning';
}

export interface FeedbackAnimation {
    color: string;
    icon: string;
    duration: number;
}

export interface ImportStats {
    playerDataImported: boolean;
    statisticsImported: boolean;
    achievementsImported: boolean;
    settingsImported: boolean;
    dataSize: number;
    itemCount: number;
    version: string;
}

export interface ImportResult {
    action: string;
    data: {
        success: boolean;
    };
    method: string;
    error?: string;
    importStats?: ImportStats | null;
    timestamp: string;
    duration: string;
}

export interface Layout {
    contentX: number;
    contentY: number;
    contentWidth: number;
    buttonY: number;
    x: number;
    width: number;
}

export interface ComponentStatus {
    componentType: string;
    supportedResultTypes: string[];
    animationTypes: string[];
    exportFormats: string[];
}

export interface MainController {
    data: {
        success?: boolean;
        error?: string;
        importMethod: string;
        parsedData?: any;
    };
    step: string;
    textSettings: {
        contentFont: string;
        contentColor: string;
    };
}

export class ImportResultHandler {
    private mainController: MainController;
    private canvasContext: CanvasRenderingContext2D | null = null;
    
    // フィードバックアニメーション設定
    private feedbackAnimations: Record<string, FeedbackAnimation> = {
        success: {
            color: '#28a745',
            icon: '✅',
            duration: 3000
        },
        error: {
            color: '#dc3545',
            icon: '❌',
            duration: 5000
        },
        warning: {
            color: '#ffc107',
            icon: '⚠️',
            duration: 4000
        },
        cancelled: {
            color: '#6c757d',
            icon: '⏹️',
            duration: 2000
        }
    };
    
    // UI状態
    private animationStartTime: number = 0;
    private currentResultType: string = 'success';
    
    constructor(mainController: MainController) {
        this.mainController = mainController;
    }
    
    /**
     * インポート結果を処理
     */
    processImportResult(result: ImportResult): void {
        try {
            // 結果タイプを判定
            this.currentResultType = this.determineResultType(result);
            
            // アニメーション開始時間を記録
            this.animationStartTime = Date.now();
            
            // メインコントローラーのデータを更新
            this.updateMainControllerData(result);
            
            // ログ出力
            console.log(`Import result processed: ${this.currentResultType}`, result);
        } catch (error) {
            console.error('Failed to process import result:', error);
            this.currentResultType = 'error';
            this.mainController.data.error = 'Result processing failed';
        }
    }
    
    /**
     * 結果タイプを判定
     */
    private determineResultType(result: ImportResult): string {
        if (result.error) {
            return 'error';
        }
        
        if (!result.data.success) {
            return 'error';
        }
        
        if (result.importStats) {
            // 部分的なインポートの場合は警告
            const hasPartialImport = !result.importStats.playerDataImported ||
                                   !result.importStats.statisticsImported ||
                                   !result.importStats.achievementsImported ||
                                   !result.importStats.settingsImported;
                                   
            if (hasPartialImport) {
                return 'warning';
            }
        }
        
        return 'success';
    }
    
    /**
     * メインコントローラーのデータを更新
     */
    private updateMainControllerData(result: ImportResult): void {
        this.mainController.data.success = result.data.success;
        this.mainController.data.error = result.error;
        this.mainController.data.importMethod = result.method;
        this.mainController.data.parsedData = result.importStats;
    }
    
    /**
     * インポート結果を描画
     */
    render(context: CanvasRenderingContext2D, layout: Layout): void {
        this.canvasContext = context;
        
        try {
            const y = layout.contentY;
            
            switch (this.currentResultType) {
                case 'success':
                    this.renderSuccessResult(context, layout, y);
                    break;
                case 'error':
                    this.renderErrorResult(context, layout, y);
                    break;
                case 'warning':
                    this.renderWarningResult(context, layout, y);
                    break;
                case 'cancelled':
                    this.renderCancelledResult(context, layout, y);
                    break;
                default:
                    this.renderDefaultResult(context, layout, y);
            }
            
            // アクションボタンを描画
            this.renderActionButtons(context, layout);
        } catch (error) {
            console.error('Failed to render import result:', error);
            this.renderErrorFallback(context, layout);
        }
    }
    
    /**
     * 成功結果を描画
     */
    private renderSuccessResult(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        const animation = this.feedbackAnimations.success;
        
        // 成功アイコン (アニメーション効果付き)
        const iconScale = 1 + 0.1 * Math.sin(Date.now() / 200);
        context.save();
        context.translate(layout.x + layout.width / 2, y + 20);
        context.scale(iconScale, iconScale);
        context.font = '32px sans-serif';
        context.fillStyle = animation.color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(animation.icon, 0, 0);
        context.restore();
        
        // 成功メッセージ
        context.fillStyle = animation.color;
        context.font = this.mainController.textSettings.contentFont;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('データのインポートが完了しました！', layout.x + layout.width / 2, y + 60);
        
        // 詳細情報
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.font = '12px sans-serif';
        context.fillText('ゲームを再開してください。', layout.x + layout.width / 2, y + 85);
        
        // 成功統計情報
        this.renderSuccessStats(context, layout, y + 110);
    }
    
    /**
     * エラー結果を描画
     */
    private renderErrorResult(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        const animation = this.feedbackAnimations.error;
        
        // エラーアイコン
        context.font = '32px sans-serif';
        context.fillStyle = animation.color;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(animation.icon, layout.x + layout.width / 2, y);
        
        // エラーメッセージ
        context.fillStyle = animation.color;
        context.font = this.mainController.textSettings.contentFont;
        context.fillText('インポートに失敗しました', layout.x + layout.width / 2, y + 40);
        
        // 詳細エラー情報
        if (this.mainController.data.error) {
            context.font = '12px sans-serif';
            context.fillStyle = this.mainController.textSettings.contentColor;
            const errorText = this.truncateErrorMessage(this.mainController.data.error);
            context.fillText(`エラー: ${errorText}`, layout.x + layout.width / 2, y + 65);
        }
        
        // 対処法の提案
        this.renderTroubleshootingTips(context, layout, y + 90);
    }
    
    /**
     * 警告結果を描画
     */
    private renderWarningResult(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        const animation = this.feedbackAnimations.warning;
        
        // 警告アイコン
        context.font = '32px sans-serif';
        context.fillStyle = animation.color;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(animation.icon, layout.x + layout.width / 2, y);
        
        // 警告メッセージ
        context.fillStyle = animation.color;
        context.font = this.mainController.textSettings.contentFont;
        context.fillText('部分的なインポートが完了', layout.x + layout.width / 2, y + 40);
        
        // 詳細情報
        context.font = '12px sans-serif';
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.fillText('一部のデータをインポートできませんでした', layout.x + layout.width / 2, y + 65);
        
        // 部分インポートの詳細
        this.renderPartialImportDetails(context, layout, y + 90);
    }
    
    /**
     * キャンセル結果を描画
     */
    private renderCancelledResult(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        const animation = this.feedbackAnimations.cancelled;
        
        // キャンセルアイコン
        context.font = '32px sans-serif';
        context.fillStyle = animation.color;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(animation.icon, layout.x + layout.width / 2, y);
        
        // キャンセルメッセージ
        context.fillStyle = animation.color;
        context.font = this.mainController.textSettings.contentFont;
        context.fillText('インポートがキャンセルされました', layout.x + layout.width / 2, y + 40);
        
        // 詳細情報
        context.font = '12px sans-serif';
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.fillText('データは変更されませんでした', layout.x + layout.width / 2, y + 65);
    }
    
    /**
     * デフォルト結果を描画
     */
    private renderDefaultResult(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        context.font = this.mainController.textSettings.contentFont;
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('処理中...', layout.x + layout.width / 2, y + 40);
    }
    
    /**
     * 成功統計を描画
     */
    private renderSuccessStats(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        if (!this.mainController.data.parsedData) return;
        
        const stats = this.mainController.data.parsedData as ImportStats;
        
        context.font = '11px sans-serif';
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'left';
        
        const statsY = y;
        const leftX = layout.x + 20;
        
        // 統計情報を表示
        const statsInfo = [
            `プレイヤーデータ: ${stats.playerDataImported ? '✓' : '✗'}`,
            `統計データ: ${stats.statisticsImported ? '✓' : '✗'}`,
            `実績データ: ${stats.achievementsImported ? '✓' : '✗'}`,
            `設定データ: ${stats.settingsImported ? '✓' : '✗'}`,
            `データサイズ: ${this.formatFileSize(stats.dataSize)}`,
            `アイテム数: ${stats.itemCount.toLocaleString()}`
        ];
        
        statsInfo.forEach((info, index) => {
            context.fillText(info, leftX, statsY + index * 15);
        });
    }
    
    /**
     * トラブルシューティングのヒントを描画
     */
    private renderTroubleshootingTips(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        context.font = '11px sans-serif';
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'left';
        
        const tips = [
            '• ファイルが破損していないか確認してください',
            '• 正しいファイル形式か確認してください',
            '• ファイルサイズが適切か確認してください'
        ];
        
        tips.forEach((tip, index) => {
            context.fillText(tip, layout.x + 20, y + index * 15);
        });
    }
    
    /**
     * 部分インポートの詳細を描画
     */
    private renderPartialImportDetails(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        if (!this.mainController.data.parsedData) return;
        
        const stats = this.mainController.data.parsedData as ImportStats;
        
        context.font = '11px sans-serif';
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'left';
        
        const details = [
            `プレイヤーデータ: ${stats.playerDataImported ? '成功' : '失敗'}`,
            `統計データ: ${stats.statisticsImported ? '成功' : '失敗'}`,
            `実績データ: ${stats.achievementsImported ? '成功' : '失敗'}`,
            `設定データ: ${stats.settingsImported ? '成功' : '失敗'}`
        ];
        
        details.forEach((detail, index) => {
            const color = detail.includes('成功') ? '#28a745' : '#dc3545';
            context.fillStyle = color;
            context.fillText(detail, layout.x + 20, y + index * 15);
        });
    }
    
    /**
     * アクションボタンを描画
     */
    private renderActionButtons(context: CanvasRenderingContext2D, layout: Layout): void {
        const buttonY = layout.buttonY;
        const buttonWidth = 100;
        const buttonHeight = 30;
        const buttonSpacing = 20;
        
        // OKボタン
        const okButtonX = layout.x + layout.width / 2 - buttonWidth - buttonSpacing / 2;
        this.renderButton(context, okButtonX, buttonY, buttonWidth, buttonHeight, 'OK', '#007bff');
        
        // 再試行ボタン（エラーの場合のみ）
        if (this.currentResultType === 'error') {
            const retryButtonX = layout.x + layout.width / 2 + buttonSpacing / 2;
            this.renderButton(context, retryButtonX, buttonY, buttonWidth, buttonHeight, '再試行', '#28a745');
        }
    }
    
    /**
     * ボタンを描画
     */
    private renderButton(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        color: string
    ): void {
        // ボタン背景
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
        
        // ボタンテキスト
        context.fillStyle = '#ffffff';
        context.font = 'bold 12px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, x + width / 2, y + height / 2);
    }
    
    /**
     * エラーフォールバックを描画
     */
    private renderErrorFallback(context: CanvasRenderingContext2D, layout: Layout): void {
        context.fillStyle = '#dc3545';
        context.font = this.mainController.textSettings.contentFont;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('結果の表示中にエラーが発生しました', 
                        layout.x + layout.width / 2, layout.contentY + 50);
    }
    
    /**
     * エラーメッセージを切り詰め
     */
    private truncateErrorMessage(message: string): string {
        const maxLength = 60;
        if (message.length <= maxLength) {
            return message;
        }
        return message.substring(0, maxLength - 3) + '...';
    }
    
    /**
     * ファイルサイズをフォーマット
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * クリック処理
     */
    handleClick(x: number, y: number, layout: Layout): boolean {
        const buttonY = layout.buttonY;
        const buttonWidth = 100;
        const buttonHeight = 30;
        const buttonSpacing = 20;
        
        // OKボタンの判定
        const okButtonX = layout.x + layout.width / 2 - buttonWidth - buttonSpacing / 2;
        if (x >= okButtonX && x <= okButtonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            this.handleOkClick();
            return true;
        }
        
        // 再試行ボタンの判定（エラーの場合のみ）
        if (this.currentResultType === 'error') {
            const retryButtonX = layout.x + layout.width / 2 + buttonSpacing / 2;
            if (x >= retryButtonX && x <= retryButtonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.handleRetryClick();
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * OKボタンクリック処理
     */
    private handleOkClick(): void {
        // ダイアログを閉じる
        console.log('Import result dialog closed');
    }
    
    /**
     * 再試行ボタンクリック処理
     */
    private handleRetryClick(): void {
        // インポートを再実行
        console.log('Import retry requested');
        this.mainController.step = 'file-selection';
    }
    
    /**
     * アニメーションの更新
     */
    update(): void {
        // アニメーション関連の更新処理
        const elapsed = Date.now() - this.animationStartTime;
        const animation = this.feedbackAnimations[this.currentResultType];
        
        if (elapsed > animation.duration) {
            // アニメーション終了
        }
    }
    
    /**
     * コンポーネント状態を取得
     */
    getStatus(): ComponentStatus {
        return {
            componentType: 'ImportResultHandler',
            supportedResultTypes: ['success', 'error', 'warning', 'cancelled'],
            animationTypes: ['bounce', 'fade', 'pulse'],
            exportFormats: ['json', 'text']
        };
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.canvasContext = null;
        this.animationStartTime = 0;
    }
}