import { app } from "../../../../app";
import request from 'supertest';
import { prismaClient } from "../../../../infra/databases/prisma.config";
import { v4 as uuidV4 } from 'uuid';
import { JWTToken } from "../../../../infra/shared/crypto/token/CorrectAdmin/jwt.token";
import { createTestBusinessInfo } from "../../helpers/test-factories";

describe("Update Partner Taxes (E2E)", () => {
    let correctAdminToken: string;
    let correctAdminId: string;
    let businessIdPending: string;
    let businessIdAwaiting: string;
    let businessIdActive: string;
    let termsId: string;

    beforeAll(async () => {
        await prismaClient.businessContract.deleteMany({});
        await prismaClient.partnerConfig.deleteMany({});
        await prismaClient.businessInfo.deleteMany({});
        await prismaClient.correctAdmin.deleteMany({});
        await prismaClient.termsOfService.deleteMany({});
        
        termsId = uuidV4();
        await prismaClient.termsOfService.create({
            data: {
                uuid: termsId,
                type: 'B2B_BUSINESS_MSA',
                content: 'Test content',
                version: '1.0.0',
                is_active: true
            }
        });
        
        correctAdminId = uuidV4();
        
        await prismaClient.correctAdmin.create({
            data: {
                uuid: correctAdminId,
                name: 'Admin Test',
                userName: 'admin_test_taxes',
                email: 'admin_taxes@test.com',
                password: '123'
            }
        });

        const correctTokenGenerator = new JWTToken();
        correctAdminToken = correctTokenGenerator.create({
            uuid: { uuid: correctAdminId },
            userName: 'admin_test_taxes',
            name: 'admin',
            email: 'admin'
        } as any);

        businessIdPending = uuidV4();
        businessIdAwaiting = uuidV4();
        businessIdActive = uuidV4();

        await createTestBusinessInfo({
            uuid: businessIdPending,
            document: Math.floor(Math.random() * 99999999999999).toString().padStart(14, "0"),
            status: 'pending_contract'
        });

        await prismaClient.partnerConfig.create({
            data: {
                uuid: uuidV4(),
                business_info_uuid: businessIdPending,
                main_branch: uuidV4(),
                partner_category: ['comercio'],
                items_uuid: [uuidV4()],
                use_marketing: true,
                use_market_place: true,
                admin_tax: 1000,
                marketing_tax: 1000,
                market_place_tax: 1000,
            }
        });

        await prismaClient.businessContract.create({
            data: {
                uuid: uuidV4(),
                business_info_uuid: businessIdPending,
                terms_uuid: termsId,
                rendered_html: '<html>...</html>',
                status: 'PENDING'
            }
        });

        await createTestBusinessInfo({
            uuid: businessIdAwaiting,
            document: Math.floor(Math.random() * 99999999999999).toString().padStart(14, "0"),
            status: 'awaiting_payment'
        });

        await prismaClient.partnerConfig.create({
            data: {
                uuid: uuidV4(),
                business_info_uuid: businessIdAwaiting,
                main_branch: uuidV4(),
                partner_category: ['comercio'],
                items_uuid: [uuidV4()],
                use_marketing: true,
                use_market_place: true,
                admin_tax: 1000,
                marketing_tax: 1000,
                market_place_tax: 1000,
            }
        });

        await prismaClient.businessContract.create({
            data: {
                uuid: uuidV4(),
                business_info_uuid: businessIdAwaiting,
                terms_uuid: termsId,
                rendered_html: '<html>...</html>',
                status: 'SIGNED',
                signed_at: new Date()
            }
        });

        await createTestBusinessInfo({
            uuid: businessIdActive,
            document: Math.floor(Math.random() * 99999999999999).toString().padStart(14, "0"),
            status: 'active'
        });

        await prismaClient.partnerConfig.create({
            data: {
                uuid: uuidV4(),
                business_info_uuid: businessIdActive,
                main_branch: uuidV4(),
                partner_category: ['comercio'],
                items_uuid: [uuidV4()],
                use_marketing: true,
                use_market_place: true,
                admin_tax: 1000,
                marketing_tax: 1000,
                market_place_tax: 1000,
            }
        });
    });

    afterAll(async () => {
        await prismaClient.businessContract.deleteMany({});
        await prismaClient.partnerConfig.deleteMany({});
        await prismaClient.businessInfo.deleteMany({});
        await prismaClient.correctAdmin.deleteMany({});
        await prismaClient.termsOfService.deleteMany({});
    });

    it("should allow tax updates and add pending fees to config for active partners without reverting status", async () => {
        const response = await request(app)
            .patch(`/admin/partners/${businessIdActive}/fees`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send({
                admin_tax: 2,
                marketing_tax: 2,
                market_place_tax: 2,
            });
        
        expect(response.status).toBe(204);

        const config = await prismaClient.partnerConfig.findFirst({
            where: { business_info_uuid: businessIdActive }
        });
        expect(config?.pending_admin_tax).toBe(20000);

        const contracts = await prismaClient.businessContract.findMany({
            where: { business_info_uuid: businessIdActive },
            orderBy: { created_at: 'desc' }
        });
        expect(contracts.length).toBe(1);
        expect(contracts[0].status).toBe('PENDING');
        
        const business = await prismaClient.businessInfo.findUnique({
            where: { uuid: businessIdActive }
        });
        expect(business?.status).toBe('active');
    });

    it("should allow tax updates and add pending fees for pending_contract partners", async () => {
        const response = await request(app)
            .patch(`/admin/partners/${businessIdPending}/fees`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send({
                admin_tax: 2,
                marketing_tax: 2,
                market_place_tax: 2,
            });
        
        expect(response.status).toBe(204);

        const config = await prismaClient.partnerConfig.findFirst({
            where: { business_info_uuid: businessIdPending }
        });
        expect(config?.pending_admin_tax).toBe(20000);
    });

    it("should allow tax updates and add pending fees and revert status to pending_contract for awaiting_payment partners", async () => {
        const response = await request(app)
            .patch(`/admin/partners/${businessIdAwaiting}/fees`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send({
                admin_tax: 2,
                marketing_tax: 2,
                market_place_tax: 2,
            });
        
        expect(response.status).toBe(204);

        const config = await prismaClient.partnerConfig.findFirst({
            where: { business_info_uuid: businessIdAwaiting }
        });
        expect(config?.pending_admin_tax).toBe(20000);

        const business = await prismaClient.businessInfo.findUnique({
            where: { uuid: businessIdAwaiting }
        });
        expect(business?.status).toBe('pending_contract');
    });
});
