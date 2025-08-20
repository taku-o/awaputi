#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix common syntax errors in test files
function fixTestSyntaxErrors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Pattern 1: Fix incorrect type casting syntax (: any) to (as any)
        // Example: jest.spyOn(obj: any, 'method') -> jest.spyOn(obj as any, 'method')
        content = content.replace(/(\w+): any,/g, '$1 as any,');
        
        // Pattern 2: Fix semicolon inside parentheses
        // Example: expect(value).toBe(false; // comment -> expect(value).toBe(false); // comment
        content = content.replace(/\.toBe\(([^)]+);([^)]*)\)/g, '.toBe($1)$2');
        
        // Pattern 3: Fix extra closing parentheses in function calls
        // Example: obj.method()); -> obj.method();
        content = content.replace(/(\w+)\(\)\);/g, '$1();');
        
        // Pattern 4: Fix missing closing parentheses
        // Look for patterns where there's a newline after an unclosed parenthesis
        content = content.replace(/expect\(([^)]+)$/gm, (match, p1) => {
            // Count parentheses
            const openCount = (p1.match(/\(/g) || []).length;
            const closeCount = (p1.match(/\)/g) || []).length;
            if (openCount > closeCount) {
                return match + ')';
            }
            return match;
        });
        
        // Pattern 5: Fix incorrect comma placement in expect statements
        content = content.replace(/expect\(([^)]+)\)\.toBe\(([^,)]+),([^)]+)\)/g, 'expect($1).toBe($2)$3');
        
        // Pattern 6: Fix missing commas in object literals
        // This is more complex and needs careful handling
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
const testFiles = glob.sync('test/**/*.test.ts');
let fixedCount = 0;

console.log(`Found ${testFiles.length} test files to check`);

testFiles.forEach(file => {
    if (fixTestSyntaxErrors(file)) {
        fixedCount++;
    }
});

console.log(`\nFixed ${fixedCount} files`);