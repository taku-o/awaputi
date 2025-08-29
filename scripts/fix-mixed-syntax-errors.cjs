const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 混在した構文エラーを修正
function fixMixedSyntaxErrors(content) {
  let modified = false;
  
  // パターン1: オブジェクトリテラル内のセミコロン → カンマ
  // enabled: false; → enabled: false,
  content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^;,\n]+);(\s*\/\/[^\n]*)?$/gm, (match, prop, value, comment) => {
    // ただし、オブジェクトリテラルの最後のプロパティでない場合のみ
    modified = true;
    return `${prop}: ${value},${comment || ''}`;
  });
  
  // パターン2: カンマとセミコロンの混在 ,; → ,
  content = content.replace(/,;/g, ',');
  
  // パターン3: セミコロンの後に閉じ括弧がない場合
  // lastRequestTime: null,;\n} → lastRequestTime: null\n};
  content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^;,\n]+),;\s*$/gm, '$1: $2');
  
  // パターン4: オブジェクトリテラルの閉じ括弧が欠落
  // プロパティの後に閉じ括弧がない場合、追加
  const lines = content.split('\n');
  const fixedLines = [];
  let braceDepth = 0;
  let inObject = false;
  let lastPropertyLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // ブレースの深さを追跡
    for (const char of line) {
      if (char === '{') {
        braceDepth++;
        // オブジェクトリテラルの可能性をチェック
        const beforeBrace = line.substring(0, line.indexOf('{')).trim();
        if (beforeBrace.endsWith('=') || beforeBrace.endsWith(':') || beforeBrace.includes('this.')) {
          inObject = true;
        }
      } else if (char === '}') {
        braceDepth--;
        inObject = false;
      }
    }
    
    // オブジェクトプロパティの行を記録
    if (inObject && trimmed.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/)) {
      lastPropertyLine = i;
    }
    
    // オブジェクトの終了を検出
    if (inObject && braceDepth > 0 && i > lastPropertyLine && lastPropertyLine >= 0) {
      const nextNonEmptyLine = lines.slice(i).find(l => l.trim());
      if (nextNonEmptyLine && !nextNonEmptyLine.trim().startsWith('}')) {
        // 閉じ括弧を追加
        if (trimmed === '' && i === lastPropertyLine + 1) {
          fixedLines.push(lines[lastPropertyLine]);
          fixedLines.push('        };');
          lastPropertyLine = -1;
          modified = true;
          continue;
        }
      }
    }
    
    fixedLines.push(line);
  }
  
  if (modified) {
    content = fixedLines.join('\n');
  }
  
  // パターン5: try-catch文の修正
  content = content.replace(/\}\s*catch\s*\(/g, '} catch (');
  
  // パターン6: 文の終端の修正
  // statement, → statement;
  content = content.replace(/(\w+\([^)]*\)),\s*$/gm, '$1;');
  
  // パターン7: 不正な閉じ括弧
  // }) → }
  content = content.replace(/\}\)/g, (match, offset, str) => {
    const before = str.substring(Math.max(0, offset - 50), offset);
    if (!before.includes('function') && !before.includes('=>')) {
      return '}';
    }
    return match;
  });
  
  return { content, modified: true };
}

// インターフェースとオブジェクトリテラルの区別を改善
function fixInterfaceVsObjectLiteral(content) {
  const lines = content.split('\n');
  let modified = false;
  let context = 'none'; // 'interface', 'class', 'object', 'none'
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // コンテキストの判定
    if (trimmed.match(/^(export\s+)?interface\s+/)) {
      context = 'interface';
      braceDepth = 0;
    } else if (trimmed.match(/^(export\s+)?(abstract\s+)?class\s+/)) {
      context = 'class';
      braceDepth = 0;
    } else if (context === 'none' && line.includes('{')) {
      const beforeBrace = line.substring(0, line.indexOf('{')).trim();
      if (beforeBrace.endsWith('=') || beforeBrace.endsWith(':') || beforeBrace.endsWith('(')) {
        context = 'object';
        braceDepth = 0;
      }
    }
    
    // ブレースの深さを追跡
    for (const char of line) {
      if (char === '{') braceDepth++;
      if (char === '}') {
        braceDepth--;
        if (braceDepth === 0) context = 'none';
      }
    }
    
    // 修正の適用
    if (braceDepth > 0) {
      if (context === 'interface' || context === 'class') {
        // インターフェースとクラスではセミコロンを使用
        const newLine = line.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^;,\n]+),\s*$/g, '$1: $2;');
        if (newLine !== line) {
          lines[i] = newLine;
          modified = true;
        }
      } else if (context === 'object') {
        // オブジェクトリテラルではカンマを使用
        const newLine = line.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^;,\n]+);\s*$/g, '$1: $2,');
        if (newLine !== line) {
          lines[i] = newLine;
          modified = true;
        }
      }
    }
  }
  
  return { content: lines.join('\n'), modified };
}

// ファイルを修正する関数
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    // 混在した構文エラーの修正
    const mixedResult = fixMixedSyntaxErrors(content);
    if (mixedResult.modified) {
      content = mixedResult.content;
      totalModified = true;
      console.log(`  Fixed mixed syntax errors`);
    }
    
    // インターフェースとオブジェクトリテラルの区別
    const contextResult = fixInterfaceVsObjectLiteral(content);
    if (contextResult.modified) {
      content = contextResult.content;
      totalModified = true;
      console.log(`  Fixed interface vs object literal`);
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
  console.log('🔧 Fixing mixed TypeScript syntax errors...\n');

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