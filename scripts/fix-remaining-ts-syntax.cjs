#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Starting remaining TypeScript syntax error fixes...');

let totalFilesFixed = 0;
let totalIssuesFixed = 0;

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let fixCount = 0;
        let fixed = false;

        // Fix 1: method(param, ) pattern - remove comma before closing paren
        content = content.replace(/,\s*\)/g, (match) => {
            fixCount++;
            fixed = true;
            return ')';
        });

        // Fix 2: 'string) pattern - add missing quote
        content = content.replace(/(['"])([^'"]*)\)/g, (match, quote, text) => {
            // Check if it's actually missing a quote
            if (!text.includes(quote)) {
                fixCount++;
                fixed = true;
                return `${quote}${text}${quote})`;
            }
            return match;
        });

        // Fix 3: ${var) pattern - add missing brace
        content = content.replace(/\$\{([^}]+)\)/g, (match, varName) => {
            fixCount++;
            fixed = true;
            return `\${${varName}})`;
        });

        // Fix 4: function(param1, param2, param3)) pattern - extra closing paren
        content = content.replace(/\)\)/g, (match, offset) => {
            // Check if this is likely an extra paren by looking at context
            const before = content.substring(Math.max(0, offset - 100), offset);
            const after = content.substring(offset + 2, Math.min(content.length, offset + 50));
            
            // Count open/close parens in the before context
            const openCount = (before.match(/\(/g) || []).length;
            const closeCount = (before.match(/\)/g) || []).length;
            
            // If we have more closes than opens, and the next char suggests end of statement
            if (closeCount >= openCount && /^[;\s\n,}]/.test(after)) {
                fixCount++;
                fixed = true;
                return ')';
            }
            return match;
        });

        // Fix 5: Missing semicolons after method calls that end a statement
        content = content.replace(/(\)\s*)(\n\s*(?:\/\/|\/\*|[a-zA-Z_$]|}))/g, (match, closeParen, nextLine) => {
            // Check if it looks like end of statement
            if (!/[;,{]/.test(closeParen) && /^[\n\s]*[a-zA-Z_$}]/.test(nextLine)) {
                fixCount++;
                fixed = true;
                return closeParen + ';' + nextLine;
            }
            return match;
        });

        // Fix 6: Fix catch blocks without proper parentheses
        content = content.replace(/\}\s*catch\s*\(([^)]*)\s*\{/g, (match, errorVar) => {
            if (!errorVar.includes(')')) {
                fixCount++;
                fixed = true;
                return `} catch (${errorVar}) {`;
            }
            return match;
        });

        // Fix 7: Fix object property patterns with semicolons
        content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;}\n]+);(\s*[}\n])/g, (match, prop, value, after) => {
            // Only in object contexts
            if (!/=>/.test(value) && !/function/.test(value)) {
                fixCount++;
                fixed = true;
                return `${prop}: ${value},${after}`;
            }
            return match;
        });

        // Fix 8: Fix return statements with object literals
        content = content.replace(/return\s*\{([^}]+)\};/g, (match, objectContent) => {
            // Check if semicolons are used instead of commas
            if (objectContent.includes(';') && !objectContent.includes(',')) {
                const fixedContent = objectContent.replace(/;\s*(?=[a-zA-Z_$])/g, ',\n    ');
                if (fixedContent !== objectContent) {
                    fixCount++;
                    fixed = true;
                    return `return {${fixedContent}};`;
                }
            }
            return match;
        });

        // Fix 9: Fix method signatures with extra parentheses
        content = content.replace(/(\w+)\s*\(([^)]*)\)\s*\)/g, (match, methodName, params) => {
            // Check if this looks like a method definition
            if (/^[a-zA-Z_$]/.test(methodName)) {
                fixCount++;
                fixed = true;
                return `${methodName}(${params})`;
            }
            return match;
        });

        // Fix 10: Fix incomplete ternary operators
        content = content.replace(/\?\s*([^:]+)\s*$/gm, (match, condition) => {
            // Check if next line might contain the rest
            const lines = content.split('\n');
            const currentLineIndex = content.substring(0, content.indexOf(match)).split('\n').length - 1;
            if (currentLineIndex < lines.length - 1) {
                const nextLine = lines[currentLineIndex + 1];
                if (/^\s*:/.test(nextLine)) {
                    return match; // It continues on next line
                }
            }
            fixCount++;
            fixed = true;
            return `? ${condition} : undefined`;
        });

        if (fixed) {
            fs.writeFileSync(filePath, content);
            totalFilesFixed++;
            totalIssuesFixed += fixCount;
            console.log(`Fixed ${fixCount} issues in ${filePath}`);
        }

        return fixed;
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
        return false;
    }
}

// Process all TypeScript files
const tsFiles = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**']
});

console.log(`Found ${tsFiles.length} TypeScript files to check...`);

tsFiles.forEach((file) => {
    fixFile(file);
});

console.log('\n=== Summary ===');
console.log(`Total files fixed: ${totalFilesFixed}`);
console.log(`Total issues fixed: ${totalIssuesFixed}`);
console.log('\nRemaining syntax fixes completed!');