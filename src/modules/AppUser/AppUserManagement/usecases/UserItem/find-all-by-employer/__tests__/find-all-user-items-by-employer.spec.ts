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
      save: jest.fn(),
      findByDocument2UserInfo: jest.fn(),
      findManyByBusiness: jest.fn(),
      createUserInfoandUpdateUserAuthByCSV: jest.fn()

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

  it("Should throw an error if business info uuid is null", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
      business_info_uuid: randomUUID()
    }

    appUserInfoMockRepository.find.mockResolvedValueOnce({
      business_info_uuid: null
    })

    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository)

    await expect(usecase.execute(input.user_info_uuid, input.business_info_uuid)).rejects.toThrow("Unauthorized access")
  })

  it("Should throw an error if business info uuid does not match", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
      business_info_uuid: randomUUID()
    }

    appUserInfoMockRepository.find.mockResolvedValueOnce({
      business_info_uuid: randomUUID()
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
      business_info_uuid: { uuid: input.business_info_uuid } // Certifique-se de que a estrutura corresponda
  });

    appUserItemRepository.findAllUserItems.mockResolvedValueOnce([]);

    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository);

    const result = await usecase.execute(input.user_info_uuid, input.business_info_uuid);
    expect(result).toEqual([]);
});

  it("Should return user items", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const appUserInfoMockRepository = AppUserInfoMockRepository();

    const input: any = {
      user_info_uuid: randomUUID(),
      business_info_uuid: randomUUID()
    }

    appUserInfoMockRepository.find.mockResolvedValueOnce({
      business_info_uuid: { uuid: input.business_info_uuid } // Certifique-se de que a estrutura corresponda
  });

  appUserItemRepository.findAllUserItems.mockResolvedValueOnce([
    {
        uuid: randomUUID(),
        user_info_uuid: input.user_info_uuid,
        item_uuid: randomUUID(),
        item_name: "Item 1",
        balance: 100,
        status: "active",
        created_at: new Date()
    },
    {
        uuid: randomUUID(),
        user_info_uuid: input.user_info_uuid,
        item_uuid: randomUUID(),
        item_name: "Item 2",
        balance: 200,
        status: "inactive",
        created_at: new Date()
    }
]);

    const usecase = new FindAllUserItemsByEmployerUsecase(appUserItemRepository, appUserInfoMockRepository)

    const result = await usecase.execute(input.user_info_uuid, input.business_info_uuid)
    expect(result.length).toBe(2)
  })
})
