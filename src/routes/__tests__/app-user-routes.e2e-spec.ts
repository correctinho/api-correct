import request from 'supertest';
import { app } from '../../app';
import { InputCreateAppUserDTO } from '../../modules/AppUser/app-user-dto/app-user.dto';
import { InputCreateUserInfoDTO } from '../../modules/AppUser/AppUserManagement/usecases/UserInfo/create-user-info/dto/create-user-info.dto';
import { InputUpdateAppUserAddressDTO } from '../../modules/AppUser/AppUserManagement/usecases/UserAddress/update-app-user-address/dto/update-app-user-address.dto';
import { Uuid } from '../../@shared/ValueObjects/uuid.vo';
import { InputCreateBenefitDto } from '../../modules/benefits/usecases/create-benefit/create-benefit.dto';
import path from 'path';
import { randomUUID } from 'crypto';
import { calculateCycleSettlementDateAsDate } from '../../utils/date';
import { prismaClient } from '../../infra/databases/prisma.config';
import { PasswordBCrypt } from '../../infra/shared/crypto/password.bcrypt';
import fs from 'fs';
import { Status } from '@prisma/client';
import { FakeStorage } from '../../infra/providers/storage/implementations/fake/fake.storage';

let userToken1: string;
let userToken2: string;
let userToken3: string;

let correctAdminToken: string;

let business_address_uuid: string;

let employer_info_uuid: string;
let employer_info_uuid2: string;
let employer_info_uuid3: string;

let partner_info_uuid: string;
let partner_info_uuid2: string;
let partner_info_uuid3: string;
let partner_info_uuid4: string;
let partner_info_uuid5: string;
let partner_info_uuid6: string;
let partner_info_uuid7: string;
let partner_info_uuid8: string;
let partner_info_uuid9: string;
let partner_info_uuid10: string;

let partner_user_uuid2: string;
let partner_auth_token2: string;
let partner_user_uuid3: string;
let partner_auth_token3: string;

let employee_user_document: string;

let list_employees1_info_uuid: string[] = [];

let commonEmployeeUserInfoUuid: string; //this is an employee for employers 1 and 2
let employee_user_info: string;
let employeeAuthToken: string;

let employee2_user_info: string;
let employeeAuthToken2: string;

let non_employee_user_info: string;
let non_employee_user_document: string;
let non_employee_token: string;

let employer_user_uuid: string;
let employer_user_uuid2: string;
let employer_user_uuid3: string;

let employer_user_token: string;
let employer_user_token2: string;
let employer_user_token3: string;

let benefit1_uuid: Uuid;
let benefit2_uuid: Uuid;
let benefit3_uuid: Uuid;
let benefit4_uuid: Uuid;
let benefit5_uuid: Uuid;

//Employe 1 benefits uuid
let correct_benefit_user1_uuid: string;
let alimentacao_benefit_user1_uuid: string;
let adiantamento_benefit_user1_uuid: string;
let convenio_benefit_user1_uuid: string;

//Employe 2 benefits uuid
let correct_benefit_user2_uuid: string;
let alimentacao_benefit_user2_uuid: string;
let blocked_adiantamento_benefit_user2_uuid: string;
let convenio_benefit_user2_uuid: string;

let correct_benefit_user2_balance: number;

let branch1_uuid: string;
let branch2_uuid: string;
let branch3_uuid: string;
let branch4_uuid: string;
let branch5_uuid: string;

const documentUser1 = '875.488.760-76';
const documentUser2 = '475.953.480-64';
const documentUser3 = '694.438.610-03';

const projectRoot = process.cwd();

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

const inputNewAppUser3: any = {
    user_info_uuid: null,
    document: '915.583.910-02',
    email: 'email3@email.com',
    password: 'senha123',
    //is_active: true,
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

describe('E2E App User tests', () => {
    beforeAll(async () => {
        const inputNewAdmin = {
            name: 'Admin Correct',
            email: 'admincorrect@correct.com.br',
            userName: 'admin-correct',
            password: '123',
        };
        //create correct admin
        await request(app).post('/admin').send(inputNewAdmin);

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

        const benefit0 = {
            name: 'Correct',
            description: 'Descrição do vale',
            parent_uuid: null as any,
            item_type: 'gratuito',
            item_category: 'pre_pago',
        };

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

        benefit1_uuid = benefit1Response.body.uuid;
        benefit2_uuid = benefit2Response.body.uuid;
        benefit3_uuid = benefit3Response.body.uuid;
        benefit4_uuid = benefit4Response.body.uuid;

        //create branches
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

        //create business info 1
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
            items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid],
        };

        const businessInfo = await request(app)
            .post('/business/register')
            .send(input);
        employer_info_uuid = businessInfo.body.BusinessInfo.uuid;

        //create business info 2
        const input2 = {
            line1: 'Rua',
            line2: '72B',
            line3: '',
            neighborhood: 'Bairro Teste',
            postal_code: '5484248423',
            city: 'Cidade teste',
            state: 'Estado teste',
            country: 'País teste',
            fantasy_name: 'Empresa teste',
            document: 'empregador2',
            classification: 'Classificação',
            colaborators_number: 5,
            email: 'empregador2@empregador.com',
            phone_1: '215745158',
            phone_2: '124588965',
            business_type: 'empregador',
            employer_branch: 'Frigoríficio',
            items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid],
        };

        const businessInfo2 = await request(app)
            .post('/business/register')
            .send(input2);

        employer_info_uuid2 = businessInfo2.body.BusinessInfo.uuid;

        //create business info 3
        const input3 = {
            line1: 'Rua',
            line2: '72B',
            line3: '',
            neighborhood: 'Bairro Teste',
            postal_code: '5484248423',
            city: 'Cidade teste',
            state: 'Estado teste',
            country: 'País teste',
            fantasy_name: 'Empresa teste',
            document: 'empregador3',
            classification: 'Classificação',
            colaborators_number: 5,
            email: 'empregador3@empregador.com',
            phone_1: '215745158',
            phone_2: '124588965',
            business_type: 'empregador',
            employer_branch: 'Frigoríficio',
            items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid],
        };

        const businessInfo3 = await request(app)
            .post('/business/register')
            .send(input3);

        employer_info_uuid3 = businessInfo3.body.BusinessInfo.uuid;
    });
    describe('E2E App User Auth', () => {
        describe('Create app user', () => {
            it('Should throw an error if document is invalid', async () => {
                const inputNewAppUser12: InputCreateAppUserDTO = {
                    user_info_uuid: null,
                    document: '112346440535454',
                    email: 'email@email.com',
                    password: 'senha123',
                    is_active: true,
                };
                const user2 = await request(app)
                    .post('/app-user')
                    .send(inputNewAppUser12);

                expect(user2.statusCode).toBe(400);
                expect(user2.body.error).toEqual(
                    `Document must have 11 characters: ${inputNewAppUser12.document}`
                );
            });
            it('Should throw an error if email is invalid', async () => {
                const inputNewAppUser12: InputCreateAppUserDTO = {
                    user_info_uuid: null,
                    document: documentUser1,
                    email: 'email.com',
                    password: 'senha123',
                    is_active: true,
                };
                const user2 = await request(app)
                    .post('/app-user')
                    .send(inputNewAppUser12);

                expect(user2.statusCode).toBe(400);
                expect(user2.body.error).toEqual('Invalid email format');
            });

            it('Should create a new app user', async () => {
                const result = await request(app)
                    .post('/app-user')
                    .send(inputNewAppUser1);

                expect(result.statusCode).toBe(201);
                expect(result.body.document).toEqual('87548876076');
                expect(result.body.email).toEqual(inputNewAppUser1.email);
                expect(result.body.is_active).toEqual(
                    inputNewAppUser1.is_active
                );
            });
            it('Should throw an error if document is already registered', async () => {
                const inputNewAppUser12: InputCreateAppUserDTO = {
                    user_info_uuid: null,
                    document: documentUser1,
                    email: 'email@email.com',
                    password: 'senha123',
                    is_active: true,
                };
                const user2 = await request(app)
                    .post('/app-user')
                    .send(inputNewAppUser12);

                expect(user2.statusCode).toBe(409);
                expect(user2.body.error).toEqual('User already has an account');
            });

            it('Should throw an error if email is already registered', async () => {
                const inputNewAppUser12: InputCreateAppUserDTO = {
                    user_info_uuid: null,
                    document: '40353978060',
                    email: 'email@email.com',
                    password: 'senha123',
                    is_active: true,
                };
                const user2 = await request(app)
                    .post('/app-user')
                    .send(inputNewAppUser12);

                expect(user2.statusCode).toBe(409);
                expect(user2.body.error).toEqual('Email already in use');
            });
        });

        describe('Login App user', () => {
            it('Should throw an error if document is missing ', async () => {
                const result = await request(app).post('/login-app-user').send({
                    document: '',
                    password: 'password',
                });
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Document/password is incorrect'
                );
            });

            it('Should throw an error if password is missing ', async () => {
                const result = await request(app).post('/login-app-user').send({
                    document: 'document',
                    password: '',
                });

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'Document/password is incorrect'
                );
            });

            it('Should throw an error if document is not found ', async () => {
                const result = await request(app).post('/login-app-user').send({
                    document: '40353978060',
                    password: inputNewAppUser1.password,
                });
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe(
                    'Document/password is incorrect'
                );
            });

            it('Should throw an error if password is incorrect ', async () => {
                const result = await request(app).post('/login-app-user').send({
                    document: inputNewAppUser1.document,
                    password: 'inputNewAppUser1.password',
                });
                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe(
                    'Document/password is incorrect'
                );
            });

            it('Should login app user with only number document', async () => {
                const result = await request(app)
                    .post('/login-app-user')
                    .send(authenticateAppUser1);

                userToken1 = result.body.token;
                expect(result.statusCode).toBe(200);
            });
            it('Should login app user with full document', async () => {
                const input = {
                    document: '875.488.760-76',
                    password: authenticateAppUser1.password,
                };

                const result = await request(app)
                    .post('/login-app-user')
                    .send(input);
                userToken1 = result.body.token;
                expect(result.statusCode).toBe(200);
            });
        });

        describe('App user details', () => {
            it('Should throw an error if token is missing', async () => {
                const result = await request(app).get('/app-user');

                expect(result.statusCode).toBe(401);
                expect(result.body.error).toBe('Token is missing');
            });

            it('Should return only user auth', async () => {
                const result = await request(app)
                    .get('/app-user')
                    .set('Authorization', `Bearer ${userToken1}`);

                expect(result.statusCode).toBe(200);
                expect(result.body.status).toBeFalsy();
                expect(result.body.UserAuthDetails.document).toEqual(
                    '87548876076'
                );
                expect(result.body.UserAuthDetails.email).toEqual(
                    inputNewAppUser1.email
                );
                expect(result.body.UserInfo).toBeFalsy();
                expect(result.body.UserAddress).toBeFalsy();
                expect(result.body.UserValidation).toBeFalsy();
            });
        });
        describe('Set App user Transaction PIN', () => {
            describe('Set App user Transaction PIN', () => {
                beforeAll(async () => {
                    //create app user 2
                    const appUser2 = await request(app)
                        .post('/app-user')
                        .send(inputNewAppUser2);
                    expect(appUser2.statusCode).toBe(201);

                    //authenticate app user 2
                    const authAppUser2 = await request(app)
                        .post('/login-app-user')
                        .send(authenticateAppUser2);
                    userToken2 = authAppUser2.body.token;
                    expect(authAppUser2.statusCode).toBe(200);
                });
                it('should set transaction pin for a new user and verify the hash in the database', async () => {
                    // ARRANGE
                    const input = {
                        newPin: '1234',
                        password: 'senha123', // Senha correta do userToken1
                    };

                    // ACT
                    const result = await request(app)
                        .post('/app-user/transaction-pin')
                        .set('Authorization', `Bearer ${userToken1}`)
                        .send(input);

                    // ASSERT - Resposta da API
                    expect(result.statusCode).toBe(200);
                    expect(result.body.success).toBe(true);
                    expect(result.body.message).toBe(
                        'PIN de transação criado com sucesso.'
                    );

                    // ASSERT - Verificação do Banco de Dados (A GARANTIA)
                    const userAuth = await prismaClient.userAuth.findUnique({
                        where: { document: '87548876076' },
                    });

                    expect(userAuth).toBeDefined();
                    expect(userAuth?.transaction_pin).not.toBeNull(); // Garante que o PIN foi salvo
                    expect(userAuth?.transaction_pin).not.toBe('1234'); // Garante que o PIN NÃO foi salvo em texto puro
                    // Verifica se o hash salvo corresponde ao PIN enviado
                    const hashService = new PasswordBCrypt();
                    const isPinCorrect = await hashService.compare(
                        '1234',
                        userAuth!.transaction_pin!
                    );
                    expect(isPinCorrect).toBe(true);
                });
                it('should update an existing transaction pin', async () => {
                    // ARRANGE: Primeiro, garantimos que o usuário já tem um PIN.
                    const initialInput = {
                        newPin: '1111',
                        password: inputNewAppUser2.password,
                    };
                    const initialRes = await request(app)
                        .post('/app-user/transaction-pin')
                        .set('Authorization', `Bearer ${userToken2}`)
                        .send(initialInput);
                    expect(initialRes.statusCode).toBe(200);

                    // ACT: Agora, o usuário tenta alterar o PIN.
                    const updateInput = {
                        newPin: '9876',
                        password: inputNewAppUser2.password,
                    };
                    const result = await request(app)
                        .post('/app-user/transaction-pin')
                        .set('Authorization', `Bearer ${userToken2}`)
                        .send(updateInput);
                    // ASSERT
                    expect(result.statusCode).toBe(200);
                    expect(result.body.success).toBe(true);
                    // A mensagem deve refletir uma alteração, não uma criação.
                    expect(result.body.message).toBe(
                        'PIN de transação alterado com sucesso.'
                    );
                });

                it('should return a 403 error if the password is wrong', async () => {
                    // ARRANGE
                    const input = {
                        newPin: '1234',
                        password: 'senha-errada', // << Senha incorreta
                    };

                    // ACT
                    const result = await request(app)
                        .post('/app-user/transaction-pin')
                        .set('Authorization', `Bearer ${userToken1}`)
                        .send(input);

                    // ASSERT
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe('Invalid password.');
                });
            });
        });
    });

    describe('E2E tests App User Info by user', () => {
        describe('Create App User Info by user', () => {
            it('Should create a new user info', async () => {
                const input: any = {
                    business_info_uuid: null,
                    address_uuid: null,
                    document: null,
                    document2: '24875492',
                    document3: '56121561258',
                    full_name: 'User Full Name',
                    display_name: null,
                    internal_company_code: '54891218',
                    gender: 'Masculino',
                    date_of_birth: '15/08/1998',
                    salary: 2000,
                    phone: '679654874520',
                    email: null,
                    company_owner: false,
                    status: null,
                    function: null,
                    recommendation_code: '514554156',
                    is_authenticated: false,
                    marital_status: 'casado',
                    dependents_quantity: 1,
                    user_document_validation_uuid: null,
                };

                const result = await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);
                const userDetails = await request(app)
                    .get('/app-user')
                    .set('Authorization', `Bearer ${userToken1}`);

                //get user info to confirm
                const getUserInfo = await request(app)
                    .get('/app-user/info')
                    .set('Authorization', `Bearer ${userToken1}`);
                expect(getUserInfo.statusCode).toBe(200);

                expect(result.statusCode).toBe(201);
                expect(result.body.sucess).toEqual(
                    'User info registered successfully'
                );
                expect(userDetails.body.UserInfo).toBeTruthy();
                expect(getUserInfo.body.document).toEqual('87548876076');
                expect(getUserInfo.body.document2).toEqual('24875492');
                expect(getUserInfo.body.document3).toEqual('56121561258');
                expect(getUserInfo.body.full_name).toEqual('User Full Name');
                expect(getUserInfo.body.gender).toEqual('Masculino');
                expect(getUserInfo.body.date_of_birth).toEqual('15/08/1998');
                expect(getUserInfo.body.phone).toEqual('679654874520');
            });
            it('Should throw an error if user info is already registered and tables are already synchronized', async () => {
                const input: InputCreateUserInfoDTO = {
                    business_info_uuid: null,
                    address_uuid: null,
                    document: null,
                    document2: null,
                    document3: null,
                    full_name: 'User Full Name',
                    display_name: null,
                    internal_company_code: null,
                    gender: 'Male',
                    date_of_birth: '15/08/1998',
                    salary: null,
                    phone: null,
                    email: 'email@email.com',
                    company_owner: false,
                    status: null,
                    function: null,
                    recommendation_code: null,
                    is_authenticated: false,
                    marital_status: null,
                    dependents_quantity: 1,
                    user_document_validation_uuid: null,
                    user_id: null,
                };

                const createUser = await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(createUser.body.error).toBe(
                    'User Info already registered - 1'
                );
                expect(createUser.statusCode).toBe(409);
            });
        });

        describe('Get User Info By User', () => {
            it('Should return user info', async () => {
                const result = await request(app)
                    .get('/app-user/info')
                    .set('Authorization', `Bearer ${userToken1}`);
                expect(result.body).toHaveProperty('uuid');
            });
        });
    });
    describe('E2E tests User Address', () => {
        describe('Create app user address', () => {
            it('Should throw an error if line 1 is missing', async () => {
                const input = {
                    line1: '',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Line1 is required');
                expect(result.statusCode).toBe(400);
            });
            it('Should throw an error if line 2 is missing', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Line2 is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if postal code is missing', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Postal code is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if postal code is missing', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: '',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Neighborhood is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if city is missing', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: '',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('City is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if state is missing', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: '',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('State is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if country is missing', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: '',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Country is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if line 1 is not a string', async () => {
                const input = {
                    line1: 123,
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Line1 must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if line 2 is not a string', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: 123,
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Line2 must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if line 3 is not a string', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: 123,
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Line3 must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if postal code is not a string', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: 123456,
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Postal code must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if neighborhood is not a string', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 123,
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Neighborhood must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if city is not a string', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 123,
                    state: 'Estado teste',
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('City must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if state is not a string', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 123,
                    country: 'País',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('State must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if country is not a string', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 123,
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('Country must be a string');
                expect(result.statusCode).toBe(400);
            });

            it('Should create a new user address', async () => {
                const input = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'Brasil',
                };

                const result = await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);
                const inputUserInfo = {
                    document: documentUser1,
                };

                const userInfo = await request(app)
                    .get('/app-user/info')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(inputUserInfo);
                expect(result.statusCode).toBe(201);
                expect(result.body.line1).toEqual(input.line1);
                expect(result.body.line2).toEqual(input.line2);
                expect(result.body.line3).toEqual(input.line3);
                expect(result.body.postal_code).toEqual(input.postal_code);
                expect(result.body.neighborhood).toEqual(input.neighborhood);
                expect(result.body.city).toEqual(input.city);
                expect(result.body.state).toEqual(input.state);
                expect(result.body.country).toEqual(input.country);
                expect(result.body.uuid).toEqual(userInfo.body.address_uuid);
            });
        });

        describe('Get User address', () => {
            it('Should throw an error if user document is missing', async () => {
                const input = {
                    document: '',
                };
                const result = await request(app)
                    .get('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe('User document is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if user cannot be found by document', async () => {
                const input = {
                    document: '321564894518',
                };
                const result = await request(app)
                    .get('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(input);

                expect(result.body.error).toBe(
                    'Unable to find user by document'
                );
                expect(result.statusCode).toBe(404);
            });
            it('Should throw an error if address does not exist', async () => {
                const inputOtherUser: InputCreateAppUserDTO = {
                    user_info_uuid: null,
                    document: '630.996.530-12',
                    email: 'email-new@email.com',
                    password: 'senha123',
                    is_active: true,
                };

                const inputLoginUser = {
                    document: inputOtherUser.document,
                    password: inputOtherUser.password,
                };

                const inputCreateUserInfo: InputCreateUserInfoDTO = {
                    business_info_uuid: null,
                    address_uuid: null,
                    document: '630.996.530-12',
                    document2: null,
                    document3: null,
                    full_name: 'User Full Name',
                    display_name: null,
                    internal_company_code: null,
                    gender: 'Male',
                    date_of_birth: '15/08/1998',
                    salary: null,
                    phone: null,
                    email: 'email-new@email.com',
                    company_owner: false,
                    status: null,
                    function: null,
                    recommendation_code: null,
                    is_authenticated: false,
                    marital_status: null,
                    dependents_quantity: 1,
                    user_document_validation_uuid: null,
                    user_id: null,
                };

                const inputGetUserAddress = {
                    document: inputCreateUserInfo.document,
                };

                //create new User
                const otherUser = await request(app)
                    .post('/app-user')
                    .send(inputOtherUser);
                //login user
                const loginUser = await request(app)
                    .post('/login-app-user')
                    .send(inputLoginUser);
                const newuserToken1 = loginUser.body.token;

                //create user info
                await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${newuserToken1}`)
                    .send(inputCreateUserInfo);
                //find address
                const result = await request(app)
                    .get('/app-user/address')
                    .set('Authorization', `Bearer ${newuserToken1}`)
                    .send(inputGetUserAddress);

                expect(result.body.error).toBe('Unable to find user address');
                expect(result.statusCode).toBe(404);
            });

            it('Should return user Address', async () => {
                const inputUserAddress = {
                    document: documentUser1,
                };

                const result = await request(app)
                    .get('/app-user/address')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .send(inputUserAddress);

                expect(result.statusCode).toBe(200);
                expect(result.body.line1).toBe('Rua teste');
                expect(result.body.line2).toBe('41B');
                expect(result.body.line3).toBeFalsy();
                expect(result.body.postal_code).toBe('02457-458');
                expect(result.body.neighborhood).toBe('Bairro Teste');
                expect(result.body.city).toBe('Cidade teste');
                expect(result.body.state).toBe('Estado teste');
                expect(result.body.country).toBe('Brasil');
            });
        });

        describe('Update user address', () => {
            it('Should throw an error if user info is not found', async () => {
                const inputAppUser: InputCreateAppUserDTO = {
                    user_info_uuid: null,
                    document: '777.690.850-98',
                    email: 'email-test2@email.com',
                    password: 'senha123',
                    is_active: true,
                };

                const inputLoginUser = {
                    document: inputAppUser.document,
                    password: inputAppUser.password,
                };

                const inputAddress: InputUpdateAppUserAddressDTO = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                    user_uuid: new Uuid('8c47d070-d708-4eb3-a981-f5fb69184c74'),
                };

                //create appuser
                await request(app).post('/app-user').send(inputAppUser);

                //login user
                const token = await request(app)
                    .post('/login-app-user')
                    .send(inputLoginUser);
                userToken2 = token.body.token;

                const result = await request(app)
                    .put('/app-user/address')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputAddress);

                expect(result.body.error).toBe('User info not found');
                expect(result.statusCode).toBe(404);
            });

            it('Should throw an error if address FK is null', async () => {
                const inputCreateUserInfo: InputCreateUserInfoDTO = {
                    business_info_uuid: null,
                    address_uuid: null,
                    document: '630.996.530-12',
                    document2: null,
                    document3: null,
                    full_name: 'User Full Name',
                    display_name: null,
                    internal_company_code: null,
                    gender: 'Male',
                    date_of_birth: '15/08/1998',
                    salary: null,
                    phone: null,
                    email: 'email-new@email.com',
                    company_owner: false,
                    status: null,
                    function: null,
                    recommendation_code: null,
                    is_authenticated: false,
                    marital_status: null,
                    dependents_quantity: 1,
                    user_document_validation_uuid: null,
                    user_id: null,
                };
                const inputAddress: InputUpdateAppUserAddressDTO = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                    user_uuid: new Uuid('8c47d070-d708-4eb3-a981-f5fb69184c74'),
                };

                //create user info
                await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputCreateUserInfo);

                const result = await request(app)
                    .put('/app-user/address')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputAddress);

                expect(result.body.error).toBe('User address not found');
                expect(result.statusCode).toBe(404);
            });

            it('Should throw an error if user address is not found', async () => {
                const inputCreateUserInfo: InputCreateUserInfoDTO = {
                    business_info_uuid: null,
                    address_uuid: new Uuid(
                        '8c47d070-d708-4eb3-a981-f5fb69184c74'
                    ),
                    document: '630.996.530-12',
                    document2: null,
                    document3: null,
                    full_name: 'User Full Name',
                    display_name: null,
                    internal_company_code: null,
                    gender: 'Male',
                    date_of_birth: '15/08/1998',
                    salary: null,
                    phone: null,
                    email: 'email-new@email.com',
                    company_owner: false,
                    status: null,
                    function: null,
                    recommendation_code: null,
                    is_authenticated: false,
                    marital_status: null,
                    dependents_quantity: 1,
                    user_document_validation_uuid: null,
                    user_id: null,
                };
                const inputAddress: InputUpdateAppUserAddressDTO = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                    user_uuid: new Uuid('8c47d070-d708-4eb3-a981-f5fb69184c74'),
                };

                //create user info
                await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputCreateUserInfo);

                const result = await request(app)
                    .put('/app-user/address')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputAddress);

                expect(result.body.error).toBe('User address not found');
                expect(result.statusCode).toBe(404);
            });

            it('Should create user address', async () => {
                const inputAppUser: InputCreateAppUserDTO = {
                    user_info_uuid: null,
                    document: '777.690.850-98',
                    email: 'email-test2@email.com',
                    password: 'senha123',
                    is_active: true,
                };

                const inputCreateUserInfo: InputCreateUserInfoDTO = {
                    business_info_uuid: null,
                    address_uuid: new Uuid(
                        '8c47d070-d708-4eb3-a981-f5fb69184c74'
                    ),
                    document: '630.996.530-12',
                    document2: null,
                    document3: null,
                    full_name: 'User Full Name',
                    display_name: null,
                    internal_company_code: null,
                    gender: 'Male',
                    date_of_birth: '15/08/1998',
                    salary: null,
                    phone: null,
                    email: 'email-new@email.com',
                    company_owner: false,
                    status: null,
                    function: null,
                    recommendation_code: null,
                    is_authenticated: false,
                    marital_status: null,
                    dependents_quantity: 1,
                    user_document_validation_uuid: null,
                    user_id: null,
                };

                const inputCreateAddress = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'Brasil',
                };

                await request(app)
                    .post('/app-user/address')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputCreateAddress);

                const inputUpdateAddress: InputUpdateAppUserAddressDTO = {
                    line1: 'Rua teste',
                    line2: '41B',
                    line3: '',
                    postal_code: '02457-458',
                    neighborhood: 'Bairro Teste Novo',
                    city: 'Cidade teste',
                    state: 'Estado teste',
                    country: 'País',
                    user_uuid: new Uuid('8c47d070-d708-4eb3-a981-f5fb69184c74'),
                };

                //create appuser
                await request(app).post('/app-user').send(inputAppUser);

                //create user info
                await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputCreateUserInfo);

                const result = await request(app)
                    .put('/app-user/address')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputUpdateAddress);

                expect(result.body.line1).toEqual(inputUpdateAddress.line1);
                expect(result.body.line2).toEqual(inputUpdateAddress.line2);
                expect(result.body.line3).toEqual(inputUpdateAddress.line3);
                expect(result.body.postal_code).toEqual(
                    inputUpdateAddress.postal_code
                );
                expect(result.body.neighborhood).toEqual(
                    inputUpdateAddress.neighborhood
                );
                expect(result.body.city).toEqual(inputUpdateAddress.city);
                expect(result.body.state).toEqual(inputUpdateAddress.state);
                expect(result.body.country).toEqual(inputUpdateAddress.country);
            });
        });
    });
        const testFilesDir = path.join(projectRoot, 'test-files');
        const dummyPngPath = path.join(testFilesDir, 'dummy.png');

    describe('E2E tests Document Validation', () => {
        // Conteúdo de um PNG 1x1 pixel transparente para criar arquivos dummy
        const dummyPngBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            'base64'
        );
        beforeAll(async () => {
            // //create user2
            // const createUser2 = await request(app).post('/app-user').send(inputNewAppUser2);
            // expect(createUser2.statusCode).toBe(201)
            //login user 2
            const token = await request(app)
                .post('/login-app-user')
                .send(authenticateAppUser2);
            userToken2 = token.body.token;

            fs.writeFileSync(dummyPngPath, new Uint8Array(dummyPngBuffer));
        });

        // --- Teardown para remover o arquivo dummy ---
        afterAll(async () => {
            // Remove apenas o arquivo dummy PNG criado
            if (fs.existsSync(dummyPngPath)) {
                fs.rmSync(dummyPngPath, { force: true });
            }

            const tempFakeStorageInstance = new FakeStorage('test-uploads-fake'); 
        
        // Chama o método cleanAll para remover o diretório de uploads de teste.
            await tempFakeStorageInstance.cleanAll();
            console.log("[TEST_CLEANUP] FakeStorage temporary uploads directory and internal state cleaned.");
        });

        describe('Create document validation', () => {
            it('Should throw an error if no document is sent', async () => {
                const result = await request(app)
                    .post('/app-user/document-validation/e2e-test')
                    .set('Authorization', `Bearer ${userToken2}`);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe(
                    'No documents to be registered. At least one file is required.'
                );
            });
            it('Should throw an error if user info does not exist', async () => {
                const result = await request(app)
                    .post('/app-user/document-validation/e2e-test')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .attach('selfie', dummyPngPath, 'selfie.png') // Substitui selfie_base64
                    .attach(
                        'document_front',
                        dummyPngPath,
                        'document_front.png'
                    ) // Substitui document_front_base64
                    .attach('document_back', dummyPngPath, 'document_back.png') // Substitui document_back_base64
                    .attach(
                        'document_selfie',
                        dummyPngPath,
                        'document_selfie.png'
                    ); // Substitui document_selfie_base64

                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('User info not found');
            });

            it('Should register one document', async () => {
                //create user info 2
                const inputUserInfo2: any = {
                    document: authenticateAppUser2.document,
                    full_name: 'User Full Name',
                    gender: 'Male',
                    date_of_birth: '15/08/1998',
                    email: 'email@email.com',
                    dependents_quantity: 1,
                };

                const createUserInfo2 = await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(inputUserInfo2);
                expect(createUserInfo2.statusCode).toBe(201);
                const result = await request(app)
                    .post('/app-user/document-validation/e2e-test')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .attach('selfie', dummyPngPath, 'selfie.png')
                    .attach(
                        'document_front',
                        dummyPngPath,
                        'document_front.png'
                    );

                expect(result.statusCode).toBe(201);
                expect(result.body.uuid).toBeDefined();
                
                // 1. URLs: Devem corresponder ao formato do FakeStorage.
                const fakeUrlRegex =
                    /^http:\/\/localhost:9000\/fake-bucket\/user-documents\/[a-f0-9-]+\/[a-f0-9-]+\.(png|bin)$/;

                expect(result.body.document_front_url).toMatch(fakeUrlRegex);
                expect(result.body.selfie_url).toMatch(fakeUrlRegex);

                // 2. Status: Devem ser 'under_analysis' conforme definido no usecase.
                expect(result.body.document_front_status).toBe(
                    'under_analysis'
                );
                expect(result.body.document_back_status).toBe(
                    'pending_to_send'
                );
                expect(result.body.selfie_status).toBe('under_analysis');
                expect(result.body.document_selfie_status).toBe(
                    'pending_to_send'
                );

                const documentUser2 = {
                    document: authenticateAppUser2.document
                        .replace('.', '')
                        .replace('.', '')
                        .replace('-', ''),
                };
                // 3. Verificações no banco de dados
                const updatedUserInfo = await prismaClient.userInfo.findUnique({
                    where: { document: documentUser2.document }, // Use o UUID correto para o userInfo do userToken3
                });
                expect(updatedUserInfo?.user_document_validation_uuid).toBe(
                    result.body.uuid.uuid
                );
                expect(updatedUserInfo.status).not.toBe('active');
            });

            it('Should register all the others documents', async () => {
                                               
                const result = await request(app)
                    .post('/app-user/document-validation/e2e-test')
                    .set('Authorization', `Bearer ${userToken2}`)
                    .attach('document_back', dummyPngPath, 'document_back.png')
                    .attach('document_selfie', dummyPngPath, 'document_selfie.png')
                expect(result.statusCode).toBe(201)

                const documentUser2 = {
                    document: authenticateAppUser2.document
                        .replace('.', '')
                        .replace('.', '')
                        .replace('-', ''),
                };
                // 3. Verificações no banco de dados
                const updatedUserInfo = await prismaClient.userInfo.findUnique({
                    where: { document: documentUser2.document }, // Use o UUID correto para o userInfo do userToken3
                });
                const userDocuments = await prismaClient.userDocumentValidation.findUnique({
                    where:{
                        uuid: updatedUserInfo.user_document_validation_uuid
                    }
                })
                expect(userDocuments).toBeDefined()
                expect(userDocuments.document_back_status).toBe("under_analysis")
                expect(userDocuments.document_front_status).toBe("under_analysis")
                expect(userDocuments.document_selfie_status).toBe("under_analysis")
                expect(userDocuments.selfie_status).toBe("under_analysis")
               
                expect(updatedUserInfo.status).toBe("active")
            });

        });
    });

    describe('E2E tests User Status by document - Not authenticated', () => {
                // Conteúdo de um PNG 1x1 pixel transparente para criar arquivos dummy
        const dummyPngBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            'base64'
        );
        beforeAll(async () => {
            fs.writeFileSync(dummyPngPath, new Uint8Array(dummyPngBuffer));
        });

        // --- Teardown para remover o arquivo dummy ---
        afterAll(async () => {
            // Remove apenas o arquivo dummy PNG criado
            if (fs.existsSync(dummyPngPath)) {
                fs.rmSync(dummyPngPath, { force: true });
            }
            const tempFakeStorageInstance = new FakeStorage('test-uploads-fake'); 
        
        // Chama o método cleanAll para remover o diretório de uploads de teste.
            await tempFakeStorageInstance.cleanAll();
            console.log("[TEST_CLEANUP] FakeStorage temporary uploads directory and internal state cleaned.");

        });

        it('Should return user with only user auth registered', async () => {
            //create app user
            const createAppUser3 = await request(app).post('/app-user').send(inputNewAppUser3);
            expect(createAppUser3.statusCode).toBe(201)
            const result = await request(app).get(
                `/app-user/document/${inputNewAppUser3.document}`
            );
            expect(result.body.status).toBeFalsy();
            expect(result.body.UserAuth).toBeTruthy();
            expect(result.body.UserInfo).toBeFalsy();
            expect(result.body.Address).toBeFalsy();
            expect(result.body.UserValidation.document_front_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.document_back_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.document_selfie_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.selfie_status).toBe(
                'pending_to_send'
            );
        });

        it('Should return more user details', async () => {

            const result = await request(app).get(
                `/app-user/document/${inputNewAppUser2.document}`
            );

            expect(result.body.status).toBeFalsy();
            expect(result.body.UserAuth).toBeTruthy();
            expect(result.body.UserInfo).toBeTruthy();
            expect(result.body.Address).toBeFalsy();
            expect(result.body.UserValidation.document_front_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.document_back_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.document_selfie_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.selfie_status).toBe(
                'pending_to_send'
            );
        });

        it('Should return user with user auth, user info, and address registered', async () => {
            const result = await request(app).get(
                `/app-user/document/${inputNewAppUser1.document}`
            );

            expect(result.body.status).toBeFalsy();
            expect(result.body.UserAuth).toBeTruthy();
            expect(result.body.UserInfo).toBeTruthy();
            expect(result.body.Address).toBeTruthy();
            expect(result.body.UserValidation.document_front_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.document_back_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.document_selfie_status).toBe(
                'pending_to_send'
            );
            expect(result.body.UserValidation.selfie_status).toBe(
                'pending_to_send'
            );
        });

        it('Should return a user with full status', async () => {
            
            const registerAllDocuments = await request(app)
                    .post('/app-user/document-validation/e2e-test')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .attach('document_back', dummyPngPath, 'document_back.png')
                    .attach('document_selfie', dummyPngPath, 'document_selfie.png')
                    .attach('selfie', dummyPngPath, 'selfie.png')
                    .attach('document_front', dummyPngPath, 'document_front.png');
            
            expect(registerAllDocuments.statusCode).toBe(201)
            

            const result = await request(app).get(
                `/app-user/document/${inputNewAppUser1.document}`
            );
            expect(result.body.status).toBeTruthy();
            expect(result.body.UserAuth).toBeTruthy();
            expect(result.body.UserInfo).toBeTruthy();
            expect(result.body.Address).toBeTruthy();
            expect(result.body.UserValidation.document_front_status).toBe(
                'under_analysis'
            );
            expect(result.body.UserValidation.document_back_status).toBe(
                'under_analysis'
            );
            expect(result.body.UserValidation.document_selfie_status).toBe(
                'under_analysis'
            );
            expect(result.body.UserValidation.selfie_status).toBe(
                'under_analysis'
            );
        });
    });

    describe('E2E tests Upload csv to register users by correct', () => {
        beforeAll(async () => {
            //********************* CREATE APP USER TO BE AN EMPLOYEE FROM BUSINESS_INFO_UUID *********************

            const onlyUserAuthInput: InputCreateAppUserDTO = {
                user_info_uuid: null,
                document: '350.707.670-54', //make sure this document is in the csv test file
                email: 'only_auth@email.com',
                password: 'senha123',
                is_active: true,
            };
            const createEmployeeAuth1 = await request(app)
                .post('/app-user')
                .send(onlyUserAuthInput);
            expect(createEmployeeAuth1.statusCode).toBe(201);

            //********************* AUTHENTICATE EMPLOYEE *********************
            const input = {
                document: onlyUserAuthInput.document,
                password: onlyUserAuthInput.password,
            };
            const userAuthResponse = await request(app)
                .post('/login-app-user')
                .send(input);
            expect(userAuthResponse.statusCode).toBe(200);
            employeeAuthToken = userAuthResponse.body.token;

            //********************* ACTIVATE BUSINESS *********************
            const inputToActivate = {
                address_uuid: business_address_uuid,
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
            const activateBusiness1 = await request(app)
                .put('/business/info/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .query(query)
                .send(inputToActivate);
            expect(activateBusiness1.statusCode).toBe(200);

            //********************* CREATE BUSINESS ADMIN 1 *********************
            const inputEmployer = {
                password: '123456',
                business_info_uuid: employer_info_uuid,
                email: 'empregador@empregador.com',
                name: 'Nome do admin',
            };
            const createEmployer = await request(app)
                .post('/business/admin/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send(inputEmployer);
            employer_user_uuid = createEmployer.body.uuid;
            expect(createEmployer.statusCode).toBe(201);

            //********************* AUTHENTICATE BUSINESS ADMIN 1 ********************
            const authInput = {
                business_document: 'empregador',
                password: '123456',
                email: 'empregador@empregador.com',
                name: 'nome do employer',
            };

            const auth = await request(app)
                .post('/business/admin/login')
                .send(authInput);
            expect(auth.statusCode).toBe(200);
            employer_user_token = auth.body.token;
        });
        describe('E2E tests Upload csv BEFORE business has active items', () => {
            it('Should throw an error if file is not sent', async () => {
                const query = {
                    business_info_uuid: employer_info_uuid,
                };

                const result = await request(app)
                    .post('/app-users-by-correct')
                    .query(query)
                    .set('Authorization', `Bearer ${correctAdminToken}`);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Error upload file');
            });
            it('Should throw an error if business id is missing', async () => {
                const csvFilePath = path.join(
                    __dirname,
                    '../../../test-files/ideal-model.csv'
                );

                const query = {
                    business_info_id: '',
                };

                const result = await request(app)
                    .post('/app-users-by-correct')
                    .query(query)
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .attach('file', csvFilePath); // 'file' deve corresponder ao nome do campo esperado no endpoint
                // Verifique o status da resposta e outras condições esperadas
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business Id is required');
            });
            it('Should throw an error if business is not found', async () => {
                const csvFilePath = path.join(
                    __dirname,
                    '../../../test-files/ideal-model.csv'
                );

                const query = {
                    business_info_uuid: '1',
                };

                const result = await request(app)
                    .post('/app-users-by-correct')
                    .query(query)
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .attach('file', csvFilePath); // 'file' deve corresponder ao nome do campo esperado no endpoint

                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Business not found');
            });

            it('Should throw an error if business is not active', async () => {
                const csvFilePath = path.join(
                    __dirname,
                    '../../../test-files/ideal-model.csv'
                );

                const query = {
                    business_info_uuid: employer_info_uuid2,
                };

                const result = await request(app)
                    .post('/app-users-by-correct')
                    .query(query)
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .attach('file', csvFilePath); // 'file' deve corresponder ao nome do campo esperado no endpoint

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Business must be activated');
            });

            it('Should throw an error if employer has no active items', async () => {
                const csvFilePath = path.join(
                    __dirname,
                    '../../../test-files/ideal-model.csv'
                );

                const query = {
                    business_info_uuid: employer_info_uuid,
                };

                const result = await request(app)
                    .post('/app-users-by-correct')
                    .query(query)
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .attach('file', csvFilePath); // 'file' deve corresponder ao nome do campo esperado no endpoint
                expect(result.statusCode).toBe(404);
                expect(result.body.error).toBe('Employer has no active items');
            });
        });

        describe('E2E tests Upload csv AFTER business has active items', () => {
            beforeAll(async () => {
                //*********************CREATE EMPLOYER ITEM DETAILS **********************/
                //it must be created before using csv
                const employerItem1 = {
                    item_uuid: benefit1_uuid,
                    business_info_uuid: employer_info_uuid,
                    cycle_end_day: 1,
                    value: 200,
                };
                const employerItem2 = {
                    item_uuid: benefit2_uuid,
                    business_info_uuid: employer_info_uuid,
                    cycle_end_day: 1,
                    value: 300,
                };

                const employerItem3 = {
                    item_uuid: benefit3_uuid,
                    business_info_uuid: employer_info_uuid,
                    cycle_end_day: 1,
                    value: 350,
                };

                const resultItem1 = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(employerItem1);

                const resultItem2 = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(employerItem2);

                const resultItem3 = await request(app)
                    .post('/business/item/details/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(employerItem3);

                expect(resultItem1.statusCode).toBe(201);
                expect(resultItem2.statusCode).toBe(201);
                expect(resultItem3.statusCode).toBe(201);
            });

            it('Should register employees from csv', async () => {
                const csvFilePath = path.join(
                    __dirname,
                    '../../../test-files/ideal-model.csv'
                );

                const query = {
                    business_info_uuid: employer_info_uuid,
                };

                //************ REGISTER EMPLOYEES FROM CSV HERE *************/
                const result = await request(app)
                    .post('/app-users-by-correct')
                    .query(query)
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .attach('file', csvFilePath); //
                expect(result.statusCode).toBe(201);
                expect(result.body.usersRegistered.length).toBe(15);

                //************ GET EMPLOYEE THAT HAD ONLY AUTH DETAILS *************/
                const onlyUserAuthDetails = await request(app)
                    .get('/app-user')
                    .set('Authorization', `Bearer ${employeeAuthToken}`);
                expect(onlyUserAuthDetails.statusCode).toBe(200);

                //************ IF EMPLOYEES WERE CREATED AS EXPECTED, THIS REQUEST WILL BE SUCCESSFUL *************/
                const findUser = await request(app)
                    .get('/app-user/info')
                    .set('Authorization', `Bearer ${employeeAuthToken}`);

                expect(findUser.statusCode).toBe(200);
                expect(
                    onlyUserAuthDetails.body.UserAuthDetails.user_info_uuid
                ).toBe(findUser.body.uuid);
                expect(findUser.body.is_employee).toBeTruthy();

                //************ SAVING EMPLOYEE UUID AND DOCUMENT *************/
                employee_user_info = findUser.body.uuid;
                employee_user_document = findUser.body.document;

                //************ GET LIST OF EMPLOYEES TO CONFIRM *************/
                const employeesList = await request(app)
                    .get('/business-admin/app-users')
                    .set('Authorization', `Bearer ${employer_user_token}`);

                expect(employeesList.body.length).toBe(15);
                for (const employee of employeesList.body) {
                    const input: any = {
                        userInfoUuid: employee.user_info_uuid,
                    };

                    //HERE IS EXPECT TO BE EMPTY ARRAY, BECAUSE ALL ITEMS CREATED ARE INACTIVE
                    const userItems = await request(app)
                        .get('/user-item/all/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(input);
                    expect(userItems.statusCode).toBe(200);
                    expect(userItems.body.length).toBe(0);
                    expect(employee.is_employee).toBeTruthy();
                    expect(
                        result.body.usersRegistered.some(
                            (document: any) => document === employee.document
                        )
                    ).toBeTruthy();
                    expect(employee.business_info_uuid).toBe(
                        employer_info_uuid
                    );
                }
            });
        });
    });

    describe('E2E tests create already registered user by correct', () => {
        it('Should register an user auth', async () => {
            //IN THIS TEST USER INFO ALREADY EXISTS, BUT NOT USER AUTH
            //So WE ARE GOING TO CREATE USER AUTH WHEN USER INFO ALREADY EXISTS
            //IT IS EXPECTED THAT SYNCHRONIZES AUTOMATICALLY
            //Create an userauth
            const input = {
                email: 'alreadyregistered@email.com',
                password: 'senha123',
                document: '40650089057', //Este CPF está no modelo de arquivo csv. Utilizar ele indica que este cpf já possui userInfo registrado pela Correct
            };
            await request(app).post('/app-user').send(input);

            //authenticate user auth details
            const authInput = {
                document: input.document,
                password: input.password,
            };
            const userAuthResponse = await request(app)
                .post('/login-app-user')
                .send(authInput);
            employeeAuthToken2 = userAuthResponse.body.token;

            //get userAuth details
            const userAuthDetails = await request(app)
                .get('/app-user')
                .set('Authorization', `Bearer ${employeeAuthToken2}`);

            //get userInfo
            const userInfoDetails = await request(app)
                .get('/app-user/info')
                .set('Authorization', `Bearer ${employeeAuthToken2}`)
                .send(input);
            employee2_user_info = userInfoDetails.body.uuid;
            expect(userAuthDetails.body.status).toBeFalsy();
            expect(userAuthDetails.body.UserAuthDetails.user_info_uuid).toBe(
                userInfoDetails.body.uuid
            );
            expect(userAuthDetails.body.UserInfo).toBeTruthy();
            expect(userAuthDetails.body.UserAddress).toBeFalsy();
            expect(userAuthDetails.body.UserValidation).toBeFalsy();
            expect(userInfoDetails.body.is_employee).toBe(true);
            expect(userInfoDetails.body.Employee[0].business_info_uuid).toBe(
                employer_info_uuid
            );
        });
    });
    describe('Employee By Employer', () => {
        beforeAll(async () => {
            //activate employer 2
            const inputToActivate = {
                address_uuid: business_address_uuid,
                fantasy_name: 'Empresa novo nome 2',
                document: 'empregador2',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'empregador2@empregador.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'empregador',
                status: 'active',
            };
            const queryActivate = {
                business_info_uuid: employer_info_uuid2,
            };
            const activateEmployerr2 = await request(app)
                .put('/business/info/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .query(queryActivate)
                .send(inputToActivate);
            expect(activateEmployerr2.statusCode).toBe(200);

            //create employer user 2
            const inputEmployer2 = {
                password: '123456',
                business_info_uuid: employer_info_uuid2,
                email: 'empregador2@empregador.com',
                name: 'Nome do admin 2',
            };
            const createEmployer2 = await request(app)
                .post('/business/admin/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send(inputEmployer2);
            employer_user_uuid2 = createEmployer2.body.uuid;
            expect(createEmployer2.statusCode).toBe(201);

            //authenticate employer user 2
            const authInput2 = {
                business_document: 'empregador2',
                password: '123456',
                email: 'empregador2@empregador.com',
            };

            const auth = await request(app)
                .post('/business/admin/login')
                .send(authInput2);
            expect(auth.statusCode).toBe(200);
            employer_user_token2 = auth.body.token;

            //activate business 3
            const inputToActivate3 = {
                address_uuid: business_address_uuid,
                fantasy_name: 'Empresa novo nome 3',
                document: 'empregador3',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'empregador3@empregador.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'empregador',
                status: 'active',
            };
            const query = {
                business_info_uuid: employer_info_uuid3,
            };
            const activateBusiness3 = await request(app)
                .put('/business/info/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .query(query)
                .send(inputToActivate3);
            expect(activateBusiness3.statusCode).toBe(200);

            //create employer user 3
            const inputEmployer3 = {
                password: '123456',
                business_info_uuid: employer_info_uuid,
                email: 'empregador3@empregador.com',
                name: 'Nome do admin 3',
            };
            const createEmployer3 = await request(app)
                .post('/business/admin/correct')
                .set('Authorization', `Bearer ${correctAdminToken}`)
                .send(inputEmployer3);
            employer_user_uuid3 = createEmployer3.body.uuid;
            expect(createEmployer3.statusCode).toBe(201);

            //authenticate employer user 3
            const authInput3 = {
                business_document: 'empregador3',
                password: '123456',
                email: 'empregador3@empregador.com',
            };

            const auth3 = await request(app)
                .post('/business/admin/login')
                .send(authInput3);
            expect(auth3.statusCode).toBe(200);
            employer_user_token3 = auth3.body.token;
        });
        describe('Get All employees by employer', () => {
            beforeAll(async () => {
                //create non employee user auth
                const inputNonEmployee: any = {
                    user_info_uuid: null,
                    document: '000.458.150-46',
                    email: 'non_employee@email.com',
                    password: 'senha123',
                };
                const non_employee = await request(app)
                    .post('/app-user')
                    .send(inputNonEmployee);
                expect(non_employee.statusCode).toBe(201);

                const authNonEmployeeInput = {
                    document: inputNonEmployee.document,
                    password: inputNonEmployee.password,
                };

                //authenticate non employee user
                const auth_non_employe = await request(app)
                    .post('/login-app-user')
                    .send(authNonEmployeeInput);
                expect(auth_non_employe.statusCode).toBe(200);
                non_employee_token = auth_non_employe.body.token;

                const nonEmployeeUserInput: any = {
                    full_name: 'User Full Name',
                    gender: 'Male',
                    date_of_birth: '15/08/1998',
                    dependents_quantity: 1,
                };

                const userInfoNonEmployee = await request(app)
                    .post('/app-user/info')
                    .set('Authorization', `Bearer ${non_employee_token}`)
                    .send(nonEmployeeUserInput);
                expect(userInfoNonEmployee.statusCode).toBe(201);

                const nonEmployeeUserDetails = await request(app)
                    .get('/app-user')
                    .set('Authorization', `Bearer ${non_employee_token}`);

                non_employee_user_info =
                    nonEmployeeUserDetails.body.UserAuthDetails.user_info_uuid;
                non_employee_user_document =
                    nonEmployeeUserDetails.body.UserAuthDetails.document;
                expect(nonEmployeeUserDetails.statusCode).toBe(200);
            });

            it('Should return a list of employees by employer', async () => {
                const result = await request(app)
                    .get('/business-admin/app-users')
                    .set('Authorization', `Bearer ${employer_user_token}`);
                expect(result.body.length).toEqual(15);
                for (const employee of result.body) {
                    list_employees1_info_uuid.push(employee.user_info_uuid);
                    expect(employee.business_info_uuid === employer_info_uuid);
                }
            });

            it('Should return a empty list of employees by employer', async () => {
                const result = await request(app)
                    .get('/business-admin/app-users')
                    .set('Authorization', `Bearer ${employer_user_token3}`);
                expect(result.body.length).toBe(0);
            });
        });

        describe('Get single employee by employer', () => {
            it('Should throw an error if employee uuid is missing', async () => {
                const result = await request(app)
                    .get('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token}`);
                expect(result.body.error).toBe('Employee document is required');
                expect(result.statusCode).toBe(400);
            });

            it('Should throw an error if employee is not found', async () => {
                const result = await request(app)
                    .get('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .query({ employeeDocument: randomUUID() });
                expect(result.body.error).toBe('Employee not found');
                expect(result.statusCode).toBe(404);
            });

            it('Should throw an error if user is not an employee', async () => {
                const result = await request(app)
                    .get('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token2}`)
                    .query({ employeeDocument: non_employee_user_document });

                expect(result.body.error).toBe('Unauthorized access');
                expect(result.statusCode).toBe(401);
            });

            it('Should return employee details', async () => {
                const result = await request(app)
                    .get('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .query({ employeeDocument: employee_user_document });
                expect(result.statusCode).toBe(200);
                expect(result.body.uuid).toBe(employee_user_info);
                expect(result.body.business_info_uuid).toBe(employer_info_uuid);
                expect(result.body.document).toBe('35070767054');
            });
        });

        describe('Register single employee by employer', () => {
            let employee_token: string;
            let employee_only_auth_token: string;
            beforeAll(async () => {
                //********************* HERE WE NEED TO CREATE AN USER THAT ONLY HAS USER AUTH. USER INFO WILL BE CREATED BY A COMPANY *********************
                const onlyUserAuthInput = {
                    document: '800.604.060-54', //make sure this document is in the csv test file
                    email: 'only_auth_new_employee@email.com',
                    password: 'senha123',
                };

                const createEmployeeAuth = await request(app)
                    .post('/app-user')
                    .send(onlyUserAuthInput);
                expect(createEmployeeAuth.statusCode).toBe(201);

                //********************* AUTHENTICATE EMPLOYEE *********************
                const input = {
                    document: onlyUserAuthInput.document,
                    password: onlyUserAuthInput.password,
                };
                const userAuthResponse = await request(app)
                    .post('/login-app-user')
                    .send(input);
                expect(userAuthResponse.statusCode).toBe(200);
                employee_only_auth_token = userAuthResponse.body.token;
            });
            it('Should throw an error if document is missing', async () => {
                const result = await request(app)
                    .post('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token}`);

                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Document is required');
            });

            it('Should register a new employee', async () => {
                //********************* THIS EMPLOYEE DOES NOT HAVE ANY REGISTERS ANYWHERE *********************
                const input = {
                    document: '868.228.050-79',
                    full_name: 'João Alves da Silva',
                    internal_company_code: '51591348',
                    gender: 'Masculino',
                    function: 'Corretor',
                    date_of_birth: '14/02/84',
                    dependents_quantity: 0,
                };

                const result = await request(app)
                    .post('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(input);

                //********************* CREATE APP USER AUTH FOR ABOVE EMPLOYEE *********************

                const onlyUserAuthInput = {
                    document: input.document, //make sure this document is in the csv test file
                    email: 'employee@email.com',
                    password: 'senha123',
                };
                const createEmployeeAuth1 = await request(app)
                    .post('/app-user')
                    .send(onlyUserAuthInput);
                expect(createEmployeeAuth1.statusCode).toBe(201);

                //********************* AUTHENTICATE EMPLOYEE *********************
                const inputAuth = {
                    document: onlyUserAuthInput.document,
                    password: onlyUserAuthInput.password,
                };
                const userAuthResponse = await request(app)
                    .post('/login-app-user')
                    .send(inputAuth);
                expect(userAuthResponse.statusCode).toBe(200);

                employee_token = userAuthResponse.body.token;

                //************ IF EMPLOYEE WERE CREATED AS EXPECTED, THIS REQUEST WILL BE SUCCESSFUL *************/
                const findUser = await request(app)
                    .get('/app-user/info')
                    .set('Authorization', `Bearer ${employee_token}`);
                expect(findUser.statusCode).toBe(200);
                expect(findUser.body.Employee.length).toBe(1);
                expect(findUser.body.Employee[0].business_info_uuid).toBe(
                    employer_info_uuid
                );

                //Finding employee by employer
                const employeeCreated = await request(app)
                    .get('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .query({ employeeDocument: input.document });

                //CHECK EMPLOYEE ITEMS
                const userItems = await request(app)
                    .get('/user-item/all/employer')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .query({ userInfoUuid: employeeCreated.body.uuid });

                expect(userItems.statusCode).toBe(200);
                expect(userItems.body.length).toBe(0);
                expect(employeeCreated.statusCode).toBe(200);
                expect(result.statusCode).toBe(201);
                expect(employeeCreated.body.business_info_uuid).toBe(
                    employer_info_uuid
                );
                expect(employeeCreated.body.document).toBe('86822805079');
                expect(employeeCreated.body.full_name).toBe(input.full_name);
                expect(employeeCreated.body.internal_company_code).toBe(
                    input.internal_company_code
                );
                expect(employeeCreated.body.gender).toBe(input.gender);
                expect(employeeCreated.body.function).toBe(input.function);
                expect(employeeCreated.body.date_of_birth).toBe(
                    input.date_of_birth
                );
                expect(employeeCreated.body.dependents_quantity).toBe(
                    input.dependents_quantity
                );
                expect(employeeCreated.body.is_employee).toBe(true);
            });

            it('Should register the same employee by another employer', async () => {
                const input = {
                    document: '868.228.050-79',
                    full_name: 'João Alves da Silva',
                    internal_company_code: '51591348',
                    gender: 'Masculino',
                    function: 'Corretor',
                    date_of_birth: '14/02/84',
                    dependents_quantity: 0,
                };

                const result = await request(app)
                    .post('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token2}`)
                    .send(input);
                const employeeCreated = await request(app)
                    .get('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token2}`)
                    .query({ employeeDocument: input.document });

                //************ IF EMPLOYEE WERE CREATED AS EXPECTED, THIS REQUEST WILL BE SUCCESSFUL *************/
                const findUser = await request(app)
                    .get('/app-user/info')
                    .set('Authorization', `Bearer ${employee_token}`);
                expect(findUser.statusCode).toBe(200);
                expect(findUser.body.Employee.length).toBe(2);
                expect(findUser.body.Employee[0].business_info_uuid).toBe(
                    employer_info_uuid
                );
                expect(findUser.body.Employee[1].business_info_uuid).toBe(
                    employer_info_uuid2
                );

                commonEmployeeUserInfoUuid = employeeCreated.body.uuid;
                expect(employeeCreated.statusCode).toBe(200);
                expect(result.statusCode).toBe(201);
                expect(employeeCreated.body.business_info_uuid).toBe(
                    employer_info_uuid2
                );
                expect(employeeCreated.body.document).toBe('86822805079');
                expect(employeeCreated.body.full_name).toBe(input.full_name);
                expect(employeeCreated.body.internal_company_code).toBe(
                    input.internal_company_code
                );
                expect(employeeCreated.body.gender).toBe(input.gender);
                expect(employeeCreated.body.function).toBe(input.function);
                expect(employeeCreated.body.date_of_birth).toBe(
                    input.date_of_birth
                );
                expect(employeeCreated.body.dependents_quantity).toBe(
                    input.dependents_quantity
                );
            });

            it('Should register an employee that has only user auth', async () => {
                const input = {
                    document: '800.604.060-54', //this document must be same as created in beforeAll
                    full_name: 'João Alves da Silva',
                    internal_company_code: '516518',
                    gender: 'Masculino',
                    function: 'Corretor',
                    date_of_birth: '14/02/84',
                    dependents_quantity: 2,
                };

                const result = await request(app)
                    .post('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token2}`)
                    .send(input);
                const employeeCreated = await request(app)
                    .get('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token2}`)
                    .query({ employeeDocument: input.document });

                //************ IF EMPLOYEE WERE CREATED AS EXPECTED, THIS REQUEST WILL BE SUCCESSFUL *************/
                const findUser = await request(app)
                    .get('/app-user/info')
                    .set('Authorization', `Bearer ${employee_only_auth_token}`);
                expect(findUser.statusCode).toBe(200);
                expect(findUser.body.Employee.length).toBe(1);
                expect(findUser.body.Employee[0].business_info_uuid).toBe(
                    employer_info_uuid2
                );

                expect(employeeCreated.statusCode).toBe(200);
                expect(result.statusCode).toBe(201);
                expect(employeeCreated.body.business_info_uuid).toBe(
                    employer_info_uuid2
                );
                expect(employeeCreated.body.document).toBe('80060406054');
                expect(employeeCreated.body.full_name).toBe(input.full_name);
                expect(employeeCreated.body.internal_company_code).toBe(
                    input.internal_company_code
                );
                expect(employeeCreated.body.gender).toBe(input.gender);
                expect(employeeCreated.body.function).toBe(input.function);
                expect(employeeCreated.body.date_of_birth).toBe(
                    input.date_of_birth
                );
                expect(employeeCreated.body.dependents_quantity).toBe(
                    input.dependents_quantity
                );
            });

            it('Should throw an error if user is already an employee', async () => {
                const input = {
                    document: '868.228.050-79',
                    full_name: 'João Alves da Silva',
                    internal_company_code: '51591348',
                    gender: 'Masculino',
                    function: 'Corretor',
                    date_of_birth: '14/02/84',
                    dependents_quantity: 0,
                };
                const result = await request(app)
                    .post('/app-user/business-admin')
                    .set('Authorization', `Bearer ${employer_user_token2}`)
                    .send(input);
                expect(result.statusCode).toBe(409);
                expect(result.body.error).toBe(
                    'User with this document already exists for the provided business'
                );
            });
        });
    });
    let pre_paid_user_item_uuid: string; //only employee info 1 has access to this
    let post_paid_user_item_uuid: string;
    let defaultGroupUuid: string;
    let diretoriaGroupUuid: string;
    let valeAlimentacaoEmployerItemUuid: string;
    let funcionarioParaCriarUuid: string;
    let funcionarioParaAtivarUuid: string;

    describe('E2E tests User Items', () => {
        describe('E2E test User items by Employer', () => {
            describe('E2E Activate User Item by Employer (New Logic)', () => {
                // Preparamos o cenário antes de todos os testes deste bloco
                beforeAll(async () => {
                    const employeeItems =
                        await prismaClient.userItem.findMany();
                    console.log(
                        'Verificando a existência de benefícios duplicados...'
                    );

                    // Usamos um objeto para rastrear as combinações que já vimos
                    const seenBenefits = new Set<string>();
                    const duplicates = [];

                    for (const item of employeeItems) {
                        // Criamos uma "chave" única para cada benefício de um usuário em uma empresa
                        const uniqueKey = `${item.user_info_uuid}_${item.business_info_uuid}_${item.item_name}`;

                        if (seenBenefits.has(uniqueKey)) {
                            // Se já vimos esta chave antes, é uma duplicata
                            duplicates.push(item);
                        } else {
                            // Se não, a adicionamos ao nosso rastreador
                            seenBenefits.add(uniqueKey);
                        }
                    }

                    if (duplicates.length > 0) {
                        console.error(
                            '❌ ALERTA: Foram encontrados benefícios duplicados!',
                            duplicates
                        );
                    } else {
                        console.log(
                            '✅ GARANTIA: Nenhum benefício duplicado foi encontrado no banco de dados.'
                        );
                    }

                    // ARRANGE:
                    // 1. Buscamos os detalhes do benefício "Vale Alimentação" para a empresa.
                    const employerItems = await request(app)
                        .get(`/business/item/details`)
                        .set('Authorization', `Bearer ${employer_user_token}`);
                    // Adicionando a verificação de status para a requisição GET
                    expect(employerItems.statusCode).toBe(200);

                    const valeAlimentacao = employerItems.body.find(
                        (item: any) => item.Item.name === 'Vale Alimentação'
                    );
                    valeAlimentacaoEmployerItemUuid = valeAlimentacao.Item.uuid;

                    // 2. Encontramos o grupo padrão e criamos um novo grupo "Diretoria" com valor maior.
                    defaultGroupUuid = valeAlimentacao.BenefitGroups.find(
                        (g: any) => g.is_default
                    ).uuid;

                    const grupoDiretoriaInput = {
                        group_name: 'Diretoria',
                        employer_item_details_uuid: valeAlimentacao.uuid,
                        value: 1000, // R$ 1000,00
                    };
                    const createGroupRes = await request(app)
                        .post('/business-admin/group')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(grupoDiretoriaInput);
                    expect(createGroupRes.statusCode).toBe(201);
                    diretoriaGroupUuid = createGroupRes.body.uuid;

                    //3. Criar um funcionário novo que não está vinculado com nenhum benefício ainda
                    const newEmployeeInput = {
                        document: '17582628004', //this document must be same as created in beforeAll
                        full_name: 'João Alves da Silva',
                        internal_company_code: '516518',
                        gender: 'Masculino',
                        function: 'Corretor',
                        date_of_birth: '14/02/84',
                        dependents_quantity: 2,
                    };
                    const createEmployee = await request(app)
                        .post('/app-user/business-admin')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(newEmployeeInput);
                    expect(createEmployee.statusCode).toBe(201); // Ainda não existe
                    const employeeCreated = await request(app)
                        .get('/app-user/business-admin')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query({ employeeDocument: newEmployeeInput.document });
                    expect(employeeCreated.statusCode).toBe(200);

                    //4. Lista de funcionários
                    const employees = await request(app)
                        .get('/business-admin/app-users')
                        .set('Authorization', `Bearer ${employer_user_token}`);
                    expect(employees.statusCode).toBe(200);
                    funcionarioParaAtivarUuid =
                        employees.body[0].user_info_uuid; // Primeiro funcionário da lista. Este funcionário foi criado no upload do CSV e já tem o benefício criado, mas inativo.

                    funcionarioParaCriarUuid = employees.body.find(
                        (emp: any) => emp.document === '17582628004'
                    ).user_info_uuid; // Funcionário criado acima, que ainda não tem o benefício.
                });

                it('should ACTIVATE an existing inactive UserItem for an employee, assigning them to the DEFAULT group', async () => {
                    // ACT: Ativamos o benefício para um funcionário que ainda não o tem.
                    const userItemBefore =
                        await prismaClient.userItem.findFirst({
                            where: {
                                user_info_uuid: funcionarioParaCriarUuid,
                                item_uuid: valeAlimentacaoEmployerItemUuid,
                                business_info_uuid: employer_info_uuid,
                            },
                        });
                    expect(userItemBefore).toBeDefined();
                    expect(userItemBefore.status).toBe('inactive');
                    // ACT: Chame a API com o input correto
                    const input = {
                        user_info_uuid: funcionarioParaCriarUuid,
                        item_uuid: valeAlimentacaoEmployerItemUuid,
                    };
                    const result = await request(app)
                        .patch('/user-item/activate')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);

                    // ASSERT: Verifique se o item foi ATUALIZADO
                    expect(result.statusCode).toBe(200);
                    expect(result.body.status).toBe('active');
                    expect(result.body.balance).toBe(200);

                    const userItemAfter = await prismaClient.userItem.findFirst(
                        { where: { uuid: result.body.uuid } }
                    );
                    expect(userItemAfter.status).toBe('active');
                    ('\n🕵️  Iniciando verificação de duplicidade de benefícios...');

                    const employeeItems =
                        await prismaClient.userItem.findMany();
                    // Map para rastrear as combinações que já vimos.
                    const combinationTracker = new Map();

                    // Array para armazenar todos os itens que são parte de uma duplicata.
                    const duplicateItems = [];

                    for (const item of employeeItems) {
                        // Cria uma "chave composta" única para cada combinação que deve ser exclusiva.
                        const compositeKey = `${item.user_info_uuid}|${item.business_info_uuid}|${item.item_name}`;

                        // Verifica se já vimos essa chave antes.
                        if (combinationTracker.has(compositeKey)) {
                            const firstOccurrence =
                                combinationTracker.get(compositeKey);

                            if (firstOccurrence !== null) {
                                duplicateItems.push(firstOccurrence);
                                combinationTracker.set(compositeKey, null);
                            }
                            duplicateItems.push(item);
                        } else {
                            combinationTracker.set(compositeKey, item);
                        }
                    }

                    // --- ETAPA 2: RELATÓRIO DOS RESULTADOS ---

                    if (duplicateItems.length > 0) {
                        const groupedDuplicates: {
                            [key: string]: (typeof duplicateItems)[0][];
                        } = {};
                        for (const item of duplicateItems) {
                            const key = `${item.user_info_uuid}|${item.business_info_uuid}|${item.item_name}`;
                            if (!groupedDuplicates[key]) {
                                groupedDuplicates[key] = [];
                            }
                            groupedDuplicates[key].push(item);
                        }

                        const groupCount =
                            Object.keys(groupedDuplicates).length;
                        console.warn(
                            `\n🚨 ATENÇÃO: Foram encontrados ${groupCount} grupos de benefícios duplicados.`
                        );
                        console.log(
                            'Um usuário não pode ter o mesmo benefício mais de uma vez para a mesma empresa.\n'
                        );

                        console.log(
                            '--- 📋 Relatório Detalhado de Duplicatas ---'
                        );

                        let groupIndex = 1;
                        for (const key in groupedDuplicates) {
                            const itemsInGroup = groupedDuplicates[key];

                            console.group(
                                `[Grupo ${groupIndex}/${groupCount}] Benefício: "${itemsInGroup[0].item_name}"`
                            );

                            console.log(
                                `Usuário: ${itemsInGroup[0].user_info_uuid}`
                            );
                            // LINHA CORRIGIDA ABAIXO:
                            console.log(
                                `Empresa: ${itemsInGroup[0].business_info_uuid}`
                            );

                            const simplifiedData = itemsInGroup.map(
                                (item: any) => ({
                                    item_uuid: item.uuid,
                                    balance_R$: (item.balance / 100).toFixed(2),
                                    status: item.status,
                                    created_at: item.created_at,
                                })
                            );

                            console.table(simplifiedData);
                            console.groupEnd();
                            groupIndex++;
                        }
                        console.log('\n--- Fim do Relatório ---');
                    } else {
                        console.log(
                            '\n✅ Verificação concluída. Nenhuma duplicidade encontrada.'
                        );
                    }
                });

                it('should ACTIVATE an existing inactive UserItem for an employee', async () => {
                    // ARRANGE: Verificamos que o UserItem foi criado inativo (como a lógica atual faz)
                    const userItemBefore =
                        await prismaClient.userItem.findFirst({
                            where: {
                                user_info_uuid: funcionarioParaAtivarUuid,
                                item_uuid: valeAlimentacaoEmployerItemUuid,
                            },
                        });
                    expect(userItemBefore).toBeTruthy();
                    // ACT: Ativamos o benefício.
                    const input = {
                        user_info_uuid: funcionarioParaAtivarUuid,
                        item_uuid: valeAlimentacaoEmployerItemUuid,
                    };
                    const result = await request(app)
                        .patch('/user-item/activate')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);

                    // ASSERT
                    expect(result.statusCode).toBe(200);
                    expect(result.body.status).toBe('active');
                });

                it('should activate and assign an employee to a SPECIFIC group with a different value', async () => {
                    const diretoriaGroup =
                        await prismaClient.benefitGroups.findUnique({
                            where: { uuid: diretoriaGroupUuid },
                        });
                    expect(diretoriaGroup).toBeTruthy();
                    // ACT: Ativamos o benefício, mas especificamos o grupo "Diretoria".
                    const input = {
                        user_info_uuid: funcionarioParaCriarUuid, // Usando o mesmo funcionário do primeiro teste
                        item_uuid: valeAlimentacaoEmployerItemUuid,
                        group_uuid: diretoriaGroupUuid, //
                    };
                    const result = await request(app)
                        .patch('/user-item/activate')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);
                    // ASSERT
                    expect(result.statusCode).toBe(200);
                    expect(result.body.status).toBe('active');
                    // O saldo deve refletir o valor do grupo "Diretoria", não o padrão.
                    expect(result.body.balance).toBe(
                        diretoriaGroup.value / 100
                    );
                });

                it('should return an error if trying to activate an already active benefit', async () => {
                    // ARRANGE: O funcionário já tem o benefício ativo do teste anterior.
                    const input = {
                        user_info_uuid: funcionarioParaCriarUuid,
                        item_uuid: valeAlimentacaoEmployerItemUuid,
                    };

                    // ACT & ASSERT
                    const result = await request(app)
                        .patch('/user-item/activate')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);
                    expect(result.statusCode).toBe(409); // 409 Conflict é um bom status para este caso
                    expect(result.body.error).toBe(
                        'Benefício já está ativo para este funcionário.'
                    );
                });
            });
            describe('E2E Find all user items by employer', () => {
                beforeAll(async () => {});
                it('Should throw an error if user info is missing', async () => {
                    const input: any = {
                        user_info_uuid: '',
                    };

                    const result = await request(app)
                        .get('/user-item/all/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe('User Info id is required');
                });

                it('Should throw an error if user is not found', async () => {
                    const input: any = {
                        userInfoUuid: randomUUID(),
                    };

                    const result = await request(app)
                        .get('/user-item/all/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(input);
                    expect(result.statusCode).toBe(404);
                    expect(result.body.error).toBe('User not found');
                });

                it('Should throw an error if user is not employee', async () => {
                    const input: any = {
                        userInfoUuid: non_employee_user_info,
                    };

                    const result = await request(app)
                        .get('/user-item/all/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(input);
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe('Unauthorized access');
                });

                it('Should return a list of user items by employer 1', async () => {
                    const employeeItems =
                        await prismaClient.userItem.findMany();

                    //get userinfo_uuid of an employee of employer 1 that has items
                    const userInfoUuid = employeeItems.find(
                        (item) =>
                            item.status === 'active' &&
                            item.item_name !== 'Correct'
                    )?.user_info_uuid;
                    const result = await request(app)
                        .get('/user-item/all/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query({ userInfoUuid: userInfoUuid });
                    expect(result.statusCode).toBe(200);
                });
                it('Should return an empty list of user items by employer 2', async () => {
                    //At this point, this employer has not activated any user items, so we expect the list to be 0
                    const employeesList = await request(app)
                        .get('/business-admin/app-users')
                        .set('Authorization', `Bearer ${employer_user_token2}`);
                    expect(employeesList.statusCode).toBe(200);
                    for (const employee of employeesList.body) {
                        //for each employee, return their items
                        const input: any = {
                            userInfoUuid: employee.user_info_uuid,
                        };

                        const result = await request(app)
                            .get('/user-item/all/employer')
                            .set(
                                'Authorization',
                                `Bearer ${employer_user_token2}`
                            )
                            .query(input);
                        expect(result.statusCode).toBe(200);
                        expect(result.body.length).toBe(0);
                    }
                });
            });
            describe('E2E find user item by id by employer', () => {
                beforeAll(async () => {
                    const input: any = {
                        userInfoUuid: funcionarioParaAtivarUuid,
                    };
                    //all user items of employee
                    const result = await request(app)
                        .get('/user-item/all/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(input);
                    pre_paid_user_item_uuid = result.body.find(
                        (item: any) => item.item_name === 'Vale Alimentação'
                    ).uuid;
                    // post_paid_user_item_uuid = result.body.find(
                    //     (item: any) => item.item_category === 'pos_pago'
                    // ).uuid;
                });
                it('Should throw an error if user item id is missing', async () => {
                    const input = {
                        userItemId: '',
                    };
                    const result = await request(app)
                        .get('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe('User Item id is required');
                });

                it('Should throw an error if user item is not found', async () => {
                    const input = {
                        userItemId: randomUUID(),
                    };
                    const result = await request(app)
                        .get('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(input);
                    expect(result.statusCode).toBe(404);
                    expect(result.body.error).toBe('User Item not found');
                });
                it('Should throw an error if business is not the employer', async () => {
                    const input = {
                        userItemId: pre_paid_user_item_uuid,
                    };
                    const result = await request(app)
                        .get('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token3}`)
                        .query(input);
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe(
                        'Unauthorized Access for business admin'
                    );
                });

                it('Should return user item', async () => {
                    const input = {
                        userItemId: pre_paid_user_item_uuid,
                    };
                    const result = await request(app)
                        .get('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(input);
                    expect(result.statusCode).toBe(200);
                    expect(result.body.uuid).toBe(input.userItemId);
                    expect(result.body.item_name).toBe('Vale Alimentação');
                    expect(result.body.status).toBe('active');
                    expect(result.body.Provider.business_info_uuid).toBe(
                        employer_info_uuid
                    );
                });
            });
            describe('E2E Block or Cancel User item by employer', () => {
                it('Should throw an error if item uuid is missing', async () => {
                    const input: any = {
                        user_item_uuid: '',
                        status: 'cancelled',
                    };

                    const result = await request(app)
                        .patch('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe(
                        'User item uuid is required'
                    );
                });

                it('Should throw an error if item uuid is not found', async () => {
                    const input: any = {
                        user_item_uuid: randomUUID(),
                        status: 'cancelled',
                    };

                    const result = await request(app)
                        .patch('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);
                    expect(result.statusCode).toBe(404);
                    expect(result.body.error).toBe('User Item not found');
                });

                it('Should throw an error if business admin is not authorized to block or cancel', async () => {
                    const input: any = {
                        user_item_uuid: pre_paid_user_item_uuid,
                        status: 'blocked',
                    };

                    const result = await request(app)
                        .patch('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token2}`)
                        .send(input);
                    expect(result.statusCode).toBe(403);
                });
                it('Should return a blocked user item', async () => {
                    const input: any = {
                        user_item_uuid: pre_paid_user_item_uuid,
                        status: 'blocked',
                    };

                    const result = await request(app)
                        .patch('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);
                    const findInput = {
                        userItemId: pre_paid_user_item_uuid,
                    };
                    const findUserItem = await request(app)
                        .get('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(findInput);
                    expect(findUserItem.statusCode).toBe(200);
                    expect(result.statusCode).toBe(200);
                    expect(result.body.status).toBe(input.status);
                    expect(findUserItem.body.status).toBe(input.status);
                });

                it('Should return a to be cancelled user item - pre paid', async () => {
                    const input: any = {
                        user_item_uuid: pre_paid_user_item_uuid,
                        status: 'cancelled',
                    };

                    const result = await request(app)
                        .patch('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);
                    const findInput = {
                        userItemId: pre_paid_user_item_uuid,
                    };

                    const findUserItem = await request(app)
                        .get('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .query(findInput);
                    expect(findUserItem.statusCode).toBe(200);
                    expect(result.statusCode).toBe(200);
                    expect(findUserItem.body.status).toBe('to_be_cancelled');
                    expect(
                        findUserItem.body.grace_period_end_date
                    ).toBeTruthy();
                    expect(
                        findUserItem.body.cancelling_request_at
                    ).toBeTruthy();
                    expect(findUserItem.body.updated_at).toBeTruthy();
                });

                it('Should throw an error if trying to cancel an user item that is to be cancelled', async () => {
                    const input: any = {
                        user_item_uuid: pre_paid_user_item_uuid,
                        status: 'cancelled',
                    };

                    const result = await request(app)
                        .patch('/user-item/employer')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(input);

                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe(
                        'User item already cancelled'
                    );
                });
                //  it('Should throw an error if trying to cancel an already cancelled user item', async () => {
                //     const input: any = {
                //         user_item_uuid: post_paid_user_item_uuid,
                //         status: 'cancelled',
                //     };

                //     const result = await request(app)
                //         .patch('/user-item/employer')
                //         .set('Authorization', `Bearer ${employer_user_token}`)
                //         .send(input);

                //     expect(result.statusCode).toBe(400);
                //     expect(result.body.error).toBe(
                //         'User item already cancelled'
                //     );
                // });
            });
        });

        describe('E2E tests User items by app user', () => {
            let valeAlimentacaoUserItem: any;
            describe('E2E Tests Find user item by app user', () => {
                beforeAll(async () => {
                    //Activate vale Alimentação for this employee
                    const inputActivateItem = {
                        user_info_uuid: employee_user_info,
                        item_uuid: valeAlimentacaoEmployerItemUuid,
                    };
                    const result = await request(app)
                        .patch('/user-item/activate')
                        .set('Authorization', `Bearer ${employer_user_token}`)
                        .send(inputActivateItem);
                    // ASSERT
                    expect(result.statusCode).toBe(200);
                    expect(result.body.status).toBe('active');
                });
                it('Should return app user item', async () => {
                    const userItem = await prismaClient.userItem.findFirst({
                        where: {
                            user_info_uuid: employee_user_info,
                            item_name: 'Vale Alimentação',
                            business_info_uuid: employer_info_uuid,
                        },
                    });
                    const input = {
                        userItemId: userItem.uuid,
                    };

                    const result = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .query(input);
                    expect(result.statusCode).toBe(200);
                    expect(result.body.uuid).toBe(input.userItemId);
                    expect(result.body.user_info_uuid).toBe(employee_user_info);
                    expect(result.body.Provider.business_info_uuid).toBe(
                        employer_info_uuid
                    );
                });

                it('Should throw an error if user is not authorized', async () => {
                    const input = {
                        userItemId: pre_paid_user_item_uuid,
                    };
                    const result = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query(input);
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe(
                        'Unauthorized access for user'
                    );
                });
            });

            describe('E2E Testes find all user items by user', () => {
                it('Should return user items', async () => {
                    const result = await request(app)
                        .get('/user-item/all')
                        .set('Authorization', `Bearer ${employeeAuthToken}`);
                    expect(result.statusCode).toBe(200);
                });
            });
        });
    });

    // describe('E2E tests Groups', () => {
    //     let employeesListUuids: string[] = [];
    //     let employerItems1: string[] = [];
    //     let group1_uuid: string;
    //     describe('E2E Create groups', () => {
    //         beforeAll(async () => {
    //             //Get employer items
    //             const employerItems = await request(app)
    //                 .get(`/business/item/details`)
    //                 .set('Authorization', `Bearer ${employer_user_token}`);
    //             expect(employerItems.statusCode).toBe(200);
    //             employerItems.body.map((employerItems: any) => {
    //                 employerItems1.push(employerItems.uuid);
    //             });
    //         });
    //         it('Should create an group', async () => {
    //             const input: any = {
    //                 group_name: 'Grupo 1',
    //                 employer_item_details_uuid: employerItems1[0],
    //                 value: 50000,
    //             };
    //             const result = await request(app)
    //                 .post('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token}`)
    //                 .send(input);
    //             group1_uuid = result.body.uuid;
    //             expect(result.statusCode).toBe(201);
    //             expect(result.body.group_name).toBe(input.group_name);
    //             expect(result.body.employerItemDetails_uuid).toBe(
    //                 input.employer_item_details_uuid
    //             );
    //             expect(result.body.is_default).toBe(false);
    //         });
    //     });

    //     describe('E2E Update Groups', () => {
    //         it('Should throw an error if group id is missing', async () => {
    //             const input: any = {
    //                 group_name: 'Grupo 1 Editado',
    //                 employer_item_details_uuid: employerItems1[0],
    //                 value: 58400,
    //             };
    //             const result = await request(app)
    //                 .put('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token}`)
    //                 .send(input);

    //             expect(result.statusCode).toBe(400);
    //             expect(result.body.error).toBe('Group uuid is required');
    //         });
    //         it('Should update an group', async () => {
    //             const input: any = {
    //                 uuid: group1_uuid,
    //                 group_name: 'Grupo 1 Editado',
    //                 employer_item_details_uuid: employerItems1[0],
    //                 value: 58400,
    //             };
    //             const result = await request(app)
    //                 .put('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token}`)
    //                 .send(input);
    //             expect(result.statusCode).toBe(200);
    //             expect(result.body).toHaveProperty('uuid');
    //             expect(result.body.group_name).toEqual(input.group_name);
    //             expect(result.body.employerItemDetails_uuid).toEqual(
    //                 input.employer_item_details_uuid
    //             );
    //             expect(result.body.value).toEqual(input.value);
    //         });
    //     });

    //     describe('E2E Get All Groups  By Business', () => {
    //         beforeAll(async () => {
    //             //create one more group by employer 1
    //             const input: any = {
    //                 group_name: 'Grupo 1',
    //                 employer_item_details_uuid: employerItems1[1],
    //                 value: 35000,
    //             };
    //             const result = await request(app)
    //                 .post('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token}`)
    //                 .send(input);
    //             expect(result.statusCode).toBe(201);
    //         });
    //         it('Should return a list of groups', async () => {
    //             const result = await request(app)
    //                 .get('/business-admin/groups')
    //                 .set('Authorization', `Bearer ${employer_user_token}`);
    //         });
    //     });

    //     describe('E2E Get one group By Business', () => {
    //         it('Should throw an error if group id is missing', async () => {
    //             const input = {
    //                 uuid: '',
    //             };
    //             const result = await request(app)
    //                 .get('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token}`)
    //                 .query(input);
    //             expect(result.statusCode).toBe(400);
    //             expect(result.body.error).toBe('Uuid is required');
    //         });

    //         it('Should throw an error if group does not exist', async () => {
    //             const input = {
    //                 uuid: randomUUID(),
    //             };
    //             const result = await request(app)
    //                 .get('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token}`)
    //                 .query(input);
    //             expect(result.statusCode).toBe(404);
    //             expect(result.body.error).toBe('Group not found');
    //         });

    //         it('Should throw an error if employer cannot access the group', async () => {
    //             const input = {
    //                 uuid: group1_uuid,
    //             };
    //             const result = await request(app)
    //                 .get('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token2}`)
    //                 .query(input);
    //             expect(result.statusCode).toBe(403);
    //             expect(result.body.error).toBe('Unauthorized access');
    //         });

    //         it('Should return a group', async () => {
    //             const input = {
    //                 uuid: group1_uuid,
    //             };
    //             const result = await request(app)
    //                 .get('/business-admin/group')
    //                 .set('Authorization', `Bearer ${employer_user_token}`)
    //                 .query(input);
    //             expect(result.statusCode).toBe(200);
    //             expect(result.body.uuid).toBe(input.uuid);
    //             expect(result.body.business_info_uuid).toBe(employer_info_uuid);
    //             expect(result.body.is_default).toBe(false);
    //         });
    //     });
    // });

    describe('E2E App User and Partners', () => {
        //first we need to create partners, lets create 10
        beforeAll(async () => {
            //partner 1
            const input = {
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
                .send(input);
            expect(partner1.statusCode).toBe(201);
            partner_info_uuid = partner1.body.BusinessInfo.uuid;

            //partner 2
            const input2 = {
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
                .send(input2);
            expect(partner2.statusCode).toBe(201);
            partner_info_uuid2 = partner2.body.BusinessInfo.uuid;

            //partner 3
            const input3 = {
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
                .send(input3);
            expect(partner3.statusCode).toBe(201);
            partner_info_uuid3 = partner3.body.BusinessInfo.uuid;

            //activate partner3
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

            //partner 4
            const input4 = {
                line1: 'Rua',
                line2: '72B',
                line3: '',
                neighborhood: 'Bairro Teste',
                postal_code: '5484248423',
                city: 'Corumbá',
                state: 'Estado teste',
                country: 'País teste',
                fantasy_name: 'Empresa teste 4',
                document: 'comercio4',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'comercio4@comercio.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'comercio',
                branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
                partnerConfig: {
                    main_branch: branch4_uuid,
                    partner_category: ['comercio'],
                    use_marketing: true,
                    use_market_place: true,
                },
            };

            const partner4 = await request(app)
                .post('/business/register')
                .send(input4);
            expect(partner4.statusCode).toBe(201);
            partner_info_uuid4 = partner4.body.BusinessInfo.uuid;

            //partner 5
            const input5 = {
                line1: 'Rua',
                line2: '72B',
                line3: '',
                neighborhood: 'Bairro Teste',
                postal_code: '5484248423',
                city: 'Corumbá',
                state: 'Estado teste',
                country: 'País teste',
                fantasy_name: 'Empresa teste 5',
                document: 'comercio5',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'comercio5@comercio.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'comercio',
                branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
                partnerConfig: {
                    main_branch: branch1_uuid,
                    partner_category: ['comercio', 'saude'],
                    use_marketing: true,
                    use_market_place: true,
                },
            };

            const partner5 = await request(app)
                .post('/business/register')
                .send(input5);
            expect(partner5.statusCode).toBe(201);
            partner_info_uuid5 = partner5.body.BusinessInfo.uuid;

            //partner 6
            const input6 = {
                line1: 'Rua',
                line2: '72B',
                line3: '',
                neighborhood: 'Bairro Teste',
                postal_code: '5484248423',
                city: 'Corumbá',
                state: 'Estado teste',
                country: 'País teste',
                fantasy_name: 'Empresa teste 6',
                document: 'comercio6',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'comercio6@comercio.com',
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

            const partner6 = await request(app)
                .post('/business/register')
                .send(input6);
            expect(partner6.statusCode).toBe(201);
            partner_info_uuid6 = partner6.body.BusinessInfo.uuid;

            //partner 7
            const input7 = {
                line1: 'Rua',
                line2: '72B',
                line3: '',
                neighborhood: 'Bairro Teste',
                postal_code: '5484248423',
                city: 'Ladário',
                state: 'Estado teste',
                country: 'País teste',
                fantasy_name: 'Empresa teste 7',
                document: 'comercio7',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'comercio7@comercio.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'comercio',
                branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
                partnerConfig: {
                    main_branch: branch4_uuid,
                    partner_category: ['cultura', 'comercio'],
                    use_marketing: true,
                    use_market_place: true,
                },
            };

            const partner7 = await request(app)
                .post('/business/register')
                .send(input7);
            expect(partner7.statusCode).toBe(201);
            partner_info_uuid7 = partner7.body.BusinessInfo.uuid;

            //partner 8
            const input8 = {
                line1: 'Rua',
                line2: '72B',
                line3: '',
                neighborhood: 'Bairro Teste',
                postal_code: '5484248423',
                city: 'Ladário',
                state: 'Estado teste',
                country: 'País teste',
                fantasy_name: 'Empresa teste 8',
                document: 'comercio8',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'comercio8@comercio.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'comercio',
                branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
                partnerConfig: {
                    main_branch: branch1_uuid,
                    partner_category: ['cultura'],
                    use_marketing: true,
                    use_market_place: true,
                },
            };

            const partner8 = await request(app)
                .post('/business/register')
                .send(input8);
            expect(partner8.statusCode).toBe(201);
            partner_info_uuid8 = partner8.body.BusinessInfo.uuid;

            //partner 9
            const input9 = {
                line1: 'Rua',
                line2: '72B',
                line3: '',
                neighborhood: 'Bairro Teste',
                postal_code: '5484248423',
                city: 'Ladário',
                state: 'Estado teste',
                country: 'País teste',
                fantasy_name: 'Empresa teste 9',
                document: 'comercio9',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'comercio9@comercio.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'comercio',
                branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
                partnerConfig: {
                    main_branch: branch3_uuid,
                    partner_category: ['cultura', 'saude'],
                    use_marketing: false,
                    use_market_place: false,
                },
            };

            const partner9 = await request(app)
                .post('/business/register')
                .send(input9);
            expect(partner9.statusCode).toBe(201);
            partner_info_uuid9 = partner9.body.BusinessInfo.uuid;

            //partner 10
            const input10 = {
                line1: 'Rua',
                line2: '72B',
                line3: '',
                neighborhood: 'Bairro Teste',
                postal_code: '5484248423',
                city: 'Aquidauana',
                state: 'Estado teste',
                country: 'País teste',
                fantasy_name: 'Empresa teste 10',
                document: 'comercio10',
                classification: 'Classificação',
                colaborators_number: 5,
                email: 'comercio10@comercio.com',
                phone_1: '215745158',
                phone_2: '124588965',
                business_type: 'comercio',
                branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
                partnerConfig: {
                    main_branch: branch4_uuid,
                    partner_category: ['cultura', 'comercio'],
                    use_marketing: true,
                    use_market_place: true,
                },
            };

            const partner10 = await request(app)
                .post('/business/register')
                .send(input10);
            expect(partner10.statusCode).toBe(201);
            partner_info_uuid10 = partner10.body.BusinessInfo.uuid;
        });
        describe('Get partners by category by app user', () => {
            it('Should throw an error if partner category is missing', async () => {
                const result = await request(app)
                    .get('/partners/category')
                    .set('Authorization', `Bearer ${userToken1}`);
                expect(result.statusCode).toBe(400);
                expect(result.body.error).toBe('Category is required');
            });
            it('Should return a list of partners', async () => {
                const result = await request(app)
                    .get('/partners/category')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .query({ partner_category: 'saude' });
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(4);
            });
            it('Should return only cities located in Campo Grande with Saude category', async () => {
                //In this test, we have 2 filters: partner_category and city
                //So we want all partners that are located in campo grande and have the "saude" category
                const input = {
                    city: 'Campo Grande',
                };
                const result = await request(app)
                    .get('/partners/filter')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .query({ partner_category: 'saude', city: 'Campo Grande' });
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(2);
            });
            it('Should return only partners located in Corumba with Comercio category', async () => {
                //In this test, we have 2 filters: partner_category and city
                //So we want all partners that are located in campo grande and have the "saude" category
                const input = {
                    city: 'Corumbá',
                };
                const result = await request(app)
                    .get('/partners/filter')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .query({ partner_category: 'comercio', city: 'Corumbá' });
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(3);
            });
            it('Should return only partners located in Corumba which main branch is branch4', async () => {
                const input = {
                    city: 'Corumbá',
                    main_branch: branch4_uuid,
                };
                const result = await request(app)
                    .get('/partners/filter')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .query({
                        partner_category: 'comercio',
                        city: 'Corumbá',
                        main_branch: branch4_uuid,
                    });
                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(3);
            });
            it('Should return only partners located in Campo Grande with specific search query', async () => {
                const input = {
                    city: 'Campo Grande',
                    search: 'Mercado',
                };
                const result = await request(app)
                    .get('/partners/filter')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .query({
                        partner_category: 'saude',
                        city: 'Campo Grande',
                        main_branch: branch4_uuid,
                    });

                expect(result.statusCode).toBe(200);
                expect(result.body.length).toBe(2);
            });
            it('Should return only partners located in Campo Grande that accept an specefic type of benefit', async () => {
                const input = {
                    city: 'Campo Grande',
                    item_uuid: benefit1_uuid.uuid,
                };
                const result = await request(app)
                    .get('/partners/filter')
                    .set('Authorization', `Bearer ${userToken1}`)
                    .query({
                        partner_category: 'saude',
                        city: 'Campo Grande',
                        item_uuid: benefit1_uuid.uuid,
                    });
                expect(result.statusCode).toBe(200);
            });
        });
    });

    describe('E2E Transactions', () => {
        describe('E2E POS transactions', () => {
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

            //first we need to create transactions by partner
            beforeAll(async () => {
                //lets first create partner users
                const inputPartner2 = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid2,
                    email: 'comercio2@comercio.com',
                    name: 'partner2',
                };
                const inputPartner3 = {
                    password: '123456',
                    business_info_uuid: partner_info_uuid3,
                    email: 'comercio3@comercio.com',
                    name: 'Nome do admin partner',
                };

                const input2 = {
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
                //WE NEED TO ACTIVATE PARTNER 2 BEFORE CREATING AN USER
                const inputActivatePartner2 = {
                    status: 'active',
                };
                const queryToActivatePartner2 = {
                    business_info_uuid: partner_info_uuid2,
                };

                const activatePartner2 = await request(app)
                    .put('/business/info/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .query(queryToActivatePartner2)
                    .send(inputActivatePartner2);
                expect(activatePartner2.statusCode).toBe(200);

                const createPartner2 = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(inputPartner2);
                expect(createPartner2.statusCode).toBe(201);
                partner_user_uuid2 = createPartner2.body.uuid;

                const createPartner3 = await request(app)
                    .post('/business/admin/correct')
                    .set('Authorization', `Bearer ${correctAdminToken}`)
                    .send(inputPartner3);
                expect(createPartner3.statusCode).toBe(201);
                partner_user_uuid3 = createPartner3.body.uuid;

                //NOW WE NEED TO AUTHENTICATE THIS NEW USER SO HE CAN CREATE TRANSACTIONS
                const authenticateAdminPartner2 = {
                    business_document: 'comercio2',
                    password: inputPartner2.password,
                    email: inputPartner2.email,
                };

                const authenticateAdminPartner3 = {
                    business_document: 'comercio3',
                    password: inputPartner3.password,
                    email: inputPartner3.email,
                };
                //authenticate partners admin
                const adminPartner2Auth = await request(app)
                    .post('/business/admin/login')
                    .send(authenticateAdminPartner2);
                expect(adminPartner2Auth.statusCode).toBe(200);

                const adminPartner3Auth = await request(app)
                    .post('/business/admin/login')
                    .send(authenticateAdminPartner3);
                expect(adminPartner3Auth.statusCode).toBe(200);

                partner_auth_token2 = adminPartner2Auth.body.token;
                partner_auth_token3 = adminPartner3Auth.body.token;

                //NOW WE NEED TO CREATE AN TRANSACTION
                inputTransaction1 = {
                    original_price: 1.5,
                    discount_percentage: 0,
                    net_price: 1.5,
                };
                const createTransaction = await request(app)
                    .post('/pos-transaction')
                    .set('Authorization', `Bearer ${partner_auth_token3}`)
                    .send(inputTransaction1);
                transaction1_uuid = createTransaction.body.transaction_uuid;
                expect(createTransaction.statusCode).toBe(201);

                expected_fee_in_cents = createTransaction.body.fee_amount * 100; // fee em reais
                expected_cashback_in_cents =
                    createTransaction.body.cashback * 100;
                const transactionCreated = await prismaClient.transactions.findUnique({
                    where: { uuid: transaction1_uuid },
                })
                const employeeItemsPrisma =
                    await prismaClient.userItem.findMany({
                        where: { user_info_uuid: employee_user_info },
                    });

                expect(employeeItemsPrisma).toBeDefined();
                const alimentacaoItemUuid = employeeItemsPrisma.find(
                    (item) => item.item_name === 'Vale Alimentação'
                ).item_uuid;
                const convenioItemUuid = employeeItemsPrisma.find(
                    (item) => item.item_name === 'Convênio'
                ).item_uuid;
                const adiantamentoItemUuid = employeeItemsPrisma.find(
                    (item) => item.item_name === 'Adiantamento Salarial'
                ).item_uuid;
                //Activate Convenio benefit for employee 1
                const inputActivateConvenioEmployee1 = {
                    user_info_uuid: employee_user_info,
                    item_uuid: convenioItemUuid,
                };
                const resultConvenioActivated = await request(app)
                    .patch('/user-item/activate')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(inputActivateConvenioEmployee1);

                // ASSERT
                expect(resultConvenioActivated.statusCode).toBe(200);
                expect(resultConvenioActivated.body.status).toBe('active');

                //Get employee 1 user items
                const employee1UserItems = await request(app)
                    .get('/user-item/all')
                    .set('Authorization', `Bearer ${employeeAuthToken}`);
                expect(employee1UserItems.statusCode).toBe(200);

                correct_benefit_user1_uuid = employee1UserItems.body.find(
                    (item: any) => item.item_name === 'Correct'
                ).uuid;
                alimentacao_benefit_user1_uuid = employee1UserItems.body.find(
                    (item: any) => item.item_name === 'Vale Alimentação'
                ).uuid;
                convenio_benefit_user1_uuid = employee1UserItems.body.find(
                    (item: any) => item.item_name === 'Convênio'
                ).uuid;

                //Activate Adiantamento Item for employee 2
                const inputActivateAdiantamentoEmployee2 = {
                    user_info_uuid: employee2_user_info,
                    item_uuid: adiantamentoItemUuid,
                };
                const resultAdiantamentoActivated = await request(app)
                    .patch('/user-item/activate')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(inputActivateAdiantamentoEmployee2);
                expect(resultAdiantamentoActivated.statusCode).toBe(200);
                expect(resultAdiantamentoActivated.body.status).toBe('active');

                //Activate Alimentação Item for employee 2
                const inputActivateAlimentacaoEmployee2 = {
                    user_info_uuid: employee2_user_info,
                    item_uuid: alimentacaoItemUuid,
                };
                const resultAlimentacaoActivated = await request(app)
                    .patch('/user-item/activate')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(inputActivateAlimentacaoEmployee2);
                expect(resultAlimentacaoActivated.statusCode).toBe(200);
                expect(resultAlimentacaoActivated.body.status).toBe('active');

                //Activate Alimentação Item for employee 2
                const inputActivateConvenioEmployee2 = {
                    user_info_uuid: employee2_user_info,
                    item_uuid: convenioItemUuid,
                };
                const resultConvenioEmploye2Activated = await request(app)
                    .patch('/user-item/activate')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(inputActivateConvenioEmployee2);
                expect(resultConvenioEmploye2Activated.statusCode).toBe(200);
                expect(resultConvenioEmploye2Activated.body.status).toBe(
                    'active'
                );

                //Get employee 2 user items
                const employee2UserItems = await request(app)
                    .get('/user-item/all')
                    .set('Authorization', `Bearer ${employeeAuthToken2}`);
                expect(employee2UserItems.statusCode).toBe(200);
                correct_benefit_user2_uuid = employee2UserItems.body.find(
                    (item: any) => item.item_name === 'Correct'
                ).uuid;
                alimentacao_benefit_user2_uuid = employee2UserItems.body.find(
                    (item: any) => item.item_name === 'Vale Alimentação'
                ).uuid;
                blocked_adiantamento_benefit_user2_uuid =
                    employee2UserItems.body.find(
                        (item: any) =>
                            item.item_name === 'Adiantamento Salarial'
                    ).uuid;
                convenio_benefit_user2_uuid = employee2UserItems.body.find(
                    (item: any) => item.item_name === 'Convênio'
                ).uuid;

                //HERE WE ARE GOING TO BLOCK ADIANTAMENTO BENEFIT FOR EMPLOYEE 2 FOR TESTS PURPOSES
                const blockInput: any = {
                    user_item_uuid: blocked_adiantamento_benefit_user2_uuid,
                    status: 'blocked',
                };
                const blockEmployee2Adiantamento = await request(app)
                    .patch('/user-item/employer')
                    .set('Authorization', `Bearer ${employer_user_token}`)
                    .send(blockInput);
                expect(blockEmployee2Adiantamento.statusCode).toBe(200);
                expect(blockEmployee2Adiantamento.body.status).toBe('blocked');
            });

            describe('E2E Get transaction by app user', () => {
                it('Should throw an error if transaction id is missing', async () => {
                    const input = {
                        transactionId: '',
                    };

                    const result = await request(app)
                        .get('/pos-transaction/app-user')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(input);

                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe(
                        'Transaction ID is required'
                    );
                });
                it('Should throw an error if transaction is not found', async () => {
                    const input = {
                        transactionId: randomUUID(),
                    };

                    const result = await request(app)
                        .get('/pos-transaction/app-user')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .query(input);

                    expect(result.statusCode).toBe(404);
                    expect(result.body.error).toBe('Transaction not found');
                });
                it('Should return available items to be selected by employee', async () => {
                    const input = {
                        transactionId: transaction1_uuid,
                    };

                    const result = await request(app)
                        .get('/pos-transaction/app-user')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .query(input);
                    expect(result.statusCode).toBe(200);
                    expect(result.body.availableItems.length).toBe(3);
                    expect(result.body.fantasy_name).toBe('Empresa teste 3');
                });

                it('Should return only Correct Item', async () => {
                    const input = {
                        transactionId: transaction1_uuid,
                    };

                    const result = await request(app)
                        .get('/pos-transaction/app-user')
                        .set('Authorization', `Bearer ${non_employee_token}`)
                        .query(input);
                    expect(result.statusCode).toBe(200);
                    expect(result.body.availableItems.length).toBe(1);
                    expect(result.body.fantasy_name).toBe('Empresa teste 3');
                });
            });
            describe('E2E Process Pre paid Transaction', () => {
                beforeAll(async () => {
                    // --- 1. SETUP: Criar a transação e capturar os valores esperados ---
                    const transactionInput = {
                        original_price: 1.5,
                        discount_percentage: 0,
                        net_price: 1.5,
                    };
                    const createTransaction = await request(app)
                        .post('/pos-transaction')
                        .set('Authorization', `Bearer ${partner_auth_token3}`)
                        .send(transactionInput);
                    transaction1_uuid = createTransaction.body.transaction_uuid;
                    transaction1_net_price_in_cents = Math.round(
                        transactionInput.net_price * 100
                    );
                    expected_fee_in_cents = Math.round(
                        createTransaction.body.fee_amount * 100
                    );
                    expected_cashback_in_cents = Math.round(
                        createTransaction.body.cashback * 100
                    );
                    expected_partner_net_amount_in_cents =
                        transaction1_net_price_in_cents - expected_fee_in_cents;

                    // --- 2. CAPTURA DE ESTADO: Obter saldos iniciais antes da ação ---
                    const partnerAccount = await request(app)
                        .get('/business/admin/account')
                        .set('Authorization', `Bearer ${partner_auth_token3}`);
                    partner3_initial_liquid_balance_in_cents = Math.round(
                        partnerAccount.body.balance * 100
                    );
                    const correctAdminAccount = await request(app)
                        .get('/admin/account')
                        .set('Authorization', `Bearer ${correctAdminToken}`);
                    correct_admin_initial_balance_in_cents = Math.round(
                        correctAdminAccount.body.balance * 100
                    );
                    const alimentacaoBenefit = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: alimentacao_benefit_user2_uuid });
                    employee2_alimentacao_initial_balance_in_cents = Math.round(
                        alimentacaoBenefit.body.balance * 100
                    );
                    const cashbackBenefit = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: correct_benefit_user2_uuid });
                    employee2_cashback_initial_balance_in_cents = Math.round(
                        cashbackBenefit.body.balance * 100
                    );
                });

                it('Should throw an error if transaction id is missing', async () => {
                    const input = {
                        transactionId: '',
                        benefit_uuid: randomUUID,
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe(
                        'Transaction ID is required'
                    );
                });
                it('Should throw an error if benefit id is missing', async () => {
                    const input = {
                        transactionId: randomUUID(),
                        benefit_uuid: '',
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe('Benefit UUID is required');
                });
                it('Should throw an error if transaction pin is not provided', async () => {
                    const input = {
                        transactionId: randomUUID(),
                        benefit_uuid: randomUUID(),
                    };

                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(input);
                    expect(result.statusCode).toBe(400);
                    expect(result.body.error).toBe(
                        'Transaction PIN is required'
                    );
                });
                it('Should throw an error if user does not have a pin set', async () => {
                    const input = {
                        transactionId: randomUUID(),
                        benefit_uuid: randomUUID(),
                        incoming_pin: '0000',
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(input);
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe(
                        'User does not have a transaction PIN set'
                    );
                });

                it('Should throw an error if transaction does not exist', async () => {
                    const employePin = {
                        newPin: '1234',
                        password: authenticateAppUser1.password,
                    };
                    const resultPin = await request(app)
                        .post('/app-user/transaction-pin')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(employePin);
                    expect(resultPin.statusCode).toBe(200);

                    const input = {
                        transactionId: randomUUID(),
                        benefit_uuid: randomUUID(),
                        incoming_pin: employePin.newPin,
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(input);
                    expect(result.statusCode).toBe(404);
                    expect(result.body.error).toBe('Transaction not found');
                });

                it('Should throw an error if user does not have this benefit', async () => {
                    const input = {
                        transactionId: transaction1_uuid,
                        benefit_uuid: randomUUID(),
                        incoming_pin: '1234',
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(input);
                    expect(result.statusCode).toBe(404);
                    expect(result.body.error).toBe('User item not found');
                });

                it('Should throw an error if user item is blocked or inactive', async () => {
                    //Set pin code for employee 2
                    // set incoming pin for employee 1
                    // ARRANGE
                    const employe2Pin = {
                        newPin: '1234',
                        password: authenticateAppUser2.password,
                    };
                    const resultPin = await request(app)
                        .post('/app-user/transaction-pin')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .send(employe2Pin);
                    expect(resultPin.statusCode).toBe(200);

                    const input = {
                        transactionId: transaction1_uuid,
                        benefit_uuid: blocked_adiantamento_benefit_user2_uuid,
                        incoming_pin: employe2Pin.newPin,
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .send(input);
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe('User item is not active');
                });
                it('Should throw an error if balance is not enough', async () => {
                    const input = {
                        transactionId: transaction1_uuid,
                        benefit_uuid: correct_benefit_user2_uuid,
                        incoming_pin: '1234',
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .send(input);
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe(
                        'User item balance is not enough'
                    );
                });
                // //BELOW TEST STILL MUST BE IMPLEMENTED
                it('deve lançar um erro se o parceiro não aceitar o benefício utilizado', async () => {
                    // --- ARRANGE (Preparação) ---

                    // 1. Criamos um parceiro 'Supermercado' que sabemos que NÃO aceita 'Convênio'.
                    const supermercadoInput = {
                        fantasy_name: 'Supermercado Teste Rejeita Convênio',
                        document: `supermercado_rejeita_${randomUUID()}`, // Documento único para isolamento
                        line1: 'Rua Teste',
                        line2: '123',
                        neighborhood: 'Bairro',
                        postal_code: '79000000',
                        city: 'Campo Grande',
                        state: 'MS',
                        country: 'Brasil',
                        classification: 'Supermercado',
                        colaborators_number: 5,
                        email: `supermercado-rejeita-${randomUUID()}@test.com`,
                        phone_1: '55556666',
                        business_type: 'comercio',
                        branches_uuid: [branch2_uuid], // <<< Associado ao Ramo "Supermercados"
                        partnerConfig: {
                            main_branch: branch2_uuid,
                            partner_category: ['comercio'],
                            use_marketing: false,
                            use_market_place: false,
                        },
                    };
                    const createSupermercadoRes = await request(app)
                        .post('/business/register')
                        .send(supermercadoInput);
                    expect(createSupermercadoRes.statusCode).toBe(201);
                    const supermercadoInfoUuid =
                        createSupermercadoRes.body.BusinessInfo.uuid;

                    // Ativamos o parceiro e criamos seu admin para poder criar uma transação
                    await request(app)
                        .put('/business/info/correct')
                        .set('Authorization', `Bearer ${correctAdminToken}`)
                        .query({ business_info_uuid: supermercadoInfoUuid })
                        .send({ status: 'active' });
                    await request(app)
                        .post('/business/admin/correct')
                        .set('Authorization', `Bearer ${correctAdminToken}`)
                        .send({
                            password: '123',
                            business_info_uuid: supermercadoInfoUuid,
                            email: supermercadoInput.email,
                            name: 'Admin Supermercado',
                        });
                    const authSupermercadoRes = await request(app)
                        .post('/business/admin/login')
                        .send({
                            business_document: supermercadoInput.document,
                            password: '123',
                            email: supermercadoInput.email,
                        });
                    const supermercadoAdminToken =
                        authSupermercadoRes.body.token;

                    // 2. O parceiro "Supermercado" cria uma transação
                    const transactionInput = {
                        original_price: 3,
                        discount_percentage: 0,
                        net_price: 3,
                    };
                    const createTxRes = await request(app)
                        .post('/pos-transaction')
                        .set(
                            'Authorization',
                            `Bearer ${supermercadoAdminToken}`
                        )
                        .send(transactionInput);
                    expect(createTxRes.statusCode).toBe(201);
                    const transactionId = createTxRes.body.transaction_uuid;

                    // 3. O funcionário 1 (employeeAuthToken) tentará pagar com "Convênio", que não é aceito.
                    const paymentInput = {
                        transactionId: transactionId,
                        benefit_uuid: convenio_benefit_user1_uuid, // O usuário TEM este benefício
                        incoming_pin: '1234',
                    };

                    // --- ACT (Ação) ---
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken}`)
                        .send(paymentInput);

                    // --- ASSERT (Verificação) ---
                    // A API deve rejeitar a transação, pois o benefício não é válido para este parceiro
                    expect(result.statusCode).toBe(403);
                    expect(result.body.error).toBe(
                        'User item is not valid for this transaction'
                    );
                });

                it('should correctly process a pre-paid benefit and update all account balances', async () => {
                    const alimentaco = await prismaClient.userItem.findUnique({
                        where: {
                            uuid: alimentacao_benefit_user2_uuid,
                        },
                    });

                    // 3. ACT: Executar o pagamento
                    const paymentInput = {
                        transactionId: transaction1_uuid,
                        benefit_uuid: alimentacao_benefit_user2_uuid,
                        incoming_pin: '1234',
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .send(paymentInput);
                    // 4. ASSERT: Validar a resposta da API (em Reais)
                    expect(result.statusCode).toBe(200);
                    expect(result.body.result).toBeTruthy();
                    expect(result.body.cashback).toBeCloseTo(
                        expected_cashback_in_cents / 100
                    );
                    expect(result.body.finalBalance).toBeCloseTo(
                        (employee2_alimentacao_initial_balance_in_cents -
                            transaction1_net_price_in_cents) /
                            100
                    );

                    // 5. ASSERT: Validar o estado final de todas as contas (em Centavos)
                    // a) Conta do administrador da Correct
                    const correctAdminAccountAfter = await request(app)
                        .get('/admin/account')
                        .set('Authorization', `Bearer ${correctAdminToken}`);
                    expect(correctAdminAccountAfter.body.balance * 100).toBe(
                        correct_admin_initial_balance_in_cents +
                            expected_fee_in_cents
                    );

                    // b) Carteira de cashback do usuário
                    const cashbackBenefitAfter = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: correct_benefit_user2_uuid });
                    expect(cashbackBenefitAfter.body.balance * 100).toBe(
                        employee2_cashback_initial_balance_in_cents +
                            expected_cashback_in_cents
                    );

                    // c) Conta líquida do parceiro (Saldo inicial + valor líquido da venda)
                    const partnerAccountAfter = await request(app)
                        .get('/business/admin/account')
                        .set('Authorization', `Bearer ${partner_auth_token3}`);
                    expect(partnerAccountAfter.body.balance * 100).toBe(
                        partner3_initial_liquid_balance_in_cents +
                            expected_partner_net_amount_in_cents
                    );

                    // d) Saldo do benefício "Vale Alimentação" do usuário
                    const alimentacaoBenefitAfter = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: alimentacao_benefit_user2_uuid });
                    expect(alimentacaoBenefitAfter.body.balance * 100).toBe(
                        employee2_alimentacao_initial_balance_in_cents -
                            transaction1_net_price_in_cents
                    );

                    // 6. ASSERT: Validar o estado final do registro da transação no banco
                    const transactionInDb =
                        await prismaClient.transactions.findUnique({
                            where: { uuid: transaction1_uuid },
                        });

                    expect(transactionInDb).toBeDefined();
                    expect(transactionInDb?.status).toBe('success');

                    // >>> A GARANTIA FINAL E MAIS IMPORTANTE PARA A NOSSA CORREÇÃO <<<
                    expect(transactionInDb?.user_item_uuid).toBe(
                        alimentacao_benefit_user2_uuid
                    );
                });
            });
            describe('E2E Accounts history', () => {
                //THIS TESTS WILL BE FOR RECOVERING HISTORIES CREATED ON PREVIOUS TRANSACTIONS
                describe('E2E App User Item Histories', () => {
                    it('Should throw an error if user item uuid is missing', async () => {
                        const input = {};
                        const result = await request(app)
                            .get('/app-user/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${employeeAuthToken2}`
                            )
                            .send(input);
                        expect(result.statusCode).toBe(400);
                        expect(result.body.error).toBe('Item Id is required');
                    });
                    it('Should throw an error if month provided is less than 1', async () => {
                        const input = {
                            user_item_uuid: correct_benefit_user2_uuid,
                            month: 0,
                        };
                        const result = await request(app)
                            .get('/app-user/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${employeeAuthToken2}`
                            )
                            .query(input);
                        expect(result.statusCode).toBe(400);
                        expect(result.body.error).toBe(
                            'Mês inválido. Por favor, forneça um valor entre 1 e 12.'
                        );
                    });
                    it('Should throw an error if month provided is more than 12', async () => {
                        const input = {
                            user_item_uuid: correct_benefit_user2_uuid,
                            month: 13,
                        };
                        const result = await request(app)
                            .get('/app-user/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${employeeAuthToken2}`
                            )
                            .query(input);
                        expect(result.statusCode).toBe(400);
                        expect(result.body.error).toBe(
                            'Mês inválido. Por favor, forneça um valor entre 1 e 12.'
                        );
                    });
                    it('Should throw an error if user item does not belong to requesting user', async () => {
                        const input = {
                            user_item_uuid: correct_benefit_user2_uuid,
                        };
                        const result = await request(app)
                            .get('/app-user/account/history')
                            .set('Authorization', `Bearer ${employeeAuthToken}`)
                            .query(input);
                        expect(result.statusCode).toBe(403);
                        expect(result.body.error).toBe('Unauthorized access');
                    });
                    it('should return the correct history for the cashback received', async () => {
                        const input = {
                            user_item_uuid: correct_benefit_user2_uuid,
                        };
                        const result = await request(app)
                            .get('/app-user/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${employeeAuthToken2}`
                            )
                            .query(input);

                        expect(result.statusCode).toBe(200);
                        const historyEntry = result.body[0]; // Pega o registro de histórico mais recente

                        // <<< MUDANÇA: Comparações dinâmicas e em centavos >>>
                        expect(historyEntry.amount * 100).toBe(
                            expected_cashback_in_cents
                        );
                        expect(historyEntry.balance_before * 100).toBe(
                            employee2_cashback_initial_balance_in_cents
                        );
                        expect(historyEntry.balance_after * 100).toBe(
                            employee2_cashback_initial_balance_in_cents +
                                expected_cashback_in_cents
                        );
                        expect(historyEntry.event_type).toBe(
                            'CASHBACK_RECEIVED'
                        );
                        expect(historyEntry.related_transaction_uuid).toBe(
                            transaction1_uuid
                        );
                    });

                    it('should return the correct history for the benefit spent on transaction 1', async () => {
                        const input = {
                            user_item_uuid: alimentacao_benefit_user2_uuid,
                        };
                        const result = await request(app)
                            .get('/app-user/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${employeeAuthToken2}`
                            )
                            .query(input);

                        expect(result.statusCode).toBe(200);
                        const historyEntry = result.body[0];

                        // <<< MUDANÇA: Comparações dinâmicas e em centavos >>>
                        expect(historyEntry.amount * 100).toBe(
                            -transaction1_net_price_in_cents
                        );
                        expect(historyEntry.balance_before * 100).toBe(
                            employee2_alimentacao_initial_balance_in_cents
                        );
                        expect(historyEntry.balance_after * 100).toBe(
                            employee2_alimentacao_initial_balance_in_cents -
                                transaction1_net_price_in_cents
                        );
                        expect(historyEntry.event_type).toBe('ITEM_SPENT');
                        expect(historyEntry.related_transaction_uuid).toBe(
                            transaction1_uuid
                        );
                    });
                });
                describe('E2E Business account histories', () => {
                    it('Should return no history (Empty array)', async () => {
                        const result = await request(app)
                            .get('/business/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${partner_auth_token2}`
                            );
                        expect(result.statusCode).toBe(200);
                        expect(result.body.length).toBe(0);
                    });

                    it('should return the correct business account history for the receiving partner', async () => {
                        const result = await request(app)
                            .get('/business/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${partner_auth_token3}`
                            );
                        expect(result.statusCode).toBe(200);
                        expect(result.body.length).toBeGreaterThan(0);

                        const historyEntry = result.body[0]; // Pega o registro mais recente

                        // Validação detalhada do conteúdo do histórico (API retorna em Reais)
                        expect(historyEntry.event_type).toBe(
                            'PAYMENT_RECEIVED'
                        );
                        expect(historyEntry.amount).toBeCloseTo(
                            expected_partner_net_amount_in_cents / 100
                        );
                        expect(historyEntry.balance_before).toBeCloseTo(
                            partner3_initial_liquid_balance_in_cents / 100
                        );
                        expect(historyEntry.balance_after).toBeCloseTo(
                            (partner3_initial_liquid_balance_in_cents +
                                expected_partner_net_amount_in_cents) /
                                100
                        );
                        expect(historyEntry.related_transaction_uuid).toBe(
                            transaction1_uuid
                        );
                    });
                });
            });

            describe('E2E Process Post-Paid Transaction', () => {
                let post_paid_transaction_uuid: string;
                // Variáveis para armazenar saldos em CENTAVOS para cálculos precisos
                let partner3_initial_liquid_balance_in_cents: number;
                let correct_admin_initial_balance_in_cents: number;
                let employee2_convenio_initial_limit_in_cents: number;
                let employee2_cashback_initial_balance_in_cents: number;

                let expected_post_paid_fee_in_cents: number;
                let expected_post_paid_cashback_in_cents: number;
                let expected_partner_credit_amount_in_cents: number;

                beforeAll(async () => {
                    // A API retorna saldos em Reais. Capturamos e convertemos para centavos para usar nos cálculos do teste.
                    const partnerAccount = await request(app)
                        .get('/business/admin/account')
                        .set('Authorization', `Bearer ${partner_auth_token3}`);
                    partner3_initial_liquid_balance_in_cents = Math.round(
                        partnerAccount.body.balance * 100
                    );

                    const correctAdminAccount = await request(app)
                        .get('/admin/account')
                        .set('Authorization', `Bearer ${correctAdminToken}`);
                    correct_admin_initial_balance_in_cents = Math.round(
                        correctAdminAccount.body.balance * 100
                    );

                    const convenioBenefit = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: convenio_benefit_user2_uuid });
                    employee2_convenio_initial_limit_in_cents = Math.round(
                        convenioBenefit.body.balance * 100
                    );

                    const cashbackBenefit = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: correct_benefit_user2_uuid });
                    employee2_cashback_initial_balance_in_cents = Math.round(
                        cashbackBenefit.body.balance * 100
                    );

                    // Validação do setup: Confirmamos que o saldo inicial do convênio é R$ 350,00
                    expect(employee2_convenio_initial_limit_in_cents).toBe(
                        35000
                    );
                });

                it('should process a post-paid benefit and create a partner credit with the correct cycle settlement date', async () => {
                    // 1. ARRANGE: Partner cria uma transação (valores em Reais)
                    const transactionInput = {
                        original_price: 1.5,
                        discount_percentage: 0,
                        net_price: 1.5,
                    };
                    const createTransaction = await request(app)
                        .post('/pos-transaction')
                        .set('Authorization', `Bearer ${partner_auth_token3}`)
                        .send(transactionInput);

                    expect(createTransaction.statusCode).toBe(201);
                    post_paid_transaction_uuid =
                        createTransaction.body.transaction_uuid;
                    expected_post_paid_fee_in_cents = Math.round(
                        createTransaction.body.fee_amount * 100
                    );
                    expected_post_paid_cashback_in_cents = Math.round(
                        createTransaction.body.cashback * 100
                    );
                    expected_partner_credit_amount_in_cents =
                        Math.round(transactionInput.net_price * 100) -
                        expected_post_paid_fee_in_cents;

                    // 2. ACT: Employee processes the payment
                    const paymentInput = {
                        transactionId: post_paid_transaction_uuid,
                        benefit_uuid: convenio_benefit_user2_uuid,
                        incoming_pin: '1234',
                    };

                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .send(paymentInput);

                    // 3. ASSERT: Checar a resposta imediata da API (valores em Reais)
                    expect(result.statusCode).toBe(200);
                    expect(result.body.result).toBeTruthy();
                    expect(result.body.finalBalance).toBeCloseTo(
                        employee2_convenio_initial_limit_in_cents / 100 -
                            transactionInput.net_price
                    );
                    expect(result.body.cashback).toBe(
                        expected_post_paid_cashback_in_cents / 100
                    );

                    // 4. ASSERT: Checar o estado final das contas, buscando novamente os dados
                    const convenioBenefitAfter = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: convenio_benefit_user2_uuid });
                    expect(convenioBenefitAfter.body.balance * 100).toBe(
                        employee2_convenio_initial_limit_in_cents -
                            transactionInput.net_price * 100
                    );

                    const cashbackBenefitAfter = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: correct_benefit_user2_uuid });
                    expect(cashbackBenefitAfter.body.balance * 100).toBe(
                        employee2_cashback_initial_balance_in_cents +
                            expected_post_paid_cashback_in_cents
                    );

                    const correctAdminAccountAfter = await request(app)
                        .get('/admin/account')
                        .set('Authorization', `Bearer ${correctAdminToken}`);
                    expect(correctAdminAccountAfter.body.balance * 100).toBe(
                        correct_admin_initial_balance_in_cents +
                            expected_post_paid_fee_in_cents
                    );

                    const partnerAccountAfter = await request(app)
                        .get('/business/admin/account')
                        .set('Authorization', `Bearer ${partner_auth_token3}`);
                    expect(partnerAccountAfter.body.balance * 100).toBe(
                        partner3_initial_liquid_balance_in_cents
                    );

                    // 5. ASSERT CRÍTICO: Verificar o PartnerCredit criado e sua data de liquidação
                    // O teste calcula a data esperada, exatamente como o backend faz.
                    // Hoje é 07/08/2025. Com delay de 2 meses e dia 10, a data esperada é 10/10/2025.
                    const expectedSettlementDate =
                        calculateCycleSettlementDateAsDate(new Date());

                    const partnerCredits = await request(app)
                        .get('/business/admin/credits')
                        .set('Authorization', `Bearer ${partner_auth_token3}`);
                    expect(partnerCredits.statusCode).toBe(200);
                    const newCredit = partnerCredits.body.find(
                        (credit: any) =>
                            credit.original_transaction_uuid ===
                            post_paid_transaction_uuid
                    );
                    expect(newCredit).toBeDefined();
                    expect(newCredit.balance * 100).toBe(
                        expected_partner_credit_amount_in_cents
                    );
                    expect(newCredit.status).toBe('PENDING');

                    // Comparamos a data retornada pela API com a data calculada pelo teste.
                    // Usamos toISOString() para uma comparação de texto precisa e padronizada.
                    expect(
                        new Date(newCredit.availability_date).toISOString()
                    ).toBe(expectedSettlementDate.toISOString());

                    // 6. ASSERT: Validar o estado final do registro da transação (A GARANTIA)
                    const transactionInDb =
                        await prismaClient.transactions.findUnique({
                            where: { uuid: post_paid_transaction_uuid },
                        });

                    expect(transactionInDb).toBeDefined();
                    expect(transactionInDb?.status).toBe('success');

                    // >>> A GARANTIA FINAL PARA A NOSSA CORREÇÃO <<<
                    // Verificamos se o UUID do benefício pós-pago foi corretamente salvo na transação.
                    expect(transactionInDb?.user_item_uuid).toBe(
                        convenio_benefit_user2_uuid
                    );
                });
            });

            describe('E2E Process Post-Paid Transaction', () => {
                // <<< MUDANÇA 1: Declaramos as variáveis que serão compartilhadas entre os testes aqui >>>
                let post_paid_transaction_uuid: string;
                let transaction_net_price_in_cents: number;

                // Variáveis de estado inicial (em centavos), preenchidas no beforeAll
                let partner3_initial_liquid_balance_in_cents: number;
                let correct_admin_initial_balance_in_cents: number;
                let employee2_convenio_initial_limit_in_cents: number;
                let employee2_cashback_initial_balance_in_cents: number;

                beforeAll(async () => {
                    // <<< ETAPA 2: O beforeAll prepara o estado inicial para TODOS os testes filhos >>>
                    const convenioBenefit = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: convenio_benefit_user2_uuid });
                    employee2_convenio_initial_limit_in_cents = Math.round(
                        convenioBenefit.body.balance * 100
                    );

                    const cashbackBenefit = await request(app)
                        .get('/user-item')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .query({ userItemId: correct_benefit_user2_uuid });
                    employee2_cashback_initial_balance_in_cents = Math.round(
                        cashbackBenefit.body.balance * 100
                    );

                    const correctAdminAccount = await request(app)
                        .get('/admin/account')
                        .set('Authorization', `Bearer ${correctAdminToken}`);
                    correct_admin_initial_balance_in_cents = Math.round(
                        correctAdminAccount.body.balance * 100
                    );

                    const partnerAccount = await request(app)
                        .get('/business/admin/account')
                        .set('Authorization', `Bearer ${partner_auth_token3}`);
                    partner3_initial_liquid_balance_in_cents = Math.round(
                        partnerAccount.body.balance * 100
                    );

                    // Validação do setup para garantir que o teste tem um ponto de partida conhecido
                    expect(
                        employee2_convenio_initial_limit_in_cents
                    ).toBeGreaterThan(0);
                });

                it('should process a post-paid benefit correctly', async () => {
                    // ARRANGE
                    const transactionInput = {
                        original_price: 1.5,
                        discount_percentage: 0,
                        net_price: 1.5,
                    };
                    const createTransaction = await request(app)
                        .post('/pos-transaction')
                        .set('Authorization', `Bearer ${partner_auth_token3}`)
                        .send(transactionInput);
                    expect(createTransaction.statusCode).toBe(201);

                    // <<< MUDANÇA 2: Atribuímos valor às variáveis compartilhadas >>>
                    post_paid_transaction_uuid =
                        createTransaction.body.transaction_uuid;
                    transaction_net_price_in_cents = Math.round(
                        transactionInput.net_price * 100
                    );

                    const expected_fee_in_cents = Math.round(
                        createTransaction.body.fee_amount * 100
                    );
                    const expected_cashback_in_cents = Math.round(
                        createTransaction.body.cashback * 100
                    );
                    const expected_partner_credit_amount_in_cents =
                        transaction_net_price_in_cents - expected_fee_in_cents;

                    // ACT
                    const paymentInput = {
                        transactionId: post_paid_transaction_uuid,
                        benefit_uuid: convenio_benefit_user2_uuid,
                        incoming_pin: '1234',
                    };
                    const result = await request(app)
                        .post('/pos-transaction/processing')
                        .set('Authorization', `Bearer ${employeeAuthToken2}`)
                        .send(paymentInput);

                    // ASSERT (As asserções do pagamento principal continuam aqui, como já estavam)
                    expect(result.statusCode).toBe(200);
                });

                describe('E2E Post-Paid Account Histories', () => {
                    it("should create a history record for the user's limit usage", async () => {
                        const input = {
                            user_item_uuid: convenio_benefit_user2_uuid,
                        };
                        const result = await request(app)
                            .get('/app-user/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${employeeAuthToken2}`
                            )
                            .query(input);
                        expect(result.statusCode).toBe(200);
                        // Procuramos o registro de histórico específico da nossa transação
                        const historyEntry = result.body.find(
                            (entry: any) =>
                                entry.related_transaction_uuid ===
                                post_paid_transaction_uuid
                        );

                        expect(historyEntry).toBeDefined();
                        expect(historyEntry.event_type).toBe('ITEM_SPENT');
                        // Comparamos com os valores dinâmicos, não com números fixos
                        expect(historyEntry.amount).toBeCloseTo(
                            -transaction_net_price_in_cents / 100
                        );
                        expect(historyEntry.balance_before).toBeCloseTo(
                            employee2_convenio_initial_limit_in_cents / 100
                        );
                        expect(historyEntry.balance_after).toBeCloseTo(
                            (employee2_convenio_initial_limit_in_cents -
                                transaction_net_price_in_cents) /
                                100
                        );
                    });

                    it("should NOT create a PAYMENT_RECEIVED history for the partner's liquid BusinessAccount", async () => {
                        const result = await request(app)
                            .get('/business/account/history')
                            .set(
                                'Authorization',
                                `Bearer ${partner_auth_token3}`
                            );
                        expect(result.statusCode).toBe(200);
                        // Verificamos que na lista de históricos do parceiro, NENHUM registro corresponde à nossa transação pós-paga
                        const postPaidEntry = result.body.find(
                            (entry: any) =>
                                entry.related_transaction_uuid ===
                                post_paid_transaction_uuid
                        );
                        expect(postPaidEntry).toBeUndefined();
                    });
                });
            });
        });
    });
});
