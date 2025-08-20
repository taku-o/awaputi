#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix remaining syntax errors in test files
function fixRemainingSyntaxErrors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Pattern 1: Fix missing closing parentheses in constructor calls
        // Example: new ErrorReporter(createMockGameEngine(); -> new ErrorReporter(createMockGameEngine());
        content = content.replace(/new\s+\w+\(([^;)]+)\(([^;)]*)\);/g, 'new $1($2));');
        
        // Pattern 2: Fix incomplete method calls with missing parentheses
        // Look for patterns like: .toHaveBeenCalled(
        content = content.replace(/\.toHaveBeenCalled\(\s*$/gm, '.toHaveBeenCalled()');
        content = content.replace(/\.toBeDefined\(\s*$/gm, '.toBeDefined()');
        content = content.replace(/\.toBe\(true\s*$/gm, '.toBe(true)');
        
        // Pattern 3: Fix incomplete type assertions
        // Example: expect(result).toBe(true; // fallback(); -> expect(result).toBe(true); // fallback
        content = content.replace(/\)\.toBe\(([^)]+)\s*;\s*\/\/\s*([^)]+)\(\)/g, ').toBe($1); // $2()');
        
        // Pattern 4: Fix mock return value syntax
        // Example: jest.spyOn(Date, 'now').mockReturnValue(springDate.getTime(); -> jest.spyOn(Date, 'now').mockReturnValue(springDate.getTime());
        content = content.replace(/\.mockReturnValue\(([^)]+)\(/g, '.mockReturnValue($1()');
        content = content.replace(/\.mockReturnValueOnce\(([^)]+)\(/g, '.mockReturnValueOnce($1()');
        
        // Pattern 5: Fix expect statements with syntax errors
        // Example: expect(() => JSON.parse(result).not.toThrow(); -> expect(() => JSON.parse(result)).not.toThrow();
        content = content.replace(/expect\(([^)]+)\)\.not\.toThrow\(\);/g, 'expect($1)).not.toThrow();');
        
        // Pattern 6: Fix incomplete expect assertions
        // Example: expect(springEventsCount.toBeGreaterThan(0)); -> expect(springEventsCount).toBeGreaterThan(0);
        content = content.replace(/expect\((\w+)\.(\w+)\(/g, 'expect($1).$2(');
        
        // Pattern 7: Fix incomplete object property access
        // Example: expect(springEvent.toBeDefined(); -> expect(springEvent).toBeDefined();
        content = content.replace(/expect\((\w+)\.toBeDefined\(\)/g, 'expect($1).toBeDefined()');
        content = content.replace(/expect\((\w+)\.toBe\(/g, 'expect($1).toBe(');
        
        // Pattern 8: Fix incomplete if conditions
        // Example: if ((eventStageManager.scheduleSeasonalEvents) { -> if (eventStageManager.scheduleSeasonalEvents) {
        content = content.replace(/if\s*\(\(([^)]+)\)\s*{/g, 'if ($1) {');
        
        // Pattern 9: Fix function call with extra closing parenthesis
        // Example: expect(handleEventStageSpy.toHaveBeenCalled(); -> expect(handleEventStageSpy).toHaveBeenCalled();
        content = content.replace(/expect\((\w+)\.toHaveBeenCalled\(\)/g, 'expect($1).toHaveBeenCalled()');
        
        // Pattern 10: Fix incomplete expect not.toBe statements
        // Example: expect(firstTimer.not.toBe(secondTimer) -> expect(firstTimer).not.toBe(secondTimer)
        content = content.replace(/expect\((\w+)\.not\.toBe\(/g, 'expect($1).not.toBe(');
        
        // Pattern 11: Fix function definition syntax errors
        // Example: mark(name { -> mark(name) {
        content = content.replace(/(\w+)\((\w+)\s*{/g, '$1($2) {');
        
        // Pattern 12: Fix missing closing parentheses at end of functions
        // Example: performance.now(; -> performance.now();
        content = content.replace(/(\w+)\(\s*;/g, '$1();');
        
        // Pattern 13: Fix ternary operator issues
        // Example: : true; // fallback(); -> : true); // fallback
        content = content.replace(/:\s*true\s*;\s*\/\/\s*fallback\(\)/g, ': true); // fallback');
        
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
    if (fixRemainingSyntaxErrors(file)) {
        fixedCount++;
    }
});

console.log(`\nFixed ${fixedCount} files`);