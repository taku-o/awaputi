#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TypeScript errors
console.log('Getting TS6133 errors for field variables...');
const errors = execSync('npx tsc --noEmit 2>&1 | grep "TS6133" || true', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

// Parse TS6133 errors
const fieldErrors = new Map();
const errorLines = errors.split('\n').filter(line => line.includes('TS6133'));

console.log(`Found ${errorLines.length} TS6133 errors`);

// Track files to process
const filesToProcess = new Map();

for (const line of errorLines) {
    const match = line.match(/^(.+\.ts)\((\d+),(\d+)\): error TS6133: '(_\w+)' is declared but its value is never read\./);
    if (!match) continue;
    
    const [, filePath, lineNum, colNum, varName] = match;
    
    // Only process variables that start with underscore
    if (!varName.startsWith('_')) continue;
    
    if (!filesToProcess.has(filePath)) {
        filesToProcess.set(filePath, []);
    }
    
    filesToProcess.get(filePath).push({
        line: parseInt(lineNum),
        column: parseInt(colNum),
        varName: varName
    });
}

console.log(`Found ${filesToProcess.size} files with underscore-prefixed unused variables`);

// Process each file
let totalFixed = 0;
for (const [filePath, errors] of filesToProcess) {
    console.log(`\nChecking ${filePath} (${errors.length} potential fixes)`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let fileModified = false;
        
        // Check each error
        for (const error of errors) {
            const lineIndex = error.line - 1;
            if (lineIndex < 0 || lineIndex >= lines.length) continue;
            
            const line = lines[lineIndex];
            
            // Check if it's a field declaration (not a parameter or local variable)
            // Field patterns:
            // private _varName: type;
            // protected _varName: type;
            // public _varName: type;
            // _varName: type;
            // private readonly _varName: type;
            // static _varName: type;
            
            const fieldPattern = new RegExp(`^\\s*(private\\s+|protected\\s+|public\\s+|static\\s+|readonly\\s+)*${error.varName}\\s*[:=]`);
            
            // Also check if it's inside a class (by checking indentation and not inside a function)
            const isField = fieldPattern.test(line) && !line.includes('function') && !line.includes('=>');
            
            if (isField) {
                const newVarName = error.varName.substring(1); // Remove underscore prefix
                console.log(`  Field found: ${error.varName} -> ${newVarName} at line ${error.line}`);
                
                // Replace in the entire file (declaration and all references)
                const varRegex = new RegExp(`\\b${error.varName}\\b`, 'g');
                content = content.replace(varRegex, newVarName);
                fileModified = true;
                totalFixed++;
            }
        }
        
        // Write back if modified
        if (fileModified) {
            fs.writeFileSync(filePath, content);
            console.log(`  Fixed ${totalFixed} field variables in this file`);
        }
        
    } catch (err) {
        console.error(`  Error processing ${filePath}: ${err.message}`);
    }
}

console.log(`\nTotal field variables renamed: ${totalFixed}`);