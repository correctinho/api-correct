const fs = require('fs');

const file = '/home/jseren/syscorrect/frontend-correct/partner-first-register-form/src/schemas/partnerSchema.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace both occurrences of the end of the schema
content = content.replace(
  'use_employer_platform: z.boolean().optional(),\n});',
  'use_employer_platform: z.boolean().optional(),\n  selected_programs: z.array(z.string()).optional(),\n});'
);

content = content.replace(
  'use_employer_platform: z.boolean().optional(),\n});',
  'use_employer_platform: z.boolean().optional(),\n  selected_programs: z.array(z.string()).optional(),\n});'
);

fs.writeFileSync(file, content);
console.log('Schema updated');
