const fs = require('fs');
const path = require('path');
const glob = require('glob');

// エラーパターンと修正方法の定義
const fixPatterns = [
  // 1. パラメータ型構文エラー: (param as any) → (param: any)
  {
    pattern: /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+any\)/g,
    replacement: '($1: any)'
  },
  // 2. アロー関数パラメータ型エラー: async (query as any) => → async (query: any) =>
  {
    pattern: /async\s*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+any\)\s*=>/g,
    replacement: 'async ($1: any) =>'
  },
  // 3. 複数パラメータの型構文エラー: (param1 as any, param2 as string) → (param1: any, param2: string)
  {
    pattern: /\(([^)]+)\)/g,
    process: (match) => {
      if (match.includes(' as ')) {
        const content = match.slice(1, -1);
        const fixed = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+/g, '$1: ');
        return `(${fixed})`;
      }
      return match;
    }
  },
  // 4. オブジェクトプロパティの as any 修正: { prop as any } → { prop: any }
  {
    pattern: /\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+any\s*\}/g,
    replacement: '{ $1: any }'
  },
  // 5. 不正な型注釈: key: any7121 → key: any
  {
    pattern: /:\s*any\d+/g,
    replacement: ': any'
  },
  // 6. Date.now(}) → Date.now()
  {
    pattern: /Date\.now\(\}\)/g,
    replacement: 'Date.now()'
  },
  // 7. jest.fn(() => 16.67} → jest.fn(() => 16.67)
  {
    pattern: /jest\.fn\(\(\)\s*=>\s*([0-9.]+)\}/g,
    replacement: 'jest.fn(() => $1)'
  },
  // 8. 不正な閉じ括弧: }) → )
  {
    pattern: /\}\)/g,
    process: (match, index, content) => {
      // 文脈を見て適切に判断
      const before = content.substring(Math.max(0, index - 50), index);
      if (before.includes('jest.fn(') || before.includes('.map(') || before.includes('.filter(')) {
        return ')';
      }
      return match;
    }
  },
  // 9. オブジェクトリテラル内のセミコロン修正: { prop: value; } → { prop: value, }
  {
    pattern: /(\{[^}]*);([^}]*\})/g,
    process: (match) => {
      // オブジェクトリテラル内のセミコロンをカンマに置換
      return match.replace(/;(?=[^}]*\})/g, ',');
    }
  },
  // 10. インターフェース定義の修正
  {
    pattern: /interface\s+([A-Za-z0-9_]+)\s*\{([^}]+)\}/g,
    process: (match) => {
      // インターフェース内のカンマをセミコロンに置換
      const interfaceName = match.match(/interface\s+([A-Za-z0-9_]+)/)[1];
      const content = match.match(/\{([^}]+)\}/)[1];
      const fixedContent = content.replace(/,\s*$/gm, ';');
      return `interface ${interfaceName} {${fixedContent}}`;
    }
  }
];

// ファイルを修正する関数
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let originalContent = content;

  // 各パターンを適用
  for (const fix of fixPatterns) {
    if (fix.process) {
      let newContent = content;
      if (fix.pattern.global) {
        newContent = content.replace(fix.pattern, fix.process);
      } else {
        // process関数を使う場合の特別な処理
        let match;
        let lastIndex = 0;
        let result = '';
        const regex = new RegExp(fix.pattern.source, 'g');
        
        while ((match = regex.exec(content)) !== null) {
          result += content.slice(lastIndex, match.index);
          result += fix.process(match[0], match.index, content);
          lastIndex = regex.lastIndex;
        }
        result += content.slice(lastIndex);
        newContent = result;
      }
      
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    } else {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

// メイン処理
async function main() {
  const targetDirs = [
    'src/**/*.ts',
    'test/**/*.ts',
    'tests/**/*.ts'
  ];

  let totalFixed = 0;
  let totalFiles = 0;

  for (const pattern of targetDirs) {
    const files = glob.sync(pattern, { nodir: true });
    
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
}

// 実行
main().catch(console.error);