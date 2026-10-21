import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { OutputCompanyUserDTO } from "../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";
import { CompanyUserEntity, CompanyUserProps } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { InputCreateCompanyUserEntityDTO } from "./dto/create-company-user-entity.dto";
import { z } from "zod";

export class CreateCompanyUserByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
  ) { }

  async execute(data: InputCreateCompanyUserEntityDTO) {
    // 1. Verifica se quem está criando é admin ativo
    if (!data.isAdmin) throw new CustomError("Apenas administradores podem criar novos usuários.", 403);
    if (data.adminStatus !== 'active') throw new CustomError("Administrador não está autorizado a criar usuários.", 403);

    // 2. Validação de permissões
    const permissions = Array.isArray(data.permissions) ? data.permissions : [];
    if (permissions.length === 0) {
      throw new CustomError("Por favor, selecione ao menos uma permissão para o usuário.", 400);
    }
    if (permissions.includes('all' as any)) {
      throw new CustomError("A permissão 'all' é exclusiva do administrador principal.", 400);
    }

    // 3. Validação de E-mail inteligente:
    // Operadores exclusivos de balcão ('sales') podem ser criados sem e-mail.
    // Qualquer usuário com permissões de gestão/finanças/RH precisa obrigatoriamente de e-mail válido para 2FA.
    const isExclusiveSales = permissions.length === 1 && permissions[0] === 'sales';
    const cleanEmail = data.email && data.email.trim() !== "" ? data.email.trim().toLowerCase() : null;

    if (!isExclusiveSales) {
      if (!cleanEmail) {
        throw new CustomError("E-mail é obrigatório para usuários com perfil de gestão/financeiro.", 400);
      }
      const emailValidation = z.string().email().safeParse(cleanEmail);
      if (!emailValidation.success) {
        throw new CustomError("Formato de e-mail inválido.", 400);
      }
    } else if (cleanEmail) {
      const emailValidation = z.string().email().safeParse(cleanEmail);
      if (!emailValidation.success) {
        throw new CustomError("Formato de e-mail inválido.", 400);
      }
    }

    // Se informou e-mail, verifica se já existe no sistema
    if (cleanEmail) {
      const findEmail = await this.companyUserRepository.findByEmail(cleanEmail);
      if (findEmail) {
        throw new CustomError("Este e-mail já está em uso por outro usuário.", 409);
      }
    }

    // 4. CPF/Documento: 100% opcional. Se vier vazio ou nulo, salva null.
    const cleanDocument = data.document && data.document.trim() !== "" ? data.document.trim() : null;

    const userDataEntity = {
      business_info_uuid: data.business_info_uuid ? new Uuid(data.business_info_uuid) : null,
      email: cleanEmail,
      document: cleanDocument,
      name: data.name ? data.name : null,
      is_admin: false,
      permissions: permissions,
      user_name: data.user_name ? data.user_name.trim() : null,
      password: data.password ? data.password : null,
      function: data.function ? data.function : null,
      status: data.status,
    };

    const userEntity = await CompanyUserEntity.create(userDataEntity);

    if (!userEntity.user_name) throw new CustomError("Nome de usuário é obrigatório.", 400);

    // 5. Verifica se o username já existe nesta empresa
    const findByUsername = await this.companyUserRepository.findByBusinessIdAndUsername(
      userEntity.business_info_uuid.uuid,
      userEntity.user_name
    );
    if (findByUsername) throw new CustomError("Nome de usuário já cadastrado nesta empresa.", 409);

    userEntity.changeIsAdmin(false);
    userEntity.changeStatus('active');

    const user = await this.companyUserRepository.saveUser(userEntity);

    return {
      uuid: user.uuid.uuid,
      business_info_uuid: user.business_info_uuid.uuid,
      email: user.email,
      document: user.document,
      name: user.name,
      is_admin: user.is_admin,
      permissions: user.permissions,
      user_name: user.user_name,
      function: user.function,
      status: user.status,
      admin: {
        isAdmin: data.isAdmin,
        status: data.adminStatus
      }
    };
  }
}
