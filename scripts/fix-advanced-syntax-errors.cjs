const fs = require('fs');
const { glob } = require('glob');

// 高度な構文エラー修正スクリプト
async function fixAdvancedSyntaxErrors() {
    console.log('高度なTypeScript構文エラーの修正を開始...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`${tsFiles.length}個のTypeScriptファイルを発見`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: 不完全なif文の修正
            // if(condition') { -> if(condition) {
            fixed = fixed.replace(/if\s*\(\s*([^)']+)'\)\s*\{/g, (match, condition) => {
                modifications++;
                return `if(${condition}) {`;
            });
            
            // Pattern 2: 不完全な三項演算子の修正
            // condition ? value : undefined; -> condition ? value : undefined
            fixed = fixed.replace(/(\?[^:]+:\s*undefined)\s*;/g, (match, ternary) => {
                modifications++;
                return ternary;
            });
            
            // Pattern 3: 閉じ括弧の重複修正
            // }) } -> })
            fixed = fixed.replace(/\}\s*\)\s*\}/g, () => {
                modifications++;
                return '})';
            });
            
            // Pattern 4: returnの後の不正な括弧
            // return func(); }; -> return func(); }
            fixed = fixed.replace(/(return\s+[^;]+);\s*\};/g, (match, returnStatement) => {
                modifications++;
                return returnStatement + '; }';
            });
            
            // Pattern 5: メソッド定義のパラメータ修正
            // method(param: type') -> method(param: type)
            fixed = fixed.replace(/(\w+)\s*\(\s*([^)]*[^'\s])'(\s*\))/g, (match, method, params, closing) => {
                modifications++;
                return `${method}(${params}${closing}`;
            });
            
            // Pattern 6: オブジェクトの不正な閉じ方修正
            // { prop: value } } -> { prop: value }
            fixed = fixed.replace(/(\{[^}]+\})\s*\}/g, (match, object) => {
                // 関数ブロックの場合はスキップ
                if (match.includes('=>') || match.includes('function')) {
                    return match;
                }
                modifications++;
                return object;
            });
            
            // Pattern 7: 行末の不要な文字列リテラル削除
            // statement;' -> statement;
            fixed = fixed.replace(/([;,}])\s*'(?:\s*$|\s*\n)/gm, (match, punctuation) => {
                modifications++;
                return punctuation + '\n';
            });
            
            // Pattern 8: 不正なテンプレートリテラル修正
            // `string${var)` -> `string${var}`
            fixed = fixed.replace(/\$\{([^}]+)\)/g, (match, variable) => {
                modifications++;
                return `\${${variable}}`;
            });
            
            // Pattern 9: 不正な配列/オブジェクトアクセス修正
            // array[index') -> array[index]
            fixed = fixed.replace(/(\[[^\]]+)'\]/g, (match, bracket) => {
                modifications++;
                return bracket + ']';
            });
            
            // Pattern 10: 二重セミコロンの修正
            // statement;; -> statement;
            fixed = fixed.replace(/;\s*;/g, () => {
                modifications++;
                return ';';
            });
            
            // Pattern 11: 空文字列リテラルの削除
            // ''; -> (削除)
            fixed = fixed.replace(/^\s*'';\s*$/gm, () => {
                modifications++;
                return '';
            });
            
            // Pattern 12: 不正なスプレッド演算子の修正
            // ...object } -> ...object
            fixed = fixed.replace(/\.\.\.([^,}\s]+)\s*\}/g, (match, spread) => {
                modifications++;
                return `...${spread}`;
            });
            
            if (modifications > 0) {
                fs.writeFileSync(filePath, fixed);
                modifiedFiles++;
                totalModifications += modifications;
                console.log(`${filePath.split('/').pop()} で ${modifications} 個のエラーを修正`);
            }
            
        } catch (error) {
            console.error(`ファイル処理エラー ${filePath}:`, error.message);
        }
    }
    
    console.log(`\n高度な構文エラー修正完了:`);
    console.log(`- 処理ファイル数: ${tsFiles.length}`);
    console.log(`- 修正ファイル数: ${modifiedFiles}`);
    console.log(`- 総修正数: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// 実行
fixAdvancedSyntaxErrors().catch(console.error);