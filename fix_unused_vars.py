#!/usr/bin/env python3
import re
import sys

def fix_unused_variables(content):
    """Add underscore prefix to unused variables in TypeScript code"""
    lines = content.split('\n')
    modified_lines = []
    
    for line in lines:
        # Pattern to match variable declarations
        # const/let/var variableName = ...
        match = re.match(r'^(\s*)(const|let|var)\s+([a-zA-Z_]\w*)\s*=', line)
        if match:
            indent = match.group(1)
            keyword = match.group(2)
            var_name = match.group(3)
            
            # Check if variable is likely unused (common patterns)
            # This is a heuristic - we'll fix based on actual TS6133 errors
            if var_name in ['retryCount', 'configManager', 'frameRegions', 'globalAlpha', 
                           'globalCompositeOperation', 'viewport', 'renderResult', 'path',
                           'handleErrorAndRecover', 'reports', 'deletedFiles', 'validationResults',
                           'relativePath', 'oldValue', 'mainController']:
                # Add underscore prefix if not already present
                if not var_name.startswith('_'):
                    new_line = line.replace(f'{keyword} {var_name}', f'{keyword} _{var_name}')
                    modified_lines.append(new_line)
                else:
                    modified_lines.append(line)
            else:
                modified_lines.append(line)
        else:
            # Check for function parameters
            # function(..., paramName, ...) or (..., paramName: Type, ...)
            param_pattern = r'\b([a-zA-Z_]\w*)\s*(?::\s*[^,\)]+)?(?=[,\)])'
            
            def replace_param(match):
                param = match.group(1)
                if param in ['width', 'height', 'context', 'viewport', 'oldValue']:
                    return match.group(0).replace(param, f'_{param}')
                return match.group(0)
            
            if '(' in line and ')' in line:
                modified_line = re.sub(param_pattern, replace_param, line)
                modified_lines.append(modified_line)
            else:
                modified_lines.append(line)
    
    return '\n'.join(modified_lines)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python fix_unused_vars.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content = fix_unused_variables(content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print(f"Fixed unused variables in {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        sys.exit(1)