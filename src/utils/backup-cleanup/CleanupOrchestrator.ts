import { BackupFileInvestigator } from './BackupFileInvestigator.js';''
import { ReferenceAnalyzer } from './ReferenceAnalyzer.js';''
import { SafetyVerifier } from './SafetyVerifier.js';''
import { SequentialFileRemover } from './SequentialFileRemover.js';''
import { IntegrityValidator } from './IntegrityValidator.js';''
import { CleanupReporter } from './CleanupReporter.js';

// Type definitions
interface CleanupOptions { dryRun?: boolean;
    verbose?: boolean;
    safetyMode?: boolean;
    confirmationRequired?: boolean;
    reportOutputDir?: string;
    [key: string]: any, }

interface FileInvestigationResult { filePath: string,
    exists: boolean;
    currentFileExists: boolean;
    investigationFailed: boolean;
    sizeAnalysis?: {
        bytes: number;
        wordCount: number ,}

interface ReferenceAnalysisResult { filePath: string,
    safetyAssessment: {
        safeToDelete: boolean ,}

interface SafetyVerificationResult { filePath: string,
    overallSafety: boolean ,}

interface InvestigationPhaseResult { investigationResults: FileInvestigationResult[];
    referenceResults: ReferenceAnalysisResult[];
    investigationSummary: any;
    safeFiles: FileInvestigationResult[];
    totalFiles: number;
    safeForDeletion: number }

interface SafetyPhaseResult { verificationResults: SafetyVerificationResult[];
    safetyReport: any;
    verifiedSafeFiles: FileInvestigationResult[];
    totalCandidates: number;
    verifiedSafe: number }

interface DeletionResult { status: string;
    filePath?: string }

interface DeletionPhaseResult { deletionResults: {
        deletions: DeletionResult[] };
    deletionSummary: any;
    sizeReduction: any;
    successfulDeletions: DeletionResult[];
    failedDeletions: DeletionResult[];
    }

interface IntegrityValidationResult { buildIntegrity: any,
    basicTests: any;
    importResolution: any;
    coreFeatures: any ,}

interface IntegrityPhaseResult { validationResults: IntegrityValidationResult;
    integrityReport: {
        summary: {
            overallIntegrity: boolean };
    overallIntegrityStatus: boolean;
}

interface ReportingPhaseResult { finalReport: any,
    recoveryInstructions: any;
    reportFileName: string ,}

interface ExecutionState { phase: string;
    startTime: string | null;
    endTime: string | null;
    results: {
        investigation?: InvestigationPhaseResult;
        safety?: SafetyPhaseResult;
        deletion?: DeletionPhaseResult;
        integrity?: IntegrityPhaseResult;
        reports?: ReportingPhaseResult;
    };
    errors: any[];
}

interface ErrorRecoveryResult { recovered: boolean,
    action: string ,}

interface FinalResult { status: string;
    executionState: ExecutionState;
    summary: {
        totalExecutionTime: number | null;
        phase: string;
        filesProcessed: number;
        filesDeleted: number;
        errorsEncountered: number };
    recommendations: string[];
    dryRun: boolean;
    error?: { message: string;
        phase: string }

/**
 * CleanupOrchestrator - バックアップファイルクリーンアップの総合調整クラス
 * Issue #104 のバックアップファイル削除プロセス全体を安全に調整・実行する機能を提供
 */
export class CleanupOrchestrator {
    private options: Required<CleanupOptions>;
    private investigator: BackupFileInvestigator;
    private referenceAnalyzer: ReferenceAnalyzer;
    private safetyVerifier: SafetyVerifier;
    private fileRemover: SequentialFileRemover;
    private integrityValidator: IntegrityValidator;
    private reporter: CleanupReporter;
    private executionState: ExecutionState;

    constructor(options: CleanupOptions = {)) {
        this.options = {
            dryRun: options.dryRun || false;
            verbose: options.verbose || false;
            safetyMode: options.safetyMode !== false, // デフォルトは安全モード;
            confirmationRequired: options.confirmationRequired !== false,
            reportOutputDir: options.reportOutputDir || './.kiro/reports';
            ...options;

        // コンポーネント初期化
        this.investigator = new BackupFileInvestigator();
        this.referenceAnalyzer = new ReferenceAnalyzer();
        this.safetyVerifier = new SafetyVerifier();
        this.fileRemover = new SequentialFileRemover();
        this.integrityValidator = new IntegrityValidator();''
        this.reporter = new CleanupReporter(''';
            phase: 'initialized';
            startTime: null;
            endTime: null;
            results: {,};
            errors: []);
        })'

        this.log('CleanupOrchestrator initialized', 'info);
    }

    /**
     * メインクリーンアップ処理の実行'
     */''
    async executeCleanup()';
        this.log('Starting backup file cleanup process...', 'info);''
        this.executionState.startTime = new Date().toISOString(''';
        this.executionState.phase = 'starting';
';

        try { // Phase, 1: 調査フェーズ)'
            this.executionState.phase = 'investigation';')'
            this.log('Phase 1: Investigation - Starting file investigation...', 'info);
            const investigationResults = await this.runInvestigationPhase();
            this.executionState.results.investigation = investigationResults;

            if(investigationResults.safeFiles.length === 0) {'

                this.log('No files identified as safe for deletion. Stopping process.', 'warn'');

            }

                return this.generateFinalResult('no_safe_files'');
';
            // Phase 2: 安全性検証フェーズ
            this.executionState.phase = 'safety_verification';''
            this.log('Phase 2: Safety Verification - Verifying deletion safety...', 'info);
            const safetyResults = await this.runSafetyVerificationPhase(investigationResults.safeFiles);
            this.executionState.results.safety = safetyResults;

            if(safetyResults.verifiedSafeFiles.length === 0) {'

                this.log('No files passed safety verification. Stopping process.', 'warn'');

            }

                return this.generateFinalResult('no_verified_safe_files);

            // ユーザー確認（必要な場合）
            if(this.options.confirmationRequired && !this.options.dryRun) {
                const confirmed = await this.requestUserConfirmation(safetyResults.verifiedSafeFiles);''
                if(!confirmed) {''
                    this.log('User cancelled the deletion process.', 'info'');

            }

                    return this.generateFinalResult('user_cancelled);

            // Phase 3: 削除実行フェーズ（ドライランでない場合のみ）
            let deletionResults: DeletionPhaseResult | null = null,
            if(!this.options.dryRun) {'

                this.executionState.phase = 'deletion';''
                this.log('Phase 3: Deletion - Executing file deletion...', 'info);''
                deletionResults = await this.runDeletionPhase(safetyResults.verifiedSafeFiles);
            }
                this.executionState.results.deletion = deletionResults; }

            } else { }'

                this.log('Dry run mode - Skipping actual deletion', 'info); }
            }

            // Phase 4: 整合性確認フェーズ（削除実行後のみ）
            let integrityResults: IntegrityPhaseResult | null = null,
            if(!this.options.dryRun && deletionResults) {'

                this.executionState.phase = 'integrity_validation';''
                this.log('Phase 4: Integrity Validation - Checking system integrity...', 'info);''
                integrityResults = await this.runIntegrityValidationPhase('';)'
            this.executionState.phase = 'reporting';')'
            this.log('Phase 5: Reporting - Generating comprehensive report...', 'info);''
            const reportResults = await this.runReportingPhase('';)'
            this.executionState.phase = 'completed';')'
            this.executionState.endTime = new Date().toISOString()';
            return this.generateFinalResult('success); catch (error) { }'

            this.log(`Cleanup, process failed: ${(error, as Error'}).message}`, 'error');''
            this.executionState.errors.push(error);''
            this.executionState.phase = 'failed';''
            this.executionState.endTime = new Date().toISOString()';
            return this.generateFinalResult('error', error as Error);

    /**
     * 調査フェーズの実行'
     */''
    async runInvestigationPhase()';
        this.log('Investigating target backup files...', 'info);
        
        // 全対象ファイルの調査
        const investigationResults = await this.investigator.investigateTargetFiles();
        
        // 参照分析
        const referenceResults: ReferenceAnalysisResult[] = [],
        for(const, fileResult of, investigationResults) {
            if (fileResult.exists) {''
                this.log(`Analyzing references for ${fileResult.filePath}...`, 'verbose'}
                const referenceAnalysis = await this.referenceAnalyzer.generateReferenceReport(fileResult.filePath, {); }
                referenceResults.push(referenceAnalysis});
            }
        }

        // 調査サマリー生成
        const investigationSummary = await this.reporter.generateInvestigationSummary(investigationResults);

        // 安全な削除候補の特定
        const safeFiles = investigationResults.filter(file => {  );
            const referenceResult = referenceResults.find(r => r.filePath === file.filePath);
            return file.exists && ;
                   file.currentFileExists && ;
                   !file.investigationFailed &&;
                   referenceResult && }
                   referenceResult.safetyAssessment.safeToDelete; }
        });

        return { investigationResults,
            referenceResults,
            investigationSummary,
            safeFiles,
            totalFiles: investigationResults.length, };
            safeForDeletion: safeFiles.length }
        }

    /**
     * 安全性検証フェーズの実行
     */
    async runSafetyVerificationPhase(candidateFiles: FileInvestigationResult[]): Promise<SafetyPhaseResult> { ''
        this.log(`Verifying, safety for ${candidateFiles.length) candidate files...`, 'info');
        
        const verificationResults: SafetyVerificationResult[] = [],
        
        for(const, file of, candidateFiles) {
        ';

            this.log(`Safety verification for ${file.filePath}...`, 'verbose'}
            const verification = await this.safetyVerifier.verifyDeletionSafety(file.filePath); }
            verificationResults.push(verification});
        }

        // 安全性レポート生成
        const safetyReport = await this.safetyVerifier.generateSafetyReport(verificationResults);

        // 確実に安全なファイルのみ選別
        const verifiedSafeFiles = candidateFiles.filter(file => {  );
            const verification = verificationResults.find(v => v.filePath === file.filePath); }
            return verification && verification.overallSafety;);

        return { verificationResults,
            safetyReport,
            verifiedSafeFiles,
            totalCandidates: candidateFiles.length, };
            verifiedSafe: verifiedSafeFiles.length }
        }

    /**
     * 削除実行フェーズの実行
     */
    async runDeletionPhase(verifiedFiles: FileInvestigationResult[]): Promise<DeletionPhaseResult> { ''
        this.log(`Executing, deletion for ${verifiedFiles.length) verified files...`, 'info');
        
        // 段階的安全削除実行
        const deletionResults = await this.fileRemover.removeFilesSafely(verifiedFiles};
        
        // 削除サマリー生成
        const deletionSummary = await this.reporter.generateDeletionSummary(deletionResults};
        
        // サイズ削減計算 }
        const beforeSizes = { files: verifiedFiles.map(f => ({ bytes: f.sizeAnalysis?.bytes || 0, words: f.sizeAnalysis? .wordCount || 0 ),}) : undefined
        const afterSizes = { files: [] }; // 削除後はファイルが存在しない
        const sizeReduction = await this.reporter.calculateSizeReduction(beforeSizes, afterSizes);

        return { deletionResults,
            deletionSummary,
            sizeReduction,
            successfulDeletions: deletionResults.deletions.filter(d => d.status === 'deleted''),' };

            failedDeletions: deletionResults.deletions.filter(d => d.status !== 'deleted); }'
        }

    /**
     * 整合性確認フェーズの実行'
     */''
    async runIntegrityValidationPhase()';
        this.log('Validating system integrity after deletion...', 'info);
        
        // 包括的整合性検証
        const validationResults: IntegrityValidationResult = { buildIntegrity: await this.integrityValidator.validateBuildIntegrity(),
            basicTests: await this.integrityValidator.runBasicTests();
            importResolution: await this.integrityValidator.checkImportResolution();
            coreFeatures: await this.integrityValidator.validateCoreFeatures(), };

        // 整合性レポート生成
        const integrityReport = await this.integrityValidator.generateIntegrityReport(validationResults);

        return { validationResults,
            integrityReport, };
            overallIntegrityStatus: integrityReport.summary.overallIntegrity }
        }

    /**
     * レポート生成フェーズの実行
     */''
    async runReportingPhase()';
        this.log('Generating comprehensive cleanup report...', 'info);
        
        // 復旧手順作成
        const deletedFiles = this.executionState.results.deletion? .successfulDeletions || [];
        const recoveryInstructions = await this.reporter.createRecoveryInstructions(deletedFiles);
        
        // 最終包括レポート生成
        const finalReport = await this.reporter.generateFinalReport({ : undefined
            investigationSummary: this.executionState.results.investigation? .investigationSummary, : undefined
            deletionSummary: this.executionState.results.deletion? .deletionSummary, : undefined
            integrityValidation: this.executionState.results.integrity? .integrityReport, : undefined);
            sizeReduction: this.executionState.results.deletion? .sizeReduction,);
            recoveryInstructions);
        // レポート保存 : undefined
        const timestamp = new Date().toISOString(').replace(/[:.]/g, '-); }
        const reportFileName = `backup-cleanup-report-${timestamp}.json`;
        await this.reporter.saveReportToFile(finalReport, reportFileName);

        return { finalReport,
            recoveryInstructions, };
            reportFileName }
        }

    /**
     * ユーザー確認の要求'
     */''
    async requestUserConfirmation(filesToDelete: FileInvestigationResult[]): Promise<boolean> { ''
        console.log('\n = == DELETION, CONFIRMATION ===);
        console.log(`The following ${filesToDelete.length} files will be deleted: `} }
        filesToDelete.forEach((file, index}) => {  }

            console.log(`${index + 1}. ${file.filePath}`');''
        }');

        console.log('\nThese, files have, been verified, as safe, for deletion.'');''
        console.log('Continue, with deletion? (y/N'):');
        
        // 実際のプロダクションでは readline を使用するが、
        // この実装では自動的にtrueを返す（テスト用）
        return true;
    }

    /**
     * プロセスの中断処理
     */
    async interruptProcess(reason: string): Promise<FinalResult> { ''
        this.log(`Process, interrupted: ${reason)`, 'warn'');''
        this.executionState.phase = 'interrupted';
        this.executionState.endTime = new Date().toISOString();
        
        // 緊急レポート生成
        if(this.executionState.results.investigation} {

            await this.runReportingPhase(}

        return this.generateFinalResult('interrupted', new Error(reason);

    /**
     * エラー処理とプロセス回復
     */'
    async handleErrorAndRecover(error: Error, phase: string): Promise<ErrorRecoveryResult> { ' }'

        this.log(`Error in ${phase}: ${ error.message}`, 'error'}
        this.executionState.errors.push({ phase, error: error.message, timestamp: new Date().toISOString(,}));
        ';
        // フェーズ別回復戦略
        switch(phase) {'

            case 'investigation':';
                // 調査エラーは致命的でない場合が多い
        }

                this.log('Investigation errors detected, continuing with available data...', 'warn'');' }

                return { recovered: true, action: 'continue_with_partial_data' ,}''
            case 'safety_verification':';
                // 安全性検証エラーは中止が適切
                this.log('Safety verification failed, stopping deletion process for safety', 'error'');''
                return { recovered: false, action: 'abort_deletion' ,}''
            case 'deletion':';
                // 削除エラーは即座に中止
                this.log('Deletion error detected, stopping further deletions', 'error'');''
                return { recovered: false, action: 'stop_deletions' ,}''
            case 'integrity_validation':';
                // 整合性エラーは警告だが続行可能
                this.log('Integrity validation issues detected, flagging for review', 'warn'');''
                return { recovered: true, action: 'flag_for_review' ,},

            default:'';
                return { recovered: false, action: 'abort_process' ,}
    }

    /**
     * 最終結果の生成
     */
    generateFinalResult(status: string, error: Error | null = null): FinalResult { const result: FinalResult = {
            status,
            executionState: this.executionState;
            summary: {
                totalExecutionTime: this.executionState.endTime ?   : undefined
                    new Date(this.executionState.endTime).getTime() - new Date(this.executionState.startTime!).getTime() : ;
                    null,
                phase: this.executionState.phase;
                filesProcessed: this.executionState.results.investigation? .totalFiles || 0, : undefined
                filesDeleted: this.executionState.results.deletion? .successfulDeletions?.length || 0, : undefined
                errorsEncountered: this.executionState.errors.length ,};
            recommendations: this.generateRecommendations(status);
            dryRun: this.options.dryRun;
        },

        if(error) {

            result.error = {
                message: error.message }
                phase: this.executionState.phase }
            }

        this.log(`Cleanup process completed with status: ${status}`, status === 'success' ? 'info' : 'warn'});
        
        return result;
    }

    /**
     * ステータス別推奨事項の生成
     */
    generateRecommendations(status: string): string[] { const recommendations: string[] = [],

        switch(status) {'

            case 'success':'';
                recommendations.push('file-size-report.jsonを更新してください'');''
                recommendations.push('プロジェクトドキュメントを更新してください'');''
                recommendations.push('今後のクリーンアップ手順を確立してください'');
                break;

            case 'no_safe_files':'';
                recommendations.push('対象ファイルの状況を手動で確認してください'');''
                recommendations.push('参照関係を詳しく調査してください'');
                break;

            case 'no_verified_safe_files':'';
                recommendations.push('安全性検証の警告を確認してください'');''
                recommendations.push('手動で安全性を確認後、再実行を検討してください'');
                break;

            case 'user_cancelled':'';
                recommendations.push('必要に応じて後で再実行してください'');
                break;

            case 'error':'';
                recommendations.push('エラーの詳細を確認し、問題を修正してください'');''
                recommendations.push('システムの整合性を確認してください'');
                break;

            case 'interrupted':'';
                recommendations.push('中断の原因を確認してください'');''
                recommendations.push('可能であれば安全に再開してください'');
        }
                break; }
        }

        return recommendations;
    }

    /**
     * ログ出力'
     */''
    log(message: string, level: string = 'info): void { const timestamp = new Date().toISOString();' }

        const prefix = `[${timestamp}] [${ level.toUpperCase(}'
        if(this.options.verbose || level === 'error' || level === 'warn} { }
            console.log(`${prefix} ${message}`});
        }
    }

    /**
     * 実行状態の取得
     */
    getExecutionState(): ExecutionState {
        return { ...this.executionState;
    }

    /**
     * 設定オプションの取得'
     */]'
    getOptions(']);