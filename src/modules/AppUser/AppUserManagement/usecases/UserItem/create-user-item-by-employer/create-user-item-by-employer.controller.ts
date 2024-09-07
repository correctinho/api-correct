import { Request, Response } from "express";
import { CreateAppUserItemByEmployerUsecase } from "./create-user-item-by-employer.usecase";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { InputCreateAppUserItemByEmployerDTO } from "./dto/create-user-item-by-employer.dto";

export class CreateAppUserItemByEmployerController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository,
    private employerItemDetailsRepository: IBusinessItemDetailsRepository
  ){}
  async handle(req: Request, res: Response){
    try{
      const data: InputCreateAppUserItemByEmployerDTO = req.body
      data.business_info_uuid = req.companyUser.businessInfoUuid
      const usecase = new CreateAppUserItemByEmployerUsecase(
        this.appUserItemRepository,
        this.appUserInfoRepository,
        this.employerItemDetailsRepository
      )

      const result = await usecase.execute(data)

      return res.status(201).json(result)

    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
    })
    }
  }
}
