import request from "supertest"
import { app } from "../../app"
import { InputCreateBenefitDto } from "../../modules/benefits/usecases/create-benefit/create-benefit.dto"
import { Uuid } from "../../@shared/ValueObjects/uuid.vo"

import path from 'path';
import fs from 'fs';
import { IStorage, UploadResponse } from '../../infra/providers/storage/storage'; // Importe a interface e os tipos
import { container } from "../../container";
import { prismaClient } from "../../infra/databases/prisma.config";

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
        expect(result.body.created_by_uuid).toBe(partner1_admin_uuid);
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


    const mockStorage: IStorage = {
      upload: jest.fn(),
      delete: jest.fn(),
    };

    jest.mock('../../infra/providers/storage/implementations/supabase/supabase.storage', () => {
      // Retornamos uma classe falsa que, quando instanciada, retorna nosso objeto mockado.
      return {
        SupabaseStorage: jest.fn().mockImplementation(() => {
          return mockStorage;
        }),
      };
    });
    // ====================================================================
    //INSERT PRODUCT IMAGES TESTS NOT IMPLEMENTED YET
    // ====================================================================

    // describe("E2E Product Image Upload", () => {
    //   let product_uuid: string;
    //   let partner_token: string;

    //   beforeAll(async () => {
    //     container.setStorage(mockStorage);

    //     // O resto do seu setup para criar um produto continua como antes
    //     partner_token = partner1_admin_token;
    //     const productInput = {
    //       name: "Produto para Teste de Imagem",
    //       description: "Descrição do produto.",
    //       original_price: 150.00,
    //       discount: 10,
    //       stock: 20,
    //       category_uuid: category1_uuid,
    //       brand: "Marca de Teste",
    //     };
    //     const result = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner_token}`).send(productInput);
    //     expect(result.statusCode).toBe(201);
    //     product_uuid = result.body.uuid;
    //   });

    //   // Limpamos os mocks após cada teste para garantir o isolamento
    //   afterEach(() => {
    //     jest.clearAllMocks();
    //   });

    //   it("should successfully upload, process, and associate images with a product", async () => {
    //     // --- ARRANGE ---
    //     const fakeUploadResponse: UploadResponse = {
    //       data: {
    //         url: `https://fake-storage.com/products/fake-image.webp`,
    //         path: `products/fake-image.webp`,
    //       },
    //       error: null,
    //     };
    //     (mockStorage.upload as jest.Mock).mockResolvedValue(fakeUploadResponse);

    //     const imagePath = path.join(__dirname, '../../../test-files/test-image.jpg');
    //     const imageBuffer = fs.readFileSync(imagePath);

    //     // --- ACT ---
    //     const result = await request(app)
    //       .post(`/ecommerce/product/${product_uuid}/images`)
    //       .set('Authorization', `Bearer ${partner_token}`)
    //       // ====================================================================
    //       // <<< CORREÇÃO FINAL AQUI >>>
    //       // Alteramos o nome do campo de 'images' para 'file' para corresponder
    //       // ao que o middleware `uploadImage.array('file', 5)` espera.
    //       // ====================================================================
    //       .attach('file', imageBuffer, 'test-image.jpg');

    //     // --- ASSERT ---
    //     expect(result.statusCode).toBe(200); // Controller retorna 200 (OK) para update

    //     expect(result.body.images_url).toHaveLength(3);
    //     expect(result.body.images_url[0]).toContain('fake-image.webp');

    //     expect(mockStorage.upload).toHaveBeenCalledTimes(3);

    //     const productAfter = await request(app).get(`/ecommerce/product/${product_uuid}`);
    //     expect(productAfter.statusCode).toBe(200);
    //     expect(productAfter.body.images_url).toHaveLength(3);
    //   });

    // });

    describe("E2E Get Public Business Products", () => {
      let activeProductUuid: string;

      // No setup, adicionamos um produto ativo e um inativo ao parceiro 1, que já existe.
      beforeAll(async () => {
        // 1. Criar um produto ATIVO para o partner1
        const activeProductInput = {
          name: "Produto Visível Publicamente",
          description: "Este produto deve aparecer na lista pública.",
          original_price: 100.00,
          discount: 10,
          stock: 50,
          category_uuid: category1_uuid,
          brand: "Marca Pública",
          is_active: true
        };
        const activeProductRes = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(activeProductInput);
        expect(activeProductRes.statusCode).toBe(201);
        activeProductUuid = activeProductRes.body.uuid;

        // 2. Criar um produto INATIVO para o partner1
        const inactiveProductInput = {
          name: "Produto Invisível Publicamente",
          description: "Este produto NÃO deve aparecer na lista pública.",
          original_price: 200.00,
          discount: 0,
          stock: 20,
          category_uuid: category1_uuid,
          brand: "Marca Privada",
          is_active: false
        };
        const inactiveProductRes = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(inactiveProductInput);
        expect(inactiveProductRes.statusCode).toBe(201);
      });

      it("should return ONLY active products for a given business", async () => {
        // ACT: Chamamos o endpoint público para o parceiro 1
        const result = await request(app).get(`/ecommerce/business/${partner1_info_uuid}/products`);
        // ASSERT:
        expect(result.statusCode).toBe(200);
        // 1. A verificação mais importante: deve retornar 2 produtos, o que foi criado agora e o que foi criado anteriormente.
        expect(result.body).toHaveLength(2);

        // 2. Verificamos se o produto retornado é o correto.
        const product = result.body.find((p: any) => p.uuid === activeProductUuid);
        expect(product.uuid).toBe(activeProductUuid);
        expect(product.name).toBe("Produto Visível Publicamente");

        // 3. Verificamos se a estrutura da resposta está otimizada para o cliente.
        expect(product).toHaveProperty('main_image_url');
        expect(product).not.toHaveProperty('is_active');
      });

      it("should return an empty array for a partner with no products", async () => {
        // ACT: Usamos o parceiro 2, que sabemos que não tem produtos.
        const result = await request(app).get(`/ecommerce/business/${partner2_info_uuid}/products`);

        // ASSERT:
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual([]);
      });

      it("should return a 404 error if the business does not exist or is inactive", async () => {
        const nonExistentUuid = new Uuid().uuid;
        const result = await request(app).get(`/ecommerce/business/${nonExistentUuid}/products`);

        expect(result.statusCode).toBe(404);
        expect(result.body.error).toBe("Parceiro não encontrado ou inativo.");
      });
    });

    describe("E2E Get Own Business Products (Admin)", () => {
      let activeProductFromSetup: any;
      let inactiveProductUuid: string;

      // No setup, criamos um produto ativo e um inativo para o parceiro 1,
      // que já foi criado e autenticado no beforeAll principal.
      beforeAll(async () => {
        // 1. Criar um produto ATIVO (além do que já pode existir de testes anteriores)
        const activeProductInput = {
          name: "Produto Ativo para Gerenciamento",
          description: "Este produto deve aparecer na lista de gerenciamento.",
          original_price: 250.00,
          discount: 5,
          stock: 10,
          category_uuid: category1_uuid,
          brand: "Marca Gerenciável",
          is_active: true
        };
        const activeProductRes = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(activeProductInput);
        expect(activeProductRes.statusCode).toBe(201);
        activeProductFromSetup = activeProductRes.body;

        // 2. Criar um produto INATIVO
        const inactiveProductInput = {
          name: "Produto Inativo para Gerenciamento",
          description: "Este produto também deve aparecer na lista de gerenciamento.",
          original_price: 300.00,
          discount: 0,
          stock: 5,
          category_uuid: category1_uuid,
          brand: "Marca Gerenciável",
          is_active: false
        };
        const inactiveProductRes = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(inactiveProductInput);
        expect(inactiveProductRes.statusCode).toBe(201);
        inactiveProductUuid = inactiveProductRes.body.uuid;
      });

      it("should return all products for the authenticated partner, including inactive ones", async () => {
        // ACT: Chamamos o endpoint de gerenciamento do parceiro
        const result = await request(app)
          .get(`/ecommerce/business/products`) // Assumindo que a rota não precisa do ID, pois ele vem do token
          .set('Authorization', `Bearer ${partner1_admin_token}`);
        // ASSERT:
        expect(result.statusCode).toBe(200);
        // O resultado deve conter TODOS os produtos criados para este parceiro
        expect(result.body.length).toBeGreaterThanOrEqual(2);

        // Verificamos se os dois produtos que criamos no setup estão na lista
        const foundActiveProduct = result.body.find((p: any) => p.uuid === activeProductFromSetup.uuid);
        const foundInactiveProduct = result.body.find((p: any) => p.uuid === inactiveProductUuid);

        expect(foundActiveProduct).toBeDefined();
        expect(foundInactiveProduct).toBeDefined();

        // Verificamos o status de cada um para confirmar que ambos foram retornados
        expect(foundActiveProduct.is_active).toBe(true);
        expect(foundInactiveProduct.is_active).toBe(false);

        // Verificamos a estrutura de um dos produtos para garantir que está completa para gerenciamento
        expect(foundActiveProduct).toHaveProperty('uuid');
        expect(foundActiveProduct).toHaveProperty('name');
        expect(foundActiveProduct).toHaveProperty('is_active'); // O status deve estar presente
        expect(foundActiveProduct.images_url).toHaveProperty('thumbnail');
        expect(foundActiveProduct.images_url).toHaveProperty('medium');
        expect(foundActiveProduct.images_url).toHaveProperty('large');
      });

      it("should return an empty array for a partner with no products", async () => {
        // ACT: Usamos o parceiro 2, que sabemos que não tem produtos.
        const result = await request(app)
          .get(`/ecommerce/business/products`)
          .set('Authorization', `Bearer ${partner2_admin_token}`);

        // ASSERT:
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual([]);
      });
    });
    describe("E2E Find Own Product By ID (Admin)", () => {
      let activeProductUuid: string;
      let inactiveProductUuid: string;
      let otherPartnerProductUuid: string;

      // No setup, criamos produtos para dois parceiros diferentes para validar a lógica de permissão.
      beforeAll(async () => {
        // Produto ATIVO para o partner1
        const activeProductInput = {
          name: "Produto Ativo para Busca",
          original_price: 100.00, discount: 10, stock: 50,
          category_uuid: category1_uuid, brand: "Marca Ativa", is_active: true
        };
        const activeRes = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(activeProductInput);
        expect(activeRes.statusCode).toBe(201);
        activeProductUuid = activeRes.body.uuid;

        // Produto INATIVO para o partner1
        const inactiveProductInput = {
          name: "Produto Inativo para Busca",
          original_price: 200.00, discount: 0, stock: 0,
          category_uuid: category1_uuid, brand: "Marca Inativa", is_active: false
        };
        const inactiveRes = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(inactiveProductInput);
        expect(inactiveRes.statusCode).toBe(201);
        inactiveProductUuid = inactiveRes.body.uuid;

        // Produto para o partner2 (para o teste de segurança)
        const otherProductInput = {
          name: "Produto de Outro Parceiro",
          original_price: 50.00, discount: 0, stock: 10,
          category_uuid: category1_uuid, brand: "Outra Marca", is_active: true
        };
        const otherRes = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner2_admin_token}`).send(otherProductInput);
        expect(otherRes.statusCode).toBe(201);
        otherPartnerProductUuid = otherRes.body.uuid;
      });

      it("should find an active product by its ID for the owner", async () => {
        // Assumindo que a rota de gerenciamento é /ecommerce/product:productId
        const result = await request(app)
          .get(`/ecommerce/product/${activeProductUuid}`)
          .set('Authorization', `Bearer ${partner1_admin_token}`);

        expect(result.statusCode).toBe(200);
        expect(result.body.uuid).toBe(activeProductUuid);
        expect(result.body.name).toBe('Produto Ativo para Busca');
        expect(result.body.is_active).toBe(true); // O proprietário vê o status
      });

      it("should find an INACTIVE product by its ID for the owner", async () => {
        const result = await request(app)
          .get(`/ecommerce/product/${inactiveProductUuid}`)
          .set('Authorization', `Bearer ${partner1_admin_token}`);

        expect(result.statusCode).toBe(200);
        expect(result.body.uuid).toBe(inactiveProductUuid);
        expect(result.body.name).toBe('Produto Inativo para Busca');
        expect(result.body.is_active).toBe(false);
      });

      it("should return a 404 error if the product does not exist", async () => {
        const nonExistentUuid = new Uuid().uuid;
        const result = await request(app)
          .get(`/ecommerce/product/${nonExistentUuid}`)
          .set('Authorization', `Bearer ${partner1_admin_token}`);

        expect(result.statusCode).toBe(404);
        expect(result.body.error).toBe("Product not found");
      });


    });
    describe("E2E Soft Delete Product", () => {
      let productToDeleteUuid: string;
      let otherPartnerProductUuid: string;

      // No setup, criamos produtos para dois parceiros diferentes
      // para validar a lógica de permissão.
      beforeAll(async () => {
        // 1. Criar um produto para o partner1, que será deletado no teste.
        const productInput1 = {
          name: "Produto a ser Deletado",
          original_price: 50.00, discount: 0, stock: 10,
          category_uuid: category1_uuid, brand: "Marca Deletável", is_active: true
        };
        const res1 = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(productInput1);
        expect(res1.statusCode).toBe(201);
        productToDeleteUuid = res1.body.uuid;

        // 2. Criar um produto para o partner2, para o teste de segurança.
        const productInput2 = {
          name: "Produto de Outro Parceiro",
          original_price: 25.00, discount: 0, stock: 5,
          category_uuid: category1_uuid, brand: "Outra Marca", is_active: true
        };
        const res2 = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner2_admin_token}`).send(productInput2);
        expect(res2.statusCode).toBe(201);
        otherPartnerProductUuid = res2.body.uuid;
      });

      it("should successfully soft delete a product for the owner", async () => {
        // --- ACT ---
        // O parceiro 1 deleta seu próprio produto.
        const result = await request(app)
          .patch(`/ecommerce/product/${productToDeleteUuid}/delete`)
          .set('Authorization', `Bearer ${partner1_admin_token}`);

        // --- ASSERT 1: Resposta da API ---
        expect(result.statusCode).toBe(204); // Ou 204 No Content, que também é comum para delete
        expect(result.body).toEqual({}); // Corpo vazio para 204

        const findPartner1Products = await request(app)
          .get(`/ecommerce/business/products`) // Assumindo que a rota não precisa do ID, pois ele vem do token
          .set('Authorization', `Bearer ${partner1_admin_token}`);
        const deletedProduct = findPartner1Products.body.find((p: any) => p.uuid === productToDeleteUuid);
        expect(deletedProduct).toBeUndefined()

        // --- ASSERT 2: Verificação do Estado Final ---
        // Buscamos o produto novamente para verificar seu estado no banco.
        // Usamos um endpoint de gerenciamento que busca produtos deletados.
        // Esta é a única forma de verificar os campos de auditoria sem um endpoint específico.
        const productFromDb = await prismaClient.products.findUnique({
          where: { uuid: productToDeleteUuid },
        });

        expect(productFromDb).toBeDefined();
        // O produto agora deve estar inativo e com a data de deleção preenchida.
        expect(productFromDb.is_active).toBe(false);
        expect(productFromDb.deleted_at).not.toBeNull();
        expect(productFromDb.deleted_by_uuid).toBe(partner1_admin_uuid); // Valida a auditoria
      });

      it("should return a 404 error if trying to delete a product that does not exist", async () => {
        const nonExistentUuid = new Uuid().uuid;
        const result = await request(app)
          .patch(`/ecommerce/product/${nonExistentUuid}/delete`)
          .set('Authorization', `Bearer ${partner1_admin_token}`);

        expect(result.statusCode).toBe(404);
        expect(result.body.error).toBe("Produto não encontrado.");
      });

      it("should return a 403 Forbidden error if trying to delete another partner's product", async () => {
        // O parceiro 1 tenta deletar o produto que pertence ao parceiro 2.
        const result = await request(app)
          .patch(`/ecommerce/product/${otherPartnerProductUuid}/delete`)
          .set('Authorization', `Bearer ${partner1_admin_token}`);

        expect(result.statusCode).toBe(403);
        expect(result.body.error).toBe("A empresa não tem permissão para deletar este produto.");
      });

      it("should not return a soft-deleted product in the public listing", async () => {
        // ACT: Buscamos a lista pública de produtos do parceiro 1.
        const result = await request(app).get(`/ecommerce/business/${partner1_info_uuid}/products`);

        expect(result.statusCode).toBe(200);

        // ASSERT: O produto que acabamos de deletar NÃO deve estar na lista.
        const foundDeletedProduct = result.body.find((p: any) => p.uuid === productToDeleteUuid);
        expect(foundDeletedProduct).toBeUndefined();
      });
    });

  })
  describe("E2E Update Product", () => {
    let productToUpdateUuid: string;
    let otherPartnerProductUuid: string;

    // No setup, criamos produtos para dois parceiros diferentes
    // para validar a lógica de permissão.
    beforeAll(async () => {
      // 1. Criar um produto para o partner1, que será atualizado no teste.
      const productInput1 = {
        name: "Produto Original",
        description: "Descrição Original.",
        original_price: 100.00, discount: 10, stock: 50,
        category_uuid: category1_uuid, brand: "Marca Original", is_active: true
      };
      const res1 = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner1_admin_token}`).send(productInput1);
      expect(res1.statusCode).toBe(201);
      productToUpdateUuid = res1.body.uuid;

      // 2. Criar um produto para o partner2, para o teste de segurança.
      const productInput2 = {
        name: "Produto de Outro Parceiro",
        original_price: 25.00, discount: 0, stock: 5,
        category_uuid: category1_uuid, brand: "Outra Marca", is_active: true
      };
      const res2 = await request(app).post('/ecommerce/product').set('Authorization', `Bearer ${partner2_admin_token}`).send(productInput2);
      expect(res2.statusCode).toBe(201);
      otherPartnerProductUuid = res2.body.uuid;
    });

    it("should successfully update a product and create a history record", async () => {
      // --- ARRANGE ---
      const updatePayload = {
        name: "Produto com Nome Atualizado",
        stock: 45,
        original_price: 110.00, // Preço também mudou
        discount: 15,
      };

      // --- ACT ---
      // O parceiro 1 atualiza seu próprio produto.
      const result = await request(app)
        .put(`/ecommerce/product/${productToUpdateUuid}`)
        .set('Authorization', `Bearer ${partner1_admin_token}`)
        .send(updatePayload);
      console.log('result.body');
      console.log(result.body);
      // --- ASSERT 1: Resposta da API ---
      expect(result.statusCode).toBe(200);
      expect(result.body.name).toBe("Produto com Nome Atualizado");
      expect(result.body.stock).toBe(45);
      expect(result.body.original_price).toBe(110.00);
      expect(result.body.discount).toBe(15);

      // --- ASSERT 2: Verificação da Rastreabilidade no Banco de Dados ---
      const historyRecords = await prismaClient.productHistory.findMany({
        where: { product_uuid: productToUpdateUuid },
        orderBy: { changed_at: 'desc' }
      });

      // Esperamos 4 registros de histórico (name, stock, original_price, discount)
      expect(historyRecords.length).toBe(4);

      // Verificamos o conteúdo de um dos registros de histórico
      const nameChangeRecord = historyRecords.find(r => r.field_changed === 'name');
      expect(nameChangeRecord).toBeDefined();
      expect(nameChangeRecord.old_value).toBe("Produto Original");
      expect(nameChangeRecord.new_value).toBe("Produto com Nome Atualizado");
      expect(nameChangeRecord.changed_by_uuid).toBe(partner1_admin_uuid);
    });

    it("should return a 404 error if trying to update a product that does not exist", async () => {
      const nonExistentUuid = new Uuid().uuid;
      const result = await request(app)
        .put(`/ecommerce/product/${nonExistentUuid}`)
        .set('Authorization', `Bearer ${partner1_admin_token}`)
        .send({ data: { name: "Novo Nome" } });

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toBe("Produto não encontrado.");
    });

    it("should return a 403 Forbidden error if trying to update another partner's product", async () => {
      // O parceiro 1 tenta atualizar o produto que pertence ao parceiro 2.
      const result = await request(app)
        .put(`/ecommerce/product/${otherPartnerProductUuid}`)
        .set('Authorization', `Bearer ${partner1_admin_token}`)
        .send({ data: { name: "Nome Invasor" } });

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toBe("Acesso negado.");
    });
  });

})
