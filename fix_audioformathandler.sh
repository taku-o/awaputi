#!/bin/bash

# AudioFormatHandler.ts の特定パターン修正スクリプト

FILE="/Users/taku-o/Documents/workspaces/awaputi/src/audio/components/AudioFormatHandler.ts"

echo "Starting AudioFormatHandler.ts specific fixes..."

# 1. 関数終了の '}' パターンを修正
sed -i '' "s/\(' }\)/');/g" "$FILE"

# 2. 不正な引用符パターンを修正
sed -i '' "s/'\$//g" "$FILE"
sed -i '' "s/^[[:space:]]*,'[[:space:]]*\$//g" "$FILE"

# 3. 関数パラメータの構文エラーを修正
sed -i '' "s/);'/);/g" "$FILE"
sed -i '' "s/')';/');/g" "$FILE"

# 4. オブジェクトリテラルのセミコロンをカンマに修正（特定パターン）
sed -i '' "s/: boolean;/: boolean,/g" "$FILE"
sed -i '' "s/: number;/: number,/g" "$FILE"
sed -i '' "s/: string;/: string,/g" "$FILE"

# 5. try-catch ブロックの修正
sed -i '' "s/{ try {'/{ 
    try {/g" "$FILE"
sed -i '' "s/} catch (error) {'/
} catch (error) {/g" "$FILE"

# 6. 関数の戻り値型の修正
sed -i '' "s/: Promise<boolean>;/: Promise<boolean> {/g" "$FILE"

# 7. コメント内の不正な引用符を修正
sed -i '' "s/\* @param .*'/*/g" "$FILE"

echo "AudioFormatHandler.ts specific fixes completed."