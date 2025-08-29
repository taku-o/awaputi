const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fix critical TypeScript syntax errors
async function fixCriticalTypeScriptErrors() {
    console.log('Starting critical TypeScript syntax error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix broken try-catch blocks
            // Example: }} catch (error) { -> } catch (error) {
            const pattern1 = /}}\s*catch\s*\([^)]*\)\s*\{/g;
            fixed = fixed.replace(pattern1, (match) => {
                modifications++;
                return match.replace('}}', '}');
            });
            
            // Pattern 2: Fix malformed method/function calls
            // Example: method() } -> method(); }
            const pattern2 = /([a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\))\s*}/g;
            fixed = fixed.replace(pattern2, (match, methodCall) => {
                if (!methodCall.includes(';') && !methodCall.includes('=>')) {
                    modifications++;
                    return methodCall + '; }';
                }
                return match;
            });
            
            // Pattern 3: Fix console.log statements without semicolons
            // Example: console.log('message') -> console.log('message');
            const pattern3 = /(console\.log\([^)]*\))\s*([}])/g;
            fixed = fixed.replace(pattern3, (match, logStatement, closeBrace) => {
                modifications++;
                return logStatement + '; ' + closeBrace;
            });
            
            // Pattern 4: Fix return statements in try blocks
            // Example: return value } catch -> return value; } catch
            const pattern4 = /(return\s+[^;{}]+)\s*}\s*catch/g;
            fixed = fixed.replace(pattern4, (match, returnStmt) => {
                modifications++;
                return returnStmt + '; } catch';
            });
            
            // Pattern 5: Fix object property assignments missing semicolons
            // Example: this.property = value } -> this.property = value; }
            const pattern5 = /(this\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^;{}]+)\s*}/g;
            fixed = fixed.replace(pattern5, (match, assignment) => {
                if (!assignment.includes(';')) {
                    modifications++;
                    return assignment + '; }';
                }
                return match;
            });
            
            // Pattern 6: Fix missing commas in object literals
            // Example: { prop1: val1 prop2: val2 } -> { prop1: val1, prop2: val2 }
            const pattern6 = /(\w+:\s*[^,}{;]+)\s+(\w+:)/g;
            fixed = fixed.replace(pattern6, (match, prop1, prop2) => {
                modifications++;
                return prop1 + ', ' + prop2;
            });
            
            // Pattern 7: Fix method parameter lists with trailing commas and semicolons
            // Example: method(param1, param2,) -> method(param1, param2)
            const pattern7 = /\([^)]*,\s*\)/g;
            fixed = fixed.replace(pattern7, (match) => {
                modifications++;
                return match.replace(/,\s*\)/, ')');
            });
            
            // Pattern 8: Fix malformed function declarations
            // Example: function name() { content } } -> function name() { content }
            const pattern8 = /(function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^}]*})\s*}/g;
            fixed = fixed.replace(pattern8, (match, funcDecl) => {
                modifications++;
                return funcDecl;
            });
            
            // Pattern 9: Fix arrow functions with malformed syntax
            // Example: () => { content } } -> () => { content }
            const pattern9 = /(\([^)]*\)\s*=>\s*\{[^}]*})\s*}/g;
            fixed = fixed.replace(pattern9, (match, arrowFunc) => {
                modifications++;
                return arrowFunc;
            });
            
            // Pattern 10: Fix class method syntax errors
            // Example: methodName() { content } } -> methodName() { content }
            const pattern10 = /(\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^{}]*(?:\{[^}]*\}[^{}]*)*})\s*}/g;
            fixed = fixed.replace(pattern10, (match, method) => {
                modifications++;
                return method;
            });
            
            // Pattern 11: Fix async/await syntax issues
            // Example: async method() { content } } -> async method() { content }
            const pattern11 = /(async\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^}]*})\s*}/g;
            fixed = fixed.replace(pattern11, (match, asyncMethod) => {
                modifications++;
                return asyncMethod;
            });
            
            // Pattern 12: Fix variable declarations with missing semicolons
            // Example: const variable = value } -> const variable = value; }
            const pattern12 = /((?:const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^;{}]+)\s*}/g;
            fixed = fixed.replace(pattern12, (match, declaration) => {
                if (!declaration.includes(';')) {
                    modifications++;
                    return declaration + '; }';
                }
                return match;
            });
            
            // Pattern 13: Fix interface property syntax errors
            // Example: property: type;, -> property: type,
            const pattern13 = /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^;,{}]+);,/g;
            fixed = fixed.replace(pattern13, (match, property) => {
                modifications++;
                return property + ',';
            });
            
            // Pattern 14: Fix broken conditional statements
            // Example: if (condition) { content } } -> if (condition) { content }
            const pattern14 = /(if\s*\([^)]+\)\s*\{[^}]*})\s*}/g;
            fixed = fixed.replace(pattern14, (match, ifStatement) => {
                modifications++;
                return ifStatement;
            });
            
            // Pattern 15: Fix import/export statements
            // Example: import { something } from 'module'; } -> import { something } from 'module';
            const pattern15 = /((?:import|export)\s+[^;]+;)\s*}/g;
            fixed = fixed.replace(pattern15, (match, importExport) => {
                modifications++;
                return importExport;
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
    
    console.log(`\nCritical TypeScript syntax fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixCriticalTypeScriptErrors().catch(console.error);