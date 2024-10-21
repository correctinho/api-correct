import { UserItemStatus } from "@prisma/client"

export type OutputFindAppUserItemDTO = {
  uuid: string
  user_info_uuid: string
  item_uuid: string
  img_url?: string
  item_name?: string
  balance: number
  status: UserItemStatus
  blocked_at?: string | null
  cancelled_at?: string | null
  cancelling_request_at?: string | null
  block_reason?: string | null
  cancel_reason?: string | null
  grace_period_end_date?: string | null
  created_at?: string | null
  updated_at?: string | null,
  Provider: {
    business_info_uuid: string | null,
    fantasy_name: string | null

  }
}
