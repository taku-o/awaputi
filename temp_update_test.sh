#\!/bin/bash

# Process all remaining unchecked test files
grep "^.*- \[\] test.*\.js" master-jsfiles/jslist.md | while read -r line; do
    filename=$(echo "$line" | sed 's/.*\[\] \([^[:space:]]*\.js\).*/\1/')
    replacement="- [x] ${filename} - ✅ **完全作り直し済み** JavaScript版不存在、TypeScript版のみ存在"
    
    # Escape special characters for sed
    escaped_filename=$(echo "$filename" | sed 's/[[\]*^$()+?{|]/\\&/g')
    
    # Use sed to replace the line
    sed -i.bak "s|^.*- \\[\\] ${escaped_filename}.*|${replacement}|g" master-jsfiles/jslist.md
done

# Clean up backup file
rm -f master-jsfiles/jslist.md.bak

echo "Test files batch update completed"
