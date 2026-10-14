import { Request, Response } from 'express';
import { CreateDocumentsValidationUsecase } from './create-documents-validation.usecase';
import { InputCreateDocumentValidationDTO } from './dto/create-user-validation.dto';
import { Uuid } from '../../../../../../@shared/ValueObjects/uuid.vo';
import { IAppUserAuthRepository } from '../../../repositories/app-use-auth-repository';
import { IAppUserInfoRepository } from '../../../repositories/app-user-info.repository';
import { IAppUserDocumentValidationRepository } from '../../../repositories/app-user-document-validation.repository';
import { IStorage } from '../../../../../../infra/providers/storage/storage';
import { IDocumentValidatorProvider } from '../../../../../../infra/providers/document-validator/document-validator.provider';

declare module 'express' {
    export interface Request {
        user?: { id: string };
        files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
}

export class CreateDocumentsValidationController {
    constructor(
        private userAuthRepository: IAppUserAuthRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private documentsValidationRepository: IAppUserDocumentValidationRepository,
        private storageProvider: IStorage,
        private documentValidatorProvider: IDocumentValidatorProvider,
    ) { }

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const user_uuid = req.appUser.user_info_uuid;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const input: InputCreateDocumentValidationDTO = {
                user_uuid: new Uuid(user_uuid),
                document_front: files?.document_front?.[0],
                document_back: files?.document_back?.[0],
                selfie: files?.selfie?.[0],
                document_selfie: files?.document_selfie?.[0],
            };
            const usecase = new CreateDocumentsValidationUsecase(
                this.userAuthRepository,
                this.userInfoRepository,
                this.documentsValidationRepository,
                this.storageProvider,
                this.documentValidatorProvider,
            );
            const result = await usecase.execute(input);

            return res.status(201).json(result);

        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message || "An unexpected error occurred."
            });
        }
    }
}
