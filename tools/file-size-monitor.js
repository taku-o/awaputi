#!/usr/bin/env node
/**
 * ファイルサイズ監視システム
 * MCPトークン制限問題対応用ファイルサイズチェックツール
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CONFIG = {
    WORD_LIMIT: 2500,
    TOKEN_LIMIT: 20000,
    EXCLUDED_PATTERNS: [
        'node_modules/**',
        'dist/**',
        '**/*.log',
        'test-results/**',
        'playwright-report/**',
        '.git/**',
        'coverage/**',
        'docs/**',           // ドキュメント全体を除外
        'CLAUDE.md',         // プロジェクト情報ファイルを除外
        '.kiro/**'           // 仕様・タスクファイルを除外
    ],
    TARGET_EXTENSIONS: ['.js', '.md'],
    WARNING_THRESHOLD: 2000, // 警告閾値
    ERROR_THRESHOLD: 2500    // エラー閾値
};

class FileSizeMonitor {
    constructor() {
        this.results = [];
        this.warnings = [];
        this.errors = [];
    }

    /**
     * ファイルのワード数をカウントする
     */
    countWords(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // 改行、空白、タブで分割してワード数をカウント
            const words = content.trim().split(/\s+/).filter(word => word.length > 0);
            return words.length;
        } catch (error) {
            console.error(`ファイル読み込みエラー: ${filePath}`, error.message);
            return 0;
        }
    }

    /**
     * ディレクトリを再帰的にスキャンする
     */
    scanDirectory(dir, basePath = '') {
        const files = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.join(basePath, item);

            // 除外パターンをチェック
            if (this.isExcluded(relativePath)) {
                continue;
            }

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.scanDirectory(fullPath, relativePath));
            } else if (this.isTargetFile(item)) {
                files.push({
                    path: fullPath,
                    relativePath: relativePath,
                    name: item
                });
            }
        }

        return files;
    }

    /**
     * ファイルが除外パターンに該当するかチェック
     */
    isExcluded(filePath) {
        return CONFIG.EXCLUDED_PATTERNS.some(pattern => {
            // 簡単なglobパターンマッチング
            const regex = pattern
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*')
                .replace(/\?/g, '[^/]');
            return new RegExp(regex).test(filePath);
        });
    }

    /**
     * 対象ファイルかチェック
     */
    isTargetFile(fileName) {
        return CONFIG.TARGET_EXTENSIONS.some(ext => fileName.endsWith(ext));
    }

    /**
     * ファイルサイズチェックを実行
     */
    checkFileSize(filePath, relativePath, fileName) {
        const wordCount = this.countWords(filePath);
        const status = this.getStatus(wordCount);

        const result = {
            filePath,
            relativePath,
            fileName,
            wordCount,
            limit: CONFIG.WORD_LIMIT,
            status,
            lastChecked: new Date(),
            suggestions: this.generateSuggestions(wordCount, fileName)
        };

        if (status === 'warning') {
            this.warnings.push(result);
        } else if (status === 'error') {
            this.errors.push(result);
        }

        return result;
    }

    /**
     * ワード数からステータスを判定
     */
    getStatus(wordCount) {
        if (wordCount >= CONFIG.ERROR_THRESHOLD) {
            return 'error';
        } else if (wordCount >= CONFIG.WARNING_THRESHOLD) {
            return 'warning';
        }
        return 'ok';
    }

    /**
     * 改善提案を生成
     */
    generateSuggestions(wordCount, fileName) {
        const suggestions = [];

        if (wordCount >= CONFIG.ERROR_THRESHOLD) {
            suggestions.push('緊急: ファイルを複数のモジュールに分割してください');
            suggestions.push('単一責任の原則に従ってクラス/機能を分離してください');
        } else if (wordCount >= CONFIG.WARNING_THRESHOLD) {
            suggestions.push('警告: ファイルサイズが大きくなっています');
            suggestions.push('リファクタリングを検討してください');
        }

        // ファイルタイプ別の提案
        if (fileName.endsWith('.js')) {
            if (fileName.includes('Scene')) {
                suggestions.push('UIコンポーネントを別ファイルに分離してください');
            }
            if (fileName.includes('Manager')) {
                suggestions.push('機能別にサブマネージャーを作成してください');
            }
        } else if (fileName === 'CLAUDE.md') {
            suggestions.push('プロジェクト情報を別のドキュメントファイルに分割してください');
        }

        return suggestions;
    }

    /**
     * 全ファイルをチェックする
     */
    checkAllFiles(rootDir) {
        console.log('ファイルサイズ監視を開始します...\n');

        const files = this.scanDirectory(rootDir);
        console.log(`対象ファイル数: ${files.length}\n`);

        for (const file of files) {
            const result = this.checkFileSize(file.path, file.relativePath, file.name);
            this.results.push(result);
        }

        this.results.sort((a, b) => b.wordCount - a.wordCount);
    }

    /**
     * レポートを生成する
     */
    generateReport() {
        console.log('='.repeat(60));
        console.log('📊 ファイルサイズ監視レポート');
        console.log('='.repeat(60));
        console.log(`チェック日時: ${new Date().toLocaleString('ja-JP')}\n`);

        // 概要統計
        console.log('📈 概要統計:');
        console.log(`  総ファイル数: ${this.results.length}`);
        console.log(`  警告ファイル数: ${this.warnings.length}`);
        console.log(`  エラーファイル数: ${this.errors.length}`);
        console.log(`  平均ワード数: ${Math.round(this.results.reduce((sum, r) => sum + r.wordCount, 0) / this.results.length)}\n`);

        // エラーファイル（制限超過）
        if (this.errors.length > 0) {
            console.log('🚨 制限超過ファイル（緊急分割必要）:');
            console.log('-'.repeat(60));
            this.errors.forEach((result, index) => {
                console.log(`${index + 1}. ${result.relativePath}`);
                console.log(`   ワード数: ${result.wordCount} (制限: ${result.limit})`);
                console.log(`   超過: ${result.wordCount - result.limit} ワード`);
                result.suggestions.forEach(suggestion => {
                    console.log(`   💡 ${suggestion}`);
                });
                console.log('');
            });
        }

        // 警告ファイル
        if (this.warnings.length > 0) {
            console.log('⚠️  警告ファイル（要監視）:');
            console.log('-'.repeat(60));
            this.warnings.forEach((result, index) => {
                console.log(`${index + 1}. ${result.relativePath}`);
                console.log(`   ワード数: ${result.wordCount} (警告閾値: ${CONFIG.WARNING_THRESHOLD})`);
                result.suggestions.forEach(suggestion => {
                    console.log(`   💡 ${suggestion}`);
                });
                console.log('');
            });
        }

        // TOP10 大きなファイル
        console.log('📏 TOP10 大きなファイル:');
        console.log('-'.repeat(60));
        const top10 = this.results.slice(0, 10);
        top10.forEach((result, index) => {
            const statusIcon = result.status === 'error' ? '🚨' :
                result.status === 'warning' ? '⚠️' : '✅';
            console.log(`${index + 1}. ${statusIcon} ${result.relativePath}`);
            console.log(`   ワード数: ${result.wordCount}`);
        });

        console.log('\n' + '='.repeat(60));

        return {
            totalFiles: this.results.length,
            warnings: this.warnings.length,
            errors: this.errors.length,
            results: this.results
        };
    }

    /**
     * JSONレポートを出力する
     */
    exportReport(outputPath) {
        const report = {
            timestamp: new Date().toISOString(),
            config: CONFIG,
            summary: {
                totalFiles: this.results.length,
                warningFiles: this.warnings.length,
                errorFiles: this.errors.length,
                averageWordCount: Math.round(this.results.reduce((sum, r) => sum + r.wordCount, 0) / this.results.length)
            },
            results: this.results,
            warnings: this.warnings,
            errors: this.errors
        };

        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 詳細レポートを出力しました: ${outputPath}`);
    }
}

// メイン実行部分
if (import.meta.url === `file://${process.argv[1]}`) {
    const monitor = new FileSizeMonitor();
    const rootDir = process.argv[2] || process.cwd();

    monitor.checkAllFiles(rootDir);
    const summary = monitor.generateReport();

    // JSONレポート出力
    const reportPath = path.join(rootDir, 'file-size-report.json');
    monitor.exportReport(reportPath);

    // 制限超過ファイルがある場合は終了コード1で終了
    if (summary.errors > 0) {
        console.log('\n❌ 制限超過ファイルが検出されました。');
        process.exit(1);
    } else if (summary.warnings > 0) {
        console.log('\n⚠️  警告ファイルが検出されました。監視を継続してください。');
        process.exit(0);
    } else {
        console.log('\n✅ すべてのファイルが制限内です。');
        process.exit(0);
    }
}

export default FileSizeMonitor;