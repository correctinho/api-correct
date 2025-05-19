import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../../utils/date";
import { CompanyDataEntity } from "../../../../CompanyData/entities/company-data.entity";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";
import { OutputGetCompanyDataDTO } from "../../../usecases/get-company-data/dto/get-company-data.dto";
import { OutputGetPartnersByAppUserDTO } from "../../../usecases/get-partners-by-app-user/dto/get-partner-by-app-user.dto";


export class CompanyDataPrismaRepository implements ICompanyDataRepository {


  async update(data: CompanyDataEntity): Promise<CompanyDataEntity> {
    const companyData = await prismaClient.businessInfo.update({
      where: {
        uuid: data.uuid
      },
      data: {
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
      where: {
        email
      }
    })

    if (!companyData) return null
    return companyData as CompanyDataEntity
  }

  async findByDocument(document: string): Promise<CompanyDataEntity | null> {
    const companyData = await prismaClient.businessInfo.findUnique({
      where: {
        document
      },

    })

    if (!companyData) return null

    return companyData as CompanyDataEntity
  }

  async findById(id: string): Promise<OutputGetCompanyDataDTO | null> {
    const companyData = await prismaClient.businessInfo.findUnique({
      where: {
        uuid: id
      },
      include: {
        Address: true
      }
    })
    if (!companyData) return null
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

  async findPartnersByAppUser(city: string, page: number, limit: number): Promise<OutputGetPartnersByAppUserDTO[] | []> {
    const take = limit; // Quantidade de registros por página
    const skip = (page - 1) * limit; // Quantos registros pular

    const partners = await prismaClient.businessInfo.findMany({
      where: {
        NOT: {
          business_type: 'empregador'
        },
        Address: {
          city: city
        },
      },
      include: {
        Address: true,
        Products: {
          where: {
            is_active: true
          }
        }
      },
      skip,
      take
    })

    return partners as OutputGetPartnersByAppUserDTO[] | []
  }

  async findPartnerDetailsByAppUser(business_info_uuid: string): Promise<any> {
    const partner = await prismaClient.businessInfo.findUnique({
      where: {
        uuid: business_info_uuid
      },
      include: {
        Address: true,
        Products: {
          where: {
            is_active: true
          }
        },
        BusinessinfoBranch: {
          select: {
            branch_info_uuid: true
          }
        }
      }
    })

    if (!partner) return null

    return partner
  }

  async findPartnersByBranch(branch_uuid: string, page: number, limit: number): Promise<any> {
    const take = limit; // Quantidade de registros por página
    const skip = (page - 1) * limit; // Quantos registros pular

    const partners = await prismaClient.businessInfo.findMany({
      where: {
        BusinessinfoBranch: {
          some: { branch_info_uuid: branch_uuid }
        },
        NOT: {
          business_type: 'empregador'
        }
      },
      include: {
        Address: true,
        Products: {
          where: {
            is_active: true
          }
        }
      },
      skip,
      take
    })

    return partners
  }

  async findPartnerByCorrect(correct_user_uuid: string, business_info_uuid: string): Promise<{ uuid: string, business_info_uuid: string }> {
    const partner = await prismaClient.correctUserBusinessInfo.findFirst({
      where: {
        correct_admin_uuid: correct_user_uuid,
        business_info_uuid: business_info_uuid
      },
    })

    return partner
  }
}
