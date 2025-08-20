const fs = require('fs');
const { glob } = require('glob');

// 基本的な構文エラーのみを修正する保守的なスクリプト
async function fixBasicSyntaxErrors() {
    console.log('基本的なTypeScript構文エラーの修正を開始...');
    
    const tsFiles = glob.sync('/Users/taku-o/Documents/workspaces/awaputi/src/**/*.ts');
    console.log(`${tsFiles.length}個のTypeScriptファイルを発見`);
    
    let modifiedFiles = 0;
    let totalModifications = 0;
    
    for (const filePath of tsFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // Pattern 1: 基本的な文字列リテラルエラーを修正
            // try {' -> try {
            fixed = fixed.replace(/try\s*\{\s*'/g, () => {
                modifications++;
                return 'try {';
            });
            
            // Pattern 2: 基本的なコメント構文エラーを修正
            // // コメント'' -> // コメント
            fixed = fixed.replace(/\/\/([^']*)''/g, (match, content) => {
                modifications++;
                return '//' + content;
            });
            
            // Pattern 3: 基本的なメソッドコール構文エラーを修正
            // method(''); -> method();
            fixed = fixed.replace(/(\w+)\(''\);/g, (match, methodName) => {
                modifications++;
                return methodName + '();';
            });
            
            // Pattern 4: 基本的なブロック終了構文エラーを修正
            // } catch (error') { -> } catch (error) {
            fixed = fixed.replace(/\}\s*catch\s*\(\s*(\w+)\s*'\)\s*\{/g, (match, variable) => {
                modifications++;
                return `} catch (${variable}) {`;
            });
            
            // Pattern 5: 基本的なthrow文構文エラーを修正
            // throw error; }; -> throw error; }
            fixed = fixed.replace(/throw\s+(\w+);\s*\};\s*$/gm, (match, variable) => {
                modifications++;
                return `throw ${variable}; }`;
            });
            
            if (modifications > 0) {
                fs.writeFileSync(filePath, fixed);
                modifiedFiles++;
                totalModifications += modifications;
                console.log(`${filePath} で ${modifications} 個の基本構文エラーを修正`);
            }
            
        } catch (error) {
            console.error(`ファイル処理エラー ${filePath}:`, error.message);
        }
    }
    
    console.log(`\n基本構文エラー修正完了:`);
    console.log(`- 処理ファイル数: ${tsFiles.length}`);
    console.log(`- 修正ファイル数: ${modifiedFiles}`);
    console.log(`- 総修正数: ${totalModifications}`);
    
    return { filesProcessed: tsFiles.length, modifiedFiles, totalModifications };
}

// 実行
fixBasicSyntaxErrors().catch(console.error);