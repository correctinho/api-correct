import { CustomError } from "../../../../../errors/custom.error"
import { api } from "../../../../../infra/axios/axios.config"
import { IPasswordCrypto } from "../../../../../infra/shared/crypto/password.crypto"
import { ICompanyAdminToken } from "../../../../../infra/shared/crypto/token/CompanyAdmin/token"
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository"
import { ICompanyUserRepository } from "../../repositories/company-user.repository"
import { z } from 'zod'

export type AuthenticateCompanyUserRequest = {

  business_document: string,
  email: string | null,
  user_name: string,
  password: string,
}
export class AuthenticateCompanyUserUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private companyDataRepository: ICompanyDataRepository,
    private passwordCrypto: IPasswordCrypto,
    private token: ICompanyAdminToken
  ) { }

  async execute({ business_document, user_name, password, email }: AuthenticateCompanyUserRequest) {

    if (!business_document || !password) throw new CustomError("Incorrect credentials", 401)

    //find a business with offered business document
    const findBusinessInfo = await this.companyDataRepository.findByDocument(business_document)
    if (!findBusinessInfo) throw new CustomError("Incorrect credentials", 401)

    const isEmail = z.string().email().safeParse(email)
    //login option by email

    if (isEmail.success && email) {
      //if it exists, try to find in companyuser an user with same ID as business and email
      const findUser = await this.companyUserRepository.findByBusinessIdAndEmail(findBusinessInfo.uuid, email)
      if (!findUser) throw new CustomError("Incorrect credentials", 401)

      //after finding, compare password
      const comparePasswordHash = await this.passwordCrypto.compare(password, findUser.password)
      if (!comparePasswordHash) throw new CustomError("Incorrect credentials", 401)

      //check if user status is inactive
      if (findUser.status === "inactive") throw new CustomError("User is not allowed to sign in", 401)

      const tokenGenerated = this.token.create(findUser)
      return {
        token: tokenGenerated
      }

      // try {
      //   const response = await api.post("/api/v1/jwt/encode", {
      //     data: {
      //       user_uuid: findUser.uuid
      //     },
      //     seconds: 600
      //   })

      //   const tokenGenerated = response.data.token
      //   return {
      //     token: tokenGenerated
      //   }
      // } catch (err: any) {
      //   return "Erro ao gerar token"
      // }
    }

    //login option by username
    if (!user_name) throw new CustomError("Incorrect credentials", 401)

    const findUser = await this.companyUserRepository.findByBusinessIdAndUsername(findBusinessInfo.uuid, user_name)
    if (!findUser) throw new CustomError("Incorrect credentials", 401)

    if (findUser.status === "inactive") throw new CustomError("User is not allowed to sign in", 401)

    const comparePasswordHash = await this.passwordCrypto.compare(password, findUser.password)
    if (!comparePasswordHash) throw new CustomError("Incorrect credentials", 401)

    const tokenGenerated = this.token.create(findUser)
    return {
      token: tokenGenerated
    }
    // try {
    //   const response = await api.post("/api/v1/jwt/encode", {
    //     data: {
    //       user_uuid: findUser.uuid
    //     },
    //     seconds: 600
    //   })

    //   const tokenGenerated = response.data.token

    //   return {
    //     token: tokenGenerated
    //   }
    // } catch (err: any) {

    //   return "Erro ao gerar token"
    // }

  }
}
