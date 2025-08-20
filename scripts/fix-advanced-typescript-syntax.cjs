const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Advanced TypeScript syntax error fixing
async function fixAdvancedTypeScriptSyntax() {
    console.log('Starting advanced TypeScript syntax error fixing...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: Fix malformed interface property syntax with quotes/semicolons
            // Example: name: string,' -> name: string;
            const pattern1 = /(\w+:\s*[^,;]+),'/g;
            fixed = fixed.replace(pattern1, (match, prop) => {
                modifications++;
                return prop + ';';
            });
            
            // Pattern 2: Fix trailing commas in interface/object properties with quotes
            // Example: property: string,' -> property: string;
            const pattern2 = /(\w+:\s*[^,;{}]+),'/g;
            fixed = fixed.replace(pattern2, (match, prop) => {
                modifications++;
                return prop + ';';
            });
            
            // Pattern 3: Fix malformed object property syntax with mixed quotes
            // Example: 'property': value; -> property: value,
            const pattern3 = /'(\w+)':\s*([^;,}]+);/g;
            fixed = fixed.replace(pattern3, (match, key, value) => {
                modifications++;
                return `${key}: ${value},`;
            });
            
            // Pattern 4: Fix broken interface syntax with parentheses
            // Example: interface Name { (property: type; -> interface Name { property: type;
            const pattern4 = /interface\s+\w+\s*\{\s*\(/g;
            fixed = fixed.replace(pattern4, (match) => {
                modifications++;
                return match.replace('(', '');
            });
            
            // Pattern 5: Fix constructor parameter syntax issues  
            // Example: constructor(param: type;) -> constructor(param: type)
            const pattern5 = /constructor\s*\([^)]*;\s*\)/g;
            fixed = fixed.replace(pattern5, (match) => {
                modifications++;
                return match.replace(';', '');
            });
            
            // Pattern 6: Fix malformed try-catch blocks
            // Example: } catch (error) {; -> } catch (error) {
            const pattern6 = /}\s*catch\s*\([^)]*\)\s*\{;/g;
            fixed = fixed.replace(pattern6, (match) => {
                modifications++;
                return match.replace(';', '');
            });
            
            // Pattern 7: Fix duplicate keywords/identifiers
            // Example: async async function -> async function
            const pattern7 = /\b(async|function|const|let|var|class|interface|type)\s+\1\b/g;
            fixed = fixed.replace(pattern7, (match, keyword) => {
                modifications++;
                return keyword;
            });
            
            // Pattern 8: Fix malformed return statements
            // Example: return { success: true; -> return { success: true,
            const pattern8 = /return\s*\{[^}]*;\s*([^}]+)/g;
            fixed = fixed.replace(pattern8, (match) => {
                modifications++;
                return match.replace(/;\s*([^}]+)/, ', $1');
            });
            
            // Pattern 9: Fix interface property ending syntax
            // Example: property: type} -> property: type; }
            const pattern9 = /(\w+:\s*[^;}]+)}/g;
            fixed = fixed.replace(pattern9, (match, prop) => {
                if (!prop.endsWith(';') && !prop.endsWith(',')) {
                    modifications++;
                    return prop + '; }';
                }
                return match;
            });
            
            // Pattern 10: Fix method parameter trailing characters
            // Example: method(param: type;,) -> method(param: type)
            const pattern10 = /\([^)]*;\s*,\s*\)/g;
            fixed = fixed.replace(pattern10, (match) => {
                modifications++;
                return match.replace(/;\s*,\s*/, '');
            });
            
            // Pattern 11: Fix malformed object literal syntax in interfaces
            // Example: { key: value; } inside interface -> { key: value }
            const pattern11 = /\{\s*([^{}]*);(\s*}\s*[;}])/g;
            fixed = fixed.replace(pattern11, (match, content, ending) => {
                if (!ending.includes('interface') && !ending.includes('type')) {
                    modifications++;
                    return `{ ${content} ${ending}`;
                }
                return match;
            });
            
            // Pattern 12: Fix quote mixing in object properties
            // Example: 'key': "value"; -> key: "value",
            const pattern12 = /'([^']+)':\s*"([^"]*)";/g;
            fixed = fixed.replace(pattern12, (match, key, value) => {
                modifications++;
                return `${key}: "${value}",`;
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
    
    console.log(`\nAdvanced TypeScript syntax fixing completed:`);
    console.log(`- Files processed: ${tsFiles.length}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Total modifications: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// Run the fixing
fixAdvancedTypeScriptSyntax().catch(console.error);