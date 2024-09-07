import { CompanyUserEntity, CompanyUserProps } from "../entities/company-user.entity"
import { BusinessUserResponse } from "../companyUserDto/company-user.dto"

export interface ICompanyUserRepository{
    findUsers(business_info_uuid: string): Promise<BusinessUserResponse[] | null>
    findById(id: string): Promise<BusinessUserResponse | null>
    findByIdAuth(id: string): Promise<CompanyUserEntity | null>
    findByBusinessIdAndEmail(id: string, email: string): Promise<CompanyUserEntity | null>
    findByBusinessIdAndUsername(id: string, user_name: string | null): Promise<CompanyUserEntity | null>
    findByEmail(email: string): Promise<CompanyUserEntity | null>
    updateUser(data: CompanyUserProps): Promise<BusinessUserResponse>
    saveUser(data: CompanyUserEntity): Promise<void>
    inactivateByAdminById(user_id: string): Promise<void>
}
