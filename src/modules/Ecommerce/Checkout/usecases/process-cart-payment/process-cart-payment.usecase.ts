import { TransactionStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ICartRepository } from "../../../Carts/repositories/cart.repository";
import { IDeliveryProvider } from "../../../Deliveries/IDeliveryProvider";
import { IEcommerceCheckoutRepository } from "../../repositories/ecommerce-checkout.repository";
import { InputProcessCartPaymentDTO, OutputProcessCartPaymentDTO } from "./process-cart-payment.dto";
import { TransactionEntity } from "../../../../Payments/Transactions/entities/transaction-order.entity";
import { ICompanyAddressRepository } from "../../../../Company/CompanyAddress/repositories/company-address.repository";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class ProcessCartPaymentUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private ecommerceCheckoutRepository: IEcommerceCheckoutRepository,
    private deliveryProvider: IDeliveryProvider,
    private companyAddressRepository: ICompanyAddressRepository, // INJEÇÃO RESTAURADA: Mantendo os domínios separados!
    private userInfoRepository: IAppUserInfoRepository,
  ) { }

  async execute(data: InputProcessCartPaymentDTO): Promise<OutputProcessCartPaymentDTO> {
    const { cart_uuid, payment_method_uuid, appUserInfoID } = data;

    // 1. Busca e valida o Carrinho
    const cart = await this.cartRepository.findCartById(new Uuid(cart_uuid));
    if (!cart) {
      throw new CustomError("Carrinho não encontrado.", 404);
    }
    if (cart.user_info_uuid.uuid !== appUserInfoID) {
      throw new CustomError("Este carrinho não pertence a este usuário.", 403);
    }
    if (cart.items.length === 0) {
      throw new CustomError("O carrinho está vazio.", 400);
    }

    const businessInfoUuid = cart.business_info_uuid.uuid;

    // 2. Busca e valida o Meio de Pagamento (UserItem)
    const userItem = await this.userItemRepository.find(new Uuid(payment_method_uuid));
    if (!userItem) {
      throw new CustomError("Meio de pagamento não encontrado.", 404);
    }
    if (userItem.user_info_uuid.uuid !== appUserInfoID) {
      throw new CustomError("O meio de pagamento não pertence a este usuário.", 403);
    }
    if (userItem.status === "inactive" || userItem.status === "blocked") {
      throw new CustomError("O meio de pagamento selecionado está inativo ou bloqueado.", 403);
    }

    // 3. Valida se o benefício é aceito pelo parceiro
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(businessInfoUuid);
    if (!partnerConfig) {
      throw new CustomError("Configuração do parceiro não encontrada.", 404);
    }

    const isBenefitValid = partnerConfig.items_uuid.some((item) => item === userItem.item_uuid.uuid);
    if (!isBenefitValid) {
      throw new CustomError("Este meio de pagamento não é aceito por esta loja.", 403);
    }

    // 4. Calcula o valor total a ser pago
    const productsTotal = cart.calculateTotalInCents();

    const freightAmount = cart.freight_amount || 0;
    const totalAmount = productsTotal + freightAmount;

    // if (freightAmount > 0) {
    //   if (!cart.freight_quoted_at) {
    //     throw new CustomError("Cotação de frete inválida. Calcule novamente.", 400);
    //   }
    //   const diffInMinutes = (new Date().getTime() - new Date(cart.freight_quoted_at).getTime()) / (1000 * 60);
    //   if (diffInMinutes > 15) {
    //     throw new CustomError("Cotação de frete expirada. Calcule novamente.", 400);
    //   }
    // }

    if (userItem.balance < totalAmount) {
      throw new CustomError("Saldo insuficiente para realizar esta compra.", 403);
    }

    // =========================================================================
    // 4.5 VALIDAÇÃO ANTECIPADA DE LOGÍSTICA (FAIL-FAST)
    // Garantimos que a origem e destino existem ANTES de debitar o dinheiro
    // =========================================================================
    let originAddr = null;
    let userInfo = null;

    if (freightAmount > 0) {
      // A. Valida a Origem (Loja): Usa o Repositório dedicado para não misturar domínios!
      const dispatchUuid = partnerConfig.dispatch_address_uuid;
      if (!dispatchUuid) {
        throw new CustomError("A loja não configurou o endereço de despacho. Entrega indisponível.", 400);
      }

      originAddr = await this.companyAddressRepository.findById(dispatchUuid);
      if (!originAddr || !originAddr.line1 || !originAddr.neighborhood || !originAddr.city || !originAddr.state) {
        throw new CustomError("O endereço de despacho da loja está incompleto (faltam rua, bairro, cidade ou UF).", 400);
      }

      // B. Valida o Endereço de Destino (Vem do Carrinho, Tipado!)
      const destAddress = cart.destination_address;
      if (!destAddress) {
        throw new CustomError("Endereço de entrega não encontrado no carrinho. Por favor, calcule o frete novamente.", 400);
      }

      // C. Valida o Cliente (Para pegarmos Nome e Telefone para o Motoboy)
      userInfo = await this.userInfoRepository.find(new Uuid(appUserInfoID));
      if (!userInfo || !userInfo.full_name || !userInfo.phone) {
        throw new CustomError("Os dados do seu perfil (Nome ou Telefone) estão incompletos para realizarmos a entrega.", 400);
      }
    }

    // 5. Instancia a TransactionEntity com os valores totais
    const transactionEntity = TransactionEntity.create({
      original_price: totalAmount,
      discount_percentage: 0,
      net_price: totalAmount,
      user_item_uuid: userItem.uuid,
      favored_business_info_uuid: new Uuid(businessInfoUuid),
      transaction_type: 'ECOMMERCE_PAYMENT',
      description: "Compra via Ecommerce - Carrinho"
    });

    // 6. Injeta as Taxas e o Cashback Configuradas na Loja
    transactionEntity.setPartnerCashbackPercentage(partnerConfig.cashback_tax || 0);

    const totalFeePercentage = (partnerConfig.admin_tax || 0) + (partnerConfig.marketing_tax || 0) + (partnerConfig.market_place_tax || 0);
    transactionEntity.calculateFeePercentage(totalFeePercentage, 0);

    // 7. A MÁGICA SEGURA: Calcula as taxas excluindo o frete
    transactionEntity.calculateEcommerceFee(freightAmount);
    transactionEntity.changeStatus(TransactionStatus.success);

    const isPrePaid = userItem.item_category === "pre_pago";

    // 8. Salva a transação, pedido e delivery no banco (Atomic)
    const result = await this.ecommerceCheckoutRepository.processCheckout({
      transactionEntity,
      cartEntity: cart,
      user_info_uuid: new Uuid(appUserInfoID),
      user_item_uuid: userItem.uuid,
      freight_amount: freightAmount,
      employer_cutoff_day: undefined,
      isPrePaid
    });

    // 9. Integração com Delivery 
    try {
      if (freightAmount > 0 && originAddr && userInfo && cart.destination_address) {
        const dest = cart.destination_address;
        await this.deliveryProvider.createDelivery({
          transactionUuid: result.ecommerce_order_uuid,
          origin: {
            address: `${originAddr.line1}, ${originAddr.line2 || 'S/N'}`,
            neighborhood: originAddr.neighborhood,
            city: originAddr.city,
            state: originAddr.state,
            lat: originAddr.latitude || 0,
            lng: originAddr.longitude || 0,
          },
          destination: {
            name: userInfo.full_name,
            phone: userInfo.phone,
            address: `${dest.line1}, ${dest.line2 || 'S/N'}`,
            neighborhood: dest.neighborhood,
            city: dest.city,
            state: dest.state,
            lat: dest.latitude || 0,
            lng: dest.longitude || 0
          }
        });
      }
    } catch (e: any) {
      console.warn("Aviso: Falha ao tentar acionar o sistema de entrega. Intervenção manual necessária.", {
        order_uuid: result.ecommerce_order_uuid,
        error: e.message,
        stack: e.stack
      });
      // Atualiza o status para sinalizar falha na API de entrega
      // result.delivery_status = 'PENDING_DISPATCH';
      // await prismaClient.delivery.updateMany({
      //   where: { ecommerce_order_uuid: result.ecommerce_order_uuid },
      //   data: { status: 'PENDING_DISPATCH' }
      // });
    }

    return {
      ecommerce_order_uuid: result.ecommerce_order_uuid,
      transaction_uuid: transactionEntity.uuid.uuid,
      delivery_status: result.delivery_status
    };
  }
}