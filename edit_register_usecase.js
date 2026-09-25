const fs = require('fs');

// UPDATE DTO
const dtoFile = '/home/jseren/syscorrect/api-correct/src/modules/Company/BusinessFirstRegister/usecases/business-first-register/dto/business-first-register.dto.ts';
let dtoContent = fs.readFileSync(dtoFile, 'utf8');
dtoContent = dtoContent.replace(
  'use_employer_platform?: boolean,',
  'use_employer_platform?: boolean,\n    selected_programs?: string[],'
);
fs.writeFileSync(dtoFile, dtoContent);
console.log('DTO updated');

// UPDATE USECASE
const usecaseFile = '/home/jseren/syscorrect/api-correct/src/modules/Company/BusinessFirstRegister/usecases/business-first-register/business-first-register.usecase.ts';
let usecaseContent = fs.readFileSync(usecaseFile, 'utf8');

const newItemsLogic = `
      // Pegar os itens do main branch que NÃO são programas nem produtos (itens estruturais)
      const structuralItems = mainBranchDetails.items
        ? mainBranchDetails.items.filter(item => item.item_type !== 'programa' && item.item_type !== 'produto').map(item => item.uuid)
        : [];
      
      // Juntar com os programas selecionados pelo parceiro
      const selectedPrograms = data.partnerConfig.selected_programs || [];
      const finalItems = Array.from(new Set([...structuralItems, ...selectedPrograms]));

      partnerConfigEntity.changeItemsUuid(finalItems.length > 0 ? finalItems : []);
`;

usecaseContent = usecaseContent.replace(
  'partnerConfigEntity.changeItemsUuid(mainBranchDetails.benefits_uuid);',
  newItemsLogic
);

fs.writeFileSync(usecaseFile, usecaseContent);
console.log('Usecase updated');
