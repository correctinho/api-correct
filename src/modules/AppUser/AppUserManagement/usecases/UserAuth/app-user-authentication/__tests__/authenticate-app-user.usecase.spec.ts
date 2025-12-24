import { AuthenticateAppuserUsecase } from '../authenticate-app-user.usecase'

const AppUserMockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        findByDocument: jest.fn(),
        findByEmail: jest.fn()
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

describe("Unity test Authenticate app user usecase", () => {
    it("Should throw and error if document is missing", async () => {
        const appUserMockRepository = AppUserMockRepository()
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        const document = ''
        const password = 'password'

        const authUsecase = new AuthenticateAppuserUsecase(appUserMockRepository, passwordRepository, tokenRepository)
        
        await expect(authUsecase.execute({ document, password})).rejects.toThrow("CPF ou senha incorretos")
    })

    it("Should throw and error if password is missing", async () => {
        const appUserMockRepository = AppUserMockRepository()
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        const document = 'document'
        const password = ''

        const authUsecase = new AuthenticateAppuserUsecase(appUserMockRepository, passwordRepository, tokenRepository)
        
        await expect(authUsecase.execute({ document, password})).rejects.toThrow("CPF ou senha incorretos")
    })

    

    it("Should throw and error if document is does not exist in DB", async () => {
        const appUserMockRepository = AppUserMockRepository()
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        const document = '11234644053'
        const password = 'password'

        const authUsecase = new AuthenticateAppuserUsecase(appUserMockRepository, passwordRepository, tokenRepository)
        
        await expect(authUsecase.execute({ document, password})).rejects.toThrow("CPF ou senha incorretos")
    })

    it("Should throw and error if password is incorrect", async () => {
        const appUserMockRepository = AppUserMockRepository()
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        appUserMockRepository.findByDocument.mockResolvedValueOnce({
            uuid: 'any-id',
            document: '11234644053',
            email: 'email@email.com',
            password: "correct-password"
        })
        const document = '11234644053'
        const password = 'wrong-password'

        passwordRepository.compare.mockResolvedValue(false);


        const authUsecase = new AuthenticateAppuserUsecase(appUserMockRepository, passwordRepository, tokenRepository)
        
        await expect(authUsecase.execute({ document, password})).rejects.toThrow("CPF ou senha incorretos")
    })

    it("Should login user", async () => {
        const appUserMockRepository = AppUserMockRepository()
        const passwordRepository = PasswordCryptoMockRepository();
        const tokenRepository = TokenMockRepository();

        appUserMockRepository.findByDocument.mockResolvedValueOnce({
            uuid: 'any-id',
            document: '11234644053',
            email: 'email@email.com',
            password: "correct-password"
        })
        const document = '11234644053'
        const password = 'correct-password'

        passwordRepository.compare.mockResolvedValue(true);

        tokenRepository.create.mockResolvedValue('mock_token');

        const authUsecase = new AuthenticateAppuserUsecase(appUserMockRepository, passwordRepository, tokenRepository)
        
        const output = await authUsecase.execute({ document, password})
        expect(output).toHaveProperty('token')
    })
})