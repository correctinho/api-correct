import { IApproveBusinessRepository } from '../../domain/repositories/approve-business.repository.interface';
import { ApproveBusinessInputDto, ApproveBusinessOutputDto } from './dto/approve-business.dto';
import { IMailProvider } from '../../../../infra/providers/MailProvider/models/IMailProvider';
import { hash } from 'bcryptjs';

export class ApproveBusinessUsecase {
  constructor(
    private readonly approveBusinessRepository: IApproveBusinessRepository,
    private readonly mailProvider: IMailProvider
  ) { }

  async execute(input: ApproveBusinessInputDto): Promise<ApproveBusinessOutputDto> {
    const temporaryPassword = Math.random().toString(36).slice(-6).toUpperCase();
    const passwordHash = await hash(temporaryPassword, 8);

    const result = await this.approveBusinessRepository.approve({
      uuid: input.uuid,
      admin_email: input.admin_email,
      password_hash: passwordHash,
    });

    if (result.success) {
      // Garantimos que a senha vai para o frontend, independentemente de o e-mail funcionar ou não
      result.temporary_password = temporaryPassword;

      const businessType = String(result.business_type || '').toLowerCase();
      const isEmployer =
        businessType === 'empregador' ||
        businessType === 'empregador_comercio';

      const subject = isEmployer
        ? 'Bem-vindo à Correct - Acesso Empregador'
        : 'Conta Aprovada - Correct';

      const body = isEmployer
        ? `
            <p>Olá! Seja muito bem-vindo à rede <strong>Correct</strong>.</p>
            <p>Seu cadastro foi aprovado com sucesso! Agora você já pode realizar o seu primeiro acesso à plataforma.</p>
            <p>Para acessar, utilize os dados abaixo:</p>
            <p>URL de acesso: <a href="https://empregador.correct.com.br">https://empregador.correct.com.br</a></p>
            <p>Seu login é: <strong>${input.admin_email}</strong></p>
            <p>Sua senha temporária é: <strong>${temporaryPassword}</strong></p>
            <p>Acesse o painel para cadastrar sua senha definitiva e começar a utilizar nossos serviços.</p>
          `
        : `
            <p>Parabéns por fazer parte da rede <strong>Correct</strong>! O pagamento da sua taxa de adesão foi confirmado e seus dados foram aprovados.</p>
            <p>O próximo passo é acessar o seu painel para finalizar o cadastro.</p>
            <p>Para acessar, utilize os dados abaixo:</p>
            <p>URL de acesso: <a href="https://parceiros.correct.com.br">https://parceiros.correct.com.br</a></p>
            <p>Seu login é: <strong>${input.admin_email}</strong></p>
            <p>Sua senha temporária é: <strong>${temporaryPassword}</strong></p>
            <p>Acesse o painel, cadastre sua senha definitiva e comece a vender!</p>
          `;

      // Isolamos o envio de e-mail para não quebrar o fluxo principal
      try {
        await this.mailProvider.sendMail({
          to: input.admin_email,
          subject,
          body,
          from: {
            name: 'Correct',
            address: process.env.MAIL_ACCOUNT_NOREPLY_USER
          }
        });
      } catch (emailError: any) {
        // Apenas logamos a falha do serviço de mensageria, mas não interrompemos o caso de uso
        console.error('[ApproveBusinessUsecase] Erro não impeditivo ao enviar e-mail de aprovação:', emailError.message);
      }
    }

    return result;
  }
}