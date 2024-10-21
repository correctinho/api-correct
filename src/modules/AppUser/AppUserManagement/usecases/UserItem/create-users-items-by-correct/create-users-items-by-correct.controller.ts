import { Request, Response } from "express";
import { IBusinessItemDetailsRepository } from "../../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";

export class CreateUserItemsByCorrectAdminController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository,
    private employerItemDetailsRepository: IBusinessItemDetailsRepository

  ){}
  async handle(req: Request, res: Response){
    try{
      const data = req.body
    }catch(err: any){

    }
  }
}
