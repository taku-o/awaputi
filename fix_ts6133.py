#!/usr/bin/env python3
import re
import sys
import os

def fix_ts6133_errors(file_path, line_numbers_and_vars):
    """Fix TS6133 errors by adding underscore prefix to unused variables"""
    
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Sort line numbers in reverse order to avoid offset issues
    fixes = sorted(line_numbers_and_vars, key=lambda x: x[0], reverse=True)
    
    for line_num, var_name in fixes:
        # Convert to 0-based index
        idx = line_num - 1
        if idx < len(lines):
            line = lines[idx]
            
            # Skip if already has underscore prefix
            if f'_{var_name}' in line:
                continue
                
            # Handle different patterns
            # Pattern 1: const/let/var varName = 
            pattern1 = rf'\b(const|let|var)\s+{re.escape(var_name)}\b'
            if re.search(pattern1, line):
                lines[idx] = re.sub(pattern1, rf'\1 _{var_name}', line)
                continue
            
            # Pattern 2: function parameter: (varName) or , varName, or , varName: Type
            # Match word boundary before variable name
            pattern2 = rf'([\(,]\s*){re.escape(var_name)}(\s*[:,\)])'
            if re.search(pattern2, line):
                lines[idx] = re.sub(pattern2, rf'\1_{var_name}\2', line)
                continue
                
            # Pattern 3: destructuring: { varName } or { varName: alias }
            pattern3 = r'(\{[^}]*\s*)' + re.escape(var_name) + r'(\s*[:,}])'
            if re.search(pattern3, line):
                lines[idx] = re.sub(pattern3, rf'\1_{var_name}\2', line)
                continue
                
            # Pattern 4: array destructuring: [ varName ] or [ varName, ...]
            pattern4 = rf'(\[[^\]]*\s*){re.escape(var_name)}(\s*[,\]])'
            if re.search(pattern4, line):
                lines[idx] = re.sub(pattern4, rf'\1_{var_name}\2', line)
                continue
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

def extract_error_info(error_line):
    """Extract file path, line number, and variable name from error line"""
    # Pattern: file_path(line,col): error TS6133: 'var_name' is declared but its value is never read.
    match = re.match(r'(.+?)\((\d+),\d+\): error TS6133: \'([^\']+)\' is declared', error_line)
    if match:
        return match.group(1), int(match.group(2)), match.group(3)
    return None, None, None

if __name__ == '__main__':
    # Read error lines from stdin or process files directly
    if len(sys.argv) > 1:
        # Process specific files with line numbers and variable names
        # Format: python fix_ts6133.py file.ts:linenum:varname file2.ts:linenum2:varname2
        for arg in sys.argv[1:]:
            parts = arg.split(':')
            if len(parts) == 3:
                file_path, line_num, var_name = parts
                fix_ts6133_errors(file_path, [(int(line_num), var_name)])
                print(f"Fixed {var_name} in {file_path}:{line_num}")
    else:
        # Read TypeScript errors from stdin and group by file
        errors_by_file = {}
        for line in sys.stdin:
            file_path, line_num, var_name = extract_error_info(line.strip())
            if file_path and line_num and var_name:
                if file_path not in errors_by_file:
                    errors_by_file[file_path] = []
                errors_by_file[file_path].append((line_num, var_name))
        
        # Fix errors in each file
        for file_path, errors in errors_by_file.items():
            if os.path.exists(file_path):
                fix_ts6133_errors(file_path, errors)
                print(f"Fixed {len(errors)} TS6133 errors in {file_path}")