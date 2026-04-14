import { Request, Response } from 'express';
import { IGetEmployerDetailsRepository } from '../../domain/repositories/get-employer-details.repository.interface';
import { GetEmployerDetailsUsecase } from '../../application/usecases/get-employer-details.usecase';
import { CustomError } from '../../../../errors/custom.error';

export class GetEmployerDetailsController {
  constructor(private readonly getEmployerDetailsRepository: IGetEmployerDetailsRepository) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      const usecase = new GetEmployerDetailsUsecase(this.getEmployerDetailsRepository);
      const result = await usecase.execute(id);

      return response.status(200).json(result);
    } catch (error: any) {
      if (error instanceof CustomError) {
        return response.status(error.statusCode ?? 400).json({ error: error.message });
      }

      return response.status(500).json({
        error: error.message || 'Unexpected error while getting employer details.',
      });
    }
  }
}
