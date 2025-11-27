import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { OfflineTokenToJSONOutput } from "../../../entities/offline-token.entity";

export type InputGetTokensOffline = {
  userInfoUuid: Uuid;
}

export type OutputGetTokensOffline = {
  offlineTokens: OfflineTokenToJSONOutput[];
}