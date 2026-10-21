import { CreateCompanyUserByAdminUsecase } from "../create-company-user-by-admin.usecase";
import { ICompanyUserRepository } from "../../../repositories/company-user.repository";
import { CustomError } from "../../../../../../errors/custom.error";

describe("CreateCompanyUserByAdminUsecase", () => {
  let companyUserRepoMock: jest.Mocked<ICompanyUserRepository>;
  let usecase: CreateCompanyUserByAdminUsecase;

  beforeEach(() => {
    companyUserRepoMock = {
      findById: jest.fn(),
      findByIdAuth: jest.fn(),
      findByBusinessIdAndEmail: jest.fn(),
      findByBusinessIdAndUsername: jest.fn(),
      findByEmail: jest.fn(),
      findUsers: jest.fn(),
      updateUser: jest.fn(),
      saveUser: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      inactivateByAdminById: jest.fn(),
    };

    usecase = new CreateCompanyUserByAdminUsecase(companyUserRepoMock);
  });

  const baseAdminData: any = {
    isAdmin: true,
    adminStatus: "active",
    business_info_uuid: "11111111-2222-4333-8444-555555555555",
    name: "Novo Colaborador",
    user_name: "colab01",
    password: "Password@123",
    status: "active",
  };

  it("should throw error if admin is not authorized or inactive", async () => {
    await expect(
      usecase.execute({ ...baseAdminData, isAdmin: false })
    ).rejects.toThrow("Apenas administradores podem criar novos usuários.");

    await expect(
      usecase.execute({ ...baseAdminData, adminStatus: "inactive" })
    ).rejects.toThrow("Administrador não está autorizado a criar usuários.");
  });

  it("should throw error if permissions are empty or include 'all'", async () => {
    await expect(
      usecase.execute({ ...baseAdminData, permissions: [] })
    ).rejects.toThrow("Por favor, selecione ao menos uma permissão para o usuário.");

    await expect(
      usecase.execute({ ...baseAdminData, permissions: ["all" as any] })
    ).rejects.toThrow("A permissão 'all' é exclusiva do administrador principal.");
  });

  it("should require email for non-sales permissions (e.g. finances, benefits)", async () => {
    await expect(
      usecase.execute({
        ...baseAdminData,
        permissions: ["finances"],
        email: null,
      })
    ).rejects.toThrow("E-mail é obrigatório para usuários com perfil de gestão/financeiro.");

    await expect(
      usecase.execute({
        ...baseAdminData,
        permissions: ["finances"],
        email: "invalid-email-format",
      })
    ).rejects.toThrow("Formato de e-mail inválido.");
  });

  it("should successfully create user with non-sales permission when valid email is provided", async () => {
    companyUserRepoMock.findByEmail.mockResolvedValueOnce(null);
    companyUserRepoMock.findByBusinessIdAndUsername.mockResolvedValueOnce(null);

    const result = await usecase.execute({
      ...baseAdminData,
      permissions: ["finances"],
      email: "financeiro@empresa.com",
      document: "", // CPF vazio
    });

    expect(result.email).toBe("financeiro@empresa.com");
    expect(result.document).toBeNull();
    expect(result.permissions).toEqual(["finances"]);
    expect(companyUserRepoMock.saveUser).toHaveBeenCalled();
  });

  it("should allow creating exclusive 'sales' POS operator WITHOUT email", async () => {
    companyUserRepoMock.findByBusinessIdAndUsername.mockResolvedValueOnce(null);

    const result = await usecase.execute({
      ...baseAdminData,
      user_name: "caixa_loja",
      permissions: ["sales"],
      email: null,
      document: null,
    });

    expect(result.email).toBeNull();
    expect(result.document).toBeNull();
    expect(result.user_name).toBe("caixa_loja");
    expect(result.permissions).toEqual(["sales"]);
    expect(companyUserRepoMock.saveUser).toHaveBeenCalled();
  });

  it("should throw error if email is already registered by another user", async () => {
    companyUserRepoMock.findByEmail.mockResolvedValueOnce({
      uuid: { uuid: "another-user" },
    } as any);

    await expect(
      usecase.execute({
        ...baseAdminData,
        permissions: ["finances"],
        email: "existente@empresa.com",
      })
    ).rejects.toThrow("Este e-mail já está em uso por outro usuário.");
  });
});
