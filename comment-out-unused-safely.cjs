#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Step 1: Get all TypeScript errors
console.log('Getting all TypeScript errors...');
const allErrors = execSync('npx tsc --noEmit 2>&1 || true', { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });

// Step 2: Parse TS6133 errors (unused variables)
console.log('Parsing TS6133 errors...');
const unusedVarErrors = new Map();
const errorLines = allErrors.split('\n');

for (const line of errorLines) {
    if (line.includes('TS6133')) {
        const match = line.match(/^(.+\.ts)\((\d+),(\d+)\): error TS6133: '(\w+)' is declared but its value is never read\./);
        if (match) {
            const [, filePath, lineNum, colNum, varName] = match;
            if (!unusedVarErrors.has(filePath)) {
                unusedVarErrors.set(filePath, []);
            }
            unusedVarErrors.get(filePath).push({
                line: parseInt(lineNum),
                column: parseInt(colNum),
                varName: varName
            });
        }
    }
}

console.log(`Found ${unusedVarErrors.size} files with unused variables`);

// Step 3: Parse existing reference errors (to avoid touching them)
console.log('Parsing existing reference errors...');
const existingRefErrors = new Set();

for (const line of errorLines) {
    if (line.includes('TS2339') || line.includes('TS2304') || line.includes('TS2551')) {
        const match = line.match(/^(.+\.ts)\((\d+),(\d+)\):/);
        if (match) {
            const [, filePath, lineNum] = match;
            existingRefErrors.add(`${filePath}:${lineNum}`);
        }
    }
}

console.log(`Found ${existingRefErrors.size} existing reference errors`);

// Step 4: Process each file
let totalCommented = 0;
let filesProcessed = 0;

for (const [filePath, errors] of unusedVarErrors) {
    console.log(`\nProcessing ${filePath} (${errors.length} unused variables)`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const commentedVars = new Set();
        
        // Sort errors by line number in reverse order
        errors.sort((a, b) => b.line - a.line);
        
        // First pass: Comment out declarations
        for (const error of errors) {
            const lineIndex = error.line - 1;
            if (lineIndex < 0 || lineIndex >= lines.length) continue;
            
            // Skip if this line has existing reference errors
            if (existingRefErrors.has(`${filePath}:${error.line}`)) {
                console.log(`  Skipping line ${error.line} due to existing reference error`);
                continue;
            }
            
            const line = lines[lineIndex];
            
            // Skip if already commented
            if (line.trim().startsWith('//')) continue;
            
            // Comment out the declaration
            lines[lineIndex] = line.replace(/^(\s*)/, '$1// TODO: Unused variable - consider removing or implementing usage\n$1// ');
            commentedVars.add(error.varName);
            totalCommented++;
            console.log(`  Commented out declaration: ${error.varName} at line ${error.line}`);
        }
        
        // Second pass: Find and comment out references to commented variables
        if (commentedVars.size > 0) {
            console.log('  Looking for references to commented variables...');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNum = i + 1;
                
                // Skip if this line has existing reference errors
                if (existingRefErrors.has(`${filePath}:${lineNum}`)) {
                    continue;
                }
                
                // Skip if already commented
                if (line.trim().startsWith('//')) continue;
                
                // Check for references to any commented variable
                for (const varName of commentedVars) {
                    // Various patterns where the variable might be referenced
                    const patterns = [
                        new RegExp(`\\bthis\\.${varName}\\b`),
                        new RegExp(`\\b${varName}\\s*=`),
                        new RegExp(`\\b${varName}\\s*\\(`),
                        new RegExp(`\\b${varName}\\.`),
                        new RegExp(`\\breturn\\s+${varName}\\b`),
                        new RegExp(`\\bif\\s*\\(.*\\b${varName}\\b`),
                        new RegExp(`\\b${varName}\\s*[\\)\\]\\}\\,\\;]`),
                    ];
                    
                    let shouldComment = false;
                    for (const pattern of patterns) {
                        if (pattern.test(line)) {
                            shouldComment = true;
                            break;
                        }
                    }
                    
                    if (shouldComment) {
                        // Check if this is a simple statement that can be commented out entirely
                        const isSimpleStatement = 
                            line.match(/^\s*(this\.)?[\w]+\s*=/) ||
                            line.match(/^\s*return\s+/) ||
                            line.match(/^\s*if\s*\(/) ||
                            line.match(/^\s*(this\.)?[\w]+\s*\(/);
                            
                        if (isSimpleStatement) {
                            lines[i] = line.replace(/^(\s*)/, '$1// TODO: Reference to commented variable\n$1// ');
                            console.log(`  Commented out reference at line ${lineNum}: ${varName}`);
                        } else {
                            // For complex statements, we'll leave them alone for manual review
                            console.log(`  Warning: Complex reference at line ${lineNum} - manual review needed`);
                        }
                        break;
                    }
                }
            }
        }
        
        // Write back the modified content
        fs.writeFileSync(filePath, lines.join('\n'));
        filesProcessed++;
        
    } catch (err) {
        console.error(`  Error processing ${filePath}: ${err.message}`);
    }
}

console.log(`\n=== Summary ===`);
console.log(`Files processed: ${filesProcessed}`);
console.log(`Variables commented out: ${totalCommented}`);

// Step 5: Check the result
console.log('\nChecking new TypeScript error count...');
const newErrorCount = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || true', { encoding: 'utf8' }).trim();
console.log(`Total TypeScript errors: ${newErrorCount}`);