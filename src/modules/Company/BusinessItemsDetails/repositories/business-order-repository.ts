import { BusinessInfo, BusinessOrder, BusinessOrderItem } from "@prisma/client"; // Ou sua Entidade de Domínio se estiver usando

export type BusinessOrderWithDetails = BusinessOrder & {
    OrderItems: BusinessOrderItem[];
    Business: BusinessInfo | null;
};

export interface IBusinessOrderRepository {
    create(
        businessInfoUuid: string,
        itemUuid: string,
        totalAmountCents: number,
        items: { user_item_uuid: string; amount_cents: number; beneficiary_snapshot: any }[]
    ): Promise<BusinessOrder>
    findAllByBusinessAndItem(
        businessInfoUuid: string,
        itemUuid: string
    ): Promise<BusinessOrder[]>;
    findById(uuid: string): Promise<BusinessOrderWithDetails | null>;
    approveOrderTransaction(orderUuid: string): Promise<void>;
}