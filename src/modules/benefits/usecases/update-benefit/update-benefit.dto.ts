import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo"
import { ItemCategory, ItemType } from "../create-benefit/create-benefit.dto"

export interface InputUpdateBenefitDTO{
    uuid: Uuid
    name: string
    description: string
    item_type: ItemType
    item_category: ItemCategory
    parent_uuid: Uuid | null
    business_info_uuid?: Uuid | null
}

export interface OutputUpdateBenefitDTO {
    uuid: string
    name: string
    description: string
    item_type: ItemType
    item_category: ItemCategory
    parent_uuid: string | null
    business_info_uuid?: string | null
    created_at: string | null
    updated_at: string | null
}
