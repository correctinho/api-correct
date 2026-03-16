import { Request, Response } from "express";
import { GetAvailableMembersUsecase } from "./get-available-members.usecase";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";

export class GetAvailableMembersController {
  constructor(
          private appUserInfoRepository: IAppUserInfoRepository,
          private benefitGroupsRepository: IBenefitGroupsRepository,
          private businessItemDetailsRepository: IBusinessItemDetailsRepository
      ) {}
  
  async handle(request: Request, response: Response) {
    try {
      // 1. O ID da empresa vem do Middleware de Autenticação (CompanyIsAuth)
      // Certifique-se que o middleware está populando request.companyUser
      const business_info_uuid = request.companyUser.businessInfoUuid;
      const employer_item_details_uuid = request.query.employer_item_details_uuid as string;

      const getAvailableMembersUsecase = new GetAvailableMembersUsecase(
        this.appUserInfoRepository,
        this.benefitGroupsRepository,
        this.businessItemDetailsRepository
      );

      const result = await getAvailableMembersUsecase.execute(business_info_uuid, employer_item_details_uuid);

      return response.json(result);

    } catch (err: any) {
      // Tratamento de erro padrão
      return response.status(err.statusCode || 500).json({
        error: err.message || "Unexpected error while fetching available members."
      });
    }
  }
}