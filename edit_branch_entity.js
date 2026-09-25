const fs = require('fs');
const file = '/home/jseren/syscorrect/api-correct/src/modules/branch/entities/branch.entity.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'items?: { uuid: string; name: string; description: string; item_type: string }[];;\n  items?: { uuid: string; name: string; description: string; item_type: string }[];',
  'items?: { uuid: string; name: string; description: string; item_type: string }[];'
);

content = content.replace(
  'items?: { uuid: string; name: string; description: string; item_type: string }[];;\n    items?: { uuid: string; name: string; description: string; item_type: string }[];',
  'items?: { uuid: string; name: string; description: string; item_type: string }[];'
);

fs.writeFileSync(file, content);
console.log('Branch entity updated');
