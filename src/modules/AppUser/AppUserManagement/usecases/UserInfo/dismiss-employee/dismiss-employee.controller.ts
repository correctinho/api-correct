import { Request, Response } from "express";
import { DismissEmployeeUsecase } from "./dismiss-employee.usecase";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";

export class DismissEmployeeController {
  constructor(private appUserInfoRepository: IAppUserInfoRepository) { }

  async handle(request: Request, response: Response): Promise<Response> {
    const employee_uuid = request.params.employee_uuid;
    const business_info_uuid = request.companyUser.businessInfoUuid; // from companyIsAuth middleware

    try {
      const usecase = new DismissEmployeeUsecase(
        this.appUserInfoRepository
      )
      await usecase.execute({ employee_uuid, business_info_uuid });
      return response.status(200).json({ message: "Colaborador desligado com sucesso." });
    } catch (err: any) {
      return response.status(err.statusCode || 400).json({
        message: err.message || "Erro inesperado."
      });
    }
  }
}
