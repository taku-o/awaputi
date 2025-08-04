#!/bin/bash

# アクセシビリティファイル分割プロジェクト Phase E.3
# ファイルサイズ監視スクリプト

echo "=== アクセシビリティファイルサイズ監視 ==="
echo "目標: 全ファイル2,500語以下"
echo ""

# 対象ファイルリスト
declare -a FILES=(
    "src/accessibility/KeyboardNavigationTester.js"
    "src/accessibility/WCAGValidator.js"
    "src/accessibility/ScreenReaderSimulator.js"
    "src/accessibility/AccessibilityOnboarding.js"
    "src/accessibility/ColorContrastAnalyzer.js"
    "src/accessibility/AccessibilitySettingsUI.js"
)

# 分割後のサブコンポーネントも監視対象に追加
declare -a SUB_COMPONENTS=(
    "src/accessibility/keyboard-navigation/"
    "src/accessibility/wcag-validator/"
    "src/accessibility/screen-reader/"
    "src/accessibility/onboarding/"
    "src/accessibility/color-contrast/"
    "src/accessibility/settings-ui/"
)

echo "メインファイル監視:"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        words=$(wc -w < "$file")
        if [ "$words" -gt 2500 ]; then
            echo "⚠️  $file: $words 語 (制限超過)"
        else
            echo "✅ $file: $words 語"
        fi
    else
        echo "⚪ $file: ファイル未存在"
    fi
done

echo ""
echo "サブコンポーネント監視:"
for dir in "${SUB_COMPONENTS[@]}"; do
    if [ -d "$dir" ]; then
        echo "📁 $dir:"
        find "$dir" -name "*.js" -type f | while read -r file; do
            words=$(wc -w < "$file")
            if [ "$words" -gt 2500 ]; then
                echo "  ⚠️  $(basename "$file"): $words 語 (制限超過)"
            else
                echo "  ✅ $(basename "$file"): $words 語"
            fi
        done
    else
        echo "⚪ $dir: ディレクトリ未存在"
    fi
done

echo ""
echo "=== 監視完了 ==="