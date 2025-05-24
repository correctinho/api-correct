import request from "supertest"
import { app } from "../../app"

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

let category1_uuid: string


describe("E2E Ecommerce tests", () => {
  beforeAll(async () => {
    //create correct admin
    const correctAdmin = await request(app).post('/admin').send(inputNewAdmin)
    expect(correctAdmin.statusCode).toBe(201)
    //authenticate correct admin
    const authAdmin = await request(app).post('/login').send(authenticateAdmin)
    expect(authAdmin.status).toBe(200)
    correctAdminToken = authAdmin.body.token

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
    describe("E2E Products", () => {

    })
  })
})
