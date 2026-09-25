import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { app } from '../../../../app';

describe('E2E - Partner First Register', () => {
    let branchId: string;
    let defaultItemId: string;
    let selectedItemId: string;

    beforeAll(async () => {
        branchId = uuidV4();
        defaultItemId = uuidV4();
        selectedItemId = uuidV4();
        
        await prismaClient.item.createMany({
            data: [
                {
                    uuid: defaultItemId,
                    name: 'Item Padrao do Ramo',
                    description: 'Item Teste Default',
                    item_type: 'programa',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                },
                {
                    uuid: selectedItemId,
                    name: 'Item Selecionado Livre',
                    description: 'Item Teste Selecionado',
                    item_type: 'programa',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                }
            ]
        });

        // Criar ramo para teste
        await prismaClient.branchInfo.create({
            data: {
                uuid: branchId,
                name: 'Ramo Teste E2E',
                marketing_tax: 200,
                market_place_tax: 300,
                admin_tax: 100,
                created_at: new Date().toISOString(),
                BranchItem: {
                    create: {
                        item_uuid: defaultItemId,
                        created_at: new Date().toISOString()
                    }
                }
            }
        });
    });

    afterAll(async () => {
        // Limpar dados criados
        const docPattern = '99999999000199';
        const docPattern2 = '88888888000188';
        const deleteBusiness = async (doc: string) => {
            const business = await prismaClient.businessInfo.findUnique({
                where: { document: doc }
            });
            if (business) {
                await prismaClient.partnerConfig.deleteMany({
                    where: { business_info_uuid: business.uuid }
                });
                await prismaClient.businessinfoBranch.deleteMany({
                    where: { business_info_uuid: business.uuid }
                });
                await prismaClient.businessAccount.deleteMany({
                    where: { business_info_uuid: business.uuid }
                });
                await prismaClient.businessInfo.delete({
                    where: { document: doc }
                });
                await prismaClient.address.delete({
                    where: { uuid: business.address_uuid }
                });
            }
        }
        await deleteBusiness(docPattern);
        await deleteBusiness(docPattern2);

        await prismaClient.branchItem.deleteMany({
            where: { branchInfo_uuid: branchId }
        });
        await prismaClient.branchInfo.deleteMany({
            where: { uuid: branchId }
        });
        await prismaClient.item.deleteMany({
            where: { uuid: { in: [defaultItemId, selectedItemId] } }
        });
    });

    it('should successfully register a partner with correct fidelity, exact taxes and items deduplication', async () => {
        const payload = {
            line1: "Rua Teste E2E",
            line2: "123",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "12345678",
            city: "Cidade Teste",
            state: "SP",
            country: "Brasil",
            fantasy_name: "Parceiro E2E",
            corporate_reason: "Parceiro E2E LTDA",
            document: "99999999000199",
            classification: "A/B",
            colaborators_number: 1,
            email: "parceiro.e2e@teste.com",
            phone_1: "11999999999",
            business_type: "comercio",
            branches_uuid: [branchId],
            partnerConfig: {
                main_branch: branchId,
                partner_category: ["comercio"],
                use_marketing: true,
                use_market_place: false,
                use_correct_fidelity: true,
                use_special_products: true,
                use_employer_platform: false,
                // Passamos o defaultItemId tambem para forcar e testar a deduplicacao do Set() no backend
                selected_programs: [selectedItemId, defaultItemId]
            }
        };

        const response = await request(app).post('/business/register').send(payload);
        expect(response.status).toBe(201);
        
        // Verifica no banco de dados
        const businessInfo = await prismaClient.businessInfo.findUnique({
            where: { document: payload.document },
            include: { PartnerConfig: true }
        });

        expect(businessInfo).toBeTruthy();
        expect(businessInfo?.contract_number).toBeDefined();
        expect(businessInfo?.contract_number).toMatch(/^C202[0-9]-\d{4}$/);
        expect(businessInfo?.status).toBe('pending_contract');

        const config = businessInfo?.PartnerConfig[0];
        expect(config).toBeTruthy();

        // 1. Garantia das Taxas Corretas
        expect(config?.admin_tax).toBe(100);
        expect(config?.marketing_tax).toBe(200); // Porque use_marketing eh true
        expect(config?.market_place_tax).toBe(0); // Porque use_market_place eh false

        // 2. Garantia dos Itens (Programas Selecionados vs Padroes) e Deduplicacao
        expect(config?.items_uuid).toContain(defaultItemId);
        expect(config?.items_uuid).toContain(selectedItemId);
        expect(config?.items_uuid.length).toBe(2); // Garante que nao houve duplicacao do defaultItemId

        // 3. Integridade do Relacionamento
        expect(config?.main_branch).toBe(branchId);
    });

    it('should fail if main_branch is invalid or missing', async () => {
        const payload = {
            line1: "Rua Teste E2E",
            line2: "123",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "12345678",
            city: "Cidade Teste",
            state: "SP",
            country: "Brasil",
            fantasy_name: "Parceiro E2E 2",
            corporate_reason: "Parceiro E2E LTDA 2",
            document: "88888888000188",
            classification: "A/B",
            colaborators_number: 1,
            email: "parceiro2.e2e@teste.com",
            phone_1: "11999999999",
            business_type: "comercio",
            branches_uuid: [branchId],
            partnerConfig: {
                main_branch: uuidV4(), // Invalid branch ID
                partner_category: ["comercio"],
                use_marketing: true,
                use_market_place: false,
                selected_programs: [selectedItemId]
            }
        };

        const response = await request(app).post('/business/register').send(payload);
        
        // Verifica se a API barrou a requisicao (geralmente 400 ou 404)
        expect(response.status).toBeGreaterThanOrEqual(400);

        // Garante que nao inseriu sujeira no banco
        const businessInfo = await prismaClient.businessInfo.findUnique({
            where: { document: payload.document }
        });
        expect(businessInfo).toBeNull();
    });
});
