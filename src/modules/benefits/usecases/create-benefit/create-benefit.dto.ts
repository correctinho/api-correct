import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";

export type ItemType = 'gratuito' | 'programa' | 'produto';
export type ItemCategory = 'pos_pago' | 'pre_pago' | 'especiais_correct';

export interface InputCreateBenefitDto {
    name: string
    description: string
    item_type: ItemType
    item_category: ItemCategory
    parent_uuid: string | null
    business_info_uuid?: string| null
}

export interface OutputCreateBenefitDto {
    uuid: string
    name: string
    description: string
    item_type: ItemType
    item_category: ItemCategory
    parent_uuid: string | null
    business_info_uuid: string
}
