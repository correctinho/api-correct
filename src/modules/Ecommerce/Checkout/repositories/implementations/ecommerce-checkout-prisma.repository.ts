import { IEcommerceCheckoutRepository, ProcessCheckoutData } from "../ecommerce-checkout.repository";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CustomError } from "../../../../../errors/custom.error";
import { calculatePostPaidCycleSettlementDateAsDate, newDateF } from "../../../../../utils/date";

export class EcommerceCheckoutPrismaRepository implements IEcommerceCheckoutRepository {
  async processCheckout(data: ProcessCheckoutData): Promise<{ ecommerce_order_uuid: string; delivery_status: string; }> {
    const dataToSave = data.transactionEntity.toJSON();
    const debitedUserItemId = data.user_item_uuid.uuid;
    const transactionId = dataToSave.uuid;
    const favoredBusinessInfoId = data.cartEntity.business_info_uuid.uuid;
    const totalAmountToDecrement = dataToSave.net_price; // Valor total gasto (produtos + frete)

    // A plataforma fica com a taxa (calculada internamente na transação)
    const netAmountToCreditPlatform = dataToSave.platform_net_fee_amount;
    const netAmountToCreateAsCredit = dataToSave.partner_credit_amount;
    const cashbackAmountToCreditUser = dataToSave.cashback;

    // Usaremos o próprio UUID do carrinho como o UUID da Order (1:1 cart -> order)
    const ecommerceOrderUuid = data.cartEntity.uuid.uuid;

    const result = await prismaClient.$transaction(async (tx) => {
      // 1. Validações de saldo atômicas
      const debitedUserItem = await tx.userItem.findUnique({
        where: { uuid: debitedUserItemId },
        select: { balance: true }
      });

      if (!debitedUserItem || debitedUserItem.balance < totalAmountToDecrement) {
        throw new CustomError("Saldo insuficiente ou carteira não encontrada.", 403);
      }

      const debitedUserItemBalanceBefore = debitedUserItem.balance;
      const debitedUserItemBalanceAfter = debitedUserItemBalanceBefore - totalAmountToDecrement;

      // Carteira Correct para Cashback
      const correctUserItem = await tx.userItem.findFirst({
        where: { user_info_uuid: data.user_info_uuid.uuid, item_name: 'Correct' },
        select: { uuid: true, balance: true }
      });

      if (!correctUserItem) {
        throw new CustomError("Carteira de cashback não encontrada.", 404);
      }

      const correctItemBalanceBeforeCashback = correctUserItem.balance;
      const correctItemBalanceAfterCashback = correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

      const partnerBusinessAccount = await tx.businessAccount.findFirst({
        where: { business_info_uuid: favoredBusinessInfoId },
        select: { uuid: true }
      });
      if (!partnerBusinessAccount) throw new CustomError("Conta do parceiro não encontrada.", 404);
      const partnerBusinessAccountId = partnerBusinessAccount.uuid;

      const currentCorrectAccount = await tx.correctAccount.findFirst({
        select: { uuid: true, balance: true }
      });

      if (!currentCorrectAccount) {
        throw new CustomError("Conta da plataforma não encontrada.", 500);
      }

      const correctAccountId = currentCorrectAccount.uuid;

      const correctBalanceBefore = currentCorrectAccount.balance;
      const correctBalanceAfter = correctBalanceBefore + netAmountToCreditPlatform;

      // 2. Cria a Transactions
      await tx.transactions.create({
        data: {
          uuid: transactionId,
          user_item_uuid: debitedUserItemId,
          favored_business_info_uuid: favoredBusinessInfoId,
          original_price: dataToSave.original_price,
          discount_percentage: dataToSave.discount_percentage,
          net_price: dataToSave.net_price,
          fee_percentage: dataToSave.fee_percentage,
          fee_amount: dataToSave.fee_amount,
          partner_credit_amount: dataToSave.partner_credit_amount,
          platform_net_fee_amount: dataToSave.platform_net_fee_amount,
          cashback: dataToSave.cashback,
          description: dataToSave.description,
          status: 'success',
          transaction_type: dataToSave.transaction_type,
          created_at: newDateF(new Date()),
          paid_at: newDateF(new Date()),
          updated_at: newDateF(new Date())
        }
      });

      // 2.1 Verifica Estoque e Decrementa
      for (const item of data.cartEntity.items) {
        await tx.products.update({
          where: { uuid: item.product.uuid.uuid },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // 3. Atualiza Saldos
      await tx.userItem.update({
        where: { uuid: debitedUserItemId },
        data: { balance: { decrement: totalAmountToDecrement } }
      });

      await tx.correctAccount.update({
        where: { uuid: correctAccountId },
        data: { balance: { increment: netAmountToCreditPlatform } }
      });

      if (data.freight_amount > 0) {
        const muralhaAccountId = process.env.MURALHA_ACCOUNT_UUID;
        if (!muralhaAccountId) {
          throw new CustomError("MURALHA_ACCOUNT_UUID não configurada.", 500);
        }
        await tx.businessAccount.update({
          where: { uuid: muralhaAccountId },
          data: { balance: { increment: data.freight_amount } }
        });
      }

      await tx.userItem.update({
        where: { uuid: correctUserItem.uuid },
        data: { balance: { increment: cashbackAmountToCreditUser } }
      });

      if (data.isPrePaid) {
        await tx.businessAccount.update({
          where: { uuid: partnerBusinessAccountId },
          data: { balance: { increment: netAmountToCreateAsCredit } }
        });
      } else {
        const settlementDate = calculatePostPaidCycleSettlementDateAsDate(new Date(), data.employer_cutoff_day!);
        await tx.partnerCredit.create({
          data: {
            business_account_uuid: partnerBusinessAccountId,
            original_transaction_uuid: transactionId,
            balance: netAmountToCreateAsCredit,
            spent_amount: 0,
            status: 'PENDING',
            availability_date: settlementDate,
          }
        });
      }

      // 4. Históricos
      await tx.userItemHistory.createMany({
        data: [
          {
            user_item_uuid: debitedUserItemId,
            event_type: 'ITEM_SPENT',
            amount: -totalAmountToDecrement,
            balance_before: debitedUserItemBalanceBefore,
            balance_after: debitedUserItemBalanceAfter,
            related_transaction_uuid: transactionId,
          },
          {
            user_item_uuid: correctUserItem.uuid,
            event_type: 'CASHBACK_RECEIVED',
            amount: cashbackAmountToCreditUser,
            balance_before: correctItemBalanceBeforeCashback,
            balance_after: correctItemBalanceAfterCashback,
            related_transaction_uuid: transactionId,
          },
        ],
      });

      await tx.correctAccountHistory.create({
        data: {
          correct_account_uuid: correctAccountId,
          event_type: 'PLATFORM_FEE_COLLECTED',
          amount: netAmountToCreditPlatform,
          balance_before: correctBalanceBefore,
          balance_after: correctBalanceAfter,
          related_transaction_uuid: transactionId,
        },
      });

      // 5. Cria EcommerceOrder
      const order = await tx.ecommerceOrder.create({
        data: {
          uuid: ecommerceOrderUuid,
          user_info_uuid: data.user_info_uuid.uuid,
          business_info_uuid: favoredBusinessInfoId,
          transaction_uuid: transactionId,
          status: 'PAID',
          total_items_amount: dataToSave.original_price - data.freight_amount,
          freight_amount: data.freight_amount,
        }
      });

      // 6. Cria Order Items
      const orderItems = data.cartEntity.items.map(item => ({
        ecommerce_order_uuid: order.uuid,
        product_uuid: item.product.uuid.uuid,
        quantity: item.quantity,
        unit_price: item.product.price_in_cents
      }));

      await tx.ecommerceOrderItem.createMany({
        data: orderItems
      });

      // 7. Cria Delivery
      const delivery = await tx.delivery.create({
        data: {
          ecommerce_order_uuid: order.uuid,
          provider: 'TAXIMACHINE',
          status: 'PENDING',
        }
      });

      // 8. Atualiza o status do Cart em vez de apagar
      await tx.cart.update({
        where: { uuid: data.cartEntity.uuid.uuid },
        data: { status: 'ORDERED' }
      });

      return {
        ecommerce_order_uuid: order.uuid,
        delivery_status: delivery.status
      };
    });

    return result;
  }
}
