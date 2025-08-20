#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define patterns to fix
const patterns = [
    // Fix Date.now(})
    { pattern: /Date\.now\(\}\)/g, replacement: 'Date.now()' },
    // Fix jest.fn(})
    { pattern: /jest\.fn\(\}/g, replacement: 'jest.fn()' },
    // Fix : jest.fn(}) patterns
    { pattern: /:\s*jest\.fn\(\}/g, replacement: ': jest.fn()' },
    // Fix handleError: jest.fn(})
    { pattern: /handleError:\s*jest\.fn\(\}\)/g, replacement: 'handleError: jest.fn()' },
    // Fix jest.fn(() => value}
    { pattern: /jest\.fn\(\(\)\s*=>\s*([^}]+)\}/g, replacement: 'jest.fn(() => $1)' },
    // Fix patterns like toHaveBeenCalled(};
    { pattern: /toHaveBeenCalled\(\};/g, replacement: 'toHaveBeenCalled();' },
    // Fix patterns like toBe(true};
    { pattern: /toBe\(([^}]+)\};/g, replacement: 'toBe($1);' },
    // Fix patterns like toEqual([]}
    { pattern: /toEqual\(\[\]\}/g, replacement: 'toEqual([])' },
    // Fix patterns like toBeDefined(};
    { pattern: /toBeDefined\(\};/g, replacement: 'toBeDefined();' },
    // Fix expect patterns with mismatched brackets
    { pattern: /expect\(([^)]+)\}\.to/g, replacement: 'expect($1).to' },
    // Fix trailing }) patterns in objects
    { pattern: /,\s*\}\)/g, replacement: ' })' },
    // Fix test descriptions with bracket issues
    { pattern: /test\('([^']+)'};/g, replacement: "test('$1');" },
    // Fix missing closing parentheses in function calls
    { pattern: /\.mockImplementation\(\(\) => \{\}\}/g, replacement: '.mockImplementation(() => {})' },
    
    // New patterns based on the test files reviewed
    // Fix destroy(};
    { pattern: /destroy\(\};/g, replacement: 'destroy();' },
    // Fix mock return values like jest.fn(() => 60})
    { pattern: /jest\.fn\(\(\)\s*=>\s*(\d+)\}\)/g, replacement: 'jest.fn(() => $1)' },
    // Fix Date.now(} patterns
    { pattern: /Date\.now\(\}/g, replacement: 'Date.now()' },
    // Fix addColorStop: jest.fn(})
    { pattern: /addColorStop:\s*jest\.fn\(\}\)/g, replacement: 'addColorStop: jest.fn()' },
    // Fix removeChild: jest.fn(})
    { pattern: /removeChild:\s*jest\.fn\(\}\)/g, replacement: 'removeChild: jest.fn()' },
    // Fix click: jest.fn(}
    { pattern: /click:\s*jest\.fn\(\}/g, replacement: 'click: jest.fn()' },
    // Fix toBeInstanceOf(Map as any); patterns
    { pattern: /toBeInstanceOf\(([^)]+)\s+as\s+any\};/g, replacement: 'toBeInstanceOf($1 as any);' },
    // Fix toBe(true}; patterns
    { pattern: /toBe\(true\};/g, replacement: 'toBe(true);' },
    // Fix toBe(mockGameEngine}; patterns  
    { pattern: /toBe\(([^}]+)\};/g, replacement: 'toBe($1);' },
    // Fix expect().toBeDefined(}; patterns
    { pattern: /\.toBeDefined\(\};/g, replacement: '.toBeDefined();' },
    // Fix toHaveLength patterns
    { pattern: /\.toHaveLength\(([^)]+)\};/g, replacement: '.toHaveLength($1);' },
    // Fix toContain patterns
    { pattern: /\.toContain\(([^)]+)\};/g, replacement: '.toContain($1);' },
    // Fix toBeGreaterThan patterns
    { pattern: /\.toBeGreaterThan\(([^)]+)\};/g, replacement: '.toBeGreaterThan($1);' },
    // Fix toBeCloseTo patterns
    { pattern: /\.toBeCloseTo\(([^,]+),\s*([^)]+)\};/g, replacement: '.toBeCloseTo($1, $2);' },
    // Fix toBeLessThan patterns
    { pattern: /\.toBeLessThan\(([^)]+)\};/g, replacement: '.toBeLessThan($1);' },
    // Fix toBeGreaterThanOrEqual patterns
    { pattern: /\.toBeGreaterThanOrEqual\(([^)]+)\};/g, replacement: '.toBeGreaterThanOrEqual($1);' },
    // Fix toBeFalsy patterns
    { pattern: /\.toBeFalsy\(\};/g, replacement: '.toBeFalsy();' },
    // Fix monitoring.enabled).toBe(true};
    { pattern: /\.enabled\)\.toBe\(true\};/g, replacement: '.enabled).toBe(true);' },
    // Fix .intervalId).toBeDefined(};
    { pattern: /\.intervalId\)\.toBeDefined\(\};/g, replacement: '.intervalId).toBeDefined();' },
    // Fix frameVariance}).toBe patterns
    { pattern: /frameVariance\}\)\.toBe\(true\);/g, replacement: 'frameVariance}).toBe(true);' },
    // Fix unit: 'fps'};
    { pattern: /unit:\s*'([^']+)'\};/g, replacement: "unit: '$1'};" },
    // Fix unit: 'MB'};
    { pattern: /unit:\s*'MB'\};/g, replacement: "unit: 'MB'};" },
    // Fix .toBe(true};
    { pattern: /\.toBe\(true\};/g, replacement: '.toBe(true);' },
    // Fix const stored = ... patterns where line ends with };
    { pattern: /expect\(stored\.([^)]+)\)\.toBe\(([^)]+)\);/g, replacement: 'expect(stored.$1).toBe($2);' },
    // Fix Max(0, patterns
    { pattern: /\.toHaveBeenCalledWith\(0\};/g, replacement: '.toHaveBeenCalledWith(0);' },
    // Fix getCurrentCombo() patterns with missing closing )
    { pattern: /getCurrentCombo\(\)\s*\{/g, replacement: 'getCurrentCombo() {' },
    // Fix nested function call patterns
    { pattern: /call\s*=>\s*call\[0\]\s*===\s*'([^']+)'\}/g, replacement: "call => call[0] === '$1'" },
    // Fix toHaveBeenCalledWith patterns with };
    { pattern: /\.toHaveBeenCalledWith\(([^;]+)\};/g, replacement: '.toHaveBeenCalledWith($1);' },
    // Fix Error('Score setting failed'}
    { pattern: /Error\('([^']+)'\}/g, replacement: "Error('$1')" },
    // Fix Error('Spawn failed'}
    { pattern: /Error\('Spawn failed'\}/g, replacement: "Error('Spawn failed')" },
    // Fix Error('Metrics error'}
    { pattern: /Error\('Metrics error'\}/g, replacement: "Error('Metrics error')" },
    // Fix Error('Collection error'}
    { pattern: /Error\('Collection error'\}/g, replacement: "Error('Collection error')" },
    // Fix Error('Canvas error'}
    { pattern: /Error\('Canvas error'\}/g, replacement: "Error('Canvas error')" },
    // Fix Error('GC failed'}
    { pattern: /Error\('GC failed'\}/g, replacement: "Error('GC failed')" },
    // Fix toHaveBeenCalledWith('[PerformanceThresholdMonitor] Destroyed'}
    { pattern: /toHaveBeenCalledWith\('\[([^\]]+)\]\s+([^']+)'\}/g, replacement: "toHaveBeenCalledWith('[$1] $2')" },
    // Fix patterns like });
    { pattern: /\)\s*;\s*$/gm, replacement: ');' },
    // Fix patterns like });)
    { pattern: /\}\);\)/g, replacement: '});' },
    // Fix patterns where }) is on separate line and should be });
    { pattern: /^\s*\}\)\s*$/gm, replacement: '    });' },
    // Fix object property patterns with missing closing
    { pattern: /,\s*(\w+):\s*([^,\)]+)\s*\)\s*$/gm, replacement: ',\n        $1: $2\n    )' },
    // Fix multi-line object patterns that end with )
    { pattern: /^(\s+)(\w+):\s*([^\n]+)\n\s*\)/gm, replacement: '$1$2: $3\n    })' },
];

// Special multi-line object fix function
function fixMultilineObjects(content) {
    // Fix patterns like:
    //     hardwareConcurrency: 4,
    //     deviceMemory: 8
    // )
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Check if current line is just a closing parenthesis
        if (trimmedLine === ')' && i > 0) {
            const prevLine = lines[i - 1].trim();
            // Check if previous line ends with a property value (no comma, no closing brace)
            if (prevLine && !prevLine.endsWith(',') && !prevLine.endsWith('}') && !prevLine.endsWith('{') && !prevLine.endsWith(';')) {
                // This is likely a multiline object that needs fixing
                fixedLines.push(line.replace(')', '    })'));
            } else {
                fixedLines.push(line);
            }
        } else {
            fixedLines.push(line);
        }
    }
    
    return fixedLines.join('\n');
}

// Function to count matches
function countMatches(content, pattern) {
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
}

// Process a single file with more complex fixes
async function processFile(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        let modified = content;
        let totalFixes = 0;
        const fixes = [];

        // Apply simple pattern fixes first
        for (const { pattern, replacement } of patterns) {
            const matchCount = countMatches(modified, pattern);
            if (matchCount > 0) {
                modified = modified.replace(pattern, replacement);
                totalFixes += matchCount;
                fixes.push(`${matchCount} instances of ${pattern.source}`);
            }
        }
        
        // Apply multi-line object fixes
        const beforeMultiline = modified;
        modified = fixMultilineObjects(modified);
        if (beforeMultiline !== modified) {
            totalFixes++;
            fixes.push('multiline object closures');
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
    console.log('🔍 Searching for TypeScript test files with syntax errors...');
    
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