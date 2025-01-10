import { Request, Response } from "express";
import { CreateDocumentsValidationUsecase } from "./create-documents-validation.usecase";
import { IAppUserDocumentValidationRepository } from "../../../repositories/app-user-document-validation.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";

export class CreateDocumentsValidationController{
    constructor(
        private userAuthRepository: IAppUserAuthRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private documentsValidationRepository: IAppUserDocumentValidationRepository

    ){}

    async handle(req: Request, res: Response){
        try{

            const data = req.body
            data.user_uuid = new Uuid(req.appUser.appUserId)

            const documentsValidationUsecase = new CreateDocumentsValidationUsecase(
                this.userAuthRepository,
                this.userInfoRepository,
                this.documentsValidationRepository
            )

            const result = await documentsValidationUsecase.execute(data)

            return res.status(201).json({success: "Documents registered successfully", result})

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
