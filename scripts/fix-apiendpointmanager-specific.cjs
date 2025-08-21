#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// APIEndpointManager.tsとその他のファイルの特定パターンを修正
const fixSpecificPatterns = (content, filePath) => {
    let fixed = content;
    let modifications = 0;
    
    // Pattern 1: セミコロンの代わりにカンマがある箇所を修正
    // enabled: true; -> enabled: true,
    fixed = fixed.replace(/^(\s*)(\w+):\s*([^,;\n]+);$/gm, (match, indent, key, value) => {
        // オブジェクトプロパティのパターンの場合のみ
        const nextLine = fixed.split('\n')[fixed.split('\n').indexOf(match) + 1];
        if (nextLine && /^\s*\w+:/.test(nextLine)) {
            modifications++;
            return `${indent}${key}: ${value},`;
        }
        return match;
    });
    
    // Pattern 2: catch (error') { -> catch (error) {
    fixed = fixed.replace(/catch\s*\(\s*(\w+)'\s*\)\s*\{/g, (match, param) => {
        modifications++;
        return `catch (${param}) {`;
    });
    
    // Pattern 3: console.log('message); -> console.log('message');
    fixed = fixed.replace(/console\.(log|error|warn)\((['"])([^'"]*)\);/g, (match, method, quote, content) => {
        if (!match.includes(quote, match.indexOf(content))) {
            modifications++;
            return `console.${method}(${quote}${content}${quote});`;
        }
        return match;
    });
    
    // Pattern 4: オブジェクトプロパティの最後のカンマとセミコロンの修正
    // , requestHistory: new Map() // clientId -> requests[]
    // };
    fixed = fixed.replace(/,\s*(\w+):\s*([^,\n]+)\s*\/\/[^\n]*\n\s*\};/g, (match, key, value, comment) => {
        modifications++;
        return `, ${key}: ${value}\n        };`;
    });
    
    // Pattern 5: initialize() { の前の閉じブレースの修正
    fixed = fixed.replace(/\}\s*\n(\s*\/\*\*[\s\S]*?\*\/\s*\n\s*initialize\(\)\s*\{)/g, (match, methodBlock) => {
        modifications++;
        return `    }\n    \n${methodBlock}`;
    });
    
    // Pattern 6: tryブロックの修正
    // this.registerStandardEndpoints();    }
    // console.log('API, Endpoint Manager, initialized);
    fixed = fixed.replace(/this\.registerStandardEndpoints\(\);\s*\}\s*\n\s*console\.log\('API, Endpoint Manager, initialized\);/g, () => {
        modifications++;
        return `this.registerStandardEndpoints();\n            console.log('API Endpoint Manager initialized');`;
    });
    
    // Pattern 7: 'API, Endpoint Manager, initialized のような不正な文字列を修正
    fixed = fixed.replace(/console\.log\('([^']*),\s*([^']*),\s*([^']*)(?:\)|;)/g, (match, part1, part2, part3) => {
        modifications++;
        return `console.log('${part1} ${part2} ${part3}');`;
    });
    
    // Pattern 8: オブジェクトリテラルの閉じブレースの前のカンマ
    fixed = fixed.replace(/,(\s*)\}/g, '$1}');
    
    // Pattern 9: 配列アクセスの構文エラー
    // allowedOrigins: ['*']; -> allowedOrigins: ['*'],
    fixed = fixed.replace(/(\w+):\s*\[([^\]]+)\];/g, (match, key, value) => {
        modifications++;
        return `${key}: [${value}],`;
    });
    
    console.log(`Fixed ${modifications} issues in ${path.basename(filePath)}`);
    return fixed;
};

// ファイルを処理
const processFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixed = fixSpecificPatterns(content, filePath);
        
        if (content !== fixed) {
            fs.writeFileSync(filePath, fixed, 'utf8');
            console.log(`✓ Fixed: ${filePath}`);
        } else {
            console.log(`  No changes: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
};

// メイン処理
console.log('Fixing specific TypeScript syntax errors...\n');

// APIEndpointManager.tsを最初に修正
const apiEndpointManagerPath = path.join(__dirname, '..', 'src', 'analytics', 'analytics-api', 'APIEndpointManager.ts');
if (fs.existsSync(apiEndpointManagerPath)) {
    processFile(apiEndpointManagerPath);
}

// その他の問題のあるファイルも修正
const problematicFiles = [
    'src/accessibility/ColorContrastAnalyzer.ts',
    'src/core/help/HelpManager.ts',
    'src/debug/EnhancedDebugInterface.ts',
    'src/core/help/components/ContentLoader.ts'
];

problematicFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        processFile(filePath);
    }
});

console.log('\nSpecific TypeScript syntax fixes complete!');