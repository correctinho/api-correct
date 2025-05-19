import { OutputGetCorrectAdminAccountDTO } from "../usecases/correctAdmin/dto/correct-admin-accounts.dto";

export interface ICorrectAdminAccountRepository {
  find():Promise<OutputGetCorrectAdminAccountDTO | null>;
}
