#!/bin/bash

# src/audio ディレクトリの包括的TypeScript構文エラー修正スクリプト

AUDIO_DIR="/Users/taku-o/Documents/workspaces/awaputi/src/audio"

echo "Starting comprehensive audio syntax fixes..."

# 1. TS1005: ',' expected - インターフェース/オブジェクトリテラルの修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/: boolean;$/: boolean,/g' \
  -e 's/: number;$/: number,/g' \
  -e 's/: string;$/: string,/g' \
  -e 's/: any;$/: any,/g' \
  -e 's/\(\]: [^,;]*\);$/\1,/g' \
  {} \;

# 2. TS1002: Unterminated string literal - 不正な引用符を修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/'\$//g" \
  -e "s/^[[:space:]]*'[[:space:]]*\$//g" \
  -e "s/,'[[:space:]]*\$/,/g" \
  -e "s/;'[[:space:]]*\$/;/g" \
  -e "s/}'[[:space:]]*\$/}/g" \
  -e "s/)';/');/g" \
  {} \;

# 3. オブジェクトリテラル/インターフェースの括弧修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/{;$/{/g' \
  -e 's/};$/}/g' \
  -e 's/, }$/}/g' \
  -e 's/,$/,/g' \
  {} \;

# 4. 関数定義の修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/): void {'/): void {/g" \
  -e "s/): boolean {'/): boolean {/g" \
  -e "s/): Promise<[^>]*> {'/): Promise<\1> {/g" \
  -e "s/{ try {'/{ try {/g" \
  -e "s/} catch (error) {'/} catch (error) {/g" \
  {} \;

# 5. クラスプロパティの修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/private,/private/g' \
  -e 's/public,/public/g' \
  -e 's/protected,/protected/g' \
  -e 's/readonly,/readonly/g' \
  {} \;

# 6. 配列/オブジェクトアクセスの修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e 's/\[;$/[/g' \
  -e 's/];$/]/g' \
  {} \;

# 7. コメントブロックの修正
find "$AUDIO_DIR" -name "*.ts" -exec sed -i '' \
  -e "s/\*\/'/\*\//g" \
  -e "s/\*\*'/\*\*/g" \
  {} \;

echo "Comprehensive audio syntax fixes completed."