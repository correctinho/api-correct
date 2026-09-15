import { CustomError } from "../../../../../errors/custom.error";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserAddressRepository } from "../../../AppUserManagement/repositories/app-user-address.repository";
import { IAppUserInfoRepository } from "../../../AppUserManagement/repositories/app-user-info.repository";

export class GetAppUserOverviewByAdminUsecase {
    constructor(
        private readonly appUserInfoRepository: IAppUserInfoRepository,
        private readonly appUserAddressRepository: IAppUserAddressRepository
    ) {}

    async execute(document: string): Promise<any> {
        // 1. Busca os dados pessoais
        const userInfo = await this.appUserInfoRepository.findByDocumentUserInfo(document);

        if (!userInfo) {
            throw new CustomError("Usuário não encontrado.", 404);
        }

        // 2. Busca o endereço, se existir
        let address = null;
        if (userInfo.address_uuid) {
            const addressId = new Uuid(userInfo.address_uuid);
            address = await this.appUserAddressRepository.find(addressId);
        }

        // 3. Monta o payload de overview
        return {
            user: userInfo,
            address: address ? {
                postal_code: address.postal_code,
                street: address.line1,
                number: address.line2,
                complement: address.line3,
                neighborhood: address.neighborhood,
                city: address.city,
                state: address.state,
                country: address.country
            } : null
        };
    }
}
