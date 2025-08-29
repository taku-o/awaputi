const fs = require('fs');

// 最も問題の多いファイルを集中的に修正するスクリプト
async function fixProblematicFiles() {
    console.log('問題の多いファイルの集中修正を開始...');
    
    // エラーの多いファイルのリスト
    const problematicFiles = [
        '/Users/taku-o/Documents/workspaces/awaputi/test/debug/DeveloperConsole.test.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/test/debug/GameStateCommands.test.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/tests/e2e/multilingual-ui-e2e.spec.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/core/help/HelpAnalytics.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/effects/EffectManager.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/tests/unit/EffectsConfig.test.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/test/debug/PerformanceVisualizer.test.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/test/debug/KeyboardShortcutManager.test.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/tests/e2e/localization-features-e2e.spec.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/utils/performance-profiler/PerformanceAnalysisSystem.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/scenes/SettingsScene.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/core/i18n/quality/QualityReporter.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/analytics/AnalyticsDashboard.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/test/debug/PerformanceThresholdMonitor.test.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/debug/DocumentationSystem.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/tests/ShareDialog.test.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/core/MobileAccessibilityManager.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/scenes/help-scene/HelpEventManager.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/debug/PerformanceThresholdMonitor.ts',
        '/Users/taku-o/Documents/workspaces/awaputi/src/scenes/game-scene/GameUIManager.ts'
    ];
    
    let totalModifications = 0;
    let processedFiles = 0;
    
    for (const filePath of problematicFiles) {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`ファイルが存在しません: ${filePath}`);
                continue;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            let fixed = content;
            let modifications = 0;
            
            // 包括的な修正パターン
            
            // 1. テストファイル特有のパターン
            if (filePath.includes('test.ts') || filePath.includes('spec.ts')) {
                // describe('test' -> describe('test', () => {
                fixed = fixed.replace(/describe\((['"][^'"]+['"])\s*$/gm, (match, name) => {
                    modifications++;
                    return `describe(${name}, () => {`;
                });
                
                // it('test' -> it('test', () => {
                fixed = fixed.replace(/it\((['"][^'"]+['"])\s*$/gm, (match, name) => {
                    modifications++;
                    return `it(${name}, () => {`;
                });
                
                // expect(value).toBe(expected' -> expect(value).toBe(expected)
                fixed = fixed.replace(/expect\([^)]+\)\.\w+\([^)]*['"]\s*$/gm, (match) => {
                    modifications++;
                    return match.replace(/['"]\s*$/, ')');
                });
            }
            
            // 2. 文字列リテラルの徹底的な修正
            // 行をまたぐ未終了文字列の修正
            const lines = fixed.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 文字列が開始されているが終了していない行
                const singleQuotes = (line.match(/'/g) || []).length;
                const doubleQuotes = (line.match(/"/g) || []).length;
                const backticks = (line.match(/`/g) || []).length;
                
                if (singleQuotes % 2 !== 0) {
                    // console.log('message -> console.log('message')
                    if (line.includes('console.') || line.includes('error(') || line.includes('warn(')) {
                        lines[i] = line + "'";
                        modifications++;
                    }
                    // return 'value -> return 'value'
                    else if (line.trim().startsWith('return')) {
                        lines[i] = line + "'";
                        modifications++;
                    }
                }
                
                if (doubleQuotes % 2 !== 0) {
                    lines[i] = line + '"';
                    modifications++;
                }
            }
            fixed = lines.join('\n');
            
            // 3. オブジェクトリテラルの修正
            // { prop: value -> { prop: value }
            fixed = fixed.replace(/\{\s*(\w+:\s*[^,}]+)\s*$/gm, (match, content) => {
                modifications++;
                return `{ ${content} }`;
            });
            
            // 4. 配列リテラルの修正
            // [ item1, item2 -> [ item1, item2 ]
            fixed = fixed.replace(/\[\s*([^\]]+)\s*$/gm, (match, content) => {
                modifications++;
                return `[ ${content} ]`;
            });
            
            // 5. 関数呼び出しの修正
            // function(param -> function(param)
            fixed = fixed.replace(/(\w+)\(([^)]+)\s*$/gm, (match, func, params) => {
                modifications++;
                return `${func}(${params})`;
            });
            
            // 6. プロパティアクセスチェーンの修正
            // object.property. -> object.property
            fixed = fixed.replace(/(\.\w+)\.\s*$/gm, (match, prop) => {
                modifications++;
                return prop;
            });
            
            // 7. セミコロンの欠落修正
            // const value = 123 -> const value = 123;
            fixed = fixed.replace(/^(\s*(?:const|let|var)\s+\w+\s*=\s*[^;]+)\s*$/gm, (match, statement) => {
                if (!statement.endsWith(';') && !statement.endsWith(',') && !statement.endsWith('{')) {
                    modifications++;
                    return statement + ';';
                }
                return match;
            });
            
            // 8. ブロックの閉じ忘れ修正
            // function() { ... (EOF) -> function() { ... }
            const openBraces = (fixed.match(/\{/g) || []).length;
            const closeBraces = (fixed.match(/\}/g) || []).length;
            if (openBraces > closeBraces) {
                const diff = openBraces - closeBraces;
                fixed += '\n' + '}'.repeat(diff);
                modifications += diff;
            }
            
            // 9. 括弧の閉じ忘れ修正
            const openParens = (fixed.match(/\(/g) || []).length;
            const closeParens = (fixed.match(/\)/g) || []).length;
            if (openParens > closeParens) {
                const diff = openParens - closeParens;
                fixed += ')'.repeat(diff);
                modifications += diff;
            }
            
            // 10. importステートメントの修正
            // import { Something } from 'module -> import { Something } from 'module'
            fixed = fixed.replace(/import\s*\{[^}]+\}\s*from\s*(['"])([^'"]+)$/gm, (match, quote, module) => {
                modifications++;
                return `import { ... } from ${quote}${module}${quote};`;
            });
            
            if (modifications > 0) {
                fs.writeFileSync(filePath, fixed);
                processedFiles++;
                console.log(`${filePath.split('/').pop()}: ${modifications}個の修正を実行`);
                totalModifications += modifications;
            }
            
        } catch (error) {
            console.error(`ファイル処理エラー ${filePath}:`, error.message);
        }
    }
    
    console.log(`\n問題ファイル修正完了:`);
    console.log(`- 処理ファイル数: ${processedFiles}/${problematicFiles.length}`);
    console.log(`- 総修正数: ${totalModifications}`);
}

// 実行
fixProblematicFiles().catch(console.error);