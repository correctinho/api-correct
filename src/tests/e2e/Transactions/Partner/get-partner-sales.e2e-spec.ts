import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { newDateF } from '../../../../utils/date';
import { CompanyAdminJWToken } from '../../../../infra/shared/crypto/token/CompanyAdmin/jwt.token';
import { app } from '../../../../app';

describe('E2E - Get Partner Sales (Minhas Vendas)', () => {
    let partnerAdminToken: string;
    let businessInfoId: string;
    let otherBusinessInfoId: string;
    let emptyPartnerBusinessInfoId: string;
    let emptyPartnerAdminToken: string;
    let otherTransactionId: string;

    beforeAll(async () => {
        businessInfoId = uuidV4();
        otherBusinessInfoId = uuidV4();
        emptyPartnerBusinessInfoId = uuidV4();
        const partnerUserId = uuidV4();
        const emptyPartnerUserId = uuidV4();

        const addressId = uuidV4();
        await prismaClient.address.create({
            data: {
                uuid: addressId,
                postal_code: '00000000'
            }
        });

        // 1. Criar Parceiro
        await prismaClient.businessInfo.create({
            data: {
                uuid: businessInfoId,
                fantasy_name: 'Parceiro Teste Listagem',
                document: `lista-${Date.now()}`,
                business_type: 'comercio',
                status: 'active',
                email: `parceiro-lista-${Date.now()}@test.com`,
                classification: 'Comércio',
                colaborators_number: 1,
                address_uuid: addressId,
                phone_1: '11999999999',
                created_at: newDateF(new Date()),
                BusinessUser: {
                    create: {
                        uuid: partnerUserId,
                        name: 'Admin Parceiro Teste',
                        user_name: 'admin_parceiro_lista',
                        document: '00000000000',
                        email: 'admin_lista@test.com',
                        password: 'hash',
                        is_admin: true,
                        status: 'active',
                        created_at: newDateF(new Date())
                    }
                }
            }
        });

        // 2. Criar Outro Parceiro (Para testar se não vaza transação)
        await prismaClient.businessInfo.create({
            data: {
                uuid: otherBusinessInfoId,
                fantasy_name: 'Outro Parceiro',
                document: `outro-${Date.now()}`,
                business_type: 'comercio',
                status: 'active',
                email: `outro-${Date.now()}@test.com`,
                classification: 'Comércio',
                colaborators_number: 1,
                address_uuid: addressId,
                phone_1: '11999999999',
                created_at: newDateF(new Date()),
            }
        });

        // 2.5 Criar Parceiro Vazio (Sem transações)
        await prismaClient.businessInfo.create({
            data: {
                uuid: emptyPartnerBusinessInfoId,
                fantasy_name: 'Parceiro Vazio',
                document: `vazio-${Date.now()}`,
                business_type: 'comercio',
                status: 'active',
                email: `vazio-${Date.now()}@test.com`,
                classification: 'Comércio',
                colaborators_number: 1,
                address_uuid: addressId,
                phone_1: '11999999999',
                created_at: newDateF(new Date()),
                BusinessUser: {
                    create: {
                        uuid: emptyPartnerUserId,
                        name: 'Admin Parceiro Vazio',
                        user_name: 'admin_parceiro_vazio',
                        document: '11111111111',
                        email: 'admin_vazio@test.com',
                        password: 'hash',
                        is_admin: true,
                        status: 'active',
                        created_at: newDateF(new Date())
                    }
                }
            }
        });

        // 3. Criar Transações para o Parceiro Principal (20 transações para testar paginação)
        const transactionsToCreate = Array.from({ length: 20 }).map((_, index) => ({
            uuid: uuidV4(),
            favored_business_info_uuid: businessInfoId,
            transaction_type: 'POS_PAYMENT' as const,
            status: 'success' as const,
            original_price: 1000 + index * 100, // 10,00 etc
            net_price: 1000 + index * 100,
            partner_credit_amount: 900 + index * 90,
            platform_net_fee_amount: 100 + index * 10,
            description: `Transação ${index}`,
            created_at: newDateF(new Date()),
        }));

        await prismaClient.transactions.createMany({
            data: transactionsToCreate
        });

        // 4. Criar Transações para o Outro Parceiro (Para garantir isolamento)
        otherTransactionId = uuidV4();
        await prismaClient.transactions.create({
            data: {
                uuid: otherTransactionId,
                favored_business_info_uuid: otherBusinessInfoId,
                transaction_type: 'POS_PAYMENT',
                status: 'success',
                original_price: 5000,
                net_price: 5000,
                partner_credit_amount: 4500,
                description: `Transação Outro Parceiro`,
                created_at: newDateF(new Date()),
            }
        });

        // 5. Gerar Token JWT
        const companyAdminJWT = new CompanyAdminJWToken();
        partnerAdminToken = companyAdminJWT.create({
            uuid: { uuid: partnerUserId },
            business_info_uuid: { uuid: businessInfoId }
        } as any);

        emptyPartnerAdminToken = companyAdminJWT.create({
            uuid: { uuid: emptyPartnerUserId },
            business_info_uuid: { uuid: emptyPartnerBusinessInfoId }
        } as any);
    });

    afterAll(async () => {
        // Limpar banco de dados
        await prismaClient.transactions.deleteMany({
            where: {
                favored_business_info_uuid: {
                    in: [businessInfoId, otherBusinessInfoId]
                }
            }
        });
        await prismaClient.businessUser.deleteMany({ where: { business_info_uuid: { in: [businessInfoId, emptyPartnerBusinessInfoId] } } });
        await prismaClient.businessInfo.deleteMany({
            where: {
                uuid: {
                    in: [businessInfoId, otherBusinessInfoId, emptyPartnerBusinessInfoId]
                }
            }
        });
    });

    it('should list partner sales with default pagination (limit 15)', async () => {
        const response = await request(app)
            .get('/business/sales')
            .set('Authorization', `Bearer ${partnerAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');

        const { data, meta } = response.body;

        expect(data.length).toBe(15);
        expect(meta.totalCount).toBe(20);
        expect(meta.totalPages).toBe(2);
        expect(meta.currentPage).toBe(1);
        expect(meta.limit).toBe(15);
    });

    it('should list partner sales on page 2 (remaining 5 items)', async () => {
        const response = await request(app)
            .get('/business/sales?page=2&limit=15')
            .set('Authorization', `Bearer ${partnerAdminToken}`);

        expect(response.status).toBe(200);

        const { data, meta } = response.body;

        expect(data.length).toBe(5);
        expect(meta.totalCount).toBe(20);
        expect(meta.currentPage).toBe(2);
    });

    it('should fail if limit is invalid (too high)', async () => {
        const response = await request(app)
            .get('/business/sales?limit=150') // Max is 100
            .set('Authorization', `Bearer ${partnerAdminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid limit parameter');
    });

    it('should fail if limit is invalid (less than 1)', async () => {
        const response = await request(app)
            .get('/business/sales?limit=0')
            .set('Authorization', `Bearer ${partnerAdminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid limit parameter');
    });

    it('should fail if limit is invalid (not a number)', async () => {
        const response = await request(app)
            .get('/business/sales?limit=abc')
            .set('Authorization', `Bearer ${partnerAdminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid limit parameter');
    });

    it('should fail if page is invalid (less than 1)', async () => {
        const response = await request(app)
            .get('/business/sales?page=0&limit=15')
            .set('Authorization', `Bearer ${partnerAdminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid page parameter');
    });

    it('should fail if user is not authenticated', async () => {
        const response = await request(app)
            .get('/business/sales');

        expect(response.status).toBe(401); // Ou 403, dependendo do middleware, geralmente 401
    });

    it('should return empty list if partner has no transactions', async () => {
        const response = await request(app)
            .get('/business/sales')
            .set('Authorization', `Bearer ${emptyPartnerAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(0);
        expect(response.body.meta.totalCount).toBe(0);
    });

    it('should only return sales from the authenticated partner', async () => {
        const response = await request(app)
            .get('/business/sales?limit=50')
            .set('Authorization', `Bearer ${partnerAdminToken}`);

        expect(response.status).toBe(200);
        const { data } = response.body;

        // Ensure it doesn't return the transaction from 'otherBusinessInfoId'
        expect(data.length).toBe(20);

        // Verifica se a transação do outro parceiro não está na lista
        const hasOtherPartnerTransaction = data.some((tx: any) => tx.uuid === otherTransactionId);
        expect(hasOtherPartnerTransaction).toBe(false);
    });
});
