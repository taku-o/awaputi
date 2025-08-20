#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = [
    ...glob.sync('src/**/*.ts'),
    ...glob.sync('test/**/*.ts'),
    ...glob.sync('tests/**/*.ts')
];

let totalFixes = 0;
let filesFixed = 0;

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        let fixCount = 0;

        // Fix patterns like recoverSearchOperation(context} instead of recoverSearchOperation(context)
        content = content.replace(/(\w+\s*\([^)]*)\}/g, (match, p1) => {
            // Check if this is a valid pattern that should have }
            const beforeMatch = content.substring(Math.max(0, content.lastIndexOf('\n', content.indexOf(match)) - 200), content.indexOf(match));
            if (beforeMatch.includes('=> {') || beforeMatch.includes('function') || beforeMatch.includes('catch')) {
                return match; // This is likely a valid function body ending
            }
            fixCount++;
            return p1 + ')';
        });

        // Fix patterns like Promise<boolean> { where it should be Promise<boolean> {
        content = content.replace(/(Promise<[^>]+>)\s*{\s*$/gm, (match, p1) => {
            const lineContext = content.substring(Math.max(0, content.lastIndexOf('\n', content.indexOf(match)) - 100), content.indexOf(match) + 100);
            if (lineContext.includes('async') || lineContext.includes('function') || lineContext.includes('=>')) {
                return match; // Valid function declaration
            }
            // Check if this is in a switch case context
            if (lineContext.includes('case ') && lineContext.includes('return await')) {
                fixCount++;
                return p1 + ';';
            }
            return match;
        });

        // Fix switch case issues with missing colons
        content = content.replace(/^(\s*case\s+[^:]+)$/gm, (match, p1) => {
            fixCount++;
            return p1 + ':';
        });

        // Fix patterns in interface/type definitions
        content = content.replace(/(\w+\s*:\s*[^,;}\n]+),(\s*\n\s*\w+\s*:)/g, (match, p1, p2) => {
            // Check if we're in an interface or type definition
            const beforeMatch = content.substring(Math.max(0, content.lastIndexOf('{', content.indexOf(match)) - 50), content.indexOf(match));
            if (beforeMatch.includes('interface') || beforeMatch.includes('type ') || beforeMatch.includes(': {')) {
                if (p1.endsWith(',')) {
                    fixCount++;
                    return p1.replace(/,$/, ';') + p2;
                }
            }
            return match;
        });

        // Fix commas that should be semicolons in interfaces
        content = content.replace(/(\n\s*\w+\s*:\s*[^,;}\n]+),(\s*\n\s*})/g, (match, p1, p2) => {
            if (!p1.includes('=>') && !p1.includes('function')) {
                fixCount++;
                return p1 + ';' + p2;
            }
            return match;
        });

        // Fix missing semicolons in type definitions
        content = content.replace(/(\w+\s*:\s*jest\.Mock)(\s*\n\s*\w+\s*:)/g, (match, p1, p2) => {
            fixCount++;
            return p1 + ';' + p2;
        });

        // Fix patterns like "timestamp: Date.now()" without proper ending
        content = content.replace(/(timestamp:\s*Date\.now\(\))(\s*\n\s*};)/g, (match, p1, p2) => {
            fixCount++;
            return p1 + p2;
        });

        // Fix object property definitions that use comma instead of semicolon in interfaces
        content = content.replace(/^(\s*\w+\s*:\s*[^{][^,;\n]*),(\s*$)/gm, (match, p1, p2) => {
            const lineNum = content.substring(0, content.indexOf(match)).split('\n').length;
            const prevLines = content.substring(0, content.indexOf(match)).split('\n').slice(-5);
            const nextLines = content.substring(content.indexOf(match) + match.length).split('\n').slice(0, 3);
            
            // Check if we're in an interface
            const inInterface = prevLines.some(line => line.includes('interface ')) ||
                              prevLines.some(line => line.includes('type ')) ||
                              (prevLines.some(line => line.trim().endsWith('{')) && 
                               nextLines.some(line => line.includes(':') || line.includes('}')));
            
            if (inInterface) {
                fixCount++;
                return p1 + ';' + p2;
            }
            return match;
        });

        // Fix missing closing parentheses in method calls
        content = content.replace(/(\.\w+\([^)]*)\s*$/gm, (match, p1) => {
            const openCount = (p1.match(/\(/g) || []).length;
            const closeCount = (p1.match(/\)/g) || []).length;
            if (openCount > closeCount) {
                fixCount++;
                return p1 + ')';
            }
            return match;
        });

        // Fix patterns where there's an extra closing brace
        content = content.replace(/}\s*}\s*catch/g, (match) => {
            fixCount++;
            return '} catch';
        });

        // Fix promise type declarations
        content = content.replace(/(:\s*Promise<[^>]+>)\s*{(\s*\n)/g, (match, p1, p2) => {
            const beforeMatch = content.substring(Math.max(0, content.indexOf(match) - 100), content.indexOf(match));
            if (!beforeMatch.includes('function') && !beforeMatch.includes('=>') && !beforeMatch.includes('async')) {
                fixCount++;
                return p1 + ';' + p2;
            }
            return match;
        });

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            totalFixes += fixCount;
            filesFixed++;
            console.log(`Fixed ${fixCount} issues in ${file}`);
        }
    } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
    }
});

console.log(`\nTotal: Fixed ${totalFixes} issues across ${filesFixed} files`);