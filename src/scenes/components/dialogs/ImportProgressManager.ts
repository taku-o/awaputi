/**
 * Import Progress Manager Component
 * 
 * インポート進捗管理機能を担当
 * Main Controller Patternの一部として設計
 */

export interface ProgressStep {
    id: string;
    label: string;
    duration: number;
}

export interface Layout {
    contentX: number;
    contentY: number;
    contentWidth: number;
    buttonY: number;
    x: number;
    width: number;
}

export interface ProgressStatus {
    currentStep: number;
    stepProgress: number;
    overallProgress: number;
    currentStepLabel: string;
    cancelled: boolean;
}

export interface ComponentStatus {
    componentType: string;
    totalSteps: number;
    currentStep: number;
    stepProgress: number;
    overallProgress: number;
    cancelled: boolean;
    estimatedTimeRemaining: number;
}

export interface MainController {
    data: {
        step: string;
        importProgress: number;
        error?: string;
        processingText?: string;
        success?: boolean;
        parsedData?: any;
    };
    textSettings: {
        contentFont: string;
        contentColor: string;
    };
    importDataProcessor: {
        validateImportData(data: any): Promise<{ valid: boolean; error?: string }>;
        checkDataIntegrity(data: any): { valid: boolean; issues: string[] };
        restoreData(data: any): Promise<void>;
    };
    setupButtons(): void;
}

export class ImportProgressManager {
    private mainController: MainController;
    private progressSteps: ProgressStep[];
    private currentStepIndex: number;
    private stepProgress: number;
    private cancelled: boolean;

    constructor(mainController: MainController) {
        this.mainController = mainController;
        this.progressSteps = [
            { id: 'validation', label: 'データを検証中...', duration: 0.3 },
            { id: 'parsing', label: 'データを解析中...', duration: 0.2 },
            { id: 'restoration', label: 'データを復元中...', duration: 0.4 },
            { id: 'completion', label: '完了', duration: 0.1 }
        ];
        this.currentStepIndex = 0;
        this.stepProgress = 0;
        this.cancelled = false;
    }

    /**
     * 処理中ステップを描画
     */
    renderProcessingStep(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        context.font = this.mainController.textSettings.contentFont;
        context.fillStyle = this.mainController.textSettings.contentColor;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        context.fillText('データをインポート中...', layout.x + layout.width / 2, y);
        
        // プログレスバー
        const barWidth = layout.contentWidth * 0.8;
        const barHeight = 20;
        const barX = layout.x + (layout.width - barWidth) / 2;
        const barY = y + 40;
        
        this.renderProgressBar(context, barX, barY, barWidth, barHeight);
        
        // 処理内容を表示
        const processingText = this.mainController.data.processingText || 'データを処理中...';
        context.font = '12px sans-serif';
        context.fillStyle = '#6C757D';
        context.fillText(processingText, layout.x + layout.width / 2, barY + 35);
        
        // 詳細ステップを表示
        this.renderDetailedProgress(context, layout, barY + 60);
    }

    /**
     * プログレスバーを描画
     */
    renderProgressBar(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        // 背景
        context.fillStyle = '#E9ECEF';
        context.fillRect(x, y, width, height);
        
        // 進捗
        context.fillStyle = this.cancelled ? '#DC3545' : '#007BFF';
        const progress = this.mainController.data.importProgress || 0;
        context.fillRect(x, y, width * progress, height);
        
        // 枠線
        context.strokeStyle = '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
        
        // パーセンテージ表示
        context.fillStyle = '#FFFFFF';
        context.font = '11px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const percentage = Math.round(progress * 100);
        context.fillText(`${percentage}%`, x + width / 2, y + height / 2);
    }

    /**
     * 詳細進捗を描画
     */
    renderDetailedProgress(context: CanvasRenderingContext2D, layout: Layout, y: number): void {
        const stepHeight = 25;
        const maxSteps = Math.min(this.progressSteps.length, 4); // 最大4ステップ表示
        
        for (let i = 0; i < maxSteps; i++) {
            const step = this.progressSteps[i];
            const stepY = y + i * stepHeight;
            const isCurrentStep = i === this.currentStepIndex;
            const isCompleted = i < this.currentStepIndex;
            
            // ステップアイコン
            const iconX = layout.contentX + 20;
            this.renderStepIcon(context, iconX, stepY + 10, isCompleted, isCurrentStep);
            
            // ステップテキスト
            context.font = '12px sans-serif';
            context.fillStyle = isCompleted ? '#28A745' : isCurrentStep ? this.mainController.textSettings.contentColor : '#6C757D';
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            context.fillText(step.label, iconX + 25, stepY + 10);
            
            // 現在のステップの小さなプログレスバー
            if (isCurrentStep && this.stepProgress > 0) {
                const miniBarWidth = 100;
                const miniBarHeight = 3;
                const miniBarX = iconX + 25;
                const miniBarY = stepY + 18;
                
                context.fillStyle = '#E9ECEF';
                context.fillRect(miniBarX, miniBarY, miniBarWidth, miniBarHeight);
                
                context.fillStyle = '#007BFF';
                context.fillRect(miniBarX, miniBarY, miniBarWidth * this.stepProgress, miniBarHeight);
            }
        }
    }

    /**
     * ステップアイコンを描画
     */
    renderStepIcon(context: CanvasRenderingContext2D, x: number, y: number, completed: boolean, current: boolean): void {
        const radius = 8;
        
        if (completed) {
            // 完了アイコン（チェックマーク）
            context.fillStyle = '#28A745';
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(x - 3, y);
            context.lineTo(x - 1, y + 2);
            context.lineTo(x + 3, y - 2);
            context.stroke();
        } else if (current) {
            // 現在のステップ（回転する円）
            context.fillStyle = '#007BFF';
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            
            // 回転アニメーション効果
            const angle = (Date.now() / 100) % (2 * Math.PI);
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.beginPath();
            context.arc(x, y, radius - 2, angle, angle + Math.PI);
            context.stroke();
        } else {
            // 未完了ステップ
            context.fillStyle = '#E9ECEF';
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            
            context.strokeStyle = '#DEE2E6';
            context.lineWidth = 1;
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.stroke();
        }
    }

    /**
     * インポート処理を実行
     */
    async handleImport(): Promise<boolean> {
        this.mainController.data.step = 'processing';
        this.mainController.data.importProgress = 0;
        this.mainController.data.error = undefined;
        this.cancelled = false;
        this.currentStepIndex = 0;
        this.stepProgress = 0;
        this.mainController.setupButtons();
        
        try {
            // 各ステップを順番に実行
            for (let i = 0; i < this.progressSteps.length; i++) {
                if (this.cancelled) {
                    throw new Error('インポートがキャンセルされました');
                }
                
                this.currentStepIndex = i;
                const step = this.progressSteps[i];
                
                this.mainController.data.processingText = step.label;
                
                await this.executeStep(step, i);
                
                if (this.cancelled) {
                    throw new Error('インポートがキャンセルされました');
                }
            }
            
            this.mainController.data.processingText = '完了';
            this.mainController.data.importProgress = 1.0;
            this.mainController.data.success = true;
            this.mainController.data.step = 'complete';
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'データの復元中にエラーが発生しました';
            this.mainController.data.error = errorMessage;
            this.mainController.data.success = false;
            this.mainController.data.step = 'complete';
        }
        
        this.mainController.setupButtons();
        return true;
    }

    /**
     * 個別ステップを実行
     */
    private async executeStep(step: ProgressStep, stepIndex: number): Promise<void> {
        const baseProgress = stepIndex / this.progressSteps.length;
        const stepWeight = step.duration;
        
        switch (step.id) {
            case 'validation':
                await this.executeValidationStep(baseProgress, stepWeight);
                break;
            case 'parsing':
                await this.executeParsingStep(baseProgress, stepWeight);
                break;
            case 'restoration':
                await this.executeRestorationStep(baseProgress, stepWeight);
                break;
            case 'completion':
                await this.executeCompletionStep(baseProgress, stepWeight);
                break;
        }
    }

    /**
     * データ検証ステップを実行
     */
    private async executeValidationStep(baseProgress: number, stepWeight: number): Promise<void> {
        this.stepProgress = 0;
        
        // データバリデーション
        for (let i = 0; i <= 10; i++) {
            if (this.cancelled) return;
            
            this.stepProgress = i / 10;
            this.mainController.data.importProgress = baseProgress + (stepWeight * this.stepProgress);
            
            await this.delay(50);
        }
        
        const validationResult = await this.mainController.importDataProcessor.validateImportData(this.mainController.data.parsedData);
        if (!validationResult.valid) {
            throw new Error(validationResult.error);
        }
    }

    /**
     * データ解析ステップを実行
     */
    private async executeParsingStep(baseProgress: number, stepWeight: number): Promise<void> {
        this.stepProgress = 0;
        
        // データ構造解析
        for (let i = 0; i <= 10; i++) {
            if (this.cancelled) return;
            
            this.stepProgress = i / 10;
            this.mainController.data.importProgress = baseProgress + (stepWeight * this.stepProgress);
            
            await this.delay(30);
        }
        
        // データの完全性チェック
        const integrityCheck = this.mainController.importDataProcessor.checkDataIntegrity(this.mainController.data.parsedData);
        if (!integrityCheck.valid && integrityCheck.issues.length > 0) {
            console.warn('Data integrity issues:', integrityCheck.issues);
        }
    }

    /**
     * データ復元ステップを実行
     */
    private async executeRestorationStep(baseProgress: number, stepWeight: number): Promise<void> {
        this.stepProgress = 0;
        
        const totalSubSteps = 20;
        
        for (let i = 0; i <= totalSubSteps; i++) {
            if (this.cancelled) return;
            
            this.stepProgress = i / totalSubSteps;
            this.mainController.data.importProgress = baseProgress + (stepWeight * this.stepProgress);
            
            // 実際のデータ復元処理（中間段階で実行）
            if (i === Math.floor(totalSubSteps / 2)) {
                await this.mainController.importDataProcessor.restoreData(this.mainController.data.parsedData);
            }
            
            await this.delay(100);
        }
    }

    /**
     * 完了ステップを実行
     */
    private async executeCompletionStep(baseProgress: number, stepWeight: number): Promise<void> {
        this.stepProgress = 0;
        
        for (let i = 0; i <= 5; i++) {
            if (this.cancelled) return;
            
            this.stepProgress = i / 5;
            this.mainController.data.importProgress = baseProgress + (stepWeight * this.stepProgress);
            
            await this.delay(200);
        }
    }

    /**
     * インポートキャンセル処理
     */
    handleCancelImport(): boolean {
        this.cancelled = true;
        this.mainController.data.step = 'select';
        this.mainController.data.error = undefined;
        this.mainController.data.importProgress = 0;
        this.currentStepIndex = 0;
        this.stepProgress = 0;
        this.mainController.setupButtons();
        return true;
    }

    /**
     * 進捗の手動設定
     */
    setProgress(stepIndex: number, stepProgress: number, overallProgress: number): void {
        this.currentStepIndex = Math.max(0, Math.min(stepIndex, this.progressSteps.length - 1));
        this.stepProgress = Math.max(0, Math.min(stepProgress, 1));
        this.mainController.data.importProgress = Math.max(0, Math.min(overallProgress, 1));
    }

    /**
     * 現在の進捗状況を取得
     */
    getProgress(): ProgressStatus {
        return {
            currentStep: this.currentStepIndex,
            stepProgress: this.stepProgress,
            overallProgress: this.mainController.data.importProgress || 0,
            currentStepLabel: this.progressSteps[this.currentStepIndex]?.label || '',
            cancelled: this.cancelled
        };
    }

    /**
     * 進捗をリセット
     */
    resetProgress(): void {
        this.currentStepIndex = 0;
        this.stepProgress = 0;
        this.cancelled = false;
        this.mainController.data.importProgress = 0;
        this.mainController.data.processingText = '';
    }

    /**
     * 遅延ユーティリティ
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 進捗ステップの追加
     */
    addProgressStep(id: string, label: string, duration: number): void {
        this.progressSteps.push({ id, label, duration });
    }

    /**
     * 進捗ステップの削除
     */
    removeProgressStep(id: string): void {
        this.progressSteps = this.progressSteps.filter(step => step.id !== id);
    }

    /**
     * 推定残り時間の計算
     */
    getEstimatedTimeRemaining(): number {
        if (this.currentStepIndex >= this.progressSteps.length) {
            return 0;
        }
        
        const remainingSteps = this.progressSteps.slice(this.currentStepIndex);
        const totalRemainingDuration = remainingSteps.reduce((sum, step) => sum + step.duration, 0);
        const currentStepRemaining = (1 - this.stepProgress) * this.progressSteps[this.currentStepIndex].duration;
        
        // 簡易的な推定（実際の処理時間は異なる場合があります）
        const estimatedSeconds = (totalRemainingDuration - this.progressSteps[this.currentStepIndex].duration + currentStepRemaining) * 10;
        
        return Math.max(0, estimatedSeconds);
    }

    /**
     * ステータス取得
     */
    getStatus(): ComponentStatus {
        return {
            componentType: 'ImportProgressManager',
            totalSteps: this.progressSteps.length,
            currentStep: this.currentStepIndex,
            stepProgress: this.stepProgress,
            overallProgress: this.mainController.data.importProgress || 0,
            cancelled: this.cancelled,
            estimatedTimeRemaining: this.getEstimatedTimeRemaining()
        };
    }
}