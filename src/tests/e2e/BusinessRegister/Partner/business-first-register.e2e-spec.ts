import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { app } from '../../../../app';

describe('E2E - Partner First Register', () => {
    let branchId: string;
    let unselectedProgramId: string;
    let selectedProgramId: string;
    let structuralProductId: string;
    let structuralGratuitoId: string;

    beforeAll(async () => {
        branchId = uuidV4();
        unselectedProgramId = uuidV4();
        selectedProgramId = uuidV4();
        structuralProductId = uuidV4();
        structuralGratuitoId = uuidV4();
        
        await prismaClient.item.createMany({
            data: [
                {
                    uuid: unselectedProgramId,
                    name: 'Programa Não Selecionado',
                    description: 'Programa que o parceiro vai ignorar',
                    item_type: 'programa',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                },
                {
                    uuid: selectedProgramId,
                    name: 'Programa Selecionado',
                    description: 'Programa que o parceiro escolheu',
                    item_type: 'programa',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                },
                {
                    uuid: structuralProductId,
                    name: 'Cartão Correct',
                    description: 'Produto que é débito do sistema',
                    item_type: 'produto',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                },
                {
                    uuid: structuralGratuitoId,
                    name: 'Gratuito Estrutural',
                    description: 'Item gratuito do ramo',
                    item_type: 'gratuito',
                    item_category: 'pre_pago',
                    created_at: new Date().toISOString()
                }
            ]
        });

        // Criar ramo para teste e relacionar TODOS os 4 itens a este ramo
        await prismaClient.branchInfo.create({
            data: {
                uuid: branchId,
                name: 'Ramo Teste E2E',
                marketing_tax: 200,
                market_place_tax: 300,
                admin_tax: 100,
                created_at: new Date().toISOString(),
                BranchItem: {
                    create: [
                        { item_uuid: unselectedProgramId, created_at: new Date().toISOString() },
                        { item_uuid: selectedProgramId, created_at: new Date().toISOString() },
                        { item_uuid: structuralProductId, created_at: new Date().toISOString() },
                        { item_uuid: structuralGratuitoId, created_at: new Date().toISOString() }
                    ]
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
            where: { uuid: { in: [unselectedProgramId, selectedProgramId, structuralProductId, structuralGratuitoId] } }
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
            legal_representative_name: "Fulano Representante",
            legal_representative_cpf: "12345678901",
            partnerConfig: {
                main_branch: branchId,
                partner_category: ["comercio"],
                use_marketing: true,
                use_market_place: false,
                use_correct_fidelity: true,
                use_special_products: true,
                use_employer_platform: false,
                // O usuario seleciona apenas 1 programa! Os produtos e gratuitos devem vir automaticamente.
                selected_programs: [selectedProgramId]
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

        // Assegura que o representante legal foi salvo
        expect(businessInfo?.legal_representative_name).toBe("Fulano Representante");
        expect(businessInfo?.legal_representative_cpf).toBe("12345678901");

        const config = businessInfo?.PartnerConfig[0];
        expect(config).toBeTruthy();

        // 1. Garantia das Taxas Corretas
        expect(config?.admin_tax).toBe(100);
        expect(config?.marketing_tax).toBe(200); // Porque use_marketing eh true
        expect(config?.market_place_tax).toBe(0); // Porque use_market_place eh false

        // 2. Garantia dos Itens (Programas Selecionados vs Estruturais Automáticos)
        expect(config?.items_uuid).toContain(selectedProgramId);
        expect(config?.items_uuid).toContain(structuralProductId);
        expect(config?.items_uuid).toContain(structuralGratuitoId);
        
        // 3. Garantia de que o programa NAO selecionado não entrou
        expect(config?.items_uuid).not.toContain(unselectedProgramId);
        
        // Teremos exatamente 3 itens
        expect(config?.items_uuid.length).toBe(3);

        // 4. Integridade do Relacionamento
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
            legal_representative_name: "Fulano Representante",
            legal_representative_cpf: "12345678901",
            partnerConfig: {
                main_branch: uuidV4(), // Invalid branch ID
                partner_category: ["comercio"],
                use_marketing: true,
                use_market_place: false,
                selected_programs: [selectedProgramId]
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
