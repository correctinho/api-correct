import { CreateCorrectAdminUseCase } from '../create-correct-admin.usecase';
import { InputCreateAdminDTO } from '../../../correct-dto/correct.dto';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';

const input: InputCreateAdminDTO = {
    email: 'admin@admin.com',
    name: 'Correct Admin',
    userName: 'correct_admin',
    password: 'admin123',
    isAdmin: false
};

const MockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        findByUserName: jest.fn(),
        findByUserNameAuth: jest.fn()
    };
};

describe("Unity Test Create Correct Admin Usecase", () => {
    it("Should be able to create a new Admin", async () => {
        const adminMockRepository = MockRepository();
        const createAdminUseCase = new CreateCorrectAdminUseCase(adminMockRepository);

        const output = await createAdminUseCase.execute(input);

        expect(output).toEqual({
            uuid: expect.any(Uuid),
            name: input.name,
            email: input.email,
            userName: input.userName,
            isAdmin: input.isAdmin
        });
    });

    it("Should not be able to create a new Admin if userName already exists", async () => {
        const adminMockRepository = MockRepository();
        adminMockRepository.findByUserName.mockResolvedValueOnce({
            // Simulando um admin existente com o mesmo userName
            uuid: 'existing-uuid',
            name: 'Existing Admin',
            email: 'existing@admin.com',
            userName: 'correct_admin',
            password: 'existing123',
            isAdmin: true
        });

        const createAdminUseCase = new CreateCorrectAdminUseCase(adminMockRepository);

        await expect(createAdminUseCase.execute(input)).rejects.toThrow("UserName already exists");

        const input2: InputCreateAdminDTO = {
            email: 'admin@correct.com',
            name: 'New Correct Admin',
            userName: 'correct_admin',
            password: 'admin123',
            isAdmin: false
        };

        // O mock deve retornar um valor indicando que o userName já existe
        adminMockRepository.findByUserName.mockResolvedValueOnce({
            uuid: 'existing-uuid',
            name: 'Existing Admin',
            email: 'existing@admin.com',
            userName: 'correct_admin',
            password: 'existing123',
            isAdmin: true
        });

        await expect(createAdminUseCase.execute(input2)).rejects.toThrow("UserName already exists");
    });
});