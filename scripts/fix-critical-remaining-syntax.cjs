#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * クリティカルな構文エラーを修正
 */
function fixCriticalSyntax(content, filePath) {
    let modified = false;
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 1. 不適切な文字列リテラルの修正
        // "export class ShareDialog {'" -> "export class ShareDialog {"
        if (line.match(/export\s+class\s+\w+\s*{\s*['"`]$/)) {
            lines[i] = line.replace(/(['"`])$/, '');
            modified = true;
        }
        
        // 2. 余分な閉じ括弧の修正
        // "constructor(socialSharingManager, options = {)) {" -> "constructor(socialSharingManager, options = {}) {"
        if (line.match(/constructor\s*\([^)]*\)\s*\)\s*{/)) {
            lines[i] = line.replace(/\)\s*\)\s*{/, ') {');
            modified = true;
        }
        
        // 3. セミコロンが必要な場所でのカンマ修正
        // "closeOnEscape: options.closeOnEscape !== false;" -> "closeOnEscape: options.closeOnEscape !== false,"
        if (line.match(/^\s*\w+\s*:\s*[^,;]+;$/)) {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
            if (nextLine.match(/^\s*,/)) {
                lines[i] = line.replace(/;$/, ',');
                modified = true;
            }
        }
        
        // 4. オブジェクトプロパティ内の不適切な記号
        // ", platforms:" -> "platforms:"
        if (line.match(/^\s*,\s*\w+\s*:/)) {
            lines[i] = line.replace(/^\s*,\s*/, '            ');
            modified = true;
        }
        
        // 5. 配列内の余分な文字
        // "'," -> ","
        if (line.match(/['"`],$/)) {
            lines[i] = line.replace(/['"`],/, ',');
            modified = true;
        }
        
        // 6. 不完全なプロパティ定義
        // "}};" -> "}"
        if (line.match(/^\s*}\s*};\s*$/)) {
            const prevLine = i > 0 ? lines[i - 1] : '';
            if (prevLine.match(/^\s*\w+\s*:\s*[^,;]+$/)) {
                lines[i] = '        }';
                modified = true;
            }
        }
        
        // 7. メソッド定義後の不適切な文字
        // "}'" -> "}"
        if (line.match(/^\s*}\s*['"`]\s*$/)) {
            lines[i] = line.replace(/['"`]\s*$/, '');
            modified = true;
        }
        
        // 8. インターフェース定義の修正
        if (line.match(/^\s*interface\s+\w+\s*{\s*\w+\s*:\s*[^,;]+,$/)) {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
            if (nextLine.match(/^\s*\w+\s*:\s*[^,;]+,$/)) {
                lines[i] = line.replace(/,$/, ';');
                modified = true;
            }
        }
        
        // 9. 行末の余分なブロック文字を削除
        // "    " -> ""（行74のような余分な文字）
        if (line === '    ' && i > 0 && lines[i-1].match(/}\s*;\s*$/)) {
            lines[i] = '';
            modified = true;
        }
        
        // 10. 不適切な文字列の修正
        // ShareDialog specific fixes
        if (filePath && filePath.includes('ShareDialog.ts')) {
            // ",'" -> ","
            if (line.match(/,\s*['"`]\s*$/)) {
                lines[i] = line.replace(/,\s*['"`]\s*$/, ',');
                modified = true;
            }
            
            // "} }" -> "}"（重複する閉じ括弧）
            if (line.match(/^\s*}\s*}\s*$/)) {
                const prevLines = lines.slice(Math.max(0, i - 3), i).join('\n');
                if (!prevLines.includes('{')) {
                    lines[i] = '        }';
                    modified = true;
                }
            }
            
            // "''" -> ""（空文字列リテラル）
            if (line.match(/^\s*['"`]{2}\s*$/)) {
                lines[i] = '';
                modified = true;
            }
        }
    }
    
    // 11. APIEndpointManager.ts specific fixes
    if (filePath && filePath.includes('APIEndpointManager.ts')) {
        // Remove extra characters on line 74
        for (let i = 0; i < lines.length; i++) {
            if (i === 73 && lines[i] === '    ') { // line 74 (0-indexed)
                lines[i] = '';
                modified = true;
            }
        }
    }
    
    // 12. その他の構文エラーパターン
    let content2 = lines.join('\n');
    
    // プロパティ定義の最後
    content2 = content2.replace(/(\w+\s*:\s*[^,;{}]+);(\s*\w+\s*:)/g, '$1,$2');
    
    // async/await パターン
    content2 = content2.replace(/}\s*}\s*catch/g, '}\n        } catch');
    
    // メソッドの閉じ括弧
    content2 = content2.replace(/}\s*}\s*}\s*$/gm, '    }\n}');
    
    // メソッドチェーン
    content2 = content2.replace(/\)\)\)\)/g, '))');
    
    return { content: content2, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixCriticalSyntax(content, filePath);
        
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
console.log('Fixing critical remaining syntax errors in TypeScript files...\n');

// 優先的に修正するファイル
const priorityFiles = [
    'src/analytics/analytics-api/APIEndpointManager.ts',
    'src/analytics/analytics-api/DataAggregationProcessor.ts',
    'src/analytics/analytics-api/DataExportHandler.ts',
    'src/core/ShareDialog.ts',
    'src/tests/mobile/mobile-test-suite/MobileTestReporter.ts'
];

let totalFixed = 0;

// 優先ファイルを先に修正
for (const file of priorityFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        if (processFile(filePath)) {
            console.log(`Priority fixed: ${filePath}`);
            totalFixed++;
        }
    }
}

// 残りのファイルを修正
const srcFixed = processDirectory(path.join(process.cwd(), 'src'));
const testsFixed = processDirectory(path.join(process.cwd(), 'src/tests'));

totalFixed += srcFixed + testsFixed;
console.log(`\nTotal files fixed: ${totalFixed}`);