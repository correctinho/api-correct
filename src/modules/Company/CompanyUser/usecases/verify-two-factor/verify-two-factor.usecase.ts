import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyAdminToken } from "../../../../../infra/shared/crypto/token/CompanyAdmin/token";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { TwoFactorAuthService } from "../../services/two-factor-auth.service";

export interface VerifyTwoFactorRequest {
  temp_token: string;
  code: string;
}

export class VerifyTwoFactorUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private token: ICompanyAdminToken,
    private twoFactorAuthService: TwoFactorAuthService
  ) {}

  async execute({ temp_token, code }: VerifyTwoFactorRequest) {
    if (!temp_token || !code) {
      throw new CustomError("Token temporário e código de verificação são obrigatórios.", 400);
    }

    const verification = await this.twoFactorAuthService.verify(temp_token, code);

    if (!verification.success) {
      if (verification.attemptsExceeded) {
        throw new CustomError(verification.error || "Número máximo de tentativas excedido. Faça login novamente.", 403);
      }
      throw new CustomError(verification.error || "Código de verificação incorreto.", 400);
    }

    const user = await this.companyUserRepository.findById(verification.userId!);
    if (!user) {
      throw new CustomError("Usuário não encontrado.", 404);
    }

    if (user.status === "inactive" || user.status === "deleted") {
      throw new CustomError("Usuário não está autorizado a acessar.", 401);
    }

    const token = this.token.create(user);

    return {
      token
    };
  }
}
