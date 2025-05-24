import { CustomError } from "../../../../../../errors/custom.error";
import { IBusinessAccountRepository } from "../../repositories/business-account.repository";
import { InputGetBusinessAccountDTO, OutputGetBusinessAccountDTO } from "../dto/business-account.dto";

export class GetBusinessAccountByAdminUseCase {
  constructor(
    private businessAccountRepository: IBusinessAccountRepository
  ){}

  async execute(data: InputGetBusinessAccountDTO): Promise<OutputGetBusinessAccountDTO> {

    if(!data.business_info_uuid){
      throw new CustomError("business_info_uuid is required", 400)
    }

    //get business account
    const businessAccount = await this.businessAccountRepository.findByBusinessId(data.business_info_uuid)
    if(!businessAccount){
      throw new CustomError("Business account not found", 404)
    }

    return {
      uuid: businessAccount.uuid,
      business_info_uuid: businessAccount.business_info_uuid,
      balance: businessAccount.balance,
      status: businessAccount.status,
      created_at: businessAccount.created_at,
      updated_at: businessAccount.updated_at,
    }
  }
}
