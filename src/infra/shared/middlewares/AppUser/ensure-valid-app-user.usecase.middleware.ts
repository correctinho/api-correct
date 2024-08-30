import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { IAppUserAuthRepository } from "../../../../modules/AppUser/AppUserManagement/repositories/app-use-auth-repository";

export class EnsureValidAppUserUsecase {
    constructor(
        private appUserAutRepository: IAppUserAuthRepository
    ){}

    async execute(id: Uuid){
        const appUser = await this.appUserAutRepository.find(id)
        if(!appUser) throw new CustomError("User is not allowed to access", 401)

       return appUser
    }
}
