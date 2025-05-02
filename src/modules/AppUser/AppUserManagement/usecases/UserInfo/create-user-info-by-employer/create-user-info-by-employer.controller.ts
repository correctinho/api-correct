import { Request, Response } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { InputCreateUserInfoDTO } from "../create-user-info/dto/create-user-info.dto";
import { CreateAppUserInfoByEmployerUsecase } from "./create-user-info-by-employer.usecase";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { IBusinessItemDetailsRepository } from "../../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";

export class CreateUserInfoByEmployerController {
  constructor(
    private appUserInfoRepository: IAppUserInfoRepository,
    private appUserAuthRepository: IAppUserAuthRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository,
    private benefitsRepository: IBenefitsRepository

  ) { }

  async handle(req: Request, res: Response) {

    try {
      const data = req.body

      data.business_info_uuid = new Uuid(req.companyUser.businessInfoUuid)

      const userInfoUsecase = new CreateAppUserInfoByEmployerUsecase(this.appUserInfoRepository, this.appUserAuthRepository, this.employerItemsRepository, this.benefitsRepository)

      await userInfoUsecase.execute(data)

      return res.status(201).json({ sucess: "User info registered successfully" })
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error"
      });
    }
  }
}
