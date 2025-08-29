#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Statistics
let totalFilesProcessed = 0;
let totalFilesFixed = 0;
let totalLinesFixed = 0;
const fixedFiles = [];

/**
 * Count the number of unmatched opening parentheses in a string
 * @param {string} str - The string to analyze
 * @returns {number} - Number of unmatched opening parentheses
 */
function countUnmatchedParentheses(str) {
    let count = 0;
    let inString = false;
    let stringChar = null;
    let escaped = false;
    
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const prevChar = i > 0 ? str[i - 1] : '';
        
        // Handle escape sequences
        if (escaped) {
            escaped = false;
            continue;
        }
        
        if (char === '\\') {
            escaped = true;
            continue;
        }
        
        // Handle string literals
        if ((char === '"' || char === "'" || char === '`') && !inString) {
            inString = true;
            stringChar = char;
        } else if (char === stringChar && inString) {
            inString = false;
            stringChar = null;
        }
        
        // Count parentheses only outside of strings
        if (!inString) {
            if (char === '(') {
                count++;
            } else if (char === ')') {
                count--;
            }
        }
    }
    
    return Math.max(0, count);
}

/**
 * Fix missing closing parentheses in a line
 * @param {string} line - The line to fix
 * @returns {object} - { fixed: boolean, line: string }
 */
function fixLine(line) {
    // Skip empty lines or lines that don't end with semicolon
    const trimmedLine = line.trim();
    if (!trimmedLine || !line.endsWith(';')) {
        return { fixed: false, line };
    }
    
    // Skip comment lines
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
        return { fixed: false, line };
    }
    
    // Count unmatched parentheses
    const lineWithoutSemicolon = line.slice(0, -1);
    const unmatchedCount = countUnmatchedParentheses(lineWithoutSemicolon);
    
    if (unmatchedCount > 0) {
        // Add the missing closing parentheses before the semicolon
        const fixedLine = lineWithoutSemicolon + ')'.repeat(unmatchedCount) + ';';
        return { fixed: true, line: fixedLine };
    }
    
    return { fixed: false, line };
}

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 */
function processFile(filePath) {
    totalFilesProcessed++;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let fileWasFixed = false;
        let linesFixedInFile = 0;
        
        const fixedLines = lines.map((line, index) => {
            const result = fixLine(line);
            if (result.fixed) {
                fileWasFixed = true;
                linesFixedInFile++;
                console.log(`  Line ${index + 1}: Fixed missing parentheses`);
                console.log(`    Before: ${line.trim()}`);
                console.log(`    After:  ${result.line.trim()}`);
            }
            return result.line;
        });
        
        if (fileWasFixed) {
            // Write the fixed content back to the file
            fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
            totalFilesFixed++;
            totalLinesFixed += linesFixedInFile;
            fixedFiles.push({
                path: filePath,
                linesFixed: linesFixedInFile
            });
            console.log(`✓ Fixed ${linesFixedInFile} lines in ${filePath}\n`);
        }
        
    } catch (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
    }
}

/**
 * Find and process all TypeScript test files
 */
function findAndProcessFiles() {
    console.log('Searching for TypeScript test files...\n');
    
    // Find all .ts files in test/ and tests/ directories
    const patterns = [
        'test/**/*.ts',
        'tests/**/*.ts'
    ];
    
    const files = [];
    
    patterns.forEach(pattern => {
        const matchedFiles = glob.sync(pattern, {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
            absolute: true
        });
        files.push(...matchedFiles);
    });
    
    // Remove duplicates
    const uniqueFiles = [...new Set(files)];
    
    console.log(`Found ${uniqueFiles.length} TypeScript test files to process.\n`);
    
    // Process each file
    uniqueFiles.forEach(file => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`Processing: ${relativePath}`);
        processFile(file);
    });
}

/**
 * Print summary report
 */
function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY REPORT');
    console.log('='.repeat(60));
    console.log(`Total files processed: ${totalFilesProcessed}`);
    console.log(`Total files fixed: ${totalFilesFixed}`);
    console.log(`Total lines fixed: ${totalLinesFixed}`);
    
    if (fixedFiles.length > 0) {
        console.log('\nFiles that were fixed:');
        fixedFiles.forEach(file => {
            const relativePath = path.relative(process.cwd(), file.path);
            console.log(`  - ${relativePath} (${file.linesFixed} lines)`);
        });
    } else {
        console.log('\nNo files needed fixing. All parentheses are properly balanced! ✨');
    }
    
    console.log('='.repeat(60));
}

// Main execution
console.log('Missing Closing Parentheses Fixer for TypeScript Test Files');
console.log('='.repeat(60));
console.log('This script will fix lines ending with semicolon that have unmatched parentheses.\n');

// No need to check for glob in ES modules - it will fail at import if not installed

// Run the fixer
findAndProcessFiles();
printSummary();

console.log('\n✨ Script completed successfully!');