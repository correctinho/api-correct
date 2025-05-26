import request from "supertest"
import { app } from "../../app"
import { InputCreateBenefitDto } from "../../modules/benefits/usecases/create-benefit/create-benefit.dto"
import { Uuid } from "../../@shared/ValueObjects/uuid.vo"

let correctAdminToken: string
const inputNewAdmin = {
  name: "Admin Correct",
  email: "admincorrect@correct.com.br",
  userName: "admin-correct",
  password: "123"
}

const authenticateAdmin = {
  userName: inputNewAdmin.userName,
  password: inputNewAdmin.password
}

let partner1_info_uuid: string
let partner2_info_uuid: string

let partner1_admin_uuid: string
let partner2_admin_uuid: string

let partner1_admin_token: string
let partner2_admin_token: string

let category1_uuid: string

let benefit1_uuid: Uuid
let benefit2_uuid: Uuid
let benefit3_uuid: Uuid
let benefit4_uuid: Uuid

let branch1_uuid: string
let branch2_uuid: string
let branch3_uuid: string
let branch4_uuid: string
let branch5_uuid: string




describe("E2E Ecommerce tests", () => {
  beforeAll(async () => {
    //create correct admin
    const correctAdmin = await request(app).post('/admin').send(inputNewAdmin)
    expect(correctAdmin.statusCode).toBe(201)
    //authenticate correct admin
    const authAdmin = await request(app).post('/login').send(authenticateAdmin)
    expect(authAdmin.status).toBe(200)
    correctAdminToken = authAdmin.body.token

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

    //create partner 1
    const partner1 = {
      line1: "Rua",
      line2: "72B",
      line3: "",
      neighborhood: "Bairro Teste",
      postal_code: "5484248423",
      city: "Cidade teste",
      state: "Estado teste",
      country: "País teste",
      fantasy_name: "Empresa teste",
      document: "comercio1",
      classification: "Classificação",
      colaborators_number: 5,
      email: "comercio1@comercio.com",
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

    const partner1_result = await request(app).post("/business/register").send(partner1)
    expect(partner1_result.statusCode).toBe(201)
    partner1_info_uuid = partner1_result.body.BusinessInfo.uuid

    //create partner 2
    const partner2 = {
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
      branches_uuid: [branch2_uuid],
      partnerConfig: {
        main_branch: branch2_uuid,
        partner_category: ['saude'],
        use_marketing: true,
        use_market_place: true
      }
    }

    const partner2_result = await request(app).post("/business/register").send(partner2)
    expect(partner2_result.statusCode).toBe(201)
    partner2_info_uuid = partner2_result.body.BusinessInfo.uuid

    //ACTIVATE PARTNERS
    const activatePartner1 = await request(app).put(`/business/info/correct`).set('Authorization', `Bearer ${correctAdminToken}`).send({ status: 'active' }).query({ business_info_uuid: partner1_info_uuid })
    expect(activatePartner1.statusCode).toBe(200)
    const activatePartner2 = await request(app).put(`/business/info/correct`).set('Authorization', `Bearer ${correctAdminToken}`).send({ status: 'active' }).query({ business_info_uuid: partner2_info_uuid })
    expect(activatePartner2.statusCode).toBe(200)

    //CREATE ADMINS
    const partner1_admin_input = {
      password: "123456",
      business_info_uuid: partner1_info_uuid,
      email: "comercio1@comercio.com",
      name: "Nome do admin"
    }
    const partner1_admin_result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(partner1_admin_input)
    expect(partner1_admin_result.statusCode).toBe(201)
    partner1_admin_uuid = partner1_admin_result.body.uuid

    const partner2_admin_input = {
      password: "123456",
      business_info_uuid: partner2_info_uuid,
      email: "comercio2@comercio.com",
      name: "Nome do admin"
    }
    const partner2_admin_result = await request(app).post("/business/admin/correct").set('Authorization', `Bearer ${correctAdminToken}`).send(partner2_admin_input)
    expect(partner2_admin_result.statusCode).toBe(201)

    //AUTHENTICATE PARTNER ADMINS
    const partner1_auth = {
      business_document: "comercio1",
      password: "123456",
      email: "comercio1@comercio.com"
    }

    const partner1_auth_result = await request(app).post("/business/admin/login").send(partner1_auth)
    expect(partner1_auth_result.statusCode).toBe(200)
    partner1_admin_token = partner1_auth_result.body.token

    const partner2_auth = {
      business_document: "comercio2",
      password: "123456",
      email: "comercio2@comercio.com"
    }

    const partner2_auth_result = await request(app).post("/business/admin/login").send(partner2_auth)
    partner2_admin_token = partner2_auth_result.body.token
  })
  describe("E2E Categories", () => {
    describe("E2E Create Category", () => {
      it("Should throw an error if category name is missing", async () => {
        const input = {
          name: '',
          description: 'Category description',
        }
        const result = await request(app).post('/ecommerce/category').set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('Name is required')
      })
      it("Should create a category", async () => {
        const input = {
          name: 'Category 1',
          description: 'Category description',
        }
        const result = await request(app).post('/ecommerce/category').set('Authorization', `Bearer ${correctAdminToken}`).send(input)
        expect(result.statusCode).toBe(201)
        expect(result.body.uuid).toBeTruthy()
        expect(result.body.name).toBe(input.name)
        expect(result.body.description).toBe(input.description)
        expect(result.body.created_at).toBeTruthy()

        category1_uuid = result.body.uuid
      })
    })
    describe("E2E Find Category", () => {
      it("Should throw an error if category uuid is missing", async () => {
        const input = {
          category_uuid: '',
        }
        const result = await request(app).get('/ecommerce/category').send(input)
        expect(result.statusCode).toBe(400)
        expect(result.body.error).toBe('UUID is required')
      })
      it("Should find a category", async () => {
        const input = {
          category_uuid: category1_uuid,
        }
        const result = await request(app).get('/ecommerce/category').send(input)
        expect(result.statusCode).toBe(200)
        expect(result.body.uuid).toBe(input.category_uuid)
        expect(result.body.name).toBe('Category 1')
        expect(result.body.description).toBe('Category description')
        expect(result.body.created_at).toBeTruthy()
      })

      it("Should find all categories", async () => {

        const result = await request(app).get('/ecommerce/categories')
        expect(result.statusCode).toBe(200)
        expect(result.body.length).toBe(1)

      })
    })
  })
  describe("E2E Products", () => {
    describe("E2E Create Product", () => {
      it("Should create a product", async () => {
        const input = {
          name: "Batata",
          description: "Batata doce orgânica",
          original_price: 1000, // 10.00
          promotional_price: 800, // 8.00
          discount: 15, // 2.00
          stock: 100,
          is_mega_promotion: false,
          weight: "1kg",
          height: "10cm",
          width: "10cm",
          category_uuid: category1_uuid,
          brand: "Marca Teste",

        }

        const result = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(input)
        expect(result.statusCode).toBe(201)
        expect(result.body.uuid).toBeTruthy()
        expect(result.body.name).toBe(input.name)
        expect(result.body.description).toBe(input.description)
        expect(result.body.original_price).toBe(input.original_price)
        expect(result.body.promotional_price).toBe(input.promotional_price)
        expect(result.body.discount).toBe(input.discount)
        expect(result.body.stock).toBe(input.stock)
        expect(result.body.is_mega_promotion).toBe(input.is_mega_promotion)
        expect(result.body.weight).toBe(input.weight)
        expect(result.body.height).toBe(input.height)
        expect(result.body.width).toBe(input.width)
        expect(result.body.category_uuid).toBe(input.category_uuid)
        expect(result.body.brand).toBe(input.brand)
        expect(result.body.created_at).toBeTruthy()
        expect(result.body.updated_at).toBeFalsy()

        let product_uuid = result.body.uuid
        //find product by id
        const product = await request(app).get(`/ecommerce/product/${product_uuid}`)
        expect(product.statusCode).toBe(200)
        expect(product.body.uuid).toBe(product_uuid)
        expect(product.body.name).toBe(input.name)
        expect(product.body.description).toBe(input.description)
        expect(product.body.original_price).toBe(input.original_price / 100)
        expect(product.body.promotional_price).toBe(input.promotional_price / 100)
        expect(product.body.discount).toBe(input.discount / 100)
        expect(product.body.stock).toBe(input.stock)
        expect(product.body.is_mega_promotion).toBe(input.is_mega_promotion)
      })
    })
    describe("E2E Get All business products", () => {
      it("Should return empty array", async () => {
        const result = await request(app).get(`/ecommerce/business/products/${partner2_info_uuid}`)
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual([])
      })
      it("Should return an array with one product", async () => {
        const result = await request(app).get(`/ecommerce/business/products/${partner1_info_uuid}`)
        expect(result.statusCode).toBe(200)
        expect(result.body.length).toEqual(1)
      })
    })

  })
})
