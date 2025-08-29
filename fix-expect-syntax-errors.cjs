#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix expect syntax errors in test files
function fixExpectSyntaxErrors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Pattern 1: Fix incorrect expect syntax
        // Example: expect(obj).method().toBe() -> expect(obj.method()).toBe()
        content = content.replace(/expect\((\w+)\)\.(\w+)\(([^)]*)\)\.(\w+)\(/g, 'expect($1.$2($3)).$4(');
        
        // Pattern 2: Fix expect with multiple parentheses at end
        // Example: expect(result).toBe(true)); -> expect(result).toBe(true);
        content = content.replace(/expect\(([^)]+)\)\.(\w+)\(([^)]+)\)\);/g, 'expect($1).$2($3);');
        
        // Pattern 3: Fix Array.isArray syntax
        // Example: expect(Array).isArray(data).toBe(true) -> expect(Array.isArray(data)).toBe(true)
        content = content.replace(/expect\(Array\)\.isArray\(([^)]+)\)\)\.toBe\(/g, 'expect(Array.isArray($1)).toBe(');
        
        // Pattern 4: Fix .some() syntax errors
        // Example: expect(array).some(condition)).toBe(true) -> expect(array.some(condition)).toBe(true)
        content = content.replace(/expect\((\w+)\)\.some\(([^)]+)\)\)\.toBe\(/g, 'expect($1.some($2)).toBe(');
        
        // Pattern 5: Fix .every() syntax errors
        content = content.replace(/expect\((\w+)\)\.every\(([^)]+)\)\)\.toBe\(/g, 'expect($1.every($2)).toBe(');
        
        // Pattern 6: Fix localStorage.setItem mock syntax
        // Example: localStorage.setItem = jest.fn() as jest.Mock.mockImplementation -> localStorage.setItem = jest.fn().mockImplementation
        content = content.replace(/jest\.fn\(\)\s*as\s*jest\.Mock\.mockImplementation/g, 'jest.fn().mockImplementation');
        
        // Pattern 7: Fix JSON.stringify() calls with extra parentheses
        // Example: JSON.stringify()data) -> JSON.stringify(data)
        content = content.replace(/JSON\.stringify\(\)([^)]+)\)/g, 'JSON.stringify($1)');
        
        // Pattern 8: Fix Date.now() with extra parentheses
        // Example: Date.now()) + value -> Date.now() + value
        content = content.replace(/Date\.now\(\)\)\s*([+-])/g, 'Date.now() $1');
        
        // Pattern 9: Fix mockReturnValue syntax
        // Example: jest.fn()).mockReturnValue -> jest.fn().mockReturnValue
        content = content.replace(/jest\.fn\(\)\)\.mockReturnValue/g, 'jest.fn().mockReturnValue');
        
        // Pattern 10: Fix createMockGameEngine constructor calls
        // Example: new createMockGameEngine() -> new ErrorReporter(createMockGameEngine())
        content = content.replace(/new createMockGameEngine\(\)/g, 'new ErrorReporter(createMockGameEngine())');
        
        // Pattern 11: Fix extra closing parentheses after toBe()
        // Example: expect(value).toBe(true)); -> expect(value).toBe(true);
        content = content.replace(/\.toBe\(([^)]+)\)\);/g, '.toBe($1);');
        
        // Pattern 12: Fix new ClassName() without proper constructor
        // Example: new EventRankingManager(){ -> new EventRankingManager({
        content = content.replace(/new (\w+)\(\)\{/g, 'new $1({');
        
        // Pattern 13: Fix method calls with extra closing parentheses
        // Example: method.toHaveBeenCalled(); -> method).toHaveBeenCalled();
        content = content.replace(/expect\((\w+)\.toHaveBeenCalled\(\)/g, 'expect($1).toHaveBeenCalled()');
        
        // Pattern 14: Fix missing closing parentheses in expect statements
        // Example: expect(getStatusFromValue -> expect(visualizer.getStatusFromValue
        content = content.replace(/expect\((\w+)\)\.(\w+)\(/g, (match, p1, p2) => {
            if (p2 === 'toBe' || p2 === 'toEqual' || p2 === 'toBeDefined') {
                return match;
            }
            return `expect(${p1}.${p2}(`;
        });
        
        // Pattern 15: Fix isPointInChart syntax
        // Example: expect(chart).isPointInChart -> expect(chart.isPointInChart
        content = content.replace(/expect\((\w+)\)\.isPointInChart\(/g, 'expect($1.isPointInChart(');
        
        // Pattern 16: Fix expect with literal values
        // Example: expect(executionTime).toBeLessThan(100)); -> expect(executionTime).toBeLessThan(100);
        content = content.replace(/expect\((\w+)\)\.toBeLessThan\((\d+)\)\);/g, 'expect($1).toBeLessThan($2);');
        
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
    if (fixExpectSyntaxErrors(file)) {
        fixedCount++;
    }
});

console.log(`\nFixed ${fixedCount} files`);