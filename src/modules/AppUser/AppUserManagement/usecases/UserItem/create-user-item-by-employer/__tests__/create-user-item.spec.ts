import { randomUUID } from 'crypto'
import { CreateAppUserItemByEmployerUsecase } from '../create-user-item-by-employer.usecase'
import { UserItemStatus } from '@prisma/client';
import { newDateF } from '../../../../../../../utils/date';
import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo';
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

const EmployerItemDetailsMockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findByItemUuidAndBusinessInfo: jest.fn(),
    findAllEmployerItems: jest.fn()
  };
};

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

describe("Unity Tests Crate User Item", () => {
  it("Should throw an error if status is cancelled", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const employerItemRepositoy = EmployerItemDetailsMockRepository()
    const appUserInfoRepository = AppUserInfoMockRepository()

    const input = {
      user_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
      balance: 1,
      status: 'cancelled' as UserItemStatus,
      business_info_uuid: randomUUID()
    }

    const usecase = new CreateAppUserItemByEmployerUsecase(
      appUserItemRepository,
      appUserInfoRepository,
      employerItemRepositoy
    )

    await expect(usecase.execute(input)).rejects.toThrow("Invalid status")
  })
  it("Should throw an error if app user is not found", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const employerItemRepositoy = EmployerItemDetailsMockRepository()
    const appUserInfoRepository = AppUserInfoMockRepository()

    const input = {
      user_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
      balance: 1,
      status: 'active' as UserItemStatus,
      business_info_uuid: randomUUID()
    }

    const usecase = new CreateAppUserItemByEmployerUsecase(
      appUserItemRepository,
      appUserInfoRepository,
      employerItemRepositoy
    )

    await expect(usecase.execute(input)).rejects.toThrow("App User not found")
  })

  it("Should throw an error if business info uuid does not match", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const employerItemRepositoy = EmployerItemDetailsMockRepository()
    const appUserInfoRepository = AppUserInfoMockRepository()

    appUserInfoRepository.find.mockResolvedValueOnce({
      business_info_uuid: new Uuid(randomUUID())
    })

    const input = {
      user_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
      balance: 1,
      status: 'active' as UserItemStatus,
      business_info_uuid: randomUUID()
    }

    const usecase = new CreateAppUserItemByEmployerUsecase(
      appUserItemRepository,
      appUserInfoRepository,
      employerItemRepositoy
    )

    await expect(usecase.execute(input)).rejects.toThrow("Unauthorized access")
  })

  it("Should throw an error if employer does not have current item", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const employerItemRepositoy = EmployerItemDetailsMockRepository()
    const appUserInfoRepository = AppUserInfoMockRepository()


    const input = {
      user_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
      balance: 1,
      status: 'active' as UserItemStatus,
      business_info_uuid: randomUUID()
    }
    appUserInfoRepository.find.mockResolvedValueOnce({
      business_info_uuid: new Uuid(input.business_info_uuid)
    })

    const usecase = new CreateAppUserItemByEmployerUsecase(
      appUserItemRepository,
      appUserInfoRepository,
      employerItemRepositoy
    )

    await expect(usecase.execute(input)).rejects.toThrow("This item is not available for current business")
  })

  it("Should throw an error if user already has this item", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const employerItemRepositoy = EmployerItemDetailsMockRepository()
    const appUserInfoRepository = AppUserInfoMockRepository()


    appUserItemRepository.findByItemUuidAndUserInfo.mockResolvedValueOnce({})
    const input = {
      user_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
      balance: 1,
      status: 'active' as UserItemStatus,
      business_info_uuid: randomUUID()
    }
    appUserInfoRepository.find.mockResolvedValueOnce({
      business_info_uuid: new Uuid(input.business_info_uuid)
    })
    employerItemRepositoy.findByItemUuidAndBusinessInfo.mockResolvedValueOnce({
      uuid: randomUUID(),
      item_uuid: input.item_uuid,
      business_info_uuid: input.business_info_uuid,
      cycle_start_day: 2,
      cycle_end_day: 1,
      created_at: newDateF(new Date()),
      updated_at: newDateF(new Date()),
      Item: {
        uuid: input.item_uuid,
        name: "Item name",
        item_type: "any type",
        item_category: "any_category",
        parent_uuid: null,
        busines_info_uuid: null
      }
    })


    const usecase = new CreateAppUserItemByEmployerUsecase(
      appUserItemRepository,
      appUserInfoRepository,
      employerItemRepositoy
    )

    await expect(usecase.execute(input)).rejects.toThrow("User already has this item")
  })

  it("Should return app user item", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const employerItemRepositoy = EmployerItemDetailsMockRepository()
    const appUserInfoRepository = AppUserInfoMockRepository()

    const input = {
      user_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
      balance: 1,
      status: 'active' as UserItemStatus,
      business_info_uuid: randomUUID()
    }
    employerItemRepositoy.findByItemUuidAndBusinessInfo.mockResolvedValueOnce({
      uuid: randomUUID(),
      item_uuid: input.item_uuid,
      business_info_uuid: input.business_info_uuid,
      cycle_start_day: 2,
      cycle_end_day: 1,
      created_at: newDateF(new Date()),
      updated_at: newDateF(new Date()),
      Item: {
        uuid: input.item_uuid,
        name: "Item name",
        item_type: "any type",
        item_category: "any_category",
        parent_uuid: null,
        busines_info_uuid: null
      }
    })

    appUserInfoRepository.find.mockResolvedValueOnce({
      business_info_uuid: new Uuid(input.business_info_uuid)
    })
    const usecase = new CreateAppUserItemByEmployerUsecase(
      appUserItemRepository,
      appUserInfoRepository,
      employerItemRepositoy
    )
    const result = await usecase.execute(input)
    expect(result).toHaveProperty('uuid')
    expect(result.user_info_uuid).toEqual(input.user_info_uuid)
    expect(result.item_uuid).toEqual(input.item_uuid)
    expect(result.item_name).toEqual('Item name')
    expect(result.balance).toEqual(input.balance)
    expect(result.status).toEqual(input.status)
    expect(result.business_info_uuid).toEqual(input.business_info_uuid)
    expect(result.created_at).toBeTruthy()

  })
})
