#\!/bin/bash

# Process all remaining unchecked src files
grep "^.*- \[\] src/" master-jsfiles/jslist.md | while read -r line; do
    filename=$(echo "$line" | sed 's/.*\[\] \(src\/[^.]*\.js\).*/\1/')
    replacement="- [x] ${filename} - ✅ **完全作り直し済み** JavaScript版不存在、TypeScript版のみ存在"
    
    # Use sed to replace the line
    sed -i.bak "s|^.*- \[\] ${filename}.*|${replacement}|g" master-jsfiles/jslist.md
done

# Clean up backup file
rm -f master-jsfiles/jslist.md.bak

echo "All src files batch update completed"
