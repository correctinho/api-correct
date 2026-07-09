import { TransactionEntity } from "../../../Payments/Transactions/entities/transaction-order.entity";
import { CalculateSplitPrePaidOutput } from "../../../../paymentSplit/prePaidSplit";
import { CartEntity } from "../../Carts/entities/cart.entity";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";

export interface ProcessCheckoutData {
  transactionEntity: TransactionEntity;
  cartEntity: CartEntity;
  user_info_uuid: Uuid;
  user_item_uuid: Uuid;
  freight_amount: number; // in cents
  employer_cutoff_day?: number; // Only for PostPaid
  isPrePaid: boolean;
}

export interface IEcommerceCheckoutRepository {
  processCheckout(data: ProcessCheckoutData): Promise<{
    ecommerce_order_uuid: string;
    delivery_status: string;
  }>;
}
