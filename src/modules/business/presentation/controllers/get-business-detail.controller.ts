import { Request, Response } from 'express';
import { IGetBusinessDetailRepository } from '../../domain/repositories/get-business-detail.repository.interface';
import { GetBusinessDetailUsecase } from '../../application/usecases/get-business-detail.usecase';

export class GetBusinessDetailController {
  constructor(private readonly getBusinessDetailRepository: IGetBusinessDetailRepository) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { uuid } = request.params;

      if (!uuid) {
        return response.status(400).json({ error: 'UUID é obrigatório.' });
      }

      const usecase = new GetBusinessDetailUsecase(this.getBusinessDetailRepository);

      const result = await usecase.execute({ uuid });
      return response.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Empresa não encontrada.') {
        return response.status(404).json({ error: error.message });
      }
      return response.status(400).json({
        error: error.message || 'Unexpected error while getting business detail.',
      });
    }
  }
}
