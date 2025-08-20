#\!/usr/bin/env node

/**
 * 包括的構文エラー修正スクリプト
 * TypeScript移行での複雑な構文エラーを系統的に修正
 */

const fs = require('fs');
const path = require('path');

function findTSFiles(dir) {
    let tsFiles = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && \!file.startsWith('.') && file \!== 'node_modules') {
            tsFiles = tsFiles.concat(findTSFiles(fullPath));
        } else if (file.endsWith('.ts') && \!file.endsWith('.d.ts')) {
            tsFiles.push(fullPath);
        }
    }
    
    return tsFiles;
}

function fixComprehensiveSyntax(content) {
    let fixed = false;
    let fixCount = 0;
    const originalContent = content;
    
    // Fix 1: Method parameter default value syntax
    content = content.replace(
        /\(\s*([^)]*),\s*(\w+):\s*any\s*=\s*\{\s*\)\s*\{/g,
        '($1, $2: any = {}) {'
    );
    
    // Fix 2: Object property ending fixes  
    content = content.replace(
        /(\w+):\s*([^;,}]+)\s*;\s*\}/g,
        '$1: $2\n    }'
    );
    
    // Fix 3: Try-catch block fixes
    content = content.replace(
        /try\s*\{\s*['"](.*?)['"]\s*\}/g,
        'try {\n            // $1'
    );
    
    // Fix 4: String literal concatenation fixes
    content = content.replace(
        /['"]{2,}/g,
        "'"
    );
    
    // Fix 5: Conditional statement structure fixes
    content = content.replace(
        /if\s*\(([^)]+)\)\s*\{\s*\}\s*([^;]+);\s*\}\s*\}/g,
        'if ($1) {\n            $2;\n        }'
    );
    
    if (content \!== originalContent) {
        fixed = true;
        fixCount = 1;
        console.log(`Fixed comprehensive syntax issues`);
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
    
    let filesChanged = 0;
    
    console.log(`Processing ${allFiles.length} TypeScript files...`);
    
    for (const filePath of allFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const result = fixComprehensiveSyntax(content);
            
            if (result.fixed) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                filesChanged++;
                console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log(`\nComprehensive syntax fix complete:`);
    console.log(`- Files processed: ${allFiles.length}`);
    console.log(`- Files changed: ${filesChanged}`);
}

if (require.main === module) {
    main();
}
EOF < /dev/null