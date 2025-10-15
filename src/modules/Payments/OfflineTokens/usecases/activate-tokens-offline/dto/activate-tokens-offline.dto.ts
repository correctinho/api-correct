import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { OfflineTokenToJSONOutput } from "../../../entities/offline-token.entity";
// Importa o tipo de retorno do toJSON da entidade (que já é o formato plano)

// Input DTO (aqui, já esperamos o Uuid Value Object)
export type InputActivateTokensOffline = {
  userInfoUuid: Uuid;
  userItemUuid: Uuid;
}

// Output DTO (aqui, esperamos o formato plano com UUIDs como string)
export type OutputActivateTokensOffline = {
  offlineTokens: OfflineTokenToJSONOutput[];
}