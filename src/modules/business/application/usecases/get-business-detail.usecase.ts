import { IGetBusinessDetailRepository } from '../../domain/repositories/get-business-detail.repository.interface';
import { GetBusinessDetailInputDto, GetBusinessDetailOutputDto } from './dto/get-business-detail.dto';

export class GetBusinessDetailUsecase {
  constructor(
    private readonly getBusinessDetailRepository: IGetBusinessDetailRepository
  ) {}

  async execute(input: GetBusinessDetailInputDto): Promise<GetBusinessDetailOutputDto> {
    const business = await this.getBusinessDetailRepository.findById(input);

    if (!business) {
      throw new Error('Empresa não encontrada.');
    }

    // Formatar taxas do PartnerConfig e buscar nomes dos benefícios
    if (business.PartnerConfig && Array.isArray(business.PartnerConfig) && business.PartnerConfig.length > 0) {
      const config = business.PartnerConfig[0];

      // Divide taxas por 10000, caso existam
      if (typeof config.admin_tax === 'number') {
        config.admin_tax = config.admin_tax / 10000;
      }
      if (typeof config.marketing_tax === 'number') {
        config.marketing_tax = config.marketing_tax / 10000;
      }
      if (typeof config.market_place_tax === 'number') {
        config.market_place_tax = config.market_place_tax / 10000;
      }
      if (typeof config.cashback_tax === 'number') {
        config.cashback_tax = config.cashback_tax / 10000;
      }

      // Buscar nomes dos benefícios vinculados ao items_uuid
      if (config.items_uuid && Array.isArray(config.items_uuid) && config.items_uuid.length > 0) {
        const itemNames = await this.getBusinessDetailRepository.findItemsNamesByUuids(config.items_uuid);
        config.accepted_benefits_names = itemNames;
      } else {
        config.accepted_benefits_names = [];
      }
    }

    return business;
  }
}
