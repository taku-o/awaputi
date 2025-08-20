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

        // Fix semicolons that should be commas in object literals
        // Pattern: property: value); where it should be property: value },
        content = content.replace(/(\w+\s*:\s*[^,\n]+)\);(\s*\n\s*\w+\s*:)/g, (match, p1, p2) => {
            fixCount++;
            return p1 + '},' + p2;
        });

        // Fix trailing semicolons in object literals
        // Pattern: property: value }; where it's inside an object
        content = content.replace(/(\w+\s*:\s*[^,\n]+\s*\});(\s*\n\s*\w+\s*:)/g, (match, p1, p2) => {
            fixCount++;
            return p1.replace(/;(\s*\})/, '$1') + ',' + p2;
        });

        // Fix missing closing braces in object literals
        // Pattern: save: jest.fn() followed by property definition without closing the object
        content = content.replace(/(\w+\s*:\s*jest\.fn\(\))\s*\n(\s*)(\w+\s*:)/g, (match, p1, indent1, p3) => {
            fixCount++;
            return p1 + '\n' + indent1 + '},' + '\n' + indent1 + p3;
        });

        // Fix object literal ending with semicolon instead of comma
        content = content.replace(/(\{[^{}]*\w+\s*:\s*[^,\n]+);(\s*\n\s*\w+\s*:)/g, (match, p1, p2) => {
            fixCount++;
            return p1 + ',' + p2;
        });

        // Fix mockResolvedValue followed by semicolon in object literal
        content = content.replace(/(mockResolvedValue\([^)]+\));(\s*$)/gm, (match, p1, p2) => {
            const lineContext = content.substring(Math.max(0, content.lastIndexOf('\n', content.indexOf(match)) - 100), content.indexOf(match) + match.length + 100);
            if (lineContext.includes(',') && !lineContext.includes(';')) {
                return match; // Already looks correct
            }
            // Check if this is inside an object literal
            const beforeMatch = content.substring(0, content.indexOf(match));
            const afterMatch = content.substring(content.indexOf(match) + match.length);
            
            // Count open/close braces to determine context
            let braceLevel = 0;
            for (let i = beforeMatch.length - 1; i >= 0; i--) {
                if (beforeMatch[i] === '}') braceLevel--;
                if (beforeMatch[i] === '{') {
                    braceLevel++;
                    if (braceLevel > 0) {
                        // We're inside an object literal
                        // Check if there's another property after this
                        if (afterMatch.match(/^\s*\n\s*\w+\s*:/)) {
                            fixCount++;
                            return p1 + ',';
                        }
                    }
                    break;
                }
            }
            return match;
        });

        // Fix patterns like "})" that should be "})"
        content = content.replace(/\}\)(\s*\n\s*\}\s*\n\s*\w+\s*:)/g, (match, p1) => {
            fixCount++;
            return '}),' + p1;
        });

        // Fix timestamp: Date.now()) patterns
        content = content.replace(/(timestamp:\s*Date\.now\(\))\)(\s*\n\s*\};)/g, (match, p1, p2) => {
            fixCount++;
            return p1 + p2;
        });

        // Fix save: jest.fn() pattern at end of object
        content = content.replace(/(save:\s*jest\.fn\(\))\s*$/gm, (match, p1) => {
            const lineNum = content.substring(0, content.indexOf(match)).split('\n').length;
            const nextLines = content.substring(content.indexOf(match) + match.length).split('\n').slice(0, 3);
            
            // Check if next line has an object property
            if (nextLines.length > 1 && nextLines[1].match(/^\s*\w+\s*:/)) {
                fixCount++;
                return p1 + '\n            },';
            }
            return match;
        });

        // Fix patterns like "timestamp: Date.now())" at end of objects
        content = content.replace(/(timestamp:\s*Date\.now\(\))\)\s*(\n\s*\})/g, (match, p1, p2) => {
            fixCount++;
            return p1 + p2;
        });

        // Fix patterns with extra closing parenthesis in object literals
        content = content.replace(/(\w+:\s*[^,\n]+)\)\s*(\n\s*\};)/g, (match, p1, p2) => {
            // Check if this is a function call that should keep the parenthesis
            if (p1.includes('(') && !p1.includes('jest.fn()')) {
                const openCount = (p1.match(/\(/g) || []).length;
                const closeCount = (p1.match(/\)/g) || []).length;
                if (openCount === closeCount) {
                    // Extra closing parenthesis
                    fixCount++;
                    return p1 + p2;
                }
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