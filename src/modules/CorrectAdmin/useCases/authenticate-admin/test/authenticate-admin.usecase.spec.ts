import { AuthenticateAdminUseCase } from '../authenticate-admin.usecase';


const AdminMockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        findByUserName: jest.fn(),
        findByUserNameAuth: jest.fn()
    };
};

const PasswordCryptoMockRepository = () => {
    return {
        hash: jest.fn(),
        compare: jest.fn()
    }
}

const TokenMockRepository = () => {
    return {
        create: jest.fn(),
        validate: jest.fn()
    }
}

describe("Unity Test Authenticate admin", () => {

    it("Should throw an error if username is missing", async () => {
        const adminMockRepository = AdminMockRepository();
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        const userName = '';
        const password = 'password';

        const authUsecase = new AuthenticateAdminUseCase(adminMockRepository, passwordRepository, tokenRepository);

        await expect(authUsecase.execute({ userName, password })).rejects.toThrow("Username/password is incorrect");
    });

    it("Should throw an error if password is missing", async () => {
        const adminMockRepository = AdminMockRepository();
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        const userName = 'username';
        const password = '';

        const authUsecase = new AuthenticateAdminUseCase(adminMockRepository, passwordRepository, tokenRepository);

        await expect(authUsecase.execute({ userName, password })).rejects.toThrow("Username/password is incorrect");
    });

    it("Should throw an error if password is wrong", async () => {
        const adminMockRepository = AdminMockRepository();
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        const userName = 'correct_admin';
        const password = 'wrong_password';

        // Configure the mock repository to return a valid admin
        const admin = {
            uuid: 'some-uuid',
            name: 'Correct Admin',
            email: 'admin@admin.com',
            userName: 'correct_admin',
            password: 'hashed_password',
            isAdmin: true
        };
        adminMockRepository.findByUserNameAuth.mockResolvedValue(admin);

        // Configure the password repository to return false for incorrect password
        passwordRepository.compare.mockResolvedValue(false);

        const authUsecase = new AuthenticateAdminUseCase(adminMockRepository, passwordRepository, tokenRepository);

        await expect(authUsecase.execute({ userName, password })).rejects.toThrow("Username/password is incorrect");
    });

    it("Should authenticate admin with correct credentials", async () => {
        const adminMockRepository = AdminMockRepository();
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        const userName = 'correct_admin';
        const password = 'admin123';

        // Configure the mock repository to return a valid admin
        const admin = {
            uuid: 'some-uuid',
            name: 'Correct Admin',
            email: 'admin@admin.com',
            userName: 'correct_admin',
            password: 'hashed_password',
            isAdmin: true
        };
        adminMockRepository.findByUserNameAuth.mockResolvedValue(admin);

        // Configure the password repository to return true for correct password
        passwordRepository.compare.mockResolvedValue(true);

        // Configure the token repository to return a mock token
        tokenRepository.create.mockResolvedValue('mock_token');

        const authUsecase = new AuthenticateAdminUseCase(adminMockRepository, passwordRepository, tokenRepository);

        const result = await authUsecase.execute({ userName, password });

        expect(result).toHaveProperty('token');
        // expect(result.token).toBe('mock_token');
    });
});
