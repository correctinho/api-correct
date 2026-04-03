import { IResendAccessRepository } from '../../domain/repositories/resend-access.repository.interface';
import { ResendAccessInputDto, ResendAccessOutputDto } from './dto/resend-access.dto';
import { IMailProvider } from '../../../../infra/providers/MailProvider/models/IMailProvider';
import { hash } from 'bcryptjs';

export class ResendAccessUsecase {
  constructor(
    private readonly resendAccessRepository: IResendAccessRepository,
    private readonly mailProvider: IMailProvider
  ) { }

  async execute(input: ResendAccessInputDto): Promise<ResendAccessOutputDto> {
    const temporaryPassword = Math.random().toString(36).slice(-6).toUpperCase();
    const passwordHash = await hash(temporaryPassword, 8);

    const repositoryResult = await this.resendAccessRepository.resendAccess({
      uuid: input.uuid,
      new_password_hash: passwordHash,
    });

    try {
      await this.mailProvider.sendMail({
        to: repositoryResult.admin_email,
        subject: 'Novo Acesso Gerado - Correct',
        body: `
          <p>Um novo acesso foi gerado para sua conta na Correct.</p>
          <p>Seu login é: <strong>${repositoryResult.admin_email}</strong></p>
          <p>Sua nova senha temporária é: <strong>${temporaryPassword}</strong></p>
          <p>Acesse o painel para cadastrar sua senha definitiva.</p>
        `,
        from: {
          name: 'Correct - Não Responda',
          address: process.env.MAIL_ACCOUNT_NOREPLY_USER || 'noreply@correct.com.br'
        }
      });
    } catch (emailError: any) {
      console.error('[ResendAccessUsecase] Erro não impeditivo ao enviar e-mail de reenvio de acesso:', emailError.message);
    }

    return {
      success: repositoryResult.success,
      message: repositoryResult.message,
      temporary_password: temporaryPassword,
      admin_email: repositoryResult.admin_email,
    };
  }
}
