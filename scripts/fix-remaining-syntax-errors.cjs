const fs = require('fs');
const { glob } = require('glob');

// 残存する構文エラーの修正スクリプト
async function fixRemainingSyntaxErrors() {
    console.log('残存する構文エラーの修正を開始...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`${tsFiles.length}個のTypeScriptファイルを発見`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: インターフェースのプロパティ区切り文字修正
            // property: type, -> property: type;
            fixed = fixed.replace(/^(\s*)(\w+\??:\s*[^;,]+),\s*$/gm, (match, indent, declaration) => {
                modifications++;
                return indent + declaration + ';';
            });
            
            // Pattern 2: インターフェース定義のクロージング修正
            // interface Name { property: type }
            // -> interface Name {
            //      property: type;
            //    }
            fixed = fixed.replace(/interface\s+(\w+)\s*\{\s*(\w+):\s*(\w+)\s*\}/g, (match, name, prop, type) => {
                modifications++;
                return `interface ${name} {\n    ${prop}: ${type};\n}`;
            });
            
            // Pattern 3: 余分な } の削除
            // } }
            // }
            // -> }
            fixed = fixed.replace(/\}\s*\}\s*\n\s*\}/gm, () => {
                modifications++;
                return '}\n}';
            });
            
            // Pattern 4: Try-catchブロックの修正
            // } catch (error) { ''
            // -> } catch (error) {
            fixed = fixed.replace(/\}\s*catch\s*\([^)]+\)\s*\{\s*['"]+/g, (match) => {
                modifications++;
                return match.replace(/\{\s*['"]+/, '{');
            });
            
            // Pattern 5: console.log文の修正
            // console.log('message);
            // -> console.log('message');
            fixed = fixed.replace(/console\.(log|warn|error|info)\((['"])[^'"]*\);/g, (match, method, quote) => {
                if (!match.includes(quote + ')')) {
                    modifications++;
                    return match.replace(/\);/, quote + ');');
                }
                return match;
            });
            
            // Pattern 6: オブジェクトプロパティの修正
            // { prop: value ) }
            // -> { prop: value }
            fixed = fixed.replace(/\{\s*([^}]+)\s*\)\s*\}/g, (match, content) => {
                if (!content.includes('=>')) {
                    modifications++;
                    return `{ ${content.trim()} }`;
                }
                return match;
            });
            
            // Pattern 7: 配列定義の修正
            // ['item1', 'item2] -> ['item1', 'item2']
            fixed = fixed.replace(/\[([^\]]*['"]\w+)\]\s*[,;]/g, (match, content) => {
                const quotes = content.match(/['"]/g);
                if (quotes && quotes.length % 2 !== 0) {
                    modifications++;
                    const lastQuote = content.includes("'") ? "'" : '"';
                    return `[${content}${lastQuote}]` + match[match.length - 1];
                }
                return match;
            });
            
            // Pattern 8: 関数呼び出しの修正
            // function(param') -> function(param)
            fixed = fixed.replace(/(\w+)\(([^)]*[^'"\s])['"]\)/g, (match, func, params) => {
                modifications++;
                return `${func}(${params})`;
            });
            
            // Pattern 9: 三項演算子の修正
            // condition ? value1 : value2 }
            // -> condition ? value1 : value2
            fixed = fixed.replace(/(\?[^:]+:[^;}]+)\s*\}\s*$/gm, (match, ternary) => {
                modifications++;
                return ternary;
            });
            
            // Pattern 10: returnステートメントの修正
            // return value; }
            // } -> return value;
            fixed = fixed.replace(/(return\s+[^;]+);\s*\}\s*\n\s*\}/gm, (match, returnStatement) => {
                modifications++;
                return returnStatement + ';';
            });
            
            // Pattern 11: オブジェクトスプレッドの修正
            // { ...obj } }
            // -> { ...obj }
            fixed = fixed.replace(/\{\s*(\.\.\.[\w.]+)\s*\}\s*\}/g, (match, spread) => {
                modifications++;
                return `{ ${spread} }`;
            });
            
            // Pattern 12: 空文字列リテラルの削除
            // ''; または ""
            fixed = fixed.replace(/^(\s*)['"]{2,};?\s*$/gm, () => {
                modifications++;
                return '';
            });
            
            // Pattern 13: カンマの後の修正
            // ,';
            // -> ,
            fixed = fixed.replace(/,\s*['"]+;/g, () => {
                modifications++;
                return ',';
            });
            
            // Pattern 14: プロパティアクセスの修正
            // .property') -> .property)
            fixed = fixed.replace(/\.(\w+)['"]\)/g, (match, prop) => {
                modifications++;
                return `.${prop})`;
            });
            
            // Pattern 15: テンプレートリテラルの修正
            // `string${var)` -> `string${var}`
            fixed = fixed.replace(/\$\{([^}]+)\)/g, (match, content) => {
                modifications++;
                return `\${${content}}`;
            });
            
            if (modifications > 0) {
                fs.writeFileSync(filePath, fixed);
                modifiedFiles++;
                totalModifications += modifications;
                if (modifications > 50) {
                    console.log(`${filePath.split('/').pop()} で ${modifications} 個のエラーを修正`);
                }
            }
            
        } catch (error) {
            console.error(`ファイル処理エラー ${filePath}:`, error.message);
        }
    }
    
    console.log(`\n残存構文エラー修正完了:`);
    console.log(`- 処理ファイル数: ${tsFiles.length}`);
    console.log(`- 修正ファイル数: ${modifiedFiles}`);
    console.log(`- 総修正数: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// 実行
fixRemainingSyntaxErrors().catch(console.error);