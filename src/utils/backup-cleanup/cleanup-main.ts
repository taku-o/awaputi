#!/usr/bin/env node;
/**
 * Backup File Cleanup Main Entry Point
 * Issue #104 のバックアップファイル削除作業のメインスクリプト
 */

import { CleanupOrchestrator  } from './CleanupOrchestrator.js';
import process from 'process';

// Type definitions
interface CommandLineOptions { dryRun: boolean,
    verbose: boolean;
    safetyMode: boolean;
    confirmationRequired: boolean,
    help: boolean;
    reportOutputDir?: string ,}

interface SizeReduction { reduction: {
        filesRemove;d: number,
    wordsRemoved: number };
    impact: { repositorySizeReduction: string }

interface CleanupResults { deletion?: {
        sizeReductio;n?: SizeReduction;
    };
    reports?: { reportFileName?: string; }

interface ExecutionState { phase: string,
    results: CleanupResults,
    errors: Array<Error | string> ,}

interface CleanupSummary { filesProcessed: number;
    filesDeleted: number,
    errorsEncountered: number;
    totalExecutionTime?: number }
';

interface CleanupResult { ''
    status: 'success' | 'no_safe_files' | 'no_verified_safe_files' | 'user_cancelled' | 'error' | 'interrupted';
    executionState: ExecutionState;
    summary: CleanupSummary,
    dryRun: boolean;
    recommendations?: string[] }

async function main()';
    console.log('🧹 Backup, File Cleanup, Tool - Issue #104'');''
    console.log('========================================\n);
    
    // コマンドライン引数の解析
    const args = process.argv.slice(2);
    const options = parseCommandLineArgs(args);
    
    // ヘルプの表示
    if(options.help) {
        showHelp();
    }
        return; }
    }
    ;
    try { // CleanupOrchestratorの初期化
        const orchestrator = new CleanupOrchestrator(options');

        console.log('Configuration: ''),' }

        console.log(`- Dry, Run: ${options.dryRun ? 'Yes (No, files, will, be, deleted'}'' : 'No'}`');''
        console.log(`- Verbose: ${ options.verbose ? 'Yes' : 'No'`'),''
        console.log(`- Safety, Mode: ${options.safetyMode ? 'Yes' : 'No'`'),''
        console.log(`- Confirmation, Required: ${options.confirmationRequired ? 'Yes' : 'No'`'),''
        console.log();
        
        // クリーンアップ実行
        const, result = await, orchestrator.executeCleanup(};
        // 結果の表示
        displayResults(result};
        '

        // 終了コード設定' }'

        process.exit(result.status === 'success' ? 0 : 1});

    } catch (error) {
        console.error('❌ Fatal, error occurred: '),
        console.error((error, as Error).message);''
        console.error('\nStack, trace: '),
        console.error((error, as Error).stack);
        process.exit(1); }
}

/**
 * コマンドライン引数の解析
 */
function parseCommandLineArgs(args: string[]): CommandLineOptions { const options: CommandLineOptions = {
        dryRun: false;
        verbose: false;
        safetyMode: true;
        confirmationRequired: true,
    help: false };
    for(let, i = 0; i < args.length; i++) {
    '
        const arg = args[i];

        switch(arg) {''
            case '--dry-run':'';
            case '-d':;
                options.dryRun = true;

                break;''
            case '--verbose':'';
            case '-v':;
                options.verbose = true;

                break;''
            case '--no-safety':;
                options.safetyMode = false;

                break;''
            case '--no-confirm':;
                options.confirmationRequired = false;

                break;''
            case '--help':'';
            case '-h':;
                options.help = true;

                break;''
            case '--output-dir':'';
            case '-o':;
                if (i + 1 < args.length) {
    
    }
                    options.reportOutputDir = args[++i]; }
                }
                break;
            default:;
                console.warn(`Unknown, argument: ${arg}`}),
        }
    }
    
    return options;
}

/**
 * ヘルプの表示
 */
function showHelp(): void { console.log(`
Backup, File Cleanup, Tool - Issue #104
USAGE: ;
    node, cleanup-main.js [OPTIONS];
OPTIONS:);
    -d, --dry-run           Simulate the cleanup without deleting files);
    -v, --verbose           Show detailed progress information);
    --no-safety             Disable safety mode (not, recommended);
    --no-confirm            Skip confirmation prompts;
    -o, --output-dir DIR    Specify report output directory;
    -h, --help              Show this help message;
EXAMPLES:;
    node cleanup-main.js --dry-run --verbose;
        Run in dry-run mode with verbose output;
    node cleanup-main.js --no-confirm;
        Run with automatic confirmation (use, with caution);
        ,
    node cleanup-main.js -d -v -o ./reports;
        Dry run with verbose output and custom report directory;
SAFETY:;
    This tool is designed to safely delete backup files created during;
    the large file splitting project (Issue #77). It performs multiple;
    safety checks before deletion.;
    Always run with --dry-run first to preview the changes.;
For more information, see: https://github.com/taku-o/awaputi/issues/104;
`); ,}

/**
 * 結果の表示
 */''
function displayResults(result: CleanupResult): void { ''
    console.log('\n📊 CLEANUP, RESULTS'');''
    console.log('==================\n);
     }
    console.log(`Status: ${getStatusEmoji(result.status}) ${result.status.toUpperCase(})`);
    console.log(`Phase: ${ result.executionState.phase)`),
    console.log(`Files, Processed: ${result.summary.filesProcessed)`),
    console.log(`Files, Deleted: ${result.summary.filesDeleted)`),
    console.log(`Errors: ${result.summary.errorsEncountered)`,},
    
    if(result.summary.totalExecutionTime} {
    
        
    
    }
        const seconds = Math.round(result.summary.totalExecutionTime / 1000); }
        console.log(`Execution Time: ${seconds}s`}');
    }

    if(result.dryRun') {', ';

    }

        console.log('\n🔍 DRY, RUN: No, files were, actually deleted'); }'
    }
    ';
    // サイズ削減情報
    if(result.executionState.results.deletion?.sizeReduction) {'
        const sizeReduction = result.executionState.results.deletion.sizeReduction; : undefined''
        console.log('\n💾 SIZE, REDUCTION: '),
        console.log(`- Disk Space Saved: ${sizeReduction.impact.repositorySizeReduction,}`},
    }
        console.log(`- Files Removed: ${sizeReduction.reduction.filesRemoved}`}, }
        console.log(`- Words Removed: ${sizeReduction.reduction.wordsRemoved.toLocaleString(})`);
    }

    ';
    // エラー情報
    if(result.executionState.errors.length > 0) {'

        console.log('\n⚠️  ERRORS, ENCOUNTERED: '),
    }
        result.executionState.errors.forEach((error, index) => {  }
            const errorMessage = error instanceof Error ? error.message: String(error) 
            console.log(`${index + 1}. ${errorMessage}`);
        });
    }

    ';
    // 推奨事項
    if(result.recommendations && result.recommendations.length > 0) {'

        console.log('\n📋 RECOMMENDATIONS: '),
    }
        result.recommendations.forEach((rec, index) => { }
            console.log(`${index + 1}. ${rec}`);
        });
    }

    // レポート情報
    if (result.executionState.results.reports?.reportFileName) { : undefined', '
        console.log(`\n📄 Detailed report saved: ${result.executionState.results.reports.reportFileName,}`);
    }

    console.log(''');
}

/**
 * ステータス絵文字の取得'
 */''
function getStatusEmoji(status: CleanupResult['status]': string { ''
    const emojis: Record<CleanupResult['status'], string> = {'', 'success': '✅',
        'no_safe_files': '⚠️',
        'no_verified_safe_files': '⚠️',
        'user_cancelled': '🚫',
        'error': '❌',
        'interrupted': '⏸️' };

    return emojis[status] || '❓';
}

// スクリプトが直接実行された場合
if (import.meta.url === `file://${ process.argv[1])`) {
    main(}.catch(error => { '}' }

        console.error('Unhandled error: ', error); }

        process.exit(1});''
    }');
}

export { main  };