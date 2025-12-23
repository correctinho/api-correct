import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
// Importando a instância do prisma client (singleton)
import { prismaClient } from "../../../../infra/databases/prisma.config";
import { TermAcceptanceEntity } from "../../entities/term-acceptance.entity";
import { TermAcceptanceMapper } from "../../mappers/term-acceptance.mapper";
// Importando a interface específica deste repositório
import { ITermsOfAcceptanceRepository } from "../terms-of-acceptance.repository";

export class TermAcceptancePrismaRepository implements ITermsOfAcceptanceRepository {

    /**
     * Método update não é implementado pois registros de aceite são logs imutáveis.
     */
    async update(entity: TermAcceptanceEntity): Promise<void> {
        throw new Error("Method update not implemented for TermAcceptanceLogs (Immutable).");
    }

    /**
     * Método findAll não implementado por enquanto (YAGNI).
     */
    async findAll(): Promise<TermAcceptanceEntity[]> {
        throw new Error("Method findAll not implemented.");
    }

    /**
     * Busca um registro de aceite pelo UUID.
     */
    async find(uuid: Uuid): Promise<TermAcceptanceEntity | null> {
        const raw = await prismaClient.termAcceptance.findUnique({
            where: { uuid: uuid.uuid }
        });

        if (!raw) {
            return null;
        }

        // Converte do formato do banco para a Entidade de Domínio
        return TermAcceptanceMapper.toDomain(raw);
    }

    /**
     * Cria um novo registro de aceite de termos no banco de dados.
     */
    async create(entity: TermAcceptanceEntity): Promise<void> {
        // 1. Converte da Entidade de Domínio para o formato do banco (Persistence DTO)
        const persistenceData = TermAcceptanceMapper.toPersistence(entity);

        // 2. Executa o create no Prisma mapeando os campos explicitamente
        await prismaClient.termAcceptance.create({
            data: {
                uuid: persistenceData.uuid,
                app_user_info_uuid: persistenceData.app_user_info_uuid,
                company_user_uuid: persistenceData.company_user_uuid,
                terms_uuid: persistenceData.terms_uuid,
                transaction_uuid: persistenceData.transaction_uuid,
                accepted_at: persistenceData.accepted_at,
                ip_address: persistenceData.ip_address,
                user_agent: persistenceData.user_agent,
            }
        });
    }
}