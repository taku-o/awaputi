#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * DeveloperConsole.test.ts 専用構文修正
 */
function fixDeveloperConsoleTestSyntax(content) {
    let modified = false;
    const originalContent = content;
    
    console.log('Starting DeveloperConsole.test.ts syntax fixes...');
    
    // 1. Global variable assignments - fix comma to semicolon
    content = content.replace(/\(global: any\)\.(\w+) = ([^,]+),/g, '(global as any).$1 = $2;');
    content = content.replace(/\(global: any\)\.(\w+) = ([^;]+)$/gm, '(global as any).$1 = $2;');
    
    // 2. Mock function interfaces - fix property separators
    content = content.replace(/(\w+): \([^)]*\) => (\w+),$/gm, '$1: ($2) => $2;');
    content = content.replace(/(\w+): \([^)]*\) => void,$/gm, '$1: ($2) => void;');
    content = content.replace(/(\w+): MockFunction<[^>]*>,$/gm, '$1: MockFunction<$2>;');
    
    // 3. Interface definitions - fix property separators and closing
    content = content.replace(/interface (\w+) \{([^}]+),([^}]+)\}/gs, 'interface $1 {\n$2;\n$3\n}');
    content = content.replace(/(\w+): MockFunction<[^>]*>,'/g, '$1: MockFunction<$2>;');
    content = content.replace(/(\w+): \([^)]*\) => void,'/g, '$1: ($2) => void;');
    
    // 4. Jest mock setup - fix syntax errors
    content = content.replace(/jest\.mock\([^)]+\), \(\) => \(\{([^}]+),([^}]+)\}\)\)/gs, 
        'jest.mock($1, () => ({\n$2;\n$3\n}))');
    
    // 5. Mock function definitions - fix closing brackets and semicolons
    content = content.replace(/jest\.fn\(\(\) => ([^}]+)\}/g, 'jest.fn(() => $1)');
    content = content.replace(/jest\.fn\(\(\) => ([^)]+)\); \}/g, 'jest.fn(() => $1); }');
    
    // 6. Remove excessive quotes and fix string termination
    content = content.replace(/';'/g, "';");
    content = content.replace(/"';/g, '";');
    content = content.replace(/,';/g, ';');
    
    // 7. Fix interface property definitions
    content = content.replace(/(\w+): ([^,;]+),'/g, '$1: $2;');
    content = content.replace(/(\w+): ([^,;]+);'/g, '$1: $2;');
    
    // 8. Fix mock return value calls
    content = content.replace(/mockReturnValue\(([^)]+)\) => (\w+)/g, 'mockReturnValue($1): $2');
    
    // 9. Fix function parameter syntax
    content = content.replace(/\(\s*'\s*\)\s*=>\s*void/g, '() => void');
    content = content.replace(/toHaveBeenCalled: \(\)/g, 'toHaveBeenCalled: () => void');
    
    // 10. Fix object literal closing brackets
    content = content.replace(/\}\s*\)\s*\)/g, '} ))');
    content = content.replace(/\}\s*\}/g, '}}');
    
    // 11. Fix comment blocks with syntax issues  
    content = content.replace(/\/\/ DOM environment setup''/g, '// DOM environment setup');
    content = content.replace(/\/\/ Mock ErrorHandler''/g, '// Mock ErrorHandler');
    
    // 12. Fix empty parameters in functions
    content = content.replace(/mockClear: \('\)/g, 'mockClear: ()');
    
    // 13. Fix extends Function syntax
    content = content.replace(/extends Function \{([^}]+)\}/gs, 'extends Function {\n$1\n}');
    
    // 14. Fix jest.fn syntax errors
    content = content.replace(/jest\.fn\(\); \}/g, 'jest.fn() }');
    content = content.replace(/jest\.fn\(\(\) => \(\{ \}/g, 'jest.fn(() => ({}');
    
    // 15. Fix interface closing brackets
    content = content.replace(/\}\s*\}'/g, '}');
    content = content.replace(/\}'/g, '}');
    
    if (content !== originalContent) {
        modified = true;
        console.log('DeveloperConsole.test.ts syntax fixes applied.');
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
        
        const result = fixDeveloperConsoleTestSyntax(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`DeveloperConsole.test.ts fixed: ${filePath}`);
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
console.log('DeveloperConsole.test.ts Syntax Fix\n');

const filePath = path.join(process.cwd(), 'test/debug/DeveloperConsole.test.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log('\n✅ DeveloperConsole.test.ts fix completed successfully.');
    } else {
        console.log('\n❌ No fixes applied to DeveloperConsole.test.ts.');
    }
} else {
    console.log(`❌ File not found: ${filePath}`);
}

console.log('\nDeveloperConsole.test.ts fix completed.');