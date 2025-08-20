#!/usr/bin/env node
/**
 * Critical Structural Errors Fix Script
 * 重要な構造的エラーを修正（APIEndpointManager.tsの分析結果に基づく）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 修正統計
let fixedFiles = 0;
let totalFixCount = 0;
let processedFiles = 0;

// 重要な構造的エラーパターン
const criticalPatterns = [
    // メソッド呼び出し後の不正なブロック: this.method() { }
    {
        pattern: /(\w+)\(\)\s*\{\s*\}/g,
        replacement: '$1();',
        description: 'メソッド呼び出し後の不正なブロックを修正'
    },
    
    // 不正なオブジェクトリテラル終端: }; の後の余分な }
    {
        pattern: /\}\;\s*\}/g,
        replacement: '};',
        description: 'オブジェクトリテラル後の余分なブレースを修正'
    },
    
    // パラメータリスト不正終端: (param = {)
    {
        pattern: /=\s*\{\)/g,
        replacement: '= {})',
        description: 'パラメータデフォルト値の不正構文を修正'
    },
    
    // 文字列内の不正な改行: 'text';' }'
    {
        pattern: /('([^']*)')\s*;\s*'\s*\}/g,
        replacement: '$1;',
        description: '文字列後の不正な引用符とブレースを修正'
    },
    
    // if文条件の不正終端: if(condition) { issues.push({ element);
    {
        pattern: /element\)\s*;/g,
        replacement: 'element,',
        description: 'オブジェクトプロパティの不正終端を修正'
    },
    
    // オブジェクトプロパティ後の不正構文: property),
    {
        pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*,/g,
        replacement: '$1,',
        description: 'オブジェクトプロパティ後の不正な括弧を修正'
    },
    
    // 配列/オブジェクト内の不正引用符パターン: 'string'), または 'string');
    {
        pattern: /('([^']*)')\)\s*[,;}]/g,
        replacement: (match, quote, content, offset, string) => {
            // 前後のコンテキストを確認
            const before = string.substring(Math.max(0, offset - 20), offset);
            const after = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 10));
            
            // 配列やオブジェクト内の場合
            if (before.includes('[') || before.includes('{') || before.includes('(')) {
                return quote + (after.startsWith(';') ? ';' : ',');
            }
            return match;
        },
        description: '配列・オブジェクト内の不正引用符パターンを修正'
    },
    
    // try/catch文内の不正構文: } catch (error') { ''
    {
        pattern: /\}\s*catch\s*\(\s*([^)]+)'\s*\)\s*\{\s*''/g,
        replacement: '} catch ($1) {',
        description: 'catch文の不正構文を修正'
    },
    
    // console.log等の不正終端: console.log('message');' }'
    {
        pattern: /console\.(log|error|warn)\(([^)]+)\)\s*;\s*'\s*\}/g,
        replacement: 'console.$1($2);',
        description: 'console出力の不正終端を修正'
    },
    
    // 関数/メソッド定義内の不正構文修正
    {
        pattern: /\{\s*'\s*\}/g,
        replacement: '{}',
        description: '空オブジェクト内の不正引用符を修正'
    },
    
    // 三項演算子の不正構文: condition ? value : undefined;
    {
        pattern: /\?\s*:\s*undefined\s*;/g,
        replacement: ' ? undefined : undefined;',
        description: '三項演算子の不正構文を修正'
    },
    
    // 関数パラメータの不正引用符: function('param')
    {
        pattern: /(\w+)\('([^']*)'\)/g,
        replacement: '$1($2)',
        description: '関数パラメータの不正引用符を修正'
    }
];

// 高度なパターン修正
const advancedPatterns = [
    // 複雑なオブジェクトリテラル修正
    {
        pattern: /\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,}]+)\s*\}\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*\)/g,
        replacement: '{ $1: $2 }.$3()',
        description: '複雑なオブジェクトリテラル構文を修正'
    },
    
    // アロー関数の不正構文
    {
        pattern: /=>\s*\{\s*'/g,
        replacement: '=> {',
        description: 'アロー関数内の不正引用符を修正'
    },
    
    // 条件分岐の不正構文
    {
        pattern: /if\s*\(\s*([^)]+)\s*\)\s*\{\s*'/g,
        replacement: 'if ($1) {',
        description: 'if文内の不正引用符を修正'
    }
];

function processTypeScriptFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;
        let fileFixCount = 0;
        let fixed = false;
        
        // 基本パターン修正
        criticalPatterns.forEach(({ pattern, replacement, description }) => {
            const beforeCount = (content.match(pattern) || []).length;
            if (beforeCount > 0) {
                if (typeof replacement === 'function') {
                    content = content.replace(pattern, replacement);
                } else {
                    content = content.replace(pattern, replacement);
                }
                const afterCount = (content.match(pattern) || []).length;
                const fixCount = beforeCount - afterCount;
                if (fixCount > 0) {
                    fileFixCount += fixCount;
                    fixed = true;
                }
            }
        });
        
        // 高度なパターン修正
        advancedPatterns.forEach(({ pattern, replacement, description }) => {
            const beforeCount = (content.match(pattern) || []).length;
            if (beforeCount > 0) {
                content = content.replace(pattern, replacement);
                const afterCount = (content.match(pattern) || []).length;
                const fixCount = beforeCount - afterCount;
                if (fixCount > 0) {
                    fileFixCount += fixCount;
                    fixed = true;
                }
            }
        });
        
        // 特殊ケース：連続する不正パターン修正
        const specialPatterns = [
            // }; の後に来る余分な構文を修正
            { from: /\};\s*\}\s*;/g, to: '};' },
            { from: /\};\s*\}\s*\}/g, to: '};' },
            
            // 重複するセミコロンやブレース
            { from: /;;\s*;/g, to: ';' },
            { from: /\}\}\s*;/g, to: '};' },
            
            // 不正なオブジェクトプロパティ区切り
            { from: /,\s*\}\s*;/g, to: '};' },
            { from: /,\s*\]\s*;/g, to: '];' }
        ];
        
        specialPatterns.forEach(({ from, to }) => {
            const matches = content.match(from);
            if (matches) {
                content = content.replace(from, to);
                fileFixCount += matches.length;
                fixed = true;
            }
        });
        
        // ファイルに変更があった場合のみ書き込み
        if (fixed && content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            fixedFiles++;
            totalFixCount += fileFixCount;
            
            if (fileFixCount > 50) {
                console.log(`🔧 ${path.relative('.', filePath)}: ${fileFixCount} fixes`);
            }
        }
        
        processedFiles++;
        
        // 進捗表示
        if (processedFiles % 100 === 0) {
            console.log(`📊 Progress: ${processedFiles} files processed, ${fixedFiles} files fixed`);
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// TypeScriptファイルを再帰的に検索
function findTypeScriptFiles(dir) {
    const files = [];
    
    function scanDirectory(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // 除外ディレクトリをスキップ
                    if (['node_modules', '.git', 'dist', 'build'].includes(item)) {
                        continue;
                    }
                    scanDirectory(fullPath);
                } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${currentDir}:`, error.message);
        }
    }
    
    scanDirectory(dir);
    return files;
}

// メイン実行
console.log('🚀 Critical Structural Errors Fix Script Starting...');
console.log('🎯 Target: Complex structural syntax errors based on APIEndpointManager.ts analysis');

const startTime = Date.now();

// TypeScriptファイルを検索して処理
const tsFiles = findTypeScriptFiles('.');
console.log(`📁 Found ${tsFiles.length} TypeScript files`);

// 重要度順にファイルを処理
const priorityFiles = tsFiles.filter(f => 
    f.includes('APIEndpointManager') || 
    f.includes('DataAggregationProcessor') ||
    f.includes('WCAGRuleEngine') ||
    f.includes('AccessibilityAuditor')
);

const regularFiles = tsFiles.filter(f => !priorityFiles.includes(f));

console.log(`🔥 Processing ${priorityFiles.length} priority files first...`);
priorityFiles.forEach(processTypeScriptFile);

console.log(`📝 Processing ${regularFiles.length} regular files...`);
regularFiles.forEach(processTypeScriptFile);

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log('\n📊 Critical Structural Errors Fix Summary:');
console.log(`⏱️  Duration: ${duration}s`);
console.log(`📁 Files processed: ${processedFiles}`);
console.log(`🔧 Files fixed: ${fixedFiles}`);
console.log(`🎯 Total fixes applied: ${totalFixCount}`);
console.log(`📈 Fix rate: ${((fixedFiles / processedFiles) * 100).toFixed(1)}%`);

// TypeScriptコンパイルチェック
console.log('\n🔍 Running TypeScript compilation check...');
try {
    const result = execSync('npx tsc --noEmit --skipLibCheck', { 
        encoding: 'utf-8',
        timeout: 60000 
    });
    console.log('✅ TypeScript compilation completed without timeout');
} catch (error) {
    if (error.stdout) {
        const errors = error.stdout.split('\n').filter(line => line.includes('error TS'));
        const errorCount = errors.length;
        console.log(`🔍 Current TypeScript errors: ${errorCount}`);
        
        // エラーパターン分析
        const errorPatterns = {};
        errors.forEach(error => {
            const match = error.match(/error (TS\d+):/);
            if (match) {
                const errorCode = match[1];
                errorPatterns[errorCode] = (errorPatterns[errorCode] || 0) + 1;
            }
        });
        
        console.log('📊 Top error types:');
        Object.entries(errorPatterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([code, count]) => {
                console.log(`   ${code}: ${count} errors`);
            });
    } else {
        console.log('❌ TypeScript compilation failed:', error.message.substring(0, 200));
    }
}

console.log('✅ Critical Structural Errors Fix Script completed');