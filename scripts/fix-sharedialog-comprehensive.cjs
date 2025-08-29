#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * ShareDialog.ts 包括的構文修正
 */
function fixShareDialogComprehensive(content) {
    let modified = false;
    const originalContent = content;
    
    // 1. 基本的な文字列リテラル未終了修正
    content = content.replace(/'([^']*),(?=\s*$)/gm, "'$1',");
    content = content.replace(/"([^"]*),(?=\s*$)/gm, '"$1",');
    
    // 2. プロパティ値の文字列修正
    content = content.replace(/allowMessageEdit: options\.allowMessageEdit === true;/g, 'allowMessageEdit: options.allowMessageEdit === true,');
    content = content.replace(/reducedMotion: options\.reducedMotion === true;/g, 'reducedMotion: options.reducedMotion === true');
    
    // 3. オブジェクトプロパティのセパレータ修正
    content = content.replace(/(\w+): ([^,;{}]+);(?=\s*\w+\s*:)/g, '$1: $2,');
    content = content.replace(/(\w+): ([^,;{}]+),(?=\s*})/g, '$1: $2');
    
    // 4. 余分なカンマの削除
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/,(\s*[}\]])/g, '$1');
    
    // 5. 関数パラメータと括弧の修正
    content = content.replace(/\.bind\(this,/g, '.bind(this)');
    content = content.replace(/setAttribute\('([^']+)', '([^']+)'\);'/g, "setAttribute('$1', '$2');");
    
    // 6. CSS値の修正
    content = content.replace(/:\s*'([^']*),/g, ": '$1',");
    content = content.replace(/:\s*"([^"]*),/g, ': "$1",');
    
    // 7. 配列とオブジェクトの修正
    content = content.replace(/\[\s*'([^']*),/g, "['$1',");
    content = content.replace(/{\s*([^:]+):\s*'([^']*),/g, "{ $1: '$2',");
    
    // 8. テンプレートリテラルとHTMLの修正
    content = content.replace(/`([^`]*),/g, '`$1`,');
    content = content.replace(/<([^>]*),/g, '<$1>,');
    
    // 9. 特定パターンの修正
    content = content.replace(/previousFocus: null,/g, 'previousFocus: null');
    content = content.replace(/announcer: null;/g, 'announcer: null');
    
    // 10. 条件文とループの修正
    content = content.replace(/if\s*\([^)]*\)\s*{\s*,/g, (match) => match.replace(',', ''));
    content = content.replace(/}\s*else\s*{\s*,/g, (match) => match.replace(',', ''));
    
    // 11. 関数呼び出しの修正
    content = content.replace(/\(\s*([^)]*),\s*\)/g, '($1)');
    
    // 12. セミコロンの修正
    content = content.replace(/;;\s*/g, ';');
    
    if (content !== originalContent) {
        modified = true;
    }
    
    return { content, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixShareDialogComprehensive(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// メイン処理
console.log('Fixing ShareDialog comprehensive syntax errors...\n');

const filePath = path.join(process.cwd(), 'src/core/ShareDialog.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log(`ShareDialog comprehensive fix applied: ${filePath}`);
    } else {
        console.log(`No changes needed: ${filePath}`);
    }
} else {
    console.log(`File not found: ${filePath}`);
}

console.log('\nShareDialog comprehensive fix completed.');