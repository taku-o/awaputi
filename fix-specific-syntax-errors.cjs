const fs = require('fs');
const path = require('path');

// Fix specific syntax errors
function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix line 587 in EventFlow.test.ts
    if (filePath.includes('EventFlow.test.ts')) {
        content = content.replace(
            /const nearEndTime = Date\.now\(\) \+ \(eventStageManager\.events\[eventId\]\.endTime - 600000;/,
            'const nearEndTime = Date.now() + (eventStageManager.events[eventId].endTime) - 600000;'
        );
        modified = true;
    }
    
    // Fix line 620 in DeveloperConsole.test.ts
    if (filePath.includes('DeveloperConsole.test.ts')) {
        content = content.replace(
            /expect\(monitor\.statistics\.totalChecks\)\.toBe\(0\);/g,
            'expect(monitor.statistics.totalChecks).toBe(0);'
        );
        content = content.replace(
            /expect\(monitor\.statistics\.warningsTriggered\)\.toBe\(0\);/g,
            'expect(monitor.statistics.warningsTriggered).toBe(0);'
        );
        modified = true;
    }
    
    // Fix line 574 in PerformanceThresholdMonitor.test.ts
    if (filePath.includes('PerformanceThresholdMonitor.test.ts')) {
        content = content.replace(
            /monitor\.cleanupOldNotifications\(Date\.now\(\);/,
            'monitor.cleanupOldNotifications(Date.now());'
        );
        modified = true;
    }
    
    // Fix line 620 in GameStateCommands.test.ts  
    if (filePath.includes('GameStateCommands.test.ts')) {
        content = content.replace(
            /expect\(\(\) => JSON\.parse\(result\)\.not\.toThrow\(\);/,
            'expect(() => JSON.parse(result)).not.toThrow();'
        );
        modified = true;
    }
    
    // Fix line 306 in visual-effects-integration.test.ts
    if (filePath.includes('visual-effects-integration.test.ts')) {
        content = content.replace(
            /expect\(particleCount\.toBeGreaterThan\(0\);/,
            'expect(particleCount).toBeGreaterThan(0);'
        );
        modified = true;
    }
    
    // Fix line 342 in visual-effects-integration.test.ts
    if (filePath.includes('visual-effects-integration.test.ts')) {
        content = content.replace(
            /expect\(memoryAfterCleanup\.toBeLessThan\(1000\);/,
            'expect(memoryAfterCleanup).toBeLessThan(1000);'
        );
        modified = true;
    }
    
    // Fix more patterns - closing parentheses
    const patterns = [
        // Pattern: ).toMethod(
        { 
            find: /(\))\.to([A-Z][a-zA-Z]+)\($/gm,
            replace: '$1.to$2()'
        },
        // Pattern: addEventListener('event', handler;
        {
            find: /addEventListener\(([^,]+),\s*([^)]+);$/gm,
            replace: 'addEventListener($1, $2);'
        },
        // Pattern: expect(value.method(
        {
            find: /expect\(([^)]+)\.([a-zA-Z]+)\($/gm,
            replace: 'expect($1.$2())'
        },
        // Pattern: expect(fn()).toBe(value;
        {
            find: /expect\(([^)]+)\)\.toBe\(([^)]+);$/gm,
            replace: 'expect($1).toBe($2);'
        },
        // Pattern: cleanupOldNotifications(Date.now();
        {
            find: /cleanupOldNotifications\(Date\.now\(\);$/gm,
            replace: 'cleanupOldNotifications(Date.now());'
        },
        // Pattern: function calls with missing parentheses at line end
        {
            find: /([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*[^);])$/gm,
            replace: (match, fn, args) => {
                // Count opening and closing parentheses
                const openCount = (args.match(/\(/g) || []).length;
                const closeCount = (args.match(/\)/g) || []).length;
                const diff = openCount - closeCount;
                const closingParens = ')'.repeat(diff + 1);
                return `${fn}(${args}${closingParens}`;
            }
        }
    ];
    
    patterns.forEach(pattern => {
        if (pattern.find.test(content)) {
            content = content.replace(pattern.find, pattern.replace);
            modified = true;
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    }
}

// Fix specific files with known issues
const filesToFix = [
    './test/integration/EventFlow.test.ts',
    './test/debug/DeveloperConsole.test.ts',
    './test/debug/PerformanceThresholdMonitor.test.ts',
    './test/debug/GameStateCommands.test.ts',
    './test/integration/visual-effects-integration.test.ts',
    './test/debug/AdvancedPerformanceMonitor.test.ts',
    './test/debug/DetailedMetricsCollector.test.ts',
    './test/debug/EnhancedDebugInterface.test.ts',
    './test/debug/ErrorNotificationSystem.test.ts',
    './test/debug/ErrorRecoveryTracker.test.ts'
];

filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
        fixFile(file);
    }
});

console.log('Specific syntax error fixes complete!');