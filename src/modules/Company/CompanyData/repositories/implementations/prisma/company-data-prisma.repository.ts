import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../../utils/date";
import { CompanyDataEntity } from "../../../../CompanyData/entities/company-data.entity";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";
import { OutputGetCompanyDataDTO } from "../../../usecases/get-company-data/dto/get-company-data.dto";


export class CompanyDataPrismaRepository implements ICompanyDataRepository {
    async update(data: CompanyDataEntity): Promise<CompanyDataEntity> {
        const companyData = await prismaClient.businessInfo.update({
            where:{
                uuid: data.uuid
            },
            data:{
                fantasy_name: data.fantasy_name,
                corporate_reason: data.corporate_reason,
                document: data.document,
                classification: data.classification,
                colaborators_number: data.colaborators_number,
                phone_1: data.phone_1,
                phone_2: data.phone_2,
                business_type: data.business_type,
                email: data.email,
                status: data.status,
                updated_at: newDateF(new Date())
            }
        })

        return companyData as CompanyDataEntity
    }
    async findByEmail(email: string): Promise<CompanyDataEntity | null> {
        const companyData = await prismaClient.businessInfo.findUnique({
            where:{
                email
            }
        })

        if(!companyData) return null
        return companyData as CompanyDataEntity
    }



    async findByDocument(document: string): Promise<CompanyDataEntity | null> {
        const companyData = await prismaClient.businessInfo.findUnique({
            where: {
                document
            }
        })

        if(!companyData) return null

        return companyData as CompanyDataEntity
    }

    async findById(id: string): Promise<OutputGetCompanyDataDTO | null> {
        const companyData = await prismaClient.businessInfo.findUnique({
            where: {
                uuid: id
            },
            include:{
                Address: true
            }
        })
        if(!companyData) return null
        return {
          uuid: companyData.uuid,
          address_uuid: companyData.address_uuid,
          fantasy_name: companyData.fantasy_name,
          corporate_reason: companyData.corporate_reason,
          document: companyData.document,
          classification: companyData.classification,
          colaborators_number: companyData.colaborators_number,
          status: companyData.status,
          phone_1: companyData.phone_1,
          phone_2: companyData.phone_2,
          email: companyData.email,
          business_type: companyData.business_type,
          employer_branch: companyData.employer_branch,
          created_at: companyData.created_at,
          updated_at: companyData.updated_at,
          Address: {
              uuid: companyData.Address.uuid,
              line1: companyData.Address.line1,
              line2: companyData.Address.line2,
              line3: companyData.Address.line3,
              postal_code: companyData.Address.postal_code,
              neighborhood: companyData.Address.neighborhood,
              city: companyData.Address.city,
              state: companyData.Address.state,
              country: companyData.Address.country,
              created_at: companyData.Address.created_at,
              updated_at: companyData.Address.updated_at
          }
      };
    }



    async deleteById(id: string): Promise<void> {
        await prismaClient.businessInfo.delete({
            where: {
                uuid: id
            }
        })

    }
}
