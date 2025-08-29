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

        // Fix function declarations missing parentheses
        // Pattern: function name(params {
        const functionPattern = /function\s+(\w+)\s*\(([^)]*)\s*\{/g;
        const functionMatches = modified.match(functionPattern);
        if (functionMatches) {
            modified = modified.replace(functionPattern, 'function $1($2) {');
            totalFixes += functionMatches.length;
            fixes.push(`${functionMatches.length} function declarations with missing )`);
        }

        // Fix arrow function parameter lists missing closing parentheses
        // Pattern: .map(call => ({
        const arrowPattern = /\.map\(([^)]+)\s*=>\s*\(\{/g;
        const arrowMatches = modified.match(arrowPattern);
        if (arrowMatches) {
            // This needs careful handling to not break valid code
            const lines = modified.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('.map(call => ({')) {
                    // Check if the next few lines form an object and close properly
                    let objectDepth = 1;
                    let j = i + 1;
                    while (j < lines.length && objectDepth > 0) {
                        const nextLine = lines[j];
                        objectDepth += (nextLine.match(/\{/g) || []).length;
                        objectDepth -= (nextLine.match(/\}/g) || []).length;
                        
                        if (objectDepth === 0 && nextLine.includes('}))')) {
                            // Already correctly closed
                            break;
                        } else if (objectDepth === 0 && nextLine.includes('}),')) {
                            // Missing closing parenthesis
                            lines[j] = nextLine.replace('}),', '})),');
                            totalFixes++;
                            fixes.push('arrow function object literal');
                            break;
                        }
                        j++;
                    }
                }
            }
            modified = lines.join('\n');
        }

        // Fix function calls with object parameters missing closing
        // Pattern: canvasInfo: responsiveCanvasManager.scaledCoordinateManager.getCanvasInfo(
        // Should be: canvasInfo: responsiveCanvasManager.scaledCoordinateManager.getCanvasInfo()
        const methodCallPattern = /(\w+)\s*:\s*([\w.]+)\s*\(\s*$/gm;
        const lines = modified.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Check if line ends with an opening parenthesis after a method call
            if (trimmed.match(/\w+\s*:\s*[\w.]+\s*\($/)) {
                // Check if next line starts with })
                if (i + 1 < lines.length && lines[i + 1].trim().startsWith('})')) {
                    lines[i] = line.replace(/\($/, '()');
                    totalFixes++;
                    fixes.push('method call missing parentheses');
                }
            }
        }
        modified = lines.join('\n');

        // Fix snapshot parameter declarations
        // Pattern: function validateMobileLayout(snapshot {
        // Should be: function validateMobileLayout(snapshot) {
        const paramPattern = /function\s+(\w+)\s*\(([^)]+)\s+\{/g;
        const paramMatches = modified.match(paramPattern);
        if (paramMatches) {
            modified = modified.replace(paramPattern, 'function $1($2) {');
            totalFixes += paramMatches.length;
            fixes.push(`${paramMatches.length} function parameters missing )`);
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
    console.log('🔍 Searching for TypeScript test files with missing parentheses...');
    
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