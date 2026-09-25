import { Request, Response } from 'express';
import { ManualPaymentUsecase } from '../../application/usecases/manual-payment.usecase';

export class ManualPaymentController {
  constructor(private readonly usecase: ManualPaymentUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      if (!uuid) {
        return res.status(400).json({ error: 'UUID é obrigatório.' });
      }

      await this.usecase.execute(uuid);
      return res.status(200).send();
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message || 'Erro interno do servidor.' });
    }
  }
}
