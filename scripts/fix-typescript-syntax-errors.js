#!/usr/bin/env node

/**
 * TypeScript構文エラーを修正するスクリプト
 * 主に以下のパターンを修正：
 * 1. 文字列の後の余分な引用符
 * 2. 関数呼び出しの括弧の不一致
 * 3. オブジェクトリテラルの構文エラー
 * 4. セミコロンとカンマの混在
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 修正パターン
const fixPatterns = [
    // パターン1: 文字列の後の余分な引用符を削除
    {
        pattern: /(['"`])\s*'\s*(?=[;,)\]}])/g,
        replacement: '$1'
    },
    // パターン2: return文の後の余分な引用符
    {
        pattern: /return\s+([^;]+)''\s*;/g,
        replacement: 'return $1;'
    },
    // パターン3: console.logの後の余分な引用符
    {
        pattern: /console\.(log|error|warn)\([^)]*\)'\s*;/g,
        replacement: 'console.$1$2);'
    },
    // パターン4: 関数呼び出しの括弧の後の余分な文字
    {
        pattern: /\)\s*'\s*''/g,
        replacement: ')'
    },
    // パターン5: オブジェクトプロパティの後の括弧修正
    {
        pattern: /,\s*\}\s*\)/g,
        replacement: '})'
    },
    // パターン6: 不正な文字列連結
    {
        pattern: /(['"`])\s*;''/g,
        replacement: '$1;'
    },
    // パターン7: 二重引用符の修正
    {
        pattern: /''\s*\)'/g,
        replacement: ')'
    },
    // パターン8: 関数パラメータの後の余分な括弧
    {
        pattern: /\{[^}]*\)\s*([,;])/g,
        replacement: function(match, ending) {
            // 括弧のバランスを確認
            const openCount = (match.match(/\(/g) || []).length;
            const closeCount = (match.match(/\)/g) || []).length;
            if (closeCount > openCount) {
                return match.replace(/\)(\s*[,;])$/, '$1');
            }
            return match;
        }
    }
];

// TypeScriptファイルを検索
function findTypeScriptFiles(dir) {
    return glob.sync(path.join(dir, '**/*.ts'), {
        ignore: ['node_modules/**', 'dist/**', 'build/**']
    });
}

// ファイルを修正
function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changeCount = 0;

        // 各パターンを適用
        fixPatterns.forEach(({ pattern, replacement }) => {
            const before = content;
            content = content.replace(pattern, replacement);
            if (before !== content) {
                changeCount++;
            }
        });

        // 特殊なケースの修正
        // 1. 配列やオブジェクトの後の余分な括弧
        content = content.replace(/\]\s*\)\s*'/g, '])');
        content = content.replace(/\}\s*\)\s*'/g, '})');
        
        // 2. 文字列の後の不正なセミコロンとカンマ
        content = content.replace(/(['"`])\s*;\s*,/g, '$1,');
        
        // 3. 関数呼び出しの修正
        content = content.replace(/\)\s*\)\s*;''/g, '));');

        // 変更があった場合のみファイルを更新
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath} (${changeCount} patterns applied)`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// メイン処理
function main() {
    const srcDir = path.join(__dirname, '..', 'src');
    const testDirs = [
        path.join(__dirname, '..', 'test'),
        path.join(__dirname, '..', 'tests')
    ];

    console.log('TypeScript構文エラー修正スクリプトを開始します...');

    // srcディレクトリの修正
    console.log('\nsrcディレクトリを処理中...');
    const srcFiles = findTypeScriptFiles(srcDir);
    let fixedCount = 0;

    srcFiles.forEach(file => {
        if (fixFile(file)) {
            fixedCount++;
        }
    });

    // testディレクトリの修正
    testDirs.forEach(testDir => {
        if (fs.existsSync(testDir)) {
            console.log(`\n${testDir}を処理中...`);
            const testFiles = findTypeScriptFiles(testDir);
            testFiles.forEach(file => {
                if (fixFile(file)) {
                    fixedCount++;
                }
            });
        }
    });

    console.log(`\n完了: ${fixedCount}個のファイルを修正しました。`);
}

// スクリプト実行
if (require.main === module) {
    main();
}

module.exports = { fixFile, fixPatterns };