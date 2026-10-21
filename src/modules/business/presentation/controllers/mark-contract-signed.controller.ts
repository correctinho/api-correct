import { Request, Response } from 'express';
import { MarkContractSignedUsecase } from '../../application/usecases/mark-contract-signed.usecase';

export class MarkContractSignedController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      console.log('--- CONTROLLER ENTERED ---', request.params.uuid);
      const { uuid } = request.params;
      if (!uuid) {
        return response.status(400).json({ error: 'UUID é obrigatório.' });
      }

      const usecase = new MarkContractSignedUsecase();
      const result = await usecase.execute(uuid);

      return response.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        return response.status(error.statusCode).json({ error: error.message });
      }
      return response.status(400).json({
        error: error.message || 'Unexpected error while marking contract as signed.',
      });
    }
  }
}
