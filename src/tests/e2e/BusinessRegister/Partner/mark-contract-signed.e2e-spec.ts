import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { app } from '../../../../app';




import { GenerateContractPdfUsecase } from '../../../../modules/business/application/usecases/generate-contract-pdf.usecase';
jest.mock('../../../../modules/business/application/usecases/generate-contract-pdf.usecase');
import { createTestBusinessInfo } from '../../helpers/test-factories';
import { JWTToken } from '../../../../infra/shared/crypto/token/CorrectAdmin/jwt.token';

describe('E2E - Mark Contract Signed', () => {
    let correctAdminToken: string;
    let correctAdminId: string;
    let businessId: string;

    
    beforeAll(async () => {
        (GenerateContractPdfUsecase.prototype.execute as jest.Mock).mockResolvedValue(Buffer.from('MOCKED_PDF_BUFFER'));

        correctAdminId = uuidV4();
        businessId = uuidV4();

        // Create Admin
        await prismaClient.correctAdmin.create({
            data: {
                uuid: correctAdminId,
                name: 'Admin Test',
                userName: 'admin_test_contract',
                email: 'admin_contract@test.com',
                password: '123'
            }
        });

        const correctTokenGenerator = new JWTToken();
        correctAdminToken = correctTokenGenerator.create({
            uuid: { uuid: correctAdminId },
            userName: 'admin_test_contract',
            name: 'admin',
            email: 'admin@admin.com'
        } as any);

        // Create Business in pending_contract
        // Seed terms of service
        await prismaClient.termsOfService.create({
            data: {
                uuid: 'term-uuid-1234',
                version: '1.0',
                type: 'B2B_BUSINESS_MSA',
                content: 'Test terms',
                is_active: true
            }
        });

        await createTestBusinessInfo({
            uuid: businessId,
            document: '00000000000001',
            status: 'pending_contract'
        });
    });

    afterAll(async () => {
        await prismaClient.businessContract.deleteMany({ where: { business_info_uuid: businessId } });
        await prismaClient.businessInfo.deleteMany({ where: { uuid: businessId } });
        await prismaClient.correctAdmin.deleteMany({ where: { uuid: correctAdminId } });
        await prismaClient.termsOfService.deleteMany({ where: { uuid: 'term-uuid-1234' } });
    });

    it('should mark contract as signed and change status to awaiting_payment', async () => {
        const response = await request(app)
            .patch(`/admin/business/${businessId}/contract-signed`)
            .set('Authorization', `Bearer ${correctAdminToken}`);

        if (response.status !== 200) console.log('RESPONSE TEXT:', response.text, 'BODY:', response.body);
        expect(response.status).toBe(200);

        const businessInfo = await prismaClient.businessInfo.findUnique({
            where: { uuid: businessId }
        });

        expect(businessInfo?.status).toBe('awaiting_payment');

        const contract = await prismaClient.businessContract.findFirst({
            where: { business_info_uuid: businessId }
        });
        expect(contract).toBeTruthy();
        expect(contract?.status).toBe('SIGNED');
    });
    it('should generate a PDF contract', async () => {
        const response = await request(app)
            .get(`/admin/business/${businessId}/contract-pdf`)
            .set('Authorization', `Bearer ${correctAdminToken}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/pdf');
        
        // Assert that body is a Buffer
        expect(Buffer.isBuffer(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    }, 20000); // 20s timeout since puppeteer can be slow on first run

});
