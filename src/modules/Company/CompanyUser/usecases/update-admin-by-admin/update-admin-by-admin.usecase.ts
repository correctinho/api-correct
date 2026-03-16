import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { InputUpdateBusinessAdminByAdminDTO, OutputUpdateBusinessAdminByAdminDTO } from "./dto/update-admin-by-admin.dto";
import { CompanyUserEntity } from "../../entities/company-user.entity"; 
import { newDateF } from "../../../../../utils/date";

export class UpdateAdminByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,
  ) { }

  async execute(authUserId: string, data: InputUpdateBusinessAdminByAdminDTO): Promise<OutputUpdateBusinessAdminByAdminDTO> {
    
    // 1. BUSCAR A ENTIDADE FRESCA NO BANCO
    const adminRaw = await this.companyUserRepository.findById(authUserId);

    if (!adminRaw) {
        throw new CustomError("User not found", 404);
    }

    // Hidratação Manual
    const adminEntity = new CompanyUserEntity({
        uuid: adminRaw.uuid,
        business_info_uuid: adminRaw.business_info_uuid,
        is_admin: adminRaw.is_admin,
        document: adminRaw.document,
        name: adminRaw.name,
        email: adminRaw.email,
        user_name: adminRaw.user_name,
        password: adminRaw.password,
        function: adminRaw.function,
        permissions: adminRaw.permissions,
        status: adminRaw.status,
        business_type: adminRaw.business_type,
    });

    // Validações de Segurança
    if (!adminEntity.is_admin) throw new CustomError("Unauthorized access", 403);
    if (adminEntity.status === "inactive") throw new CustomError("User is inactive", 403);

    // 2. LÓGICA DE SENHA
    if (data.password) {
      // Verifica se a senha é igual à antiga
      const isSamePassword = await this.passwordCrypto.compare(data.password, adminEntity.password);
      
      if (isSamePassword) {
        throw new CustomError("Password must not be the same as the current one", 409);
      }

      // Atualiza a senha (faz o hash)
      await adminEntity.updatePassword(data.password);

      // --- CORREÇÃO: REGRA DE ATIVAÇÃO ---
      // Se estava pendente de senha e acabou de trocar, ativamos o usuário.
      if (adminEntity.status === 'pending_password') {
          adminEntity.changeStatus('active');
      }
      // ------------------------------------
    }

    // 3. LÓGICA DE USERNAME
    if (data.user_name && data.user_name !== adminEntity.user_name) {
      const userWithSameName = await this.companyUserRepository.findByBusinessIdAndUsername(
          adminEntity.business_info_uuid.uuid, 
          data.user_name
      );

      if (userWithSameName && userWithSameName.uuid.uuid !== adminEntity.uuid.uuid) {
          throw new CustomError("User name already registered", 409);
      }
      
      adminEntity.changeUserName(data.user_name);
    }

    // 4. ATUALIZAR DEMAIS CAMPOS
    if (data.document) adminEntity.changeDocument(data.document);
    if (data.name) adminEntity.changeName(data.name);
    if (data.function) adminEntity.changeFunction(data.function);
    if (data.permissions) adminEntity.changePermissions(data.permissions);

    // Nota: Como este é um update do PRÓPRIO admin, geralmente não permitimos
    // que ele mude o próprio status via DTO (ex: se inativar). 
    // Por isso não tem `if (data.status) adminEntity.changeStatus...`.
    // A única mudança de status permitida aqui é a automática de ativação acima.


    // 5. SALVAR
    const updatedUser = await this.companyUserRepository.updateUser(adminEntity);

    // 6. RETORNAR DTO
    return {
      uuid: updatedUser.uuid.uuid,
      business_info_uuid: updatedUser.business_info_uuid.uuid,
      is_admin: updatedUser.is_admin,
      document: updatedUser.document,
      name: updatedUser.name,
      email: updatedUser.email,
      user_name: updatedUser.user_name,
      function: updatedUser.function,
      status: updatedUser.status, // Retorna 'active'
      permissions: updatedUser.permissions,
      created_at: updatedUser.created_at ? updatedUser.created_at : newDateF(new Date()),
      updated_at: updatedUser.updated_at ? updatedUser.updated_at : newDateF(new Date())
    };
  }
}