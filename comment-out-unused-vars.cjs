#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TS6133 errors
console.log('Collecting TS6133 errors...');
const errors = execSync('npx tsc --noEmit 2>&1 | grep "TS6133"', { encoding: 'utf8' })
  .split('\n')
  .filter(line => line.trim())
  .map(line => {
    const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS6133: '(.+?)' is declared but its value is never read\.$/);
    if (!match) return null;
    return {
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      variable: match[4]
    };
  })
  .filter(Boolean);

console.log(`Found ${errors.length} TS6133 errors`);

// Group errors by file
const errorsByFile = {};
errors.forEach(error => {
  if (!errorsByFile[error.file]) {
    errorsByFile[error.file] = [];
  }
  errorsByFile[error.file].push(error);
});

// Process each file
Object.entries(errorsByFile).forEach(([filePath, fileErrors]) => {
  console.log(`Processing ${filePath} (${fileErrors.length} errors)...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Sort errors by line number in reverse order to avoid line number shifts
    fileErrors.sort((a, b) => b.line - a.line);
    
    fileErrors.forEach(error => {
      const lineIndex = error.line - 1;
      const line = lines[lineIndex];
      
      if (!line) {
        console.warn(`  Warning: Line ${error.line} not found`);
        return;
      }
      
      // Check if it's a property declaration
      if (line.includes(`private ${error.variable}`) || 
          line.includes(`public ${error.variable}`) ||
          line.includes(`protected ${error.variable}`) ||
          line.includes(`${error.variable}:`) ||
          line.includes(`${error.variable} =`)) {
        
        // Comment out the entire line
        lines[lineIndex] = '    // ' + line.trim() + ' // TODO: Unused variable - consider removing or implementing usage';
      }
    });
    
    // Write back to file
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`  ✓ Commented out ${fileErrors.length} unused variables`);
    
  } catch (err) {
    console.error(`  ✗ Error processing ${filePath}:`, err.message);
  }
});

console.log('Done!');