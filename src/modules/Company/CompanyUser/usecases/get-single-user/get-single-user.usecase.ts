import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class GetSingleUserUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository
  ) { }

  async execute(uuid: string) {
    if (!uuid) throw new CustomError("Id is required", 400)

    const getUserDetails = await this.companyUserRepository.findById(uuid)
    if (!getUserDetails) throw new CustomError("User not found", 404)

    return getUserDetails
  }
}
