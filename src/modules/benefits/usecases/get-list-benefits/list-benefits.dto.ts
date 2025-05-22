import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo"
import { ItemCategory, ItemType } from "@prisma/client";

export interface InputListCustomerDTO {}
type Benefit = {
    uuid: Uuid
    name: string
    description: string
    item_type: ItemType
    item_category: ItemCategory
    created_at: string | null
    updated_at: string | null
}

export interface OutputListBenefitDTO {
    benefits: Benefit[]
}
