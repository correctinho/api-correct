const fs = require('fs');
const file = '/home/jseren/syscorrect/api-correct/src/modules/branch/repositories/implementations/branch.prisma.repository.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace getByID include
content = content.replace(
  'include: { BranchItem: { include: { Item: { select: { uuid: true, name: true } } } } }',
  'include: { BranchItem: { include: { Item: { select: { uuid: true, name: true, description: true, item_type: true } } } } }'
);

// Replace getByID branchProps
content = content.replace(
  'benefits_uuid: branchData.BranchItem.map(r => r.Item.uuid),\n      created_at',
  'benefits_uuid: branchData.BranchItem.map(r => r.Item.uuid),\n      items: branchData.BranchItem.map(r => r.Item),\n      created_at'
);

fs.writeFileSync(file, content);
console.log('getByID updated');
