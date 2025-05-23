import { CustomError } from "../../../../../../errors/custom.error";
import { ICorrectAdminAccountRepository } from "../../repositories/correct-admin-account.repository";
import { InputGetCorrectAdminAccountDTO, OutputGetCorrectAdminAccountDTO } from "../dto/correct-admin-accounts.dto";

export class GetCorrectAdminAccountUsecase {
  constructor(
    private correctAdminAccount: ICorrectAdminAccountRepository
  ) { }

  async execute(data: InputGetCorrectAdminAccountDTO): Promise<OutputGetCorrectAdminAccountDTO> {
    if (!data.isAdmin) throw new CustomError("You are not authorized to access this route", 401);

    //get transaction details
    const correctAdminAccount = await this.correctAdminAccount.find();
    if (!correctAdminAccount) throw new CustomError("Correct Admin Account not found", 404);
    // Ensure transaction has the favored business info needed

    return {
      uuid: correctAdminAccount.uuid,
      balance: correctAdminAccount.balance,
      status: correctAdminAccount.status,
      created_at: correctAdminAccount.created_at,
      updated_at: correctAdminAccount.updated_at,
    }
  }
}
