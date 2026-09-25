const fs = require('fs');

const dtoFile = '/home/jseren/syscorrect/api-correct/src/modules/branch/usecases/get-list-branch/dto/get-list-branch.dto.ts';
let dtoContent = fs.readFileSync(dtoFile, 'utf8');
dtoContent = dtoContent.replace(
  'updated_at: string\n}',
  'updated_at: string\n    items?: { uuid: string; name: string; description: string; item_type: string }[]\n}'
);
fs.writeFileSync(dtoFile, dtoContent);
console.log('DTO updated');

const usecaseFile = '/home/jseren/syscorrect/api-correct/src/modules/branch/usecases/get-list-branch/get-list-branch.usecase.ts';
let usecaseContent = fs.readFileSync(usecaseFile, 'utf8');
usecaseContent = usecaseContent.replace(
  'updated_at: item.updated_at,\n        }));',
  'updated_at: item.updated_at,\n            items: item.items,\n        }));'
);
fs.writeFileSync(usecaseFile, usecaseContent);
console.log('Usecase updated');
