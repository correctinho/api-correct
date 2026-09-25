const fs = require('fs');
const file = '/home/jseren/syscorrect/api-correct/src/modules/branch/repositories/implementations/branch.prisma.repository.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const r = await prismaClient.branchInfo.findMany({\n      where\n    });',
  'const r = await prismaClient.branchInfo.findMany({\n      where,\n      include: { BranchItem: { include: { Item: { select: { uuid: true, name: true, description: true, item_type: true } } } } }\n    });'
);

content = content.replace(
  'if (r.length > 0) {\n      return r as BranchEntity[];\n    }',
  'if (r.length > 0) {\n      return r.map(branchData => BranchEntity.hydrate({\n        uuid: branchData.uuid,\n        name: branchData.name,\n        admin_tax: branchData.admin_tax,\n        marketing_tax: branchData.marketing_tax,\n        market_place_tax: branchData.market_place_tax,\n        benefits_name: branchData.BranchItem.map(b => b.Item.name),\n        benefits_uuid: branchData.BranchItem.map(b => b.Item.uuid),\n        items: branchData.BranchItem.map(b => b.Item),\n        created_at: branchData.created_at,\n        updated_at: branchData.updated_at\n      }));\n    }'
);

fs.writeFileSync(file, content);
console.log('Repository updated');
