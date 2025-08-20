#!/usr/bin/env node

/**
 * Fix TypeScript object literal semicolon errors
 * Converts semicolons to commas in object literals
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

let totalFixed = 0;
let filesFixed = 0;

function fixObjectLiteralSemicolons(content, filePath) {
    let fixed = false;
    let fixCount = 0;
    const lines = content.split('\n');
    const result = [];
    
    let inObjectLiteral = 0;
    let inInterface = false;
    let inType = false;
    let inClass = false;
    let bracketStack = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();
        
        // Track context
        if (trimmed.startsWith('interface ')) inInterface = true;
        if (trimmed.startsWith('type ') && trimmed.includes('=')) inType = true;
        if (trimmed.startsWith('class ')) inClass = true;
        if (trimmed.startsWith('enum ')) inClass = true; // Treat enums like classes
        
        // Track brackets
        for (let char of line) {
            if (char === '{') {
                bracketStack.push(char);
                if (!inInterface && !inType && !inClass) {
                    inObjectLiteral++;
                }
            } else if (char === '}') {
                bracketStack.pop();
                if (!inInterface && !inType && !inClass && inObjectLiteral > 0) {
                    inObjectLiteral--;
                }
                if (bracketStack.length === 0) {
                    inInterface = false;
                    inType = false;
                    inClass = false;
                }
            }
        }
        
        // Fix semicolons in object literals
        if (inObjectLiteral > 0 && !inInterface && !inType && !inClass) {
            // Look for property definitions ending with semicolon
            const propertyPattern = /^(\s*)([\w$]+)(\s*:\s*.+);(\s*\/\/.*)?$/;
            const match = line.match(propertyPattern);
            
            if (match) {
                // Check if next non-empty line is a closing brace or another property
                let nextNonEmptyLineIndex = i + 1;
                while (nextNonEmptyLineIndex < lines.length && lines[nextNonEmptyLineIndex].trim() === '') {
                    nextNonEmptyLineIndex++;
                }
                
                if (nextNonEmptyLineIndex < lines.length) {
                    const nextLine = lines[nextNonEmptyLineIndex].trim();
                    if (nextLine.startsWith('}') || nextLine.match(/^[\w$]+\s*:/)) {
                        // Replace semicolon with comma
                        line = line.replace(propertyPattern, '$1$2$3,$4');
                        fixed = true;
                        fixCount++;
                    }
                }
            }
            
            // Also fix lines that look like: property: value;
            const simplePattern = /^(\s*[\w$]+\s*:\s*[^;]+);(\s*\/\/.*)?$/;
            const simpleMatch = line.match(simplePattern);
            
            if (simpleMatch && !line.includes('{') && !line.includes('}')) {
                let nextNonEmptyLineIndex = i + 1;
                while (nextNonEmptyLineIndex < lines.length && lines[nextNonEmptyLineIndex].trim() === '') {
                    nextNonEmptyLineIndex++;
                }
                
                if (nextNonEmptyLineIndex < lines.length) {
                    const nextLine = lines[nextNonEmptyLineIndex].trim();
                    if (!nextLine.startsWith('}')) {
                        // Replace semicolon with comma
                        line = line.replace(simplePattern, '$1,$2');
                        fixed = true;
                        fixCount++;
                    }
                }
            }
        }
        
        result.push(line);
    }
    
    if (fixed) {
        totalFixed += fixCount;
        filesFixed++;
        console.log(`Fixed ${fixCount} semicolons in ${filePath}`);
    }
    
    return result.join('\n');
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixedContent = fixObjectLiteralSemicolons(content, filePath);
        
        if (content !== fixedContent) {
            fs.writeFileSync(filePath, fixedContent, 'utf8');
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Process all TypeScript files
console.log('Fixing object literal semicolons in TypeScript files...');

const files = glob.sync('src/**/*.ts', { 
    ignore: ['node_modules/**', 'dist/**', 'build/**'] 
});

const testFiles = glob.sync('test/**/*.ts', { 
    ignore: ['node_modules/**', 'dist/**', 'build/**'] 
});

const allFiles = [...files, ...testFiles];

console.log(`Processing ${allFiles.length} TypeScript files...`);

allFiles.forEach(processFile);

console.log(`\nFixed ${totalFixed} semicolons in ${filesFixed} files`);
console.log('Done!');