import { Request, Response } from 'express';
import { IBusinessClubRepository } from '../../../repositories/business-club.repository';
import { GetPartnerDetailsUseCase } from './get-partner-details.usecase';

export class GetPartnerDetailsController {
  constructor(private readonly businessClubRepository: IBusinessClubRepository) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { user_info_uuid } = request.appUser;
      const { uuid } = request.params;

      if (!user_info_uuid) {
        return response.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const usecase = new GetPartnerDetailsUseCase(this.businessClubRepository);
      
      const result = await usecase.execute({
        business_info_uuid: uuid
      });

      return response.status(200).json(result);
    } catch (error: any) {
      return response.status(error.statusCode || 500).json({
        error: error.message || "An unexpected error occurred."
      });
    }
  }
}
