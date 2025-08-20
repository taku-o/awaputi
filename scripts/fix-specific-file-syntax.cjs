const fs = require('fs');

// 特定ファイル専用の構文エラー修正スクリプト
async function fixSpecificFileSyntax() {
    console.log('特定ファイルの構文エラー修正を開始...');
    
    const apiManagerPath = '/Users/taku-o/Documents/workspaces/awaputi/src/analytics/analytics-api/APIEndpointManager.ts';
    const dataProcessorPath = '/Users/taku-o/Documents/workspaces/awaputi/src/analytics/analytics-api/DataAggregationProcessor.ts';
    const profileManagerPath = '/Users/taku-o/Documents/workspaces/awaputi/src/accessibility/AccessibilityProfileManager.ts';
    
    let totalModifications = 0;
    
    // APIEndpointManager.tsの修正
    try {
        console.log('APIEndpointManager.tsを修正中...');
        const content = fs.readFileSync(apiManagerPath, 'utf8');
        let fixed = content;
        let modifications = 0;
        
        // Pattern 1: 誤った文字列リテラル修正
        // '}' -> }
        fixed = fixed.replace(/\s*\}'$/gm, () => {
            modifications++;
            return '    }';
        });
        
        // Pattern 2: 不完全なtryブロック修正
        // try {' -> try {
        fixed = fixed.replace(/try\s*\{\s*'/g, () => {
            modifications++;
            return 'try {';
        });
        
        // Pattern 3: 不完全なメソッド定義修正
        // registerStandardEndpoints('')'; -> registerStandardEndpoints() {
        fixed = fixed.replace(/(\w+)\(''\)'?\s*;/g, (match, methodName) => {
            if (methodName === 'registerStandardEndpoints') {
                modifications++;
                return `${methodName}() {`;
            }
            return match;
        });
        
        // Pattern 4: 非終端文字列とメソッド呼び出し修正
        // this.registerEndpoint('/sessions', async (query: any') => {  ' }'
        // -> this.registerEndpoint('/sessions', async (query: any) => {
        fixed = fixed.replace(/async\s*\(\s*(\w+):\s*any\s*'\)\s*=>\s*\{\s*'\s*\}/g, (match, paramName) => {
            modifications++;
            return `async (${paramName}: any) => {`;
        });
        
        // Pattern 5: return文の修正
        // return await this.storageManager.getData('sessionData', query);' }'
        // -> return await this.storageManager.getData('sessionData', query);
        fixed = fixed.replace(/(return\s+[^;]+);'\s*\}'/g, (match, returnStatement) => {
            modifications++;
            return returnStatement + ';';
        });
        
        // Pattern 6: メソッド呼び出しの終了修正
        // });' -> });
        fixed = fixed.replace(/\}\s*\)\s*;'\s*/g, () => {
            modifications++;
            return '        });';
        });
        
        if (modifications > 0) {
            fs.writeFileSync(apiManagerPath, fixed);
            totalModifications += modifications;
            console.log(`APIEndpointManager.tsで${modifications}個の修正を実行`);
        }
    } catch (error) {
        console.error('APIEndpointManager.ts修正エラー:', error.message);
    }
    
    // DataAggregationProcessor.tsの修正
    try {
        console.log('DataAggregationProcessor.tsを修正中...');
        const content = fs.readFileSync(dataProcessorPath, 'utf8');
        let fixed = content;
        let modifications = 0;
        
        // Pattern 1: 不完全なメソッド呼び出し修正
        // return this.createSuccessResponse(aggregatedData, {})
        // aggregationRules,); -> return this.createSuccessResponse(aggregatedData, {
        //     aggregationRules,
        fixed = fixed.replace(/return\s+([^;,]+),\s*\{\s*\}\s*([^;]+),\)/g, (match, method, params) => {
            modifications++;
            return `return ${method}, {${params}});`;
        });
        
        if (modifications > 0) {
            fs.writeFileSync(dataProcessorPath, fixed);
            totalModifications += modifications;
            console.log(`DataAggregationProcessor.tsで${modifications}個の修正を実行`);
        }
    } catch (error) {
        console.error('DataAggregationProcessor.ts修正エラー:', error.message);
    }
    
    console.log(`\n特定ファイル修正完了:`);
    console.log(`- 総修正数: ${totalModifications}`);
    
    return { totalModifications };
}

// 実行
fixSpecificFileSyntax().catch(console.error);