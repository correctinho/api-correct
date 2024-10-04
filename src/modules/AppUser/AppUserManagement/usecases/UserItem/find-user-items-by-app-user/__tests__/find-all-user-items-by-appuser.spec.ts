import { randomUUID } from 'crypto'
import { FindAllUserItemsByAppUserUsecase } from '../find-user-items-by-app-user.usecase'
import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo';

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
describe("Unity tests Find All User Item by Employer", () => {
  it("Should throw an error if user info uuid is missing", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: '',
    }
    const usecase = new FindAllUserItemsByAppUserUsecase(appUserItemRepository, appUserInfoMockRepository)

    await expect(usecase.execute(input.user_info_uuid)).rejects.toThrow("User Info id is required")
  })

  it("Should throw an error if user is not found", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
    }
    const usecase = new FindAllUserItemsByAppUserUsecase(appUserItemRepository, appUserInfoMockRepository)

    await expect(usecase.execute(input.user_info_uuid)).rejects.toThrow("User not found")
  })


  it("Should return an empty array", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
        user_info_uuid: randomUUID(),

    };

    appUserInfoMockRepository.find.mockResolvedValueOnce({});

    appUserItemRepository.findAllUserItems.mockResolvedValueOnce([]);

    const usecase = new FindAllUserItemsByAppUserUsecase(appUserItemRepository, appUserInfoMockRepository);

    const result = await usecase.execute(input.user_info_uuid);
    expect(result).toEqual([]);
});

it("Should return user items", async () => {
  const appUserItemRepository = AppUserItemMockRepository();
  const appUserInfoMockRepository = AppUserInfoMockRepository();

  const input: any = {
    user_info_uuid: randomUUID(),
  };

  // Ajuste a estrutura do objeto retornado pelo mock para corresponder à estrutura esperada
  appUserInfoMockRepository.find.mockResolvedValueOnce({
    business_info_uuids: [randomUUID()] // Supondo que seja um array de UUIDs
  });

  appUserItemRepository.findAllUserItems.mockResolvedValueOnce([
    {
      uuid: new Uuid(randomUUID()),
      user_info_uuid: new Uuid(input.user_info_uuid),
      item_uuid: new Uuid(randomUUID()),
      business_info_uuid: new Uuid(randomUUID()), // Certifique-se de que isso seja um Uuid
      item_name: "Item 1",
      balance: 100,
      status: "active",
      created_at: new Date(),
      fantasy_name: "Company A"
    },
    {
      uuid: new Uuid(randomUUID()),
      user_info_uuid: new Uuid(input.user_info_uuid),
      item_uuid: new Uuid(randomUUID()),
      business_info_uuid: new Uuid(randomUUID()), // Certifique-se de que isso seja um Uuid
      item_name: "Item 2",
      balance: 200,
      status: "inactive",
      created_at: new Date(),
      fantasy_name: "Company B"
    }
  ]);

  const usecase = new FindAllUserItemsByAppUserUsecase(appUserItemRepository, appUserInfoMockRepository);
  const result = await usecase.execute(input.user_info_uuid);

  expect(result.length).toBe(2);
});
})
