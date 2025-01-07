import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { DocumentValidationEntity } from "../../entities/app-user-document-validation.entity";
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

    return {
      uuid: new Uuid(document.uuid),
      document_front_base64: document.document_back_base64,
      document_front_status: document.document_front_status,
      document_back_base64: document.document_back_base64,
      document_back_status: document.document_back_status,
      selfie_base64: document.selfie_base64,
      selfie_status: document.selfie_status,
      document_selfie_base64: document.document_selfie_base64,
      document_selfie_status: document.document_selfie_status

    } as DocumentValidationEntity
  }

  async saveOrUpdate(data: DocumentValidationEntity, user_info_uuid: Uuid): Promise<void> {

    await prismaClient.$transaction([
      prismaClient.userDocumentValidation.upsert({
        where: {
          uuid: data.uuid.uuid
        },
        create: {
          uuid: data.uuid.uuid,
          document_front_base64: data.document_front_base64,
          document_front_status: data.document_front_status,
          document_back_base64: data.document_back_base64,
          document_back_status: data.document_back_status,
          selfie_base64: data.selfie_base64,
          selfie_status: data.selfie_status,
          document_selfie_base64: data.document_selfie_base64,
          document_selfie_status: data.document_selfie_status,
          created_at: data.created_at
        },
        update: {
          document_front_base64: data.document_front_base64,
          document_front_status: data.document_front_status,
          document_back_base64: data.document_back_base64,
          document_back_status: data.document_back_status,
          selfie_base64: data.selfie_base64,
          selfie_status: data.selfie_status,
          document_selfie_base64: data.document_selfie_base64,
          document_selfie_status: data.document_selfie_status,
          updated_at: data.updated_at

        }
      }),

      prismaClient.userInfo.update({
        where: {
          uuid: user_info_uuid.uuid
        },
        data: {
          user_document_validation_uuid: data.uuid.uuid,
          updated_at: data.updated_at
        }
      })
    ])
  }

}
