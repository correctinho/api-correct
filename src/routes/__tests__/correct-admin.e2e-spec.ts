import request from "supertest"
import { app } from "../../app"

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

describe("E2E Correct admin test", () => {

    it("Should create a new admin", async () => {
        const result = await request(app).post('/admin').send(inputNewAdmin)
        expect(result.statusCode).toBe(201)
    })

    it("Should authenticate admin", async () => {
        const result = await request(app).post('/login').send(authenticateAdmin)

        expect(result.status).toBe(200)

    })
})
