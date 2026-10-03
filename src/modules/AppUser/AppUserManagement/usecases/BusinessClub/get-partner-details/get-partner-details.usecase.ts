import { IBusinessClubRepository, IPartnerDetailsDTO } from '../../../repositories/business-club.repository';

interface IGetPartnerDetailsDTO {
  business_info_uuid: string;
}

export class GetPartnerDetailsUseCase {
  constructor(private readonly businessClubRepository: IBusinessClubRepository) { }

  async execute({ business_info_uuid }: IGetPartnerDetailsDTO): Promise<IPartnerDetailsDTO> {
    if (!business_info_uuid) {
      throw new Error('O UUID do parceiro é obrigatório.');
    }

    const partner = await this.businessClubRepository.getPartnerDetails(business_info_uuid);

    if (!partner) {
      throw { statusCode: 404, message: 'Parceiro não encontrado ou inativo.' };
    }

    return partner;
  }
}
