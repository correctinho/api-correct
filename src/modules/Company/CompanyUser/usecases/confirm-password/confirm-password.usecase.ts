import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class ConfirmPasswordUsecase{
    constructor(
        private companyUserRepository: ICompanyUserRepository,
        private passwordCrypto: IPasswordCrypto,

    ){}

    async execute(business_info_uuid: string, password: string, currentPassword: string){

        if(!password) throw new CustomError("Password is required", 400)

        //compare password
        const comparePasswordHash = await this.passwordCrypto.compare(password, currentPassword)
        if(!comparePasswordHash) throw new CustomError("Incorrect credentials", 403)

        return ({message: "Password matches", businessInfoUuid: `${business_info_uuid}`})

    }
}
