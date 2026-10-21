import { UserDocumentValidationStatus } from "@prisma/client";
import { Uuid } from "../../../../../../../@shared/ValueObjects/uuid.vo";
import { MulterFile } from "../../../../../../../infra/shared/multer/multer-memory.config";

export interface InputCreateDocumentValidationDTO {
    user_uuid: Uuid;
    document_front?: MulterFile;
    document_back?: MulterFile;
    selfie?: MulterFile;
    document_selfie?: MulterFile;
}

export interface OutputCreateDocumentValidationDTO {
    uuid: Uuid;
    document_front_status: UserDocumentValidationStatus;
    document_back_status: UserDocumentValidationStatus;
    selfie_status: UserDocumentValidationStatus;
    document_selfie_status: UserDocumentValidationStatus;
    document_front_url?: string | null;
    document_back_url?: string | null;
    selfie_url?: string | null;
    document_selfie_url?: string | null;
    auto_validation_status?: 'approved' | 'under_analysis' | 'denied';
    facial_similarity?: number;
    rejection_reasons?: string[];
}
