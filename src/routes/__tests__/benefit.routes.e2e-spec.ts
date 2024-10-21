import request from 'supertest'
import { app } from '../../app'
import { InputCreateBenefitDto, ItemCategory, ItemType } from '../../modules/benefits/usecases/create-benefit/create-benefit.dto'
import { Uuid } from '../../@shared/ValueObjects/uuid.vo';
import { BranchDTO } from '../../modules/benefits/usecases/get-benefit-by-id/get-benefit.dto';
import {randomUUID} from 'crypto'
const inputNewAdmin = {
  name: "Admin Correct",
  email: "admincorrect@correct.com.br",
  userName: "admin-correct",
  password: "123"
};

const authenticateAdmin = {
  userName: inputNewAdmin.userName,
  password: inputNewAdmin.password
};

let authToken: string;

beforeAll(async () => {
    //create correct admin
    const createCorrectAdmin = await request(app).post('/admin').send(inputNewAdmin)
    expect(createCorrectAdmin.statusCode).toBe(201)

  // Autenticação do admin e obtenção do token
  const loginResponse = await request(app).post('/login').send(authenticateAdmin);
  expect(loginResponse.statusCode).toBe(200)

  authToken = loginResponse.body.token; //
});

//Benefits inputs
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

let benefit1_uuid: Uuid
let benefit2_uuid: Uuid
let benefit3_uuid: Uuid
let benefit4_uuid: Uuid

describe("E2E Benefit tests", () => {
  describe("E2E Create benefit", () => {
    it("Should be able to create a new benefit", async () => {
      const result = await request(app)
        .post('/benefit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(benefit1);

      expect(result.statusCode).toBe(201);
      benefit1_uuid = result.body.uuid
    });
  })

  describe("E2E Update Benefit", () => {
    it("Should be able to update a benefit", async () => {
      const updateInput = {
        name: "Vale Alimentação",
        description: "Descrição atualizada do vale",
        parent_uuid: '',
        item_type: 'gratuito',
        item_category: 'pre_pago',
        business_info_uuid: '',
        created_at: '',
        updated_at: ''
      };
      const result = await request(app)

        .put(`/benefit/${benefit1_uuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateInput);

      expect(result.statusCode).toBe(200); // Ajuste o status esperado conforme necessário
      // expect(result.body.description).toEqual(updateInput.description);
    });
  })

  describe("E2E Create Custom business benefit", () => {
    let employer_info_uuid: string
    beforeAll(async () => {
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
        items_uuid: [benefit1_uuid]
      }

      const result = await request(app).post("/business/register").send(input)
      expect(result.statusCode).toBe(201)
      employer_info_uuid = result.body.business_info_uuid

    })

    it("Should throw an error if business id is missing", async () => {
      const input = {
        name: "Vale Alimentação",
        description: "Descrição do vale",
        parent_uuid: null as any,
        item_type: 'gratuito' as ItemType,
        item_category: 'pre_pago' as ItemCategory,
        business_info_uuid: '',
        cycle_end_day: 2
      }

      const result = await request(app).post('/benefit/custom').set('Authorization', `Bearer ${authToken}`).send(input)
      expect(result.statusCode).toBe(400)
      expect(result.body.error).toBe("Business id is required")
    })

    it("Should throw an error if cycle end day is missing", async () => {
      const input = {
        name: "Vale Alimentação",
        description: "Descrição do vale",
        parent_uuid: null as any,
        item_type: 'gratuito' as ItemType,
        item_category: 'pre_pago' as ItemCategory,
        business_info_uuid: employer_info_uuid,
        cycle_end_day: 0
      }

      const result = await request(app).post('/benefit/custom').set('Authorization', `Bearer ${authToken}`).send(input)
      expect(result.statusCode).toBe(400)
      expect(result.body.error).toBe("Cycle end day is required")
    })

    it("Should throw an error if description is missing", async () => {
      const input = {
        name: "Vale Alimentação",
        description: "",
        parent_uuid: null as any,
        item_type: 'gratuito' as ItemType,
        item_category: 'pre_pago' as ItemCategory,
        business_info_uuid: employer_info_uuid,
        cycle_end_day: 2
      }

      const result = await request(app).post('/benefit/custom').set('Authorization', `Bearer ${authToken}`).send(input)
      expect(result.statusCode).toBe(400)
      expect(result.body.error).toBe("Description is required")
    })

    it("Should throw an error if business is not found", async () => {
      const input = {
        name: "Vale Alimentação",
        description: "Descrição",
        parent_uuid: null as any,
        item_type: 'gratuito' as ItemType,
        item_category: 'pre_pago' as ItemCategory,
        business_info_uuid: randomUUID(),
        cycle_end_day: 2
      }

      const result = await request(app).post('/benefit/custom').set('Authorization', `Bearer ${authToken}`).send(input)
      expect(result.statusCode).toBe(404)
      expect(result.body.error).toBe("Business not found")
    })

    it("Should create a new business custom benefit", async () => {
      const input = {
        name: "Vale Customizado",
        description: "Descrição",
        parent_uuid: null as any,
        item_type: 'gratuito' as ItemType,
        item_category: 'pre_pago' as ItemCategory,
        business_info_uuid: employer_info_uuid,
        cycle_end_day: 2
      }

      const result = await request(app).post('/benefit/custom').set('Authorization', `Bearer ${authToken}`).send(input)
      expect(result.statusCode).toBe(201)
      expect(result.body).toHaveProperty('uuid')
      expect(result.body.name).toBe(input.name)
      expect(result.body.description).toBe(input.description)
      expect(result.body.item_type).toBe(input.item_type)
      expect(result.body.item_category).toBe(input.item_category)
      expect(result.body.business_info_uuid).toBe(input.business_info_uuid)
      expect(result.body.cycle_end_day).toBe(input.cycle_end_day)
      expect(result.body.cycle_start_day).toBe(input.cycle_end_day + 1)

    })
    it("Should throw an error if business already have this custom item", async () => {
      const input = {
        name: "Vale Customizado",
        description: "Descrição",
        parent_uuid: null as any,
        item_type: 'gratuito' as ItemType,
        item_category: 'pre_pago' as ItemCategory,
        business_info_uuid: employer_info_uuid,
        cycle_end_day: 2
      }

      const result = await request(app).post('/benefit/custom').set('Authorization', `Bearer ${authToken}`).send(input)
      expect(result.statusCode).toBe(409)
      expect(result.body.error).toBe("Business already has this custom item")

    })
  })
  })


describe("E2E Branch tests", () => {

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

  let branch1_uuid: string
  let branch2_uuid: string
  let branch3_uuid: string
  let branch4_uuid: string
  let branch5_uuid: string

  beforeAll(async () => {
    //create more benefits
    const result_benefit2 = await request(app).post('/benefit').set('Authorization', `Bearer ${authToken}`).send(benefit2);
    benefit2_uuid = result_benefit2.body.uuid.uuid

    const result_benefit3 = await request(app).post('/benefit').set('Authorization', `Bearer ${authToken}`).send(benefit3);
    benefit3_uuid = result_benefit3.body.uuid.uuid

    const result_benefit4 = await request(app).post('/benefit').set('Authorization', `Bearer ${authToken}`).send(benefit4);
    benefit4_uuid = result_benefit4.body.uuid.uuid


  })
  describe("E2E Create branch", () => {
    it("Should register branches", async () => {
      const result = await request(app)
        .post(`/branch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(branchesByName);
      branch1_uuid = result.body[0].uuid
      branch2_uuid = result.body[1].uuid
      branch3_uuid = result.body[2].uuid
      branch4_uuid = result.body[3].uuid
      branch5_uuid = result.body[4].uuid

      expect(result.statusCode).toBe(201)
      expect(result.body.length).toBe(5)
    })

    it("Should throw an error if branch is already registered", async () => {
      const input = [
        {
        name: "Alimentação",
        marketing_tax: 200,
        admin_tax: 250,
        market_place_tax: 220,
        benefits_name: ['Vale Refeição', 'Vale Alimentação']
      }
      ]
      const result = await request(app)
        .post(`/branch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(input);

      expect(result.statusCode).toBe(409)
      expect(result.body.error).toBe("Branch name already registered")

    })
    it("Should throw an error if branch is already registered", async () => {
      const input = [
        {
        name: "Qualquer um",
        marketing_tax: 200,
        admin_tax: 250,
        market_place_tax: 220,
        benefits_name: ['Vale Refeição23', 'Vale Alimentação']
      }
      ]
      const result = await request(app)
        .post(`/branch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(input);

      expect(result.statusCode).toBe(404)
      expect(result.body.error).toBe("Item not found")

    })
  })

  describe("E2E Get Benefit", () => {
    it("Should throw an error if benefit cannot be found", async () => {
      const result = await request(app)
        .get(`/benefit/11181561815`)

      expect(result.statusCode).toBe(404);
       expect(result.body.error).toEqual("Benefit not found")
    });
    it("Should be able to get a benefit by ID", async () => {
      const result = await request(app)
        .get(`/benefit/${benefit1_uuid}`)

      expect(result.statusCode).toBe(200);
      expect(result.body.Item.uuid).toEqual(benefit1_uuid)
      expect(result.body.Item.name).toBe(benefit1.name)
      expect(result.body.Item.description).toBe('Descrição atualizada do vale')
      expect(result.body.Item.item_type).toBe(benefit1.item_type)
      expect(result.body.Item.item_category).toBe(benefit1.item_category)
      expect(result.body.Item.created_at).toBeTruthy()
      expect(result.body.Branch.length).toBe(4)

      const branchFound = result.body.Branch.find((branch: BranchDTO) => branch.branch_uuid === branch1_uuid);

      expect(branchFound).toBeTruthy();
      expect(branchFound.name).toBe(branchesByName[0].name);
      expect(branchFound.marketing_tax).toBe(branchesByName[0].marketing_tax);
      expect(branchFound.admin_tax).toBe(branchesByName[0].admin_tax);
      expect(branchFound.market_place_tax).toBe(branchesByName[0].market_place_tax);
      expect(branchFound.created_at).toBeTruthy();
    });
  })

  // describe("E2E Find branch by id", () => {

  //   it("Should throw an error if branch uuid is missing", async () => {
  //     const uuid = "64a6s1c6a"
  //     const result = await request(app)
  //       .get(`/branch/${uuid}`)
  //     expect(result.statusCode).toBe(404)
  //     expect(result.body.error).toBe("Branch not found")
  //   })

  //   it("Should return branch", async () => {

  //     const result = await request(app)
  //       .get(`/branch/${branch1_uuid}`)
  //     expect(result.statusCode).toBe(200)
  //     expect(result.body.name).toEqual("Hipermercados"),
  //       expect(result.body.marketing_tax).toEqual(100),
  //       expect(result.body.admin_tax).toEqual(150)
  //     expect(result.body.market_place_tax).toEqual(120)
  //   })
  // })

  // describe("E2E Find all branchs", () => {



  //   it("Should return branchs", async () => {

  //     const result = await request(app)
  //       .get(`/branch`)

  //     expect(result.statusCode).toBe(200)
  //     expect(result.body.length).toBe(5)
  //   })
  // })

})
