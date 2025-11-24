#!/usr/bin/env python3
import re

files_to_fix = [
    'src/components/TestCaseRowNormal.tsx',
    'src/components/TestCaseRowTeaching.tsx',
    'src/components/TableFilters.tsx'
]

replacements = [
    (r'border-b-4 border-black', 'border-b'),
    (r'border-r-4 border-black', 'border-r'),
    (r'border-t-4 border-black', 'border-t'),
    (r'border-l-4 border-black', 'border-l'),
    (r'border-brutal', 'border rounded-lg'),
    (r'shadow-brutal-lg', 'shadow-md'),
    (r'shadow-brutal', 'shadow-sm'),
    (r'hover:shadow-brutal', 'hover:shadow-md'),
    (r'font-black', 'font-semibold'),
    (r'border-2 border-black', 'border'),
]

for filepath in files_to_fix:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        for old, new in replacements:
            content = re.sub(old, new, content)
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")

print("Done!")
