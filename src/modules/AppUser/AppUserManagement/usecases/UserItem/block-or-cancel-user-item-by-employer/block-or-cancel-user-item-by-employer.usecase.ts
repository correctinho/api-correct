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

    //find user item item by id
    const userItem = await this.appUserItemRepository.find(new Uuid(input.user_item_uuid))
    if (!userItem) throw new CustomError("User Item not found", 404)
    //check if business admin has access
    if(userItem.business_info_uuid.uuid !== input.business_info_uuid) throw new CustomError("Unauthorized acess", 403);

    //verify status
    if (userItem.status === 'cancelled' || userItem.status === 'to_be_cancelled') throw new CustomError("User item already cancelled", 400)


    if (input.status === 'blocked') {
      userItem.blockUserItem()
      userItem.changeBlockedAt(newDateF(new Date()))
      userItem.changeBlockReason(input.block_reason)

    }

    if (input.status === 'cancelled' || input.status === 'to_be_cancelled') {
      if (userItem.item_category === 'pre_pago') {
        //it must schedule a cancelling data
        await userItem.scheduleCancelling()

        userItem.changeCancelReason(input.cancel_reason)
      } else if (userItem.item_category === 'pos_pago') {
        userItem.cancelPostPaidUserItem()

        userItem.changeCancelReason(input.cancel_reason)

      }
    }

    await this.appUserItemRepository.update(userItem)

    return {
      uuid: userItem.uuid.uuid,
      user_info_uuid: userItem.user_info_uuid.uuid,
      item_uuid: userItem.item_uuid.uuid,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status,
      blocked_at: userItem.blocked_at ? userItem.blocked_at : null,
      cancelled_at: userItem.cancelled_at ? userItem.cancelled_at : null,
      cancelling_request_at: userItem.cancelling_request_at ? userItem.cancelling_request_at : null,
      block_reason: userItem.block_reason ? userItem.block_reason : null,
      cancel_reason: userItem.cancel_reason ? userItem.cancel_reason : null,
      grace_period_end_date: userItem.grace_period_end_date ? userItem.grace_period_end_date : null,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at
    }
  }
}
