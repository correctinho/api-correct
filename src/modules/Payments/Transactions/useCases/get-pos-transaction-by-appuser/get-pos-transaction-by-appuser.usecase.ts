import { UserItemStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputGetTransactionByAppUserDTO, OutputGetTransactionByAppUserDTO } from "../../transactions-dto/transactions.dto";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";

interface AvailableUserItemDetails {
  item_uuid: string;
  item_name: string;
  balance: number;
  status: UserItemStatus; // Incluir o status pode ser útil para a UI
}

export class GetPOSTransactionByAppUserUsecase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private businessInfoRepository: ICompanyDataRepository
  ) { }

  async execute(data: InputGetTransactionByAppUserDTO): Promise<any> {
    if (!data.transactionId) {
      throw new CustomError("Transaction ID is required", 400);
    }

    //get transaction details
    const transaction = await this.transactionOrderRepository.find(new Uuid(data.transactionId));
    if (!transaction) throw new CustomError("Transaction not found", 404);
    // Ensure transaction has the favored business info needed
    if (!transaction.favored_business_info_uuid) {
      throw new CustomError("Transaction is missing partner information", 400);
    }


    //check user available benefits for this transaction
    // For this, we need to compare partner benefits with user items
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(transaction.favored_business_info_uuid.uuid);
    if (!partnerConfig) throw new CustomError("Partner config not found", 404);

    //get business info
    const businessInfo = await this.businessInfoRepository.findById(transaction.favored_business_info_uuid.uuid);
    if (!businessInfo) throw new CustomError("Business info not found", 404);


    //the items that are accepted by the partner are located in the partnerConfig.items_uuid
    //we need to compare this with the user items

    const userItems = await this.userItemRepository.findAllUserItems(data.appUserInfoID)

    const compareUserItems = await this.compareUserItemsWithPartnerConfig(userItems, partnerConfig.items_uuid);


    return {
      fantasy_name:businessInfo.fantasy_name,
      availableItems: compareUserItems
    }
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
      // Garante que o status seja tratado corretamente conforme o enum
      const itemStatus = item.status as UserItemStatus;

      // Verifica se o item é aceito pelo parceiro E se tem um status válido
      if (acceptedItemSet.has(itemUuid) && validStatuses.has(itemStatus)) {
        // Se ambas as condições forem verdadeiras, cria o objeto com os dados solicitados
        availableItems.push({
          item_uuid: itemUuid,
          item_name: item.item_name,
          balance: item.balance,
          status: itemStatus // Incluindo o status no retorno
        });
      }
    }

    return availableItems;
  }
}
