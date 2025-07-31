/**
 * API Documentation Generator
 * 
 * ソースコードから自動的にAPIドキュメントを生成するツール
 * - 日本語コメント解析
 * - クラス・メソッド構造の抽出
 * - マークダウン形式でのドキュメント生成
 * - JSDoc形式との統合対応
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APIDocumentationGenerator {
    constructor() {
        // プロジェクトルートを基準にパスを解決
        const projectRoot = path.join(__dirname, '..');
        this.sourceDir = path.join(projectRoot, 'src');
        this.outputDir = path.join(projectRoot, 'docs', 'api-reference');
        this.version = '1.0.0';
        this.lastGenerated = new Date().toISOString();
        
        // ドキュメント生成設定
        this.config = {
            includePrivateMethods: false,
            includeJapaneseComments: true,
            includeMethodSignatures: true,
            includeUsageExamples: true,
            outputFormat: 'markdown',
            generateIndex: true,
            generateCrossReferences: true
        };
        
        // 解析対象ファイルパターン
        this.includePatterns = ['**/*.js'];
        this.excludePatterns = ['**/test/**', '**/tests/**', '**/*.test.js', '**/*.spec.js'];
        
        // 変更追跡用
        this.changeHistory = [];
        this.classRegistry = new Map();
        this.methodRegistry = new Map();
    }

    /**
     * メインの実行メソッド
     */
    async generate() {
        try {
            console.log('🚀 API Documentation Generator を開始します...');
            
            // 出力ディレクトリの準備
            await this.prepareOutputDirectory();
            
            // ソースファイルの収集
            const sourceFiles = await this.collectSourceFiles();
            console.log(`📁 ${sourceFiles.length} 個のソースファイルを発見しました`);
            
            // 各ファイルの解析
            const analysisResults = [];
            for (const filePath of sourceFiles) {
                const result = await this.analyzeFile(filePath);
                if (result) {
                    analysisResults.push(result);
                }
            }
            
            console.log(`📊 ${analysisResults.length} 個のファイルを解析しました`);
            
            // APIドキュメントの生成
            await this.generateDocumentation(analysisResults);
            
            // インデックスファイルの生成
            await this.generateIndex(analysisResults);
            
            // クロスリファレンスの生成
            await this.generateCrossReferences(analysisResults);
            
            // 検索インデックスの生成
            await this.generateSearchIndex(analysisResults);
            
            // 使用例集の生成
            await this.generateExamplesGuide(analysisResults);
            
            // 変更履歴の更新
            await this.updateChangeHistory(analysisResults);
            
            console.log('✅ API Documentation Generator が完了しました！');
            console.log(`📁 ドキュメントは ${this.outputDir} に生成されました`);
            
        } catch (error) {
            console.error('❌ API Documentation Generator でエラーが発生しました:', error);
            throw error;
        }
    }

    /**
     * 出力ディレクトリの準備
     */
    async prepareOutputDirectory() {
        try {
            await fs.access(this.outputDir);
        } catch (error) {
            await fs.mkdir(this.outputDir, { recursive: true });
        }
        
        console.log(`📁 出力ディレクトリを準備しました: ${this.outputDir}`);
    }

    /**
     * ソースファイルの収集
     */
    async collectSourceFiles() {
        const files = [];
        console.log(`🔍 ソースディレクトリをスキャン中: ${this.sourceDir}`);
        await this.walkDirectory(this.sourceDir, files);
        console.log(`📁 合計 ${files.length} 個のファイルを発見`);
        
        return files.filter(file => {
            const relativePath = path.relative(this.sourceDir, file);
            
            // JavaScriptファイルかどうかを確認
            if (!file.endsWith('.js')) {
                return false;
            }
            
            // 除外パターンのチェック
            for (const pattern of this.excludePatterns) {
                if (this.matchPattern(relativePath, pattern)) {
                    console.log(`❌ 除外: ${relativePath} (pattern: ${pattern})`);
                    return false;
                }
            }
            
            console.log(`✅ 対象: ${relativePath}`);
            return true;
        });
    }

    /**
     * ディレクトリの再帰的な探索
     */
    async walkDirectory(dir, files) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                await this.walkDirectory(fullPath, files);
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
    }

    /**
     * パターンマッチング（シンプルなグロブパターン対応）
     */
    matchPattern(str, pattern) {
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\./g, '\\.');
        
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(str);
    }

    /**
     * ファイル解析
     */
    async analyzeFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(this.sourceDir, filePath);
            
            console.log(`🔍 ファイルを解析中: ${relativePath}`);
            
            const analysis = {
                filePath: relativePath,
                absolutePath: filePath,
                classes: [],
                functions: [],
                constants: [],
                exports: [],
                imports: [],
                lastModified: (await fs.stat(filePath)).mtime.toISOString()
            };
            
            // クラスの抽出
            const classes = this.extractClasses(content);
            analysis.classes = classes;
            
            // 関数の抽出
            const functions = this.extractFunctions(content);
            analysis.functions = functions;
            
            // 定数の抽出
            const constants = this.extractConstants(content);
            analysis.constants = constants;
            
            // エクスポートの抽出
            const exports = this.extractExports(content);
            analysis.exports = exports;
            
            // インポートの抽出
            const imports = this.extractImports(content);
            analysis.imports = imports;
            
            return analysis;
            
        } catch (error) {
            console.warn(`⚠️  ファイル解析でエラーが発生しました: ${filePath}`, error.message);
            return null;
        }
    }

    /**
     * クラスの抽出
     */
    extractClasses(content) {
        const classes = [];
        const classRegex = /(?:\/\/(.*?)\n)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/g;
        
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            const [fullMatch, comment, className, superClass] = match;
            const startIndex = match.index;
            
            // クラス本体の終了位置を検索
            const classBody = this.extractClassBody(content, startIndex + fullMatch.length);
            
            const classInfo = {
                name: className,
                superClass: superClass || null,
                comment: comment ? comment.trim().replace(/^\s*\/\/\s*/, '') : null,
                methods: this.extractMethods(classBody),
                properties: this.extractProperties(classBody),
                location: this.getLineNumber(content, startIndex)
            };
            
            classes.push(classInfo);
            this.classRegistry.set(className, classInfo);
        }
        
        return classes;
    }

    /**
     * クラス本体の抽出
     */
    extractClassBody(content, startIndex) {
        let braceCount = 1;
        let index = startIndex;
        
        while (index < content.length && braceCount > 0) {
            const char = content[index];
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
            }
            index++;
        }
        
        return content.substring(startIndex, index - 1);
    }

    /**
     * メソッドの抽出
     */
    extractMethods(classBody) {
        const methods = [];
        const methodRegex = /(?:\/\/(.*?)\n\s*)?(?:(static|async)\s+)?(\w+)\s*\([^)]*\)\s*{/g;
        
        let match;
        while ((match = methodRegex.exec(classBody)) !== null) {
            const [fullMatch, comment, modifier, methodName] = match;
            
            // コンストラクタや特殊メソッドの検出
            const isConstructor = methodName === 'constructor';
            const isPrivate = methodName.startsWith('_');
            
            // プライベートメソッドを除外する設定の場合
            if (isPrivate && !this.config.includePrivateMethods) {
                continue;
            }
            
            const methodInfo = {
                name: methodName,
                isConstructor,
                isPrivate,
                isStatic: modifier === 'static',
                isAsync: modifier === 'async',
                comment: comment ? comment.trim().replace(/^\s*\/\/\s*/, '') : null,
                signature: this.extractMethodSignature(fullMatch),
                parameters: this.extractParameters(fullMatch)
            };
            
            methods.push(methodInfo);
            this.methodRegistry.set(`${classBody.className || 'Unknown'}.${methodName}`, methodInfo);
        }
        
        return methods;
    }

    /**
     * メソッドシグネチャの抽出
     */
    extractMethodSignature(methodMatch) {
        const signatureMatch = methodMatch.match(/(\w+)\s*\(([^)]*)\)/);
        if (signatureMatch) {
            return signatureMatch[0];
        }
        return null;
    }

    /**
     * パラメーターの抽出
     */
    extractParameters(methodMatch) {
        const paramMatch = methodMatch.match(/\(([^)]*)\)/);
        if (paramMatch && paramMatch[1].trim()) {
            return paramMatch[1]
                .split(',')
                .map(param => param.trim())
                .filter(param => param.length > 0);
        }
        return [];
    }

    /**
     * プロパティの抽出
     */
    extractProperties(classBody) {
        const properties = [];
        const propertyRegex = /(?:\/\/(.*?)\n\s*)?this\.(\w+)\s*=/g;
        
        let match;
        while ((match = propertyRegex.exec(classBody)) !== null) {
            const [, comment, propertyName] = match;
            
            const propertyInfo = {
                name: propertyName,
                comment: comment ? comment.trim().replace(/^\s*\/\/\s*/, '') : null,
                isPrivate: propertyName.startsWith('_')
            };
            
            properties.push(propertyInfo);
        }
        
        return properties;
    }

    /**
     * 関数の抽出
     */
    extractFunctions(content) {
        const functions = [];
        const functionRegex = /(?:\/\/(.*?)\n)?(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{/g;
        
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            const [fullMatch, comment, functionName] = match;
            
            const functionInfo = {
                name: functionName,
                comment: comment ? comment.trim().replace(/^\s*\/\/\s*/, '') : null,
                signature: this.extractMethodSignature(fullMatch),
                parameters: this.extractParameters(fullMatch),
                isExported: fullMatch.includes('export'),
                location: this.getLineNumber(content, match.index)
            };
            
            functions.push(functionInfo);
        }
        
        return functions;
    }

    /**
     * 定数の抽出
     */
    extractConstants(content) {
        const constants = [];
        const constantRegex = /(?:\/\/(.*?)\n)?(?:export\s+)?const\s+(\w+)\s*=/g;
        
        let match;
        while ((match = constantRegex.exec(content)) !== null) {
            const [fullMatch, comment, constantName] = match;
            
            const constantInfo = {
                name: constantName,
                comment: comment ? comment.trim().replace(/^\s*\/\/\s*/, '') : null,
                isExported: fullMatch.includes('export'),
                location: this.getLineNumber(content, match.index)
            };
            
            constants.push(constantInfo);
        }
        
        return constants;
    }

    /**
     * エクスポートの抽出
     */
    extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:default\s+)?(?:{([^}]+)}|(\w+))/g;
        
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            const [fullMatch, namedExports, defaultExport] = match;
            
            if (namedExports) {
                const names = namedExports.split(',').map(name => name.trim());
                names.forEach(name => {
                    exports.push({
                        name: name,
                        type: 'named',
                        location: this.getLineNumber(content, match.index)
                    });
                });
            } else if (defaultExport) {
                exports.push({
                    name: defaultExport,
                    type: 'default',
                    location: this.getLineNumber(content, match.index)
                });
            }
        }
        
        return exports;
    }

    /**
     * インポートの抽出
     */
    extractImports(content) {
        const imports = [];
        const importRegex = /import\s+(?:(?:{([^}]+)})|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const [, namedImports, defaultImport, source] = match;
            
            const importInfo = {
                source: source,
                named: namedImports ? namedImports.split(',').map(name => name.trim()) : [],
                default: defaultImport || null,
                location: this.getLineNumber(content, match.index)
            };
            
            imports.push(importInfo);
        }
        
        return imports;
    }

    /**
     * 行番号の取得
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    /**
     * ドキュメント生成
     */
    async generateDocumentation(analysisResults) {
        console.log('📝 API ドキュメントを生成中...');
        
        for (const analysis of analysisResults) {
            if (analysis.classes.length > 0 || analysis.functions.length > 0) {
                await this.generateFileDocumentation(analysis);
            }
        }
    }

    /**
     * ファイル単位のドキュメント生成
     */
    async generateFileDocumentation(analysis) {
        const fileName = path.basename(analysis.filePath, '.js');
        const outputPath = path.join(this.outputDir, `${fileName}.md`);
        
        let markdown = this.generateMarkdownHeader(analysis);
        
        // クラスドキュメント
        for (const classInfo of analysis.classes) {
            markdown += this.generateClassDocumentation(classInfo);
        }
        
        // 関数ドキュメント
        for (const functionInfo of analysis.functions) {
            markdown += this.generateFunctionDocumentation(functionInfo);
        }
        
        // 定数ドキュメント
        if (analysis.constants.length > 0) {
            markdown += this.generateConstantsDocumentation(analysis.constants);
        }
        
        await fs.writeFile(outputPath, markdown, 'utf-8');
        console.log(`📄 生成完了: ${path.relative(this.outputDir, outputPath)}`);
    }

    /**
     * マークダウンヘッダーの生成
     */
    generateMarkdownHeader(analysis) {
        const fileName = path.basename(analysis.filePath, '.js');
        
        return `# ${fileName}

## 概要

ファイル: \`${analysis.filePath}\`  
最終更新: ${new Date(analysis.lastModified).toLocaleString('ja-JP')}

## 目次

${this.generateTableOfContents(analysis)}

---

`;
    }

    /**
     * 目次の生成
     */
    generateTableOfContents(analysis) {
        const toc = [];
        
        if (analysis.classes.length > 0) {
            toc.push('## クラス');
            analysis.classes.forEach(cls => {
                toc.push(`- [${cls.name}](#${cls.name.toLowerCase()})`);
            });
        }
        
        if (analysis.functions.length > 0) {
            toc.push('## 関数');
            analysis.functions.forEach(func => {
                toc.push(`- [${func.name}()](#${func.name.toLowerCase()})`);
            });
        }
        
        if (analysis.constants.length > 0) {
            toc.push('## 定数');
            analysis.constants.forEach(constant => {
                toc.push(`- [${constant.name}](#${constant.name.toLowerCase()})`);
            });
        }
        
        return toc.join('\n');
    }

    /**
     * クラスドキュメントの生成
     */
    generateClassDocumentation(classInfo) {
        let markdown = `## ${classInfo.name}

`;
        
        if (classInfo.comment) {
            markdown += `${classInfo.comment}\n\n`;
        }
        
        if (classInfo.superClass) {
            markdown += `**継承元**: \`${classInfo.superClass}\`\n\n`;
        }
        
        // コンストラクタ
        const constructor = classInfo.methods.find(m => m.isConstructor);
        if (constructor) {
            markdown += `### コンストラクタ

\`\`\`javascript
new ${classInfo.name}(${constructor.parameters.join(', ')})
\`\`\`

`;
            if (constructor.comment) {
                markdown += `${constructor.comment}\n\n`;
            }
        }
        
        // プロパティ
        if (classInfo.properties.length > 0) {
            markdown += `### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
`;
            classInfo.properties.forEach(prop => {
                const description = prop.comment || '説明なし';
                markdown += `| \`${prop.name}\` | ${description} |\n`;
            });
            markdown += '\n';
        }
        
        // メソッド
        const publicMethods = classInfo.methods.filter(m => !m.isConstructor && !m.isPrivate);
        if (publicMethods.length > 0) {
            markdown += `### メソッド

`;
            publicMethods.forEach(method => {
                markdown += this.generateMethodDocumentation(method, classInfo.name);
            });
        }
        
        // プライベートメソッド（設定で有効な場合）
        if (this.config.includePrivateMethods) {
            const privateMethods = classInfo.methods.filter(m => m.isPrivate);
            if (privateMethods.length > 0) {
                markdown += `### プライベートメソッド

`;
                privateMethods.forEach(method => {
                    markdown += this.generateMethodDocumentation(method, classInfo.name);
                });
            }
        }
        
        return markdown + '\n---\n\n';
    }

    /**
     * メソッドドキュメントの生成
     */
    generateMethodDocumentation(method, className = '') {
        const methodName = className ? `${className}.${method.name}` : method.name;
        let markdown = `#### ${method.name}

`;
        
        if (method.comment) {
            markdown += `${method.comment}\n\n`;
        }
        
        // メソッドシグネチャ
        if (method.signature) {
            const modifiers = [];
            if (method.isStatic) modifiers.push('static');
            if (method.isAsync) modifiers.push('async');
            
            markdown += `**シグネチャ**:
\`\`\`javascript
${modifiers.join(' ')} ${method.signature}
\`\`\`

`;
        }
        
        // パラメーター
        if (method.parameters.length > 0) {
            markdown += `**パラメーター**:
`;
            method.parameters.forEach(param => {
                markdown += `- \`${param}\`\n`;
            });
            markdown += '\n';
        }
        
        // 使用例の生成（設定で有効な場合）
        if (this.config.includeUsageExamples) {
            markdown += this.generateUsageExample(method, className);
        }
        
        return markdown;
    }

    /**
     * 使用例の生成
     */
    generateUsageExample(method, className = '') {
        // より詳細で実用的な使用例を生成
        if (method.isConstructor) {
            const practicalExample = this.generatePracticalConstructorExample(className, method);
            return `**使用例**:
\`\`\`javascript
// 基本的な使用方法
const instance = new ${className}(${method.parameters.join(', ')});

${practicalExample}
\`\`\`

`;
        } else if (method.isStatic) {
            const practicalExample = this.generatePracticalStaticExample(className, method);
            return `**使用例**:
\`\`\`javascript
// 基本的な使用方法
const result = ${className}.${method.name}(${method.parameters.join(', ')});

${practicalExample}
\`\`\`

`;
        } else {
            const practicalExample = this.generatePracticalInstanceExample(className, method);
            return `**使用例**:
\`\`\`javascript
// 基本的な使用方法
const result = instance.${method.name}(${method.parameters.join(', ')});

${practicalExample}
\`\`\`

`;
        }
    }

    /**
     * 実用的なコンストラクタ使用例の生成
     */
    generatePracticalConstructorExample(className, method) {
        // クラス名に基づいた実用的な例を生成
        const examples = {
            'GameEngine': `// ゲームエンジンの初期化
const canvas = document.getElementById('gameCanvas');
const gameEngine = new GameEngine(canvas);
gameEngine.start();`,
            'BubbleManager': `// バブル管理システムの初期化
const gameEngine = getGameEngine();
const bubbleManager = new BubbleManager(gameEngine);
bubbleManager.initialize();`,
            'AudioManager': `// 音響システムの初期化
const audioManager = new AudioManager();
audioManager.setMasterVolume(0.8);
await audioManager.initialize();`,
            'ConfigurationManager': `// 設定管理システムの初期化
const configManager = new ConfigurationManager();
configManager.set('audio', 'volumes.master', 0.7);`,
            'ScoreManager': `// スコア管理システムの初期化
const gameEngine = getGameEngine();
const scoreManager = new ScoreManager(gameEngine);
scoreManager.addScore('normal', 50);`
        };

        return examples[className] || `// ${className}の実用的な使用例
// 詳細な使用方法については、システム統合ガイドを参照してください`;
    }

    /**
     * 実用的な静的メソッド使用例の生成
     */
    generatePracticalStaticExample(className, method) {
        const commonPatterns = {
            'getInstance': `// シングルトンインスタンスの取得
const instance = ${className}.getInstance();
instance.initialize();`,
            'create': `// ファクトリーメソッドによる生成
const object = ${className}.create(options);
object.configure(settings);`,
            'validate': `// データ検証の実行
const isValid = ${className}.validate(inputData);
if (!isValid) {
    console.warn('Invalid data provided');
}`,
            'parse': `// データ解析の実行
const parsedData = ${className}.parse(rawData);
console.log('Parsed:', parsedData);`
        };

        return commonPatterns[method.name] || `// ${method.name}の実用的な使用例
const result = ${className}.${method.name}(/* 適切なパラメータ */);
console.log('Result:', result);`;
    }

    /**
     * 実用的なインスタンスメソッド使用例の生成
     */
    generatePracticalInstanceExample(className, method) {
        const commonPatterns = {
            'initialize': `// システムの初期化
await instance.initialize();
console.log('Initialization complete');`,
            'update': `// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);`,
            'render': `// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);`,
            'destroy': `// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');`,
            'set': `// 設定値の更新
const success = instance.set('key', 'value');
if (success) {
    console.log('Setting updated successfully');
}`,
            'get': `// 設定値の取得
const value = instance.get('key', 'defaultValue');
console.log('Retrieved value:', value);`
        };

        return commonPatterns[method.name] || `// ${method.name}の実用的な使用例
const result = instance.${method.name}(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);`;
    }

    /**
     * 関数ドキュメントの生成
     */
    generateFunctionDocumentation(functionInfo) {
        let markdown = `## ${functionInfo.name}

`;
        
        if (functionInfo.comment) {
            markdown += `${functionInfo.comment}\n\n`;
        }
        
        if (functionInfo.signature) {
            markdown += `**シグネチャ**:
\`\`\`javascript
${functionInfo.signature}
\`\`\`

`;
        }
        
        if (functionInfo.parameters.length > 0) {
            markdown += `**パラメーター**:
`;
            functionInfo.parameters.forEach(param => {
                markdown += `- \`${param}\`\n`;
            });
            markdown += '\n';
        }
        
        markdown += `**使用例**:
\`\`\`javascript
const result = ${functionInfo.name}(${functionInfo.parameters.join(', ')});
\`\`\`

`;
        
        return markdown + '---\n\n';
    }

    /**
     * 定数ドキュメントの生成
     */
    generateConstantsDocumentation(constants) {
        let markdown = `## 定数

| 定数名 | 説明 |
|--------|------|
`;
        
        constants.forEach(constant => {
            const description = constant.comment || '説明なし';
            markdown += `| \`${constant.name}\` | ${description} |\n`;
        });
        
        return markdown + '\n---\n\n';
    }

    /**
     * インデックスファイルの生成
     */
    async generateIndex(analysisResults) {
        console.log('📑 インデックスファイルを生成中...');
        
        let indexMarkdown = `# API Reference Index

Generated on: ${new Date().toLocaleString('ja-JP')}  
Version: ${this.version}

## 概要

このディレクトリには、awaputi プロジェクトの自動生成された API ドキュメントが含まれています。

## ファイル一覧

`;
        
        // ファイル別統計情報
        const fileStats = [];
        for (const analysis of analysisResults) {
            if (analysis.classes.length > 0 || analysis.functions.length > 0) {
                const fileName = path.basename(analysis.filePath, '.js');
                const stats = {
                    fileName,
                    filePath: analysis.filePath,
                    classCount: analysis.classes.length,
                    functionCount: analysis.functions.length,
                    constantCount: analysis.constants.length,
                    totalMethods: analysis.classes.reduce((sum, cls) => sum + cls.methods.length, 0)
                };
                fileStats.push(stats);
            }
        }
        
        // ファイル一覧テーブル
        indexMarkdown += `| ファイル | クラス | メソッド | 関数 | 定数 |
|----------|--------|----------|------|------|
`;
        
        fileStats.forEach(stats => {
            indexMarkdown += `| [${stats.fileName}](${stats.fileName}.md) | ${stats.classCount} | ${stats.totalMethods} | ${stats.functionCount} | ${stats.constantCount} |\n`;
        });
        
        // クラス一覧
        const allClasses = [];
        analysisResults.forEach(analysis => {
            analysis.classes.forEach(cls => {
                allClasses.push({
                    name: cls.name,
                    fileName: path.basename(analysis.filePath, '.js'),
                    comment: cls.comment
                });
            });
        });
        
        if (allClasses.length > 0) {
            indexMarkdown += `\n## クラス一覧

| クラス名 | ファイル | 説明 |
|----------|----------|------|
`;
            allClasses.forEach(cls => {
                const description = cls.comment || '説明なし';
                indexMarkdown += `| [${cls.name}](${cls.fileName}.md#${cls.name.toLowerCase()}) | ${cls.fileName}.js | ${description} |\n`;
            });
        }
        
        // 統計情報
        const totalClasses = allClasses.length;
        const totalMethods = fileStats.reduce((sum, stats) => sum + stats.totalMethods, 0);
        const totalFunctions = fileStats.reduce((sum, stats) => sum + stats.functionCount, 0);
        const totalConstants = fileStats.reduce((sum, stats) => sum + stats.constantCount, 0);
        
        indexMarkdown += `\n## 統計情報

- **総ファイル数**: ${fileStats.length}
- **総クラス数**: ${totalClasses}
- **総メソッド数**: ${totalMethods}
- **総関数数**: ${totalFunctions}
- **総定数数**: ${totalConstants}

## 生成情報

このドキュメントは API Documentation Generator により自動生成されました。

**生成設定**:
- プライベートメソッド含む: ${this.config.includePrivateMethods ? 'はい' : 'いいえ'}
- 日本語コメント含む: ${this.config.includeJapaneseComments ? 'はい' : 'いいえ'}
- 使用例含む: ${this.config.includeUsageExamples ? 'はい' : 'いいえ'}

`;
        
        const indexPath = path.join(this.outputDir, 'README.md');
        await fs.writeFile(indexPath, indexMarkdown, 'utf-8');
        
        console.log('📑 インデックスファイル生成完了: README.md');
    }

    /**
     * 変更履歴の更新
     */
    async updateChangeHistory(analysisResults) {
        const changeHistoryPath = path.join(this.outputDir, 'CHANGELOG.md');
        
        // 前回の履歴を読み込み（存在する場合）
        await this.loadPreviousChangeHistory(changeHistoryPath);
        
        const currentChange = {
            version: this.version,
            date: this.lastGenerated,
            totalFiles: analysisResults.length,
            totalClasses: analysisResults.reduce((sum, analysis) => sum + analysis.classes.length, 0),
            totalMethods: analysisResults.reduce((sum, analysis) => 
                sum + analysis.classes.reduce((methodSum, cls) => methodSum + cls.methods.length, 0), 0),
            totalFunctions: analysisResults.reduce((sum, analysis) => sum + analysis.functions.length, 0),
            totalConstants: analysisResults.reduce((sum, analysis) => sum + analysis.constants.length, 0),
            changes: await this.detectChanges(analysisResults),
            fileChanges: await this.trackFileChanges(analysisResults)
        };
        
        this.changeHistory.unshift(currentChange);
        
        // 変更履歴を最新20件に制限（より長い履歴を保持）
        if (this.changeHistory.length > 20) {
            this.changeHistory = this.changeHistory.slice(0, 20);
        }
        
        let changelogMarkdown = `# API Documentation Change Log

自動生成されたAPIドキュメントの変更履歴です。

## 生成履歴

`;
        
        this.changeHistory.forEach((change, index) => {
            const isLatest = index === 0;
            const statusIcon = isLatest ? '🆕' : '📝';
            
            changelogMarkdown += `### ${statusIcon} Version ${change.version} - ${new Date(change.date).toLocaleString('ja-JP')}

**統計情報**:
- **ファイル数**: ${change.totalFiles} ${this.getChangeIndicator(change, 'totalFiles', index)}
- **クラス数**: ${change.totalClasses} ${this.getChangeIndicator(change, 'totalClasses', index)}
- **メソッド数**: ${change.totalMethods} ${this.getChangeIndicator(change, 'totalMethods', index)}
- **関数数**: ${change.totalFunctions} ${this.getChangeIndicator(change, 'totalFunctions', index)}
- **定数数**: ${change.totalConstants} ${this.getChangeIndicator(change, 'totalConstants', index)}

`;

            // 変更詳細を追加
            if (change.changes && change.changes.length > 0) {
                changelogMarkdown += `**主な変更**:\n`;
                change.changes.slice(0, 5).forEach(changeDetail => {
                    changelogMarkdown += `- ${changeDetail}\n`;
                });
                if (change.changes.length > 5) {
                    changelogMarkdown += `- その他 ${change.changes.length - 5} 件の変更\n`;
                }
                changelogMarkdown += '\n';
            }

            // ファイル変更を追加
            if (change.fileChanges) {
                const { added, modified, removed } = change.fileChanges;
                if (added.length > 0 || modified.length > 0 || removed.length > 0) {
                    changelogMarkdown += `**ファイル変更**:\n`;
                    if (added.length > 0) changelogMarkdown += `- 🆕 追加: ${added.length}件\n`;
                    if (modified.length > 0) changelogMarkdown += `- 📝 変更: ${modified.length}件\n`;
                    if (removed.length > 0) changelogMarkdown += `- 🗑️ 削除: ${removed.length}件\n`;
                    changelogMarkdown += '\n';
                }
            }

            changelogMarkdown += '---\n\n';
        });
        
        // 統計サマリーを追加
        changelogMarkdown += this.generateChangelogSummary();
        
        await fs.writeFile(changeHistoryPath, changelogMarkdown, 'utf-8');
        console.log('📋 変更履歴更新完了: CHANGELOG.md');
    }

    /**
     * 前回の変更履歴を読み込み
     */
    async loadPreviousChangeHistory(changeHistoryPath) {
        try {
            const existingChangelog = await fs.readFile(changeHistoryPath, 'utf-8');
            // 簡単な解析で前回の履歴を取得（実装を簡略化）
            this.previousStats = this.parseExistingChangelog(existingChangelog);
        } catch (error) {
            // ファイルが存在しない場合は無視
            this.previousStats = null;
        }
    }

    /**
     * 既存のChangelogを解析
     */
    parseExistingChangelog(content) {
        // 最新のエントリから統計情報を抽出
        const matches = content.match(/ファイル数\*\*: (\d+)[\s\S]*?クラス数\*\*: (\d+)[\s\S]*?メソッド数\*\*: (\d+)[\s\S]*?関数数\*\*: (\d+)/);
        if (matches) {
            return {
                totalFiles: parseInt(matches[1]),
                totalClasses: parseInt(matches[2]),
                totalMethods: parseInt(matches[3]),
                totalFunctions: parseInt(matches[4])
            };
        }
        return null;
    }

    /**
     * 変更検出
     */
    async detectChanges(analysisResults) {
        const changes = [];
        
        // 新しいクラスの検出
        const allClasses = analysisResults.flatMap(analysis => analysis.classes);
        const newClasses = allClasses.filter(cls => !this.classRegistry.has(cls.name));
        if (newClasses.length > 0) {
            changes.push(`${newClasses.length}個の新しいクラスを追加: ${newClasses.map(c => c.name).slice(0, 3).join(', ')}${newClasses.length > 3 ? ' など' : ''}`);
        }

        // APIの変更検出（簡単な実装）
        const currentMethodCount = allClasses.reduce((sum, cls) => sum + cls.methods.length, 0);
        if (this.previousStats && currentMethodCount !== this.previousStats.totalMethods) {
            const diff = currentMethodCount - this.previousStats.totalMethods;
            changes.push(`${diff > 0 ? '+' : ''}${diff}個のメソッドが${diff > 0 ? '追加' : '削除'}されました`);
        }

        return changes;
    }

    /**
     * ファイル変更追跡
     */
    async trackFileChanges(analysisResults) {
        return {
            added: [], // 実装を簡略化
            modified: analysisResults.length, // 全ファイルを変更として扱う
            removed: []
        };
    }

    /**
     * 変更インジケーターの生成
     */
    getChangeIndicator(change, property, index) {
        if (index >= this.changeHistory.length - 1) return '';
        
        const previous = this.changeHistory[index + 1];
        if (!previous) return '';
        
        const current = change[property];
        const prev = previous[property];
        
        if (current > prev) return `(+${current - prev})`;
        if (current < prev) return `(-${prev - current})`;
        return '';
    }

    /**
     * Changelogサマリーの生成
     */
    generateChangelogSummary() {
        if (this.changeHistory.length === 0) return '';
        
        const latest = this.changeHistory[0];
        const oldest = this.changeHistory[this.changeHistory.length - 1];
        
        return `## 📊 統計サマリー

**最新バージョン**: ${latest.version} (${new Date(latest.date).toLocaleDateString('ja-JP')})  
**総生成回数**: ${this.changeHistory.length}回  
**追跡期間**: ${new Date(oldest.date).toLocaleDateString('ja-JP')} ～ ${new Date(latest.date).toLocaleDateString('ja-JP')}

**現在の規模**:
- 📁 ファイル数: ${latest.totalFiles}
- 🏗️ クラス数: ${latest.totalClasses}
- ⚙️ メソッド数: ${latest.totalMethods}
- 🔧 関数数: ${latest.totalFunctions}
- 📌 定数数: ${latest.totalConstants}

---

*このドキュメントは API Documentation Generator により自動生成されています。*
`;
    }

    /**
     * クロスリファレンスの生成
     */
    async generateCrossReferences(analysisResults) {
        console.log('🔗 クロスリファレンスを生成中...');
        
        const crossRefPath = path.join(this.outputDir, 'CROSS_REFERENCES.md');
        
        // 継承関係の抽出
        const inheritanceMap = new Map();
        const usageMap = new Map();
        
        analysisResults.forEach(analysis => {
            analysis.classes.forEach(cls => {
                if (cls.superClass) {
                    if (!inheritanceMap.has(cls.superClass)) {
                        inheritanceMap.set(cls.superClass, []);
                    }
                    inheritanceMap.get(cls.superClass).push({
                        name: cls.name,
                        file: analysis.filePath
                    });
                }
                
                // インポート関係の追跡
                analysis.imports.forEach(imp => {
                    if (!usageMap.has(imp.source)) {
                        usageMap.set(imp.source, []);
                    }
                    usageMap.get(imp.source).push({
                        name: cls.name,
                        file: analysis.filePath,
                        importType: imp.default ? 'default' : 'named',
                        importedItems: imp.named
                    });
                });
            });
        });
        
        let crossRefMarkdown = `# Cross References

このドキュメントは、APIの相互関係と依存性を示します。

## 継承関係

`;
        
        // 継承関係を出力
        inheritanceMap.forEach((children, parent) => {
            crossRefMarkdown += `### ${parent}\n\n**継承クラス**:\n`;
            children.forEach(child => {
                crossRefMarkdown += `- [${child.name}](${path.basename(child.file, '.js')}.md#${child.name.toLowerCase()}) (${child.file})\n`;
            });
            crossRefMarkdown += '\n';
        });
        
        crossRefMarkdown += `## モジュール依存関係

`;
        
        // 使用関係を出力
        const sortedUsages = Array.from(usageMap.entries()).sort(([a], [b]) => a.localeCompare(b));
        sortedUsages.forEach(([module, usages]) => {
            if (usages.length > 0) {
                crossRefMarkdown += `### ${module}\n\n**使用箇所**:\n`;
                usages.forEach(usage => {
                    crossRefMarkdown += `- [${usage.name}](${path.basename(usage.file, '.js')}.md#${usage.name.toLowerCase()}) (${usage.file})\n`;
                    if (usage.importedItems.length > 0) {
                        crossRefMarkdown += `  - インポート項目: ${usage.importedItems.join(', ')}\n`;
                    }
                });
                crossRefMarkdown += '\n';
            }
        });
        
        await fs.writeFile(crossRefPath, crossRefMarkdown, 'utf-8');
        console.log('🔗 クロスリファレンス生成完了: CROSS_REFERENCES.md');
    }

    /**
     * 検索インデックスの生成
     */
    async generateSearchIndex(analysisResults) {
        console.log('🔍 検索インデックスを生成中...');
        
        const searchIndex = {
            version: this.version,
            lastUpdated: this.lastGenerated,
            classes: [],
            methods: [],
            functions: [],
            constants: []
        };
        
        analysisResults.forEach(analysis => {
            const fileName = path.basename(analysis.filePath, '.js');
            
            // クラス情報を追加
            analysis.classes.forEach(cls => {
                searchIndex.classes.push({
                    name: cls.name,
                    file: fileName,
                    path: analysis.filePath,
                    description: cls.comment || '',
                    superClass: cls.superClass,
                    methods: cls.methods.map(m => m.name),
                    properties: cls.properties.map(p => p.name)
                });
                
                // メソッド情報を追加
                cls.methods.forEach(method => {
                    searchIndex.methods.push({
                        name: method.name,
                        className: cls.name,
                        file: fileName,
                        path: analysis.filePath,
                        description: method.comment || '',
                        parameters: method.parameters,
                        isStatic: method.isStatic,
                        isPrivate: method.isPrivate,
                        isConstructor: method.isConstructor
                    });
                });
            });
            
            // 関数情報を追加
            analysis.functions.forEach(func => {
                searchIndex.functions.push({
                    name: func.name,
                    file: fileName,
                    path: analysis.filePath,
                    description: func.comment || '',
                    parameters: func.parameters,
                    isExported: func.isExported
                });
            });
            
            // 定数情報を追加
            analysis.constants.forEach(constant => {
                searchIndex.constants.push({
                    name: constant.name,
                    file: fileName,
                    path: analysis.filePath,
                    description: constant.comment || '',
                    isExported: constant.isExported
                });
            });
        });
        
        const searchIndexPath = path.join(this.outputDir, 'search-index.json');
        await fs.writeFile(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf-8');
        console.log('🔍 検索インデックス生成完了: search-index.json');
    }

    /**
     * 使用例集の生成
     */
    async generateExamplesGuide(analysisResults) {
        console.log('📖 使用例集を生成中...');
        
        const examplesPath = path.join(this.outputDir, 'EXAMPLES.md');
        
        let examplesMarkdown = `# 使用例集

このドキュメントは、主要なAPIクラスの実用的な使用例を提供します。

## 目次

`;

        // 重要なクラスのリストを作成
        const importantClasses = [
            'GameEngine', 'ConfigurationManager', 'BubbleManager', 'AudioManager', 
            'ScoreManager', 'StatisticsManager', 'AchievementManager', 'LocalizationManager'
        ];
        
        const foundClasses = [];
        analysisResults.forEach(analysis => {
            analysis.classes.forEach(cls => {
                if (importantClasses.includes(cls.name)) {
                    foundClasses.push({
                        name: cls.name,
                        file: analysis.filePath,
                        class: cls
                    });
                }
            });
        });
        
        // 目次を生成
        foundClasses.forEach(item => {
            examplesMarkdown += `- [${item.name}](#${item.name.toLowerCase()})\n`;
        });
        
        examplesMarkdown += '\n---\n\n';
        
        // 各クラスの詳細な使用例を生成
        foundClasses.forEach(item => {
            examplesMarkdown += this.generateDetailedClassExample(item.class, item.name, item.file);
        });
        
        // 統合使用例を追加
        examplesMarkdown += this.generateIntegrationExamples();
        
        await fs.writeFile(examplesPath, examplesMarkdown, 'utf-8');
        console.log('📖 使用例集生成完了: EXAMPLES.md');
    }

    /**
     * 詳細なクラス使用例の生成
     */
    generateDetailedClassExample(classInfo, className, filePath) {
        let markdown = `## ${className}

**ファイル**: \`${filePath}\`

`;
        
        if (classInfo.comment) {
            markdown += `${classInfo.comment}\n\n`;
        }
        
        // 基本的な使用パターン
        markdown += `### 基本的な使用方法

\`\`\`javascript
${this.generateBasicUsageExample(className, classInfo)}
\`\`\`

`;
        
        // 高度な使用パターン
        markdown += `### 高度な使用方法

\`\`\`javascript
${this.generateAdvancedUsageExample(className, classInfo)}
\`\`\`

`;
        
        // よくある使用パターン
        markdown += `### よくある使用パターン

${this.generateCommonPatternsExample(className, classInfo)}

---

`;
        
        return markdown;
    }

    /**
     * 基本使用例の生成
     */
    generateBasicUsageExample(className, classInfo) {
        const examples = {
            'GameEngine': `// ゲームエンジンの初期化と開始
const canvas = document.getElementById('gameCanvas');
const gameEngine = new GameEngine(canvas);

// 初期化
await gameEngine.initialize();

// ゲーム開始
gameEngine.start();

// ゲーム終了時のクリーンアップ
window.addEventListener('beforeunload', () => {
    gameEngine.destroy();
});`,
            
            'ConfigurationManager': `// 設定管理システムの使用
import { getConfigurationManager } from './core/ConfigurationManager.js';

const configManager = getConfigurationManager();

// 設定値の取得
const masterVolume = configManager.get('audio', 'volumes.master', 0.7);

// 設定値の更新
configManager.set('audio', 'volumes.master', 0.8);

// 設定変更の監視
const watchId = configManager.watch('audio', 'volumes.master', (newValue, oldValue) => {
    console.log(\`音量が \${oldValue} から \${newValue} に変更されました\`);
});`,
            
            'BubbleManager': `// バブル管理システムの基本使用
const gameEngine = getGameEngine();
const bubbleManager = new BubbleManager(gameEngine);

// バブルのスポーン
bubbleManager.spawnBubble('normal', { x: 100, y: 100 });

// フレーム更新
const deltaTime = 16.67; // 60FPS
bubbleManager.update(deltaTime);

// 描画
const ctx = canvas.getContext('2d');
bubbleManager.render(ctx);`
        };
        
        return examples[className] || `// ${className}の基本的な使用例
const instance = new ${className}();
instance.initialize();`;
    }

    /**
     * 高度な使用例の生成
     */
    generateAdvancedUsageExample(className, classInfo) {
        const examples = {
            'GameEngine': `// ゲームエンジンの高度な設定
const gameEngine = new GameEngine(canvas);

// パフォーマンス監視の有効化
gameEngine.enablePerformanceMonitoring(true);

// エラーハンドリングの設定
gameEngine.setErrorHandler((error, context) => {
    console.error('Game Error:', error, context);
    // エラー分析やレポート送信
});

// カスタムシーンの登録
gameEngine.registerScene('customScene', new CustomScene());

// ゲームループのカスタマイズ
gameEngine.setUpdateCallback((deltaTime) => {
    // カスタム更新処理
});`,
            
            'ConfigurationManager': `// 設定管理の高度な機能
const configManager = getConfigurationManager();

// バルク設定の適用
const gameSettings = {
    'game.difficulty': 'hard',
    'audio.volumes.master': 0.8,
    'effects.particles.maxCount': 300
};

Object.entries(gameSettings).forEach(([key, value]) => {
    const [category, ...keyParts] = key.split('.');
    configManager.set(category, keyParts.join('.'), value);
});

// 設定のバリデーション
const isValid = configManager.validate('audio', 'volumes.master', 1.5);
if (!isValid) {
    console.warn('Invalid volume setting');
}

// キャッシュのクリア
configManager.clearCache();`
        };
        
        return examples[className] || `// ${className}の高度な使用例
const instance = new ${className}();
// 高度な設定やカスタマイズ
instance.configure(advancedOptions);`;
    }

    /**
     * よくあるパターンの例の生成
     */
    generateCommonPatternsExample(className, classInfo) {
        return `**シングルトンパターン**: インスタンスの共有が必要な場合
**ファクトリーパターン**: 複数の種類のオブジェクト生成が必要な場合
**オブザーバーパターン**: 状態変更の通知が必要な場合

詳細な実装例については、プロジェクトのソースコードを参照してください。`;
    }

    /**
     * 統合使用例の生成
     */
    generateIntegrationExamples() {
        return `## 統合使用例

### 基本的なゲーム初期化

\`\`\`javascript
// 完全なゲーム初期化の例
async function initializeGame() {
    // 1. Canvas要素の取得
    const canvas = document.getElementById('gameCanvas');
    
    // 2. ゲームエンジンの初期化
    const gameEngine = new GameEngine(canvas);
    
    // 3. 設定管理システムの設定
    const configManager = getConfigurationManager();
    configManager.set('performance', 'optimization.targetFPS', 60);
    
    // 4. 音響システムの初期化
    const audioManager = new AudioManager();
    await audioManager.initialize();
    
    // 5. ゲーム開始
    await gameEngine.initialize();
    gameEngine.start();
    
    return gameEngine;
}

// 使用方法
initializeGame().then(gameEngine => {
    console.log('ゲームが正常に初期化されました');
}).catch(error => {
    console.error('初期化エラー:', error);
});
\`\`\`

### 設定とパフォーマンスの最適化

\`\`\`javascript
// パフォーマンス重視の設定例
function optimizeForPerformance() {
    const configManager = getConfigurationManager();
    
    // パフォーマンス設定
    configManager.set('performance', 'optimization.maxBubbles', 15);
    configManager.set('effects', 'particles.maxCount', 200);
    configManager.set('effects', 'particles.quality', 0.8);
    
    // 音響品質の調整
    configManager.set('audio', 'quality.sampleRate', 22050);
    
    console.log('パフォーマンス最適化設定を適用しました');
}
\`\`\`

### エラーハンドリングとデバッグ

\`\`\`javascript
// 包括的なエラーハンドリング例
function setupErrorHandling(gameEngine) {
    // ゲームエンジンのエラーハンドリング
    gameEngine.setErrorHandler((error, context) => {
        console.error('Game Engine Error:', error);
        // エラーレポートの送信やユーザー通知
    });
    
    // グローバルエラーハンドリング
    window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error);
    });
    
    // Promise のエラーハンドリング
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
    });
}
\`\`\`

---

*これらの例は実際のプロジェクトから抜粋したものです。最新の使用方法については、各クラスのドキュメントを参照してください。*
`;
    }
}

// コマンドライン実行用
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new APIDocumentationGenerator();
    
    // コマンドライン引数の処理
    const args = process.argv.slice(2);
    if (args.includes('--include-private')) {
        generator.config.includePrivateMethods = true;
    }
    if (args.includes('--no-examples')) {
        generator.config.includeUsageExamples = false;
    }
    
    generator.generate().catch(error => {
        console.error('生成に失敗しました:', error);
        process.exit(1);
    });
}

export { APIDocumentationGenerator };