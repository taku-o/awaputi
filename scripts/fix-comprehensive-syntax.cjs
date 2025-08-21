#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 包括的な構文エラー修正
 */
function fixComprehensiveSyntax(content, filePath) {
    let modified = false;
    
    // 1. 未終了の文字列リテラル修正
    // 'clientId: 'default,' -> 'clientId: 'default','
    content = content.replace(/clientId:\s*'default,/g, "clientId: 'default',");
    
    // 'RATE_LIMIT_EXCEEDED,' -> 'RATE_LIMIT_EXCEEDED'
    content = content.replace(/'RATE_LIMIT_EXCEEDED,/g, "'RATE_LIMIT_EXCEEDED'");
    content = content.replace(/'ENDPOINT_NOT_FOUND,/g, "'ENDPOINT_NOT_FOUND'");
    content = content.replace(/'INTERNAL_ERROR,/g, "'INTERNAL_ERROR'");
    
    // 2. 不完全な関数呼び出し修正
    // .then((result: any) => result.data); -> .then((result: any) => result.data));
    content = content.replace(/\.then\(\(result:\s*any\)\s*=>\s*result\.data\);/g, '.then((result: any) => result.data));');
    
    // 3. 配列やオブジェクトの未終了修正
    // { requestId } -> { requestId }
    content = content.replace(/\{\s*requestId\s*}\s*$/gm, '{ requestId }');
    
    // 4. 文字列リテラル終端修正
    content = content.replace(/version:\s*'1\.0\.0,/g, "version: '1.0.0',");
    content = content.replace(/'data_retrieval,/g, "'data_retrieval',");
    content = content.replace(/'aggregation,/g, "'aggregation',");
    content = content.replace(/'rate_limiting,/g, "'rate_limiting',");
    content = content.replace(/'anonymization,/g, "'anonymization',");
    content = content.replace(/'filtering,/g, "'filtering',");
    content = content.replace(/'sorting'/g, "'sorting'");
    
    // 5. プロパティの区切り修正
    content = content.replace(/(\w+):\s*([^,;{}]+);(?=\s*\w+\s*:)/g, '$1: $2,');
    
    // 6. メソッド定義の修正
    content = content.replace(/}\s*}$/gm, '    }');
    
    // 7. 文字列内のコンマ修正
    content = content.replace(/timestamp: new Date\(\)\.toISOString\(\)\s*;/g, "timestamp: new Date().toISOString(),");
    
    // 8. プロパティアクセサのセミコロン修正
    content = content.replace(/successRate: Math\.round\(\(this\.apiStats\.successfulRequests \/ this\.apiStats\.totalRequests\) \* 100\) : 0;/g, 
        'successRate: Math.round((this.apiStats.successfulRequests / this.apiStats.totalRequests) * 100) : 0,');
    
    // 9. 関数パラメータの閉じ括弧修正
    content = content.replace(/updateRateLimitSettings\(newSettings: any\)\s*{[^}]*}\s*}/g, (match) => {
        return match.replace(/}\s*}$/, '    }');
    });
    
    // 10. より具体的なAPIEndpointManager.ts修正
    if (filePath && filePath.includes('APIEndpointManager.ts')) {
        // APIEndpointManager.ts specific fixes
        content = content.replace(/this\.rateLimiting = \{ \.\.\.this\.rateLimiting, \.\.\.newSettings }\s*}/g, 
            'this.rateLimiting = { ...this.rateLimiting, ...newSettings };\n    }');
        
        // destroy method fix
        content = content.replace(/destroy\(\)\s*{[^}]*clear\(\);[^}]*}$/g, 
            'destroy() {\n        this.endpoints.clear();\n        this.rateLimiting.requestHistory.clear();\n        console.log(\'API Endpoint Manager destroyed\');\n    }');
    }
    
    // 11. ShareDialog.tsの修正
    if (filePath && filePath.includes('ShareDialog.ts')) {
        // ShareDialog specific fixes
        content = content.replace(/constructor\(socialSharingManager, options = \{\)/g, 
            'constructor(socialSharingManager: any, options: any = {})');
        
        // 大量の文字列修正
        content = content.replace(/title: options\.title \|\| '共有,/g, "title: options.title || '共有',");
        content = content.replace(/height: options\.height \|\| 'auto,/g, "height: options.height || 'auto',");
        content = content.replace(/maxHeight: options\.maxHeight \|\| '80vh,/g, "maxHeight: options.maxHeight || '80vh',");
        content = content.replace(/theme: options\.theme \|\| 'default',/g, "theme: options.theme || 'default',");
    }
    
    // 12. MobileTestReporter.tsの修正
    if (filePath && filePath.includes('MobileTestReporter.ts')) {
        // 基本的な文字列修正
        content = content.replace(/title: 'Mobile Test Report,/g, "title: 'Mobile Test Report',");
        content = content.replace(/theme: 'default,/g, "theme: 'default',");
        content = content.replace(/subject: 'Mobile Test Results'/g, "subject: 'Mobile Test Results',");
        
        // for loop修正
        content = content.replace(/for\(const \[test, data\] of Array\.from\(performance\.entries\(\)\)\)\)\)/g, 
            'for(const [test, data] of Array.from(performance.entries()))');
        content = content.replace(/for\(const \[key, data\] of Array\.from\(compatibility\.entries\(\)\)\)\)\)/g, 
            'for(const [key, data] of Array.from(compatibility.entries()))');
        
        // 数値の修正
        content = content.replace(/data\.duration\.toFixed\(2\"\}\"/g, 'data.duration.toFixed(2)');
        content = content.replace(/\$\{slowTests\.length'/g, '${slowTests.length}');
        
        // 条件文の修正
        content = content.replace(/if\(report\.results\.errors\.length > 0\} \{'/g, 
            'if(report.results.errors.length > 0) {');
        content = content.replace(/if\(report\.results\.performance\)\)\.length === 0\} \{'/g, 
            'if(Object.keys(report.results.performance).length === 0) {');
    }
    
    // 13. 他の一般的なパターンの修正
    content = content.replace(/\s*},\s*,/g, ' },');
    content = content.replace(/\s*};\s*,/g, ' },');
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/;;\s*/g, ';');
    content = content.replace(/,,\s*/g, ',');
    
    // 14. 不適切な引用符の修正
    content = content.replace(/(['\"`])\s*(['\"`])/g, '$1');
    
    // 15. 関数呼び出しの修正
    content = content.replace(/Math\.floor\(rate \* 100\}%\)/g, 'Math.floor(rate * 100)%');
    content = content.replace(/\$\{data\.duration\.toFixed\(2\}ms\}/g, '${data.duration.toFixed(2)}ms');
    
    // 修正が行われたかチェック
    const originalContent = arguments[0];
    if (content !== originalContent) {
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
        const result = fixComprehensiveSyntax(content, filePath);
        
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

/**
 * ディレクトリを再帰的に処理
 */
function processDirectory(dir) {
    let totalFixed = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            totalFixed += processDirectory(filePath);
        } else if (stat.isFile() && file.endsWith('.ts')) {
            if (processFile(filePath)) {
                console.log(`Fixed: ${filePath}`);
                totalFixed++;
            }
        }
    }
    
    return totalFixed;
}

// メイン処理
console.log('Fixing comprehensive syntax errors in TypeScript files...\n');

// 特に問題のあるファイルを優先処理
const priorityFiles = [
    'src/analytics/analytics-api/APIEndpointManager.ts',
    'src/analytics/analytics-api/DataAggregationProcessor.ts',
    'src/analytics/analytics-api/DataExportHandler.ts',
    'src/core/ShareDialog.ts',
    'src/tests/mobile/mobile-test-suite/MobileTestReporter.ts'
];

let totalFixed = 0;

// 優先ファイルを先に修正
for (const file of priorityFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        if (processFile(filePath)) {
            console.log(`Priority fixed: ${filePath}`);
            totalFixed++;
        }
    }
}

// 残りのファイルを修正
const srcFixed = processDirectory(path.join(process.cwd(), 'src'));
totalFixed += srcFixed;

console.log(`\nTotal files fixed: ${totalFixed}`);