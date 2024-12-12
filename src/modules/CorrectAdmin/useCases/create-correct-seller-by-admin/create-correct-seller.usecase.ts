import { CustomError } from "../../../../errors/custom.error"
import { InputCreateAdminDTO } from "../../correct-dto/correct.dto"
import { CorrectAdminEntity } from "../../entities/correct-admin.entity"
import { ICorrectAdminRepository } from "../../repositories/correct-admin.repository"


export class CreateCorrectSellerByAdminUseCase{
    constructor(
        private adminRepository: ICorrectAdminRepository
    ){}

    async execute(data: InputCreateAdminDTO){
        if(!data.isAdmin) throw new CustomError("Unauthorized request", 401)

        const admin = await CorrectAdminEntity.create(data)

        admin.disableAdmin()

        const adminExists = await this.adminRepository.findByUserName(data.userName)

        if(adminExists) throw new CustomError("UserName already exists", 409,)

        await this.adminRepository.create(admin)

        return {
            uuid: admin.uuid,
            name: admin.name,
            email: admin.email,
            userName: admin.userName,
            isAdmin: admin.isAdmin
        }
    }
}
