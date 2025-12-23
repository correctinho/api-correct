import { TermsTypeEnum } from "../../../entities/enums/terms-type.enum";

// Geralmente será 'B2C_APP_USER_EULA' para o app móvel.
export interface InputGetActiveTermsDTO {
    type: TermsTypeEnum;
}

// Saída: O que o front precisa para exibir e para usar depois.
export interface OutputGetActiveTermsDTO {
    uuid: string;       // O front PRECISA guardar isso para enviar no aceite
    version: string;    // Ex: "v1.2" para exibir no título do modal
    content: string;    // O HTML/texto longo para exibir no corpo do modal
    updatedAt: Date;   // Data da última atualização dessa versão
}