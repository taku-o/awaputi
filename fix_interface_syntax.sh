#!/bin/bash

# 集中的なインターフェース構文修正スクリプト
AUDIO_DIR="/Users/taku-o/Documents/workspaces/awaputi/src/audio"

echo "Starting interface syntax fixes..."

# 1. インターフェースプロパティのセミコロン化（カンマからセミコロンへ）
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e '/interface.*{$/,/^}$/ {
    s/: boolean,$/: boolean;/g
    s/: number,$/: number;/g  
    s/: string,$/: string;/g
    s/: any,$/: any;/g
    s/\]: [^,;]*,$/]: \1;/g
  }' \
  {} \;

# 2. オブジェクトリテラルプロパティのカンマ化
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e '/= {$/,/^[[:space:]]*}/ {
    s/: [^,;]*;$/: \1,/g
  }' \
  {} \;

# 3. インターフェース/オブジェクトの閉じ括弧修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/},$//g' \
  -e 's/};,/},/g' \
  {} \;

# 4. 文字列リテラルの修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/'[[:space:]]*$//g" \
  -e "s/\"[[:space:]]*$//g" \
  {} \;

echo "Interface syntax fixes completed."