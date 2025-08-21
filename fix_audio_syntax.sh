#!/bin/bash

# src/audio ディレクトリのTypeScript構文エラー一括修正スクリプト

AUDIO_DIR="/Users/taku-o/Documents/workspaces/awaputi/src/audio"

echo "Starting TypeScript syntax fixes for src/audio directory..."

# よくある構文エラーパターンを修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/interface \([A-Za-z0-9_]*\) {/interface \1 {/g' \
  -e 's/,$/;/g' \
  -e 's/{ \([^}]*\),$/{ \1;/g' \
  -e 's/\([^;{]\),\([[:space:]]*\)$/\1;\2/g' \
  -e 's/lo,w:/low:/g' \
  -e 's/hig,h:/high:/g' \
  -e 's/curren,t:/current:/g' \
  -e 's/initialize,d:/initialized:/g' \
  -e 's/versio,n:/version:/g' \
  -e 's/;$/;/g' \
  {} \;

echo "Basic syntax fixes applied."

# インターフェースの閉じ括弧を確認・修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e '/^interface.*{$/,/^}$/ {
    /^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*:[[:space:]]*[^;]*$/s/$/;/
  }' \
  {} \;

echo "Interface syntax fixes applied."

# よくある引用符エラーを修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/''\$//g" \
  -e "s/^[[:space:]]*'[[:space:]]*\$//g" \
  -e "s/^[[:space:]]*,'[[:space:]]*\$//g" \
  {} \;

echo "Quote syntax fixes applied."

echo "Audio directory syntax fixes completed."