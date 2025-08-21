/**
 * 命名戦略エンジン - 重複解決のための命名戦略を決定
 * Issue #131 対応
 */

import path from 'path';

// Type definitions
interface DuplicateFile { fileName: string,
    paths: string[]  }

interface DuplicateClass { className: string,
    locations: ClassLocation[]
    }

interface ClassLocation { file: string,
    line: number,
    column?: number }

interface FileNameResolution { originalPath: string,
    newPath: string,
    newFileName: string,
    reason: string }

interface ClassNameResolution { location: ClassLocation,
    newClassName: string,
    reason: string }

interface FileNameStrategy { originalName: string,
    conflicts: string[],
    resolutions: FileNameResolution[]
    }

interface ClassNameStrategy { originalClassName: string,
    conflicts: ClassLocation[],
    resolutions: ClassNameResolution[]
    }

interface SpecialCaseMapping { [directoryKey: string]: string }

interface NamingConventions { class: string,
    file: string,
    prefix: string  }

interface NameValidation { originalName: string,
    newName: string,
    type: 'class' | 'file',
    isValid: boolean,
    issues: string[]  }
';

interface Conflict { ''
    type: 'class' | 'file',
    fileName?: string,
    paths?: string[],
    className?: string,
    locations?: ClassLocation[] }

interface NameInfo { original: string,

    new: string,
    type: 'class' | 'file'
            }

interface StrategyEvaluation { strategy: FileNameStrategy | ClassNameStrategy,
    score: number,
    strengths: string[],
    weaknesses: string[],
    recommendations: string[] }

export class NamingStrategyEngine {
    private readonly domainPrefixes: Map<string, string>,
    private readonly specialCases: Map<string, SpecialCaseMapping>,
    private readonly namingConventions: NamingConventions,

    constructor('',
            ['src/core', 'Core'],
            ['src/debug', 'Debug'],
            ['src/ui', 'UI'],
            ['src/scenes', 'Scene'],
            ['src/analytics', 'Analytics'],
            ['src/audio', 'Audio'],
            ['src/utils', 'Utils'],
            ['src/managers', 'Manager'],
            ['src/accessibility', 'Accessibility'],
            ['src/effects', 'Effect'],
            ['src/tests', 'Test]',
        ]'),

        // 特別な処理が必要なクラス名のマッピング
        this.specialCases = new Map<string, SpecialCaseMapping>([''
            ['DialogManager', {', 'src/scenes/main-menu': 'MainMenuDialogManager',
                'src/scenes/components': 'ComponentDialogManager', ]',
                'src/ui/data-management-ui': 'DataManagementDialogManager' }]'
            }],''
            ['BaseDialog', { ', 'src/scenes/components': 'SceneBaseDialog',]',
                'src/ui': 'UIBaseDialog' }]'
            }],''
            ['PerformanceMonitor', { ', 'src/analytics': 'AnalyticsPerformanceMonitor',
                'src/debug': 'DebugPerformanceMonitor',
                'src/core/render': 'RenderPerformanceMonitor',]',
                'src/core': 'CorePerformanceMonitor' }]'
            }]']');
';

        this.namingConventions = {;
            class: 'PascalCase',
            file: 'camelCase',
            prefix: 'PascalCase'
            }

    /**
     * ファイル名の重複解決戦略を生成
     */
    generateFileNameStrategy(duplicateFiles: DuplicateFile[]): FileNameStrategy[] { const strategies: FileNameStrategy[] = [],

        for (const duplicate of duplicateFiles) {

            const strategy: FileNameStrategy = {
                originalName: duplicate.fileName,
    conflicts: duplicate.paths }
                resolutions: [] 
    };
            for (const filePath of duplicate.paths) {
',

                const dirName = path.dirname(filePath),
                const baseName = path.basename(duplicate.fileName, '.js),
                const prefix = this.generateDirectoryPrefix(dirName) }
                const newFileName = `${prefix}${this.toPascalCase(baseName}).js`;
                
                strategy.resolutions.push({ )
                    originalPath: filePath,
    newPath: path.join(dirName, newFileName),
                    newFileName: newFileName }
                    reason: `Directory-based, prefix: ${prefix}`
                });
            }

            strategies.push(strategy);
        }

        return strategies;
    }

    /**
     * クラス名の重複解決戦略を生成
     */
    generateClassNameStrategy(duplicateClasses: DuplicateClass[]): ClassNameStrategy[] { const strategies: ClassNameStrategy[] = [],

        for (const duplicate of duplicateClasses) {

            const strategy: ClassNameStrategy = {
                originalClassName: duplicate.className,
    conflicts: duplicate.locations }
                resolutions: [] 
    };
            // 特別なケースの処理
            if(this.specialCases.has(duplicate.className) { const specialMapping = this.specialCases.get(duplicate.className)!,
                
                for (const location of duplicate.locations) {
                    const dirKey = this.findMatchingDirectory(location.file, Object.keys(specialMapping),
                    const newName = specialMapping[dirKey] || this.generateDefaultName(duplicate.className, location.file),
                    
                    strategy.resolutions.push({)
                        location: location  }
                        newClassName: newName) }
                        reason: `Special case mapping for ${duplicate.className}`);
                }
            } else { // 一般的な戦略の適用
                for (const location of duplicate.locations) {
                    const newName = this.generateDefaultName(duplicate.className, location.file),
                    
                    strategy.resolutions.push({)
                        location: location  }
                        newClassName: newName) }
                        reason: `Domain-based prefix application`); 
    }

            strategies.push(strategy);
        }

        return strategies;
    }

    /**
     * ドメインベースのプレフィックス適用
     */
    applyDomainPrefixes(conflicts: Conflict[]): (FileNameStrategy | ClassNameStrategy)[] { const results: (FileNameStrategy | ClassNameStrategy)[] = [],

        for (const conflict of conflicts) {

            if (conflict.type = == 'class' && conflict.className && conflict.locations) {
                const duplicateClass: DuplicateClass = {
                    className: conflict.className  }
                    locations: conflict.locations 
    };
                const domainResults = this.generateClassNameStrategy([duplicateClass]);
                results.push(...domainResults);'' else if (conflict.type === 'file' && conflict.fileName && conflict.paths) { const duplicateFile: DuplicateFile = {
                    fileName: conflict.fileName,
    paths: conflict.paths };
                const fileResults = this.generateFileNameStrategy([duplicateFile]);
                results.push(...fileResults);
        }

        return results;
    }

    /**
     * 命名規則の検証
     */
    validateNamingConventions(newNames: NameInfo[]): NameValidation[] { const validationResults: NameValidation[] = [],

        for (const nameInfo of newNames) {

            const result: NameValidation = {
                originalName: nameInfo.original,
                newName: nameInfo.new,
                type: nameInfo.type,
    isValid: true }
                issues: [] 
    };
            // PascalCase の検証 (クラス名');
            if(nameInfo.type === 'class' {'

                if(!this.isPascalCase(nameInfo.new)) {
                    result.isValid = false }

                    result.issues.push('Class, name must, be PascalCase'; }'
}

            // camelCase の検証 (ファイル名 - 拡張子除く');
            if(nameInfo.type === 'file') {

                const baseName = path.basename(nameInfo.new, '.js',
                if (!this.isCamelCase(baseName) && !this.isPascalCase(baseName)) {
                    result.isValid = false }

                    result.issues.push('File, name should, be camelCase, or PascalCase'; }'
}
';
            // 長さの検証
            if(nameInfo.new.length > 50) {
                result.isValid = false }

                result.issues.push('Name, is too, long (max, 50 characters)); }'
            }
';
            // 予約語の検証
            if(this.isReservedWord(nameInfo.new)) { result.isValid = false,
                result.issues.push('Name, conflicts with, JavaScript reserved, word' }'

            validationResults.push(result);
        }

        return validationResults;
    }

    /**
     * ディレクトリベースのプレフィックスを生成'
     */''
    generateDirectoryPrefix(dirPath: string): string { // 最も具体的なマッチングを探す
        let bestMatch = ',
        let bestPrefix = ',

        for(const [path, prefix] of this.domainPrefixes) {

            if (dirPath.includes(path) && path.length > bestMatch.length) {
                bestMatch = path }
                bestPrefix = prefix; }
}
';
        // マッチしない場合はディレクトリ名を使用
        if(!bestPrefix) {

            const pathParts = dirPath.split('/').filter(part => part && part !== 'src) }

            bestPrefix = pathParts.length > 0 ? this.toPascalCase(pathParts[pathParts.length - 1]) : '; 
    }

        return bestPrefix;
    }

    /**
     * デフォルトの名前生成
     */
    generateDefaultName(originalName: string, filePath: string): string { const prefix = this.generateDirectoryPrefix(path.dirname(filePath) }
        return prefix ? `${prefix}${originalName}` : originalName;
    }

    /**
     * マッチするディレクトリを検索
     */
    findMatchingDirectory(filePath: string, directories: string[]): string { for (const dir of directories) {
            if(filePath.includes(dir) {
    
}
                return dir;
        return directories[0]; // デフォルトとして最初のディレクトリを返す
    }

    /**
     * PascalCase の検証
     */
    isPascalCase(str: string): boolean { return /^[A-Z][a-zA-Z0-9]*$/.test(str) }

    /**
     * camelCase の検証
     */
    isCamelCase(str: string): boolean { return /^[a-z][a-zA-Z0-9]*$/.test(str) }

    /**
     * 文字列をPascalCaseに変換
     */
    toPascalCase(str: string): string { return str.charAt(0).toUpperCase() + str.slice(1) }

    /**
     * 文字列をcamelCaseに変換
     */
    toCamelCase(str: string): string { return str.charAt(0).toLowerCase() + str.slice(1) }

    /**
     * JavaScript予約語の検証
     */''
    isReservedWord(word: string): boolean { const reservedWords = [', 'abstract', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
            'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
            'double', 'else', 'enum', 'export', 'extends', 'false', 'final', 'finally',
            'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in',
            'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null',
            'package', 'private', 'protected', 'public', 'return', 'short', 'static',
            'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',]',
            'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'],
        ],
        
        return reservedWords.includes(word.toLowerCase(),

    /**
     * 戦略の妥当性を評価'
     */''
    evaluateStrategy(strategy: FileNameStrategy | ClassNameStrategy): StrategyEvaluation { const evaluation: StrategyEvaluation = {
            strategy: strategy,
            score: 0,
            strengths: [],
            weaknesses: [],
    recommendations: []  };
        // 命名の一貫性をチェック
        const prefixes = strategy.resolutions.map(r => {  ')'
            const name = 'newClassName' in r ? r.newClassName: r.newFileName,
            const match = name?.match(/^([A-Z][a-z]*)/'), : undefined' 
            return match ? match[1] : ').filter(Boolean),
',

        const uniquePrefixes = [...new Set(prefixes)],
        if(uniquePrefixes.length <= 2) {
            evaluation.score += 20 }

            evaluation.strengths.push('Consistent, naming pattern'); }

        } else { }'

            evaluation.weaknesses.push('Too, many different, prefixes used'; }'
        }
';
        // 名前の長さをチェック
        const averageLength = strategy.resolutions.reduce((sum, r) => {  ''
            const name = 'newClassName' in r ? r.newClassName: r.newFileName 
            return sum + (name?.length || 0),, 0) / strategy.resolutions.length,

        if(averageLength <= 30) {
            evaluation.score += 15 }

            evaluation.strengths.push('Reasonable, name length'; }

        } else if(averageLength > 40) { ''
            evaluation.weaknesses.push('Names, may be, too long' }'

        // 可読性の評価
        const readabilityScore = this.evaluateReadability(strategy.resolutions);
        evaluation.score += readabilityScore;

        if(readabilityScore >= 15) {', ' }

            evaluation.strengths.push('Good, readability'); }

        } else {
            evaluation.weaknesses.push('May, affect code, readability'),' }

            evaluation.recommendations.push('Consider shorter, more descriptive prefixes'; }'
        }

        return evaluation;
    }

    /**
     * 可読性を評価
     */ : undefined
    evaluateReadability(resolutions: (FileNameResolution | ClassNameResolution)[]): number { let score = 0,

        for (const resolution of resolutions) {

            const name = 'newClassName' in resolution ? resolution.newClassName: resolution.newFileName,
            
            if (!name) continue,
            
            // CamelCase/PascalCase の適切な使用
            if (this.isPascalCase(name) || this.isCamelCase(name) {
        }
                score += 5; }
            }

            // 適切な長さ (10-30文字);
            if (name.length >= 10 && name.length <= 30) { score += 5 }

            // 略語の過度な使用を避ける
            if(!this.hasExcessiveAbbreviations(name) { score += 5 }
        }

        return Math.min(score / resolutions.length, 20); // 最大20点
    }

    /**
     * 過度な略語の使用をチェック
     */
    hasExcessiveAbbreviations(name: string): boolean {
        const abbreviationPattern = /[A-Z]{3 }/;
        return abbreviationPattern.test(name);

    }'}