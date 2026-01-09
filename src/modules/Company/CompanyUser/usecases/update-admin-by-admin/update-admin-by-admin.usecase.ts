import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { InputUpdateBusinessAdminByAdminDTO, OutputUpdateBusinessAdminByAdminDTO } from "./dto/update-admin-by-admin.dto";
// Importe a entidade corretamente
import { CompanyUserEntity } from "../../entities/company-user.entity"; 
import { newDateF } from "../../../../../utils/date";

export class UpdateAdminByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,
  ) { }

  // Mudamos a assinatura: Recebemos o ID do admin logado (authUserId) e os dados novos (data)
  async execute(authUserId: string, data: InputUpdateBusinessAdminByAdminDTO): Promise<OutputUpdateBusinessAdminByAdminDTO> {
    
    // 1. BUSCAR A ENTIDADE FRESCA NO BANCO
    // É mais seguro buscar o usuário agora do que confiar no 'currentData' montado pelo token
    const adminRaw = await this.companyUserRepository.findById(authUserId);

    if (!adminRaw) {
        throw new CustomError("User not found", 404);
    }

    // Hidratação Manual (igual fizemos nos outros casos)
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
        // ... outros campos se houver
    });

    // Validações de Segurança
    if (!adminEntity.is_admin) throw new CustomError("Unauthorized access", 403);
    if (adminEntity.status === "inactive") throw new CustomError("User is inactive", 403);

    // 2. LÓGICA DE SENHA
    if (data.password) {
      // Verifica se a senha é igual à antiga (segurança)
      // Nota: adminEntity.password aqui é o HASH que veio do banco
      const isSamePassword = await this.passwordCrypto.compare(data.password, adminEntity.password);
      
      if (isSamePassword) {
        throw new CustomError("Password must not be the same as the current one", 409);
      }

      // O método updatePassword da entidade já deve fazer o Hash
      await adminEntity.updatePassword(data.password);
    }

    // 3. LÓGICA DE USERNAME (CORREÇÃO DO BUG)
    if (data.user_name && data.user_name !== adminEntity.user_name) {
      // Só verifica no banco se o username for DIFERENTE do atual
      const userWithSameName = await this.companyUserRepository.findByBusinessIdAndUsername(
          adminEntity.business_info_uuid.uuid, // Passa UUID como string
          data.user_name
      );

      // Se achou alguém E esse alguém não sou eu
      if (userWithSameName && userWithSameName.uuid.uuid !== adminEntity.uuid.uuid) {
          throw new CustomError("User name already registered", 409);
      }
      
      adminEntity.changeUserName(data.user_name);
    }

    // 4. ATUALIZAR DEMAIS CAMPOS
    // Usamos os setters da entidade ou verificamos nullish
    if (data.document) adminEntity.changeDocument(data.document);
    if (data.name) adminEntity.changeName(data.name);
    if (data.function) adminEntity.changeFunction(data.function);
    // Permissões: Admin geralmente não altera as próprias permissões dessa forma, mas se for regra de negócio, ok:
    if (data.permissions) adminEntity.changePermissions(data.permissions);

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
      status: updatedUser.status,
      permissions: updatedUser.permissions,
      created_at: updatedUser.created_at ? updatedUser.created_at : newDateF(new Date()),
      updated_at: updatedUser.updated_at ? updatedUser.updated_at : newDateF(new Date())
    };
  }
}