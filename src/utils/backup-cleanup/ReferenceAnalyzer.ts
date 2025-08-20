import fs from 'fs/promises';''
import path from 'path';

// Type definitions
interface ReferenceContext { before: string[],
    target: string,
    after: string[],
    lineNumber: number; }
}

interface ImportReference { file: string,
    line: number,';
    content: string,'';
    type: 'import',
    context: ReferenceContext;
    }
}

interface StringReference { file: string,
    line: number,';
    content: string,'';
    type: 'string',
    isReportFile: boolean,
    context: ReferenceContext;
    }
}

interface ImportSearchResult { filePath: string,
    importReferences: ImportReference[],
    searchedFiles: number,
    hasImportReferences: boolean; }
}

interface StringSearchResult { filePath: string,
    stringReferences: StringReference[],
    activeReferences: StringReference[],
    reportFileReferences: StringReference[],
    hasActiveStringReferences: boolean; }
}

interface ReferencesByType { import: ImportReference[],
    string: StringReference[];
    }
}

interface ReferencesByLocation { [directory: string]: (ImportReference | StringReference)[], }
}

interface ContextAnalysis { byType: ReferencesByType,
    byLocation: ReferencesByLocation,
    activeReferences: (ImportReference | StringReference)[],
    reportReferences: (ImportReference | StringReference)[]; }
}

interface SafetyWarning { level: string,
    message: string,
    references: number; }
}

interface SafetyRecommendation { type: string,
    message: string; }
}

interface SafetyAssessment { safeToDelete: boolean,
    warnings: SafetyWarning[],
    recommendations: SafetyRecommendation[];
    }
}

interface ReferenceSummary { totalReferences: number,
    importReferences: number,
    stringReferences: number,
    activeReferences: number,
    reportFileReferences: number,
    hasSafetyBlockingReferences: boolean; }
}

interface AnalysisInput { importAnalysis?: ImportSearchResult;
    stringAnalysis?: StringSearchResult;
    }
}

interface ReferenceReport { filePath: string,
    summary: ReferenceSummary,
    importAnalysis: ImportSearchResult,
    stringAnalysis: StringSearchResult,
    contextAnalysis: ContextAnalysis,
    safetyAssessment: SafetyAssessment,
    generatedAt: string; }
}

/**
 * ReferenceAnalyzer - バックアップファイルへの参照を分析するクラス
 * Issue #104 のバックアップファイル削除前の安全性確認のための参照分析機能を提供
 */
export class ReferenceAnalyzer {
    private excludePatterns: RegExp[];
    private searchExtensions: string[]';
'';
    constructor(''';
        this.searchExtensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.json', '.md']; }
    }

    /**
     * 指定されたファイルへの参照を検索
     */)'
    async searchImportReferences(filePath: string): Promise<ImportSearchResult> { const fileName = path.basename(filePath);''
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath)');''
        const relativePath = filePath.replace(/^\.\//, '');
        
        const importReferences: ImportReference[] = [],
        
        // プロジェクト内の全JSファイルを検索
        const allFiles = await this.getAllProjectFiles();'
        '';
        for(const searchFile of allFiles') {'
            try {''
                const content = await fs.readFile(searchFile, 'utf8'');''
                const lines = content.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // import文の検索
                    if(this.containsImportReference(line, filePath, fileName, fileNameWithoutExt) {
                        importReferences.push({)
                            file: searchFile,)';
                            line: i + 1),'';
                            content: line.trim('')';
                            type: 'import',);
        }
                            context: this.getContext(lines, i); }
                        });
                    }
                } catch (error) { // ファイル読み取りエラーは無視（バイナリファイル等）
                continue; }
            }
        }
        
        return { filePath,
            importReferences,
            searchedFiles: allFiles.length, };
            hasImportReferences: importReferences.length > 0 }
        },
    }

    /**
     * 文字列参照の検索
     */
    async searchStringReferences(filePath: string): Promise<StringSearchResult> { const fileName = path.basename(filePath);
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath);
        
        const stringReferences: StringReference[] = [],
        const allFiles = await this.getAllProjectFiles();'
        '';
        for(const searchFile of allFiles') {'
            try {''
                const content = await fs.readFile(searchFile, 'utf8'');''
                const lines = content.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // 文字列での参照を検索（import以外）
                    if (this.containsStringReference(line, filePath, fileName, fileNameWithoutExt) &&;
                        !this.containsImportReference(line, filePath, fileName, fileNameWithoutExt) {
                        
                        const isReportFile = this.isReportFile(searchFile);
                        
                        stringReferences.push({)
                            file: searchFile,)';
                            line: i + 1),'';
                            content: line.trim('')';
                            type: 'string');
                            isReportFile,);
        }
                            context: this.getContext(lines, i); }
                        });
                    }
                } catch (error) { continue; }
            }
        }
        
        return { filePath,
            stringReferences,
            activeReferences: stringReferences.filter(ref => !ref.isReportFile),
            reportFileReferences: stringReferences.filter(ref = > ref.isReportFile) };
            hasActiveStringReferences: stringReferences.some(ref => !ref.isReportFile); }
        };
    }

    /**
     * レポートファイルを除外した参照の検索
     */
    async excludeReportFiles(references: (ImportReference | StringReference)[]): Promise<(ImportReference | StringReference)[]> { return references.filter(ref => !this.isReportFile(ref.file); }
    }

    /**
     * 参照コンテキストの分析'
     */''
    async analyzeReferenceContext(references: (ImportReference | StringReference)[]'): Promise<ContextAnalysis> { const contextAnalysis: ContextAnalysis = {'
            byType: {''
                import: references.filter(ref => ref.type === 'import'') as ImportReference[],'';
                string: references.filter(ref => ref.type === 'string') as StringReference[] }
            },'
            byLocation: {},''
            activeReferences: references.filter(ref => ')'';
                !('isReportFile' in ref) || !ref.isReportFile'';
            '),';
            reportReferences: references.filter(ref = > ')';
                'isReportFile' in ref && ref.isReportFile) };
        
        // ディレクトリ別の集計
        references.forEach(ref => {  );
            const dir = path.dirname(ref.file);
            if (!contextAnalysis.byLocation[dir]) { }
                contextAnalysis.byLocation[dir] = []; }
            }
            contextAnalysis.byLocation[dir].push(ref);
        });
        
        return contextAnalysis;
    }

    /**
     * 参照分析レポートの生成
     */
    async generateReferenceReport(filePath: string, analysis: AnalysisInput = { ): Promise<ReferenceReport> {
        const importAnalysis = analysis.importAnalysis || await this.searchImportReferences(filePath);
        const stringAnalysis = analysis.stringAnalysis || await this.searchStringReferences(filePath);
        
        const allReferences: (ImportReference | StringReference)[] = [...importAnalysis.importReferences,];
            ...stringAnalysis.stringReferences];
        ];
        
        const contextAnalysis = await this.analyzeReferenceContext(allReferences);
        
        return { filePath,
            summary: {
                totalReferences: allReferences.length,
                importReferences: importAnalysis.importReferences.length,
                stringReferences: stringAnalysis.stringReferences.length,
                activeReferences: contextAnalysis.activeReferences.length,
                reportFileReferences: contextAnalysis.reportReferences.length, };
                hasSafetyBlockingReferences: contextAnalysis.activeReferences.length > 0 }
            },
            importAnalysis,
            stringAnalysis,
            contextAnalysis,
            safetyAssessment: { safeToDelete: contextAnalysis.activeReferences.length === 0,
                warnings: this.generateSafetyWarnings(contextAnalysis),
                recommendations: this.generateSafetyRecommendations(contextAnalysis); }
            },
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * プロジェクト内の全ファイルを取得
     */
    private async getAllProjectFiles(): Promise<string[]> { const files: string[] = [],
        
        const scanDirectory = async (dir: string): Promise<void> => {  }
            try { }
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for(const entry of entries) {
                
                    const fullPath = path.join(dir, entry.name);
                    
                    if(entry.isDirectory() {
                
                }
                        await scanDirectory(fullPath); }
                    } else if(entry.isFile() { files.push(fullPath); }'
                    }''
                } catch (error') { // ディレクトリアクセスエラーは無視 }
            }
        };'
        '';
        await scanDirectory('.');
        
        // 除外パターンとファイル拡張子でフィルタリング
        return files.filter(file => {  );
            const shouldExclude = this.excludePatterns.some(pattern => pattern.test(file);
            const hasValidExtension = this.searchExtensions.includes(path.extname(file); }
            return !shouldExclude && hasValidExtension; }
        });
    }

    /**
     * import文に対象ファイルへの参照が含まれているかチェック
     */'
    private containsImportReference(line: string, filePath: string, fileName: string, fileNameWithoutExt: string): boolean { ''
        const trimmedLine = line.trim(''';
            /import\s+.*\s+from\s+['"]/,);
            /import\s*\(/);
            /require\s*\(/;
        ];
        );
        const isImportLine = importPatterns.some(pattern => pattern.test(trimmedLine);
        
        if(!isImportLine) {
        
            
        
        }
            return false; }
        }
        
        // ファイル名やパスの参照をチェック"
        return trimmedLine.includes(fileName) ||"";
               trimmedLine.includes(fileNameWithoutExt") ||"";
               trimmedLine.includes(filePath.replace(/^\.\//, '');
    }

    /**
     * 文字列に対象ファイルへの参照が含まれているかチェック
     */
    private containsStringReference(line: string, filePath: string, fileName: string, fileNameWithoutExt: string): boolean { return line.includes(fileName) ||
               line.includes(fileNameWithoutExt) ||;
               line.includes(filePath); }
    }

    /**
     * レポートファイルかどうかの判定
     */
    private isReportFile(filePath: string): boolean { return /file-size-report\.json$/.test(filePath) ||
               /\.log$/.test(filePath) ||;
               /report/.test(filePath.toLowerCase(); }
    }

    /**
     * 行の前後コンテキストを取得
     */
    private getContext(lines: string[], lineIndex: number, contextLines: number = 2): ReferenceContext { const start = Math.max(0, lineIndex - contextLines);
        const end = Math.min(lines.length - 1, lineIndex + contextLines);
        
        return { before: lines.slice(start, lineIndex),
            target: lines[lineIndex],
            after: lines.slice(lineIndex + 1, end + 1), };
            lineNumber: lineIndex + 1 }
        },
    }

    /**
     * 安全性に関する警告を生成
     */
    private generateSafetyWarnings(contextAnalysis: ContextAnalysis): SafetyWarning[] { const warnings: SafetyWarning[] = [],'
        '';
        if(contextAnalysis.activeReferences.length > 0') {'
            warnings.push({'
        }'
                level: 'high', })
                message: `${contextAnalysis.activeReferences.length}個のアクティブな参照が見つかりました`,)
                references: contextAnalysis.activeReferences.length),
        }'
        '';
        if(contextAnalysis.byType.import.length > 0') {'
            warnings.push({'
        }'
                level: 'critical', })
                message: `${contextAnalysis.byType.import.length}個のimport文で参照されています`,)
                references: contextAnalysis.byType.import.length),
        }
        
        return warnings;
    }

    /**
     * 安全性に関する推奨事項を生成
     */
    private generateSafetyRecommendations(contextAnalysis: ContextAnalysis): SafetyRecommendation[] { const recommendations: SafetyRecommendation[] = [],'
        '';
        if(contextAnalysis.activeReferences.length === 0') {'
            recommendations.push({')'
                type: 'safe_deletion',');
        }'
                message: 'アクティブな参照が見つからないため、安全に削除できます')'); }'
        } else {  recommendations.push({')'
                type: 'manual_review',') }'
                message: 'アクティブな参照があるため、手動で確認してから削除してください'); }
        }'
        '';
        if(contextAnalysis.reportReferences.length > 0') {'
            recommendations.push({'
        })'
                type: 'info',') }'
                message: `${contextAnalysis.reportReferences.length}個のレポートファイルでの参照は削除後に更新されます`)'),
        }
        
        return recommendations;
    }
}
';
export default ReferenceAnalyzer;''
import path from 'path';

// Type definitions
interface Reference { file: string,
    line: number,';
    content: string,'';
    type: 'import' | 'string',
    isReportFile?: boolean;
    context: ContextInfo;
    }
}

interface ContextInfo { before: string[],
    target: string,
    after: string[],
    lineNumber: number; }
}

interface ImportAnalysisResult { filePath: string,
    importReferences: Reference[],
    searchedFiles: number,
    hasImportReferences: boolean; }
}

interface StringAnalysisResult { filePath: string,
    stringReferences: Reference[],
    activeReferences: Reference[],
    reportFileReferences: Reference[],
    hasActiveStringReferences: boolean; }
}

interface ContextAnalysis { byType: {
        import: Reference[],
        string: Reference[] }
    },
    byLocation: Record<string, Reference[]>;
    activeReferences: Reference[],
    reportReferences: Reference[],
    }
';
interface SafetyWarning { ''
    level: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    references: number; }
}
';
interface SafetyRecommendation { ''
    type: 'safe_deletion' | 'manual_review' | 'info',
    message: string; }
}

interface SafetyAssessment { safeToDelete: boolean,
    warnings: SafetyWarning[],
    recommendations: SafetyRecommendation[];
    }
}

interface ReferenceReport { filePath: string,
    summary: {
        totalReferences: number,
        importReferences: number,
        stringReferences: number,
        activeReferences: number,
        reportFileReferences: number,
        hasSafetyBlockingReferences: boolean }
    },
    importAnalysis: ImportAnalysisResult,
    stringAnalysis: StringAnalysisResult,
    contextAnalysis: ContextAnalysis,
    safetyAssessment: SafetyAssessment,
    generatedAt: string,
}

interface AnalysisInput { importAnalysis?: ImportAnalysisResult;
    stringAnalysis?: StringAnalysisResult;
    }
}

/**
 * ReferenceAnalyzer - バックアップファイルへの参照を分析するクラス
 * Issue #104 のバックアップファイル削除前の安全性確認のための参照分析機能を提供
 */
export class ReferenceAnalyzer {
    private excludePatterns: RegExp[];
    private searchExtensions: string[]';
'';
    constructor(''';
        this.searchExtensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.json', '.md']; }
    }

    /**
     * 指定されたファイルへの参照を検索
     */)'
    async searchImportReferences(filePath: string): Promise<ImportAnalysisResult> { const fileName = path.basename(filePath);''
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath)');''
        const relativePath = filePath.replace(/^\.\//, '');
        
        const importReferences: Reference[] = [],
        
        // プロジェクト内の全JSファイルを検索
        const allFiles = await this.getAllProjectFiles();'
        '';
        for(const searchFile of allFiles') {'
            try {''
                const content = await fs.readFile(searchFile, 'utf8'');''
                const lines = content.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // import文の検索
                    if(this.containsImportReference(line, filePath, fileName, fileNameWithoutExt) {
                        importReferences.push({)'
                            file: searchFile,')';
                            line: i + 1'),';
                            content: line.trim(,')';
                            type: 'import',);
        }
                            context: this.getContext(lines, i); }
                        });
                    }
                } catch (error) { // ファイル読み取りエラーは無視（バイナリファイル等）
                continue; }
            }
        }
        
        return { filePath,
            importReferences,
            searchedFiles: allFiles.length, };
            hasImportReferences: importReferences.length > 0 }
        },
    }

    /**
     * 文字列参照の検索
     */
    async searchStringReferences(filePath: string): Promise<StringAnalysisResult> { const fileName = path.basename(filePath);
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath);
        
        const stringReferences: Reference[] = [],
        const allFiles = await this.getAllProjectFiles();'
        '';
        for(const searchFile of allFiles') {'
            try {''
                const content = await fs.readFile(searchFile, 'utf8'');''
                const lines = content.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // 文字列での参照を検索（import以外）
                    if (this.containsStringReference(line, filePath, fileName, fileNameWithoutExt) &&;
                        !this.containsImportReference(line, filePath, fileName, fileNameWithoutExt) {
                        
                        const isReportFile = this.isReportFile(searchFile);
                        
                        stringReferences.push({)'
                            file: searchFile,')';
                            line: i + 1'),';
                            content: line.trim(,')';
                            type: 'string');
                            isReportFile,);
        }
                            context: this.getContext(lines, i); }
                        });
                    }
                } catch (error) { continue; }
            }
        }
        
        return { filePath,
            stringReferences,
            activeReferences: stringReferences.filter(ref => !ref.isReportFile);
            reportFileReferences: stringReferences.filter(ref => ref.isReportFile,) };
            hasActiveStringReferences: stringReferences.some(ref => !ref.isReportFile); }
        };
    }

    /**
     * レポートファイルを除外した参照の検索
     */
    async excludeReportFiles(references: Reference[]): Promise<Reference[]> { return references.filter(ref => !this.isReportFile(ref.file); }
    }

    /**
     * 参照コンテキストの分析'
     */''
    async analyzeReferenceContext(references: Reference[]'): Promise<ContextAnalysis> { const contextAnalysis: ContextAnalysis = {'
            byType: {''
                import: references.filter(ref => ref.type === 'import',')';
                string: references.filter(ref => ref.type === 'string'); }
            },
            byLocation: {}
            activeReferences: references.filter(ref => !ref.isReportFile,);
            reportReferences: references.filter(ref = > ref.isReportFile) };
        
        // ディレクトリ別の集計
        references.forEach(ref => {  );
            const dir = path.dirname(ref.file);
            if (!contextAnalysis.byLocation[dir]) { }
                contextAnalysis.byLocation[dir] = []; }
            }
            contextAnalysis.byLocation[dir].push(ref);
        });
        
        return contextAnalysis;
    }

    /**
     * 参照分析レポートの生成
     */
    async generateReferenceReport(filePath: string, analysis?: AnalysisInput): Promise<ReferenceReport> { const importAnalysis = analysis? .importAnalysis || await this.searchImportReferences(filePath);
        const stringAnalysis = analysis?.stringAnalysis || await this.searchStringReferences(filePath);
        
        const allReferences = [...importAnalysis.importReferences,];
            ...stringAnalysis.stringReferences];
        ];
        
        const contextAnalysis = await this.analyzeReferenceContext(allReferences);
        
        return { filePath, : undefined
            summary: {
                totalReferences: allReferences.length,
                importReferences: importAnalysis.importReferences.length,
                stringReferences: stringAnalysis.stringReferences.length,
                activeReferences: contextAnalysis.activeReferences.length,
                reportFileReferences: contextAnalysis.reportReferences.length, };
                hasSafetyBlockingReferences: contextAnalysis.activeReferences.length > 0 }
            },
            importAnalysis,
            stringAnalysis,
            contextAnalysis,
            safetyAssessment: { safeToDelete: contextAnalysis.activeReferences.length === 0,
                warnings: this.generateSafetyWarnings(contextAnalysis,);
                recommendations: this.generateSafetyRecommendations(contextAnalysis); }
            },
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * プロジェクト内の全ファイルを取得
     */
    async getAllProjectFiles(): Promise<string[]> { const files: string[] = [],
        
        const scanDirectory = async (dir: string): Promise<void> => {  }
            try { }
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for(const entry of entries) {
                
                    const fullPath = path.join(dir, entry.name);
                    
                    if(entry.isDirectory() {
                
                }
                        await scanDirectory(fullPath); }
                    } else if(entry.isFile() { files.push(fullPath); }'
                    }''
                } catch (error') { // ディレクトリアクセスエラーは無視 }
            }
        };'
        '';
        await scanDirectory('.');
        
        // 除外パターンとファイル拡張子でフィルタリング
        return files.filter(file => {  );
            const shouldExclude = this.excludePatterns.some(pattern => pattern.test(file);
            const hasValidExtension = this.searchExtensions.includes(path.extname(file); }
            return !shouldExclude && hasValidExtension; }
        });
    }

    /**
     * import文に対象ファイルへの参照が含まれているかチェック
     */'
    containsImportReference(line: string, filePath: string, fileName: string, fileNameWithoutExt: string): boolean { ''
        const trimmedLine = line.trim(''';
            /import\s+.*\s+from\s+['"]/,);
            /import\s*\(/);
            /require\s*\(/;
        ];
        );
        const isImportLine = importPatterns.some(pattern => pattern.test(trimmedLine);
        
        if(!isImportLine) {
        
            
        
        }
            return false; }
        }
        
        // ファイル名やパスの参照をチェック"
        return trimmedLine.includes(fileName) ||"";
               trimmedLine.includes(fileNameWithoutExt") ||"";
               trimmedLine.includes(filePath.replace(/^\.\//, '');
    }

    /**
     * 文字列に対象ファイルへの参照が含まれているかチェック
     */
    containsStringReference(line: string, filePath: string, fileName: string, fileNameWithoutExt: string): boolean { return line.includes(fileName) ||
               line.includes(fileNameWithoutExt) ||;
               line.includes(filePath); }
    }

    /**
     * レポートファイルかどうかの判定
     */
    isReportFile(filePath: string): boolean { return /file-size-report\.json$/.test(filePath) ||
               /\.log$/.test(filePath) ||;
               /report/.test(filePath.toLowerCase(); }
    }

    /**
     * 行の前後コンテキストを取得
     */
    getContext(lines: string[], lineIndex: number, contextLines: number = 2): ContextInfo { const start = Math.max(0, lineIndex - contextLines);
        const end = Math.min(lines.length - 1, lineIndex + contextLines);
        
        return { before: lines.slice(start, lineIndex),
            target: lines[lineIndex],
            after: lines.slice(lineIndex + 1, end + 1), };
            lineNumber: lineIndex + 1 }
        },
    }

    /**
     * 安全性に関する警告を生成
     */
    generateSafetyWarnings(contextAnalysis: ContextAnalysis): SafetyWarning[] { const warnings: SafetyWarning[] = [],'
        '';
        if(contextAnalysis.activeReferences.length > 0') {'
            warnings.push({'
        }'
                level: 'high', })
                message: `${contextAnalysis.activeReferences.length}個のアクティブな参照が見つかりました`;)
                references: contextAnalysis.activeReferences.length),
        }'
        '';
        if(contextAnalysis.byType.import.length > 0') {'
            warnings.push({'
        }'
                level: 'critical', })
                message: `${contextAnalysis.byType.import.length}個のimport文で参照されています`;)
                references: contextAnalysis.byType.import.length),
        }
        
        return warnings;
    }

    /**
     * 安全性に関する推奨事項を生成
     */
    generateSafetyRecommendations(contextAnalysis: ContextAnalysis): SafetyRecommendation[] { const recommendations: SafetyRecommendation[] = [],'
        '';
        if(contextAnalysis.activeReferences.length === 0') {'
            recommendations.push({')'
                type: 'safe_deletion',');
        }'
                message: 'アクティブな参照が見つからないため、安全に削除できます')'); }'
        } else {  recommendations.push({')'
                type: 'manual_review',') }'
                message: 'アクティブな参照があるため、手動で確認してから削除してください'); }
        }'
        '';
        if(contextAnalysis.reportReferences.length > 0') {'
            recommendations.push({'
        })'
                type: 'info',') }'
                message: `${contextAnalysis.reportReferences.length}個のレポートファイルでの参照は削除後に更新されます`)'),
        }
        
        return recommendations;
    }
}'
'';
export default ReferenceAnalyzer;