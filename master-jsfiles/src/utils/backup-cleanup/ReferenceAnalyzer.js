import fs from 'fs/promises';
import path from 'path';

/**
 * ReferenceAnalyzer - バックアップファイルへの参照を分析するクラス
 * Issue #104 のバックアップファイル削除前の安全性確認のための参照分析機能を提供
 */
export class ReferenceAnalyzer {
    constructor() {
        this.excludePatterns = [
            /node_modules/,
            /\.git/,
            /\.kiro/,
            /dist/,
            /build/,
            /coverage/,
            /file-size-report\.json$/,
            /CLAUDE\.md$/,
            /backup-cleanup/,
            /debug-investigation\.js$/
        ];
        
        this.searchExtensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.json', '.md'];
    }

    /**
     * 指定されたファイルへの参照を検索
     * @param {string} filePath - 検索対象ファイルパス
     * @returns {Promise<Object>} 参照分析結果
     */
    async searchImportReferences(filePath) {
        const fileName = path.basename(filePath);
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
        const relativePath = filePath.replace(/^\.\//, '');
        
        const importReferences = [];
        
        // プロジェクト内の全JSファイルを検索
        const allFiles = await this.getAllProjectFiles();
        
        for (const searchFile of allFiles) {
            try {
                const content = await fs.readFile(searchFile, 'utf8');
                const lines = content.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // import文の検索
                    if (this.containsImportReference(line, filePath, fileName, fileNameWithoutExt)) {
                        importReferences.push({
                            file: searchFile,
                            line: i + 1,
                            content: line.trim(),
                            type: 'import',
                            context: this.getContext(lines, i)
                        });
                    }
                }
            } catch (error) {
                // ファイル読み取りエラーは無視（バイナリファイル等）
                continue;
            }
        }
        
        return {
            filePath,
            importReferences,
            searchedFiles: allFiles.length,
            hasImportReferences: importReferences.length > 0
        };
    }

    /**
     * 文字列参照の検索
     * @param {string} filePath - 検索対象ファイルパス
     * @returns {Promise<Object>} 文字列参照結果
     */
    async searchStringReferences(filePath) {
        const fileName = path.basename(filePath);
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
        
        const stringReferences = [];
        const allFiles = await this.getAllProjectFiles();
        
        for (const searchFile of allFiles) {
            try {
                const content = await fs.readFile(searchFile, 'utf8');
                const lines = content.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // 文字列での参照を検索（import以外）
                    if (this.containsStringReference(line, filePath, fileName, fileNameWithoutExt) &&
                        !this.containsImportReference(line, filePath, fileName, fileNameWithoutExt)) {
                        
                        const isReportFile = this.isReportFile(searchFile);
                        
                        stringReferences.push({
                            file: searchFile,
                            line: i + 1,
                            content: line.trim(),
                            type: 'string',
                            isReportFile,
                            context: this.getContext(lines, i)
                        });
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        return {
            filePath,
            stringReferences,
            activeReferences: stringReferences.filter(ref => !ref.isReportFile),
            reportFileReferences: stringReferences.filter(ref => ref.isReportFile),
            hasActiveStringReferences: stringReferences.some(ref => !ref.isReportFile)
        };
    }

    /**
     * レポートファイルを除外した参照の検索
     * @param {Array} references - 参照配列
     * @returns {Array} フィルタリングされた参照
     */
    async excludeReportFiles(references) {
        return references.filter(ref => !this.isReportFile(ref.file));
    }

    /**
     * 参照コンテキストの分析
     * @param {Array} references - 参照配列
     * @returns {Object} コンテキスト分析結果
     */
    async analyzeReferenceContext(references) {
        const contextAnalysis = {
            byType: {
                import: references.filter(ref => ref.type === 'import'),
                string: references.filter(ref => ref.type === 'string')
            },
            byLocation: {},
            activeReferences: references.filter(ref => !ref.isReportFile),
            reportReferences: references.filter(ref => ref.isReportFile)
        };
        
        // ディレクトリ別の集計
        references.forEach(ref => {
            const dir = path.dirname(ref.file);
            if (!contextAnalysis.byLocation[dir]) {
                contextAnalysis.byLocation[dir] = [];
            }
            contextAnalysis.byLocation[dir].push(ref);
        });
        
        return contextAnalysis;
    }

    /**
     * 参照分析レポートの生成
     * @param {string} filePath - ファイルパス
     * @param {Object} analysis - 分析結果
     * @returns {Object} レポート
     */
    async generateReferenceReport(filePath, analysis) {
        const importAnalysis = analysis.importAnalysis || await this.searchImportReferences(filePath);
        const stringAnalysis = analysis.stringAnalysis || await this.searchStringReferences(filePath);
        
        const allReferences = [
            ...importAnalysis.importReferences,
            ...stringAnalysis.stringReferences
        ];
        
        const contextAnalysis = await this.analyzeReferenceContext(allReferences);
        
        return {
            filePath,
            summary: {
                totalReferences: allReferences.length,
                importReferences: importAnalysis.importReferences.length,
                stringReferences: stringAnalysis.stringReferences.length,
                activeReferences: contextAnalysis.activeReferences.length,
                reportFileReferences: contextAnalysis.reportReferences.length,
                hasSafetyBlockingReferences: contextAnalysis.activeReferences.length > 0
            },
            importAnalysis,
            stringAnalysis,
            contextAnalysis,
            safetyAssessment: {
                safeToDelete: contextAnalysis.activeReferences.length === 0,
                warnings: this.generateSafetyWarnings(contextAnalysis),
                recommendations: this.generateSafetyRecommendations(contextAnalysis)
            },
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * プロジェクト内の全ファイルを取得
     * @returns {Promise<Array>} ファイルパス配列
     */
    async getAllProjectFiles() {
        const files = [];
        
        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await scanDirectory(fullPath);
                    } else if (entry.isFile()) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // ディレクトリアクセスエラーは無視
            }
        }
        
        await scanDirectory('.');
        
        // 除外パターンとファイル拡張子でフィルタリング
        return files.filter(file => {
            const shouldExclude = this.excludePatterns.some(pattern => pattern.test(file));
            const hasValidExtension = this.searchExtensions.includes(path.extname(file));
            return !shouldExclude && hasValidExtension;
        });
    }

    /**
     * import文に対象ファイルへの参照が含まれているかチェック
     * @param {string} line - 検査対象行
     * @param {string} filePath - ファイルパス
     * @param {string} fileName - ファイル名
     * @param {string} fileNameWithoutExt - 拡張子なしファイル名
     * @returns {boolean} 含まれているかどうか
     */
    containsImportReference(line, filePath, fileName, fileNameWithoutExt) {
        const trimmedLine = line.trim();
        
        // import文の正規表現パターン
        const importPatterns = [
            /import\s+.*\s+from\s+['"]/,
            /import\s*\(/,
            /require\s*\(/
        ];
        
        const isImportLine = importPatterns.some(pattern => pattern.test(trimmedLine));
        
        if (!isImportLine) {
            return false;
        }
        
        // ファイル名やパスの参照をチェック
        return trimmedLine.includes(fileName) ||
               trimmedLine.includes(fileNameWithoutExt) ||
               trimmedLine.includes(filePath.replace(/^\.\//, ''));
    }

    /**
     * 文字列に対象ファイルへの参照が含まれているかチェック
     * @param {string} line - 検査対象行
     * @param {string} filePath - ファイルパス
     * @param {string} fileName - ファイル名
     * @param {string} fileNameWithoutExt - 拡張子なしファイル名
     * @returns {boolean} 含まれているかどうか
     */
    containsStringReference(line, filePath, fileName, fileNameWithoutExt) {
        return line.includes(fileName) ||
               line.includes(fileNameWithoutExt) ||
               line.includes(filePath);
    }

    /**
     * レポートファイルかどうかの判定
     * @param {string} filePath - ファイルパス
     * @returns {boolean} レポートファイルかどうか
     */
    isReportFile(filePath) {
        return /file-size-report\.json$/.test(filePath) ||
               /\.log$/.test(filePath) ||
               /report/.test(filePath.toLowerCase());
    }

    /**
     * 行の前後コンテキストを取得
     * @param {Array} lines - 全行配列
     * @param {number} lineIndex - 対象行インデックス
     * @param {number} contextLines - 前後の行数
     * @returns {Object} コンテキスト情報
     */
    getContext(lines, lineIndex, contextLines = 2) {
        const start = Math.max(0, lineIndex - contextLines);
        const end = Math.min(lines.length - 1, lineIndex + contextLines);
        
        return {
            before: lines.slice(start, lineIndex),
            target: lines[lineIndex],
            after: lines.slice(lineIndex + 1, end + 1),
            lineNumber: lineIndex + 1
        };
    }

    /**
     * 安全性に関する警告を生成
     * @param {Object} contextAnalysis - コンテキスト分析結果
     * @returns {Array} 警告配列
     */
    generateSafetyWarnings(contextAnalysis) {
        const warnings = [];
        
        if (contextAnalysis.activeReferences.length > 0) {
            warnings.push({
                level: 'high',
                message: `${contextAnalysis.activeReferences.length}個のアクティブな参照が見つかりました`,
                references: contextAnalysis.activeReferences.length
            });
        }
        
        if (contextAnalysis.byType.import.length > 0) {
            warnings.push({
                level: 'critical',
                message: `${contextAnalysis.byType.import.length}個のimport文で参照されています`,
                references: contextAnalysis.byType.import.length
            });
        }
        
        return warnings;
    }

    /**
     * 安全性に関する推奨事項を生成
     * @param {Object} contextAnalysis - コンテキスト分析結果
     * @returns {Array} 推奨事項配列
     */
    generateSafetyRecommendations(contextAnalysis) {
        const recommendations = [];
        
        if (contextAnalysis.activeReferences.length === 0) {
            recommendations.push({
                type: 'safe_deletion',
                message: 'アクティブな参照が見つからないため、安全に削除できます'
            });
        } else {
            recommendations.push({
                type: 'manual_review',
                message: 'アクティブな参照があるため、手動で確認してから削除してください'
            });
        }
        
        if (contextAnalysis.reportReferences.length > 0) {
            recommendations.push({
                type: 'info',
                message: `${contextAnalysis.reportReferences.length}個のレポートファイルでの参照は削除後に更新されます`
            });
        }
        
        return recommendations;
    }
}

export default ReferenceAnalyzer;