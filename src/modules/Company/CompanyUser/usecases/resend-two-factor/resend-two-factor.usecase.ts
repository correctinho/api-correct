import { CustomError } from "../../../../../errors/custom.error";
import { TwoFactorAuthService } from "../../services/two-factor-auth.service";

export interface ResendTwoFactorRequest {
  temp_token: string;
}

export class ResendTwoFactorUsecase {
  constructor(private twoFactorAuthService: TwoFactorAuthService) {}

  async execute({ temp_token }: ResendTwoFactorRequest) {
    if (!temp_token) {
      throw new CustomError("Token temporário é obrigatório.", 400);
    }
    return await this.twoFactorAuthService.resend(temp_token);
  }
}
