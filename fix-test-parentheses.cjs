const fs = require('fs');
const path = require('path');

function fixTestFiles(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            fixTestFiles(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Pattern 1: .toContain( needs closing parenthesis
            content = content.replace(/\.toContain\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toContain(${p1})`;
            });
            
            // Pattern 2: .toHaveBeenCalled( needs closing parenthesis
            content = content.replace(/\.toHaveBeenCalled\($/gm, (match) => {
                modified = true;
                return `.toHaveBeenCalled()`;
            });
            
            // Pattern 3: .toHaveBeenCalledWith( without closing parenthesis
            content = content.replace(/\.toHaveBeenCalledWith\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toHaveBeenCalledWith(${p1})`;
            });
            
            // Pattern 4: .toBe( without closing parenthesis
            content = content.replace(/\.toBe\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toBe(${p1})`;
            });
            
            // Pattern 5: .toBeGreaterThan( without closing parenthesis
            content = content.replace(/\.toBeGreaterThan\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toBeGreaterThan(${p1})`;
            });
            
            // Pattern 6: .toBeLessThan( without closing parenthesis
            content = content.replace(/\.toBeLessThan\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toBeLessThan(${p1})`;
            });
            
            // Pattern 7: .toBeLessThanOrEqual( without closing parenthesis
            content = content.replace(/\.toBeLessThanOrEqual\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toBeLessThanOrEqual(${p1})`;
            });
            
            // Pattern 8: .toBeGreaterThanOrEqual( without closing parenthesis
            content = content.replace(/\.toBeGreaterThanOrEqual\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toBeGreaterThanOrEqual(${p1})`;
            });
            
            // Pattern 9: .toMatch( without closing parenthesis
            content = content.replace(/\.toMatch\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `.toMatch(${p1})`;
            });
            
            // Pattern 10: .not.toThrow( without closing parenthesis
            content = content.replace(/\.not\.toThrow\($/gm, (match) => {
                modified = true;
                return `.not.toThrow()`;
            });
            
            // Pattern 11: .toBeUndefined( without closing parenthesis
            content = content.replace(/\.toBeUndefined\($/gm, (match) => {
                modified = true;
                return `.toBeUndefined()`;
            });
            
            // Pattern 12: addEventListener( without closing parenthesis
            content = content.replace(/addEventListener\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `addEventListener(${p1})`;
            });
            
            // Pattern 13: removeEventListener( without closing parenthesis
            content = content.replace(/removeEventListener\(([^)]+)$/gm, (match, p1) => {
                modified = true;
                return `removeEventListener(${p1})`;
            });
            
            // Pattern 14: expect(something.toBe needs two closing parentheses
            content = content.replace(/expect\(([^)]+)\.toBe\(([^)]+)$/gm, (match, p1, p2) => {
                modified = true;
                return `expect(${p1}.toBe(${p2}))`;
            });
            
            // Pattern 15: expect(something.toContain needs two closing parentheses
            content = content.replace(/expect\(([^)]+)\.toContain\(([^)]+)$/gm, (match, p1, p2) => {
                modified = true;
                return `expect(${p1}.toContain(${p2}))`;
            });
            
            if (modified) {
                fs.writeFileSync(filePath, content);
                console.log(`Fixed: ${filePath}`);
            }
        }
    });
}

// Run the fix
fixTestFiles('./test');
console.log('Test file parentheses fix complete!');