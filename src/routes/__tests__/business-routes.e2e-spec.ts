import request from 'supertest'
import { app } from '../../app'
import { InputCreateBenefitDto } from '../../modules/benefits/usecases/create-benefit/create-benefit.dto'
import { Uuid } from '../../@shared/ValueObjects/uuid.vo'
import { randomUUID } from 'crypto'
import { ItemCategory, ItemType, SalesType } from '@prisma/client'

let correctAdminToken: string
let correctSellerToken: string

let partner_info_uuid: string
let partner2_info_uuid: string

let partner_address_uuid: string
let partner2_address_uuid: string
let employer_info_uuid: string
let employer_address_uuid: string
let partner_admin_token: string
let partner_admin_uuid: string

let partner_finances_user_uuid: string
let partner_finances_user_token: string

let employer_user_token: string
let employer_user_uuid: string

let benefit1_uuid: Uuid
let benefit2_uuid: Uuid
let benefit3_uuid: Uuid
let benefit4_uuid: Uuid


let branch1_uuid: string
let branch2_uuid: string
let branch3_uuid: string
let branch4_uuid: string
let branch5_uuid: string

let item_details_1: string
describe("E2E Business tests", () => {
  beforeAll(async () => {
    const inputNewAdmin = {
      name: "Admin Correct",
      email: "admincorrect@correct.com.br",
      userName: "admin-correct",
      password: "123"
    }
    //create correct admin
    const createCorrectAdmin = await request(app).post('/admin').send(inputNewAdmin)
    expect(createCorrectAdmin.statusCode).toBe(201)

    const authenticateAdmin = {
      userName: inputNewAdmin.userName,
      password: inputNewAdmin.password
    }
    //authenticate correct admin
    const result = await request(app).post('/login').send(authenticateAdmin)
    expect(result.statusCode).toBe(200)
    correctAdminToken = result.body.token

    const inputCorrectSeller = {
      name: "Seller Correct",
      email: "sellercorrect@correct.com.br",
      userName: "seller-correct",
      password: "123"
    }
    const createCorrectSeller = await request(app).post('/seller').set('Authorization', `Bearer ${correctAdminToken}`).send(inputCorrectSeller)
    expect(createCorrectSeller.statusCode).toBe(201)
    expect(createCorrectSeller.body.isAdmin).toBeFalsy()


    const authSellerInput = {
      userName: 'seller-correct',
      password: '123'
    }
    //authenticate seller
    const authSeller = await request(app).post('/login').send(authSellerInput)
    expect(authSeller.statusCode).toBe(200)
    correctSellerToken = authSeller.body.token


    //create items
    const benefit1: InputCreateBenefitDto = {
      name: "Vale Alimentação",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pre_pago',
    }

    const benefit2: InputCreateBenefitDto = {
      name: "Adiantamento Salarial",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pre_pago',
    }
    const benefit3: InputCreateBenefitDto = {
      name: "Convênio",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pre_pago',
    }
    const benefit4: InputCreateBenefitDto = {
      name: "Vale Refeição",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito',
      item_category: 'pre_pago',
    }


    const benefit1Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit1);
    const benefit2Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit2);
    const benefit3Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit3);
    const benefit4Response = await request(app).post('/benefit').set('Authorization', `Bearer ${correctAdminToken}`).send(benefit4);

    benefit1_uuid = benefit1Response.body.uuid
    benefit2_uuid = benefit2Response.body.uuid
    benefit3_uuid = benefit3Response.body.uuid
    benefit4_uuid = benefit4Response.body.uuid

    expect(benefit1Response.statusCode).toBe(201)
    expect(benefit2Response.statusCode).toBe(201)
    expect(benefit3Response.statusCode).toBe(201)
    expect(benefit4Response.statusCode).toBe(201)

    //create branches
    const branchesByName = [
      {
        name: "Hipermercados",
        marketing_tax: 100,
        admin_tax: 150,
        market_place_tax: 120,
        benefits_name: ['Adiantamento Salarial', 'Vale Alimentação']
      },

      {
        name: "Supermercados",
        marketing_tax: 100,
        admin_tax: 150,
        market_place_tax: 120,
        benefits_name: ['Adiantamento Salarial', 'Vale Refeição']
      },

      {
        name: "Mercearias",
        marketing_tax: 130,
        admin_tax: 140,
        market_place_tax: 130,
        benefits_name: ['Convênio', 'Vale Alimentação']
      },
      {
        name: "Restaurantes",
        marketing_tax: 180,
        admin_tax: 170,
        market_place_tax: 160,
        benefits_name: ['Vale Refeição', 'Vale Alimentação']
      },

      {
        name: "Alimentação",
        marketing_tax: 200,
        admin_tax: 250,
        market_place_tax: 220,
        benefits_name: ['Vale Refeição', 'Vale Alimentação']
      }
    ]


    const branches = await request(app)
      .post(`/branch`)
      .set('Authorization', `Bearer ${correctAdminToken}`)
      .send(branchesByName);

    expect(branches.statusCode).toBe(201)

    branch1_uuid = branches.body[0].uuid
    branch2_uuid = branches.body[1].uuid
    branch3_uuid = branches.body[2].uuid
    branch4_uuid = branches.body[3].uuid
    branch5_uuid = branches.body[4].uuid
  })

  describe("Business First Register", () => {
    describe("E2E All Business Type Registers", () => {

      it("Should throw an error if line1 is missing", async () => {
        const input = {
          line1: "",
          line2: "72B",
          line3: "Complemento",
          neighborhood: "Bairro Teste",
          postal_code: "731547854",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Street is required")

      })


      it("Should throw an error if line2 is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "",
          line3: "Complemento",
          neighborhood: "Bairro Teste",
          postal_code: "731547854",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Number is required")

      })

      it("Should throw an error if neighbor is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "Complemento",
          neighborhood: "",
          postal_code: "731547854",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Neighborhood is required")

      })

      it("Should throw an error if postal code is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Zip Code is required")

      })

      it("Should throw an error if city is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("City is required")

      })

      it("Should throw an error if state is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("State is required")

      })

      it("Should throw an error if country is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Country is required")

      })

      it("Should throw an error if fantasy_name is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Fantasy name is required")

      })

      it("Should throw an error if document is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Document is required")

      })

      it("Should throw an error if classification is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "comercio",
          classification: "",
          colaborators_number: 5,
          email: "comercio@comercio.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Company classification is required")

      })

      it("Should throw an error if colaborators is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "comercio",
          classification: "Classificação",
          colaborators_number: 0,
          email: "comercio@comercio.com",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Total employees is required")

      })

      it("Should throw an error if email is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "comercio",
          classification: "Classificação",
          colaborators_number: 5,
          email: "",
          phone_1: "7287569874",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Email is required")

      })

      it("Should throw an error if phone 1 is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Telephone 1 is required")

      })

      it("Should throw an error if business type is missing", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: ""
        }

        const result = await request(app).post("/business/register").send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Business type is required")

      })

      describe("E2E Partner Registers test", () => {
        it("Should throw an error if branch list is missing", async () => {
          const input = {
            line1: "Rua",
            line2: "72B",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "5484248423",
            city: "Cidade teste",
            state: "Estado teste",
            country: "País teste",
            fantasy_name: "Empresa teste",
            document: "CNPJ",
            classification: "Classificação",
            colaborators_number: 5,
            email: "email@email.com",
            phone_1: "215745158",
            phone_2: "124588965",
            business_type: "comercio",
            branches_uuid: ['']
          }

          const result = await request(app).post("/business/register").send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Business branch is required")

        })
        it("Should throw an error if main branch is not one of the branches list", async () => {
          const input = {
            line1: "Rua",
            line2: "72B",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "5484248423",
            city: "Cidade teste",
            state: "Estado teste",
            country: "País teste",
            fantasy_name: "Empresa teste",
            document: "comercio",
            classification: "Classificação",
            colaborators_number: 5,
            email: "comercio@comercio.com",
            phone_1: "215745158",
            phone_2: "124588965",
            business_type: "comercio",
            branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
            partnerConfig: {
              main_branch: branch2_uuid,
              partner_category: ['saude'],
              use_marketing: false,
              use_market_place: false
            }
          }

          const result = await request(app).post("/business/register").send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Invalid main branch")
        })
        it("Should register an partner with only admin tax", async () => {
          const input = {
            line1: "Rua",
            line2: "72B",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "5484248423",
            city: "Cidade teste",
            state: "Estado teste",
            country: "País teste",
            fantasy_name: "Empresa teste",
            document: "comercio",
            classification: "Classificação",
            colaborators_number: 5,
            email: "comercio@comercio.com",
            phone_1: "215745158",
            phone_2: "124588965",
            business_type: "comercio",
            branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
            partnerConfig: {
              main_branch: branch1_uuid,
              partner_category: ['saude'],
              use_marketing: false,
              use_market_place: false
            }
          }

          const result = await request(app).post("/business/register").send(input)
          expect(result.statusCode).toBe(201)
          partner_info_uuid = result.body.BusinessInfo.uuid
          partner_address_uuid = result.body.Address.uuid
          //Address
          expect(result.body.Address.uuid).toBeTruthy()
          expect(result.body.Address.line1).toEqual(input.line1)
          expect(result.body.Address.line2).toEqual(input.line2)
          expect(result.body.Address.line3).toEqual(input.line3)
          expect(result.body.Address.neighborhood).toEqual(input.neighborhood)
          expect(result.body.Address.postal_code).toEqual(input.postal_code)
          expect(result.body.Address.city).toEqual(input.city)
          expect(result.body.Address.state).toEqual(input.state)
          expect(result.body.Address.country).toEqual(input.country)
          //Business Info
          expect(result.body.BusinessInfo.uuid).toBeTruthy()
          expect(result.body.BusinessInfo.address_uuid).toEqual(result.body.Address.uuid)
          expect(result.body.BusinessInfo.fantasy_name).toEqual(input.fantasy_name)
          expect(result.body.BusinessInfo.corporate_reason).toBeFalsy()
          expect(result.body.BusinessInfo.document).toEqual(input.document)
          expect(result.body.BusinessInfo.classification).toEqual(input.classification)
          expect(result.body.BusinessInfo.colaborators_number).toEqual(input.colaborators_number)
          expect(result.body.BusinessInfo.status).toBe('pending_approval')
          expect(result.body.BusinessInfo.phone_1).toEqual(input.phone_1)
          expect(result.body.BusinessInfo.phone_2).toEqual(input.phone_2)
          expect(result.body.BusinessInfo.document).toEqual(input.document)
          expect(result.body.BusinessInfo.business_type).toEqual(input.business_type)
          expect(result.body.BusinessInfo.email).toEqual(input.email)
          expect(result.body.BusinessInfo.created_at).toBeTruthy()
          //N to N business / correct
          expect(result.body.CorrectUserBusinessBranch.uuid).toBeTruthy()
          expect(result.body.CorrectUserBusinessBranch.business_info_uuid).toEqual(result.body.BusinessInfo.uuid)
          expect(result.body.CorrectUserBusinessBranch.correct_user_uuid).toBeFalsy()
          expect(result.body.CorrectUserBusinessBranch.created_at).toBeTruthy()
          //PartnerConfig
          expect(result.body.PartnerConfig.uuid).toBeTruthy()
          expect(result.body.PartnerConfig.business_info_uuid).toEqual(result.body.BusinessInfo.uuid)
          expect(result.body.PartnerConfig.main_branch).toEqual(input.partnerConfig.main_branch)
          expect(result.body.PartnerConfig.partner_category).toEqual(input.partnerConfig.partner_category)
          expect(result.body.PartnerConfig.main_branch).toEqual(input.partnerConfig.main_branch)
          expect(result.body.PartnerConfig.items_uuid.length).not.toBe(0)
          expect(result.body.PartnerConfig.admin_tax).toEqual(150) //this is according to branch1 definitions
          expect(result.body.PartnerConfig.marketing_tax).toEqual(0)
          expect(result.body.PartnerConfig.use_marketing).toBeFalsy()
          expect(result.body.PartnerConfig.market_place_tax).toEqual(0)
          expect(result.body.PartnerConfig.use_market_place).toBeFalsy()
        })
        it("Should register an partner with admin tax and marketing", async () => {
          const input = {
            line1: "Rua",
            line2: "72B",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "5484248423",
            city: "Cidade teste",
            state: "Estado teste",
            country: "País teste",
            fantasy_name: "Empresa teste",
            document: "comercio2",
            classification: "Classificação",
            colaborators_number: 5,
            email: "comercio2@comercio.com",
            phone_1: "215745158",
            phone_2: "124588965",
            business_type: "comercio",
            branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
            partnerConfig: {
              main_branch: branch3_uuid,
              partner_category: ['saude'],
              use_marketing: true,
              use_market_place: false
            }
          }

          const result = await request(app).post("/business/register").send(input)
          expect(result.statusCode).toBe(201)
          //Address
          expect(result.body.Address.uuid).toBeTruthy()
          expect(result.body.Address.line1).toEqual(input.line1)
          expect(result.body.Address.line2).toEqual(input.line2)
          expect(result.body.Address.line3).toEqual(input.line3)
          expect(result.body.Address.neighborhood).toEqual(input.neighborhood)
          expect(result.body.Address.postal_code).toEqual(input.postal_code)
          expect(result.body.Address.city).toEqual(input.city)
          expect(result.body.Address.state).toEqual(input.state)
          expect(result.body.Address.country).toEqual(input.country)
          //Business Info
          expect(result.body.BusinessInfo.uuid).toBeTruthy()
          expect(result.body.BusinessInfo.address_uuid).toEqual(result.body.Address.uuid)
          expect(result.body.BusinessInfo.fantasy_name).toEqual(input.fantasy_name)
          expect(result.body.BusinessInfo.corporate_reason).toBeFalsy()
          expect(result.body.BusinessInfo.document).toEqual(input.document)
          expect(result.body.BusinessInfo.classification).toEqual(input.classification)
          expect(result.body.BusinessInfo.colaborators_number).toEqual(input.colaborators_number)
          expect(result.body.BusinessInfo.status).toBe('pending_approval')
          expect(result.body.BusinessInfo.phone_1).toEqual(input.phone_1)
          expect(result.body.BusinessInfo.phone_2).toEqual(input.phone_2)
          expect(result.body.BusinessInfo.document).toEqual(input.document)
          expect(result.body.BusinessInfo.business_type).toEqual(input.business_type)
          expect(result.body.BusinessInfo.email).toEqual(input.email)
          expect(result.body.BusinessInfo.created_at).toBeTruthy()
          //N to N business / correct
          expect(result.body.CorrectUserBusinessBranch.uuid).toBeTruthy()
          expect(result.body.CorrectUserBusinessBranch.business_info_uuid).toEqual(result.body.BusinessInfo.uuid)
          expect(result.body.CorrectUserBusinessBranch.correct_user_uuid).toBeFalsy()
          expect(result.body.CorrectUserBusinessBranch.created_at).toBeTruthy()
          //PartnerConfig
          expect(result.body.PartnerConfig.uuid).toBeTruthy()
          expect(result.body.PartnerConfig.business_info_uuid).toEqual(result.body.BusinessInfo.uuid)
          expect(result.body.PartnerConfig.main_branch).toEqual(input.partnerConfig.main_branch)
          expect(result.body.PartnerConfig.partner_category).toEqual(input.partnerConfig.partner_category)
          expect(result.body.PartnerConfig.main_branch).toEqual(input.partnerConfig.main_branch)
          expect(result.body.PartnerConfig.items_uuid.length).not.toBe(0)
          expect(result.body.PartnerConfig.admin_tax).toEqual(140) //this is according to branch1 definitions
          expect(result.body.PartnerConfig.marketing_tax).toEqual(130)
          expect(result.body.PartnerConfig.use_marketing).toBeTruthy()
          expect(result.body.PartnerConfig.market_place_tax).toEqual(0)
          expect(result.body.PartnerConfig.use_market_place).toBeFalsy()
        })
        it("Should register an partner with admin tax, marketing tax and market places tax", async () => {
          const input = {
            line1: "Rua",
            line2: "72B",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "5484248423",
            city: "Cidade teste",
            state: "Estado teste",
            country: "País teste",
            fantasy_name: "Empresa teste",
            document: "comercio3",
            classification: "Classificação",
            colaborators_number: 5,
            email: "comercio3@comercio.com",
            phone_1: "215745158",
            phone_2: "124588965",
            business_type: "comercio",
            branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
            partnerConfig: {
              main_branch: branch4_uuid,
              partner_category: ['saude'],
              use_marketing: true,
              use_market_place: true
            }
          }

          const result = await request(app).post("/business/register").send(input)
          expect(result.statusCode).toBe(201)
          //Address
          expect(result.body.Address.uuid).toBeTruthy()
          expect(result.body.Address.line1).toEqual(input.line1)
          expect(result.body.Address.line2).toEqual(input.line2)
          expect(result.body.Address.line3).toEqual(input.line3)
          expect(result.body.Address.neighborhood).toEqual(input.neighborhood)
          expect(result.body.Address.postal_code).toEqual(input.postal_code)
          expect(result.body.Address.city).toEqual(input.city)
          expect(result.body.Address.state).toEqual(input.state)
          expect(result.body.Address.country).toEqual(input.country)
          //Business Info
          expect(result.body.BusinessInfo.uuid).toBeTruthy()
          expect(result.body.BusinessInfo.address_uuid).toEqual(result.body.Address.uuid)
          expect(result.body.BusinessInfo.fantasy_name).toEqual(input.fantasy_name)
          expect(result.body.BusinessInfo.corporate_reason).toBeFalsy()
          expect(result.body.BusinessInfo.document).toEqual(input.document)
          expect(result.body.BusinessInfo.classification).toEqual(input.classification)
          expect(result.body.BusinessInfo.colaborators_number).toEqual(input.colaborators_number)
          expect(result.body.BusinessInfo.status).toBe('pending_approval')
          expect(result.body.BusinessInfo.phone_1).toEqual(input.phone_1)
          expect(result.body.BusinessInfo.phone_2).toEqual(input.phone_2)
          expect(result.body.BusinessInfo.document).toEqual(input.document)
          expect(result.body.BusinessInfo.business_type).toEqual(input.business_type)
          expect(result.body.BusinessInfo.email).toEqual(input.email)
          expect(result.body.BusinessInfo.created_at).toBeTruthy()
          //N to N business / correct
          expect(result.body.CorrectUserBusinessBranch.uuid).toBeTruthy()
          expect(result.body.CorrectUserBusinessBranch.business_info_uuid).toEqual(result.body.BusinessInfo.uuid)
          expect(result.body.CorrectUserBusinessBranch.correct_user_uuid).toBeFalsy()
          expect(result.body.CorrectUserBusinessBranch.created_at).toBeTruthy()
          //PartnerConfig
          expect(result.body.PartnerConfig.uuid).toBeTruthy()
          expect(result.body.PartnerConfig.business_info_uuid).toEqual(result.body.BusinessInfo.uuid)
          expect(result.body.PartnerConfig.main_branch).toEqual(input.partnerConfig.main_branch)
          expect(result.body.PartnerConfig.partner_category).toEqual(input.partnerConfig.partner_category)
          expect(result.body.PartnerConfig.main_branch).toEqual(input.partnerConfig.main_branch)
          expect(result.body.PartnerConfig.items_uuid.length).not.toBe(0)
          expect(result.body.PartnerConfig.admin_tax).toEqual(170) //this is according to branch1 definitions
          expect(result.body.PartnerConfig.marketing_tax).toEqual(180)
          expect(result.body.PartnerConfig.use_marketing).toBeTruthy()
          expect(result.body.PartnerConfig.market_place_tax).toEqual(160)
          expect(result.body.PartnerConfig.use_market_place).toBeTruthy()
        })

      })

      describe("E2E Employer Registers test", () => {
        it("Should throw an error if item is empty", async () => {
          const input = {
            line1: "Rua",
            line2: "72B",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "5484248423",
            city: "Cidade teste",
            state: "Estado teste",
            country: "País teste",
            fantasy_name: "Empresa teste",
            document: "empregador",
            classification: "Classificação",
            colaborators_number: 5,
            email: "empregador@empregador.com",
            phone_1: "215745158",
            phone_2: "124588965",
            business_type: "empregador",
            branch_name: "Frigoríficio",
          }

          const result = await request(app).post("/business/register").send(input)
          expect(result.statusCode).toBe(400)
          expect(result.body.error).toBe("Item is required")
        })

        it("Should register new employer ", async () => {
          const input = {
            line1: "Rua",
            line2: "72B",
            line3: "",
            neighborhood: "Bairro Teste",
            postal_code: "5484248423",
            city: "Cidade teste",
            state: "Estado teste",
            country: "País teste",
            fantasy_name: "Empresa teste",
            document: "empregador",
            classification: "Classificação",
            colaborators_number: 5,
            email: "empregador@empregador.com",
            phone_1: "215745158",
            phone_2: "124588965",
            business_type: "empregador",
            employer_branch: "Frigoríficio",
            items_uuid: [benefit1_uuid, benefit3_uuid, benefit2_uuid]
          }

          const result = await request(app).post("/business/register").send(input)
          expect(result.statusCode).toBe(201)

          employer_info_uuid = result.body.BusinessInfo.uuid
          employer_address_uuid = result.body.Address.uuid

        })
      })
    })

  })

  describe("Business data", () => {
    describe("Update Business data by correct", () => {
      it("Should throw an error if business id is missing", async () => {
        const input = {
          address_uuid: "123",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          status: "pending_approval",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: "comercio"
        }
        const result = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Business info Id is required")
      })

      it("Should throw an error if business info was not found", async () => {
        const input = {
          address_uuid: "123",
          fantasy_name: "Empresa teste",
          document: "CNPJ",
          classification: "Classificação",
          status: "pending_approval",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const query = {
          business_info_uuid: "1"
        }
        const result = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(input)
        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("Business info not found")
      })

      it("Should update business data by correct admin", async () => {
        const input = {
          address_uuid: partner_address_uuid,
          fantasy_name: "Empresa novo nome",
          document: "comercio",
          classification: "Classificação",
          colaborators_number: 5,
          email: "comercio@comercio.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: "comercio"
        }

        const query = {
          business_info_uuid: partner_info_uuid
        }
        const result = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(input)
        expect(result.statusCode).toBe(200)
        expect(result.body.address_uuid).toEqual(partner_address_uuid)
        expect(result.body.fantasy_name).toBe(input.fantasy_name)
        expect(result.body.status).toBe("pending_approval")
        expect(result.body.document).toBe(input.document)
        expect(result.body.email).toBe(input.email)
        expect(result.body.phone_1).toBe(input.phone_1)
        expect(result.body.phone_2).toBe(input.phone_2)
        expect(result.body.business_type).toBe(input.business_type)

      })
    })
  })
  describe("Business User", () => {
    describe("E2E Create Business admin by correct admin", () => {
      it("Should throw an error if password is missing", async () => {
        const input = {
          password: "",
          business_info_uuid: partner_info_uuid,
        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Password is required")
      })

      it("Should throw an error if business info id is missing", async () => {

        const input = {
          password: "123456",
          business_info_uuid: ""
        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Business Info Id is required")
      })

      it("Should throw an error if name is missing", async () => {
        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Name is required")
      })

      it("Should throw an error if email is missing", async () => {
        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
          name: "Nome do admin"
        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Email is required")
      })

      it("Should throw an error if email is invalid", async () => {
        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
          email: "differentema",
          name: "Nome do admin"

        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Invalid email format")
      })

      it("Should throw an error if email is not found in company registers", async () => {
        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
          email: "differentemail@email.com",
          name: "Nome do admin"

        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Email not found in company registers")
      })

      it("Should throw an error if business is still not validated by correct", async () => {
        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
          email: "comercio@comercio.com",
          name: "Nome do admin"

        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Business must be validated before creating an Admin user")
      })

      it("Should throw an error if business is inactive", async () => {
        //inactive business
        const inputToInactivate = {
          address_uuid: partner_address_uuid,
          fantasy_name: "Empresa novo nome",
          document: "comercio",
          classification: "Classificação",
          colaborators_number: 5,
          email: "comercio@comercio.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: "comercio",
          status: "inactive"
        }
        const query = {
          business_info_uuid: partner_info_uuid
        }
        await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToInactivate)

        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
          email: "comercio@comercio.com",
          name: "Nome do admin"

        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Business has inactive status")
      })

      it("Should create business admin", async () => {
        //activate business
        const inputToActivate = {
          address_uuid: partner_address_uuid,
          fantasy_name: "Empresa novo nome",
          document: "comercio",
          classification: "Classificação",
          colaborators_number: 5,
          email: "comercio@comercio.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: "comercio",
          status: "active"
        }
        const query = {
          business_info_uuid: partner_info_uuid
        }
        await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToActivate)

        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
          email: "comercio@comercio.com",
          name: "Nome do admin"

        }

        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        partner_admin_uuid = result.body.uuid
        expect(result.statusCode).toBe(201)
        expect(result.body.uuid).toBeTruthy()
        expect(result.body.business_info_uuid).toBe(partner_info_uuid)
        expect(result.body.email).toBe(input.email)
        expect(result.body.document).toBeFalsy()
        expect(result.body.is_admin).toBe(true)
        expect(result.body.permissions).toEqual(["all"])
        expect(result.body.user_name).toBeFalsy()
        expect(result.body.function).toBeFalsy()
        expect(result.body.status).toBe('pending_password')
      })

      it("Should throw an error if email is already registered", async () => {

        const input = {
          password: "123456",
          business_info_uuid: partner_info_uuid,
          email: "comercio@comercio.com",
          name: "Nome do admin"

        }
        const result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(409)
        expect(result.body.error).toBe("Email already registered")
      })
    })

    describe("E2E Authenticate business user/admin", () => {
      it("Should throw an error if user business document is missing", async () => {
        const input = {
          business_document: "",
          password: "123456"
        }

        const result = await request(app).post("/business/admin/login").send(input)
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Incorrect credentials")
      })

      it("Should throw an error if user password is missing", async () => {
        const input = {
          business_document: "CNPJ",
          password: ""
        }

        const result = await request(app).post("/business/admin/login").send(input)
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Incorrect credentials")
      })

      it("Should throw an error if business document does not exist", async () => {
        const input = {
          business_document: "Wrong document",
          password: "123456"
        }

        const result = await request(app).post("/business/admin/login").send(input)
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Incorrect credentials")
      })

      it("Should throw an error if trying to login with wrong email", async () => {
        const input = {
          business_document: "CNPJ",
          password: "123456",
          email: "wrongemail@wrongemail.com"
        }

        const result = await request(app).post("/business/admin/login").send(input)
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Incorrect credentials")
      })

      it("Should throw an error if trying to login with right email and wrong password", async () => {
        const input = {
          business_document: "comercio",
          password: "9847878",
          email: "comercio@comercio.com"
        }

        const result = await request(app).post("/business/admin/login").send(input)
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Incorrect credentials")
      })

      it("Should login user", async () => {

        const input = {
          business_document: "comercio",
          password: "123456",
          email: "comercio@comercio.com"
        }

        const result = await request(app).post("/business/admin/login").send(input)
        partner_admin_token = result.body.token
        expect(result.statusCode).toBe(200)
        expect(result.body.token).toBeTruthy()
      })


      it("Should throw an error if trying to login with username and it's missing", async () => {
        const input = {
          business_document: "CNPJ",
          password: "9847878",
          user_name: ""
        }

        const result = await request(app).post("/business/admin/login").send(input)
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Incorrect credentials")
      })

      it("Should throw an error if trying to login with username and it does not exist", async () => {
        const input = {
          business_document: "CNPJ",
          password: "9847878",
          user_name: "any"
        }

        const result = await request(app).post("/business/admin/login").send(input)
        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Incorrect credentials")
      })

    })

    describe("E2E Business Admin/user details", () => {

      it("Should return user details", async () => {
        const result = await request(app).get("/business/admin/details").set('Authorization', `Bearer ${partner_admin_token}`)
        expect(result.statusCode).toBe(200)
        expect(result.body.uuid).toBe(partner_admin_uuid)
        expect(result.body.business_info_uuid).toEqual(partner_info_uuid)
        expect(result.body.created_at).toBeTruthy()

      })
    })

    describe("E2E Update Business admin by business admin ", () => {
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
        created_at: ''

      }

      beforeAll(async () => {
        const getPartnerAdminDetails = await request(app).get("/business/admin/details").set('Authorization', `Bearer ${partner_admin_token}`)
        expect(getPartnerAdminDetails.statusCode).toBe(200)

        partnerAdminDetails.business_info_uuid = getPartnerAdminDetails.body.business_info_uuid,
          partnerAdminDetails.is_admin = getPartnerAdminDetails.body.is_admin
        partnerAdminDetails.document = getPartnerAdminDetails.body.document
        partnerAdminDetails.name = getPartnerAdminDetails.body.name
        partnerAdminDetails.email = getPartnerAdminDetails.body.email
        partnerAdminDetails.user_name = getPartnerAdminDetails.body.user_name
        partnerAdminDetails.function = getPartnerAdminDetails.body.function
        partnerAdminDetails.permissions = getPartnerAdminDetails.body.permissions
        partnerAdminDetails.status = getPartnerAdminDetails.body.status
        partnerAdminDetails.created_at = getPartnerAdminDetails.body.created_at

      })

      it("Should throw an error if password is the same from last one", async () => {
        const input = {
          name: "Fernando de Oliviera",
          permissions: '',
          user_name: 'fernando',
          password: '123456', //this password is taken from previous test when admin was created
          function: '',
          status: ''
        }

        const result = await request(app).put("/company-admin").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(409)
        expect(result.body.error).toBe('Password must not be the same')
      })
      it("Should update only admin name", async () => {

        const input = {
          name: "Fernando"
        }


        const result = await request(app).put("/company-admin").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        //test if password has not changed
        const inputAuthenticate = {
          business_document: "comercio",
          password: "123456",
          email: "comercio@comercio.com"
        }

        const authenticatePartnerUser = await request(app).post("/business/admin/login").send(inputAuthenticate)
        expect(authenticatePartnerUser.statusCode).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.body.is_admin).toBeTruthy()
        expect(result.body.document).toBe(partnerAdminDetails.document)
        expect(result.body.name).toBe(input.name)
        expect(result.body.email).toBe(partnerAdminDetails.email)
        expect(result.body.user_name).toBe(partnerAdminDetails.user_name)
        expect(result.body.function).toBe(partnerAdminDetails.function)
        expect(result.body.status).toBe(partnerAdminDetails.status)
        expect(result.body.permissions).toEqual(partnerAdminDetails.permissions)
        expect(result.body.updated_at).toBeTruthy()
        expect(result.body.password).toBeUndefined()

      })
      it("Should update document, password, and username", async () => {
        const input = {
          name: "Fernando Oliveira",
          document: "036.760.591-07",
          password: "new-password"
        }


        const result = await request(app).put("/company-admin").set('Authorization', `Bearer ${partner_admin_token}`).send(input)

        //test if password has not changed
        const inputAuthenticate = {
          business_document: "comercio",
          password: "new-password",
          email: "comercio@comercio.com"
        }

        const authenticatePartnerUser = await request(app).post("/business/admin/login").send(inputAuthenticate)
        expect(authenticatePartnerUser.statusCode).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.body.is_admin).toBeTruthy()
        expect(result.body.document).toBe('03676059107')
        expect(result.body.name).toBe(input.name)
        expect(result.body.email).toBe(partnerAdminDetails.email)
        expect(result.body.user_name).toBe(partnerAdminDetails.user_name)
        expect(result.body.function).toBe(partnerAdminDetails.function)
        expect(result.body.status).toBe('active')
        expect(result.body.permissions).toEqual(partnerAdminDetails.permissions)
        expect(result.body.updated_at).toBeTruthy()
        expect(result.body.password).toBeUndefined()

      })

    })

    describe("E2E Create business user by business admin", () => {

      it("Should throw an error if user name is missing", async () => {
        const input = {
          password: "1345687",
          user_name: ""
        }
        const result = await request(app).post("/business/admin/register/user").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('User name is required')
      })

      it("Should register a new user", async () => {
        const input = {
          password: "1345687",
          partner_info_uuid,
          user_name: 'user_name',
          permissions: ['finances']
        }
        const result = await request(app).post("/business/admin/register/user").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        partner_finances_user_uuid = result.body.uuid

        //authenticate new user
        const authInput = {
          business_document: "comercio",
          user_name: "user_name",
          password: input.password,
        }


        const auth = await request(app).post("/business/admin/login").send(authInput)
        expect(auth.statusCode).toBe(200)

        expect(result.statusCode).toBe(201)
        expect(result.body.uuid).toBeTruthy()
        expect(result.body.business_info_uuid).toBe(input.partner_info_uuid)
        expect(result.body.email).toBeFalsy()
        expect(result.body.document).toBeFalsy()
        expect(result.body.is_admin).toBeFalsy()
        expect(result.body.permissions).toEqual(input.permissions)
        expect(result.body.user_name).toEqual(input.user_name)
        expect(result.body.funtion).toBeFalsy()
        expect(result.body.status).toBe('active')

      })

      it("Should throw an error if user name already exists", async () => {
        const input = {
          password: "1345687",
          partner_info_uuid,
          user_name: 'user_name',
          permissions: ['finances']
        }
        const result = await request(app).post("/business/admin/register/user").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(409)
        expect(result.body.error).toBe('User name already registered')
      })
    })
    describe("E2E Update business user by business admin", () => {
      it("Should update only user name", async () => {

        const input = {
          user_name: "Fernando Finanças"
        }

        const result = await request(app).patch("/company-user").set('Authorization', `Bearer ${partner_admin_token}`).send(input).query({ user_id: partner_finances_user_uuid })
        //test if password has not changed
        const inputAuthenticate = {
          business_document: "comercio",
          password: "1345687",
          user_name: input.user_name
        }

        const authenticatePartnerUser = await request(app).post("/business/admin/login").send(inputAuthenticate)
        expect(authenticatePartnerUser.statusCode).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.body.is_admin).toBeFalsy()
        expect(result.body.document).toBeFalsy()
        expect(result.body.user_name).toBe(input.user_name)

      })
      it("Should update only password", async () => {

        const input = {
          password: "new-password123"
        }

        const result = await request(app).patch("/company-user").set('Authorization', `Bearer ${partner_admin_token}`).send(input).query({ user_id: partner_finances_user_uuid })
        //test if password has not changed
        const inputAuthenticate = {
          business_document: "comercio",
          password: input.password,
          user_name: "Fernando Finanças"
        }

        const authenticatePartnerUser = await request(app).post("/business/admin/login").send(inputAuthenticate)
        expect(authenticatePartnerUser.statusCode).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.body.is_admin).toBeFalsy()
        expect(result.body.document).toBeFalsy()
        expect(result.body.user_name).toBe("Fernando Finanças")

      })

      it("Should update only password and username", async () => {

        const input = {
          user_name: "Fernando Ferreira",
          password: "another-new-password123"
        }

        const result = await request(app).patch("/company-user").set('Authorization', `Bearer ${partner_admin_token}`).send(input).query({ user_id: partner_finances_user_uuid })
        //test if password has not changed
        const inputAuthenticate = {
          business_document: "comercio",
          password: input.password,
          user_name: input.user_name
        }

        const authenticatePartnerUser = await request(app).post("/business/admin/login").send(inputAuthenticate)
        expect(authenticatePartnerUser.statusCode).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.body.is_admin).toBeFalsy()
        expect(result.body.document).toBeFalsy()
        expect(result.body.user_name).toBe(input.user_name)

      })
    })

    describe("E2E Get single user by admin", () => {
      it("Should throw an error if id is missing", async () => {
        const result = await request(app).get("/business/admin/details/user").set('Authorization', `Bearer ${partner_admin_token}`).query({ user_uuid: '' })

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Id is required")
      })

      it("Should throw an error if user cannot be found", async () => {
        const result = await request(app).get("/business/admin/details/user").set('Authorization', `Bearer ${partner_admin_token}`).query({ user_uuid: '1' })

        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("User not found")
      })

      it("Should return user details", async () => {
        const result = await request(app).get("/business/admin/details/user").set('Authorization', `Bearer ${partner_admin_token}`).query({ user_uuid: partner_finances_user_uuid })
        expect(result.statusCode).toBe(200)
        expect(result.body.uuid).toEqual(partner_finances_user_uuid)
        expect(result.body.business_info_uuid).toEqual(partner_info_uuid)
      })
    })

    describe("E2E Get all users by admin", () => {
      beforeAll(async () => {
        const input1 = {
          password: "1345687",
          partner_info_uuid,
          user_name: 'user_name2',
          permissions: ['finances']
        }
        const input2 = {
          password: "1345687",
          partner_info_uuid,
          user_name: 'user_name3',
          permissions: ['finances']
        }
        const partner_finances_user_uuid2 = await request(app).post("/business/admin/register/user").set('Authorization', `Bearer ${partner_admin_token}`).send(input1)
        const partner_finances_user_uuid3 = await request(app).post("/business/admin/register/user").set('Authorization', `Bearer ${partner_admin_token}`).send(input2)
        expect(partner_finances_user_uuid2.statusCode).toBe(201)
        expect(partner_finances_user_uuid3.statusCode).toBe(201)
      })

      it("Should return users", async () => {
        const result = await request(app).get("/company-users").set('Authorization', `Bearer ${partner_admin_token}`)
        expect(result.statusCode).toBe(200)
        expect(result.body.length).toBe(3)
      })
    })

    describe("E2E Delete user by admin", () => {
      it("Should throw an error if user id is missing", async () => {
        const result = await request(app).patch("/company-user/delete").set('Authorization', `Bearer ${partner_admin_token}`).query({ user_id: '' })
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("User id is required")

      })

      it("Should throw an error if user is not found", async () => {
        const result = await request(app).patch("/company-user/delete").set('Authorization', `Bearer ${partner_admin_token}`).query({ user_id: '12345' })
        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("User not found")

      })


      it("Should delete an user", async () => {
        const result = await request(app).patch("/company-user/delete").set('Authorization', `Bearer ${partner_admin_token}`).query({ user_id: partner_admin_uuid })
        expect(result.statusCode).toBe(200)
        expect(result.body.message).toBe("Usuário excluído com sucesso")

      })
    })

    describe("E2E Confirm password by business admin", () => {
      it("Should throw an error if password is missing", async () => {

        const input = {
          password: ''
        }
        const result = await request(app).post("/confirm-password").set('Authorization', `Bearer ${partner_admin_token}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Password is required")
      })

      it("Should throw an error if password is incorrect", async () => {

        const input = {
          password: '16548'
        }
        const result = await request(app).post("/confirm-password").set('Authorization', `Bearer ${partner_admin_token}`).send(input)

        expect(result.statusCode).toBe(403)
        expect(result.body.error).toBe("Incorrect credentials")
      })

      it("Should confirm password", async () => {

        const input = {
          password: 'new-password' //make sure this password is correct after updates tests
        }
        const result = await request(app).post("/confirm-password").set('Authorization', `Bearer ${partner_admin_token}`).send(input)

        expect(result.statusCode).toBe(200)
        expect(result.body.message).toBe("Password matches")
      })
    })
  })

  describe("Business Data by Business admin", () => {
    describe("E2E Get Business data by business admin", () => {
      it("Should return business data", async () => {
        const result = await request(app).get("/business/info").set('Authorization', `Bearer ${partner_admin_token}`)
        partner_info_uuid = result.body.uuid
        expect(result.statusCode).toBe(200)
      })
    })
    describe("E2E update business data by business admin", () => {
      it("Should throw an error if id is missing", async () => {

        const input = {
          address_uuid: "123",
          fantasy_name: "Atualizado pelo admin",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "64684984654",
          phone_2: "124588965",
          business_type: "comercio"
        }
        const query = {
          business_info_uuid: ''
        }
        const result = await request(app).put("/business/info/company").set('Authorization', `Bearer ${partner_admin_token}`).query(query).send(input)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Business info Id is required")
      })
      it("Should throw an error if id is missing", async () => {

        const input = {
          address_uuid: "123",
          fantasy_name: "Atualizado pelo admin",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "64684984654",
          phone_2: "124588965",
          business_type: "comercio"
        }
        const query = {
          business_info_uuid: '123'
        }
        const result = await request(app).put("/business/info/company").set('Authorization', `Bearer ${partner_admin_token}`).query(query).send(input)
        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("Business info not found")
      })
      it("Should update business data", async () => {

        const input = {
          address_uuid: "123",
          fantasy_name: "Atualizado pelo admin",
          document: "CNPJ",
          classification: "Classificação",
          colaborators_number: 5,
          email: "email@email.com",
          phone_1: "64684984654",
          phone_2: "124588965",
          business_type: "comercio"
        }
        const query = {
          business_info_uuid: partner_info_uuid
        }
        const result = await request(app).put("/business/info/company").set('Authorization', `Bearer ${partner_admin_token}`).query(query).send(input)
        expect(result.statusCode).toBe(200)
      })
    })
  })

  describe("Business Address", () => {
    describe("Update Business Address", () => {
      it("Should throw an error if address id is missing", async () => {
        const input = {
          line1: "Rua nova",
          line2: "72B",
          line3: "Complemento novo",
          neighborhood: "Bairro Teste",
          postal_code: "731547854",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",

        }
        const query = {
          address_uuid: ''
        }
        const result = await request(app).put("/company-address").set('Authorization', `Bearer ${partner_admin_token}`).query(query).send(input)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('Address Id is required')

      })

      it("Should throw an error if address can not be found", async () => {
        const input = {
          line1: "Rua nova",
          line2: "72B",
          line3: "Complemento novo",
          neighborhood: "Bairro Teste",
          postal_code: "731547854",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",

        }
        const query = {
          address_uuid: '1'
        }
        const result = await request(app).put("/company-address").set('Authorization', `Bearer ${partner_admin_token}`).query(query).send(input)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('Address not found')

      })
      it("Should update address", async () => {
        const input = {
          line1: "Rua nova",
          line2: "72B",
          line3: "Complemento novo",
          neighborhood: "Bairro Teste",
          postal_code: "731547854",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",

        }
        const query = {
          address_uuid: partner_address_uuid
        }
        const result = await request(app).put("/company-address").set('Authorization', `Bearer ${partner_admin_token}`).query(query).send(input)
        const data = await request(app).get("/business/info").set('Authorization', `Bearer ${partner_admin_token}`)

        expect(result.statusCode).toBe(200)
        expect(data.body.Address.line1).toBe('Rua nova')
        expect(data.body.Address.line3).toBe('Complemento novo')
      })
    })
  })

  describe("Employer Item Details by Correct Admin", () => {
    describe("E2E Create Employer Item details by correct admin", () => {
      it("Should throw an error if cycle end day is missing", async () => {
        const input = {
          item_uuid: randomUUID(),
          business_info_uuid: randomUUID(),
          cycle_end_day: 0,
          value: 200

        };
        const result = await request(app)
          .post("/business/item/details/correct")
          .set('Authorization', `Bearer ${correctAdminToken}`)
          .send(input);
        expect(result.statusCode).toBe(400);
        expect(result.body.error).toBe("Cycle end day is required");
      });
      it("Should throw an error if item cannot be found", async () => {
        const input = {
          item_uuid: randomUUID(),
          business_info_uuid: randomUUID(),
          cycle_end_day: 1,
          value: 200

        };
        const result = await request(app)
          .post("/business/item/details/correct")
          .set('Authorization', `Bearer ${correctAdminToken}`)
          .send(input);
        expect(result.statusCode).toBe(404);
        expect(result.body.error).toBe("Item not found");
      });
      it("Should throw an error if business cannot be found", async () => {
        const input = {
          item_uuid: benefit1_uuid,
          business_info_uuid: randomUUID(),
          cycle_end_day: 1,
          value: 200

        };
        const result = await request(app)
          .post("/business/item/details/correct")
          .set('Authorization', `Bearer ${correctAdminToken}`)
          .send(input);
        expect(result.statusCode).toBe(404);
        expect(result.body.error).toBe("Business not found");
      });


      it("Should create a new item details", async () => {
        const input = {
          item_uuid: benefit4_uuid,
          business_info_uuid: employer_info_uuid,
          cycle_end_day: 1,
          value: 200
        };
        const result = await request(app)
          .post("/business/item/details/correct")
          .set('Authorization', `Bearer ${correctAdminToken}`)
          .send(input);

        expect(result.statusCode).toBe(201);
        expect(result.body.employerItem).toHaveProperty('uuid')
        expect(result.body.employerItem.item_uuid).toBe(input.item_uuid)
        expect(result.body.employerItem.business_info_uuid).toBe(input.business_info_uuid)
        expect(result.body.employerItem.is_active).toBeTruthy()
        expect(result.body.employerItem.cycle_end_day).toBe(input.cycle_end_day)
        expect(result.body.employerItem.cycle_start_day).toBe(input.cycle_end_day + 1)
        expect(result.body.defaultGroup).toHaveProperty('uuid')
        expect(result.body.defaultGroup.group_name).toBe("Grupo Vale Refeição (Padrão)")
        expect(result.body.defaultGroup.employer_item_details_uuid).toBe(result.body.employerItem.uuid)
        expect(result.body.defaultGroup.value).toBe(input.value)
        expect(result.body.defaultGroup.business_info_uuid).toBe(result.body.employerItem.business_info_uuid)
        expect(result.body.employerItem.created_at).toBeTruthy()
        expect(result.body.employerItem.updated_at).toBeFalsy()
        expect(result.body.defaultGroup.created_at).toBeTruthy()
        expect(result.body.defaultGroup.updated_at).toBeFalsy()
      });
      it("Should create a group for an existing employer item that was created on business first register", async () => {
        const input = {
          item_uuid: benefit1_uuid,
          business_info_uuid: employer_info_uuid,
          cycle_end_day: 1,
          value: 200
        };
        const result = await request(app)
          .post("/business/item/details/correct")
          .set('Authorization', `Bearer ${correctAdminToken}`)
          .send(input);
        expect(result.statusCode).toBe(201);
        expect(result.body.employerItem).toHaveProperty('uuid')
        expect(result.body.employerItem.item_uuid).toBe(input.item_uuid)
        expect(result.body.employerItem.business_info_uuid).toBe(input.business_info_uuid)
        expect(result.body.employerItem.cycle_end_day).toBe(input.cycle_end_day)
        expect(result.body.employerItem.cycle_start_day).toBe(input.cycle_end_day + 1)
        expect(result.body.defaultGroup).toHaveProperty('uuid')
        expect(result.body.defaultGroup.group_name).toBe("Grupo Vale Alimentação (Padrão)")
        expect(result.body.defaultGroup.employer_item_details_uuid).toBe(result.body.employerItem.uuid)
        expect(result.body.defaultGroup.value).toBe(input.value)
        expect(result.body.defaultGroup.business_info_uuid).toBe(result.body.employerItem.business_info_uuid)
        expect(result.body.employerItem.created_at).toBeTruthy()
        expect(result.body.employerItem.updated_at).toBeTruthy()
        expect(result.body.defaultGroup.created_at).toBeTruthy()
        expect(result.body.defaultGroup.updated_at).toBeFalsy()
      });
      it("Should update item and group", async () => {
        const input = {
          item_uuid: benefit1_uuid,
          business_info_uuid: employer_info_uuid,
          cycle_end_day: 5,
          value: 300
        };
        const result = await request(app)
          .post("/business/item/details/correct")
          .set('Authorization', `Bearer ${correctAdminToken}`)
          .send(input);
        expect(result.statusCode).toBe(201);
        expect(result.body.employerItem).toHaveProperty('uuid')
        expect(result.body.employerItem.item_uuid).toBe(input.item_uuid)
        expect(result.body.employerItem.business_info_uuid).toBe(input.business_info_uuid)
        expect(result.body.employerItem.cycle_end_day).toBe(input.cycle_end_day)
        expect(result.body.employerItem.cycle_start_day).toBe(input.cycle_end_day + 1)
        expect(result.body.defaultGroup).toHaveProperty('uuid')
        expect(result.body.defaultGroup.group_name).toBe("Grupo Vale Alimentação (Padrão)")
        expect(result.body.defaultGroup.employer_item_details_uuid).toBe(result.body.employerItem.uuid)
        expect(result.body.defaultGroup.value).toBe(input.value)
        expect(result.body.defaultGroup.business_info_uuid).toBe(result.body.employerItem.business_info_uuid)
        expect(result.body.employerItem.created_at).toBeTruthy()
        expect(result.body.employerItem.updated_at).toBeTruthy()
        expect(result.body.defaultGroup.created_at).toBeTruthy()
        expect(result.body.defaultGroup.updated_at).toBeTruthy()
      });
    })
    describe("E2E Find All Employer item details by correct admin", () => {
      beforeAll(async () => {
        //create custom benefit
        const input = {
          name: "Vale Alimentação Customizado",
          description: "Descrição",
          parent_uuid: null as any,
          item_type: 'gratuito' as ItemType,
          item_category: 'pre_pago' as ItemCategory,
          business_info_uuid: employer_info_uuid,
          cycle_end_day: 2
        }

        const result = await request(app).post('/benefit/custom').set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(201)

      })
      it("Should return an empty array", async () => {
        const input = {
          business_info_uuid: randomUUID()
        }
        const result = await request(app).get(`/business/item/details/correct/${input.business_info_uuid}`).set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(200)
        expect(result.body.length).toBe(0)
      })
      it("Should return an array with item details", async () => {
        const input = {
          business_info_uuid: employer_info_uuid
        }
        const result = await request(app).get(`/business/item/details/correct/${input.business_info_uuid}`).set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(200)
        expect(result.body.length).toBe(5)
        expect(result.body[0].business_info_uuid).toEqual(employer_info_uuid)
        expect(result.body[1].business_info_uuid).toEqual(employer_info_uuid)
        expect(result.body[2].business_info_uuid).toEqual(employer_info_uuid)

        item_details_1 = result.body[0].uuid
      })
    })
    describe("E2E Find one item details by correct admin", () => {
      it("Should throw an error if item details is not found", async () => {
        const input = {
          id: randomUUID()
        }
        const result = await request(app).get(`/business/item/details/${input.id}/correct/`).set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("Item details not found")
      })
      it("Should return an item details", async () => {
        const input = {
          id: item_details_1
        }
        const result = await request(app).get(`/business/item/details/${input.id}/correct/`).set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(200)
        expect(result.body.uuid).toEqual(item_details_1)
      })
    })
    describe("E2E Update Business cycles by correct admin", () => {
      it("Should throw an error if business id is missing", async () => {
        const input = {
          business_info_uuid: '',
          item_uuid: 'any uuid',
          cycle_end_day: 2
        }
        const result = await request(app).patch("/business/item/details/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('Business Id is required')
      })

      it("Should throw an error if business id is missing", async () => {
        const input = {
          business_info_uuid: 'any uuid',
          item_uuid: '',
          cycle_end_day: 2
        }
        const result = await request(app).patch("/business/item/details/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('Item Id is required')
      })

      it("Should throw an error if cycle end day is missing", async () => {
        const input = {
          business_info_uuid: 'any uuid',
          item_uuid: 'any uuid',
        }
        const result = await request(app).patch("/business/item/details/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('Cycle end day is required')
      })
      it("Should throw an error if cycle end day is equal to zero", async () => {
        const input = {
          business_info_uuid: 'any uuid',
          item_uuid: 'any uuid',
          cycle_end_day: 0

        }
        const result = await request(app).patch("/business/item/details/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('Cycle end day is required')
      })
      it("Should throw an error if item cannot be found", async () => {
        const input = {
          business_info_uuid: 'any uuid',
          item_uuid: 'any uuid',
          cycle_end_day: 1

        }
        const result = await request(app).patch("/business/item/details/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe('Item not found')
      })

      it("Should set new cycle end day", async () => {
        const input = {
          business_info_uuid: employer_info_uuid,
          item_uuid: benefit1_uuid,
          cycle_end_day: 5

        }
        const result = await request(app).patch("/business/item/details/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)

        expect(result.statusCode).toBe(200)
        expect(result.body.cycle_end_day).toBe(5)
        expect(result.body.cycle_start_day).toBe(6)
      })

    })
  })
  describe("Employer Item Details By Business Admin", () => {
    beforeAll(async () => {
      //activate business
      const inputToActivate = {
        address_uuid: employer_address_uuid,
        fantasy_name: "Empresa novo nome",
        document: "empregador",
        classification: "Classificação",
        colaborators_number: 5,
        email: "empregador@empregador.com",
        phone_1: "215745158",
        phone_2: "124588965",
        business_type: "empregador",
        status: "active"
      }
      const query = {
        business_info_uuid: employer_info_uuid
      }
      const activate = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToActivate)
      expect(activate.statusCode).toBe(200)

      //create employer user
      const input = {
        password: "123456",
        business_info_uuid: employer_info_uuid,
        email: "empregador@empregador.com",
        name: "Nome do admin employer"

      }
      const create = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(input)
      employer_user_uuid = create.body.uuid
      expect(create.statusCode).toBe(201)


      //authenticate employer
      const authInput = {
        business_document: "empregador",
        password: "123456",
        email: "empregador@empregador.com"
      }

      const auth = await request(app).post("/business/admin/login").send(authInput)
      expect(auth.statusCode).toBe(200)
      employer_user_token = auth.body.token

    })


    describe("E2E Find All Employer item details by business admin", () => {
      it("Should return an array with item details", async () => {

        const result = await request(app).get(`/business/item/details`).set('Authorization', `Bearer ${employer_user_token}`)

        expect(result.statusCode).toBe(200)
        expect(result.body.length).toBe(5)

      })
    })

    describe("E2E Find single employer item detail by business admin", () => {
      it("Should throw an error if item detail is not found", async () => {
        const input = {
          id: randomUUID(),
        }

        const result = await request(app).get(`/business/item/details/${input.id}/employer`).set('Authorization', `Bearer ${employer_user_token}`)
        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("Item details not found")
      })
      it("Should return an item detail", async () => {
        const input = {
          id: item_details_1,
        }
        const result = await request(app).get(`/business/item/details/${input.id}/employer`).set('Authorization', `Bearer ${employer_user_token}`)
        expect(result.statusCode).toBe(200)
      })

    })
  })

  describe("Partner First register by correct seller", () => {
    describe("E2E Registering partner by correft seller", () => {
      it("Should register partner by correct seller", async () => {
        const input = {
          line1: "Rua",
          line2: "72B",
          line3: "",
          neighborhood: "Bairro Teste",
          postal_code: "5484248423",
          city: "Cidade teste",
          state: "Estado teste",
          country: "País teste",
          fantasy_name: "Empresa teste",
          document: "comercio4",
          classification: "Classificação",
          colaborators_number: 5,
          email: "comercio4@comercio.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: "comercio",
          branches_uuid: [branch1_uuid, branch3_uuid, branch4_uuid],
          partnerConfig: {
            main_branch: branch1_uuid,
            partner_category: ['saude'],
            use_marketing: false,
            use_market_place: false
          }
        }

        const result = await request(app).post("/business/register/correct").set('Authorization', `Bearer ${correctSellerToken}`).send(input)
        expect(result.statusCode).toBe(201)
        expect(result.body.CorrectUserBusinessBranch.correct_user_uuid).toBeTruthy()
      })
    })
    describe("E2E Get Registered partner by correct seller", () => {
      it("Should throw an error if business document is missing", async () => {
        const result = await request(app).get("/partner/seller").set('Authorization', `Bearer ${correctSellerToken}`).send()

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("Business Document is required")
      })

      it("Should throw an error if business is not found", async () => {
        const result = await request(app).get("/partner/seller").set('Authorization', `Bearer ${correctSellerToken}`).send({ document: '123' })

        expect(result.statusCode).toBe(404)
        expect(result.body.error).toBe("Business not found")
      })

      it("Should throw an error if correct seller did not register this partner", async () => {
        const result = await request(app).get("/partner/seller").set('Authorization', `Bearer ${correctSellerToken}`).send({ document: 'CNPJ' })

        expect(result.statusCode).toBe(401)
        expect(result.body.error).toBe("Unauthorized access")
      })
      it("Should return partner", async () => {
        const result = await request(app).get("/partner/seller").set('Authorization', `Bearer ${correctSellerToken}`).send({ document: 'comercio4' })

        expect(result.statusCode).toBe(200)
        expect(result.body.business_document).toBe("comercio4")
        expect(result.body.fantasy_name).toBe("Empresa teste")

      })

    })

  })

  describe("E2E Partner Config", () => {
    describe("Set partner config definitions by partner", () => {
      it("Should throw an error if any data is sent on the request", async () => {

        const result = await request(app).put(`/partner/config`).set('Authorization', `Bearer ${partner_admin_token}`)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe("At least one field is required")
      })

      it("Should set definitions", async () => {
        const input = {
          title: "Comércio muito bom",
          phone: "67896487542",
          description: "Descrição do comércio que é muito bom mesmo",
          sales_type: "presencial"

        }
        const result = await request(app).put(`/partner/config`).set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(201)
        expect(result.body.title).toEqual(input.title)
        expect(result.body.phone).toEqual(input.phone)
        expect(result.body.description).toEqual(input.description)
        expect(result.body.sales_type).toEqual(input.sales_type)
      })
    })
  })

  describe("E2E Transactions", () => {
    describe("Create POS transaction order by partner", () => {
      it("Should throw an error if business is not active", async () => {
        //inactive partner
        const inputToInactivate = {
          address_uuid: partner_address_uuid,
          fantasy_name: "Empresa novo nome",
          document: "comercio",
          classification: "Classificação",
          colaborators_number: 5,
          email: "comercio@comercio.com",
          phone_1: "215745158",
          phone_2: "124588965",
          business_type: "comercio",
          status: "inactive"
        }
        const query = {
          business_info_uuid: partner_info_uuid
        }
        const inactivePartner = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToInactivate)
        expect(inactivePartner.statusCode).toBe(200)

        const input = {
          item_uuid: randomUUID(),
          cycle_end_day: 1,
          amount: 200
        }
        const result = await request(app).post("/pos-transaction").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(403)
        expect(result.body.error).toBe("Business is not active")
      })
      it("Should throw an error if business type is Employer", async () => {

        const input = {
          amount: 200,
          description: ""
        }
        const result = await request(app).post("/pos-transaction").set('Authorization', `Bearer ${employer_user_token}`).send(input)
        expect(result.statusCode).toBe(403)
        expect(result.body.error).toBe("Business type is not allowed")
      })
      it("Should throw an error if item is not accepted by partner", async () => {
        //active partner
        const inputToInactivate = {

          status: "active"
        }
        const query = {
          business_info_uuid: partner_info_uuid
        }
        const activePartner = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToInactivate)
        expect(activePartner.statusCode).toBe(200)

        const input = {
          amount: 200,
          description: "",
          item_uuid: benefit3_uuid
        }
        const result = await request(app).post("/pos-transaction").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(403)
        expect(result.body.error).toBe("Item not accepted by the business")

      })
      it("Should create an transaction for benefit1", async () => {
        //active partner
        const inputToInactivate = {

          status: "active"
        }
        const query = {
          business_info_uuid: partner_info_uuid
        }
        const activePartner = await request(app).put("/business/info/correct").set('Authorization', `Bearer ${correctAdminToken}`).query(query).send(inputToInactivate)
        expect(activePartner.statusCode).toBe(200)

        const input = {
          amount: 200,
          description: "",
          item_uuid: benefit1_uuid
        }
        const result = await request(app).post("/pos-transaction").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(201)
        expect(result.body.business_info_uuid).toBe(partner_info_uuid)
        expect(result.body.fee).toBe(1.50) //this is because this partner main branch is branch1, as defined on line 646. And this branch was created to have admin tax as 152

      })

      it("Should create an transaction for benefit2", async () => {
        const input = {
          amount: 200,
          description: "",
          item_uuid: benefit2_uuid
        }
        const result = await request(app).post("/pos-transaction").set('Authorization', `Bearer ${partner_admin_token}`).send(input)
        expect(result.statusCode).toBe(201)
        expect(result.body.business_info_uuid).toBe(partner_info_uuid)
        expect(result.body.fee).toBe(1.50) //this is because this partner main branch is branch1, as defined on line 646. And this branch was created to have admin tax as 152

      })
    })
  })
})
