import { getErrorHandler } from '../ErrorHandler.js';
import fs from 'fs';
import path from 'path';

/**
 * NamingConflictDetector - 命名競合検出システム
 * 新規ファイル作成時やクラス名変更時の重複を事前に検出し防ぐ
 */
export class NamingConflictDetector {
    constructor(config = {}) {
        this.errorHandler = getErrorHandler();
        this.projectRoot = config.projectRoot || process.cwd();
        
        // 検出設定
        this.config = {
            // 検出対象
            detectFileNames: config.detectFileNames !== false,
            detectClassNames: config.detectClassNames !== false,
            detectFunctionNames: config.detectFunctionNames !== false,
            
            // 検索パターン
            searchPatterns: config.searchPatterns || [
                'src/**/*.js',
                'src/**/*.mjs'
            ],
            
            // 除外パターン
            excludePatterns: config.excludePatterns || [
                /node_modules/,
                /\.test\.js$/,
                /\.spec\.js$/,
                /test\//,
                /tests\//,
                /\.backup\./,
                /\.tmp\./
            ],
            
            // 許可される重複（同名でも問題ないパターン）
            allowedDuplicates: config.allowedDuplicates || [
                'index.js',
                'utils.js',
                'constants.js',
                'config.js'
            ],
            
            // 警告レベルの設定
            warningLevel: config.warningLevel || 'strict' // 'loose', 'normal', 'strict'
        };
        
        // キャッシュ
        this.nameCache = new Map();
        this.lastScanTime = 0;
        this.cacheValidityTime = 60 * 1000; // 1分
    }
    
    /**
     * プロジェクト全体をスキャンして現在の命名状況を把握
     * @returns {Promise<Object>} スキャン結果
     */
    async scanProject() {
        console.log('[NamingConflictDetector] Scanning project for existing names...');
        
        const scanResult = {
            files: new Map(),      // ファイル名 -> [パス配列]
            classes: new Map(),    // クラス名 -> [{ file, line }配列]  
            functions: new Map(),  // 関数名 -> [{ file, line }配列]
            conflicts: {
                files: [],
                classes: [],
                functions: []
            },
            statistics: {
                totalFiles: 0,
                totalClasses: 0,
                totalFunctions: 0,
                duplicateFiles: 0,
                duplicateClasses: 0,
                duplicateFunctions: 0
            }
        };
        
        try {
            // プロジェクトルートから再帰的にファイルを検索
            await this.scanDirectory(this.projectRoot, scanResult);
            
            // 競合を分析
            this.analyzeConflicts(scanResult);
            
            // キャッシュを更新
            this.nameCache = scanResult;
            this.lastScanTime = Date.now();
            
            console.log(`[NamingConflictDetector] Scan complete: ${scanResult.statistics.totalFiles} files processed`);
            return scanResult;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'NamingConflictDetector.scanProject'
            });
            throw error;
        }
    }
    
    /**
     * ディレクトリを再帰的にスキャン
     * @param {string} dirPath - スキャン対象ディレクトリ
     * @param {Object} scanResult - スキャン結果オブジェクト
     */
    async scanDirectory(dirPath, scanResult) {
        try {
            const entries = fs.readdirSync(dirPath);
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry);
                
                if (this.isExcluded(fullPath)) {
                    continue;
                }
                
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    await this.scanDirectory(fullPath, scanResult);
                } else if (stats.isFile() && this.shouldScanFile(fullPath)) {
                    await this.scanFile(fullPath, scanResult);
                }
            }
        } catch (error) {
            console.warn(`[NamingConflictDetector] Cannot scan directory ${dirPath}: ${error.message}`);
        }
    }
    
    /**
     * 単一ファイルをスキャン
     * @param {string} filePath - ファイルパス
     * @param {Object} scanResult - スキャン結果オブジェクト
     */
    async scanFile(filePath, scanResult) {
        try {
            scanResult.statistics.totalFiles++;
            
            // ファイル名を記録
            if (this.config.detectFileNames) {
                const fileName = path.basename(filePath);
                if (!scanResult.files.has(fileName)) {
                    scanResult.files.set(fileName, []);
                }
                scanResult.files.get(fileName).push(filePath);
            }
            
            // ファイル内容を解析
            const content = fs.readFileSync(filePath, 'utf8');
            
            // クラス名を抽出
            if (this.config.detectClassNames) {
                const classes = this.extractClasses(content);
                classes.forEach(({ name, line }) => {
                    scanResult.statistics.totalClasses++;
                    if (!scanResult.classes.has(name)) {
                        scanResult.classes.set(name, []);
                    }
                    scanResult.classes.get(name).push({ file: filePath, line });
                });
            }
            
            // 関数名を抽出
            if (this.config.detectFunctionNames) {
                const functions = this.extractFunctions(content);
                functions.forEach(({ name, line }) => {
                    scanResult.statistics.totalFunctions++;
                    if (!scanResult.functions.has(name)) {
                        scanResult.functions.set(name, []);
                    }
                    scanResult.functions.get(name).push({ file: filePath, line });
                });
            }
            
        } catch (error) {
            console.warn(`[NamingConflictDetector] Cannot scan file ${filePath}: ${error.message}`);
        }
    }
    
    /**
     * 新しい名前が競合するかどうかをチェック
     * @param {string} name - チェック対象の名前
     * @param {string} type - 名前の種類 ('file', 'class', 'function')
     * @param {string} context - コンテキスト情報（ファイルパス等）
     * @returns {Promise<Object>} 競合検査結果
     */
    async checkNamingConflict(name, type, context = '') {
        // キャッシュが古い場合は再スキャン
        if (Date.now() - this.lastScanTime > this.cacheValidityTime) {
            await this.scanProject();
        }
        
        const result = {
            hasConflict: false,
            conflictLevel: 'none', // 'none', 'warning', 'error'
            conflicts: [],
            suggestions: [],
            message: ''
        };
        
        try {
            switch (type) {
                case 'file':
                    return await this.checkFileNameConflict(name, context, result);
                case 'class':
                    return await this.checkClassNameConflict(name, context, result);
                case 'function':
                    return await this.checkFunctionNameConflict(name, context, result);
                default:
                    throw new Error(`Unknown name type: ${type}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'NamingConflictDetector.checkNamingConflict'
            });
            result.hasConflict = true;
            result.conflictLevel = 'error';
            result.message = `Error checking conflict: ${error.message}`;
            return result;
        }
    }
    
    /**
     * ファイル名の競合をチェック
     * @param {string} fileName - ファイル名
     * @param {string} filePath - ファイルパス
     * @param {Object} result - 結果オブジェクト
     * @returns {Object} 更新された結果オブジェクト
     */
    async checkFileNameConflict(fileName, filePath, result) {
        if (!this.nameCache.files) {
            await this.scanProject();
        }
        
        const existingFiles = this.nameCache.files.get(fileName) || [];
        const conflictingFiles = existingFiles.filter(existing => existing !== filePath);
        
        if (conflictingFiles.length > 0) {
            // 許可された重複かチェック
            if (this.config.allowedDuplicates.includes(fileName)) {
                result.conflictLevel = 'warning';
                result.message = `File name '${fileName}' is duplicated but allowed`;
            } else {
                result.hasConflict = true;
                result.conflictLevel = 'error';
                result.conflicts = conflictingFiles;
                result.message = `File name '${fileName}' conflicts with ${conflictingFiles.length} existing files`;
                
                // 代替案を提案
                result.suggestions = this.generateFileNameSuggestions(fileName, filePath);
            }
        } else {
            result.message = `File name '${fileName}' is available`;
        }
        
        return result;
    }
    
    /**
     * クラス名の競合をチェック
     * @param {string} className - クラス名
     * @param {string} filePath - ファイルパス
     * @param {Object} result - 結果オブジェクト
     * @returns {Object} 更新された結果オブジェクト
     */
    async checkClassNameConflict(className, filePath, result) {
        if (!this.nameCache.classes) {
            await this.scanProject();
        }
        
        const existingClasses = this.nameCache.classes.get(className) || [];
        const conflictingClasses = existingClasses.filter(existing => existing.file !== filePath);
        
        if (conflictingClasses.length > 0) {
            result.hasConflict = true;
            result.conflictLevel = this.determineConflictLevel(conflictingClasses, filePath);
            result.conflicts = conflictingClasses;
            result.message = `Class name '${className}' conflicts with ${conflictingClasses.length} existing classes`;
            
            // 代替案を提案
            result.suggestions = this.generateClassNameSuggestions(className, filePath);
        } else {
            result.message = `Class name '${className}' is available`;
        }
        
        return result;
    }
    
    /**
     * 関数名の競合をチェック
     * @param {string} functionName - 関数名
     * @param {string} filePath - ファイルパス
     * @param {Object} result - 結果オブジェクト
     * @returns {Object} 更新された結果オブジェクト
     */
    async checkFunctionNameConflict(functionName, filePath, result) {
        if (!this.nameCache.functions) {
            await this.scanProject();
        }
        
        const existingFunctions = this.nameCache.functions.get(functionName) || [];
        const conflictingFunctions = existingFunctions.filter(existing => existing.file !== filePath);
        
        if (conflictingFunctions.length > 0) {
            // 関数名は比較的競合を許容
            result.conflictLevel = 'warning';
            result.conflicts = conflictingFunctions;
            result.message = `Function name '${functionName}' is used in ${conflictingFunctions.length} other files`;
            
            // 同じディレクトリ内では警告レベルを上げる
            const sameDirectory = conflictingFunctions.some(existing => 
                path.dirname(existing.file) === path.dirname(filePath)
            );
            
            if (sameDirectory) {
                result.hasConflict = true;
                result.conflictLevel = 'error';
                result.suggestions = this.generateFunctionNameSuggestions(functionName, filePath);
            }
        } else {
            result.message = `Function name '${functionName}' is available`;
        }
        
        return result;
    }
    
    /**
     * ファイル名の代替案を生成
     * @param {string} originalName - 元のファイル名
     * @param {string} filePath - ファイルパス
     * @returns {Array} 代替案配列
     */
    generateFileNameSuggestions(originalName, filePath) {
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        const dirName = path.basename(path.dirname(filePath));
        
        const suggestions = [];
        
        // ディレクトリ名をプレフィックスとして使用
        if (dirName !== 'src' && dirName !== '.') {
            const pascalDirName = this.toPascalCase(dirName);
            suggestions.push(`${pascalDirName}${this.toPascalCase(baseName)}${ext}`);
        }
        
        // 階層的な命名
        const pathSegments = filePath.split(path.sep).slice(-3, -1);
        if (pathSegments.length > 0) {
            const prefix = pathSegments.map(seg => this.toPascalCase(seg)).join('');
            suggestions.push(`${prefix}${this.toPascalCase(baseName)}${ext}`);
        }
        
        // 番号付きの代替案
        for (let i = 2; i <= 5; i++) {
            suggestions.push(`${baseName}${i}${ext}`);
        }
        
        return suggestions.filter(suggestion => suggestion !== originalName);
    }
    
    /**
     * クラス名の代替案を生成
     * @param {string} originalName - 元のクラス名
     * @param {string} filePath - ファイルパス
     * @returns {Array} 代替案配列
     */
    generateClassNameSuggestions(originalName, filePath) {
        const suggestions = [];
        const pathSegments = filePath.split(path.sep);
        
        // ディレクトリベースの命名
        const relevantSegments = pathSegments.slice(-3, -1).filter(seg => 
            seg !== 'src' && seg !== 'js' && !seg.includes('.')
        );
        
        for (const segment of relevantSegments) {
            const prefix = this.toPascalCase(segment);
            if (!originalName.startsWith(prefix)) {
                suggestions.push(`${prefix}${originalName}`);
            }
        }
        
        // ドメインベースの命名
        const domainPrefixes = ['Core', 'Debug', 'Utils', 'Advanced', 'Basic', 'Enhanced'];
        for (const prefix of domainPrefixes) {
            if (!originalName.startsWith(prefix)) {
                suggestions.push(`${prefix}${originalName}`);
            }
        }
        
        return suggestions.slice(0, 5);
    }
    
    /**
     * 関数名の代替案を生成
     * @param {string} originalName - 元の関数名
     * @param {string} filePath - ファイルパス
     * @returns {Array} 代替案配列
     */
    generateFunctionNameSuggestions(originalName, filePath) {
        const suggestions = [];
        const dirName = path.basename(path.dirname(filePath));
        
        // ディレクトリ名をプレフィックスとして使用
        if (dirName !== 'src' && dirName !== '.') {
            const camelDirName = this.toCamelCase(dirName);
            suggestions.push(`${camelDirName}${this.toPascalCase(originalName)}`);
        }
        
        // 一般的なプレフィックス
        const prefixes = ['create', 'init', 'setup', 'handle', 'process'];
        for (const prefix of prefixes) {
            if (!originalName.startsWith(prefix)) {
                suggestions.push(`${prefix}${this.toPascalCase(originalName)}`);
            }
        }
        
        return suggestions.slice(0, 5);
    }
    
    /**
     * 競合を分析
     * @param {Object} scanResult - スキャン結果
     */
    analyzeConflicts(scanResult) {
        // ファイルの競合
        for (const [fileName, filePaths] of scanResult.files.entries()) {
            if (filePaths.length > 1 && !this.config.allowedDuplicates.includes(fileName)) {
                scanResult.conflicts.files.push({
                    name: fileName,
                    files: filePaths,
                    count: filePaths.length
                });
                scanResult.statistics.duplicateFiles++;
            }
        }
        
        // クラスの競合
        for (const [className, classInfo] of scanResult.classes.entries()) {
            if (classInfo.length > 1) {
                scanResult.conflicts.classes.push({
                    name: className,
                    occurrences: classInfo,
                    count: classInfo.length
                });
                scanResult.statistics.duplicateClasses++;
            }
        }
        
        // 関数の競合
        for (const [functionName, functionInfo] of scanResult.functions.entries()) {
            if (functionInfo.length > 1) {
                // 同じディレクトリ内の競合のみを問題として報告
                const directories = new Set(functionInfo.map(info => path.dirname(info.file)));
                if (directories.size < functionInfo.length) {
                    scanResult.conflicts.functions.push({
                        name: functionName,
                        occurrences: functionInfo,
                        count: functionInfo.length
                    });
                    scanResult.statistics.duplicateFunctions++;
                }
            }
        }
    }
    
    /**
     * クラスからクラス名を抽出
     * @param {string} content - ファイル内容
     * @returns {Array} クラス情報配列
     */
    extractClasses(content) {
        const classes = [];
        const lines = content.split('\n');
        const classRegex = /class\s+(\w+)/g;
        
        lines.forEach((line, index) => {
            let match;
            while ((match = classRegex.exec(line)) !== null) {
                classes.push({
                    name: match[1],
                    line: index + 1
                });
            }
        });
        
        return classes;
    }
    
    /**
     * 関数名を抽出
     * @param {string} content - ファイル内容
     * @returns {Array} 関数情報配列
     */
    extractFunctions(content) {
        const functions = [];
        const lines = content.split('\n');
        const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{)|(\w+)\s*:\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{))/g;
        
        lines.forEach((line, index) => {
            let match;
            while ((match = functionRegex.exec(line)) !== null) {
                const functionName = match[1] || match[2] || match[3];
                if (functionName) {
                    functions.push({
                        name: functionName,
                        line: index + 1
                    });
                }
            }
        });
        
        return functions;
    }
    
    /**
     * 文字列をPascalCaseに変換
     * @param {string} str - 変換対象文字列
     * @returns {string} PascalCase文字列
     */
    toPascalCase(str) {
        return str.split(/[_-]/)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join('');
    }
    
    /**
     * 文字列をcamelCaseに変換
     * @param {string} str - 変換対象文字列
     * @returns {string} camelCase文字列
     */
    toCamelCase(str) {
        const pascalCase = this.toPascalCase(str);
        return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
    }
    
    /**
     * 競合レベルを決定
     * @param {Array} conflicts - 競合情報配列
     * @param {string} filePath - ファイルパス
     * @returns {string} 競合レベル
     */
    determineConflictLevel(conflicts, filePath) {
        if (this.config.warningLevel === 'loose') {
            return 'warning';
        }
        
        // 同じディレクトリ内の競合は重大
        const sameDirectory = conflicts.some(conflict => 
            path.dirname(conflict.file) === path.dirname(filePath)
        );
        
        if (sameDirectory) {
            return 'error';
        }
        
        return this.config.warningLevel === 'strict' ? 'error' : 'warning';
    }
    
    /**
     * パスが除外対象かどうかを判定
     * @param {string} filePath - ファイルパス
     * @returns {boolean} 除外対象の場合true
     */
    isExcluded(filePath) {
        return this.config.excludePatterns.some(pattern => pattern.test(filePath));
    }
    
    /**
     * ファイルがスキャン対象かどうかを判定
     * @param {string} filePath - ファイルパス
     * @returns {boolean} スキャン対象の場合true
     */
    shouldScanFile(filePath) {
        const ext = path.extname(filePath);
        return (ext === '.js' || ext === '.mjs') && !this.isExcluded(filePath);
    }
    
    /**
     * 検出結果レポートを生成
     * @returns {Promise<Object>} レポートオブジェクト
     */
    async generateReport() {
        const scanResult = await this.scanProject();
        
        return {
            timestamp: new Date().toISOString(),
            summary: scanResult.statistics,
            conflicts: scanResult.conflicts,
            recommendations: this.generateRecommendations(scanResult)
        };
    }
    
    /**
     * 改善提案を生成
     * @param {Object} scanResult - スキャン結果
     * @returns {Array} 推奨事項配列
     */
    generateRecommendations(scanResult) {
        const recommendations = [];
        
        if (scanResult.statistics.duplicateFiles > 0) {
            recommendations.push({
                type: 'file',
                priority: 'high',
                message: `${scanResult.statistics.duplicateFiles} duplicate file names found`,
                action: 'Rename files using domain-specific prefixes'
            });
        }
        
        if (scanResult.statistics.duplicateClasses > 0) {
            recommendations.push({
                type: 'class',
                priority: 'high',
                message: `${scanResult.statistics.duplicateClasses} duplicate class names found`,
                action: 'Apply namespace prefixes or refactor into separate modules'
            });
        }
        
        if (scanResult.statistics.duplicateFunctions > 0) {
            recommendations.push({
                type: 'function',
                priority: 'medium',
                message: `${scanResult.statistics.duplicateFunctions} duplicate function names found`,
                action: 'Review function naming and scope'
            });
        }
        
        return recommendations;
    }
}