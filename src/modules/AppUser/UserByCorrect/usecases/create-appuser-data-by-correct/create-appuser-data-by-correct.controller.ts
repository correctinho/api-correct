import { Request, Response } from "express";
import { CustomError } from "../../../../../errors/custom.error";
import { logger } from "../../../../../utils/logger";
import { IAppUserInfoRepository } from "../../../AppUserManagement/repositories/app-user-info.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IAppUserAuthRepository } from "../../../AppUserManagement/repositories/app-use-auth-repository";
import { CreateAppUserByCorrectUsecaseTest } from "./create-appuser-data-by-correct.usecase";


export class CreateAppUserByCorrectController {
  constructor(
    private appUserInfoRepository: IAppUserInfoRepository,
    private businessRepository: ICompanyDataRepository,
    private appUserAuthRepository: IAppUserAuthRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const business_info_uuid = req.query.business_info_uuid as string;

      // Verifica se o arquivo foi enviado
      if (!req.file) throw new CustomError("Error upload file", 400);

      // Obtém o buffer do arquivo
      const fileBuffer = req.file.buffer;

      const appUserUsecase = new CreateAppUserByCorrectUsecaseTest(
        this.appUserInfoRepository,
        this.businessRepository,
        this.appUserAuthRepository
      );

      // Passa o buffer do arquivo para o caso de uso
      const user = await appUserUsecase.execute(fileBuffer, business_info_uuid);

      return res.json(user);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error"
      });
    }
  }
}
