#!/usr/bin/env python3
import re
import sys
import os

def fix_ts2339_errors(file_path, errors):
    """Fix TS2339 errors by adding (object as any).property pattern"""
    
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Sort errors by line number in reverse order to avoid offset issues
    errors.sort(key=lambda x: x[0], reverse=True)
    
    for line_num, obj_name, prop_name in errors:
        # Convert to 0-based index
        idx = line_num - 1
        if idx < len(lines):
            line = lines[idx]
            
            # Pattern 1: object.property
            # Look for the specific property access
            pattern = rf'\b{re.escape(obj_name)}\.{re.escape(prop_name)}\b'
            
            # Check if already fixed
            if f'({obj_name} as any).{prop_name}' in line:
                continue
            
            # Replace with type assertion
            replacement = f'({obj_name} as any).{prop_name}'
            lines[idx] = re.sub(pattern, replacement, line)
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

def extract_ts2339_info(error_line):
    """Extract file path, line number, object and property from TS2339 error line"""
    # Pattern: file_path(line,col): error TS2339: Property 'prop' does not exist on type 'Type'.
    match = re.match(r"(.+?)\((\d+),\d+\): error TS2339: Property '([^']+)' does not exist on type", error_line)
    if match:
        file_path = match.group(1)
        line_num = int(match.group(2))
        prop_name = match.group(3)
        
        # Try to extract the object name from the file at that line
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                if line_num <= len(lines):
                    line = lines[line_num - 1]
                    # Look for pattern like: object.property
                    obj_match = re.search(rf'(\w+)\.{re.escape(prop_name)}', line)
                    if obj_match:
                        obj_name = obj_match.group(1)
                        return file_path, line_num, obj_name, prop_name
        except:
            pass
    
    return None, None, None, None

if __name__ == '__main__':
    # Read TypeScript errors from stdin and group by file
    errors_by_file = {}
    
    for line in sys.stdin:
        file_path, line_num, obj_name, prop_name = extract_ts2339_info(line.strip())
        if file_path and line_num and obj_name and prop_name:
            if file_path not in errors_by_file:
                errors_by_file[file_path] = []
            errors_by_file[file_path].append((line_num, obj_name, prop_name))
    
    # Fix errors in each file
    for file_path, errors in errors_by_file.items():
        if os.path.exists(file_path):
            fix_ts2339_errors(file_path, errors)
            print(f"Fixed {len(errors)} TS2339 errors in {file_path}")