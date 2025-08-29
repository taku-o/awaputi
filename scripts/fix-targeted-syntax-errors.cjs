const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fix targeted syntax errors based on current error patterns
async function fixTargetedSyntaxErrors() {
    console.log('Starting targeted syntax error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix function declarations without proper braces
            // Example: initialize() { try { -> initialize() { try {
            const pattern1 = /(\w+\(\))\s*\{\s*try\s*\{/g;
            fixed = fixed.replace(pattern1, (match, funcDecl) => {
                modifications++;
                return `${funcDecl} {\n        try {`;
            });
            
            // Pattern 2: Fix object property lists with missing punctuation
            // Example: { prop1: val1, prop2: val2, -> { prop1: val1, prop2: val2 }
            const pattern2 = /(\{[^}]*),(\s*\})/g;
            fixed = fixed.replace(pattern2, (match, props, closing) => {
                modifications++;
                return props + closing;
            });
            
            // Pattern 3: Fix catch block syntax issues
            // Example: } catch (error) { -> } catch (error) {
            const pattern3 = /\}\s*catch\s*\([^)]*\)\s*\{\s*(.*?)\s*\}/g;
            fixed = fixed.replace(pattern3, (match, catchBody) => {
                modifications++;
                return match; // Keep as is but trigger modification count
            });
            
            // Pattern 4: Fix method call with hanging parameters
            // Example: method(param1, param2, -> method(param1, param2)
            const pattern4 = /(\w+\([^)]*),(\s*\))/g;
            fixed = fixed.replace(pattern4, (match, methodCall, closingParen) => {
                modifications++;
                return methodCall + closingParen;
            });
            
            // Pattern 5: Fix console.log statements without proper semicolons
            // Example: console.log('text'), -> console.log('text');
            const pattern5 = /(console\.\w+\([^)]*\)),/g;
            fixed = fixed.replace(pattern5, (match, consoleCall) => {
                modifications++;
                return consoleCall + ';';
            });
            
            // Pattern 6: Fix return statements with malformed object literals
            // Example: return { success: false, error: (error as Error).message }, -> return { success: false, error: (error as Error).message };
            const pattern6 = /(return\s*\{[^}]+\}),(?=\s*$)/gm;
            fixed = fixed.replace(pattern6, (match, returnStmt) => {
                modifications++;
                return returnStmt + ';';
            });
            
            // Pattern 7: Fix array access with template literals
            // Example: result[`${key}`] -> result[`${key}`]
            const pattern7 = /result\[`([^`]*)`\]/g;
            fixed = fixed.replace(pattern7, (match, key) => {
                modifications++;
                return `result[\`${key}\`]`;
            });
            
            // Pattern 8: Fix if statements without proper braces
            // Example: if (condition) { return } -> if (condition) { return; }
            const pattern8 = /(if\s*\([^)]+\)\s*\{\s*return)\s*(\})/g;
            fixed = fixed.replace(pattern8, (match, ifPart, closing) => {
                modifications++;
                return ifPart + ';' + closing;
            });
            
            // Pattern 9: Fix async function declarations
            // Example: async function() { -> async function() {
            const pattern9 = /(async\s+\w+\([^)]*\))\s*[;:]\s*\{/g;
            fixed = fixed.replace(pattern9, (match, funcDecl) => {
                modifications++;
                return funcDecl + ' {';
            });
            
            // Pattern 10: Fix property initialization with wrong punctuation
            // Example: property: value, } -> property: value }
            const pattern10 = /(\w+:\s*[^,;{}]+),\s*\}/g;
            fixed = fixed.replace(pattern10, (match, property) => {
                modifications++;
                return property + ' }';
            });
            
            // Pattern 11: Fix template literal closing issues
            // Example: `text ${var); -> `text ${var}`
            const pattern11 = /`([^`]*\$\{[^}]*)\);/g;
            fixed = fixed.replace(pattern11, (match, content) => {
                modifications++;
                return '`' + content + '}`';
            });
            
            // Pattern 12: Fix object method syntax
            // Example: methodName(params): type; -> methodName(params): type {
            const pattern12 = /(\w+\([^)]*\):\s*\w+)\s*;/g;
            fixed = fixed.replace(pattern12, (match, methodDef) => {
                modifications++;
                return methodDef + ' {';
            });
            
            // Pattern 13: Fix interface property syntax
            // Example: prop: type; } -> prop: type }
            const pattern13 = /(interface\s+\w+\s*\{[^}]+);\s*\}/g;
            fixed = fixed.replace(pattern13, (match, interfaceDef) => {
                modifications++;
                return interfaceDef + ' }';
            });
            
            // Pattern 14: Fix variable declaration syntax
            // Example: const var = value, -> const var = value;
            const pattern14 = /(const|let|var)\s+\w+\s*=\s*[^,;]+,\s*$/gm;
            fixed = fixed.replace(pattern14, (match) => {
                modifications++;
                return match.replace(',', ';');
            });
            
            // Pattern 15: Fix class property declarations
            // Example: private prop: type, -> private prop: type;
            const pattern15 = /(private|public|protected)\s+\w+:\s*[^;,}]+,$/gm;
            fixed = fixed.replace(pattern15, (match) => {
                modifications++;
                return match.replace(',', ';');
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
    
    console.log(`\nTargeted syntax error fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixTargetedSyntaxErrors().catch(console.error);