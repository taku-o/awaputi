#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TS6133 errors with multiple underscores prefix (__, ___, ____ etc)
console.log('Getting TS6133 errors with multiple underscores prefix...');
const errors = execSync('npx tsc --noEmit 2>&1 | grep "TS6133" | grep "\'__" || true', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

// Parse TS6133 errors
const multipleUnderscoreErrors = new Map();
const errorLines = errors.split('\n').filter(line => line.includes('TS6133') && line.includes("'__"));

console.log(`Found ${errorLines.length} TS6133 errors with multiple underscores prefix`);

for (const line of errorLines) {
    const match = line.match(/^(.+\.ts)\((\d+),(\d+)\): error TS6133: '(__+\w+)' is declared but its value is never read\./);
    if (!match) continue;
    
    const [, filePath, lineNum, colNum, varName] = match;
    
    if (!multipleUnderscoreErrors.has(filePath)) {
        multipleUnderscoreErrors.set(filePath, []);
    }
    
    multipleUnderscoreErrors.get(filePath).push({
        line: parseInt(lineNum),
        column: parseInt(colNum),
        varName: varName
    });
}

console.log(`Found ${multipleUnderscoreErrors.size} files with multiple underscore prefixed variables`);

// Process each file
let totalFixed = 0;
let filesProcessed = 0;

for (const [filePath, errors] of multipleUnderscoreErrors) {
    console.log(`\nProcessing ${filePath} (${errors.length} multiple underscore variables)`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Sort errors by variable name length descending (to replace longer names first)
        errors.sort((a, b) => b.varName.length - a.varName.length);
        
        // Process each error
        for (const error of errors) {
            const lineIndex = error.line - 1;
            if (lineIndex < 0 || lineIndex >= lines.length) continue;
            
            const line = lines[lineIndex];
            
            // Check if this is a const declaration
            if (line.trim().startsWith('const ') || line.includes('const ')) {
                // Convert multiple underscores to single underscore
                const newVarName = '_' + error.varName.replace(/^__+/, '');
                console.log(`  Renaming const: ${error.varName} -> ${newVarName} at line ${error.line}`);
                
                // Replace all occurrences of this variable in the file
                // Use word boundaries to avoid partial matches
                const varPattern = new RegExp(`\\b${error.varName}\\b`, 'g');
                content = content.replace(varPattern, newVarName);
                
                totalFixed++;
            } else {
                console.log(`  Skipping non-const variable: ${error.varName} at line ${error.line}`);
            }
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
console.log(`Const variables renamed: ${totalFixed}`);