import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { BenefitGroupsEntity } from "../../../../BenefitGroups/entities/benefit-groups.entity";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";
import { BusinessItemsDetailsEntity } from "../../../entities/businessItemDetails.entity";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { InputCreateItemAndGroupByCorrectDTO, OutputCreateItemAndGroupByCorrectDTO } from "./dto/create-item-by-correct.dto";

export class CreateEmployerItemByCorrectUsecase {
  constructor(
    private itemDetailsRepository: IBusinessItemDetailsRepository,
    private benefitsRepository: IBenefitsRepository,
    private businessRepository: ICompanyDataRepository,
  ) { }

  async execute(data: InputCreateItemAndGroupByCorrectDTO): Promise<OutputCreateItemAndGroupByCorrectDTO> {
    if (!data.cycle_end_day || data.cycle_end_day === 0) throw new CustomError("Cycle end day is required", 400);

    const itemEntityData = {
      item_uuid: new Uuid(data.item_uuid),
      business_info_uuid: new Uuid(data.business_info_uuid),
      is_active: true
    }

    const itemDetailsEntity = BusinessItemsDetailsEntity.create(itemEntityData)
    itemDetailsEntity.changeCycleEndDay(data.cycle_end_day)
    const groupEntityData = {
      group_name: 'groupData.group_name', //any name here. It does not matter at this point, because it will be changed very soon in this code
      employer_item_details_uuid: itemDetailsEntity.uuid,
      value: data.value,
      business_info_uuid: itemDetailsEntity.business_info_uuid
    }
    const groupEntity = BenefitGroupsEntity.create(groupEntityData)

    //check if item exists
    const findItem = await this.benefitsRepository.find(itemDetailsEntity.item_uuid)
    if (!findItem) throw new CustomError("Item not found", 404)

    groupEntity.changeGroupName(`Grupo ${findItem.name} (Padrão)`)
    groupEntity.changeIsDefault(true)

    //check if business exists
    const findBusiness = await this.businessRepository.findById(itemDetailsEntity.business_info_uuid.uuid)
    if (!findBusiness) throw new CustomError("Business not found", 404)


    //check if business already have item
    const findBusinessItem = await this.itemDetailsRepository.findByItemUuidAndBusinessInfo(findBusiness?.uuid, findItem?.uuid.uuid)
    if (findBusinessItem) {
      //if it does, we need to create or update a default group and update cycles days

      //set uuid to entity for upsert function in prisma
      itemDetailsEntity.changeUuid(new Uuid(findBusinessItem.uuid))
      groupEntity.changeEmployerItem(new Uuid(findBusinessItem.uuid))

      //check if this existing item has a default group
      //This situation is very unlikely to happen
      const group = findBusinessItem.BenefitGroups.find((group) => group.is_default === true && group.group_name === groupEntity.group_name)

      //set uuid to entity for upsert function in prisma
      if (group) groupEntity.changeUuid(new Uuid(group.uuid))

    }
    //create or update item and group
    const result = await this.itemDetailsRepository.createOrUpdateItemAndGroup(itemDetailsEntity, groupEntity)
    return {
      employerItem: {
        uuid: result.employerItem.uuid,
        item_uuid: result.employerItem.item_uuid,
        business_info_uuid: result.employerItem.business_info_uuid,
        cycle_end_day: result.employerItem.cycle_end_day,
        cycle_start_day: result.employerItem.cycle_start_day,
        is_active: result.employerItem.is_active,
        created_at: result.employerItem.created_at,
        updated_at: result.employerItem.updated_at
      },
      defaultGroup: {
        uuid: result.defaultGroup.uuid,
        group_name: result.defaultGroup.group_name,
        employer_item_details_uuid: result.defaultGroup.employer_item_details_uuid,
        value: result.defaultGroup.value,
        business_info_uuid: result.defaultGroup.business_info_uuid,
        is_default: result.defaultGroup.is_default,
        created_at: result.defaultGroup.created_at,
        updated_at: result.defaultGroup.updated_at,
      }
    }
  }
}
