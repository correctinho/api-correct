import { Request, Response } from "express";
import { SetDefinitionsByBusinessAdminUsecase } from "./set-definitions-by-business-admin.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { ICompanyAddressRepository } from "../../../CompanyAddress/repositories/company-address.repository";

export class SetDefinitionsByBusinessAdminController {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private branchInfoRepository: IBranchRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private companyAddressRepository: ICompanyAddressRepository
  ){}

  async handle(req: Request, res: Response){
    try {
      const data = req.body
      data.business_info_uuid = req.companyUser.businessInfoUuid

      const usecase = new SetDefinitionsByBusinessAdminUsecase(
        this.businessInfoRepository,
        this.branchInfoRepository,
        this.partnerConfigRepository,
        this.companyAddressRepository
      )

      const result = await usecase.execute(data)

      return res.status(201).json(result)
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message
      })

    }
  }
}
