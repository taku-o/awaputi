const fs = require('fs');
const path = require('path');

// APIEndpointManager.ts の特定のエラーを修正
function fixAPIEndpointManager() {
  const filePath = path.join(__dirname, '../src/analytics/analytics-api/APIEndpointManager.ts');
  
  if (!fs.existsSync(filePath)) {
    console.error('APIEndpointManager.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. toISOString( → toISOString()
  content = content.replace(/new Date\(\)\.toISOString\(,/g, 'new Date().toISOString(),');
  
  // 2. Array.from(this.endpoints.keys(), → Array.from(this.endpoints.keys())
  content = content.replace(/Array\.from\(this\.endpoints\.keys\(\),/g, 'Array.from(this.endpoints.keys()),');
  
  // 3. その他の構文エラー修正
  // オブジェクトリテラル内のセミコロン → カンマ
  content = content.replace(/(\{[^}]*);(?=[^}]*\})/g, '$1,');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed APIEndpointManager.ts');
}

// DataAggregationProcessor.ts の修正
function fixDataAggregationProcessor() {
  const filePath = path.join(__dirname, '../src/analytics/analytics-api/DataAggregationProcessor.ts');
  
  if (!fs.existsSync(filePath)) {
    console.error('DataAggregationProcessor.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. try-catch ブロックの修正
  content = content.replace(/\}\s*=\s*catch\s*\(/g, '} catch (');
  
  // 2. 不正な文字列リテラルの修正
  // 閉じられていない文字列を検出して修正
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 文字列が閉じられていない場合の修正
    if ((line.match(/"/g) || []).length % 2 !== 0) {
      // 行末に " を追加
      if (!line.endsWith('"') && !line.endsWith("'")) {
        lines[i] = line + '"';
      }
    }
    
    // 単一引用符の場合も同様
    if ((line.match(/'/g) || []).length % 2 !== 0) {
      if (!line.endsWith('"') && !line.endsWith("'")) {
        lines[i] = line + "'";
      }
    }
  }
  content = lines.join('\n');
  
  // 3. 関数呼び出しの括弧修正
  content = content.replace(/\(([^,)]+),\s*\)/g, '($1)');
  
  // 4. オブジェクトリテラルの修正
  content = content.replace(/\{([^:}]+):\s*([^,}]+);/g, '{$1: $2,');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed DataAggregationProcessor.ts');
}

// メイン処理
function main() {
  console.log('🔧 Fixing specific TypeScript syntax errors...\n');
  
  fixAPIEndpointManager();
  fixDataAggregationProcessor();
  
  console.log('\n✅ Done!');
}

main();