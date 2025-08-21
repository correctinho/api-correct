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
        expect(result.body.error).toBe('Name is required and must be a string.')
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
      it("Should throw an error if category name is already registered", async () => {
        // ARRANGE: Primeiro, criamos uma categoria para garantir que ela exista.
        const input = {
          name: 'Categoria Duplicada Teste',
          description: 'Descrição de teste.',
        };
        const firstResult = await request(app).post('/ecommerce/category').set('Authorization', `Bearer ${correctAdminToken}`).send(input);
        expect(firstResult.statusCode).toBe(201);

        // ACT & ASSERT: Tentamos criar a MESMA categoria novamente.
        const secondResult = await request(app).post('/ecommerce/category').set('Authorization', `Bearer ${correctAdminToken}`).send(input);

        expect(secondResult.statusCode).toBe(409); // 409 Conflict
        expect(secondResult.body.error).toBe("Category already registered");
      });

      it("Should throw an error if a non-admin user tries to create a category", async () => {
        // ARRANGE: Usamos o token de um parceiro para tentar criar a categoria.
        const input = {
          name: 'Categoria Não Autorizada',
          description: 'Esta criação deve falhar.',
        };

        // ACT & ASSERT: Esperamos um erro de autorização.
        const result = await request(app).post('/ecommerce/category').set('Authorization', `Bearer ${partner1_admin_token}`).send(input);
        // O status code exato (401 ou 403) depende do seu middleware de autenticação/autorização.
        expect(result.statusCode).toBe(401)
      });
    })

    describe("E2E Find Category", () => {
      let category1_uuid: string;
      let category2_uuid: string;

      // Usamos um beforeAll para criar o cenário específico para estes testes de busca,
      // tornando-os independentes de outros testes no arquivo.
      beforeAll(async () => {
        // Criamos duas categorias para garantir um estado previsível.
        const cat1Input = { name: 'Eletrônicos Teste', description: 'Categoria para eletrônicos.' };
        const cat2Input = { name: 'Livros Teste', description: 'Categoria para livros.' };

        const res1 = await request(app).post('/ecommerce/category').set('Authorization', `Bearer ${correctAdminToken}`).send(cat1Input);
        expect(res1.statusCode).toBe(201);
        category1_uuid = res1.body.uuid;

        const res2 = await request(app).post('/ecommerce/category').set('Authorization', `Bearer ${correctAdminToken}`).send(cat2Input);
        expect(res2.statusCode).toBe(201);
        category2_uuid = res2.body.uuid;
      });

      it("Should throw an error if category uuid is invalid", async () => {
        // Testamos com um UUID mal formatado ou inexistente
        const invalidUuid = new Uuid();
        const result = await request(app).get(`/ecommerce/category`).query({ category_uuid: invalidUuid.uuid });
        expect(result.statusCode).toBe(404); // Esperamos Not Found
        expect(result.body.error).toBe('Category not found');
      });

      it("Should find a category by its UUID in the URL", async () => {
        // <<< CORREÇÃO: Passamos o UUID como parâmetro na URL >>>
        const result = await request(app).get(`/ecommerce/category`).query({ category_uuid: category1_uuid });
        expect(result.statusCode).toBe(200);
        expect(result.body.uuid).toBe(category1_uuid);
        expect(result.body.name).toBe('Eletrônicos Teste');
        expect(result.body.description).toBe('Categoria para eletrônicos.');
      });

      it("Should find all categories", async () => {
        const result = await request(app).get('/ecommerce/categories');

        expect(result.statusCode).toBe(200);
        // <<< CORREÇÃO: A asserção agora é mais robusta >>>
        // Esperamos encontrar pelo menos as 2 categorias que criamos neste teste.
        expect(result.body.length).toBeGreaterThanOrEqual(2);

        // Verificamos se as categorias que criamos estão na lista
        const foundCat1 = result.body.find((cat: any) => cat.uuid === category1_uuid);
        const foundCat2 = result.body.find((cat: any) => cat.uuid === category2_uuid);
        expect(foundCat1).toBeDefined();
        expect(foundCat2).toBeDefined();
      });
    });

  })
  describe("E2E Products", () => {

    describe("E2E Create Product", () => {

      it("should create a product and return values formatted in Reais", async () => {
        // --- ARRANGE ---
        // Com a nova arquitetura (sem upload de imagem), enviamos os dados como JSON,
        // com os tipos corretos (number, boolean).
        const input = {
          name: "Batata Doce Orgânica",
          description: "Produzida localmente, sem agrotóxicos.",
          original_price: 10.00, // R$ 10,00
          discount: 20, // 20%
          stock: 150,
          is_mega_promotion: false,
          weight: "1kg",
          height: "10cm",
          width: "10cm",
          category_uuid: category1_uuid,
          brand: "Fazenda Correct",
        };

        // O teste calcula o preço promocional esperado
        const expected_promotional_price = 8.00; // 10.00 - 20%

        // --- ACT ---
        const result = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(input);
        // --- ASSERT: Resposta da API de Criação ---
        expect(result.statusCode).toBe(201);
        expect(result.body.uuid).toBeDefined();
        expect(result.body.name).toBe(input.name);
        // A API de CRIAÇÃO deve retornar os valores formatados em Reais
        expect(result.body.original_price).toBe(input.original_price);
        expect(result.body.promotional_price).toBe(expected_promotional_price);
        expect(result.body.discount).toBe(input.discount);
        expect(result.body.stock).toBe(input.stock);
      });
      it('should return a 400 error if name is missing', async () => {
        const input = {
          // name: "Produto Sem Nome", // Campo obrigatório faltando
          description: "Descrição válida",
          original_price: 10.00,
          discount: 0,
          stock: 10,
          category_uuid: category1_uuid,
          brand: "Marca Válida",
        };
        const result = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(input);
        expect(result.statusCode).toBe(400);
        // A mensagem exata pode variar, mas deve indicar que o nome é obrigatório
        expect(result.body.error).toContain("Name is required and must be a non-empty string.");
      });

      it('should return a 400 error if stock is negative', async () => {
        const input = {
          name: "Produto com Estoque Negativo",
          description: "Descrição válida",
          original_price: 10.00,
          discount: 0,
          stock: -5, // Valor inválido
          category_uuid: category1_uuid,
          brand: "Marca Válida",
        };
        const result = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(input);
        expect(result.statusCode).toBe(400);
        expect(result.body.error).toContain("Stock must be a non-negative integer.");
      });

      it('should return a 400 error if discount is greater than 100', async () => {
        const input = {
          name: "Produto com Desconto Inválido",
          description: "Descrição válida",
          original_price: 10.00,
          discount: 101, // Valor inválido
          stock: 10,
          category_uuid: category1_uuid,
          brand: "Marca Válida",
        };
        const result = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(input);
        expect(result.statusCode).toBe(400);
        expect(result.body.error).toContain("Discount must be a number between 0 and 100");
      });

      it('should return a 404 error if category_uuid does not exist', async () => {
        const input = {
          name: "Produto com Categoria Inexistente",
          description: "Descrição válida",
          original_price: 10.00,
          discount: 10,
          stock: 10,
          category_uuid: new Uuid().uuid, // UUID aleatório que não existe
          brand: "Marca Válida",
        };
        const result = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(input);
        expect(result.statusCode).toBe(404);
        expect(result.body.error).toBe("Categoria não encontrada.");
      });
    })

    // describe("E2E Get All business products", () => {
    //   it("Should return empty array", async () => {
    //     const result = await request(app).get(`/ecommerce/business/products/${partner2_info_uuid}`)
    //     expect(result.statusCode).toBe(200)
    //     expect(result.body).toEqual([])
    //   })
    //   it("Should return an array with one product", async () => {
    //     const result = await request(app).get(`/ecommerce/business/products/${partner1_info_uuid}`)
    //     expect(result.statusCode).toBe(200)
    //     expect(result.body.length).toEqual(3)
    //   })
    // })

  })
})
