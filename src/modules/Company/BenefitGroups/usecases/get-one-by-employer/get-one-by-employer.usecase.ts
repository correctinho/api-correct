import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { AppUserInfoEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { OutputFindEmployerItemDetailsDTO } from "../../../BusinessItemsDetails/usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { OutputGetOneBenefitGroupsDTO } from "./dto/get-one-by-employer.dto";

let employeesUuids: AppUserInfoEntity[] = []
let employerItems: OutputFindEmployerItemDetailsDTO[] = []

export class GetOneBenefitGroupsByEmployerUsecase {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository


  ) { }

  async execute(uuid: string, business_info_uuid: string): Promise<OutputGetOneBenefitGroupsDTO> {
    if (!uuid) throw new CustomError("Uuid is required", 400)

    //find all
    const findOne = await this.benefitGroupsRepository.find(new Uuid(uuid))
    if (!findOne) throw new CustomError("Group not found", 404);

    if (findOne.business_info_uuid.uuid !== business_info_uuid) throw new CustomError("Unauthorized access", 403)

    await this.mapEmployees(findOne.user_info_uuids)

    await this.mapEmployerItems(findOne.employerItemDetails_uuids)


    return {
      uuid: findOne.uuid.uuid,
      value: findOne.value / 100,
      business_info_uuid: findOne.business_info_uuid.uuid,
      group_name: findOne.group_name,
      created_at: findOne.created_at,
      employees: employeesUuids.map((employee) => ({
        employee_uuid: employee.uuid.uuid,
        document: employee.document,
        full_name: employee.full_name
      })),
      benefits: employerItems.map((benefit) => ({
        benefit_uuid: benefit.uuid,
        benefit_name: benefit.Item.name
      }))
    };

  }

  private async mapEmployees(user_info_uuids: string[]) {
    for (const employee of user_info_uuids) {
      const findAppUser = await this.userInfoRepository.find(new Uuid(employee));
      if (!findAppUser) throw new CustomError("Employee not found", 409);

      employeesUuids.push(findAppUser);
    }
  }

  private async mapEmployerItems(employerItemsList: string[]) {
    const updatedEmployerItems: OutputFindEmployerItemDetailsDTO[] = []; // Novo array para armazenar os resultados

    for (const employerItem of employerItemsList) {
      const findEmployerItem = await this.employerItemsRepository.findByIdWithItems(new Uuid(employerItem));
      if (!findEmployerItem) throw new CustomError("Employer Item not found", 404);

      updatedEmployerItems.push(findEmployerItem); // Adiciona ao novo array
    }

    employerItems.length = 0; // Limpa o array original
    employerItems.push(...updatedEmployerItems); // Adiciona os resultados processados ao array original
  }
}
