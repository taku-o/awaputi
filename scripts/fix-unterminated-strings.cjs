#!/usr/bin/env node

/**
 * Fix unterminated strings and malformed quote patterns
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

// Fix unterminated strings and malformed quotes
function fixUnterminatedStrings(content) {
    let fixed = false;
    let fixCount = 0;

    // Fix malformed try/catch patterns with unterminated quotes
    content = content.replace(/try\s*\{\s*'/g, (match) => {
        fixCount++;
        fixed = true;
        return 'try {';
    });

    // Fix malformed error patterns like "} catch (error') { ''"
    content = content.replace(/\}\s*catch\s*\(\s*([^)]+)'\s*\)\s*\{\s*''/g, (match, errorVar) => {
        fixCount++;
        fixed = true;
        return `} catch (${errorVar}) {`;
    });

    // Fix standalone quote marks after statements
    content = content.replace(/;\s*}'\s*$/gm, (match) => {
        fixCount++;
        fixed = true;
        return '; }';
    });

    // Fix unterminated string patterns like "('')';"
    content = content.replace(/\('''\)\s*;/g, (match) => {
        fixCount++;
        fixed = true;
        return "('');";
    });

    // Fix method signature with unterminated quotes like "registerStandardEndpoints('')';"
    content = content.replace(/(\w+)\('''\)\s*;/g, (match, methodName) => {
        fixCount++;
        fixed = true;
        return `${methodName}() {`;
    });

    // Fix async function parameters with malformed quotes
    content = content.replace(/async\s*\(\s*([^:]+):\s*any'\s*\)\s*=>\s*\{\s*'\s*}/g, (match, param) => {
        fixCount++;
        fixed = true;
        return `async (${param}: any) => {`;
    });

    // Fix console.log patterns with malformed quotes
    content = content.replace(/console\.log\('([^']+)'\);\s*}'/g, (match, message) => {
        fixCount++;
        fixed = true;
        return `console.log('${message}');`;
    });

    // Fix console.error patterns with malformed quotes
    content = content.replace(/console\.error\('([^']+)',\s*error\);\s*throw\s*error;\s*};\s*}/g, (match, message) => {
        fixCount++;
        fixed = true;
        return `console.error('${message}', error);
            throw error;
        }`;
    });

    // Fix malformed end patterns with standalone quotes and semicolons
    content = content.replace(/}'\s*\)/g, (match) => {
        fixCount++;
        fixed = true;
        return '})';
    });

    // Fix comment patterns with malformed quotes
    content = content.replace(/\/\*\*\s*\*\s*([^*]+)'\s*\*\/'/g, (match, comment) => {
        fixCount++;
        fixed = true;
        return `/**
     * ${comment}
     */`;
    });

    // Fix multiple standalone quotes at end of lines
    content = content.replace(/;'\s*''/gm, (match) => {
        fixCount++;
        fixed = true;
        return ';';
    });

    // Fix misplaced quotes in method calls
    content = content.replace(/(\w+\([^)]+\));\s*}'/g, (match, methodCall) => {
        fixCount++;
        fixed = true;
        return `${methodCall};`;
    });

    return { content, fixed, fixCount };
}

// Process all files
function processFiles() {
    const files = getAllTsFiles();
    let totalFilesFixed = 0;
    let totalFixesApplied = 0;

    console.log(`Processing ${files.length} TypeScript files for unterminated strings...`);

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const result = fixUnterminatedStrings(content);

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
    console.log('🔧 Fixing unterminated strings and malformed quotes in TypeScript files...\n');
    const result = processFiles();
    console.log(`\n✅ Completed fixing unterminated strings. Fixed ${result.totalFilesFixed} files with ${result.totalFixesApplied} total fixes.`);
}

module.exports = { fixUnterminatedStrings, processFiles };