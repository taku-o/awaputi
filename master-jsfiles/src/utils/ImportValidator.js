/**
 * インポート構文検証システム
 * Issue #131 対応
 */

import { promises as fs } from 'fs';
import path from 'path';

export class ImportValidator {
    constructor() {
        this.cache = new Map();
        this.validationRules = {
            requireFromClause: true,
            preventCircularDependencies: true,
            enforceConsistentQuotes: true,
            validateFileExtensions: true,
            checkMissingFiles: true,
            maxLineLength: 120
        };
    }

    /**
     * ファイルのインポート構文を包括的に検証
     */
    async validateFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return this.validateContent(content, filePath);
        } catch (error) {
            return {
                filePath,
                isValid: false,
                errors: [{
                    type: 'file_read_error',
                    message: `Could not read file: ${error.message}`,
                    line: 0
                }],
                warnings: [],
                suggestions: []
            };
        }
    }

    /**
     * ファイル内容のインポート構文を検証
     */
    validateContent(content, filePath = null) {
        const result = {
            filePath,
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };

        const lines = content.split('\n');
        
        // 各行をチェック
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            
            if (this.isImportLine(line)) {
                const lineValidation = this.validateImportLine(line, lineNumber, filePath);
                
                result.errors.push(...lineValidation.errors);
                result.warnings.push(...lineValidation.warnings);
                result.suggestions.push(...lineValidation.suggestions);
            }
        }

        // 全体的な構文チェック
        const globalValidation = this.validateGlobalImportStructure(content, filePath);
        result.errors.push(...globalValidation.errors);
        result.warnings.push(...globalValidation.warnings);
        result.suggestions.push(...globalValidation.suggestions);

        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * 単一のインポート行を検証
     */
    validateImportLine(line, lineNumber, filePath) {
        const result = {
            errors: [],
            warnings: [],
            suggestions: []
        };

        const trimmedLine = line.trim();

        // 1. 基本構文チェック
        if (this.validationRules.requireFromClause) {
            if (trimmedLine.startsWith('import ') && 
                !trimmedLine.includes(' from ') && 
                !this.isSideEffectImport(trimmedLine)) {
                result.errors.push({
                    type: 'missing_from_clause',
                    line: lineNumber,
                    message: 'Import statement missing "from" clause',
                    code: 'MISSING_FROM'
                });
            }
        }

        // 2. 括弧の整合性チェック
        const braceIssues = this.checkBraces(trimmedLine);
        if (braceIssues.length > 0) {
            result.errors.push(...braceIssues.map(issue => ({
                ...issue,
                line: lineNumber
            })));
        }

        // 3. 引用符の一貫性チェック
        if (this.validationRules.enforceConsistentQuotes) {
            const quoteIssues = this.checkQuoteConsistency(trimmedLine);
            if (quoteIssues.length > 0) {
                result.warnings.push(...quoteIssues.map(issue => ({
                    ...issue,
                    line: lineNumber
                })));
            }
        }

        // 4. パスの妥当性チェック
        const pathValidation = this.validateImportPath(trimmedLine, lineNumber, filePath);
        result.errors.push(...pathValidation.errors);
        result.warnings.push(...pathValidation.warnings);
        result.suggestions.push(...pathValidation.suggestions);

        // 5. 行の長さチェック
        if (this.validationRules.maxLineLength && line.length > this.validationRules.maxLineLength) {
            result.warnings.push({
                type: 'long_line',
                line: lineNumber,
                message: `Line length (${line.length}) exceeds recommended maximum (${this.validationRules.maxLineLength})`,
                code: 'LONG_LINE'
            });
        }

        return result;
    }

    /**
     * インポートパスの妥当性を検証
     */
    validateImportPath(line, lineNumber, currentFilePath) {
        const result = {
            errors: [],
            warnings: [],
            suggestions: []
        };

        const pathMatch = line.match(/from\s*['"`]([^'"`]+)['"`]/) || 
                         line.match(/import\s*['"`]([^'"`]+)['"`]/);
        
        if (!pathMatch) return result;

        const importPath = pathMatch[1];

        // 相対パスの検証
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            if (currentFilePath) {
                const resolvedPath = this.resolveRelativePath(importPath, currentFilePath);
                
                // ファイル存在チェック
                if (this.validationRules.checkMissingFiles) {
                    this.checkFileExists(resolvedPath).then(exists => {
                        if (!exists) {
                            result.errors.push({
                                type: 'missing_file',
                                line: lineNumber,
                                message: `Imported file does not exist: ${resolvedPath}`,
                                code: 'FILE_NOT_FOUND'
                            });
                        }
                    }).catch(() => {
                        // ファイルチェックでエラーが発生しても続行
                    });
                }
            }

            // パスの正規化チェック
            const normalizedPath = this.normalizePath(importPath);
            if (normalizedPath !== importPath) {
                result.suggestions.push({
                    type: 'path_normalization',
                    line: lineNumber,
                    message: `Consider normalizing path: ${importPath} → ${normalizedPath}`,
                    code: 'NORMALIZE_PATH'
                });
            }
        }

        // ファイル拡張子チェック
        if (this.validationRules.validateFileExtensions) {
            if (importPath.includes('.js') && !importPath.endsWith('.js')) {
                result.warnings.push({
                    type: 'suspicious_extension',
                    line: lineNumber,
                    message: 'File extension in the middle of path may cause issues',
                    code: 'SUSPICIOUS_EXTENSION'
                });
            }
        }

        return result;
    }

    /**
     * グローバルなインポート構造を検証
     */
    validateGlobalImportStructure(content, filePath) {
        const result = {
            errors: [],
            warnings: [],
            suggestions: []
        };

        // インポート文の順序チェック
        const importOrder = this.analyzeImportOrder(content);
        if (importOrder.hasIssues) {
            result.warnings.push({
                type: 'import_order',
                line: 0,
                message: 'Consider organizing imports: node modules → relative imports',
                code: 'IMPORT_ORDER'
            });
        }

        // 重複インポートの検出
        const duplicates = this.findDuplicateImports(content);
        for (const duplicate of duplicates) {
            result.warnings.push({
                type: 'duplicate_import',
                line: duplicate.line,
                message: `Duplicate import detected: ${duplicate.path}`,
                code: 'DUPLICATE_IMPORT'
            });
        }

        // 未使用インポートの検出（簡易版）
        const unusedImports = this.findUnusedImports(content);
        for (const unused of unusedImports) {
            result.warnings.push({
                type: 'unused_import',
                line: unused.line,
                message: `Possibly unused import: ${unused.name}`,
                code: 'UNUSED_IMPORT'
            });
        }

        return result;
    }

    /**
     * インポート行かどうかを判定
     */
    isImportLine(line) {
        const trimmedLine = line.trim();
        return trimmedLine.startsWith('import ') || 
               trimmedLine.includes(' import(') ||
               trimmedLine.includes('require(');
    }

    /**
     * サイドエフェクトインポートかどうかを判定
     */
    isSideEffectImport(line) {
        return /^import\s*['"`][^'"`]+['"`]\s*;?\s*$/.test(line.trim());
    }

    /**
     * 括弧の整合性をチェック
     */
    checkBraces(line) {
        const issues = [];
        
        let braceCount = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '{') braceCount++;
            if (line[i] === '}') braceCount--;
        }
        
        if (braceCount > 0) {
            issues.push({
                type: 'unclosed_brace',
                message: 'Unclosed brace in import statement',
                code: 'UNCLOSED_BRACE'
            });
        } else if (braceCount < 0) {
            issues.push({
                type: 'extra_closing_brace',
                message: 'Extra closing brace in import statement',
                code: 'EXTRA_BRACE'
            });
        }

        return issues;
    }

    /**
     * 引用符の一貫性をチェック
     */
    checkQuoteConsistency(line) {
        const issues = [];
        
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        const backticks = (line.match(/`/g) || []).length;
        
        if (singleQuotes > 0 && doubleQuotes > 0) {
            issues.push({
                type: 'mixed_quotes',
                message: 'Mixed quote styles in import statement',
                code: 'MIXED_QUOTES'
            });
        }

        return issues;
    }

    /**
     * インポートの順序を分析
     */
    analyzeImportOrder(content) {
        const imports = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (this.isImportLine(line)) {
                const pathMatch = line.match(/from\s*['"`]([^'"`]+)['"`]/) || 
                                 line.match(/import\s*['"`]([^'"`]+)['"`]/);
                if (pathMatch) {
                    imports.push({
                        line: i + 1,
                        path: pathMatch[1],
                        isNodeModule: !pathMatch[1].startsWith('./') && !pathMatch[1].startsWith('../'),
                        isRelative: pathMatch[1].startsWith('./') || pathMatch[1].startsWith('../')
                    });
                }
            }
        }

        // 順序の問題をチェック
        let hasNodeModuleAfterRelative = false;
        let foundRelative = false;
        
        for (const imp of imports) {
            if (imp.isRelative) {
                foundRelative = true;
            } else if (imp.isNodeModule && foundRelative) {
                hasNodeModuleAfterRelative = true;
                break;
            }
        }

        return {
            imports,
            hasIssues: hasNodeModuleAfterRelative
        };
    }

    /**
     * 重複インポートを検出
     */
    findDuplicateImports(content) {
        const imports = new Map();
        const duplicates = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (this.isImportLine(line)) {
                const pathMatch = line.match(/from\s*['"`]([^'"`]+)['"`]/) || 
                                 line.match(/import\s*['"`]([^'"`]+)['"`]/);
                if (pathMatch) {
                    const path = pathMatch[1];
                    if (imports.has(path)) {
                        duplicates.push({
                            line: i + 1,
                            path: path,
                            previousLine: imports.get(path)
                        });
                    } else {
                        imports.set(path, i + 1);
                    }
                }
            }
        }

        return duplicates;
    }

    /**
     * 未使用インポートを検出（簡易版）
     */
    findUnusedImports(content) {
        const unused = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (this.isImportLine(line)) {
                // 名前付きインポートから名前を抽出
                const namedMatch = line.match(/import\s*\{\s*([^}]+)\s*\}/);
                if (namedMatch) {
                    const names = namedMatch[1].split(',').map(name => name.trim());
                    for (const name of names) {
                        const cleanName = name.split(' as ')[0].trim();
                        if (!this.isNameUsedInContent(cleanName, content, i)) {
                            unused.push({
                                line: i + 1,
                                name: cleanName
                            });
                        }
                    }
                }
                
                // デフォルトインポートをチェック
                const defaultMatch = line.match(/import\s+(\w+)\s+from/);
                if (defaultMatch) {
                    const name = defaultMatch[1];
                    if (!this.isNameUsedInContent(name, content, i)) {
                        unused.push({
                            line: i + 1,
                            name: name
                        });
                    }
                }
            }
        }

        return unused;
    }

    /**
     * 名前がコンテンツ内で使用されているかチェック
     */
    isNameUsedInContent(name, content, importLineIndex) {
        const lines = content.split('\n');
        
        // インポート行以外の行で名前が使用されているかチェック
        for (let i = 0; i < lines.length; i++) {
            if (i === importLineIndex) continue; // インポート行はスキップ
            
            const line = lines[i];
            if (line.includes(name)) {
                // より厳密なチェック: 単語境界でマッチするか
                const wordBoundaryRegex = new RegExp(`\\b${name}\\b`);
                if (wordBoundaryRegex.test(line)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * 相対パスを解決
     */
    resolveRelativePath(relativePath, currentFilePath) {
        const currentDir = path.dirname(currentFilePath);
        let resolved = path.resolve(currentDir, relativePath);
        
        // .js拡張子を追加（必要な場合）
        if (!path.extname(resolved)) {
            resolved += '.js';
        }
        
        return resolved;
    }

    /**
     * パスの正規化
     */
    normalizePath(importPath) {
        return path.normalize(importPath).replace(/\\/g, '/');
    }

    /**
     * ファイルの存在確認
     */
    async checkFileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 検証ルールを設定
     */
    setValidationRules(rules) {
        this.validationRules = { ...this.validationRules, ...rules };
    }

    /**
     * 検証結果のサマリーを生成
     */
    generateValidationSummary(results) {
        const summary = {
            totalFiles: results.length,
            validFiles: 0,
            filesWithErrors: 0,
            filesWithWarnings: 0,
            totalErrors: 0,
            totalWarnings: 0,
            totalSuggestions: 0,
            errorTypes: {},
            warningTypes: {}
        };

        for (const result of results) {
            if (result.isValid) {
                summary.validFiles++;
            }
            
            if (result.errors.length > 0) {
                summary.filesWithErrors++;
                summary.totalErrors += result.errors.length;
                
                for (const error of result.errors) {
                    summary.errorTypes[error.type] = (summary.errorTypes[error.type] || 0) + 1;
                }
            }
            
            if (result.warnings.length > 0) {
                summary.filesWithWarnings++;
                summary.totalWarnings += result.warnings.length;
                
                for (const warning of result.warnings) {
                    summary.warningTypes[warning.type] = (summary.warningTypes[warning.type] || 0) + 1;
                }
            }
            
            summary.totalSuggestions += result.suggestions.length;
        }

        return summary;
    }
}