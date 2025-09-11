// import request from "supertest"
// import { app } from "../../app"
// import { InputCreateAppUserDTO } from "../../modules/AppUser/app-user-dto/app-user.dto";
// import { InputCreateBenefitDto } from "../../modules/benefits/usecases/create-benefit/create-benefit.dto";
// import { Uuid } from "../../@shared/ValueObjects/uuid.vo";

// let userToken1: string;
// let userToken2: string;
// let userToken3: string

// let correctAdminToken: string

// let partner_info_uuid: string
// let partner_info_uuid2: string
// let partner_info_uuid3: string

// const documentUser1 = '875.488.760-76'
// const inputNewAppUser1: InputCreateAppUserDTO = {
//     user_info_uuid: null,
//     document: documentUser1,
//     email: 'email@email.com',
//     password: 'senha123',
//     is_active: true
// }
// const inputNewAppUser2: InputCreateAppUserDTO = {
//     user_info_uuid: null,
//     document: '283.330.980-53',
//     email: 'email2@email.com',
//     password: 'senha123',
//     is_active: true
// }

// const inputNewAppUser3: InputCreateAppUserDTO = {
//     user_info_uuid: null,
//     document: '915.583.910-02',
//     email: 'email3@email.com',
//     password: 'senha123',
//     is_active: true
// }

// const authenticateAppUser1 = {
//     document: inputNewAppUser1.document,
//     password: inputNewAppUser1.password
// }

// const authenticateAppUser2 = {
//     document: inputNewAppUser2.document,
//     password: inputNewAppUser2.password
// }

// const authenticateAppUser3 = {
//     document: inputNewAppUser3.document,
//     password: inputNewAppUser3.password
// }

// let partner_user_uuid2: string
// let partner_auth_token2: string
// let partner_user_uuid3: string
// let partner_auth_token3: string

// let benefit0_uuid: Uuid
// let benefit1_uuid: Uuid
// let benefit2_uuid: Uuid
// let benefit3_uuid: Uuid
// let benefit4_uuid: Uuid

// let branch1_uuid: string
// let branch2_uuid: string
// let branch3_uuid: string
// let branch4_uuid: string
// let branch5_uuid: string
// describe("E2E Transactions", () => {
//     beforeAll(async () => {
//         const inputNewAdmin = {
//             name: "Admin Correct",
//             email: "admincorrect@correct.com.br",
//             userName: "admin-correct",
//             password: "123"
//         }
//         //create correct admin
//         await request(app).post('/admin').send(inputNewAdmin)

//         const authenticateAdmin = {
//             userName: inputNewAdmin.userName,
//             password: inputNewAdmin.password
//         }
//         //authenticate correct admin
//         const result = await request(app).post('/login').send(authenticateAdmin)
//         expect(result.statusCode).toBe(200)
//         correctAdminToken = result.body.token

//         const benefit0 = {
//             name: "Correct",
//             description: "Descrição do vale",
//             parent_uuid: null as any,
//             item_type: 'gratuito',
//             item_category: 'pre_pago',
//         }

//         //create items
//         const benefit1: InputCreateBenefitDto = {
//             name: "Vale Alimentação",
//             description: "Descrição do vale",
//             parent_uuid: null,
//             item_type: 'gratuito',
//             item_category: 'pre_pago',
//         }


//         const benefit2: InputCreateBenefitDto = {
//             name: "Adiantamento Salarial",
//             description: "Descrição do vale",
//             parent_uuid: null,
//             item_type: 'gratuito',
//             item_category: 'pos_pago',
//         }
//         const benefit3: InputCreateBenefitDto = {
//             name: "Convênio",
//             description: "Descrição do vale",
//             parent_uuid: null,
//             item_type: 'gratuito',
//             item_category: 'pos_pago',
//         }
//         const benefit4: InputCreateBenefitDto = {
//             name: "Vale Refeição",
//             description: "Descrição do vale",
//             parent_uuid: null,
//             item_type: 'gratuito',
//             item_category: 'pre_pago',
//         }


//         const benefit0Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit0);
//         const benefit1Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit1);
//         const benefit2Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit2);
//         const benefit3Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit3);
//         const benefit4Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit4);

//         benefit0_uuid = benefit0Response.body.uuid
//         benefit1_uuid = benefit1Response.body.uuid
//         benefit2_uuid = benefit2Response.body.uuid
//         benefit3_uuid = benefit3Response.body.uuid
//         benefit4_uuid = benefit4Response.body.uuid

//         //create branches
//         const branchesByName = [
//             {
//                 name: "Hipermercados",
//                 marketing_tax: 1.00,
//                 admin_tax: 1.50,
//                 market_place_tax: 1.20,
//                 benefits_name: ['Adiantamento Salarial', 'Vale Alimentação', 'Correct']
//             },

//             {
//                 name: "Supermercados",
//                 marketing_tax: 1.00,
//                 admin_tax: 1.50,
//                 market_place_tax: 1.20,
//                 benefits_name: ['Adiantamento Salarial', 'Vale Refeição', 'Correct']
//             },

//             {
//                 name: "Mercearias",
//                 marketing_tax: 1.30,
//                 admin_tax: 1.40,
//                 market_place_tax: 1.30,
//                 benefits_name: ['Convênio', 'Vale Alimentação', 'Correct']
//             },
//             {
//                 name: "Restaurantes",
//                 marketing_tax: 1.80,
//                 admin_tax: 1.70,
//                 market_place_tax: 1.60,
//                 benefits_name: ['Vale Refeição', 'Vale Alimentação', 'Correct']
//             },

//             {
//                 name: "Alimentação",
//                 marketing_tax: 2.00,
//                 admin_tax: 2.50,
//                 market_place_tax: 220,
//                 benefits_name: ['Vale Refeição', 'Vale Alimentação', 'Correct']
//             }
//         ]


//         const branches = await request(app)
//             .post(`/branch`)
//             .set('Authorization', `Bearer ${correctAdminToken}`)
//             .send(branchesByName);
//         branch1_uuid = branches.body[0].uuid
//         branch2_uuid = branches.body[1].uuid
//         branch3_uuid = branches.body[2].uuid
//         branch4_uuid = branches.body[3].uuid
//         branch5_uuid = branches.body[4].uuid

//         //partner 1
//         const input = {
//             line1: "Rua",
//             line2: "72B",
//             line3: "",
//             neighborhood: "Bairro Teste",
//             postal_code: "5484248423",
//             city: "Campo Grande",
//             state: "Estado teste",
//             country: "País teste",
//             fantasy_name: "Mercado Empresa teste 1",
//             document: "comercio",
//             classification: "Classificação",
//             colaborators_number: 5,
//             email: "comercio@comercio.com",
//             phone_1: "215745158",
//             phone_2: "124588965",
//             business_type: "comercio",
//             branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
//             partnerConfig: {
//                 main_branch: branch4_uuid,
//                 partner_category: ['saude'],
//                 use_marketing: false,
//                 use_market_place: false
//             }
//         }

//         const partner1 = await request(app).post("/business/register").send(input)
//         expect(partner1.statusCode).toBe(201)
//         partner_info_uuid = partner1.body.BusinessInfo.uuid

//         //partner 2
//         const input2 = {
//             line1: "Rua",
//             line2: "72B",
//             line3: "",
//             neighborhood: "Bairro Teste",
//             postal_code: "5484248423",
//             city: "Campo Grande",
//             state: "Estado teste",
//             country: "País teste",
//             fantasy_name: "Mercado Empresa teste 2",
//             document: "comercio2",
//             classification: "Classificação",
//             colaborators_number: 5,
//             email: "comercio2@comercio.com",
//             phone_1: "215745158",
//             phone_2: "124588965",
//             business_type: "comercio",
//             branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
//             partnerConfig: {
//                 main_branch: branch1_uuid,
//                 partner_category: ['saude'],
//                 use_marketing: false,
//                 use_market_place: false
//             }
//         }

//         const partner2 = await request(app).post("/business/register").send(input2)
//         expect(partner2.statusCode).toBe(201)
//         partner_info_uuid2 = partner2.body.BusinessInfo.uuid

//         //partner 3
//         const input3 = {
//             line1: "Rua",
//             line2: "72B",
//             line3: "",
//             neighborhood: "Bairro Teste",
//             postal_code: "5484248423",
//             city: "Campo Grande",
//             state: "Estado teste",
//             country: "País teste",
//             fantasy_name: "Empresa teste 3",
//             document: "comercio3",
//             classification: "Classificação",
//             colaborators_number: 5,
//             email: "comercio3@comercio.com",
//             phone_1: "215745158",
//             phone_2: "124588965",
//             business_type: "comercio",
//             branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
//             partnerConfig: {
//                 main_branch: branch3_uuid,
//                 partner_category: ['comercio'],
//                 use_marketing: true,
//                 use_market_place: true
//             }
//         }

//         const partner3 = await request(app).post("/business/register").send(input3)
//         expect(partner3.statusCode).toBe(201)
//         partner_info_uuid3 = partner3.body.BusinessInfo.uuid

//         //activate partner3
//         const activatePartner3Input = {
//             status: 'active'

//         }
//         const query = {
//             business_info_uuid: partner_info_uuid3
//         }
//         const activatePartner3 = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(activatePartner3Input)
//         expect(activatePartner3.statusCode).toBe(200)

//     })
//     describe("E2E POS transactions", () => {

//         let inputTransaction1: {
//             original_price: number,
//             discount_percentage: number,
//             net_price: number

//         }
//         let transaction1_uuid: string;
//         let transaction1_net_price_in_cents: number;
//         let expected_fee_in_cents: number;
//         let expected_cashback_in_cents: number;
//         let expected_partner_net_amount_in_cents: number;

//         let partner3_initial_liquid_balance_in_cents: number;
//         let correct_admin_initial_balance_in_cents: number;
//         let employee2_alimentacao_initial_balance_in_cents: number;
//         let employee2_cashback_initial_balance_in_cents: number;

//         //first we need to create transactions by partner
//         beforeAll(async () => {
//             //lets first create partner users
//             const inputPartner2 = {
//                 password: "123456",
//                 business_info_uuid: partner_info_uuid2,
//                 email: "comercio2@comercio.com",
//                 name: "partner2"
//             }
//             const inputPartner3 = {
//                 password: "123456",
//                 business_info_uuid: partner_info_uuid3,
//                 email: "comercio3@comercio.com",
//                 name: "Nome do admin partner"
//             }

//             const input2 = {
//                 line1: "Rua",
//                 line2: "72B",
//                 line3: "",
//                 neighborhood: "Bairro Teste",
//                 postal_code: "5484248423",
//                 city: "Campo Grande",
//                 state: "Estado teste",
//                 country: "País teste",
//                 fantasy_name: "Mercado Empresa teste 2",
//                 document: "comercio2",
//                 classification: "Classificação",
//                 colaborators_number: 5,
//                 email: "comercio2@comercio.com",
//                 phone_1: "215745158",
//                 phone_2: "124588965",
//                 business_type: "comercio",
//                 branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
//                 partnerConfig: {
//                     main_branch: branch1_uuid,
//                     partner_category: ['saude'],
//                     use_marketing: false,
//                     use_market_place: false
//                 }
//             }
//             //WE NEED TO ACTIVATE PARTNER 2 BEFORE CREATING AN USER
//             const inputActivatePartner2 = {
//                 status: "active"
//             }
//             const queryToActivatePartner2 = {
//                 business_info_uuid: partner_info_uuid2
//             }

//             const activatePartner2 = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(queryToActivatePartner2).send(inputActivatePartner2)
//             expect(activatePartner2.statusCode).toBe(200)

//             const createPartner2 = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(inputPartner2)
//             expect(createPartner2.statusCode).toBe(201)
//             partner_user_uuid2 = createPartner2.body.uuid

//             const createPartner3 = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(inputPartner3)
//             expect(createPartner3.statusCode).toBe(201)
//             partner_user_uuid3 = createPartner3.body.uuid

//             //NOW WE NEED TO AUTHENTICATE THIS NEW USER SO HE CAN CREATE TRANSACTIONS
//             const authenticateAdminPartner2 = {
//                 business_document: "comercio2",
//                 password: inputPartner2.password,
//                 email: inputPartner2.email
//             }

//             const authenticateAdminPartner3 = {
//                 business_document: "comercio3",
//                 password: inputPartner3.password,
//                 email: inputPartner3.email
//             }
//             //authenticate partners admin
//             const adminPartner2Auth = await request(app).post('/business/admin/login').send(authenticateAdminPartner2)
//             expect(adminPartner2Auth.statusCode).toBe(200)

//             const adminPartner3Auth = await request(app).post('/business/admin/login').send(authenticateAdminPartner3)
//             expect(adminPartner3Auth.statusCode).toBe(200)

//             partner_auth_token2 = adminPartner2Auth.body.token
//             partner_auth_token3 = adminPartner3Auth.body.token

//             //NOW WE NEED TO CREATE AN TRANSACTION
//             inputTransaction1 = {
//                 original_price: 99.55,
//                 discount_percentage: 0,
//                 net_price: 99.55

//             }
//             const createTransaction = await request(app).post("/pos-transaction").set('Authorization', `Bearer ${partner_auth_token3}`).send(inputTransaction1)
//             transaction1_uuid = createTransaction.body.transaction_uuid
//             expect(createTransaction.statusCode).toBe(201)

//             expected_fee_in_cents = createTransaction.body.fee_amount * 100// fee em reais
//             expected_cashback_in_cents = createTransaction.body.cashback * 100

//             //Get employee 1 user items
//             const employee1UserItems = await request(app).get("/user-item/all").set('Authorization', `Bearer ${employeeAuthToken}`)
//             expect(employee1UserItems.statusCode).toBe(200)
//             correct_benefit_user1_uuid = employee1UserItems.body.find((item: any) => item.item_name === 'Correct').uuid;
//             alimentacao_benefit_user1_uuid = employee1UserItems.body.find((item: any) => item.item_name === 'Vale Alimentação').uuid;
//             convenio_benefit_user1_uuid = employee1UserItems.body.find((item: any) => item.item_name === 'Convênio').uuid;

//             //Get employee 2 user items
//             const employee2UserItems = await request(app).get("/user-item/all").set('Authorization', `Bearer ${employeeAuthToken2}`)
//             expect(employee2UserItems.statusCode).toBe(200)
//             correct_benefit_user2_uuid = employee2UserItems.body.find((item: any) => item.item_name === 'Correct').uuid;
//             alimentacao_benefit_user2_uuid = employee2UserItems.body.find((item: any) => item.item_name === 'Vale Alimentação').uuid;
//             blocked_adiantamento_benefit_user2_uuid = employee2UserItems.body.find((item: any) => item.item_name === 'Adiantamento Salarial').uuid;
//             convenio_benefit_user2_uuid = employee2UserItems.body.find((item: any) => item.item_name === 'Convênio').uuid;

//             //HERE WE ARE GOING TO BLOCK ADIANTAMENTO BENEFIT FOR EMPLOYEE 2 FOR TESTS PURPOSES
//             const blockInput: any = {
//                 user_item_uuid: blocked_adiantamento_benefit_user2_uuid,
//                 status: 'blocked'
//             }
//             const blockEmployee2Adiantamento = await request(app).patch("/user-item/employer").set('Authorization', `Bearer ${employer_user_token}`).send(blockInput)
//             expect(blockEmployee2Adiantamento.statusCode).toBe(200)
//             expect(blockEmployee2Adiantamento.body.status).toBe('blocked')

//         })
//     })
// })