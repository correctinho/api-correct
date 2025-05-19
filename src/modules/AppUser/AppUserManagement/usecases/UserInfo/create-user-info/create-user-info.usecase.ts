import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { AppUserAuthSignUpEntity } from "../../../entities/app-user-auth.entity";
import { AppUserInfoEntity, AppUserInfoProps } from "../../../entities/app-user-info.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputCreateUserInfoDTO, OutputCreateUserInfoDTO } from "./dto/create-user-info.dto";

export class CreateAppUserInfoUsecase {
    constructor(
        private appUserInfoRepository: IAppUserInfoRepository,
        private benefitsRepository: IBenefitsRepository
    ) { }

    async execute(data: InputCreateUserInfoDTO): Promise<OutputCreateUserInfoDTO> {
        //check if document is already registered
        const findBydocument = await this.appUserInfoRepository.findByDocumentUserInfo(data.document)

        if (findBydocument) throw new CustomError("User Info already registered - 1", 409)
        const userInfoEntity = await AppUserInfoEntity.create(data)

        //get debit benefit
        const benefit = await this.benefitsRepository.findByName("Correct")
        if (!benefit) throw new CustomError("Benefit not found", 404)
        //set debit benefit
        userInfoEntity.setDebitBenefitUuid(benefit.uuid)

        await this.appUserInfoRepository.create(userInfoEntity)

        return { }


    }
}
