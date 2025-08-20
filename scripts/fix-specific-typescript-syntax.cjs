#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing specific TypeScript syntax issues...');

// TypeScript固有の構文エラーを修正する
function fixSpecificTypeScriptSyntax(content) {
    let fixed = content;
    let modifications = 0;
    
    // Pattern 1: Fix misplaced closing braces
    // }; -> }
    const pattern1 = /(\}\s*);(\s*\n)/g;
    fixed = fixed.replace(pattern1, (match, before, after) => {
        modifications++;
        return before + after;
    });
    
    // Pattern 2: Fix missing closing braces in try-catch blocks
    // } catch (error) { -> }} catch (error) {
    const pattern2 = /(\s+)\} catch \(error\) \{/g;
    fixed = fixed.replace(pattern2, (match, whitespace) => {
        modifications++;
        return whitespace + '}} catch (error) {';
    });
    
    // Pattern 3: Fix malformed constructor syntax
    // constructor(...,) -> constructor(...)
    const pattern3 = /(constructor\s*\([^)]*),(\s*\))/g;
    fixed = fixed.replace(pattern3, (match, before, after) => {
        modifications++;
        return before + after;
    });
    
    // Pattern 4: Fix malformed method parameters  
    // method(...,) -> method(...)
    const pattern4 = /(\w+\s*\([^)]*),(\s*\))/g;
    fixed = fixed.replace(pattern4, (match, before, after) => {
        modifications++;
        return before + after;
    });
    
    // Pattern 5: Fix malformed interface properties
    // property: type, -> property: type;
    const pattern5 = /(interface\s+\w+\s*\{[^}]*?\w+:\s*[^;,\n}]+),(\s*\n)/g;
    fixed = fixed.replace(pattern5, (match, before, after) => {
        modifications++;
        return before.replace(',', ';') + after;
    });
    
    // Pattern 6: Fix malformed object destructuring
    // const { prop = {} -> const { prop } = {}
    const pattern6 = /(const\s*\{\s*\w+\s*=\s*\{\})/g;
    fixed = fixed.replace(pattern6, (match, destructure) => {
        modifications++;
        return destructure.replace('= {}', '} = {}');
    });
    
    // Pattern 7: Fix missing closing brackets in array destructuring
    // const [a, b = []; -> const [a, b] = [];
    const pattern7 = /(const\s*\[\s*[^\]]*)\s*=\s*\[\s*\];/g;
    fixed = fixed.replace(pattern7, (match, before) => {
        if (!before.includes(']')) {
            modifications++;
            return before + '] = [];';
        }
        return match;
    });
    
    // Pattern 8: Fix misplaced semicolons in export statements
    // export { something }; -> export { something };
    const pattern8 = /(export\s*\{[^}]*\})\s*;/g;
    fixed = fixed.replace(pattern8, (match, before) => {
        if (!before.endsWith(';')) {
            modifications++;
            return before + ';';
        }
        return match;
    });
    
    // Pattern 9: Fix broken method calls
    // someMethod(); -> someMethod();
    const pattern9 = /(\w+\s*\([^)]*\))\s*;/g;
    fixed = fixed.replace(pattern9, (match, method) => {
        // This is actually already correct, but let's check for broken calls
        return match;
    });
    
    // Pattern 10: Fix malformed return statements
    // return { prop: value; } -> return { prop: value };
    const pattern10 = /(return\s*\{[^}]*);(\s*\})/g;
    fixed = fixed.replace(pattern10, (match, before, after) => {
        modifications++;
        return before.replace(';', '') + after;
    });
    
    return { content: fixed, modifications };
}

// ファイル処理関数
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixSpecificTypeScriptSyntax(content);
        
        if (result.modifications > 0) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            return result.modifications;
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
let totalModifications = 0;

console.log('🔧 Processing files...');

for (const file of allFiles) {
    const relativePath = path.relative('.', file);
    const modifications = processFile(file);
    
    totalProcessed++;
    
    if (modifications > 0) {
        totalModified++;
        totalModifications += modifications;
        console.log(`✅ ${relativePath}: ${modifications} specific TypeScript syntax issues fixed`);
    }
    
    // Progress indicator
    if (totalProcessed % 100 === 0) {
        console.log(`⏳ Progress: ${totalProcessed}/${allFiles.length} files processed`);
    }
}

console.log('\n📊 Summary:');
console.log(`📝 Files processed: ${totalProcessed}`);
console.log(`🔧 Files modified: ${totalModified}`);
console.log(`🔄 Total modifications: ${totalModifications}`);
console.log(`📈 Modification rate: ${(totalModified/totalProcessed*100).toFixed(1)}%`);

if (totalModifications > 0) {
    console.log('\n✅ Specific TypeScript syntax fixes completed!');
    console.log('🔍 Run TypeScript compiler to check remaining errors:');
    console.log('   npx tsc --noEmit');
} else {
    console.log('\n📝 No specific TypeScript syntax issues were found.');
}