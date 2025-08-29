const fs = require('fs');
const { glob } = require('glob');

// 主要な構文エラー（TS1005, TS1002, TS1128）の修正スクリプト
async function fixMajorSyntaxErrors() {
    console.log('主要な構文エラーの修正を開始...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`${tsFiles.length}個のTypeScriptファイルを発見`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // TS1005: ',' expected - より広範なパターン
            
            // Pattern 1: オブジェクトプロパティの末尾カンマ欠落
            // { prop: value } -> { prop: value, }
            fixed = fixed.replace(/(\{\s*[^}]*?)(\w+:\s*[^,}]+)(\s*\})/g, (match, start, prop, end) => {
                // 単一プロパティのオブジェクトにはカンマ不要
                if (!start.includes(',') && !start.includes(':')) {
                    return match;
                }
                if (!prop.endsWith(',') && !prop.endsWith(';')) {
                    modifications++;
                    return start + prop + ',' + end;
                }
                return match;
            });
            
            // Pattern 2: 配列要素の末尾カンマ欠落
            // ['item1' 'item2'] -> ['item1', 'item2']
            fixed = fixed.replace(/\[([^\]]*)\]/g, (match, content) => {
                if (!content.trim()) return match;
                const fixedContent = content.replace(/(['"])\s+(['"])/g, (m, q1, q2) => {
                    modifications++;
                    return q1 + ', ' + q2;
                });
                return '[' + fixedContent + ']';
            });
            
            // Pattern 3: 関数パラメータのカンマ欠落
            // function(param1 param2) -> function(param1, param2)
            fixed = fixed.replace(/\(([^)]+)\)/g, (match, params) => {
                if (!params.includes(' ') || params.includes(',')) return match;
                const fixedParams = params.replace(/(\w+)\s+(\w+)/g, (m, p1, p2) => {
                    if (![':', '=', '<', '>', '!', '?'].some(op => m.includes(op))) {
                        modifications++;
                        return p1 + ', ' + p2;
                    }
                    return m;
                });
                return '(' + fixedParams + ')';
            });
            
            // TS1002: Unterminated string literal - より徹底的な修正
            
            // Pattern 4: 行末の未終了文字列
            // 'string -> 'string'
            fixed = fixed.replace(/^([^'"\n]*)(["'])([^'"\n]+)$/gm, (match, prefix, quote, content) => {
                if (!match.endsWith(quote) && !match.endsWith(';') && !match.endsWith(',')) {
                    modifications++;
                    return prefix + quote + content + quote;
                }
                return match;
            });
            
            // Pattern 5: console.log等の未終了文字列
            // console.log('message) -> console.log('message')
            fixed = fixed.replace(/console\.\w+\((['"])([^'"]*)\)/g, (match, quote, content) => {
                modifications++;
                return match.replace(/\)$/, quote + ')');
            });
            
            // Pattern 6: return文の未終了文字列
            // return 'value; -> return 'value';
            fixed = fixed.replace(/return\s+(['"])([^'"]+);/g, (match, quote, content) => {
                if (!content.endsWith(quote)) {
                    modifications++;
                    return `return ${quote}${content}${quote};`;
                }
                return match;
            });
            
            // TS1128: Declaration or statement expected - 構造的な修正
            
            // Pattern 7: 余分なセミコロンと中括弧
            // }; } -> }
            fixed = fixed.replace(/\}\s*;\s*\}/g, () => {
                modifications++;
                return '}';
            });
            
            // Pattern 8: クラスメソッドの後の余分な文字
            // method() { ... } ' -> method() { ... }
            fixed = fixed.replace(/(\}\s*)\s+['"]+\s*$/gm, (match, closing) => {
                modifications++;
                return closing;
            });
            
            // Pattern 9: if/else/try/catch後の余分な文字
            // } catch (e) { '' -> } catch (e) {
            fixed = fixed.replace(/(\}\s*(catch|else|finally)\s*(\([^)]*\))?\s*\{)\s*['"]+/g, (match, statement) => {
                modifications++;
                return statement;
            });
            
            // Pattern 10: 二重セミコロンの修正
            // ;; -> ;
            fixed = fixed.replace(/;{2,}/g, () => {
                modifications++;
                return ';';
            });
            
            // Pattern 11: オブジェクトメソッドの構文修正
            // method: function() { -> method() {
            fixed = fixed.replace(/(\w+):\s*function\s*\(/g, (match, methodName) => {
                modifications++;
                return methodName + '(';
            });
            
            // Pattern 12: インターフェースプロパティの末尾修正
            // property: type; } -> property: type; }
            fixed = fixed.replace(/(\w+:\s*[^;,}]+);(\s*\})/g, (match, prop, closing) => {
                // インターフェース内のプロパティは ; で終わるのが正しい
                return match;
            });
            
            // Pattern 13: 関数の戻り値型の修正
            // ): type { -> ): type {
            fixed = fixed.replace(/\):\s*(\w+)\s*\{/g, (match, returnType) => {
                return match; // これは正しい構文なので変更なし
            });
            
            // Pattern 14: プロパティ代入の修正
            // this.prop = value '' -> this.prop = value;
            fixed = fixed.replace(/(this\.\w+\s*=\s*[^;]+)\s+['"]+\s*$/gm, (match, assignment) => {
                modifications++;
                return assignment + ';';
            });
            
            // Pattern 15: import/export文の修正
            // import { Something } from 'module' ' -> import { Something } from 'module';
            fixed = fixed.replace(/((?:import|export)[^;]+)\s+['"]+\s*$/gm, (match, statement) => {
                modifications++;
                return statement + ';';
            });
            
            if (modifications > 0) {
                fs.writeFileSync(filePath, fixed);
                modifiedFiles++;
                totalModifications += modifications;
                if (modifications > 100) {
                    console.log(`${filePath.split('/').pop()} で ${modifications} 個のエラーを修正`);
                }
            }
            
        } catch (error) {
            console.error(`ファイル処理エラー ${filePath}:`, error.message);
        }
    }
    
    console.log(`\n主要構文エラー修正完了:`);
    console.log(`- 処理ファイル数: ${tsFiles.length}`);
    console.log(`- 修正ファイル数: ${modifiedFiles}`);
    console.log(`- 総修正数: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// 実行
fixMajorSyntaxErrors().catch(console.error);