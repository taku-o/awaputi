#!/usr/bin/env node

/**
 * 大量のTypeScript構文エラーを修正するスクリプト
 * DataAggregationProcessor.tsで見つかったようなパターンを修正
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 主要な修正パターン
const fixPatterns = [
    // パターン1: 不正な文字列終端と関数呼び出し
    // 例: rawData.length === 0') { return this.createSuccessResponse([], {)'
    {
        pattern: /(\s*===\s*0)\s*'\s*\)\s*\{\s*return\s+([^(]+)\(([^,]+),\s*\{\s*\)'/g,
        replacement: '$1) {\n            return $2($3, {}'
    },
    // パターン2: オブジェクトプロパティの後の不正な括弧
    // 例: message: 'No data found for aggregation' ,}
    {
        pattern: /(['"`])\s*,\s*\}/g,
        replacement: '$1\n            }'
    },
    // パターン3: 関数呼び出しの不正な括弧
    // 例: this.performAggregation(rawData, { groupBy)
    {
        pattern: /\{\s*(\w+)\s*\)\s*$/gm,
        replacement: '{\n                $1'
    },
    // パターン4: オブジェクトプロパティの次の行の不正なプロパティ
    // 例: aggregateBy);
    {
        pattern: /^(\s+)(\w+)\s*\);/gm,
        replacement: '$1$2\n            });'
    },
    // パターン5: return文の不正な括弧
    // 例: return this.createSuccessResponse(aggregatedData, {)
    {
        pattern: /return\s+([^(]+)\(([^,]+),\s*\{\s*\)\s*$/gm,
        replacement: 'return $1($2, {'
    },
    // パターン6: オブジェクトプロパティの不正な終端
    // 例: aggregationRules});
    {
        pattern: /^(\s+)(\w+)\s*\}\);/gm,
        replacement: '$1$2,'
    },
    // パターン7: プロパティの後の不正な括弧とカンマ
    // 例: sourceDataCount: rawData.length),
    {
        pattern: /:\s*([^,\n]+)\),$/gm,
        replacement: ': $1,'
    },
    // パターン8: console.error の不正な文字列
    // 例: console.error('Aggregation error:', error';''
    {
        pattern: /console\.(error|log|warn)\(([^)]+)\);\s*''/g,
        replacement: 'console.$1($2);'
    },
    // パターン9: return文の不正な文字列連結
    // 例: return this.createErrorResponse('AGGREGATION_ERROR'')'';
    {
        pattern: /return\s+([^(]+)\((['"`][^'"`]+['"`])\s*'\s*\)\s*''/g,
        replacement: 'return $1($2,'
    },
    // パターン10: 関数パラメータの型注釈の不正な終端
    // 例: async getAdvancedAggregatedData(aggregationRules, options: any = {}) {'
    {
        pattern: /\)\s*\{\s*'$/gm,
        replacement: ') {'
    },
    // パターン11: 文字列リテラルの後の不正な文字
    {
        pattern: /(['"`])\s*'\s*([,;)\]}])/g,
        replacement: '$1$2'
    },
    // パターン12: セミコロンの後の不正な文字列
    {
        pattern: /;\s*''\s*$/gm,
        replacement: ';'
    },
    // パターン13: 括弧の後の不正な文字列
    {
        pattern: /\)\s*''\s*$/gm,
        replacement: ')'
    },
    // パターン14: オブジェクトの終了括弧の修正
    {
        pattern: /\s+\}\s*\)\s*$/gm,
        replacement: '\n            });'
    },
    // パターン15: catchブロックの不正な終端
    {
        pattern: /\}\s*catch\s*\(error\)\s*\{/g,
        replacement: '} catch (error) {'
    },
    // パターン16: 関数呼び出しの終端修正
    {
        pattern: /,\s*500\)\s*;\s*\}/g,
        replacement: ', 500);\n        }'
    }
];

// 特殊なパターンを修正する関数
function applySpecialFixes(content) {
    // 1. 複数行にまたがるオブジェクトリテラルの修正
    content = content.replace(/\{\s*\)\s*\n\s*(\w+)\s*\}/gm, '{\n                $1\n            })');
    
    // 2. 関数呼び出しの複数行パターン修正
    content = content.replace(/\(([^,]+),\s*\{\s*\)\s*\n\s*([^}]+)\s*\}/gm, '($1, {\n                $2\n            })');
    
    // 3. エラーメッセージの修正
    content = content.replace(/(['"`])([^'"`]+)\1\s*,\s*(\d+)\)\s*;\s*\}/g, "'$2', $3);\n        }");
    
    return content;
}

// TypeScriptファイルを検索
function findTypeScriptFiles(dir) {
    return glob.sync(path.join(dir, '**/*.ts'), {
        ignore: ['node_modules/**', 'dist/**', 'build/**', '**/*.d.ts']
    });
}

// ファイルを修正
function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changeCount = 0;

        // 基本パターンを適用
        fixPatterns.forEach(({ pattern, replacement }) => {
            const before = content;
            content = content.replace(pattern, replacement);
            if (before !== content) {
                changeCount++;
            }
        });

        // 特殊な修正を適用
        const beforeSpecial = content;
        content = applySpecialFixes(content);
        if (beforeSpecial !== content) {
            changeCount++;
        }

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

    console.log('大量のTypeScript構文エラー修正スクリプトを開始します...');
    console.log('主にDataAggregationProcessor.tsのようなパターンを修正します。');

    let totalFixed = 0;

    // srcディレクトリの修正
    console.log('\nsrcディレクトリを処理中...');
    const srcFiles = findTypeScriptFiles(srcDir);
    console.log(`${srcFiles.length}個のTypeScriptファイルを検出`);

    srcFiles.forEach(file => {
        if (fixFile(file)) {
            totalFixed++;
        }
    });

    // testディレクトリの修正
    testDirs.forEach(testDir => {
        if (fs.existsSync(testDir)) {
            console.log(`\n${testDir}を処理中...`);
            const testFiles = findTypeScriptFiles(testDir);
            console.log(`${testFiles.length}個のTypeScriptファイルを検出`);
            
            testFiles.forEach(file => {
                if (fixFile(file)) {
                    totalFixed++;
                }
            });
        }
    });

    console.log(`\n完了: ${totalFixed}個のファイルを修正しました。`);
    
    // 修正後の状態を確認するためのコマンドを提案
    console.log('\n次のコマンドでビルドエラーを確認できます:');
    console.log('npx tsc --noEmit 2>&1 | grep -E "error TS" | wc -l');
}

// スクリプト実行
if (require.main === module) {
    main();
}

module.exports = { fixFile, fixPatterns, applySpecialFixes };