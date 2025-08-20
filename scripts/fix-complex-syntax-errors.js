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

        // Fix patterns with multiline object literals that are broken
        // Pattern: { success: true,\n        method: 'web-share' }\n    })
        const lines = modified.split('\n');
        for (let i = 0; i < lines.length - 2; i++) {
            const currentLine = lines[i];
            const nextLine = lines[i + 1];
            const afterNextLine = lines[i + 2];
            
            // Check for pattern like:
            // line i:     something({ success: true,
            // line i+1:   method: 'web-share' }
            // line i+2:   })
            if (currentLine.includes('{ success: true,') && 
                nextLine.includes("method: 'web-share' }") &&
                afterNextLine.trim() === '})') {
                // Combine into a single line
                lines[i] = currentLine.replace('{ success: true,', "{ success: true, method: 'web-share' })");
                lines[i + 1] = '';
                lines[i + 2] = '';
                totalFixes++;
                fixes.push('multiline object literal fix');
            }
        }
        modified = lines.filter(line => line !== '').join('\n');

        // Fix pattern: save: jest.fn())
        // Should be: save: jest.fn()
        modified = modified.replace(/save:\s*jest\.fn\(\)\)/g, 'save: jest.fn()');
        const saveMatches = (content.match(/save:\s*jest\.fn\(\)\)/g) || []).length;
        totalFixes += saveMatches;
        if (saveMatches > 0) {
            fixes.push(`${saveMatches} save: jest.fn()) patterns`);
        }

        // Fix pattern: });
        // When it should be })
        const closingBracePattern = /^\s*\}\);\s*$/gm;
        const closingBraceLines = [];
        const modifiedLines = modified.split('\n');
        for (let i = 0; i < modifiedLines.length; i++) {
            const line = modifiedLines[i];
            const prevLine = i > 0 ? modifiedLines[i - 1] : '';
            
            // Check if this is a });  that should be })
            if (line.trim() === '});' && prevLine.includes('})')) {
                modifiedLines[i] = line.replace('});', '}');
                closingBraceLines.push(i);
                totalFixes++;
            }
        }
        if (closingBraceLines.length > 0) {
            modified = modifiedLines.join('\n');
            fixes.push(`${closingBraceLines.length} closing brace patterns`);
        }

        // Fix pattern: })}) at end of object
        const doubleClosingPattern = /\}\)\}\)/g;
        const doubleClosingMatches = (modified.match(doubleClosingPattern) || []).length;
        if (doubleClosingMatches > 0) {
            modified = modified.replace(doubleClosingPattern, '})');
            totalFixes += doubleClosingMatches;
            fixes.push(`${doubleClosingMatches} double closing patterns`);
        }

        // Fix specific jest.fn patterns with incorrect parentheses
        // Pattern: jest.fn<() => Type>()).mockResolvedValue
        // This is actually correct, so we need to look for broken variants
        
        // Fix pattern where object is split incorrectly
        // Look for patterns like:
        // })
        // };
        // When it should be combined
        const brokenObjectPattern = /\}\)\s*\n\s*\};/g;
        const brokenObjectMatches = (modified.match(brokenObjectPattern) || []).length;
        if (brokenObjectMatches > 0) {
            modified = modified.replace(brokenObjectPattern, '});');
            totalFixes += brokenObjectMatches;
            fixes.push(`${brokenObjectMatches} broken object closing patterns`);
        }

        // Fix incorrect line breaks in test files
        // Pattern: getCurrentStage: jest.fn().mockReturnValue({\n    id: 'normal',\n    type: 'normal'\n});
        // Should have proper closing
        const mockReturnValuePattern = /mockReturnValue\(\{([^}]+)\}\);/gs;
        const mockReturnMatches = modified.match(mockReturnValuePattern);
        if (mockReturnMatches) {
            mockReturnMatches.forEach(match => {
                // Check if it's improperly closed
                if (match.includes('\n});')) {
                    const fixed = match.replace(/\n\}\);/, '\n            })');
                    modified = modified.replace(match, fixed);
                    totalFixes++;
                }
            });
            if (totalFixes > 0) {
                fixes.push('mock return value patterns');
            }
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
    console.log('🔍 Searching for TypeScript test files with complex syntax errors...');
    
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