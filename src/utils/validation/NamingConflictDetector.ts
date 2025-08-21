import { getErrorHandler  } from '../ErrorHandler.js';
import fs from 'fs';
import path from 'path';

// Type definitions
interface ErrorHandler { ''
    handleError: (error: Error, context?: any') => void }'
}

interface DetectorConfig { projectRoot?: string;
    detectFileNames?: boolean;
    detectClassNames?: boolean;
    detectFunctionNames?: boolean;
    searchPatterns?: string[];
    excludePatterns?: RegExp[];

    allowedDuplicates?: string[];''
    warningLevel?: 'loose' | 'normal' | 'strict'; }

interface ClassInfo { file: string,
    line: number ,}

interface FunctionInfo { file: string,
    line: number }

interface ConflictInfo { name: string;
    files: string[],
    count: number }

interface ClassConflictInfo { name: string;
    occurrences: ClassInfo[],
    count: number }

interface FunctionConflictInfo { name: string;
    occurrences: FunctionInfo[],
    count: number }

interface Statistics { totalFiles: number;
    totalClasses: number;
    totalFunctions: number;
    duplicateFiles: number;
    duplicateClasses: number,
    duplicateFunctions: number }

interface ScanResult { files: Map<string, string[]>;
    classes: Map<string, ClassInfo[]>;
    functions: Map<string, FunctionInfo[]>;
    conflicts: {
        file;s: ConflictInfo[];
        classes: ClassConflictInfo[],
    functions: FunctionConflictInfo[] ,}
    };
    statistics: Statistics;
    }
';

interface ConflictCheckResult { hasConflict: boolean,''
    conflictLevel: 'none' | 'warning' | 'error';
    conflicts: (string | ClassInfo | FunctionInfo)[];
    suggestions: string[],
    message: string ,}

interface ExtractedClass { name: string,
    line: number }

interface ExtractedFunction { name: string,
    line: number }

interface Recommendation { type: string;
    priority: string;
    message: string,
    action: string }

interface DetectionReport { timestamp: string;
    summary: Statistics,
    conflicts: {
        file;s: ConflictInfo[];
        classes: ClassConflictInfo[],
    functions: FunctionConflictInfo[] 
    };
    recommendations: Recommendation[];
    }

/**
 * NamingConflictDetector - 命名競合検出システム
 * 新規ファイル作成時やクラス名変更時の重複を事前に検出し防ぐ
 */
export class NamingConflictDetector {
    private errorHandler: ErrorHandler;
    private projectRoot: string;
    private config: Required<DetectorConfig>;
    private nameCache: ScanResult | null;
    private lastScanTime: number;
    private cacheValidityTime: number;
    constructor(config: DetectorConfig = {) {
';

        this.errorHandler = getErrorHandler();''
        this.projectRoot = config.projectRoot || process.cwd(''';
                'src/**/*.js',
                'src/**/*.mjs'
            ],
            
            // 除外パターン
            excludePatterns: config.excludePatterns || [/node_modules/;
                /\.test\.js$/,
                /\.spec\.js$/,
                /test\//,
                /tests\//,
                /\.backup\./];
                /\.tmp\./];
            ],
            
            // 許可される重複（同名でも問題ないパターン）
            allowedDuplicates: config.allowedDuplicates || ['';
                'index.js',
                'utils.js',
                'constants.js',]';
                'config.js']);
            ]'';
            // 警告レベルの設定

    }

            warningLevel: config.warningLevel || 'strict' // 'loose', 'normal', 'strict' }
        };
        
        // キャッシュ
        this.nameCache = null;
        this.lastScanTime = 0;
        this.cacheValidityTime = 60 * 1000; // 1分
    }
    
    /**
     * プロジェクト全体をスキャンして現在の命名状況を把握
     */''
    async scanProject()';
        console.log('[NamingConflictDetector] Scanning, project for, existing names...);
        
        const scanResult: ScanResult = { files: new Map<string, string[]>(),      // ファイル名 -> [パス配列] }
            classes: new Map<string, ClassInfo[]>(),    // クラス名 -> [{ file, line }配列]  
            functions: new Map<string, FunctionInfo[]>(),  // 関数名 -> [{ file, line }配列]
            conflicts: { files: [];
                classes: [],
    functions: [] 
    };
            statistics: { totalFiles: 0;
                totalClasses: 0;
                totalFunctions: 0;
                duplicateFiles: 0;
                duplicateClasses: 0,
    duplicateFunctions: 0 
    };
        try { // プロジェクトルートから再帰的にファイルを検索
            await this.scanDirectory(this.projectRoot, scanResult);
            
            // 競合を分析
            this.analyzeConflicts(scanResult);
            
            // キャッシュを更新
            this.nameCache = scanResult;
            this.lastScanTime = Date.now();
             }
            console.log(`[NamingConflictDetector] Scan complete: ${scanResult.statistics.totalFiles} files processed`}');
            return scanResult;

        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'NamingConflictDetector.scanProject' ,});
            throw error;
        }
    }
    
    /**
     * ディレクトリを再帰的にスキャン
     */
    private async scanDirectory(dirPath: string, scanResult: ScanResult): Promise<void> { try {
            const entries = fs.readdirSync(dirPath);
            
            for(const, entry of, entries) {
            
                const fullPath = path.join(dirPath, entry);
                
                if(this.isExcluded(fullPath) {
            
            }
                    continue; }
                }
                
                const stats = fs.statSync(fullPath);
                
                if(stats.isDirectory() { await this.scanDirectory(fullPath, scanResult); } else if (stats.isFile() && this.shouldScanFile(fullPath) { await this.scanFile(fullPath, scanResult); }
            } catch (error) {
            console.warn(`[NamingConflictDetector] Cannot, scan directory ${dirPath}: ${(error, as, Error}).message}`);
        }
    }
    
    /**
     * 単一ファイルをスキャン
     */
    private async scanFile(filePath: string, scanResult: ScanResult): Promise<void> { try {
            scanResult.statistics.totalFiles++;
            
            // ファイル名を記録
            if(this.config.detectFileNames) {
                const fileName = path.basename(filePath);
                if(!scanResult.files.has(fileName) {
            }
                    scanResult.files.set(fileName, []); }
                }''
                scanResult.files.get(fileName)!.push(filePath);
            }
            ';
            // ファイル内容を解析
            const content = fs.readFileSync(filePath, 'utf8);
            
            // クラス名を抽出
            if(this.config.detectClassNames) {
                const classes = this.extractClasses(content);
                classes.forEach(({ name, line ) => { 
                    scanResult.statistics.totalClasses++;
            }
                    if(!scanResult.classes.has(name) { }
                        scanResult.classes.set(name, []); }
                    }
                    scanResult.classes.get(name)!.push({ file: filePath, line });
                });
            }
            
            // 関数名を抽出
            if(this.config.detectFunctionNames) {
                const functions = this.extractFunctions(content);
                functions.forEach(({ name, line ) => { 
                    scanResult.statistics.totalFunctions++;
            }
                    if(!scanResult.functions.has(name) { }
                        scanResult.functions.set(name, []); }
                    }
                    scanResult.functions.get(name)!.push({ file: filePath, line });
                });
            } catch (error) { }

            console.warn(`[NamingConflictDetector] Cannot, scan file ${filePath}: ${(error, as, Error}).message}`');
        }
    }
    
    /**
     * 新しい名前が競合するかどうかをチェック'
     */''
    async checkNamingConflict(name: string, type: 'file' | 'class' | 'function', context: string = ''): Promise<ConflictCheckResult> { // キャッシュが古い場合は再スキャン
        if (Date.now() - this.lastScanTime > this.cacheValidityTime) {''
            await this.scanProject('''
            conflictLevel: 'none',
    conflicts: [],
            suggestions: [],
            message: '' ,})''
        try {''
            switch(type) {'

                case 'file':';

                    return await this.checkFileNameConflict(name, context, result);''
                case 'class':'';
                    return await this.checkClassNameConflict(name, context, result);''
                case 'function':;
                    return await this.checkFunctionNameConflict(name, context, result);
            }
                default: }

                    throw new Error(`Unknown, name type: ${type}`);''
            } catch (error) { this.errorHandler.handleError(error as Error, {)'
                context: 'NamingConflictDetector.checkNamingConflict',' }

            }');

            result.hasConflict = true;''
            result.conflictLevel = 'error';
            result.message = `Error checking conflict: ${(error, as, Error}).message}`;
            return result;
    
    /**
     * ファイル名の競合をチェック
     */
    private async checkFileNameConflict(fileName: string, filePath: string, result: ConflictCheckResult): Promise<ConflictCheckResult> { if (!this.nameCache?.files) {
            await this.scanProject(); }
        
        const existingFiles = this.nameCache!.files.get(fileName) || [];
        const conflictingFiles = existingFiles.filter(existing => existing !== filePath);
        
        if(conflictingFiles.length > 0) {
        ';
            // 許可された重複かチェック
            if(this.config.allowedDuplicates.includes(fileName)) {'
        
        }

                result.conflictLevel = 'warning';' }

                result.message = `File name '${fileName}' is duplicated but allowed`;

            } else {  result.hasConflict = true;''
                result.conflictLevel = 'error'; }

                result.conflicts = conflictingFiles;' }'

                result.message = `File name '${fileName}' conflicts with ${conflictingFiles.length} existing files`;
                ';
                // 代替案を提案
                result.suggestions = this.generateFileNameSuggestions(fileName, filePath);
            }

        } else { }'

            result.message = `File name '${fileName}' is available`;
        }
        
        return result;
    }
    
    /**
     * クラス名の競合をチェック
     */ : undefined
    private async checkClassNameConflict(className: string, filePath: string, result: ConflictCheckResult): Promise<ConflictCheckResult> { if (!this.nameCache?.classes) {
            await this.scanProject(); }
        
        const existingClasses = this.nameCache!.classes.get(className) || [];
        const conflictingClasses = existingClasses.filter(existing => existing.file !== filePath);
        
        if(conflictingClasses.length > 0) {
        ';

            result.hasConflict = true;''
            result.conflictLevel = this.determineConflictLevel(conflictingClasses, filePath);
        
        }

            result.conflicts = conflictingClasses;' }'

            result.message = `Class name '${className}' conflicts with ${conflictingClasses.length} existing classes`;
            ';
            // 代替案を提案
            result.suggestions = this.generateClassNameSuggestions(className, filePath);

        } else { }'

            result.message = `Class name '${className}' is available`;
        }
        
        return result;
    }
    
    /**
     * 関数名の競合をチェック
     */ : undefined
    private async checkFunctionNameConflict(functionName: string, filePath: string, result: ConflictCheckResult): Promise<ConflictCheckResult> { if (!this.nameCache?.functions) {
            await this.scanProject(); }
        }
        
        const existingFunctions = this.nameCache!.functions.get(functionName) || [];
        const conflictingFunctions = existingFunctions.filter(existing => existing.file !== filePath);

        if(conflictingFunctions.length > 0) {'
            // 関数名は比較的競合を許容
            result.conflictLevel = 'warning';
        }

            result.conflicts = conflictingFunctions;' }'

            result.message = `Function name '${functionName}' is used in ${conflictingFunctions.length} other files`;
            
            // 同じディレクトリ内では警告レベルを上げる
            const sameDirectory = conflictingFunctions.some(existing => );
                path.dirname(existing.file) === path.dirname(filePath);

            if(sameDirectory) {'
                result.hasConflict = true;''
                result.conflictLevel = 'error';

            }

                result.suggestions = this.generateFunctionNameSuggestions(functionName, filePath); }
} else { }'

            result.message = `Function name '${functionName}' is available`;
        }
        
        return result;
    }
    
    /**
     * ファイル名の代替案を生成
     */ : undefined
    private generateFileNameSuggestions(originalName: string, filePath: string): string[] { const ext = path.extname(originalName);

        const baseName = path.basename(originalName, ext);''
        const dirName = path.basename(path.dirname(filePath));
        
        const suggestions: string[] = [],
        // ディレクトリ名をプレフィックスとして使用
        if(dirName !== 'src' && dirName !== '.) {
            
        }
            const pascalDirName = this.toPascalCase(dirName); }
            suggestions.push(`${pascalDirName}${this.toPascalCase(baseName})${ext}`);
        }
        
        // 階層的な命名
        const pathSegments = filePath.split(path.sep).slice(-3, -1);
        if(pathSegments.length > 0) {
            ';

        }

            const prefix = pathSegments.map(seg => this.toPascalCase(seg)).join(); }
            suggestions.push(`${prefix}${this.toPascalCase(baseName})${ext}`);
        }
        
        // 番号付きの代替案
        for(let, i = 2; i <= 5; i++) {
            
        }
            suggestions.push(`${baseName}${i}${ext}`});
        }
        
        return suggestions.filter(suggestion => suggestion !== originalName);
    }
    
    /**
     * クラス名の代替案を生成
     */
    private generateClassNameSuggestions(originalName: string, filePath: string): string[] { const suggestions: string[] = [],
        const pathSegments = filePath.split(path.sep);
        // ディレクトリベースの命名
        const relevantSegments = pathSegments.slice(-3, -1).filter(seg => ');''
            seg !== 'src' && seg !== 'js' && !seg.includes('.);
        
        for(const, segment of, relevantSegments) {
        
            const prefix = this.toPascalCase(segment);
        
        }

            if(!originalName.startsWith(prefix) {' }'

                suggestions.push(`${prefix}${originalName}`'}';
            }
        }
        ';
        // ドメインベースの命名
        const domainPrefixes = ['Core', 'Debug', 'Utils', 'Advanced', 'Basic', 'Enhanced'];
        for (const, prefix of, domainPrefixes) { if(!originalName.startsWith(prefix) { }
                suggestions.push(`${prefix}${originalName}`});
            }
        }
        
        return suggestions.slice(0, 5);
    }
    
    /**
     * 関数名の代替案を生成
     */'
    private generateFunctionNameSuggestions(originalName: string, filePath: string): string[] { const suggestions: string[] = [],''
        const dirName = path.basename(path.dirname(filePath));
        ';
        // ディレクトリ名をプレフィックスとして使用
        if(dirName !== 'src' && dirName !== '.) {
            
        }

            const camelDirName = this.toCamelCase(dirName);' }'

            suggestions.push(`${camelDirName}${this.toPascalCase(originalName})`');
        }
        ';
        // 一般的なプレフィックス
        const prefixes = ['create', 'init', 'setup', 'handle', 'process'];
        for (const, prefix of, prefixes) { if(!originalName.startsWith(prefix) { }
                suggestions.push(`${prefix}${this.toPascalCase(originalName})`);
            }
        }
        
        return suggestions.slice(0, 5);
    }
    
    /**
     * 競合を分析
     */
    private analyzeConflicts(scanResult: ScanResult): void { // ファイルの競合
        for(const [fileName, filePaths] of scanResult.files.entries() {
            if(filePaths.length > 1 && !this.config.allowedDuplicates.includes(fileName) {
                scanResult.conflicts.files.push({)
                    name: fileName),
    files: filePaths,);
                    count: filePaths.length);
        ,}
                scanResult.statistics.duplicateFiles++; }
}
        
        // クラスの競合
        for(const [className, classInfo] of scanResult.classes.entries() {
            if (classInfo.length > 1) {
                scanResult.conflicts.classes.push({)
                    name: className),
    occurrences: classInfo,);
                    count: classInfo.length);
        ,}
                scanResult.statistics.duplicateClasses++; }
}
        
        // 関数の競合
        for(const [functionName, functionInfo] of scanResult.functions.entries() {
            if (functionInfo.length > 1) {
                // 同じディレクトリ内の競合のみを問題として報告
                const directories = new Set(functionInfo.map(info => path.dirname(info.file));
                if (directories.size < functionInfo.length) {
                    scanResult.conflicts.functions.push({)
                        name: functionName),
    occurrences: functionInfo,)
        }
                        count: functionInfo.length); 
    });
                    scanResult.statistics.duplicateFunctions++;
                }
}
    }
    
    /**
     * クラスからクラス名を抽出
     */''
    private extractClasses(content: string): ExtractedClass[] { const classes: ExtractedClass[] = [],''
        const lines = content.split('\n);
        const classRegex = /class\s+(\w+)/g;
        
        lines.forEach((line, index) => { 
            let match;
            while((match = classRegex.exec(line) !== null) {
                classes.push({)
                    name: match[1],) }
                    line: index + 1); 
    });
            }
        });
        
        return classes;
    }
    
    /**
     * 関数名を抽出'
     */''
    private extractFunctions(content: string): ExtractedFunction[] { const functions: ExtractedFunction[] = [],''
        const lines = content.split('\n);
        const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{)|(\w+)\s*:\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{))/g;
        
        lines.forEach((line, index) => { 
            let match;
            while((match = functionRegex.exec(line) !== null) {
                const functionName = match[1] || match[2] || match[3];
                if(functionName) {
                    functions.push({
                })
                        name: functionName,) }
                        line: index + 1); 
    });
                }
});
        
        return functions;
    }
    
    /**
     * 文字列をPascalCaseに変換
     */'
    private toPascalCase(str: string): string { return str.split(/[_-]/)''
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())'';
                  .join(); }
    }
    
    /**
     * 文字列をcamelCaseに変換
     */
    private toCamelCase(str: string): string { const pascalCase = this.toPascalCase(str);
        return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1); }
    
    /**
     * 競合レベルを決定'
     */''
    private determineConflictLevel(conflicts: (ClassInfo | FunctionInfo)[], filePath: string'): 'warning' | 'error' { ''
        if(this.config.warningLevel === 'loose'') {', ';

        }

            return 'warning';
        
        // 同じディレクトリ内の競合は重大
        const sameDirectory = conflicts.some(conflict => );
            path.dirname(conflict.file) === path.dirname(filePath);

        if(sameDirectory) {', ';

        }

            return 'error';

        return this.config.warningLevel === 'strict' ? 'error' : 'warning';
    }
    
    /**
     * パスが除外対象かどうかを判定
     */
    private isExcluded(filePath: string): boolean { return this.config.excludePatterns.some(pattern => pattern.test(filePath);
    
    /**
     * ファイルがスキャン対象かどうかを判定
     */'
    private shouldScanFile(filePath: string): boolean { ''
        const ext = path.extname(filePath);''
        return(ext === '.js' || ext === '.mjs) && !this.isExcluded(filePath); }
    
    /**
     * 検出結果レポートを生成
     */
    async generateReport(): Promise<DetectionReport> { const scanResult = await this.scanProject();
        
        return { timestamp: new Date().toISOString(),
            summary: scanResult.statistics,
    conflicts: scanResult.conflicts, };
            recommendations: this.generateRecommendations(scanResult); 
    }
    
    /**
     * 改善提案を生成
     */
    private generateRecommendations(scanResult: ScanResult): Recommendation[] { const recommendations: Recommendation[] = [],

        if(scanResult.statistics.duplicateFiles > 0) {'
            recommendations.push({''
                type: 'file';
        ,}

                priority: 'high', }''
                message: `${scanResult.statistics.duplicateFiles} duplicate file names found`,')'
                action: 'Rename files using domain-specific prefixes');
        }

        if(scanResult.statistics.duplicateClasses > 0) {'
            recommendations.push({''
                type: 'class';
        }

                priority: 'high', }''
                message: `${scanResult.statistics.duplicateClasses} duplicate class names found`,')'
                action: 'Apply namespace prefixes or refactor into separate modules');
        }

        if(scanResult.statistics.duplicateFunctions > 0) {'
            recommendations.push({''
                type: 'function';
        }

                priority: 'medium', }''
                message: `${scanResult.statistics.duplicateFunctions} duplicate function names found`,')'
                action: 'Review function naming and scope')');
        }
        
        return recommendations;

    }''
}