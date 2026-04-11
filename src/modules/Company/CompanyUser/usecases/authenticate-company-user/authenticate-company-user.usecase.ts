import { CustomError } from "../../../../../errors/custom.error"
import { api } from "../../../../../infra/axios/axios.config"
import { IPasswordCrypto } from "../../../../../infra/shared/crypto/password.crypto"
import { ICompanyAdminToken } from "../../../../../infra/shared/crypto/token/CompanyAdmin/token"
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository"
import { ICompanyUserRepository } from "../../repositories/company-user.repository"
import { z } from 'zod'
import { IRedisCacheRepository } from "../../../../../infra/redis/redis-cache.repository"

export type AuthenticateCompanyUserRequest = {

  business_document: string,
  email: string | null,
  user_name: string,
  password: string,
  required_business_type: 'comercio' | 'empregador'
}
export class AuthenticateCompanyUserUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private companyDataRepository: ICompanyDataRepository,
    private passwordCrypto: IPasswordCrypto,
    private token: ICompanyAdminToken,
    private redisCacheRepository: IRedisCacheRepository
  ) { }

  async execute({ business_document, user_name, password, email, required_business_type }: AuthenticateCompanyUserRequest) {

    if (!business_document || !password) throw new CustomError("Credenciais incorretas", 401);

    const findBusinessInfo = await this.companyDataRepository.findByDocument(business_document);
    if (!findBusinessInfo) throw new CustomError("Credenciais incorretas", 401);

    const allowedPartnerTypes = ['comercio', 'autonomo_comercio', 'empregador_comercio'];
    if (required_business_type === 'comercio' && !allowedPartnerTypes.includes(findBusinessInfo.business_type)) {
      throw new CustomError("Este usuário não tem permissão para acessar o portal de Parceiros", 403);
    }
    const allowedEmployerTypes = ['empregador', 'empregador_comercio'];

    if (required_business_type === 'empregador' && !allowedEmployerTypes.includes(findBusinessInfo.business_type)) {
      throw new CustomError("Este usuário não tem permissão para acessar o portal de Empregadores", 403);
    }

    const isEmail = z.string().email().safeParse(email);
    let findUser: any;

    // 1. Busca o usuário
    if (isEmail.success && email) {
      findUser = await this.companyUserRepository.findByBusinessIdAndEmail(findBusinessInfo.uuid, email);
    } else {
      if (!user_name) throw new CustomError("Credenciais incorretas", 401);
      findUser = await this.companyUserRepository.findByBusinessIdAndUsername(findBusinessInfo.uuid, user_name);
    }

    if (!findUser) throw new CustomError("Credenciais incorretas", 401);

    // 2. Validações básicas antes do Redis
    if (findUser.status === "inactive") throw new CustomError("Usuário não está autorizado a acessar", 401);

    // 3. Lógica de Rate Limiting
    const redisKey = `login_lock:company_user:${findUser.uuid}`;
    const failedAttempts = await this.redisCacheRepository.get(redisKey);

    if (failedAttempts && Number(failedAttempts) >= 5) {
      throw new CustomError("Sua conta está bloqueada por 15 minutos devido a múltiplas tentativas.", 403);
    }

    // 4. Comparação de Senha
    const comparePasswordHash = await this.passwordCrypto.compare(password, findUser.password);

    if (!comparePasswordHash) {
      const newAttempts = await this.redisCacheRepository.incr(redisKey);

      // Sempre define/renova o TTL para garantir que a chave suma em 15 min após o último erro
      await this.redisCacheRepository.expire(redisKey, 900);

      const restantes = 5 - newAttempts;
      const msg = restantes > 0
        ? `Senha incorreta. Você tem mais ${restantes} tentativas.`
        : "Sua conta foi bloqueada por 15 minutos devido a múltiplas tentativas.";

      throw new CustomError(msg, restantes > 0 ? 401 : 403);
    }

    // 5. Sucesso: Limpa o rastro no Redis e gera o token
    await this.redisCacheRepository.del(redisKey);

    return {
      token: this.token.create(findUser)
    };
  }
}
