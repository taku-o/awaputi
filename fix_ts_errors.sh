#!/bin/bash

echo "Starting TypeScript error fixes in src/utils/..."

# Function to fix unused variables (TS6133) by adding underscore prefix
fix_unused_vars() {
    local file=$1
    local var_name=$2
    local line_num=$3
    
    echo "Fixing unused variable '$var_name' in $file at line $line_num"
    
    # Use sed to add underscore prefix
    # Handle different declaration patterns
    sed -i '' -e "${line_num}s/\(const\|let\|var\) ${var_name}/\1 _${var_name}/g" \
              -e "${line_num}s/\([,(]\s*\)${var_name}\(\s*[,:)]\)/\1_${var_name}\2/g" \
              -e "${line_num}s/\([,(]\s*\)${var_name}\(\s*:\)/\1_${var_name}\2/g" "$file"
}

# Function to fix missing properties (TS2339) by type assertion
fix_missing_props() {
    local file=$1
    local line_num=$2
    
    echo "Fixing missing property in $file at line $line_num"
    
    # Add type assertion pattern
    sed -i '' -e "${line_num}s/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/(\1 as any).\2/g" "$file"
}

# Process TS6133 errors
echo "Processing TS6133 (unused variables) errors..."
npx tsc --noEmit 2>&1 | grep -E "src/utils.*TS6133" | while IFS=: read -r file line col rest; do
    if [[ -f "$file" ]]; then
        # Extract variable name from error message
        var_name=$(echo "$rest" | grep -o "'[^']*'" | head -1 | tr -d "'")
        if [[ -n "$var_name" ]]; then
            fix_unused_vars "$file" "$var_name" "${line%%\)*}"
        fi
    fi
done

echo "TypeScript error fixes completed!"
echo "Running tsc to verify remaining errors..."

# Count errors before and after
ERRORS_AFTER=$(npx tsc --noEmit 2>&1 | grep -E "src/utils.*TS6133" | wc -l)
echo "Remaining TS6133 errors in src/utils: $ERRORS_AFTER"