#!/usr/bin/env python3
import re
import sys

def add_org_pressure(content):
    # Pattern to find test case objects that have codeChange but not organisationalPressure
    # Look for codeChange followed by other fields, and insert organisationalPressure after it
    pattern = r'(codeChange:\s*[^,\n]+,)(\s*)((?!organisationalPressure)[a-zA-Z])'
    replacement = r'\1\2organisationalPressure: 1,\2\3'
    return re.sub(pattern, replacement, content)

if __name__ == '__main__':
    file_path = sys.argv[1]
    with open(file_path, 'r') as f:
        content = f.read()
    
    new_content = add_org_pressure(content)
    
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    print(f"Fixed {file_path}")
