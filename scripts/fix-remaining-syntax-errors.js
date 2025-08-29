#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Process a single file
async function processFile(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        let modified = content;
        let totalFixes = 0;
        const fixes = [];

        // Fix patterns like return) { to return {
        const returnParenthesisPattern = /return\)\s*\{/g;
        const returnMatches = modified.match(returnParenthesisPattern);
        if (returnMatches) {
            modified = modified.replace(returnParenthesisPattern, 'return {');
            totalFixes += returnMatches.length;
            fixes.push(`${returnMatches.length} return) { patterns`);
        }

        // Fix patterns like call => () { to call => ({
        const arrowFunctionParenPattern = /=>\s*\(\)\s*\{/g;
        const arrowMatches = modified.match(arrowFunctionParenPattern);
        if (arrowMatches) {
            modified = modified.replace(arrowFunctionParenPattern, '=> ({');
            totalFixes += arrowMatches.length;
            fixes.push(`${arrowMatches.length} arrow function parenthesis patterns`);
        }

        // Fix patterns like })}) to })
        const multipleClosingPattern = /\}\)\}\)/g;
        const multipleClosingMatches = modified.match(multipleClosingPattern);
        if (multipleClosingMatches) {
            modified = modified.replace(multipleClosingPattern, '})');
            totalFixes += multipleClosingMatches.length;
            fixes.push(`${multipleClosingMatches.length} multiple closing patterns`);
        }

        // Fix patterns like getCanvasInfo()\n    }) to getCanvasInfo())
        const methodCallNewlinePattern = /(\w+\s*\(\s*\))\s*\n\s*\}\)/g;
        const methodCallMatches = modified.match(methodCallNewlinePattern);
        if (methodCallMatches) {
            modified = modified.replace(methodCallNewlinePattern, '$1)');
            totalFixes += methodCallMatches.length;
            fixes.push(`${methodCallMatches.length} method call newline patterns`);
        }

        // Fix function declarations with space before closing parenthesis
        // Pattern: function name(param ) { to function name(param) {
        const functionSpacePattern = /function\s+(\w+)\s*\(([^)]*)\s+\)\s*\{/g;
        const functionSpaceMatches = modified.match(functionSpacePattern);
        if (functionSpaceMatches) {
            modified = modified.replace(functionSpacePattern, 'function $1($2) {');
            totalFixes += functionSpaceMatches.length;
            fixes.push(`${functionSpaceMatches.length} function space patterns`);
        }

        // Fix arrow function with single parameter and extra parenthesis
        // Pattern: map(call => ({ to map((call) => ({
        const mapCallPattern = /\.map\((\w+)\s*=>\s*\(\{/g;
        const mapCallMatches = modified.match(mapCallPattern);
        if (mapCallMatches) {
            modified = modified.replace(mapCallPattern, '.map(($1) => ({');
            totalFixes += mapCallMatches.length;
            fixes.push(`${mapCallMatches.length} map call patterns`);
        }

        // Fix specific pattern: canvasInfo: ...getCanvasInfo()\n    })
        const lines = modified.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            const currentLine = lines[i];
            const nextLine = lines[i + 1];
            
            // Check for pattern like: canvasInfo: responsiveCanvasManager.scaledCoordinateManager.getCanvasInfo()
            // followed by })
            if (currentLine.includes('getCanvasInfo()') && 
                nextLine.trim() === '})' &&
                currentLine.includes('canvasInfo:')) {
                // Move the }) to the end of current line
                lines[i] = currentLine + ')';
                lines[i + 1] = nextLine.replace(')', '');
                if (lines[i + 1].trim() === '}') {
                    // Keep the closing brace
                } else {
                    lines[i + 1] = '';
                }
                totalFixes++;
                fixes.push('canvas info pattern');
            }
        }
        modified = lines.join('\n');

        // Fix specific pattern in canvas-scale-ui-positioning-visual.test.ts
        if (filePath.includes('canvas-scale-ui-positioning-visual.test.ts')) {
            // Fix line 331: function createRenderingSnapshot(renderSnapshot {
            modified = modified.replace(
                /function createRenderingSnapshot\(renderSnapshot \{/g,
                'function createRenderingSnapshot(renderSnapshot) {'
            );
            
            // Fix line 332: return) {
            modified = modified.replace(
                /return\) \{/g,
                'return {'
            );

            // Fix the specific arrow function issue
            modified = modified.replace(
                /\.map\(call => \(\) \{/g,
                '.map(call => ({'
            );

            totalFixes += 3;
            fixes.push('canvas-scale-ui-positioning-visual specific fixes');
        }

        if (totalFixes > 0) {
            await fs.writeFile(filePath, modified, 'utf8');
            console.log(`✅ Fixed ${filePath}: ${totalFixes} issues`);
            fixes.forEach(fix => console.log(`   - ${fix}`));
            return { fixed: true, count: totalFixes };
        }
        
        return { fixed: false, count: 0 };
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return { fixed: false, count: 0, error: true };
    }
}

// Find all TypeScript test files
async function findTestFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            files.push(...await findTestFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Main function
async function main() {
    const projectRoot = path.resolve(__dirname, '..');
    console.log('🔍 Searching for TypeScript test files with remaining syntax errors...');
    
    try {
        const testFiles = await findTestFiles(projectRoot);
        console.log(`📁 Found ${testFiles.length} test files`);
        
        let totalFixed = 0;
        let filesFixed = 0;
        let errors = 0;
        
        for (const file of testFiles) {
            const result = await processFile(file);
            if (result.error) {
                errors++;
            } else if (result.fixed) {
                filesFixed++;
                totalFixed += result.count;
            }
        }
        
        console.log('\n📊 Summary:');
        console.log(`   - Files processed: ${testFiles.length}`);
        console.log(`   - Files fixed: ${filesFixed}`);
        console.log(`   - Total fixes: ${totalFixed}`);
        console.log(`   - Errors: ${errors}`);
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
main();