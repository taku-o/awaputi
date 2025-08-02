#!/usr/bin/env node

/**
 * ファイルサイズ監視スクリプト
 * MCPトークン制限問題対応 - 2,500語を超えるファイルを検出
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 設定
const CONFIG = {
    wordLimit: 2500,
    warningLimit: 2000,
    excludePatterns: [
        'node_modules',
        'dist',
        'coverage',
        'test-results',
        'playwright-report',
        '.git',
        '.cache',
        'tmp',
        'temp'
    ],
    includeExtensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json', '.md'],
    ignoreFiles: [
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        '.min.js',
        '.min.css'
    ]
};

/**
 * ファイルの語数をカウント
 */
function countWords(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const words = content.split(/\s+/).filter(word => word.length > 0);
        return words.length;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return 0;
    }
}

/**
 * ディレクトリを再帰的にスキャン
 */
function scanDirectory(dirPath, results = []) {
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(projectRoot, fullPath);
            
            // 除外パターンチェック
            if (CONFIG.excludePatterns.some(pattern => relativePath.includes(pattern))) {
                continue;
            }
            
            if (entry.isDirectory()) {
                scanDirectory(fullPath, results);
            } else if (entry.isFile()) {
                // 拡張子チェック
                const ext = path.extname(entry.name);
                if (!CONFIG.includeExtensions.includes(ext)) {
                    continue;
                }
                
                // 無視ファイルチェック
                if (CONFIG.ignoreFiles.some(ignore => entry.name.includes(ignore))) {
                    continue;
                }
                
                const wordCount = countWords(fullPath);
                results.push({
                    path: relativePath,
                    fullPath: fullPath,
                    wordCount: wordCount,
                    status: wordCount > CONFIG.wordLimit ? 'error' : 
                           wordCount > CONFIG.warningLimit ? 'warning' : 'ok'
                });
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
    
    return results;
}

/**
 * レポート生成
 */
function generateReport(results) {
    const errorFiles = results.filter(r => r.status === 'error');
    const warningFiles = results.filter(r => r.status === 'warning');
    const okFiles = results.filter(r => r.status === 'ok');
    
    console.log('\n📊 ファイルサイズ監視レポート');
    console.log('==========================================');
    console.log(`スキャンファイル数: ${results.length}`);
    console.log(`制限超過ファイル: ${errorFiles.length} (> ${CONFIG.wordLimit}語)`);
    console.log(`警告ファイル: ${warningFiles.length} (> ${CONFIG.warningLimit}語)`);
    console.log(`正常ファイル: ${okFiles.length} (<= ${CONFIG.warningLimit}語)`);
    
    if (errorFiles.length > 0) {
        console.log('\n🚨 制限超過ファイル (要分割):');
        console.log('------------------------------------------');
        errorFiles
            .sort((a, b) => b.wordCount - a.wordCount)
            .forEach(file => {
                console.log(`❌ ${file.path} (${file.wordCount}語)`);
            });
    }
    
    if (warningFiles.length > 0) {
        console.log('\n⚠️  警告ファイル (注意が必要):');
        console.log('------------------------------------------');
        warningFiles
            .sort((a, b) => b.wordCount - a.wordCount)
            .forEach(file => {
                console.log(`⚠️  ${file.path} (${file.wordCount}語)`);
            });
    }
    
    console.log('\n📈 統計情報:');
    console.log('------------------------------------------');
    const totalWords = results.reduce((sum, r) => sum + r.wordCount, 0);
    const averageWords = Math.round(totalWords / results.length);
    const maxWords = Math.max(...results.map(r => r.wordCount));
    
    console.log(`総語数: ${totalWords.toLocaleString()}`);
    console.log(`平均語数: ${averageWords}`);
    console.log(`最大語数: ${maxWords}`);
    
    // JSON形式でレポート保存
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            errors: errorFiles.length,
            warnings: warningFiles.length,
            ok: okFiles.length,
            totalWords,
            averageWords,
            maxWords
        },
        files: {
            errors: errorFiles,
            warnings: warningFiles
        },
        config: CONFIG
    };
    
    const reportPath = path.join(projectRoot, 'file-size-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 詳細レポート: ${reportPath}`);
    
    return {
        hasErrors: errorFiles.length > 0,
        hasWarnings: warningFiles.length > 0,
        errorFiles,
        warningFiles
    };
}

/**
 * メイン実行
 */
function main() {
    console.log('🔍 ファイルサイズスキャンを開始...');
    
    const results = scanDirectory(projectRoot);
    const report = generateReport(results);
    
    // 終了コード
    if (report.hasErrors) {
        console.log('\n💥 制限超過ファイルが検出されました。分割が必要です。');
        process.exit(1);
    } else if (report.hasWarnings) {
        console.log('\n✅ 制限超過ファイルはありませんが、警告ファイルがあります。');
        process.exit(0);
    } else {
        console.log('\n🎉 すべてのファイルが制限内です！');
        process.exit(0);
    }
}

// CLIから実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { scanDirectory, countWords, generateReport, CONFIG };