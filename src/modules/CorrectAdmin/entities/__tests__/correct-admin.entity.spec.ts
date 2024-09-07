import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo'
import { CorrectAdminEntity, ICorrectAdmin } from '../correct-admin.entity'


const validInput: ICorrectAdmin = {
    name: 'Correct Admin',
    email: 'admin@admin.com',
    userName: 'correct_admin',
    password: 'admin123',
    isAdmin: true
}
describe("Unity test Correct Admin Entity ", () => {
    

    it("Should throw an error if userName is empty", async () => {
        const input = {...validInput, userName: ''}
        
        expect(() => {
            new CorrectAdminEntity(input)
        }).toThrow("Username is required!")
    })

    it("Should throw an error if password is empty", async () => {
        const input = {...validInput, password: ""}

        expect(() => {
            new CorrectAdminEntity(input)
        }).toThrow("Password is required!")
    })

    it("Should throw and error if email is empty", async () => {
        const input = {...validInput, email: ""}

        expect(() => {
           new CorrectAdminEntity(input)
        }).toThrow("Email is required!")
    })

    it("Should create an admin", async () => {
        const admin = await CorrectAdminEntity.create(validInput)
        // expect(admin).toHaveProperty('uuid');
        expect(admin.uuid).toBeInstanceOf(Uuid)
        
    })
})

