/**
 * JavaScript クラス名・ファイル名重複分析ツール
 * Issue #131 対応
 */

import { promises, as fs  } from 'fs';
import path from 'path';

// Type definitions
interface ClassDefinition { name: string,
    file: string,
    line: number,
    type: 'export class' | 'class',
    relativeFile: string  }

interface DuplicateFile { fileName: string,
    count: number,
    paths: string[] }

interface DuplicateClass { className: string,
    count: number,
    locations: ClassDefinition[]
    }

interface ImpactAnalysis { scope: string,
    potential_conflicts: string,
    maintenance_difficulty: 'low' | 'medium' | 'high',
    testing_complexity?: 'low' | 'medium' | 'high' }
';

interface Conflict { ''
    type: 'class' | 'file',
    name: string,
    count: number,
    locations?: ClassDefinition[],

    paths?: string[],', priority: 'low' | 'medium' | 'high',
    riskLevel: 'low' | 'medium' | 'high',
    impactAnalysis: ImpactAnalysis
     }

interface ConflictReport { analysis_date: string,
    project: string,
    total_files_analyzed: number,
    total_classes_found: number,
    duplications: {
        class_name_duplication,s: number,
        file_name_duplications: number,
        high_priority_conflicts: number,
    medium_priority_conflicts: number };
    conflicts: Conflict[],
    summary: { most_critical: string[],
    recommendations: string[] }

export class DuplicationAnalyzer {
    private sourceDir: string,
    private files: string[],
    private classes: ClassDefinition[],
    private duplicateFiles: DuplicateFile[],
    private, duplicateClasses: DuplicateClass[]',

    constructor(sourceDir: string = 'src' {'
        this.sourceDir = sourceDir,
        this.files = [],
        this.classes = [],
        this.duplicateFiles = [] }
        this.duplicateClasses = []; }
    }

    /**
     * ファイルシステムを走査して.jsファイルを収集
     */
    async analyzeFiles(): Promise<void> { this.files = await this.scanDirectory(this.sourceDir),

        for (const filePath of this.files) {
            try {'
                const content = await fs.readFile(filePath, 'utf8),
                const classes = this.extractClassDefinitions(filePath, content) }
                this.classes.push(...classes);
            } catch (error) {
                console.warn(`ファイル読み込みエラー: ${filePath}`, (error as Error).message);
            }
}

    /**
     * ディレクトリを再帰的にスキャン
     */
    private async scanDirectory(dir: string): Promise<string[]> { const files: string[] = [],
        const entries = await fs.readdir(dir, { withFileTypes: true ,

        for (const entry of entries) {

            ,
            const fullPath = path.join(dir, entry.name),
            
            if(entry.isDirectory() {
    
}

                files.push(...await, this.scanDirectory(fullPath);' }'

            } else if(entry.isFile() && entry.name.endsWith('.js) { files.push(fullPath) }'
        }

        return files;
    }

    /**
     * ファイル内容からクラス定義を抽出
     */
    private extractClassDefinitions(filePath: string, content: string): ClassDefinition[] { const classes: ClassDefinition[] = [],
        const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)? \s*\{/g, : undefined
        let match: RegExpExecArray | null,

        while((match = classRegex.exec(content) !== null) {
            const className = match[1],
            const lineNumber = this.getLineNumber(content, match.index),
            
            classes.push({)
                name: className)',
    file: filePath,')',
                line: lineNumber',
                type: match[0].includes('export') ? 'export class' : 'class',
    relativeFile: path.relative(process.cwd(), filePath });
        }

        return classes;
    }

    /**
     * 文字位置から行番号を計算
     */'
    private getLineNumber(content: string, index: number): number { ''
        return content.substring(0, index).split('\n'.length }'

    /**
     * 重複ファイル名を検出
     */
    findDuplicateFileNames(): DuplicateFile[] { const fileNames = new Map<string, string[]>(),
        
        for (const filePath of this.files) {
        
            const fileName = path.basename(filePath),
            if(!fileNames.has(fileName) {
    
}
                fileNames.set(fileName, []); }
            }
            fileNames.get(fileName)!.push(filePath);
        }

        this.duplicateFiles = Array.from(fileNames.entries();
            .filter(([name, paths]) => paths.length > 1);
            .map(([name, paths]) => ({ fileName: name,
                count: paths.length,
    paths: paths  });
        return this.duplicateFiles;
    }

    /**
     * 重複クラス名を検出
     */
    findDuplicateClassNames(): DuplicateClass[] { const classNames = new Map<string, ClassDefinition[]>(),
        
        for (const classInfo of this.classes) {
        
            const className = classInfo.name,
            if(!classNames.has(className) {
    
}
                classNames.set(className, []); }
            }
            classNames.get(className)!.push(classInfo);
        }

        this.duplicateClasses = Array.from(classNames.entries();
            .filter(([name, classes]) => classes.length > 1);
            .map(([name, classes]) => ({ className: name,
                count: classes.length,
    locations: classes  });
        return this.duplicateClasses;
    }

    /**
     * 競合の優先度を決定
     */
    identifyConflicts(): Conflict[] { const conflicts: Conflict[] = [],
        // クラス名重複の競合分析
        for (const duplicate of this.duplicateClasses) {
            const conflict: Conflict = {''
                type: 'class',
                name: duplicate.className,
                count: duplicate.count,
                locations: duplicate.locations,
                priority: this.calculatePriority(duplicate,
    riskLevel: this.calculateRiskLevel(duplicate) }
                impactAnalysis: this.analyzeImpact(duplicate); 
    };
            conflicts.push(conflict);
        }
';
        // ファイル名重複の競合分析
        for (const duplicate of this.duplicateFiles) {
            const conflict: Conflict = {''
                type: 'file',
                name: duplicate.fileName,
    count: duplicate.count,
                paths: duplicate.paths,
                priority: 'medium',
                riskLevel: 'low',
                impactAnalysis: {''
                    scope: 'file_organization',
                    potential_conflicts: 'import_confusion' }

                    maintenance_difficulty: 'medium' 
    };
            conflicts.push(conflict);
        }

        return conflicts;
    }

    /**
     * 優先度を計算'
     */''
    private calculatePriority(duplicate: DuplicateClass): 'low' | 'medium' | 'high' { ''
        if(duplicate.count >= 3) return 'high',
        if(duplicate.count === 2) return 'medium',
        return 'low' }

    /**
     * リスクレベルを計算'
     */''
    private calculateRiskLevel(duplicate: DuplicateClass): 'low' | 'medium' | 'high' { // 重要なシステムクラスの判定
        const criticalClasses = ['DialogManager', 'PerformanceMonitor', 'ErrorReporter'],
        if(criticalClasses.includes(duplicate.className)) {''
            return 'high' }
        ';
        // UIコンポーネントは中リスク
        const uiClasses = ['BaseDialog', 'ChartRenderer'];
        if(uiClasses.includes(duplicate.className)) { ''
            return 'medium' }

        return 'low';
    }

    /**
     * 影響分析
     */
    private analyzeImpact(duplicate: DuplicateClass): ImpactAnalysis { const locations = duplicate.locations,
        const directories = locations.map(loc => path.dirname(loc.file),
        const uniqueDirs = [...new Set(directories)],
',

        return { ''
            scope: this.determineScope(uniqueDirs,
            potential_conflicts: 'namespace_collision',
            maintenance_difficulty: duplicate.count >= 3 ? 'high' : 'medium',' };

            testing_complexity: duplicate.count >= 3 ? 'high' : 'medium' 
        }

    /**
     * スコープを決定'
     */''
    private determineScope(directories: string[]): string { ''
        const hasCore = directories.some(dir => dir.includes('/core/)',
        const hasUI = directories.some(dir => dir.includes('/ui/') || dir.includes('/scenes/)',
        const hasDebug = directories.some(dir => dir.includes('/debug/),

        if(hasCore && hasUI) return 'core_ui_components',
        if(hasCore) return 'core_system',
        if(hasUI) return 'ui_components',
        if(hasDebug) return 'debug_system',
        return 'mixed_components',

    /**
     * 競合レポートを生成
     */
    generateConflictReport(): ConflictReport { const conflicts = this.identifyConflicts(),
        ',

        return { ''
            analysis_date: new Date().toISOString().split('T')[0],
            project: 'awaputi',
            total_files_analyzed: this.files.length,
    total_classes_found: this.classes.length,
            duplications: {''
                class_name_duplications: conflicts.filter(c => c.type === 'class').length,
                file_name_duplications: conflicts.filter(c => c.type === 'file').length,
                high_priority_conflicts: conflicts.filter(c => c.priority === 'high').length,' };

                medium_priority_conflicts: conflicts.filter(c => c.priority === 'medium').length 
    };
            conflicts: conflicts,
            summary: { most_critical: conflicts''
                    .filter(c => c.priority === 'high'',
                    .map(c => c.name),
                recommendations: [',
                    'DialogManager系クラスの即座の名前解決',
                    'PerformanceMonitor系クラスの特化名称への変更',
                    'BaseDialog統一実装への統合検討',]',
                    '命名規則とアーキテクチャガイドラインの策定'],
                ] }
}'}