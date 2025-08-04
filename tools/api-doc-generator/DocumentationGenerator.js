/**
 * DocumentationGenerator - 文書生成コンポーネント
 * 
 * 責任:
 * - 解析データから文書構造の生成
 * - クロスリファレンス・ナビゲーションの生成
 * - 多言語コンテンツ対応（日本語・英語）
 * - Markdown形式での文書フォーマット
 */

import fs from 'fs/promises';
import path from 'path';

export class DocumentationGenerator {
    constructor() {
        this.crossReferenceMap = new Map();
        this.navigationStructure = new Map();
    }

    /**
     * ドキュメント生成メイン処理
     * @param {Array} analysisResults - 解析結果配列
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<void>}
     */
    async generateDocumentation(analysisResults, outputDir) {
        console.log('📝 API ドキュメントを生成中...');
        
        // クロスリファレンスマップを構築
        this.buildCrossReferenceMap(analysisResults);
        
        for (const analysis of analysisResults) {
            if (analysis.classes.length > 0 || analysis.functions.length > 0) {
                await this.generateFileDocumentation(analysis, outputDir);
            }
        }
    }

    /**
     * ファイル単位のドキュメント生成
     * @param {Object} analysis - ファイル解析結果
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<void>}
     */
    async generateFileDocumentation(analysis, outputDir) {
        const fileName = path.basename(analysis.filePath, '.js');
        const outputPath = path.join(outputDir, `${fileName}.md`);
        
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
        console.log(`📄 生成完了: ${path.relative(outputDir, outputPath)}`);
    }

    /**
     * マークダウンヘッダーの生成
     * @param {Object} analysis - ファイル解析結果
     * @returns {string} マークダウンヘッダー
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
     * @param {Object} analysis - ファイル解析結果
     * @returns {string} 目次マークダウン
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
     * @param {Object} classInfo - クラス情報
     * @returns {string} クラスドキュメント
     */
    generateClassDocumentation(classInfo) {
        let markdown = `## ${classInfo.name}\n\n`;
        
        // クラス説明
        if (classInfo.comment) {
            markdown += `${classInfo.comment}\n\n`;
        }
        
        // 継承情報
        if (classInfo.superClass) {
            const superClassLink = this.generateCrossReference(classInfo.superClass);
            markdown += `**継承:** ${superClassLink}\n\n`;
        }
        
        // プロパティ
        if (classInfo.properties.length > 0) {
            markdown += '### プロパティ\n\n';
            for (const property of classInfo.properties) {
                markdown += this.generatePropertyDocumentation(property);
            }
            markdown += '\n';
        }
        
        // メソッド
        if (classInfo.methods.length > 0) {
            markdown += '### メソッド\n\n';
            for (const method of classInfo.methods) {
                markdown += this.generateMethodDocumentation(method);
            }
        }
        
        return markdown + '\n---\n\n';
    }

    /**
     * メソッドドキュメントの生成
     * @param {Object} methodInfo - メソッド情報
     * @returns {string} メソッドドキュメント
     */
    generateMethodDocumentation(methodInfo) {
        let markdown = `#### ${methodInfo.name}\n\n`;
        
        // メソッドシグネチャ
        const signature = this.generateMethodSignature(methodInfo);
        markdown += `\`\`\`javascript\n${signature}\n\`\`\`\n\n`;
        
        // 説明
        if (methodInfo.comment) {
            markdown += `${methodInfo.comment}\n\n`;
        }
        
        // パラメータ
        if (methodInfo.parameters.length > 0) {
            markdown += '**パラメータ:**\n\n';
            for (const param of methodInfo.parameters) {
                const defaultValue = param.hasDefault ? ` (デフォルト: \`${param.defaultValue}\`)` : '';
                const restParam = param.isRest ? '...' : '';
                markdown += `- \`${restParam}${param.name}\`${defaultValue}\n`;
            }
            markdown += '\n';
        }
        
        // 戻り値
        if (methodInfo.returnType) {
            markdown += `**戻り値:** \`${methodInfo.returnType}\`\n\n`;
        }
        
        return markdown;
    }

    /**
     * 関数ドキュメントの生成
     * @param {Object} functionInfo - 関数情報
     * @returns {string} 関数ドキュメント
     */
    generateFunctionDocumentation(functionInfo) {
        let markdown = `## ${functionInfo.name}()\n\n`;
        
        // 関数シグネチャ
        const signature = this.generateFunctionSignature(functionInfo);
        markdown += `\`\`\`javascript\n${signature}\n\`\`\`\n\n`;
        
        // 説明
        if (functionInfo.comment) {
            markdown += `${functionInfo.comment}\n\n`;
        }
        
        // パラメータ
        if (functionInfo.parameters.length > 0) {
            markdown += '**パラメータ:**\n\n';
            for (const param of functionInfo.parameters) {
                const defaultValue = param.hasDefault ? ` (デフォルト: \`${param.defaultValue}\`)` : '';
                const restParam = param.isRest ? '...' : '';
                markdown += `- \`${restParam}${param.name}\`${defaultValue}\n`;
            }
            markdown += '\n';
        }
        
        // 戻り値
        if (functionInfo.returnType) {
            markdown += `**戻り値:** \`${functionInfo.returnType}\`\n\n`;
        }
        
        // エクスポート情報
        if (functionInfo.isExported) {
            markdown += '**エクスポート:** はい\n\n';
        }
        
        return markdown + '---\n\n';
    }

    /**
     * プロパティドキュメントの生成
     * @param {Object} propertyInfo - プロパティ情報
     * @returns {string} プロパティドキュメント
     */
    generatePropertyDocumentation(propertyInfo) {
        let markdown = `- **${propertyInfo.name}**`;
        
        if (propertyInfo.type) {
            markdown += ` (\`${propertyInfo.type}\`)`;
        }
        
        if (propertyInfo.comment) {
            markdown += `: ${propertyInfo.comment}`;
        }
        
        return markdown + '\n';
    }

    /**
     * 定数ドキュメントの生成
     * @param {Array} constants - 定数配列
     * @returns {string} 定数ドキュメント
     */
    generateConstantsDocumentation(constants) {
        let markdown = '## 定数\n\n';
        
        for (const constant of constants) {
            markdown += `### ${constant.name}\n\n`;
            
            if (constant.type) {
                markdown += `**型:** \`${constant.type}\`\n\n`;
            }
            
            if (constant.comment) {
                markdown += `${constant.comment}\n\n`;
            }
            
            if (constant.isExported) {
                markdown += '**エクスポート:** はい\n\n';
            }
            
            markdown += '---\n\n';
        }
        
        return markdown;
    }

    /**
     * メソッドシグネチャの生成
     * @param {Object} methodInfo - メソッド情報
     * @returns {string} メソッドシグネチャ
     */
    generateMethodSignature(methodInfo) {
        const asyncPrefix = methodInfo.isAsync ? 'async ' : '';
        const params = methodInfo.parameters.map(p => {
            const restPrefix = p.isRest ? '...' : '';
            const defaultSuffix = p.hasDefault ? ` = ${p.defaultValue}` : '';
            return `${restPrefix}${p.name}${defaultSuffix}`;
        }).join(', ');
        
        return `${asyncPrefix}${methodInfo.name}(${params})`;
    }

    /**
     * 関数シグネチャの生成
     * @param {Object} functionInfo - 関数情報
     * @returns {string} 関数シグネチャ
     */
    generateFunctionSignature(functionInfo) {
        const params = functionInfo.parameters.map(p => {
            const restPrefix = p.isRest ? '...' : '';
            const defaultSuffix = p.hasDefault ? ` = ${p.defaultValue}` : '';
            return `${restPrefix}${p.name}${defaultSuffix}`;
        }).join(', ');
        
        return `function ${functionInfo.name}(${params})`;
    }

    /**
     * クロスリファレンスマップの構築
     * @param {Array} analysisResults - 解析結果配列
     */
    buildCrossReferenceMap(analysisResults) {
        this.crossReferenceMap.clear();
        
        for (const analysis of analysisResults) {
            const fileName = path.basename(analysis.filePath, '.js');
            
            // クラス情報を登録
            for (const classInfo of analysis.classes) {
                this.crossReferenceMap.set(classInfo.name, {
                    type: 'class',
                    file: fileName,
                    anchor: classInfo.name.toLowerCase()
                });
            }
            
            // 関数情報を登録
            for (const functionInfo of analysis.functions) {
                this.crossReferenceMap.set(functionInfo.name, {
                    type: 'function',
                    file: fileName,
                    anchor: functionInfo.name.toLowerCase()
                });
            }
        }
    }

    /**
     * クロスリファレンスリンクの生成
     * @param {string} referenceName - 参照名
     * @returns {string} リンクマークダウン
     */
    generateCrossReference(referenceName) {
        const reference = this.crossReferenceMap.get(referenceName);
        if (reference) {
            return `[${referenceName}](${reference.file}.md#${reference.anchor})`;
        }
        return referenceName;
    }

    /**
     * 変更履歴ドキュメントの生成
     * @param {Array} changeHistory - 変更履歴
     * @returns {string} 変更履歴マークダウン
     */
    generateChangeHistoryDocumentation(changeHistory) {
        if (!changeHistory || changeHistory.length === 0) {
            return '';
        }
        
        let markdown = '## 変更履歴\n\n';
        
        for (const change of changeHistory.slice(0, 10)) { // 最新10件
            const date = new Date(change.timestamp).toLocaleDateString('ja-JP');
            markdown += `### ${date}\n\n`;
            markdown += `${change.description}\n\n`;
            
            if (change.files && change.files.length > 0) {
                markdown += '**影響ファイル:**\n';
                for (const file of change.files) {
                    markdown += `- ${file}\n`;
                }
                markdown += '\n';
            }
        }
        
        return markdown;
    }

    /**
     * 使用例ドキュメントの生成
     * @param {Object} analysis - ファイル解析結果
     * @returns {string} 使用例マークダウン
     */
    generateUsageExamples(analysis) {
        let markdown = '## 使用例\n\n';
        
        // クラスの使用例
        for (const classInfo of analysis.classes) {
            if (classInfo.name === 'constructor') continue;
            
            markdown += `### ${classInfo.name} の使用例\n\n`;
            markdown += '```javascript\n';
            markdown += `// ${classInfo.name} の基本的な使用方法\n`;
            markdown += `const instance = new ${classInfo.name}();\n`;
            
            // パブリックメソッドの例
            const publicMethods = classInfo.methods.filter(m => 
                !m.name.startsWith('_') && m.name !== 'constructor'
            );
            
            if (publicMethods.length > 0) {
                const exampleMethod = publicMethods[0];
                const paramExample = exampleMethod.parameters.map(p => 
                    p.name === 'options' ? '{}' : `'${p.name}'`
                ).join(', ');
                
                if (exampleMethod.isAsync) {
                    markdown += `const result = await instance.${exampleMethod.name}(${paramExample});\n`;
                } else {
                    markdown += `const result = instance.${exampleMethod.name}(${paramExample});\n`;
                }
            }
            
            markdown += '```\n\n';
        }
        
        return markdown;
    }

    /**
     * 統計情報の生成
     * @param {Array} analysisResults - 解析結果配列
     * @returns {Object} 統計情報
     */
    generateStatistics(analysisResults) {
        const stats = {
            totalFiles: analysisResults.length,
            totalClasses: 0,
            totalMethods: 0,
            totalFunctions: 0,
            totalConstants: 0,
            documentedItems: 0,
            undocumentedItems: 0
        };
        
        for (const analysis of analysisResults) {
            stats.totalClasses += analysis.classes.length;
            stats.totalFunctions += analysis.functions.length;
            stats.totalConstants += analysis.constants.length;
            
            for (const classInfo of analysis.classes) {
                stats.totalMethods += classInfo.methods.length;
                
                // ドキュメント化状況の確認
                if (classInfo.comment) {
                    stats.documentedItems++;
                } else {
                    stats.undocumentedItems++;
                }
                
                for (const method of classInfo.methods) {
                    if (method.comment) {
                        stats.documentedItems++;
                    } else {
                        stats.undocumentedItems++;
                    }
                }
            }
            
            for (const func of analysis.functions) {
                if (func.comment) {
                    stats.documentedItems++;
                } else {
                    stats.undocumentedItems++;
                }
            }
        }
        
        return stats;
    }

    /**
     * クロスリファレンスマップのクリア
     */
    clearCrossReferenceMap() {
        this.crossReferenceMap.clear();
        this.navigationStructure.clear();
    }
}