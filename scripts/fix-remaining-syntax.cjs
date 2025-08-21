#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 残りの構文エラーを修正
 */
function fixRemainingSyntax(content) {
    let modified = false;
    
    // 1. セミコロンが必要な場所でカンマになっているパターン
    // "++," -> "++;"
    content = content.replace(/(\+\+|--),(?=\s*$)/gm, (match, op) => {
        modified = true;
        return `${op};`;
    });
    
    // 2. 関数呼び出しの後の不正なセミコロン
    // ") }" -> ");"
    content = content.replace(/\)\s*}(?=\s*$)/gm, ');');
    
    // 3. メソッドチェーンの修正
    // ").then(" -> ").then("
    content = content.replace(/\)\.then\((.*?)\)\s*=>\s*([^;]+)\);/g, (match, params, body) => {
        if (!body.includes('{')) {
            modified = true;
            return `).then(${params}) => ${body});`;
        }
        return match;
    });
    
    // 4. オブジェクトリテラル内のカンマとセミコロンの修正
    // プロパティ定義の最後がセミコロンではなくカンマになっているパターン
    content = content.replace(/(\w+)\s*:\s*([^,;{}]+)\s*}(?=\s*,)/g, (match, prop, value) => {
        modified = true;
        return `${prop}: ${value},`;
    });
    
    // 5. 関数パラメータの修正
    // "options: any = {} {" -> "options: any = {}) {"
    content = content.replace(/(\w+)\s*:\s*(\w+)\s*=\s*{}\s*{/g, (match, param, type) => {
        modified = true;
        return `${param}: ${type} = {}) {`;
    });
    
    // 6. プロパティチェーンの修正
    // ", }" -> " }"
    content = content.replace(/,\s*}/g, ' }');
    
    // 7. インターフェース内の誤ったセミコロン
    // オブジェクトプロパティの場合
    content = content.replace(/interface\s+\w+\s*{([^}]+)}/g, (match, body) => {
        const fixedBody = body.replace(/;\s*(?=[a-zA-Z_$])/g, ';\n    ');
        if (fixedBody !== body) {
            modified = true;
            return match.replace(body, fixedBody);
        }
        return match;
    });
    
    // 8. 連続したカンマの修正
    content = content.replace(/,\s*,/g, ',');
    
    // 9. returnステートメントの修正
    // "return { ...obj" の後に } が欠けている場合
    content = content.replace(/return\s*{\s*([^}]+)\s*(?=\n\s*} catch)/g, (match, body) => {
        modified = true;
        return `return { ${body} }`;
    });
    
    // 10. async関数の修正
    // "async (query: any) => {" パターンでreturn文が正しく閉じられていない
    content = content.replace(/async\s*\([^)]*\)\s*=>\s*{\s*return\s+await\s+[^;]+\s*};/g, (match) => {
        if (match.endsWith(' };')) {
            modified = true;
            return match.replace(' };', ';\n        });');
        }
        return match;
    });
    
    // 11. 配列内の関数呼び出し
    // "Array.from(map.keys()" -> "Array.from(map.keys())"
    content = content.replace(/Array\.from\(([^)]+)\(/g, (match, arg) => {
        if (!match.includes('()')) {
            modified = true;
            return `Array.from(${arg}()`;
        }
        return match;
    });
    
    // 12. データ型定義の修正
    // ": { message: string; {" -> ": { message: string } {"
    content = content.replace(/:\s*{\s*message:\s*string;\s*{/g, ': { message: string } {');
    
    // 13. 不完全な閉じ括弧
    // 行末の ) が不足している場合
    content = content.replace(/\.getAPIMetadata\(\s*}/g, '.getAPIMetadata() }');
    
    // 14. プロパティアクセス後のセミコロン欠如
    // ".length" の後にセミコロンがない
    content = content.replace(/\.length(?=\s*$)/gm, '.length;');
    
    // 15. オブジェクトリテラルの末尾カンマ
    // インターフェース外でのオブジェクトプロパティ
    content = content.replace(/(\w+)\s*:\s*([^,;{}]+);(?=\s*\w+\s*:)/g, (match, prop, value) => {
        // クラスプロパティ定義でない場合のみ
        if (!match.match(/^\s*(private|public|protected|static)/)) {
            modified = true;
            return `${prop}: ${value},`;
        }
        return match;
    });
    
    return { content, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixRemainingSyntax(content);
        
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

/**
 * ディレクトリを再帰的に処理
 */
function processDirectory(dir) {
    let totalFixed = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            totalFixed += processDirectory(filePath);
        } else if (stat.isFile() && file.endsWith('.ts')) {
            if (processFile(filePath)) {
                console.log(`Fixed: ${filePath}`);
                totalFixed++;
            }
        }
    }
    
    return totalFixed;
}

// メイン処理
console.log('Fixing remaining syntax errors in TypeScript files...\n');

const srcFixed = processDirectory(path.join(process.cwd(), 'src'));
const testsFixed = processDirectory(path.join(process.cwd(), 'src/tests'));

const totalFixed = srcFixed + testsFixed;
console.log(`\nTotal files fixed: ${totalFixed}`);