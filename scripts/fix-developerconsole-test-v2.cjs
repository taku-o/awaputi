#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * DeveloperConsole.test.ts 精密構文修正 v2
 */
function fixDeveloperConsoleTestSyntaxV2(content) {
    let modified = false;
    const originalContent = content;
    
    console.log('Starting DeveloperConsole.test.ts precise syntax fixes v2...');
    
    // 1. Interface property definitions - fix separators and types
    content = content.replace(/(\w+): \([^)]*\) => void;/g, '$1: () => void;');
    content = content.replace(/(\w+): \(\$2\) => void;;'/g, '$1: () => void;');
    content = content.replace(/MockFunction<\$2>;/g, 'MockFunction<any>;');
    
    // 2. Fix interface closing brackets and extra characters
    content = content.replace(/\}\s*\}/g, '}');
    content = content.replace(/\}'/g, '}');
    content = content.replace(/;;'/g, ';');
    
    // 3. Fix object property syntax in interfaces
    content = content.replace(/canvas: \{ moc,k: string,/g, 'canvas: { mock: string },');
    content = content.replace(/sceneManager: \{ mock: string,/g, 'sceneManager: { mock: string },');
    content = content.replace(/inputManager: \{ mock: string;/g, 'inputManager: { mock: string };');
    
    // 4. Fix interface property separators (semicolon vs comma)
    content = content.replace(/(\w+): ([^,;{}]+),(\s*\/\/.*)?$/gm, '$1: $2;$3');
    content = content.replace(/(\w+): ([^,;{}]+);(\s*\w+:)/gm, '$1: $2,$3');
    
    // 5. Fix jest.mock syntax
    content = content.replace(/jest\.mock\([^)]+\), \(\) => \(\{ getErrorHandler: jest\.fn\(\(\) => \(\{ \)/g, 
        "jest.mock('../src/utils/ErrorHandler.js', () => ({\n    getErrorHandler: jest.fn(() => ({");
    content = content.replace(/handleError: jest\.fn\(\) \} \)\)\)/g, 
        'handleError: jest.fn()\n    }))\n}));');
    
    // 6. Fix function parameter types
    content = content.replace(/toHaveBeenCalledWith: \(void\) => void;/g, 'toHaveBeenCalledWith: (...args: any[]) => void;');
    content = content.replace(/mockClear: \(\) => void/g, 'mockClear: () => void;');
    
    // 7. Fix interface closing and extra brackets
    content = content.replace(/\};\s*\}\}/g, '}\n}');
    content = content.replace(/PerformanceOptimizer \}/g, 'PerformanceOptimizer;');
    content = content.replace(/\}\s*;/g, '}');
    
    // 8. Fix object literal definitions in test setup
    content = content.replace(/const mockGameEngine[^{]*\{([^}]+)\}/gs, function(match) {
        return match.replace(/,\s*}/g, '\n}').replace(/;\s*}/g, '\n}');
    });
    
    // 9. Fix variable declarations and assignments
    content = content.replace(/let (\w+): ([^,;]+),/g, 'let $1: $2;');
    content = content.replace(/let (\w+): ([^,;]+);'/g, 'let $1: $2;');
    
    // 10. Fix test function syntax
    content = content.replace(/test\('([^']+)', \(\) => \{'/g, "test('$1', () => {");
    content = content.replace(/describe\('([^']+)', \(\) => \{'/g, "describe('$1', () => {");
    
    // 11. Fix expect statements
    content = content.replace(/expect\(([^)]+)\)\.toBe\('([^']+)'\)/g, "expect($1).toBe('$2')");
    content = content.replace(/\)\.\s*;'/g, ');');
    
    // 12. Clean up extra quotes and semicolons
    content = content.replace(/';$/gm, "';");
    content = content.replace(/\}'\s*$/gm, '}');
    content = content.replace(/';\s*\}/g, "';\n}");
    
    if (content !== originalContent) {
        modified = true;
        console.log('DeveloperConsole.test.ts v2 syntax fixes applied.');
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
        
        const result = fixDeveloperConsoleTestSyntaxV2(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`DeveloperConsole.test.ts v2 fixed: ${filePath}`);
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
console.log('DeveloperConsole.test.ts Precise Syntax Fix v2\n');

const filePath = path.join(process.cwd(), 'test/debug/DeveloperConsole.test.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log('\n✅ DeveloperConsole.test.ts v2 fix completed successfully.');
    } else {
        console.log('\n❌ No fixes applied to DeveloperConsole.test.ts.');
    }
} else {
    console.log(`❌ File not found: ${filePath}`);
}

console.log('\nDeveloperConsole.test.ts v2 fix completed.');