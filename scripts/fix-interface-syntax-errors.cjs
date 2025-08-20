#!/usr/bin/env node

/**
 * インターフェース・型定義の構文エラー修正スクリプト
 * TypeScript移行でよくある構文エラーパターンを修正
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

function fixInterfaceSyntax(content) {
    let fixed = false;
    let fixCount = 0;
    
    // Fix 1: Interface property separators - semicolon where comma needed
    content = content.replace(
        /^(\s*export\s+interface\s+\w+\s*\{[^}]*?)([a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+);(\s*[a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+)/gm,
        (match, prefix, prop1, prop2) => {
            if (!prop1.includes('{') && !prop1.includes('(')) {
                fixCount++;
                fixed = true;
                return `${prefix}${prop1},${prop2}`;
            }
            return match;
        }
    );
    
    // Fix 2: Interface closing brace issues - missing brace before closing
    content = content.replace(
        /^(\s*export\s+interface\s+\w+\s*\{[^}]*?)([a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+)\s*\}\s*$/gm,
        (match, prefix, lastProp) => {
            if (!lastProp.endsWith(';') && !lastProp.endsWith(',')) {
                fixCount++;
                fixed = true;
                return `${prefix}${lastProp};\n}`;
            }
            return match;
        }
    );
    
    // Fix 3: Property type ending with closing brace
    content = content.replace(
        /^(\s*)([a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+)\s*\}\s*$/gm,
        '$1$2;\n}'
    );
    
    // Fix 4: Missing semicolons in interface properties
    content = content.replace(
        /^(\s*)([a-zA-Z_$][\w$]*\s*\?\s*:\s*[^;,}\n]+)\s*$/gm,
        '$1$2;'
    );
    
    // Fix 5: Comma instead of semicolon at end of interface property
    content = content.replace(
        /^(\s*)([a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+),\s*\}\s*$/gm,
        '$1$2;\n}'
    );
    
    // Fix 6: Type definition syntax errors - missing semicolon before closing brace
    content = content.replace(
        /(\}\s*\})\s*$/gm,
        '};\n}'
    );
    
    // Fix 7: Object type property separators
    content = content.replace(
        /^(\s*private\s+\w+:\s*\{[^}]*?)([a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+);(\s*[a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+)/gm,
        (match, prefix, prop1, prop2) => {
            if (!prop1.includes('{') && !prop1.includes('(')) {
                fixCount++;
                fixed = true;
                return `${prefix}${prop1},${prop2}`;
            }
            return match;
        }
    );
    
    // Fix 8: Missing closing brace in object types
    content = content.replace(
        /^(\s*private\s+\w+:\s*\{[^}]*?)([a-zA-Z_$][\w$]*\s*:\s*[^;,}\n]+)\s*\}\s*$/gm,
        (match, prefix, lastProp) => {
            if (!lastProp.endsWith(';') && !lastProp.endsWith(',')) {
                fixCount++;
                fixed = true;
                return `${prefix}${lastProp};\n    };`;
            }
            return match;
        }
    );
    
    // Fix 9: Constructor parameter syntax
    content = content.replace(
        /constructor\(([^)]*?),\s*([^)]*?)\s*=\s*null\)\s*\{/g,
        'constructor($1, $2 = null) {'
    );
    
    // Fix 10: Method parameter default values
    content = content.replace(
        /async\s+(\w+)\(([^)]*?),\s*(\w+):\s*any\s*=\s*\{\s*\)\s*\{/g,
        'async $1($2, $3: any = {}) {'
    );
    
    if (fixCount > 0) {
        console.log(`Fixed ${fixCount} interface/type syntax issues`);
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
            const result = fixInterfaceSyntax(content);
            
            if (result.fixed) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                filesChanged++;
                console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log(`\nInterface syntax fix complete:`);
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