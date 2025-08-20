#!/usr/bin/env node

/**
 * メソッドパラメータ構文修正スクリプト
 * よくあるメソッド定義のパラメータ構文エラーを一括修正
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

function fixMethodParameterSyntax(content) {
    let fixed = false;
    let fixCount = 0;
    
    // Fix 1: Method parameters with incomplete object default values
    const originalContent = content;
    content = content.replace(
        /(\w+)\(([^)]*),\s*(\w+):\s*any\s*=\s*\{\s*\)\s*\{/g,
        (match, methodName, params, paramName) => {
            fixCount++;
            fixed = true;
            const cleanParams = params ? params + ', ' : '';
            return `${methodName}(${cleanParams}${paramName}: any = {}) {`;
        }
    );
    
    // Fix 2: Object destructuring with trailing issues
    content = content.replace(
        /const\s*\{\s*([^}]+)\s*\}\s*\}\s*=/g,
        (match, destructure) => {
            fixCount++;
            fixed = true;
            return `const { ${destructure.trim()} } =`;
        }
    );
    
    // Fix 3: Object property comma/semicolon issues
    content = content.replace(
        /(\w+)\s*=\s*([^,}]+),\s*\}/g,
        '$1 = $2 }'
    );
    
    // Fix 4: Method call with malformed object parameters
    content = content.replace(
        /\.(\w+)\(([^)]+),\s*\{\s*\)\s*\{/g,
        '.$1($2, {}) {'
    );
    
    // Fix 5: Return statement with object syntax issues
    content = content.replace(
        /return\s+this\.createSuccessResponse\(([^,)]+),\s*\{\s*\)\s*$/gm,
        'return this.createSuccessResponse($1, {})'
    );
    
    // Fix 6: Constructor parameter fixes
    content = content.replace(
        /constructor\(([^)]+)\)\s*\{\s*\}\s*this/g,
        'constructor($1) {\n        this'
    );
    
    // Fix 7: Async method parameter fixes
    content = content.replace(
        /async\s+(\w+)\(([^)]*),\s*(\w+):\s*any\s*=\s*\{\s*\)/g,
        'async $1($2, $3: any = {})'
    );
    
    if (content !== originalContent) {
        console.log(`Fixed ${fixCount || 1} method parameter syntax issues`);
        return { content, fixed: true };
    }
    
    return { content, fixed: false };
}

function main() {
    const srcDir = path.join(process.cwd(), 'src');
    const testDir = path.join(process.cwd(), 'test');
    
    const allFiles = [
        ...findTSFiles(srcDir),
        ...findTSFiles(testDir)
    ];
    
    let filesChanged = 0;
    
    console.log(`Processing ${allFiles.length} TypeScript files...`);
    
    for (const filePath of allFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const result = fixMethodParameterSyntax(content);
            
            if (result.fixed) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                filesChanged++;
                console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log(`\nMethod parameter syntax fix complete:`);
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