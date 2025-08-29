const fs = require('fs');
const path = require('path');
const glob = require('glob');

// TypeScriptクラスプロパティの構文を修正
function fixClassPropertySyntax(content) {
  const lines = content.split('\n');
  let inClass = false;
  let braceDepth = 0;
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // クラス定義の開始を検出
    if (trimmed.match(/^(export\s+)?(abstract\s+)?class\s+\w+/)) {
      inClass = true;
      braceDepth = 0;
    }
    
    // ブレースの深さを追跡
    for (const char of line) {
      if (char === '{') {
        braceDepth++;
      } else if (char === '}') {
        braceDepth--;
        if (braceDepth === 0) {
          inClass = false;
        }
      }
    }
    
    // クラス内のプロパティ宣言を修正
    if (inClass && braceDepth > 0) {
      // プロパティ宣言パターン: private/public/protected propertyName: type,
      const propertyPattern = /^(\s*)(private|public|protected|readonly|static)*\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*(.+),\s*$/;
      const match = line.match(propertyPattern);
      
      if (match) {
        // 最後のカンマをセミコロンに変更
        lines[i] = line.replace(/,\s*$/, ';');
        modified = true;
      }
    }
  }
  
  return { content: lines.join('\n'), modified };
}

// インターフェース内のプロパティを修正（セミコロンが正しい）
function fixInterfaceProperties(content) {
  const lines = content.split('\n');
  let inInterface = false;
  let braceDepth = 0;
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // インターフェース定義の開始を検出
    if (trimmed.match(/^(export\s+)?interface\s+\w+/)) {
      inInterface = true;
      braceDepth = 0;
    }
    
    // ブレースの深さを追跡
    for (const char of line) {
      if (char === '{') {
        braceDepth++;
      } else if (char === '}') {
        braceDepth--;
        if (braceDepth === 0) {
          inInterface = false;
        }
      }
    }
    
    // インターフェース内のプロパティ宣言を修正
    if (inInterface && braceDepth > 0) {
      // 最後がカンマで終わっている行
      if (line.match(/,\s*$/)) {
        // ただし、オブジェクトリテラルの中でない場合のみ
        const beforeComma = line.substring(0, line.lastIndexOf(','));
        const openBraces = (beforeComma.match(/\{/g) || []).length;
        const closeBraces = (beforeComma.match(/\}/g) || []).length;
        
        if (openBraces === closeBraces) {
          lines[i] = line.replace(/,\s*$/, ';');
          modified = true;
        }
      }
    }
  }
  
  return { content: lines.join('\n'), modified };
}

// オブジェクトリテラル内の不正な構文を修正
function fixObjectLiterals(content) {
  let modified = false;
  
  // パターン1: プロパティ宣言後の不正な閉じ括弧
  // timestamp: number } → timestamp: number;
  content = content.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$<>\[\]]*)\s*\}/g, (match, type) => {
    modified = true;
    return `: ${type};`;
  });
  
  // パターン2: 複数行にまたがるプロパティ宣言
  // property: type,\n} → property: type\n}
  content = content.replace(/,\s*\n\s*\}/g, (match) => {
    modified = true;
    return '\n}';
  });
  
  return { content, modified };
}

// ファイルを修正する関数
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    // クラスプロパティの修正
    const classResult = fixClassPropertySyntax(content);
    if (classResult.modified) {
      content = classResult.content;
      totalModified = true;
      console.log(`  Fixed class properties`);
    }
    
    // インターフェースプロパティの修正
    const interfaceResult = fixInterfaceProperties(content);
    if (interfaceResult.modified) {
      content = interfaceResult.content;
      totalModified = true;
      console.log(`  Fixed interface properties`);
    }
    
    // オブジェクトリテラルの修正
    const objectResult = fixObjectLiterals(content);
    if (objectResult.modified) {
      content = objectResult.content;
      totalModified = true;
      console.log(`  Fixed object literals`);
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
  console.log('🔧 Fixing TypeScript class and interface property syntax...\n');

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