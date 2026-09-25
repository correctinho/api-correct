const fs = require('fs');

const testFile = '/home/jseren/syscorrect/api-correct/src/tests/e2e/BusinessRegister/Partner/business-first-register.e2e-spec.ts';
let testContent = fs.readFileSync(testFile, 'utf8');

testContent = testContent.replace(
  'use_employer_platform: false',
  'use_employer_platform: false,\n                selected_programs: [itemId]'
);

fs.writeFileSync(testFile, testContent);
console.log('E2E test updated');
