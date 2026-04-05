import { Request, Response } from 'express';
import { IListEmployerRepository } from '../../domain/repositories/list-employer.repository.interface';
import { ListEmployerUsecase } from '../../application/usecases/list-employer.usecase';
import { CustomError } from '../../../../errors/custom.error';

export class ListEmployerController {
  constructor(private readonly listEmployerRepository: IListEmployerRepository) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { status, search, page, limit } = request.query;

      const usecase = new ListEmployerUsecase(this.listEmployerRepository);

      const result = await usecase.execute({
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return response.status(200).json(result);
    } catch (error: any) {
      if (error instanceof CustomError) {
        return response.status(error.statusCode ?? 400).json({ error: error.message });
      }

      return response.status(500).json({
        error: error.message || 'Unexpected error while listing employers.',
      });
    }
  }
}
