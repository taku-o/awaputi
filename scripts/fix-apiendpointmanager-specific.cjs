const fs = require('fs');

// APIEndpointManager.ts専用の修正スクリプト
async function fixAPIEndpointManagerSpecific() {
    console.log('APIEndpointManager.ts専用の修正を開始...');
    
    const filePath = '/Users/taku-o/Documents/workspaces/awaputi/src/analytics/analytics-api/APIEndpointManager.ts';
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let fixed = content;
        let modifications = 0;
        
        // Pattern 1: registerEndpoint呼び出しの修正
        // return await this.storageManager.getData('sessionData', query);'    }
        // }');
        // -> return await this.storageManager.getData('sessionData', query);
        // });
        fixed = fixed.replace(/(return\s+await\s+[^;]+);'\s*\}\s*\}'\);/g, (match, returnStatement) => {
            modifications++;
            return returnStatement + ';\n        });';
        });
        
        // Pattern 2: 不要な文字列リテラルとセミコロンの削除
        // ';
        // ->（削除）
        fixed = fixed.replace(/^\s*';\s*$/gm, () => {
            modifications++;
            return '';
        });
        
        // Pattern 3: コメント行の修正
        // * 標準エンドポイントの登録'
        // */''
        // -> * 標準エンドポイントの登録
        // */
        fixed = fixed.replace(/(\*[^']*)'$/gm, (match, comment) => {
            modifications++;
            return comment;
        });
        
        fixed = fixed.replace(/(\*\/)''/g, (match, closing) => {
            modifications++;
            return closing;
        });
        
        // Pattern 4: メソッド定義行の文字列リテラル削除
        // preprocessQuery(query') {
        // -> preprocessQuery(query) {
        fixed = fixed.replace(/(\w+)\(([\w\s,:]+)'\)\s*\{/g, (match, methodName, params) => {
            modifications++;
            return `${methodName}(${params}) {`;
        });
        
        // Pattern 5: getAPIMetadata関数の修正
        // getAPIMetadata(''';
        // -> getAPIMetadata() {
        //     return {
        fixed = fixed.replace(/getAPIMetadata\('*\s*;/g, () => {
            modifications++;
            return 'getAPIMetadata() {\n        return {';
        });
        
        // Pattern 6: 配列の文字列リテラル修正
        // features: ['';
        // -> features: [
        fixed = fixed.replace(/(features:\s*\[)'';/g, (match, prefix) => {
            modifications++;
            return prefix;
        });
        
        // Pattern 7: 配列要素の文字列修正
        // 'data_retrieval','';
        // -> 'data_retrieval',
        fixed = fixed.replace(/('[^']+'),\s*'';/g, (match, element) => {
            modifications++;
            return element + ',';
        });
        
        // Pattern 8: 閉じ括弧の文字列修正
        // ];
        // ];
        // -> ]
        fixed = fixed.replace(/\];\s*\];/g, () => {
            modifications++;
            return ']';
        });
        
        if (modifications > 0) {
            fs.writeFileSync(filePath, fixed);
            console.log(`APIEndpointManager.tsで${modifications}個の修正を実行`);
        }
        
    } catch (error) {
        console.error('APIEndpointManager.ts修正エラー:', error.message);
    }
    
    return { modifications };
}

// 実行
fixAPIEndpointManagerSpecific().catch(console.error);