import { Request, Response } from "express";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { GetByDocumentUsecase } from "./get-by-document.usecase";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserDocumentValidationRepository } from "../../../repositories/app-user-document-validation.repository";

export class GetByDocumentController {
    constructor(
        private appUserRepository: IAppUserAuthRepository,
        private appUserInfoRepository: IAppUserInfoRepository,
        private appUserValidationRepository: IAppUserDocumentValidationRepository

    ) { }

    async handle(req: Request, res: Response) {

        try {
            const document = req.params.document as string
            const getByDocument = new GetByDocumentUsecase(this.appUserRepository, this.appUserInfoRepository, this.appUserValidationRepository)

            const user = await getByDocument.execute(document)

            return res.json(user)

        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message
            })
        }

    }
}
