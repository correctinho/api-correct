import { SalesType } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { PartnerCategory, PartnerConfigEntity } from "../../entities/partner-config.entity";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { InputSetDefinitionsByBusinessAdmin, OutputCreatePartnerConfig } from "./dto/set-definitions-by-business-admin.dto";

export class SetDefinitionsByBusinessAdminUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private branchInfoRepository: IBranchRepository,
    private partnerConfigRepository: IPartnerConfigRepository
  ) { }

  async execute(data: InputSetDefinitionsByBusinessAdmin): Promise<any> {
    //This usecase is responsible for updating partner config by partner admin
    if (!data.business_info_uuid) throw new CustomError("Business Info uuid is required", 400)

    if(!data.description && !data.phone && !data.sales_type && !data.title) {
      //if it happens, it means that api was called without sending any info to be updated
      throw new CustomError("At least one field is required", 400)
    }
    //first we need to find partnerConfig with business info uuid
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(data.business_info_uuid)
    if (!partnerConfig) throw new CustomError("Partner Config not found", 404)

    //now lets call the entity class
    const entity = new PartnerConfigEntity(partnerConfig)

    //with the values that came from the client, we will set on the entity
    entity.changeTitle(data.title ? data.title : entity.title)
    entity.changePhone(data.phone ? data.phone : entity.phone)
    entity.changeDescription(data.description ? data.description : entity.description)
    entity.changeSalesType(data.sales_type ? data.sales_type as SalesType: entity.sales_type)

    //now we need to update
    await this.partnerConfigRepository.update(entity)

    return {
      uuid: entity.uuid.uuid,
      business_info_uuid: entity.uuid.uuid,
      title: entity.title,
      phone: entity.phone,
      description: entity.description,
      sales_type: entity.sales_type,
      updated_at: entity.updated_at
    }
  }
}
