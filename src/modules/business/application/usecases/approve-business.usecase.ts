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

      // Isolamos o envio de e-mail para não quebrar o fluxo principal
      try {
        await this.mailProvider.sendMail({
          to: input.admin_email,
          subject: 'Conta Aprovada - Correct',
          body: `
            <p>Sua conta na Correct foi aprovada.</p>
            <p>Seu login é: <strong>${input.admin_email}</strong></p>
            <p>Sua senha temporária é: <strong>${temporaryPassword}</strong></p>
            <p>Acesse o painel para cadastrar sua senha definitiva.</p>
          `,
          from: {
            name: 'Correct',
            address: process.env.MAIL_ACCOUNT_NOREPLY_USER || 'noreply@correct.com.br'
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