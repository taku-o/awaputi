#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// エラーが特に多いファイルを優先的に処理
const priorityFiles = [
    'src/analytics/analytics-api/APIEndpointManager.ts',
    'src/tests/mobile/mobile-test-suite/MobileTestReporter.ts',
    'src/core/ShareDialog.ts'
];

/**
 * インターフェースとオブジェクトの構文エラーを修正
 */
function fixInterfaceObjectSyntax(content) {
    let modified = false;
    let lines = content.split('\n');
    
    // 1. インターフェース内のプロパティセパレータ修正
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // インターフェース宣言の検出
        if (line.match(/^\s*(?:export\s+)?interface\s+\w+\s*{/)) {
            // インターフェースブロック内を処理
            let braceCount = 1;
            let j = i + 1;
            
            while (j < lines.length && braceCount > 0) {
                const currentLine = lines[j];
                
                // ブレース数のカウント
                braceCount += (currentLine.match(/{/g) || []).length;
                braceCount -= (currentLine.match(/}/g) || []).length;
                
                if (braceCount > 0) {
                    // プロパティ行でカンマをセミコロンに変換
                    if (currentLine.match(/^\s*\w+\s*:\s*[^;,\n]+,\s*$/)) {
                        lines[j] = currentLine.replace(/,(\s*)$/, ';$1');
                        modified = true;
                    }
                    // end パターンの修正
                    if (currentLine.match(/^\s*end:\s*Date,$/)) {
                        lines[j] = currentLine.replace(/,(\s*)$/, ';$1');
                        modified = true;
                    }
                }
                j++;
            }
        }
    }
    
    // 2. インターフェース定義の閉じ括弧が欠けている場合の修正
    for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];
        
        // インターフェースプロパティの後にexport classが来る場合
        if (line.match(/^\s*\w+:\s*[^;]+;?\s*$/) && 
            nextLine.match(/^\s*export\s+class\s+/)) {
            // 前の行を探してインターフェース宣言を確認
            let j = i - 1;
            let insideInterface = false;
            let braceCount = 0;
            
            while (j >= 0) {
                const prevLine = lines[j];
                if (prevLine.match(/^\s*(?:export\s+)?interface\s+\w+\s*{/)) {
                    insideInterface = true;
                    braceCount = 1;
                    break;
                }
                j--;
            }
            
            if (insideInterface) {
                // ブレースカウントを確認
                for (let k = j + 1; k <= i; k++) {
                    braceCount += (lines[k].match(/{/g) || []).length;
                    braceCount -= (lines[k].match(/}/g) || []).length;
                }
                
                if (braceCount > 0) {
                    // 閉じ括弧を追加
                    lines[i] = lines[i] + '\n}';
                    modified = true;
                }
            }
        }
    }
    
    // 3. オブジェクトリテラル内のセミコロンをカンマに修正
    content = lines.join('\n');
    
    // プロパティ定義パターンの修正
    content = content.replace(/(\w+)\s*:\s*{\s*([^}]*?)}\s*;/g, (match, prop, innerContent) => {
        // オブジェクトリテラル内のセミコロンをカンマに変換
        const fixedInner = innerContent.replace(/;(\s*)(?=[a-zA-Z_$])/g, ',$1');
        modified = true;
        return `${prop}: { ${fixedInner} },`;
    });
    
    // 4. 不正なプロパティ区切り文字の修正
    // "enabled: boolean }" -> "enabled: boolean;"
    content = content.replace(/(\w+)\s*:\s*(boolean|number|string|any)\s*}/g, (match, prop, type) => {
        modified = true;
        return `${prop}: ${type};\n    }`;
    });
    
    // 5. オブジェクトリテラル内の不正な閉じ括弧
    // "timestamp: number | null;" の後の }; を修正
    content = content.replace(/(\w+)\s*:\s*([^;]+);\s*}\s*;/g, (match, prop, type) => {
        if (match.includes('|')) {
            modified = true;
            return `${prop}: ${type};\n    };`;
        }
        return match;
    });
    
    // 6. コンストラクタのパラメータ修正
    content = content.replace(/constructor\((.*?)\)\s*{/g, (match, params) => {
        // パラメータ内の不正な区切り文字を修正
        const fixedParams = params
            .replace(/,\s*=/g, ' =')  // ", =" -> " ="
            .replace(/}\s*,/g, '}')   // "}, " -> "}"
            .replace(/;\s*}/g, ' }'); // "; }" -> " }"
        
        if (fixedParams !== params) {
            modified = true;
        }
        return `constructor(${fixedParams}) {`;
    });
    
    return { content, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixInterfaceObjectSyntax(content);
        
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
console.log('Fixing interface and object syntax errors in TypeScript files...\n');

// 優先ファイルを先に処理
console.log('Processing priority files first...');
let priorityFixed = 0;
for (const file of priorityFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
        if (processFile(fullPath)) {
            console.log(`Fixed priority file: ${file}`);
            priorityFixed++;
        }
    }
}

console.log(`\nFixed ${priorityFixed} priority files\n`);

// 残りのファイルを処理
console.log('Processing remaining files...');
const srcFixed = processDirectory(path.join(process.cwd(), 'src'));
const testsFixed = processDirectory(path.join(process.cwd(), 'src/tests'));

const totalFixed = priorityFixed + srcFixed + testsFixed;
console.log(`\nTotal files fixed: ${totalFixed}`);