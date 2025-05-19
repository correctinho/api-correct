import { TransactionStatus, TransactionType } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { TransactionCreateCommand, TransactionEntity, TransactionProps } from "../transaction-order.entity";
import { CustomError } from "../../../../../errors/custom.error";
import { newDateF } from "../../../../../utils/date";

// Mock data for testing
const mockUserItemUuid = new Uuid();
const mockFavoredUserUuid = new Uuid();
const mockFavoredBusinessUuid = new Uuid();

// Valid properties for different scenarios - REMOVIDO status daqui
const validP2PBaseProps: Omit<TransactionProps, 'status'> = {
  user_item_uuid: mockUserItemUuid,
  favored_user_uuid: mockFavoredUserUuid,
  favored_business_info_uuid: null, // Must be null for P2P
  amount: 1000, // R$ 10.00 in cents
  transaction_type: TransactionType.P2P_TRANSFER,
};

const validPOSPaymentBaseProps: Omit<TransactionProps, 'status'> = {
  user_item_uuid: mockUserItemUuid,
  favored_user_uuid: null, // Must be null for POS Payment
  favored_business_info_uuid: mockFavoredBusinessUuid,
  amount: 500, // R$ 5.00 in cents
  transaction_type: TransactionType.POS_PAYMENT,
};

const validPendingBaseProps: Omit<TransactionProps, 'status'> = {
    user_item_uuid: null,
    favored_user_uuid: null,
    favored_business_info_uuid: null,
    amount: 1500,
    transaction_type: TransactionType.POS_PAYMENT, // Example type
};


describe("Unit Test Transaction Entity", () => {

  // --- Timer Mocks Setup ---
  // Use fake timers for tests involving time changes
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers(); // Restore real timers after all tests in this suite
  });
  // --- End Timer Mocks Setup ---


  describe("Constructor & Defaults", () => {
    it("Should create a transaction entity with status 'pending' by default", () => {
      // Passamos status 'success' aqui, mas o construtor deve ignorar e forçar 'pending'
      const props: TransactionProps = { ...validP2PBaseProps, status: TransactionStatus.success };
      const transaction = new TransactionEntity(props);
      expect(transaction).toBeInstanceOf(TransactionEntity);
      expect(transaction.uuid).toBeInstanceOf(Uuid);
      expect(transaction.user_item_uuid).toBe(mockUserItemUuid);
      expect(transaction.favored_user_uuid).toBe(mockFavoredUserUuid);
      expect(transaction.favored_business_info_uuid).toBeNull();
      expect(transaction.amount).toBe(1000);
      // --- VERIFICAÇÃO PRINCIPAL ---
      expect(transaction.status).toBe(TransactionStatus.pending);
      // -----------------------------
      expect(transaction.transaction_type).toBe(TransactionType.P2P_TRANSFER);
      expect(transaction.fee_amount).toBe(0);
      expect(transaction.cashback).toBe(0);
    });

     it("Should create a POS payment transaction with status 'pending'", () => {

       // Mesmo se passarmos outro status, deve ser 'pending'
      const props: TransactionProps = { ...validPOSPaymentBaseProps, status: TransactionStatus.fail };
      const transaction = new TransactionEntity(props);
      expect(transaction).toBeInstanceOf(TransactionEntity);
      expect(transaction.status).toBe(TransactionStatus.pending); // Deve ser PENDING
      expect(transaction.user_item_uuid).toBe(mockUserItemUuid);
      expect(transaction.favored_user_uuid).toBeNull();
      expect(transaction.favored_business_info_uuid).toBe(mockFavoredBusinessUuid);
      expect(transaction.amount).toBe(500);
      expect(transaction.transaction_type).toBe(TransactionType.POS_PAYMENT);
    });

    it("Should create a pending transaction with null source/recipients", () => {
       // Aqui o status já seria pending de qualquer forma, mas o construtor garante
        const props: TransactionProps = {
            ...validPendingBaseProps,
            status: TransactionStatus.pending, // Este valor será usado pelo construtor (que o força para pending)
        }
        const transaction = new TransactionEntity(props);
        expect(transaction).toBeInstanceOf(TransactionEntity);
        expect(transaction.status).toBe(TransactionStatus.pending); // Deve ser PENDING
        expect(transaction.user_item_uuid).toBeNull();
        expect(transaction.favored_user_uuid).toBeNull();
        expect(transaction.favored_business_info_uuid).toBeNull();

    });

    it("Should generate a UUID if none is provided", () => {
       const props: TransactionProps = { ...validP2PBaseProps, status: TransactionStatus.pending };
       const transaction = new TransactionEntity(props);
       expect(transaction.uuid).toBeInstanceOf(Uuid);
    });

     it("Should use provided UUID if available", () => {
      const specificUuid = new Uuid();
      const propsWithUuid: TransactionProps = { ...validP2PBaseProps, status: TransactionStatus.pending, uuid: specificUuid };
      const transaction = new TransactionEntity(propsWithUuid);
      expect(transaction.uuid).toBe(specificUuid);
    });
  });

  describe("Validation Errors", () => {
    // As validações de erro para amount, type, etc., continuam válidas
    // A validação de destinatário/origem agora só acontece em status != pending
    // ou quando chamamos completeTransaction, então os testes originais que
    // forçavam status 'success' na criação precisam ser adaptados ou movidos
    // para testar o método completeTransaction.

    it("Should throw an error if amount is zero", () => {
      const input: TransactionProps = { ...validP2PBaseProps, amount: 0, status: TransactionStatus.pending };
      expect(() => new TransactionEntity(input)).toThrow("Amount must be a positive number");
    });

     it("Should throw an error if amount is negative", () => {
       const input: TransactionProps = { ...validP2PBaseProps, amount: -100, status: TransactionStatus.pending };
       expect(() => new TransactionEntity(input)).toThrow("Amount must be a positive number");
    });

    // Status é forçado para pending, então este teste não faz mais sentido para o construtor
    /*
    it("Should throw an error if status is missing", () => {
      const input = { ...validP2PBaseProps } as any;
      delete input.status;
      expect(() => new TransactionEntity(input)).toThrow("Status is required");
    });
    */

    it("Should throw an error if transaction_type is missing", () => {
      const input = { ...validP2PBaseProps, status: TransactionStatus.pending } as any; // Bypass TS
      delete input.transaction_type;
      expect(() => new TransactionEntity(input)).toThrow("Transaction type is required");
    });

    // --- Testes de validação movidos para o método completeTransaction ---
  });

  describe("Methods", () => {



     it("Should throw error when trying to change status back to pending", () => {
      const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending };
      const transaction = new TransactionEntity(props);
      transaction.changeStatus(TransactionStatus.fail); // Muda para fail primeiro

      expect(() => transaction.changeStatus(TransactionStatus.pending)).toThrow("Cannot change status back to pending");
    });


     it("Should complete a P2P transaction correctly", () => {
       jest.setSystemTime(new Date('2025-04-13T10:04:00.000Z'));
       const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending, transaction_type: TransactionType.P2P_TRANSFER }; // Garante tipo P2P
       const transaction = new TransactionEntity(props);
       const initialUpdateTimestamp = transaction.updated_at;

       jest.advanceTimersByTime(1000);
       transaction.completeTransaction({
           user_item_uuid: mockUserItemUuid,
           favored_user_uuid: mockFavoredUserUuid,
           status: TransactionStatus.success
       });

       expect(transaction.status).toBe(TransactionStatus.success);
       expect(transaction.user_item_uuid).toBe(mockUserItemUuid);
       expect(transaction.favored_user_uuid).toBe(mockFavoredUserUuid);
       expect(transaction.favored_business_info_uuid).toBeNull();
       expect(transaction.updated_at).not.toBe(initialUpdateTimestamp);
     });

      it("Should complete a POS transaction correctly", () => {
       jest.setSystemTime(new Date('2025-04-13T10:05:00.000Z'));
       const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending, transaction_type: TransactionType.POS_PAYMENT }; // Garante tipo POS
       const transaction = new TransactionEntity(props);
       const initialUpdateTimestamp = transaction.updated_at;

       jest.advanceTimersByTime(1000);
       transaction.completeTransaction({
           user_item_uuid: mockUserItemUuid,
           favored_business_info_uuid: mockFavoredBusinessUuid,
           status: TransactionStatus.success
       });

       expect(transaction.status).toBe(TransactionStatus.success);
       expect(transaction.user_item_uuid).toBe(mockUserItemUuid);
       expect(transaction.favored_user_uuid).toBeNull();
       expect(transaction.favored_business_info_uuid).toBe(mockFavoredBusinessUuid);
       expect(transaction.updated_at).not.toBe(initialUpdateTimestamp);
     });

     // --- Testes de validação que agora ocorrem em completeTransaction ---
      it("Should throw if completing with status 'success' and user_item_uuid is null", () => {
        const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending };
        const transaction = new TransactionEntity(props);
        expect(() => transaction.completeTransaction({
            user_item_uuid: null as any, // Força null
            favored_user_uuid: mockFavoredUserUuid,
            status: TransactionStatus.success
        })).toThrow("Source user item (user_item_uuid) is required for a successful transaction");
     });

    it("Should throw if completing with status 'success' and both recipients are provided", () => {
       const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending };
       const transaction = new TransactionEntity(props);
       expect(() => transaction.completeTransaction({
           user_item_uuid: mockUserItemUuid,
           favored_user_uuid: mockFavoredUserUuid,
           favored_business_info_uuid: mockFavoredBusinessUuid, // Ambos
           status: TransactionStatus.success
       })).toThrow("Transaction cannot have both a user and a business recipient");
    });

    it("Should throw if completing with status 'success' and neither recipient is provided", () => {
        const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending };
        const transaction = new TransactionEntity(props);
        expect(() => transaction.completeTransaction({
           user_item_uuid: mockUserItemUuid,
           // Nenhum recipient
           status: TransactionStatus.success
       })).toThrow("Successful transaction must have either a user or a business recipient");
    });

     it("Should throw if completing P2P transaction without user recipient", () => {
       const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending, transaction_type: TransactionType.P2P_TRANSFER };
       const transaction = new TransactionEntity(props);
       expect(() => transaction.completeTransaction({
           user_item_uuid: mockUserItemUuid,
           favored_business_info_uuid: mockFavoredBusinessUuid, // Recipient errado
           status: TransactionStatus.success
       })).toThrow("P2P transfer must have a user recipient (favored_user_uuid)");
     });

     it("Should throw if completing POS transaction without business recipient", () => {
       const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending, transaction_type: TransactionType.POS_PAYMENT };
       const transaction = new TransactionEntity(props);
       expect(() => transaction.completeTransaction({
           user_item_uuid: mockUserItemUuid,
           favored_user_uuid: mockFavoredUserUuid, // Recipient errado
           status: TransactionStatus.success
       })).toThrow("Business payment must have a business recipient (favored_business_info_uuid)");
     });

     it("Should throw if trying to complete a non-pending transaction", () => {
      const props: TransactionProps = {...validPendingBaseProps, status: TransactionStatus.pending };
      const transaction = new TransactionEntity(props);


      transaction.completeTransaction({
        user_item_uuid: mockUserItemUuid,
        // favored_user_uuid: null, // Não precisa passar, default é null
        favored_business_info_uuid: mockFavoredBusinessUuid, // <<< CORREÇÃO
        status: TransactionStatus.success
    });

      expect(() => transaction.completeTransaction({
          user_item_uuid: mockUserItemUuid,
          favored_business_info_uuid: mockFavoredBusinessUuid,
          status: TransactionStatus.success
      }))
      .toThrow("Transaction status must be 'pending' to be completed. Current status: success");
  });


      it("Should add description correctly and update timestamp", () => {
        jest.setSystemTime(new Date('2025-04-13T10:06:00.000Z'));
        // Cria com status pending
        const props: TransactionProps = { ...validP2PBaseProps, status: TransactionStatus.pending };
        const transaction = new TransactionEntity(props);
        const initialUpdateTimestamp = transaction.updated_at;
        const description = "Monthly allowance";

        jest.advanceTimersByTime(1000);
        transaction.addDescription(description);

        expect(transaction.description).toBe(description);
        expect(transaction.updated_at).not.toBe(initialUpdateTimestamp);
     });
  });

   describe("Static Create Method", () => {
      it("Should create a transaction using the static create method with status 'pending'", () => {
        jest.setSystemTime(new Date('2025-04-13T10:07:00.000Z'));
        // Removido status do comando, pois não é mais permitido
        const createCommand: TransactionCreateCommand = {
            user_item_uuid: mockUserItemUuid,
            favored_user_uuid: mockFavoredUserUuid,
            amount: 1000,
            transaction_type: TransactionType.P2P_TRANSFER,
        };
        const transaction = TransactionEntity.create(createCommand);

        expect(transaction).toBeInstanceOf(TransactionEntity);
        expect(transaction.uuid).toBeInstanceOf(Uuid);
        expect(transaction.amount).toBe(1000);
        // --- VERIFICAÇÃO PRINCIPAL ---
        expect(transaction.status).toBe(TransactionStatus.pending); // Deve ser PENDING
         // -----------------------------
        expect(transaction.transaction_type).toBe(TransactionType.P2P_TRANSFER);
        expect(transaction.favored_user_uuid).toBe(mockFavoredUserUuid);
        expect(transaction.favored_business_info_uuid).toBeNull();
      });
   });

});
