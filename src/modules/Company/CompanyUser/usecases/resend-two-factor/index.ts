import { RedisCacheRepository } from "../../../../../infra/redis/redis-cache.repository";
import { TitanMailProvider } from "../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { TwoFactorAuthService } from "../../services/two-factor-auth.service";
import { ResendTwoFactorUsecase } from "./resend-two-factor.usecase";
import { ResendTwoFactorController } from "./resend-two-factor.controller";

const redisCacheRepository = new RedisCacheRepository();
const titanMailProvider = new TitanMailProvider();
const twoFactorAuthService = new TwoFactorAuthService(redisCacheRepository, titanMailProvider);

const resendTwoFactorUsecase = new ResendTwoFactorUsecase(twoFactorAuthService);
const resendTwoFactorController = new ResendTwoFactorController(resendTwoFactorUsecase);

export { resendTwoFactorController, resendTwoFactorUsecase };
