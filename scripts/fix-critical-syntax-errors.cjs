const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 深刻な構文エラーを修正
function fixCriticalSyntaxErrors(content) {
  let modified = false;
  const lines = content.split('\n');
  
  // パターン1: インターフェースの閉じ括弧欠落
  // timestamp: number; の後に } が必要
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // インターフェース内のプロパティで、次の行がクラス宣言の場合
    if (trimmed.match(/^\w+:\s*\w+;$/) && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.startsWith('export class') || nextLine.startsWith('class')) {
        lines[i] = line + '\n}';
        modified = true;
      }
    }
  }
  
  // パターン2: オブジェクトリテラルの閉じ括弧欠落
  let braceCount = 0;
  let inObjectLiteral = false;
  let objectStartLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // オブジェクトリテラルの開始を検出
    if (line.includes(': {')) {
      inObjectLiteral = true;
      objectStartLine = i;
      braceCount = 1;
      
      // 同じ行で閉じられていない場合
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount = openBraces - closeBraces;
      
      if (braceCount === 0) {
        inObjectLiteral = false;
      }
    } else if (inObjectLiteral) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      // 閉じ括弧が不足している場合
      if (braceCount === 1 && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        // 次の行が新しいプロパティまたはメソッドの場合
        if (nextLine.match(/^(private|public|protected)?\s*\w+:/) || 
            nextLine.match(/^constructor\s*\(/) ||
            nextLine === '') {
          // 現在の行の最後のセミコロンまたはカンマを見つけて、その後に閉じ括弧を追加
          const lastChar = line.trim().slice(-1);
          if (lastChar === ';' || lastChar === ',') {
            lines[i] = line.replace(/[;,]\s*$/, ' };');
          } else {
            lines[i] = line + ' };';
          }
          inObjectLiteral = false;
          braceCount = 0;
          modified = true;
        }
      }
      
      if (braceCount === 0) {
        inObjectLiteral = false;
      }
    }
  }
  
  // パターン3: 関数パラメータの閉じ括弧欠落
  content = lines.join('\n');
  
  // options: any = {} → options: any = {})
  content = content.replace(/(\w+:\s*\w+\s*=\s*\{)\s*\{/g, '$1})');
  
  // パターン4: オブジェクトプロパティのセミコロン/カンマ修正
  // オブジェクトリテラル内でセミコロンをカンマに
  content = content.replace(/(\s*\w+:\s*[^;,\n]+);(\s*\w+:)/g, '$1,$2');
  
  // パターン5: 閉じ括弧の後の不要なセミコロン
  content = content.replace(/}\s*;(\s*})/g, '}$1');
  
  // パターン6: エクスポート文の修正
  // } の後に ; が欠落
  content = content.replace(/^(\s*export\s+(?:class|interface|type|const|let|var|function)\s+\w+[^{]*\{[^}]*\})\s*$/gm, '$1;');
  
  return { content, modified: true };
}

// 特定のファイルパターンを修正
function fixSpecificPatterns(content, filePath) {
  let modified = false;
  
  // APIEndpointManager.ts 特有の修正
  if (filePath.includes('APIEndpointManager.ts')) {
    // インターフェースの閉じ括弧追加
    content = content.replace(/(timestamp:\s*number);(\s*export\s+class)/g, '$1;\n}$2');
    
    // オブジェクトプロパティの閉じ括弧追加
    content = content.replace(/(requestHistory:\s*Map<string,\s*any\[\]>\s*});/g, '$1 };');
    content = content.replace(/(requireAuthentication:\s*boolean);(\s*private)/g, '$1;\n    };$2');
    content = content.replace(/(lastRequestTime:\s*number\s*\|\s*null\s*});/g, '$1 };');
    
    modified = true;
  }
  
  // DataAggregationProcessor.ts 特有の修正
  if (filePath.includes('DataAggregationProcessor.ts')) {
    // 閉じ括弧の追加
    content = content.replace(/(this\.maxCacheSize\s*=\s*100)\s*}/g, '$1; }');
    
    // パラメータリストの修正
    content = content.replace(/,\s*options:\s*any\s*=\s*\{}\s*\{/g, ', options: any = {}) {');
    
    modified = true;
  }
  
  return { content, modified };
}

// ファイルを修正する関数
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    // 深刻な構文エラーの修正
    const criticalResult = fixCriticalSyntaxErrors(content);
    if (criticalResult.modified) {
      content = criticalResult.content;
      totalModified = true;
      console.log(`  Fixed critical syntax errors`);
    }
    
    // ファイル固有パターンの修正
    const specificResult = fixSpecificPatterns(content, filePath);
    if (specificResult.modified) {
      content = specificResult.content;
      totalModified = true;
      console.log(`  Fixed file-specific patterns`);
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
  console.log('🔧 Fixing critical TypeScript syntax errors...\n');

  // 最も問題のあるファイルから開始
  const criticalFiles = [
    'src/analytics/analytics-api/APIEndpointManager.ts',
    'src/analytics/analytics-api/DataAggregationProcessor.ts',
    'src/analytics/analytics-api/DataExportHandler.ts'
  ];
  
  console.log('📁 Processing critical files first...');
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      fixFile(file);
    }
  }

  // その他のファイルも処理
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
      // すでに処理したファイルはスキップ
      if (criticalFiles.includes(file)) continue;
      
      totalFiles++;
      if (fixFile(file)) {
        totalFixed++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`Critical files fixed: ${criticalFiles.length}`);
  console.log(`Total additional files processed: ${totalFiles}`);
  console.log(`Additional files fixed: ${totalFixed}`);
  console.log(`\n✅ Done!`);
}

// 実行
main().catch(console.error);