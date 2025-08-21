#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * ShareDialog.ts の大量構文エラー修正
 */
function fixShareDialog(content) {
    let modified = false;
    
    // 1. コンストラクタパラメータの修正
    content = content.replace(
        'constructor(socialSharingManager, options = {)',
        'constructor(socialSharingManager: any, options: any = {})'
    );
    
    // 2. 基本的な文字列リテラル未終了修正
    content = content.replace(/title: options\.title \|\| '共有,/g, "title: options.title || '共有',");
    content = content.replace(/height: options\.height \|\| 'auto,/g, "height: options.height || 'auto',");
    content = content.replace(/maxHeight: options\.maxHeight \|\| '80vh,/g, "maxHeight: options.maxHeight || '80vh',");
    content = content.replace(/borderRadius: options\.borderRadius \|\| '12px,/g, "borderRadius: options.borderRadius || '12px',");
    content = content.replace(/fontSize: options\.fontSize \|\| '14px,/g, "fontSize: options.fontSize || '14px',");
    content = content.replace(/textColor: options\.textColor \|\| '#333333,/g, "textColor: options.textColor || '#333333',");
    
    // 3. CSS プロパティの修正
    content = content.replace(/position: 'fixed,/g, "position: 'fixed',");
    content = content.replace(/top: '0,/g, "top: '0',");
    content = content.replace(/left: '0,/g, "left: '0',");
    content = content.replace(/width: '100%,/g, "width: '100%',");
    content = content.replace(/height: '100%,/g, "height: '100%',");
    content = content.replace(/display: 'flex,/g, "display: 'flex',");
    content = content.replace(/justifyContent: 'center,/g, "justifyContent: 'center',");
    content = content.replace(/alignItems: this\.getVerticalAlignment\(,/g, "alignItems: this.getVerticalAlignment(),");
    
    // 4. メソッドチェーンとバインドの修正
    content = content.replace(/\.bind\(this,/g, '.bind(this)');
    content = content.replace(/\.bind\(this\s+\}/g, '.bind(this)');
    
    // 5. セミコロンとカンマの修正
    content = content.replace(/allowMessageEdit: options\.allowMessageEdit === true;/g, 'allowMessageEdit: options.allowMessageEdit === true');
    content = content.replace(/reducedMotion: options\.reducedMotion === true;/g, 'reducedMotion: options.reducedMotion === true');
    content = content.replace(/requireAuthentication: boolean;/g, 'requireAuthentication: boolean');
    content = content.replace(/lastRequestTime: number \| null;/g, 'lastRequestTime: number | null');
    
    // 6. DOM要素の属性修正
    content = content.replace(/setAttribute\('type', 'button\);'/g, "setAttribute('type', 'button');");
    content = content.replace(/setAttribute\('for', 'share-message-editor'\);/g, "setAttribute('for', 'share-message-editor');");
    content = content.replace(/setAttribute\('maxlength', '280\),/g, "setAttribute('maxlength', '280');");
    
    // 7. プラットフォーム設定の修正
    content = content.replace(/'web-share': \{ label: '共有', color: '#007AFF'/g, "'web-share': { label: '共有', color: '#007AFF' }");
    content = content.replace(/'twitter': \{ label: 'Twitter', color: '#1DA1F2'/g, "'twitter': { label: 'Twitter', color: '#1DA1F2' }");
    content = content.replace(/'facebook': \{ label: 'Facebook', color: '#1877F2'/g, "'facebook': { label: 'Facebook', color: '#1877F2' }");
    
    // 8. アイコン設定の修正
    content = content.replace(/'twitter': '🐦,/g, "'twitter': '🐦',");
    content = content.replace(/'facebook': '📘,/g, "'facebook': '📘',");
    content = content.replace(/'line': '💬,/g, "'line': '💬',");
    content = content.replace(/'whatsapp': '📱,/g, "'whatsapp': '📱',");
    content = content.replace(/'telegram': '✈️,/g, "'telegram': '✈️',");
    content = content.replace(/'email': '📧'/g, "'email': '📧',");
    
    // 9. 括弧とクロージングの修正
    content = content.replace(/\}\s*};/g, '        }');
    content = content.replace(/\}\s*\s*\}/g, '    }');
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/;;\s*/g, ';');
    
    // 10. 関数とメソッドの修正
    content = content.replace(/generateHTMLFooter\(report: TestReport\): string \{ return `/g, 'generateHTMLFooter(report: TestReport): string {\n        return `');
    content = content.replace(/log\(message, data = null, level = 'info' \{'/g, "log(message: string, data: any = null, level: string = 'info') {");
    
    if (content !== arguments[0]) {
        modified = true;
    }
    
    return { content, modified };
}

/**
 * MobileTestReporter.ts の大量構文エラー修正
 */
function fixMobileTestReporter(content) {
    let modified = false;
    
    // 1. インターフェース定義の完全修正
    content = content.replace(/interface ReportConfig \{ formats: string\[\],/g, 
        'interface ReportConfig {\n    formats: string[];');
    
    content = content.replace(/interface TemplateConfig \{ html: \{ titl,e: string,/g, 
        'interface TemplateConfig {\n    html: {\n        title: string;');
    
    // 2. インターフェースのプロパティセパレータ修正
    content = content.replace(/(\w+): ([^,;{}]+),(?=\s*\w+\s*:)/g, '$1: $2;');
    content = content.replace(/(\w+): ([^,;{}]+);(?=\s*})/g, '$1: $2');
    
    // 3. 基本的な文字列リテラル修正
    content = content.replace(/title: 'Mobile Test Report,/g, "title: 'Mobile Test Report',");
    content = content.replace(/theme: 'default,/g, "theme: 'default',");
    content = content.replace(/subject: 'Mobile Test Results'/g, "subject: 'Mobile Test Results',");
    content = content.replace(/includeAttachments: boolean;/g, 'includeAttachments: boolean');
    
    // 4. プライベートプロパティの修正
    content = content.replace(/private, maxHistorySize: number;/g, 'private maxHistorySize: number;');
    content = content.replace(/private mobileTestSuite: any,/g, 'private mobileTestSuite: any;');
    
    // 5. for ループの修正
    content = content.replace(/for\(const \[test, data\] of Array\.from\(performance\.entries\(\)\)\)\)\)/g, 
        'for(const [test, data] of Array.from(performance.entries()))');
    content = content.replace(/for\(const \[key, data\] of Array\.from\(compatibility\.entries\(\)\)\)\)\)/g, 
        'for(const [key, data] of Array.from(compatibility.entries()))');
    
    // 6. 関数パラメータの修正
    content = content.replace(/generateTestReport\(options: Partial<ReportConfig> = \{ \): TestReport \{ \}/g,
        'generateTestReport(options: Partial<ReportConfig> = {}): TestReport {');
    content = content.replace(/exportReport\(format: string = 'json', options: Record<string, any> = \{ \): any \{/g,
        'exportReport(format: string = \'json\', options: Record<string, any> = {}): any {');
    
    // 7. テンプレートリテラルの修正
    content = content.replace(/data\.duration\.toFixed\(2\"\}\"/g, 'data.duration.toFixed(2)');
    content = content.replace(/\$\{slowTests\.length'/g, '${slowTests.length}');
    content = content.replace(/\$\{data\.duration\.toFixed\(2\}ms\}/g, '${data.duration.toFixed(2)}ms');
    
    // 8. 条件文の修正
    content = content.replace(/if\(report\.results\.errors\.length > 0\} \{'/g, 'if(report.results.errors.length > 0) {');
    content = content.replace(/if\(report\.results\.performance\)\)\.length === 0\} \{'/g, 'if(Object.keys(report.results.performance).length === 0) {');
    
    // 9. HTMLテンプレートの修正
    content = content.replace(/return `<!DOCTYPE html>,'/g, 'return `<!DOCTYPE html>');
    content = content.replace(/<html lang=\"ja\">\",\"/g, '<html lang="ja">');
    content = content.replace(/<head>,/g, '<head>');
    content = content.replace(/<title>\$\{config\.title\}<\/title>\"/g, '<title>${config.title}</title>');
    
    // 10. 一般的なパターンの修正
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/;;\s*/g, ';');
    content = content.replace(/\s*},\s*,/g, ' },');
    content = content.replace(/\s*};\s*,/g, ' },');
    
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
        
        if (filePath.includes('ShareDialog.ts')) {
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
console.log('Fixing high-error files...\n');

const highErrorFiles = [
    'src/core/ShareDialog.ts',
    'src/tests/mobile/mobile-test-suite/MobileTestReporter.ts'
];

let totalFixed = 0;

for (const file of highErrorFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        if (processFile(filePath)) {
            console.log(`High-error file fixed: ${filePath}`);
            totalFixed++;
        } else {
            console.log(`No changes needed: ${filePath}`);
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

console.log(`\nTotal high-error files fixed: ${totalFixed}`);