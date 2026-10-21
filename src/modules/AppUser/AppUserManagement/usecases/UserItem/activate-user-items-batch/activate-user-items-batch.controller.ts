import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { ActivateUserItemsBatchUsecase } from "./activate-user-items-batch.usecase";

export class ActivateUserItemsBatchController{
    constructor(
            private appUserItemRepository: IAppUserItemRepository
        ) {}

    async handle(req: Request, res: Response){
        try{
            const business_info_uuid = req.companyUser.businessInfoUuid

            const { item_uuid, user_info_uuids, users } = req.body;
            const usecase = new ActivateUserItemsBatchUsecase(
                this.appUserItemRepository
            );

            const mappedUsers = users || (user_info_uuids || []).map((id: string) => ({ user_info_uuid: id }));

            await usecase.execute({
                business_info_uuid,
                item_uuid,
                users: mappedUsers
            });

            return res.status(200).send();
        }catch(err: any){
            console.log(err);
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
    
}
