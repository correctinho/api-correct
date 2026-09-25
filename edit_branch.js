const fs = require('fs');
const file = '/home/jseren/syscorrect/api-correct/src/modules/branch/entities/branch.entity.ts';
let content = fs.readFileSync(file, 'utf8');

// Replacements
content = content.replace(
  'benefits_name?: string[]',
  'benefits_name?: string[];\n  items?: { uuid: string; name: string; description: string; item_type: string }[];'
);

content = content.replace(
  'benefits_name?: string[]',
  'benefits_name?: string[];\n  items?: { uuid: string; name: string; description: string; item_type: string }[];'
);

content = content.replace(
  'private _benefits_name: string[]',
  'private _benefits_name: string[];\n  private _items: { uuid: string; name: string; description: string; item_type: string }[];'
);

content = content.replace(
  'this._benefits_name = props.benefits_name || [];',
  'this._benefits_name = props.benefits_name || [];\n    this._items = props.items || [];'
);

content = content.replace(
  'get benefits_name(): string[] {\n    return this._benefits_name\n  }',
  'get benefits_name(): string[] {\n    return this._benefits_name\n  }\n\n  get items(): { uuid: string; name: string; description: string; item_type: string }[] {\n    return this._items;\n  }'
);

content = content.replace(
  'benefits_name: this.benefits_name,\n      marketing_tax',
  'benefits_name: this.benefits_name,\n      items: this.items,\n      marketing_tax'
);

fs.writeFileSync(file, content);
console.log('File updated');
