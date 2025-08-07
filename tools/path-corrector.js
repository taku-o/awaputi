#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Path Corrector - インポートパスの自動修正ツール
 */
export class PathCorrector {
    constructor() {
        this.corrections = 0;
        this.backups = [];
        this.errors = [];
        
        // Phase G後の標準的なパス修正マッピング
        this.pathMappings = this._initializePathMappings();
    }

    /**
     * パス修正マッピングを初期化
     */
    _initializePathMappings() {
        return [
            // Achievement系の移動
            {
                pattern: /AchievementNotificationSystem/,
                from: /\.\.\/\.\.\/src\/core\/AchievementNotificationSystem\.js/,
                to: '../../src/core/achievements/AchievementNotificationSystem.js',
                description: 'AchievementNotificationSystem moved to achievements subdirectory'
            },
            
            // Debug系ファイルの移動
            {
                pattern: /TestResultVisualizer/,
                from: /\.\.\/\.\.\/src\/utils\/TestResultVisualizer\.js/,
                to: '../../src/debug/TestResultVisualizer.js',
                description: 'TestResultVisualizer moved from utils to debug'
            },
            {
                pattern: /ErrorReporter/,
                from: /\.\.\/\.\.\/src\/utils\/ErrorReporter\.js/,
                to: '../../src/debug/ErrorReporter.js',
                description: 'ErrorReporter moved from utils to debug'
            },
            
            // Audio系の構造化
            {
                pattern: /AudioDescriptionManager/,
                from: /\.\/AudioDescriptionManager\.js/,
                to: '../../src/audio/accessibility/AudioDescriptionManager.js',
                description: 'AudioDescriptionManager moved to audio/accessibility'
            },
            {
                pattern: /AudioCueManager/,
                from: /\.\/AudioCueManager\.js/,
                to: '../../src/audio/accessibility/AudioCueManager.js',
                description: 'AudioCueManager moved to audio/accessibility'
            },
            {
                pattern: /AudioFeedbackManager/,
                from: /\.\/AudioFeedbackManager\.js/,
                to: '../../src/audio/accessibility/AudioFeedbackManager.js',
                description: 'AudioFeedbackManager moved to audio/accessibility'
            },
            {
                pattern: /AudioSettingsManager/,
                from: /\.\/AudioSettingsManager\.js/,
                to: '../../src/audio/accessibility/AudioSettingsManager.js',
                description: 'AudioSettingsManager moved to audio/accessibility'
            },
            
            // Visual Manager系の統合
            {
                pattern: /VisualFocusManager/,
                from: /\.\.\/\.\.\/src\/core\/visual\/focus\/VisualFocusManager\.js/,
                to: '../../src/core/VisualFocusManager.js',
                description: 'VisualFocusManager moved back to core (Phase G consolidation)'
            },
            {
                pattern: /VisualFeedbackManager/,
                from: /\.\.\/\.\.\/src\/core\/visual\/feedback\/VisualFeedbackManager\.js/,
                to: '../../src/core/VisualFeedbackManager.js',
                description: 'VisualFeedbackManager moved back to core (Phase G consolidation)'
            },
            
            // Help系の正しいパス
            {
                pattern: /HelpScene/,
                from: /\.\.\/\.\.\/\.\.\/src\/scenes\/HelpScene\.js/,
                to: '../../../src/scenes/HelpScene.js',
                description: 'HelpScene path correction for deeper nesting'
            },
            {
                pattern: /TutorialOverlay/,
                from: /\.\.\/\.\.\/\.\.\/src\/core\/help\/TutorialOverlay\.js/,
                to: '../../../src/core/help/TutorialOverlay.js',
                description: 'TutorialOverlay path correction for deeper nesting'
            },
            {
                pattern: /TooltipSystem/,
                from: /\.\.\/\.\.\/\.\.\/src\/core\/help\/TooltipSystem\.js/,
                to: '../../../src/core/help/TooltipSystem.js',
                description: 'TooltipSystem path correction for deeper nesting'
            },
            
            // Balance系のコンポーネント (tools/balance/以下)
            {
                pattern: /BalanceCalculator/,
                from: /\.\/BalanceCalculator\.js/,
                to: '../../../tools/balance/BalanceCalculator.js',
                description: 'BalanceCalculator moved to tools/balance'
            }
        ];
    }

    /**
     * 解析結果ファイルから修正を実行
     */
    async correctPathsFromAnalysis(analysisFile = 'path-analysis-results.json') {
        console.log('🔧 Starting path correction from analysis results...');
        
        const analysisPath = path.resolve(projectRoot, analysisFile);
        
        try {
            const analysisContent = await fs.promises.readFile(analysisPath, 'utf-8');
            const analysis = JSON.parse(analysisContent);
            
            console.log(`📊 Found ${analysis.brokenPaths.length} broken paths to fix`);
            
            for (const brokenPath of analysis.brokenPaths) {
                await this._correctSinglePath(brokenPath);
            }
            
            return this._generateReport();
            
        } catch (error) {
            console.error(`❌ Error reading analysis file: ${error.message}`);
            throw error;
        }
    }

    /**
     * 個別のパス修正を実行
     */
    async _correctSinglePath(brokenPath) {
        const { sourceFile, importPath, suggestedCorrection } = brokenPath;
        const fullSourcePath = path.resolve(projectRoot, sourceFile);
        
        try {
            // バックアップの作成
            await this._createBackup(fullSourcePath);
            
            // ファイル内容を読み込み
            let content = await fs.promises.readFile(fullSourcePath, 'utf-8');
            const originalContent = content;
            
            // マッピングによる修正を試行
            let correctionApplied = false;
            for (const mapping of this.pathMappings) {
                if (mapping.pattern.test(importPath) && mapping.from.test(importPath)) {
                    const newImportPath = importPath.replace(mapping.from, mapping.to);
                    
                    // 実際にファイルが存在するかチェック
                    const sourceDir = path.dirname(fullSourcePath);
                    const targetPath = path.resolve(sourceDir, newImportPath);
                    
                    if (await this._fileExists(targetPath)) {
                        content = this._replaceImportPath(content, importPath, newImportPath);
                        console.log(`✅ ${sourceFile}: ${importPath} → ${newImportPath}`);
                        console.log(`   ${mapping.description}`);
                        correctionApplied = true;
                        break;
                    }
                }
            }
            
            // マッピングで修正できない場合、提案された修正を試行
            if (!correctionApplied && suggestedCorrection) {
                const sourceDir = path.dirname(fullSourcePath);
                const targetPath = path.resolve(sourceDir, suggestedCorrection);
                
                if (await this._fileExists(targetPath)) {
                    content = this._replaceImportPath(content, importPath, suggestedCorrection);
                    console.log(`✅ ${sourceFile}: ${importPath} → ${suggestedCorrection}`);
                    correctionApplied = true;
                } else {
                    console.log(`⚠️  ${sourceFile}: Suggested correction ${suggestedCorrection} does not exist`);
                }
            }
            
            // 修正が適用された場合、ファイルを更新
            if (correctionApplied && content !== originalContent) {
                await fs.promises.writeFile(fullSourcePath, content, 'utf-8');
                this.corrections++;
            } else if (!correctionApplied) {
                console.log(`❌ ${sourceFile}: No valid correction found for ${importPath}`);
                this.errors.push({
                    file: sourceFile,
                    import: importPath,
                    reason: 'No valid correction mapping found'
                });
            }
            
        } catch (error) {
            console.error(`❌ Error correcting ${sourceFile}: ${error.message}`);
            this.errors.push({
                file: sourceFile,
                import: importPath,
                reason: error.message
            });
        }
    }

    /**
     * ファイルの存在確認（拡張子も考慮）
     */
    async _fileExists(filePath) {
        const extensions = ['', '.js', '.mjs', '.json'];
        
        for (const ext of extensions) {
            try {
                await fs.promises.access(filePath + ext);
                return true;
            } catch (error) {
                // 次の拡張子を試行
            }
        }
        return false;
    }

    /**
     * インポートパスをファイル内で置換
     */
    _replaceImportPath(content, oldPath, newPath) {
        // ES Modules import文の置換
        const importRegex = new RegExp(
            `(import\\s+.*?\\s+from\\s+['"\`])${this._escapeRegExp(oldPath)}(['"\`])`,
            'g'
        );
        
        // CommonJS require文の置換
        const requireRegex = new RegExp(
            `(require\\(['"\`])${this._escapeRegExp(oldPath)}(['"\`]\\))`,
            'g'
        );
        
        content = content.replace(importRegex, `$1${newPath}$2`);
        content = content.replace(requireRegex, `$1${newPath}$2`);
        
        return content;
    }

    /**
     * 正規表現のエスケープ
     */
    _escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&');
    }

    /**
     * ファイルのバックアップを作成
     */
    async _createBackup(filePath) {
        const backupPath = filePath + '.backup.' + Date.now();
        
        try {
            await fs.promises.copyFile(filePath, backupPath);
            this.backups.push({
                original: filePath,
                backup: backupPath
            });
        } catch (error) {
            console.warn(`⚠️  Could not create backup for ${filePath}: ${error.message}`);
        }
    }

    /**
     * 修正レポートを生成
     */
    _generateReport() {
        console.log('\\n📋 Path Correction Report');
        console.log('==========================');
        console.log(`✅ Successfully corrected: ${this.corrections} paths`);
        console.log(`🔄 Backups created: ${this.backups.length} files`);
        console.log(`❌ Errors encountered: ${this.errors.length} paths`);
        
        if (this.errors.length > 0) {
            console.log('\\n❌ Failed corrections:');
            this.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.file}: ${error.import}`);
                console.log(`   Reason: ${error.reason}`);
            });
        }
        
        if (this.backups.length > 0) {
            console.log('\\n💾 Backups created:');
            this.backups.forEach((backup, index) => {
                console.log(`${index + 1}. ${path.relative(projectRoot, backup.backup)}`);
            });
        }
        
        return {
            corrected: this.corrections,
            errors: this.errors.length,
            backups: this.backups.length
        };
    }

    /**
     * バックアップファイルをクリーンアップ
     */
    async cleanupBackups() {
        console.log('🧹 Cleaning up backup files...');
        
        for (const backup of this.backups) {
            try {
                await fs.promises.unlink(backup.backup);
                console.log(`🗑️  Removed backup: ${path.relative(projectRoot, backup.backup)}`);
            } catch (error) {
                console.warn(`⚠️  Could not remove backup ${backup.backup}: ${error.message}`);
            }
        }
    }

    /**
     * 修正を元に戻す
     */
    async restoreBackups() {
        console.log('⏮️  Restoring from backups...');
        
        for (const backup of this.backups) {
            try {
                await fs.promises.copyFile(backup.backup, backup.original);
                console.log(`↩️  Restored: ${path.relative(projectRoot, backup.original)}`);
            } catch (error) {
                console.error(`❌ Could not restore ${backup.original}: ${error.message}`);
            }
        }
    }
}

// CLIとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    const corrector = new PathCorrector();
    const command = process.argv[2] || 'correct';
    
    try {
        switch (command) {
            case 'correct':
                const result = await corrector.correctPathsFromAnalysis();
                process.exit(result.errors > 0 ? 1 : 0);
                break;
                
            case 'cleanup':
                await corrector.cleanupBackups();
                break;
                
            case 'restore':
                await corrector.restoreBackups();
                break;
                
            default:
                console.log('Usage: node path-corrector.js [correct|cleanup|restore]');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error during path correction:', error);
        process.exit(1);
    }
}