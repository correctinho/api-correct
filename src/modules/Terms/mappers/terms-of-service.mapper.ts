import { TermsOfService as PrismaModel, TermsType as PrismaTermsType } from "@prisma/client";
import { TermsOfServiceEntity } from "../entities/terms-of-service.entity";
import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { TermsTypeEnum } from "../entities/enums/terms-type.enum";
import { CustomError } from "../../../errors/custom.error";

export class TermsOfServiceMapper {
    // Converte do Banco (Prisma) para o Domínio (Entity)
    static toDomain(raw: PrismaModel): TermsOfServiceEntity {
        return TermsOfServiceEntity.hydrate({
            version: raw.version,
            content: raw.content,
            // Conversão manual do Enum do Prisma para o Enum de Domínio
            type: TermsOfServiceMapper.mapPrismaEnumToDomain(raw.type),
            is_active: raw.is_active,
            created_at: raw.created_at,
            updated_at: raw.updated_at
        }, new Uuid(raw.uuid));
    }

    // Converte do Domínio (Entity) para o Banco (Prisma persistence format)
    static toPersistence(entity: TermsOfServiceEntity): PrismaModel {
        const data = entity.toJSON();
        return {
            uuid: data.uuid,
            version: data.version,
            content: data.content,
            // Conversão manual do Enum de Domínio para o Enum do Prisma
            type: TermsOfServiceMapper.mapDomainEnumToPrisma(data.type),
            is_active: data.is_active,
            created_at: data.created_at || new Date(),
            updated_at: data.updated_at || new Date()
        };
    }

    // Helpers para mapeamento de Enums
    private static mapPrismaEnumToDomain(prismaType: PrismaTermsType): TermsTypeEnum {
        switch (prismaType) {
            // Assumindo que os nomes no banco são iguais aos do domínio
            case 'B2C_APP_USER_EULA': return TermsTypeEnum.B2C_APP_USER_EULA;
            case 'B2B_BUSINESS_MSA': return TermsTypeEnum.B2B_BUSINESS_MSA;
            case 'PRIVACY_POLICY': return TermsTypeEnum.PRIVACY_POLICY;
            default: throw new CustomError(`Tipo de termo desconhecido no banco: ${prismaType}`, 500);
        }
    }

    static mapDomainEnumToPrisma(domainType: TermsTypeEnum): PrismaTermsType {
         // O cast 'as PrismaTermsType' funciona se as strings forem idênticas. 
         // Se não forem, precisa de um switch case reverso aqui também.
         return domainType as unknown as PrismaTermsType;
    }
}