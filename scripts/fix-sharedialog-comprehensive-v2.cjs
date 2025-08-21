#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * ShareDialog.ts 専用の包括的構文修正
 */
function fixShareDialogSyntax(content) {
    let modified = false;
    const originalContent = content;
    
    console.log('Starting ShareDialog.ts comprehensive syntax fix...');
    
    // 1. 文字列リテラルの未終了エラー修正
    // Single quote issues - fix quotes that appear to be unclosed
    content = content.replace(/'([^']*),$/gm, "'$1',");  // Fix quotes before commas
    content = content.replace(/'([^']*);$/gm, "'$1';");  // Fix quotes before semicolons  
    content = content.replace(/\|\| '([^']+)',/g, "|| '$1',");  // Fix string assignments with commas
    content = content.replace(/\|\| '([^']+)'/g, "|| '$1'");  // Fix string assignments
    content = content.replace(/'([^']*)''/g, "'$1'");  // Remove double quotes at end
    content = content.replace(/''([^']*)/g, "'$1");  // Remove double quotes at start
    
    // 2. プロパティセパレータの修正
    // In object literals, use commas between properties
    content = content.replace(/:\s*([^,;{}]+[^,;])\s*,$/gm, ': $1,');
    content = content.replace(/:\s*([^,;{}]+[^,;])\s*;$/gm, ': $1,');
    
    // 3. オブジェクトリテラル内のセミコロンをカンマに変換
    content = content.replace(/(\w+\?\??\s*:\s*[^,;{}]+);(?=\s*\w+\?\??\s*:)/g, '$1,');
    
    // 4. 関数呼び出しとメソッドの括弧修正
    content = content.replace(/(\w+)\(\s*\)\s*'/g, "$1()'");
    content = content.replace(/(\w+)\(\s*\)\s*;'/g, "$1()';");
    
    // 5. コンストラクタとメソッドパラメータの修正
    content = content.replace(/\(\s*([^)]+)\s*,\s*\)/g, '($1)');
    
    // 6. if/try/catch文の構文修正
    content = content.replace(/\}\s*catch\s*\(\s*error\s*\)\s*\{'/g, '} catch (error) {');
    content = content.replace(/\}\s*else\s*\{'/g, '} else {');
    
    // 7. 配列とオブジェクトの終端修正
    content = content.replace(/\[\s*([^[\]]*)\s*,\s*\]/g, '[$1]');
    content = content.replace(/\{\s*([^{}]*)\s*,\s*\}/g, '{$1}');
    
    // 8. テンプレートリテラル修正
    content = content.replace(/`([^`]*),$/gm, '`$1`,');
    content = content.replace(/`([^`]*);$/gm, '`$1`;');
    
    // 9. CSS プロパティの修正
    content = content.replace(/:\s*'([^']+)',/g, ": '$1',");
    content = content.replace(/:\s*'([^']+)';/g, ": '$1',");
    
    // 10. 関数定義の修正
    content = content.replace(/\)\s*\{'/g, ') {');
    content = content.replace(/\{\s*'/g, '{');
    
    // 11. return文の修正
    content = content.replace(/return\s*\{([^}]*),\s*\}/g, 'return {$1}');
    
    // 12. イベントリスナーの修正
    content = content.replace(/addEventListener\s*\(\s*'([^']+)'\s*,\s*([^)]+)\s*'\s*\)/g, "addEventListener('$1', $2)");
    
    // 13. 特定パターンの修正
    content = content.replace(/\}\s*;'/g, "};");
    content = content.replace(/\'\s*\}/g, "'}");
    content = content.replace(/\{\s*\'/g, "{'");
    
    // 14. document.createElement の修正
    content = content.replace(/document\.createElement\s*\(\s*'([^']+)\s*\)/g, "document.createElement('$1')");
    
    // 15. 空白と引用符の問題修正
    content = content.replace(/'\s*'\s*'/g, "''");
    content = content.replace(/\s*'\s*;\s*'/g, "';");
    
    if (content !== originalContent) {
        modified = true;
        console.log('ShareDialog.ts syntax fixes applied successfully.');
    }
    
    return { content, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        console.log(`Processing ${filePath}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const result = fixShareDialogSyntax(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`ShareDialog.ts fixed: ${filePath}`);
            return true;
        } else {
            console.log(`No changes needed: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// メイン処理
console.log('ShareDialog.ts Comprehensive Syntax Fix v2\n');

const filePath = path.join(process.cwd(), 'src/core/ShareDialog.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log('\n✅ ShareDialog.ts syntax fix completed successfully.');
    } else {
        console.log('\n❌ No fixes applied to ShareDialog.ts.');
    }
} else {
    console.log(`❌ File not found: ${filePath}`);
}

console.log('\nShareDialog.ts comprehensive fix completed.');