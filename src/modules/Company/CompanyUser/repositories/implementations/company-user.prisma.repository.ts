import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CompanyUserEntity } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../company-user.repository";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export class CompanyUserPrismaRepository implements ICompanyUserRepository {
  
  // Helper privado para mapear o retorno do Prisma para o objeto (Workaround sem hydrate)
  private mapPrismaToEntity(user: any): CompanyUserEntity {
      return {
        uuid: new Uuid(user.uuid),
        business_info_uuid: new Uuid(user.business_info_uuid),
        is_admin: user.is_admin,
        document: user.document,
        name: user.name,
        email: user.email,
        user_name: user.user_name,
        password: user.password,
        function: user.function,
        status: user.status,
        permissions: user.permissions,
        created_at: user.created_at,
        updated_at: user.updated_at,
        business_type: user.BusinessInfo?.business_type,
        // Mapeando os campos de reset
        password_reset_token: user.password_reset_token,
        password_reset_expires_at: user.password_reset_expires_at
      } as unknown as CompanyUserEntity
  }

  async findByIdAuth(id: string): Promise<CompanyUserEntity | null> {
    const companyUser = await prismaClient.businessUser.findUnique({ where: { uuid: id } })
    if (!companyUser) return null
    return this.mapPrismaToEntity(companyUser);
  }

  async findByBusinessIdAndUsername(id: string, user_name: string | null): Promise<CompanyUserEntity | null> {
    const companyUser = await prismaClient.businessUser.findFirst({ where: { business_info_uuid: id, user_name } })
    if (!companyUser) return null
    return this.mapPrismaToEntity(companyUser);
  }

  async findByBusinessIdAndEmail(id: string, email: string): Promise<CompanyUserEntity | null> {
    const companyUser = await prismaClient.businessUser.findUnique({ where: { business_info_uuid: id, email } })
    if (!companyUser) return null
    return this.mapPrismaToEntity(companyUser);
  }

  async findById(id: string): Promise<CompanyUserEntity | null> {
    const companyUser = await prismaClient.businessUser.findUnique({ where: { uuid: id } })
    if (!companyUser) return null
    return this.mapPrismaToEntity(companyUser);
  }

  async findByEmail(email: string): Promise<CompanyUserEntity | null> {
    const companyUser = await prismaClient.businessUser.findUnique({ where: { email }, include: { BusinessInfo: true } })
    if (!companyUser) return null
    return this.mapPrismaToEntity(companyUser);
  }

  async findUsers(business_info_uuid: string): Promise<CompanyUserEntity[] | []> {
    const companyUsers = await prismaClient.businessUser.findMany({
      where: { business_info_uuid, is_admin: false }
    })
    return companyUsers.map(user => this.mapPrismaToEntity(user));
  }

  async updateUser(data: CompanyUserEntity): Promise<CompanyUserEntity> {
    const companyUser = await prismaClient.businessUser.update({
      where: { uuid: data.uuid.uuid },
      data: {
        document: data.document,
        is_admin: data.is_admin,
        name: data.name,
        email: data.email,
        user_name: data.user_name,
        function: data.function,
        permissions: data.permissions,
        password: data.password ? data.password : undefined,
        status: data.status,
        updated_at: data.updated_at,
        // Atualiza campos de token
        password_reset_token: data.password_reset_token,
        password_reset_expires_at: data.password_reset_expires_at
      }
    })
    return this.mapPrismaToEntity(companyUser);
  }

  async saveUser(data: CompanyUserEntity): Promise<CompanyUserEntity> {
    const companyUser = await prismaClient.businessUser.create({
      data: {
        uuid: data.uuid.uuid,
        business_info_uuid: data.business_info_uuid.uuid,
        is_admin: data.is_admin,
        document: data.document,
        name: data.name,
        email: data.email,
        user_name: data.user_name,
        password: data.password,
        function: data.function,
        permissions: data.permissions,
        status: data.status,
        created_at: data.created_at,
        
      }
    })
    return this.mapPrismaToEntity(companyUser);
  }

  async inactivateByAdminById(user_uuid: string): Promise<void> {
    await prismaClient.businessUser.update({
      where: { uuid: user_uuid },
      data: { status: 'deleted' }
    })
  }
}