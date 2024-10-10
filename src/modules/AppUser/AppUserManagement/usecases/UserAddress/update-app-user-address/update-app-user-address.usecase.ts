import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { AddressEntity } from "../../../../../../infra/shared/address/address.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IAppUserAddressRepository } from "../../../repositories/app-user-address.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputUpdateAppUserAddressDTO, OutputUpdateAppUserAddressDTO } from "./dto/update-app-user-address.dto";

export class UpdateAppUserAddressUsecase {
  constructor(
    private addressRepository: IAppUserAddressRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private userAuthRepository: IAppUserAuthRepository
  ) { }

  async execute(data: InputUpdateAppUserAddressDTO): Promise<OutputUpdateAppUserAddressDTO> {

    //find user auth
    const userAuth = await this.userAuthRepository.find(data.user_uuid)
    if (!userAuth) throw new CustomError("User auth not found", 404)

    //find user info
    const userInfo = await this.userInfoRepository.findByDocumentUserInfo(userAuth.document)
    if (!userInfo) throw new CustomError("User info not found", 404)

    if (!userInfo.address_uuid) throw new CustomError("User address not found", 404)

    //find user address
    const userAddress = await this.addressRepository.find(new Uuid(userInfo.address_uuid))
    if (!userAddress) throw new CustomError("User address not found", 404)

    const addressEntity = new AddressEntity(userAddress)
    addressEntity.changeLine1(data.line1)
    addressEntity.changeLine2(data.line2)
    addressEntity.changeLine3(data.line3)
    addressEntity.changePostalCode(data.postal_code)
    addressEntity.changeNeighborhood(data.neighborhood)
    addressEntity.changeCity(data.city)
    addressEntity.changeState(data.state)
    addressEntity.changeCountry(data.country)

    //update address
    await this.addressRepository.update(addressEntity)

    return {
      uuid: addressEntity.uuid,
      line1: addressEntity.line1,
      line2: addressEntity.line2,
      line3: addressEntity.line3,
      postal_code: addressEntity.postal_code,
      neighborhood: addressEntity.neighborhood,
      city: addressEntity.city,
      state: addressEntity.state,
      country: addressEntity.country,
      created_at: addressEntity.created_at,
      updated_at: addressEntity.updated_at

    }

  }
}
