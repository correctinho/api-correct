import { FindUserItemByIdUsecase } from '../find-user-item-by-id.usecase'
import { randomUUID } from 'crypto'

const AppUserItemMockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findByItemUuidAndUserInfo: jest.fn(),
    findAllUserItems: jest.fn()
  }
}
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
describe("Unity tests Find User Item by id", () => {
  it("Should throw an error if id is missing", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_item_uuid: ''
    }
    const usecase = new FindUserItemByIdUsecase(appUserItemRepository, appUserInfoMockRepository)

    await expect(usecase.execute(input.user_item_uuid)).rejects.toThrow("User Item id is required")
  })

  it("Should throw an error if user item is not found", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_item_uuid: randomUUID()
    }
    const usecase = new FindUserItemByIdUsecase(appUserItemRepository, appUserInfoMockRepository)

    await expect(usecase.execute(input.user_item_uuid)).rejects.toThrow("User Item not found")
  })

  it("Should return user item", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_item_uuid: randomUUID()
    }
    appUserItemRepository.find.mockResolvedValueOnce({
      uuid: input.user_item_uuid,
      user_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
    })
    const usecase = new FindUserItemByIdUsecase(appUserItemRepository, appUserInfoMockRepository)

    const result = await  usecase.execute(input.user_item_uuid)
    expect(result).toHaveProperty('uuid')
  })
})
