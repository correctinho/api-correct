import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo"
import { ItemCategory, ItemType } from "@prisma/client";

export interface InputGetBenefitsDto {
    uuid: Uuid
}

export interface OutputGetBenefitsDTO {
  uuid: Uuid,
  Item: ItemDTO,
  Branch: BranchDTO[]
}
export type ItemDTO = {
    uuid: Uuid
    name: string
    description: string
    item_type: ItemType
    item_category: ItemCategory
    created_at: string | null
    updated_at: string | null
}

export type BranchDTO = {
  branch_uuid: string,
  name: string,
  marketing_tax: number,
  admin_tax: number,
  market_place_tax: number,
  created_at: string,
  updated_at: string
}
