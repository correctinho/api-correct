import request from 'supertest';
import { app } from '../../app';
import { InputCreateAppUserDTO } from '../../modules/AppUser/app-user-dto/app-user.dto';
import { InputCreateBenefitDto } from '../../modules/benefits/usecases/create-benefit/create-benefit.dto';
import { Uuid } from '../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../infra/databases/prisma.config';

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

        //*****Craete User Info***** */
        //***create user info 1***** */
        const inputUserInfo1: 
        any = {
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
            .set('Authorization', `Bearer ${userToken1}`)
            .send(inputUserInfo1);
        expect(resultUserInfo1.statusCode).toBe(201);

        //***create user info 12***** */
        const inputUserInfo2: 
        any = {
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
            .set('Authorization', `Bearer ${userToken2}`)
            .send(inputUserInfo2);
        console.log(resultUserInfo2.body)
        expect(resultUserInfo2.statusCode).toBe(201);

        //***create user info 3***** */
        const inputUserInfo3: 
        any = {
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
            .set('Authorization', `Bearer ${userToken3}`)
            .send(inputUserInfo3);
        expect(resultUserInfo3.statusCode).toBe(201);
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
                        Authorization: `Bearer ${userToken1}`,
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
                        Authorization: `Bearer ${userToken1}`,
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
                        Authorization: `Bearer ${userToken1}`,
                    });
                pixChargeTransactionId = result.body.transactionId;
                expect(result.statusCode).toBe(201);
                expect(result.body).toHaveProperty('pixCopyPaste');

                //Get pix charge created
                const pixCreated = await prismaClient.transactions.findFirst({
                    where:{
                        uuid: result.body.transactionId
                    }
                })

                const userInfo = await prismaClient.userInfo.findUnique({
                    where:{
                        document: inputNewAppUser1.document.replace(".","").replace(".","").replace("-","")
                    }
                })


                const userItem = await prismaClient.userItem.findFirst({
                    where:{
                        uuid: pixCreated.user_item_uuid
                    }
                })
                expect(userItem.item_name).toBe("Correct")
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
                expect(pixCreated.description).toBeNull()
                expect(pixCreated.provider_tx_id).toBeTruthy()
                expect(pixCreated.pix_e2e_id).toBeNull()
                expect(pixCreated?.status).toBe('pending');
                expect(pixCreated?.transaction_type).toBe('CASH_IN_PIX_USER');
                expect(pixCreated.favored_partner_user_uuid).toBeNull()
                expect(pixCreated.paid_at).toBeNull()
                expect(pixCreated.created_at).toBeTruthy()
                expect(pixCreated.updated_at).toBeTruthy()
            });
           
        });
        describe('Webhook Processing', () => {
            let pixCreatedBeforeWebhook: any
            beforeAll(async () => {
                // ARRANGE: Buscamos a transação 'pending' que foi criada no teste anterior.
                // Usamos a variável `pixChargeTransactionId` que você já salvou.
                pixCreatedBeforeWebhook = await prismaClient.transactions.findUnique({
                    where: {
                        uuid: pixChargeTransactionId
                    }
                });
                
                // Uma verificação para garantir que nosso setup está correto
                expect(pixCreatedBeforeWebhook).toBeDefined();
                expect(pixCreatedBeforeWebhook?.status).toBe('pending');

            });
            
            it("Should process a valid webhook notification, credit the user's balance, and update the transaction status", async () => {
                // ARRANGE (Continuação)
                
                // 1. Buscar o saldo do UserItem ANTES do webhook
                const userItemBefore = await prismaClient.userItem.findUnique({
                    where: { uuid: pixCreatedBeforeWebhook.user_item_uuid }
                });
                const balanceBefore = userItemBefore.balance;

                // 2. Montar o payload do webhook simulando a resposta do Sicredi
                //    É crucial usar o `provider_tx_id` da transação que estamos testando!
                const webhookPayload = {
                    pix: [
                        {
                            endToEndId: `E${Date.now()}${Math.random().toString().slice(2, 12)}`, // Simula um E2E ID único
                            txid: pixCreatedBeforeWebhook.provider_tx_id, // <<< O PONTO DE LIGAÇÃO
                            valor: (pixCreatedBeforeWebhook.net_price / 100).toFixed(2), // Ex: "10.00"
                            horario: new Date().toISOString()
                        }
                    ]
                };

                // ACT: Chamar o endpoint do webhook
                const result = await request(app)
                    .post('/webhooks/sicredi-pix') // Use a rota real do webhook
                    .send(webhookPayload);

                // ASSERT

                // 1. A resposta da API deve ser sucesso
                expect(result.statusCode).toBe(200);

                // 2. Verificar o estado da TRANSAÇÃO no banco de dados DEPOIS do webhook
                const transactionAfter = await prismaClient.transactions.findUnique({
                    where: { uuid: pixChargeTransactionId }
                });
                expect(transactionAfter).toBeDefined();
                expect(transactionAfter?.status).toBe('success'); // O status deve ter mudado!
                expect(transactionAfter?.pix_e2e_id).toBe(webhookPayload.pix[0].endToEndId); // O endToEndId foi salvo
                expect(transactionAfter?.paid_at).toBeTruthy(); // O paid_at foi preenchido

                // 3. Verificar o estado do USER ITEM no banco de dados DEPOIS do webhook
                const userItemAfter = await prismaClient.userItem.findUnique({
                    where: { uuid: pixCreatedBeforeWebhook.user_item_uuid }
                });
                const expectedBalanceAfter = balanceBefore + pixCreatedBeforeWebhook.net_price;
                expect(userItemAfter?.balance).toBe(expectedBalanceAfter); // O saldo foi creditado!

                // 4. Verificar a criação do registro no HISTÓRICO
                const historyEntry = await prismaClient.userItemHistory.findFirst({
                    where: {
                        related_transaction_uuid: pixChargeTransactionId
                    }
                });
                expect(historyEntry).toBeDefined();
                expect(historyEntry?.event_type).toBe('PIX_RECEIVED');
                expect(historyEntry?.amount).toBe(pixCreatedBeforeWebhook.net_price);
                expect(historyEntry?.balance_before).toBe(balanceBefore);
                expect(historyEntry?.balance_after).toBe(expectedBalanceAfter);
            });
            
            // Adicione outros testes para o webhook aqui, se necessário:
            // - Teste para um webhook com txid que não existe
            // - Teste para um webhook de uma transação que já está 'success' (teste de idempotência)
            // - Teste para um webhook com valor incorreto
        });
    });
});
