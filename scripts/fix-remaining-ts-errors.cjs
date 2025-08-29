const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fix remaining TypeScript syntax errors with focused patterns
async function fixRemainingTypeScriptErrors() {
    console.log('Starting remaining TypeScript error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix broken string interpolation in template literals
            // Example: `${variable)` -> `${variable}`
            const pattern1 = /`([^`]*\$\{[^}]*)\)/g;
            fixed = fixed.replace(pattern1, (match, content) => {
                modifications++;
                return '`' + content + '}`';
            });
            
            // Pattern 2: Fix broken method calls with malformed parentheses
            // Example: method(param; -> method(param);
            const pattern2 = /([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*);(?!\s*[;}])/g;
            fixed = fixed.replace(pattern2, (match) => {
                modifications++;
                return match.replace(');', ')');
            });
            
            // Pattern 3: Fix interface properties with wrong punctuation
            // Example: property: type; } -> property: type }
            const pattern3 = /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^;,}]+);(\s*})/g;
            fixed = fixed.replace(pattern3, (match, property, closing) => {
                modifications++;
                return property + closing;
            });
            
            // Pattern 4: Fix console.log statements with broken syntax
            // Example: console.log('message'), -> console.log('message');
            const pattern4 = /(console\.log\([^)]*\)),/g;
            fixed = fixed.replace(pattern4, (match, logCall) => {
                modifications++;
                return logCall + ');';
            });
            
            // Pattern 5: Fix object literal with malformed comma placement
            // Example: { prop: value, } } -> { prop: value }
            const pattern5 = /(\{[^}]*),(\s*})/g;
            fixed = fixed.replace(pattern5, (match, content, closing) => {
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
    
    console.log(`\nRemaining TypeScript error fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixRemainingTypeScriptErrors().catch(console.error);