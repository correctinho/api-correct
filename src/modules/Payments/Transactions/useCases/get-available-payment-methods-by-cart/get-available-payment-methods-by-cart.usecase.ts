import { UserItemStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { ICartRepository } from "../../../../Ecommerce/Carts/repositories/cart.repository";
import { AvailableUserItemDetails, InputGetCartPaymentMethodsDTO, OutputGetCartPaymentMethodsDTO } from "../../transactions-dto/transactions.dto";

export class GetAvailablePaymentMethodsByCartUsecase {
  constructor(
    private cartRepository: ICartRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private businessInfoRepository: ICompanyDataRepository
  ) {}

  async execute(data: InputGetCartPaymentMethodsDTO): Promise<OutputGetCartPaymentMethodsDTO> {
    if (!data.cart_uuid) {
      throw new CustomError("ID do carrinho é obrigatório", 400);
    }

    const cart = await this.cartRepository.findCartById(new Uuid(data.cart_uuid));
    if (!cart) {
      throw new CustomError("Carrinho não encontrado", 404);
    }

    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(cart.business_info_uuid.uuid);
    if (!partnerConfig) {
      throw new CustomError("Configuração do parceiro não encontrada", 404);
    }

    const businessInfo = await this.businessInfoRepository.findById(cart.business_info_uuid.uuid);
    if (!businessInfo) {
      throw new CustomError("Dados do estabelecimento não encontrados", 404);
    }

    const userItems = await this.userItemRepository.findAllUserItems(data.appUserInfoID);

    const compareUserItems = await this.compareUserItemsWithPartnerConfig(userItems, partnerConfig.items_uuid);

    return {
      cart_uuid: cart.uuid.uuid,
      business_name: businessInfo.fantasy_name,
      availableItems: compareUserItems
    };
  }

  private async compareUserItemsWithPartnerConfig(userItems: AppUserItemEntity[], partnerConfigItems: string[]): Promise<AvailableUserItemDetails[]> {
    const acceptedItemSet = new Set(partnerConfigItems);
    const validStatuses = new Set<UserItemStatus>([
      UserItemStatus.active,
      UserItemStatus.to_be_cancelled
    ]);

    const availableItems: AvailableUserItemDetails[] = [];
    for (const item of userItems) {
      const itemUuid = item.item_uuid.uuid;
      const itemStatus = item.status as UserItemStatus;

      if (acceptedItemSet.has(itemUuid) && validStatuses.has(itemStatus)) {
        availableItems.push({
          user_benefit_uuid: item.uuid.uuid,
          item_uuid: itemUuid,
          item_name: item.item_name,
          balance: item.balance,
          status: itemStatus
        });
      }
    }

    return availableItems;
  }
}
