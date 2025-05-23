import { OutputGetCorrectAdminAccountDTO } from "../correctAdmin/dto/correct-admin-accounts.dto";

export interface ICorrectAdminAccountRepository {
  find():Promise<OutputGetCorrectAdminAccountDTO | null>;
}
