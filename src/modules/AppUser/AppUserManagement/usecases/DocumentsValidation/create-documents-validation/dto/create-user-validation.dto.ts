// src/modules/AppUser/AppUserManagement/usecases/DocumentsValidation/create-documents-validation/dto/create-user-validation.dto.ts

import { UserDocumentValidationStatus } from "@prisma/client";
import { Uuid } from "../../../../../../../@shared/ValueObjects/uuid.vo"; // Importa o Value Object Uuid
import { MulterFile } from "../../../../../../../infra/shared/multer/multer-memory.config";

export interface InputCreateDocumentValidationDTO {
    user_uuid: Uuid; // O user_uuid virá do usuário autenticado, convertido para Uuid Value Object
    
    // Campos agora são MulterFile (buffers de arquivo) e não Base64 strings
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
    // Opcional: retornar as URLs geradas
    document_front_url?: string | null;
    document_back_url?: string | null;
    selfie_url?: string | null;
    document_selfie_url?: string | null;
}