import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class DeleteUserByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository
  ) { }

  async execute(user_id: string, business_info_uuid: string) {
    if (!user_id) throw new CustomError("User id is required", 400)

    const findUser = await this.companyUserRepository.findById(user_id)
    if (!findUser) throw new CustomError("User not found", 404)

    if (findUser.business_info_uuid.uuid !== business_info_uuid) throw new CustomError("Unauthorized", 403);

    const deleteUser = await this.companyUserRepository.inactivateByAdminById(user_id)

    return deleteUser
  }
}
