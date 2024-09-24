import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class ConfirmPasswordUsecase{
    constructor(
        private companyUserRepository: ICompanyUserRepository,
        private passwordCrypto: IPasswordCrypto,

    ){}

    async execute(user_id: string, password: string){

        if(!password) throw new CustomError("Incorrect credentials", 400)

        //find user
        const findUser = await this.companyUserRepository.findByIdAuth(user_id)
        if(!findUser) throw new CustomError("User not found", 404)

        //compare password
        const comparePasswordHash = await this.passwordCrypto.compare(password, findUser.password)
        if(!comparePasswordHash) throw new CustomError("Incorrect credentials", 403)

        return ({message: "Password matches", businessInfoUuid: `${findUser.business_info_uuid}`})

    }
}
