#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TS6133 errors
console.log('Getting TS6133 errors for single-line unused variables...');
const errors = execSync('npx tsc --noEmit 2>&1 | grep "TS6133" || true', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

// Parse TS6133 errors
const unusedVarErrors = new Map();
const errorLines = errors.split('\n').filter(line => line.includes('TS6133'));

console.log(`Found ${errorLines.length} TS6133 errors`);

for (const line of errorLines) {
    const match = line.match(/^(.+\.ts)\((\d+),(\d+)\): error TS6133: '(\w+)' is declared but its value is never read\./);
    if (!match) continue;
    
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

console.log(`Found ${unusedVarErrors.size} files with unused variables`);

// Process each file
let totalCommented = 0;
let skippedMultiline = 0;
let filesProcessed = 0;

for (const [filePath, errors] of unusedVarErrors) {
    console.log(`\nProcessing ${filePath} (${errors.length} unused variables)`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Sort errors by line number in reverse order
        errors.sort((a, b) => b.line - a.line);
        
        // Process each unused variable
        for (const error of errors) {
            const lineIndex = error.line - 1;
            if (lineIndex < 0 || lineIndex >= lines.length) continue;
            
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip if already commented
            if (trimmedLine.startsWith('//')) continue;
            
            // Check if this is likely a multi-line declaration
            // Look for opening braces or brackets at the end of line
            const hasOpeningBrace = trimmedLine.includes('{') && !trimmedLine.includes('}');
            const hasOpeningBracket = trimmedLine.includes('[') && !trimmedLine.includes(']');
            const hasOpeningParen = trimmedLine.includes('(') && !trimmedLine.includes(')');
            const endsWithComma = trimmedLine.endsWith(',');
            
            // Also check if the line contains '=' followed by '{' or '['
            const hasObjectAssignment = /=\s*\{/.test(trimmedLine) && !trimmedLine.includes('}');
            const hasArrayAssignment = /=\s*\[/.test(trimmedLine) && !trimmedLine.includes(']');
            
            // Skip multi-line declarations
            if (hasOpeningBrace || hasOpeningBracket || hasOpeningParen || 
                hasObjectAssignment || hasArrayAssignment || endsWithComma) {
                console.log(`  Skipping multi-line declaration: ${error.varName} at line ${error.line}`);
                skippedMultiline++;
                continue;
            }
            
            // Also skip if the next line starts with certain patterns indicating continuation
            if (lineIndex + 1 < lines.length) {
                const nextLine = lines[lineIndex + 1].trim();
                if (nextLine.startsWith('.') || nextLine.startsWith('}') || 
                    nextLine.startsWith(']') || nextLine.startsWith(')') ||
                    nextLine.startsWith(',')) {
                    console.log(`  Skipping potential multi-line: ${error.varName} at line ${error.line}`);
                    skippedMultiline++;
                    continue;
                }
            }
            
            // Single line declaration - safe to comment out
            console.log(`  Commenting out single-line declaration: ${error.varName} at line ${error.line}`);
            lines[lineIndex] = '// ' + line;
            totalCommented++;
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
console.log(`Multi-line declarations skipped: ${skippedMultiline}`);