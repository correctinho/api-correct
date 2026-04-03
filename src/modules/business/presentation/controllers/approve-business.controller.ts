import { Request, Response } from 'express';
import { IApproveBusinessRepository } from '../../domain/repositories/approve-business.repository.interface';
import { ApproveBusinessUsecase } from '../../application/usecases/approve-business.usecase';
import { IMailProvider } from '../../../../infra/providers/MailProvider/models/IMailProvider';

export class ApproveBusinessController {
  constructor(
    private readonly approveBusinessRepository: IApproveBusinessRepository,
    private readonly mailProvider: IMailProvider
  ) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { uuid } = request.params;
      const { admin_email } = request.body;

      if (!uuid) {
        return response.status(400).json({ error: 'UUID é obrigatório.' });
      }

      if (!admin_email) {
        return response.status(400).json({ error: 'E-mail do administrador (admin_email) é obrigatório no corpo da requisição.' });
      }

      const usecase = new ApproveBusinessUsecase(this.approveBusinessRepository, this.mailProvider);

      const result = await usecase.execute({ uuid, admin_email });

      return response.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Empresa não encontrada.') {
        return response.status(404).json({ error: error.message });
      }
      return response.status(400).json({
        error: error.message || 'Unexpected error while approving business.',
      });
    }
  }
}
