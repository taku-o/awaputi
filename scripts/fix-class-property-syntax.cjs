#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing class property syntax issues...');

// クラスプロパティの構文エラーを修正する
function fixClassPropertySyntax(content) {
    let fixed = content;
    let modifications = 0;
    
    // Pattern 1: Fix class property declarations with incorrect syntax
    // private propertyName: type; -> private propertyName: type;
    // private propertyName: type, -> private propertyName: type;
    const pattern1 = /(private|public|protected)\s+(\w+):\s*([^;,\n]+),(\s*\n)/g;
    fixed = fixed.replace(pattern1, (match, visibility, prop, type, newline) => {
        modifications++;
        return `${visibility} ${prop}: ${type};${newline}`;
    });
    
    // Pattern 2: Fix constructor parameter syntax  
    // constructor(param: type,) -> constructor(param: type)
    const pattern2 = /(constructor\s*\([^)]*),(\s*\))/g;
    fixed = fixed.replace(pattern2, (match, before, after) => {
        modifications++;
        return before + after;
    });
    
    // Pattern 3: Fix method parameter syntax
    // method(param: type,) -> method(param: type)
    const pattern3 = /(\w+\s*\([^)]*),(\s*\))/g;
    fixed = fixed.replace(pattern3, (match, before, after) => {
        modifications++;
        return before + after;
    });
    
    // Pattern 4: Fix missing semicolons in object method calls
    // someMethod() -> someMethod();
    const pattern4 = /(\s+this\.\w+\([^)]*\))(\s*\n\s*[}\w])/g;
    fixed = fixed.replace(pattern4, (match, method, after) => {
        if (!method.endsWith(';')) {
            modifications++;
            return method + ';' + after;
        }
        return match;
    });
    
    // Pattern 5: Fix object literal closing brackets
    // {prop: value}} -> {prop: value}
    const pattern5 = /(\{[^}]+)\}(\s*\})/g;
    fixed = fixed.replace(pattern5, (match, before, after) => {
        modifications++;
        return before + after;
    });
    
    // Pattern 6: Fix array/object access with semicolons
    // array[index]; in return context should be array[index],
    const pattern6 = /(return\s*\{[^}]*?\w+\[[^\]]+\]);(\s*[,\n}])/g;
    fixed = fixed.replace(pattern6, (match, before, after) => {
        modifications++;
        return before.replace(');', ',') + after;
    });
    
    return { content: fixed, modifications };
}

// ファイル処理関数
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixClassPropertySyntax(content);
        
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
        console.log(`✅ ${relativePath}: ${modifications} class property syntax issues fixed`);
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
    console.log('\n✅ Class property syntax fixes completed!');
    console.log('🔍 Run TypeScript compiler to check remaining errors:');
    console.log('   npx tsc --noEmit');
} else {
    console.log('\n📝 No class property syntax issues were found.');
}