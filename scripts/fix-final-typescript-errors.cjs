const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fix final TypeScript syntax errors
async function fixFinalTypeScriptErrors() {
    console.log('Starting final TypeScript syntax error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix broken string quotes and semicolons
            // Example: error: (error as Error').message -> error: (error as Error).message
            const pattern1 = /(error as Error')\./g;
            fixed = fixed.replace(pattern1, (match) => {
                modifications++;
                return 'error as Error).';
            });
            
            // Pattern 2: Fix broken parentheses in string literals
            // Example: } (${profileId)` -> } (${profileId})`
            const pattern2 = /([^`]*)(\$\{[^}]*\))(`[^`]*)/g;
            fixed = fixed.replace(pattern2, (match, before, variable, after) => {
                if (!variable.includes('}')) {
                    modifications++;
                    return before + variable + '}' + after;
                }
                return match;
            });
            
            // Pattern 3: Fix broken object property syntax
            // Example: { property: value; } -> { property: value }
            const pattern3 = /(\{[^}]*:\s*[^;}]+);(\s*})/g;
            fixed = fixed.replace(pattern3, (match, prop, closing) => {
                modifications++;
                return prop + closing;
            });
            
            // Pattern 4: Fix method calls with broken parentheses
            // Example: method(param'; -> method(param);
            const pattern4 = /([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*');/g;
            fixed = fixed.replace(pattern4, (match) => {
                modifications++;
                return match.replace("'", ')');
            });
            
            // Pattern 5: Fix broken arrow function syntax
            // Example: => { content } } -> => { content }
            const pattern5 = /(=>\s*\{[^}]*\})\s*}/g;
            fixed = fixed.replace(pattern5, (match, arrowFunc) => {
                modifications++;
                return arrowFunc;
            });
            
            // Pattern 6: Fix property declarations with misplaced quotes
            // Example: private property': type -> private property: type
            const pattern6 = /([a-zA-Z_$][a-zA-Z0-9_$]*)':\s*([^;,\n]+)/g;
            fixed = fixed.replace(pattern6, (match, prop, type) => {
                modifications++;
                return prop + ': ' + type;
            });
            
            // Pattern 7: Fix broken conditional statements
            // Example: if (condition) { code } } -> if (condition) { code }
            const pattern7 = /(if\s*\([^)]+\)\s*\{[^}]*\})\s*}/g;
            fixed = fixed.replace(pattern7, (match, ifStatement) => {
                modifications++;
                return ifStatement;
            });
            
            // Pattern 8: Fix template literal syntax errors
            // Example: `text ${variable)` -> `text ${variable}`
            const pattern8 = /`([^`]*\$\{[^}]*)\)`/g;
            fixed = fixed.replace(pattern8, (match, content) => {
                modifications++;
                return '`' + content + '}`';
            });
            
            // Pattern 9: Fix broken function parameter lists
            // Example: function(param1, param2,; -> function(param1, param2)
            const pattern9 = /\([^)]*,\s*;/g;
            fixed = fixed.replace(pattern9, (match) => {
                modifications++;
                return match.replace(',;', ')');
            });
            
            // Pattern 10: Fix interface property syntax with trailing quotes
            // Example: property: type', -> property: type,
            const pattern10 = /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^',]+)',/g;
            fixed = fixed.replace(pattern10, (match, property) => {
                modifications++;
                return property + ',';
            });
            
            // Pattern 11: Fix broken return statements
            // Example: return value; } catch -> return value; } catch
            const pattern11 = /(return\s+[^;{]+);(\s*}\s*catch)/g;
            fixed = fixed.replace(pattern11, (match, returnStmt, catchPart) => {
                modifications++;
                return returnStmt + catchPart;
            });
            
            // Pattern 12: Fix console.log with broken syntax
            // Example: console.log('message), -> console.log('message');
            const pattern12 = /(console\.log\([^)]*)\),/g;
            fixed = fixed.replace(pattern12, (match, logCall) => {
                modifications++;
                return logCall + ');';
            });
            
            // Pattern 13: Fix class method declarations with extra braces
            // Example: methodName() { content } } -> methodName() { content }
            const pattern13 = /((?:async\s+)?[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^{}]*(?:\{[^}]*\}[^{}]*)*\})\s*}/g;
            fixed = fixed.replace(pattern13, (match, method) => {
                modifications++;
                return method;
            });
            
            // Pattern 14: Fix property assignments with wrong semicolon placement
            // Example: this.property = value; } -> this.property = value; }
            const pattern14 = /(this\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^;}]+);\s*}/g;
            fixed = fixed.replace(pattern14, (match, assignment) => {
                modifications++;
                return assignment + '; }';
            });
            
            // Pattern 15: Fix variable declarations with malformed syntax
            // Example: const variable = value; } -> const variable = value; }
            const pattern15 = /((?:const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^;}]+);\s*}/g;
            fixed = fixed.replace(pattern15, (match, declaration) => {
                modifications++;
                return declaration + '; }';
            });
            
            // Pattern 16: Fix broken array/object literal syntax
            // Example: [item1, item2,; -> [item1, item2]
            const pattern16 = /(\[[^\]]*),\s*;/g;
            fixed = fixed.replace(pattern16, (match, arrayContent) => {
                modifications++;
                return arrayContent + ']';
            });
            
            // Pattern 17: Fix function call with broken parentheses
            // Example: function(arg1, arg2); } -> function(arg1, arg2); }
            const pattern17 = /([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\));\s*}/g;
            fixed = fixed.replace(pattern17, (match, funcCall) => {
                modifications++;
                return funcCall + '; }';
            });
            
            // Pattern 18: Fix broken for/while loop syntax
            // Example: for(const item of items) { code } } -> for(const item of items) { code }
            const pattern18 = /((?:for|while)\s*\([^)]+\)\s*\{[^}]*\})\s*}/g;
            fixed = fixed.replace(pattern18, (match, loopStatement) => {
                modifications++;
                return loopStatement;
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
    
    console.log(`\nFinal TypeScript syntax fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixFinalTypeScriptErrors().catch(console.error);