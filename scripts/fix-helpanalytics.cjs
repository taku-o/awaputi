#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * HelpAnalytics.ts インターフェース定義修正
 */
function fixHelpAnalyticsInterfaces(content) {
    let modified = false;
    const originalContent = content;
    
    // 1. 基本的なインターフェース構文修正
    // ネストしたexportを修正
    content = content.replace(/(\s+export interface)/g, '\n};\nexport interface');
    
    // 2. プロパティのセパレータ修正（セミコロンとカンマの統一）
    content = content.replace(/(\w+\??:\s*[^,;{}]+),(?=\s*\w+\??:)/g, '$1;');
    content = content.replace(/(\w+\??:\s*[^,;{}]+);(?=\s*})/g, '$1');
    
    // 3. 最初のインターフェースの開始前の}を削除
    content = content.replace(/^};\nexport interface GameEngine/m, 'export interface GameEngine');
    
    // 4. 型定義の修正
    content = content.replace(/Map<string, number>;/g, 'Map<string, number>');
    content = content.replace(/Set<string>,/g, 'Set<string>');
    
    // 5. コメント行の修正
    content = content.replace(/{ \/\/ ([^}]+) };/g, '{\n    // $1\n}');
    
    // 6. 特定パターンの修正
    content = content.replace(/dataRetentionDays: number;/g, 'dataRetentionDays: number');
    content = content.replace(/exitCount: number;/g, 'exitCount: number');
    
    // 7. 最終行に適切な終了を追加
    if (!content.trim().endsWith('};') && !content.trim().endsWith('}')) {
        content = content.replace(/([^}])(\s*)$/, '$1;\n}$2');
    }
    
    // 8. 重複する}の削除
    content = content.replace(/};\s*};\s*export/g, '};\nexport');
    
    // 9. 空のインターフェースの修正
    content = content.replace(/export interface (\w+) { };/g, 'export interface $1 {\n    // TODO: Define interface properties\n}');
    
    if (content !== originalContent) {
        modified = true;
    }
    
    return { content, modified };
}

/**
 * HelpAnalytics.ts クラス定義修正
 */
function fixHelpAnalyticsClass(content) {
    let modified = false;
    const originalContent = content;
    
    // 1. クラスプロパティのセパレータ修正
    content = content.replace(/private\s+(\w+):\s*([^,;{}]+),/g, 'private $1: $2;');
    content = content.replace(/public\s+(\w+):\s*([^,;{}]+),/g, 'public $1: $2;');
    
    // 2. メソッドパラメータの修正
    content = content.replace(/(\w+)\(([^)]*),\s*\)/g, '$1($2)');
    
    // 3. return文の修正
    content = content.replace(/return\s*{([^}]+),\s*}/g, 'return { $1 }');
    
    // 4. オブジェクト初期化の修正
    content = content.replace(/=\s*{([^}]+),\s*}/g, '= { $1 }');
    
    // 5. Map/Set初期化の修正
    content = content.replace(/new Map\(\),/g, 'new Map()');
    content = content.replace(/new Set\(\),/g, 'new Set()');
    
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
        
        // インターフェース修正
        let result = fixHelpAnalyticsInterfaces(content);
        
        // クラス修正
        if (result.content.includes('export class')) {
            result = fixHelpAnalyticsClass(result.content);
            if (result.modified) {
                modified = true;
            }
        }
        
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
console.log('Fixing HelpAnalytics.ts interface and class syntax errors...\n');

const filePath = path.join(process.cwd(), 'src/core/help/HelpAnalytics.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log(`HelpAnalytics.ts fixed: ${filePath}`);
    } else {
        console.log(`No changes needed: ${filePath}`);
    }
} else {
    console.log(`File not found: ${filePath}`);
}

console.log('\nHelpAnalytics.ts fix completed.');