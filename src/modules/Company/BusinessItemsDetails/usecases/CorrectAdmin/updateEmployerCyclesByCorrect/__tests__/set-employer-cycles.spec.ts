import { SetEmployerCycleUsecase } from '../set-employer-cycles.usecase'
import { randomUUID } from 'crypto'

const MockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findByItemUuidAndBusinessInfo: jest.fn(),
    findAllEmployerItems: jest.fn()
  };
};

const foundItemDetails = {
  uuid: randomUUID(),
  item_uuid: randomUUID(),
  business_info_uuid: randomUUID(),
  cycle_start_day: '',
  cycle_end_day: ''
}
describe("Unity Test Set Employer Cycles Usecase", () => {
  it("Should throw an error if item is not", async () => {
    const itemDetailsRepository = MockRepository()
    const input = {
      business_info_uuid: '',
      item_uuid: randomUUID(),
      cycle_end_day: 0

    }
    const usecase = new SetEmployerCycleUsecase(itemDetailsRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.message).toBe("Business Id is required")
      expect(err.statusCode).toBe(400)
    }

  })
  it("Should throw an error if item id missing", async () => {
    const itemDetailsRepository = MockRepository()
    const input = {
      business_info_uuid: randomUUID(),
      item_uuid: '',
      cycle_end_day: 0

    }
    const usecase = new SetEmployerCycleUsecase(itemDetailsRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.message).toBe("Item Id is required")
      expect(err.statusCode).toBe(400)
    }

  })
  it("Should throw an error if cycle end day is missing", async () => {
    const itemDetailsRepository = MockRepository()
    const input = {
      business_info_uuid: randomUUID(),
      item_uuid: randomUUID(),
      cycle_end_day: 0

    }

    const usecase = new SetEmployerCycleUsecase(itemDetailsRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.message).toBe("Cycle end day is required")
      expect(err.statusCode).toBe(400)
    }
  })

  it("Should update cycle end day and start day", async () => {
    const itemDetailsRepository = MockRepository()
    const input = {
      business_info_uuid: foundItemDetails.business_info_uuid,
      item_uuid: foundItemDetails.item_uuid,
      cycle_end_day: 1

    }
    itemDetailsRepository.findByItemUuidAndBusinessInfo.mockResolvedValueOnce(foundItemDetails)

    const usecase = new SetEmployerCycleUsecase(itemDetailsRepository)


    const result = await usecase.execute(input)
    expect(result.business_info_uuid).toBe(input.business_info_uuid)
    expect(result.item_uuid).toBe(input.item_uuid)
    expect(result.cycle_end_day).toBe(input.cycle_end_day)
    expect(result.cycle_start_day).toBe(input.cycle_end_day + 1)

  })
})
