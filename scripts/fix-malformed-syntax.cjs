#!/usr/bin/env node

/**
 * 不正な構文修正スクリプト
 * 前回の修正で生じた構文エラーを修正
 */

const fs = require('fs');
const path = require('path');

function findTSFiles(dir) {
    let tsFiles = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            tsFiles = tsFiles.concat(findTSFiles(fullPath));
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            tsFiles.push(fullPath);
        }
    }
    
    return tsFiles;
}

function fixMalformedSyntax(content) {
    let fixed = false;
    let fixCount = 0;
    
    // Fix 1: Interfaces with broken structure
    content = content.replace(
        /export interface (\w+) \{\s*timeRange\?\s*:\s*\{\s*start:\s*Date,\s*end:\s*Date\s*;\s*\}\s*filters\?\s*:/gm,
        (match, interfaceName) => {
            fixCount++;
            fixed = true;
            return `export interface ${interfaceName} {\n    timeRange?: { start: Date; end: Date };\n    filters?:`;
        }
    );
    
    // Fix 2: Interface properties with wrong ending
    content = content.replace(
        /^\s*timestamp:\s*number;\s*\};\s*\}$/gm,
        '    timestamp: number;\n}'
    );
    
    // Fix 3: Class property definitions with wrong syntax
    content = content.replace(
        /private (\w+):\s*\{[^}]*?\}\s*\};$/gm,
        (match, propName) => {
            fixCount++;
            fixed = true;
            // Extract the content and fix it
            const cleanContent = match.replace(/\s*\};\s*$/, '\n    };');
            return cleanContent;
        }
    );
    
    // Fix 4: Constructor parameters
    content = content.replace(
        /constructor\(([^)]*?),\s*([^)=]*?)\s*=\s*null\)\s*\{/g,
        'constructor($1, $2 = null) {'
    );
    
    // Fix 5: Object literal ending fixes
    content = content.replace(
        /(\w+):\s*([^;,}]+)\s*;\s*\}\s*\}/gm,
        '$1: $2\n        };\n    }'
    );
    
    // Fix 6: Method parameter syntax
    content = content.replace(
        /async\s+(\w+)\(([^)]*?),\s*(\w+):\s*any\s*=\s*\{\s*\)\s*/g,
        'async $1($2, $3: any = {}) '
    );
    
    // Fix 7: Wrong method parameter default values
    content = content.replace(
        /\(\w+:\s*any\s*=\s*\{\s*\)\s*\{/g,
        '(options: any = {}) {'
    );
    
    // Fix 8: Broken function calls and return statements
    content = content.replace(
        /try\s*\{\s*['"](.*?)['"]\s*\}\s*console/g,
        'try {\n            $1\n            console'
    );
    
    // Fix 9: Fix string literal issues
    content = content.replace(
        /['"]{2,}/g,
        "'"
    );
    
    // Fix 10: Fix method closing
    content = content.replace(
        /\}\s*\}\s*$/gm,
        '    }\n}'
    );
    
    // Fix 11: Fix property accessor issues
    content = content.replace(
        /return Array\.from\(this\.(\w+)\.keys\(\s*;\s*\}\s*\}/g,
        'return Array.from(this.$1.keys());\n    }'
    );
    
    // Fix 12: Fix template literal issues
    content = content.replace(
        /return `(\w+)_\$\{Date\.now\(\}\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2,\s*(\d+)\}\)\}`;/g,
        'return `$1_${Date.now()}_${Math.random().toString(36).substr(2, $2)}`;'
    );
    
    // Fix 13: Fix conditional statements
    content = content.replace(
        /if\s*\(([^)]+)\)\s*\{\s*\}\s*([^;]+);\s*\}\s*\}/gm,
        'if ($1) {\n            $2;\n        }'
    );
    
    // Fix 14: Fix object property syntax
    content = content.replace(
        /(\w+):\s*([^;,}]+)\s*;\s*\}/gm,
        '$1: $2\n        }'
    );
    
    if (fixCount > 0) {
        console.log(`Fixed ${fixCount} malformed syntax issues`);
    }
    
    return { content, fixed };
}

function main() {
    const srcDir = path.join(process.cwd(), 'src');
    const testDir = path.join(process.cwd(), 'test');
    
    const allFiles = [
        ...findTSFiles(srcDir),
        ...findTSFiles(testDir)
    ];
    
    let totalFixed = 0;
    let filesChanged = 0;
    
    console.log(`Processing ${allFiles.length} TypeScript files...`);
    
    for (const filePath of allFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const result = fixMalformedSyntax(content);
            
            if (result.fixed) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                filesChanged++;
                console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log(`\nMalformed syntax fix complete:`);
    console.log(`- Files processed: ${allFiles.length}`);
    console.log(`- Files changed: ${filesChanged}`);
    
    // Check remaining errors
    console.log('\nChecking remaining TypeScript errors...');
    const { execSync } = require('child_process');
    try {
        const result = execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | wc -l', 
                              { encoding: 'utf8', stdio: 'pipe' });
        const errorCount = parseInt(result.trim());
        console.log(`Remaining TypeScript errors: ${errorCount}`);
    } catch (error) {
        console.log('Could not count remaining errors');
    }
}

if (require.main === module) {
    main();
}