import { ApproveBusinessUsecase } from '../approve-business.usecase';
import { IApproveBusinessRepository } from '../../../domain/repositories/approve-business.repository.interface';
import { IMailProvider } from '../../../../../infra/providers/MailProvider/models/IMailProvider';

describe('ApproveBusinessUsecase Unit Tests', () => {
  let approveBusinessRepository: jest.Mocked<IApproveBusinessRepository>;
  let mailProvider: jest.Mocked<IMailProvider>;
  let usecase: ApproveBusinessUsecase;

  beforeEach(() => {
    approveBusinessRepository = {
      approve: jest.fn(),
    };
    mailProvider = {
      sendMail: jest.fn(),
    };
    usecase = new ApproveBusinessUsecase(approveBusinessRepository, mailProvider);
  });

  it('should send welcome email with empregador URL when business_type is empregador', async () => {
    approveBusinessRepository.approve.mockResolvedValue({
      success: true,
      message: 'Empresa aprovada',
      business_type: 'empregador',
    });

    const input = {
      uuid: 'business-uuid',
      admin_email: 'empregador@correct.com.br',
    };

    const result = await usecase.execute(input);

    expect(result.success).toBe(true);
    expect(mailProvider.sendMail).toHaveBeenCalledTimes(1);

    const mailArgs = mailProvider.sendMail.mock.calls[0][0];
    expect(mailArgs.to).toBe(input.admin_email);
    expect(mailArgs.subject).toBe('Bem-vindo à Correct - Acesso Empregador');
    expect(mailArgs.body).toContain('https://empregador.correct.com.br');
    expect(mailArgs.body).toContain('Seja muito bem-vindo à rede');
  });

  it('should send welcome email with empregador URL when business_type is empregado (typo handling)', async () => {
    approveBusinessRepository.approve.mockResolvedValue({
      success: true,
      message: 'Empresa aprovada',
      business_type: 'empregado',
    });

    const input = {
      uuid: 'business-uuid',
      admin_email: 'empregado@correct.com.br',
    };

    const result = await usecase.execute(input);

    expect(result.success).toBe(true);
    expect(mailProvider.sendMail).toHaveBeenCalledTimes(1);

    const mailArgs = mailProvider.sendMail.mock.calls[0][0];
    expect(mailArgs.subject).toBe('Bem-vindo à Correct - Acesso Empregador');
    expect(mailArgs.body).toContain('https://empregador.correct.com.br');
  });

  it('should send congratulations email with parceiros URL when business_type is comercio', async () => {
    approveBusinessRepository.approve.mockResolvedValue({
      success: true,
      message: 'Empresa aprovada',
      business_type: 'comercio',
    });

    const input = {
      uuid: 'business-uuid',
      admin_email: 'comercio@correct.com.br',
    };

    const result = await usecase.execute(input);

    expect(result.success).toBe(true);
    expect(mailProvider.sendMail).toHaveBeenCalledTimes(1);

    const mailArgs = mailProvider.sendMail.mock.calls[0][0];
    expect(mailArgs.to).toBe(input.admin_email);
    expect(mailArgs.subject).toBe('Conta Aprovada - Correct');
    expect(mailArgs.body).toContain('https://parceiros.correct.com.br');
    expect(mailArgs.body).toContain('Parabéns por fazer parte da rede');
  });
});
