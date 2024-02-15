import { PasswordBcrypt } from "../../../../../crypto/password.bcrypt";
import { CustomError } from "../../../../../errors/custom.error";
import { CompanyUserEntity } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class UpdateUserByAdminUsecase {
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ) { }

    async execute(data: CompanyUserEntity) {

        if(!data.uuid) throw new CustomError("User ID is required", 400)

        //check if user exists
        const findUser = await this.companyUserRepository.findById(data.uuid)
        if (!findUser) throw new CustomError("User not found", 404)


        if (findUser.status === 'pending_password') {
            if (!data.password) throw new CustomError("Admin must update password", 400)

            if (!findUser.document && !data.document) throw new CustomError("Document is required", 400)

            const bcrypt = new PasswordBcrypt()
            const passwordHash = await bcrypt.hash(data.password)

            data.password = passwordHash
            data.status = 'active'

        }
        if(data.password){
            const bcrypt = new PasswordBcrypt()
            const passwordHash = await bcrypt.hash(data.password)

            data.password = passwordHash
        }

        if (data.user_name) {
            //check if username already exists
            const findByUsername = await this.companyUserRepository.findByBusinessIdAndUsername(findUser.business_info_uuid, data.user_name)
            if (findByUsername) throw new CustomError("User name already registered", 409)


        }
        if (!data.document) data.document = findUser.document
        if (!data.user_name) data.user_name = findUser.user_name
        if (!data.name) data.name = findUser.name


        //update user
        const updateUser = await this.companyUserRepository.updateUser(data)

        return updateUser
    }
}