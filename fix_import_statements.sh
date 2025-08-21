#!/bin/bash

# Import statements修正スクリプト
AUDIO_DIR="/Users/taku-o/Documents/workspaces/awaputi/src/audio"

echo "Starting import statement fixes..."

# 1. import文の末尾カンマ→セミコロン修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/^import.*,$/&/; t; s/,$/;/' \
  -e 's/} from .*,$/&/; t; s/,$/;/' \
  {} \;

# 2. 具体的なimport文パターン修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/from '[^']*',$/&/; t; s/,$/;/" \
  -e 's/from "[^"]*",$/&/; t; s/,$/;/' \
  {} \;

# 3. type/interface定義のセミコロン→セミコロン統一
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/type.*=.*,$/&/; t; s/,$/;/' \
  {} \;

echo "Import statement fixes completed."