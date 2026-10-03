import { IBusinessClubRepository, IProgramDTO } from "../../../repositories/business-club.repository";

export class ListHomeProgramsUseCase {
  constructor(private readonly businessClubRepository: IBusinessClubRepository) {}

  async execute(user_info_uuid: string): Promise<IProgramDTO[]> {
    if (!user_info_uuid) {
      throw new Error('UUID do usuário é obrigatório.');
    }
    return this.businessClubRepository.listHomePrograms(user_info_uuid);
  }
}
