import { CompanyUserPrismaRepository } from "../../repositories/implementations/company-user.prisma.repository";
import { CompanyAdminJWToken } from "../../../../../infra/shared/crypto/token/CompanyAdmin/jwt.token";
import { RedisCacheRepository } from "../../../../../infra/redis/redis-cache.repository";
import { TitanMailProvider } from "../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { TwoFactorAuthService } from "../../services/two-factor-auth.service";
import { VerifyTwoFactorUsecase } from "./verify-two-factor.usecase";
import { VerifyTwoFactorController } from "./verify-two-factor.controller";

const companyUserRepository = new CompanyUserPrismaRepository();
const tokenGenerated = new CompanyAdminJWToken();
const redisCacheRepository = new RedisCacheRepository();
const titanMailProvider = new TitanMailProvider();
const twoFactorAuthService = new TwoFactorAuthService(redisCacheRepository, titanMailProvider);

const verifyTwoFactorUsecase = new VerifyTwoFactorUsecase(
  companyUserRepository,
  tokenGenerated,
  twoFactorAuthService
);

const verifyTwoFactorController = new VerifyTwoFactorController(verifyTwoFactorUsecase);

export { verifyTwoFactorController, verifyTwoFactorUsecase };
