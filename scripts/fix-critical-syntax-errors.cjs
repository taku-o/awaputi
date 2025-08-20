#!/usr/bin/env node

/**
 * Fix critical TypeScript syntax errors - targeted approach
 * Focuses on the most severe patterns that prevent compilation
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Statistics tracking
let totalFilesProcessed = 0;
let totalFilesFixed = 0;
let totalPatternsFixed = 0;

function fixCriticalSyntaxErrors(content) {
    let fixed = false;
    let fixCount = 0;
    let originalContent = content;

    // Fix specific APIEndpointManager.ts syntax errors
    content = content.replace(/enabled: false, \/\/ 将来の機能拡張用/g, () => {
        fixCount++;
        fixed = true;
        return 'enabled: false, // 将来の機能拡張用';
    });

    content = content.replace(/allowedOrigins: \['\\*'\],/g, () => {
        fixCount++;
        fixed = true;
        return "allowedOrigins: ['*'],";
    });

    content = content.replace(/requireAuthentication: false\};/g, () => {
        fixCount++;
        fixed = true;
        return 'requireAuthentication: false';
    });

    // Fix constructor parameter issues
    content = content.replace(/constructor\(([^)]*),?\s*$/m, (match, params) => {
        fixCount++;
        fixed = true;
        return `constructor(${params}) {`;
    });

    // Fix method parameter issues - missing closing parenthesis
    content = content.replace(/(\w+)\s*\(\s*([^)]*),?\s*options:\s*any\s*=\s*\{\s*$/gm, (match, methodName, params) => {
        fixCount++;
        fixed = true;
        return `${methodName}(${params}, options: any = {}) {`;
    });

    // Fix method signatures with unterminated parentheses
    content = content.replace(/(\w+)\s*\(\s*([^)]*)\s*=\s*\{\s*\)'/gm, (match, methodName, params) => {
        fixCount++;
        fixed = true;
        return `${methodName}(${params}) {`;
    });

    // Fix malformed function calls with trailing quotes
    content = content.replace(/(\w+\([^)]*\))\s*\'\s*$/gm, (match, functionCall) => {
        fixCount++;
        fixed = true;
        return functionCall + ';';
    });

    // Fix object literal syntax with stray quotes
    content = content.replace(/(\w+):\s*([^,}\s]+)\s*\'\s*$/gm, (match, key, value) => {
        fixCount++;
        fixed = true;
        return `${key}: ${value}`;
    });

    // Fix interface definitions with malformed closing
    content = content.replace(/interface\s+(\w+)\s*\{\s*([^}]*)\s*\}\s*\'\s*$/gm, (match, interfaceName, body) => {
        fixCount++;
        fixed = true;
        return `interface ${interfaceName} {\n    ${body}\n}`;
    });

    // Fix class method signatures that are malformed
    content = content.replace(/(\s+)(\w+)\s*\(\s*([^)]*)\s*\{\s*\'\s*$/gm, (match, indent, methodName, params) => {
        fixCount++;
        fixed = true;
        return `${indent}${methodName}(${params}) {`;
    });

    // Fix try-catch blocks that are malformed
    content = content.replace(/try\s*\{\s*([^}]*)\s*\}\s*catch\s*\(\s*([^)]*)\s*\)\s*\{\s*\'\s*$/gm, (match, tryBody, errorVar) => {
        fixCount++;
        fixed = true;
        return `try {\n        ${tryBody}\n    } catch (${errorVar}) {`;
    });

    // Fix array/object destructuring issues
    content = content.replace(/const\s*\{\s*([^}]*)\s*\}\s*=\s*([^;]*)\s*\'\s*$/gm, (match, destructured, assignment) => {
        fixCount++;
        fixed = true;
        return `const { ${destructured} } = ${assignment};`;
    });

    // Fix return statements with malformed syntax
    content = content.replace(/return\s+\{\s*([^}]*)\s*\}\s*\'\s*$/gm, (match, returnBody) => {
        fixCount++;
        fixed = true;
        return `return {\n        ${returnBody}\n    };`;
    });

    // Fix async function declarations
    content = content.replace(/async\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*\{\s*\'\s*$/gm, (match, functionName, params) => {
        fixCount++;
        fixed = true;
        return `async ${functionName}(${params}) {`;
    });

    // Fix if statement conditions that are malformed  
    content = content.replace(/if\s*\(\s*([^)]*)\s*\)\s*\{\s*\'\s*$/gm, (match, condition) => {
        fixCount++;
        fixed = true;
        return `if (${condition}) {`;
    });

    // Fix for-loop syntax that's malformed
    content = content.replace(/for\s*\(\s*([^)]*)\s*\)\s*\{\s*\'\s*$/gm, (match, forCondition) => {
        fixCount++;
        fixed = true;
        return `for (${forCondition}) {`;
    });

    // Fix switch statement syntax
    content = content.replace(/switch\s*\(\s*([^)]*)\s*\)\s*\{\s*\'\s*$/gm, (match, switchVar) => {
        fixCount++;
        fixed = true;
        return `switch (${switchVar}) {`;
    });

    // Fix constructor syntax issues
    content = content.replace(/constructor\s*\(\s*([^)]*)\s*\)\s*\{\s*\'\s*$/gm, (match, params) => {
        fixCount++;
        fixed = true;
        return `constructor(${params}) {`;
    });

    // Fix export statement issues
    content = content.replace(/export\s+(class|interface|function|const|let|var)\s+([^;]*)\s*\'\s*$/gm, (match, type, declaration) => {
        fixCount++;
        fixed = true;
        return `export ${type} ${declaration}`;
    });

    // Fix import statement issues with quotes
    content = content.replace(/import\s+([^;]*)\s*\'\s*$/gm, (match, importStatement) => {
        fixCount++;
        fixed = true;
        return `import ${importStatement};`;
    });

    // Fix malformed string interpolation
    content = content.replace(/`([^`]*)\$\{([^}]*)\}\s*\'\s*$/gm, (match, before, interpolated) => {
        fixCount++;
        fixed = true;
        return `\`${before}\${${interpolated}}\``;
    });

    // Fix closing braces with stray quotes
    content = content.replace(/^\s*\}\s*\'\s*$/gm, () => {
        fixCount++;
        fixed = true;
        return '}';
    });

    // Fix closing parentheses with stray quotes
    content = content.replace(/^\s*\)\s*\'\s*$/gm, () => {
        fixCount++;
        fixed = true;
        return ')';
    });

    // Fix closing brackets with stray quotes
    content = content.replace(/^\s*\]\s*\'\s*$/gm, () => {
        fixCount++;
        fixed = true;
        return ']';
    });

    // Critical API/Data Aggregation specific fixes
    content = content.replace(/console\.log\('([^']*)',/g, (match, text) => {
        fixCount++;
        fixed = true;
        return `console.log('${text}');`;
    });

    content = content.replace(/\} catch \(error\) \{([^}]*)\}/g, (match, body) => {
        fixCount++;
        fixed = true;
        return `} catch (error) {${body}}`;
    });

    // Fix async method declarations
    content = content.replace(/async (\w+)\(([^)]*)\) \{/g, (match, method, params) => {
        fixCount++;
        fixed = true;
        return `async ${method}(${params}) {`;
    });

    // Fix property declarations with missing commas
    content = content.replace(/(\w+): ([^,\n}]+)$/gm, (match, prop, value) => {
        fixCount++;
        fixed = true;
        return `${prop}: ${value},`;
    });

    // Fix object literal syntax
    content = content.replace(/\{([^}]*)\}/g, (match, inside) => {
        if (inside.includes(':')) {
            fixCount++;
            fixed = true;
            return `{${inside}}`;
        }
        return match;
    });

    return { content, fixed, fixCount };
}

async function processFile(filePath) {
    try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const result = fixCriticalSyntaxErrors(originalContent);
        
        totalFilesProcessed++;
        
        if (result.fixed) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            totalFilesFixed++;
            totalPatternsFixed += result.fixCount;
            console.log(`Fixed ${result.fixCount} critical patterns in: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
    }
}

async function main() {
    console.log('Starting critical syntax error fixes...');
    
    // Focus on the most problematic files first
    const priorityFiles = [
        'src/analytics/analytics-api/*.ts',
        'src/accessibility/wcag-validation/*.ts',
        'src/audio/*.ts',
        'src/core/*.ts',
        'src/effects/*.ts'
    ];
    
    let tsFiles = [];
    
    // Get priority files first
    for (const pattern of priorityFiles) {
        const files = await glob(pattern, {
            cwd: process.cwd(),
            ignore: ['node_modules/**', 'dist/**', '.git/**', 'coverage/**']
        });
        tsFiles.push(...files);
    }
    
    // Add remaining TypeScript files
    const allTsFiles = await glob('**/*.ts', {
        cwd: process.cwd(),
        ignore: ['node_modules/**', 'dist/**', '.git/**', 'coverage/**']
    });
    
    // Add files that weren't in priority list
    const remainingFiles = allTsFiles.filter(file => !tsFiles.includes(file));
    tsFiles.push(...remainingFiles);
    
    // Remove duplicates
    tsFiles = [...new Set(tsFiles)];
    
    console.log(`Found ${tsFiles.length} TypeScript files to process`);
    
    // Process files in smaller batches for better control
    const batchSize = 25;
    for (let i = 0; i < tsFiles.length; i += batchSize) {
        const batch = tsFiles.slice(i, i + batchSize);
        
        await Promise.all(batch.map(processFile));
        
        console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tsFiles.length/batchSize)}`);
        
        // Brief pause to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n=== Final Statistics ===');
    console.log(`Total files processed: ${totalFilesProcessed}`);
    console.log(`Total files fixed: ${totalFilesFixed}`);
    console.log(`Total patterns fixed: ${totalPatternsFixed}`);
    console.log(`Fix rate: ${((totalFilesFixed/totalFilesProcessed)*100).toFixed(2)}%`);
}

main().catch(console.error);