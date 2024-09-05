import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo';
import { CreateAppUserInfoUsecase } from '../create-user-info.usecase'
import { InputCreateUserInfoDTO } from '../dto/create-user-info.dto';

const AppUserInfoMockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        saveOrUpdateByCSV: jest.fn(),
        findByDocumentUserInfo: jest.fn(),
        save: jest.fn(),
        findByDocument2UserInfo: jest.fn(),
        findManyByBusiness: jest.fn(),
        createUserInfoandUpdateUserAuthByCSV: jest.fn()

    };
};

const AppUserAuthMockRepository = () => {
    return {
        create: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn(),
        findByDocument: jest.fn(),
        findByEmail: jest.fn()
    };
};


describe("Unity test Create UserInfo usecase", () => {

    it("Should throw an error if user info already exists", async () => {
        const appUserAuthMockRepository = AppUserAuthMockRepository();
        const appUserInfoMockRepository = AppUserInfoMockRepository();

        const findAuthUser = {
            uuid: new Uuid("8ecfc6ca-b943-4c50-afd2-f86c32542b8c"),
            user_info_uuid: new Uuid("8ecfc6ca-b943-4c50-afd2-f86c32542b8c"),
            document: '588.225.170-24',
            password: 'password123',
            email: 'email@email.com',
            is_active: true,
            created_at: '2024-05-04',
            updated_at: ''
        };

        const findBydocument = {
            uuid: new Uuid("8ecfc6ca-b943-4c50-afd2-f86c32542b8c"),
            business_info_uuid: null,
            address_uuid: null,
            document: '588.225.170-24',
            document2: null,
            document3: null,
            full_name: "User Full Name",
            display_name: null,
            internal_company_code: null,
            gender: null,
            date_of_birth: '1990-05-02',
            salary: null,
            phone: null,
            email: "email@email.com",
            company_owner: false,
            status: 'pending',
            function: null,
            recommendation_code: null,
            is_authenticated: false,
            marital_status: null,
            dependents_quantity: 1,
            user_document_validation_uuid: null,
            user_id: null
        };

        appUserAuthMockRepository.find.mockResolvedValueOnce(findAuthUser);
        appUserInfoMockRepository.findByDocumentUserInfo.mockResolvedValueOnce(findBydocument);

        const usecase = new CreateAppUserInfoUsecase(appUserInfoMockRepository, appUserAuthMockRepository);

        const input: InputCreateUserInfoDTO = {
            business_info_uuid: null,
            address_uuid: null,
            document: '588.225.170-24',
            document2: null,
            document3: null,
            full_name: "User Full Name",
            display_name: null,
            internal_company_code: null,
            gender: null,
            date_of_birth: '1990-05-02',
            salary: null,
            phone: null,
            email: "email@email.com",
            company_owner: false,
            status: 'pending',
            function: null,
            recommendation_code: null,
            is_authenticated: false,
            marital_status: null,
            dependents_quantity: 1,
            user_document_validation_uuid: null,
            user_id: null
        };

        try {
            await usecase.execute(input);
        } catch (error) {
            expect(error.message).toBe("User Info already registered - 1");
            expect(error.statusCode).toBe(409);
        }
    });

    it("Should create user info", async () => {
        const appUserAuthMockRepository = AppUserAuthMockRepository();
        const appUserInfoMockRepository = AppUserInfoMockRepository();

        const findAuthUser = {
            uuid: new Uuid("8ecfc6ca-b943-4c50-afd2-f86c32542b8c"),
            user_info_uuid: null,
            document: '588.225.170-24',
            password: 'password123',
            email: 'email@email.com',
            is_active: true,
            created_at: '2024-05-04',
            updated_at: ''
        };



        appUserAuthMockRepository.find.mockResolvedValueOnce(findAuthUser);

        const usecase = new CreateAppUserInfoUsecase(appUserInfoMockRepository, appUserAuthMockRepository);

        const input: InputCreateUserInfoDTO = {
            business_info_uuid: null,
            address_uuid: null,
            document: '588.225.170-24',
            document2: null,
            document3: null,
            full_name: "User Full Name",
            display_name: null,
            internal_company_code: null,
            gender: 'M',
            date_of_birth: '1990-05-02',
            salary: null,
            phone: null,
            email: "email@email.com",
            company_owner: false,
            status: 'pending',
            function: null,
            recommendation_code: null,
            is_authenticated: false,
            marital_status: null,
            dependents_quantity: 1,
            user_document_validation_uuid: null,
            user_id: null
        };

        await usecase.execute(input)

        expect(appUserInfoMockRepository.create).toHaveBeenCalled();

    });
})
