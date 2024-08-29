import { compare } from "bcryptjs"
import { IPasswordCrypto } from "../../../../crypto/password.crypto"
import { CustomError } from "../../../../errors/custom.error"
import { IToken } from "../../../../infra/shared/crypto/token/CorrectAdmin/token"
import { ICorrectAdminRepository } from "../../repositories/correct-admin.repository"
import { api } from "../../../../infra/axios/axios.config"

export type AuthenticateAdminRequest = {
    userName: string
    password: string
}

export class AuthenticateAdminUseCase{
    constructor(
        private correctAdminRepository: ICorrectAdminRepository,
        private passwordCrypto: IPasswordCrypto,
    ){}

    async execute( {userName, password }: AuthenticateAdminRequest){
        if(!userName || !password) throw new CustomError("Username/password is incorrect", 401)

        const admin = await this.correctAdminRepository.findByUserNameAuth(userName)
        if(!admin) throw new CustomError("Username/password is incorrect", 401)

        const comparePasswordHash = await this.passwordCrypto.compare(password, admin.password)
        if(!comparePasswordHash) throw new CustomError("Username/password is incorrect", 401)

          //criar token através da api local
          //const tokenGenerated = await this.token.create(admin)

          //gerar token através da api go
          try{
            const response = await api.post("/api/v1/jwt/encode", {
              data:{
                user_uuid: admin.uuid.uuid
              },
              seconds: 600
            })

            const tokenGenerated = response.data.token

            return {
                token: tokenGenerated
            }
          }catch(err: any){

            return "Erro ao gerar token do correct admin"
          }
        //const tokenGenerated = await this.token.create(admin)


    }
}
