import { GetUserInfoByUserUsecase } from '../get-user-info-by-user.usecase'

const AppUserInfoMockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    saveOrUpdateByCSV: jest.fn(),
    findByDocumentUserInfo: jest.fn(),
    findByDocument2UserInfo: jest.fn(),
    findManyByBusiness: jest.fn(),
    createUserInfoandUpdateUserAuthByCSV: jest.fn(),
    createOrUpdateUserInfoByEmployer: jest.fn()
};
};

const BusinessInfoMockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        findByDocument: jest.fn(),
        findById: jest.fn(),
        findByEmail: jest.fn(),
        deleteById: jest.fn()
    }
}

describe("Unity test get user info by user usecase", () => {
    it("Should return user with null business info uuid", async () => {
        const appUserInfoRepository = AppUserInfoMockRepository();
        const businessInfoRepository = BusinessInfoMockRepository();

        const input = {
            document: '123.456.789-05'
        };

        // Simular que o usuário não é encontrado
        appUserInfoRepository.findByDocumentUserInfo.mockResolvedValueOnce(null);

        const usecase = new GetUserInfoByUserUsecase(appUserInfoRepository, businessInfoRepository);

        await expect(usecase.execute(input.document)).rejects.toThrow("User info not found");
    });
});
