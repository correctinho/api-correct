import { CompanyUserEntity, CompanyUserProps } from "../entities/company-user.entity"
import { BusinessUserResponse } from "../companyUserDto/company-user.dto"

export interface ICompanyUserRepository{
    findUsers(business_info_uuid: string): Promise<CompanyUserEntity[] | null>
    findById(id: string): Promise<CompanyUserEntity | null>
    findByIdAuth(id: string): Promise<CompanyUserEntity | null>
    findByBusinessIdAndEmail(id: string, email: string): Promise<CompanyUserEntity | null>
    findByBusinessIdAndUsername(id: string, user_name: string | null): Promise<CompanyUserEntity | null>
    findByEmail(email: string): Promise<CompanyUserEntity | null>
    updateUser(data: CompanyUserProps): Promise<CompanyUserEntity>
    saveUser(data: CompanyUserEntity): Promise<CompanyUserEntity>
    inactivateByAdminById(user_id: string): Promise<void>
}
