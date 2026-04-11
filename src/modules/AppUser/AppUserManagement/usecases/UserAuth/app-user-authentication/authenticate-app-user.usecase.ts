import { IPasswordCrypto } from "../../../../../../crypto/password.crypto"
import { CustomError } from "../../../../../../errors/custom.error"
import { api } from "../../../../../../infra/axios/axios.config"
import { IAppUserToken } from "../../../../../../infra/shared/crypto/token/AppUser/token"
import { DocumentValidator } from "../../../../../../utils/document-validation"
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository"
import { IRedisCacheRepository } from "../../../../../../infra/redis/redis-cache.repository"

export type AuthenticateAppuserRequest = {
  document: string
  password: string
}

export class AuthenticateAppuserUsecase {
  constructor(
    private appUserRepository: IAppUserAuthRepository,
    private passwordCrypto: IPasswordCrypto,
    private token: IAppUserToken,
    private redisCacheRepository: IRedisCacheRepository
  ) { }

  async execute({ document, password }: AuthenticateAppuserRequest) {
    if (!document || !password) throw new CustomError("CPF ou senha incorretos", 400)

    const documentNumber = this.processDocument(document)
    const appUser = await this.appUserRepository.findByDocument(documentNumber)

    if (!appUser) throw new CustomError("CPF ou senha incorretos", 401)

    //Verifica se o email já está validado
    if (!appUser.is_email_verified) {
        throw new CustomError("Email não confirmado.", 403);
    }

    const redisKey = `login_lock:app_user:${appUser.uuid.uuid}`;
    const failedAttempts = await this.redisCacheRepository.get(redisKey);
    if (failedAttempts && Number(failedAttempts) >= 5) {
      throw new CustomError("Sua conta está bloqueada por 15 minutos devido a múltiplas tentativas.", 403);
    }

    const comparePasswordHash = await this.passwordCrypto.compare(password, appUser.password)
    if (!comparePasswordHash) {
      const newAttempts = await this.redisCacheRepository.incr(redisKey);
      await this.redisCacheRepository.expire(redisKey, 900);
      const restantes = 5 - newAttempts;
      
      if (restantes > 0) {
        throw new CustomError(`CPF ou senha incorretos. Você tem mais ${restantes} tentativas.`, 401);
      } else {
        throw new CustomError("Sua conta está bloqueada por 15 minutos devido a múltiplas tentativas.", 403);
      }
    }

    await this.redisCacheRepository.del(redisKey);

    //criar token através da api local
    const tokenGenerated = await this.token.create(appUser)
    return {
      token: tokenGenerated
    }

    //gerar token através da api go

    //   try {
    //     const response = await api.post("/api/v1/jwt/encode", {
    //       data: {
    //         user_uuid: appUser.uuid.uuid
    //       },
    //       seconds: 2000
    //     })

    //     const tokenGenerated = response.data.token

    //     return {
    //       token: tokenGenerated
    //     }
    //   } catch (err: any) {

    //     return "Erro ao gerar token do app user"
    //   }
    // }
  }

  private processDocument(document: string) {
    const onlyNumbers = document.replace(/\D/g, '');
    return onlyNumbers
  }

}
