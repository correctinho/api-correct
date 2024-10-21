import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserAddressRepository } from "../../../repositories/app-user-address.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputGetUserAddressDTO } from "./dto/get-app-user-address.dto";

export class GetAppUserAddressUsecase {
  constructor(
    private addressRepository: IAppUserAddressRepository,
    private userInfoRepository: IAppUserInfoRepository
  ) { }

  async execute(document: string): Promise<OutputGetUserAddressDTO> {

    if (!document) throw new CustomError("User document is required", 400)

    const numberDocuments = this.processDocument(document)

    //get user info
    const userInfo = await this.userInfoRepository.findByDocumentUserInfo(numberDocuments)
    if (!userInfo) throw new CustomError("Unable to find user by document", 404)


    if (!userInfo.address_uuid) throw new CustomError("Unable to find user address", 404)

    //get user address
    const userAddress = await this.addressRepository.find(new Uuid(userInfo.address_uuid))
    if (!userAddress) throw new CustomError("Unable to find user address", 404)

    return {
      uuid: userAddress.uuid,
      line1: userAddress.line1,
      line2: userAddress.line2,
      line3: userAddress.line3,
      postal_code: userAddress.postal_code,
      neighborhood: userAddress.neighborhood,
      city: userAddress.city,
      state: userAddress.state,
      country: userAddress.country,
      created_at: userAddress.created_at,
      updated_at: userAddress.updated_at
    }
  }

  private processDocument(document: string) {
    const onlyNumbers = document.replace(/\D/g, '');
    return onlyNumbers
  }
}
