#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing object property semicolon issues...');

// オブジェクトプロパティ内のセミコロンをカンマに修正する
function fixObjectPropertySemicolons(content) {
    let fixed = content;
    let modifications = 0;
    
    // Pattern 1: Object property endings with semicolons instead of commas
    // Example: property: value; -> property: value,
    const pattern1 = /(\s+\w+:\s*[^;,\n}]+);(\s*\n)/g;
    fixed = fixed.replace(pattern1, (match, before, after) => {
        modifications++;
        return before + ',' + after;
    });
    
    // Pattern 2: Object literal property assignments with semicolons
    // Example: { prop: value; other: value } -> { prop: value, other: value }
    const pattern2 = /(\{\s*[^}]+?);\s*(\w+:)/g;
    fixed = fixed.replace(pattern2, (match, before, after) => {
        modifications++;
        return before + ', ' + after;
    });
    
    // Pattern 3: TypeScript object type properties with semicolons (should remain as-is in interfaces)
    // But fix in object literals and return statements
    const pattern3 = /(return\s*\{[^}]*?\w+:\s*[^;,\n}]+);(\s*[,\n}])/g;
    fixed = fixed.replace(pattern3, (match, before, after) => {
        modifications++;
        return before + ',' + after;
    });
    
    // Pattern 4: Object method calls with semicolons at end of object properties
    const pattern4 = /(\w+:\s*[^;,\n}]*\([^)]*\));(\s*\n\s*[}\w])/g;
    fixed = fixed.replace(pattern4, (match, before, after) => {
        // Only replace if it's in an object literal context
        if (before.includes('return {') || before.includes('= {') || 
            before.includes(': {') || before.includes('({')) {
            modifications++;
            return before + ',' + after;
        }
        return match;
    });
    
    // Pattern 5: Nested object properties with semicolons
    const pattern5 = /(\s+[\w"']+:\s*[\w"'\[\{][^;,\n}]*);(\s*\n\s*[\w"'}])/g;
    fixed = fixed.replace(pattern5, (match, before, after) => {
        // Don't modify interface/type definitions, class properties, or function signatures
        const beforeContext = content.substring(Math.max(0, content.indexOf(before) - 200), content.indexOf(before));
        if (beforeContext.includes('interface ') || 
            beforeContext.includes('type ') || 
            beforeContext.includes('export interface') ||
            beforeContext.includes('class ') ||
            beforeContext.includes('function ') ||
            beforeContext.includes('(') && !beforeContext.includes('{')) {
            return match;
        }
        modifications++;
        return before + ',' + after;
    });
    
    // Pattern 6: Fix specific object literal closing issues
    // Example: }; at end of object literal should be }
    const pattern6 = /(\}\s*);(\s*[,)\]\n])/g;
    fixed = fixed.replace(pattern6, (match, before, after) => {
        modifications++;
        return before + after;
    });
    
    return { content: fixed, modifications };
}

// ファイル処理関数
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixObjectPropertySemicolons(content);
        
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
        console.log(`✅ ${relativePath}: ${modifications} object property semicolons fixed`);
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
    console.log('\n✅ Object property semicolon fixes completed!');
    console.log('🔍 Run TypeScript compiler to check remaining errors:');
    console.log('   npx tsc --noEmit');
} else {
    console.log('\n📝 No object property semicolon issues were found.');
}