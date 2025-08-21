#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * APIEndpointManager.ts の構文修正
 */
function fixAPIEndpointManager(content) {
    let modified = false;
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 1. コンストラクタのクロージング問題を修正
        if (line.includes('this.apiStats.lastRequestTime = null')) {
            newLines.push(line);
            newLines.push('        };');
            newLines.push('');
            newLines.push('        this.initialize();');
            newLines.push('    }');
            modified = true;
            continue;
        }
        
        // 2. 文字列リテラルの未終了修正
        if (line.includes("'default,")) {
            line = line.replace("'default,", "'default',");
            modified = true;
        }
        
        // 3. エラーレスポンスの文字列修正
        if (line.includes("'RATE_LIMIT_EXCEEDED,")) {
            line = line.replace("'RATE_LIMIT_EXCEEDED,", "'RATE_LIMIT_EXCEEDED',");
            modified = true;
        }
        if (line.includes("'ENDPOINT_NOT_FOUND,")) {
            line = line.replace("'ENDPOINT_NOT_FOUND,", "'ENDPOINT_NOT_FOUND',");
            modified = true;
        }
        if (line.includes("'INTERNAL_ERROR,")) {
            line = line.replace("'INTERNAL_ERROR,", "'INTERNAL_ERROR',");
            modified = true;
        }
        
        // 4. メソッドパラメータの修正
        if (line.includes('async handleRequest(endpoint: string, query: any = {}, options: any = {}) {')) {
            line = line.replace('options: any = {}', 'options: any = {}');
            modified = true;
        }
        
        // 5. 未終了の関数呼び出し修正
        if (line.includes('.then((result: any) => result.data);')) {
            line = line.replace('.then((result: any) => result.data);', '.then((result: any) => result.data));');
            modified = true;
        }
        
        // 6. オブジェクトプロパティのセパレータ修正
        if (line.includes('anonymized: isAnonymized,);')) {
            line = line.replace('anonymized: isAnonymized,);', 'anonymized: isAnonymized');
            newLines.push(line);
            newLines.push('            });');
            modified = true;
            continue;
        }
        
        // 7. エラーハンドリングブロックの修正
        if (line.includes('const responseTime = Math.max(performance.now() - startTime, 0.1),')) {
            line = line.replace(',', ';');
            modified = true;
        }
        
        // 8. returnステートメントの修正
        if (line.includes('return this.createErrorResponse(\'INTERNAL_ERROR,')) {
            line = line.replace("'INTERNAL_ERROR,", "'INTERNAL_ERROR',");
            line = line.replace('{ requestId     }', '{ requestId });');
            modified = true;
        }
        
        // 9. 括弧の未終了修正
        if (line.includes('if (processedQuery.startDate && typeof processedQuery.startDate === \'string\') {')) {
            newLines.push(line);
            newLines.push('            processedQuery.startDate = new Date(processedQuery.startDate).getTime();');
            newLines.push('        }');
            modified = true;
            continue;
        }
        
        // 10. プロパティアクセスの修正
        if (line.includes('if (!this.rateLimiting.enabled) {')) {
            newLines.push(line);
            newLines.push('            return true;');
            newLines.push('        }');
            modified = true;
            continue;
        }
        
        newLines.push(line);
    }
    
    return { content: newLines.join('\n'), modified };
}

/**
 * ShareDialog.ts の構文修正
 */
function fixShareDialog(content) {
    let modified = false;
    
    // 1. コンストラクタパラメータの修正
    content = content.replace(
        'constructor(socialSharingManager, options = {)',
        'constructor(socialSharingManager: any, options: any = {})'
    );
    
    // 2. 文字列リテラル修正
    content = content.replace(/title: options\.title \|\| '共有,/g, "title: options.title || '共有',");
    content = content.replace(/height: options\.height \|\| 'auto,/g, "height: options.height || 'auto',");
    content = content.replace(/maxHeight: options\.maxHeight \|\| '80vh,/g, "maxHeight: options.maxHeight || '80vh',");
    content = content.replace(/borderRadius: options\.borderRadius \|\| '12px,/g, "borderRadius: options.borderRadius || '12px',");
    content = content.replace(/fontSize: options\.fontSize \|\| '14px,/g, "fontSize: options.fontSize || '14px',");
    
    // 3. メソッドチェーンの修正
    content = content.replace(/\.bind\(this,/g, '.bind(this)');
    
    // 4. セミコロンとカンマの修正
    content = content.replace(/allowMessageEdit: options\.allowMessageEdit === true;/g, 'allowMessageEdit: options.allowMessageEdit === true');
    content = content.replace(/reducedMotion: options\.reducedMotion === true;/g, 'reducedMotion: options.reducedMotion === true');
    
    // 5. DOM要素の属性修正
    content = content.replace(/setAttribute\('type', 'button\);'/g, "setAttribute('type', 'button');");
    
    if (content !== arguments[0]) {
        modified = true;
    }
    
    return { content, modified };
}

/**
 * MobileTestReporter.ts の構文修正
 */
function fixMobileTestReporter(content) {
    let modified = false;
    
    // 1. インターフェース定義の修正
    content = content.replace(/interface ReportConfig \{ formats: string\[\],/g, 'interface ReportConfig {\n    formats: string[];');
    content = content.replace(/interface TemplateConfig \{ html: \{ titl,e: string,/g, 'interface TemplateConfig {\n    html: {\n        title: string;');
    
    // 2. 文字列リテラル修正
    content = content.replace(/title: 'Mobile Test Report,/g, "title: 'Mobile Test Report',");
    content = content.replace(/theme: 'default,/g, "theme: 'default',");
    content = content.replace(/subject: 'Mobile Test Results'/g, "subject: 'Mobile Test Results',");
    
    // 3. for ループの修正
    content = content.replace(/for\(const \[test, data\] of Array\.from\(performance\.entries\(\)\)\)\)\)/g, 
        'for(const [test, data] of Array.from(performance.entries()))');
    content = content.replace(/for\(const \[key, data\] of Array\.from\(compatibility\.entries\(\)\)\)\)\)/g, 
        'for(const [key, data] of Array.from(compatibility.entries()))');
    
    // 4. テンプレートリテラル修正
    content = content.replace(/data\.duration\.toFixed\(2\"\}\"/g, 'data.duration.toFixed(2)');
    content = content.replace(/\$\{slowTests\.length'/g, '${slowTests.length}');
    
    // 5. 条件文の修正
    content = content.replace(/if\(report\.results\.errors\.length > 0\} \{'/g, 'if(report.results.errors.length > 0) {');
    content = content.replace(/if\(report\.results\.performance\)\)\.length === 0\} \{'/g, 'if(Object.keys(report.results.performance).length === 0) {');
    
    // 6. プロパティアクセスの修正
    content = content.replace(/private, maxHistorySize: number;/g, 'private maxHistorySize: number;');
    
    if (content !== arguments[0]) {
        modified = true;
    }
    
    return { content, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let result = { content, modified: false };
        
        if (filePath.includes('APIEndpointManager.ts')) {
            result = fixAPIEndpointManager(content);
        } else if (filePath.includes('ShareDialog.ts')) {
            result = fixShareDialog(content);
        } else if (filePath.includes('MobileTestReporter.ts')) {
            result = fixMobileTestReporter(content);
        }
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// メイン処理
console.log('Fixing critical file syntax errors...\n');

const criticalFiles = [
    'src/analytics/analytics-api/APIEndpointManager.ts',
    'src/core/ShareDialog.ts',
    'src/tests/mobile/mobile-test-suite/MobileTestReporter.ts'
];

let totalFixed = 0;

for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        if (processFile(filePath)) {
            console.log(`Critical file fixed: ${filePath}`);
            totalFixed++;
        } else {
            console.log(`No changes needed: ${filePath}`);
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

console.log(`\nTotal critical files fixed: ${totalFixed}`);