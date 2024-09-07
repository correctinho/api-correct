import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { OutputFindAppUserItemByIdDTO } from "./dto/find-user-item.dto";

export class FindUserItemByIdUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository
  ) { }

  async execute(user_item_uuid: string): Promise<OutputFindAppUserItemByIdDTO> {
    if (!user_item_uuid) throw new CustomError("User Item id is required", 400)
    const userItem = await this.appUserItemRepository.find(new Uuid(user_item_uuid))
    if (!userItem) throw new CustomError("User Item not found", 404)

      return {
      uuid: userItem.uuid.uuid,
      user_info_uuid: userItem.user_info_uuid.uuid,
      item_uuid: userItem.item_uuid.uuid,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status,
      blocked_at: userItem.blocked_at ? userItem.blocked_at : null,
      cancelled_at: userItem.cancelled_at ? userItem.cancelled_at : null ,
      cancelling_request_at: userItem.cancelling_request_at ? userItem.cancelling_request_at : null,
      block_reason: userItem.block_reason ? userItem.block_reason : null,
      cancel_reason: userItem.cancel_reason ? userItem.cancel_reason : null,
      grace_period_end_date: userItem.grace_period_end_date ? userItem.grace_period_end_date : null,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at
    }
  }
}
