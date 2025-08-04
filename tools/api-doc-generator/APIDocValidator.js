/**
 * APIDocValidator - ドキュメント検証コンポーネント
 * 
 * 責任:
 * - ドキュメント完全性・整合性の検証
 * - クロスリファレンス・リンクの検証
 * - 検証レポートの生成
 * - ドキュメント品質分析
 */

import fs from 'fs/promises';
import path from 'path';

export class APIDocValidator {
    constructor() {
        this.validationResults = [];
        this.crossReferenceMap = new Map();
        this.linkValidationResults = new Map();
        this.qualityMetrics = {
            totalItems: 0,
            documentedItems: 0,
            missingDocumentation: [],
            brokenLinks: [],
            inconsistencies: []
        };
    }

    /**
     * 包括的な検証の実行
     * @param {Array} analysisResults - 解析結果配列
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<Object>} 検証結果
     */
    async validateDocumentation(analysisResults, outputDir) {
        console.log('🔍 ドキュメントの検証を開始中...');
        
        // 検証結果をリセット
        this.resetValidationState();
        
        // 基本検証
        await this.validateCompleteness(analysisResults);
        
        // 整合性検証
        await this.validateConsistency(analysisResults);
        
        // リンク検証
        await this.validateLinks(analysisResults, outputDir);
        
        // クロスリファレンス検証
        await this.validateCrossReferences(analysisResults);
        
        // 検証レポートの生成
        const report = await this.generateValidationReport(outputDir);
        
        console.log('✅ ドキュメント検証完了');
        return report;
    }

    /**
     * ドキュメント完全性の検証
     * @param {Array} analysisResults - 解析結果配列
     * @returns {Promise<void>}
     */
    async validateCompleteness(analysisResults) {
        console.log('📋 完全性を検証中...');
        
        for (const analysis of analysisResults) {
            const fileName = path.basename(analysis.filePath, '.js');
            
            // クラス検証
            for (const classInfo of analysis.classes) {
                this.qualityMetrics.totalItems++;
                
                if (!classInfo.comment || classInfo.comment.trim() === '') {
                    this.qualityMetrics.missingDocumentation.push({
                        type: 'class',
                        name: classInfo.name,
                        file: fileName,
                        issue: 'クラスコメントが不足'
                    });
                } else {
                    this.qualityMetrics.documentedItems++;
                }
                
                // メソッド検証
                for (const method of classInfo.methods) {
                    this.qualityMetrics.totalItems++;
                    
                    if (!method.comment || method.comment.trim() === '') {
                        this.qualityMetrics.missingDocumentation.push({
                            type: 'method',
                            name: `${classInfo.name}.${method.name}`,
                            file: fileName,
                            issue: 'メソッドコメントが不足'
                        });
                    } else {
                        this.qualityMetrics.documentedItems++;
                    }
                    
                    // パラメータ検証
                    if (method.parameters.length > 0 && method.comment) {
                        const hasParamDocs = method.comment.includes('@param');
                        if (!hasParamDocs) {
                            this.qualityMetrics.missingDocumentation.push({
                                type: 'parameter',
                                name: `${classInfo.name}.${method.name}`,
                                file: fileName,
                                issue: 'パラメータドキュメントが不足'
                            });
                        }
                    }
                }
            }
            
            // 関数検証
            for (const func of analysis.functions) {
                this.qualityMetrics.totalItems++;
                
                if (!func.comment || func.comment.trim() === '') {
                    this.qualityMetrics.missingDocumentation.push({
                        type: 'function',
                        name: func.name,
                        file: fileName,
                        issue: '関数コメントが不足'
                    });
                } else {
                    this.qualityMetrics.documentedItems++;
                }
            }
        }
    }

    /**
     * 整合性検証
     * @param {Array} analysisResults - 解析結果配列
     * @returns {Promise<void>}
     */
    async validateConsistency(analysisResults) {
        console.log('🔄 整合性を検証中...');
        
        const classNames = new Set();
        const functionNames = new Set();
        
        for (const analysis of analysisResults) {
            const fileName = path.basename(analysis.filePath, '.js');
            
            // 重複クラス名検証
            for (const classInfo of analysis.classes) {
                if (classNames.has(classInfo.name)) {
                    this.qualityMetrics.inconsistencies.push({
                        type: 'duplicate_class',
                        name: classInfo.name,
                        file: fileName,
                        issue: '重複するクラス名'
                    });
                }
                classNames.add(classInfo.name);
                
                // メソッド名の一意性検証
                const methodNames = new Set();
                for (const method of classInfo.methods) {
                    if (methodNames.has(method.name)) {
                        this.qualityMetrics.inconsistencies.push({
                            type: 'duplicate_method',
                            name: `${classInfo.name}.${method.name}`,
                            file: fileName,
                            issue: 'クラス内で重複するメソッド名'
                        });
                    }
                    methodNames.add(method.name);
                }
            }
            
            // 重複関数名検証
            for (const func of analysis.functions) {
                if (functionNames.has(func.name)) {
                    this.qualityMetrics.inconsistencies.push({
                        type: 'duplicate_function',
                        name: func.name,
                        file: fileName,
                        issue: '重複する関数名'
                    });
                }
                functionNames.add(func.name);
            }
        }
    }

    /**
     * リンク検証
     * @param {Array} analysisResults - 解析結果配列
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<void>}
     */
    async validateLinks(analysisResults, outputDir) {
        console.log('🔗 リンクを検証中...');
        
        // 存在するファイル一覧を取得
        const existingFiles = new Set();
        for (const analysis of analysisResults) {
            const fileName = path.basename(analysis.filePath, '.js');
            existingFiles.add(`${fileName}.md`);
        }
        
        // 各ファイルのリンクを検証
        for (const analysis of analysisResults) {
            const fileName = path.basename(analysis.filePath, '.js');
            const docPath = path.join(outputDir, `${fileName}.md`);
            
            try {
                const content = await fs.readFile(docPath, 'utf-8');
                await this.validateFileLinks(content, fileName, existingFiles);
            } catch (error) {
                this.qualityMetrics.brokenLinks.push({
                    type: 'missing_file',
                    file: fileName,
                    target: docPath,
                    issue: 'ドキュメントファイルが存在しない'
                });
            }
        }
    }

    /**
     * ファイル内リンクの検証
     * @param {string} content - ファイル内容
     * @param {string} fileName - ファイル名
     * @param {Set} existingFiles - 存在するファイル一覧
     * @returns {Promise<void>}
     */
    async validateFileLinks(content, fileName, existingFiles) {
        // Markdownリンクの検出
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
            const [, linkText, linkTarget] = match;
            
            // 内部リンクの検証
            if (linkTarget.endsWith('.md') || linkTarget.includes('.md#')) {
                const [targetFile] = linkTarget.split('#');
                
                if (!existingFiles.has(targetFile)) {
                    this.qualityMetrics.brokenLinks.push({
                        type: 'broken_link',
                        file: fileName,
                        target: targetFile,
                        linkText,
                        issue: 'リンク先ファイルが存在しない'
                    });
                }
            }
        }
    }

    /**
     * クロスリファレンス検証
     * @param {Array} analysisResults - 解析結果配列
     * @returns {Promise<void>}
     */
    async validateCrossReferences(analysisResults) {
        console.log('🔀 クロスリファレンスを検証中...');
        
        // 継承関係の構築
        const inheritanceMap = new Map();
        const classMap = new Map();
        
        for (const analysis of analysisResults) {
            for (const classInfo of analysis.classes) {
                const fileName = path.basename(analysis.filePath, '.js');
                classMap.set(classInfo.name, { class: classInfo, file: fileName });
                
                if (classInfo.superClass) {
                    if (!inheritanceMap.has(classInfo.superClass)) {
                        inheritanceMap.set(classInfo.superClass, []);
                    }
                    inheritanceMap.get(classInfo.superClass).push({
                        name: classInfo.name,
                        file: fileName
                    });
                }
            }
        }
        
        // 継承関係の検証
        for (const [superClass, children] of inheritanceMap) {
            if (!classMap.has(superClass)) {
                this.qualityMetrics.inconsistencies.push({
                    type: 'missing_superclass',
                    name: superClass,
                    issue: '存在しない親クラスを参照',
                    children: children.map(c => `${c.name} (${c.file})`)
                });
            }
        }
    }

    /**
     * 検証レポートの生成
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<Object>} 検証レポート
     */
    async generateValidationReport(outputDir) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalItems: this.qualityMetrics.totalItems,
                documentedItems: this.qualityMetrics.documentedItems,
                documentationRate: this.qualityMetrics.totalItems > 0 ? 
                    Math.round((this.qualityMetrics.documentedItems / this.qualityMetrics.totalItems) * 100) : 0,
                issues: {
                    missingDocumentation: this.qualityMetrics.missingDocumentation.length,
                    brokenLinks: this.qualityMetrics.brokenLinks.length,
                    inconsistencies: this.qualityMetrics.inconsistencies.length
                }
            },
            details: {
                missingDocumentation: this.qualityMetrics.missingDocumentation,
                brokenLinks: this.qualityMetrics.brokenLinks,
                inconsistencies: this.qualityMetrics.inconsistencies
            }
        };
        
        // レポートファイルに保存
        const reportPath = path.join(outputDir, 'validation-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
        
        // 人間が読みやすい形式でもレポートを生成
        await this.generateHumanReadableReport(report, outputDir);
        
        console.log(`📊 検証レポート生成完了: validation-report.json`);
        return report;
    }

    /**
     * 人間が読みやすい検証レポートの生成
     * @param {Object} report - 検証レポート
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<void>}
     */
    async generateHumanReadableReport(report, outputDir) {
        let markdown = `# API ドキュメント検証レポート

生成日時: ${new Date(report.timestamp).toLocaleString('ja-JP')}

## サマリー

| 項目 | 値 |
|------|-----|
| 総アイテム数 | ${report.summary.totalItems} |
| ドキュメント化済み | ${report.summary.documentedItems} |
| ドキュメント化率 | ${report.summary.documentationRate}% |
| 不足ドキュメント | ${report.summary.issues.missingDocumentation} |
| 壊れたリンク | ${report.summary.issues.brokenLinks} |
| 整合性の問題 | ${report.summary.issues.inconsistencies} |

`;
        
        // 不足ドキュメントの詳細
        if (report.details.missingDocumentation.length > 0) {
            markdown += `## 不足ドキュメント

| タイプ | 名前 | ファイル | 問題 |
|--------|------|----------|------|
`;
            report.details.missingDocumentation.forEach(item => {
                markdown += `| ${item.type} | ${item.name} | ${item.file} | ${item.issue} |\n`;
            });
            markdown += '\n';
        }
        
        // 壊れたリンクの詳細
        if (report.details.brokenLinks.length > 0) {
            markdown += `## 壊れたリンク

| ファイル | ターゲット | リンクテキスト | 問題 |
|----------|------------|----------------|------|
`;
            report.details.brokenLinks.forEach(item => {
                markdown += `| ${item.file} | ${item.target || 'N/A'} | ${item.linkText || 'N/A'} | ${item.issue} |\n`;
            });
            markdown += '\n';
        }
        
        // 整合性の問題の詳細
        if (report.details.inconsistencies.length > 0) {
            markdown += `## 整合性の問題

| タイプ | 名前 | ファイル | 問題 |
|--------|------|----------|------|
`;
            report.details.inconsistencies.forEach(item => {
                markdown += `| ${item.type} | ${item.name} | ${item.file || 'N/A'} | ${item.issue} |\n`;
            });
            markdown += '\n';
        }
        
        // 改善提案
        markdown += `## 改善提案

### ドキュメント化率向上
`;
        if (report.summary.documentationRate < 80) {
            markdown += `- 現在のドキュメント化率は ${report.summary.documentationRate}% です。80% を目標に不足している項目にコメントを追加してください。\n`;
        }
        
        if (report.details.missingDocumentation.length > 0) {
            markdown += `- ${report.details.missingDocumentation.length} 項目でドキュメントが不足しています。\n`;
        }
        
        if (report.details.brokenLinks.length > 0) {
            markdown += `- ${report.details.brokenLinks.length} 個の壊れたリンクを修正してください。\n`;
        }
        
        if (report.details.inconsistencies.length > 0) {
            markdown += `- ${report.details.inconsistencies.length} 個の整合性の問題を解決してください。\n`;
        }
        
        const reportPath = path.join(outputDir, 'VALIDATION_REPORT.md');
        await fs.writeFile(reportPath, markdown, 'utf-8');
        console.log('📋 人間が読みやすい検証レポート生成完了: VALIDATION_REPORT.md');
    }

    /**
     * 検証状態のリセット
     */
    resetValidationState() {
        this.validationResults = [];
        this.crossReferenceMap.clear();
        this.linkValidationResults.clear();
        this.qualityMetrics = {
            totalItems: 0,
            documentedItems: 0,
            missingDocumentation: [],
            brokenLinks: [],
            inconsistencies: []
        };
    }

    /**
     * クロスリファレンスドキュメントの生成
     * @param {Array} analysisResults - 解析結果配列
     * @param {string} outputDir - 出力ディレクトリ
     * @returns {Promise<void>}
     */
    async generateCrossReferences(analysisResults, outputDir) {
        console.log('🔗 クロスリファレンスを生成中...');
        
        const crossRefPath = path.join(outputDir, 'CROSS_REFERENCES.md');
        
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
                        importType: imp.defaultImport ? 'default' : 'named',
                        importedItems: imp.namedImports
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
                const fileName = path.basename(child.file, '.js');
                crossRefMarkdown += `- [${child.name}](${fileName}.md#${child.name.toLowerCase()}) (${child.file})\n`;
            });
            crossRefMarkdown += '\n';
        });
        
        // 使用関係を出力
        if (usageMap.size > 0) {
            crossRefMarkdown += `## インポート関係

`;
            usageMap.forEach((users, source) => {
                crossRefMarkdown += `### ${source}\n\n**使用クラス**:\n`;
                users.forEach(user => {
                    const fileName = path.basename(user.file, '.js');
                    crossRefMarkdown += `- [${user.name}](${fileName}.md#${user.name.toLowerCase()}) (${user.importType})\n`;
                });
                crossRefMarkdown += '\n';
            });
        }
        
        await fs.writeFile(crossRefPath, crossRefMarkdown, 'utf-8');
        console.log('🔗 クロスリファレンス生成完了: CROSS_REFERENCES.md');
    }

    /**
     * 検証結果の取得
     * @returns {Object} 現在の検証結果
     */
    getValidationResults() {
        return {
            qualityMetrics: { ...this.qualityMetrics },
            crossReferenceMap: new Map(this.crossReferenceMap),
            linkValidationResults: new Map(this.linkValidationResults)
        };
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.resetValidationState();
    }
}