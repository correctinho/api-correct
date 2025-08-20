import { TransactionStatus, TransactionType } from "@prisma/client";
import { TransactionEntity, TransactionCreateCommand } from '../transaction-order.entity.ts'
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo.ts";

describe('TransactionEntity Unit Tests', () => {

    // Dados de exemplo para os testes
    const validCommand: TransactionCreateCommand = {
        original_price: 100.00, // R$ 100,00
        discount_percentage: 10, // 10%
        net_price: 90.00, // R$ 90,00
        favored_business_info_uuid: new Uuid(),
        transaction_type: 'POS_PAYMENT'
    };

    describe('Factory Method: create()', () => {
        it('deve criar uma entidade com valores escalados corretamente', () => {
            const entity = TransactionEntity.create(validCommand);
            const json = entity.toJSON();

            // Verifica se os valores foram convertidos para centavos/inteiros escalados
            expect(json.original_price).toBe(10000);
            expect(json.discount_percentage).toBe(100000); // 10 * 10000
            expect(json.net_price).toBe(9000);
            expect(json.status).toBe(TransactionStatus.pending);
            expect(json.fee_amount).toBe(0); // Deve ser inicializado como 0
            expect(json.cashback).toBe(0); // Deve ser inicializado como 0
        });

        it('deve lançar um erro se o net_price for inconsistente', () => {
            const invalidCommand = { ...validCommand, net_price: 85.00 }; // 10% de 100 é 90, não 85
            
            expect(() => {
                TransactionEntity.create(invalidCommand);
            }).toThrow("Net price is not consistent with original price and discount percentage");
        });
    });

    describe('Calculation Methods: calculateFeePercentage() and calculateFee()', () => {
        it('deve calcular corretamente fee, cashback e partner_credit_amount', () => {
            const entity = TransactionEntity.create(validCommand);

            // 1. Simula a definição da taxa (1.5% de admin_tax, vindo do PartnerConfig)
            const admin_tax_from_config = 15000; // 1.5% * 10000
            const marketing_tax_from_config = 0;
            entity.calculateFeePercentage(admin_tax_from_config, marketing_tax_from_config);

            // 2. Executa o cálculo principal
            entity.calculateFee();

            // 3. Verifica os resultados internos (em centavos) através do toJSON()
            const json = entity.toJSON();
            // net_price = 9000, fee_percentage = 15000
            // fee_amount = (9000 * 15000) / 1000000 = 135
            // cashback = (135 * 20) / 100 = 27
            // partner_credit_amount = 9000 - 135 = 8865
            expect(json.fee_percentage).toBe(15000);
            expect(json.fee_amount).toBe(135);
            expect(json.cashback).toBe(27);
            expect(json.partner_credit_amount).toBe(8865);
        });

        it('deve truncar decimais nos cálculos, garantindo inteiros', () => {
            const commandWithFractions: TransactionCreateCommand = {
                original_price: 99.55,
                discount_percentage: 0,
                net_price: 99.55,
                favored_business_info_uuid: new Uuid(),
                transaction_type: 'POS_PAYMENT'
            };
            const entity = TransactionEntity.create(commandWithFractions);
            
            const admin_tax = 27000; // 2.7%
            entity.calculateFeePercentage(admin_tax, 0);
            entity.calculateFee();
            
            const json = entity.toJSON();
            // net_price = 9955, fee_percentage = 27000
            // fee_amount = (9955 * 27000) / 1000000 = 268.785 => truncado para 268
            // cashback = (268 * 20) / 100 = 53.6 => truncado para 53
            // partner_credit_amount = 9955 - 268 = 9687
            expect(json.fee_amount).toBe(268);
            expect(json.cashback).toBe(53);
            expect(json.partner_credit_amount).toBe(9687);
        });
    });

    describe('Getters', () => {
        it('deve retornar os valores monetários formatados em Reais', () => {
            const entity = TransactionEntity.create(validCommand);
            entity.calculateFeePercentage(15000, 0);
            entity.calculateFee();

            // Os getters devem retornar os valores formatados para exibição
            expect(entity.original_price).toBe(100.00);
            expect(entity.net_price).toBe(90.00);
            expect(entity.fee_amount).toBe(1.35); // 135 / 100
            expect(entity.cashback).toBe(0.27); // 27 / 100
            expect(entity.partner_credit_amount).toBe(88.65); // 8865 / 100
        });

        it('deve retornar as porcentagens formatadas em decimal', () => {
            const entity = TransactionEntity.create(validCommand);
            entity.calculateFeePercentage(15000, 0);

            expect(entity.discount_percentage).toBe(10);
            expect(entity.fee_percentage).toBe(1.5); // 15000 / 10000
        });
    });

});