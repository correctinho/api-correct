import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { BusinessAccountEntity } from "../../entities/business-account.entity";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { PartnerCategory, PartnerConfigEntity } from "../../entities/partner-config.entity";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { InputCreatePartnerConfig, OutputCreatePartnerConfig } from "./dto/approve-partner.dto";

export class CreatePartnerConfigUsecase{
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private branchInfoRepository: IBranchRepository,
    private partnerConfigRepository: IPartnerConfigRepository
  ){}

  async execute(data: InputCreatePartnerConfig): Promise<any>{

    const dataEntity = {
      business_info_uuid: new Uuid(data.business_info_uuid),
      main_branch: new Uuid(data.main_branch_uuid),
      partner_category: data.partner_category  as PartnerCategory[],
      items_uuid: [""],
      admin_tax: 0,
      marketing_tax: 0,
      use_marketing: false,
      market_place_tax: 0,
      use_market_place: data.use_market_place
    }
    const entity = PartnerConfigEntity.create(dataEntity)

    //get main branch info
    const branchDetails = await this.branchInfoRepository.getByID(data.main_branch_uuid)
    if(!branchDetails) throw new CustomError("Branch not found", 404)

    let items_accepted: string[] = []
    for(const item of branchDetails.benefits_uuid){
      items_accepted.push(item)
    }

    entity.changeItemsUuid(items_accepted)
    entity.changeAdminTax(branchDetails.admin_tax)
    entity.changeMarketingPlaceTax(branchDetails.market_place_tax)
    entity.changeMarketingTax(branchDetails.marketing_tax)

    //check if business exists
    const findBusiness = await this.businessInfoRepository.findById(data.business_info_uuid)
    if(!findBusiness) throw new CustomError("Business not found", 404)

    //check if business type is valid
    if(findBusiness.business_type === "empregador") throw new CustomError("Invalid Business type", 400)

    //check if business status is valid
    if(findBusiness.status !== 'active') throw new CustomError("Business must be active", 400)

    //create business account
    const businessAccountProps = {
      balance: 0,
      business_info_uuid: findBusiness.uuid,
      status: 'active',

    }
    const businessAccountEntity = new BusinessAccountEntity(businessAccountProps)

    const register = await this.partnerConfigRepository.createPartnerConfig(entity, businessAccountEntity)

    return {
      uuid: register.uuid.uuid,
      business_info_uuid: register.uuid.uuid,
      main_branch: register.main_branch.uuid,
      partner_category: register.partner_category,
      items_uuid: register.items_uuid,
      admin_tax: register.admin_tax,
      marketing_tax: register.marketing_tax,
      market_place_tax: register.market_place_tax,
      //use_market_place: register.use_maket_place,
      created_at: register.created_at
    }
  }
}
