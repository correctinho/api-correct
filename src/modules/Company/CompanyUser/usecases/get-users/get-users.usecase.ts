import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class GetUsersUsecase {
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ) {}

    async execute(business_info_uuid: string){

        if(!business_info_uuid) throw new CustomError("Business document required", 400)

        const getUsers = await this.companyUserRepository.findUsers(business_info_uuid)
        if(!getUsers) throw new CustomError("Users not found", 400)

        return getUsers.map((user) => {
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
        })
    }
}
