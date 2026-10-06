import request from 'supertest';
import { app } from '../../../app';
import { prismaClient } from '../../../infra/databases/prisma.config';
import { v4 as uuidV4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { SicrediPixProvider } from '../../../infra/providers/PixProvider/implementations/sicredi/sicredi-pix.provider';
import { AxiosSlackProvider } from '../../../infra/providers/SlackProvider';
import { CloudflareR2Storage } from '../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage';

// Mocks
jest.mock('../../../infra/providers/PixProvider/implementations/sicredi/sicredi-pix.provider');
jest.mock('../../../infra/providers/SlackProvider');
jest.mock('../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage');

describe('Business Recharge E2E', () => {
    let companyToken: string;
    let businessId: string;
    let itemId: string;
    let userItemUuid: string;
    let userInfoId: string;

    let mockProviderTxId = 'mock-txid-123';
    let currentOrderUuid: string;

    beforeAll(async () => {
        // Setup mocks
        
        let counter = 1;
        (SicrediPixProvider.prototype.createImmediateCharge as jest.Mock).mockImplementation(() => {
            const txid = 'mock-txid-' + Date.now() + '-' + counter++;
            return Promise.resolve({
                txid: txid,
                pixCopiaECola: 'mock-pix-copia-e-cola'
            });
        });

        (AxiosSlackProvider.prototype.sendRechargeOrderAlert as jest.Mock).mockResolvedValue(undefined);
        (CloudflareR2Storage.prototype.upload as jest.Mock).mockResolvedValue({ data: { url: 'https://mock-url.com/receipt.pdf', path: 'receipt.pdf' }, error: null });

        businessId = uuidV4();
        const address = await prismaClient.address.create({
            data: {
                uuid: uuidV4(),
                line1: 'Rua Teste',
                postal_code: '00000000',
                city: 'City',
                state: 'SP',
                country: 'Brasil'
            }
        });

        const company = await prismaClient.businessInfo.create({
            data: {
                uuid: businessId,
                document: `${Math.floor(Math.random() * 99999999999999).toString().padStart(14, '0')}`,
                classification: 'A',
                colaborators_number: 1,
                status: 'pending_contract',
                phone_1: '11999999999',
                email: `employer-${businessId}@correct.com`,
                business_type: 'empregador',
                address_uuid: address.uuid,
                fantasy_name: 'Test Employer',
                created_at: new Date().toISOString()
            }
        });

        const companyUser = await prismaClient.businessUser.create({
            data: {
                uuid: uuidV4(),
                business_info_uuid: businessId,
                name: 'Admin Test',
                email: 'admin@test.com',
                password: 'hashedpassword',
                is_admin: true,
                status: 'active',
                created_at: new Date().toISOString()
            }
        });

        const tokenSecret = process.env.SECRET_KEY_TOKEN_COMPANY_ADMIN || '';
        const tokenSecretCrypto = require('crypto').createHmac('sha256', tokenSecret).digest('base64');

        // Setup token
        companyToken = jwt.sign({ 
            businessUser: {
                uuid: companyUser.uuid,
                business_info_uuid: companyUser.business_info_uuid
            }
        }, tokenSecretCrypto, {
            subject: companyUser.uuid,
            expiresIn: '1d'
        });

        itemId = uuidV4();
        await prismaClient.item.create({
            data: {
                uuid: itemId,
                name: 'Item Teste E2E',
                description: 'Description',
                item_category: 'pre_pago',
                item_type: 'gratuito',
                created_at: new Date().toISOString()
            }
        });

        userInfoId = uuidV4();
        await prismaClient.userInfo.create({
            data: {
                uuid: userInfoId,
                document: `12345678901`,
                full_name: 'Employee Test',
                email: 'employee@test.com',
                phone: '11999999999',
                status: 'active',
                date_of_birth: '1990-01-01',
                created_at: new Date().toISOString()
            }
        });

        userItemUuid = uuidV4();
        await prismaClient.userItem.create({
            data: {
                uuid: userItemUuid,
                user_info_uuid: userInfoId,
                item_uuid: itemId,
                business_info_uuid: businessId,
                balance: 0, // Starts at 0
                status: 'active',
                item_name: 'Item Teste E2E',
                created_at: new Date().toISOString()
            }
        });
    });

    afterAll(async () => {
        // Clean up everything we created
        await prismaClient.userItemHistory.deleteMany({ where: { user_item_uuid: userItemUuid } });
        await prismaClient.businessOrderItem.deleteMany({ where: { user_item_uuid: userItemUuid } });
        await prismaClient.businessOrder.deleteMany({ where: { business_info_uuid: businessId } });
        await prismaClient.transactions.deleteMany({ where: { payer_business_info_uuid: businessId } });
        await prismaClient.userItem.deleteMany({ where: { uuid: userItemUuid } });
        await prismaClient.userInfo.deleteMany({ where: { uuid: userInfoId } });
        await prismaClient.item.deleteMany({ where: { uuid: itemId } });
        await prismaClient.businessUser.deleteMany({ where: { business_info_uuid: businessId } });
        await prismaClient.businessInfo.deleteMany({ where: { uuid: businessId } });
    });

    describe('Cenário 1: Fluxo Automatizado Completo (PIX + Webhook)', () => {
        it('Deve criar o pedido de recarga (BusinessOrder e Transactions) como PENDING', async () => {
            const payload = {
                item_uuid: itemId,
                items: [
                    {
                        user_item_uuid: userItemUuid,
                        amount: 150.50
                    }
                ]
            };

            const response = await request(app)
                .post('/user-item/employer/recharge-order')
                .set('Authorization', `Bearer ${companyToken}`)
                .send(payload);
            console.log(response.body);
            expect(response.status).toBe(201);

            // Verifica o BusinessOrder criado
            const order = await prismaClient.businessOrder.findFirst({
                where: { business_info_uuid: businessId },
                include: { OrderItems: true }
            });
            expect(order).toBeDefined();
            expect(order?.status).toBe('PENDING');
            expect(order?.total_amount).toBe(15050); // 150.50 in cents
            expect(order?.provider_tx_id).toBeDefined();
            mockProviderTxId = order!.provider_tx_id!;

            currentOrderUuid = order!.uuid;

            // Verifica se a Transactions foi criada
            const transaction = await prismaClient.transactions.findFirst({
                where: { provider_tx_id: mockProviderTxId }
            });
            expect(transaction).toBeDefined();
            expect(transaction?.transaction_type).toBe('COMPANY_PRE_PAID_RECHARGE');
            expect(transaction?.status).toBe('pending');
            expect(transaction?.original_price).toBe(15050);
        });

        it('Deve rejeitar webhook se o valor for diferente', async () => {
            const webhookPayload = {
                pix: [
                    {
                        txid: mockProviderTxId,
                        valor: "100.00", // Errado (esperado 150.50)
                        horario: new Date().toISOString(),
                        endToEndId: "E2E123TEST"
                    }
                ]
            };

            const response = await request(app)
                .post('/webhooks/sicredi-pix')
                .send(webhookPayload);

            // Webhook retorna 400 em falha de processamento de negócio (opcionalmente 500, dependendo da config)
            expect(response.status).toBeGreaterThanOrEqual(400);

            // Verifica que o pedido continua PENDING
            const order = await prismaClient.businessOrder.findUnique({ where: { uuid: currentOrderUuid } });
            expect(order?.status).toBe('PENDING');

            // Saldo não pode ter mudado
            const userItem = await prismaClient.userItem.findUnique({ where: { uuid: userItemUuid } });
            expect(userItem?.balance).toBe(0);
        });

        it('Deve aprovar o pedido via Webhook Sicredi PIX e distribuir saldos', async () => {
            const webhookPayload = {
                pix: [
                    {
                        txid: mockProviderTxId,
                        valor: "150.50", // Correto
                        horario: new Date().toISOString(),
                        endToEndId: "E2E123TEST"
                    }
                ]
            };

            const response = await request(app)
                .post('/webhooks/sicredi-pix')
                .send(webhookPayload);
            if(response.status !== 200) console.log(response.body);
            expect(response.status).toBe(200);

            // Verifica que o pedido mudou para PAID
            const order = await prismaClient.businessOrder.findUnique({ where: { uuid: currentOrderUuid } });
            expect(order?.status).toBe('PAID');

            // Verifica a Transação mudou para SUCCESS
            const transaction = await prismaClient.transactions.findFirst({ where: { provider_tx_id: mockProviderTxId } });
            expect(transaction?.status).toBe('success');

            // Verifica o saldo distribuído no UserItem
            const userItem = await prismaClient.userItem.findUnique({ where: { uuid: userItemUuid } });
            expect(userItem?.balance).toBe(15050); // Deve ter 15050 centavos

            // Verifica Histórico
            const history = await prismaClient.userItemHistory.findFirst({
                where: { user_item_uuid: userItemUuid, event_type: 'BENEFIT_CREDITED' }
            });
            expect(history).toBeDefined();
            expect(history?.amount).toBe(15050);
        });
    });

    describe('Cenário 3: Fluxo Manual (TED/Transferência)', () => {
        let manualOrderUuid: string;

        it('Deve criar outro pedido de recarga para TED', async () => {
            const payload = {
                item_uuid: itemId,
                items: [
                    {
                        user_item_uuid: userItemUuid,
                        amount: 50.00
                    }
                ]
            };

            const response = await request(app)
                .post('/user-item/employer/recharge-order')
                .set('Authorization', `Bearer ${companyToken}`)
                .send(payload);
            if(response.status !== 201) console.log(response.body);
            expect(response.status).toBe(201);

            const order = await prismaClient.businessOrder.findFirst({
                where: { total_amount: 5000 },
                orderBy: { created_at: 'desc' }
            });
            expect(order).toBeDefined();
            manualOrderUuid = order!.uuid;
        });

        it('Deve anexar comprovante, salvar no bucket Privado e notificar Admin', async () => {
            const response = await request(app)
                .post(`/business/orders/${manualOrderUuid}/upload-receipt`)
                .set('Authorization', `Bearer ${companyToken}`)
                .attach('file', Buffer.from('mock-file-content'), 'comprovante.pdf'); // Multipart file upload
            if(response.status !== 200 && response.status !== 201) console.log(response.body);
            expect(response.status).toBeGreaterThanOrEqual(200); expect(response.status).toBeLessThan(300);

            // Verifica chamada ao Cloudflare mockada
            expect(CloudflareR2Storage.prototype.upload).toHaveBeenCalled();

            // Verifica chamada ao Slack
            expect(AxiosSlackProvider.prototype.sendRechargeOrderAlert).toHaveBeenCalled();

            // Verifica se o Order salvou o link
            const order = await prismaClient.businessOrder.findUnique({ where: { uuid: manualOrderUuid } });
            expect(order?.payment_proof_url).toBe('https://mock-url.com/receipt.pdf');
            expect(order?.status).toBe('PENDING'); // Ainda pending pois só enviou comprovante
        });
    });
});
