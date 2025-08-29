/**
 * Error Submission Manager
 * エラー報告の送信管理クラス
 */

interface SubmissionConfig {
    endpoint: string;
    apiKey?: string;
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
    enableCompression: boolean;
}

interface ErrorSubmission {
    id: string;
    errors: any[];
    timestamp: number;
    status: 'pending' | 'submitting' | 'success' | 'failed';
    attempts: number;
    lastAttempt?: number;
}

interface SubmissionResult {
    success: boolean;
    submissionId: string;
    errorCount: number;
    message?: string;
}

export class ErrorSubmissionManager {
    private config: SubmissionConfig;
    private submissionQueue: ErrorSubmission[] = [];
    private isProcessing = false;
    private rateLimitDelay = 0;

    constructor(config: Partial<SubmissionConfig> = {}) {
        this.config = {
            endpoint: '/api/errors',
            batchSize: 10,
            retryAttempts: 3,
            retryDelay: 1000,
            enableCompression: false,
            ...config
        };
    }

    /**
     * エラーを送信キューに追加
     */
    submitErrors(errors: any[]): string {
        const submission: ErrorSubmission = {
            id: this.generateId(),
            errors: [...errors],
            timestamp: Date.now(),
            status: 'pending',
            attempts: 0
        };

        this.submissionQueue.push(submission);
        console.log(`Added ${errors.length} errors to submission queue`);

        // 処理開始
        this.processQueue();

        return submission.id;
    }

    /**
     * キューの処理
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing) return;
        
        this.isProcessing = true;

        try {
            while (this.submissionQueue.length > 0) {
                const pendingSubmissions = this.submissionQueue.filter(
                    sub => sub.status === 'pending' || sub.status === 'failed'
                );

                if (pendingSubmissions.length === 0) break;

                // レート制限チェック
                if (this.rateLimitDelay > 0) {
                    console.log(`Rate limited. Waiting ${this.rateLimitDelay}ms`);
                    await this.delay(this.rateLimitDelay);
                    this.rateLimitDelay = 0;
                }

                // バッチ処理
                const batch = pendingSubmissions.slice(0, this.config.batchSize);
                await this.processBatch(batch);

                // 失敗した送信を再試行制限でフィルタ
                this.cleanupFailedSubmissions();
            }
        } catch (error) {
            console.error('Error processing submission queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * バッチ処理
     */
    private async processBatch(submissions: ErrorSubmission[]): Promise<void> {
        for (const submission of submissions) {
            if (submission.attempts >= this.config.retryAttempts) {
                submission.status = 'failed';
                console.warn(`Submission ${submission.id} exceeded retry limit`);
                continue;
            }

            try {
                submission.status = 'submitting';
                submission.attempts++;
                submission.lastAttempt = Date.now();

                const result = await this.submitToEndpoint(submission);
                
                if (result.success) {
                    submission.status = 'success';
                    console.log(`Successfully submitted ${submission.id}: ${result.message}`);
                } else {
                    submission.status = 'failed';
                    console.warn(`Submission ${submission.id} failed: ${result.message}`);
                    
                    // 再試行の遅延
                    await this.delay(this.config.retryDelay * submission.attempts);
                }

            } catch (error) {
                submission.status = 'failed';
                console.error(`Submission ${submission.id} error:`, error);

                // レート制限エラーの処理
                if (this.isRateLimitError(error)) {
                    this.rateLimitDelay = this.calculateRateLimitDelay(error);
                }

                // 再試行の遅延
                await this.delay(this.config.retryDelay * submission.attempts);
            }
        }
    }

    /**
     * エンドポイントへの送信
     */
    private async submitToEndpoint(submission: ErrorSubmission): Promise<SubmissionResult> {
        const payload = this.preparePayload(submission);
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        if (this.config.enableCompression) {
            headers['Content-Encoding'] = 'gzip';
        }

        const response = await fetch(this.config.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        return {
            success: true,
            submissionId: submission.id,
            errorCount: submission.errors.length,
            message: result.message || 'Submitted successfully'
        };
    }

    /**
     * ペイロード準備
     */
    private preparePayload(submission: ErrorSubmission): any {
        return {
            submissionId: submission.id,
            timestamp: submission.timestamp,
            errors: submission.errors.map(error => this.sanitizeError(error)),
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: submission.timestamp
            }
        };
    }

    /**
     * エラーのサニタイズ
     */
    private sanitizeError(error: any): any {
        const sanitized = { ...error };

        // 個人情報を除去
        if (sanitized.context) {
            delete sanitized.context.password;
            delete sanitized.context.token;
            delete sanitized.context.apiKey;
        }

        // スタックトレースの制限
        if (sanitized.stack && sanitized.stack.length > 2000) {
            sanitized.stack = sanitized.stack.substring(0, 2000) + '... (truncated)';
        }

        return sanitized;
    }

    /**
     * レート制限エラーの判定
     */
    private isRateLimitError(error: any): boolean {
        if (error instanceof Response) {
            return error.status === 429;
        }
        
        if (error.message) {
            return error.message.toLowerCase().includes('rate limit');
        }

        return false;
    }

    /**
     * レート制限遅延の計算
     */
    private calculateRateLimitDelay(error: any): number {
        if (error instanceof Response) {
            const retryAfter = error.headers.get('Retry-After');
            if (retryAfter) {
                return parseInt(retryAfter) * 1000; // Convert to milliseconds
            }
        }

        // デフォルト遅延（指数バックオフ）
        return Math.min(30000, 1000 * Math.pow(2, this.rateLimitDelay / 1000));
    }

    /**
     * 失敗した送信のクリーンアップ
     */
    private cleanupFailedSubmissions(): void {
        const oneHourAgo = Date.now() - 3600000; // 1時間前

        this.submissionQueue = this.submissionQueue.filter(submission => {
            // 成功した送信は保持（統計用）
            if (submission.status === 'success') {
                return submission.timestamp > oneHourAgo;
            }

            // 失敗した送信で再試行制限に達した場合は削除
            if (submission.status === 'failed' && submission.attempts >= this.config.retryAttempts) {
                console.log(`Removing failed submission ${submission.id}`);
                return false;
            }

            return true;
        });
    }

    /**
     * 送信統計の取得
     */
    getStatistics(): {
        total: number;
        pending: number;
        submitting: number;
        success: number;
        failed: number;
        queueSize: number;
    } {
        const stats = {
            total: this.submissionQueue.length,
            pending: 0,
            submitting: 0,
            success: 0,
            failed: 0,
            queueSize: this.submissionQueue.length
        };

        for (const submission of this.submissionQueue) {
            stats[submission.status]++;
        }

        return stats;
    }

    /**
     * 送信履歴の取得
     */
    getSubmissionHistory(): ErrorSubmission[] {
        return [...this.submissionQueue].sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * キューのクリア
     */
    clearQueue(): void {
        this.submissionQueue = [];
        console.log('Submission queue cleared');
    }

    /**
     * 特定の送信を再試行
     */
    retrySubmission(submissionId: string): boolean {
        const submission = this.submissionQueue.find(sub => sub.id === submissionId);
        
        if (!submission) {
            console.warn(`Submission not found: ${submissionId}`);
            return false;
        }

        if (submission.attempts >= this.config.retryAttempts) {
            console.warn(`Submission ${submissionId} exceeded retry limit`);
            return false;
        }

        submission.status = 'pending';
        submission.attempts = 0; // リセット

        console.log(`Retrying submission: ${submissionId}`);
        this.processQueue();

        return true;
    }

    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<SubmissionConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('Submission config updated');
    }

    /**
     * 遅延処理
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * ID生成
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.submissionQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 0;
        console.log('ErrorSubmissionManager destroyed');
    }
}

export default ErrorSubmissionManager;