#!/bin/bash

# src/audio ディレクトリの共通構文エラー一括修正スクリプト

AUDIO_DIR="/Users/taku-o/Documents/workspaces/awaputi/src/audio"

echo "Starting common audio syntax fixes..."

# 1. インターフェースの閉じ括弧不足を修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e '/^interface [A-Za-z0-9_]* {$/,/^}$/ {
    /^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*:[[:space:]]*[^;{}]*$/s/$/;/
    /^[[:space:]]*\[[^]]*\]:[[:space:]]*[^;{}]*$/s/$/;/
  }' \
  {} \;

# 2. 関数終了の構文修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/} catch (error) {'/} catch (error) {/g" \
  -e "s/{ try {'/{ try {/g" \
  -e "s/;'/;/g" \
  -e "s/')';/');/g" \
  -e "s/');'/');/g" \
  {} \;

# 3. private/public キーワードの修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/private,/private/g" \
  -e "s/public,/public/g" \
  -e "s/protected,/protected/g" \
  {} \;

# 4. 文字列リテラルエラーの修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/'\$//g" \
  -e "s/^[[:space:]]*'[[:space:]]*\$//g" \
  -e "s/''/'/g" \
  {} \;

# 5. オブジェクトリテラルの基本修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/: boolean;/: boolean,/g" \
  -e "s/: number;/: number,/g" \
  -e "s/: string;/: string,/g" \
  -e "s/, }/ }/g" \
  {} \;

echo "Common audio syntax fixes completed."