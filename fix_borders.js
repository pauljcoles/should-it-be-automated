const fs = require('fs');

const files = [
  'src/components/TestCaseRowNormal.tsx',
  'src/components/TestCaseRowTeaching.tsx',
  'src/components/TableFilters.tsx'
];

const replacements = [
  [/border-b-4 border-black/g, 'border-b'],
  [/border-r-4 border-black/g, 'border-r'],
  [/border-t-4 border-black/g, 'border-t'],
  [/border-l-4 border-black/g, 'border-l'],
  [/border-brutal/g, 'border rounded-lg'],
  [/shadow-brutal-lg/g, 'shadow-md'],
  [/shadow-brutal/g, 'shadow-sm'],
  [/hover:shadow-brutal/g, 'hover:shadow-md'],
  [/font-black/g, 'font-semibold'],
  [/border-2 border-black/g, 'border'],
];

files.forEach(filepath => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    
    replacements.forEach(([pattern, replacement]) => {
      content = content.replace(pattern, replacement);
    });
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Fixed ${filepath}`);
  } catch (error) {
    console.error(`Error fixing ${filepath}:`, error.message);
  }
});

console.log('Done!');
