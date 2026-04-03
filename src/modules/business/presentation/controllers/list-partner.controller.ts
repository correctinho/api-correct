import { Request, Response } from 'express';
import { IListPartnerRepository } from '../../domain/repositories/list-partner.repository.interface';
import { ListPartnerUsecase } from '../../application/usecases/list-partner.usecase';

export class ListPartnerController {
  constructor(private readonly listPartnerRepository: IListPartnerRepository) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { status, document, page, limit } = request.query;

      const usecase = new ListPartnerUsecase(this.listPartnerRepository);

      const result = await usecase.execute({
        status: status ? String(status) : undefined,
        document: document ? String(document) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return response.status(200).json(result);
    } catch (error: any) {
      return response.status(400).json({
        error: error.message || 'Unexpected error while listing partners.',
      });
    }
  }
}
