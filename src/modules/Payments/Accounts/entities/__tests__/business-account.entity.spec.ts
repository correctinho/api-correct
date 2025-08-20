// Imports da entidade e tipos necessários para o teste
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { BusinessAccountEntity, BusinessAccountCreateCommand } from '../business-account.entity';
import { BusinessAccountStatus } from '@prisma/client';

describe('BusinessAccountEntity Unit Tests', () => {

    // Dados de exemplo para os testes, seguindo o padrão do modelo
    const validCommand: BusinessAccountCreateCommand = {
        balanceInReais: 150.75, // R$ 150,75
        business_info_uuid: new Uuid(),
    };

    // ================================================================= //
    // TESTES DO MÉTODO DE FÁBRICA
    // ================================================================= //
    describe('Factory Method: create()', () => {
        it('deve criar uma entidade com valores convertidos e padrão corretamente', () => {
            const entity = BusinessAccountEntity.create(validCommand);
            const json = entity.toJSON();

            // Verifica se o valor foi convertido para centavos
            expect(json.balance).toBe(15075);
            // Verifica se o status padrão 'active' foi aplicado
            expect(json.status).toBe(BusinessAccountStatus.active);
            // Verifica a atribuição de outras propriedades
            expect(json.business_info_uuid).toBe(validCommand.business_info_uuid.uuid);
        });

        it('deve usar o status fornecido em vez do padrão', () => {
            const commandWithStatus = { ...validCommand, status: BusinessAccountStatus.inactive };
            const entity = BusinessAccountEntity.create(commandWithStatus);
            const json = entity.toJSON();

            expect(json.status).toBe(BusinessAccountStatus.inactive);
        });

        it('deve arredondar o saldo corretamente durante a criação', () => {
            const commandWithRounding = { ...validCommand, balanceInReais: 99.995 };
            const entity = BusinessAccountEntity.create(commandWithRounding);
            const json = entity.toJSON();

            // 99.995 * 100 = 9999.5, que arredonda para 10000
            expect(json.balance).toBe(10000);
        });
    });

    // ================================================================= //
    // TESTES DOS MÉTODOS DE NEGÓCIO (CÁLCULO)
    // ================================================================= //
    describe('Métodos de Negócio: credit() e debit()', () => {
        it('deve creditar e debitar valores corretamente, alterando o saldo interno', () => {
            // 1. Cria a entidade
            const entity = BusinessAccountEntity.create(validCommand); // Saldo inicial: 15075

            // 2. Executa o método de crédito
            entity.credit(5025); // Credita R$ 50,25 (em centavos)

            // 3. Verifica o estado interno através do toJSON()
            let json = entity.toJSON();
            expect(json.balance).toBe(20100); // 15075 + 5025

            // 4. Executa o método de débito
            entity.debit(10100); // Debita R$ 101,00 (em centavos)

            // 5. Verifica o estado interno final
            json = entity.toJSON();
            expect(json.balance).toBe(10000); // 20100 - 10100
        });

        it('deve lançar um erro ao tentar debitar com saldo insuficiente', () => {
            const entity = BusinessAccountEntity.create(validCommand); // Saldo: 15075
            const amountToDebit = 15076; // 1 centavo a mais que o saldo

            expect(() => {
                entity.debit(amountToDebit);
            }).toThrow('Saldo insuficiente.');
        });

        it('deve lançar um erro ao tentar creditar ou debitar um valor negativo', () => {
            const entity = BusinessAccountEntity.create(validCommand);

            expect(() => {
                entity.credit(-1);
            }).toThrow('O valor a ser creditado não pode ser negativo.');

            expect(() => {
                entity.debit(-1);
            }).toThrow('O valor a ser debitado não pode ser negativo.');
        });
    });

    // ================================================================= //
    // TESTES DOS GETTERS
    // ================================================================= //
    describe('Getters', () => {
        it('deve retornar o saldo formatado em Reais', () => {
            const entity = BusinessAccountEntity.create(validCommand); // Saldo interno é 15075
            entity.debit(5075); // Saldo interno agora é 10000

            // O getter deve retornar o valor formatado para exibição
            expect(entity.balance).toBe(100.00);
        });

        it('deve retornar as outras propriedades corretamente através dos getters', () => {
            const entity = BusinessAccountEntity.create(validCommand);

            expect(entity.uuid).toBeInstanceOf(Uuid);
            expect(entity.status).toBe(BusinessAccountStatus.active);
            expect(entity.business_info_uuid).toBe(validCommand.business_info_uuid);
        });
    });
});