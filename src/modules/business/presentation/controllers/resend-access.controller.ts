import { Request, Response } from 'express';
import { IResendAccessRepository } from '../../domain/repositories/resend-access.repository.interface';
import { ResendAccessUsecase } from '../../application/usecases/resend-access.usecase';
import { IMailProvider } from '../../../../infra/providers/MailProvider/models/IMailProvider';

export class ResendAccessController {
  constructor(
    private readonly resendAccessRepository: IResendAccessRepository,
    private readonly mailProvider: IMailProvider
  ) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { uuid } = request.params;

      if (!uuid) {
        return response.status(400).json({ error: 'UUID é obrigatório.' });
      }

      const usecase = new ResendAccessUsecase(this.resendAccessRepository, this.mailProvider);

      const result = await usecase.execute({ uuid });

      return response.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Usuário administrador não encontrado para esta empresa.') {
        return response.status(404).json({ error: error.message });
      }
      return response.status(400).json({
        error: error.message || 'Unexpected error while resending access.',
      });
    }
  }
}
