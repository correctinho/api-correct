import { CustomError } from '../../../../../../errors/custom.error';
import { UserDocumentValidationStatus } from '@prisma/client';import { InputCreateDocumentValidationDTO, OutputCreateDocumentValidationDTO } from './dto/create-user-validation.dto';
import { Uuid } from '../../../../../../@shared/ValueObjects/uuid.vo';
import { IAppUserAuthRepository } from '../../../repositories/app-use-auth-repository';
import { IAppUserInfoRepository } from '../../../repositories/app-user-info.repository';
import { IAppUserDocumentValidationRepository } from '../../../repositories/app-user-document-validation.repository';
import { IStorage } from '../../../../../../infra/providers/storage/storage';
import { DocumentValidationEntity } from '../../../entities/app-user-document-validation.entity';
import { MulterFile } from '../../../../../../infra/shared/multer/multer-memory.config';

export class CreateDocumentsValidationUsecase {
    constructor(
        private userAuthRepository: IAppUserAuthRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private documentsValidationRepository: IAppUserDocumentValidationRepository,
        private storageProvider: IStorage,
    ) {}

    async execute(data: InputCreateDocumentValidationDTO): Promise<OutputCreateDocumentValidationDTO> {
        // Validação inicial do DTO de entrada (garante que pelo menos um arquivo existe)
        if (!data.document_front && !data.document_back && !data.selfie && !data.document_selfie) {
            throw new CustomError("No documents to be registered. At least one file is required.", 400);
        }

        if (!data.user_uuid) throw new CustomError("User info not found", 404);

        const userInfo = await this.userInfoRepository.find(data.user_uuid);
        if (!userInfo) throw new CustomError("User info not found", 404);

        // 2. Carregar ou criar a entidade DocumentValidationEntity
        let documentsEntity: DocumentValidationEntity;
        let createdNewEntity = false;
        if (userInfo.user_document_validation_uuid) {
            const existingValidation = await this.documentsValidationRepository.find(userInfo.user_document_validation_uuid);
            if (existingValidation) {
                documentsEntity = existingValidation;
            } else {
                documentsEntity = DocumentValidationEntity.create({});
                createdNewEntity = true;
                console.warn(`[CREATE_DOC_VAL] Existing document validation UUID (${userInfo.user_document_validation_uuid}) not found, creating new entity.`);
            }
        } else {
            documentsEntity = DocumentValidationEntity.create({});
            createdNewEntity = true;
        }

        const folder = `user-documents/${userInfo.uuid.uuid}`; // Pasta no Supabase para este usuário
        // 3. Função auxiliar para processar cada documento (upload e atualização da entidade)
        const processDocument = async (
            file: MulterFile | undefined, // Espera MulterFile
            documentType: string,
            setEntityUrl: (url: string | null) => void,
            setEntityStatus: (status: UserDocumentValidationStatus) => void
        ): Promise<void> => {
            if (!file) {
                return;
            }

            
            // 3.1. Upload do Arquivo
            try {
                // Gera um nome de arquivo único para evitar colisões
                const filename = `${userInfo.uuid.uuid}-${Date.now()}-${documentType}.${file.originalname.split('.').pop()}`;
                const uploadResult = await this.storageProvider.upload(
                    { ...file, originalname: filename }, // Sobrescreve o originalname para o upload com o nome único
                    folder
                );

                if (uploadResult.error || !uploadResult.data?.url) {
                    throw new Error(uploadResult.error?.message || 'Upload returned no URL');
                }
                
                // Se o upload for bem-sucedido, o status é 'under_analysis'
                setEntityUrl(uploadResult.data.url);
                setEntityStatus(UserDocumentValidationStatus.under_analysis); // Status inicial direto para análise manual

            } catch (uploadError: any) {
                console.error(`[CREATE_DOC_VAL] Falha no upload de ${documentType} para storage:`, uploadError);
                // Se o upload falhar, marca o status como denied e limpa a URL
                setEntityStatus(UserDocumentValidationStatus.denied);
                setEntityUrl(null);
            }
        };
        // 4. Processar todos os documentos em paralelo
        await Promise.all([
            processDocument(
                data.document_front, 'document_front',
                (url) => documentsEntity.changeDocumentFrontUrl(url),
                (status) => documentsEntity.changeDocumentFrontStatus(status)
            ),
            processDocument(
                data.document_back, 'document_back',
                (url) => documentsEntity.changeDocumentBackUrl(url),
                (status) => documentsEntity.changeDocumentBackStatus(status)
            ),
            processDocument(
                data.selfie, 'selfie',
                (url) => documentsEntity.changeSelfieUrl(url),
                (status) => documentsEntity.changeSelfieStatus(status)
            ),
            processDocument(
                data.document_selfie, 'document_selfie',
                (url) => documentsEntity.changeDocumentSelfieUrl(url),
                (status) => documentsEntity.changeDocumentSelfieStatus(status)
            )
        ]);
        // 5. Atualizar timestamps (já gerenciado pelos setters da entidade)
        // Apenas um toque para garantir updated_at, caso nenhum setter tenha sido chamado.
        documentsEntity.changeDocumentFrontUrl(documentsEntity.document_front_url); 

        // 6. Salvar/Atualizar a entidade no banco de dados
        await this.documentsValidationRepository.saveOrUpdate(documentsEntity, userInfo.uuid);
        // 7. Retornar o DTO de saída
        return {
            uuid: documentsEntity.uuid,
            document_front_status: documentsEntity.document_front_status,
            document_back_status: documentsEntity.document_back_status,
            selfie_status: documentsEntity.selfie_status,
            document_selfie_status: documentsEntity.document_selfie_status,
            document_front_url: documentsEntity.document_front_url,
            document_back_url: documentsEntity.document_back_url,
            selfie_url: documentsEntity.selfie_url,
            document_selfie_url: documentsEntity.document_selfie_url,
        };
    }
}