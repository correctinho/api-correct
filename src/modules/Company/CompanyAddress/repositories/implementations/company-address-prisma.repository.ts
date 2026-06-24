import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CompanyAddressEntity } from "../../entities/company-address.entity";
import { ICompanyAddressRepository } from "../company-address.repository";

export class CompanyAddressPrismaRepository implements ICompanyAddressRepository {
    async update(data: CompanyAddressEntity): Promise<CompanyAddressEntity> {
        const companyAddress = await prismaClient.address.update({
            where: {
                uuid: data.uuid
            },
            data: {
                line1: data.line1,
                line2: data.line2,
                line3: data.line3,
                postal_code: data.postal_code,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                country: data.country,
                latitude: data.latitude,
                longitude: data.longitude
            }
        })

        // Hidratar o retorno do Prisma para uma Entidade
        return await CompanyAddressEntity.create({
            uuid: companyAddress.uuid,
            line1: companyAddress.line1,
            line2: companyAddress.line2,
            line3: companyAddress.line3,
            postal_code: companyAddress.postal_code,
            neighborhood: companyAddress.neighborhood,
            city: companyAddress.city,
            state: companyAddress.state,
            country: companyAddress.country,
            latitude: companyAddress.latitude,
            longitude: companyAddress.longitude
        });
    }

    async save(data: CompanyAddressEntity): Promise<CompanyAddressEntity> {
        const companyAddress = await prismaClient.address.create({
            data: {
                uuid: data.uuid,
                line1: data.line1,
                line2: data.line2,
                line3: data.line3,
                postal_code: data.postal_code,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                country: data.country,
                latitude: data.latitude,
                longitude: data.longitude
            }
        })

        // Hidratar o retorno do Prisma para uma Entidade
        return await CompanyAddressEntity.create({
            uuid: companyAddress.uuid,
            line1: companyAddress.line1,
            line2: companyAddress.line2,
            line3: companyAddress.line3,
            postal_code: companyAddress.postal_code,
            neighborhood: companyAddress.neighborhood,
            city: companyAddress.city,
            state: companyAddress.state,
            country: companyAddress.country,
            latitude: companyAddress.latitude,
            longitude: companyAddress.longitude
        });
    }

    async findById(uuid: string): Promise<CompanyAddressEntity | null> {
        const companyAddress = await prismaClient.address.findUnique({
            where: {
                uuid
            }
        })

        // Hidratando a entidade com as coordenadas caso existam no banco
        if (companyAddress) {
            return await CompanyAddressEntity.create({
                uuid: companyAddress.uuid,
                line1: companyAddress.line1,
                line2: companyAddress.line2,
                line3: companyAddress.line3,
                postal_code: companyAddress.postal_code,
                neighborhood: companyAddress.neighborhood,
                city: companyAddress.city,
                state: companyAddress.state,
                country: companyAddress.country,
                latitude: companyAddress.latitude,
                longitude: companyAddress.longitude
            });
        }

        return null;
    }
}