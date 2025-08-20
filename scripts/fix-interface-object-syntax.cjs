const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fix interface and object syntax errors
async function fixInterfaceObjectSyntax() {
    console.log('Starting interface and object syntax error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix broken interface property syntax with closing braces
            // Example: property: type; } -> property: type }
            const pattern1 = /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^;{},]+);\s*}/g;
            fixed = fixed.replace(pattern1, (match, prop) => {
                // Only fix if this looks like an interface property, not a class
                if (!match.includes('private') && !match.includes('public') && !match.includes('protected')) {
                    modifications++;
                    return prop + ' }';
                }
                return match;
            });
            
            // Pattern 2: Fix object literal syntax mixed with interface syntax
            // Example: { property: type; } -> { property: type }
            const pattern2 = /\{\s*([^{}]*?);\s*\}/g;
            fixed = fixed.replace(pattern2, (match, content) => {
                // Check if this is in an object literal context
                if (!content.includes('function') && !content.includes('=>') && content.includes(':')) {
                    modifications++;
                    return '{ ' + content.trim() + ' }';
                }
                return match;
            });
            
            // Pattern 3: Fix malformed object properties with semicolons before closing brace
            // Example: property: value; } -> property: value }
            const pattern3 = /([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^;,{}]+);\s*([,}])/g;
            fixed = fixed.replace(pattern3, (match, prop, ending) => {
                modifications++;
                if (ending === ',') {
                    return prop + ',';
                } else {
                    return prop + ' }';
                }
            });
            
            // Pattern 4: Fix constructor syntax issues
            // Example: constructor(param: type; ) -> constructor(param: type)
            const pattern4 = /constructor\s*\([^)]*;\s*\)/g;
            fixed = fixed.replace(pattern4, (match) => {
                modifications++;
                return match.replace(/;\s*\)/, ')');
            });
            
            // Pattern 5: Fix try-catch block syntax
            // Example: try { } catch (error) {; -> try { } catch (error) {
            const pattern5 = /}\s*catch\s*\([^)]*\)\s*\{;/g;
            fixed = fixed.replace(pattern5, (match) => {
                modifications++;
                return match.replace(';', '');
            });
            
            // Pattern 6: Fix broken object literal with trailing semicolons
            // Example: { key: value; key2: value2; } -> { key: value, key2: value2 }
            const pattern6 = /\{\s*([^{}]*?)\s*\}/g;
            fixed = fixed.replace(pattern6, (match, content) => {
                if (content.includes(':') && content.includes(';')) {
                    const lines = content.split('\n');
                    let hasModification = false;
                    const fixedLines = lines.map((line, index) => {
                        const trimmed = line.trim();
                        // Check if it's an object property line ending with semicolon
                        if (trimmed.includes(':') && trimmed.endsWith(';') && 
                            !trimmed.includes('function') && !trimmed.includes('=>')) {
                            hasModification = true;
                            if (index === lines.length - 1 || lines[index + 1].trim() === '') {
                                // Last property or next line is empty - remove semicolon
                                return line.replace(/;$/, '');
                            } else {
                                // Not last property - replace semicolon with comma
                                return line.replace(/;$/, ',');
                            }
                        }
                        return line;
                    });
                    if (hasModification) {
                        modifications++;
                        return '{ ' + fixedLines.join('\n') + ' }';
                    }
                }
                return match;
            });
            
            // Pattern 7: Fix malformed method parameter syntax
            // Example: method(param: type; , param2: type) -> method(param: type, param2: type)
            const pattern7 = /\([^)]*;\s*,/g;
            fixed = fixed.replace(pattern7, (match) => {
                modifications++;
                return match.replace(/;\s*,/, ',');
            });
            
            // Pattern 8: Fix broken interface definition
            // Example: interface Name { property: type; } interface -> interface Name { property: type }
            const pattern8 = /interface\s+\w+\s*\{[^{}]*;\s*}\s*interface/g;
            fixed = fixed.replace(pattern8, (match) => {
                modifications++;
                return match.replace(/;\s*}\s*interface/, ' }\n\ninterface');
            });
            
            // Pattern 9: Fix broken class property definitions
            // Example: private property: type; } -> private property: type; }
            const pattern9 = /((?:private|public|protected)\s+[a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^;{},]+);\s*}/g;
            fixed = fixed.replace(pattern9, (match, prop) => {
                // This is a class property, should have semicolon
                return prop + ';\n    }';
            });
            
            // Pattern 10: Fix missing commas in object literals
            // Example: { prop1: val1 prop2: val2 } -> { prop1: val1, prop2: val2 }
            const pattern10 = /\{\s*([^{}]+)\s*\}/g;
            fixed = fixed.replace(pattern10, (match, content) => {
                // Split by newlines and check each line
                const lines = content.split('\n').map(line => line.trim()).filter(line => line);
                let hasModification = false;
                
                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i];
                    const nextLine = lines[i + 1];
                    
                    // Check if current line has property syntax and next line also has property syntax
                    if (line.includes(':') && !line.endsWith(',') && !line.endsWith(';') &&
                        nextLine.includes(':') && 
                        !line.includes('function') && !line.includes('=>')) {
                        lines[i] = line + ',';
                        hasModification = true;
                    }
                }
                
                if (hasModification) {
                    modifications++;
                    return '{ ' + lines.join('\n            ') + ' }';
                }
                return match;
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
    
    console.log(`\nInterface and object syntax fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixInterfaceObjectSyntax().catch(console.error);