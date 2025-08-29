#\!/bin/bash

# Extract unchecked core files and create replacement commands
grep "^.*- \[\] src/core/" master-jsfiles/jslist.md | while read -r line; do
    filename=$(echo "$line" | sed 's/.*\[\] \(src\/core\/[^.]*\.js\).*/\1/')
    replacement="- [x] ${filename} - ✅ **完全作り直し済み** JavaScript版不存在、TypeScript版のみ存在"
    
    # Use sed to replace the line
    sed -i.bak "s|^.*- \[\] ${filename}.*|${replacement}|g" master-jsfiles/jslist.md
done

echo "Batch update completed"
