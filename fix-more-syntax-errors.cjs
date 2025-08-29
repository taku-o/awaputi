const fs = require('fs');
const path = require('path');

function fixSyntaxErrors(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix patterns where we have object literal followed by closing parenthesis
    // Pattern like: { prop: value }) instead of { prop: value })
    content = content.replace(/(\{[^}]*)\)(\s*\))/gm, (match, p1, p2) => {
        modified = true;
        return p1 + '}' + p2;
    });
    
    // Fix patterns where we have .method(args) without proper closing
    // Pattern: .toHaveBeenCalledWith() missing argument closing
    content = content.replace(/\.toHaveBeenCalledWith\(\)$/gm, (match) => {
        modified = true;
        return '.toHaveBeenCalledWith()';
    });
    
    // Fix patterns where expect is missing proper closing
    // Pattern: expect(value.method() instead of expect(value).method()
    content = content.replace(/expect\(([^)]+)\.([a-zA-Z]+)\($/gm, (match, p1, p2) => {
        modified = true;
        return `expect(${p1}).${p2}()`;
    });
    
    // Fix patterns where we have incomplete function calls at line end
    // Pattern: functionName( without closing parenthesis
    content = content.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\($/gm, (match, indent, fn) => {
        modified = true;
        return `${indent}${fn}()`;
    });
    
    // Fix patterns where we have object literals with missing closing braces
    // Pattern: { prop: value ) instead of { prop: value }
    content = content.replace(/(\{[^}]+)\)(\s*[,;])/gm, (match, p1, p2) => {
        modified = true;
        return p1 + '}' + p2;
    });
    
    // Fix patterns where forEach/map/filter etc are missing proper closing
    // Pattern: .forEach(item => {) instead of .forEach(item => {})
    content = content.replace(/\.(forEach|map|filter|reduce|find|some|every)\(([^)]*=>\s*\{)\)$/gm, (match, method, p2) => {
        modified = true;
        return `.${method}(${p2})`;
    });
    
    // Fix specific test file patterns
    if (filePath.includes('EventFlow.test.ts')) {
        // Fix line with mockReturnValue
        content = content.replace(/mockReturnValue\({\)\s*totalEvents/gm, 'mockReturnValue({\n                totalEvents');
        
        // Fix line with object destructuring
        content = content.replace(/bubblesPopped: player\.score \/ 100,\)\)/gm, 'bubblesPopped: player.score / 100,');
        
        // Fix forEach patterns
        content = content.replace(/events\.forEach\(event => \{\)/gm, 'events.forEach(event => {');
        
        // Fix expect patterns
        content = content.replace(/expect\(mockAchievementNotificationSystem\.queueNotification\)\.toHaveBeenCalledWith\(\)/gm, 'expect(mockAchievementNotificationSystem.queueNotification).toHaveBeenCalledWith(');
        
        // Fix object notation in expect
        content = content.replace(/type: 'event',\)\s*subType:/gm, "type: 'event',\n                    subType:");
        content = content.replace(/subType: 'EVENT_STARTED',\)\s*eventId:/gm, "subType: 'EVENT_STARTED',\n                    eventId:");
        content = content.replace(/subType: 'EVENT_REMINDER'\)\s*\}\)/gm, "subType: 'EVENT_REMINDER'\n                })");
        content = content.replace(/subType: 'EVENT_ENDING'\)\s*\}\)/gm, "subType: 'EVENT_ENDING'\n                })");
        
        // Fix title property
        content = content.replace(/type: 'ranking',\)\s*title:/gm, "type: 'ranking',\n                    title:");
        
        // Fix stats object
        content = content.replace(/bubblesPopped: 180,\s*maxChain: 12\)/gm, 'bubblesPopped: 180,\n                maxChain: 12');
        content = content.replace(/bubblesPopped: 150,\s*maxChain: 10\)/gm, 'bubblesPopped: 150,\n                    maxChain: 10');
        content = content.replace(/bubblesPopped: 100 \+ i,\)\s*maxChain:/gm, 'bubblesPopped: 100 + i,\n                    maxChain:');
        
        // Fix expect patterns with parentheses
        content = content.replace(/expect\(duration\.toBeLessThan\(/gm, 'expect(duration).toBeLessThan(');
        content = content.replace(/expect\(rankingSaveResult\.toBeUndefined\(\)/gm, 'expect(rankingSaveResult).toBeUndefined()');
        content = content.replace(/expect\(highPriorityIndex\.toBeLessThan\(/gm, 'expect(highPriorityIndex).toBeLessThan(');
        content = content.replace(/expect\(totalAPGained\.toBeGreaterThan\(/gm, 'expect(totalAPGained).toBeGreaterThan(');
        content = content.replace(/expect\(attemptAutoRecoverySpy\.toHaveBeenCalled\(\)/gm, 'expect(attemptAutoRecoverySpy).toHaveBeenCalled()');
        content = content.replace(/expect\(consoleErrorSpy\.toHaveBeenCalled\(\)/gm, 'expect(consoleErrorSpy).toHaveBeenCalled()');
        content = content.replace(/expect\(setItemSpy\.toHaveBeenCalled\(\)/gm, 'expect(setItemSpy).toHaveBeenCalled()');
        content = content.replace(/expect\(preventDefaultSpy\.toHaveBeenCalled\(\)/gm, 'expect(preventDefaultSpy).toHaveBeenCalled()');
        
        // Fix nested object in mockReturnValue
        content = content.replace(/createLinearGradient: jest\.fn\(\)\.mockReturnValue\(\{\)/gm, 'createLinearGradient: jest.fn().mockReturnValue({');
        content = content.replace(/addColorStop: jest\.fn\(\)\) as unknown as MockFunction<void>/gm, 'addColorStop: jest.fn() as unknown as MockFunction<void>');
        
        // Fix test pattern parentheses
        content = content.replace(/const saveResult: boolean = eventStageManager\.saveEventData  \? eventStageManager\.saveEventData\(\) : true\); \/\/ fallback;/gm, 'const saveResult: boolean = eventStageManager.saveEventData ? eventStageManager.saveEventData() : true; // fallback');
    }
    
    if (filePath.includes('visual-effects-integration.test.ts')) {
        // Fix JSDOM constructor
        content = content.replace(/resources: "usable"\)/gm, 'resources: "usable"');
        
        // Fix Promise constructor
        content = content.replace(/return new Promise\(resolve => \{\)/gm, 'return new Promise(resolve => {');
        
        // Fix object property definitions
        content = content.replace(/Object\.defineProperty\(global\.navigator, 'userAgent', \{\)/gm, "Object.defineProperty(global.navigator, 'userAgent', {");
    }
    
    if (filePath.includes('DeveloperConsole.test.ts')) {
        // Fix register patterns
        content = content.replace(/devConsole\.commandRegistry\.register\('error-command', \{\)/gm, "devConsole.commandRegistry.register('error-command', {");
        content = content.replace(/devConsole\.registerCommand\('test', \{\s*description: 'Test command',\)/gm, "devConsole.registerCommand('test', {\n                description: 'Test command',");
        content = content.replace(/devConsole\.registerCommand\('custom', \{\s*description: 'Custom command',\)/gm, "devConsole.registerCommand('custom', {\n                description: 'Custom command',");
        content = content.replace(/devConsole\.registerCommand\('temp', \{\)/gm, "devConsole.registerCommand('temp', {");
        content = content.replace(/registry\.register\('test', \{\s*description: 'Test command',\)/gm, "registry.register('test', {\n                description: 'Test command',");
        content = content.replace(/registry\.register\('test', \{\s*description: 'Test command',\s*aliases: \['t', 'tst'\],\)/gm, "registry.register('test', {\n                description: 'Test command',\n                aliases: ['t', 'tst'],");
        content = content.replace(/registry\.register\('temp', \{\s*aliases: \['tmp'\],\)/gm, "registry.register('temp', {\n                aliases: ['tmp'],");
        content = content.replace(/registry\.register\('echo', \{\)/gm, "registry.register('echo', {");
        content = content.replace(/registry\.register\('add', \{\)/gm, "registry.register('add', {");
        content = content.replace(/registry\.register\('test', \{\s*aliases: \['t'\],\)/gm, "registry.register('test', {\n                aliases: ['t'],");
        content = content.replace(/registry\.register\('error', \{\)/gm, "registry.register('error', {");
        content = content.replace(/registry\.register\('test', \{ \s*aliases: \['t'\],\)/gm, "registry.register('test', { \n                aliases: ['t'],");
        content = content.replace(/registry\.register\('test1', \{\s*description: 'Test command 1',\s*category: 'testing',\)/gm, "registry.register('test1', {\n                description: 'Test command 1',\n                category: 'testing',");
        content = content.replace(/registry\.register\('test2', \{\s*description: 'Test command 2',\s*category: 'testing',\s*hidden: true,\)/gm, "registry.register('test2', {\n                description: 'Test command 2',\n                category: 'testing',\n                hidden: true,");
        content = content.replace(/registry\.register\('help', \{\s*description: 'Help command',\s*usage: 'help \[command\]',\s*aliases: \['h', '\?'\],\)/gm, "registry.register('help', {\n                description: 'Help command',\n                usage: 'help [command]',\n                aliases: ['h', '?'],");
        
        // Fix keyboard event patterns
        content = content.replace(/ctrlKey: true,\s*shiftKey: true \)/gm, 'ctrlKey: true, \n                shiftKey: true');
        
        // Fix expect patterns
        content = content.replace(/expect\(mockGameEngine\.configurationManager\.set\)\.toHaveBeenCalledWith\(\)/gm, 'expect(mockGameEngine.configurationManager.set).toHaveBeenCalledWith(');
        content = content.replace(/{ validate: true, saveToStorage: false }\)/gm, '{ validate: true, saveToStorage: false }');
        
        // Fix toContain patterns
        content = content.replace(/expect\(commands\.toContain\(/gm, 'expect(commands).toContain(');
        content = content.replace(/expect\(commandNames\.toContain\(/gm, 'expect(commandNames).toContain(');
        content = content.replace(/expect\(list\.toContain\(/gm, 'expect(list).toContain(');
        content = content.replace(/expect\(completions\.toContain\(/gm, 'expect(completions).toContain(');
        content = content.replace(/expect\(help\.toContain\(/gm, 'expect(help).toContain(');
        content = content.replace(/expect\(names\.toContain\(/gm, 'expect(names).toContain(');
        content = content.replace(/expect\(result\.toContain\(/gm, 'expect(result).toContain(');
    }
    
    if (filePath.includes('GameStateCommands.test.ts')) {
        // Fix find patterns
        content = content.replace(/const setScoreCommand = mockConsole\.registerCommand\.mock\.calls\.find\(\s*call => call\[0\] === 'set-score'\)/gm, "const setScoreCommand = mockConsole.registerCommand.mock.calls.find(\n                call => call[0] === 'set-score'");
        content = content.replace(/const resetCommand = mockConsole\.registerCommand\.mock\.calls\.find\(\s*call => call\[0\] === 'reset'\)/gm, "const resetCommand = mockConsole.registerCommand.mock.calls.find(\n                call => call[0] === 'reset'");
        content = content.replace(/const runTestCommand = mockConsole\.registerCommand\.mock\.calls\.find\(\s*call => call\[0\] === 'run-test'\)/gm, "const runTestCommand = mockConsole.registerCommand.mock.calls.find(\n                call => call[0] === 'run-test'");
        
        // Fix expect patterns
        content = content.replace(/expect\(mockConsole\.print\)\.toHaveBeenCalledWith\(\)/gm, 'expect(mockConsole.print).toHaveBeenCalledWith(');
        content = content.replace(/expect\(result\.toContain\(/gm, 'expect(result).toContain(');
    }
    
    if (filePath.includes('PerformanceThresholdMonitor.test.ts')) {
        // Fix object patterns
        content = content.replace(/mockMonitor\.getCurrentMetrics\.mockReturnValueOnce\(\{\)/gm, 'mockMonitor.getCurrentMetrics.mockReturnValueOnce({');
        content = content.replace(/frame: { currentFPS: 40 }, \/\/ Below warning threshold \(\)45\)/gm, 'frame: { currentFPS: 40 }, // Below warning threshold (45)');
        content = content.replace(/frame: { currentFPS: 25 }, \/\/ Below critical threshold \(\)30\)/gm, 'frame: { currentFPS: 25 }, // Below critical threshold (30)');
        content = content.replace(/memory: { usedMemory: 160, pressureLevel: 0.3 }, \/\/ Above warning threshold \(\)150\)/gm, 'memory: { usedMemory: 160, pressureLevel: 0.3 }, // Above warning threshold (150)');
        content = content.replace(/game: { entityCount: 600 } \/\/ Entity warning\)/gm, 'game: { entityCount: 600 } // Entity warning');
        content = content.replace(/game: { entityCount: 100 }\)/gm, 'game: { entityCount: 100 }');
        content = content.replace(/game: { entityCount: 200 }\)/gm, 'game: { entityCount: 200 }');
        
        // Fix object definitions
        content = content.replace(/frame: { currentFPS: 60, frameTime: 16\.67, fpsVariance: 2\.0 },\)/gm, 'frame: { currentFPS: 60, frameTime: 16.67, fpsVariance: 2.0 },');
        
        // Fix push patterns
        content = content.replace(/monitor\.warningSystem\.notifications\.push\({\s*id: 'old1',\s*timestamp: oldTime,\s*persistent: false\)/gm, "monitor.warningSystem.notifications.push({\n                id: 'old1',\n                timestamp: oldTime,\n                persistent: false");
        content = content.replace(/monitor\.warningSystem\.notifications\.push\({\s*id: 'old2',\s*timestamp: oldTime,\s*persistent: true \/\/ Should not be cleaned up\)/gm, "monitor.warningSystem.notifications.push({\n                id: 'old2',\n                timestamp: oldTime,\n                persistent: true // Should not be cleaned up");
        content = content.replace(/monitor\.warningSystem\.notifications\.push\({\s*id: 'recent',\)/gm, "monitor.warningSystem.notifications.push({\n                id: 'recent',");
        
        // Fix expect patterns
        content = content.replace(/expect\(consoleLogSpy\.toHaveBeenCalledWith\(\)\)/gm, 'expect(consoleLogSpy).toHaveBeenCalledWith(');
        content = content.replace(/expect\.objectContaining\({\s*name: alert\.name,\s*description: alert\.description,\s*value: alert\.value,\)\s*severity: alert\.severity\)/gm, 'expect.objectContaining({\n                    name: alert.name,\n                    description: alert.description,\n                    value: alert.value,\n                    severity: alert.severity');
        content = content.replace(/expect\(monitor\.errorHandler\.handleError\)\.toHaveBeenCalledWith\(\)/gm, 'expect(monitor.errorHandler.handleError).toHaveBeenCalledWith(');
        
        // Fix history data push
        content = content.replace(/monitor\.historyManager\.data\.fps\.push\(\{\)/gm, 'monitor.historyManager.data.fps.push({');
    }
    
    if (filePath.includes('AdvancedPerformanceMonitor.test.ts')) {
        // Fix similar patterns
        content = content.replace(/expect\(errorHandlerSpy\.toHaveBeenCalledWith\(\)\)/gm, 'expect(errorHandlerSpy).toHaveBeenCalledWith(');
    }
    
    if (filePath.includes('ErrorNotificationSystem.test.ts')) {
        // Fix array patterns
        content = content.replace(/errors: \['error1', 'error2', 'error3', 'error4'\]\)/gm, "errors: ['error1', 'error2', 'error3', 'error4']");
        
        // Fix push patterns
        content = content.replace(/notificationSystem\.notificationHistory\.push\(\{\)/gm, 'notificationSystem.notificationHistory.push({');
        
        // Fix expect patterns
        content = content.replace(/expect\(console\.error\)\.toHaveBeenCalledWith\(\)/gm, 'expect(console.error).toHaveBeenCalledWith(');
        content = content.replace(/expect\(localStorage\.setItem\)\.toHaveBeenCalledWith\(\)/gm, 'expect(localStorage.setItem).toHaveBeenCalledWith(');
        content = content.replace(/expect\(mockFetch\.toHaveBeenCalledWith\(\)\)/gm, 'expect(mockFetch).toHaveBeenCalledWith(');
        content = content.replace(/headers: { 'Content-Type': 'application\/json' }\)/gm, "headers: { 'Content-Type': 'application/json' }");
    }
    
    if (filePath.includes('ErrorRecoveryTracker.test.ts')) {
        // Fix object patterns
        content = content.replace(/attempts: 10,\s*successes: 7,\s*failures: 3\)/gm, 'attempts: 10,\n                successes: 7,\n                failures: 3');
        
        // Fix async patterns
        content = content.replace(/session\)/gm, 'session');
    }
    
    // Final cleanup - ensure all patterns have proper closing
    content = content.replace(/\)\s*\n\s*\);/gm, ');\n            );');
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    }
}

// Process all test files
function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.test.ts')) {
            fixSyntaxErrors(filePath);
        }
    });
}

// Run the fixes
processDirectory('./test');
console.log('Syntax error fixes complete!');