import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { geocodeAddress } from "../../../../../utils/geocoder";
import { BenefitsEntity } from "../../../../benefits/entities/benefit.entity";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { OutputGetBranchDTO } from "../../../../branch/usecases/get-branch-by-id/dto/get-branch.dto";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { PartnerCategory, PartnerConfigEntity } from "../../../PartnerConfig/entities/partner-config.entity";
import { BusinessRegisterEntity } from "../../entities/business-first-register.entity";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { InputBusinessFirstRegisterDTO, OutputBusinessFirstRegisterDTO } from "./dto/business-first-register.dto";
const { awsSendMessage } = require('../../../../../infra/aws/sqs/sender.config.js')

let branches: OutputGetBranchDTO[] = []
let items: BenefitsEntity[] = []
let response: OutputBusinessFirstRegisterDTO
export class CreateBusinessRegisterUsecase {
  constructor(
    private businessRegisterRepository: IBusinessFirstRegisterRepository,
    private companyDataRepository: ICompanyDataRepository,
    private branchRepository: IBranchRepository,
    private itemRepository: IBenefitsRepository

  ) { }

  async execute(data: InputBusinessFirstRegisterDTO) {
    const register = await BusinessRegisterEntity.create(data)
    const findBusiness = await this.companyDataRepository.findByDocument(register.document)
    if (findBusiness) throw new CustomError("Business already registered", 409)

    const findByEmail = await this.companyDataRepository.findByEmail(register.email)
    if (findByEmail) throw new CustomError("Business email already registered", 409)



    if (register.business_type === 'autonomo_comercio' || register.business_type === 'comercio') {
      //Set address geo code (latitude longitude)
      const geoCode = await geocodeAddress(data.line2, data.line1, data.postal_code)
      //const geoCode: any = 0
      //In this case, we need to set partnerConfig, which involves taxes
      const partneConfigData = {
        business_info_uuid: new Uuid(register.business_info_uuid),
        main_branch: new Uuid(data.partnerConfig.main_branch),
        partner_category: data.partnerConfig.partner_category as PartnerCategory[],
        items_uuid: ["123"],
        admin_tax: 0,
        marketing_tax: 0,
        use_marketing: data.partnerConfig.use_marketing,
        market_place_tax: 0,
        use_market_place: data.partnerConfig.use_market_place,
        latitude: geoCode.lat ? geoCode.lat : null,
        longitude: geoCode.long ? geoCode.long : null,
        title: data.partnerConfig.title ? data.partnerConfig.title : null
      }
      const partnerConfigEntity = PartnerConfigEntity.create(partneConfigData)
      //now we need to set taxes accordding to main branch selected
      //check if main branch is one of the branches list.

      const mainBranch = register.branches_uuid.find(branch => branch === data.partnerConfig.main_branch)
      if (!mainBranch) throw new CustomError("Invalid main branch", 400)
      //find branches
      await this.verifyBranches(register.branches_uuid)

      //if it's all okay with branches uuid, we need to have main branch details
      //this main branch details is included in branches array
      //In this case, we need to check which one is the main branch
      const mainBranchDetails = branches.find(branch => branch.uuid === data.partnerConfig.main_branch)

      //now that we have main branch details, we will get all defined taxes according to main branch
      //these taxes will be defined according to user preferences
      if (partnerConfigEntity.use_marketing) partnerConfigEntity.changeMarketingTax(mainBranchDetails.marketing_tax)
      if (partnerConfigEntity.use_market_place) partnerConfigEntity.changeMarketingPlaceTax(mainBranchDetails.market_place_tax)

      //in this line, we will set admin tax, it doesn't required any condition
      partnerConfigEntity.changeAdminTax(mainBranchDetails.admin_tax)

      //now it's important to define which benefits will be accepted by partner. It's defined according to main branch
      //Basically, we need to populate partnerConfigEntity.items_uuid with the benefits that comes from mainBranch detals
      partnerConfigEntity.changeItemsUuid(mainBranchDetails.benefits_uuid)

      response = await this.businessRegisterRepository.savePartner(register, partnerConfigEntity, data.correct_user_uuid)
    } else if (register.business_type === 'empregador') {
      await this.verifyItems(register.items_uuid)
      response = await this.businessRegisterRepository.saveEmployer(register, data.correct_user_uuid)

    }

    // Preparar dados para enviar para a fila SQS
    const messageData = {
      business_email: register.email,
      document: register.document,
      fantasy_name: register.fantasy_name,
      corporate_reason: register.corporate_reason
    };

    // Enviar mensagem para SQS
    //awsSendMessage(messageData);

    return response
  }

  private async verifyBranches(branches_uuid: string[]) {
    for (const branch of branches_uuid) {
      const findBranch = await this.branchRepository.getByID(branch)

      if (!findBranch) throw new CustomError("Branch not found", 404);
      branches.push(findBranch)

    }
  }
  private async verifyItems(items_uuid: string[]) {

    items_uuid.map(async (item) => {
      const findItem = await this.itemRepository.find(new Uuid(item))
      if (!findItem) throw new CustomError("Item not found", 404);
      items.push(findItem)

    })
  }
}
