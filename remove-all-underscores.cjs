#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TS6133 errors with underscore prefix
console.log('Getting TS6133 errors with underscore prefix...');
const errors = execSync('npx tsc --noEmit 2>&1 | grep "TS6133" | grep "_" || true', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

// Parse TS6133 errors
const underscoreErrors = new Map();
const errorLines = errors.split('\n').filter(line => line.includes('TS6133') && line.includes("'_"));

console.log(`Found ${errorLines.length} TS6133 errors with underscore prefix`);

for (const line of errorLines) {
    const match = line.match(/^(.+\.ts)\((\d+),(\d+)\): error TS6133: '(_+\w+)' is declared but its value is never read\./);
    if (!match) continue;
    
    const [, filePath, lineNum, colNum, varName] = match;
    
    if (!underscoreErrors.has(filePath)) {
        underscoreErrors.set(filePath, []);
    }
    
    underscoreErrors.get(filePath).push({
        line: parseInt(lineNum),
        column: parseInt(colNum),
        varName: varName
    });
}

console.log(`Found ${underscoreErrors.size} files with underscore prefixed variables`);

// Process each file
let totalFixed = 0;
let filesProcessed = 0;

for (const [filePath, errors] of underscoreErrors) {
    console.log(`\nProcessing ${filePath} (${errors.length} underscore variables)`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Sort errors by variable name length descending (to replace longer names first)
        errors.sort((a, b) => b.varName.length - a.varName.length);
        
        // Process each error
        for (const error of errors) {
            // Remove all leading underscores
            const newVarName = error.varName.replace(/^_+/, '');
            console.log(`  Renaming: ${error.varName} -> ${newVarName} at line ${error.line}`);
            
            // Replace all occurrences of this variable in the file
            // Use word boundaries to avoid partial matches
            const varPattern = new RegExp(`\\b${error.varName}\\b`, 'g');
            content = content.replace(varPattern, newVarName);
            
            totalFixed++;
        }
        
        // Write back the modified content
        fs.writeFileSync(filePath, content);
        filesProcessed++;
        
    } catch (err) {
        console.error(`  Error processing ${filePath}: ${err.message}`);
    }
}

console.log(`\n=== Summary ===`);
console.log(`Files processed: ${filesProcessed}`);
console.log(`Variables renamed: ${totalFixed}`);