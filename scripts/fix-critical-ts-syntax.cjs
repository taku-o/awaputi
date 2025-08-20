#!/usr/bin/env node

/**
 * Critical TypeScript Syntax Fixes
 * Addresses severe syntax errors that prevent TypeScript compilation
 * 
 * Focus: TS1005, TS1128, TS1002 errors
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
            if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
                files.push(...findTypeScriptFiles(fullPath));
            }
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function fixCriticalSyntaxErrors(content) {
    let fixed = false;
    let fixCount = 0;

    // Fix 1: Class declaration with missing body braces
    content = content.replace(
        /^(export\s+class\s+\w+)\s*\{\s*([^\s\}][^}]*?)$/gm,
        (match, classDeclaration, properties) => {
            if (!properties.includes('}')) {
                fixCount++;
                fixed = true;
                return `${classDeclaration} {\n    ${properties}`;
            }
            return match;
        }
    );

    // Fix 2: Fix malformed interface property syntax (missing semicolons)
    content = content.replace(
        /(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*[?]?\s*:\s*[^,;{}\n]+),(\s*})(\s*})/g,
        (match, indent, prop, endBrace1, endBrace2) => {
            fixCount++;
            fixed = true;
            return `${indent}${prop};${endBrace1}${endBrace2}`;
        }
    );

    // Fix 3: Fix object type definitions with missing semicolons in class properties
    content = content.replace(
        /^(\s+private\s+\w+:\s*\{[\s\S]*?)([a-zA-Z_$][a-zA-Z0-9_$]*[?]?\s*:\s*[^,;\n{}]+),(\s*})(\s*};)/gm,
        (match, prefix, prop, closeBrace1, closeBrace2) => {
            fixCount++;
            fixed = true;
            return `${prefix}${prop};${closeBrace1}${closeBrace2}`;
        }
    );

    // Fix 4: Constructor parameter lists with missing closing parentheses
    content = content.replace(
        /constructor\(([^)]*)\)\s*\{\s*([^}]+)$/gm,
        (match, params, body) => {
            // Only fix if the body doesn't end with a closing brace
            if (!body.trim().endsWith('}')) {
                fixCount++;
                fixed = true;
                return `constructor(${params}) {\n        ${body}\n    }`;
            }
            return match;
        }
    );

    // Fix 5: Method definitions with missing return types and bodies
    content = content.replace(
        /^(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*([^)]*)\)\s*\{\s*([^}]*)$/gm,
        (match, indent, methodName, params, body) => {
            if (!body.includes('}')) {
                fixCount++;
                fixed = true;
                return `${indent}${methodName}(${params}) {\n${indent}    ${body}\n${indent}}`;
            }
            return match;
        }
    );

    // Fix 6: Array and object syntax with mismatched brackets
    content = content.replace(/\[\s*([^\]]*)\s*$/gm, (match, content) => {
        if (content.trim() && !content.includes(']')) {
            fixCount++;
            fixed = true;
            return `[${content}]`;
        }
        return match;
    });

    // Fix 7: Function calls with unmatched parentheses
    content = content.replace(/(\w+)\(([^)]*)\s*$/gm, (match, funcName, params) => {
        if (params && !params.includes(')')) {
            fixCount++;
            fixed = true;
            return `${funcName}(${params})`;
        }
        return match;
    });

    // Fix 8: Incomplete string literals
    content = content.replace(/(['"])([^'"]*)\n/g, (match, quote, str) => {
        if (!str.endsWith(quote)) {
            fixCount++;
            fixed = true;
            return `${quote}${str}${quote}\n`;
        }
        return match;
    });

    // Fix 9: Missing semicolons at end of statements
    content = content.replace(/^(\s*)([^;\n{}]+)\s*$/gm, (match, indent, statement) => {
        // Skip lines that are clearly not statements (comments, etc.)
        if (statement.trim() && 
            !statement.trim().startsWith('//') && 
            !statement.trim().startsWith('/*') && 
            !statement.trim().startsWith('*') &&
            !statement.includes('{') &&
            !statement.includes('}') &&
            !statement.endsWith(';') &&
            !statement.endsWith(',')) {
            
            fixCount++;
            fixed = true;
            return `${indent}${statement};`;
        }
        return match;
    });

    // Fix 10: Type annotation syntax errors
    content = content.replace(
        /:\s*([A-Z][a-zA-Z0-9_$<>[\]]*)\s*([,;])\s*([})])/g,
        (match, type, separator, closing) => {
            fixCount++;
            fixed = true;
            return `: ${type}${separator}\n    ${closing}`;
        }
    );

    if (fixCount > 0) {
        console.log(`Applied ${fixCount} critical syntax fixes`);
    }

    return { content, fixed, count: fixCount };
}

function main() {
    const projectRoot = process.cwd();
    const srcDir = path.join(projectRoot, 'src');
    const testDir = path.join(projectRoot, 'test');
    
    console.log('🚑 Critical TypeScript Syntax Error Fixes');
    console.log('==========================================');
    
    let totalFiles = 0;
    let totalFixes = 0;
    let modifiedFiles = 0;

    // Focus on the most problematic files first
    const directories = [srcDir, testDir].filter(dir => fs.existsSync(dir));
    
    for (const dir of directories) {
        console.log(`\nProcessing directory: ${path.relative(projectRoot, dir)}`);
        
        const files = findTypeScriptFiles(dir);
        console.log(`Found ${files.length} TypeScript files`);
        
        for (const file of files) {
            const relativePath = path.relative(projectRoot, file);
            
            try {
                const originalContent = fs.readFileSync(file, 'utf8');
                const result = fixCriticalSyntaxErrors(originalContent);
                
                if (result.fixed) {
                    fs.writeFileSync(file, result.content, 'utf8');
                    console.log(`🔧 Fixed ${result.count} critical issues in ${relativePath}`);
                    totalFixes += result.count;
                    modifiedFiles++;
                }
                
                totalFiles++;
                
            } catch (error) {
                console.error(`❌ Error processing ${relativePath}:`, error.message);
            }
        }
    }
    
    console.log('\n📊 Critical Fixes Summary');
    console.log('=========================');
    console.log(`Total files processed: ${totalFiles}`);
    console.log(`Files modified: ${modifiedFiles}`);
    console.log(`Total critical fixes applied: ${totalFixes}`);
    
    if (totalFixes > 0) {
        console.log('\n🔍 Checking TypeScript compilation...');
        try {
            execSync('npx tsc --noEmit --skipLibCheck', { 
                cwd: projectRoot, 
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            console.log('✅ TypeScript compilation successful!');
        } catch (error) {
            const errorOutput = error.stdout || error.stderr || '';
            const errorCount = (errorOutput.match(/error TS/g) || []).length;
            console.log(`⚠️  ${errorCount} TypeScript errors remaining`);
            
            // Show most common error types
            const lines = errorOutput.split('\n').filter(line => line.includes('error TS'));
            const errorCounts = {};
            
            lines.forEach(line => {
                const match = line.match(/error (TS\d+)/);
                if (match) {
                    errorCounts[match[1]] = (errorCounts[match[1]] || 0) + 1;
                }
            });
            
            const sortedErrors = Object.entries(errorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            if (sortedErrors.length > 0) {
                console.log('\nTop remaining error types:');
                sortedErrors.forEach(([errorType, count]) => {
                    console.log(`  ${errorType}: ${count} occurrences`);
                });
            }
        }
    }
    
    console.log('\n✅ Critical syntax fixes completed');
}

if (require.main === module) {
    main();
}

module.exports = { fixCriticalSyntaxErrors };