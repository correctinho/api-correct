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
        items: { user_item_uuid: string; amount_cents: number; beneficiary_snapshot: any }[], providerTxId?: string
    ): Promise<BusinessOrder>
    findAllByBusinessAndItem(
        businessInfoUuid: string,
        itemUuid: string
    ): Promise<(BusinessOrder & { _count: { OrderItems: number } })[]>;
    findById(uuid: string): Promise<BusinessOrderWithDetails | null>;
    findByProviderTxId(txid: string): Promise<BusinessOrderWithDetails | null>;
    approveOrderTransaction(orderUuid: string): Promise<void>;
    findAll(params: { status?: string, page: number, limit: number }): Promise<{ data: BusinessOrderWithDetails[]; count: number; }>;
}
