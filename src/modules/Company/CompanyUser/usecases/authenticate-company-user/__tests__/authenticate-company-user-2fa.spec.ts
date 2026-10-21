import { AuthenticateCompanyUserUsecase } from "../authenticate-company-user.usecase";
import { ICompanyUserRepository } from "../../../repositories/company-user.repository";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";
import { IPasswordCrypto } from "../../../../../../infra/shared/crypto/password.crypto";
import { ICompanyAdminToken } from "../../../../../../infra/shared/crypto/token/CompanyAdmin/token";
import { IRedisCacheRepository } from "../../../../../../infra/redis/redis-cache.repository";
import { TwoFactorAuthService } from "../../../services/two-factor-auth.service";
import { CustomError } from "../../../../../../errors/custom.error";

describe("AuthenticateCompanyUserUsecase - 2FA Bifurcation", () => {
  let companyUserRepoMock: jest.Mocked<ICompanyUserRepository>;
  let companyDataRepoMock: jest.Mocked<ICompanyDataRepository>;
  let passwordCryptoMock: jest.Mocked<IPasswordCrypto>;
  let tokenMock: jest.Mocked<ICompanyAdminToken>;
  let redisMock: jest.Mocked<IRedisCacheRepository>;
  let twoFactorServiceMock: jest.Mocked<TwoFactorAuthService>;
  let usecase: AuthenticateCompanyUserUsecase;

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

    companyDataRepoMock = {
      findByDocument: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    passwordCryptoMock = {
      compare: jest.fn().mockResolvedValue(true),
      hash: jest.fn(),
    };

    tokenMock = {
      create: jest.fn().mockReturnValue("direct-jwt-token"),
      validate: jest.fn(),
    };

    redisMock = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(undefined),
    };

    twoFactorServiceMock = {
      generateAndSend: jest.fn().mockResolvedValue({
        require_2fa: true,
        temp_token: "temp-uuid-123",
        email_masked: "us***r@empresa.com",
        expires_in_seconds: 600,
      }),
      verify: jest.fn(),
      resend: jest.fn(),
    } as any;

    usecase = new AuthenticateCompanyUserUsecase(
      companyUserRepoMock,
      companyDataRepoMock,
      passwordCryptoMock,
      tokenMock,
      redisMock,
      twoFactorServiceMock
    );
  });

  const mockBusiness = {
    uuid: "bus-uuid-1",
    business_type: "comercio" as any,
    email: "empresa_matriz@comercio.com",
    fantasy_name: "Loja Teste",
  };

  it("should bypass 2FA and return direct token for exclusive 'sales' POS operator", async () => {
    companyDataRepoMock.findByDocument.mockResolvedValueOnce(mockBusiness as any);

    const mockSalesUser: any = {
      uuid: "user-sales-1",
      user_name: "caixa01",
      password: "hashed_password",
      status: "active",
      is_admin: false,
      permissions: ["sales"],
    };

    companyUserRepoMock.findByBusinessIdAndUsername.mockResolvedValueOnce(mockSalesUser);

    const result = await usecase.execute({
      business_document: "12345678000199",
      user_name: "caixa01",
      email: null,
      password: "password123",
      required_business_type: "comercio",
    });

    expect(result).toEqual({ token: "direct-jwt-token" });
    expect(twoFactorServiceMock.generateAndSend).not.toHaveBeenCalled();
    expect(tokenMock.create).toHaveBeenCalledWith(mockSalesUser);
  });

  it("should trigger 2FA and use user email from DB when logging in with user_name for admin", async () => {
    companyDataRepoMock.findByDocument.mockResolvedValueOnce(mockBusiness as any);

    const mockAdminUser: any = {
      uuid: "user-admin-1",
      user_name: "admin_geral",
      name: "João Administrador",
      email: "joao.admin@loja.com",
      password: "hashed_password",
      status: "active",
      is_admin: true,
      permissions: ["all"],
    };

    companyUserRepoMock.findByBusinessIdAndUsername.mockResolvedValueOnce(mockAdminUser);

    const result = await usecase.execute({
      business_document: "12345678000199",
      user_name: "admin_geral",
      email: null,
      password: "password123",
      required_business_type: "comercio",
    });

    expect(result).toEqual({
      require_2fa: true,
      temp_token: "temp-uuid-123",
      email_masked: "us***r@empresa.com",
      expires_in_seconds: 600,
    });

    expect(twoFactorServiceMock.generateAndSend).toHaveBeenCalledWith({
      userId: "user-admin-1",
      businessInfoUuid: "bus-uuid-1",
      email: "joao.admin@loja.com",
      userName: "admin_geral",
      name: "João Administrador",
    });
    expect(tokenMock.create).not.toHaveBeenCalled();
  });

  it("should fallback to company email if admin user has no email in DB", async () => {
    companyDataRepoMock.findByDocument.mockResolvedValueOnce(mockBusiness as any);

    const mockUserWithoutEmail: any = {
      uuid: "user-admin-no-mail",
      user_name: "admin_legado",
      name: "Admin Legado",
      email: null,
      password: "hashed_password",
      status: "active",
      is_admin: true,
      permissions: ["all"],
    };

    companyUserRepoMock.findByBusinessIdAndUsername.mockResolvedValueOnce(mockUserWithoutEmail);

    const result = await usecase.execute({
      business_document: "12345678000199",
      user_name: "admin_legado",
      email: null,
      password: "password123",
      required_business_type: "comercio",
    });

    expect(result).toHaveProperty("require_2fa", true);
    expect(twoFactorServiceMock.generateAndSend).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "empresa_matriz@comercio.com",
      })
    );
  });

  it("should throw error if neither user nor company has an email", async () => {
    companyDataRepoMock.findByDocument.mockResolvedValueOnce({
      ...mockBusiness,
      email: null as any,
    } as any);

    companyUserRepoMock.findByBusinessIdAndUsername.mockResolvedValueOnce({
      uuid: "user-no-mail",
      user_name: "gestor",
      email: null,
      password: "hashed_password",
      status: "active",
      is_admin: true,
      permissions: ["all"],
    } as any);

    await expect(
      usecase.execute({
        business_document: "12345678000199",
        user_name: "gestor",
        email: null,
        password: "password123",
        required_business_type: "comercio",
      })
    ).rejects.toThrow("Nenhum e-mail de segurança encontrado para envio do código de verificação.");
  });
});
