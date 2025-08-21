#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// より高度な構文エラーを修正
const fixAdvancedSyntaxErrors = (content, filePath) => {
    let fixed = content;
    let modifications = 0;
    
    // Pattern 1: 重複セミコロンと余分な引用符
    // import { something  } from 'module.js';''
    fixed = fixed.replace(/(['"]);\s*\1+$/gm, (match, quote) => {
        modifications++;
        return quote + ';';
    });
    
    // Pattern 2: 配列・オブジェクトプロパティ後の不正な構文
    // property: value;
    // , anotherProperty: value
    fixed = fixed.replace(/:\s*([^,;\n]+);\s*\n\s*,\s*(\w+):/gm, (match, value1, prop2) => {
        modifications++;
        return `: ${value1},\n    ${prop2}:`;
    });
    
    // Pattern 3: 括弧内の不正なカンマとセミコロンの混在
    // something(param;, param2)
    fixed = fixed.replace(/\(([^)]*);,([^)]*)\)/g, (match, part1, part2) => {
        modifications++;
        return `(${part1}, ${part2})`;
    });
    
    // Pattern 4: 連続する文字列の結合
    // console.log('part1, part2, part3);
    fixed = fixed.replace(/console\.(log|error|warn|info)\((['"])([^'"]*),\s*([^'"]*),\s*([^'"]*)\);/g, 
        (match, method, quote, p1, p2, p3) => {
        modifications++;
        return `console.${method}(${quote}${p1} ${p2} ${p3}${quote});`;
    });
    
    // Pattern 5: 不正な関数パラメータセパレータ
    // function(even;t: Event)
    fixed = fixed.replace(/\(([^:)]+);([^:)]+):\s*([^)]+)\)/g, (match, param, rest, type) => {
        modifications++;
        return `(${param}${rest}: ${type})`;
    });
    
    // Pattern 6: 文字列内の不正なセミコロン
    // star;t -> start
    fixed = fixed.replace(/(\w+);(\w+)/g, (match, part1, part2) => {
        // 一般的な typo パターンのみ修正
        const knownTypos = {
            'star;t': 'start',
            'even;t': 'event',
            'mutation;s': 'mutations',
            'totalContras;t': 'totalContrast'
        };
        if (knownTypos[match]) {
            modifications++;
            return knownTypos[match];
        }
        return match;
    });
    
    // Pattern 7: 三項演算子の不正な構文
    // condition ?   : undefined
    fixed = fixed.replace(/\?\s*:\s*undefined/g, () => {
        modifications++;
        return '? undefined : undefined';
    });
    
    // Pattern 8: メソッドチェーンの不正な呼び出し
    // .toString(36}.substr(2, 9})
    fixed = fixed.replace(/\.toString\((\d+)\}\.substr\(/g, (match, radix) => {
        modifications++;
        return `.toString(${radix}).substr(`;
    });
    
    // Pattern 9: Date.now()の不正な括弧
    // Date.now(}
    fixed = fixed.replace(/Date\.now\(\}/g, () => {
        modifications++;
        return 'Date.now()';
    });
    
    // Pattern 10: Math.random()の不正な括弧
    // Math.random(}
    fixed = fixed.replace(/Math\.random\(\}/g, () => {
        modifications++;
        return 'Math.random()';
    });
    
    // Pattern 11: 不正な文字列リテラル結合
    // 'string) -> 'string'
    fixed = fixed.replace(/(['"])([^'"]+)\)/g, (match, quote, content) => {
        // 関数呼び出しでない場合のみ修正
        if (!match.includes('(')) {
            modifications++;
            return `${quote}${content}${quote}`;
        }
        return match;
    });
    
    // Pattern 12: オブジェクトリテラルの不正な終了
    // property: value }
    // }
    fixed = fixed.replace(/:\s*([^,}\n]+)\s*\}\s*\n\s*\}/gm, (match, value) => {
        modifications++;
        return `: ${value}\n    }`;
    });
    
    // Pattern 13: 配列アクセスの後の不正な構文
    // array] }); -> array]});
    fixed = fixed.replace(/\]\s*\}\s*\);/g, () => {
        modifications++;
        return ']});';
    });
    
    // Pattern 14: 関数呼び出しの不正な括弧
    // function(') -> function()
    fixed = fixed.replace(/\((['"])\)/g, () => {
        modifications++;
        return '()';
    });
    
    // Pattern 15: プロパティアクセスの不正な構文
    // object? .property -> object?.property
    fixed = fixed.replace(/\?\s+\./g, '?.');
    
    console.log(`Fixed ${modifications} advanced syntax issues in ${path.basename(filePath)}`);
    return fixed;
};

// TypeScriptファイルを再帰的に検索
const findTypeScriptFiles = (dir) => {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...findTypeScriptFiles(fullPath));
        } else if (stat.isFile() && item.endsWith('.ts') && !item.endsWith('.d.ts')) {
            files.push(fullPath);
        }
    }
    
    return files;
};

// ファイルを処理
const processFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixed = fixAdvancedSyntaxErrors(content, filePath);
        
        if (content !== fixed) {
            fs.writeFileSync(filePath, fixed, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
};

// メイン処理
console.log('Fixing advanced TypeScript syntax errors...\n');

const srcDir = path.join(__dirname, '..', 'src');
const files = findTypeScriptFiles(srcDir);

console.log(`Found ${files.length} TypeScript files to process\n`);

let modifiedCount = 0;
let totalModifications = 0;

files.forEach((file, index) => {
    if (index % 100 === 0) {
        console.log(`Progress: ${index}/${files.length} files...`);
    }
    
    if (processFile(file)) {
        modifiedCount++;
    }
});

console.log(`\nAdvanced syntax fixes complete!`);
console.log(`Modified ${modifiedCount} files`);