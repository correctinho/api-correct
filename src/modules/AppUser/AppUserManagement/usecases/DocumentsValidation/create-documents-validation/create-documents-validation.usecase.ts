import sharp from 'sharp';
import { CustomError } from '../../../../../../errors/custom.error';
import { MulterFile } from '../../../../../../infra/shared/multer/multer-memory.config';
import { IAppUserAuthRepository } from '../../../repositories/app-use-auth-repository';
import { IAppUserInfoRepository } from '../../../repositories/app-user-info.repository';
import { IAppUserDocumentValidationRepository } from '../../../repositories/app-user-document-validation.repository';
import { IStorage } from '../../../../../../infra/providers/storage/storage';
import { IDocumentValidatorProvider } from '../../../../../../infra/providers/document-validator/document-validator.provider';
import { DocumentValidationEntity } from '../../../entities/app-user-document-validation.entity';
import { InputCreateDocumentValidationDTO, OutputCreateDocumentValidationDTO } from './dto/create-user-validation.dto';
import { UserDocumentValidationStatus } from '@prisma/client';

export class CreateDocumentsValidationUsecase {
    constructor(
        private userAuthRepository: IAppUserAuthRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private documentsValidationRepository: IAppUserDocumentValidationRepository,
        private storageProvider: IStorage,
        private documentValidatorProvider: IDocumentValidatorProvider,
    ) {}

    async execute(data: InputCreateDocumentValidationDTO): Promise<OutputCreateDocumentValidationDTO> {
        // 1. Validação inicial do DTO de entrada (garante que pelo menos um arquivo existe)
        if (!data.document_front && !data.document_back && !data.selfie && !data.document_selfie) {
            throw new CustomError("No documents to be registered. At least one file is required.", 400);
        }

        if (!data.user_uuid) throw new CustomError("User info not found", 404);

        const userInfo = await this.userInfoRepository.find(data.user_uuid);
        if (!userInfo) throw new CustomError("User info not found", 404);

        // 2. Carregar ou criar a entidade DocumentValidationEntity
        let documentsEntity: DocumentValidationEntity;
        if (userInfo.user_document_validation_uuid) {
            const existingValidation = await this.documentsValidationRepository.find(userInfo.user_document_validation_uuid);
            if (existingValidation) {
                documentsEntity = existingValidation;
            } else {
                documentsEntity = DocumentValidationEntity.create({});
                console.warn(`[CREATE_DOC_VAL] Existing document validation UUID (${userInfo.user_document_validation_uuid}) not found, creating new entity.`);
            }
        } else {
            documentsEntity = DocumentValidationEntity.create({});
        }

        const folder = `user-documents/${userInfo.uuid.uuid}`;

        // 3. Função auxiliar para processar cada documento (upload e atualização da entidade)
        const processDocument = async (
            file: MulterFile | undefined,
            documentType: string,
            setEntityUrl: (url: string | null) => void,
            setEntityStatus: (status: UserDocumentValidationStatus) => void
        ): Promise<void> => {
            if (!file) {
                return;
            }

            try {
                const filename = `${userInfo.uuid.uuid}-${Date.now()}-${documentType}.${file.originalname.split('.').pop()}`;
                const uploadResult = await this.storageProvider.upload(
                    { ...file, originalname: filename },
                    folder,
                    true
                );

                if (uploadResult.error || !uploadResult.data?.url) {
                    throw new Error(uploadResult.error?.message || 'Upload returned no URL');
                }

                setEntityUrl(uploadResult.data.url);
                setEntityStatus(UserDocumentValidationStatus.under_analysis);
            } catch (uploadError: any) {
                console.error(`[CREATE_DOC_VAL] Falha no upload de ${documentType} para storage:`, uploadError);
                throw new CustomError(`Failed to upload ${documentType} to storage.`, 500);
            }
        };

        // 4. Processar uploads sequencialmente para garantir estabilidade de conexão e reaproveitamento de socket HTTPS
        const documentsToProcess = [
            {
                file: data.document_front,
                type: 'document_front' as const,
                setUrl: (url: string) => documentsEntity.changeDocumentFrontUrl(url),
                setStatus: (status: UserDocumentValidationStatus) => documentsEntity.changeDocumentFrontStatus(status),
            },
            {
                file: data.document_back,
                type: 'document_back' as const,
                setUrl: (url: string) => documentsEntity.changeDocumentBackUrl(url),
                setStatus: (status: UserDocumentValidationStatus) => documentsEntity.changeDocumentBackStatus(status),
            },
            {
                file: data.selfie,
                type: 'selfie' as const,
                setUrl: (url: string) => documentsEntity.changeSelfieUrl(url),
                setStatus: (status: UserDocumentValidationStatus) => documentsEntity.changeSelfieStatus(status),
            },
            {
                file: data.document_selfie,
                type: 'document_selfie' as const,
                setUrl: (url: string) => documentsEntity.changeDocumentSelfieUrl(url),
                setStatus: (status: UserDocumentValidationStatus) => documentsEntity.changeDocumentSelfieStatus(status),
            },
        ];

        for (const item of documentsToProcess) {
            if (item.file) {
                await processDocument(item.file, item.type, item.setUrl, item.setStatus);
            }
        }

        // 5. Validação automatizada na hora (se selfie e frente do documento foram fornecidos)
        let autoValidationStatus: 'approved' | 'under_analysis' | 'denied' | undefined;
        let facialSimilarity: number | undefined;
        let rejectionReasons: string[] | undefined;

        if (data.selfie?.buffer && data.document_front?.buffer) {
            try {
                // Prepara buffers JPEG otimizados e devidamente orientados para Rekognition e Textract
                const optimizeForAws = async (buf: Buffer): Promise<Buffer> => {
                    try {
                        return await sharp(buf)
                            .rotate()
                            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                            .jpeg({ quality: 85 })
                            .toBuffer();
                    } catch {
                        return buf;
                    }
                };

                const [docBuffer, selfieBuffer] = await Promise.all([
                    optimizeForAws(data.document_front.buffer),
                    optimizeForAws(data.selfie.buffer),
                ]);

                const decision = await this.documentValidatorProvider.validate({
                    documentBuffer: docBuffer,
                    selfieBuffer: selfieBuffer,
                    expectedCpf: userInfo.document,
                    expectedFullName: userInfo.full_name,
                });

                autoValidationStatus = decision.status;
                facialSimilarity = decision.facialSimilarity;
                rejectionReasons = decision.reasons;

                if (decision.status === 'approved') {
                    documentsEntity.changeDocumentFrontStatus(UserDocumentValidationStatus.approved);
                    documentsEntity.changeSelfieStatus(UserDocumentValidationStatus.approved);
                    if (data.document_back) {
                        documentsEntity.changeDocumentBackStatus(UserDocumentValidationStatus.approved);
                    }
                    // document_selfie é dispensado no fluxo automático
                    documentsEntity.changeDocumentSelfieStatus(UserDocumentValidationStatus.approved);
                } else if (decision.status === 'denied') {
                    documentsEntity.changeDocumentFrontStatus(UserDocumentValidationStatus.denied);
                    documentsEntity.changeSelfieStatus(UserDocumentValidationStatus.denied);
                    if (data.document_back) {
                        documentsEntity.changeDocumentBackStatus(UserDocumentValidationStatus.denied);
                    }
                } else {
                    // under_analysis (inconclusivo ou foto ilegível)
                    documentsEntity.changeDocumentFrontStatus(UserDocumentValidationStatus.under_analysis);
                    documentsEntity.changeSelfieStatus(UserDocumentValidationStatus.under_analysis);
                    if (data.document_back) {
                        documentsEntity.changeDocumentBackStatus(UserDocumentValidationStatus.under_analysis);
                    }
                    if (!data.document_selfie) {
                        documentsEntity.changeDocumentSelfieStatus(UserDocumentValidationStatus.under_analysis);
                    }
                }
            } catch (err: any) {
                console.error('[CREATE_DOC_VAL] Falha na validação automatizada, mantendo under_analysis:', err?.message || err);
                autoValidationStatus = 'under_analysis';
            }
        }

        // 6. Atualizar timestamps
        documentsEntity.changeDocumentFrontUrl(documentsEntity.document_front_url);

        // 7. Salvar/Atualizar a entidade no banco de dados
        await this.documentsValidationRepository.saveOrUpdate(documentsEntity, userInfo.uuid);

        // 8. Retornar o DTO de saída
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
            auto_validation_status: autoValidationStatus,
            facial_similarity: facialSimilarity,
            rejection_reasons: rejectionReasons,
        };
    }
}
