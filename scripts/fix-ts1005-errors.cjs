const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fix TS1005 and TS1109 errors - semicolon and comma placement
async function fixTS1005Errors() {
    console.log('Starting TS1005 and TS1109 error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix object literal semicolon issues
            // Example: { prop: value; } -> { prop: value }
            const pattern1 = /(\{[^}]*:\s*[^;}]+);(\s*})/g;
            fixed = fixed.replace(pattern1, (match, property, closing) => {
                modifications++;
                return property + closing;
            });
            
            // Pattern 2: Fix function parameter lists with trailing commas/semicolons
            // Example: function(param1, param2,; -> function(param1, param2)
            const pattern2 = /\(([^)]*),\s*;/g;
            fixed = fixed.replace(pattern2, (match, params) => {
                modifications++;
                return '(' + params + ')';
            });
            
            // Pattern 3: Fix missing commas in object literals
            // Example: { prop1: val1 prop2: val2 } -> { prop1: val1, prop2: val2 }
            const pattern3 = /(\w+:\s*[^,}{;]+)\s+(\w+:)/g;
            fixed = fixed.replace(pattern3, (match, prop1, prop2) => {
                modifications++;
                return prop1 + ', ' + prop2;
            });
            
            // Pattern 4: Fix malformed template literals
            // Example: `text ${variable); -> `text ${variable}`
            const pattern4 = /`([^`]*\$\{[^}]*)\);/g;
            fixed = fixed.replace(pattern4, (match, content) => {
                modifications++;
                return '`' + content + '}`';
            });
            
            // Pattern 5: Fix broken parentheses in method calls
            // Example: method(param'; -> method(param);
            const pattern5 = /([a-zA-Z_$][a-zA-Z0-9_$]*)\(([^)]*)';\)/g;
            fixed = fixed.replace(pattern5, (match, methodName, params) => {
                modifications++;
                return methodName + '(' + params + ');';
            });
            
            // Pattern 6: Fix semicolon placement in object properties
            // Example: property: value;, -> property: value,
            const pattern6 = /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^;,{}]+);,/g;
            fixed = fixed.replace(pattern6, (match, property) => {
                modifications++;
                return property + ',';
            });
            
            // Pattern 7: Fix broken console.log statements
            // Example: console.log('text'); -> console.log('text');
            const pattern7 = /(console\.log\([^)]*\));/g;
            fixed = fixed.replace(pattern7, (match, logCall) => {
                modifications++;
                return logCall + ';';
            });
            
            // Pattern 8: Fix array literal with trailing comma issues
            // Example: [item1, item2,; -> [item1, item2]
            const pattern8 = /(\[[^\]]*),\s*;/g;
            fixed = fixed.replace(pattern8, (match, arrayContent) => {
                modifications++;
                return arrayContent + ']';
            });
            
            // Pattern 9: Fix interface property syntax
            // Example: property: type; } -> property: type }
            const pattern9 = /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^;,}]+);(\s*[}])/g;
            fixed = fixed.replace(pattern9, (match, property, ending) => {
                modifications++;
                return property + ending;
            });
            
            // Pattern 10: Fix method declaration syntax
            // Example: methodName(params;) -> methodName(params)
            const pattern10 = /([a-zA-Z_$][a-zA-Z0-9_$]*)\(([^)]*);(\))/g;
            fixed = fixed.replace(pattern10, (match, methodName, params, closing) => {
                modifications++;
                return methodName + '(' + params + closing;
            });
            
            // Pattern 11: Fix variable declarations with wrong punctuation
            // Example: const variable = value; } -> const variable = value; }
            const pattern11 = /((?:const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^;}]+);(\s*})/g;
            fixed = fixed.replace(pattern11, (match, declaration, closing) => {
                modifications++;
                return declaration + '; ' + closing;
            });
            
            // Pattern 12: Fix broken string interpolation
            // Example: `${variable)` -> `${variable}`
            const pattern12 = /`([^`]*\$\{[^}]*)\)/g;
            fixed = fixed.replace(pattern12, (match, content) => {
                modifications++;
                return '`' + content + '}`';
            });
            
            // Pattern 13: Fix object destructuring syntax
            // Example: { prop1, prop2; } -> { prop1, prop2 }
            const pattern13 = /\{\s*([^}]+);\s*\}/g;
            fixed = fixed.replace(pattern13, (match, props) => {
                modifications++;
                return '{ ' + props + ' }';
            });
            
            // Pattern 14: Fix function call with malformed arguments
            // Example: func(arg1, arg2;) -> func(arg1, arg2)
            const pattern14 = /([a-zA-Z_$][a-zA-Z0-9_$]*)\(([^)]*);?\)/g;
            fixed = fixed.replace(pattern14, (match, funcName, args) => {
                if (args.includes(';')) {
                    modifications++;
                    return funcName + '(' + args.replace(/;/g, '') + ')';
                }
                return match;
            });
            
            // Pattern 15: Fix return statement syntax
            // Example: return value; } -> return value; }
            const pattern15 = /(return\s+[^;{}]+);(\s*})/g;
            fixed = fixed.replace(pattern15, (match, returnStmt, closing) => {
                modifications++;
                return returnStmt + '; ' + closing;
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
    
    console.log(`\nTS1005 error fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixTS1005Errors().catch(console.error);