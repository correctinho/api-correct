// Localização: /src/modules/company/repositories/implementations/partner-credit.prisma.repository.ts

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { PartnerCreditEntity, PartnerCreditProps } from "../../entities/partner-credit.entity";
import { IPartnerCreditRepository } from "../partner-credit.repository";

export class PartnerCreditPrismaRepository implements IPartnerCreditRepository {
    create(entity: PartnerCreditEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    update(entity: PartnerCreditEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    find(id: Uuid): Promise<PartnerCreditEntity> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<PartnerCreditEntity[]> {
        throw new Error("Method not implemented.");
    }

   async findAllByBusinessAccount(business_account_uuid: string): Promise<PartnerCreditEntity[]> {
        const creditsData = await prismaClient.partnerCredit.findMany({
            where: {
                business_account_uuid: business_account_uuid,
            },
            orderBy: {
                created_at: 'asc' // Ordenamos para garantir a lógica FIFO que definimos
            }
        });

        if (!creditsData || creditsData.length === 0) {
            return []; // Retorna um array vazio se nenhum crédito for encontrado.
        }

        // 2. Mapeamos os dados brutos do banco para reconstruir nossas Entidades de Domínio.
        //    Este processo é chamado de "hidratação".
        const creditEntities = creditsData.map(creditData => {
            
            // 3. Convertemos os dados crus (com strings) para o formato que a entidade espera (com Value Objects).
            const creditProps: PartnerCreditProps = {
                uuid: new Uuid(creditData.uuid),
                business_account_uuid: new Uuid(creditData.business_account_uuid),
                original_transaction_uuid: new Uuid(creditData.original_transaction_uuid),
                balance: creditData.balance,
                spent_amount: creditData.spent_amount,
                status: creditData.status,
                availability_date: creditData.availability_date,
                created_at: creditData.created_at,
                updated_at: creditData.updated_at
            };

            // 4. Usamos o método estático 'hydrate' para reconstruir a entidade de forma segura,
            //    respeitando o encapsulamento (construtor privado).
            return PartnerCreditEntity.hydrate(creditProps);
        });

        return creditEntities;
    }

    // ... outras implementações de métodos do repositório ...
}