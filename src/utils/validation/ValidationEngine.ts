import { getErrorHandler } from '../ErrorHandler.js';''
import fs from 'fs';''
import path from 'path';

// Type definitions
interface ErrorHandler { handleError: (error: Error, context?: any) => void }
}

interface ValidationConfig { projectRoot?: string;
    validateSyntax?: boolean;
    validateImports?: boolean;
    validateExports?: boolean;
    validateReferences?: boolean;
    allowedFileExtensions?: string[];
    excludePatterns?: RegExp[];
    }
}

interface ValidationStats { totalFiles: number,
    validFiles: number,
    errorFiles: number,
    warningFiles: number,
    startTime: number | null,
    endTime: number | null }
}

interface SyntaxValidation { valid: boolean,
    errors: string[] }
}

interface ImportValidation { valid: boolean,
    errors: string[],
    missing: string[] }
}

interface ExportValidation { valid: boolean,
    errors: string[] }
}

interface ReferenceValidation { valid: boolean,
    errors: string[],
    unreferenced: string[] }
}

interface FileValidationResult { filePath: string,
    isValid: boolean,
    errors: string[],
    warnings: string[],
    syntax: SyntaxValidation,
    imports: ImportValidation,
    exports: ExportValidation,
    references: ReferenceValidation
    }
}

interface CheckResult { isValid: boolean,
    error?: string }
}

interface ImportInfo { path: string,
    names: string[] }
}

interface ValidationSummary { totalFiles: number,
    validFiles: number,
    errorFiles: number,
    warningFiles: number,
    successRate: number,
    duration: string }
}

interface ErrorInfo { file: string,
    error: string }
}

interface WarningInfo { file: string,
    warning: string }
}

interface ValidationReport { summary: ValidationSummary,
    results: FileValidationResult[],
    errors: ErrorInfo[],
    warnings: WarningInfo[]
    }
}

interface SavedReport { timestamp: string,
    validation: ValidationReport
    }
}

/**
 * ValidationEngine - コード変更の検証システム
 * リネーム後のファイルとクラスの整合性を検証
 */
export class ValidationEngine {
    private errorHandler: ErrorHandler;
    private projectRoot: string;
    private validationResults: Map<string, FileValidationResult>;
    private config: Required<ValidationConfig>;
    private stats: ValidationStats;
    constructor(config: ValidationConfig = {) {

        this.errorHandler = getErrorHandler();
        this.projectRoot = config.projectRoot || process.cwd();''
        this.validationResults = new Map(''';
            allowedFileExtensions: config.allowedFileExtensions || ['.js', '.mjs'],
            excludePatterns: config.excludePatterns || [/node_modules/,
                /\.test\.js$/,
                /\.spec\.js$/,
                /test\//];
                /tests\//];
    }
    }
            ] }
        };
        
        // 検証統計
        this.stats = { totalFiles: 0,
            validFiles: 0,
            errorFiles: 0,
            warningFiles: 0,
            startTime: null,
            endTime: null })
        })
    }
    
    /**
     * 指定されたファイルまたはディレクトリを検証
     */
    async validateTargets(targets: string | string[]): Promise<ValidationReport> { this.stats.startTime = Date.now();
        this.validationResults.clear();
        
        try {
            const targetList = Array.isArray(targets) ? targets: [targets],
            const filesToValidate = new Set<string>();
            
            // 検証対象ファイルを収集
            for(const target of targetList) {
                
            }
                await this.collectFiles(target, filesToValidate); }
            }
            
            console.log(`[ValidationEngine] Found ${ filesToValidate.size) files to validate`);
            
            // 各ファイルを検証
            for (const filePath of filesToValidate) { }
                await this.validateFile(filePath});
            }
            
            this.stats.endTime = Date.now();
            return this.generateValidationReport();
            '';
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ValidationEngine.validateTargets') }
            });
            throw error;
        }
    }
    
    /**
     * ファイル収集（再帰的）
     */
    private async collectFiles(targetPath: string, fileSet: Set<string>): Promise<void> { const fullPath = path.resolve(this.projectRoot, targetPath);
        
        try {
            const stats = fs.statSync(fullPath);
            
            if(stats.isFile() {
            
                if(this.shouldValidateFile(fullPath) {
            
            }
                    fileSet.add(fullPath); }
                }
            } else if(stats.isDirectory() { const entries = fs.readdirSync(fullPath);
                for(const entry of entries) {
                    const entryPath = path.join(fullPath, entry);
                    if(!this.isExcluded(entryPath) {
                }
                        await this.collectFiles(entryPath, fileSet); }
                    }
                }
            } catch (error) {
            console.warn(`[ValidationEngine] Cannot access ${fullPath}: ${(error as Error}).message}`);
        }
    }
    
    /**
     * ファイルが検証対象かどうかを判定
     */
    private shouldValidateFile(filePath: string): boolean { const ext = path.extname(filePath);
        return this.config.allowedFileExtensions.includes(ext) && !this.isExcluded(filePath); }
    }
    
    /**
     * ファイルが除外パターンに該当するかを判定
     */
    private isExcluded(filePath: string): boolean { return this.config.excludePatterns.some(pattern => pattern.test(filePath); }
    }
    
    /**
     * 単一ファイルを検証'
     */''
    private async validateFile(filePath: string'): Promise<void> { const result: FileValidationResult = {
            filePath,
            isValid: true,
            errors: [],
            warnings: [], }
            syntax: { valid: true, errors: [] },
            imports: { valid: true, errors: [], missing: [] },
            exports: { valid: true, errors: [] },
            references: { valid: true, errors: [], unreferenced: [] }
        };
        
        try { this.stats.totalFiles++;
            ';
            // ファイル読み込み
            const content = fs.readFileSync(filePath, 'utf8');
            
            // 構文検証
            if(this.config.validateSyntax) {
                
            }
                await this.validateSyntax(filePath, content, result); }
            }
            
            // インポート検証
            if (this.config.validateImports) { await this.validateImports(filePath, content, result); }
            }
            
            // エクスポート検証
            if (this.config.validateExports) { await this.validateExports(filePath, content, result); }
            }
            
            // 参照関係検証
            if (this.config.validateReferences) { await this.validateReferences(filePath, content, result); }
            }
            
            // 結果集計
            result.isValid = result.errors.length === 0;
            if (result.isValid) { this.stats.validFiles++; }
            } else { this.stats.errorFiles++; }
            }
            
            if (result.warnings.length > 0) { this.stats.warningFiles++; }
            } catch (error) { result.isValid = false; }
            result.errors.push(`File validation failed: ${(error as Error}).message}`);
            this.stats.errorFiles++;
        }
        
        this.validationResults.set(filePath, result);
    }
    
    /**
     * 構文検証
     */
    private async validateSyntax(filePath: string, content: string, result: FileValidationResult): Promise<void> { try {
            // 基本的な構文チェック（簡易版）
            const syntaxChecks = [this.checkBracketBalance(content),
                this.checkQuoteBalance(content)];
                this.checkBasicSyntax(content)];
            ];
            
            for(const check of syntaxChecks) {
            
                if (!check.isValid) {
                    result.syntax.valid = false;
            
            }
                    result.syntax.errors.push(check.error!); }
                    result.errors.push(`Syntax error: ${check.error)`});
                }
            } catch (error) { result.syntax.valid = false;
            result.syntax.errors.push((error as Error).message); }
            result.errors.push(`Syntax validation failed: ${(error as Error}).message}`);
        }
    }
    
    /**
     * インポート検証
     */
    private async validateImports(filePath: string, content: string, result: FileValidationResult): Promise<void> { try {
            const imports = this.extractImports(content);
            
            for(const importInfo of imports) {
            
                const resolvedPath = this.resolveImportPath(filePath, importInfo.path);
                
                if(!resolvedPath || !fs.existsSync(resolvedPath) {
                    result.imports.valid = false;
            
            }
                    result.imports.missing.push(importInfo.path); }
                    result.errors.push(`Missing import: ${importInfo.path)`});
                } else {  // インポートされたファイルで指定された名前が存在するかチェック }
                    await this.validateImportedNames(resolvedPath, importInfo, result); }
                }
            } catch (error) { result.imports.valid = false;
            result.imports.errors.push((error as Error).message); }
            result.errors.push(`Import validation failed: ${(error as Error}).message}`);
        }
    }
    
    /**
     * エクスポート検証
     */
    private async validateExports(filePath: string, content: string, result: FileValidationResult): Promise<void> { try {
            const exports = this.extractExports(content);
            const classes = this.extractClasses(content);
            const functions = this.extractFunctions(content);
            
            // エクスポートされた名前が実際に定義されているかチェック
            for(const exportName of exports) {
                const isDefined = classes.includes(exportName) || ;
            }
                                functions.includes(exportName) || }
                                content.includes(`const ${exportName}`) ||
                                content.includes(`let ${exportName}`) ||
                                content.includes(`var ${exportName}`);
                
                if(!isDefined) {
                ';'
                    result.exports.valid = false;'
                
                }'
                    result.exports.errors.push(`Undefined export: ${exportName)`'),' }'
                    result.warnings.push(`Export '${exportName')' is not defined in the file`});
                }
            } catch (error) { result.exports.valid = false;
            result.exports.errors.push((error as Error).message); }
            result.errors.push(`Export validation failed: ${(error as Error}).message}`);
        }
    }
    
    /**
     * 参照関係検証
     */
    private async validateReferences(filePath: string, content: string, result: FileValidationResult): Promise<void> { try {
            const classes = this.extractClasses(content);
            const imports = this.extractImports(content);
            const importedNames = imports.flatMap(imp => imp.names);
            
            // 未使用のインポートをチェック
            for(const importedName of importedNames) {
                '';
                const matches = content.match(new RegExp(`\\b${importedName')\\b`, 'g');
                const isUsed = matches && matches.length > 1; // import文以外でも使用
                
                if (!isUsed) {
            }
                    result.references.unreferenced.push(importedName); }
                    result.warnings.push(`Unused import: ${importedName)`});
                }
            } catch (error) { result.references.valid = false;
            result.references.errors.push((error as Error).message); }
            result.warnings.push(`Reference validation failed: ${(error as Error}).message}`);
        }
    }
    
    /**
     * 括弧のバランスチェック
     */''
    private checkBracketBalance(content: string'): CheckResult { ' }'
        const brackets: Record<string, number> = { '(': 0, '[': 0, '{': 0 };']'
        const pairs: Record<string, string> = { '(': '')', '[': ']', '{': '}' };
        
        for(const char of content) {
        
            if (char in brackets) {
        
        }
                brackets[char]++; }
            } else if (Object.values(pairs).includes(char) { const opening = Object.keys(pairs).find(k => pairs[k] === char)!;
                brackets[opening]--;
                if (brackets[opening] < 0) { }
                    return { isValid: false, error: `Unmatched closing bracket: ${char}` }
                }
            }
        }
        
        for(const [bracket, count] of Object.entries(brackets) { if (count !== 0) { }
                return { isValid: false, error: `Unmatched opening bracket: ${bracket} (${count} unmatched)` }
            }
        }
        
        return { isValid: true }
    }
    
    /**
     * クォートのバランスチェック
     */
    private checkQuoteBalance(content: string): CheckResult { let singleQuotes = 0;
        let doubleQuotes = 0;
        let backQuotes = 0;
        let escaped = false;
        
        for(let i = 0; i < content.length; i++) {
        
            const char = content[i];'
            '';
            if (escaped') {
                escaped = false;
        
        }
                continue; }
            }'
            '';
            if(char === '\\') {
                escaped = true;
            }
                continue; }
            }'
            '';
            switch(char') {'
                '';
                case "'": singleQuotes = (singleQuotes + 1") % 2; break;""
                case '"': doubleQuotes = (doubleQuotes + 1') % 2; break;'
            }'
                case '`': backQuotes = (backQuotes + 1) % 2; break; }
            }
        }'
        '';
        if (singleQuotes !== 0 || doubleQuotes !== 0 || backQuotes !== 0') { ' }'
            return { isValid: false, error: 'Unmatched quotes detected' }
        }
        
        return { isValid: true }
    }
    
    /**
     * 基本構文チェック
     */
    private checkBasicSyntax(content: string): CheckResult { // 基本的な構文エラーパターンをチェック
        const errorPatterns = [' }'
            { pattern: /\bfunction\s+\(\s*\')/, error: 'Invalid function syntax' },']'
            { pattern: /\bclass\s+\(\s*\')/, error: 'Invalid class syntax' },']'
            { pattern: /\bimport\s+{[^}]*}[^f]/, error: 'Invalid import syntax' },''
            { pattern: /\bexport\s+{[^}]*}[^f]/, error: 'Invalid export syntax' }
        ];
        
        for (const { pattern, error ) of errorPatterns) {
            if(pattern.test(content) { }
                return { isValid: false, error };
            }
        }
        
        return { isValid: true }
    }
    
    /**
     * インポート文を抽出
     */'
    private extractImports(content: string): ImportInfo[] { const imports: ImportInfo[] = [],' }'
        const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+)')? \s*from\s+['"]([^'"]+")['"]/g;
        let match;
        
        while((match = importRegex.exec(content) !== null) { const [, namedImports, namespaceImport, defaultImport, path] = match; : undefined
            const names: string[] = [],";
            "";
            if(namedImports") {"
                ";
            }"
                names.push(...namedImports.split(',').map(name => name.trim()); }
            }
            if (namespaceImport) { names.push(namespaceImport); }
            }
            if (defaultImport) { names.push(defaultImport); }
            }
            
            imports.push({ path, names ); }
        }
        
        return imports;
    }
    
    /**
     * エクスポート文を抽出
     */
    private extractExports(content: string): string[] { const exports: string[] = [], }
        const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|export\s+{\s*([^}]+)\s*}/g;
        let match;
        
        while((match = exportRegex.exec(content) !== null) { if (match[1]) {
                exports.push(match[1]); }'
            }''
            if(match[2]') {'
                ';'
            }'
                exports.push(...match[2].split(',').map(name => name.trim()); }
            }
        }
        
        return exports;
    }
    
    /**
     * クラス名を抽出
     */
    private extractClasses(content: string): string[] { const classes: string[] = [],
        const classRegex = /class\s+(\w+)/g;
        let match;
        
        while((match = classRegex.exec(content) !== null) {
            classes.push(match[1]); }
        }
        
        return classes;
    }
    
    /**
     * 関数名を抽出
     */
    private extractFunctions(content: string): string[] { const functions: string[] = [],
        const functionRegex = /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{)/g;
        let match;
        
        while((match = functionRegex.exec(content) !== null) {
            functions.push(match[1] || match[2]); }
        }
        
        return functions;
    }
    
    /**
     * インポートパスを解決'
     */''
    private resolveImportPath(fromFile: string, importPath: string'): string | null { try {'
            if(importPath.startsWith('.') {
                // 相対パス
                const dirname = path.dirname(fromFile);
                let resolved = path.resolve(dirname, importPath);
                ;
                // .js拡張子を追加してチェック
                if (!fs.existsSync(resolved') && !resolved.endsWith('.js')') {'
            }'
                    resolved += '.js'; }
                }
                
                return fs.existsSync(resolved) ? resolved: null,
            } else {  // 絶対パスまたはnode_modules }
                return null; // node_modulesは検証しない }
            } catch (error) { return null; }
        }
    }
    
    /**
     * インポートされた名前の存在を検証
     */''
    private async validateImportedNames(targetFile: string, importInfo: ImportInfo, result: FileValidationResult'): Promise<void> { try {'
            const targetContent = fs.readFileSync(targetFile, 'utf8');
            const exports = this.extractExports(targetContent);
            const classes = this.extractClasses(targetContent);
            const functions = this.extractFunctions(targetContent);
            
            const availableNames = [...exports, ...classes, ...functions];
            
            for(const importedName of importInfo.names) {
            ';'
                '';
                if (!availableNames.includes(importedName)') {
            
            }'
                    result.imports.valid = false;' }'
                    result.imports.errors.push(`'${importedName}' is not exported from ${importInfo.path}`');''
                    result.warnings.push(`Import '${importedName}' not found in ${importInfo.path)`});
                }
            } catch (error) {
            result.warnings.push(`Could not validate imports from ${importInfo.path}: ${(error as Error}).message}`);
        }
    }
    
    /**
     * 検証レポートを生成
     */
    private generateValidationReport(): ValidationReport { const duration = this.stats.endTime! - this.stats.startTime!;
        
        const report: ValidationReport = {
            summary: {
                totalFiles: this.stats.totalFiles,
                validFiles: this.stats.validFiles,
                errorFiles: this.stats.errorFiles,
                warningFiles: this.stats.warningFiles,
                successRate: this.stats.totalFiles > 0 ?   : undefined;
                    Math.round((this.stats.validFiles / this.stats.totalFiles) * 100) : 0, }
                duration: `${duration}ms`
            },
            results: Array.from(this.validationResults.values(),
            errors: [],
            warnings: [];
        },
        
        // エラーと警告を集計
        for(const result of report.results) {
            report.errors.push(...result.errors.map(error => ({ file: result.filePath, error ))
        }
            report.warnings.push(...result.warnings.map(warning => ({ file: result.filePath, warning ))) }
        }
        
        return report;
    }
    
    /**
     * 検証レポートをファイルに出力
     */
    async saveReport(report: ValidationReport, outputPath: string): Promise<void> { try {
            const reportContent: SavedReport = {
                timestamp: new Date().toISOString(),
                validation: report }
            },
            
            await fs.promises.writeFile(outputPath, JSON.stringify(reportContent, null, 2);
            console.log(`[ValidationEngine] Report saved to ${outputPath)`});''
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ValidationEngine.saveReport'),' }'
            }');
        }'
    }''
}