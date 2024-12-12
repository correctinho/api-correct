import { CompanyDataEntity } from "../entities/company-data.entity";
import { OutputGetPartnersByAppUserDTO } from "../usecases/get-partners-by-app-user/dto/get-partner-by-app-user.dto";

export interface ICompanyDataRepository{
    update(data: CompanyDataEntity): Promise<CompanyDataEntity>
    findByDocument(cnpj: string): Promise<CompanyDataEntity | null>
    findById(id: string): Promise<CompanyDataEntity | null>
    findByEmail(email: string): Promise<CompanyDataEntity | null>
    deleteById(cnpj: string):Promise<void>
    findPartnersByAppUser(city: string, page: number, limit: number): Promise<OutputGetPartnersByAppUserDTO[] | []>
    findPartnerDetailsByAppUser(business_info_uuid: string): Promise<any>
    findPartnersByBranch(branch_uuid: string, page: number, limit: number): Promise<any>
    findPartnerByCorrect(correct_user_uuid: string, business_info_uuid: string): Promise<{ uuid: string, business_info_uuid: string}>
}
