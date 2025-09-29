import request from 'supertest';
import { app } from '../../app';
import { InputCreateBenefitDto } from '../../modules/benefits/usecases/create-benefit/create-benefit.dto';
import { Uuid } from '../../@shared/ValueObjects/uuid.vo';
import { randomUUID } from 'crypto';
import {
    ItemCategory,
    ItemType,
    PrismaClient,
    SalesType,
} from '@prisma/client';
import { prismaClient } from '../../infra/databases/prisma.config';

let correctAdminToken: string;
let correctSellerToken: string;

let partner_info_uuid: string;
let partner2_info_uuid: string;

let partner_address_uuid: string;
let partner2_address_uuid: string;
let employer_info_uuid: string;
let employer_address_uuid: string;
let partner_admin_token: string;
let partner_admin_uuid: string;

let partner_finances_user_uuid: string;
let partner_finances_user_token: string;

let employer_user_token: string;
let employer_user_uuid: string;

let benefit1_uuid: Uuid;
let benefit2_uuid: Uuid;
let benefit3_uuid: Uuid;
let benefit4_uuid: Uuid;
let benefit5_uuid: Uuid;

let branch1_uuid: string;
let branch2_uuid: string;
let branch3_uuid: string;
let branch4_uuid: string;
let branch5_uuid: string;

let item_details_1: string;
describe('E2E Business tests', () => {
    beforeAll(async () => {
        const inputNewAdmin = {
            name: 'Admin Correct',
            email: 'admincorrect@correct.com.br',
            userName: 'admin-correct',
            password: '123',
        };
        //create correct admin
        const createCorrectAdmin = await request(app)
            .post('/admin')
            .send(inputNewAdmin);
        expect(createCorrectAdmin.statusCode).toBe(201);

        const authenticateAdmin = {
            userName: inputNewAdmin.userName,
            password: inputNewAdmin.password,
        };
        //authenticate correct admin
        const result = await request(app)
            .post('/login')
            .send(authenticateAdmin);
        expect(result.statusCode).toBe(200);
        correctAdminToken = result.body.token;

        const inputCorrectSeller = {
            name: 'Seller Correct',
            email: 'sellercorrect@correct.com.br',
            userName: 'seller-correct',
            password: '123',
        };
        const createCorrectSeller = await request(app)
            .post('/seller')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(inputCorrectSeller);
        expect(createCorrectSeller.statusCode).toBe(201);
        expect(createCorrectSeller.body.isAdmin).toBeFalsy();

        const authSellerInput = {
            userName: 'seller-correct',
            password: '123',
        };
        //authenticate seller
        const authSeller = await request(app)
            .post('/login')
            .send(authSellerInput);
        expect(authSeller.statusCode).toBe(200);
        correctSellerToken = authSeller.body.token;

        //create items
        const benefit1: InputCreateBenefitDto = {
            name: 'Vale Alimentação',
            description: 'Descrição do vale',
            parent_uuid: null,
            item_type: 'gratuito',
            item_category: 'pre_pago',
        };

        const benefit2: InputCreateBenefitDto = {
            name: 'Adiantamento Salarial',
            description: 'Descrição do vale',
            parent_uuid: null,
            item_type: 'gratuito',
            item_category: 'pos_pago',
        };
        const benefit3: InputCreateBenefitDto = {
            name: 'Convênio',
            description: 'Descrição do vale',
            parent_uuid: null,
            item_type: 'gratuito',
            item_category: 'pos_pago',
        };
        const benefit4: InputCreateBenefitDto = {
            name: 'Vale Refeição',
            description: 'Descrição do vale',
            parent_uuid: null,
            item_type: 'gratuito',
            item_category: 'pre_pago',
        };
        const benefit5: InputCreateBenefitDto = {
            name: 'Correct',
            description: 'Descrição do vale',
            parent_uuid: null,
            item_type: 'gratuito',
            item_category: 'pre_pago',
        };

        const benefit1Response = await request(app)
            .post('/benefit')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(benefit1);
        const benefit2Response = await request(app)
            .post('/benefit')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(benefit2);
        const benefit3Response = await request(app)
            .post('/benefit')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(benefit3);
        const benefit4Response = await request(app)
            .post('/benefit')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(benefit4);
        const benefit5Response = await request(app)
            .post('/benefit')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(benefit5);

        benefit1_uuid = benefit1Response.body.uuid;
        benefit2_uuid = benefit2Response.body.uuid;
        benefit3_uuid = benefit3Response.body.uuid;
        benefit4_uuid = benefit4Response.body.uuid;
        benefit5_uuid = benefit5Response.body.uuid;

        expect(benefit1Response.statusCode).toBe(201);
        expect(benefit2Response.statusCode).toBe(201);
        expect(benefit3Response.statusCode).toBe(201);
        expect(benefit4Response.statusCode).toBe(201);
        expect(benefit5Response.statusCode).toBe(201);

        //create branches
        const branchesByName = [
            {
                name: 'Hipermercados',
                marketing_tax: 1,
                admin_tax: 1.5,
                market_place_tax: 1.2,
                benefits_name: [
                    'Adiantamento Salarial',
                    'Vale Alimentação',
                    'Correct',
                ],
            },

            {
                name: 'Supermercados',
                marketing_tax: 1,
                admin_tax: 1.5,
                market_place_tax: 1.2,
                benefits_name: [
                    'Adiantamento Salarial',
                    'Vale Refeição',
                    'Correct',
                ],
            },

            {
                name: 'Mercearias',
                marketing_tax: 1.3,
                admin_tax: 1.4,
                market_place_tax: 1.3,
                benefits_name: ['Convênio', 'Vale Alimentação', 'Correct'],
            },
            {
                name: 'Restaurantes',
                marketing_tax: 1.8,
                admin_tax: 1.7,
                market_place_tax: 1.6,
                benefits_name: ['Vale Refeição', 'Vale Alimentação', 'Correct'],
            },

            {
                name: 'Alimentação',
                marketing_tax: 2.0,
                admin_tax: 2.5,
                market_place_tax: 2.2,
                benefits_name: ['Vale Refeição', 'Vale Alimentação', 'Correct'],
            },
        ];

        const branches = await request(app)
            .post(`/branch`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(branchesByName);

        expect(branches.statusCode).toBe(201);

        branch1_uuid = branches.body[0].uuid;
        branch2_uuid = branches.body[1].uuid;
        branch3_uuid = branches.body[2].uuid;
        branch4_uuid = branches.body[3].uuid;
        branch5_uuid = branches.body[4].uuid;
    });

    describe('Business First Register', () => {
        describe('E2E All Business Type Registers', () => {
            it('Should throw an error if line1 is missing', async () => {
                const input = {
                    line1: '',
                    line2: '72B',
                    line3: 'Complemento',
                    neighborhood: 'Bairro Teste',
                    postal_code: '731547854',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Street is required');
            });

            it('Should throw an error if line2 is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '',
                    line3: 'Complemento',
                    neighborhood: 'Bairro Teste',
                    postal_code: '731547854',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Number is required');
            });

            it('Should throw an error if neighbor is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: 'Complemento',
                    neighborhood: '',
                    postal_code: '731547854',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Neighborhood is required');
            });

            it('Should throw an error if postal code is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Zip Code is required');
            });

            it('Should throw an error if city is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: '',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('City is required');
            });

            it('Should throw an error if state is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: '',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('State is required');
            });

            it('Should throw an error if country is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: '',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Country is required');
            });

            it('Should throw an error if fantasy_name is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: '',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Fantasy name is required');
            });

            it('Should throw an error if document is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: '',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Document is required');
            });

            it('Should throw an error if classification is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'comercio',
                    classification: '',
                    colaborators_number: 5,
                    email: 'comercio@comercio.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Company classification is required'
                );
            });

            it('Should throw an error if colaborators is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'comercio',
                    classification: 'Classificação',
                    colaborators_number: 0,
                    email: 'comercio@comercio.com',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Total employees is required');
            });

            it('Should throw an error if email is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'comercio',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: '',
                    phone_1: '7287569874',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Email is required');
            });

            it('Should throw an error if phone 1 is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Telephone 1 is required');
            });

            it('Should throw an error if business type is missing', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: '',
                };

                const result = await request(app)
                    .post('/business/register')
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business type is required');
            });

            describe('E2E Partner Registers test', () => {
                it('Should throw an error if branch list is missing', async () => {
                    const input = {
                        line1: 'Rua',
                        line2: '72B',
                        line3: '',
                        neighborhood: 'Bairro Teste',
                        postal_code: '5484248423',
                        city: 'Cidade teste',
                        state: 'Estado teste',
                        country: 'País teste',
                        fantasy_name: 'Empresa teste',
                        document: 'CNPJ',
                        classification: 'Classificação',
                        colaborators_number: 5,
                        email: 'email@email.com',
                        phone_1: '215745158',
                        phone_2: '124588965',
                        business_type: 'comercio',
                        branches_uuid: [''],
                    };

                    const result = await request(app)
                        .post('/business/register')
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe(
                        'Business branch is required'
                    );
                });
                it('Should throw an error if main branch is not one of the branches list', async () => {
                    const input = {
                        line1: 'Rua',
                        line2: '72B',
                        line3: '',
                        neighborhood: 'Bairro Teste',
                        postal_code: '5484248423',
                        city: 'Cidade teste',
                        state: 'Estado teste',
                        country: 'País teste',
                        fantasy_name: 'Empresa teste',
                        document: 'comercio',
                        classification: 'Classificação',
                        colaborators_number: 5,
                        email: 'comercio@comercio.com',
                        phone_1: '215745158',
                        phone_2: '124588965',
                        business_type: 'comercio',
                        branches_uuid: [
                            branch1_uuid,
                            branch3_uuid,
                            branch4_uuid,
                        ],
                        partnerConfig: {
                            main_branch: branch2_uuid,
                            partner_category: ['saude'],
                            use_marketing: false,
                            use_market_place: false,
                        },
                    };

                    const result = await request(app)
                        .post('/business/register')
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe('Invalid main branch');
                });

                it('Should register an partner with only admin tax', async () => {
                    const input = {
                        line1: 'Rua',
                        line2: '72B',
                        line3: '',
                        neighborhood: 'Bairro Teste',
                        postal_code: '5484248423',
                        city: 'Cidade teste',
                        state: 'Estado teste',
                        country: 'País teste',
                        fantasy_name: 'Empresa teste',
                        document: 'comercio',
                        classification: 'Classificação',
                        colaborators_number: 5,
                        email: 'comercio@comercio.com',
                        phone_1: '215745158',
                        phone_2: '124588965',
                        business_type: 'comercio',
                        branches_uuid: [
                            branch1_uuid,
                            branch3_uuid,
                            branch4_uuid,
                        ],
                        partnerConfig: {
                            main_branch: branch1_uuid,
                            partner_category: ['saude'],
                            use_marketing: false,
                            use_market_place: false,
                        },
                    };

                    const result = await request(app)
                        .post('/business/register')
                        .send(input);
                    expect(result.statusCode).toBe(201);
                    partner_info_uuid = result.body.BusinessInfo.uuid;
                    partner_address_uuid = result.body.Address.uuid;
                    const partnerConfigFromDb =
                        await prismaClient.partnerConfig.findFirst({
                            where: { business_info_uuid: partner_info_uuid },
                        });

                    // Esta é a asserção que nos dirá a verdade.
                    // Se ela falhar, saberemos que a escrita no banco está incorreta.
                    expect(partnerConfigFromDb.admin_tax).toBe(15000); // branch1_uuid tem admin_tax de 1.5% => 15000

                    // =========================================================================

                    // Suas asserções originais para a resposta da API continuam aqui
                    expect(result.body.Address.uuid).toBeTruthy();
                    // ... (resto das suas asserções) ...
                    expect(result.body.PartnerConfig.admin_tax).toEqual(15000); // Esta asserção valida a RESPOSTA da API
                    // ... (resto das suas asserções) ...
                });
                it('Should register an partner with admin tax and marketing', async () => {
                    const input = {
                        line1: 'Rua',
                        line2: '72B',
                        line3: '',
                        neighborhood: 'Bairro Teste',
                        postal_code: '5484248423',
                        city: 'Cidade teste',
                        state: 'Estado teste',
                        country: 'País teste',
                        fantasy_name: 'Empresa teste',
                        document: 'comercio2',
                        classification: 'Classificação',
                        colaborators_number: 5,
                        email: 'comercio2@comercio.com',
                        phone_1: '215745158',
                        phone_2: '124588965',
                        business_type: 'comercio',
                        branches_uuid: [
                            branch1_uuid,
                            branch3_uuid,
                            branch4_uuid,
                        ],
                        partnerConfig: {
                            main_branch: branch3_uuid,
                            partner_category: ['saude'],
                            use_marketing: true,
                            use_market_place: false,
                        },
                    };

                    const result = await request(app)
                        .post('/business/register')
                        .send(input);
                    expect(result.statusCode).toBe(201);
                    //Address
                    expect(result.body.Address.uuid).toBeTruthy();
                    expect(result.body.Address.line1).toEqual(input.line1);
                    expect(result.body.Address.line2).toEqual(input.line2);
                    expect(result.body.Address.line3).toEqual(input.line3);
                    expect(result.body.Address.neighborhood).toEqual(
                        input.neighborhood
                    );
                    expect(result.body.Address.postal_code).toEqual(
                        input.postal_code
                    );
                    expect(result.body.Address.city).toEqual(input.city);
                    expect(result.body.Address.state).toEqual(input.state);
                    expect(result.body.Address.country).toEqual(input.country);
                    //Business Info
                    expect(result.body.BusinessInfo.uuid).toBeTruthy();
                    expect(result.body.BusinessInfo.address_uuid).toEqual(
                        result.body.Address.uuid
                    );
                    expect(result.body.BusinessInfo.fantasy_name).toEqual(
                        input.fantasy_name
                    );
                    expect(
                        result.body.BusinessInfo.corporate_reason
                    ).toBeFalsy();
                    expect(result.body.BusinessInfo.document).toEqual(
                        input.document
                    );
                    expect(result.body.BusinessInfo.classification).toEqual(
                        input.classification
                    );
                    expect(
                        result.body.BusinessInfo.colaborators_number
                    ).toEqual(input.colaborators_number);
                    expect(result.body.BusinessInfo.status).toBe(
                        'pending_approval'
                    );
                    expect(result.body.BusinessInfo.phone_1).toEqual(
                        input.phone_1
                    );
                    expect(result.body.BusinessInfo.phone_2).toEqual(
                        input.phone_2
                    );
                    expect(result.body.BusinessInfo.document).toEqual(
                        input.document
                    );
                    expect(result.body.BusinessInfo.business_type).toEqual(
                        input.business_type
                    );
                    expect(result.body.BusinessInfo.email).toEqual(input.email);
                    expect(result.body.BusinessInfo.created_at).toBeTruthy();
                    //N to N business / correct
                    expect(
                        result.body.CorrectUserBusinessBranch.uuid
                    ).toBeTruthy();
                    expect(
                        result.body.CorrectUserBusinessBranch.business_info_uuid
                    ).toEqual(result.body.BusinessInfo.uuid);
                    expect(
                        result.body.CorrectUserBusinessBranch.correct_user_uuid
                    ).toBeFalsy();
                    expect(
                        result.body.CorrectUserBusinessBranch.created_at
                    ).toBeTruthy();
                    //PartnerConfig
                    expect(result.body.PartnerConfig.uuid).toBeTruthy();
                    expect(
                        result.body.PartnerConfig.business_info_uuid
                    ).toEqual(result.body.BusinessInfo.uuid);
                    expect(result.body.PartnerConfig.main_branch).toEqual(
                        input.partnerConfig.main_branch
                    );
                    expect(result.body.PartnerConfig.partner_category).toEqual(
                        input.partnerConfig.partner_category
                    );
                    expect(result.body.PartnerConfig.main_branch).toEqual(
                        input.partnerConfig.main_branch
                    );
                    expect(
                        result.body.PartnerConfig.items_uuid.length
                    ).not.toBe(0);
                    expect(result.body.PartnerConfig.admin_tax).toEqual(14000); //this is according to branch1 definitions
                    expect(result.body.PartnerConfig.marketing_tax).toEqual(
                        13000
                    );
                    expect(
                        result.body.PartnerConfig.use_marketing
                    ).toBeTruthy();
                    expect(result.body.PartnerConfig.market_place_tax).toEqual(
                        0
                    );
                    expect(
                        result.body.PartnerConfig.use_market_place
                    ).toBeFalsy();
                });
                it('Should register an partner with admin tax, marketing tax and market places tax', async () => {
                    const input = {
                        line1: 'Rua',
                        line2: '72B',
                        line3: '',
                        neighborhood: 'Bairro Teste',
                        postal_code: '5484248423',
                        city: 'Cidade teste',
                        state: 'Estado teste',
                        country: 'País teste',
                        fantasy_name: 'Empresa teste',
                        document: 'comercio3',
                        classification: 'Classificação',
                        colaborators_number: 5,
                        email: 'comercio3@comercio.com',
                        phone_1: '215745158',
                        phone_2: '124588965',
                        business_type: 'comercio',
                        branches_uuid: [
                            branch1_uuid,
                            branch3_uuid,
                            branch4_uuid,
                        ],
                        partnerConfig: {
                            main_branch: branch4_uuid,
                            partner_category: ['saude'],
                            use_marketing: true,
                            use_market_place: true,
                        },
                    };

                    const result = await request(app)
                        .post('/business/register')
                        .send(input);
                    expect(result.statusCode).toBe(201);
                    //Address
                    expect(result.body.Address.uuid).toBeTruthy();
                    expect(result.body.Address.line1).toEqual(input.line1);
                    expect(result.body.Address.line2).toEqual(input.line2);
                    expect(result.body.Address.line3).toEqual(input.line3);
                    expect(result.body.Address.neighborhood).toEqual(
                        input.neighborhood
                    );
                    expect(result.body.Address.postal_code).toEqual(
                        input.postal_code
                    );
                    expect(result.body.Address.city).toEqual(input.city);
                    expect(result.body.Address.state).toEqual(input.state);
                    expect(result.body.Address.country).toEqual(input.country);
                    //Business Info
                    expect(result.body.BusinessInfo.uuid).toBeTruthy();
                    expect(result.body.BusinessInfo.address_uuid).toEqual(
                        result.body.Address.uuid
                    );
                    expect(result.body.BusinessInfo.fantasy_name).toEqual(
                        input.fantasy_name
                    );
                    expect(
                        result.body.BusinessInfo.corporate_reason
                    ).toBeFalsy();
                    expect(result.body.BusinessInfo.document).toEqual(
                        input.document
                    );
                    expect(result.body.BusinessInfo.classification).toEqual(
                        input.classification
                    );
                    expect(
                        result.body.BusinessInfo.colaborators_number
                    ).toEqual(input.colaborators_number);
                    expect(result.body.BusinessInfo.status).toBe(
                        'pending_approval'
                    );
                    expect(result.body.BusinessInfo.phone_1).toEqual(
                        input.phone_1
                    );
                    expect(result.body.BusinessInfo.phone_2).toEqual(
                        input.phone_2
                    );
                    expect(result.body.BusinessInfo.document).toEqual(
                        input.document
                    );
                    expect(result.body.BusinessInfo.business_type).toEqual(
                        input.business_type
                    );
                    expect(result.body.BusinessInfo.email).toEqual(input.email);
                    expect(result.body.BusinessInfo.created_at).toBeTruthy();
                    //N to N business / correct
                    expect(
                        result.body.CorrectUserBusinessBranch.uuid
                    ).toBeTruthy();
                    expect(
                        result.body.CorrectUserBusinessBranch.business_info_uuid
                    ).toEqual(result.body.BusinessInfo.uuid);
                    expect(
                        result.body.CorrectUserBusinessBranch.correct_user_uuid
                    ).toBeFalsy();
                    expect(
                        result.body.CorrectUserBusinessBranch.created_at
                    ).toBeTruthy();
                    //PartnerConfig
                    expect(result.body.PartnerConfig.uuid).toBeTruthy();
                    expect(
                        result.body.PartnerConfig.business_info_uuid
                    ).toEqual(result.body.BusinessInfo.uuid);
                    expect(result.body.PartnerConfig.main_branch).toEqual(
                        input.partnerConfig.main_branch
                    );
                    expect(result.body.PartnerConfig.partner_category).toEqual(
                        input.partnerConfig.partner_category
                    );
                    expect(result.body.PartnerConfig.main_branch).toEqual(
                        input.partnerConfig.main_branch
                    );
                    expect(
                        result.body.PartnerConfig.items_uuid.length
                    ).not.toBe(0);
                    expect(result.body.PartnerConfig.admin_tax).toEqual(17000); //this is according to branch1 definitions
                    expect(result.body.PartnerConfig.marketing_tax).toEqual(
                        18000
                    );
                    expect(
                        result.body.PartnerConfig.use_marketing
                    ).toBeTruthy();
                    expect(result.body.PartnerConfig.market_place_tax).toEqual(
                        16000
                    );
                    expect(
                        result.body.PartnerConfig.use_market_place
                    ).toBeTruthy();
                });
            });

            describe('E2E Employer Registers test', () => {
                it('Should throw an error if item is empty', async () => {
                    const input = {
                        line1: 'Rua',
                        line2: '72B',
                        line3: '',
                        neighborhood: 'Bairro Teste',
                        postal_code: '5484248423',
                        city: 'Cidade teste',
                        state: 'Estado teste',
                        country: 'País teste',
                        fantasy_name: 'Empresa teste',
                        document: 'empregador',
                        classification: 'Classificação',
                        colaborators_number: 5,
                        email: 'empregador@empregador.com',
                        phone_1: '215745158',
                        phone_2: '124588965',
                        business_type: 'empregador',
                        branch_name: 'Frigoríficio',
                    };

                    const result = await request(app)
                        .post('/business/register')
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe('Item is required');
                });

                it('Should register new employer ', async () => {
                    const input = {
                        line1: 'Rua',
                        line2: '72B',
                        line3: '',
                        neighborhood: 'Bairro Teste',
                        postal_code: '5484248423',
                        city: 'Cidade teste',
                        state: 'Estado teste',
                        country: 'País teste',
                        fantasy_name: 'Empresa teste',
                        document: 'empregador',
                        classification: 'Classificação',
                        colaborators_number: 5,
                        email: 'empregador@empregador.com',
                        phone_1: '215745158',
                        phone_2: '124588965',
                        business_type: 'empregador',
                        employer_branch: 'Frigoríficio',
                        items_uuid: [
                            benefit1_uuid,
                            benefit3_uuid,
                            benefit2_uuid,
                        ],
                    };

                    const result = await request(app)
                        .post('/business/register')
                        .send(input);
                    expect(result.statusCode).toBe(201);

                    employer_info_uuid = result.body.BusinessInfo.uuid;
                    employer_address_uuid = result.body.Address.uuid;
                });
            });
        });
    });

    describe('Business data', () => {
        describe('Update Business data by correct', () => {
            it('Should throw an error if business id is missing', async () => {
                const input = {
                    address_uuid: '123',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    status: 'pending_approval',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };
                const result = await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business info Id is required');
            });

            it('Should throw an error if business info was not found', async () => {
                const input = {
                    address_uuid: '123',
                    fantasy_name: 'Empresa teste',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    status: 'pending_approval',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const query = {
                    business_info_uuid: '1',
                };
                const result = await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .query(query)
                    .send(input);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Business info not found');
            });

            it('Should update business data by correct admin', async () => {
                const input = {
                    address_uuid: partner_address_uuid,
                    fantasy_name: 'Empresa novo nome',
                    document: 'comercio',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'comercio@comercio.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };

                const query = {
                    business_info_uuid: partner_info_uuid,
                };
                const result = await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .query(query)
                    .send(input);
                expect(result.statusCode).toBe(200);
                expect(result.body.address_uuid).toEqual(partner_address_uuid);
                expect(result.body.fantasy_name).toBe(input.fantasy_name);
                expect(result.body.status).toBe('pending_approval');
                expect(result.body.document).toBe(input.document);
                expect(result.body.email).toBe(input.email);
                expect(result.body.phone_1).toBe(input.phone_1);
                expect(result.body.phone_2).toBe(input.phone_2);
                expect(result.body.business_type).toBe(input.business_type);
            });
        });
    });
    describe('Business User', () => {
        describe('E2E Create Business admin by correct admin', () => {
            it('Should throw an error if password is missing', async () => {
                const input = {
                    password: '',
                    business_info_uuid: partner_info_uuid,
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Password is required');
            });

            it('Should throw an error if business info id is missing', async () => {
                const input = {
                    password: '123456',
                    business_info_uuid: '',
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business Info Id is required');
            });

            it('Should throw an error if name is missing', async () => {
                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Name is required');
            });

            it('Should throw an error if email is missing', async () => {
                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                    name: 'Nome do admin',
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Email is required');
            });

            it('Should throw an error if email is invalid', async () => {
                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                    email: 'differentema',
                    name: 'Nome do admin',
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Invalid email format');
            });

            it('Should throw an error if email is not found in company registers', async () => {
                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                    email: 'differentemail@email.com',
                    name: 'Nome do admin',
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Email not found in company registers'
                );
            });

            it('Should throw an error if business is still not validated by correct', async () => {
                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                    email: 'comercio@comercio.com',
                    name: 'Nome do admin',
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe(
                    'Business must be validated before creating an Admin user'
                );
            });

            it('Should throw an error if business is inactive', async () => {
                //inactive business
                const inputToInactivate = {
                    address_uuid: partner_address_uuid,
                    fantasy_name: 'Empresa novo nome',
                    document: 'comercio',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'comercio@comercio.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: 'comercio',
                    status: 'inactive',
                };
                const query = {
                    business_info_uuid: partner_info_uuid,
                };
                await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .query(query)
                    .send(inputToInactivate);

                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                    email: 'comercio@comercio.com',
                    name: 'Nome do admin',
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Business has inactive status');
            });

            it('Should create business admin', async () => {
                //activate business
                const inputToActivate = {
                    address_uuid: partner_address_uuid,
                    fantasy_name: 'Empresa novo nome',
                    document: 'comercio',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'comercio@comercio.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: 'comercio',
                    status: 'active',
                };
                const query = {
                    business_info_uuid: partner_info_uuid,
                };
                await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .query(query)
                    .send(inputToActivate);

                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                    email: 'comercio@comercio.com',
                    name: 'Nome do admin',
                };

                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                partner_admin_uuid = result.body.uuid;
                expect(result.statusCode).toBe(201);
                expect(result.body.uuid).toBeTruthy();
                expect(result.body.business_info_uuid).toBe(partner_info_uuid);
                expect(result.body.email).toBe(input.email);
                expect(result.body.document).toBeFalsy();
                expect(result.body.is_admin).toBe(true);
                expect(result.body.permissions).toEqual(['all']);
                expect(result.body.user_name).toBeFalsy();
                expect(result.body.function).toBeFalsy();
                expect(result.body.status).toBe('pending_password');
            });

            it('Should throw an error if email is already registered', async () => {
                const input = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid,
                    email: 'comercio@comercio.com',
                    name: 'Nome do admin',
                };
                const result = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(409);
                expect(result.body.error).toBe('Email already registered');
            });
        });

        describe('E2E Authenticate business user/admin', () => {
            it('Should throw an error if user business document is missing', async () => {
                const input = {
                    business_document: '',
                    password: '123456',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Incorrect credentials');
            });

            it('Should throw an error if user password is missing', async () => {
                const input = {
                    business_document: 'CNPJ',
                    password: '',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Incorrect credentials');
            });

            it('Should throw an error if business document does not exist', async () => {
                const input = {
                    business_document: 'Wrong document',
                    password: '123456',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Incorrect credentials');
            });

            it('Should throw an error if trying to login with wrong email', async () => {
                const input = {
                    business_document: 'CNPJ',
                    password: '123456',
                    email: 'wrongemail@wrongemail.com',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Incorrect credentials');
            });

            it('Should throw an error if trying to login with right email and wrong password', async () => {
                const input = {
                    business_document: 'comercio',
                    password: '9847878',
                    email: 'comercio@comercio.com',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Incorrect credentials');
            });

            it('Should login user', async () => {
                const input = {
                    business_document: 'comercio',
                    password: '123456',
                    email: 'comercio@comercio.com',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                partner_admin_token = result.body.token;
                expect(result.statusCode).toBe(200);
                expect(result.body.token).toBeTruthy();
            });

            it("Should throw an error if trying to login with username and it's missing", async () => {
                const input = {
                    business_document: 'CNPJ',
                    password: '9847878',
                    user_name: '',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Incorrect credentials');
            });

            it('Should throw an error if trying to login with username and it does not exist', async () => {
                const input = {
                    business_document: 'CNPJ',
                    password: '9847878',
                    user_name: 'any',
                };

                const result = await request(app)
                    .post('/business/admin/login')
                    .send(input);
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Incorrect credentials');
            });
        });

        describe('E2E Business Admin/user details', () => {
            it('Should return user details', async () => {
                const result = await request(app)
                    .get('/business/admin/details')
                    .set('Authorization', `Bearer ${partner_admin_token}`);
                expect(result.statusCode).toBe(200);
                expect(result.body.uuid).toBe(partner_admin_uuid);
                expect(result.body.business_info_uuid).toEqual(
                    partner_info_uuid
                );
                expect(result.body.created_at).toBeTruthy();
            });
        });

        describe('E2E Update Business admin by business admin ', () => {
            let partnerAdminDetails = {
                business_info_uuid: '',
                email: '',
                document: '',
                name: '',
                is_admin: '',
                permissions: '',
                user_name: '',
                function: '',
                status: '',
                created_at: '',
            };

            beforeAll(async () => {
                const getPartnerAdminDetails = await request(app)
                    .get('/business/admin/details')
                    .set('Authorization', `Bearer ${partner_admin_token}`);
                expect(getPartnerAdminDetails.statusCode).toBe(200);

                (partnerAdminDetails.business_info_uuid =
                    getPartnerAdminDetails.body.business_info_uuid),
                    (partnerAdminDetails.is_admin =
                        getPartnerAdminDetails.body.is_admin);
                partnerAdminDetails.document =
                    getPartnerAdminDetails.body.document;
                partnerAdminDetails.name = getPartnerAdminDetails.body.name;
                partnerAdminDetails.email = getPartnerAdminDetails.body.email;
                partnerAdminDetails.user_name =
                    getPartnerAdminDetails.body.user_name;
                partnerAdminDetails.function =
                    getPartnerAdminDetails.body.function;
                partnerAdminDetails.permissions =
                    getPartnerAdminDetails.body.permissions;
                partnerAdminDetails.status = getPartnerAdminDetails.body.status;
                partnerAdminDetails.created_at =
                    getPartnerAdminDetails.body.created_at;
            });

            it('Should throw an error if password is the same from last one', async () => {
                const input = {
                    name: 'Fernando de Oliviera',
                    permissions: '',
                    user_name: 'fernando',
                    password: '123456', //this password is taken from previous test when admin was created
                    function: '',
                    status: '',
                };

                const result = await request(app)
                    .put('/company-admin')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(409);
                expect(result.body.error).toBe('Password must not be the same');
            });
            it('Should update only admin name', async () => {
                const input = {
                    name: 'Fernando',
                };

                const result = await request(app)
                    .put('/company-admin')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                //test if password has not changed
                const inputAuthenticate = {
                    business_document: 'comercio',
                    password: '123456',
                    email: 'comercio@comercio.com',
                };

                const authenticatePartnerUser = await request(app)
                    .post('/business/admin/login')
                    .send(inputAuthenticate);
                expect(authenticatePartnerUser.statusCode).toBe(200);
                expect(result.statusCode).toBe(200);
                expect(result.body.is_admin).toBeTruthy();
                expect(result.body.document).toBe(partnerAdminDetails.document);
                expect(result.body.name).toBe(input.name);
                expect(result.body.email).toBe(partnerAdminDetails.email);
                expect(result.body.user_name).toBe(
                    partnerAdminDetails.user_name
                );
                expect(result.body.function).toBe(partnerAdminDetails.function);
                expect(result.body.status).toBe(partnerAdminDetails.status);
                expect(result.body.permissions).toEqual(
                    partnerAdminDetails.permissions
                );
                expect(result.body.updated_at).toBeTruthy();
                expect(result.body.password).toBeUndefined();
            });
            it('Should update document, password, and username', async () => {
                const input = {
                    name: 'Fernando Oliveira',
                    document: '036.760.591-07',
                    password: 'new-password',
                };

                const result = await request(app)
                    .put('/company-admin')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                //test if password has not changed
                const inputAuthenticate = {
                    business_document: 'comercio',
                    password: 'new-password',
                    email: 'comercio@comercio.com',
                };

                const authenticatePartnerUser = await request(app)
                    .post('/business/admin/login')
                    .send(inputAuthenticate);
                expect(authenticatePartnerUser.statusCode).toBe(200);
                expect(result.statusCode).toBe(200);
                expect(result.body.is_admin).toBeTruthy();
                expect(result.body.document).toBe('03676059107');
                expect(result.body.name).toBe(input.name);
                expect(result.body.email).toBe(partnerAdminDetails.email);
                expect(result.body.user_name).toBe(
                    partnerAdminDetails.user_name
                );
                expect(result.body.function).toBe(partnerAdminDetails.function);
                expect(result.body.status).toBe('active');
                expect(result.body.permissions).toEqual(
                    partnerAdminDetails.permissions
                );
                expect(result.body.updated_at).toBeTruthy();
                expect(result.body.password).toBeUndefined();
            });
        });

        describe('E2E Create business user by business admin', () => {
            it('Should throw an error if user name is missing', async () => {
                const input = {
                    password: '1345687',
                    user_name: '',
                };
                const result = await request(app)
                    .post('/business/admin/register/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('User name is required');
            });

            it('Should register a new user', async () => {
                const input = {
                    password: '1345687',
                    partner_info_uuid,
                    user_name: 'user_name',
                    permissions: ['finances'],
                };
                const result = await request(app)
                    .post('/business/admin/register/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                partner_finances_user_uuid = result.body.uuid;

                //authenticate new user
                const authInput = {
                    business_document: 'comercio',
                    user_name: 'user_name',
                    password: input.password,
                };

                const auth = await request(app)
                    .post('/business/admin/login')
                    .send(authInput);
                expect(auth.statusCode).toBe(200);

                expect(result.statusCode).toBe(201);
                expect(result.body.uuid).toBeTruthy();
                expect(result.body.business_info_uuid).toBe(
                    input.partner_info_uuid
                );
                expect(result.body.email).toBeFalsy();
                expect(result.body.document).toBeFalsy();
                expect(result.body.is_admin).toBeFalsy();
                expect(result.body.permissions).toEqual(input.permissions);
                expect(result.body.user_name).toEqual(input.user_name);
                expect(result.body.funtion).toBeFalsy();
                expect(result.body.status).toBe('active');
            });

            it('Should throw an error if user name already exists', async () => {
                const input = {
                    password: '1345687',
                    partner_info_uuid,
                    user_name: 'user_name',
                    permissions: ['finances'],
                };
                const result = await request(app)
                    .post('/business/admin/register/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(409);
                expect(result.body.error).toBe('User name already registered');
            });
        });
        describe('E2E Update business user by business admin', () => {
            it('Should update only user name', async () => {
                const input = {
                    user_name: 'Fernando Finanças',
                };

                const result = await request(app)
                    .patch('/company-user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input)
                    .query({ user_id: partner_finances_user_uuid });
                //test if password has not changed
                const inputAuthenticate = {
                    business_document: 'comercio',
                    password: '1345687',
                    user_name: input.user_name,
                };

                const authenticatePartnerUser = await request(app)
                    .post('/business/admin/login')
                    .send(inputAuthenticate);
                expect(authenticatePartnerUser.statusCode).toBe(200);
                expect(result.statusCode).toBe(200);
                expect(result.body.is_admin).toBeFalsy();
                expect(result.body.document).toBeFalsy();
                expect(result.body.user_name).toBe(input.user_name);
            });
            it('Should update only password', async () => {
                const input = {
                    password: 'new-password123',
                };

                const result = await request(app)
                    .patch('/company-user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input)
                    .query({ user_id: partner_finances_user_uuid });
                //test if password has not changed
                const inputAuthenticate = {
                    business_document: 'comercio',
                    password: input.password,
                    user_name: 'Fernando Finanças',
                };

                const authenticatePartnerUser = await request(app)
                    .post('/business/admin/login')
                    .send(inputAuthenticate);
                expect(authenticatePartnerUser.statusCode).toBe(200);
                expect(result.statusCode).toBe(200);
                expect(result.body.is_admin).toBeFalsy();
                expect(result.body.document).toBeFalsy();
                expect(result.body.user_name).toBe('Fernando Finanças');
            });

            it('Should update only password and username', async () => {
                const input = {
                    user_name: 'Fernando Ferreira',
                    password: 'another-new-password123',
                };

                const result = await request(app)
                    .patch('/company-user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input)
                    .query({ user_id: partner_finances_user_uuid });
                //test if password has not changed
                const inputAuthenticate = {
                    business_document: 'comercio',
                    password: input.password,
                    user_name: input.user_name,
                };

                const authenticatePartnerUser = await request(app)
                    .post('/business/admin/login')
                    .send(inputAuthenticate);
                expect(authenticatePartnerUser.statusCode).toBe(200);
                expect(result.statusCode).toBe(200);
                expect(result.body.is_admin).toBeFalsy();
                expect(result.body.document).toBeFalsy();
                expect(result.body.user_name).toBe(input.user_name);
            });
        });

        describe('E2E Get single user by admin', () => {
            it('Should throw an error if id is missing', async () => {
                const result = await request(app)
                    .get('/business/admin/details/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query({ user_uuid: '' });

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Id is required');
            });

            it('Should throw an error if user cannot be found', async () => {
                const result = await request(app)
                    .get('/business/admin/details/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query({ user_uuid: '1' });

                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('User not found');
            });

            it('Should return user details', async () => {
                const result = await request(app)
                    .get('/business/admin/details/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query({ user_uuid: partner_finances_user_uuid });
                expect(result.statusCode).toBe(200);
                expect(result.body.uuid).toEqual(partner_finances_user_uuid);
                expect(result.body.business_info_uuid).toEqual(
                    partner_info_uuid
                );
            });
        });

        describe('E2E Get all users by admin', () => {
            beforeAll(async () => {
                const input1 = {
                    password: '1345687',
                    partner_info_uuid,
                    user_name: 'user_name2',
                    permissions: ['finances'],
                };
                const input2 = {
                    password: '1345687',
                    partner_info_uuid,
                    user_name: 'user_name3',
                    permissions: ['finances'],
                };
                const partner_finances_user_uuid2 = await request(app)
                    .post('/business/admin/register/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input1);
                const partner_finances_user_uuid3 = await request(app)
                    .post('/business/admin/register/user')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input2);
                expect(partner_finances_user_uuid2.statusCode).toBe(201);
                expect(partner_finances_user_uuid3.statusCode).toBe(201);
            });

            it('Should return users', async () => {
                const result = await request(app)
                    .get('/company-users')
                    .set('Authorization', `Bearer ${partner_admin_token}`);
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(3);
            });
        });

        describe('E2E Delete user by admin', () => {
            it('Should throw an error if user id is missing', async () => {
                const result = await request(app)
                    .patch('/company-user/delete')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query({ user_id: '' });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('User id is required');
            });

            it('Should throw an error if user is not found', async () => {
                const result = await request(app)
                    .patch('/company-user/delete')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query({ user_id: '12345' });
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('User not found');
            });

            it('Should delete an user', async () => {
                const result = await request(app)
                    .patch('/company-user/delete')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query({ user_id: partner_admin_uuid });
                expect(result.statusCode).toBe(200);
                expect(result.body.message).toBe(
                    'Usuário excluído com sucesso'
                );
            });
        });

        describe('E2E Confirm password by business admin', () => {
            it('Should throw an error if password is missing', async () => {
                const input = {
                    password: '',
                };
                const result = await request(app)
                    .post('/confirm-password')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Password is required');
            });

            it('Should throw an error if password is incorrect', async () => {
                const input = {
                    password: '16548',
                };
                const result = await request(app)
                    .post('/confirm-password')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                expect(result.statusCode).toBe(403);
                expect(result.body.error).toBe('Incorrect credentials');
            });

            it('Should confirm password', async () => {
                const input = {
                    password: 'new-password', //make sure this password is correct after updates tests
                };
                const result = await request(app)
                    .post('/confirm-password')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                expect(result.statusCode).toBe(200);
                expect(result.body.message).toBe('Password matches');
            });
        });
    });

    describe('Business Data by Business admin', () => {
        describe('E2E Get Business data by business admin', () => {
            it('Should return business data', async () => {
                const result = await request(app)
                    .get('/business/info')
                    .set('Authorization', `Bearer ${partner_admin_token}`);
                partner_info_uuid = result.body.uuid;
                expect(result.statusCode).toBe(200);
            });
        });
        describe('E2E update business data by business admin', () => {
            it('Should throw an error if id is missing', async () => {
                const input = {
                    address_uuid: '123',
                    fantasy_name: 'Atualizado pelo admin',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '64684984654',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };
                const query = {
                    business_info_uuid: '',
                };
                const result = await request(app)
                    .put('/business/info/company')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query(query)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business info Id is required');
            });
            it('Should throw an error if id is missing', async () => {
                const input = {
                    address_uuid: '123',
                    fantasy_name: 'Atualizado pelo admin',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '64684984654',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };
                const query = {
                    business_info_uuid: '123',
                };
                const result = await request(app)
                    .put('/business/info/company')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query(query)
                    .send(input);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Business info not found');
            });
            it('Should update business data', async () => {
                const input = {
                    address_uuid: '123',
                    fantasy_name: 'Atualizado pelo admin',
                    document: 'CNPJ',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'email@email.com',
                    phone_1: '64684984654',
                    phone_2: '124588965',
                    business_type: 'comercio',
                };
                const query = {
                    business_info_uuid: partner_info_uuid,
                };
                const result = await request(app)
                    .put('/business/info/company')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query(query)
                    .send(input);
                expect(result.statusCode).toBe(200);
            });
        });
    });

    describe('Business Address', () => {
        describe('Update Business Address', () => {
            it('Should throw an error if address id is missing', async () => {
                const input = {
                    line1: 'Rua nova',
                    line2: '72B',
                    line3: 'Complemento novo',
                    neighborhood: 'Bairro Teste',
                    postal_code: '731547854',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                };
                const query = {
                    address_uuid: '',
                };
                const result = await request(app)
                    .put('/company-address')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query(query)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Address Id is required');
            });

            it('Should throw an error if address can not be found', async () => {
                const input = {
                    line1: 'Rua nova',
                    line2: '72B',
                    line3: 'Complemento novo',
                    neighborhood: 'Bairro Teste',
                    postal_code: '731547854',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                };
                const query = {
                    address_uuid: '1',
                };
                const result = await request(app)
                    .put('/company-address')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query(query)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Address not found');
            });
            it('Should update address', async () => {
                const input = {
                    line1: 'Rua nova',
                    line2: '72B',
                    line3: 'Complemento novo',
                    neighborhood: 'Bairro Teste',
                    postal_code: '731547854',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                };
                const query = {
                    address_uuid: partner_address_uuid,
                };
                const result = await request(app)
                    .put('/company-address')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .query(query)
                    .send(input);
                const data = await request(app)
                    .get('/business/info')
                    .set('Authorization', `Bearer ${partner_admin_token}`);

                expect(result.statusCode).toBe(200);
                expect(data.body.Address.line1).toBe('Rua nova');
                expect(data.body.Address.line3).toBe('Complemento novo');
            });
        });
    });

    describe('Employer Item Details by Correct Admin', () => {
        describe('E2E Create Employer Item details by correct admin', () => {
            it('Should throw an error if cycle end day is missing', async () => {
                const input = {
                    item_uuid: randomUUID(),
                    business_info_uuid: randomUUID(),
                    cycle_end_day: 0,
                    value: 200,
                };
                const result = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Cycle end day is required');
            });
            it('Should throw an error if item cannot be found', async () => {
                const input = {
                    item_uuid: randomUUID(),
                    business_info_uuid: randomUUID(),
                    cycle_end_day: 1,
                    value: 200,
                };
                const result = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Item not found');
            });
            it('Should throw an error if business cannot be found', async () => {
                const input = {
                    item_uuid: benefit1_uuid,
                    business_info_uuid: randomUUID(),
                    cycle_end_day: 1,
                    value: 200,
                };
                const result = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Business not found');
            });

            it('Should create a new item details', async () => {
                const input = {
                    item_uuid: benefit4_uuid,
                    business_info_uuid: employer_info_uuid,
                    cycle_end_day: 1,
                    value: 200,
                };
                const result = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(201);
                expect(result.body.employerItem).toHaveProperty('uuid');
                expect(result.body.employerItem.item_uuid).toBe(
                    input.item_uuid
                );
                expect(result.body.employerItem.business_info_uuid).toBe(
                    input.business_info_uuid
                );
                expect(result.body.employerItem.is_active).toBeTruthy();
                expect(result.body.employerItem.cycle_end_day).toBe(
                    input.cycle_end_day
                );
                expect(result.body.employerItem.cycle_start_day).toBe(
                    input.cycle_end_day + 1
                );
                expect(result.body.defaultGroup).toHaveProperty('uuid');
                expect(result.body.defaultGroup.group_name).toBe(
                    'Grupo Vale Refeição (Padrão)'
                );
                expect(
                    result.body.defaultGroup.employer_item_details_uuid
                ).toBe(result.body.employerItem.uuid);
                expect(result.body.defaultGroup.value).toBe(input.value);
                expect(result.body.defaultGroup.business_info_uuid).toBe(
                    result.body.employerItem.business_info_uuid
                );
                expect(result.body.employerItem.created_at).toBeTruthy();
                expect(result.body.employerItem.updated_at).toBeFalsy();
                expect(result.body.defaultGroup.created_at).toBeTruthy();
                expect(result.body.defaultGroup.updated_at).toBeFalsy();
            });
            it('Should create a group for an existing employer item that was created on business first register', async () => {
                const input = {
                    item_uuid: benefit1_uuid,
                    business_info_uuid: employer_info_uuid,
                    cycle_end_day: 1,
                    value: 200,
                };
                const result = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(201);
                expect(result.body.employerItem).toHaveProperty('uuid');
                expect(result.body.employerItem.item_uuid).toBe(
                    input.item_uuid
                );
                expect(result.body.employerItem.business_info_uuid).toBe(
                    input.business_info_uuid
                );
                expect(result.body.employerItem.cycle_end_day).toBe(
                    input.cycle_end_day
                );
                expect(result.body.employerItem.cycle_start_day).toBe(
                    input.cycle_end_day + 1
                );
                expect(result.body.defaultGroup).toHaveProperty('uuid');
                expect(result.body.defaultGroup.group_name).toBe(
                    'Grupo Vale Alimentação (Padrão)'
                );
                expect(
                    result.body.defaultGroup.employer_item_details_uuid
                ).toBe(result.body.employerItem.uuid);
                expect(result.body.defaultGroup.value).toBe(input.value);
                expect(result.body.defaultGroup.business_info_uuid).toBe(
                    result.body.employerItem.business_info_uuid
                );
                expect(result.body.employerItem.created_at).toBeTruthy();
                expect(result.body.employerItem.updated_at).toBeTruthy();
                expect(result.body.defaultGroup.created_at).toBeTruthy();
                expect(result.body.defaultGroup.updated_at).toBeFalsy();
            });
            it('Should update item and group', async () => {
                const input = {
                    item_uuid: benefit1_uuid,
                    business_info_uuid: employer_info_uuid,
                    cycle_end_day: 5,
                    value: 300,
                };
                const result = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(201);
                expect(result.body.employerItem).toHaveProperty('uuid');
                expect(result.body.employerItem.item_uuid).toBe(
                    input.item_uuid
                );
                expect(result.body.employerItem.business_info_uuid).toBe(
                    input.business_info_uuid
                );
                expect(result.body.employerItem.cycle_end_day).toBe(
                    input.cycle_end_day
                );
                expect(result.body.employerItem.cycle_start_day).toBe(
                    input.cycle_end_day + 1
                );
                expect(result.body.defaultGroup).toHaveProperty('uuid');
                expect(result.body.defaultGroup.group_name).toBe(
                    'Grupo Vale Alimentação (Padrão)'
                );
                expect(
                    result.body.defaultGroup.employer_item_details_uuid
                ).toBe(result.body.employerItem.uuid);
                expect(result.body.defaultGroup.value).toBe(input.value);
                expect(result.body.defaultGroup.business_info_uuid).toBe(
                    result.body.employerItem.business_info_uuid
                );
                expect(result.body.employerItem.created_at).toBeTruthy();
                expect(result.body.employerItem.updated_at).toBeTruthy();
                expect(result.body.defaultGroup.created_at).toBeTruthy();
                expect(result.body.defaultGroup.updated_at).toBeTruthy();
            });
        });
        describe('E2E Find All Employer item details by correct admin', () => {
            beforeAll(async () => {
                //create custom benefit
                const input = {
                    name: 'Vale Alimentação Customizado',
                    description: 'Descrição',
                    parent_uuid: null as any,
                    item_type: 'gratuito' as ItemType,
                    item_category: 'pre_pago' as ItemCategory,
                    business_info_uuid: employer_info_uuid,
                    cycle_end_day: 2,
                };

                const result = await request(app)
                    .post('/benefit/custom')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(201);
            });
            it('Should return an empty array', async () => {
                const input = {
                    business_info_uuid: randomUUID(),
                };
                const result = await request(app)
                    .get(
                        `/business/item/details/correct/${input.business_info_uuid}`
                    )
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(0);
            });
            it('Should return an array with item details', async () => {
                const input = {
                    business_info_uuid: employer_info_uuid,
                };
                const result = await request(app)
                    .get(
                        `/business/item/details/correct/${input.business_info_uuid}`
                    )
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(5);
                expect(result.body[0].business_info_uuid).toEqual(
                    employer_info_uuid
                );
                expect(result.body[1].business_info_uuid).toEqual(
                    employer_info_uuid
                );
                expect(result.body[2].business_info_uuid).toEqual(
                    employer_info_uuid
                );

                item_details_1 = result.body[0].uuid;
            });
        });
        describe('E2E Find one item details by correct admin', () => {
            it('Should throw an error if item details is not found', async () => {
                const input = {
                    id: randomUUID(),
                };
                const result = await request(app)
                    .get(`/business/item/details/${input.id}/correct/`)
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Item details not found');
            });
            it('Should return an item details', async () => {
                const input = {
                    id: item_details_1,
                };
                const result = await request(app)
                    .get(`/business/item/details/${input.id}/correct/`)
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);
                expect(result.statusCode).toBe(200);
                expect(result.body.uuid).toEqual(item_details_1);
            });
        });
        describe('E2E Update Business cycles by correct admin', () => {
            it('Should throw an error if business id is missing', async () => {
                const input = {
                    business_info_uuid: '',
                    item_uuid: 'any uuid',
                    cycle_end_day: 2,
                };
                const result = await request(app)
                    .patch('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business Id is required');
            });

            it('Should throw an error if business id is missing', async () => {
                const input = {
                    business_info_uuid: 'any uuid',
                    item_uuid: '',
                    cycle_end_day: 2,
                };
                const result = await request(app)
                    .patch('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Item Id is required');
            });

            it('Should throw an error if cycle end day is missing', async () => {
                const input = {
                    business_info_uuid: 'any uuid',
                    item_uuid: 'any uuid',
                };
                const result = await request(app)
                    .patch('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Cycle end day is required');
            });
            it('Should throw an error if cycle end day is equal to zero', async () => {
                const input = {
                    business_info_uuid: 'any uuid',
                    item_uuid: 'any uuid',
                    cycle_end_day: 0,
                };
                const result = await request(app)
                    .patch('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Cycle end day is required');
            });
            it('Should throw an error if item cannot be found', async () => {
                const input = {
                    business_info_uuid: 'any uuid',
                    item_uuid: 'any uuid',
                    cycle_end_day: 1,
                };
                const result = await request(app)
                    .patch('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Item not found');
            });

            it('Should set new cycle end day', async () => {
                const input = {
                    business_info_uuid: employer_info_uuid,
                    item_uuid: benefit1_uuid,
                    cycle_end_day: 5,
                };
                const result = await request(app)
                    .patch('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(input);

                expect(result.statusCode).toBe(200);
                expect(result.body.cycle_end_day).toBe(5);
                expect(result.body.cycle_start_day).toBe(6);
            });
        });
    });
    describe('Employer Item Details By Business Admin', () => {
        beforeAll(async () => {
            //activate business
            const inputToActivate = {
                address_uuid: employer_address_uuid,
                fantasy_name: 'Empresa novo nome',
                document: 'empregador',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'empregador@empregador.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'empregador',
                status: 'active',
            };
            const query = {
                business_info_uuid: employer_info_uuid,
            };
            const activate = await request(app)
                .put('/business/info/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .query(query)
                .send(inputToActivate);
            expect(activate.statusCode).toBe(200);

            //create employer user
            const input = {
                password: '123456',
                business_info_uuid: employer_info_uuid,
                email: 'empregador@empregador.com',
                name: 'Nome do admin employer',
            };
            const create = await request(app)
                .post('/business/admin/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send(input);
            employer_user_uuid = create.body.uuid;
            expect(create.statusCode).toBe(201);

            //authenticate employer
            const authInput = {
                business_document: 'empregador',
                password: '123456',
                email: 'empregador@empregador.com',
            };

            const auth = await request(app)
                .post('/business/admin/login')
                .send(authInput);
            expect(auth.statusCode).toBe(200);
            employer_user_token = auth.body.token;
        });

        describe('E2E Find All Employer item details by business admin', () => {
            it('Should return an array with item details', async () => {
                const result = await request(app)
                    .get(`/business/item/details`)
                    .set('Authorization', `Bearer ${employer_user_token}`);

                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(5);
            });
        });

        describe('E2E Find single employer item detail by business admin', () => {
            it('Should throw an error if item detail is not found', async () => {
                const input = {
                    id: randomUUID(),
                };

                const result = await request(app)
                    .get(`/business/item/details/${input.id}/employer`)
                    .set('Authorization', `Bearer ${employer_user_token}`);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Item details not found');
            });
            it('Should return an item detail', async () => {
                const input = {
                    id: item_details_1,
                };
                const result = await request(app)
                    .get(`/business/item/details/${input.id}/employer`)
                    .set('Authorization', `Bearer ${employer_user_token}`);
                expect(result.statusCode).toBe(200);
            });
        });
    });
    describe('E2E Benefit Groups', () => {
        let employeesListUuids: string[] = [];
        let employerItems1: string[] = [];
        let group1_uuid: string;

        describe('E2E Create Benefit Group by employer', () => {
            beforeAll(async () => {
                //Get employer items
                const employerItems = await request(app)
                    .get(`/business/item/details`)
                    .set('Authorization', `Bearer ${employer_user_token}`);
                expect(employerItems.statusCode).toBe(200);
                employerItems.body.map((employerItems: any) => {
                    employerItems1.push(employerItems.uuid);
                });
            });

            it('Should create an group', async () => {
                const input: any = {
                    group_name: 'Diretoria',
                    employer_item_details_uuid: employerItems1[0],
                    value: 500,
                };
                const result = await request(app)
                    .post('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);
                group1_uuid = result.body.uuid;
                expect(result.statusCode).toBe(201);
                expect(result.body.group_name).toBe(input.group_name);
                expect(result.body.employerItemDetails_uuid).toBe(
                    input.employer_item_details_uuid
                );
                expect(result.body.is_default).toBe(false);
                expect(result.body.value).toBe(input.value);

                //confirming value directly from database
                const groupValue = await prismaClient.benefitGroups.findUnique({
                    where: { uuid: result.body.uuid },
                });
                expect(groupValue.value).toBe(input.value * 100);
            });
            it('Should throw an error if group name is missing', async () => {
                const input: any = {
                    group_name: '',
                    employer_item_details_uuid: employerItems1[1],
                    value: 500,
                };
                const result = await request(app)
                    .post('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Group name is required');
            });
            it('Should throw an error if value is less than zero', async () => {
                const input: any = {
                    group_name: 'Diretoria',
                    employer_item_details_uuid: employerItems1[1],
                    value: -500,
                };
                const result = await request(app)
                    .post('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Value cannot be negative');
            });
            it('Should throw an error if employer item does not exist', async () => {
                const input: any = {
                    group_name: 'Diretoria',
                    employer_item_details_uuid: new Uuid().uuid,
                    value: 500,
                };
                const result = await request(app)
                    .post('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Employer Item not found');
            });
            it('Should throw an error if employer item is not from this business', async () => {
                //TO BE IMPLEMENTED
                // const input: any = {
                //     group_name: 'Diretoria',
                //     employer_item_details_uuid: item_details_1,
                //     value: 500,
                // };
                // const result = await request(app)
                //     .post('/business-admin/group')
                //     .set('Authorization', `Bearer ${employer_user_token}`)
                //     .send(input);
                // expect(result.statusCode).toBe(403);
                // expect(result.body.error).toBe(
                //     'Employer Item not found in this company'
                // );
            });
        });
        describe('E2E Update Groups', () => {
            it('Should throw an error if group id is missing', async () => {
                const input: any = {
                    group_name: 'Grupo 1 Editado',
                    employer_item_details_uuid: employerItems1[0],
                    value: 58400,
                };
                const result = await request(app)
                    .put('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Group uuid is required');
            });
            it('Should update an group', async () => {
                const input: any = {
                    uuid: group1_uuid,
                    group_name: 'Grupo 1 Editado',
                    employer_item_details_uuid: employerItems1[0],
                    value: 584,
                };
                const result = await request(app)
                    .put('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);
                expect(result.statusCode).toBe(200);
                expect(result.body).toHaveProperty('uuid');
                expect(result.body.group_name).toEqual(input.group_name);
                expect(result.body.employerItemDetails_uuid).toEqual(
                    input.employer_item_details_uuid
                );
                expect(result.body.value).toEqual(input.value);
            });
        });
        describe('E2E Get All Groups  By Business', () => {
            beforeAll(async () => {
                //create one more group by employer 1
                const input: any = {
                    group_name: 'Grupo 2',
                    employer_item_details_uuid: employerItems1[1],
                    value: 350,
                };
                const result = await request(app)
                    .post('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);
                expect(result.statusCode).toBe(201);
            });
            it('Should return a list of groups', async () => {
                const result = await request(app)
                    .get('/business-admin/groups')
                    .set('Authorization', `Bearer ${employer_user_token}`);
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(4);
            });
        });
        describe('E2E Get one group By Business', () => {
            it('Should throw an error if group id is missing', async () => {
                const input = {
                    uuid: '',
                };
                const result = await request(app)
                    .get('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .query(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Uuid is required');
            });

            it('Should throw an error if group does not exist', async () => {
                const input = {
                    uuid: randomUUID(),
                };
                const result = await request(app)
                    .get('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .query(input);
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Group not found');
            });

            it('Should return a group', async () => {
                const group1 = await prismaClient.benefitGroups.findFirst({
                    where: { uuid: group1_uuid},
                });
                expect(group1).toBeTruthy();

                if (!group1) throw new Error('Group not found in test');
                group1_uuid = group1.uuid;
                const input = {
                    uuid: group1_uuid,
                };
                const result = await request(app)
                    .get('/business-admin/group')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .query(input);
                expect(result.statusCode).toBe(200);
                expect(result.body.uuid).toBe(input.uuid);
                expect(result.body.business_info_uuid).toBe(employer_info_uuid);
                expect(result.body.is_default).toBe(false);
                expect(group1.value).toBe(result.body.value * 100);
            });
        });
    
    });
    describe('Partner First register by correct seller', () => {
        describe('E2E Registering partner by correft seller', () => {
            it('Should register partner by correct seller', async () => {
                const input = {
                    line1: 'Rua',
                    line2: '72B',
                    line3: '',
                    neighborhood: 'Bairro Teste',
                    postal_code: '5484248423',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País teste',
                    fantasy_name: 'Empresa teste',
                    document: 'comercio4',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'comercio4@comercio.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: 'comercio',
                    branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
                    partnerConfig: {
                        main_branch: branch1_uuid,
                        partner_category: ['saude'],
                        use_marketing: false,
                        use_market_place: false,
                    },
                };

                const result = await request(app)
                    .post('/business/register/correct')
                    .set('Authorization', `Bearer ${correctSellerToken}`)
                    .send(input);
                expect(result.statusCode).toBe(201);
                expect(
                    result.body.CorrectUserBusinessBranch.correct_user_uuid
                ).toBeTruthy();
            });
        });
        describe('E2E Get Registered partner by correct seller', () => {
            it('Should throw an error if business document is missing', async () => {
                const result = await request(app)
                    .get('/partner/seller')
                    .set('Authorization', `Bearer ${correctSellerToken}`)
                    .send();

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business Document is required');
            });

            it('Should throw an error if business is not found', async () => {
                const result = await request(app)
                    .get('/partner/seller')
                    .set('Authorization', `Bearer ${correctSellerToken}`)
                    .send({ document: '123' });

                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Business not found');
            });

            it('Should throw an error if correct seller did not register this partner', async () => {
                const result = await request(app)
                    .get('/partner/seller')
                    .set('Authorization', `Bearer ${correctSellerToken}`)
                    .send({ document: 'CNPJ' });

                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Unauthorized access');
            });
            it('Should return partner', async () => {
                const result = await request(app)
                    .get('/partner/seller')
                    .set('Authorization', `Bearer ${correctSellerToken}`)
                    .send({ document: 'comercio4' });
                expect(result.statusCode).toBe(200);
                expect(result.body.business_document).toBe('comercio4');
                expect(result.body.fantasy_name).toBe('Empresa teste');
            });
        });
    });

    describe('E2E Partner Config', () => {
        describe('Get Partner config definitions by partner', () => {
            it('Should return partner config definitions', async () => {
                const result = await request(app)
                    .get(`/partner/config`)
                    .set('Authorization', `Bearer ${partner_admin_token}`);
                expect(result.statusCode).toBe(200);
                expect(result.body.title).toBeNull();
                expect(result.body.phone).toBeNull();
                expect(result.body.description).toBeNull();
                expect(result.body.sales_type).toBeNull();
            });
        });
        describe('Set partner config definitions by partner', () => {
            it('Should throw an error if any data is sent on the request', async () => {
                const result = await request(app)
                    .put(`/partner/config`)
                    .set('Authorization', `Bearer ${partner_admin_token}`);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'At least one field is required'
                );
            });

            it('Should set definitions without corrupting existing data', async () => {
                const prisma = new PrismaClient();

                // ARRANGE: Primeiro, buscamos o estado inicial e correto do partnerConfig
                const partnerConfigBefore =
                    await prisma.partnerConfig.findFirst({
                        where: { business_info_uuid: partner_info_uuid },
                    });
                const initialAdminTax = partnerConfigBefore.admin_tax;
                expect(initialAdminTax).toBe(15000); // Garante que o teste começa com o dado certo

                const input = {
                    title: 'Comércio muito bom',
                    phone: '67896487542',
                    description: 'Descrição do comércio que é muito bom mesmo',
                    sales_type: 'presencial',
                };

                // ACT: Executamos o update
                const result = await request(app)
                    .put(`/partner/config`)
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(201);

                // ASSERT: Buscamos novamente do banco para verificar o estado final
                const partnerConfigAfter = await prisma.partnerConfig.findFirst(
                    { where: { business_info_uuid: partner_info_uuid } }
                );
                await prisma.$disconnect();

                // Verificamos se os novos dados foram salvos
                expect(partnerConfigAfter.title).toEqual(input.title);
                expect(partnerConfigAfter.phone).toEqual(input.phone);

                // <<< ASSERÇÃO CRÍTICA >>>
                // Verificamos se os dados antigos e importantes não foram corrompidos
                expect(partnerConfigAfter.admin_tax).toBe(initialAdminTax); // Deve continuar sendo 15000
            });
        });
    });

    describe('E2E Transactions', () => {
        describe('Create POS transaction order by partner', () => {
            it('Should throw an error if original price is missing', async () => {
                const input = {};
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Original price is required');
            });
            it('Should throw an error if discount percentage is missing', async () => {
                const input = {
                    original_price: 100,
                };
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Discount percentage is required'
                );
            });
            it('Should throw an error if net price is missing', async () => {
                const input = {
                    original_price: 100,
                    discount_percentage: 10,
                };
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Net price is required');
            });

            it('Should throw an error if business is not active', async () => {
                //inactive partner
                const inputToInactivate = {
                    address_uuid: partner_address_uuid,
                    fantasy_name: 'Empresa novo nome',
                    document: 'comercio',
                    classification: 'Classificação',
                    colaborators_number: 5,
                    email: 'comercio@comercio.com',
                    phone_1: '215745158',
                    phone_2: '124588965',
                    business_type: 'comercio',
                    status: 'inactive',
                };
                const query = {
                    business_info_uuid: partner_info_uuid,
                };
                const inactivePartner = await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .query(query)
                    .send(inputToInactivate);
                expect(inactivePartner.statusCode).toBe(200);

                const input = {
                    original_price: 100,
                    discount_percentage: 10,
                    net_price: 90,
                };
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                expect(result.statusCode).toBe(403);
                expect(result.body.error).toBe('Business is not active');
            });
            it('Should throw an error if business type is Employer', async () => {
                const input = {
                    original_price: 100,
                    discount_percentage: 10,
                    net_price: 90,
                };
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);
                expect(result.statusCode).toBe(403);
                expect(result.body.error).toBe('Business type is not allowed');
            });
            // it("Should create a POS transaction", async () => {
            //   //ACTIVATE PARTNER TO BE ABLE TO CREATE TRANSACTIONS
            //   const inputToActivate = {
            //     status: "active"
            //   }
            //   const query = {
            //     business_info_uuid: partner_info_uuid
            //   }
            //   const activePartner = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToActivate)
            //   expect(activePartner.statusCode).toBe(200)

            //   //CREATE TRANSACTION
            //   const input = {
            //     original_price: 100, //100 reais
            //     discount_percentage: 10, // 10%
            //     net_price: 90 //90 reais
            //   }
            //   const result = await request(app).post("/pos-transaction").set('Authorization', `Bearer ${partner_admin_token}`).send(input)

            //   expect(result.statusCode).toBe(201)
            //   expect(result.body.user_item_uuid).toBeFalsy()
            //   expect(result.body.favored_business_info_uuid).toEqual(partner_info_uuid)
            //   expect(result.body.original_price).toBe(input.original_price)
            //   expect(result.body.discount_percentage).toBe(input.discount_percentage)
            //   expect(result.body.net_price).toBe(input.net_price)
            //   expect(result.body.fee_percentage).toBe(1) //considering that fee percentage is 1% for this partner

            //   const fee_percentage = result.body.fee_percentage
            //   const expected_fee_amount = (input.net_price * (fee_percentage / 100))// 1% de 90 = 0.9
            //   const expected_cashback = expected_fee_amount * 0.20 //20% de 0.9 = 0.18

            //   expect(result.body.fee_amount).toBe(expected_fee_amount)
            //   expect(result.body.cashback).toBeCloseTo(expected_cashback) //considering that fee percentage is 1% for this partner
            //   expect(result.body.description).toBe("Transação do ponto de venda (POS)")
            //   expect(result.body.transaction_status).toBe("pending")
            //   expect(result.body.transaction_type).toBe("POS_PAYMENT")
            //   expect(result.body.favored_partner_user_uuid).toBeTruthy()
            //   expect(result.body.paid_at).toBeFalsy()
            //   expect(result.body.created_at).toBeTruthy()
            //   expect(result.body.updated_at).toBeFalsy()

            // })
            it('DEVE criar uma transação POS com o cálculo de taxas correto', async () => {
                // --- ARRANGE (Preparação) ---
                const inputToActivate = { status: 'active' };
                const query = { business_info_uuid: partner_info_uuid };
                await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .query(query)
                    .send(inputToActivate);

                const transactionInput = {
                    original_price: 100.0,
                    discount_percentage: 10,
                    net_price: 90.0,
                };

                // --- ACT (Ação) ---
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(transactionInput);

                // --- ASSERT (Verificação) ---
                expect(result.statusCode).toBe(201);

                // O teste espera 1.5%, que vem da taxa de admin do Ramo "Hipermercados" (15000 / 10000)
                const expected_tax_percentage = 1.5;

                // Esta é a asserção que está falhando.
                expect(result.body.fee_percentage).toBeCloseTo(
                    expected_tax_percentage
                );
            });
            it('Should correctly calculate fee and cashback for a high-value transaction', async () => {
                // ARRANGE - Preparação
                const input = {
                    original_price: 50000,
                    discount_percentage: 10,
                    net_price: 45000, // 10% de desconto em 50.000
                };

                // ACT - Ação
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                const fee_percentage = result.body.fee_percentage;
                const expected_fee_amount =
                    input.net_price * (fee_percentage / 100); // 1% de 90 = 0.9
                const expected_cashback = expected_fee_amount * 0.2; //20% de 0.9 = 0.18

                // ASSERT - Verificação
                expect(result.statusCode).toBe(201);
                expect(result.body.net_price).toBe(input.net_price);
                expect(result.body.fee_amount).toBe(expected_fee_amount);
                expect(result.body.cashback).toBe(expected_cashback);
            });
            it('Should correctly round the fee amount when calculation results in a fraction', async () => {
                // ARRANGE
                const input = {
                    original_price: 99.55,
                    discount_percentage: 0,
                    net_price: 99.55,
                };

                // ACT
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                const fee_cents = Math.floor(
                    input.net_price * 100 * (result.body.fee_percentage / 100)
                ); // fee em centavos, truncado
                const expected_fee_amount = fee_cents / 100; // fee em reais
                const cashback_cents = Math.floor(fee_cents * 0.2); // cashback em centavos, truncado
                const expected_cashback = cashback_cents / 100;

                // ASSERT
                expect(result.statusCode).toBe(201);
                expect(result.body.fee_amount).toBe(expected_fee_amount);
                expect(result.body.cashback).toBeCloseTo(expected_cashback);
            });

            it('Should create a POS transaction with zero discount', async () => {
                // Define o input da transação com desconto zero
                const input = {
                    original_price: 150,
                    discount_percentage: 0, // <-- Cenário de teste principal
                    net_price: 150, // <-- Com desconto zero, net_price é igual a original_price
                };
                // ACT - Ação
                // ACT - Ação
                // Cria a transação através da API
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                const fee_percentage = result.body.fee_percentage;
                const expected_fee_amount =
                    input.net_price * (fee_percentage / 100); // 1% de 90 = 0.9
                const expected_cashback = expected_fee_amount * 0.2; //20% de 0.9 = 0.18

                // ASSERT - Verificação
                // Verifica se a resposta da API está correta
                expect(result.statusCode).toBe(201);
                expect(result.body.user_item_uuid).toBeFalsy();
                expect(result.body.favored_business_info_uuid).toEqual(
                    partner_info_uuid
                );
                expect(result.body.original_price).toBe(input.original_price);
                expect(result.body.discount_percentage).toBe(
                    input.discount_percentage
                );
                expect(result.body.net_price).toBe(input.net_price);
                expect(result.body.cashback).toBeCloseTo(expected_cashback); // Verifica se o cashback foi calculado
                expect(result.body.description).toBe(
                    'Transação do ponto de venda (POS)'
                );
            });
            it('Should return a 400 error when original_price is negative', async () => {
                // ARRANGE - Preparação
                // Input com o valor problemático
                const input = {
                    original_price: -100,
                    discount_percentage: 10,
                    net_price: -90,
                };

                // ACT - Ação
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);
                // ASSERT - Verificação
                // Espera-se um erro de "Bad Request"
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toContain(
                    'Original price must be a positive number'
                );
            });
            it('Should return a 400 error when discount_percentage is negative', async () => {
                // ARRANGE
                const input = {
                    original_price: 100,
                    discount_percentage: -10, // <-- O valor inválido
                    net_price: 110,
                };

                // ACT
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                // ASSERT
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toContain(
                    'Discount percentage cannot be negative'
                );
            });
            it('Should return a 400 error when net_price is inconsistent', async () => {
                // ARRANGE
                // O net_price deveria ser 90, mas estamos enviando 80 para forçar o erro.
                const input = {
                    original_price: 100,
                    discount_percentage: 10,
                    net_price: 80, // <-- O valor inconsistente
                };

                // ACT
                const result = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_admin_token}`)
                    .send(input);

                // ASSERT
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toContain(
                    'Net price is not consistent with original price and discount percentage'
                );
            });
        });
    });

    describe('E2E Business Account', () => {
        describe('Get Business Account by business admin', () => {
            it('Should get business account', async () => {
                const result = await request(app)
                    .get('/business/admin/account')
                    .set('Authorization', `Bearer ${partner_admin_token}`);
                expect(result.statusCode).toBe(200);
            });
        });
    });

    describe('E2E Partner-to-Partner Transactions', () => {
        // Variáveis de estado para este conjunto de testes
        let partnerPayerInfoUuid: string;
        let partnerPayerAdminToken: string;

        let partnerSellerInfoUuid: string;
        let partnerSellerAdminToken: string;

        let employeeUserInfoUuid: string;
        let employeeUserToken: string;
        let prepaidBenefitUserItemUuid: string;
        let postpaidBenefitUserItemUuid: string;

        // Inicia o setup antes de todos os testes deste bloco
        beforeAll(async () => {
            // --- 1. CRIAR PARCEIRO PAGADOR (Parceiro 1) ---
            const inputPayer = {
                fantasy_name: 'Pagador P2P Store',
                document: '11111111111111',
                line1: 'Rua do Pagador',
                line2: '123',
                neighborhood: 'Bairro Central',
                postal_code: '79001001',
                city: 'Campo Grande',
                state: 'MS',
                country: 'Brasil',
                classification: 'Varejo',
                colaborators_number: 5,
                email: 'pagador.p2p@correct.com.br',
                phone_1: '67911111111',
                business_type: 'comercio',
                branches_uuid: [branch3_uuid],
                partnerConfig: {
                    main_branch: branch3_uuid,
                    partner_category: ['comercio'],
                    use_marketing: false,
                    use_market_place: false,
                },
            };
            const createPayerRes = await request(app)
                .post('/business/register')
                .send(inputPayer);
            expect(createPayerRes.statusCode).toBe(201);
            partnerPayerInfoUuid = createPayerRes.body.BusinessInfo.uuid;

            const activatePayerRes = await request(app)
                .put('/business/info/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .query({ business_info_uuid: partnerPayerInfoUuid })
                .send({ status: 'active' });
            expect(activatePayerRes.statusCode).toBe(200);

            const createPayerAdminRes = await request(app)
                .post('/business/admin/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send({
                    password: 'password123',
                    business_info_uuid: partnerPayerInfoUuid,
                    email: 'pagador.p2p@correct.com.br',
                    name: 'Admin Pagador P2P',
                });
            expect(createPayerAdminRes.statusCode).toBe(201);

            const authPayerRes = await request(app)
                .post('/business/admin/login')
                .send({
                    business_document: '11111111111111',
                    password: 'password123',
                    email: 'pagador.p2p@correct.com.br',
                });
            expect(authPayerRes.statusCode).toBe(200);
            partnerPayerAdminToken = authPayerRes.body.token;

            // --- 2. CRIAR PARCEIRO VENDEDOR (Parceiro 2) ---
            const inputSeller = {
                fantasy_name: 'Vendedor P2P Market',
                document: '22222222222222',
                line1: 'Avenida do Vendedor',
                line2: '456',
                neighborhood: 'Bairro Comercial',
                postal_code: '79002002',
                city: 'Campo Grande',
                state: 'MS',
                country: 'Brasil',
                classification: 'Supermercado',
                colaborators_number: 10,
                email: 'vendedor.p2p@correct.com.br',
                phone_1: '67922222222',
                business_type: 'comercio',
                branches_uuid: [branch2_uuid],
                partnerConfig: {
                    main_branch: branch2_uuid,
                    partner_category: ['comercio'],
                    use_marketing: false,
                    use_market_place: false,
                },
            };
            const createSellerRes = await request(app)
                .post('/business/register')
                .send(inputSeller);
            expect(createSellerRes.statusCode).toBe(201);
            partnerSellerInfoUuid = createSellerRes.body.BusinessInfo.uuid;

            const activateSellerRes = await request(app)
                .put('/business/info/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .query({ business_info_uuid: partnerSellerInfoUuid })
                .send({ status: 'active' });
            expect(activateSellerRes.statusCode).toBe(200);

            const createSellerAdminRes = await request(app)
                .post('/business/admin/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send({
                    password: 'password123',
                    business_info_uuid: partnerSellerInfoUuid,
                    email: 'vendedor.p2p@correct.com.br',
                    name: 'Admin Vendedor P2P',
                });
            expect(createSellerAdminRes.statusCode).toBe(201);

            const authSellerRes = await request(app)
                .post('/business/admin/login')
                .send({
                    business_document: '22222222222222',
                    password: 'password123',
                    email: 'vendedor.p2p@correct.com.br',
                });
            expect(authSellerRes.statusCode).toBe(200);
            partnerSellerAdminToken = authSellerRes.body.token;

            // --- 3. ASSOCIAR BENEFÍCIOS AO EMPREGADOR ---
            // employer_info_uuid e correctAdminToken vêm do `beforeAll` geral do arquivo.
            const itemDetails1 = {
                item_uuid: benefit1_uuid,
                business_info_uuid: employer_info_uuid,
                cycle_end_day: 1,
                value: 20000,
            }; // Vale Alimentação (Pré)
            const itemDetails3 = {
                item_uuid: benefit3_uuid,
                business_info_uuid: employer_info_uuid,
                cycle_end_day: 1,
                value: 50000,
            }; // Convênio (Pós)

            const createDetails1Res = await request(app)
                .post('/business/item/details/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send(itemDetails1);
            expect(createDetails1Res.statusCode).toBe(201);
            const createDetails3Res = await request(app)
                .post('/business/item/details/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send(itemDetails3);
            expect(createDetails3Res.statusCode).toBe(201);

            // --- 4. CRIAR E FINANCIAR UM FUNCIONÁRIO PARA SIMULAR TRANSAÇÕES ---
            const employeeInput = {
                document: '28673442044',
                full_name: 'Funcionario Teste P2P',
                date_of_birth: '01/01/1990',
                gender: 'Outro',
                dependents_quantity: 0,
                company_owner: false,
            };
            const createEmployeeRes = await request(app)
                .post('/app-user/business-admin')
                .set('Authorization', `Bearer ${employer_user_token}`)
                .send(employeeInput);
            expect(createEmployeeRes.statusCode).toBe(201);
            employeeUserInfoUuid = createEmployeeRes.body.uuid;

            const createUserAuthRes = await request(app)
                .post('/app-user')
                .send({
                    document: '28673442044',
                    email: 'p2p_employee@test.com',
                    password: '123',
                });
            expect(createUserAuthRes.statusCode).toBe(201);

            const authEmployeeRes = await request(app)
                .post('/login-app-user')
                .send({ document: '28673442044', password: '123' });
            expect(authEmployeeRes.statusCode).toBe(200);
            employeeUserToken = authEmployeeRes.body.token;

            const activatePrepaidRes = await request(app)
                .patch('/user-item/activate')
                .set('Authorization', `Bearer ${employer_user_token}`)
                .send({
                    user_info_uuid: employeeUserInfoUuid,
                    item_uuid: benefit1_uuid,
                });
            expect(activatePrepaidRes.statusCode).toBe(200);
            const activatePostpaidRes = await request(app)
                .patch('/user-item/activate')
                .set('Authorization', `Bearer ${employer_user_token}`)
                .send({
                    user_info_uuid: employeeUserInfoUuid,
                    item_uuid: benefit3_uuid,
                });
            expect(activatePostpaidRes.statusCode).toBe(200);

            const allItemsRes = await request(app)
                .get('/user-item/all')
                .set('Authorization', `Bearer ${employeeUserToken}`);
            expect(allItemsRes.statusCode).toBe(200);
            prepaidBenefitUserItemUuid = allItemsRes.body.find(
                (item: any) => item.item_name === 'Vale Alimentação'
            ).uuid;
            postpaidBenefitUserItemUuid = allItemsRes.body.find(
                (item: any) => item.item_name === 'Convênio'
            ).uuid;

            // --- 5. DAR FUNDOS AO PARCEIRO PAGADOR (através de simulação de vendas) ---
            // a) Venda PRÉ-PAGA de R$ 100 para dar saldo LÍQUIDO ao Parceiro Pagador
            const txPrePaidRes = await request(app)
                .post('/pos-transaction')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`)
                .send({
                    original_price: 100,
                    discount_percentage: 0,
                    net_price: 100,
                });
            expect(txPrePaidRes.statusCode).toBe(201);

            // Set Transaction pin for current employee
            const newPinInput = {
                newPin: '1234',
                password: '123', //passowrd for current app user, beware of any changes
            };
            const newPinRes = await request(app)
                .post('/app-user/transaction-pin')
                .set('Authorization', `Bearer ${employeeUserToken}`)
                .send(newPinInput);

            // ASSERT - Resposta da API
            expect(newPinRes.statusCode).toBe(200);

            const processPrePaidRes = await request(app)
                .post('/pos-transaction/processing')
                .set('Authorization', `Bearer ${employeeUserToken}`)
                .send({
                    transactionId: txPrePaidRes.body.transaction_uuid,
                    benefit_uuid: prepaidBenefitUserItemUuid,
                    incoming_pin: '1234',
                });
            expect(processPrePaidRes.statusCode).toBe(200);

            //check payer account
            const payerAccountAfterPrepaidPayement =
                await prismaClient.businessAccount.findFirst({
                    where: { business_info_uuid: partnerPayerInfoUuid },
                });
            // b) Venda PÓS-PAGA de R$ 70 para dar CRÉDITOS ao Parceiro Pagador
            const txPostPaidRes = await request(app)
                .post('/pos-transaction')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`)
                .send({
                    original_price: 70,
                    discount_percentage: 0,
                    net_price: 70,
                });
            expect(txPostPaidRes.statusCode).toBe(201);
            const processPostPaidRes = await request(app)
                .post('/pos-transaction/processing')
                .set('Authorization', `Bearer ${employeeUserToken}`)
                .send({
                    transactionId: txPostPaidRes.body.transaction_uuid,
                    benefit_uuid: postpaidBenefitUserItemUuid,
                    incoming_pin: '1234',
                });
            expect(processPostPaidRes.statusCode).toBe(200);
        });

        it('should process a payment using credits first, then liquid balance', async () => {
            // ARRANGE: Capturar o estado inicial do Pagador e do Vendedor
            const payerAccountBefore = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`);
            const payerCreditsBefore = await request(app)
                .get('/business/admin/credits')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`);
            const sellerAccountBefore = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${partnerSellerAdminToken}`);

            const initialPayerLiquidInCents = Math.round(
                payerAccountBefore.body.balance * 100
            );
            // const initialPayerCreditInCents = payerCreditsBefore.body.reduce((sum: number, credit: any) => sum + credit.balance, 0);
            const initialSellerLiquidInCents = Math.round(
                sellerAccountBefore.body.balance * 100
            );

            type CreditDTO = {
                uuid: string;
                balance: number; // Em Reais, como vem da API
                status: string;
                availability_date: string; // JSON converte o tipo Date para string
                original_transaction_uuid: string;
                created_at: string;
            };
            const initialPayerCreditInCents = payerCreditsBefore.body.reduce(
                (sum: number, credit: CreditDTO) =>
                    sum + Math.round(credit.balance * 100),
                0
            );
            // Pagador tem ~R$ 100 líquidos e ~R$ 70 em créditos. Vamos fazer uma compra de R$ 90.
            // O sistema deve usar os ~R$ 70 de crédito e ~R$ 20 do saldo líquido.
            const paymentAmount = 90.0;
            const transactionInput = {
                original_price: paymentAmount,
                discount_percentage: 0,
                net_price: paymentAmount,
            };
            const createTx = await request(app)
                .post('/pos-transaction')
                .set('Authorization', `Bearer ${partnerSellerAdminToken}`)
                .send(transactionInput);
            const transactionId = createTx.body.transaction_uuid;

            // ACT: O Parceiro Pagador executa o pagamento
            const result = await request(app)
                .post('/pos-transaction/business/processing')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`)
                .send({ transactionId: transactionId });
            // ASSERT 1: A resposta da API deve resumir o split corretamente
            expect(result.statusCode).toBe(200);
            expect(result.body.success).toBeTruthy();
            expect(result.body.netAmountPaid).toBe(paymentAmount);
            expect(result.body.amountPaidFromCredits).toBeCloseTo(
                initialPayerCreditInCents / 100
            );
            expect(result.body.amountPaidFromLiquidBalance).toBeCloseTo(
                paymentAmount - initialPayerCreditInCents / 100
            );

            // ASSERT 2: Verificar o estado final das contas
            const payerAccountAfter = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`);
            const payerCreditsAfter = await request(app)
                .get('/business/admin/credits')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`);
            const sellerAccountAfter = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${partnerSellerAdminToken}`);
            const sellerCreditsAfter = await request(app)
                .get('/business/admin/credits')
                .set('Authorization', `Bearer ${partnerSellerAdminToken}`);

            const finalPayerCreditInCents = payerCreditsAfter.body.reduce(
                (sum: number, credit: any) => sum + credit.balance,
                0
            );
            expect(finalPayerCreditInCents).toBe(0);

            const expectedPayerLiquidAfterInCents =
                initialPayerLiquidInCents -
                Math.round(result.body.amountPaidFromLiquidBalance * 100);
            expect(Math.round(payerAccountAfter.body.balance * 100)).toBe(
                expectedPayerLiquidAfterInCents
            );

            const expectedSellerLiquidAfterInCents =
                initialSellerLiquidInCents +
                Math.round(result.body.amountPaidFromLiquidBalance * 100);
            expect(Math.round(sellerAccountAfter.body.balance * 100)).toBe(
                expectedSellerLiquidAfterInCents
            );

            const newCreditForSeller = sellerCreditsAfter.body.find(
                (c: any) => c.original_transaction_uuid === transactionId
            );
            expect(newCreditForSeller).toBeDefined();
            expect(newCreditForSeller.balance).toBeCloseTo(
                result.body.amountPaidFromCredits
            );

            // ASSERT 3: Validar o registro da transação no banco (A Garantia Final)
            const transactionInDb = await prismaClient.transactions.findUnique({
                where: { uuid: transactionId },
            });

            expect(transactionInDb).toBeDefined();
            expect(transactionInDb?.status).toBe('success');

            // Verificamos se o UUID do parceiro pagador foi corretamente salvo na transação.
            expect(transactionInDb?.payer_business_info_uuid).toBe(
                partnerPayerInfoUuid
            );
        });

        it('should return a 402 error if total funds are insufficient', async () => {
            // --- ARRANGE (Preparação) ---

            // 1. Capturar o saldo total atual do Parceiro Pagador
            const payerAccountBefore = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`);
            const payerCreditsBefore = await request(app)
                .get('/business/admin/credits')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`);
            expect(payerAccountBefore.statusCode).toBe(200);
            expect(payerCreditsBefore.statusCode).toBe(200);

            const initialPayerLiquidInCents = Math.round(
                payerAccountBefore.body.balance * 100
            );
            const initialPayerCreditInCents = payerCreditsBefore.body.reduce(
                (sum: number, credit: { balance: number }) =>
                    sum + Math.round(credit.balance * 100),
                0
            );
            const totalAvailableInCents =
                initialPayerLiquidInCents + initialPayerCreditInCents;

            // 2. O Vendedor cria uma transação com um valor MAIOR que o saldo total do pagador
            const insufficientAmount = totalAvailableInCents / 100 + 1; // Ex: R$ 1 a mais do que o saldo
            const transactionInput = {
                original_price: insufficientAmount,
                discount_percentage: 0,
                net_price: insufficientAmount,
            };
            const createTx = await request(app)
                .post('/pos-transaction')
                .set('Authorization', `Bearer ${partnerSellerAdminToken}`)
                .send(transactionInput);
            expect(createTx.statusCode).toBe(201);
            const transactionId = createTx.body.transaction_uuid;

            // --- ACT (Ação) ---
            // O Parceiro Pagador tenta executar o pagamento que ele não pode pagar
            const result = await request(app)
                .post('/pos-transaction/business/processing')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`)
                .send({ transactionId: transactionId });

            // --- ASSERT (Verificação) ---
            // 1. A API deve retornar o erro correto
            expect(result.statusCode).toBe(402); // 402 Payment Required
            expect(result.body.error).toBe(
                'Saldo total (líquido + créditos) insuficiente para esta compra.'
            );

            // 2. Verificação Bônus: Garantir que os saldos do pagador NÃO mudaram
            const payerAccountAfter = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${partnerPayerAdminToken}`);
            const finalPayerLiquidInCents = Math.round(
                payerAccountAfter.body.balance * 100
            );
            expect(finalPayerLiquidInCents).toBe(initialPayerLiquidInCents);
        });
        // No seu arquivo business-routes.e2e-spec.ts, substitua este teste:

        it('should process a payment using ONLY credits when they are sufficient', async () => {
            // --- ARRANGE (Preparação) ---
            const newPayerToken = partnerSellerAdminToken;
            const newSellerToken = partnerPayerAdminToken;

            const payerCreditsBefore = await request(app)
                .get('/business/admin/credits')
                .set('Authorization', `Bearer ${newPayerToken}`);
            expect(payerCreditsBefore.statusCode).toBe(200);

            // <<< A CORREÇÃO ESTÁ AQUI >>>
            // Primeiro, convertemos cada saldo de crédito para centavos (balance * 100) e depois somamos.
            const initialPayerCreditInCents = payerCreditsBefore.body.reduce(
                (sum: number, credit: { balance: number }) =>
                    sum + Math.round(credit.balance * 100),
                0
            );
            // Agora, initialPayerCreditInCents será 6902

            // Verificamos se há créditos suficientes para a compra de R$ 50,00
            expect(initialPayerCreditInCents).toBeGreaterThan(5000);

            const paymentAmount = 50.0;
            const transactionInput = {
                original_price: paymentAmount,
                discount_percentage: 0,
                net_price: paymentAmount,
            };
            const createTx = await request(app)
                .post('/pos-transaction')
                .set('Authorization', `Bearer ${newSellerToken}`)
                .send(transactionInput);
            const transactionId = createTx.body.transaction_uuid;

            const payerAccountBefore = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${newPayerToken}`);
            const initialPayerLiquidInCents = Math.round(
                payerAccountBefore.body.balance * 100
            );

            // --- ACT (Ação) ---
            const result = await request(app)
                .post('/pos-transaction/business/processing')
                .set('Authorization', `Bearer ${newPayerToken}`)
                .send({ transactionId: transactionId });

            // --- ASSERT (Verificação) ---
            expect(result.statusCode).toBe(200);
            expect(result.body.amountPaidFromCredits).toBe(paymentAmount);
            expect(result.body.amountPaidFromLiquidBalance).toBe(0);

            const payerAccountAfter = await request(app)
                .get('/business/admin/account')
                .set('Authorization', `Bearer ${newPayerToken}`);
            expect(Math.round(payerAccountAfter.body.balance * 100)).toBe(
                initialPayerLiquidInCents
            );
        });
    });
    describe('E2E Get Business Account History', () => {
        let historyPartnerAdminToken: string;
        let historyPartnerInfoUuid: string;

        beforeAll(async () => {
            // --- ARRANGE GERAL ---
            // 1. Criar um parceiro dedicado para estes testes de histórico
            const partnerInput = {
                fantasy_name: 'History Test Store',
                document: '33333333333333', // Documento único
                line1: 'Rua do Histórico',
                line2: '789',
                neighborhood: 'Bairro dos Testes',
                postal_code: '79003003',
                city: 'Campo Grande',
                state: 'MS',
                country: 'Brasil',
                classification: 'Serviços',
                colaborators_number: 2,
                email: 'history.test@correct.com.br',
                phone_1: '67933333333',
                business_type: 'comercio',
                branches_uuid: [branch3_uuid], // Usando o ramo "Mercearias" com taxa de 1.4%
                partnerConfig: {
                    main_branch: branch3_uuid,
                    partner_category: ['comercio'],
                    use_marketing: false,
                    use_market_place: false,
                },
            };
            const createPartnerRes = await request(app)
                .post('/business/register')
                .send(partnerInput);
            expect(createPartnerRes.statusCode).toBe(201);
            historyPartnerInfoUuid = createPartnerRes.body.BusinessInfo.uuid;

            // 2. Ativar o parceiro
            const activatePartnerRes = await request(app)
                .put('/business/info/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .query({ business_info_uuid: historyPartnerInfoUuid })
                .send({ status: 'active' });
            expect(activatePartnerRes.statusCode).toBe(200);

            // 3. Criar e autenticar o admin do parceiro de histórico
            const createPartnerAdminRes = await request(app)
                .post('/business/admin/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send({
                    password: 'password123',
                    business_info_uuid: historyPartnerInfoUuid,
                    email: 'history.test@correct.com.br',
                    name: 'Admin History',
                });
            expect(createPartnerAdminRes.statusCode).toBe(201);

            const authPartnerRes = await request(app)
                .post('/business/admin/login')
                .send({
                    business_document: '33333333333333',
                    password: 'password123',
                    email: 'history.test@correct.com.br',
                });
            expect(authPartnerRes.statusCode).toBe(200);
            historyPartnerAdminToken = authPartnerRes.body.token;

            // 4. Criar um funcionário para realizar os pagamentos
            const employeeInput = {
                document: '426.624.360-00', // Documento único
                full_name: 'Funcionario Gerador de Historico',
                date_of_birth: '01/01/1995',
                gender: 'Outro',
                dependents_quantity: 0,
                company_owner: false,
            };
            const createEmployeeRes = await request(app)
                .post('/app-user/business-admin')
                .set('Authorization', `Bearer ${employer_user_token}`)
                .send(employeeInput);
            expect(createEmployeeRes.statusCode).toBe(201);

            const employeeInfoDetails = await request(app)
                .get('/app-user/business-admin')
                .set('Authorization', `Bearer ${employer_user_token}`)
                .query({
                    employeeDocument: employeeInput.document,
                    businessInfoUuid: employer_info_uuid,
                });
            const employeeInfoUuid = employeeInfoDetails.body.uuid;

            const createUserAuthRes = await request(app)
                .post('/app-user')
                .send({
                    document: '426.624.360-00',
                    email: 'history_employee@test.com',
                    password: '123',
                });
            expect(createUserAuthRes.statusCode).toBe(201);

            const authEmployeeRes = await request(app)
                .post('/login-app-user')
                .send({ document: '426.624.360-00', password: '123' });
            expect(authEmployeeRes.statusCode).toBe(200);
            const historyEmployeeUserToken = authEmployeeRes.body.token;

            // 5. Ativar um benefício pré-pago para o funcionário
            const activatePrepaidRes = await request(app)
                .patch('/user-item/activate')
                .set('Authorization', `Bearer ${employer_user_token}`)
                .send({
                    user_info_uuid: employeeInfoUuid,
                    item_uuid: benefit1_uuid,
                }); // Vale Alimentação
            expect(activatePrepaidRes.statusCode).toBe(200);

            const allItemsRes = await request(app)
                .get('/user-item/all')
                .set('Authorization', `Bearer ${historyEmployeeUserToken}`);
            expect(allItemsRes.statusCode).toBe(200);
            const historyPrepaidBenefitUserItemUuid = allItemsRes.body.find(
                (item: any) => item.item_name === 'Vale Alimentação'
            ).uuid;

            // 6. Gerar duas transações para popular o histórico
            // Transação 1 (mais antiga)
            //Set PIN for transaction
            // Set Transaction pin for current employee
            const newPinInput = {
                newPin: '1234',
                password: '123', //passowrd for current app user, beware of any changes
            };
            const newPinRes = await request(app)
                .post('/app-user/transaction-pin')
                .set('Authorization', `Bearer ${historyEmployeeUserToken}`)
                .send(newPinInput);

            // ASSERT - Resposta da API
            expect(newPinRes.statusCode).toBe(200);

            const tx1Res = await request(app)
                .post('/pos-transaction')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`)
                .send({
                    original_price: 150,
                    discount_percentage: 0,
                    net_price: 150,
                });
            const processTx1 = await request(app)
                .post('/pos-transaction/processing')
                .set('Authorization', `Bearer ${historyEmployeeUserToken}`)
                .send({
                    transactionId: tx1Res.body.transaction_uuid,
                    benefit_uuid: historyPrepaidBenefitUserItemUuid,
                    incoming_pin: '1234',
                });
            expect(processTx1.statusCode).toBe(200);
            await new Promise((resolve) => setTimeout(resolve, 50)); // Pequeno delay para garantir timestamps diferentes

            // Transação 2 (mais recente)
            const tx2Res = await request(app)
                .post('/pos-transaction')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`)
                .send({
                    original_price: 80,
                    discount_percentage: 0,
                    net_price: 80,
                });
            const processTx2 = await request(app)
                .post('/pos-transaction/processing')
                .set('Authorization', `Bearer ${historyEmployeeUserToken}`)
                .send({
                    transactionId: tx2Res.body.transaction_uuid,
                    benefit_uuid: historyPrepaidBenefitUserItemUuid,
                    incoming_pin: '1234',
                });
            expect(processTx2.statusCode).toBe(200);
        });

        it('should throw a 400 error for an invalid month (e.g., 0 or 13)', async () => {
            const now = new Date();
            const resInvalid = await request(app)
                .get('/business/account/history')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`)
                .query({ year: now.getFullYear(), month: 13 });

            expect(resInvalid.statusCode).toBe(400);
            expect(resInvalid.body.error).toBe(
                'Mês inválido. Por favor, forneça um valor entre 1 e 12.'
            );

            const resZero = await request(app)
                .get('/business/account/history')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`)
                .query({ year: now.getFullYear(), month: 0 });

            expect(resZero.statusCode).toBe(400);
            expect(resZero.body.error).toBe(
                'Mês inválido. Por favor, forneça um valor entre 1 e 12.'
            );
        });
        it("should throw a 400 error for an invalid year (e.g., 'abc')", async () => {
            const now = new Date();
            const result = await request(app)
                .get('/business/account/history')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`)
                .query({ year: 'abc', month: now.getMonth() + 1 });

            expect(result.statusCode).toBe(400);
            expect(result.body.error).toBe('Ano inválido.');
        });
        it('should return an empty array for a month with no transactions', async () => {
            const now = new Date();
            // Consulta um mês no futuro, onde garantidamente não haverá transações
            const nextMonth = now.getMonth() + 2;
            const year =
                nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();

            const result = await request(app)
                .get('/business/account/history')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`)
                .query({ year: year, month: nextMonth > 12 ? 1 : nextMonth });

            expect(result.statusCode).toBe(200);
            expect(result.body).toEqual([]);
        });

        it('should return the account history for the current month by default and in descending order', async () => {
            const result = await request(app)
                .get('/business/account/history')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`);

            expect(result.statusCode).toBe(200);
            expect(Array.isArray(result.body)).toBe(true);
            expect(result.body.length).toBe(2);

            // --- Validação da ordem e dos valores ---
            // A taxa do branch3 (Mercearias) é 1.4% (admin_tax).
            const firstEntry = result.body[0]; // A mais recente
            const secondEntry = result.body[1]; // A mais antiga

            // Transação 2 (mais recente): 80.00 - 1.4% = 78.88
            const expectedAmountTx2 = 78.88;
            // Transação 1 (mais antiga): 150.00 - 1.4% = 147.90
            const expectedAmountTx1 = 147.9;

            // A primeira entrada deve ser a de R$80
            expect(firstEntry.event_type).toBe('PAYMENT_RECEIVED');
            expect(firstEntry.amount).toBeCloseTo(expectedAmountTx2);
            expect(firstEntry.balance_before).toBeCloseTo(expectedAmountTx1);
            expect(firstEntry.balance_after).toBeCloseTo(
                expectedAmountTx1 + expectedAmountTx2
            );

            // A segunda entrada deve ser a de R$150
            expect(secondEntry.event_type).toBe('PAYMENT_RECEIVED');
            expect(secondEntry.amount).toBeCloseTo(expectedAmountTx1);
            expect(secondEntry.balance_before).toBe(0);
            expect(secondEntry.balance_after).toBeCloseTo(expectedAmountTx1);

            // Confirma que a data da primeira é mais recente que a da segunda
            expect(
                new Date(firstEntry.created_at) >
                    new Date(secondEntry.created_at)
            ).toBe(true);
        });

        it('should return the correct history when a specific month and year are provided', async () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1; // getMonth é 0-indexed, a API espera 1-indexed

            const result = await request(app)
                .get('/business/account/history')
                .set('Authorization', `Bearer ${historyPartnerAdminToken}`)
                .query({ year: year, month: month });

            expect(result.statusCode).toBe(200);
            expect(result.body.length).toBe(2);

            const transaction = result.body[0]; // A mais recente
            expect(transaction.event_type).toBe('PAYMENT_RECEIVED');
            expect(transaction.amount).toBeCloseTo(78.88);
        });
    });
});
