import { Request, Response } from "express";
import { CustomError } from "../../../../../errors/custom.error";
import { logger } from "../../../../../utils/logger";
import { IAppUserInfoRepository } from "../../../AppUserManagement/repositories/app-user-info.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IAppUserAuthRepository } from "../../../AppUserManagement/repositories/app-use-auth-repository";
import { CreateAppUserByCorrectUsecaseTest } from "./create-appuser-data-by-correct.usecase";
import { IBusinessItemDetailsRepository } from "../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { IAppUserItemRepository } from "../../../AppUserManagement/repositories/app-user-item-repository";


export class CreateAppUserByCorrectController {
  constructor(
    private appUserInfoRepository: IAppUserInfoRepository,
    private businessRepository: ICompanyDataRepository,
    private appUserAuthRepository: IAppUserAuthRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository,
    private employeeItemRepository: IAppUserItemRepository

  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body
      data.business_info_uuid = req.query.business_info_uuid as string;

      // Verifica se o arquivo foi enviado
      if (!req.file) throw new CustomError("Error upload file", 400);

      // Obtém o buffer do arquivo
      data.fileBuffer = req.file.buffer;

      const appUserUsecase = new CreateAppUserByCorrectUsecaseTest(
        this.appUserInfoRepository,
        this.businessRepository,
        this.appUserAuthRepository,
        this.employerItemsRepository,
        this.employeeItemRepository
      );

      // Passa o buffer do arquivo para o caso de uso
      const user = await appUserUsecase.execute(data);

      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error"
      });
    }
  }
}
