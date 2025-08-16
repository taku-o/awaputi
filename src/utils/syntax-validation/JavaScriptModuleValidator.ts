/**
 * JavaScriptModuleValidator
 * ES6モジュールの構文検証ユーティリティ
 */

// Type definitions
interface ValidationError {
    type: string;
    message: string;
    line: number;
    column: number;
}

interface ValidationWarning {
    type: string;
    message: string;
    line: number;
    column: number;
}

interface ValidationStatistics {
    imports: number;
    exports: number;
    classes: number;
    functions: number;
    variables: number;
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    statistics: ValidationStatistics;
    filePath: string;
}

interface BracketPair {
    open: string;
    close: string;
    name: string;
}

interface StackItem {
    char: string;
    index: number;
}

export class JavaScriptModuleValidator {
    private errors: ValidationError[];
    private warnings: ValidationWarning[];
    private statistics: ValidationStatistics;

    constructor() {
        this.errors = [];
        this.warnings = [];
        this.statistics = {
            imports: 0,
            exports: 0,
            classes: 0,
            functions: 0,
            variables: 0
        };
    }

    /**
     * JavaScriptモジュールの構文を検証
     */
    async validateModule(moduleContent: string, filePath: string = ''): Promise<ValidationResult> {
        this.errors = [];
        this.warnings = [];
        this.statistics = {
            imports: 0,
            exports: 0,
            classes: 0,
            functions: 0,
            variables: 0
        };

        try {
            // 基本的な構文チェック
            await this.validateSyntax(moduleContent);
            
            // トークンの検証
            this.validateTokens(moduleContent);
            
            // 括弧・ブロックのマッチング（一時的に無効化）
            // this.validateBracketMatching(moduleContent);
            
            // インポート・エクスポートの検証
            this.validateImportsExports(moduleContent);
            
            // クラスと関数の構造チェック
            this.validateStructures(moduleContent);
            
            // 統計情報の収集
            this.collectStatistics(moduleContent);

            return {
                isValid: this.errors.length === 0,
                errors: this.errors,
                warnings: this.warnings,
                statistics: this.statistics,
                filePath
            };
        } catch (error) {
            this.errors.push({
                type: 'VALIDATION_ERROR',
                message: `モジュール検証エラー: ${(error as Error).message}`,
                line: 0,
                column: 0
            });

            return {
                isValid: false,
                errors: this.errors,
                warnings: this.warnings,
                statistics: this.statistics,
                filePath
            };
        }
    }

    /**
     * 基本的な構文チェック（動的インポートシミュレーション）
     */
    async validateSyntax(content: string): Promise<void> {
        try {
            // ES6モジュール構文をチェック
            // 注意: 実際の実行環境では dynamic import を使用
            const blob = new Blob([content], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            
            // 構文チェックのための仮想的な検証
            // 実際の環境では import(url) を使用するが、
            // ここでは基本的な構文パターンをチェック
            this.validateBasicSyntax(content);
            
            URL.revokeObjectURL(url);
        } catch (error) {
            this.errors.push({
                type: 'SYNTAX_ERROR',
                message: `構文エラー: ${(error as Error).message}`,
                line: this.findErrorLine(error as Error, content),
                column: 0
            });
        }
    }

    /**
     * 基本的な構文パターンの検証
     */
    validateBasicSyntax(content: string): void {
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const trimmed = line.trim();
            
            if (trimmed === '') return;
            
            // 不完全な文のチェック
            if (this.isIncompleteStatement(trimmed)) {
                this.errors.push({
                    type: 'INCOMPLETE_STATEMENT',
                    message: `不完全な文が検出されました: ${trimmed}`,
                    line: lineNumber,
                    column: 0
                });
            }
            
            // 予期しないトークンのチェック
            const unexpectedTokens = this.findUnexpectedTokens(trimmed);
            unexpectedTokens.forEach(token => {
                this.errors.push({
                    type: 'UNEXPECTED_TOKEN',
                    message: `予期しないトークン: ${token}`,
                    line: lineNumber,
                    column: line.indexOf(token)
                });
            });
        });
    }

    /**
     * トークンの検証
     */
    validateTokens(content: string): void {
        // 比較演算子の検証（コメント行は除外）
        const lines = content.split('\n');
        const comparisonOperators = /([!=]==?|[<>]=?)/g;
        let match;
        
        while ((match = comparisonOperators.exec(content)) !== null) {
            const lineNumber = this.getLineNumber(content, match.index);
            const lineContent = lines[lineNumber - 1];
            const trimmedLine = lineContent ? lineContent.trim() : '';
            
            // コメント行はスキップ
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
                continue;
            }
            
            const beforeChar = content[match.index - 1];
            const afterChar = content[match.index + match[0].length];
            
            // 不適切な比較演算子の使用をチェック（実際の構文エラーのみ）
            if (beforeChar === '=' && afterChar === '=') {
                this.errors.push({
                    type: 'INVALID_COMPARISON_OPERATOR',
                    message: `無効な比較演算子: ${match[0]} (前後に = がある)`,
                    line: lineNumber,
                    column: this.getColumnNumber(content, match.index)
                });
            }
        }
    }

    /**
     * 括弧とブロックのマッチングを検証
     */
    validateBracketMatching(content: string): void {
        const pairs: BracketPair[] = [
            { open: '(', close: ')', name: '丸括弧' },
            { open: '[', close: ']', name: '角括弧' },
            { open: '{', close: '}', name: '波括弧' }
        ];

        pairs.forEach(pair => {
            const stack: StackItem[] = [];
            let index = 0;
            
            for (const char of content) {
                if (char === pair.open) {
                    stack.push({ char, index });
                } else if (char === pair.close) {
                    if (stack.length === 0) {
                        this.errors.push({
                            type: 'UNMATCHED_BRACKET',
                            message: `対応しない${pair.name}の閉じ括弧: ${pair.close}`,
                            line: this.getLineNumber(content, index),
                            column: this.getColumnNumber(content, index)
                        });
                    } else {
                        stack.pop();
                    }
                }
                index++;
            }
            
            // 未閉じの括弧をチェック
            stack.forEach(item => {
                this.errors.push({
                    type: 'UNCLOSED_BRACKET',
                    message: `未閉じの${pair.name}: ${pair.open}`,
                    line: this.getLineNumber(content, item.index),
                    column: this.getColumnNumber(content, item.index)
                });
            });
        });
    }

    /**
     * インポート・エクスポート文の検証
     */
    validateImportsExports(content: string): void {
        // インポート文のチェック
        const importRegex = /^import\s+.*from\s+['"][^'"]*['"];?$/gm;
        let importMatch;
        while ((importMatch = importRegex.exec(content)) !== null) {
            this.validateImportStatement(importMatch[0], content, importMatch.index);
        }

        // エクスポート文のチェック
        const exportRegex = /^export\s+.*/gm;
        let exportMatch;
        while ((exportMatch = exportRegex.exec(content)) !== null) {
            this.validateExportStatement(exportMatch[0], content, exportMatch.index);
        }
    }

    /**
     * インポート文の個別検証
     */
    validateImportStatement(statement: string, content: string, index: number): void {
        // パス検証
        const pathMatch = statement.match(/from\s+['"]([^'"]*)['"]/);
        if (pathMatch) {
            const importPath = pathMatch[1];
            if (!importPath.endsWith('.js') && !importPath.startsWith('.') && !importPath.startsWith('/')) {
                this.warnings.push({
                    type: 'RELATIVE_IMPORT_WARNING',
                    message: `相対パスではないインポート: ${importPath}`,
                    line: this.getLineNumber(content, index),
                    column: 0
                });
            }
        }
    }

    /**
     * エクスポート文の個別検証
     */
    validateExportStatement(statement: string, content: string, index: number): void {
        // 名前付きエクスポートとデフォルトエクスポートのチェック
        if (statement.includes('export default') && statement.includes('export {')) {
            this.warnings.push({
                type: 'MIXED_EXPORT_WARNING',
                message: '同一行にデフォルトエクスポートと名前付きエクスポートが混在',
                line: this.getLineNumber(content, index),
                column: 0
            });
        }
    }

    /**
     * クラスと関数の構造チェック
     */
    validateStructures(content: string): void {
        // クラス定義のチェック
        const classRegex = /class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/g;
        let classMatch;
        while ((classMatch = classRegex.exec(content)) !== null) {
            this.validateClassStructure(classMatch, content);
        }

        // 関数定義のチェック
        const functionRegex = /(async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g;
        let functionMatch;
        while ((functionMatch = functionRegex.exec(content)) !== null) {
            this.validateFunctionStructure(functionMatch, content);
        }
    }

    /**
     * クラス構造の検証
     */
    validateClassStructure(match: RegExpExecArray, content: string): void {
        const className = match[1];
        const startIndex = match.index!;
        
        // クラス名の命名規則チェック
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(className)) {
            this.warnings.push({
                type: 'CLASS_NAMING_WARNING',
                message: `クラス名の命名規則警告: ${className} (PascalCaseを推奨)`,
                line: this.getLineNumber(content, startIndex),
                column: 0
            });
        }
    }

    /**
     * 関数構造の検証
     */
    validateFunctionStructure(match: RegExpExecArray, content: string): void {
        const functionName = match[2];
        const startIndex = match.index!;
        
        // 関数名の命名規則チェック
        if (!/^[a-z][a-zA-Z0-9]*$/.test(functionName)) {
            this.warnings.push({
                type: 'FUNCTION_NAMING_WARNING',
                message: `関数名の命名規則警告: ${functionName} (camelCaseを推奨)`,
                line: this.getLineNumber(content, startIndex),
                column: 0
            });
        }
    }

    /**
     * 統計情報の収集
     */
    collectStatistics(content: string): void {
        this.statistics.imports = (content.match(/^import\s+/gm) || []).length;
        this.statistics.exports = (content.match(/^export\s+/gm) || []).length;
        this.statistics.classes = (content.match(/class\s+\w+/g) || []).length;
        this.statistics.functions = (content.match(/(async\s+)?function\s+\w+/g) || []).length;
        this.statistics.variables = (content.match(/(let|const|var)\s+\w+/g) || []).length;
    }

    /**
     * ユーティリティメソッド群
     */
    isIncompleteStatement(line: string): boolean {
        // 基本的な不完全文のパターン
        const incompletePatterns = [
            /^if\s*\(\s*$/,
            /^for\s*\(\s*$/,
            /^while\s*\(\s*$/,
            /^function\s*$/,
            /^class\s*$/
        ];
        
        return incompletePatterns.some(pattern => pattern.test(line));
    }

    findUnexpectedTokens(line: string): string[] {
        const unexpectedTokens: string[] = [];
        
        // コメント行は除外
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
            return unexpectedTokens;
        }
        
        // 不正なトークンパターン（コメント以外で）
        if (/===\s*===\s*===/.test(line) && !trimmedLine.startsWith('//')) {
            unexpectedTokens.push('=== === ===');
        }
        if (/\?\?\?\?/.test(line) && !trimmedLine.startsWith('//')) {
            unexpectedTokens.push('????');
        }
        
        return unexpectedTokens;
    }

    getLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length;
    }

    getColumnNumber(content: string, index: number): number {
        const beforeContent = content.substring(0, index);
        const lastNewlineIndex = beforeContent.lastIndexOf('\n');
        return index - lastNewlineIndex;
    }

    findErrorLine(error: Error, content: string): number {
        // エラーメッセージから行番号を抽出する試み
        const lineMatch = error.message.match(/line (\d+)/i);
        return lineMatch ? parseInt(lineMatch[1]) : 1;
    }

    /**
     * 検証結果のサマリーを生成
     */
    generateSummary(result: ValidationResult): string {
        const parts: string[] = [];
        
        if (result.isValid) {
            parts.push('✅ モジュール検証: 合格');
        } else {
            parts.push(`❌ モジュール検証: 失敗 (${result.errors.length}件のエラー)`);
        }

        if (result.warnings.length > 0) {
            parts.push(`⚠️  警告: ${result.warnings.length}件`);
        }

        const stats = result.statistics;
        parts.push(`📊 統計: imports(${stats.imports}) exports(${stats.exports}) classes(${stats.classes}) functions(${stats.functions})`);

        return parts.join('\n');
    }
}