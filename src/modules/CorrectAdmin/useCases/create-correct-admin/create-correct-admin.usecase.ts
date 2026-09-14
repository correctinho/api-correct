import { CustomError } from "../../../../errors/custom.error"
import { InputCreateAdminDTO } from "../../correct-dto/correct.dto"
import { CorrectAdminEntity } from "../../entities/correct-admin.entity"
import { ICorrectAdminRepository } from "../../repositories/correct-admin.repository"


export class CreateCorrectAdminUseCase {
    constructor(
        private adminRepository: ICorrectAdminRepository
    ) { }

    async execute(data: InputCreateAdminDTO) {
        const admin = await CorrectAdminEntity.create(data)

        const adminExists = await this.adminRepository.findByUserName(data.userName)

        if (adminExists) throw new CustomError("UserName already exists", 409,)

        if (!admin.isAdmin) {
            await this.adminRepository.createCorrectUser(admin)
        } else {
            await this.adminRepository.create(admin)
        }


        return {
            uuid: admin.uuid,
            name: admin.name,
            email: admin.email,
            userName: admin.userName,
            isAdmin: admin.isAdmin
        }
    }
}