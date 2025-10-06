import request from 'supertest';
import { app } from '../../app';
import { InputCreateAppUserDTO } from '../../modules/AppUser/app-user-dto/app-user.dto';
import { InputCreateBenefitDto } from '../../modules/benefits/usecases/create-benefit/create-benefit.dto';
import { Uuid } from '../../@shared/ValueObjects/uuid.vo';

let userToken1: string;
let userToken2: string;
let userToken3: string;

let employee_auth_token: string;
let employee_user_info: string;

let correctAdminToken: string;

let partner_info_uuid: string;
let partner_info_uuid2: string;
let partner_info_uuid3: string;

let partner_admin_uuid: string;
let partner_admin2_uuid: string;
let partner_admin3_uuid: string;

let partner_admin_token: string;
let partner_admin2_token: string;
let partner_admin3_token: string;

const documentUser1 = '875.488.760-76';
const inputNewAppUser1: InputCreateAppUserDTO = {
    user_info_uuid: null,
    document: documentUser1,
    email: 'email@email.com',
    password: 'senha123',
    is_active: true,
};
const inputNewAppUser2: InputCreateAppUserDTO = {
    user_info_uuid: null,
    document: '283.330.980-53',
    email: 'email2@email.com',
    password: 'senha123',
    is_active: true,
};

const inputNewAppUser3: InputCreateAppUserDTO = {
    user_info_uuid: null,
    document: '915.583.910-02',
    email: 'email3@email.com',
    password: 'senha123',
    is_active: true,
};

const authenticateAppUser1 = {
    document: inputNewAppUser1.document,
    password: inputNewAppUser1.password,
};

const authenticateAppUser2 = {
    document: inputNewAppUser2.document,
    password: inputNewAppUser2.password,
};

const authenticateAppUser3 = {
    document: inputNewAppUser3.document,
    password: inputNewAppUser3.password,
};

let partner_user_uuid2: string;
let partner_auth_token2: string;
let partner_user_uuid3: string;
let partner_auth_token3: string;

let benefit0_uuid: Uuid;
let benefit1_uuid: Uuid;
let benefit2_uuid: Uuid;
let benefit3_uuid: Uuid;
let benefit4_uuid: Uuid;

let branch1_uuid: string;
let branch2_uuid: string;
let branch3_uuid: string;
let branch4_uuid: string;
let branch5_uuid: string;

let inputTransaction1: {
    original_price: number;
    discount_percentage: number;
    net_price: number;
};
let transaction1_uuid: string;
let transaction1_net_price_in_cents: number;
let expected_fee_in_cents: number;
let expected_cashback_in_cents: number;
let expected_partner_net_amount_in_cents: number;

let partner3_initial_liquid_balance_in_cents: number;
let correct_admin_initial_balance_in_cents: number;
let employee2_alimentacao_initial_balance_in_cents: number;
let employee2_cashback_initial_balance_in_cents: number;

describe('E2E Transactions', () => {
    beforeAll(async () => {
        //********create correct admin********
        const inputNewAdmin = {
            name: 'Admin Correct',
            email: 'admincorrect@correct.com.br',
            userName: 'admin-correct',
            password: '123',
        };

        await request(app).post('/admin').send(inputNewAdmin);

        //********authenticate correct admin********
        const authenticateAdmin = {
            userName: inputNewAdmin.userName,
            password: inputNewAdmin.password,
        };
        const loginCorrectAdmin = await request(app)
            .post('/login')
            .send(authenticateAdmin);
        expect(loginCorrectAdmin.statusCode).toBe(200);
        correctAdminToken = loginCorrectAdmin.body.token;

        //********create items********
        const benefit0 = {
            name: 'Correct',
            description: 'Descrição do vale',
            parent_uuid: null as any,
            item_type: 'gratuito',
            item_category: 'pre_pago',
        };

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

        const benefit0Response = await request(app)
            .post('/benefit')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(benefit0);
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

        //********create branches********
        benefit0_uuid = benefit0Response.body.uuid;
        benefit1_uuid = benefit1Response.body.uuid;
        benefit2_uuid = benefit2Response.body.uuid;
        benefit3_uuid = benefit3Response.body.uuid;
        benefit4_uuid = benefit4Response.body.uuid;

        const branchesByName = [
            {
                name: 'Hipermercados',
                marketing_tax: 1.0,
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
                marketing_tax: 1.0,
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
                market_place_tax: 220,
                benefits_name: ['Vale Refeição', 'Vale Alimentação', 'Correct'],
            },
        ];

        const branches = await request(app)
            .post(`/branch`)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(branchesByName);
        branch1_uuid = branches.body[0].uuid;
        branch2_uuid = branches.body[1].uuid;
        branch3_uuid = branches.body[2].uuid;
        branch4_uuid = branches.body[3].uuid;
        branch5_uuid = branches.body[4].uuid;

        //********create partner 1********
        const inputPartner1 = {
            line1: 'Rua',
            line2: '72B',
            line3: '',
            neighborhood: 'Bairro Teste',
            postal_code: '5484248423',
            city: 'Campo Grande',
            state: 'Estado teste',
            country: 'País teste',
            fantasy_name: 'Mercado Empresa teste 1',
            document: 'comercio',
            classification: 'Classificação',
            colaborators_number: 5,
            email: 'comercio@comercio.com',
            phone_1: '215745158',
            phone_2: '124588965',
            business_type: 'comercio',
            branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
            partnerConfig: {
                main_branch: branch4_uuid,
                partner_category: ['saude'],
                use_marketing: false,
                use_market_place: false,
            },
        };

        const partner1 = await request(app)
            .post('/business/register')
            .send(inputPartner1);
        expect(partner1.statusCode).toBe(201);
        partner_info_uuid = partner1.body.BusinessInfo.uuid;

        //********partner 2********
        const inputPartner2 = {
            line1: 'Rua',
            line2: '72B',
            line3: '',
            neighborhood: 'Bairro Teste',
            postal_code: '5484248423',
            city: 'Campo Grande',
            state: 'Estado teste',
            country: 'País teste',
            fantasy_name: 'Mercado Empresa teste 2',
            document: 'comercio2',
            classification: 'Classificação',
            colaborators_number: 5,
            email: 'comercio2@comercio.com',
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

        const partner2 = await request(app)
            .post('/business/register')
            .send(inputPartner2);
        expect(partner2.statusCode).toBe(201);
        partner_info_uuid2 = partner2.body.BusinessInfo.uuid;

        //********partner 3********
        const inputPartner3 = {
            line1: 'Rua',
            line2: '72B',
            line3: '',
            neighborhood: 'Bairro Teste',
            postal_code: '5484248423',
            city: 'Campo Grande',
            state: 'Estado teste',
            country: 'País teste',
            fantasy_name: 'Empresa teste 3',
            document: 'comercio3',
            classification: 'Classificação',
            colaborators_number: 5,
            email: 'comercio3@comercio.com',
            phone_1: '215745158',
            phone_2: '124588965',
            business_type: 'comercio',
            branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
            partnerConfig: {
                main_branch: branch3_uuid,
                partner_category: ['comercio'],
                use_marketing: true,
                use_market_place: true,
            },
        };

        const partner3 = await request(app)
            .post('/business/register')
            .send(inputPartner3);
        expect(partner3.statusCode).toBe(201);
        partner_info_uuid3 = partner3.body.BusinessInfo.uuid;

        //********activate partners********

        //Activate Partner 1
        const activatePartner1Input = {
            status: 'active',
        };
        const queryPartner1 = {
            business_info_uuid: partner_info_uuid,
        };
        const activatePartner1 = await request(app)
            .put('/business/info/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .query(queryPartner1)
            .send(activatePartner1Input);
        expect(activatePartner1.statusCode).toBe(200);

        //Activate Partner 2
        const activatePartner2Input = {
            status: 'active',
        };
        const queryPartner2 = {
            business_info_uuid: partner_info_uuid2,
        };
        const activatePartner2 = await request(app)
            .put('/business/info/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .query(queryPartner2)
            .send(activatePartner2Input);
        expect(activatePartner2.statusCode).toBe(200);

        //Activate Partner 3
        const activatePartner3Input = {
            status: 'active',
        };
        const query = {
            business_info_uuid: partner_info_uuid3,
        };
        const activatePartner3 = await request(app)
            .put('/business/info/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .query(query)
            .send(activatePartner3Input);
        expect(activatePartner3.statusCode).toBe(200);

        //******create partners admin******* */
        //Craete partner 1 admin
        const inputPartnerAdmin1 = {
            password: '123456',
            business_info_uuid: partner_info_uuid,
            email: inputPartner1.email,
            name: 'João Admin',
        };

        const partnerAdmin1Result = await request(app)
            .post('/business/admin/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(inputPartnerAdmin1);
        partner_admin_uuid = partnerAdmin1Result.body.uuid;
        expect(partnerAdmin1Result.statusCode).toBe(201);

        //Craete partner 2 admin
        const inputPartnerAdmin2 = {
            password: '123456',
            business_info_uuid: partner_info_uuid2,
            email: inputPartner2.email,
            name: 'João Admin',
        };

        const partnerAdminResult2 = await request(app)
            .post('/business/admin/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(inputPartnerAdmin2);
        partner_admin2_uuid = partnerAdminResult2.body.uuid;
        expect(partnerAdminResult2.statusCode).toBe(201);

        //Create partner 3 admin
        const inputPartnerAdmin3 = {
            password: '123456',
            business_info_uuid: partner_info_uuid3,
            email: inputPartner3.email,
            name: 'João Admin',
        };

        const partnerAdminResult3 = await request(app)
            .post('/business/admin/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(inputPartnerAdmin3);
        partner_admin3_uuid = partnerAdminResult3.body.uuid;
        expect(partnerAdminResult3.statusCode).toBe(201);

        //********create appusers********
        const appUser1 = await request(app)
            .post('/app-user')
            .send(inputNewAppUser1);

        expect(appUser1.statusCode).toBe(201);
        expect(appUser1.body.is_active).toEqual(inputNewAppUser1.is_active);

        const appUser2 = await request(app)
            .post('/app-user')
            .send(inputNewAppUser2);

        expect(appUser2.statusCode).toBe(201);
        expect(appUser2.body.is_active).toEqual(inputNewAppUser2.is_active);

        const appUser3 = await request(app)
            .post('/app-user')
            .send(inputNewAppUser3);

        expect(appUser3.statusCode).toBe(201);
        expect(appUser3.body.is_active).toEqual(inputNewAppUser3.is_active);

        //*********AUTHENTICATE APPUSERS******** */
        const loginAppUser1 = await request(app)
            .post('/login-app-user')
            .send(authenticateAppUser1);

        userToken1 = loginAppUser1.body.token;
        expect(loginAppUser1.statusCode).toBe(200);

        const loginAppUser2 = await request(app)
            .post('/login-app-user')
            .send(authenticateAppUser2);

        userToken2 = loginAppUser2.body.token;
        expect(loginAppUser2.statusCode).toBe(200);

        const loginAppUser3 = await request(app)
            .post('/login-app-user')
            .send(authenticateAppUser3);

        userToken3 = loginAppUser3.body.token;
        expect(loginAppUser3.statusCode).toBe(200);
    });
    describe('E2E Pix Transactions', () => {
        describe('Create PIX charges AppUser', () => {
            it('Should throw an error if charge amount is missing', async () => {
                const input = {};
                const result = await request(app)
                    .post('/transaction/pix/charge/app-user/mocked')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${userToken1}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.message).toBe(
                    'User ID e um valor positivo são necessários.'
                );
            });
            it('Should throw an error if amount is negative', async () => {
                const input = {
                    amountInReais: -10,
                };
                const result = await request(app)
                    .post('/transaction/pix/charge/app-user/mocked')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${userToken1}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.message).toBe(
                    'User ID e um valor positivo são necessários.'
                );
            });
            it('Should craete a pix charge', async () => {
                const input = {
                    amountInReais: 10,
                };
                const result = await request(app)
                    .post('/transaction/pix/charge/app-user/mocked')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${userToken1}`,
                    });
                console.log(result.body);
            });
        });
    });
});
