#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TS6133 errors
console.log('Getting TS6133 errors for proper commenting...');
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
            
            // Skip if already commented
            if (line.trim().startsWith('//')) continue;
            
            // Check if it's an object literal or array literal that spans multiple lines
            if (line.includes('{') || line.includes('[')) {
                // Find the matching closing brace/bracket
                let openBraces = 0;
                let openBrackets = 0;
                let endLineIndex = lineIndex;
                let inString = false;
                let stringChar = '';
                
                for (let i = lineIndex; i < lines.length; i++) {
                    const currentLine = lines[i];
                    
                    for (let j = 0; j < currentLine.length; j++) {
                        const char = currentLine[j];
                        const prevChar = j > 0 ? currentLine[j - 1] : '';
                        
                        // Handle string literals
                        if (!inString && (char === '"' || char === "'" || char === '`')) {
                            inString = true;
                            stringChar = char;
                        } else if (inString && char === stringChar && prevChar !== '\\') {
                            inString = false;
                        }
                        
                        // Count braces/brackets outside of strings
                        if (!inString) {
                            if (char === '{') openBraces++;
                            else if (char === '}') openBraces--;
                            else if (char === '[') openBrackets++;
                            else if (char === ']') openBrackets--;
                        }
                    }
                    
                    // Check if we found the end
                    if (openBraces === 0 && openBrackets === 0 && i > lineIndex) {
                        endLineIndex = i;
                        break;
                    }
                }
                
                // Comment out the entire block
                console.log(`  Commenting out multi-line declaration: ${error.varName} (lines ${error.line}-${endLineIndex + 1})`);
                for (let i = lineIndex; i <= endLineIndex; i++) {
                    if (!lines[i].trim().startsWith('//')) {
                        lines[i] = '// ' + lines[i];
                    }
                }
                totalCommented++;
            } else {
                // Single line declaration
                console.log(`  Commenting out single-line declaration: ${error.varName} at line ${error.line}`);
                lines[lineIndex] = '// ' + line;
                totalCommented++;
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