import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export interface OutputGetBranchDTO {
  uuid: string,
  name: string,
  benefits_uuid?: string[],
  marketing_tax: number,
  admin_tax: number,
  market_place_tax: number,
  created_at: string,
  updated_at: string
}
