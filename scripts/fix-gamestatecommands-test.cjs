#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * GameStateCommands.test.ts 構文修正
 */
function fixGameStateCommandsTestSyntax(content) {
    let modified = false;
    const originalContent = content;
    
    console.log('Starting GameStateCommands.test.ts syntax fixes...');
    
    // 1. Global variable assignments - fix comma to semicolon
    content = content.replace(/\(global: any\)\.(\w+) = ([^,]+),/g, '(global as any).$1 = $2;');
    content = content.replace(/\(global: any\)\.(\w+) = ([^;]+)$/gm, '(global as any).$1 = $2;');
    
    // 2. Fix comment syntax
    content = content.replace(/\/\/ DOM environment setup''/g, '// DOM environment setup');
    content = content.replace(/\/\/ Mock ErrorHandler''/g, '// Mock ErrorHandler');
    
    // 3. Fix jest.fn() calls with syntax errors
    content = content.replace(/jest\.fn\(''\)/g, 'jest.fn()');
    content = content.replace(/jest\.fn\(\(\) => ([^)]+)'\)/g, 'jest.fn(() => $1)');
    content = content.replace(/jest\.fn\('(\))/g, 'jest.fn()');
    content = content.replace(/jest\.fn\(\(\) => ([^)]+)'\),/g, 'jest.fn(() => $1),');
    
    // 4. Fix object literal properties
    content = content.replace(/(\w+): jest\.fn\(\s*\(/g, '$1: jest.fn(');
    content = content.replace(/(\w+): jest\.fn\(,/g, '$1: jest.fn(),');
    content = content.replace(/(\w+): jest\.fn\(\),','/g, '$1: jest.fn(),');
    
    // 5. Fix jest.mock syntax
    content = content.replace(/jest\.mock\([^)]+\), \(\) => \(\{ getErrorHandler: jest\.fn\(\(\) => \(\{ \}/g, 
        "jest.mock('../src/utils/ErrorHandler.js', () => ({\n    getErrorHandler: jest.fn(() => ({");
    content = content.replace(/handleError: jest\.fn\(\), \}/g, 'handleError: jest.fn()\n    }))');
    
    // 6. Fix object literal closing brackets
    content = content.replace(/\}\s*\)\s*\)/g, '} ))');
    content = content.replace(/\)\s*,\s*\)/g, ')');
    
    // 7. Fix performance object
    content = content.replace(/performance = \{ ''/g, 'performance = {');
    content = content.replace(/now: jest\.fn\(\(\) => Date\.now\(\)'\)/g, 'now: jest.fn(() => Date.now())');
    
    // 8. Fix object properties with missing commas and incorrect syntax
    content = content.replace(/pause: jest\.fn\(/g, 'pause: jest.fn(),');
    content = content.replace(/resume: jest\.fn\(\),','/g, 'resume: jest.fn(),');
    content = content.replace(/reset: jest\.fn\(\),','/g, 'reset: jest.fn(),');
    content = content.replace(/stop: jest\.fn\(''\)/g, 'stop: jest.fn()');
    
    // 9. Fix object structure issues
    content = content.replace(/,\s*,\s*/g, ',');
    content = content.replace(/,\s*\)/g, ')');
    content = content.replace(/\)\s*\}/g, '\n}');
    
    // 10. Fix currentScene property
    content = content.replace(/currentScene: 'game'\) \}/g, "currentScene: 'game'");
    
    // 11. Fix performance optimizer structure
    content = content.replace(/\),\s*performanceOptimizer:/g, ',\nperformanceOptimizer:');
    content = content.replace(/\),\s*scoreManager:/g, ',\nscoreManager:');
    
    // 12. Clean up extra quotes and syntax errors
    content = content.replace(/';$/gm, "';");
    content = content.replace(/'\s*$/gm, "'");
    content = content.replace(/''/g, "'");
    
    if (content !== originalContent) {
        modified = true;
        console.log('GameStateCommands.test.ts syntax fixes applied.');
    }
    
    return { content, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        console.log(`Processing ${filePath}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const result = fixGameStateCommandsTestSyntax(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`GameStateCommands.test.ts fixed: ${filePath}`);
            return true;
        } else {
            console.log(`No changes needed: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// メイン処理
console.log('GameStateCommands.test.ts Syntax Fix\n');

const filePath = path.join(process.cwd(), 'test/debug/GameStateCommands.test.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log('\n✅ GameStateCommands.test.ts fix completed successfully.');
    } else {
        console.log('\n❌ No fixes applied to GameStateCommands.test.ts.');
    }
} else {
    console.log(`❌ File not found: ${filePath}`);
}

console.log('\nGameStateCommands.test.ts fix completed.');