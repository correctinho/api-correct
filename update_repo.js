const fs = require('fs');
const path = '/home/jseren/syscorrect/api-correct/src/modules/AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository.ts';

let content = fs.readFileSync(path, 'utf8');

const targetContent = `                        UserItem: {
                            where: {
                                status: 'active'
                            },
                            select: {
                                uuid: true,
                                item_uuid: true,   // Importante para saber de qual benefício é
                                group_uuid: true   // Importante para saber o grupo atual
                            }
                        }`;

const replacementContent = `                        UserItem: {
                            where: {
                                status: { in: ['active', 'inactive', 'blocked', 'to_be_cancelled'] }
                            },
                            select: {
                                uuid: true,
                                item_uuid: true,   // Importante para saber de qual benefício é
                                group_uuid: true   // Importante para saber o grupo atual
                            }
                        }`;

content = content.replace(targetContent, replacementContent);
fs.writeFileSync(path, content, 'utf8');
console.log('File updated successfully.');
