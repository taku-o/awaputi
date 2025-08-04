/**
 * API Documentation Generator - Main Controller
 * 
 * 責任:
 * - コンポーネント統合・オーケストレーション
 * - CLI インターフェース
 * - 設定管理・ワークフロー制御
 * - エラーハンドリング・ログ出力
 * 
 * Main Controller Pattern:
 * 軽量なコントローラーとして4つの専門コンポーネントを統制:
 * - APIDocParser: ソースコード解析
 * - DocumentationGenerator: 文書生成
 * - TemplateRenderer: テンプレート描画
 * - APIDocValidator: 検証・品質管理
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { APIDocParser } from './api-doc-generator/APIDocParser.js';
import { DocumentationGenerator } from './api-doc-generator/DocumentationGenerator.js';
import { TemplateRenderer } from './api-doc-generator/TemplateRenderer.js';
import { APIDocValidator } from './api-doc-generator/APIDocValidator.js';

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
        
        // コンポーネントの初期化
        this.parser = new APIDocParser();
        this.documentationGenerator = new DocumentationGenerator();
        this.templateRenderer = new TemplateRenderer();
        this.validator = new APIDocValidator();
        
        // 変更追跡用
        this.changeHistory = [];
    }

    /**
     * メインの実行メソッド - コンポーネント統制
     */
    async generate() {
        try {
            console.log('🚀 API Documentation Generator を開始します...');
            
            // 出力ディレクトリの準備
            await this.prepareOutputDirectory();
            
            // ソースファイルの収集と解析
            const sourceFiles = await this.collectSourceFiles();
            console.log(`📁 ${sourceFiles.length} 個のソースファイルを発見しました`);
            
            // APIDocParser による解析実行
            const analysisResults = [];
            for (const filePath of sourceFiles) {
                const result = await this.parser.analyzeFile(filePath, this.sourceDir);
                if (result && (result.classes.length > 0 || result.functions.length > 0)) {
                    analysisResults.push(result);
                }
            }
            
            console.log(`📊 ${analysisResults.length} 個のファイルを解析しました`);
            
            // DocumentationGenerator による文書生成
            await this.documentationGenerator.generateDocumentation(analysisResults, this.outputDir);
            
            // TemplateRenderer による補助ファイル生成
            await this.templateRenderer.generateIndex(analysisResults, this.outputDir, this.version);
            await this.templateRenderer.generateSearchIndex(analysisResults, this.outputDir);
            await this.templateRenderer.generateExamplesGuide(analysisResults, this.outputDir);
            
            // APIDocValidator による検証・品質チェック
            const validationReport = await this.validator.validateDocumentation(analysisResults, this.outputDir);
            await this.validator.generateCrossReferences(analysisResults, this.outputDir);
            
            // 変更履歴の更新
            await this.updateChangeHistory(analysisResults, validationReport);
            
            console.log('✅ API Documentation Generator が完了しました！');
            console.log(`📁 ドキュメントは ${this.outputDir} に生成されました`);
            console.log(`📊 検証結果: ${validationReport.summary.documentationRate}% ドキュメント化済み`);
            
        } catch (error) {
            console.error('❌ API Documentation Generator でエラーが発生しました:', error);
            throw error;
        } finally {
            // リソースクリーンアップ
            this.cleanup();
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
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    await this.walkDirectory(fullPath, files);
                } else if (entry.isFile()) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.warn(`⚠️  ディレクトリ読み込みエラー: ${dir}`, error.message);
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
     * 変更履歴の更新
     */
    async updateChangeHistory(analysisResults, validationReport) {
        const historyEntry = {
            timestamp: this.lastGenerated,
            version: this.version,
            filesAnalyzed: analysisResults.length,
            totalClasses: analysisResults.reduce((sum, result) => sum + result.classes.length, 0),
            totalFunctions: analysisResults.reduce((sum, result) => sum + result.functions.length, 0),
            documentationRate: validationReport.summary.documentationRate,
            issues: {
                missingDocumentation: validationReport.summary.issues.missingDocumentation,
                brokenLinks: validationReport.summary.issues.brokenLinks,
                inconsistencies: validationReport.summary.issues.inconsistencies
            }
        };
        
        this.changeHistory.unshift(historyEntry);
        
        // 履歴は最新20件まで保持
        if (this.changeHistory.length > 20) {
            this.changeHistory = this.changeHistory.slice(0, 20);
        }
        
        // 変更履歴をファイルに保存
        const historyPath = path.join(this.outputDir, 'change-history.json');
        await fs.writeFile(historyPath, JSON.stringify(this.changeHistory, null, 2), 'utf-8');
        console.log('📝 変更履歴を更新しました');
    }

    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️  設定を更新しました:', newConfig);
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.parser?.cleanup?.();
        this.documentationGenerator?.clearCrossReferenceMap?.();
        this.templateRenderer?.cleanup?.();
        this.validator?.cleanup?.();
        console.log('🧹 リソースクリーンアップ完了');
    }

    /**
     * CLI実行用の静的メソッド
     */
    static async run(options = {}) {
        const generator = new APIDocumentationGenerator();
        
        // オプションによる設定更新
        if (options.config) {
            generator.updateConfig(options.config);
        }
        
        if (options.sourceDir) {
            generator.sourceDir = options.sourceDir;
        }
        
        if (options.outputDir) {
            generator.outputDir = options.outputDir;
        }
        
        if (options.version) {
            generator.version = options.version;
        }
        
        await generator.generate();
        return generator;
    }
}

// CLI実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const options = {};
    
    // コマンドライン引数の解析
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--source' && i + 1 < args.length) {
            options.sourceDir = args[i + 1];
            i++;
        } else if (arg === '--output' && i + 1 < args.length) {
            options.outputDir = args[i + 1];
            i++;
        } else if (arg === '--version' && i + 1 < args.length) {
            options.version = args[i + 1];
            i++;
        } else if (arg === '--help') {
            console.log(`
API Documentation Generator

使用方法:
  node api-doc-generator.js [オプション]

オプション:
  --source <dir>    ソースディレクトリ (デフォルト: src)
  --output <dir>    出力ディレクトリ (デフォルト: docs/api-reference)
  --version <ver>   バージョン情報 (デフォルト: 1.0.0)
  --help           このヘルプを表示

例:
  node api-doc-generator.js
  node api-doc-generator.js --source ./lib --output ./docs/api
  node api-doc-generator.js --version 2.0.0
            `);
            process.exit(0);
        }
    }
    
    try {
        await APIDocumentationGenerator.run(options);
        console.log('🎉 API Documentation Generator が正常に完了しました');
        process.exit(0);
    } catch (error) {
        console.error('💥 実行中にエラーが発生しました:', error);
        process.exit(1);
    }
}

export { APIDocumentationGenerator };
export default APIDocumentationGenerator;