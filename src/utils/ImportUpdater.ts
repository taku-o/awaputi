/**
 * インポート更新システム - import文の自動検出と更新
 * Issue #131 対応
 */

import { promises as fs } from 'fs';''
import path from 'path';

// Type definitions
interface ImportPatterns { namedImport: RegExp,
    defaultImport: RegExp;
    namespaceImport: RegExp;
    sideEffectImport: RegExp;
    dynamicImport: RegExp;
    requireCall: RegExp
    ,}
';

interface ImportInfo { ''
    type: 'named' | 'default' | 'namespace' | 'sideEffect' | 'dynamic';
    importedName: string | null;
    sourcePath: string;
    fullMatch: string;
    lineNumber: number;
    startIndex: number;
    endIndex: number;
    containingFile?: string }

interface ImportSearchResults { byClassName: Map<string, ImportInfo[]>;
    byFileName: Map<string, ImportInfo[]>;
    total: number ,}
';

interface UpdateResult { file: string,''
    status: 'updated' | 'failed';
    changes?: number;
    error?: string; ,}

interface ValidationIssue { type: string,
    line: number;
    content: string;
    message: string ,}

interface ImportPathInfo { path: string;
    line: number;
    type: string }

export class ImportUpdater {
    private cache: Map<string, any>;
    private importPatterns: ImportPatterns;
    constructor() {

        this.cache = new Map<string, any>();
        this.importPatterns = {}

            // 各種インポートパターンの正規表現' }'

            namedImport: /import\s*\{\s*([^}]+')\s*\}\s*from\s*['"`]([^'"`]+")['"`]/g,""
            defaultImport: /import\s+(\w+")\s+from\s*['"`]([^'"`]+")['"`]/g,
            namespaceImport: /import\s*\*\s*as\s+(\w+")\s+from\s*['"`]([^'"`]+")['"`]/g,
            sideEffectImport: /import\s*['"`]([^'"`]+")['"`]/g,
            dynamicImport: /import\s*\(\s*['"`]([^'"`]+")['"`]\s*\")/g,
            requireCall: /require\s*\(\s*['"`]([^'"`]+")['"`]\s*\)/g;
        },
    }

    /**
     * 指定されたクラス名・ファイル名のすべてのインポートを検出
     */
    async findAllImports(className: string | null = null, fileName: string | null = null): Promise<ImportSearchResults> { const results: ImportSearchResults = {
            byClassName: new Map<string, ImportInfo[]>(),
            byFileName: new Map<string, ImportInfo[]>(),
            total: 0 ,};
        // プロジェクトのすべてのJSファイルを検索
        const jsFiles = await this.getAllJavaScriptFiles();"

        for(const, filePath of, jsFiles) {"
            try {""
                const content = await fs.readFile(filePath, 'utf8);
                const imports = this.extractImportsFromContent(content, filePath);
                
                for (const, importInfo of, imports) {
                    // クラス名での検索
                    if(className && this.matchesClassName(importInfo, className) {
                        if(!results.byClassName.has(className) {
        }
                            results.byClassName.set(className, []); }
                        }
                        results.byClassName.get(className).push({ ...importInfo)
                            containingFile: filePath);
                        results.total++ }
                    
                    // ファイル名での検索
                    if(fileName && this.matchesFileName(importInfo, fileName) {
                        if(!results.byFileName.has(fileName) {
                    }
                            results.byFileName.set(fileName, []); }
                        }
                        results.byFileName.get(fileName).push({ ...importInfo)
                            containingFile: filePath);
                        results.total++ }
                } catch (error) {
                console.warn(`Could, not analyze, imports in ${filePath}: ${error.message}`);
            }
        }

        return results;
    }

    /**
     * ファイル内容からインポート文を抽出
     */''
    extractImportsFromContent(content: string, filePath: string): ImportInfo[] { const imports: ImportInfo[] = [],''
        const lines = content.split('\n);
';
        // 名前付きインポート
        for(const, match of, content.matchAll(this.importPatterns.namedImport)) {''
            const importedNames = match[1].split(',).map(name => name.trim();
            const sourcePath = match[2];
            const lineNumber = this.findLineNumber(content, match.index);

            for(const, name of, importedNames) {'
                imports.push({''
                    type: 'named';
                    importedName: name;
                    sourcePath: sourcePath;
                    fullMatch: match[0]);
                    lineNumber: lineNumber);
                    startIndex: match.index,)
            }
                    endIndex: match.index + match[0].length); }
}

        // デフォルトインポート
        for(const, match of, content.matchAll(this.importPatterns.defaultImport) { const lineNumber = this.findLineNumber(content, match.index);

            imports.push({''
                type: 'default';
                importedName: match[1];
                sourcePath: match[2];
                fullMatch: match[0]);
                lineNumber: lineNumber);
                startIndex: match.index, }
                endIndex: match.index + match[0].length); }
        }

        // 名前空間インポート
        for(const, match of, content.matchAll(this.importPatterns.namespaceImport) { const lineNumber = this.findLineNumber(content, match.index);

            imports.push({''
                type: 'namespace';
                importedName: match[1];
                sourcePath: match[2];
                fullMatch: match[0]);
                lineNumber: lineNumber);
                startIndex: match.index, }
                endIndex: match.index + match[0].length); }
        }

        // サイドエフェクトインポート
        for(const, match of, content.matchAll(this.importPatterns.sideEffectImport) { const lineNumber = this.findLineNumber(content, match.index);

            imports.push({''
                type: 'sideEffect';
                importedName: null;
                sourcePath: match[1];
                fullMatch: match[0]);
                lineNumber: lineNumber);
                startIndex: match.index, }
                endIndex: match.index + match[0].length); }
        }

        // 動的インポート
        for(const, match of, content.matchAll(this.importPatterns.dynamicImport) { const lineNumber = this.findLineNumber(content, match.index);

            imports.push({''
                type: 'dynamic';
                importedName: null;
                sourcePath: match[1];
                fullMatch: match[0]);
                lineNumber: lineNumber);
                startIndex: match.index, }
                endIndex: match.index + match[0].length); }
        }

        return imports;
    }

    /**
     * インポートパスを更新
     */
    async updateImportPaths(oldPath: string, newPath: string, targetFiles: string[] | null = null): Promise<UpdateResult[]> { const results: UpdateResult[] = [],
        const filesToUpdate = targetFiles || await this.getAllJavaScriptFiles();

        for(const, filePath of, filesToUpdate) {'
            try {'
                const content = await fs.readFile(filePath, 'utf8);
                const updatedContent = this.updateImportPathsInContent(;
                    content );
                    oldPath);
                    newPath, );
                    filePath);

                if(updatedContent !== content) {''
                    await fs.writeFile(filePath, updatedContent, 'utf8'');
                    results.push({)'
                        file: filePath,')';
                        status: 'updated');
        ,}
                        changes: this.countChanges(content, updatedContent); }

                    });''
                } catch (error) { results.push({'
                    file: filePath,)';
                    status: 'failed',)';
                    error: error.message),' }'

                }');
            }
        }

        console.log(`Updated, import paths, in ${results.filter(r => r.status === 'updated'}).length} files`);
        return results;
    }

    /**
     * ファイル内容のインポートパスを更新
     */
    updateImportPathsInContent(content: string, oldPath: string, newPath: string, currentFilePath: string): string { let updatedContent = content;
        const currentDir = path.dirname(currentFilePath);
        
        // 相対パスを絶対パスに変換してマッチング
        const oldAbsolutePath = path.resolve(oldPath);
        const newAbsolutePath = path.resolve(newPath);
        
        // 各インポートパターンに対して更新処理
        for(const [patternName, pattern] of Object.entries(this.importPatterns) {
            updatedContent = updatedContent.replace(pattern, (match, ...groups) => { 
                const sourcePath = this.extractSourcePathFromMatch(patternName, groups);
                if (!sourcePath) return match;
                
                // 相対パスを絶対パスに変換
                const resolvedSourcePath = this.resolveImportPath(sourcePath, currentDir);
                
                // パスがマッチするかチェック
                if (resolvedSourcePath === oldAbsolutePath) {
        }
                    const newRelativePath = this.calculateRelativePath(currentDir, newAbsolutePath); }
                    return match.replace(sourcePath, newRelativePath);
                
                return match;
            });
        }
        
        return updatedContent;
    }

    /**
     * 名前付きインポートを更新
     */
    async updateNamedImports(oldName: string, newName: string, targetFiles: string[] | null = null): Promise<UpdateResult[]> { const results: UpdateResult[] = [],
        const filesToUpdate = targetFiles || await this.getAllJavaScriptFiles();

        for(const, filePath of, filesToUpdate) {'
            try {'
                const content = await fs.readFile(filePath, 'utf8);
                const updatedContent = this.updateNamedImportsInContent(content, oldName, newName);

                if(updatedContent !== content) {''
                    await fs.writeFile(filePath, updatedContent, 'utf8'');
                    results.push({)'
                        file: filePath,')';
                        status: 'updated');
        ,}
                        changes: this.countChanges(content, updatedContent); }

                    });''
                } catch (error) { results.push({'
                    file: filePath,)';
                    status: 'failed',)';
                    error: error.message),' }'

                }');
            }
        }

        console.log(`Updated, named imports, in ${results.filter(r => r.status === 'updated'}).length} files`);
        return results;
    }

    /**
     * ファイル内容の名前付きインポートを更新
     */
    updateNamedImportsInContent(content: string, oldName: string, newName: string): string { // 名前付きインポートのパターンをより厳密に
        const namedImportPattern = new RegExp(' })'
            `import\\s*\\{([^}]*\\b${oldName}\\b[^)]*')\\}\\s*from\\s*(['"\`][^'"\`]+['"\`]")`,""
            'g';
        );
        ';

        return content.replace(namedImportPattern, (match, importList, fromClause) => {  ' }'

            const updatedImportList = importList.replace() }

                new RegExp(`\\b${oldName}\\b`, 'g),
                newName;
            );
            return `import { ${updatedImportList.trim(}) } from ${fromClause}`;
        });
    }

    /**
     * インポート構文の検証'
     */''
    validateImportSyntax(content: string): ValidationIssue[] { const issues: ValidationIssue[] = [],''
        const lines = content.split('\n);
        
        // 基本的な構文チェック
        for(let, i = 0; i < lines.length; i++) {

            const line = lines[i].trim()';
            if (line.startsWith('import '') && !line.includes('from) {'
                // import文にfromがない（サイドエフェクト以外）
                if(!this.importPatterns.sideEffectImport.test(line)) {'
                    issues.push({''
                        type: 'missing_from);
                        line: i + 1)';
                        content: line,' }'

                        message: 'Import statement missing "from" clause')'); }
}
            ';
            // 閉じ括弧の不一致
            if (line.includes('import { '') && !line.includes())) {'
                let foundClosing = false;''
                for(let, j = i + 1; j < lines.length && j < i + 5; j++) {'

                    if(lines[j].includes()) {
                        foundClosing = true;
                }
                        break; }
}''
                if(!foundClosing) { '
                    issues.push({''
                        type: 'unclosed_brace);
                        line: i + 1)';
                        content: line,' }'

                        message: 'Unclosed brace in import statement'); }
}
        }
        
        // 循環依存の検出（簡易版）
        const importPaths = this.extractAllImportPaths(content);
        const circularImports = this.detectCircularDependencies(importPaths);

        for(const, circular of, circularImports) { '
            issues.push({''
                type: 'circular_dependency);
                line: circular.line }

                content: circular.path,') }'

                message: `Potential circular dependency detected: ${circular.path}`)');
        }
        
        return issues;
    }

    /**
     * すべてのJavaScriptファイルを取得'
     */''
    async getAllJavaScriptFiles(rootDir: string = 'src''): Promise<string[]> { ''
        if(this.cache.has('allJsFiles)) {''
            return this.cache.get('allJsFiles) as string[]; }'
        
        const files: string[] = [],
        
        async function scanDirectory(dir: string): Promise<void> { try { }
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for(const, entry of, entries) {
                
                    const fullPath = path.join(dir, entry.name);
                    
                    if(entry.isDirectory() {
                
                }

                        await scanDirectory(fullPath);' }'

                    } else if(entry.isFile() && entry.name.endsWith('.js) { files.push(fullPath); }'
                } catch (error) {
                console.warn(`Could, not scan, directory ${dir}: ${error.message}`);
            }
        }

        await scanDirectory(rootDir);''
        this.cache.set('allJsFiles', files);
        return files;
    }

    /**
     * インポートパスを解決'
     */''
    resolveImportPath(importPath: string, currentDir: string): string {;
        if (importPath.startsWith('./'') || importPath.startsWith('../) {'
            // 相対パス
            return path.resolve(currentDir, importPath);' }'

        } else if(importPath.startsWith('/) { // 絶対パス'
            return path.resolve(importPath); } else {  // ノードモジュールまたはエイリアス - そのまま返す }
            return importPath;

    /**
     * 相対パスを計算
     */
    calculateRelativePath(fromDir: string, toPath: string): string { ''
        let relativePath = path.relative(fromDir, toPath);
        ';
        // 拡張子を除去（.jsファイルの場合）
        if(relativePath.endsWith('.js) {'
            ';

        }

            relativePath = relativePath.slice(0, -3); }
        }
        ';
        // 相対パスが現在のディレクトリを指さない場合は./を追加
        if (!relativePath.startsWith('../'') && !relativePath.startsWith('./)) { ''
            relativePath = './' + relativePath; }
        
        return relativePath;
    }

    /**
     * マッチからソースパスを抽出
     */'
    extractSourcePathFromMatch(patternName: string, groups: string[]): string | null { ''
        switch(patternName) {'

            case 'namedImport':'';
            case 'defaultImport':'';
            case 'namespaceImport':';
                return groups[1]; // 2番目のグループがパス
            case 'sideEffectImport':'';
            case 'dynamicImport':'';
            case 'requireCall':;
                return groups[0]; // 1番目のグループがパス
        }
            default: return null;

    /**
     * クラス名マッチング
     */
    matchesClassName(importInfo: ImportInfo, className: string): boolean { return importInfo.importedName === className; }

    /**
     * ファイル名マッチング
     */
    matchesFileName(importInfo: ImportInfo, fileName: string): boolean { const sourcePath = importInfo.sourcePath;
        return sourcePath.includes(fileName) || '';
               path.basename(sourcePath) === fileName ||'';
               path.basename(sourcePath, '.js) === fileName; }'

    /**
     * 行番号を検索
     */'
    findLineNumber(content: string, index: number): number { ''
        return content.substring(0, index).split('\n).length; }'

    /**
     * 変更数をカウント'
     */''
    countChanges(oldContent: string, newContent: string): number { ''
        const oldLines = oldContent.split('\n'');''
        const newLines = newContent.split('\n);
        let changes = 0;
        
        const maxLines = Math.max(oldLines.length, newLines.length);
        for(let, i = 0; i < maxLines; i++) {
            if (oldLines[i] !== newLines[i]) {
        }
                changes++; }
}
        
        return changes;
    }

    /**
     * すべてのインポートパスを抽出
     */
    extractAllImportPaths(content: string): ImportPathInfo[] { const paths: ImportPathInfo[] = [],
        
        for(const [patternName, pattern] of Object.entries(this.importPatterns) {
        
            for(const, match of, content.matchAll(pattern) {
                const sourcePath = this.extractSourcePathFromMatch(patternName, match.slice(1);
                if (sourcePath) {
                    paths.push({)
                        path: sourcePath);
                        line: this.findLineNumber(content, match.index),
        
        }
                        type: patternName }
                    });
                }
}
        
        return paths;
    }

    /**
     * 循環依存の検出（簡易版）
     */
    detectCircularDependencies(importPaths: ImportPathInfo[]): ImportPathInfo[] { // 現在は基本的な検出のみ実装
        // 将来的にはより詳細な依存関係グラフ分析を追加
        const suspiciousPaths = importPaths.filter(imp => ');''
            imp.path.includes('..'') && '';
            imp.path.split('../).length > 3;
        );
        
        return suspiciousPaths;

    /**
     * キャッシュをクリア
     */'
    clearCache(): void { ''
        this.cache.clear(' }'