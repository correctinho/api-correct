import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { app } from '../../../../app';
import { createTestBusinessInfo } from '../../helpers/test-factories';
import { JWTToken } from '../../../../infra/shared/crypto/token/CorrectAdmin/jwt.token';

describe('E2E - Manual Payment Confirmation', () => {
    let correctAdminToken: string;
    let correctAdminId: string;
    let businessId: string;

    beforeAll(async () => {
        correctAdminId = uuidV4();
        businessId = uuidV4();

        // Create Admin
        await prismaClient.correctAdmin.create({
            data: {
                uuid: correctAdminId,
                name: 'Admin Test',
                userName: 'admin_test_payment',
                email: 'admin_payment@test.com',
                password: '123'
            }
        });

        const correctTokenGenerator = new JWTToken();
        correctAdminToken = correctTokenGenerator.create({
            uuid: { uuid: correctAdminId },
            userName: 'admin_test_payment'
        } as any);

        // Create Business in awaiting_payment
        await createTestBusinessInfo({
            uuid: businessId,
            document: '00000000000002',
            status: 'awaiting_payment'
        });
    });

    afterAll(async () => {
        await prismaClient.businessInfo.deleteMany({ where: { uuid: businessId } });
        await prismaClient.correctAdmin.deleteMany({ where: { uuid: correctAdminId } });
    });

    it('should change status to pending_approval when manual payment is confirmed', async () => {
        const response = await request(app)
            .patch(`/admin/business/${businessId}/manual-payment`)
            .set('Authorization', `Bearer ${correctAdminToken}`);

        expect(response.status).toBe(200);

        const businessInfo = await prismaClient.businessInfo.findUnique({
            where: { uuid: businessId }
        });

        expect(businessInfo?.status).toBe('pending_approval');
    });

    it('should return 400 if business is not awaiting_payment', async () => {
        const response = await request(app)
            .patch(`/admin/business/${businessId}/manual-payment`)
            .set('Authorization', `Bearer ${correctAdminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('aguardando pagamento');
    });
});
