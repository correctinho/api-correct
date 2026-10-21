import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class DeleteUserByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository
  ) { }

  async execute(user_id: string, business_info_uuid: string) {
    if (!user_id) throw new CustomError("O ID do usuário é obrigatório.", 400);

    const findUser = await this.companyUserRepository.findById(user_id);
    if (!findUser) throw new CustomError("Usuário não encontrado.", 404);

    if (findUser.business_info_uuid.uuid !== business_info_uuid) {
      throw new CustomError("Você não tem permissão para excluir este usuário.", 403);
    }

    const deleteUser = await this.companyUserRepository.inactivateByAdminById(user_id);

    return deleteUser;
  }
}
