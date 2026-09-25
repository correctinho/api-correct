const fs = require('fs');
const file = '/home/jseren/syscorrect/frontend-correct/partner-first-register-form/src/components/PartnerRegistrationForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add states for the modal
content = content.replace(
  'const [loadingBranches, setLoadingBranches] = useState(true);',
  'const [loadingBranches, setLoadingBranches] = useState(true);\n  const [programModalOpen, setProgramModalOpen] = useState(false);\n  const [selectedProgramForModal, setSelectedProgramForModal] = useState<{name: string, description: string} | null>(null);'
);

// Add availablePrograms memo
content = content.replace(
  'const selectedBranches = branches.filter((b) =>\\n    watch(\'branches_uuid\')?.includes(b.uuid)\\n  );',
  'const watchedBranches = watch(\'branches_uuid\') || [];\n  const selectedBranches = branches.filter((b) =>\n    watchedBranches.includes(b.uuid)\n  );\n\n  const availablePrograms = React.useMemo(() => {\n    const programsMap = new Map();\n    branches.forEach(branch => {\n      if (watchedBranches.includes(branch.uuid) && branch.items) {\n        branch.items.forEach(item => {\n          if (item.item_type === \'programa\') {\n            programsMap.set(item.uuid, item);\n          }\n        });\n      }\n    });\n    return Array.from(programsMap.values());\n  }, [branches, watchedBranches]);'
);

// Add the rendering of programs
const programsUI = `
                    {availablePrograms.length > 0 && (
                      <div className="border-t pt-6" style={{ borderColor: '#dbdbdb' }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#00043e' }}>
                          Programas Disponíveis
                        </h3>
                        <p className="text-sm mb-4" style={{ color: '#00043e' }}>
                          Selecione os programas que deseja participar:
                        </p>
                        <div className="space-y-4">
                          {availablePrograms.map(program => (
                            <label key={program.uuid} className="flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50" style={{ borderColor: '#dbdbdb' }}>
                              <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={program.uuid}
                                  {...register('selected_programs')}
                                  className="sr-only peer"
                                />
                                <div
                                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                                  style={{
                                    backgroundColor: watch('selected_programs')?.includes(program.uuid) ? '#0511f2' : '#dbdbdb',
                                    borderColor: '#dbdbdb',
                                  }}
                                ></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold" style={{ color: '#00043e' }}>
                                    {program.name}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedProgramForModal(program);
                                  setProgramModalOpen(true);
                                }}
                                className="text-sm font-semibold hover:underline"
                                style={{ color: '#0511f2' }}
                              >
                                Saiba mais
                              </button>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
`;

content = content.replace(
  '<div className="border-t pt-6" style={{ borderColor: \'#dbdbdb\' }}>\n                      <h3 className="text-lg font-semibold mb-4" style={{ color: \'#00043e\' }}>\n                        Produtos da Correct\n                      </h3>',
  programsUI + '\n\n                    <div className="border-t pt-6" style={{ borderColor: \'#dbdbdb\' }}>\n                      <h3 className="text-lg font-semibold mb-4" style={{ color: \'#00043e\' }}>\n                        Produtos da Correct\n                      </h3>'
);

// Add the modal at the end before final closing div
const modalUI = `
      {/* Program Details Modal */}
      {programModalOpen && selectedProgramForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#dbdbdb' }}>
              <h2 className="text-xl font-bold" style={{ color: '#00043e' }}>
                {selectedProgramForModal.name}
              </h2>
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedProgramForModal.description || 'Nenhuma descrição disponível para este programa.'}
              </p>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end" style={{ borderColor: '#dbdbdb' }}>
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="px-6 py-2 bg-white border rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition"
                style={{ borderColor: '#dbdbdb', color: '#00043e' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  '</div>\n    </div>\n  );\n}\n',
  modalUI + '</div>\n    </div>\n  );\n}\n'
);

// Also import React and X
if (!content.includes('import React')) {
  content = content.replace('import { useState', 'import React, { useState');
}
if (!content.includes('X,')) {
  content = content.replace('ArrowRight,', 'ArrowRight,\n  X,');
}

fs.writeFileSync(file, content);
console.log('Form updated');
