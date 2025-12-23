import { PrismaClient } from "@prisma/client";
import { prismaClient } from "../../../../infra/databases/prisma.config";
import { ITermsOfServiceRepository } from "../terms-of-service.repository";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { TermsOfServiceEntity } from "../../entities/terms-of-service.entity";
import { TermsOfServiceMapper } from "../../mappers/terms-of-service.mapper";
import { TermsTypeEnum } from "../../entities/enums/terms-type.enum";

export class TermsOfServicePrismaRepository implements ITermsOfServiceRepository {
    create(entity: TermsOfServiceEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    update(entity: TermsOfServiceEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<TermsOfServiceEntity[]> {
        throw new Error("Method not implemented.");
    }

    async find(uuid: Uuid): Promise<TermsOfServiceEntity | null> {
        const raw = await prismaClient.termsOfService.findUnique({
            where: { uuid: uuid.uuid }
        });
        if (!raw) return null;
        return TermsOfServiceMapper.toDomain(raw);
    }

    async upsert(entity: TermsOfServiceEntity): Promise<void> {
        const persistenceData = TermsOfServiceMapper.toPersistence(entity);
        await prismaClient.termsOfService.upsert({
            where: { uuid: persistenceData.uuid },
            create: persistenceData,
            update: persistenceData
        });
    }

    // Implementação do método específico
    async findActiveByType(type: TermsTypeEnum): Promise<TermsOfServiceEntity | null> {
        // Converte o enum de domínio para o formato que o Prisma espera na query
        const prismaType = TermsOfServiceMapper.mapDomainEnumToPrisma(type);

        const raw = await prismaClient.termsOfService.findFirst({
            where: {
                type: prismaType,
                is_active: true
            },
            // Opcional: se houver mais de um ativo por erro, pega o mais recente
            orderBy: { created_at: 'desc' } 
        });

        if (!raw) return null;
        return TermsOfServiceMapper.toDomain(raw);
    }

    async deactivateAllOlderVersions(type: TermsTypeEnum): Promise<void> {
        // 1. Converte o Enum de domínio para o formato que o banco entende
        const prismaType = TermsOfServiceMapper.mapDomainEnumToPrisma(type);

        // 2. Executa o update em massa no banco
        // SQL equivalente: UPDATE terms_of_service SET is_active = false WHERE type = '...' AND is_active = true;
        await prismaClient.termsOfService.updateMany({
            where: {
                type: prismaType, // Filtra apenas pelo tipo especificado (ex: só os B2C)
                is_active: true   // Filtra apenas os que estão atualmente ativos
            },
            data: {
                is_active: false,       // Marca como inativo
                updated_at: new Date()  // Atualiza o carimbo de tempo
            }
        });
        
        // O método updateMany retorna um count de linhas afetadas, 
        // mas a interface pede retorno void, então não precisamos retornar nada.
    }

    // Implementar outros métodos da interface RepositoryInterface se houver (delete, findAll, etc.)
}