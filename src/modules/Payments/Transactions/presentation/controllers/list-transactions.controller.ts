import { Request, Response } from 'express';
import { ListTransactionsUsecase } from '../../application/usecases/list-transactions.usecase';
import { CustomError } from '../../../../../errors/custom.error';

export class ListTransactionsController {
  constructor(private readonly listTransactionsUsecase: ListTransactionsUsecase) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { page, limit, status, start_date, end_date, search } = request.query;

      const result = await this.listTransactionsUsecase.execute({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status ? String(status) : undefined,
        start_date: start_date ? String(start_date) : undefined,
        end_date: end_date ? String(end_date) : undefined,
        search: search ? String(search) : undefined,
      });
      return response.status(200).json(result);
    } catch (error: any) {
      if (error instanceof CustomError) {
        return response.status(error.statusCode ?? 400).json({ error: error.message });
      }

      return response.status(500).json({
        error: error.message || 'Unexpected error while listing transactions.',
      });
    }
  }
}
