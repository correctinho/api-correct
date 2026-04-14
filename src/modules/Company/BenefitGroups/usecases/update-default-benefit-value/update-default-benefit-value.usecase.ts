import { CustomError } from "../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { BenefitGroupsEntity } from "../../entities/benefit-groups.entity";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export class UpdateDefaultBenefitValueUsecase {
  constructor(
    private readonly benefitGroupsRepository: IBenefitGroupsRepository,
    private readonly businessItemDetailsRepository: IBusinessItemDetailsRepository
  ) { }

  async execute(business_info_uuid: string, item_uuid: string, newValue: number): Promise<void> {
    if (!business_info_uuid) throw new CustomError("Business info Id is required", 400);
    if (!item_uuid) throw new CustomError("Item Id is required", 400);
    if (newValue === undefined || newValue === null || newValue < 0) throw new CustomError("Valid value is required", 400);

    // Verify if the benefit exists for the company
    const employerItem = await this.businessItemDetailsRepository.findByItemUuidAndBusinessInfo(business_info_uuid, item_uuid);
    if (!employerItem) {
      throw new CustomError("Benefício não encontrado para esta empresa", 404);
    }
    // Locate the default group
    const defaultGroup = await this.benefitGroupsRepository.findDefaultByItemAndBusiness(business_info_uuid, item_uuid);

    if (!defaultGroup) {
      // Create new default group
      const newGroupEntity = BenefitGroupsEntity.create({
        group_name: `Grupo ${employerItem.Item?.name || 'Padrão'} (Padrão)`,
        employer_item_details_uuid: new Uuid(employerItem.uuid),
        value: newValue,
        is_default: true,
        business_info_uuid: new Uuid(business_info_uuid)
      });
      await this.benefitGroupsRepository.createReturn(newGroupEntity);
    } else {
      // Change value using entity logic
      defaultGroup.changeValue(newValue);

      // Persist
      await this.benefitGroupsRepository.update(defaultGroup);
    }
  }
}
