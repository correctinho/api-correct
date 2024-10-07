import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo'
import { InputCreateUserAddressDTO } from '../dto/create-app-user-address.dto'
import { CreateAppUserAddressUsecase } from '../create-app-user-address.usecase'

const AddressMockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    createAddress: jest.fn()
  }
}

const UserInfoMockRepository = () => {
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
}

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
describe("Create App User Address usecase", () => {

  it("Should throw an error if user cannot be found", async () => {
    const addressRepository = AddressMockRepository()
    const userinfoRepository = UserInfoMockRepository()
    const userAuthRepository = AppUserAuthMockRepository()

    const input: InputCreateUserAddressDTO = {
      line1: "Rua teste",
      line2: "41B",
      line3: "",
      postal_code: "02457-458",
      neighborhood: "Bairro Teste",
      city: "Cidade teste",
      state: "Estado teste",
      country: "País",
      user_uuid: new Uuid("3c17d070-d708-4eb3-a981-f5fb69182c74")
    }
    const usecase = new CreateAppUserAddressUsecase(addressRepository, userinfoRepository, userAuthRepository)
    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.message).toBe("User not found")
      expect(err.statusCode).toBe(401)

    }


  })
  it("Should throw an error if user info is not found", async () => {
    const addressRepository = AddressMockRepository()
    const userinfoRepository = UserInfoMockRepository()
    const userAuthRepository = AppUserAuthMockRepository()

    userAuthRepository.find.mockResolvedValueOnce({})

    const input: InputCreateUserAddressDTO = {
      line1: "Rua teste",
      line2: "41B",
      line3: "",
      postal_code: "02457-458",
      neighborhood: "Bairro Teste",
      city: "Cidade teste",
      state: "Estado teste",
      country: "País",
      user_uuid: new Uuid("3c17d070-d708-4eb3-a981-f5fb69182c74")
    }

    const usecase = new CreateAppUserAddressUsecase(addressRepository, userinfoRepository, userAuthRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.message).toBe("User info must be completed first")
      expect(err.statusCode).toBe(404)

    }

  })
  it("Should create user address", async () => {
    const addressRepository = AddressMockRepository()
    const userinfoRepository = UserInfoMockRepository()
    const userAuthRepository = AppUserAuthMockRepository()

    const input: InputCreateUserAddressDTO = {
      line1: "Rua teste",
      line2: "41B",
      line3: "",
      postal_code: "02457-458",
      neighborhood: "Bairro Teste",
      city: "Cidade teste",
      state: "Estado teste",
      country: "País",
      user_uuid: new Uuid("3c17d070-d708-4eb3-a981-f5fb69182c74")
    }
    userAuthRepository.find.mockResolvedValueOnce({})

    userinfoRepository.findByDocumentUserInfo.mockResolvedValueOnce({})

    const usecase = new CreateAppUserAddressUsecase(addressRepository, userinfoRepository, userAuthRepository)

    const result = await usecase.execute(input)
    expect(result.line1).toEqual(input.line1)
    expect(result.line2).toEqual(input.line2)
    expect(result.line3).toEqual(input.line3)
    expect(result.postal_code).toEqual(input.postal_code)
    expect(result.neighborhood).toEqual(input.neighborhood)
    expect(result.city).toEqual(input.city)
    expect(result.state).toEqual(input.state)
    expect(result.country).toEqual(input.country)
    expect(result.user_uuid).toEqual(input.user_uuid.uuid)

  })
})
