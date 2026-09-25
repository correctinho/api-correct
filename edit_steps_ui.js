const fs = require('fs');

const file = '/home/jseren/syscorrect/frontend-correct/partner-first-register-form/src/components/PartnerRegistrationForm.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetContent = `
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={\`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors \${
                          currentStep > step.number
                            ? 'text-white'
                            : currentStep === step.number
                            ? 'text-white'
                            : 'bg-gray-200'
                        }\`}
                        style={{
                          backgroundColor:
                            currentStep >= step.number ? '#0511f2' : undefined,
                          color: currentStep >= step.number ? 'white' : '#00043e',
                        }}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span
                        className="text-xs mt-2 font-medium hidden sm:block"
                        style={{ color: '#00043e' }}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className="h-1 flex-1 mx-2 rounded transition-colors"
                        style={{
                          backgroundColor:
                            currentStep > step.number ? '#0511f2' : '#dbdbdb',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
`;

const replacementContent = `
              <div className="flex items-start justify-between mb-2">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center" style={{ width: '120px' }}>
                      <div
                        className={\`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors \${
                          currentStep > step.number
                            ? 'text-white'
                            : currentStep === step.number
                            ? 'text-white'
                            : 'bg-gray-200'
                        }\`}
                        style={{
                          backgroundColor:
                            currentStep >= step.number ? '#0511f2' : undefined,
                          color: currentStep >= step.number ? 'white' : '#00043e',
                        }}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span
                        className="text-xs mt-2 font-medium text-center hidden sm:block w-max"
                        style={{ color: '#00043e' }}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className="h-1 flex-1 mx-2 rounded transition-colors mt-5"
                        style={{
                          backgroundColor:
                            currentStep > step.number ? '#0511f2' : '#dbdbdb',
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
`;

content = content.replace(targetContent.trim(), replacementContent.trim());
fs.writeFileSync(file, content);
console.log('Fixed steps UI');
