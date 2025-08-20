#!/usr/bin/env node

/**
 * Fix malformed method signatures and remaining syntax issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files
function getAllTsFiles() {
    try {
        const result = execSync('find src test -name "*.ts" -not -path "*/node_modules/*"', { 
            encoding: 'utf8',
            cwd: process.cwd()
        });
        return result.trim().split('\n').filter(Boolean);
    } catch (error) {
        console.error('Error finding TypeScript files:', error.message);
        return [];
    }
}

// Fix malformed method signatures and syntax issues
function fixMethodSignatures(content) {
    let fixed = false;
    let fixCount = 0;

    // Fix malformed method definition pattern: methodName('');
    content = content.replace(/(\w+)\(''\)\s*;/g, (match, methodName) => {
        fixCount++;
        fixed = true;
        return `${methodName}() {`;
    });

    // Fix malformed method definition with comment patterns
    content = content.replace(/\/\*\*\s*\*\s*([^*]+)'\s*\*\/'/g, (match, comment) => {
        fixCount++;
        fixed = true;
        return `/**
     * ${comment}
     */`;
    });

    // Fix comment patterns followed by malformed method signatures
    content = content.replace(/\*\/'\s*(\w+)\(''\)';/g, (match, methodName) => {
        fixCount++;
        fixed = true;
        return `*/
    ${methodName}() {`;
    });

    // Fix async method parameters with trailing single quotes
    content = content.replace(/async\s*\(\s*([^:]+):\s*any\s*\)\s*=>\s*\{\s*'/g, (match, param) => {
        fixCount++;
        fixed = true;
        return `async (${param}: any) => {`;
    });

    // Fix return statements with trailing single quotes and closing braces
    content = content.replace(/return ([^;]+);'\s*}'/g, (match, returnValue) => {
        fixCount++;
        fixed = true;
        return `return ${returnValue};
        }`;
    });

    // Fix standalone semicolons with quotes
    content = content.replace(/;\s*'$/gm, (match) => {
        fixCount++;
        fixed = true;
        return ';';
    });

    // Fix comment lines with trailing quotes
    content = content.replace(/\/\/\s*([^']+)''/g, (match, comment) => {
        fixCount++;
        fixed = true;
        return `// ${comment}`;
    });

    // Fix object property definitions with malformed semicolons
    content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;}]+)\s*;$/gm, (match, prop, value) => {
        fixCount++;
        fixed = true;
        return `${prop}: ${value}`;
    });

    // Fix malformed catch/finally blocks
    content = content.replace(/}\s*catch\s*\(\s*([^)]+)'\s*\)\s*\{\s*''/g, (match, errorVar) => {
        fixCount++;
        fixed = true;
        return `} catch (${errorVar}) {`;
    });

    // Fix malformed try blocks
    content = content.replace(/try\s*\{\s*'/g, (match) => {
        fixCount++;
        fixed = true;
        return 'try {';
    });

    // Fix malformed object literal patterns with trailing semicolons in interfaces
    content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;}]+)\s*;\s*}$/gm, (match, prop, value) => {
        fixCount++;
        fixed = true;
        return `${prop}: ${value}
}`;
    });

    // Fix incomplete object literal patterns in method parameters
    content = content.replace(/=\s*\{\s*\)\s*\{/g, (match) => {
        fixCount++;
        fixed = true;
        return '= {}) {';
    });

    // Fix misplaced closing brackets and parentheses
    content = content.replace(/\}\s*\)\s*\{\s*'/g, (match) => {
        fixCount++;
        fixed = true;
        return '}) {';
    });

    // Fix malformed function parameter patterns
    content = content.replace(/\(\s*([^)]+)'\s*\)\s*\{/g, (match, params) => {
        fixCount++;
        fixed = true;
        const cleanParams = params.replace(/'/g, '');
        return `(${cleanParams}) {`;
    });

    // Fix malformed arrow functions with quotes
    content = content.replace(/=>\s*\{\s*'\s*}/g, (match) => {
        fixCount++;
        fixed = true;
        return '=> {';
    });

    // Fix object properties ending with semicolons instead of commas
    content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;}]+),\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;}]+)\s*;/g, (match, prop1, val1, prop2, val2) => {
        fixCount++;
        fixed = true;
        return `${prop1}: ${val1},
                ${prop2}: ${val2}`;
    });

    return { content, fixed, fixCount };
}

// Process all files
function processFiles() {
    const files = getAllTsFiles();
    let totalFilesFixed = 0;
    let totalFixesApplied = 0;

    console.log(`Processing ${files.length} TypeScript files for method signature fixes...`);

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const result = fixMethodSignatures(content);

            if (result.fixed) {
                fs.writeFileSync(file, result.content, 'utf8');
                totalFilesFixed++;
                totalFixesApplied += result.fixCount;
                console.log(`Fixed ${result.fixCount} patterns in ${file}`);
            }
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    }

    console.log(`\nSummary:`);
    console.log(`- Files processed: ${files.length}`);
    console.log(`- Files fixed: ${totalFilesFixed}`);
    console.log(`- Total fixes applied: ${totalFixesApplied}`);
    
    return { totalFilesFixed, totalFixesApplied };
}

// Run the script
if (require.main === module) {
    console.log('🔧 Fixing method signatures and syntax issues in TypeScript files...\n');
    const result = processFiles();
    console.log(`\n✅ Completed fixing method signatures. Fixed ${result.totalFilesFixed} files with ${result.totalFixesApplied} total fixes.`);
}

module.exports = { fixMethodSignatures, processFiles };