import request from "supertest"
import { app } from "../../app"

let correctAdminToken: string
let correctSellerToken: string
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
describe("E2E Create Admin/user tests", () => {

  describe("E2E Correct admin test", () => {

    it("Should create a new admin", async () => {
      const result = await request(app).post('/admin').send(inputNewAdmin)
      expect(result.statusCode).toBe(201)
    })

    it("Should authenticate admin", async () => {
      const result = await request(app).post('/login').send(authenticateAdmin)
      expect(result.status).toBe(200)
      correctAdminToken = result.body.token

    })

  })
  describe("E2E Correct seller test", () => {
    it("Should create a correct seller", async () => {
      const inputCorrectSeller = {
        name: "Seller Correct",
        email: "sellercorrect@correct.com.br",
        userName: "seller-correct",
        password: "123"
      }
      const result = await request(app).post('/seller').set('Authorization', `Bearer ${correctAdminToken}`).send(inputCorrectSeller)
      expect(result.statusCode).toBe(201)
      expect(result.body.isAdmin).toBeFalsy()


      const authSellerInput = {
        userName: 'seller-correct',
        password: '123'
      }
      //authenticate seller
      const authSeller = await request(app).post('/login').send(authSellerInput)
      expect(authSeller.statusCode).toBe(200)
      correctSellerToken = authSeller.body.token


    })

    it("Should throw and error if user is not admin", async () => {
      const inputCorrectSeller = {
        name: "Seller Correct2",
        email: "sellercorrect2@correct.com.br",
        userName: "seller-correct2",
        password: "123"
      }
      const result = await request(app).post('/seller').set('Authorization', `Bearer ${correctSellerToken}`).send(inputCorrectSeller)
      expect(result.statusCode).toBe(401)

    })
  })
})

describe("E2E Correct admin account", () => {
  describe("Get Correct Admin account", () => {
    it("Should get correct admin account", async () => {
      const result = await request(app).get('/admin/account').set('Authorization', `Bearer ${correctAdminToken}`)
      expect(result.statusCode).toBe(200)
      expect(result.body).toHaveProperty("uuid")
      expect(result.body).toHaveProperty("balance")
      expect(result.body).toHaveProperty("status")
      expect(result.body).toHaveProperty("created_at")
      expect(result.body).toHaveProperty("updated_at")
    })

    it("Should throw an error if user is not admin", async () => {
      const result = await request(app).get('/admin/account').set('Authorization', `Bearer ${correctSellerToken}`)
      expect(result.statusCode).toBe(401)
    })
  })
})
