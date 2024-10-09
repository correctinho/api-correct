import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { BenefitGroupsEntity } from "../../entities/benefit-groups.entity";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { InputCreateBenefitGroupsDTO } from "./dto/create-benefit-groups.dto"
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";

let employeesUuids: string[] = []
let employerItems: string[] = []

export class CreateBenefitGroupsUsecase {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository
  ) { }

  async execute(data: InputCreateBenefitGroupsDTO) {
    const entity = BenefitGroupsEntity.create(data)
    await this.mapEmployees(entity.user_info_uuids, data.business_info_uuid.uuid)

    await this.mapEmployerItems(entity.employerItemDetails_uuids, data.business_info_uuid.uuid)


    //create group
    // const createGroup = await this.benefitGroupsRepository.createReturn(entity)
    const createGroup = await this.benefitGroupsRepository.createOrUpdate(entity)

    return {
      uuid: createGroup.uuid.uuid,
      group_name: createGroup.group_name,
      employerItemDetails_uuids: createGroup.employerItemDetails_uuids,
      value: createGroup.value,
      user_info_uuids: createGroup.user_info_uuids,
      business_info_uuid: createGroup.business_info_uuid,
      created_at: createGroup.created_at
    }
  }

  private async mapEmployees(user_info_uuids: string[], businessInfoUuid: string) {
    for (const employee of user_info_uuids) {
      const findAppUser = await this.userInfoRepository.find(new Uuid(employee));
      if (!findAppUser) throw new CustomError("Employee not found", 409);

      const findEmployee = findAppUser.business_info_uuids.some((business_info_uuid) => business_info_uuid === businessInfoUuid);
      if (!findEmployee) throw new CustomError("App User is not an employee", 403);
      employeesUuids.push(findAppUser.uuid.uuid);
    }
  }

  private async mapEmployerItems(employerItemsList: string[], businessInfoUuid: string) {
    const updatedEmployerItems: string[] = []; // Novo array para armazenar os resultados

    for (const employerItem of employerItemsList) {
      const findEmployerItem = await this.employerItemsRepository.find(new Uuid(employerItem));
      if (!findEmployerItem) throw new CustomError("Employer Item not found", 404);

      updatedEmployerItems.push(findEmployerItem.uuid.uuid); // Adiciona ao novo array
    }

    employerItems.length = 0; // Limpa o array original
    employerItems.push(...updatedEmployerItems); // Adiciona os resultados processados ao array original
  }
}
