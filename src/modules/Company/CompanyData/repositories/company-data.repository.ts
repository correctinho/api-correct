import { CompanyDataEntity } from "../entities/company-data.entity";

export interface ICompanyDataRepository{
    update(data: CompanyDataEntity): Promise<CompanyDataEntity>
    findByDocument(cnpj: string): Promise<CompanyDataEntity | null>
    findById(id: string): Promise<CompanyDataEntity | null>
    findByEmail(email: string): Promise<CompanyDataEntity | null>
    deleteById(cnpj: string):Promise<void>
    findPartnersByAppUser(city: string, page: number, limit: number): Promise<any>
}
