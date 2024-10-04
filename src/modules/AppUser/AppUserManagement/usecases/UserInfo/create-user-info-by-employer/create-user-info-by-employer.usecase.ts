import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { AppUserAuthSignUpEntity } from "../../../entities/app-user-auth.entity";
import { AppUserInfoEntity, AppUserInfoProps } from "../../../entities/app-user-info.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputCreateUserInfoDTO, OutputCreateUserInfoDTO } from "../create-user-info/dto/create-user-info.dto";

export class CreateAppUserInfoByEmployerUsecase {
  constructor(
    private appUserInfoRepository: IAppUserInfoRepository,
    private appUserAuthRepository: IAppUserAuthRepository
  ) { }

  async execute(data: InputCreateUserInfoDTO): Promise<OutputCreateUserInfoDTO> {
    if (!data.document) throw new CustomError("Document is required", 400)
    const userInfoEntity = await AppUserInfoEntity.create(data)
    //check if document is already registered
    const findBydocument = await this.appUserInfoRepository.findByDocumentUserInfo(userInfoEntity.document)

    if (findBydocument && findBydocument.business_info_uuids.some(uuid => uuid === data.business_info_uuid.uuid)) {
      throw new CustomError("User with this document already exists for the provided business", 409);
    }

    await this.appUserInfoRepository.createOrUpdateUserInfoByEmployer(userInfoEntity)

    return {}


  }
}
