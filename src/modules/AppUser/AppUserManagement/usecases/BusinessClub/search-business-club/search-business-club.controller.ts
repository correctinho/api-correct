import { Request, Response } from 'express';
import { IBusinessClubRepository } from '../../../repositories/business-club.repository';
import { SearchBusinessClubUseCase } from './search-business-club.usecase';

export class SearchBusinessClubController {
  constructor(private readonly businessClubRepository: IBusinessClubRepository) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { user_info_uuid } = request.appUser;
      const { query, lat, lon, program_uuid, category } = request.query;

      if (!user_info_uuid) {
        return response.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const usecase = new SearchBusinessClubUseCase(this.businessClubRepository);
      
      const result = await usecase.execute({
        user_info_uuid,
        query: query ? String(query) : undefined,
        lat: lat ? Number(lat) : undefined,
        lon: lon ? Number(lon) : undefined,
        program_uuid: program_uuid ? String(program_uuid) : undefined,
        category: category ? String(category) : undefined
      });

      return response.status(200).json(result);
    } catch (error: any) {
      return response.status(error.statusCode || 500).json({
        error: error.message || "An unexpected error occurred."
      });
    }
  }
}
