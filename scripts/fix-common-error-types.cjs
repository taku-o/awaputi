const fs = require('fs');
const { glob } = require('glob');

// 頻繁なTypeScriptエラーに特化した修正スクリプト
async function fixCommonErrorTypes() {
    console.log('頻繁なTypeScriptエラータイプの修正を開始...');
    console.log('対象: TS1005 (54回), TS1002 (21回), TS1128 (15回)');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`${tsFiles.length}個のTypeScriptファイルを発見`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // TS1005対策: 不正なカンマの修正
            // Pattern 1: オブジェクトの末尾の不正なセミコロン
            // { prop: value; } -> { prop: value }
            fixed = fixed.replace(/(\{[^}]*\w+:\s*[^;}]+);(\s*\})/g, (match, content, closing) => {
                modifications++;
                return content + closing;
            });
            
            // Pattern 2: 配列や引数の末尾の不正なカンマ
            // [item1, item2,] -> [item1, item2]
            fixed = fixed.replace(/(\[[^\]]*),(\s*\])/g, (match, content, closing) => {
                modifications++;
                return content + closing;
            });
            
            // Pattern 3: 関数引数の末尾の不正なカンマ
            // function(param1, param2,) -> function(param1, param2)
            fixed = fixed.replace(/(\([^)]*),(\s*\))/g, (match, content, closing) => {
                modifications++;
                return content + closing;
            });
            
            // TS1002対策: 終端されていない文字列リテラル
            // Pattern 4: シングルクォートの文字列末尾修正
            // 'string -> 'string'
            fixed = fixed.replace(/(\s)('[^']*$)/gm, (match, space, string) => {
                if (!string.endsWith("'")) {
                    modifications++;
                    return space + string + "'";
                }
                return match;
            });
            
            // Pattern 5: コメント内の奇数クォート修正
            // // comment' -> // comment
            fixed = fixed.replace(/\/\/([^']*)'([^']*$)/gm, (match, before, after) => {
                modifications++;
                return '//' + before + after;
            });
            
            // Pattern 6: 一般的な文字列リテラル修正
            // method(''); -> method();
            fixed = fixed.replace(/(\w+)\(''\)/g, (match, methodName) => {
                modifications++;
                return methodName + '()';
            });
            
            // TS1128対策: 宣言または文の期待
            // Pattern 7: 不正なブロック終了
            // } else { statement; }; -> } else { statement; }
            fixed = fixed.replace(/(\}\s*else\s*\{[^}]*\});/g, (match, elseBlock) => {
                modifications++;
                return elseBlock;
            });
            
            // Pattern 8: 不正な文末のセミコロン二重
            // statement;; -> statement;
            fixed = fixed.replace(/([^;]);;\s*$/gm, (match, statement) => {
                modifications++;
                return statement + ';';
            });
            
            // Pattern 9: 不正な空のブロック
            // {} } -> {}
            fixed = fixed.replace(/\{\s*\}\s*\}/g, () => {
                modifications++;
                return '{}';
            });
            
            // Pattern 10: オブジェクトプロパティの不正な構文
            // prop: value,; -> prop: value,
            fixed = fixed.replace(/(\w+:\s*[^,;]+),;/g, (match, property) => {
                modifications++;
                return property + ',';
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
    
    console.log(`\n頻繁エラー修正完了:`);
    console.log(`- 処理ファイル数: ${tsFiles.length}`);
    console.log(`- 修正ファイル数: ${modifiedFiles}`);
    console.log(`- 総修正数: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// 実行
fixCommonErrorTypes().catch(console.error);