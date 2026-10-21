import { IBusinessClubRepository, ISearchBusinessClubDTO } from "../../../repositories/business-club.repository";

export class SearchBusinessClubUseCase {
  constructor(private readonly businessClubRepository: IBusinessClubRepository) {}

  async execute(data: ISearchBusinessClubDTO): Promise<any[]> {
    if (!data.user_info_uuid) {
      const error: any = new Error('UUID do usuário é obrigatório.');
      error.statusCode = 401;
      throw error;
    }

    // Garante que query é uma string (se não houver busca, passa vazio)
    data.query = data.query || '';

    // Remove lat/lon se vierem inválidos da request (ex: 'undefined' string ou nulo)
    if (data.lat !== undefined && isNaN(Number(data.lat))) {
      delete data.lat;
    }
    if (data.lon !== undefined && isNaN(Number(data.lon))) {
      delete data.lon;
    }

    return this.businessClubRepository.searchBusinessClub(data);
  }
}
