import request from 'supertest';
import { app } from '../../../../app';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { v4 as uuidV4 } from 'uuid';
import jwt from 'jsonwebtoken';

describe('GET /admin/recharge-orders (1)', () => {
    let adminToken: string;
    let correctAdminId: string;
    let businessId: string;
    let itemId: string;
    let orderId: string;

    beforeAll(async () => {
        correctAdminId = uuidV4();
        await prismaClient.correctAdmin.create({
            data: {
                uuid: correctAdminId,
                name: 'Test Admin',
                password: 'password123',
                userName: 'Test Admin',
                email: `admin-${correctAdminId}@correct.com`,
                isAdmin: true
            }
        });

        adminToken = jwt.sign({}, process.env.JWT_SECRET_KEY || 'defaultsecret', {
            subject: correctAdminId,
            expiresIn: '1d'
        });

        businessId = uuidV4();
        const address = await prismaClient.address.create({
            data: {
                uuid: uuidV4(),
                line1: 'Rua',
                postal_code: '00000000',
                city: 'City',
                state: 'SP',
                country: 'Brasil'
            }
        });

        await prismaClient.businessInfo.create({
            data: {
                uuid: businessId,
                document: `${Math.floor(Math.random() * 99999999999999).toString().padStart(14, '0')}`,
                classification: 'A',
                colaborators_number: 1,
                status: 'pending_contract',
                phone_1: '11999999999',
                email: `test-${businessId}@business.com`,
                business_type: 'empregador',
                Address: { connect: { uuid: address.uuid } },
                fantasy_name: 'Test Business',
                created_at: new Date().toISOString()
            }
        });

        itemId = uuidV4();
        await prismaClient.item.create({
            data: {
                uuid: itemId,
                name: 'Item Teste',
                item_category: 'pre_pago',
                description: 'Description',
                item_type: 'produto',
                created_at: new Date().toISOString()
            }
        });

        orderId = uuidV4();
        await prismaClient.businessOrder.create({
            data: {
                uuid: orderId,
                business_info_uuid: businessId,
                item_uuid: itemId,
                total_amount: 15000,
                status: 'PENDING'
            }
        });
    });

    afterAll(async () => {
        await prismaClient.businessOrder.deleteMany({ where: { business_info_uuid: businessId } });
        await prismaClient.item.deleteMany({ where: { uuid: itemId } });
        await prismaClient.businessInfo.deleteMany({ where: { uuid: businessId } });
        await prismaClient.correctAdmin.deleteMany({ where: { uuid: correctAdminId } });
    });

    it('should list all recharge orders when authenticated as Correct Admin', async () => {
        const response = await request(app)
            .get('/admin/recharge-orders')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);

        const order = response.body.data.find((o: any) => o.uuid === orderId);
        expect(order).toBeDefined();
        expect(order.business_fantasy_name).toBe('Test Business');
        expect(order.total_amount).toBe(150);
        expect(order.status).toBe('PENDING');
    });

    it('should filter by status', async () => {
        const response = await request(app)
            .get('/admin/recharge-orders?status=PENDING')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        const order = response.body.data.find((o: any) => o.uuid === orderId);
        expect(order).toBeDefined();
    });

    it('should return 401 if not authenticated', async () => {
        const response = await request(app)
            .get('/admin/recharge-orders');

        expect(response.status).toBe(401);
    });
});