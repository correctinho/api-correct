import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { geocodeAddress } from "../../../../../utils/geocoder";
import { BenefitsEntity } from "../../../../benefits/entities/benefit.entity";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { BranchEntity } from "../../../../branch/entities/branch.entity";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { PartnerCategory, PartnerConfigEntity } from "../../../PartnerConfig/entities/partner-config.entity";
import { BusinessRegisterEntity } from "../../entities/business-first-register.entity";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { InputBusinessFirstRegisterDTO, OutputBusinessFirstRegisterDTO } from "./dto/business-first-register.dto";
const { awsSendMessage } = require('../../../../../infra/aws/sqs/sender.config.js')

export class CreateBusinessRegisterUsecase {
  constructor(
    private businessRegisterRepository: IBusinessFirstRegisterRepository,
    private companyDataRepository: ICompanyDataRepository,
    private branchRepository: IBranchRepository,
    private itemRepository: IBenefitsRepository
  ) { }

  async execute(data: InputBusinessFirstRegisterDTO): Promise<OutputBusinessFirstRegisterDTO> {
    const register = await BusinessRegisterEntity.create(data);
    const findBusiness = await this.companyDataRepository.findByDocument(register.document);
    if (findBusiness) throw new CustomError("Business already registered", 409);
    const findByEmail = await this.companyDataRepository.findByEmail(register.email);
    if (findByEmail) throw new CustomError("Business email already registered", 409);

    if (register.business_type === 'autonomo_comercio' || register.business_type === 'comercio') {
      const partneConfigData = {
        business_info_uuid: new Uuid(register.business_info_uuid),
        main_branch: new Uuid(data.partnerConfig.main_branch),
        partner_category: data.partnerConfig.partner_category as PartnerCategory[],
        items_uuid: ["placeholder-uuid-temporario"],
        admin_tax: 0, marketing_tax: 0, use_marketing: data.partnerConfig.use_marketing,
        market_place_tax: 0, use_market_place: data.partnerConfig.use_market_place,
        //latitude: null, longitude: null,
        title: data.partnerConfig.title ? data.partnerConfig.title : null
      };
      const partnerConfigEntity = PartnerConfigEntity.create(partneConfigData);

      const mainBranchCheck = register.branches_uuid.find(branch => branch === data.partnerConfig.main_branch);
      if (!mainBranchCheck) throw new CustomError("Invalid main branch", 400);

      const branches = await this.verifyBranches(register.branches_uuid);
      const mainBranchDetails = branches.find(branch => branch.uuid === data.partnerConfig.main_branch);

      const mainBranchRawData = mainBranchDetails.toJSON();

      if (partnerConfigEntity.use_marketing) {
        partnerConfigEntity.changeMarketingTax(mainBranchRawData.marketing_tax);
      }
      if (partnerConfigEntity.use_market_place) {
        partnerConfigEntity.changeMarketingPlaceTax(mainBranchRawData.market_place_tax);
      }
      partnerConfigEntity.changeAdminTax(mainBranchRawData.admin_tax);

      partnerConfigEntity.changeItemsUuid(mainBranchDetails.benefits_uuid);

      const response = await this.businessRegisterRepository.savePartner(register, partnerConfigEntity, data.correct_user_uuid);
      return response;

    } else if (register.business_type === 'empregador') {
      const items = await this.verifyItems(register.items_uuid);
      const response = await this.businessRegisterRepository.saveEmployer(register, data.correct_user_uuid);
      return response;
    }
    throw new CustomError("Tipo de negócio inválido ou não especificado.", 400);
  }

  private async verifyBranches(branches_uuid: string[]): Promise<BranchEntity[]> {
    const verifiedBranches: BranchEntity[] = [];
    for (const branch_uuid of branches_uuid) {
      const findBranch = await this.branchRepository.getByID(branch_uuid);
      if (!findBranch) throw new CustomError(`Branch with id ${branch_uuid} not found`, 404);
      verifiedBranches.push(findBranch);
    }
    return verifiedBranches;
  }

  private async verifyItems(items_uuid: string[]): Promise<BenefitsEntity[]> {
    const verifiedItems: BenefitsEntity[] = [];
    for (const item_uuid of items_uuid) {
      const findItem = await this.itemRepository.find(new Uuid(item_uuid));
      if (!findItem) throw new CustomError(`Item with id ${item_uuid} not found`, 404);
      verifiedItems.push(findItem);
    }
    return verifiedItems;
  }
}