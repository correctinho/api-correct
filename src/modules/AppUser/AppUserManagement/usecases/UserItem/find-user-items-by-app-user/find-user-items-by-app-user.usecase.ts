import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { AppUserItemEntity } from "../../../entities/app-user-item.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { OutputFindAppUserItemDTO } from "./dto/find-user-item-by-appuser.dto";

export class FindAllUserItemsByAppUserUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appuserInfoRepository: IAppUserInfoRepository,

  ) { }

  async execute(user_info_uuid: string): Promise<OutputFindAppUserItemDTO[] | []> {
    if (!user_info_uuid) throw new CustomError("User Info id is required", 404)

    //check if app user exists
    const userInfo = await this.appuserInfoRepository.find(new Uuid(user_info_uuid));
    if (!userInfo) throw new CustomError("User not found", 404);

    const userItems = await this.appUserItemRepository.findAllUserItems(user_info_uuid);
    if (userItems.length === 0) return [];

    const filterItems = userItems.filter(item => item.status === 'active' || item.status === "to_be_cancelled")

    return filterItems.map((userItem: AppUserItemEntity) => {
      return {
        uuid: userItem.uuid.uuid,
        user_info_uuid: userItem.user_info_uuid.uuid,
        item_uuid: userItem.item_uuid.uuid,
        img_url: userItem.img_url ? userItem.img_url : null,
        item_name: userItem.item_name,
        balance: userItem.balance,
        status: userItem.status,
        cancelling_request_at: userItem.cancelling_request_at,
        grace_period_end_date: userItem.grace_period_end_date,
        created_at: userItem.created_at,
        updated_at: userItem.updated_at,
        Provider: {
          business_info_uuid: userItem.business_info_uuid.uuid,
          fantasy_name: userItem.fantasy_name
        }
      };
    });

  }
}
