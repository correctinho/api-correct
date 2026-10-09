import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputDismissEmployeeDTO } from "./dto/dismiss-employee.dto";

export class DismissEmployeeUsecase {
  constructor(private appUserInfoRepository: IAppUserInfoRepository) {}

  async execute(input: InputDismissEmployeeDTO): Promise<void> {
    await this.appUserInfoRepository.dismissEmployee(input.employee_uuid, input.business_info_uuid);
  }
}
