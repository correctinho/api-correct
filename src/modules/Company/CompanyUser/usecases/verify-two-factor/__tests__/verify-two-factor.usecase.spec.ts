import { VerifyTwoFactorUsecase } from "../verify-two-factor.usecase";
import { ICompanyUserRepository } from "../../../repositories/company-user.repository";
import { ICompanyAdminToken } from "../../../../../../infra/shared/crypto/token/CompanyAdmin/token";
import { TwoFactorAuthService } from "../../../services/two-factor-auth.service";
import { CustomError } from "../../../../../../errors/custom.error";

describe("VerifyTwoFactorUsecase", () => {
  let companyUserRepoMock: jest.Mocked<ICompanyUserRepository>;
  let tokenMock: jest.Mocked<ICompanyAdminToken>;
  let twoFactorAuthServiceMock: jest.Mocked<TwoFactorAuthService>;
  let usecase: VerifyTwoFactorUsecase;

  beforeEach(() => {
    companyUserRepoMock = {
      findById: jest.fn(),
      findByIdAuth: jest.fn(),
      findByBusinessIdAndEmail: jest.fn(),
      findByBusinessIdAndUsername: jest.fn(),
      findByEmail: jest.fn(),
      findUsers: jest.fn(),
      updateUser: jest.fn(),
      saveUser: jest.fn(),
      inactivateByAdminById: jest.fn(),
    };

    tokenMock = {
      create: jest.fn().mockReturnValue("jwt-token-123"),
      validate: jest.fn(),
    };

    twoFactorAuthServiceMock = {
      verify: jest.fn(),
      generateAndSend: jest.fn(),
      resend: jest.fn(),
    } as any;

    usecase = new VerifyTwoFactorUsecase(
      companyUserRepoMock,
      tokenMock,
      twoFactorAuthServiceMock
    );
  });

  it("should throw error if temp_token or code is missing", async () => {
    await expect(usecase.execute({ temp_token: "", code: "123456" })).rejects.toThrow(
      "Token temporário e código de verificação são obrigatórios."
    );
    await expect(usecase.execute({ temp_token: "token-1", code: "" })).rejects.toThrow(
      "Token temporário e código de verificação são obrigatórios."
    );
  });

  it("should throw error if 2FA code verification fails", async () => {
    twoFactorAuthServiceMock.verify.mockResolvedValueOnce({
      success: false,
      error: "Código incorreto. Você tem mais 2 tentativa(s).",
    });

    await expect(usecase.execute({ temp_token: "token-1", code: "999999" })).rejects.toThrow(
      "Código incorreto. Você tem mais 2 tentativa(s)."
    );
  });

  it("should throw 403 error if max attempts exceeded", async () => {
    twoFactorAuthServiceMock.verify.mockResolvedValueOnce({
      success: false,
      attemptsExceeded: true,
      error: "Número máximo de tentativas excedido.",
    });

    await expect(usecase.execute({ temp_token: "token-1", code: "999999" })).rejects.toMatchObject({
      statusCode: 403,
      message: "Número máximo de tentativas excedido.",
    });
  });

  it("should successfully verify code, find user, and return JWT token", async () => {
    twoFactorAuthServiceMock.verify.mockResolvedValueOnce({
      success: true,
      userId: "user-123",
      businessInfoUuid: "bus-456",
    });

    const mockUser: any = {
      uuid: { uuid: "user-123" },
      business_info_uuid: { uuid: "bus-456" },
      name: "Admin User",
      email: "admin@empresa.com",
      status: "active",
      is_admin: true,
      permissions: ["all"],
    };
    companyUserRepoMock.findById.mockResolvedValueOnce(mockUser);

    const result = await usecase.execute({ temp_token: "token-1", code: "123456" });

    expect(result).toEqual({ token: "jwt-token-123" });
    expect(tokenMock.create).toHaveBeenCalledWith(mockUser);
  });

  it("should throw 401 if user status is inactive", async () => {
    twoFactorAuthServiceMock.verify.mockResolvedValueOnce({
      success: true,
      userId: "user-123",
      businessInfoUuid: "bus-456",
    });

    companyUserRepoMock.findById.mockResolvedValueOnce({
      uuid: { uuid: "user-123" },
      status: "inactive",
    } as any);

    await expect(usecase.execute({ temp_token: "token-1", code: "123456" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Usuário não está autorizado a acessar.",
    });
  });
});
