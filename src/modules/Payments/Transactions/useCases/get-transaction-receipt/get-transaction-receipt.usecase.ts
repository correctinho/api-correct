import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";

let favoredBusiness: any
let favoredUser

export class GetTransactionReceiptUsecase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private businessInfoRepository: ICompanyDataRepository,
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository
  ) { }

  async execute(transactionId: string): Promise<any> {
    if (!transactionId) {
      throw new CustomError("Transaction ID is required", 400);
    }
    //get transaction details
    const transaction = await this.transactionOrderRepository.find(new Uuid(transactionId));
    if (!transaction) throw new CustomError("Transaction not found", 404);

    //get app user item details - the user that is paying
    const appUserItem = await this.appUserItemRepository.find(transaction.user_item_uuid)
    if (!appUserItem) throw new CustomError("App User item not found", 404)

    //now we need to know his name 
    const payerInfo = await this.appUserInfoRepository.find(appUserItem.user_info_uuid)
    if (!payerInfo) throw new CustomError("User Info not found", 404)

    let payeeData;


    // IF transaction was sent to a business
    if (transaction.favored_business_info_uuid) {
      //find business
      favoredBusiness = await this.businessInfoRepository.findById(transaction.favored_business_info_uuid.uuid)
      if (!favoredBusiness) throw new CustomError("Favored business not found", 404)

      payeeData = {
        name: favoredBusiness.fantasy_name,
        document: favoredBusiness.document,
        email: favoredBusiness.email,
        phone: favoredBusiness.phone_1,
        address: {
          street: favoredBusiness.Address.line1,
          number: favoredBusiness.Address.line2,
          neighborhood: favoredBusiness.Address.neighborhood,
          city: favoredBusiness.Address.city,
          state: favoredBusiness.Address.state,
          zipCode: favoredBusiness.Address.postal_code,
        }
      };
    } else if (transaction.favored_user_uuid) {
      // CASO 2: O recebedor é outro USUÁRIO
      const favoredUserInfo = await this.appUserInfoRepository.find(transaction.favored_user_uuid);
      if (!favoredUserInfo) throw new CustomError("Favored user not found", 404);

      payeeData = {
        name: favoredUserInfo.full_name,
        document: this.maskCPF(favoredUserInfo.document) // CPF do recebedor também é mascarado
      };
    } else {
      // Garante que a transação tenha um recebedor válido
      throw new CustomError("Transaction has no valid payee", 400);
    }

    const receiptData = {
      transactionId: transaction.uuid.uuid,
      // A data agora é formatada para o padrão brasileiro
      dateTime: this.formatDateTime(transaction.created_at),
      status: transaction.status,
      
      // Apenas o valor principal da transação, como solicitado
      amountInCents: transaction.amount,

      // Dados do Pagador (formato padrão)
      payer: {
        name: payerInfo.full_name,
        document: this.maskCPF(payerInfo.document)
      },
      
      // Dados do Recebedor (preenchido dinamicamente acima)
      payee: payeeData
    };

    return receiptData;
  }

  private formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) {
      return "";
    }
    // Converte a data para o locale pt-BR e fuso horário de Campo Grande
    return new Date(dateString).toLocaleString('pt-BR', { timeZone: 'America/Campo_Grande' });
  }

  private maskCPF(cpf: string): string {
    // 1. Validação de entrada: Se o CPF for nulo, indefinido ou uma string vazia,
    //    retorna uma string vazia para evitar erros.
    if (!cpf) {
      return "";
    }

    // 2. Limpeza: Remove quaisquer caracteres não numéricos (pontos, traços, etc.).
    const cleanedCPF = cpf.replace(/\D/g, '');

    // 3. Validação de comprimento: Verifica se o CPF limpo possui 11 dígitos.
    //    Se não tiver, retorna uma string vazia para não exibir uma máscara de um dado inválido.
    if (cleanedCPF.length !== 11) {
      return "";
    }

    // 4. Extração e montagem da máscara:
    //    - Pega os 3 dígitos do meio (índices 3, 4 e 5)
    //    - Pega os 3 dígitos seguintes (índices 6, 7 e 8)
    //    - Constrói a string final usando template literals.
    const middlePart1 = cleanedCPF.slice(3, 6);
    const middlePart2 = cleanedCPF.slice(6, 9);

    return `***.${middlePart1}.${middlePart2}-**`;
  }


}
