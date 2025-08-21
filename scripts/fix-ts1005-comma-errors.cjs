const fs = require('fs');
const { glob } = require('glob');

// TS1005 (コンマ期待) エラーの集中修正スクリプト
async function fixTS1005Errors() {
    console.log('TS1005 (コンマ期待) エラーの集中修正を開始...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    const testFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/test*/**/*.ts');
    const allFiles = [...tsFiles, ...testFiles];
    
    console.log(`${allFiles.length}個のTypeScriptファイルを発見`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of allFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // TS1005のための詳細なパターン
            
            // 1. オブジェクトリテラル内のプロパティ間のカンマ欠落
            // { prop1: value1 prop2: value2 } -> { prop1: value1, prop2: value2 }
            fixed = fixed.replace(/(\w+:\s*[^,{}]+)\s+(\w+:)/g, (match, prop1, prop2) => {
                // 型定義の場合はスキップ
                if (match.includes('<') || match.includes('>')) return match;
                modifications++;
                return prop1 + ', ' + prop2;
            });
            
            // 2. 配列要素間のカンマ欠落
            // ['item1' 'item2'] -> ['item1', 'item2']
            fixed = fixed.replace(/(['"])([^'"]*)\1\s+(['"])([^'"]*)\3/g, (match, q1, item1, q2, item2) => {
                // import文などは除外
                if (match.includes('from') || match.includes('import')) return match;
                modifications++;
                return q1 + item1 + q1 + ', ' + q2 + item2 + q2;
            });
            
            // 3. 関数パラメータ間のカンマ欠落
            // function(param1: type1 param2: type2) -> function(param1: type1, param2: type2)
            fixed = fixed.replace(/(\w+:\s*\w+)\s+(\w+:\s*\w+)/g, (match, param1, param2) => {
                // 関数パラメータのコンテキストでのみ
                const beforeMatch = fixed.substring(Math.max(0, fixed.indexOf(match) - 50), fixed.indexOf(match));
                if (beforeMatch.includes('(') && !beforeMatch.includes('{')) {
                    modifications++;
                    return param1 + ', ' + param2;
                }
                return match;
            });
            
            // 4. デストラクチャリング代入のカンマ欠落
            // const { prop1 prop2 } = obj -> const { prop1, prop2 } = obj
            fixed = fixed.replace(/const\s*\{\s*(\w+)\s+(\w+)\s*\}/g, (match, prop1, prop2) => {
                modifications++;
                return `const { ${prop1}, ${prop2} }`;
            });
            
            // 5. インポート文のカンマ欠落
            // import { Module1 Module2 } from -> import { Module1, Module2 } from
            fixed = fixed.replace(/import\s*\{\s*([^}]+)\s*\}/g, (match, imports) => {
                const fixedImports = imports.replace(/(\w+)\s+(\w+)/g, (m, imp1, imp2) => {
                    modifications++;
                    return imp1 + ', ' + imp2;
                });
                return `import { ${fixedImports} }`;
            });
            
            // 6. エクスポート文のカンマ欠落
            // export { Module1 Module2 } -> export { Module1, Module2 }
            fixed = fixed.replace(/export\s*\{\s*([^}]+)\s*\}/g, (match, exports) => {
                const fixedExports = exports.replace(/(\w+)\s+(\w+)/g, (m, exp1, exp2) => {
                    modifications++;
                    return exp1 + ', ' + exp2;
                });
                return `export { ${fixedExports} }`;
            });
            
            // 7. 型定義のユニオン型修正
            // type Foo = Type1 Type2 -> type Foo = Type1 | Type2
            fixed = fixed.replace(/type\s+(\w+)\s*=\s*(\w+)\s+(\w+)/g, (match, name, type1, type2) => {
                if (!type1.includes('|') && !type2.includes('|')) {
                    modifications++;
                    return `type ${name} = ${type1} | ${type2}`;
                }
                return match;
            });
            
            // 8. インターフェースプロパティのセミコロン欠落
            // interface { prop: type } -> interface { prop: type; }
            fixed = fixed.replace(/interface\s+\w+\s*\{([^}]+)\}/g, (match, body) => {
                let fixedBody = body;
                let localMods = 0;
                
                // 各プロパティにセミコロンを追加
                fixedBody = fixedBody.replace(/(\w+\??:\s*[^;,}]+)(?=\s*\w+\??:|\s*\})/g, (m, prop) => {
                    localMods++;
                    return prop + ';';
                });
                
                if (localMods > 0) {
                    modifications += localMods;
                    return match.replace(body, fixedBody);
                }
                return match;
            });
            
            // 9. メソッドチェーンのドット欠落
            // .method1() method2() -> .method1().method2()
            fixed = fixed.replace(/(\.\w+\(\))\s+(\w+\()/g, (match, method1, method2) => {
                modifications++;
                return method1 + '.' + method2;
            });
            
            // 10. テンプレートリテラル内の式のカンマ欠落
            // ${var1 var2} -> ${var1, var2}
            fixed = fixed.replace(/\$\{([^}]+)\}/g, (match, expr) => {
                const fixedExpr = expr.replace(/(\w+)\s+(\w+)/g, (m, v1, v2) => {
                    // 演算子を含む場合はスキップ
                    if (['+', '-', '*', '/', '=', '<', '>', '!'].some(op => m.includes(op))) {
                        return m;
                    }
                    modifications++;
                    return v1 + ', ' + v2;
                });
                return '${' + fixedExpr + '}';
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
    
    console.log(`\nTS1005エラー修正完了:`);
    console.log(`- 処理ファイル数: ${allFiles.length}`);
    console.log(`- 修正ファイル数: ${modifiedFiles}`);
    console.log(`- 総修正数: ${totalModifications}`);
}

// 実行
fixTS1005Errors().catch(console.error);