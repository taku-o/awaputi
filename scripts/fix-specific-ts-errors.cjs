const fs = require('fs');
const path = require('path');
const glob = require('glob');

// エラーパターンと修正方法の定義
const fixPatterns = [
  // 1. 構文エラー: (param as any) → (param: any)
  {
    name: 'parameter type syntax',
    pattern: /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+any\)/g,
    replacement: '($1: any)'
  },
  
  // 2. アロー関数パラメータ: async (query as any) => → async (query: any) =>
  {
    name: 'async arrow function parameter',
    pattern: /async\s*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+any\)\s*=>/g,
    replacement: 'async ($1: any) =>'
  },
  
  // 3. 不正な型注釈: key: any7121 → key: any
  {
    name: 'invalid type annotation',
    pattern: /:\s*any\d+/g,
    replacement: ': any'
  },
  
  // 4. 構文エラー修正
  {
    name: 'syntax errors',
    process: (content) => {
      // 複数の修正を連鎖的に適用
      return content
        // 関数呼び出しの閉じ括弧が不足
        .replace(/\.toISOString\(,/g, '.toISOString(),')
        .replace(/\.keys\(\),/g, '.keys()),')
        // オブジェクトリテラル内の不正なセミコロン
        .replace(/(\{[^}]+);([^}]+\})/g, (match) => {
          return match.replace(/;/g, ',');
        })
        // 不正な文字列終端
        .replace(/error';'/g, "error';")
        .replace(/error";"/g, 'error";')
        // 不正な括弧
        .replace(/\}\)/g, (match, offset, str) => {
          const before = str.substring(Math.max(0, offset - 50), offset);
          if (before.includes('jest.fn(') || before.includes('.then(') || before.includes('.filter(')) {
            return ')';
          }
          return match;
        })
        // オブジェクトリテラルの終端
        .replace(/,\s*}/g, ' }')
        .replace(/,\s*\)/g, ')')
        // 不正な代入
        .replace(/\}\s*=\s*catch/g, '} catch')
        // 引数の不正なカンマ
        .replace(/\(,/g, '(')
        .replace(/,\)/g, ')')
        // オブジェクトプロパティの修正
        .replace(/:\s*undefined\s*}/g, ': undefined }')
        // 複数の閉じ括弧
        .replace(/\)\)\)/g, '))')
        .replace(/\}\}\}/g, '}}')
        // for...of 構文修正
        .replace(/for\s*\(\s*const,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s+of,\s*/g, 'for (const $1 of ')
        // 不正なプロパティアクセス
        .replace(/\.\s*,/g, ',')
        // 空のブロック
        .replace(/\{\s*'\s*\}/g, '{ }')
        .replace(/\{\s*"\s*\}/g, '{ }');
    }
  },
  
  // 5. 文字列リテラルの修正
  {
    name: 'string literal fixes',
    process: (content) => {
      const lines = content.split('\n');
      const fixedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 文字列の不正な終端を修正
        line = line
          .replace(/';'/g, "';")
          .replace(/'}'$/g, "' }")
          .replace(/";"/g, '";')
          .replace(/"}"$/g, '" }')
          // 不正な文字列連結
          .replace(/'\s*'/g, "''")
          .replace(/"\s*"/g, '""');
        
        // 行末のセミコロン/カンマの修正
        if (line.trim().endsWith(',;')) {
          line = line.replace(/,;$/, ';');
        }
        if (line.trim().endsWith(';;')) {
          line = line.replace(/;;$/, ';');
        }
        
        fixedLines.push(line);
      }
      
      return fixedLines.join('\n');
    }
  },
  
  // 6. 条件文・制御構文の修正
  {
    name: 'control flow fixes',
    process: (content) => {
      return content
        // if文の修正
        .replace(/if\s*\(\s*([^)]+)\s*\{\s*'\s*\}/g, "if ($1) { }")
        .replace(/if\s*\(\s*([^)]+)\s*\{\s*"\s*\}/g, 'if ($1) { }')
        // switch文の修正
        .replace(/case\s+'([^']+)'\s*:\s*;/g, "case '$1':")
        .replace(/case\s+"([^"]+)"\s*:\s*;/g, 'case "$1":')
        // return文の修正
        .replace(/return\s+([^;]+);'/g, "return $1;")
        .replace(/return\s+([^;]+);"/g, 'return $1;');
    }
  },
  
  // 7. 関数定義の修正
  {
    name: 'function definition fixes',
    process: (content) => {
      return content
        // メソッド定義の修正
        .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*([^)]*)\s*\)\s*\{\s*};/g, '$1($2) { }')
        // プロパティ定義の修正
        .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;]+)\s*,\s*}/g, '$1: $2 }')
        // 空の関数本体
        .replace(/\{\s*\n\s*\n\s*\}/g, '{\n    \n}');
    }
  }
];

// ファイルを修正する関数
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;

    // 各パターンを適用
    for (const fix of fixPatterns) {
      if (fix.process) {
        const newContent = fix.process(content);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          console.log(`  Applied: ${fix.name}`);
        }
      } else if (fix.pattern && fix.replacement) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          console.log(`  Applied: ${fix.name}`);
        }
      }
    }

    if (modified) {
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
  console.log('🔧 Fixing TypeScript syntax errors...\n');

  const targetPatterns = [
    'src/**/*.ts',
    'test/**/*.ts',
    'tests/**/*.ts'
  ];

  let totalFixed = 0;
  let totalFiles = 0;
  let totalErrors = 0;

  for (const pattern of targetPatterns) {
    const files = glob.sync(pattern, { nodir: true });
    console.log(`\n📁 Processing ${pattern} (${files.length} files)...`);
    
    for (const file of files) {
      totalFiles++;
      try {
        if (fixFile(file)) {
          totalFixed++;
        }
      } catch (error) {
        totalErrors++;
        console.error(`❌ Failed to process ${file}:`, error.message);
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files fixed: ${totalFixed}`);
  console.log(`Errors encountered: ${totalErrors}`);
  console.log(`\n✅ Done!`);
}

// 実行
main().catch(console.error);