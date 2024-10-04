import { randomUUID } from 'crypto'
import { FindAllUserItemsByEmployerUsecase } from '../find-all-by-employer.usecase'
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
      business_info_uuid: randomUUID()
    }
    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository)

    await expect(usecase.execute(input.user_info_uuid, input.business_info_uuid)).rejects.toThrow("User Info id is required")
  })

  it("Should throw an error if user item is not found", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
      business_info_uuid: randomUUID()
    }
    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository)

    await expect(usecase.execute(input.user_info_uuid, input.business_info_uuid)).rejects.toThrow("User not found")
  })

  it("Should throw an error if user is not an employee", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
      business_info_uuid: randomUUID()
    }

    appUserInfoMockRepository.find.mockResolvedValueOnce({
      business_info_uuids: [randomUUID(), randomUUID()]
    })

    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository)
    await expect(usecase.execute(input.user_info_uuid, input.business_info_uuid)).rejects.toThrow("Unauthorized access")
  })


  it("Should return an empty array", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
      business_info_uuid: randomUUID()
    };

    appUserInfoMockRepository.find.mockResolvedValueOnce({
      business_info_uuids: [randomUUID(), input.business_info_uuid]
    });

    appUserItemRepository.findAllUserItems.mockResolvedValueOnce([]);

    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository);

    const result = await usecase.execute(input.user_info_uuid, input.business_info_uuid);
    expect(result).toEqual([]);
  });

  it("Should return user items", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
      business_info_uuid: randomUUID()
    };

    appUserInfoMockRepository.find.mockResolvedValueOnce({
      business_info_uuids: [randomUUID(), input.business_info_uuid]
    });

    appUserItemRepository.findAllUserItems.mockResolvedValueOnce([
      {
        uuid: { uuid: randomUUID() }, // Ajuste aqui
        user_info_uuid: { uuid: input.user_info_uuid }, // Ajuste aqui
        item_uuid: { uuid: randomUUID() }, // Ajuste aqui
        business_info_uuid: { uuid: input.business_info_uuid }, // Ajuste aqui
        img_url: "http://example.com/item1.jpg",
        item_name: "Item 1",
        balance: 100,
        status: "active",
        created_at: new Date(),
        fantasy_name: "Provider 1"
      },
      {
        uuid: { uuid: randomUUID() }, // Ajuste aqui
        user_info_uuid: { uuid: input.user_info_uuid }, // Ajuste aqui
        item_uuid: { uuid: randomUUID() }, // Ajuste aqui
        business_info_uuid: { uuid: input.business_info_uuid }, // Ajuste aqui
        img_url: "http://example.com/item2.jpg",
        item_name: "Item 2",
        balance: 200,
        status: "inactive",
        created_at: new Date(),
        fantasy_name: "Provider 2"
      }
    ]);

    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository);

    const result = await usecase.execute(input.user_info_uuid, input.business_info_uuid);
    expect(result.length).toBe(2);
  });
})
