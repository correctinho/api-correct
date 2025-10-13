import { Status, UserDocumentValidationStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { DocumentValidationEntity, DocumentValidationPrimitiveProps, DocumentValidationProps } from "../../entities/app-user-document-validation.entity";
import { IAppUserDocumentValidationRepository } from "../app-user-document-validation.repository";

export class DocumentValidationPrismaRepository implements IAppUserDocumentValidationRepository {
  create(entity: DocumentValidationEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  update(entity: DocumentValidationEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<DocumentValidationEntity[]> {
    throw new Error("Method not implemented.");
  }
  async find(id: Uuid): Promise<DocumentValidationEntity | null> {
    const document = await prismaClient.userDocumentValidation.findUnique({
      where: {
        uuid: id.uuid
      }
    })

    if (!document) return null
    const userDocuments: DocumentValidationPrimitiveProps = {
      uuid: document.uuid,
      document_front_url: document.document_front_url,
      document_front_status: document.document_front_status,
      document_back_url: document.document_back_url,
      document_back_status: document.document_back_status,
      selfie_url: document.selfie_url,
      selfie_status: document.selfie_status,
      document_selfie_url: document.document_selfie_url,
      document_selfie_status: document.document_selfie_status,
      created_at: document.created_at,
      updated_at: document.updated_at
    }
    return DocumentValidationEntity.hydrate(userDocuments)
  }
async findStatuses(id: Uuid): Promise<DocumentValidationEntity | null> {
    const document = await prismaClient.userDocumentValidation.findUnique({
      where: {
        uuid: id.uuid
      },
      select:{
        uuid: true,
        document_front_status: true,
        document_back_status: true,
        selfie_status: true,
        document_selfie_status: true
      }
    })

    if (!document) return null

    return {
      uuid: new Uuid(document.uuid),
      document_front_status: document.document_front_status,
      document_back_status: document.document_back_status,
      selfie_status: document.selfie_status,
      document_selfie_status: document.document_selfie_status

    } as DocumentValidationEntity
  }
  async saveOrUpdate(data: DocumentValidationEntity, user_info_uuid: Uuid): Promise<void> {
        // Status considerados "válidos" para ativação do UserInfo
        // Inclui 'approved' e 'under_analysis' conforme sua especificação.
        const validStatusesForActivation: UserDocumentValidationStatus[] = [
            UserDocumentValidationStatus.approved,
            UserDocumentValidationStatus.under_analysis,
        ];

            await prismaClient.$transaction(async (tx) => {
                // 1. Criar ou Atualizar UserDocumentValidation
                const updatedDocumentValidation = await tx.userDocumentValidation.upsert({
                    where: {
                        uuid: data.uuid.uuid // Usa .uuid do Uuid
                    },
                    create: {
                        uuid: data.uuid.uuid, // Usa .uuid do Uuid
                        document_front_url: data.document_front_url,
                        document_front_status: data.document_front_status,
                        document_back_url: data.document_back_url,
                        document_back_status: data.document_back_status,
                        selfie_url: data.selfie_url,
                        selfie_status: data.selfie_status,
                        document_selfie_url: data.document_selfie_url,
                        document_selfie_status: data.document_selfie_status,
                        created_at: data.created_at,
                        updated_at: data.updated_at,
                    },
                    update: {
                        document_front_url: data.document_front_url,
                        document_front_status: data.document_front_status,
                        document_back_url: data.document_back_url,
                        document_back_status: data.document_back_status,
                        selfie_url: data.selfie_url,
                        selfie_status: data.selfie_status,
                        document_selfie_url: data.document_selfie_url,
                        document_selfie_status: data.document_selfie_status,
                        updated_at: data.updated_at,
                    }
                });

                // 2. Lógica para determinar o status do UserInfo
                const documentStatuses = [
                    updatedDocumentValidation.document_front_status,
                    updatedDocumentValidation.document_back_status,
                    updatedDocumentValidation.selfie_status,
                    updatedDocumentValidation.document_selfie_status,
                ];

                // Verifica se TODOS os status estão entre 'approved' ou 'under_analysis'
                const areAllDocumentsInValidState = documentStatuses.every((status) =>
                    validStatusesForActivation.includes(status)
                );

                const userInfoUpdateData: {
                    user_document_validation_uuid: string;
                    updated_at: string;
                    status?: Status; // Status é opcional, só será adicionado se a condição for atendida
                } = {
                    user_document_validation_uuid: data.uuid.uuid, // Usa .value do Uuid
                    updated_at: data.updated_at, // Usa o getter da entidade
                };

                if (areAllDocumentsInValidState) {
                    userInfoUpdateData.status = Status.active;
                } else {
                    userInfoUpdateData.status = Status.inactive
                  }

                // 3. Atualizar UserInfo
                await tx.userInfo.update({
                    where: {
                        uuid: user_info_uuid.uuid // Usa .uuid do Uuid
                    },
                    data: userInfoUpdateData
                });
            }); 
       
    }
}
