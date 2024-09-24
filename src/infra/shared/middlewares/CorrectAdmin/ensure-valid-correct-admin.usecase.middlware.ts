import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { ICorrectAdminRepository } from "../../../../modules/CorrectAdmin/repositories/correct-admin.repository";

export type OutputAdminDetailDTO = {
  uuid: string,
  userName: string,
  email: string,
  isAdmin: boolean
}
export class EnsureValidCorrectAdminUsecase {
  constructor(
    private correctAdminRepository: ICorrectAdminRepository
  ) { }

  async execute(id: Uuid): Promise<OutputAdminDetailDTO> {
    const correctAdmin = await this.correctAdminRepository.find(id)

    if (!correctAdmin) throw new CustomError("Admin is not allowed to access", 401)

    return {
      uuid: correctAdmin.uuid.uuid,
      userName: correctAdmin.userName,
      email: correctAdmin.email,
      isAdmin: correctAdmin.isAdmin
    }
  }
}
