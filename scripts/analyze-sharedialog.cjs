#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Analyzing ShareDialog.ts syntax patterns...');

const filePath = path.join(process.cwd(), 'src/core/ShareDialog.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let errorPatterns = {
    'stringLiteralIssues': 0,
    'propertySeperatorIssues': 0,
    'bracketIssues': 0,
    'commaVsSemicolon': 0,
    'templateLiteralIssues': 0
};

console.log('First 50 lines with potential issues:');

lines.forEach((line, index) => {
    const lineNum = index + 1;
    const issues = [];
    
    // String literal termination issues - look for single quotes not properly closed
    if (line.includes("'") && line.match(/[^']*'[^']*$/)) {
        issues.push('unclosed-string');
        errorPatterns.stringLiteralIssues++;
    }
    
    // Double separators (comma followed by semicolon or vice versa)
    if (line.match(/[,;]\s*[,;]/)) {
        issues.push('double-separator');
        errorPatterns.commaVsSemicolon++;
    }
    
    // Unclosed braces
    if (line.match(/\{\s*[^}]*$/) && !line.match(/\{[^}]*\}/)) {
        issues.push('unclosed-brace');
        errorPatterns.bracketIssues++;
    }
    
    // Property separator issues in object-like contexts
    if (line.match(/:\s*[^,;{}]+[',]/)) {
        issues.push('property-separator');
        errorPatterns.propertySeperatorIssues++;
    }
    
    // Show first 50 problematic lines
    if (issues.length > 0 && lineNum <= 50) {
        console.log(`  Line ${lineNum}: ${line.trim().substring(0, 60)}... - [${issues.join(', ')}]`);
    }
});

console.log('\nError Pattern Summary:');
Object.entries(errorPatterns).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count}`);
});

console.log('\nTotal lines analyzed:', lines.length);