#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to count character occurrences in a string
function countChar(str, char) {
    return (str.match(new RegExp('\\' + char, 'g')) || []).length;
}

// Function to fix missing closing parentheses in a line
function fixLine(line) {
    // Only process lines that end with semicolon
    if (!line.trimEnd().endsWith(';')) {
        return line;
    }
    
    // Count opening and closing parentheses
    const openCount = countChar(line, '(');
    const closeCount = countChar(line, ')');
    
    // If there are more opening than closing parentheses
    if (openCount > closeCount) {
        const difference = openCount - closeCount;
        // Find the position of the semicolon
        const trimmedLine = line.trimEnd();
        const semicolonIndex = trimmedLine.lastIndexOf(';');
        
        // Insert the missing closing parentheses before the semicolon
        const fixedLine = trimmedLine.substring(0, semicolonIndex) + 
                         ')'.repeat(difference) + 
                         trimmedLine.substring(semicolonIndex);
        
        // Preserve original whitespace at the end
        const endWhitespace = line.substring(line.trimEnd().length);
        return fixedLine + endWhitespace;
    }
    
    return line;
}

// Function to process a single file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let modified = false;
        let changeCount = 0;
        
        const fixedLines = lines.map((line, index) => {
            const fixedLine = fixLine(line);
            if (fixedLine !== line) {
                modified = true;
                changeCount++;
                console.log(`Fixed ${filePath}:${index + 1}`);
                console.log(`  Before: ${line.trim()}`);
                console.log(`  After:  ${fixedLine.trim()}`);
            }
            return fixedLine;
        });
        
        if (modified) {
            fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
            console.log(`✓ Fixed ${changeCount} line(s) in ${filePath}\n`);
            return changeCount;
        }
        
        return 0;
    } catch (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
        return 0;
    }
}

// Main function
async function main() {
    console.log('Searching for TypeScript test files with missing closing parentheses...\n');
    
    // Find all .ts files in the tests directory
    const pattern = path.join(__dirname, 'tests', '**', '*.ts');
    const files = await glob(pattern);
    
    if (files.length === 0) {
        console.log('No TypeScript files found in tests/ directory');
        return;
    }
    
    console.log(`Found ${files.length} TypeScript files in tests/ directory\n`);
    
    let totalFiles = 0;
    let totalFixes = 0;
    
    files.forEach(file => {
        const fixes = processFile(file);
        if (fixes > 0) {
            totalFiles++;
            totalFixes += fixes;
        }
    });
    
    console.log('\nSummary:');
    console.log(`- Processed ${files.length} files`);
    console.log(`- Modified ${totalFiles} files`);
    console.log(`- Fixed ${totalFixes} lines`);
}

// Run the script
main().catch(console.error);