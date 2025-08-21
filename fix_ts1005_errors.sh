#!/bin/bash

# TS1005: ',' expected エラーの集中修正スクリプト
AUDIO_DIR="/Users/taku-o/Documents/workspaces/awaputi/src/audio"

echo "Starting TS1005 ',' expected error fixes..."

# 1. インターフェース・型定義のセミコロン→セミコロン統一（プロパティ）
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e '/^[[:space:]]*interface\|^[[:space:]]*type.*=/,/^[[:space:]]*}/ {
    s/: boolean,$/: boolean;/g
    s/: number,$/: number;/g
    s/: string,$/: string;/g
    s/: any,$/: any;/g
    s/: void,$/: void;/g
    s/\[\],$/[];/g
    s/\[\] *,$/[];/g
  }' \
  {} \;

# 2. クラスプロパティのカンマ→セミコロン修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e '/^[[:space:]]*private\|^[[:space:]]*public\|^[[:space:]]*protected/ {
    s/: boolean,$/: boolean;/g
    s/: number,$/: number;/g
    s/: string,$/: string;/g
    s/: any,$/: any;/g
    s/\[\],$/[];/g
  }' \
  {} \;

# 3. オブジェクトリテラルプロパティのセミコロン→カンマ修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e '/= {/,/^[[:space:]]*}/ {
    s/: [^,;{}]*;$/: \1,/g
  }' \
  {} \;

# 4. 配列要素のセミコロン→カンマ修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/\('"'"'[^'"'"']*'"'"'\);/\1,/g' \
  -e 's/\("[^"]*"\);/\1,/g' \
  {} \;

echo "TS1005 error fixes completed."