/**
 * TemplateRenderer - テンプレート描画コンポーネント
 * 
 * 責任:
 * - Markdownテンプレートの読み込み・処理
 * - スタイリング・フォーマット規則の適用
 * - 目次・インデックスの生成
 * - 出力ファイルの生成・管理
 */

import fs from 'fs/promises';
import path from 'path';

export class TemplateRenderer {
    constructor() {
        this.templates = new Map();
        this.styleConfig = {
            codeBlockLanguage: 'javascript',
            linkStyle: 'markdown',
            tableStyle: 'github',
            headingStyle: 'atx'
        };
        this.outputMetadata = new Map();
    }

    /**
     * インデックスファイルの生成
     * @param {Array} analysisResults - 解析結果配列
     * @param {string} outputDir - 出力ディレクトリ
     * @param {string} version - バージョン情報
     * @returns {Promise<void>}
     */
    async generateIndex(analysisResults, outputDir, version) {
        console.log('📑 インデックスファイルを生成中...');
        
        let indexMarkdown = this.generateIndexHeader(version);
        
        // ファイル別統計情報の収集
        const fileStats = this.collectFileStatistics(analysisResults);
        
        // ファイル一覧テーブル
        indexMarkdown += this.generateFileListTable(fileStats);
        
        // クラス一覧
        indexMarkdown += this.generateClassIndex(analysisResults);
        
        // 関数一覧
        indexMarkdown += this.generateFunctionIndex(analysisResults);
        
        // プロジェクト統計
        indexMarkdown += this.generateProjectStatistics(analysisResults);
        
        const indexPath = path.join(outputDir, 'README.md');
        await fs.writeFile(indexPath, indexMarkdown, 'utf-8');
        console.log('📄 インデックス生成完了: README.md');
    }

    /**
     * インデックスヘッダーの生成
     * @param {string} version - バージョン情報
     * @returns {string} インデックスヘッダー
     */
    generateIndexHeader(version) {
        return `# API Reference Index

Generated on: ${new Date().toLocaleString('ja-JP')}  
Version: ${version}

## 概要

このディレクトリには、awaputi プロジェクトの自動生成された API ドキュメントが含まれています。

## ファイル一覧

`;
    }

    /**
     * ファイル統計情報の収集
     * @param {Array} analysisResults - 解析結果配列
     * @returns {Array} ファイル統計配列
     */
    collectFileStatistics(analysisResults) {
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
        
        return fileStats;
    }

    /**
     * ファイル一覧テーブルの生成
     * @param {Array} fileStats - ファイル統計配列
     * @returns {string} テーブルマークダウン
     */
    generateFileListTable(fileStats) {
        let markdown = `| ファイル | クラス | メソッド | 関数 | 定数 |
|----------|--------|----------|------|------|
`;
        
        fileStats.forEach(stats => {
            markdown += `| [${stats.fileName}](${stats.fileName}.md) | ${stats.classCount} | ${stats.totalMethods} | ${stats.functionCount} | ${stats.constantCount} |\n`;
        });
        
        return markdown + '\n';
    }

    /**
     * クラスインデックスの生成
     * @param {Array} analysisResults - 解析結果配列
     * @returns {string} クラスインデックス
     */
    generateClassIndex(analysisResults) {
        const allClasses = [];
        
        analysisResults.forEach(analysis => {
            analysis.classes.forEach(cls => {
                const fileName = path.basename(analysis.filePath, '.js');
                allClasses.push({
                    name: cls.name,
                    file: fileName,
                    comment: cls.comment,
                    methodCount: cls.methods.length
                });
            });
        });
        
        if (allClasses.length === 0) {
            return '';
        }
        
        allClasses.sort((a, b) => a.name.localeCompare(b.name));
        
        let markdown = '## クラス一覧\n\n';
        
        allClasses.forEach(cls => {
            const description = cls.comment ? ` - ${cls.comment}` : '';
            markdown += `- **[${cls.name}](${cls.file}.md#${cls.name.toLowerCase()})** (${cls.methodCount}メソッド)${description}\n`;
        });
        
        return markdown + '\n';
    }

    /**
     * 関数インデックスの生成
     * @param {Array} analysisResults - 解析結果配列
     * @returns {string} 関数インデックス
     */
    generateFunctionIndex(analysisResults) {
        const allFunctions = [];
        
        analysisResults.forEach(analysis => {
            analysis.functions.forEach(func => {
                const fileName = path.basename(analysis.filePath, '.js');
                allFunctions.push({
                    name: func.name,
                    file: fileName,
                    comment: func.comment,
                    isExported: func.isExported
                });
            });
        });
        
        if (allFunctions.length === 0) {
            return '';
        }
        
        allFunctions.sort((a, b) => a.name.localeCompare(b.name));
        
        let markdown = '## 関数一覧\n\n';
        
        allFunctions.forEach(func => {
            const exportBadge = func.isExported ? ' 📤' : '';
            const description = func.comment ? ` - ${func.comment}` : '';
            markdown += `- **[${func.name}()](${func.file}.md#${func.name.toLowerCase()})**${exportBadge}${description}\n`;
        });
        
        return markdown + '\n';
    }

    /**
     * プロジェクト統計の生成
     * @param {Array} analysisResults - 解析結果配列
     * @returns {string} 統計マークダウン
     */
    generateProjectStatistics(analysisResults) {
        const stats = {
            totalFiles: analysisResults.length,
            totalClasses: 0,
            totalMethods: 0,
            totalFunctions: 0,
            totalConstants: 0,
            documentedClasses: 0,
            documentedMethods: 0,
            documentedFunctions: 0
        };
        
        analysisResults.forEach(analysis => {
            stats.totalClasses += analysis.classes.length;
            stats.totalFunctions += analysis.functions.length;
            stats.totalConstants += analysis.constants.length;
            
            analysis.classes.forEach(cls => {
                stats.totalMethods += cls.methods.length;
                if (cls.comment) stats.documentedClasses++;
                
                cls.methods.forEach(method => {
                    if (method.comment) stats.documentedMethods++;
                });
            });
            
            analysis.functions.forEach(func => {
                if (func.comment) stats.documentedFunctions++;
            });
        });
        
        const classDocRatio = stats.totalClasses > 0 ? 
            Math.round((stats.documentedClasses / stats.totalClasses) * 100) : 0;
        const methodDocRatio = stats.totalMethods > 0 ? 
            Math.round((stats.documentedMethods / stats.totalMethods) * 100) : 0;
        const functionDocRatio = stats.totalFunctions > 0 ? 
            Math.round((stats.documentedFunctions / stats.totalFunctions) * 100) : 0;
        
        return `## プロジェクト統計

| 項目 | 数量 | ドキュメント率 |
|------|------|----------------|
| ファイル | ${stats.totalFiles} | - |
| クラス | ${stats.totalClasses} | ${classDocRatio}% |
| メソッド | ${stats.totalMethods} | ${methodDocRatio}% |
| 関数 | ${stats.totalFunctions} | ${functionDocRatio}% |
| 定数 | ${stats.totalConstants} | - |

`;
    }

    /**
     * 検索インデックスの生成
     * @param {Array} analysisResults - 解析結果配列
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<void>}
     */
    async generateSearchIndex(analysisResults, outputDir) {
        console.log('🔍 検索インデックスを生成中...');
        
        const searchIndex = [];
        
        analysisResults.forEach(analysis => {
            const fileName = path.basename(analysis.filePath, '.js');
            
            // クラス情報
            analysis.classes.forEach(cls => {
                searchIndex.push({
                    type: 'class',
                    name: cls.name,
                    file: fileName,
                    description: cls.comment || '',
                    keywords: [cls.name.toLowerCase(), 'class'],
                    url: `${fileName}.md#${cls.name.toLowerCase()}`
                });
                
                // メソッド情報
                cls.methods.forEach(method => {
                    searchIndex.push({
                        type: 'method',
                        name: `${cls.name}.${method.name}`,
                        file: fileName,
                        description: method.comment || '',
                        keywords: [method.name.toLowerCase(), 'method', cls.name.toLowerCase()],
                        url: `${fileName}.md#${method.name.toLowerCase()}`
                    });
                });
            });
            
            // 関数情報
            analysis.functions.forEach(func => {
                searchIndex.push({
                    type: 'function',
                    name: func.name,
                    file: fileName,
                    description: func.comment || '',
                    keywords: [func.name.toLowerCase(), 'function'],
                    url: `${fileName}.md#${func.name.toLowerCase()}`
                });
            });
        });
        
        const searchIndexPath = path.join(outputDir, 'search-index.json');
        await fs.writeFile(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf-8');
        console.log('🔍 検索インデックス生成完了: search-index.json');
    }

    /**
     * 使用例ガイドの生成
     * @param {Array} analysisResults - 解析結果配列
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<void>}
     */
    async generateExamplesGuide(analysisResults, outputDir) {
        console.log('📖 使用例ガイドを生成中...');
        
        let markdown = `# 使用例ガイド

このガイドでは、awaputi プロジェクトの主要なクラスと関数の使用例を紹介します。

## 目次

`;
        
        // 目次の生成
        const tocSections = [];
        analysisResults.forEach(analysis => {
            if (analysis.classes.length > 0) {
                const fileName = path.basename(analysis.filePath, '.js');
                tocSections.push({
                    name: fileName,
                    classes: analysis.classes.map(cls => cls.name)
                });
            }
        });
        
        tocSections.forEach(section => {
            markdown += `- [${section.name}](#${section.name.toLowerCase()})\n`;
            section.classes.forEach(className => {
                markdown += `  - [${className}](#${className.toLowerCase()})\n`;
            });
        });
        
        markdown += '\n---\n\n';
        
        // 各セクションの詳細
        analysisResults.forEach(analysis => {
            if (analysis.classes.length === 0) return;
            
            const fileName = path.basename(analysis.filePath, '.js');
            markdown += `## ${fileName}\n\n`;
            
            analysis.classes.forEach(cls => {
                markdown += this.generateClassUsageExample(cls, fileName);
            });
        });
        
        const guidePath = path.join(outputDir, 'examples.md');
        await fs.writeFile(guidePath, markdown, 'utf-8');
        console.log('📖 使用例ガイド生成完了: examples.md');
    }

    /**
     * クラス使用例の生成
     * @param {Object} classInfo - クラス情報
     * @param {string} fileName - ファイル名
     * @returns {string} 使用例マークダウン
     */
    generateClassUsageExample(classInfo, fileName) {
        let markdown = `### ${classInfo.name}\n\n`;
        
        if (classInfo.comment) {
            markdown += `${classInfo.comment}\n\n`;
        }
        
        markdown += '**基本的な使用方法:**\n\n';
        markdown += '```javascript\n';
        markdown += `// ${fileName}.js からインポート\n`;
        markdown += `import { ${classInfo.name} } from './path/to/${fileName}.js';\n\n`;
        markdown += `// インスタンスの作成\n`;
        markdown += `const instance = new ${classInfo.name}();\n`;
        
        // パブリックメソッドの例
        const publicMethods = classInfo.methods.filter(m => 
            !m.name.startsWith('_') && m.name !== 'constructor'
        ).slice(0, 3); // 最初の3つのメソッドを表示
        
        if (publicMethods.length > 0) {
            markdown += '\n// メソッドの呼び出し例\n';
            publicMethods.forEach(method => {
                const paramExample = this.generateParameterExample(method.parameters);
                if (method.isAsync) {
                    markdown += `const result = await instance.${method.name}(${paramExample});\n`;
                } else {
                    markdown += `const result = instance.${method.name}(${paramExample});\n`;
                }
            });
        }
        
        markdown += '```\n\n';
        
        // 詳細ドキュメントへのリンク
        markdown += `[詳細なAPIドキュメントを見る](${fileName}.md#${classInfo.name.toLowerCase()})\n\n`;
        markdown += '---\n\n';
        
        return markdown;
    }

    /**
     * パラメータ例の生成
     * @param {Array} parameters - パラメータ配列
     * @returns {string} パラメータ例
     */
    generateParameterExample(parameters) {
        if (parameters.length === 0) {
            return '';
        }
        
        return parameters.map(param => {
            if (param.hasDefault) {
                return ''; // デフォルト値があるパラメータは省略
            }
            
            switch (param.name.toLowerCase()) {
                case 'options':
                case 'config':
                    return '{}';
                case 'callback':
                case 'handler':
                    return '() => {}';
                case 'data':
                case 'item':
                    return 'data';
                case 'id':
                case 'key':
                    return "'id'";
                case 'name':
                    return "'name'";
                case 'value':
                    return 'value';
                case 'array':
                case 'list':
                    return '[]';
                default:
                    return `'${param.name}'`;
            }
        }).filter(Boolean).join(', ');
    }

    /**
     * スタイル設定の更新
     * @param {Object} newConfig - 新しいスタイル設定
     */
    updateStyleConfig(newConfig) {
        this.styleConfig = { ...this.styleConfig, ...newConfig };
    }

    /**
     * テンプレートの読み込み
     * @param {string} templateName - テンプレート名
     * @param {string} templatePath - テンプレートパス
     * @returns {Promise<void>}
     */
    async loadTemplate(templateName, templatePath) {
        try {
            const content = await fs.readFile(templatePath, 'utf-8');
            this.templates.set(templateName, content);
        } catch (error) {
            console.warn(`テンプレート読み込みエラー: ${templateName}`, error.message);
        }
    }

    /**
     * テンプレートの適用
     * @param {string} templateName - テンプレート名
     * @param {Object} data - テンプレートデータ
     * @returns {string} 描画結果
     */
    applyTemplate(templateName, data) {
        const template = this.templates.get(templateName);
        if (!template) {
            return JSON.stringify(data, null, 2); // フォールバック
        }
        
        // シンプルなテンプレート変数置換
        return template.replace(/{{(.*?)}}/g, (match, key) => {
            const keys = key.trim().split('.');
            let value = data;
            for (const k of keys) {
                value = value?.[k];
            }
            return value || '';
        });
    }

    /**
     * 出力メタデータの取得
     * @returns {Object} 出力メタデータ
     */
    getOutputMetadata() {
        return Object.fromEntries(this.outputMetadata);
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.templates.clear();
        this.outputMetadata.clear();
    }
}