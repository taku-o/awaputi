const fs = require('fs');
const path = require('path');
const glob = require('glob');

// オブジェクトリテラルの構文を修正
function fixObjectLiteralSyntax(content) {
  const lines = content.split('\n');
  let modified = false;
  let braceStack = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // ブレースの深さを追跡
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '{') {
        // オブジェクトリテラルの開始を検出
        const beforeBrace = line.substring(0, j).trim();
        const isObjectLiteral = beforeBrace.endsWith('=') || 
                               beforeBrace.endsWith(':') || 
                               beforeBrace.endsWith('(') ||
                               beforeBrace.endsWith(',') ||
                               beforeBrace.endsWith('return') ||
                               beforeBrace === '';
        braceStack.push(isObjectLiteral ? 'object' : 'other');
      } else if (char === '}') {
        braceStack.pop();
      }
    }
    
    // オブジェクトリテラル内でセミコロンをカンマに変換
    if (braceStack.length > 0 && braceStack[braceStack.length - 1] === 'object') {
      // プロパティ定義の後のセミコロンをカンマに変換
      const newLine = line.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^;,}]+);/g, '$1: $2,');
      if (newLine !== line) {
        lines[i] = newLine;
        modified = true;
      }
    }
  }
  
  return { content: lines.join('\n'), modified };
}

// コンストラクタとメソッド内のプロパティ初期化を修正
function fixConstructorSyntax(content) {
  let modified = false;
  
  // コンストラクタ内のプロパティ初期化の修正
  // this.property = value, → this.property = value;
  content = content.replace(/(\s*this\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^;,]+),(?=\s*(?:this\.|\/\/|$))/gm, '$1;');
  
  // オブジェクトリテラル内の間違ったセミコロン
  // { prop: value; } → { prop: value, }
  content = content.replace(/(\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^;,}]+);(?=\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g, '$1,');
  
  // returnオブジェクトの修正
  // return { prop: value; }; → return { prop: value };
  content = content.replace(/return\s*\{([^}]+);\s*\}/g, (match, p1) => {
    const fixed = p1.replace(/;/g, ',').replace(/,\s*$/, '');
    return `return {${fixed} }`;
  });
  
  return { content, modified: true };
}

// try-catch文とif文の修正
function fixControlFlowSyntax(content) {
  let modified = false;
  
  // } catch (error) { の修正
  content = content.replace(/\}\s*catch\s*\(/g, '} catch (');
  
  // if文の条件内の不正な括弧
  content = content.replace(/if\s*\(\s*([^)]+)\s*\)\s*\{/g, (match, condition) => {
    // 条件内の不正な文字を修正
    const fixedCondition = condition.replace(/\s+\{/g, '');
    return `if (${fixedCondition}) {`;
  });
  
  return { content, modified: true };
}

// 文字列リテラルの修正
function fixStringLiterals(content) {
  const lines = content.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 未終了の文字列を検出して修正
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    
    // エスケープされていない引用符を考慮
    const escapedSingle = (line.match(/\\'/g) || []).length;
    const escapedDouble = (line.match(/\\"/g) || []).length;
    
    const actualSingle = singleQuotes - escapedSingle;
    const actualDouble = doubleQuotes - escapedDouble;
    
    // 奇数個の引用符がある場合、行末に追加
    if (actualSingle % 2 !== 0 && !line.trim().endsWith("'")) {
      lines[i] = line + "'";
      modified = true;
    } else if (actualDouble % 2 !== 0 && !line.trim().endsWith('"')) {
      lines[i] = line + '"';
      modified = true;
    }
  }
  
  return { content: lines.join('\n'), modified };
}

// ファイルを修正する関数
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    // オブジェクトリテラルの修正
    const objectResult = fixObjectLiteralSyntax(content);
    if (objectResult.modified) {
      content = objectResult.content;
      totalModified = true;
      console.log(`  Fixed object literals`);
    }
    
    // コンストラクタ構文の修正
    const constructorResult = fixConstructorSyntax(content);
    if (constructorResult.modified) {
      content = constructorResult.content;
      totalModified = true;
      console.log(`  Fixed constructor syntax`);
    }
    
    // 制御フロー構文の修正
    const controlResult = fixControlFlowSyntax(content);
    if (controlResult.modified) {
      content = controlResult.content;
      totalModified = true;
      console.log(`  Fixed control flow syntax`);
    }
    
    // 文字列リテラルの修正
    const stringResult = fixStringLiterals(content);
    if (stringResult.modified) {
      content = stringResult.content;
      totalModified = true;
      console.log(`  Fixed string literals`);
    }
    
    if (totalModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// メイン処理
async function main() {
  console.log('🔧 Fixing TypeScript object literal and syntax errors...\n');

  const targetPatterns = [
    'src/**/*.ts',
    'test/**/*.ts',
    'tests/**/*.ts'
  ];

  let totalFixed = 0;
  let totalFiles = 0;

  for (const pattern of targetPatterns) {
    const files = glob.sync(pattern, { nodir: true });
    console.log(`\n📁 Processing ${pattern} (${files.length} files)...`);
    
    for (const file of files) {
      totalFiles++;
      if (fixFile(file)) {
        totalFixed++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files fixed: ${totalFixed}`);
  console.log(`\n✅ Done!`);
}

// 実行
main().catch(console.error);