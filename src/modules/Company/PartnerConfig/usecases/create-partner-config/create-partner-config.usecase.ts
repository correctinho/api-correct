import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
// Importamos a entidade e o comando de criação
import { BusinessAccountEntity, BusinessAccountCreateCommand } from "../../../../Payments/Accounts/entities/business-account.entity";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { PartnerCategory, PartnerConfigEntity } from "../../entities/partner-config.entity";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { InputCreatePartnerConfig, OutputCreatePartnerConfig } from "./dto/approve-partner.dto";

export class CreatePartnerConfigUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private branchInfoRepository: IBranchRepository,
    private partnerConfigRepository: IPartnerConfigRepository
  ) { }

  async execute(data: InputCreatePartnerConfig): Promise<any> {

    const dataEntity = {
      business_info_uuid: new Uuid(data.business_info_uuid),
      main_branch: new Uuid(data.main_branch_uuid),
      partner_category: data.partner_category as PartnerCategory[],
      items_uuid: [""], // Lembre-se do nosso workaround temporário aqui
      admin_tax: 0,
      marketing_tax: 0,
      use_marketing: false,
      market_place_tax: 0,
      use_market_place: data.use_market_place
    };
    const entity = PartnerConfigEntity.create(dataEntity);

    const branchDetails = await this.branchInfoRepository.getByID(data.main_branch_uuid);
    if (!branchDetails) throw new CustomError("Branch not found", 404);

    // Usando .toJSON() para pegar os dados brutos e escalados
    const branchRawData = branchDetails.toJSON();
    entity.changeItemsUuid(branchDetails.benefits_uuid);
    entity.changeAdminTax(branchRawData.admin_tax);
    entity.changeMarketingPlaceTax(branchRawData.market_place_tax);
    entity.changeMarketingTax(branchRawData.marketing_tax);

    const findBusiness = await this.businessInfoRepository.findById(data.business_info_uuid);
    if (!findBusiness) throw new CustomError("Business not found", 404);

    if (findBusiness.business_type === "empregador") throw new CustomError("Invalid Business type", 400);
    if (findBusiness.status !== 'active') throw new CustomError("Business must be active", 400);

    // ====================================================================
    // <<< CORREÇÃO AQUI >>>
    // ====================================================================
    // 1. Criamos o "comando" que o método create espera, usando 'balanceInReais'.
    const businessAccountCommand: BusinessAccountCreateCommand = {
      balanceInReais: 0,
      business_info_uuid: new Uuid(findBusiness.uuid),
      status: 'active',
    };
    // 2. Usamos o método estático 'create' em vez de 'new'.
    const businessAccountEntity = BusinessAccountEntity.create(businessAccountCommand);
    // ====================================================================

    const register = await this.partnerConfigRepository.createPartnerConfig(entity, businessAccountEntity);

    return {
      uuid: register.uuid.uuid,
      business_info_uuid: register.business_info_uuid.uuid, // Corrigido para pegar o UUID correto
      main_branch: register.main_branch.uuid,
      partner_category: register.partner_category,
      items_uuid: register.items_uuid,
      admin_tax: register.admin_tax,
      marketing_tax: register.marketing_tax,
      market_place_tax: register.market_place_tax,
      use_market_place: register.use_market_place,
      created_at: register.created_at
    };
  }
}