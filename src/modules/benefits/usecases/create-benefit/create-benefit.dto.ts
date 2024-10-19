import { ItemCategory, ItemType } from "@prisma/client";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";


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
