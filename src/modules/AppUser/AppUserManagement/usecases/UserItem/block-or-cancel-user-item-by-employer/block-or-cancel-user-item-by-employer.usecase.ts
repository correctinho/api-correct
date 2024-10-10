import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { newDateF } from "../../../../../../utils/date";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { AppUserItemEntity } from "../../../entities/app-user-item.entity";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputBlockOrCancelUserItemByEmployer, OutputBlockOrCancelUserItemByEmployer } from "./dto/block-or-cancel.dto";

export class BlockOrCanceluserItemByEmployerUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private itemRepository: IBenefitsRepository
  ) { }

  async execute(input: InputBlockOrCancelUserItemByEmployer): Promise<OutputBlockOrCancelUserItemByEmployer> {
    if (!input.user_item_uuid) throw new CustomError("User item uuid is required", 400)
    if (input.status === 'active') throw new CustomError("Invalid status", 400)

    //find item by id
    const userItem = await this.appUserItemRepository.find(new Uuid(input.user_item_uuid))
    if (!userItem) throw new CustomError("User Item not found", 404)

    if(userItem.business_info_uuid.uuid !== input.business_info_uuid) throw new CustomError("Unauthorized acess", 403);


    if (userItem.status === 'cancelled' || userItem.status === 'to_be_cancelled') throw new CustomError("User item already cancelled", 400)

    //find item
    const item = await this.itemRepository.find(userItem.item_uuid)
    if (!item) throw new CustomError("Item not found", 404)

    const userItemEntity = new AppUserItemEntity(userItem)

    if (input.status === 'blocked') {
      userItemEntity.blockUserItem()
      userItemEntity.changeBlockedAt(newDateF(new Date()))
      userItemEntity.changeBlockReason(input.block_reason)

    }

    if (input.status === 'cancelled' || input.status === 'to_be_cancelled') {
      if (item.item_category === 'pos_pago') {
        //it must schedule a cancelling data
        await userItemEntity.scheduleCancelling()

        userItemEntity.changeCancelReason(input.cancel_reason)
      } else if (item.item_category === 'pre_pago') {
        userItemEntity.cancelUserItem()
        userItemEntity.changeCancelledAt(newDateF(new Date()))

        userItemEntity.changeCancelReason(input.cancel_reason)

      }
    }
    await this.appUserItemRepository.update(userItemEntity)

    return {
      uuid: userItemEntity.uuid.uuid,
      user_info_uuid: userItemEntity.user_info_uuid.uuid,
      item_uuid: userItemEntity.item_uuid.uuid,
      item_name: userItemEntity.item_name,
      balance: userItemEntity.balance,
      status: userItemEntity.status,
      blocked_at: userItemEntity.blocked_at ? userItemEntity.blocked_at : null,
      cancelled_at: userItemEntity.cancelled_at ? userItemEntity.cancelled_at : null,
      cancelling_request_at: userItemEntity.cancelling_request_at ? userItemEntity.cancelling_request_at : null,
      block_reason: userItemEntity.block_reason ? userItemEntity.block_reason : null,
      cancel_reason: userItemEntity.cancel_reason ? userItemEntity.cancel_reason : null,
      grace_period_end_date: userItemEntity.grace_period_end_date ? userItemEntity.grace_period_end_date : null,
      created_at: userItemEntity.created_at,
      updated_at: userItemEntity.updated_at
    }
  }
}
