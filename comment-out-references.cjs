#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TypeScript errors
console.log('Getting TypeScript errors...');
const errors = execSync('npx tsc --noEmit 2>&1 || true', { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });

// Parse errors for references to commented out variables
const referenceErrors = new Map();
const errorLines = errors.split('\n');

// Pattern to match "Property '_variableName' does not exist" or "Cannot find name '_variableName'"
const propertyPattern = /Property '(_\w+)' does not exist/;
const namePattern = /Cannot find name '(_\w+)'/;

for (let i = 0; i < errorLines.length; i++) {
    const line = errorLines[i];
    
    // Match file path and line number
    const fileMatch = line.match(/^(.+\.ts)\((\d+),(\d+)\):/);
    if (!fileMatch) continue;
    
    const [, filePath, lineNum, colNum] = fileMatch;
    const errorMsg = line.substring(fileMatch[0].length);
    
    // Check if it's a reference to a commented variable
    let variableName = null;
    const propMatch = errorMsg.match(propertyPattern);
    const nameMatch = errorMsg.match(namePattern);
    
    if (propMatch) {
        variableName = propMatch[1];
    } else if (nameMatch) {
        variableName = nameMatch[1];
    }
    
    if (variableName) {
        if (!referenceErrors.has(filePath)) {
            referenceErrors.set(filePath, []);
        }
        referenceErrors.get(filePath).push({
            line: parseInt(lineNum),
            column: parseInt(colNum),
            variableName,
            errorMsg: errorMsg.trim()
        });
    }
}

console.log(`Found ${referenceErrors.size} files with reference errors`);

// Process each file
let totalFixed = 0;
for (const [filePath, errors] of referenceErrors) {
    console.log(`\nProcessing ${filePath} (${errors.length} errors)`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Sort errors by line number in reverse order to process from bottom to top
        errors.sort((a, b) => b.line - a.line);
        
        // Process each error
        for (const error of errors) {
            const lineIndex = error.line - 1;
            if (lineIndex < 0 || lineIndex >= lines.length) continue;
            
            const line = lines[lineIndex];
            const varName = error.variableName;
            
            // Skip if already commented
            if (line.trim().startsWith('//')) continue;
            
            // Different patterns to comment out based on context
            let modified = false;
            
            // Pattern 1: Property access (this.varName or obj.varName)
            if (line.includes(`.${varName}`)) {
                // Comment out the entire line if it's just an assignment or simple statement
                if (line.match(/^\s*(this\.|[\w]+\.)?_\w+\s*=/) || 
                    line.match(/^\s*return\s+(this\.|[\w]+\.)?_\w+/) ||
                    line.match(/^\s*(this\.|[\w]+\.)?_\w+\s*\(/) ||
                    line.match(/^\s*if\s*\((.*\.)_\w+/)) {
                    lines[lineIndex] = line.replace(/^(\s*)/, '$1// TODO: Reference to commented variable - ');
                    modified = true;
                } else {
                    // Try to replace the reference with undefined
                    lines[lineIndex] = line.replace(new RegExp(`(\\.${varName})(?=\\W|$)`, 'g'), '/* .$1 */ undefined');
                    modified = true;
                }
            }
            // Pattern 2: Direct variable usage
            else if (line.match(new RegExp(`\\b${varName}\\b`))) {
                // Comment out the entire line if it's a simple statement
                if (line.match(/^\s*_\w+\s*=/) || 
                    line.match(/^\s*return\s+_\w+/) ||
                    line.match(/^\s*_\w+\s*\(/)) {
                    lines[lineIndex] = line.replace(/^(\s*)/, '$1// TODO: Reference to commented variable - ');
                    modified = true;
                } else {
                    // Try to replace the reference with undefined
                    lines[lineIndex] = line.replace(new RegExp(`\\b${varName}\\b`, 'g'), `/* ${varName} */ undefined`);
                    modified = true;
                }
            }
            
            if (modified) {
                totalFixed++;
            }
        }
        
        // Write back the modified content
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`  Fixed ${errors.length} references`);
        
    } catch (err) {
        console.error(`  Error processing ${filePath}: ${err.message}`);
    }
}

console.log(`\nTotal references commented out: ${totalFixed}`);