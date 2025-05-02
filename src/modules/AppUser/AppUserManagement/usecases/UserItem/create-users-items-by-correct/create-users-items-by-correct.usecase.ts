import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { AppUserItemCreateCommand } from "../../../entities/app-user-item.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputCreateAppUserItemByCorrectDTO } from "./dto/create-users-items-by-correct.dto";

export class CreateUserItemsByCorrectAdminUsecase {
  constructor(
    private appUserInfoRepository: IAppUserInfoRepository,
    private employerItemDetailsRepository: IBusinessItemDetailsRepository
  ) { }
  async execute(data: InputCreateAppUserItemByCorrectDTO) {
    //First find employer items
    const employerItems = await this.employerItemDetailsRepository.findAllEmployerItems(data.business_info_uuid)
    if (employerItems.length === 0) throw new CustomError("Employer has no items hired", 404)
      console.log("employerItems", employerItems);
    const employees = await this.appUserInfoRepository.findManyByBusiness(data.business_info_uuid)
    if (employees.length === 0) throw new CustomError("Employees not registered", 404)

    for (const employee of employees) {
      for (const item of employerItems) {
        const userItemEntityData: AppUserItemCreateCommand = {
          user_info_uuid: employee.user_info_uuid ? new Uuid(employee.user_info_uuid) : null,
          business_info_uuid: new Uuid(data.business_info_uuid),
          item_uuid: item.item_uuid ? new Uuid(item.item_uuid) : null,
          img_url: item.img_url ? item.img_url : null,
          balance: item.balance,
          item_name: item.Item.name,
          status: 'inactive',

        }
      }
    }
  }
}
