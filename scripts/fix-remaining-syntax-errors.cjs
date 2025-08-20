#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining TypeScript syntax errors...');

// パターン別修正関数
const fixPatterns = [
    // Import statement errors
    {
        description: 'Fix import statement quote errors',
        pattern: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)\.ts['"]\s*['"]/g,
        replacement: "import { $1 } from '$2.ts';"
    },
    {
        description: 'Fix import statement missing semicolon',
        pattern: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)\.ts['"]\s*$/gm,
        replacement: "import { $1 } from '$2.ts';"
    },
    {
        description: 'Fix import statement with semicolon issue',
        pattern: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)\.ts;/g,
        replacement: "import { $1 } from '$2.ts';"
    },
    
    // Constructor and method parameter errors
    {
        description: 'Fix constructor parameter syntax',
        pattern: /constructor\s*\([^)]*\)\s*\{\s*$/gm,
        replacement: function(match) {
            // Handle constructor parameter list properly
            return match.replace(/,\s*\)/g, ')');
        }
    },
    {
        description: 'Fix trailing comma in function parameters',
        pattern: /\([^)]*,\s*\)\s*\{/g,
        replacement: function(match) {
            return match.replace(',)', ')');
        }
    },
    
    // Object literal syntax errors
    {
        description: 'Fix object literal brace syntax',
        pattern: /\{\s*;/g,
        replacement: '{'
    },
    {
        description: 'Fix object literal closing brace',
        pattern: /;\s*\}/g,
        replacement: '}'
    },
    {
        description: 'Fix misplaced comma in object literal',
        pattern: /,\s*\}\s*,\s*\}/g,
        replacement: '}}'
    },
    {
        description: 'Fix comma after closing parenthesis',
        pattern: /,\s*\)\s*;/g,
        replacement: ');'
    },
    
    // String template literal errors
    {
        description: 'Fix template literal with single quotes',
        pattern: /result\[`([^`]*)\`\]/g,
        replacement: "result[`$1`]"
    },
    {
        description: 'Fix escaped template literals in strings',
        pattern: /\\`([^`]*)\\`/g,
        replacement: "`$1`"
    },
    
    // Method call syntax errors
    {
        description: 'Fix method call with extra comma',
        pattern: /\.\w+\([^)]*,\s*\)\s*;/g,
        replacement: function(match) {
            return match.replace(',)', ')');
        }
    },
    
    // Property declaration errors
    {
        description: 'Fix property declarations with wrong syntax',
        pattern: /private\s+(\w+):\s*([^;,}]+)\s*,$/gm,
        replacement: 'private $1: $2;'
    },
    {
        description: 'Fix property declarations with semicolon after comma',
        pattern: /private\s+(\w+):\s*([^;,}]+)\s*,\s*$/gm,
        replacement: 'private $1: $2;'
    },
    
    // Try-catch block syntax errors
    {
        description: 'Fix try-catch block formatting',
        pattern: /\}\s*catch\s*\([^)]*\)\s*\{\s*$/gm,
        replacement: function(match) {
            return match.replace(/\}\s*catch/, '} catch');
        }
    },
    
    // Return statement errors
    {
        description: 'Fix return statement syntax',
        pattern: /return\s*\{\s*success:\s*false\s*\}\s*;\s*error:\s*([^}]+)\s*\}\s*,\s*\}/g,
        replacement: 'return { success: false, error: $1 };'
    },
    {
        description: 'Fix return statement with wrong brace placement',
        pattern: /return\s*\{\s*([^}]*)\s*\}\s*;\s*([^}]*)\s*\}\s*;/g,
        replacement: 'return { $1, $2 };'
    },
    
    // If statement and condition errors
    {
        description: 'Fix if statement syntax',
        pattern: /if\s*\([^)]*\)\s*\{\s*\}\s*$/gm,
        replacement: function(match) {
            return match.replace(/\{\s*\}/, '{\n        return;\n    }');
        }
    },
    
    // Misc syntax fixes
    {
        description: 'Fix extra semicolon after closing brace',
        pattern: /\}\s*;\s*;/g,
        replacement: '};'
    },
    {
        description: 'Fix double closing parentheses',
        pattern: /\)\s*\)\s*;/g,
        replacement: ');'
    },
    {
        description: 'Fix quotes inside string literals',
        pattern: /['"]([^'"]*)['"]\s*['"]/g,
        replacement: "'$1'"
    }
];

// ファイル処理関数
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let fixCount = 0;

        // 各パターンを適用
        fixPatterns.forEach((fix) => {
            const beforeLength = content.length;
            
            if (typeof fix.replacement === 'function') {
                content = content.replace(fix.pattern, fix.replacement);
            } else {
                content = content.replace(fix.pattern, fix.replacement);
            }
            
            if (content.length !== beforeLength) {
                modified = true;
                fixCount++;
            }
        });

        // 特定の追加修正
        // 不正な構文パターンの修正
        const additionalFixes = [
            // Constructor parameter issues
            [/constructor\s*\([^)]*,\s*\)\s*\{/g, (match) => match.replace(',)', ')')],
            // Object literal issues
            [/\{\s*([^}]*)\s*\}\s*,\s*\}/g, '{ $1 }'],
            // Method parameter issues
            [/async\s+(\w+)\s*\([^)]*,\s*\)\s*\{/g, (match) => match.replace(',)', ')')],
            // Property initialization issues
            [/:\s*([^;,}]+)\s*,\s*$/gm, ': $1;'],
            // String literal issues
            [/['"]\s*['"]/g, "'"],
            // Template literal fixes
            [/\$\{([^}]*)\}\}/g, '${$1}']
        ];

        additionalFixes.forEach(([pattern, replacement]) => {
            const beforeLength = content.length;
            
            if (typeof replacement === 'function') {
                content = content.replace(pattern, replacement);
            } else {
                content = content.replace(pattern, replacement);
            }
            
            if (content.length !== beforeLength) {
                modified = true;
                fixCount++;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            return fixCount;
        }
        
        return 0;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

// TypeScriptファイルを再帰的に検索
function findTsFiles(dir) {
    const files = [];
    
    function scanDir(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // node_modules等を除外
                    if (!item.startsWith('.') && item !== 'node_modules') {
                        scanDir(fullPath);
                    }
                } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${currentDir}:`, error.message);
        }
    }
    
    scanDir(dir);
    return files;
}

// メイン実行
const srcDir = './src';
const testDir = './test';

console.log('🔍 Scanning for TypeScript files...');

const allFiles = [
    ...findTsFiles(srcDir),
    ...findTsFiles(testDir)
];

console.log(`📁 Found ${allFiles.length} TypeScript files`);

let totalProcessed = 0;
let totalModified = 0;
let totalFixes = 0;

console.log('🔧 Processing files...');

for (const file of allFiles) {
    const relativePath = path.relative('.', file);
    const fixCount = processFile(file);
    
    totalProcessed++;
    
    if (fixCount > 0) {
        totalModified++;
        totalFixes += fixCount;
        console.log(`✅ ${relativePath}: ${fixCount} fixes applied`);
    }
    
    // Progress indicator
    if (totalProcessed % 100 === 0) {
        console.log(`⏳ Progress: ${totalProcessed}/${allFiles.length} files processed`);
    }
}

console.log('\n📊 Summary:');
console.log(`📝 Files processed: ${totalProcessed}`);
console.log(`🔧 Files modified: ${totalModified}`);
console.log(`✅ Total fixes applied: ${totalFixes}`);
console.log(`📈 Modification rate: ${(totalModified/totalProcessed*100).toFixed(1)}%`);

if (totalModified > 0) {
    console.log('\n✅ Remaining syntax error fixes completed!');
    console.log('🔍 Run TypeScript compiler to check remaining errors:');
    console.log('   npx tsc --noEmit');
} else {
    console.log('\n📝 No additional syntax fixes were needed.');
}