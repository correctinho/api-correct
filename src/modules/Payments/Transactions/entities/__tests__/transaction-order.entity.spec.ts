import { TransactionEntity } from "../transaction-order.entity";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { TransactionStatus, TransactionType } from "@prisma/client";

describe("TransactionEntity Unit Tests", () => {
  describe("1. Lógica Financeira e BigInt (Cenário Real)", () => {
    it("should calculate fee correctly and round cashback up if fractional", () => {
      // original_price: 15.00, discount_percentage: 1.0, net_price: 14.85
      const transaction = TransactionEntity.create({
        original_price: 15.00,
        discount_percentage: 1.0,
        net_price: 14.85,
        transaction_type: TransactionType.POS_PAYMENT,
      });

      // calculateFeePercentage(15000, 10000) [2.5% raw]
      transaction.calculateFeePercentage(15000, 10000);

      // Define partner cashback to force fractional rounding check (e.g., 1.0% = 10000 internal)
      // Net price is 1485 cents. 1% cashback on 1485 cents is 14.85 cents -> rounds to 15 cents.
      transaction.setPartnerCashbackPercentage(10000);

      transaction.calculateFee();

      // Validate internal representation (cents) via toJSON()
      const json = transaction.toJSON();
      
      // fee_amount (1485 cents * 25000) / 1000000 = 37.125 -> 37 cents
      expect(json.fee_amount).toBe(37);
      expect(transaction.fee_amount).toBe(0.37);

      // cashback partner: 1485 * 10000 / 1000000 = 14.85 -> 15 cents
      // cashback platform: 20% of 37 cents = 7.4 cents -> 8 cents
      // Total = 15 + 8 = 23 cents
      expect(json.cashback).toBe(23);
      expect(transaction.cashback).toBe(0.23);

      // partner_credit_amount: 1485 - 37 = 1448
      expect(json.partner_credit_amount).toBe(1448);
      // platform_net_fee_amount: 37 - 8 = 29
      expect(json.platform_net_fee_amount).toBe(29);
    });
  });

  describe("2. Métodos Estáticos (Factories)", () => {
    it("should scale inputs in create() from Reais/Decimals to cents/factor 10000", () => {
      const transaction = TransactionEntity.create({
        original_price: 100.50,
        discount_percentage: 5.5,
        net_price: 94.97, // 100.50 - 5.5275 (rounded 5.53) = 94.97
        transaction_type: TransactionType.ECOMMERCE_PAYMENT,
      });

      const json = transaction.toJSON();
      expect(json.original_price).toBe(10050);
      expect(json.discount_percentage).toBe(55000);
      expect(json.net_price).toBe(9497);
    });

    it("should reconstruct entity using hydrate() without applying new multiplications", () => {
      const uuid = new Uuid();
      const transaction = TransactionEntity.hydrate({
        uuid,
        original_price: 10050,
        discount_percentage: 55000,
        net_price: 9497,
        partner_credit_amount: 9000,
        fee_percentage: 25000,
        fee_amount: 497,
        cashback: 100,
        platform_net_fee_amount: 397,
        status: TransactionStatus.success,
        transaction_type: TransactionType.P2P_TRANSFER,
      });

      const json = transaction.toJSON();
      expect(json.original_price).toBe(10050);
      expect(json.discount_percentage).toBe(55000);
      expect(json.net_price).toBe(9497);
      expect(json.uuid).toBe(uuid.uuid);
    });

    it("should correctly build via createCompletedSubscriptionPayment()", () => {
      const hubId = new Uuid();
      const subId = new Uuid();
      const userId = new Uuid();
      
      const transaction = TransactionEntity.createCompletedSubscriptionPayment({
        hub_account_item_uuid: hubId,
        subscription_uuid: subId,
        user_info_uuid: userId,
        amountInCents: 5000,
        description: "Mensalidade B2C",
      });

      const json = transaction.toJSON();
      expect(json.status).toBe(TransactionStatus.success);
      expect(json.transaction_type).toBe(TransactionType.SUBSCRIPTION_PAYMENT);
      expect(json.original_price).toBe(5000);
      expect(json.partner_credit_amount).toBe(0);
      expect(json.user_item_uuid).toBe(hubId.uuid);
      expect(json.subscription_uuid).toBe(subId.uuid);
    });

    it("should correctly build via createForSubscriptionPixPayment()", () => {
      const subId = new Uuid();
      const userItem = new Uuid();
      const userId = new Uuid();

      const transaction = TransactionEntity.createForSubscriptionPixPayment({
        amountInCents: 15000,
        provider_tx_id: "TX-123456",
        subscription_uuid: subId,
        user_info_uuid: userId,
        user_item_uuid: userItem,
      });

      const json = transaction.toJSON();
      expect(json.status).toBe(TransactionStatus.pending);
      expect(json.provider_tx_id).toBe("TX-123456");
      expect(json.original_price).toBe(15000);
      expect(json.transaction_type).toBe(TransactionType.SUBSCRIPTION_PAYMENT);
    });
  });

  describe("3. Ciclo de Vida e Status", () => {
    it("should set PIX Details successfully if pending and update status", () => {
      const transaction = TransactionEntity.createForSubscriptionPixPayment({
        amountInCents: 1000,
        provider_tx_id: "123",
        subscription_uuid: new Uuid(),
        user_info_uuid: new Uuid(),
        user_item_uuid: new Uuid(),
      });

      transaction.setPixPaymentDetails("E2E-123456", "2026-04-10T10:00:00Z");

      expect(transaction.status).toBe(TransactionStatus.success);
      expect(transaction.pix_e2e_id).toBe("E2E-123456");
      expect(transaction.paid_at).toBe("2026-04-10T10:00:00Z");
    });

    it("should throw error when setting PIX Details if not pending", () => {
      const transaction = TransactionEntity.hydrate({
        original_price: 1000,
        discount_percentage: 0,
        net_price: 1000,
        partner_credit_amount: 0,
        status: TransactionStatus.success,
      } as any);

      expect(() => {
        transaction.setPixPaymentDetails("E2E-123456", "2026-04-10T10:00:00Z");
      }).toThrow(/Cannot set PIX payment details on a transaction that is not 'pending'/);
    });

    it("should complete transaction to success and validate required user_item_uuid", () => {
      const transaction1 = TransactionEntity.create({
        original_price: 10.00,
        discount_percentage: 0,
        net_price: 10.00,
        transaction_type: TransactionType.P2P_TRANSFER,
      });

      expect(() => {
        transaction1.completeTransaction({
          status: 'success',
          favored_user_uuid: new Uuid()
        });
      }).toThrow(/Source user item .* is required for a successful transaction/);

      const transaction2 = TransactionEntity.create({
        original_price: 10.00,
        discount_percentage: 0,
        net_price: 10.00,
        transaction_type: TransactionType.P2P_TRANSFER,
      });
      const userItemId = new Uuid();
      transaction2.completeTransaction({
        status: 'success',
        user_item_uuid: userItemId,
        favored_user_uuid: new Uuid()
      });

      expect(transaction2.status).toBe(TransactionStatus.success);
      expect(transaction2.user_item_uuid?.uuid).toBe(userItemId.uuid);
    });

    it("should correctly utilize modifiers to change states", () => {
      const transaction = TransactionEntity.create({
        original_price: 10,
        discount_percentage: 0,
        net_price: 10,
        transaction_type: TransactionType.POS_PAYMENT,
      });

      transaction.changeStatus(TransactionStatus.cancelled);
      expect(transaction.status).toBe(TransactionStatus.cancelled);

      // Verify that changing to another known transaction type works
      transaction.changeTransactionType(TransactionType.ECOMMERCE_PAYMENT);
      expect(transaction.transaction_type).toBe(TransactionType.ECOMMERCE_PAYMENT);

      const favId = new Uuid();
      transaction.changeFavoredBusinessInfoUuid(favId);
      expect(transaction.favored_business_info_uuid?.uuid).toBe(favId.uuid);
    });
  });

  describe("4. Validações (Regras de Negócio)", () => {
    it("should throw error for net_price inconsistency", () => {
      expect(() => {
        TransactionEntity.create({
          original_price: 100.00,    // translates to 10000 cents
          discount_percentage: 10.0, // translates to 100000 format, discount is 1000 cents
          net_price: 80.00,          // translates to 8000 cents, but 10000 - 1000 = 9000
          transaction_type: TransactionType.POS_PAYMENT,
        });
      }).toThrow(/Net price is not consistent with original price and discount percentage/);
    });

    it("should throw error for negative taxes or prices during calculateFeePercentage and change setters", () => {
      const tx = TransactionEntity.create({
        original_price: 10,
        discount_percentage: 0,
        net_price: 10,
        transaction_type: TransactionType.POS_PAYMENT,
      });
      
      expect(() => {
        tx.calculateFeePercentage(-1, 5000);
      }).toThrow(/Admin and marketing taxes cannot be negative/);

      expect(() => {
        tx.setPartnerCashbackPercentage(-100);
      }).toThrow(/Partner cashback percentage cannot be negative/);
    });

    it("should throw error if favored user or business is missing when completing as success", () => {
      const tx1 = TransactionEntity.create({
        original_price: 10,
        discount_percentage: 0,
        net_price: 10,
        transaction_type: TransactionType.POS_PAYMENT,
      });

      expect(() => {
        tx1.completeTransaction({
          status: 'success',
          user_item_uuid: new Uuid(),
        });
      }).toThrow(/Successful transaction must have either a user or a business recipient/);

      const tx2 = TransactionEntity.create({
        original_price: 10,
        discount_percentage: 0,
        net_price: 10,
        transaction_type: TransactionType.POS_PAYMENT,
      });

      expect(() => {
        tx2.completeTransaction({
          status: 'success',
          user_item_uuid: new Uuid(),
          favored_user_uuid: new Uuid(),
          favored_business_info_uuid: new Uuid()
        });
      }).toThrow(/Transaction cannot have both a user and a business recipient/);
    });
  });

  describe("5. Saída de Dados", () => {
    it("should provide correctly formatted UUID strings and integer cents via toJSON()", () => {
      const uId = new Uuid();
      const fId = new Uuid();
      const tx = TransactionEntity.hydrate({
        uuid: uId,
        user_item_uuid: uId,
        favored_user_uuid: fId,
        original_price: 1000,
        discount_percentage: 10000,
        net_price: 900,
        partner_credit_amount: 800,
        status: TransactionStatus.success,
        transaction_type: TransactionType.P2P_TRANSFER,
      } as any);

      const json = tx.toJSON();
      expect(typeof json.uuid).toBe("string");
      expect(json.uuid).toBe(uId.uuid);
      expect(json.user_item_uuid).toBe(uId.uuid);
      expect(json.original_price).toBe(1000);
      expect(json.net_price).toBe(900);
    });

    it("should provide divided values (formatados padrão decimal/reais) via Getters", () => {
      const tx = TransactionEntity.hydrate({
        uuid: new Uuid(),
        original_price: 1535, // 15.35 reais
        discount_percentage: 12500, // 1.25%
        net_price: 1515, // 15.15 reais
        fee_percentage: 25000, // 2.5%
        fee_amount: 38, // 0.38 reais
        cashback: 10, // 0.10 reais
        platform_net_fee_amount: 28, // 0.28 reais
        partner_credit_amount: 1477, // 14.77 reais
        status: TransactionStatus.pending,
        transaction_type: TransactionType.POS_PAYMENT,
      } as any);

      expect(tx.original_price).toBe(15.35);
      expect(tx.discount_percentage).toBe(1.25);
      expect(tx.net_price).toBe(15.15);
      expect(tx.fee_percentage).toBe(2.5);
      expect(tx.fee_amount).toBe(0.38);
      expect(tx.cashback).toBe(0.10);
      expect(tx.platform_net_fee_amount).toBe(0.28);
      expect(tx.partner_credit_amount).toBe(14.77);
    });
  });
});