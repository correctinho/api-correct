import { randomUUID } from 'crypto'
import { BlockOrCanceluserItemByEmployerUsecase }from '../block-or-cancel-user-item-by-employer.usecase'
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

const BenefitMockRepository = () => {
  return {
    create: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findByName: jest.fn(),
    findWithBranches: jest.fn(),
    createCustomBenefit: jest.fn(),
    findByBusiness: jest.fn()
  };
};

describe("Unity tests Block or Cancel user item by employer", () => {
  it("Should throw an error if user info id is missing", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    const input: any = {
      user_item_uuid: '',
      status: 'cancelled'
    }

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    await expect(usecase.execute(input)).rejects.toThrow("User item uuid is required")
  })
  it("Should throw an error if status input is active", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'active'
    }

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    await expect(usecase.execute(input)).rejects.toThrow("Invalid status")
  })

  it("Should throw an error if user is not found", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'cancelled'
    }

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    await expect(usecase.execute(input)).rejects.toThrow("User Item not found")
  })

  it("Should throw an error if user item is already cancelled", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    appUserItemRepository.find.mockResolvedValueOnce({
      status: 'cancelled'
    })

    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'cancelled'
    }

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    await expect(usecase.execute(input)).rejects.toThrow("User item already cancelled")
  })

  it("Should throw an error if user item is already to be cancelled", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    appUserItemRepository.find.mockResolvedValueOnce({
      status: 'to_be_cancelled'
    })

    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'cancelled'
    }

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    await expect(usecase.execute(input)).rejects.toThrow("User item already cancelled")
  })

  it("Should throw an error if user item is not found", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    appUserItemRepository.find.mockResolvedValueOnce({
      status: 'active',
      item_uuid: { uuid: randomUUID()}
    })

    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'cancelled'
    }

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    await expect(usecase.execute(input)).rejects.toThrow("Item not found")
  })

  it("Should return blocked user item", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    const itemUuid = randomUUID()


    benefitMockRepository.find.mockResolvedValueOnce({})

    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'blocked',
    }
    appUserItemRepository.find.mockResolvedValueOnce({
      uuid: { uuid: input.user_item_uuid},
      status: 'active',
      item_uuid: { uuid: itemUuid},
      user_info_uuid: randomUUID(),
      balance: 0
    })
    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    const result = await usecase.execute(input)
    expect(result.uuid).toBe(input.user_item_uuid)
    expect(result.status).toBe('blocked')
    expect(result.blocked_at).toBeTruthy()
  })

  it("Should return cancelled user item", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    const itemUuid = randomUUID()



    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'cancelled',
    }
    appUserItemRepository.find.mockResolvedValueOnce({
      uuid: { uuid: input.user_item_uuid},
      status: 'active',
      item_uuid: { uuid: itemUuid},
      user_info_uuid: randomUUID(),
      balance: 0
    })

    benefitMockRepository.find.mockResolvedValueOnce({
      item_category:"pre_pago"
    })
    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    const result = await usecase.execute(input)
    expect(result.uuid).toBe(input.user_item_uuid)
    expect(result.status).toBe('cancelled')
    expect(result.cancelled_at).toBeTruthy()
  })

  it("Should return to be cancelled user item", async () => {
    const appUserItemRepository = AppUserItemMockRepository()
    const benefitMockRepository = BenefitMockRepository()

    const itemUuid = randomUUID()


    const input: any = {
      user_item_uuid: randomUUID(),
      status: 'cancelled',
    }
    appUserItemRepository.find.mockResolvedValueOnce({
      uuid: { uuid: input.user_item_uuid},
      status: 'active',
      item_uuid: { uuid: itemUuid},
      user_info_uuid: randomUUID(),
      balance: 0
    })

    benefitMockRepository.find.mockResolvedValueOnce({
      uuid: { uuid: itemUuid},
      item_category: 'pos_pago'
    })
    const usecase = new BlockOrCanceluserItemByEmployerUsecase(appUserItemRepository, benefitMockRepository)

    const result = await usecase.execute(input)
    expect(result.uuid).toBe(input.user_item_uuid)
    expect(result.status).toBe('to_be_cancelled')
    expect(result.cancelling_request_at).toBeTruthy()
    expect(result.cancelling_request_at).toBeTruthy()
    expect(result.grace_period_end_date).toBeTruthy()


  })
})
