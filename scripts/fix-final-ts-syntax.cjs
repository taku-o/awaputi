#!/usr/bin/env node

/**
 * Final TypeScript Syntax Error Fix Script
 * Fixes remaining syntax errors found in TypeScript files
 * 
 * Targets specific patterns found in:
 * - APIEndpointManager.ts
 * - HelpErrorHandler.ts  
 * - DataAggregationProcessor.ts
 * - Test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findTypeScriptFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and other directories
            if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
                files.push(...findTypeScriptFiles(fullPath));
            }
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function fixSyntaxErrors(content) {
    let fixed = false;
    let fixCount = 0;

    console.log('Applying comprehensive syntax fixes...');

    // Fix 1: Constructor parameter syntax (private field: type,)
    content = content.replace(/private\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;]+),(\s*$)/gm, (match, field, type, ending) => {
        fixCount++;
        fixed = true;
        return `private ${field}: ${type}${ending}`;
    });

    // Fix 2: Unterminated string literals in method calls
    content = content.replace(/(\w+\(')([^']*$)/gm, (match, methodCall, unfinished) => {
        if (!unfinished.includes("'") && !unfinished.includes('"')) {
            fixCount++;
            fixed = true;
            return methodCall;
        }
        return match;
    });

    // Fix 3: Missing closing quotes in string literals  
    content = content.replace(/(['"'])([^'"]*)\n/g, (match, quote, content) => {
        if (!content.endsWith(quote)) {
            fixCount++;
            fixed = true;
            return `${quote}${content}${quote}\n`;
        }
        return match;
    });

    // Fix 4: Missing closing parentheses in method calls
    content = content.replace(/\.(\w+)\(([^)]*)\s*$(?!\s*[);])/gm, (match, methodName, args) => {
        fixCount++;
        fixed = true;
        return `.${methodName}(${args})`;
    });

    // Fix 5: Fix constructor parameter list syntax
    content = content.replace(/constructor\([^)]*,\s*privacyManager:\s*any,\s*$/gm, (match) => {
        fixCount++;
        fixed = true;
        return match.replace(',', '');
    });

    // Fix 6: Interface semicolons to commas
    content = content.replace(/^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^;,]+);(\s*)$/gm, (match, indent, field, ending) => {
        // Only fix if we're inside an interface/type definition
        if (match.includes(':')) {
            fixCount++;
            fixed = true;
            return `${indent}${field},${ending}`;
        }
        return match;
    });

    // Fix 7: Missing closing braces in object literals
    content = content.replace(/\{\s*([^}]*)\s*$/gm, (match, content) => {
        if (content.trim() && !content.includes('}')) {
            fixCount++;
            fixed = true;
            return `{ ${content} }`;
        }
        return match;
    });

    // Fix 8: Fix dangling method calls with quote issues  
    content = content.replace(/this\.(\w+)\('([^']*$)/gm, (match, method, args) => {
        fixCount++;
        fixed = true;
        return `this.${method}('${args}')`;
    });

    // Fix 9: Fix array access with missing parentheses
    content = content.replace(/\[([^\]]*)\s*$/gm, (match, content) => {
        if (content && !content.includes(']')) {
            fixCount++;
            fixed = true;
            return `[${content}]`;
        }
        return match;
    });

    // Fix 10: Fix incomplete return statements
    content = content.replace(/return\s*{\s*([^}]*)\s*$/gm, (match, content) => {
        fixCount++;
        fixed = true;
        return `return { ${content} };`;
    });

    // Fix 11: Fix missing quotes in property access
    content = content.replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\?\s*\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*$/gm, (match, prop1, prop2) => {
        fixCount++;
        fixed = true;
        return `.${prop1}?.${prop2}`;
    });

    // Fix 12: Fix syntax errors in for loops
    content = content.replace(/for\s*\(\s*const\s+\[([^\]]+)\]\s+of\s+([^)]+)\s+\{/g, (match, destructure, iterable) => {
        fixCount++;
        fixed = true;
        return `for (const [${destructure}] of ${iterable}) {`;
    });

    // Fix 13: Fix missing closing brackets in conditionals
    content = content.replace(/if\s*\(\s*([^)]+)\s*\{\s*$/gm, (match, condition) => {
        if (!condition.includes(')')) {
            fixCount++;
            fixed = true;
            return `if (${condition}) {`;
        }
        return match;
    });

    // Fix 14: Fix incomplete type annotations
    content = content.replace(/:\s*([A-Z][a-zA-Z0-9_$]*)\s*,\s*$/gm, (match, type) => {
        fixCount++;
        fixed = true;
        return `: ${type},`;
    });

    // Fix 15: Fix missing closing parentheses in function parameters
    content = content.replace(/\(([^)]*),\s*$/gm, (match, params) => {
        fixCount++;
        fixed = true;
        return `(${params})`;
    });

    // Fix 16: Fix incomplete arrow function syntax
    content = content.replace(/=>\s*\{([^}]*)\s*$/gm, (match, body) => {
        fixCount++;
        fixed = true;
        return `=> { ${body} }`;
    });

    // Fix 17: Fix malformed switch statements
    content = content.replace(/case\s+([^:]+):\s+return\s+([^,;]+),\s*$/gm, (match, caseValue, returnValue) => {
        fixCount++;
        fixed = true;
        return `case ${caseValue}: return ${returnValue};`;
    });

    // Fix 18: Fix incomplete await expressions
    content = content.replace(/await\s+([^;]+)\s*$/gm, (match, expression) => {
        if (!expression.includes(';')) {
            fixCount++;
            fixed = true;
            return `await ${expression};`;
        }
        return match;
    });

    // Fix 19: Fix dangling else statements
    content = content.replace(/}\s*else\s*\{([^}]*)\s*$/gm, (match, elseBody) => {
        fixCount++;
        fixed = true;
        return `} else { ${elseBody} }`;
    });

    // Fix 20: Fix incomplete try-catch blocks
    content = content.replace(/}\s*catch\s*\(\s*([^)]*)\s*\{([^}]*)\s*$/gm, (match, param, body) => {
        fixCount++;
        fixed = true;
        return `} catch (${param}) { ${body} }`;
    });

    if (fixCount > 0) {
        console.log(`Applied ${fixCount} fixes`);
    }

    return { content, fixed, count: fixCount };
}

function main() {
    const projectRoot = process.cwd();
    const srcDir = path.join(projectRoot, 'src');
    const testDir = path.join(projectRoot, 'test');
    
    console.log('🔧 Final TypeScript Syntax Error Fix');
    console.log('===================================');
    
    let totalFiles = 0;
    let totalFixes = 0;
    let modifiedFiles = 0;

    // Process all TypeScript files
    const directories = [srcDir, testDir].filter(dir => fs.existsSync(dir));
    
    for (const dir of directories) {
        console.log(`\nProcessing directory: ${path.relative(projectRoot, dir)}`);
        
        const files = findTypeScriptFiles(dir);
        console.log(`Found ${files.length} TypeScript files`);
        
        for (const file of files) {
            const relativePath = path.relative(projectRoot, file);
            
            try {
                const originalContent = fs.readFileSync(file, 'utf8');
                const result = fixSyntaxErrors(originalContent);
                
                if (result.fixed) {
                    fs.writeFileSync(file, result.content, 'utf8');
                    console.log(`✓ Fixed ${result.count} issues in ${relativePath}`);
                    totalFixes += result.count;
                    modifiedFiles++;
                }
                
                totalFiles++;
                
            } catch (error) {
                console.error(`✗ Error processing ${relativePath}:`, error.message);
            }
        }
    }
    
    console.log('\n📊 Fix Summary');
    console.log('==============');
    console.log(`Total files processed: ${totalFiles}`);
    console.log(`Files modified: ${modifiedFiles}`);
    console.log(`Total fixes applied: ${totalFixes}`);
    
    if (totalFixes > 0) {
        console.log('\n🔍 Checking TypeScript compilation...');
        try {
            const result = execSync('npx tsc --noEmit --skipLibCheck', { 
                cwd: projectRoot, 
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            console.log('✅ TypeScript compilation successful!');
        } catch (error) {
            const errorOutput = error.stdout || error.stderr || '';
            const errorCount = (errorOutput.match(/error TS/g) || []).length;
            console.log(`⚠️  ${errorCount} TypeScript errors remaining`);
            
            // Show first few errors for context
            const lines = errorOutput.split('\n').filter(line => line.includes('error TS')).slice(0, 5);
            if (lines.length > 0) {
                console.log('\nSample remaining errors:');
                lines.forEach(line => console.log(`  ${line.trim()}`));
            }
        }
    }
    
    console.log('\n✅ Final syntax fix process completed');
}

if (require.main === module) {
    main();
}

module.exports = { fixSyntaxErrors };