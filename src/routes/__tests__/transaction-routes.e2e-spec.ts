import request from 'supertest';
import { app } from '../../app';
import { InputCreateAppUserDTO } from '../../modules/AppUser/app-user-dto/app-user.dto';
import { InputCreateBenefitDto } from '../../modules/benefits/usecases/create-benefit/create-benefit.dto';
import { Uuid } from '../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../infra/databases/prisma.config';
import path from 'path';
import { OfflineTokenHistoryEventType, OfflineTokenStatus, TransactionStatus, TransactionType, UserItemEventType } from '@prisma/client';
import { newDateF } from '../../utils/date';
import { InputProcessPOSTransactionWithOfflineTokenDTO } from '../../modules/Payments/Transactions/useCases/process-pos-payment-by-offline-token/dto/process-pos-payment-by-offline-token.dto';

let userAuthToken1: string;
let userAuthToken2: string;
let userAuthToken3: string;

let employer_info_uuid: string;
let employer_admin_uuid: string;
let employer_admin_token: string;

let document_employee1: string;
let auth_token_employee1: string;
let user_info_uuid_employee1: string;

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

//user offline tokens
let activeOfflineToken: string;
let revokedToken: string;

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

        //login partner 1 admin
        const loginPartnerAdmin1 = await request(app)
            .post('/business/admin/login')
            .send({
                business_document: inputPartner1.document,
                password: inputPartnerAdmin1.password,
                email: inputPartnerAdmin1.email,
            });
        expect(loginPartnerAdmin1.statusCode).toBe(200);
        partner_admin_token = loginPartnerAdmin1.body.token;

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

        userAuthToken1 = loginAppUser1.body.token;
        expect(loginAppUser1.statusCode).toBe(200);

        const loginAppUser2 = await request(app)
            .post('/login-app-user')
            .send(authenticateAppUser2);

        userAuthToken2 = loginAppUser2.body.token;
        expect(loginAppUser2.statusCode).toBe(200);

        const loginAppUser3 = await request(app)
            .post('/login-app-user')
            .send(authenticateAppUser3);

        userAuthToken3 = loginAppUser3.body.token;
        expect(loginAppUser3.statusCode).toBe(200);

        //*****Craete User Info***** */
        //***create user info 1***** */
        const inputUserInfo1: any = {
            document: authenticateAppUser1.document,
            document2: '24875492',
            document3: '56121561258',
            full_name: 'User Full Name',
            display_name: null,
            gender: 'Masculino',
            date_of_birth: '15/08/1998',
            phone: '679654874520',
            email: null,
            status: null,
            marital_status: 'casado',
            dependents_quantity: 1,
        };

        const resultUserInfo1 = await request(app)
            .post('/app-user/info')
            .set('Authorization', `Bearer ${userAuthToken1}`)
            .send(inputUserInfo1);
        expect(resultUserInfo1.statusCode).toBe(201);

        //***create user info 12***** */
        const inputUserInfo2: any = {
            document: authenticateAppUser2.document,
            document2: '248754vd92',
            document3: '561215dfwwv61258',
            full_name: 'User Full Name',
            display_name: null,
            gender: 'Masculino',
            date_of_birth: '15/08/1998',
            phone: '6796548444520',
            email: null,
            status: null,
            marital_status: 'casado',
            dependents_quantity: 1,
        };

        const resultUserInfo2 = await request(app)
            .post('/app-user/info')
            .set('Authorization', `Bearer ${userAuthToken2}`)
            .send(inputUserInfo2);
        expect(resultUserInfo2.statusCode).toBe(201);

        //***create user info 3***** */
        const inputUserInfo3: any = {
            document: authenticateAppUser3.document,
            document2: '248asdsdv75492',
            document3: '5612156fev1258',
            full_name: 'User Full Name',
            display_name: null,
            gender: 'Masculino',
            date_of_birth: '15/08/1998',
            phone: '679654874820',
            email: null,
            status: null,
            marital_status: 'casado',
            dependents_quantity: 1,
        };

        const resultUserInfo3 = await request(app)
            .post('/app-user/info')
            .set('Authorization', `Bearer ${userAuthToken3}`)
            .send(inputUserInfo3);
        expect(resultUserInfo3.statusCode).toBe(201);

        //CREATE BUSINESS EMPLOYER
        const inputCreateEmployer = {
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
            items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid],
        };

        const employerCreatedRes = await request(app)
            .post('/business/register')
            .send(inputCreateEmployer);
        expect(employerCreatedRes.statusCode).toBe(201);

        employer_info_uuid = employerCreatedRes.body.BusinessInfo.uuid;

        //ACTIVATE EMPLOYER
        const inputToActivateEmployer = {
            status: 'active',
        };
        const queryToActivateEmployer = {
            business_info_uuid: employer_info_uuid,
        };
        const employerActivate = await request(app)
            .put('/business/info/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .query(queryToActivateEmployer)
            .send(inputToActivateEmployer);
        expect(employerActivate.statusCode).toBe(200);

        //CREATE EMPLOYER ADMIN
        const inputCreateEmployerAdmin = {
            password: '123456',
            business_info_uuid: employer_info_uuid,
            email: 'empregador@empregador.com',
            name: 'Nome do admin employer',
        };
        const adminEmployerCreated = await request(app)
            .post('/business/admin/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(inputCreateEmployerAdmin);
        expect(adminEmployerCreated.statusCode).toBe(201);
        employer_admin_uuid = adminEmployerCreated.body.uuid;

        //Login Employer admin
        const inputLoginEmployerAdmin = {
            business_document: inputCreateEmployer.document,
            password: '123456',
            email: inputCreateEmployer.email,
        };
        const loginEmployerAdmin = await request(app)
            .post('/business/admin/login')
            .send(inputLoginEmployerAdmin);
        expect(loginEmployerAdmin.statusCode).toBe(200);

        employer_admin_token = loginEmployerAdmin.body.token;
        //CREATE EMPLOYER ITEMS DETAILS
        const inputToCreateEmployerItemDetails = {
            item_uuid: benefit4_uuid,
            business_info_uuid: employer_info_uuid,
            cycle_end_day: 1,
            value: 200,
        };
        const employerItemDetailsCreated = await request(app)
            .post('/business/item/details/correct')
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .send(inputToCreateEmployerItemDetails);

        expect(employerItemDetailsCreated.statusCode).toBe(201);

        //CREATE EMPLOYEES from CSV
        const csvFilePath = path.join(
            __dirname,
            '../../../test-files/ideal-model.csv'
        );
        const queryToCreateEmployees = {
            business_info_uuid: employer_info_uuid,
        };

        const resultEmployeesCreated = await request(app)
            .post('/app-users-by-correct')
            .query(queryToCreateEmployees)
            .set('Authorization', `Bearer ${correctAdminToken}`)
            .attach('file', csvFilePath); //
        expect(resultEmployeesCreated.statusCode).toBe(201);
        document_employee1 = resultEmployeesCreated.body.usersRegistered[0];
        //get employee 1 user info uuid
        const userInfoEmployee1 = await prismaClient.userInfo.findUnique({
            where: {
                document: document_employee1,
            },
        });
        user_info_uuid_employee1 = userInfoEmployee1.uuid;

        //Now we need to register this employ user auth
        const inputUserauthEmployee1 = {
            document: document_employee1,
            email: 'email@emailuhgjkhi.com',
            password: '123456',
        };
        const resultEmployee1Created = await request(app)
            .post('/app-user')
            .send(inputUserauthEmployee1);
        expect(resultEmployee1Created.statusCode).toBe(201);

        //Login Employee
        const loginEmployee1 = await request(app).post('/login-app-user').send({
            document: inputUserauthEmployee1.document,
            password: inputUserauthEmployee1.password,
        });
        expect(loginEmployee1.statusCode).toBe(200);

        auth_token_employee1 = loginEmployee1.body.token;
        //Activate employee Item
        const userItemsForEmployee1 = await prismaClient.userItem.findMany({
            where: {
                user_info_uuid: user_info_uuid_employee1,
            },
        });

        const inpuActivateUserItem = {
            user_info_uuid: user_info_uuid_employee1,
            item_uuid: userItemsForEmployee1.find(
                (item) => item.status === 'inactive'
            ).item_uuid,
        };
        const resultActivateUserItem = await request(app)
            .patch('/user-item/activate')
            .set('Authorization', `Bearer ${employer_admin_token}`)
            .send(inpuActivateUserItem);
        expect(resultActivateUserItem.statusCode).toBe(200);
    });

    let userItem1EmployeeUuid: string;
    let userItem2EmployeeUuid: string;
    describe('E2E Offline Tokens', () => {
        beforeAll(async () => {
            //EMPLOYEE

            const userItemsForUser1 = await prismaClient.userItem.findMany({
                where: {
                    user_info_uuid: user_info_uuid_employee1,
                },
            });

            const userItemRecord = userItemsForUser1.find(
                (item) => item.item_name === 'Correct'
            );
            const userItem2Record = userItemsForUser1.find(
                (item) => item.item_name !== 'Correct'
            );
            expect(userItemRecord).toBeDefined();
            expect(userItem2Record).toBeDefined();

            userItem1EmployeeUuid = userItemRecord!.uuid;
            userItem2EmployeeUuid = userItem2Record!.uuid;

            await prismaClient.offlineToken.deleteMany({
                where: { user_info_uuid: user_info_uuid_employee1 },
            });
            await prismaClient.offlineTokenHistory.deleteMany({
                where: { user_info_uuid: user_info_uuid_employee1 },
            });
        });

        describe('Activate Offline Tokens', () => {
            it('should activate 5 new tokens for a user item successfully (Initial Activation)', async () => {
                // Este é o primeiro teste que espera um estado 'limpo' de tokens para o UserItem.
                // A. Requisição
                const response = await request(app)
                    .post('/app-user/activate-token')
                    .set('Authorization', `Bearer ${auth_token_employee1}`) // Usando o token fornecido
                    .send({ userItemUuid: userItem1EmployeeUuid });

                // B. Asserts da Resposta
                expect(response.status).toBe(201);
                expect(response.body.offlineTokens).toBeInstanceOf(Array);
                expect(response.body.offlineTokens).toHaveLength(5);

                const firstToken = response.body.offlineTokens[0];
                expect(firstToken.uuid).toBeDefined();
                expect(firstToken.token_code).toMatch(/^[A-Z0-9]{6}$/);
                expect(firstToken.user_info_uuid).toBe(
                    user_info_uuid_employee1
                );
                expect(firstToken.user_item_uuid).toBe(userItem1EmployeeUuid);
                expect(firstToken.status).toBe('ACTIVE');
                expect(
                    new Date(firstToken.expires_at).getTime()
                ).toBeGreaterThan(Date.now());
                expect(firstToken.sequence_number).toBe(1);

                // C. Asserts do Banco de Dados
                const findFirsttokenInDB =
                    await prismaClient.offlineToken.findUnique({
                        where: { token_code: firstToken.token_code },
                    });
                expect(findFirsttokenInDB.token_code).toHaveLength(6);

                const dbTokens = await prismaClient.offlineToken.findMany({
                    where: {
                        user_item_uuid: userItem1EmployeeUuid,
                        user_info_uuid: user_info_uuid_employee1,
                    },
                });
                expect(dbTokens).toHaveLength(5);
                dbTokens.forEach((token) => {
                    expect(token.status).toBe('ACTIVE');
                    expect(token.token_code).toBeDefined();
                });

                const dbHistory =
                    await prismaClient.offlineTokenHistory.findMany({
                        where: {
                            user_item_uuid: userItem1EmployeeUuid,
                            event_type: 'ACTIVATED',
                        },
                    });
                expect(dbHistory).toHaveLength(5);
                dbHistory.forEach((history) => {
                    expect(history.original_token_uuid).toBeDefined();
                    expect(history.event_description).toContain(
                        'New offline token activated'
                    );
                });
            });
            it('should replace existing tokens for the same user item when re-activated, creating history for replacement and new activations', async () => {
                // Este teste será executado APÓS o teste anterior, que já ativou 5 tokens.
                // O Usecase deve lidar com a substituição desses 5 tokens.

                // A. Requisição para re-ativar (com os mesmos dados do userItem1EmployeeUuid)
                const response = await request(app)
                    .post('/app-user/activate-token')
                    .set('Authorization', `Bearer ${auth_token_employee1}`)
                    .send({ userItemUuid: userItem1EmployeeUuid });

                // B. Asserts da Resposta
                expect(response.status).toBe(201);
                expect(response.body.offlineTokens).toHaveLength(5);
                // Os códigos dos tokens devem ser novos
                const newTokensCodes = response.body.offlineTokens.map(
                    (t: any) => t.token_code
                );
                const oldTokensFromHistory =
                    await prismaClient.offlineTokenHistory.findMany({
                        where: {
                            user_item_uuid: userItem1EmployeeUuid,
                            event_type: 'REPLACED_BY_NEW_ACTIVATION',
                        },
                    });
                expect(
                    oldTokensFromHistory.map((h) => h.token_code)
                ).not.toEqual(expect.arrayContaining(newTokensCodes));

                // C. Asserts do Banco de Dados
                const finalTokens = await prismaClient.offlineToken.findMany({
                    where: {
                        user_item_uuid: userItem1EmployeeUuid,
                        user_info_uuid: user_info_uuid_employee1,
                    },
                });
                expect(finalTokens).toHaveLength(5); // Apenas 5 tokens ativos para este item
                finalTokens.forEach((token) =>
                    expect(token.status).toBe('ACTIVE')
                );

                const replacedHistory =
                    await prismaClient.offlineTokenHistory.findMany({
                        where: {
                            user_item_uuid: userItem1EmployeeUuid,
                            event_type: 'REPLACED_BY_NEW_ACTIVATION',
                        },
                    });
                expect(replacedHistory).toHaveLength(5); // 5 tokens antigos devem ter sido marcados como REPLACED

                const activatedHistory =
                    await prismaClient.offlineTokenHistory.findMany({
                        where: {
                            user_item_uuid: userItem1EmployeeUuid,
                            event_type: 'ACTIVATED',
                        },
                    });
                expect(activatedHistory).toHaveLength(10); // 5 da primeira ativação + 5 desta re-ativação
            });
            it('should revoke active tokens from other user items for the same user when a new item is activated', async () => {
                // Ativar tokens para este 'SecondaryBenefit' (que serão os "antigos" a serem revogados)
                const newTokens = await request(app)
                    .post('/app-user/activate-token')
                    .set('Authorization', `Bearer ${auth_token_employee1}`)
                    .send({ userItemUuid: userItem2EmployeeUuid });

                expect(newTokens.status).toBe(201);
                // Verifique que os tokens foram criados para o SecondaryBenefit
                const secondaryBenefitTokens =
                    await prismaClient.offlineToken.findMany({
                        where: {
                            user_item_uuid: userItem2EmployeeUuid,
                            status: OfflineTokenStatus.ACTIVE,
                        },
                    });
                expect(secondaryBenefitTokens).toHaveLength(5);

                // Agora, ativamos novamente o userItem1EmployeeUuid original.
                // Isso DEVE revogar os tokens ativos de userItem2EmployeeUuid.
                const response = await request(app)
                    .post('/app-user/activate-token')
                    .set('Authorization', `Bearer ${auth_token_employee1}`)
                    .send({ userItemUuid: userItem1EmployeeUuid });

                expect(response.status).toBe(201);
                expect(response.body.offlineTokens).toHaveLength(5);
                activeOfflineToken = response.body.offlineTokens.find(
                    (token: any) => token.status === 'ACTIVE'
                ).token_code;

                // C. Asserts do Banco de Dados
                // Verificar tokens para userItem2EmployeeUuid (devem estar revogados)
                const revokedBenefitTokens =
                    await prismaClient.offlineToken.findMany({
                        where: { user_item_uuid: userItem2EmployeeUuid },
                    });
                revokedToken = revokedBenefitTokens.find(
                    (token: any) => token.status === 'REVOKED'
                ).token_code;
                expect(revokedBenefitTokens).toHaveLength(5); // 5 tokens foram criados para SecondaryBenefit
                revokedBenefitTokens.forEach((token) =>
                    expect(token.status).toBe(OfflineTokenStatus.REVOKED)
                );

                // Verificar o histórico de revogação
                const revokedHistory =
                    await prismaClient.offlineTokenHistory.findMany({
                        where: {
                            user_item_uuid: userItem2EmployeeUuid,
                            event_type: 'REVOKED',
                        },
                    });
                expect(revokedHistory).toHaveLength(5); // 5 eventos de revogação
            });
            it('should return 404 if UserItem does not exist or does not belong to the user', async () => {
                // Geração de um UUID que (esperamos) não exista ou não pertença ao usuário
                const nonExistentOrOtherUserItemUuid = new Uuid().uuid;

                const response = await request(app)
                    .post('/app-user/activate-token')
                    .set('Authorization', `Bearer ${userAuthToken1}`)
                    .send({ userItemUuid: nonExistentOrOtherUserItemUuid });

                expect(response.status).toBe(404);
                expect(response.body.error).toBe(
                    'UserItem not found or does not belong to the user.'
                );
            });

            it('should return 401 if user is not authenticated', async () => {
                const response = await request(app)
                    .post('/app-user/activate-token')
                    .send({ userItemUuid: userItem1EmployeeUuid });

                expect(response.status).toBe(401);
            });

            it('should return 400 if userItemUuid is missing from request body', async () => {
                const response = await request(app)
                    .post('/app-user/activate-token')
                    .set('Authorization', `Bearer ${userAuthToken1}`)
                    .send({}); // Corpo vazio

                expect(response.status).toBe(400);
                expect(response.body.error).toBe(
                    'userItemUuid is required in request body.'
                );
            });
        });
    });
    describe('E2E Pix Transactions', () => {
        let pixChargeTransactionId: string;
        describe('Create PIX charges AppUser', () => {
            it('Should throw an error if charge amount is missing', async () => {
                const input = {};
                const result = await request(app)
                    .post('/transaction/pix/charge/app-user/mocked')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${auth_token_employee1}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
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
                        Authorization: `Bearer ${userAuthToken1}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'User ID e um valor positivo são necessários.'
                );
            });
            it('Should craete a pix charge', async () => {
                const input = {
                    amountInReais: 10.0,
                };
                const result = await request(app)
                    .post('/transaction/pix/charge/app-user/mocked')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${userAuthToken1}`,
                    });
                pixChargeTransactionId = result.body.transactionId;
                expect(result.statusCode).toBe(201);
                expect(result.body).toHaveProperty('pixCopyPaste');

                //Get pix charge created
                const pixCreated = await prismaClient.transactions.findFirst({
                    where: {
                        uuid: result.body.transactionId,
                    },
                });

                const userInfo = await prismaClient.userInfo.findUnique({
                    where: {
                        document: inputNewAppUser1.document
                            .replace('.', '')
                            .replace('.', '')
                            .replace('-', ''),
                    },
                });

                const userItem = await prismaClient.userItem.findFirst({
                    where: {
                        uuid: pixCreated.user_item_uuid,
                    },
                });
                expect(userItem.item_name).toBe('Correct');
                expect(pixCreated?.uuid).toBe(result.body.transactionId);
                expect(pixCreated.favored_user_uuid).toBe(userInfo?.uuid);
                expect(pixCreated.favored_business_info_uuid).toBeNull();
                expect(pixCreated.payer_business_info_uuid).toBeNull();
                expect(pixCreated.original_price).toBe(1000);
                expect(pixCreated.discount_percentage).toBe(0);
                expect(pixCreated.net_price).toBe(1000);
                expect(pixCreated.fee_percentage).toBe(0);
                expect(pixCreated.fee_amount).toBe(0);
                expect(pixCreated.partner_credit_amount).toBe(0);
                expect(pixCreated.cashback).toBe(0);
                expect(pixCreated.description).toBeNull();
                expect(pixCreated.provider_tx_id).toBeTruthy();
                expect(pixCreated.pix_e2e_id).toBeNull();
                expect(pixCreated?.status).toBe('pending');
                expect(pixCreated?.transaction_type).toBe('CASH_IN_PIX_USER');
                expect(pixCreated.favored_partner_user_uuid).toBeNull();
                expect(pixCreated.paid_at).toBeNull();
                expect(pixCreated.created_at).toBeTruthy();
                expect(pixCreated.updated_at).toBeTruthy();
            });
        });
        describe('Webhook Processing', () => {
            let pixCreatedBeforeWebhook: any;
            beforeAll(async () => {
                // ARRANGE: Buscamos a transação 'pending' que foi criada no teste anterior.
                // Usamos a variável `pixChargeTransactionId` que você já salvou.
                pixCreatedBeforeWebhook =
                    await prismaClient.transactions.findUnique({
                        where: {
                            uuid: pixChargeTransactionId,
                        },
                    });

                // Uma verificação para garantir que nosso setup está correto
                expect(pixCreatedBeforeWebhook).toBeDefined();
                expect(pixCreatedBeforeWebhook?.status).toBe('pending');
            });

            it("Should process a valid webhook notification, credit the user's balance, and update the transaction status", async () => {
                // ARRANGE (Continuação)

                // 1. Buscar o saldo do UserItem ANTES do webhook
                const userItemBefore = await prismaClient.userItem.findUnique({
                    where: { uuid: pixCreatedBeforeWebhook.user_item_uuid },
                });
                const balanceBefore = userItemBefore.balance;

                // 2. Montar o payload do webhook simulando a resposta do Sicredi
                //    É crucial usar o `provider_tx_id` da transação que estamos testando!
                const webhookPayload = {
                    pix: [
                        {
                            endToEndId: `E${Date.now()}${Math.random().toString().slice(2, 12)}`, // Simula um E2E ID único
                            txid: pixCreatedBeforeWebhook.provider_tx_id, // <<< O PONTO DE LIGAÇÃO
                            valor: (
                                pixCreatedBeforeWebhook.net_price / 100
                            ).toFixed(2), // Ex: "10.00"
                            horario: new Date().toISOString(),
                        },
                    ],
                };

                // ACT: Chamar o endpoint do webhook
                const result = await request(app)
                    .post('/webhooks/sicredi-pix') // Use a rota real do webhook
                    .send(webhookPayload);

                // ASSERT

                // 1. A resposta da API deve ser sucesso
                expect(result.statusCode).toBe(200);

                // 2. Verificar o estado da TRANSAÇÃO no banco de dados DEPOIS do webhook
                const transactionAfter =
                    await prismaClient.transactions.findUnique({
                        where: { uuid: pixChargeTransactionId },
                    });
                expect(transactionAfter).toBeDefined();
                expect(transactionAfter?.status).toBe('success'); // O status deve ter mudado!
                expect(transactionAfter?.pix_e2e_id).toBe(
                    webhookPayload.pix[0].endToEndId
                ); // O endToEndId foi salvo
                expect(transactionAfter?.paid_at).toBeTruthy(); // O paid_at foi preenchido

                // 3. Verificar o estado do USER ITEM no banco de dados DEPOIS do webhook
                const userItemAfter = await prismaClient.userItem.findUnique({
                    where: { uuid: pixCreatedBeforeWebhook.user_item_uuid },
                });
                const expectedBalanceAfter =
                    balanceBefore + pixCreatedBeforeWebhook.net_price;
                expect(userItemAfter?.balance).toBe(expectedBalanceAfter); // O saldo foi creditado!

                // 4. Verificar a criação do registro no HISTÓRICO
                const historyEntry =
                    await prismaClient.userItemHistory.findFirst({
                        where: {
                            related_transaction_uuid: pixChargeTransactionId,
                        },
                    });
                expect(historyEntry).toBeDefined();
                expect(historyEntry?.event_type).toBe('PIX_RECEIVED');
                expect(historyEntry?.amount).toBe(
                    pixCreatedBeforeWebhook.net_price
                );
                expect(historyEntry?.balance_before).toBe(balanceBefore);
                expect(historyEntry?.balance_after).toBe(expectedBalanceAfter);
            });

            // Adicione outros testes para o webhook aqui, se necessário:
            // - Teste para um webhook com txid que não existe
            // - Teste para um webhook de uma transação que já está 'success' (teste de idempotência)
            // - Teste para um webhook com valor incorreto
        });
    });
    describe('E2E Process POS Payment by Offline Token', () => {
        // ======================================================================
        // PRÉ-REQUISITOS E CONFIGURAÇÃO (Variáveis para o teste)
        // ======================================================================

        //let auth_token_employee1: string; // Token JWT do employee1 para autenticação.
        let user_info_uuid_employee1: string; // UUID do userInfo do employee1.
        //let userItem2EmployeeUuid: string; // UUID do UserItem 'SecondaryBenefit' do employee1 (o que será debitado).
        let correct_item_uuid_employee1: string; // UUID do UserItem 'Correct' do employee1 (para cashback) - UUID do DB
        //let business_info_uuid_partner: string; // UUID do BusinessInfo do parceiro - UUID do DB
        let business_account_uuid_partner: string; // UUID da BusinessAccount do parceiro - UUID do DB
        let correct_account_uuid_platform: string; // UUID da CorrectAccount da plataforma - UUID do DB
        //let partner_admin_token: string; // Token JWT do admin do parceiro para autenticação da requisição POST.

        // SALDOS INICIAIS LIDOS DO BANCO DE DADOS em Centavos
        let initialUserItem2BalanceInCents: number;
        let initialBusinessAccountBalanceInCents: number;
        let initialCorrectAccountBalanceInCents: number;

        let initialCorrectUserItemBalanceInCents: number;
        let initialBusinessAccountBalance: number;
        let initialCorrectAccountBalance: number;

        // VALORES DA TRANSAÇÃO NO FORMATO QUE A API RECEBE (EM REAIS)
        const originalPriceInReais = 100; // R$ 100.00
        const discountPercentageForAPI = 10; // 10%
        const netPriceInReais = 90; // R$ 90.00 (100 - 10% de 100 = 90)

        // VALORES DA TRANSAÇÃO CONVERTIDOS PARA CENTAVOS PARA CÁLCULOS INTERNOS E DB
        const originalPriceInCentsCalc = originalPriceInReais * 100; // 10000 centavos
        const netPriceInCentsCalc = netPriceInReais * 100; // 9000 centavos

        // Valores calculados com base nas regras da TransactionEntity (TODOS EM CENTAVOS)
        let expectedPlatformFeePercentageScaled: number; // % total que a plataforma cobra (escalado)
        let expectedPlatformFeeAmountInCents: number; // Valor total da taxa da plataforma (em centavos)
        let expectedCashbackAmountInCents: number; // Valor total de cashback para o usuário (em centavos)
        let expectedPartnerCreditAmountInCents: number; // Valor que o parceiro receberá (em centavos)

        // Variáveis para as taxas escaladas (lidas do PartnerConfig)
        let cashbackProvidedByPartnerScaled: number;
        let adminTaxPercentageScaled: number;
        let marketingTaxPercentageScaled: number;
        let marketPlaceTaxScaled: number;

        beforeAll(async () => {
            //FIND PARTNER CONFIG TO IDENTIFY TAXES AND CASHBACK
            // ======================================================================
            // CÁLCULO DAS TAXAS E CASHBACK BASEADO NO PartnerConfig E TransactionEntity
            // ======================================================================
            // 1. Encontrar a configuração do parceiro para identificar taxas
            const partnerConfig = await prismaClient.partnerConfig.findUnique({
                where: {
                    business_info_uuid: partner_info_uuid,
                },
            });
            if (!partnerConfig) {
                throw new Error(
                    'PartnerConfig not found for the test partner. Please seed it.'
                );
            }
            // 2. Armazenar as taxas escaladas diretamente do PartnerConfig
            // (A sua `TransactionEntity` soma admin_tax e marketing_tax para o fee_percentage)
            adminTaxPercentageScaled = partnerConfig.admin_tax;
            marketingTaxPercentageScaled = partnerConfig.marketing_tax;
            marketPlaceTaxScaled = partnerConfig.market_place_tax; // Se esta for uma taxa adicional fora de 'fee_percentage'
            cashbackProvidedByPartnerScaled = partnerConfig.cashback_tax; // Cashback adicional do parceiro, se aplicável

            // 3. Calcular a porcentagem TOTAL da taxa da plataforma (fee_percentage)
            // Conforme TransactionEntity.calculateFeePercentage, é a soma de admin_tax e marketing_tax
            expectedPlatformFeePercentageScaled =
                adminTaxPercentageScaled + marketingTaxPercentageScaled;

            // 4. Calcular o VALOR TOTAL da taxa da plataforma (fee_amount)x
            // Conforme TransactionEntity.calculateFee() -> _fee_amount
            const calculatedFeeAmount =
                (BigInt(netPriceInCentsCalc) *
                    BigInt(expectedPlatformFeePercentageScaled)) /
                BigInt(1000000); // netPriceInCents * (fee_percentage / 10000 para % * 100 para centavos)
            expectedPlatformFeeAmountInCents = Number(calculatedFeeAmount);

            // 5. Calcular o VALOR TOTAL do cashback para o usuário
            // Conforme TransactionEntity.calculateFee() -> _cashback é 20% do _fee_amount
            expectedCashbackAmountInCents = Number(
                (BigInt(expectedPlatformFeeAmountInCents) * 20n) / 100n
            );
            // Adicionar cashback fornecido pelo parceiro
            // cashback = (20% da taxa da plataforma) + (cashback do parceiro sobre net_price)
            // ENTÃO:
            const partnerAdditionalCashback =
                (BigInt(netPriceInCentsCalc) *
                    BigInt(cashbackProvidedByPartnerScaled)) /
                BigInt(1000000);
            expectedCashbackAmountInCents += Number(partnerAdditionalCashback);

            // 6. Calcular o VALOR a ser creditado ao parceiro
            // Conforme TransactionEntity.calculateFee() -> _partner_credit_amount
            expectedPartnerCreditAmountInCents =
                netPriceInCentsCalc - expectedPlatformFeeAmountInCents;

            // Se o marketplaceTax também afeta o que o parceiro recebe, precisaria ser subtraído daqui.
            // Mas como a TransactionEntity calcula _fee_amount apenas com admin_tax e marketing_tax
            // e _partner_credit_amount é _net_price - _fee_amount, o marketplaceTax não está impactando o parceiro *neste cálculo*.
            // Ele deveria ser uma parte do _fee_amount ou uma dedução separada.
            // Vamos considerar que 'marketPlaceTax' é uma taxa que a plataforma cobra a si mesma, ou parte do fee_percentage se somada.
            // Por enquanto, a 'expectedPlatformFeeAmountInCents' já cobre o que a plataforma 'ganha' da transação.
        });
        beforeEach(async () => {
            // --- CAPTURAR SALDOS INICIAIS ANTES DE CADA TESTE ---
            const userItem2 = await prismaClient.userItem.findUnique({
                where: { uuid: userItem2EmployeeUuid },
            });
            initialUserItem2BalanceInCents = userItem2.balance;

            const correctUserItem = await prismaClient.userItem.findFirst({
                where: {
                    user_info_uuid: userItem2.user_info_uuid,
                    item_name: 'Correct',
                },
            });

            correct_item_uuid_employee1 = correctUserItem.uuid;
            initialCorrectUserItemBalanceInCents = correctUserItem.balance;

            const businessAccount =
                await prismaClient.businessAccount.findFirst({
                    where: { business_info_uuid: partner_info_uuid },
                });
            business_account_uuid_partner = businessAccount.uuid;
            initialBusinessAccountBalanceInCents = businessAccount.balance;

            const correctAccount = await prismaClient.correctAccount.findFirst(
                {}
            );
            initialCorrectAccountBalanceInCents = correctAccount.balance;
            correct_account_uuid_platform = correctAccount.uuid;
        });
        describe('E2E Pre Paid Offline Token', () => {
            it('Should throw an error if original price is missing', async () => {
                const input: InputProcessPOSTransactionWithOfflineTokenDTO = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: 0,
                    discount_percentage: 10,
                    net_price: 900,
                    tokenCode: 'ABC123',
                };
                const result = await request(app)
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Original price is required');
            });
            it('Should throw an error if net_price is missing (undefined)', async () => {
                const input: any = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: 1000,
                    discount_percentage: 10,
                    // net_price: undefined, // Esta propriedade está ausente
                    tokenCode: 'ABC123',
                };
                const result = await request(app)
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Net price is required');
            });

            it('Should throw an error if discount_percentage is missing (undefined)', async () => {
                const input: any = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: 1000,
                    // discount_percentage: undefined, // Esta propriedade está ausente
                    net_price: 900,
                    tokenCode: 'ABC123',
                };
                const result = await request(app)
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Discount percentage is required'
                );
            });

            it('Should throw an error if tokenCode is missing (undefined)', async () => {
                const input: any = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: 1000,
                    discount_percentage: 10,
                    net_price: 900,
                    // tokenCode: undefined, // Esta propriedade está ausente
                };
                const result = await request(app)
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Offline token code is required'
                );
            });

            it('Should throw an error if tokenCode has an invalid length (less than 6 characters)', async () => {
                const input: InputProcessPOSTransactionWithOfflineTokenDTO = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: 1000,
                    discount_percentage: 10,
                    net_price: 900,
                    tokenCode: 'ABC12', // Menos de 6 caracteres
                };
                const result = await request(app)
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Offline token code must be 6 characters long'
                );
            });

            it('Should throw an error if tokenCode has an invalid length (more than 6 characters)', async () => {
                const input: InputProcessPOSTransactionWithOfflineTokenDTO = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: 1000,
                    discount_percentage: 10,
                    net_price: 900,
                    tokenCode: 'ABC1234', // Mais de 6 caracteres
                };
                const result = await request(app)
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Offline token code must be 6 characters long'
                );
            });
            it('Should throw an error is token status is REVOKED', async () => {
                const input: InputProcessPOSTransactionWithOfflineTokenDTO = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: 10,
                    discount_percentage: 10,
                    net_price: 9,
                    tokenCode: revokedToken, // Mais de 6 caracteres
                };
                const result = await request(app)
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });
                expect(result.statusCode).toBe(403);
                expect(result.body.error).toBe(
                    'Offline token is not active. Current status: REVOKED.'
                );
            });
            it('Should successfully process offline token payment - PRE PAID USER ITEM', async () => {
                //HERE WE ARE COMING BACK TOKENS TO USER ITEM 2, BECAUSE IT HAS SOME BALANCE
                // Ativar tokens para este 'SecondaryBenefit' (que serão os "antigos" a serem revogados)
                const activateTokenResponse = await request(app)
                    .post('/app-user/activate-token')
                    .set('Authorization', `Bearer ${auth_token_employee1}`)
                    .send({ userItemUuid: userItem2EmployeeUuid });

                expect(activateTokenResponse.status).toBe(201);
                expect(activateTokenResponse.body.offlineTokens).toBeInstanceOf(
                    Array
                );
                expect(
                    activateTokenResponse.body.offlineTokens.length
                ).toBeGreaterThan(0);
                activeOfflineToken =
                    activateTokenResponse.body.offlineTokens.find(
                        (token: any) => token.status === 'ACTIVE'
                    ).token_code;
                expect(activateTokenResponse.status).toBe(201);

                const input: InputProcessPOSTransactionWithOfflineTokenDTO = {
                    business_info_uuid: '',
                    partner_user_uuid: '',
                    original_price: originalPriceInReais,
                    discount_percentage: discountPercentageForAPI,
                    net_price: netPriceInReais,
                    tokenCode: activeOfflineToken, // Mais de 6 caracteres
                };
                const transactionResponse = await request(app) // <-- Renomeado de `result` para `transactionResponse` para clareza
                    .post('/app-user/transation/offline-token')
                    .send(input)
                    .set({
                        Authorization: `Bearer ${partner_admin_token}`,
                    });

                expect(transactionResponse.statusCode).toBe(200);

                // ======================================================================
                // C. ASSERÇÕES DA RESPOSTA DA API (Validação do corpo da resposta)
                // ======================================================================
                expect(transactionResponse.body.transaction_uuid).toBeDefined();
                expect(typeof transactionResponse.body.transaction_uuid).toBe(
                    'string'
                );
                expect(transactionResponse.body.transaction_status).toBe(
                    TransactionStatus.success
                );
                expect(transactionResponse.body.paid_at).toBeDefined(); // Verifica se o timestamp de pagamento existe
                expect(transactionResponse.body.offline_token_code).toBe(
                    activeOfflineToken
                );
                expect(transactionResponse.body.offline_token_status).toBe(
                    OfflineTokenStatus.CONSUMED
                );
                expect(transactionResponse.body.message).toBe(
                    'Transaction created and paid successfully with offline token.'
                );

                // Validações de saldos/valores retornados pela API (geralmente em Reais)
                // finalBalance: Saldo final do item debitado do usuário
                expect(transactionResponse.body.finalBalance).toBeCloseTo(
                    (initialUserItem2BalanceInCents - netPriceInCentsCalc) / 100
                );
                // cashback: Valor de cashback para o usuário
                expect(transactionResponse.body.cashback).toBeCloseTo(
                    expectedCashbackAmountInCents / 100
                );

                const transactionUuid =
                    transactionResponse.body.transaction_uuid; // Captura o UUID da transação para uso posterior

                // ======================================================================
                // D. ASSERÇÕES DO ESTADO DO BANCO DE DADOS (APÓS A TRANSAÇÃO)
                // ======================================================================

                // 1. Verificar o UserItem2 (saldo debitado)
                const updatedUserItem2 = await prismaClient.userItem.findUnique(
                    {
                        where: { uuid: userItem2EmployeeUuid },
                    }
                );
                // Adicionar verificação de null, pois é uma boa prática
                if (!updatedUserItem2)
                    throw new Error(
                        'Updated UserItem2 not found after transaction.'
                    );

                // Saldo final esperado em centavos: inicial - netPriceInCentsCalc
                expect(updatedUserItem2.balance).toBe(
                    initialUserItem2BalanceInCents - netPriceInCentsCalc
                );
                // 2. Verificar o CorrectUserItem (saldo de cashback creditado)
                const updatedCorrectUserItem =
                    await prismaClient.userItem.findUnique({
                        where: { uuid: correct_item_uuid_employee1 },
                    });
                if (!updatedCorrectUserItem)
                    throw new Error(
                        'Updated CorrectUserItem not found after transaction.'
                    );

                // Saldo final esperado em centavos: inicial + cashback
                expect(updatedCorrectUserItem.balance).toBe(
                    initialCorrectUserItemBalanceInCents +
                        expectedCashbackAmountInCents
                );

                // 3. Verificar a BusinessAccount do parceiro (saldo creditado)
                const updatedBusinessAccount =
                    await prismaClient.businessAccount.findUnique({
                        where: { uuid: business_account_uuid_partner },
                    });
                if (!updatedBusinessAccount)
                    throw new Error(
                        'Updated BusinessAccount not found after transaction.'
                    );

                // Saldo final esperado em centavos: inicial + valor a ser creditado ao parceiro
                expect(updatedBusinessAccount.balance).toBe(
                    initialBusinessAccountBalanceInCents +
                        expectedPartnerCreditAmountInCents
                );

                // 4. Verificar a CorrectAccount da plataforma (saldo da taxa creditado)
                const updatedCorrectAccount =
                    await prismaClient.correctAccount.findUnique({
                        where: { uuid: correct_account_uuid_platform },
                    });
                if (!updatedCorrectAccount)
                    throw new Error(
                        'Updated CorrectAccount not found after transaction.'
                    );

                console.log(
                    'Updated CorrectAccount Balance (Cents):',
                    updatedCorrectAccount.balance
                );
                
                expect(updatedCorrectAccount.balance).toBe(
                    initialCorrectAccountBalanceInCents +
                        (expectedPlatformFeeAmountInCents -
                            expectedCashbackAmountInCents)
                );

                // 5. Verificar o OfflineToken no banco de dados
                const updatedOfflineToken =
                    await prismaClient.offlineToken.findUnique({
                        where: { token_code: activeOfflineToken },
                    });
                if (!updatedOfflineToken)
                    throw new Error(
                        'OfflineToken not found after transaction.'
                    );

                expect(updatedOfflineToken.status).toBe(
                    OfflineTokenStatus.CONSUMED
                );
                expect(updatedOfflineToken.expires_at).toBeDefined(); // Token consumido deve ter data de expiração/consumo definida.


                // 6. Verificar a TransactionEntity criada
                const transaction = await prismaClient.transactions.findUnique({
                    where: { uuid: transactionUuid },
                });
                if (!transaction)
                    throw new Error(
                        'Transaction not found in DB after creation.'
                    );
                expect(transaction.uuid).toBe(transactionUuid);
                expect(transaction.status).toBe(TransactionStatus.success);
                expect(transaction.transaction_type).toBe(
                    TransactionType.POS_OFFLINE_PAYMENT
                ); 
                expect(transaction.favored_business_info_uuid).toBe(
                    partner_info_uuid
                );
                
                expect(transaction.original_price).toBe(
                    originalPriceInCentsCalc
                );
                expect(transaction.net_price).toBe(netPriceInCentsCalc);
                expect(transaction.fee_percentage).toBe(
                    expectedPlatformFeePercentageScaled
                );
                expect(transaction.fee_amount).toBe(
                    expectedPlatformFeeAmountInCents
                );
                expect(transaction.cashback).toBe(
                    expectedCashbackAmountInCents
                );
                expect(transaction.partner_credit_amount).toBe(
                    expectedPartnerCreditAmountInCents
                );
                expect(transaction.paid_at).toBeDefined();

                // 7. Verificar os Históricos
                // Para userItem2 (débito)

                const userItem2History = await prismaClient.userItemHistory.findFirst({
                    where: {
                        user_item_uuid: userItem2EmployeeUuid,
                        related_transaction_uuid: transactionUuid,
                        // event_type: UserItemEventType.DEBIT // Se você tiver um enum para o tipo de evento
                    },
                    orderBy: { created_at: 'desc' }
                });
                if (!userItem2History) throw new Error("UserItem2 History not found.");
                expect(userItem2History.amount).toBe(-netPriceInCentsCalc); // O débito deve ser negativo
                expect(userItem2History.balance_after).toBe(updatedUserItem2.balance);

                // Para correctUserItem (crédito)
                const correctUserItemHistory = await prismaClient.userItemHistory.findFirst({
                    where: {
                        user_item_uuid: correct_item_uuid_employee1,
                        related_transaction_uuid: transactionUuid,
                        event_type: UserItemEventType.CASHBACK_RECEIVED,
                                                
                    },
                    orderBy: { created_at: 'desc' }
                });
                if (!correctUserItemHistory) throw new Error("CorrectUserItem History not found.");
                expect(correctUserItemHistory.amount).toBe(expectedCashbackAmountInCents); // O crédito deve ser positivo
                expect(correctUserItemHistory.balance_after).toBe(updatedCorrectUserItem.balance);
                // Para BusinessAccount (crédito)
                const businessAccountHistory = await prismaClient.businessAccountHistory.findFirst({
                    where: {
                        //business_account_uuid: business_account_uuid_partner,
                        related_transaction_uuid: transactionUuid,
                        // event_type: BusinessAccountEventType.ITEM_SPENT // Se você tiver um enum para o tipo de evento
                    },
                    orderBy: { created_at: 'desc' }
                });
                if (!businessAccountHistory) throw new Error("BusinessAccount History not found.");
                expect(businessAccountHistory.amount).toBe(expectedPartnerCreditAmountInCents);
                expect(businessAccountHistory.balance_after).toBe(updatedBusinessAccount.balance);

                // Para CorrectAccount (crédito/débito da taxa)
                const correctAccountHistory = await prismaClient.correctAccountHistory.findFirst({
                    where: {
                        correct_account_uuid: correct_account_uuid_platform,
                        related_transaction_uuid: transactionUuid,
                        // event_type: CorrectAccountEventType.FEE_COLLECTION // Se você tiver um enum para o tipo de evento
                    },
                    orderBy: { created_at: 'desc' }
                });
                if (!correctAccountHistory) throw new Error("CorrectAccount History not found.");
                // A lógica para o amount aqui dependerá de como a TransactionEntity registra o débito/crédito na CorrectAccount.
                // Se for (taxa bruta - cashback), então:
                expect(correctAccountHistory.amount).toBe(expectedPlatformFeeAmountInCents - expectedCashbackAmountInCents);
                expect(correctAccountHistory.balance_after).toBe(updatedCorrectAccount.balance);

                // Para OfflineTokenHistory (CONSUMED)
                const offlineTokenHistory = await prismaClient.offlineTokenHistory.findFirst({
                    where: {
                        token_code: activeOfflineToken,
                        related_transaction_uuid: transactionUuid,
                        snapshot_status: OfflineTokenStatus.CONSUMED,
                        // event_type: OfflineTokenHistoryEventType.CONSUMED // Se você tiver um enum para o tipo de evento
                    },
                });
                if (!offlineTokenHistory) throw new Error("OfflineToken History not found.");
                expect(offlineTokenHistory.event_type).toBe(OfflineTokenHistoryEventType.USED_IN_TRANSACTION);
                expect(offlineTokenHistory.snapshot_status).toBe(OfflineTokenStatus.CONSUMED);
                expect(offlineTokenHistory.user_item_uuid).toBe(userItem2EmployeeUuid);
            });
        });
    });
});
