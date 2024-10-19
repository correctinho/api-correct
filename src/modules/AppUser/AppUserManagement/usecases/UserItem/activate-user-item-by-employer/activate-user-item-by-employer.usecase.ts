import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { IBenefitGroupsRepository } from "../../../../../Company/BenefitGroups/repositories/benefit-groups.repository";
import { AppUserItemEntity } from "../../../entities/app-user-item.entity";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputActivateUserItemByEmployer, OutputActivateUserItemByEmployer } from "./dto/activate-user-item.dto";

export class ActivateUserItemByEmployerUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,


    private groupsRepository: IBenefitGroupsRepository
  ) { }

  async execute(input: InputActivateUserItemByEmployer): Promise<OutputActivateUserItemByEmployer> {
    //find item
    // const employeeItem = await this.appUserItemRepository.findItemByEmployeeAndBusiness(input.user_info_uuid, input.business_info_uuid, input.item_uuid)
    const employeeItem = await this.appUserItemRepository.findByItemUuidAndUserInfo(input.user_info_uuid, input.item_uuid)
    if (!employeeItem) throw new CustomError("Employee item not found", 404);

    const employeeItemEntity = new AppUserItemEntity(employeeItem)
    //console.log({employeeItemEntity})
    //Check if business admin is allowed to manipulate item
    if (employeeItem.business_info_uuid.uuid !== input.business_info_uuid) throw new CustomError("Unauthorized access", 403);

    //if it is alrady active, throw an error
    if (employeeItemEntity.status === 'active') throw new CustomError("Employee item is already active", 400)

    //make sure that default value is set according to group value
    employeeItemEntity.changeBalance(employeeItemEntity.group_value)
    //set status to active
    employeeItemEntity.activateStatus()

    //if different group was selected, to be changed
    if (input.group_uuid) {
      const group = await this.groupsRepository.find(new Uuid(input.group_uuid))
      if (!group) throw new CustomError("Group not found", 404)

      employeeItemEntity.changeGroupUuid(group.uuid)
      employeeItemEntity.changeGroupValue(group.value)
    }

    if (input.balance) {
      //if balance is inserted, change balance
      employeeItemEntity.changeBalance(input.balance)
    }

    if (employeeItem.status === 'cancelled' || employeeItem.status === 'to_be_cancelled') throw new CustomError("Can not activate a cancelled item", 400)


    await this.appUserItemRepository.update(employeeItemEntity)

    return {
      uuid: employeeItemEntity.uuid.uuid,
      user_info_uuid: employeeItemEntity.user_info_uuid.uuid,
      business_info_uuid: employeeItemEntity.business_info_uuid.uuid,
      item_uuid: employeeItemEntity.item_uuid.uuid,
      item_name: employeeItemEntity.item_name,
      balance: employeeItemEntity.balance,
      status: employeeItemEntity.status,
      created_at: employeeItemEntity.created_at,
      updated_at: employeeItemEntity.updated_at
    }
  }
}
