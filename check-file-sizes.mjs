#!/usr/bin/env node

/**
 * ファイルサイズコンプライアンス検証
 * 2,500語制限を超えるJavaScriptファイルを検出
 */

import { readdir, stat } from 'fs/promises';
import { readFile } from 'fs/promises';
import { join } from 'path';

const WORD_LIMIT = 2500;
const TARGET_EXTENSIONS = ['.js'];
const EXCLUDE_PATTERNS = [
    'node_modules',
    '.git',
    'test-integration.mjs',
    'check-file-sizes.mjs',
    '.backup',
    'docs',      // ドキュメント全体を除外
    'CLAUDE.md'  // プロジェクト情報ファイルを除外
];

async function countWords(filePath) {
    try {
        const content = await readFile(filePath, 'utf-8');
        // 単語数をカウント（空白で区切られた文字列の数）
        const words = content.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return 0;
    }
}

async function scanDirectory(dirPath, results = []) {
    try {
        const entries = await readdir(dirPath);
        
        for (const entry of entries) {
            const fullPath = join(dirPath, entry);
            
            // 除外パターンチェック
            if (EXCLUDE_PATTERNS.some(pattern => fullPath.includes(pattern))) {
                continue;
            }
            
            const stats = await stat(fullPath);
            
            if (stats.isDirectory()) {
                await scanDirectory(fullPath, results);
            } else if (TARGET_EXTENSIONS.some(ext => entry.endsWith(ext))) {
                const wordCount = await countWords(fullPath);
                results.push({
                    path: fullPath,
                    filename: entry,
                    wordCount: wordCount,
                    isOverLimit: wordCount > WORD_LIMIT
                });
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
    
    return results;
}

async function main() {
    console.log('=== File Size Compliance Check ===');
    console.log(`Word limit: ${WORD_LIMIT} words per file`);
    console.log('Scanning JavaScript files...\n');
    
    const results = await scanDirectory('./src');
    
    // 結果を分類
    const overLimitFiles = results.filter(file => file.isOverLimit);
    const largeFiles = results.filter(file => !file.isOverLimit && file.wordCount > 2000);
    const splitFiles = [
        'src/utils/PerformanceOptimizer.js',
        'src/core/ComparisonEngine.js'
    ];
    
    // 分割済みファイルの結果表示
    console.log('=== Split Files (Main Achievement) ===');
    const splitResults = results.filter(file => 
        splitFiles.some(splitFile => file.path.includes(splitFile))
    );
    
    for (const file of splitResults) {
        const relativePath = file.path.replace(process.cwd() + '/', '');
        console.log(`✓ ${relativePath}: ${file.wordCount} words`);
    }
    
    // 制限超過ファイル
    if (overLimitFiles.length > 0) {
        console.log('\n❌ FILES OVER LIMIT:');
        for (const file of overLimitFiles) {
            const relativePath = file.path.replace(process.cwd() + '/', '');
            console.log(`  ${relativePath}: ${file.wordCount} words (${file.wordCount - WORD_LIMIT} over limit)`);
        }
    } else {
        console.log('\n✅ All files are within the word limit!');
    }
    
    // 大きなファイル（警告レベル）
    if (largeFiles.length > 0) {
        console.log('\n⚠️  LARGE FILES (approaching limit):');
        for (const file of largeFiles) {
            const relativePath = file.path.replace(process.cwd() + '/', '');
            console.log(`  ${relativePath}: ${file.wordCount} words`);
        }
    }
    
    // 統計サマリー
    console.log('\n=== Summary ===');
    console.log(`Total JavaScript files scanned: ${results.length}`);
    console.log(`Files over limit: ${overLimitFiles.length}`);
    console.log(`Files approaching limit (2000+ words): ${largeFiles.length}`);
    
    const avgWordCount = Math.round(results.reduce((sum, file) => sum + file.wordCount, 0) / results.length);
    console.log(`Average file size: ${avgWordCount} words`);
    
    // 最大ファイル
    const maxFile = results.reduce((max, file) => file.wordCount > max.wordCount ? file : max, results[0]);
    if (maxFile) {
        const relativePath = maxFile.path.replace(process.cwd() + '/', '');
        console.log(`Largest file: ${relativePath} (${maxFile.wordCount} words)`);
    }
    
    // 成功/失敗の判定
    if (overLimitFiles.length === 0) {
        console.log('\n🎉 COMPLIANCE CHECK PASSED! All files are within the limit.');
        process.exit(0);
    } else {
        console.log('\n💥 COMPLIANCE CHECK FAILED! Some files exceed the limit.');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});