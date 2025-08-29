#!/bin/bash

# テストファイルの構文エラーを修正するスクリプト

echo "Fixing test syntax errors..."

# パラメータ型定義がない関数を修正
find tests -name "*.test.ts" -exec perl -i -pe 's/^(\s*[a-zA-Z_][a-zA-Z0-9_]*)\(([a-zA-Z_][a-zA-Z0-9_]*)\s+\{/$1($2: any) {/g' {} \;
find tests -name "*.test.ts" -exec perl -i -pe 's/^(\s*async\s+[a-zA-Z_][a-zA-Z0-9_]*)\(([a-zA-Z_][a-zA-Z0-9_]*)\s+\{/$1($2: any) {/g' {} \;

# その他の構文エラーパターンを修正
# 例: expect(value).toBe(true; → expect(value).toBe(true);
find tests -name "*.test.ts" -exec perl -i -pe 's/\.toBe\(([^)]+);/\.toBe\($1\);/g' {} \;
find tests -name "*.test.ts" -exec perl -i -pe 's/\.toEqual\(([^)]+);/\.toEqual\($1\);/g' {} \;
find tests -name "*.test.ts" -exec perl -i -pe 's/\.toHaveProperty\(([^)]+);/\.toHaveProperty\($1\);/g' {} \;

echo "Done!"