import { TermAcceptance as PrismaModel } from "@prisma/client";
import { TermAcceptanceEntity } from "../entities/term-acceptance.entity";
import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";

export class TermAcceptanceMapper {
    static toDomain(raw: PrismaModel): TermAcceptanceEntity {
        return TermAcceptanceEntity.hydrate({
            app_user_info_uuid: raw.app_user_info_uuid ? new Uuid(raw.app_user_info_uuid) : null,
            company_user_uuid: raw.company_user_uuid ? new Uuid(raw.company_user_uuid) : null,
            terms_uuid: new Uuid(raw.terms_uuid),
            transaction_uuid: raw.transaction_uuid ? new Uuid(raw.transaction_uuid) : null,
            accepted_at: raw.accepted_at,
            ip_address: raw.ip_address,
            user_agent: raw.user_agent
        }, new Uuid(raw.uuid));
    }

    static toPersistence(entity: TermAcceptanceEntity): PrismaModel {
        const data = entity.toJSON();
        return {
            uuid: data.uuid,
            app_user_info_uuid: data.app_user_info_uuid ? data.app_user_info_uuid.uuid : null,
            company_user_uuid: data.company_user_uuid ? data.company_user_uuid.uuid : null,
            terms_uuid: data.terms_uuid.uuid,
            transaction_uuid: data.transaction_uuid ? data.transaction_uuid.uuid : null,
            accepted_at: data.accepted_at,
            ip_address: data.ip_address || null,
            user_agent: data.user_agent || null,
        };
    }
}