import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo';
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
    findByDocument2UserInfo: jest.fn(),
    findManyByBusiness: jest.fn(),
    createUserInfoandUpdateUserAuthByCSV: jest.fn(),
    createOrUpdateUserInfoByEmployer: jest.fn()
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
    const appUserItemRepository = AppUserItemMockRepository();
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_item_uuid: randomUUID()
    };

    appUserItemRepository.find.mockResolvedValueOnce({
      uuid: new Uuid(input.user_item_uuid),
      user_info_uuid: new Uuid(randomUUID()),
      item_uuid: new Uuid(randomUUID()),
      business_info_uuid: new Uuid(randomUUID()), // Certifique-se de que isso seja um Uuid
      img_url: null,
      item_name: "Item 1",
      balance: 100,
      status: "active",
      blocked_at: null,
      cancelled_at: null,
      cancelling_request_at: null,
      block_reason: null,
      cancel_reason: null,
      grace_period_end_date: null,
      created_at: new Date(),
      updated_at: new Date(),
      fantasy_name: "Company A"
    });

    const usecase = new FindUserItemByIdUsecase(appUserItemRepository, appUserInfoMockRepository);

    const result = await usecase.execute(input.user_item_uuid);
    expect(result).toHaveProperty('uuid');
    expect(result).toHaveProperty('user_info_uuid');
    expect(result).toHaveProperty('item_uuid');
  });
})
