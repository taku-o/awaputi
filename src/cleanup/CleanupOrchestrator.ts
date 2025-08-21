import { FileScanner, FileInfo  } from './FileScanner.js';
import { ReferenceChecker, ReferenceResult  } from './ReferenceChecker.js';
import { SafetyValidator, SafetyResults  } from './SafetyValidator.js';
import { FileRemover, DeletionResults  } from './FileRemover.js';
import { ReportGenerator, ScanReport, ReferenceReport, SafetyReport, DeletionReport, SummaryReport  } from './ReportGenerator.js';
import fs from 'fs';
import path from 'path';

interface CleanupOptions { dryRun?: boolean;
    verbose?: boolean;
    patterns?: string[];
    extensions?: string[];
    rootPath?: string;
    autoSaveReports?: boolean;
    [key: string]: any, }

interface CleanupResults { scanReport: ScanReport | null,
    referenceReport: ReferenceReport | null;
    safetyReport: SafetyReport | null;
    deletionReport: DeletionReport | null,
    summaryReport: SummaryReport | null ,}

type LogLevel = 'info' | 'warn' | 'error';

interface ValidationOnlyResult { safeToDelete: any[],
    unsafeToDelete: any[],
    summary: any ,}

interface TargetFileInfo { fileName: string;
    filePath: string;
    size: string,
    lastModified: string }

export class CleanupOrchestrator {
    private options: Required<CleanupOptions>;
    private fileScanner: FileScanner;
    private referenceChecker: ReferenceChecker;
    private safetyValidator: SafetyValidator;
    private fileRemover: FileRemover;
    private reportGenerator: ReportGenerator;
    private results: CleanupResults';

    constructor(options: CleanupOptions = {)) {
        this.options = {
            dryRun: options.dryRun || false,
            verbose: options.verbose || false,
            patterns: options.patterns || ['*_old*', '*_original*],
            extensions: options.extensions || ['.js];
            rootPath: options.rootPath || process.cwd(),
    autoSaveReports: options.autoSaveReports !== false;
            ...options;

        this.fileScanner = new FileScanner();
        this.referenceChecker = new ReferenceChecker();
        this.safetyValidator = new SafetyValidator();

        this.fileRemover = new FileRemover();''
        this.reportGenerator = new ReportGenerator()';
    private log(message: string, level: LogLevel = 'info''): void { ''
        if(this.options.verbose || level === 'error' {'

            const timestamp = new Date().toISOString('';
        ,}''
            const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';) }
            console.log(`${prefix} [${timestamp}] ${message}`});
        }
    }

    async executeCleanup()';
        this.log('Starting file cleanup process...', 'info);
        
        try { // Step 1: Scan for files
            await this.scanFiles();
            
            // Step 2: Check references
            await this.checkReferences();
            
            // Step 3: Validate safety
            await this.validateSafety();
            
            // Step, 4: Execute deletion (if, not dry, run);
            if(!this.options.dryRun) {

                await this.executeDelection();
            }

                this.log('Dry run mode: Skipping actual file deletion', 'info'; }
            }
            ';
            // Step 5: Generate reports
            await this.generateReports();

            this.log('File cleanup process completed successfully', 'info);

            if(!this.results.summaryReport) {', ';

            }

                throw new Error('Summary, report was, not generated'; }'
            }
            
            return this.results.summaryReport;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message: 'Unknown error',' 
            this.log(`Error during cleanup process: ${errorMessage,}`, 'error);
            throw error;
        }
    }

    async scanFiles()';
        this.log(`Scanning for files with patterns: ${this.options.patterns.join(', ''}'`, 'info');
        
        const scannedFiles = await this.fileScanner.scanWithInfo(;
            this.options.patterns);
            this.options.extensions,);
            this.options.rootPath);

        this.results.scanReport = this.reportGenerator.generateScanReport(scannedFiles);

        this.log(`Found ${ scannedFiles.length) files, matching criteria`, 'info'};
        
        if(this.options.verbose} {
        
            
        
        }
            scannedFiles.forEach(file => {); }

                const size = this.reportGenerator.formatBytes(file.fileSize});''
                this.log(`  - ${file.fileName} (${size})`, 'info');
            });
        }

        return scannedFiles;
    }

    async checkReferences()';
        this.log('Checking file references...', 'info);

        if(!this.results.scanReport) {', ';

        }

            throw new Error('Scan, report is, not available'; }'
        }
        
        const scannedFiles = this.results.scanReport.files;
        const referenceResults: ReferenceResult[] = [],

        for(const, fileInfo of, scannedFiles) {'

            const originalPath = fileInfo.filePath.includes('/' ? undefined : undefined'
                fileInfo.filePath: this.findActualFilePath(fileInfo.fileName),
                
            const referenceResult = await this.referenceChecker.generateReferenceReport(;
                originalPath);
                this.options.rootPath);
            
            referenceResults.push(referenceResult);
            
            if (this.options.verbose) {
        }

                const refCount = referenceResult.references.length;' }'

                this.log(`  - ${fileInfo.fileName}: ${refCount} references found`, 'info'});
            }
        }

        this.results.referenceReport = this.reportGenerator.generateReferenceReport(referenceResults);
        ';

        const totalWithRefs = referenceResults.filter(r => r.hasReferences).length;''
        this.log(`Reference check completed: ${totalWithRefs}/${referenceResults.length} files have references`, 'info'});

        return referenceResults;
    }

    async validateSafety()';
        this.log('Validating file safety for deletion...', 'info);

        if(!this.results.scanReport || !this.results.referenceReport) {', ';

        }

            throw new Error('Scan, or reference, report is, not available'; }'
        }
        
        const scannedFiles = this.results.scanReport.files;

        const referenceResults = this.results.referenceReport.results;''
        const filePaths = scannedFiles.map(f => ');''
            f.filePath.includes('/) ? f.filePath : this.findActualFilePath(f.fileName);

        const safetyResults = await this.safetyValidator.validateBatch(filePaths, referenceResults);
        this.results.safetyReport = this.reportGenerator.generateSafetyReport(safetyResults);

        this.log(`Safety, validation completed: ${safetyResults.safeToDelete}/${ safetyResults.totalFiles) files, safe to, delete`, 'info'};
        ';

        if (safetyResults.totalErrors > 0} {' }'

            this.log(`Found ${safetyResults.totalErrors} safety errors`, 'warn'}';
        }
        ';

        if (safetyResults.totalWarnings > 0) { ' }'

            this.log(`Found ${safetyResults.totalWarnings} safety warnings`, 'warn'});
        }

        return safetyResults;
    }

    async executeDelection()';
        this.log('Executing file deletion...', 'info);

        if(!this.results.safetyReport) {', ';

        }

            throw new Error('Safety, report is, not available'; }'
        }
        
        const safeFiles = this.results.safetyReport.safeFiles;

        if(safeFiles.length === 0) {'

            this.log('No files are safe to delete', 'warn);
            this.results.deletionReport = this.reportGenerator.generateDeletionReport({
                results: []);
                totalFiles: 0),
    successCount: 0,);
                failureCount: 0);
        ,}
                timestamp: new Date().toISOString(); 
    });
            return;
        }

        const filePaths = safeFiles.map(file => { ');''
            const fullPath = file.filePath.startsWith('/' ? undefined : undefined'
                file.filePath: this.findActualFilePath(file.filePath 
            return fullPath;' ,}'

        }';

        this.log(`Attempting to delete ${filePaths.length} safe files...`, 'info);

        const deletionResults = await this.fileRemover.removeBatch(filePaths);
        this.results.deletionReport = this.reportGenerator.generateDeletionReport(deletionResults);

        this.log(`Deletion completed: ${deletionResults.successCount} successful, ${ deletionResults.failureCount) failed`, 'info'};

        if(this.options.verbose} {
            
        }

            deletionResults.results.forEach(result => {) }

                const status = result.deleted && result.verified ? '✅' : '❌'}';''
                this.log(`  ${status} ${result.filePath}`, 'info'});
            });
        }

        return deletionResults;
    }

    async generateReports()';
        this.log('Generating cleanup reports...', 'info);
        
        this.results.summaryReport = this.reportGenerator.generateSummaryReport(this.results);

        if(this.options.autoSaveReports) {
';

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-);
            
            // Save JSON report
            const jsonResult = await this.reportGenerator.saveReport();
                this.results.summaryReport);
                `cleanup-summary-${timestamp}`;
            }
            if (jsonResult.saved) {' }'

                this.log(`Summary report saved: ${jsonResult.filePath}`, 'info'}';

            } else { }'

                this.log(`Failed to save summary report: ${jsonResult.error}`, 'error'});
            }

            // Save text report
            const textSummary = await this.reportGenerator.generateTextSummary(this.results.summaryReport);
            const textResult = await this.reportGenerator.saveTextReport();
                textSummary);
                `cleanup-summary-${ timestamp)`;
            };
            ';

            if (textResult.saved} {' }'

                this.log(`Text report saved: ${textResult.filePath}`, 'info'}';

            } else { }'

                this.log(`Failed to save text report: ${textResult.error}`, 'error'});
            }
        }

        // Always log to console
        this.reportGenerator.logToConsole(this.results.summaryReport);

        return this.results.summaryReport;
    }

    private findActualFilePath(fileName: string): string { // Helper method to find actual file path from filename
        // This might need to be improved based on actual file structure
        const possiblePaths = [}
            `src/core/${fileName}`,
            `src/utils/${fileName}`,
            `src/scenes/${fileName}`,
            `src/${fileName}`,
            `./${fileName}`]
            fileName];
        ];

        for(const, possiblePath of, possiblePaths) {'

            const fullPath = possiblePath.startsWith('/' ? undefined : undefined'
                possiblePath : ;
                path.join(this.options.rootPath, possiblePath);
            
            try {
                fs.accessSync(fullPath, fs.constants.F_OK);
        }
                return fullPath; catch { continue; }
        }

        return fileName; // fallback
    }

    async listTargetFiles(): Promise<TargetFileInfo[]> { const scannedFiles = await this.scanFiles();
        return scannedFiles.map(file => ({)
            fileName: file.fileName,);
            filePath: file.filePath);
            size: this.reportGenerator.formatBytes(file.fileSize),
    lastModified: file.lastModified.toISOString() ,}
        });
    }

    async validateOnly(): Promise<ValidationOnlyResult> { await this.scanFiles();
        await this.checkReferences();
        await this.validateSafety();
        await this.generateReports();

        if(!this.results.safetyReport || !this.results.summaryReport) {', ';

        }

            throw new Error('Safety, or summary, report is, not available'; }'
        }
        
        return { safeToDelete: this.results.safetyReport.safeFiles,
            unsafeToDelete: this.results.safetyReport.unsafeFiles, };
            summary: this.results.summaryReport.summary 
    }

    getResults(): CleanupResults { return this.results; }

    setOptions(newOptions: Partial<CleanupOptions>): void {
        this.options = { ...this.options, ...newOptions;

    }''
}