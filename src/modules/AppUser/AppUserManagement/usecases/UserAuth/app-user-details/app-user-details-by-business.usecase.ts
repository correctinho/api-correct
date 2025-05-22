import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";

export class AppUserDetailsUsecase {
    constructor(
        private appUserRepository: IAppUserAuthRepository
    ) { }

    async execute(uuid: string) {

        if(!uuid) throw new CustomError("User Id is required", 400)

        const findUser = await this.appUserRepository.find(new Uuid(uuid))
        if (!findUser) throw new CustomError("User not found", 404)


        return findUser
    }
}
