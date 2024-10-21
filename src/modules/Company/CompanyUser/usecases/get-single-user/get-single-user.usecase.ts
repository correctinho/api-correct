import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class GetSingleUserUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository
  ) { }

  async execute(uuid: string) {
    if (!uuid) throw new CustomError("Id is required", 400)

    const user = await this.companyUserRepository.findById(uuid)
    if (!user) throw new CustomError("User not found", 404)

      return {
        uuid: user.uuid.uuid,
        business_info_uuid: user.business_info_uuid.uuid,
        email: user.email,
        document: user.document,
        name: user.name,
        is_admin: user.is_admin,
        permissions: user.permissions,
        user_name: user.user_name,
        function: user.function,
        status: user.status,

      }
  }
}
