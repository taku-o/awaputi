const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fix remaining critical TypeScript errors
async function fixRemainingCriticalErrors() {
    console.log('Starting critical TypeScript error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix object parameter syntax with spaces
            // Example: { } -> {}
            const pattern1 = /=\s*\{\s+\}/g;
            fixed = fixed.replace(pattern1, () => {
                modifications++;
                return '= {}';
            });
            
            // Pattern 2: Fix template literal string issues
            // Example: Date.now(} }_${ -> Date.now()}_${
            const pattern2 = /(Date\.now\(\})\s*(\}\s*_\$\{)/g;
            fixed = fixed.replace(pattern2, () => {
                modifications++;
                return 'Date.now()}_${';
            });
            
            // Pattern 3: Fix template literal malformed endings
            // Example: toString(36}` -> toString(36)`
            const pattern3 = /(toString\(36)\}\`/g;
            fixed = fixed.replace(pattern3, (match, part) => {
                modifications++;
                return part + ')`';
            });
            
            // Pattern 4: Fix substr method calls
            // Example: substr(2, 9}` }`} -> substr(2, 9)`
            const pattern4 = /(substr\(\d+,\s*\d+)\}\`\s*\}\`\}/g;
            fixed = fixed.replace(pattern4, (match, part) => {
                modifications++;
                return part + ')';
            });
            
            // Pattern 5: Fix missing closing brackets in method calls
            // Example: Date.now(} -> Date.now()
            const pattern5 = /(Date\.now\(\})/g;
            fixed = fixed.replace(pattern5, () => {
                modifications++;
                return 'Date.now()';
            });
            
            // Pattern 6: Fix object property closing brackets
            // Example: { prop: value; } -> { prop: value }
            const pattern6 = /(\{\s*[^}]*);(\s*\})/g;
            fixed = fixed.replace(pattern6, (match, content, closing) => {
                modifications++;
                return content + closing;
            });
            
            // Pattern 7: Fix metadata object syntax in return statements
            // Example: metadata: { timestamp: value, ...metadata \n } -> metadata: { timestamp: value, ...metadata }
            const pattern7 = /(metadata:\s*\{[^}]*)\n\s*\}/g;
            fixed = fixed.replace(pattern7, (match, content) => {
                modifications++;
                return content + ' }';
            });
            
            // Pattern 8: Fix error object syntax
            // Example: error: { code, message, status }; -> error: { code, message, status },
            const pattern8 = /(error:\s*\{[^}]*\});/g;
            fixed = fixed.replace(pattern8, (match, errorObj) => {
                modifications++;
                return errorObj + ',';
            });
            
            // Pattern 9: Fix for loop syntax issues
            // Example: for(let i = 0 i < array.length i++) -> for(let i = 0; i < array.length; i++)
            const pattern9 = /(for\s*\(\s*let\s+\w+\s*=\s*\d+)\s+(\w+\s*<\s*[^;]+)\s+(\w+\+\+)/g;
            fixed = fixed.replace(pattern9, (match, init, condition, increment) => {
                modifications++;
                return `${init}; ${condition}; ${increment}`;
            });
            
            // Pattern 10: Fix array closing brackets
            // Example: [item1, item2, ] -> [item1, item2]
            const pattern10 = /(\[[^\]]*),\s*\]/g;
            fixed = fixed.replace(pattern10, (match, content) => {
                modifications++;
                return content + ']';
            });
            
            // Pattern 11: Fix function parameter syntax
            // Example: function(param1, param2, ) -> function(param1, param2)
            const pattern11 = /(\([^)]*),\s*\)/g;
            fixed = fixed.replace(pattern11, (match, params) => {
                modifications++;
                return params + ')';
            });
            
            // Pattern 12: Fix conditional expressions with malformed syntax
            // Example: if(condition) { return;} -> if(condition) { return; }
            const pattern12 = /(if\s*\([^)]+\)\s*\{\s*return\s*;)\}/g;
            fixed = fixed.replace(pattern12, (match, ifPart) => {
                modifications++;
                return ifPart + ' }';
            });
            
            // Pattern 13: Fix method calls with missing semicolons
            // Example: someMethod() } -> someMethod(); }
            const pattern13 = /([a-zA-Z_]\w*\(\))\s*\}/g;
            fixed = fixed.replace(pattern13, (match, methodCall) => {
                modifications++;
                return methodCall + '; }';
            });
            
            // Pattern 14: Fix destructuring assignment syntax
            // Example: const { prop = 'value'  } -> const { prop = 'value' }
            const pattern14 = /(const\s*\{\s*[^}]+)\s\s+(\})/g;
            fixed = fixed.replace(pattern14, (match, content, closing) => {
                modifications++;
                return content + ' ' + closing;
            });
            
            // Pattern 15: Fix object literal trailing commas
            // Example: { prop: value, } -> { prop: value }
            const pattern15 = /(\{\s*[^}]*),(\s*\})/g;
            fixed = fixed.replace(pattern15, (match, content, closing) => {
                modifications++;
                return content + closing;
            });

            if (modifications > 0) {
                fs.writeFileSync(filePath, fixed);
                modifiedFiles++;
                totalModifications += modifications;
                console.log(`Fixed ${modifications} patterns in ${path.relative(process.cwd(), filePath)}`);
            }
            
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error.message);
        }
    }
    
    console.log(`\nCritical error fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixRemainingCriticalErrors().catch(console.error);