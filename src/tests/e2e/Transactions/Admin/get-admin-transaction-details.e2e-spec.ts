import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { newDateF } from '../../../../utils/date';
import { app } from '../../../../app';
import { JWTToken } from '../../../../infra/shared/crypto/token/CorrectAdmin/jwt.token';

describe('E2E - Get Admin Transaction Details', () => {
    let correctAdminToken: string;
    let businessInfoId: string;
    let userItemId: string;
    let transactionId: string;

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

        // 2. Create entities
        await prismaClient.address.create({
            data: {
                uuid: addressId,
                postal_code: '00000000'
            }
        });

        await prismaClient.businessInfo.create({
            data: {
                uuid: businessInfoId,
                fantasy_name: 'Parceiro Teste Detalhes',
                document: `detalhes-${Date.now()}`,
                business_type: 'comercio',
                status: 'active',
                email: `detalhes-${Date.now()}@teste.com`,
                classification: 'Comércio',
                colaborators_number: 1,
                address_uuid: addressId,
                phone_1: '11999999999',
                created_at: newDateF(new Date()),
                BusinessAccount: {
                    create: {
                        balance: 10000,
                        status: 'active',
                        created_at: newDateF(new Date())
                    }
                },
            }
        });

        await prismaClient.correctAdmin.create({
            data: {
                uuid: correctAdminId,
                name: 'Admin Correct Details',
                userName: 'correct-admin-details',
                email: 'admin-details@correct.com',
                password: 'hash'
            }
        });

        await prismaClient.userInfo.create({
            data: {
                uuid: userInfoId,
                document: `user-${Date.now()}`,
                full_name: 'Test User Details',
                date_of_birth: '01/01/2000'
            }
        });

        await prismaClient.item.create({
            data: {
                uuid: itemId,
                name: 'Vale Detalhes',
                description: 'Vale para testes de detalhes',
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
                balance: 2000,
                status: 'active',
                item_name: 'Vale Detalhes',
            }
        });

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

        await prismaClient.businessAccountHistory.create({
            data: {
                uuid: uuidV4(),
                related_transaction_uuid: transactionId,
                amount: 9000,
                balance_before: 1000,
                balance_after: 10000,
                business_account_uuid: (await prismaClient.businessAccount.findFirst({ where: { business_info_uuid: businessInfoId } }))!.uuid,
                event_type: 'PAYMENT_RECEIVED',
                created_at: new Date()
            }
        });

        const correctTokenGenerator = new JWTToken();
        correctAdminToken = correctTokenGenerator.create({
            uuid: { uuid: correctAdminId },
            userName: 'correct-admin-details'
        } as any);
    });

    afterAll(async () => {
        await prismaClient.transactions.deleteMany({ where: { uuid: transactionId } });
        await prismaClient.businessAccountHistory.deleteMany();
        
        await prismaClient.userItem.deleteMany({ where: { uuid: userItemId } });
        await prismaClient.item.deleteMany({ where: { name: 'Vale Detalhes' } });
        await prismaClient.userInfo.deleteMany({ where: { full_name: 'Test User Details' } });

        await prismaClient.businessAccount.deleteMany({ where: { business_info_uuid: businessInfoId } });
        await prismaClient.businessInfo.deleteMany({ where: { uuid: businessInfoId } });
        await prismaClient.address.deleteMany({ where: { postal_code: '00000000' } });
        await prismaClient.correctAdmin.deleteMany({ where: { userName: 'correct-admin-details' } });
    });

    it('should successfully get transaction details', async () => {
        const response = await request(app)
            .get(`/admin/sales/${transactionId}/details`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send();

        expect(response.status).toBe(200);
        
        const data = response.body;
        
        expect(data.header.uuid).toBe(transactionId);
        expect(data.header.status).toBe('success');
        expect(data.financials.original_price).toBe(10000);
        expect(data.financials.cashback).toBe(500);
        
        expect(data.payer.name).toBe('Test User Details');
        expect(data.payee.name).toBe('Parceiro Teste Detalhes');
        
        expect(data.accounting.history_events).toHaveLength(1);
        expect(data.accounting.history_events[0].amount).toBe(9000);
    });

    it('should return 404 for a non-existent transaction', async () => {
        const fakeId = uuidV4();
        const response = await request(app)
            .get(`/admin/sales/${fakeId}/details`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send();

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Transação não encontrada');
    });

    it('should return 401 without auth token', async () => {
        const response = await request(app)
            .get(`/admin/sales/${transactionId}/details`)
            .send();

        expect(response.status).toBe(401);
    });
});
