#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Test Path Resolver - Phase G対応後のテストファイルのインポートパス解析・修正ツール
 */
export class TestPathResolver {
    constructor() {
        this.brokenPaths = [];
        this.corrections = new Map();
        this.scannedFiles = [];
    }

    /**
     * テストディレクトリを再帰的にスキャンしてインポートパスを解析
     */
    async scanImportPaths(testDirectory = 'tests') {
        console.log(`🔍 Scanning import paths in ${testDirectory}...`);
        
        const fullTestPath = path.resolve(projectRoot, testDirectory);
        await this._scanDirectory(fullTestPath);
        
        console.log(`📊 Scanned ${this.scannedFiles.length} test files`);
        console.log(`🚨 Found ${this.brokenPaths.length} broken import paths`);
        
        return {
            scannedFiles: this.scannedFiles,
            brokenPaths: this.brokenPaths,
            corrections: Array.from(this.corrections.entries())
        };
    }

    /**
     * ディレクトリを再帰的にスキャン
     */
    async _scanDirectory(dirPath) {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    await this._scanDirectory(fullPath);
                } else if (entry.isFile() && this._isTestFile(entry.name)) {
                    await this._analyzeFile(fullPath);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
        }
    }

    /**
     * ファイルがテストファイルかどうか判定
     */
    _isTestFile(filename) {
        return filename.endsWith('.test.js') || 
               filename.endsWith('.spec.js') || 
               filename.includes('test') || 
               filename.includes('spec');
    }

    /**
     * ファイルのインポート文を解析
     */
    async _analyzeFile(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const relativePath = path.relative(projectRoot, filePath);
            
            this.scannedFiles.push(relativePath);
            
            // インポート文を抽出（ES Modules と CommonJS 両対応）
            const importRegex = /(?:import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]|require\(['"`]([^'"`]+)['"`]\))/g;
            let match;
            
            while ((match = importRegex.exec(content)) !== null) {
                const importPath = match[1] || match[2];
                if (this._isRelativeImport(importPath)) {
                    await this._validateImportPath(filePath, importPath, relativePath);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Could not analyze file ${filePath}: ${error.message}`);
        }
    }

    /**
     * 相対インポートかどうか判定
     */
    _isRelativeImport(importPath) {
        return importPath.startsWith('./') || importPath.startsWith('../');
    }

    /**
     * インポートパスの存在確認
     */
    async _validateImportPath(sourceFile, importPath, sourceRelativePath) {
        const sourceDir = path.dirname(sourceFile);
        let resolvedPath = path.resolve(sourceDir, importPath);
        
        // .js拡張子がない場合は追加して試行
        const extensions = ['', '.js', '.mjs', '.json'];
        let exists = false;
        let correctPath = null;
        
        for (const ext of extensions) {
            const testPath = resolvedPath + ext;
            try {
                await fs.promises.access(testPath);
                exists = true;
                correctPath = testPath;
                break;
            } catch (error) {
                // ファイルが存在しない場合は次の拡張子を試行
            }
        }
        
        if (!exists) {
            // 一般的なPhase Gでの移動パターンをチェック
            const correctedPath = await this._suggestCorrection(sourceFile, importPath);
            
            this.brokenPaths.push({
                sourceFile: sourceRelativePath,
                importPath,
                resolvedPath: path.relative(projectRoot, resolvedPath),
                suggestedCorrection: correctedPath
            });
            
            if (correctedPath) {
                this.corrections.set(`${sourceRelativePath}:${importPath}`, correctedPath);
            }
        }
    }

    /**
     * Phase Gの一般的な移動パターンに基づいて修正候補を提案
     */
    async _suggestCorrection(sourceFile, importPath) {
        const commonMappings = [
            // ErrorHandler関連
            {
                pattern: /ErrorHandler/,
                from: /\.\.\/src\/utils\/ErrorHandler/,
                to: '../../src/utils/ErrorHandler'
            },
            {
                pattern: /ErrorHandler/,
                from: /\.\.\/\.\.\/utils\/ErrorHandler/,
                to: '../../src/utils/ErrorHandler'
            },
            
            // PerformanceOptimizer関連
            {
                pattern: /PerformanceOptimizer/,
                from: /\.\.\/src\/utils\/PerformanceOptimizer/,
                to: '../../src/utils/PerformanceOptimizer'
            },
            
            // MockFactory関連
            {
                pattern: /MockFactory/,
                from: /\.\.\/utils\/MockFactory/,
                to: '../mocks/MockFactory'
            },
            
            // EnhancedParticleManager関連
            {
                pattern: /EnhancedParticleManager/,
                from: /\.\.\/src\/effects\/EnhancedParticleManager/,
                to: '../../src/effects/EnhancedParticleManager'
            },
            
            // EnhancedEffectManager関連
            {
                pattern: /EnhancedEffectManager/,
                from: /\.\.\/src\/effects\/EnhancedEffectManager/,
                to: '../../src/effects/EnhancedEffectManager'
            }
        ];

        for (const mapping of commonMappings) {
            if (mapping.pattern.test(importPath) && mapping.from.test(importPath)) {
                const correctedPath = importPath.replace(mapping.from, mapping.to);
                
                // 修正後のパスが存在するかチェック
                const sourceDir = path.dirname(sourceFile);
                const resolvedCorrectedPath = path.resolve(sourceDir, correctedPath);
                
                try {
                    await fs.promises.access(resolvedCorrectedPath + '.js');
                    return correctedPath;
                } catch (error) {
                    // 修正候補が存在しない場合は次のマッピングを試行
                }
            }
        }

        // 一般的なファイル検索を試行
        return await this._searchForFile(importPath);
    }

    /**
     * ファイル名からプロジェクト内での位置を検索
     */
    async _searchForFile(importPath) {
        const filename = path.basename(importPath).replace(/\.(js|mjs)$/, '') + '.js';
        const searchDirs = ['src', 'tests'];
        
        for (const searchDir of searchDirs) {
            const found = await this._findFileRecursive(path.resolve(projectRoot, searchDir), filename);
            if (found) {
                // 相対パスに変換（暫定的な実装）
                return found;
            }
        }
        
        return null;
    }

    /**
     * ファイルを再帰的に検索
     */
    async _findFileRecursive(dir, filename) {
        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    const found = await this._findFileRecursive(fullPath, filename);
                    if (found) return found;
                } else if (entry.name === filename) {
                    return path.relative(projectRoot, fullPath);
                }
            }
        } catch (error) {
            // アクセスできないディレクトリはスキップ
        }
        
        return null;
    }

    /**
     * 分析結果レポートを生成
     */
    generateReport() {
        console.log('\n📋 Import Path Analysis Report');
        console.log('================================');
        
        if (this.brokenPaths.length === 0) {
            console.log('✅ No broken import paths found!');
            return;
        }
        
        console.log(`\n🚨 Found ${this.brokenPaths.length} broken import paths:\n`);
        
        this.brokenPaths.forEach((broken, index) => {
            console.log(`${index + 1}. File: ${broken.sourceFile}`);
            console.log(`   Import: ${broken.importPath}`);
            console.log(`   Resolved: ${broken.resolvedPath}`);
            
            if (broken.suggestedCorrection) {
                console.log(`   Suggested: ${broken.suggestedCorrection}`);
            } else {
                console.log(`   Suggested: No automatic correction available`);
            }
            console.log('');
        });
        
        if (this.corrections.size > 0) {
            console.log('\n🔧 Suggested corrections:');
            for (const [key, value] of this.corrections) {
                console.log(`   ${key} → ${value}`);
            }
        }
    }

    /**
     * 修正結果をJSONファイルに保存
     */
    async saveResults(outputPath = 'path-analysis-results.json') {
        const results = {
            timestamp: new Date().toISOString(),
            scannedFiles: this.scannedFiles.length,
            brokenPathsCount: this.brokenPaths.length,
            brokenPaths: this.brokenPaths,
            corrections: Array.from(this.corrections.entries())
        };
        
        await fs.promises.writeFile(
            path.resolve(projectRoot, outputPath), 
            JSON.stringify(results, null, 2)
        );
        
        console.log(`💾 Results saved to ${outputPath}`);
    }
}

// CLIとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    const resolver = new TestPathResolver();
    
    try {
        await resolver.scanImportPaths();
        resolver.generateReport();
        await resolver.saveResults();
        
        process.exit(resolver.brokenPaths.length > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ Error during path analysis:', error);
        process.exit(1);
    }
}