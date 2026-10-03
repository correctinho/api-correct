import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { app } from '../../../../app';
import { AppUserJWToken } from '../../../../infra/shared/crypto/token/AppUser/jwt.token';

describe('E2E - Business Club (AppUser)', () => {
    let userToken: string;
    let userInfoId: string;
    let authId: string;
    let programOwnedId: string;
    let programAvailableId: string;
    let programComingSoonId: string;
    let partnerId: string;
    let addressId: string;

    beforeAll(async () => {
        authId = uuidV4();
        userInfoId = uuidV4();
        programOwnedId = uuidV4();
        programAvailableId = uuidV4();
        programComingSoonId = uuidV4();
        partnerId = uuidV4();

        // 1. Cria Usuário Info (Primeiro, porque o Auth aponta para ele)
        await prismaClient.userInfo.create({
            data: {
                uuid: userInfoId,
                document: '52998224725',
                full_name: 'Test Business Club User',
                date_of_birth: '1990-01-01',
                created_at: new Date().toISOString()
            }
        });

        // 2. Cria Usuário Auth
        await prismaClient.userAuth.create({
            data: {
                uuid: authId,
                document: '52998224725',
                email: `test-${authId}@example.com`,
                password: 'password123',
                user_info_uuid: userInfoId,
                created_at: new Date().toISOString()
            }
        });

        // 2. Gera Token
        // O método 'create' do AppUserJWToken precisa do uuid (que é um VO, mas podemos fazer um cast pra enganar o TS)
        const tokenService = new AppUserJWToken();
        userToken = tokenService.create({ uuid: { uuid: authId } } as any);

        // 3. Cria Programas
        await prismaClient.item.createMany({
            data: [
                {
                    uuid: programOwnedId,
                    name: 'Programa Adquirido',
                    description: 'Desc',
                    item_type: 'programa',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                },
                {
                    uuid: programAvailableId,
                    name: 'Programa Disponível',
                    description: 'Desc',
                    item_type: 'programa',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                },
                {
                    uuid: programComingSoonId,
                    name: 'Programa Em Breve',
                    description: 'Desc',
                    item_type: 'programa',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                }
            ]
        });

        // 4. Vincula o programa Owned ao usuário
        await prismaClient.userItem.create({
            data: {
                uuid: uuidV4(),
                UserInfo: { connect: { uuid: userInfoId } },
                Item: { connect: { uuid: programOwnedId } },
                item_name: 'Programa Adquirido',
                balance: 0,
                status: 'active',
                created_at: new Date().toISOString()
            }
        });

        // Endereço para testar a distância
        addressId = uuidV4();
        await prismaClient.address.create({
            data: {
                uuid: addressId,
                postal_code: "0000000",
                latitude: -23.550520, // São Paulo
                longitude: -46.633308,
                city: 'São Paulo',
                country: 'BR',
                created_at: new Date().toISOString()
            }
        });

        // 5. Cria Parceiro e Vincula ao programa Available
        await prismaClient.businessInfo.create({
            data: {
                uuid: partnerId,
                document: '41595163000100',
                corporate_reason: 'Parceiro Teste LTDA',
                fantasy_name: 'Parceiro Teste LTDA',
                classification: 'A/B',
                colaborators_number: 1,
                phone_1: '11999999999',
                email: `partner-${authId}@test.com`,
                business_type: 'comercio',
                address_uuid: addressId,
                status: 'active',
                created_at: new Date().toISOString()
            }
        });

        await prismaClient.partnerConfig.create({
            data: {
                uuid: uuidV4(),
                title: 'Parceiro do Clube',
                description: 'Descrição de teste para busca',
                main_branch: 'Saúde',
                use_marketing: false,
                use_market_place: false,
                use_correct_fidelity: true,
                use_special_products: false,
                use_employer_platform: false,
                items_uuid: [programAvailableId],
                BusinessInfo: { connect: { uuid: partnerId } },
                DispatchAddress: { connect: { uuid: addressId } }
            }
        });



    });

    afterAll(async () => {
        // Limpa o banco na ordem reversa
        await prismaClient.partnerConfig.deleteMany({ where: { business_info_uuid: partnerId } });
        await prismaClient.businessInfo.delete({ where: { uuid: partnerId } });
        await prismaClient.address.delete({ where: { uuid: addressId } });
        await prismaClient.userItem.deleteMany({ where: { user_info_uuid: userInfoId } });
        await prismaClient.item.deleteMany({ where: { uuid: { in: [programOwnedId, programAvailableId, programComingSoonId] } } });
        await prismaClient.userInfo.delete({ where: { uuid: userInfoId } });
        await prismaClient.userAuth.delete({ where: { uuid: authId } });
    });

    describe('GET /app-user/business-club/home-programs', () => {
        it('should list programs with correct statuses', async () => {
            const response = await request(app)
                .get('/app-user/business-club/home-programs')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);

            const owned = response.body.find((p: any) => p.uuid === programOwnedId);
            const available = response.body.find((p: any) => p.uuid === programAvailableId);
            const comingSoon = response.body.find((p: any) => p.uuid === programComingSoonId);

            expect(owned.status).toBe('OWNED');
            expect(available.status).toBe('AVAILABLE');
            expect(comingSoon.status).toBe('COMING_SOON');
        });
    });

    describe('GET /app-user/business-club/search', () => {
        it('should search partners correctly by text', async () => {
            const response = await request(app)
                .get('/app-user/business-club/search?query=Parceiro do Clube')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].vitrine_title).toBe('Parceiro do Clube');
        });

        it('should return distance when lat/lon are provided', async () => {
            // Mandando a mesma coordenada, a distância deve ser 0 (ou muito próxima)
            const response = await request(app)
                .get('/app-user/business-club/search?lat=-23.550520&lon=-46.633308')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            const partner = response.body.find((p: any) => p.business_info_uuid === partnerId);
            expect(partner).toBeDefined();
            expect(partner.distance).not.toBeNull();
            expect(partner.distance).toBeLessThan(1); // menos de 1 km
        });

        it('should filter by program_uuid correctly', async () => {
            const response = await request(app)
                .get(`/app-user/business-club/search?program_uuid=${programAvailableId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].business_info_uuid).toBe(partnerId);

            const responseEmpty = await request(app)
                .get(`/app-user/business-club/search?program_uuid=${programComingSoonId}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(responseEmpty.body.length).toBe(0);
        });

        it('should filter by category correctly', async () => {
            const response = await request(app)
                .get(`/app-user/business-club/search?category=Saúde`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].business_info_uuid).toBe(partnerId);

            const responseEmpty = await request(app)
                .get(`/app-user/business-club/search?category=Inexistente`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(responseEmpty.body.length).toBe(0);
        });
    });

    describe('GET /app-user/business-club/program/:uuid/branches', () => {
        it('should list branches for a given program', async () => {
            const response = await request(app)
                .get(`/app-user/business-club/program/${programAvailableId}/branches`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toContain('Saúde');
        });

        it('should return empty array for a program with no partners', async () => {
            const response = await request(app)
                .get(`/app-user/business-club/program/${programComingSoonId}/branches`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(0);
        });
    });

    describe('GET /app-user/business-club/partner/:uuid/details', () => {
        it('should return partner details with no products if use_marketing is false', async () => {
            const response = await request(app)
                .get(`/app-user/business-club/partner/${partnerId}/details`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.uuid).toBe(partnerId);
            expect(response.body.name).toBe('Parceiro do Clube'); // From PartnerConfig.title
            expect(response.body.use_marketing).toBe(false);
            expect(response.body.products.length).toBe(0);
        });

        it('should return 404 for inexistent partner', async () => {
            const response = await request(app)
                .get(`/app-user/business-club/partner/${uuidV4()}/details`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
        });
    });
});
