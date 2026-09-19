import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { newDateF } from '../../../../utils/date';
import { CompanyAdminJWToken } from '../../../../infra/shared/crypto/token/CompanyAdmin/jwt.token';
import { app } from '../../../../app';
import { JWTToken } from '../../../../infra/shared/crypto/token/CorrectAdmin/jwt.token';

describe('E2E - Refund Partner Sales (Cancelamentos)', () => {
    let partnerAdminToken: string;
    let correctAdminToken: string;
    let businessInfoId: string;
    let userItemId: string;
    let transactionId: string;
    let correctAccountId: string;

    beforeAll(async () => {
        // 1. Setup IDs
        businessInfoId = uuidV4();
        userItemId = uuidV4();
        transactionId = uuidV4();
        const addressId = uuidV4();
        const itemId = uuidV4();
        const userInfoId = uuidV4();
        const partnerUserId = uuidV4();
        const correctAdminId = uuidV4();

        // 2. Criar Endereço e Empresa Parceira
        await prismaClient.address.create({
            data: {
                uuid: addressId,
                postal_code: '00000000'
            }
        });

        await prismaClient.businessInfo.create({
            data: {
                uuid: businessInfoId,
                fantasy_name: 'Parceiro Teste Estorno',
                document: `estorno-${Date.now()}`,
                business_type: 'comercio',
                status: 'active',
                email: `parceiro-${Date.now()}@estorno.com`,
                classification: 'Comércio',
                colaborators_number: 1,
                address_uuid: addressId,
                phone_1: '11999999999',
                created_at: newDateF(new Date()),
                BusinessAccount: {
                    create: {
                        balance: 10000, // 100 reais
                        status: 'active',
                        created_at: newDateF(new Date())
                    }
                },
                BusinessUser: {
                    create: {
                        uuid: partnerUserId,
                        name: 'Admin Parceiro Teste',
                        user_name: 'admin_parceiro_estorno',
                        document: '00000000000',
                        email: 'admin@estorno.com',
                        password: 'hash', // não importa muito o valor
                        is_admin: true,
                        status: 'active',
                        created_at: newDateF(new Date())
                    }
                }
            }
        });

        // 3. Garantir que a CorrectAccount existe e criar o admin Correct
        let correctAcc = await prismaClient.correctAccount.findFirst();
        if (!correctAcc) {
            correctAcc = await prismaClient.correctAccount.create({
                data: {
                    balance: 5000, // 50 reais
                    status: 'active',
                    created_at: newDateF(new Date())
                }
            });
        }
        correctAccountId = correctAcc.uuid;

        await prismaClient.correctAdmin.create({
            data: {
                uuid: correctAdminId,
                name: 'Admin Correct',
                userName: 'correct-admin',
                email: 'admin@correct.com',
                password: 'hash'
            }
        });

        // 4. Criar UserInfo, Item e UserItem (Carteira do Cliente)
        await prismaClient.userInfo.create({
            data: {
                uuid: userInfoId,
                document: `user-${Date.now()}`,
                full_name: 'Test User',
                date_of_birth: '01/01/2000'
            }
        });

        await prismaClient.item.create({
            data: {
                uuid: itemId,
                name: 'Vale Estorno',
                description: 'Vale para testes de estorno',
                item_type: 'gratuito',
                item_category: 'pre_pago',
                created_at: newDateF(new Date())
            }
        });

        await prismaClient.userItem.create({
            data: {
                uuid: userItemId,
                user_info_uuid: userInfoId,
                item_uuid: itemId,
                balance: 2000, // 20 reais
                status: 'active',
                item_name: 'Vale Estorno',
            }
        });

        // 5. Criar a Transação original
        await prismaClient.transactions.create({
            data: {
                uuid: transactionId,
                BusinessInfo: {
                    connect: { uuid: businessInfoId }
                },
                UserItem: {
                    connect: { uuid: userItemId }
                },
                transaction_type: 'POS_PAYMENT',
                status: 'success',
                original_price: 10000,
                net_price: 10000,
                platform_net_fee_amount: 1000,
                cashback: 500,
                partner_credit_amount: 9000,
                paid_at: newDateF(new Date()),
                created_at: newDateF(new Date()),
                updated_at: newDateF(new Date())
            }
        });

        // 6. Gerar Tokens
        const partnerTokenGenerator = new CompanyAdminJWToken();
        partnerAdminToken = partnerTokenGenerator.create({
            uuid: { uuid: partnerUserId },
            business_info_uuid: { uuid: businessInfoId }
        } as any);

        const correctTokenGenerator = new JWTToken();
        correctAdminToken = correctTokenGenerator.create({
            uuid: { uuid: correctAdminId },
            userName: 'correct-admin'
        } as any);
    });

    afterAll(async () => {
        // Limpeza dos dados de teste na ordem reversa de dependência
        await prismaClient.transactions.deleteMany({ where: { uuid: transactionId } });
        await prismaClient.businessAccountHistory.deleteMany();
        await prismaClient.correctAccountHistory.deleteMany();
        await prismaClient.userItemHistory.deleteMany();

        await prismaClient.userItem.deleteMany({ where: { uuid: userItemId } });
        await prismaClient.item.deleteMany({ where: { name: 'Vale Estorno' } });
        await prismaClient.userInfo.deleteMany({ where: { full_name: 'Test User' } });

        await prismaClient.businessAccount.deleteMany({ where: { business_info_uuid: businessInfoId } });
        await prismaClient.businessUser.deleteMany({ where: { business_info_uuid: businessInfoId } });
        await prismaClient.businessInfo.deleteMany({ where: { uuid: businessInfoId } });
        await prismaClient.address.deleteMany({ where: { postal_code: '00000000' } });
        await prismaClient.correctAdmin.deleteMany({ where: { userName: 'correct-admin' } });
    });

    it('should successfully refund a POS transaction by partner within 7 days', async () => {
        // ACT
        const response = await request(app)
            .post(`/business/sales/${transactionId}/cancel`)
            .set('Authorization', `Bearer ${partnerAdminToken}`)
            .send({ reason: 'Cliente desistiu da compra' });

        // ASSERT API
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('cancelled');

        // ASSERT DATABASE BALANCES
        const partnerAccount = await prismaClient.businessAccount.findFirst({
            where: { business_info_uuid: businessInfoId }
        });
        // Saldo inicial era 10000. Debitamos partner_credit_amount (9000)
        expect(partnerAccount?.balance).toBe(1000);

        const correctAccount = await prismaClient.correctAccount.findUnique({
            where: { uuid: correctAccountId }
        });
        // Correto tinha X. Diminui platform_net_fee_amount (1000).

        const userItem = await prismaClient.userItem.findUnique({
            where: { uuid: userItemId }
        });
        // Saldo inicial 2000. Adiciona líquido: original(10000) - cashback(500) = 9500
        expect(userItem?.balance).toBe(2000 + 9500);

        // ASSERT HISTORIES
        const userHistory = await prismaClient.userItemHistory.findFirst({
            where: { related_transaction_uuid: transactionId, event_type: 'REFUND_RECEIVED' }
        });
        expect(userHistory).toBeDefined();
        expect(userHistory?.amount).toBe(9500);

        const partnerHistory = await prismaClient.businessAccountHistory.findFirst({
            where: { related_transaction_uuid: transactionId, event_type: 'REFUND_ISSUED' }
        });
        expect(partnerHistory).toBeDefined();
        expect(partnerHistory?.amount).toBe(-9000);
    });

    it('should fail if transaction status is not success', async () => {
        // SET status to failed
        await prismaClient.transactions.update({
            where: { uuid: transactionId },
            data: { status: 'fail' }
        });

        const response = await request(app)
            .post(`/business/sales/${transactionId}/cancel`)
            .set('Authorization', `Bearer ${partnerAdminToken}`)
            .send({ reason: 'Teste falha' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('status inválido');
    });

    it('should fail if partner tries to refund after 7 days', async () => {
        // SET paid_at to 30 days ago and status back to success
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await prismaClient.transactions.update({
            where: { uuid: transactionId },
            data: {
                status: 'success',
                paid_at: newDateF(thirtyDaysAgo)
            }
        });

        // Reset balances just in case it passes the date check and hits the balance check
        await prismaClient.businessAccount.updateMany({
            where: { business_info_uuid: businessInfoId },
            data: { balance: 10000 }
        });

        const response = await request(app)
            .post(`/business/sales/${transactionId}/cancel`)
            .set('Authorization', `Bearer ${partnerAdminToken}`)
            .send({ reason: 'Fora do prazo' });



        expect(response.status).toBe(400);
        expect(response.body.error).toContain('7 dias');
    });

    it('should successfully refund by Correct Admin ignoring the 7 days rule', async () => {
        // Transaction is still 10 days old and status success (set in previous test)
        // Reset balances so we don't break assertions
        await prismaClient.businessAccount.updateMany({
            where: { business_info_uuid: businessInfoId },
            data: { balance: 10000 }
        });
        await prismaClient.userItem.update({
            where: { uuid: userItemId },
            data: { balance: 2000 }
        });

        const response = await request(app)
            .post(`/admin/sales/${transactionId}/cancel`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send({ reason: 'Admin override cancel' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('cancelled');

        const userItem = await prismaClient.userItem.findUnique({
            where: { uuid: userItemId }
        });
        expect(userItem?.balance).toBe(2000 + 9500);
    });

    it('should successfully refund a POS transaction with PENDING PartnerCredit without debiting business account', async () => {
        // 1. Create a new transaction
        const newTxId = uuidV4();
        await prismaClient.transactions.create({
            data: {
                uuid: newTxId,
                BusinessInfo: { connect: { uuid: businessInfoId } },
                UserItem: { connect: { uuid: userItemId } },
                transaction_type: 'POS_PAYMENT',
                status: 'success',
                original_price: 5000,
                net_price: 5000,
                platform_net_fee_amount: 500,
                cashback: 0,
                partner_credit_amount: 4500,
                paid_at: newDateF(new Date()),
                created_at: newDateF(new Date()),
                updated_at: newDateF(new Date())
            }
        });
        
        // 2. Create the PENDING PartnerCredit
        const businessAccount = await prismaClient.businessAccount.findFirst({ where: { business_info_uuid: businessInfoId }});
        await prismaClient.partnerCredit.create({
            data: {
                business_account_uuid: businessAccount.uuid,
                original_transaction_uuid: newTxId,
                balance: 4500,
                spent_amount: 0,
                status: 'PENDING',
                availability_date: new Date()
            }
        });

        // Ensure BusinessAccount has a specific balance before test
        await prismaClient.businessAccount.updateMany({
            where: { business_info_uuid: businessInfoId },
            data: { balance: 10000 }
        });

        const userItem = await prismaClient.userItem.findUnique({ where: { uuid: userItemId }});
        const initialUserBalance = userItem.balance;

        // 3. ACT - Cancel the transaction
        const response = await request(app)
            .post(`/business/sales/${newTxId}/cancel`)
            .set('Authorization', `Bearer ${partnerAdminToken}`)
            .send({ reason: 'Cancelamento de teste com crédito' });

        // 4. ASSERT API
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('cancelled');

        // 5. ASSERT DATABASE
        // O PartnerCredit deve estar CANCELLED
        const credit = await prismaClient.partnerCredit.findFirst({ where: { original_transaction_uuid: newTxId } });
        expect(credit?.status).toBe('CANCELLED');

        // O saldo da conta do parceiro NÃO deve ter sido debitado (permanece 10000)
        const partnerAccountAfter = await prismaClient.businessAccount.findFirst({ where: { business_info_uuid: businessInfoId }});
        expect(partnerAccountAfter?.balance).toBe(10000);

        // O usuário final recebe o estorno normalmente (5000)
        const userItemAfter = await prismaClient.userItem.findUnique({ where: { uuid: userItemId }});
        expect(userItemAfter?.balance).toBe(initialUserBalance + 5000);
        
        // Histórico de conta do parceiro NÃO deve ter REFUND_ISSUED para esta transação
        const partnerHistory = await prismaClient.businessAccountHistory.findFirst({
            where: { related_transaction_uuid: newTxId, event_type: 'REFUND_ISSUED' }
        });
        expect(partnerHistory).toBeNull();
    });

    it('should successfully refund a POS transaction with PENDING PartnerCredit via Correct Admin without debiting business account', async () => {
        // 1. Create a new transaction
        const newTxId = uuidV4();
        await prismaClient.transactions.create({
            data: {
                uuid: newTxId,
                BusinessInfo: { connect: { uuid: businessInfoId } },
                UserItem: { connect: { uuid: userItemId } },
                transaction_type: 'POS_PAYMENT',
                status: 'success',
                original_price: 5000,
                net_price: 5000,
                platform_net_fee_amount: 500,
                cashback: 0,
                partner_credit_amount: 4500,
                paid_at: newDateF(new Date()),
                created_at: newDateF(new Date()),
                updated_at: newDateF(new Date())
            }
        });
        
        // 2. Create the PENDING PartnerCredit
        const businessAccount = await prismaClient.businessAccount.findFirst({ where: { business_info_uuid: businessInfoId }});
        await prismaClient.partnerCredit.create({
            data: {
                business_account_uuid: businessAccount.uuid,
                original_transaction_uuid: newTxId,
                balance: 4500,
                spent_amount: 0,
                status: 'PENDING',
                availability_date: new Date()
            }
        });

        // Ensure BusinessAccount has a specific balance before test
        await prismaClient.businessAccount.updateMany({
            where: { business_info_uuid: businessInfoId },
            data: { balance: 10000 }
        });

        const userItem = await prismaClient.userItem.findUnique({ where: { uuid: userItemId }});
        const initialUserBalance = userItem.balance;

        // 3. ACT - Cancel the transaction VIA CORRECT ADMIN
        const response = await request(app)
            .post(`/admin/sales/${newTxId}/cancel`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send({ reason: 'Admin cancelamento de teste com crédito' });

        // 4. ASSERT API
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('cancelled');

        // 5. ASSERT DATABASE
        const credit = await prismaClient.partnerCredit.findFirst({ where: { original_transaction_uuid: newTxId } });
        expect(credit?.status).toBe('CANCELLED');

        const partnerAccountAfter = await prismaClient.businessAccount.findFirst({ where: { business_info_uuid: businessInfoId }});
        expect(partnerAccountAfter?.balance).toBe(10000);

        const userItemAfter = await prismaClient.userItem.findUnique({ where: { uuid: userItemId }});
        expect(userItemAfter?.balance).toBe(initialUserBalance + 5000);
        
        const partnerHistory = await prismaClient.businessAccountHistory.findFirst({
            where: { related_transaction_uuid: newTxId, event_type: 'REFUND_ISSUED' }
        });
        expect(partnerHistory).toBeNull();
    });
});


