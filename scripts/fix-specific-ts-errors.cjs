const fs = require('fs');

// 特定のTypeScriptエラーパターンの修正スクリプト
async function fixSpecificTypeScriptErrors() {
    console.log('特定のTypeScriptエラーパターンの修正を開始...');
    
    // APIEndpointManager.tsの修正
    fixAPIEndpointManager();
    
    // DataAggregationProcessor.tsの修正
    fixDataAggregationProcessor();
    
    // AccessibilityProfileManager.tsの修正
    fixAccessibilityProfileManager();
}

function fixAPIEndpointManager() {
    const filePath = '/Users/taku-o/Documents/workspaces/awaputi/src/analytics/analytics-api/APIEndpointManager.ts';
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let fixed = content;
        let modifications = 0;
        
        // Fix: allowedOrigins: ['*], -> allowedOrigins: ['*'],
        fixed = fixed.replace(/allowedOrigins:\s*\['[*]],/g, () => {
            modifications++;
            return "allowedOrigins: ['*'],";
        });
        
        // Fix: console.log('API Endpoint Manager initialized');'    }
        // -> console.log('API Endpoint Manager initialized');
        fixed = fixed.replace(/console\.log\(([^)]+)\);'\s*\}/g, (match, message) => {
            modifications++;
            return `console.log(${message});`;
        });
        
        // Fix: const requestId = this.generateRequestId(''';
        // -> const requestId = this.generateRequestId();
        fixed = fixed.replace(/this\.generateRequestId\(['"]+';\s*$/gm, () => {
            modifications++;
            return 'this.generateRequestId();';
        });
        
        // Fix: skipRateLimit: false);
        // -> skipRateLimit: false,
        fixed = fixed.replace(/(\w+):\s*(false|true)\);/g, (match, prop, value) => {
            modifications++;
            return `${prop}: ${value},`;
        });
        
        // Fix: ...options }
        // -> ...options
        fixed = fixed.replace(/\.\.\.(\w+)\s*\}/g, (match, spread) => {
            modifications++;
            return `...${spread}`;
        });
        
        // Fix: handler,
        //      options: {
        //      } (on same line)
        fixed = fixed.replace(/(\w+),\s*(\w+):\s*\{[^}]*\}\s*\n\s*\}/g, (match) => {
            if (match.includes('requireAuth') || match.includes('rateLimit')) {
                modifications++;
                return match.replace(/\}\s*\n\s*\}/, '},\n                }');
            }
            return match;
        });
        
        // Fix: const allowedSortFields = ['timestamp', 'sessionId', 'bubbleType', 'score', 'duration];
        // -> const allowedSortFields = ['timestamp', 'sessionId', 'bubbleType', 'score', 'duration'];
        fixed = fixed.replace(/\[([^\]]+[^'\]])];/g, (match, content) => {
            if (content.includes("'") && !content.endsWith("'")) {
                modifications++;
                return `[${content}'];`;
            }
            return match;
        });
        
        // Fix: return Array.from(this.endpoints.keys(); }
        // -> return Array.from(this.endpoints.keys()); }
        fixed = fixed.replace(/return\s+Array\.from\([^)]+\);\s*\}/g, (match) => {
            if (!match.includes('()')) {
                modifications++;
                return match.replace(/keys\(\);/, 'keys());');
            }
            return match;
        });
        
        // Fix: stats: { ...this.apiStats },
        // -> stats: { ...this.apiStats },
        fixed = fixed.replace(/stats:\s*\{\s*\.\.\.this\.apiStats\s*\},/g, () => {
            modifications++;
            return 'stats: { ...this.apiStats },';
        });
        
        if (modifications > 0) {
            fs.writeFileSync(filePath, fixed);
            console.log(`APIEndpointManager.ts: ${modifications}個の修正を実行`);
        }
        
    } catch (error) {
        console.error('APIEndpointManager.ts修正エラー:', error.message);
    }
}

function fixDataAggregationProcessor() {
    const filePath = '/Users/taku-o/Documents/workspaces/awaputi/src/analytics/analytics-api/DataAggregationProcessor.ts';
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let fixed = content;
        let modifications = 0;
        
        // Fix: dataTypes = ['sessionData],
        // -> dataTypes = ['sessionData'],
        fixed = fixed.replace(/dataTypes\s*=\s*\[(['"][^'"]+['"])\],/g, (match, item) => {
            modifications++;
            return `dataTypes = [${item}],`;
        });
        
        // Fix: const { period = 'last7d' } = query;
        //      ';
        fixed = fixed.replace(/(\{[^}]+\}\s*=\s*[^;]+);\s*';\s*$/gm, (match, statement) => {
            modifications++;
            return statement + ';';
        });
        
        // Fix: await Promise.all([);]'
        // -> await Promise.all([
        fixed = fixed.replace(/await\s+Promise\.all\(\[\);]'/g, () => {
            modifications++;
            return 'await Promise.all([';
        });
        
        // Fix: .then(r => r || []),''
        // -> .then(r => r || []),
        fixed = fixed.replace(/\.then\([^)]+\)\),\s*''/g, (match) => {
            modifications++;
            return match.replace(/,\s*''/, ',');
        });
        
        // Fix return hash.toString(16);
        //    return hash.toString(36}.substr(2, 9})`;
        fixed = fixed.replace(/toString\((\d+)\}\.substr/g, (match, radix) => {
            modifications++;
            return `toString(${radix}).substr`;
        });
        
        // Fix: if (values.length === 0') continue;
        // -> if (values.length === 0) continue;
        fixed = fixed.replace(/if\s*\(([^)]+)'\)\s*continue;/g, (match, condition) => {
            modifications++;
            return `if (${condition}) continue;`;
        });
        
        if (modifications > 0) {
            fs.writeFileSync(filePath, fixed);
            console.log(`DataAggregationProcessor.ts: ${modifications}個の修正を実行`);
        }
        
    } catch (error) {
        console.error('DataAggregationProcessor.ts修正エラー:', error.message);
    }
}

function fixAccessibilityProfileManager() {
    const filePath = '/Users/taku-o/Documents/workspaces/awaputi/src/accessibility/AccessibilityProfileManager.ts';
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let fixed = content;
        let modifications = 0;
        
        // Fix: interface ProfileConfig { enabled: boolean,
        // -> interface ProfileConfig { 
        //      enabled: boolean;
        fixed = fixed.replace(/interface\s+(\w+)\s*\{\s*(\w+):\s*(\w+),/g, (match, name, prop, type) => {
            modifications++;
            return `interface ${name} {\n    ${prop}: ${type};`;
        });
        
        // Fix: profileAnalytics: boolean }
        // -> profileAnalytics: boolean;
        // }
        fixed = fixed.replace(/(\w+):\s*(boolean|string|number)\s*\}\s*$/gm, (match, prop, type, offset, string) => {
            // Check if this is the last property in interface
            const beforeMatch = string.substring(0, offset);
            if (beforeMatch.lastIndexOf('interface') > beforeMatch.lastIndexOf('}')) {
                modifications++;
                return `${prop}: ${type};\n}`;
            }
            return match;
        });
        
        // Fix: textScaling?: number;''
        // -> textScaling?: number;
        fixed = fixed.replace(/(\w+\??:\s*[^;]+);''/g, (match, declaration) => {
            modifications++;
            return declaration + ';';
        });
        
        // Fix: screenReaders: ['nvda', 'jaws', 'voiceOver],'';
        // -> screenReaders: ['nvda', 'jaws', 'voiceOver'],
        fixed = fixed.replace(/(\[[^\]]+)\],\s*'';/g, (match, arrayContent) => {
            if (!arrayContent.includes("']")) {
                modifications++;
                return arrayContent + "'],";
            }
            return match;
        });
        
        // Fix: console.log('ProfileManager initialization completed);' }
        // -> console.log('ProfileManager initialization completed');
        fixed = fixed.replace(/console\.(log|warn|error)\(([^)]+)\);'\s*\}/g, (match, method, message) => {
            modifications++;
            return `console.${method}(${message}');`;
        });
        
        // Fix: createProfile(name: string, settings: ProfileSettings, category: AccessibilityProfile['category] = 'custom): 
        // -> createProfile(name: string, settings: ProfileSettings, category: AccessibilityProfile['category'] = 'custom'):
        fixed = fixed.replace(/AccessibilityProfile\['(\w+)\]/g, (match, prop) => {
            modifications++;
            return `AccessibilityProfile['${prop}']`;
        });
        
        // Fix: const profileId = this.generateProfileId(''';
        // -> const profileId = this.generateProfileId();
        //     const profile = {
        //         id: profileId,
        //         name,
        fixed = fixed.replace(/this\.generateProfileId\(['"]+';\s*$/gm, (match) => {
            modifications++;
            return 'this.generateProfileId();\n        const profile = {\n            id: profileId,\n            name,';
        });
        
        if (modifications > 0) {
            fs.writeFileSync(filePath, fixed);
            console.log(`AccessibilityProfileManager.ts: ${modifications}個の修正を実行`);
        }
        
    } catch (error) {
        console.error('AccessibilityProfileManager.ts修正エラー:', error.message);
    }
}

// 実行
fixSpecificTypeScriptErrors().catch(console.error);